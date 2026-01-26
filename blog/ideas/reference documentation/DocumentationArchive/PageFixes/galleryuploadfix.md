# CANVAS — IMAGE MANAGEMENT PAGE (UX SPEC)

---

# DESIGN SPEC (TOOL_CONFIG — TOOL_BASE FORMAT)

```tool_config
TOOL_CONFIG:
  title: 'GALLERY UPLOADER'
  sidebar: [
    ['UPLOAD', [
      ['Set', [
        ['dropdown', 'Set ID (existing)', [], { key: 'setSelect', value: '' }],
        ['text', 'New/Existing Set ID', '', { key: 'setId', placeholder: 'my-gallery', pattern: '^[a-z0-9-]+$' }]
      ]],
      ['Items', [
        ['text', 'Item IDs (comma)', '', { key: 'itemIds', placeholder: 'img-01,img-02', pattern: '^[a-z0-9-]+(,[a-z0-9-]+)*$' }],
        ['file', 'Files', 'image/*', { key: 'files', multiple: true, buttonText: 'Choose Files' }],
        ['text', 'Alt Text', '', { key: 'alt', placeholder: 'Describe the images' }],
        ['text', 'Tags', '', { key: 'tags', placeholder: 'tag-a,tag-b' }],
        ['text', 'Category', '', { key: 'category' }],
        ['text', 'Group ID', '', { key: 'groupId' }],
        ['number', 'Group Order', 0, 9999, 1, { key: 'groupOrder', value: 0 }],
        ['text', 'Date Taken', '', { key: 'dateTaken', placeholder: 'YYYY-MM-DD' }],
        ['textarea', 'Description', '', { key: 'description', rows: 3 }],
        ['text', 'Credit', '', { key: 'credit' }],
        ['text', 'License', '', { key: 'license', placeholder: 'CC-BY, All Rights Reserved' }],
        ['textarea', 'Markdown Text (optional)', '', { key: 'markdownText', rows: 4 }]
      ]],
      ['Processing', [
        ['number', 'Thumb Width', 64, 1600, 1, { key: 'thumbWidth', value: 320, withNumber: true }],
        ['number', 'Thumb Quality', 10, 100, 1, { key: 'thumbQuality', value: 72, withNumber: true }],
        ['number', 'Web Width', 320, 4000, 1, { key: 'webWidth', value: 1600, withNumber: true }],
        ['number', 'Web Quality', 10, 100, 1, { key: 'webQuality', value: 82, withNumber: true }],
        ['number', 'Zoom Width', 800, 6000, 1, { key: 'zoomWidth', value: 2400, withNumber: true }],
        ['number', 'Zoom Quality', 10, 100, 1, { key: 'zoomQuality', value: 90, withNumber: true }],
        ['toggle', 'Zoom Variant', ['Enabled'], { key: 'zoomEnabled', selectedValues: ['Enabled'] }],
        ['toggle', 'Processing Options', ['Auto Orient', 'Strip EXIF', 'Sharpen'], { key: 'procOptions', selectedValues: ['Auto Orient', 'Strip EXIF'] }]
      ]],
      ['Submission', [
        ['text', 'Cache-Control', 'public, max-age=31536000', { key: 'cacheControl' }],
        ['radio', 'Dry Run?', ['Yes', 'No'], { key: 'dryRun', selectedValue: 'Yes' }],
        ['radio', 'Replace Existing?', ['No', 'Yes'], { key: 'replace', selectedValue: 'No' }],
        ['button', 'Submit Upload', null, { key: 'submitUpload' }]
      ]],
      ['Status / Log', [
        ['label', 'STATUS / LOG', { variant: 'heading', key: 'logHeading' }],
        ['textarea', 'Log', '', { key: 'log', rows: 8, disabled: true }]
      ]]
    ]],

    ['EDIT', [
      ['Markdown', [
        ['text', 'Item ID', '', { key: 'detailId', placeholder: 'item-01' }],
        ['textarea', 'Markdown Text', '', { key: 'detailMarkdown', rows: 6 }],
        ['button', 'Save Markdown', null, { key: 'saveMarkdown' }]
      ]],
      ['Bulk Meta', [
        ['text', 'Target IDs (comma)', '', { key: 'bulkIds', placeholder: 'item-01,item-02' }],
        ['text', 'Tags', '', { key: 'bulkTags' }],
        ['text', 'Category', '', { key: 'bulkCategory' }],
        ['text', 'Group ID', '', { key: 'bulkGroupId' }],
        ['number', 'Group Order', 0, 9999, 1, { key: 'bulkGroupOrder', value: 0 }],
        ['button', 'Update Meta', null, { key: 'updateMeta' }]
      ]],
      ['Regenerate / Delete', [
        ['button', 'Regenerate Variants', null, { key: 'regenerate' }],
        ['button', 'Delete Items', null, { key: 'deleteItems' }]
      ]]
    ]],

    ['ORGANISE', [
      ['Manifest', [
        ['label', 'MANIFEST VIEW', { variant: 'heading', key: 'manifestHeading' }],
        ['textarea', 'Manifest', '', { key: 'manifestList', rows: 12, disabled: true }],
        ['button', 'Refresh Manifest', null, { key: 'refreshManifest' }]
      ]]
    ]],

    ['SYSTEM', [
      ['Access', [
        ['label', 'Gating', { variant: 'status', key: 'gateStatus' }],
        ['label', 'Host/Env Flags', { variant: 'body', key: 'gateDetail' }]
      ]],
      ['Diagnostics', [
        ['textarea', 'Log Mirror', '', { key: 'logMirror', rows: 8, disabled: true }]
      ]]
    ]]
  ]

  canvas:
    size: 0           # No drawing surface; keep 0/omitted to rely on layout only

  behaviour:
    routing: "#tools/gallery-uploader"
    gating:
      host: localhost/lan (loopback, 10.x/192.168.x/172.16-31, .local/.lan)
      flag: GALLERY_UPLOAD_LOCAL (default allow if unset; truthy required when present)
    api:
      upload: POST /api/gallery-upload/upload
      sets: GET /api/gallery-upload/sets
      manifest: GET /api/gallery-upload/sets/{setId}/manifest
      bulkMeta: POST /api/gallery-upload/bulk-meta
      regenerate: POST /api/gallery-upload/regenerate
      delete: POST /api/gallery-upload/delete
      markdown: POST /api/gallery-upload/markdown
    validation:
      setId: required kebab-case
      itemIds: required kebab-case; count must equal file count when files present
      alt: required
      cacheControl: default "public, max-age=31536000"
      dryRun: default Yes
      replace: default No
    states:
      loading: sets | manifest | upload/bulk ops
      success: append log, refresh manifest if returned
      error: append log + inline status
      mock: allow fallback manifest/ops if API unavailable
    submission:
      formData: when files provided
      json: when metadata-only
      manifestUpdate: apply response manifest if provided
    layout:
      tabsMax: 4 (UPLOAD, EDIT, ORGANISE, SYSTEM)
      sidebarWidth: 30F; control height 2F; gaps F/F2; block padding F
```

