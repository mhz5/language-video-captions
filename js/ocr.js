// OCR helper using Tesseract.js for Chinese character recognition

// Import Tesseract.js
// Note: In a Chrome extension, you'll need to import this in your HTML file
// <script src="path/to/node_modules/tesseract.js/dist/tesseract.min.js"></script>

// Simple function to get pixel data from an image
function getImageData(imageElement) {
  // Create a canvas and draw the image on it
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imageElement.width;
  canvas.height = imageElement.height;

  // Draw the image on the canvas
  ctx.drawImage(imageElement, 0, 0);

  // Get the pixel data
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Create a canvas from a screenshot data URL and crop it to a specific area
function cropScreenshot(dataUrl, x, y, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas to draw and crop the screenshot
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      // Draw only the cropped portion
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // Get the data URL of the cropped image
      const croppedDataUrl = canvas.toDataURL('image/png');
      resolve(croppedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

// Preprocess image to improve OCR accuracy for Chinese characters
function preprocessImageForOCR(imageDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Increase contrast for better text recognition
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with weighted RGB
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Apply contrast adjustment (increase difference between text and background)
        const threshold = 128;
        const factor = 1.5; // Contrast factor
        const newValue = factor * (gray - threshold) + threshold;

        // Clamp values
        const finalValue = Math.max(0, Math.min(255, newValue));

        // Apply the new value
        data[i] = finalValue;     // R
        data[i + 1] = finalValue; // G
        data[i + 2] = finalValue; // B
      }

      // Put the modified data back
      ctx.putImageData(imgData, 0, 0);

      // Return the processed image
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for preprocessing'));
    };

    img.src = imageDataUrl;
  });
}

// OCR function that uses our simple image processor instead of Tesseract
function performOCR(imageDataUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting OCR processing...');
      
      // Use our custom SimpleOCR implementation
      // This avoids CSP issues with unsafe-eval
      if (window.SimpleOCR) {
        const result = await window.SimpleOCR.performOCR(imageDataUrl);
        console.log('OCR completed');
        
        // Return the recognized text
        resolve({
          text: result.text,
          confidence: result.confidence || 0.8,
          success: result.success,
          processedImage: result.processedImage
        });
      } else {
        // Fallback for testing
        console.warn('SimpleOCR not available, using fallback');
        setTimeout(() => {
          resolve({
            text: "这是一个示例中文文本，用于测试。这不是真正的OCR结果。",
            confidence: 0.7,
            success: true
          });
        }, 800);
      }
    } catch (error) {
      // Handle errors
      console.error('OCR Error:', error);
      resolve({
        text: "OCR processing error: " + error.message,
        success: false,
        error: error.message
      });
    }
  });
}

// Translation placeholder
// In a real implementation, you would use a translation API
function translateText(text, targetLanguage = 'en') {
  return new Promise((resolve) => {
    // Simulate translation delay
    setTimeout(() => {
      resolve({
        original: text,
        translated: "Translation placeholder - In a real implementation, this would be the translated text",
        language: targetLanguage,
        success: true
      });
    }, 300);
  });
}

// Initialize our OCR system
console.log('Initializing OCR system...');

// No Tesseract configuration needed - using our custom SimpleOCR implementation instead
// This avoids Content Security Policy issues

window.OCRHelper = {
  cropScreenshot,
  performOCR,
  translateText,
  preprocessImageForOCR
};