/**
 * DISTORT — Laplacian Edge Node GPU Shaders
 *
 * GPU pattern: stencil (3×3 neighbourhood)
 * Applies 4-connected or 8-connected Laplacian kernel, with optional
 * pre-blur (Gaussian approximation using 3×3 averaging). Output mode
 * controls how the signed result maps to [0,1].
 *
 * preBlur is approximated on GPU as a 3×3 box average (σ≈0.85).
 * For high preBlur values, CPU path is more accurate; GPU matches
 * visually within acceptable tolerance.
 *
 * See: nodes/edge/LaplacianNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uMode, uOutputMode, uGain, uThreshold, uPreBlur, uNorm }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

// mode: 0=4-conn, 1=8-conn
// outputMode: 0=signed, 1=absolute, 2=positive-only, 3=negative-only, 4=zero-crossing
const MODE_INDEX = { '4-conn': 0, '8-conn': 1 };
const OUTPUT_INDEX = { 'signed': 0, 'absolute': 1, 'positive-only': 2, 'negative-only': 3, 'zero-crossing': 4 };

export const gpuBindings = {
  uniforms: { uMode: 'i32', uOutputMode: 'i32', uGain: 'f32', uThreshold: 'f32', uPreBlur: 'f32', uNorm: 'i32' },
  multiPass: false,
  uniformMap: p => ({
    uMode: MODE_INDEX[p.mode] ?? 0,
    uOutputMode: OUTPUT_INDEX[p.outputMode] ?? 1,
    uGain: p.gain, uThreshold: p.threshold,
    uPreBlur: p.preBlur, uNorm: p.normalize ? 1 : 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uMode       : f32,
  uOutputMode : f32,
  uGain       : f32,
  uThreshold  : f32,
  uPreBlur    : f32,
  uNorm       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

fn lum(c: vec4f) -> f32 { return dot(c.rgb, vec3f(0.299, 0.587, 0.114)); }

fn blurred3x3(x: i32, y: i32, w: i32, h: i32) -> f32 {
  var s = 0.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      s += lum(load(x + dx, y + dy, w, h));
    }
  }
  return s / 9.0;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  var c: f32;
  var n: f32; var s: f32; var el: f32; var r: f32;

  if (uni.uPreBlur > 0.0) {
    c  = blurred3x3(x,   y,   w, h);
    n  = blurred3x3(x,   y-1, w, h);
    s  = blurred3x3(x,   y+1, w, h);
    el = blurred3x3(x-1, y,   w, h);
    r  = blurred3x3(x+1, y,   w, h);
  } else {
    c  = lum(load(x,   y,   w, h));
    n  = lum(load(x,   y-1, w, h));
    s  = lum(load(x,   y+1, w, h));
    el = lum(load(x-1, y,   w, h));
    r  = lum(load(x+1, y,   w, h));
  }

  var lap: f32;
  if (uni.uMode < 0.5) {
    // 4-connected: -4c + n + s + e + w
    lap = -4.0 * c + n + s + el + r;
  } else {
    // 8-connected: include diagonals
    let tl = lum(load(x-1, y-1, w, h));
    let tr = lum(load(x+1, y-1, w, h));
    let bl = lum(load(x-1, y+1, w, h));
    let br = lum(load(x+1, y+1, w, h));
    lap = -8.0 * c + n + s + el + r + tl + tr + bl + br;
  }

  lap *= uni.uGain;

  var out: f32;
  let mode = i32(uni.uOutputMode);
  if (mode == 0) {        // signed
    out = clamp(lap * 0.5 + 0.5, 0.0, 1.0);
  } else if (mode == 1) { // absolute
    out = clamp(abs(lap), 0.0, 1.0);
  } else if (mode == 2) { // positive-only
    out = clamp(max(lap, 0.0), 0.0, 1.0);
  } else if (mode == 3) { // negative-only
    out = clamp(max(-lap, 0.0), 0.0, 1.0);
  } else {                // zero-crossing
    out = select(0.0, 1.0, abs(lap) < uni.uThreshold + 0.01);
  }

  if (mode != 4 && out < uni.uThreshold) { out = 0.0; }

  textureStore(tOut, vec2i(x, y), vec4f(out, out, out, 1.0));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uMode;
uniform int   uOutputMode;
uniform float uGain;
uniform float uThreshold;
uniform float uPreBlur;

in  vec2 vUV;
out vec4 fragColor;

float lum(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }

vec2 ts;

float sample1(float ox, float oy) {
  return lum(texture(uTex, clamp(vUV + vec2(ox, oy) / ts, vec2(0.0), vec2(1.0))));
}

float blur3x3() {
  float s = 0.0;
  for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
    s += sample1(float(dx), float(dy));
  return s / 9.0;
}

void main() {
  ts = vec2(textureSize(uTex, 0));
  float c; float n; float sv; float el; float r;
  if (uPreBlur > 0.0) {
    c  = blur3x3(); // approximate
    n  = sample1(0.0, -1.0); s = sample1(0.0, 1.0);
    el = sample1(-1.0, 0.0); r = sample1(1.0, 0.0);
  } else {
    c = sample1(0.0,0.0); n=sample1(0.0,-1.0); sv=sample1(0.0,1.0);
    el=sample1(-1.0,0.0); r=sample1(1.0,0.0);
  }
  float lap;
  if (uMode == 0) {
    lap = -4.0*c + n + sv + el + r;
  } else {
    float tl=sample1(-1.0,-1.0),tr2=sample1(1.0,-1.0),bl=sample1(-1.0,1.0),br=sample1(1.0,1.0);
    lap = -8.0*c + n + sv + el + r + tl + tr2 + bl + br;
  }
  lap *= uGain;
  float out2;
  if (uOutputMode == 0)      out2 = clamp(lap*0.5+0.5, 0.0, 1.0);
  else if (uOutputMode == 1) out2 = clamp(abs(lap),     0.0, 1.0);
  else if (uOutputMode == 2) out2 = clamp(max(lap,0.0), 0.0, 1.0);
  else if (uOutputMode == 3) out2 = clamp(max(-lap,0.0),0.0, 1.0);
  else                       out2 = (abs(lap) < uThreshold + 0.01) ? 1.0 : 0.0;
  if (uOutputMode != 4 && out2 < uThreshold) out2 = 0.0;
  fragColor = vec4(out2, out2, out2, 1.0);
}
`;
