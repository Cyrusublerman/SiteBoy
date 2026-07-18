import { describe, expect, it } from 'vitest';
import {
  CONTENT_RESOURCE_NAMES,
  getResourceDefinition,
  normaliseResourceName,
  resourceNameFromRequest,
} from '../api/content/[resource].js';
import {
  HOBBY_FUNCTION_LIMIT,
  checkFunctionBudget,
} from '../scripts/vercel/check-function-budget.mjs';

describe('content API resource gateway', () => {
  it('preserves every previous generic CRUD resource URL', () => {
    expect(CONTENT_RESOURCE_NAMES).toEqual([
      'gallery-items',
      'links',
      'notes',
      'products',
      'projects',
      'tags',
    ]);
  });

  it('normalises Vercel dynamic route parameters', () => {
    expect(normaliseResourceName(' TAGS ')).toBe('tags');
    expect(normaliseResourceName(['projects'])).toBe('projects');
    expect(resourceNameFromRequest({ query: { resource: 'notes' } })).toBe('notes');
  });

  it('rejects resources that are not explicitly registered', () => {
    expect(getResourceDefinition('unknown')).toBeNull();
    expect(getResourceDefinition('art')).toBeNull();
  });
});

describe('Vercel Hobby function budget', () => {
  it('keeps the dynamic SiteBoy backend within the deployment limit', async () => {
    const result = await checkFunctionBudget();
    expect(result.limit).toBe(HOBBY_FUNCTION_LIMIT);
    expect(result.withinBudget).toBe(true);
    expect(result.count).toBe(10);
    expect(result.entrypoints).toEqual([
      'admin/media/confirm.js',
      'admin/media/sign.js',
      'admin/media/thumb.js',
      'auth/login.js',
      'auth/logout.js',
      'auth/me.js',
      'content/[resource].js',
      'content/art/[...gallery].js',
      'cron/thumb-worker.js',
      'health.js',
    ]);
  });
});
