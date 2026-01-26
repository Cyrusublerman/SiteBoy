/**
 * Scrollbar - Custom VGA-styled scrollbar component
 * 
 * Adaptive, modular scrollbar that integrates seamlessly with SiteBoy's design system.
 * Replaces native scrollbars with F-based, theme-aware, proportionally-sized alternatives.
 * 
 * FEATURES:
 * - Auto-detection: orientation, size (F vs F/2), borders
 * - Proportional thumb: 1/3 visible = 1/3 thumb height
 * - Dual-mode: scroll navigation OR GUI slider
 * - Smooth momentum scrolling via AnimationFoundation
 * - Full keyboard/touch support
 * - Theme-aware VGA colors
 * 
 * USAGE:
 * // Auto-mode (component figures everything out)
 * const scrollbar = new Scrollbar({ target: scrollableElement });
 * 
 * // Manual control
 * const scrollbar = new Scrollbar({
 *     target: element,
 *     orientation: 'horizontal',
 *     size: 'half',
 *     smoothScrolling: true
 * });
 * 
 * // GUI slider mode
 * const slider = new Scrollbar({
 *     orientation: 'horizontal',
 *     range: { min: 0, max: 100, value: 50 },
 *     onChange: (value) => console.log(value)
 * });
 * 
 * @extends BaseComponent
 * @version 1.0.0
 */

import { BaseComponent } from '../../foundation.js';
import { AnimationLoop } from '../../../core/animation-foundation.js';

