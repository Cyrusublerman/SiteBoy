<!-- generated: do not edit -->

# Hot Rules

Top MUST / MUST_NOT rules by `priority × confidence`.
Injected into `.cursorrules` between `<!-- HOT-RULES:START -->` and `<!-- HOT-RULES:END -->`.

<!-- HOT-RULES:START -->
labelling-A51B905B [MUST] Place user notes above AI interpretation in the note body order. — User intent at capture time often outweighs machine-extracted content.
process-A1242058 [MUST] Keep raw capture, claim extraction, normalisation, and synthesis as separate mandatory stages. — Stage separation prevents unstructured text from contaminating downstream synthesis.
process-60B25A20 [MUST] Preserve source traceability for every extracted claim. — Traceability supports audit, conflict resolution, and downstream citation.
information-architecture-825228BD [MUST] Retain page coordinates for every crop. — Spatial linkage to source pages is required for provenance and re-extraction.
naming-BB08FD32 [MUST] Replace YourTableName with the actual table name before deployment. — A mismatched table name prevents Power Query from loading the source data.
data-visualisation-C773805E [MUST] Present data clearly and truthfully in information graphics. — Informational honesty is the most important principle when designing infographics.
data-visualisation-7BC4321A [MUST] Scale charts to show data differences and communicate the value range accurately. — Accurate scaling prevents misrepresentation of the underlying dataset.
data-visualisation-9A7F184F [MUST_NOT] Do not truncate the y-axis when users must compare different values on the graph. — Truncation exaggerates differences and leads to erroneous relative-value inferences.
data-visualisation-16406877 [MUST] Clearly show when a chart scale has been truncated. — Visible truncation disclosure prevents viewers from misreading exaggerated trends.
data-visualisation-26478FE2 [MUST_NOT] Do not use chart scales that misrepresent differences between data points. — Inaccurate scale gives an incorrect impression of the original data.
data-visualisation-08B67FF8 [MUST_NOT] Do not crop, stretch, or otherwise distort charts within an infographic. — Distorted charts give a false impression of the available data.
labelling-96D5A4ED [MUST] Indicate the information source used to calculate any summary statistics. — Source attribution lets viewers verify figures and assess credibility.
accessibility-EADA4301 [MUST_NOT] Never use color as the only visual distinction in an infographic. — Colorblind and visually impaired users cannot decode meaning from color alone.
composition-8B1C712F [MUST_NOT] Do not treat aesthetic beauty as the primary design purpose. — Swiss Design held that beauty is a by-product of function, not an end in itself.
composition-A7A03B68 [MUST_NOT] Exclude eccentricity and personal expression from design. — Personal expression was seen as incompatible with universal, objective communication.
composition-DFCCB5E6 [MUST] Design the site to serve its content purpose. — A website is for content, not an application or video game; design must serve that role.
composition-4BCCA4E5 [MUST_NOT] Do not add decoration for its own sake or designer vanity. — Needless decoration distracts visitors from the reason for visiting and makes content secondary.
composition-67547AD1 [MUST_NOT] Exclude unrelated content such as misleading links or sensationalist headlines. — Unrelated misleading or sensationalist content pulls visitors away from the site's actual content.
composition-B0DDFEB2 [MUST_NOT] Do not focus on decoration or tricking visitors into clicking ads. — Prioritising decoration or ad trickery makes content and the visitor experience suffer.
labelling-D558EF3C [MUST] Use controlled vocabularies for classification, not uncontrolled AI tag sprawl. — Controlled tags keep search, book assembly, and metadata consistent across the archive.
labelling-08860125 [MUST_NOT] Do not use unrestricted AI tag invention as the main metadata system. — Freeform AI tags prevent consistent search, filtering, and book rule matching.
labelling-3EC08932 [MUST] Use a controlled tag registry for all stored tags. — A registry enforces namespaces, aliases, and review requirements for metadata.
labelling-118D5E11 [MUST] Map AI tag suggestions back to the controlled registry before storage. — Suggested tags must resolve to canonical registry entries, not freeform strings.
labelling-AE120A20 [MUST_NOT] Never use freeform tagging as the main classification prompt output. — Controlled-field prompts keep classifications mappable to the tag registry.
labelling-B7501390 [MUST] Auto-apply classification tags at confidence >= 0.85. — High-confidence tags can enter the archive without manual review delay.
labelling-B7478B30 [MUST_NOT] Do not apply tags with confidence below 0.55; mark uncertain instead. — Low-confidence tags would pollute metadata and book selection rules.
labelling-8A8EC3B7 [MUST] Label generative outputs as generative derivatives. — Clear labelling distinguishes AI-generated content from archival truth.
labelling-E061F9E0 [MUST] Enforce the tag registry for all stored metadata tags. — Registry enforcement prevents uncontrolled tag sprawl in the archive.
labelling-C30C6105 [MUST] Map tag aliases to controlled registry entries. — Alias mapping normalises variant labels into canonical tags.
labelling-5ADC10DC [MUST] Keep AI captions separate from controlled tags. — Captions are descriptive prose and must not pollute the tag registry.
labelling-77B950B3 [MUST] Store inline manual notes verbatim from the --note flag. — Preserves exact user wording without paraphrase or cleanup at capture time.
accessibility-1365021E [MUST] Ensure content is readable in all browsers. — Websites exist to deliver consumable content; readability across browsers honours that purpose.
interaction-516861FC [MUST] Provide a review UI for accuracy and publishing quality. — Human review is required to correct crops, tags, OCR, and derivative approval.
interaction-C61386F3 [MUST] Trigger voice capture from a headphone shortcut or phone hardware button. — Hands-free capture is the primary entry point; without a hardware shortcut the workflow fails.
interaction-3A100675 [MUST] Begin capture when the user presses the configured hardware shortcut. — The core flow starts only on explicit user action via headphone or phone button.
interaction-56067EFC [MUST] Record audio immediately after the capture shortcut is pressed. — Audio capture is the essential input step before any transcription or routing.
interaction-8D66EE51 [MUST] Allow appending to existing notes via voice command. — Voice append supports incremental note building without switching input modes.
interaction-4789C0A1 [MUST] Provide standard LLM actions including analysis and search across notes. — Analysis and cross-note search extend capture into a usable knowledge workflow.
interaction-DC30E4A2 [MUST] Restrict clickable responses to hyperlinks and buttons only. — Websites are hypertext documents whose primary interactions are navigation and form submission.
interaction-EC979A90 [MUST_NOT] Do not trick or deceive the visitor through interaction design. — A website must deliver information and interact honestly with its visitor.
interaction-A604F5FC [MUST_NOT] Do not use JavaScript to assist browser scrolling. — All browsers scroll properly without assistance; breaking scroll requires intentional careless implementation.
process-B30D7539 [MUST] Run the corpus pipeline as structured extraction, not summarisation. — Summarisation bypasses atomic claim extraction and loses source traceability.
process-F5AC8BBD [MUST] Register every in-scope source. — Unregistered sources cannot be inventoried, captured, or audited for coverage.
process-92EE8A78 [MUST] Inventory every registered page. — Page inventory is prerequisite to coverage capture and claim extraction.
process-AE1017E8 [MUST] Decompose every inventoried page into content units. — Content-unit decomposition enables systematic review and claim candidate generation.
process-96BA05BE [MUST] Review every content unit. — Unreviewed units risk omitted claims and incomplete coverage ledgers.
process-5542CEAE [MUST] Extract every relevant atomic claim. — Atomic claims are the base semantic unit for classification and synthesis.
process-339F08A6 [MUST] Classify every extracted claim across multiple dimensions. — Multi-dimensional classification enables retrieval, deduplication, and conflict analysis.
process-9BE812CF [MUST] Handle duplicate and conflicting guidance explicitly. — Silent conflict merging produces unreliable synthesis outputs.
process-682C2F05 [MUST] Generate synthesis outputs only from structured claims. — Synthesis from unstructured text bypasses normalisation and audit controls.
process-BAF78C6B [MUST_NOT] Do not summarise raw pages directly into guides. — Direct summarisation skips atomic extraction and coverage verification.
process-128A31C3 [MUST_NOT] Do not generate synthesis from unstructured text. — Unstructured synthesis lacks classification, deduplication, and audit trails.
process-839FDEA5 [MUST_NOT] Do not treat a page as complete without a coverage ledger. — Coverage ledgers prove all content units were reviewed before extraction closes.
process-2C3DCE18 [MUST] Use atomic claim as the base semantic unit. — Atomic claims enable precise classification, deduplication, and synthesis.
process-B4EB91F5 [MUST_NOT] Do not silently invent or merge categories. — Silent category changes distort retrieval and break taxonomy governance.
process-808DB8DD [MUST_NOT] Do not silently merge conflicting advice. — Merged conflicts hide trade-offs that downstream agents must resolve explicitly.
process-ABD3B99B [MUST_NOT] Do not remove repeated guidance as familiar; repetition may indicate authority. — Discarding repeated guidance loses evidence of authoritative consensus.
process-39BAD601 [MUST_NOT] Do not compress distinct claims into one record unless semantically inseparable. — Over-merging claims reduces retrieval precision and audit granularity.
process-010307D5 [MUST] Record uncertainty, omissions, and parse risks explicitly. — Explicit uncertainty records prevent silent data loss during extraction.
process-697F6ED3 [MUST_NOT] Do not skip any pipeline stage. — Skipped stages leave gaps in coverage, classification, or audit.
process-D5EEE71C [MUST] Mark a pipeline stage blocked when its inputs are missing. — Blocking prevents downstream stages from running on incomplete data.
process-B152589E [MUST_NOT] Do not create a new category when an existing category plus tags suffices. — Unnecessary categories fragment retrieval and inflate taxonomy maintenance.
process-2531F760 [MUST_NOT] Use only normalised claims as synthesis input, never raw webpage text. — Raw text synthesis bypasses classification, deduplication, and conflict analysis.
process-9AFDACDC [MUST] Complete coverage before interpretation. — Interpretation before coverage risks systematic omission of source content.
process-70E2AB2E [MUST] Extract atomic claims before synthesis. — Synthesis without atomic claims produces un-auditable consolidated guidance.
process-72AD18CB [MUST] Classify claims across multiple dimensions before filing. — Pre-filing classification enables retrieval, conflict detection, and normalisation.
process-7612AFAA [MUST] Record conflicts before consolidation. — Conflict records preserve divergent guidance for explicit resolution.
process-672E22C8 [MUST] Normalise claims before instruction generation. — Normalisation deduplicates and canonicalises claims before compact instructions.
process-B88962A2 [MUST] Audit before marking extraction complete. — Audit reconciles coverage and surfaces low-confidence or unresolved conflicts.
process-9E6CB849 [MUST_NOT] Do not synthesise from raw webpage text. — Raw-text synthesis skips structured claim validation and normalisation.
process-83568172 [MUST] Preserve original scans untouched. — Archival integrity requires immutable source files for reprocessing and audit.
process-158DC070 [MUST] Generate cleaned page versions without replacing originals. — Working copies must not overwrite the authoritative scan archive.
process-A17702C8 [MUST] Record all transformations applied to notebook pages. — Transformation history enables reprocessing and provenance verification.
process-FF0AF286 [MUST] Allow manual correction without breaking provenance. — Human review must improve accuracy while preserving traceable correction records.
process-F61398F9 [MUST_NOT] Do not replace manual curation. — Automated pipelines cannot substitute human editorial judgment for book-quality output.
process-5AE2E0BA [MUST_NOT] Do not produce final books without review. — Unreviewed book output risks publishing errors and misclassified assets.
process-00696A57 [MUST_NOT] Do not treat AI outputs as authoritative. — AI-derived classifications and transcriptions require human verification before archival truth.
process-F0096B45 [MUST_NOT] Do not destroy or overwrite source scans. — Source scan loss eliminates the ability to reprocess with improved models.
process-06C43D13 [MUST_NOT] Do not classify everything using whole-page vision prompts. — Whole-page prompts miss region-level detail and waste model capacity on full scans.
process-E06D6822 [MUST_NOT] Do not send full-resolution scans to vision models except for coarse page overview. — Full-resolution input wastes compute and exceeds typical model input limits.
process-999C5EA7 [MUST_NOT] Never modify source files during ingest. — Ingest must preserve the integrity of incoming scan files.
process-B453A21B [MUST] Crop regions from the highest useful cleaned image, not the compressed preview. — Low-resolution previews lose detail needed for accurate region extraction.
process-06C667A6 [MUST_NOT] Do not discard overlapping regions automatically. — Overlapping content may represent distinct assets requiring separate extraction.
process-2B425ADF [MUST] Make background removal branch-specific to asset type. — BW line art, colour drawings, and collages need different isolation methods.
process-CAEC75C2 [MUST_NOT] Do not use general AI background removal first on BW line art. — Threshold-based extraction preserves faint lines that AI removal often destroys.
process-95B4347A [MUST] Always retain the raster source when generating vectors. — Raster retention allows re-vectorisation with different parameters or tools.
process-EE12DE20 [MUST] Save vectorisation parameters with every vector output. — Parameter records enable reproducibility and comparative reprocessing.
process-45F929BE [MUST_NOT] Do not vectorise all assets by default. — Indiscriminate vectorisation wastes compute and produces unusable SVGs.
process-727F974B [MUST] Mark over-complex vectors for human review. — Complex SVGs may be unusable for print or book layout without curation.
process-7BE3AB28 [MUST_NOT] Never replace source assets with generative derivatives. — Generative outputs are creative reinterpretations, not archival replacements.
process-DC676D1A [MUST] Separate creative outputs from archival outputs. — Mixing creative and archival assets undermines provenance and trust.
process-7503E621 [MUST_NOT] Do not use generated images as evidence of original content. — Generative images must not stand in for what was physically drawn in the notebook.
process-A3CF672E [MUST_NOT] Do not treat creative AI tools as archival truth. — Experimental vector and render tools produce derivatives, not authoritative records.
process-2527C210 [MUST] Write correction records instead of destructively altering source metadata. — Append-only corrections preserve audit trail and enable rollback.
process-8921BEA3 [MUST_NOT] Exclude full vectorisation, Gaussian splats, advanced AI classification, and full book generation from the MVP. — The first version should deliver core ingest, OCR, regions, tags, and index only.
process-7D8496CD [MUST] Preserve raw OCR separately from cleaned transcriptions. — Raw OCR retains the unmodified model output for audit and re-cleaning.
process-1EEF8E5E [MUST] Require manual approval before including assets in books. — Book inclusion without approval risks publishing misclassified or low-quality assets.
process-B9DAC529 [MUST] Handle all date formats listed in the comprehensive reference table. — Broad format coverage is the core functional requirement of the standardisation system.
process-8CEB93E6 [MUST] Parse date inputs regardless of capitalization. — Case insensitivity prevents parse failures on mixed or uppercased month names.
process-89A61AE6 [MUST] Remove filler words from date inputs without losing meaning. — Linguistic fillers like "the" and "of" block standard date parsers.
process-82BF752B [MUST] Strip ordinal suffixes while preserving day values. — Ordinals such as 3rd must become 3 before numeric parsing succeeds.
process-9558A332 [MUST] Convert written number words to digits during date parsing. — Verbal day values like Third must become numeric tokens for parsing.
process-3AB3A1D9 [MUST] Process ten thousand rows in under thirty seconds on standard hardware. — Performance target keeps batch transforms usable on typical office machines.
process-523E16A0 [MUST] Keep memory footprint under five hundred megabytes during transformation. — Memory cap prevents Power Query from exhausting client resources on large tables.
process-7CACBF40 [MUST_NOT] Never modify source data during date standardisation. — Non-destructive transforms preserve the original column for audit and rollback.
process-DFF62642 [MUST] Flag unparseable dates as null rather than guessing. — Null output avoids silently wrong dates that corrupt downstream analysis.
process-FBC7A8D8 [MUST] Support single-click deployment for end users. — Low-friction deployment reduces manual setup errors for non-technical users.
process-5077DB6F [MUST] Support Excel 2016 and later on Windows, Mac, and Excel Online. — Platform coverage matches the stated deployment environments for the tool.
process-75F84BEB [MUST] Add inline comments explaining complex logic. — Comments reduce maintenance cost when extending parsing strategies.
process-00A015BE [MUST] Version-control the configuration. — Version control tracks dictionary and handler changes across team deployments.
process-8144EE7B [MUST] Identify and parse forty or more distinct date format patterns. — Wide pattern coverage is the stated goal of the automated transformer.
process-3EAC0399 [MUST] Handle case-insensitive text inputs during date parsing. — Mixed-case month names are common in manually entered datasets.
process-18AA1499 [MUST] Remove linguistic filler words during normalisation. — Fillers like "the" and "of" must be stripped before token replacement.
process-8703AA1A [MUST] Convert ordinal and written numbers during standardisation. — Verbal ordinals and number words require conversion before Date.From succeeds.
process-DFE2CD90 [MUST] Preserve data integrity through non-destructive operations. — Original values must remain available while a new standardised column is added.
process-7C53BCBF [MUST] Handle malformed and ambiguous date inputs. — Real datasets contain typos and locale-ambiguous strings that must not crash the pipeline.
process-4EA47DE2 [MUST_NOT] Return null when parsing fails; do not guess a date. — Guessing produces incorrect dates that are harder to detect than nulls.
process-7BA19227 [MUST] Include a space after ordinal suffixes to avoid partial matches. — Suffix stripping without trailing space can corrupt unrelated substrings.
process-901BC619 [MUST] Return null gracefully when no parse strategy succeeds. — Graceful null output keeps batch processing from halting on edge cases.
process-6BF888F7 [MUST] Ensure the date column has a header before deployment. — Headers are required when converting a range to a named Excel Table.
process-7CCDAC41 [MUST] Convert the data range to an Excel Table before loading Power Query. — Power Query loads structured tables reliably via Excel.CurrentWorkbook.
process-145CD556 [MUST] Achieve at least ninety-five percent parse success rate in integration tests. — The success criterion defines minimum acceptable coverage before release.
process-17DC574D [MUST] Allow zero incorrect parses; null results are acceptable. — Wrong dates are worse than null because they silently corrupt analysis.
process-0765D14C [MUST] Complete processing of the test dataset in under thirty seconds. — Integration tests must confirm the NFR-1 performance target is met.
process-90C54F02 [MUST] Run all forty format examples from the specification before production deploy. — Format coverage must be verified against the full reference table.
process-E08A5EC6 [MUST] Test with a dataset of one thousand or more rows before production deploy. — Volume testing catches performance regressions not visible in unit tests.
process-000901CA [MUST] Verify leap year handling including February twenty-ninth before deploy. — Feb 29 is a common edge case that distinguishes valid from invalid dates.
process-7BE64851 [MUST] Validate null handling for empty cells before production deploy. — Empty cells must return null without throwing or producing wrong dates.
process-9F569CD7 [MUST] Confirm average processing stays under five milliseconds per cell. — Per-cell timing validates the stated average processing budget.
process-3DBD020F [MUST] Coerce date column values to text with Text.From before parsing. — ParseAnyDate expects text; date-typed columns fail without coercion.
process-ABA839EA [MUST] Wrap column values in Text.From when calling ParseAnyDate. — Text.From is the documented correct invocation for mixed-type columns.
process-4804AABD [MUST_NOT] Do not pass a date-typed column directly to ParseAnyDate without Text.From. — Direct date columns trigger conversion errors in the parse function.
process-B272088F [MUST] Document any failed parse cases before deploying to production. — Known failures must be recorded so users understand coverage limits.
process-A867479A [MUST] Test case variations including upper, lower, and mixed case before deploy. — Case-insensitivity is a functional requirement that must be validated.
process-0FC566A7 [MUST] Test with a sample of actual production data before deploying. — Production samples reveal formats absent from synthetic test suites.
process-37C43B5A [MUST_NOT] Keep derived layers append-only; higher layers must not replace lower layers. — Preserves the full capture hierarchy from raw screenshot through tags and backlinks.
process-3B10A268 [MUST] Preserve raw OCR in the note body and a sidecar file. — Ensures the unprocessed OCR text remains available for audit and reprocessing.
process-152C79AB [MUST_NOT] Do not let AI summarisation replace captured material. — AI summaries are interpretive and must not displace the original screen content.
process-26B54A1B [MUST] Always save the original screenshot for every capture session. — The raw screenshot is the authoritative record and must survive all processing failures.
process-DB29B476 [MUST_NOT] Never let AI cleanup replace the raw source material. — Cleaned extraction is a derived layer and must not overwrite archival source data.
process-68F8A642 [MUST] Mark capture notes unreviewed unless the user explicitly confirms otherwise. — Captures are drafts until a human reviews and confirms their quality.
process-6904DB47 [MUST] Maintain a stable YAML frontmatter schema across all capture outputs. — Consistent frontmatter enables downstream tooling, search, and reprocessing.
process-6FD706CF [MUST_NOT] Use explicit capture only; do not run continuous screen monitoring. — Continuous monitoring poses privacy risk and produces low-value noise.
process-BD1DD5FA [MUST] Keep the text-mode capture path fast. — Text mode is the default for quick captures and must not incur heavy processing overhead.
<!-- HOT-RULES:END -->
