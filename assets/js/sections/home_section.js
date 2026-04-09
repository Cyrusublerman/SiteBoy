/**
 * Home Section - SiteBoy Framework
 *
 * Renders a full-content-area ASCII noise scene. The three navigation words
 * (ART / TOOLS / BLOG) are stamped into a character grid that covers the
 * entire content area. Letter cells idle as block symbols; background cells
 * show sparse noise. Hovering a word progressively reveals its letters.
 *
 * @version 5.0.0 - AsciiNavScene
 * @dependencies ['ComponentLibrary'] - Component system
 */

const HomeSection = {
    version: '5.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,

    navWords: [
        { word: 'ART',   sectionId: 'art'   },
        { word: 'TOOLS', sectionId: 'tools' },
        { word: 'BLOG',  sectionId: 'blog'  },
    ],

    handleRoute(subsection, container, callbacks = {}) {
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        if (window.Subheader) window.Subheader.hide();

        this.renderHomePage();
    },

    renderHomePage() {
        this.currentContainer.innerHTML = '';

        // Remove internal padding so the scene fills the container flush.
        const contentContainer = this.currentContainer.closest('.content-container');
        if (contentContainer) {
            contentContainer.style.padding  = '0';
            contentContainer.style.overflow = 'hidden';
        }

        const deps = {
            MF:     window.MathematicalFoundation,
            Resize: window.ResizeManager,
        };

        const scene = new ComponentLibrary.AsciiNavScene({
            navWords:   this.navWords,
            onNavigate: (id) => this.navigateToSection(id),
        }, deps);

        this.componentInstances.push(scene);
        this.currentContainer.appendChild(scene.render());
    },

    navigateToSection(section, subsection = null) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection(section, subsection);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },

    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
        }

        ComponentLibrary.destroyTracked(this.componentInstances);
        this.componentInstances = [];
    },

    getSectionInfo() {
        return {
            name: 'home',
            title: 'HOME',
            type: 'ascii-nav',
            wordCount: this.navWords.length,
            componentCount: this.componentInstances.length,
        };
    },

    init() {},

    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    },
};

// Global registration
window.HomeSection = HomeSection;

window.debugLog('INIT', `🏠 Home Section v${HomeSection.version} ready - ASCII Nav Home Page`);
