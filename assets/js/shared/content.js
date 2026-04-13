/**
 * Content Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - Heading (semantic heading component H1-H6)
 * - Paragraph (semantic paragraph component)
 * - Quote (semantic blockquote component)
 * - Image (semantic image with figure/caption)
 * - Video (semantic video with figure/caption)
 * - Audio (semantic audio with figure/caption)
 * - MarkdownBody (advanced markdown rendering with fallback parser)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all content/media components.
 * 
 * USAGE PATTERN:
 * import { Heading, Image, MarkdownBody } from './content.js';
 * const heading = new Heading({ level: 2, content: 'Title' }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';
import { ASCII_NAV_FONT, FONT_ROWS, FONT_COLS, FONT_GAP } from '../../data/ascii-nav-font.js';

/**
 * Heading - Semantic heading component
 */
export class Heading extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'heading' }, deps);
        this.level = Math.max(1, Math.min(6, options.level || 1));
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            const tag = `h${this.level}`;
            this.element = this.createElement(tag, `heading heading-${this.level}`);
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Paragraph - Semantic paragraph component
 */
export class Paragraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'paragraph' }, deps);
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('p', 'paragraph');
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Quote - Semantic blockquote component
 */
export class Quote extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'quote' }, deps);
        this.content = options.content || '';
        this.cite = options.cite || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('blockquote', 'quote');
            this.setContent(this.content);
            
            if (this.cite) {
                const citation = this.createElement('cite', 'quote-cite');
                citation.textContent = this.cite;
                this.element.appendChild(citation);
            }
        }
        return this.element;
    }
}

/**
 * Image - Semantic image component
 */
export class Image extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'image' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm'; // s, m, l, full
        this.caption = options.caption || null;
        this.enableZoom = options.enableZoom || false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `image image-${this.size}`);
            
            const img = this.createElement('img', 'image-element');
            img.src = this.src;
            img.alt = this.caption || '';
            this.element.appendChild(img);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'image-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }

            if (this.enableZoom && window.ComponentLibrary && window.ComponentLibrary.Lightbox) {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', () => {
                    const lb = new window.ComponentLibrary.Lightbox({ src: this.src }, this.deps);
                    lb.open(this.src);
                });
            }
        }
        return this.element;
    }
}

/**
 * Video - Semantic video component
 */
export class Video extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'video' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `video video-${this.size}`);
            
            const video = this.createElement('video', 'video-element');
            video.src = this.src;
            if (this.controls) video.controls = true;
            this.element.appendChild(video);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'video-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * Audio - Semantic audio component
 */
export class Audio extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'audio' }, deps);
        this.src = options.src || '';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', 'audio');
            
            const audio = this.createElement('audio', 'audio-element');
            audio.src = this.src;
            if (this.controls) audio.controls = true;
            this.element.appendChild(audio);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'audio-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * MarkdownBody - Advanced markdown content rendering component
 */
