/**
 * IndexMapTOC — SiteBoy tree + Trousdale navigation dynamics (B6).
 * TREE | INDEX | MAP · in-place paint · peek · select-then-open · URL state.
 */

import { BaseComponent } from './foundation.js';
import {
    treeTw, treeAssignDepths, treeYc, treeBuildGeo, treeMeasureDescHeight, treeSvgLine
} from './tree-toc-core.js';

const VIEWS = new Set(['tree', 'index', 'map']);

export class IndexMapTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'index-map-toc' }, deps);

        this.root = options.data || { label: 'INDEX', children: [] };
        this.onItemClick = options.onItemClick || null;
        this.onStatus = options.onStatus || null;
        this.onStateChange = options.onStateChange || null;
        this.focusMode = options.focusMode !== false;
        this.focusDepth = options.focusDepth ?? 1;
        this.stagedExpand = options.stagedExpand !== false;
        this.stagedInterval = options.stagedInterval ?? 48;
        this.metaGutter = options.metaGutter !== false;
        this.relatedHighlight = options.relatedHighlight !== false;
        this.collapsible = options.collapsible !== false;
        this.view = VIEWS.has(options.view) ? options.view : 'tree';

        this._focusId = options.focusId || null;
        this._selectedId = options.selectedId || null;
        this._openBucketId = options.openBucketId || '';

        this._geoMap = {};
        this._svgEl = null;
        this._measureEl = null;
        this._charW = 0;
        this._gutterW = 0;
        this._totalW = 0;
        this._totalH = 0;

        this._hoverId = null;
        this._relatedSet = new Set();
        this._reverseRelated = new Map();
        this._nodeById = new Map();
        this._visibleList = [];
        this._elById = new Map();
        this._lineById = new Map();
        this._peekSnapshot = '';
        this._revealAnimator = null;
        this._revealingNode = null;
        this._onKeyDown = null;
        this._onStageLeave = null;
        this._suppressStateEmit = false;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'index-map-toc component');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'tree');

        this._measureEl = this.createElement('div', 'index-map-toc-measure');
        this._measureEl.setAttribute('aria-hidden', 'true');
        this._measureEl.style.cssText = `
            position: absolute; visibility: hidden; white-space: nowrap;
            font-family: 'Atkinson Hyperlegible Mono', monospace; font-weight: 400;
            line-height: 1; left: -9999px; top: 0; pointer-events: none;
        `;
        this.element.appendChild(this._measureEl);

        this._svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._svgEl.setAttribute('class', 'index-map-toc-svg');
        this._svgEl.setAttribute('shape-rendering', 'crispEdges');
        this.element.appendChild(this._svgEl);

        this._onKeyDown = (e) => this._handleKey(e);
        this._onStageLeave = () => this._clearHover(true);
        this.element.addEventListener('keydown', this._onKeyDown);
        this.element.addEventListener('mouseleave', this._onStageLeave);

        this._indexMap(true);
        this._applyOpenBucket();
        this._structuralDraw();

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => { if (this._measureEl) this._structuralDraw(); });
        }

        return this.element;
    }

    focusMap() {
        this.element?.focus({ preventScroll: false });
    }

    getState() {
        return {
            view: this.view,
            open: this._openBucketId || '',
            focus: this._focusId || '',
            selected: this._selectedId || ''
        };
    }

    applyState(state = {}) {
        if (!state) return;
        this._suppressStateEmit = true;
        if (state.view && VIEWS.has(state.view)) this.view = state.view;
        if (state.focus !== undefined) this._focusId = state.focus || null;
        if (state.selected !== undefined) this._selectedId = state.selected || null;
        if (state.open !== undefined) {
            this._openBucketId = state.open || '';
            this._applyOpenBucket();
        }
        this._structuralDraw();
        this._suppressStateEmit = false;
    }

    setView(view) {
        const next = VIEWS.has(view) ? view : 'tree';
        if (next === this.view) return;
        this.view = next;
        this._stopReveal();
        this._structuralDraw();
        this._emitStateChange();
        this.focusMap();
    }

    _F() { return this.deps?.MF?.F || window.Config?.F || 14; }

    _emitStateChange() {
        if (this._suppressStateEmit || !this.onStateChange) return;
        this.onStateChange(this.getState());
    }

    _status(msg) {
        if (this.onStatus) this.onStatus(msg);
    }

    // ── Data graph ─────────────────────────────────────────────────────────────

    _indexMap(buildReverse = false) {
        this._nodeById.clear();
        if (buildReverse) {
            this._reverseRelated.clear();
            const walk = (n, parent = null) => {
                n._parent = parent;
                n._peekOpen = false;
                if (n.id) this._nodeById.set(n.id, n);
                (n.children || []).forEach((c) => walk(c, n));
            };
            walk(this.root, null);
            this._nodeById.forEach((node) => {
                (node.related || []).forEach((rid) => {
                    if (!this._reverseRelated.has(rid)) this._reverseRelated.set(rid, new Set());
                    this._reverseRelated.get(rid).add(node.id);
                });
            });
        } else {
            const walk = (n, parent = null) => {
                n._parent = parent;
                if (n.id) this._nodeById.set(n.id, n);
                (n.children || []).forEach((c) => walk(c, n));
            };
            walk(this.root, null);
        }
    }

    _relatedIdsFor(node) {
        const out = new Set();
        if (!node?.id) return out;
        out.add(node.id);
        (node.related || []).forEach((id) => out.add(id));
        (this._reverseRelated.get(node.id) || []).forEach((id) => out.add(id));
        return out;
    }

    _metaLabel(node) {
        if (!node) return '';
        if (node.status === 'currently') return 'CURRENT';
        if (node.meta) return String(node.meta).toUpperCase();
        return '';
    }

    _isBranchOpen(node) {
        if (!node) return false;
        return !node._collapsed || !!node._peekOpen;
    }

    _visibleChildren(node) {
        if (!this._isBranchOpen(node)) return [];
        const all = node.children || [];
        if (node._revealCount !== undefined) return all.slice(0, node._revealCount);
        return all;
    }

    _tw(str) { return treeTw(this._measureEl, str, this._F()); }

    _isRelated(node) {
        if (!this.relatedHighlight || !this._hoverId) return false;
        return !!(node?.id && this._relatedSet.has(node.id));
    }

    _isHover(node) {
        return !!(node?.id && this._hoverId === node.id);
    }

    _isFocused(node) {
        return !!(node?.id && this._focusId === node.id);
    }

    _isSelected(node) {
        return !!(node?.id && this._selectedId === node.id);
    }

    _applyOpenBucket() {
        if (!this._openBucketId) return;
        const bucket = this._nodeById.get(this._openBucketId);
        if (bucket?.children?.length) {
            bucket._collapsed = false;
            bucket._revealCount = undefined;
            if (this.focusMode) this._collapseFocusSiblings(bucket);
        }
    }

    // ── Peek (related in collapsed buckets) ───────────────────────────────────

    _peekKey() {
        return [...this._relatedSet].sort().join(',');
    }

    _updatePeek(relatedIds) {
        this._nodeById.forEach((n) => { n._peekOpen = false; });
        relatedIds.forEach((id) => {
            const n = this._nodeById.get(id);
            if (!n) return;
            let p = n._parent;
            while (p && p !== this.root) {
                if (p._collapsed) p._peekOpen = true;
                p = p._parent;
            }
        });
        const key = this._peekKey();
        const changed = key !== this._peekSnapshot;
        this._peekSnapshot = key;
        return changed;
    }

    _setHover(node) {
        if (!this.relatedHighlight) return;
        const id = node?.id || null;
        if (id === this._hoverId) return;
        this._hoverId = id;
        this._relatedSet = id ? this._relatedIdsFor(node) : new Set();
        const peekChanged = this._updatePeek(this._relatedSet);
        if (peekChanged) this._structuralDraw();
        else this._applyPaint();
    }

    _clearHover(forcePeekClear = false) {
        if (!this._hoverId && !forcePeekClear) return;
        this._hoverId = null;
        this._relatedSet = new Set();
        const hadPeek = this._peekSnapshot !== '';
        this._updatePeek(new Set());
        this._peekSnapshot = '';
        if (hadPeek) this._structuralDraw();
        else this._applyPaint();
    }

    // ── In-place paint ────────────────────────────────────────────────────────

    _applyPaint() {
        this._elById.forEach((refs, id) => {
            const node = this._nodeById.get(id);
            if (!node) return;
            this._paintNodeRefs(node, refs);
        });
        this._lineById.forEach((lines, id) => {
            const hi = this._lineHighlight(id);
            lines.forEach((ln) => {
                ln.setAttribute('stroke', hi ? 'var(--c-text)' : 'currentColor');
                ln.setAttribute('stroke-width', hi ? '2' : '1');
            });
        });
        if (this.view === 'map') this._paintMapEdges();
    }

    _lineHighlight(nodeId) {
        if (!nodeId || !this._hoverId) return false;
        const n = this._nodeById.get(nodeId);
        if (!n) return false;
        return this._isRelated(n) || this._isHover(n);
    }

    _paintNodeRefs(node, refs) {
        const related = this._isRelated(node);
        const hover = this._isHover(node);
        const focused = this._isFocused(node);
        const selected = this._isSelected(node);
        const current = node.status === 'currently';

        if (refs.nodeEl) {
            refs.nodeEl.classList.toggle('index-map-node--related', related && !hover);
            refs.nodeEl.classList.toggle('index-map-node--hover', hover);
            refs.nodeEl.classList.toggle('index-map-node--focus', focused);
            refs.nodeEl.classList.toggle('index-map-node--selected', selected);
            refs.nodeEl.setAttribute('aria-selected', selected ? 'true' : 'false');
        }
        if (refs.metaEl) {
            refs.metaEl.classList.toggle('index-map-meta--current', current);
            refs.metaEl.classList.toggle('index-map-meta--related', related && !current);
        }
        if (refs.bodyEl) {
            refs.bodyEl.classList.toggle('index-map-index-body--related', related && !hover);
            refs.bodyEl.classList.toggle('index-map-index-body--hover', hover);
            refs.bodyEl.classList.toggle('index-map-index-body--focus', focused);
            refs.bodyEl.classList.toggle('index-map-index-body--selected', selected);
        }
        if (refs.badgeEl) {
            const count = refs.badgeEl.dataset.peekCount || '0';
            refs.badgeEl.classList.toggle('index-map-peek-badge--active', count !== '0');
        }
    }

    // ── Expand / select ───────────────────────────────────────────────────────

    _stopReveal() {
        if (this._revealAnimator) {
            this._revealAnimator.destroy();
            this._revealAnimator = null;
        }
        if (this._revealingNode) {
            this._revealingNode._revealCount = undefined;
            this._revealingNode = null;
        }
    }

    _collapseFocusSiblings(node) {
        if (!this.focusMode || node._depth !== this.focusDepth) return;
        const parent = node._parent;
        if (!parent?.children) return;
        parent.children.forEach((sib) => {
            if (sib === node) return;
            if (sib.children?.length) {
                sib._collapsed = true;
                sib._revealCount = undefined;
                sib._peekOpen = false;
            }
        });
    }

    _expandNode(node) {
        if (!node?.children?.length) return;
        this._collapseFocusSiblings(node);
        if (node.id && node._depth === this.focusDepth) this._openBucketId = node.id;
        const wasCollapsed = node._collapsed;
        node._collapsed = false;

        if (!wasCollapsed || !this.stagedExpand || node.children.length <= 1) {
            node._revealCount = undefined;
            this._structuralDraw();
            this._emitStateChange();
            return;
        }

        this._stopReveal();
        node._revealCount = 1;
        this._revealingNode = node;
        this._structuralDraw();

        const AF = window.AnimationFoundation;
        if (!AF?.IntervalAnimator || node.children.length <= 1) {
            node._revealCount = undefined;
            this._structuralDraw();
            this._emitStateChange();
            return;
        }

        this._revealAnimator = new AF.IntervalAnimator({
            interval: this.stagedInterval,
            onFrame: () => {
                if (!this.element || !this._revealingNode) return;
                const n = this._revealingNode;
                n._revealCount = (n._revealCount || 0) + 1;
                if (n._revealCount >= (n.children?.length || 0)) {
                    n._revealCount = undefined;
                    this._revealingNode = null;
                    this._revealAnimator?.destroy();
                    this._revealAnimator = null;
                }
                // Incremental: reposition + append new child; do not wipe existing nodes.
                this._incrementalTreeReveal();
            }
        });
        this._revealAnimator.start();
        this._emitStateChange();
    }

    /**
     * Staged-expand tick: recompute geometry, move existing node els, place missing ones.
     * Does not call _clearStage (preserves DOM under pointer).
     */
    _incrementalTreeReveal() {
        if (this.view !== 'tree' || !this.element) {
            this._structuralDraw();
            return;
        }
        const F = this._F();
        const ROW_H = F * 2;
        this._indexMap(true);
        treeAssignDepths(this.root, 0, true);
        const maxWidths = this._collectMaxWidths(this.root);
        const geo = treeBuildGeo(
            maxWidths,
            F,
            this.metaGutter ? Math.ceil(this._tw('CURRENT') + F) : 0
        );
        this._geoMap = geo.geoMap;
        this._charW = geo.charW;
        this._gutterW = geo.gutterW;
        const totalRows = this._assignRows(this.root, 0, F, ROW_H);
        this._buildVisibleList();

        let maxD = 0;
        const walkDepth = (n) => {
            if (n._depth > maxD) maxD = n._depth;
            this._visibleChildren(n).forEach(walkDepth);
        };
        walkDepth(this.root);
        const last = this._geoMap[maxD] || { labelX: this._gutterW, maxW: 0 };
        this._totalW = last.labelX + last.maxW + 2 * this._charW;
        this._totalH = totalRows * ROW_H + 4;
        this.element.style.width = `${this._totalW}px`;
        this.element.style.height = `${this._totalH}px`;
        this._svgEl.setAttribute('width', this._totalW);
        this._svgEl.setAttribute('height', this._totalH);

        // Drop SVG + ephemeral chrome; keep node/meta els
        while (this._svgEl.firstChild) this._svgEl.removeChild(this._svgEl.firstChild);
        this._lineById.clear();
        this.element.querySelectorAll('.index-map-hit, .index-map-desc, .index-map-peek-badge')
            .forEach((e) => e.remove());

        const visibleIds = new Set();
        const placeOrMove = (node) => {
            if (node.id) visibleIds.add(node.id);
            const g = this._geoMap[node._depth];
            if (!g) return;
            const refs = node.id ? this._elById.get(node.id) : null;
            if (refs?.nodeEl) {
                refs.nodeEl.style.left = `${g.labelX}px`;
                refs.nodeEl.style.top = `${node._row * ROW_H}px`;
                if (refs.metaEl) {
                    refs.metaEl.style.top = `${node._row * ROW_H}px`;
                }
            } else {
                this._placeTreeNodeLeafOnly(node, F, ROW_H);
            }
            this._visibleChildren(node).forEach(placeOrMove);
        };
        placeOrMove(this.root);

        // Remove els for nodes no longer visible (collapsed siblings)
        [...this._elById.keys()].forEach((id) => {
            if (visibleIds.has(id)) return;
            const refs = this._elById.get(id);
            refs?.nodeEl?.remove();
            refs?.metaEl?.remove();
            refs?.badgeEl?.remove();
            this._elById.delete(id);
        });

        this._drawTreeConnectors(this.root, ROW_H);
        this._applyPaint();
    }

    /** Place a single tree node without recursing into children (incremental path). */
    _placeTreeNodeLeafOnly(node, F, ROW_H) {
        const geo = this._geoMap[node._depth];
        if (!geo) return;
        const hasKids = !!(node.children && node.children.length);
        const isLeaf = !hasKids;

        if (this.metaGutter && this._gutterW && this._metaLabel(node)) {
            const meta = this.createElement('div', 'index-map-meta');
            meta.textContent = this._metaLabel(node);
            meta.style.cssText = `
                position: absolute; left: 0; top: ${node._row * ROW_H}px;
                width: ${this._gutterW - this._charW}px; height: ${ROW_H}px;
            `;
            this.element.appendChild(meta);
            if (node.id) this._elById.set(node.id, { ...(this._elById.get(node.id) || {}), metaEl: meta });
        }

        const el = this.createElement('div', 'index-map-node');
        el.dataset.nodeId = node.id || '';
        el.setAttribute('role', 'treeitem');
        if (hasKids) el.setAttribute('aria-expanded', String(this._isBranchOpen(node)));
        el.style.cssText = `
            position: absolute; left: ${geo.labelX}px; top: ${node._row * ROW_H}px;
            height: ${ROW_H}px; max-width: ${geo.railX - geo.labelX - this._charW}px;
        `;
        const labelSpan = this.createElement('span', 'index-map-node-label');
        labelSpan.textContent = node.label;
        el.appendChild(labelSpan);
        if (isLeaf && node.typeLine) {
            const typeSpan = this.createElement('span', 'index-map-node-type');
            typeSpan.textContent = node.typeLine;
            el.appendChild(typeSpan);
        }
        if ((hasKids && this.collapsible) || isLeaf) {
            el.addEventListener('mouseenter', () => this._setHover(node));
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this._activateNode(node);
            });
        }
        this.element.appendChild(el);
        if (node.id) this._elById.set(node.id, { ...(this._elById.get(node.id) || {}), nodeEl: el });
    }

    _toggleNode(node) {
        if (!node?.children?.length || !this.collapsible) return;
        if (node._collapsed) this._expandNode(node);
        else {
            this._stopReveal();
            node._collapsed = true;
            node._revealCount = undefined;
            node._peekOpen = false;
            if (node.id === this._openBucketId) this._openBucketId = '';
            this._structuralDraw();
            this._emitStateChange();
        }
    }

    _activateNode(node) {
        if (!node?.id) return;
        this._focusId = node.id;

        // Branches expand/collapse immediately; select-then-open is for leaves only.
        if (node.children?.length) {
            this._selectedId = node.id;
            this._toggleNode(node);
            this._scrollToNode(node.id);
            return;
        }

        if (this._selectedId === node.id) {
            if (this.onItemClick) {
                this.onItemClick(node._data || node);
                this._status(`OPEN — ${node.label}`);
            }
            return;
        }
        this._selectedId = node.id;
        this._status(`SELECTED — ${node.label} · Enter again to open`);
        this._applyPaint();
        this._emitStateChange();
        this._scrollToNode(node.id);
    }

    _scrollToNode(id) {
        const refs = this._elById.get(id);
        const el = refs?.nodeEl || refs?.rowEl;
        el?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }

    // ── Geometry ──────────────────────────────────────────────────────────────

    _collectMaxWidths(node, map = {}, visible = true) {
        if (visible) {
            const labelW = this._tw(node.label);
            const typeW = (!node.children?.length && node.typeLine) ? this._tw(` ${node.typeLine}`) : 0;
            map[node._depth] = Math.max(map[node._depth] || 0, labelW + typeW);
        }
        const childrenVisible = visible && this._isBranchOpen(node);
        this._visibleChildren(node).forEach((c) => this._collectMaxWidths(c, map, childrenVisible));
        return map;
    }

    _assignRows(node, cursor = 0, F = null, ROW_H = null) {
        if (F === null) F = this._F();
        if (ROW_H === null) ROW_H = F * 2;
        node._row = cursor;
        const kids = this._visibleChildren(node);
        if (!kids.length) {
            node._lastChildRow = cursor;
            return cursor + 1;
        }
        let cur = cursor;
        kids.forEach((c) => { cur = this._assignRows(c, cur, F, ROW_H); });
        node._lastChildRow = kids[kids.length - 1]._row;

        if (node.description && this._geoMap[node._depth] && this._geoMap[node._depth + 1]) {
            const { railX } = this._geoMap[node._depth];
            const parentRailX = node._depth > 0 && this._geoMap[node._depth - 1]
                ? this._geoMap[node._depth - 1].railX
                : this._geoMap[node._depth].labelX;
            const descW = (railX - this._charW) - (parentRailX + this._charW);
            if (descW > 0) {
                const descH = treeMeasureDescHeight(this._measureEl, node.description, descW, F);
                const minEnd = node._row + 1 + Math.ceil(descH / ROW_H);
                if (cur < minEnd) cur = minEnd;
            }
        }
        return cur;
    }

    _structuralDraw() {
        if (!this.element) return;
        this._indexMap(true);
        if (this.view === 'index') this._drawIndex();
        else if (this.view === 'map') this._drawMap();
        else this._drawTree();
        this._applyPaint();
    }

    _clearStage() {
        this._elById.clear();
        this._lineById.clear();
        this.element.querySelectorAll(
            '.index-map-node, .index-map-meta, .index-map-desc, .index-map-hit, ' +
            '.index-map-index-row, .index-map-year, .index-map-peek-badge, .index-map-map-node, .index-map-map-edge'
        ).forEach((e) => e.remove());
        while (this._svgEl.firstChild) this._svgEl.removeChild(this._svgEl.firstChild);
        this._svgEl.style.display = (this.view === 'tree' || this.view === 'map') ? 'block' : 'none';
    }

    // ── TREE ──────────────────────────────────────────────────────────────────

    _drawTree() {
        const F = this._F();
        const ROW_H = F * 2;
        this._clearStage();
        treeAssignDepths(this.root, 0, true);
        const maxWidths = this._collectMaxWidths(this.root);
        const geo = treeBuildGeo(maxWidths, F, this.metaGutter ? Math.ceil(this._tw('CURRENT') + F) : 0);
        this._geoMap = geo.geoMap;
        this._charW = geo.charW;
        this._gutterW = geo.gutterW;
        const totalRows = this._assignRows(this.root, 0, F, ROW_H);
        this._buildVisibleList();

        let maxD = 0;
        const walk = (n) => {
            if (n._depth > maxD) maxD = n._depth;
            this._visibleChildren(n).forEach(walk);
        };
        walk(this.root);

        const last = this._geoMap[maxD] || { labelX: this._gutterW, maxW: 0 };
        this._totalW = last.labelX + last.maxW + 2 * this._charW;
        this._totalH = totalRows * ROW_H + 4;

        this.element.style.width = `${this._totalW}px`;
        this.element.style.height = `${this._totalH}px`;
        this._svgEl.setAttribute('width', this._totalW);
        this._svgEl.setAttribute('height', this._totalH);

        this._placeTreeNode(this.root, F, ROW_H);
        this._drawTreeConnectors(this.root, ROW_H);
    }

    _drawTreeConnectors(node, ROW_H) {
        const kids = node.children;
        if (!kids?.length) return;
        const geo = this._geoMap[node._depth];
        if (!geo) return;
        const { labelX, railX } = geo;
        const actualW = this._tw(node.label);
        const py = treeYc(ROW_H, node._row);
        const lines = [];

        if (!this._isBranchOpen(node)) {
            const r = this._charW / 2;
            const crossStart = labelX + actualW;
            const crossCenter = crossStart + this._charW;
            lines.push(treeSvgLine(this._svgEl, crossStart, py, crossCenter + r, py, { dataNode: node.id }));
            lines.push(treeSvgLine(this._svgEl, crossCenter, py - r, crossCenter, py + r, { dataNode: node.id }));
            if (node._peekOpen) {
                const badge = this._peekBadgeCount(node);
                if (badge > 0) this._placePeekBadge(node, badge, this._F(), ROW_H);
            }
            if (node.id) this._lineById.set(node.id, lines);
            return;
        }

        const vis = this._visibleChildren(node);
        const childGeo = this._geoMap[node._depth + 1];
        if (!childGeo || !vis.length) return;
        lines.push(treeSvgLine(this._svgEl, labelX + actualW, py, railX, py, { dataNode: node.id }));
        lines.push(treeSvgLine(this._svgEl, railX, py, railX, treeYc(ROW_H, node._lastChildRow), { dataNode: node.id }));
        vis.forEach((child) => {
            lines.push(treeSvgLine(this._svgEl, railX, treeYc(ROW_H, child._row), childGeo.labelX, treeYc(ROW_H, child._row), { dataNode: node.id }));
            this._drawTreeConnectors(child, ROW_H);
        });
        if (node.id) this._lineById.set(node.id, lines);
    }

    _peekBadgeCount(node) {
        if (!this._relatedSet.size) return 0;
        let c = 0;
        const walk = (n) => {
            (n.children || []).forEach((ch) => {
                if (ch.id && this._relatedSet.has(ch.id)) c += 1;
                walk(ch);
            });
        };
        walk(node);
        return c;
    }

    _placePeekBadge(node, count, F, ROW_H) {
        const geo = this._geoMap[node._depth];
        if (!geo || !count) return;
        const badge = this.createElement('div', 'index-map-peek-badge');
        badge.textContent = String(count);
        badge.dataset.peekCount = String(count);
        badge.style.cssText = `
            position: absolute;
            left: ${geo.labelX + this._tw(node.label) + this._charW * 2}px;
            top: ${node._row * ROW_H}px;
            height: ${ROW_H}px;
            display: flex; align-items: center;
            font-size: ${F * 0.75}px;
            color: var(--c-border);
            pointer-events: none;
        `;
        this.element.appendChild(badge);
        if (node.id) {
            const refs = this._elById.get(node.id) || {};
            refs.badgeEl = badge;
            this._elById.set(node.id, refs);
        }
    }

    _placeTreeNode(node, F, ROW_H) {
        const geo = this._geoMap[node._depth];
        if (!geo) return;
        const hasKids = !!(node.children && node.children.length);
        const isLeaf = !hasKids;
        const canInteract = (hasKids && this.collapsible) || isLeaf;

        if (this.metaGutter && this._gutterW && this._metaLabel(node)) {
            const meta = this.createElement('div', 'index-map-meta');
            meta.textContent = this._metaLabel(node);
            meta.style.cssText = `
                position: absolute; left: 0; top: ${node._row * ROW_H}px;
                width: ${this._gutterW - this._charW}px; height: ${ROW_H}px;
            `;
            this.element.appendChild(meta);
            if (node.id) this._elById.set(node.id, { ...(this._elById.get(node.id) || {}), metaEl: meta });
        }

        const el = this.createElement('div', 'index-map-node');
        el.dataset.nodeId = node.id || '';
        el.setAttribute('role', 'treeitem');
        el.setAttribute('aria-expanded', hasKids ? String(this._isBranchOpen(node)) : undefined);
        el.style.cssText = `
            position: absolute; left: ${geo.labelX}px; top: ${node._row * ROW_H}px;
            height: ${ROW_H}px; max-width: ${geo.railX - geo.labelX - this._charW}px;
        `;

        const labelSpan = this.createElement('span', 'index-map-node-label');
        labelSpan.textContent = node.label;
        el.appendChild(labelSpan);

        if (isLeaf && node.typeLine) {
            const typeSpan = this.createElement('span', 'index-map-node-type');
            typeSpan.textContent = node.typeLine;
            el.appendChild(typeSpan);
        }

        if (canInteract) {
            el.addEventListener('mouseenter', () => this._setHover(node));
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this._activateNode(node);
            });
        }

        this.element.appendChild(el);
        if (node.id) this._elById.set(node.id, { ...(this._elById.get(node.id) || {}), nodeEl: el });

        if (hasKids && this.collapsible && !this._isBranchOpen(node)) {
            const hit = this.createElement('div', 'index-map-hit');
            hit.style.cssText = `
                position: absolute;
                left: ${geo.labelX + this._tw(node.label)}px;
                top: ${node._row * ROW_H}px;
                width: ${this._charW * 2}px; height: ${ROW_H}px;
            `;
            hit.addEventListener('click', () => this._activateNode(node));
            this.element.appendChild(hit);
            const badge = this._peekBadgeCount(node);
            if (badge) this._placePeekBadge(node, badge, F, ROW_H);
        }

        if (hasKids && this._isBranchOpen(node) && node.description) {
            const desc = this.createElement('div', 'index-map-desc');
            desc.textContent = node.description;
            const parentRailX = node._depth > 0 ? this._geoMap[node._depth - 1]?.railX : geo.labelX;
            desc.style.cssText = `
                position: absolute;
                left: ${parentRailX + this._charW}px;
                top: ${(node._row + 1) * ROW_H}px;
                width: ${Math.max(0, geo.railX - parentRailX - 2 * this._charW)}px;
            `;
            this.element.appendChild(desc);
        }

        this._visibleChildren(node).forEach((c) => this._placeTreeNode(c, F, ROW_H));
    }

    // ── INDEX ─────────────────────────────────────────────────────────────────

    _drawIndex() {
        const F = this._F();
        const ROW_H = F * 2;
        this._clearStage();
        const leaves = this._flattenLeaves();
        const groups = new Map();
        leaves.forEach((n) => {
            const key = n.status === 'currently' ? 'CURRENTLY' : (n.meta || '—');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(n);
        });
        const order = ['CURRENTLY', ...[...groups.keys()].filter((k) => k !== 'CURRENTLY').sort((a, b) => String(b).localeCompare(String(a)))];
        const gutter = Math.ceil(this._tw('CURRENTLY') + F);
        let row = 0;
        this._visibleList = [];

        order.forEach((key) => {
            const items = groups.get(key);
            if (!items?.length) return;
            const yearEl = this.createElement('div', 'index-map-year');
            yearEl.textContent = key;
            yearEl.style.cssText = `position: absolute; left: 0; top: ${row * ROW_H}px; width: 100%; height: ${ROW_H}px;`;
            this.element.appendChild(yearEl);
            row += 1;

            items.forEach((node, i) => {
                const rowEl = this.createElement('div', 'index-map-index-row');
                rowEl.dataset.nodeId = node.id || '';
                rowEl.style.cssText = `position: absolute; left: 0; top: ${row * ROW_H}px; width: 100%; height: ${ROW_H}px;`;

                const meta = this.createElement('div', 'index-map-meta');
                meta.textContent = this._metaLabel(node) || key;
                meta.style.cssText = `width: ${gutter}px; flex-shrink: 0;`;

                const body = this.createElement('div', 'index-map-index-body');
                const title = this.createElement('span', 'index-map-index-title');
                title.textContent = node.label;
                const type = this.createElement('span', 'index-map-index-type');
                type.textContent = node.typeLine || '';
                body.appendChild(title);
                body.appendChild(type);
                rowEl.appendChild(meta);
                rowEl.appendChild(body);

                rowEl.addEventListener('mouseenter', () => this._setHover(node));
                rowEl.addEventListener('click', () => this._activateNode(node));

                this.element.appendChild(rowEl);
                if (node.id) {
                    this._elById.set(node.id, { rowEl, metaEl: meta, bodyEl: body, nodeEl: rowEl });
                }
                this._visibleList.push(node);
                row += 1;
            });
        });

        this._totalH = row * ROW_H + 4;
        this.element.style.width = '100%';
        this.element.style.height = `${this._totalH}px`;
    }

    _flattenLeaves() {
        const leaves = [];
        const walk = (n) => {
            if (!n.children?.length) {
                if (n !== this.root) leaves.push(n);
                return;
            }
            n.children.forEach(walk);
        };
        walk(this.root);
        return leaves;
    }

    // ── MAP ───────────────────────────────────────────────────────────────────

    _drawMap() {
        const F = this._F();
        const ROW_H = F * 2;
        const COL_W = F * 18;
        this._clearStage();
        this._mapPositions = new Map();

        const buckets = (this.root.children || []).filter((b) => b.children?.length);
        let col = 0;
        let maxRow = 0;

        buckets.forEach((bucket) => {
            const x = col * COL_W + F * 2;
            let r = 0;
            (bucket.children || []).forEach((leaf) => {
                if (!leaf.id) return;
                const y = r * ROW_H + F * 2;
                this._mapPositions.set(leaf.id, { x, y, bucket: bucket.label });
                const el = this.createElement('div', 'index-map-map-node');
                el.textContent = leaf.label;
                el.dataset.nodeId = leaf.id;
                el.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${COL_W - F}px; height: ${ROW_H}px;`;
                el.addEventListener('mouseenter', () => this._setHover(leaf));
                el.addEventListener('click', () => this._activateNode(leaf));
                this.element.appendChild(el);
                this._elById.set(leaf.id, { nodeEl: el, mapEl: el });
                r += 1;
            });
            maxRow = Math.max(maxRow, r);
            col += 1;
        });

        this._totalW = col * COL_W + F * 4;
        this._totalH = maxRow * ROW_H + F * 4;
        this.element.style.width = `${this._totalW}px`;
        this.element.style.height = `${this._totalH}px`;
        this._svgEl.setAttribute('width', this._totalW);
        this._svgEl.setAttribute('height', this._totalH);

        const drawn = new Set();
        this._nodeById.forEach((node) => {
            if (!node.id || !node.related) return;
            const a = this._mapPositions.get(node.id);
            if (!a) return;
            node.related.forEach((rid) => {
                const key = [node.id, rid].sort().join('-');
                if (drawn.has(key)) return;
                drawn.add(key);
                const b = this._mapPositions.get(rid);
                if (!b) return;
                const ln = treeSvgLine(this._svgEl,
                    a.x + COL_W / 2, a.y + ROW_H / 2,
                    b.x + COL_W / 2, b.y + ROW_H / 2,
                    { dataNode: node.id }
                );
                ln.classList.add('index-map-map-edge');
                if (!this._lineById.has(node.id)) this._lineById.set(node.id, []);
                this._lineById.get(node.id).push(ln);
            });
        });
    }

    _paintMapEdges() {
        this._svgEl.querySelectorAll('.index-map-map-edge').forEach((ln) => {
            const nid = ln.dataset.nodeId;
            const hi = nid && (this._lineHighlight(nid) || this._relatedSet.has(nid));
            ln.setAttribute('stroke', hi ? 'var(--c-text)' : 'var(--c-border)');
            ln.setAttribute('stroke-width', hi ? '2' : '1');
        });
    }

    _buildVisibleList() {
        this._visibleList = [];
        const walk = (n) => {
            this._visibleList.push(n);
            this._visibleChildren(n).forEach(walk);
        };
        walk(this.root);
        return this._visibleList;
    }

    // ── Keyboard ──────────────────────────────────────────────────────────────

    _handleKey(e) {
        const list = this._visibleList.length ? this._visibleList : this._buildVisibleList();
        if (!list.length) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            this._selectedId = null;
            this._status('READY');
            this._applyPaint();
            this._emitStateChange();
            return;
        }

        let idx = list.findIndex((n) => n.id && n.id === this._focusId);
        if (idx < 0) idx = 0;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this._focusId = list[Math.min(list.length - 1, idx + 1)].id || null;
            this._applyPaint();
            this._scrollToNode(this._focusId);
            this._emitStateChange();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this._focusId = list[Math.max(0, idx - 1)].id || null;
            this._applyPaint();
            this._scrollToNode(this._focusId);
            this._emitStateChange();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const n = list[idx];
            if (n.children?.length && !this._isBranchOpen(n)) this._expandNode(n);
            else if (n.children?.length) {
                const kids = this._visibleChildren(n);
                if (kids[0]?.id) this._focusId = kids[0].id;
                this._applyPaint();
                this._scrollToNode(this._focusId);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const n = list[idx];
            if (n.children?.length && this._isBranchOpen(n)) this._toggleNode(n);
            else if (n._parent?.id) {
                this._focusId = n._parent.id;
                this._applyPaint();
                this._scrollToNode(this._focusId);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this._activateNode(list[idx]);
        }
    }

    destroy() {
        this._stopReveal();
        if (this.element && this._onKeyDown) {
            this.element.removeEventListener('keydown', this._onKeyDown);
        }
        if (this.element && this._onStageLeave) {
            this.element.removeEventListener('mouseleave', this._onStageLeave);
        }
        this._onKeyDown = null;
        this._onStageLeave = null;
        this._measureEl = null;
        this._svgEl = null;
        this._elById.clear();
        this._lineById.clear();
        super.destroy();
    }
}

export default IndexMapTOC;
