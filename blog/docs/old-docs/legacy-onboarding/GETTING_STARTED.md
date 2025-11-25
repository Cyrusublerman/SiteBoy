# SiteBoy - Getting Started for AI Agents

Welcome to SiteBoy, a mathematically precise, 4-bit VGA aesthetic website framework. This guide will bring you up to speed quickly so you can continue development without compromising the project's unique architectural integrity.

## Core Project Philosophy

### Non-Negotiable Principles
1. **4-Bit VGA Aesthetic**: Authentic late 90s computing design with 16-color palette
2. **Mathematical Precision**: Swiss grid layouts with pixel-perfect calculations
3. **Performance First**: Sub-50KB page loads, universal compatibility
4. **Modular Architecture**: Self-contained, reusable components
5. **No Modern CSS**: No flexbox, transforms, gradients - only basic CSS properties

### Design Constraints
- **Fixed 800px width** layouts (800x600 display target)
- **VGA 16-color palette** exclusively (no hex colors outside palette)
- **System fonts only** (Arial, Times New Roman, Courier New)
- **Pressed-together borders** with zero gaps between elements
- **Mathematical layout calculations** for all positioning

## Project Structure Overview

```
SiteBoy/
├── assets/                    # Runtime assets
│   ├── js/                   # Modular JavaScript architecture
│   │   ├── core/            # Core system (config, app, router)
│   │   ├── layout/          # Layout & UI systems
│   │   ├── sections/        # Section-specific modules
│   │   ├── tools/           # Interactive tools
│   │   └── utils/           # Shared utilities (NEW)
│   ├── css/                 # Stylesheets
│   └── images/              # VGA-compatible images
├── scripts/                  # Development tools
│   ├── page-generation/     # Page building utilities
│   └── utils/               # Dev server, build system
├── templates/               # HTML page templates
├── docs/                    # Comprehensive documentation
│   ├── ARCHITECTURE.md      # Complete system guide
│   ├── MODULARIZATION.md    # Modular development patterns
│   ├── RULES.md             # Development standards
│   └── onboarding/          # New developer guides
└── reference/               # Design specs and strategy
```

## Immediate Orientation

### 1. Read These Documents First (in order)
1. **This file** - Basic orientation and philosophy
2. `docs/ARCHITECTURE.md` - Complete system understanding
3. `docs/RULES.md` - Development standards and patterns
4. `assets/js/README.md` - JavaScript architecture

### 2. Key Configuration Files
- `assets/js/core/config.js` - Central configuration system
- `reference/design.md` - Visual design specifications
- `docs/changes.md` - Historical decisions and reasoning

### 3. Current Development State
**Recent Major Changes:**
- ✅ **Modularization System**: Page templates and component generators implemented
- ✅ **Code Reorganization**: JavaScript files organized into logical directories
- ✅ **Shared Utilities**: Eliminated code duplication with utils/ modules
- ✅ **Documentation Overhaul**: Comprehensive guides for each subsystem

**Current Status:**
- **Fully functional**: Development server, page generation, core framework
- **Well documented**: Every system has comprehensive README files
- **Standards compliant**: All code follows established patterns
- **Ready for extension**: Modular architecture supports easy feature addition

## Development Environment Setup

### 1. Start Development Server
```bash
# Navigate to project root
cd SiteBoy

# Start development server (Python-based)
python server.py
# Available at http://localhost:8000

# Alternative: Node.js development server
node scripts/utils/dev-server.js
# Available at http://localhost:3000
```

### 2. Test Page Generation
```bash
# Create a sample page to test system
.\scripts\page-generation\build-page.ps1 -Command create -Type basic -Title "Test" -Output "test.html"

# View generated page in browser
# Should display with proper VGA styling and grid layout
```

### 3. Verify Module Architecture
```bash
# Open browser console on any page
# Check that all modules are loaded
App.getSystemStatus()

# Verify shared utilities
console.log(DOMUtils.version, LayoutUtils.version, ErrorHandler.version)
```

## Core Technical Concepts

### 1. Grid System Mathematics
All layouts use precise mathematical calculations:
```javascript
// Standard section width calculation
const layout = LayoutUtils.computeLayout();
const rowWidth = layout.gridWidth - (layout.headerHeight * 4);

// Grid item sizing
const itemWidth = (totalWidth - totalGapWidth) / columns;
```

