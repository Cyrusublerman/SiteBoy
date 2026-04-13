/**
 * DISTORT — Halftone Pattern Node GPU Shaders
 *
 * GPU pattern: per-pixel generative
 * Places dots on a square or hexagonal grid, sized by local luminance.
 * GPU implements luminance response source; other response sources fall back
 * naturally since apply() still runs on CPU for those modes.
 *
 * See: nodes/pattern/HalftonePatternNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uSpacing, uAngle, uMinDot, uMaxDot,
 *                          uBgLevel, uDotLevel, uGridType, _pad, _pad2, _pad3 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

// gridType: 0=square, 1=hexagonal, 2=staggered
const GRID_INDEX = { 'square': 0, 'hexagonal': 1, 'staggered': 2 };

export const gpuBindings = {
  uniforms: {
    uSpacing: 'f32', uAngle: 'f32', uMinDot: 'f32', uMaxDot: 'f32',
    uBgLevel: 'f32', uDotLevel: 'f32', uGridType: 'i32',
  },
  multiPass: false,
  uniformMap: p => ({
    uSpacing: p.spacing, uAngle: p.angle, uMinDot: p.minDot, uMaxDot: p.maxDot,
    uBgLevel: p.bgLevel, uDotLevel: p.dotLevel,
    uGridType: GRID_INDEX[p.gridType] ?? 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uSpacing  : f32,
  uAngle    : f32,
  uMinDot   : f32,
  uMaxDot   : f32,
  uBgLevel  : f32,
  uDotLevel : f32,
  uGridType : f32,
  _pad      : f32,
  _pad2     : f32,
  _pad3     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI : f32 = 3.14159265358979;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let sp  = max(uni.uSpacing, 2.0);
  let ang = uni.uAngle * PI / 180.0;
  let cosA = cos(ang); let sinA = sin(ang);

  // Rotate pixel
  let rx = f32(x) * cosA - f32(y) * sinA;
  let ry = f32(x) * sinA + f32(y) * cosA;

  // Find nearest grid cell centre
  var tcx: f32; var tcy: f32;
  let typ = i32(uni.uGridType);
  if (typ == 1) {
    // hexagonal: offset every other row
    let col  = floor(rx / sp);
    let row  = floor(ry / (sp * 0.866));
    let rowOdd = (i32(row) % 2) == 1;
    let offX = select(0.0, sp * 0.5, rowOdd);
    tcx = (col + 0.5) * sp + offX;
    tcy = (row + 0.5) * sp * 0.866;
  } else {
    // square or staggered (treat identically for basic version)
    let col = floor(rx / sp);
    let row = floor(ry / sp);
    let rowOdd = (i32(row) % 2) == 1;
    let offX = select(0.0, sp * 0.5, typ == 2 && rowOdd);
    tcx = (col + 0.5) * sp + offX;
    tcy = (row + 0.5) * sp;
  }

  // Unrotate to get original source pixel for luminance
  let srcX = tcx * cosA + tcy * sinA;
  let srcY = -tcx * sinA + tcy * cosA;
  let sample = bilinear(srcX, srcY, w, h);
  let lum = dot(sample.rgb, vec3f(0.299, 0.587, 0.114));

  // Dot radius from luminance
  let dotRadius = mix(uni.uMinDot, uni.uMaxDot, lum);
  // Distance from cell centre
  let dist = sqrt((rx - tcx) * (rx - tcx) + (ry - tcy) * (ry - tcy));

  let inDot = dist < dotRadius;
  let bg  = uni.uBgLevel / 255.0;
  let dot = uni.uDotLevel / 255.0;
  let val = select(bg, dot, inDot);

  textureStore(tOut, vec2i(x, y), vec4f(val, val, val, 1.0));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uSpacing; uniform float uAngle;
uniform float uMinDot; uniform float uMaxDot;
uniform float uBgLevel; uniform float uDotLevel; uniform int uGridType;

in  vec2 vUV;
out vec4 fragColor;

const float PI = 3.14159265358979;

void main() {
  vec2  res = vec2(textureSize(uTex, 0));
  float px  = vUV.x * res.x; float py = vUV.y * res.y;
  float sp  = max(uSpacing, 2.0);
  float ang = uAngle * PI / 180.0;
  float cosA = cos(ang); float sinA = sin(ang);
  float rx = px * cosA - py * sinA;
  float ry = px * sinA + py * cosA;

  float tcx; float tcy;
  if (uGridType == 1) {
    float col=floor(rx/sp); float row=floor(ry/(sp*.866));
    float offX=(int(row)%2==1)?sp*.5:0.;
    tcx=(col+.5)*sp+offX; tcy=(row+.5)*sp*.866;
  } else {
    float col=floor(rx/sp); float row=floor(ry/sp);
    float offX=(uGridType==2&&(int(row)%2==1))?sp*.5:0.;
    tcx=(col+.5)*sp+offX; tcy=(row+.5)*sp;
  }

  float srcX = tcx*cosA + tcy*sinA;
  float srcY = -tcx*sinA + tcy*cosA;
  vec4  s   = texture(uTex, clamp(vec2(srcX,srcY)/res, vec2(0.), vec2(1.)));
  float lum = dot(s.rgb, vec3(.299,.587,.114));
  float dotR = mix(uMinDot, uMaxDot, lum);
  float dist = length(vec2(rx-tcx, ry-tcy));
  float val  = (dist < dotR) ? uDotLevel/255.0 : uBgLevel/255.0;
  fragColor  = vec4(val, val, val, 1.0);
}
`;
