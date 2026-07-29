import { Auth } from '../admin/auth.js';

const SIGN_URL = '/api/admin/media/sign';
const CONFIRM_URL = '/api/admin/media/confirm';
export const MULTIPART_THRESHOLD_BYTES = 20 * 1024 * 1024;
export const MULTIPART_PART_BYTES = 10 * 1024 * 1024;
const RESUME_PREFIX = 'siteboy.media-upload.';

export function formatFromMime(mime) {
  const map = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'model/gltf-binary': 'glb',
  };
  return map[mime] || (mime?.split('/').pop() || 'unknown');
}

export async function sha256Blob(blob) {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** PUT a blob to a signed URL with upload progress between 0 and 1. */
export function putWithProgress(url, blob, mime, fields, onProgress, headers = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ etag: xhr.getResponseHeader('ETag')?.replaceAll('"', '') || null });
      }
      else reject(new Error(`upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('upload network error'));

    if (fields) {
      const form = new FormData();
      Object.entries(fields).forEach(([key, value]) => form.append(key, value));
      form.append('Content-Type', mime);
      form.append('file', blob);
      xhr.open('POST', url);
      xhr.send(form);
    } else {
      xhr.open('PUT', url);
      for (const [key, value] of Object.entries({ 'Content-Type': mime, ...headers })) {
        xhr.setRequestHeader(key, value);
      }
      xhr.send(blob);
    }
  });
}

export function uploadResumeKey(file) {
  return `${RESUME_PREFIX}${file.name}:${file.size}:${file.lastModified || 0}`;
}

export function readUploadResume(file, storage = sessionStorage) {
  try {
    const value = JSON.parse(storage.getItem(uploadResumeKey(file)) || 'null');
    if (!value?.uploadId || !value?.key || !Array.isArray(value.parts)) return null;
    const itemId = value.key.split('/')[1];
    return itemId ? { ...value, itemId } : null;
  } catch {
    return null;
  }
}

export function writeUploadResume(file, value, storage = sessionStorage) {
  const safe = {
    uploadId: value.uploadId,
    key: value.key,
    parts: value.parts.map(({ partNumber, etag }) => ({ partNumber, etag })),
  };
  storage.setItem(uploadResumeKey(file), JSON.stringify(safe));
  return safe;
}

export function clearUploadResume(file, storage = sessionStorage) {
  storage.removeItem(uploadResumeKey(file));
}

export async function adminJsonRequest(url, body) {
  return Auth.apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Upload a blob to gallery storage and persist its metadata row.
 * @param {Blob} blob
 * @param {object} meta
 * @param {{ onProgress?: (p: number) => void, retries?: number }} opts
 */
export async function uploadGalleryBlob(blob, meta = {}, opts = {}) {
  const {
    filename,
    mime = blob.type || 'application/octet-stream',
    collection = 'digital/generative',
    title,
    description,
    sourceTool,
    tags = [],
    width,
    height,
    duration,
    slug,
  } = meta;

  const name = filename || `upload-${Date.now()}`;
  const bytes = blob.size;
  const retries = opts.retries ?? 2;
  if (bytes >= (opts.multipartThreshold ?? MULTIPART_THRESHOLD_BYTES)) {
    return uploadMultipartGalleryBlob(blob, {
      ...meta,
      filename: name,
      mime,
      collection,
      sha256: meta.sha256 || null,
    }, opts);
  }
  const sha256 = await sha256Blob(blob);
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const signRes = await adminJsonRequest(SIGN_URL, {
        filename: name,
        mime,
        bytes,
        collection,
        sha256,
        kind: meta.kind,
      });
      if (!signRes.ok) {
        const error = await signRes.json().catch(() => ({}));
        throw new Error(error.error || `sign failed: ${signRes.status}`);
      }
      const sign = await signRes.json();

      await putWithProgress(sign.url, blob, mime, sign.fields, opts.onProgress, sign.headers);
      const confirmRes = await adminJsonRequest(CONFIRM_URL, {
        action: meta.posterForItemId ? 'poster-confirm' : 'confirm',
        key: sign.key,
        itemId: sign.itemId,
        posterForItemId: meta.posterForItemId,
        mime,
        bytes,
        sha256,
        collection: sign.collection || sign.scope || collection,
        title: title || name,
        description,
        sourceTool,
        tags,
        width,
        height,
        duration,
        slug,
        format: formatFromMime(mime),
      });
      if (!confirmRes.ok) {
        const error = await confirmRes.json().catch(() => ({}));
        throw new Error(error.error || `confirm failed: ${confirmRes.status}`);
      }
      const result = await confirmRes.json();
      if (meta.posterBlob && mime.startsWith('video/')) {
        await uploadGalleryBlob(meta.posterBlob, {
          filename: `${name.replace(/\.[^.]+$/, '')}.poster.webp`,
          mime: meta.posterBlob.type || 'image/webp',
          kind: 'poster',
          posterForItemId: result.itemId,
        }, opts);
      }
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export async function uploadMultipartGalleryBlob(blob, meta = {}, opts = {}) {
  const {
    filename,
    mime = blob.type || 'application/octet-stream',
    collection = 'digital/generative',
    sha256,
  } = meta;
  let state = readUploadResume(blob, opts.storage);
  if (!state) {
    const response = await adminJsonRequest(SIGN_URL, {
      action: 'multipart-init',
      filename,
      mime,
      bytes: blob.size,
      sha256,
      collection,
      kind: meta.kind,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `multipart init failed: ${response.status}`);
    }
    state = await response.json();
    state.parts = [];
    writeUploadResume(blob, state, opts.storage);
  }

  const completed = new Map(state.parts.map((part) => [part.partNumber, part]));
  const partCount = Math.ceil(blob.size / MULTIPART_PART_BYTES);
  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    if (completed.has(partNumber)) {
      opts.onProgress?.(Math.min(1, partNumber * MULTIPART_PART_BYTES / blob.size));
      continue;
    }
    const signed = await adminJsonRequest(SIGN_URL, {
      action: 'multipart-sign-part',
      itemId: state.itemId,
      uploadId: state.uploadId,
      partNumber,
    });
    if (!signed.ok) {
      const data = await signed.json().catch(() => ({}));
      throw new Error(data.error || `multipart part signing failed: ${signed.status}`);
    }
    const { url } = await signed.json();
    const start = (partNumber - 1) * MULTIPART_PART_BYTES;
    const part = blob.slice(start, Math.min(blob.size, start + MULTIPART_PART_BYTES), mime);
    const uploaded = await putWithProgress(url, part, mime, null, (progress) => {
      opts.onProgress?.(Math.min(1, (start + progress * part.size) / blob.size));
    }, {});
    if (!uploaded.etag) throw new Error('multipart upload response did not expose ETag');
    const entry = { partNumber, etag: uploaded.etag };
    completed.set(partNumber, entry);
    state.parts = [...completed.values()].sort((a, b) => a.partNumber - b.partNumber);
    writeUploadResume(blob, state, opts.storage);
  }

  const complete = await adminJsonRequest(CONFIRM_URL, {
    action: 'multipart-complete',
    itemId: state.itemId,
    key: state.key,
    uploadId: state.uploadId,
    parts: state.parts,
  });
  if (!complete.ok) {
    const data = await complete.json().catch(() => ({}));
    throw new Error(data.error || `multipart completion failed: ${complete.status}`);
  }
  const confirmed = await adminJsonRequest(CONFIRM_URL, {
    action: meta.posterForItemId ? 'poster-confirm' : 'confirm',
    itemId: state.itemId,
    key: state.key,
    posterForItemId: meta.posterForItemId,
    collection,
    title: meta.title || filename,
    description: meta.description,
    sourceTool: meta.sourceTool,
    tags: meta.tags || [],
    width: meta.width,
    height: meta.height,
    duration: meta.duration,
    slug: meta.slug,
    format: formatFromMime(mime),
  });
  if (!confirmed.ok) {
    const data = await confirmed.json().catch(() => ({}));
    throw new Error(data.error || `confirm failed: ${confirmed.status}`);
  }
  clearUploadResume(blob, opts.storage);
  const result = await confirmed.json();
  if (meta.posterBlob && mime.startsWith('video/')) {
    await uploadGalleryBlob(meta.posterBlob, {
      filename: `${filename.replace(/\.[^.]+$/, '')}.poster.webp`,
      mime: meta.posterBlob.type || 'image/webp',
      kind: 'poster',
      posterForItemId: result.itemId,
    }, opts);
  }
  return result;
}

export async function abortGalleryUpload(file, storage = sessionStorage) {
  const state = readUploadResume(file, storage);
  if (!state) return { ok: true, idempotent: true };
  const response = await adminJsonRequest(CONFIRM_URL, {
    action: 'multipart-abort',
    itemId: state.itemId,
    key: state.key,
    uploadId: state.uploadId,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `abort failed: ${response.status}`);
  }
  clearUploadResume(file, storage);
  return response.json();
}

/** Surface the server's current version so a stale tab is told what to reload. */
async function readLifecycleError(response, fallback) {
  const data = await response.json().catch(() => ({}));
  const moved = Number.isSafeInteger(data.currentVersion)
    ? ` The record moved to version ${data.currentVersion}; reload before retrying.`
    : '';
  return new Error(`${data.error || fallback}${moved}`);
}

export async function retainGalleryItem(itemId, expectedVersion) {
  const response = await adminJsonRequest(CONFIRM_URL, {
    action: 'delete',
    itemId,
    expectedVersion,
  });
  if (!response.ok) throw await readLifecycleError(response, `delete failed: ${response.status}`);
  return response.json();
}

export async function restoreGalleryItem(itemId, expectedVersion) {
  const response = await adminJsonRequest(CONFIRM_URL, {
    action: 'restore',
    itemId,
    expectedVersion,
  });
  if (!response.ok) throw await readLifecycleError(response, `restore failed: ${response.status}`);
  return response.json();
}

export async function purgeGalleryItem(itemId) {
  const response = await adminJsonRequest(CONFIRM_URL, { action: 'purge', itemId });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `purge failed: ${response.status}`);
  }
  return response.json();
}
