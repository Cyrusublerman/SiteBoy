# Component Architecture (Index)

Use this as the entry point for all component docs.

## Map
- Glossary: `glossary/component-glossary.md`
- Rules: `rules/component-rules.md`
- Nomenclature: `rules/component-nomenclature.md`
- Process: `process/component-process.md`
- Routing/exports: `routing/component-routing-guide.md`
- Reference: `COMPONENT-REFERENCE.md`
- Per-component docs: see `input/`, `output/`, `container/`, `tool/`, `layout/`, `content/`, `interactive/`, `graphs/`, `specialized/`, `p5/`, `gallery/`, `utility/`

## Per-component links

### Input
- `input/NumericInput.md`
- `input/TextInput.md`
- `input/Select.md`
- `input/Dropdown.md`
- `input/ToggleGroup.md`
- `input/Button.md`
- `input/FileInput.md`
- `input/ColorInput.md`
- `input/EquationEditor.md`

### Output
- `output/Text.md`
- `output/ProgressBar.md`
- `output/Canvas.md`
- `output/SVG.md`
- `output/Media.md`
- `output/AudioOutput.md`

### Container
- `container/Stack.md`
- `container/Grid.md`
- `container/Section.md`
- `container/Tabs.md`
- `container/Collection.md`

### Tool helpers
- `tool/NavigationDropdown.md`
- `tool/CanvasTabs.md`

### Layout
- `layout/PageContainer.md`
- `layout/PageHeader.md`
- `layout/Subheader.md`
- `layout/PageFooter.md`
- `layout/Spacing.md`
- `layout/Panel.md`

### Content
- `content/Heading.md`
- `content/Paragraph.md`
- `content/Quote.md`
- `content/Image.md`
- `content/Video.md`
- `content/Audio.md`
- `content/MarkdownBody.md`
- `content/SimpleTOC.md`
- `content/NumberedTOC.md`
- `content/TOCGallery.md`
- `content/Table.md`
- `content/StatusDisplay.md`

### Interactive
- `interactive/CollapsibleBase.md`
- `interactive/Menu.md`
- `interactive/Breadcrumb.md`
- `interactive/ButtonGroup.md`
- `interactive/CollapsibleSection.md`
- `interactive/Lightbox.md`
- `interactive/Carousel.md`
- `interactive/CheckpointList.md`
- `interactive/Sequencer.md`

### Graphs
- `graphs/BarGraph.md`
- `graphs/LineGraph.md`
- `graphs/PieGraph.md`

### Specialized
- `specialized/VGAGrid.md`
- `specialized/MathematicalCanvas.md`
- `specialized/SVGDisplay.md`
- `specialized/AnimationControls.md`

### P5 integration
- `p5/P5Canvas.md`
- `p5/P5EmbeddedSketch.md`
- `p5/P5ControlledSketch.md`

### Gallery
- `gallery/MasonryGallery.md`

### Utility
- `utility/AnimationContainer.md`
- `utility/ExportController.md`

## Where components live (code)
- `assets/js/shared/components/<category>/<Name>.js`
- Category indices export to `assets/js/shared/components/index.js`
- Then imported/re-exported in `assets/js/shared/component-library.js` (factory strings like `stack`, `tool-numeric-input`).

## Design principles (summary)
- One component, many modes; reuse before add.
- F-system sizing; UI colors via `var(--c-*)`; no DOM in tools.
- BaseComponent lifecycle; destroy cleans children/listeners.

## How to add/modify
- Follow process guide: search/reuse → implement → export chain → doc page → checklist.

## See Also
- `guides/tools/tool-build-guide.md` — ToolBase usage with components
- `guides/ai-routing-map.md` — where to start
