import { getBuildId } from '../_lib/env.js';
import { jsonResponse } from '../_lib/auth.js';

export default function handler() {
  return jsonResponse({
    ok: true,
    build: getBuildId(),
    ts: new Date().toISOString(),
  });
}
