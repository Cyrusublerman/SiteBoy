import { pklContentProvider } from '../shared/pkl-content-provider.js';
import { renderCslBibliography } from '../shared/pkl-csl-renderer.js';
import {
  createHeading,
  createMetaLine,
  formatLabel,
  navigateRoute,
  parseVersionedSubsection,
  publicLink,
  renderError,
  renderHistory,
  renderMarkdown,
  renderObjectList,
  renderRelatedSections,
  renderRevisionNavigation,
  renderTags,
  routeLink
} from '../shared/pkl-public-ui.js';

const WikiSection = {
  version: '0.2.0',
  currentContainer: null,
  componentInstances: [],
  navigationCallbacks: null,

  async handleRoute(subsection, container, callbacks = {}) {
    this.cleanup();
    this.currentContainer = container;
    this.navigationCallbacks = callbacks;
    container.className = 'pkl-public pkl-wiki';

    try {
      await pklContentProvider.load();
      if (!subsection) {
        this.renderIndex();
        return;
      }
      if (subsection === 'random') {
        this.navigateRandom();
        return;
      }

      const parsed = parseVersionedSubsection('wiki', subsection);
      const object = pklContentProvider.getByRoute(parsed.route);
      if (!object) {
        renderError(container, 'WIKI PAGE NOT FOUND', `No public PKL object resolves to ${parsed.route}.`);
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
        this.renderPage(revision, { current: object, historical: true });
        return;
      }

      this.renderPage(object, { current: object, historical: false });
    } catch (error) {
      console.error('PKL Wiki failed:', error);
      renderError(container, 'WIKI ERROR', error.message);
    }
  },

  wikiObjects() {
    return pklContentProvider.list().filter((object) => object.route.startsWith('/wiki/'));
  },

  renderIndex() {
    const container = this.currentContainer;
    container.innerHTML = '';
    container.appendChild(createHeading(1, 'WIKI'));
    container.appendChild(createMetaLine([
      `${this.wikiObjects().length} pages`,
      `Source ${pklContentProvider.manifest?.source_commit?.slice(0, 12) || 'unavailable'}`
    ]));

    const controls = document.createElement('div');
    controls.className = 'pkl-index-controls';
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'SEARCH WIKI AND BLOG';
    search.setAttribute('aria-label', 'Search Wiki and Blog');
    const random = routeLink('/wiki/random', 'RANDOM PAGE');
    controls.append(search, random);
    container.appendChild(controls);

    const results = document.createElement('section');
    results.className = 'pkl-search-results';
    container.appendChild(results);

    const renderResults = () => {
      results.innerHTML = '';
      const query = search.value.trim();
      if (query) {
        results.appendChild(createHeading(2, `SEARCH: ${query}`));
        renderObjectList(results, pklContentProvider.search(query), { empty: 'No matching public knowledge.' });
        return;
      }

      const groups = new Map();
      for (const object of this.wikiObjects()) {
        const values = groups.get(object.object_type) ?? [];
        values.push(object);
        groups.set(object.object_type, values);
      }
      for (const [objectType, objects] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const section = document.createElement('section');
        section.className = 'pkl-index-group';
        section.appendChild(createHeading(2, formatLabel(objectType).toUpperCase()));
        renderObjectList(section, objects);
        results.appendChild(section);
      }
    };

    search.addEventListener('input', renderResults);
    renderResults();
  },

  navigateRandom() {
    const objects = this.wikiObjects();
    if (!objects.length) {
      renderError(this.currentContainer, 'WIKI EMPTY', 'The public graph contains no Wiki pages yet.');
      return;
    }
    const selected = objects[Math.floor(Math.random() * objects.length)];
    navigateRoute(selected.route);
  },

  renderPage(object, { current, historical }) {
    const container = this.currentContainer;
    container.innerHTML = '';

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

    renderMarkdown(container, object.body, this.componentInstances);
    renderCslBibliography(container, object.citations ?? [], pklContentProvider);
    renderTags(container, object.tags);
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
  },

  getSectionInfo() {
    return {
      name: 'wiki',
      title: 'WIKI',
      totalPages: pklContentProvider.graph ? this.wikiObjects().length : 0
    };
  }
};

window.WikiSection = WikiSection;

export { WikiSection };
