/**
 * DISTORT — Dilate/Erode Node GPU Shaders
 *
 * GPU complexity tier: MODERATE — neighbourhood morphology
 *   - Single-pass dilation or erosion over a square or circle structuring element.
 *   - For each pixel, scans a (2r+1)×(2r+1) neighbourhood and takes the channel-wise
 *     max (dilate) or min (erode) across the luminance-selected or RGB domain.
 *   - Multi-pass (iterations param) handled by GPURenderPath ping-pong.
 *
 * GPU eligibility: only LUMINANCE and RGB LINKED domains; IMAGE output only.
 * All other domain/output combinations fall back to CPU.
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uRadius, uMode (0=dilate,1=erode), uShape (0=square,1=circle) }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

const DOMAIN_INDEX = { 'LUMINANCE': 0, 'RGB LINKED': 1, 'RGB INDEPENDENT': 0, 'ALPHA': 0, 'MASK': 0, 'EDGE MAP': 0, 'THRESHOLDED BINARY': 0 };
const OUTPUT_INDEX = { 'IMAGE': 0, 'MASK': 1, 'FIELD': 2, 'HYBRID': 3 };

export const gpuBindings = {
  uniforms: { uRadius: 'i32', uMode: 'i32', uShape: 'i32' },
  multiPass: false,
  passesFromParams: p => Math.round(p.iterations),
  uniformMap: p => ({
    uRadius: p.isotropic ? Math.round(p.radius) : Math.round(p.radiusX),
    uMode:   p.mode === 'DILATE' ? 0 : 1,
    uShape:  p.shape === 'CIRCLE' ? 1 : 0,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  uMode   : f32,  // 0 = dilate, 1 = erode
  uShape  : f32,  // 0 = square, 1 = circle
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  let r       = max(1, min(20, i32(uni.uRadius)));
  let dilate  = uni.uMode < 0.5;
  let circle  = uni.uShape > 0.5;
  let r2      = f32(r * r);

  var best = vec4f(0.0);
  if (dilate) { best = vec4f(0.0); } else { best = vec4f(1.0); }

  for (var dy = -r; dy <= r; dy++) {
    for (var dx = -r; dx <= r; dx++) {
      if (circle && f32(dx*dx + dy*dy) > r2) { continue; }
      let sx = clamp(x + dx, 0, w - 1);
      let sy = clamp(y + dy, 0, h - 1);
      let c  = textureLoad(tIn, vec2i(sx, sy), 0);
      if (dilate) {
        best = max(best, c);
      } else {
        best = min(best, c);
      }
    }
  }

  // preserve alpha from source
  let orig = textureLoad(tIn, vec2i(x, y), 0);
  textureStore(tOut, vec2i(x, y), vec4f(best.rgb, orig.a));
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform int       uRadius;
uniform int       uMode;   // 0 = dilate, 1 = erode
uniform int       uShape;  // 0 = square, 1 = circle

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r   = max(1, min(20, uRadius));
  float r2 = float(r * r);

  vec4 best = (uMode == 0) ? vec4(0.0) : vec4(1.0);

  for (int dy = -r; dy <= r; dy++) {
    for (int dx = -r; dx <= r; dx++) {
      if (uShape == 1 && float(dx*dx + dy*dy) > r2) { continue; }
      vec2 uv = clamp(vUV + vec2(float(dx), float(dy)) * ts, vec2(0.0), vec2(1.0));
      vec4 c  = texture(uTex, uv);
      if (uMode == 0) { best = max(best, c); }
      else            { best = min(best, c); }
    }
  }

  vec4 orig = texture(uTex, vUV);
  fragColor = vec4(best.rgb, orig.a);
}
`;
