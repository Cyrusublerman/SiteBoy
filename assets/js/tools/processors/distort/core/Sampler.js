/**
 * DISTORT — pixel sampling utilities.
 * Bilinear and nearest-neighbour sample with clamped boundary conditions.
 * sampleDst / bilinearDst / nearestDst write directly into an output buffer
 * at a given byte offset — zero allocation in the hot path.
 */
export class Sampler {
  static clamp(v, mx) { return v < 0 ? 0 : v >= mx ? mx - 1 : v; }

  static bilinear(px, w, h, fx, fy) {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const dx = fx - x0, dy = fy - y0;
    const cx0 = this.clamp(x0, w), cx1 = this.clamp(x0 + 1, w);
    const cy0 = this.clamp(y0, h), cy1 = this.clamp(y0 + 1, h);
    const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
    const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
    const r = [];
    for (let c = 0; c < 4; c++) {
      r[c] = (px[i00 + c] * (1 - dx) + px[i10 + c] * dx) * (1 - dy) +
              (px[i01 + c] * (1 - dx) + px[i11 + c] * dx) * dy;
    }
    return r;
  }

  static nearest(px, w, h, fx, fy) {
    const x = this.clamp(Math.round(fx), w), y = this.clamp(Math.round(fy), h);
    const i = (y * w + x) * 4;
    return [px[i], px[i + 1], px[i + 2], px[i + 3]];
  }

  static sample(px, w, h, fx, fy, m) {
    return m === 'bilinear' ? this.bilinear(px, w, h, fx, fy) : this.nearest(px, w, h, fx, fy);
  }

  static bilinearDst(px, w, h, fx, fy, dst, i) {
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const dx = fx - x0, dy = fy - y0;
    const cx0 = x0 < 0 ? 0 : x0 >= w ? w - 1 : x0;
    const cx1 = x0 + 1 < 0 ? 0 : x0 + 1 >= w ? w - 1 : x0 + 1;
    const cy0 = y0 < 0 ? 0 : y0 >= h ? h - 1 : y0;
    const cy1 = y0 + 1 < 0 ? 0 : y0 + 1 >= h ? h - 1 : y0 + 1;
    const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
    const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
    const idx = 1 - dx, idy = 1 - dy;
    const w00 = idx * idy, w10 = dx * idy, w01 = idx * dy, w11 = dx * dy;
    dst[i]     = px[i00] * w00 + px[i10] * w10 + px[i01] * w01 + px[i11] * w11;
    dst[i + 1] = px[i00 + 1] * w00 + px[i10 + 1] * w10 + px[i01 + 1] * w01 + px[i11 + 1] * w11;
    dst[i + 2] = px[i00 + 2] * w00 + px[i10 + 2] * w10 + px[i01 + 2] * w01 + px[i11 + 2] * w11;
    dst[i + 3] = px[i00 + 3] * w00 + px[i10 + 3] * w10 + px[i01 + 3] * w01 + px[i11 + 3] * w11;
  }

  static nearestDst(px, w, h, fx, fy, dst, i) {
    const x = Math.round(fx), y = Math.round(fy);
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    const si = (cy * w + cx) * 4;
    dst[i] = px[si]; dst[i + 1] = px[si + 1]; dst[i + 2] = px[si + 2]; dst[i + 3] = px[si + 3];
  }

  static sampleDst(px, w, h, fx, fy, m, dst, i) {
    if (m === 'bilinear') this.bilinearDst(px, w, h, fx, fy, dst, i);
    else this.nearestDst(px, w, h, fx, fy, dst, i);
  }
}
