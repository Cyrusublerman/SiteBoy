/**
 * DISTORT — Lens Bubbles Node GPU Shaders
 *
 * GPU pattern: gather
 * Places a set of circular lens distortions at seeded random positions.
 * GPU generates bubble positions using a hash-based PRNG derived from nodeSeed
 * (passed via a uniform). Positions match the CPU SeededRNG sequence visually.
 *
 * See: nodes/refraction/LensBubblesNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uCount, uMagnification, uMinRadius,
 *                          uMaxRadius, uEdgeSoft, uSeed }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uCount: 'f32', uMagnification: 'f32', uMinRadius: 'f32',
    uMaxRadius: 'f32', uEdgeSoft: 'f32', uSeed: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uCount: p.count, uMagnification: p.magnification,
    uMinRadius: p.minRadius, uMaxRadius: Math.max(p.minRadius, p.maxRadius),
    uEdgeSoft: p.edgeSoft, uSeed: 42, // nodeSeed injected at runtime if available
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth         : f32,
  uHeight        : f32,
  uCount         : f32,
  uMagnification : f32,
  uMinRadius     : f32,
  uMaxRadius     : f32,
  uEdgeSoft      : f32,
  uSeed          : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// LCG matching JS SeededRNG
fn lcg(s: u32) -> u32 { return (s * 1664525u + 1013904223u) & 0xFFFFFFFFu; }
fn lcgF(s_in: u32) -> vec2<f32> {
  let s0 = lcg(s_in);
  let s1 = lcg(s0);
  return vec2f(f32(s0 % 65536u) / 65535.0, f32(s1 % 65536u) / 65535.0);
}

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0=clamp(i32(floor(x)),0,w-1);let y0=clamp(i32(floor(y)),0,h-1);
  let x1=clamp(x0+1,0,w-1);let y1=clamp(y0+1,0,h-1);
  let fx=x-floor(x);let fy=y-floor(y);
  return mix(mix(textureLoad(tIn,vec2i(x0,y0),0),textureLoad(tIn,vec2i(x1,y0),0),fx),
             mix(textureLoad(tIn,vec2i(x0,y1),0),textureLoad(tIn,vec2i(x1,y1),0),fx),fy);
}

const MAX_BUBBLES : i32 = 30;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x=i32(id.x);let y=i32(id.y);
  let w=i32(uni.uWidth);let h=i32(uni.uHeight);
  if(x>=w||y>=h){return;}

  let count  = min(i32(uni.uCount), MAX_BUBBLES);
  let rRange = uni.uMaxRadius - uni.uMinRadius;
  let pxF    = f32(x); let pyF = f32(y);
  var sx     = pxF; var sy = pyF;
  var seed   = u32(uni.uSeed) + 1u;

  for (var i = 0; i < MAX_BUBBLES; i++) {
    if (i >= count) { break; }
    // Generate bubble centre and radius from seeded LCG
    let p1 = lcgF(seed);       seed = lcg(seed + u32(i) * 3u);
    let p2 = lcgF(seed);       seed = lcg(seed + u32(i) * 7u);
    let p3 = lcgF(seed);       seed = lcg(seed + u32(i) * 13u);
    let bx = p1.x * uni.uWidth;
    let by = p1.y * uni.uHeight;
    let br = (uni.uMinRadius + p3.x * rRange) * min(uni.uWidth, uni.uHeight);

    let dx = pxF - bx; let dy = pyF - by;
    let dist = sqrt(dx*dx + dy*dy);
    if (dist < br) {
      // Apply lens distortion inside bubble
      let norm = dist / max(br, 0.001);
      // Edge softness blend factor
      let edgeR = br * (1.0 - uni.uEdgeSoft);
      let blend  = select(1.0, (br - dist) / max(br - edgeR, 0.001), dist > edgeR);
      // Spherical refraction: remap sample position toward centre
      let refract = norm / max(uni.uMagnification * (1.0 - sqrt(1.0 - norm*norm)), 0.001);
      let factor  = select(1.0, refract / max(norm, 0.001), norm > 0.001);
      sx = bx + dx * factor * blend + pxF * (1.0 - blend);
      sy = by + dy * factor * blend + pyF * (1.0 - blend);
      break; // first bubble wins
    }
  }
  textureStore(tOut, vec2i(x,y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uCount; uniform float uMagnification;
uniform float uMinRadius; uniform float uMaxRadius;
uniform float uEdgeSoft; uniform float uSeed;

in  vec2 vUV;
out vec4 fragColor;

// LCG PRNG
uint lcg(uint s) { return s * 1664525u + 1013904223u; }
float lcgF(inout uint s) { s = lcg(s); return float(s % 65536u) / 65535.0; }

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  pxF  = vUV * res;
  int   count = min(int(uCount), 30);
  float rRange = uMaxRadius - uMinRadius;
  vec2  src = pxF;
  uint seed = uint(uSeed) + 1u;

  for (int i = 0; i < 30; i++) {
    if (i >= count) break;
    float bx = lcgF(seed) * res.x; seed = lcg(seed + uint(i) * 3u);
    float by = lcgF(seed) * res.y; seed = lcg(seed + uint(i) * 7u);
    float br = (uMinRadius + lcgF(seed) * rRange) * min(res.x, res.y); seed = lcg(seed + uint(i) * 13u);
    vec2  d  = pxF - vec2(bx, by);
    float dist = length(d);
    if (dist < br) {
      float norm   = dist / max(br, 0.001);
      float edgeR  = br * (1.0 - uEdgeSoft);
      float blend  = (dist > edgeR) ? (br - dist) / max(br - edgeR, 0.001) : 1.0;
      float refract = norm / max(uMagnification * (1.0 - sqrt(1.0 - norm*norm)), 0.001);
      float factor  = (norm > 0.001) ? refract / norm : 1.0;
      src = vec2(bx, by) + d * factor * blend + pxF * (1.0 - blend);
      break;
    }
  }
  fragColor = texture(uTex, clamp(src / res, vec2(0.0), vec2(1.0)));
}
`;
