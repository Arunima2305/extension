chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getHighlightedText") {
      const selectedText = window.getSelection().toString().trim();
      sendResponse({ text: selectedText });
    }
  });
  