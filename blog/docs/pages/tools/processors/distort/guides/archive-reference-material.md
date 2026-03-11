# Archive Reference Material

The archive is a read-only copy of every input used to document a module. It preserves the state of source files and legacy docs at migration time so future readers can reconstruct what was available when the pack was written. The archive is stored in `reference/distort/` which is excluded from the git repository (`.gitignore` entry: `reference/`).

---

## 1. What to Archive

### 1.1 Live source node

Copy the module's `*Node.js` file to:
```
reference/distort/<type>/source/<ClassName>Node.js
```

Example: `reference/distort/gaussblur/source/GaussianBlurNode.js`

The source folder should contain exactly one file: the live node. Do not archive compiled or bundled output.

### 1.2 Component-level doc

Copy the component-level module doc to:
```
reference/distort/<type>/legacy-docs/<type>.md
```

Example: `reference/distort/gaussblur/legacy-docs/gaussblur.md`

This is always present (all 69 modules have component-level docs in `blog/docs/components/distort/modules/`).

### 1.3 Other legacy docs

If a module has any of the following not covered above, archive them in `legacy-docs/`:
- Previous implementation files at an old-docs location
- Standalone README files specific to this module
- Any design brief or spec written for the module
- Audit files specific to this module

---

## 2. File Naming

**Rule: do not rename files.** Keep the original filename exactly. Future readers use filenames to locate files in the live project tree.

**Exception — collision:** if two legacy files from different source paths share the same filename, prefix the copy with a sanitised version of the containing folder name.

Example: if both `components/gaussblur.md` and `audit/gaussblur.md` exist, archive as:
- `legacy-docs/components__gaussblur.md`
- `legacy-docs/audit__gaussblur.md`

Record the original path of each file in `migration-log.md` so the renamed copy can be traced back.

---

## 3. When a Listed File Does Not Exist

If a reference path points to a file that does not exist on disk:

1. Note in `migration-log.md`: "Listed file `<path>` was not found on disk at migration time."
2. Note in `source-reference.md` under "Legacy Docs Archived": "not found"
3. Do not create a placeholder
4. Record the absence explicitly — do not omit the entry

A missing file may indicate deletion, a move, or an error in the reference map. The documentation programme records it — does not resolve it.

---

## 4. What to Record in migration-log.md

For every archived file, record:
- Full original relative path (from repository root)
- Archive destination path
- Classification assigned (from `classify-reference-material.md`)
- Whether the file was found (`found` / `not found`)

Example migration-log.md archive section:

```markdown
## Archive Outputs

| Original path | Archive destination | Class | Status |
| --- | --- | --- | --- |
| `assets/js/tools/processors/distort/nodes/blur/GaussianBlurNode.js` | `reference/distort/gaussblur/source/GaussianBlurNode.js` | functional source node | found |
| `blog/docs/components/distort/modules/gaussblur.md` | `reference/distort/gaussblur/legacy-docs/gaussblur.md` | component-level doc | found |
```

---

## 5. Handling Contradictions

When the component-level doc and the live source node contradict each other:

**Do not resolve the contradiction.** Record both sides.

In `feature-parity.md`:
```
| Param | Component doc | Live source | Status | Notes |
| --- | --- | --- | --- | --- |
| sigma default | 1.4 | 2.0 | Changed | Doc and source disagree on default. Contradiction unresolved. |
```

In `issues-and-conflicts.md`:
```
[WARN] [CONFLICT] Default value mismatch: sigma
Location: paramDefs.sigma.default in GaussianBlurNode.js
Evidence: component doc states sigma default 1.4; source has default 2.0
Impact: the intended default is ambiguous; UI will show 2.0
```

---

## 6. What NOT to Archive

Do not archive:
- The 8 pack files you are writing (outputs, not inputs)
- Intermediate notes or scratch files produced during documentation
- Files from other modules (gaussblur archive contains only gaussblur material)
- The guides, templates, or root authority docs from this system (they live in `blog/docs/`)
- Compiled, minified, or bundled JavaScript

The archive is read-only input material capturing the state of available information at migration time.

---

## 7. Archive Structure Reference

```
reference/
  distort/
    README.txt                          ← manifest
    pre-restructure/                    ← full pre-programme snapshot
      components/
      guides/
      checklists/
    <type>/                             ← per-module archive
      source/
        <ClassName>Node.js              ← exactly one file
      legacy-docs/
        <type>.md                       ← component-level doc copy
        <other>.md                      ← any other legacy docs
    <type2>/
      source/
        <ClassName2>Node.js
      legacy-docs/
        (empty if no additional legacy docs)
```

The `reference/` directory is excluded from git by `.gitignore`. It exists only on local machines. When another developer needs to reproduce the documentation work, they reconstruct from the live source and the migration-log.md.
