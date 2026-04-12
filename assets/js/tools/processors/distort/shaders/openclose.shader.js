/**
 * DISTORT — Open/Close Node GPU Shaders
 *
 * GPU complexity tier: MODERATE — two-pass morphology (open = erode then dilate, close = dilate then erode)
 *   - GPURenderPath multiPass + passesFromParams handles the two-step sequence per iteration.
 *   - Pass 0: first operation (erode for open, dilate for close).
 *   - Pass 1: second operation (dilate for open, erode for close).
 *   - Structuring element: square only (circle and diamond/cross fall back to CPU).
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uRadius, uStep (0=first,1=second), uMode (0=open,1=close) }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uRadius: 'i32', uStep: 'i32', uMode: 'i32' },
  multiPass: true,
  passes: 2,
  passesFromParams: p => Math.round(p.iterations) * 2,
  uniformMap: p => ({
    uRadius: Math.round(p.radius),
    uStep:   0,
    uMode:   p.mode === 'OPEN' ? 0 : 1,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,
  uStep   : f32,  // 0 = first op, 1 = second op
  uMode   : f32,  // 0 = open (erode first), 1 = close (dilate first)
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

  let r = max(1, min(20, i32(uni.uRadius)));

  // open:  step0=erode,  step1=dilate
  // close: step0=dilate, step1=erode
  let firstIsDilate = uni.uMode > 0.5;
  let step0Dilate   = firstIsDilate;
  let step1Dilate   = !firstIsDilate;
  let isDilate      = select(step1Dilate, step0Dilate, uni.uStep < 0.5);

  var best: vec4f;
  if (isDilate) { best = vec4f(0.0); } else { best = vec4f(1.0); }

  for (var dy = -r; dy <= r; dy++) {
    for (var dx = -r; dx <= r; dx++) {
      let c = textureLoad(tIn, vec2i(clamp(x+dx, 0, w-1), clamp(y+dy, 0, h-1)), 0);
      if (isDilate) { best = max(best, c); }
      else          { best = min(best, c); }
    }
  }

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
uniform int       uStep;  // 0 = first op, 1 = second op
uniform int       uMode;  // 0 = open (erode first), 1 = close (dilate first)

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 ts = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r  = max(1, min(20, uRadius));

  // open: step0=erode, step1=dilate; close: step0=dilate, step1=erode
  bool step0Dilate = (uMode == 1);
  bool isDilate    = (uStep == 0) ? step0Dilate : !step0Dilate;

  vec4 best = isDilate ? vec4(0.0) : vec4(1.0);

  for (int dy = -r; dy <= r; dy++) {
    for (int dx = -r; dx <= r; dx++) {
      vec2 uv = clamp(vUV + vec2(float(dx), float(dy)) * ts, vec2(0.0), vec2(1.0));
      vec4 c  = texture(uTex, uv);
      if (isDilate) { best = max(best, c); }
      else          { best = min(best, c); }
    }
  }

  vec4 orig = texture(uTex, vUV);
  fragColor = vec4(best.rgb, orig.a);
}
`;
