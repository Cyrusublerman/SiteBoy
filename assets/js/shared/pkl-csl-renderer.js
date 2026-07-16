import CiteprocPackage from 'citeproc';
import styleXml from '../../csl/siteboy-author-date.csl?raw';
import localeXml from '../../csl/locales-en-US.xml?raw';

const CSL = CiteprocPackage?.default ?? CiteprocPackage;

function issuedDate(value) {
  const year = Number(String(value ?? '').slice(0, 4));
  return Number.isInteger(year) && year > 0 ? { 'date-parts': [[year]] } : undefined;
}

function cslType(object) {
  const map = {
    publication: 'article',
    bibliography: 'webpage',
    reference: 'webpage',
    research_note: 'manuscript',
    subject_research: 'report',
    project: 'report',
  };
  return map[object?.object_type] ?? 'webpage';
}

function normaliseName(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  const text = String(value).trim();
  if (!text) return null;
  const parts = text.split(/\s+/);
  if (parts.length === 1) return { literal: text };
  return { family: parts.pop(), given: parts.join(' ') };
}

export function normaliseCslItem(object) {
  if (!object?.uid) throw new Error('CSL source object requires a uid.');
  const explicit = object.csl && typeof object.csl === 'object' ? object.csl : {};
  const authors = explicit.author ?? object.authors ?? (object.author ? [object.author] : []);
  const author = (Array.isArray(authors) ? authors : [authors]).map(normaliseName).filter(Boolean);
  return {
    id: object.uid,
    type: explicit.type ?? cslType(object),
    title: explicit.title ?? object.title ?? object.uid,
    author,
    issued: explicit.issued ?? issuedDate(object.created ?? object.updated),
    'container-title': explicit['container-title'] ?? object.container_title,
    publisher: explicit.publisher ?? object.publisher,
    URL: explicit.URL ?? object.url ?? object.route,
    ...explicit,
    id: object.uid,
  };
}

function citationItem(citation) {
  const locator = citation?.locator;
  return {
    id: String(citation.source),
    ...(locator?.value != null ? { locator: String(locator.value) } : {}),
    ...(locator?.type ? { label: locator.type } : {}),
    ...(citation.prefix ? { prefix: String(citation.prefix) } : {}),
    ...(citation.suffix ? { suffix: String(citation.suffix) } : {}),
    ...(citation.suppress_author ? { 'suppress-author': true } : {}),
  };
}

export class PklCslRenderer {
  constructor(provider, { style = styleXml, locale = localeXml } = {}) {
    this.provider = provider;
    this.style = style;
    this.locale = locale;
  }

  objectFor(source) {
    return this.provider.getObject(source);
  }

  engine(sourceIds) {
    const items = new Map();
    for (const source of sourceIds) {
      const object = this.objectFor(source);
      if (!object) throw new Error(`Citation source ${source} is unavailable in this graph revision.`);
      items.set(source, normaliseCslItem(object));
    }
    const system = {
      retrieveLocale: () => this.locale,
      retrieveItem: (id) => items.get(id),
    };
    const engine = new CSL.Engine(system, this.style, 'en-US');
    engine.updateItems([...items.keys()]);
    return engine;
  }

  citation(citations) {
    const values = Array.isArray(citations) ? citations : [citations];
    const filtered = values.filter((value) => value?.source);
    if (!filtered.length) return '';
    const engine = this.engine([...new Set(filtered.map((value) => String(value.source)))]);
    return engine.makeCitationCluster(filtered.map(citationItem));
  }

  bibliography(citations) {
    const values = (Array.isArray(citations) ? citations : [citations]).filter((value) => value?.source);
    if (!values.length) return { params: null, entries: [] };
    const ids = [...new Set(values.map((value) => String(value.source)))];
    const engine = this.engine(ids);
    const result = engine.makeBibliography();
    return result ? { params: result[0], entries: result[1] } : { params: null, entries: [] };
  }
}

function safeFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html ?? '');
  for (const element of [...template.content.querySelectorAll('script,style,iframe,object,embed')]) element.remove();
  for (const element of [...template.content.querySelectorAll('*')]) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
    }
  }
  return template.content;
}

export function renderCslCitation(container, citation, provider) {
  const span = document.createElement('span');
  span.className = 'pkl-citation';
  try {
    span.appendChild(safeFragment(new PklCslRenderer(provider).citation(citation)));
  } catch (error) {
    span.classList.add('pkl-citation-error');
    span.textContent = `[Citation unavailable: ${error.message}]`;
  }
  container.appendChild(span);
  return span;
}

export function renderCslBibliography(container, citations, provider) {
  const renderer = new PklCslRenderer(provider);
  const { entries } = renderer.bibliography(citations);
  if (!entries.length) return null;
  const section = document.createElement('section');
  section.className = 'pkl-bibliography';
  const heading = document.createElement('h2');
  heading.className = 'pkl-heading pkl-heading-2';
  heading.textContent = 'REFERENCES';
  section.appendChild(heading);
  const list = document.createElement('div');
  list.className = 'pkl-bibliography-entries';
  for (const entry of entries) {
    const item = document.createElement('div');
    item.className = 'pkl-bibliography-entry';
    item.appendChild(safeFragment(entry));
    list.appendChild(item);
  }
  section.appendChild(list);
  container.appendChild(section);
  return section;
}
