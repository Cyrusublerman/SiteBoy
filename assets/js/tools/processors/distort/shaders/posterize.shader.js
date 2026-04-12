/**
 * DISTORT — Posterize Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Quantises each channel to N discrete levels:
 *   out = floor(c * levels) / (levels - 1)
 *
 * See: nodes/colour/PosterizeNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uLevels, _pad }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uLevels: 'f32' },
  multiPass: false,
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uLevels : f32,
  _pad    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn posterizeChannel(c: f32, levels: f32) -> f32 {
  return floor(c * levels) / max(levels - 1.0, 1.0);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  let L  = uni.uLevels;
  textureStore(tOut, vec2i(x, y), vec4f(
    clamp(posterizeChannel(px.r, L), 0.0, 1.0),
    clamp(posterizeChannel(px.g, L), 0.0, 1.0),
    clamp(posterizeChannel(px.b, L), 0.0, 1.0),
    px.a,
  ));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uLevels;

in  vec2 vUV;
out vec4 fragColor;

float posterizeChannel(float c, float levels) {
  return floor(c * levels) / max(levels - 1.0, 1.0);
}

void main() {
  vec4 px = texture(uTex, vUV);
  fragColor = vec4(
    clamp(posterizeChannel(px.r, uLevels), 0.0, 1.0),
    clamp(posterizeChannel(px.g, uLevels), 0.0, 1.0),
    clamp(posterizeChannel(px.b, uLevels), 0.0, 1.0),
    px.a
  );
}
`;
