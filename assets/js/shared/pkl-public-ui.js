import { pklContentProvider } from './pkl-content-provider.js';

const RELATIONSHIP_GROUPS = [
  { key: 'concepts', label: 'RELATED CONCEPTS', types: new Set(['concept', 'theory']) },
  { key: 'methods', label: 'METHODS AND SYSTEMS', types: new Set(['method', 'algorithm', 'formula', 'module', 'standard']) },
  { key: 'projects', label: 'PROJECTS AND APPLICATIONS', types: new Set(['project', 'idea', 'experiment', 'result']) },
  { key: 'references', label: 'REFERENCES AND FURTHER READING', types: new Set(['reference', 'bibliography', 'subject_research', 'research_note']) },
  { key: 'publications', label: 'PUBLICATIONS', types: new Set(['publication']) },
  { key: 'figures', label: 'FIGURES', types: new Set(['figure']) }
];

function formatLabel(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function routeParts(route) {
  const parts = String(route).replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return { section: parts[0] || 'home', subsection: parts.slice(1).join('/') || null };
}

function navigateRoute(route) {
  const { section, subsection } = routeParts(route);
  window.Router.navigateToSection(section, subsection);
}

function publicLink(object, { text = object.title, className = '' } = {}) {
  const link = document.createElement('a');
  link.href = object.route;
  link.textContent = text;
  if (className) link.className = className;
  link.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateRoute(object.route);
  });
  return link;
}

function routeLink(route, text, className = '') {
  const link = document.createElement('a');
  link.href = route;
  link.textContent = text;
  if (className) link.className = className;
  link.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateRoute(route);
  });
  return link;
}

function createHeading(level, text) {
  const heading = document.createElement(`h${level}`);
  heading.textContent = text;
  heading.className = `pkl-heading pkl-heading-${level}`;
  return heading;
}

function createMetaLine(values) {
  const paragraph = document.createElement('p');
  paragraph.className = 'pkl-meta';
  paragraph.textContent = values.filter(Boolean).join(' · ');
  return paragraph;
}

function renderMarkdown(container, markdown, tracker) {
  if (window.ComponentLibrary?.MarkdownBody) {
    const component = new window.ComponentLibrary.MarkdownBody({ markdownText: markdown || '' });
    tracker.push(component);
    const element = component.render();
    element.classList.add('pkl-markdown');
    container.appendChild(element);
    return element;
  }
  const fallback = document.createElement('pre');
  fallback.className = 'pkl-markdown-fallback';
  fallback.textContent = markdown || '';
  container.appendChild(fallback);
  return fallback;
}

function groupRelated(object) {
  const grouped = new Map(RELATIONSHIP_GROUPS.map((group) => [group.key, []]));
  grouped.set('other', []);
  const seen = new Set();

  for (const entry of pklContentProvider.getRelated(object.uid)) {
    if (seen.has(entry.object.uid)) continue;
    seen.add(entry.object.uid);
    const group = RELATIONSHIP_GROUPS.find((candidate) => candidate.types.has(entry.object.object_type));
    grouped.get(group?.key ?? 'other').push(entry);
  }

  for (const source of object.sources ?? []) {
    const target = pklContentProvider.getObject(typeof source === 'string' ? source : source.source);
    if (!target || seen.has(target.uid)) continue;
    seen.add(target.uid);
    grouped.get('references').push({ relationship: { type: 'source' }, object: target });
  }

  return grouped;
}

function renderObjectList(container, objects, { empty = 'No entries.' } = {}) {
  if (!objects.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = empty;
    container.appendChild(paragraph);
    return;
  }
  const list = document.createElement('ul');
  list.className = 'pkl-link-list';
  for (const object of objects) {
    const item = document.createElement('li');
    item.appendChild(publicLink(object));
    if (object.summary) {
      const summary = document.createElement('span');
      summary.className = 'pkl-link-summary';
      summary.textContent = ` — ${object.summary}`;
      item.appendChild(summary);
    }
    list.appendChild(item);
  }
  container.appendChild(list);
}

function renderRelatedSections(container, object) {
  const grouped = groupRelated(object);
  for (const definition of RELATIONSHIP_GROUPS) {
    const values = grouped.get(definition.key) ?? [];
    if (!values.length) continue;
    const section = document.createElement('section');
    section.className = 'pkl-related-section';
    section.appendChild(createHeading(2, definition.label));
    renderObjectList(section, values.map((entry) => entry.object));
    container.appendChild(section);
  }

  const other = grouped.get('other') ?? [];
  if (other.length) {
    const section = document.createElement('section');
    section.className = 'pkl-related-section';
    section.appendChild(createHeading(2, 'RELATED'));
    renderObjectList(section, other.map((entry) => entry.object));
    container.appendChild(section);
  }

  const backlinks = pklContentProvider.getBacklinks(object.uid);
  if (backlinks.length) {
    const section = document.createElement('section');
    section.className = 'pkl-related-section';
    section.appendChild(createHeading(2, 'REFERENCED BY'));
    renderObjectList(section, backlinks);
    container.appendChild(section);
  }
}

function renderTags(container, tags = []) {
  if (!tags.length) return;
  const paragraph = document.createElement('p');
  paragraph.className = 'pkl-tags';
  paragraph.append('TAGS: ');
  tags.forEach((tag, index) => {
    if (index) paragraph.append(' · ');
    const span = document.createElement('span');
    span.textContent = tag;
    paragraph.appendChild(span);
  });
  container.appendChild(paragraph);
}

function renderRevisionNavigation(container, object, baseRoute) {
  const navigation = document.createElement('nav');
  navigation.className = 'pkl-revision-navigation';
  navigation.appendChild(routeLink(`${baseRoute}/history`, `VERSION HISTORY (${object.public_revision})`));
  container.appendChild(navigation);
}

function renderHistory(container, object, baseRoute) {
  container.appendChild(createHeading(1, `${object.title} — VERSION HISTORY`));
  container.appendChild(createMetaLine([formatLabel(object.object_type), `Current revision ${object.public_revision}`]));
  const list = document.createElement('ol');
  list.className = 'pkl-history-list';
  for (const revision of pklContentProvider.revisionNumbers(object.uid).reverse()) {
    const item = document.createElement('li');
    const label = revision === object.public_revision ? `Revision ${revision} (current)` : `Revision ${revision}`;
    item.appendChild(routeLink(`${baseRoute}/revisions/${revision}`, label));
    list.appendChild(item);
  }
  container.appendChild(list);
  container.appendChild(routeLink(baseRoute, 'BACK TO CURRENT VERSION', 'pkl-back-link'));
}

function parseVersionedSubsection(section, subsection) {
  const segments = String(subsection ?? '').split('/').filter(Boolean);
  const historyIndex = segments.lastIndexOf('history');
  if (historyIndex === segments.length - 1 && historyIndex > 0) {
    return { route: `/${section}/${segments.slice(0, -1).join('/')}`, mode: 'history', revision: null };
  }
  const revisionsIndex = segments.lastIndexOf('revisions');
  if (revisionsIndex > 0 && revisionsIndex === segments.length - 2) {
    const revision = Number(segments.at(-1));
    return { route: `/${section}/${segments.slice(0, revisionsIndex).join('/')}`, mode: 'revision', revision };
  }
  return { route: `/${section}${segments.length ? '/' + segments.join('/') : ''}`, mode: 'current', revision: null };
}

function renderError(container, title, message) {
  container.innerHTML = '';
  container.className = 'pkl-public';
  container.appendChild(createHeading(1, title));
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  container.appendChild(paragraph);
}

export {
  RELATIONSHIP_GROUPS,
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
};
