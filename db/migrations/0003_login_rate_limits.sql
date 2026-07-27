-- 0003_login_rate_limits.sql — distributed failed-login tracking
-- Apply after 0002_gallery_c1.sql

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx
  ON login_attempts (ip_hash, attempted_at DESC);

CREATE INDEX IF NOT EXISTS login_attempts_time_idx
  ON login_attempts (attempted_at DESC);
