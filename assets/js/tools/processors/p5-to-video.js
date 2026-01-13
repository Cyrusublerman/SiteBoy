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
 * @version 1.2.0
 */

import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

export class P5ToVideoTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary: ComponentLibrary,
            ...deps
        };
        
        // State
        this.p5Code = this.getDefaultCode();
        this.isRecording = false;
        this.isProcessing = false;
        this.iframe = null;
        this.ccaptureLoaded = false;
        
        this.render();
    }
    
    getDefaultCode() {
        return `function setup() {
  createCanvas(500, 500);
  frameRate(30);
}

function draw() {
  background(20);
  
  // Animation
  let t = frameCount * 0.05;
  translate(width/2, height/2);
  rotate(t);
  
  noStroke();
  fill(255, 100, 100);
  rectMode(CENTER);
  rect(0, 0, 150, 150);
  
  fill(255);
  ellipse(100, 0, 50);
}`;
    }
    
    render() {
        const tool = new ToolBase({
            title: 'P5.JS TO VIDEO',
            sidebar: [
                ['CODE', [
                    ['Code Editor', [
                        ['text', 'P5.js Code', '', {
                            key: 'p5Code',
                            multiline: true,
                            placeholder: 'Paste your P5.js code here...'
                        }]
                    ]],
                    ['Preview Controls', [
                        ['button', '▶ Run Preview', null, { key: 'btnRun' }],
                        ['button', '■ Stop Preview', null, { key: 'btnStop' }]
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
                width: 500,
                height: 500
            },
            onInit: (values) => this._onInit(values),
            onUpdate: (key, value, values) => this._onUpdate(key, value, values),
            onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)
        }, this.deps);
        
        this.tool = tool;
        tool.mount(this.container);
        
        // Set default code after initialization
        this.tool.setValue('p5Code', this.p5Code);
        
        // Style the textarea for code editing
        this.styleCodeTextarea();
        
        // Load external libraries
        this.loadExternalLibraries();
    }
    
    styleCodeTextarea() {
        // Find the textarea and style it for code editing
        const codeComponent = this.tool.getComponent('p5Code');
        if (codeComponent && codeComponent.element) {
            const textarea = codeComponent.element.querySelector('textarea') || codeComponent.element;
            if (textarea && textarea.tagName === 'TEXTAREA') {
                textarea.style.fontFamily = 'monospace';
                textarea.style.fontSize = '12px';
                textarea.style.minHeight = '300px';
                textarea.style.resize = 'vertical';
                textarea.style.tabSize = '2';
                textarea.style.whiteSpace = 'pre';
                
                // Handle tab key for indentation
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        
                        textarea.value = value.substring(0, start) + '  ' + value.substring(end);
                        textarea.selectionStart = textarea.selectionEnd = start + 2;
                    }
                });
            }
        }
    }
    
    async loadExternalLibraries() {
        // Load P5.js
        if (!window.p5) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js');
        }
        
        // Load CCapture.js (includes gif.js, whammy.js, download.js)
        if (!window.CCapture) {
            await this.loadScript('https://unpkg.com/ccapture.js@1.1.0/build/CCapture.all.min.js');
            this.ccaptureLoaded = true;
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
        // Wire buttons
        const btnRun = this.tool.getComponent('btnRun');
        const btnStop = this.tool.getComponent('btnStop');
        const btnRecord = this.tool.getComponent('btnRecord');
        
        if (btnRun && btnRun.element) {
            btnRun.element.addEventListener('click', () => this.runPreview());
        }
        
        if (btnStop && btnStop.element) {
            btnStop.element.addEventListener('click', () => this.stopPreview());
        }
        
        if (btnRecord && btnRecord.element) {
            btnRecord.element.addEventListener('click', () => this.startRecording());
        }
        
        // Initial preview
        setTimeout(() => this.runPreview(), 500);
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
        }
    }
    
    _onDraw(ctx, canvas, values) {
        // Canvas is replaced by iframe, so we just show status
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        
        if (this.isProcessing) {
            ctx.fillText('Processing video...', canvas.width/2, canvas.height/2);
        } else if (this.isRecording) {
            ctx.fillText('Recording...', canvas.width/2, canvas.height/2);
        } else {
            ctx.fillText('Preview will appear here', canvas.width/2, canvas.height/2);
        }
    }
    
    runPreview() {
        const values = this.tool.getValues();
        const code = values.p5Code || this.p5Code;
        const fps = values.fps || 30;
        
        this.updateStatus('Running preview...');
        
        // Clear existing iframe
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        
        // Create new iframe
        const canvasArea = this.tool.canvasArea;
        if (!canvasArea) return;
        
        // Clear canvas area
        const canvas = this.tool.canvas;
        if (canvas) canvas.style.display = 'none';
        
        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.style.cssText = `
            width: 500px;
            height: 500px;
            border: 1px solid var(--c-border);
            background: #FFFFFF;
        `;
        this.iframe.sandbox = 'allow-scripts allow-same-origin';
        
        canvasArea.appendChild(this.iframe);
        
        // Write sketch to iframe
        const doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write(this.generateIframeHTML(code, fps, 0, 'webm', 'preview'));
        doc.close();
        
        setTimeout(() => this.updateStatus('Preview running'), 500);
    }
    
    stopPreview() {
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        
        // Show canvas again
        const canvas = this.tool.canvas;
        if (canvas) {
            canvas.style.display = 'block';
        }
        
        this.updateStatus('Preview stopped');
        
        // Redraw canvas
        this.tool.draw();
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
        
        // Clear existing iframe
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        
        // Create new iframe for recording
        const canvasArea = this.tool.canvasArea;
        if (!canvasArea) return;
        
        const canvas = this.tool.canvas;
        if (canvas) canvas.style.display = 'none';
        
        this.iframe = document.createElement('iframe');
        
        // If silent recording, hide the iframe
        if (silentRecording) {
            this.iframe.style.cssText = `
                width: 500px;
                height: 500px;
                position: absolute;
                left: -9999px;
                visibility: hidden;
            `;
        } else {
            this.iframe.style.cssText = `
                width: 500px;
                height: 500px;
                border: 1px solid var(--c-border);
                background: #FFFFFF;
            `;
        }
        
        this.iframe.sandbox = 'allow-scripts allow-same-origin allow-downloads';
        
        canvasArea.appendChild(this.iframe);
        
        // Listen for completion message
        window.addEventListener('message', (e) => this.handleMessage(e));
        
        // Write recording sketch to iframe
        const doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write(this.generateIframeHTML(code, fps, frames, format, 'record'));
        doc.close();
    }
    
    handleMessage(e) {
        if (e.data.type === 'VIDEO_READY') {
            const blob = e.data.blob;
            const format = e.data.format || 'webm';
            
            this.isRecording = false;
            
            this.updateStatus('Recording complete, preparing download...');
            
            // Clean up iframe
            if (this.iframe) {
                this.iframe.remove();
                this.iframe = null;
            }
            
            // Show canvas again
            const canvas = this.tool.canvas;
            if (canvas) {
                canvas.style.display = 'block';
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
            this.downloadBlob(blob, `animation.${ext}`);
            this.updateStatus('Download started!');
            setTimeout(() => {
                this.updateStatus('Ready');
                this.tool.draw();
            }, 2000);
        }
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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
      background: #EEEEEE; 
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
        console.log("Capture Started");
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
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

export default P5ToVideoTool;

console.log('✅ P5ToVideoTool loaded (ES Module)');