export class MarkdownBody extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'markdown' }, deps);
        this.markdownText = options.markdownText || '';
        this.className = options.className || 'markdown-body';
        this.enableTOC = options.enableTOC || false;
        this.componentInstances = []; // Track embedded components for cleanup
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.className);
            
            const htmlContent = this.parseMarkdown(this.markdownText);
            this.element.innerHTML = htmlContent;

            this.executeScripts(this.element);

            // Process p5.js components
            this.processP5Components(this.element);
            
            // Apply syntax highlighting to code blocks
            this.applySyntaxHighlighting(this.element);

            // Render LaTeX with MathJax (with better error handling and timing)
            this.renderMath();

            // Enable zoom on inline images using Lightbox if available
            if (window.ComponentLibrary && window.ComponentLibrary.Lightbox) {
                const imgs = Array.from(this.element.querySelectorAll('img'));
                imgs.forEach(img => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', () => {
                        const lb = new window.ComponentLibrary.Lightbox({ src: img.src }, this.deps);
                        lb.open(img.src);
                    });
                });
            }
        }
        return this.element;
    }
    
    parseMarkdown(markdown) {
        markdown = this.stripFrontmatter(markdown);
        if (!markdown || markdown.trim() === '') {
            return '<p><em>No content available.</em></p>';
        }
        
        // Check for LaTeX content for debugging
        const hasLaTeX = markdown.includes('$') || markdown.includes('\\(') || markdown.includes('\\[');
        if (hasLaTeX) {
            console.log('🔍 LaTeX detected in markdown - will render after parsing');
        }
        
        try {
            // Use marked.js if available
            if (typeof marked !== 'undefined') {
                // Simple, clean markdown parsing - let MathJax handle LaTeX naturally
                return marked.parse(markdown, {
                    breaks: true,
                    gfm: true,
                    sanitize: false // Allow HTML and LaTeX
                });
            } else {
                // Fallback: basic markdown parsing
                return this.basicMarkdownParse(markdown);
            }
        } catch (error) {
            console.error('❌ Markdown parsing failed:', error);
            return `<p>Error parsing markdown: ${error.message}</p><pre>${markdown}</pre>`;
        }
    }
    
    stripFrontmatter(markdown) {
        if (!markdown) return markdown;
        // Only strip if document begins with '---' on first line
        if (!/^---\s*$/m.test(markdown.split(/\r?\n/, 1)[0] || '')) return markdown;
        const lines = markdown.split(/\r?\n/);
        if (lines.length < 3) return markdown;
        if (lines[0].trim() !== '---') return markdown;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                return lines.slice(i + 1).join('\n');
            }
        }
        return markdown;
    }
    
    basicMarkdownParse(markdown) {
        let html = markdown;
        
        // GFM Tables - must process before other replacements
        html = this.parseGFMTables(html);
        
        // Headers (H1-H6)
        html = html.replace(/^#{6} (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^#{5} (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#{4} (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^#{3} (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#{2} (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^#{1} (.*$)/gim, '<h1>$1</h1>');
        
        // Code blocks with language support for Prism.js
        // Match ```language\ncode\n``` pattern
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
            const language = lang || 'none';
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .trim();
            return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
        });
        
        // Inline code
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Bold and italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Links and images
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
        
        // Numbered lists
        html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>');
        
        // Unordered lists
        html = html.replace(/^[-*+] (.+)$/gim, '<li>$1</li>');
        
        // Wrap consecutive <li> in <ul> or <ol>
        html = html.replace(/(<li>.*?<\/li>\n?)+/gims, (match) => `<ul>${match}</ul>`);
        
        // Paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs and fix nesting
        html = html.replace(/<p>\s*<\/p>/gim, '');
        html = html.replace(/<p>(<h[1-6]>)/gim, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1');
        html = html.replace(/<p>(<table)/gim, '$1');
        html = html.replace(/(<\/table>)<\/p>/gim, '$1');
        html = html.replace(/<p>(<ul)/gim, '$1');
        html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
        html = html.replace(/<p>(<pre)/gim, '$1');
        html = html.replace(/(<\/pre>)<\/p>/gim, '$1');
        
        return html;
    }
    
    parseGFMTables(markdown) {
        // Match GFM table pattern: header row, separator row, data rows
        const tableRegex = /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)+)/gim;
        
        return markdown.replace(tableRegex, (match, headerLine, bodyLines) => {
            // Parse header cells
            const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
            
            // Parse body rows
            const rows = bodyLines.trim().split('\n').map(line => {
                return line.split('|').map(c => c.trim()).filter(c => c !== '');
            });
            
            // Build HTML table
            let tableHtml = '<table>\n<thead>\n<tr>';
            headers.forEach(h => {
                tableHtml += `<th>${h}</th>`;
            });
            tableHtml += '</tr>\n</thead>\n<tbody>\n';
            
            rows.forEach(row => {
                tableHtml += '<tr>';
                row.forEach(cell => {
                    tableHtml += `<td>${cell}</td>`;
                });
                tableHtml += '</tr>\n';
            });
            
            tableHtml += '</tbody>\n</table>\n';
            return tableHtml;
        });
    }
    
    updateContent(markdownText) {
        this.markdownText = markdownText;
        if (this.element) {
            const htmlContent = this.parseMarkdown(markdownText);
            this.element.innerHTML = htmlContent;
            this.executeScripts(this.element);
            
            // Process p5.js components
            this.processP5Components(this.element);
            
            // Apply syntax highlighting to code blocks
            this.applySyntaxHighlighting(this.element);
            
            // Render math
            this.renderMath();

            // Re-bind zoom handlers for images
            if (window.ComponentLibrary && window.ComponentLibrary.Lightbox) {
                const imgs = Array.from(this.element.querySelectorAll('img'));
                imgs.forEach(img => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', () => {
                        const lb = new window.ComponentLibrary.Lightbox({ src: img.src }, this.deps);
                        lb.open(img.src);
                    });
                });
            }
        }
    }

    executeScripts(element) {
        const scripts = Array.from(element.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) newScript.innerHTML = oldScript.innerHTML;
            
            // Append to the element's parent, or to the head if no parent
            const parent = oldScript.parentNode || element;
            parent.replaceChild(newScript, oldScript);
        });
    }
    
    applySyntaxHighlighting(element) {
        // Apply Prism.js syntax highlighting to code blocks
        if (window.Prism) {
            const codeBlocks = element.querySelectorAll('pre code[class*="language-"]');
            console.log(`🎨 Applying syntax highlighting to ${codeBlocks.length} code blocks`);
            codeBlocks.forEach(block => {
                window.Prism.highlightElement(block);
            });
        }
    }
    
    processP5Components(element) {
        const p5Divs = element.querySelectorAll('[data-p5-component]');
        console.log(`🎨 Found ${p5Divs.length} p5.js components to process`);
        
        p5Divs.forEach(div => {
            const componentType = div.getAttribute('data-p5-component');
            const scriptPath = div.getAttribute('data-script-path');
            const targetId = div.getAttribute('data-target-id');
            const useSiteBoyGUI = div.getAttribute('data-siteboy-gui') === 'true';
            
            if (scriptPath && targetId) {
                console.log(`🎨 Processing p5.js component: ${targetId} from ${scriptPath} (SiteBoy GUI: ${useSiteBoyGUI})`);
                
                let p5Component;
                
                if (useSiteBoyGUI && window.ComponentLibrary.P5ControlledSketch) {
                    // Use library P5ControlledSketch component - ColorQuantizer style
                    const controls = this.getP5Controls(componentType);
                    p5Component = new window.ComponentLibrary.P5ControlledSketch({
                        scriptPath: scriptPath,
                        targetElementId: targetId,
                        controls: controls,
                        canvasWidth: 800,
                        canvasHeight: 600
                    });
                } else {
                    // Use original embedded sketch
                    p5Component = new window.ComponentLibrary.P5EmbeddedSketch({
                        scriptPath: scriptPath,
                        targetElementId: targetId
                    });
                }
                
                // Replace the div with the component
                if (useSiteBoyGUI && window.ComponentLibrary.P5ControlledSketch) {
                    // P5ControlledSketch renders synchronously like ColorQuantizer
                    const componentElement = p5Component.render();
                    if (div.parentNode && componentElement) {
                        div.parentNode.replaceChild(componentElement, div);
                    }
                } else {
                    // Handle sync render for regular component
                    const componentElement = p5Component.render();
                    div.parentNode.replaceChild(componentElement, div);
                }
                
                // Track component for cleanup
                this.componentInstances.push(p5Component);
            }
        });
    }
    
    getP5Controls(componentType) {
        // Define controls for different p5.js components
        const controlConfigs = {
               'phyllo-sweep': [
                {
                    key: 'animationSpeed',
                    label: 'Speed',
                    type: 'range',
                    min: 0,
                    max: 100,
                    step: 1,
                    defaultValue: 54,
                    units: 'degrees per second',
                    logScale: true,
                    logMin: 0.001,
                    logMax: 5.0
                },
                {
                    key: 'pointCount',
                    label: 'Point Count',
                    type: 'range',
                    min: 50,
                    max: 1000,
                    step: 1,
                    defaultValue: 169
                }
            ],
            'phyllo-manual': [
                {
                    key: 'pointCount',
                    label: 'Number of Points',
                    type: 'number',
                    min: 1,
                    max: 1000,
                    step: 1,
                    defaultValue: 169
                },
                {
                    key: 'deltaTheta',
                    label: 'Δθ (degrees)',
                    type: 'range',
                    min: 0,
                    max: 360,
                    step: 0.5,
                    defaultValue: 137.508
                },
                {
                    key: 'goldenAngleLock',
                    label: 'Lock to Golden Angle',
                    type: 'checkbox',
                    defaultValue: true
                },
                {
                    key: 'dotSize',
                    label: 'Dot Size',
                    type: 'range',
                    min: 1,
                    max: 10,
                    step: 1,
                    defaultValue: 2
                },
                {
                    key: 'connectNth1',
                    label: 'Connect N₁ (Red)',
                    type: 'checkbox',
                    defaultValue: true
                },
                {
                    key: 'nth1',
                    label: 'N₁ Interval',
                    type: 'number',
                    min: 1,
                    max: 100,
                    step: 1,
                    defaultValue: 8,
                    fibonacci: true,
                    fibonacciId: 'fib1'
                },
                {
                    key: 'connectNth2',
                    label: 'Connect N₂ (Blue)',
                    type: 'checkbox',
                    defaultValue: true
                },
                {
                    key: 'nth2',
                    label: 'N₂ Interval',
                    type: 'number',
                    min: 1,
                    max: 100,
                    step: 1,
                    defaultValue: 13,
                    fibonacci: true,
                    fibonacciId: 'fib2'
                },
                {
                    key: 'fibonacciLock',
                    label: 'Lock to Fibonacci',
                    type: 'checkbox',
                    defaultValue: true
                },
                {
                    key: 'paramA',
                    label: 'Parameter A',
                    type: 'range',
                    min: 0,
                    max: 5,
                    step: 0.1,
                    defaultValue: 1
                },
                {
                    key: 'paramB',
                    label: 'Parameter B',
                    type: 'range',
                    min: -1,
                    max: 1,
                    step: 0.01,
                    defaultValue: 0
                },
                {
                    key: 'paramC',
                    label: 'Parameter C',
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.1,
                    defaultValue: 0
                },
                {
                    key: 'paramK',
                    label: 'Exponent K',
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    defaultValue: 1
                },
                {
                    key: 'paramM',
                    label: 'Exponent M',
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    defaultValue: 0
                }
            ]
        };
        
        return controlConfigs[componentType] || [];
    }
    
    /**
     * Render LaTeX math with MathJax - Simple and reliable
     */
    async renderMath() {
        try {
            // Wait for MathJax to be available
            await this.waitForMathJax();
            
            // Check if there's LaTeX content in the rendered HTML
            const renderedHTML = this.element.innerHTML || '';
            const hasLaTeX = renderedHTML.includes('$') || renderedHTML.includes('\\(') || renderedHTML.includes('\\[');
            
            if (!hasLaTeX) {
                console.log('📝 No LaTeX content detected in rendered HTML');
                return;
            }

            console.log('🧮 Rendering LaTeX with MathJax...');
            
            // MathJax typeset
            await window.MathJax.typesetPromise([this.element]);
            
            console.log('✅ LaTeX rendering complete with MathJax');
            
            // Apply SiteBoy styling
            this.styleMathElements();
            
        } catch (error) {
            console.error('❌ MathJax rendering failed:', error);
        }
    }
    
    /**
     * Wait for MathJax to be fully loaded
     */
    async waitForMathJax(maxWait = 5000) {
        const startTime = Date.now();
        
        while ((!window.MathJax || !window.MathJax.typesetPromise) && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!window.MathJax || !window.MathJax.typesetPromise) {
            throw new Error('MathJax not available after waiting');
        }
    }
    
    /**
     * Apply SiteBoy styling to MathJax elements
     */
    styleMathElements() {
        const mathElements = this.element.querySelectorAll('mjx-container');
        const currentF = window.Config?.F || 12;
        
        if (mathElements.length > 0) {
            console.log(`🎨 MathJax elements found: ${mathElements.length} (F=${currentF}px) - applying CSS styling`);
            
            // Force styling on each element
            mathElements.forEach(mathEl => {
                mathEl.style.fontFamily = '"Atkinson Hyperlegible", "Atkinson Hyperlegible Mono", monospace';
                
                const isDisplayMath = mathEl.getAttribute('display') === 'true';
                if (isDisplayMath) {
                    mathEl.style.fontSize = `${Math.round(currentF * 0.9)}px`;
                    mathEl.style.margin = `${currentF}px 0`;
                    mathEl.style.textAlign = 'center';
                } else {
                    mathEl.style.fontSize = `${currentF}px`;
                    mathEl.style.margin = '0 2px';
                }
            });
        }
    }
    
    destroy() {
        // Clean up all embedded components
        this.componentInstances.forEach(component => component.destroy());
        this.componentInstances = [];
        
        // Call parent destroy
        super.destroy();
    }
}

/**
 * NumberedTOC - Simple numbered table of contents component with collapsible sections
 */
