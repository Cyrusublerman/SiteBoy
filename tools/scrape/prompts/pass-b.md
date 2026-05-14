# Pass-B — Design rule extraction (LLM)

You extract **atomic, prescriptive** design or UX rules from a **single chunk** of article markdown. The article may be truncated; only use this chunk.

## Output contract

Reply with **only** valid JSON (no markdown fence, no prose):

```json
{
  "claims": [
    {
      "statement": "string, max 140 chars, single imperative sentence",
      "modality": "MUST | MUST_NOT | SHOULD | SHOULD_NOT | MAY",
      "category": "one taxonomy value (see categories list in system message)",
      "rationale": "one sentence, max 300 chars, why this matters",
      "scope": ["ui-styling"],
      "quote": "verbatim substring from THIS chunk only",
      "descriptive_origin": false,
      "movements": [],
      "medium": []
    }
  ]
}
```

- `scope`: at least one of `ui-styling`, `canvas`, `print`, `algorithm`, `motion`, `data-viz`. Use `ui-styling` for general web UI copy; `data-viz` for charts/infographics; `print` for print production; `motion` for animation; `algorithm` for code-structure advice meant for tooling; `canvas` for raster/canvas output rules.
- `movements`: optional stylistic overlays: `swiss`, `brutalism`, `minimalism`, `bauhaus`, `flat`, `material`, `maximalism`. Use `[]` if not applicable.
- `medium`: optional surfaces: `web`, `print`, `mobile`, `motion`, `large-format`.
- `assertion_line`: optional positive integer if this claim aligns with a numbered hint line from Pass-A (usually omit).

## Quote fidelity (mandatory)

- `quote` must be copied **exactly** from the chunk (allow any contiguous substring, including a full sentence).
- Do not paraphrase inside `quote`. Punctuation and casing must match the source chunk.
- If you cannot find a verbatim substring that supports the claim, **omit that claim**.

## What to extract

- Rules a designer or developer could **obey or audit** (do X, avoid Y, prefer Z).
- One claim = one decision. Split combined list items into separate claims.

## What to reject (H-012 — definitions vs prescriptions)

**Do not emit** rows that are only definitions or background:

- BAD: "An infographic is a multimedia graphic aiming to present complex information..."
- BAD: "Minimalism is a design philosophy that..."
- GOOD: "Present data truthfully when designing information graphics."

**Do not emit** vague praise, history-only sentences, or author biography.

## descriptive_origin (H-013)

Set `"descriptive_origin": true` only when the rule is **inferred** from descriptive or historical prose ("Swiss designers often used...", "Tufte advocates...") rather than a direct imperative in the source.

If `descriptive_origin` is **true**, you **must** set at least one `movements` tag that fits the source (e.g. `swiss` for Swiss Style articles).

## Optional Pass-A hints

If the user message includes a "Pass-A hints" block, use it only for coverage — every claim must still have a valid `quote` from the chunk.

## Empty chunks

If the chunk has no extractable prescriptive claims, return `{"claims":[]}`.
