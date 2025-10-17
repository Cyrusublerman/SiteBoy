(function(){
  // Import shared utilities for VGA color access
  // Note: In browser context, we'll load this via script tag, so getVGAColor will be available globally
  const getVGAColor = window.getVGAColor || ((variable) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  });

  new p5(function(p){
    let points = [];
    let bgColor, textColor, pointColor;

    p.setup = function(){
      // Get the container element to size canvas properly
      const container = document.getElementById('phyllo-manual');
      const containerWidth = container ? container.clientWidth : 800;
      const containerHeight = container ? container.clientHeight : 600;
      
      const cnv = p.createCanvas(containerWidth, containerHeight);
      cnv.parent('phyllo-manual');
      p.angleMode(p.DEGREES);
      p.textFont('Atkinson Hyperlegible, Atkinson Hyperlegible Mono, monospace', 12);

      // Cache VGA colors once in setup for efficiency
      bgColor = getVGAColor('--c-bg');
      textColor = getVGAColor('--c-text');
      pointColor = getVGAColor('--c-accent');
      
      // Register p5 instance for SiteBoy component communication
      if (window.siteBoyP5Component) {
        window.siteBoyP5Component.p5Instance = p;
      }
    };

    // Function to receive updates from SiteBoy controls
    p.updateFromSiteBoy = function(key, value, fullState) {
      // This function is called when SiteBoy controls change
      // The sketch will automatically redraw with new values
    };
    
    // Handle window resize for responsive canvas
    p.windowResized = function() {
      const container = document.getElementById('phyllo-manual');
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight || containerWidth * 0.75; // 4:3 aspect ratio fallback
        p.resizeCanvas(containerWidth, containerHeight);
      }
    };

    function generateSpiral(params, pointCount, desiredRadius, deltaTheta) {
      let spiral = [];
      let maxR = 0;
      let theta = 0;

      for (let i = 0; i < pointCount; i++) {
        theta = p.radians(deltaTheta) * i;
        // Generalized spiral equation: r(θ) = a × θ^k × e^(b×θ^m) + c
        let r = params.a * Math.pow(theta, params.k) * Math.exp(params.b * Math.pow(theta, params.m)) + params.c;
        
        if (!isFinite(r)) {
          console.error("Non-finite radius value detected. Check parameter values.");
          return [];
        }
        maxR = Math.max(maxR, r);
        spiral.push({ r, theta });
      }

      // Scale to fit desired radius
      let scale = desiredRadius / maxR;
      return spiral.map((p) => ({
        x: p.r * scale * Math.cos(p.theta),
        y: p.r * scale * Math.sin(p.theta),
      }));
    }

    function drawNthConnections(n, color){
      if (!Number.isFinite(n) || n < 1) return;
      
      p.stroke(color);
      
      // CORRECT algorithm: Create n separate chains
      // Each chain starts from a different point (0, 1, 2, ..., n-1)
      for (let start = 0; start < n; start++) {
        let i = start;
        while (i < points.length - n) {
          const nextI = i + n;
          if (nextI < points.length) {
            const startPoint = points[i];
            const endPoint = points[nextI];
            p.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
            i = nextI;
          } else {
            break;
          }
        }
      }
    }

    p.draw = function(){
      // Get state from SiteBoy component or use defaults
      const state = window.siteBoyP5State || {};
      const pointCount = state.pointCount || 169;
      const deltaTheta = state.deltaTheta || 137.5;
      const dotSize = state.dotSize || 2;
      const nth1 = state.nth1 || 8;
      const nth2 = state.nth2 || 13;
      const connectNth1 = state.connectNth1 !== undefined ? state.connectNth1 : true;
      const connectNth2 = state.connectNth2 !== undefined ? state.connectNth2 : true;
      
      // Spiral equation parameters
      const params = {
        a: state.paramA || 1,
        b: state.paramB || 0,
        c: state.paramC || 0,
        k: state.paramK || 1,
        m: state.paramM || 0
      };

      p.background(bgColor);
      p.translate(p.width/2, p.height/2);

      // Generate spiral using generalized equation
      // Scale to 80% of the short side of the canvas
      const desiredRadius = Math.min(p.width, p.height) * 0.4; // 0.4 = 80% / 2 (radius is half diameter)
      points = generateSpiral(params, pointCount, desiredRadius, deltaTheta);
      
      // Draw points
      p.noStroke(); 
      p.fill(pointColor);
      for (const pt of points) {
        p.circle(pt.x, pt.y, dotSize);
      }

      p.noFill();
      // Draw nth1 connections in red (VGA red)
      if (connectNth1) drawNthConnections(nth1, getVGAColor('--vga-red'));
      // Draw nth2 connections in blue (VGA blue)  
      if (connectNth2) drawNthConnections(nth2, getVGAColor('--vga-blue'));

      // overlay - ensure text color is always consistent
      p.push(); 
      p.resetMatrix(); 
      p.fill(textColor); // Always use textColor, not affected by connection colors
      p.noStroke(); // Ensure no stroke affects text
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      
      // Display current parameters
      p.text('Δθ: ' + deltaTheta.toFixed(3) + '° ' + (state.goldenAngleLock ? '(Golden Angle)' : ''), 12, 12);
      p.text('Points: ' + pointCount, 12, 28);
      
      // Display equation (generic form)
      p.text('Equation: r(θ) = a×θ^k×e^(b×θ^m)+c', 12, 44);
      
      // Display equation with actual values
      p.text('Current: r(θ) = ' + params.a + '×θ^' + params.k + '×e^(' + params.b + '×θ^' + params.m + ')+' + params.c, 12, 60);
      
      // Display connection info
      if (connectNth1 || connectNth2) {
        let connectionText = 'Connections: ';
        if (connectNth1) connectionText += 'N₁=' + nth1 + ' (red) ';
        if (connectNth2) connectionText += 'N₂=' + nth2 + ' (blue)';
        p.text(connectionText, 12, 76);
      }
      
      p.pop();
    };
  });
})();
