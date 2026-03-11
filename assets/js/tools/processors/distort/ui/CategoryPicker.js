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
      height: 100%;
      min-height: 0;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
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

    const close = this.createElement('button', 'distort-picker-close', '× CLOSE');
    close.type = 'button';
    close.style.cssText = `
      width: ${F * 7}px;
      height: 100%;
      border: none;
      border-right: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    close.addEventListener('mouseenter', () => {
      close.style.background = 'var(--c-text)';
      close.style.color = 'var(--c-bg)';
    });
    close.addEventListener('mouseleave', () => {
      close.style.background = 'var(--c-bg)';
      close.style.color = 'var(--c-text)';
    });
    close.addEventListener('click', () => this._onClose?.());

    this._searchInput = this.createElement('input', 'distort-picker-search');
    this._searchInput.type = 'text';
    this._searchInput.placeholder = 'FILTER MODULES';
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

    row.append(close, this._searchInput);
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
        color: var(--c-border);
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
        const item = this.createElement('button', 'distort-picker-item', entry.label.toUpperCase());
        item.type = 'button';
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
          font-size: ${F * 0.85}px;
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
        text-align: center;
      `;
      this._listEl.appendChild(empty);
    }
  }

  focus() {
    this._searchInput?.focus?.();
  }
}
