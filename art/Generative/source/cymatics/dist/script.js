const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let oscillators = [];

const baseNoteSelect = document.getElementById('base-note');
const ampInput = document.getElementById('amp');
const speedInput = document.getElementById('speed');
const boostInput = document.getElementById('boost');
const radialResInput = document.getElementById('radial-res');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const clearBtn = document.getElementById('clear');
const sourceList = document.getElementById('source-list');
const sourceCount = document.getElementById('source-count');
const noteButtons = document.querySelectorAll('.note');
const chordButtons = document.querySelectorAll('.chord');
const templateButtons = document.querySelectorAll('.template');
const vizButtons = document.querySelectorAll('.viz-mode');

let vizMode = 'particle';
let selectedSemitone = 0;
let currentChord = null;
let currentTemplate = null;

function updateNextFreqDisplay() {
  const baseFreq = parseFloat(baseNoteSelect.value);
  const nextFreq = baseFreq * Math.pow(2, selectedSemitone / 12);
  document.getElementById('next-freq').textContent = Math.round(nextFreq) + ' Hz';
}

const CHORDS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  sus4: [0, 5, 7]
};

class WaveSource {
  constructor(x, y, semitone, amp, id) {
    this.x = x;
    this.y = y;
    this.semitone = semitone;
    this.amp = amp;
    this.id = id;
    this.updateFreq();
  }

  updateFreq() {
    const baseFreq = parseFloat(baseNoteSelect.value);
    this.noteFreq = baseFreq * Math.pow(2, this.semitone / 12);
    this.freq = this.noteFreq / 10;
  }

  getWave(px, py, t) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const w = 2 * Math.PI / this.freq;
    return this.amp * Math.sin(w * dist - t);
  }

  getDisplacement(px, py, t) {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const wave = this.getWave(px, py, t);
    return { 
      x: (dx / dist) * wave,
      y: (dy / dist) * wave
    };
  }
}

class Medium {
  constructor() {
    this.particles = [];
    this.densityData = ctx.createImageData(W, H);
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    for (let y = 0; y < H; y += 5) {
      for (let x = 0; x < W; x += 5) {
        this.particles.push({ x, y, ox: x, oy: y });
      }
    }
  }

  update(sources, t) {
    for (let p of this.particles) {
      let dx = 0, dy = 0;
      for (let s of sources) {
        const d = s.getDisplacement(p.ox, p.oy, t);
        dx += d.x;
        dy += d.y;
      }
      p.x = p.ox + dx;
      p.y = p.oy + dy;
    }
  }

  drawParticle() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    for (let p of this.particles) {
      const disp = Math.sqrt((p.x - p.ox) ** 2 + (p.y - p.oy) ** 2);
      const alpha = Math.min(disp * 0.15, 1);
      if (alpha > 0.05) {
        ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }

    this.drawSources();
  }

