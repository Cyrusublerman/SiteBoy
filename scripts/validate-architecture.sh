#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# SiteBoy Architecture Validation Script
# 
# This script enforces architectural rules and MUST pass before any commit.
# Violations will block the commit until fixed.
#
# Run manually: bash scripts/validate-architecture.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on first error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VIOLATIONS=0

echo "═══════════════════════════════════════════════════════════════════"
echo "  SiteBoy Architecture Validation"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 1: DOM Manipulation Outside Allowed Files
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [1/7] Checking for DOM manipulation violations..."

DOM_VIOLATIONS=$(grep -rn --include="*.js" \
    -e "document\.createElement" \
    -e "\.innerHTML\s*=" \
    -e "\.appendChild(" \
    -e "\.insertBefore(" \
    -e "\.removeChild(" \
    --exclude="base-component.js" \
    --exclude="component-library.js" \
    --exclude="foundation.js" \
    --exclude="layout.js" \
    --exclude="app.js" \
    --exclude="specialized-components.js" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

if [ -n "$DOM_VIOLATIONS" ]; then
    echo -e "${RED}❌ DOM MANIPULATION VIOLATION${NC}"
    echo "   DOM operations must only occur in BaseComponent/ComponentLibrary"
    echo ""
    echo "$DOM_VIOLATIONS" | head -20
    echo ""
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No DOM violations found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 2: Hardcoded Colors (hex, rgb, hsl, named)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [2/7] Checking for hardcoded colors..."

COLOR_VIOLATIONS=$(grep -rn --include="*.js" \
    -E "(#[0-9a-fA-F]{3,6}[^0-9a-fA-F]|rgb\(|rgba\(|hsl\(|hsla\()" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

# Filter out legitimate uses (CSS variable fallbacks in comments)
COLOR_VIOLATIONS=$(echo "$COLOR_VIOLATIONS" | grep -v "^.*//.*#" | grep -v "\.md:" || true)

if [ -n "$COLOR_VIOLATIONS" ]; then
    echo -e "${RED}❌ HARDCODED COLOR VIOLATION${NC}"
    echo "   All colors must use var(--vga-*) or var(--c-*)"
    echo ""
    echo "$COLOR_VIOLATIONS" | head -15
    echo ""
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No hardcoded colors found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 3: Inline Style Assignments
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [3/7] Checking for inline style assignments..."

STYLE_VIOLATIONS=$(grep -rn --include="*.js" \
    -e "\.style\.cssText" \
    -e "\.style\s*=" \
    --exclude="base-component.js" \
    --exclude="component-library.js" \
    --exclude="foundation.js" \
    --exclude="layout.js" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

if [ -n "$STYLE_VIOLATIONS" ]; then
    echo -e "${YELLOW}⚠️  INLINE STYLE WARNING${NC}"
    echo "   Styles should be in CSS classes, not inline JS"
    echo ""
    echo "$STYLE_VIOLATIONS" | head -15
    echo ""
    # Warning only, not blocking
else
    echo -e "${GREEN}✅ No inline style violations found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 4: Raw Animation APIs (requestAnimationFrame, setInterval for animation)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [4/7] Checking for animation API violations..."

ANIM_VIOLATIONS=$(grep -rn --include="*.js" \
    -e "requestAnimationFrame\s*(" \
    -e "cancelAnimationFrame\s*(" \
    --exclude="animation-foundation.js" \
    --exclude="base-component.js" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

if [ -n "$ANIM_VIOLATIONS" ]; then
    echo -e "${RED}❌ ANIMATION API VIOLATION${NC}"
    echo "   Use AnimationFoundation.AnimationLoop, not raw RAF"
    echo ""
    echo "$ANIM_VIOLATIONS" | head -10
    echo ""
    ((VIOLATIONS++))
else
    echo -e "${GREEN}✅ No animation violations found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 5: Non-F-Based Pixel Values (warning only)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [5/7] Checking for non-F-based pixel values..."

PX_VIOLATIONS=$(grep -rn --include="*.js" \
    -E ":\s*[0-9]+px" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

if [ -n "$PX_VIOLATIONS" ]; then
    echo -e "${YELLOW}⚠️  NON-F-BASED SIZING WARNING${NC}"
    echo "   Consider using calc(var(--f) * N) instead of raw px"
    echo ""
    echo "$PX_VIOLATIONS" | head -10
    echo ""
    # Warning only
else
    echo -e "${GREEN}✅ No raw pixel values found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 6: Layout Math Outside MathematicalFoundation
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [6/7] Checking for layout math violations..."

MATH_VIOLATIONS=$(grep -rn --include="*.js" \
    -e "offsetWidth" \
    -e "offsetHeight" \
    -e "getBoundingClientRect" \
    -e "clientWidth" \
    -e "clientHeight" \
    --exclude="mathematical-foundation.js" \
    --exclude="layout.js" \
    --exclude="base-component.js" \
    --exclude="component-library.js" \
    assets/js/tools/ assets/js/sections/ 2>/dev/null || true)

if [ -n "$MATH_VIOLATIONS" ]; then
    echo -e "${YELLOW}⚠️  LAYOUT MATH WARNING${NC}"
    echo "   Layout measurements should use MathematicalFoundation"
    echo ""
    echo "$MATH_VIOLATIONS" | head -10
    echo ""
else
    echo -e "${GREEN}✅ No layout math violations found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# CHECK 7: Tab Count (max 4 tabs per sidebar)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔍 [7/7] Checking sidebar tab counts..."

for file in assets/js/tools/*-tool.js; do
    if [ -f "$file" ]; then
        # Count top-level sidebar array items (tabs)
        TAB_COUNT=$(grep -oE "sidebar:\s*\[" -A 100 "$file" | grep -cE "^\s*\['" 2>/dev/null || echo "0")
        if [ "$TAB_COUNT" -gt 4 ]; then
            echo -e "${RED}❌ TAB COUNT VIOLATION: $file has $TAB_COUNT tabs (max allowed: 4)${NC}"
            ((VIOLATIONS++))
        fi
    fi
done
echo -e "${GREEN}✅ Tab count check complete${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════"
if [ $VIOLATIONS -gt 0 ]; then
    echo -e "${RED}❌ VALIDATION FAILED: $VIOLATIONS blocking violation(s) found${NC}"
    echo "   Fix the above issues before committing."
    exit 1
else
    echo -e "${GREEN}✅ VALIDATION PASSED: No blocking violations${NC}"
    echo "   (Warnings should still be addressed when possible)"
    exit 0
fi

