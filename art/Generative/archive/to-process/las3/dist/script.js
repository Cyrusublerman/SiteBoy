const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const equationEl = document.getElementById('equation');

const SIZE = 540;
const SCALE = 405;
const POINTS = 20000;
const CENTER = SIZE / 2;

canvas.width = SIZE;
canvas.height = SIZE;

const RULES = {
    A: { min: -1, max: 1, step: 0.02 },
    w: { min: -250, max: 250, step: 1, integer: true },
    p: { min: 0, max: 5, step: 1, integer: true },
    phi: { min: -2, max: 2, step: 0.1, pi: true },
    M: { min: -1, max: 1, step: 0.02 }
};

const state = {
    Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
    Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
    Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0,
    Ay1_delta: 0, wy1_delta: 0, py1_delta: 0, phi_y1_delta: 0,
    Ay2_delta: 0, wy2_delta: 0, py2_delta: 0, phi_y2_delta: 0,
    My_delta: 0, wym1_delta: 0, pym1_delta: 0, phi_ym1_delta: 0,
    wym2_delta: 0, pym2_delta: 0, phi_ym2_delta: 0
};

let currentVar = null;
let targetValue = 0;
let animating = false;

const varSequence = [
    { name: 'Ax1', type: 'A' },
    { name: 'wx1', type: 'w' },
    { name: 'px1', type: 'p' },
    { name: 'phi_x1', type: 'phi' },
    { name: 'Ax2', type: 'A' },
    { name: 'wx2', type: 'w' },
    { name: 'px2', type: 'p' },
    { name: 'phi_x2', type: 'phi' },
    { name: 'Mx', type: 'M' },
    { name: 'wxm1', type: 'w' },
    { name: 'pxm1', type: 'p' },
    { name: 'phi_xm1', type: 'phi' },
    { name: 'wxm2', type: 'w' },
    { name: 'pxm2', type: 'p' },
    { name: 'phi_xm2', type: 'phi' },
    { name: 'Ay1_delta', type: 'A' },
    { name: 'wy1_delta', type: 'w' },
    { name: 'py1_delta', type: 'p' },
    { name: 'phi_y1_delta', type: 'phi' },
    { name: 'Ay2_delta', type: 'A' },
    { name: 'wy2_delta', type: 'w' },
    { name: 'py2_delta', type: 'p' },
    { name: 'phi_y2_delta', type: 'phi' },
    { name: 'My_delta', type: 'M' },
    { name: 'wym1_delta', type: 'w' },
    { name: 'pym1_delta', type: 'p' },
    { name: 'phi_ym1_delta', type: 'phi' },
    { name: 'wym2_delta', type: 'w' },
    { name: 'pym2_delta', type: 'p' },
    { name: 'phi_ym2_delta', type: 'phi' }
];

let varIndex = 0;

function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    return Math.sign(base) * Math.pow(Math.abs(base), exp);
}

