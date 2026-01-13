# SITEBOY MATHEMATICAL DESIGN SYSTEM
## Geometric Derivation from Minimal Variables

### VERSION INFORMATION
- **Document Version**: 8.0.0  
- **Framework Version**: SiteBoy v6.0.0
- **Core Principle**: All dimensions derive from ideal font size

---

## 1. FUNDAMENTAL VARIABLES (Only 2)

### 1.1 BASE FONT SIZE (F)
**F = 14px** - The ideal readable font size

### 1.2 VIEWPORT ASPECT RATIO (VAR)
Dynamic input from display (width ÷ height)

---

## 2. DERIVED CONSTANTS

### 2.1 CORE DIMENSIONS
- Base Unit (BU) = F = 14px
- Mobile Margin = F = 14px (covers scrollbar perfectly)
- Header Height = F × 2 = 28px
- Desktop Margin = F × 4 = 56px (clean binary: 56px alternative)
- Grid Gap = 1px (minimum viable)
- Outline Width = 1px (minimum viable)

### 2.2 MARGIN LOGIC
- IF Columns = 1 THEN Current Margin = Mobile Margin (F)
- ELSE Current Margin = Desktop Margin (F × 4)

---

## 3. COLUMN SYSTEM

### 3.1 ASPECT RATIO FORMULA
**Columns = Round(3.982 × VAR - 1.088)**
- Minimum = 1, Maximum = 6

### 3.2 TYPICAL MAPPINGS
- Mobile (9:16): 1 column
- Portrait (3:4): 2 columns
- Square (4:3): 4 columns  
- Desktop (16:9): 5-6 columns
- Ultrawide (21:9): 6 columns

---

## 4. TYPOGRAPHY SCALE

### 4.1 HEADING HIERARCHY
- H1 = F × 6 - Major Headlines
- H2 = F × 3 - Section Titles
- H3 = F × 2 - Page Headers  
- H4 = F × 1.5 - Subsections
- H5 = F × 1.2 - Minor Headings
- H6 = F × 1 - Base Headers

### 4.2 TEXT STYLES
- Body = F - Standard Content
- Small = F × 0.8 - Interface/Captions
- Line Height = F × 1.6 - Body Text
- Interface = F × 0.8 - Navigation/Controls

### 4.3 TYPOGRAPHY RELATIONSHIPS
- All margins derive from F multiples
- Margin Top: Header level × F
- Margin Bottom: (Header level ÷ 2) × F
- Letter Spacing: Mathematical relationships (0.05em - 0.1em)

---

## 5. GRID GEOMETRY

### 5.1 CALCULATIONS
- Available Width = Viewport Width - (Current Margin × 2)
- Box Size = floor((Available Width - Gap × (Columns - 1)) ÷ Columns)
- Grid Width = (Box Size × Columns) + (Gap × (Columns - 1))
- Margin Left = floor((Viewport Width - Grid Width) ÷ 2)
- Margin Right = Viewport Width - Grid Width - Margin Left

### 5.2 VALIDATION
- Grid Width + (Current Margin × 2) ≤ Viewport Width
- All margins ≥ 0
- Box Size is integer

---

## 6. COMPONENT DIMENSIONS

### 6.1 STANDARD HEIGHTS
- Button Height = F × 2
- Input Height = F × 2  
- Progress Bar = F × 2
- Dropdown = F × 2
- All interactive elements = F × 2 (Header Height)

### 6.2 SPACING SYSTEM
- Minimal = F ÷ 3
- Small = F ÷ 2
- Standard = F
- Medium = F × 1.5
- Large = F × 2
- XLarge = F × 3

### 6.3 CONTENT PADDING
- Component Padding = F × 0.8
- Section Padding = F × 1.6  
- Markdown Padding = F × 3.2
- Total Markdown Padding = F × 6.4 (3.2 × 2)
- Container Padding Top = Current Margin + Header Height

---

## 7. LAYOUT HIERARCHY

