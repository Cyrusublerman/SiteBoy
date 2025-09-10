# SiteBoy Website Rules

## DRY (Don't Repeat Yourself) Principles
1. All shared head content must be in `head.html`
2. All shared header content must be in `header.html` and included via `<div id="header-include"></div>`
3. All shared footer content must be in `footer.html` and included via `<div id="footer-include"></div>`
4. All shared components must be included using `include-shared.js`
5. All paths in includes must be relative to the current page location
6. **CRITICAL CSS must be loaded directly in HTML head to prevent FOUC**
7. No favicon integration - keep the browser default

## F=15px Mathematical Design System (MANDATORY)
1. **F=15px is the single source of truth** - All dimensions derive from base font size
2. **Header Height = F × 2 = 30px** - Not arbitrary, mathematically derived
3. **Desktop Margin = F × 4 = 60px** - Clean mathematical relationship
4. **Mobile Margin = F = 15px** - Covers scrollbar perfectly
5. **Typography Scale**: H1=F×6, H2=F×3, H3=F×2, H4=F×1.5, H5=F×1.2, H6=F×1, Body=F, Interface=F×0.8
6. **All spacing derives from F multiples** - No arbitrary constants allowed
7. **Grid calculations use F-based constants** in MathematicalFoundation

## OOP Architecture Requirements (MANDATORY)
1. **ALL UI components MUST inherit from BaseComponent classes** (`BaseComponent`, `BaseDropdown`, `BaseGrid`, `BaseButton`)
2. **NO manual DOM creation allowed** - use inheritance: `new VGAGrid()`, `new SectionDropdown()`, etc.
3. **MathematicalFoundation with F=15px is required** for all component calculations - single source of truth
4. **Component lifecycle management**: All components must have `.destroy()` methods for proper cleanup
5. **ComponentLibrary v6.0.0+**: Use only F-based OOP inheritance wrappers, not manual DOM creation
6. **Memory management**: Track component instances and destroy on cleanup
7. **Type safety**: Use `instanceof` checks to validate component types

## Code Consistency & F=15px Pattern Adherence
1. **ALWAYS use OOP inheritance** for UI components - zero exceptions
2. **ALWAYS use F-based calculations** - no hardcoded dimensions outside F multiples
3. **Use `outline` instead of `border` for pixel-perfect alignment** (prevents layout shifts)
4. **Follow standard hover effects**: `outline-color: var(--c-text)` + `z-index: 2` for grid items
5. **Never create custom hover implementations** - inherit from BaseComponent
6. **Grid layouts must use BaseGrid inheritance** with F-based MathematicalFoundation calculations
7. **Width calculations must be F-based**: Use `MathematicalFoundation.calculateComponentDimensions()`
8. **Search codebase for existing OOP implementations** before creating new solutions
9. **Header styling must match F-based standards**: F×2 height, F-based text, outline borders
10. **Avoid redundant styling** - if a BaseComponent exists, inherit from it
11. **Test alignment with browser dev tools** - elements must be F-precision aligned
12. **F=15px Typography Rule**: All typography calculations MUST derive from F=15px base. Header height = F×2 = 30px. All typography calculations MUST use F × multiplier relationships. Never hardcode typography sizes - always use F-based relationships.
13. **Grid Border Collapse Pattern**: For grids with touching borders, use `outline-left: none` on non-first items. Grid containers get NO borders, only individual items get outlines.
14. **Button Styling Rule**: NO 3D effects or beveled borders. Use flat `outline: 1px solid var(--c-border)` and simple background color changes on hover.
15. **Canvas Implementation Standard**: Canvas elements must demonstrate F-based mathematical precision, NOT boring placeholders. Include interactive elements, precise F-based grid alignment, and meaningful visual demonstrations.

## F=15px Component Creation Pattern (ENFORCED)
```javascript
// ✅ CORRECT - F-based OOP inheritance
const dropdown = new SectionDropdown({
    triggerText: 'Select Option',
    items: ['Item 1', 'Item 2'],
    onItemClick: (item) => console.log(item)
});
const element = dropdown.render(); // F-based dimensions automatic
container.appendChild(element);

// ❌ WRONG - Manual DOM creation (FORBIDDEN)
const div = document.createElement('div');
div.className = 'dropdown';
div.style.height = '30px'; // Hardcoded - should be F×2
// ... manual styling and event binding
```

## Component Hierarchy (MANDATORY F-BASED INHERITANCE)
```
BaseComponent (F=15px foundation for ALL UI elements)
├── BaseDropdown
│   ├── HeaderDropdown (header-specific positioning with F-based height)
│   └── SectionDropdown (section navigation with F-based dimensions)
├── BaseGrid
│   └── VGAGrid (color-specific functionality with F-based captions)
├── BaseButton
│   └── HeaderButton (F×2 height, F×0.8 text)
└── Specialized Components
    ├── ButtonGroup (manages HeaderButton instances with F-based spacing)
    ├── MathematicalCanvas (F-based demonstrations)
    └── ProgressBar (F×2 height progress indication)
```

