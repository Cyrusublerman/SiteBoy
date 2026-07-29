# G4 — `:::block` parser and sanitiser

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/shared/algorithms/markup/block-parser.js`, `assets/js/shared/algorithms/markup/block-types.js`, `assets/js/shared/algorithms/markup/block-sanitiser.js`, `assets/js/shared/algorithms/markup/html-sanitiser.js`
**Blockers**: —
**Blocks**: → G1
**Last touched**: 2026-07-30

## Goal

One shared, DOM-free implementation of the `:::block <type>\n<json>\n:::` directive defined in `vercel-dynamic-migration-plan.md` §B3.5, used unchanged by the admin editor (browser) and the public renderer (Node), plus a default-deny sanitisation pass over its output.

Migration-plan unit: S14.

## Done when

`npm run test:run` passes with `tests/block-parser-sanitiser.test.js` asserting all four predicates:

1. Each of the eight registered block types parses to a `block` node carrying its JSON payload.
2. Every malformed input in the test corpus (unterminated fence, invalid JSON, non-object payload, missing/malformed/unknown type, info-line attributes, non-string source) yields a `warning` node and no throw.
3. No hostile input in the test corpus yields sanitised output containing a `script`/`style`/`iframe`/`object`/`embed`/`form`/`svg` element, an `on*` or `style` attribute, or a `javascript:`/`data:` URL — verified both by string assertion and by reparsing the output with a real HTML parser.
4. No unknown block type reaches the renderer as a block node.

## Sub-tasks

- [x] Enumerate the closed block-type registry from plan §B3.4 / S14 task 3.
- [x] Line-oriented fence scanner; markdown code fences excluded from directive recognition.
- [x] Strict `JSON.parse` payload with non-throwing degradation to warning nodes.
- [x] Per-type prop schema validation; unrecognised props dropped.
- [x] URL scheme filter with control-character, character-reference and backslash normalisation.
- [x] DOM-free HTML tokeniser with element/attribute allow-lists.
- [x] `stringifyBlockDocument` round-trip, lossless over malformed input.
- [x] Test corpus: well-formed, nesting, malformed, unknown type, hostile.
- [ ] Public renderer instantiates `ComponentLibrary` classes from sanitised block nodes (S14 consumer; not in this unit).
- [ ] Tighten public CSP per D-11 (S14 task 5; deployment configuration, not this unit).

## Notes / decisions

- 2026-07-28: The plan specifies no nested fence syntax and no info-line attributes, so neither is accepted. A `:::block` line encountered before the closing `:::` becomes part of the payload and therefore fails strict JSON parsing, degrading to a `malformed-json` warning. Nesting is expressible only by JSON-encoding markdown into a `body` prop, which the parser preserves verbatim.
- 2026-07-28: `data:` is denied in every position, including `img` sources, because `data:image/svg+xml` executes script.
- 2026-07-28: `allow-same-origin` is removed from an `iframe` block's sandbox whenever `allow-scripts` survives; the pair is equivalent to no sandbox.
- 2026-07-28: Absolute `iframe` sources are denied unless the caller supplies `embedHostAllowList` and the URL is `https`. Default is same-origin only, per D-11.
- 2026-07-28: Inline p5 sketch source is not supported. Only a repository-relative `.js` path is accepted, because inline source is arbitrary script execution.
- 2026-07-28: Code lives under `assets/js/shared/algorithms/markup/` rather than the `assets/js/shared/markdown/` path named in S14, because the LIBRARY PARADIGM DISTINCTION assigns pure functional, DOM-free code to the algorithms library. No serverless entrypoint was added, so the function budget is unchanged at 10.
- 2026-07-30: Adversarial review (fresh DOM per payload) found a real `stripHtml` bypass: loose tags with URL attributes (`<https://x href=javascript:…>`, `<a"x href=…>`) survived because only `on*`/`style` were treated as executable. Fixed by also escaping loose tags that carry URL/markup attributes or values decoding to a denied scheme. CommonMark autolinks still survive (path segments after `https:` are mis-tokenised as inert attributes, not URL sinks). DOMPurify not required. Verification harness must create a new document per payload — reused `innerHTML` produced false positives.

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §B3.4, §B3.5, §C2 S14
- `blog/docs/site/vercel-migration/decisions.md` D-11
- `tests/block-parser-sanitiser.test.js`
- G1
