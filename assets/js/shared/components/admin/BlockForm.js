/**
 * BlockForm — typed fields from a BLOCK_TYPES prop schema (or a custom schema).
 * Returns props via getProps(); calls onSubmit(props) / onCancel().
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Heading } from '../../content.js';
import { Button } from '../../interactive.js';
import { TextInput } from '../input/TextInput.js';
import { Select } from '../input/Select.js';
import { NumericInput } from '../input/NumericInput.js';
import { ToggleGroup } from '../input/ToggleGroup.js';
import { CanvasSizePair } from '../input/CanvasSizePair.js';
import { BLOCK_TYPES } from '../../algorithms/markup/block-types.js';

function schemaDefaults(schemaProps = {}) {
  const props = {};
  for (const [key, def] of Object.entries(schemaProps)) {
    if (!def || typeof def !== 'object') continue;
    if (def.kind === 'boolean') props[key] = false;
    else if (def.kind === 'integer' || def.kind === 'number') props[key] = def.min ?? 0;
    else if (def.kind === 'enum' && Array.isArray(def.values) && def.values.length) {
      props[key] = def.values[0];
    } else if (def.kind === 'token-set' || def.kind === 'array') props[key] = [];
    else if (def.kind === 'record' || def.kind === 'params') props[key] = {};
    else props[key] = '';
  }
  return props;
}

export class BlockForm extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ ...options, componentType: 'block-form' }, deps);
    this.blockType = options.blockType || options.type || 'collapsible';
    this.schema = options.schema
      || BLOCK_TYPES[this.blockType]?.props
      || {};
    this.initialProps = {
      ...schemaDefaults(this.schema),
      ...(options.props && typeof options.props === 'object' ? options.props : {}),
    };
    this.onSubmit = options.onSubmit ?? (() => {});
    this.onCancel = options.onCancel ?? (() => {});
    this.submitLabel = options.submitLabel || 'APPLY';
    this._fields = new Map();
    this._sizePair = null;
    this.tracked = [];
  }

  _track(component) {
    this.tracked.push(component);
    this.children.add(component);
    return component;
  }

  render() {
    if (this.element) return this.element;
    this.element = this.createElement('div', 'admin-block-form');

    const title = this._track(new Heading({
      level: 3,
      content: `BLOCK · ${String(this.blockType).toUpperCase()}`,
    }, this.deps));
    this.appendElement(this.element, title.render());

    const grid = this.createElement('div', 'admin-editor-form-grid');
    const keys = Object.keys(this.schema);
    const hasWidth = keys.includes('width');
    const hasHeight = keys.includes('height');

    if (hasWidth && hasHeight) {
      this._sizePair = this._track(new CanvasSizePair({
        title: 'SIZE',
        width: Number(this.initialProps.width) || 512,
        height: Number(this.initialProps.height) || 512,
      }, this.deps));
      this.appendElement(grid, this._sizePair.render());
    }

    for (const [key, def] of Object.entries(this.schema)) {
      if ((key === 'width' || key === 'height') && this._sizePair) continue;
      this._mountField(grid, key, def, this.initialProps[key]);
    }
    this.appendElement(this.element, grid);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.appendElement(actions, this._track(new Button({
      text: this.submitLabel,
      onClick: () => {
        try {
          this.onSubmit(this.getProps());
        } catch (error) {
          console.error('BlockForm submit failed:', error);
        }
      },
    }, this.deps)).render());
    this.appendElement(actions, this._track(new Button({
      text: 'CANCEL',
      onClick: () => this.onCancel(),
    }, this.deps)).render());
    this.appendElement(this.element, actions);

    return this.element;
  }

  _mountField(parent, key, def, value) {
    const kind = def?.kind || 'text';
    const label = String(key).toUpperCase();

    if (kind === 'boolean') {
      const toggle = this._track(new ToggleGroup({
        label,
        exclusive: true,
        layout: 'row',
        items: [
          { value: 'true', label: 'TRUE' },
          { value: 'false', label: 'FALSE' },
        ],
        selectedValue: value ? 'true' : 'false',
      }, this.deps));
      this._fields.set(key, { kind, component: toggle });
      this.appendElement(parent, toggle.render());
      return;
    }

    if (kind === 'enum' && Array.isArray(def.values)) {
      const select = this._track(new Select({
        label,
        options: def.values.map((v) => ({ value: String(v), label: String(v) })),
        value: value != null ? String(value) : String(def.values[0]),
      }, this.deps));
      this._fields.set(key, { kind, component: select });
      this.appendElement(parent, select.render());
      return;
    }

    if (kind === 'token-set' && Array.isArray(def.values)) {
      const selected = Array.isArray(value) ? value.map(String) : [];
      const toggle = this._track(new ToggleGroup({
        label,
        exclusive: false,
        layout: 'list',
        items: def.values.map((v) => ({ value: String(v), label: String(v).toUpperCase() })),
        selectedValues: selected,
      }, this.deps));
      this._fields.set(key, { kind, component: toggle });
      this.appendElement(parent, toggle.render());
      return;
    }

    if (kind === 'integer' || kind === 'number' || kind === 'palette-index') {
      const numeric = this._track(new NumericInput({
        label,
        value: Number(value) || 0,
        min: def.min,
        max: def.max,
        step: kind === 'integer' || kind === 'palette-index' ? 1 : undefined,
      }, this.deps));
      this._fields.set(key, { kind, component: numeric });
      this.appendElement(parent, numeric.render());
      return;
    }

    if (kind === 'array' || kind === 'record' || kind === 'params') {
      const text = this._track(new TextInput({
        label: `${label} (JSON)`,
        value: JSON.stringify(value ?? (kind === 'array' ? [] : {}), null, 2),
        multiline: true,
        rows: 6,
      }, this.deps));
      this._fields.set(key, { kind: 'json', component: text });
      this.appendElement(parent, text.render());
      return;
    }

    const multiline = kind === 'markdown';
    const text = this._track(new TextInput({
      label,
      value: value != null ? String(value) : '',
      multiline,
      rows: multiline ? 8 : 3,
      maxLength: def.maxLength || null,
    }, this.deps));
    this._fields.set(key, { kind: 'text', component: text });
    this.appendElement(parent, text.render());
  }

  getProps() {
    const props = {};
    if (this._sizePair) {
      props.width = this._sizePair.getWidth();
      props.height = this._sizePair.getHeight();
    }
    for (const [key, entry] of this._fields) {
      const { kind, component } = entry;
      if (kind === 'boolean') {
        const v = component.selectedValue ?? component.getValue?.();
        props[key] = v === true || v === 'true';
        continue;
      }
      if (kind === 'token-set') {
        props[key] = [...(component.selectedValues || [])];
        continue;
      }
      if (kind === 'integer' || kind === 'number' || kind === 'palette-index') {
        props[key] = Number(component.getValue());
        continue;
      }
      if (kind === 'json') {
        const raw = component.getValue();
        props[key] = JSON.parse(String(raw || (this.schema[key]?.kind === 'array' ? '[]' : '{}')));
        continue;
      }
      props[key] = component.getValue();
    }
    return props;
  }

  destroy() {
    this.tracked = [];
    this._fields.clear();
    this._sizePair = null;
    super.destroy();
  }
}
