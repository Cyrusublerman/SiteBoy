document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG & DATA ---
    const CONFIG = {
        canvas: { displayWidth: 800, displayHeight: 800, scale: 120, backgroundColor: '#000000', strokeColor: '#ffffff', lineWidth: 1, pointsPerCurve: 20000 },
        editor: {
            ampRange: { min: -2, max: 2, step: 0.1 },
            freqRange: { min: -300, max: 300, step: 1 },
            powerRange: { min: -7, max: 7, step: 0.1 },
            phaseRange: { min: -6.28, max: 6.28, step: 0.01 }, // ~ -2Pi to 2Pi
            modFreqRange: { min: 0, max: 600, step: 1 },
            deltaAmpRange: { min: -4, max: 4, step: 0.1 },
            deltaFreqRange: { min: -300, max: 300, step: 1 },
            deltaPowerRange: { min: -10, max: 10, step: 0.1 },
            deltaPhaseRange: { min: -12.56, max: 12.56, step: 0.01 }
        }
    };
    const LANDMARKS = [
        { name: "Complex Interference: 300hz", Ax1: 1.7, wx1: 2, px1: 1, Ay1: 1.2, wy1: 2, py1: 1, Mx: -1, wxm1: 75, pxm1: 1, wxm2: 75, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 300, pym2: 1 }, { name: "Asymmetric Flow: 3:5", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 }, { name: "Interference Pattern: 260hz", Ax1: 1.7, wx1: 1, px1: 1, Ay1: 1.2, wy1: 1, py1: 1, Mx: -1, wxm1: 260, pxm1: 1, wxm2: 1, pxm2: 1, My: -1, wym1: 260, pym1: 1, wym2: 2, pym2: 1 }, { name: "Interference Pattern: 200hz", Ax1: 1.7, wx1: 1, px1: 1, Ay1: 1.2, wy1: 1, py1: 1, Mx: -1, wxm1: 2, pxm1: 1, wxm2: 200, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 200, pym2: 1 }, { name: "Woven Bloom: 120hz", Ax1: 2, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 120, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 120, pym2: 1 }, { name: "Modulated Ring: 60hz", Ax1: 1, wx1: 60, px1: 1, Ay1: 1, wy1: 60, py1: 1, Mx: -1, wxm1: 60, pxm1: 1, wxm2: 1, pxm2: 1, Ay2: -1, wy2: 1, py2: 1 }, { name: "Fine Web: 80hz", Ax1: 0.1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 }, { name: "Quintic Static: 500hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 500, px2: 5, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 500, py2: 3 }, { name: "Quintic Filament: 250hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 250, px2: 5, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 250, py2: 3 }, { name: "Spiroform: 3:5", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 3, py1: 1, Ay2: -1, wy2: 5, py2: 1 }, { name: "Involute Rosette: 1:3", Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 }, { name: "Involute Rosette: 1:5", Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 }, { name: "Cubic Spiro: 1:7", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 7, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 3 }, { name: "Asymmetric Flow: 1:5:7", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 1 }, { name: "Asymmetric Flow: 3:5:6", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 6, py2: 1 }, { name: "Cubic Star: 1:2", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 2, py2: 3 }, { name: "Rosette: 1:5", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 }, { name: "Rosette: 1:3", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 }, { name: "Offset Loop: 1:2:3", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 }, { name: "Dense Rosette: 1:10", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 10, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 10, py2: 1 }, { name: "Cubic Weave: 100hz", Ax1: 1, wx1: 1, px1: 3, Ax2: -1, wx2: 100, px2: 3, Ay1: 1, wy1: 1, py1: 3, Ay2: -1, wy2: 100, py2: 3 }, { name: "Warped Field: 100hz", Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 100, pxm1: 1, wxm2: 2, pxm2: 1, Ay2: -1, wy2: 100, py2: 1 }, { name: "Asymmetric Weave: 200hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 100, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 200, py2: 1 }, { name: "Woven Web: 80hz", Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 }, { name: "Cubic Static: 550hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 550, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 550, py2: 3 }, { name: "Cubic Filament: 180hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 180, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 180, py2: 3 }, { name: "Woven Bloom: 120hz (alt)", Ax1: 2, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 120, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 120, pym2: 1 }
    ];

    // --- CLASSES ---
    class HarmonicManifold {
        static checkCoupling(s) {
            const FREQ_TOLERANCE = 0.5;
            const xFreqs = [], yFreqs = [];
            if (Math.abs(s.Ax1) > 0.01) xFreqs.push(s.wx1); if (Math.abs(s.Ax2) > 0.01) xFreqs.push(s.wx2); if (Math.abs(s.Mx) > 0.01) { xFreqs.push(s.wxm1); xFreqs.push(s.wxm2); }
            if (Math.abs(s.Ay1) > 0.01) yFreqs.push(s.wy1); if (Math.abs(s.Ay2) > 0.01) yFreqs.push(s.wy2); if (Math.abs(s.My) > 0.01) { yFreqs.push(s.wym1); yFreqs.push(s.wym2); }
            const shared = xFreqs.filter(xf => yFreqs.some(yf => Math.abs(xf - yf) < FREQ_TOLERANCE));
            const uniqueX = new Set(xFreqs); const uniqueY = new Set(yFreqs);
            const coupling = shared.length / Math.max(uniqueX.size, uniqueY.size, 1);
            return { valid: shared.length > 0, message: `Coupling: ${(coupling*100).toFixed(0)}%` };
        }
        static checkIntegerFrequencies(s) {
            const freqs = [s.wx1, s.wx2, s.wy1, s.wy2, s.wxm1, s.wxm2, s.wym1, s.wym2].filter(f => f !== undefined);
            const allIntegers = freqs.every(f => Math.abs(f - Math.round(f)) < 0.01);
            return { valid: allIntegers, message: allIntegers ? "Integer Frequencies" : "Non-Integer Freq" };
        }
    }
    class UniversalEquation {
        constructor(params) { Object.assign(this, params); }
        evaluate(t) {
            const safePow = (base, exp) => {
                if (Math.abs(base) < 1e-9 && exp < 0) return 0;
                return Math.sign(base) * Math.pow(Math.abs(base), exp);
            };
            const rot = (this.rotation || 0) * Math.PI / 180;
            const cosRot = Math.cos(rot);
            const sinRot = Math.sin(rot);
            const rotatedCos = (w, phase, time) => Math.cos(w * time + phase) * cosRot - Math.sin(w * time + phase) * sinRot;
            const rotatedSin = (w, phase, time) => Math.sin(w * time + phase) * cosRot + Math.cos(w * time + phase) * sinRot;
            const p = this;
            const x = p.Ax1 * safePow(rotatedCos(p.wx1, p.phi_x1, t), p.px1) +
                      p.Ax2 * safePow(rotatedCos(p.wx2, p.phi_x2, t), p.px2) +
                      p.Mx * safePow(rotatedCos(p.wxm1, p.phi_xm1, t), p.pxm1) * safePow(rotatedSin(p.wxm2, p.phi_xm2, t), p.pxm2);
            const y = p.Ay1 * safePow(rotatedSin(p.wy1, p.phi_y1, t), p.py1) +
                      p.Ay2 * safePow(rotatedSin(p.wy2, p.phi_y2, t), p.py2) +
                      p.My * safePow(rotatedSin(p.wym1, p.phi_ym1, t), p.pym1) * safePow(rotatedCos(p.wym2, p.phi_ym2, t), p.pym2);
            if (this.rotation && this.rotation !== 0) {
                return { x: x * cosRot - y * sinRot, y: x * sinRot + y * cosRot };
            }
            return { x, y };
        }
    }
    class Renderer {
        constructor(canvas, config) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.config = config; this.setupCanvas(); }
        setupCanvas() { this.canvas.width = this.config.displayWidth; this.canvas.height = this.config.displayHeight; }
        draw(equation) {
            const { displayWidth, displayHeight, scale, backgroundColor, strokeColor, lineWidth, pointsPerCurve } = this.config;
            this.ctx.fillStyle = backgroundColor; this.ctx.fillRect(0, 0, displayWidth, displayHeight);
            this.ctx.strokeStyle = strokeColor; this.ctx.lineWidth = lineWidth; this.ctx.beginPath();
            let started = false;
            for (let i = 0; i <= pointsPerCurve; i++) {
                const t = (i / pointsPerCurve) * 2 * Math.PI;
                const { x, y } = equation.evaluate(t);
                if (!isFinite(x) || !isFinite(y)) { started = false; continue; }
                const screenX = displayWidth / 2 + x * scale;
                const screenY = displayHeight / 2 - y * scale;
                if (!started) { this.ctx.moveTo(screenX, screenY); started = true; } else { this.ctx.lineTo(screenX, screenY); }
            }
            this.ctx.stroke();
        }
    }

    // --- DOM ELEMENT CACHE ---
    const dom = {
        canvas: document.getElementById('canvas'),
        equationDisplay: document.getElementById('equation-display'),
        editorGrid: document.getElementById('editor-grid'),
        globalControls: document.getElementById('global-controls'),
        analysis: document.getElementById('analysis'),
        templateSelect: document.getElementById('template-select'),
        undoBtn: document.getElementById('undo-btn'),
        resetYBtn: document.getElementById('reset-y-btn'),
        exportBtn: document.getElementById('export-btn'),
        statusBar: document.getElementById('status-bar')
    };

    // --- STATE MANAGEMENT ---
    const renderer = new Renderer(dom.canvas, CONFIG.canvas);
    let historyStack = [];
    let paramState = {};
    const controls = {};
    let renderTimeout;

    const paramConfig = [
        { label: "A₁", x: "Ax1", y: "Ay1_delta", x_range: CONFIG.editor.ampRange, y_range: CONFIG.editor.deltaAmpRange }, { label: "ω₁", x: "wx1", y: "wy1_delta", x_range: CONFIG.editor.freqRange, y_range: CONFIG.editor.deltaFreqRange }, { label: "p₁", x: "px1", y: "py1_delta", x_range: CONFIG.editor.powerRange, y_range: CONFIG.editor.deltaPowerRange, isPower: true }, { label: "φ₁", x: "phi_x1", y: "phi_y1_delta", x_range: CONFIG.editor.phaseRange, y_range: CONFIG.editor.deltaPhaseRange }, { label: "A₂", x: "Ax2", y: "Ay2_delta", x_range: CONFIG.editor.ampRange, y_range: CONFIG.editor.deltaAmpRange }, { label: "ω₂", x: "wx2", y: "wy2_delta", x_range: CONFIG.editor.freqRange, y_range: CONFIG.editor.deltaFreqRange }, { label: "p₂", x: "px2", y: "py2_delta", x_range: CONFIG.editor.powerRange, y_range: CONFIG.editor.deltaPowerRange, isPower: true }, { label: "φ₂", x: "phi_x2", y: "phi_y2_delta", x_range: CONFIG.editor.phaseRange, y_range: CONFIG.editor.deltaPhaseRange }, { label: "M", x: "Mx", y: "My", x_range: CONFIG.editor.ampRange, y_range: CONFIG.editor.ampRange }, { label: "ωₘ₁", x: "wxm1", y: "wym1_delta", x_range: CONFIG.editor.modFreqRange, y_range: CONFIG.editor.deltaFreqRange }, { label: "pₘ₁", x: "pxm1", y: "pym1", x_range: CONFIG.editor.powerRange, y_range: CONFIG.editor.powerRange, isPower: true }, { label: "φₘ₁", x: "phi_xm1", y: "phi_ym1_delta", x_range: CONFIG.editor.phaseRange, y_range: CONFIG.editor.deltaPhaseRange }, { label: "ωₘ₂", x: "wxm2", y: "wym2_delta", x_range: CONFIG.editor.modFreqRange, y_range: CONFIG.editor.deltaFreqRange }, { label: "pₘ₂", x: "pxm2", y: "pym2", x_range: CONFIG.editor.powerRange, y_range: CONFIG.editor.powerRange, isPower: true }, { label: "φₘ₂", x: "phi_xm2", y: "phi_ym2_delta", x_range: CONFIG.editor.phaseRange, y_range: CONFIG.editor.deltaPhaseRange },
    ];
    const globalConfig = [
        { label: "Rotation", key: "rotation", range: { min: 0, max: 360, step: 1 } }, { label: "Scale", key: "scale", range: { min: 20, max: 300, step: 5 } }, { label: "Points", key: "pointsPerCurve", range: { min: 1000, max: 80000, step: 1000 } }
    ];

    // --- CORE FUNCTIONS ---
    function getFinalParams() {
        const p = paramState;
        return {
            Ax1: p.Ax1, wx1: p.wx1, px1: p.px1, phi_x1: p.phi_x1, Ax2: p.Ax2, wx2: p.wx2, px2: p.px2, phi_x2: p.phi_x2, Ay1: p.Ax1 + p.Ay1_delta, wy1: p.wx1 + p.wy1_delta, py1: p.px1 + p.py1_delta, phi_y1: p.phi_x1 + p.phi_y1_delta, Ay2: p.Ax2 + p.Ay2_delta, wy2: p.wx2 + p.wy2_delta, py2: p.px2 + p.py2_delta, phi_y2: p.phi_x2 + p.phi_y2_delta, Mx: p.Mx, wxm1: p.wxm1, pxm1: p.pxm1, phi_xm1: p.phi_xm1, wxm2: p.wxm2, pxm2: p.pxm2, phi_xm2: p.phi_xm2, My: p.My, wym1: p.wxm1 + p.wym1_delta, pym1: p.pym1, phi_ym1: p.phi_xm1 + p.phi_ym1_delta, wym2: p.wxm2 + p.wym2_delta, pym2: p.pym2, phi_ym2: p.phi_xm2 + p.phi_ym2_delta, rotation: p.rotation
        };
    }
    function redraw(isDebounced = false) {
        clearTimeout(renderTimeout);
        const points = CONFIG.canvas.pointsPerCurve;
        const delay = (points > 30000 && isDebounced) ? 200 : 0;
        renderTimeout = setTimeout(() => {
            const startTime = performance.now();
            const finalParams = getFinalParams();
            renderer.draw(new UniversalEquation(finalParams));
            const endTime = performance.now();
            const checks = { integers: HarmonicManifold.checkIntegerFrequencies(finalParams), coupling: HarmonicManifold.checkCoupling(finalParams) };
            const checkHTML = (check) => `<span class="${check.valid ? 'invariant-ok' : 'invariant-warn'}">■ ${check.message}</span>`;
            dom.analysis.innerHTML = `${checkHTML(checks.integers)}<br>${checkHTML(checks.coupling)}`;
            dom.statusBar.textContent = `Rendered ${points} points in ${(endTime - startTime).toFixed(1)} ms.`;
            updateEquationDisplay();
        }, delay);
    }
    function updateEquationDisplay() {
        const p = getFinalParams();
        const fmt = (n) => (Math.abs(n - Math.round(n)) < 0.01) ? Math.round(n) : n.toFixed(1);
        const formatPhase = (rad) => {
            if (Math.abs(rad) < 0.01) return "0";
            const multiple = rad / Math.PI;
            if (Math.abs(multiple - Math.round(multiple)) < 0.01) {
                if (Math.round(multiple) === 1) return "π";
                if (Math.round(multiple) === -1) return "-π";
                return `${Math.round(multiple)}π`;
            }
            if (Math.abs(multiple*2 - Math.round(multiple*2)) < 0.01) return `${Math.round(multiple*2)}π/2`;
            if (Math.abs(multiple*4 - Math.round(multiple*4)) < 0.01) return `${Math.round(multiple*4)}π/4`;
            return `${multiple.toFixed(2)}π`;
        };
        const term = (A, w, pow, phi, fn) => {
            if (Math.abs(A) < 0.01) return '';
            const sign = A > 0 ? ' + ' : ' - ';
            const ampStr = Math.abs(Math.abs(A) - 1) < 0.01 ? '' : `${fmt(Math.abs(A))}`;
            const powStr = Math.abs(pow - 1) < 0.01 ? '' : `<sup>${fmt(pow)}</sup>`;
            const phiStr = Math.abs(phi) < 0.01 ? '' : (phi > 0 ? `+${formatPhase(phi)}` : `${formatPhase(phi)}`);
            return `${sign}${ampStr}${fn}${powStr}(${fmt(w)}t${phiStr})`;
        };
        const modTerm = (M, w1, p1, phi1, w2, p2, phi2, fn1, fn2) => {
            if (Math.abs(M) < 0.01) return '';
            return ` ${M > 0 ? '+' : '-'} ${fmt(Math.abs(M))}${fn1}*${fn2}`; // Abbreviate mix term for display
        };
        let xEq = [term(p.Ax1, p.wx1, p.px1, p.phi_x1, 'cos'), term(p.Ax2, p.wx2, p.px2, p.phi_x2, 'cos'), modTerm(p.Mx, p.wxm1, p.pxm1, p.phi_xm1, p.wxm2, p.pxm2, p.phi_xm2, 'cos', 'sin')].filter(s => s).join('').replace(/^ \+ /, '');
        let yEq = [term(p.Ay1, p.wy1, p.py1, p.phi_y1, 'sin'), term(p.Ay2, p.wy2, p.py2, p.phi_y2, 'sin'), modTerm(p.My, p.wym1, p.pym1, p.phi_ym1, p.wym2, p.pym2, p.phi_ym2, 'sin', 'cos')].filter(s => s).join('').replace(/^ \+ /, '');
        if (!xEq) xEq = '0'; if (!yEq) yEq = '0';
        let finalHTML = `x(t) = ${xEq}<br>y(t) = ${yEq}`;
        if (p.rotation !== 0) finalHTML += `<br>Rotation: ${p.rotation}°`;
        dom.equationDisplay.innerHTML = finalHTML;
    }
    function pushToHistory() {
        historyStack.push(JSON.parse(JSON.stringify({ state: paramState, config: CONFIG.canvas })));
        if (historyStack.length > 50) historyStack.shift();
        dom.undoBtn.disabled = false;
    }
    function undo() {
        if (historyStack.length === 0) return;
        const last = historyStack.pop();
        paramState = last.state; CONFIG.canvas = last.config;
        updateAllControls(); redraw();
        dom.undoBtn.disabled = historyStack.length === 0;
    }
    
    // --- UI CREATION ---
    function createParamControl(key, range, isGlobal = false) {
        const container = document.createElement('div');
        container.className = 'controls';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = range.min; slider.max = range.max; slider.step = range.step;
        const number = document.createElement('input');
        number.type = 'number';
        number.min = range.min; number.max = range.max; number.step = range.step;
        const updateState = (valStr, isDebounced) => {
            let val = parseFloat(valStr) || 0;
            if (controls[key] && controls[key].isInt) val = Math.round(val);
            val = Math.max(range.min, Math.min(range.max, val));
            if (isGlobal) {
                if(key === 'pointsPerCurve') CONFIG.canvas.pointsPerCurve = val;
                else if(key === 'scale') paramState.scale = val;
                else if(key === 'rotation') paramState.rotation = val;
            } else { paramState[key] = val; }
            slider.value = val;
            number.value = val.toFixed(range.step < 0.1 ? 2 : (range.step < 1 ? 1 : 0));
            redraw(isDebounced);
        };
        slider.addEventListener('input', e => updateState(e.target.value, true));
        slider.addEventListener('change', () => { redraw(false); pushToHistory(); });
        number.addEventListener('change', e => { updateState(e.target.value, false); pushToHistory(); });
        container.append(slider, number);
        controls[key] = { slider, numberInput: number, update: (v) => updateState(String(v), false), isInt: false };
        return container;
    }
    function createEditor() {
        paramConfig.forEach(p => {
            const label = document.createElement('div');
            label.className = 'param-label';
            label.textContent = p.label;
            const controlsX = createParamControl(p.x, p.x_range);
            const controlsY = p.y ? createParamControl(p.y, p.y_range) : document.createElement('div');
            if (p.isPower) {
                const intBtn = document.createElement('button');
                intBtn.textContent = 'I'; intBtn.className = 'tool-btn';
                intBtn.title = 'Lock to Integer';
                const setupIntLock = (key, btn) => {
                    const ctrl = controls[key];
                    btn.addEventListener('click', () => {
                        ctrl.isInt = !ctrl.isInt;
                        btn.classList.toggle('active', ctrl.isInt);
                        ctrl.update(ctrl.numberInput.value); // Re-validate and snap
                        pushToHistory();
                    });
                }
                setupIntLock(p.x, intBtn);
                controlsX.appendChild(intBtn);
                if (p.y && controls[p.y]) { // Also for Y if it's a delta
                    const intBtnY = intBtn.cloneNode(true);
                    setupIntLock(p.y, intBtnY);
                    controlsY.appendChild(intBtnY);
                }
            }
            dom.editorGrid.append(label, controlsX, controlsY);
        });
        globalConfig.forEach(gc => {
            const label = document.createElement('div');
            label.className = 'param-label';
            label.textContent = gc.label;
            const control = createParamControl(gc.key, gc.range, true);
            dom.globalControls.append(label, control);
        });
    }

    // --- INIT & EVENT LISTENERS ---
    function getDefaultState() {
        const state = {};
        paramConfig.forEach(p => {
            state[p.x] = (p.x.startsWith('p') && p.x.length < 5) ? 1 : 0;
            if (p.y) state[p.y] = (p.y.startsWith('p') && p.y.length < 5) ? 1 : 0;
        });
        globalConfig.forEach(g => state[g.key] = 0);
        return state;
    }
    function updateAllControls() {
        Object.keys(controls).forEach(key => {
            let val = (CONFIG.canvas[key] !== undefined) ? CONFIG.canvas[key] : paramState[key];
            if (val !== undefined && controls[key]) controls[key].update(val);
        });
    }
    function initialize() {
        paramState = getDefaultState();
        paramState.scale = 120;
        paramState.Ax1 = 1; paramState.wx1 = 1; paramState.px1 = 1;
        createEditor();
        updateAllControls();
        redraw();
        dom.undoBtn.addEventListener('click', undo);
        dom.resetYBtn.addEventListener('click', () => {
             pushToHistory();
             Object.keys(paramState).forEach(k => { if(k.includes('delta') || k === 'My' || k === 'pym1' || k === 'pym2') paramState[k] = 0; });
             paramState.pym1 = paramState.pxm1; paramState.pym2 = paramState.pxm2;
             updateAllControls(); redraw();
        });
        dom.exportBtn.addEventListener('click', () => { /* Export logic */ });
        LANDMARKS.forEach((landmark, index) => {
            const option = document.createElement('option');
            option.value = index; option.textContent = landmark.name;
            dom.templateSelect.appendChild(option);
        });
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a Landmark...';
        dom.templateSelect.prepend(defaultOption);
        dom.templateSelect.selectedIndex = 0;
        dom.templateSelect.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index !== '' && LANDMARKS[index]) {
                pushToHistory();
                const landmark = LANDMARKS[index];
                paramState = getDefaultState();
                Object.keys(landmark).forEach(key => {
                    const pConf = paramConfig.find(p => (p.x === key || (p.y && p.y.replace('_delta', '') === key) || p.y === key));
                    if (!pConf) return;
                    if (pConf.x === key) paramState[key] = landmark[key];
                    else if (pConf.y && pConf.y.replace('_delta', '') === key) { paramState[pConf.y] = landmark[key] - (landmark[pConf.x] || 0);
                    } else if (pConf.y === key) { paramState[key] = landmark[key]; }
                });
                updateAllControls(); redraw();
            }
        });
        historyStack = [];
        dom.undoBtn.disabled = true;
    }

    initialize();
});