/**
 * DISTORT — Band Shift Node GPU Shaders
 *
 * GPU pattern: gather
 * Shifts rows (horizontal axis) or columns (vertical axis) by an offset determined
 * by a sine wave or noise function applied to the band index.
 *
 * See: nodes/warp/BandShiftNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uAxis, uIntensity, uBandSize,
 *                          uOffsetType, uPhase, uFreq, uNoiseScale, _pad, _pad2, _pad3 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

// axis: 0=horizontal (shift rows), 1=vertical (shift cols)
// offsetType: 0=noise, 1=sine, 2=stepped
const AXIS_INDEX = { 'horizontal': 0, 'vertical': 1 };
const TYPE_INDEX = { 'noise': 0, 'sine': 1, 'stepped': 2 };

export const gpuBindings = {
  uniforms: {
    uAxis: 'i32', uIntensity: 'f32', uBandSize: 'f32',
    uOffsetType: 'i32', uPhase: 'f32', uFreq: 'f32', uNoiseScale: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uAxis: AXIS_INDEX[p.axis] ?? 0,
    uIntensity: p.intensity, uBandSize: p.bandSize,
    uOffsetType: TYPE_INDEX[p.offsetType] ?? 0,
    uPhase: p.phase, uFreq: p.freq, uNoiseScale: p.noiseScale,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uAxis       : f32,
  uIntensity  : f32,
  uBandSize   : f32,
  uOffsetType : f32,
  uPhase      : f32,
  uFreq       : f32,
  uNoiseScale : f32,
  _pad        : f32,
  _pad2       : f32,
  _pad3       : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const TWO_PI : f32 = 6.28318530717959;

fn hashNoise(v: f32) -> f32 { return fract(sin(v * 127.1) * 43758.5453123); }

fn bandOffset(band: f32) -> f32 {
  if (uni.uOffsetType < 0.5) {
    // noise
    let n = hashNoise(band * uni.uNoiseScale + uni.uPhase);
    return (n * 2.0 - 1.0) * uni.uIntensity;
  } else if (uni.uOffsetType < 1.5) {
    // sine
    return sin(band * uni.uFreq * TWO_PI + uni.uPhase) * uni.uIntensity;
  } else {
    // stepped
    return round(hashNoise(band * 3.7)) * uni.uIntensity;
  }
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1); let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1); let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x); let fy=y-floor(y);
  return mix(
    mix(textureLoad(tIn,vec2i(x0,y0),0), textureLoad(tIn,vec2i(x1,y0),0), fx),
    mix(textureLoad(tIn,vec2i(x0,y1),0), textureLoad(tIn,vec2i(x1,y1),0), fx), fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let bs = max(1.0, uni.uBandSize);
  var sx: f32; var sy: f32;
  if (uni.uAxis < 0.5) {
    // horizontal: shift row by column offset
    let band   = floor(f32(y) / bs);
    let offset = bandOffset(band);
    sx = f32(x) + offset;
    sy = f32(y);
  } else {
    // vertical: shift column by row offset
    let band   = floor(f32(x) / bs);
    let offset = bandOffset(band);
    sx = f32(x);
    sy = f32(y) + offset;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uAxis; uniform float uIntensity; uniform float uBandSize;
uniform int   uOffsetType; uniform float uPhase; uniform float uFreq; uniform float uNoiseScale;

in  vec2 vUV;
out vec4 fragColor;

const float TWO_PI = 6.28318530717959;

float hashNoise(float v) { return fract(sin(v*127.1)*43758.5453123); }

float bandOffset(float band) {
  if (uOffsetType == 0) {
    float n = hashNoise(band * uNoiseScale + uPhase);
    return (n * 2.0 - 1.0) * uIntensity;
  } else if (uOffsetType == 1) {
    return sin(band * uFreq * TWO_PI + uPhase) * uIntensity;
  } else {
    return round(hashNoise(band * 3.7)) * uIntensity;
  }
}

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float bs   = max(1.0, uBandSize);
  vec2  px   = vUV * res;
  vec2  src;
  if (uAxis == 0) {
    float band = floor(px.y / bs);
    src = vec2(px.x + bandOffset(band), px.y) / res;
  } else {
    float band = floor(px.x / bs);
    src = vec2(px.x, px.y + bandOffset(band)) / res;
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
