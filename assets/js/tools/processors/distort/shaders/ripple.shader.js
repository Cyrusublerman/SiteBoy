/**
 * DISTORT — Radial Ripple Node GPU Shaders
 *
 * GPU pattern: gather
 * Displaces pixels radially from a centre point using a sinusoidal wave,
 * with optional distance-based falloff.
 *
 * See: nodes/refraction/RadialRippleNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uCentreX, uCentreY, uAmplitude, uFrequency, uPhase, uFalloff }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uCentreX: 'f32', uCentreY: 'f32', uAmplitude: 'f32',
    uFrequency: 'f32', uPhase: 'f32', uFalloff: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uCentreX: p.centreX, uCentreY: p.centreY,
    uAmplitude: p.amplitude, uFrequency: p.frequency,
    uPhase: p.phase, uFalloff: p.falloff,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uCentreX   : f32,
  uCentreY   : f32,
  uAmplitude : f32,
  uFrequency : f32,
  uPhase     : f32,
  uFalloff   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const TWO_PI : f32 = 6.28318530717959;

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

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let dx   = f32(x) - cx;
  let dy   = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);

  var sx = f32(x); var sy = f32(y);
  if (dist > 0.0) {
    let falloff    = pow(max(dist, 1.0), -uni.uFalloff);
    let wave       = sin(dist * uni.uFrequency * TWO_PI / min(uni.uWidth, uni.uHeight) + uni.uPhase);
    let dispMag    = uni.uAmplitude * wave * falloff;
    sx = f32(x) + (dx / dist) * dispMag;
    sy = f32(y) + (dy / dist) * dispMag;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uCentreX; uniform float uCentreY;
uniform float uAmplitude; uniform float uFrequency;
uniform float uPhase; uniform float uFalloff;

in  vec2 vUV;
out vec4 fragColor;

const float TWO_PI = 6.28318530717959;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = (vUV - uvc) * res;  // pixel space
  float dist = length(d);
  vec2  src  = vUV;
  if (dist > 0.0) {
    float fo   = pow(max(dist, 1.0), -uFalloff);
    float wave = sin(dist * uFrequency * TWO_PI / min(res.x, res.y) + uPhase);
    float disp = uAmplitude * wave * fo;
    src = vUV + (d / dist) * disp / res;
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
