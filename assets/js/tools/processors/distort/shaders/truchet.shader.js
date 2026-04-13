/**
 * DISTORT — Truchet Node GPU Shaders
 *
 * GPU pattern: per-pixel generative (tile-based SDF)
 * Renders QUARTER ARC motif Truchet tiles with RANDOM orientation.
 * Complex modification modes (DISPLACEMENT, DISTANCE FIELD, REGION MASK) fall back
 * to CPU automatically; GPU handles the common case: NONE modificationMode.
 *
 * Tile orientation is determined by a hash of (tileI, tileJ) using a seed.
 *
 * See: nodes/pattern/TruchetNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uTileSize, uStrokeWidth, uOpacity,
 *                          uBlend, uSeed, uStrokeR, uStrokeG, uStrokeB, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

const BLEND_INDEX = { 'multiply': 0, 'screen': 1, 'replace': 2, 'overlay': 3 };

export const gpuBindings = {
  uniforms: {
    uTileSize: 'f32', uStrokeWidth: 'f32', uOpacity: 'f32', uBlend: 'i32',
    uSeed: 'f32', uStrokeR: 'f32', uStrokeG: 'f32', uStrokeB: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uTileSize: p.tileSize, uStrokeWidth: p.strokeWidth, uOpacity: p.patternOpacity,
    uBlend: BLEND_INDEX[p.internalBlend.toLowerCase()] ?? 0,
    uSeed: (p.seed ?? 0), uStrokeR: p.strokeR / 255, uStrokeG: p.strokeG / 255, uStrokeB: p.strokeB / 255,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uTileSize    : f32,
  uStrokeWidth : f32,
  uOpacity     : f32,
  uBlend       : f32,
  uSeed        : f32,
  uStrokeR     : f32,
  uStrokeG     : f32,
  uStrokeB     : f32,
  _pad         : f32,
  _pad2        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Hash tile index to 0 or 1
fn tileHash(ti: i32, tj: i32, seed: u32) -> u32 {
  var h = (u32(ti) * 2654435761u) ^ (u32(tj) * 2246822519u) ^ seed;
  h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u;
  return h & 1u;
}

// Quarter-arc SDF: distance to arc centred at corner based on state
fn quarterArcSDF(lx: f32, ly: f32, ts: f32, sw: f32, state: u32) -> f32 {
  let r = ts * 0.5;
  var dist: f32;
  if (state == 0u) {
    // arc from (0,0) and (ts,ts) corners
    let d1 = abs(sqrt(lx * lx + ly * ly) - r);
    let d2 = abs(sqrt((lx - ts) * (lx - ts) + (ly - ts) * (ly - ts)) - r);
    dist = min(d1, d2);
  } else {
    // arc from (ts,0) and (0,ts) corners
    let d1 = abs(sqrt((lx - ts) * (lx - ts) + ly * ly) - r);
    let d2 = abs(sqrt(lx * lx + (ly - ts) * (ly - ts)) - r);
    dist = min(d1, d2);
  }
  return dist - sw * 0.5;
}

fn blendCh(src: f32, col: f32, onStroke: f32, mode: i32, op: f32) -> f32 {
  var b: f32;
  if (mode == 0) { b = src * col; }
  else if (mode == 1) { b = 1.0 - (1.0 - src) * (1.0 - col); }
  else if (mode == 3) { b = select(1.0 - 2.0*(1.0-src)*(1.0-col), 2.0*src*col, src < 0.5); }
  else { b = col; }
  return clamp(mix(src, b, onStroke * op), 0.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px    = textureLoad(tIn, vec2i(x, y), 0);
  let ts    = max(5.0, uni.uTileSize);
  let ti    = i32(floor(f32(x) / ts));
  let tj    = i32(floor(f32(y) / ts));
  let lx    = f32(x) - f32(ti) * ts;
  let ly    = f32(y) - f32(tj) * ts;
  let state = tileHash(ti, tj, u32(uni.uSeed));
  let sdf   = quarterArcSDF(lx, ly, ts, uni.uStrokeWidth, state);

  // Anti-aliased stroke coverage
  let onStroke = clamp(-sdf + 0.5, 0.0, 1.0);

  let mode = i32(uni.uBlend);
  let op   = uni.uOpacity;
  let r    = blendCh(px.r, uni.uStrokeR, onStroke, mode, op);
  let g    = blendCh(px.g, uni.uStrokeG, onStroke, mode, op);
  let b    = blendCh(px.b, uni.uStrokeB, onStroke, mode, op);
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTileSize; uniform float uStrokeWidth;
uniform float uOpacity; uniform int uBlend; uniform float uSeed;
uniform float uStrokeR; uniform float uStrokeG; uniform float uStrokeB;

in  vec2 vUV;
out vec4 fragColor;

uint tileHash(int ti, int tj, uint seed) {
  uint h = (uint(ti) * 2654435761u) ^ (uint(tj) * 2246822519u) ^ seed;
  h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u;
  return h & 1u;
}

float qaSDf(float lx, float ly, float ts, float sw, uint state) {
  float r = ts * 0.5;
  float dist;
  if (state == 0u) {
    float d1 = abs(sqrt(lx*lx+ly*ly)-r);
    float d2 = abs(sqrt((lx-ts)*(lx-ts)+(ly-ts)*(ly-ts))-r);
    dist = min(d1, d2);
  } else {
    float d1 = abs(sqrt((lx-ts)*(lx-ts)+ly*ly)-r);
    float d2 = abs(sqrt(lx*lx+(ly-ts)*(ly-ts))-r);
    dist = min(d1, d2);
  }
  return dist - sw * 0.5;
}

float blCh(float s, float c, float onS, int mode, float op) {
  float b;
  if(mode==0)b=s*c; else if(mode==1)b=1.-(1.-s)*(1.-c); else if(mode==3)b=(s<.5)?2.*s*c:1.-2.*(1.-s)*(1.-c); else b=c;
  return clamp(mix(s,b,onS*op),0.,1.);
}

void main() {
  vec4  px  = texture(uTex, vUV);
  vec2  res = vec2(textureSize(uTex, 0));
  float ppx = vUV.x*res.x; float ppy = vUV.y*res.y;
  float ts  = max(5.0, uTileSize);
  int   ti  = int(floor(ppx/ts)); int tj = int(floor(ppy/ts));
  float lx  = ppx - float(ti)*ts; float ly = ppy - float(tj)*ts;
  uint  st  = tileHash(ti, tj, uint(uSeed));
  float sdf = qaSDf(lx, ly, ts, uStrokeWidth, st);
  float onS = clamp(-sdf + 0.5, 0., 1.);
  fragColor = vec4(blCh(px.r,uStrokeR,onS,uBlend,uOpacity), blCh(px.g,uStrokeG,onS,uBlend,uOpacity), blCh(px.b,uStrokeB,onS,uBlend,uOpacity), px.a);
}
`;
