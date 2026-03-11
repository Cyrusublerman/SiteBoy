const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const GRID = 50;
let time = 0, isPaused = false, infoVisible = true;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const easeIn = t => t * t * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Generate spiral path
const spiralPath = [];
(function generateSpiral() {
  let left = 0, right = GRID - 1, top = 0, bottom = GRID - 1;
  while (left <= right && top <= bottom) {
    for (let col = left; col <= right; col++) spiralPath.push([col, top]);
    top++;
    for (let row = top; row <= bottom; row++) spiralPath.push([right, row]);
    right--;
    if (top <= bottom) {
      for (let col = right; col >= left; col--) spiralPath.push([col, bottom]);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--) spiralPath.push([left, row]);
      left++;
    }
  }
})();

// Envelope: smooth entry/exit for effects (1s in, 1s out)
function envelope(localT, duration) {
  const fadeTime = Math.min(1, duration * 0.1);
  if (localT < fadeTime) return easeInOut(localT / fadeTime);
  if (localT > duration - fadeTime) return easeInOut((duration - localT) / fadeTime);
  return 1;
}

// ============================================================================
// PATTERNS
// ============================================================================

const patterns = {
  allBlack: (col, row, nx, ny) => false,
  allWhite: (col, row, nx, ny) => true,
  checkerboard: (col, row, nx, ny) => (Math.floor(col) + Math.floor(row)) % 2 === 0,
  horizontalStripes: (col, row, nx, ny) => Math.floor(row) % 2 === 0,
  verticalStripes: (col, row, nx, ny) => Math.floor(col) % 2 === 0,
  
  cafeWall: (col, row, nx, ny) => {
    const offset = Math.floor(row) % 2 === 0 ? 0 : 0.5;
    return Math.floor(col + offset) % 2 === 0;
  },
  
  diagonalStripes: (col, row, nx, ny) => (Math.floor(col) + Math.floor(row)) % 4 < 2
};

// ============================================================================
// TRANSITIONS
// ============================================================================

const transitions = {
  radialWave: (col, row, nx, ny, progress, fromPattern, toPattern) => {
    const cx = 0.5, cy = 0.5;
    const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
    const maxDist = 0.707;
    const duration = 0.25;
    const normalizedDist = dist / maxDist;
    const flipStart = normalizedDist - progress * (1 + duration);
    
    return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
  },
  
  linearSweep: (col, row, nx, ny, progress, fromPattern, toPattern) => {
    const duration = 0.2;
    const flipStart = nx - progress * (1 + duration);
    return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
  },
  
  verticalSweep: (col, row, nx, ny, progress, fromPattern, toPattern) => {
    const duration = 0.2;
    const flipStart = ny - progress * (1 + duration);
    return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
  },
  
  spiralUnwind: (col, row, nx, ny, progress, fromPattern, toPattern) => {
    const tileIndex = spiralPath.findIndex(([c, r]) => c === Math.floor(col) && r === Math.floor(row));
    if (tileIndex === -1) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toPattern(col, row, nx, ny) };
    
    const totalTiles = spiralPath.length;
    const tileProgress = tileIndex / totalTiles;
    const duration = 1.5 / totalTiles;
    const flipStart = tileProgress - progress * (1 + duration);
    
    let flipAxis = 'x';
    if (tileIndex < totalTiles - 1) {
      const [currCol, currRow] = spiralPath[tileIndex];
      const [nextCol, nextRow] = spiralPath[tileIndex + 1];
      flipAxis = Math.abs(nextRow - currRow) > 0 ? 'y' : 'x';
    }
    
    return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, flipAxis);
  },
  
  randomFlicker: (col, row, nx, ny, progress, fromPattern, toPattern) => {
    const h = hash(col, row);
    const duration = 0.25;
    const flipStart = h - progress * (1 + duration);
    return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
  }
};

function getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, axis = 'x') {
  const flipEnd = flipStart + duration;
  let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
  const fromColor = fromPattern(col, row, nx, ny);
  const toColor = toPattern(col, row, nx, ny);
  let isWhite = fromColor;
  
  // Only flip if color is actually changing
  if (fromColor === toColor) {
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toColor };
  }
  
  if (flipStart < 0 && flipEnd > 0) {
    const flipProgress = Math.min(1, -flipStart / duration);
    
    if (flipProgress < 0.5) {
      if (axis === 'x') scaleX = 1 - easeIn(flipProgress * 2);
      else scaleY = 1 - easeIn(flipProgress * 2);
    } else {
      if (axis === 'x') scaleX = easeOut((flipProgress - 0.5) * 2);
      else scaleY = easeOut((flipProgress - 0.5) * 2);
      isWhite = toColor;
    }
  } else if (flipStart <= -duration) {
    isWhite = toColor;
  }
  
  return { scaleX, scaleY, offsetX, offsetY, isWhite };
}

// ============================================================================
// EFFECTS - PHASE ALIGNED TO END AT NEUTRAL
// ============================================================================

const effects = {
  none: (col, row, nx, ny, localT, duration, state) => state,
  
  // Rotation wave - aligned to end at rotation=0
  rotationWave: (col, row, nx, ny, localT, duration, state) => {
    const cx = 0.5, cy = 0.5;
    const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
    
    // Lock to 10 full cycles over duration
    const cycles = 10;
    const phase = (localT / duration) * cycles * Math.PI * 2;
    const spatialFreq = 12;
    
    const env = envelope(localT, duration);
    state.rotation = Math.sin(dist * spatialFreq - phase) * 20 * env;
    return state;
  },
  
  // Compression wave - aligned
  compressionWave: (col, row, nx, ny, localT, duration, state) => {
    const cycles = 8;
    const phase = (localT / duration) * cycles * Math.PI * 2;
    const spatialFreq = 12;
    
    const wave = Math.sin(nx * spatialFreq - phase);
    const env = envelope(localT, duration);
    
    state.scaleY = 1 + wave * 0.6 * env;
    state.scaleX = 1 - wave * 0.3 * env;
    state.rotation = wave * 35 * env;
    return state;
  },
  
  // Cafe wall shift - aligned to end at offset=0
  cafeWallShift: (col, row, nx, ny, localT, duration, state) => {
    const cycles = 6;
    const phase = (localT / duration) * cycles * Math.PI * 2;
    
    const shift = Math.sin(phase) * 0.15;
    const rowOffset = Math.floor(row) % 2 === 0 ? shift : -shift;
    const env = envelope(localT, duration);
    
    state.offsetX = rowOffset * env;
    
    // Edge compression
    const edgeDist = Math.min(nx, 1 - nx);
    if (edgeDist < 0.1) {
      state.scaleX = 0.7 + edgeDist * 3;
    }
    
    return state;
  },
  
  // Radial pulse - aligned
  radialPulse: (col, row, nx, ny, localT, duration, state) => {
    const cx = 0.5, cy = 0.5;
    const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
    
    const cycles = 5;
    const phase = (localT / duration) * cycles * Math.PI * 2;
    const spatialFreq = 8;
    
    const pulse = (Math.sin(dist * spatialFreq - phase) + 1) / 2;
    const env = envelope(localT, duration);
    
    state.scaleX = 1 + pulse * 0.3 * env;
    state.scaleY = 1 + pulse * 0.3 * env;
    
    if (dist > 0.6) {
      const squeeze = (dist - 0.6) / 0.4;
      state.offsetX = (nx - cx) * squeeze * 0.1 * env;
      state.offsetY = (ny - cy) * squeeze * 0.1 * env;
    }
    
    return state;
  },
  
  // Spiral rotation - aligned
  spiralRotation: (col, row, nx, ny, localT, duration, state) => {
    const cx = 0.5, cy = 0.5;
    const angle = Math.atan2(ny - cy, nx - cx);
    const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
    
    const cycles = 4;
    const phase = (localT / duration) * cycles * Math.PI * 2;
    
    const rotation = (angle * 3 + dist * 15 - phase) * (180 / Math.PI);
    const env = envelope(localT, duration);
    
    state.rotation = (rotation % 360) * env;
    return state;
  },
  
  // Shape morph - aligned to end at roundness=0
  shapeMorph: (col, row, nx, ny, localT, duration, state) => {
    const cx = 0.5, cy = 0.5;
    const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
    
    const cycles = 3;
    const morphPhase = (localT / duration) * cycles * Math.PI * 2;
    const spatialFreq = 12;
    
    const morph = (Math.sin(dist * spatialFreq - morphPhase) + 1) / 2;
    const env = envelope(localT, duration);
    
    state.roundness = morph * morph * (3 - 2 * morph) * env;
    
    const scalePhase = (localT / duration) * 4 * Math.PI * 2;
    const scalePulse = Math.sin(scalePhase) * 0.35;
    
    state.scaleX = 1 + scalePulse * env;
    state.scaleY = 1 + scalePulse * env;
    return state;
  }
};

