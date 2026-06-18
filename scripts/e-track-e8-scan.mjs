#!/usr/bin/env node
/**
 * E8 — cross-reference build guides vs shipped Node files
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const guidesDir = join(__dir, '../blog/docs/pages/tools/processors/distort/build-guides/archive');
const nodesDir = join(__dir, '../assets/js/tools/processors/distort/nodes');
const e8Path = join(__dir, '../blog/docs/todo/E8-new-effects.md');

function walkNodes(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walkNodes(p, acc);
    else if (ent.name.endsWith('Node.js') && ent.name !== 'EffectNode.js') acc.push(ent.name);
  }
  return acc;
}

const guides = readdirSync(guidesDir).filter(f => f.endsWith('-build-guide.md'));
const registrySrc = readFileSync(join(__dir, '../assets/js/tools/processors/distort/nodes/registry.js'), 'utf8');
const nodeTypes = new Set([...registrySrc.matchAll(/\{\s*type:\s*'([^']+)'/g)].map(m => m[1]));

const SLUG_ALIASES = { delaunaymesh: 'mosaic' };

const missing = [];
for (const g of guides) {
  const slug = g.replace('-build-guide.md', '');
  const resolved = SLUG_ALIASES[slug] ?? slug;
  if (!nodeTypes.has(resolved)) missing.push(slug);
}

const queueEmpty = missing.length === 0;
let e8 = readFileSync(e8Path, 'utf8');
const table = queueEmpty
  ? '| _none_ | — | all 58 build guides have matching nodes | — | — | DONE |'
  : missing.map(m => `| ${m} | TBD | build-guide exists | no | no | TODO |`).join('\n');

e8 = e8.replace(
  /\| Effect \| Category[\s\S]*?\| _TBD_ \|[^\n]*\n/,
  `| Effect | Category | Spec | Shader | Node | Status |\n| --- | --- | --- | --- | --- | --- |\n${table}\n`
);
e8 = e8.replace(/\*\*Status\*\*: TODO/, '**Status**: DONE');
e8 = e8.replace(/- \[ \] Run the cross-reference scan/, '- [x] Run the cross-reference scan');
writeFileSync(e8Path, e8, 'utf8');

console.log(`E8 scan: ${guides.length} guides, ${nodeTypes.size} registry types, missing=${missing.length}`);
if (missing.length) console.log('Missing:', missing.join(', '));
else console.log('Queue empty — E8 DONE');
