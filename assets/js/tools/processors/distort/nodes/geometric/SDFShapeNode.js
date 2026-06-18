import { createEffectModule } from '../../core/EffectModule.js';
import { sdfShapeRGBA } from '../../../../../shared/algorithms/geometry/sdf-operations.js';

export const SDFShapeNode = createEffectModule({
  type: 'sdfshape',
  name: 'SDF SHAPE',
  category: 'GEOMETRIC',
  params: {
    shape:        { label: 'SHAPE',          type: 'select', options: ['CIRCLE', 'BOX', 'RING'], value: 'CIRCLE', tier: 3 },
    outputMode:   { label: 'OUTPUT MODE',    type: 'select', options: ['FILL', 'OUTLINE', 'MASK', 'DISTANCE', 'BANDED', 'IMAGE MODIFY'], value: 'FILL', tier: 3 },
    centreX:      { label: 'CENTRE X',       min: 0,    max: 1,   step: 0.01,  value: 0.5,  tier: 3, driveable: true, unit: '0–1' },
    centreY:      { label: 'CENTRE Y',       min: 0,    max: 1,   step: 0.01,  value: 0.5,  tier: 3, driveable: true, unit: '0–1' },
    size:         { label: 'SIZE',           min: 0.01, max: 1,   step: 0.01,  value: 0.3,  tier: 3, driveable: true, unit: '0–1' },
    scaleX:       { label: 'SCALE X',        min: 0.1,  max: 4,   step: 0.01,  value: 1,    tier: 4, driveable: true },
    scaleY:       { label: 'SCALE Y',        min: 0.1,  max: 4,   step: 0.01,  value: 1,    tier: 4, driveable: true },
    rotation:     { label: 'ROTATION',       min: 0,    max: 360, step: 1,     value: 0,    tier: 4, driveable: true, unit: '°' },
    softness:     { label: 'SOFTNESS',       min: 0,    max: 0.2, step: 0.005, value: 0.02, tier: 4, driveable: true, unit: '0–1' },
    invert:       { label: 'INVERT',         type: 'toggle', value: false, tier: 4 },
    fillR:        { label: 'FILL R',         min: 0, max: 255, step: 1, value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    fillG:        { label: 'FILL G',         min: 0, max: 255, step: 1, value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    fillB:        { label: 'FILL B',         min: 0, max: 255, step: 1, value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    outlineWidth: { label: 'OUTLINE WIDTH',  min: 0.001, max: 0.1, step: 0.001, value: 0.01, tier: 4, driveable: true, unit: 'px', when: { outputMode: 'OUTLINE' } },
    ringThickness:{ label: 'RING THICKNESS', min: 0.005, max: 0.5, step: 0.005, value: 0.15, tier: 4, driveable: true, unit: '0–1', when: { shape: 'RING' } },
    bandFreq:     { label: 'BAND FREQUENCY', min: 1,   max: 40,  step: 0.5, value: 10, tier: 4, driveable: true, when: { outputMode: 'BANDED' } },
    bandOffset:   { label: 'BAND OFFSET',    min: 0,   max: 6.28, step: 0.01, value: 0, tier: 4, driveable: true, when: { outputMode: 'BANDED' } },
    blurByField:  { label: 'BLUR BY FIELD',  min: 0, max: 20, step: 0.5, value: 5, tier: 4, driveable: true, when: { outputMode: 'IMAGE MODIFY' } },
    lumByField:   { label: 'LUM BY FIELD',   min: -1, max: 1, step: 0.01, value: 0.3, tier: 4, driveable: true, when: { outputMode: 'IMAGE MODIFY' } },
    satByField:   { label: 'SAT BY FIELD',   min: -1, max: 1, step: 0.01, value: 0, tier: 4, driveable: true, when: { outputMode: 'IMAGE MODIFY' } },
    grainByField: { label: 'GRAIN BY FIELD', min: 0, max: 50, step: 1, value: 0, tier: 4, driveable: true, when: { outputMode: 'IMAGE MODIFY' } }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_blurByField = modulate('blurByField', 0);
    const n = w * h;
    const minDim = Math.min(w, h);
    const cosR = Math.cos((p.rotation ?? 0) * Math.PI / 180);
    const sinR = Math.sin((p.rotation ?? 0) * Math.PI / 180);

    for (let i = 0; i < n; i++) {
      const px = i % w;
      const py = (i / w) | 0;
      const base = i * 4;

      const cx  = modulate ? modulate('centreX',  i) : p.centreX;
      const cy  = modulate ? modulate('centreY',  i) : p.centreY;
      const sz  = modulate ? modulate('size',     i) : p.size;
      const sft = modulate ? modulate('softness', i) : p.softness;
      const sX  = modulate ? modulate('scaleX',   i) : (p.scaleX ?? 1);
      const sY  = modulate ? modulate('scaleY',   i) : (p.scaleY ?? 1);
      const rot = modulate ? modulate('rotation', i) : (p.rotation ?? 0);
      const cosRi = modulate ? Math.cos(rot * Math.PI / 180) : cosR;
      const sinRi = modulate ? Math.sin(rot * Math.PI / 180) : sinR;

      // normalised offset from centre with rotation + non-uniform scale
      let dx = (px / w) - cx;
      let dy = (py / h) - cy;
      // apply aspect correction
      dx *= w / h;
      // rotate
      const rdx = cosRi * dx - sinRi * dy;
      const rdy = sinRi * dx + cosRi * dy;
      // apply scale (scale relative to shape size)
      const sdx = rdx / sX;
      const sdy = rdy / sY;

      // compute SDF
      let dist;
      const shape = p.shape;
      if (shape === 'CIRCLE') {
        dist = Math.sqrt(sdx * sdx + sdy * sdy) - sz;
      } else if (shape === 'BOX') {
        const qx = Math.abs(sdx) - sz;
        const qy = Math.abs(sdy) - sz;
        dist = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) + Math.min(Math.max(qx, qy), 0);
      } else { // RING
        const thickness = modulate ? modulate('ringThickness', i) : (p.ringThickness ?? 0.15);
        const r = Math.sqrt(sdx * sdx + sdy * sdy) - sz;
        dist = Math.abs(r) - sz * thickness;
      }

      const invert = p.invert ? -1 : 1;
      const signedDist = dist * invert;
      const alpha = Math.max(0, Math.min(1, -signedDist / Math.max(sft, 1e-5)));

      const sr = src[base];
      const sg = src[base + 1];
      const sb = src[base + 2];
      const sa = src[base + 3];

      const outMode = p.outputMode ?? 'FILL';

      if (outMode === 'FILL') {
        const fr = modulate ? modulate('fillR', i) : p.fillR;
        const fg = modulate ? modulate('fillG', i) : p.fillG;
        const fb = modulate ? modulate('fillB', i) : p.fillB;
        dst[base]     = sr + (fr - sr) * alpha;
        dst[base + 1] = sg + (fg - sg) * alpha;
        dst[base + 2] = sb + (fb - sb) * alpha;
        dst[base + 3] = sa;

      } else if (outMode === 'OUTLINE') {
        const ow = modulate ? modulate('outlineWidth', i) : (p.outlineWidth ?? 0.01);
        const onBorder = Math.abs(dist) < ow ? 1 : 0;
        const soft = sft > 0 ? Math.max(0, 1 - Math.abs(Math.abs(dist) - ow) / Math.max(sft * 0.5, 1e-5)) : onBorder;
        const a = Math.max(0, Math.min(1, soft));
        const fr = modulate ? modulate('fillR', i) : p.fillR;
        const fg = modulate ? modulate('fillG', i) : p.fillG;
        const fb = modulate ? modulate('fillB', i) : p.fillB;
        dst[base]     = sr + (fr - sr) * a;
        dst[base + 1] = sg + (fg - sg) * a;
        dst[base + 2] = sb + (fb - sb) * a;
        dst[base + 3] = sa;

      } else if (outMode === 'MASK') {
        const m = Math.round(alpha * 255);
        dst[base]     = m;
        dst[base + 1] = m;
        dst[base + 2] = m;
        dst[base + 3] = 255;

      } else if (outMode === 'DISTANCE') {
        // signed distance normalised to canvas diagonal
        const norm = dist / (minDim * 0.5);
        const mapped = Math.max(0, Math.min(255, Math.round((norm + 1) * 0.5 * 255)));
        dst[base]     = mapped;
        dst[base + 1] = mapped;
        dst[base + 2] = mapped;
        dst[base + 3] = 255;

      } else if (outMode === 'BANDED') {
        const bf = modulate ? modulate('bandFreq',   i) : (p.bandFreq ?? 10);
        const bo = modulate ? modulate('bandOffset', i) : (p.bandOffset ?? 0);
        const banded = Math.round(((Math.sin(dist * bf + bo) + 1) * 0.5) * 255);
        dst[base]     = banded;
        dst[base + 1] = banded;
        dst[base + 2] = banded;
        dst[base + 3] = 255;

      } else if (outMode === 'IMAGE MODIFY') {
        const lum = modulate ? modulate('lumByField', i) : (p.lumByField ?? 0.3);
        const sat = modulate ? modulate('satByField', i) : (p.satByField ?? 0);
        const grf = modulate ? modulate('grainByField', i) : (p.grainByField ?? 0);
        const fieldT = Math.max(0, Math.min(1, alpha));
        // luminance modulation
        const lumShift = lum * fieldT * 128;
        let r = Math.max(0, Math.min(255, sr + lumShift));
        let g = Math.max(0, Math.min(255, sg + lumShift));
        let b = Math.max(0, Math.min(255, sb + lumShift));
        // saturation modulation (simple grey-mix desaturate/saturate)
        const grey = 0.299 * r + 0.587 * g + 0.114 * b;
        const satT = sat * fieldT;
        r = Math.max(0, Math.min(255, grey + (r - grey) * (1 + satT)));
        g = Math.max(0, Math.min(255, grey + (g - grey) * (1 + satT)));
        b = Math.max(0, Math.min(255, grey + (b - grey) * (1 + satT)));
        // grain modulation
        if (grf > 0) {
          const grainAmt = (Math.random() - 0.5) * grf * fieldT;
          r = Math.max(0, Math.min(255, r + grainAmt));
          g = Math.max(0, Math.min(255, g + grainAmt));
          b = Math.max(0, Math.min(255, b + grainAmt));
        }
        dst[base]     = r;
        dst[base + 1] = g;
        dst[base + 2] = b;
        dst[base + 3] = sa;

      } else {
        dst[base]     = sr;
        dst[base + 1] = sg;
        dst[base + 2] = sb;
        dst[base + 3] = sa;
      }
    }
  }
});
