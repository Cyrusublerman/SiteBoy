/**
 * Defecated Script - Placeholder
 * TODO: Extract from defecated-tool.js
 */

export const SCRIPT_CONFIG = {
    id: 'defecated',
    title: 'Defecated',
    category: 'other',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Basic', params: [
            { key: 'param', type: 'slider', label: 'Parameter', min: 1, max: 100, step: 1, default: 50 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

