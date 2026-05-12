# MFP Blender Remake — Coverage Gate

## 1. Purpose

This file defines the gate for claiming 100% remake coverage.

100% coverage does not mean every feature is implemented. It means every current feature is:

```text
identified
mapped
assigned
specified
covered or explicitly deferred
```

## 2. Required Coverage Files

| Area | File |
|------|------|
| System overview | `00-overview.md` |
| MFP to Blender mapping | `01-mfp-to-blender-map.md` |
| SOURCE grid | `02-source-calibration-grid.md` |
| SCAN data | `03-scan-and-calibration-data.md` |
| QUANTIZE geometry | `04-quantize-to-geometry.md` |
| Blender node system | `05-blender-node-system.md` |
| nozzleboss export | `06-nozzleboss-print-export.md` |
| Roadmap | `07-roadmap-and-open-questions.md` |
| Full parity map | `08-full-parity-map.md` |
| UI/action map | `09-ui-controls-and-actions.md` |
| Data/file schemas | `10-data-schemas-and-file-formats.md` |
| Algorithm parity | `11-algorithm-parity.md` |
| Coverage gate | `12-coverage-gate.md` |

## 3. Coverage Checklist

### Documentation Coverage

- [ ] `multifilament-print.md` mapped.
- [ ] `MFP/source.md` mapped.
- [ ] `MFP/scan.md` mapped.
- [ ] `MFP/quantize.md` mapped.
- [ ] Known missing dedicated EXPORT doc compensated by implementation audit.

### Implementation Coverage

- [ ] `MFP-Main.js` controls mapped.
- [ ] `MFP-Constants.js` defaults/palette mapped.
- [ ] `MFP-SourceActions.js` actions/import/export mapped.
- [ ] `MFP-ScanActions.js` scan/import/analyse/export mapped.
- [ ] `MFP-QuantizeActions.js` quantise/optimise/export mapped.
- [ ] `MFP-ExportActions.js` outputs/STL/package mapped.
- [ ] `MFP-GridRenderer.js` rendering mapped or deferred.
- [ ] `MFP-ScanRenderer.js` rendering mapped or deferred.
- [ ] `MFP-Utils.js` helper maths mapped.
- [ ] `ProjectStatusBar.js` mapped or deferred.

### Algorithm Coverage

- [ ] Sequence generation conflict resolved.
- [ ] Sort methods exact.
- [ ] Grid layout exact.
- [ ] Constraint maths exact.
- [ ] Colour simulation conflict resolved.
- [ ] Scan quad sampling exact.
- [ ] Deviation/statistics exact.
- [ ] Quantize colour spaces exact.
- [ ] Dither algorithms exact.
- [ ] Form optimisation exact.
- [ ] Cluster simplification exact.
- [ ] Palette merge exact.
- [ ] Min detail conflict resolved.
- [ ] STL fallback algorithms documented.
- [ ] nozzleboss translation specified.

### File Format Coverage

- [ ] `grid-layout.json`.
- [ ] legacy `grid-config.json`.
- [ ] CSV import/export.
- [ ] GPL palette.
- [ ] quantization config JSON.
- [ ] comparison CSV.
- [ ] analysis JSON.
- [ ] grid alignment JSON.
- [ ] quantized sequence map JSON.
- [ ] complete project ZIP.
- [ ] STL outputs.
- [ ] PNG outputs.

### Blender Remake Coverage

- [ ] Every current UI control has a Blender equivalent or deferral.
- [ ] Every current state field has a storage owner.
- [ ] Every output artefact has an export owner.
- [ ] Every current algorithm has GN/Python/nozzleboss ownership.
- [ ] Every conflict has a decision.
- [ ] Every deferred item has a reason.

## 4. Hard Conflicts Blocking 100%

These must be resolved before claiming final parity:

1. Sequence model: documented `c^v` vs implemented valid-stack enumeration.
2. Colour model: documented multiplicative transmittance vs implemented RGB averaging.
3. Defaults: docs vs `DEFAULTS`.
4. Min detail: docs noise threshold vs implementation physical tile size plus separate cluster controls.
5. Blue Noise: UI option vs observed fallback behaviour.
6. Top layers: UI exists, docs call it reserved/future.
7. SCAN in Blender: import-only first or full scan-analysis remake?
8. STL/nozzleboss: preserve STL pipeline or replace with explicit path export?

## 5. Parity Decision Format

Every conflict should be recorded as:

```text
Conflict:
Current docs:
Current implementation:
Blender decision:
Reason:
Affected files:
Test:
```

## 6. Definition Of Done

The MFP Blender remake documentation reaches 100% coverage when:

- all checklist boxes above are complete;
- every table row in `08-full-parity-map.md` has final status;
- every conflict in section 4 has a decision;
- every implementation module has been inspected fully;
- every action/control/file format has a testable Blender equivalent or explicit deferral.

