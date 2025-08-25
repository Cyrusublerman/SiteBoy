**Proportional Layout Plan Based on Font Character Width and Dynamic Margins**

### Objective

To create a fully proportional layout where every element, including borders, gaps, padding, and module sizes, is based on the width of a body font character. This approach ensures that all components of the page maintain a consistent visual relationship regardless of the viewport size, leading to a balanced and coherent design. The aim is to achieve a dynamic grid-like margin system that adapts based on content positioning, resulting in a flexible yet precise layout without explicitly setting fixed grid lines.

### 1. Base Unit Definition

- **Character-Based Base Unit**: Calculate the base unit (`--base-unit`) dynamically based on the width of a specific character (e.g., 'M') in the body font (`'Syne Mono'`). This character width serves as a reliable measure for proportional scaling.
- **Font Width as Rational Divisor**: Set the base unit so that it is an integer divisor of the screen width. This ensures that the number of characters fitting across the screen width is always a whole number, providing logical and proportional spacing without fractional misalignment.

### 2. Dynamic Layout Calculation

- **Proportional CSS Variables**: Use the calculated base unit to derive values for all sizing-related properties:
  - **Column Gap** (`--column-gap`): Set to `1.5 * base unit`. This ensures a comfortable amount of spacing between elements, proportional to the typography.
  - **Border Width** (`--border-width`): Define as `0.083 * base unit`. This ensures a consistent and visually balanced border thickness that aligns well with the overall design.
  - **Padding and Margin**: Set as multiples of the base unit (e.g., `2 * base unit` for padding, `1 * base unit` for margin) to maintain consistency in spacing.
- **Viewport Division**: Adjust the `html { font-size }` so that the base unit character width divides evenly into the viewport. This ensures all components align smoothly without inconsistencies.

### 3. Adaptive Module Placement and Margins

- **Proportional Margins and Placement**: Instead of explicitly defining grid columns and rows, use proportional margins and placement based on the base unit. Margins are calculated as multiples of the base unit to ensure consistent spacing throughout the layout without rigid grid lines.
- **Full and Half-Width Modules**:
  - **Full-Width Modules**: Span the entire content width while respecting proportional margins.
  - **Half-Width Modules**: Occupy half of the container space, with consistent proportional margins to ensure symmetry and balance.

### 4. Border and Overlapping Logic

- **Border Overlap**: Use negative margins based on `--border-width` to overlap borders and avoid double borders between adjacent modules.
- **Consistent Border Width**: By keeping `--border-width` proportional to the base unit, border overlap will work seamlessly across different screen sizes, maintaining a visually consistent layout.

### 5. JavaScript for Dynamic Updates

- **Base Unit Calculation**: Use JavaScript to calculate the width of a representative character (e.g., 'M') in the body font and set this value as `--base-unit` in the CSS root.
- **Dynamic Updates on Resize**: When the viewport size changes, recalculate the base unit to ensure it remains proportional. Update related CSS variables (`--column-gap`, `--border-width`, etc.) to maintain consistent proportions.

### 6. Example Workflow for Layout Adjustment

1. **Base Unit Calculation**: Calculate `--base-unit` using the width of an 'M' character.
2. **Set Proportional Variables**: Derive `--column-gap`, `--border-width`, etc., based on the base unit.
3. **Define Module Sizes and Margins**: Use the base unit to define module sizes and margins for adaptive content alignment.
4. **Dynamic Adjustment**: On viewport resize, update `--base-unit` and reapply calculated values to maintain consistent layout proportions.

### 7. Responsive Behavior

- **Stacking on Smaller Screens**: On smaller screens, adjust the layout to stack modules vertically while maintaining proportional margins to ensure proper alignment without overlap or inconsistent spacing.
- **Proportional Scaling**: Maintain all spacing and sizing relationships (e.g., borders, gaps, and padding) as proportional to the base unit, adapting dynamically to the viewport size.

### 8. Title Adjustment for Grid Fit

- **Title Length Calculation**: Calculate the number of characters in the title.
- **Title Font Size Adjustment**:
  - Set initial title font size (`initialTitleFontSize`) based on a scaling factor of the base unit.
  - Calculate the available width for the title (`availableWidth = containerWidth - (2 * margin)`).
  - Calculate the required character width (`requiredCharWidth = availableWidth / titleLength`).
  - Adjust title font size so that each character fits within the required width:
    - `titleFontSize = Math.min(initialTitleFontSize, requiredCharWidth * titleFontWidthRatio)`.
  - **Micro-Adjustment for Perfect Fit**: Apply a horizontal scaling transformation (`scaleX`) to micro-adjust text width to perfectly fit the grid alignment without changing the visual aspect ratio significantly.

### 9. Magnetic Margin Adjustment

- **Dynamic Margins Based on Content Proximity**: Implement logic to adjust margins dynamically based on content positioning. If content edges are close to an invisible grid line, align them to that line. This creates a “snap” effect for better visual harmony.
- **Alignment Detection**:
  - Calculate the distance of each content edge from the nearest multiple of the base unit.
  - If the distance is below a threshold (e.g., `0.25 * BU`), adjust the margin to snap the content to the grid.
  - Ensure these adjustments do not cause unintended overlaps or layout shifts.

### 10. Vertical Alignment Logic