### 7.1 STRUCTURE
1. **Viewport** - 100vw × 100vh
2. **Page Wrapper** - Flex container, min-height: 100vh
3. **Curtain** - Fixed overlay, height: Current Margin
4. **Header** - Fixed position, height: F × 2, z-index: 90
5. **Content Container** - Responsive padding
6. **Content Area** - Available height calculation
7. **Footer** - Height: F × 2
8. **Components** - Grid-aligned elements

### 7.2 HEIGHT CALCULATIONS  
- Content Height = Viewport Height - (Current Margin × 2) - (Header Height × 2)
- With Subheader = Content Height - Header Height
- Markdown Body Height = Content Height - (F × 6.4)
- Canvas Height = Canvas Width × 0.75 (4:3 ratio)

---

## 8. BORDER COMPENSATION

### 8.1 STANDARD LAYOUT
- Width = Grid Width
- Margin Left = Calculated Margin Left
- Margin Right = Calculated Margin Right
- Used for: Content containers, grid interiors

### 8.2 BORDERED LAYOUT
- Width = Grid Width + 2px
- Margin Left = Calculated Margin Left - 1px
- Margin Right = Calculated Margin Right - 1px
- Used for: Header, footer, modal containers

### 8.3 BORDER SHARING
- First Element: All borders present
- Subsequent Elements: margin-top = -1px (prevents double borders)
- Outline Preference: No layout shift vs border

---

## 9. HEADER MATHEMATICAL DIVISIONS

### 9.1 HEADER SPLIT CALCULATIONS

**Grid Width Division (Even Columns):**
Header Split = (Box Size × Columns Before Split) + (Gap × (Columns Before Split - 1)) + Math.floor(Gap ÷ 2) + 1px

**Grid Width Division (Odd Columns):**
Header Split = Math.floor(Grid Width ÷ 2) + 1px

### 9.2 HEADER SECTION WIDTHS
- Left Section Width = Header Split
- Toggle Section Width = Header Height (F × 2)
- Navigation Section Width = Grid Width - Left Width - Toggle Width

### 9.3 TOC COMPONENT PROPORTIONS
- Number Box Size = Header Height × 2 (F × 4)
- Row Width = Grid Width - (Header Height × 4)
- Text Width = Row Width - Number Box Size - (Header Height × 2)
- Arrow Width = Number Box Size

---

## 10. CSS VARIABLES

### 10.1 FOUNDATIONAL VARIABLES
- --base-font: 14px (F)
- --header-height: calc(var(--base-font) × 2)
- --mobile-margin: var(--base-font)
- --desktop-margin: calc(var(--base-font) × 4)
- --current-margin: 14px or 56px (responsive)

### 10.2 DYNAMIC LAYOUT VARIABLES
- --cols: 1-6 (aspect ratio derived)
- --box-size: calculated grid item size
- --grid-width: calculated total grid width
- --margin-left: calculated centering margin
- --margin-right: calculated centering margin

### 10.3 DERIVED MEASUREMENTS
- --h1-size: calc(var(--base-font) × 6)
- --h2-size: calc(var(--base-font) × 3)
- --h3-size: calc(var(--base-font) × 2)
- --section-padding: calc(var(--base-font) × 1.6)
- --markdown-padding: calc(var(--base-font) × 3.2)
- --small-text: calc(var(--base-font) × 0.8)

---

## 11. RESPONSIVE BEHAVIOR

### 11.1 BREAKPOINT-FREE DESIGN
- Columns determined by aspect ratio only
- Margins switch at 1 column threshold
- All spacing proportional to base font
- No arbitrary breakpoints

### 11.2 MOBILE ADJUSTMENTS
**When Columns = 1:**
- Margin = F (14px) - covers scrollbar perfectly
- Canvas = Full grid width
- Typography = No reduction needed (F=14px optimal)
- All proportions maintained

### 11.3 DESKTOP SCALING
**When Columns ≥ 2:**
- Margin = F × 4 (56px) - generous desktop spacing
- Canvas = Grid Width × 0.8 (80% constraint)
- Typography = Full hierarchy available
- Component density increases appropriately

---

## 12. COMPONENT-SPECIFIC DIMENSIONS

