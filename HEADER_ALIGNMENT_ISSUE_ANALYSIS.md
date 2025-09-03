# Header Alignment Issue Analysis

## The Problem
The header middle line is 1px to the left compared to the subheader middle line.

## Root Cause Analysis

### **Old Build's Perfect Alignment System**
```javascript
// OLD BUILD - PRECISE CALCULATIONS
const mainHeaderLeftWidth = Math.floor(geo.gridWidth / 2);        // e.g., 400px
const mainHeaderToggleWidth = headerHeight;                       // 30px
const mainHeaderNavWidth = geo.gridWidth - mainHeaderLeftWidth - mainHeaderToggleWidth; // e.g., 370px

// SUBHEADER ALIGNMENT (with -1px border compensation)
const subheaderTitleWidth = mainHeaderLeftWidth - 1;             // e.g., 399px (-1px for border)
const subheaderNavContainerWidth = geo.gridWidth - subheaderTitleWidth; // e.g., 401px
const subheaderPrevButtonWidth = Math.floor(subheaderNavContainerWidth / 2); // e.g., 200px
const subheaderNextButtonWidth = subheaderNavContainerWidth - subheaderPrevButtonWidth; // e.g., 201px
```

**OLD BUILD APPLIED THESE EXACTLY:**
```javascript
// applyHeaderLayout()
headerLeft.style.width = `${layout.mainHeaderLeftWidth}px`;      // 400px
headerNav.style.width = `${layout.mainHeaderNavWidth}px`;        // 370px  
headerToggle.style.width = `${layout.mainHeaderToggleWidth}px`;  // 30px

// applySubheaderLayout()
markdownTitle.style.width = `${layout.subheaderTitleWidth}px`;   // 399px (-1px compensation)
navButtons[0].style.width = `${layout.subheaderPrevButtonWidth}px`; // 200px
navButtons[1].style.width = `${layout.subheaderNextButtonWidth}px`; // 201px
```

### **Current Build's Broken System**
```javascript
// CURRENT BUILD - IGNORES PRECISE CALCULATIONS
// PageHeader uses simple 50% split:
leftContainer.style.cssText = `width: 50%; height: 100%;`;

// Subheader uses simple 50% split:
titleSection.style.cssText = `width: 50%; height: 100%;`;
navSection.style.cssText = `width: 50%; height: 100%;`;
```

## The Specific Alignment Problem

### **Header Layout (Current):**
```
┌─────────────────────────────────────────────────────────────┐
│ LEFT: 50% = 400px              │ RIGHT: 50% = 400px         │
│                                │                             │
│ Middle line at 400px           │                             │
└─────────────────────────────────────────────────────────────┘
```

### **Subheader Layout (Current):**
```
┌─────────────────────────────────────────────────────────────┐
│ TITLE: 50% = 400px             │ NAV: 50% = 400px           │
│                                │                             │
│ Middle line at 400px           │                             │
└─────────────────────────────────────────────────────────────┘
```

**But the old build had:**

### **Header Layout (Old Build):**
```
┌──────────────────────────────────┬──────────────────┬────────┐
│ LEFT: 400px                      │ NAV: 370px       │TOG: 30px│
│                                  │                  │        │
│ Middle line at 400px             │                  │        │
└──────────────────────────────────┴──────────────────┴────────┘
```

### **Subheader Layout (Old Build with -1px compensation):**
```
┌─────────────────────────────────┬───────────────────────────┐
│ TITLE: 399px (-1px)             │ NAV: 401px                │
│                                 │           │               │
│ Middle line at 399px            │   200px   │   201px       │
└─────────────────────────────────┴───────────┴───────────────┘
```

## The Misalignment

**The issue:** Current build puts both middle lines at 50% (400px), but the old build had:
- **Header middle line**: 400px (mainHeaderLeftWidth)
- **Subheader middle line**: 399px (mainHeaderLeftWidth - 1px for border compensation)

**Result**: Header appears 1px to the right compared to subheader.

## Why Our Current System Is Wrong

1. **Header**: We use simple 50% split instead of precise `mainHeaderLeftWidth` calculation
2. **Subheader**: We use simple 50% split instead of `subheaderTitleWidth = mainHeaderLeftWidth - 1` 
3. **Missing**: We don't account for the toggle width affecting the navigation area
4. **Missing**: We don't apply the -1px border compensation that makes subheader align perfectly

## The Fix Needed

We need to:
1. **Use the precise calculations** from LayoutCalculator instead of 50% splits
2. **Apply the header layout values** exactly as the old build did
3. **Apply the subheader border compensation** (-1px) for perfect alignment
4. **Account for the toggle width** in navigation area calculations

The old build's system was mathematically perfect because it:
- Calculated exact pixel widths based on grid geometry
- Applied border compensation between header and subheader  
- Used floor division to prevent rounding errors
- Applied the exact calculated values, not percentages
