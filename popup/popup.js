// This popup script is minimal for now
// It could be expanded to include settings, history of captures, etc.

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on YouTube
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = tabs[0].url;
    const isYouTube = currentUrl.includes('youtube.com/watch');
    
    if (!isYouTube) {
      const instructions = document.querySelector('.instructions');
      instructions.innerHTML = '<p style="color: #e53935;">Please navigate to a YouTube video to use this extension.</p>';
    }
  });
});