function evaluate(t) {
    const x = state.Ax1 * safePow(Math.cos(state.wx1 * t + state.phi_x1 * Math.PI), state.px1) +
              state.Ax2 * safePow(Math.cos(state.wx2 * t + state.phi_x2 * Math.PI), state.px2) +
              state.Mx * safePow(Math.cos(state.wxm1 * t + state.phi_xm1 * Math.PI), state.pxm1) *
                         safePow(Math.sin(state.wxm2 * t + state.phi_xm2 * Math.PI), state.pxm2);
    
    const Ay1 = state.Ax1 + state.Ay1_delta;
    const wy1 = state.wx1 + state.wy1_delta;
    const py1 = state.px1 + state.py1_delta;
    const phi_y1 = state.phi_x1 + state.phi_y1_delta;
    
    const Ay2 = state.Ax2 + state.Ay2_delta;
    const wy2 = state.wx2 + state.wy2_delta;
    const py2 = state.px2 + state.py2_delta;
    const phi_y2 = state.phi_x2 + state.phi_y2_delta;
    
    const My = state.Mx + state.My_delta;
    const wym1 = state.wxm1 + state.wym1_delta;
    const pym1 = state.pxm1 + state.pym1_delta;
    const phi_ym1 = state.phi_xm1 + state.phi_ym1_delta;
    const wym2 = state.wxm2 + state.wym2_delta;
    const pym2 = state.pxm2 + state.pym2_delta;
    const phi_ym2 = state.phi_xm2 + state.phi_ym2_delta;
    
    const y = Ay1 * safePow(Math.sin(wy1 * t + phi_y1 * Math.PI), py1) +
              Ay2 * safePow(Math.sin(wy2 * t + phi_y2 * Math.PI), py2) +
              My * safePow(Math.sin(wym1 * t + phi_ym1 * Math.PI), pym1) *
                   safePow(Math.cos(wym2 * t + phi_ym2 * Math.PI), pym2);
    
    return { x, y };
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    let started = false;
    let firstPoint = null;
    
    for (let i = 0; i <= POINTS; i++) {
        const t = (i / POINTS) * 2 * Math.PI;
        const { x, y } = evaluate(t);
        
        if (!isFinite(x) || !isFinite(y)) {
            started = false;
            continue;
        }
        
        const screenX = CENTER + x * SCALE;
        const screenY = CENTER - y * SCALE;
        
        if (!started) {
            ctx.moveTo(screenX, screenY);
            firstPoint = { x: screenX, y: screenY };
            started = true;
        } else {
            ctx.lineTo(screenX, screenY);
        }
    }
    
    if (firstPoint && started) {
        ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    
    ctx.stroke();
}

function updateEquation() {
    const fmt = n => Math.abs(n) < 0.01 ? '0' : (Math.abs(n - Math.round(n)) < 0.01 ? Math.round(n) : n.toFixed(2));
    const fmtPhi = n => {
        if (Math.abs(n) < 0.01) return '';
        const sign = n > 0 ? '+' : '';
        return `${sign}${fmt(n)}π`;
    };
    
    const Ay1 = state.Ax1 + state.Ay1_delta;
    const wy1 = state.wx1 + state.wy1_delta;
    const py1 = state.px1 + state.py1_delta;
    const phi_y1 = state.phi_x1 + state.phi_y1_delta;
    
    const Ay2 = state.Ax2 + state.Ay2_delta;
    const wy2 = state.wx2 + state.wy2_delta;
    const py2 = state.px2 + state.py2_delta;
    const phi_y2 = state.phi_x2 + state.phi_y2_delta;
    
    const My = state.Mx + state.My_delta;
    const wym1 = state.wxm1 + state.wym1_delta;
    const pym1 = state.pxm1 + state.pym1_delta;
    const phi_ym1 = state.phi_xm1 + state.phi_ym1_delta;
    const wym2 = state.wxm2 + state.wym2_delta;
    const pym2 = state.pxm2 + state.pym2_delta;
    const phi_ym2 = state.phi_xm2 + state.phi_ym2_delta;
    
    let xEq = `x(t) = ${fmt(state.Ax1)}cos^${fmt(state.px1)}(${fmt(state.wx1)}t${fmtPhi(state.phi_x1)})`;
    if (Math.abs(state.Ax2) > 0.01) {
        xEq += ` ${state.Ax2 > 0 ? '+' : ''}${fmt(state.Ax2)}cos^${fmt(state.px2)}(${fmt(state.wx2)}t${fmtPhi(state.phi_x2)})`;
    }
    if (Math.abs(state.Mx) > 0.01) {
        xEq += ` ${state.Mx > 0 ? '+' : ''}${fmt(state.Mx)}cos^${fmt(state.pxm1)}(${fmt(state.wxm1)}t${fmtPhi(state.phi_xm1)})·sin^${fmt(state.pxm2)}(${fmt(state.wxm2)}t${fmtPhi(state.phi_xm2)})`;
    }
    
    let yEq = `y(t) = ${fmt(Ay1)}sin^${fmt(py1)}(${fmt(wy1)}t${fmtPhi(phi_y1)})`;
    if (Math.abs(Ay2) > 0.01) {
        yEq += ` ${Ay2 > 0 ? '+' : ''}${fmt(Ay2)}sin^${fmt(py2)}(${fmt(wy2)}t${fmtPhi(phi_y2)})`;
    }
    if (Math.abs(My) > 0.01) {
        yEq += ` ${My > 0 ? '+' : ''}${fmt(My)}sin^${fmt(pym1)}(${fmt(wym1)}t${fmtPhi(phi_ym1)})·cos^${fmt(pym2)}(${fmt(wym2)}t${fmtPhi(phi_ym2)})`;
    }
    
    equationEl.innerHTML = `${xEq}<br>${yEq}`;
}

function getRandomTarget(varName, type) {
    const rule = RULES[type];
    let value;
    
    if (rule.integer) {
        const range = rule.max - rule.min;
        value = rule.min + Math.floor(Math.random() * (range + 1));
    } else if (rule.pi) {
        const steps = Math.floor((rule.max - rule.min) / rule.step);
        value = rule.min + Math.floor(Math.random() * (steps + 1)) * rule.step;
    } else {
        const steps = Math.floor((rule.max - rule.min) / rule.step);
        value = rule.min + Math.floor(Math.random() * (steps + 1)) * rule.step;
    }
    
    return value;
}

function updateVariable() {
    if (!animating) {
        const varInfo = varSequence[varIndex];
        currentVar = varInfo.name;
        targetValue = getRandomTarget(varInfo.name, varInfo.type);
        animating = true;
    }
    
    const varInfo = varSequence[varIndex];
    const rule = RULES[varInfo.type];
    const current = state[currentVar];
    const diff = targetValue - current;
    
    if (Math.abs(diff) < rule.step) {
        state[currentVar] = targetValue;
        animating = false;
        varIndex = (varIndex + 1) % varSequence.length;
    } else {
        const direction = diff > 0 ? 1 : -1;
        state[currentVar] += direction * rule.step;
    }
}

function animate() {
    updateVariable();
    draw();
    updateEquation();
    requestAnimationFrame(animate);
}

animate();