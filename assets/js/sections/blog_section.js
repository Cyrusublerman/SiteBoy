/**
 * Blog Section - SiteBoy Framework
 * 
 * BLOG SECTION - TOC Index with Article Pages
 * Shows hierarchical TOC on index, individual articles on routes
 * Always shows subheader with navigation
 * 
 * @version 3.2.0 - Auto-generated multi-root blog routing
 * @dependencies ['ComponentLibrary'] - Component system
 */

const BlogSection = {
    version: '3.1.1',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    slugIndex: new Map(),
    currentArticle: null,
    currentCategory: null,
    manifest: (typeof window !== 'undefined' && window.blogDocsManifest) || null,
    manifestReady: false,
    manifestPromise: null,
    
    /**
     * Handle route changes for blog section
     * @param {string|null} subsection - Page slug like 'music/chord' or null for TOC
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    async handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        console.log(`📝 Blog Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        await this.ensureManifestReady();
        
        if (!this.manifestReady) {
            this.renderError('Blog manifest not available');
            return;
        }
        
        // Apply proper body sizing for blog section (with subheader)
        // Content container positioning now handled by PageContainer like headers/footers
        console.log('✅ Blog section loaded with deterministic container positioning');
        
        // Setup unified navigation (same code for all sections)
        window.NavigationController.setupNavigation('blog', subsection, this.getNavigationPages(), this.navigationCallbacks);
        
        // Parse route to determine what to show
        if (!subsection) {
            // Show blog TOC index
            this.renderBlogIndex();
        } else {
            const targetEntry = this.slugIndex.get(subsection);
            if (targetEntry) {
                this.currentCategory = targetEntry.slug.split('/')[0] || 'docs';
                this.currentArticle = targetEntry.slug;
                await this.renderArticle(targetEntry);
            } else {
                this.renderError(`Invalid blog route or missing document: ${subsection}`);
            }
        }
    },
    
    async ensureManifestReady() {
        if (this.manifestReady) return true;
        
        if (!this.manifest && typeof window !== 'undefined' && window.blogDocsManifest) {
            this.setManifest(window.blogDocsManifest);
            return true;
        }
        
        if (!this.manifestPromise) {
            this.manifestPromise = fetch('blog/blog-docs-manifest.json')
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    this.setManifest(data);
                })
                .catch(error => {
                    console.error('❌ Failed to load blog manifest:', error);
                });
        }
        
        await this.manifestPromise;
        return this.manifestReady;
    },
    
    setManifest(manifest) {
        if (manifest && Array.isArray(manifest.files)) {
            this.manifest = manifest;
            this.slugIndex.clear();
            this.manifest.files.forEach(file => {
                this.slugIndex.set(file.slug, file);
            });
            this.manifestReady = true;
            console.log(`🗂️ Loaded blog manifest with ${this.slugIndex.size} documents`);
        } else {
            console.warn('⚠️ Blog manifest not found or invalid');
        }
    },
    
    getNavigationPages() {
        if (this.manifest && Array.isArray(this.manifest.flatRoutes) && this.manifest.flatRoutes.length) {
            return this.manifest.flatRoutes;
        }
        return ['#blog'];
    },
    
    formatTitle(text) {
        if (!text) return '';
        return text
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, c => c.toUpperCase());
    },
    
    /**
     * Render blog TOC index
     */
    renderBlogIndex() {
        console.log('📝 Rendering blog TOC index...');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for blog index (no subheader)
        const contentContainer = this.currentContainer.closest('.content-container');
        if (contentContainer) {
            contentContainer.classList.add('toc-container');
            
            // Reposition content container for no-subheader layout
            if (window.MathematicalFoundation) {
                const layout = window.MathematicalFoundation.computeLayout() || {};
                const margin = window.MathematicalFoundation.Config?.margin || layout.marginLeft || 14;
                const headerHeight = layout.headerHeight || 28;
                const contentTop = margin + headerHeight;
                contentContainer.style.top = `${contentTop}px`;
                console.log(`✅ Applied no-subheader layout for blog index: top=${contentTop}px`);
            }
        }
        
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
        if (!this.manifest || !this.manifest.tree || !Array.isArray(this.manifest.tree.children)) {
            return [];
        }
        
        const tocSections = [];
        
        this.manifest.tree.children.forEach(rootNode => {
            if (rootNode.type !== 'root-folder' || !Array.isArray(rootNode.children)) return;
            
            const articles = this.mapChildrenToItems(rootNode.children, rootNode.name);
            if (articles.length) {
                tocSections.push({
                    title: this.formatTitle(rootNode.title || rootNode.name),
                    description: rootNode.name,
                    articles
                });
            }
        });
        
        return tocSections;
    },
    
    mapChildrenToItems(children, categoryKey, parentPath = '') {
        const items = [];
        if (!children) return items;
        
        children.forEach(child => {
            const id = parentPath ? `${parentPath}/${child.name || child.slug}` : (child.slug || child.name);
            
            if (child.type === 'file') {
                items.push({
                    id,
                    title: this.formatTitle(child.title || child.name),
                    description: child.relPath || child.slug,
                    slug: child.slug,
                    categoryKey
                });
            } else if (child.type === 'folder' && Array.isArray(child.children)) {
                items.push({
                    id,
                    title: this.formatTitle(child.title || child.name),
                    description: child.name,
                    categoryKey,
                    children: this.mapChildrenToItems(child.children, categoryKey, id)
                });
            }
        });
        
        return items;
    },
    
    /**
     * Handle blog TOC item click from NumberedTOC component
     */
    handleBlogTOCItemClick(item) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection('blog', item.slug);
        }
        console.log(`📝 Blog TOC item clicked: ${item.title}`);
    },
    
    
    
    
    
    /**
     * Render individual article
     */
    async renderArticle(entry) {
        console.log(`📝 Rendering article: ${entry.slug}`);
        
        // Clear container 
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.remove('toc-container');
        
        // Create article title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: entry.title
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Create category breadcrumb
        const categoryInfo = new ComponentLibrary.Paragraph({
            content: `${entry.segments.join(' / ') || 'docs'} → ${entry.title}`
        });
        this.componentInstances.push(categoryInfo);
        this.currentContainer.appendChild(categoryInfo.render());
        
        // Load and render markdown content
        await this.loadAndRenderMarkdown(entry);
        
        console.log('✅ Article rendered');
    },

    /**
     * Load and render markdown content for an article
     */
    async loadAndRenderMarkdown(entry) {
        try {
            const markdownPath = `blog/${entry.slug}.md`;
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
                content: `Error loading content: ${error.message}. Please check that the file exists at ${markdownPath}`
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
            totalArticles: this.slugIndex.size,
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

window.debugLog('INIT', `📝 Blog Section v${BlogSection.version} ready - JSON-Driven Content System`);