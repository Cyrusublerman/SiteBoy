/**
 * Clockwise - p5.js Generator
 *
 * N pixel-grid squares orbit a central point on a circular path while
 * spinning about their own centres. Each square carries two physics fields
 * (pulse and hue). When squares overlap, field values are exchanged.
 *
 * @version 1.1.0
 */

export const SCRIPT_CONFIG = {
    id: 'clockwise',
    title: 'Clockwise',
    category: 'other',
    description: 'Orbiting pixel squares with internal cellular wave physics. Overlapping squares swap field values, blending colours and pulse patterns.',
    version: '1.1.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Clockwise models N pixel-grid squares (N = numSquares, 2–12) orbiting a fixed canvas centre on a circular path of radius orbitRadius, each simultaneously spinning about its own centre. The mathematical basis is polar coordinate composition: each cell within a square is defined at build time by its local polar coordinates (r, θ₀) relative to the square pivot. Each frame the pivot is placed on the orbit circle via cx = 540 + orbitRadius · cos(startAngle + globalOrbitAngle), and every cell world position is computed as worldX = cx + r · cos(θ₀ + globalSpinAngle). Orbit and spin accumulate independently, making the two rotational degrees of freedom fully decoupled. Each square carries two independent scalar field grids — a pulse field (grid1, drives brightness) and a hue field (grid2). Both evolve via a discrete diffusion equation each frame using a 3×3 neighbourhood average, a weighted neighbourhood difference, and a global decay factor. The hue field has a per-square identity bias that pulls hue back toward its characteristic value. When two squares map to the same canvas pixel, their field values are exchanged — cross-contaminating pulse and hue. A cooldown gate prevents repeated swaps during sustained overlap. Colour organisation emerges from the interplay between diffusion (spreading hue) and identity force (anchoring hue) during contact and separation. Algorithm origin: discrete reaction-diffusion class (related to Turing / Gray-Scott models in structure). Scope: no 3D projection, true two-species reaction-diffusion, physical collision, rigid-body dynamics, or audio reactivity.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Functions: _needsRebuild(params) — O(1) rebuild check; returns true if numSquares or orbitRadius changed. _buildSquares(p,params) — O(N·res²); computes chord geometry, resolution, cell size, per-cell polar coordinates, initialises physics grids. _getAvg(g,x,y,res,wrap) — O(9); arithmetic mean of 3×3 neighbourhood with optional toroidal wrap. _sampleDiff(g,x,y,res,wrap) — O(8); weighted mean of absolute differences; cardinal neighbours weight 1.0, diagonals 0.5. _updatePhysics(sq,params) — O(res²); advances grid1 and grid2 by one step; swaps active/buffer arrays. p5Setup(p,params) — initialises colour mode, builds squares, allocates sparse collision map. p5Draw(p,params,frame) — per-frame entry: rebuild check, angle advance, collision clear, geometry + collision detection + field swaps, physics update, render. Geometry: angleStep = 2π/numSquares; chordLen = 2·orbitRadius·sin(angleStep/2); sideLength = round((2√2·chordLen)/3); resolution = clamp(round(sideLength/3), 48, 180); cellSize = sideLength/resolution. Cell polar coords (build time): lx=(x−offset+0.5)·cellSize; ly=(y−offset+0.5)·cellSize; r=√(lx²+ly²); θ₀=atan2(ly,lx). Square orbit position: curAngle = startAngle + globalOrbitAngle; cx = 540 + orbitRadius·cos(curAngle); cy = 540 + orbitRadius·sin(curAngle). Cell world position: theta = θ₀ + globalSpinAngle; worldX = cx + r·cos(theta); worldY = cy + r·sin(theta). Pulse physics (grid1): raw = (v1 + (avg1−v1)·cohesion + diff1·growthFactor·damping)·waveDecay; next1[x][y] = clamp(raw, 0, 1); cohesion = 0.1 hardcoded. Hue physics (grid2): phys = ((v2 + (avg2−v2)·cohesion + diff2·growthFactor·damping) mod 1.0 + 1.0) mod 1.0; next2[x][y] = phys + (bias − phys)·identityForce; bias = i/numSquares. Rendering: H = hue·360; B = map(pulse, 0, 1, 100, 50); S = 90 (fixed); drawSize = max(1.25, cellSize·1.15) — 15% larger than cell to minimise gaps.'
        },
        {
            heading: 'PARAMETERS',
            body: 'System — numSquares: slider 2–12 step 1 default 8; number of orbiting squares; determines chord geometry, sideLength, resolution; changing triggers a full rebuild and angle reset. orbitRadius: slider 100–540 step 20 default 540; radius of orbit circle in pixels; changing alters chord and resolution; triggers rebuild; at 540 the orbit edge reaches the canvas boundary. Motion — orbitSpeed: slider 0.1–5 step 0.1 default 1; orbit angular advance per frame in degrees; at 1°/frame and 30fps one revolution takes 12 seconds. spinSpeed: slider 0.1–5 step 0.1 default 1; self-rotation advance per frame in degrees; independent of orbit speed and direction. orbitDir: dropdown CW|CCW default CCW; sets sign of orbit angular velocity; CCW multiplies by −1. Physics — growthFactor: slider 0.5–5 step 0.1 default 2.0; amplifies diffusion contribution in both fields (diff·growthFactor·damping); effective diffusion coefficient = growthFactor·damping. damping: slider 0.01–0.5 step 0.01 default 0.15; secondary scale on diffusion term; lower values slow spatial spread independently of growthFactor. waveDecay: slider 0.8–0.99 step 0.01 default 0.96; per-frame multiplicative decay applied to pulse field only; near 1 preserves pulse energy for many frames. identityForce: slider 0–0.1 step 0.005 default 0.01; pull rate at which each square hue returns to its identity hue (bias = squareIndex/numSquares); at 0 hue drifts freely; at 0.1 hue returns within a few frames of separation. swapCooldown: slider 5–60 step 5 default 20; minimum frames between successive field swaps for the same cell; prevents repeated swaps during sustained overlap. wrapAround: dropdown on|off default on; controls neighbourhood topology; on = toroidal edges; off = clamp-to-boundary.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic — numSquares 8, orbitRadius 540, orbitSpeed 1, spinSpeed 1, orbitDir CCW, growthFactor 2.0, damping 0.15, waveDecay 0.96, identityForce 0.01, swapCooldown 20, wrapAround on. Baseline: 8 large squares at full orbit, moderate speed and diffusion, mild identity anchor; each square maintains a characteristic hue with gentle diffusion. Default entry state. Turbulent — numSquares 6, orbitRadius 400, orbitSpeed 2, spinSpeed 2, orbitDir CCW, growthFactor 3.5, damping 0.2, waveDecay 0.94, identityForce 0.005, swapCooldown 10, wrapAround on. High energy: faster motion, stronger diffusion, rapid pulse decay, very weak identity; colour mixes aggressively during contact and fades quickly in isolation. Calm — numSquares 4, orbitRadius 300, orbitSpeed 0.5, spinSpeed 0.5, orbitDir CW, growthFactor 1.0, damping 0.08, waveDecay 0.98, identityForce 0.02, swapCooldown 30, wrapAround on. Low energy: fewer, slower squares at smaller orbit; very slow diffusion; pulse persists for many frames; stronger identity anchor; CW direction reverses visual rotation sense.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(N·res²) per frame where N = numSquares (2–12) and res = grid resolution per square (48–180, derived from orbit geometry). Peak load at numSquares=6, orbitRadius=540 (res≈169): ~171,000 cells, ~5.8M neighbourhood reads per frame, ~171,000 p.rect() calls. Frame budget at 30fps: 33.3ms; estimated peak cost 19–46ms — frame drops likely on lower-end hardware at worst-case settings. Collision map uses a sparse JS Map keyed by pixel index (cleared per-frame via map.clear()), reducing the O(1.17M) flat-array null-fill to O(active cells) ≈ O(N·res²). During slider interaction, ComputeScheduler Tier 2 renders at 50% linear scale (25% pixel count) for real-time feedback.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite — runs continuously with no terminal frame or defined loop point. Frame-driven: globalOrbitAngle and globalSpinAngle accumulate each frame by radians(orbitSpeed)·orbitDirMul and radians(spinSpeed) respectively. Default 30fps. Deterministic: no Math.random() — same initial state and same parameters always produce identical frame output. Export: PNG available. GIF and WebM not available — no defined loop point, so no bounded export cycle. Animatable parameters (smooth to sweep without rebuild): orbitSpeed, spinSpeed, growthFactor, damping, waveDecay, identityForce. Parameters numSquares and orbitRadius trigger a full rebuild on change and reset orbital angles — not suitable for smooth animation.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Rebuild parameters (numSquares, orbitRadius): adjusting either live resets orbital and spin angles to zero, producing a visible snap back to starting position. Grid resolution is not user-adjustable; it is derived from orbit geometry and clamped to [48, 180]. At growthFactor·damping > 1 the pulse field amplifies rather than merely diffuses; values are clamped at physics write time. Collision detection is first-writer-only: in dense overlap zones where three or more squares share a pixel, the third square swaps with the first-frame occupant rather than the most recent one, producing a mild mixing bias in high-density scenarios. At swapCooldown=5 and sustained overlap, cells swap approximately 6 times per second, which can produce flickering colour patterns. Canvas is fixed 1080×1080; viewport fit/fill/actual and zoom behaviour is managed by the host.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm origin: discrete two-field cellular diffusion with identity restoration — related to Turing / Gray-Scott reaction-diffusion class; neighbourhood averaging + weighted difference amplification is a simplified discrete Laplacian diffusion operator. Orbital placement: standard polar-to-Cartesian coordinate composition. Version 1.1.0: rendering lag bug fixed (render reads post-physics buffer grid1/grid2 instead of pre-physics next1/next2); pulse clamp added to physics step; sparse Map collision map; infoSections added; animatableParams declared in animation block; GIF export corrected to false.'
        }
    ],

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
            values: {
                numSquares: 8, orbitRadius: 540, orbitSpeed: 1, spinSpeed: 1, orbitDir: 'CCW',
                growthFactor: 2.0, damping: 0.15, waveDecay: 0.96, identityForce: 0.01, swapCooldown: 20, wrapAround: 'on'
            }
        },
        {
            name: 'Turbulent',
            values: {
                numSquares: 6, orbitRadius: 400, orbitSpeed: 2, spinSpeed: 2, orbitDir: 'CCW',
                growthFactor: 3.5, damping: 0.2, waveDecay: 0.94, identityForce: 0.005, swapCooldown: 10, wrapAround: 'on'
            }
        },
        {
            name: 'Calm',
            values: {
                numSquares: 4, orbitRadius: 300, orbitSpeed: 0.5, spinSpeed: 0.5, orbitDir: 'CW',
                growthFactor: 1.0, damping: 0.08, waveDecay: 0.98, identityForce: 0.02, swapCooldown: 30, wrapAround: 'on'
            }
        }
    ],

    animation: {
        type: 'infinite',
        defaultFps: 30,
        animatableParams: ['orbitSpeed', 'spinSpeed', 'growthFactor', 'damping', 'waveDecay', 'identityForce'],
        sequencer: true,
    },

    export: { png: true, gif: false, webm: false },

    // Tier 2 adaptive resolution: reduces pixel count 75% during slider interaction.
    // Tier 3 (worker) blocked: render pass requires p5 instance on main thread.
    compute: {
        cost: 'particle',
        interactionScale: 0.5,
        idleDelay: 200,
    },

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
                const raw1 = (v1 + (a1 - v1) * cohesion + d1 * growthFactor * damping) * waveDecay;
                sq.next1[x][y] = raw1 < 0 ? 0 : raw1 > 1 ? 1 : raw1;

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
        this._collisionMap = new Map();
        this._globalOrbitAngle = 0;
        this._globalSpinAngle  = 0;
        this._lastParams = { ...params };
    },

    p5Draw(p, params, frame) {
        if (this._needsRebuild(params)) {
            this._squares = this._buildSquares(p, params);
            this._collisionMap = new Map();
            this._globalOrbitAngle = 0;
            this._globalSpinAngle  = 0;
            this._lastParams = { ...params };
        }

        const { orbitSpeed, spinSpeed, orbitDir, swapCooldown } = params;
        const orbitDirMul = orbitDir === 'CCW' ? -1 : 1;

        this._globalSpinAngle  += p.radians(spinSpeed);
        this._globalOrbitAngle += p.radians(orbitSpeed) * orbitDirMul;

        const map = this._collisionMap;
        map.clear();

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
                        if (!map.has(idx)) {
                            map.set(idx, { sq, gx: x, gy: y });
                        } else {
                            const other = map.get(idx);
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

        p.background(0);
        for (const sq of this._squares) {
            this._updatePhysics(sq, params);
            const res = sq.resolution;
            for (let x = 0; x < res; x++) {
                for (let y = 0; y < res; y++) {
                    const ent = sq.matrix[x][y];
                    const pulse = Math.max(0, Math.min(1, sq.grid1[x][y]));
                    const hue   = sq.grid2[x][y];
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
