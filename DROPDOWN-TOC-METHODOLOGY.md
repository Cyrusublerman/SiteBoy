# Dropdown & TOC Methodology - SiteBoy Framework

## 🎯 **UNIFIED APPROACH FOR INTERACTIVE COMPONENTS**

This document outlines the solid methodology for dropdowns, TOCs, and all expand/collapse UI patterns in the SiteBoy framework.

## **📊 SHARED FOUNDATION ARCHITECTURE**

### **CollapsibleBase Class**
```javascript
// Base class for ALL expand/collapse patterns
export class CollapsibleBase extends BaseComponent {
    // ✅ Unified state management
    isOpen: boolean
    items: Array
    onToggle: Function
    onSelect: Function
    
    // ✅ Consistent methods
    toggle() 
    open()
    close()
    
    // ✅ Unified keyboard navigation
    handleKeydown(event) // Arrow keys, Enter, Escape, Home, End
    navigateDown()
    navigateUp()
    focusFirst()
    focusLast()
    selectCurrent()
}
```

### **Shared Patterns**
- **State Management**: `isOpen` boolean with `toggle()`, `open()`, `close()`
- **Keyboard Navigation**: Arrow keys, Enter/Space, Escape, Home/End
- **Accessibility**: ARIA roles, expanded states, focus management
- **Mathematical Foundation**: F=12px sizing and positioning
- **Event Handling**: Consistent click, hover, focus patterns

## **🔽 DROPDOWN COMPONENT**

### **Features**
```javascript
// Usage Example
const dropdown = new ComponentLibrary.Dropdown({
    triggerText: 'SECTIONS',
    items: [
        { label: 'HOME', value: 'home' },
        { label: 'BLOG', value: 'blog' },
        { label: 'ART', value: 'art' }
    ],
    position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
    onSelect: (item) => Router.navigateToSection(item.value)
}, { MF: MathematicalFoundation, Resize: ResizeManager });
```

### **Smart Positioning**
- **Auto-flip**: Dropdown flips to top if no space below
- **Viewport aware**: Calculates available space dynamically
- **Configurable**: `bottom-left`, `bottom-right`, `top-left`, `top-right`

### **Accessibility**
- ✅ **ARIA roles**: `button[aria-haspopup]`, `menu`, `menuitem`
- ✅ **Keyboard navigation**: Full arrow key support
- ✅ **Focus management**: Auto-focus on open, restore on close
- ✅ **Screen reader**: Proper expanded/collapsed states

## **📋 TOC ENHANCEMENT APPROACH**

### **Current HierarchicalTOC**
The existing TOC already follows good patterns:
- Mathematical Foundation sizing
- Event-driven expand/collapse
- Proper section/subsection hierarchy

### **Potential Enhancement**
```javascript
// Future: HierarchicalTOC could extend CollapsibleBase
export class HierarchicalTOC extends CollapsibleBase {
    // Inherit: keyboard navigation, state management
    // Custom: section-specific rendering, mathematical sizing
}
```

## **🎨 VISUAL CONSISTENCY**

### **VGA/Mono Constraints**
```css
.dropdown-trigger, .toc-section-header {
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid var(--c-border);
    background: var(--c-bg);
    color: var(--c-text);
}

.dropdown-item, .toc-subsection {
    padding: var(--f);
    border-bottom: 1px solid var(--c-border);
    cursor: pointer;
}
```

### **Mathematical Precision**
- **F=12px base**: All sizing derives from Mathematical Foundation
- **Padding**: `var(--f)` (12px)
- **Height**: `calc(var(--f) * 2)` (24px)
- **Max dropdown height**: `calc(var(--f) * 25)` (300px)

## **⌨️ UNIFIED KEYBOARD BEHAVIOR**

### **Standard Navigation**
```
↓ / → = Navigate down/forward
↑ / ← = Navigate up/backward  
Enter/Space = Select current item
Escape = Close dropdown/collapse
Home = Focus first item
End = Focus last item
```

### **Focus Management**
1. **On open**: Auto-focus first item
2. **During navigation**: Visual and programmatic focus sync
3. **On close**: Return focus to trigger
4. **Mouse interaction**: Update keyboard position

## **🔧 IMPLEMENTATION CHECKLIST**

### **For ANY New Interactive Component:**

1. **✅ Extend CollapsibleBase** (if expand/collapse behavior)
2. **✅ Use Mathematical Foundation** for all sizing
3. **✅ Follow VGA/Mono styling** constraints
4. **✅ Implement ARIA** roles and states
5. **✅ Add keyboard navigation** via inherited methods
6. **✅ Include hover/focus** visual feedback
7. **✅ Test accessibility** with screen readers

### **Component Requirements:**
```javascript
// Required constructor pattern
constructor(options = {}, deps = {}) {
    super({ ...options, componentType: 'yourtype' }, deps);
    // Your specific properties
}

// Required methods
render() // Create and return DOM element
updateVisibility() // Handle show/hide logic (if collapsible)
destroy() // Cleanup event listeners
```

## **🎯 USAGE PATTERNS**

### **Header Dropdown (Phase 1)**
```javascript
// In PageHeader component
const sectionsDropdown = new ComponentLibrary.Dropdown({
    triggerText: 'SECTIONS',
    items: [
        { label: 'HOME', value: 'home' },
        { label: 'BLOG', value: 'blog' },
        { label: 'ART', value: 'art' },
        { label: 'TOOLS', value: 'tools' },
        { label: 'PROJECTS', value: 'projects' }
    ],
    onSelect: (item) => Router.navigateToSection(item.value)
}, { MF: this.deps.MF, Resize: this.deps.Resize });
```

### **Subheader Dropdown (Phase 1)**
```javascript
// In Subheader component  
const pageDropdown = new ComponentLibrary.Dropdown({
    triggerText: 'MUSIC THEORY',
    items: blogPages, // Dynamic list
    onSelect: (item) => Router.navigateToPage(item.path)
}, { MF: this.deps.MF, Resize: this.deps.Resize });
```

## **🔄 BENEFITS OF THIS METHODOLOGY**

### **Consistency**
- **Same keyboard behavior** across all interactive components
- **Same visual treatment** following VGA/Mono constraints
- **Same accessibility** patterns and ARIA implementation

### **Maintainability** 
- **Shared base class** means bug fixes benefit all components
- **Centralized logic** for common patterns (focus, keyboard, etc.)
- **Mathematical Foundation** ensures precise, scalable sizing

### **Extensibility**
- **Easy to add** new dropdown/collapsible components
- **Configurable behavior** through options
- **Consistent API** for all interactive components

### **Accessibility**
- **Screen reader friendly** with proper ARIA roles
- **Keyboard accessible** with full navigation support
- **Focus management** follows best practices

## **🚀 NEXT STEPS**

1. **Wire PageHeader** to use new Dropdown for "SECTIONS"
2. **Enhance Subheader** to use Dropdown for page navigation  
3. **Test keyboard navigation** and accessibility
4. **Consider refactoring** HierarchicalTOC to extend CollapsibleBase
5. **Add more interactive components** using this foundation

This methodology ensures **every dropdown and collapsible component** in SiteBoy will be consistent, accessible, and mathematically precise! 🎉

