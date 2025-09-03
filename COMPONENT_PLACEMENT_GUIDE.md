# Component Placement Guide - SiteBoy Framework

## 🎯 CRITICAL RULE: ONE COMPONENT, ONE LOCATION

**Every component MUST have exactly ONE home. NO DUPLICATES ALLOWED.**

---

## 📁 FILE OWNERSHIP MAP

### `foundation.js` - Core Infrastructure
**OWNS:** Components that ALL other components depend on
- ✅ `BaseComponent` - Foundation class (extends this, never duplicate)
- ✅ `BaseNavigationDropdown` - Reusable dropdown with keyboard nav

**ADD HERE IF:** 
- Component is extended by multiple other components
- Component provides core infrastructure (DOM manipulation, lifecycle, etc.)
- Component is a shared utility used across categories

**DO NOT ADD:** Regular UI components, page-specific components

---

### `layout.js` - Page Structure & Positioning
**OWNS:** Components that define page layout, positioning, and structure
- ✅ `PageContainer` - Main page layout with CSS variables
- ✅ `PageHeader` - Site header with navigation 
- ✅ `Subheader` - Section subheader with precise widths
- ✅ `PageFooter` - Site footer
- ✅ `Grid` - Gallery grid with shared borders
- ✅ `Spacing` - Spacing utility component

**ADD HERE IF:**
- Component sets CSS layout variables (--layout-width, --header-y, etc.)
- Component handles page-level positioning
- Component manages viewport-based calculations
- Component is part of the main page structure (header, footer, containers)
- Component handles mathematical layout precision

**DO NOT ADD:** Content elements, form inputs, graphs, specialized widgets

---

### `content.js` - Text & Media Elements  
**OWNS:** Components that display content and media
- ✅ `Heading` - Semantic headings (H1-H6)
- ✅ `Paragraph` - Semantic paragraphs
- ✅ `Quote` - Blockquotes with citations
- ✅ `Image` - Images with figure/caption
- ✅ `Video` - Video with figure/caption
- ✅ `Audio` - Audio with figure/caption
- ✅ `MarkdownBody` - Markdown rendering with fallback parser

**ADD HERE IF:**
- Component displays text content
- Component displays media (images, video, audio)
- Component renders formatted content (markdown, rich text)
- Component is semantic HTML (articles, sections, etc.)

**DO NOT ADD:** Form controls, interactive elements, layout containers, specialized widgets

---

### `interactive.js` - User Input & Interaction
**OWNS:** Components that users interact with or that handle user input
- ✅ `CollapsibleBase` - Foundation for expand/collapse patterns
- ✅ `Menu` - Navigation menu with keyboard support
- ✅ `Breadcrumb` - Breadcrumb navigation
- ✅ `Button` - Interactive buttons
- ✅ `Input` - Form input fields
- ✅ `Select` - Form select dropdowns
- ✅ `ButtonGroup` - Grouped button interfaces

**ADD HERE IF:**
- Component accepts user input (forms, controls)
- Component responds to clicks, hovers, keyboard events
- Component manages interactive state (open/closed, selected/unselected)
- Component provides navigation or menu functionality
- Component extends `CollapsibleBase`

**DO NOT ADD:** Layout containers, content display, graphs, canvas widgets

---

### `graphs.js` - Data Visualization
**OWNS:** Components that visualize data as charts and graphs
- ✅ `BarGraph` - Bar chart visualization
- ✅ `LineGraph` - Line chart visualization  
- ✅ `PieGraph` - Pie chart visualization

**ADD HERE IF:**
- Component visualizes data as charts/graphs
- Component renders mathematical data representations
- Component creates data-driven visualizations
- Component uses canvas or SVG for data display

**DO NOT ADD:** Interactive controls, content elements, layout components, general canvas widgets

---

### `specialized.js` - Advanced & Specialized Widgets
**OWNS:** Components with specialized functionality that don't fit other categories
- ✅ `VGAGrid` - VGA-styled color grid
- ✅ `MathematicalCanvas` - Mathematical visualization canvas
- ✅ `ProgressBar` - Progress indicators
- ✅ `HierarchicalTOC` - Table of contents with hierarchy

**ADD HERE IF:**
- Component has very specific, specialized functionality
- Component doesn't clearly fit in other categories
- Component is a complex widget with multiple sub-components
- Component provides advanced mathematical or scientific functionality
- Component is experimental or cutting-edge

**DO NOT ADD:** Basic UI elements, standard form controls, simple content components

---

## 🔧 DEVELOPMENT WORKFLOW

