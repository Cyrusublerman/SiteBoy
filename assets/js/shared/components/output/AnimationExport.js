/**
 * AnimationExport - Modular animation export component
 * 
 * Provides comprehensive export controls for animated content:
 * - Detects animation type (loop, sequence, infinite)
 * - Multiple output formats (frames, video, GIF)
 * - Pre-rendering without playback
 * - Progress tracking
 * 
 * @extends BaseComponent
 * @version 1.0.0
 */

import { BaseComponent } from '../../foundation.js';

/**
 * Animation metadata interface
 * Tools should provide this to describe their animation
 */
const AnimationMetadata = {
    type: 'none',           // 'none' | 'loop' | 'sequence' | 'infinite'
    loopFrames: 0,          // Frames per complete cycle (0 = unknown/infinite)
    loopDuration: 0,        // Seconds per cycle (calculated from loopFrames/fps)
    sequenceLength: 0,      // Number of checkpoints/keyframes
    sequenceDuration: 0,    // Total sequence duration in seconds
    defaultFps: 60,
    canPrerender: true,     // Can render frames without real-time playback
    renderFrame: null,      // (frameIndex, totalFrames) => void
    getState: null,         // () => object (current parameter state)
    setState: null,         // (state) => void (restore parameter state)
};

export class AnimationExport extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'animation-export' }, deps);
        
        // Animation reference
        this.animation = options.animation ?? null;
        this.canvas = options.canvas ?? null;
        this.getCanvas = options.getCanvas ?? (() => this.canvas);
        
        // Animation metadata (provided by tool)
        this.metadata = {
            type: options.type ?? 'none',
            loopFrames: options.loopFrames ?? 0,
            loopDuration: options.loopDuration ?? 0,
            sequenceLength: options.sequenceLength ?? 0,
            sequenceDuration: options.sequenceDuration ?? 0,
            defaultFps: options.defaultFps ?? 60,
            canPrerender: options.canPrerender ?? true,
            renderFrame: options.renderFrame ?? null,
            getState: options.getState ?? null,
            setState: options.setState ?? null,
        };
        
        // Callbacks
        this.onExportStart = options.onExportStart ?? (() => {});
        this.onExportProgress = options.onExportProgress ?? (() => {});
        this.onExportComplete = options.onExportComplete ?? (() => {});
        this.onExportError = options.onExportError ?? ((err) => console.error(err));
        
        // Export state
        this.state = {
            format: 'frames',       // 'frames' | 'webm' | 'gif' | 'mp4'
            fps: this.metadata.defaultFps,
            frameCount: this._calculateDefaultFrameCount(),
            duration: this._calculateDefaultDuration(),
            resolution: 'canvas',   // 'canvas' | '720p' | '1080p' | '4k' | 'custom'
            customWidth: 1920,
            customHeight: 1080,
            quality: 0.92,
            bitrate: 8000000,
            filename: '',
            preview: false,

            // Runtime state
            isExporting: false,
            progress: 0,
            currentFrame: 0,
            totalFrames: 0,
        };
        
        // RecordRTC instance
        this.recorder = null;
        
        // Frame buffer for pre-render
        this.frameBuffer = [];
        
        // Child components
        this.components = {};
    }
    
    _calculateDefaultFrameCount() {
        if (this.metadata.loopFrames > 0) {
            return this.metadata.loopFrames;
        }
        if (this.metadata.sequenceDuration > 0) {
            return Math.ceil(this.metadata.sequenceDuration * this.metadata.defaultFps);
        }
        // Default: 5 seconds
        return this.metadata.defaultFps * 5;
    }
    
    _calculateDefaultDuration() {
        if (this.metadata.loopDuration > 0) {
            return this.metadata.loopDuration;
        }
        if (this.metadata.sequenceDuration > 0) {
            return this.metadata.sequenceDuration;
        }
        if (this.metadata.loopFrames > 0) {
            return this.metadata.loopFrames / this.metadata.defaultFps;
        }
        return 5; // 5 seconds default
    }
    
    _getAvailableFormats() {
        const formats = [
            { value: 'frames', label: 'PNG Sequence (ZIP)', available: true },
        ];
        
        // Check RecordRTC availability
        const hasRecordRTC = typeof RecordRTC !== 'undefined';
        
        // Check native MediaRecorder codecs
        const webmSupported = typeof MediaRecorder !== 'undefined' && 
            MediaRecorder.isTypeSupported('video/webm');
        const mp4Supported = typeof MediaRecorder !== 'undefined' && 
            MediaRecorder.isTypeSupported('video/mp4');
        
        if (hasRecordRTC) {
            formats.push({ value: 'gif', label: 'GIF Animation', available: true });
        }
        
        if (webmSupported || hasRecordRTC) {
            formats.push({ value: 'webm', label: 'Video (WebM)', available: true });
        }
        
        if (mp4Supported) {
            formats.push({ value: 'mp4', label: 'Video (MP4)', available: true });
        }
        
        return formats;
    }
    
    _getResolutionPresets() {
        return [
            { value: 'canvas', label: 'Canvas Size' },
            { value: '720p', label: '720p (1280×720)', width: 1280, height: 720 },
            { value: '1080p', label: '1080p (1920×1080)', width: 1920, height: 1080 },
            { value: '4k', label: '4K (3840×2160)', width: 3840, height: 2160 },
            { value: 'square', label: 'Square (1080×1080)', width: 1080, height: 1080 },
            { value: 'portrait', label: 'Portrait (1080×1920)', width: 1080, height: 1920 },
            { value: 'custom', label: 'Custom...' },
        ];
    }
    
    render() {
        if (this.element) return this.element;
        
        this.element = this.createElement('div', 'animation-export');
        
        this._renderAnimationInfo();
        this._renderFormatSelector();
        this._renderTimingControls();
        this._renderResolutionControls();
        this._renderQualityControls();
        this._renderFilenameControl();
        this._renderPreviewControl();
        this._renderExportButtons();
        this._renderProgress();
        
        return this.element;
    }
    
    _renderAnimationInfo() {
        const info = this.createElement('div', 'export-info');
        
        let infoText = '';
        switch (this.metadata.type) {
            case 'loop':
                const loopSecs = (this.metadata.loopFrames / this.metadata.defaultFps).toFixed(1);
                infoText = `Loop: ${this.metadata.loopFrames} frames (${loopSecs}s @ ${this.metadata.defaultFps}fps)`;
                break;
            case 'sequence':
                infoText = `Sequence: ${this.metadata.sequenceLength} checkpoints (${this.metadata.sequenceDuration.toFixed(1)}s)`;
                break;
            case 'infinite':
                infoText = 'Animation: Infinite (user-controlled duration)';
                break;
            default:
                infoText = 'Static image (no animation)';
        }
        
        info.textContent = infoText;
        this.element.appendChild(info);
    }
    
    _renderFormatSelector() {
        const row = this.createElement('div', 'export-row');
        
        const label = this.createElement('label', 'export-label');
        label.textContent = 'Format';
        row.appendChild(label);
        
        const select = this.createElement('select', 'export-select');
        const formats = this._getAvailableFormats();
        
        formats.forEach(fmt => {
            const option = this.createElement('option');
            option.value = fmt.value;
            option.textContent = fmt.label;
            option.disabled = !fmt.available;
            if (fmt.value === this.state.format) option.selected = true;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.state.format = e.target.value;
            this._updateUI();
        });
        
        row.appendChild(select);
        this.element.appendChild(row);
    }
    
    _renderTimingControls() {
        const container = this.createElement('div', 'export-timing');
        
        // FPS
        const fpsRow = this.createElement('div', 'export-row');
        const fpsLabel = this.createElement('label', 'export-label');
        fpsLabel.textContent = 'FPS';
        
        const fpsInput = this.createElement('input', 'export-input');
        fpsInput.type = 'number';
        fpsInput.min = 1;
        fpsInput.max = 120;
        fpsInput.value = this.state.fps;
        fpsInput.addEventListener('change', (e) => {
            this.state.fps = parseInt(e.target.value) || 60;
            this._updateDurationFromFrames();
        });
        
        fpsRow.appendChild(fpsLabel);
        fpsRow.appendChild(fpsInput);
        container.appendChild(fpsRow);
        
        // Frame count
        const framesRow = this.createElement('div', 'export-row');
        const framesLabel = this.createElement('label', 'export-label');
        framesLabel.textContent = 'Frames';
        
        const framesInput = this.createElement('input', 'export-input');
        framesInput.type = 'number';
        framesInput.min = 1;
        framesInput.max = 36000; // 10 min @ 60fps
        framesInput.value = this.state.frameCount;
        framesInput.id = 'export-frames-input';
        framesInput.addEventListener('change', (e) => {
            this.state.frameCount = parseInt(e.target.value) || 60;
            this._updateDurationFromFrames();
        });
        
        framesRow.appendChild(framesLabel);
        framesRow.appendChild(framesInput);
        container.appendChild(framesRow);
        
        // Duration (calculated)
        const durRow = this.createElement('div', 'export-row');
        const durLabel = this.createElement('label', 'export-label');
        durLabel.textContent = 'Duration';
        
        const durInput = this.createElement('input', 'export-input');
        durInput.type = 'number';
        durInput.min = 0.1;
        durInput.max = 600;
        durInput.step = 0.1;
        durInput.value = this.state.duration.toFixed(1);
        durInput.id = 'export-duration-input';
        durInput.addEventListener('change', (e) => {
            this.state.duration = parseFloat(e.target.value) || 5;
            this._updateFramesFromDuration();
        });
        
        const durSuffix = this.createElement('span', 'export-suffix');
        durSuffix.textContent = 's';
        
        durRow.appendChild(durLabel);
        durRow.appendChild(durInput);
        durRow.appendChild(durSuffix);
        container.appendChild(durRow);
        
        // Quick preset buttons if loop/sequence known
        if (this.metadata.loopFrames > 0 || this.metadata.sequenceDuration > 0) {
            const presetRow = this.createElement('div', 'export-presets');
            
            if (this.metadata.loopFrames > 0) {
                const loopBtn = this.createElement('button', 'export-preset-btn');
                loopBtn.textContent = '1 Loop';
                loopBtn.addEventListener('click', () => {
                    this.state.frameCount = this.metadata.loopFrames;
                    this._updateDurationFromFrames();
                    this._updateUI();
                });
                presetRow.appendChild(loopBtn);
                
                const loop2Btn = this.createElement('button', 'export-preset-btn');
                loop2Btn.textContent = '2 Loops';
                loop2Btn.addEventListener('click', () => {
                    this.state.frameCount = this.metadata.loopFrames * 2;
                    this._updateDurationFromFrames();
                    this._updateUI();
                });
                presetRow.appendChild(loop2Btn);
            }
            
            if (this.metadata.sequenceDuration > 0) {
                const seqBtn = this.createElement('button', 'export-preset-btn');
                seqBtn.textContent = 'Full Sequence';
                seqBtn.addEventListener('click', () => {
                    this.state.duration = this.metadata.sequenceDuration;
                    this._updateFramesFromDuration();
                    this._updateUI();
                });
                presetRow.appendChild(seqBtn);
            }
            
            container.appendChild(presetRow);
        }
        
        this.element.appendChild(container);
    }
    
    _renderResolutionControls() {
        // Only show for video formats
        if (this.state.format === 'frames') return;
        
        const row = this.createElement('div', 'export-row');
        
        const label = this.createElement('label', 'export-label');
        label.textContent = 'Resolution';
        row.appendChild(label);
        
        const select = this.createElement('select', 'export-select');
        const presets = this._getResolutionPresets();
        
        presets.forEach(preset => {
            const option = this.createElement('option');
            option.value = preset.value;
            option.textContent = preset.label;
            if (preset.value === this.state.resolution) option.selected = true;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.state.resolution = e.target.value;
            this._updateUI();
        });
        
        row.appendChild(select);
        this.element.appendChild(row);
        
        // Custom resolution inputs
        if (this.state.resolution === 'custom') {
            this._renderCustomResolution();
        }
    }
    
    _renderCustomResolution() {
        const row = this.createElement('div', 'export-row export-custom-res');
        
        const widthInput = this.createElement('input', 'export-input');
        widthInput.type = 'number';
        widthInput.min = 100;
        widthInput.max = 7680;
        widthInput.value = this.state.customWidth;
        widthInput.placeholder = 'Width';
        widthInput.addEventListener('change', (e) => {
            this.state.customWidth = parseInt(e.target.value) || 1920;
        });
        
        const x = this.createElement('span');
        x.textContent = '×';
        
        const heightInput = this.createElement('input', 'export-input');
        heightInput.type = 'number';
        heightInput.min = 100;
        heightInput.max = 4320;
        heightInput.value = this.state.customHeight;
        heightInput.placeholder = 'Height';
        heightInput.addEventListener('change', (e) => {
            this.state.customHeight = parseInt(e.target.value) || 1080;
        });
        
        row.appendChild(widthInput);
        row.appendChild(x);
        row.appendChild(heightInput);
        this.element.appendChild(row);
    }
    
    _renderQualityControls() {
        // Only show for video/image formats
        if (this.state.format === 'frames') return;
        
        const container = this.createElement('div', 'export-quality');
        
        // Quality slider
        const qualityRow = this.createElement('div', 'export-row');
        const qualityLabel = this.createElement('label', 'export-label');
        qualityLabel.textContent = 'Quality';
        
        const qualityInput = this.createElement('input', 'export-input');
        qualityInput.type = 'range';
        qualityInput.min = 50;
        qualityInput.max = 100;
        qualityInput.value = Math.round(this.state.quality * 100);
        
        const qualityValue = this.createElement('span', 'export-value');
        qualityValue.textContent = Math.round(this.state.quality * 100) + '%';
        
        qualityInput.addEventListener('input', (e) => {
            this.state.quality = parseInt(e.target.value) / 100;
            qualityValue.textContent = e.target.value + '%';
        });
        
        qualityRow.appendChild(qualityLabel);
        qualityRow.appendChild(qualityInput);
        qualityRow.appendChild(qualityValue);
        container.appendChild(qualityRow);
        
        // Bitrate for video
        if (this.state.format === 'webm' || this.state.format === 'mp4') {
            const bitrateRow = this.createElement('div', 'export-row');
            const bitrateLabel = this.createElement('label', 'export-label');
            bitrateLabel.textContent = 'Bitrate';
            
            const bitrateSelect = this.createElement('select', 'export-select');
            const bitrates = [
                { value: 2000000, label: '2 Mbps (smaller)' },
                { value: 5000000, label: '5 Mbps (balanced)' },
                { value: 8000000, label: '8 Mbps (quality)' },
                { value: 15000000, label: '15 Mbps (high)' },
            ];
            
            bitrates.forEach(br => {
                const option = this.createElement('option');
                option.value = br.value;
                option.textContent = br.label;
                if (br.value === this.state.bitrate) option.selected = true;
                bitrateSelect.appendChild(option);
            });
            
            bitrateSelect.addEventListener('change', (e) => {
                this.state.bitrate = parseInt(e.target.value);
            });
            
            bitrateRow.appendChild(bitrateLabel);
            bitrateRow.appendChild(bitrateSelect);
            container.appendChild(bitrateRow);
        }
        
        this.element.appendChild(container);
    }

    _renderFilenameControl() {
        const row = this.createElement('div', 'export-row');

        const label = this.createElement('label', 'export-label');
        label.textContent = 'Filename';

        const input = this.createElement('input', 'export-input export-filename-input');
        input.type = 'text';
        input.placeholder = 'animation (auto)';
        input.value = this.state.filename;
        input.addEventListener('input', (e) => {
            this.state.filename = e.target.value;
        });

        row.appendChild(label);
        row.appendChild(input);
        this.element.appendChild(row);
    }

    _renderPreviewControl() {
        const row = this.createElement('div', 'export-row');

        const label = this.createElement('label', 'export-label');
        label.textContent = 'Preview';

        const btn = this.createElement('button', 'export-toggle-btn');
        const update = () => {
            btn.textContent = this.state.preview ? 'ON' : 'OFF';
            btn.style.color = this.state.preview ? 'var(--vga-aqua)' : 'var(--vga-white)';
        };
        update();
        btn.addEventListener('click', () => {
            this.state.preview = !this.state.preview;
            update();
        });

        row.appendChild(label);
        row.appendChild(btn);
        this.element.appendChild(row);
    }

    _renderExportButtons() {
        const row = this.createElement('div', 'export-buttons');
        
        const exportBtn = this.createElement('button', 'export-btn export-btn-primary');
        exportBtn.textContent = 'EXPORT';
        exportBtn.addEventListener('click', () => this.startExport());
        this.components.exportBtn = exportBtn;
        row.appendChild(exportBtn);
        
        const cancelBtn = this.createElement('button', 'export-btn export-btn-secondary');
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.style.display = 'none';
        cancelBtn.addEventListener('click', () => this.cancelExport());
        this.components.cancelBtn = cancelBtn;
        row.appendChild(cancelBtn);
        
        this.element.appendChild(row);
    }
    
    _renderProgress() {
        const container = this.createElement('div', 'export-progress');
        container.style.display = 'none';
        
        const bar = this.createElement('div', 'export-progress-bar');
        const fill = this.createElement('div', 'export-progress-fill');
        bar.appendChild(fill);
        this.components.progressFill = fill;
        
        const text = this.createElement('div', 'export-progress-text');
        text.textContent = 'Preparing...';
        this.components.progressText = text;
        
        container.appendChild(bar);
        container.appendChild(text);
        this.components.progressContainer = container;
        this.element.appendChild(container);
    }
    
    _updateUI() {
        // Re-render by replacing element content
        if (this.element && this.element.parentNode) {
            const parent = this.element.parentNode;
            const oldElement = this.element;
            this.element = null;
            parent.replaceChild(this.render(), oldElement);
        }
    }
    
    _updateDurationFromFrames() {
        this.state.duration = this.state.frameCount / this.state.fps;
        const durInput = this.element?.querySelector('#export-duration-input');
        if (durInput) durInput.value = this.state.duration.toFixed(1);
    }
    
    _updateFramesFromDuration() {
        this.state.frameCount = Math.ceil(this.state.duration * this.state.fps);
        const framesInput = this.element?.querySelector('#export-frames-input');
        if (framesInput) framesInput.value = this.state.frameCount;
    }
    
    _showProgress(show) {
        if (this.components.progressContainer) {
            this.components.progressContainer.style.display = show ? 'block' : 'none';
        }
        if (this.components.exportBtn) {
            this.components.exportBtn.disabled = show;
        }
        if (this.components.cancelBtn) {
            this.components.cancelBtn.style.display = show ? 'inline-block' : 'none';
        }
    }
    
    _updateProgress(current, total, message) {
        const percent = (current / total) * 100;
        
        if (this.components.progressFill) {
            this.components.progressFill.style.width = percent + '%';
        }
        if (this.components.progressText) {
            this.components.progressText.textContent = message || `Frame ${current}/${total}`;
        }
        
        this.state.progress = percent;
        this.state.currentFrame = current;
        this.state.totalFrames = total;
        
        this.onExportProgress(current, total, percent);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Update animation metadata (call when checkpoints change, etc.)
     */
    updateMetadata(metadata) {
        Object.assign(this.metadata, metadata);
        this.state.frameCount = this._calculateDefaultFrameCount();
        this.state.duration = this._calculateDefaultDuration();
        this._updateUI();
    }
    
    /**
     * Start export process
     */
    async startExport() {
        if (this.state.isExporting) return;
        
        this.state.isExporting = true;
        this._showProgress(true);
        this.onExportStart(this.state.format);
        
        try {
            switch (this.state.format) {
                case 'frames':
                    await this._exportFrames();
                    break;
                case 'gif':
                    await this._exportGif();
                    break;
                case 'webm':
                case 'mp4':
                    await this._exportVideo(this.state.format);
                    break;
            }
        } catch (error) {
            this.onExportError(error);
        } finally {
            this.state.isExporting = false;
            this._showProgress(false);
        }
    }
    
    /**
     * Cancel ongoing export
     */
    cancelExport() {
        if (this.recorder) {
            this.recorder.stopRecording?.();
            this.recorder = null;
        }
        this.state.isExporting = false;
        this.frameBuffer = [];
        this._showProgress(false);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // EXPORT IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════════
    
    async _exportFrames() {
        const canvas = this.getCanvas();
        if (!canvas) throw new Error('No canvas available');
        
        const totalFrames = this.state.frameCount;
        this.frameBuffer = [];
        
        // Store original state
        const originalState = this.metadata.getState?.();
        
        for (let i = 0; i < totalFrames; i++) {
            if (!this.state.isExporting) break; // Cancelled
            
            // Render frame
            if (this.metadata.renderFrame) {
                this.metadata.renderFrame(i, totalFrames);
            }
            
            // Capture frame
            const dataUrl = canvas.toDataURL('image/png');
            this.frameBuffer.push({
                index: i,
                data: dataUrl.split(',')[1] // Base64 data only
            });
            
            this._updateProgress(i + 1, totalFrames, `Rendering frame ${i + 1}/${totalFrames}`);
            
            // Yield to UI — skipped in silent mode for faster export
            if (this.state.preview) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        // Restore original state
        if (originalState && this.metadata.setState) {
            this.metadata.setState(originalState);
        }
        
        // Create ZIP
        await this._createFrameZip();
    }
    
    async _createFrameZip() {
        this._updateProgress(this.state.frameCount, this.state.frameCount, 'Creating ZIP...');

        // Ensure JSZip is loaded for frame export
        if (typeof JSZip === 'undefined') {
            try {
                this._updateProgress(this.state.frameCount, this.state.frameCount, 'Loading ZIP library...');
                if (window.AssetLoader && window.AssetLoader.ensureJSZip) {
                    await window.AssetLoader.ensureJSZip();
                } else {
                    throw new Error('AssetLoader not available for lazy loading JSZip');
                }
            } catch (err) {
                console.warn('Failed to load JSZip, downloading first frame only:', err.message);
                if (this.frameBuffer.length > 0) {
                    this._downloadDataUrl(
                        'data:image/png;base64,' + this.frameBuffer[0].data,
                        'frame-0000.png'
                    );
                }
                this.onExportComplete('frames', null);
                return;
            }
        }
        
        const zip = new JSZip();
        const folder = zip.folder('frames');
        
        this.frameBuffer.forEach(frame => {
            const paddedNum = String(frame.index).padStart(4, '0');
            folder.file(`frame-${paddedNum}.png`, frame.data, { base64: true });
        });
        
        // Add metadata file
        folder.file('metadata.json', JSON.stringify({
            fps: this.state.fps,
            frameCount: this.frameBuffer.length,
            duration: this.state.duration,
            exportedAt: new Date().toISOString()
        }, null, 2));
        
        const blob = await zip.generateAsync({ type: 'blob' });
        this._downloadBlob(blob, this._buildFilename('zip'));
        
        this.frameBuffer = [];
        this.onExportComplete('frames', blob);
    }
    
    async _exportGif() {
        // Ensure RecordRTC is loaded for GIF export
        if (typeof RecordRTC === 'undefined') {
            try {
                this._updateProgress(0, 1, 'Loading video export library...');
                if (window.AssetLoader && window.AssetLoader.ensureRecordRTC) {
                    await window.AssetLoader.ensureRecordRTC();
                } else {
                    throw new Error('AssetLoader not available for lazy loading RecordRTC');
                }
            } catch (err) {
                throw new Error(`Failed to load RecordRTC for GIF export: ${err.message}`);
            }
        }
        
        const canvas = this.getCanvas();
        if (!canvas) throw new Error('No canvas available');
        
        this._updateProgress(0, 100, 'Starting GIF recording...');
        
        // Use RecordRTC's GifRecorder
        this.recorder = new RecordRTC(canvas, {
            type: 'gif',
            frameRate: this.state.fps,
            quality: Math.round(this.state.quality * 10),
            width: canvas.width,
            height: canvas.height
        });
        
        this.recorder.startRecording();
        
        // Render frames
        const totalFrames = this.state.frameCount;
        const frameInterval = 1000 / this.state.fps;
        const originalState = this.metadata.getState?.();
        
        for (let i = 0; i < totalFrames; i++) {
            if (!this.state.isExporting) break;
            
            if (this.metadata.renderFrame) {
                this.metadata.renderFrame(i, totalFrames);
            }
            
            this._updateProgress(i + 1, totalFrames, `Recording frame ${i + 1}/${totalFrames}`);
            
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
        
        // Restore state
        if (originalState && this.metadata.setState) {
            this.metadata.setState(originalState);
        }
        
        // Stop and save
        return new Promise((resolve) => {
            this.recorder.stopRecording(() => {
                const blob = this.recorder.getBlob();
                this._downloadBlob(blob, this._buildFilename('gif'));
                this.recorder = null;
                this.onExportComplete('gif', blob);
                resolve();
            });
        });
    }
    
    async _exportVideo(format) {
        const canvas = this.getCanvas();
        if (!canvas) throw new Error('No canvas available');
        
        // Determine codec
        let mimeType;
        if (format === 'mp4') {
            const mp4Codecs = ['video/mp4;codecs=avc1.42E01E', 'video/mp4'];
            mimeType = mp4Codecs.find(c => MediaRecorder.isTypeSupported(c));
            if (!mimeType && typeof RecordRTC !== 'undefined') {
                // Fall back to RecordRTC
                return this._exportVideoRecordRTC(format);
            }
        } else {
            const webmCodecs = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
            mimeType = webmCodecs.find(c => MediaRecorder.isTypeSupported(c));
        }
        
        if (!mimeType) {
            throw new Error(`No codec available for ${format}`);
        }
        
        this._updateProgress(0, 100, 'Starting video recording...');
        
        const stream = canvas.captureStream(0);
        const chunks = [];
        
        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: this.state.bitrate
        });
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };
        
        return new Promise((resolve, reject) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                this._downloadBlob(blob, this._buildFilename(format));
                this.onExportComplete(format, blob);
                resolve();
            };
            
            recorder.onerror = reject;
            recorder.start();
            
            // Render frames
            this._renderFramesForRecording(stream, recorder);
        });
    }
    
    async _renderFramesForRecording(stream, recorder) {
        const totalFrames = this.state.frameCount;
        const frameInterval = 1000 / this.state.fps;
        const originalState = this.metadata.getState?.();
        
        for (let i = 0; i < totalFrames; i++) {
            if (!this.state.isExporting) break;
            
            if (this.metadata.renderFrame) {
                this.metadata.renderFrame(i, totalFrames);
            }
            
            // Request frame capture
            const track = stream.getVideoTracks()[0];
            if (track?.requestFrame) {
                track.requestFrame();
            }
            
            this._updateProgress(i + 1, totalFrames, `Recording frame ${i + 1}/${totalFrames}`);
            
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
        
        // Restore state
        if (originalState && this.metadata.setState) {
            this.metadata.setState(originalState);
        }
        
        // Stop recording
        recorder.stop();
    }
    
    async _exportVideoRecordRTC(format) {
        // Ensure RecordRTC is loaded for video export
        if (typeof RecordRTC === 'undefined') {
            try {
                this._updateProgress(0, 1, 'Loading video export library...');
                if (window.AssetLoader && window.AssetLoader.ensureRecordRTC) {
                    await window.AssetLoader.ensureRecordRTC();
                } else {
                    throw new Error('AssetLoader not available for lazy loading RecordRTC');
                }
            } catch (err) {
                throw new Error(`Failed to load RecordRTC for video export: ${err.message}`);
            }
        }
        
        const canvas = this.getCanvas();
        
        this.recorder = new RecordRTC(canvas, {
            type: 'canvas',
            mimeType: format === 'mp4' ? 'video/webm' : 'video/webm', // RecordRTC uses WebM
            disableLogs: true,
            frameRate: this.state.fps
        });
        
        this.recorder.startRecording();
        
        // Render frames
        const totalFrames = this.state.frameCount;
        const frameInterval = 1000 / this.state.fps;
        const originalState = this.metadata.getState?.();
        
        for (let i = 0; i < totalFrames; i++) {
            if (!this.state.isExporting) break;
            
            if (this.metadata.renderFrame) {
                this.metadata.renderFrame(i, totalFrames);
            }
            
            this._updateProgress(i + 1, totalFrames, `Recording frame ${i + 1}/${totalFrames}`);
            
            await new Promise(resolve => setTimeout(resolve, frameInterval));
        }
        
        // Restore state
        if (originalState && this.metadata.setState) {
            this.metadata.setState(originalState);
        }
        
        return new Promise((resolve) => {
            this.recorder.stopRecording(() => {
                const blob = this.recorder.getBlob();
                this._downloadBlob(blob, this._buildFilename('webm'));
                this.recorder = null;
                this.onExportComplete('webm', blob);
                resolve();
            });
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════
    
    _buildFilename(ext) {
        const base = this.state.filename.trim() || `animation-${Date.now()}`;
        return `${base}.${ext}`;
    }

    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    _downloadDataUrl(dataUrl, filename) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
    }
    
    destroy() {
        this.cancelExport();
        super.destroy();
    }
}

