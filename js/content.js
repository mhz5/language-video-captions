// Dictionary of Chinese characters with pinyin, translation, and usage examples
// This would be more extensive in a real implementation
const chineseDict = {
  // Example entries
  '你': {
    pinyin: 'nǐ',
    translation: 'you',
    examples: [
      { chinese: '你好！', pinyin: 'Nǐ hǎo!', english: 'Hello!' },
      { chinese: '你是谁？', pinyin: 'Nǐ shì shéi?', english: 'Who are you?' },
      { chinese: '谢谢你的帮助。', pinyin: 'Xièxiè nǐ de bāngzhù.', english: 'Thank you for your help.' }
    ]
  },
  '好': {
    pinyin: 'hǎo',
    translation: 'good/well',
    examples: [
      { chinese: '你好！', pinyin: 'Nǐ hǎo!', english: 'Hello!' },
      { chinese: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', english: 'The weather is very good today.' },
      { chinese: '做得好！', pinyin: 'Zuò de hǎo!', english: 'Well done!' }
    ]
  }
  // More characters would be added in a real implementation
};

// Create overlay element once
let overlay = null;
let isOverlayVisible = false;

function createOverlay() {
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.id = 'chinese-caption-overlay';
  overlay.classList.add('caption-overlay');

  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.classList.add('overlay-close-button');
  closeButton.addEventListener('click', hideOverlay);

  // Content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('overlay-content');

  overlay.appendChild(closeButton);
  overlay.appendChild(contentContainer);

  document.body.appendChild(overlay);
}

function positionOverlay() {
  if (!overlay) return;

  // Find the video element
  const video = document.querySelector('video');
  if (!video) return;

  // Get video dimensions and position
  const videoRect = video.getBoundingClientRect();

  // YouTube's video player has controls at the bottom, so position the overlay on the right side
  // This avoids covering both the video and the controls
  overlay.style.right = '20px';
  overlay.style.bottom = '20px';

  // Make sure the overlay doesn't overlap with the video player
  // We want it to be visible alongside the video, not on top of it
  const playerElement = document.querySelector('#movie_player') || video.closest('.html5-video-player');
  if (playerElement) {
    const playerRect = playerElement.getBoundingClientRect();

    // Check if we're in the YouTube theater mode or default mode
    const isTheaterMode = document.querySelector('ytd-watch-flexy[theater]');

    if (isTheaterMode) {
      // In theater mode, position on right side of the page, not overlapping the video
      overlay.style.right = '20px';
      overlay.style.top = `${playerRect.top}px`;
      overlay.style.maxHeight = `${window.innerHeight * 0.5}px`;
    } else {
      // In default mode, position to the right of the video player
      overlay.style.top = `${playerRect.top}px`;
      overlay.style.maxHeight = `${window.innerHeight * 0.5}px`;
    }
  }
}

function showOverlay() {
  if (!overlay) createOverlay();
  positionOverlay();
  overlay.style.display = 'block';
  isOverlayVisible = true;
}

function hideOverlay() {
  if (overlay) {
    overlay.style.display = 'none';
    isOverlayVisible = false;
  }
}

function toggleOverlay() {
  if (isOverlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// Function to capture captions from the video using screenshot
function captureCaptions() {
  // Check if we're on YouTube
  if (!window.location.hostname.includes('youtube.com')) {
    console.error('Not on YouTube');
    return;
  }

  // Check if video is paused
  const video = document.querySelector('video');
  if (!video || !video.paused) {
    console.error('Video is not paused');
    alert('Please pause the video first before capturing captions.');
    return;
  }

  // Try to find caption container element to get its position
  // First, look for standard YouTube captions
  let captionElement = document.querySelector('.ytp-caption-segment');

  // If not found, look for captions in the player
  if (!captionElement) {
    captionElement = document.querySelector('.captions-text');
  }

  // If still not found, check for any other possible caption elements
  if (!captionElement) {
    captionElement = document.querySelector('.caption-window');
  }

  // If no captions found
  if (!captionElement) {
    console.error('No captions found');
    alert('No captions found. Please enable captions in the video.');
    return;
  }

  // Get the caption element's position and dimensions
  const rect = captionElement.getBoundingClientRect();

  // Get the text content of the captions as fallback
  const captionText = captionElement.textContent.trim();
  
  // Request screenshot from the extension
  chrome.runtime.sendMessage({ 
    action: "captureScreenshot" 
  }, function(response) {
    if (response && response.dataUrl) {
      // Create image from the screenshot
      const img = new Image();
      img.src = response.dataUrl;
      
      img.onload = function() {
        // Create a canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the caption element
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Draw only the caption area to the canvas
        ctx.drawImage(
          img,
          rect.left, rect.top, rect.width, rect.height, // Source coordinates (caption location)
          0, 0, rect.width, rect.height                 // Destination coordinates (start at 0,0 in canvas)
        );
        
        // Get the data URL for the cropped caption
        const captionDataUrl = canvas.toDataURL('image/png');
        
        // Store the screenshot for reference
        sessionStorage.setItem('lastCaptionScreenshot', captionDataUrl);
        
        // Process the image with OCR
        processWithOCR(captionDataUrl).then(ocrText => {
          // Use OCR text if available, otherwise fall back to DOM text
          const textToProcess = ocrText || captionText;
          processChineseText(textToProcess);
          
          // Display the captured image in the overlay for debugging
          const contentContainer = overlay.querySelector('.overlay-content');
          
          // Create a container for the image and OCR result
          const imageContainer = document.createElement('div');
          imageContainer.classList.add('debug-container');
          
          // Add the screenshot
          const capturedImg = document.createElement('img');
          capturedImg.src = captionDataUrl;
          capturedImg.style.maxWidth = '100%';
          capturedImg.style.marginBottom = '10px';
          
          // Add OCR result for debugging
          const ocrResultElem = document.createElement('div');
          ocrResultElem.classList.add('ocr-result');
          ocrResultElem.textContent = `OCR Result: ${ocrText || "None"}`;
          
          // Add to container
          imageContainer.appendChild(capturedImg);
          imageContainer.appendChild(ocrResultElem);
          
          // Add container to overlay
          contentContainer.insertBefore(imageContainer, contentContainer.firstChild);
        });
      };
    } else {
      // Fallback to text-only if screenshot fails
      processChineseText(captionText);
    }
  });
}

// Process text with OCR
async function processWithOCR(imageDataUrl) {
  try {
    // Use the OCR helper to perform OCR
    const ocrResult = await window.OCRHelper.performOCR(imageDataUrl);
    return ocrResult.text;
  } catch (error) {
    console.error('OCR processing failed:', error);
    return null;
  }
}

// Process Chinese text and display in overlay
function processChineseText(text, imageUrl = null, translationResult = null) {
  createOverlay();

  // Position overlay to avoid covering the video
  positionOverlay();

  const contentContainer = overlay.querySelector('.overlay-content');
  contentContainer.innerHTML = ''; // Clear previous content

  // Caption display section
  const captionSection = document.createElement('div');
  captionSection.classList.add('caption-section');
  
  // If we have a screenshot, display it
  if (imageUrl) {
    const capturedImg = document.createElement('img');
    capturedImg.src = imageUrl;
    capturedImg.style.maxWidth = '100%';
    capturedImg.style.marginBottom = '10px';
    captionSection.appendChild(capturedImg);
  }
  
  // Add the text content
  const textElement = document.createElement('div');
  textElement.textContent = text;
  captionSection.appendChild(textElement);
  
  // If we have a translation, display it
  if (translationResult && translationResult.translated) {
    const translationElement = document.createElement('div');
    translationElement.classList.add('translation-result');
    translationElement.textContent = translationResult.translated;
    translationElement.style.marginTop = '10px';
    translationElement.style.padding = '5px';
    translationElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    translationElement.style.borderRadius = '3px';
    translationElement.style.color = '#4CAF50';
    captionSection.appendChild(translationElement);
  }
  
  contentContainer.appendChild(captionSection);

  // Set position to relative for char-block positioning
  contentContainer.style.position = 'relative';

  // Character analysis section
  const analysisSection = document.createElement('div');
  analysisSection.classList.add('analysis-section');

  // Process each character
  for (const char of text) {
    // Skip spaces and punctuation
    if (/\\s|[，。！？：；（）、""'']/g.test(char)) continue;

    const charInfo = chineseDict[char] || {
      pinyin: '?',
      translation: 'Unknown',
      examples: []
    };

    const charBlock = document.createElement('div');
    charBlock.classList.add('char-block');

    // Character and basic info
    const charHeader = document.createElement('div');
    charHeader.classList.add('char-header');
    charHeader.innerHTML = `
      <span class="chinese-char">${char}</span>
      <span class="pinyin">${charInfo.pinyin}</span>
      <span class="translation">${charInfo.translation}</span>
    `;

    // Examples
    const examplesList = document.createElement('div');
    examplesList.classList.add('examples-list');

    if (charInfo.examples && charInfo.examples.length > 0) {
      charInfo.examples.forEach(example => {
        const exampleItem = document.createElement('div');
        exampleItem.classList.add('example-item');
        exampleItem.innerHTML = `
          <div class="example-chinese">${example.chinese}</div>
          <div class="example-pinyin">${example.pinyin}</div>
          <div class="example-english">${example.english}</div>
        `;
        examplesList.appendChild(exampleItem);
      });
    } else {
      const noExamples = document.createElement('div');
      noExamples.textContent = 'No examples available';
      examplesList.appendChild(noExamples);
    }

    charBlock.appendChild(charHeader);
    charBlock.appendChild(examplesList);
    analysisSection.appendChild(charBlock);
  }

  contentContainer.appendChild(analysisSection);
  showOverlay();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureCaptions") {
    captureCaptions();
  }
});

// Also listen for the keyboard shortcut directly in case extension commands don't work
document.addEventListener('keydown', (event) => {
  // Alt+Command+H (Mac)
  if (event.altKey && event.metaKey && event.key === 'h') {
    captureCaptions();
  }
  // Close overlay with Escape key
  else if (event.key === 'Escape' && isOverlayVisible) {
    hideOverlay();
  }
});

// Reposition overlay when window is resized
window.addEventListener('resize', () => {
  if (isOverlayVisible) {
    positionOverlay();
  }
});