export class SimpleTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'simple-toc' }, deps);
        this.sections = options.sections || [];
        this.onItemClick = options.onItemClick || null;
    }
    
    render() {
        if (!this.element) {
            this.rebuildTOC();
        }
        return this.element;
    }
    
    rebuildTOC() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Clear existing content
        if (this.element) {
            this.element.innerHTML = '';
        } else {
            this.element = this.createElement('div', 'simple-toc component');
        }
        
        if (!this.sections || this.sections.length === 0) {
            this.element.innerHTML = '<p>No items available</p>';
            return;
        }
        
        this.sections.forEach((section, index) => {
            this.createSectionItem(section, F, index);
        });
    }
    
    createSectionItem(section, F, index) {
        const itemHeight = F * 4; // 48px - Mathematical precision
        const numberBoxSize = F * 4; // Match NumberedTOC sizing

        // Determine layout based on available width
        const containerWidth = this.element.parentElement?.getBoundingClientRect().width || window.innerWidth;
        const hasWideLayout = containerWidth > 600; // Threshold for showing descriptions inline

        const sectionItem = this.createElement('div', 'toc-section-item');
        sectionItem.style.cssText = `
            height: ${itemHeight}px;
            cursor: pointer;
            display: flex;
            align-items: stretch;
            border: 1px solid var(--c-border);
            border-top: none;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            transition: background-color 0.2s ease;
            box-sizing: border-box;
            position: relative;
            ${index === 0 ? 'border-top: 1px solid var(--c-border);' : ''}
        `;

        // Number box - add numbering like NumberedTOC
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = String(index + 1).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${numberBoxSize}px; height: ${itemHeight}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
        `;

        sectionItem.appendChild(numberBox);

        if (hasWideLayout) {
            // Wide layout: title on left, description on right
            this.createWideLayoutContent(sectionItem, section, F, itemHeight);
        } else {
            // Compact layout: title only, description on hover
            this.createCompactLayoutContent(sectionItem, section, F, itemHeight);
        }
        
        // Add hover effects
        sectionItem.addEventListener('mouseenter', () => {
            sectionItem.style.background = 'var(--c-text)';
            sectionItem.style.color = 'var(--c-bg)';
            numberBox.style.background = 'var(--c-bg)';
            numberBox.style.color = 'var(--c-text)';
        });

        sectionItem.addEventListener('mouseleave', () => {
            sectionItem.style.background = '';
            sectionItem.style.color = '';
            numberBox.style.background = 'var(--c-text)';
            numberBox.style.color = 'var(--c-bg)';
        });
        
        // Add click handler
        if (this.onItemClick) {
            sectionItem.addEventListener('click', () => this.onItemClick(section));
        }
        
        // Add to DOM
        this.element.appendChild(sectionItem);
    }
    
    createWideLayoutContent(sectionItem, section, F, itemHeight) {
        // Create content area (original design - title and description stacked vertically)
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; 
            padding: ${F}px ${F * 2}px; 
            display: flex; 
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        `;
        
        // Create title - use F-based sizing (original design)
        const titleDiv = this.createElement('div');
        titleDiv.textContent = section.title;
        titleDiv.style.cssText = `
            margin: 0 0 ${Math.floor(F / 3)}px 0; 
            text-transform: uppercase; 
            font-size: ${Math.floor(F * 1.17)}px; 
            line-height: 1.2;
            font-weight: bold;
        `;
        
        // Create description - use F-based sizing (original design)
        const descDiv = this.createElement('div');
        descDiv.textContent = section.description || section.id || 'section';
        descDiv.style.cssText = `
            margin: 0; 
            font-size: ${Math.floor(F * 0.92)}px; 
            opacity: 0.7; 
            text-transform: uppercase; 
            line-height: 1;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(descDiv);
        
        // Create arrow - use F-based sizing (original design)
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${itemHeight}px; 
            height: ${itemHeight}px; 
            display: flex;
            align-items: center; 
            justify-content: center; 
            font-size: ${Math.floor(F * 1.33)}px;
            border-left: 1px solid var(--c-border); 
            flex-shrink: 0;
            box-sizing: border-box;
        `;
        
        // Assemble item (original design)
        sectionItem.appendChild(content);
        sectionItem.appendChild(arrow);
    }
    
    createCompactLayoutContent(sectionItem, section, F, itemHeight) {
        // Create content area (same as wide layout structure)
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; 
            padding: ${F}px ${F * 2}px; 
            display: flex; 
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        `;
        
        // Create switchable text div
        const textDiv = this.createElement('div');
        textDiv.textContent = section.title;
        textDiv.style.cssText = `
            margin: 0; 
            text-transform: uppercase; 
            font-size: ${Math.floor(F * 1.17)}px; 
            line-height: 1.2;
            font-weight: bold;
        `;
        
        content.appendChild(textDiv);
        
        // Create arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${itemHeight}px; 
            height: ${itemHeight}px; 
            display: flex;
            align-items: center; 
            justify-content: center; 
            font-size: ${Math.floor(F * 1.33)}px;
            border-left: 1px solid var(--c-border); 
            flex-shrink: 0;
            box-sizing: border-box;
        `;
        
        // Switch text on hover
        sectionItem.addEventListener('mouseenter', () => {
            textDiv.textContent = section.description || section.id || 'section';
            textDiv.style.fontSize = `${Math.floor(F * 0.92)}px`;
            textDiv.style.opacity = '0.7';
            textDiv.style.fontWeight = 'normal';
        });
        
        sectionItem.addEventListener('mouseleave', () => {
            textDiv.textContent = section.title;
            textDiv.style.fontSize = `${Math.floor(F * 1.17)}px`;
            textDiv.style.opacity = '1';
            textDiv.style.fontWeight = 'bold';
        });
        
        sectionItem.appendChild(content);
        sectionItem.appendChild(arrow);
    }
}

