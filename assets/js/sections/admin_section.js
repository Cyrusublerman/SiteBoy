/**
 * Admin Section - SiteBoy Framework
 *
 * Index shell for section CRUD. Gated by auth stub until A2 ships.
 *
 * @version 1.1.0
 * @dependencies ['ComponentLibrary', 'BaseComponent']
 */

class AdminLoginView extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ componentType: 'admin-login' }, deps);
        this.onLogin = options.onLogin;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'admin-section admin-section-login toc-container');

        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({
            level: 1,
            content: 'ADMIN LOGIN'
        }, this.deps)).render());

        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
            content: 'Auth provider pending A2. Stub login for development only.'
        }, this.deps)).render());

        const emailInput = this._track(new ComponentLibrary.TextInput({
            label: 'EMAIL',
            placeholder: 'admin@example.com'
        }, this.deps));
        this.appendElement(this.element, emailInput.render());

        const loginBtn = this._track(new ComponentLibrary.Button({
            text: 'LOGIN (STUB)',
            onClick: () => this.onLogin?.(emailInput.getValue())
        }, this.deps));
        this.appendElement(this.element, loginBtn.render());

        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class AdminIndexView extends BaseComponent {
    constructor(sections, options = {}, deps = {}) {
        super({ componentType: 'admin-index' }, deps);
        this.sections = sections;
        this.onNavigate = options.onNavigate;
        this.onLogout = options.onLogout;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'admin-section admin-section-index toc-container');

        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({
            level: 1,
            content: 'ADMIN'
        }, this.deps)).render());

        this.sections.forEach((section) => {
            const row = this._track(new ComponentLibrary.Paragraph({
                content: section.title,
                isClickable: true,
                onClick: () => this.onNavigate?.(section.route.replace(/^admin\//, ''))
            }, this.deps));
            const rowEl = row.render();
            rowEl.classList.add('admin-section-row');
            this.appendElement(this.element, rowEl);
        });

        const logout = this._track(new ComponentLibrary.Button({
            text: 'LOGOUT',
            onClick: () => this.onLogout?.()
        }, this.deps));
        this.appendElement(this.element, logout.render());

        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class AdminSubView extends BaseComponent {
    constructor(subsection, entry, options = {}, deps = {}) {
        super({ componentType: 'admin-sub' }, deps);
        this.subsection = subsection;
        this.entry = entry;
        this.onNavigate = options.onNavigate;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'admin-section admin-section-sub toc-container');

        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({
            level: 1,
            content: this.entry?.title || this.subsection.toUpperCase()
        }, this.deps)).render());

        this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
            content: this.entry
                ? `Editor shell placeholder. Depends on ${this.entry.blocker}.`
                : 'Unknown admin route.'
        }, this.deps)).render());

        const back = this._track(new ComponentLibrary.Paragraph({
            content: '← BACK TO ADMIN',
            isClickable: true,
            onClick: () => this.onNavigate?.(null)
        }, this.deps));
        this.appendElement(this.element, back.render());

        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

const AdminSection = {
    version: '1.1.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    authStorageKey: 'siteboy:admin:session',
    _view: null,

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
            this._mountLogin();
            return;
        }

        if (!subsection) {
            this._mountIndex();
        } else {
            this._mountSub(subsection);
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

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _mountLogin() {
        this._view = new AdminLoginView({
            onLogin: (email) => {
                this.setSession(email);
                window.debugLog('NAVIGATION', '🔐 Admin stub session created');
                this.handleRoute(null, this.currentContainer, this.navigationCallbacks);
            }
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _mountIndex() {
        this._view = new AdminIndexView(this.EDITABLE_SECTIONS, {
            onNavigate: (sub) => this._navigate(sub),
            onLogout: () => {
                this.clearSession();
                this._mountLogin();
            }
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _mountSub(subsection) {
        const entry = this.EDITABLE_SECTIONS.find((s) => s.route === `admin/${subsection}`);
        this._view = new AdminSubView(subsection, entry, {
            onNavigate: (sub) => this._navigate(sub)
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _navigate(subsection) {
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection('admin', subsection);
        } else if (window.Router) {
            window.Router.navigateToSection('admin', subsection);
        }
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up Admin Section...');
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
        if (this.currentContainer) {
            BaseComponent.clearSectionContainer(this.currentContainer, [
                'admin-section', 'admin-section-login', 'admin-section-index', 'admin-section-sub', 'toc-container'
            ]);
        }
        this.componentInstances = [];
    }
};

window.AdminSection = AdminSection;
window.debugLog('INIT', `🔐 AdminSection v${AdminSection.version} loaded`);
