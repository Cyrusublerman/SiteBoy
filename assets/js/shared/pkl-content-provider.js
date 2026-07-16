const DEFAULT_BASE_URL = '/generated/pkl';

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function graphDigestPayload(graph) {
  const { generated_at: _generatedAt, content_sha256: _digest, ...payload } = graph;
  return payload;
}

function normaliseSearchText(value) {
  return String(value ?? '').toLocaleLowerCase();
}

export class PKLContentProvider {
  constructor({ baseUrl = DEFAULT_BASE_URL, fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function') {
      throw new TypeError('PKLContentProvider requires a fetch implementation');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.graph = null;
    this.manifest = null;
    this.objectsByUid = new Map();
  }

  async load({ force = false } = {}) {
    if (this.graph && !force) {
      return this.graph;
    }

    const [manifestResponse, graphResponse] = await Promise.all([
      this.fetchImpl(`${this.baseUrl}/manifest.json`, { cache: 'no-cache' }),
      this.fetchImpl(`${this.baseUrl}/public-graph.json`, { cache: 'no-cache' })
    ]);

    if (!manifestResponse.ok) {
      throw new Error(`Unable to load PKL manifest: HTTP ${manifestResponse.status}`);
    }
    if (!graphResponse.ok) {
      throw new Error(`Unable to load PKL public graph: HTTP ${graphResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    const graph = await graphResponse.json();
    await this.validateSnapshot(manifest, graph);

    this.manifest = manifest;
    this.graph = graph;
    this.objectsByUid = new Map(graph.objects.map((object) => [object.uid, object]));
    return graph;
  }

  async validateSnapshot(manifest, graph) {
    if (graph?.schema_version !== 'pkl-public-graph-v0') {
      throw new Error(`Unsupported PKL public graph schema: ${graph?.schema_version ?? 'missing'}`);
    }
    if (!Array.isArray(graph.objects)) {
      throw new Error('PKL public graph objects must be an array');
    }
    if (manifest?.content_sha256 !== graph.content_sha256) {
      throw new Error('PKL manifest and graph digests do not match');
    }

    const calculated = await sha256Hex(stableStringify(graphDigestPayload(graph)));
    if (calculated !== graph.content_sha256) {
      throw new Error('PKL public graph digest validation failed');
    }

    const identities = new Set();
    const routes = new Set();
    for (const object of graph.objects) {
      if (!object?.uid || !object?.title || !object?.object_type || !object?.route) {
        throw new Error('PKL public graph contains an incomplete object');
      }
      if (identities.has(object.uid)) {
        throw new Error(`Duplicate PKL public UID: ${object.uid}`);
      }
      if (routes.has(object.route)) {
        throw new Error(`Duplicate PKL public route: ${object.route}`);
      }
      identities.add(object.uid);
      routes.add(object.route);
    }
  }

  requireLoaded() {
    if (!this.graph) {
      throw new Error('PKLContentProvider.load() must complete before reading content');
    }
  }

  getObject(uid) {
    this.requireLoaded();
    return this.objectsByUid.get(uid) ?? null;
  }

  getByRoute(route) {
    this.requireLoaded();
    const uid = this.graph.routes?.[route] ?? this.graph.aliases?.[route];
    return uid ? this.getObject(uid) : null;
  }

  getRelated(uid, { type = null } = {}) {
    const object = this.getObject(uid);
    if (!object) return [];
    const related = [];
    for (const relationship of object.relationships ?? []) {
      if (type && relationship.type !== type) continue;
      const target = this.getObject(relationship.target);
      if (target) related.push({ relationship, object: target });
    }
    return related;
  }

  getBacklinks(uid) {
    const object = this.getObject(uid);
    if (!object) return [];
    return (object.backlinks ?? []).map((backlinkUid) => this.getObject(backlinkUid)).filter(Boolean);
  }

  list({ objectType = null, tag = null, project = null } = {}) {
    this.requireLoaded();
    return this.graph.objects.filter((object) => {
      if (objectType && object.object_type !== objectType) return false;
      if (tag && !(object.tags ?? []).includes(tag)) return false;
      if (project && !(object.projects ?? []).includes(project)) return false;
      return true;
    });
  }

  search(query, { objectType = null, tag = null, project = null, limit = 50 } = {}) {
    const terms = normaliseSearchText(query).split(/\s+/).filter(Boolean);
    const candidates = this.list({ objectType, tag, project });
    if (!terms.length) return candidates.slice(0, limit);

    return candidates
      .map((object) => {
        const title = normaliseSearchText(object.title);
        const summary = normaliseSearchText(object.summary);
        const body = normaliseSearchText(object.body);
        const tags = normaliseSearchText((object.tags ?? []).join(' '));
        let score = 0;
        for (const term of terms) {
          if (title.includes(term)) score += 8;
          if (tags.includes(term)) score += 4;
          if (summary.includes(term)) score += 3;
          if (body.includes(term)) score += 1;
        }
        return { object, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.object.title.localeCompare(b.object.title))
      .slice(0, limit)
      .map(({ object }) => object);
  }
}

export const pklContentProvider = new PKLContentProvider();

export { stableStringify, sha256Hex };