  drawDensity(sources, t) {
    if (sources.length === 0) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    const data = this.densityData.data;
    const boost = parseFloat(boostInput.value);
    
    let minIntensity = Infinity;
    let maxIntensity = -Infinity;
    const intensities = new Float32Array(W * H);
    
    let idx = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let total = 0;
        for (let s of sources) {
          total += Math.abs(s.getWave(x, y, t));
        }
        intensities[idx] = total;
        if (total < minIntensity) minIntensity = total;
        if (total > maxIntensity) maxIntensity = total;
        idx++;
      }
    }

    const range = maxIntensity - minIntensity || 1;
    
    for (let i = 0; i < intensities.length; i++) {
      let normalized = (intensities[i] - minIntensity) / range;
      normalized = Math.pow(normalized, 1 / boost);
      const grey = Math.floor(normalized * 255);
      
      const pixelIdx = i * 4;
      data[pixelIdx] = grey;
      data[pixelIdx + 1] = grey;
      data[pixelIdx + 2] = grey;
      data[pixelIdx + 3] = 255;
    }

    ctx.putImageData(this.densityData, 0, 0);
    this.drawSources();
  }

  drawRadial(sources, t) {
    if (sources.length === 0) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    
    const res = Math.max(1, parseInt(radialResInput.value));
    const boost = parseFloat(boostInput.value);
    
    let minIntensity = Infinity;
    let maxIntensity = -Infinity;
    const points = [];

    for (let y = 0; y < H; y += res) {
      for (let x = 0; x < W; x += res) {
        let total = 0;
        for (let s of sources) {
          total += Math.abs(s.getWave(x, y, t));
        }
        points.push({ x, y, intensity: total });
        if (total < minIntensity) minIntensity = total;
        if (total > maxIntensity) maxIntensity = total;
      }
    }

    const range = maxIntensity - minIntensity || 1;
    
    for (let p of points) {
      let normalized = (p.intensity - minIntensity) / range;
      normalized = Math.pow(normalized, 1 / boost);
      
      if (normalized > 0.05) {
        const grey = Math.floor(normalized * 255);
        ctx.fillStyle = `rgb(${grey},${grey},${grey})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, res * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.drawSources();
  }

  drawSources() {
    ctx.fillStyle = '#fff';
    for (let s of sources) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  draw(sources, t) {
    if (vizMode === 'particle') {
      this.update(sources, t);
      this.drawParticle();
    } else if (vizMode === 'density') {
      this.drawDensity(sources, t);
    } else if (vizMode === 'radial') {
      this.drawRadial(sources, t);
    }
  }
}

const sources = [];
const medium = new Medium();
let t = 0;
let sourceIdCounter = 0;

function addSource(x, y, semitone, amp) {
  const id = sourceIdCounter++;
  sources.push(new WaveSource(
    x, y, 
    semitone !== undefined ? semitone : selectedSemitone, 
    amp !== undefined ? amp : parseFloat(ampInput.value),
    id
  ));
  updateSourceList();
}

function removeSource(id) {
  const idx = sources.findIndex(s => s.id === id);
  if (idx !== -1) {
    sources.splice(idx, 1);
    updateSourceList();
  }
}

function updateAllSourceFreqs() {
  sources.forEach(s => s.updateFreq());
  updateSourceList();
}

function updateSourceList() {
  sourceCount.textContent = sources.length;
  
  if (sources.length === 0) {
    sourceList.innerHTML = 'No sources - click canvas or use presets';
    return;
  }
  
  sourceList.innerHTML = sources.map(s => `
    <div class="source-item">
      <span>S${s.id}: +${s.semitone} (${Math.round(s.noteFreq)}Hz) A=${s.amp.toFixed(1)}</span>
      <button onclick="removeSource(${s.id})" style="padding:2px 6px;margin:0;font-size:10px;">X</button>
    </div>
  `).join('');
}

function getTemplatePositions(template) {
  const cx = W / 2;
  const cy = H / 2;
  const positions = [];

  if (template === 'circle6') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      positions.push([cx + Math.cos(a) * 250, cy + Math.sin(a) * 250]);
    }
  } else if (template === 'circle12') {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      positions.push([cx + Math.cos(a) * 300, cy + Math.sin(a) * 300]);
    }
  } else if (template === 'grid3') {
    const spacing = W / 4;
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        positions.push([spacing * i, spacing * j]);
      }
    }
  } else if (template === 'grid4') {
    const spacing = W / 5;
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        positions.push([spacing * i, spacing * j]);
      }
    }
  } else if (template === 'star5') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      positions.push([cx + Math.cos(a) * 250, cy + Math.sin(a) * 250]);
    }
  } else if (template === 'star8') {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      positions.push([cx + Math.cos(a) * 280, cy + Math.sin(a) * 280]);
    }
  } else if (template === 'corners') {
    const m = 100;
    positions.push([m, m], [W - m, m], [m, H - m], [W - m, H - m]);
  } else if (template === 'cross') {
    positions.push([cx, 100], [cx, H - 100], [100, cy], [W - 100, cy], [cx, cy]);
  }

  return positions;
}

function applyChordAndTemplate() {
  sources.length = 0;
  const amp = parseFloat(ampInput.value);

  let positions;
  if (currentTemplate) {
    positions = getTemplatePositions(currentTemplate);
  } else if (currentChord) {
    const intervals = CHORDS[currentChord];
    positions = intervals.length === 3 ? 
      [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]] :
      [[W/3, H/3], [2*W/3, H/3], [W/3, 2*H/3], [2*W/3, 2*H/3]];
  } else {
    return;
  }

  const semitones = currentChord ? CHORDS[currentChord] : [0];

  positions.forEach((pos, i) => {
    const semitone = semitones[i % semitones.length];
    addSource(pos[0], pos[1], semitone, amp);
  });
}

function setupChord(chordType) {
  currentChord = chordType;
  applyChordAndTemplate();
}

function setupTemplate(template) {
  currentTemplate = template;
  applyChordAndTemplate();
}

function startAudio() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  stopAudio();
  
  sources.forEach(s => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(s.noteFreq, audioCtx.currentTime);
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    oscillators.push({ osc, gain });
  });
  
  playBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopAudio() {
  oscillators.forEach(({ osc }) => {
    osc.stop();
    osc.disconnect();
  });
  oscillators = [];
  playBtn.disabled = false;
  stopBtn.disabled = true;
}

// Auto-update when base note changes
baseNoteSelect.addEventListener('change', () => {
  updateAllSourceFreqs();
  updateNextFreqDisplay();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (W / rect.width);
  const y = (e.clientY - rect.top) * (H / rect.height);
  addSource(x, y);
});

noteButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    noteButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSemitone = parseInt(btn.dataset.semi);
    updateNextFreqDisplay();
  });
});

chordButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    chordButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setupChord(btn.dataset.chord);
  });
});

templateButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    templateButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setupTemplate(btn.dataset.template);
  });
});

vizButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    vizButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    vizMode = btn.dataset.mode;
  });
});

playBtn.addEventListener('click', startAudio);
stopBtn.addEventListener('click', stopAudio);
clearBtn.addEventListener('click', () => {
  sources.length = 0;
  currentChord = null;
  currentTemplate = null;
  chordButtons.forEach(b => b.classList.remove('active'));
  templateButtons.forEach(b => b.classList.remove('active'));
  updateSourceList();
});

window.removeSource = removeSource;

function animate() {
  const speed = parseFloat(speedInput.value);
  medium.draw(sources, t);
  t += speed;
  requestAnimationFrame(animate);
}

updateSourceList();
updateNextFreqDisplay();

// Set default to Major chord
currentChord = 'maj';
applyChordAndTemplate();
document.querySelector('[data-chord="maj"]').classList.add('active');

animate();