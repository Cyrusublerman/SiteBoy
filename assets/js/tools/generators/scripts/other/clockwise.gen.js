/**
 * Clockwise - p5.js Generator
 *
 * Eight square pixel systems orbit and spin around a central point. Each
 * square has two internal grids: a pulse wave (brightness) and a hue field.
 * When two squares' pixels overlap, they swap values — mixing the fields.
 *
 * Based on clockwise sketch (both versions are identical).
 *
 * @version 1.0.0
 */

export const SCRIPT_CONFIG = {
    id: 'clockwise',
    title: 'Clockwise',
    category: 'other',
    description: 'Orbiting pixel squares with internal cellular wave physics. Overlapping squares swap field values, blending colours and pulse patterns.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    parameters: [
        {
            group: 'System',
            params: [
                { key: 'numSquares',  type: 'slider', label: 'Squares',       min: 2, max: 12, step: 1,    default: 8 },
                { key: 'orbitRadius', type: 'slider', label: 'Orbit Radius',  min: 100, max: 540, step: 20, default: 540 }
            ]
        },
        {
            group: 'Motion',
            params: [
                { key: 'orbitSpeed', type: 'slider', label: 'Orbit Speed (°/frame)', min: 0.1, max: 5, step: 0.1, default: 1 },
                { key: 'spinSpeed',  type: 'slider', label: 'Spin Speed (°/frame)',  min: 0.1, max: 5, step: 0.1, default: 1 },
                { key: 'orbitDir',   type: 'dropdown', label: 'Orbit Direction', options: ['CW', 'CCW'], default: 'CCW' }
            ]
        },
        {
            group: 'Physics',
            params: [
                { key: 'growthFactor',  type: 'slider', label: 'Growth Factor',   min: 0.5, max: 5,    step: 0.1,  default: 2.0 },
                { key: 'damping',       type: 'slider', label: 'Damping',         min: 0.01, max: 0.5,  step: 0.01, default: 0.15 },
                { key: 'waveDecay',     type: 'slider', label: 'Wave Decay',      min: 0.8,  max: 0.99, step: 0.01, default: 0.96 },
                { key: 'identityForce', type: 'slider', label: 'Identity Force',  min: 0,    max: 0.1,  step: 0.005, default: 0.01 },
                { key: 'swapCooldown',  type: 'slider', label: 'Swap Cooldown',   min: 5,    max: 60,   step: 5,    default: 20 },
                { key: 'wrapAround',    type: 'dropdown', label: 'Wrap Around', options: ['on', 'off'], default: 'on' }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            numSquares: 8, orbitRadius: 540, orbitSpeed: 1, spinSpeed: 1, orbitDir: 'CCW',
            growthFactor: 2.0, damping: 0.15, waveDecay: 0.96, identityForce: 0.01, swapCooldown: 20, wrapAround: 'on'
        },
        {
            name: 'Turbulent',
            numSquares: 6, orbitRadius: 400, orbitSpeed: 2, spinSpeed: 2, orbitDir: 'CCW',
            growthFactor: 3.5, damping: 0.2, waveDecay: 0.94, identityForce: 0.005, swapCooldown: 10, wrapAround: 'on'
        },
        {
            name: 'Calm',
            numSquares: 4, orbitRadius: 300, orbitSpeed: 0.5, spinSpeed: 0.5, orbitDir: 'CW',
            growthFactor: 1.0, damping: 0.08, waveDecay: 0.98, identityForce: 0.02, swapCooldown: 30, wrapAround: 'on'
        }
    ],

    animation: { type: 'infinite', defaultFps: 30 },

    // State
    _squares: null,
    _collisionMap: null,
    _globalOrbitAngle: 0,
    _globalSpinAngle: 0,
    _lastParams: null,

    _needsRebuild(params) {
        if (!this._lastParams) return true;
        return this._lastParams.numSquares  !== params.numSquares ||
               this._lastParams.orbitRadius !== params.orbitRadius;
    },

    _buildSquares(p, params) {
        const { numSquares, orbitRadius } = params;
        const angleStep   = p.TWO_PI / numSquares;
        const chordLen    = 2 * orbitRadius * Math.sin(angleStep / 2);
        const sideLength  = Math.round((2 * Math.sqrt(2) * chordLen) / 3);
        const resolution  = Math.max(48, Math.min(180, Math.round(sideLength / 3)));
        const cellSize    = sideLength / resolution;

        const squares = [];
        for (let i = 0; i < numSquares; i++) {
            const angle      = i * angleStep;
            const bias       = i / numSquares;
            const offset     = resolution / 2;
            const matrix     = [];
            const grid1 = [], next1 = [];
            const grid2 = [], next2 = [];

            for (let x = 0; x < resolution; x++) {
                const rowM = [], g1r = [], n1r = [], g2r = [], n2r = [];
                for (let y = 0; y < resolution; y++) {
                    const lx = (x - offset + 0.5) * cellSize;
                    const ly = (y - offset + 0.5) * cellSize;
                    rowM.push({
                        polar:     { r: Math.sqrt(lx * lx + ly * ly), theta: Math.atan2(ly, lx) },
                        gridX: x, gridY: y,
                        cartesian: { x: 0, y: 0 },
                        centroid:  { x: 0, y: 0 },
                        color:     { h: 0, s: 0, b: 0 },
                        lastSwap:  -1000,
                        drawSize:  Math.max(1.25, cellSize * 1.15)
                    });
                    g1r.push(0); n1r.push(0);
                    g2r.push(bias); n2r.push(bias);
                }
                matrix.push(rowM);
                grid1.push(g1r); next1.push(n1r);
                grid2.push(g2r); next2.push(n2r);
            }

            squares.push({ id: i, startAngle: angle, resolution, matrix, grid1, next1, grid2, next2, bias });
        }
        return squares;
    },

    _getAvg(g, x, y, res, wrap) {
        let sum = 0, cnt = 0;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            let col = x + i, row = y + j;
            if (wrap) {
                col = (col + res) % res; row = (row + res) % res;
                sum += g[col][row]; cnt++;
            } else if (col >= 0 && col < res && row >= 0 && row < res) {
                sum += g[col][row]; cnt++;
            }
        }
        return cnt > 0 ? sum / cnt : g[x][y];
    },

    _sampleDiff(g, x, y, res, wrap) {
        const self = g[x][y];
        let sum = 0, total = 0;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let col = x + i, row = y + j, valid = false;
            if (wrap) { col = (col + res) % res; row = (row + res) % res; valid = true; }
            else if (col >= 0 && col < res && row >= 0 && row < res) valid = true;
            if (valid) {
                const w = (Math.abs(i) + Math.abs(j) === 2) ? 0.5 : 1.0;
                sum += Math.abs(g[col][row] - self) * w;
                total += w;
            }
        }
        return total > 0 ? sum / total : 0;
    },

    _updatePhysics(sq, params) {
        const { growthFactor, damping, waveDecay, identityForce, wrapAround } = params;
        const res  = sq.resolution;
        const wrap = wrapAround === 'on';
        const cohesion = 0.1;

        for (let x = 0; x < res; x++) {
            for (let y = 0; y < res; y++) {
                const v1 = sq.grid1[x][y];
                const d1 = this._sampleDiff(sq.grid1, x, y, res, wrap);
                const a1 = this._getAvg(sq.grid1, x, y, res, wrap);
                sq.next1[x][y] = (v1 + (a1 - v1) * cohesion + d1 * growthFactor * damping) * waveDecay;

                const v2 = sq.grid2[x][y];
                const d2 = this._sampleDiff(sq.grid2, x, y, res, wrap);
                const a2 = this._getAvg(sq.grid2, x, y, res, wrap);
                const phys = ((v2 + (a2 - v2) * cohesion + d2 * growthFactor * damping) % 1.0 + 1.0) % 1.0;
                sq.next2[x][y] = phys + (sq.bias - phys) * identityForce;
            }
        }
        [sq.grid1, sq.next1] = [sq.next1, sq.grid1];
        [sq.grid2, sq.next2] = [sq.next2, sq.grid2];
    },

    p5Setup(p, params) {
        p.colorMode(p.HSB, 360, 100, 100);
        p.noStroke();
        p.noSmooth();
        p.noLoop();
        this._squares = this._buildSquares(p, params);
        this._collisionMap = new Array(1080 * 1080).fill(null);
        this._globalOrbitAngle = 0;
        this._globalSpinAngle  = 0;
        this._lastParams = { ...params };
    },

    p5Draw(p, params, frame) {
        if (this._needsRebuild(params)) {
            this._squares = this._buildSquares(p, params);
            this._collisionMap = new Array(1080 * 1080).fill(null);
            this._globalOrbitAngle = 0;
            this._globalSpinAngle  = 0;
            this._lastParams = { ...params };
        }

        const { orbitSpeed, spinSpeed, orbitDir, swapCooldown } = params;
        const orbitDirMul = orbitDir === 'CCW' ? -1 : 1;

        this._globalSpinAngle  += p.radians(spinSpeed);
        this._globalOrbitAngle += p.radians(orbitSpeed) * orbitDirMul;

        const map = this._collisionMap;
        for (let i = 0; i < map.length; i++) map[i] = null;

        // Update geometry and collision map
        for (const sq of this._squares) {
            const curAngle = sq.startAngle + this._globalOrbitAngle;
            const cx = 540 + params.orbitRadius * Math.cos(curAngle);
            const cy = 540 + params.orbitRadius * Math.sin(curAngle);
            const res = sq.resolution;

            for (let x = 0; x < res; x++) {
                for (let y = 0; y < res; y++) {
                    const ent = sq.matrix[x][y];
                    const theta = ent.polar.theta + this._globalSpinAngle;
                    ent.cartesian.x = cx + ent.polar.r * Math.cos(theta);
                    ent.cartesian.y = cy + ent.polar.r * Math.sin(theta);

                    const sx = (ent.cartesian.x + 0.5) | 0;
                    const sy = (ent.cartesian.y + 0.5) | 0;
                    if (sx >= 0 && sx < 1080 && sy >= 0 && sy < 1080) {
                        const idx = sy * 1080 + sx;
                        if (map[idx] === null) {
                            map[idx] = { sq, gx: x, gy: y };
                        } else {
                            const other = map[idx];
                            if (other.sq.id !== sq.id) {
                                const now = frame;
                                const p1 = sq.matrix[x][y];
                                const p2 = other.sq.matrix[other.gx][other.gy];
                                if (now - p1.lastSwap > swapCooldown && now - p2.lastSwap > swapCooldown) {
                                    const t1g1 = sq.grid1[x][y];
                                    sq.grid1[x][y] = other.sq.grid1[other.gx][other.gy];
                                    other.sq.grid1[other.gx][other.gy] = t1g1;
                                    const t1g2 = sq.grid2[x][y];
                                    sq.grid2[x][y] = other.sq.grid2[other.gx][other.gy];
                                    other.sq.grid2[other.gx][other.gy] = t1g2;
                                    p1.lastSwap = now;
                                    p2.lastSwap = now;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Physics + render
        p.background(0);
        for (const sq of this._squares) {
            this._updatePhysics(sq, params);
            const res = sq.resolution;
            for (let x = 0; x < res; x++) {
                for (let y = 0; y < res; y++) {
                    const ent = sq.matrix[x][y];
                    const pulse = Math.max(0, Math.min(1, sq.next1[x][y]));
                    const hue   = sq.next2[x][y];
                    const H = hue * 360;
                    const B = p.map(pulse, 0, 1, 100, 50);
                    p.fill(H, 90, B);
                    p.rect(
                        ent.cartesian.x - ent.drawSize * 0.5,
                        ent.cartesian.y - ent.drawSize * 0.5,
                        ent.drawSize,
                        ent.drawSize
                    );
                }
            }
        }
    }
};
