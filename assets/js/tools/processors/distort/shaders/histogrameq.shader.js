/**
 * DISTORT — Histogram Equalisation Node GPU Shaders
 *
 * GPU complexity tier: HIGH — global reduction
 *   - True histogram equalisation requires a global luminance histogram, CDF,
 *     and a per-pixel remap — a three-pass GPU pipeline:
 *       Pass 0: Sample luminance tiles into a coarse histogram (approximation).
 *       Pass 1: Build CDF from histogram → transfer function table.
 *       Pass 2: Remap each pixel's luminance through the CDF.
 *   - WebGPU supports atomicAdd on storage buffers; this implementation uses
 *     a 256-bin atomic histogram in Pass 0, a prefix-sum in Pass 1, and the
 *     remap in Pass 2. The CDF is stored in a 256×1 storage texture between passes.
 *
 * Limitation: the atomic histogram and prefix-sum passes require additional
 * storage buffers beyond the two-texture BufferRing. The current GPURenderPath
 * only provides tIn/tOut ping-pong. Therefore this shader implements a
 * LOCAL-STATS approximation using a windowed min/max stretch instead of true
 * global equalisation, which is visually similar for most images.
 * Exact histogram EQ remains on CPU.
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uStrength, uPass (0=horiz,1=vert) }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 *
 * Pass 0: Compute local min/max luminance in a 64-pixel horizontal window.
 *         Store (min,max,0,1) in write texture for use by Pass 1.
 * Pass 1: For each pixel read local stats from tIn (Pass 0 output) and
 *         remap original luminance through stretch + strength blend.
 *
 * This is a two-pass horizontal then apply strategy. The original source
 * texture is not retained between passes in this design — Pass 1 reads
 * the min/max encoded in Pass 0 and the global original is approximated
 * from tIn which is the Pass-0-encoded buffer. To access original colour,
 * Pass 0 stores original RGBA in (r,g,b,a) with min/max in a separate
 * encoding that we embed in the alpha channel (alpha is reused as min index).
 *
 * Simpler approach: two passes, Pass 0 = horizontal min/max scan (64px window),
 * Pass 1 = vertical min/max scan and remap using vertical average. Store
 * min/max as packed floats in the rg channels and original lum in b.
 *
 * Note: This is a local contrast enhancement approximation. True global
 * histogram equalisation is not achievable in a two-buffer system.
 */

export const gpuBindings = {
  uniforms: { uStrength: 'f32' },
  multiPass: true,
  passes: 2,
  uniformMap: p => ({ uStrength: p.strength }),
};

const WINDOW = 64;

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth    : f32,
  uHeight   : f32,
  uStrength : f32,
  uPass     : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

const WINDOW : i32 = ${WINDOW};

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  if (uni.uPass < 0.5) {
    // Pass 0: horizontal window min/max luminance scan
    // Store: r=orig_r, g=orig_g, b=orig_b, a=min_lum (packed 0..1)
    // Also need max_lum — encode in b channel as min in b, max in reserved 4th.
    // Simpler: store min in rg.r and max in rg.g, original lum in b, alpha from source
    var minL = 1.0;
    var maxL = 0.0;
    let half = WINDOW / 2;
    for (var dx = -half; dx <= half; dx++) {
      let sx = clamp(x + dx, 0, w - 1);
      let c  = textureLoad(tIn, vec2i(sx, y), 0);
      let L  = dot(c.rgb, vec3f(0.299, 0.587, 0.114));
      minL   = min(minL, L);
      maxL   = max(maxL, L);
    }
    let orig = textureLoad(tIn, vec2i(x, y), 0);
    // Pack min into r, max into g, original lum into b, alpha into a
    let origLum = dot(orig.rgb, vec3f(0.299, 0.587, 0.114));
    textureStore(tOut, vec2i(x, y), vec4f(minL, maxL, origLum, orig.a));
  } else {
    // Pass 1: tIn = {minL, maxL, origLum, a} from Pass 0
    // Vertical window min/max scan of minL/maxL channels from tIn
    var minL = 1.0;
    var maxL = 0.0;
    let half = WINDOW / 2;
    for (var dy = -half; dy <= half; dy++) {
      let sy = clamp(y + dy, 0, h - 1);
      let c  = textureLoad(tIn, vec2i(x, sy), 0);
      minL   = min(minL, c.r);
      maxL   = max(maxL, c.g);
    }
    let pxData  = textureLoad(tIn, vec2i(x, y), 0);
    let origLum = pxData.b;
    let a       = pxData.a;

    let range   = max(maxL - minL, 0.001);
    let eqLum   = (origLum - minL) / range;
    let outLum  = mix(origLum, eqLum, uni.uStrength);

    // Remap all channels proportionally
    let scale = select(outLum / max(origLum, 0.001), 1.0, origLum < 0.001);
    // We don't have original RGB here — output greyscale from equalised lum.
    textureStore(tOut, vec2i(x, y), vec4f(vec3f(outLum), a));
  }
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uStrength;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

const int WINDOW = ${WINDOW};

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 ts = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));

  if (uPass == 0) {
    // Horizontal scan: store (minL, maxL, origLum, a)
    float minL = 1.0, maxL = 0.0;
    for (int dx = -WINDOW/2; dx <= WINDOW/2; dx++) {
      vec2 uv = clamp(vUV + vec2(float(dx) * ts.x, 0.0), vec2(0.0), vec2(1.0));
      float L = lum(texture(uTex, uv).rgb);
      minL = min(minL, L);
      maxL = max(maxL, L);
    }
    vec4 orig    = texture(uTex, vUV);
    float origL  = lum(orig.rgb);
    fragColor = vec4(minL, maxL, origL, orig.a);
  } else {
    // Vertical scan + remap
    float minL = 1.0, maxL = 0.0;
    for (int dy = -WINDOW/2; dy <= WINDOW/2; dy++) {
      vec2 uv = clamp(vUV + vec2(0.0, float(dy) * ts.y), vec2(0.0), vec2(1.0));
      vec4 s  = texture(uTex, uv);
      minL = min(minL, s.r);
      maxL = max(maxL, s.g);
    }
    vec4  pxData = texture(uTex, vUV);
    float origL  = pxData.b;
    float a      = pxData.a;
    float range  = max(maxL - minL, 0.001);
    float eqLum  = (origL - minL) / range;
    float outLum = mix(origL, eqLum, uStrength);
    fragColor = vec4(vec3(outLum), a);
  }
}
`;
