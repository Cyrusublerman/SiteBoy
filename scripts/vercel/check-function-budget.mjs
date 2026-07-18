import { readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const HOBBY_FUNCTION_LIMIT = 12;
const FUNCTION_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts']);

function isIgnoredPath(relativePath) {
  return relativePath
    .split(sep)
    .some((segment) => segment.startsWith('_') || segment.startsWith('.'));
}

async function walk(directory, root, results) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    const pathFromRoot = relative(root, absolute);
    if (isIgnoredPath(pathFromRoot)) continue;
    if (entry.isDirectory()) {
      await walk(absolute, root, results);
      continue;
    }
    if (entry.isFile() && FUNCTION_EXTENSIONS.has(extname(entry.name))) {
      results.push(pathFromRoot.split(sep).join('/'));
    }
  }
}

export async function discoverVercelFunctionEntrypoints(apiDirectory = resolve('api')) {
  const results = [];
  await walk(apiDirectory, apiDirectory, results);
  return results.sort();
}

export function validateFunctionBudget(entrypoints, limit = HOBBY_FUNCTION_LIMIT) {
  return {
    count: entrypoints.length,
    limit,
    withinBudget: entrypoints.length <= limit,
    remaining: limit - entrypoints.length,
    entrypoints: [...entrypoints],
  };
}

export async function checkFunctionBudget({ apiDirectory = resolve('api'), limit = HOBBY_FUNCTION_LIMIT } = {}) {
  const entrypoints = await discoverVercelFunctionEntrypoints(apiDirectory);
  return validateFunctionBudget(entrypoints, limit);
}

async function main() {
  const result = await checkFunctionBudget();
  console.log(`Vercel function entrypoints: ${result.count}/${result.limit}`);
  for (const entrypoint of result.entrypoints) {
    console.log(`- api/${entrypoint}`);
  }
  if (!result.withinBudget) {
    console.error(`Function budget exceeded by ${Math.abs(result.remaining)} entrypoint(s).`);
    process.exitCode = 1;
  } else {
    console.log(`Function budget available: ${result.remaining}`);
  }
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (executedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
