import sharp from 'sharp';
import { getObjectBuffer, putObjectBuffer, publicUrl } from './r2.js';
import { sha256Hex } from './crypto.js';

const THUMB_SIZE = 256;

const IMAGE_FORMATS = new Set(['jpeg', 'jpg', 'png', 'webp', 'gif']);
const FALLBACK_LABELS = Object.freeze({
  mp4: 'VIDEO',
  webm: 'VIDEO',
  glb: '3D',
  gltf: '3D',
  splat: 'SPLAT',
  ply: 'POINT CLOUD',
});

export function thumbKeyForMediaKey(mediaKey) {
  const base = mediaKey.replace(/\.[^.]+$/, '');
  return `${base}.thumb.webp`;
}

export async function verifyStoredImage(key) {
  const buffer = await getObjectBuffer(key);
  const metadata = await sharp(buffer).metadata();
  if (!metadata.format || !IMAGE_FORMATS.has(metadata.format)) {
    throw new Error('stored object is not a supported image');
  }
  return { format: metadata.format, width: metadata.width, height: metadata.height };
}

export async function generateThumbForItem(item) {
  const format = (item.format || '').toLowerCase();
  const mediaUrl = item.media_url;
  if (!mediaUrl) {
    throw new Error('no media_url');
  }

  // Resolve R2 key from stored metadata or URL path
  const r2Key = item.metadata_jsonb?.r2Key
    || (mediaUrl.startsWith('http') ? mediaUrl.replace(/^https?:\/\/[^/]+\//, '') : mediaUrl);

  if (!IMAGE_FORMATS.has(format)) {
    const thumbKey = thumbKeyForMediaKey(r2Key);
    const label = FALLBACK_LABELS[format] || 'MEDIA';
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_SIZE}" height="${THUMB_SIZE}">
        <rect width="100%" height="100%" fill="#000000"/>
        <rect x="8" y="8" width="240" height="240" fill="none" stroke="#ffffff" stroke-width="2"/>
        <text x="128" y="132" text-anchor="middle" dominant-baseline="middle"
          fill="#ffffff" font-family="monospace" font-size="20">${label}</text>
      </svg>`,
    );
    const thumbBuf = await sharp(svg).webp().toBuffer();
    await putObjectBuffer(thumbKey, thumbBuf, 'image/webp');
    return {
      thumbKey,
      thumbUrl: publicUrl(thumbKey),
      sha256: sha256Hex(thumbBuf),
      fallbackType: label.toLowerCase().replace(' ', '-'),
    };
  }

  const buf = await getObjectBuffer(r2Key);
  const thumbBuf = await sharp(buf).resize(THUMB_SIZE, THUMB_SIZE, { fit: 'inside' }).webp().toBuffer();
  const thumbKey = thumbKeyForMediaKey(r2Key);
  await putObjectBuffer(thumbKey, thumbBuf, 'image/webp');
  const thumbUrl = publicUrl(thumbKey);
  return { thumbKey, thumbUrl, sha256: sha256Hex(thumbBuf) };
}
