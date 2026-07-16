import { pklContentProvider } from './pkl-content-provider.js';

const RELATIONSHIP_GROUPS = [
  { key: 'concepts', label: 'RELATED CONCEPTS', types: new Set(['concept', 'theory']) },
  { key: 'methods', label: 'METHODS AND SYSTEMS', types: new Set(['method', 'algorithm', 'formula', 'module', 'standard']) },
  { key: 'projects', label: 'PROJECTS AND APPLICATIONS', types: new Set(['project', 'idea', 'experiment', 'result']) },
  { key: 'references', label: 'REFERENCES AND FURTHER READING', types: new Set(['reference', 'bibliography', 'subject_research', 'research_note']) },
  { key: 'publications', label: 'PUBLICATIONS', types: new Set(['publication']) },
  { key: 'figures', label: 'FIGURES', types: new Set(['figure']) }
];

const FIGURE_DIRECTIVE_RE = /^::figure\[([^\]]+)\]\s*$/gm;
const UNSAFE_SVG_ELEMENTS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video']);

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

function stripLeadingHeading(markdown) {
  return String(markdown ?? '').replace(/^\s*#\s+[^\n]+\n+/, '');
}

function renderMarkdownSegment(container, markdown, tracker) {
  const content = String(markdown ?? '').trim();
  if (!content) return null;

  if (window.ComponentLibrary?.MarkdownBody) {
    const component = new window.ComponentLibrary.MarkdownBody({ markdownText: content });
    tracker.push(component);
    const element = component.render();
    element.classList.add('pkl-markdown');
    container.appendChild(element);
    return element;
  }

  const fallback = document.createElement('pre');
  fallback.className = 'pkl-markdown-fallback';
  fallback.textContent = content;
  container.appendChild(fallback);
  return fallback;
}

function sanitiseSvg(svgText) {
  const parsed = new DOMParser().parseFromString(String(svgText), 'image/svg+xml');
  if (parsed.querySelector('parsererror') || parsed.documentElement.localName.toLowerCase() !== 'svg') {
    return null;
  }

  for (const element of [...parsed.querySelectorAll('*')]) {
    if (UNSAFE_SVG_ELEMENTS.has(element.localName.toLowerCase())) {
      element.remove();
      continue;
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if ((name === 'href' || name.endsWith(':href')) && !value.startsWith('#')) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (value.includes('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  const svg = document.importNode(parsed.documentElement, true);
  svg.classList.add('pkl-inline-svg');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  return svg;
}

function renderFigureObject(container, figureObject, { embedded = false } = {}) {
  const figure = document.createElement('figure');
  figure.className = embedded ? 'pkl-figure-stage pkl-figure-embedded' : 'pkl-figure-stage';
  figure.dataset.figureUid = figureObject.uid;

  const label = document.createElement('div');
  label.className = 'pkl-figure-label';
  label.appendChild(publicLink(figureObject, { text: `FIGURE: ${figureObject.title}` }));
  figure.appendChild(label);

  const svg = sanitiseSvg(figureObject.body);
  if (svg) {
    figure.appendChild(svg);
  } else {
    const body = document.createElement('div');
    body.className = 'pkl-figure-content';
    renderMarkdownSegment(body, stripLeadingHeading(figureObject.body), []);
    figure.appendChild(body);
  }

  if (figureObject.summary) {
    const caption = document.createElement('figcaption');
    caption.textContent = figureObject.summary;
    figure.appendChild(caption);
  }
  container.appendChild(figure);
  return figure;
}

function renderMissingFigure(container, uid) {
  const notice = document.createElement('aside');
  notice.className = 'pkl-version-notice';
  notice.textContent = `Figure ${uid} is referenced but unavailable in this public graph revision.`;
  container.appendChild(notice);
}

function renderMarkdown(container, markdown, tracker, { stripTitle = true, hydrateFigures = true } = {}) {
  const source = stripTitle ? stripLeadingHeading(markdown) : String(markdown ?? '');
  if (!hydrateFigures) return renderMarkdownSegment(container, source, tracker);

  let cursor = 0;
  let match;
  FIGURE_DIRECTIVE_RE.lastIndex = 0;
  while ((match = FIGURE_DIRECTIVE_RE.exec(source)) !== null) {
    renderMarkdownSegment(container, source.slice(cursor, match.index), tracker);
    const uid = match[1].trim();
    const figureObject = pklContentProvider.getObject(uid);
    if (figureObject?.object_type === 'figure') {
      renderFigureObject(container, figureObject, { embedded: true });
    } else {
      renderMissingFigure(container, uid);
    }
    cursor = FIGURE_DIRECTIVE_RE.lastIndex;
  }
  return renderMarkdownSegment(container, source.slice(cursor), tracker);
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
  renderFigureObject,
  renderHistory,
  renderMarkdown,
  renderObjectList,
  renderRelatedSections,
  renderRevisionNavigation,
  renderTags,
  routeLink,
  sanitiseSvg,
  stripLeadingHeading
};