- **Vertical Base Unit Proportions**: Use the base unit (`BU`) to determine vertical spacing, aligning all content to a consistent vertical rhythm.
- **Baseline Grid Alignment**: Establish a vertical rhythm using a baseline grid that is a multiple of the base unit (`baselineSpacing = verticalRhythmRatio * BU`). Ensure that line heights, margins, and paddings are consistent with this baseline to maintain alignment.
- **Content Height Calculation**:
  - Calculate the height of each module based on its content and ensure it aligns to the nearest multiple of the baseline spacing.
  - For modules with differing heights, pad or adjust heights to match the nearest multiple of the baseline grid, preventing misalignment between rows.
- **Vertical Spacing Between Modules**:
  - Set vertical margins between modules to be an exact multiple of the base unit, ensuring consistent vertical alignment.
  - For stacked modules, calculate the total height and align to the baseline grid to prevent inconsistencies.
- **Dynamic Adjustment on Content Change**:
  - When content height changes (e.g., due to added text or images), recalculate the height to fit the nearest baseline spacing and adjust neighboring modules accordingly.
- **Special Cases**:
  - **Images and Media**: Ensure that images or embedded media have heights that are adjusted to fit the baseline grid by cropping or adding padding as needed.
  - **Mixed Content Modules**: For modules containing mixed content (e.g., text and images), adjust each element's height to align with the baseline grid, ensuring the overall module height is consistent with the rest of the layout.

### Summary

The new layout logic leverages the width of a body font character as the base unit, ensuring that all elements on the page are proportional to this measure. By dynamically adjusting the base unit and related CSS variables based on the viewport size, the design remains consistent and visually balanced across different screen sizes. This approach ensures that margins, borders, and other elements are all rationally and proportionally set, achieving a flexible yet precise layout without explicitly defining rigid grid columns.

### Method

1. **Define Initial Variables**
   - `fontSize = base font size in px` (e.g., `fontSize = 16px`).
   - `BU_font_scale = scaling factor for base unit relative to font size` (e.g., `BU_font_scale = 1.25`).
   - `columnGapRatio = 1.5` (ratio for setting the gap between columns).
   - `borderWidthRatio = 0.083` (ratio for defining border width based on the base unit).
   - `paddingRatio = 2` (ratio for setting padding).
   - `marginRatio = 1` (ratio for setting margin).
   - `verticalRhythmRatio = 1.5` (ratio for setting vertical rhythm alignment).

2. **Set Base Unit (BU)**
   - Calculate initial base unit: `initialBU = BU_font_scale * fontSize`.
   - Adjust `initialBU` to ensure it divides the viewport width evenly:
     - `viewportWidth = window.innerWidth`.
     - `approxColumnCount = Math.round(viewportWidth / initialBU)`.
     - `adjustedBU = viewportWidth / approxColumnCount`.
   - Ensure that `adjustedBU` is close to `initialBU` while maintaining an integer divisor of the viewport width:
     - If `adjustedBU` deviates too much from `initialBU`, recalculate `approxColumnCount` by incrementing or decrementing until a satisfactory balance between the font size and rational divisibility is achieved.
   - Final base unit: `BU = adjustedBU`.

3. **Set Font Sizes**
   - Define all typography sizes based on `BU`:
     - `headingFontSize = BU * headingScaleFactor` (e.g., `headingScaleFactor = 2.5` for H1).
     - `bodyFontSize = BU * bodyScaleFactor` (e.g., `bodyScaleFactor = 1` for normal paragraph text).
     - Calculate other typography sizes: `subheadingFontSize`, `captionFontSize`, etc., using proportional scale factors.
   - **Micro-Adjustment for Text Width**: Apply slight horizontal scaling (`scaleX`) to headings and titles to ensure perfect alignment when there are minor discrepancies between calculated width and available space.

4. **Set Margins and Padding**
   - `margin = marginRatio * BU` (e.g., `margin = 1 * BU`).
   - `padding = paddingRatio * BU` (e.g., `padding = 2 * BU`).

5. **Set Column Gap and Border Width**
   - `columnGap = columnGapRatio * BU` (e.g., `columnGap = 1.5 * BU`).
   - `borderWidth = borderWidthRatio * BU` (e.g., `borderWidth = 0.083 * BU`).

6. **Define Module Sizes**
   - `containerWidth = viewportWidth - (2 * margin)`.
   - `fullWidthModule = containerWidth`.
   - `halfWidthModule = (containerWidth / 2) - (columnGap / 2)`.

7. **Set Border Overlap**
   - `negativeMargin = -1 * borderWidth` (used to ensure adjacent module borders overlap).

8. **JavaScript Calculations for Dynamic Updates**
   - On page load and viewport resize:
     - Recalculate `viewportWidth`.
     - Recalculate `BU` using the steps from **Set Base Unit**.
     - Update CSS variables for `--base-unit`, `--column-gap`, `--border-width`, etc.
     - Adjust typography sizes, module sizes, margins, padding, and column gap accordingly.
     - **Edge Cases**: If the viewport width results in impractically large or small `BU`, set fallback values to ensure the layout remains usable.

9. **Responsive Adjustments**
   - On smaller screens (e.g., `viewportWidth < 768px`):
     - Stack all modules vertically by setting `halfWidthModule` to `fullWidthModule`.
     - Recalculate all proportional values based on the updated `BU` to maintain visual consistency.

10. **Title Adjustment for Grid Fit**
    - Calculate the number of characters in the title (`titleLength`).
    - Set initial title font size (`initialTitleFontSize = BU

