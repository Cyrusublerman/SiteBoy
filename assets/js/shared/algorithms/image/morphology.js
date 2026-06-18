/**
 * @fileoverview Morphological image operations — binary and greyscale erosion, dilation, open, close.
 *
 * All operations use a square structuring element of given radius.
 * Binary operations work on Uint8Array of 0/1 values.
 * Greyscale operations work on single-channel Uint8Array of 0-255 values.
 *
 * @source DISTORT image pipeline reference (src/modules/morphology/operations.js)
 * @wikipedia https://en.wikipedia.org/wiki/Mathematical_morphology
 * @formula erosion: out[x,y] = min{ f[x+ox, y+oy] | (ox,oy) in B }
 *   dilation: out[x,y] = max{ f[x+ox, y+oy] | (ox,oy) in B }
 *   opening = dilate(erode(f,B),B); closing = erode(dilate(f,B),B)
 */

function idx(x, y, w) { return y * w + x; }

/** True when (ox,oy) is inside structuring element. */
function _inSE(ox, oy, radiusX, radiusY, shape) {
  if (shape === 'circle') {
    const nx = ox / Math.max(radiusX, 1);
    const ny = oy / Math.max(radiusY, 1);
    return nx * nx + ny * ny <= 1;
  }
  return Math.abs(ox) <= radiusX && Math.abs(oy) <= radiusY;
}

// ── Binary operations ───────────────────────────────────────────────────────

/**
 * Binary erosion — a pixel is 1 only if all pixels in its neighbourhood are 1.
 * @param {Uint8Array} binary - Input: 0 or 1 per pixel
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function erode(binary, w, h, radius = 1) {
  const out = new Uint8Array(binary.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let keep = 1;
      outer: for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const xx = x + ox, yy = y + oy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h || !binary[idx(xx, yy, w)]) { keep = 0; break outer; }
        }
      }
      out[idx(x, y, w)] = keep;
    }
  }
  return out;
}

/**
 * Binary dilation — a pixel is 1 if any pixel in its neighbourhood is 1.
 * @param {Uint8Array} binary
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function dilate(binary, w, h, radius = 1) {
  const out = new Uint8Array(binary.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let on = 0;
      outer: for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const xx = x + ox, yy = y + oy;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h && binary[idx(xx, yy, w)]) { on = 1; break outer; }
        }
      }
      out[idx(x, y, w)] = on;
    }
  }
  return out;
}

/**
 * Binary opening — erosion followed by dilation (removes small foreground regions).
 * @param {Uint8Array} binary
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function open(binary, w, h, radius = 1) {
  return dilate(erode(binary, w, h, radius), w, h, radius);
}

/**
 * Binary closing — dilation followed by erosion (fills small holes).
 * @param {Uint8Array} binary
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function close(binary, w, h, radius = 1) {
  return erode(dilate(binary, w, h, radius), w, h, radius);
}

// ── Greyscale operations ────────────────────────────────────────────────────

/**
 * Greyscale erosion — replace each pixel with the minimum in its neighbourhood.
 * @param {Uint8Array} channel - Single channel, values 0-255
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function grayscaleErode(channel, w, h, radius = 1, shape = 'square', radiusX = radius, radiusY = radius) {
  const rx = radiusX ?? radius;
  const ry = radiusY ?? radius;
  const out = new Uint8Array(channel.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let best = 255;
      for (let oy = -ry; oy <= ry; oy++) {
        const yy = Math.max(0, Math.min(h - 1, y + oy));
        for (let ox = -rx; ox <= rx; ox++) {
          if (!_inSE(ox, oy, rx, ry, shape)) continue;
          const xx = Math.max(0, Math.min(w - 1, x + ox));
          const v = channel[idx(xx, yy, w)];
          if (v < best) best = v;
        }
      }
      out[idx(x, y, w)] = best;
    }
  }
  return out;
}

/**
 * Greyscale dilation — replace each pixel with the maximum in its neighbourhood.
 * @param {Uint8Array} channel
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function grayscaleDilate(channel, w, h, radius = 1, shape = 'square', radiusX = radius, radiusY = radius) {
  const rx = radiusX ?? radius;
  const ry = radiusY ?? radius;
  const out = new Uint8Array(channel.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let best = 0;
      for (let oy = -ry; oy <= ry; oy++) {
        const yy = Math.max(0, Math.min(h - 1, y + oy));
        for (let ox = -rx; ox <= rx; ox++) {
          if (!_inSE(ox, oy, rx, ry, shape)) continue;
          const xx = Math.max(0, Math.min(w - 1, x + ox));
          const v = channel[idx(xx, yy, w)];
          if (v > best) best = v;
        }
      }
      out[idx(x, y, w)] = best;
    }
  }
  return out;
}

/**
 * Greyscale opening — erode then dilate.
 * @param {Uint8Array} channel
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function grayscaleOpen(channel, w, h, radius = 1) {
  return grayscaleDilate(grayscaleErode(channel, w, h, radius), w, h, radius);
}

/**
 * Greyscale closing — dilate then erode.
 * @param {Uint8Array} channel
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8Array}
 */
