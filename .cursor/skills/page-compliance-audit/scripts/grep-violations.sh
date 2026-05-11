#!/usr/bin/env bash
# Static violation sweep for SiteBoy page-compliance-audit skill.
# Emits one line per candidate violation:
#   <rule-id>  <file>:<line>  <evidence>
# Candidates are not final FAILs — the agent must read the cited line in
# context to confirm. False positives are explicit, not silent.
#
# Usage: bash grep-violations.sh <target-file>
#
# Uses POSIX grep + awk only (no ripgrep dependency). Each rule's output
# is produced by a single awk process so SIGPIPE on downstream `head`
# terminates cleanly without per-line errors.

set -u
trap '' PIPE

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
    echo "usage: grep-violations.sh <target-file>" >&2
    exit 2
fi
if [[ ! -f "$TARGET" ]]; then
    echo "not a file: $TARGET" >&2
    exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Owner exemption regexes (paths that may legitimately contain the pattern).
OWN_DOM_RE='assets/js/(core/(base-component|app|router|animation-foundation|gpu-foundation)|shared/(foundation|component-library|specialized-components|content|layout|components/.+))\.js$'
OWN_ANIM_RE='assets/js/core/animation-foundation\.js$'
OWN_GPU_RE='assets/js/core/gpu-foundation\.js$|assets/js/tools/processors/distort/core/GPURenderPath\.js$|assets/js/tools/processors/distort/shaders/.+\.shader\.js$'
OWN_ROUTER_RE='assets/js/core/router\.js$'
OWN_BASECOMPONENT_RE='assets/js/(core/base-component|shared/foundation)\.js$'

REL="${TARGET#$REPO_ROOT/}"

# format_emit RULE
# Reads "line:text" lines on stdin, emits "<rule>  <REL>:<line>  <text>".
# Single awk process per rule keeps SIGPIPE handling clean. Awk's own
# broken-pipe complaints to stderr are suppressed since callers may pipe
# through head/sort and close the pipe early.
format_emit() {
    awk -v rule="$1" -v rel="$REL" -F: '
    {
        line = $1
        sub(/^[^:]*:/, "")
        printf "%s  %s:%s  %s\n", rule, rel, line, $0
    }' 2>/dev/null
}

# sweep RULE PATTERN [EXEMPT_RE]
sweep() {
    local rule="$1" pattern="$2" exempt_re="${3:-}"

    if [[ -n "$exempt_re" && "$REL" =~ $exempt_re ]]; then
        return 0
    fi

    grep -nE "$pattern" "$TARGET" 2>/dev/null | format_emit "$rule"
}

# ----- Rule sweeps -------------------------------------------------------

# DOM-OUTSIDE-BC: actual DOM-manipulation API in tool/section files.
# Bare window.<service> access is the codebase's global service-locator
# pattern (window.ComponentLibrary, window.debugLog, etc.) and is NOT a
# DOM violation — only window.location/history are DOM/browser APIs and
# those are covered by ROUTING-OUTSIDE-ROUTER. Limit this rule to operations
# that mutate or read the DOM tree directly.
sweep DOM-OUTSIDE-BC \
    '(document\.|\.innerHTML|\.outerHTML|\.createElement|\.appendChild|\.insertBefore|\.removeChild|\.replaceChild|\.insertAdjacentHTML)' \
    "$OWN_DOM_RE"

# RAF-FOR-ANIM: requestAnimationFrame / cancelAnimationFrame.
sweep RAF-FOR-ANIM \
    '(requestAnimationFrame|cancelAnimationFrame)' \
    "$OWN_ANIM_RE"

# TIMER-FOR-ANIM: timers used for animation. The agent must verify each is
# actually animation-driven, not e.g. a debounce or one-shot teardown delay.
sweep TIMER-FOR-ANIM \
    '(setInterval|clearInterval|setTimeout|clearTimeout)' \
    "$OWN_ANIM_RE"

# RAW-GPU: WebGL/WebGPU acquisition outside owners.
sweep RAW-GPU \
    "(navigator\\.gpu|getContext\\(['\"]webgl2['\"]|GPUDevice|WebGLTexture)" \
    "$OWN_GPU_RE"

# CONSOLE-LOG: console.log (must be window.debugLog). console.error/warn allowed.
sweep CONSOLE-LOG \
    'console\.log\(' \
    ''

# RAW-COLOUR: hex / rgb / hsl literals. Excludes lines that already use
# var(--c-*) and excludes the 16 VGA hexes. Canvas pixel output is exempt
# at the semantic level — agent must judge per cited line.
grep -nE '#[0-9a-fA-F]{3,8}|rgb[a]?\(|hsl[a]?\(' "$TARGET" 2>/dev/null \
| grep -v 'var(--c-' \
| grep -Ev '#(000000|800000|008000|808000|000080|800080|008080|c0c0c0|808080|ff0000|00ff00|ffff00|0000ff|ff00ff|00ffff|ffffff)\b' \
| format_emit RAW-COLOUR

# NON-F-PIXEL: pixel literals other than 1px (border). The agent must
# confirm the literal is in a layout/styling position, not in a comment
# or a numeric calculation that does not feed a style.
grep -nE '[0-9]+px' "$TARGET" 2>/dev/null \
| grep -Ev '\b1px\b' \
| format_emit NON-F-PIXEL

# BANNED-VISUAL: gradients, shadows, rounded corners.
sweep BANNED-VISUAL \
    '(border-radius|box-shadow|text-shadow|linear-gradient|radial-gradient|conic-gradient)' \
    ''

# ROUTING-OUTSIDE-ROUTER: history/hash routing.
sweep ROUTING-OUTSIDE-ROUTER \
    '(pushState|popstate|location\.hash|history\.replaceState)' \
    "$OWN_ROUTER_RE"

# BASECOMPONENT-DUP: a second class definition for BaseComponent.
sweep BASECOMPONENT-DUP \
    'class[[:space:]]+BaseComponent' \
    "$OWN_BASECOMPONENT_RE"

# INLINE-STYLE-CSSTEXT: inline cssText assignments. Owner DOM files exempt.
sweep INLINE-STYLE-CSSTEXT \
    'style\.cssText[[:space:]]*=' \
    "$OWN_DOM_RE"

exit 0
