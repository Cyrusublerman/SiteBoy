/**
 * Toroidal Spirals Script - 3D rotating torus with spirals
 * 
 * @script torus
 * @category parametric
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

let majorRadius = 0;
let minorRadius = 0;

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function updateRadii(width, height, sizeFactor) {
    const minDim = Math.min(width, height);
    majorRadius = minDim * sizeFactor;
    minorRadius = minDim * sizeFactor;
}

function project3D(x, y, z, xRotation, viewAngleX, viewAngleY, centerX, centerY) {
    // Rotate around X-axis
    let y0 = y * Math.cos(xRotation) - z * Math.sin(xRotation);
    let z0 = y * Math.sin(xRotation) + z * Math.cos(xRotation);
    
    // Apply camera angles
    let y1 = y0 * Math.cos(viewAngleX) - z0 * Math.sin(viewAngleX);
    let z1 = y0 * Math.sin(viewAngleX) + z0 * Math.cos(viewAngleX);
    let x2 = x * Math.cos(viewAngleY) + z1 * Math.sin(viewAngleY);
    
    return { x: centerX + x2, y: centerY - y1 };
}

function drawTorusSpiral(ctx, rotation, xRotation, viewAngleX, viewAngleY, centerX, centerY) {
    const numEllipses = 36;
    const R = majorRadius;
    const r = minorRadius;
    
    ctx.fillStyle = 'rgba(192, 192, 192, 0.25)';
    
    for (let i = 0; i < numEllipses; i++) {
        const theta = (i / numEllipses) * Math.PI * 2 + rotation;
        
        ctx.beginPath();
        
        const points = 50;
        for (let j = 0; j <= points; j++) {
            const phi = (j / points) * Math.PI * 2;
            
            const x = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y = (R + r * Math.cos(phi)) * Math.sin(theta);
            const z = r * Math.sin(phi);
            
            const p = project3D(x, y, z, xRotation, viewAngleX, viewAngleY, centerX, centerY);
            
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        
        ctx.closePath();
        ctx.fill();
    }
}

function drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, reverse, winds, viewAngleX, viewAngleY, centerX, centerY) {
    const R = majorRadius;
    const r = minorRadius;
    const points = 1000;
    
    ctx.beginPath();
    
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const phi = t * Math.PI * 2;
        const windDirection = reverse ? -1 : 1;
        const theta = t * winds * windDirection * Math.PI * 2 + spiralRotation + offset;
        
        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const y = (R + r * Math.cos(phi)) * Math.sin(theta);
        const z = r * Math.sin(phi);
        
        const p = project3D(x, y, z, xRotation, viewAngleX, viewAngleY, centerX, centerY);
        
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame) {
    const W = canvas.width;
    const H = canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;
    
    // Update radii
    updateRadii(W, H, params.torusSize || 0.18);
    
    // Convert degrees to radians
    const viewAngleX = (params.viewX || 30) * Math.PI / 180;
    const viewAngleY = (params.viewY || 22.5) * Math.PI / 180;
    const cycleFrames = params.cycleFrames || 3600;
    const numSpirals = params.numSpirals || 9;
    const spiralWinds = params.spiralWinds || 4;
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    // Calculate rotations
    const torusRotation = (frame / cycleFrames) * Math.PI * 2;
    const spiralRotation = -(frame / cycleFrames) * Math.PI * 2;
    const xRotation = (frame / cycleFrames) * Math.PI * 2;
    
    // Draw central torus spiral
    if (params.showTorusMesh) {
        drawTorusSpiral(ctx, torusRotation, xRotation, viewAngleX, viewAngleY, centerX, centerY);
    }
    
    // Draw spirals in both directions
    for (let i = 0; i < numSpirals; i++) {
        const offset = (i / numSpirals) * Math.PI * 2;
        drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, false, spiralWinds, viewAngleX, viewAngleY, centerX, centerY);
        drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, true, spiralWinds, viewAngleX, viewAngleY, centerX, centerY);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'torus',
    title: 'Toroidal Spirals',
    category: 'parametric',
    description: '3D toroidal spirals in continuous rotation. Multiple spiral paths wind around a torus shape with configurable view angles.',
    version: '1.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },
    
    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60,
        canPrerender: true
    },
    
    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    presets: [
        {
            name: 'Default',
            values: {
                numSpirals: 9,
                torusSize: 0.18,
                spiralWinds: 4,
                viewX: 30,
                viewY: 22.5,
                cycleFrames: 3600,
                showTorusMesh: true
            }
        },
        {
            name: 'Dense Spirals',
            values: {
                numSpirals: 18,
                torusSize: 0.2,
                spiralWinds: 6,
                viewX: 45,
                viewY: 30,
                cycleFrames: 3600,
                showTorusMesh: false
            }
        },
        {
            name: 'Minimal',
            values: {
                numSpirals: 3,
                torusSize: 0.25,
                spiralWinds: 2,
                viewX: 20,
                viewY: 15,
                cycleFrames: 5400,
                showTorusMesh: true
            }
        },
        {
            name: 'Fast',
            values: {
                numSpirals: 9,
                torusSize: 0.18,
                spiralWinds: 4,
                viewX: 30,
                viewY: 22.5,
                cycleFrames: 1200,
                showTorusMesh: true
            }
        }
    ],
    
    parameters: [
        {
            group: 'Torus',
            params: [
                {
                    key: 'numSpirals',
                    type: 'slider',
                    label: 'Spirals',
                    min: 3,
                    max: 18,
                    step: 1,
                    default: 9
                },
                {
                    key: 'torusSize',
                    type: 'slider',
                    label: 'Size',
                    min: 0.1,
                    max: 0.4,
                    step: 0.01,
                    default: 0.18,
                    precision: 2
                },
                {
                    key: 'spiralWinds',
                    type: 'slider',
                    label: 'Spiral Winds',
                    min: 1,
                    max: 10,
                    step: 1,
                    default: 4
                },
                {
                    key: 'showTorusMesh',
                    type: 'toggle',
                    label: 'Show Mesh',
                    default: true
                }
            ]
        },
        {
            group: 'Rotation',
            params: [
                {
                    key: 'viewX',
                    type: 'slider',
                    label: 'View X (deg)',
                    min: 0,
                    max: 360,
                    step: 1,
                    default: 30
                },
                {
                    key: 'viewY',
                    type: 'slider',
                    label: 'View Y (deg)',
                    min: 0,
                    max: 360,
                    step: 1,
                    default: 22.5,
                    precision: 1
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
        },
        {
            group: 'Canvas',
            params: [
                {
                    key: 'canvasWidth',
                    type: 'slider',
                    label: 'Width',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Height',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                }
            ]
        }
    ],
    
    draw: draw
};

console.log('✅ Toroidal Spirals script loaded');
