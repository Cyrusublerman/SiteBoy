/**
 * Admin session bootstrap (A2 / migration plan B1 minimal).
 * Calls /api/auth/me on init; exposes CSRF-aware fetch wrapper.
 */
let authenticated = false;
let csrfToken = null;
/** @type {{ id: string, username: string } | null} */
let user = null;
let bootstrapPromise = null;

const API_BASE = '';

async function fetchMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) {
    authenticated = false;
    user = null;
    csrfToken = null;
    return false;
  }
  const data = await res.json();
  user = data.user;
  csrfToken = data.csrfToken ?? null;
  authenticated = true;
  return true;
}

export async function bootstrap() {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = fetchMe().catch(() => {
    authenticated = false;
    user = null;
    csrfToken = null;
    return false;
  });
  return bootstrapPromise;
}

export function isAuthenticated() {
  return authenticated;
}

export function getUser() {
  return user;
}

export function getCsrfToken() {
  return csrfToken;
}

/**
 * Fetch wrapper for mutating admin API calls.
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (csrfToken) {
    headers.set('X-CSRF', csrfToken);
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * @param {string} password
 */
export async function login(password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const data = await res.json();
  user = data.user;
  csrfToken = data.csrfToken ?? null;
  authenticated = true;
  return data;
}

export async function logout() {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: csrfToken ? { 'X-CSRF': csrfToken } : {},
  });
  authenticated = false;
  user = null;
  csrfToken = null;
}

export const Auth = {
  bootstrap,
  isAuthenticated,
  getUser,
  getCsrfToken,
  apiFetch,
  login,
  logout,
};

if (typeof window !== 'undefined') {
  window.Auth = Auth;
}
