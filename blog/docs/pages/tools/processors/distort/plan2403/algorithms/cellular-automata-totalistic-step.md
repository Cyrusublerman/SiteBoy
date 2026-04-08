# CellularAutomataTotalisticStep

| **Function** | `cellularAutomataTotalisticStep` |
| **Path** | `assets/js/shared/algorithms/physics/cellular-automata.js` |
| **Category** | `physics.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/cellular-automata-totalistic-step.md` |

## Purpose

Outer totalistic CA: birth/survival bitmasks on neighbour counts; optional bias fields.

## Formula

For alive cell: survives if `survival[sumNeighbours]`; dead births if `birth[sum]`; toroid/fixed boundary param.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| SUM | neighbour total |
| BIRTH,SURV | rule masks |

## I/O

In: state grid uint8, rule packs, boundary. Out: next grid.

## Complexity

O(n) per step.

## Modules

CELLULARAUTOMATA.

## @wikipedia Cellular_automaton
## unified-algorithm

RULE string B/S parsed once; NEIGHBOURHOOD param selects mask.
