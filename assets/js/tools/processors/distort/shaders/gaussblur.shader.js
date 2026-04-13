/**
 * DISTORT — Gaussian Blur Node GPU Shaders
 *
 * GPU pattern: separable kernel (two-pass H+V per logical pass)
 * Computes Gaussian-weighted 1D convolution.
 * Each logical pass = 2 dispatches (horizontal then vertical).
 * The `passes` param repeats the pair.
 *
 * Approximation: kernel weights are computed analytically in the shader using
 * the Gaussian formula exp(-x²/(2σ²)); σ is passed as a uniform.
 * Radius is derived as ceil(3σ), clamped to MAX_RADIUS.
 *
 * See: nodes/blur/GaussianBlurNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uSigma, uPass }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uSigma: 'f32' },
  multiPass: true,
  passes: 2,
  passesFromParams: p => Math.round(p.passes) * 2,
  uniformMap: p => ({ uSigma: p.sigma }),
};

const MAX_RADIUS_WGSL = 90;

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uSigma  : f32,
  uPass   : f32,  // 0 = horizontal, 1 = vertical
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Shared tile: 64 + 2*90 = 244 slots
var<workgroup> tile : array<vec4f, 244>;
const TILE_W : i32 = 64;

@compute @workgroup_size(64, 1)
fn main(
  @builtin(global_invocation_id) gid : vec3u,
  @builtin(local_invocation_id)  lid : vec3u,
) {
  let sigma   = max(uni.uSigma, 0.1);
  let radius  = clamp(i32(ceil(3.0 * sigma)), 1, ${MAX_RADIUS_WGSL});
  let halo    = radius;
  let tileLen = TILE_W + 2 * halo;

  let isHoriz = uni.uPass < 0.5;
  let x0      = i32(gid.x) - i32(lid.x);  // tile start along primary axis
  let fixed   = select(i32(gid.x), i32(gid.y), isHoriz); // secondary axis
  let w       = i32(uni.uWidth);
  let h       = i32(uni.uHeight);

  // Cooperative tile load (each thread loads one or two slots)
  let localIdx = i32(lid.x);
  for (var load = localIdx; load < tileLen; load += TILE_W) {
    let pos   = x0 + load - halo;
    let clPos = clamp(pos, 0, select(w, h, !isHoriz) - 1);
    let coord  = select(vec2i(clPos, fixed), vec2i(fixed, clPos), !isHoriz);
    if (fixed >= 0 && fixed < select(h, w, !isHoriz)) {
      tile[load] = textureLoad(tIn, coord, 0);
    } else {
      tile[load] = vec4f(0.0);
    }
  }
  workgroupBarrier();

  let globalPos = select(i32(gid.x), i32(gid.y), !isHoriz);
  let limit     = select(w, h, !isHoriz);
  if (globalPos >= limit || fixed >= select(h, w, !isHoriz)) { return; }

  var acc   = vec4f(0.0);
  var wsum  = 0.0;
  let inv2s2 = 0.5 / (sigma * sigma);

  for (var k = -radius; k <= radius; k++) {
    let gw  = exp(-f32(k * k) * inv2s2);
    let idx = localIdx + halo + k;
    acc  += tile[idx] * gw;
    wsum += gw;
  }
  acc /= wsum;

  let outCoord = select(vec2i(i32(gid.x), i32(gid.y)), vec2i(i32(gid.y), i32(gid.x)), !isHoriz);
  textureStore(tOut, outCoord, clamp(acc, vec4f(0.0), vec4f(1.0)));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSigma;
uniform float uPass;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res     = vec2(textureSize(uTex, 0));
  float sigma   = max(uSigma, 0.1);
  int   radius  = clamp(int(ceil(3.0 * sigma)), 1, 90);
  float inv2s2  = 0.5 / (sigma * sigma);
  bool  isHoriz = uPass < 0.5;
  vec2  dir     = isHoriz ? vec2(1.0 / res.x, 0.0) : vec2(0.0, 1.0 / res.y);

  vec4  acc  = vec4(0.0);
  float wsum = 0.0;
  for (int k = -90; k <= 90; k++) {
    if (abs(k) > radius) continue;
    float gw  = exp(-float(k * k) * inv2s2);
    vec2  uv2 = clamp(vUV + float(k) * dir, vec2(0.0), vec2(1.0));
    acc  += texture(uTex, uv2) * gw;
    wsum += gw;
  }
  fragColor = clamp(acc / wsum, 0.0, 1.0);
}
`;
