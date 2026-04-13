/**
 * DISTORT — Moire Node GPU Shaders
 *
 * GPU pattern: per-pixel generative
 * Overlays two grating patterns and combines them. GPU implements all
 * grating types (LINEAR, RADIAL, ANGULAR) and combine modes (PRODUCT, SUM, XOR, MIN, MAX).
 *
 * See: nodes/pattern/MoireNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uType1, uWl1, uAngle1, uPhase1, uDc1, uSoftness1,
 *                          uType2, uWl2, uAngle2, uPhase2, uDc2, uSoftness2,
 *                          uCombine, uInvert, uOpacity, uBlend }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

const TYPE_INDEX    = { 'LINEAR': 0, 'RADIAL': 1, 'ANGULAR': 2 };
const COMBINE_INDEX = { 'product': 0, 'sum': 1, 'xor': 2, 'min': 3, 'max': 4 };
const BLEND_INDEX   = { 'multiply': 0, 'screen': 1, 'replace': 2, 'overlay': 3 };

export const gpuBindings = {
  uniforms: {
    uType1: 'i32', uWl1: 'f32', uAngle1: 'f32', uPhase1: 'f32', uDc1: 'f32', uSoftness1: 'f32',
    uType2: 'i32', uWl2: 'f32', uAngle2: 'f32', uPhase2: 'f32', uDc2: 'f32', uSoftness2: 'f32',
    uCombine: 'i32', uInvert: 'i32', uOpacity: 'f32', uBlend: 'i32',
  },
  multiPass: false,
  uniformMap: p => ({
    uType1: TYPE_INDEX[p.type1] ?? 0, uWl1: p.wavelength1, uAngle1: p.angle1,
    uPhase1: p.phase1, uDc1: p.dutyCycle1, uSoftness1: p.softness1,
    uType2: TYPE_INDEX[p.type2] ?? 0, uWl2: p.wavelength2, uAngle2: p.angle2,
    uPhase2: p.phase2, uDc2: p.dutyCycle2, uSoftness2: p.softness2,
    uCombine: COMBINE_INDEX[p.combineMode.toLowerCase()] ?? 0,
    uInvert: p.invertPattern ? 1 : 0, uOpacity: p.patternOpacity,
    uBlend: BLEND_INDEX[p.internalBlend.toLowerCase()] ?? 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uType1     : f32,
  uWl1       : f32,
  uAngle1    : f32,
  uPhase1    : f32,
  uDc1       : f32,
  uSoftness1 : f32,
  uType2     : f32,
  uWl2       : f32,
  uAngle2    : f32,
  uPhase2    : f32,
  uDc2       : f32,
  uSoftness2 : f32,
  uCombine   : f32,
  uInvert    : f32,
  uOpacity   : f32,
  uBlend     : f32,
  _pad       : f32,
  _pad2      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;
const CX     : f32 = 0.5;
const CY     : f32 = 0.5;

fn evalGrating1D(x: f32, y: f32, typ: i32, wl: f32, ang: f32, ph: f32, dc: f32, sf: f32) -> f32 {
  let w = max(wl, 1.0);
  var t: f32;
  let a = ang * PI / 180.0;
  let cx = CX * uni.uWidth; let cy = CY * uni.uHeight;
  if (typ == 0) {
    t = (cos(a) * x + sin(a) * y) / w;
  } else if (typ == 1) {
    let dx = x - cx; let dy = y - cy;
    t = sqrt(dx*dx + dy*dy) / w;
  } else {
    let dx = x - cx; let dy = y - cy;
    var aa = atan2(dy, dx);
    if (aa < 0.0) { aa += TWO_PI; }
    t = aa / TWO_PI;
  }
  t += ph;
  let c = fract(t);
  let d = clamp(dc, 0.0, 1.0);
  var v: f32;
  if (sf <= 0.0) {
    v = select(0.0, 1.0, c < d);
  } else {
    let s2 = sf * 0.5;
    let raw = select((c - d) / max(s2, 0.001), (d - c) / max(s2, 0.001), c < d);
    v = select(1.0 - clamp(raw, 0.0, 1.0), clamp(raw, 0.0, 1.0), c < d);
  }
  return clamp(v, 0.0, 1.0);
}

fn combineV(a: f32, b: f32, mode: i32) -> f32 {
  if (mode == 0) { return a * b; }
  if (mode == 1) { return clamp(a + b, 0.0, 1.0); }
  if (mode == 2) { return abs(a - b); }
  if (mode == 3) { return min(a, b); }
  return max(a, b);
}

fn blendCh(src: f32, v: f32, mode: i32) -> f32 {
  if (mode == 0) { return src * v; }
  if (mode == 1) { return 1.0 - (1.0 - src) * (1.0 - v); }
  if (mode == 3) { return select(1.0 - 2.0*(1.0-src)*(1.0-v), 2.0*src*v, src < 0.5); }
  return v;
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let fx = f32(x); let fy = f32(y);

  let v1 = evalGrating1D(fx, fy, i32(uni.uType1), uni.uWl1, uni.uAngle1, uni.uPhase1, uni.uDc1, uni.uSoftness1);
  let v2 = evalGrating1D(fx, fy, i32(uni.uType2), uni.uWl2, uni.uAngle2, uni.uPhase2, uni.uDc2, uni.uSoftness2);
  var v  = combineV(v1, v2, i32(uni.uCombine));
  if (uni.uInvert > 0.5) { v = 1.0 - v; }

  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;
  textureStore(tOut, vec2i(x, y), vec4f(
    clamp(mix(px.r, blendCh(px.r, v, mode), op), 0.0, 1.0),
    clamp(mix(px.g, blendCh(px.g, v, mode), op), 0.0, 1.0),
    clamp(mix(px.b, blendCh(px.b, v, mode), op), 0.0, 1.0),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uType1; uniform float uWl1,uAngle1,uPhase1,uDc1,uSoftness1;
uniform int uType2; uniform float uWl2,uAngle2,uPhase2,uDc2,uSoftness2;
uniform int uCombine; uniform int uInvert; uniform float uOpacity; uniform int uBlend;

in  vec2 vUV;
out vec4 fragColor;

const float PI=3.14159265358979; const float TWO_PI=6.28318530717959;

float evalG(float x,float y,int typ,float wl,float ang,float ph,float dc,float sf,float cx,float cy){
  float w=max(wl,1.);float a=ang*PI/180.;float t;
  if(typ==0)      t=(cos(a)*x+sin(a)*y)/w;
  else if(typ==1) { float dx=x-cx,dy=y-cy; t=sqrt(dx*dx+dy*dy)/w; }
  else            { float dx=x-cx,dy=y-cy; float aa=atan(dy,dx); if(aa<0.)aa+=TWO_PI; t=aa/TWO_PI; }
  t+=ph; float c=fract(t); float d=clamp(dc,0.,1.);
  float v;
  if(sf<=0.) v=(c<d)?1.:0.;
  else { float s2=sf*.5; float raw=(c<d)?(d-c)/max(s2,.001):(c-d)/max(s2,.001); v=(c<d)?clamp(raw,0.,1.):1.-clamp(raw,0.,1.); }
  return clamp(v,0.,1.);
}

float combV(float a,float b,int m){
  if(m==0)return a*b; if(m==1)return clamp(a+b,0.,1.); if(m==2)return abs(a-b); if(m==3)return min(a,b); return max(a,b);
}
float blCh(float s,float v,int m){
  if(m==0)return s*v; if(m==1)return 1.-(1.-s)*(1.-v); if(m==3)return(s<.5)?2.*s*v:1.-2.*(1.-s)*(1.-v); return v;
}

void main(){
  vec4 px=texture(uTex,vUV);
  vec2 res=vec2(textureSize(uTex,0));
  float ppx=vUV.x*res.x,ppy=vUV.y*res.y;
  float cx=.5*res.x,cy=.5*res.y;
  float v1=evalG(ppx,ppy,uType1,uWl1,uAngle1,uPhase1,uDc1,uSoftness1,cx,cy);
  float v2=evalG(ppx,ppy,uType2,uWl2,uAngle2,uPhase2,uDc2,uSoftness2,cx,cy);
  float v=combV(v1,v2,uCombine);
  if(uInvert==1)v=1.-v;
  float op=uOpacity;
  fragColor=vec4(
    clamp(mix(px.r,blCh(px.r,v,uBlend),op),0.,1.),
    clamp(mix(px.g,blCh(px.g,v,uBlend),op),0.,1.),
    clamp(mix(px.b,blCh(px.b,v,uBlend),op),0.,1.),
    px.a
  );
}
`;
