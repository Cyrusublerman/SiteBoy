/**
 * Section 4a — Manual Paste Loop (Tier-3 interactive flow)
 *
 * Reads blog/ideas/create rules for ai/manual-paste.queue.md.
 * For each entry with status=pending, prompts the user to paste the article body.
 *
 * Per entry:
 *   - Print the URL
 *   - Prompt: paste text, then type END on its own line, or type 'skip' to defer
 *   - On paste: write cache/<hash>/clean.md + meta.json (tier:3, sourced:manual-paste)
 *   - Flip queue entry status to 'pasted' or 'skipped'
 *
 * Usage:
 *   node tools/scrape/paste-loop.mjs
 */

import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const CACHE_DIR = resolve(__dirname, 'cache');
const QUEUE_PATH = resolve(ROOT, 'blog/ideas/create rules for ai/manual-paste.queue.md');

// ── Queue I/O ─────────────────────────────────────────────────────────────────

function readQueue() {
  if (!existsSync(QUEUE_PATH)) {
    return { header: '', entries: [] };
  }
  const raw = readFileSync(QUEUE_PATH, 'utf8');

  // Split header from entries block (header ends at first '- id:' line).
  const firstEntry = raw.indexOf('\n- id:');
  const header = firstEntry === -1 ? raw : raw.slice(0, firstEntry + 1);
  const entriesBlock = firstEntry === -1 ? '' : raw.slice(firstEntry + 1);

  // Parse entries.
  const entries = [];
  const entryRegex = /^- id: (.+)\n  url: (.+)\n  status: (.+)\n  reason: (.+)\n  detected_at: (.+)\n  source_index: (.+)(?:\n|$)/gm;
  let m;
  while ((m = entryRegex.exec(entriesBlock)) !== null) {
    entries.push({
      id: m[1].trim(),
      url: m[2].trim(),
      status: m[3].trim(),
      reason: m[4].trim(),
      detected_at: m[5].trim(),
      source_index: m[6].trim(),
    });
  }

  return { header, entries, raw };
}

function serializeQueue(header, entries) {
  const body = entries.map(e =>
    `- id: ${e.id}\n  url: ${e.url}\n  status: ${e.status}\n  reason: ${e.reason}\n  detected_at: ${e.detected_at}\n  source_index: ${e.source_index}`
  ).join('\n\n');
  return header + body + '\n';
}

function updateQueueEntry(entries, id, newStatus) {
  return entries.map(e => e.id === id ? { ...e, status: newStatus } : e);
}

// ── Readline prompt helpers ───────────────────────────────────────────────────

function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Collect multi-line paste from stdin.
 * User signals end by typing 'END' on its own line, or 'skip' to skip.
 * Returns { text: string } or { skipped: true }.
 */
function collectPaste(rl) {
  return new Promise((res) => {
    const lines = [];
    process.stdout.write('Paste article text. Type END on its own line when done, or skip to defer:\n> ');

    function onLine(line) {
      if (line.trim().toLowerCase() === 'skip') {
        rl.removeListener('line', onLine);
        res({ skipped: true });
        return;
      }
      if (line.trim() === 'END') {
        rl.removeListener('line', onLine);
        res({ text: lines.join('\n') });
        return;
      }
      lines.push(line);
      process.stdout.write('> ');
    }

    rl.on('line', onLine);
  });
}

// ── Process one entry ─────────────────────────────────────────────────────────

async function processEntry(rl, entry) {
  process.stdout.write('\n──────────────────────────────────────────\n');
  process.stdout.write(`URL:    ${entry.url}\n`);
  process.stdout.write(`Reason: ${entry.reason}\n\n`);
  process.stdout.write('Open the URL in your browser and copy the article body text.\n');

  const result = await collectPaste(rl);

  if (result.skipped) {
    process.stdout.write('Skipped.\n');
    return 'skipped';
  }

  const text = result.text.trim();
  if (text.length < 100) {
    process.stdout.write(`Warning: pasted text is very short (${text.length} chars). Saving anyway.\n`);
  }

  const dir = resolve(CACHE_DIR, entry.id);
  await mkdir(dir, { recursive: true });

  await writeFile(resolve(dir, 'clean.md'), text, 'utf8');
  await writeFile(resolve(dir, 'meta.json'), JSON.stringify({
    tier: 3,
    sourced: 'manual-paste',
    url: entry.url,
    pasted_at: new Date().toISOString(),
  }, null, 2), 'utf8');

  process.stdout.write(`Saved ${text.length} chars to cache/${entry.id}/clean.md\n`);
  return 'pasted';
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { header, entries, raw } = readQueue();

  if (!entries || entries.length === 0) {
    process.stdout.write('No manual-paste.queue.md found or queue is empty.\n');
    process.stdout.write('Run npm run scrape:fetch first to populate the queue.\n');
    return;
  }

  const pending = entries.filter(e => e.status === 'pending');

  if (pending.length === 0) {
    process.stdout.write('No pending entries in queue. All done.\n');
    return;
  }

  process.stdout.write(`Manual Paste Loop\n${pending.length} pending entries.\n`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let updatedEntries = [...entries];

  for (const entry of pending) {
    const outcome = await processEntry(rl, entry);
    updatedEntries = updateQueueEntry(updatedEntries, entry.id, outcome);

    // Write queue after every entry so progress isn't lost on interrupt.
    writeFileSync(QUEUE_PATH, serializeQueue(header, updatedEntries), 'utf8');
  }

  rl.close();

  const pastedCount = updatedEntries.filter(e => e.status === 'pasted').length;
  const skippedCount = updatedEntries.filter(e => e.status === 'skipped').length;
  const remainingPending = updatedEntries.filter(e => e.status === 'pending').length;

  process.stdout.write('\n── Summary ──\n');
  process.stdout.write(`  pasted:  ${pastedCount}\n`);
  process.stdout.write(`  skipped: ${skippedCount}\n`);
  process.stdout.write(`  pending: ${remainingPending}\n`);

  if (pastedCount > 0) {
    process.stdout.write('\nRun npm run scrape:clean to convert pasted articles to markdown.\n');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
