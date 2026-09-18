# A5 — Vercel function-entrypoint consolidation

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `api/content/[resource].js`, `blog/docs/site/adr-A5-function-consolidation.md`, `scripts/vercel/check-function-budget.mjs`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-09-18

## Goal

Stay within Vercel Hobby’s 12 Serverless Function limit without dropping the dynamic API.

## Done when

Content CRUD is one allowlisted gateway `api/content/[resource].js`; specialised routes remain separate; ADR A5 is committed.

## Sub-tasks

- [x] ADR `blog/docs/site/adr-A5-function-consolidation.md`
- [x] Replace six CRUD entrypoints with `[resource].js`
- [x] Budget check script + CI workflow

## Notes / decisions

- 2026-07-18: accepted ADR. Public URLs unchanged.
- 2026-09-18: H8 opened this tracker row; work already on `main`.

## References

- `blog/docs/site/adr-A5-function-consolidation.md`