### 12.1 BUTTON COMPONENTS
- Standard Button Height = Header Height (F × 2)
- Button Group Width = Available Section Width ÷ Button Count
- Header Button Width = Main Header Nav Width ÷ Button Count
- Button Text Size = F × 0.8
- Button Padding = F × 0.8 horizontal
- Button Border Sharing: outline-left removed on non-first

### 12.2 DROPDOWN COMPONENTS
- Dropdown Width = Main Header Nav Width
- Dropdown Height = Header Height (F × 2)
- Menu Item Height = Header Height (F × 2)
- Menu Container Width = 100% of trigger width
- Menu Item Padding = F × 0.8 horizontal
- Menu Text Size = F × 0.8
- Menu Position: absolute, top: 100%, z-index: 1000

### 12.3 GRID COMPONENTS
- Grid Container Width = Grid Width (standard layout)
- Grid Item Size = Box Size × Box Size
- Grid Gap = 1px fixed
- VGA Grid Columns = 4 (standard)
- Grid Caption Height = Header Height (F × 2)
- Grid Caption Text Size = F × 0.8
- Grid Item Hover: outline-color changes, z-index: 2

### 12.4 CANVAS COMPONENTS
**Canvas Width Calculation:**
- Desktop: Grid Width × 0.8 (80% constraint)
- Mobile: Grid Width (full available)
- Minimum: F × 20
- Maximum: Grid Width

**Canvas Height Calculation:**
- Aspect Ratio: 4:3 (standard)
- Height = Canvas Width × 0.75
- Minimum: F × 15
- Custom Height: Must be F multiple

**Canvas Text Rendering:**
- Font Size = F
- Font Family: Space Mono
- Line Height = F
- Anti-aliasing: Disabled

### 12.5 PROGRESS COMPONENTS
- Progress Bar Width = Grid Width
- Progress Bar Height = Header Height (F × 2)
- Progress Fill = Percentage of total width
- Text Overlay: Centered, F × 0.8

### 12.6 FORM COMPONENTS
- Input Height = Header Height (F × 2)
- Input Padding = F × 0.8 horizontal
- Input Text Size = F
- Label Text Size = F × 0.8
- Label Margin Bottom = F × 0.5
- Form Group Margin = F × 1.5

### 12.7 MODAL/DIALOG COMPONENTS
- Modal Width = Grid Width × 0.9 (90% constraint)
- Modal Max Width = F × 40
- Modal Padding = F × 2
- Modal Header Height = F × 3
- Modal Title Size = F × 1.2
- Modal Close Button = Header Height × Header Height (square)
- Modal Centering: top: 50%, left: 50%, transform: translate(-50%, -50%)

---

## 13. VALIDATION REQUIREMENTS

### 13.1 MATHEMATICAL CONSTRAINTS
- ✓ No Overflow: Grid Width + (Current Margin × 2) ≤ Viewport Width
- ✓ Positive Margins: Margin Left ≥ 0 AND Margin Right ≥ 0
- ✓ Integer Box Size: Box Size = Floor(Box Size)
- ✓ Header Width Sum: Left + Navigation + Toggle = Grid Width
- ✓ Minimum Content Height: Content Height > 0
- ✓ F Alignment: All typography dimensions are F multiples
- ✓ Typography Consistency: All text sizes derive from F scale
- ✓ Canvas Proportion: Canvas dimensions maintain 4:3 or F multiple ratios

### 13.2 PROPORTIONAL REQUIREMENTS
- ✓ All measurements derive from F or aspect ratio
- ✓ Grid geometry maintains mathematical precision
- ✓ Component relationships preserve F ratios
- ✓ Responsive behavior maintains proportions
- ✓ Typography hierarchy maintains F scale relationships
- ✓ Interface elements align to F grid
- ✓ CSS variables eliminate redundant declarations
- ✓ Border overlap prevents double-lines

---

## 14. IMPLEMENTATION CONSTANTS

