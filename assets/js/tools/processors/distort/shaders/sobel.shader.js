/**
 * DISTORT — Sobel Edge Node GPU Shaders
 *
 * Reference implementation: Sobel edge detection with colour ramp output.
 * Node type: stencil / 3×3 neighbourhood kernel
 *
 * GPU complexity tier: LOW–MODERATE (two passes)
 *   Pass 0: Luminance extraction — per-pixel, trivial.
 *   Pass 1: 3×3 Sobel kernel + threshold + colour ramp.
 *
 * The CPU implementation includes a global max-magnitude normalisation pass
 * (requires two full scans of the image). The GPU version approximates this:
 *   - When uNormalize == 1, the shader uses a hardcoded max of 362 (max possible
 *     Sobel magnitude for 8-bit input) rather than a true global maximum.
 *   - This avoids a GPU reduction pass and keeps the shader single-dispatch.
 *   - The visual difference is negligible for most images; the CPU path remains
 *     available as ground truth for export quality.
 *
 * Note on colour ramp:
 *   The CPU node supports arbitrary hex colour ramps via SobelNode params.
 *   The GPU shader uses the same two-colour ramp, passing lo/hi as vec3 uniforms.
 *   Hex parsing happens on the JS side (uniformMap function) before upload.
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uPass, uThreshold, uNormalize,
 *                          uLoR, uLoG, uLoB, uHiR, uHiG, uHiB }
 *   @binding(1) read texture  (rgba8unorm, pass 0: source; pass 1: luma output)
 *   @binding(2) write texture (rgba8unorm, storage)
 *
 * WebGL2 equivalents: uTex (sampler2D), all uniforms as float/int.
 *
 * See: assets/js/tools/processors/distort/nodes/edge/SobelNode.js
 */

// ── gpuBindings descriptor ────────────────────────────────────────────────────

export const gpuBindings = {
  uniforms: {
    uThreshold: 'f32',
    uNormalize: 'i32',
    uLoR: 'f32', uLoG: 'f32', uLoB: 'f32',
    uHiR: 'f32', uHiG: 'f32', uHiB: 'f32',
  },
  multiPass: true,
  passes: 2,  // pass 0 = luma, pass 1 = sobel+ramp
};

