/**
 * DISTORT — Interference (Thin-Film) Node GPU Shaders
 *
 * GPU pattern: per-pixel (trivial)
 * Models thin-film interference: phase difference from film thickness and view angle
 * determines the RGB reflectance spectrum, blended with the source.
 *
 * Physical model: constructive/destructive interference occurs when
 *   phase = 4π·n·d·cos(θ) / λ
 * where n≈1.5 (oil), d = thickness (nm), θ = view angle, λ = wavelength (nm).
 *
 * See: nodes/optics/InterferenceNode.js
 *
 * Binding layout:
 *   @binding(0) Uniforms { uWidth, uHeight, uFilmThickness, uViewAngle,
 *                          uCouplingStrength, uThicknessOffset, uBlendAmt, uFrame }
 *   @binding(1) read texture (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: {
    uFilmThickness: 'f32', uViewAngle: 'f32',
    uCouplingStrength: 'f32', uThicknessOffset: 'f32',
    uBlendAmt: 'f32', uFrame: 'f32',
  },
  multiPass: false,
  uniformMap: p => ({
    uFilmThickness: p.filmThickness, uViewAngle: p.viewAngle,
    uCouplingStrength: p.couplingStrength, uThicknessOffset: p.thicknessOffset,
    uBlendAmt: p.blendAmt, uFrame: p.frame,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth            : f32,
  uHeight           : f32,
  uFilmThickness    : f32,
  uViewAngle        : f32,
  uCouplingStrength : f32,
  uThicknessOffset  : f32,
  uBlendAmt         : f32,
  uFrame            : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const PI     : f32 = 3.14159265358979;
const TWO_PI : f32 = 6.28318530717959;
const N_OIL  : f32 = 1.5;  // approximate refractive index

fn interferenceChannel(thickness: f32, cosTheta: f32, lambda: f32) -> f32 {
  let phase = (TWO_PI * 2.0 * N_OIL * thickness * cosTheta) / lambda;
  return 0.5 + 0.5 * cos(phase);
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }

  let px = textureLoad(tIn, vec2i(x, y), 0);
  // Effective thickness: base + luminance-coupled offset + frame animation
  let lum   = dot(px.rgb, vec3f(0.299, 0.587, 0.114));
  let thick = uni.uFilmThickness + uni.uFrame * 2.0 + uni.uThicknessOffset
            + lum * uni.uCouplingStrength * 100.0;
  let theta    = uni.uViewAngle * PI / 180.0;
  let cosTheta = cos(theta);
  // Wavelengths: R≈650nm, G≈530nm, B≈450nm
  let iR = interferenceChannel(thick, cosTheta, 650.0);
  let iG = interferenceChannel(thick, cosTheta, 530.0);
  let iB = interferenceChannel(thick, cosTheta, 450.0);
  let iridescence = vec3f(iR, iG, iB);
  let blended = mix(px.rgb, iridescence, uni.uBlendAmt);
  textureStore(tOut, vec2i(x, y), vec4f(clamp(blended, vec3f(0.0), vec3f(1.0)), px.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform float uFilmThickness;
uniform float uViewAngle;
uniform float uCouplingStrength;
uniform float uThicknessOffset;
uniform float uBlendAmt;
uniform float uFrame;

in  vec2 vUV;
out vec4 fragColor;

const float PI     = 3.14159265358979;
const float TWO_PI = 6.28318530717959;
const float N_OIL  = 1.5;

float interferenceChannel(float thickness, float cosTheta, float lambda) {
  float phase = (TWO_PI * 2.0 * N_OIL * thickness * cosTheta) / lambda;
  return 0.5 + 0.5 * cos(phase);
}

void main() {
  vec4  px  = texture(uTex, vUV);
  float lum = dot(px.rgb, vec3(0.299, 0.587, 0.114));
  float thick = uFilmThickness + uFrame * 2.0 + uThicknessOffset
              + lum * uCouplingStrength * 100.0;
  float cosTheta = cos(uViewAngle * PI / 180.0);
  vec3 iridescence = vec3(
    interferenceChannel(thick, cosTheta, 650.0),
    interferenceChannel(thick, cosTheta, 530.0),
    interferenceChannel(thick, cosTheta, 450.0)
  );
  fragColor = vec4(clamp(mix(px.rgb, iridescence, uBlendAmt), 0.0, 1.0), px.a);
}
`;
