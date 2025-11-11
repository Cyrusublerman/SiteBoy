const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

// Setup
canvas.width = 800;
canvas.height = 800;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Torus parameters
const R = 150;  // Major radius
const r = 150;  // Minor radius

// Animation parameters
const cycleFrames = 3600;
let frame = 0;

// Camera angles
const viewAngleX = Math.PI / 6;
const viewAngleY = Math.PI / 8;

// Project 3D to 2D with additional X-axis rotation
function project3D(x, y, z, xRotation = 0) {
  // Rotate around X-axis first (spin the whole shape)
  let y0 = y * Math.cos(xRotation) - z * Math.sin(xRotation);
  let z0 = y * Math.sin(xRotation) + z * Math.cos(xRotation);
  
  // Then apply camera angles
  let y1 = y0 * Math.cos(viewAngleX) - z0 * Math.sin(viewAngleX);
  let z1 = y0 * Math.sin(viewAngleX) + z0 * Math.cos(viewAngleX);
  let x2 = x * Math.cos(viewAngleY) + z1 * Math.sin(viewAngleY);
  let z2 = -x * Math.sin(viewAngleY) + z1 * Math.cos(viewAngleY);
  
  return { x: centerX + x2, y: centerY - y1 };
}

// Draw toroidal spiral as filled ellipses
function drawTorusSpiral(rotation, xRotation) {
  const numEllipses = 36;  // Number of cross-section ellipses to draw
  
  ctx.fillStyle = 'rgba(245, 245, 245, 0.25)';
  
  for (let i = 0; i < numEllipses; i++) {
    const theta = (i / numEllipses) * Math.PI * 2 + rotation;
    
    // Draw the minor circle as a filled ellipse
    ctx.beginPath();
    
    // Sample points around the minor circle
    const points = 50;
    for (let j = 0; j <= points; j++) {
      const phi = (j / points) * Math.PI * 2;
      
      const x = (R + r * Math.cos(phi)) * Math.cos(theta);
      const y = (R + r * Math.cos(phi)) * Math.sin(theta);
      const z = r * Math.sin(phi);
      
      const p = project3D(x, y, z, xRotation);
      
      if (j === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    
    ctx.closePath();
    ctx.fill();
  }
}

// Draw toroidal surface spiral (follows torus surface)
function drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, reverse = false) {
  ctx.beginPath();
  const winds = 4;
  const points = 1000;
  
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    
    // Phi goes around the minor circle (0 to 2π)
    const phi = t * Math.PI * 2;
    
    // Theta winds around the major circle
    const windDirection = reverse ? -1 : 1;
    const theta = t * winds * windDirection * Math.PI * 2 + spiralRotation + offset;
    
    // Torus coordinates
    const x = (R + r * Math.cos(phi)) * Math.cos(theta);
    const y = (R + r * Math.cos(phi)) * Math.sin(theta);
    const z = r * Math.sin(phi);
    
    const p = project3D(x, y, z, xRotation);
    
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function draw() {
  frame++;
  
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const torusRotation = (frame / cycleFrames) * Math.PI * 2;
  const spiralRotation = -(frame / cycleFrames) * Math.PI * 2;
  const xRotation = (frame / cycleFrames) * Math.PI * 2;  // Rotate whole shape around X-axis
  
  // Draw central torus spiral
  drawTorusSpiral(torusRotation, xRotation);
  
  // Draw 9 spirals in one direction
  const numSpirals = 9;
  for (let i = 0; i < numSpirals; i++) {
    const offset = (i / numSpirals) * Math.PI * 2;
    drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, false);
  }
  
  // Draw 9 spirals in opposite direction
  for (let i = 0; i < numSpirals; i++) {
    const offset = (i / numSpirals) * Math.PI * 2;
    drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, true);
  }
  
  requestAnimationFrame(draw);
}

draw();