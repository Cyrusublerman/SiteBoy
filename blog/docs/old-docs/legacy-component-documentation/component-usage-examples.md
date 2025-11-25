# Component Usage Examples

## How to Use the UI Test Tool Reference System

This document provides practical examples of how to implement the reference-first development pattern, using components from the UI Test Tool as the single source of truth.

## Reference-First Development Workflow

### Step 1: Check UI Test Tool First

Before creating any UI element, navigate to `#tools/ui-test` and check if the component exists:

```
#tools/ui-test → Browse sections:
├── Dropdown System (Header-Accurate) 
├── Grid System Demonstration
├── Typography Scale System
├── Color System Variables
├── Form Element System  
├── Button Grid System
├── Loading Elements
├── Graph Elements
├── Canvas Elements
└── Layout Calculations Debug
```

### Step 2: Use ComponentLibrary Implementation

If the component exists, use the exact implementation:

## Example 1: Adding a Dropdown to Blog Section

**Reference**: UI Test Tool → "Dropdown System (Header-Accurate)"

### Before (Custom Implementation - DON'T DO THIS):
```javascript
// ❌ WRONG - Custom dropdown implementation
const customDropdown = document.createElement('div');
customDropdown.style.cssText = `
    width: 100%;
    background: white;
    border: 1px solid black;
    /* ... custom styles that may not match site standards */
`;
```

### After (Using ComponentLibrary - CORRECT):
```javascript
// ✅ CORRECT - Use ComponentLibrary
const dropdown = ComponentLibrary.createDropdown({
    triggerText: 'Filter Articles',
    items: ['All Articles', 'Music', 'Site Development', 'Tools'],
    width: layout.gridWidth
});

dropdown.bindEvents((selectedItem, index) => {
    console.log('Selected:', selectedItem);
    // Handle filtering logic
});

container.appendChild(dropdown.container);
```

**Result**: Dropdown looks and behaves exactly like the one in UI Test Tool, with perfect header matching.

## Example 2: Creating Responsive Grids

**Reference**: UI Test Tool → "Grid System Demonstration"

### Art Section Grid:
```javascript
// Replace custom grid with ComponentLibrary
const artworkGrid = ComponentLibrary.createResponsiveGrid(
    CONFIG.sections.art.artworks.map(artwork => ({
        text: artwork.title,
        onClick: () => this.viewArtwork(artwork.id)
    })),
    'squares'  // Perfect squares like UI Test Tool
);

container.appendChild(artworkGrid);
```

### Projects Section Grid:
```javascript
// Two-column responsive grid for projects
const projectGrid = ComponentLibrary.createResponsiveGrid(
    CONFIG.sections.projects.modules.map(project => ({
        text: project.title,
        onClick: () => this.showProject(project.id)
    })),
    'cards'  // Card-style layout
);

container.appendChild(projectGrid);
```

## Example 3: Form Elements

**Reference**: UI Test Tool → "Form Element System"

### Tool Configuration Forms:
```javascript
// Text input for tool parameters
const { container: nameContainer, input: nameInput } = ComponentLibrary.createFormInput(
    'text',
    'Tool Name',
    'Enter tool name here'
);

// Select dropdown for categories
const { container: categoryContainer, input: categorySelect } = ComponentLibrary.createFormInput(
    'select',
    'Category',
    ['Typography', 'Color', 'Layout', 'Analysis']
);

// Append to tool interface
toolInterface.appendChild(nameContainer);
toolInterface.appendChild(categoryContainer);
```

## Example 4: Button Systems

**Reference**: UI Test Tool → "Button Grid System"

### Navigation Buttons:
```javascript
const navButtons = ComponentLibrary.createButtonGrid([
    { text: 'Previous', type: 'secondary', onClick: () => this.previous() },
    { text: 'Next', type: 'secondary', onClick: () => this.next() },
    { text: 'Save', type: 'primary', onClick: () => this.save() },
    { text: 'Reset', type: 'disabled' }
], 4);

toolbar.appendChild(navButtons);
```

### Tool Action Buttons:
```javascript
const toolButtons = ComponentLibrary.createButtonGrid([
    { text: 'Calculate', type: 'primary', onClick: () => this.calculate() },
    { text: 'Clear', type: 'secondary', onClick: () => this.clear() },
    { text: 'Export', type: 'secondary', onClick: () => this.export() },
    { text: 'Help', type: 'secondary', onClick: () => this.showHelp() }
], 2);

toolContainer.appendChild(toolButtons);
```

## Example 5: Section Headers

