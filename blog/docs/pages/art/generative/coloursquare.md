# Colour Square (Responsive Color Grid)

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Generative Art/coloursquare/dist/script.js`
**Related docs found:** None

### Purpose
Responsive square color grid with jQuery-based sizing. Maintains aspect ratio based on viewport height. Simple foundational component for color-based visualizations.

### Output Type
- [x] Static image (responsive grid)
- [ ] Animation
- [ ] Interactive visualization
- [ ] Data/calculation result
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. Sets grid container to 80% of window height
2. Makes width match height (square aspect)
3. Inner `.tangyG` elements maintain square proportions
4. Responsive on window resize
5. Uses jQuery for DOM manipulation

---

## 2. Tool Classification

**Is this a tool?** No (responsive layout component only)

**Input:** Viewport dimensions
**Processing:** CSS dimension calculation
**Output:** Responsive square grid

**Frame-based?** No
**Looping?** No
**Duration:** N/A

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| winH | number | viewport | Window height |
| w | number | computed | Element width |

### Recommended UI Components
N/A - This is a layout utility, not a visual tool.

### Missing Controls (not in source, should add)
This appears to be a shell/template file. No visual output controls needed.

---

## 4. Gap Analysis

### Available in our library but missing in source:
N/A - Not a visual tool

### Source features requiring new components:
N/A - Layout only

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| (none) | - | - | - | - | - | Auto-responsive |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| (none) | - | - | - |

---

## 6. ToolBase Configuration

**Note:** This is a layout utility, not suitable for ToolBase conversion. The file contains only responsive sizing logic with no visual rendering.

---

## 7. Implementation Notes

- **Minimal Source:** Only 20 lines, primarily CSS sizing via jQuery
- **Not a Tool:** No parameters, no visual output, no interactivity
- **Possible Use:** Template for color grid tools - would need actual rendering added
- **Recommendation:** Skip conversion; use as reference for responsive patterns if needed

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| Responsive square sizing | 10 | layout | - | Low |

**Note:** Code is trivial and jQuery-dependent. Not recommended for extraction.

