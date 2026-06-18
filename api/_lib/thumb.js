import sharp from 'sharp';
import { getObjectBuffer, putObjectBuffer, publicUrl } from './r2.js';
import { sha256Hex } from './crypto.js';

const THUMB_SIZE = 256;

const IMAGE_FORMATS = new Set(['jpeg', 'jpg', 'png', 'webp', 'gif']);

export function thumbKeyForMediaKey(mediaKey) {
  const base = mediaKey.replace(/\.[^.]+$/, '');
  return `${base}.thumb.webp`;
}

export async function generateThumbForItem(item) {
  const format = (item.format || '').toLowerCase();
  const mediaUrl = item.media_url;
  if (!mediaUrl) {
    throw new Error('no media_url');
  }

  const mediaKey = mediaUrl.includes('/')
    ? mediaUrl.split('/').slice(-3).join('/') // gallery/ulid/file
    : null;

  // Resolve R2 key from stored metadata or URL path
  const r2Key = item.metadata_jsonb?.r2Key
    || (mediaUrl.startsWith('http') ? mediaUrl.replace(/^https?:\/\/[^/]+\//, '') : mediaUrl);

  if (!IMAGE_FORMATS.has(format)) {
    // Video / 3D: placeholder thumb path; full ffmpeg render deferred
    const thumbKey = thumbKeyForMediaKey(r2Key);
    if (format === 'gif') {
      const buf = await getObjectBuffer(r2Key);
      const thumbBuf = await sharp(buf, { animated: false }).resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside' }).webp().toBuffer();
      await putObjectBuffer(thumbKey, thumbBuf, 'image/webp');
      return { thumbKey, thumbUrl: publicUrl(thumbKey) };
    }
    return { thumbKey: null, thumbUrl: mediaUrl, skipped: true };
  }

  const buf = await getObjectBuffer(r2Key);
  const thumbBuf = await sharp(buf).resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside' }).webp().toBuffer();
  const thumbKey = thumbKeyForMediaKey(r2Key);
  await putObjectBuffer(thumbKey, thumbBuf, 'image/webp');
  const thumbUrl = publicUrl(thumbKey);
  return { thumbKey, thumbUrl, sha256: sha256Hex(thumbBuf) };
}
