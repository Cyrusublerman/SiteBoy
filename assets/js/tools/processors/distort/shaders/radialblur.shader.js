/**
 * DISTORT — Radial Blur Node GPU Shaders
 *
 * GPU pattern: gather (multi-sample)
 * Supports two modes:
 *   zoom: samples radially outward/inward from centre (scale blur)
 *   spin: samples along circular arc around centre (rotation blur)
 *
 * See: nodes/blur/RadialBlurNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uType, uCentreX, uCentreY, uAmount, uSamples, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uType: 'i32', uCentreX: 'f32', uCentreY: 'f32', uAmount: 'f32', uSamples: 'i32' },
  multiPass: false,
  uniformMap: p => ({
    uType: p.type === 'zoom' ? 0 : 1,
    uCentreX: p.centreX, uCentreY: p.centreY,
    uAmount: p.amount, uSamples: p.samples,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uType    : f32,  // 0=zoom, 1=spin
  uCentreX : f32,
  uCentreY : f32,
  uAmount  : f32,
  uSamples : f32,
  _pad     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

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

  let cx      = uni.uCentreX * uni.uWidth;
  let cy      = uni.uCentreY * uni.uHeight;
  let dx      = f32(x) - cx;
  let dy      = f32(y) - cy;
  let n       = max(1, i32(uni.uSamples));
  let amount  = uni.uAmount;

  var acc = vec4f(0.0);
  for (var i = 0; i < n; i++) {
    let t = f32(i) / f32(n - 1) - 0.5; // [-0.5, 0.5]
    var sx: f32; var sy: f32;
    if (uni.uType < 0.5) {
      // zoom: scale dx/dy
      let scale = 1.0 + t * amount * 0.01;
      sx = cx + dx * scale;
      sy = cy + dy * scale;
    } else {
      // spin: rotate by small angle
      let ang  = t * amount * PI / 180.0;
      let cosA = cos(ang); let sinA = sin(ang);
      sx = cx + cosA * dx - sinA * dy;
      sy = cy + sinA * dx + cosA * dy;
    }
    acc += bilinear(sx, sy, w, h);
  }
  textureStore(tOut, vec2i(x, y), clamp(acc / f32(n), vec4f(0.0), vec4f(1.0)));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uType;
uniform float uCentreX; uniform float uCentreY;
uniform float uAmount; uniform float uSamples;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  vec2  uvc = vec2(uCentreX, uCentreY);
  vec2  d   = (vUV - uvc) * res;
  int   n   = max(1, int(uSamples));

  vec4 acc = vec4(0.0);
  for (int i = 0; i < 32; i++) {
    if (i >= n) break;
    float t = float(i) / float(n - 1) - 0.5;
    vec2 src;
    if (uType == 0) {
      float scale = 1.0 + t * uAmount * 0.01;
      src = uvc + (d * scale) / res;
    } else {
      float ang = t * uAmount * PI / 180.0;
      float c = cos(ang); float s = sin(ang);
      vec2 rd = vec2(c*d.x - s*d.y, s*d.x + c*d.y);
      src = uvc + rd / res;
    }
    acc += texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
  }
  fragColor = clamp(acc / float(n), 0.0, 1.0);
}
`;
