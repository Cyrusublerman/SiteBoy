/**
 * DISTORT — main-thread interface to the render worker.
 *
 * Features:
 *   - Render ID cancellation: stale responses are discarded silently.
 *   - Timeout: if worker hangs beyond TIMEOUT_MS it is terminated + re-spawned.
 *   - Debounce: scheduleRender(ms) delays dispatch; rapid calls collapse to one.
 *   - Fallback: synchronous Pipeline.render() when Workers are unavailable.
 */

const TIMEOUT_MS = 30_000;

export class WorkerBridge {
  constructor(state, onResult) {
    this.state     = state;
    this.onResult  = onResult;

    this._worker      = null;
    this._workerReady = false;    // true once worker posts 'ready'
    this._pendingDispatch = false; // dispatch waiting for worker ready
    this._pending     = false;
    this._queued      = false;
    this._renderId    = 0;        // monotonic counter; sent with every request
    this._activeId    = null;     // id of the in-flight request
    this._timeoutId   = null;     // window.setTimeout handle for hang detection
    this._debounceId  = null;     // window.setTimeout handle for debounce
    this._fallback    = null;

    this._spawnWorker();
  }

  setFallback(pipeline) { this._fallback = pipeline; }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** Immediately queue a render (one extra queued while one is in-flight). */
  queueRender() {
    if (!this.state.needsRender || !this.state.sourcePixels) return;
    if (!this._worker) { this._renderSync(); return; }
    // Worker exists but hasn't finished loading its module yet — mark pending
    // and dispatch once the 'ready' handshake arrives.
    if (!this._workerReady) { this._pendingDispatch = true; return; }
    if (this._pending) { this._queued = true; return; }
    this._dispatch();
  }

  /**
   * Debounced render — collapses rapid calls into a single dispatch.
   * @param {number} [delayMs=80]
   */
  scheduleRender(delayMs = 80) {
    if (this._debounceId !== null) clearTimeout(this._debounceId);
    this._debounceId = setTimeout(() => {
      this._debounceId = null;
      this.queueRender();
    }, delayMs);
  }

  destroy() {
    if (this._debounceId !== null) clearTimeout(this._debounceId);
    if (this._timeoutId  !== null) clearTimeout(this._timeoutId);
    if (this._worker) { this._worker.terminate(); this._worker = null; }
  }

  // ── Worker lifecycle ─────────────────────────────────────────────────────────

  _spawnWorker() {
    try {
      this._worker = new Worker(
        new URL('./RenderWorker.js', import.meta.url),
        { type: 'module' }
      );
      this._worker.onmessage = (e) => this._onMessage(e.data);
      this._worker.onerror   = (err) => {
        console.warn('[DISTORT] Worker error, falling back to main thread:', err);
        this._killWorker();
      };
    } catch (e) {
      console.warn('[DISTORT] Worker unavailable, using main thread:', e);
      this._worker = null;
    }
  }

  _killWorker() {
    if (this._worker) { this._worker.terminate(); this._worker = null; }
    this._clearTimeout();
    this._pending        = false;
    this._activeId       = null;
    this._workerReady    = false;
    this._pendingDispatch = false;
  }

  // ── Dispatch / receive ───────────────────────────────────────────────────────

