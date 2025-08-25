# OOP Component Architecture Reference Documentation

## Overview

The SiteBoy framework uses a **true Object-Oriented Programming (OOP) inheritance architecture** where all UI components inherit from BaseComponent classes. This eliminates code duplication and ensures mathematical precision throughout the framework.

**Architecture Version**: OOP Inheritance v1.0.0  
**BaseComponent System**: `assets/js/core/base-component.js`  
**Specialized Components**: `assets/js/shared/specialized-components.js`
**Pattern**: Pure inheritance - no manual DOM creation allowed

## Core BaseComponent Classes

### 1. BaseComponent (Foundation)

**Base class for ALL UI elements**

Creates the foundation for all SiteBoy components with mathematical precision and proper lifecycle management.

**Constructor Options**:
- `options` (Object): Configuration object passed to component

**Core Methods**:
- `calculateDimensions(componentType, customOptions)`: Uses MathematicalFoundation for calculations
- `applyLayout(element)`: Applies mathematical layout to element
- `render()`: Must be implemented by subclass - returns DOM element
- `destroy()`: Cleanup DOM and references
- `getConstants()`: Returns MathematicalFoundation constants

**Example**:
```javascript
class CustomComponent extends BaseComponent {
    constructor(options) {
        super(options);
        // Custom initialization
    }
    
    render() {
        this.calculateDimensions('custom-type');
        
        this.element = document.createElement('div');
        this.element.className = 'custom-component';
        
        this.applyLayout();
        
        return this.element;
    }
}
```

**Features**:
- ✅ Mathematical precision through MathematicalFoundation
- ✅ Consistent lifecycle management  
- ✅ Automatic dimension calculations
- ✅ Proper memory cleanup

---

### 2. BaseDropdown extends BaseComponent

**Standard dropdown structure and behavior**

All dropdown implementations must inherit from this class.

**Constructor Options**:
- `triggerText` (string): Text displayed on trigger button
- `items` (Array): Dropdown menu items
- `onItemClick` (function): Click handler for menu items

**Methods**:
- `createTrigger()`: Creates standard trigger structure (all dropdowns use this)
- `createMenu()`: Creates base menu container
- `populateMenu(menu)`: **Override in subclasses** for custom menu content
- `open()` / `close()`: Standard dropdown behavior
- `toggle()`: Toggle dropdown state

**Example**:
```javascript
const dropdown = new BaseDropdown({
    triggerText: 'Select Option',
    items: ['Option 1', 'Option 2', 'Option 3'],
    onItemClick: (item, index) => {
        console.log('Selected:', item);
    }
});

const element = dropdown.render();
container.appendChild(element);

// Cleanup when done
dropdown.destroy();
```

**Features**:
- ✅ Consistent trigger styling across all dropdowns
- ✅ Standard open/close behavior
- ✅ Mathematical spacing calculations
- ✅ Hover effects and interactions

---

### 3. BaseGrid extends BaseComponent

**Mathematical grid layouts with inheritance**

All grid implementations must inherit from this class.

**Constructor Options**:
- `items` (Array): Grid items to display
- `cols` (number): Number of columns
- `onItemClick` (function): Click handler for grid items

**Methods**:
- `populateGrid()`: Creates grid structure using MathematicalFoundation
- `populateGridItem(gridItem, item, index)`: **Override in subclasses** for custom item content

**Example**:
```javascript
const grid = new BaseGrid({
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
    cols: 2,
    onItemClick: (item, index) => {
        console.log('Grid item clicked:', item);
    }
});

const element = grid.render();
container.appendChild(element);

// Cleanup when done
grid.destroy();
```

**Features**:
- ✅ Mathematical grid calculations
- ✅ Consistent spacing and alignment
- ✅ Standard hover effects
- ✅ Responsive column management

---

### 4. BaseButton extends BaseComponent

**Consistent button styling and interactions**

All button implementations must inherit from this class.

**Constructor Options**:
- `text` (string): Button text
- `onClick` (function): Click handler
- `type` (string): Button type ('default', 'primary', 'secondary')

