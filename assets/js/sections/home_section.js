/**
 * Home Section - SiteBoy Framework
 *
 * Renders the site navigation as three stacked ASCII-art word blocks:
 * BLOG / ART / TOOLS. Each block fills the content width, animates on hover,
 * and navigates to the corresponding section on click.
 *
 * @version 4.0.0 - ASCII Nav Home Page
 * @dependencies ['ComponentLibrary'] - Component system
 */

const HomeSection = {
    version: '4.0.0',
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

        const MF           = window.MathematicalFoundation;
        const F            = MF ? MF.F : 14;
        const margin       = MF?.Config?.margin || F * 4;
        const headerHeight = MF?.Config?.sizing?.header || F * 2;
        const footerHeight = MF?.Config?.sizing?.footer || headerHeight;

        // Content container starts immediately below the header — no margin gap.
        // The centering math (justify-content:center) distributes whitespace
        // symmetrically; shifting the container top by an extra margin would
        // add a one-sided gap that breaks that symmetry.
        const contentContainer = this.currentContainer.closest('.content-container');
        if (contentContainer) {
            contentContainer.style.top = `${headerHeight}px`;
            contentContainer.style.overflow = 'hidden';
        }

        // Usable height: from header bottom (headerHeight) to footer top
        // (innerHeight - headerHeight - margin).
        const contentHeight = window.innerHeight - headerHeight - footerHeight - margin;

        // Wrapper fills exactly the usable area; justify-content:center splits
        // any remaining space equally above and below the word group.
        const wrapper = document.createElement('div');
        wrapper.className = 'ascii-nav-home';
        wrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: ${F * 2}px;
            width: 100%;
            height: ${contentHeight}px;
            box-sizing: border-box;
            overflow: hidden;
        `;

        const deps = {
            MF:     window.MathematicalFoundation,
            Resize: window.ResizeManager,
        };

        // FONT_COLS=10, FONT_GAP=2 — mirrors ascii-nav-font.js constants.
        // The widest word sets the width constraint for ALL words so every
        // word renders at the same font size (one shared document feel).
        const sharedTotalCols = Math.max(...this.navWords.map(({ word }) =>
            word.length * 10 + Math.max(0, word.length - 1) * 2
        ));

        this.navWords.forEach(({ word, sectionId }) => {
            const navWord = new ComponentLibrary.AsciiNavWord({
                word,
                sectionId,
                onNavigate:       (id) => this.navigateToSection(id),
                numWords:         this.navWords.length,
                sharedTotalCols,
            }, deps);

            this.componentInstances.push(navWord);
            wrapper.appendChild(navWord.render());
        });

        this.currentContainer.appendChild(wrapper);
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