  _dispatch() {
    const id = ++this._renderId;
    this._activeId = id;
    this._pending  = true;

    const s = this.state;
    const transfers = [];

    const modulationMapsPayload = {};
    for (const [name, map] of Object.entries(s.modulationMaps ?? {})) {
      const px = map.sourcePixels.slice(0);
      modulationMapsPayload[name] = {
        sourceW: map.sourceW,
        sourceH: map.sourceH,
        pixels: px.buffer,
      };
      transfers.push(px.buffer);
    }

    const stackData = s.stack.map(n => {
      let maskPayload = null;
      if (n.mask) {
        maskPayload = {
          enabled: !!n.mask.enabled,
          source: n.mask.source ?? 'none',
          invert: !!n.mask.invert,
          feather: n.mask.feather ?? 0,
        };
        if (n.mask._sourcePixels?.length) {
          const sp = n.mask._sourcePixels.slice(0);
          maskPayload._sourcePixels = sp.buffer;
          maskPayload._sourceW = n.mask._sourceW;
          maskPayload._sourceH = n.mask._sourceH;
          transfers.push(sp.buffer);
        }
        if (n.mask._drawPixels?.length) {
          const dp = n.mask._drawPixels.slice(0);
          maskPayload._drawPixels = dp.buffer;
          maskPayload._drawW = n.mask._drawW;
          maskPayload._drawH = n.mask._drawH;
          transfers.push(dp.buffer);
        }
      }
      return {
        type: n.type, enabled: n.enabled, opacity: n.opacity, blendMode: n.blendMode ?? 'normal',
        params: { ...n.params },
        mask: maskPayload,
        modulation: { ...(n.modulation ?? {}) },
        frame: s.frame ?? 0,
      };
    });

    // For preview renders, send the pre-downsampled buffer (cached in AppState) —
    // avoids copying the full-res source and lets the worker skip the downsample step.
    const isPrev = s.quality === 'preview';
    let pixelsCopy, sendW, sendH;
    if (isPrev && s.previewScale < 1) {
      const prev = s.getPreviewPixels();
      // Use TypedArray.slice() — copies only the view's own bytes, not the whole backing buffer.
      // buffer.slice() can copy padding bytes if the array is a subview with byteOffset.
      pixelsCopy = prev.pixels.slice(0);
      sendW = prev.w;
      sendH = prev.h;
    } else {
      pixelsCopy = s.sourcePixels.slice(0);
      sendW = s.sourceW;
      sendH = s.sourceH;
    }

    transfers.push(pixelsCopy.buffer);
    this._worker.postMessage({
      type: 'render', renderId: id,
      sourcePixels: pixelsCopy.buffer,
      sourceW: sendW, sourceH: sendH,
      // Signal worker that pixels are already at target resolution (skip its downsample)
      preScaled: isPrev && s.previewScale < 1,
      quality: s.quality, previewScale: s.previewScale,
      globalSeed: s.globalSeed, soloNodeId: s.soloNodeId,
      frame: s.frame ?? 0, frameCount: s.frameCount ?? 1,
      modulationMaps: modulationMapsPayload,
      stack: stackData,
    }, transfers);

    // Hang detection
    this._clearTimeout();
    this._timeoutId = setTimeout(() => {
      console.warn(`[DISTORT] Worker timed out (${TIMEOUT_MS}ms) — terminating and retrying`);
      this._killWorker();
      this._spawnWorker();
      if (this._worker) this._dispatch();
      else this._renderSync();
    }, TIMEOUT_MS);
  }

  _onMessage(data) {
    if (data.type === 'ready') {
      this._workerReady = true;
      // Fire any dispatch that arrived before the worker was ready
      if (this._pendingDispatch && this.state.needsRender && this.state.sourcePixels) {
        this._pendingDispatch = false;
        this._dispatch();
      }
      return;
    }

    if (data.type === 'error') {
      console.warn('[DISTORT] Worker render error, falling back to main thread:', data.message);
      this._clearTimeout();
      this._pending  = false;
      this._activeId = null;
      this.state.rendering = false;
      this._renderSync();
      return;
    }

    if (data.type !== 'result') return;

    // Discard stale responses
    if (data.renderId !== this._activeId) return;

    this._clearTimeout();
    this._pending  = false;
    this._activeId = null;

    const pixels = new Uint8ClampedArray(data.pixels);
    this.state.lastRenderTime = data.renderTime;
    this.state.needsRender    = false;
    this.state.rendering      = false;
    this.onResult({ pixels, width: data.width, height: data.height });

    if (this._queued) {
      this._queued = false;
      if (this.state.needsRender && this._worker) this._dispatch();
    }
  }

  _clearTimeout() {
    if (this._timeoutId !== null) { clearTimeout(this._timeoutId); this._timeoutId = null; }
  }

  // ── Main-thread fallback ─────────────────────────────────────────────────────

  _renderSync() {
    if (!this._fallback) return;
    const r = this._fallback.render();
    if (r) this.onResult(r);
  }
}
