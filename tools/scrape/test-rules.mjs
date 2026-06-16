/**
 * Stage 13 — Per-rule detector regression tests.
 *
 * Reads:  cache/_corpus/emitted-rules.json
 * Checks: for every decidable rule (decidable ∈ {'full', 'partial'}, detector.kind ≠ 'none'):
 *   - every examples.bad string MUST trigger the detector (must find a match)
 *   - every examples.good string MUST NOT trigger the detector (must be clean)
 *
 * Exit 0 if all pass. Exit 1 if any fail (CI-blocking).
 *
 * Usage: node tools/scrape/test-rules.mjs [--verbose]
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EMITTED_PATH = resolve(__dirname, 'cache', '_corpus', 'emitted-rules.json');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

// ── Detector runners ──────────────────────────────────────────────────────────

function runRegex(pattern, input) {
  try {
    const re = new RegExp(pattern);
    return re.test(input);
  } catch (e) {
    throw new Error(`Invalid regex pattern "${pattern}": ${e.message}`);
  }
}

function runCssProp(pattern, input) {
  // css-prop detectors are regex patterns applied to CSS text
  return runRegex(pattern, input);
}

function runDetector(rule, input) {
  const kind = rule.detector?.kind;
  const pattern = rule.detector?.pattern;

  if (!kind || kind === 'none' || !pattern) return null;

  if (kind === 'regex') return runRegex(pattern, input);
  if (kind === 'css-prop') return runCssProp(pattern, input);
  if (kind === 'ast') {
    // AST detectors are not testable here — skip
    return null;
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(EMITTED_PATH)) {
    console.error('Missing emitted-rules.json — run scrape:emit first.');
    process.exit(1);
  }

  const raw = JSON.parse(await readFile(EMITTED_PATH, 'utf8'));
  const allRules = raw.rules ?? [];

  const testable = allRules.filter(
    r =>
      r.decidable !== 'judgment' &&
      r.detector?.kind &&
      r.detector.kind !== 'none' &&
      r.detector.kind !== 'ast',
  );

  if (testable.length === 0) {
    process.stdout.write(
      `test-rules: 0 testable rules (all judgment or no decidable detectors yet).\n`,
    );
    process.exit(0);
  }

  process.stdout.write(`Testing ${testable.length} decidable rule(s)...\n`);

  const failures = [];

  for (const rule of testable) {
    const bad = rule.examples?.bad ?? [];
    const good = rule.examples?.good ?? [];

    for (const example of bad) {
      let matched;
      try {
        matched = runDetector(rule, example);
      } catch (e) {
        failures.push({ ruleId: rule.id, kind: 'error', example, error: e.message });
        continue;
      }
      if (matched === null) continue;
      if (!matched) {
        failures.push({
          ruleId: rule.id,
          kind: 'bad-should-trip',
          example,
          message: `examples.bad did NOT trigger detector`,
        });
        if (VERBOSE) {
          process.stdout.write(
            `  FAIL [${rule.id}] bad example not caught: ${JSON.stringify(example)}\n`,
          );
        }
      } else if (VERBOSE) {
        process.stdout.write(`  PASS [${rule.id}] bad: ${JSON.stringify(example)}\n`);
      }
    }

    for (const example of good) {
      let matched;
      try {
        matched = runDetector(rule, example);
      } catch (e) {
        failures.push({ ruleId: rule.id, kind: 'error', example, error: e.message });
        continue;
      }
      if (matched === null) continue;
      if (matched) {
        failures.push({
          ruleId: rule.id,
          kind: 'good-should-pass',
          example,
          message: `examples.good was incorrectly flagged (false positive)`,
        });
        if (VERBOSE) {
          process.stdout.write(
            `  FAIL [${rule.id}] good example incorrectly flagged: ${JSON.stringify(example)}\n`,
          );
        }
      } else if (VERBOSE) {
        process.stdout.write(`  PASS [${rule.id}] good: ${JSON.stringify(example)}\n`);
      }
    }
  }

  const passed = testable.length - new Set(failures.map(f => f.ruleId)).size;

  if (failures.length === 0) {
    process.stdout.write(`test-rules: ${testable.length} rule(s) passed.\n`);
    process.exit(0);
  }

  process.stdout.write(`\ntest-rules FAILURES:\n`);
  for (const f of failures) {
    if (f.kind === 'error') {
      process.stdout.write(`  ERROR  [${f.ruleId}] ${f.error}\n`);
    } else {
      process.stdout.write(`  FAIL   [${f.ruleId}] ${f.message}\n`);
      process.stdout.write(`         example: ${JSON.stringify(f.example)}\n`);
    }
  }
  process.stdout.write(`\n${failures.length} failure(s), ${passed}/${testable.length} rules passed.\n`);
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
