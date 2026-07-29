import {
  AdminDomainEditor,
  Heading,
  Paragraph,
  Button,
  Select,
  VersionHistoryPanel,
} from '../shared/component-library.js';
import { TextInput } from '../shared/components/input/TextInput.js';
import {
  patchVersionedRecord,
  ContentVersionError,
} from '../shared/content-versions.js';
import { Auth } from './auth.js';

const RESOURCE = 'page-blocks';
const ABOUT_SLUG = 'about';
const BLOCK_TYPES = Object.freeze(['markdown', 'media', 'graph', 'custom']);

const TABS = Object.freeze([
  { id: 'blocks', label: 'BLOCKS' },
  { id: 'settings', label: 'SETTINGS' },
]);

const STATUS_OPTIONS = Object.freeze([
  { value: 'draft', label: 'HIDDEN' },
  { value: 'published', label: 'PUBLISHED' },
  { value: 'archived', label: 'ARCHIVED' },
]);

function emptyBlock(type) {
  switch (type) {
    case 'media':
      return { type: 'media', mediaType: 'image', src: '', caption: '', size: 'm' };
    case 'graph':
      return { type: 'graph', graphType: 'bar', data: [], title: '' };
    case 'custom':
      return { type: 'custom', html: '' };
    default:
      return { type: 'markdown', content: '' };
  }
}

export function normalisePageBlock(item = {}) {
  return {
    ...item,
    pageSlug: item.pageSlug || '',
    title: item.title || 'Untitled',
    blocksJsonb: Array.isArray(item.blocksJsonb) ? item.blocksJsonb : [],
    status: item.status || 'draft',
    version: Number.isSafeInteger(item.version) ? item.version : 1,
  };
}

export class PageBlocksEditor extends AdminDomainEditor {
  constructor(options = {}, deps = {}) {
    super({
      ...options,
      componentType: 'page-blocks-editor',
      title: 'ABOUT EDITOR',
      description: 'Edit the About page title, status and BlockRenderer block list.',
      shellClassName: 'admin-page-blocks-editor',
      tabs: TABS,
      activeTab: 'blocks',
    }, deps);
    this.record = null;
    this.blocks = [];
    this.titleValue = 'ABOUT';
    this.statusValue = 'published';
    this.rawMode = false;
    this.selectedIndex = 0;
  }

  tabRenderers() {
    return {
      blocks: () => this._renderBlocks(),
      settings: () => this._renderSettings(),
    };
  }

  afterRender() {
    this.refreshRecord({ silent: true });
  }

