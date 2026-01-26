# Tool Conversion Task

## Objective

Convert source files for tools and generative art pages into the ToolBase declarative format.

---

## Step 1: Read Documentation

Before doing anything, read these files in order:

1. `blog/docs/guides/tools/tool-build-guide.md` — **v2.0** Complete spec with patterns
2. `blog/docs/guides/tool-standards.md` — Minimum functionality & consistency requirements
3. `blog/docs/guides/shared-utilities.md` — **Reusable code registry**
4. `blog/docs/components/COMPONENT-REFERENCE.md` — All available components
5. `assets/js/tools/tool-base.js` — ToolBase implementation
6. `assets/js/tools/tool-test-ui.js` — Reference implementation

---

## Step 2: Check for Existing Documentation

**IMPORTANT:** Documentation may already exist. Check BEFORE creating new docs.

**Existing page docs location:**
```
blog/docs/pages/
├── tools/           ← Tool page descriptions
│   ├── colour-quantizer.md
│   ├── pixel-tiler.md
│   ├── polygon-calculator.md
│   ├── font-analysis.md
│   ├── asteroid-belt.md
│   ├── solar-system.md
│   └── about-you.md
└── art/generative/  ← Generative art descriptions
    ├── lissajous.md
    ├── torus.md
    └── (etc.)
```

Also search:
- `blog/docs/old-docs/` — Legacy documentation
- All `*.md` files for tool name mentions

**If docs exist:** Enhance them with missing sections (see template below).
**If docs don't exist:** Create new file following template.

---

## Step 3: Create/Update Page Description Document

**BEFORE writing any code**, ensure a complete markdown document exists for EACH page.

**Location:** 
- Tools: `blog/docs/pages/tools/{tool-name}.md`
- Generative Art: `blog/docs/pages/art/generative/{page-name}.md`

**If document exists:** Add any missing sections from the template below.
**If document doesn't exist:** Create new file with all sections.

### Required Sections:

```markdown
# {Page Name}

## 1. Source Analysis

**Source file(s):** `path/to/source.js`
**Related docs found:** (list any existing MD files that mention this)

### Purpose
What is this page trying to do? What problem does it solve?

### Output Type
- [ ] Static image
- [ ] Animation (looping / non-looping)
- [ ] Interactive visualization
- [ ] Data/calculation result
- [ ] Audio
- [ ] Downloadable file (SVG, PNG, GIF, etc.)

### Current Implementation
Brief description of how the source currently works.

---

## 2. Tool Classification

**Is this a tool?** (Has distinct input → processing → output)

If YES:
- **Input:** What does the user provide/control?
- **Processing:** What transformation occurs?
- **Output:** What is produced?

If animation/generative:
- **Frame-based?** Yes/No
- **Looping?** Yes/No/Configurable
- **Duration:** Fixed/Variable/Infinite

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| (list all) | | | |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| (map variables to components) | | |

### Missing Controls (not in source, should add)
For animations:
- [ ] Play/Pause
- [ ] Frame export
- [ ] Video/GIF export
- [ ] Canvas width/height
- [ ] Frame count / duration
- [ ] Loop toggle
- [ ] Playback speed

For images:
- [ ] Canvas sizing
- [ ] Export PNG/SVG
- [ ] Resolution control

---

## 4. Gap Analysis

### Available in our library but missing in source:
(What components/features do we have that the source doesn't use?)

### Source features requiring new components:
(Anything in source we can't currently support?)

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| | | | | | | |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| | | | |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'PAGE NAME',
    
    sidebar: [
        ['TAB_NAME', [
            ['Block Title', [
                // Components here
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        // Initialization
    },
    
    onUpdate: function(key, value, allValues) {
        // Handle changes
    },
    
    onDraw: function(ctx, canvas, values) {
        // Rendering
    },
};
```

---

## 7. Implementation Notes

- Special considerations
- Performance concerns
- Browser compatibility
- Dependencies

---

## 8. Reusable Code Candidates

