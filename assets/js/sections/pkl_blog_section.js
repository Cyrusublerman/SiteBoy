import { pklContentProvider } from '../shared/pkl-content-provider.js';
import {
  createHeading,
  createMetaLine,
  formatLabel,
  parseVersionedSubsection,
  renderError,
  renderHistory,
  renderMarkdown,
  renderRelatedSections,
  renderRevisionNavigation,
  renderTags,
  routeLink
} from '../shared/pkl-public-ui.js';

const LegacyBlogSection = window.BlogSection;

const PKLBlogSection = {
  version: '0.1.0',
  currentContainer: null,
  componentInstances: [],
  navigationCallbacks: null,
  delegatedLegacy: false,

  async handleRoute(subsection, container, callbacks = {}) {
    this.cleanup();
    this.currentContainer = container;
    this.navigationCallbacks = callbacks;
    container.className = 'pkl-public pkl-blog';

    try {
      await pklContentProvider.load();
      if (!subsection) {
        this.renderIndex();
        return;
      }

      const parsed = parseVersionedSubsection('blog', subsection);
      const object = pklContentProvider.getByRoute(parsed.route);
      if (!object && LegacyBlogSection && subsection.startsWith('docs/')) {
        this.delegatedLegacy = true;
        await LegacyBlogSection.handleRoute(subsection, container, callbacks);
        return;
      }
      if (!object || object.object_type !== 'publication') {
        renderError(container, 'BLOG POST NOT FOUND', `No publication resolves to ${parsed.route}.`);
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
        this.renderPost(revision, { current: object, historical: true });
        return;
      }

      this.renderPost(object, { current: object, historical: false });
    } catch (error) {
      console.error('PKL Blog failed:', error);
      renderError(container, 'BLOG ERROR', error.message);
    }
  },

  publications() {
    return pklContentProvider.list({ objectType: 'publication', sort: 'updated' });
  },

  renderIndex() {
    const container = this.currentContainer;
    container.innerHTML = '';
    container.appendChild(createHeading(1, 'BLOG'));

    const publications = this.publications();
    container.appendChild(createMetaLine([
      `${publications.length} publications`,
      'Alexander Einoder',
      'RSS · ATOM · JSON FEED planned'
    ]));

    const navigation = document.createElement('nav');
    navigation.className = 'pkl-blog-navigation';
    navigation.appendChild(routeLink('/wiki', 'WIKI'));
    const legacy = document.createElement('a');
    legacy.href = '/#blog';
    legacy.textContent = 'LEGACY DOCUMENTATION';
    navigation.appendChild(legacy);
    container.appendChild(navigation);

    if (!publications.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No public publication objects have been synchronised yet.';
      container.appendChild(empty);
      return;
    }

    let currentYear = null;
    for (const publication of publications) {
      const year = String(publication.created || publication.updated || '').slice(0, 4) || 'UNDATED';
      if (year !== currentYear) {
        currentYear = year;
        container.appendChild(createHeading(2, year));
      }

      const article = document.createElement('article');
      article.className = 'pkl-blog-entry';
      const heading = createHeading(2, '');
      heading.appendChild(routeLink(publication.route, publication.title));
      article.appendChild(heading);
      article.appendChild(createMetaLine([
        publication.created ? `Published ${publication.created}` : null,
        publication.updated && publication.updated !== publication.created ? `Modified ${publication.updated}` : null,
        `Revision ${publication.public_revision}`
      ]));
      if (publication.summary) {
        const summary = document.createElement('p');
        summary.className = 'pkl-summary';
        summary.textContent = publication.summary;
        article.appendChild(summary);
      }
      renderMarkdown(article, publication.body, this.componentInstances);
      const permanent = document.createElement('p');
      permanent.className = 'pkl-permalink';
      permanent.appendChild(routeLink(publication.route, 'PERMANENT LINK'));
      article.appendChild(permanent);
      container.appendChild(article);
    }
  },

  renderPost(object, { current, historical }) {
    const container = this.currentContainer;
    container.innerHTML = '';

    const back = document.createElement('nav');
    back.className = 'pkl-blog-navigation';
    back.appendChild(routeLink('/blog', 'BLOG INDEX'));
    back.appendChild(routeLink('/wiki', 'WIKI'));
    container.appendChild(back);

    if (historical) {
      const notice = document.createElement('aside');
      notice.className = 'pkl-version-notice';
      notice.append(`HISTORICAL REVISION ${object.public_revision}. `);
      notice.appendChild(routeLink(current.route, 'VIEW CURRENT VERSION'));
      container.appendChild(notice);
    }

    const article = document.createElement('article');
    article.className = 'pkl-blog-post';
    article.appendChild(createHeading(1, object.title));
    article.appendChild(createMetaLine([
      'Alexander Einoder',
      object.created ? `Published ${object.created}` : null,
      object.updated && object.updated !== object.created ? `Modified ${object.updated}` : null,
      `Revision ${object.public_revision}`,
      'All rights reserved'
    ]));
    if (object.summary) {
      const summary = document.createElement('p');
      summary.className = 'pkl-summary';
      summary.textContent = object.summary;
      article.appendChild(summary);
    }
    renderMarkdown(article, object.body, this.componentInstances);
    renderTags(article, object.tags);
    renderRelatedSections(article, object);
    renderRevisionNavigation(article, current, current.route);
    container.appendChild(article);
  },

  cleanup() {
    if (this.delegatedLegacy && LegacyBlogSection?.cleanup) {
      LegacyBlogSection.cleanup();
    }
    this.delegatedLegacy = false;
    if (this.currentContainer) this.currentContainer.innerHTML = '';
    if (window.ComponentLibrary?.destroyTracked) {
      window.ComponentLibrary.destroyTracked(this.componentInstances);
    }
    this.componentInstances = [];
    this.currentContainer = null;
  },

  getSectionInfo() {
    return {
      name: 'blog',
      title: 'BLOG',
      totalPublications: pklContentProvider.graph ? this.publications().length : 0
    };
  }
};

window.PKLBlogSection = PKLBlogSection;

export { PKLBlogSection };
