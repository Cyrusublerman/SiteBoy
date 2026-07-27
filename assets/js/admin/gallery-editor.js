import {
  AdminDomainEditor,
  Heading,
  Paragraph,
  Button,
  FileTable,
  Select,
  VersionHistoryPanel,
} from '../shared/component-library.js';
import { TextInput } from '../shared/components/input/TextInput.js';
import { FileInput } from '../shared/components/input/FileInput.js';
import { patchVersionedRecord } from '../shared/content-versions.js';
import { Auth } from './auth.js';
import {
  purgeGalleryItem,
  restoreGalleryItem,
  retainGalleryItem,
  uploadGalleryBlob,
} from '../shared/gallery-upload.js';

const RESOURCE = 'gallery-items';

/** Rows created by the media confirm endpoint start at version 1. */
const NEW_ITEM_VERSION = 1;

const TABS = Object.freeze([
  { id: 'upload', label: 'UPLOAD' },
  { id: 'edit', label: 'EDIT' },
  { id: 'organise', label: 'ORGANISE' },
  { id: 'system', label: 'SYSTEM' },
]);

const DISPLAY_MODES = Object.freeze([
  { value: 'standalone', label: 'Standalone' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'slideshow', label: 'Slideshow' },
]);

export function parseTags(value) {
  const input = Array.isArray(value) ? value : String(value ?? '').split(/[;,]/);
  return [...new Set(input.map((tag) => String(tag).trim()).filter(Boolean))];
}

export function tagsToText(tags) {
  return parseTags(tags).join(', ');
}

export function mergeGalleryMetadata(existing, patch) {
  const base = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
  return Object.fromEntries(
    Object.entries({ ...base, ...patch }).filter(([, value]) => value !== undefined),
  );
}

export function normaliseGalleryItem(item = {}) {
  const collection = item.collection || item.gallerySlug || 'uncategorised';
  const metadata = item.metadataJsonb && typeof item.metadataJsonb === 'object'
    ? item.metadataJsonb
    : {};
  const urls = item.urlsJsonb && typeof item.urlsJsonb === 'object' ? item.urlsJsonb : {};
  return {
    ...item,
    collection,
    gallerySlug: item.gallerySlug || collection,
    title: item.title || item.filename || item.slug || item.id || 'Untitled',
    description: item.description || '',
    tags: parseTags(item.tags),
    metadataJsonb: metadata,
    group: metadata.group || '',
    displayMode: metadata.displayMode || 'standalone',
    previewUrl: item.thumbUrl || urls.thumb || item.mediaUrl || urls.web || '',
    sortIndex: Number(item.sortIndex) || 0,
    selected: Boolean(item.selected),
    retained: Boolean(item.deletedAt),
    version: Number.isSafeInteger(item.version) ? item.version : NEW_ITEM_VERSION,
  };
}

