/**
 * VariationGrid — renders seed variation thumbnails directly into a canvas context.
 *
 * Per spec: variations render into ViewportCanvas on demand, not in a right panel.
 * This module provides pure canvas-drawing helpers; ViewportCanvas calls them.
 *
 * Canvas 2D cannot use CSS variables. Colours are resolved by the caller and passed in.
 * Caller should resolve --vga-black, --vga-silver, --vga-gray from getComputedStyle.
 * Grid cell size: F-multiples (passed by caller).
 */

/**
 * Draw a grid of variation thumbnails into the given 2D context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cw  Canvas width
 * @param {number} ch  Canvas height
 * @param {Array<{pixels: Uint8ClampedArray, width: number, height: number, seed?: number}>} variations
 * @param {number} F   Base font/spacing unit (px)
 * @param {object} [colours]  Resolved colour strings (use _cssVar in caller to read CSS vars)
 * @param {string} [colours.bg='#000000']     Background fill (--vga-black)
 * @param {string} [colours.border='#808080'] Cell border stroke (--vga-gray)
 * @param {string} [colours.labelBg='#000000'] Label background fill (--vga-black)
 * @param {string} [colours.labelText='#c0c0c0'] Label text fill (--vga-silver)
 */
export function drawVariationGrid(ctx, cw, ch, variations, F = 14, colours = {}) {
  if (!variations?.length) return;

  const bg        = colours.bg        ?? '#000000';
  const border    = colours.border    ?? '#808080';
  const labelBg   = colours.labelBg   ?? '#000000';
  const labelText = colours.labelText ?? '#c0c0c0';

  const cols  = variations.length <= 4 ? 2 : 3;
  const rows  = Math.ceil(variations.length / cols);
  const gap   = Math.max(1, Math.round(F / 14));
  const cellW = Math.floor((cw - gap * (cols + 1)) / cols);
  const cellH = Math.floor((ch - gap * (rows + 1)) / rows);

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

  variations.forEach((v, i) => {
    if (!v?.pixels || !v.width || !v.height) return;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x   = gap + col * (cellW + gap);
    const y   = gap + row * (cellH + gap);

    // Draw variation thumbnail
    const tmpOc  = new OffscreenCanvas(v.width, v.height);
    const tmpCtx = tmpOc.getContext('2d');
    const imgd   = tmpCtx.createImageData(v.width, v.height);
    imgd.data.set(v.pixels);
    tmpCtx.putImageData(imgd, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tmpOc, x, y, cellW, cellH);

    // Cell border
    ctx.strokeStyle = border;
    ctx.lineWidth   = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

    // Seed label
    if (v.seed !== undefined) {
      const label  = `SEED ${v.seed}`;
      const labelH = Math.round(F * 1.5);
      ctx.fillStyle = labelBg;
      ctx.fillRect(x + 1, y + cellH - labelH - 1, cellW - 2, labelH);
      ctx.fillStyle = labelText;
      ctx.font      = `${Math.round(F * 0.75)}px 'Space Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x + cellW / 2, y + cellH - Math.round(F * 0.4));
    }
  });
}