### 14.1 CORE CONSTANTS
- F (Base Font Size): 14px
- Aspect Multiplier: 3.982
- Aspect Offset: 1.088
- Minimum Columns: 1
- Maximum Columns: 6
- Grid Gap: 1px (fixed)
- Outline Width: 1px (fixed)

### 14.2 F MULTIPLIERS
- Header Height: F × 2
- Desktop Margin: F × 4
- Mobile Margin: F × 1
- H1: F × 6
- H2: F × 3  
- H3: F × 2
- H4: F × 1.5
- H5: F × 1.2
- H6: F × 1
- Body: F × 1
- Small: F × 0.8
- Interface: F × 0.8

### 14.3 CANVAS CALCULATION CONSTANTS
- Canvas Width Factor: 0.8 (80% of grid width desktop)
- Canvas Aspect Ratio: 0.75 (4:3 ratio)
- Canvas Minimum Width: F × 20
- Canvas Minimum Height: F × 15
- Canvas Maximum Width: Grid Width

### 14.4 BORDER COMPENSATION CONSTANTS
- Bordered Width Addition: +2px (left + right outline)
- Bordered Margin Reduction: -1px each side
- Border Overlap: -1px margin-top for stacked elements
- Outline Preference: outline over border (no layout shift)

---

## 15. DESIGN SYSTEM INTEGRATION

### 15.1 VGA COLOR CONSTRAINTS
- Total Colors: 16 (VGA palette only)
- Background: VGA silver / VGA black (theme dependent)
- Text: VGA black / VGA silver (theme dependent)
- Border: VGA gray (consistent)
- Accent: VGA navy (consistent)

### 15.2 TYPOGRAPHY SYSTEM
- All Text: Space Mono (monospace)
- Base Size: F (14px)
- Header Hierarchy: F × 6 to F × 1 scale
- Interface Text: F × 0.8
- All sizes derive from F multiples

### 15.3 SPACING SYSTEM
- Gap: 1px (fixed minimum)
- Margin: F or F × 4 (responsive)
- Padding: F multiples (0.5 to 6.4 range)
- Border: 1px outline preferred
- Overlap: -1px margin (border sharing)

---

## 16. IMPLEMENTATION EXAMPLE

### 16.1 JAVASCRIPT FOUNDATION
```javascript
const F = 14; // Base font size
const VAR = window.innerWidth / window.innerHeight;
const columns = Math.round(3.982 * VAR - 1.088);
const currentMargin = columns === 1 ? F : F * 4;

// All other dimensions flow from F
const headerHeight = F * 2;
const h1Size = F * 6;
const sectionPadding = F * 1.6;
const markdownPadding = F * 3.2;
const componentPadding = F * 0.8;
```

### 16.2 CSS VARIABLE PATTERN
```css
:root {
    --base-font: 14px;
    --header-height: calc(var(--base-font) * 2);
    --mobile-margin: var(--base-font);
    --desktop-margin: calc(var(--base-font) * 4);
    /* All other variables derive from --base-font */
}
```

---

## CONCLUSION

This mathematical design system achieves complete geometric derivation from minimal variables. Every dimension, spacing, and proportion flows from the fundamental font size (F = 14px) and viewport aspect ratio, creating a deterministic, interconnected system.

**Key Principles:**
1. **Single Source**: Everything derives from font size (F = 14px)
2. **Integer Relations**: Clean multiples wherever possible
3. **Practical Defaults**: Mobile margin covers scrollbar perfectly
4. **Mathematical Purity**: Geometric relationships, not arbitrary values
5. **Responsive Logic**: Aspect ratio drives layout, not breakpoints
6. **Deterministic Output**: Same inputs always produce same results

**System Benefits:**
- ✅ Zero arbitrary constants
- ✅ Complete mathematical interconnectedness  
- ✅ Predictable scaling relationships
- ✅ Simplified mental model (F × multiplier)
- ✅ Responsive without breakpoints
- ✅ Perfect mobile scrollbar accommodation
- ✅ Clean binary relationships where applicable

This system reduces complexity while maintaining mathematical elegance. Every dimension has a clear relationship to the base font size, making the system both predictable and scalable across all viewport conditions. 