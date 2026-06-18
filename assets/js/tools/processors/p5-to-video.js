/**
 * P5 to Video Tool - Convert P5.js sketches to video/GIF
 * 
 * Features:
 * - FPS control (1-60)
 * - Frame count (30-600)
 * - Multiple formats: WebM video, Animated GIF, PNG sequence
 * - Silent recording (off-screen, faster)
 * - Preview controls (run/stop)
 * 
 * Uses CCapture.js for frame-accurate capture (records at exact FPS regardless of render speed)
 * 
 * ARCHITECTURE EXCEPTION (Approved):
 * - Uses IframeSandbox for security isolation of untrusted user code
 * - CCapture.js for P5-specific frame hijacking
 * - Cannot use AnimationExport (incompatible with iframe execution model)
 * 
 * @version 2.0.0 - SiteBoy Architecture Compliance
 */

import { BaseComponent } from '../../shared/foundation.js';
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { downloadBlob } from '../../shared/utils/download.js';
import { P5Canvas } from '../../shared/p5-integration.js';

export class P5ToVideoTool extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'p5-to-video' }, deps);
        
        this.container = container;
        this.deps = {
            ComponentLibrary: ComponentLibrary,
            ...deps
        };
        
        // State
        this.p5Code = this.getDefaultCode();
        this.isRecording = false;
        this.isProcessing = false;
        this.ccaptureLoaded = false;
        
        // Components
        this.tool = null;
        this.previewFrame = null;
        this.recordingFrame = null;
        this.componentInstances = [];  // Initialize component tracking array
        
        // Message handler tracking (for cleanup)
        this.messageHandler = null;
        
        this.render();
    }
    
    getDefaultCode() {
        return `function setup() {
  createCanvas(256, 256);
}

function draw() {
  background(220);
  
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('Input your code', width/2, height/2);
}`;
    }
    
    render() {
        const tool = new ToolBase({
            title: 'P5.JS TO VIDEO',
            sidebar: [
                ['CODE', [
                    ['Code Editor', [
                        ['text', '', '', {
                            key: 'p5Code',
                            multiline: true,
                            placeholder: 'Paste your P5.js code here...',
                            rows: 15
                        }]
                    ]],
                    ['Preview Controls', [
                        ['button', '▶ Run Preview', null, { key: 'btnRun' }],
                        ['button', '■ Stop Preview', null, { key: 'btnStop' }],
                        ['dropdown', 'Display Mode', [
                            { value: 'fit', label: 'Fit' },
                            { value: 'fill', label: 'Fill' },
                            { value: 'actual', label: 'Actual' }
                        ], { key: 'displayMode', value: 'fit' }]
                    ]]
                ]],
                ['EXPORT', [
                    ['Export Settings', [
                        ['slider', 'FPS', 1, 60, 1, { key: 'fps', value: 30, withNumber: true }],
                        ['slider', 'Frames', 30, 600, 30, { key: 'frames', value: 120, withNumber: true }],
                        ['dropdown', 'Format', [
                            { value: 'webm', label: 'WebM Video (smaller, fast)' },
                            { value: 'gif', label: 'Animated GIF (compatible, larger)' },
                            { value: 'png', label: 'PNG Sequence (zip file)' }
                        ], { key: 'format', value: 'webm' }],
                        ['toggle', 'Options', ['Silent Recording'], { 
                            key: 'recordingOptions',
                            selectedValues: ['Silent Recording']
                        }]
                    ]],
                    ['Recording', [
                        ['button', '● Record & Download', null, { key: 'btnRecord' }],
                        ['label', 'Status: Ready', { key: 'status' }]
                    ]]
                ]]
            ],
            canvas: {
                mode: 'none',  // Tool manages canvas area with IframeSandbox
                width: 500,
                height: 500
            },
            onInit: (values) => this._onInit(values),
            onUpdate: (key, value, values) => this._onUpdate(key, value, values)
        }, this.deps);
        
        this.tool = tool;
        tool.mount(this.container);
        
        // Set default code after initialization
        this.tool.setValue('p5Code', this.p5Code);
        
        // Load external libraries
        this.loadExternalLibraries();
        
        return this.element;
    }
    
    async loadExternalLibraries() {
        // Load P5.js using shared utility
        await P5Canvas.ensureP5Loaded();
        
        // Load CCapture.js (P5-specific, not in shared lib)
        if (!window.CCapture) {
            await this.loadScript('https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js');
            this.ccaptureLoaded = true;
            window.debugLog('INIT', 'CCapture.js loaded');
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    _onInit(values) {
        window.debugLog('TOOLS', 'P5ToVideo: _onInit called');
        
        // Wire buttons
        const btnRun = this.tool.getComponent('btnRun');
        const btnStop = this.tool.getComponent('btnStop');
        const btnRecord = this.tool.getComponent('btnRecord');
        
        window.debugLog('TOOLS', 'P5ToVideo: btnRun =', btnRun);
        window.debugLog('TOOLS', 'P5ToVideo: btnRun.element =', btnRun?.element);
        
        if (btnRun && btnRun.element) {
            btnRun.element.addEventListener('click', () => {
                window.debugLog('TOOLS', 'P5ToVideo: Run button clicked');
                this.runPreview();
            });
        } else {
            console.error('P5ToVideo: Run button not found or has no element');
        }
        
        if (btnStop && btnStop.element) {
            btnStop.element.addEventListener('click', () => this.stopPreview());
        }
        
        if (btnRecord && btnRecord.element) {
            btnRecord.element.addEventListener('click', () => this.startRecording());
        }
        
        // Initial preview
        setTimeout(() => {
            window.debugLog('TOOLS', 'P5ToVideo: Running initial preview');
            this.runPreview();
        }, 500);
    }
    
    updateStatus(text) {
        const statusComponent = this.tool.getComponent('status');
        if (statusComponent && statusComponent.element) {
            const content = statusComponent.element.querySelector('.text-content') || statusComponent.element;
            if (content) {
                content.textContent = `Status: ${text}`;
            }
        }
    }
    
    _onUpdate(key, value, values) {
        if (key === 'p5Code') {
            this.p5Code = value;
        } else if (key === 'displayMode') {
            // Value is already the mode string from dropdown
            const displayMode = value || 'fit';
            
            // Update preview frame if it exists
            if (this.previewFrame && this.previewFrame.setDisplayMode) {
                this.previewFrame.setDisplayMode(displayMode);
            }
        }
    }
    
    parseCanvasDimensions(code) {
        // Try to extract canvas dimensions from createCanvas() call
        const match = code.match(/createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
            return {
                width: parseInt(match[1], 10),
                height: parseInt(match[2], 10)
            };
        }
        // Default to 500x500 if not found
        return { width: 500, height: 500 };
    }
    
    runPreview() {
        const values = this.tool.getValues();
        const code = values.p5Code || this.p5Code;
        const fps = values.fps || 30;
        
        window.debugLog('TOOLS', 'P5ToVideo: Run preview clicked');
        this.updateStatus('Running preview...');
        
        // Clean up existing preview
        if (this.previewFrame) {
            this.previewFrame.destroy();
            this.previewFrame = null;
        }
        
        // Get canvas area
        const canvasArea = this.tool.canvasArea;
        if (!canvasArea) {
            console.error('P5ToVideo: Canvas area not found');
            return;
        }
        
        // Create IframeSandbox component
        const { IframeSandbox } = this.deps.ComponentLibrary;
        if (!IframeSandbox) {
            console.error('P5ToVideo: IframeSandbox component not available in ComponentLibrary');
            console.error('Available components:', Object.keys(this.deps.ComponentLibrary));
            this.updateStatus('Error: IframeSandbox not loaded');
            return;
        }
        
        window.debugLog('TOOLS', 'P5ToVideo: Creating IframeSandbox');
        
        // Parse canvas dimensions from user code
        const dimensions = this.parseCanvasDimensions(code);
        window.debugLog('TOOLS', `P5ToVideo: Detected canvas size ${dimensions.width}x${dimensions.height}`);
        
        this.previewFrame = new IframeSandbox({
            width: dimensions.width,
            height: dimensions.height,
            className: 'iframe-sandbox iframe-sandbox--500',
            sandbox: 'allow-scripts allow-same-origin',
            displayMode: 'fit',  // Canvas.js feature: fit to viewport
            enableZoom: true,    // Canvas.js feature: mouse wheel zoom
            enablePan: true      // Canvas.js feature: drag to pan
        }, this.deps);
        
        const frameElement = this.previewFrame.render();
        canvasArea.appendChild(frameElement);
        this.componentInstances.push(this.previewFrame);
        
        window.debugLog('TOOLS', 'P5ToVideo: Writing sketch to iframe');
        
        // Write sketch to iframe
        this.previewFrame.setContent(this.generateIframeHTML(code, fps, 0, 'webm', 'preview'));
        
        setTimeout(() => this.updateStatus('Preview running'), 500);
    }
    
    stopPreview() {
        if (this.previewFrame) {
            this.previewFrame.destroy();
            this.previewFrame = null;
        }
        
        this.updateStatus('Preview stopped');
    }
    
    startRecording() {
        if (this.isRecording) return;
        
        const values = this.tool.getValues();
        const code = values.p5Code || this.p5Code;
        const fps = values.fps || 30;
        const frames = values.frames || 120;
        const format = values.format || 'webm';
        const recordingOptions = values.recordingOptions || [];
        const silentRecording = recordingOptions.includes('Silent Recording');
        
        // Check if CCapture is loaded
        if (!this.ccaptureLoaded) {
            this.updateStatus('Error: CCapture.js not loaded');
            return;
        }
        
        // Warn about GIF file size
        if (format === 'gif' && frames > 180) {
            const proceed = confirm(`Warning: ${frames} frames as GIF will create a large file (possibly >50MB). Continue?`);
            if (!proceed) {
                this.updateStatus('Cancelled');
                return;
            }
        }
        
        this.isRecording = true;
        this.isProcessing = false;
        
        this.updateStatus(`Recording ${frames} frames at ${fps} FPS...`);
        
        // Update button states
        const btnRecord = this.tool.getComponent('btnRecord');
        if (btnRecord && btnRecord.element) {
            btnRecord.element.disabled = true;
            const origText = btnRecord.element.textContent;
            btnRecord.element.textContent = 'Recording...';
            btnRecord.element.dataset.origText = origText;
        }
        
        // Clean up existing frames
        if (this.previewFrame) {
            this.previewFrame.destroy();
            this.previewFrame = null;
        }
        if (this.recordingFrame) {
            this.recordingFrame.destroy();
            this.recordingFrame = null;
        }
        
        // Get canvas area
        const canvasArea = this.tool.canvasArea;
        if (!canvasArea) return;
        
        // Create IframeSandbox for recording
        const { IframeSandbox } = this.deps.ComponentLibrary;
        if (!IframeSandbox) {
            console.error('IframeSandbox component not available');
            return;
        }
        
        // Build class name based on silent recording
        const className = silentRecording 
            ? 'iframe-sandbox iframe-sandbox--500 iframe-sandbox--hidden'
            : 'iframe-sandbox iframe-sandbox--500';
        
        // Parse canvas dimensions from user code
        const dimensions = this.parseCanvasDimensions(code);
        
        this.recordingFrame = new IframeSandbox({
            width: dimensions.width,
            height: dimensions.height,
            className: className,
            sandbox: 'allow-scripts allow-same-origin allow-downloads',
            onMessage: (e) => this.handleMessage(e),
            displayMode: silentRecording ? 'auto' : 'fit',
            enableZoom: !silentRecording,  // Only enable if visible
            enablePan: !silentRecording
        }, this.deps);
        
        const frameElement = this.recordingFrame.render();
        canvasArea.appendChild(frameElement);
        this.componentInstances.push(this.recordingFrame);
        
        // Write recording sketch to iframe
        this.recordingFrame.setContent(this.generateIframeHTML(code, fps, frames, format, 'record'));
    }
    
    handleMessage(e) {
        if (e.data.type === 'VIDEO_READY') {
            const blob = e.data.blob;
            const format = e.data.format || 'webm';
            
            this.isRecording = false;
            
            this.updateStatus('Recording complete, preparing download...');
            
            // Clean up recording frame
            if (this.recordingFrame) {
                this.recordingFrame.destroy();
                this.recordingFrame = null;
            }
            
            // Update button states
            const btnRecord = this.tool.getComponent('btnRecord');
            if (btnRecord && btnRecord.element) {
                btnRecord.element.disabled = false;
                const origText = btnRecord.element.dataset.origText || '● Record & Download';
                btnRecord.element.textContent = origText;
            }
            
            // Download with appropriate extension
            const extensions = {
                'webm': 'webm',
                'gif': 'gif',
                'png': 'tar'  // CCapture creates tar for frame sequences
            };
            const ext = extensions[format] || 'webm';
            
            // Use shared download utility
            downloadBlob(blob, `animation.${ext}`);
            
            this.updateStatus('Download started!');
            setTimeout(() => {
                this.updateStatus('Ready');
            }, 2000);
        }
    }
    
    generateIframeHTML(userCode, fps, limit, format, mode) {
        return `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js"><\/script>
  <script src="https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js"><\/script>
  <style>
    body { 
      margin: 0; 
      overflow: hidden; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      background: #eeeeee; 
    }
  </style>
</head>
<body>
  <script>
    const MODE = "${mode}";
    const FPS = ${fps};
    const LIMIT = ${limit};
    const FORMAT = "${format}";
    let capturer;
    let recording = false;

    // Initialize Recorder with appropriate format
    if (MODE === 'record') {
      const captureConfig = {
        format: FORMAT,
        framerate: FPS,
        verbose: false
      };
      
      // GIF-specific settings for better quality
      if (FORMAT === 'gif') {
        captureConfig.quality = 10; // Lower = better quality (0-100 scale inverted)
        captureConfig.workers = 4;
        captureConfig.workerScript = 'https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js';
      }
      
      capturer = new CCapture(captureConfig);
    }

    // Monkey-patch Setup
    const _setup = window.setup;
    window.setup = function() {
      if(_setup) _setup();
      frameRate(FPS);
    }

    // Monkey-patch Draw
    const _draw = window.draw;
    window.draw = function() {
      // Start Recording on first frame
      if (MODE === 'record' && !recording) {
        capturer.start();
        recording = true;
        window.debugLog('TOOLS', "Capture Started");
      }

      if(_draw) _draw();

      // Handle Frame Capture
      if (MODE === 'record' && recording) {
        capturer.capture(document.querySelector('canvas'));
        
        // Check Limit
        if (frameCount >= LIMIT) {
          noLoop();
          capturer.stop();
          capturer.save( blob => {
            window.parent.postMessage({ type: 'VIDEO_READY', blob: blob, format: FORMAT }, '*');
          });
        }
      }
    }

    // --- User Code Injection ---
    ${userCode}
    // ---------------------------
  <\/script>
</body>
</html>
        `;
    }
    
    destroy() {
        // Clean up preview frame
        if (this.previewFrame) {
            this.previewFrame.destroy();
            this.previewFrame = null;
        }
        
        // Clean up recording frame
        if (this.recordingFrame) {
            this.recordingFrame.destroy();
            this.recordingFrame = null;
        }
        
        // Clean up tool
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        super.destroy();
    }
}

export default P5ToVideoTool;

window.debugLog('INIT', '✅ P5ToVideoTool loaded (ES Module)');
