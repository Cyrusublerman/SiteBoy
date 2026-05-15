# Quine — Description

Quine types an abridged representation of its own generator configuration onto a simulated paper canvas, then diffuses the ink through a pixel buffer.

## Runtime Model

- State is isolated per p5 instance via `WeakMap`.
- Character timing is deterministic and derived from character index.
- Diffusion uses residue and echo buffers.
- Active-region tracking limits diffusion work to the area affected by wet ink.

## Output

The rendered text is a partial quine: it represents the generator configuration conceptually, but does not reproduce the exact source file byte-for-byte.

## Export

PNG export is supported. GIF/WebM are disabled because timing depends on cumulative character delay history and does not form a clean loop.
