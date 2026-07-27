/**
 * VersionHistoryPanel - Version list, readable diff and revert for any
 * versioned content resource served by /api/content/[resource].
 *
 * Collapsed by default; history is fetched on first expansion.
 * Selecting a recorded version diffs it against the live record and arms a
 * two-step revert through the same gateway.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Button } from '../../interactive.js';
import { ContentVersions } from '../../content-versions.js';
import { VersionDiffView } from './VersionDiffView.js';

function formatTimestamp(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().replace('T', ' ').slice(0, 16);
}

export class VersionHistoryPanel extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'version-history-panel' }, deps);

        this.resource = options.resource ?? '';
        this.recordId = options.recordId ?? null;
        this.currentVersion = options.currentVersion ?? null;
        this.currentSnapshot = options.currentSnapshot ?? {};
        this.label = options.label ?? 'VERSION HISTORY';
        this.api = options.api ?? ContentVersions;
        this.onReverted = options.onReverted ?? null;
        this.onStatus = options.onStatus ?? null;

        this.expanded = Boolean(options.expanded);
        this.loadState = 'idle';
        this.versions = [];
        this.selectedVersion = null;
        this.revertArmed = false;
        this.message = '';
        this.messageTone = 'neutral';

        this.headerElement = null;
        this.glyphElement = null;
        this.bodyElement = null;
        this.listElement = null;
        this.messageElement = null;
        this.actionsElement = null;
        this.diffView = null;
        this.revertButton = null;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('section', 'admin-version-history');

        this.headerElement = this.createElement('button', 'admin-version-history-header');
        this.headerElement.type = 'button';
        this.glyphElement = this.createElement('span', 'admin-version-glyph');
        this.appendElement(this.headerElement, this.glyphElement);
        this.appendElement(this.headerElement, this.createElement('span', 'admin-version-title', this.label));
        this.headerElement.addEventListener('click', () => this.toggle());
        this.appendElement(this.element, this.headerElement);

        this.bodyElement = this.createElement('div', 'admin-version-body');

        this.messageElement = this.createElement('div', 'admin-version-message');
        this.appendElement(this.bodyElement, this.messageElement);

        this.listElement = this.createElement('div', 'admin-version-list');
        this.appendElement(this.bodyElement, this.listElement);

        this.diffView = new VersionDiffView({}, this.deps);
        this.children.add(this.diffView);
        this.appendElement(this.bodyElement, this.diffView.render());

        this.actionsElement = this.createElement('div', 'admin-version-actions');
        this.revertButton = new Button({
            text: 'REVERT TO SELECTED VERSION',
            disabled: true,
            onClick: () => this.requestRevert(),
        }, this.deps);
        this.children.add(this.revertButton);
        this.appendElement(this.actionsElement, this.revertButton.render());
        this.appendElement(this.bodyElement, this.actionsElement);

        this.appendElement(this.element, this.bodyElement);

        this._paint();
        return this.element;
    }

    // ── State transitions ────────────────────────────────────────────────

    setRecord({ recordId, currentVersion, currentSnapshot } = {}) {
        this.recordId = recordId ?? null;
        this.currentVersion = currentVersion ?? null;
        this.currentSnapshot = currentSnapshot ?? {};
        this.versions = [];
        this.selectedVersion = null;
        this.revertArmed = false;
        this.loadState = 'idle';
        this.message = '';
        this.messageTone = 'neutral';
        this._paint();
        if (this.expanded) return this.refresh();
        return Promise.resolve();
    }

    toggle() {
        return this.expanded ? this.collapse() : this.expand();
    }

    collapse() {
        this.expanded = false;
        this.revertArmed = false;
        this._paint();
        return Promise.resolve();
    }

    expand() {
        this.expanded = true;
        this._paint();
        if (this.loadState === 'idle') return this.refresh();
        return Promise.resolve();
    }

    async refresh() {
        if (this.isDestroyed) return;
        if (!this.recordId) {
            this.loadState = 'broken';
            this._setMessage('NO RECORD SELECTED', 'warning');
            this._paint();
            return;
        }
        this.loadState = 'loading';
        this._setMessage('LOADING HISTORY…', 'loading');
        try {
            this.versions = await this.api.fetchVersionHistory(this.resource, this.recordId);
            this.loadState = 'loaded';
            this._setMessage(this.versions.length ? '' : 'NO RECORDED VERSIONS', 'neutral');
            if (this.selectedVersion !== null
                && !this.versions.some((entry) => entry.version === this.selectedVersion)) {
                this.selectedVersion = null;
            }
        } catch (error) {
            this.loadState = 'error';
            this.versions = [];
            this._setMessage(error.message, 'error');
        }
        this._paint();
    }

    selectVersion(version) {
        this.selectedVersion = this.selectedVersion === version ? null : version;
        this.revertArmed = false;
        this._paint();
    }

    getSelectedVersion() {
        return this.selectedVersion;
    }

    getDiffEntries() {
        const entry = this.versions.find((candidate) => candidate.version === this.selectedVersion);
        if (!entry) return [];
        return this.api.diffSnapshots(entry.snapshotJsonb, this.currentSnapshot);
    }

    async requestRevert() {
        if (this.selectedVersion === null) return;
        if (!this.revertArmed) {
            this.revertArmed = true;
            this._setMessage(`PRESS AGAIN TO REVERT TO V${this.selectedVersion}`, 'warning');
            this._paint();
            return;
        }
        const target = this.selectedVersion;
        this.revertArmed = false;
        this.revertButton?.setDisabled(true);
        this._setMessage(`REVERTING TO V${target}…`, 'loading');
        try {
            const item = await this.api.revertToVersion(this.resource, {
                id: this.recordId,
                version: target,
                currentVersion: this.currentVersion,
            });
            this.currentVersion = item?.version ?? this.currentVersion;
            this.currentSnapshot = item ?? this.currentSnapshot;
            this.selectedVersion = null;
            this._setMessage('', 'neutral');
            this.onStatus?.(`Reverted to version ${target}.`, 'success');
            await this.onReverted?.(item);
            if (this.isDestroyed) return;
            await this.refresh();
        } catch (error) {
            const suffix = error.currentVersion ? ` Current version is ${error.currentVersion}.` : '';
            this._setMessage(`${error.message}${suffix}`, 'error');
            this.onStatus?.(`${error.message}${suffix}`, 'error');
            this._paint();
        }
    }

    _setMessage(message, tone) {
        this.message = message || '';
        this.messageTone = tone || 'neutral';
    }

    // ── Painting ─────────────────────────────────────────────────────────

    _paint() {
        if (!this.element) return;

        this.glyphElement.textContent = this.expanded ? '▾ ' : '▸ ';
        this.headerElement.setAttribute('aria-expanded', String(this.expanded));
        this.headerElement.classList.toggle('is-expanded', this.expanded);
        this.element.classList.toggle('is-expanded', this.expanded);
        this.bodyElement.hidden = !this.expanded;

        this.messageElement.textContent = this.message;
        this.messageElement.dataset.tone = this.messageTone;
        this.messageElement.hidden = !this.message;

        this._paintList();
        this._paintDiff();

        const canRevert = this.selectedVersion !== null && Number.isSafeInteger(this.currentVersion);
        this.revertButton?.setDisabled(!canRevert);
        this.revertButton?.setText(this._revertLabel(canRevert));
    }

    _revertLabel(canRevert) {
        if (!canRevert) return 'REVERT TO SELECTED VERSION';
        return this.revertArmed
            ? `CONFIRM REVERT TO V${this.selectedVersion}`
            : `REVERT TO V${this.selectedVersion}`;
    }

    _paintList() {
        this.clearElement(this.listElement);
        if (Number.isSafeInteger(this.currentVersion)) {
            this._appendRow({
                version: this.currentVersion,
                action: 'current',
                createdAt: this.currentSnapshot?.updatedAt ?? null,
                editorId: null,
            }, { current: true });
        }
        for (const entry of this.versions) {
            this._appendRow(entry, { current: false });
        }
    }

    _appendRow(entry, { current }) {
        const row = this.createElement('div', 'admin-version-row');
        row.dataset.version = String(entry.version);
        const selected = !current && entry.version === this.selectedVersion;
        row.classList.toggle('is-current', current);
        row.classList.toggle('is-selected', selected);
        row.title = entry.editorId
            ? `Version ${entry.version} — ${entry.action} by ${entry.editorId} at ${formatTimestamp(entry.createdAt)}`
            : `Version ${entry.version} — ${entry.action} at ${formatTimestamp(entry.createdAt)}`;

        this.appendElement(row, this.createElement('span', 'admin-version-cell admin-version-number', `V${entry.version}`));
        this.appendElement(row, this.createElement('span', 'admin-version-cell admin-version-action', String(entry.action).toUpperCase()));
        this.appendElement(row, this.createElement('span', 'admin-version-cell admin-version-date', formatTimestamp(entry.createdAt)));

        if (!current) {
            row.tabIndex = 0;
            row.setAttribute('role', 'button');
            row.setAttribute('aria-pressed', String(selected));
            row.addEventListener('click', () => this.selectVersion(entry.version));
            row.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.selectVersion(entry.version);
                }
            });
        }

        this.appendElement(this.listElement, row);
    }

    _paintDiff() {
        const hasSelection = this.selectedVersion !== null;
        this.diffView.emptyLabel = hasSelection ? 'NO FIELD DIFFERENCES' : 'SELECT A VERSION TO COMPARE';
        this.diffView.setEntries(hasSelection ? this.getDiffEntries() : [], {
            fromLabel: hasSelection ? `V${this.selectedVersion}` : 'BEFORE',
            toLabel: Number.isSafeInteger(this.currentVersion) ? `V${this.currentVersion} CURRENT` : 'CURRENT',
        });
    }

    destroy() {
        this.headerElement = null;
        this.glyphElement = null;
        this.bodyElement = null;
        this.listElement = null;
        this.messageElement = null;
        this.actionsElement = null;
        this.diffView = null;
        this.revertButton = null;
        this.versions = [];
        super.destroy();
    }
}
