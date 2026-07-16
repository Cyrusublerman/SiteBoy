import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runAll } from './design-rules.mjs';

export const DEFAULT_MIN_CONFIDENCE = 0.5;

export async function readRuleConfidence(rootDir, ruleId) {
  const category = String(ruleId).split('-', 1)[0];
  const path = resolve(rootDir, 'blog/docs/standards/rules', category, `${ruleId}.md`);
  try {
    const text = await readFile(path, 'utf8');
    const match = text.match(/^confidence:\s*([0-9.]+)\s*$/m);
    return match ? Number(match[1]) : 1;
  } catch {
    return 1;
  }
}

export async function classifyViolations(rootDir, violations, minConfidence = DEFAULT_MIN_CONFIDENCE) {
  const blocking = [];
  const warnings = [];
  for (const violation of violations) {
    const confidence = await readRuleConfidence(rootDir, violation.ruleId);
    const enriched = { ...violation, confidence };
    if (confidence >= minConfidence) blocking.push(enriched);
    else warnings.push(enriched);
  }
  return { blocking, warnings };
}

export async function runDesignLint(rootDir, minConfidence = DEFAULT_MIN_CONFIDENCE) {
  const violations = await runAll(resolve(rootDir, 'assets'));
  return classifyViolations(rootDir, violations, minConfidence);
}

if (process.argv[1]?.endsWith('run-design-rules.mjs')) {
  const rootDir = resolve(process.cwd());
  const minConfidence = Number(process.env.DESIGN_LINT_MIN_CONFIDENCE ?? DEFAULT_MIN_CONFIDENCE);
  const { blocking, warnings } = await runDesignLint(rootDir, minConfidence);

  for (const warning of warnings) {
    process.stdout.write(
      `[WARNING] ${warning.ruleId} confidence=${warning.confidence} ${warning.file}:${warning.line} — ${warning.statement}\n`,
    );
  }
  for (const violation of blocking) {
    process.stdout.write(
      `[VIOLATION] ${violation.ruleId} confidence=${violation.confidence} ${violation.file}:${violation.line} — ${violation.statement}\n`,
    );
  }

  process.stdout.write(
    `design-rules: ${blocking.length} blocking, ${warnings.length} warning(s), threshold ${minConfidence}.\n`,
  );
  process.exit(blocking.length ? 1 : 0);
}
