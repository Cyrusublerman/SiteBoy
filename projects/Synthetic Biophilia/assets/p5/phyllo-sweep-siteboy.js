(function(){
  // Helper to get computed CSS variables (local to this sketch)
  const getVGAColor = (variable) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };
  
  new p5(function(p){
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
      
      // Store p5 instance globally for SiteBoy component communication
      if (window.siteBoyP5Component) {
        window.siteBoyP5Component.p5Instance = p;
      }
    };

    // Function to receive updates from SiteBoy controls
    p.updateFromSiteBoy = function(key, value, fullState) {
      // This function is called when SiteBoy controls change
      // The sketch will automatically redraw with new values
    };

    p.draw = function(){
      // Get state from SiteBoy component or use defaults
      const state = window.siteBoyP5State || {};
      const degreesPerSecond = state.animationSpeed || 0.1;
      const step = degreesPerSecond / 60; // Convert degrees per second to degrees per frame (assuming 60 FPS)
      const N = state.pointCount || 169;
      const c = 4.5; // Fixed spiral constant since auto-scaling handles size

      p.background(bgColor);
      p.translate(p.width/2, p.height/2);
      p.fill(pointColor);

      // Calculate scaling to fill 80% of the short side
      const maxRadius = c * Math.sqrt(N);
      const desiredRadius = Math.min(p.width, p.height) * 0.4; // 80% / 2
      const scale = desiredRadius / maxRadius;

      for (let k = 0; k < N; k++) {
        const r = c * Math.sqrt(k) * scale;
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
      p.text('Speed: ' + degreesPerSecond.toFixed(1) + '°/s', 12, 44);
      p.pop();

      angle += step;
      if (angle > 360) angle = 0;
    };
  });
})();
