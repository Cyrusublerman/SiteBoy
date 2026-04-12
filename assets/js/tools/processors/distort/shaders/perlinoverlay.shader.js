/**
 * DISTORT — Perlin Overlay (Noise Field) Node GPU Shaders
 *
 * GPU pattern: per-pixel (complex — noise evaluation)
 * Generates fBm (fractional Brownian motion) Perlin noise and composites
 * with the source image using one of four blend modes.
 *
 * Uses a gradient noise implementation in WGSL/GLSL based on the permutation
 * table approach (hash-based gradient selection, no texture lookup).
 *
 * See: nodes/noise/PerlinOverlayNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uScale, uOctaves, uStrength, uBlendMode, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

const BLEND_INDEX = { 'add': 0, 'multiply': 1, 'screen': 2, 'overlay': 3 };

export const gpuBindings = {
  uniforms: { uScale: 'f32', uOctaves: 'f32', uStrength: 'f32', uBlendMode: 'i32' },
  multiPass: false,
  uniformMap: p => ({
    uScale: p.scale, uOctaves: p.octaves, uStrength: p.strength,
    uBlendMode: BLEND_INDEX[p.blendMode.toLowerCase()] ?? 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uScale     : f32,
  uOctaves   : f32,
  uStrength  : f32,
  uBlendMode : f32,  // 0=ADD 1=MULTIPLY 2=SCREEN 3=OVERLAY
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// ── Hash-based gradient noise ────────────────────────────────────────────────
fn hash2(n: f32) -> f32 {
  return fract(sin(n) * 43758.5453123);
}

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx = i32(h * 7.0) % 8;
  let gx = array<f32, 8>(1.0, -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, -1.0);
  let gy = array<f32, 8>(1.0,  1.0,-1.0,  1.0, 1.0,-1.0, 0.0,  0.0);
  return gx[idx] * x + gy[idx] * y;
}

fn fade(t: f32) -> f32 { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn perlin(px: f32, py: f32) -> f32 {
  let ix = floor(px);
  let iy = floor(py);
  let fx = px - ix;
  let fy = py - iy;
  let ux = fade(fx);
  let uy = fade(fy);

  let n00 = grad2(hash2(ix       + iy       * 57.0), fx,       fy      );
  let n10 = grad2(hash2(ix + 1.0 + iy       * 57.0), fx - 1.0, fy      );
  let n01 = grad2(hash2(ix       + (iy+1.0) * 57.0), fx,       fy - 1.0);
  let n11 = grad2(hash2(ix + 1.0 + (iy+1.0) * 57.0), fx - 1.0, fy - 1.0);

  let a = mix(n00, n10, ux);
  let b = mix(n01, n11, ux);
  return mix(a, b, uy);
}

fn fbm(x: f32, y: f32, octaves: i32) -> f32 {
  var value = 0.0;
  var amp   = 0.5;
  var freq  = 1.0;
  for (var i = 0; i < octaves; i++) {
    value += perlin(x * freq, y * freq) * amp;
    amp   *= 0.5;
    freq  *= 2.0;
  }
  return value * 0.5 + 0.5; // remap to [0,1]
}

fn blendChannel(src: f32, noise: f32, mode: i32, strength: f32) -> f32 {
  var b: f32;
  if (mode == 1) {       // MULTIPLY
    b = src * noise;
  } else if (mode == 2) { // SCREEN
    b = 1.0 - (1.0 - src) * (1.0 - noise);
  } else if (mode == 3) { // OVERLAY
    b = select(2.0 * src * noise, 1.0 - 2.0 * (1.0 - src) * (1.0 - noise), src < 0.5);
  } else {               // ADD
    b = src + noise;
  }
  return clamp(mix(src, b, strength), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px    = textureLoad(tIn, vec2i(x, y), 0);
  let nx    = f32(x) / uni.uWidth  * uni.uScale;
  let ny    = f32(y) / uni.uHeight * uni.uScale;
  let oct   = clamp(i32(uni.uOctaves), 1, 8);
  let noise = fbm(nx, ny, oct);
  let mode  = i32(uni.uBlendMode);

  textureStore(tOut, vec2i(x, y), vec4f(
    blendChannel(px.r, noise, mode, uni.uStrength),
    blendChannel(px.g, noise, mode, uni.uStrength),
    blendChannel(px.b, noise, mode, uni.uStrength),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uScale;
uniform float uOctaves;
uniform float uStrength;
uniform int   uBlendMode;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n)  { return fract(sin(n) * 43758.5453123); }

float grad2(float h, float x, float y) {
  int idx = int(h * 7.0) % 8;
  float gx[8]; float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx] * x + gy[idx] * y;
}

float fade(float t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float perlinN(float px, float py) {
  float ix = floor(px); float iy = floor(py);
  float fx = px - ix;   float fy = py - iy;
  float ux = fade(fx);  float uy = fade(fy);
  float n00 = grad2(hash2(ix       + iy       * 57.0), fx,       fy      );
  float n10 = grad2(hash2(ix + 1.0 + iy       * 57.0), fx - 1.0, fy      );
  float n01 = grad2(hash2(ix       + (iy+1.0) * 57.0), fx,       fy - 1.0);
  float n11 = grad2(hash2(ix + 1.0 + (iy+1.0) * 57.0), fx - 1.0, fy - 1.0);
  return mix(mix(n00, n10, ux), mix(n01, n11, ux), uy);
}

float fbm(float x, float y, int octaves) {
  float value = 0.0; float amp = 0.5; float freq = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += perlinN(x * freq, y * freq) * amp;
    amp *= 0.5; freq *= 2.0;
  }
  return value * 0.5 + 0.5;
}

float blendCh(float src, float noise, int mode, float strength) {
  float b;
  if (mode == 1)      b = src * noise;
  else if (mode == 2) b = 1.0 - (1.0 - src) * (1.0 - noise);
  else if (mode == 3) b = (src < 0.5) ? 2.0 * src * noise : 1.0 - 2.0 * (1.0 - src) * (1.0 - noise);
  else                b = src + noise;
  return clamp(mix(src, b, strength), 0.0, 1.0);
}

void main() {
  vec4 px    = texture(uTex, vUV);
  ivec2 res  = textureSize(uTex, 0);
  float nx   = vUV.x * uScale;
  float ny   = vUV.y * uScale;
  int   oct  = clamp(int(uOctaves), 1, 8);
  float n    = fbm(nx, ny, oct);
  fragColor = vec4(
    blendCh(px.r, n, uBlendMode, uStrength),
    blendCh(px.g, n, uBlendMode, uStrength),
    blendCh(px.b, n, uBlendMode, uStrength),
    px.a
  );
}
`;
