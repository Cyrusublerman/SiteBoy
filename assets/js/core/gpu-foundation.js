/**
 * GPU Foundation — SiteBoy Framework
 *
 * SINGLE SOURCE OF TRUTH for all GPU compute logic.
 *
 * OWNED CONCERNS:
 * - GPU feature detection (WebGPU / WebGL2 / CPU fallback)
 * - GPU context creation and lifecycle
 * - Texture and buffer management for GPU compute
 * - Shader pipeline compilation and caching
 * - Pixel upload / readback between CPU and GPU
 * - Ping-pong buffer management (BufferRing)
 *
 * FILE OWNERSHIP (SSoT):
 * - All GPU context management → gpu-foundation.js (THIS FILE)
 * - Animation timing → animation-foundation.js
 * - Distort pipeline GPU dispatch → distort/core/GPURenderPath.js
 * - Node shader sources → distort/shaders/*.shader.js
 *
 * FORBIDDEN OUTSIDE THIS FILE:
 * - navigator.gpu
 * - canvas.getContext('webgl2') for compute purposes
 * - GPUDevice, GPUAdapter, WebGL2RenderingContext for pixel processing
 *
 * USAGE PATTERN:
 *   import { GPUFoundation } from './core/gpu-foundation.js';
 *
 *   const result = await GPUFoundation.detect();
 *   if (result.tier !== 'cpu') {
 *     const ctx = await GPUFoundation.createContext(result);
 *     // use ctx.uploadPixels, ctx.dispatch, ctx.readbackPixels, etc.
 *     ctx.destroy();
 *   }
 *
 * @version 1.0.0
 */

// ── GPU overhead threshold ─────────────────────────────────────────────────────
// Below this pixel count, CPU is typically faster due to upload + readback cost.
const GPU_MIN_PIXELS = 256 * 256; // 65,536 pixels (~256×256)

// ── Fullscreen quad vertices (NDC, two triangles) for WebGL2 fragment path ────
const QUAD_VERTS = new Float32Array([
  -1, -1,  1, -1,  -1, 1,
  -1,  1,  1, -1,   1, 1,
]);

// ── Vertex shader used for all fullscreen fragment passes (WebGL2) ─────────────
const FULLSCREEN_VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// ── Simple hash for shader source caching ─────────────────────────────────────
function _hashString(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

// =============================================================================
// FeatureDetector
// =============================================================================

/**
 * Detects the best available GPU compute tier.
 *
 * @typedef {'webgpu'|'webgl2'|'cpu'} GPUTier
 *
 * @typedef {Object} DetectResult
 * @property {GPUTier}        tier
 * @property {GPUAdapter|null}   adapter   - WebGPU only
 * @property {GPUDevice|null}    device    - WebGPU only
 * @property {GPUAdapterInfo|null} adapterInfo
 * @property {WebGL2RenderingContext|null} gl - WebGL2 only
 */

class FeatureDetector {
  /**
   * Run detection. Resolves to a DetectResult.
   * Detection is cached after the first call — subsequent calls return the same result.
   * @returns {Promise<DetectResult>}
   */
  static async detect() {
    if (FeatureDetector._cached) return FeatureDetector._cached;

    // ── WebGPU probe ──────────────────────────────────────────────────────────
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (adapter) {
          const device = await adapter.requestDevice();
          let adapterInfo = null;
          try { adapterInfo = await adapter.requestAdapterInfo?.(); } catch (_) {}
          device.lost.then(info => {
            console.warn('[GPUFoundation] WebGPU device lost:', info.reason, info.message);
            FeatureDetector._cached = null; // force re-detect on next call
          });
          const result = { tier: 'webgpu', adapter, device, adapterInfo, gl: null };
          FeatureDetector._cached = result;
          return result;
        }
      } catch (e) {
        console.warn('[GPUFoundation] WebGPU probe failed:', e.message);
      }
    }

    // ── WebGL2 probe ──────────────────────────────────────────────────────────
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const gl = canvas.getContext('webgl2', {
        antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false,
      });
      if (gl) {
        const result = { tier: 'webgl2', adapter: null, device: null, adapterInfo: null, gl };
        FeatureDetector._cached = result;
        return result;
      }
    } catch (e) {
      console.warn('[GPUFoundation] WebGL2 probe failed:', e.message);
    }

    // ── CPU fallback ──────────────────────────────────────────────────────────
    const result = { tier: 'cpu', adapter: null, device: null, adapterInfo: null, gl: null };
    FeatureDetector._cached = result;
    return result;
  }

  /** Clear cached result — forces re-detection on next detect() call. */
  static reset() { FeatureDetector._cached = null; }
}

