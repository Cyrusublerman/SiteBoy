/**
 * DISTORT — Box Blur Node GPU Shaders
 *
 * Reference implementation: two-pass separable box blur.
 * Node type: kernel / separable convolution
 *
 * GPU complexity tier: MODERATE — standard
 *   - Two passes (horizontal then vertical).
 *   - Each pass reads a 1D window of width 2*radius+1 centred on each pixel.
 *   - WGSL path uses workgroup shared memory (tile + halo) to minimise texture
 *     fetches: each thread cooperatively loads a tile, then reads from shared
 *     memory during the sum loop (L1-equivalent cache locality).
 *   - GLSL path uses straightforward texture fetches (no shared memory in GL).
 *   - Multiple passes (the `passes` param) are achieved by running the two-pass
 *     dispatch sequence `passes` times. GPURenderPath handles this via multiPass.
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uRadius, uPass (0=horiz, 1=vert) }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 *
 * WebGL2: uTex (sampler2D, unit 0), uWidth (int), uHeight (int),
 *         uRadius (int), uPass (int, 0=horiz, 1=vert)
 *
 * See: assets/js/tools/processors/distort/nodes/blur/BoxBlurNode.js
 */

// ── gpuBindings descriptor ────────────────────────────────────────────────────

export const gpuBindings = {
  uniforms: {
    uRadius: 'i32',
  },
  // multiPass: true signals GPURenderPath to issue two dispatches per call
  // (pass 0 = horizontal, pass 1 = vertical), then repeat `passes` times.
  multiPass: true,
  // Number of dispatches per logical "pass" pair (not the passes param)
  passes: 2,
};

// ── WGSL compute shader (WebGPU) ─────────────────────────────────────────────
// Workgroup 64×1: processes a horizontal tile row or vertical tile column.
// The halo on each side = uRadius; tile width = 64.
// Shared memory: 64 + 2*MAX_RADIUS RGBA pixels.

const MAX_RADIUS_WGSL = 50; // must match previewMax in BoxBlurNode

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uRadius : f32,  // clamp to 1..50
  uPass   : f32,  // 0 = horizontal, 1 = vertical
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

// Shared tile: 64 + 2*50 = 164 slots per workgroup
var<workgroup> tile : array<vec4f, 164>;

@compute @workgroup_size(64, 1, 1)
fn main(
  @builtin(global_invocation_id) gid : vec3u,
  @builtin(local_invocation_id)  lid : vec3u,
) {
  let r  = max(1, min(50, i32(uni.uRadius)));
  let w  = i32(uni.uWidth);
  let h  = i32(uni.uHeight);
  let horizontal = uni.uPass < 0.5;

  // Primary and halo coordinates
  let lx = i32(lid.x);

  var px : i32;  // primary axis pixel index
  var py : i32;  // secondary axis pixel index
  if (horizontal) {
    px = i32(gid.x);
    py = i32(gid.y);
  } else {
    px = i32(gid.y);
    py = i32(gid.x);
  }

  // Each thread loads itself + responsibility for part of the halo
  // Simpler approach: load primary pixel + clamped neighbours into tile
  // (for workgroup 64, each thread loads one slot; halo loaded by boundary threads)
  let tileIdx = lx + r;  // offset into tile by halo width

  var coord : vec2i;
  if (horizontal) {
    coord = vec2i(clamp(px, 0, w-1), clamp(py, 0, h-1));
  } else {
    coord = vec2i(clamp(py, 0, w-1), clamp(px, 0, h-1));
  }
  tile[tileIdx] = textureLoad(tIn, coord, 0);

  // Left halo (only first r threads load)
  if (lx < u32(r)) {
    let hpos = px - r + i32(lx);
    var hcoord : vec2i;
    if (horizontal) {
      hcoord = vec2i(clamp(hpos, 0, w-1), clamp(py, 0, h-1));
    } else {
      hcoord = vec2i(clamp(py, 0, w-1), clamp(hpos, 0, h-1));
    }
    tile[lx] = textureLoad(tIn, hcoord, 0);
  }

  // Right halo (last r threads load)
  if (lx >= 64u - u32(r)) {
    let hpos = px + i32(lx) - 63 + r;
    let hIdx = lx + 2u * u32(r);
    var hcoord : vec2i;
    if (horizontal) {
      hcoord = vec2i(clamp(hpos, 0, w-1), clamp(py, 0, h-1));
    } else {
      hcoord = vec2i(clamp(py, 0, w-1), clamp(hpos, 0, h-1));
    }
    tile[hIdx] = textureLoad(tIn, hcoord, 0);
  }

  workgroupBarrier();

  // Out of bounds — do not write
  if (horizontal) {
    if (px >= w || py >= h) { return; }
  } else {
    if (px >= h || py >= w) { return; }
  }

  // Box sum from shared memory
  var sum = vec4f(0.0);
  let diam = f32(2 * r + 1);
  for (var d = -r; d <= r; d++) {
    sum += tile[tileIdx + d];
  }
  sum /= diam;

  var outCoord : vec2i;
  if (horizontal) {
    outCoord = vec2i(px, py);
  } else {
    outCoord = vec2i(py, px);
  }
  textureStore(tOut, outCoord, sum);
}
`;

// ── GLSL ES 3.00 fragment shader (WebGL2 fallback) ───────────────────────────

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform int       uRadius;
uniform int       uPass;  // 0 = horizontal, 1 = vertical

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 texelSize = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int r = max(1, min(50, uRadius));
  float diam = float(2 * r + 1);
  vec4 sum = vec4(0.0);

  for (int d = -r; d <= r; d++) {
    vec2 offset = (uPass == 0)
      ? vec2(float(d) * texelSize.x, 0.0)
      : vec2(0.0, float(d) * texelSize.y);
    sum += texture(uTex, clamp(vUV + offset, vec2(0.0), vec2(1.0)));
  }

  fragColor = sum / diam;
}
`;
