/**
 * DISTORT — Invert Node GPU Shaders
 *
 * Reference implementation: per-pixel colour inversion.
 * Node type: per-pixel (no spatial reads — each output pixel depends only on
 *            the same input pixel).
 *
 * GPU complexity tier: TRIVIAL
 *   - One texture fetch + 3 ALU ops + one write per pixel.
 *   - No shared memory, no multi-pass, no reduction.
 *
 * Supported modes:
 *   0 = 'all'        — invert RGB, copy A
 *   1 = 'luminosity' — invert HSL lightness, keep hue/saturation
 *   2 = 'hue'        — invert hue (rotate 180°), keep lightness/saturation
 *
 * See: assets/js/tools/processors/distort/nodes/colour/InvertNode.js
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms struct { uWidth: f32, uHeight: f32, uMode: f32 }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 *
 * WebGL2 uniform names: uTex (sampler2D, unit 0), uMode (int)
 */

// ── gpuBindings descriptor ────────────────────────────────────────────────────

export const gpuBindings = {
  uniforms: {
    uMode: 'i32',
  },
  multiPass: false,
};

// ── WGSL compute shader (WebGPU) ─────────────────────────────────────────────
// Workgroup size 16×16 — must be kept in sync with GPUContext.dispatchCompute().

export const wgsl = /* wgsl */`
// ── Uniform block ────────────────────────────────────────────────────────────
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uMode   : f32,  // 0=all, 1=luminosity, 2=hue
  _pad    : f32,
}

@group(0) @binding(0) var<uniform>           uni  : Uniforms;
@group(0) @binding(1) var                   tIn  : texture_2d<f32>;
@group(0) @binding(2) var                   tOut : texture_storage_2d<rgba8unorm, write>;

// ── RGB ↔ HSL helpers ───────────────────────────────────────────────────────
fn rgb2hsl(c: vec3f) -> vec3f {
  let mx = max(c.r, max(c.g, c.b));
  let mn = min(c.r, min(c.g, c.b));
  let d  = mx - mn;
  var l  = (mx + mn) * 0.5;
  var s  = select(0.0, d / (1.0 - abs(2.0 * l - 1.0)), d > 0.0);
  var h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)      { h = ((c.g - c.b) / d % 6.0); }
    else if (mx == c.g) { h = (c.b - c.r) / d + 2.0; }
    else                { h = (c.r - c.g) / d + 4.0; }
    h = h / 6.0;
    if (h < 0.0) { h = h + 1.0; }
  }
  return vec3f(h, s, l);
}

fn hue2rgb(p: f32, q: f32, t_in: f32) -> f32 {
  var t = t_in;
  if (t < 0.0) { t += 1.0; }
  if (t > 1.0) { t -= 1.0; }
  if (t < 1.0/6.0) { return p + (q - p) * 6.0 * t; }
  if (t < 1.0/2.0) { return q; }
  if (t < 2.0/3.0) { return p + (q - p) * (2.0/3.0 - t) * 6.0; }
  return p;
}

fn hsl2rgb(hsl: vec3f) -> vec3f {
  let h = hsl.x; let s = hsl.y; let l = hsl.z;
  if (s == 0.0) { return vec3f(l); }
  let q = select(l + s - l * s, l * (1.0 + s), l < 0.5);
  let p = 2.0 * l - q;
  return vec3f(
    hue2rgb(p, q, h + 1.0/3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0/3.0),
  );
}

// ── Main compute entry ───────────────────────────────────────────────────────
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px   = textureLoad(tIn, vec2i(x, y), 0);
  let mode = i32(uni.uMode);
  var out  : vec4f;

  if (mode == 0) {
    // all — invert RGB, keep alpha
    out = vec4f(1.0 - px.r, 1.0 - px.g, 1.0 - px.b, px.a);
  } else if (mode == 1) {
    // luminosity — invert HSL lightness
    let hsl = rgb2hsl(px.rgb);
    let inv = vec3f(hsl.x, hsl.y, 1.0 - hsl.z);
    out = vec4f(hsl2rgb(inv), px.a);
  } else {
    // hue — rotate hue 180°
    let hsl = rgb2hsl(px.rgb);
    let inv = vec3f(fract(hsl.x + 0.5), hsl.y, hsl.z);
    out = vec4f(hsl2rgb(inv), px.a);
  }

  textureStore(tOut, vec2i(x, y), out);
}
`;

// ── GLSL ES 3.00 fragment shader (WebGL2 fallback) ───────────────────────────

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uMode;

in  vec2 vUV;
out vec4 fragColor;

vec3 rgb2hsl(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d  = mx - mn;
  float l  = (mx + mn) * 0.5;
  float s  = (d > 0.0) ? d / (1.0 - abs(2.0 * l - 1.0)) : 0.0;
  float h  = 0.0;
  if (d > 0.0) {
    if (mx == c.r)       h = mod((c.g - c.b) / d, 6.0);
    else if (mx == c.g)  h = (c.b - c.r) / d + 2.0;
    else                 h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
  float tt = t;
  if (tt < 0.0) tt += 1.0;
  if (tt > 1.0) tt -= 1.0;
  if (tt < 1.0/6.0) return p + (q - p) * 6.0 * tt;
  if (tt < 0.5)     return q;
  if (tt < 2.0/3.0) return p + (q - p) * (2.0/3.0 - tt) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x, s = hsl.y, l = hsl.z;
  if (s == 0.0) return vec3(l);
  float q = (l < 0.5) ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(hue2rgb(p,q,h+1.0/3.0), hue2rgb(p,q,h), hue2rgb(p,q,h-1.0/3.0));
}

void main() {
  vec4 px = texture(uTex, vUV);
  if (uMode == 0) {
    fragColor = vec4(1.0 - px.rgb, px.a);
  } else if (uMode == 1) {
    vec3 hsl = rgb2hsl(px.rgb);
    fragColor = vec4(hsl2rgb(vec3(hsl.x, hsl.y, 1.0 - hsl.z)), px.a);
  } else {
    vec3 hsl = rgb2hsl(px.rgb);
    fragColor = vec4(hsl2rgb(vec3(fract(hsl.x + 0.5), hsl.y, hsl.z)), px.a);
  }
}
`;
