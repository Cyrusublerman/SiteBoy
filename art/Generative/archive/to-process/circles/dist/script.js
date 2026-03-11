const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d', { alpha: false });

// Setup

canvas.width = 800;

canvas.height = 800;

const centerX = canvas.width / 2;

const centerY = canvas.height / 2;

// Parameters

const numCircles = 100;

const largestRadius = 350;

const radiusDecrement = 3.5;

const cycleFrames = 3600;

// Build circle data

const circles = Array.from({ length: numCircles }, (_, i) => ({

  radius: largestRadius - i * radiusDecrement,

  parent: i === 0 ? null : i - 1

}));

let frame = 0;

let mode = 'lines';

// Button controls

document.querySelectorAll('button').forEach(btn => {

  btn.addEventListener('click', () => {

    document.querySelectorAll('button').forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    mode = btn.dataset.mode;

  });

});

function draw() {

  frame++;

  

  // Clear

  ctx.fillStyle = '#000';

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  

  // Calculate all transforms

  const transforms = [];

  

  for (let i = 0; i < circles.length; i++) {

    const circle = circles[i];

    

    if (circle.parent === null) {

      transforms[i] = { x: centerX, y: centerY, rotation: 0 };

    } else {

      const parent = circles[circle.parent];

      const parentTransform = transforms[circle.parent];

      const orbitRadius = parent.radius - circle.radius;

      const orbitAngle = (frame / cycleFrames) * Math.PI * 2;

      const rollRotation = orbitAngle;

      

      const localX = orbitRadius * Math.cos(orbitAngle);

      const localY = orbitRadius * Math.sin(orbitAngle);

      const cos = Math.cos(parentTransform.rotation);

      const sin = Math.sin(parentTransform.rotation);

      

      transforms[i] = {

        x: parentTransform.x + localX * cos - localY * sin,

        y: parentTransform.y + localX * sin + localY * cos,

        rotation: parentTransform.rotation + rollRotation

      };

    }

  }

  

  // Draw based on mode

  circles.forEach((circle, i) => {

    const t = transforms[i];

    ctx.save();

    ctx.translate(t.x, t.y);

    ctx.rotate(t.rotation);

    ctx.beginPath();

    ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);

    

    if (mode === 'lines') {

      // White outlines only, no fill

      ctx.strokeStyle = '#f5f5f5';

      ctx.lineWidth = 1.5;

      ctx.stroke();

    } else if (mode === 'bw') {

      // Alternating fully opaque black/white filled circles

      const isWhite = i % 2 === 0;

      if (isWhite) {

        ctx.fillStyle = '#f5f5f5';

        ctx.fill();

      } else {

        ctx.fillStyle = '#000000';

        ctx.fill();

        // Add white stroke so black circles are visible

        ctx.strokeStyle = '#f5f5f5';

        ctx.lineWidth = 1.5;

        ctx.stroke();

      }

    } else if (mode === 'gradient') {

      // 1% transparency per layer - all white circles building up

      ctx.fillStyle = 'rgba(245, 245, 245, 0.01)';

      ctx.fill();

    }

    

    ctx.restore();

  });

  

  requestAnimationFrame(draw);

}

draw();