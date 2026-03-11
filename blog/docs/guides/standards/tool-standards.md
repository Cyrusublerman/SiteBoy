# Tool Page Standards

Minimum functional requirements for SiteBoy tools.

Authority:
- `blog/docs/guides/standards/design-law.md` — visual and geometric law
- `blog/docs/site/ui-interface-overview.md` — page structure and standard tool organisation

This file defines feature minimums only. It does not own spacing, typography, border, or colour law.

---

## 1. Minimum Functionality by Output Type

### 1.1 Canvas or Image Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Canvas sizing | Yes | width/height controls |
| Zoom/Pan | Yes | canvas viewport config |
| Display modes | Yes | fit/fill/actual |
| Export PNG | Yes | export action |
| Export SVG | If vector | export action |
| Clear or Reset | Yes | button |
| Background colour | Optional | colour control only when output semantics require it |

Canvas integration rule:
- zoom, pan, and display mode belong to the canvas system, not custom per-tool transform code

### 1.2 Animation Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Play/Pause | Yes | button or transport |
| Stop/Reset | Yes | button |
| Frame export | Yes | animation export flow |
| GIF/Video export | Yes | animation export flow |
| Frame rate | Yes | FPS control |
| Loop toggle | Yes | toggle |
| Duration display | Yes | status/value display |
| Frame scrubber | Optional | slider |
| Playback speed | Optional | slider |

Animation integration rule:
- playback must use the approved animation foundation, not custom timing loops

### 1.3 Audio Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Play/Stop | Yes | button |
| Volume | Yes | slider |
| Export audio | If applicable | export action |
| Mute toggle | Optional | toggle |
| Waveform display | Optional | output surface |

### 1.4 Data or Calculation Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Copy to clipboard | Yes | button |
| Export JSON/CSV | If applicable | export action |
| Value displays | Yes | value components |

### 1.5 File Input

| Feature | Required | Typical Component |
| --- | --- | --- |
| File picker | Yes | file input |
| Format info | Yes | label or helper surface |
| Clear/Reset | Yes | button |
| Drag and drop | Optional | file input enhancement |

---

## 2. Tool Composition Rules

1. Use the standard tab and block naming from `ui-interface-overview.md` unless a domain-specific partition is clearer.
2. Keep all controls inside the site partition system defined by `design-law.md`.
3. Do not duplicate shared logic when an existing component, utility, or foundation owns it.
4. Canvas tools draw at `(0, 0)` and let the owning canvas system handle display transforms.
5. Export actions must be explicit and discoverable.

---

## 3. Reuse and Extraction

Extract shared logic when all are true:
1. It appears in three or more tools.
2. It is non-trivial.
3. It can be tested or reasoned about in isolation.
4. It has a configurable interface.

Do not extract when any are true:
1. It is highly local to one tool.
2. It is simpler inline.
3. It depends too heavily on tool-specific state.

Track candidate utilities in `blog/docs/guides/shared-utilities.md`.

---

## 4. Submission Checklist

### 4.1 Functionality

- [ ] Required features for the output type are present
- [ ] Export actions work
- [ ] Reset or clear path exists
- [ ] Output interaction model works

### 4.2 Consistency

- [ ] Tool layout follows `ui-interface-overview.md`
- [ ] Visual law follows `design-law.md`
- [ ] Standard names are used where applicable

### 4.3 Code Quality

- [ ] No duplicate logic from existing tools
- [ ] No custom zoom/pan when canvas owner already provides it
- [ ] No custom timing loop when animation owner already provides it
- [ ] Shared utilities are reused where applicable

---

End of Tool Page Standards.