FeatureDetector._cached = null;

// =============================================================================
// ShaderCompiler
// =============================================================================

/**
 * Compiles and caches GPU pipelines keyed by shader source hash.
 * WebGPU: caches GPUComputePipeline / GPURenderPipeline.
 * WebGL2: caches compiled WebGLProgram objects.
 */
class ShaderCompiler {
  constructor() {
    this._cache = new Map(); // hash → compiled pipeline / program
  }

  /**
   * Compile or retrieve a cached WebGPU compute pipeline.
   * @param {GPUDevice} device
   * @param {string} wgslSource
   * @param {GPUBindGroupLayout} [bindGroupLayout]
   * @returns {GPUComputePipeline}
   */
  getComputePipeline(device, wgslSource, bindGroupLayout) {
    const key = 'wgpu:compute:' + _hashString(wgslSource);
    if (this._cache.has(key)) return this._cache.get(key);

    const module = device.createShaderModule({ code: wgslSource });
    const pipelineDesc = {
      layout: bindGroupLayout ? device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }) : 'auto',
      compute: { module, entryPoint: 'main' },
    };
    const pipeline = device.createComputePipeline(pipelineDesc);
    this._cache.set(key, pipeline);
    return pipeline;
  }

  /**
   * Compile or retrieve a cached WebGL2 shader program.
   * @param {WebGL2RenderingContext} gl
   * @param {string} fragSrc
   * @returns {WebGLProgram|null}
   */
  getFragmentProgram(gl, fragSrc) {
    const key = 'webgl2:frag:' + _hashString(fragSrc);
    if (this._cache.has(key)) return this._cache.get(key);

    const prog = _compileWebGLProgram(gl, FULLSCREEN_VERT_SRC, fragSrc);
    if (!prog) return null;
    this._cache.set(key, prog);
    return prog;
  }

  /**
   * Evict compiled pipelines/programs for a specific tier.
   * Call when a context is destroyed to release GPU-side references.
   * @param {'webgpu'|'webgl2'} tier
   */
  evict(tier) {
    const prefix = tier === 'webgpu' ? 'wgpu:' : 'webgl2:';
    for (const key of this._cache.keys()) {
      if (key.startsWith(prefix)) this._cache.delete(key);
    }
  }

  destroy() { this._cache.clear(); }
}

