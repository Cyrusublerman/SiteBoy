# Archive Reference Material

The archive is a read-only copy of every input used to document a generator. It preserves the state of source files and legacy docs at migration time so that future readers can reconstruct what was available when the pack was written. The archive is stored in `reference/generators/` which is excluded from the git repository (`.gitignore` entry: `reference/`).

---

## 1. What to Archive

### 1.1 Live script

Copy the generator's `.gen.js` file to:
```
reference/generators/<id>/source/<filename>.gen.js
```

Example: `reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js`

The source folder should contain exactly one file: the live script. Do not archive compiled or bundled output.

### 1.2 Legacy docs

Copy every legacy file listed for this generator to:
```
reference/generators/<id>/legacy-docs/<filename>
```

Examples:
- `reference/generators/fibonacci-balls/legacy-docs/fibonacci-balls-audit.md`
- `reference/generators/lissajous/legacy-docs/lissajous.md`
- `reference/generators/lissajous/legacy-docs/lissajous-audit.md`

The legacy-docs folder may contain any number of files (zero is valid). Archive every file listed in the LEGACY map for this generator, provided the file exists on disk.

### 1.3 What else to archive

If a generator has any of the following that are not already covered above, archive them in `legacy-docs/`:
- Standalone README files specific to the generator (e.g. `GENERATOR-TOOL-README.md`)
- Previous implementation files if they exist in an old-docs location
- Any design brief, mood board, or reference image linked from a spec (images go in the same `legacy-docs/` folder)

---

## 2. File Naming

**Rule: do not rename files.** Keep the original filename exactly. Future readers use filenames to locate files in the live project tree — renaming breaks that link.

**Exception — filename collision:** if two legacy files from different source paths share the same filename, prefix the copy with a sanitised version of the containing folder name.

Example: if both `Audits/lissajous.md` and `Art/lissajous.md` exist, archive as:
- `legacy-docs/Audits__lissajous.md`
- `legacy-docs/Art__lissajous.md`

Record the original path of each file in `migration-log.md` so the renamed copy can be traced back.

---

## 3. When a Listed File Does Not Exist

If a LEGACY path references a file that does not exist on disk at migration time:

1. Note it in `migration-log.md`: "Listed legacy file `<path>` was not found on disk at migration time."
2. Note it in `source-reference.md` under "Legacy Docs Archived": "not found"
3. Do not create a placeholder
4. Do not omit the entry — record the absence explicitly

A listed-but-missing file may indicate the file was deleted, moved, or the LEGACY map has an error. The documentation programme does not resolve this — it records it.

---

## 4. What to Record in migration-log.md

For every archived file, record:
- The full original relative path (from the repository root)
- The archive destination path
- The classification assigned (from `classify-reference-material.md`)
- Whether the file was found (`found` / `not found`)

Example migration-log.md archive section:

```markdown
## Archive Outputs

| Original path | Archive destination | Class | Status |
| --- | --- | --- | --- |
| `assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js` | `reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js` | functional source/reference tool | found |
| `blog/docs/pages/art/generative/fibonacci-balls.md` | `reference/generators/fibonacci-balls/legacy-docs/fibonacci-balls.md` | page doc | not found |
```

---

## 5. Handling Contradictions Between Legacy Docs and Live Source

When a legacy doc describes a feature or parameter that contradicts the live source:

**Do not resolve the contradiction.** Do not pick one side and treat it as authoritative. Record both sides.

In `feature-parity.md`:
```
| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Preset count: 5 | spec.md | Changed: 3 presets in live source | Spec describes 5 presets; live source has 3. Contradiction unresolved. |
```

In `issues-and-conflicts.md`:
```
[NOTE] [PARITY] Feature count mismatch between spec and live source
Location: SCRIPT_CONFIG.presets
Evidence: spec.md describes 5 presets; live source has Classic, Bouncy, Dense (3 total)
Impact: Two presets described in spec are absent from live source; their visual intent is unknown
```

The contradiction is a documentation finding, not a problem to fix during the documentation programme.

---

## 6. What NOT to Archive

Do not archive:
- The 8 pack files you are writing (these are outputs, not inputs)
- Intermediate notes or scratch files produced during the documentation process
- Files from other generators (the archive for `fibonacci-balls` contains only fibonacci-balls material)
- The guides, templates, or root authority docs from this documentation system (they live in `blog/docs/`, not in the archive)
- Compiled, minified, or bundled JavaScript

The archive is read-only input material. It captures the state of available information at migration time. It is not a working directory and must not be modified after migration is complete.

---

## 7. Archive Structure Reference

```
reference/
  generators/
    <id>/
      source/
        <id>.gen.js          ← exactly one file
      legacy-docs/
        <file1>.md           ← zero or more files
        <file2>.md
    <id2>/
      source/
        <id2>.gen.js
      legacy-docs/
        (empty if no legacy docs)
```

The `reference/` directory is excluded from git by `.gitignore`. It exists only on local machines. When another developer needs to reproduce the documentation work, they reconstruct the archive from the LEGACY map and the live scripts — or they use the migration-log.md to understand what was available at the original migration time.
