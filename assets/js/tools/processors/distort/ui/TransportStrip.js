import { BaseComponent } from '../../../../shared/foundation.js';

/**
 * TransportStrip — animation playback controls for DISTORT.
 *
 * Controls: PLAY/PAUSE, STOP, frame scrubber, frame counter, FPS display.
 * Completion-gated: requests next tick only after `notifyFrameDone()` is called,
 * preventing render queue buildup.
 *
 * Emits:
 *   onSeek(frame)   — user scrubbed / pressed STOP to frame 0
 *   onTick(frame)   — fired when playback gates to the next frame
 *   onPlay()        — playback started
 *   onStop()        — playback stopped
 */
export class TransportStrip extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'transport-strip', ...options }, deps);
    this._frameCount = options.frameCount ?? 24;
    this._fps        = options.fps        ?? 12;
    this._onSeek     = options.onSeek     ?? null;
    this._onTick     = options.onTick     ?? null;
    this._onPlay     = options.onPlay     ?? null;
    this._onStop     = options.onStop     ?? null;
    this._playing    = false;
    this._frame      = 0;
    this._waiting    = false;    // completion gate flag
    this._playBtn    = null;
    this._scrubber   = null;
    this._frameLabel = null;
    this._fpsLabel   = null;
    this._fpsTimer   = null;
    this._fpsCount   = 0;
    this._fpsLast    = 0;
    this._lastTickMs = 0;
    this._tickHandle = null;
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'display:flex', 'align-items:center', 'gap:8px',
      'padding:4px 10px',
      'background:var(--vga-darkgrey,#222)',
      'border-top:1px solid var(--vga-grey,#555)',
      'flex-shrink:0'
    ].join(';');

    this._buildPlayBtn();
    this._buildStopBtn();
    this._buildScrubber();
    this._buildFrameLabel();
    this._buildFpsLabel();
    this._buildFpsControl();

    return this;
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  _buildPlayBtn() {
    this._playBtn = this._btn('PLAY', () => this._togglePlay());
    this.element.appendChild(this._playBtn);
  }

  _buildStopBtn() {
    const btn = this._btn('STOP', () => this._stop());
    this.element.appendChild(btn);
  }

  _buildScrubber() {
    const wrap = this.createElement('div', 'scrubber-wrap');
    wrap.style.cssText = 'flex:1;display:flex;align-items:center;gap:4px;min-width:80px';

    this._scrubber = this.createElement('input');
    this._scrubber.type = 'range';
    this._scrubber.min = 0;
    this._scrubber.max = this._frameCount - 1;
    this._scrubber.step = 1;
    this._scrubber.value = 0;
    this._scrubber.style.cssText = 'flex:1;accent-color:var(--vga-white,#eee)';
    this._scrubber.addEventListener('input', () => {
      if (this._playing) this._stopPlayback();
      this._frame = parseInt(this._scrubber.value, 10);
      this._updateLabel();
      this._onSeek?.(this._frame);
    });

    wrap.appendChild(this._scrubber);
    this.element.appendChild(wrap);
  }

  _buildFrameLabel() {
    this._frameLabel = this.createElement('span', 'frame-label', '0 / 0');
    this._frameLabel.style.cssText = 'font-family:Space Mono,monospace;font-size:10px;color:var(--vga-white,#eee);min-width:56px;text-align:right';
    this._updateLabel();
    this.element.appendChild(this._frameLabel);
  }

  _buildFpsLabel() {
    this._fpsLabel = this.createElement('span', 'fps-label', '— FPS');
    this._fpsLabel.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);min-width:52px;text-align:right';
    this.element.appendChild(this._fpsLabel);
  }

  _buildFpsControl() {
    const label = this.createElement('span', '', 'FPS');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888)';

    const input = this.createElement('input');
    input.type = 'number';
    input.min = 1; input.max = 60; input.step = 1;
    input.value = this._fps;
    input.style.cssText = [
      'width:36px', 'background:var(--vga-darkgrey,#222)',
      'color:var(--vga-white,#eee)', 'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 3px'
    ].join(';');
    input.addEventListener('change', () => {
      this._fps = Math.max(1, Math.min(60, parseInt(input.value) || 12));
      input.value = this._fps;
    });

    this.element.append(label, input);
  }

  // ── Playback ─────────────────────────────────────────────────────────────────

  _togglePlay() {
    if (this._playing) this._stopPlayback();
    else this._startPlayback();
  }

  _startPlayback() {
    this._playing = true;
    this._waiting = false;
    this._playBtn.textContent = 'PAUSE';
    this._onPlay?.();
    this._scheduleTick();
  }

  _stopPlayback() {
    this._playing = false;
    this._waiting = false;
    if (this._tickHandle) { clearTimeout(this._tickHandle); this._tickHandle = null; }
    this._playBtn.textContent = 'PLAY';
  }

  _stop() {
    this._stopPlayback();
    this._frame = 0;
    this._scrubber.value = 0;
    this._updateLabel();
    this._onStop?.();
    this._onSeek?.(0);
  }

  _scheduleTick() {
    if (!this._playing || this._waiting) return;
    const interval = 1000 / this._fps;
    const now = Date.now();
    const elapsed = now - this._lastTickMs;
    const delay = Math.max(0, interval - elapsed);
    this._tickHandle = setTimeout(() => this._tick(), delay);
  }

  _tick() {
    this._tickHandle = null;
    if (!this._playing) return;
    this._frame = (this._frame + 1) % this._frameCount;
    this._scrubber.value = this._frame;
    this._updateLabel();
    this._lastTickMs = Date.now();
    this._waiting = true;  // block next tick until render completes
    this._onTick?.(this._frame);
    // FPS tracking
    this._fpsCount++;
    if (Date.now() - this._fpsLast >= 1000) {
      this._fpsLabel.textContent = `${this._fpsCount} FPS`;
      this._fpsCount = 0;
      this._fpsLast = Date.now();
    }
  }

  /** Call when the rendered frame for the last tick is ready. Gates next tick. */
  notifyFrameDone() {
    this._waiting = false;
    if (this._playing) this._scheduleTick();
  }

  // ── Public setters ──────────────────────────────────────────────────────────

  setFrameCount(n) {
    this._frameCount = Math.max(1, n);
    if (this._scrubber) {
      this._scrubber.max = this._frameCount - 1;
      if (this._frame >= this._frameCount) { this._frame = 0; this._scrubber.value = 0; }
    }
    this._updateLabel();
  }

  setFrame(f) {
    this._frame = Math.max(0, Math.min(this._frameCount - 1, f));
    if (this._scrubber) this._scrubber.value = this._frame;
    this._updateLabel();
  }

  get isPlaying() { return this._playing; }
  get currentFrame() { return this._frame; }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _updateLabel() {
    if (this._frameLabel) {
      this._frameLabel.textContent = `${this._frame} / ${this._frameCount - 1}`;
    }
  }

  _btn(text, cb) {
    const b = this.createElement('button', 'transport-btn', text);
    b.style.cssText = [
      'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)', 'font-family:Space Mono,monospace',
      'font-size:9px', 'padding:2px 7px', 'cursor:pointer',
      'letter-spacing:0.5px', 'flex-shrink:0'
    ].join(';');
    b.addEventListener('click', cb);
    return b;
  }

  destroy() {
    this._stopPlayback();
    super.destroy();
  }
}
