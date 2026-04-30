/**
 * Toroidal Spirals Script - 3D rotating torus with spirals
 *
 * @script torus
 * @category parametric
 * @version 2.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Standard Ry × Rx orthographic projection.
 * @param {number} x,y,z  3D surface point
 * @param {number} cosX    cos(xRotation + viewAngleX) — pre-computed per frame
 * @param {number} sinX    sin(xRotation + viewAngleX)
 * @param {number} cosVY   cos(viewAngleY) — pre-computed per frame
 * @param {number} sinVY   sin(viewAngleY)
 * @param {number} cx,cy   canvas centre
 */
function project3D(x, y, z, cosX, sinX, cosVY, sinVY, cx, cy) {
    // Stage 1 — Ry(viewAngleY): standard Y-axis rotation
    const xR =  x * cosVY + z * sinVY;
    const zR = -x * sinVY + z * cosVY;

    // Stage 2 — Rx(xRotation + viewAngleX): combined X-axis rotation
    const yR = y * cosX - zR * sinX;

    return { x: cx + xR, y: cy - yR };
}

/**
 * Draw poloidal rings forming the torus mesh.
 * @param {number} numRings  TOR-03: configurable ring count (was hardcoded 36)
 * @param {string} fillColour  hex colour for disc fill
 * @param {number} fillAlpha   alpha for disc fill (0–1)
 */