**Methods**:
- `applyButtonType()`: **Override in subclasses** for custom button styling

**Example**:
```javascript
const button = new BaseButton({
    text: 'Click Me',
    onClick: () => {
        console.log('Button clicked!');
    },
    type: 'primary'
});

const element = button.render();
container.appendChild(element);

// Cleanup when done
button.destroy();
```

**Features**:
- ✅ Consistent button styling
- ✅ Standard hover effects
- ✅ Mathematical sizing
- ✅ Type-based styling system

## Specialized Component Implementations

### 1. HeaderDropdown extends BaseDropdown

**Header-specific dropdown positioning**

Inherits all BaseDropdown functionality and adds header-specific positioning.

**Usage**:
```javascript
const headerDropdown = new HeaderDropdown({
    triggerText: 'Menu',
    items: ['Home', 'About', 'Contact']
});
```

**Specialization**:
- Header-specific positioning styles
- Z-index management for header context

---

### 2. SectionDropdown extends BaseDropdown

**Section navigation menus**

Inherits BaseDropdown and adds section-specific menu structure.

**Constructor Options** (extends BaseDropdown):
- `currentSection` (string): Currently active section

**Menu Structure**:
- Category headers with collapse functionality
- Active item highlighting
- Section-specific icons

**Usage**:
```javascript
const sectionDropdown = new SectionDropdown({
    triggerText: 'Navigate',
    items: [
        { type: 'header', title: 'Blog' },
        { title: 'Music Theory', icon: '>', href: '#blog/music' },
        { title: 'Site Development', icon: '>', href: '#blog/dev' }
    ],
    currentSection: 'blog'
});
```

---

### 3. VGAGrid extends BaseGrid

**VGA color-specific grid functionality**

Inherits BaseGrid and adds color-specific captions and hex display.

**Constructor Options** (extends BaseGrid):
- `colorPalette` (Array): Array of color objects
- `showHex` (boolean): Whether to show hex values (default: true)

**Usage**:
```javascript
const vgaGrid = new VGAGrid({
    items: [
        { name: 'Red', value: '#FF0000' },
        { name: 'Green', value: '#00FF00' },
        { name: 'Blue', value: '#0000FF' }
    ],
    cols: 3,
    showHex: true,
    onItemClick: (color, index) => {
        console.log(`Color: ${color.name} = ${color.value}`);
    }
});
```

**Specialization**:
- Color swatch display
- Hex value captions
- Color-specific hover effects

---

### 4. ButtonGroup extends BaseComponent

**Manages multiple HeaderButton instances**

Creates mathematically distributed button groups using HeaderButton inheritance.

**Constructor Options**:
- `buttons` (Array): Array of button configurations
- `contextType` (string): Context for mathematical calculations

**Usage**:
```javascript
const buttonGroup = new ButtonGroup({
    buttons: [
        { text: 'Save', onClick: () => this.save() },
        { text: 'Load', onClick: () => this.load() },
        { text: 'Cancel', onClick: () => this.cancel() }
    ],
    contextType: 'toolbar'
});
```

**Features**:
- Mathematical width distribution
- Border collapse patterns
- Manages HeaderButton instances internally

---

### 5. MathematicalCanvas extends BaseComponent

**Mathematical demonstrations with precision**

Canvas component for precise mathematical visualizations.

**Constructor Options**:
- `width` (number): Canvas width
- `height` (number): Canvas height
- `drawFunction` (function): Initial drawing function

**Methods**:
- `draw(drawFunction)`: Execute drawing function
- `clear()`: Clear canvas content

**Usage**:
```javascript
const canvas = new MathematicalCanvas({
    width: 400,
    height: 300,
    drawFunction: (ctx, width, height) => {
        // Drawing code
        ctx.strokeStyle = '#FF0000';
        ctx.strokeRect(0, 0, width, height);
    }
});
```

---

### 6. ProgressBar extends BaseComponent

**Progress indication with mathematical timing**

Progress component with mathematical precision and timing functions.

**Constructor Options**:
- `value` (number): Initial progress value (0-100)
- `showText` (boolean): Whether to show text overlay
- `textFunction` (function): Custom text generation function

