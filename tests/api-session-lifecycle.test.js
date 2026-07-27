import { describe, expect, it, vi } from 'vitest';
import {
  SESSION_TTL_MS,
  createBlankSessionCookie,
  createSessionCookie,
  createSessionStore,
  parseSessionId,
} from '../api/_lib/session.js';

function sessionFixture(start = Date.parse('2026-07-23T00:00:00Z')) {
  let current = start;
  let row;
  const execute = vi.fn(async (text, params) => {
    if (text.startsWith('INSERT INTO sessions')) {
      row = {
        id: params[0],
        user_id: params[1],
        expires_at: params[2],
        revoked_at: null,
        username: 'admin',
        totp_enabled_at: null,
      };
      return { rows: [], rowCount: 1 };
    }
    if (text.includes('FROM sessions s')) return { rows: row ? [row] : [] };
    if (text.startsWith('UPDATE sessions SET expires_at')) {
      row.expires_at = params[1];
      return { rows: [], rowCount: 1 };
    }
    if (text.startsWith('UPDATE sessions SET revoked_at')) {
      row.revoked_at = params[1];
      return { rows: [], rowCount: 1 };
    }
    if (text.startsWith('UPDATE sessions\n         SET id')) {
      row.id = params[1];
      row.expires_at = params[2];
      return { rows: [{ user_id: row.user_id }], rowCount: 1 };
    }
    if (text.startsWith('DELETE FROM sessions')) return { rows: [], rowCount: 2 };
    throw new Error(`Unexpected query: ${text}`);
  });
  const random = vi.fn()
    .mockReturnValueOnce(Buffer.alloc(32, 1))
    .mockReturnValueOnce(Buffer.alloc(32, 2));
  const store = createSessionStore({
    execute,
    now: () => new Date(current),
    random,
  });
  return {
    store,
    execute,
    advance(milliseconds) {
      current += milliseconds;
    },
  };
}

describe('opaque sessions', () => {
  it('stores only a SHA-256 token hash and emits hardened cookies', async () => {
    const fixture = sessionFixture();
    const session = await fixture.store.createSession('admin');
    const inserted = fixture.execute.mock.calls[0][1];
    expect(session.token).toHaveLength(43);
    expect(inserted[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(inserted.join(' ')).not.toContain(session.token);

    const serialised = createSessionCookie(session.token).serialize();
    expect(serialised).toContain('HttpOnly');
    expect(serialised).toContain('Secure');
    expect(serialised).toContain('SameSite=Lax');
    expect(serialised).toContain('Path=/');
    expect(parseSessionId(serialised)).toBe(session.token);
    expect(createBlankSessionCookie().serialize()).toContain('Max-Age=0');
  });

  it('slides active expiry and rejects expired or revoked sessions', async () => {
    const fixture = sessionFixture();
    const session = await fixture.store.createSession('admin');
    fixture.advance(SESSION_TTL_MS * 0.75);
    const refreshed = await fixture.store.validateSessionToken(session.token);
    expect(refreshed.session.fresh).toBe(true);
    expect(refreshed.session.expiresAt.getTime()).toBe(
      Date.parse('2026-07-23T00:00:00Z') + SESSION_TTL_MS * 1.75,
    );

    await fixture.store.invalidateSession(refreshed.session.id);
    await expect(fixture.store.validateSessionToken(session.token)).resolves.toEqual({
      session: null,
      user: null,
    });
  });

  it('expires a session after twelve hours without activity', async () => {
    const fixture = sessionFixture();
    const session = await fixture.store.createSession('admin');
    fixture.advance(SESSION_TTL_MS + 1);
    await expect(fixture.store.validateSessionToken(session.token)).resolves.toEqual({
      session: null,
      user: null,
    });
    expect(fixture.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE sessions SET revoked_at'),
      expect.any(Array),
    );
  });

  it('rotates tokens and cleans expired or revoked rows', async () => {
    const fixture = sessionFixture();
    const session = await fixture.store.createSession('admin');
    const rotated = await fixture.store.rotateSession(session);
    expect(rotated.token).not.toBe(session.token);
    expect(rotated.id).not.toBe(session.id);
    await expect(fixture.store.cleanupSessions()).resolves.toBe(2);
  });
});
