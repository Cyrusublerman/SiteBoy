/**
 * DISTORT — Curves Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Maps luminance through a piecewise linear curve defined by shadow/mid/high
 * input-output pairs. Applied uniformly to R, G, B channels.
 *
 * See: nodes/colour/CurvesNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uShadowIn, uShadowOut, uMidIn,
 *                          uMidOut, uHighIn, uHighOut }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uShadowIn: 'f32', uShadowOut: 'f32',
    uMidIn: 'f32', uMidOut: 'f32',
    uHighIn: 'f32', uHighOut: 'f32',
  },
  multiPass: false,
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uShadowIn  : f32,
  uShadowOut : f32,
  uMidIn     : f32,
  uMidOut    : f32,
  uHighIn    : f32,
  uHighOut   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn curvesLUT(c: f32, si: f32, so: f32, mi: f32, mo: f32, hi: f32, ho: f32) -> f32 {
  // Piecewise linear through (si,so) → (mi,mo) → (hi,ho)
  if (c <= mi) {
    let t = select(0.0, (c - si) / max(mi - si, 0.001), mi > si);
    return clamp(so + t * (mo - so), 0.0, 1.0);
  } else {
    let t = select(1.0, (c - mi) / max(hi - mi, 0.001), hi > mi);
    return clamp(mo + t * (ho - mo), 0.0, 1.0);
  }
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let si = uni.uShadowIn  / 255.0;
  let so = uni.uShadowOut / 255.0;
  let mi = uni.uMidIn     / 255.0;
  let mo = uni.uMidOut    / 255.0;
  let hi = uni.uHighIn    / 255.0;
  let ho = uni.uHighOut   / 255.0;
  textureStore(tOut, vec2i(x, y), vec4f(
    curvesLUT(px.r, si, so, mi, mo, hi, ho),
    curvesLUT(px.g, si, so, mi, mo, hi, ho),
    curvesLUT(px.b, si, so, mi, mo, hi, ho),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uShadowIn;
uniform float uShadowOut;
uniform float uMidIn;
uniform float uMidOut;
uniform float uHighIn;
uniform float uHighOut;

in  vec2 vUV;
out vec4 fragColor;

float curvesLUT(float c, float si, float so, float mi, float mo, float hi, float ho) {
  if (c <= mi) {
    float t = (mi > si) ? (c - si) / max(mi - si, 0.001) : 0.0;
    return clamp(so + t * (mo - so), 0.0, 1.0);
  } else {
    float t = (hi > mi) ? (c - mi) / max(hi - mi, 0.001) : 1.0;
    return clamp(mo + t * (ho - mo), 0.0, 1.0);
  }
}

void main() {
  vec4  px = texture(uTex, vUV);
  float si = uShadowIn  / 255.0;
  float so = uShadowOut / 255.0;
  float mi = uMidIn     / 255.0;
  float mo = uMidOut    / 255.0;
  float hi = uHighIn    / 255.0;
  float ho = uHighOut   / 255.0;
  fragColor = vec4(
    curvesLUT(px.r, si, so, mi, mo, hi, ho),
    curvesLUT(px.g, si, so, mi, mo, hi, ho),
    curvesLUT(px.b, si, so, mi, mo, hi, ho),
    px.a
  );
}
`;
