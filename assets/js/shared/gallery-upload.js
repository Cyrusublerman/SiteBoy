import { Auth } from '../admin/auth.js';

const SIGN_URL = '/api/admin/media/sign';
const CONFIRM_URL = '/api/admin/media/confirm';

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
export function putWithProgress(url, blob, mime, fields, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
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
      xhr.setRequestHeader('Content-Type', mime);
      xhr.send(blob);
    }
  });
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
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const signRes = await adminJsonRequest(SIGN_URL, {
        filename: name,
        mime,
        bytes,
        collection,
      });
      if (!signRes.ok) {
        const error = await signRes.json().catch(() => ({}));
        throw new Error(error.error || `sign failed: ${signRes.status}`);
      }
      const sign = await signRes.json();

      await putWithProgress(sign.url, blob, mime, sign.fields, opts.onProgress);

      const sha256 = await sha256Blob(blob);
      const confirmRes = await adminJsonRequest(CONFIRM_URL, {
        key: sign.key,
        itemId: sign.itemId,
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
      return confirmRes.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
