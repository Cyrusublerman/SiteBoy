import { BaseComponent } from '../../../../shared/foundation.js';
import { NodePanel } from './NodePanel.js';
import { CategoryPicker } from './CategoryPicker.js';
import { REGISTRY } from '../nodes/registry.js';

/**
 * EffectStack — ordered list of EffectNodes with UI controls.
 *
 * Undo/redo is NOT managed here; it lives in DistortToolbar / History held by
 * the parent host.  EffectStack emits onStackChange(stack) and onSnapshot()
 * to request a history snapshot.
 *
 * Drag-to-reorder via HTML5 drag events on NodePanel headers.
 */
export class EffectStack extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'effect-stack', ...options }, deps);
    this._stack          = options.stack          ?? [];
    this._appState       = options.appState       ?? null;
    this._onStackChange  = options.onStackChange  ?? null;
    this._onSnapshot     = options.onSnapshot     ?? null;  // request history snapshot
    this._panels         = [];
    this._soloIdx        = -1;
    this._listEl         = null;
    this._pickerEl       = null;
    this._pickerOpen     = false;
    this._picker         = null;
  }

  render() {
    super.render();
    this.element.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

    this._buildToolbar();
    this._listEl = this.createElement('div', 'effect-list');
    this._listEl.style.cssText = 'flex:1;overflow-y:auto;padding:4px;';
    this.element.appendChild(this._listEl);

    this._rebuildPanels();
    return this;
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────

  _buildToolbar() {
    const bar = this.createElement('div', 'stack-toolbar');
    bar.style.cssText = [
      'display:flex', 'gap:4px', 'padding:4px 6px',
      'background:var(--vga-darkgrey,#222)',
      'border-bottom:1px solid var(--vga-grey,#555)',
      'flex-wrap:wrap', 'flex-shrink:0'
    ].join(';');

    const addBtn   = this._btn('+ ADD',   () => this._togglePicker());
    const clearBtn = this._btn('CLEAR',   () => this._clearAll());
    const soloBtn  = this._btn('SOLO OFF', () => this._clearSolo());
    soloBtn.title  = 'Clear solo mode';

    bar.append(addBtn, clearBtn, soloBtn);
    this.element.appendChild(bar);

    // CategoryPicker panel (hidden until toggled)
    this._picker = new CategoryPicker({
      onSelect: entry => { this._addNode(entry); this._togglePicker(); }
    }, this.deps);
    this._picker.render();
    this._picker.element.style.display = 'none';
    this.element.appendChild(this._picker.element);
  }

  _togglePicker() {
    this._pickerOpen = !this._pickerOpen;
    this._picker.element.style.display = this._pickerOpen ? 'block' : 'none';
    if (this._pickerOpen) this._picker.focus();
  }

  // ── Stack mutation ────────────────────────────────────────────────────────

  _addNode(entry) {
    this._onSnapshot?.();
    const node = entry.factory();
    node.enabled   = true;
    node.opacity   = 1;
    node.blendMode = 'normal';
    node.maskMode  = 'none';
    node.modulation = {};
    node.drivers    = {};
    this._stack.push(node);
    this._rebuildPanels();
    this._emit();
  }

  _removeNode(idx) {
    this._onSnapshot?.();
    this._stack.splice(idx, 1);
    if (this._soloIdx >= this._stack.length) this._soloIdx = -1;
    this._rebuildPanels();
    this._emit();
  }

  _clearAll() {
    this._onSnapshot?.();
    this._stack.length = 0;
    this._soloIdx = -1;
    this._rebuildPanels();
    this._emit();
  }

  _clearSolo() {
    this._soloIdx = -1;
    this._panels.forEach((p, i) => p.setSolo(false));
    this._emit();
  }

  _setSolo(idx) {
    this._soloIdx = (this._soloIdx === idx) ? -1 : idx;
    this._panels.forEach((p, i) => p.setSolo(i === this._soloIdx));
    if (this._appState) this._appState.soloNodeId = this._soloIdx >= 0 ? this._stack[this._soloIdx]?.id : null;
    this._emit();
  }

  _moveNode(fromIdx, toIdx) {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    if (fromIdx >= this._stack.length || toIdx >= this._stack.length) return;
    this._onSnapshot?.();
    const [node] = this._stack.splice(fromIdx, 1);
    this._stack.splice(toIdx, 0, node);
    this._rebuildPanels();
    this._emit();
  }

  // ── Panels ────────────────────────────────────────────────────────────────

  _rebuildPanels() {
    this._panels.forEach(p => p.destroy());
    this._panels = [];
    if (this._listEl) this._listEl.innerHTML = '';

    if (!this._stack.length) {
      const empty = this.createElement('div', '', 'NO EFFECTS — click + ADD');
      empty.style.cssText = 'text-align:center;color:var(--vga-grey,#888);font-family:Space Mono,monospace;font-size:10px;margin-top:20px';
      this._listEl.appendChild(empty);
      return;
    }

    this._stack.forEach((node, idx) => {
      const panel = new NodePanel({
        node, nodeIdx: idx,
        modMapNames: this._appState ? (this._appState.getModMapNames?.() ?? []) : [],
        isSolo: idx === this._soloIdx,
        onChange: ({ nodeIdx, dragFrom, dragTo }) => {
          if (dragFrom !== undefined) {
            this._moveNode(dragFrom, dragTo);
          } else {
            this._emit();
          }
        },
        onRemove: ({ nodeIdx }) => this._removeNode(nodeIdx),
        onSolo:   ({ nodeIdx }) => this._setSolo(nodeIdx),
        onSelect: ({ nodeIdx }) => {
          if (this._appState) this._appState.selectedNodeIdx = nodeIdx;
        }
      }, this.deps);
      panel.render();
      this._listEl.appendChild(panel.element);
      this._panels.push(panel);
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setStack(stack) {
    this._stack = stack;
    this._soloIdx = -1;
    this._rebuildPanels();
  }

  getStack() { return this._stack; }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _emit() {
    if (this._appState) {
      this._appState.stack       = this._stack;
      this._appState.needsRender = true;
    }
    this._onStackChange?.(this._stack);
  }

  _btn(text, cb) {
    const b = this.createElement('button', 'stack-btn', text);
    b.style.cssText = [
      'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)', 'font-family:Space Mono,monospace',
      'font-size:9px', 'padding:2px 6px', 'cursor:pointer', 'letter-spacing:0.5px'
    ].join(';');
    b.addEventListener('click', cb);
    return b;
  }

  destroy() {
    this._panels.forEach(p => p.destroy());
    this._picker?.destroy();
    this._panels = [];
    super.destroy();
  }
}
