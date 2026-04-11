/**
 * DISTORT — GPU Render Path
 *
 * Executes contiguous runs of GPU-capable EffectNodes on the GPU (WebGPU or WebGL2)
 * without CPU readback between nodes. CPU readback occurs only at the end of each
 * contiguous GPU run, minimising the most expensive GPU↔CPU transfer.
 *
 * OWNED CONCERNS (this file only):
 * - Partitioning a node list into GPU-capable and CPU-only runs
 * - GPU texture upload, shader dispatch loop, and pixel readback
 * - Uniform buffer assembly from resolved node params
 * - BufferRing lifecycle per render
 *
 * NOT owned here:
 * - GPU context creation → GPUFoundation (assets/js/core/gpu-foundation.js)
 * - Shader source strings → distort/shaders/*.shader.js
 * - Sequential CPU node execution → Pipeline._runNode
 * - Buffer recycling for CPU buffers → BufferPool
 *
 * USAGE (from Pipeline):
 *   const gpuPath = new GPURenderPath(gpuCtx);
 *   const runs = gpuPath.partitionNodes(activeNodes);
 *   for (const run of runs) {
 *     if (run.gpu) {
 *       bufA = await gpuPath.execute(bufA, run.nodes, w, h, pipelineCtx);
 *     } else {
 *       // existing CPU path
 *     }
 *   }
 */

import { GPUFoundation } from '../../../../core/gpu-foundation.js';

/**
 * @typedef {Object} NodeRun
 * @property {boolean}      gpu   - true = GPU run, false = CPU run
 * @property {EffectNode[]} nodes - ordered slice of active nodes for this run
 */

export class GPURenderPath {
  /**
   * @param {import('../../../../core/gpu-foundation.js').GPUContext} gpuCtx
   */
  constructor(gpuCtx) {
    this._ctx = gpuCtx;
    /** Reusable BufferRing — resized as needed between runs. */
    this._ring = null;
    this._destroyed = false;
  }

  // ── Node partitioning ──────────────────────────────────────────────────────

  /**
   * Partition an ordered list of active nodes into alternating GPU/CPU runs.
   *
   * A node is routed to GPU if:
   *   1. node.gpuCapable === true
   *   2. The node has no active mask (mask.enabled && mask.source !== 'none')
   *   3. The node has no active modulation (Object.keys(node.modulation).length === 0)
   *   4. node.opacity === 1 && node.blendMode === 'normal'
   *
   * Conditions 2–4 are the same constraints that cause Pipeline to take the
   * needsBlend branch, which the GPU path does not currently handle.
   *
   * @param {EffectNode[]} nodes - enabled nodes in pipeline order
   * @returns {NodeRun[]}
   */
  partitionNodes(nodes) {
    const runs = [];
    let i = 0;
    while (i < nodes.length) {
      const node = nodes[i];
      if (this._isGPUEligible(node)) {
        const gpuRun = [];
        while (i < nodes.length && this._isGPUEligible(nodes[i])) {
          gpuRun.push(nodes[i++]);
        }
        runs.push({ gpu: true, nodes: gpuRun });
      } else {
        const cpuRun = [];
        while (i < nodes.length && !this._isGPUEligible(nodes[i])) {
          cpuRun.push(nodes[i++]);
        }
        runs.push({ gpu: false, nodes: cpuRun });
      }
    }
    return runs;
  }

  /**
   * Check whether a single node can be routed to the GPU in this render.
   * @param {EffectNode} node
   * @returns {boolean}
   */
  _isGPUEligible(node) {
    if (!node.gpuCapable) return false;
    if (node.mask?.enabled && node.mask.source !== 'none') return false;
    if (Object.keys(node.modulation ?? {}).length > 0) return false;
    if (node.opacity < 1) return false;
    if (node.blendMode !== 'normal') return false;
    // Prefer WebGPU shader when context is WebGPU; fall back to GLSL for WebGL2
    if (this._ctx.tier === 'webgpu' && node.wgsl() === null) return false;
    if (this._ctx.tier === 'webgl2' && node.glsl() === null) return false;
    return true;
  }

  // ── GPU execution ─────────────────────────────────────────────────────────

