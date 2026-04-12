/**
 * DISTORT — Grating Node GPU Shaders
 *
 * GPU pattern: per-pixel generative
 * Generates wave patterns (linear, radial, angular, spiral) and composites
 * with the source image using a blend mode.
 *
 * See: nodes/pattern/GratingNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uType, uWavelength, uPhase, uAngle,
 *                          uCentreX, uCentreY, uSpiralRate, uContrast, uDutyCycle,
 *                          uSoftness, uInvert, uOpacity, uBlend, uAntiAlias }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

// type: 0=LINEAR, 1=RADIAL, 2=ANGULAR, 3=SPIRAL
// blend: 0=MULTIPLY, 1=SCREEN, 2=REPLACE, 3=OVERLAY
const TYPE_INDEX  = { 'LINEAR': 0, 'RADIAL': 1, 'ANGULAR': 2, 'SPIRAL': 3 };
const BLEND_INDEX = { 'multiply': 0, 'screen': 1, 'replace': 2, 'overlay': 3 };

export const gpuBindings = {
  uniforms: {
    uType: 'i32', uWavelength: 'f32', uPhase: 'f32', uAngle: 'f32',
    uCentreX: 'f32', uCentreY: 'f32', uSpiralRate: 'f32', uContrast: 'f32',
    uDutyCycle: 'f32', uSoftness: 'f32', uInvert: 'i32', uOpacity: 'f32',
    uBlend: 'i32',
  },
  multiPass: false,
  uniformMap: p => ({
    uType: TYPE_INDEX[p.gratingType] ?? 0,
    uWavelength: p.wavelength, uPhase: p.phase, uAngle: p.angle,
    uCentreX: p.centreX, uCentreY: p.centreY, uSpiralRate: p.spiralRate,
    uContrast: p.contrast, uDutyCycle: p.dutyCycle, uSoftness: p.softness,
    uInvert: p.invertPattern ? 1 : 0, uOpacity: p.patternOpacity,
    uBlend: BLEND_INDEX[p.internalBlend.toLowerCase()] ?? 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth      : f32,
  uHeight     : f32,
  uType       : f32,
  uWavelength : f32,
  uPhase      : f32,
  uAngle      : f32,
  uCentreX    : f32,
  uCentreY    : f32,
  uSpiralRate : f32,
  uContrast   : f32,
  uDutyCycle  : f32,
  uSoftness   : f32,
  uInvert     : f32,
  uOpacity    : f32,
  uBlend      : f32,
  _pad        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;

fn evalGrating(x: f32, y: f32, cx: f32, cy: f32) -> f32 {
  let wl  = max(uni.uWavelength, 1.0);
  let ang = uni.uAngle * PI / 180.0;
  var t: f32;
  let typ = i32(uni.uType);
  if (typ == 0) {
    // LINEAR
    t = (cos(ang) * x + sin(ang) * y) / wl;
  } else if (typ == 1) {
    // RADIAL
    let dx = x - cx; let dy = y - cy;
    t = sqrt(dx*dx + dy*dy) / wl;
  } else if (typ == 2) {
    // ANGULAR
    let dx = x - cx; let dy = y - cy;
    var a = atan2(dy, dx);
    if (a < 0.0) { a += TWO_PI; }
    t = a / TWO_PI * wl; // reuse wl as cycles
    t = t / wl;
  } else {
    // SPIRAL
    let dx = x - cx; let dy = y - cy;
    let r  = sqrt(dx*dx + dy*dy);
    var a  = atan2(dy, dx);
    if (a < 0.0) { a += TWO_PI; }
    t = (r + a * uni.uSpiralRate * wl / TWO_PI) / wl;
  }

  t = t + uni.uPhase;
  // Convert t to [0,1] wave: duty cycle + softness
  let c  = fract(t);
  let dc = clamp(uni.uDutyCycle, 0.0, 1.0);
  var v: f32;
  if (uni.uSoftness <= 0.0) {
    v = select(0.0, 1.0, c < dc);
  } else {
    let sf = uni.uSoftness * 0.5;
    v = clamp((c < dc) ? (dc - c) / max(sf, 0.001) : (c - dc) / max(sf, 0.001), 0.0, 1.0);
    v = select(1.0 - v, v, c < dc);
  }
  v = 0.5 + (v - 0.5) * uni.uContrast;
  v = clamp(v, 0.0, 1.0);
  if (uni.uInvert > 0.5) { v = 1.0 - v; }
  return v;
}

fn blendCh(src: f32, v: f32, mode: i32) -> f32 {
  if (mode == 0) { return src * v; }
  if (mode == 1) { return 1.0 - (1.0 - src) * (1.0 - v); }
  if (mode == 3) { return select(1.0 - 2.0*(1.0-src)*(1.0-v), 2.0*src*v, src < 0.5); }
  return v; // replace
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let cx = uni.uCentreX * uni.uWidth;
  let cy = uni.uCentreY * uni.uHeight;
  let v  = evalGrating(f32(x), f32(y), cx, cy);
  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;

  let outR = clamp(mix(px.r, blendCh(px.r, v, mode), op), 0.0, 1.0);
  let outG = clamp(mix(px.g, blendCh(px.g, v, mode), op), 0.0, 1.0);
  let outB = clamp(mix(px.b, blendCh(px.b, v, mode), op), 0.0, 1.0);
  textureStore(tOut, vec2i(x, y), vec4f(outR, outG, outB, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int   uType;
uniform float uWavelength; uniform float uPhase; uniform float uAngle;
uniform float uCentreX; uniform float uCentreY; uniform float uSpiralRate;
uniform float uContrast; uniform float uDutyCycle; uniform float uSoftness;
uniform int   uInvert; uniform float uOpacity; uniform int uBlend;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;
const float TWO_PI = 6.28318530717959;

float evalGrating(float px, float py, float cx, float cy) {
  float wl = max(uWavelength, 1.0);
  float ang = uAngle * PI / 180.0;
  float t;
  if (uType == 0)      t = (cos(ang)*px + sin(ang)*py) / wl;
  else if (uType == 1) { float dx=px-cx,dy=py-cy; t=sqrt(dx*dx+dy*dy)/wl; }
  else if (uType == 2) { float dx=px-cx,dy=py-cy; float a=atan(dy,dx); if(a<0.)a+=TWO_PI; t=a/TWO_PI*wl/wl; }
  else { float dx=px-cx,dy=py-cy; float r=sqrt(dx*dx+dy*dy); float a=atan(dy,dx); if(a<0.)a+=TWO_PI; t=(r+a*uSpiralRate*wl/TWO_PI)/wl; }
  t += uPhase;
  float c = fract(t);
  float dc = clamp(uDutyCycle, 0., 1.);
  float v;
  if (uSoftness <= 0.0) { v = (c < dc) ? 1.0 : 0.0; }
  else { float sf=uSoftness*.5; float raw=(c<dc)?(dc-c)/max(sf,.001):(c-dc)/max(sf,.001); raw=clamp(raw,0.,1.); v=(c<dc)?raw:1.-raw; }
  v = 0.5 + (v - 0.5) * uContrast;
  v = clamp(v, 0., 1.);
  if (uInvert == 1) v = 1.0 - v;
  return v;
}

float blendCh(float s, float v, int mode) {
  if (mode==0) return s*v;
  if (mode==1) return 1.-(1.-s)*(1.-v);
  if (mode==3) return (s<.5)?2.*s*v:1.-2.*(1.-s)*(1.-v);
  return v;
}

void main() {
  vec4  px  = texture(uTex, vUV);
  vec2  res = vec2(textureSize(uTex, 0));
  float cx  = uCentreX * res.x; float cy = uCentreY * res.y;
  float ppx = vUV.x * res.x;    float ppy = vUV.y * res.y;
  float v   = evalGrating(ppx, ppy, cx, cy);
  float op  = uOpacity;
  fragColor = vec4(
    clamp(mix(px.r, blendCh(px.r, v, uBlend), op), 0., 1.),
    clamp(mix(px.g, blendCh(px.g, v, uBlend), op), 0., 1.),
    clamp(mix(px.b, blendCh(px.b, v, uBlend), op), 0., 1.),
    px.a
  );
}
`;
