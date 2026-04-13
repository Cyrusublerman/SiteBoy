# TreeTOC

Arbitrary-depth horizontal tree diagram with SVG connectors. Primary content surface for index/TOC pages.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `{ label, children? }` | — | Pre-built tree root. Use instead of `sections` for arbitrary depth. |
| `sections` | `Array<{ title, articles }>` | `[]` | Legacy 2-level adapter. Converts to `data` internally via `_sectionsToTree`. |
| `rootLabel` | `string` | `'TOOLS'` | Root node label when using `sections` adapter. |
| `onItemClick` | `(nodeData) => void` | `null` | Called on leaf node click. Receives `node._data ?? node`. |
| `collapsible` | `bool` | `true` | Enables expand/collapse on parent nodes. |

## Geometry

```
charW = F × 0.60          (1 character width)
N     = charW × 6         (arm / stub line length)

[charW] TEXT [charW] [——N——] rail [——N——] [charW] TEXT(d+1)
```

- `textX[d] = labelX[d] + charW` — 1-char left gap
- `railX[d] = textX[d] + maxW[d] + charW + N` — 1-char gap + arm (= N for longest label)
- `labelX[d+1] = railX[d] + N` — stub of length N, then child element
- All horizontal arms variable (from actual text end); all stubs fixed at N
- Gap = exactly 1 charW between every line endpoint and adjacent text

## Collapse indicator

For collapsed parent nodes: an SVG cross (`-+`) is drawn to the right of the label text.

- Horizontal: 2 chars wide — 1-char arm segment + 1-char cross bar (single `<line>`)
- Vertical: 1 char tall, centred in the cross character
- Same stroke-width, colour (`var(--c-border)`), and `crispEdges` as all connectors
- Absent when node is expanded

Per semiotics §1: TOC folders use content-section glyph system. The SVG cross serves as structural indicator only — not a DOM glyph.

## Text measurement

Uses a hidden `_measureEl` div (same font, off-canvas) for `getBoundingClientRect()` width. Fallback to `str.length × F × 0.60` for the initial off-DOM draw. Redraws after `document.fonts.ready`.

## Passes (draw order)

1. `_assignDepths` — sets `node._depth`, initialises `node._collapsed = (depth > 0)`
2. `_collectMaxWidths` — max rendered label width per depth, all nodes (not just visible)
3. `_buildGeo` — `labelX`, `textX`, `railX` per depth
4. `_assignRows` — parent row = first child row; subsequent children stack below
5. `_placeLabel` — positions DOM elements; recurses only into expanded children
6. `_drawConnectors` — SVG arm, v-rail, stubs, cross indicators

## Data contract for `data` prop

```js
{
  label: 'ROOT',
  children: [
    {
      label: 'SECTION',
      children: [
        { label: 'LEAF', _data: { slug: 'section/leaf' } }
      ]
    }
  ]
}
```

Leaf nodes carry `_data` — whatever object `onItemClick` needs. Intermediate nodes carry no `_data`; clicking them toggles expand/collapse.

## Usage

```js
const toc = new ComponentLibrary.TreeTOC({
    data: buildTree(manifest),
    onItemClick: (item) => navigate(item.slug),
    collapsible: true
}, { MF: window.MathematicalFoundation });

this.componentInstances.push(toc);
container.appendChild(toc.render());
```

## Source

`assets/js/shared/content.js` — `export class TreeTOC extends BaseComponent`
