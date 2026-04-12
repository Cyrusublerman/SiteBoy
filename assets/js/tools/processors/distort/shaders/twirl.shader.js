/**
 * DISTORT — Twirl Node GPU Shaders
 *
 * GPU pattern: gather
 * Applies rotational displacement around a centre point, with amount proportional
 * to distance from centre (pixels close to centre rotate more).
 *
 * See: nodes/distortion/TwirlNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uAngle, uRadius, uCentreX, uCentreY, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uAngle: 'f32', uRadius: 'f32', uCentreX: 'f32', uCentreY: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uAngle: p.angle, uRadius: p.radius, uCentreX: p.centreX, uCentreY: p.centreY }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uAngle   : f32,
  uRadius  : f32,
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1);
  let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0 + 1, 0, w-1);
  let y1 = clamp(y0 + 1, 0, h-1);
  let fx = x - floor(x); let fy = y - floor(y);
  let tl = textureLoad(tIn, vec2i(x0, y0), 0);
  let tr = textureLoad(tIn, vec2i(x1, y0), 0);
  let bl = textureLoad(tIn, vec2i(x0, y1), 0);
  let br = textureLoad(tIn, vec2i(x1, y1), 0);
  return mix(mix(tl, tr, fx), mix(bl, br, fx), fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let cx  = uni.uCentreX * uni.uWidth;
  let cy  = uni.uCentreY * uni.uHeight;
  let maxR = uni.uRadius * min(uni.uWidth, uni.uHeight) * 0.5;
  let dx  = f32(x) - cx;
  let dy  = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);
  var sx  = f32(x);
  var sy  = f32(y);
  if (dist < maxR && maxR > 0.0) {
    let t   = 1.0 - dist / maxR;
    let rot = uni.uAngle * PI / 180.0 * t;
    let cosA = cos(rot); let sinA = sin(rot);
    sx = cx + cosA * dx - sinA * dy;
    sy = cy + sinA * dx + cosA * dy;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAngle;
uniform float uRadius;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  float cx   = uCentreX;
  float cy   = uCentreY;
  float maxR = uRadius * min(res.x, res.y) * 0.5 / res.x; // normalised
  vec2  uvc  = vec2(cx, cy);
  vec2  d    = vUV - uvc;
  // Account for aspect ratio in distance
  vec2  da   = d * vec2(res.x / res.y, 1.0);
  float dist = length(da) * res.y / min(res.x, res.y);
  vec2  src  = vUV;
  if (dist < uRadius * 0.5) {
    float t   = 1.0 - dist / (uRadius * 0.5);
    float rot = uAngle * PI / 180.0 * t;
    float c   = cos(rot); float s = sin(rot);
    src = uvc + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