export class Scrollbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'scrollbar' }, deps);
        
        // Target element to scroll (null for GUI slider mode)
        this.target = options.target || null;
        
        // Configuration
        this.orientation = options.orientation || 'auto';  // 'vertical' | 'horizontal' | 'auto'
        this.sizeMode = options.size || 'auto';            // 'full' | 'half' | 'auto'
        this.position = options.position || null;          // 'right'|'left' | 'top'|'bottom' | null (auto)
        this.borderConfig = options.borders || {};         // { track: bool, thumb: bool }
        this.smoothScrolling = options.smoothScrolling ?? true;
        this.smoothness = options.smoothness || 0.15;
        this.hideWhenInactive = options.hideWhenInactive ?? false;
        this.fadeDelay = options.fadeDelay || 1000;
        this.keyboard = options.keyboard ?? true;
        this.touch = options.touch ?? true;
        
        // GUI slider mode
        this.range = options.range || null;  // { min, max, value }
        this.onChangeCallback = options.onChange || null;
        this.labels = options.labels || null;
        
        // Internal state
        this.detectedOrientation = null;
        this.detectedSize = null;
        this.hasBorder = true;
        this.isActive = false;
        this.isDragging = false;
        
        // Animation/timing
        this.scrollAnimator = null;
        this.hideTimeout = null;
        this.currentScroll = 0;
        this.targetScroll = 0;
        
        // Observers
        this.resizeObserver = null;
        this.mutationObserver = null;
        
        // DOM references
        this.track = null;
        this.thumb = null;
        
        // Bind methods
        this._handleScroll = this._handleScroll.bind(this);
        this._handleWheel = this._handleWheel.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleResize = this._handleResize.bind(this);
        
        // Initialize if target provided
        if (this.target || this.range) {
            this.init();
        }
    }
    
    /**
     * Initialize scrollbar - auto-detect parameters and render
     */
    init() {
        window.debugLog('INIT', '📜 Initializing Scrollbar component');
        
        // Auto-detect parameters
        if (this.target) {
            this.detectedOrientation = this._detectOrientation();
            this.detectedSize = this._detectSize();
            this.hasBorder = this._detectBorders();
        } else if (this.range) {
            // GUI slider mode
            this.detectedOrientation = this.orientation === 'auto' ? 'horizontal' : this.orientation;
            this.detectedSize = this._getSizeInPixels();
            this.hasBorder = true;
        }
        
        // Build DOM
        this.render();
        
        // Setup event handlers
        if (this.target) {
            this._setupScrollMode();
        } else if (this.range) {
            this._setupSliderMode();
        }
        
        // Initial calculation
        this._updateThumb();
        
        window.debugLog('TOOLS', `📜 Scrollbar ready: ${this.detectedOrientation}, ${this.detectedSize}px`);
    }
    
    /**
     * Auto-detect scrollbar orientation based on content overflow
     */
    _detectOrientation() {
        if (this.orientation !== 'auto') {
            return this.orientation;
        }
        
        const hasVerticalOverflow = this.target.scrollHeight > this.target.clientHeight;
        const hasHorizontalOverflow = this.target.scrollWidth > this.target.clientWidth;
        
        // If both, choose dominant direction
        if (hasVerticalOverflow && hasHorizontalOverflow) {
            const vRatio = this.target.scrollHeight / this.target.clientHeight;
            const hRatio = this.target.scrollWidth / this.target.clientWidth;
            return vRatio > hRatio ? 'vertical' : 'horizontal';
        }
        
        return hasVerticalOverflow ? 'vertical' : 'horizontal';
    }
    
    /**
     * Auto-detect scrollbar size (F vs F/2)
     */
    _detectSize() {
        if (this.sizeMode !== 'auto') {
            return this._getSizeInPixels();
        }
        
        const { F, F2 } = this.getF();
        
        // Check context indicators for F/2 usage
        const parentWidth = this.target.parentElement?.clientWidth || 0;
        const isNested = this._detectNestedScrollbar();
        const isSidebar = this.target.closest('.tool-sidebar, .animation-sidebar');
        
        // Use F/2 in constrained contexts
        if (parentWidth < 400 || isNested || isSidebar) {
            return F2;
        }
        
        return F;
    }
    
    /**
     * Get size in pixels from sizeMode
     */
    _getSizeInPixels() {
        const { F, F2 } = this.getF();
        return this.sizeMode === 'half' ? F2 : F;
    }
    
    /**
     * Detect if this is a nested scrollbar
     */
    _detectNestedScrollbar() {
        let parent = this.target.parentElement;
        while (parent) {
            const style = getComputedStyle(parent);
            if (style.overflow !== 'visible' && style.overflow !== 'hidden') {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
    
    /**
     * Auto-detect if track border needed (avoid double borders)
     */
    _detectBorders() {
        if (this.borderConfig.track !== undefined) {
            return this.borderConfig.track;
        }
        
        // Check if parent has border on scrollbar side
        const parentStyle = getComputedStyle(this.target);
        const side = this.detectedOrientation === 'vertical' ? 'right' : 'bottom';
        const hasBorder = parentStyle[`border-${side}-width`] !== '0px';
        
        // If parent has border, don't add track border (avoid double line)
        return !hasBorder;
    }
    
    /**
     * Render scrollbar DOM structure
     */
    render() {
        if (this.element) return this.element;
        
        const { F } = this.getF();
        
        // Container
        this.element = this.createElement('div', 'custom-scrollbar');
        this.element.dataset.orientation = this.detectedOrientation;
        this.element.dataset.size = this.detectedSize;
        
        // Track (outer frame)
        this.track = this.createElement('div', 
            `scrollbar-track${this.hasBorder ? ' with-border' : ''}`
        );
        
        // Thumb (draggable indicator)
        this.thumb = this.createElement('div', 'scrollbar-thumb');
        
        // Assemble
        this.track.appendChild(this.thumb);
        this.element.appendChild(this.track);
        
        // Position scrollbar
        this._positionScrollbar();
        
        // Insert into DOM
        if (this.target) {
            // Insert after target element
            const parent = this.target.parentElement;
            if (parent) {
                parent.style.position = 'relative'; // Ensure positioned parent
                parent.appendChild(this.element);
            }
        }
        
        return this.element;
    }
    
    /**
     * Position scrollbar relative to target
     */
    _positionScrollbar() {
        if (this.detectedOrientation === 'vertical') {
            const position = this.position || 'right';
            this.element.style.cssText = `
                position: absolute;
                top: 0;
                ${position}: 0;
                width: ${this.detectedSize}px;
                height: 100%;
                z-index: 100;
                pointer-events: all;
            `;
        } else {
            const position = this.position || 'bottom';
            this.element.style.cssText = `
                position: absolute;
                ${position}: 0;
                left: 0;
                width: 100%;
                height: ${this.detectedSize}px;
                z-index: 100;
                pointer-events: all;
            `;
        }
    }
    
    /**
     * Setup event handlers for scroll mode
     */
    _setupScrollMode() {
        // Scroll synchronization
        this.target.addEventListener('scroll', this._handleScroll);
        
        // Drag handlers
        this.thumb.addEventListener('mousedown', this._handleMouseDown);
        
        // Wheel events (smooth scrolling)
        if (this.smoothScrolling) {
            this.target.addEventListener('wheel', this._handleWheel, { passive: false });
        }
        
        // Keyboard navigation
        if (this.keyboard) {
            this.target.addEventListener('keydown', this._handleKeyDown);
            // Make target focusable if not already
            if (!this.target.hasAttribute('tabindex')) {
                this.target.tabIndex = -1;
            }
        }
        
        // Touch support
        if (this.touch) {
            this.thumb.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        }
        
        // Resize observer
        this._setupResizeObserver();
        
        // Hide native scrollbar
        this._hideNativeScrollbar();
    }
    
    /**
     * Setup event handlers for slider mode
     */
    _setupSliderMode() {
        this.thumb.addEventListener('mousedown', this._handleMouseDown);
        
        if (this.touch) {
            this.thumb.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        }
        
        // Initial value
        if (this.range) {
            this._setSliderValue(this.range.value);
        }
    }
    
    /**
     * Hide native scrollbar on target
     */
    _hideNativeScrollbar() {
        this.target.style.scrollbarWidth = 'none'; // Firefox
        this.target.style.msOverflowStyle = 'none'; // IE/Edge
        
        // Webkit (Chrome, Safari)
        const style = document.createElement('style');
        style.textContent = `
            [data-custom-scrollbar]::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
        this.target.dataset.customScrollbar = 'true';
    }
    
    /**
     * Calculate proportional thumb size
     */
    _calculateThumbSize() {
        if (!this.target) {
            // GUI slider mode - fixed size
            const { F } = this.getF();
            return {
                size: F * 2,
                max: this.detectedOrientation === 'vertical' 
                    ? this.track.clientHeight - F * 2
                    : this.track.clientWidth - F * 2
            };
        }
        
        const { F } = this.getF();
        const borderOffset = this.hasBorder ? 2 : 0;
        
        if (this.detectedOrientation === 'vertical') {
            const viewportHeight = this.target.clientHeight;
            const contentHeight = this.target.scrollHeight;
            const trackHeight = viewportHeight - borderOffset;
            
            // Proportional: visible/total = thumb/track
            const visibleRatio = viewportHeight / contentHeight;
            const thumbHeight = Math.max(trackHeight * visibleRatio, F); // Min F height
            
            return {
                size: thumbHeight,
                max: trackHeight - thumbHeight
            };
        } else {
            const viewportWidth = this.target.clientWidth;
            const contentWidth = this.target.scrollWidth;
            const trackWidth = viewportWidth - borderOffset;
            
            const visibleRatio = viewportWidth / contentWidth;
            const thumbWidth = Math.max(trackWidth * visibleRatio, F);
            
            return {
                size: thumbWidth,
                max: trackWidth - thumbWidth
            };
        }
    }
    
    /**
     * Update thumb position and size
     */
    _updateThumb() {
        const { size, max } = this._calculateThumbSize();
        
        if (this.detectedOrientation === 'vertical') {
            const scrollRatio = this.target 
                ? this.target.scrollTop / (this.target.scrollHeight - this.target.clientHeight)
                : 0;
            const thumbY = Math.max(0, Math.min(scrollRatio * max, max));
            
            this.thumb.style.height = `${size}px`;
            this.thumb.style.width = '100%';
            this.thumb.style.top = `${thumbY}px`;
            this.thumb.style.left = '0';
        } else {
            const scrollRatio = this.target 
                ? this.target.scrollLeft / (this.target.scrollWidth - this.target.clientWidth)
                : 0;
            const thumbX = Math.max(0, Math.min(scrollRatio * max, max));
            
            this.thumb.style.width = `${size}px`;
            this.thumb.style.height = '100%';
            this.thumb.style.left = `${thumbX}px`;
            this.thumb.style.top = '0';
        }
    }
    
    /**
     * Handle target scroll event
     */
    _handleScroll() {
        this._updateThumb();
        this._showScrollbar();
        this._scheduleHide();
    }
    
    /**
     * Handle wheel event for smooth scrolling
     */
    _handleWheel(e) {
        e.preventDefault();
        
        // Initialize animator if needed
        if (!this.scrollAnimator) {
            this.scrollAnimator = new AnimationLoop({
                onFrame: () => this._animateScroll()
            });
        }
        
        // Update target scroll
        if (this.detectedOrientation === 'vertical') {
            this.targetScroll += e.deltaY;
            this.targetScroll = Math.max(0, Math.min(
                this.targetScroll,
                this.target.scrollHeight - this.target.clientHeight
            ));
        } else {
            this.targetScroll += e.deltaX;
            this.targetScroll = Math.max(0, Math.min(
                this.targetScroll,
                this.target.scrollWidth - this.target.clientWidth
            ));
        }
        
        // Start animation if not running
        if (!this.scrollAnimator.isRunning) {
            this.currentScroll = this.detectedOrientation === 'vertical'
                ? this.target.scrollTop
                : this.target.scrollLeft;
            this.scrollAnimator.start();
        }
    }
    
    /**
     * Animate smooth scrolling
     */
    _animateScroll() {
        if (Math.abs(this.targetScroll - this.currentScroll) < 0.5) {
            this.scrollAnimator.stop();
            return;
        }
        
        // Ease towards target
        this.currentScroll += (this.targetScroll - this.currentScroll) * this.smoothness;
        
        if (this.detectedOrientation === 'vertical') {
            this.target.scrollTop = this.currentScroll;
        } else {
            this.target.scrollLeft = this.currentScroll;
        }
    }
    
    /**
     * Handle thumb mouse down
     */
    _handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        
        this.dragStart = this.detectedOrientation === 'vertical' ? e.clientY : e.clientX;
        this.scrollStart = this.target 
            ? (this.detectedOrientation === 'vertical' ? this.target.scrollTop : this.target.scrollLeft)
            : (this.range ? this.range.value : 0);
        
        this.thumb.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', this._handleMouseMove);
        document.addEventListener('mouseup', this._handleMouseUp);
    }
    
    /**
     * Handle thumb mouse move (drag)
     */
    _handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const current = this.detectedOrientation === 'vertical' ? e.clientY : e.clientX;
        const delta = current - this.dragStart;
        
        if (this.target) {
            // Scroll mode
            const { max } = this._calculateThumbSize();
            const scrollableSize = this.detectedOrientation === 'vertical'
                ? this.target.scrollHeight - this.target.clientHeight
                : this.target.scrollWidth - this.target.clientWidth;
            
            const scrollDelta = (delta / max) * scrollableSize;
            const newScroll = Math.max(0, Math.min(this.scrollStart + scrollDelta, scrollableSize));
            
            if (this.detectedOrientation === 'vertical') {
                this.target.scrollTop = newScroll;
            } else {
                this.target.scrollLeft = newScroll;
            }
        } else if (this.range) {
            // Slider mode
            const { max } = this._calculateThumbSize();
            const valueRange = this.range.max - this.range.min;
            const valueDelta = (delta / max) * valueRange;
            const newValue = Math.max(this.range.min, Math.min(
                this.scrollStart + valueDelta,
                this.range.max
            ));
            
            this._setSliderValue(newValue);
            
            if (this.onChangeCallback) {
                this.onChangeCallback(newValue);
            }
        }
    }
    
    /**
     * Handle thumb mouse up
     */
    _handleMouseUp() {
        this.isDragging = false;
        this.thumb.style.cursor = 'grab';
        
        document.removeEventListener('mousemove', this._handleMouseMove);
        document.removeEventListener('mouseup', this._handleMouseUp);
    }
    
    /**
     * Handle touch start
     */
    _handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        
        this.isDragging = true;
        this.dragStart = this.detectedOrientation === 'vertical' ? touch.clientY : touch.clientX;
        this.scrollStart = this.target 
            ? (this.detectedOrientation === 'vertical' ? this.target.scrollTop : this.target.scrollLeft)
            : (this.range ? this.range.value : 0);
        
        document.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        document.addEventListener('touchend', this._handleTouchEnd);
    }
    
    /**
     * Handle touch move
     */
    _handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const current = this.detectedOrientation === 'vertical' ? touch.clientY : touch.clientX;
        const delta = current - this.dragStart;
        
        if (this.target) {
            const { max } = this._calculateThumbSize();
            const scrollableSize = this.detectedOrientation === 'vertical'
                ? this.target.scrollHeight - this.target.clientHeight
                : this.target.scrollWidth - this.target.clientWidth;
            
            const scrollDelta = (delta / max) * scrollableSize;
            const newScroll = Math.max(0, Math.min(this.scrollStart + scrollDelta, scrollableSize));
            
            if (this.detectedOrientation === 'vertical') {
                this.target.scrollTop = newScroll;
            } else {
                this.target.scrollLeft = newScroll;
            }
        } else if (this.range) {
            const { max } = this._calculateThumbSize();
            const valueRange = this.range.max - this.range.min;
            const valueDelta = (delta / max) * valueRange;
            const newValue = Math.max(this.range.min, Math.min(
                this.scrollStart + valueDelta,
                this.range.max
            ));
            
            this._setSliderValue(newValue);
            
            if (this.onChangeCallback) {
                this.onChangeCallback(newValue);
            }
        }
    }
    
    /**
     * Handle touch end
     */
    _handleTouchEnd() {
        this.isDragging = false;
        
        document.removeEventListener('touchmove', this._handleTouchMove);
        document.removeEventListener('touchend', this._handleTouchEnd);
    }
    
    /**
     * Handle keyboard navigation
     */
    _handleKeyDown(e) {
        const { F } = this.getF();
        
        const scrollAmount = {
            'ArrowUp': -F * 2,
            'ArrowDown': F * 2,
            'ArrowLeft': -F * 2,
            'ArrowRight': F * 2,
            'PageUp': -this.target.clientHeight * 0.9,
            'PageDown': this.target.clientHeight * 0.9,
            'Home': this.detectedOrientation === 'vertical' ? -this.target.scrollTop : -this.target.scrollLeft,
            'End': this.detectedOrientation === 'vertical' 
                ? this.target.scrollHeight 
                : this.target.scrollWidth
        }[e.key];
        
        if (scrollAmount !== undefined) {
            e.preventDefault();
            
            if (this.detectedOrientation === 'vertical') {
                this.target.scrollTop += scrollAmount;
            } else {
                this.target.scrollLeft += scrollAmount;
            }
        }
    }
    
    /**
     * Set slider value (GUI mode)
     */
    _setSliderValue(value) {
        if (!this.range) return;
        
        this.range.value = value;
        
        // Update thumb position based on value
        const { max } = this._calculateThumbSize();
        const valueRange = this.range.max - this.range.min;
        const valueRatio = (value - this.range.min) / valueRange;
        const thumbPos = valueRatio * max;
        
        if (this.detectedOrientation === 'vertical') {
            this.thumb.style.top = `${thumbPos}px`;
        } else {
            this.thumb.style.left = `${thumbPos}px`;
        }
    }
    
    /**
     * Show scrollbar (fade in)
     */
    _showScrollbar() {
        if (!this.hideWhenInactive) return;
        
        this.isActive = true;
        this.element.classList.remove('inactive');
        this.element.classList.add('active');
    }
    
    /**
     * Schedule hide (fade out after delay)
     */
    _scheduleHide() {
        if (!this.hideWhenInactive) return;
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        this.hideTimeout = setTimeout(() => {
            this.isActive = false;
            this.element.classList.remove('active');
            this.element.classList.add('inactive');
        }, this.fadeDelay);
    }
    
    /**
     * Setup resize observer
     */
    _setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(this._handleResize);
        this.resizeObserver.observe(this.target);
        
        // Also watch for content mutations
        this.mutationObserver = new MutationObserver(this._handleResize);
        this.mutationObserver.observe(this.target, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
    
    /**
     * Handle resize/mutation
     */
    _handleResize() {
        // Recheck if scrollbar needed
        const needsScrollbar = this.detectedOrientation === 'vertical'
            ? this.target.scrollHeight > this.target.clientHeight
            : this.target.scrollWidth > this.target.clientWidth;
        
        if (needsScrollbar) {
            this.element.style.display = 'block';
            this._updateThumb();
        } else {
            this.element.style.display = 'none';
        }
    }
    
    /**
     * Destroy scrollbar and cleanup
     */
    destroy() {
        window.debugLog('VERBOSE', '📜 Destroying Scrollbar');
        
        // Stop animations
        if (this.scrollAnimator) {
            this.scrollAnimator.destroy();
            this.scrollAnimator = null;
        }
        
        // Clear timers
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        // Disconnect observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        // Remove event listeners
        if (this.target) {
            this.target.removeEventListener('scroll', this._handleScroll);
            this.target.removeEventListener('wheel', this._handleWheel);
            this.target.removeEventListener('keydown', this._handleKeyDown);
            
            // Restore native scrollbar
            this.target.style.scrollbarWidth = '';
            this.target.style.msOverflowStyle = '';
            delete this.target.dataset.customScrollbar;
        }
        
        if (this.thumb) {
            this.thumb.removeEventListener('mousedown', this._handleMouseDown);
            this.thumb.removeEventListener('touchstart', this._handleTouchStart);
        }
        
        document.removeEventListener('mousemove', this._handleMouseMove);
        document.removeEventListener('mouseup', this._handleMouseUp);
        document.removeEventListener('touchmove', this._handleTouchMove);
        document.removeEventListener('touchend', this._handleTouchEnd);
        
        // Call parent destroy
        super.destroy();
    }
}
