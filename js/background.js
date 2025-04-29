// Listen for the keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === "capture-captions") {
    // Send message to the content script in the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "captureCaptions" });
    });
  }
});