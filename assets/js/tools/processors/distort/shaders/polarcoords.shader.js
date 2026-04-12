/**
 * DISTORT — Polar Coords Node GPU Shaders
 *
 * GPU pattern: gather
 * Converts between rectangular and polar coordinate systems.
 * rectToPolar: maps UV position to (r, θ) → read from image in polar space.
 * polarToRect: maps UV as (r=x, θ=y) → read from corresponding rectangular position.
 *
 * See: nodes/distortion/PolarCoordsNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uMode, uCentreX, uCentreY, _pad, _pad2, _pad3 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uMode: 'i32', uCentreX: 'f32', uCentreY: 'f32' },
  multiPass: false,
  uniformMap: p => ({
    uMode: p.mode === 'rectToPolar' ? 0 : 1,
    uCentreX: p.centreX, uCentreY: p.centreY,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uMode    : f32,  // 0=rectToPolar, 1=polarToRect
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
  _pad3    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
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

  let cx  = uni.uCentreX * uni.uWidth;
  let cy  = uni.uCentreY * uni.uHeight;
  let maxR = sqrt(cx * cx + cy * cy);

  var sx: f32; var sy: f32;
  if (uni.uMode < 0.5) {
    // rectToPolar: current pixel → its polar angle/radius → map to image
    let dx  = f32(x) - cx; let dy = f32(y) - cy;
    let r   = sqrt(dx*dx + dy*dy);
    var ang = atan2(dy, dx);
    if (ang < 0.0) { ang += TWO_PI; }
    sx = (ang / TWO_PI) * uni.uWidth;
    sy = (1.0 - r / max(maxR, 1.0)) * uni.uHeight;
  } else {
    // polarToRect: interpret pixel x=angle, y=radius → rectangular
    let ang = (f32(x) / uni.uWidth) * TWO_PI;
    let r   = (1.0 - f32(y) / uni.uHeight) * maxR;
    sx = cx + cos(ang) * r;
    sy = cy + sin(ang) * r;
  }
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uMode;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

const float PI     = 3.14159265358979;
const float TWO_PI = 6.28318530717959;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float cx  = uCentreX; float cy = uCentreY;
  float maxR = sqrt(cx*cx + cy*cy);

  vec2 src;
  if (uMode == 0) {
    vec2  d   = vUV - vec2(cx, cy);
    float r   = length(d);
    float ang = atan(d.y, d.x);
    if (ang < 0.0) ang += TWO_PI;
    src = vec2(ang / TWO_PI, 1.0 - r / max(maxR, 0.001));
  } else {
    float ang = vUV.x * TWO_PI;
    float r   = (1.0 - vUV.y) * maxR;
    src = vec2(cx + cos(ang) * r, cy + sin(ang) * r);
  }
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
