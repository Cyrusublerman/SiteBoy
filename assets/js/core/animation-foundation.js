/**
 * Animation Foundation - SiteBoy Framework
 * 
 * SINGLE SOURCE OF TRUTH for all animation logic
 * 
 * OWNED CONCERNS:
 * - requestAnimationFrame loops
 * - setInterval/setTimeout loops
 * - Animation state management (play/pause/stop)
 * - Frame timing and rate limiting
 * - Automatic cleanup integration
 * 
 * FILE OWNERSHIP (SSoT):
 * - Animation loops → animation-foundation.js (THIS FILE)
 * - Canvas/drawing → specialized-components.js or tool-specific draw()
 * - UI components → component-library.js
 * - Layout math → mathematical-foundation.js
 * 
 * USAGE PATTERN:
 * import { BaseAnimator, AnimationLoop, FrameSequencer } from './core/animation-foundation.js';
 * 
 * class MyTool {
 *     constructor(container, deps) {
 *         this.animator = new AnimationLoop({
 *             onFrame: () => this.draw(),
 *             fps: 60
 *         });
 *     }
 *     
 *     startAnimation() {
 *         this.animator.start();
 *     }
 *     
 *     destroy() {
 *         this.animator.destroy();
 *     }
 * }
 * 
 * DESIGN PRINCIPLES:
 * 1. Minimal code duplication - all animation patterns abstracted here
 * 2. Uniform API - all animators have .start(), .stop(), .pause(), .destroy()
 * 3. Automatic cleanup - integrates with CleanupManager
 * 4. Mathematical precision - frame timing controlled explicitly
 * 5. No arbitrary variance - consistent behavior across all tools
 * 
 * @version 1.0.0
 * @dependencies CleanupManager
 */

/**
 * BaseAnimator - Foundation class for all animation systems
 * 
 * Provides:
 * - Unified lifecycle (start/stop/pause/resume/destroy)
 * - Automatic cleanup integration
 * - State tracking
 * - Common configuration
 */
export class BaseAnimator {
    constructor(options = {}) {
        this.options = options;
        this.isRunning = false;
        this.isPaused = false;
        this.isDestroyed = false;
        
        // Callbacks
        this.onFrame = options.onFrame || null;
        this.onStart = options.onStart || null;
        this.onStop = options.onStop || null;
        this.onPause = options.onPause || null;
        this.onResume = options.onResume || null;
        
        // State
        this.frameCount = 0;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPausedTime = 0;
    }
    
    /**
     * Start animation
     */
    start() {
        if (this.isDestroyed || this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = performance.now();
        this.frameCount = 0;
        this.totalPausedTime = 0;
        
        if (this.onStart) this.onStart();
        this._start();
    }
    
    /**
     * Stop animation (cannot be resumed, must start again)
     */
    stop() {
        if (this.isDestroyed || !this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.onStop) this.onStop();
        this._stop();
    }
    
    /**
     * Pause animation (can be resumed)
     */
    pause() {
        if (this.isDestroyed || !this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.pauseTime = performance.now();
        
        if (this.onPause) this.onPause();
        this._pause();
    }
    
    /**
     * Resume paused animation
     */
    resume() {
        if (this.isDestroyed || !this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        
        if (this.pauseTime !== null) {
            this.totalPausedTime += performance.now() - this.pauseTime;
            this.pauseTime = null;
        }
        
        if (this.onResume) this.onResume();
        this._resume();
    }
    
    /**
     * Toggle between pause and resume
     */
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * Get elapsed time in milliseconds (excluding paused time)
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        const now = performance.now();
        const currentPause = this.isPaused && this.pauseTime ? (now - this.pauseTime) : 0;
        return (now - this.startTime - this.totalPausedTime - currentPause);
    }
    
    /**
     * Get elapsed time in seconds
     */
    getElapsedSeconds() {
        return this.getElapsedTime() / 1000;
    }
    
    /**
     * Destroy animator and clean up resources
     */
    destroy() {
        if (this.isDestroyed) return;
        
        this.stop();
        this.isDestroyed = true;
        this.onFrame = null;
        this.onStart = null;
        this.onStop = null;
        this.onPause = null;
        this.onResume = null;
    }
    
    // Subclass hooks (override these in specific animators)
    _start() {}
    _stop() {}
    _pause() {}
    _resume() {}
}

/**
 * AnimationLoop - requestAnimationFrame-based continuous animation
 * 
 * Use for: Canvas rendering, smooth continuous animations, physics simulations
 * 
 * Features:
 * - FPS limiting/throttling
 * - Delta time calculation
 * - Frame skipping for performance
 * 
 * Example:
 * const loop = new AnimationLoop({
 *     onFrame: (deltaTime, frameCount) => {
 *         this.update(deltaTime);
 *         this.draw();
 *     },
 *     fps: 60,
 *     maxDelta: 100
 * });
 * loop.start();
 */
export class AnimationLoop extends BaseAnimator {
    constructor(options = {}) {
        super(options);
        
        this.fps = options.fps || null; // null = unlimited (browser native ~60fps)
        this.maxDelta = options.maxDelta || 100; // Maximum deltaTime in ms (prevents huge jumps)
        this.frameInterval = this.fps ? (1000 / this.fps) : 0;
        
        this.animationFrameId = null;
        this.lastFrameTime = null;
        this.accumulator = 0;
    }
    
    _start() {
        this.lastFrameTime = performance.now();
        this.accumulator = 0;
        this._loop();
    }
    
    _stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    _pause() {
        this._stop(); // Cancel RAF when paused
    }
    
    _resume() {
        this.lastFrameTime = performance.now();
        this._loop(); // Restart RAF when resumed
    }
    
    _loop() {
        if (!this.isRunning || this.isPaused || this.isDestroyed) return;
        
        const now = performance.now();
        let deltaTime = now - this.lastFrameTime;
        
        // Clamp delta to prevent huge jumps (e.g., tab switching)
        if (deltaTime > this.maxDelta) {
            deltaTime = this.maxDelta;
        }
        
        this.lastFrameTime = now;
        
        // If FPS limiting is enabled
        if (this.frameInterval > 0) {
            this.accumulator += deltaTime;
            
            // Only run frame if enough time has accumulated
            while (this.accumulator >= this.frameInterval) {
                if (this.onFrame) {
                    this.onFrame(this.frameInterval, this.frameCount, this.getElapsedTime());
                }
                this.frameCount++;
                this.accumulator -= this.frameInterval;
            }
        } else {
            // Unlimited FPS - run every frame
            if (this.onFrame) {
                this.onFrame(deltaTime, this.frameCount, this.getElapsedTime());
            }
            this.frameCount++;
        }
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this._loop());
    }
    
    destroy() {
        this._stop();
        super.destroy();
    }
}

/**
 * IntervalAnimator - setInterval-based animation
 * 
 * Use for: Frame sequencing, discrete animations, less performance-critical updates
 * 
 * Features:
 * - Precise interval control
 * - Less performant than RAF but more predictable timing
 * - Good for UI animations and slide shows
 * 
 * Example:
 * const animator = new IntervalAnimator({
 *     onFrame: () => this.nextFrame(),
 *     interval: 1000 / 24 // 24 FPS
 * });
 * animator.start();
 */
export class IntervalAnimator extends BaseAnimator {
    constructor(options = {}) {
        super(options);
        
        this.interval = options.interval || 1000 / 60; // Default 60 FPS
        this.intervalId = null;
    }
    
