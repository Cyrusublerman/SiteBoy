/**
 * TreeTOC geometry core — shared layout math for TreeTOC + IndexMapTOC.
 */

export function treeTw(measureEl, str, F) {
    if (measureEl) {
        measureEl.style.fontSize = `${F}px`;
        measureEl.textContent = str || '';
        const w = measureEl.getBoundingClientRect().width;
        if (w > 0) return w;
    }
    return (str || '').length * F * 0.60;
}

export function treeAssignDepths(node, d = 0, defaultCollapsed = true) {
    node._depth = d;
    if (node._collapsed === undefined) node._collapsed = d > 0 && defaultCollapsed;
    (node.children || []).forEach((c) => treeAssignDepths(c, d + 1, defaultCollapsed));
}

export function treeYc(ROW_H, row) {
    return row * ROW_H + ROW_H / 2;
}

export function treeBuildGeo(maxWidths, F, gutterW = 0) {
    const charW = F * 0.60;
    const N = charW * 6;
    const depths = Object.keys(maxWidths).map(Number).sort((a, b) => a - b);
    let labelX = gutterW;
    const geoMap = {};
    for (const d of depths) {
        const textX = labelX + charW;
        const railX = textX + maxWidths[d] + charW + N;
        geoMap[d] = { labelX, textX, maxW: maxWidths[d], railX };
        labelX = railX + N;
    }
    return { geoMap, charW, halfN: N, gutterW };
}

export function treeMeasureDescHeight(measureEl, text, width, F) {
    if (!measureEl?.isConnected) {
        const charsPerLine = Math.max(1, Math.floor(width / (F * 0.75 * 0.60)));
        return Math.ceil(text.length / charsPerLine) * (F * 0.75 * 1.4);
    }
    const orig = measureEl.style.cssText;
    measureEl.style.cssText = `
        position: absolute; visibility: hidden;
        font-family: 'Atkinson Hyperlegible Mono', monospace; font-weight: 400;
        font-size: ${F * 0.75}px; line-height: 1.4;
        width: ${width}px; white-space: normal; word-break: break-word;
        left: -9999px; top: 0; pointer-events: none;
    `;
    measureEl.textContent = text;
    const h = measureEl.getBoundingClientRect().height;
    measureEl.style.cssText = orig;
    return h || (F * 0.75 * 1.4);
}

export function treeSvgLine(svgEl, x1, y1, x2, y2, opts = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', Math.round(x1));
    el.setAttribute('y1', Math.round(y1));
    el.setAttribute('x2', Math.round(x2));
    el.setAttribute('y2', Math.round(y2));
    el.setAttribute('stroke', opts.highlight ? 'var(--c-text)' : 'currentColor');
    el.setAttribute('stroke-width', opts.highlight ? '2' : '1');
    if (opts.dataNode) el.dataset.nodeId = opts.dataNode;
    svgEl.appendChild(el);
    return el;
}

export default {
    treeTw,
    treeAssignDepths,
    treeYc,
    treeBuildGeo,
    treeMeasureDescHeight,
    treeSvgLine
};
