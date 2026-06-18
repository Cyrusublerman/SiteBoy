-- 0001_init.sql — SiteBoy platform schema (A3)
-- Apply: npm run db:migrate

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  totp_secret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip TEXT,
  ua TEXT
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  gallery_slug TEXT NOT NULL,
  sort_index INTEGER NOT NULL DEFAULT 0,
  filename TEXT NOT NULL,
  urls_jsonb JSONB NOT NULL DEFAULT '{}',
  metadata_jsonb JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_items_gallery_slug_idx ON gallery_items(gallery_slug);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary_md TEXT,
  body_md TEXT,
  frontmatter_jsonb JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  sort_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description_md TEXT,
  price_cents INTEGER,
  metadata_jsonb JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_md TEXT,
  metadata_jsonb JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  source_kind TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  rel TEXT NOT NULL DEFAULT 'tagged',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS links_source_idx ON links(source_kind, source_id);
CREATE INDEX IF NOT EXISTS links_target_idx ON links(target_kind, target_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_kind TEXT,
  target_id TEXT,
  before_hash TEXT,
  after_hash TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS media_uploads (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  mime TEXT NOT NULL,
  bytes BIGINT NOT NULL DEFAULT 0,
  sha256 TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (id, username, password_hash)
VALUES ('admin', 'admin', '')
ON CONFLICT (id) DO NOTHING;
