import { BaseComponent } from '../../../../shared/foundation.js';
import { REGISTRY } from '../nodes/registry.js';

export class CategoryPicker extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'category-picker', ...options }, deps);
    this._onSelect = options.onSelect ?? null;
    this._onClose = options.onClose ?? null;
    this._query = '';
    this._listEl = null;
    this._searchInput = null;
    this._collapsed = {};
  }

  render() {
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      flex-direction: column;
      position: absolute;
      inset: 0;
      z-index: 10;
      background: var(--c-bg);
      border-left: 1px solid var(--c-border);
      border-right: 1px solid var(--c-border);
      border-bottom: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    this._buildHeader(F);
    this._buildList();
    this._renderList();
    return this.element;
  }

  _buildHeader(F) {
    const row = this.createElement('div', 'distort-picker-header');
    row.style.cssText = `
      display: flex;
      align-items: center;
      height: ${F * 2}px;
      border-bottom: 1px solid var(--c-border);
      flex-shrink: 0;
    `;

    this._searchInput = this.createElement('input', 'distort-picker-search');
    this._searchInput.type = 'text';
    this._searchInput.placeholder = 'SEARCH';
    this._searchInput.style.cssText = `
      flex: 1;
      height: 100%;
      padding: 0 ${F}px;
      border: none;
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      box-sizing: border-box;
      text-transform: uppercase;
    `;
    this._searchInput.addEventListener('input', () => {
      this._query = this._searchInput.value.trim().toLowerCase();
      this._renderList();
    });

    row.appendChild(this._searchInput);
    this.element.appendChild(row);
  }

  _buildList() {
    this._listEl = this.createElement('div', 'distort-picker-list');
    this._listEl.style.cssText = `
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    `;
    this.element.appendChild(this._listEl);
  }

  _stripModuleSuffix(label) {
    return label.replace(/\s*module\s*$/i, '').replace(/^module\s+/i, '').trim();
  }

  _renderList() {
    while (this._listEl.firstChild) this._listEl.removeChild(this._listEl.firstChild);
    const { F } = this.getF();
    const query = this._query;
    const categories = Object.entries(REGISTRY);

    for (const [category, entries] of categories) {
      const matches = query
        ? entries.filter(entry =>
            entry.label.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query))
        : entries;
      if (!matches.length) continue;

      // Default collapsed unless query is active; preserve user toggle
      if (!(category in this._collapsed) && !query) {
        this._collapsed[category] = true;
      }
      const collapsed = query ? false : !!this._collapsed[category];

      const header = this.createElement('button', 'distort-picker-category');
      header.type = 'button';
      header.textContent = `${collapsed ? '▸' : '▾'} ${category.toUpperCase()}`;
      header.style.cssText = `
        width: 100%;
        height: ${F * 2}px;
        padding: 0 ${F}px;
        border: none;
        border-top: 1px solid var(--c-border);
        background: var(--c-bg);
        color: var(--c-text);
        text-align: left;
        font-family: 'Space Mono', monospace;
        font-size: ${F * 0.75}px;
        text-transform: uppercase;
        cursor: pointer;
        box-sizing: border-box;
      `;
      header.addEventListener('click', () => {
        this._collapsed[category] = !this._collapsed[category];
        this._renderList();
      });
      this._listEl.appendChild(header);

      if (collapsed) continue;

      for (const entry of matches) {
        const displayLabel = this._stripModuleSuffix(entry.label).toUpperCase();
        const item = this.createElement('button', 'distort-picker-item', displayLabel);
        item.type = 'button';
        item.title = entry.description ?? entry.label;
        item.style.cssText = `
          width: 100%;
          height: ${F * 2}px;
          padding: 0 ${F * 2}px;
          border: none;
          border-top: 1px solid var(--c-border);
          background: var(--c-bg);
          color: var(--c-text);
          text-align: left;
          font-family: 'Space Mono', monospace;
          font-size: ${F * 0.75}px;
          text-transform: uppercase;
          cursor: pointer;
          box-sizing: border-box;
        `;
        item.addEventListener('mouseenter', () => {
          item.style.background = 'var(--c-text)';
          item.style.color = 'var(--c-bg)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'var(--c-bg)';
          item.style.color = 'var(--c-text)';
        });
        item.addEventListener('click', () => this._onSelect?.(entry));
        this._listEl.appendChild(item);
      }
    }

    if (!this._listEl.firstChild) {
      const empty = this.createElement('div', 'distort-picker-empty', 'NO MATCH');
      empty.style.cssText = `
        padding: ${F * 2}px ${F}px;
        color: var(--c-border);
        font-family: 'Space Mono', monospace;
        font-size: ${F * 0.75}px;
        text-align: left;
      `;
      this._listEl.appendChild(empty);
    }
  }

  focus() {
    this._searchInput?.focus?.();
  }
}
