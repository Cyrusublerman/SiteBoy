/**
 * G9 — When `frame` > 0, caps an iteration/step count to `frame`.
 * When `frame` === 0, leaves `base` unchanged (legacy behaviour).
 */
export function capByFrame(base, frame) {
  const f = Number(frame) || 0;
  if (f <= 0) return base;
  return Math.min(base, f);
}
