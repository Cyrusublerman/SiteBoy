# <Display Name> — Feature Parity

## Feature Inventory

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| <Feature described in component-level doc> | `<type>.md` | Confirmed / Changed / Absent / Conflicting | <Detail — location in source or reason for absence> |

<One row per feature described in the component-level doc and any other legacy docs. Never mark all as Confirmed without examination.>

## Module Standard Feature Audit

| Feature | Used? | Notes |
| --- | --- | --- |
| Mask support | Yes / No | <How, or not present> |
| Driver system (driveable params) | Yes / No | <Which params; or none> |
| buildGeometry() | Yes / No | <What geometry, or absent> |
| destroy() | Yes / No | <What it cleans up, or absent> |
| PREVIEW quality cap | Yes / No | <What is capped; or absent — flag as WARN> |
| Presets | Yes / No | <Count and names; or none> |

## Parity Holes

<Explicit numbered list. Not "none" unless the feature inventory genuinely shows every feature is confirmed.>

1. <Feature absent from live source — cite component-level doc>
2. <Feature changed from spec — describe the difference>
