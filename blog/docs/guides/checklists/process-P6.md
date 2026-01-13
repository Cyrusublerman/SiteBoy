# Checklist: Process P6

- Single pipeline (init/step/draw) + one CORE_DATA store? Y/N
- Modes as params (no duplicate state)? Y/N
- AnimationFoundation only; animator.destroy()? Y/N
- AssetLoader/ToolBase for deps/exports? Y/N
- Any direct DOM/inline styles in tools? (must be N)
- Every control → state change → render? Y/N

