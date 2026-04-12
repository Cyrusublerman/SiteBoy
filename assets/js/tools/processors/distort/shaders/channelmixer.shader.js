/**
 * DISTORT — Channel Mixer Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Applies a 3×3 colour matrix: outR = rr*R + rg*G + rb*B, etc.
 *
 * See: nodes/colour/ChannelMixerNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uRr, uRg, uRb, uGr, uGg, uGb, uBr, uBg, uBb, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uRr: 'f32', uRg: 'f32', uRb: 'f32',
    uGr: 'f32', uGg: 'f32', uGb: 'f32',
    uBr: 'f32', uBg: 'f32', uBb: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uRr: p.rr, uRg: p.rg, uRb: p.rb,
    uGr: p.gr, uGg: p.gg, uGb: p.gb,
    uBr: p.br, uBg: p.bg, uBb: p.bb,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRr     : f32,
  uRg     : f32,
  uRb     : f32,
  uGr     : f32,
  uGg     : f32,
  uGb     : f32,
  uBr     : f32,
  uBg     : f32,
  uBb     : f32,
  _pad    : f32,
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

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let r  = px.r; let g = px.g; let b = px.b;
  textureStore(tOut, vec2i(x, y), vec4f(
    clamp(uni.uRr * r + uni.uRg * g + uni.uRb * b, 0.0, 1.0),
    clamp(uni.uGr * r + uni.uGg * g + uni.uGb * b, 0.0, 1.0),
    clamp(uni.uBr * r + uni.uBg * g + uni.uBb * b, 0.0, 1.0),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uRr; uniform float uRg; uniform float uRb;
uniform float uGr; uniform float uGg; uniform float uGb;
uniform float uBr; uniform float uBg; uniform float uBb;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px = texture(uTex, vUV);
  float r = px.r, g = px.g, b = px.b;
  fragColor = vec4(
    clamp(uRr * r + uRg * g + uRb * b, 0.0, 1.0),
    clamp(uGr * r + uGg * g + uGb * b, 0.0, 1.0),
    clamp(uBr * r + uBg * g + uBb * b, 0.0, 1.0),
    px.a
  );
}
`;
