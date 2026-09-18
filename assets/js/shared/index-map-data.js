/**
 * Index Map data — registry → ontology tree (B6 SSoT).
 */

export const BUCKET_DEFS = {
    initiative: 'Concrete programmes that bridge tools, systems, and practice.',
    research: 'Investigations into process, governance, and generative method.',
    artifact: 'Shipped tools, processors, and interactive outputs.',
    path: 'Standing directions of thought — curated from ideas corpus.'
};

export const BUCKET_LABELS = {
    initiative: 'INITIATIVES',
    research: 'RESEARCH',
    artifact: 'ARTIFACTS',
    path: 'PATHS'
};

/** Path-only rows (idea stubs; no case-study page required). */
export const PATH_REGISTRY = [
    {
        id: 'paths-systems',
        title: 'OWNED SYSTEMS',
        typeLine: 'Area of practice',
        year: '2026',
        status: 'currently',
        bucket: 'path',
        related: ['siteboy', 'process-engineering']
    },
    {
        id: 'paths-evolution',
        title: 'EVOLUTIONARY FORM',
        typeLine: 'Area of interest',
        year: '2026',
        status: 'currently',
        bucket: 'path',
        related: ['synthetic-biophilia', 'generative-art']
    },
    {
        id: 'paths-signal',
        title: 'SIGNAL → MATTER',
        typeLine: 'Area of practice',
        year: '2025',
        bucket: 'path',
        related: ['distort', 'multifilament-print', 'music-audio']
    }
];

const BUCKET_ORDER = ['initiative', 'research', 'artifact', 'path'];

function leafNode(entry) {
    const year = entry.year || entry.meta || '';
    const typeLine = entry.typeLine || entry.description || '';
    const node = {
        id: entry.id,
        label: entry.title || entry.label || entry.id,
        typeLine,
        meta: year,
        status: entry.status === 'currently' ? 'currently' : undefined,
        related: Array.isArray(entry.related) ? [...entry.related] : []
    };
    if (entry.kind || entry.src || entry.global) {
        node._data = { section: 'projects', slug: entry.id, id: entry.id };
    }
    return node;
}

/**
 * Build IndexMap tree from PROJECT_REGISTRY (+ optional PATH_REGISTRY).
 * @param {Array} registry
 * @param {Array} [paths]
 * @param {string} [rootLabel]
 */
export function buildIndexMapTree(registry, paths = PATH_REGISTRY, rootLabel = 'INDEX') {
    const buckets = {};
    BUCKET_ORDER.forEach((b) => {
        buckets[b] = {
            id: b === 'initiative' ? 'initiatives' : b === 'research' ? 'research' : b === 'artifact' ? 'artifacts' : 'paths',
            label: BUCKET_LABELS[b],
            description: BUCKET_DEFS[b],
            children: []
        };
    });

    (registry || []).forEach((entry) => {
        const bucket = entry.bucket || 'artifact';
        if (!buckets[bucket]) buckets[bucket] = { id: bucket, label: bucket.toUpperCase(), children: [] };
        buckets[bucket].children.push(leafNode(entry));
    });

    (paths || []).forEach((entry) => {
        const bucket = entry.bucket || 'path';
        if (!buckets[bucket]) return;
        buckets[bucket].children.push(leafNode(entry));
    });

    return {
        id: 'root',
        label: rootLabel,
        children: BUCKET_ORDER.map((b) => buckets[b]).filter((b) => b.children.length > 0)
    };
}

/**
 * Parse projects subsection: registry id → detail; index/... → map state.
 * @returns {{ mode: 'index'|'detail'|'index-state', projectId?, state? }}
 */
export function parseProjectsSubsection(subsection, registryIds) {
    if (!subsection) return { mode: 'index' };
    const parts = subsection.split('/');
    const first = parts[0];
    if (first === 'index') {
        const viewRaw = parts[1] || 'tree';
        const v = ['tree', 'index', 'map'].includes(viewRaw) ? viewRaw : 'tree';
        const open = !parts[2] || parts[2] === '-' ? '' : parts[2];
        const focus = !parts[3] || parts[3] === '-' ? '' : parts[3];
        return { mode: 'index-state', state: { view: v, open, focus } };
    }
    if (registryIds.has(first)) return { mode: 'detail', projectId: first };
    return { mode: 'index' };
}

export function encodeIndexState(state) {
    const view = state?.view || 'tree';
    const open = state?.open || '';
    const focus = state?.focus || '';
    if (view === 'tree' && !open && !focus) return 'index';
    if (!open && !focus) return `index/${view}`;
    return `index/${view}/${open || '-'}/${focus || '-'}`;
}

export default buildIndexMapTree;
