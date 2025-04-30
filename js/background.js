// Listen for the keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-captions") {
    // Send message to the content script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "captureCaptions" });
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle screenshot capture request
  if (request.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(
      null, 
      { format: "png", quality: 100 }, 
      function(dataUrl) {
        // Send the screenshot data URL back to the content script
        sendResponse({ dataUrl: dataUrl });
      }
    );
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});