#!/bin/bash

# SiteBoy Component Validator
# Checks that all components follow the correct patterns

echo "🔍 Validating SiteBoy Components..."

ERRORS=0

# Check that all components extend BaseComponent
echo ""
echo "📋 Checking BaseComponent inheritance..."
for file in src/components/*/*.js; do
    if [ -f "$file" ]; then
        if ! grep -q "extends BaseComponent" "$file"; then
            echo "❌ $file: Does not extend BaseComponent"
            ERRORS=$((ERRORS + 1))
        fi
        
        if ! grep -q "import.*BaseComponent" "$file"; then
            echo "❌ $file: Missing BaseComponent import"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Check that all components have destroy method
echo ""
echo "🧹 Checking destroy() methods..."
for file in src/components/*/*.js; do
    if [ -f "$file" ]; then
        if ! grep -q "destroy()" "$file"; then
            echo "⚠️  $file: Missing destroy() method"
        fi
    fi
done

# Check CSS variables usage
echo ""
echo "🎨 Checking CSS variables usage..."
for file in src/components/*/*.js; do
    if [ -f "$file" ]; then
        if grep -q "font-size.*[0-9]px" "$file"; then
            echo "⚠️  $file: Hard-coded font sizes (use var(--f))"
        fi
        
        if grep -q "color.*#[0-9a-fA-F]" "$file"; then
            echo "⚠️  $file: Hard-coded colors (use var(--c-*))"
        fi
    fi
done

# Check src/index.js completeness
echo ""
echo "📦 Checking main index completeness..."
COMPONENTS=$(find src/components -name "*.js" -exec basename {} .js \;)
for component in $COMPONENTS; do
    if ! grep -q "import.*$component" src/index.js; then
        echo "❌ src/index.js: Missing import for $component"
        ERRORS=$((ERRORS + 1))
    fi
    
    if ! grep -q "$component.*:" src/index.js; then
        echo "❌ src/index.js: Missing factory mapping for $component"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check bundle exists and is recent
echo ""
echo "📦 Checking bundle status..."
if [ ! -f "dist/component-library.umd.js" ]; then
    echo "❌ Missing bundle: dist/component-library.umd.js"
    ERRORS=$((ERRORS + 1))
else
    # Check if bundle is newer than source files
    NEWEST_SOURCE=$(find src -name "*.js" -newer "dist/component-library.umd.js" | head -1)
    if [ ! -z "$NEWEST_SOURCE" ]; then
        echo "⚠️  Bundle may be outdated - newer source files found"
        echo "   Run ./scripts/rebuild-bundle.sh to update"
    fi
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All validation checks passed!"
else
    echo "❌ Found $ERRORS critical errors"
    echo "🔧 Please fix the errors above before proceeding"
fi

echo ""
echo "📊 Component Summary:"
echo "   Components found: $(find src/components -name "*.js" | wc -l)"
echo "   Categories: $(find src/components -type d -mindepth 1 -maxdepth 1 | wc -l)"
echo "   Bundle size: $(du -h dist/component-library.umd.js 2>/dev/null | cut -f1 || echo "N/A")"

