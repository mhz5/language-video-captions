// Simple OCR implementation for Chrome extension
// No web workers, no eval, just basic image processing

function convertToGrayscale(imageDataUrl) {
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
      
      // Convert to grayscale with high contrast
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale with weighted RGB
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply contrast adjustment (increase difference between text and background)
        const threshold = 128;
        const factor = 2.0; // Higher contrast factor for better text/background separation
        let newValue = factor * (gray - threshold) + threshold;
        
        // Apply thresholding for even better contrast
        if (newValue > 145) {
          newValue = 255; // White
        } else {
          newValue = 0;   // Black
        }
        
        // Apply the new value
        data[i] = newValue;     // R
        data[i + 1] = newValue; // G
        data[i + 2] = newValue; // B
      }
      
      // Put the modified data back
      ctx.putImageData(imgData, 0, 0);
      
      // Return the processed image
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for grayscale conversion'));
    };
    
    img.src = imageDataUrl;
  });
}

// Simple OCR - doesn't actually perform character recognition
// but prepares the image and simulates the process
function performSimpleOCR(imageDataUrl) {
  return new Promise(async (resolve) => {
    try {
      // Process the image
      const processedImage = await convertToGrayscale(imageDataUrl);
      
      // In a real implementation, a server-side API would be used for OCR
      // For now, just return a placeholder
      
      // Simulate a network request delay
      setTimeout(() => {
        resolve({
          text: "这是示例中文文本。这不是真正的 OCR 结果，而是一个占位符。",
          confidence: 0.85,
          success: true,
          processedImage: processedImage // Return the processed image for display
        });
      }, 1000);
    } catch (error) {
      console.error('Simple OCR Error:', error);
      resolve({
        text: "OCR processing error: " + error.message,
        success: false,
        error: error.message
      });
    }
  });
}

window.SimpleOCR = {
  performOCR: performSimpleOCR,
  convertToGrayscale
};