/**
 * Environment helpers for Vercel serverless functions.
 */

/** Git commit SHA or ref; falls back to `local` in dev. */
export function getBuildId() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA
    || process.env.VERCEL_GIT_COMMIT_REF
    || 'local'
  );
}

/** True when running on Vercel infrastructure. */
export function isVercel() {
  return Boolean(process.env.VERCEL);
}
