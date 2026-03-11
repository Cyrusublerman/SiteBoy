from pathlib import Path
import re

ROOT = Path(r"c:/Users/Einod/Documents/GitHub/SiteBoy")
DOCS = ROOT / "blog/docs/pages/tools/generators"

LEGACY = {
    "lissajous": [
        "blog/docs/pages/art/generative/lissajous.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/lissajous-audit.md",
    ],
    "harmonics": [
        "blog/docs/pages/art/generative/lissajous.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/harmonics-audit.md",
    ],
    "torus": [
        "blog/docs/pages/art/generative/torus.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/torus-audit.md",
    ],
    "wave-interference": [
        "blog/docs/pages/art/generative/wave-interference.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/wave-interference-audit.md",
    ],
    "cymatics": [
        "blog/docs/pages/art/generative/cymatics.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/cymatics-audit.md",
    ],
    "moire": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/moire-generator-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/moire-generator-spec.md",
    ],
    "generative-pattern": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/generative-pattern-algorithm-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/generative-pattern-algorithm-spec.md",
    ],
    "tile-mosaic": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/tile-mosaic-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/tile-mosaic-spec.md",
    ],
    "circles": [
        "blog/docs/pages/art/generative/circles.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/circles-audit.md",
    ],
    "squares": [
        "blog/docs/pages/art/generative/squares.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/squares-audit.md",
    ],
    "solar-system": [
        "blog/docs/pages/art/generative/solar-system.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/solar-system-audit.md",
        "blog/docs/old-docs/legacy-tools/SOLAR-SYSTEM-TOOL-README.md",
    ],
    "interference-figure": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/interference-figure-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/interference-figure-spec.md",
    ],
    "wave-equation-synth": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/wave-equation-synth-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/wave-equation-synth-spec.md",
    ],
    "unified-pattern": [
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Audits/unified-pattern-generator-audit.md",
        "blog/docs/old-docs/legacy-docs/docs/Tool and Gen Pages/Specifications/unified-pattern-generator-spec.md",
    ],
}

REQ = [
    "source-reference.md", "description.md", "mechanisms.md", "ui-layout.md",
    "performance.md", "feature-parity.md", "issues-and-conflicts.md", "migration-log.md",
]

SS_PRESERVE = {"description.md", "mechanisms.md", "ui-layout.md"}


def wf(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.strip() + "\n", encoding="utf-8")


def g(pat, text, default="unknown"):
    m = re.search(pat, text)
    return m.group(1) if m else default


def classify(paths):
    if not paths:
        return "functional source reference only"
    kinds = set()
    for p in paths:
        n = p.name.lower()
        if "audit" in n:
            kinds.add("audit")
        elif "spec" in n:
            kinds.add("design/spec")
        else:
            kinds.add("page doc")
    if kinds == {"audit"}:
        return "audit only"
    if kinds <= {"design/spec", "page doc"}:
        return "design/spec only"
    return "mixed bundle"


