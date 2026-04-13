/**
 * DISTORT — Greyscale Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Each output pixel depends only on the same input pixel.
 * Applies a weighted luminance blend: out = dot(rgb, weights).
 *
 * See: nodes/colour/GreyscaleNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uWr, uWg, uWb, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uWr: 'f32', uWg: 'f32', uWb: 'f32' },
  multiPass: false,
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uWr     : f32,
  uWg     : f32,
  uWb     : f32,
  _pad    : f32,
  _pad2   : f32,
  _pad3   : f32,
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
  let lum = px.r * uni.uWr + px.g * uni.uWg + px.b * uni.uWb;
  textureStore(tOut, vec2i(x, y), vec4f(lum, lum, lum, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uWr;
uniform float uWg;
uniform float uWb;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4 px  = texture(uTex, vUV);
  float lum = px.r * uWr + px.g * uWg + px.b * uWb;
  fragColor = vec4(lum, lum, lum, px.a);
}
`;
