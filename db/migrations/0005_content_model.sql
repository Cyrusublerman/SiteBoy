-- 0005_content_model.sql — typed, versioned content model

CREATE TABLE galleries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'photos',
  title TEXT NOT NULL,
  description_md TEXT NOT NULL DEFAULT '',
  sort_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT galleries_id_ulid CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  CONSTRAINT galleries_slug_check CHECK (slug <> ''),
  CONSTRAINT galleries_kind_check CHECK (kind IN ('photos','digital','render','book','physical','objects','project')),
  CONSTRAINT galleries_status_check CHECK (status IN ('draft','published','archived')),
  CONSTRAINT galleries_version_check CHECK (version >= 1)
);

ALTER TABLE gallery_items
  ADD COLUMN display_mode TEXT NOT NULL DEFAULT 'grid',
  ADD COLUMN group_key TEXT,
  ADD COLUMN alt_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at TIMESTAMPTZ;

UPDATE gallery_items
SET status = CASE WHEN status = 'published' THEN 'published' ELSE 'draft' END,
    slug = COALESCE(NULLIF(slug, ''), id),
    title = COALESCE(NULLIF(title, ''), filename),
    alt_text = COALESCE(NULLIF(alt_text, ''), NULLIF(title, ''), filename);

WITH duplicate_slugs AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY gallery_slug, slug
    ORDER BY created_at, id
  ) AS duplicate_index
  FROM gallery_items
)
UPDATE gallery_items AS item
SET slug = item.slug || '-' || item.id
FROM duplicate_slugs
WHERE item.id = duplicate_slugs.id
  AND duplicate_slugs.duplicate_index > 1;

ALTER TABLE gallery_items
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft',
  ADD CONSTRAINT gallery_items_slug_check CHECK (slug <> ''),
  ADD CONSTRAINT gallery_items_status_check CHECK (status IN ('draft','published','archived')),
  ADD CONSTRAINT gallery_items_display_mode_check CHECK (display_mode IN ('grid','carousel','slideshow','hidden')),
  ADD CONSTRAINT gallery_items_version_check CHECK (version >= 1);

CREATE UNIQUE INDEX gallery_items_gallery_slug_slug_unique
  ON gallery_items (gallery_slug, slug);

INSERT INTO galleries (id, slug, kind, title, status)
SELECT
  '0000000000' || UPPER(SUBSTRING(MD5(gallery_slug), 1, 16)),
  gallery_slug,
  CASE SPLIT_PART(gallery_slug, '/', 1)
    WHEN 'digital' THEN 'digital'
    WHEN 'render' THEN 'render'
    WHEN 'book' THEN 'book'
    WHEN 'physical' THEN 'physical'
    WHEN 'objects' THEN 'objects'
    WHEN 'project' THEN 'project'
    ELSE 'photos'
  END,
  REGEXP_REPLACE(gallery_slug, '^.*/', ''),
  CASE
    WHEN BOOL_OR(status = 'published' AND deleted_at IS NULL) THEN 'published'
    ELSE 'draft'
  END
FROM gallery_items
GROUP BY gallery_slug
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE projects
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'manifest',
  ADD COLUMN route TEXT NOT NULL DEFAULT '',
  ADD COLUMN manifest_path TEXT,
  ADD COLUMN sections_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at TIMESTAMPTZ;

UPDATE projects
SET slug = id
WHERE slug = '';
UPDATE projects SET route = '/#projects/' || slug WHERE route = '';
UPDATE projects SET status = CASE WHEN status = 'published' THEN 'published' ELSE 'draft' END;
ALTER TABLE projects
  ADD CONSTRAINT projects_kind_check CHECK (kind IN ('manifest','bespoke','idea')),
  ADD CONSTRAINT projects_slug_check CHECK (slug <> ''),
  ADD CONSTRAINT projects_status_check CHECK (status IN ('draft','published','archived')),
  ADD CONSTRAINT projects_version_check CHECK (version >= 1);

