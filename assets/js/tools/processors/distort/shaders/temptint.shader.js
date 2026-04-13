/**
 * DISTORT — Temperature / Tint Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Temperature shifts the colour toward warm (positive) or cool (negative).
 * Tint shifts toward green (negative) or magenta (positive).
 * Values in [-100, 100]; shader applies as fractional offsets.
 *
 * See: nodes/colour/TemperatureTintNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uTemperature, uTint }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uTemperature: 'f32', uTint: 'f32' },
  multiPass: false,
  uniformMap: p => ({ uTemperature: p.temperature, uTint: p.tint }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth       : f32,
  uHeight      : f32,
  uTemperature : f32,
  uTint        : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  // Temperature: warm = +R -B, cool = -R +B
  let t  = uni.uTemperature / 100.0 * 0.1;
  // Tint: magenta = +R +B -G, green = -R -B +G
  let ti = uni.uTint / 100.0 * 0.1;
  let r  = clamp(px.r + t + ti,      0.0, 1.0);
  let g  = clamp(px.g - ti,          0.0, 1.0);
  let b  = clamp(px.b - t + ti,      0.0, 1.0);
  textureStore(tOut, vec2i(x, y), vec4f(r, g, b, px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uTemperature;
uniform float uTint;

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec4  px = texture(uTex, vUV);
  float t  = uTemperature / 100.0 * 0.1;
  float ti = uTint        / 100.0 * 0.1;
  fragColor = vec4(
    clamp(px.r + t + ti, 0.0, 1.0),
    clamp(px.g - ti,     0.0, 1.0),
    clamp(px.b - t + ti, 0.0, 1.0),
    px.a
  );
}
`;
