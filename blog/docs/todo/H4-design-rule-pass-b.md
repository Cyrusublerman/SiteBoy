# H4 — Design-rule corpus: Pass-B LLM extract (stage 5)

**Status**: DONE  
**Priority**: P3  
**Owner file(s)**: `tools/scrape/extract.mjs`, `tools/scrape/schema.mjs`, `tools/scrape/prompts/pass-b.md`, `package.json`  
**Blockers**: none  
**Blocks**: plan.md pipeline stage 6 (embed)  
**Last touched**: 2026-05-12  

## Goal

Chunk each `clean.md`, call an LLM with a versioned prompt, emit validated `pass-b-claims.json` per article with deterministic quote verification (H-010).

## Done when

(a) `PassBClaimSchema` / `PassBClaimsChunkResponseSchema` exist in `tools/scrape/schema.mjs` and document relation to `RuleSchema` (no `id`/detector in Pass-B).  
(b) `tools/scrape/prompts/pass-b.md` exists with prescriptive-only rules and H-012/H-013 guidance.  
(c) `tools/scrape/extract.mjs` implements chunking, `--provider`, `--model`, `--force`, `--dry-run`, `--article`, `--max-chunks`, merges provenance, dedupes by normalised statement, and rejects claims whose normalised `quote` is not a substring of the normalised full article.  
(d) `npm run scrape:extract` exists; `scrape:run` does **not** include extract (avoid accidental API spend).  
(e) With five entries under `tools/scrape/cache/*/clean.md`, `npm run scrape:extract -- --dry-run` exits 0.

## Sub-tasks

- [x] Schema + prompt + script + npm script  
- [x] Five-article dry-run  
- [ ] Full LLM pass on corpus (requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) — optional follow-up  

## Notes / decisions

- Default models: Anthropic `claude-sonnet-4-20250514`, OpenAI `gpt-4o`.  
- Fallback URL `https://invalid.local/article#<hash>` only if `meta.url` missing and URL not found in `sources.json`.  

## References

- `blog/ideas/create rules for ai/plan.md` stage 5  
- audit H-010, H-012, H-013  
