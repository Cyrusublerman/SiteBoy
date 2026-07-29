/**
 * VideoFrameScrubber - Choose a poster frame from a locally selected video and
 * hand the captured image back to the caller as an uploadable blob (D-10).
 *
 * One bordered partition of stacked cells: title, source selector, video stage,
 * scrub track, capture action and the captured preview. Seeking is driven by
 * media events, so the component owns no animator and no timer.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Button } from '../../interactive.js';
import { Select } from '../input/Select.js';
import { Slider } from '../input/Slider.js';

/** Scrub resolution in seconds; finer than a frame at any realistic frame rate. */
const SCRUB_STEP_SECONDS = 0.01;

export function formatTimecode(seconds) {
    const total = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    const minutes = Math.floor(total / 60);
    const remainder = total - minutes * 60;
    return `${String(minutes).padStart(2, '0')}:${remainder.toFixed(2).padStart(5, '0')}`;
}

/**
 * Draw the video's current frame into the supplied canvas and encode it.
 * The canvas is passed in so this stays free of DOM construction.
 *
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
export function captureVideoFrame(video, canvas, { mimeType = 'image/webp', quality = 0.9 } = {}) {
    const width = video?.videoWidth || 0;
    const height = video?.videoHeight || 0;
    if (!width || !height) {
        return Promise.reject(new Error('The video has no decoded frame to capture yet.'));
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Frame capture produced no image data.'))),
            mimeType,
            quality,
        );
    });
}

export class VideoFrameScrubber extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'video-frame-scrubber' }, deps);

        this.label = options.label ?? 'POSTER FRAME';
        this.emptyLabel = options.emptyLabel ?? 'NO VIDEO FILES SELECTED';
        this.captureLabel = options.captureLabel ?? 'CAPTURE POSTER FRAME +';
        this.mimeType = options.mimeType ?? 'image/webp';
        this.quality = options.quality ?? 0.9;
        this.onCapture = options.onCapture ?? (() => {});
        this.onStatus = options.onStatus ?? (() => {});

        this.sources = [];
        this.activeId = null;
        this.captures = new Map();
        this.objectUrls = new Set();

        this.bodyElement = null;
        this.emptyElement = null;
        this.videoElement = null;
        this.previewElement = null;
        this.readoutElement = null;
        this.sourceSelect = null;
        this.scrubSlider = null;
        this.captureButton = null;
        this.frameCanvas = null;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('section', 'admin-scrubber');

        const title = this.createElement('div', 'admin-scrubber-title', this.label);
        this.appendElement(this.element, title);

        this.emptyElement = this.createElement('div', 'admin-scrubber-empty', this.emptyLabel);
        this.appendElement(this.element, this.emptyElement);

        this.bodyElement = this.createElement('div', 'admin-scrubber-body');
        this.appendElement(this.element, this.bodyElement);

        const sourceCell = this.createElement('div', 'admin-scrubber-cell');
        this.sourceSelect = this._adopt(new Select({
            options: [],
            onChange: (value) => this.selectSource(value),
        }, this.deps));
        this.appendElement(sourceCell, this.sourceSelect.render());
        this.appendElement(this.bodyElement, sourceCell);

        const stage = this.createElement('div', 'admin-scrubber-stage');
        this.videoElement = this.createElement('video', 'admin-scrubber-video');
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.preload = 'metadata';
        this.videoElement.addEventListener('loadedmetadata', () => this._onMetadata());
        this.videoElement.addEventListener('seeked', () => this._onSeeked());
        this.appendElement(stage, this.videoElement);
        this.appendElement(this.bodyElement, stage);

        const scrubCell = this.createElement('div', 'admin-scrubber-cell');
        this.scrubSlider = this._adopt(new Slider({
            min: 0,
            max: 1,
            step: SCRUB_STEP_SECONDS,
            value: 0,
            ariaLabel: 'Poster frame position in seconds',
            onInput: (value) => this._seekTo(value),
        }, this.deps));
        this.appendElement(scrubCell, this.scrubSlider.render());
        this.appendElement(this.bodyElement, scrubCell);

        const actions = this.createElement('div', 'admin-scrubber-actions');
        this.readoutElement = this.createElement('span', 'admin-scrubber-readout', formatTimecode(0));
        this.appendElement(actions, this.readoutElement);
        this.captureButton = this._adopt(new Button({
            text: this.captureLabel,
            onClick: () => this.capture(),
        }, this.deps));
        this.appendElement(actions, this.captureButton.render());
        this.appendElement(this.bodyElement, actions);

        this.previewElement = this.createElement('img', 'admin-scrubber-preview');
        this.previewElement.alt = 'Captured poster frame';
        this.appendElement(this.bodyElement, this.previewElement);

        this.frameCanvas = this.createElement('canvas', 'admin-scrubber-canvas');

        this._applyEmptyState();
        return this.element;
    }

    _adopt(component) {
        this.children.add(component);
        return component;
    }

    /**
     * @param {Array<{id: string, label: string, file: Blob}>} sources
     */
    setSources(sources) {
        this.sources = (sources || []).filter((source) => source?.file);
        for (const id of [...this.captures.keys()]) {
            if (!this.sources.some((source) => source.id === id)) this._forgetCapture(id);
        }
        this.sourceSelect?.setOptions(this.sources.map(({ id, label }) => ({ value: id, label })));
        const next = this.sources.some((source) => source.id === this.activeId)
            ? this.activeId
            : this.sources[0]?.id ?? null;
        this.activeId = null;
        this.selectSource(next);
        this._applyEmptyState();
    }

    selectSource(id) {
        if (!id || id === this.activeId) return;
        const source = this.sources.find((candidate) => candidate.id === id);
        if (!source) return;
        this.activeId = id;
        this.sourceSelect?.setValue(id);
        const url = URL.createObjectURL(source.file);
        this.objectUrls.add(url);
        if (this.videoElement) {
            this.videoElement.src = url;
            this.videoElement.load();
        }
        this._showPreview(this.captures.get(id)?.previewUrl ?? null);
    }

    getCapture(id) {
        return this.captures.get(id)?.blob ?? null;
    }

    hasCapture(id) {
        return this.captures.has(id);
    }

    async capture() {
        if (!this.activeId || !this.videoElement || !this.frameCanvas) {
            this.onStatus('Select a video before capturing a poster frame.', 'error');
            return null;
        }
        try {
            const blob = await captureVideoFrame(this.videoElement, this.frameCanvas, {
                mimeType: this.mimeType,
                quality: this.quality,
            });
            const previewUrl = URL.createObjectURL(blob);
            this.objectUrls.add(previewUrl);
            this._forgetCapture(this.activeId);
            this.captures.set(this.activeId, { blob, previewUrl });
            this._showPreview(previewUrl);
            this.onCapture(this.activeId, blob, previewUrl);
            this.onStatus(
                `Poster frame captured at ${formatTimecode(this.videoElement.currentTime)}.`,
                'success',
            );
            return blob;
        } catch (error) {
            this.onStatus(error.message, 'error');
            return null;
        }
    }

    _forgetCapture(id) {
        const existing = this.captures.get(id);
        if (!existing) return;
        URL.revokeObjectURL(existing.previewUrl);
        this.objectUrls.delete(existing.previewUrl);
        this.captures.delete(id);
    }

    _seekTo(seconds) {
        if (!this.videoElement) return;
        this.videoElement.currentTime = seconds;
        this._updateReadout(seconds);
    }

    _onMetadata() {
        const duration = Number.isFinite(this.videoElement?.duration) ? this.videoElement.duration : 0;
        this.scrubSlider?.setRange(0, Math.max(duration, SCRUB_STEP_SECONDS));
        this.scrubSlider?.setValue(0);
        this._seekTo(0);
    }

    _onSeeked() {
        this._updateReadout(this.videoElement?.currentTime ?? 0);
    }

    _updateReadout(seconds) {
        if (this.readoutElement) this.readoutElement.textContent = formatTimecode(seconds);
    }

    _showPreview(url) {
        if (!this.previewElement) return;
        this.previewElement.dataset.captured = url ? 'true' : 'false';
        if (url) this.previewElement.src = url;
        else this.previewElement.removeAttribute('src');
    }

    _applyEmptyState() {
        const empty = this.sources.length === 0;
        if (this.emptyElement) this.emptyElement.dataset.visible = empty ? 'true' : 'false';
        if (this.bodyElement) this.bodyElement.dataset.visible = empty ? 'false' : 'true';
    }

    destroy() {
        for (const url of this.objectUrls) URL.revokeObjectURL(url);
        this.objectUrls.clear();
        this.captures.clear();
        this.sources = [];
        this.activeId = null;
        this.bodyElement = null;
        this.emptyElement = null;
        this.videoElement = null;
        this.previewElement = null;
        this.readoutElement = null;
        this.sourceSelect = null;
        this.scrubSlider = null;
        this.captureButton = null;
        this.frameCanvas = null;
        super.destroy();
    }
}
