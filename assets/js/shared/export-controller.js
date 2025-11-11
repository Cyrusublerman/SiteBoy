/**
 * ExportController Component - SiteBoy Framework
 * 
 * Handles animation export with aspect ratio presets and video recording
 * Uses MediaRecorder API for video, canvas.toBlob for images
 * Supports live aspect ratio switching
 * 
 * @version 2.0.0
 */

import { BaseComponent } from './foundation.js';

export class ExportController extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'export-presets' }, deps);
        
        this.animation = options.animation; // Reference to animation instance
        this.loopFrames = options.loopFrames || 0; // Loop length in frames
        this.onExport = options.onExport || (() => {});
        this.livePreview = options.livePreview !== false; // Default true
        
        this.state = {
            format: 'png',          // png, jpeg, webm, mp4
            aspectRatio: 'current', // square, portrait, story, landscape, current
            duration: this.loopFrames > 0 ? this.loopFrames : 60, // Default to full loop
            fps: 60,
            quality: 0.92,          // JPEG quality (0.0 - 1.0)
            isRecording: false
        };
        
        this.recorder = null;
        this.recordedChunks = [];
        this.originalSize = null; // Store original canvas size
    }
    
    render() {
        const dims = this.calculateDimensions('export-presets');
        const F = dims.F || 12;
        
        const { Button, Select, Input, Heading } = window.ComponentLibrary;
        
        const container = this.createElement('div', 'export-controller');
        
        // Store original size when first rendering
        if (!this.originalSize && this.animation && this.animation.canvas) {
            this.originalSize = {
                width: this.animation.canvas.width,
                height: this.animation.canvas.height
            };
        }
        
        // Heading
        const heading = new Heading({ text: 'EXPORT', level: 3 }, this.deps);
        this.addChild(heading);
        container.appendChild(heading.render());
        
        // Format selector
        const formatRow = this.createElement('div', 'export-row');
        const formatLabel = this.createElement('label');
        formatLabel.textContent = 'Format:';
        
        const formatSelect = new Select({
            options: [
                { value: 'png', label: 'PNG Image' },
                { value: 'jpeg', label: 'JPEG Image' },
                { value: 'webm', label: 'Video (WebM)' },
                { value: 'mp4', label: 'Video (MP4)' }
            ],
            selected: this.state.format,
            onChange: (value) => {
                this.state.format = value;
                this.updateUI();
            }
        }, this.deps);
        this.addChild(formatSelect);
        
        formatRow.appendChild(formatLabel);
        formatRow.appendChild(formatSelect.render());
        container.appendChild(formatRow);
        
        // Loop length info (shown right after format selection)
        if (this.loopFrames > 0) {
            const loopInfo = this.createElement('p');
            loopInfo.style.cssText = `
                margin: calc(var(--f) / 4) 0 calc(var(--f) / 2) 0;
                opacity: 0.7;
                font-size: calc(var(--f) * 0.85);
            `;
            const seconds = (this.loopFrames / 60).toFixed(1);
            const minutes = (this.loopFrames / 3600).toFixed(1);
            loopInfo.textContent = this.loopFrames >= 3600
                ? `Loop: ${this.loopFrames} frames (${minutes} min @ 60fps)`
                : `Loop: ${this.loopFrames} frames (${seconds}s @ 60fps)`;
            container.appendChild(loopInfo);
        } else if (this.loopFrames === 0) {
            const loopInfo = this.createElement('p');
            loopInfo.style.cssText = `
                margin: calc(var(--f) / 4) 0 calc(var(--f) / 2) 0;
                opacity: 0.7;
                font-size: calc(var(--f) * 0.85);
            `;
            loopInfo.textContent = 'Loop: Infinite (user-controlled)';
            container.appendChild(loopInfo);
        }
        
        // Aspect ratio selector with live preview
        const aspectRow = this.createElement('div', 'export-row');
        const aspectLabel = this.createElement('label');
        aspectLabel.textContent = 'Size:';
        
        const aspectSelect = new Select({
            options: [
                { value: 'current', label: 'Current Size' },
                { value: 'square', label: 'Square (1080×1080)' },
                { value: 'portrait', label: 'Portrait (1080×1920)' },
                { value: 'landscape', label: 'Landscape (1920×1080)' }
            ],
            selected: this.state.aspectRatio,
            onChange: (value) => {
                this.state.aspectRatio = value;
                // Live preview: resize animation canvas
                if (this.livePreview && value !== 'current') {
                    this.resizeAnimation(value);
                } else if (value === 'current' && this.originalSize) {
                    // Restore original size
                    this.resizeAnimation('original');
                }
            }
        }, this.deps);
        this.addChild(aspectSelect);
        
        aspectRow.appendChild(aspectLabel);
        aspectRow.appendChild(aspectSelect.render());
        container.appendChild(aspectRow);
        
        // Quality control (for JPEG only)
        if (this.state.format === 'jpeg') {
            const qualityRow = this.createElement('div', 'export-row');
            const qualityLabel = this.createElement('label');
            qualityLabel.textContent = 'Quality:';
            
            const qualityInput = new Input({
                type: 'range',
                value: Math.round(this.state.quality * 100),
                min: 50,
                max: 100,
                step: 1,
                onChange: (value) => {
                    this.state.quality = parseInt(value) / 100;
                    qualityValueLabel.textContent = `${value}%`;
                }
            }, this.deps);
            this.addChild(qualityInput);
            
            const qualityValueLabel = this.createElement('span');
            qualityValueLabel.textContent = `${Math.round(this.state.quality * 100)}%`;
            qualityValueLabel.style.cssText = `
                min-width: calc(var(--f) * 4);
                text-align: right;
            `;
            
            qualityRow.appendChild(qualityLabel);
            qualityRow.appendChild(qualityInput.render());
            qualityRow.appendChild(qualityValueLabel);
            container.appendChild(qualityRow);
            
            // Info text
            const qualityInfo = this.createElement('p');
            qualityInfo.style.cssText = `
                margin: calc(var(--f) / 4) 0 calc(var(--f) / 2) 0;
                opacity: 0.6;
                font-size: calc(var(--f) * 0.75);
            `;
            qualityInfo.textContent = 'Higher quality = larger file size';
            container.appendChild(qualityInfo);
        }
        
        // Duration input (for video only) - in frames
        if (this.state.format === 'webm' || this.state.format === 'mp4') {
            const durationRow = this.createElement('div', 'export-row');
            const durationLabel = this.createElement('label');
            durationLabel.textContent = 'Duration (frames):';
            
            const durationInput = new Input({
                type: 'number',
                value: this.state.duration,
                min: 1,
                max: this.loopFrames > 0 ? this.loopFrames * 5 : 3600, // Max 5 loops or 60s
                step: 1,
                onChange: (value) => {
                    this.state.duration = parseInt(value);
                }
            }, this.deps);
            this.addChild(durationInput);
            
            durationRow.appendChild(durationLabel);
            durationRow.appendChild(durationInput.render());
            container.appendChild(durationRow);
            
            // Show duration in seconds for reference
            const durationInfo = this.createElement('p');
            durationInfo.style.cssText = `
                margin: calc(var(--f) / 4) 0 0 0;
                opacity: 0.6;
                font-size: calc(var(--f) * 0.75);
            `;
            const seconds = (this.state.duration / 60).toFixed(2);
            durationInfo.textContent = `≈ ${seconds}s @ 60fps`;
            container.appendChild(durationInfo);
        }
        
        // Export button
        const exportBtn = new Button({
            text: this.state.isRecording ? 'RECORDING...' : 'EXPORT',
            onClick: () => this.handleExport(),
            disabled: this.state.isRecording
        }, this.deps);
        this.addChild(exportBtn);
        container.appendChild(exportBtn.render());
        
        this.element = container;
        return container;
    }
    
    updateUI() {
        // Re-render the component
        if (this.element && this.element.parentNode) {
            const parent = this.element.parentNode;
            this.destroy();
            parent.appendChild(this.render());
        }
    }
    
    /**
     * Resize animation to target aspect ratio
     */
    resizeAnimation(aspectRatio) {
        if (!this.animation || !this.animation.canvas) return;
        
        let targetDims;
        
        if (aspectRatio === 'original' && this.originalSize) {
            targetDims = this.originalSize;
        } else {
            const dims = this.calculateDimensions('export-presets');
            const preset = dims.dimensions ? dims.dimensions[aspectRatio] : null;
            if (!preset) return;
            targetDims = preset;
        }
        
        // Resize canvas
        this.animation.canvas.width = targetDims.width;
        this.animation.canvas.height = targetDims.height;
        
        // If animation has a resize method, call it
        if (typeof this.animation.onResize === 'function') {
            this.animation.onResize(targetDims.width, targetDims.height);
        }
        
        // Re-initialize space-filling animations (like cymatics)
        if (typeof this.animation.initParticles === 'function') {
            this.animation.initParticles();
        }
        
        // Update center for coordinate-based animations (backup if no onResize)
        if (this.animation.hasOwnProperty('centerX')) {
            this.animation.centerX = targetDims.width / 2;
        }
        if (this.animation.hasOwnProperty('centerY')) {
            this.animation.centerY = targetDims.height / 2;
        }
        
        // Reset export scale (animations should handle sizing via onResize)
        if (this.animation) {
            this.animation.exportScale = 1;
        }
        
        console.log(`📐 Animation resized to ${targetDims.width}×${targetDims.height}`);
    }
    
    async handleExport() {
        if (!this.animation || !this.animation.canvas) {
            console.error('❌ No animation canvas available for export');
            return;
        }
        
        if (this.state.format === 'png') {
            await this.exportImage('image/png', 'png', 1.0);
        } else if (this.state.format === 'jpeg') {
            await this.exportImage('image/jpeg', 'jpg', this.state.quality);
        } else if (this.state.format === 'webm') {
            await this.exportVideo('webm');
        } else if (this.state.format === 'mp4') {
            await this.exportVideo('mp4');
        }
    }
    
    async exportImage(mimeType, extension, quality) {
        const formatName = extension.toUpperCase();
        console.log(`📸 Exporting ${formatName} at current canvas size (quality: ${Math.round(quality * 100)}%)`);
        
        // Export directly from canvas (already at target size)
        this.animation.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const aspectLabel = this.state.aspectRatio.replace('current', 'custom');
            const timestamp = Date.now();
            link.download = `animation-${aspectLabel}-${timestamp}.${extension}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            console.log(`✅ ${formatName} exported`);
        }, mimeType, quality);
    }
    
    async exportVideo(format) {
        const formatName = format.toUpperCase();
        console.log(`🎥 Starting ${formatName} video export at current canvas size`);
        console.log(`📊 Target: ${this.state.duration} frames @ ${this.state.fps} fps`);
        
        this.state.isRecording = true;
        this.recordedChunks = [];
        this.updateUI();
        
        // Store original animation state
        const wasAnimating = this.animation.animator && this.animation.animator.isRunning;
        const originalFrame = this.animation.frame || 0;
        
        // Pause the animation if it's running
        if (wasAnimating && this.animation.animator) {
            this.animation.animator.stop();
        }
        
        // Setup MediaRecorder with explicit framerate
        const stream = this.animation.canvas.captureStream(0); // Manual frame pushing
        
        // Select codec based on format
        let mimeType;
        let extension;
        
        if (format === 'mp4') {
            // Try H.264 codecs for MP4
            const mp4Codecs = [
                'video/mp4;codecs=avc1.42E01E',  // H.264 baseline
                'video/mp4;codecs=avc1.4D401E',  // H.264 main
                'video/mp4;codecs=h264',         // Generic H.264
                'video/mp4'                       // Fallback
            ];
            
            mimeType = mp4Codecs.find(codec => MediaRecorder.isTypeSupported(codec));
            extension = 'mp4';
            
            if (!mimeType) {
                console.warn('⚠️ MP4 not supported, falling back to WebM');
                format = 'webm';
            }
        }
        
        if (format === 'webm') {
            // Try WebM codecs
            const webmCodecs = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm'
            ];
            
            mimeType = webmCodecs.find(codec => MediaRecorder.isTypeSupported(codec));
            extension = 'webm';
            
            if (!mimeType) {
                console.error('❌ No video codec supported');
                this.state.isRecording = false;
                this.updateUI();
                return;
            }
        }
        
        console.log(`🎬 Using codec: ${mimeType}`);
        
        this.recorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            videoBitsPerSecond: 8000000 // 8 Mbps for better quality
        });
        
        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.recordedChunks.push(e.data);
            }
        };
        
        this.recorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const aspectLabel = this.state.aspectRatio.replace('current', 'custom');
            const timestamp = Date.now();
            link.download = `animation-${aspectLabel}-${timestamp}.${extension}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            
            // Restore animation state
            if (this.animation) {
                this.animation.frame = originalFrame;
            }
            if (wasAnimating && this.animation.animator) {
                this.animation.animator.start();
            }
            
            this.state.isRecording = false;
            this.updateUI();
            console.log(`✅ ${formatName} video exported`);
        };
        
        this.recorder.start();
        
        // Frame-by-frame export for precise frame count
        const frameInterval = 1000 / this.state.fps; // ms per frame
        let frameCount = 0;
        
        const captureFrame = () => {
            if (frameCount >= this.state.duration) {
                // Done - stop recording
                console.log(`✅ Captured ${frameCount} frames`);
                if (this.recorder && this.recorder.state === 'recording') {
                    this.recorder.stop();
                }
                return;
            }
            
            // Draw one frame
            if (typeof this.animation.draw === 'function') {
                this.animation.draw();
            }
            
            // Request frame to be added to video
            const track = stream.getVideoTracks()[0];
            if (track && track.requestFrame) {
                track.requestFrame();
            }
            
            frameCount++;
            
            // Schedule next frame at precise interval
            setTimeout(captureFrame, frameInterval);
        };
        
        // Start capturing frames
        captureFrame();
    }
    
    destroy() {
        if (this.recorder && this.state.isRecording) {
            this.recorder.stop();
        }
        super.destroy();
    }
}

window.ExportController = ExportController;