export function buildUploadRows(files, defaults = {}, createPreview = (file) => URL.createObjectURL(file)) {
  return Array.from(files || []).map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified || index}`,
    file,
    filename: file.name,
    previewUrl: createPreview(file),
    include: true,
    title: defaults.title || file.name.replace(/\.[^.]+$/, ''),
    description: defaults.description || '',
    tags: tagsToText(defaults.tags),
    group: defaults.group || '',
    collection: defaults.collection || 'digital/generative',
    displayMode: defaults.displayMode || 'standalone',
  }));
}

export function reorderSelectedRows(rows, selectedIds, direction) {
  const selected = new Set(selectedIds || []);
  const output = rows.map((row) => ({ ...row }));
  if (direction < 0) {
    for (let index = 1; index < output.length; index += 1) {
      if (selected.has(output[index].id) && !selected.has(output[index - 1].id)) {
        [output[index - 1], output[index]] = [output[index], output[index - 1]];
      }
    }
  } else if (direction > 0) {
    for (let index = output.length - 2; index >= 0; index -= 1) {
      if (selected.has(output[index].id) && !selected.has(output[index + 1].id)) {
        [output[index], output[index + 1]] = [output[index + 1], output[index]];
      }
    }
  }
  return output.map((row, sortIndex) => ({ ...row, sortIndex }));
}

export function collectTagSuggestions(items) {
  return [...new Set(items.flatMap((item) => parseTags(item.tags)))].sort((a, b) => a.localeCompare(b));
}

export function matchPosterFile(videoName, posterFiles) {
  const stem = String(videoName || '').replace(/\.[^.]+$/, '').toLowerCase();
  return Array.from(posterFiles || []).find((file) => (
    file.type?.startsWith('image/')
    && file.name.replace(/\.[^.]+$/, '').replace(/\.poster$/i, '').toLowerCase() === stem
  )) || null;
}

function itemOption(item) {
  return {
    value: item.id,
    label: `${item.collection} / ${item.title}`,
  };
}

export class GalleryEditor extends AdminDomainEditor {
  constructor(options = {}, deps = {}) {
    super({
      ...options,
      componentType: 'gallery-editor',
      title: 'GALLERY EDITOR',
      description: 'Upload media to R2, edit metadata, organise display order and inspect gallery processing state.',
      shellClassName: 'admin-gallery-editor',
      tabs: TABS,
      activeTab: 'upload',
    }, deps);
    this.items = [];
    this.uploadRows = [];
    this.organiseRows = [];
    this.posterFiles = [];
    this.previewUrls = new Set();
    this.editingId = null;
    this.deleteArmedId = null;
  }

  tabRenderers() {
    return {
      upload: () => this._renderUpload(),
      edit: () => this._renderEdit(),
      organise: () => this._renderOrganise(),
      system: () => this._renderSystem(),
    };
  }

  afterRender() {
    this.refreshItems({ silent: true });
  }

  onTabChange() {
    this.deleteArmedId = null;
  }

  async refreshItems({ silent = false } = {}) {
    if (!silent) this.setStatus('Loading gallery records…', 'loading');
    try {
      const response = await Auth.apiFetch('/api/content/gallery-items?view=admin&limit=100');
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Gallery read failed: ${response.status}`);
      }
      const data = await response.json();
      this.items = (data.items || []).map(normaliseGalleryItem)
        .sort((a, b) => a.collection.localeCompare(b.collection) || a.sortIndex - b.sortIndex);
      this.organiseRows = this.items.map((item) => ({ ...item }));
      if (!silent) this.setStatus(`Loaded ${this.items.length} gallery item${this.items.length === 1 ? '' : 's'}.`, 'success');
      if (this.activeTab !== 'upload') this.renderActiveTab();
    } catch (error) {
      this.setStatus(error.message, 'error');
    }
  }

  _patchItem(item, fields) {
    return patchVersionedRecord(RESOURCE, { id: item.id, ...fields }, item.version);
  }

  _field(parent, label, value = '', options = {}) {
    return this.append(parent, new TextInput({
      label,
      value,
      multiline: options.multiline || false,
      rows: options.rows || 4,
      placeholder: options.placeholder || '',
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

  _renderSuggestions(parent, tags) {
    if (!tags.length) return;
    const block = this.createElement('div', 'admin-tag-suggestions');
    this.appendElement(block, this.createElement('span', 'admin-editor-field-label', 'EXISTING TAGS'));
    for (const tag of tags) {
      this.appendElement(block, this.createElement('code', 'admin-tag-chip', tag));
    }
    this.appendElement(parent, block);
  }

  _renderUpload() {
    this.append(this.pane, new Heading({ level: 2, content: 'UPLOAD MEDIA' }, this.deps));
    const form = this.createElement('div', 'admin-editor-form-grid');
    const collection = this._field(form, 'COLLECTION', 'digital/generative');
    const description = this._field(form, 'DEFAULT DESCRIPTION', '', { multiline: true, rows: 3 });
    const tags = this._field(form, 'DEFAULT TAGS', '', { placeholder: 'tag one, tag two' });
    const group = this._field(form, 'DEFAULT GROUP', '', { placeholder: 'series or set name' });
    const displayMode = this._select(form, 'DISPLAY MODE', DISPLAY_MODES, 'standalone');
    this.appendElement(this.pane, form);
    this._renderSuggestions(this.pane, collectTagSuggestions(this.items));

    let table;
    const fileInput = this.append(this.pane, new FileInput({
      label: 'FILES',
      buttonText: 'SELECT FILES',
      accept: 'image/*,video/mp4,video/webm,model/gltf-binary',
      multiple: true,
      onChange: (files) => {
        this._releasePreviewUrls();
        this.uploadRows = buildUploadRows(files, {
          collection: collection.getValue(),
          description: description.getValue(),
          tags: tags.getValue(),
          group: group.getValue(),
          displayMode: displayMode.getValue(),
        });
        for (const row of this.uploadRows) this.previewUrls.add(row.previewUrl);
        table?.setRows(this.uploadRows);
        this.setStatus(`${this.uploadRows.length} file${this.uploadRows.length === 1 ? '' : 's'} ready for review.`);
      },
    }, this.deps));

    table = this.append(this.pane, new FileTable({
      columns: [
        { key: 'include', label: 'USE', type: 'checkbox' },
        { key: 'preview', label: 'PREVIEW', type: 'preview' },
        { key: 'title', label: 'TITLE', type: 'text' },
        { key: 'description', label: 'DESCRIPTION', type: 'text' },
        { key: 'tags', label: 'TAGS', type: 'text' },
        { key: 'group', label: 'GROUP', type: 'text' },
      ],
      rows: this.uploadRows,
      onChange: (_rowId, _key, _value, rows) => { this.uploadRows = rows; },
    }, this.deps));

    this.append(this.pane, new FileInput({
      label: 'VIDEO POSTERS',
      buttonText: 'ADD VIDEO POSTERS +',
      accept: 'image/jpeg,image/png,image/webp',
      multiple: true,
      onChange: (files) => {
        this.posterFiles = Array.from(files || []);
        this.setStatus(`${this.posterFiles.length} video poster image${this.posterFiles.length === 1 ? '' : 's'} selected. Name each poster after its video.`);
      },
    }, this.deps));

    const actions = this.createElement('div', 'admin-editor-actions');
    const uploadButton = this.append(actions, new Button({
      text: 'UPLOAD INCLUDED FILES',
      onClick: async () => {
        uploadButton.setDisabled(true);
        try {
          await this._uploadIncludedRows({
            collection: collection.getValue(),
            description: description.getValue(),
            tags: tags.getValue(),
            group: group.getValue(),
            displayMode: displayMode.getValue(),
          });
          fileInput.clear();
          this.uploadRows = [];
          table.setRows([]);
        } finally {
          uploadButton.setDisabled(false);
        }
      },
    }, this.deps));
    this.appendElement(this.pane, actions);
  }

  async _uploadIncludedRows(defaults) {
    const rows = this.uploadRows.filter((row) => row.include);
    if (!rows.length) {
      this.setStatus('Select at least one file.', 'error');
      return;
    }
    let completed = 0;
    for (const row of rows) {
      this.setStatus(`Uploading ${row.filename} (${completed + 1}/${rows.length})…`);
      const result = await uploadGalleryBlob(row.file, {
        filename: row.filename,
        mime: row.file.type,
        collection: row.collection || defaults.collection,
        title: row.title,
        description: row.description || defaults.description,
        tags: parseTags(row.tags || defaults.tags),
        posterBlob: row.file.type.startsWith('video/')
          ? matchPosterFile(row.filename, this.posterFiles)
          : null,
      }, {
        onProgress: (progress) => {
          this.setStatus(`Uploading ${row.filename}: ${Math.round(progress * 100)}%`);
        },
      });

      const metadataJsonb = mergeGalleryMetadata({}, {
        group: row.group || defaults.group || '',
        displayMode: row.displayMode || defaults.displayMode || 'standalone',
      });
      const patch = await this._patchItem(
        { id: result.itemId, version: NEW_ITEM_VERSION },
        { metadataJsonb },
      );
      if (!patch.ok) {
        const data = await patch.json().catch(() => ({}));
        throw new Error(data.error || `Uploaded ${row.filename}, but metadata update failed.`);
      }
      completed += 1;
    }
    this._releasePreviewUrls();
    await this.refreshItems({ silent: true });
    this.setStatus(`Uploaded ${completed} file${completed === 1 ? '' : 's'} successfully.`, 'success');
  }

  _renderEdit() {
    this.append(this.pane, new Heading({ level: 2, content: 'EDIT METADATA' }, this.deps));
    if (!this.items.length) {
      this.append(this.pane, new Paragraph({ content: 'No database gallery items are available.' }, this.deps));
      this._appendRefreshButton(this.pane);
      return;
    }

    const selectedId = this.editingId && this.items.some((item) => item.id === this.editingId)
      ? this.editingId
      : this.items[0].id;
    this.editingId = selectedId;
    const selector = this._select(
      this.pane,
      'ITEM',
      this.items.map(itemOption),
      selectedId,
      (value) => { this.editingId = value; this.renderActiveTab(); },
    );
    const item = this.items.find((candidate) => candidate.id === selector.getValue()) || this.items[0];

    const form = this.createElement('div', 'admin-editor-form-grid');
    const title = this._field(form, 'TITLE', item.title);
    const description = this._field(form, 'DESCRIPTION', item.description, { multiline: true, rows: 5 });
    const tags = this._field(form, 'TAGS', tagsToText(item.tags));
    const collection = this._field(form, 'COLLECTION', item.collection);
    const group = this._field(form, 'GROUP', item.group);
    const status = this._select(form, 'STATUS', [
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ], item.status || 'published');
    const displayMode = this._select(form, 'DISPLAY MODE', DISPLAY_MODES, item.displayMode);
    this.appendElement(this.pane, form);
    this._renderSuggestions(this.pane, collectTagSuggestions(this.items));

    if (item.previewUrl) {
      const preview = this.createElement('img', 'admin-gallery-preview');
      preview.src = item.previewUrl;
      preview.alt = item.title;
      this.appendElement(this.pane, preview);
    }

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'SAVE CHANGES',
      onClick: async () => {
        const response = await this._patchItem(item, {
          title: title.getValue(),
          description: description.getValue(),
          tags: parseTags(tags.getValue()),
          collection: collection.getValue(),
          gallerySlug: collection.getValue(),
          status: status.getValue(),
          metadataJsonb: mergeGalleryMetadata(item.metadataJsonb, {
            group: group.getValue(),
            displayMode: displayMode.getValue(),
          }),
        });
        await this._handleMutationResponse(response, 'Gallery item updated.');
      },
    }, this.deps));

    if (item.retained) {
      this.append(actions, new Button({
        text: 'RESTORE ITEM',
        onClick: async () => {
          try {
            await restoreGalleryItem(item.id);
            await this.refreshItems({ silent: true });
            this.setStatus('Gallery item restored.', 'success');
          } catch (error) {
            this.setStatus(error.message, 'error');
          }
        },
      }, this.deps));
      const purgeButton = this.append(actions, new Button({
        text: this.deleteArmedId === item.id ? 'CONFIRM PURGE' : 'PURGE NOW',
        onClick: async () => {
          if (this.deleteArmedId !== item.id) {
            this.deleteArmedId = item.id;
            this.setStatus('Press CONFIRM PURGE to permanently delete retained media.', 'warning');
            this.renderActiveTab();
            return;
          }
          try {
            await purgeGalleryItem(item.id);
            this.deleteArmedId = null;
            await this.refreshItems({ silent: true });
            this.setStatus('Retained media permanently deleted.', 'success');
          } catch (error) {
            this.setStatus(error.message, 'error');
          }
        },
      }, this.deps));
      purgeButton.element?.classList.add('is-destructive');
    } else {
      const deleteButton = this.append(actions, new Button({
        text: this.deleteArmedId === item.id ? 'CONFIRM DELETE' : 'DELETE ITEM',
        onClick: async () => {
          if (this.deleteArmedId !== item.id) {
            this.deleteArmedId = item.id;
            this.setStatus('Press CONFIRM DELETE to retain media for 30 days before permanent deletion.', 'warning');
            this.renderActiveTab();
            return;
          }
          try {
            await retainGalleryItem(item.id);
            this.deleteArmedId = null;
            await this.refreshItems({ silent: true });
            this.setStatus('Gallery item retained for 30 days.', 'success');
          } catch (error) {
            this.setStatus(error.message, 'error');
          }
        },
      }, this.deps));
      deleteButton.element?.classList.add('is-destructive');
    }
    this.appendElement(this.pane, actions);

    this._appendVersionHistory(item);
  }

  _appendVersionHistory(item) {
    return this.append(this.pane, new VersionHistoryPanel({
      resource: RESOURCE,
      recordId: item.id,
      currentVersion: item.version,
      currentSnapshot: item,
      onStatus: (message, tone) => this.setStatus(message, tone),
      onReverted: () => this.refreshItems({ silent: true }),
    }, this.deps));
  }

  async _handleMutationResponse(response, successMessage) {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const conflict = Number.isSafeInteger(data.currentVersion)
        ? ` The record moved to version ${data.currentVersion}; reload before saving again.`
        : '';
      this.setStatus(`${data.error || `Request failed: ${response.status}`}${conflict}`, 'error');
      return false;
    }
    await this.refreshItems({ silent: true });
    this.setStatus(successMessage, 'success');
    return true;
  }

  _renderOrganise() {
    this.append(this.pane, new Heading({ level: 2, content: 'ORGANISE GALLERY' }, this.deps));
    if (!this.organiseRows.length) {
      this.append(this.pane, new Paragraph({ content: 'No gallery records are available.' }, this.deps));
      this._appendRefreshButton(this.pane);
      return;
    }

    const collections = [...new Set(this.organiseRows.map((item) => item.collection))].sort();
    const currentCollection = collections[0];
    const collectionSelect = this._select(
      this.pane,
      'COLLECTION',
      collections.map((value) => ({ value, label: value })),
      currentCollection,
      () => this.renderActiveTab(),
    );
    const collection = collectionSelect.getValue();
    const rows = this.organiseRows
      .filter((item) => item.collection === collection)
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map((item) => ({
        ...item,
        preview: item.previewUrl,
        tagsText: tagsToText(item.tags),
      }));

    const table = this.append(this.pane, new FileTable({
      columns: [
        { key: 'selected', label: 'SELECT', type: 'checkbox' },
        { key: 'preview', label: 'PREVIEW', type: 'preview' },
        { key: 'title', label: 'TITLE', type: 'text' },
        { key: 'tagsText', label: 'TAGS', type: 'text' },
        { key: 'group', label: 'GROUP', type: 'text' },
      ],
      rows,
      onChange: (_rowId, _key, _value, nextRows) => {
        const byId = new Map(nextRows.map((row) => [row.id, row]));
        this.organiseRows = this.organiseRows.map((item) => {
          const changed = byId.get(item.id);
          return changed ? {
            ...item,
            ...changed,
            tags: parseTags(changed.tagsText),
          } : item;
        });
      },
    }, this.deps));

    const batch = this.createElement('div', 'admin-editor-form-grid');
    const batchTags = this._field(batch, 'ADD TAGS TO SELECTED', '');
    const batchGroup = this._field(batch, 'SET GROUP FOR SELECTED', '');
    const batchMode = this._select(batch, 'SET DISPLAY MODE', DISPLAY_MODES, 'standalone');
    this.appendElement(this.pane, batch);

    const actions = this.createElement('div', 'admin-editor-actions');
    this.append(actions, new Button({
      text: 'MOVE SELECTED UP',
      onClick: () => this._moveOrganiseSelection(collection, -1, table),
    }, this.deps));
    this.append(actions, new Button({
      text: 'MOVE SELECTED DOWN',
      onClick: () => this._moveOrganiseSelection(collection, 1, table),
    }, this.deps));
    this.append(actions, new Button({
      text: 'APPLY BATCH METADATA',
      onClick: async () => {
        const selected = this.organiseRows.filter((item) => item.collection === collection && item.selected);
        if (!selected.length) {
          this.setStatus('Select one or more gallery items.', 'error');
          return;
        }
        for (const item of selected) {
          const response = await this._patchItem(item, {
            tags: [...new Set([...parseTags(item.tags), ...parseTags(batchTags.getValue())])],
            metadataJsonb: mergeGalleryMetadata(item.metadataJsonb, {
              group: batchGroup.getValue() || item.group || '',
              displayMode: batchMode.getValue(),
            }),
          });
          if (!response.ok) {
            await this._handleMutationResponse(response, '');
            return;
          }
        }
        await this.refreshItems({ silent: true });
        this.setStatus(`Updated ${selected.length} selected item${selected.length === 1 ? '' : 's'}.`, 'success');
      },
    }, this.deps));
    this.append(actions, new Button({
      text: 'SAVE ORDER AND ROW EDITS',
      onClick: async () => this._saveOrganiseRows(collection),
    }, this.deps));
    this.appendElement(this.pane, actions);
  }

  _moveOrganiseSelection(collection, direction, table) {
    const collectionRows = this.organiseRows
      .filter((item) => item.collection === collection)
      .sort((a, b) => a.sortIndex - b.sortIndex);
    const selectedIds = collectionRows.filter((item) => item.selected).map((item) => item.id);
    if (!selectedIds.length) {
      this.setStatus('Select one or more rows before moving them.', 'error');
      return;
    }
    const moved = reorderSelectedRows(collectionRows, selectedIds, direction);
    const movedById = new Map(moved.map((item) => [item.id, item]));
    this.organiseRows = this.organiseRows.map((item) => movedById.get(item.id) || item);
    table.setRows(moved.map((item) => ({ ...item, preview: item.previewUrl, tagsText: tagsToText(item.tags) })));
    this.setStatus('Order changed locally. Use SAVE ORDER AND ROW EDITS to persist it.');
  }

  async _saveOrganiseRows(collection) {
    const rows = this.organiseRows
      .filter((item) => item.collection === collection)
      .sort((a, b) => a.sortIndex - b.sortIndex);
    for (let index = 0; index < rows.length; index += 1) {
      const item = rows[index];
      const response = await this._patchItem(item, {
        sortIndex: index,
        title: item.title,
        tags: parseTags(item.tagsText || item.tags),
        metadataJsonb: mergeGalleryMetadata(item.metadataJsonb, {
          group: item.group || '',
          displayMode: item.displayMode || 'standalone',
        }),
      });
      if (!response.ok) {
        await this._handleMutationResponse(response, '');
        return;
      }
    }
    await this.refreshItems({ silent: true });
    this.setStatus(`Saved order for ${rows.length} item${rows.length === 1 ? '' : 's'}.`, 'success');
  }

  _renderSystem() {
    this.append(this.pane, new Heading({ level: 2, content: 'GALLERY SYSTEM' }, this.deps));
    const collections = [...new Set(this.items.map((item) => item.collection))];
    const counts = {
      total: this.items.length,
      published: this.items.filter((item) => item.status === 'published').length,
      draft: this.items.filter((item) => item.status === 'draft').length,
      pending: this.items.filter((item) => item.thumbStatus === 'pending').length,
      failed: this.items.filter((item) => item.thumbStatus === 'failed').length,
      collections: collections.length,
      tags: collectTagSuggestions(this.items).length,
    };
    const list = this.createElement('dl', 'admin-system-grid');
    for (const [label, value] of Object.entries(counts)) {
      this.appendElement(list, this.createElement('dt', '', label.toUpperCase()));
      this.appendElement(list, this.createElement('dd', '', String(value)));
    }
    this.appendElement(this.pane, list);

    const actions = this.createElement('div', 'admin-editor-actions');
    this._appendRefreshButton(actions);
    this.append(actions, new Button({
      text: 'PROCESS PENDING THUMBNAILS',
      onClick: async () => {
        const response = await Auth.apiFetch('/api/admin/media/thumb', {
          method: 'POST',
          body: JSON.stringify({ limit: 25 }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          this.setStatus(data.error || `Thumbnail request failed: ${response.status}`, 'error');
          return;
        }
        const data = await response.json();
        await this.refreshItems({ silent: true });
        this.setStatus(`Thumbnail worker processed ${data.processed || 0} item${data.processed === 1 ? '' : 's'}.`, 'success');
      },
    }, this.deps));
    this.appendElement(this.pane, actions);

    this.append(this.pane, new Paragraph({
      content: 'Grouping and display mode are stored with each item. Public carousel and slideshow rendering remains a separate presentation task.',
    }, this.deps));
  }

  _appendRefreshButton(parent) {
    return this.append(parent, new Button({
      text: 'REFRESH DATABASE',
      onClick: () => this.refreshItems(),
    }, this.deps));
  }

  _releasePreviewUrls() {
    for (const url of this.previewUrls) URL.revokeObjectURL(url);
    this.previewUrls.clear();
  }

  destroy() {
    this._releasePreviewUrls();
    this.items = [];
    this.uploadRows = [];
    this.organiseRows = [];
    this.posterFiles = [];
    super.destroy();
  }
}
