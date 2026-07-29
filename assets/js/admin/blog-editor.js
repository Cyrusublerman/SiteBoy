import {
  AdminDomainEditor,
  Heading,
  Paragraph,
  Button,
  Select,
  TreeTOC,
  MarkdownBody,
  VersionHistoryPanel,
  InsertToolbar,
  BlockForm,
  MediaPicker,
  BlockOutline,
} from '../shared/component-library.js';
import { TextInput } from '../shared/components/input/TextInput.js';
import {
  patchVersionedRecord,
  restoreRecord,
  deleteVersionedRecord,
  ContentVersionError,
} from '../shared/content-versions.js';
import { BLOCK_TYPES } from '../shared/algorithms/markup/block-types.js';
import { Auth } from './auth.js';
import {
  normaliseArticle,
  slugifyTitle,
  mergeFrontmatter,
  spliceBlockLines,
  formatBlockFence,
  insertAtOffset,
  buildArticleTree,
  defaultBlockProps,
} from './blog-editor-state.js';

const RESOURCE = 'articles';

const TABS = Object.freeze([
  { id: 'articles', label: 'ARTICLES' },
  { id: 'compose', label: 'COMPOSE' },
  { id: 'settings', label: 'SETTINGS' },
]);

const STATUS_OPTIONS = Object.freeze([
  { value: 'draft', label: 'HIDDEN' },
  { value: 'published', label: 'PUBLISHED' },
  { value: 'archived', label: 'ARCHIVED' },
]);

export class BlogEditor extends AdminDomainEditor {
  constructor(options = {}, deps = {}) {
    super({
      ...options,
      componentType: 'blog-editor',
      title: 'BLOG EDITOR',
      description: 'Compose articles as markdown source, insert typed blocks, and manage publication state.',
      shellClassName: 'admin-blog-editor',
      tabs: TABS,
      activeTab: 'articles',
    }, deps);
    this.articles = [];
    this.editingId = null;
    this.draft = null;
    this.composeMode = 'source';
    this.deleteArmedId = null;
    this.saveBlocked = false;
    this._bodyInput = null;
    this._outline = null;
    this._picker = null;
    this._insertForm = null;
  }

  tabRenderers() {
    return {
      articles: () => this._renderArticles(),
      compose: () => this._renderCompose(),
      settings: () => this._renderSettings(),
    };
  }

  afterRender() {
    this.refreshArticles({ silent: true });
  }

  onTabChange() {
    this.deleteArmedId = null;
    this._bodyInput = null;
    this._outline = null;
    this._picker = null;
    this._insertForm = null;
  }

  _current() {
    if (!this.editingId) return null;
    return this.articles.find((a) => a.id === this.editingId) || null;
  }

