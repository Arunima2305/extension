// Summarize Button Logic
document.getElementById('summarizeBtn').addEventListener('click', async () => {
    const highlightedTextArea = document.getElementById('highlightedText');
    const summaryOutput = document.getElementById('summary');
    const highlightedText = highlightedTextArea.value.trim();
    const summaryType = document.getElementById('summaryType').value;
  
    if (!highlightedText) {
      summaryOutput.innerText = "Please highlight text and click 'Summarize'.";
      return;
    }
  
    try {
      // Summarizer options
      const options = {
        sharedContext: 'Summarizing user-highlighted text',
        type: summaryType, // Use selected type from dropdown
        format: 'markdown',
        length: summaryType === 'detailed' ? 'long' : 'medium',
      };
  
      console.log("Selected Summary Type:", summaryType);
  
      const capabilities = (await self.ai.summarizer.capabilities()).available;
      let summarizer;
  
      if (capabilities === 'no') {
        summaryOutput.innerText = "Summarizer API not supported.";
        console.log("Summarizer API not supported on this browser.");
        return;
      }
  
      if (capabilities === 'readily') {
        summarizer = await self.ai.summarizer.create(options);
      } else if (capabilities === 'after-download') {
        summarizer = await self.ai.summarizer.create(options);
  
        summarizer.addEventListener('downloadprogress', (e) => {
          summaryOutput.innerText = `Downloading model: ${((e.loaded / e.total) * 100).toFixed(2)}%`;
          console.log(`Model download progress: ${e.loaded} of ${e.total} bytes.`);
        });
        await summarizer.ready;
        console.log("Summarizer model download completed.");
      }
  
      const summary = await summarizer.summarize(highlightedText, {
        context: 'Summarizing user-highlighted content for simplicity.',
      });
  
      summaryOutput.innerText = `Summary:\n${summary}`;
      console.log("Summary generated:", summary);
    } catch (error) {
      console.error("Error summarizing text:", error);
      summaryOutput.innerText = "An error occurred while summarizing.";
    }
  });
  
  // Fetch Highlighted Text Logic
  document.getElementById('fetchTextBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Dynamically inject content.js if not already present
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ['content.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Error injecting content script:", chrome.runtime.lastError.message);
              document.getElementById('highlightedText').value = "Error injecting content script.";
              return;
            }
  
            // Send message to content.js to fetch highlighted text
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getHighlightedText' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                document.getElementById('highlightedText').value = "Error fetching highlighted text.";
                return;
              }
  
              const highlightedText = response?.text || "No text highlighted!";
              document.getElementById('highlightedText').value = highlightedText;
              console.log("Highlighted text fetched:", highlightedText);
            });
          }
        );
      } else {
        console.error("No active tab found.");
        document.getElementById('highlightedText').value = "No active tab found.";
      }
    });
  });
  
  // Theme Toggle Logic
  document.getElementById('themeToggle').addEventListener('change', (event) => {
    const isDarkMode = event.target.checked;
    document.body.style.backgroundColor = isDarkMode ? '#2c2c2c' : '#ffffff';
    document.body.style.color = isDarkMode ? '#ffffff' : '#000000';
    console.log("Theme toggled to:", isDarkMode ? "Dark Mode" : "Light Mode");
  });
  
  // Export Summary Button Logic
  document.getElementById('exportSummaryBtn').addEventListener('click', () => {
    const summaryOutput = document.getElementById('summary').innerText;
  
    if (!summaryOutput || summaryOutput === "An error occurred while summarizing.") {
      alert("No summary available to export.");
      return;
    }
  
    const blob = new Blob([summaryOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    console.log("Summary exported successfully.");
  });
  