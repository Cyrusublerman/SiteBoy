/**
 * DISTORT — Recipe: export, import, and morph serialised node stack JSON.
 * JSON format: { version, globalSeed, src:{w,h}, ps, nodes:[] }
 * where each node is produced by EffectNode.toJSON().
 */
export class Recipe {
  /**
   * Serialise current state to a recipe JSON string.
   * @param {import('./AppState.js').AppState} state
   * @param {object} _registry - Unused, kept for API symmetry
   * @returns {string}
   */
  static exp(state, _registry) {
    return JSON.stringify({
      version: 1,
      globalSeed: state.globalSeed,
      src: { w: state.sourceW, h: state.sourceH },
      ps: state.previewScale,
      nodes: state.stack.map(n => n.toJSON())
    }, null, 2);
  }

  /**
   * Interpolate all numeric parameters between two recipe JSON strings.
   * Nodes at the same index with the same type are interpolated.
   * @param {string} jsonA
   * @param {string} jsonB
   * @param {number} t - Blend: 0 = A, 1 = B
   * @returns {string} Interpolated recipe JSON
   */
  static morph(jsonA, jsonB, t) {
    const a = JSON.parse(jsonA), b = JSON.parse(jsonB);
    const out = JSON.parse(jsonA);
    out.globalSeed = Math.round(a.globalSeed * (1 - t) + (b.globalSeed || a.globalSeed) * t);
    const maxNodes = Math.min(a.nodes?.length || 0, b.nodes?.length || 0);
    for (let i = 0; i < maxNodes; i++) {
      const an = a.nodes[i], bn = b.nodes[i];
      if (an.type !== bn.type) continue;
      out.nodes[i].opacity = an.opacity * (1 - t) + bn.opacity * t;
      for (const k in an.params) {
        if (typeof an.params[k] === 'number' && typeof bn.params[k] === 'number') {
          out.nodes[i].params[k] = an.params[k] * (1 - t) + bn.params[k] * t;
        }
      }
    }
    return JSON.stringify(out);
  }

  /**
   * Deserialise a recipe JSON string into state.
   * @param {import('./AppState.js').AppState} state
   * @param {string} json
   * @param {object} registry - REGISTRY from nodes/registry.js
   */
  static imp(state, json, registry) {
    const d = JSON.parse(json);
    state.globalSeed = d.globalSeed ?? 42;
    state.previewScale = d.ps ?? d.previewScale ?? 0.5;
    state.stack = [];
    const allEntries = Object.values(registry).flat();
    for (const nd of (d.nodes || [])) {
      const entry = allEntries.find(e => e.type === nd.type);
      if (entry) {
        const n = entry.factory();
        n.fromJSON(nd);
        state.stack.push(n);
      }
    }
    state.soloNodeId = null;
    state.needsRender = true;
  }
}
