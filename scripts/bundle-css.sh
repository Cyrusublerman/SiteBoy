#!/bin/bash

# CSS Bundle Builder - Optional Optimization
# Combines modular CSS files back into single file for production

echo "🔨 Bundling CSS modules into styles.css..."

# Create backup of current styles.css
if [ -f "assets/css/styles.css" ]; then
    cp "assets/css/styles.css" "assets/css/styles.css.backup"
    echo "✅ Backup created: styles.css.backup"
fi

# Combine all CSS modules
cat > assets/css/styles.css << 'EOF'
/**
 * SiteBoy Framework - Canonical Styles (BUNDLED)
 *
 * F=12px VGA/MONO CONSTRAINED STYLING
 * This is a bundled version of the modular CSS system for production use
 *
 * @version 1.0.0 - Bundled from Modular System
 * @constraints Atkinson Hyperlegible only, VGA colors only, F=12px base, no gradients/shadows/rounded corners
 *
 * MODULAR SOURCE FILES:
 * - base.css: Core variables, resets, typography
 * - components.css: Component-specific styles (forms, buttons, etc.)
 * - layout.css: Page layout and responsive behavior
 * - tools.css: Tool-specific styles (ToolBase, canvas areas, etc.)
 * - utilities.css: Utility classes and debugging tools
 */

EOF

# Append each module
cat assets/css/base.css >> assets/css/styles.css
echo "" >> assets/css/styles.css
cat assets/css/components.css >> assets/css/styles.css
echo "" >> assets/css/styles.css
cat assets/css/layout.css >> assets/css/styles.css
echo "" >> assets/css/styles.css
cat assets/css/tools.css >> assets/css/styles.css
echo "" >> assets/css/styles.css
cat assets/css/utilities.css >> assets/css/styles.css

echo "✅ CSS bundle created: assets/css/styles.css"
echo "🚀 Use index.css for development (modular) or styles.css for production (bundled)"
