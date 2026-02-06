/**
 * Circles Script - Nested rolling circles generator
 * 
 * Simple reference script demonstrating script config format.
 * Displays nested circles rolling inside each other with multiple visualization modes.
 * 
 * @script circles
 * @category other
 * @version 1.0.0
 */

import { TWO_PI } from '../../shared/evaluation.js';

// Circle state
let circles = [];
let largestRadius = 0;
let radiusDecrement = 0;

/**
 * Initialize circles array
 */
function initCircles(width, height, count) {
    circles = [];
    const canvasSize = Math.min(width, height);
    largestRadius = (canvasSize / 2) * 0.9;
    radiusDecrement = largestRadius / count;
    
    for (let i = 0; i < count; i++) {
        circles.push({
            radius: largestRadius - (i * radiusDecrement),
            parent: i === 0 ? null : i - 1
        });
    }
}

/**
 * Draw function
 */
function draw(ctx, canvas, params, frame) {
    const W = canvas.width;
    const H = canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;
    
    // Initialize if needed
    if (circles.length === 0 || circles.length !== params.circleCount) {
        initCircles(W, H, params.circleCount);
    }
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    // Calculate circle transforms
    const transforms = [];
    const cycleFrames = params.cycleFrames;
    
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        
        if (circle.parent === null) {
            // Root circle - stationary at center
            transforms[i] = { x: centerX, y: centerY, rotation: 0 };
        } else {
            // Child circle - orbits inside parent
            const parent = circles[circle.parent];
            const parentTransform = transforms[circle.parent];
            const orbitRadius = parent.radius - circle.radius;
            const orbitAngle = (frame / cycleFrames) * TWO_PI;
            const rollRotation = orbitAngle;
            
            transforms[i] = {
                x: parentTransform.x + orbitRadius * Math.cos(orbitAngle),
                y: parentTransform.y + orbitRadius * Math.sin(orbitAngle),
                rotation: rollRotation
            };
        }
    }
    
    // Draw based on mode
    const mode = params.displayMode.toLowerCase();
    
    if (mode === 'lines') {
        // Lines mode - show radii
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const t = transforms[i];
            
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            
            // Draw radius line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(circle.radius, 0);
            ctx.stroke();
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(0, 0, circle.radius, 0, TWO_PI);
            ctx.stroke();
            
            ctx.restore();
        }
    } else if (mode === 'b/w') {
        // Black/white mode - filled circles
        for (let i = circles.length - 1; i >= 0; i--) {
            const circle = circles[i];
            const t = transforms[i];
            
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
            ctx.beginPath();
            ctx.arc(t.x, t.y, circle.radius, 0, TWO_PI);
            ctx.fill();
        }
    } else if (mode === 'gradient') {
        // Gradient mode - alpha based on depth
        for (let i = circles.length - 1; i >= 0; i--) {
            const circle = circles[i];
            const t = transforms[i];
            const alpha = 1 - (i / circles.length) * 0.7;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, circle.radius, 0, TWO_PI);
            ctx.fill();
        }
    }
}

/**
 * Script configuration
 */
export const SCRIPT_CONFIG = {
    id: 'circles',
    title: 'Nested Circles',
    category: 'other',
    description: 'Nested circles rolling inside each other with multiple visualization modes.',
    version: '1.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },
    
    parameters: [
        {
            group: 'Display',
            params: [
                {
                    key: 'displayMode',
                    type: 'radio',
                    label: 'Mode',
                    options: ['Lines', 'B/W', 'Gradient'],
                    default: 'Lines'
                }
            ]
        },
        {
            group: 'Animation',
            params: [
                {
                    key: 'circleCount',
                    type: 'slider',
                    label: 'Circle Count',
                    min: 10,
                    max: 200,
                    step: 1,
                    default: 100
                },
                {
                    key: 'cycleFrames',
                    type: 'slider',
                    label: 'Cycle Speed',
                    min: 600,
                    max: 7200,
                    step: 60,
                    default: 3600
                }
            ]
        }
    ],
    
    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60
    },
    
    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    draw: draw
};

console.log('✅ Circles script loaded');