    _start() {
        this.intervalId = setInterval(() => {
            if (!this.isPaused && this.onFrame) {
                this.onFrame(this.interval, this.frameCount, this.getElapsedTime());
                this.frameCount++;
            }
        }, this.interval);
    }
    
    _stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * Update interval dynamically
     */
    setInterval(newInterval) {
        this.interval = newInterval;
        if (this.isRunning) {
            this._stop();
            this._start();
        }
    }
    
    /**
     * Set FPS (convenience method)
     */
    setFPS(fps) {
        this.setInterval(1000 / fps);
    }
    
    destroy() {
        this._stop();
        super.destroy();
    }
}

/**
 * FrameSequencer - Sequence through a finite set of frames
 * 
 * Use for: Image sequences, animation sprites, frame-by-frame playback
 * 
 * Features:
 * - Forward/backward navigation
 * - Loop/ping-pong modes
 * - Frame rate control
 * - Frame events
 * 
 * Example:
 * const sequencer = new FrameSequencer({
 *     frameCount: 256,
 *     onFrame: (frameIndex) => this.renderFrame(frameIndex),
 *     fps: 24,
 *     loop: true
 * });
 * sequencer.start();
 */
export class FrameSequencer extends BaseAnimator {
    constructor(options = {}) {
        super(options);
        
        this.frameCount = options.frameCount || 0;
        this.currentFrame = options.startFrame || 0;
        this.fps = options.fps || 24;
        this.interval = 1000 / this.fps;
        this.loop = options.loop !== undefined ? options.loop : true;
        this.pingPong = options.pingPong || false;
        this.direction = 1; // 1 = forward, -1 = backward
        
        this.onFrameChange = options.onFrameChange || null;
        
        this.intervalId = null;
    }
    
