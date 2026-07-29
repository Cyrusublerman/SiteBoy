/**
 * MediaPicker — bounded overlay over gallery-items with FileTable + upload.
 * Reuses uploadGalleryBlob; no second media pipeline.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Heading, Paragraph } from '../../content.js';
import { Button } from '../../interactive.js';
import { FileTable } from '../container/FileTable.js';
import { FileInput } from '../input/FileInput.js';
import { Auth } from '../../../admin/auth.js';
import { uploadGalleryBlob } from '../../gallery-upload.js';

/** Local normaliser — avoids importing gallery-editor (circular via component-library). */
function normaliseGalleryItem(item = {}) {
  const urls = item.urlsJsonb && typeof item.urlsJsonb === 'object' ? item.urlsJsonb : {};
  return {
    ...item,
    collection: item.collection || item.gallerySlug || 'uncategorised',
    title: item.title || item.filename || item.slug || item.id || 'Untitled',
    tags: Array.isArray(item.tags) ? item.tags : [],
    urlsJsonb: urls,
    previewUrl: item.thumbUrl || urls.thumb || item.mediaUrl || urls.web || '',
    altText: item.altText || item.title || item.filename || '',
    retained: Boolean(item.deletedAt),
  };
}

export class MediaPicker extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ ...options, componentType: 'media-picker' }, deps);
    this.onSelect = options.onSelect ?? (() => {});
    this.onCancel = options.onCancel ?? (() => {});
    this.items = [];
    this.selectedId = null;
    this.tracked = [];
    this.bodyTracked = [];
    this._statusEl = null;
    this._body = null;
  }

  _track(component, { body = false } = {}) {
    this.tracked.push(component);
    if (body) this.bodyTracked.push(component);
    this.children.add(component);
    return component;
  }

  render() {
    if (this.element) return this.element;
    this.element = this.createElement('div', 'admin-media-picker');

    const title = this._track(new Heading({ level: 2, content: 'MEDIA PICKER' }, this.deps));
    this.appendElement(this.element, title.render());

    this._statusEl = this.createElement('p', 'admin-media-picker-status', 'Loading gallery…');
    this.appendElement(this.element, this._statusEl);

    this._body = this.createElement('div', 'admin-media-picker-body');
    this.appendElement(this.element, this._body);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.appendElement(actions, this._track(new Button({
      text: 'USE SELECTED',
      onClick: () => this._confirm(),
    }, this.deps)).render());
    this.appendElement(actions, this._track(new Button({
      text: 'CANCEL',
      onClick: () => this.onCancel(),
    }, this.deps)).render());
    this.appendElement(this.element, actions);

    void this._load();
    return this.element;
  }

  _setStatus(message) {
    if (this._statusEl) this._statusEl.textContent = message;
  }

  async _load() {
    try {
      const response = await Auth.apiFetch('/api/content/gallery-items?view=admin&limit=100');
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Gallery read failed: ${response.status}`);
      }
      const data = await response.json();
      this.items = (data.items || []).map(normaliseGalleryItem)
        .filter((item) => !item.retained);
      this._setStatus(`${this.items.length} media item${this.items.length === 1 ? '' : 's'}.`);
      this._renderBody();
    } catch (error) {
      console.error('MediaPicker load failed:', error);
      this._setStatus(error.message || 'Failed to load gallery.');
    }
  }

  _clearBody() {
    if (!this._body) return;
    for (const component of this.bodyTracked) {
      this.children.delete(component);
      const idx = this.tracked.indexOf(component);
      if (idx >= 0) this.tracked.splice(idx, 1);
      component.destroy?.();
    }
    this.bodyTracked = [];
    while (this._body.firstChild) this._body.removeChild(this._body.firstChild);
  }

  _renderBody() {
    this._clearBody();

    const upload = this._track(new FileInput({
      label: 'UPLOAD NEW',
      buttonText: 'SELECT FILE',
      accept: 'image/*,video/mp4,video/webm',
      multiple: false,
      onChange: (files) => {
        const file = files?.[0];
        if (file) void this._upload(file);
      },
    }, this.deps), { body: true });
    this.appendElement(this._body, upload.render());

    if (!this.items.length) {
      this.appendElement(this._body, this._track(new Paragraph({
        content: 'No gallery items available. Upload one above.',
      }, this.deps), { body: true }).render());
      return;
    }

    const rows = this.items.map((item) => ({
      ...item,
      preview: item.previewUrl,
      selected: item.id === this.selectedId,
      tagsText: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    }));

    const table = this._track(new FileTable({
      columns: [
        { key: 'selected', label: 'SELECT', type: 'checkbox' },
        { key: 'preview', label: 'PREVIEW', type: 'preview' },
        { key: 'title', label: 'TITLE', type: 'text' },
        { key: 'collection', label: 'COLLECTION', type: 'text' },
        { key: 'tagsText', label: 'TAGS', type: 'text' },
      ],
      rows,
      onChange: (rowId, key, value) => {
        if (key !== 'selected') return;
        this.selectedId = value ? rowId : null;
        this._renderBody();
      },
    }, this.deps), { body: true });
    this.appendElement(this._body, table.render());
  }

  async _upload(file) {
    this._setStatus(`Uploading ${file.name}…`);
    try {
      const result = await uploadGalleryBlob(file, {
        title: file.name.replace(/\.[^.]+$/, ''),
        collection: 'blog',
        gallerySlug: 'blog',
        status: 'published',
        altText: file.name.replace(/\.[^.]+$/, ''),
      }, {
        onProgress: (pct) => this._setStatus(`Uploading ${file.name}… ${Math.round(pct * 100)}%`),
      });
      this._setStatus('Upload complete.');
      await this._load();
      if (result?.itemId) this.selectedId = result.itemId;
      this._renderBody();
    } catch (error) {
      console.error('MediaPicker upload failed:', error);
      this._setStatus(error.message || 'Upload failed.');
    }
  }

  _confirm() {
    const item = this.items.find((candidate) => candidate.id === this.selectedId);
    if (!item) {
      this._setStatus('Select a media item first.');
      return;
    }
    const urls = item.urlsJsonb && typeof item.urlsJsonb === 'object' ? item.urlsJsonb : {};
    this.onSelect({
      id: item.id,
      mediaUrl: item.mediaUrl || urls.web || item.previewUrl || '',
      thumbUrl: item.thumbUrl || urls.thumb || '',
      urlsJsonb: urls,
      altText: item.altText || item.title || '',
      title: item.title || '',
    });
  }

  destroy() {
    this.tracked = [];
    this.bodyTracked = [];
    this._statusEl = null;
    this._body = null;
    super.destroy();
  }
}
