# Node Group — `MFP_SEQ_ValidStacks`

## Purpose

Represent the current implementation sequence model: every non-empty contiguous stack height `1..M`, padded with zeros to `M` layers.

## Functional Contract

For a `Sequence ID` and `Layer Index`, return the filament occupying that layer under `generateSequences(N,M)` parity. Positive layer entries are 1-indexed filament IDs; padded entries are `0`.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | `0..Sequence Count-1` | `0` | hard fail if out of range |
| Filament Count | Int | count | whole `>=1` | from params | hard fail if `<1` |
| Layers Per Tile | Int | count | whole `>=1` | from params | hard fail if `<1` |
| Layer Index | Int | index | `0..Layers Per Tile-1` | `0` | out of range returns empty/invalid |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Filament ID | Int | field | `0` for padded layer, else `1..Filament Count` |
| Stack Height | Int | field | active non-zero height for the sequence |
| Local Sequence ID | Int | field | ID within the stack-height block |
| Is Empty Layer | Boolean | field | `Layer Index >= Stack Height` |
| Is Valid Query | Boolean | field | sequence/layer indices are in range |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | instance/point | read optional | caller may provide instead of socket |
| layer_index | Int | instance/point | read optional | caller may provide instead of socket |

## Maths / Logic

```text
N = max(1, Filament Count)
M = max(1, Layers Per Tile)
i = floor(Sequence ID)
j = floor(Layer Index)

block_size(H) = N^H
cumulative_before(H) = sum(h=1..H-1, N^h)

Find smallest H in 1..M where:
  i < cumulative_before(H) + block_size(H)

local = i - cumulative_before(H)
if j < 0 OR j >= M OR i < 0:
  valid = false; filament_id = 0
else if j >= H:
  filament_id = 0
else:
  digit = floor(local / N^j) mod N
  filament_id = digit + 1
```

## Node Composition

```text
Group Input
  -> Floor/Clamp: N, M, Sequence ID, Layer Index
  -> Repeat Zone over H = 1..M:
       accumulate previous block sizes
       detect first block containing Sequence ID
       capture Stack Height and Local Sequence ID
  -> Compare Layer Index >= Stack Height -> Is Empty Layer
  -> Math(Power): N^Layer Index
  -> Math(Divide/Floor/Modulo/Add 1): digit to Filament ID
  -> Switch(Is Empty Layer OR invalid): 0 vs computed Filament ID
  -> Group Output
```

## Blender vs Python Ownership

GN may implement this with a bounded repeat zone when `Layers Per Tile <= 10`. Python remains acceptable for precomputing sequence tables when counts grow or exact sort parity is required. This node group remains the public lookup contract either way.

## Validation / Failure Modes

- `Sequence ID` beyond `N*(N^M-1)/(N-1)-1` is invalid.
- High `N^M` can exceed practical grid size before it exceeds maths.
- Digit position is least-significant-layer first to match current implementation assumptions; reversing it changes parity.
- Padding zeros must not count as printable layers.

## Parity Notes

This is implementation-accurate for `generateSequences(N,M)`: no all-zero stack, no gaps after zero, heights emitted from `1` to `M`.

## Implementation Checklist

- [ ] Decide GN repeat-zone implementation versus Python precomputed table for MVP.
- [ ] Preserve height-block order exactly.
- [ ] Confirm digit direction against actual generated sequence examples.
- [ ] Return `0` for padded layers, not filament `1`.
- [ ] Feed output through `MFP_FIL_Lookup` before colour/tool use.
- [ ] Validate the first and last sequence in each stack-height block against Python-generated examples.

