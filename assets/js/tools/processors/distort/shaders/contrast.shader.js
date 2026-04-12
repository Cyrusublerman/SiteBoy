/**
 * DISTORT — Contrast (Lift/Gamma/Gain) Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Applies lift/gamma/gain, linear contrast, and vibrance per pixel.
 *
 * See: nodes/colour/ContrastNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uLift, uGamma, uGain, uContrast, uPivot, uVibrance }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uLift: 'f32', uGamma: 'f32', uGain: 'f32',
    uContrast: 'f32', uPivot: 'f32', uVibrance: 'f32',
  },
  multiPass: false,
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uLift     : f32,
  uGamma    : f32,
  uGain     : f32,
  uContrast : f32,
  uPivot    : f32,
  uVibrance : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn applyLGG(c: f32, lift: f32, gamma: f32, gain: f32) -> f32 {
  let lifted = c + lift;
  let gained = lifted * gain;
  return clamp(pow(max(gained, 0.0), 1.0 / max(gamma, 0.001)), 0.0, 1.0);
}

fn applyContrast(c: f32, contrast: f32, pivot: f32) -> f32 {
  return clamp(pivot + (c - pivot) * (1.0 + contrast), 0.0, 1.0);
}

fn applyVibrance(rgb: vec3f, vibrance: f32) -> vec3f {
  let mx  = max(rgb.r, max(rgb.g, rgb.b));
  let mn  = min(rgb.r, min(rgb.g, rgb.b));
  let sat = mx - mn;
  let lum = dot(rgb, vec3f(0.299, 0.587, 0.114));
  let mask = 1.0 - sat;
  return clamp(rgb + (rgb - vec3f(lum)) * vibrance * mask, vec3f(0.0), vec3f(1.0));
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  var c  = vec3f(
    applyLGG(px.r, uni.uLift, uni.uGamma, uni.uGain),
    applyLGG(px.g, uni.uLift, uni.uGamma, uni.uGain),
    applyLGG(px.b, uni.uLift, uni.uGamma, uni.uGain),
  );
  if (uni.uContrast != 0.0) {
    c = vec3f(
      applyContrast(c.r, uni.uContrast, uni.uPivot),
      applyContrast(c.g, uni.uContrast, uni.uPivot),
      applyContrast(c.b, uni.uContrast, uni.uPivot),
    );
  }
  if (uni.uVibrance != 0.0) {
    c = applyVibrance(c, uni.uVibrance);
  }
  textureStore(tOut, vec2i(x, y), vec4f(c, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uLift;
uniform float uGamma;
uniform float uGain;
uniform float uContrast;
uniform float uPivot;
uniform float uVibrance;

in  vec2 vUV;
out vec4 fragColor;

float applyLGG(float c, float lift, float gamma, float gain) {
  float lifted = c + lift;
  float gained = lifted * gain;
  return clamp(pow(max(gained, 0.0), 1.0 / max(gamma, 0.001)), 0.0, 1.0);
}

float applyContrast(float c, float contrast, float pivot) {
  return clamp(pivot + (c - pivot) * (1.0 + contrast), 0.0, 1.0);
}

vec3 applyVibrance(vec3 rgb, float vibrance) {
  float mx  = max(rgb.r, max(rgb.g, rgb.b));
  float mn  = min(rgb.r, min(rgb.g, rgb.b));
  float sat = mx - mn;
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  float mask = 1.0 - sat;
  return clamp(rgb + (rgb - vec3(lum)) * vibrance * mask, vec3(0.0), vec3(1.0));
}

void main() {
  vec4 px = texture(uTex, vUV);
  vec3 c = vec3(
    applyLGG(px.r, uLift, uGamma, uGain),
    applyLGG(px.g, uLift, uGamma, uGain),
    applyLGG(px.b, uLift, uGamma, uGain)
  );
  if (uContrast != 0.0) {
    c = vec3(
      applyContrast(c.r, uContrast, uPivot),
      applyContrast(c.g, uContrast, uPivot),
      applyContrast(c.b, uContrast, uPivot)
    );
  }
  if (uVibrance != 0.0) {
    c = applyVibrance(c, uVibrance);
  }
  fragColor = vec4(c, px.a);
}
`;
