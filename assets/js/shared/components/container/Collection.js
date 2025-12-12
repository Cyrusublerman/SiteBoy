/**
 * Collection - List/grid of items with selection
 * 
 * Used for swatches, checkpoints, thumbnails, etc.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Collection extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'collection' }, deps);
        
        // [{id, value, label, color, thumbnail, ...}]
        this.items = options.items ?? [];
        
        this.layout = options.layout ?? 'list'; // 'list' | 'grid' | 'carousel'
        this.columns = options.columns ?? 4;
        this.gap = options.gap ?? 0.5; // In F units
        
        // Item rendering
        this.itemSize = options.itemSize ?? null; // In F units, auto if null
        this.itemRenderer = options.itemRenderer ?? null; // (item, deps) => Element
        this.itemType = options.itemType ?? 'text'; // 'text' | 'swatch' | 'thumbnail'
        
        // Selection
        this.selectable = options.selectable ?? false;
        this.multiSelect = options.multiSelect ?? false;
        this.selectedIds = options.selectedIds ?? [];
        
        // Actions
        this.removable = options.removable ?? false;
        this.draggable = options.draggable ?? false;
        
        // Events
        this.onSelect = options.onSelect ?? (() => {});
        this.onRemove = options.onRemove ?? (() => {});
        this.onReorder = options.onReorder ?? (() => {});
        
        this.containerEl = null;
        this.itemElements = [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'collection-container component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
        `;
        
        this.containerEl = this.createElement('div', 'collection-items');
        
        const gapPx = this.gap * F;
        
        if (this.layout === 'grid') {
            this.containerEl.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.columns}, ${this.itemSize ? F * this.itemSize + 'px' : '1fr'});
                gap: ${gapPx}px;
            `;
        } else if (this.layout === 'carousel') {
            this.containerEl.style.cssText = `
                display: flex;
                flex-direction: row;
                gap: ${gapPx}px;
                overflow-x: auto;
                padding-bottom: ${F2}px;
            `;
        } else {
            this.containerEl.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: ${gapPx}px;
            `;
        }
        
        this._renderItems(F, F2);
        
        this.element.appendChild(this.containerEl);
        
        return this.element;
    }
    
    _renderItems(F, F2) {
        this.containerEl.innerHTML = '';
        this.itemElements = [];
        
        this.items.forEach((item, index) => {
            const itemEl = this._renderItem(item, index, F, F2);
            this.containerEl.appendChild(itemEl);
            this.itemElements.push(itemEl);
        });
    }
    
    _renderItem(item, index, F, F2) {
        const itemId = item.id ?? index;
        const isSelected = this.selectedIds.includes(itemId);
        
        const itemEl = this.createElement('div', 'collection-item');
        itemEl.dataset.itemId = itemId;
        itemEl.dataset.index = index;
        
        // Custom renderer
        if (this.itemRenderer) {
            const customEl = this.itemRenderer(item, this.deps);
            itemEl.appendChild(customEl);
        } else {
            // Default renderers by type
            switch (this.itemType) {
                case 'swatch':
                    this._renderSwatch(itemEl, item, F, F2);
                    break;
                case 'thumbnail':
                    this._renderThumbnail(itemEl, item, F, F2);
                    break;
                default:
                    this._renderText(itemEl, item, F, F2);
            }
        }
        
        // Base styling
        const size = this.itemSize ? F * this.itemSize : 'auto';
        itemEl.style.cssText += `
            ${this.selectable ? 'cursor: pointer;' : ''}
            ${isSelected ? 'outline: 2px solid var(--c-text);' : ''}
            position: relative;
        `;
        
        // Selection
        if (this.selectable) {
            itemEl.addEventListener('click', (e) => {
                if (e.target.closest('.collection-remove-btn')) return;
                this._handleSelect(itemId);
            });
        }
        
        // Remove button
        if (this.removable) {
            const removeBtn = this.createElement('button', 'collection-remove-btn');
            removeBtn.type = 'button';
            removeBtn.textContent = '×';
            removeBtn.style.cssText = `
                position: absolute;
                top: ${F2}px;
                right: ${F2}px;
                width: ${F}px;
                height: ${F}px;
                padding: 0;
                border: none;
                background: var(--c-text);
                color: var(--c-bg);
                font-size: ${F}px;
                line-height: 1;
                cursor: pointer;
                display: none;
            `;
            
            itemEl.addEventListener('mouseenter', () => {
                removeBtn.style.display = 'block';
            });
            itemEl.addEventListener('mouseleave', () => {
                removeBtn.style.display = 'none';
            });
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(itemId);
            });
            
            itemEl.appendChild(removeBtn);
        }
        
        return itemEl;
    }
    
    _renderText(itemEl, item, F, F2) {
        itemEl.style.cssText = `
            padding: ${F2}px ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
        `;
        itemEl.textContent = item.label ?? item.value ?? item.id ?? '';
    }
    
    _renderSwatch(itemEl, item, F, F2) {
        const size = this.itemSize ?? 2;
        itemEl.style.cssText = `
            width: ${F * size}px;
            height: ${F * size}px;
            background: ${item.color ?? item.value ?? '#000'};
            border: 1px solid var(--c-border);
        `;
        itemEl.title = item.label ?? item.color ?? '';
    }
    
    _renderThumbnail(itemEl, item, F, F2) {
        const size = this.itemSize ?? 4;
        itemEl.style.cssText = `
            width: ${F * size}px;
            height: ${F * size}px;
            border: 1px solid var(--c-border);
            background-image: url(${item.thumbnail ?? item.src ?? ''});
            background-size: cover;
            background-position: center;
        `;
    }
    
    _handleSelect(itemId) {
        if (this.multiSelect) {
            const idx = this.selectedIds.indexOf(itemId);
            if (idx >= 0) {
                this.selectedIds.splice(idx, 1);
            } else {
                this.selectedIds.push(itemId);
            }
        } else {
            this.selectedIds = this.selectedIds.includes(itemId) ? [] : [itemId];
        }
        
        this._updateSelectionUI();
        this.onSelect(this.multiSelect ? [...this.selectedIds] : this.selectedIds[0] ?? null);
    }
    
    _updateSelectionUI() {
        this.itemElements.forEach((el, i) => {
            const itemId = this.items[i]?.id ?? i;
            const isSelected = this.selectedIds.includes(itemId);
            el.style.outline = isSelected ? '2px solid var(--c-text)' : 'none';
        });
    }
    
    // Public API
    setItems(items) {
        this.items = items;
        if (this.containerEl) {
            const { F, F2 } = this.getF();
            this._renderItems(F, F2);
        }
    }
    
    addItem(item) {
        this.items.push(item);
        if (this.containerEl) {
            const { F, F2 } = this.getF();
            const itemEl = this._renderItem(item, this.items.length - 1, F, F2);
            this.containerEl.appendChild(itemEl);
            this.itemElements.push(itemEl);
        }
    }
    
    removeItem(itemId) {
        const index = this.items.findIndex(i => (i.id ?? this.items.indexOf(i)) === itemId);
        if (index >= 0) {
            const removed = this.items.splice(index, 1)[0];
            
            // Update selectedIds
            const selIdx = this.selectedIds.indexOf(itemId);
            if (selIdx >= 0) this.selectedIds.splice(selIdx, 1);
            
            // Update UI
            if (this.itemElements[index]) {
                this.itemElements[index].remove();
                this.itemElements.splice(index, 1);
            }
            
            this.onRemove(removed, itemId);
        }
    }
    
    getSelectedItems() {
        return this.items.filter((item, i) => 
            this.selectedIds.includes(item.id ?? i)
        );
    }
    
    setSelection(ids) {
        this.selectedIds = Array.isArray(ids) ? [...ids] : [ids];
        this._updateSelectionUI();
    }
    
    clearSelection() {
        this.selectedIds = [];
        this._updateSelectionUI();
    }
    
    clear() {
        this.items = [];
        this.selectedIds = [];
        if (this.containerEl) this.containerEl.innerHTML = '';
        this.itemElements = [];
    }
}