  async refreshRecord({ silent = false } = {}) {
    if (!silent) this.setStatus('Loading About page…', 'loading');
    try {
      const items = [];
      let offset = 0;
      const limit = 100;
      for (;;) {
        const response = await Auth.apiFetch(
          `/api/content/page-blocks?view=admin&limit=${limit}&offset=${offset}`,
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Page blocks read failed: ${response.status}`);
        }
        const data = await response.json();
        const batch = (data.items || []).map(normalisePageBlock);
        items.push(...batch);
        if (batch.length < limit) break;
        offset += limit;
      }
      const about = items.find((item) => item.pageSlug === ABOUT_SLUG) || null;
      if (!about) {
        this.record = null;
        this.blocks = [];
        this.setStatus('No About page-blocks row found. Create one via import or API.', 'warning');
        this.renderActiveTab();
        return;
      }
      this.record = about;
      this.blocks = about.blocksJsonb.map((block) => ({ ...block }));
      this.titleValue = about.title;
      this.statusValue = about.status;
      if (!silent) this.setStatus('About page loaded.', 'success');
      this.renderActiveTab();
    } catch (error) {
      this.setStatus(error.message, 'error');
    }
  }

  _field(parent, label, value = '', options = {}) {
    return this.append(parent, new TextInput({
      label,
      value,
      multiline: options.multiline || false,
      rows: options.rows || 4,
      placeholder: options.placeholder || '',
      onInput: options.onInput || null,
    }, this.deps));
  }

  _select(parent, label, options, value, onChange) {
    const wrapper = this.createElement('label', 'admin-editor-field');
    const caption = this.createElement('span', 'admin-editor-field-label', label);
    this.appendElement(wrapper, caption);
    const select = this.append(wrapper, new Select({ options, value, onChange }, this.deps));
    this.appendElement(parent, wrapper);
    return select;
  }

  _renderBlocks() {
    this.append(this.pane, new Heading({ level: 2, content: 'ABOUT BLOCKS' }, this.deps));
    if (!this.record) {
      this.append(this.pane, new Paragraph({
        content: 'No About page-blocks record is available.',
      }, this.deps));
      this.append(this.pane, new Button({
        text: 'REFRESH',
        onClick: () => this.refreshRecord(),
      }, this.deps));
      return;
    }

    const meta = this.createElement('div', 'admin-editor-form-grid');
    const title = this._field(meta, 'TITLE', this.titleValue, {
      onInput: (v) => { this.titleValue = v; },
    });
    this.appendElement(this.pane, meta);

    const modeStrip = this.createElement('div', 'admin-compose-mode-strip');
    for (const [mode, label] of [['structured', 'STRUCTURED'], ['raw', 'RAW JSON']]) {
      const cell = this.createElement('button', 'admin-compose-mode-cell');
      cell.type = 'button';
      cell.textContent = label;
      if ((this.rawMode && mode === 'raw') || (!this.rawMode && mode === 'structured')) {
        cell.classList.add('is-active');
      }
      cell.addEventListener('click', () => {
        this.rawMode = mode === 'raw';
        this.renderActiveTab();
      });
      this.appendElement(modeStrip, cell);
    }
    this.appendElement(this.pane, modeStrip);

    let rawField = null;
    if (this.rawMode) {
      rawField = this._field(
        this.pane,
        'BLOCKS JSON',
        JSON.stringify(this.blocks, null, 2),
        { multiline: true, rows: 20 },
      );
    } else {
      this._renderStructuredBlocks();
    }

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'SAVE BLOCKS',
      onClick: async () => {
        let blocks = this.blocks;
        if (this.rawMode) {
          try {
            blocks = JSON.parse(rawField.getValue() || '[]');
            if (!Array.isArray(blocks)) throw new Error('Blocks must be a JSON array.');
          } catch (error) {
            this.setStatus(error.message || 'Invalid JSON.', 'error');
            return;
          }
        }
        this.titleValue = title.getValue();
        await this._save({ title: this.titleValue, blocksJsonb: blocks });
      },
    }, this.deps));
    this.appendElement(this.pane, actions);
  }

  _renderStructuredBlocks() {
    const toolbar = this.createElement('div', 'admin-editor-actions');
    for (const type of BLOCK_TYPES) {
      this.append(toolbar, new Button({
        text: `${type.toUpperCase()} +`,
        onClick: () => {
          this.blocks.push(emptyBlock(type));
          this.selectedIndex = this.blocks.length - 1;
          this.renderActiveTab();
        },
      }, this.deps));
    }
    this.appendElement(this.pane, toolbar);

    if (!this.blocks.length) {
      this.append(this.pane, new Paragraph({ content: 'No blocks yet. Add one above.' }, this.deps));
      return;
    }

    if (this.selectedIndex >= this.blocks.length) this.selectedIndex = this.blocks.length - 1;

    const list = this.createElement('div', 'admin-page-block-list');
    this.blocks.forEach((block, index) => {
      const row = this.createElement('button', 'admin-block-outline-row');
      row.type = 'button';
      if (index === this.selectedIndex) row.classList.add('is-active');
      row.textContent = `${index + 1}. ${(block.type || 'unknown').toUpperCase()}`;
      row.addEventListener('click', () => {
        this.selectedIndex = index;
        this.renderActiveTab();
      });
      this.appendElement(list, row);
    });
    this.appendElement(this.pane, list);

    const reorder = this.createElement('div', 'admin-editor-actions');
    this.append(reorder, new Button({
      text: 'MOVE UP',
      onClick: () => this._moveSelected(-1),
    }, this.deps));
    this.append(reorder, new Button({
      text: 'MOVE DOWN',
      onClick: () => this._moveSelected(1),
    }, this.deps));
    this.append(reorder, new Button({
      text: 'REMOVE BLOCK',
      onClick: () => {
        if (this.selectedIndex < 0) return;
        this.blocks.splice(this.selectedIndex, 1);
        if (this.selectedIndex >= this.blocks.length) {
          this.selectedIndex = Math.max(0, this.blocks.length - 1);
        }
        this.renderActiveTab();
      },
    }, this.deps));
    this.appendElement(this.pane, reorder);

    const block = this.blocks[this.selectedIndex];
    if (!block) return;

    const form = this.createElement('div', 'admin-editor-form-grid');
    const typeSelect = this._select(
      form,
      'TYPE',
      BLOCK_TYPES.map((t) => ({ value: t, label: t })),
      block.type || 'markdown',
      (value) => {
        this.blocks[this.selectedIndex] = { ...emptyBlock(value), ...block, type: value };
        this.renderActiveTab();
      },
    );
    void typeSelect;

    if (block.type === 'markdown' || !block.type) {
      const content = this._field(form, 'CONTENT', block.content || '', {
        multiline: true,
        rows: 12,
        onInput: (v) => { block.content = v; },
      });
      void content;
    } else if (block.type === 'media') {
      this._field(form, 'MEDIA TYPE', block.mediaType || 'image', {
        onInput: (v) => { block.mediaType = v; },
      });
      this._field(form, 'SRC', block.src || '', {
        onInput: (v) => { block.src = v; },
      });
      this._field(form, 'CAPTION', block.caption || '', {
        onInput: (v) => { block.caption = v; },
      });
      this._field(form, 'SIZE', block.size || 'm', {
        onInput: (v) => { block.size = v; },
      });
    } else if (block.type === 'graph') {
      this._field(form, 'GRAPH TYPE', block.graphType || block.variant || 'bar', {
        onInput: (v) => { block.graphType = v; },
      });
      this._field(form, 'TITLE', block.title || '', {
        onInput: (v) => { block.title = v; },
      });
      this._field(form, 'DATA (JSON)', JSON.stringify(block.data || [], null, 2), {
        multiline: true,
        rows: 8,
        onInput: (v) => {
          try { block.data = JSON.parse(v || '[]'); } catch { /* keep typing */ }
        },
      });
    } else if (block.type === 'custom') {
      this._field(form, 'HTML / PAYLOAD', block.html || block.content || '', {
        multiline: true,
        rows: 10,
        onInput: (v) => { block.html = v; },
      });
    }
    this.appendElement(this.pane, form);
  }

  _moveSelected(direction) {
    const i = this.selectedIndex;
    const j = i + direction;
    if (i < 0 || j < 0 || j >= this.blocks.length) return;
    [this.blocks[i], this.blocks[j]] = [this.blocks[j], this.blocks[i]];
    this.selectedIndex = j;
    this.renderActiveTab();
  }

  _renderSettings() {
    this.append(this.pane, new Heading({ level: 2, content: 'SETTINGS' }, this.deps));
    if (!this.record) {
      this.append(this.pane, new Paragraph({
        content: 'No About page-blocks record is available.',
      }, this.deps));
      return;
    }

    const form = this.createElement('div', 'admin-editor-form-grid');
    const status = this._select(form, 'STATUS', STATUS_OPTIONS, this.statusValue, (v) => {
      this.statusValue = v;
    });
    this.appendElement(this.pane, form);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'SAVE STATUS',
      onClick: () => this._save({ status: status.getValue() }),
    }, this.deps));
    this.append(actions, new Button({
      text: 'RELOAD',
      onClick: () => this.refreshRecord(),
    }, this.deps));
    this.appendElement(this.pane, actions);

    this.append(this.pane, new VersionHistoryPanel({
      resource: RESOURCE,
      recordId: this.record.id,
      currentVersion: this.record.version,
      currentSnapshot: this.record,
      onStatus: (message, tone) => this.setStatus(message, tone),
      onReverted: () => this.refreshRecord({ silent: true }),
    }, this.deps));
  }

  async _save(fields) {
    if (!this.record) return;
    this.setStatus('Saving…', 'loading');
    try {
      const response = await patchVersionedRecord(
        RESOURCE,
        { id: this.record.id, ...fields },
        this.record.version,
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const conflict = Number.isSafeInteger(data.currentVersion)
          ? ` Record moved to version ${data.currentVersion}; reload before saving again.`
          : '';
        this.setStatus(`${data.error || `Request failed: ${response.status}`}${conflict}`, 'error');
        return;
      }
      await this.refreshRecord({ silent: true });
      this.setStatus('About page saved.', 'success');
    } catch (error) {
      if (error instanceof ContentVersionError) {
        this.setStatus(error.message, 'error');
        return;
      }
      this.setStatus(error.message || String(error), 'error');
    }
  }
}
