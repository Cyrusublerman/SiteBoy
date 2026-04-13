/**
 * DISTORT — Pixelate Node GPU Shaders
 *
 * GPU pattern: gather (trivial block quantisation)
 * Snaps each pixel's sample coordinates to the nearest block centre.
 *
 * See: nodes/distortion/PixelateNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uBlockSize, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uBlockSize: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uBlockSize: p.blockSize }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uBlockSize : f32,
  _pad       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let bs  = max(1.0, uni.uBlockSize);
  let bx  = i32(floor(f32(x) / bs) * bs + bs * 0.5);
  let by  = i32(floor(f32(y) / bs) * bs + bs * 0.5);
  let sx  = clamp(bx, 0, w-1);
  let sy  = clamp(by, 0, h-1);
  textureStore(tOut, vec2i(x, y), textureLoad(tIn, vec2i(sx, sy), 0));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uBlockSize;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float bs  = max(1.0, uBlockSize);
  vec2  px  = vUV * res;
  vec2  block = floor(px / bs) * bs + bs * 0.5;
  fragColor = texture(uTex, clamp(block / res, vec2(0.0), vec2(1.0)));
}
`;
