/**
 * Blog Section - SiteBoy Framework
 * 
 * BLOG SECTION - TOC Index with Article Pages
 * Shows hierarchical TOC on index, individual articles on routes
 * Always shows subheader with navigation
 * 
 * @version 3.0.0 - TOC + Articles Structure
 * @dependencies ['ComponentLibrary'] - Component system
 */

const BlogSection = {
    version: '3.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    currentArticle: null,
    currentCategory: null,
    
    // Blog structure based on old assets/blog/ folders
    blogStructure: {
        'music': {
            title: 'MUSIC THEORY',
            description: 'Articles about musical composition, theory, and analysis',
            articles: [
                { id: 'chord', title: 'Chord Progressions', path: '#blog/music/chord' },
                { id: 'drum', title: 'Drum Patterns', path: '#blog/music/drum' },
                { id: 'keysnmodes', title: 'Keys & Modes', path: '#blog/music/keysnmodes' },
                { id: 'notes2hertz', title: 'Notes to Hertz', path: '#blog/music/notes2hertz' }
            ]
        },
        'site': {
            title: 'SITE DEVELOPMENT',
            description: 'Technical articles about website architecture and development',
            articles: [
                { id: 'plan', title: 'Site Plan', path: '#blog/site/plan' },
                { id: 'refined_logic', title: 'Refined Logic', path: '#blog/site/refined_logic' },
                { id: 'type', title: 'Typography', path: '#blog/site/type' }
            ]
        },
        'tools': {
            title: 'DEVELOPMENT TOOLS',
            description: 'Guides for development and creative tools',
            articles: [
                { id: 'color-quantizer', title: 'Color Quantizer', path: '#blog/tools/color-quantizer' },
                { id: 'font-analysis', title: 'Font Analysis', path: '#blog/tools/font-analysis' },
                { id: 'pixel-tiler', title: 'Pixel Tiler', path: '#blog/tools/pixel-tiler' },
                { id: 'typography', title: 'Typography Tool', path: '#blog/tools/typography' }
            ]
        }
    },
    
    /**
     * Handle route changes for blog section
     * @param {string|null} subsection - Page slug like 'music/chord' or null for TOC
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`📝 Blog Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Apply proper body sizing for blog section (with subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: true 
                });
                console.log('✅ Applied with-subheader body sizing for blog section');
            }
        }
        
        // Parse route to determine what to show
        if (!subsection) {
            // Show blog TOC index
            this.renderBlogIndex();
            this.setupSubheaderForIndex();
        } else {
            // Parse category/article from subsection (e.g., 'music/chord')
            const [category, articleId] = subsection.split('/');
            if (category && articleId && this.blogStructure[category]) {
                const article = this.blogStructure[category].articles.find(a => a.id === articleId);
                if (article) {
                    this.currentCategory = category;
                    this.currentArticle = articleId;
                    this.renderArticle(category, article);
                    this.setupSubheaderForArticle(category, articleId);
                } else {
                    this.renderError(`Article not found: ${articleId}`);
                }
            } else {
                this.renderError(`Invalid blog route: ${subsection}`);
            }
        }
    },
    
    /**
     * Render blog TOC index
     */
    renderBlogIndex() {
        console.log('📝 Rendering blog TOC index...');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Create blog title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'BLOG'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Select an article to read. Content is organized by category and topic.'
        });
        this.componentInstances.push(description);
        this.currentContainer.appendChild(description.render());
        
        // Create hierarchical TOC
        this.createHierarchicalBlogTOC();
        
        console.log('✅ Blog TOC index rendered');
    },
    
    /**
     * Create hierarchical blog TOC using numbered rows (like old design)
     */
    createHierarchicalBlogTOC() {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const headerHeight = F * 2; // 24px
        
        let itemIndex = 0;
        
        Object.entries(this.blogStructure).forEach(([categoryKey, category]) => {
            // Category header
            const categoryHeader = this.createElement('div', 'toc-category-header');
            categoryHeader.textContent = category.title + ' /';
            categoryHeader.style.cssText = `
                padding: 0 ${F * 2}px; height: ${headerHeight}px; display: flex; align-items: center;
                background: var(--c-bg); color: var(--c-text); outline: 1px solid var(--c-border);
                font-family: 'Space Mono', monospace; font-size: ${F}px; text-transform: uppercase;
                ${itemIndex > 0 ? 'outline-top: none;' : ''}
            `;
            this.currentContainer.appendChild(categoryHeader);
            
            // Category articles
            category.articles.forEach((article) => {
                itemIndex++;
                this.createBlogTOCItem(article, categoryKey, itemIndex);
            });
        });
    },
    
    /**
     * Create individual blog TOC item
     */
    createBlogTOCItem(article, categoryKey, itemIndex) {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const numberBoxSize = F * 4; // 48px
        
        const tocItem = this.createElement('div', 'toc-item');
        tocItem.style.cssText = `
            height: ${numberBoxSize}px; cursor: pointer; display: flex; align-items: stretch;
            outline: 1px solid var(--c-border); outline-top: none;
            font-family: 'Space Mono', monospace; transition: background-color 0.2s ease;
        `;
        
        // Number box
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = String(itemIndex).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${numberBoxSize}px; height: ${numberBoxSize}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
        `;
        
        // Content
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; padding: ${F}px ${F * 2}px; display: flex; flex-direction: column;
            justify-content: center; outline-left: 1px solid var(--c-border);
        `;
        
        const titleDiv = this.createElement('div');
        titleDiv.textContent = article.title;
        titleDiv.style.cssText = `
            margin: 0 0 4px 0; text-transform: uppercase; font-size: 14px; line-height: 1.2;
        `;
        
        const filenameDiv = this.createElement('div');
        filenameDiv.textContent = `${article.id}.md`;
        filenameDiv.style.cssText = `
            margin: 0; font-size: 11px; opacity: 0.7; text-transform: uppercase; line-height: 1;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(filenameDiv);
        
        // Arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${numberBoxSize}px; height: ${numberBoxSize}px; display: flex;
            align-items: center; justify-content: center; font-size: 16px;
            outline-left: 1px solid var(--c-border); flex-shrink: 0;
        `;
        
        tocItem.appendChild(numberBox);
        tocItem.appendChild(content);
        tocItem.appendChild(arrow);
        
        // Add hover effects
        tocItem.addEventListener('mouseenter', () => {
            tocItem.style.background = 'var(--c-border)';
            tocItem.style.color = 'var(--c-bg)';
            numberBox.style.background = 'var(--c-bg)';
            numberBox.style.color = 'var(--c-border)';
        });
        
        tocItem.addEventListener('mouseleave', () => {
            tocItem.style.background = '';
            tocItem.style.color = '';
            numberBox.style.background = 'var(--c-text)';
            numberBox.style.color = 'var(--c-bg)';
        });
        
        // Add click handler
        tocItem.addEventListener('click', () => {
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('blog', `${categoryKey}/${article.id}`);
            }
        });
        
        this.currentContainer.appendChild(tocItem);
    },
    
    /**
     * Setup subheader for blog index (TOC)
     */
    setupSubheaderForIndex() {
        if (!window.Subheader) {
            console.warn('⚠️ Subheader component not available');
            return;
        }
        
        // Update subheader title
        window.Subheader.updateTitle('BLOG TOC');
        
        // Build all articles list for dropdown
        const allPages = this.getAllBlogPages();
        const dropdownItems = this.buildDropdownItems(allPages, null);
        
        // Setup dropdown
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        // Setup navigation (first/last article)
        const firstArticle = allPages[0];
        const lastArticle = allPages[allPages.length - 1];
        
        window.Subheader.updateNavigation(
            () => this.navigateToPage(lastArticle.path), // Previous = last (loop)
            () => this.navigateToPage(firstArticle.path)  // Next = first
        );
        
        // Show subheader
        window.Subheader.show();
        
        console.log('✅ Subheader setup for blog index');
    },
    
    /**
     * Setup subheader for individual article
     */
    setupSubheaderForArticle(category, articleId) {
        if (!window.Subheader) {
            console.warn('⚠️ Subheader component not available');
            return;
        }
        
        const article = this.blogStructure[category].articles.find(a => a.id === articleId);
        if (!article) return;
        
        // Update subheader title
        window.Subheader.updateTitle(article.title);
        
        // Build all articles list for dropdown
        const allPages = this.getAllBlogPages();
        const currentPath = `#blog/${category}/${articleId}`;
        const dropdownItems = this.buildDropdownItems(allPages, currentPath);
        
        // Setup dropdown
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        // Setup prev/next navigation with looping
        const currentIndex = allPages.findIndex(p => p.path === currentPath);
        const prevIndex = currentIndex === 0 ? allPages.length - 1 : currentIndex - 1;
        const nextIndex = currentIndex === allPages.length - 1 ? 0 : currentIndex + 1;
        
        window.Subheader.updateNavigation(
            () => this.navigateToPage(allPages[prevIndex].path), // Previous
            () => this.navigateToPage(allPages[nextIndex].path)  // Next
        );
        
        // Show subheader
        window.Subheader.show();
        
        console.log('✅ Subheader setup for article:', article.title);
    },
    
    /**
     * Get all blog pages in order (TOC first, then all articles)
     */
    getAllBlogPages() {
        const pages = [
            { label: 'BLOG TOC', path: '#blog', isTOC: true }
        ];
        
        // Add all articles from all categories
        Object.entries(this.blogStructure).forEach(([categoryKey, category]) => {
            category.articles.forEach(article => {
                pages.push({
                    label: article.title,
                    path: `#blog/${categoryKey}/${article.id}`,
                    category: categoryKey,
                    isTOC: false
                });
            });
        });
        
        return pages;
    },
    
    /**
     * Build dropdown items with proper structure
     */
    buildDropdownItems(allPages, currentPath) {
        const items = [];
        
        // Add TOC first
        items.push({
            label: 'BLOG TOC',
            value: 'toc',
            path: '#blog',
            current: currentPath === '#blog' || currentPath === null
        });
        
        // Add categories and articles
        Object.entries(this.blogStructure).forEach(([categoryKey, category]) => {
            // Category header
            items.push({
                type: 'header',
                title: category.title
            });
            
            // Category articles
            category.articles.forEach(article => {
                const articlePath = `#blog/${categoryKey}/${article.id}`;
                items.push({
                    label: article.title,
                    value: article.id,
                    path: articlePath,
                    current: currentPath === articlePath,
                    subitem: true
                });
            });
        });
        
        return items;
    },
    
    /**
     * Navigate to a page using injected navigation callbacks
     * @param {string} url - Page URL (e.g., '#blog/music/chord')
     */
    navigateToPage(url) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            const hashPath = url.replace('#', '');
            const pathParts = hashPath.split('/');
            const section = pathParts[0];
            const subsection = pathParts.slice(1).join('/');
            this.navigationCallbacks.navigateToSection(section, subsection || null);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },
    
    /**
     * Render individual article
     */
    renderArticle(category, article) {
        console.log(`📝 Rendering article: ${category}/${article.id}`);
        
        // Clear container 
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.remove('toc-container');
        
        // Create article title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: article.title
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Create category breadcrumb
        const categoryInfo = new ComponentLibrary.Paragraph({
            content: `${this.blogStructure[category].title} → ${article.title}`
        });
        this.componentInstances.push(categoryInfo);
        this.currentContainer.appendChild(categoryInfo.render());
        
        // Create placeholder content (until we implement markdown loading)
        const content = new ComponentLibrary.Paragraph({
            content: `This is a placeholder for the article "${article.title}". 
            In the full implementation, this would load the markdown content from 
            reference/old-assets/assets/blog/${category}/${article.id}.md and render it using 
            the MarkdownBody component.`
        });
        this.componentInstances.push(content);
        this.currentContainer.appendChild(content.render());
        
        // Add sample content blocks to demonstrate layout
        const sampleGrid = new ComponentLibrary.Grid({
            items: ['Sample Item 1', 'Sample Item 2', 'Sample Item 3', 'Sample Item 4'],
            cols: 2
        });
        this.componentInstances.push(sampleGrid);
        this.currentContainer.appendChild(sampleGrid.render());
        
        // Add back link
        const backParagraph = new ComponentLibrary.Paragraph({
            content: '← Back to Blog TOC'
        });
        this.componentInstances.push(backParagraph);
        
        const backElement = backParagraph.render();
        backElement.classList.add('clickable');
        backElement.addEventListener('click', () => {
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('blog');
            }
        });
        
        this.currentContainer.appendChild(backElement);
        
        console.log('✅ Article rendered');
    },
    
    /**
     * Render error message
     */
    renderError(errorMessage) {
        console.error(`❌ Blog Section Error: ${errorMessage}`);
        
        // Clear container
        this.currentContainer.innerHTML = '';
        
        const errorHeading = new ComponentLibrary.Heading({
            level: 1,
            content: 'Blog Error'
        });
        this.componentInstances.push(errorHeading);
        this.currentContainer.appendChild(errorHeading.render());
        
        const errorParagraph = new ComponentLibrary.Paragraph({
            content: errorMessage
        });
        this.componentInstances.push(errorParagraph);
        this.currentContainer.appendChild(errorParagraph.render());
        
        const backButton = new ComponentLibrary.Button({
            text: 'Back to Blog',
            onClick: () => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('blog');
                }
            }
        });
        this.componentInstances.push(backButton);
        this.currentContainer.appendChild(backButton.render());
    },
    
    /**
     * Create DOM element helper
     */
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        // Apply F=12px styling
        element.style.fontFamily = '"Space Mono", monospace';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        
        return element;
    },
    
    /**
     * Cleanup section - destroy all component instances
     */
    cleanup() {
        console.log('🧹 Destroying previous blog section components...');
        
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            // Remove layout classes
            this.currentContainer.className = this.currentContainer.className
                .replace(/toc-container|layout-\w+-\w+/g, '')
                .trim();
        }
        
        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
        
        // Reset state
        this.currentArticle = null;
        this.currentCategory = null;
        
        console.log('✅ Blog section cleanup complete');
    },
    
    /**
     * Get section info for navigation
     */
    getSectionInfo() {
        return {
            name: 'blog',
            title: 'BLOG',
            currentArticle: this.currentArticle,
            currentCategory: this.currentCategory,
            totalArticles: Object.values(this.blogStructure).reduce((sum, cat) => sum + cat.articles.length, 0),
            componentCount: this.componentInstances.length
        };
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        console.log(`📝 Blog Section v${this.version} initialized - TOC + Articles Structure`);
    },
    
    /**
     * Render section (legacy support)
     */
    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    }
};

// Global registration
window.BlogSection = BlogSection;

console.log(`📝 Blog Section v${BlogSection.version} ready - JSON-Driven Content System`);