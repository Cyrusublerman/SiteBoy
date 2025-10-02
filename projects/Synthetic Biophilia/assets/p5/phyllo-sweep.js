(function(){
  // Helper to get computed CSS variables (local to this sketch)
  const getVGAColor = (variable) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };
  new p5(function(p){
    const N = 800;
    const c = 4.5;
    const step = 0.1;
    let angle = 0;

    let bgColor, textColor, pointColor;

    p.setup = function(){
      const cnv = p.createCanvas(640, 640);
      cnv.parent('phyllo-sweep');
      p.angleMode(p.DEGREES);
      p.textFont('Atkinson Hyperlegible, Atkinson Hyperlegible Mono, monospace', 12);
      p.noStroke();

      // Get colors once
      bgColor = getVGAColor('--c-bg');
      textColor = getVGAColor('--c-text');
      pointColor = getVGAColor('--c-accent'); // Use accent for visibility
    };

    p.draw = function(){
      p.background(bgColor);
      p.translate(p.width/2, p.height/2);
      p.fill(pointColor);

      for (let k = 0; k < N; k++) {
        const r = c * Math.sqrt(k);
        const t = k * angle;
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);
        p.circle(x, y, 3);
      }

      // UI overlay
      p.push();
      p.resetMatrix();
      p.fill(textColor);
      p.textAlign(p.LEFT, p.TOP);
      p.text('Divergence: ' + angle.toFixed(1) + '°', 12, 12);
      p.text('Points: ' + N, 12, 28);
      p.pop();

      angle += step;
      if (angle > 360) angle = 0;
    };
  });
})();
