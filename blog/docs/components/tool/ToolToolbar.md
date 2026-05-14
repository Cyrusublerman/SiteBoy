# ToolToolbar — utility top-bar cells

## Layout
Flex row: title cell (`tool-toolbar-title-cell`, `--subheader-title-width`) then `grid`-based action cells spanning column weights.

## Cell schema
Each cell: `{ id, label, span?, buildPanel?(host,F) → HTMLElement|null }`.

- `host.close()` collapses panels; `host.F` duplicates MF.F.
- `buildPanel` runs once per cell on first toggle; sibling panel mount uses **absolute top:100%; right:0** under toolbar.

## Behaviour
Outside `mousedown` on `document` closes panels. `ResizeObserver` on action area abbreviates labels to single letter when cramped.

## Deps
`MF.F` determines row height (`F*2`). Destroy disconnects observers + listeners (`assets/js/shared/components/tool/ToolToolbar.js`).
