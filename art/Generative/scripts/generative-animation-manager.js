/**
 * Generative Animation Manager
 * Resource-efficient manager for generative art animations
 * 
 * Features:
 * - Uses AnimationFoundation for unified control
 * - Lazy initialization (only create when visible)
 * - Automatic pause/resume based on viewport
 * - Performance throttling for background animations
 * - Memory management with proper cleanup
 * 
 * @version 1.0.0
 * @dependencies AnimationFoundation
 */

(function() {
    'use strict';

    class GenerativeAnimationManager {
        constructor() {
            this.animations = new Map(); // Map of animation ID → animation data
            this.observer = null;
            this.visibleAnimations = new Set();
            
            this.initIntersectionObserver();
        }

        /**
         * Initialize IntersectionObserver for viewport detection
         */
        initIntersectionObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const animId = entry.target.dataset.animId;
                    const animData = this.animations.get(animId);
                    
                    if (!animData) return;
                    
                    if (entry.isIntersecting) {
                        this.handleVisible(animId, animData);
                    } else {
                        this.handleHidden(animId, animData);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '200px' // Start loading 200px before visible
            });
        }

        /**
         * Handle animation becoming visible
         */
        handleVisible(animId, animData) {
            console.log(`👁️ Animation visible: ${animId}`);
            this.visibleAnimations.add(animId);
            
            // Lazy initialization - only create if not yet created
            if (!animData.initialized) {
                this.initializeAnimation(animId, animData);
            }
            
            // Resume/start animation with full FPS
            if (animData.animator) {
                if (animData.animatorType === 'AnimationLoop') {
                    animData.animator.setFPS(animData.targetFPS);
                }
                if (!animData.animator.isRunning) {
                    animData.animator.start();
                } else if (animData.animator.isPaused) {
                    animData.animator.resume();
                }
            } else if (animData.legacyInstance && animData.legacyInstance.start) {
                animData.legacyInstance.start();
            }
        }

        /**
         * Handle animation becoming hidden
         */
        handleHidden(animId, animData) {
            console.log(`🙈 Animation hidden: ${animId}`);
            this.visibleAnimations.delete(animId);
            
            // Pause or throttle animation when not visible
            if (animData.animator) {
                // Option 1: Pause completely (saves most resources)
                animData.animator.pause();
                
                // Option 2: Throttle to low FPS (keeps animating slowly)
                // animData.animator.setFPS(10);
            } else if (animData.legacyInstance && animData.legacyInstance.stop) {
                animData.legacyInstance.stop();
            }
        }

        /**
         * Initialize animation (lazy)
         */
        initializeAnimation(animId, animData) {
            console.log(`🚀 Initializing animation: ${animId}`);
            
            try {
                if (animData.type === 'canvas-animator') {
                    // Create custom canvas animation with AnimationFoundation
                    const instance = new animData.animationClass(animData.container, animData.options);
                    
                    // Wrap with AnimationFoundation.AnimationLoop
                    animData.animator = new window.AnimationFoundation.AnimationLoop({
                        onFrame: (deltaTime) => {
                            if (instance.draw) instance.draw();
                            if (instance.animate) instance.animate();
                        },
                        fps: animData.targetFPS || 60
                    });
                    
                    animData.legacyInstance = instance;
                    animData.animatorType = 'AnimationLoop';
                    
                } else if (animData.type === 'legacy') {
                    // For legacy animations with their own RAF loops
                    animData.legacyInstance = new animData.animationClass(animData.container, animData.options);
                    
                } else if (animData.type === 'p5') {
                    // P5.js sketches handled separately
                    if (animData.p5Instance) {
                        animData.p5Instance.loop();
                    }
                }
                
                animData.initialized = true;
                console.log(`✅ Animation initialized: ${animId}`);
                
            } catch (error) {
                console.error(`❌ Failed to initialize animation: ${animId}`, error);
                animData.failed = true;
            }
        }

        /**
         * Register an animation for management
         * 
         * @param {string} id - Unique animation ID
         * @param {HTMLElement} container - Container element
         * @param {Object} config - Animation configuration
         * @returns {string} Animation ID
         */
        register(id, container, config) {
            const animData = {
                id: id,
                container: container,
                type: config.type || 'legacy', // 'canvas-animator', 'legacy', 'p5'
                animationClass: config.animationClass,
                options: config.options || {},
                targetFPS: config.targetFPS || 60,
                initialized: false,
                failed: false,
                animator: null, // AnimationFoundation animator instance
                legacyInstance: null, // Original animation instance
                p5Instance: config.p5Instance || null,
                animatorType: null
            };
            
            this.animations.set(id, animData);
            
            // Set data attribute for observer
            container.dataset.animId = id;
            
            // Start observing
            this.observer.observe(container);
            
            console.log(`📝 Registered animation: ${id}`);
            return id;
        }

        /**
         * Unregister and cleanup animation
         */
        unregister(id) {
            const animData = this.animations.get(id);
            if (!animData) return;
            
            console.log(`🧹 Unregistering animation: ${id}`);
            
            // Stop observing
            if (animData.container) {
                this.observer.unobserve(animData.container);
            }
            
            // Cleanup animator
            if (animData.animator) {
                animData.animator.destroy();
            }
            
            // Cleanup legacy instance
            if (animData.legacyInstance && animData.legacyInstance.destroy) {
                animData.legacyInstance.destroy();
            }
            
            // Cleanup p5 instance
            if (animData.p5Instance && animData.p5Instance.remove) {
                animData.p5Instance.remove();
            }
            
            this.animations.delete(id);
            this.visibleAnimations.delete(id);
        }

        /**
         * Cleanup all animations
         */
        destroyAll() {
            console.log(`🧹 Destroying all animations (${this.animations.size})`);
            
            for (const [id, animData] of this.animations.entries()) {
                this.unregister(id);
            }
            
            if (this.observer) {
                this.observer.disconnect();
            }
            
            this.animations.clear();
            this.visibleAnimations.clear();
        }

        /**
         * Pause all visible animations (e.g., when tab loses focus)
         */
        pauseAll() {
            for (const id of this.visibleAnimations) {
                const animData = this.animations.get(id);
                if (animData && animData.animator) {
                    animData.animator.pause();
                }
            }
        }

        /**
         * Resume all visible animations
         */
        resumeAll() {
            for (const id of this.visibleAnimations) {
                const animData = this.animations.get(id);
                if (animData && animData.animator && animData.animator.isPaused) {
                    animData.animator.resume();
                }
            }
        }

        /**
         * Get performance stats
         */
        getStats() {
            return {
                total: this.animations.size,
                visible: this.visibleAnimations.size,
                initialized: Array.from(this.animations.values()).filter(a => a.initialized).length,
                failed: Array.from(this.animations.values()).filter(a => a.failed).length
            };
        }
    }

    // Export as global
    window.GenerativeAnimationManager = GenerativeAnimationManager;
    
    console.log('🎨 Generative Animation Manager v1.0.0 loaded');

})();

