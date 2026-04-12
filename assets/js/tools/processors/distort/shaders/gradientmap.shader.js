/**
 * DISTORT — Gradient Map Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Computes luminance of input pixel, then lerps between dark and light colour.
 * Colour components in [0, 255]; shader normalises to [0, 1].
 *
 * See: nodes/colour/GradientMapNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uDarkR, uDarkG, uDarkB, uLightR, uLightG, uLightB }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uDarkR: 'f32', uDarkG: 'f32', uDarkB: 'f32',
    uLightR: 'f32', uLightG: 'f32', uLightB: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uDarkR: p.darkR, uDarkG: p.darkG, uDarkB: p.darkB,
    uLightR: p.lightR, uLightG: p.lightG, uLightB: p.lightB,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uDarkR  : f32,
  uDarkG  : f32,
  uDarkB  : f32,
  uLightR : f32,
  uLightG : f32,
  uLightB : f32,
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
  let dark  = vec3f(uni.uDarkR,  uni.uDarkG,  uni.uDarkB)  / 255.0;
  let light = vec3f(uni.uLightR, uni.uLightG, uni.uLightB) / 255.0;
  textureStore(tOut, vec2i(x, y), vec4f(mix(dark, light, lum), px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uDarkR; uniform float uDarkG; uniform float uDarkB;
uniform float uLightR; uniform float uLightG; uniform float uLightB;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4 px   = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  vec3 dark  = vec3(uDarkR, uDarkG, uDarkB) / 255.0;
  vec3 light = vec3(uLightR, uLightG, uLightB) / 255.0;
  fragColor = vec4(mix(dark, light, lum), px.a);
}
`;
