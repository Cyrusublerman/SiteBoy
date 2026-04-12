/**
 * DISTORT — Colour Balance Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Adds RGB offset to shadow/mid/high tonal zones, weighted by luminance.
 * Values in params are in [-100, 100]; shader normalises to [-1, 1].
 *
 * See: nodes/colour/ColourBalanceNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uShadowR, uShadowG, uShadowB,
 *                          uMidR, uMidG, uMidB, uHighR, uHighG, uHighB, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uShadowR: 'f32', uShadowG: 'f32', uShadowB: 'f32',
    uMidR: 'f32', uMidG: 'f32', uMidB: 'f32',
    uHighR: 'f32', uHighG: 'f32', uHighB: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uShadowR: p.shadowR, uShadowG: p.shadowG, uShadowB: p.shadowB,
    uMidR: p.midR, uMidG: p.midG, uMidB: p.midB,
    uHighR: p.highR, uHighG: p.highG, uHighB: p.highB,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uShadowR : f32,
  uShadowG : f32,
  uShadowB : f32,
  uMidR    : f32,
  uMidG    : f32,
  uMidB    : f32,
  uHighR   : f32,
  uHighG   : f32,
  uHighB   : f32,
  _pad     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px  = textureLoad(tIn, vec2i(x, y), 0);
  let lum = dot(px.rgb, vec3f(0.299, 0.587, 0.114));

  // Zone weights: shadow peaks at 0, highlight peaks at 1
  let sw = max(0.0, 1.0 - lum * 2.0);
  let hw = max(0.0, lum * 2.0 - 1.0);
  let mw = 1.0 - sw - hw;

  let scale = 1.0 / 100.0;
  let adj = vec3f(
    uni.uShadowR * sw + uni.uMidR * mw + uni.uHighR * hw,
    uni.uShadowG * sw + uni.uMidG * mw + uni.uHighG * hw,
    uni.uShadowB * sw + uni.uMidB * mw + uni.uHighB * hw,
  ) * scale;

  textureStore(tOut, vec2i(x, y), vec4f(clamp(px.rgb + adj, vec3f(0.0), vec3f(1.0)), px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uShadowR; uniform float uShadowG; uniform float uShadowB;
uniform float uMidR;    uniform float uMidG;    uniform float uMidB;
uniform float uHighR;   uniform float uHighG;   uniform float uHighB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px  = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  float sw  = max(0.0, 1.0 - lum * 2.0);
  float hw  = max(0.0, lum * 2.0 - 1.0);
  float mw  = 1.0 - sw - hw;
  vec3  adj = vec3(
    uShadowR * sw + uMidR * mw + uHighR * hw,
    uShadowG * sw + uMidG * mw + uHighG * hw,
    uShadowB * sw + uMidB * mw + uHighB * hw
  ) / 100.0;
  fragColor = vec4(clamp(px.rgb + adj, vec3(0.0), vec3(1.0)), px.a);
}
`;
