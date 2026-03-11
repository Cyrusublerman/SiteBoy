# <Display Name> — UI Layout

## Parameter Table

| Key | Label | Type | Min | Max | Step | Default | Tier | Driveable | Controls |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<key>` | `<LABEL>` | range | <min> | <max> | <step> | <default> | 3 | yes/no | <What this param actually does in apply(). Not just a restatement of the label.> |

<One row per paramDef entry. Never omit a parameter.>

## Mask Controls

<State whether this module supports mask input. If yes: describe exactly how the mask is applied in apply() (alpha blend, selective apply, weight modulation). If no: "No mask controls.">

## Modulation Targets

<For each param with driveable: true, describe what per-pixel driving does. Example: "blurRadius driven per-pixel by luminance map: brighter regions receive more blur." If no driveable params: "No modulation targets.">

## UX Notes

<Note any parameters that interact non-obviously, labels that may be misleading, or values where maximum causes severe performance impact. If none: "No UX concerns identified.">
