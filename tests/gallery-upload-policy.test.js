import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_MEDIA_UPLOAD_BYTES,
  maxMediaUploadBytes,
  validateGalleryUpload,
} from '../api/admin/media/sign.js';

const ORIGINAL_LIMIT = process.env.MAX_MEDIA_UPLOAD_BYTES;

afterEach(() => {
  if (ORIGINAL_LIMIT == null) delete process.env.MAX_MEDIA_UPLOAD_BYTES;
  else process.env.MAX_MEDIA_UPLOAD_BYTES = ORIGINAL_LIMIT;
});

describe('gallery upload policy', () => {
  it('accepts supported media within the default limit', () => {
    expect(validateGalleryUpload({
      filename: 'image.webp',
      mime: 'image/webp',
      bytes: 1024,
    })).toEqual({ ok: true });
  });

  it('rejects unsupported document types', () => {
    expect(validateGalleryUpload({
      filename: 'document.pdf',
      mime: 'application/pdf',
      bytes: 1024,
    })).toMatchObject({ ok: false, status: 415 });
  });

  it('rejects empty and oversized uploads before signing', () => {
    expect(validateGalleryUpload({
      filename: 'empty.png',
      mime: 'image/png',
      bytes: 0,
    })).toMatchObject({ ok: false, status: 400 });
    expect(validateGalleryUpload({
      filename: 'large.mp4',
      mime: 'video/mp4',
      bytes: DEFAULT_MAX_MEDIA_UPLOAD_BYTES + 1,
    })).toMatchObject({ ok: false, status: 413 });
  });

  it('supports an explicit deployment limit', () => {
    process.env.MAX_MEDIA_UPLOAD_BYTES = '2048';
    expect(maxMediaUploadBytes()).toBe(2048);
    expect(validateGalleryUpload({
      filename: 'large.png',
      mime: 'image/png',
      bytes: 2049,
    })).toMatchObject({ ok: false, status: 413 });
  });
});
