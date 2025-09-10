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
    
    // Blog structure based on actual blog/ folder structure
    blogStructure: {
        'docs': {
            title: 'DOCUMENTATION',
            description: 'Technical documentation and analysis',
            articles: [
                { id: 'SITEBOY_ARCHITECTURE_FLOW', title: 'SiteBoy Architecture Flow', path: '#blog/docs/SITEBOY_ARCHITECTURE_FLOW' },
                { id: 'ANALYSIS_OLD_BUILD_vs_CURRENT', title: 'Old Build Analysis', path: '#blog/docs/ANALYSIS_OLD_BUILD_vs_CURRENT' },
                { id: 'BODY-SIZING-FIX', title: 'Body Sizing Fix', path: '#blog/docs/BODY-SIZING-FIX' },
                { id: 'COMPONENT_AESTHETICS_ANALYSIS', title: 'Component Aesthetics', path: '#blog/docs/COMPONENT_AESTHETICS_ANALYSIS' },
                { id: 'DROPDOWN-IMPLEMENTATION-PLAN', title: 'Dropdown Implementation', path: '#blog/docs/DROPDOWN-IMPLEMENTATION-PLAN' },
                { id: 'DROPDOWN-TOC-METHODOLOGY', title: 'Dropdown TOC Methodology', path: '#blog/docs/DROPDOWN-TOC-METHODOLOGY' },
                { id: 'HOME-PAGE-TOC-IMPLEMENTATION', title: 'Home Page TOC', path: '#blog/docs/HOME-PAGE-TOC-IMPLEMENTATION' },
                { id: 'MATHEMATICAL_ALIGNMENT_ANALYSIS', title: 'Mathematical Alignment', path: '#blog/docs/MATHEMATICAL_ALIGNMENT_ANALYSIS' },
                { id: 'OLD_BUILD_SUPERIOR_AREAS', title: 'Old Build Analysis', path: '#blog/docs/OLD_BUILD_SUPERIOR_AREAS' },
                { id: 'PAGE-BUILD-COMPLIANCE-FINAL', title: 'Page Build Compliance', path: '#blog/docs/PAGE-BUILD-COMPLIANCE-FINAL' },
                { id: 'PAGE-BUILD-COMPLIANCE-REPORT', title: 'Build Compliance Report', path: '#blog/docs/PAGE-BUILD-COMPLIANCE-REPORT' },
                { id: 'REFACTOR-COMPLETE', title: 'Refactor Complete', path: '#blog/docs/REFACTOR-COMPLETE' },
                { id: 'SETUP-SPEC', title: 'Setup Specification', path: '#blog/docs/SETUP-SPEC' },
                { id: 'UI_COMPONENT_DIFFERENCES_ANALYSIS', title: 'UI Component Differences', path: '#blog/docs/UI_COMPONENT_DIFFERENCES_ANALYSIS' }
            ]
        },
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
    async handleRoute(subsection, container, callbacks = {}) {
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
                    await this.renderArticle(category, article);
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
        
        // Create blog TOC using proper ComponentLibrary component with collapsible sections
        const blogTOCData = this.prepareBlogTOCData();
        const numberedTOC = new ComponentLibrary.NumberedTOC({
            sections: blogTOCData,
            onItemClick: (item) => this.handleBlogTOCItemClick(item),
            collapsible: true
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(numberedTOC);
        this.currentContainer.appendChild(numberedTOC.render());
        
        console.log('✅ Blog TOC index rendered using ComponentLibrary');
    },

    /**
     * Prepare blog TOC data for NumberedTOC component
     */
    prepareBlogTOCData() {
        return Object.entries(this.blogStructure).map(([categoryKey, category]) => ({
            title: category.title,
            description: category.description,
            articles: category.articles.map(article => ({
                title: article.title,
                description: `${article.id}.md`,
                id: article.id,
                categoryKey: categoryKey
            }))
        }));
    },

    /**
     * Handle blog TOC item click from NumberedTOC component
     */
    handleBlogTOCItemClick(item) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection('blog', `${item.categoryKey}/${item.id}`);
        }
        console.log(`📝 Blog TOC item clicked: ${item.title}`);
    },
    
    /**
     * Setup subheader for blog index (TOC)
     */
    setupSubheaderForIndex() {
        console.log('📝 setupSubheaderForIndex() called - setting up subheader for blog TOC');
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
        
        // Setup prev/next navigation with looping (TOC is at index 0)
        const currentIndex = 0; // TOC is always at index 0
        const prevIndex = allPages.length - 1; // Previous = last article
        const nextIndex = 1; // Next = first actual article
        
        // Use consistent navigation API
        const navigationContext = {
            section: 'blog',
            subsection: null, // TOC has no subsection
            items: allPages,
            navigate: (section, subsection) => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection(section, subsection);
                }
            }
        };
        window.Subheader.updateNavigation(navigationContext);
        
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
        
        // Use new navigation API
        const navigationContext = {
            section: 'blog',
            subsection: `${category}/${articleId}`,
            items: allPages,
            navigate: (section, subsection) => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection(section, subsection);
                }
            }
        };
        window.Subheader.updateNavigation(navigationContext);
        
        // Show subheader
        window.Subheader.show();
        
        console.log('✅ Subheader setup for article:', article.title);
    },
    
    /**
     * Get all blog pages in order (TOC first, then all articles)
     */
    getAllBlogPages() {
        const pages = [
            { title: 'BLOG TOC', path: '#blog', isTOC: true }
        ];
        
        // Add all articles from all categories
        Object.entries(this.blogStructure).forEach(([categoryKey, category]) => {
            category.articles.forEach(article => {
                pages.push({
                    title: article.title,
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
    async renderArticle(category, article) {
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
        
        // Load and render markdown content
        await this.loadAndRenderMarkdown(category, article);
        
        console.log('✅ Article rendered');
    },

    /**
     * Load and render markdown content for an article
     */
    async loadAndRenderMarkdown(category, article) {
        try {
            const markdownPath = `blog/${category}/${article.id}.md`;
            console.log(`📝 Loading markdown from: ${markdownPath}`);
            
            // Show loading message
            const loadingMsg = new ComponentLibrary.Paragraph({
                content: 'Loading content...'
            });
            this.componentInstances.push(loadingMsg);
            const loadingElement = loadingMsg.render();
            this.currentContainer.appendChild(loadingElement);
            
            // Fetch markdown content
            const response = await fetch(markdownPath);
            if (!response.ok) {
                throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
            }
            
            const markdownText = await response.text();
            
            // Remove loading message
            this.currentContainer.removeChild(loadingElement);
            this.componentInstances = this.componentInstances.filter(comp => comp !== loadingMsg);
            
            // Create markdown component
            const markdownBody = new ComponentLibrary.MarkdownBody({
                markdownText: markdownText
            });
            this.componentInstances.push(markdownBody);
            this.currentContainer.appendChild(markdownBody.render());
            
            console.log('✅ Markdown content loaded and rendered');
            
        } catch (error) {
            console.error(`❌ Error loading markdown content:`, error);
            
            // Remove any loading messages
            const loadingElements = this.currentContainer.querySelectorAll('.loading-message');
            loadingElements.forEach(el => el.remove());
            
            // Show error message
            const errorMsg = new ComponentLibrary.Paragraph({
                content: `Error loading content: ${error.message}. Please check that the file exists at blog/${category}/${article.id}.md`
            });
            this.componentInstances.push(errorMsg);
            this.currentContainer.appendChild(errorMsg.render());
        }
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