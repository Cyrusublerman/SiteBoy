import { sql } from '../_lib/db.js';

export default function handler(req, res) {
  res.status(200).json({ ok: true, ts: Date.now() });
}
