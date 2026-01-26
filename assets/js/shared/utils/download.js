/**
 * Download Utilities
 * 
 * Helper functions for triggering file downloads in the browser.
 * Creates temporary DOM elements to initiate downloads.
 * 
 * @module utils/download
 */

/**
 * Download Blob as file
 * 
 * Creates a temporary download link and triggers it.
 * Automatically revokes object URL after download.
 * 
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 * 
 * @example
 * const blob = await canvasToBlob(canvas);
 * downloadBlob(blob, 'output.png');
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    window.debugLog('TOOLS', `Download triggered: ${filename}`);
}

/**
 * Download Data URL as file
 * 
 * Creates a temporary download link for a data URL.
 * Useful for canvas.toDataURL() exports.
 * 
 * @param {string} dataURL - Data URL string
 * @param {string} filename - Filename for download
 * 
 * @example
 * const dataURL = canvas.toDataURL('image/png');
 * downloadDataURL(dataURL, 'screenshot.png');
 */
export function downloadDataURL(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
    
    window.debugLog('TOOLS', `Download triggered: ${filename}`);
}

/**
 * Download text content as file
 * 
 * Creates a text file from string content.
 * 
 * @param {string} content - Text content
 * @param {string} filename - Filename for download
 * @param {string} [mimeType='text/plain'] - MIME type
 * 
 * @example
 * const json = JSON.stringify(data, null, 2);
 * downloadText(json, 'data.json', 'application/json');
 */
export function downloadText(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
}

/**
 * Download JSON data as file
 * 
 * Convenience function for JSON exports.
 * 
 * @param {Object} data - Data to export
 * @param {string} filename - Filename for download
 * @param {boolean} [pretty=true] - Pretty-print JSON
 * 
 * @example
 * const settings = { palette: ['#000000', '#FFFFFF'], dither: 'Floyd-Steinberg' };
 * downloadJSON(settings, 'settings.json');
 */
export function downloadJSON(data, filename, pretty = true) {
    const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    downloadText(json, filename, 'application/json');
}

/**
 * Download multiple files as ZIP
 * 
 * Note: Requires JSZip library to be loaded.
 * 
 * @param {Array<{name: string, blob: Blob}>} files - Array of file objects
 * @param {string} zipFilename - Name for ZIP file
 * @returns {Promise<void>}
 * 
 * @example
 * const files = [
 *     { name: 'image1.png', blob: blob1 },
 *     { name: 'image2.png', blob: blob2 }
 * ];
 * await downloadZIP(files, 'batch_export.zip');
 */
export async function downloadZIP(files, zipFilename) {
    if (typeof JSZip === 'undefined') {
        console.error('JSZip library not loaded');
        throw new Error('JSZip library required for ZIP downloads');
    }
    
    const zip = new JSZip();
    
    // Add all files to ZIP
    files.forEach(file => {
        zip.file(file.name, file.blob);
    });
    
    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download
    downloadBlob(zipBlob, zipFilename);
    
    window.debugLog('TOOLS', `ZIP download triggered: ${zipFilename} (${files.length} files)`);
}
