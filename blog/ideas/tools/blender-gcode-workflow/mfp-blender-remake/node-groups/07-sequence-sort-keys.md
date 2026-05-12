# Node Group — `MFP_SEQ_SortKeys`

## Purpose

Compute deterministic per-sequence sort keys matching current MFP sort methods.

## Functional Contract

Given sampled sequence layer values, output the primary metric, lexicographic fallback key, and diagnostic components required to sort or verify sequence order. Exact whole-grid sorting may be Python-owned; key calculation remains visible in GN.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | valid sequence range | `0` | used for table/formula lookup |
| Sort Method | Int enum | - | `0=layer_count`, `1=base_colour`, `2=top_colour`, `3=complexity`, `4=lexicographic` | `0` | unsupported invalid |
| Layers Per Tile | Int | count | `>=1` | params | hard fail if `<1` |
| Filament Count | Int | count | `>=1` | params | needed for key packing |
| Sequence Model Inputs | Mixed | - | same as `MFP_SEQ_FilamentAt` | required | must resolve every layer |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Primary Key | Float/Int | sequence | method-specific sortable value |
| Secondary Key | Float/Int | sequence | packed lexicographic fallback |
| Layer Count | Int | sequence | non-zero layer count |
| Base Colour | Int | sequence | `seq[0]` |
| Top Colour | Int | sequence | last non-zero filament ID |
| Complexity | Int | sequence | count of non-zero colour changes |
| Sort Valid | Boolean | sequence | all layer queries and method are valid |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | instance | read optional | identifies sequence being keyed |
| sort_primary | Float/Int | instance | write by caller | stored result for Sort Elements/Python parity |
| sort_secondary | Float/Int | instance | write by caller | stored fallback key |

## Maths / Logic

```text
seq[k] = MFP_SEQ_FilamentAt(Sequence ID, k)
layer_count = count(k where seq[k] != 0)
base_colour = seq[0]
top_colour = last(seq[k] where seq[k] != 0) else 0
complexity = count(k > 0 where seq[k] != 0 AND seq[k] != seq[k-1])
lex_key = sum(k=0..L-1, seq[k] * (Filament Count + 1)^(L-1-k))

primary =
  layer_count      when Sort Method == 0
  base_colour      when Sort Method == 1
  top_colour       when Sort Method == 2
  complexity       when Sort Method == 3
  lex_key          when Sort Method == 4
secondary = lex_key
```

## Node Composition

```text
Group Input
  -> Repeat Zone over layer k = 0..Layers Per Tile-1
       call MFP_SEQ_FilamentAt
       accumulate layer_count
       preserve base_colour at k=0
       update top_colour on non-zero layer
       compare current vs previous -> complexity
       pack lex_key
  -> Switch(Sort Method) -> Primary Key
  -> Group Output
```

## Blender vs Python Ownership

GN owns key calculation and optional small-list `Sort Elements` use. Python should own exact list sorting for large sequence sets, split-grid exports, CSV row order, and stable fallback ordering.

## Validation / Failure Modes

- Packed lexicographic keys can lose precision for large `L` or high filament counts; Python should sort exact arrays when needed.
- `Top Colour` for an all-zero sequence is `0`, though valid models should not generate all-zero stacks.
- Unsupported sort methods set `Sort Valid = false`.

## Parity Notes

Matches current `sortSequences()` metrics: layer count, base colour, top colour, complexity, and lexicographic fallback. Sorting stability is a Python parity concern.

## Implementation Checklist

- [ ] Implement repeat-zone layer sampling through `MFP_SEQ_FilamentAt`.
- [ ] Store primary and secondary keys as attributes before sorting.
- [ ] Use Python for exact production sorting until GN key precision is proven.
- [ ] Add debug display for each component key.
- [ ] Confirm order against sample web-tool outputs.
- [ ] Store the original unsorted `sequence_id` so sorted grids can still round-trip to source data.