  /**
   * Run a contiguous GPU run, returning updated pixel data.
   *
   * @param {Uint8ClampedArray} inputPixels - RGBA, w*h*4
   * @param {EffectNode[]} nodes            - GPU-eligible nodes (in order)
   * @param {number} width
   * @param {number} height
   * @param {Object} pipelineCtx            - render context from Pipeline (quality, seeds, etc.)
   * @returns {Promise<Uint8ClampedArray>}  - RGBA output, same dimensions
   */
  async execute(inputPixels, nodes, width, height, pipelineCtx) {
    if (this._destroyed || nodes.length === 0) return inputPixels;
    if (width * height < GPUFoundation.GPU_MIN_PIXELS) return inputPixels;

    // Initialise or resize ring
    if (!this._ring) {
      this._ring = this._ctx.createBufferRing(width, height);
    } else {
      this._ring.resize(width, height);
    }

    // Upload source pixels to the write side, then swap so they're on the read side
    this._ctx.uploadPixels(this._ring, inputPixels, width, height);
    this._ring.swap();

    // Dispatch each node's shader
    for (const node of nodes) {
      this._dispatchNode(node, width, height, pipelineCtx);
    }

    // Read back result (async for WebGPU, sync for WebGL2)
    const out = await this._ctx.readbackPixels(this._ring, width, height);
    return out;
  }

  /**
   * Dispatch one node's GPU shader.
   * Resolves params the same way EffectModule._resolveParams does (preview caps applied).
   * @param {EffectNode} node
   * @param {number} width
   * @param {number} height
   * @param {Object} ctx - pipeline render context
   */
  _dispatchNode(node, width, height, ctx) {
    const bindings = node.gpuBindings();
    const uniforms = this._buildUniforms(node, bindings, width, height, ctx);

    if (this._ctx.tier === 'webgpu') {
      const wgslSrc = node.wgsl();
      if (!wgslSrc) return;

      if (bindings?.multiPass) {
        const passes = typeof bindings.passesFromParams === 'function'
          ? bindings.passesFromParams(this._resolveParams(node, ctx))
          : (bindings.passes ?? 2);
        for (let pass = 0; pass < passes; pass++) {
          this._ctx.dispatchCompute(wgslSrc, this._ring, width, height, { ...uniforms, uPass: pass });
        }
      } else {
        this._ctx.dispatchCompute(wgslSrc, this._ring, width, height, uniforms);
      }
    } else {
      const glslSrc = node.glsl();
      if (!glslSrc) return;

      if (bindings?.multiPass) {
        const passes = typeof bindings.passesFromParams === 'function'
          ? bindings.passesFromParams(this._resolveParams(node, ctx))
          : (bindings.passes ?? 2);
        for (let pass = 0; pass < passes; pass++) {
          this._ctx.drawFragment(glslSrc, this._ring, width, height, { ...uniforms, uPass: pass });
        }
      } else {
        this._ctx.drawFragment(glslSrc, this._ring, width, height, uniforms);
      }
    }
  }

  /**
   * Build the uniform data object from a node's current params.
   * Applies preview caps (matching _resolveParams logic) and appends
   * resolution uniforms expected by all shaders.
   *
   * @param {EffectNode} node
   * @param {Object|null} bindings
   * @param {number} width
   * @param {number} height
   * @param {Object} ctx
   * @returns {Object}
   */
  _buildUniforms(node, bindings, width, height, ctx) {
    const isPreview = ctx?.quality === 'preview';

    // Build preview-capped resolved params (mirrors EffectModule._resolveParams)
    const resolved = {};
    for (const [key, def] of Object.entries(node.paramDefs ?? {})) {
      if (key === '__opacity__') continue;
      let val = node.params[key];
      if (isPreview && def) {
        if (def.previewMax !== undefined) val = Math.min(val, def.previewMax);
        if (def.previewMin !== undefined) val = Math.max(val, def.previewMin);
      }
      resolved[key] = val;
    }

    const uniforms = {
      uWidth:  width,
      uHeight: height,
    };

    if (!bindings?.uniforms) return uniforms;

    // If the binding descriptor provides a uniformMap function, use it to derive
    // GPU uniform values from the resolved params (e.g. string→int conversion).
    if (typeof bindings.uniformMap === 'function') {
      const mapped = bindings.uniformMap(resolved);
      return { ...uniforms, ...mapped };
    }

    // Otherwise, map param keys directly to uniform names
    for (const key of Object.keys(bindings.uniforms)) {
      uniforms[key] = resolved[key] ?? 0;
    }

    return uniforms;
  }

  /**
   * Resolve preview-capped params for a node (mirrors EffectModule._resolveParams).
   * Used internally to compute passesFromParams with correct values.
   * @param {EffectNode} node
   * @param {Object} ctx
   * @returns {Object}
   */
  _resolveParams(node, ctx) {
    const isPreview = ctx?.quality === 'preview';
    const resolved = {};
    for (const [key, def] of Object.entries(node.paramDefs ?? {})) {
      if (key === '__opacity__') continue;
      let val = node.params[key];
      if (isPreview && def) {
        if (def.previewMax !== undefined) val = Math.min(val, def.previewMax);
        if (def.previewMin !== undefined) val = Math.max(val, def.previewMin);
      }
      resolved[key] = val;
    }
    return resolved;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._ring?.destroy();
    this._ring = null;
    this._ctx  = null;
  }
}
