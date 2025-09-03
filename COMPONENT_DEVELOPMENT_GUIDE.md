# 🏗️ Component Development Guide - SiteBoy Framework

## 📋 DEVELOPMENT WORKFLOW FOR NEW COMPONENTS

### **🎯 GOLDEN RULES**

1. **ALWAYS develop in `/src/` structure**
2. **NEVER edit the bundled file directly**
3. **FOLLOW the existing patterns**
4. **UPDATE the bundle after changes**
5. **TEST thoroughly before deployment**

---

## 📂 **STEP 1: CREATE NEW COMPONENT**

### **File Location Pattern:**
```
src/components/
├── foundation/     # Base classes, core utilities
├── layout/         # Grid, Spacing, PageContainer
├── content/        # Heading, Paragraph, Media
├── interactive/    # Button, Input, Forms
├── graphs/         # Charts and data visualization  
├── specialized/    # Advanced widgets, Canvas
```

### **Template for New Component:**
```javascript
// src/components/[category]/MyNewComponent.js
import { BaseComponent } from '../foundation/BaseComponent.js';

/**
 * MyNewComponent - Brief description
 * 
 * @version 1.0.0
 * @category [foundation|layout|content|interactive|graphs|specialized]
 */
export class MyNewComponent extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'myNewComponent' }, deps);
        
        // Component-specific properties
        this.myProperty = options.myProperty || 'default';
    }
    
    render() {
        if (!this.element) {
            // Use MathematicalFoundation for calculations
            const layout = this.deps.MF?.computeLayout() || {};
            const F = this.deps.MF?.F || 12;
            
            // Create element using BaseComponent methods
            this.element = this.createElement('div', 'my-new-component');
            
            // Apply F=12px mathematical foundation
            this.element.style.cssText = `
                font-size: var(--f);
                padding: var(--f);
                /* Use CSS variables, not hard-coded values */
            `;
        }
        return this.element;
    }
    
    // Always implement destroy for cleanup
    destroy() {
        super.destroy();
        // Component-specific cleanup
    }
}
```

---

## 📋 **STEP 2: UPDATE MAIN INDEX**

**File:** `src/index.js`

```javascript
// Add import
import { MyNewComponent } from './components/[category]/MyNewComponent.js';

// Add to ComponentLibrary object
export const ComponentLibrary = {
    // ... existing components
    MyNewComponent,  // Add here
    
    create(type, options = {}, deps = {}) {
        const components = {
            // ... existing mappings
            myNewComponent: MyNewComponent,  // Add mapping
        };
        // ... rest of factory
    },
    
    // Add convenience method
    myNewComponent: (options = {}, deps) => 
        ComponentLibrary.create('myNewComponent', options, deps),
};
```

---

## 🔄 **STEP 3: REBUILD BUNDLE**

### **Option A: Manual Update (Current)**
```bash
# Copy updated source to bundle
cp src/index.js temp-bundle.js

# Convert to UMD format (remove exports, add UMD wrapper)
# This is manual for now until npm is available
```

### **Option B: Automated Build (When npm available)**
```bash
npm run build    # Builds src/index.js → dist/component-library.umd.js
```

---

## 🎨 **STEP 4: ADD CSS STYLES**

**File:** `assets/css/styles.css`

```css
/* Add component-specific styles */
.my-new-component {
    font-family: 'Space Mono', monospace;
    font-size: var(--f);
    background: var(--c-bg);
    color: var(--c-text);
    border: var(--outline-width) solid var(--c-border);
    /* Follow VGA color constraints */
}

.my-new-component:hover {
    background: var(--c-border);
    color: var(--c-bg);
}
```

---

## 🧪 **STEP 5: ADD TO UI TEST SUITE**

**File:** `assets/js/sections/tools_section.js`

```javascript
// Add to appropriate section in renderUITestTool()
{
    id: 'my-category',
    title: 'MY CATEGORY',
    components: [
        // ... existing components
        { id: 'my-new-component', title: 'MyNewComponent', method: 'renderMyNewComponentExample' }
    ]
},

// Add render method
renderMyNewComponentExample(container, id, title) {
    this.createSimpleComponentExample(container, id, title,
        'ComponentLibrary.MyNewComponent({ myProperty: "value" })',
        () => {
            const component = new ComponentLibrary.MyNewComponent({
                myProperty: 'Demo Value'
            }, { MF: window.MathematicalFoundation });
            
            this.componentInstances.push(component);
            return component.render();
        }
    );
}
```

---

## ⚠️ **CRITICAL PATTERNS TO FOLLOW**

### **✅ DO:**
- **Extend BaseComponent** for all UI components
- **Use CSS variables** (`var(--f)`, `var(--c-border)`, etc.)
- **Inject dependencies** via constructor deps parameter
- **Use MathematicalFoundation** for calculations
- **Follow F=12px** mathematical foundation
- **Implement destroy()** method for cleanup
- **Add to ComponentLibrary** factory object
- **Test in UI test suite**

### **❌ DON'T:**
- Edit `dist/component-library.umd.js` directly
- Use hard-coded pixel values
- Skip CSS variables
- Forget to update the main index
- Use non-VGA colors
- Skip the destroy method

---

## 📁 **REFERENCE FILES TO CHECK**

### **Before Creating New Component:**
1. **Check existing patterns**: Look at similar components in `/src/components/`
2. **Check ComponentLibrary**: Review `src/index.js` factory structure
3. **Check CSS**: Review `assets/css/styles.css` for patterns
4. **Check UI Tests**: Look at `tools_section.js` examples

### **File Dependencies:**
```
src/index.js                 # Main component registry
assets/css/styles.css        # Component styling
tools_section.js             # UI test examples
dist/component-library.umd.js # Generated bundle (don't edit)
```

---

## 🔄 **DEVELOPMENT CYCLE**

```
1. Create component in /src/components/[category]/
2. Update src/index.js imports and factory
3. Add CSS styles to assets/css/styles.css
4. Add UI test to tools_section.js
5. Rebuild bundle (manual or npm run build)
6. Test at http://localhost:8000/#tools/ui-test
7. Verify no console errors
8. Deploy
```

---

## 🎯 **QUALITY CHECKLIST**

Before considering a component complete:

- [ ] **Extends BaseComponent** correctly
- [ ] **Uses dependency injection** (MF, Resize)
- [ ] **Follows F=12px** mathematical foundation
- [ ] **Uses CSS variables** exclusively
- [ ] **VGA color palette** compliance
- [ ] **Space Mono font** family
- [ ] **Implements destroy()** method
- [ ] **Added to ComponentLibrary** factory
- [ ] **CSS styles** added
- [ ] **UI test example** created
- [ ] **Bundle rebuilt** and tested
- [ ] **No console errors**
- [ ] **Responsive behavior** verified

---

## 🚀 **FUTURE AUTOMATION**

When npm/node becomes available, this workflow will be streamlined:

```bash
# Development workflow
npm run dev        # Watch mode - auto-rebuild on changes
npm run build      # Production build
npm run test       # Component tests
npm run lint       # Code quality checks
```

**This guide ensures consistency, quality, and maintainability as the component library grows!**

