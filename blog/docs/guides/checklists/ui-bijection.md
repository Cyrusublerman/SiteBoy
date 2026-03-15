# Checklist: UI Bijection

- |PARAM| == |CONTROL| ? Y/N
- Tabs ≤4 (incl. auto CANVAS)? Y/N
- Blocks ≤6 components? Y/N
- Each control binds to state var? Y/N
- Each state var affects render? Y/N

## Distort Aesthetic Gate (Pass/Fail)

- All interactive rows exactly 2F height? Y/N
- All spacing from F or F/2 only? Y/N
- Shared-boundary model preserved (no double borders)? Y/N
- No floating panels / card chrome / detached UI objects? Y/N
- Typography family is Space Mono only? Y/N
- Case roles valid (UPPERCASE structural, Title Case blocks, Sentence case prose)? Y/N
- No tool-isolated UI component where shared ComponentLibrary equivalent exists? Y/N
- New UI components exported through `assets/js/shared/component-library.js`? Y/N
- Glyph positions correct: state glyphs left, action glyphs right (design-law §15)? Y/N
- All labels classified as state/action/identifier/qualifier (design-law §13.1)? Y/N

## Responsive Lifecycle Gate (Pass/Fail)

- Portrait→landscape and landscape→portrait transitions produce functional layout? Y/N
- Tool-injected components re-injected after ToolBase destroy/rebuild (ui-interface-overview §5.7)? Y/N
- No empty sidebar sections or blank canvas after orientation change? Y/N

## Distort Simultaneity Gate (Pass/Fail)

- Pipeline editing and transport simultaneously accessible? Y/N
- Export actions accessible without leaving pipeline context? Y/N
- Quality and display mode accessible without tab switching? Y/N

