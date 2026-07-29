import { Auth } from '../admin/auth.js';

const CONTENT_BASE = '/api/content';

/** Fields whose value always changes on write and therefore carry no diff signal. */
export const IGNORED_DIFF_FIELDS = Object.freeze(['version', 'updatedAt']);

export class ContentVersionError extends Error {
  constructor(message, { status = 0, code = null, currentVersion = null } = {}) {
    super(message);
    this.name = 'ContentVersionError';
    this.status = status;
    this.code = code;
    this.currentVersion = currentVersion;
  }
}

export function historyUrl(resource, id) {
  return `${CONTENT_BASE}/${resource}?action=history&id=${encodeURIComponent(id)}`;
}

export function actionUrl(resource, action) {
  return `${CONTENT_BASE}/${resource}?action=${action}`;
}

/** The gateway accepts a bare or quoted positive integer; quoted is the ETag form. */
export function ifMatchHeader(version) {
  if (!Number.isSafeInteger(version) || version < 1) {
    throw new ContentVersionError('A positive current version is required', { code: 'INVALID_IF_MATCH' });
  }
  return { 'If-Match': `"${version}"` };
}

async function readError(response) {
  const data = await response.json().catch(() => ({}));
  return new ContentVersionError(data.error || `Request failed: ${response.status}`, {
    status: response.status,
    code: data.code ?? null,
    currentVersion: Number.isSafeInteger(data.currentVersion) ? data.currentVersion : null,
  });
}

export async function fetchVersionHistory(resource, id, { client = Auth } = {}) {
  const response = await client.apiFetch(historyUrl(resource, id));
  if (!response.ok) throw await readError(response);
  const data = await response.json();
  return (data.items || []).slice().sort((a, b) => b.version - a.version);
}

export async function revertToVersion(resource, { id, version, currentVersion }, { client = Auth } = {}) {
  const response = await client.apiFetch(actionUrl(resource, 'revert'), {
    method: 'POST',
    headers: ifMatchHeader(currentVersion),
    body: JSON.stringify({ id, version }),
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()).item;
}

export async function restoreRecord(resource, { id, currentVersion }, { client = Auth } = {}) {
  const response = await client.apiFetch(actionUrl(resource, 'restore'), {
    method: 'POST',
    headers: ifMatchHeader(currentVersion),
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()).item;
}

export async function deleteVersionedRecord(resource, { id, currentVersion }, { client = Auth } = {}) {
  const response = await client.apiFetch(
    `${CONTENT_BASE}/${resource}?id=${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: ifMatchHeader(currentVersion),
    },
  );
  if (!response.ok) throw await readError(response);
  return (await response.json()).item;
}

export async function patchVersionedRecord(resource, body, currentVersion, { client = Auth } = {}) {
  return client.apiFetch(`${CONTENT_BASE}/${resource}`, {
    method: 'PATCH',
    headers: ifMatchHeader(currentVersion),
    body: JSON.stringify(body),
  });
}

export function formatSnapshotValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Field-level difference between two record snapshots, newest state last.
 * Unchanged fields are omitted: only fields that carry a change are returned.
 */
export function diffSnapshots(before, after, { ignore = IGNORED_DIFF_FIELDS } = {}) {
  const skip = new Set(ignore);
  const source = before && typeof before === 'object' ? before : {};
  const target = after && typeof after === 'object' ? after : {};
  const keys = [...new Set([...Object.keys(source), ...Object.keys(target)])]
    .filter((key) => !skip.has(key))
    .sort((a, b) => a.localeCompare(b));

  const entries = [];
  for (const key of keys) {
    const hasBefore = Object.hasOwn(source, key) && source[key] !== null && source[key] !== undefined;
    const hasAfter = Object.hasOwn(target, key) && target[key] !== null && target[key] !== undefined;
    const beforeText = formatSnapshotValue(source[key]);
    const afterText = formatSnapshotValue(target[key]);
    if (beforeText === afterText) continue;
    let status = 'changed';
    if (!hasBefore && hasAfter) status = 'added';
    else if (hasBefore && !hasAfter) status = 'removed';
    entries.push({ key, status, before: beforeText, after: afterText });
  }
  return entries;
}

export const ContentVersions = {
  fetchVersionHistory,
  revertToVersion,
  restoreRecord,
  deleteVersionedRecord,
  patchVersionedRecord,
  diffSnapshots,
  formatSnapshotValue,
};
