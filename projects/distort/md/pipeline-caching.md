### Cache key

Each node's output buffer is cached. The cache key for node `n` is:

```
key_n = hash(moduleId_n, params_n, key_{n-1})
```

`key_0 = hash(src)` — the source image hash.

This recursive definition means a node's key encodes the full history of its inputs: the source image, all upstream nodes, and all their parameters. If anything upstream changes, the key changes.

The hash function is a deterministic 64-bit FNV-1a over the concatenated binary representations of its inputs. Floating-point params are quantised to 4 decimal places before hashing to avoid floating-point noise invalidating keys.

### Cache hit

When the worker receives a `RenderRequest`, it computes the cache key for each node in order. If the key matches a cached entry, the cached `Uint8ClampedArray` is used as that node's output and `apply()` is not called. Execution resumes from the first cache miss.

If the source image has not changed and only the last node's params changed, only the last node re-executes. If the first node's params change, all nodes re-execute.

### LRU ceiling and eviction

The cache is an LRU (least-recently-used) map with a hard memory ceiling of **128 MB**. Each entry's size is `width × height × 4` bytes. On every cache insertion, if the total size exceeds 128 MB, entries are evicted from the least-recently-used end until the ceiling is satisfied.

Quality level is encoded in the key: a PREVIEW buffer and a FULL buffer for the same node are stored as separate entries. Typical usage: the PREVIEW cache warms quickly (small buffers); the FULL cache holds at most a few entries for large images before evicting.

### Invalidation rules

The following events invalidate the entire cache (all entries cleared):

- Source image change (new file loaded, or crop/resize)
- Node added to stack
- Node removed from stack
- Node order changed (drag-reorder)
- Seed change

The following events invalidate only the affected node and all downstream nodes (nodes below it in the stack):

- Any param change on node `n` → nodes `n..N` invalidated

Undo and redo replay the spec difference: if the undo reverts node `n`'s params, the same partial invalidation rule applies.

### Why this matters

On a 4K source image with an 8-node stack, a full re-render of all nodes at FULL quality may take several seconds. The cache ensures that editing the contrast of the final colour-grade node does not recompute the upstream convolution or blur passes. The perceived responsiveness of the tool depends entirely on cache hit rate during a typical editing session.
