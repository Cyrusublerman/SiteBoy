#!/bin/bash

# SiteBoy Component Library Verification Script
# Ensures 100% component coverage from original to modular system

echo "🔍 ============================================"
echo "🔍 SITEBOY COMPONENT LIBRARY VERIFICATION"
echo "🔍 ============================================"
echo ""

# Extract component lists
echo "📋 Extracting component lists..."
grep "^export class" reference/component-library-original-20250829.js | sed 's/export class \([A-Za-z]*\).*/\1/' | sort > /tmp/original_components.txt
grep "^export class" assets/js/shared/*.js | sed 's/.*export class \([A-Za-z]*\).*/\1/' | sort > /tmp/modular_components.txt

# Count components
ORIGINAL_COUNT=$(wc -l < /tmp/original_components.txt)
MODULAR_COUNT=$(wc -l < /tmp/modular_components.txt)

echo "📊 Component Counts:"
echo "   Original: $ORIGINAL_COUNT components"
echo "   Modular:  $MODULAR_COUNT components"
echo ""

# Check for missing components
MISSING=$(diff /tmp/original_components.txt /tmp/modular_components.txt | grep "^<" | sed 's/< //')
EXTRA=$(diff /tmp/original_components.txt /tmp/modular_components.txt | grep "^>" | sed 's/> //')

if [ -z "$MISSING" ] && [ -z "$EXTRA" ]; then
    echo "✅ COMPONENT EXTRACTION: ALL COMPONENTS PRESENT"
else
    if [ ! -z "$MISSING" ]; then
        echo "❌ MISSING COMPONENTS:"
        echo "$MISSING"
    fi
    if [ ! -z "$EXTRA" ]; then
        echo "⚠️  EXTRA COMPONENTS:"
        echo "$EXTRA"
    fi
fi
echo ""

# Check exports in component-library.js
echo "📦 Checking component-library.js exports..."
MISSING_EXPORTS=""
while read component; do
    if ! grep -q "^    $component," assets/js/shared/component-library.js; then
        MISSING_EXPORTS="$MISSING_EXPORTS $component"
    fi
done < /tmp/original_components.txt

if [ -z "$MISSING_EXPORTS" ]; then
    echo "✅ COMPONENT LIBRARY EXPORTS: ALL COMPONENTS EXPORTED"
else
    echo "❌ MISSING FROM EXPORTS: $MISSING_EXPORTS"
fi
echo ""

# Check imports
echo "🔗 Checking import statements..."
IMPORT_FILES="foundation.js layout.js content.js interactive.js graphs.js specialized.js"
IMPORT_ISSUES=""

for file in $IMPORT_FILES; do
    if ! grep -q "from './$file'" assets/js/shared/component-library.js; then
        IMPORT_ISSUES="$IMPORT_ISSUES $file"
    fi
done

if [ -z "$IMPORT_ISSUES" ]; then
    echo "✅ IMPORT STATEMENTS: ALL CATEGORY FILES IMPORTED"
else
    echo "❌ MISSING IMPORTS: $IMPORT_ISSUES"
fi
echo ""

# Check file structure
echo "📁 Checking file structure..."
REQUIRED_FILES="foundation.js layout.js content.js interactive.js graphs.js specialized.js component-library.js"
MISSING_FILES=""

for file in $REQUIRED_FILES; do
    if [ ! -f "assets/js/shared/$file" ]; then
        MISSING_FILES="$MISSING_FILES $file"
    fi
done

if [ -z "$MISSING_FILES" ]; then
    echo "✅ FILE STRUCTURE: ALL REQUIRED FILES PRESENT"
else
    echo "❌ MISSING FILES: $MISSING_FILES"
fi
echo ""

# Final summary
echo "🎯 ============================================"
if [ -z "$MISSING" ] && [ -z "$EXTRA" ] && [ -z "$MISSING_EXPORTS" ] && [ -z "$IMPORT_ISSUES" ] && [ -z "$MISSING_FILES" ]; then
    echo "🎯 ✅ VERIFICATION COMPLETE: 100% COMPONENT COVERAGE"
    echo "🎯 All $ORIGINAL_COUNT components successfully modularized!"
else
    echo "🎯 ❌ VERIFICATION FAILED: Issues found above"
    echo "🎯 Please fix the issues and run verification again"
fi
echo "🎯 ============================================"

# Cleanup
rm -f /tmp/original_components.txt /tmp/modular_components.txt
