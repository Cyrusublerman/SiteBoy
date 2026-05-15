# H5 — Design-rule corpus: embed, cluster, synthesise (stages 6–8)

**Status**: DONE  
**Priority**: P3  
**Owner file(s)**: `tools/scrape/embed.mjs`, `tools/scrape/cluster.mjs`, `tools/scrape/synth.mjs`, `tools/scrape/pipeline-lib.mjs`, `tools/scrape/prompts/synth.md`, `tools/scrape/schema.mjs` (embedded + draft types), `package.json`  
**Blockers**: none  
**Blocks**: plan.md stage 9 (conflict-detect)  
**Last touched**: 2026-05-12  

## Goal

After Pass-B: embed statements (`text-embedding-3-small`), run HDBSCAN on L2-normalised vectors, synthesise `draft-rules.json` with optional LLM merge for multi-member clusters.

## Done when

(a) `npm run scrape:embed` exists; reads `pass-b-claims.json`, writes `claims-embedded.json` per article when `OPENAI_API_KEY` is set.  
(b) `npm run scrape:cluster` writes `cache/_corpus/clusters.json` using `hdbscan-ts` with `min_cluster_size` default 2 and includes `noise_members`.  
(c) `npm run scrape:synth` writes `cache/_corpus/draft-rules.json`; requires LLM credentials only when some cluster has more than one member.  
(d) `node tools/scrape/cluster.mjs` then `node tools/scrape/synth.mjs --force` exits 0 with zero embedded claims (empty corpus smoke path).

## Sub-tasks

- [x] embed + cluster + synth + `pipeline-lib.mjs`  
- [ ] Full run: extract → embed → cluster → synth on paid API keys  

## Notes / decisions

- Cosine target from plan: HDBSCAN uses Euclidean MRD on **unit L2-normalised** embeddings (proxy for cosine).  
- Stage 9+ (conflicts, emit, lint) not in this item.  

## References

- `blog/ideas/create rules for ai/plan.md` stages 6–8  
- H4 (Pass-B)  
