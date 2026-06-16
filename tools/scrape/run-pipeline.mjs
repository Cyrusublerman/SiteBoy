/**
 * Orchestrator — stages 1-3 (fetch → clean).
 *
 * Usage:
 *   node tools/scrape/run-pipeline.mjs [--stage 1|2|3|all] [--limit N] [--url <url>] [--force]
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const stageArg = args.find(a => a.startsWith('--stage='));
const STAGE = stageArg ? stageArg.split('=')[1] : 'all';
const FORCE = args.includes('--force');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? limitArg.split('=')[1] : null;
const urlArg = args.find(a => a.startsWith('--url='));
const URL = urlArg ? urlArg.split('=').slice(1).join('=') : null;

function runNode(script, extraArgs = []) {
  const path = resolve(__dirname, script);
  const forward = [...extraArgs];
  if (FORCE) forward.push('--force');
  if (LIMIT) forward.push('--limit=' + LIMIT);
  if (URL) forward.push('--url=' + URL);

  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [path, ...forward], {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..', '..'),
    });
    child.on('close', code => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${script} exited ${code}`));
    });
  });
}

async function main() {
  const run1 = STAGE === '1' || STAGE === 'all';
  const run2 = STAGE === '2' || STAGE === '3' || STAGE === 'all';

  if (run1) {
    process.stdout.write('── Stage 1: fetch ──\n');
    await runNode('fetch.mjs');
  }

  if (run2) {
    process.stdout.write('\n── Stage 2-3: clean ──\n');
    await runNode('clean.mjs');
  }

  process.stdout.write('\nPipeline stages 1-3 complete.\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