**Methods**:
- `setValue(value)`: Update progress value
- `updateText()`: Update text display

**Usage**:
```javascript
const progressBar = new ProgressBar({
    value: 0,
    showText: true,
    textFunction: (value) => `${Math.round(value)}% Complete`
});

// Update progress
progressBar.setValue(50);
```

## Component Lifecycle Management

### Instance Tracking Pattern
```javascript
// In every section/tool that uses OOP components
this.componentInstances = [];

// When creating components
const component = new SomeComponent(options);
this.componentInstances.push(component);

// During cleanup/navigation
cleanup() {
    this.componentInstances.forEach(component => {
        if (component && typeof component.destroy === 'function') {
            component.destroy();
        }
    });
    this.componentInstances = [];
}
```

### Memory Management
All BaseComponent classes implement proper cleanup:

```javascript
destroy() {
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.dimensions = null;
    this.isInitialized = false;
}
```

## Mathematical Foundation Integration

### Single Source of Truth
All components use `MathematicalFoundation.calculateComponentDimensions()`:

```javascript
// Every component follows this pattern
calculateDimensions(componentType, customOptions = {}) {
    const mergedOptions = { ...this.options, ...customOptions };
    this.dimensions = this.foundation.calculateComponentDimensions(componentType, mergedOptions);
    return this.dimensions;
}
```

### Layout Application
```javascript
applyLayout(element = null) {
    const target = element || this.element;
    if (!target || !this.dimensions) return;
    
    this.foundation.applyMathematicalLayout(target, this.dimensions);
}
```

## Architecture Validation

### Browser Console Checks
```javascript
// Verify OOP architecture
BaseComponent // Should be available
BaseDropdown instanceof Function // Should return true
BaseGrid instanceof Function // Should return true

// Check component inheritance
someComponent instanceof BaseComponent // Should return true
someDropdown instanceof BaseDropdown // Should return true

// Validate mathematical foundation
typeof MathematicalFoundation.calculateComponentDimensions // Should be 'function'
```

### Component Creation Validation
```javascript
// ✅ CORRECT - OOP inheritance
const dropdown = new SectionDropdown(options);
console.log(dropdown instanceof BaseDropdown); // true
console.log(dropdown instanceof BaseComponent); // true

// ❌ WRONG - Manual DOM creation (FORBIDDEN)
const div = document.createElement('div'); // No longer allowed
```

## Benefits of OOP Architecture

### 1. Zero Code Duplication
- **Impossible to create inconsistent components** - all inherit same base behavior
- **Single point of change** - modify BaseComponent affects all children
- **Consistent styling** - all components use same mathematical foundation

### 2. Mathematical Precision
- **Single calculation source**: `MathematicalFoundation`
- **Pixel-perfect alignment**: All components use same dimensional system
- **Consistent spacing**: Mathematical relationships maintained

### 3. Memory Management
- **Proper lifecycle**: All components have `.destroy()` methods
- **Instance tracking**: Easy to manage component references
- **Memory efficiency**: Automatic cleanup prevents leaks

### 4. Type Safety
- **Inheritance validation**: `instanceof` checks work correctly
- **Method availability**: All components have consistent API
- **Error prevention**: Type checking prevents misuse

## Migration Guide

### From Manual DOM Creation
```javascript
// OLD (no longer allowed)
const dropdown = document.createElement('div');
dropdown.style.cssText = `/* manual styles */`;
// ... 50+ lines of manual creation

// NEW (required)
const dropdown = new SectionDropdown(options);
const element = dropdown.render();
this.componentInstances.push(dropdown);
```

### From ComponentLibrary Functions
```javascript
// OLD (deprecated)
const { container } = ComponentLibrary.createDropdown(options);

// NEW (preferred)
const dropdown = new SectionDropdown(options);
const container = dropdown.render();
this.componentInstances.push(dropdown);
```

---

This OOP architecture ensures **zero code duplication**, **mathematical precision**, and **maintainable inheritance chains** throughout the SiteBoy framework. 