/**
 * Harmonics Script - Musical intervals as Lissajous patterns
 * 12 minute cycle through all musical intervals and views
 * 
 * Extracted from harmonics-tool.js
 */

// Animation state (module-scoped)
let startTime = null;
let passDuration = 90;
let totalCycleDuration = 720;

// Musical intervals
const intervals = [
    [1, 1],      // unison
    [16, 15],    // minor second
    [9, 8],      // major second
    [6, 5],      // minor third
    [5, 4],      // major third
    [4, 3],      // perfect fourth
    [45, 32],    // tritone
    [3, 2],      // perfect fifth
    [8, 5],      // minor sixth
    [5, 3],      // major sixth
    [9, 5],      // minor seventh
    [15, 8],     // major seventh
    [2, 1]       // octave
];

const views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];

function timeWarp(x) {
    const numIntervals = intervals.length - 1;
    const scaledProgress = x * numIntervals;
    const currentInterval = Math.floor(scaledProgress);
    const localProgress = scaledProgress - currentInterval;
    
    const smoothstep = (t) => t * t * (3 - 2 * t);
    let eased = smoothstep(localProgress);
    eased = smoothstep(eased);
    
    return (currentInterval + eased) / numIntervals;
}

function getCoordinates(t, ratio, view, scale, baseRadius) {
    const a = ratio[0];
    const b = ratio[1];
    
    if (!isFinite(a) || !isFinite(b) || !isFinite(t)) {
        return { x: 0, y: 0 };
    }
    
    switch(view) {
        case 'lateralOpen':
            return {
                x: scale * Math.sin(a * t),
                y: scale * Math.sin(b * t)
            };
        
        case 'lateralClosed':
            return {
                x: scale * Math.cos(a * t),
                y: scale * Math.sin(b * t)
            };
        
        case 'concurrent':
            var r1 = baseRadius * (1 + 0.6 * Math.sin(b * t));
            var angle1 = a * t;
            return {
                x: r1 * Math.cos(angle1),
                y: r1 * Math.sin(angle1)
            };
        
        case 'counterCurrent':
            var r2 = baseRadius * (1 + 0.6 * Math.sin(b * t));
            var angle2 = a * t - b * t;
            return {
                x: r2 * Math.cos(angle2),
                y: r2 * Math.sin(angle2)
            };
        
        default:
            return { x: 0, y: 0 };
    }
}