function drawTorusSpiral(ctx, rotation, cosX, sinX, cosVY, sinVY, cx, cy, R, r, numRings, fillColour, fillAlpha) {
    // Parse hex colour to rgba for alpha support
    const hex = fillColour.replace('#', '');
    const ri = parseInt(hex.substring(0, 2), 16);
    const gi = parseInt(hex.substring(2, 4), 16);
    const bi = parseInt(hex.substring(4, 6), 16);
    ctx.fillStyle = `rgba(${ri},${gi},${bi},${fillAlpha})`;

    for (let i = 0; i < numRings; i++) {
        const theta = (i / numRings) * Math.PI * 2 + rotation;

        ctx.beginPath();

        const points = 50;
        for (let j = 0; j <= points; j++) {
            const phi = (j / points) * Math.PI * 2;

            const x = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y = (R + r * Math.cos(phi)) * Math.sin(theta);
            const z = r * Math.sin(phi);

            const p = project3D(x, y, z, cosX, sinX, cosVY, sinVY, cx, cy);

            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();
        ctx.fill();
    }
}

/**
 * Draw one toroidal surface spiral (1001 points) as a polyline.
 * @param {string} strokeColour  TOR-02 colourway outerLines colour
 */
function drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, cosX, sinX, reverse, winds, cosVY, sinVY, cx, cy, R, r, strokeColour) {
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

        const p = project3D(x, y, z, cosX, sinX, cosVY, sinVY, cx, cy);

        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }

    ctx.strokeStyle = strokeColour || '#c0c0c0';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame, colourway) {
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Resolve colourway colours (TOR-02)
    const cw            = colourway || [];
    const bgColour      = cw.find(c => c.id === 'background')?.colour     || '#000000';
    const lineColour    = cw.find(c => c.id === 'outerLines')?.colour     || '#c0c0c0';
    const meshColour    = cw.find(c => c.id === 'innerMeshLines')?.colour || '#c0c0c0';
    const discColour    = cw.find(c => c.id === 'shadedDiscs')?.colour    || '#c0c0c0';
    const discAlpha     = cw.find(c => c.id === 'shadedDiscs')?.alpha     ?? 0.25;

    const baseRadius = Math.min(W, H) * (params.torusSize || 0.18);
    const R = baseRadius * (params.majorRadiusFactor || 1);
    const r = baseRadius * (params.minorRadiusFactor || 1);

    const viewAngleX        = (params.viewX            || 30)   * Math.PI / 180;
    const viewAngleY        = (params.viewY            || 22.5) * Math.PI / 180;
    const cycleFrames       = params.cycleFrames       || 3600;
    const numSpirals        = params.numSpirals        || 9;
    const spiralWinds       = params.spiralWinds       || 4;
    const meshRingCount     = params.meshRingCount     || 36;        // TOR-03
    const meshRotationSpeed = params.meshRotationSpeed ?? 1.0;       // TOR-04

    // Clear with background colour
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, W, H);

    const phase          = (frame / cycleFrames) * Math.PI * 2;
    const torusRotation  =  phase * meshRotationSpeed;               // TOR-04
    const spiralRotation = -phase;

    const totalX = phase + viewAngleX;
    const cosX  = Math.cos(totalX);
    const sinX  = Math.sin(totalX);
    const cosVY = Math.cos(viewAngleY);
    const sinVY = Math.sin(viewAngleY);

    if (params.showTorusMesh === 'on') {
        drawTorusSpiral(ctx, torusRotation, cosX, sinX, cosVY, sinVY, cx, cy, R, r, meshRingCount, discColour, discAlpha);
    }

    for (let i = 0; i < numSpirals; i++) {
        const offset = (i / numSpirals) * Math.PI * 2;
        drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, cosX, sinX, false, spiralWinds, cosVY, sinVY, cx, cy, R, r, lineColour);
        drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, cosX, sinX, true,  spiralWinds, cosVY, sinVY, cx, cy, R, r, lineColour);
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
    version: '2.0.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Torus renders an animated wireframe 3D torus (surface of revolution) on a fixed 800×800 2D canvas. The torus surface is parameterised by toroidal angle θ and poloidal angle φ: x = (R+r·cos(φ))·cos(θ), y = (R+r·cos(φ))·sin(θ), z = r·sin(φ), where base = min(W,H)×torusSize, R = base×majorRadiusFactor, r = base×minorRadiusFactor. Two visual layers are rendered each frame: cross-section mesh (36 evenly-spaced poloidal rings as filled paths at 25% alpha, enabled by showTorusMesh) and toroidal surface spirals (numSpirals clockwise + numSpirals counter-clockwise spirals, each 1001 points, winding spiralWinds times around the major circle). Animation: torusRotation, spiralRotation (counter-direction), and xRotation all advance as (frame/cycleFrames)×2π, completing one full revolution per cycle. Projection: standard Ry×Rx orthographic — Y-axis yaw (viewY) first, then combined X-axis rotation (xRotation+viewX). Output is monochrome on black.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Five functions. project3D(x,y,z,cosX,sinX,cosVY,sinVY,cx,cy): applies Ry(viewY) then Rx(xRotation+viewX) via pre-computed trig; Stage 1 — xR = x·cosVY + z·sinVY, zR = −x·sinVY + z·cosVY; Stage 2 — yR = y·cosX − zR·sinX; output {x: cx+xR, y: cy−yR}. drawTorusSpiral: 36 rings; θ_i = (i/36)×2π+torusRotation; each ring is a closed path of 51 points (φ = 0→2π) projected and filled at rgba(192,192,192,0.25). drawToroidalSurfaceSpiral: one spiral as 1001-point polyline; t∈[0,1]; φ(t) = t×2π; θ(t) = t×winds×(±1)×2π+spiralRotation+offset; stroked at #c0c0c0, lineWidth 1. draw: clears canvas; computes R = min(W,H)×torusSize; pre-computes per-frame trig (totalX = phase+viewAngleX; cosX,sinX,cosVY,sinVY); computes torusRotation = phase, spiralRotation = −phase; calls drawTorusSpiral if showTorusMesh is on; iterates i=0..numSpirals−1, calling forward and reverse drawToroidalSurfaceSpiral per i.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Torus group — numSpirals: slider, 3→18 step 1, default 9; number of unique spiral indices; total drawn spirals = 2×numSpirals (forward + reverse per index). torusSize: slider, 0.1→0.4 step 0.01, default 0.18; base radius scalar from min(W,H). majorRadiusFactor: slider, 0.5→2 step 0.05, default 1; scales R = base×majorRadiusFactor. minorRadiusFactor: slider, 0.5→2 step 0.05, default 1; scales r = base×minorRadiusFactor. spiralWinds: slider, 1→10 step 1, default 4; number of times each spiral winds around the torus major circle. showTorusMesh: radio, on|off, default on; when on, draws 36 filled cross-section ellipses. Rotation group — viewX: slider, 0→360 step 1, default 30; camera X-axis tilt in degrees, combined with frame-driven xRotation. viewY: slider, 0→360 step 1, default 22.5; camera Y-axis yaw in degrees; applied first in the projection chain. cycleFrames: slider, 600→7200 step 60, default 3600; frames per complete animation loop; at 60 FPS, default = 60 s.'
        },
        {
            heading: 'PRESETS',
            body: 'Default: 9 spirals, 4 winds, torusSize 0.18, mesh on, viewX 30, viewY 22.5, cycleFrames 3600; standard ring torus rotating once per minute. Dense Spirals: 18 spirals, 6 winds, torusSize 0.2, mesh off, viewX 45, viewY 30, cycleFrames 3600; dense interlocking spiral lattice. Minimal: 3 spirals, 2 winds, torusSize 0.25, mesh on, viewX 20, viewY 15, cycleFrames 5400; slow-rotating horn torus with sparse spirals. Fast: 9 spirals, 4 winds, default geometry, cycleFrames 1200 (30 s loop at 60 FPS).'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Compute tier: lightweight. No adaptive resolution or worker offload required. Dominant cost: project3D calls — ~20,000 point evaluations at default settings; ~38,000 at maximum (18 spirals, mesh on). Per-frame trig calls reduced via pre-computing cosX, sinX, cosVY, sinVY once in draw and passing to all project3D calls; eliminates ~6 trig calls per invocation (~228,000 → ~76,000 trig ops at max). Radii computed inline as Math.min(W,H)×torusSize — 2 arithmetic ops, no allocation. At maximum parameters (18 spirals, 10 winds, mesh on): ~360,036 point evaluations; estimated 3–6 ms. Well within 16.7 ms 60 FPS budget at all valid parameter values.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: loop. loopFrames: 3600, matching cycleFrames default; one full revolution at 60 FPS = 60 s. loopFrames is a static config field — if cycleFrames is changed by the user, exported GIF/WebM will span 3600 frames regardless of the user-selected cycle period. Fully deterministic: same frame index + same params = identical output. No Math.random, no accumulated state, no Date.now dependency. Export: png true, gif true, webm true, sequence true. animatableParams: [] — animation is entirely frame-driven; no per-parameter phase sweeps are declared. canPrerender: true.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Play/pause control not implemented at script level; host-provided only. If cycleFrames differs from 3600, exported animation will span 3600 frames regardless (loopFrames is fixed). Canvas size is fixed 800×800 and is not user-configurable. Spiral and mesh colours are hardcoded (#c0c0c0 / rgba(192,192,192,0.25)); no colour parameter is exposed.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm: standard torus surface parameterisation x=(R+r·cos(φ))·cos(θ), y=(R+r·cos(φ))·sin(θ), z=r·sin(φ). Projection: standard Ry×Rx orthographic matrix. v2.0.0: module-level mutable state removed; project3D rewritten to standard Ry×Rx matrix; per-frame trig pre-computation; showTorusMesh type changed toggle→radio; inert canvas parameters removed; infoSections and compute block added.'
        }
    ],

    compute: { cost: 'lightweight' },

    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000',
        // TOR-02: X-007 colourway layers
        colourway: [
            { id: 'background',     label: 'Background',   colour: '#000000' },
            { id: 'outerLines',     label: 'Outer Lines',  colour: '#c0c0c0' },
            { id: 'innerMeshLines', label: 'Mesh Lines',   colour: '#c0c0c0' },
            { id: 'shadedDiscs',    label: 'Shaded Discs', colour: '#c0c0c0', alpha: 0.25 }
        ]
    },

    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60,
        canPrerender: true,
        animatableParams: ['viewX', 'viewY'],
        sequencer: true,
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
                majorRadiusFactor: 1,
                minorRadiusFactor: 1,
                spiralWinds: 4,
                viewX: 30,
                viewY: 22.5,
                cycleFrames: 3600,
                showTorusMesh: 'on'
            }
        },
        {
            name: 'Dense Spirals',
            values: {
                numSpirals: 18,
                torusSize: 0.2,
                majorRadiusFactor: 1.1,
                minorRadiusFactor: 0.8,
                spiralWinds: 6,
                viewX: 45,
                viewY: 30,
                cycleFrames: 3600,
                showTorusMesh: 'off'
            }
        },
        {
            name: 'Minimal',
            values: {
                numSpirals: 3,
                torusSize: 0.25,
                majorRadiusFactor: 1.2,
                minorRadiusFactor: 0.7,
                spiralWinds: 2,
                viewX: 20,
                viewY: 15,
                cycleFrames: 5400,
                showTorusMesh: 'on'
            }
        },
        {
            name: 'Fast',
            values: {
                numSpirals: 9,
                torusSize: 0.18,
                majorRadiusFactor: 1,
                minorRadiusFactor: 1,
                spiralWinds: 4,
                viewX: 30,
                viewY: 22.5,
                cycleFrames: 1200,
                showTorusMesh: 'on'
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
                    key: 'majorRadiusFactor',
                    type: 'slider',
                    label: 'Major Radius',
                    min: 0.5,
                    max: 2,
                    step: 0.05,
                    default: 1,
                    precision: 2
                },
                {
                    key: 'minorRadiusFactor',
                    type: 'slider',
                    label: 'Minor Radius',
                    min: 0.5,
                    max: 2,
                    step: 0.05,
                    default: 1,
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
                    type: 'radio',
                    label: 'Show Mesh',
                    options: ['on', 'off'],
                    default: 'on'
                },
                // TOR-03: configurable mesh ring count
                {
                    key: 'meshRingCount',
                    type: 'slider',
                    label: 'Mesh Rings',
                    min: 4,
                    max: 72,
                    step: 1,
                    default: 36
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
                },
                // TOR-04: independent mesh rotation speed
                {
                    key: 'meshRotationSpeed',
                    type: 'slider',
                    label: 'Mesh Rotation Speed',
                    min: -3,
                    max: 3,
                    step: 0.1,
                    default: 1.0,
                    precision: 1
                }
            ]
        }
    ],

    draw(ctx, canvas, params, frame) {
        return draw(ctx, canvas, params, frame, this.canvas.colourway);
    }
};
