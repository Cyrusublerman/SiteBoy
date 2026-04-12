/**
 * DISTORT — Affine Transform Node GPU Shaders
 *
 * GPU pattern: gather (inverse affine mapping)
 * For each output pixel, computes the inverse affine transform to find the source pixel.
 * Supports translate (fractional), rotate (degrees), scale (per-axis), and centre pivot.
 *
 * See: nodes/transform/AffineTransformNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uTx, uTy, uRotate, uScaleX, uScaleY, uCx, uCy, _pad, _pad2, _pad3 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uTx: 'f32', uTy: 'f32', uRotate: 'f32',
    uScaleX: 'f32', uScaleY: 'f32', uCx: 'f32', uCy: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uTx: p.translateX, uTy: p.translateY, uRotate: p.rotate,
    uScaleX: p.scaleX, uScaleY: p.scaleY, uCx: p.centreX, uCy: p.centreY,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uTx     : f32,
  uTy     : f32,
  uRotate : f32,
  uScaleX : f32,
  uScaleY : f32,
  uCx     : f32,
  uCy     : f32,
  _pad    : f32,
  _pad2   : f32,
  _pad3   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);          let y1 = clamp(y0+1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx),
    fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  // Pivot in pixel space
  let px  = f32(x); let py = f32(y);
  let pivX = uni.uCx * uni.uWidth;
  let pivY = uni.uCy * uni.uHeight;

  // Offset to pivot
  var dx = px - pivX; var dy = py - pivY;

  // Inverse transform: undo translate, rotate, scale
  dx -= uni.uTx * uni.uWidth;
  dy -= uni.uTy * uni.uHeight;

  // Inverse scale
  dx /= max(uni.uScaleX, 0.001);
  dy /= max(uni.uScaleY, 0.001);

  // Inverse rotate
  let rad  = -uni.uRotate * PI / 180.0;
  let cosA = cos(rad); let sinA = sin(rad);
  let rdx  = cosA * dx - sinA * dy;
  let rdy  = sinA * dx + cosA * dy;

  let sx = pivX + rdx;
  let sy = pivY + rdy;
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTx; uniform float uTy; uniform float uRotate;
uniform float uScaleX; uniform float uScaleY;
uniform float uCx; uniform float uCy;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2 uvc  = vec2(uCx, uCy);
  vec2 d    = vUV - uvc;
  d -= vec2(uTx, uTy);
  d.x /= max(uScaleX, 0.001);
  d.y /= max(uScaleY, 0.001);
  float rad  = -uRotate * PI / 180.0;
  float cosA = cos(rad); float sinA = sin(rad);
  vec2  rd   = vec2(cosA * d.x - sinA * d.y, sinA * d.x + cosA * d.y);
  vec2  src  = uvc + rd;
  fragColor  = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
