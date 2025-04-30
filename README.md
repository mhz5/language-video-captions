# Chinese YouTube Caption Helper

A Chrome extension to help with Chinese language learning on YouTube.

## Features

- Capture Chinese captions from YouTube videos with a keyboard shortcut (Alt+Command+H on Mac)
- Take screenshots of caption text for more accurate extraction
- Process caption screenshots with OCR to extract Chinese text
- Translate captured captions automatically
- Display detailed information about each Chinese character:
  - Pinyin pronunciation
  - English translation
  - 3 common usage examples with pinyin and English translations
- Works with both standard YouTube captions and closed captions in the video
- Analyze captions when video is paused to get in-depth understanding
- Visual feedback showing the captured caption image alongside the extracted text

## Installation

### Developer Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select this directory
5. The extension should now be installed and visible in your Chrome toolbar

## Usage

1. Navigate to a YouTube video with Chinese captions
2. Enable captions in the YouTube player if they're not already enabled
3. Pause the video at a point where you want to analyze the captions
4. Press `Alt+Command+H` (Mac) to capture and analyze the captions
5. An overlay will appear showing detailed information about each Chinese character

## Future Enhancements

- Add ability to customize playback speed
- Add vocabulary saving functionality
- Support for saving captured captions and their translations
- Integration with external Chinese dictionary APIs
- Support for traditional Chinese characters
- Light/dark mode for the overlay
- Export functionality for study notes
- Add support for other video platforms and languages
- Improve OCR accuracy for text extraction from caption screenshots

## Limitations

- The current implementation includes a small sample dictionary. A more complete version would include a comprehensive Chinese character dictionary.
- The extension currently works best with simple, clear captions and might struggle with complex or ambiguous text.

## License

MIT