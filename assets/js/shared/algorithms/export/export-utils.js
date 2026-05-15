/**
 * Shared export utilities for tools
 * 
 * Eliminates duplication of PNG/SVG export logic across tools.
 * 
 * @module export-utils
 */

export const ExportUtils = {
    /**
     * Export canvas as PNG with timestamped filename
     */
    exportCanvasPNG(canvas, toolName, options = {}) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = options.filename || `${toolName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        return filename;
    },
    
    /**
     * Export SVG content with proper headers
     */
    exportSVG(svgContent, toolName, options = {}) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = options.filename || `${toolName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.svg`;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        return filename;
    },

    /**
     * Trigger a browser download for a Blob.
     * Architectural exception: shared download utility uses minimal DOM
     * (parallels exportCanvasPNG and exportSVG above).
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        return filename;
    },
    
    /**
     * Generate standard SVG header
     */
    buildSVGHeader(width, height, backgroundColor = '#000000') {
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    },
    
    buildSVGFooter() {
        return '</svg>';
    }
};
