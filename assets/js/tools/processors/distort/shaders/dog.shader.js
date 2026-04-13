/**
 * DISTORT — Difference of Gaussians (DoG) Node GPU Shaders
 *
 * GPU complexity tier: MODERATE — two-pass separable Gaussian × 2 then subtract
 *   - Pass 0: Gaussian blur with sigma1 (horizontal then vertical = 2 dispatches).
 *   - Pass 1: Gaussian blur with sigma2 (horizontal then vertical = 2 dispatches).
 *   - Pass 2: Subtract (blur1 − blur2) and apply threshold.
 *   - GPURenderPath multiPass with passes=5 handles the full sequence.
 *     Passes 0–1: horiz/vert blur for sigma1 into intermediate buffer A.
 *     Passes 2–3: horiz/vert blur for sigma2 into intermediate buffer B.
 *     Pass 4:     subtract A−B, threshold.
 *   - In practice GPURenderPath ping-pong means only two buffers are available;
 *     we approximate with three sequential passes: blur-sigma1, blur-sigma2,
 *     subtract. The subtract pass reads the last-written buffer (sigma2 blur)
 *     and needs the sigma1 blur. This is a known limitation of a 2-buffer ring.
 *
 * Simplified implementation: 3 passes for horizontal blur (sigma1), vertical
 * blur (sigma1), then in Pass 2 re-blur the original with sigma2 and subtract.
 * Pass 0: Gaussian blur sigma1, horizontal.
 * Pass 1: Gaussian blur sigma1, vertical.
 * Pass 2: For each pixel, compute inline Gaussian blur sigma2 from tIn (which
 *         is the original — GPURenderPath feeds original src for all passes unless
 *         chained). Since BufferRing chains, tIn at pass 2 = output of pass 1.
 *         This requires storing the sigma1 result externally.
 *
 * Practical approximation used here:
 *   - Pass 0 (uPass=0): horizontal separable Gaussian, sigma = uSigma1.
 *   - Pass 1 (uPass=1): vertical separable Gaussian, sigma = uSigma1 → result is blurred1.
 *   - Pass 2 (uPass=2): horizontal separable Gaussian on original src stored in uPass=2 read,
 *     sigma = uSigma2. However with BufferRing tIn is blurred1 at this point.
 *     Workaround: pass 2 computes inline sigma2 blur, subtracts from tIn (which ≈ blurred1).
 *     This gives: blurred1 − inline_blurred2(blurred1) ≈ blurred1 − blurred2 when sigma2>>sigma1.
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uSigma1, uSigma2, uThreshold, uPass }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uSigma1: 'f32', uSigma2: 'f32', uThreshold: 'f32' },
  multiPass: true,
  passes: 3,
  uniformMap: p => ({
    uSigma1:    Math.min(p.sigma1, p.sigma2 - 0.1),
    uSigma2:    p.sigma2,
    uThreshold: p.threshold / 255,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSigma1    : f32,
  uSigma2    : f32,
  uThreshold : f32,
  uPass      : f32,  // 0 = horiz sigma1, 1 = vert sigma1, 2 = subtract+threshold
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn gaussWeight(sigma: f32, d: i32) -> f32 {
  let s2 = sigma * sigma * 2.0;
  return exp(-f32(d * d) / s2);
}

fn gaussBlur1D(x: i32, y: i32, w: i32, h: i32, sigma: f32, horizontal: bool) -> vec4f {
  let r   = min(i32(ceil(sigma * 3.0)), 32);
  var sum = vec4f(0.0);
  var wt  = 0.0;
  for (var d = -r; d <= r; d++) {
    let gw = gaussWeight(sigma, d);
    var coord: vec2i;
    if (horizontal) {
      coord = vec2i(clamp(x + d, 0, w - 1), y);
    } else {
      coord = vec2i(x, clamp(y + d, 0, h - 1));
    }
    sum += textureLoad(tIn, coord, 0) * gw;
    wt  += gw;
  }
  return sum / wt;
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  var outCol: vec4f;

  if (uni.uPass < 0.5) {
    // Pass 0: horizontal blur with sigma1
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma1, true);
  } else if (uni.uPass < 1.5) {
    // Pass 1: vertical blur with sigma1
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma1, false);
  } else {
    // Pass 2: tIn = blurred1; compute inline sigma2 blur and subtract
    let blurred1 = textureLoad(tIn, vec2i(x, y), 0);
    let blurred2 = gaussBlur1D(x, y, w, h, uni.uSigma2, true);
    let diff = blurred1.rgb - blurred2.rgb;
    let lum  = dot(diff, vec3f(0.299, 0.587, 0.114));
    let edge = select(0.0, 1.0, abs(lum) > uni.uThreshold);
    outCol = vec4f(vec3f(edge), blurred1.a);
  }

  textureStore(tOut, vec2i(x, y), outCol);
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uSigma1;
uniform float     uSigma2;
uniform float     uThreshold;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

vec4 gaussBlur1D(vec2 uv, float sigma, bool horizontal) {
  vec2 ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int  r   = min(int(ceil(sigma * 3.0)), 32);
  vec4 sum = vec4(0.0);
  float wt = 0.0;
  float s2 = sigma * sigma * 2.0;
  for (int d = -r; d <= r; d++) {
    float gw = exp(-float(d * d) / s2);
    vec2 off = horizontal
      ? vec2(float(d) * ts.x, 0.0)
      : vec2(0.0, float(d) * ts.y);
    sum += texture(uTex, clamp(uv + off, vec2(0.0), vec2(1.0))) * gw;
    wt  += gw;
  }
  return sum / wt;
}

void main() {
  if (uPass == 0) {
    fragColor = gaussBlur1D(vUV, uSigma1, true);
  } else if (uPass == 1) {
    fragColor = gaussBlur1D(vUV, uSigma1, false);
  } else {
    vec4 b1   = texture(uTex, vUV);
    vec4 b2   = gaussBlur1D(vUV, uSigma2, true);
    vec3 diff = b1.rgb - b2.rgb;
    float lum = dot(diff, vec3(0.299, 0.587, 0.114));
    float edge = abs(lum) > uThreshold ? 1.0 : 0.0;
    fragColor = vec4(vec3(edge), b1.a);
  }
}
`;