## CSS Loading Strategy
1. **Primary CSS (main.css) must be loaded directly in each page's `<head>` section**
2. CSS path must be relative to the page location (e.g., `../../assets/css/main.css` for section pages)
3. CSS must load synchronously to prevent Flash of Unstyled Content (FOUC)
4. All pages must reference `assets/css/styles.css` with F=15px variables
5. Theme script must be inline in each page head for immediate execution

## Security
1. Every page must include the strict Content Security Policy (CSP) meta tag
2. CSP must be defined consistently across all pages
3. CSP meta tag must be placed inside the `<head>` tag
4. CSP must allow 'unsafe-inline' for styles to support inline styling
5. CSP must allow Google Fonts for typography

## F=15px Design System
1. Follow F=15px single source mathematical relationships for all dimensions
2. Use consistent Space Mono font family (monospace for authentic VGA feel)
3. Implement dark/light mode using VGA CSS variables and localStorage theme
4. Maintain consistent F-based spacing using CSS variables (--base-font: 15px)
5. Use Swiss-style F-based design principles for typography and layout
6. **All styles must be in `assets/css/styles.css`** with F=15px variable system
7. F-based inline styles are allowed and encouraged for component-specific styling
8. **Follow F=15px design requirements in mathematical documentation**

## File Structure
1. All shared components must be in the root directory
2. All section-specific content must be in the `sections/` directory
3. All assets must be in the `assets/` directory
4. All reference materials must be in the `reference/` directory

## Page Structure
1. Every page must include:
   - `<link href="[relative-path]/assets/css/styles.css" rel="stylesheet">` in `<head>`
   - `<div id="header-include"></div>` at the start of `<body>`
   - `<div id="footer-include"></div>` at the end of `<body>`
   - `<script src="[relative-path]/assets/js/include-shared.js"></script>` before closing `</body>`
   - `<script src="[relative-path]/assets/js/site.js"></script>` after include-shared.js
2. **All script and CSS paths must be relative to the current page location**
3. **Never use hardcoded `/SiteBoy/` paths - let JavaScript handle GitHub Pages detection**

## Path Strategy
1. **Use relative paths for all asset references**
2. Let `include-shared.js` handle GitHub Pages vs local development automatically
3. CSS and script paths depth: root=`assets/`, sections=`../../assets/`, tools=`../../../assets/`
4. Never hardcode repository names in HTML files

## Error Pages
1. Custom 404 page must be at `/404.html`
2. Error pages must maintain the same F=15px design system and shared components

## Responsive Design
1. Use F-based `clamp()` for responsive typography scaling
2. Maintain F-based grid system across all viewport sizes
3. Ensure all content is readable and accessible at F-optimal sizes
4. Use aspect ratio-driven column calculation: Round(3.982 × aspectRatio - 1.088)

## Performance
1. **Load critical CSS synchronously to prevent FOUC**
2. Minimize HTTP requests by using shared components
3. Optimize asset loading and delivery with F-based efficiency
4. Maintain fast initial page load times under F=15px constraints

## Accessibility
1. Maintain proper heading hierarchy using F-based scale (F×6 to F×1)
2. Ensure sufficient color contrast with VGA palette
3. Provide alt text for all images
4. Support keyboard navigation with F-based focus indicators

## Quality Control & F=15px Debugging
1. **Verify F-based pixel-perfect alignment** using browser developer tools before considering complete
2. **Test hover effects** to ensure they match F-based established patterns exactly
3. **Check for redundant code** - if F-based implementation exceeds expected complexity, research existing OOP patterns
4. **Use semantic search** to find similar F-based OOP implementations before writing custom solutions
5. **Cross-reference with UI Test Tool F-based OOP architecture** and other established sections
6. **When alignment issues occur**: check for border vs outline usage, F-based container width calculations
7. **Document deviations** and justify why existing F-based OOP patterns cannot be used
8. **Test on multiple viewport sizes** to ensure F-based responsive consistency
9. **Verify component cleanup**: Check that `.destroy()` methods are called during navigation
10. **Test inheritance chains**: Ensure components properly inherit from BaseComponent classes

## F=15px Architecture Validation
1. **Component Instance Tracking**: Use browser console to verify `component.destroy()` is available
2. **F-based Inheritance Verification**: Check `component instanceof BaseComponent` returns true
3. **F-based Mathematical Foundation Integration**: Verify all components use F=15px-based `MathematicalFoundation.calculateComponentDimensions()`
4. **Zero Manual DOM Creation**: Grep search for `document.createElement` should only find BaseComponent internals
5. **Memory Leak Prevention**: Ensure component instances are tracked and destroyed properly

## Version Control & Documentation
1. **Document all changes in `changes.md` with UTC timestamps**
2. Update `structure.md` when F-based architecture changes
3. Update this RULES.md when F=15px standards change
4. Maintain clear commit messages
5. Follow established change log format

---
*Note: This is a living document. Rules will be added or modified as the F=15px project evolves. The F=15px mathematical design system and OOP architecture requirements are MANDATORY and non-negotiable.* 