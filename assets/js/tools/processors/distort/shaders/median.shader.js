/**
 * DISTORT — Median Filter Node GPU Shaders
 *
 * GPU pattern: stencil (neighbourhood sort)
 * Implements a median filter using a sorting network for radius 1 (3×3 = 9 samples)
 * and radius 2 (5×5 = 25 samples). Higher radii fall back to CPU.
 *
 * GPU median approximation: instead of full sorting network (expensive for large kernels),
 * uses a partial insertion sort limited to the 9 or 25 neighbourhood samples.
 * For radius > 2, the GPU path is not invoked (wgsl/glsl still provide the shader;
 * GPURenderPath will call it, but the CPU apply() is always available as fallback).
 *
 * See: nodes/blur/MedianFilterNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uRadius, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uRadius: 'i32' },
  multiPass: false,
  uniformMap: p => ({ uRadius: p.radius }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  _pad    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn load(x: i32, y: i32, w: i32, h: i32) -> vec4f {
  return textureLoad(tIn, vec2i(clamp(x, 0, w-1), clamp(y, 0, h-1)), 0);
}

// Median of 9 values via partial selection (find middle rank)
fn median9(vals: array<f32, 9>) -> f32 {
  var v = vals;
  // 5 passes of bubble/select sort to find rank 4 (0-indexed median)
  for (var i = 0; i <= 4; i++) {
    for (var j = i + 1; j < 9; j++) {
      if (v[j] < v[i]) { let t = v[i]; v[i] = v[j]; v[j] = t; }
    }
  }
  return v[4];
}

fn median25ch(x: i32, y: i32, w: i32, h: i32, ch: i32) -> f32 {
  var v: array<f32, 25>;
  var idx = 0;
  for (var ky = -2; ky <= 2; ky++) {
    for (var kx = -2; kx <= 2; kx++) {
      let px = load(x + kx, y + ky, w, h);
      v[idx] = select(select(px.b, px.g, ch == 1), px.r, ch == 0);
      idx++;
    }
  }
  // Selection sort to rank 12
  for (var i = 0; i <= 12; i++) {
    for (var j = i + 1; j < 25; j++) {
      if (v[j] < v[i]) { let t = v[i]; v[i] = v[j]; v[j] = t; }
    }
  }
  return v[12];
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let radius = i32(uni.uRadius);
  let px = textureLoad(tIn, vec2i(x, y), 0);

  if (radius <= 1) {
    // 3×3 median
    var r: array<f32, 9>; var g: array<f32, 9>; var b: array<f32, 9>;
    var idx = 0;
    for (var ky = -1; ky <= 1; ky++) {
      for (var kx = -1; kx <= 1; kx++) {
        let s = load(x + kx, y + ky, w, h);
        r[idx] = s.r; g[idx] = s.g; b[idx] = s.b; idx++;
      }
    }
    textureStore(tOut, vec2i(x, y), vec4f(median9(r), median9(g), median9(b), px.a));
  } else {
    // 5×5 median (radius 2)
    textureStore(tOut, vec2i(x, y), vec4f(
      median25ch(x, y, w, h, 0),
      median25ch(x, y, w, h, 1),
      median25ch(x, y, w, h, 2),
      px.a,
    ));
  }
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uRadius;

in  vec2 vUV;
out vec4 fragColor;

vec4 loadS(vec2 uv, vec2 res, float ox, float oy) {
  return texture(uTex, clamp(uv + vec2(ox, oy) / res, vec2(0.0), vec2(1.0)));
}

float median9(float v[9]) {
  for (int i = 0; i <= 4; i++) for (int j = i+1; j < 9; j++)
    if (v[j] < v[i]) { float t = v[i]; v[i] = v[j]; v[j] = t; }
  return v[4];
}

void main() {
  vec2  res    = vec2(textureSize(uTex, 0));
  vec4  center = texture(uTex, vUV);
  int   radius = int(uRadius);

  if (radius <= 1) {
    float r[9]; float g[9]; float b[9]; int idx = 0;
    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
      vec4 s = loadS(vUV, res, float(dx), float(dy));
      r[idx] = s.r; g[idx] = s.g; b[idx] = s.b; idx++;
    }
    fragColor = vec4(median9(r), median9(g), median9(b), center.a);
  } else {
    // 5×5 — compute per-channel median of 25 samples
    float cr[25]; float cg[25]; float cb[25]; int i2 = 0;
    for (int dy = -2; dy <= 2; dy++) for (int dx = -2; dx <= 2; dx++) {
      vec4 s = loadS(vUV, res, float(dx), float(dy));
      cr[i2] = s.r; cg[i2] = s.g; cb[i2] = s.b; i2++;
    }
    // Partial selection sort to rank 12
    for (int ii = 0; ii <= 12; ii++) {
      for (int jj = ii+1; jj < 25; jj++) {
        if (cr[jj] < cr[ii]) { float t = cr[ii]; cr[ii] = cr[jj]; cr[jj] = t; }
        if (cg[jj] < cg[ii]) { float t = cg[ii]; cg[ii] = cg[jj]; cg[jj] = t; }
        if (cb[jj] < cb[ii]) { float t = cb[ii]; cb[ii] = cb[jj]; cb[jj] = t; }
      }
    }
    fragColor = vec4(cr[12], cg[12], cb[12], center.a);
  }
}
`;
