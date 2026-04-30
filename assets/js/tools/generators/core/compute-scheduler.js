/**
 * ComputeScheduler — three-tier performance system for expensive render loops
 *
 * Tier 1 — RAF Coalesce
 *   Coalesces rapid draw requests (e.g. slider drag at 120 req/s) into a single
 *   draw per animation frame.  Zero config; always active.
 *
 * Tier 2 — Adaptive Resolution
 *   While the user is interacting (dragging), renders at a reduced buffer
 *   resolution (default 50%).  After `idleDelay` ms of silence, renders at
 *   full resolution.  Reduces per-frame pixel count by up to 75% during
 *   interaction with no visible quality cost while the slider is moving.
 *   Opt-in per script via `compute.interactionScale`.
 *
 * Tier 3 — Worker Offload
 *   Offloads pure pixel computation to a Web Worker so the main thread is
 *   never blocked.  Uses the queue-one-extra debounce pattern: if a render is
 *   in-flight and new params arrive, exactly one more render is queued.
 *   Stale results (from superseded renders) are discarded via a generation
 *   counter.  Opt-in per script via `compute.worker: true` + `computePixels`.
 *
 * SSoT: This file is the sole owner of performance scheduling for generator
 * tools.  Do not implement coalescing, adaptive resolution, or worker dispatch
 * elsewhere in the generator pipeline.
 *
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WORKER SOURCE (inline Blob — no separate file needed)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the Blob URL for the pixel-compute worker on first use.
 * The worker receives:
 *   { type: 'RUN', fn: String, imageData: ImageData, params: Object, frame: Number, gen: Number }
 * and posts back:
 *   { type: 'DONE', imageData: ImageData, gen: Number }
 *   { type: 'ERROR', message: String, gen: Number }
 *
 * ImageData.data (Uint8ClampedArray) is transferred (zero-copy) in both
 * directions.  The sender must not access the buffer after posting.
 */
function _buildWorkerBlobURL() {
    const src = /* js */`
self.onmessage = function(e) {
    const { type, fn, imageData, params, frame, gen } = e.data;
    if (type !== 'RUN') return;
    try {
        const computePixels = new Function('return (' + fn + ')')();
        const result = computePixels(imageData, params, frame);
        self.postMessage(
            { type: 'DONE', imageData: result, gen },
            [result.data.buffer]
        );
    } catch (err) {
        self.postMessage({ type: 'ERROR', message: err.message, gen });
    }
};
`;
    return URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
}

let _workerBlobURL = null;

