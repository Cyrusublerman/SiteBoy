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
     * Render blog TOC index — TreeTOC is the PCS (ui-interface-overview §1)
     */
    renderBlogIndex() {
        this.currentContainer.innerHTML = '';

        const toc = new ComponentLibrary.TreeTOC({
            data: this.prepareBlogTreeData(),
            onItemClick: (item) => this.handleBlogTOCItemClick(item),
            collapsible: true
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });

        this.componentInstances.push(toc);
        this.currentContainer.appendChild(toc.render());
        window.debugLog('BLOG', '✅ Blog TOC index rendered with TreeTOC');
    },

    /**
     * Convert manifest tree to TreeTOC { label, children?, _data? } format (arbitrary depth).
     * File nodes carry _data = manifest file object; _data.slug drives navigation.
     */
    _manifestNodeToTreeNode(node) {
        if (node.type === 'file') {
            return { label: this.formatTitle(node.title || node.name), _data: node };
        }
        const children = (node.children || [])
            .map(c => this._manifestNodeToTreeNode(c))
            .filter(Boolean);
        return {
            label: this.formatTitle(node.title || node.name),
            ...(children.length ? { children } : {})
        };
    },

    prepareBlogTreeData() {
        const children = (this.manifest?.tree?.children || [])
            .filter(n => n.type === 'root-folder')
            .map(n => this._manifestNodeToTreeNode(n));
        return { label: 'DOCS', children };
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