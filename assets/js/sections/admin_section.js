import { BaseComponent } from '../shared/foundation.js';
import {
  Heading,
  Paragraph,
  Button,
} from '../shared/component-library.js';
import { TextInput } from '../shared/components/input/TextInput.js';
import { Auth } from '../admin/auth.js';
import { GalleryEditor } from '../admin/gallery-editor.js';

class AdminLoginView extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'admin-login' }, deps);
    this.onLogin = options.onLogin;
    this.tracked = [];
    this.statusElement = null;
  }

  _track(component) {
    this.tracked.push(component);
    this.children.add(component);
    return component;
  }

  _setStatus(message, tone = 'neutral') {
    if (!this.statusElement) return;
    this.statusElement.textContent = message;
    this.statusElement.dataset.tone = tone;
  }

  render() {
    if (this.element) return this.element;
    this.element = this.createElement('div', 'admin-section admin-section-login toc-container');

    const heading = this._track(new Heading({ level: 1, content: 'ADMIN LOGIN' }, this.deps));
    this.appendElement(this.element, heading.render());
    const intro = this._track(new Paragraph({
      content: 'Sign in with the private SiteBoy administrator password. The password is verified by the server and is never stored in the browser.',
    }, this.deps));
    this.appendElement(this.element, intro.render());

    const password = this._track(new TextInput({
      label: 'PASSWORD',
      placeholder: 'Administrator password',
    }, this.deps));
    this.appendElement(this.element, password.render());
    password.inputEl.type = 'password';
    password.inputEl.autocomplete = 'current-password';

    this.statusElement = this.createElement('p', 'admin-editor-status');
    this.statusElement.setAttribute('role', 'status');
    this.appendElement(this.element, this.statusElement);

    const login = this._track(new Button({
      text: 'LOGIN',
      onClick: async () => {
        login.setDisabled(true);
        this._setStatus('Signing in…');
        try {
          await this.onLogin?.(password.getValue());
          this._setStatus('Authenticated.', 'success');
        } catch (error) {
          this._setStatus(error.message || 'Login failed.', 'error');
        } finally {
          login.setDisabled(false);
        }
      },
    }, this.deps));
    this.appendElement(this.element, login.render());

    password.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') login.element.click();
    });
    return this.element;
  }

  destroy() {
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
    this.appendElement(this.element, this._track(new Heading({ level: 1, content: 'ADMIN' }, this.deps)).render());
    this.appendElement(this.element, this._track(new Paragraph({
      content: 'Authenticated SiteBoy content management. Gallery editing is active; the remaining editors are staged behind their own validation work.',
    }, this.deps)).render());

    for (const section of this.sections) {
      const row = this._track(new Paragraph({
        content: `${section.title}${section.available ? '' : ' — PLANNED'}`,
        isClickable: true,
        onClick: () => this.onNavigate?.(section.route.replace(/^admin\//, '')),
      }, this.deps));
      const rowElement = row.render();
      rowElement.classList.add('admin-section-row');
      rowElement.dataset.available = String(section.available);
      this.appendElement(this.element, rowElement);
    }

    this.appendElement(this.element, this._track(new Button({
      text: 'LOGOUT',
      onClick: () => this.onLogout?.(),
    }, this.deps)).render());
    return this.element;
  }

  destroy() {
    this.tracked = [];
    super.destroy();
  }
}

class AdminPlaceholderView extends BaseComponent {
  constructor(subsection, entry, options = {}, deps = {}) {
    super({ componentType: 'admin-placeholder' }, deps);
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
    this.appendElement(this.element, this._track(new Heading({
      level: 1,
      content: this.entry?.title || this.subsection.toUpperCase(),
    }, this.deps)).render());
    this.appendElement(this.element, this._track(new Paragraph({
      content: this.entry
        ? `${this.entry.title} is not yet an operational editor. Its database API remains available for later UI work.`
        : 'Unknown admin route.',
    }, this.deps)).render());
    this.appendElement(this.element, this._track(new Paragraph({
      content: '← BACK TO ADMIN',
      isClickable: true,
      onClick: () => this.onNavigate?.(null),
    }, this.deps)).render());
    return this.element;
  }

  destroy() {
    this.tracked = [];
    super.destroy();
  }
}

const AdminSection = {
  version: '2.0.0',
  currentContainer: null,
  componentInstances: [],
  navigationCallbacks: null,
  _view: null,

  EDITABLE_SECTIONS: [
    { id: 'gallery', title: 'GALLERY', route: 'admin/gallery', available: true },
    { id: 'projects', title: 'PROJECTS', route: 'admin/projects', available: false },
    { id: 'store', title: 'STORE SKUS', route: 'admin/store', available: false },
    { id: 'notes', title: 'NOTES', route: 'admin/notes', available: false },
    { id: 'blog', title: 'BLOG POSTS', route: 'admin/blog', available: false },
    { id: 'about', title: 'ABOUT', route: 'admin/about', available: false },
  ],

  get pages() {
    return ['#admin', ...this.EDITABLE_SECTIONS.map((section) => `#${section.route}`)];
  },

  async handleRoute(subsection, container, callbacks = {}) {
    this.currentContainer = container;
    this.navigationCallbacks = callbacks;
    this.cleanup();
    window.NavigationController.setupNavigation('admin', subsection, this.pages, callbacks);

    await Auth.bootstrap();
    if (!Auth.isAuthenticated()) {
      this._mountLogin(subsection);
      return;
    }

    if (!subsection) this._mountIndex();
    else this._mountSub(subsection);
  },

  _deps() {
    return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
  },

  _mountLogin(returnSubsection = null) {
    this._view = new AdminLoginView({
      onLogin: async (password) => {
        if (!password) throw new Error('Password required.');
        await Auth.login(password);
        await this.handleRoute(returnSubsection, this.currentContainer, this.navigationCallbacks);
      },
    }, this._deps());
    BaseComponent.mountSectionView(this.currentContainer, this._view);
    this.componentInstances = this._view.tracked;
  },

  _mountIndex() {
    this._view = new AdminIndexView(this.EDITABLE_SECTIONS, {
      onNavigate: (subsection) => this._navigate(subsection),
      onLogout: async () => {
        await Auth.logout();
        this._mountLogin();
      },
    }, this._deps());
    BaseComponent.mountSectionView(this.currentContainer, this._view);
    this.componentInstances = this._view.tracked;
  },

  _mountSub(subsection) {
    const entry = this.EDITABLE_SECTIONS.find((section) => section.route === `admin/${subsection}`);
    if (entry?.id === 'gallery') {
      this._view = new GalleryEditor({}, this._deps());
      BaseComponent.mountSectionView(this.currentContainer, this._view);
      this.componentInstances = [];
      return;
    }

    this._view = new AdminPlaceholderView(subsection, entry, {
      onNavigate: (sub) => this._navigate(sub),
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
    if (this._view) {
      this._view.destroy();
      this._view = null;
    }
    if (this.currentContainer) {
      BaseComponent.clearSectionContainer(this.currentContainer, [
        'admin-section',
        'admin-section-login',
        'admin-section-index',
        'admin-section-sub',
        'toc-container',
      ]);
    }
    this.componentInstances = [];
  },
};

window.AdminSection = AdminSection;
window.debugLog('INIT', `AdminSection v${AdminSection.version} loaded`);

export { AdminSection, AdminLoginView, AdminIndexView, AdminPlaceholderView };
