import { pklContentProvider } from '../shared/pkl-content-provider.js';
import {
  createHeading,
  createMetaLine,
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
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-AU', { month: 'long', timeZone: 'Australia/Melbourne' });

function publicationDate(publication) {
  const parsed = new Date(publication.created || publication.updated || 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKey(publication) {
  const date = publicationDate(publication);
  if (!date) return { year: 'UNDATED', month: '00', label: 'Undated' };
  const parts = new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Australia/Melbourne'
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? 'UNDATED';
  const month = parts.find((part) => part.type === 'month')?.value ?? '00';
  return { year, month, label: `${MONTH_FORMATTER.format(date)} ${year}` };
}

function feedLink(href, text, type) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  if (type) link.type = type;
  return link;
}

const PKLBlogSection = {
  version: '0.2.0',
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
      if (subsection.startsWith('archive/')) {
        const [, year, month] = subsection.split('/');
        this.renderIndex({ year: year || null, month: month || null });
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

  renderFeedNavigation(container) {
    const navigation = document.createElement('nav');
    navigation.className = 'pkl-blog-navigation';
    navigation.appendChild(routeLink('/wiki', 'WIKI'));
    navigation.appendChild(feedLink('/rss.xml', 'RSS', 'application/rss+xml'));
    navigation.appendChild(feedLink('/atom.xml', 'ATOM', 'application/atom+xml'));
    navigation.appendChild(feedLink('/feed.json', 'JSON FEED', 'application/feed+json'));
    const legacy = document.createElement('a');
    legacy.href = '/#blog';
    legacy.textContent = 'LEGACY DOCUMENTATION';
    navigation.appendChild(legacy);
    container.appendChild(navigation);
  },

  renderArchiveNavigation(container, publications) {
    const groups = new Map();
    for (const publication of publications) {
      const key = monthKey(publication);
      const id = `${key.year}/${key.month}`;
      const value = groups.get(id) ?? { ...key, count: 0 };
      value.count += 1;
      groups.set(id, value);
    }
    if (!groups.size) return;

    const archive = document.createElement('section');
    archive.className = 'pkl-blog-archive-navigation';
    archive.appendChild(createHeading(2, 'ARCHIVE'));
    const list = document.createElement('ul');
    list.className = 'pkl-link-list';
    for (const value of [...groups.values()].sort((a, b) => `${b.year}${b.month}`.localeCompare(`${a.year}${a.month}`))) {
      const item = document.createElement('li');
      item.appendChild(routeLink(`/blog/archive/${value.year}/${value.month}`, `${value.label} (${value.count})`));
      list.appendChild(item);
    }
    archive.appendChild(list);
    container.appendChild(archive);
  },

  renderIndex({ year = null, month = null } = {}) {
    const container = this.currentContainer;
    container.innerHTML = '';
    const allPublications = this.publications();
    const publications = allPublications.filter((publication) => {
      const key = monthKey(publication);
      if (year && key.year !== year) return false;
      if (month && key.month !== month) return false;
      return true;
    });

    const archiveTitle = year
      ? month
        ? monthKey(publications[0] ?? { created: `${year}-${month}-01` }).label
        : year
      : null;
    container.appendChild(createHeading(1, archiveTitle ? `BLOG — ${archiveTitle.toUpperCase()}` : 'BLOG'));
    container.appendChild(createMetaLine([
      `${publications.length} publications`,
      'Alexander Einoder',
      archiveTitle ? 'Archive view' : null
    ]));

    this.renderFeedNavigation(container);
    if (archiveTitle) {
      const back = document.createElement('p');
      back.className = 'pkl-permalink';
      back.appendChild(routeLink('/blog', 'BACK TO CURRENT BLOG'));
      container.appendChild(back);
    }

    if (!publications.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No public publication objects match this archive.';
      container.appendChild(empty);
      this.renderArchiveNavigation(container, allPublications);
      return;
    }

    let currentMonth = null;
    for (const publication of publications) {
      const key = monthKey(publication);
      const keyId = `${key.year}/${key.month}`;
      if (keyId !== currentMonth) {
        currentMonth = keyId;
        const heading = createHeading(2, '');
        heading.appendChild(routeLink(`/blog/archive/${key.year}/${key.month}`, key.label.toUpperCase()));
        container.appendChild(heading);
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

    this.renderArchiveNavigation(container, allPublications);
  },

  renderPost(object, { current, historical }) {
    const container = this.currentContainer;
    container.innerHTML = '';

    const back = document.createElement('nav');
    back.className = 'pkl-blog-navigation';
    back.appendChild(routeLink('/blog', 'BLOG INDEX'));
    back.appendChild(routeLink('/wiki', 'WIKI'));
    back.appendChild(feedLink('/rss.xml', 'RSS', 'application/rss+xml'));
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
      object.author || 'Alexander Einoder',
      object.created ? `Published ${object.created}` : null,
      object.updated && object.updated !== object.created ? `Modified ${object.updated}` : null,
      `Revision ${object.public_revision}`,
      object.rights?.licence === 'all_rights_reserved' ? 'All rights reserved' : null
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