export function grayscaleClose(channel, w, h, radius = 1) {
  return grayscaleErode(grayscaleDilate(channel, w, h, radius), w, h, radius);
}

/**
 * Separable approximation: horizontal then vertical 1-D min/max (box SE).
 * @param {Uint8Array} channel
 * @param {number} w
 * @param {number} h
 * @param {number} radius
 * @param {'dilate'|'erode'} mode
 * @returns {Uint8Array}
 */
export function morphologySeparableApprox(channel, w, h, radius, mode = 'dilate') {
  const isMax = mode === 'dilate';
  const tmp = new Uint8Array(channel.length);
  const mid = new Uint8Array(channel.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = isMax ? 0 : 255;
      for (let ox = -radius; ox <= radius; ox++) {
        const xx = Math.max(0, Math.min(w - 1, x + ox));
        const t = channel[idx(xx, y, w)];
        if (isMax) { if (t > v) v = t; } else { if (t < v) v = t; }
      }
      mid[idx(x, y, w)] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = isMax ? 0 : 255;
      for (let oy = -radius; oy <= radius; oy++) {
        const yy = Math.max(0, Math.min(h - 1, y + oy));
        const t = mid[idx(x, yy, w)];
        if (isMax) { if (t > v) v = t; } else { if (t < v) v = t; }
      }
      tmp[idx(x, y, w)] = v;
    }
  }
  return tmp;
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

function _splitChannels(src, n) {
  const r = new Uint8Array(n), g = new Uint8Array(n), b = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const j = i * 4; r[i] = src[j]; g[i] = src[j + 1]; b[i] = src[j + 2]; }
  return { r, g, b };
}

function _mergeChannels(src, r, g, b, n) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) { const j = i * 4; dst[j] = r[i]; dst[j + 1] = g[i]; dst[j + 2] = b[i]; dst[j + 3] = src[j + 3]; }
  return dst;
}

/**
 * Apply dilate or erode to all three colour channels of an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'dilate'|'erode'} mode
 * @param {number} [radius=1]
 * @returns {Uint8ClampedArray}
 */
export function morphologyRGBA(src, w, h, mode, radius = 1, shape = 'square', radiusX = radius, radiusY = radius) {
  const n = w * h;
  const { r, g, b } = _splitChannels(src, n);
  const fn = mode === 'erode' ? grayscaleErode : grayscaleDilate;
  const args = [w, h, radius, shape, radiusX, radiusY];
  return _mergeChannels(src, fn(r, ...args), fn(g, ...args), fn(b, ...args), n);
}

/**
 * Apply open or close to all three colour channels of an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'open'|'close'} mode
 * @param {number} [radius=1]
 * @returns {Uint8ClampedArray}
 */
export function morphologyOpenCloseRGBA(src, w, h, mode, radius = 1) {
  const n = w * h;
  const { r, g, b } = _splitChannels(src, n);
  const fn = mode === 'close' ? grayscaleClose : grayscaleOpen;
  return _mergeChannels(src, fn(r, w, h, radius), fn(g, w, h, radius), fn(b, w, h, radius), n);
}
