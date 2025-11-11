/**
 * Pixel Tiler Tool - SiteBoy Framework
 * 
 * Creates 2x2 pixel combinations from 4 source images with animation support
 * Integrates with SiteBoy component system and aesthetic rules
 * 
 * @version 2.0.0
 * @dependencies ComponentLibrary, AnimationFoundation
 */

class PixelTiler {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.state = {
            images: {},
            processedImages: {},
            allCombinations: [],
            currentFrame: 0,
            animationSpeed: 24, // 24 FPS
            mode: 'single' // single, permutations, all
        };
        
        // Animation system - unified approach
        this.animator = null;
    }
    
    render() {
        this.destroy();
        
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'PIXEL TILER'
        });
        this.componentInstances.push(title);
        this.container.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Each pixel becomes a 2×2 block combining all 4 source images. Mathematical precision ensures perfect pixel alignment.'
        });
        this.componentInstances.push(description);
        this.container.appendChild(description.render());
        
        // Status display
        this.renderStatusDisplay();
        
        // Upload section
        this.renderUploadSection();
        
        // Controls section
        this.renderControlsSection();
        
        // Result section
        this.renderResultSection();
        
        this.updateReadyState();
    }
    
    renderStatusDisplay() {
        this.statusDisplay = new ComponentLibrary.StatusDisplay({
            message: 'Ready - Upload 4 images to begin'
        });
        this.componentInstances.push(this.statusDisplay);
        this.container.appendChild(this.statusDisplay.render());
    }
    
    renderUploadSection() {
        const uploadContainer = document.createElement('div');
        uploadContainer.style.cssText = `
            margin: var(--f) 0;
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const uploadTitle = new ComponentLibrary.Heading({
            level: 3,
            content: 'Upload Images'
        });
        this.componentInstances.push(uploadTitle);
        uploadContainer.appendChild(uploadTitle.render());
        
        const uploadGrid = new ComponentLibrary.Grid({
            items: [
                this.createFileUpload('A', 'Top-Left'),
                this.createFileUpload('B', 'Top-Right'),
                this.createFileUpload('C', 'Bottom-Left'),
                this.createFileUpload('D', 'Bottom-Right')
            ],
            cols: 2
        });
        this.componentInstances.push(uploadGrid);
        uploadContainer.appendChild(uploadGrid.render());
        
        this.container.appendChild(uploadContainer);
    }
    
    createFileUpload(letter, position) {
        const container = document.createElement('div');
        container.style.cssText = `
            padding: calc(var(--f) * 0.75);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const label = document.createElement('div');
        label.textContent = `Image ${letter} (${position}):`;
        label.style.cssText = `
            font-weight: bold;
            margin-bottom: calc(var(--f) * 0.5);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
        `;
        
        const button = document.createElement('button');
        button.textContent = 'Choose';
        button.style.cssText = `
            padding: calc(var(--f) * 0.5) var(--f);
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            cursor: pointer;
            margin-right: calc(var(--f) * 0.5);
        `;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        const fileName = document.createElement('div');
        fileName.textContent = 'No file selected';
        fileName.style.cssText = `
            margin-top: calc(var(--f) * 0.5);
            font-size: calc(var(--f) * 0.7);
            color: var(--c-text-muted);
            font-family: 'Space Mono', monospace;
        `;
        
        button.addEventListener('click', () => input.click());
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.state.images[letter] = img;
                        this.updateReadyState();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = 'No file selected';
                delete this.state.images[letter];
                this.updateReadyState();
            }
        });
        
        container.appendChild(label);
        container.appendChild(button);
        container.appendChild(input);
        container.appendChild(fileName);
        
        return container;
    }
    
    renderControlsSection() {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = `
            margin: var(--f) 0;
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const controlsTitle = new ComponentLibrary.Heading({
            level: 3,
            content: 'Process Controls'
        });
        this.componentInstances.push(controlsTitle);
        controlsContainer.appendChild(controlsTitle.render());
        
        // Mode selection
        const modeContainer = document.createElement('div');
        modeContainer.style.cssText = `margin-bottom: var(--f);`;
        
        const modeLabel = document.createElement('label');
        modeLabel.textContent = 'Combination Mode:';
        modeLabel.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.5);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
        `;
        
        const modeSelect = document.createElement('select');
        modeSelect.style.cssText = `
            padding: calc(var(--f) * 0.5);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
        `;
        
        const modes = [
            { value: 'single', text: 'Single (1 combination)' },
            { value: 'permutations', text: 'Limited (24 permutations)' },
            { value: 'all', text: 'All (256 combinations)' }
        ];
        
        modes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode.value;
            option.textContent = mode.text;
            modeSelect.appendChild(option);
        });
        
        modeSelect.addEventListener('change', (e) => {
            this.state.mode = e.target.value;
            this.updateModeDescription();
        });
        
        this.modeDescription = document.createElement('div');
        this.modeDescription.style.cssText = `
            margin-top: calc(var(--f) * 0.5);
            font-size: calc(var(--f) * 0.7);
            color: var(--c-text-muted);
            font-family: 'Space Mono', monospace;
        `;
        this.updateModeDescription();
        
        modeContainer.appendChild(modeLabel);
        modeContainer.appendChild(modeSelect);
        modeContainer.appendChild(this.modeDescription);
        
        // Process button
        this.processButton = new ComponentLibrary.Button({
            text: 'Process',
            onClick: () => this.processImages()
        });
        this.componentInstances.push(this.processButton);
        
        // Download button
        this.downloadButton = new ComponentLibrary.Button({
            text: 'Download PNG',
            onClick: () => this.downloadCurrentImage()
        });
        this.componentInstances.push(this.downloadButton);
        
        const buttonGroup = new ComponentLibrary.ButtonGroup({
            buttons: [this.processButton, this.downloadButton]
        });
        this.componentInstances.push(buttonGroup);
        
        controlsContainer.appendChild(modeContainer);
        controlsContainer.appendChild(buttonGroup.render());
        
        this.container.appendChild(controlsContainer);
    }
    
    renderResultSection() {
        const resultContainer = document.createElement('div');
        resultContainer.style.cssText = `
            margin: var(--f) 0;
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const resultTitle = new ComponentLibrary.Heading({
            level: 3,
            content: 'Result'
        });
        this.componentInstances.push(resultTitle);
        resultContainer.appendChild(resultTitle.render());
        
        // Canvas
        this.resultCanvas = document.createElement('canvas');
        this.resultCanvas.style.cssText = `
            max-width: 100%;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            display: none;
            cursor: pointer;
        `;
        this.resultCanvas.addEventListener('click', () => this.toggleFullscreen());
        
        // Animation controls
        this.animationControls = new ComponentLibrary.AnimationControls({
            onPlay: () => this.startAnimation(),
            onPause: () => this.stopAnimation(),
            onNext: () => this.nextFrame(),
            onPrevious: () => this.previousFrame()
        });
        this.componentInstances.push(this.animationControls);
        
        // Empty state
        this.emptyState = document.createElement('div');
        this.emptyState.style.cssText = `
            text-align: center;
            padding: calc(var(--f) * 2);
            color: var(--c-text-muted);
            font-family: 'Space Mono', monospace;
        `;
        this.emptyState.innerHTML = `
            <h3>How It Works</h3>
            <p>Each pixel becomes a 2×2 block combining all 4 source images</p>
            <p>Mathematical precision ensures perfect pixel alignment</p>
            <p><strong>Upload 4 images to start experimenting</strong></p>
        `;
        
        resultContainer.appendChild(this.resultCanvas);
        resultContainer.appendChild(this.animationControls.render());
        resultContainer.appendChild(this.emptyState);
        
        this.container.appendChild(resultContainer);
    }
    
    updateModeDescription() {
        const descriptions = {
            single: 'Single A-B-C-D arrangement',
            permutations: 'Each image used exactly once - 24 unique arrangements',
            all: 'All possible combinations including repetitions - 256 total'
        };
        this.modeDescription.textContent = descriptions[this.state.mode];
    }
    
    updateReadyState() {
        const ready = ['A', 'B', 'C', 'D'].every(letter => this.state.images[letter]);
        
        if (this.processButton && this.processButton.element) {
            this.processButton.element.disabled = !ready;
        }
        
        if (this.emptyState) {
            this.emptyState.style.display = ready ? 'none' : 'block';
        }
        
        const count = Object.keys(this.state.images).length;
        if (ready) {
            this.statusDisplay.setMessage('All images loaded - Ready to process!');
        } else {
            this.statusDisplay.setMessage(`Images loaded: ${count}/4`);
        }
    }
    
    processImages() {
        this.statusDisplay.setMessage('Processing images...');
        this.prepareImages();
        
        switch (this.state.mode) {
            case 'single':
                this.processSingle();
                break;
            case 'permutations':
                this.processPermutations();
                break;
            case 'all':
                this.processAll();
                break;
        }
    }
    
    prepareImages() {
        const minWidth = Math.min(...Object.values(this.state.images).map(img => img.width));
        const minHeight = Math.min(...Object.values(this.state.images).map(img => img.height));
        
        this.state.processedImages = {};
        ['A', 'B', 'C', 'D'].forEach(letter => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = minWidth;
            canvas.height = minHeight;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.state.images[letter], 0, 0, minWidth, minHeight);
            this.state.processedImages[letter] = canvas;
        });
    }
    
    processSingle() {
        this.state.allCombinations = [['A', 'B', 'C', 'D']];
        this.state.currentFrame = 0;
        this.createTiledImage(this.state.allCombinations[0]);
        this.statusDisplay.setMessage('Complete - Click image for fullscreen');
        this.resultCanvas.style.display = 'block';
        this.animationControls.element.style.display = 'none';
        this.initializeAnimator(); // Initialize even for single frame (for consistency)
    }
    
    processPermutations() {
        this.state.allCombinations = this.generatePermutations(['A', 'B', 'C', 'D']);
        this.state.currentFrame = 0;
        this.createTiledImage(this.state.allCombinations[0]);
        this.statusDisplay.setMessage('24 permutations ready! Use controls to navigate and animate');
        this.resultCanvas.style.display = 'block';
        this.animationControls.element.style.display = 'block';
        this.animationControls.setFrameInfo(0, this.state.allCombinations.length);
        this.initializeAnimator(); // Initialize animator for sequence
    }
    
    processAll() {
        this.state.allCombinations = this.generateAllCombinations(['A', 'B', 'C', 'D']);
        this.state.currentFrame = 0;
        this.createTiledImage(this.state.allCombinations[0]);
        this.statusDisplay.setMessage('256 combinations ready! Use controls to navigate and animate');
        this.resultCanvas.style.display = 'block';
        this.animationControls.element.style.display = 'block';
        this.animationControls.setFrameInfo(0, this.state.allCombinations.length);
        this.initializeAnimator(); // Initialize animator for sequence
    }
    
    generatePermutations(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = this.generatePermutations(remaining);
            for (let perm of perms) {
                result.push([current].concat(perm));
            }
        }
        return result;
    }
    
    generateAllCombinations(arr) {
        const result = [];
        for (let a of arr) {
            for (let b of arr) {
                for (let c of arr) {
                    for (let d of arr) {
                        result.push([a, b, c, d]);
                    }
                }
            }
        }
        return result;
    }
    
    createTiledImage(combination) {
        const ctx = this.resultCanvas.getContext('2d');
        const width = this.state.processedImages['A'].width;
        const height = this.state.processedImages['A'].height;
        
        const imageData = {};
        ['A', 'B', 'C', 'D'].forEach(letter => {
            const imgCtx = this.state.processedImages[letter].getContext('2d');
            imageData[letter] = imgCtx.getImageData(0, 0, width, height).data;
        });
        
        this.resultCanvas.width = width * 2;
        this.resultCanvas.height = height * 2;
        
        const resultData = ctx.createImageData(width * 2, height * 2);
        const result = resultData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sourceIndex = (y * width + x) * 4;
                
                const colors = combination.map(letter => [
                    imageData[letter][sourceIndex],
                    imageData[letter][sourceIndex + 1],
                    imageData[letter][sourceIndex + 2],
                    imageData[letter][sourceIndex + 3]
                ]);
                
                const resultX = x * 2;
                const resultY = y * 2;
                const resultWidth = width * 2;
                
                const positions = [
                    [resultX, resultY],
                    [resultX + 1, resultY],
                    [resultX, resultY + 1],
                    [resultX + 1, resultY + 1]
                ];
                
                positions.forEach((pos, i) => {
                    const idx = (pos[1] * resultWidth + pos[0]) * 4;
                    result[idx] = colors[i][0];
                    result[idx + 1] = colors[i][1];
                    result[idx + 2] = colors[i][2];
                    result[idx + 3] = colors[i][3];
                });
            }
        }
        
        ctx.putImageData(resultData, 0, 0);
    }
    
    /**
     * Initialize unified animation system
     */
    initializeAnimator() {
        // Destroy existing animator if any
        if (this.animator) {
            this.animator.destroy();
        }
        
        // Use FrameSequencer for frame-by-frame animation
        this.animator = new window.AnimationFoundation.FrameSequencer({
            frameCount: this.state.allCombinations.length,
            onFrame: (frameIndex) => {
                this.state.currentFrame = frameIndex;
                this.createTiledImage(this.state.allCombinations[frameIndex]);
                this.animationControls.setFrameInfo(frameIndex, this.state.allCombinations.length);
            },
            fps: this.state.animationSpeed,
            loop: true
        });
    }
    
    startAnimation() {
        if (this.state.allCombinations.length <= 1 || !this.animator) return;
        this.animator.start();
    }
    
    stopAnimation() {
        if (this.animator) {
            this.animator.stop();
        }
    }
    
    nextFrame() {
        if (this.animator) {
            this.animator.nextFrame();
        }
    }
    
    previousFrame() {
        if (this.animator) {
            this.animator.previousFrame();
        }
    }
    
    downloadCurrentImage() {
        if (!this.resultCanvas || this.resultCanvas.style.display === 'none') {
            this.statusDisplay.setMessage('No image to download. Please process an image first.');
            return;
        }
        
        const link = document.createElement('a');
        if (this.state.allCombinations.length > 0) {
            const combo = this.state.allCombinations[this.state.currentFrame].join('');
            link.download = `pixel-tiled-${combo}-frame-${String(this.state.currentFrame + 1).padStart(3, '0')}.png`;
        } else {
            link.download = `pixel-tiled-${Date.now()}.png`;
        }
        link.href = this.resultCanvas.toDataURL('image/png');
        link.click();
        
        this.statusDisplay.setMessage('Image downloaded successfully!');
    }
    
    toggleFullscreen() {
        // Simple fullscreen toggle
        const existingOverlay = document.querySelector('.fullscreen-overlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const canvas = this.resultCanvas.cloneNode(true);
        canvas.style.cssText = `max-width: 90vw; max-height: 90vh; border: 1px solid var(--c-border);`;
        
        overlay.appendChild(canvas);
        overlay.addEventListener('click', () => document.body.removeChild(overlay));
        document.body.appendChild(overlay);
    }
    
    destroy() {
        // Destroy animator first (unified cleanup)
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        ComponentLibrary.destroyTracked(this.componentInstances);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Register globally
window.PixelTiler = PixelTiler;
