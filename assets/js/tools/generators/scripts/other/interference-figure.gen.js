/**
 * Interference Figure Script - Placeholder
 * TODO: Extract from interference-figure.js
 */

export const SCRIPT_CONFIG = {
    id: 'interference-figure',
    title: 'Interference Figure',
    category: 'other',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Pattern', params: [
            { key: 'sources', type: 'slider', label: 'Sources', min: 2, max: 10, step: 1, default: 4 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