// ── WebGL2 shader compilation helpers ─────────────────────────────────────────
function _compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[GPUFoundation] Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function _compileWebGLProgram(gl, vertSrc, fragSrc) {
  const vert = _compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = _compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[GPUFoundation] Program link error:', gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

// =============================================================================
// BufferRing
// =============================================================================

/**
 * Ping-pong GPU texture/buffer pair for A/B swapping between shader passes.
 * Mirrors the CPU BufferPool pattern for GPU memory.
 *
 * WebGPU: holds two GPUTexture objects.
 * WebGL2: holds two WebGLTexture + WebGLFramebuffer pairs.
 */
class BufferRing {
  /**
   * @param {'webgpu'|'webgl2'} tier
   * @param {GPUDevice|WebGL2RenderingContext} handle
   * @param {number} width
   * @param {number} height
   */
  constructor(tier, handle, width, height) {
    this._tier = tier;
    this._handle = handle;
    this._width = width;
    this._height = height;
    this._destroyed = false;

    if (tier === 'webgpu') {
      this._texA = this._createWebGPUTexture(handle, width, height);
      this._texB = this._createWebGPUTexture(handle, width, height);
    } else {
      const gl = handle;
      this._texA = this._createWebGLTexture(gl, width, height);
      this._fboA = this._createWebGLFBO(gl, this._texA);
      this._texB = this._createWebGLTexture(gl, width, height);
      this._fboB = this._createWebGLFBO(gl, this._texB);
    }

    // Current front/back indices
    this._front = 0; // read from
    this._back  = 1; // write to
  }

  /** The current read texture (WebGPU: GPUTexture, WebGL2: WebGLTexture). */
  get readTex()  { return this._front === 0 ? this._texA : this._texB; }
  /** The current write texture (WebGPU: GPUTexture, WebGL2: WebGLTexture). */
  get writeTex() { return this._back  === 0 ? this._texA : this._texB; }
  /** WebGL2 only — FBO bound for writing. */
  get writeFBO() {
    if (this._tier !== 'webgl2') return null;
    return this._back === 0 ? this._fboA : this._fboB;
  }
  /** WebGL2 only — FBO for reading (for multi-pass readback). */
  get readFBO() {
    if (this._tier !== 'webgl2') return null;
    return this._front === 0 ? this._fboA : this._fboB;
  }

  /** Swap read/write. Call after each dispatch. */
  swap() { [this._front, this._back] = [this._back, this._front]; }

  resize(width, height) {
    if (width === this._width && height === this._height) return;
    this.destroy();
    this._destroyed = false;
    this._width  = width;
    this._height = height;
    this._front  = 0;
    this._back   = 1;
    const h = this._handle;
    if (this._tier === 'webgpu') {
      this._texA = this._createWebGPUTexture(h, width, height);
      this._texB = this._createWebGPUTexture(h, width, height);
    } else {
      this._texA = this._createWebGLTexture(h, width, height);
      this._fboA = this._createWebGLFBO(h, this._texA);
      this._texB = this._createWebGLTexture(h, width, height);
      this._fboB = this._createWebGLFBO(h, this._texB);
    }
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._tier === 'webgpu') {
      this._texA?.destroy();
      this._texB?.destroy();
    } else {
      const gl = this._handle;
      if (this._fboA) gl.deleteFramebuffer(this._fboA);
      if (this._fboB) gl.deleteFramebuffer(this._fboB);
      if (this._texA) gl.deleteTexture(this._texA);
      if (this._texB) gl.deleteTexture(this._texB);
    }
    this._texA = this._texB = this._fboA = this._fboB = null;
  }

  _createWebGPUTexture(device, w, h) {
    return device.createTexture({
      size: [w, h, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.COPY_SRC        |
        GPUTextureUsage.COPY_DST,
    });
  }

  _createWebGLTexture(gl, w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  _createWebGLFBO(gl, tex) {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return fbo;
  }
}

// =============================================================================
// GPUContext — unified interface over WebGPU and WebGL2
// =============================================================================

/**
 * Wraps either a GPUDevice (WebGPU) or WebGL2RenderingContext.
 * Provides a unified API for pixel upload, shader dispatch, and readback.
 *
 * Obtain via GPUFoundation.createContext(detectResult).
 */
class GPUContext {
  /**
   * @param {DetectResult} detectResult
   * @param {ShaderCompiler} compiler
   */
  constructor(detectResult, compiler) {
    this.tier    = detectResult.tier;
    this._device = detectResult.device; // WebGPU
    this._gl     = detectResult.gl;     // WebGL2
    this._compiler = compiler;
    this._destroyed = false;

    // WebGL2: set up fullscreen quad VAO once
    if (this.tier === 'webgl2') {
      const gl = this._gl;
      this._quadVAO = gl.createVertexArray();
      this._quadVBO = gl.createBuffer();
      gl.bindVertexArray(this._quadVAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
      gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTS, gl.STATIC_DRAW);
      // attribute location 0 for aPos — bound by explicit location in shader or queried on first use
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      gl.bindVertexArray(null);

      // PBO for async readback
      this._pbo = gl.createBuffer();
    }
  }

  // ── Pixel upload ─────────────────────────────────────────────────────────────

  /**
   * Upload RGBA pixel data to the write side of a BufferRing.
   * After this call, ring.writeTex contains the uploaded pixels.
   * Does NOT swap the ring — call ring.swap() explicitly after this if needed.
   *
   * @param {BufferRing} ring
   * @param {Uint8ClampedArray} pixels - RGBA, width*height*4 bytes
   * @param {number} width
   * @param {number} height
   */
  uploadPixels(ring, pixels, width, height) {
    if (this._destroyed) return;
    ring.resize(width, height);

    if (this.tier === 'webgpu') {
      const device = this._device;
      device.queue.writeTexture(
        { texture: ring.writeTex },
        pixels,
        { bytesPerRow: width * 4, rowsPerImage: height },
        [width, height, 1],
      );
    } else {
      const gl = this._gl;
      gl.bindTexture(gl.TEXTURE_2D, ring.writeTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }

  // ── Pixel readback ───────────────────────────────────────────────────────────

  /**
   * Read back pixels from the read side of a BufferRing.
   * WebGPU: async, uses mapAsync.
   * WebGL2: synchronous readPixels (may stall; PBO optimisation used where safe).
   *
   * @param {BufferRing} ring
   * @param {number} width
   * @param {number} height
   * @returns {Promise<Uint8ClampedArray>}
   */
  async readbackPixels(ring, width, height) {
    if (this._destroyed) return new Uint8ClampedArray(width * height * 4);

    if (this.tier === 'webgpu') {
      return this._readbackWebGPU(ring.readTex, width, height);
    } else {
      return this._readbackWebGL2(ring.readFBO, width, height);
    }
  }

  async _readbackWebGPU(tex, width, height) {
    const device = this._device;
    const bytesPerRow = Math.ceil((width * 4) / 256) * 256; // must be multiple of 256
    const bufSize = bytesPerRow * height;

    const readBuf = device.createBuffer({
      size: bufSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const cmd = device.createCommandEncoder();
    cmd.copyTextureToBuffer(
      { texture: tex },
      { buffer: readBuf, bytesPerRow, rowsPerImage: height },
      [width, height, 1],
    );
    device.queue.submit([cmd.finish()]);

    await readBuf.mapAsync(GPUMapMode.READ);
    const raw = new Uint8Array(readBuf.getMappedRange());

    // De-pad rows (bytesPerRow may exceed width*4)
    const out = new Uint8ClampedArray(width * height * 4);
    const rowBytes = width * 4;
    for (let y = 0; y < height; y++) {
      out.set(raw.subarray(y * bytesPerRow, y * bytesPerRow + rowBytes), y * rowBytes);
    }

    readBuf.unmap();
    readBuf.destroy();
    return out;
  }

  _readbackWebGL2(fbo, width, height) {
    const gl = this._gl;
    const out = new Uint8ClampedArray(width * height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // WebGL2 images are bottom-up; flip vertically
    _flipVertical(out, width, height);
    return Promise.resolve(out);
  }

  // ── Compute dispatch (WebGPU) ────────────────────────────────────────────────

  /**
   * Dispatch a WebGPU compute pipeline over a BufferRing.
   * Swaps the ring after dispatch so writeTex becomes the new readTex.
   *
   * @param {string} wgslSource
   * @param {BufferRing} ring
   * @param {number} width
   * @param {number} height
   * @param {Object} uniformData - key/value pairs serialised to a uniform buffer
   * @param {GPUBindGroupLayout} [layoutHint]
   */
  dispatchCompute(wgslSource, ring, width, height, uniformData = {}, layoutHint) {
    if (this._destroyed || this.tier !== 'webgpu') return;
    const device  = this._device;
    const pipeline = this._compiler.getComputePipeline(device, wgslSource, layoutHint);

    const uniformBuf = _buildUniformBuffer(device, uniformData);

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniformBuf } },
        { binding: 1, resource: ring.readTex.createView() },
        { binding: 2, resource: ring.writeTex.createView() },
      ],
    });

    const encoder = device.createCommandEncoder();
    const pass    = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    // Workgroup size 16×16 — must match @workgroup_size in shader
    pass.dispatchWorkgroups(Math.ceil(width / 16), Math.ceil(height / 16));
    pass.end();
    device.queue.submit([encoder.finish()]);

    uniformBuf.destroy();
    ring.swap();
  }

  // ── Fragment shader dispatch (WebGL2) ────────────────────────────────────────

  /**
   * Run a WebGL2 fragment shader over the fullscreen quad.
   * Reads from ring.readTex, writes to ring.writeFBO.
   * Swaps the ring after the draw call.
   *
   * @param {string} fragSrc - GLSL ES 3.00 fragment shader source
   * @param {BufferRing} ring
   * @param {number} width
   * @param {number} height
   * @param {Object} uniforms - { name: value } — int/float/vec2 etc.
   */
  drawFragment(fragSrc, ring, width, height, uniforms = {}) {
    if (this._destroyed || this.tier !== 'webgl2') return;
    const gl  = this._gl;
    const prog = this._compiler.getFragmentProgram(gl, fragSrc);
    if (!prog) return;

    gl.bindFramebuffer(gl.FRAMEBUFFER, ring.writeFBO);
    gl.viewport(0, 0, width, height);
    gl.useProgram(prog);

    // Bind read texture to unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ring.readTex);
    const uTexLoc = gl.getUniformLocation(prog, 'uTex');
    if (uTexLoc !== null) gl.uniform1i(uTexLoc, 0);

    // Set uniforms
    _setWebGLUniforms(gl, prog, uniforms);

    gl.bindVertexArray(this._quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    ring.swap();
  }

  // ── BufferRing factory ───────────────────────────────────────────────────────

  /**
   * Create a new BufferRing for this context.
   * @param {number} width
   * @param {number} height
   * @returns {BufferRing}
   */
  createBufferRing(width, height) {
    if (this.tier === 'webgpu') return new BufferRing('webgpu', this._device, width, height);
    return new BufferRing('webgl2', this._gl, width, height);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this.tier === 'webgl2') {
      const gl = this._gl;
      if (this._quadVAO) gl.deleteVertexArray(this._quadVAO);
      if (this._quadVBO) gl.deleteBuffer(this._quadVBO);
      if (this._pbo)     gl.deleteBuffer(this._pbo);
    }
    this._compiler.evict(this.tier);
    this._device = null;
    this._gl     = null;
    this._compiler = null;
  }
}

// ── Utility: flip pixel buffer vertically (WebGL2 reads bottom-up) ────────────
function _flipVertical(pixels, width, height) {
  const rowBytes = width * 4;
  const tmp = new Uint8Array(rowBytes);
  for (let y = 0; y < Math.floor(height / 2); y++) {
    const top    = y * rowBytes;
    const bottom = (height - 1 - y) * rowBytes;
    tmp.set(pixels.subarray(top, top + rowBytes));
    pixels.set(pixels.subarray(bottom, bottom + rowBytes), top);
    pixels.set(tmp, bottom);
  }
}

// ── Utility: pack uniform data into a GPUBuffer ───────────────────────────────
function _buildUniformBuffer(device, data) {
  const keys   = Object.keys(data);
  const floats = keys.map(k => {
    const v = data[k];
    return typeof v === 'number' ? v : 0;
  });
  // Pad to 16-byte alignment (WebGPU requirement)
  while (floats.length % 4 !== 0) floats.push(0);
  const arr = new Float32Array(floats);
  const buf = device.createBuffer({
    size: Math.max(16, arr.byteLength),
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(buf.getMappedRange()).set(arr);
  buf.unmap();
  return buf;
}

// ── Utility: set WebGL2 uniforms from a plain object ─────────────────────────
function _setWebGLUniforms(gl, prog, uniforms) {
  for (const [name, value] of Object.entries(uniforms)) {
    const loc = gl.getUniformLocation(prog, name);
    if (loc === null) continue;
    if (typeof value === 'number') {
      // Heuristic: integers passed as integer values, floats as floats
      Number.isInteger(value) ? gl.uniform1i(loc, value) : gl.uniform1f(loc, value);
    } else if (Array.isArray(value)) {
      switch (value.length) {
        case 2: gl.uniform2fv(loc, value); break;
        case 3: gl.uniform3fv(loc, value); break;
        case 4: gl.uniform4fv(loc, value); break;
      }
    }
  }
}

// =============================================================================
// GPUFoundation — public namespace
// =============================================================================

/**
 * GPU compute SSoT.
 *
 * @namespace GPUFoundation
 */
export const GPUFoundation = {
  /** Minimum pixel count at which GPU acceleration is worthwhile. */
  GPU_MIN_PIXELS,

  /**
   * Detect the best available GPU tier.
   * Result is cached; call GPUFoundation.resetDetect() to force re-detection.
   * @returns {Promise<DetectResult>}
   */
  detect: () => FeatureDetector.detect(),

  /** Clear detection cache (e.g. after a device-lost event). */
  resetDetect: () => FeatureDetector.reset(),

  /**
   * Create a GPUContext from a DetectResult.
   * One shared ShaderCompiler is used per context.
   * @param {DetectResult} detectResult
   * @returns {GPUContext}
   */
  createContext(detectResult) {
    if (detectResult.tier === 'cpu') {
      throw new Error('[GPUFoundation] Cannot create GPUContext for CPU tier — check tier before calling createContext()');
    }
    const compiler = new ShaderCompiler();
    return new GPUContext(detectResult, compiler);
  },

  // Named exports for explicit import where needed
  FeatureDetector,
  ShaderCompiler,
  BufferRing,
  GPUContext,
};

// Expose on window for consistency with AnimationFoundation pattern
if (typeof window !== 'undefined') {
  window.GPUFoundation = GPUFoundation;
}
