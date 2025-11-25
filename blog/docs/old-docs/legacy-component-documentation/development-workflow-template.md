# SiteBoy Component Reference Development Workflow

## Pre-Development Checklist

Before implementing any UI feature, complete this checklist:

- [ ] **Navigate to UI Test Tool**: Open `#tools/ui-test` in browser
- [ ] **Review existing components**: Check all sections for similar patterns
- [ ] **Document requirements**: List what UI elements are needed
- [ ] **Check ComponentLibrary**: Review available functions in `assets/js/shared/component-library.js`

## Development Workflow Template

### Phase 1: Research & Planning

#### 1.1 Component Discovery
```bash
# Step 1: Navigate to UI Test Tool
# URL: #tools/ui-test
# Review these sections:
# - Dropdown System (Header-Accurate)
# - Grid System Demonstration  
# - Typography Scale System
# - Color System Variables
# - Form Element System
# - Button Grid System
# - Loading Elements
# - Graph Elements
# - Canvas Elements
# - Layout Calculations Debug
```

#### 1.2 Pattern Identification
```javascript
// Document findings:
const requiredComponents = [
    {
        type: 'dropdown',
        reference: 'UI Test Tool → Dropdown System (Header-Accurate)',
        library: 'ComponentLibrary.createDropdown()',
        exists: true
    },
    {
        type: 'custom-component',
        reference: 'Not found in UI Test Tool',
        library: 'None available',
        exists: false,
        action: 'Add to UI Test Tool first'
    }
];
```

### Phase 2: Implementation Strategy

#### 2.1 Using Existing Components
```javascript
// Example: Adding a dropdown to new section
const layout = ComponentLibrary.getLayout();

const filterDropdown = ComponentLibrary.createDropdown({
    triggerText: 'Filter Items',
    items: ['All', 'Category A', 'Category B', 'Category C'],
    width: layout.gridWidth
});

filterDropdown.bindEvents((selectedItem, index) => {
    console.log('User selected:', selectedItem);
    this.filterItems(selectedItem);
});

container.appendChild(filterDropdown.container);
```

#### 2.2 Creating New Components

**Step 1: Add to UI Test Tool First**
```javascript
// In assets/js/tools/ui-test-tool.js
createNewComponentDemo() {
    const section = this.createSectionContainer('New Component Name');
    
    // Implement following SiteBoy patterns:
    // - Syne Mono font family
    // - Mathematical spacing (header-height multiples)
    // - Outline borders (not border)
    // - Standard hover effects
    // - VGA color variables
    
    const newComponent = document.createElement('div');
    newComponent.style.cssText = `
        width: ${this.layout.gridWidth}px;
        margin: 0 auto;
        font-family: 'Syne Mono', monospace;
        outline: var(--outline-width) solid var(--c-border);
        background: var(--c-bg);
        color: var(--c-text);
    `;
    
    section.appendChild(newComponent);
    this.container.appendChild(section);
}
```

**Step 2: Extract to ComponentLibrary**
```javascript
// In assets/js/shared/component-library.js
/**
 * Create new component
 * Reference: UI Test Tool → "New Component Name"
 * 
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Component element
 */
createNewComponent(options) {
    const layout = this.getLayout();
    
    // Extract EXACT implementation from UI Test Tool
    // Parameterize but maintain styling/behavior
    
    return componentElement;
}
```

**Step 3: Update UI Test Tool to Use Library**
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

### Phase 3: Quality Assurance

#### 3.1 Component Validation Checklist
```markdown
- [ ] **UI Test Tool Reference**: Component exists in UI Test Tool
- [ ] **Visual Consistency**: Matches UI Test Tool exactly
- [ ] **ComponentLibrary Usage**: Uses library function, not custom implementation
- [ ] **Mathematical Precision**: Uses layout.headerHeight multiples for spacing
- [ ] **Typography**: Uses Syne Mono font family exclusively
- [ ] **Color Variables**: Uses only var(--c-*) color variables
- [ ] **Border Style**: Uses outline (not border) for pixel-perfect alignment
- [ ] **Hover Effects**: Follows standard pattern (outline-color + z-index)
- [ ] **Responsive**: Works with layout.gridWidth calculations
- [ ] **Documentation**: Function documented with UI Test Tool reference
```

#### 3.2 Testing Protocol
```javascript
// Test the component implementation
function testComponentConsistency() {
    // 1. Visual comparison with UI Test Tool
    console.log('1. Navigate to #tools/ui-test');
    console.log('2. Compare component styling');
    
    // 2. Functionality testing
    console.log('3. Test all interactive states');
    console.log('4. Verify hover effects');
    
    // 3. Layout validation
    console.log('5. Check mathematical precision');
    console.log('6. Verify responsive behavior');
    
    // 4. Code review
    console.log('7. Confirm ComponentLibrary usage');
    console.log('8. Check for custom implementations');
}
```

