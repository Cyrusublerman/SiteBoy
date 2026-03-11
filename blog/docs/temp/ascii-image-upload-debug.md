# ASCII Art Generator - Image Upload Debug Guide

## Issue
Image upload not triggering processing.

## Debug Steps

### 1. Enable TOOLS Logging
Open browser console and run:
```javascript
debugToggle('TOOLS', true)
```

### 2. Try Uploading an Image
After enabling logging, try uploading an image. You should see:
- `onUpdate triggered: key="imageFile", value type=...`
- `Image file detected, type: File, size: ...`
- `loadImage called with file: ...`
- `FileReader loaded successfully`
- `Image loaded: WIDTHxHEIGHTpx`

### 3. Expected Behavior
When image is uploaded:
1. FileInput component calls `onChange`
2. ToolBase `_handleChange` is called
3. ToolBase `onUpdate` is called with key="imageFile"
4. ASCII tool's `onUpdate` handler checks for imageFile
5. `loadImage` is called
6. Image is processed and displayed

### 4. Common Issues

#### Issue: No logs at all
**Problem:** TOOLS logging not enabled  
**Solution:** Run `debugToggle('TOOLS', true)` in console

#### Issue: "onUpdate triggered" but value is undefined
**Problem:** FileInput not passing file correctly  
**Solution:** Check FileInput component implementation

#### Issue: "loadImage called" but "FileReader loaded" never appears
**Problem:** FileReader failing  
**Solution:** Check browser console for errors

#### Issue: "Image loaded" appears but nothing displays
**Problem:** Processing or drawing failing  
**Solution:** Enable all logging: `debugToggle('ALL', true)`

### 5. Quick Test
Paste in console to test file handling:
```javascript
// Get the file input element
const fileInput = document.querySelector('input[type="file"]');
if (fileInput) {
    console.log('✅ File input found');
    console.log('Accept:', fileInput.accept);
    console.log('Has change listener:', fileInput.onchange !== null);
} else {
    console.error('❌ File input not found');
}
```

### 6. Manual Trigger Test
If file input exists but doesn't work:
```javascript
// Manually trigger file selection
const fileInput = document.querySelector('input[type="file"]');
fileInput.click();
// Then select a file and check console for logs
```

## Recent Changes
- Added comprehensive debug logging to onUpdate
- Added logging to loadImage function
- Added file info logging when imageFile is detected

## Files Modified
- `assets/js/tools/processors/ascii-art-generator.js`
  - Added debug logs in onUpdate (line ~200)
  - Added debug logs in loadImage (line ~560)
  - Added file detection logs (line ~233)

