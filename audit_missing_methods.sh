#!/bin/bash

# SiteBoy Missing Methods Audit Script
# Compares original component methods with modular system

echo "🔍 ============================================"
echo "🔍 MISSING METHODS AUDIT"
echo "🔍 ============================================"
echo ""

echo "📋 Checking for critical methods in each component..."
echo ""

# Check PageContainer methods
echo "🏗️ PageContainer methods:"
echo "  ✅ getContentContainer() - $(grep -q "getContentContainer()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ destroy() - $(grep -q "destroy()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ onResize() - $(grep -q "onResize()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo ""

# Check PageHeader methods  
echo "📄 PageHeader methods:"
echo "  ✅ onResize() - $(grep -q "onResize()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ getThemeIcon() - $(grep -q "getThemeIcon()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ toggleTheme() - $(grep -q "toggleTheme()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo ""

# Check BaseNavigationDropdown methods
echo "🔗 BaseNavigationDropdown methods:"
echo "  ✅ createDropdownStructure() - $(grep -q "createDropdownStructure()" assets/js/shared/foundation.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ populateDropdown() - $(grep -q "populateDropdown()" assets/js/shared/foundation.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ setSymbolElement() - $(grep -q "setSymbolElement()" assets/js/shared/foundation.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ setupClickOutside() - $(grep -q "setupClickOutside()" assets/js/shared/foundation.js && echo "PRESENT" || echo "MISSING")"
echo ""

# Check Subheader methods
echo "🧭 Subheader methods:"
echo "  ✅ updateTitle() - $(grep -q "updateTitle()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ updateNavigation() - $(grep -q "updateNavigation()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ show() - $(grep -q "show()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo "  ✅ hide() - $(grep -q "hide()" assets/js/shared/layout.js && echo "PRESENT" || echo "MISSING")"
echo ""

echo "🎯 ============================================"
echo "🎯 If any methods show MISSING, they need to be added!"
echo "🎯 ============================================"