---

# PAGE

**Purpose:** Tool for adding, editing, organising, and maintaining all images in the site gallery.
**Top-Level Navigation:**

* **UPLOAD**
* **EDIT**
* **ORGANISE**
* **SYSTEM**

Each tab represents a distinct mental model and prevents workflow contamination.

---

# TAB: UPLOAD

**Goal:** Add single or batch images quickly; apply metadata efficiently; create groups (carousels) with minimal friction.

---

## BLOCK: FILE INTAKE

**Modules:** DropZone, FileTable
**UX:**

* Drag files → table appears.
* Table columns (editable):

  * Select
  * Preview
  * AutoID
  * Alt
  * Tags
  * Category
  * Group
  * Date
  * IncludeToggle
    **Benefits:** Full batch visibility; row-level specificity; multi-select editing.

---

## BLOCK: BATCH DEFAULTS

**Modules:** DefaultTags, DefaultCategory, DefaultCredit, DefaultLicense, DefaultDate, DefaultGroup
**UX:**

* Defaults apply to selected rows OR to empty fields.
* Reduces repetitive entry.
* Ensures metadata consistency.

---

## BLOCK: GROUPING

**Modules:** CreateCarouselGroup, AddToExistingGroup
**UX:**

* “Create carousel from selection” → new group ID auto-created.
* “Add to existing group” → dropdown suggestions.
  **Benefit:** Groups become primary workflow objects, not hidden attributes.

---

## BLOCK: TAG SUGGESTIONS

**Modules:** SuggestTags
**UX:** Suggest tags from:

* Existing gallery tags
* Recent session tags
* Set-related tags
  **Benefit:** Metadata consistency without imposing rules.

---

## BLOCK: SET CONTEXT

**Modules:** SetSelector, NewSetInput
**UX:**