export class NumberedTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'numbered-toc' }, deps);
        this.sections = options.sections || [];
        this.onItemClick = options.onItemClick || null;
        this.showCategories = options.showCategories !== false;
        this.collapsible = options.collapsible || false;
        this.expandedSections = new Set(); // Track which sections are expanded
        this.expandedFolders = new Set(); // Track which folders are expanded
        
        // Initialize all sections as collapsed by default
        if (this.collapsible) {
            this.sections.forEach((section, index) => {
                if (section.expanded) {
                    this.expandedSections.add(index);
                }
            });
        }
    }
    
    render() {
        if (!this.element) {
            this.rebuildTOC();
        }
        return this.element;
    }
    
    rebuildTOC() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Clear existing content
        if (this.element) {
            this.element.innerHTML = '';
        } else {
            this.element = this.createElement('div', 'numbered-toc component');
        }
        
        if (!this.sections || this.sections.length === 0) {
            this.element.innerHTML = '<p>No items available</p>';
            return;
        }
        
        const counter = { value: 0 };
        
        this.sections.forEach((section, sectionIndex) => {
            // Section header (if showing categories)
            if (this.showCategories && section.title) {
                const headerHeight = F * 2; // 24px
                const sectionHeader = this.createElement('div', 'toc-category-header');
                
                // Add expand/collapse indicator if collapsible
                const isExpanded = this.expandedSections.has(sectionIndex);
                const indicator = this.collapsible ? (isExpanded ? '▼' : '▶') : '';
                sectionHeader.textContent = `${indicator} ${section.title} /`.trim();
                
                const hasPreviousItems = counter.value > 0;
                sectionHeader.style.cssText = `
                    padding: 0 ${F * 2}px; height: ${headerHeight}px; display: flex; align-items: center;
                    background: var(--c-bg); color: var(--c-text); 
                    border: 1px solid var(--c-border);
                    ${hasPreviousItems ? 'border-top: none;' : ''}
                    font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: ${F}px; text-transform: uppercase;
                    ${this.collapsible ? 'cursor: pointer; user-select: none;' : ''}
                    box-sizing: border-box;
                `;
                
                // Add click handler for collapsible headers
                if (this.collapsible) {
                    sectionHeader.addEventListener('click', () => {
                        this.toggleSection(sectionIndex);
                    });
                    
                    // Add hover effect for collapsible headers
                    sectionHeader.addEventListener('mouseenter', () => {
                        sectionHeader.style.background = 'var(--c-text)';
                        sectionHeader.style.color = 'var(--c-bg)';
                    });
                    
                    sectionHeader.addEventListener('mouseleave', () => {
                        sectionHeader.style.background = 'var(--c-bg)';
                        sectionHeader.style.color = 'var(--c-text)';
                    });
                }
                
                this.element.appendChild(sectionHeader);
            }
            
            // Section items (show only if not collapsible or if expanded)
            const shouldShowItems = !this.collapsible || this.expandedSections.has(sectionIndex);
            if (shouldShowItems) {
                const items = section.articles || section.items || section.subsections || [section];
                items.forEach((item) => {
                    this.createTOCItem(item, counter, F, sectionIndex, 0);
                });
            }
        });
    }
    
    toggleSection(sectionIndex) {
        if (this.expandedSections.has(sectionIndex)) {
            this.expandedSections.delete(sectionIndex);
        } else {
            this.expandedSections.add(sectionIndex);
        }
        this.rebuildTOC();
        console.log(`📚 Toggled section ${sectionIndex}: ${this.expandedSections.has(sectionIndex) ? 'expanded' : 'collapsed'}`);
    }
    
    toggleFolder(folderId) {
        if (this.expandedFolders.has(folderId)) {
            this.expandedFolders.delete(folderId);
        } else {
            this.expandedFolders.add(folderId);
        }
        this.rebuildTOC();
    }
    
    createTOCItem(item, counter, F, sectionIndex, level = 0) {
        const isFolder = Array.isArray(item.children) && item.children.length > 0;
        const itemId = item.id || item.slug || `${sectionIndex}-${item.title}-${level}-${counter.value}`;
        counter.value += 1;
        const itemIndex = counter.value;
        const numberBoxSize = F * 4; // base unit
        const itemHeight = isFolder ? F * 3 : numberBoxSize; // folders compact, files single height
        const indent = Math.max(0, level) * (F * 1.5);
        
        const tocItem = this.createElement('div', 'toc-item');
        tocItem.style.cssText = `
            height: ${itemHeight}px; cursor: pointer; display: flex; align-items: stretch;
            border: 1px solid var(--c-border);
            border-top: none;
            font-family: 'Atkinson Hyperlegible Mono', monospace; transition: background-color 0.2s ease;
            box-sizing: border-box;
            ${isFolder ? 'background: var(--c-bg);' : ''}
        `;
        
        // Number box
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = isFolder ? (this.expandedFolders.has(itemId) ? '▼' : '▶') : String(itemIndex).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${numberBoxSize}px; height: ${itemHeight}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
        `;
        
        // Content
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; padding: ${isFolder ? F : F}px ${F * 2}px; display: flex; flex-direction: column;
            justify-content: center; outline-left: 1px solid var(--c-border);
            padding-left: ${F * 2 + indent}px;
        `;
        
        const titleDiv = this.createElement('div');
        titleDiv.textContent = item.title;
        titleDiv.style.cssText = `
            margin: 0 0 4px 0; text-transform: uppercase; font-size: 14px; line-height: 1.2;
        `;
        
        const descDiv = this.createElement('div');
        descDiv.textContent = item.description || item.id || 'item';
        descDiv.style.cssText = `
            margin: 0; font-size: 11px; opacity: 0.7; text-transform: uppercase; line-height: 1;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(descDiv);
        
        // Arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = isFolder ? '' : '→';
        arrow.style.cssText = `
            width: ${numberBoxSize}px; height: ${itemHeight}px; display: flex;
            align-items: center; justify-content: center; font-size: 16px;
            outline-left: 1px solid var(--c-border); flex-shrink: 0;
        `;
        
        tocItem.appendChild(numberBox);
        tocItem.appendChild(content);
        tocItem.appendChild(arrow);
        
        // Add hover effects
        tocItem.addEventListener('mouseenter', () => {
            tocItem.style.background = 'var(--c-text)';
            tocItem.style.color = 'var(--c-bg)';
            numberBox.style.background = 'var(--c-bg)';
            numberBox.style.color = 'var(--c-text)';
        });
        
        tocItem.addEventListener('mouseleave', () => {
            tocItem.style.background = '';
            tocItem.style.color = '';
            numberBox.style.background = 'var(--c-text)';
            numberBox.style.color = 'var(--c-bg)';
        });
        
        // Add click handler
        if (isFolder) {
            tocItem.addEventListener('click', () => this.toggleFolder(itemId));
        } else if (this.onItemClick) {
            tocItem.addEventListener('click', () => this.onItemClick(item));
        }
        
        this.element.appendChild(tocItem);
        
        // Render children if expanded
        if (isFolder && this.expandedFolders.has(itemId)) {
            item.children.forEach(child => {
                this.createTOCItem(child, counter, F, sectionIndex, level + 1);
            });
        }
    }
}

/**
 * TreeTOC — Arbitrary-depth horizontal tree diagram with SVG connectors.
 *
 * Column geometry:
 *   colWidth[d] = maxTextWidth[d] + n        (n = total inter-column gap)
 *   railX[d]    = labelX[d] + maxTextWidth[d] + n/2   (rail is centred in the gap)
 *   labelX[d+1] = railX[d] + n/2             (= labelX[d] + maxTextWidth[d] + n)
 *
 *   Left arm  (text column right edge → rail): always n/2 — same for every node
 *   Right arm (rail → child label start):      always n/2 — same for every node
 *   Both arms equal. n/2 = HALF_GAP = F * 2.
 *
 * Text measurement: Atkinson Hyperlegible Mono (monospace), font-size F.
 *   Char advance ≈ 0.60 × F.  _tw(str, F) = str.length × F × 0.60
 *
 * Collapsed parent shows ' +' glyph in var(--c-border); expanded nodes show no indicator.
 * Font size = F (matches header text, per user requirement).
 *
 * Props:
 *   data:        { label, children? }   — root of arbitrary tree
 *   sections:    Array<{ title, description?, articles }>  — legacy adapter
 *   rootLabel:   string (default 'TOOLS')
 *   onItemClick: (nodeData) => void
 *   collapsible: bool (default true)
 */
export class TreeTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tree-toc' }, deps);
        this.onItemClick = options.onItemClick || null;
        this.collapsible = options.collapsible !== false;
        this.root = options.data
            ? options.data
            : TreeTOC._sectionsToTree(options.sections || [], options.rootLabel || 'TOOLS');
        this._geoMap    = {};   // depth → { labelX, textX, maxW, railX }
        this._svgEl     = null;
        this._halfN     = 0;    // arm/stub line length (n), set in _buildGeo
        this._charW     = 0;    // 1 character width (gap between line endpoint and text)
        this._measureEl = null; // hidden DOM element for accurate text measurement
    }

    // ── Legacy adapter ────────────────────────────────────────────────────────
    static _sectionsToTree(sections, rootLabel) {
        return {
            label: rootLabel,
            children: sections.map(s => ({
                label: s.title || '',
                _data: { section: s },
                children: (s.articles || []).map(a => ({
                    label: a.title || '',
                    _data: a,
                })),
            })),
        };
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'tree-toc component');

            // Hidden measure element (mirrors reference #measure) — accurate rendered widths.
            // Positioned off-canvas within the component; active once element is in the DOM.
            this._measureEl = this.createElement('div', 'tree-toc-measure');
            this._measureEl.setAttribute('aria-hidden', 'true');
            this._measureEl.style.cssText = `
                position: absolute; visibility: hidden; white-space: nowrap;
                font-family: 'Atkinson Hyperlegible Mono', monospace; font-weight: 400;
                line-height: 1; left: -9999px; top: 0; pointer-events: none;
            `;
            this.element.appendChild(this._measureEl);

            this._svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._svgEl.style.cssText = `
                position: absolute; top: 0; left: 0;
                color: var(--c-border);
                pointer-events: none; overflow: visible;
            `;
            this._svgEl.setAttribute('shape-rendering', 'crispEdges');
            this.element.appendChild(this._svgEl);

            // Initial draw uses approximation (element not yet in DOM).
            // Deferred redraw fires after fonts load, using accurate DOM measurements.
            this._draw();
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => { if (this._measureEl) this._draw(); });
            }
        }
        return this.element;
    }

    // ── Text width ────────────────────────────────────────────────────────────
    // Uses DOM measurement when mounted (mirrors reference tw()); falls back to
    // monospace approximation (char advance ≈ 0.60 × F) for the initial off-DOM draw.
    _tw(str) {
        const F = this._F();
        if (this._measureEl) {
            this._measureEl.style.fontSize = `${F}px`;
            this._measureEl.textContent = str;
            const w = this._measureEl.getBoundingClientRect().width;
            if (w > 0) return w;
        }
        return str.length * F * 0.60;
    }

    // ── Pass 1: depth + collapsed init ────────────────────────────────────────
    // Non-root nodes start collapsed. Once set, never overwritten.
    _assignDepths(node, d = 0) {
        node._depth = d;
        if (node._collapsed === undefined) node._collapsed = d > 0;
        (node.children || []).forEach(c => this._assignDepths(c, d + 1));
    }

    // ── Pass 2: max text width per depth (ALL nodes, not just visible) ────────
    _collectMaxWidths(node, map = {}) {
        map[node._depth] = Math.max(map[node._depth] || 0, this._tw(node.label));
        (node.children || []).forEach(c => this._collectMaxWidths(c, map));
        return map;
    }

    // ── Pass 3: column geometry ───────────────────────────────────────────────
    // Per-column layout (depth d):
    //   [charW gap] TEXT(actualW) [charW gap] [arm line=n] rail [stub line=n] [charW gap] TEXT(d+1)
    //
    //   charW        = 1 character width = F × 0.60     (fixed gap on both sides of every line)
    //   n            = arm / stub line length = 6 × charW
    //   textX[d]     = labelX[d] + charW                (text starts 1 char inside element)
    //   railX[d]     = textX[d] + maxW[d] + charW + n   (for longest label arm = n exactly)
    //   labelX[d+1]  = railX[d] + n                     (stub of length n, then child element starts)
    //   textX[d+1]   = labelX[d+1] + charW              (1-char gap before child text)
    //
    //   Arm (parent):  textX[d] + actualW + charW → railX[d]  (variable; = n for longest word)
    //   Stub (child):  railX[d] → labelX[d+1] = railX[d] + n  (always n)
    //   Gap each side: exactly 1 charW — never more, never less
    _buildGeo(maxWidths, F) {
        const charW  = F * 0.60;          // 1-character gap
        const N      = charW * 6;         // arm / stub line length = 6 chars
        const depths = Object.keys(maxWidths).map(Number).sort((a, b) => a - b);
        let labelX = 0;
        this._geoMap = {};
        this._halfN  = N;
        this._charW  = charW;
        for (const d of depths) {
            const textX = labelX + charW;
            const railX = textX + maxWidths[d] + charW + N;
            this._geoMap[d] = { labelX, textX, maxW: maxWidths[d], railX };
            labelX = railX + N;   // next column starts N (stub) past the rail
        }
    }

    // ── Pass 4: row assignment ────────────────────────────────────────────────
    // Parent row = first child row. Subsequent children stack below.
    _assignRows(node, cursor = 0) {
        node._row = cursor;
        const expanded = !node._collapsed && node.children && node.children.length;
        if (!expanded) {
            node._lastChildRow = cursor;
            return cursor + 1;
        }
        let cur = cursor;
        node.children.forEach(c => { cur = this._assignRows(c, cur); });
        node._lastChildRow = node.children[node.children.length - 1]._row;
        return cur;
    }

    _yc(ROW_H, row) { return row * ROW_H + ROW_H / 2; }

    // ── SVG line helper ───────────────────────────────────────────────────────
    _svgLine(x1, y1, x2, y2) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', Math.round(x1));
        el.setAttribute('y1', Math.round(y1));
        el.setAttribute('x2', Math.round(x2));
        el.setAttribute('y2', Math.round(y2));
        el.setAttribute('stroke', 'currentColor');
        el.setAttribute('stroke-width', '1');
        this._svgEl.appendChild(el);
    }

    // ── Render: connectors ────────────────────────────────────────────────────
    // Arm:  textX + actualW + charW → railX       variable; 1-char gap after text
    // Rail: railX, parent row → last child row
    // Stub: railX → childLabelX                   fixed length N; child DOM element starts charW past here
    // Cross: vertical SVG line at childLabelX for any collapsed child that has grandchildren
    _drawConnectors(node, ROW_H) {
        const expanded = !node._collapsed && node.children && node.children.length;
        if (!expanded) return;

        const { textX, railX } = this._geoMap[node._depth];
        const childLabelX      = this._geoMap[node._depth + 1].labelX;
        const actualW          = this._tw(node.label);
        const py               = this._yc(ROW_H, node._row);

        this._svgLine(textX + actualW + this._charW, py, railX, py);
        this._svgLine(railX, py, railX, this._yc(ROW_H, node._lastChildRow));

        node.children.forEach(child => {
            const cy = this._yc(ROW_H, child._row);
            this._svgLine(railX, cy, childLabelX, cy);

            // Collapsed indicator: --- label -+
            // Drawn to the RIGHT of the child text. Two lines, same weight/colour as all others:
            //   Horizontal: charW gap after text, then charW segment + charW cross bar (2 chars total, one line)
            //   Vertical:   charW tall, centred in the cross character (the second charW block)
            if (child._collapsed && child.children && child.children.length) {
                const cw        = this._charW;
                const cTextX    = this._geoMap[child._depth].textX;
                const cActualW  = this._tw(child.label);
                const xArm      = cTextX + cActualW + cw;           // arm start (1-char gap after text)
                const xCross    = xArm + cw / 2;                     // cross left edge (half-char arm)
                const xCrossC   = xCross + cw / 2;                  // cross centre x
                this._svgLine(xArm,   cy,        xCross + cw, cy);  // horizontal: segment + cross bar
                this._svgLine(xCrossC, cy - cw / 2, xCrossC, cy + cw / 2); // vertical: 1 char tall
            }

            this._drawConnectors(child, ROW_H);
        });
    }

    // ── Render: labels ────────────────────────────────────────────────────────
    // DOM element starts at labelX + charW — the charW gap is occupied by the SVG cross
    // (for collapsed parents) or is simply dead space (leaf nodes, expanded parents).
    // No padding-left needed: the charW shift IS the gap between the cross and the text.
    _placeLabel(node, F, ROW_H) {
        const { labelX } = this._geoMap[node._depth];
        const hasKids    = node.children && node.children.length;
        const canInteract = (hasKids && this.collapsible) || (!hasKids && this.onItemClick);

        const el = this.createElement('div', 'tree-toc-node');
        el.style.cssText = `
            position: absolute;
            left: ${labelX + this._charW}px;
            top: ${node._row * ROW_H}px;
            height: ${ROW_H}px;
            display: flex;
            align-items: center;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            text-transform: uppercase;
            color: var(--c-text);
            background: var(--c-bg);
            white-space: nowrap;
            user-select: none;
            box-sizing: border-box;
            cursor: ${canInteract ? 'pointer' : 'default'};
        `;

        const labelSpan = this.createElement('span');
        labelSpan.textContent = node.label;
        el.appendChild(labelSpan);

        if (canInteract) {
            el.addEventListener('mouseenter', () => {
                el.style.color      = 'var(--c-bg)';
                el.style.background = 'var(--c-text)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.color      = 'var(--c-text)';
                el.style.background = 'var(--c-bg)';
            });
        }

        if (hasKids && this.collapsible) {
            el.addEventListener('click', () => { node._collapsed = !node._collapsed; this._draw(); });
        } else if (!hasKids && this.onItemClick) {
            el.addEventListener('click', () => this.onItemClick(node._data || node));
        }

        this.element.appendChild(el);
        if (!node._collapsed) {
            (node.children || []).forEach(c => this._placeLabel(c, F, ROW_H));
        }
    }

    _F() { return this.deps?.MF?.F || window.Config?.F || 14; }

    // ── Main draw ─────────────────────────────────────────────────────────────
    _draw() {
        const F     = this._F();
        const ROW_H = F * 2;

        this.element.querySelectorAll('.tree-toc-node').forEach(e => e.remove());
        while (this._svgEl.firstChild) this._svgEl.removeChild(this._svgEl.firstChild);

        this._assignDepths(this.root);
        const maxWidths = this._collectMaxWidths(this.root);
        this._buildGeo(maxWidths, F);
        const totalRows = this._assignRows(this.root);

        // Deepest visible depth determines canvas width
        let maxVisibleDepth = 0;
        const walkDepth = n => {
            if (n._depth > maxVisibleDepth) maxVisibleDepth = n._depth;
            if (!n._collapsed) (n.children || []).forEach(walkDepth);
        };
        walkDepth(this.root);

        const lastGeo = this._geoMap[maxVisibleDepth];
        const totalW  = lastGeo.labelX + lastGeo.maxW + 2 * this._charW;
        const totalH  = totalRows * ROW_H + 4;

        this.element.style.cssText = `
            position: relative;
            width: ${totalW}px;
            height: ${totalH}px;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            background: var(--c-bg);
            box-sizing: border-box;
            overflow: visible;
        `;

        this._svgEl.setAttribute('width',  totalW);
        this._svgEl.setAttribute('height', totalH);

        this._placeLabel(this.root, F, ROW_H);
        this._drawConnectors(this.root, ROW_H);
    }

    // ── Expand / collapse all ─────────────────────────────────────────────────
    _setAll(node, state, isRoot = false) {
        if (!isRoot && node.children && node.children.length) node._collapsed = state;
        (node.children || []).forEach(c => this._setAll(c, state));
    }

    expandAll()   { this._setAll(this.root, false, true); this._draw(); }
    collapseAll() { this._setAll(this.root, true,  true); this._draw(); }

    destroy() {
        this._measureEl = null;
        super.destroy();
    }
}

/**
 * Table - Data table component with proper structure
 */
export class Table extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'table' }, deps);
        this.headers = options.headers || [];
        this.rows = options.rows || [];
        this.caption = options.caption || '';
        this.className = options.className || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('table', `table component ${this.className}`);
            this.element.style.cssText = `
                width: 100%;
                border-collapse: collapse;
                font-family: 'Space Mono', monospace;
                font-size: calc(var(--f) * 0.8);
                border: 1px solid var(--c-border);
            `;
            
            // Caption
            if (this.caption) {
                const caption = this.createElement('caption', 'table-caption');
                caption.textContent = this.caption;
                caption.style.cssText = `
                    font-weight: bold;
                    margin-bottom: calc(var(--f) * 0.5);
                    text-align: left;
                `;
                this.element.appendChild(caption);
            }
            
            // Headers
            if (this.headers.length > 0) {
                const thead = this.createElement('thead', 'table-head');
                const headerRow = this.createElement('tr', 'table-header-row');
                headerRow.style.cssText = `background: var(--c-border); font-weight: bold;`;
                
                this.headers.forEach(header => {
                    const th = this.createElement('th', 'table-header');
                    th.textContent = header;
                    th.style.cssText = `
                        padding: calc(var(--f) * 0.5);
                        border: 1px solid var(--c-border);
                        text-align: center;
                    `;
                    headerRow.appendChild(th);
                });
                
                thead.appendChild(headerRow);
                this.element.appendChild(thead);
            }
            
            // Body
            const tbody = this.createElement('tbody', 'table-body');
            this.rows.forEach(row => {
                const tr = this.createElement('tr', 'table-row');
                row.forEach((cell, index) => {
                    const td = this.createElement('td', 'table-cell');
                    
                    if (typeof cell === 'object' && cell.element) {
                        // Cell contains a component
                        td.appendChild(cell.element || cell);
                    } else {
                        // Cell contains text
                        td.textContent = cell;
                    }
                    
                    td.style.cssText = `
                        padding: calc(var(--f) * 0.25);
                        border: 1px solid var(--c-border);
                        ${index === 0 ? 'font-weight: bold; background: var(--c-bg-alt);' : ''}
                    `;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            this.element.appendChild(tbody);
        }
        return this.element;
    }
}

/**
 * StatusDisplay - Status message component
 */
export class StatusDisplay extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'status-display' }, deps);
        this.message = options.message || 'Ready';
        this.type = options.type || 'info'; // info, success, warning, error
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'status-display component');
            this.element.style.cssText = `
                padding: calc(var(--f) * 0.75) var(--f);
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                font-family: 'Space Mono', monospace;
                font-size: calc(var(--f) * 0.8);
                color: var(--c-text);
                margin: calc(var(--f) * 0.5) 0;
            `;
            
            this.textElement = this.createElement('span', 'status-text');
            this.textElement.textContent = this.message;
            this.element.appendChild(this.textElement);
        }
        return this.element;
    }
    
    setMessage(message, type = 'info') {
        this.message = message;
        this.type = type;
        if (this.textElement) {
            this.textElement.textContent = message;
        }
    }
}

/**
 * TOCGallery - Table of Contents gallery preview component
 */
export class TOCGallery extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toc-gallery' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.showMore = options.showMore !== false;
        this.showMoreText = options.showMoreText || 'Show More →';
        this.onItemClick = options.onItemClick || null;
        this.onShowMoreClick = options.onShowMoreClick || null;
    }
    
    render() {
        if (!this.element) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            
            this.element = this.createElement('div', 'toc-gallery component');
            
            // Gallery section is exactly 24F tall with no margins/padding
            const galleryHeight = F * 24; // 288px
            const thumbnailSize = F * 24; // 288px (24F × 24F squares)
            
            this.element.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                height: ${galleryHeight}px;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                overflow-x: hidden;
                overflow-y: hidden;
            `;
            
            // Create thumbnail grid container - no gaps, shared borders
            const galleryContainer = this.createElement('div', 'toc-gallery-grid');
            galleryContainer.style.cssText = `
                display: flex;
                flex-direction: row;
                flex-shrink: 0;
                gap: 0;
                height: ${galleryHeight}px;
                border-bottom: 1px solid var(--c-border);
                border-top: none;
                border-left: none;
                border-right: none;
                box-sizing: border-box;
                align-items: stretch;
                min-width: ${thumbnailSize * this.cols}px;
            `;
            
            // Create thumbnail items
            this.items.slice(0, this.cols).forEach((item, index) => {
                const thumbnail = this.createThumbnail(item, index, thumbnailSize);
                galleryContainer.appendChild(thumbnail);
            });
            
            this.element.appendChild(galleryContainer);
            
            // Create "Show More" link if enabled
            if (this.showMore) {
                const showMoreLink = this.createElement('div', 'toc-gallery-show-more');
                showMoreLink.textContent = '→';
                showMoreLink.style.cssText = `
                    cursor: pointer;
                    color: var(--c-text);
                    font-size: ${F * 2}px;
                    width: ${galleryHeight}px;
                    height: ${galleryHeight}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--c-border);
                    transition: all 0.2s ease;
                    margin-left: 0;
                    background: var(--c-bg);
                    flex-shrink: 0;
                `;
                
                // Add hover effects
                showMoreLink.addEventListener('mouseenter', () => {
                    showMoreLink.style.background = 'var(--c-text)';
                    showMoreLink.style.color = 'var(--c-bg)';
                    showMoreLink.style.borderColor = 'var(--c-text)';
                });
                
                showMoreLink.addEventListener('mouseleave', () => {
                    showMoreLink.style.background = '';
                    showMoreLink.style.color = 'var(--c-text)';
                    showMoreLink.style.borderColor = 'transparent';
                });
                
                // Add click handler
                if (this.onShowMoreClick) {
                    showMoreLink.addEventListener('click', () => {
                        this.onShowMoreClick();
                    });
                }
                
                this.element.appendChild(showMoreLink);
            }
        }
        return this.element;
    }
    
    createThumbnail(item, index, size) {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        const thumbnail = this.createElement('div', 'toc-gallery-thumbnail');
        // Create shared borders - NO left border on first item to avoid double line
        const borderLeft = 'none';
        const borderRight = '1px solid var(--c-border)';
        
        thumbnail.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-left: ${borderLeft};
            border-right: ${borderRight};
            border-top: none;
            border-bottom: none;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            overflow: hidden;
            background: var(--c-bg);
            flex-shrink: 0;
        `;
        
        // Create thumbnail content
        if (item.image) {
            // If item has an image, create img element
            const img = this.createElement('img');
            img.src = item.image;
            img.alt = item.title || `Artwork ${index + 1}`;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            `;
            thumbnail.appendChild(img);
        } else {
            // Fallback: sophisticated artwork placeholder for 24F × 24F squares
            const placeholderContent = this.createElement('div');
            placeholderContent.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: ${F * 2}px;
                box-sizing: border-box;
            `;
            
            // Add artwork icon/symbol - much larger for 24F squares
            const artIcon = this.createElement('div');
            artIcon.textContent = '🎨'; // Art palette emoji as placeholder
            artIcon.style.cssText = `
                font-size: ${F * 8}px;
                margin-bottom: ${F * 2}px;
                opacity: 0.6;
                line-height: 1;
            `;
            
            // Add title text if available
            if (item.title) {
                const titleElement = this.createElement('div');
                titleElement.textContent = item.title; // Full title for larger square
                titleElement.style.cssText = `
                    color: inherit;
                    font-size: ${F * 1.5}px;
                    font-weight: bold;
                    text-transform: uppercase;
                    line-height: 1.3;
                    opacity: 0.8;
                    word-break: break-word;
                    text-align: center;
                    max-width: 100%;
                `;
                placeholderContent.appendChild(artIcon);
                placeholderContent.appendChild(titleElement);
            } else {
                placeholderContent.appendChild(artIcon);
            }
            
            thumbnail.appendChild(placeholderContent);
        }
        
        // Add hover effects (consistent with site-wide pattern)
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.background = 'var(--c-text)';
            thumbnail.style.color = 'var(--c-bg)';
            // Trigger horizontal scroll if this thumbnail is cut off
            this.handleHoverScroll(thumbnail);
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.background = 'var(--c-bg)';
            thumbnail.style.color = 'var(--c-text)';
        });
        
        // Add click handler
        if (this.onItemClick) {
            thumbnail.addEventListener('click', () => {
                this.onItemClick(item, index);
            });
        }
        
        return thumbnail;
    }
    
    handleHoverScroll(thumbnail) {
        // Check if thumbnail is partially cut off and scroll to reveal it
        const container = this.element;
        const thumbnailRect = thumbnail.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if thumbnail is cut off on the right
        if (thumbnailRect.right > containerRect.right) {
            const scrollAmount = thumbnailRect.right - containerRect.right + 12; // Add 12px padding
            container.scrollTo({
                left: container.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
        
        // Check if thumbnail is cut off on the left
        if (thumbnailRect.left < containerRect.left) {
            const scrollAmount = containerRect.left - thumbnailRect.left + 12; // Add 12px padding
            container.scrollTo({
                left: container.scrollLeft - scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
}

// Components are exported individually at their class declarations

// Characters used for background noise cells
const BG_CHAR_POOL = '@#%&*/\\+=~?!^$';
// Wingdings system font — maps Latin chars to pictographic symbols at any text size.
// Available on all Windows systems (the primary platform for this site).
// Fallback chain ensures graceful degradation on other platforms.
const NERD_FONT_FAMILY = "'Wingdings', 'Wingdings 2', 'Wingdings 3', 'Webdings', serif";

// Characters that produce visually interesting/dense Wingdings glyphs.
// Uppercase A-Z and lowercase a-z each map to distinct pictograms in Wingdings.
const LETTER_SYMBOL_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
                            '!@#$%^&*()-_+=[]{}|;:,.<>?';

function randomNavChar() {
    return BG_CHAR_POOL[Math.floor(Math.random() * BG_CHAR_POOL.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Shared character-width-ratio measurement — one DOM probe per page load.
let _sharedCharWidthRatio = null;
function getCharWidthRatio() {
    if (_sharedCharWidthRatio !== null) return _sharedCharWidthRatio;
    const refSize = 40;
    const probe = document.createElement('span');
    probe.style.cssText = [
        "font-family:'Atkinson Hyperlegible Mono',monospace",
        `font-size:${refSize}px`,
        'position:fixed', 'top:-9999px', 'left:-9999px',
        'visibility:hidden', 'white-space:pre', 'pointer-events:none',
    ].join(';');
    probe.textContent = 'X';
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    _sharedCharWidthRatio = w > 0 ? w / refSize : 0.6;
    return _sharedCharWidthRatio;
}

// Layered sine-wave noise field — smooth and continuous over (x, y, t) ≈ [-1, 1]
function noiseField(x, y, t) {
    return (
        Math.sin(x * 0.6 + t)            * Math.cos(y * 0.5 + t * 0.8) +
        Math.sin((x * 0.4 - y * 0.3)     + t * 1.5) * 0.5              +
        Math.cos((x * 0.2 + y * 0.4)     - t * 0.6) * 0.3
    ) / 1.8;
}

/**
 * AsciiNavWord — ASCII-art word block used on the homepage.
 *
 * Idle state: a continuous sine-based noise field mutates every span's
 * character (~12 fps). Filled cells always show a char from the pool;
 * background cells show a char only when the noise exceeds a threshold,
 * creating sparse "static" around the glyphs.
 *
 * Hover: noise pauses on filled cells; they progressively reveal their
 * true letter. Mouse-leave resumes noise on all cells.
 *
 * Options: { word, sectionId, onNavigate, numWords, sharedTotalCols }
 */
export class AsciiNavWord extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'ascii-nav-word' }, deps);
        this.word         = (options.word || '').toUpperCase();
        this.sectionId    = options.sectionId || '';
        this.onNavigate   = options.onNavigate || null;
        this.filledSpans  = [];
        this.allSpanData  = []; // [{ span, row, col, filled }]
        this.idleAnimator = null;
        this.hoverAnimator = null;
        this.isHovering   = false;
        this.gridEl       = null;
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'ascii-nav-word');
            this._buildGrid();
            this._applySize();
            this._bindEvents();
            this.subscribeToResize();
            this._startIdleAnimation();
        }
        return this.element;
    }

    onResize() {
        this._applySize();
    }

    // ─── Grid construction ───────────────────────────────────────────────────

    _buildGrid() {
        const letters = this.word.split('');
        this.filledSpans = [];
        this.allSpanData = [];

        this.gridEl = this.createElement('div', 'ascii-nav-grid');
        this.gridEl.style.cssText = 'display: inline-block;';

        for (let row = 0; row < FONT_ROWS; row++) {
            const rowEl = this.createElement('div', 'ascii-nav-row');
            rowEl.style.cssText = 'white-space: pre; display: block; line-height: 1;';
            let col = 0;

            letters.forEach((letter, letterIdx) => {
                const bitmap = ASCII_NAV_FONT[letter];
                if (!bitmap) return;

                if (letterIdx > 0) {
                    for (let g = 0; g < FONT_GAP; g++) {
                        const span = this.createElement('span');
                        span.textContent = '\u00A0';
                        this.allSpanData.push({ span, row, col, filled: false });
                        col++;
                        rowEl.appendChild(span);
                    }
                }

                for (let c = 0; c < FONT_COLS; c++) {
                    const filled = bitmap[row] && bitmap[row][c] === 1;
                    const span = this.createElement('span');
                    span.dataset.letter = letter;
                    if (filled) {
                        span.textContent = randomNavChar();
                        span.dataset.filled = '1';
                        this.filledSpans.push(span);
                    } else {
                        span.textContent = '\u00A0';
                        span.dataset.filled = '0';
                    }
                    this.allSpanData.push({ span, row, col, filled });
                    col++;
                    rowEl.appendChild(span);
                }
            });

            this.gridEl.appendChild(rowEl);
        }

        this.element.appendChild(this.gridEl);
    }

    // ─── Sizing ──────────────────────────────────────────────────────────────

    _totalCols() {
        const n = this.word.length;
        return n * FONT_COLS + Math.max(0, n - 1) * FONT_GAP;
    }

    _charWidthRatio() {
        return getCharWidthRatio();
    }

    _applySize() {
        const { F } = this.getF();
        const MF           = this.deps.MF || window.MathematicalFoundation;
        const margin       = MF?.Config?.margin || F * 4;
        const headerHeight = MF?.Config?.sizing?.header || F * 2;

        const parentWidth    = this.element.parentElement?.getBoundingClientRect().width || 0;
        const containerWidth = parentWidth > 0 ? parentWidth : window.innerWidth - margin * 2;
        const totalCols      = this.options.sharedTotalCols || this._totalCols();
        const ratio          = this._charWidthRatio();
        const fontFromWidth  = containerWidth > 0 ? containerWidth / (totalCols * ratio) : Infinity;

        const lineHeightFactor = 1.2;
        const numWords         = this.options.numWords || 3;
        const footerHeight     = MF?.Config?.sizing?.footer || headerHeight;
        const contentHeight    = window.innerHeight - headerHeight - footerHeight - margin;
        const gapTotal         = F * 2 * (numWords - 1);
        const slotHeight       = contentHeight / numWords - gapTotal / numWords;
        const fontFromHeight   = Math.max(0, slotHeight) / (FONT_ROWS * lineHeightFactor);

        const rawFontSize = Math.min(fontFromWidth, fontFromHeight);
        const fontSize    = Math.floor(Math.max(F, Math.min(F * 2, rawFontSize)));

        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${fontSize}px;
            line-height: ${lineHeightFactor};
            cursor: pointer;
            color: var(--c-text);
            background: var(--c-bg);
            display: flex;
            justify-content: center;
            overflow: hidden;
            width: 100%;
            box-sizing: border-box;
            user-select: none;
        `;
    }

    // ─── Noise ───────────────────────────────────────────────────────────────

    _startIdleAnimation() {
        this._stopIdleAnimation();
        const AF = window.AnimationFoundation;
        if (!AF) return;

        const symLen      = LETTER_SYMBOL_POOL.length;
        const bgLen       = BG_CHAR_POOL.length;
        const bgThreshold = 0.45;
        let t = 0;

        this.idleAnimator = new AF.AnimationLoop({
            fps: 12,
            onFrame: () => {
                t += 0.05;
                this.allSpanData.forEach(({ span, row, col, filled }) => {
                    if (filled && this.isHovering) return;
                    const n = noiseField(col, row, t);
                    if (filled) {
                        const idx = Math.floor(((n + 1) * 0.5) * symLen) % symLen;
                        span.textContent = LETTER_SYMBOL_POOL[Math.max(0, idx)];
                    } else {
                        if (n > bgThreshold) {
                            const norm = (n - bgThreshold) / (1 - bgThreshold);
                            const idx  = Math.floor(norm * bgLen) % bgLen;
                            span.textContent = BG_CHAR_POOL[Math.max(0, idx)];
                        } else {
                            span.textContent = ' ';
                        }
                    }
                });
            }
        });
        this.idleAnimator.start();
    }

    _stopIdleAnimation() {
        if (this.idleAnimator) {
            this.idleAnimator.destroy();
            this.idleAnimator = null;
        }
    }

    // ─── Hover ───────────────────────────────────────────────────────────────

    _bindEvents() {
        this.element.addEventListener('mouseenter', () => this._onHoverIn());
        this.element.addEventListener('mouseleave', () => this._onHoverOut());
        this.element.addEventListener('click', () => {
            if (this.onNavigate) this.onNavigate(this.sectionId);
        });
    }

    _onHoverIn() {
        this.isHovering = true;
        this._stopHoverAnimator();

        const spans = [...this.filledSpans];
        shuffleArray(spans);
        let idx = 0;
        const batch = Math.max(1, Math.ceil(spans.length / 10));

        const AF = window.AnimationFoundation;
        if (!AF) return;

        this.hoverAnimator = new AF.AnimationLoop({
            fps: 30,
            onFrame: () => {
                if (idx >= spans.length) { this.hoverAnimator.stop(); return; }
                for (let i = 0; i < batch && idx < spans.length; i++, idx++) {
                    spans[idx].textContent = spans[idx].dataset.letter;
                }
            }
        });
        this.hoverAnimator.start();
    }

    _onHoverOut() {
        this.isHovering = false;
        this._stopHoverAnimator();
        // Idle animation is still running — it resumes updating filled cells now
        // that isHovering is false, dissolving letters back into noise naturally.
    }

    _stopHoverAnimator() {
        if (this.hoverAnimator) {
            this.hoverAnimator.destroy();
            this.hoverAnimator = null;
        }
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    destroy() {
        this._stopIdleAnimation();
        this._stopHoverAnimator();
        this.filledSpans = [];
        this.allSpanData = [];
        this.gridEl = null;
        super.destroy();
    }
}