export const SCRIPT_CONFIG = {
    id: 'harmonics',
    title: 'Musical Harmonics',
    category: 'parametric',
    description: 'Visualisation of musical intervals as Lissajous patterns. The animation cycles through all 12 intervals across 4 different geometric views over 12 minutes.',
    version: '2.0.0',
    
    canvas: { 
        width: 800, 
        height: 800, 
        context: '2d'
    },
    
    // Animation configuration
    animation: {
        type: 'loop',
        loopDuration: 720,      // 12 minutes in seconds
        loopFrames: 720 * 60,   // 43200 frames at 60fps
        defaultFps: 60,
        defaultSpeed: 1,
        canPrerender: true,
        animatableParams: []    // No phase animation for this tool
    },
    
    // Export configuration
    export: {
        png: true,
        svg: false,
        gif: true,
        webm: true,
        sequence: true
    },
    
    // Presets
    presets: [
        {
            name: 'Default',
            values: {
                motionBlur: 0.05,
                passDuration: 90,
                points: 800,
                pointSize: 1
            }
        },
        {
            name: 'Fast Cycle',
            values: {
                motionBlur: 0.08,
                passDuration: 30,
                points: 600,
                pointSize: 1
            }
        },
        {
            name: 'Dense',
            values: {
                motionBlur: 0.03,
                passDuration: 90,
                points: 2000,
                pointSize: 0.5
            }
        },
        {
            name: 'Minimal',
            values: {
                motionBlur: 0.02,
                passDuration: 120,
                points: 400,
                pointSize: 2
            }
        }
    ],
    
    // Parameter groups
    parameters: [
        {
            group: 'Display',
            params: [
                { 
                    key: 'motionBlur', 
                    type: 'slider', 
                    label: 'Motion Blur', 
                    min: 0.01, 
                    max: 0.2, 
                    step: 0.01, 
                    default: 0.05,
                    precision: 2
                },
                { 
                    key: 'points', 
                    type: 'slider', 
                    label: 'Points', 
                    min: 100, 
                    max: 3000, 
                    step: 100, 
                    default: 800 
                },
                { 
                    key: 'pointSize', 
                    type: 'slider', 
                    label: 'Point Size', 
                    min: 0.5, 
                    max: 4, 
                    step: 0.5, 
                    default: 1,
                    precision: 1
                }
            ]
        },
        {
            group: 'Timing',
            params: [
                { 
                    key: 'passDuration', 
                    type: 'slider', 
                    label: 'Pass Duration', 
                    min: 30, 
                    max: 180, 
                    step: 10, 
                    default: 90 
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
                    max: 2000, 
                    step: 100, 
                    default: 800 
                },
                { 
                    key: 'canvasHeight', 
                    type: 'slider', 
                    label: 'Height', 
                    min: 400, 
                    max: 2000, 
                    step: 100, 
                    default: 800 
                }
            ]
        }
    ],
    
    // Lifecycle callbacks
    onInit: function(params, ctx, canvas) {
        startTime = Date.now();
        passDuration = params.passDuration || 90;
        totalCycleDuration = passDuration * 8;
    },
    
    onParamChange: function(key, value, params) {
        if (key === 'passDuration') {
            passDuration = parseInt(value) || 90;
            totalCycleDuration = passDuration * 8;
        }
    },
    
    // Draw function - called each frame
    draw: (ctx, canvas, params, frame) => {
        const elapsed = (Date.now() - startTime) / 1000;
        const cycleTime = elapsed % totalCycleDuration;
        
        const passIndex = Math.floor(cycleTime / passDuration);
        const timeInPass = cycleTime % passDuration;
        
        const isAscending = passIndex % 2 === 0;
        
        const viewSegment = Math.floor(passIndex / 2);
        const currentViewIndex = viewSegment % views.length;
        const nextViewIndex = (viewSegment + 1) % views.length;
        
        const linearProgress = timeInPass / passDuration;
        const warpedProgress = timeWarp(linearProgress);
        
        let ratioProgress;
        if (isAscending) {
            ratioProgress = warpedProgress * (intervals.length - 1);
        } else {
            ratioProgress = (intervals.length - 1) * (1 - warpedProgress);
        }
        
        const viewProgress = !isAscending ? warpedProgress : 0;
        
        const ratioIndex = Math.floor(ratioProgress);
        const ratioT = ratioProgress - ratioIndex;
        
        const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), intervals.length - 1);
        const safeNextRatioIndex = Math.min(Math.max(ratioIndex + 1, 0), intervals.length - 1);
        
        const currentRatio = [
            intervals[safeRatioIndex][0] + (intervals[safeNextRatioIndex][0] - intervals[safeRatioIndex][0]) * ratioT,
            intervals[safeRatioIndex][1] + (intervals[safeNextRatioIndex][1] - intervals[safeRatioIndex][1]) * ratioT
        ];
        
        // Apply motion blur
        const motionBlur = params.motionBlur || 0.05;
        ctx.fillStyle = `rgba(0, 0, 0, ${motionBlur})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw pattern
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.35;
        const baseRadius = scale * 0.7;
        const points = params.points || 800;
        const pointSize = params.pointSize || 1;
        const cycles = Math.max(2, Math.ceil(Math.max(currentRatio[0], currentRatio[1])) * 2);
        
        ctx.fillStyle = '#c0c0c0';
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 * cycles;
            
            const current = getCoordinates(angle, currentRatio, views[currentViewIndex], scale, baseRadius);
            const next = getCoordinates(angle, currentRatio, views[nextViewIndex], scale, baseRadius);
            
            const x = cx + current.x * (1 - viewProgress) + next.x * viewProgress;
            const y = cy + current.y * (1 - viewProgress) + next.y * viewProgress;
            
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};