**Reference**: UI Test Tool → Section header implementation

### Consistent Section Headers:
```javascript
// Create section headers that match UI Test Tool exactly
const header = ComponentLibrary.createSectionHeader('Typography Analysis Results');
container.appendChild(header);

// Add content with proper border sharing (no double lines)
const content = document.createElement('div');
content.style.cssText = `
    width: ${layout.gridWidth}px;
    margin: 0 auto;
    outline: var(--outline-width) solid var(--c-border);
    outline-top: none;  /* Share border with header */
    padding: 24px;
    background: var(--c-bg);
`;
container.appendChild(content);
```

## Adding New Components to UI Test Tool

### When Component Doesn't Exist:

1. **Add to UI Test Tool first**:
```javascript
// In assets/js/tools/ui-test-tool.js
createNewComponentDemo() {
    const section = this.createSectionContainer('New Component Name');
    
    // Implement the component following SiteBoy patterns
    const newComponent = document.createElement('div');
    newComponent.style.cssText = `
        width: ${this.layout.gridWidth}px;
        margin: 0 auto;
        /* ... following established patterns */
        font-family: 'Syne Mono', monospace;
        outline: var(--outline-width) solid var(--c-border);
    `;
    
    section.appendChild(newComponent);
    this.container.appendChild(section);
}
```

2. **Extract to ComponentLibrary**:
```javascript
// In assets/js/shared/component-library.js
createNewComponent(options) {
    // Extract EXACT implementation from UI Test Tool
    // Parameterize but don't change styling/behavior
    return componentElement;
}
```

3. **Update UI Test Tool to use library**:
```javascript
// Update UI Test Tool method
createNewComponentDemo() {
    const component = ComponentLibrary.createNewComponent({
        // Demo configuration
    });
    
    const section = this.createSectionContainer('New Component Name');
    section.appendChild(component);
    this.container.appendChild(section);
}
```

4. **Document the component**:
```markdown
## New Component
**Reference**: UI Test Tool → "New Component Name" section
**Implementation**: `ComponentLibrary.createNewComponent()`
**Usage**: Configure options and append to container
```

## Benefits in Practice

### Real Example: Dropdown Consistency

**Before ComponentLibrary**:
- Blog section: Custom dropdown (150 lines of code)
- Tools section: Different dropdown (120 lines of code)  
- Art section: No dropdown (inconsistent UX)
- **Total**: 270 lines of duplicate/inconsistent code

**After ComponentLibrary**:
- All sections: `ComponentLibrary.createDropdown()` (3 lines each)
- UI Test Tool: Reference implementation (60 lines)
- **Total**: 69 lines total, 100% consistent

**Savings**: 201 lines eliminated, perfect consistency achieved.

### Design System Compliance

Every component automatically includes:
- ✅ Syne Mono font family
- ✅ Proper outline-based borders
- ✅ Mathematical spacing calculations  
- ✅ Standard hover effects
- ✅ Responsive behavior
- ✅ VGA color compliance
- ✅ Zero-gap border sharing

### Debugging Made Simple

**Problem**: "Why does this dropdown look different?"
**Solution**: Compare with UI Test Tool → Copy exact implementation

**Problem**: "How should hover effects work?"
**Solution**: Check UI Test Tool → Use ComponentLibrary function

**Problem**: "What spacing should I use?"
**Solution**: UI Test Tool shows exact patterns → Copy measurements

## Component Reference Quick Index

| Component Type | UI Test Tool Section | ComponentLibrary Function | Use Case |
|---|---|---|---|
| Dropdown | "Dropdown System" | `createDropdown()` | Filters, navigation |
| Button Grid | "Button Grid System" | `createButtonGrid()` | Actions, navigation |
| Form Input | "Form Element System" | `createFormInput()` | User input, configuration |
| Grid Layout | "Grid System" | `createResponsiveGrid()` | Content display |
| Section Header | All sections | `createSectionHeader()` | Section organization |

## Quality Checklist

Before implementing any UI:
- [ ] Checked UI Test Tool for existing pattern
- [ ] Used ComponentLibrary function if available
- [ ] Added to UI Test Tool if new component needed
- [ ] Extracted to ComponentLibrary if reusable
- [ ] Updated documentation with UI Test Tool reference
- [ ] Tested visual consistency with UI Test Tool
- [ ] Verified mathematical precision and spacing
- [ ] Confirmed Syne Mono font usage

---

This reference system ensures that **every UI element** across SiteBoy follows the exact same patterns, eliminating inconsistencies and duplicate code while maintaining the framework's distinctive aesthetic. 