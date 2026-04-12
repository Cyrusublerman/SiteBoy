/**
 * DISTORT — Motion Blur Node GPU Shaders
 *
 * GPU pattern: gather (directional 1D sampling)
 * Samples `distance` pixels along the blur direction (defined by angle),
 * averaging them to produce motion blur.
 *
 * Single-pass: each output pixel averages distance+1 input samples
 * along the direction vector. No shared memory needed.
 *
 * See: nodes/blur/MotionBlurNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uAngle, uDistance }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uAngle: 'f32', uDistance: 'i32' },
  multiPass: false,
  uniformMap: p => ({ uAngle: p.angle, uDistance: p.distance }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uAngle    : f32,
  uDistance : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let rad  = uni.uAngle * PI / 180.0;
  let dx   = cos(rad);
  let dy   = sin(rad);
  let dist = max(1.0, uni.uDistance);
  let n    = i32(dist);

  var acc  = vec4f(0.0);
  for (var k = 0; k <= n; k++) {
    let t   = f32(k) / dist;
    let sx  = clamp(x + i32(round(dx * f32(k) - dx * dist * 0.5)), 0, w - 1);
    let sy  = clamp(y + i32(round(dy * f32(k) - dy * dist * 0.5)), 0, h - 1);
    acc += textureLoad(tIn, vec2i(sx, sy), 0);
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / f32(n + 1), vec4f(0.0), vec4f(1.0)));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAngle;
uniform float uDistance;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float rad  = uAngle * PI / 180.0;
  float dx   = cos(rad) / res.x;
  float dy   = sin(rad) / res.y;
  float dist = max(1.0, uDistance);
  int   n    = int(dist);

  vec4 acc = vec4(0.0);
  for (int k = 0; k <= 100; k++) {
    if (k > n) break;
    float t  = float(k) / dist;
    vec2  uv = clamp(vUV + (float(k) - dist * 0.5) * vec2(dx, dy), vec2(0.0), vec2(1.0));
    acc += texture(uTex, uv);
  }
  fragColor = clamp(acc / float(n + 1), 0.0, 1.0);
}
`;
