/**
 * VariationGrid — renders seed variation thumbnails directly into a canvas context.
 *
 * Per spec: variations render into ViewportCanvas on demand, not in a right panel.
 * This module provides pure canvas-drawing helpers; ViewportCanvas calls them.
 *
 * All colours: VGA hex (canvas context ignores CSS variables).
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
 */
export function drawVariationGrid(ctx, cw, ch, variations, F = 14) {
  if (!variations?.length) return;

  const cols  = variations.length <= 4 ? 2 : 3;
  const rows  = Math.ceil(variations.length / cols);
  const gap   = 1;
  const cellW = Math.floor((cw - gap * (cols + 1)) / cols);
  const cellH = Math.floor((ch - gap * (rows + 1)) / rows);

  // Background
  ctx.fillStyle = '#000000';
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

    // Cell border — solid VGA gray, no rgba
    ctx.strokeStyle = '#808080';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

    // Seed label — solid background instead of rgba overlay
    if (v.seed !== undefined) {
      const labelText = `SEED ${v.seed}`;
      const labelH    = Math.round(F * 1.5);
      ctx.fillStyle   = '#000000';
      ctx.fillRect(x + 1, y + cellH - labelH - 1, cellW - 2, labelH);
      ctx.fillStyle   = '#c0c0c0';
      ctx.font        = `${Math.round(F * 0.75)}px 'Space Mono', monospace`;
      ctx.textAlign   = 'center';
      ctx.fillText(labelText, x + cellW / 2, y + cellH - Math.round(F * 0.4));
    }
  });
}
