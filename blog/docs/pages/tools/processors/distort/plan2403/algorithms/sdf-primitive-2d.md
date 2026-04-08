# SdfPrimitive2D

| **Function** | `sdfPrimitive2D` |
| **Path** | `assets/js/shared/algorithms/geometry/sdf-primitive-2d.js` |
| **Category** | `geometry.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/sdf-primitive-2d.md` |

## Purpose

Signed distance to analytic shapes: CIRCLE, BOX, ROUNDED_BOX, ELLIPSE, CAPSULE, RING, segment unions.

## Formula

Standard IQ library-style analytic SDFs in 2D; `ring = abs(d)-thickness/2`.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| PRIM | shape enum |
| d | signed distance |

## I/O

In: x,y, shape enum, params (centre, rot, scale). Out: signed distance.

## Complexity

O(1)/sample.

## Modules

SDFSHAPE.

## unified-algorithm

SHAPE enum param; one `dist(shape, p)` dispatch.

## @source Quilez 2D SDF