def build_pack(script):
    text = script.read_text(encoding="utf-8")
    gid = g(r"id:\s*['\"]([^'\"]+)", text)
    title = g(r"title:\s*['\"]([^'\"]+)", text)
    category = g(r"category:\s*['\"]([^'\"]+)", text)
    context = g(r"context:\s*['\"]([^'\"]+)", text)
    desc = g(r"description:\s*['\"]([^'\"]*)", text, "")
    width = g(r"width:\s*(\d+)", text)
    height = g(r"height:\s*(\d+)", text)
    fps = g(r"defaultFps:\s*(\d+)", text, "n/a")
    animated = "animation:" in text
    has_info = "description:" in text
    groups = re.findall(r"group:\s*['\"]([^'\"]+)", text)
    fns = []
    for n in re.findall(r"function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", text):
        if n not in fns:
            fns.append(n)
    for n in re.findall(r"^\s{4}([A-Za-z_][A-Za-z0-9_]*)\s*\(", text, re.M):
        if n not in fns and n not in {"draw", "p5Draw", "p5Setup"}:
            fns.append(n)
    rebuild = []
    for a, b in re.findall(r"_lastParams\.(\w+)\s*!==\s*params\.(\w+)", text):
        if a == b and a not in rebuild:
            rebuild.append(a)
    pblock = text[text.find("presets:"):] if "presets:" in text else ""
    if "animation:" in pblock:
        pblock = pblock.split("animation:", 1)[0]
    presets = len(re.findall(r"name:\s*['\"]([^'\"]+)", pblock))
    legacy_paths = [ROOT / rel for rel in LEGACY.get(gid, []) if (ROOT / rel).exists()]
    klass = classify(legacy_paths)
    srel = script.relative_to(ROOT).as_posix()

    li = [f"- `{p.relative_to(ROOT).as_posix()}`" for p in legacy_paths] or ["- none located outside the live script"]
    ai = [f"- `reference/generators/{gid}/legacy-docs/{p.name}`" for p in legacy_paths] or ["- none"]
    gtext = ", ".join(f"`{x}`" for x in groups) if groups else "none detected"
    helpers = [f"- `{n}()`" for n in fns[:6]] or ["- no named helper extracted"]
    rlines = [f"- `{n}`" for n in rebuild] or ["- no explicit rebuild-only keys detected"]

    holes = []
    if legacy_paths:
        holes.append("- Archived legacy docs exist; any remaining feature comparison holes stay explicit in this pack.")
    else:
        holes.append("- No separate legacy docs were located; the live script is the primary reference.")
    if not rebuild:
        holes.append("- Structural-vs-presentation rebuild boundaries are not explicit in the source.")

    issues = []
    if context == "p5":
        issues.append("- p5 is a semantic dependency, not a performance upgrade.")
    if "putImageData" in text:
        issues.append("- Main-thread per-pixel raster work can dominate responsiveness.")
    if "fetch(" in text:
        issues.append("- External network dependency should be reviewed for offline and export behaviour.")
    if ("Math.random" in text or "p.random(" in text) and animated:
        issues.append("- Animated randomness should be checked for deterministic export.")
    if not has_info:
        issues.append("- No `description` field means the host INFO tab will be absent.")
    if not issues:
        issues.append("- No generator-specific conflict was auto-detected; archived references may reveal parity gaps.")

    if context == "p5":
        render = "The host creates the canvas, `p5Setup()` prepares state, and `p5Draw()` redraws the frame under host playback."
        cost = "Main-thread p5 redraw and any embedded simulation state."
    elif "putImageData" in text:
        render = "The source computes pixels in JS and commits the frame through `putImageData()`."
        cost = "Main-thread per-pixel raster work."
    elif context == "webgl":
        render = "The source declares a WebGL path and should keep heavy rendering in a GPU-backed pipeline."
        cost = "GPU render cost plus CPU-side precomputation."
    else:
        render = "The source renders in `draw(ctx, canvas, params, frame)` on a 2D canvas."
        cost = "Canvas 2D drawing and per-frame calculation."

    worker = "recommended if compute is deterministic and DOM-free" if ("putImageData" in text or "compute:" in text) else "not clearly indicated by the live source"
    webgl_note = "declared by source" if context == "webgl" else "not declared by source"

    li_str = "\n".join(li)
    ai_str = "\n".join(ai)
    helpers_str = "\n".join(helpers)
    rlines_str = "\n".join(rlines)
    holes_str = "\n".join(holes)
    issues_str = "\n".join(issues)

    anim_str = "yes" if animated else "no"
    info_str = "yes" if has_info else "no"
    anim_tab = "present" if animated else "absent"
    info_tab = "present" if has_info else "absent"
    fps_str = fps if animated else "n/a"
    preset_str = str(presets)

    body_desc = desc if desc else "Current live source provides the primary definition."

    return gid, {
        "source-reference.md": f"# {title} - Source Reference\n\n## Current Owners\n\n- live script: `{srel}`\n- registry: `assets/js/tools/generators/core/script-registry.js`\n- host: `assets/js/tools/generators/core/generative-tool-host.js`\n\n## Archive\n\n- `reference/generators/{gid}/source/{script.name}`\n{ai_str}\n\n## Prior Docs Used\n\n{li_str}\n\n## Classification\n\n- current source: `functional source/reference tool`\n- archived legacy bundle: `{klass}`",
        "description.md": f"# {title} - Description\n\n- id: `{gid}`\n- category: `{category}`\n- context: `{context}`\n- canvas: `{width}x{height}`\n- animated: `{anim_str}`\n\n{body_desc}",
        "mechanisms.md": f"# {title} - Mechanisms\n\n## Render Path\n\n{render}\n\n## Key Helpers\n\n{helpers_str}\n\n## Rebuild Notes\n\n{rlines_str}",
        "ui-layout.md": f"# {title} - UI Layout\n\n- `PARAMS`: {gtext}\n- `ANIMATE`: {anim_tab}\n- `EXPORT`: present\n- `INFO`: {info_tab}\n- presets: `{preset_str}`",
        "performance.md": f"# {title} - Performance\n\n- context: `{context}`\n- canvas: `{width}x{height}`\n- default fps: `{fps_str}`\n\nDominant cost: {cost}\n\n- worker review: {worker}\n- WebGL note: {webgl_note}",
        "feature-parity.md": f"# {title} - Feature Parity\n\n## Current Source Features\n\n- groups: {gtext}\n- presets: `{preset_str}`\n- animation: `{anim_str}`\n- info basis: `{info_str}`\n\n## Archived References\n\n{li_str}\n\n## Open Parity Holes\n\n{holes_str}",
        "issues-and-conflicts.md": f"# {title} - Issues And Conflicts\n\n## Risks\n\n{issues_str}\n\n## Missing Evidence\n\n{holes_str}",
        "migration-log.md": f"# {title} - Migration Log\n\n## Inputs Used\n\n- live script: `{srel}`\n{li_str}\n\n## Archive Outputs\n\n- `reference/generators/{gid}/source/{script.name}`\n- `reference/generators/{gid}/legacy-docs/`\n\n## Classification\n\n- archived legacy bundle: `{klass}`",
    }


def main():
    scripts = sorted(set(ROOT.glob("assets/js/tools/generators/scripts/**/*.gen.js")))
    complete = 0
    for script in scripts:
        gid, files = build_pack(script)
        pack = DOCS / gid
        for name, content in files.items():
            if gid == "solar-system" and name in SS_PRESERVE and (pack / name).exists():
                continue
            wf(pack / name, content)
        if all((pack / f).exists() for f in REQ):
            complete += 1
    print(f"complete packs: {complete}/{len(scripts)}")


if __name__ == "__main__":
    main()
