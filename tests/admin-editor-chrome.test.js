import { beforeEach, describe, expect, it, vi } from 'vitest';

// Module-scope debug logging runs on import; stub it before the graph loads.
vi.hoisted(() => {
  window.debugLog = () => {};
});

import {
  diffSnapshots,
  fetchVersionHistory,
  formatSnapshotValue,
  ifMatchHeader,
  patchVersionedRecord,
  revertToVersion,
} from '../assets/js/shared/content-versions.js';
import * as chrome from '../assets/js/shared/components/admin/index.js';
import * as galleryModel from '../assets/js/admin/gallery-editor.js';
import { Auth } from '../assets/js/admin/auth.js';

// Supplying both injected dependencies keeps BaseComponent from scheduling its
// retry timer, which would otherwise log after the test file has torn down.
const DEPS = Object.freeze({
  MF: { F: 14, calculateDimensions: () => ({}) },
  Resize: { subscribe: () => null, unsubscribe: () => {} },
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('AdminTabBar', () => {
  const tabs = [
    { id: 'a', label: 'ALPHA' },
    { id: 'b', label: 'BETA' },
  ];

  it('renders one equal-width cell per tab and marks the active one', () => {
    const bar = new chrome.AdminTabBar({ tabs, activeTab: 'b' }, DEPS);
    const element = bar.render();
    const cells = element.querySelectorAll('.admin-tab-bar-cell');
    expect(cells).toHaveLength(2);
    expect(cells[1].classList.contains('is-active')).toBe(true);
    expect(cells[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('reports selection once per change', () => {
    const onSelect = vi.fn();
    const bar = new chrome.AdminTabBar({ tabs, onSelect }, DEPS);
    bar.render();
    bar.selectTab('b');
    bar.selectTab('b');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(bar.getActiveTab()).toBe('b');
  });

  it('refuses more tabs than the sidebar ceiling', () => {
    const tooMany = Array.from({ length: chrome.MAX_ADMIN_TABS + 1 }, (_, i) => ({ id: `t${i}`, label: `T${i}` }));
    expect(() => new chrome.AdminTabBar({ tabs: tooMany }, DEPS)).toThrow(/at most 4 tabs/);
  });
});

describe('AdminStatusLine', () => {
  it('exposes tone as a data attribute and rejects unknown tones', () => {
    const status = new chrome.AdminStatusLine({}, DEPS);
    const element = status.render();
    status.setStatus('Saved.', 'success');
    expect(element.textContent).toBe('Saved.');
    expect(element.dataset.tone).toBe('success');
    status.setStatus('Odd.', 'sparkle');
    expect(element.dataset.tone).toBe('neutral');
    status.clear();
    expect(element.textContent).toBe('');
  });
});

describe('AdminEditorShell', () => {
  it('renders title, tab strip, status readout and one pane', () => {
    const shell = new chrome.AdminEditorShell({
      title: 'DEMO EDITOR',
      description: 'Demo.',
      tabs: [{ id: 'one', label: 'ONE' }, { id: 'two', label: 'TWO' }],
    }, DEPS);
    const element = shell.render();
    expect(element.querySelector('h1').textContent).toBe('DEMO EDITOR');
    expect(element.querySelectorAll('.admin-tab-bar')).toHaveLength(1);
    expect(element.querySelectorAll('.admin-status-line')).toHaveLength(1);
    expect(element.querySelectorAll('.admin-editor-pane')).toHaveLength(1);
    expect(shell.getPane()).toBe(element.querySelector('.admin-editor-pane'));
  });

  it('forwards tab changes and status updates', () => {
    const onTabChange = vi.fn();
    const shell = new chrome.AdminEditorShell({
      tabs: [{ id: 'one', label: 'ONE' }, { id: 'two', label: 'TWO' }],
      onTabChange,
    }, DEPS);
    const element = shell.render();
    element.querySelectorAll('.admin-tab-bar-cell')[1].click();
    expect(onTabChange).toHaveBeenCalledWith('two');
    expect(shell.getActiveTab()).toBe('two');
    shell.setStatus('Busy…', 'loading');
    expect(element.querySelector('.admin-status-line').dataset.tone).toBe('loading');
  });
});

describe('AdminDomainEditor', () => {
  class DemoEditor extends chrome.AdminDomainEditor {
    constructor(deps = DEPS) {
      super({
        title: 'DEMO',
        tabs: [{ id: 'one', label: 'ONE' }, { id: 'two', label: 'TWO' }],
      }, deps);
      this.destroyed = [];
    }

    tabRenderers() {
      return {
        one: () => this.append(this.pane, this._probe('one')),
        two: () => this.append(this.pane, this._probe('two')),
      };
    }

    _probe(name) {
      const owner = this;
      return {
        element: null,
        render() {
          this.element = document.createElement('p');
          this.element.className = `probe-${name}`;
          return this.element;
        },
        destroy() { owner.destroyed.push(name); },
      };
    }
  }

  it('renders the active tab into the shared pane and swaps on tab change', () => {
    const editor = new DemoEditor();
    const element = editor.render();
    expect(element.querySelector('.probe-one')).not.toBeNull();

    editor.selectTab('two');
    expect(element.querySelector('.probe-one')).toBeNull();
    expect(element.querySelector('.probe-two')).not.toBeNull();
    expect(editor.destroyed).toEqual(['one']);
    expect(editor.paneComponents).toHaveLength(1);
  });

  it('destroys every tracked pane component', () => {
    const editor = new DemoEditor();
    editor.render();
    editor.destroy();
    expect(editor.destroyed).toEqual(['one']);
    expect(editor.isDestroyed).toBe(true);
  });
});

describe('content version client', () => {
  it('quotes the current version as an If-Match entity tag', () => {
    expect(ifMatchHeader(7)).toEqual({ 'If-Match': '"7"' });
    expect(() => ifMatchHeader(0)).toThrow(/positive current version/);
  });

  it('reads history newest first', async () => {
    const client = {
      apiFetch: vi.fn().mockResolvedValue(jsonResponse({
        items: [{ version: 2 }, { version: 5 }, { version: 3 }],
      })),
    };
    const items = await fetchVersionHistory('gallery-items', 'rec-1', { client });
    expect(client.apiFetch).toHaveBeenCalledWith('/api/content/gallery-items?action=history&id=rec-1');
    expect(items.map((entry) => entry.version)).toEqual([5, 3, 2]);
  });

  it('reverts through the gateway with the concurrency header', async () => {
    const client = { apiFetch: vi.fn().mockResolvedValue(jsonResponse({ item: { id: 'rec-1', version: 6 } })) };
    const item = await revertToVersion('gallery-items', { id: 'rec-1', version: 3, currentVersion: 5 }, { client });
    expect(client.apiFetch).toHaveBeenCalledWith('/api/content/gallery-items?action=revert', {
      method: 'POST',
      headers: { 'If-Match': '"5"' },
      body: JSON.stringify({ id: 'rec-1', version: 3 }),
    });
    expect(item.version).toBe(6);
  });

  it('surfaces the server version conflict', async () => {
    const client = {
      apiFetch: vi.fn().mockResolvedValue(jsonResponse({
        error: 'Version conflict: expected 4, current 6',
        code: 'VERSION_CONFLICT',
        currentVersion: 6,
      }, 409)),
    };
    await expect(revertToVersion('gallery-items', { id: 'r', version: 2, currentVersion: 4 }, { client }))
      .rejects.toMatchObject({ status: 409, code: 'VERSION_CONFLICT', currentVersion: 6 });
  });

  it('sends If-Match on versioned patches', async () => {
    const client = { apiFetch: vi.fn().mockResolvedValue(jsonResponse({ item: {} })) };
    await patchVersionedRecord('gallery-items', { id: 'rec-1', title: 'New' }, 4, { client });
    expect(client.apiFetch).toHaveBeenCalledWith('/api/content/gallery-items', {
      method: 'PATCH',
      headers: { 'If-Match': '"4"' },
      body: JSON.stringify({ id: 'rec-1', title: 'New' }),
    });
  });
});

describe('snapshot diff', () => {
  it('reports added, removed and changed fields only', () => {
    expect(diffSnapshots(
      { title: 'Old', tags: ['a'], removedField: 'gone', version: 1, updatedAt: 'x' },
      { title: 'New', tags: ['a'], addedField: 'here', version: 2, updatedAt: 'y' },
    )).toEqual([
      { key: 'addedField', status: 'added', before: '—', after: 'here' },
      { key: 'removedField', status: 'removed', before: 'gone', after: '—' },
      { key: 'title', status: 'changed', before: 'Old', after: 'New' },
    ]);
  });

  it('renders objects and empty values readably', () => {
    expect(formatSnapshotValue({ group: 'set' })).toBe('{"group":"set"}');
    expect(formatSnapshotValue(null)).toBe('—');
    expect(formatSnapshotValue(0)).toBe('0');
  });
});

describe('VersionHistoryPanel', () => {
  const history = [
    { version: 3, action: 'update', createdAt: '2026-07-20T10:00:00.000Z', editorId: 'admin', snapshotJsonb: { title: 'Third', version: 3 } },
    { version: 2, action: 'update', createdAt: '2026-07-19T10:00:00.000Z', editorId: 'admin', snapshotJsonb: { title: 'Second', version: 2 } },
  ];
  let api;

  beforeEach(() => {
    api = {
      fetchVersionHistory: vi.fn().mockResolvedValue(history),
      revertToVersion: vi.fn().mockResolvedValue({ id: 'rec-1', version: 5, title: 'Second' }),
      diffSnapshots,
    };
  });

  function makePanel(overrides = {}) {
    return new chrome.VersionHistoryPanel({
      resource: 'gallery-items',
      recordId: 'rec-1',
      currentVersion: 4,
      currentSnapshot: { title: 'Fourth', version: 4 },
      api,
      ...overrides,
    }, DEPS);
  }

  it('is collapsed until expanded, then loads history once', async () => {
    const panel = makePanel();
    const element = panel.render();
    expect(element.querySelector('.admin-version-body').hidden).toBe(true);
    expect(api.fetchVersionHistory).not.toHaveBeenCalled();

    await panel.expand();
    expect(api.fetchVersionHistory).toHaveBeenCalledWith('gallery-items', 'rec-1');
    expect(element.querySelector('.admin-version-body').hidden).toBe(false);
    // One synthetic current row plus each recorded version.
    expect(element.querySelectorAll('.admin-version-row')).toHaveLength(3);
    expect(element.querySelector('.admin-version-row').classList.contains('is-current')).toBe(true);

    await panel.expand();
    expect(api.fetchVersionHistory).toHaveBeenCalledTimes(1);
  });

  it('diffs the selected version against the live record', async () => {
    const panel = makePanel();
    const element = panel.render();
    await panel.expand();

    panel.selectVersion(2);
    expect(panel.getDiffEntries()).toEqual([
      { key: 'title', status: 'changed', before: 'Second', after: 'Fourth' },
    ]);
    const rows = element.querySelectorAll('.admin-diff-body .admin-diff-row');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Second');

    panel.selectVersion(2);
    expect(panel.getSelectedVersion()).toBeNull();
    expect(element.querySelector('.admin-diff-empty').textContent).toBe('SELECT A VERSION TO COMPARE');
  });

  it('requires a second press before reverting', async () => {
    const onReverted = vi.fn();
    const panel = makePanel({ onReverted });
    panel.render();
    await panel.expand();
    panel.selectVersion(2);

    await panel.requestRevert();
    expect(api.revertToVersion).not.toHaveBeenCalled();
    expect(panel.revertButton.text).toBe('CONFIRM REVERT TO V2');

    await panel.requestRevert();
    expect(api.revertToVersion).toHaveBeenCalledWith('gallery-items', {
      id: 'rec-1',
      version: 2,
      currentVersion: 4,
    });
    expect(onReverted).toHaveBeenCalled();
    expect(panel.currentVersion).toBe(5);
  });

  it('reports a concurrency conflict without reverting', async () => {
    const onStatus = vi.fn();
    api.revertToVersion.mockRejectedValue(Object.assign(new Error('Version conflict'), { currentVersion: 9 }));
    const panel = makePanel({ onStatus });
    const element = panel.render();
    await panel.expand();
    panel.selectVersion(3);
    await panel.requestRevert();
    await panel.requestRevert();

    const message = element.querySelector('.admin-version-message');
    expect(message.dataset.tone).toBe('error');
    expect(message.textContent).toContain('Current version is 9.');
    expect(onStatus).toHaveBeenCalledWith(expect.stringContaining('Current version is 9.'), 'error');
  });

  it('states the broken context when no record is selected', async () => {
    const panel = makePanel({ recordId: null, currentVersion: null });
    const element = panel.render();
    await panel.expand();
    expect(element.querySelector('.admin-version-message').textContent).toBe('NO RECORD SELECTED');
    expect(api.fetchVersionHistory).not.toHaveBeenCalled();
  });
});

describe('gallery editor consumes the shared chrome', () => {
  it('extends the admin domain editor rather than building its own tabs', () => {
    expect(Object.getPrototypeOf(galleryModel.GalleryEditor)).toBe(chrome.AdminDomainEditor);
  });

  it('renders exactly one tab strip and one status readout', async () => {
    vi.spyOn(Auth, 'apiFetch').mockResolvedValue(jsonResponse({ items: [] }));
    const editor = new galleryModel.GalleryEditor({}, DEPS);
    const element = editor.render();
    expect(element.classList.contains('admin-gallery-editor')).toBe(true);
    expect(element.querySelectorAll('.admin-tab-bar')).toHaveLength(1);
    expect(element.querySelectorAll('.admin-tab-bar-cell')).toHaveLength(4);
    expect(element.querySelectorAll('.admin-status-line')).toHaveLength(1);
    await Promise.resolve();
    editor.destroy();
    vi.restoreAllMocks();
  });
});
