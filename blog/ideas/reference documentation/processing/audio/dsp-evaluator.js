/**
 * @fileoverview DSP Equation Evaluator
 * 
 * Parse and evaluate mathematical audio equations.
 * All functions are pure.
 * 
 * @module audio/dsp-evaluator
 * @source blog/ideas/reference documentation/14_Signal_Processing_Filtering/DSP_theory.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_signal_processing
 * 
 * This module provides a safe DSP expression evaluator:
 * - Lexer/parser for mathematical expressions
 * - Built-in waveform generators (sin, saw, square, triangle)
 * - ADSR envelope function
 * - Supports standard math functions and constants
 * 
 * Security note: Uses AST compilation, not eval()
 */

// ═══════════════════════════════════════════════════════════════════════════
// EQUATION PARSER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Built-in functions for DSP
 */
const DSP_FUNCTIONS = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    abs: Math.abs,
    sqrt: Math.sqrt,
    exp: Math.exp,
    log: Math.log,
    log10: Math.log10,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    min: Math.min,
    max: Math.max,
    pow: Math.pow,
    sign: Math.sign,
    
    // Audio-specific
    saw: (t) => 2 * ((t / (2 * Math.PI)) % 1) - 1,
    square: (t) => Math.sin(t) >= 0 ? 1 : -1,
    triangle: (t) => 2 * Math.abs(2 * ((t / (2 * Math.PI)) % 1) - 1) - 1,
    pulse: (t, w = 0.5) => ((t / (2 * Math.PI)) % 1) < w ? 1 : -1,
    noise: () => Math.random() * 2 - 1,
    
    // Modulation
    clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
    lerp: (a, b, t) => a + t * (b - a),
    smoothstep: (e0, e1, x) => {
        const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
    },
    
    // Envelopes
    adsr: (t, a, d, s, r, duration) => {
        if (t < a) return t / a;
        if (t < a + d) return 1 - (1 - s) * (t - a) / d;
        if (t < duration - r) return s;
        if (t < duration) return s * (duration - t) / r;
        return 0;
    }
};

/**
 * Built-in constants
 */
const DSP_CONSTANTS = {
    PI: Math.PI,
    TAU: Math.PI * 2,
    E: Math.E,
    PHI: (1 + Math.sqrt(5)) / 2
};

/**
 * Tokenize equation string
 * 
 * @param {string} expr - Expression string
 * @returns {Array<{type: string, value: string|number}>}
 */
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    
    while (i < expr.length) {
        const c = expr[i];
        
        // Skip whitespace
        if (/\s/.test(c)) {
            i++;
            continue;
        }
        
        // Number
        if (/[0-9.]/.test(c)) {
            let num = '';
            while (i < expr.length && /[0-9.eE+-]/.test(expr[i])) {
                num += expr[i++];
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }
        
        // Identifier (function or variable)
        if (/[a-zA-Z_]/.test(c)) {
            let id = '';
            while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                id += expr[i++];
            }
            tokens.push({ type: 'id', value: id });
            continue;
        }
        
        // Operators and punctuation
        if ('+-*/%^(),'.includes(c)) {
            tokens.push({ type: c, value: c });
            i++;
            continue;
        }
        
        throw new Error(`Unexpected character: ${c}`);
    }
    
    return tokens;
}

/**
 * Parse tokens into AST
 * 
 * @param {Array} tokens - Token array
 * @returns {Object} AST node
 */
function parse(tokens) {
    let pos = 0;
    
    function peek() { return tokens[pos]; }
    function consume() { return tokens[pos++]; }
    function expect(type) {
        const t = consume();
        if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
        return t;
    }
    
    function parseExpr() {
        return parseAddSub();
    }
    
    function parseAddSub() {
        let left = parseMulDiv();
        while (peek() && (peek().type === '+' || peek().type === '-')) {
            const op = consume().type;
            const right = parseMulDiv();
            left = { type: 'binary', op, left, right };
        }
        return left;
    }
    
    function parseMulDiv() {
        let left = parsePow();
        while (peek() && (peek().type === '*' || peek().type === '/' || peek().type === '%')) {
            const op = consume().type;
            const right = parsePow();
            left = { type: 'binary', op, left, right };
        }
        return left;
    }
    
    function parsePow() {
        let left = parseUnary();
        while (peek() && peek().type === '^') {
            consume();
            const right = parseUnary();
            left = { type: 'binary', op: '^', left, right };
        }
        return left;
    }
    
    function parseUnary() {
        if (peek() && peek().type === '-') {
            consume();
            const arg = parseUnary();
            return { type: 'unary', op: '-', arg };
        }
        return parseAtom();
    }
    
    function parseAtom() {
        const t = peek();
        
        if (t.type === 'number') {
            consume();
            return { type: 'number', value: t.value };
        }
        
        if (t.type === 'id') {
            consume();
            // Check if it's a function call
            if (peek() && peek().type === '(') {
                consume();
                const args = [];
                if (peek().type !== ')') {
                    args.push(parseExpr());
                    while (peek() && peek().type === ',') {
                        consume();
                        args.push(parseExpr());
                    }
                }
                expect(')');
                return { type: 'call', name: t.value, args };
            }
            return { type: 'var', name: t.value };
        }
        
        if (t.type === '(') {
            consume();
            const expr = parseExpr();
            expect(')');
            return expr;
        }
        
        throw new Error(`Unexpected token: ${t.type}`);
    }
    
    return parseExpr();
}

