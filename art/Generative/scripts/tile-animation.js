/**
 * Tile Animation - Deterministic Rotating Tile Patterns
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    const SHAPES = { square: 'square', circle: 'circle', triangle: 'triangle' };

    class Tile {
        constructor(canvas, index, config) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.index = index;
            this.config = config;
            
            this.row = Math.floor(index / config.cols);
            this.col = index % config.cols;
            this.totalTiles = config.cols * config.rows;
            
            this.frameCount = 0;
            this.cycleState = 0;
            this.refreshFrames = config.refreshFrames;
            this.seed = Math.random() * 1000;
            this.rotationOffset = Math.random() * 360;
            
            this.computeProperties();
            this.draw();
        }
        
        hash(a, b, c) {
            let x = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + this.seed) * 43758.5453;
            return x - Math.floor(x);
        }
        
        computeProperties() {
            this.seamCount = Math.floor(this.hash(this.index, this.cycleState, 1) * 11) + 1;
            const gradValue = this.hash(this.row + this.cycleState, this.col * 2, this.index);
            this.gradientInverted = gradValue < 0.5;
            this.direction = this.gradientInverted ? 1 : -1;
            
            const baseSpeed = 10 / this.seamCount;
            const speedVariation = this.hash(this.index, this.cycleState, 2) * 0.5 + 0.75;
            this.degreesPerFrame = baseSpeed * speedVariation;
            
            const shapeKeys = Object.keys(SHAPES);
            const shapeValue = Math.floor(this.hash(this.index, this.cycleState, 3) * 3);
            this.shape = SHAPES[shapeKeys[shapeValue]];
        }
        
        update() {
            this.frameCount++;
            
            if (this.frameCount >= this.refreshFrames) {
                this.frameCount = 0;
                this.cycleState++;
                this.computeProperties();
            }
            
            this.rotationOffset += this.degreesPerFrame * this.direction;
            this.rotationOffset = this.rotationOffset % 360;
            
            this.draw();
        }
        
        draw() {
            const size = this.canvas.width;
            const inset = this.config.gap;
            const drawSize = size - (inset * 2);
            if (drawSize <= 0) return;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, size, size);
            
            const imageData = this.ctx.createImageData(drawSize, drawSize);
            
            if (this.shape === SHAPES.square) {
                this.drawSquare(imageData, drawSize);
            } else if (this.shape === SHAPES.circle) {
                this.drawCircle(imageData, drawSize);
            } else {
                this.drawTriangle(imageData, drawSize);
            }
            
            if (!this.tempCanvas) {
                this.tempCanvas = document.createElement('canvas');
                this.tempCanvas.width = drawSize;
                this.tempCanvas.height = drawSize;
                this.tempCtx = this.tempCanvas.getContext('2d');
            }
            
            this.tempCtx.putImageData(imageData, 0, 0);
            this.ctx.globalAlpha = 0.25;
            this.ctx.drawImage(this.tempCanvas, inset, inset);
            this.ctx.globalAlpha = 1.0;
        }
        
        drawSquare(imageData, size) {
            const data = imageData.data;
            const centerX = size / 2;
            const centerY = size / 2;
            const triangleSide = size * 0.85;
            const triangleArea = (Math.sqrt(3) / 4) * triangleSide * triangleSide;
            const squareSide = Math.sqrt(triangleArea);
            const halfSide = squareSide / 2;
            const rotRad = (this.rotationOffset * Math.PI) / 180;
            
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = (y * size + x) * 4;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    
                    if (Math.abs(dx) > halfSide || Math.abs(dy) > halfSide) {
                        data[idx] = data[idx + 1] = data[idx + 2] = 255;
                        data[idx + 3] = 0;
                        continue;
                    }
                    
                    let angle = Math.atan2(dy, dx) - rotRad;
                    while (angle < 0) angle += 2 * Math.PI;
                    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
                    
                    const segmentAngle = (2 * Math.PI) / this.seamCount;
                    const localAngle = (angle % segmentAngle) / segmentAngle;
                    let gradientValue = this.gradientInverted ? (1 - localAngle) : localAngle;
                    const threshold = this.ditherMatrix(x % 4, y % 4) / 16;
                    const color = gradientValue > threshold ? 255 : 0;
                    
                    data[idx] = data[idx + 1] = data[idx + 2] = color;
                    data[idx + 3] = 255;
                }
            }
        }
        
        drawCircle(imageData, size) {
            const data = imageData.data;
            const centerX = size / 2;
            const centerY = size / 2;
            const triangleSide = size * 0.85;
            const triangleArea = (Math.sqrt(3) / 4) * triangleSide * triangleSide;
            const radius = Math.sqrt(triangleArea / Math.PI);
            const rotRad = (this.rotationOffset * Math.PI) / 180;
            
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = (y * size + x) * 4;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > radius) {
                        data[idx] = data[idx + 1] = data[idx + 2] = 255;
                        data[idx + 3] = 0;
                        continue;
                    }
                    
                    let angle = Math.atan2(dy, dx) - rotRad;
                    while (angle < 0) angle += 2 * Math.PI;
                    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
                    
                    const segmentAngle = (2 * Math.PI) / this.seamCount;
                    const localAngle = (angle % segmentAngle) / segmentAngle;
                    let gradientValue = this.gradientInverted ? (1 - localAngle) : localAngle;
                    const threshold = this.ditherMatrix(x % 4, y % 4) / 16;
                    const color = gradientValue > threshold ? 255 : 0;
                    
                    data[idx] = data[idx + 1] = data[idx + 2] = color;
                    data[idx + 3] = 255;
                }
            }
        }
        
        drawTriangle(imageData, size) {
            const data = imageData.data;
            const centerX = size / 2;
            const centerY = size / 2;
            const triangleSide = size * 0.85;
            const height = (Math.sqrt(3) / 2) * triangleSide;
            const rotRad = (this.rotationOffset * Math.PI) / 180;
            
            const v1 = { x: centerX, y: centerY - height / 2 };
            const v2 = { x: centerX + triangleSide / 2, y: centerY + height / 2 };
            const v3 = { x: centerX - triangleSide / 2, y: centerY + height / 2 };
            const centroidY = centerY + height / 6;
            
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const idx = (y * size + x) * 4;
                    
                    const denom = ((v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y));
                    const a = ((v2.y - v3.y) * (x - v3.x) + (v3.x - v2.x) * (y - v3.y)) / denom;
                    const b = ((v3.y - v1.y) * (x - v3.x) + (v1.x - v3.x) * (y - v3.y)) / denom;
                    const c = 1 - a - b;
                    
                    if (a < 0 || b < 0 || c < 0) {
                        data[idx] = data[idx + 1] = data[idx + 2] = 255;
                        data[idx + 3] = 0;
                        continue;
                    }
                    
                    const dx = x - centerX;
                    const dy = y - centroidY;
                    let angle = Math.atan2(dy, dx) - rotRad;
                    while (angle < 0) angle += 2 * Math.PI;
                    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
                    
                    const segmentAngle = (2 * Math.PI) / this.seamCount;
                    const localAngle = (angle % segmentAngle) / segmentAngle;
                    let gradientValue = this.gradientInverted ? (1 - localAngle) : localAngle;
                    const threshold = this.ditherMatrix(x % 4, y % 4) / 16;
                    const color = gradientValue > threshold ? 255 : 0;
                    
                    data[idx] = data[idx + 1] = data[idx + 2] = color;
                    data[idx + 3] = 255;
                }
            }
        }
        
        ditherMatrix(x, y) {
            const matrix = [
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5]
            ];
            return matrix[y][x];
        }
    }

    class TileAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                cols: options.cols || 6,
                rows: options.rows || 6,
                tileSize: options.tileSize || 120,
                gap: options.gap || 0,
                fps: options.fps || 12,
                refreshFrames: options.refreshFrames || 96,
                ...options
            };
            
            this.gridEl = null;
            this.tiles = [];
            this.isRunning = false;
            this.lastFrameTime = 0;
            this.animationId = null;
            this.controls = {};
            
            this.init();
        }

        init() {
            // Create grid container
            this.gridEl = document.createElement('div');
            this.gridEl.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.options.cols}, ${this.options.tileSize}px);
                gap: 0px;
                border: 1px solid var(--c-border);
            `;
            
            // Create tiles
            this.generate();
            
            // Create controls
            this.createControls();
            
            // Append to container
            this.container.appendChild(this.gridEl);
        }

        generate() {
            this.gridEl.innerHTML = '';
            this.tiles = [];
            
            const count = this.options.cols * this.options.rows;
            for (let i = 0; i < count; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = this.options.tileSize;
                canvas.height = this.options.tileSize;
                canvas.style.cssText = 'display: block; background: #000000;';
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                this.gridEl.appendChild(canvas);
                const tile = new Tile(canvas, i, this.options);
                this.tiles.push(tile);
            }
        }

        createControls() {
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            
            const controlsContainer = document.createElement('div');
            controlsContainer.style.cssText = `
                display: flex;
                gap: 1px;
                margin-top: ${F}px;
                border: 1px solid var(--c-border);
            `;
            
            // Play/Stop buttons
            ['PLAY', 'STOP', 'REGENERATE'].forEach((label) => {
                const btn = document.createElement('button');
                btn.textContent = label;
                btn.style.cssText = `
                    flex: 1;
                    height: ${F * 2}px;
                    background: var(--c-bg);
                    color: var(--c-text);
                    border: none;
                    border-right: 1px solid var(--c-border);
                    font-family: 'Space Mono', monospace;
                    font-size: ${F}px;
                    cursor: pointer;
                    text-transform: uppercase;
                `;
                
                btn.addEventListener('click', () => {
                    if (label === 'PLAY') this.start();
                    else if (label === 'STOP') this.stop();
                    else if (label === 'REGENERATE') this.generate();
                });
                
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'var(--c-text)';
                    btn.style.color = 'var(--c-bg)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'var(--c-bg)';
                    btn.style.color = 'var(--c-text)';
                });
                
                controlsContainer.appendChild(btn);
                this.controls[label] = btn;
            });
            
            const lastBtn = controlsContainer.lastElementChild;
            if (lastBtn) lastBtn.style.borderRight = 'none';
            
            this.container.appendChild(controlsContainer);
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.animate(this.lastFrameTime);
        }

        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        animate(currentTime) {
            if (!this.isRunning) return;
            
            const frameDuration = 1000 / this.options.fps;
            const elapsed = currentTime - this.lastFrameTime;
            
            if (elapsed >= frameDuration) {
                this.tiles.forEach(t => t.update());
                this.lastFrameTime = currentTime - (elapsed % frameDuration);
            }
            
            this.animationId = requestAnimationFrame((t) => this.animate(t));
        }

        destroy() {
            this.stop();
            if (this.gridEl && this.gridEl.parentNode) {
                this.gridEl.parentNode.removeChild(this.gridEl);
            }
            this.tiles = [];
            this.gridEl = null;
            this.controls = {};
        }
    }

    // Export to window
    window.TileAnimation = TileAnimation;
    console.log('🎨 Tile Animation loaded');
})();




