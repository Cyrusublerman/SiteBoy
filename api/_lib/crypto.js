import { createHash, randomBytes } from 'node:crypto';

export function ulid() {
  const t = Date.now().toString(36).padStart(10, '0');
  const r = randomBytes(8).toString('hex');
  return (t + r).slice(0, 26);
}

export function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
