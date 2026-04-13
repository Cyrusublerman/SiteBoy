/**
 * DISTORT — Vignette Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Computes elliptical distance from centre, applies softness falloff,
 * then darkens (overlay mode) or outputs the field value (field mode).
 *
 * See: nodes/texture/VignetteNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uAmount, uSoftness, uRoundness,
 *                          uCentreX, uCentreY, uRenderMode }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uAmount: 'f32', uSoftness: 'f32', uRoundness: 'f32',
    uCentreX: 'f32', uCentreY: 'f32', uRenderMode: 'i32',
  },
  multiPass: false,
  uniformMap: p => ({
    uAmount: p.amount, uSoftness: p.softness, uRoundness: p.roundness,
    uCentreX: p.centreX, uCentreY: p.centreY,
    uRenderMode: p.renderMode === 'field' ? 1 : 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uAmount     : f32,
  uSoftness   : f32,
  uRoundness  : f32,
  uCentreX    : f32,
  uCentreY    : f32,
  uRenderMode : f32,
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
  let cx = uni.uCentreX * uni.uWidth;
  let cy = uni.uCentreY * uni.uHeight;
  let maxWH = max(uni.uWidth, uni.uHeight);
  let rx = uni.uRoundness + (1.0 - uni.uRoundness) * (uni.uWidth  / maxWH);
  let ry = uni.uRoundness + (1.0 - uni.uRoundness) * (uni.uHeight / maxWH);
  let dx   = (f32(x) - cx) / max(cx, 1.0);
  let dy   = (f32(y) - cy) / max(cy, 1.0);
  let dist = sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  let edge = 1.0 - uni.uSoftness;
  let v    = select(max(0.0, 1.0 - (dist - edge) / max(0.001, uni.uSoftness)), 1.0, dist < edge);
  let factor = 1.0 - uni.uAmount * (1.0 - v * v);

  var out: vec4f;
  if (uni.uRenderMode > 0.5) {
    let f = clamp(factor, 0.0, 1.0);
    out = vec4f(f, f, f, 1.0);
  } else {
    out = vec4f(px.rgb * factor, px.a);
  }
  textureStore(tOut, vec2i(x, y), out);
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAmount;
uniform float uSoftness;
uniform float uRoundness;
uniform float uCentreX;
uniform float uCentreY;
uniform int   uRenderMode;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px    = texture(uTex, vUV);
  vec2  res   = vec2(textureSize(uTex, 0));
  float cx    = uCentreX * res.x;
  float cy    = uCentreY * res.y;
  float maxWH = max(res.x, res.y);
  float rx    = uRoundness + (1.0 - uRoundness) * (res.x / maxWH);
  float ry    = uRoundness + (1.0 - uRoundness) * (res.y / maxWH);
  float px_x  = vUV.x * res.x;
  float px_y  = vUV.y * res.y;
  float dx    = (px_x - cx) / max(cx, 1.0);
  float dy    = (px_y - cy) / max(cy, 1.0);
  float dist  = sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  float edge  = 1.0 - uSoftness;
  float v     = (dist < edge) ? 1.0 : max(0.0, 1.0 - (dist - edge) / max(0.001, uSoftness));
  float factor = 1.0 - uAmount * (1.0 - v * v);
  if (uRenderMode == 1) {
    float f = clamp(factor, 0.0, 1.0);
    fragColor = vec4(f, f, f, 1.0);
  } else {
    fragColor = vec4(px.rgb * factor, px.a);
  }
}
`;