/**
 * AsciiNavScene — full-content-area ASCII noise canvas for the homepage.
 *
 * A single monospace character grid covers the entire content area.
 * The three word bitmaps are stamped into the grid at their visual positions.
 * Letter cells idle as Wingdings-style block symbols driven by noise;
 * background cells show sparse ASCII chars. Hovering a word progressively
 * reveals its true letters. Mouse-leave lets the noise dissolve them back.
 *
 * Options: { navWords: [{ word, sectionId }], onNavigate }
 */
export class AsciiNavScene extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'ascii-nav-scene' }, deps);
        this.navWords       = options.navWords || [];
        this.onNavigate     = options.onNavigate || null;
        this.allSpanData    = []; // { span, row, col, filled, wordIdx, letter }
        this.wordRegions    = []; // { wordIdx, sectionId, rowStart, rowEnd, filledSpans }
        this.idleAnimator   = null;
        this.hoverAnimator  = null;
        this.hoveredWordIdx = -1;
        this.gridEl         = null;
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'ascii-nav-scene');
            this._buildScene();
            this._bindEvents();
            this.subscribeToResize();
            this._startIdleAnimation();
        }
        return this.element;
    }

    onResize() {
        this._stopIdleAnimation();
        this._stopHoverAnimator();
        this.hoveredWordIdx = -1;
        this.allSpanData    = [];
        this.wordRegions    = [];
        if (this.gridEl) {
            this.element.removeChild(this.gridEl);
            this.gridEl = null;
        }
        this._buildScene();
        this._startIdleAnimation();
    }

    // ─── Layout ──────────────────────────────────────────────────────────────

    _computeLayout() {
        const { F }        = this.getF();
        const MF           = this.deps.MF || window.MathematicalFoundation;
        const margin       = MF?.Config?.margin ?? F;
        const headerHeight = MF?.Config?.sizing?.header || F * 2;
        const footerHeight = MF?.Config?.sizing?.footer || headerHeight;
        const ratio        = getCharWidthRatio();

        // Use F-snapped frame dimensions so that integer-divisor cell sizes
        // produce exact gridCols/gridRows with no remainder.
        const layout      = MF?.computeLayout?.() || {};
        const frameWidth  = layout.frameWidth  || window.innerWidth;
        const frameHeight = layout.frameHeight || window.innerHeight;
        // frameWidth and frameHeight - (header+footer) are both guaranteed F-multiples.
        const W = frameWidth;
        const H = frameHeight - headerHeight - footerHeight;

        const numWords = this.navWords.length;
        const GAP_ROWS = 4;
        const totalUnits = numWords * FONT_ROWS + (numWords - 1) * GAP_ROWS;

        const sharedTotalCols = Math.max(...this.navWords.map(({ word }) => {
            const n = word.length;
            return n * FONT_COLS + Math.max(0, n - 1) * FONT_GAP;
        }));

        // ── Cell size ───────────────────────────────────────────────────────
        // Words are stacked VERTICALLY, so height is the primary constraint.
        // Width is secondary: allow the group to fill up to 100% of container
        // width (any minor excess is centred and clipped by overflow:hidden).
        //
        //   height (primary): totalUnits * cell = 0.7 * H
        //   width  (secondary): sharedTotalCols * cell = W  (100%, not 70%)
        const cellFromH = (0.7 * H) / totalUnits;
        const cellFromW = W / sharedTotalCols;
        // Take the binding (smaller) constraint, round to nearest integer,
        // clamped to [4, 2F]. Integer steps avoid wild jumps while still
        // adapting smoothly across screen sizes.
        const cell = Math.max(4, Math.min(F * 2, Math.round(Math.min(cellFromH, cellFromW))));

        const charWidth  = cell;
        const charHeight = cell; // square grid

        // ── Grid dimensions ─────────────────────────────────────────────────
        // Ceil so the grid reaches every pixel of the container. The gridEl has
        // overflow:hidden and an explicit pixel width, so the ≤ cell-1 px excess
        // is clipped — no gap at right or bottom.
        const gridCols = Math.max(1, Math.ceil(W / cell));
        const gridRows = Math.max(1, Math.ceil(H / cell));

        // Centre word-group vertically by distributing remaining rows equally.
        const vertPadRows   = Math.floor((gridRows - totalUnits) / 2);
        const innerGridRows = Math.max(1, gridRows - 2 * vertPadRows);

        // fontSize: cells are square (cell × cell). At font-size = cell the
        // Atkinson char height ≈ cell (fits) and width = cell × ratio < cell
        // (narrower than cell, centred). Using cell/ratio would fill the width
        // but the char height > cell → vertical clipping on hover.
        const fontSize = Math.floor(cell);

        return { F, fontSize, charWidth, charHeight, gridCols, gridRows,
                 vertPadRows, innerGridRows,
                 contentHeight: H, containerWidth: W,
                 numWords, GAP_ROWS };
    }

    // ─── Grid construction ───────────────────────────────────────────────────

    _buildScene() {
        const { fontSize, charWidth, charHeight, gridCols, gridRows,
                vertPadRows, innerGridRows, contentHeight,
                numWords, GAP_ROWS } = this._computeLayout();

        // Cache for position-based hover detection in _onMouseMove.
        this._charWidth  = charWidth;
        this._charHeight = charHeight;

        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${fontSize}px;
            line-height: 1;
            color: var(--c-text);
            background: var(--c-bg);
            width: 100%;
            height: ${contentHeight}px;
            overflow: hidden;
            box-sizing: border-box;
            display: block;
            user-select: none;
        `;

        // ── Build a 2-D letter map ────────────────────────────────────────
        const letterMap = Array.from({ length: gridRows }, () => new Array(gridCols).fill(null));

        const gapRowsFloat   = GAP_ROWS;
        const totalRowsFloat = numWords * FONT_ROWS + (numWords - 1) * gapRowsFloat;
        const startRowFloat  = vertPadRows + (innerGridRows - totalRowsFloat) / 2;

        this.wordRegions = [];

        this.navWords.forEach(({ word, sectionId }, wordIdx) => {
            const letters  = word.toUpperCase().split('');
            const wordCols = letters.length * FONT_COLS + Math.max(0, letters.length - 1) * FONT_GAP;
            const colStart = Math.max(0, Math.floor((gridCols - wordCols) / 2));
            const rowStart = Math.max(0, Math.round(startRowFloat + wordIdx * (FONT_ROWS + gapRowsFloat)));

            letters.forEach((letter, li) => {
                const bitmap = ASCII_NAV_FONT[letter];
                if (!bitmap) return;
                const lcol = colStart + li * (FONT_COLS + FONT_GAP);
                for (let r = 0; r < FONT_ROWS; r++) {
                    for (let c = 0; c < FONT_COLS; c++) {
                        if (bitmap[r]?.[c] === 1) {
                            const gr = rowStart + r;
                            const gc = lcol + c;
                            if (gr >= 0 && gr < gridRows && gc >= 0 && gc < gridCols) {
                                letterMap[gr][gc] = { wordIdx, letter };
                            }
                        }
                    }
                }
            });

            // colEnd covers the full bounding box of the word for area-based hover.
            this.wordRegions.push({
                wordIdx, sectionId,
                rowStart, rowEnd: rowStart + FONT_ROWS,
                colStart, colEnd: colStart + wordCols,
                filledSpans: [],
            });
        });

        // ── Build span grid (every cell is a fixed-size inline-block) ────
        // Using identical box dimensions for ALL spans guarantees the grid
        // stays monospace-locked regardless of which font is applied.
        this.allSpanData = [];
        this.gridEl = this.createElement('div', 'ascii-nav-grid');
        // Explicit width locks the grid to exactly gridCols * cell pixels.
        // Without this, display:block auto-expands to fit white-space:nowrap rows.
        this.gridEl.style.cssText = `display:block;width:${gridCols * charWidth}px;` +
                                    `line-height:0;font-size:0;overflow:hidden;`;

        const cellW      = `${charWidth}px`;
        const cellH      = `${charHeight}px`;
        // cell = charWidth = charHeight (square).
        // 85% of cell keeps Wingdings glyphs comfortably inside their cell —
        // full-size (100%) causes sidebearing bleed into neighbouring cells.
        const cellFs     = `${Math.floor(charWidth * 0.85)}px`;
        // Atkinson Hyperlegible Mono: char width = fontSize * ratio = cell
        // → fontSize = cell / ratio (computed in _computeLayout).
        const revealedFs = `${fontSize}px`;
        this._revealedFs = revealedFs;      // used by hoverAnimator (Atkinson reveal)
        this._cellFs     = cellFs;          // used by idleAnimator (Wingdings restore)

        // Shared cell geometry — only font-family and cursor differ per cell type.
        const baseCell = `display:inline-block;width:${cellW};height:${cellH};` +
                         `line-height:${cellH};font-size:${cellFs};` +
                         `font-family:${NERD_FONT_FAMILY};` +
                         `text-align:center;vertical-align:top;overflow:hidden;`;

        for (let row = 0; row < gridRows; row++) {
            const rowEl = this.createElement('div');
            rowEl.style.cssText = `display:block;white-space:nowrap;` +
                                  `height:${cellH};line-height:0;font-size:0;`;

            for (let col = 0; col < gridCols; col++) {
                const info = letterMap[row][col];
                const span = this.createElement('span');

                if (info) {
                    const n   = noiseField(col, row, 0);
                    const idx = Math.floor(((n + 1) * 0.5) * LETTER_SYMBOL_POOL.length) % LETTER_SYMBOL_POOL.length;
                    span.textContent    = LETTER_SYMBOL_POOL[Math.max(0, idx)];
                    span.dataset.filled = '1';
                    span.dataset.letter = info.letter;
                    span.style.cssText  = baseCell + `cursor:pointer;`;
                    this.wordRegions[info.wordIdx].filledSpans.push(span);
                    this.allSpanData.push({ span, row, col, filled: true, wordIdx: info.wordIdx, letter: info.letter });
                } else {
                    span.textContent    = ' ';
                    span.dataset.filled = '0';
                    span.style.cssText  = baseCell;
                    this.allSpanData.push({ span, row, col, filled: false, wordIdx: -1, letter: '' });
                }

                rowEl.appendChild(span);
            }

            this.gridEl.appendChild(rowEl);
        }

        this.element.appendChild(this.gridEl);
    }

    // ─── Noise animation ─────────────────────────────────────────────────────

    _startIdleAnimation() {
        this._stopIdleAnimation();
        const AF = window.AnimationFoundation;
        if (!AF) return;

        const symLen      = LETTER_SYMBOL_POOL.length;
        const bgLen       = BG_CHAR_POOL.length;
        const bgThreshold = 0.55; // ~22% of bg cells lit at any moment
        let t = 0;

        this.idleAnimator = new AF.AnimationLoop({
            fps: 12,
            onFrame: () => {
                t += 0.05;
                this.allSpanData.forEach(({ span, row, col, filled, wordIdx }) => {
                    // Leave cells that belong to the hovered word alone —
                    // the hover animator is writing letters into them.
                    if (filled && this.hoveredWordIdx === wordIdx) return;

                    const n = noiseField(col, row, t);

                    if (filled) {
                        // Restore Wingdings font & size if hover reveal changed them.
                        if (span.style.fontFamily !== NERD_FONT_FAMILY) {
                            span.style.fontFamily = NERD_FONT_FAMILY;
                            span.style.fontSize   = this._cellFs || span.style.fontSize;
                        }
                        const idx = Math.floor(((n + 1) * 0.5) * symLen) % symLen;
                        span.textContent = LETTER_SYMBOL_POOL[Math.max(0, idx)];
                    } else {
                        if (n > bgThreshold) {
                            const norm = (n - bgThreshold) / (1 - bgThreshold);
                            const idx  = Math.floor(norm * bgLen) % bgLen;
                            span.textContent = BG_CHAR_POOL[Math.max(0, idx)];
                        } else {
                            span.textContent = ' ';
                        }
                    }
                });
            }
        });
        this.idleAnimator.start();
    }

    _stopIdleAnimation() {
        if (this.idleAnimator) { this.idleAnimator.destroy(); this.idleAnimator = null; }
    }

    // ─── Hover ───────────────────────────────────────────────────────────────

    _bindEvents() {
        this.element.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.element.addEventListener('mouseleave', ()  => this._onMouseLeave());
        this.element.addEventListener('click',     (e) => this._onClick(e));
    }

    // Resolve which word (if any) the mouse is currently over using grid coordinates.
    // This covers the FULL bounding box of the word, not just filled cells.
    _wordIdxAtMouse(e) {
        const rect = this.element.getBoundingClientRect();
        const row  = Math.floor((e.clientY - rect.top)  / this._charHeight);
        const col  = Math.floor((e.clientX - rect.left) / this._charWidth);
        for (const region of this.wordRegions) {
            if (row >= region.rowStart && row < region.rowEnd &&
                col >= region.colStart && col < region.colEnd) {
                return region.wordIdx;
            }
        }
        return -1;
    }

    _onMouseMove(e) {
        const wIdx = this._wordIdxAtMouse(e);
        if (wIdx === this.hoveredWordIdx) return;

        this._stopHoverAnimator();
        this.hoveredWordIdx = wIdx;
        this.element.style.cursor = wIdx >= 0 ? 'pointer' : 'default';

        if (wIdx < 0 || !this.wordRegions[wIdx]) return;

        const spans = [...this.wordRegions[wIdx].filledSpans];
        shuffleArray(spans);
        let idx = 0;
        const batch = Math.max(1, Math.ceil(spans.length / 10));

        const AF = window.AnimationFoundation;
        if (!AF) return;

        this.hoverAnimator = new AF.AnimationLoop({
            fps: 30,
            onFrame: () => {
                if (idx >= spans.length) { this.hoverAnimator.stop(); return; }
                for (let i = 0; i < batch && idx < spans.length; i++, idx++) {
                    // Reveal: switch to Atkinson at full fontSize so the monospace
                    // char fills the cell width (charWidth = fontSize × ratio).
                    spans[idx].style.fontFamily = "'Atkinson Hyperlegible Mono', monospace";
                    spans[idx].style.fontSize   = this._revealedFs || spans[idx].style.fontSize;
                    spans[idx].textContent = spans[idx].dataset.letter;
                }
            }
        });
        this.hoverAnimator.start();
    }

    _onMouseLeave() {
        this._stopHoverAnimator();
        this.hoveredWordIdx = -1;
        this.element.style.cursor = 'default';
        // Idle animation resumes and restores Wingdings naturally.
    }

    _onClick(e) {
        const wIdx = this._wordIdxAtMouse(e);
        if (wIdx >= 0 && this.wordRegions[wIdx] && this.onNavigate) {
            this.onNavigate(this.wordRegions[wIdx].sectionId);
        }
    }

    _stopHoverAnimator() {
        if (this.hoverAnimator) { this.hoverAnimator.destroy(); this.hoverAnimator = null; }
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    destroy() {
        this._stopIdleAnimation();
        this._stopHoverAnimator();
        this.allSpanData = [];
        this.wordRegions = [];
        this.gridEl = null;
        super.destroy();
    }
}
