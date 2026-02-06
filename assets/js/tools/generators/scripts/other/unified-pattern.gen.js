/**
 * Unified Pattern Script - Placeholder
 * TODO: Extract from unified-pattern.js
 */

export const SCRIPT_CONFIG = {
    id: 'unified-pattern',
    title: 'Unified Pattern',
    category: 'other',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Pattern', params: [
            { key: 'scale', type: 'slider', label: 'Scale', min: 1, max: 10, step: 0.1, default: 5 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

