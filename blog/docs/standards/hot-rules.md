<!-- generated: do not edit -->

# Hot Rules

Top MUST / MUST_NOT rules by `priority × confidence`.
Injected into `.cursorrules` between `<!-- HOT-RULES:START -->` and `<!-- HOT-RULES:END -->`.

<!-- HOT-RULES:START -->
information-architecture-825228BD [MUST] Retain page coordinates for every crop. — Spatial linkage to source pages is required for provenance and re-extraction.
labelling-A51B905B [MUST] Place user notes above AI interpretation in the note body order. — User intent at capture time often outweighs machine-extracted content.
naming-BB08FD32 [MUST] Replace YourTableName with the actual table name before deployment. — A mismatched table name prevents Power Query from loading the source data.
process-60B25A20 [MUST] Preserve source traceability for every extracted claim. — Traceability supports audit, conflict resolution, and downstream citation.
process-A1242058 [MUST] Keep raw capture, claim extraction, normalisation, and synthesis as separate mandatory stages. — Stage separation prevents unstructured text from contaminating downstream synthesis.
accessibility-EADA4301 [MUST_NOT] Never use color as the only visual distinction in an infographic. — Colorblind and visually impaired users cannot decode meaning from color alone.
data-visualisation-08B67FF8 [MUST_NOT] Do not crop, stretch, or otherwise distort charts within an infographic. — Distorted charts give a false impression of the available data.
data-visualisation-16406877 [MUST] Clearly show when a chart scale has been truncated. — Visible truncation disclosure prevents viewers from misreading exaggerated trends.
data-visualisation-26478FE2 [MUST_NOT] Do not use chart scales that misrepresent differences between data points. — Inaccurate scale gives an incorrect impression of the original data.
data-visualisation-7BC4321A [MUST] Scale charts to show data differences and communicate the value range accurately. — Accurate scaling prevents misrepresentation of the underlying dataset.
data-visualisation-9A7F184F [MUST_NOT] Do not truncate the y-axis when users must compare different values on the graph. — Truncation exaggerates differences and leads to erroneous relative-value inferences.
data-visualisation-C773805E [MUST] Present data clearly and truthfully in information graphics. — Informational honesty is the most important principle when designing infographics.
labelling-96D5A4ED [MUST] Indicate the information source used to calculate any summary statistics. — Source attribution lets viewers verify figures and assess credibility.
accessibility-1365021E [MUST] Ensure content is readable in all browsers. — Websites exist to deliver consumable content; readability across browsers honours that purpose.
affordance-4904DEC7 [MUST_NOT] Do not create clickable areas that are not obviously hyperlinks or buttons. — Ambiguous click targets cause unwanted actions and cause visitors to miss real links.
affordance-8E4E42AA [MUST_NOT] Do not hide form submission behind hyperlinks or unadorned text. — Buttons agree to submit visitor information; disguising that action betrays the core nature of a website.
composition-4BCCA4E5 [MUST_NOT] Do not add decoration for its own sake or designer vanity. — Needless decoration distracts visitors from the reason for visiting and makes content secondary.
composition-67547AD1 [MUST_NOT] Exclude unrelated content such as misleading links or sensationalist headlines. — Unrelated misleading or sensationalist content pulls visitors away from the site's actual content.
composition-8B1C712F [MUST_NOT] Do not treat aesthetic beauty as the primary design purpose. — Swiss Design held that beauty is a by-product of function, not an end in itself.
composition-A7A03B68 [MUST_NOT] Exclude eccentricity and personal expression from design. — Personal expression was seen as incompatible with universal, objective communication.
composition-B0DDFEB2 [MUST_NOT] Do not focus on decoration or tricking visitors into clicking ads. — Prioritising decoration or ad trickery makes content and the visitor experience suffer.
composition-DFCCB5E6 [MUST] Design the site to serve its content purpose. — A website is for content, not an application or video game; design must serve that role.
feedback-4417F8C0 [MUST] Read stored notes back aloud when the user requests. — Voice readback closes the loop for hands-free review without a screen.
grid-4E49A8A5 [MUST] Map layout confidence explicitly to Markdown output forms. — Explicit confidence mapping avoids false structure entering the knowledge base.
grid-C76FF0FC [MUST_NOT] Do not force Markdown table syntax when table structure is uncertain. — False table structure corrupts knowledge-base readability and search quality.
grid-D2A1F7D4 [MUST] Record confidence for layout inference because it is probabilistic. — Avoids presenting uncertain structure detection as authoritative document layout.
grid-DED07D9A [MUST_NOT] Record layout confidence and do not overstate exact layout reconstruction. — Exact layout reconstruction is out of scope for v1 and must not be falsely implied.
information-architecture-1B086081 [MUST] Preserve prompt, model, seed, and settings for generative derivatives. — Generative provenance requires full reproduction metadata.
information-architecture-21A2D356 [MUST_NOT] Do not auto-create excessive suggested backlinks. — Large backlink sets reduce signal and clutter review workflows.
information-architecture-2C0715AC [MUST] Treat the physical notebook as the canonical source for all digital outputs. — Derived artefacts must never supersede or replace the original scanned notebook.
information-architecture-49168620 [MUST] Connect to an Obsidian vault or other known storage locations. — Integration with existing vaults avoids siloed notes outside the user's workflow.
information-architecture-54C9E564 [MUST] Preserve provenance at every pipeline stage. — Traceability from physical notebooks to all derived digital outputs is the core archival requirement.
information-architecture-68D6EE1F [MUST_NOT] Never flatten page roles into a single output type. — Pages simultaneously hold text, drawings, metadata, and publishing assets that require separate representations.
information-architecture-888CFCF9 [MUST] Preserve source hashes across reprocessing. — Hashes verify that derived outputs trace to unchanged source files.
information-architecture-9017C037 [MUST] Link every output to notebook, page, coordinates, pipeline version, and review status. — Downstream assets remain auditable only when full lineage metadata is retained.
information-architecture-A1B2E015 [MUST] Preserve source file path and hash at ingest. — Path and hash records enable deduplication and provenance verification.
information-architecture-A9818E67 [MUST] Use an LLM to determine note type, categorise entries, and store them. — Automated classification routes notes to the correct storage without manual filing.
information-architecture-B431AF65 [MUST] Transcribe audio, infer note category, and route to the correct storage location. — Category inference enables automatic filing without user intervention at capture time.
information-architecture-FE3FA353 [MUST] Ensure every output answers notebook, page, location, process, model, parameters, review, and archival type questions. — Complete provenance metadata distinguishes a reliable archive from an untraceable asset dump.
interaction-3A100675 [MUST] Begin capture when the user presses the configured hardware shortcut. — The core flow starts only on explicit user action via headphone or phone button.
interaction-4789C0A1 [MUST] Provide standard LLM actions including analysis and search across notes. — Analysis and cross-note search extend capture into a usable knowledge workflow.
interaction-516861FC [MUST] Provide a review UI for accuracy and publishing quality. — Human review is required to correct crops, tags, OCR, and derivative approval.
interaction-56067EFC [MUST] Record audio immediately after the capture shortcut is pressed. — Audio capture is the essential input step before any transcription or routing.
interaction-8D66EE51 [MUST] Allow appending to existing notes via voice command. — Voice append supports incremental note building without switching input modes.
interaction-A604F5FC [MUST_NOT] Do not use JavaScript to assist browser scrolling. — All browsers scroll properly without assistance; breaking scroll requires intentional careless implementation.
interaction-C61386F3 [MUST] Trigger voice capture from a headphone shortcut or phone hardware button. — Hands-free capture is the primary entry point; without a hardware shortcut the workflow fails.
interaction-DC30E4A2 [MUST] Restrict clickable responses to hyperlinks and buttons only. — Websites are hypertext documents whose primary interactions are navigation and form submission.
interaction-EC979A90 [MUST_NOT] Do not trick or deceive the visitor through interaction design. — A website must deliver information and interact honestly with its visitor.
labelling-08860125 [MUST_NOT] Do not use unrestricted AI tag invention as the main metadata system. — Freeform AI tags prevent consistent search, filtering, and book rule matching.
labelling-118D5E11 [MUST] Map AI tag suggestions back to the controlled registry before storage. — Suggested tags must resolve to canonical registry entries, not freeform strings.
labelling-3EC08932 [MUST] Use a controlled tag registry for all stored tags. — A registry enforces namespaces, aliases, and review requirements for metadata.
labelling-5ADC10DC [MUST] Keep AI captions separate from controlled tags. — Captions are descriptive prose and must not pollute the tag registry.
labelling-77B950B3 [MUST] Store inline manual notes verbatim from the --note flag. — Preserves exact user wording without paraphrase or cleanup at capture time.
labelling-8A8EC3B7 [MUST] Label generative outputs as generative derivatives. — Clear labelling distinguishes AI-generated content from archival truth.
labelling-AE120A20 [MUST_NOT] Never use freeform tagging as the main classification prompt output. — Controlled-field prompts keep classifications mappable to the tag registry.
labelling-B7478B30 [MUST_NOT] Do not apply tags with confidence below 0.55; mark uncertain instead. — Low-confidence tags would pollute metadata and book selection rules.
labelling-B7501390 [MUST] Auto-apply classification tags at confidence >= 0.85. — High-confidence tags can enter the archive without manual review delay.
labelling-C30C6105 [MUST] Map tag aliases to controlled registry entries. — Alias mapping normalises variant labels into canonical tags.
labelling-D558EF3C [MUST] Use controlled vocabularies for classification, not uncontrolled AI tag sprawl. — Controlled tags keep search, book assembly, and metadata consistent across the archive.
labelling-E061F9E0 [MUST] Enforce the tag registry for all stored metadata tags. — Registry enforcement prevents uncontrolled tag sprawl in the archive.
modularity-0F4B6925 [MUST] Structure code modularly for easy updates. — Modular M code allows format handlers to be added without rewriting the pipeline.
modularity-14199FF6 [MUST] Make AI providers interchangeable by configuration. — Configuration-driven provider swap avoids code changes when switching models.
modularity-21AE73B5 [MUST] Let the Python layer own all post-capture processing. — Centralises OCR, layout, vision, and Markdown generation in one extensible codebase.
modularity-458F2302 [MUST_NOT] Do not overwrite OCR data when producing structured layout blocks. — Layout inference is a separate derived layer that must preserve the raw OCR record.
modularity-8A048FFE [MUST] Design the system to be model-agnostic. — Replaceable AI workers prevent vendor lock-in and enable benchmarking.
modularity-BC262883 [MUST_NOT] Avoid VBA macros and external dependencies. — Dependency-free queries run in Excel Online and reduce security review burden.
modularity-DE2C0CC1 [MUST_NOT] Do not rely on a single AI provider. — Provider abstraction avoids lock-in and enables benchmarking and fallback.
modularity-F9FD3662 [MUST_NOT] Do not duplicate logic that performs the same task in multiple places. — Repeated identical logic is harder to maintain when behaviour must change.
modularity-FD0905E0 [MUST] Store derivative versions separately from canonical source objects. — Separate derivative storage keeps provenance clear and enables version comparison.
modularity-FE2970EE [MUST] Use modular Python for processing and restrict shell to capture orchestration only. — Separates brittle screenshot triggers from extensible OCR, layout, and vision modules.
naming-0CC52AA1 [MUST] Change the column name in the parse call to match your data. — ParseAnyDate must read the column that holds raw date strings.
naming-20818CAA [MUST] Change the table name in the Source line to match your workbook. — The Source expression must reference the actual registered table name.
naming-73F8F8F1 [MUST] Match the column name in code to the actual column exactly. — Power Query column references are case-sensitive and must match exactly.
naming-8CC6437C [MUST] Normalise tags to lowercase hyphenated form with no spaces. — Consistent tag formatting prevents duplicate tags and eases vocabulary matching.
naming-97661BB6 [MUST] Assign notebook and page IDs before any processing. — All downstream outputs derive identity from IDs assigned at ingest.
naming-A6516137 [MUST] Use safe characters only in capture note filenames. — Avoids filesystem collisions and broken links across platforms and sync tools.
naming-B38A0ADB [MUST_NOT] Do not rename canonical objects after creation. — Renaming breaks references across metadata, exports, and book manifests.
naming-DD8920CA [MUST] Use stable IDs for all canonical archive objects. — Stable IDs prevent broken links when reprocessing or exporting.
navigation-A1918973 [MUST] Link stored notes to the Generative Note Library after persistence. — Library linkage keeps voice captures discoverable within the broader note ecosystem.
navigation-A3BB0C82 [MUST] Preserve the browser back button as an undo for navigational clicks. — The back button is a core, enduring web feature and often the visitor's only means of undoing an errant click.
navigation-C38CBDED [MUST_NOT] Do not break native back-button navigation through design or programming. — Breaking back navigation requires deliberate engineering and shows contempt for the site visitor.
process-000901CA [MUST] Verify leap year handling including February twenty-ninth before deploy. — Feb 29 is a common edge case that distinguishes valid from invalid dates.
process-00696A57 [MUST_NOT] Do not treat AI outputs as authoritative. — AI-derived classifications and transcriptions require human verification before archival truth.
process-00A015BE [MUST] Version-control the configuration. — Version control tracks dictionary and handler changes across team deployments.
process-010307D5 [MUST] Record uncertainty, omissions, and parse risks explicitly. — Explicit uncertainty records prevent silent data loss during extraction.
process-06C43D13 [MUST_NOT] Do not classify everything using whole-page vision prompts. — Whole-page prompts miss region-level detail and waste model capacity on full scans.
process-06C667A6 [MUST_NOT] Do not discard overlapping regions automatically. — Overlapping content may represent distinct assets requiring separate extraction.
process-0765D14C [MUST] Complete processing of the test dataset in under thirty seconds. — Integration tests must confirm the NFR-1 performance target is met.
process-0FC566A7 [MUST] Test with a sample of actual production data before deploying. — Production samples reveal formats absent from synthetic test suites.
process-128A31C3 [MUST_NOT] Do not generate synthesis from unstructured text. — Unstructured synthesis lacks classification, deduplication, and audit trails.
process-145CD556 [MUST] Achieve at least ninety-five percent parse success rate in integration tests. — The success criterion defines minimum acceptable coverage before release.
process-152C79AB [MUST_NOT] Do not let AI summarisation replace captured material. — AI summaries are interpretive and must not displace the original screen content.
process-158DC070 [MUST] Generate cleaned page versions without replacing originals. — Working copies must not overwrite the authoritative scan archive.
process-17DC574D [MUST] Allow zero incorrect parses; null results are acceptable. — Wrong dates are worse than null because they silently corrupt analysis.
process-18AA1499 [MUST] Remove linguistic filler words during normalisation. — Fillers like \"the\" and \"of\" must be stripped before token replacement.
process-1EE29E02 [MUST] Write a raw OCR sidecar file for every capture session. — The OCR sidecar preserves machine-readable text outside the rendered Markdown body.
process-1EEF8E5E [MUST] Require manual approval before including assets in books. — Book inclusion without approval risks publishing misclassified or low-quality assets.
process-2527C210 [MUST] Write correction records instead of destructively altering source metadata. — Append-only corrections preserve audit trail and enable rollback.
process-2531F760 [MUST_NOT] Use only normalised claims as synthesis input, never raw webpage text. — Raw text synthesis bypasses classification, deduplication, and conflict analysis.
process-26B54A1B [MUST] Always save the original screenshot for every capture session. — The raw screenshot is the authoritative record and must survive all processing failures.
process-27D45A2E [MUST] On vision failure, omit the vision section and record the reason. — Failed vision analysis must not produce empty or misleading interpretation sections.
process-2B425ADF [MUST] Make background removal branch-specific to asset type. — BW line art, colour drawings, and collages need different isolation methods.
process-2C3DCE18 [MUST] Use atomic claim as the base semantic unit. — Atomic claims enable precise classification, deduplication, and synthesis.
process-2D1AA941 [MUST] Save a full screenshot asset for every capture session. — The full screenshot is a required sidecar asset referenced by every note.
process-339F08A6 [MUST] Classify every extracted claim across multiple dimensions. — Multi-dimensional classification enables retrieval, deduplication, and conflict analysis.
process-37C43B5A [MUST_NOT] Keep derived layers append-only; higher layers must not replace lower layers. — Preserves the full capture hierarchy from raw screenshot through tags and backlinks.
process-39BAD601 [MUST_NOT] Do not compress distinct claims into one record unless semantically inseparable. — Over-merging claims reduces retrieval precision and audit granularity.
process-3AB3A1D9 [MUST] Process ten thousand rows in under thirty seconds on standard hardware. — Performance target keeps batch transforms usable on typical office machines.
process-3B10A268 [MUST] Preserve raw OCR in the note body and a sidecar file. — Ensures the unprocessed OCR text remains available for audit and reprocessing.
process-3DBD020F [MUST] Coerce date column values to text with Text.From before parsing. — ParseAnyDate expects text; date-typed columns fail without coercion.
process-3EAC0399 [MUST] Handle case-insensitive text inputs during date parsing. — Mixed-case month names are common in manually entered datasets.
process-41BDCB70 [MUST_NOT] Land all captures in the inbox first; do not auto-classify into topic folders on capture. — Review workflow requires human confirmation before archival organisation.
process-45F929BE [MUST_NOT] Do not vectorise all assets by default. — Indiscriminate vectorisation wastes compute and produces unusable SVGs.
process-4804AABD [MUST_NOT] Do not pass a date-typed column directly to ParseAnyDate without Text.From. — Direct date columns trigger conversion errors in the parse function.
process-4E5A7A83 [MUST_NOT] Never silently enable Chrome remote debugging. — Silent debugging activation would expose browser state without informed user consent.
process-4EA47DE2 [MUST_NOT] Return null when parsing fails; do not guess a date. — Guessing produces incorrect dates that are harder to detect than nulls.
process-5077DB6F [MUST] Support Excel 2016 and later on Windows, Mac, and Excel Online. — Platform coverage matches the stated deployment environments for the tool.
process-523E16A0 [MUST] Keep memory footprint under five hundred megabytes during transformation. — Memory cap prevents Power Query from exhausting client resources on large tables.
process-5542CEAE [MUST] Extract every relevant atomic claim. — Atomic claims are the base semantic unit for classification and synthesis.
process-5AE2E0BA [MUST_NOT] Do not produce final books without review. — Unreviewed book output risks publishing errors and misclassified assets.
process-64847A5A [MUST_NOT] Keep continuous capture, automatic upload, and background monitoring off by default. — Default-off privacy settings prevent unintended surveillance or data exfiltration.
process-672E22C8 [MUST] Normalise claims before instruction generation. — Normalisation deduplicates and canonicalises claims before compact instructions.
process-682C2F05 [MUST] Generate synthesis outputs only from structured claims. — Synthesis from unstructured text bypasses normalisation and audit controls.
process-68F8A642 [MUST] Mark capture notes unreviewed unless the user explicitly confirms otherwise. — Captures are drafts until a human reviews and confirms their quality.
process-6904DB47 [MUST] Maintain a stable YAML frontmatter schema across all capture outputs. — Consistent frontmatter enables downstream tooling, search, and reprocessing.
process-697F6ED3 [MUST_NOT] Do not skip any pipeline stage. — Skipped stages leave gaps in coverage, classification, or audit.
process-6BF888F7 [MUST] Ensure the date column has a header before deployment. — Headers are required when converting a range to a named Excel Table.
process-6FD706CF [MUST_NOT] Use explicit capture only; do not run continuous screen monitoring. — Continuous monitoring poses privacy risk and produces low-value noise.
process-70E2AB2E [MUST] Extract atomic claims before synthesis. — Synthesis without atomic claims produces un-auditable consolidated guidance.
process-727F974B [MUST] Mark over-complex vectors for human review. — Complex SVGs may be unusable for print or book layout without curation.
process-72AD18CB [MUST] Classify claims across multiple dimensions before filing. — Pre-filing classification enables retrieval, conflict detection, and normalisation.
process-7503E621 [MUST_NOT] Do not use generated images as evidence of original content. — Generative images must not stand in for what was physically drawn in the notebook.
process-75F84BEB [MUST] Add inline comments explaining complex logic. — Comments reduce maintenance cost when extending parsing strategies.
process-7612AFAA [MUST] Record conflicts before consolidation. — Conflict records preserve divergent guidance for explicit resolution.
process-7ABB03FE [MUST_NOT] Keep cloud processing off unless allow_cloud_processing is explicitly true. — Prevents accidental upload of screen content to external services.
process-7BA19227 [MUST] Include a space after ordinal suffixes to avoid partial matches. — Suffix stripping without trailing space can corrupt unrelated substrings.
process-7BE3AB28 [MUST_NOT] Never replace source assets with generative derivatives. — Generative outputs are creative reinterpretations, not archival replacements.
process-7BE64851 [MUST] Validate null handling for empty cells before production deploy. — Empty cells must return null without throwing or producing wrong dates.
process-7C53BCBF [MUST] Handle malformed and ambiguous date inputs. — Real datasets contain typos and locale-ambiguous strings that must not crash the pipeline.
<!-- HOT-RULES:END -->
