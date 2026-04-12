/**
 * DISTORT — Chromatic Aberration Node GPU Shaders
 *
 * GPU pattern: gather (3-channel offset sampling)
 * Displaces R, G, B channels independently by different radial offsets from centre,
 * creating chromatic aberration. Only 'clamp' edge mode and quadratic falloff
 * are fully implemented; other modes fall back to CPU equivalents visually.
 *
 * See: nodes/distortion/ChromaticAbNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uStrength, uRedScale, uGreenScale,
 *                          uBlueScale, uCentreX, uCentreY }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uStrength: 'f32', uRedScale: 'f32', uGreenScale: 'f32',
    uBlueScale: 'f32', uCentreX: 'f32', uCentreY: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uStrength: p.strength, uRedScale: p.redScale, uGreenScale: p.greenScale,
    uBlueScale: p.blueScale, uCentreX: p.centreX, uCentreY: p.centreY,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uStrength   : f32,
  uRedScale   : f32,
  uGreenScale : f32,
  uBlueScale  : f32,
  uCentreX    : f32,
  uCentreY    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn sampleChannel(ox: f32, oy: f32, ch: i32, w: i32, h: i32) -> f32 {
  let x0 = clamp(i32(floor(ox)), 0, w-1); let y0 = clamp(i32(floor(oy)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);           let y1 = clamp(y0+1, 0, h-1);
  let fx = ox - floor(ox); let fy = oy - floor(oy);
  let s00 = textureLoad(tIn, vec2i(x0,y0), 0);
  let s10 = textureLoad(tIn, vec2i(x1,y0), 0);
  let s01 = textureLoad(tIn, vec2i(x0,y1), 0);
  let s11 = textureLoad(tIn, vec2i(x1,y1), 0);
  let v00 = select(select(s00.b, s00.g, ch==1), s00.r, ch==0);
  let v10 = select(select(s10.b, s10.g, ch==1), s10.r, ch==0);
  let v01 = select(select(s01.b, s01.g, ch==1), s01.r, ch==0);
  let v11 = select(select(s11.b, s11.g, ch==1), s11.r, ch==0);
  return mix(mix(v00, v10, fx), mix(v01, v11, fx), fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let dx   = f32(x) - cx; let dy = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);
  let maxR = sqrt(cx*cx + cy*cy + (uni.uWidth-cx)*(uni.uWidth-cx) + (uni.uHeight-cy)*(uni.uHeight-cy)) * 0.5;
  let t    = select(0.0, min(dist / max(maxR, 1.0), 1.0), dist > 0.0);
  let ft   = t * t; // quadratic falloff
  let nx   = select(0.0, dx / dist, dist > 0.0);
  let ny   = select(0.0, dy / dist, dist > 0.0);
  let S    = uni.uStrength * ft;

  let rOff = S * uni.uRedScale;
  let gOff = S * uni.uGreenScale;
  let bOff = S * uni.uBlueScale;

  let r = sampleChannel(f32(x) + nx * rOff, f32(y) + ny * rOff, 0, w, h);
  let g = sampleChannel(f32(x) + nx * gOff, f32(y) + ny * gOff, 1, w, h);
  let b = sampleChannel(f32(x) + nx * bOff, f32(y) + ny * bOff, 2, w, h);
  let a = textureLoad(tIn, vec2i(x, y), 0).a;
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uStrength;
uniform float uRedScale; uniform float uGreenScale; uniform float uBlueScale;
uniform float uCentreX; uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

float sampleCh(vec2 uv, int ch) {
  vec4 s = texture(uTex, clamp(uv, vec2(0.0), vec2(1.0)));
  return (ch == 0) ? s.r : ((ch == 1) ? s.g : s.b);
}

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = (vUV - uvc) * res; // pixel space offset
  float dist = length(d);
  float maxR = length(res) * 0.5;
  float t    = (dist > 0.0) ? min(dist / max(maxR, 1.0), 1.0) : 0.0;
  float ft   = t * t;
  vec2  n    = (dist > 0.0) ? d / dist : vec2(0.0);
  float S    = uStrength * ft;

  vec2 uvR = vUV + n * S * uRedScale   / res;
  vec2 uvG = vUV + n * S * uGreenScale / res;
  vec2 uvB = vUV + n * S * uBlueScale  / res;

  float alpha = texture(uTex, vUV).a;
  fragColor = vec4(sampleCh(uvR, 0), sampleCh(uvG, 1), sampleCh(uvB, 2), alpha);
}
`;