### Phase 4: Documentation

#### 4.1 Component Documentation Template
```markdown
## ComponentName

**Reference**: UI Test Tool → "Component Section Name"  
**Implementation**: `ComponentLibrary.createComponentName()`  
**Usage**: Brief description of component purpose

### Parameters
- `param1` (type): Description
- `param2` (type): Description

### Example
```javascript
const component = ComponentLibrary.createComponentName({
    param1: 'value',
    param2: 'value'
});

container.appendChild(component);
```

### Features
- ✅ Feature 1
- ✅ Feature 2
- ✅ Standard SiteBoy patterns

### UI Test Tool Reference
Navigate to `#tools/ui-test` → "Component Section Name" to see live example.
```

#### 4.2 Update Documentation Files
```bash
# Files to update:
# 1. docs/component-documentation/component-reference-documentation.md
# 2. docs/component-documentation/component-usage-examples.md
# 3. docs/COMPONENT-REFERENCE-SYSTEM.md (if major addition)
```

## Section Integration Template

### Adding ComponentLibrary to New Section

```javascript
const NewSection = {
    version: '1.0.0',
    dependencies: ['CONFIG', 'Router', 'LayoutStructure', 'ComponentLibrary'], // Add ComponentLibrary
    
    init() {
        // Check dependencies including ComponentLibrary
        if (!this.checkDependencies()) {
            console.error('❌ Missing dependencies');
            return false;
        }
        
        this.buildSectionDropdown();
        // ... rest of initialization
    },
    
    checkDependencies() {
        const missing = this.dependencies.filter(dep => !window[dep]);
        if (missing.length > 0) {
            console.error(`Missing dependencies: ${missing.join(', ')}`);
            return false;
        }
        return true;
    },
    
    buildSectionDropdown() {
        const moduleDropdown = document.getElementById('module-dropdown');
        if (!moduleDropdown) return;
        
        moduleDropdown.innerHTML = '';
        
        // Prepare navigation items
        const navigationItems = [
            {
                id: 'overview',
                title: 'Section Overview',
                icon: '◉',
                href: '#newsection',
                onClick: () => this.showOverview()
            }
            // ... more items
        ];
        
        // Use ComponentLibrary
        const dropdownContent = ComponentLibrary.createSectionDropdown({
            items: navigationItems,
            currentItem: this.currentItem,
            onItemClick: (item) => item.onClick?.()
        });
        
        moduleDropdown.appendChild(dropdownContent);
    }
};
```

## Common Patterns Reference

### 1. Standard Layout Pattern
```javascript
const layout = ComponentLibrary.getLayout();
// Use layout.gridWidth, layout.headerHeight, layout.cols, layout.boxSize, layout.gap
```

### 2. Standard Color Pattern
```css
/* Use only these color variables */
background: var(--c-bg);
color: var(--c-text);
outline: var(--outline-width) solid var(--c-border);
```

### 3. Standard Typography Pattern
```css
font-family: 'Syne Mono', monospace;
font-size: 12px;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### 4. Standard Hover Effect Pattern
```javascript
element.addEventListener('mouseenter', () => {
    element.style.outlineColor = 'var(--c-text)';
    element.style.zIndex = '2';
});

element.addEventListener('mouseleave', () => {
    element.style.outlineColor = '';
    element.style.zIndex = '';
});
```

## Troubleshooting Guide

### Issue: Component doesn't match UI Test Tool
**Solution**: 
1. Copy exact implementation from UI Test Tool
2. Ensure parameterization doesn't change styling
3. Use browser dev tools to compare styles

### Issue: ComponentLibrary function not found
**Solution**:
1. Check ComponentLibrary is loaded: `console.log(window.ComponentLibrary)`
2. Verify dependency order in HTML
3. Check for typos in function name

### Issue: Layout calculations incorrect
**Solution**:
1. Use `ComponentLibrary.getLayout()` for all calculations
2. Verify LayoutStructure is available
3. Check console for calculation errors

### Issue: Custom implementation created instead of using library
**Solution**:
1. Review this workflow template
2. Check UI Test Tool for existing patterns
3. Refactor to use ComponentLibrary functions

---

## Quick Reference Checklist

**Before Writing Any UI Code:**
- [ ] Checked UI Test Tool for existing pattern
- [ ] Reviewed ComponentLibrary functions
- [ ] Planned component extraction if needed
- [ ] Documented UI Test Tool reference

**During Implementation:**
- [ ] Using ComponentLibrary functions only
- [ ] Following SiteBoy design patterns
- [ ] Testing visual consistency with UI Test Tool
- [ ] Applying standard hover effects

**Before Committing:**
- [ ] Component validation checklist complete
- [ ] Documentation updated
- [ ] UI Test Tool reference confirmed
- [ ] No custom UI implementations

**Remember**: The UI Test Tool is the single source of truth for all component designs. When in doubt, reference the UI Test Tool first. 