// ── WGSL compute shader (WebGPU) ─────────────────────────────────────────────

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uPass      : f32,  // 0=luma, 1=sobel+ramp
  uThreshold : f32,
  uNormalize : f32,  // 1=normalise to hardcoded max, 0=raw magnitude/360
  uLoR       : f32,
  uLoG       : f32,
  uLoB       : f32,
  uHiR       : f32,
  uHiG       : f32,
  uHiB       : f32,
  _pad       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn lumaAt(x: i32, y: i32, w: i32, h: i32) -> f32 {
  let c = textureLoad(tIn, vec2i(clamp(x,0,w-1), clamp(y,0,h-1)), 0);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  if (uni.uPass < 0.5) {
    // ── Pass 0: luminance extraction ──────────────────────────────────────
    let px = textureLoad(tIn, vec2i(x, y), 0);
    let lum = px.r * 0.299 + px.g * 0.587 + px.b * 0.114;
    textureStore(tOut, vec2i(x, y), vec4f(lum, lum, lum, px.a));

  } else {
    // ── Pass 1: 3×3 Sobel + threshold + colour ramp ───────────────────────
    let tl = lumaAt(x-1, y-1, w, h);  let tc = lumaAt(x, y-1, w, h);  let tr = lumaAt(x+1, y-1, w, h);
    let ml = lumaAt(x-1, y,   w, h);                                    let mr = lumaAt(x+1, y,   w, h);
    let bl = lumaAt(x-1, y+1, w, h);  let bc = lumaAt(x, y+1, w, h);  let br = lumaAt(x+1, y+1, w, h);

    let gx = (-tl + tr) + 2.0*(-ml + mr) + (-bl + br);
    let gy = (-tl - 2.0*tc - tr) + (bl + 2.0*bc + br);
    let mag = sqrt(gx*gx + gy*gy);

    // Normalise: max possible magnitude ≈ 1448 (for float 0-1 input)
    // Equivalent of 362 * (1/255) * 4 for 8-bit. Use 4.0 as empirical max.
    let normalised = select(mag / 4.0, mag, uni.uNormalize < 0.5);
    let clamped    = clamp(normalised, 0.0, 1.0);

    let threshold = uni.uThreshold / 255.0;
    let t = select(clamped, 0.0, clamped < threshold);

    let lo = vec3f(uni.uLoR, uni.uLoG, uni.uLoB) / 255.0;
    let hi = vec3f(uni.uHiR, uni.uHiG, uni.uHiB) / 255.0;
    let rgb = mix(lo, hi, t);

    let alpha = textureLoad(tIn, vec2i(x, y), 0).a;
    textureStore(tOut, vec2i(x, y), vec4f(rgb, alpha));
  }
}
`;

// ── GLSL ES 3.00 fragment shader (WebGL2 fallback) ───────────────────────────

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uPass;
uniform float     uThreshold;
uniform int       uNormalize;
uniform float     uLoR, uLoG, uLoB;
uniform float     uHiR, uHiG, uHiB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  ivec2 sz  = textureSize(uTex, 0);
  vec2 ts   = vec2(1.0) / vec2(sz);
  float w   = float(sz.x);
  float h   = float(sz.y);

  if (uPass == 0) {
    // ── Pass 0: luminance ─────────────────────────────────────────────────
    vec4 px = texture(uTex, vUV);
    float lum = px.r * 0.299 + px.g * 0.587 + px.b * 0.114;
    fragColor = vec4(lum, lum, lum, px.a);

  } else {
    // ── Pass 1: Sobel + ramp ──────────────────────────────────────────────
    float tl = texture(uTex, vUV + ts * vec2(-1,-1)).r;
    float tc = texture(uTex, vUV + ts * vec2( 0,-1)).r;
    float tr = texture(uTex, vUV + ts * vec2( 1,-1)).r;
    float ml = texture(uTex, vUV + ts * vec2(-1, 0)).r;
    float mr = texture(uTex, vUV + ts * vec2( 1, 0)).r;
    float bl = texture(uTex, vUV + ts * vec2(-1, 1)).r;
    float bc = texture(uTex, vUV + ts * vec2( 0, 1)).r;
    float br = texture(uTex, vUV + ts * vec2( 1, 1)).r;

    float gx = (-tl + tr) + 2.0*(-ml + mr) + (-bl + br);
    float gy = (-tl - 2.0*tc - tr) + (bl + 2.0*bc + br);
    float mag = sqrt(gx*gx + gy*gy);

    float normalised = (uNormalize == 1) ? clamp(mag / 4.0, 0.0, 1.0) : clamp(mag, 0.0, 1.0);
    float threshold  = uThreshold / 255.0;
    float t = (normalised < threshold) ? 0.0 : normalised;

    vec3 lo  = vec3(uLoR, uLoG, uLoB) / 255.0;
    vec3 hi  = vec3(uHiR, uHiG, uHiB) / 255.0;
    float alpha = texture(uTex, vUV).a;
    fragColor = vec4(mix(lo, hi, t), alpha);
  }
}
`;

// ── Hex colour helper (used in uniformMap) ───────────────────────────────────
function _hexToRgb(hex) {
  const s = String(hex).replace('#', '');
  if (s.length === 3) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  return {
    r: parseInt(s.slice(0, 2), 16) || 0,
    g: parseInt(s.slice(2, 4), 16) || 0,
    b: parseInt(s.slice(4, 6), 16) || 0,
  };
}

/**
 * Build uniform values from the SobelNode resolved params.
 * Called by GPURenderPath._buildUniforms via gpuBindings.uniformMap.
 * @param {Object} p - resolved params (threshold, normalize, minColour, maxColour)
 * @returns {Object}
 */
export function sobelUniformMap(p) {
  const lo = _hexToRgb(p.minColour ?? '#000000');
  const hi = _hexToRgb(p.maxColour ?? '#ffffff');
  return {
    uThreshold: p.threshold ?? 0,
    uNormalize: p.normalize ? 1 : 0,
    uLoR: lo.r, uLoG: lo.g, uLoB: lo.b,
    uHiR: hi.r, uHiG: hi.g, uHiB: hi.b,
  };
}
