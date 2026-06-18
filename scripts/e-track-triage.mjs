#!/usr/bin/env node
/**
 * E6 — populate triage column in distort-issue-register.md
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const registerPath = join(__dir, '../blog/docs/pages/tools/processors/distort/distort-issue-register.md');

const E1_DONE = true;

function classify(module, tag, summary, blockedBy, standalone) {
  const s = summary.toLowerCase();
  if (E1_DONE && (blockedBy === 'G1' || s.includes('driver slot') || s.includes('+d button'))) {
    return 'already-fixed-by-WU2';
  }
  if (blockedBy === 'G12') {
    if (s.includes('bilateral') || s.includes('hang') || s.includes('timeout')) return 'standalone-fix';
    if (s.includes('previewmax') || s.includes('worker') || s.includes('slow')) return 'standalone-fix';
    return 'blocked-by-algorithm';
  }
  if (blockedBy === 'phase10') return 'blocked-by-algorithm';
  if (standalone === 'maybe') return 'standalone-fix';
  if (blockedBy === '—' && tag === 'ERROR') return 'standalone-fix';
  if (blockedBy === '—' && tag === 'WARN') return 'standalone-fix';
  if (blockedBy === '—' && tag === 'NOTE') return 'blocked-by-algorithm';
  return 'blocked-by-algorithm';
}

const raw = readFileSync(registerPath, 'utf8');
const lines = raw.split('\n');
const out = [];
let rowCount = 0;

for (const line of lines) {
  if (line.startsWith('|module|')) {
    out.push('|module|tag|summary|blocked_by|standalone|triage|');
    continue;
  }
  if (!line.startsWith('|') || line.startsWith('|---')) {
    out.push(line);
    continue;
  }
  const parts = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
  if (parts.length < 5 || parts[0] === 'module') {
    out.push(line);
    continue;
  }
  if (parts.length >= 6 && parts[5]?.trim()) {
    out.push(line);
    rowCount++;
    continue;
  }
  const [module, tag, summary, blockedBy, standalone] = parts.map(p => p.trim());
  const triage = classify(module, tag, summary, blockedBy, standalone);
  out.push(`|${module}|${tag}|${summary}|${blockedBy}|${standalone}|${triage}|`);
  rowCount++;
}

writeFileSync(registerPath, out.join('\n'), 'utf8');
console.log(`E6 triage: ${rowCount} rows classified → ${registerPath}`);
