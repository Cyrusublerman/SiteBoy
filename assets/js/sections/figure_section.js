import { pklContentProvider } from '../shared/pkl-content-provider.js';
import {
  createHeading,
  createMetaLine,
  formatLabel,
  parseVersionedSubsection,
  renderError,
  renderHistory,
  renderMarkdown,
  renderObjectList,
  renderRelatedSections,
  renderRevisionNavigation,
  routeLink
} from '../shared/pkl-public-ui.js';

const FigureSection = {
  version: '0.1.0',
  currentContainer: null,
  componentInstances: [],

  async handleRoute(subsection, container) {
    this.cleanup();
    this.currentContainer = container;
    container.className = 'pkl-public pkl-figures';

    try {
      await pklContentProvider.load();
      if (!subsection) {
        this.renderIndex();
        return;
      }

      const parsed = parseVersionedSubsection('figures', subsection);
      const object = pklContentProvider.getByRoute(parsed.route);
      if (!object || object.object_type !== 'figure') {
        renderError(container, 'FIGURE NOT FOUND', `No figure resolves to ${parsed.route}.`);
        return;
      }
      if (parsed.mode === 'history') {
        renderHistory(container, object, parsed.route);
        return;
      }
      if (parsed.mode === 'revision') {
        const revision = await pklContentProvider.getRevision(object.uid, parsed.revision);
        if (!revision) {
          renderError(container, 'REVISION NOT FOUND', `Revision ${parsed.revision} is not available for ${object.title}.`);
          return;
        }
        this.renderFigure(revision, { current: object, historical: true });
        return;
      }
      this.renderFigure(object, { current: object, historical: false });
    } catch (error) {
      console.error('PKL Figures failed:', error);
      renderError(container, 'FIGURE ERROR', error.message);
    }
  },

  figures() {
    return pklContentProvider.list({ objectType: 'figure' });
  },

  renderIndex() {
    const container = this.currentContainer;
    container.innerHTML = '';
    container.appendChild(createHeading(1, 'FIGURES'));
    container.appendChild(createMetaLine([`${this.figures().length} reusable figure records`]));
    const navigation = document.createElement('nav');
    navigation.className = 'pkl-blog-navigation';
    navigation.appendChild(routeLink('/wiki', 'WIKI'));
    navigation.appendChild(routeLink('/blog', 'BLOG'));
    container.appendChild(navigation);
    renderObjectList(container, this.figures(), { empty: 'No public figure records have been synchronised yet.' });
  },

  renderFigure(object, { current, historical }) {
    const container = this.currentContainer;
    container.innerHTML = '';
    const navigation = document.createElement('nav');
    navigation.className = 'pkl-blog-navigation';
    navigation.appendChild(routeLink('/figures', 'FIGURE INDEX'));
    navigation.appendChild(routeLink('/wiki', 'WIKI'));
    container.appendChild(navigation);

    if (historical) {
      const notice = document.createElement('aside');
      notice.className = 'pkl-version-notice';
      notice.append(`HISTORICAL REVISION ${object.public_revision}. `);
      notice.appendChild(routeLink(current.route, 'VIEW CURRENT VERSION'));
      container.appendChild(notice);
    }

    container.appendChild(createHeading(1, object.title));
    container.appendChild(createMetaLine([
      formatLabel(object.object_type),
      object.updated ? `Updated ${object.updated}` : null,
      `Revision ${object.public_revision}`
    ]));
    if (object.summary) {
      const summary = document.createElement('p');
      summary.className = 'pkl-summary';
      summary.textContent = object.summary;
      container.appendChild(summary);
    }

    const stage = document.createElement('figure');
    stage.className = 'pkl-figure-stage';
    stage.setAttribute('aria-label', object.title);
    const placeholder = document.createElement('div');
    placeholder.className = 'pkl-figure-placeholder';
    placeholder.textContent = 'FIGURE RENDERER ADAPTER OUTPUT';
    stage.appendChild(placeholder);
    if (object.summary) {
      const caption = document.createElement('figcaption');
      caption.textContent = object.summary;
      stage.appendChild(caption);
    }
    container.appendChild(stage);

    renderMarkdown(container, object.body, this.componentInstances);
    renderRelatedSections(container, object);
    renderRevisionNavigation(container, current, current.route);
  },

  cleanup() {
    if (this.currentContainer) this.currentContainer.innerHTML = '';
    if (window.ComponentLibrary?.destroyTracked) {
      window.ComponentLibrary.destroyTracked(this.componentInstances);
    }
    this.componentInstances = [];
    this.currentContainer = null;
  }
};

window.FigureSection = FigureSection;

export { FigureSection };
