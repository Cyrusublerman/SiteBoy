/**
 * DISTORT — Canny Edge Node GPU Shaders
 *
 * GPU complexity tier: HIGH — 4-pass pipeline
 *   - Full Canny requires non-maximum suppression and hysteresis thresholding,
 *     both of which require reading results from the previous pass (data dependencies).
 *   - GPURenderPath multiPass with passes=4 handles the sequence via BufferRing.
 *
 * Pass sequence:
 *   Pass 0 (uPass=0): Gaussian blur horizontal (sigma).
 *   Pass 1 (uPass=1): Gaussian blur vertical (sigma).
 *   Pass 2 (uPass=2): Sobel gradient magnitude + direction (quantised to 4 angles).
 *   Pass 3 (uPass=3): Non-maximum suppression + double thresholding.
 *     Note: hysteresis (weak/strong edge linking) requires iterative passes or
 *     global state, which cannot be done in a single dispatch. This pass applies
 *     a local conservative approximation: pixels above highThreshold are strong,
 *     between low and high are kept only if a strong neighbour exists (1 pass).
 *
 * Binding layout (binding group 0):
 *   @binding(0) Uniforms { uWidth, uHeight, uSigma, uLowThresh, uHighThresh, uPass }
 *   @binding(1) read texture  (rgba8unorm)
 *   @binding(2) write texture (rgba8unorm, storage)
 */

export const gpuBindings = {
  uniforms: { uSigma: 'f32', uLowThresh: 'f32', uHighThresh: 'f32' },
  multiPass: true,
  passes: 4,
  uniformMap: p => ({
    uSigma:      p.sigma,
    uLowThresh:  p.lowThreshold,
    uHighThresh: p.highThreshold,
  }),
};

export const wgsl = /* wgsl */`
struct Uniforms {
  uWidth     : f32,
  uHeight    : f32,
  uSigma     : f32,
  uLowThresh : f32,
  uHighThresh: f32,
  uPass      : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;

fn lum(c: vec4f) -> f32 {
  return dot(c.rgb, vec3f(0.299, 0.587, 0.114));
}

fn gaussBlur1D(x: i32, y: i32, w: i32, h: i32, sigma: f32, horizontal: bool) -> vec4f {
  let r   = min(i32(ceil(sigma * 3.0)), 24);
  var sum = vec4f(0.0);
  var wt  = 0.0;
  let s2  = sigma * sigma * 2.0;
  for (var d = -r; d <= r; d++) {
    let gw = exp(-f32(d * d) / s2);
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

fn sobel(x: i32, y: i32, w: i32, h: i32) -> vec2f {
  let tl = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y-1,0,h-1)), 0));
  let tc = lum(textureLoad(tIn, vec2i(x,                 clamp(y-1,0,h-1)), 0));
  let tr = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y-1,0,h-1)), 0));
  let ml = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), y               ), 0));
  let mr = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), y               ), 0));
  let bl = lum(textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y+1,0,h-1)), 0));
  let bc = lum(textureLoad(tIn, vec2i(x,                 clamp(y+1,0,h-1)), 0));
  let br = lum(textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y+1,0,h-1)), 0));
  let gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
  let gy = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
  return vec2f(gx, gy);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3u) {
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  let x = i32(gid.x);
  let y = i32(gid.y);
  if (x >= w || y >= h) { return; }

  var outCol: vec4f;
  let orig = textureLoad(tIn, vec2i(x, y), 0);

  if (uni.uPass < 0.5) {
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma, true);
  } else if (uni.uPass < 1.5) {
    outCol = gaussBlur1D(x, y, w, h, uni.uSigma, false);
  } else if (uni.uPass < 2.5) {
    // Sobel: store magnitude in R, angle index in G
    let g    = sobel(x, y, w, h);
    let mag  = length(g) / 1.4142;
    // Quantise angle to 0..3 (0°,45°,90°,135°)
    var ang  = atan2(g.y, g.x);
    if (ang < 0.0) { ang += 3.14159265; }
    ang = ang * 4.0 / 3.14159265;
    let dir  = i32(ang + 0.5) % 4;
    outCol   = vec4f(mag, f32(dir) / 3.0, 0.0, orig.a);
  } else {
    // Non-maximum suppression + thresholding
    let mag  = orig.r;
    let dir  = i32(round(orig.g * 3.0));
    var n1: f32; var n2: f32;
    if (dir == 0) {
      n1 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), y), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), y), 0).r;
    } else if (dir == 1) {
      n1 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y+1,0,h-1)), 0).r;
    } else if (dir == 2) {
      n1 = textureLoad(tIn, vec2i(x, clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(x, clamp(y+1,0,h-1)), 0).r;
    } else {
      n1 = textureLoad(tIn, vec2i(clamp(x+1,0,w-1), clamp(y-1,0,h-1)), 0).r;
      n2 = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y+1,0,h-1)), 0).r;
    }
    var edge = 0.0;
    if (mag >= n1 && mag >= n2) {
      if (mag >= uni.uHighThresh) {
        edge = 1.0;
      } else if (mag >= uni.uLowThresh) {
        // Local hysteresis: keep if any 8-connected neighbour is strong
        var hasStrong = false;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx == 0 && dy == 0) { continue; }
            let nm = textureLoad(tIn, vec2i(clamp(x+dx,0,w-1), clamp(y+dy,0,h-1)), 0).r;
            if (nm >= uni.uHighThresh) { hasStrong = true; }
          }
        }
        if (hasStrong) { edge = 1.0; }
      }
    }
    outCol = vec4f(vec3f(edge), orig.a);
  }

  textureStore(tOut, vec2i(x, y), outCol);
}
`;

