import { BaseComponent } from '../../../../shared/foundation.js';
import { DriverPicker } from './DriverPicker.js';

const BLEND_MODES = ['normal','multiply','screen','overlay','add','difference','softlight','hardlight','colordodge','colorburn'];

const TIER_LABELS = { 3: 'PRIMARY', 4: 'SECONDARY', 5: 'ADVANCED' };

/**
 * NodePanel — renders a single EffectNode's controls.
 *
 * Header row:  [drag] [enable] [NAME] [SOLO] [blend] [▲/▼] [✕]
 * Universal:   opacity slider, blend mode dropdown, mask selector
 * Params:      grouped by tier (3 PRIMARY, 4 SECONDARY, 5 ADVANCED),
 *              each driveable param has a [DRV] button opening DriverPicker
 *
 * Emits onChange({ nodeIdx }) on any change.
 * Emits onRemove({ nodeIdx }) on remove click.
 * Emits onSolo({ nodeIdx }) on solo click.
 * Emits onDragStart / onDragEnd for reorder.
 */
export class NodePanel extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'node-panel', ...options }, deps);
    this._node           = options.node;
    this._nodeIdx        = options.nodeIdx        ?? 0;
    this._modMapNames    = options.modMapNames    ?? [];
    this._onChange       = options.onChange       ?? null;
    this._onRemove       = options.onRemove       ?? null;
    this._onSelect       = options.onSelect       ?? null;
    this._onSolo         = options.onSolo         ?? null;
    this._onDragStart    = options.onDragStart    ?? null;
    this._onDragEnd      = options.onDragEnd      ?? null;
    this._expanded       = options.expanded       ?? true;
    this._isSolo         = options.isSolo         ?? false;
    this._paramEls       = {};
    this._driverPickers  = {};   // paramKey → DriverPicker instance
    this._openDriverKey  = null;
    this._body           = null;
  }

  render() {
    super.render();
    const node = this._node;
    this.element.style.cssText = [
      'border:1px solid var(--vga-grey,#555)',
      'margin-bottom:2px',
      'user-select:none'
    ].join(';');

    this.element.appendChild(this._buildHeader(node));

    this._body = this.createElement('div', 'node-panel-body');
    this._body.style.cssText = `display:${this._expanded ? 'block' : 'none'};padding:4px 8px 8px`;

    this._body.appendChild(this._buildUniversal(node));
    this._body.appendChild(this._buildParams(node));
    this.element.appendChild(this._body);

    return this;
  }

  // ── Header ────────────────────────────────────────────────────────────────

  _buildHeader(node) {
    const h = this.createElement('div', 'node-panel-header');
    h.style.cssText = [
      'display:flex', 'align-items:center', 'gap:5px',
      'padding:3px 6px',
      'background:var(--vga-darkgrey,#222)',
      'cursor:pointer'
    ].join(';');

    // Drag handle
    const drag = this.createElement('span', 'node-drag', '⠿');
    drag.style.cssText = 'color:var(--vga-grey,#888);cursor:grab;font-size:12px;padding:0 2px;flex-shrink:0';
    drag.draggable = true;
    drag.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(this._nodeIdx));
      this._onDragStart?.(this._nodeIdx);
    });
    drag.addEventListener('dragend', () => this._onDragEnd?.(this._nodeIdx));

    // Enable toggle
    const toggle = this.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = node.enabled !== false;
    toggle.title = 'Enable/disable node';
    toggle.addEventListener('change', e => { e.stopPropagation(); node.enabled = toggle.checked; this._emit(); });

    // Name
    const label = this.createElement('span', 'node-name', node.displayName || node.type.toUpperCase());
    label.style.cssText = [
      'flex:1', 'font-family:Space Mono,monospace', 'font-size:11px',
      'letter-spacing:1px', 'color:var(--vga-white,#eee)',
      'overflow:hidden', 'text-overflow:ellipsis', 'white-space:nowrap'
    ].join(';');

    // Solo
    const soloBtn = this.createElement('span', 'node-solo', this._isSolo ? 'S•' : 'S');
    soloBtn.title = 'Solo this node';
    soloBtn.style.cssText = [
      'font-family:Space Mono,monospace', 'font-size:9px',
      'color:var(--vga-grey,#888)', 'cursor:pointer', 'padding:0 2px', 'flex-shrink:0'
    ].join(';');
    soloBtn.addEventListener('click', e => {
      e.stopPropagation();
      this._onSolo?.({ nodeIdx: this._nodeIdx });
    });
    this._soloBtn = soloBtn;

    // Collapse
    const collapseBtn = this.createElement('span', '', this._expanded ? '▲' : '▼');
    collapseBtn.style.cssText = 'font-size:10px;color:var(--vga-grey,#888);user-select:none;flex-shrink:0';

    // Remove
    const removeBtn = this.createElement('span', '', '✕');
    removeBtn.style.cssText = 'font-size:11px;color:var(--vga-red,#c00);cursor:pointer;padding:0 2px;user-select:none;flex-shrink:0';
    removeBtn.addEventListener('click', e => { e.stopPropagation(); this._onRemove?.({ nodeIdx: this._nodeIdx }); });

    h.append(drag, toggle, label, soloBtn, collapseBtn, removeBtn);
    h.addEventListener('click', e => {
      if ([removeBtn, toggle, soloBtn].includes(e.target)) return;
      this._expanded = !this._expanded;
      collapseBtn.textContent = this._expanded ? '▲' : '▼';
      this._body.style.display = this._expanded ? 'block' : 'none';
      this._onSelect?.({ nodeIdx: this._nodeIdx });
    });

    // Drop target for drag-reorder
    h.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; h.style.borderTop = '2px solid var(--vga-white,#eee)'; });
    h.addEventListener('dragleave', () => { h.style.borderTop = ''; });
    h.addEventListener('drop', e => {
      e.preventDefault();
      h.style.borderTop = '';
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(fromIdx) && fromIdx !== this._nodeIdx) {
        this._onChange?.({ nodeIdx: this._nodeIdx, dragFrom: fromIdx, dragTo: this._nodeIdx });
      }
    });

    return h;
  }

  // ── Universal controls ────────────────────────────────────────────────────

  _buildUniversal(node) {
    const wrap = this.createElement('div', 'node-universal');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:3px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid var(--vga-grey,#555)';

    // Opacity
    wrap.appendChild(this._buildSliderRow('OPACITY', 0, 1, 0.01,
      node.opacity ?? 1,
      v => { node.opacity = v; this._emit(); },
      v => `${Math.round(v * 100)}%`
    ));

    // Blend mode
    wrap.appendChild(this._buildBlendRow(node));

    // Mask
    wrap.appendChild(this._buildMaskRow(node));

    return wrap;
  }

  _buildSliderRow(labelText, min, max, step, initial, onChange, fmt) {
    const row = this.createElement('div', 'node-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const lbl = this.createElement('span', '', labelText);
    lbl.style.cssText = 'font-size:10px;color:var(--vga-grey,#888);width:64px;font-family:Space Mono,monospace;flex-shrink:0';

    const slider = this.createElement('input');
    slider.type = 'range'; slider.min = min; slider.max = max; slider.step = step;
    slider.value = initial;
    slider.style.cssText = 'flex:1';

    const valEl = this.createElement('span', '', fmt ? fmt(initial) : initial);
    valEl.style.cssText = 'font-size:10px;color:var(--vga-white,#eee);width:40px;text-align:right;font-family:Space Mono,monospace;flex-shrink:0';

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      valEl.textContent = fmt ? fmt(v) : v;
      onChange(v);
    });

    row.append(lbl, slider, valEl);
    return row;
  }

  _buildBlendRow(node) {
    const row = this.createElement('div', 'node-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const lbl = this.createElement('span', '', 'BLEND');
    lbl.style.cssText = 'font-size:10px;color:var(--vga-grey,#888);width:64px;font-family:Space Mono,monospace;flex-shrink:0';

    const sel = this.createElement('select');
    BLEND_MODES.forEach(m => {
      const opt = this.createElement('option', '', m.toUpperCase());
      opt.value = m;
      if ((node.blendMode ?? 'normal') === m) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.style.cssText = [
      'flex:1', 'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 3px'
    ].join(';');
    sel.addEventListener('change', () => { node.blendMode = sel.value; this._emit(); });

    row.append(lbl, sel);
    return row;
  }

  _buildMaskRow(node) {
    const row = this.createElement('div', 'node-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const lbl = this.createElement('span', '', 'MASK');
    lbl.style.cssText = 'font-size:10px;color:var(--vga-grey,#888);width:64px;font-family:Space Mono,monospace;flex-shrink:0';

    const sel = this.createElement('select');
    ['none', 'upload', 'luminance', 'gradient'].forEach(m => {
      const opt = this.createElement('option', '', m.toUpperCase());
      opt.value = m;
      if ((node.maskMode ?? 'none') === m) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.style.cssText = [
      'flex:1', 'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 3px'
    ].join(';');
    sel.addEventListener('change', () => { node.maskMode = sel.value; this._emit(); });

    row.append(lbl, sel);
    return row;
  }

  // ── Params grouped by tier ────────────────────────────────────────────────

  _buildParams(node) {
    const wrap = this.createElement('div', 'node-params');

    const paramDefs = node.getParamDefs ? node.getParamDefs() : {};
    const byTier = {};
    for (const [key, def] of Object.entries(paramDefs)) {
      const tier = def.tier ?? 3;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push([key, def]);
    }

    for (const tier of [3, 4, 5]) {
      if (!byTier[tier]?.length) continue;

      const tierLabel = this.createElement('div', 'tier-label', TIER_LABELS[tier] ?? `TIER ${tier}`);
      tierLabel.style.cssText = [
        'font-family:Space Mono,monospace', 'font-size:8px',
        'color:var(--vga-grey,#555)', 'letter-spacing:1px',
        'margin-top:6px', 'margin-bottom:2px'
      ].join(';');
      wrap.appendChild(tierLabel);

      for (const [key, def] of byTier[tier]) {
        wrap.appendChild(this._buildParamRow(key, def, node));
      }
    }

    return wrap;
  }

  _buildParamRow(key, def, node) {
    const row = this.createElement('div', 'param-row');
    row.style.cssText = 'display:flex;align-items:center;gap:4px;margin-top:3px';

    const label = def.label || key;
    const lbl = this.createElement('span', '', label.toUpperCase());
    lbl.style.cssText = [
      'font-size:9px', 'color:var(--vga-grey,#888)',
      'width:64px', 'flex-shrink:0', 'overflow:hidden',
      'text-overflow:ellipsis', 'white-space:nowrap',
      'font-family:Space Mono,monospace'
    ].join(';');

    let control;

    if (def.type === 'select') {
      control = this.createElement('select');
      (def.options || []).forEach(opt => {
        const o = this.createElement('option', '', opt.toString().toUpperCase());
        o.value = opt;
        if (String(node.params[key]) === String(opt)) o.selected = true;
        control.appendChild(o);
      });
      control.style.cssText = [
        'flex:1', 'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
        'border:1px solid var(--vga-grey,#555)',
        'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 3px'
      ].join(';');
      control.addEventListener('change', () => { node.params[key] = control.value; this._emit(); });

    } else if (def.type === 'toggle') {
      control = this.createElement('input');
      control.type = 'checkbox';
      control.checked = !!node.params[key];
      control.addEventListener('change', () => { node.params[key] = control.checked; this._emit(); });

    } else {
      // Numeric slider + value display
      control = this.createElement('input');
      control.type = 'range';
      control.min  = def.min  ?? 0;
      control.max  = def.max  ?? 1;
      control.step = def.step ?? 0.01;
      control.value = node.params[key];
      control.style.cssText = 'flex:1';

      const unit    = def.unit ?? '';
      const valEl   = this.createElement('span', '', this._fmt(node.params[key], def) + unit);
      valEl.style.cssText = 'font-size:9px;color:var(--vga-white,#eee);width:44px;text-align:right;font-family:Space Mono,monospace;flex-shrink:0';

      control.addEventListener('input', () => {
        node.params[key] = parseFloat(control.value);
        valEl.textContent = this._fmt(node.params[key], def) + unit;
        this._emit();
      });

      this._paramEls[key] = { control, valEl };
      row.append(lbl, control, valEl);

      // Driver button for driveable params
      if (def.driveable) {
        const drvBtn = this._driverBtn(key, def, node);
        row.appendChild(drvBtn);
      }

      return row;
    }

    this._paramEls[key] = { control };
    row.append(lbl, control);

    if (def.driveable && def.type !== 'toggle') {
      row.appendChild(this._driverBtn(key, def, node));
    }
    return row;
  }

  _driverBtn(key, def, node) {
    if (!node.drivers) node.drivers = {};
    const btn = this.createElement('button', 'drv-btn', 'DRV');
    btn.title = `Set expression/image driver for ${key}`;
    const hasDriver = node.drivers[key]?.mode && node.drivers[key].mode !== 'none';
    btn.style.cssText = [
      'background:var(--vga-darkgrey,#222)',
      `color:${hasDriver ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)'}`,
      `border:1px solid ${hasDriver ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)'}`,
      'font-family:Space Mono,monospace', 'font-size:8px', 'padding:1px 4px',
      'cursor:pointer', 'flex-shrink:0'
    ].join(';');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      this._toggleDriverPicker(key, def, node, btn);
    });
    return btn;
  }

  _toggleDriverPicker(key, def, node, btn) {
    // Close any open picker
    if (this._openDriverKey && this._openDriverKey !== key) {
      this._closeDriverPicker();
    }

    if (this._openDriverKey === key) {
      this._closeDriverPicker();
      return;
    }

    this._openDriverKey = key;
    if (!node.drivers) node.drivers = {};

    const picker = new DriverPicker({
      paramKey: key,
      label: def.label || key,
      driver: node.drivers[key] ?? { mode: 'none', expr: '' },
      onDriverChange: ({ mode, expr, imageAsset }) => {
        node.drivers[key] = { mode, expr, imageAsset };
        // Update button highlight
        const active = mode !== 'none';
        btn.style.color  = active ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
        btn.style.borderColor = active ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
        this._emit();
      }
    }, this.deps);
    picker.render();

    // Insert directly after the param row
    btn.closest('.param-row')?.after(picker.element);
    this._driverPickers[key] = picker;
  }

  _closeDriverPicker() {
    const key = this._openDriverKey;
    if (!key) return;
    const picker = this._driverPickers[key];
    if (picker) {
      picker.element.remove();
      picker.destroy();
      delete this._driverPickers[key];
    }
    this._openDriverKey = null;
  }

  // ── Misc ─────────────────────────────────────────────────────────────────

  setSolo(isSolo) {
    this._isSolo = isSolo;
    if (this._soloBtn) this._soloBtn.textContent = isSolo ? 'S•' : 'S';
    this.element.style.opacity = isSolo ? '1' : '0.5';
  }

  updateModMapNames(names) { this._modMapNames = names; }

  _fmt(v, def) {
    if (def.step >= 1) return Math.round(v).toString();
    return parseFloat(v.toFixed(3)).toString();
  }

  _emit() { this._onChange?.({ nodeIdx: this._nodeIdx }); }

  destroy() {
    this._closeDriverPicker();
    Object.values(this._driverPickers).forEach(p => p.destroy());
    super.destroy();
  }
}
