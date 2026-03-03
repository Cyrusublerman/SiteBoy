import { BaseComponent } from '../../../../shared/foundation.js';
import { REGISTRY } from '../nodes/registry.js';

/**
 * CategoryPicker — inline searchable category/module browser.
 *
 * Displays all categories and their modules from REGISTRY.
 * Supports text search filter.
 * Emits onSelect(entry) when a module is clicked.
 */
export class CategoryPicker extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'category-picker', ...options }, deps);
    this._onSelect     = options.onSelect     ?? null;
    this._searchInput  = null;
    this._listEl       = null;
    this._query        = '';
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'display:flex', 'flex-direction:column',
      'background:var(--vga-darkgrey,#222)',
      'border:1px solid var(--vga-grey,#555)',
      'max-height:320px', 'overflow:hidden'
    ].join(';');

    this._buildSearch();
    this._buildList();
    this._renderList('');

    return this;
  }

  _buildSearch() {
    const wrap = this.createElement('div', 'picker-search-wrap');
    wrap.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--vga-grey,#555);flex-shrink:0';

    this._searchInput = this.createElement('input');
    this._searchInput.type = 'text';
    this._searchInput.placeholder = 'SEARCH...';
    this._searchInput.style.cssText = [
      'width:100%', 'background:var(--vga-black,#111)',
      'color:var(--vga-white,#eee)', 'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px',
      'padding:2px 5px', 'box-sizing:border-box'
    ].join(';');
    this._searchInput.addEventListener('input', () => {
      this._query = this._searchInput.value.trim().toLowerCase();
      this._renderList(this._query);
    });

    wrap.appendChild(this._searchInput);
    this.element.appendChild(wrap);
  }

  _buildList() {
    this._listEl = this.createElement('div', 'picker-list');
    this._listEl.style.cssText = 'flex:1;overflow-y:auto';
    this.element.appendChild(this._listEl);
  }

  _renderList(query) {
    this._listEl.innerHTML = '';

    for (const [category, entries] of Object.entries(REGISTRY)) {
      const filtered = query
        ? entries.filter(e => e.label.toLowerCase().includes(query) || category.toLowerCase().includes(query))
        : entries;
      if (!filtered.length) continue;

      const catEl = this.createElement('div', 'picker-category', category.toUpperCase());
      catEl.style.cssText = [
        'padding:3px 8px',
        'font-family:Space Mono,monospace', 'font-size:9px',
        'color:var(--vga-grey,#888)',
        'border-top:1px solid var(--vga-grey,#555)',
        'letter-spacing:1px'
      ].join(';');
      this._listEl.appendChild(catEl);

      for (const entry of filtered) {
        const item = this.createElement('div', 'picker-item', entry.label);
        item.style.cssText = [
          'padding:3px 16px',
          'font-family:Space Mono,monospace', 'font-size:10px',
          'color:var(--vga-white,#eee)', 'cursor:pointer'
        ].join(';');
        item.addEventListener('mouseover', () => { item.style.background = 'var(--vga-grey,#555)'; });
        item.addEventListener('mouseout',  () => { item.style.background = ''; });
        item.addEventListener('click', () => this._onSelect?.(entry));
        this._listEl.appendChild(item);
      }
    }

    if (!this._listEl.children.length) {
      const empty = this.createElement('div', '', 'NO MATCH');
      empty.style.cssText = 'text-align:center;color:var(--vga-grey,#888);font-family:Space Mono,monospace;font-size:9px;padding:12px';
      this._listEl.appendChild(empty);
    }
  }

  focus() {
    this._searchInput?.focus();
  }

  destroy() {
    super.destroy();
  }
}
