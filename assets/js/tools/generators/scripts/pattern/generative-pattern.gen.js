/**
 * Generative Pattern Script - Placeholder
 * TODO: Extract from generative-pattern.js
 */

export const SCRIPT_CONFIG = {
    id: 'generative-pattern',
    title: 'Generative Pattern',
    category: 'pattern',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Pattern', params: [
            { key: 'complexity', type: 'slider', label: 'Complexity', min: 1, max: 10, step: 1, default: 5 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