// ============================================================================
// TIMELINE
// ============================================================================

const timeline = [
  { t: 0, type: 'pattern', pattern: 'allBlack', effect: 'none', dur: 2 },
  { t: 2, type: 'transition', transition: 'radialWave', from: 'allBlack', to: 'checkerboard', dur: 6 },
  { t: 8, type: 'pattern', pattern: 'checkerboard', effect: 'rotationWave', dur: 20 },
  
  { t: 28, type: 'transition', transition: 'linearSweep', from: 'checkerboard', to: 'horizontalStripes', dur: 5 },
  { t: 33, type: 'pattern', pattern: 'horizontalStripes', effect: 'compressionWave', dur: 30 },
  
  { t: 63, type: 'transition', transition: 'verticalSweep', from: 'horizontalStripes', to: 'verticalStripes', dur: 5 },
  { t: 68, type: 'pattern', pattern: 'verticalStripes', effect: 'radialPulse', dur: 20 },
  
  { t: 88, type: 'transition', transition: 'randomFlicker', from: 'verticalStripes', to: 'cafeWall', dur: 5 },
  { t: 93, type: 'pattern', pattern: 'cafeWall', effect: 'cafeWallShift', dur: 35 },
  
  { t: 128, type: 'transition', transition: 'linearSweep', from: 'cafeWall', to: 'diagonalStripes', dur: 5 },
  { t: 133, type: 'pattern', pattern: 'diagonalStripes', effect: 'compressionWave', dur: 25 },
  
  { t: 158, type: 'transition', transition: 'randomFlicker', from: 'diagonalStripes', to: 'checkerboard', dur: 5 },
  { t: 163, type: 'pattern', pattern: 'checkerboard', effect: 'spiralRotation', dur: 35 },
  
  { t: 198, type: 'transition', transition: 'spiralUnwind', from: 'checkerboard', to: 'allBlack', dur: 12 },
  { t: 210, type: 'pattern', pattern: 'allBlack', effect: 'shapeMorph', dur: 30 }
];

function getCurrentState() {
  const t = time % 240;
  
  for (let i = 0; i < timeline.length; i++) {
    const curr = timeline[i];
    if (t >= curr.t && t < curr.t + curr.dur) {
      const localT = t - curr.t;
      const progress = localT / curr.dur;
      
      return {
        type: curr.type,
        pattern: curr.pattern,
        effect: curr.effect,
        transition: curr.transition,
        from: curr.from,
        to: curr.to,
        progress: progress,
        localT: localT,
        duration: curr.dur,
        name: curr.type === 'transition' ? 
          `${curr.from} → ${curr.to}` :
          `${curr.pattern} + ${curr.effect}`
      };
    }
  }
  
  return timeline[timeline.length - 1];
}

