/**
 * Admin Section - SiteBoy Framework
 *
 * Index shell for section CRUD. Gated by auth stub until A2 ships.
 *
 * @version 1.0.0
 * @dependencies ['ComponentLibrary']
 */

const AdminSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    authStorageKey: 'siteboy:admin:session',

    EDITABLE_SECTIONS: [
        { id: 'gallery', title: 'GALLERY', route: 'admin/gallery', blocker: 'C2' },
        { id: 'projects', title: 'PROJECTS', route: 'admin/projects', blocker: 'A3' },
        { id: 'store', title: 'STORE SKUS', route: 'admin/store', blocker: 'A3' },
        { id: 'notes', title: 'NOTES', route: 'admin/notes', blocker: 'F2' },
        { id: 'blog', title: 'BLOG POSTS', route: 'admin/blog', blocker: 'A3' },
        { id: 'about', title: 'ABOUT', route: 'admin/about', blocker: 'A3' }
    ],

    get pages() {
        return ['#admin', ...this.EDITABLE_SECTIONS.map((s) => `#${s.route}`)];
    },

    async handleRoute(subsection, container, callbacks = {}) {
        window.debugLog('NAVIGATION', `🔐 Admin Section v${this.version} handling route: ${subsection || 'index'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        window.NavigationController.setupNavigation('admin', subsection, this.pages, callbacks);

        if (!this.isAuthenticated()) {
            this.renderLoginGate();
            return;
        }

        if (!subsection) {
            this.renderIndex();
        } else {
            this.renderSubPage(subsection);
        }
    },

    isAuthenticated() {
        try {
            const raw = localStorage.getItem(this.authStorageKey);
            if (!raw) return false;
            const session = JSON.parse(raw);
            return session && session.authenticated === true;
        } catch (_) {
            return false;
        }
    },

    setSession(email) {
        localStorage.setItem(this.authStorageKey, JSON.stringify({
            authenticated: true,
            email: email || 'admin@stub',
            issuedAt: Date.now()
        }));
    },

    clearSession() {
        localStorage.removeItem(this.authStorageKey);
    },

    renderLoginGate() {
        const deps = this._deps();
        const tracked = this._track();
        this._prepareContainer('admin-section-login');

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({
            level: 1,
            content: 'ADMIN LOGIN'
        }, deps)).render());

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
            content: 'Auth provider pending A2. Stub login for development only.'
        }, deps)).render());

        const emailInput = tracked(new ComponentLibrary.TextInput({
            label: 'EMAIL',
            placeholder: 'admin@example.com'
        }, deps));
        this.currentContainer.appendChild(emailInput.render());

        const loginBtn = tracked(new ComponentLibrary.Button({
            text: 'LOGIN (STUB)',
            onClick: () => {
                this.setSession(emailInput.getValue());
                window.debugLog('NAVIGATION', '🔐 Admin stub session created');
                this.handleRoute(null, this.currentContainer, this.navigationCallbacks);
            }
        }, deps));
        this.currentContainer.appendChild(loginBtn.render());
    },

    renderIndex() {
        const deps = this._deps();
        const tracked = this._track();
        this._prepareContainer('admin-section-index');

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({
            level: 1,
            content: 'ADMIN'
        }, deps)).render());

        this.EDITABLE_SECTIONS.forEach((section) => {
            const row = tracked(new ComponentLibrary.Paragraph({
                content: section.title,
                isClickable: true,
                onClick: () => this._navigate(section.route.replace(/^admin\//, ''))
            }, deps));
            const rowEl = row.render();
            rowEl.classList.add('admin-section-row');
            this.currentContainer.appendChild(rowEl);
        });

        const logout = tracked(new ComponentLibrary.Button({
            text: 'LOGOUT',
            onClick: () => {
                this.clearSession();
                this.renderLoginGate();
            }
        }, deps));
        this.currentContainer.appendChild(logout.render());
    },

    renderSubPage(subsection) {
        const deps = this._deps();
        const tracked = this._track();
        const entry = this.EDITABLE_SECTIONS.find((s) => s.route === `admin/${subsection}`);

        this._prepareContainer('admin-section-sub');

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({
            level: 1,
            content: entry?.title || subsection.toUpperCase()
        }, deps)).render());

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
            content: entry
                ? `Editor shell placeholder. Depends on ${entry.blocker}.`
                : 'Unknown admin route.'
        }, deps)).render());

        const back = tracked(new ComponentLibrary.Paragraph({
            content: '← BACK TO ADMIN',
            isClickable: true,
            onClick: () => this._navigate(null)
        }, deps));
        this.currentContainer.appendChild(back.render());
    },

    _navigate(subsection) {
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection('admin', subsection);
        } else if (window.Router) {
            window.Router.navigateToSection('admin', subsection);
        }
    },

    _prepareContainer(className) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('admin-section', className, 'toc-container');
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _track() {
        return (component) => {
            this.componentInstances.push(component);
            return component;
        };
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up Admin Section...');
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.classList.remove('admin-section', 'admin-section-login', 'admin-section-index', 'admin-section-sub', 'toc-container');
        }
        if (this.componentInstances.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.componentInstances);
        }
        this.componentInstances = [];
    }
};

window.AdminSection = AdminSection;
window.debugLog('INIT', `🔐 AdminSection v${AdminSection.version} loaded`);
