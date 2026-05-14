# ModalConfirm — binary confirm

## Role
Scrim-root (`modal-confirm modal-confirm-scrim` → `--c-scrim` from `styles.css`), centred bordered panel (`--c-*`), plain-text message, CONFIRM/CANCEL wired to callbacks.

## Constructor
| Field | Default |
|-------|---------|
| `message` | `''` |
| `onConfirm()`, `onCancel()` | noop |
| `confirmLabel`, `cancelLabel` | `CONFIRM` / `CANCEL` |

## Semantics
`mousedown` stops propagation inside panel only; sibling scrim inherits global click rules from host overlay. Typical host: ToolBase floating overlay (`assets/js/shared/components/feedback/ModalConfirm.js`).