ALTER TABLE products
  ADD COLUMN sku TEXT NOT NULL DEFAULT '',
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'AUD',
  ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN image_url TEXT,
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at TIMESTAMPTZ;

UPDATE products
SET slug = id
WHERE slug = '';
UPDATE products SET sku = slug WHERE sku = '';
UPDATE products SET price_cents = 0 WHERE price_cents IS NULL;
UPDATE products SET status = CASE WHEN status = 'published' THEN 'published' ELSE 'draft' END;
ALTER TABLE products
  ALTER COLUMN price_cents SET NOT NULL,
  ADD CONSTRAINT products_sku_unique UNIQUE (sku),
  ADD CONSTRAINT products_slug_check CHECK (slug <> ''),
  ADD CONSTRAINT products_sku_check CHECK (sku <> ''),
  ADD CONSTRAINT products_status_check CHECK (status IN ('draft','published','archived')),
  ADD CONSTRAINT products_price_check CHECK (price_cents >= 0),
  ADD CONSTRAINT products_stock_check CHECK (stock_quantity >= 0),
  ADD CONSTRAINT products_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT products_version_check CHECK (version >= 1);

ALTER TABLE notes
  ADD COLUMN category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN excerpt_md TEXT NOT NULL DEFAULT '',
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at TIMESTAMPTZ;

UPDATE notes
SET slug = id
WHERE slug = '';
UPDATE notes SET body_md = '' WHERE body_md IS NULL;
UPDATE notes SET status = CASE WHEN status = 'published' THEN 'published' ELSE 'draft' END;
ALTER TABLE notes
  ALTER COLUMN body_md SET NOT NULL,
  ADD CONSTRAINT notes_slug_check CHECK (slug <> ''),
  ADD CONSTRAINT notes_status_check CHECK (status IN ('draft','published','archived')),
  ADD CONSTRAINT notes_version_check CHECK (version >= 1);

CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  frontmatter_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT articles_id_ulid CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  CONSTRAINT articles_slug_check CHECK (slug <> ''),
  CONSTRAINT articles_status_check CHECK (status IN ('draft','published','archived')),
  CONSTRAINT articles_version_check CHECK (version >= 1)
);

CREATE TABLE page_blocks (
  id TEXT PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  blocks_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT page_blocks_id_ulid CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  CONSTRAINT page_blocks_slug_check CHECK (page_slug <> ''),
  CONSTRAINT page_blocks_status_check CHECK (status IN ('draft','published','archived')),
  CONSTRAINT page_blocks_version_check CHECK (version >= 1)
);

CREATE TABLE content_versions (
  id TEXT PRIMARY KEY,
  resource_kind TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  snapshot_jsonb JSONB NOT NULL,
  action TEXT NOT NULL,
  editor_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_versions_id_ulid CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  CONSTRAINT content_versions_version_check CHECK (version >= 1),
  CONSTRAINT content_versions_action_check CHECK (action IN ('update','delete','restore','revert')),
  CONSTRAINT content_versions_resource_version_unique UNIQUE (resource_kind, resource_id, version)
);

CREATE INDEX content_versions_resource_idx
  ON content_versions (resource_kind, resource_id, version DESC);

CREATE TABLE deletion_queue (
  id TEXT PRIMARY KEY,
  resource_kind TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  storage_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT deletion_queue_id_ulid CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  CONSTRAINT deletion_queue_status_check CHECK (status IN ('pending','processing','completed','failed')),
  CONSTRAINT deletion_queue_attempts_check CHECK (attempts >= 0),
  CONSTRAINT deletion_queue_resource_unique UNIQUE (resource_kind, resource_id, storage_key)
);

CREATE INDEX galleries_public_idx ON galleries (slug)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX gallery_items_public_idx ON gallery_items (gallery_slug, sort_index)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX projects_public_idx ON projects (sort_index, slug)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX products_public_idx ON products (slug)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX notes_public_idx ON notes (slug)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX articles_public_idx ON articles (slug)
  WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX page_blocks_public_idx ON page_blocks (page_slug)
  WHERE status = 'published' AND deleted_at IS NULL;
