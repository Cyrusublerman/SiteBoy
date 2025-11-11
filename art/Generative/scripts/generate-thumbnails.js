/**
 * Thumbnail Generator for Generative Animations
 * Captures a mid-frame from each animation as a thumbnail
 * 
 * Usage: Run this in the browser console or as a standalone script
 * to generate thumbnails for all generative animations
 */

class ThumbnailGenerator {
    constructor() {
        this.animations = [
            {
                id: 'phyllotaxis-sweep',
                type: 'p5',
                scriptPath: '/projects/Synthetic Biophilia/assets/p5/phyllo-sweep-siteboy.js',
                width: 600,
                height: 600,
                captureFrame: 180 // 3 seconds at 60fps
            },
            {
                id: 'phyllotaxis-manual',
                type: 'p5',
                scriptPath: '/projects/Synthetic Biophilia/assets/p5/phyllo-manual-siteboy.js',
                width: 600,
                height: 600,
                captureFrame: 120
            },
            {
                id: 'circles',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/circles-animation.js',
                className: 'CirclesAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            },
            {
                id: 'torus',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/torus-animation.js',
                className: 'TorusAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            },
            {
                id: 'tiles',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/tile-animation.js',
                className: 'TileAnimation',
                width: 600,
                height: 600,
                captureFrame: 120
            },
            {
                id: 'harmonics',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/harmonics-animation.js',
                className: 'HarmonicsAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            },
            {
                id: 'wave-interference',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/wave-animation.js',
                className: 'WaveAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            },
            {
                id: 'cymatics',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/cymatics-animation.js',
                className: 'CymaticsAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            },
            {
                id: 'lissajous',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/lissajous-animation.js',
                className: 'LissajousAnimation',
                width: 600,
                height: 600,
                captureFrame: 120
            },
            {
                id: 'musical-harmonics',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/musical-harmonics-animation.js',
                className: 'MusicalHarmonicsAnimation',
                width: 600,
                height: 600,
                captureFrame: 180
            }
        ];
    }

    /**
     * Generate all thumbnails
     */
    async generateAll() {
        console.log('🖼️ Starting thumbnail generation for', this.animations.length, 'animations');
        
        for (const anim of this.animations) {
            try {
                console.log(`\n📸 Generating thumbnail for: ${anim.id}`);
                await this.generateThumbnail(anim);
                console.log(`✅ Completed: ${anim.id}`);
                
                // Small delay between generations
                await this.delay(1000);
            } catch (err) {
                console.error(`❌ Failed to generate thumbnail for ${anim.id}:`, err);
            }
        }
        
        console.log('\n🎉 Thumbnail generation complete!');
    }

    /**
     * Generate thumbnail for a single animation
     */
    async generateThumbnail(animData) {
        // Create offscreen container
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: ${animData.width}px;
            height: ${animData.height}px;
        `;
        container.id = `thumb-gen-${animData.id}`;
        document.body.appendChild(container);

        try {
            let canvas;
            
            if (animData.type === 'p5') {
                canvas = await this.captureP5Animation(animData, container);
            } else if (animData.type === 'animation') {
                canvas = await this.captureLegacyAnimation(animData, container);
            }

            if (canvas) {
                this.downloadCanvas(canvas, `${animData.id}.jpg`);
            }
        } finally {
            // Cleanup
            document.body.removeChild(container);
        }
    }

    /**
     * Capture p5.js animation at specified frame
     */
    async captureP5Animation(animData, container) {
        // Load p5 library if needed
        if (typeof window.p5 === 'undefined') {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.min.js');
        }

        // Load sketch
        await this.loadScript(animData.scriptPath);
        
        // Wait for animation to run to target frame
        await this.delay((animData.captureFrame / 60) * 1000);
        
        // Find canvas
        const canvas = container.querySelector('canvas');
        return canvas;
    }

    /**
     * Capture legacy animation at specified frame
     */
    async captureLegacyAnimation(animData, container) {
        // Load script
        await this.loadScript(animData.scriptPath);
        
        // Instantiate animation
        const AnimClass = window[animData.className];
        if (!AnimClass) {
            throw new Error(`Animation class not found: ${animData.className}`);
        }

        const canvas = document.createElement('canvas');
        canvas.width = animData.width;
        canvas.height = animData.height;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const animInstance = new AnimClass(canvas, ctx, { 
            width: animData.width, 
            height: animData.height 
        });

        // Run animation for target frame count
        for (let i = 0; i < animData.captureFrame; i++) {
            if (animInstance.update) animInstance.update();
            if (animInstance.draw) animInstance.draw();
            await this.delay(16.67); // ~60fps
        }

        // Stop animation
        if (animInstance.stop) animInstance.stop();
        if (animInstance.destroy) animInstance.destroy();

        return canvas;
    }

    /**
     * Download canvas as image
     */
    downloadCanvas(canvas, filename) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            console.log(`📥 Downloaded: ${filename}`);
        }, 'image/jpeg', 0.9);
    }

    /**
     * Load external script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Make available globally
window.ThumbnailGenerator = ThumbnailGenerator;

// Auto-run if called with ?generate-thumbnails in URL
if (window.location.search.includes('generate-thumbnails')) {
    console.log('🚀 Auto-generating thumbnails...');
    const generator = new ThumbnailGenerator();
    generator.generateAll();
}

console.log('💡 Thumbnail Generator loaded. Run: new ThumbnailGenerator().generateAll()');

