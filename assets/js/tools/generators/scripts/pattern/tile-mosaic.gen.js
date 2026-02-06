/**
 * Tile Mosaic Script - Placeholder
 * TODO: Extract from tile-mosaic.js
 */

export const SCRIPT_CONFIG = {
    id: 'tile-mosaic',
    title: 'Tile Mosaic',
    category: 'pattern',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Tiles', params: [
            { key: 'tileSize', type: 'slider', label: 'Tile Size', min: 10, max: 100, step: 5, default: 40 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