Track any substantial code that could be shared:

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| (function name) | (count) | math/color/audio/etc | (other tools) | High/Medium/Low |

If code matches something in `shared-utilities.md`, note it.
If code is new and substantial (>20 lines), add to registry.
```

---

## Step 4: Review Source Files

After creating the page document, analyze each source file:

**Tools** (in `reference/tools/codepen/`):
- `colour-quantizer.js`
- `pixel-tiler.js`
- `polygon-calculator.js`

**Generative Art** (in `art/Generative/source/`):
- All `.js` files
- These ARE tool pages if they have configurable parameters

**Existing Tools to Refactor** (in `assets/js/tools/`):
- `font-analysis-tool.js`
- `asteroid-belt-tool.js`
- `solar-system-tool.js`
- `about-you-tool.js`

---

## Step 5: Convert

For each source file:
1. Complete the page description MD first
2. Identify all user controls → map to ToolBase components
3. Identify rendering logic → port to `onDraw`
4. Add standard controls (play/pause, export, sizing) where appropriate
5. Create the tool file following the guide's template
6. Output to `assets/js/tools/{tool-name}.js`

---

## Step 6: Register (5 places)

**Follow the detailed steps in tool-build-guide.md "Step 2: Register Tool"**

Quick reference:

| File | What to Add |
|------|-------------|
| `index.html` | `<script src="assets/js/tools/{tool-name}.js">` |
| `tools_section.js` → `pages` | `'#tools/{tool-name}'` |
| `tools_section.js` → `toolsSections` | `'TOOL NAME': '#tools/{tool-name}'` |
| `tools_section.js` → `allTools` | `'TOOL NAME': '#tools/{tool-name}'` |
| `tools_section.js` → `renderTool()` | `case '{tool-name}':` + render method |

**All 5 are required.** Missing any will cause routing or rendering failures.

---

## Constraints

- Do NOT modify `tool-base.js`
- Create page description MD BEFORE writing code
- Follow patterns established in the guide and reference implementation

### Minimum Functionality (from tool-standards.md)

**All visual outputs:**
- Canvas sizing controls
- Export PNG
- Clear/Reset

**All animations:**
- Play/Pause
- Frame export
- GIF/Video export
- FPS control
- Loop toggle

**All audio:**
- Play/Stop
- Volume control

**All data outputs:**
- Copy to clipboard
- Export data

### Consistency (from tool-standards.md)

- Use standard tab names: CONTROLS, CANVAS, ANIMATION, PRESETS, INFO
- Use standard block names: Parameters, Style, Canvas, Export, Playback
- Follow F-system sizing
- Status below canvas

### Code Reuse (from shared-utilities.md)

- Check registry for existing utilities before writing new code
- Note any substantial code (>20 lines) in "Reusable Code Candidates"
- If same pattern used in 3+ tools, extract to shared utility

---

## Critical Reminders

**Sidebar Structure — 3 LEVELS REQUIRED:**
```javascript
sidebar: [
    ['TAB_NAME', [                    // Level 1
        ['Block Title', [             // Level 2
            ['slider', 'Label', ...], // Level 3 - components
        ]],
    ]],
]
```

**Keys are camelCase:**
```javascript
// Config:
['slider', 'Ball Count', 0, 100, 1, { key: 'ballCount' }]

// Access:
values.ballCount    // ✓ CORRECT
values.ball_count   // ❌ WRONG
```

**Always provide explicit keys:**
```javascript
// Good:
['slider', 'Width', 14, 800, 1, { value: 420, key: 'canvasWidth' }]

// Avoid:
['slider', 'Width', 14, 800, 1, { value: 420 }]  // auto-key = 'width'
```

**Wire buttons in onInit:**
```javascript
onInit: function(values) {
    var btn = this.getComponent('exportPng');
    if (btn && btn.element) {
        btn.element.addEventListener('click', function() { ... });
    }
}
```

**Clean up in destroy:**
```javascript
ToolName.prototype.destroy = function() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.tool) this.tool.destroy();
};
```
