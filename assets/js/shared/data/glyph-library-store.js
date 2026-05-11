/**
 * Glyph Library Store — IndexedDB persistence for the cursive glyph builder.
 *
 * Schema:
 *   DB name    : 'cursive-glyph-builder'
 *   Version    : 1
 *   Store      : 'libraries'  (keyPath: 'id')
 *   Record     : { id: 'active', payload: LibraryFile, fontBytes: ArrayBuffer }
 *
 * Only one active library is supported at a time (key 'active').
 * All methods open the DB on demand; the connection is kept alive for the
 * session.  If IndexedDB is unavailable an Error is thrown — callers must
 * display a halt overlay.
 *
 * @module shared/data/glyph-library-store
 */

const DB_NAME    = 'cursive-glyph-builder';
const DB_VERSION = 1;
const STORE_NAME = 'libraries';
const ACTIVE_KEY = 'active';

let _db = null;

// ─── Internal ────────────────────────────────────────────────────────────────

/**
 * Open (or reuse) the IndexedDB connection.
 * Throws if indexedDB is not available (e.g. private browsing with strict
 * settings).
 *
 * @returns {Promise<IDBDatabase>}
 */
export async function open() {
    if (_db) return _db;
    if (!window.indexedDB) throw new Error('IndexedDB is not available in this browser context.');

    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        req.onsuccess = (e) => {
            _db = e.target.result;
            resolve(_db);
        };

        req.onerror = () => {
            reject(new Error(`IndexedDB open failed: ${req.error?.message || 'unknown error'}`));
        };

        req.onblocked = () => {
            reject(new Error('IndexedDB open blocked — another tab may be open with an older schema.'));
        };
    });
}

/**
 * Read the active library record.
 *
 * @returns {Promise<{ payload: object, fontBytes: ArrayBuffer } | null>}
 */
export async function getActive() {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(ACTIVE_KEY);
        req.onsuccess = () => resolve(req.result ? { payload: req.result.payload, fontBytes: req.result.fontBytes } : null);
        req.onerror   = () => reject(new Error(`getActive failed: ${req.error?.message}`));
    });
}

/**
 * Write (overwrite) the active library record.
 *
 * @param {object}      payload    LibraryFile object (JSON-serialisable)
 * @param {ArrayBuffer} fontBytes  Raw font bytes
 * @returns {Promise<void>}
 */
export async function putActive(payload, fontBytes) {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req   = store.put({ id: ACTIVE_KEY, payload, fontBytes });
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(new Error(`putActive failed: ${req.error?.message}`));
    });
}

/**
 * Delete the active library record.
 *
 * @returns {Promise<void>}
 */
export async function clearActive() {
    const db = await open();
    return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req   = store.delete(ACTIVE_KEY);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(new Error(`clearActive failed: ${req.error?.message}`));
    });
}

/**
 * Return true if an active library record exists and is non-empty
 * (i.e. has at least one drawing).
 *
 * @returns {Promise<boolean>}
 */
export async function hasAny() {
    const record = await getActive();
    if (!record) return false;
    const drawings = record.payload?.drawings;
    return drawings && Object.keys(drawings).length > 0;
}
