/**
 * DISTORT — Dither Node GPU Shaders
 *
 * GPU pattern: per-pixel (complex)
 * Implements Bayer ordered dithering on GPU. Floyd-Steinberg requires error
 * propagation between pixels (scatter write), which is not supported in the
 * current GPU path; method='floyd-steinberg' falls back to CPU automatically
 * since gpuCapable is conditional on wgsl()/glsl() returning non-null.
 *
 * Only 'bayer' and 'none' methods are handled here. The CPU apply() handles all.
 * When method is 'none' or 'floyd-steinberg', GPURenderPath will not select this
 * node (wgsl/glsl return the Bayer shader regardless; uniformMap sends uMethod).
 * The shader uses uMethod to pass-through when method is not Bayer.
 *
 * See: nodes/colour/DitherNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uLevels, uStrength, uMethod, _pad, _pad2, _pad3 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

// 0 = none / passthrough, 1 = bayer
const METHOD_INDEX = { 'none': 0, 'bayer': 1, 'floyd-steinberg': 0 };

export const gpuBindings = {
  uniforms: { uLevels: 'f32', uStrength: 'f32', uMethod: 'i32' },
  multiPass: false,
  uniformMap: p => ({
    uLevels: p.levels,
    uStrength: p.strength,
    uMethod: METHOD_INDEX[p.method] ?? 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uLevels   : f32,
  uStrength : f32,
  uMethod   : f32,  // 0=passthrough, 1=bayer
  _pad      : f32,
  _pad2     : f32,
  _pad3     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// 4×4 Bayer matrix normalised to [0,1)
fn bayer4(x: i32, y: i32) -> f32 {
  let bm = array<f32, 16>(
     0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
     3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0,
  );
  return bm[(y % 4) * 4 + (x % 4)] / 16.0;
}

fn quantiseChannel(c: f32, levels: f32, strength: f32, threshold: f32) -> f32 {
  let steps  = max(levels - 1.0, 1.0);
  let offset = (threshold - 0.5) * strength / steps;
  return clamp(floor((c + offset) * levels) / steps, 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);

  if (uni.uMethod < 0.5) {
    textureStore(tOut, vec2i(x, y), px);
    return;
  }

  let threshold = bayer4(x, y);
  textureStore(tOut, vec2i(x, y), vec4f(
    quantiseChannel(px.r, uni.uLevels, uni.uStrength, threshold),
    quantiseChannel(px.g, uni.uLevels, uni.uStrength, threshold),
    quantiseChannel(px.b, uni.uLevels, uni.uStrength, threshold),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uLevels;
uniform float uStrength;
uniform int   uMethod;

in  vec2 vUV;
out vec4 fragColor;

float bayer4(int x, int y) {
  float bm[16];
  bm[0]  =  0.0; bm[1]  =  8.0; bm[2]  =  2.0; bm[3]  = 10.0;
  bm[4]  = 12.0; bm[5]  =  4.0; bm[6]  = 14.0; bm[7]  =  6.0;
  bm[8]  =  3.0; bm[9]  = 11.0; bm[10] =  1.0; bm[11] =  9.0;
  bm[12] = 15.0; bm[13] =  7.0; bm[14] = 13.0; bm[15] =  5.0;
  return bm[(y % 4) * 4 + (x % 4)] / 16.0;
}

float quantiseChannel(float c, float levels, float strength, float threshold) {
  float steps  = max(levels - 1.0, 1.0);
  float offset = (threshold - 0.5) * strength / steps;
  return clamp(floor((c + offset) * levels) / steps, 0.0, 1.0);
}

void main() {
  vec4 px = texture(uTex, vUV);
  if (uMethod == 0) { fragColor = px; return; }
  ivec2 iUV     = ivec2(vUV * vec2(textureSize(uTex, 0)));
  float thresh  = bayer4(iUV.x, iUV.y);
  fragColor = vec4(
    quantiseChannel(px.r, uLevels, uStrength, thresh),
    quantiseChannel(px.g, uLevels, uStrength, thresh),
    quantiseChannel(px.b, uLevels, uStrength, thresh),
    px.a
  );
}
`;
