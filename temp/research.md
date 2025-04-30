# Screenshot Capture Research for Chrome Extensions

## Chrome Extension APIs for Screenshot Capture

### 1. `chrome.tabs.captureVisibleTab`

This API captures what is visible in the tab as a screenshot.

**Usage:**
```javascript
chrome.tabs.captureVisibleTab([windowId], [options], callback)
```

**Parameters:**
- `windowId` (optional): The window to capture. Defaults to the current window.
- `options` (optional): Object with format and quality settings:
  - `format`: String - "jpeg" or "png" (default is "png")
  - `quality`: Integer - Quality of the image (0-100, only for jpeg)
- `callback`: Function that receives the data URL of the screenshot as a parameter

**Limitations:**
- Only captures what's visible in the viewport (scrollable content beyond the viewport isn't captured)
- Requires the "activeTab" permission
- Cannot capture specific elements, only the entire visible tab

**Example:**
```javascript
chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataUrl) {
  // dataUrl contains the image data as a base64-encoded string
});
```

### 2. Canvas-Based Element Capture

For capturing specific DOM elements, use a combination of:
- `html2canvas` library or manual canvas drawing 
- CSS positioning to identify the element's location

**Steps:**
1. Get the coordinates of the target element (captions)
2. Use `chrome.tabs.captureVisibleTab` to get the full screenshot
3. Draw the screenshot into a canvas element
4. Crop the canvas to the coordinates of the target element
5. Extract the cropped image data

**Example using Canvas API:**
```javascript
function captureElement(element) {
  // Get element position and dimensions
  const rect = element.getBoundingClientRect();
  
  // Capture the entire visible tab
  chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataUrl) {
    // Create image from the screenshot
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = function() {
      // Create a canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match the element
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Draw only the element portion to the canvas
      context.drawImage(
        img, 
        rect.left, rect.top, rect.width, rect.height, // Source coordinates
        0, 0, rect.width, rect.height                // Destination coordinates
      );
      
      // Get the data URL from the canvas
      const croppedDataUrl = canvas.toDataURL('image/png');
      
      // Now process the cropped image for OCR
      processImageForOCR(croppedDataUrl);
    };
  });
}
```

## Processing Screenshots for Text Extraction

### OCR (Optical Character Recognition) Options

1. **Tesseract.js** - Client-side OCR library:
   ```javascript
   const { createWorker } = Tesseract;
   
   async function extractTextFromImage(imageDataUrl) {
     const worker = await createWorker();
     await worker.loadLanguage('chi_sim'); // Load simplified Chinese
     await worker.initialize('chi_sim');
     const { data } = await worker.recognize(imageDataUrl);
     await worker.terminate();
     return data.text;
   }
   ```

2. **Cloud OCR Services** - For better accuracy:
   - Google Cloud Vision API
   - Microsoft Azure Computer Vision
   - Amazon Rekognition

3. **Custom Image Processing** - For higher contrast captions:
   ```javascript
   function preprocessImageForOCR(canvas) {
     const ctx = canvas.getContext('2d');
     const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
     const data = imgData.data;
     
     // Increase contrast of caption text
     for (let i = 0; i < data.length; i += 4) {
       // Convert to grayscale
       const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
       
       // Apply threshold to create high contrast
       const threshold = 128;
       const newValue = avg > threshold ? 255 : 0;
       
       data[i] = newValue;     // R
       data[i + 1] = newValue; // G
       data[i + 2] = newValue; // B
     }
     
     ctx.putImageData(imgData, 0, 0);
     return canvas;
   }
   ```

## Implementation Approaches

### 1. Direct Caption Element Approach
The most reliable method:

```javascript
function captureCaptions() {
  // Find caption element
  const captionElement = document.querySelector('.ytp-caption-segment');
  if (!captionElement) {
    console.error('No captions found');
    return;
  }
  
  // Get rect and position
  const rect = captionElement.getBoundingClientRect();
  
  // Capture visible tab
  chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = function() {
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Draw only the caption area
      ctx.drawImage(
        img,
        rect.left, rect.top, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      
      // Get the data URL for the cropped caption
      const captionDataUrl = canvas.toDataURL('image/png');
      
      // Process image with OCR
      processWithOCR(captionDataUrl);
    };
  });
}
```

### 2. MutationObserver Approach
For monitoring when captions appear:

```javascript
function setupCaptionObserver() {
  // Observer configuration
  const config = { childList: true, subtree: true };
  
  // Create observer to look for caption elements
  const observer = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Look for added caption elements
        const captionElements = document.querySelectorAll('.ytp-caption-segment');
        if (captionElements.length > 0) {
          // Captions found, can trigger screenshot capture
          console.log('Captions detected in the video');
        }
      }
    }
  });
  
  // Start observing
  observer.observe(document.body, config);
}
```

## Required Permissions

For the screenshot functionality, the manifest needs:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "*://*.youtube.com/*"
  ]
}
```

## Best Practices

1. Always check if the element is visible in the viewport before attempting to capture
2. Consider the performance impact - OCR operations can be CPU-intensive
3. Implement error handling for cases where captions aren't found
4. Cache processed results to avoid repeated processing
5. Use a worker thread for OCR to avoid blocking the UI