  _ensureDraft() {
    const article = this._current();
    if (!article) {
      this.draft = null;
      return null;
    }
    if (!this.draft || this.draft.id !== article.id) {
      this.draft = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        bodyMd: article.bodyMd,
        status: article.status,
        publishedAt: article.publishedAt,
        frontmatterJsonb: { ...article.frontmatterJsonb },
        version: article.version,
      };
    }
    return this.draft;
  }

  async refreshArticles({ silent = false } = {}) {
    if (!silent) this.setStatus('Loading articles…', 'loading');
    try {
      const items = [];
      let offset = 0;
      const limit = 100;
      for (;;) {
        const response = await Auth.apiFetch(
          `/api/content/articles?view=admin&limit=${limit}&offset=${offset}`,
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Articles read failed: ${response.status}`);
        }
        const data = await response.json();
        const batch = (data.items || []).map(normaliseArticle);
        items.push(...batch);
        if (batch.length < limit) break;
        offset += limit;
      }
      this.articles = items.sort((a, b) => a.category.localeCompare(b.category)
        || a.title.localeCompare(b.title));
      if (this.editingId && !this.articles.some((a) => a.id === this.editingId)) {
        this.editingId = null;
        this.draft = null;
      }
      if (this.draft?.id) {
        const fresh = this.articles.find((a) => a.id === this.draft.id);
        if (fresh) this.draft.version = fresh.version;
      }
      if (!silent) {
        this.setStatus(
          `Loaded ${this.articles.length} article${this.articles.length === 1 ? '' : 's'}.`,
          'success',
        );
      }
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
      onChange: options.onChange || (() => {}),
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

  _renderArticles() {
    this.append(this.pane, new Heading({ level: 2, content: 'ARTICLES' }, this.deps));
    this.append(this.pane, new Paragraph({
      content: 'Select an article to edit, or create a new draft.',
    }, this.deps));

    const createRow = this.createElement('div', 'admin-editor-form-grid');
    const titleField = this._field(createRow, 'NEW TITLE', '', { placeholder: 'Article title' });
    this.appendElement(this.pane, createRow);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'CREATE ARTICLE',
      onClick: () => this._createArticle(titleField.getValue()),
    }, this.deps));
    this.append(actions, new Button({
      text: 'REFRESH',
      onClick: () => this.refreshArticles(),
    }, this.deps));
    this.appendElement(this.pane, actions);

    if (!this.articles.length) {
      this.append(this.pane, new Paragraph({ content: 'No articles loaded.' }, this.deps));
      return;
    }

    this.append(this.pane, new TreeTOC({
      data: buildArticleTree(this.articles),
      collapsible: true,
      defaultCollapsed: false,
      onItemClick: (node) => {
        const article = node?._data;
        if (!article?.id) return;
        this.editingId = article.id;
        this.draft = null;
        this._ensureDraft();
        this.setStatus(`Selected “${article.title}”.`, 'neutral');
        this.selectTab('compose');
      },
    }, this.deps));
  }

  async _createArticle(title) {
    const trimmed = String(title || '').trim() || 'Untitled';
    let slug = slugifyTitle(trimmed);
    if (this.articles.some((a) => a.slug === slug && !a.retained)) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    this.setStatus('Creating article…', 'loading');
    try {
      const response = await Auth.apiFetch('/api/content/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: trimmed,
          slug,
          category: 'blog',
          bodyMd: '',
          frontmatterJsonb: { route: `/blog/${slug}` },
          status: 'draft',
          publishedAt: null,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status >= 500) {
          throw new Error(data.error || 'Slug may already be in use.');
        }
        throw new Error(data.error || `Create failed: ${response.status}`);
      }
      const data = await response.json();
      const item = normaliseArticle(data.item || data);
      await this.refreshArticles({ silent: true });
      this.editingId = item.id;
      this.draft = null;
      this._ensureDraft();
      this.setStatus('Article created.', 'success');
      this.selectTab('compose');
    } catch (error) {
      this.setStatus(error.message, 'error');
    }
  }

  _renderCompose() {
    const draft = this._ensureDraft();
    if (!draft) {
      this.append(this.pane, new Paragraph({
        content: 'Select or create an article in ARTICLES first.',
      }, this.deps));
      return;
    }

    this.append(this.pane, new Heading({ level: 2, content: draft.title || 'COMPOSE' }, this.deps));

    const meta = this.createElement('div', 'admin-editor-form-grid');
    const title = this._field(meta, 'TITLE', draft.title, {
      onInput: (v) => { draft.title = v; },
    });
    const slug = this._field(meta, 'SLUG', draft.slug, {
      onInput: (v) => { draft.slug = v; },
    });
    const category = this._field(meta, 'CATEGORY', draft.category, {
      onInput: (v) => { draft.category = v; },
    });
    this.appendElement(this.pane, meta);
    // Keep references for save without re-read races.
    this._composeMeta = { title, slug, category };

    this.append(this.pane, new InsertToolbar({
      onInsert: (type) => this._handleInsert(type),
    }, this.deps));

    const modeStrip = this.createElement('div', 'admin-compose-mode-strip');
    for (const mode of ['source', 'preview']) {
      const cell = this.createElement('button', 'admin-compose-mode-cell');
      cell.type = 'button';
      cell.textContent = mode.toUpperCase();
      if (this.composeMode === mode) cell.classList.add('is-active');
      cell.addEventListener('click', () => {
        if (this._bodyInput) draft.bodyMd = this._bodyInput.getValue();
        this.composeMode = mode;
        this.renderActiveTab();
      });
      this.appendElement(modeStrip, cell);
    }
    this.appendElement(this.pane, modeStrip);

    this._bodyHost = this.createElement('div', 'admin-compose-body');
    this.appendElement(this.pane, this._bodyHost);
    this._renderComposeBody(draft);

    this._outline = this.append(this.pane, new BlockOutline({
      source: draft.bodyMd,
      onJump: (line) => {
        if (this.composeMode !== 'source') {
          this.composeMode = 'source';
          this.renderActiveTab();
        }
        this.setStatus(`Jumped to line ${line}.`, 'neutral');
      },
      onApply: (node, props) => {
        const source = this._bodyInput ? this._bodyInput.getValue() : draft.bodyMd;
        draft.bodyMd = spliceBlockLines(
          source,
          node.line,
          node.endLine,
          formatBlockFence(node.type, props),
        );
        if (this._bodyInput) this._bodyInput.setValue(draft.bodyMd);
        this._outline?.setSource(draft.bodyMd);
        this.setStatus('Block spliced into source.', 'success');
      },
    }, this.deps));

    const actions = this.createElement('div', 'admin-editor-actions');
    const saveBtn = this.append(actions, new Button({
      text: 'SAVE',
      onClick: () => this._saveCompose(),
    }, this.deps));
    if (this.saveBlocked) saveBtn.setDisabled?.(true);
    this.appendElement(this.pane, actions);

    this._pickerHost = this.createElement('div', 'admin-media-picker-host');
    this.appendElement(this.pane, this._pickerHost);
    this._insertHost = this.createElement('div', 'admin-insert-form-host');
    this.appendElement(this.pane, this._insertHost);
  }

  _renderComposeBody(draft) {
    while (this._bodyHost.firstChild) this._bodyHost.removeChild(this._bodyHost.firstChild);
    this._bodyInput = null;
    if (this.composeMode === 'preview') {
      this.append(this._bodyHost, new MarkdownBody({
        markdownText: draft.bodyMd,
        trusted: false,
        className: 'markdown-body admin-compose-preview',
      }, this.deps));
      return;
    }
    this._bodyInput = this.append(this._bodyHost, new TextInput({
      label: 'BODY (MARKDOWN)',
      value: draft.bodyMd,
      multiline: true,
      rows: 22,
      onInput: (v) => {
        draft.bodyMd = v;
        this._outline?.setSource(v);
      },
    }, this.deps));
  }

  _cursorOffset() {
    const el = this._bodyInput?.inputEl;
    if (!el || typeof el.selectionStart !== 'number') {
      return (this.draft?.bodyMd || '').length;
    }
    return el.selectionStart;
  }

  _handleBody(chunk) {
    const draft = this._ensureDraft();
    if (!draft) return;
    if (this.composeMode !== 'source') {
      this.composeMode = 'source';
      this.renderActiveTab();
    }
    const source = this._bodyInput ? this._bodyInput.getValue() : draft.bodyMd;
    const next = insertAtOffset(source, this._cursorOffset(), chunk);
    draft.bodyMd = next;
    if (this._bodyInput) this._bodyInput.setValue(next);
    this._outline?.setSource(next);
  }

  _handleInsertHosts() {
    if (this._picker) {
      this.children.delete(this._picker);
      this._picker.destroy?.();
      this._picker = null;
    }
    if (this._insertForm) {
      this.children.delete(this._insertForm);
      this._insertForm.destroy?.();
      this._insertForm = null;
    }
    if (this._pickerHost) while (this._pickerHost.firstChild) this._pickerHost.removeChild(this._pickerHost.firstChild);
    if (this._insertHost) while (this._insertHost.firstChild) this._insertHost.removeChild(this._insertHost.firstChild);
  }

  _handleInsert(type) {
    this._clearInsertHosts();
    if (type === 'image') {
      this._picker = this.append(this._pickerHost, new MediaPicker({
        onSelect: (media) => {
          const url = media.urlsJsonb?.web || media.mediaUrl;
          const alt = media.altText || media.title || 'image';
          this._replaceBody(`![${alt}](${url})`);
          this._clearInsertHosts();
          this.setStatus('Image markdown inserted.', 'success');
        },
        onCancel: () => this._clearInsertHosts(),
      }, this.deps));
      return;
    }

    if (!BLOCK_TYPES[type]) {
      this.setStatus(`Unknown block type: ${type}`, 'error');
      return;
    }

    this._insertForm = this.append(this._insertHost, new BlockForm({
      blockType: type,
      props: defaultBlockProps(BLOCK_TYPES[type].props),
      submitLabel: 'INSERT BLOCK',
      onSubmit: (props) => {
        this._replaceBody(formatBlockFence(type, props));
        this._clearInsertHosts();
        this.setStatus(`Inserted ${type} block.`, 'success');
      },
      onCancel: () => this._clearInsertHosts(),
    }, this.deps));
  }

  async _saveCompose() {
    const draft = this._ensureDraft();
    const article = this._current();
    if (!draft || !article) return;
    if (this.saveBlocked) {
      this.setStatus('Save blocked: no version token. Reload the article.', 'error');
      return;
    }
    if (this._bodyInput) draft.bodyMd = this._bodyInput.getValue();
    if (this._composeMeta) {
      draft.title = this._composeMeta.title.getValue();
      draft.slug = this._composeMeta.slug.getValue();
      draft.category = this._composeMeta.category.getValue();
    }
    this.setStatus('Saving…', 'loading');
    try {
      const response = await patchVersionedRecord(RESOURCE, {
        id: draft.id,
        title: draft.title,
        slug: draft.slug,
        category: draft.category,
        bodyMd: draft.bodyMd,
      }, draft.version);
      const ok = await this._handleMutationResponse(response, 'Article saved.');
      if (ok) {
        this.draft = null;
        this._ensureDraft();
      }
    } catch (error) {
      this._handleVersionError(error);
    }
  }

  _renderSettings() {
    const draft = this._ensureDraft();
    const article = this._current();
    if (!draft || !article) {
      this.append(this.pane, new Paragraph({
        content: 'Select or create an article in ARTICLES first.',
      }, this.deps));
      return;
    }

    this.append(this.pane, new Heading({ level: 2, content: 'SETTINGS' }, this.deps));

    const form = this.createElement('div', 'admin-editor-form-grid');
    const status = this._select(form, 'STATUS', STATUS_OPTIONS, draft.status, (v) => {
      draft.status = v;
    });
    const publishedAt = this._field(
      form,
      'PUBLISHED AT (ISO)',
      draft.publishedAt ? String(draft.publishedAt) : '',
      { placeholder: '2026-07-30T00:00:00.000Z' },
    );
    const summary = this._field(
      form,
      'SUMMARY',
      draft.frontmatterJsonb?.summary || '',
      { multiline: true, rows: 3 },
    );
    const route = this._field(
      form,
      'ROUTE',
      draft.frontmatterJsonb?.route || `/blog/${draft.slug}`,
    );
    const frontmatterRaw = this._field(
      form,
      'FRONTMATTER (JSON)',
      JSON.stringify(draft.frontmatterJsonb || {}, null, 2),
      { multiline: true, rows: 8 },
    );
    this.appendElement(this.pane, form);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'SAVE SETTINGS',
      onClick: async () => {
        let frontmatter;
        try {
          frontmatter = JSON.parse(frontmatterRaw.getValue() || '{}');
        } catch {
          this.setStatus('Frontmatter must be valid JSON.', 'error');
          return;
        }
        frontmatter = mergeFrontmatter(frontmatter, {
          summary: summary.getValue(),
          route: route.getValue(),
        });
        const nextStatus = status.getValue();
        const pubRaw = publishedAt.getValue().trim();
        const body = {
          id: draft.id,
          status: nextStatus,
          frontmatterJsonb: frontmatter,
        };
        if (nextStatus === 'published') {
          body.publishedAt = pubRaw || new Date().toISOString();
        } else if (pubRaw) {
          body.publishedAt = pubRaw;
        }
        this.setStatus('Saving settings…', 'loading');
        try {
          const response = await patchVersionedRecord(RESOURCE, body, draft.version);
          const ok = await this._handleMutationResponse(response, 'Settings saved.');
          if (ok) {
            this.draft = null;
            this._ensureDraft();
          }
        } catch (error) {
          this._handleVersionError(error);
        }
      },
    }, this.deps));

    if (article.retained) {
      this.append(actions, new Button({
        text: 'RESTORE ARTICLE',
        onClick: async () => {
          try {
            await restoreRecord(RESOURCE, { id: article.id, currentVersion: article.version });
            await this.refreshArticles({ silent: true });
            this.setStatus('Article restored.', 'success');
          } catch (error) {
            this._handleVersionError(error);
          }
        },
      }, this.deps));
    } else {
      const deleteButton = this.append(actions, new Button({
        text: this.deleteArmedId === article.id ? 'CONFIRM DELETE' : 'DELETE ARTICLE',
        onClick: async () => {
          if (this.deleteArmedId !== article.id) {
            this.deleteArmedId = article.id;
            this.setStatus('Press CONFIRM DELETE to soft-delete this article.', 'warning');
            this.renderActiveTab();
            return;
          }
          try {
            await deleteVersionedRecord(RESOURCE, {
              id: article.id,
              currentVersion: article.version,
            });
            this.deleteArmedId = null;
            this.editingId = null;
            this.draft = null;
            await this.refreshArticles({ silent: true });
            this.setStatus('Article soft-deleted.', 'success');
            this.selectTab('articles');
          } catch (error) {
            this._handleVersionError(error);
          }
        },
      }, this.deps));
      deleteButton.element?.classList.add('is-destructive');
    }

    this.append(actions, new Button({
      text: 'RELOAD ARTICLE',
      onClick: async () => {
        try {
          if (this.draft?.bodyMd && navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(this.draft.bodyMd);
          }
        } catch {
          // Clipboard is best-effort.
        }
        this.draft = null;
        this.saveBlocked = false;
        await this.refreshArticles({ silent: true });
        this.setStatus('Article reloaded. Local body copied to clipboard when available.', 'success');
      },
    }, this.deps));
    this.appendElement(this.pane, actions);

    this.append(this.pane, new VersionHistoryPanel({
      resource: RESOURCE,
      recordId: article.id,
      currentVersion: article.version,
      currentSnapshot: article,
      onStatus: (message, tone) => this.setStatus(message, tone),
      onReverted: () => {
        this.draft = null;
        this.refreshArticles({ silent: true });
      },
    }, this.deps));
  }

  async _handleMutationResponse(response, successMessage) {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 428 || data.code === 'IF_MATCH_REQUIRED' || data.code === 'INVALID_IF_MATCH') {
        console.error('Blog save blocked: missing or invalid If-Match', data);
        this.saveBlocked = true;
        this.setStatus('Save blocked: no version token. Reload the article.', 'error');
        return false;
      }
      const conflict = Number.isSafeInteger(data.currentVersion)
        ? ` The article moved to version ${data.currentVersion}; reload before saving again.`
        : '';
      this.setStatus(`${data.error || `Request failed: ${response.status}`}${conflict}`, 'error');
      return false;
    }
    this.saveBlocked = false;
    await this.refreshArticles({ silent: true });
    this.setStatus(successMessage, 'success');
    return true;
  }

  _handleVersionError(error) {
    if (error instanceof ContentVersionError) {
      if (error.status === 428 || error.code === 'IF_MATCH_REQUIRED' || error.code === 'INVALID_IF_MATCH') {
        console.error('Blog version error:', error);
        this.saveBlocked = true;
        this.setStatus('Save blocked: no version token. Reload the article.', 'error');
        return;
      }
      if (error.status === 409 || error.code === 'VERSION_CONFLICT') {
        const ver = error.currentVersion;
        this.setStatus(
          `The article moved to version ${ver}; reload before saving again.`,
          'error',
        );
        return;
      }
    }
    this.setStatus(error.message || String(error), 'error');
  }
}

export {
  normaliseArticle,
  slugifyTitle,
  spliceBlockLines,
  formatBlockFence,
  insertAtOffset,
  buildArticleTree,
} from './blog-editor-state.js';
