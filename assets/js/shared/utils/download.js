/**
 * Download Utilities - SiteBoy Framework
 * 
 * Standard browser download patterns.
 * Used by tools and export components.
 * 
 * @version 1.0.0
 */

/**
 * Download a Blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Target filename
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Download from a data URL
 * @param {string} dataUrl - Data URL (e.g., canvas.toDataURL())
 * @param {string} filename - Target filename
 */
export function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

/**
 * Download text as a file
 * @param {string} content - Text content
 * @param {string} filename - Target filename
 * @param {string} [mimeType='text/plain'] - MIME type
 */
export function downloadText(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
}

/**
 * Download JSON object as a file
 * @param {object} data - Object to serialize
 * @param {string} filename - Target filename
 */
export function downloadJSON(data, filename) {
    downloadText(JSON.stringify(data, null, 2), filename, 'application/json');
}

// UMD export for non-module usage
if (typeof window !== 'undefined') {
    window.DownloadUtils = {
        downloadBlob,
        downloadDataUrl,
        downloadText,
        downloadJSON
    };
}

