import { beforeEach, describe, expect, it, vi } from 'vitest';

const putObjectBuffer = vi.fn();

vi.mock('../api/_lib/r2.js', () => ({
  getObjectBuffer: vi.fn(),
  putObjectBuffer,
  publicUrl: (key) => `https://media.test/${key}`,
}));

const { generateThumbForItem } = await import('../api/_lib/thumb.js');

beforeEach(() => {
  putObjectBuffer.mockClear();
});

describe('thumbnail fallback states', () => {
  it.each([
    ['glb', '3d'],
    ['splat', 'splat'],
    ['ply', 'point-cloud'],
    ['mp4', 'video'],
  ])('writes a deterministic typed fallback for %s', async (format, fallbackType) => {
    const result = await generateThumbForItem({
      format,
      media_url: `https://media.test/gallery/item/file.${format}`,
      metadata_jsonb: { r2Key: `gallery/item/file.${format}` },
    });
    expect(result).toMatchObject({
      thumbKey: 'gallery/item/file.thumb.webp',
      thumbUrl: 'https://media.test/gallery/item/file.thumb.webp',
      fallbackType,
    });
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(putObjectBuffer).toHaveBeenCalledWith(
      'gallery/item/file.thumb.webp',
      expect.any(Buffer),
      'image/webp',
    );
  });
});
