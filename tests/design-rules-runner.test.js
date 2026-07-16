import { describe, expect, it } from 'vitest';
import { classifyViolations } from '../tools/lint/run-design-rules.mjs';

const root = process.cwd();

describe('design-rule confidence policy', () => {
  it('keeps low-confidence partial detectors visible without blocking CI', async () => {
    const violation = {
      ruleId: 'interaction-A604F5FC',
      modality: 'MUST_NOT',
      statement: 'Do not use JavaScript to assist browser scrolling.',
      file: 'assets/example.js',
      line: 1,
    };
    const result = await classifyViolations(root, [violation], 0.5);
    expect(result.blocking).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].confidence).toBe(0.3);
  });

  it('fails closed when rule metadata cannot be resolved', async () => {
    const violation = {
      ruleId: 'unknown-TEST',
      modality: 'MUST_NOT',
      statement: 'Unknown rule.',
      file: 'assets/example.js',
      line: 1,
    };
    const result = await classifyViolations(root, [violation], 0.5);
    expect(result.blocking).toHaveLength(1);
    expect(result.blocking[0].confidence).toBe(1);
  });
});
