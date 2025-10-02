(function(){
  // Helper to get computed CSS variables (local to this sketch)
  const getVGAColor = (variable) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };
  class Fibonacci {
    constructor(){ this.curr = 1; this.prevVal = 0; }
    next(){ const n = this.curr + this.prevVal; this.prevVal = this.curr; this.curr = n; return this.curr; }
    previous(){ const n = this.prevVal; this.prevVal = this.curr - this.prevVal; this.curr = n; return this.curr; }
  }

  const fib1 = new Fibonacci();
  const fib2 = new Fibonacci();

  new p5(function(p){
    let dInput, pInput, rInput, dotSizeInput, nthInput1, nthInput2, nthCheck1, nthCheck2;
    let dotColorPicker, bgColorPicker;

    let d=50, P=377, r=137.5, dotSize=2, nth1=1, nth2=1, connectNth1=false, connectNth2=false;

    let points = [];

    p.setup = function(){
      const cnv = p.createCanvas(800, 600);
      cnv.parent('phyllo-manual');
      p.angleMode(p.DEGREES);
      p.textFont('Atkinson Hyperlegible, Atkinson Hyperlegible Mono, monospace', 12);

      const ui = p.createDiv('').style('display','grid').style('grid-template-columns','200px 180px 160px 160px').style('gap','8px').style('margin','8px 0');
      ui.parent('phyllo-manual');

      // --- Helper for styling UI elements ---
      const applySiteStyles = (element, isButton = false) => {
          element.style('font-family', 'Space Mono, monospace');
          element.style('font-size', '12px');
          element.style('color', getVGAColor('--c-text'));
          element.style('background', getVGAColor('--c-bg'));
          element.style('border', `1px solid ${getVGAColor('--c-border')}`);
          element.style('border-radius', '0');
          if (isButton) {
              element.style('cursor', 'pointer');
              element.mouseOver(() => element.style('background', getVGAColor('--c-text')).style('color', getVGAColor('--c-bg')));
              element.mouseOut(() => element.style('background', getVGAColor('--c-bg')).style('color', getVGAColor('--c-text')));
          } else {
              element.style('padding', '0 6px');
          }
      };

      // Spiral Size
      ui.child(p.createSpan('Spiral Size (%):'));
      dInput = p.createInput(String(d)).style('width','80px'); 
      applySiteStyles(dInput);
      ui.child(dInput);
      const dPlus = p.createButton('+').mousePressed(()=> dInput.value(String(Math.min(100, parseInt(dInput.value()||0)+5))));
      applySiteStyles(dPlus, true);
      ui.child(dPlus);
      const dMinus = p.createButton('-').mousePressed(()=> dInput.value(String(Math.max(0, parseInt(dInput.value()||0)-5))));
      applySiteStyles(dMinus, true);
      ui.child(dMinus);

      // Number of Points
      ui.child(p.createSpan('Number of Points:'));
      pInput = p.createInput(String(P)).style('width','80px');
      applySiteStyles(pInput);
      ui.child(pInput);
      const pPlus = p.createButton('+').mousePressed(()=> pInput.value(String(fib1.next())));
      applySiteStyles(pPlus, true);
      ui.child(pPlus);
      const pMinus = p.createButton('-').mousePressed(()=> pInput.value(String(Math.max(1, fib1.previous()))));
      applySiteStyles(pMinus, true);
      ui.child(pMinus);

      // Rotation (deg)
      ui.child(p.createSpan('Rotation (deg):'));
      rInput = p.createInput(String(r)).style('width','80px');
      applySiteStyles(rInput);
      ui.child(rInput);
      const rPlus = p.createButton('+').mousePressed(()=> rInput.value(String(parseFloat(rInput.value()||0)+0.5)));
      applySiteStyles(rPlus, true);
      ui.child(rPlus);
      const rMinus = p.createButton('-').mousePressed(()=> rInput.value(String(parseFloat(rInput.value()||0)-0.5)));
      applySiteStyles(rMinus, true);
      ui.child(rMinus);

      // Dot Size
      ui.child(p.createSpan('Dot Size:'));
      dotSizeInput = p.createInput(String(dotSize)).style('width','80px');
      applySiteStyles(dotSizeInput);
      ui.child(dotSizeInput);
      const dotPlus = p.createButton('+').mousePressed(()=> dotSizeInput.value(String(parseInt(dotSizeInput.value()||1)+1)));
      applySiteStyles(dotPlus, true);
      ui.child(dotPlus);
      const dotMinus = p.createButton('-').mousePressed(()=> dotSizeInput.value(String(Math.max(1, parseInt(dotSizeInput.value()||1)-1))));
      applySiteStyles(dotMinus, true);
      ui.child(dotMinus);

      // Nth connections 1
      ui.child(p.createSpan('Connect every nth dot 1:'));
      const g1 = p.createDiv(''); g1.style('display','flex').style('gap','8px'); ui.child(g1);
      nthCheck1 = p.createCheckbox('', connectNth1); g1.child(nthCheck1);
      nthInput1 = p.createInput(String(nth1)).style('width','80px');
      applySiteStyles(nthInput1);
      g1.child(nthInput1);
      const nth1Plus = p.createButton('+').mousePressed(()=>{ fib1.next(); nthInput1.value(String(fib1.curr)); });
      applySiteStyles(nth1Plus, true);
      ui.child(nth1Plus);
      const nth1Minus = p.createButton('-').mousePressed(()=>{ fib1.previous(); nthInput1.value(String(Math.max(1, fib1.curr))); });
      applySiteStyles(nth1Minus, true);
      ui.child(nth1Minus);

      // Nth connections 2
      ui.child(p.createSpan('Connect every nth dot 2:'));
      const g2 = p.createDiv(''); g2.style('display','flex').style('gap','8px'); ui.child(g2);
      nthCheck2 = p.createCheckbox('', connectNth2); g2.child(nthCheck2);
      nthInput2 = p.createInput(String(nth2)).style('width','80px');
      applySiteStyles(nthInput2);
      g2.child(nthInput2);
      const nth2Plus = p.createButton('+').mousePressed(()=>{ fib2.next(); nthInput2.value(String(fib2.curr)); });
      applySiteStyles(nth2Plus, true);
      ui.child(nth2Plus);
      const nth2Minus = p.createButton('-').mousePressed(()=>{ fib2.previous(); nthInput2.value(String(Math.max(1, fib2.curr))); });
      applySiteStyles(nth2Minus, true);
      ui.child(nth2Minus);

      // Colour pickers
      ui.child(p.createSpan('Dot Colour:'));
      dotColorPicker = p.createColorPicker(getVGAColor('--c-text'));
      dotColorPicker.style('border-radius', '0');
      ui.child(dotColorPicker);
      ui.child(p.createSpan('Background Colour:'));
      bgColorPicker  = p.createColorPicker(getVGAColor('--c-bg'));
      bgColorPicker.style('border-radius', '0');
      ui.child(bgColorPicker);
    };

    function recomputePoints(scalePerc, count, angleDeg){
      points.length = 0;
      const R = Math.min(p.width, p.height) * 0.48;       // canvas radius
      const C = (scalePerc/100) * (R / Math.sqrt(Math.max(1, count)));
      for (let k = 0; k < count; k++){
        const r = C * Math.sqrt(k);
        const t = k * angleDeg;
        points.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
      }
    }

    function drawNthConnections(n){
      if (!Number.isFinite(n) || n < 1) return;
      let idx = 0;
      while (idx < points.length){
        const start = points[idx];
        const endIdx = idx + n;
        if (endIdx < points.length){
          const end = points[endIdx];
          p.line(start.x, start.y, end.x, end.y);
        }
        idx++;
        n++; // increment denominator to create quasi-parallel lamella-like families
      }
    }

    p.draw = function(){
      // read UI
      d = Math.max(0, Math.min(100, parseFloat(dInput?.value() || d)));
      P = Math.max(1, parseInt(pInput?.value() || P));
      r = parseFloat(rInput?.value() || r);
      dotSize = Math.max(1, parseInt(dotSizeInput?.value() || dotSize));
      nth1 = Math.max(1, parseInt(nthInput1?.value() || nth1));
      nth2 = Math.max(1, parseInt(nthInput2?.value() || nth2));

      p.background(bgColorPicker?.value() || getVGAColor('--c-bg'));
      p.translate(p.width/2, p.height/2);

      // recompute and draw
      recomputePoints(d, P, r);
      p.noStroke(); p.fill(dotColorPicker?.value() || getVGAColor('--c-text'));
      for (const pt of points) p.circle(pt.x, pt.y, dotSize);

      p.stroke(dotColorPicker?.value() || getVGAColor('--c-text')); p.noFill();
      if (nthCheck1?.checked()) drawNthConnections(nth1);
      if (nthCheck2?.checked()) drawNthConnections(nth2);

      // overlay
      p.push(); p.resetMatrix(); p.fill(getVGAColor('--c-text')); p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      p.text('Rot: ' + r.toFixed(1) + '°', 12, 12);
      p.text('Points: ' + P, 12, 28);
      p.text('Size: ' + d + '%', 12, 44);
      p.pop();
    };
  });
})();
