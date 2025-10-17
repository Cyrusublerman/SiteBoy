# Synthetic Biophilia — Image Assets Processing

This is a quick, copy-paste guide for generating web + thumbnail images and a manifest, and how to embed them with zoom.

## 1) Batch process images into a bundle

Source images go in:
- `reference/images to process/`

Two ways to process:

### A) One-shot CLI (recommended)

```bash
python gallery-bundle-processor/batch_process.py \
  --input "reference/images to process" \
  --bundle synthetic-biophilia \
  --output gallery-bundle-processor/output
```

Outputs:
- `gallery-bundle-processor/output/synthetic-biophilia/originals/*.jpg`
- `gallery-bundle-processor/output/synthetic-biophilia/web/*.jpg` (max 2400px)
- `gallery-bundle-processor/output/synthetic-biophilia/thumbs/*.jpg` (max 800px)
- `gallery-bundle-processor/output/synthetic-biophilia/manifest.json`

Then copy into canonical project assets:

```bash
mkdir -p "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/{thumbs,web}"
cp gallery-bundle-processor/output/synthetic-biophilia/thumbs/*.jpg "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/"
cp gallery-bundle-processor/output/synthetic-biophilia/web/*.jpg "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web/"
```

### B) Streamlit UI (manual)

```bash
cd gallery-bundle-processor
streamlit run app.py
```
- Upload files, set Bundle ID (e.g., `synthetic-biophilia`), then “Process and Save Bundle”.

## 2) Embed images with zoom

### A) Markdown inline (auto-zoom on click)

```markdown
![](projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/closed 169 top.jpg)
```

Any inline <img> inside markdown will open the Lightbox on click.

### B) ComponentLibrary image with zoom

```js
const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
const img = new window.ComponentLibrary.Image({
  src: 'projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/closed 169 top.jpg',
  caption: 'Top view',
  size: 'm',
  enableZoom: true
}, deps);
container.appendChild(img.render());
```

Tip: If you want the zoom to show the 2400px version while the page shows the 800px thumb, set `data-fullsrc` on the <img> and customize the click handler (ask to wire this if needed).

## 3) File naming notes

- Spaces are preserved; the processor outputs `.jpg` derived from the original base name.
- Prefer short, descriptive names; avoid special characters where possible.

## 4) Maintenance

- Re-run the CLI whenever new images are added to `reference/images to process/`.
- Bundles are safe to re-generate; files are overwritten.