* Choose existing set OR create new set.
* AutoID generation tied to set.
  **Benefit:** Keeps gallery structure coherent.

---

## BLOCK: VARIANT & PROCESSING (COLLAPSIBLE)

**Modules:** VariantThumb, VariantWeb, VariantZoom, ProcessingOptions
**UX:**

* Collapsed by default.
* Only override when necessary.
  **Benefit:** Keeps upload workflow uncluttered.

---

## BLOCK: SUBMISSION

**Modules:** SummaryPanel, Submit
**UX:**

* Summary lists: number of items, new groups, missing fields.
* Submit after confirmation.
  **Benefit:** Prevents accidental incomplete uploads.

---

# TAB: EDIT

**Goal:** Modify existing items individually or in bulk with immediate visual and contextual feedback.

---

## BLOCK: GALLERY BROWSER

**Modules:** GalleryGrid, Filters
**UX:**

* Grid of thumbnails, multi-select enabled.
* Filters by tag, category, group, set, text, date.
  **Benefit:** Rapid narrowing of items to edit.

---

## BLOCK: EDIT SIDEBAR

**Modules:** SingleItemPanel, MultiItemPanel
**UX Logic:** Context-sensitive.

### Single-item:

* Alt
* Tags
* Category
* Description
* Credit
* License
* Date
* ReplaceFile
* MarkdownEditor

### Multi-item:

* AddTags
* RemoveTags
* ChangeCategory
* AssignGroup
* ClearGroup
* BulkReplaceFiles

**Benefit:** Shows only what is relevant for the selection size.

---

## BLOCK: CONFIRMATION

**Modules:** EditSummary, ApplyChanges
**UX:**

* Summarises all edits before applying.
* Protects against mis-clicked bulk edits.

---

# TAB: ORGANISE

**Goal:** Manage carousels and grouped images; reorder items visually; build sequences efficiently.

---

## BLOCK: GROUP LIST

**Modules:** GroupList, GroupPreview
**UX:**

* Left-side list of all groups.
* Each entry shows name, count, tiny preview strip.
  **Benefit:** Mental map of gallery structure.

---

## BLOCK: GROUP EDITOR

**Modules:** GroupImageList, Reorder, AddImages, RemoveImages, RenameGroup, UngroupAll, SlideshowToggle
**UX:**

* Drag-and-drop ordering.
* Insert/remove items visually.
* Rename group inline.
* Ungroup all (clearly separated destructive action).
  **Benefit:** Visual-first editing for inherently spatial tasks.

---

## BLOCK: BULK GROUP TOOLS

**Modules:** AutoGroupByFilename, AutoGroupBySequence, MergeGroups, SplitGroup
**UX:**

* Automates grouping for large batches with consistent naming.
  **Benefit:** Massive timesaver for imported folders.

---

# TAB: SYSTEM

**Goal:** Perform maintenance, validation, rebuilding, and deletions safely and intentionally.

---

## BLOCK: MANIFEST

**Modules:** RefreshManifest, ValidateManifest, ManifestSummary
**UX:**

* Manual manifest refresh.
* Validation report (orphans, missing metadata).
* Summary table.
  **Benefit:** Transparency into system state.

---

## BLOCK: VARIANTS

**Modules:** RebuildAllVariants, RebuildSetVariants
**UX:**

* Accessible but siloed.
  **Benefit:** Prevents accidental heavy operations during upload.

---

## BLOCK: DELETION

**Modules:** DeleteItems, DeleteGroups
**UX:**

* Requires typed confirmation.
* Shows exact items affected.
  **Benefit:** Maximum safety for destructive actions.

---

## BLOCK: CACHE

**Modules:** CacheControl, CacheReset
**UX:**

* Cache-control policy editing.
* Optional full cache reset.
  **Benefit:** Visibility into caching without mixing with upload flows.

---

# GLOBAL UX PRINCIPLES

* Clear mental modes: Tabs divide intent.
* Batch-first design: Multi-select everywhere.
* Metadata ergonomics: Defaults, suggestions, bulk edit.
* Visual grouping: Groups managed through thumbnails, not text-only lists.
* Progress & safety: Summary panels before destructive or irreversible actions.
* Minimal cognitive drag: Advanced controls collapsed; only surfaced when needed.

---

# OUTCOME

Defines UX structure for:

* Adding images at scale
* Editing metadata flexibly
* Creating and managing slideshows/carousels
* Maintaining manifest and variants safely
