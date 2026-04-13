/**
 * DISTORT — Domain Warp Node GPU Shaders
 *
 * GPU pattern: gather (noise-driven UV displacement)
 * Displaces pixel sample coordinates using fBm noise as a vector field.
 * GPU uses the same hash-based gradient noise as perlinoverlay.shader.js.
 * Seed-based permutation table not reproducible identically to CPU PerlinNoise,
 * but visual character matches (same scale/octave structure).
 *
 * See: nodes/noise/DomainWarpNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uStrength, uScale, uOctaves, uLayers, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uStrength: 'f32', uScale: 'f32', uOctaves: 'f32', uLayers: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uStrength: p.strength, uScale: p.scale, uOctaves: p.octaves, uLayers: p.layers }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uStrength : f32,
  uScale    : f32,
  uOctaves  : f32,
  uLayers   : f32,
  _pad      : f32,
  _pad2     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn hash2(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }
fn fade(t: f32) -> f32  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

fn grad2(h: f32, x: f32, y: f32) -> f32 {
  let idx = i32(h * 7.0) % 8;
  let gx  = array<f32,8>(1.,-1., 1.,-1., 0., 0., 1.,-1.);
  let gy  = array<f32,8>(1., 1.,-1., 1., 1.,-1., 0., 0.);
  return gx[idx]*x + gy[idx]*y;
}

fn perlin(px: f32, py: f32) -> f32 {
  let ix = floor(px); let iy = floor(py);
  let fx = px-ix; let fy = py-iy;
  let ux = fade(fx); let uy = fade(fy);
  let n00 = grad2(hash2(ix+iy*57.0),       fx,    fy   );
  let n10 = grad2(hash2(ix+1.0+iy*57.0),   fx-1., fy   );
  let n01 = grad2(hash2(ix+(iy+1.)*57.0),  fx,    fy-1.);
  let n11 = grad2(hash2(ix+1.+(iy+1.)*57.0),fx-1.,fy-1.);
  return mix(mix(n00,n10,ux), mix(n01,n11,ux), uy);
}

fn fbm(px: f32, py: f32, oct: i32) -> f32 {
  var v=0.0; var amp=0.5; var freq=1.0;
  for (var i=0; i<oct; i++) { v+=perlin(px*freq,py*freq)*amp; amp*=0.5; freq*=2.0; }
  return v;
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0+1, 0, w-1);           let y1 = clamp(y0+1, 0, h-1);
  let fx = x-floor(x); let fy = y-floor(y);
  return mix(
    mix(textureLoad(tIn, vec2i(x0,y0), 0), textureLoad(tIn, vec2i(x1,y0), 0), fx),
    mix(textureLoad(tIn, vec2i(x0,y1), 0), textureLoad(tIn, vec2i(x1,y1), 0), fx), fy,
  );
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x); let y = i32(id.y);
  let w = i32(uni.uWidth); let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let oct    = clamp(i32(uni.uOctaves), 1, 8);
  let layers = clamp(i32(uni.uLayers), 1, 3);
  var wx = f32(x); var wy = f32(y);

  for (var l = 0; l < layers; l++) {
    let sc  = uni.uScale * pow(2.0, f32(l));
    let str = uni.uStrength / pow(2.0, f32(l));
    wx += fbm(wx / uni.uWidth * sc,       wy / uni.uHeight * sc,       oct) * str;
    wy += fbm(wx / uni.uWidth * sc + 5.2, wy / uni.uHeight * sc + 1.3, oct) * str;
  }
  textureStore(tOut, vec2i(x, y), bilinear(wx, wy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uStrength; uniform float uScale;
uniform float uOctaves; uniform float uLayers;

in  vec2 vUV;
out vec4 fragColor;

float hash2(float n) { return fract(sin(n) * 43758.5453123); }
float fade(float t)  { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float grad2(float h, float x, float y) {
  int idx = int(h * 7.0) % 8;
  float gx[8]; float gy[8];
  gx[0]=1.;gx[1]=-1.;gx[2]=1.;gx[3]=-1.;gx[4]=0.;gx[5]=0.;gx[6]=1.;gx[7]=-1.;
  gy[0]=1.;gy[1]=1.;gy[2]=-1.;gy[3]=1.;gy[4]=1.;gy[5]=-1.;gy[6]=0.;gy[7]=0.;
  return gx[idx]*x + gy[idx]*y;
}

float perlinN(float px, float py) {
  float ix=floor(px); float iy=floor(py);
  float fx=px-ix; float fy=py-iy;
  float ux=fade(fx); float uy=fade(fy);
  float n00=grad2(hash2(ix+iy*57.),fx,fy);
  float n10=grad2(hash2(ix+1.+iy*57.),fx-1.,fy);
  float n01=grad2(hash2(ix+(iy+1.)*57.),fx,fy-1.);
  float n11=grad2(hash2(ix+1.+(iy+1.)*57.),fx-1.,fy-1.);
  return mix(mix(n00,n10,ux),mix(n01,n11,ux),uy);
}

float fbm(float px, float py, int oct) {
  float v=0.;float amp=.5;float freq=1.;
  for(int i=0;i<8;i++){if(i>=oct)break;v+=perlinN(px*freq,py*freq)*amp;amp*=.5;freq*=2.;}
  return v;
}

void main() {
  vec2 res = vec2(textureSize(uTex, 0));
  int  oct = clamp(int(uOctaves), 1, 8);
  int  lyr = clamp(int(uLayers), 1, 3);
  float wx = vUV.x; float wy = vUV.y;
  for (int l = 0; l < 3; l++) {
    if (l >= lyr) break;
    float sc  = uScale * pow(2.0, float(l));
    float str = uStrength / res.x / pow(2.0, float(l));
    wx += fbm(wx * sc, wy * sc,       oct) * str;
    wy += fbm(wx * sc + 5.2, wy * sc + 1.3, oct) * str;
  }
  fragColor = texture(uTex, clamp(vec2(wx, wy), vec2(0.0), vec2(1.0)));
}
`;
