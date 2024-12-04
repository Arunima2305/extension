// Fetch highlighted text
document.getElementById('fetchTextBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, files: ['content.js'] },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getHighlightedText' }, (response) => {
            document.getElementById('inputText').value = response?.text || "No text highlighted!";
          });
        }
      );
    });
  });
  
  // Summarize text
  document.getElementById('summarizeBtn').addEventListener('click', async () => {
    const text = document.getElementById('inputText').value.trim();
    const style = document.getElementById('summaryStyle').value;
    const output = document.getElementById('output');
  
    if (!text) {
      output.innerText = "No text to summarize!";
      return;
    }
  
    try {
      const capabilities = await self.ai.summarizer.capabilities();
  
      if (capabilities.available === 'no') {
        output.innerText = "Summarizer API is not available.";
        return;
      }
  
      const summarizer = await self.ai.summarizer.create({
        systemPrompt: `Summarize the text in a ${style} manner.`,
      });
  
      const summary = await summarizer.summarize(text);
      summarizer.destroy();
      output.innerText = `Summary (${style}):\n${summary}`;
    } catch (err) {
      console.error("Summarization Error:", err);
      output.innerText = "Error during summarization. Please try again.";
    }
  });
  
  // Translate text
  document.getElementById('translateBtn').addEventListener('click', async () => {
    const text = document.getElementById('inputText').value.trim();
    const targetLang = document.getElementById('targetLanguage').value;
    const output = document.getElementById('output');
  
    if (!text) {
      output.innerText = "No text to translate!";
      return;
    }
  
    try {
      const canTranslate = await self.translation.canTranslate({
        sourceLanguage: 'en',
        targetLanguage: targetLang,
      });
  
      if (canTranslate === 'no') {
        output.innerText = "This language pair is not supported.";
        return;
      }
  
      const translator = await self.translation.createTranslator({
        sourceLanguage: 'en',
        targetLanguage: targetLang,
      });
  
      translator.ondownloadprogress = (e) => {
        output.innerText = `Downloading language pack: ${((e.loaded / e.total) * 100).toFixed(2)}%`;
      };
  
      const translation = await translator.translate(text);
      output.innerText = `Translation (${targetLang}):\n${translation}`;
    } catch (err) {
      console.error("Translation Error:", err);
      output.innerText = "Error during translation. Please try again.";
    }
  });
  
  // Apply custom prompt
  document.getElementById('rewriteBtn').addEventListener('click', async () => {
    const text = document.getElementById('inputText').value.trim();
    const prompt = document.getElementById('customPrompt').value.trim();
    const output = document.getElementById('output');
  
    if (!text || !prompt) {
      output.innerText = "Provide both text and a prompt!";
      return;
    }
  
    try {
      const session = await chrome.aiOriginTrial.languageModel.create({
        systemPrompt: `You are a helpful assistant.`,
      });
      const result = await session.prompt(`${prompt}: ${text}`);
      session.destroy();
      output.innerText = `Result:\n${result}`;
    } catch (err) {
      console.error("Prompt Error:", err);
      output.innerText = "Error applying prompt. Please try again.";
    }
  });
  