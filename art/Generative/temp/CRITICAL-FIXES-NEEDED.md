# Critical Fixes for Wave Interference

## Issues Identified

### 1. Structural Problems
- [ ] Unnecessary wrapper divs (not following component pattern)
- [ ] Presets, Quick Actions, Undo/Redo should be ONE section
- [ ] Image size should be in Quick Actions (early), not Export
- [ ] Export should be in Global section (currently empty)
- [ ] Empty/redundant divs throughout

### 2. Spacing/Layout
- [ ] Margin under equation display
- [ ] Content container padding (remove for tool pages)
- [ ] Animation-canvas-area has padding (shouldn't)
- [ ] Gap between sidebar and canvas
- [ ] Sidebar needs 1px border, children flush (no side borders)
- [ ] Scrollbar off-center

### 3. Canvas Sizing
- [ ] Canvas only resizes by width, not min(width, height)
- [ ] Overshoots bottom in landscape
- [ ] Goes black when image size changes
- [ ] NO SCROLLING should be needed (fixed interface)

### 4. Component Issues
- [ ] Sin/Cos should be toggle buttons (2 buttons, one highlighted), not dropdown
- [ ] Number inputs have native arrows (need custom `[ - | NUMBER | + ]`)
- [ ] Equation text too small

### 5. Proportional Sizing
- [ ] 1 element in row = 100% width, shared borders
- [ ] 2+ elements = equal distribution, shared borders (like headers)

### 6. Export Section
- [ ] Loop text has lopsided padding
- [ ] "Loop: X frames" should be under duration input
- [ ] Combine with seconds calculation

## Root Cause Analysis

**Why did these happen?**

1. **Base class creates wrapper divs** - makeBox() creates extra divs
2. **No proportional sizing logic** - buttons/dropdowns don't auto-size
3. **Sections built separately** - should combine related functions
4. **Canvas sizing wrong** - uses container width, not min dimension
5. **Component library incomplete** - toggle type uses Select, not buttons
6. **Number inputs unstyled** - using browser defaults

## Fix Strategy

### Phase 1: Structural (CRITICAL)
1. Combine Presets + Quick Actions + Undo/Redo into ONE section
2. Move image size control to Quick Actions
3. Move Export to Global section
4. Remove unnecessary divs

### Phase 2: Canvas & Layout
1. Fix canvas sizing (min dimension, no black on resize)
2. Fix content container padding
3. Add sidebar border, remove child borders
4. Center scrollbar

### Phase 3: Components
1. Create ToggleButtons component (replace Select for toggle type)
2. Style number inputs (hide arrows, add +/- buttons)
3. Fix equation text size
4. Implement proportional sizing logic

### Phase 4: Spacing
1. Remove equation margin
2. Fix export padding
3. Ensure shared-border pattern everywhere

## Updates Needed to Guides

### AI-AGENT-GUIDE.md
- Add section on avoiding wrapper divs
- Emphasize combining related functions
- Add proportional sizing rules
- Add canvas sizing rules (min dimension)

### generative-animation-architecture.md
- Add "No Scroll" rule for tool pages
- Add proportional sizing table
- Add canvas sizing (min width/height)
- Add number input styling requirements

### GenerativeAnimationBase
- Remove makeBox() wrapper pattern
- Add buildCombinedQuickActions()
- Fix canvas sizing in AnimationContainer
- Add proportional sizing helper

This is too big for one session. Needs systematic refactoring.


