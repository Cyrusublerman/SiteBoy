/**
 * Post-build step: copy runtime-fetched static trees into dist/ for Vercel parity with GH Pages.
 */
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const trees = ['blog', 'art', 'projects'];
const files = ['404.html'];

for (const tree of trees) {
  if (existsSync(tree)) {
    cpSync(tree, join(dist, tree), { recursive: true });
  }
}

for (const file of files) {
  if (existsSync(file)) {
    cpSync(file, join(dist, file));
  }
}