function getWorkerBlobURL() {
    if (!_workerBlobURL) _workerBlobURL = _buildWorkerBlobURL();
    return _workerBlobURL;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTE SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════════

export class ComputeScheduler {
    /**
     * @param {object} opts
     * @param {object}   opts.computeConfig   - script's `compute` block
     * @param {Function} opts.draw             - host's draw() method (bound)
     * @param {Function} opts.getCanvasComponent - () => Canvas component instance
     * @param {Function} opts.getCtx           - () => CanvasRenderingContext2D
     * @param {Function} opts.getCanvas        - () => HTMLCanvasElement
     * @param {Function} opts.getParams        - () => current params object
     * @param {Function} opts.getFrame         - () => current frame number
     * @param {Function} [opts.computePixels]  - script's computePixels function (Tier 3)
     */
    constructor(opts) {
        this._cfg        = opts.computeConfig   ?? {};
        this._draw       = opts.draw;
        this._getCC      = opts.getCanvasComponent;
        this._getCtx     = opts.getCtx;
        this._getCanvas  = opts.getCanvas;
        this._getParams  = opts.getParams;
        this._getFrame   = opts.getFrame;
        this._computeFn  = opts.computePixels   ?? null;

        // Derived config
        this._scale      = this._cfg.interactionScale ?? 1;
        this._idleDelay  = this._cfg.idleDelay  ?? 250;
        this._useWorker  = !!(this._cfg.worker && this._computeFn);

        // Tier 1
        this._rafPending = false;

        // Tier 2
        this._isInteracting = false;
        this._idleTimer     = null;
        this._atFullRes     = true;

        // Tier 3 — worker lifecycle
        this._worker         = null;
        this._workerPending  = false; // render in-flight
        this._workerQueued   = false; // one extra queued
        this._generation     = 0;     // stale-result guard

        if (this._useWorker) {
            this._initWorker();
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Called from the host whenever a parameter changes.
     * Routes through whichever tiers are active for this script.
     */
    scheduleRedraw() {
        this._markInteracting();

        if (this._useWorker && !this._isAnimating()) {
            this._scheduleWorker();
            return;
        }

        // Tier 1 + optional Tier 2
        if (this._rafPending) return;
        this._rafPending = true;
        requestAnimationFrame(() => {
            this._rafPending = false;
            this._drawWithScale();
        });
    }

    /**
     * Called from the host's animation loop (already FPS-limited).
     * Bypasses coalescing; uses reduced resolution if interacting.
     */
    animationFrame() {
        this._drawWithScale();
    }

    /**
     * Signal that the host is currently in animation playback.
     * Used by Tier 3 to decide whether to use the worker.
     */
    setAnimating(isAnimating) {
        this._animating = isAnimating;
    }

    destroy() {
        if (this._idleTimer) {
            clearTimeout(this._idleTimer);
            this._idleTimer = null;
        }
        if (this._worker) {
            this._worker.terminate();
            this._worker = null;
        }
        this._rafPending = false;
        this._workerPending = false;
        this._workerQueued = false;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TIER 2 — ADAPTIVE RESOLUTION
    // ──────────────────────────────────────────────────────────────────────────

    _markInteracting() {
        if (this._scale >= 1) return; // Tier 2 not configured

        this._isInteracting = true;

        // (Re-)set the idle timer
        if (this._idleTimer) clearTimeout(this._idleTimer);
        this._idleTimer = setTimeout(() => {
            this._idleTimer = null;
            this._isInteracting = false;
            this._restoreFullRes();
        }, this._idleDelay);

        // Drop to interaction resolution if currently at full res
        if (this._atFullRes) {
            this._setScale(this._scale);
            this._atFullRes = false;
        }
    }

    _restoreFullRes() {
        if (this._atFullRes) return;
        this._atFullRes = true;
        const cc = this._getCC();
        if (cc && typeof cc.setBufferScale === 'function') {
            cc.setBufferScale(1);
        }
        // Redraw at full resolution after restore
        this._draw();
    }

    _setScale(scale) {
        const cc = this._getCC();
        if (cc && typeof cc.setBufferScale === 'function') {
            cc.setBufferScale(scale);
        }
    }

    _drawWithScale() {
        // Ensure resolution matches current interaction state before drawing.
        if (this._scale < 1 && this._isInteracting && this._atFullRes) {
            this._setScale(this._scale);
            this._atFullRes = false;
        }
        this._draw();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TIER 3 — WORKER OFFLOAD
    // ──────────────────────────────────────────────────────────────────────────

    _initWorker() {
        try {
            this._worker = new Worker(getWorkerBlobURL());
            this._worker.onmessage = (e) => this._onWorkerMessage(e);
            this._worker.onerror   = (e) => {
                console.error('[ComputeScheduler] Worker error:', e.message);
                // Fall back to main thread on error
                this._useWorker = false;
                this._worker.terminate();
                this._worker = null;
                this._draw();
            };
        } catch (err) {
            console.warn('[ComputeScheduler] Worker unavailable, falling back to main thread:', err.message);
            this._useWorker = false;
        }
    }

    _scheduleWorker() {
        if (this._workerPending) {
            // One render already in-flight — queue one extra
            this._workerQueued = true;
            return;
        }
        this._dispatchWorker();
    }

    _dispatchWorker() {
        const canvas = this._getCanvas();
        const ctx    = this._getCtx();
        if (!canvas || !ctx) { this._draw(); return; }

        // Apply interaction scale first (Tier 2 during worker path)
        if (this._scale < 1 && this._isInteracting && this._atFullRes) {
            this._setScale(this._scale);
            this._atFullRes = false;
        }

        const W = canvas.width;
        const H = canvas.height;
        const imageData = ctx.createImageData(W, H);

        // Increment generation so any in-flight stale result is discarded
        const gen = ++this._generation;

        this._workerPending = true;
        this._workerQueued  = false;

        this._worker.postMessage(
            {
                type: 'RUN',
                fn: this._computeFn.toString(),
                imageData,
                params: { ...this._getParams() },
                frame: this._getFrame(),
                gen
            },
            [imageData.data.buffer]
        );
    }

    _onWorkerMessage(e) {
        const { type, imageData, gen, message } = e.data;

        if (type === 'ERROR') {
            console.error('[ComputeScheduler] computePixels error:', message);
            this._workerPending = false;
            this._workerQueued  = false;
            // Fall back for this render
            this._draw();
            return;
        }

        if (type !== 'DONE') return;

        this._workerPending = false;

        // Discard stale results (generation mismatch or size mismatch on resize)
        if (gen !== this._generation) return;

        // Paint result — guard dimension mismatch from rapid resize
        const ctx    = this._getCtx();
        const canvas = this._getCanvas();
        if (ctx && imageData && canvas &&
            imageData.width === canvas.width && imageData.height === canvas.height) {
            ctx.putImageData(imageData, 0, 0);
        }

        // If a render was queued while we were in-flight, dispatch it now
        if (this._workerQueued) {
            this._workerQueued = false;
            this._dispatchWorker();
        } else {
            // Interaction ended — restore full res if needed
            if (!this._isInteracting && !this._atFullRes) {
                this._restoreFullRes();
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    _isAnimating() {
        return !!this._animating;
    }
}
