/**
 * DISTORT — Levels Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Remaps input range [blackPoint, whitePoint] → [outBlack, outWhite] with midGamma.
 * All level values in [0, 255]; shader normalises to [0, 1].
 *
 * See: nodes/colour/LevelsNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uBlackPoint, uWhitePoint, uMidGamma, uOutBlack, uOutWhite, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uBlackPoint: 'f32', uWhitePoint: 'f32', uMidGamma: 'f32',
    uOutBlack: 'f32', uOutWhite: 'f32',
  },
  multiPass: false,
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uBlackPoint : f32,
  uWhitePoint : f32,
  uMidGamma   : f32,
  uOutBlack   : f32,
  uOutWhite   : f32,
  _pad        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn levelsChannel(c: f32, bp: f32, wp: f32, g: f32, ob: f32, ow: f32) -> f32 {
  let range = max(wp - bp, 0.001);
  let norm  = clamp((c - bp) / range, 0.0, 1.0);
  let g2    = pow(norm, 1.0 / max(g, 0.001));
  return clamp(ob + g2 * (ow - ob), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let bp = uni.uBlackPoint / 255.0;
  let wp = uni.uWhitePoint / 255.0;
  let ob = uni.uOutBlack   / 255.0;
  let ow = uni.uOutWhite   / 255.0;
  let g  = uni.uMidGamma;
  textureStore(tOut, vec2i(x, y), vec4f(
    levelsChannel(px.r, bp, wp, g, ob, ow),
    levelsChannel(px.g, bp, wp, g, ob, ow),
    levelsChannel(px.b, bp, wp, g, ob, ow),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uBlackPoint;
uniform float uWhitePoint;
uniform float uMidGamma;
uniform float uOutBlack;
uniform float uOutWhite;

in  vec2 vUV;
out vec4 fragColor;

float levelsChannel(float c, float bp, float wp, float g, float ob, float ow) {
  float range = max(wp - bp, 0.001);
  float norm  = clamp((c - bp) / range, 0.0, 1.0);
  float g2    = pow(norm, 1.0 / max(g, 0.001));
  return clamp(ob + g2 * (ow - ob), 0.0, 1.0);
}

void main() {
  vec4  px = texture(uTex, vUV);
  float bp = uBlackPoint / 255.0;
  float wp = uWhitePoint / 255.0;
  float ob = uOutBlack   / 255.0;
  float ow = uOutWhite   / 255.0;
  fragColor = vec4(
    levelsChannel(px.r, bp, wp, uMidGamma, ob, ow),
    levelsChannel(px.g, bp, wp, uMidGamma, ob, ow),
    levelsChannel(px.b, bp, wp, uMidGamma, ob, ow),
    px.a
  );
}
`;
