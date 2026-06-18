/**
 * Gallery upload client — presigned PUT → confirm (C2).
 * @module gallery-upload
 */

const SIGN_URL = '/api/admin/media/sign';
const CONFIRM_URL = '/api/admin/media/confirm';

function adminHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const csrf = typeof window !== 'undefined' ? window.__adminCsrf : null;
  if (csrf) headers['X-CSRF'] = csrf;
  return headers;
}

export function formatFromMime(mime) {
  const map = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[mime] || (mime?.split('/').pop() || 'unknown');
}

export async function sha256Blob(blob) {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * PUT blob to signed URL with upload progress (0–1).
 */
export function putWithProgress(url, blob, mime, fields, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded / e.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('upload network error'));

    if (fields) {
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v));
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

/**
 * Upload a blob to gallery storage and persist metadata row.
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
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const signRes = await fetch(SIGN_URL, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          filename: name,
          mime,
          bytes,
          collection,
        }),
      });
      if (!signRes.ok) {
        throw new Error(`sign failed: ${signRes.status}`);
      }
      const sign = await signRes.json();

      await putWithProgress(sign.url, blob, mime, sign.fields, opts.onProgress);

      const sha256 = await sha256Blob(blob);
      const confirmRes = await fetch(CONFIRM_URL, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
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
        }),
      });
      if (!confirmRes.ok) {
        throw new Error(`confirm failed: ${confirmRes.status}`);
      }
      return confirmRes.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  throw lastErr;
}
