/**
 * InsertToolbar — horizontal partition of insert cells (IMAGE + each block type).
 * Emits onInsert(type) where type is 'image' or a BLOCK_TYPES key.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { BLOCK_TYPE_NAMES } from '../../algorithms/markup/block-types.js';

export class InsertToolbar extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ ...options, componentType: 'insert-toolbar' }, deps);
    this.label = options.label ?? 'INSERT';
    this.types = Array.isArray(options.types) ? options.types : ['image', ...BLOCK_TYPE_NAMES];
    this.onInsert = options.onInsert ?? (() => {});
  }

  render() {
    if (this.element) return this.element;

    this.element = this.createElement('div', 'admin-insert-toolbar');
    const label = this.createElement('span', 'admin-insert-toolbar-label', this.label);
    this.appendElement(this.element, label);

    const cells = this.createElement('div', 'admin-insert-toolbar-cells');
    for (const type of this.types) {
      const cell = this.createElement('button', 'admin-insert-toolbar-cell');
      cell.type = 'button';
      const name = this.createElement('span', 'admin-insert-toolbar-name', String(type).toUpperCase());
      const glyph = this.createElement('span', 'admin-insert-toolbar-glyph', '+');
      this.appendElement(cell, name);
      this.appendElement(cell, glyph);
      cell.addEventListener('click', () => this.onInsert(type));
      this.appendElement(cells, cell);
    }
    this.appendElement(this.element, cells);
    return this.element;
  }
}
