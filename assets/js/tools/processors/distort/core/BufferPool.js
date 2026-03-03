/**
 * DISTORT — Uint8ClampedArray buffer pool keyed by byte length.
 * Recycles allocations to reduce GC pressure during repeated renders.
 * Cap per-size list at 8 to prevent unbounded growth.
 */
export class BufferPool {
  constructor() {
    this._pool = new Map();
  }

  acquire(size) {
    const list = this._pool.get(size);
    if (list && list.length > 0) {
      const buf = list.pop();
      buf.fill(0);
      return buf;
    }
    return new Uint8ClampedArray(size);
  }

  release(buf) {
    if (!buf || !buf.length) return;
    const size = buf.length;
    let list = this._pool.get(size);
    if (!list) { list = []; this._pool.set(size, list); }
    if (list.length < 8) list.push(buf);
  }

  clear() { this._pool.clear(); }
}

export const pool = new BufferPool();
