# <Display Name> — Performance

## Dominant Operation

<Name the single most expensive computation in apply(). Be specific: not "the blur" but "the separable convolution — two passes of O(w × h × k) where k = 2×radius+1.">

## Complexity

`O(<formula>) where <variable> = <what it is>`

<State the nested loop structure. If bounded by a param, show the product: O(w × h × iterations).>

## Extreme Parameter Values

| Parameter | At maximum | Effect |
| --- | --- | --- |
| `<key>` | `<max value>` | <What happens to cost and output quality at this value> |

## Render Cost Class

| Quality | Class | Estimated time |
| --- | --- | --- |
| PREVIEW (≤800px) | A / B / C / D | < X ms |
| FULL (source res) | A / B / C / D | < X ms |

(Class A < 16ms, B 16–100ms, C 100–500ms, D > 500ms on typical hardware)

## Mitigation Candidates

<List as flagged items, not fixes, anything that could reduce cost. If no obvious mitigation: state that.>
- <Candidate 1>
- <Candidate 2>
