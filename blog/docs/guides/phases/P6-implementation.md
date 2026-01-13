# P6 Implementation Guard

Inputs: All prior outputs, checklists.

CORE:
- Single pipeline: one init/step/draw; modes as params; one CORE_DATA store.
- Use AnimationFoundation; animator.destroy().
- Use AssetLoader for deps/exports; ToolBase for export flow.
- UI via ComponentLibrary; no inline styles/DOM ops; F-system/VGA enforced.
- Reuse shared utilities; no duplicate helpers.
- Wire every control → state → render path.

CHECK:
- Any duplicate state stores? Y/N
- Any RAF/setInterval for anim? Y/N (must be N)
- Any direct JSZip/RecordRTC import? Y/N (must be N)
- Each control triggers state change + render? Y/N