export const glsl = /* glsl */`#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int       uWidth;
uniform int       uHeight;
uniform float     uSigma;
uniform float     uLowThresh;
uniform float     uHighThresh;
uniform int       uPass;

in  vec2 vUV;
out vec4 fragColor;

float lum(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }

vec4 gaussBlur1D(vec2 uv, float sigma, bool horizontal) {
  vec2  ts  = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  int   r   = min(int(ceil(sigma * 3.0)), 24);
  vec4  sum = vec4(0.0);
  float wt  = 0.0;
  float s2  = sigma * sigma * 2.0;
  for (int d = -r; d <= r; d++) {
    float gw  = exp(-float(d * d) / s2);
    vec2  off = horizontal ? vec2(float(d) * ts.x, 0.0) : vec2(0.0, float(d) * ts.y);
    sum += texture(uTex, clamp(uv + off, vec2(0.0), vec2(1.0))) * gw;
    wt  += gw;
  }
  return sum / wt;
}

void main() {
  vec2 ts   = vec2(1.0 / float(uWidth), 1.0 / float(uHeight));
  vec4 orig = texture(uTex, vUV);

  if (uPass == 0) {
    fragColor = gaussBlur1D(vUV, uSigma, true);
    return;
  }
  if (uPass == 1) {
    fragColor = gaussBlur1D(vUV, uSigma, false);
    return;
  }
  if (uPass == 2) {
    float tl = lum(texture(uTex, vUV + vec2(-ts.x, -ts.y)));
    float tc = lum(texture(uTex, vUV + vec2( 0.0,  -ts.y)));
    float tr = lum(texture(uTex, vUV + vec2( ts.x, -ts.y)));
    float ml = lum(texture(uTex, vUV + vec2(-ts.x,  0.0 )));
    float mr = lum(texture(uTex, vUV + vec2( ts.x,  0.0 )));
    float bl = lum(texture(uTex, vUV + vec2(-ts.x,  ts.y)));
    float bc = lum(texture(uTex, vUV + vec2( 0.0,   ts.y)));
    float br = lum(texture(uTex, vUV + vec2( ts.x,  ts.y)));
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
    float mag = length(vec2(gx, gy)) / 1.4142;
    float ang = atan(gy, gx);
    if (ang < 0.0) ang += 3.14159265;
    ang = ang * 4.0 / 3.14159265;
    float dir = mod(floor(ang + 0.5), 4.0);
    fragColor = vec4(mag, dir / 3.0, 0.0, orig.a);
    return;
  }

  // Pass 3: NMS + thresholding
  float mag = orig.r;
  int   dir = int(round(orig.g * 3.0));
  float n1  = 0.0;
  float n2  = 0.0;
  if (dir == 0) {
    n1 = lum(texture(uTex, vUV + vec2(-ts.x,  0.0)));
    n2 = lum(texture(uTex, vUV + vec2( ts.x,  0.0)));
  } else if (dir == 1) {
    n1 = lum(texture(uTex, vUV + vec2(-ts.x, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2( ts.x,  ts.y)));
  } else if (dir == 2) {
    n1 = lum(texture(uTex, vUV + vec2( 0.0, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2( 0.0,  ts.y)));
  } else {
    n1 = lum(texture(uTex, vUV + vec2( ts.x, -ts.y)));
    n2 = lum(texture(uTex, vUV + vec2(-ts.x,  ts.y)));
  }

  float edge = 0.0;
  if (mag >= n1 && mag >= n2) {
    if (mag >= uHighThresh) {
      edge = 1.0;
    } else if (mag >= uLowThresh) {
      for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
          if (dx == 0 && dy == 0) continue;
          float nm = lum(texture(uTex, clamp(vUV + vec2(float(dx)*ts.x, float(dy)*ts.y), vec2(0.0), vec2(1.0))));
          if (nm >= uHighThresh) edge = 1.0;
        }
      }
    }
  }
  fragColor = vec4(vec3(edge), orig.a);
}
`;
