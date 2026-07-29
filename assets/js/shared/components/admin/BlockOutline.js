/**
 * BlockOutline — list parseBlockDocument block/warning nodes.
 * onJump(line); edit via BlockForm then onApply(node, props).
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Heading } from '../../content.js';
import { parseBlockDocument } from '../../algorithms/markup/block-parser.js';
import { BlockForm } from './BlockForm.js';

export class BlockOutline extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ ...options, componentType: 'block-outline' }, deps);
    this.source = options.source ?? '';
    this.onJump = options.onJump ?? (() => {});
    this.onApply = options.onApply ?? (() => {});
    this.editingIndex = null;
    this.tracked = [];
    this._list = null;
  }

  _track(component) {
    this.tracked.push(component);
    this.children.add(component);
    return component;
  }

  setSource(source) {
    this.source = source ?? '';
    if (this.element) this._renderList();
  }

  render() {
    if (this.element) return this.element;
    this.element = this.createElement('div', 'admin-block-outline');

    const title = this._track(new Heading({ level: 3, content: 'BLOCK OUTLINE' }, this.deps));
    this.appendElement(this.element, title.render());

    this._list = this.createElement('div', 'admin-block-outline-list');
    this.appendElement(this.element, this._list);
    this._formHost = this.createElement('div', 'admin-block-outline-form');
    this.appendElement(this.element, this._formHost);

    this._renderList();
    return this.element;
  }

  _outlineNodes() {
    const doc = parseBlockDocument(this.source);
    return doc.nodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => node.kind === 'block' || node.kind === 'warning');
  }

  _clearForm() {
    while (this._formHost?.firstChild) this._formHost.removeChild(this._formHost.firstChild);
    for (const component of [...this.tracked]) {
      if (component instanceof BlockForm) {
        this.children.delete(component);
        component.destroy?.();
      }
    }
    this.tracked = this.tracked.filter((c) => !(c instanceof BlockForm));
    this.editingIndex = null;
  }

  _renderList() {
    if (!this._list) return;
    while (this._list.firstChild) this._list.removeChild(this._list.firstChild);

    const entries = this._outlineNodes();
    if (!entries.length) {
      const empty = this.createElement('p', 'admin-block-outline-empty', 'No block fences in source.');
      this.appendElement(this._list, empty);
      return;
    }

    for (const { node, index } of entries) {
      const row = this.createElement('button', 'admin-block-outline-row');
      row.type = 'button';
      if (node.kind === 'warning') row.classList.add('is-warning');
      const type = (node.type || node.blockType || node.code || 'warning').toString().toUpperCase();
      const line = node.line ?? '?';
      row.textContent = `${type} · LINE ${line}`;
      row.addEventListener('click', () => {
        this.onJump(node.line);
        if (node.kind === 'block') this._openEditor(node, index);
      });
      this.appendElement(this._list, row);
    }
  }

  _openEditor(node, index) {
    this._clearForm();
    this.editingIndex = index;
    const form = this._track(new BlockForm({
      blockType: node.type,
      props: node.props || {},
      submitLabel: 'SPLICE INTO SOURCE',
      onSubmit: (props) => {
        this.onApply(node, props);
        this._clearForm();
      },
      onCancel: () => this._clearForm(),
    }, this.deps));
    this.appendElement(this._formHost, form.render());
  }

  destroy() {
    this.tracked = [];
    this._list = null;
    this._formHost = null;
    super.destroy();
  }
}
