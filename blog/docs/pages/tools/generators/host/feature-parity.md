# Host — Feature Parity

---

## v4 Review (2026-04-23)

### Host Contract Table

| cap_id | category | name | evidence | notes |
|---|---|---|---|---|
| HC-01 | lifecycle | host owns generator lifecycle and script switching | blog/docs/pages/tools/generators/tool.md:16-21 | script selection + host lifecycle owner |
| HC-02 | param-system | sidebar tabs contract (`PARAMS`, `ANIMATE`, `EXPORT`, `INFO`) | blog/docs/pages/tools/generators/tool.md:41-45 | documented host-generated tab set |
| HC-03 | param-system | `PARAMS` assembled from `scriptConfig.parameters` | blog/docs/pages/tools/generators/tool.md:49-57 | no script-owned sidebar DOM |
| HC-04 | render-mode | FIT/FILL/ACTUAL are viewport transforms only | blog/docs/pages/tools/generators/tool.md:74-84 | zoom/pan separated from render |
| HC-05 | lifecycle | animation runtime surfaces when animation exists | blog/docs/pages/tools/generators/tool.md:59-73 | animate tab + playback + export support |
| HC-06 | export | toolbar export always present; static export must work | blog/docs/pages/tools/generators/tool.md:100-108 | host-level export responsibility |
| HC-07 | host-utility | context contract supports `draw` for `2d/webgl`, `p5Draw` for `p5` | blog/docs/pages/tools/generators/tool.md:85-97,111-118 | per-generator minimum |
| HC-08 | compute-tier | heavy pixel paths should use compute/worker path | blog/docs/pages/tools/generators/tool.md:93-95 | documented decision rule |

### Host Implementation Table

| cap_id | category | name | evidence | notes |
|---|---|---|---|---|
| HI-01 | lifecycle | script loading/switch lifecycle orchestrated by `_loadScript` | assets/js/tools/generators/core/generative-tool-host.js:179-324 | stop old loop, destroy tool/scheduler, load new config |
| HI-02 | param-system | sidebar tabs built as `PARAMS`, optional `ANIMATE`, and `CANVAS` | assets/js/tools/generators/core/parameter-builder.js:20-35 | no sidebar `EXPORT` or `INFO` tab |
| HI-03 | param-system | `PARAMS` tab auto-built from `scriptConfig.parameters` groups | assets/js/tools/generators/core/parameter-builder.js:42-71 | presets/randomise/reset prepended |
| HI-04 | render-mode | display mode handlers route to viewport transform logic | assets/js/tools/generators/core/generative-tool-host.js:669-677,556-589 | p5 path uses CSS transform; non-p5 delegates ToolBase |
| HI-05 | lifecycle | animation lifecycle managed by `AnimationLoop` and play/pause/stop handlers | assets/js/tools/generators/core/generative-tool-host.js:1004-1121 | frame stepping + phase animation updates |
| HI-06 | export | toolbar export routes to static snapshot or animation exporter | assets/js/tools/generators/core/generative-tool-host.js:684-778 | static `toBlob`; animation exporter integration |
| HI-07 | host-utility | draw dispatch chooses `p5Draw` for p5 scripts else `draw(ctx,canvas,params,frame)` | assets/js/tools/generators/core/generative-tool-host.js:1197-1225 | context-aware render path |
| HI-08 | compute-tier | compute scheduling supports coalesce, adaptive scale, worker offload | assets/js/tools/generators/core/generative-tool-host.js:288-301; assets/js/tools/generators/core/compute-scheduler.js:1-337 | script-declared `compute` contract path |
| HI-09 | contract-schema | script type validation enforces context-specific hooks | assets/js/tools/generators/core/script-types.js:166-186 | requires `p5Draw` for p5, `draw` for 2d/webgl |

### Host Diff Table

| contract_id | contract_name | impl_match | status | impl_evidence | decision | severity |
|---|---|---|---|---|---|---|
| HC-01 | host owns lifecycle | HI-01 | present | generative-tool-host.js:179-324 | none | — |
| HC-02 | documented sidebar tab set | HI-02 | partial | parameter-builder.js:20-35 | fix doc | P1 |
| HC-03 | params assembled from script contract | HI-03 | present | parameter-builder.js:42-71 | none | — |
| HC-04 | viewport transform display modes | HI-04 | present | generative-tool-host.js:556-589,669-677 | none | — |
| HC-05 | animation runtime support | HI-05 | partial | generative-tool-host.js:264-277,1004-1121 | fix doc | P2 |
| HC-06 | host-level export surface | HI-06 | present | generative-tool-host.js:684-778 | none | — |
| HC-07 | context draw hook contract | HI-07, HI-09 | present | generative-tool-host.js:1197-1225; script-types.js:166-186 | none | — |
| HC-08 | compute/worker path for heavy scripts | HI-08 | present | generative-tool-host.js:288-301; compute-scheduler.js:1-337 | none | — |

### Library Hygiene Report (host)

**Shared-library usage**
- Host composes through owner modules (`parameter-builder`, `script-registry`, `presets`, `compute-scheduler`) and shared components (`GeneratorToolbar`, `AnimationExport`, `P5Canvas`).

**Foundation usage**
- Uses `AnimationFoundation.AnimationLoop` for host playback loop.
- Uses `ComputeScheduler` as single scheduling owner for tiered compute path.

**Architecture risks**
- Host performs direct DOM operations (`document.*`, `.innerHTML`, `createElement`) outside BaseComponent internals.

**Issues logged:** ARCH-033

### Performance Tier Audit (host)

**Tier 1 — RAF coalesce:** implemented in `ComputeScheduler`  
**Tier 2 — adaptive resolution:** implemented via `compute.interactionScale`  
**Tier 3 — worker offload:** implemented via inline worker Blob + generation guard  
**Tier gaps:** p5-context scripts bypass `ComputeScheduler` path (explicit design in host)

**Issues logged:** none

### v4 issues logged

- ARCH-033, DOC-059, DOC-060