### ✅ BEFORE CREATING A NEW COMPONENT:

1. **Check the ownership map above** - does a similar component already exist?
2. **Read the file headers** - each file lists what it owns
3. **Search existing components** - use `grep` to find similar functionality
4. **Choose the correct category** - follow the rules above

### ✅ CREATING A NEW COMPONENT:

1. **Pick the correct file** based on ownership rules
2. **Add to the appropriate category file** (e.g., `interactive.js`)
3. **Update the file header** - add your component to the "COMPONENTS OWNED BY THIS FILE" list
4. **Export the component** - add `export class YourComponent extends BaseComponent`
5. **Update `component-library.js`** - add import and export
6. **Add to ComponentLibrary object** - add to the main object
7. **Add to factory method** - add to the `.create()` method mapping
8. **Add convenience method if needed** - for components used by app.js or sections (like pageContainer)
9. **Test thoroughly** - ensure no conflicts or duplicates

### ✅ COMPONENT TEMPLATE:

```javascript
/**
 * YourComponent - Brief description
 * 
 * @extends BaseComponent
 * @category [foundation|layout|content|interactive|graphs|specialized]
 */
export class YourComponent extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'your-component' }, deps);
        // Your properties here
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'your-component');
            // Your rendering logic here
        }
        return this.element;
    }
    
    destroy() {
        // Your cleanup logic here
        super.destroy(); // ALWAYS call super.destroy()
    }
}
```

---

## 🚫 FORBIDDEN PRACTICES

### ❌ NEVER DO THESE:

1. **Duplicate components** - If it exists, use it or extend it
2. **Create components in wrong files** - Follow the ownership map strictly  
3. **Skip updating headers** - Always update the "COMPONENTS OWNED" list
4. **Forget exports** - Component must be exported from category file AND component-library.js
5. **Use direct DOM manipulation** - Always use BaseComponent methods
6. **Create files outside the system** - All components go in the 6 category files
7. **Incomplete method extraction** - When extracting existing components, copy ALL methods (use grep to find all methods)

### ❌ EXAMPLE VIOLATIONS:

```javascript
// ❌ BAD - Creating Button in content.js
export class Button extends BaseComponent // WRONG FILE!

// ❌ BAD - Direct DOM manipulation  
document.createElement('div') // USE this.createElement() instead

// ❌ BAD - Not extending BaseComponent
export class MyWidget // MUST extend BaseComponent

// ❌ BAD - Missing from exports
// Component exists but not exported in component-library.js
```

---

## 🎯 DECISION TREE

**When creating a new component, ask:**

```
Is it core infrastructure used by other components?
├─ YES → foundation.js
└─ NO ↓

Does it handle page layout, positioning, or structure?  
├─ YES → layout.js
└─ NO ↓

Does it display content or media?
├─ YES → content.js  
└─ NO ↓

Does it handle user interaction or input?
├─ YES → interactive.js
└─ NO ↓

Does it visualize data as charts/graphs?
├─ YES → graphs.js
└─ NO ↓

Is it specialized/advanced functionality?
└─ YES → specialized.js
```

---

## 📋 CHECKLIST FOR NEW COMPONENTS

- [ ] Checked existing components for duplicates
- [ ] Chose correct category file based on ownership rules
- [ ] Extended BaseComponent properly
- [ ] Added to file header "COMPONENTS OWNED BY THIS FILE" list
- [ ] Exported from category file
- [ ] Added import to component-library.js
- [ ] Added to ComponentLibrary object
- [ ] Added to factory method mapping
- [ ] Added convenience method if appropriate
- [ ] Tested component works in isolation
- [ ] Tested component works in real application
- [ ] No linter errors
- [ ] Follows F=12px mathematical constraints
- [ ] Uses CSS variables for styling
- [ ] Implements proper destroy() method

---

## 🔍 QUICK REFERENCE

**Find existing components:**
```bash
grep -r "export class" assets/js/shared/
grep -r "componentType.*button" assets/js/shared/
```

**Check component usage:**
```bash
grep -r "new.*Button" assets/js/
grep -r "ComponentLibrary.*button" assets/js/
```

**Verify exports:**
```bash
grep -r "Button" assets/js/shared/component-library.js
```

**Check method completeness when extracting:**
```bash
grep -A 5 -B 5 "createDropdownStructure\|populateDropdown\|setSymbolElement" reference/component-library-original-*.js
```

---

**🎯 REMEMBER: This system ensures NO duplicates, clear ownership, and easy maintenance. Follow it religiously!**
