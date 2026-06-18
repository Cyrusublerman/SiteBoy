import { BaseComponent } from '../../../../shared/foundation.js';
import { AnimationLoop } from '../../../../core/animation-foundation.js';
import { Slider } from '../../../../shared/components/input/Slider.js';

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
    this._scrubberComp = null;
    this._scrubber = null;
    this._frameLabel = null;
    this._fpsLabel = null;
  }

  render() {
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      align-items: stretch;
      height: ${F * 2}px;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
      flex-shrink: 0;
      min-height: 0;
    `;

    // Horizontal stack — border-left for internal boundaries, border-right on NEXT → to close the button group
    this._prevBtn = this._buildButton('← PREV', () => this._goPrev(), false, false, false);
    this._playBtn = this._buildButton('▶',      () => this._togglePlay(), true,  true,  false);
    this._nextBtn = this._buildButton('NEXT →', () => this._goNext(), false,     true,  true);

    this._scrubberComp = new Slider({
      min: 0,
      max: Math.max(0, this._frameCount - 1),
      step: 1,
      value: 0,
      borders: { top: false, right: false, bottom: false, left: false },
      onInput: (v) => {
        this._pause();
        this._seekTo(v);
      },
    }, this.deps);
    this.componentInstances.push(this._scrubberComp);
    this._scrubber = this._scrubberComp.render();
    this._scrubber.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      margin: 0 0 0 ${F}px;
      cursor: pointer;
      min-width: 0;
    `;

    this._frameLabel = this._buildReadout('1 / 1', `${F * 5}px`);
    this._fpsLabel   = this._buildReadout(`${this._fps} FPS`, `${F * 4}px`, true);

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

  // iconOnly: fixed F*2 width. hasLeftBorder/hasRightBorder: §4 horizontal stack boundaries.
  _buildButton(text, onClick, iconOnly = false, hasLeftBorder = false, hasRightBorder = false) {
    const { F } = this.getF();
    const button = this.createElement('button', 'distort-transport-button');
    button.type = 'button';
    button.textContent = text;
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      ${iconOnly ? `width: ${F * 2}px;` : `padding: 0 ${F}px;`}
      border-top: none;
      border-bottom: none;
      border-left: ${hasLeftBorder ? '1px solid var(--c-border)' : 'none'};
      border-right: ${hasRightBorder ? '1px solid var(--c-border)' : 'none'};
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
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

  // muted: FPS label is secondary info — text-treatment §2 permits var(--c-border) for muted readouts.
  _buildReadout(text, minWidth, muted = false) {
    const { F } = this.getF();
    const el = this.createElement('span', 'distort-transport-readout', text);
    el.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: ${minWidth};
      padding: 0 ${F}px;
      color: ${muted ? 'var(--c-border)' : 'var(--c-text)'};
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      flex-shrink: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      box-sizing: border-box;
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
    if (this._playBtn) this._playBtn.textContent = '⏸';
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
    if (this._scrubberComp) this._scrubberComp.setValue(this._frameIdx);
    if (this._frameLabel) this._frameLabel.textContent = `${this._frameIdx + 1} / ${this._frameCount}`;
    if (this._fpsLabel) this._fpsLabel.textContent = `${this._fps} FPS`;
  }

  setFrameCount(n) {
    this._frameCount = Math.max(1, n);
    if (this._frameIdx >= this._frameCount) this._frameIdx = this._frameCount - 1;
    if (this._scrubberComp) this._scrubberComp.setRange(0, Math.max(0, this._frameCount - 1));
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
    this._scrubberComp?.destroy();
    this._scrubberComp = null;
    super.destroy();
  }
}
