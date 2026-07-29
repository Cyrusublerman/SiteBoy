-- 0006_media_lifecycle.sql — pending uploads, retained deletion and processing attempts

ALTER TABLE media_uploads
  ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed',
  ADD COLUMN expires_at TIMESTAMPTZ,
  ADD COLUMN confirmed_at TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN multipart_upload_id TEXT,
  ADD COLUMN completed_parts_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_error_code TEXT,
  ADD CONSTRAINT media_uploads_status_check
    CHECK (status IN ('pending','uploading','uploaded','confirmed','aborted','expired')),
  ADD CONSTRAINT media_uploads_attempts_check CHECK (attempts >= 0);

CREATE INDEX media_uploads_expiry_idx
  ON media_uploads (expires_at)
  WHERE status IN ('pending','uploading','uploaded');

ALTER TABLE deletion_queue
  ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'retained',
  ADD COLUMN retention_until TIMESTAMPTZ,
  ADD COLUMN error_code TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD CONSTRAINT deletion_queue_lifecycle_status_check
    CHECK (lifecycle_status IN ('retained','pending','deleted','failed'));

ALTER TABLE gallery_items
  ADD COLUMN thumb_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN thumb_error_code TEXT,
  ADD CONSTRAINT gallery_items_thumb_attempts_check CHECK (thumb_attempts >= 0);
