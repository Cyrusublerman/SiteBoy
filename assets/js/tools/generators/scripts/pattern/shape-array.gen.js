/**
 * Shape Array - p5.js Generator
 *
 * A grid of shapes that morph continuously through line → triangle → square
 * → circle, with a wave phase offset across columns and rows.
 *
 * Based on shape_array_accident sketch.
 *
 * @version 1.0.0
 */

export const SCRIPT_CONFIG = {
    id: 'shape-array',
    title: 'Shape Array',
    category: 'pattern',
    description: 'Grid of shapes that continuously morph from lines to polygons to circles. A wave phase offset creates a ripple across the array.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    parameters: [
        {
            group: 'Grid',
            params: [
                { key: 'cols',      type: 'slider', label: 'Columns',    min: 3,  max: 20, step: 1, default: 10 },
                { key: 'rows',      type: 'slider', label: 'Rows',       min: 3,  max: 20, step: 1, default: 10 },
                { key: 'spacing',   type: 'slider', label: 'Spacing',    min: 20, max: 150, step: 5, default: 60 }
            ]
        },
        {
            group: 'Shapes',
            params: [
                { key: 'shapeSize',       type: 'slider', label: 'Shape Size',      min: 5,  max: 80, step: 1,    default: 20 },
                { key: 'circleRes',       type: 'slider', label: 'Circle Resolution', min: 8, max: 64, step: 4,   default: 32 }
            ]
        },
        {
            group: 'Animation',
            params: [
                { key: 'morphSpeed',  type: 'slider', label: 'Morph Speed',   min: 0.001, max: 0.02, step: 0.001, default: 0.005 },
                { key: 'phaseOffset', type: 'slider', label: 'Phase Offset',  min: 0,     max: 0.5,  step: 0.01,  default: 0.1 }
            ]
        },
        {
            group: 'Style',
            params: [
                { key: 'bgColor',     type: 'dropdown', label: 'Background', options: ['dark', 'light'], default: 'dark' },
                { key: 'strokeWeight', type: 'slider', label: 'Stroke Weight', min: 0.5, max: 4, step: 0.5, default: 1.5 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            cols: 10, rows: 10, spacing: 60, shapeSize: 20, circleRes: 32,
            morphSpeed: 0.005, phaseOffset: 0.1, bgColor: 'dark', strokeWeight: 1.5
        },
        {
            name: 'Dense',
            cols: 15, rows: 15, spacing: 40, shapeSize: 12, circleRes: 16,
            morphSpeed: 0.008, phaseOffset: 0.08, bgColor: 'dark', strokeWeight: 1
        },
        {
            name: 'Slow Drift',
            cols: 8, rows: 8, spacing: 80, shapeSize: 28, circleRes: 32,
            morphSpeed: 0.002, phaseOffset: 0.05, bgColor: 'light', strokeWeight: 2
        }
    ],

    animation: { type: 'infinite', defaultFps: 60 },

    _globalT: 0,

    _polygon(p, n, radius, rotation = 0) {
        const verts = [];
        for (let i = 0; i < n; i++) {
            const angle = rotation + (p.TWO_PI * i) / n - p.HALF_PI;
            verts.push({ x: radius * p.cos(angle), y: radius * p.sin(angle) });
        }
        return verts;
    },

    _samplePerimeter(p, verts, count) {
        const n = verts.length;
        let perimeter = 0;
        for (let i = 0; i < n; i++) {
            const next = (i + 1) % n;
            perimeter += p.dist(verts[i].x, verts[i].y, verts[next].x, verts[next].y);
        }
        const samples = [];
        for (let s = 0; s < count; s++) {
            const target = (s / count) * perimeter;
            let traveled = 0;
            for (let i = 0; i < n; i++) {
                const next = (i + 1) % n;
                const edge = p.dist(verts[i].x, verts[i].y, verts[next].x, verts[next].y);
                if (traveled + edge >= target) {
                    const t = (target - traveled) / edge;
                    samples.push({
                        x: verts[i].x + (verts[next].x - verts[i].x) * t,
                        y: verts[i].y + (verts[next].y - verts[i].y) * t
                    });
                    break;
                }
                traveled += edge;
            }
        }
        return samples;
    },

    _lerpShape(a, b, t) {
        return a.map((v, i) => ({
            x: v.x + (b[i].x - v.x) * t,
            y: v.y + (b[i].y - v.y) * t
        }));
    },

    _getShape(p, t, radius, count) {
        const stages = [2, 3, 4, p.max(8, count)];
        const stageT = t * (stages.length - 1);
        const si = Math.floor(stageT);
        const localT = stageT - si;
        const fromN = stages[Math.min(si, stages.length - 1)];
        const toN   = stages[Math.min(si + 1, stages.length - 1)];
        const from = this._samplePerimeter(p, this._polygon(p, fromN, radius), count);
        const to   = this._samplePerimeter(p, this._polygon(p, toN,   radius), count);
        return this._lerpShape(from, to, localT);
    },

    p5Setup(p, params) {
        p.noLoop();
        p.noFill();
        this._globalT = 0;
    },

    p5Draw(p, params, frame) {
        const { cols, rows, spacing, shapeSize, circleRes, morphSpeed, phaseOffset, bgColor, strokeWeight } = params;

        this._globalT = (this._globalT + morphSpeed) % 1;

        p.background(bgColor === 'dark' ? 20 : 245);
        p.stroke(bgColor === 'dark' ? 255 : 0);
        p.strokeWeight(strokeWeight);

        const offsetX = (p.width  - (cols - 1) * spacing) / 2;
        const offsetY = (p.height - (rows - 1) * spacing) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const phase = (col + row) * phaseOffset;
                const t = (this._globalT + phase) % 1;
                const shape = this._getShape(p, t, shapeSize, circleRes);
                const px = offsetX + col * spacing;
                const py = offsetY + row * spacing;
                p.push();
                p.translate(px, py);
                p.beginShape();
                for (const v of shape) p.vertex(v.x, v.y);
                p.endShape(p.CLOSE);
                p.pop();
            }
        }
    }
};