### 2. VGA Color System
Only these 16 colors are allowed:
- Black (#000000), White (#FFFFFF)
- Primary: Red (#FF0000), Green (#00FF00), Blue (#0000FF)
- Secondary: Cyan (#00FFFF), Magenta (#FF00FF), Yellow (#FFFF00)
- Grays: Silver (#C0C0C0), Gray (#808080)
- Dark variants: Maroon, Navy, Teal, Olive, Purple, Lime

### 3. Module Pattern
Every JavaScript module follows this structure:
```javascript
const ModuleName = {
    version: '1.0.0',
    dependencies: ['CONFIG', 'DOMUtils'],
    init() { /* initialization */ },
    checkDependencies() { /* validation */ },
    destroy() { /* cleanup */ }
};
window.ModuleName = ModuleName;
```

### 4. Border Treatment
**Critical Rule**: Use `outline` instead of `border` to prevent layout shifts:
```css
/* Correct */
outline: var(--outline-width) solid var(--c-border);

/* Incorrect - causes layout issues */
border: 2px solid black;
```

## Common Development Tasks

### Creating New Pages
```bash
# Basic page
node scripts/page-generation/build-page.js create basic "Page Title" "output.html"

# Section page (for galleries, lists)
node scripts/page-generation/build-page.js create section "Art Gallery" "art.html"

# Tool page (for interactive utilities)
node scripts/page-generation/build-page.js create tool "Typography Tool" "tools/typography.html"
```

### Adding New Modules
1. **Choose correct directory**: `core/`, `layout/`, `sections/`, `tools/`, or `utils/`
2. **Follow module pattern**: Use established structure with dependencies
3. **Use shared utilities**: Leverage `DOMUtils`, `LayoutUtils`, `ErrorHandler`
4. **Test thoroughly**: Verify module loads and functions correctly

### Modifying Existing Code
1. **Read module README**: Understand purpose and patterns
2. **Check dependencies**: Ensure changes don't break other modules
3. **Follow conventions**: Use existing naming and structure patterns
4. **Test across sections**: Verify changes work throughout site

## Design System Compliance

### Layout Standards
- **800px total width** for all content areas
- **30px header height** (var(--header-height))
- **16px gap** between grid items (var(--gap))
- **2px outline width** for all borders (var(--outline-width))

### Interaction Patterns
- **Standard hover effects**: outline-color change + z-index increase
- **No custom animations**: Only simple state changes allowed
- **Keyboard navigation**: All interactive elements must support Tab navigation
- **Performance requirements**: 60fps for all interactions

### Content Guidelines
- **Uppercase headings**: Section headers in uppercase with letter-spacing
- **System fonts only**: No custom font loading
- **Minimal text**: Concise, technical language preferred
- **No modern imagery**: Avoid gradients, shadows, complex graphics

## Troubleshooting Guide

### Common Issues

**"Module not found" errors:**
- Check script loading order in HTML files
- Verify file paths after reorganization
- Ensure dependencies are loaded before dependent modules

**Layout calculation errors:**
- Use `LayoutUtils.validateLayout()` to check calculations
- Verify viewport dimensions are available
- Check CSS variables are properly defined

**Styling inconsistencies:**
- Use shared utilities instead of inline styles
- Follow outline vs border rules
- Check VGA color palette compliance

**Page generation failures:**
- Verify template files exist in `templates/` directory
- Check file permissions on output directories
- Ensure Node.js/PowerShell environment is properly configured

### Debug Tools
```javascript
// System status
App.getSystemStatus()

// Error tracking
ErrorHandler.getStats()
ErrorHandler.getHistory(5)

// Layout debugging
LayoutStructure.debugMode = true
LayoutUtils.validateLayout(LayoutUtils.computeLayout())

// Module dependencies
ModuleName.checkDependencies()
```

## Next Steps for New AI Agents

### Immediate Actions
1. **Start development server** and explore existing pages
2. **Generate a test page** using page templates
3. **Read architecture documentation** thoroughly
4. **Examine existing modules** to understand patterns
5. **Test shared utilities** in browser console

### Understanding the Codebase
1. **Study `assets/js/core/config.js`** - Central configuration
2. **Examine `assets/js/utils/`** - Shared functionality
3. **Review section modules** - See patterns in practice
4. **Check tool implementations** - Interactive component examples

### Before Making Changes
1. **Understand the "why"** behind existing patterns
2. **Test current functionality** to establish baseline
3. **Plan changes** to maintain architectural integrity
4. **Document decisions** in appropriate README files

## Development Philosophy Reminder

SiteBoy is intentionally constrained to authentic late 90s computing limitations while achieving modern performance and maintainability. Every design decision serves the goal of creating a unique aesthetic that stands apart from contemporary web design trends.

**Never compromise on:**
- Mathematical precision in layouts
- VGA color palette adherence
- Performance requirements (sub-50KB)
- Modular architecture principles
- Documentation completeness

**Always ask:**
- Does this maintain the 4-bit VGA aesthetic?
- Is this mathematically precise?
- Does this follow established patterns?
- Is this properly documented?
- Will future developers understand this?

## Getting Help

### Documentation Hierarchy
1. **Module README files** - Specific subsystem documentation
2. **`docs/ARCHITECTURE.md`** - Complete system overview
3. **`docs/RULES.md`** - Development standards and patterns
4. **`docs/changes.md`** - Historical context and decisions

### Testing Resources
- Browser console for real-time debugging
- Development server with live reload
- Module dependency validation systems
- Comprehensive error logging and tracking

This guide should provide sufficient context to begin meaningful contribution to SiteBoy while respecting its unique constraints and architectural decisions. The 4-bit VGA aesthetic and mathematical precision are not mere stylistic choices - they are fundamental to the project's identity and must be preserved in all future development. 