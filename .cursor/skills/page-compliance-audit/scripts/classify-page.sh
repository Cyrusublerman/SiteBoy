#!/usr/bin/env bash
# Classify a SiteBoy page file into one kind for the page-compliance-audit
# skill. Prints exactly one of:
#
#   p5-generator | generator | tool | section | gallery | docs | project |
#   project-host | algorithm | component | core-owner | unknown
#
# Usage: bash classify-page.sh <target-file>
#
# Uses POSIX grep only.

set -u

TARGET="${1:-}"
if [[ -z "$TARGET" || ! -f "$TARGET" ]]; then
    echo "unknown"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
REL="${TARGET#$REPO_ROOT/}"

case "$REL" in
    assets/js/tools/generators/scripts/*.gen.js | assets/js/tools/generators/scripts/*/*.gen.js)
        if grep -qE "context:[[:space:]]*['\"]p5['\"]" "$TARGET" 2>/dev/null; then
            echo "p5-generator"
        else
            echo "generator"
        fi
        ;;
    assets/js/tools/*)
        echo "tool"
        ;;
    assets/js/sections/tools_section.js)
        echo "tool"
        ;;
    assets/js/sections/art_section.js | assets/js/sections/qr_section.js)
        echo "gallery"
        ;;
    assets/js/sections/projects_section.js)
        echo "project-host"
        ;;
    assets/js/sections/blog_section.js | assets/js/sections/home_section.js | assets/js/sections/contact_section.js)
        echo "docs"
        ;;
    assets/js/sections/*_section.js)
        echo "section"
        ;;
    blog/projects/*)
        echo "project"
        ;;
    assets/js/shared/algorithms/*)
        echo "algorithm"
        ;;
    assets/js/shared/components/*)
        echo "component"
        ;;
    assets/js/core/*)
        echo "core-owner"
        ;;
    *)
        echo "unknown"
        ;;
esac
