import { BaseComponent } from '../../../../shared/foundation.js';
import { NodePanel } from './NodePanel.js';
import { CategoryPicker } from './CategoryPicker.js';

export class EffectStack extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'effect-stack', ...options }, deps);
    this._nodes = options.nodes ?? [];
    this._onChange = options.onChange ?? null;

    this._soloNodeId = null;
    this._expandedNodeId = null;
    this._pickerOpen = false;

    this._addButton = null;
    this._contentEl = null;
    this._picker = null;
    this._panels = [];
  }

  render() {
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    `;

    this._addButton = this.createElement('button', 'distort-stack-add', 'ADD EFFECT +');
    this._addButton.type = 'button';
    this._addButton.style.cssText = `
      width: 100%;
      height: ${F * 2}px;
      border: none;
      border-bottom: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-align: left;
      padding: 0 ${F}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    `;
    this._addButton.addEventListener('mouseenter', () => {
      this._addButton.style.background = 'var(--c-text)';
      this._addButton.style.color = 'var(--c-bg)';
    });
    this._addButton.addEventListener('mouseleave', () => {
      this._addButton.style.background = 'var(--c-bg)';
      this._addButton.style.color = 'var(--c-text)';
    });
    this._addButton.addEventListener('click', () => {
      this._pickerOpen = !this._pickerOpen;
      this._renderContent();
    });
    this.element.appendChild(this._addButton);

    this._contentEl = this.createElement('div', 'distort-stack-content');
    this._contentEl.style.cssText = `
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      position: relative;
    `;
    this.element.appendChild(this._contentEl);

    this._renderContent();
    return this.element;
  }

  _renderContent() {
    if (this._addButton) {
      this._addButton.textContent = this._pickerOpen ? 'CLOSE ×' : 'ADD EFFECT +';
    }

    // Destroy and remove any existing picker overlay
    this._picker?.destroy?.();
    this._picker = null;

    // Always re-render node panels (picker overlays them, does not replace them)
    while (this._contentEl.firstChild) this._contentEl.removeChild(this._contentEl.firstChild);
    this._panels.forEach(panel => panel.destroy());
    this._panels = [];

    this._nodes.forEach((node, index) => {
      const panel = new NodePanel({
        node,
        nodeIdx: index,
        expanded: node.id === this._expandedNodeId,
        isSolo: node.id === this._soloNodeId,
        onSelect: ({ nodeIdx }) => {
          const current = this._nodes[nodeIdx];
          if (!current) return;
          this._expandedNodeId = this._expandedNodeId === current.id ? null : current.id;
          this._renderContent();
        },
        onChange: event => {
          if ('dragFrom' in event && 'dragTo' in event) {
            this._reorder(event.dragFrom, event.dragTo);
            return;
          }
          this._emitChange({ type: 'nodeChange', nodeId: node.id, soloNodeId: this._soloNodeId });
        },
        onRemove: ({ nodeIdx }) => this._remove(nodeIdx),
        onSolo: ({ nodeIdx }) => this._toggleSolo(nodeIdx),
      }, this.deps);
      this._panels.push(panel);
      this._contentEl.appendChild(panel.render());
    });

    // If picker is open, append it as a bounded overlay on top of node panels
    if (this._pickerOpen) {
      this._picker = new CategoryPicker({
        onClose: () => {
          this._pickerOpen = false;
          this._renderContent();
        },
        onSelect: entry => {
          const node = entry?.factory?.();
          if (!node) return;
          this._nodes.push(node);
          this._expandedNodeId = node.id;
          this._pickerOpen = false;
          this._renderContent();
          this._emitChange({ type: 'add', nodeId: node.id, soloNodeId: this._soloNodeId });
        }
      }, this.deps);
      this._contentEl.appendChild(this._picker.render());
      this._picker.focus?.();
    }
  }

  _reorder(fromIdx, toIdx) {
    const [node] = this._nodes.splice(fromIdx, 1);
    this._nodes.splice(toIdx, 0, node);
    this._renderContent();
    this._emitChange({ type: 'reorder', nodeId: node?.id ?? null, soloNodeId: this._soloNodeId });
  }

  _remove(idx) {
    const [removed] = this._nodes.splice(idx, 1);
    if (removed?.id === this._soloNodeId) this._soloNodeId = null;
    if (removed?.id === this._expandedNodeId) this._expandedNodeId = null;
    this._renderContent();
    this._emitChange({ type: 'remove', nodeId: removed?.id ?? null, soloNodeId: this._soloNodeId });
  }

  _toggleSolo(idx) {
    const node = this._nodes[idx];
    if (!node) return;
    this._soloNodeId = this._soloNodeId === node.id ? null : node.id;
    this._renderContent();
    this._emitChange({ type: 'solo', nodeId: node.id, soloNodeId: this._soloNodeId });
  }

  _emitChange(payload) {
    this._onChange?.(payload);
  }

  getNodes() {
    return this._nodes;
  }

  setNodes(nodes) {
    this._nodes = nodes ?? [];
    if (this._soloNodeId && !this._nodes.some(node => node.id === this._soloNodeId)) {
      this._soloNodeId = null;
    }
    if (this._expandedNodeId && !this._nodes.some(node => node.id === this._expandedNodeId)) {
      this._expandedNodeId = null;
    }
    if (this.element) this._renderContent();
  }

  setSoloNodeId(nodeId) {
    this._soloNodeId = nodeId ?? null;
    if (this.element) this._renderContent();
  }

  destroy() {
    this._panels.forEach(panel => panel.destroy());
    this._panels = [];
    this._picker?.destroy?.();
    this._picker = null;
    super.destroy();
  }
}
