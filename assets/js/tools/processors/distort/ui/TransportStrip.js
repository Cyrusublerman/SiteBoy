import { BaseComponent } from '../../../../shared/foundation.js';
import { AnimationLoop } from '../../../../core/animation-foundation.js';

export class TransportStrip extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'transport-strip', ...options }, deps);
    this._frameCount = Math.max(1, options.frameCount ?? 1);
    this._fps = Math.max(1, options.fps ?? 24);
    this._onFrame = options.onFrame ?? null;

    this._frameIdx = 0;
    this._playing = false;
    this._loop = null;

    this._prevBtn = null;
    this._playBtn = null;
    this._nextBtn = null;
    this._scrubber = null;
    this._frameLabel = null;
    this._fpsLabel = null;
  }

  render() {
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F}px;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
      flex-shrink: 0;
      min-height: 0;
    `;

    this._prevBtn = this._buildButton('◀', () => this._goPrev());
    this._playBtn = this._buildButton('▶', () => this._togglePlay());
    this._nextBtn = this._buildButton('▶▶', () => this._goNext());

    this._scrubber = this.createElement('input', 'distort-transport-scrubber');
    this._scrubber.type = 'range';
    this._scrubber.min = '0';
    this._scrubber.max = String(Math.max(0, this._frameCount - 1));
    this._scrubber.step = '1';
    this._scrubber.value = '0';
    this._scrubber.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      margin: 0;
      accent-color: var(--c-text);
      cursor: pointer;
    `;
    this._scrubber.addEventListener('input', () => {
      this._pause();
      this._seekTo(Number(this._scrubber.value));
    });

    this._frameLabel = this._buildReadout('1 / 1', `${F * 5}px`, 'var(--c-text)');
    this._fpsLabel = this._buildReadout(`${this._fps} FPS`, `${F * 4}px`, 'var(--c-border)');

    this.element.append(
      this._prevBtn,
      this._playBtn,
      this._nextBtn,
      this._scrubber,
      this._frameLabel,
      this._fpsLabel
    );

    this._loop = new AnimationLoop({
      fps: this._fps,
      onFrame: () => {
        if (this._frameCount <= 1) return;
        this._frameIdx = (this._frameIdx + 1) % this._frameCount;
        this._emitFrame();
      }
    });

    this._syncUI();
    return this.element;
  }

  _buildButton(text, onClick) {
    const { F } = this.getF();
    const button = this.createElement('button', 'distort-transport-button');
    button.type = 'button';
    button.textContent = text;
    button.style.cssText = `
      width: ${F * 2}px;
      height: ${F * 2}px;
      border: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    `;
    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--c-text)';
      button.style.color = 'var(--c-bg)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'var(--c-bg)';
      button.style.color = 'var(--c-text)';
    });
    button.addEventListener('click', onClick);
    return button;
  }

  _buildReadout(text, minWidth, color) {
    const { F } = this.getF();
    const el = this.createElement('span', 'distort-transport-readout', text);
    el.style.cssText = `
      min-width: ${minWidth};
      text-align: right;
      color: ${color};
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      flex-shrink: 0;
    `;
    return el;
  }

  _togglePlay() {
    if (this._playing) this._pause();
    else this._play();
  }

  _play() {
    if (this._frameCount <= 1) return;
    this._playing = true;
    if (this._playBtn) this._playBtn.textContent = '■';
    this._loop?.start();
  }

  _pause() {
    this._playing = false;
    if (this._playBtn) this._playBtn.textContent = '▶';
    this._loop?.stop();
  }

  _seekTo(idx) {
    this._frameIdx = Math.max(0, Math.min(this._frameCount - 1, idx));
    this._emitFrame();
  }

  _goPrev() {
    this._pause();
    this._seekTo(this._frameIdx - 1);
  }

  _goNext() {
    this._pause();
    this._seekTo(this._frameIdx + 1);
  }

  _emitFrame() {
    this._onFrame?.(this._frameIdx);
    this._syncUI();
  }

  _syncUI() {
    if (this._scrubber) this._scrubber.value = String(this._frameIdx);
    if (this._frameLabel) this._frameLabel.textContent = `${this._frameIdx + 1} / ${this._frameCount}`;
    if (this._fpsLabel) this._fpsLabel.textContent = `${this._fps} FPS`;
  }

  setFrameCount(n) {
    this._frameCount = Math.max(1, n);
    if (this._frameIdx >= this._frameCount) this._frameIdx = this._frameCount - 1;
    if (this._scrubber) this._scrubber.max = String(Math.max(0, this._frameCount - 1));
    if (this._frameCount <= 1) this._pause();
    this._syncUI();
  }

  setFrameIndex(idx) {
    this._frameIdx = Math.max(0, Math.min(this._frameCount - 1, idx));
    this._syncUI();
  }

  setFps(fps) {
    this._fps = Math.max(1, Math.round(fps));
    if (this._loop) this._loop.fps = this._fps;
    this._syncUI();
  }

  destroy() {
    this._loop?.destroy();
    this._loop = null;
    super.destroy();
  }
}
