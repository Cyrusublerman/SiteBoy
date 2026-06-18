-- 0002_gallery_c1.sql — C1 typed gallery item fields
-- Apply after 0001_init.sql

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS thumb_url TEXT,
  ADD COLUMN IF NOT EXISTS format TEXT,
  ADD COLUMN IF NOT EXISTS source_tool TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS collection TEXT,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS duration DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS sha256 TEXT,
  ADD COLUMN IF NOT EXISTS thumb_status TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS gallery_items_collection_idx ON gallery_items(collection);
CREATE INDEX IF NOT EXISTS gallery_items_thumb_status_idx ON gallery_items(thumb_status);
CREATE INDEX IF NOT EXISTS gallery_items_slug_collection_idx ON gallery_items(collection, slug);

-- Backfill collection from gallery_slug where missing
UPDATE gallery_items
SET collection = gallery_slug
WHERE collection IS NULL AND gallery_slug IS NOT NULL;
