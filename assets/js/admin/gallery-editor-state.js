import { GalleryEditor } from './gallery-editor.js';

const originalSelect = GalleryEditor.prototype._select;

if (!GalleryEditor.prototype.__collectionStatePatched) {
  Object.defineProperty(GalleryEditor.prototype, '__collectionStatePatched', {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  GalleryEditor.prototype._select = function patchedSelect(parent, label, options, value, onChange) {
    if (label !== 'COLLECTION' || this.activeTab !== 'organise') {
      return originalSelect.call(this, parent, label, options, value, onChange);
    }

    const allowedValues = options.map((option) => option.value || option);
    if (!allowedValues.includes(this.organiseCollection)) {
      this.organiseCollection = allowedValues.includes(value) ? value : (allowedValues[0] || '');
    }

    return originalSelect.call(
      this,
      parent,
      label,
      options,
      this.organiseCollection,
      (nextValue, event) => {
        this.organiseCollection = nextValue;
        onChange?.(nextValue, event);
      },
    );
  };
}