function getTileState(col, row, nx, ny) {
  const state = getCurrentState();
  let result = { rotation: 0, scaleX: 1, scaleY: 1, roundness: 0, offsetX: 0, offsetY: 0, isWhite: false };
  
  if (state.type === 'transition') {
    const transitionFn = transitions[state.transition];
    const flipState = transitionFn(
      col, row, nx, ny, state.progress,
      patterns[state.from], patterns[state.to]
    );
    result = { ...result, ...flipState };
  } else {
    result.isWhite = patterns[state.pattern](col, row, nx, ny);
    const effectFn = effects[state.effect];
    result = effectFn(col, row, nx, ny, state.localT, state.duration, result);
  }
  
  return result;
}

function drawCard(x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite) {
  ctx.save();
  ctx.translate(x + offsetX * size, y + offsetY * size);
  ctx.rotate(rotation * Math.PI / 180);
  
  const w = size * scaleX * 1;
  const h = size * scaleY * 1;
  
  ctx.fillStyle = isWhite ? '#fff' : '#000';
  ctx.strokeStyle = isWhite ? '#000' : '#fff';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  if (roundness > 0.99) {
    ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
  } else if (roundness < 0.01) {
    ctx.rect(-w/2, -h/2, w, h);
  } else {
    const rX = roundness * w/2, rY = roundness * h/2;
    ctx.moveTo(-w/2 + rX, -h/2);
    ctx.lineTo(w/2 - rX, -h/2);
    ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + rY);
    ctx.lineTo(w/2, h/2 - rY);
    ctx.quadraticCurveTo(w/2, h/2, w/2 - rX, h/2);
    ctx.lineTo(-w/2 + rX, h/2);
    ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - rY);
    ctx.lineTo(-w/2, -h/2 + rY);
    ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + rX, -h/2);
    ctx.closePath();
  }
  
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const cellSize = Math.min(canvas.width / GRID, canvas.height / GRID);
  const offsetX = (canvas.width - GRID * cellSize) / 2;
  const offsetY = (canvas.height - GRID * cellSize) / 2;
  
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const nx = col / GRID;
      const ny = row / GRID;
      const tile = getTileState(col, row, nx, ny);
      
      const x = offsetX + col * cellSize + cellSize / 2;
      const y = offsetY + row * cellSize + cellSize / 2;
      
      drawCard(x, y, cellSize, tile.scaleX, tile.scaleY, tile.rotation, tile.roundness, 
               tile.offsetX, tile.offsetY, tile.isWhite);
    }
  }
}

function updateInfo() {
  const state = getCurrentState();
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  
  document.getElementById('phase-name').textContent = state.name || 'LOADING';
  document.getElementById('sub-phase').textContent = 
    state.type === 'transition' ? 'Flipping tiles...' : 'Geometric effect active';
  document.getElementById('timer').textContent = 
    `${mins}:${secs.toString().padStart(2, '0')} / 4:00`;
}

function animate() {
  if (!isPaused) {
    time += 0.016;
    if (time >= 240) time = 0;
  }
  render();
  updateInfo();
  requestAnimationFrame(animate);
}

document.getElementById('play').addEventListener('click', function() {
  isPaused = !isPaused;
  this.textContent = isPaused ? 'PLAY' : 'PAUSE';
});

document.getElementById('restart').addEventListener('click', () => time = 0);

document.getElementById('toggle-info').addEventListener('click', function() {
  infoVisible = !infoVisible;
  document.body.classList.toggle('hide-info', !infoVisible);
  this.textContent = infoVisible ? 'HIDE' : 'SHOW';
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    isPaused = !isPaused;
    document.getElementById('play').textContent = isPaused ? 'PLAY' : 'PAUSE';
  }
  if (e.code === 'KeyR') time = 0;
  if (e.code === 'KeyH') {
    infoVisible = !infoVisible;
    document.body.classList.toggle('hide-info', !infoVisible);
    document.getElementById('toggle-info').textContent = infoVisible ? 'HIDE' : 'SHOW';
  }
});

animate();