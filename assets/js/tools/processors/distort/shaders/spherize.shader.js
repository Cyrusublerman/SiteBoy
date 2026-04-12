/**
 * DISTORT — Spherize Node GPU Shaders
 *
 * GPU pattern: gather
 * Applies spherical lens distortion. Positive amount = bulge outward, negative = pinch.
 *
 * See: nodes/distortion/SpherizeNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uAmount, uRadius, uCentreX, uCentreY, _pad, _pad2 }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uAmount: 'f32', uRadius: 'f32', uCentreX: 'f32', uCentreY: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uAmount: p.amount, uRadius: p.radius, uCentreX: p.centreX, uCentreY: p.centreY }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth   : f32,
  uHeight  : f32,
  uAmount  : f32,
  uRadius  : f32,
  uCentreX : f32,
  uCentreY : f32,
  _pad     : f32,
  _pad2    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn bilinear(x: f32, y: f32, w: i32, h: i32) -> vec4f {
  let x0 = clamp(i32(floor(x)), 0, w-1); let y0 = clamp(i32(floor(y)), 0, h-1);
  let x1 = clamp(x0 + 1, 0, w-1);       let y1 = clamp(y0 + 1, 0, h-1);
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

  let cx   = uni.uCentreX * uni.uWidth;
  let cy   = uni.uCentreY * uni.uHeight;
  let maxR = uni.uRadius * min(uni.uWidth, uni.uHeight) * 0.5;
  let dx   = f32(x) - cx;
  let dy   = f32(y) - cy;
  let dist = sqrt(dx * dx + dy * dy);

  if (dist >= maxR || maxR <= 0.0) {
    textureStore(tOut, vec2i(x, y), textureLoad(tIn, vec2i(x, y), 0));
    return;
  }

  let norm = dist / maxR;
  // Spherical lens: remap norm using arcsin-based formula
  let sphere = select(
    norm * (1.0 + uni.uAmount * (1.0 - sqrt(1.0 - norm * norm))),
    norm * (1.0 + uni.uAmount * (1.0 / max(sqrt(1.0 - norm * norm), 0.001) - 1.0)),
    uni.uAmount > 0.0,
  );
  let factor = select(1.0, sphere / norm, norm > 0.0);
  let sx = cx + dx * factor;
  let sy = cy + dy * factor;
  textureStore(tOut, vec2i(x, y), bilinear(sx, sy, w, h));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uAmount;
uniform float uRadius;
uniform float uCentreX;
uniform float uCentreY;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2  res  = vec2(textureSize(uTex, 0));
  vec2  uvc  = vec2(uCentreX, uCentreY);
  vec2  d    = vUV - uvc;
  // Normalise by radius in UV space
  float maxR = uRadius * 0.5;
  vec2  dn   = d / max(maxR, 0.001);
  float norm = length(dn);
  if (norm >= 1.0) { fragColor = texture(uTex, vUV); return; }
  float sphere;
  if (uAmount > 0.0)
    sphere = norm * (1.0 + uAmount * (1.0 / max(sqrt(1.0 - norm*norm), 0.001) - 1.0));
  else
    sphere = norm * (1.0 + uAmount * (1.0 - sqrt(1.0 - norm*norm)));
  float factor = (norm > 0.0) ? sphere / norm : 1.0;
  vec2  src = uvc + d * factor;
  fragColor = texture(uTex, clamp(src, vec2(0.0), vec2(1.0)));
}
`;