/**
 * Compile AST to evaluator function
 * 
 * @param {Object} ast - AST node
 * @returns {Function} Evaluator function(vars) => number
 */
function compile(ast) {
    switch (ast.type) {
        case 'number':
            return () => ast.value;
            
        case 'var':
            if (DSP_CONSTANTS[ast.name] !== undefined) {
                const val = DSP_CONSTANTS[ast.name];
                return () => val;
            }
            return (vars) => {
                if (vars[ast.name] === undefined) {
                    throw new Error(`Undefined variable: ${ast.name}`);
                }
                return vars[ast.name];
            };
            
        case 'call':
            const fn = DSP_FUNCTIONS[ast.name];
            if (!fn) throw new Error(`Unknown function: ${ast.name}`);
            const argFns = ast.args.map(compile);
            return (vars) => fn(...argFns.map(f => f(vars)));
            
        case 'unary':
            const argFn = compile(ast.arg);
            if (ast.op === '-') return (vars) => -argFn(vars);
            throw new Error(`Unknown unary op: ${ast.op}`);
            
        case 'binary':
            const leftFn = compile(ast.left);
            const rightFn = compile(ast.right);
            switch (ast.op) {
                case '+': return (vars) => leftFn(vars) + rightFn(vars);
                case '-': return (vars) => leftFn(vars) - rightFn(vars);
                case '*': return (vars) => leftFn(vars) * rightFn(vars);
                case '/': return (vars) => leftFn(vars) / rightFn(vars);
                case '%': return (vars) => leftFn(vars) % rightFn(vars);
                case '^': return (vars) => Math.pow(leftFn(vars), rightFn(vars));
                default: throw new Error(`Unknown binary op: ${ast.op}`);
            }
            
        default:
            throw new Error(`Unknown AST node: ${ast.type}`);
    }
}

/**
 * Parse and compile DSP equation
 * 
 * @param {string} equation - Equation string (e.g., "sin(2*PI*freq*t)")
 * @returns {Function} Evaluator function(vars) => number
 * 
 * @example
 * const eval = parseEquation("0.5 * sin(2*PI*440*t) + 0.3 * sin(2*PI*880*t)");
 * for (let i = 0; i < sampleRate; i++) {
 *     samples[i] = eval({ t: i / sampleRate });
 * }
 */
export function parseEquation(equation) {
    const tokens = tokenize(equation);
    const ast = parse(tokens);
    return compile(ast);
}

/**
 * Evaluate equation for array of time values
 * 
 * @param {string} equation - Equation string
 * @param {number} duration - Duration in seconds
 * @param {number} sampleRate - Sample rate
 * @param {Object} [params={}] - Additional parameters
 * @returns {Float32Array} Sample values
 */
export function evaluateEquation(equation, duration, sampleRate, params = {}) {
    const evaluator = parseEquation(equation);
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        samples[i] = evaluator({ t, i, sr: sampleRate, ...params });
    }
    
    return samples;
}

/**
 * Validate equation syntax without evaluation
 * 
 * @param {string} equation - Equation string
 * @returns {{valid: boolean, error?: string}}
 */
export function validateEquation(equation) {
    try {
        const tokens = tokenize(equation);
        parse(tokens);
        return { valid: true };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

/**
 * Get list of variables used in equation
 * 
 * @param {string} equation - Equation string
 * @returns {string[]} Variable names
 */
export function getEquationVariables(equation) {
    const tokens = tokenize(equation);
    const vars = new Set();
    
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === 'id') {
            // Skip if followed by ( (it's a function)
            if (tokens[i + 1] && tokens[i + 1].type === '(') continue;
            // Skip if it's a constant
            if (DSP_CONSTANTS[t.value] !== undefined) continue;
            vars.add(t.value);
        }
    }
    
    return [...vars];
}

