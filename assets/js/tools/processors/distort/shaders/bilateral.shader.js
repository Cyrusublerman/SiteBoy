/**
 * DISTORT — Bilateral Filter Node GPU Shaders
 *
 * GPU pattern: stencil (range-weighted neighbourhood)
 * Applies a bilateral filter: Gaussian spatial weights × Gaussian range weights.
 * Each pixel is a weighted average of its neighbourhood, where weights diminish
 * with both spatial distance and colour distance, preserving edges.
 *
 * spatialSigma: controls neighbourhood size (radius = ceil(2*σ)).
 * rangeSigma: controls colour sensitivity (in [0,255] space; normalised in shader).
 *
 * See: nodes/blur/BilateralFilterNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uSpatialSigma, uRangeSigma }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uSpatialSigma: 'f32', uRangeSigma: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uSpatialSigma: p.spatialSigma, uRangeSigma: p.rangeSigma }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth        : f32,
  uHeight       : f32,
  uSpatialSigma : f32,
  uRangeSigma   : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let ss     = max(uni.uSpatialSigma, 0.5);
  let rs     = max(uni.uRangeSigma / 255.0, 0.01);
  let radius = clamp(i32(ceil(2.0 * ss)), 1, 15);
  let invSs2 = 0.5 / (ss * ss);
  let invRs2 = 0.5 / (rs * rs);

  let center = load(x, y, w, h);
  var acc    = vec4f(0.0);
  var wsum   = 0.0;

  for (var ky = -radius; ky <= radius; ky++) {
    for (var kx = -radius; kx <= radius; kx++) {
      let nb    = load(x + kx, y + ky, w, h);
      let sd    = f32(kx * kx + ky * ky);
      let rd    = dot(nb.rgb - center.rgb, nb.rgb - center.rgb);
      let gw    = exp(-sd * invSs2 - rd * invRs2);
      acc  += nb * gw;
      wsum += gw;
    }
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / wsum, vec4f(0.0), vec4f(1.0)));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpatialSigma;
uniform float uRangeSigma;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res    = vec2(textureSize(uTex, 0));
  float ss     = max(uSpatialSigma, 0.5);
  float rs     = max(uRangeSigma / 255.0, 0.01);
  int   radius = clamp(int(ceil(2.0 * ss)), 1, 15);
  float invSs2 = 0.5 / (ss * ss);
  float invRs2 = 0.5 / (rs * rs);

  vec4 center = texture(uTex, vUV);
  vec4 acc    = vec4(0.0);
  float wsum  = 0.0;

  for (int ky = -15; ky <= 15; ky++) {
    if (abs(ky) > radius) continue;
    for (int kx = -15; kx <= 15; kx++) {
      if (abs(kx) > radius) continue;
      vec2 uv2 = clamp(vUV + vec2(float(kx), float(ky)) / res, vec2(0.0), vec2(1.0));
      vec4 nb  = texture(uTex, uv2);
      float sd = float(kx * kx + ky * ky);
      float rd = dot(nb.rgb - center.rgb, nb.rgb - center.rgb);
      float gw = exp(-sd * invSs2 - rd * invRs2);
      acc  += nb * gw; wsum += gw;
    }
  }
  fragColor = clamp(acc / wsum, 0.0, 1.0);
}
`;
