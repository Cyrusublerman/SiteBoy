/**
 * DISTORT — Scanlines Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Overlays horizontal dark bands at a given spacing/thickness, with opacity.
 * Frame param offsets the pattern vertically over time.
 *
 * See: nodes/texture/ScanlinesNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uSpacing, uThickness, uOpacity, uFrame, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uSpacing: 'f32', uThickness: 'f32', uOpacity: 'f32', uFrame: 'f32' },
  multiPass: false,
  uniformMap: p => ({
    uSpacing: p.spacing, uThickness: p.thickness,
    uOpacity: p.scOpacity, uFrame: p.frame,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSpacing   : f32,
  uThickness : f32,
  uOpacity   : f32,
  uFrame     : f32,
  _pad       : f32,
  _pad2      : f32,
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

  let px      = textureLoad(tIn, vec2i(x, y), 0);
  let spacing = max(1.0, uni.uSpacing);
  let lineH   = max(1.0, round(spacing * uni.uThickness));
  let row     = (f32(y) + uni.uFrame) % spacing;
  let inLine  = select(0.0, uni.uOpacity, row < lineH);
  let factor  = 1.0 - inLine;
  textureStore(tOut, vec2i(x, y), vec4f(px.rgb * factor, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpacing;
uniform float uThickness;
uniform float uOpacity;
uniform float uFrame;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px      = texture(uTex, vUV);
  float res_y   = float(textureSize(uTex, 0).y);
  float py      = vUV.y * res_y;
  float spacing = max(1.0, uSpacing);
  float lineH   = max(1.0, round(spacing * uThickness));
  float row     = mod(py + uFrame, spacing);
  float inLine  = (row < lineH) ? uOpacity : 0.0;
  float factor  = 1.0 - inLine;
  fragColor = vec4(px.rgb * factor, px.a);
}
`;
