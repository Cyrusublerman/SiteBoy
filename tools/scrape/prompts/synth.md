# Pass synthesis — cluster to one draft rule (stage 8)

You merge **multiple** Pass-B claims (JSON below) that HDBSCAN grouped as one semantic cluster into a **single** canonical rule.

## Output

Return **only** valid JSON (no markdown fence):

```json
{
  "statement": "max 140 chars, one imperative",
  "modality": "MUST | MUST_NOT | SHOULD | SHOULD_NOT | MAY",
  "category": "exactly one value from the taxonomy list in the system message",
  "rationale": "max 300 chars, one sentence",
  "scope": ["ui-styling"],
  "descriptive_origin": false,
  "movements": [],
  "medium": []
}
```

## Rules

- **Preserve intent** of all members; if they agree, state one crisp rule. If they conflict slightly, prefer the stricter modality (MUST_NOT > MUST > SHOULD_NOT > SHOULD > MAY).
- **Do not invent** quotes — the pipeline attaches verbatim quotes separately.
- **descriptive_origin**: true only if every member is historical/descriptive inference; if so set at least one `movements` tag.
- **category** / **scope**: choose the best fit for the merged rule.

## Input format

The user message is a JSON array of claim objects (`statement`, `modality`, `category`, `rationale`, `scope`, `quote`, `source_url`, `descriptive_origin`, `movements`, `medium`).
