#!/bin/bash

# SiteBoy Component Library - Manual Bundle Rebuilder
# Run this script after making changes to src/ components

echo "🔨 Rebuilding Component Library Bundle..."

# Backup current bundle
if [ -f "dist/component-library.umd.js" ]; then
    cp "dist/component-library.umd.js" "dist/component-library.umd.js.backup"
    echo "✅ Backup created: dist/component-library.umd.js.backup"
fi

# Copy current working library as base
cp "assets/js/shared/component-library.js" "dist/component-library.umd.js"

# Apply UMD transformation
echo "🔄 Converting to UMD format..."

# Update header
sed -i '1,10c\
/**\
 * SiteBoy Component Library - UMD Bundle\
 * \
 * COMPLETE COMPONENT SYSTEM - All component code bundled for browser compatibility\
 * Contains BaseComponent + canonical glossary + specialized widgets + page structure\
 * All components follow F=12px mathematical constraints and VGA/Mono styling\
 * \
 * @version 3.0.0 - UMD Bundle\
 * @dependencies ['"'"'MathematicalFoundation'"'"', '"'"'ResizeManager'"'"'] - Injected dependencies\
 */\
\
(function (global, factory) {\
    typeof exports === '"'"'object'"'"' && typeof module !== '"'"'undefined'"'"' ? factory(exports) :\
    typeof define === '"'"'function'"'"' && define.amd ? define(['"'"'exports'"'"'], factory) :\
    (global = typeof globalThis !== '"'"'undefined'"'"' ? globalThis : global || self, factory(global));\
}(this, (function (exports) { '"'"'use strict'"'"';' "dist/component-library.umd.js"

# Remove export keywords
sed -i 's/export class /class /g' "dist/component-library.umd.js"
sed -i 's/export const ComponentLibrary/const ComponentLibrary/g' "dist/component-library.umd.js"

# Update footer
sed -i 's|// Global registration for legacy compatibility|// UMD exports\
exports.ComponentLibrary = ComponentLibrary;\
exports.BaseComponent = BaseComponent;\
\
// Global registration for legacy compatibility (browser environment)\
if (typeof window !== '"'"'undefined'"'"') {\
    window.ComponentLibrary = ComponentLibrary;\
    window.BaseComponent = BaseComponent;\
}|' "dist/component-library.umd.js"

# Add UMD closure
sed -i 's/console\.log(`📚 ComponentLibrary v\${ComponentLibrary\.version} - Canonical Glossary Components Ready`);/console.log(`📚 ComponentLibrary v${ComponentLibrary.version} - UMD Bundle Ready`);\
\
})));/' "dist/component-library.umd.js"

echo "✅ UMD Bundle rebuilt: dist/component-library.umd.js"
echo "🚀 Ready to test at http://localhost:8000"