    _start() {
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this._advance();
            }
        }, this.interval);
        
        // Call initial frame
        if (this.onFrame) {
            this.onFrame(this.currentFrame, this.frameCount);
        }
    }
    
    _stop() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    _advance() {
        const oldFrame = this.currentFrame;
        this.currentFrame += this.direction;
        
        // Handle boundaries
        if (this.currentFrame >= this.frameCount) {
            if (this.pingPong) {
                this.currentFrame = this.frameCount - 1;
                this.direction = -1;
            } else if (this.loop) {
                this.currentFrame = 0;
            } else {
                this.currentFrame = this.frameCount - 1;
                this.stop();
                return;
            }
        } else if (this.currentFrame < 0) {
            if (this.pingPong) {
                this.currentFrame = 0;
                this.direction = 1;
            } else if (this.loop) {
                this.currentFrame = this.frameCount - 1;
            } else {
                this.currentFrame = 0;
                this.stop();
                return;
            }
        }
        
        // Trigger frame callback
        if (this.onFrame) {
            this.onFrame(this.currentFrame, this.frameCount);
        }
        
        // Trigger frame change event
        if (this.onFrameChange && oldFrame !== this.currentFrame) {
            this.onFrameChange(this.currentFrame, oldFrame);
        }
    }
    
    /**
     * Go to specific frame
     */
    goToFrame(frameIndex) {
        if (frameIndex < 0 || frameIndex >= this.frameCount) return;
        
        this.currentFrame = frameIndex;
        if (this.onFrame) {
            this.onFrame(this.currentFrame, this.frameCount);
        }
    }
    
    /**
     * Go to next frame (manual control)
     */
    nextFrame() {
        const oldFrame = this.currentFrame;
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        
        if (this.onFrame) {
            this.onFrame(this.currentFrame, this.frameCount);
        }
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, oldFrame);
        }
    }
    
    /**
     * Go to previous frame (manual control)
     */
    previousFrame() {
        const oldFrame = this.currentFrame;
        this.currentFrame = (this.currentFrame - 1 + this.frameCount) % this.frameCount;
        
        if (this.onFrame) {
            this.onFrame(this.currentFrame, this.frameCount);
        }
        
        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame, oldFrame);
        }
    }
    
    /**
     * Set FPS dynamically
     */
    setFPS(fps) {
        this.fps = fps;
        this.interval = 1000 / fps;
        
        if (this.isRunning) {
            this._stop();
            this._start();
        }
    }
    
    /**
     * Set total frame count
     */
    setFrameCount(count) {
        this.frameCount = count;
        if (this.currentFrame >= count) {
            this.currentFrame = count - 1;
        }
    }
    
    destroy() {
        this._stop();
        this.onFrameChange = null;
        super.destroy();
    }
}

/**
 * ThrottledLoop - Rate-limited animation loop
 * 
 * Use for: Performance-critical animations that don't need RAF precision
 *          Updates that should happen at specific intervals
 * 
 * Features:
 * - Combines RAF smoothness with interval-based throttling
 * - Better for heavy computations that don't need every frame
 * 
 * Example:
 * const loop = new ThrottledLoop({
 *     onFrame: () => this.updateExpensiveCalculation(),
 *     updateInterval: 1000 // Update once per second
 * });
 * loop.start();
 */
export class ThrottledLoop extends BaseAnimator {
    constructor(options = {}) {
        super(options);
        
        this.updateInterval = options.updateInterval || 1000; // ms between updates
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
    }
    
    _start() {
        this.lastUpdateTime = performance.now();
        this._loop();
    }
    
    _stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    _pause() {
        this._stop();
    }
    
    _resume() {
        this.lastUpdateTime = performance.now();
        this._loop();
    }
    
    _loop() {
        if (!this.isRunning || this.isPaused || this.isDestroyed) return;
        
        const now = performance.now();
        const elapsed = now - this.lastUpdateTime;
        
        if (elapsed >= this.updateInterval) {
            if (this.onFrame) {
                this.onFrame(elapsed, this.frameCount, this.getElapsedTime());
            }
            this.frameCount++;
            this.lastUpdateTime = now;
        }
        
        this.animationFrameId = requestAnimationFrame(() => this._loop());
    }
    
    /**
     * Set update interval dynamically
     */
    setUpdateInterval(interval) {
        this.updateInterval = interval;
    }
    
    destroy() {
        this._stop();
        super.destroy();
    }
}

/**
 * AnimationConfig - Common animation configuration and state
 * 
 * Use for: Sharing animation settings across multiple animators
 *          Centralizing animation state
 * 
 * Example:
 * const config = new AnimationConfig({ speed: 1.0, enabled: true });
 * const loop1 = new AnimationLoop({
 *     onFrame: () => this.draw(),
 *     config: config
 * });
 */
export class AnimationConfig {
    constructor(options = {}) {
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.speed = options.speed || 1.0;
        this.paused = options.paused || false;
        this.loop = options.loop !== undefined ? options.loop : true;
        
        // Callbacks for config changes
        this.onChange = options.onChange || null;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.onChange) this.onChange('enabled', enabled);
    }
    
    setSpeed(speed) {
        this.speed = speed;
        if (this.onChange) this.onChange('speed', speed);
    }
    
    setPaused(paused) {
        this.paused = paused;
        if (this.onChange) this.onChange('paused', paused);
    }
    
    setLoop(loop) {
        this.loop = loop;
        if (this.onChange) this.onChange('loop', loop);
    }
    
    toggleEnabled() {
        this.setEnabled(!this.enabled);
    }
    
    togglePaused() {
        this.setPaused(!this.paused);
    }
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.AnimationFoundation = {
        BaseAnimator,
        AnimationLoop,
        IntervalAnimator,
        FrameSequencer,
        ThrottledLoop,
        AnimationConfig
    };
    
    console.log('🎬 Animation Foundation v1.0.0 ready - Unified animation system loaded');
}

