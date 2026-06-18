<!-- generated: do not edit -->

# Process

195 rules in this category.

## process-60B25A20

**MUST:** Preserve source traceability for every extracted claim.

*Traceability supports audit, conflict resolution, and downstream citation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-A1242058

**MUST:** Keep raw capture, claim extraction, normalisation, and synthesis as separate mandatory stages.

*Stage separation prevents unstructured text from contaminating downstream synthesis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B9E70505

**SHOULD_NOT:** Do not optimise code that does not work yet.

*Optimising broken code wastes time because the implementation will be replaced.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-000901CA

**MUST:** Verify leap year handling including February twenty-ninth before deploy.

*Feb 29 is a common edge case that distinguishes valid from invalid dates.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-00696A57

**MUST_NOT:** Do not treat AI outputs as authoritative.

*AI-derived classifications and transcriptions require human verification before archival truth.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-00A015BE

**MUST:** Version-control the configuration.

*Version control tracks dictionary and handler changes across team deployments.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-010307D5

**MUST:** Record uncertainty, omissions, and parse risks explicitly.

*Explicit uncertainty records prevent silent data loss during extraction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-06C43D13

**MUST_NOT:** Do not classify everything using whole-page vision prompts.

*Whole-page prompts miss region-level detail and waste model capacity on full scans.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-06C667A6

**MUST_NOT:** Do not discard overlapping regions automatically.

*Overlapping content may represent distinct assets requiring separate extraction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-0765D14C

**MUST:** Complete processing of the test dataset in under thirty seconds.

*Integration tests must confirm the NFR-1 performance target is met.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-0FC566A7

**MUST:** Test with a sample of actual production data before deploying.

*Production samples reveal formats absent from synthetic test suites.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-128A31C3

**MUST_NOT:** Do not generate synthesis from unstructured text.

*Unstructured synthesis lacks classification, deduplication, and audit trails.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-145CD556

**MUST:** Achieve at least ninety-five percent parse success rate in integration tests.

*The success criterion defines minimum acceptable coverage before release.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-152C79AB

**MUST_NOT:** Do not let AI summarisation replace captured material.

*AI summaries are interpretive and must not displace the original screen content.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-158DC070

**MUST:** Generate cleaned page versions without replacing originals.

*Working copies must not overwrite the authoritative scan archive.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-17DC574D

**MUST:** Allow zero incorrect parses; null results are acceptable.

*Wrong dates are worse than null because they silently corrupt analysis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-18AA1499

**MUST:** Remove linguistic filler words during normalisation.

*Fillers like \"the\" and \"of\" must be stripped before token replacement.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-1EE29E02

**MUST:** Write a raw OCR sidecar file for every capture session.

*The OCR sidecar preserves machine-readable text outside the rendered Markdown body.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-1EEF8E5E

**MUST:** Require manual approval before including assets in books.

*Book inclusion without approval risks publishing misclassified or low-quality assets.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-2527C210

**MUST:** Write correction records instead of destructively altering source metadata.

*Append-only corrections preserve audit trail and enable rollback.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-2531F760

**MUST_NOT:** Use only normalised claims as synthesis input, never raw webpage text.

*Raw text synthesis bypasses classification, deduplication, and conflict analysis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-26B54A1B

**MUST:** Always save the original screenshot for every capture session.

*The raw screenshot is the authoritative record and must survive all processing failures.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-27D45A2E

**MUST:** On vision failure, omit the vision section and record the reason.

*Failed vision analysis must not produce empty or misleading interpretation sections.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-2B425ADF

**MUST:** Make background removal branch-specific to asset type.

*BW line art, colour drawings, and collages need different isolation methods.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-2C3DCE18

**MUST:** Use atomic claim as the base semantic unit.

*Atomic claims enable precise classification, deduplication, and synthesis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-2D1AA941

**MUST:** Save a full screenshot asset for every capture session.

*The full screenshot is a required sidecar asset referenced by every note.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-339F08A6

**MUST:** Classify every extracted claim across multiple dimensions.

*Multi-dimensional classification enables retrieval, deduplication, and conflict analysis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-37C43B5A

**MUST_NOT:** Keep derived layers append-only; higher layers must not replace lower layers.

*Preserves the full capture hierarchy from raw screenshot through tags and backlinks.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-39BAD601

**MUST_NOT:** Do not compress distinct claims into one record unless semantically inseparable.

*Over-merging claims reduces retrieval precision and audit granularity.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-3AB3A1D9

**MUST:** Process ten thousand rows in under thirty seconds on standard hardware.

*Performance target keeps batch transforms usable on typical office machines.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-3B10A268

**MUST:** Preserve raw OCR in the note body and a sidecar file.

*Ensures the unprocessed OCR text remains available for audit and reprocessing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-3DBD020F

**MUST:** Coerce date column values to text with Text.From before parsing.

*ParseAnyDate expects text; date-typed columns fail without coercion.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-3EAC0399

**MUST:** Handle case-insensitive text inputs during date parsing.

*Mixed-case month names are common in manually entered datasets.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-41BDCB70

**MUST_NOT:** Land all captures in the inbox first; do not auto-classify into topic folders on capture.

*Review workflow requires human confirmation before archival organisation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-45F929BE

**MUST_NOT:** Do not vectorise all assets by default.

*Indiscriminate vectorisation wastes compute and produces unusable SVGs.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-4804AABD

**MUST_NOT:** Do not pass a date-typed column directly to ParseAnyDate without Text.From.

*Direct date columns trigger conversion errors in the parse function.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-4E5A7A83

**MUST_NOT:** Never silently enable Chrome remote debugging.

*Silent debugging activation would expose browser state without informed user consent.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-4EA47DE2

**MUST_NOT:** Return null when parsing fails; do not guess a date.

*Guessing produces incorrect dates that are harder to detect than nulls.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-5077DB6F

**MUST:** Support Excel 2016 and later on Windows, Mac, and Excel Online.

*Platform coverage matches the stated deployment environments for the tool.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-523E16A0

**MUST:** Keep memory footprint under five hundred megabytes during transformation.

*Memory cap prevents Power Query from exhausting client resources on large tables.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-5542CEAE

**MUST:** Extract every relevant atomic claim.

*Atomic claims are the base semantic unit for classification and synthesis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-5AE2E0BA

**MUST_NOT:** Do not produce final books without review.

*Unreviewed book output risks publishing errors and misclassified assets.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-64847A5A

**MUST_NOT:** Keep continuous capture, automatic upload, and background monitoring off by default.

*Default-off privacy settings prevent unintended surveillance or data exfiltration.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-672E22C8

**MUST:** Normalise claims before instruction generation.

*Normalisation deduplicates and canonicalises claims before compact instructions.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-682C2F05

**MUST:** Generate synthesis outputs only from structured claims.

*Synthesis from unstructured text bypasses normalisation and audit controls.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-68F8A642

**MUST:** Mark capture notes unreviewed unless the user explicitly confirms otherwise.

*Captures are drafts until a human reviews and confirms their quality.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-6904DB47

**MUST:** Maintain a stable YAML frontmatter schema across all capture outputs.

*Consistent frontmatter enables downstream tooling, search, and reprocessing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-697F6ED3

**MUST_NOT:** Do not skip any pipeline stage.

*Skipped stages leave gaps in coverage, classification, or audit.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-6BF888F7

**MUST:** Ensure the date column has a header before deployment.

*Headers are required when converting a range to a named Excel Table.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-6FD706CF

**MUST_NOT:** Use explicit capture only; do not run continuous screen monitoring.

*Continuous monitoring poses privacy risk and produces low-value noise.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-70E2AB2E

**MUST:** Extract atomic claims before synthesis.

*Synthesis without atomic claims produces un-auditable consolidated guidance.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-727F974B

**MUST:** Mark over-complex vectors for human review.

*Complex SVGs may be unusable for print or book layout without curation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-72AD18CB

**MUST:** Classify claims across multiple dimensions before filing.

*Pre-filing classification enables retrieval, conflict detection, and normalisation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-7503E621

**MUST_NOT:** Do not use generated images as evidence of original content.

*Generative images must not stand in for what was physically drawn in the notebook.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-75F84BEB

**MUST:** Add inline comments explaining complex logic.

*Comments reduce maintenance cost when extending parsing strategies.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7612AFAA

**MUST:** Record conflicts before consolidation.

*Conflict records preserve divergent guidance for explicit resolution.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-7ABB03FE

**MUST_NOT:** Keep cloud processing off unless allow_cloud_processing is explicitly true.

*Prevents accidental upload of screen content to external services.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-7BA19227

**MUST:** Include a space after ordinal suffixes to avoid partial matches.

*Suffix stripping without trailing space can corrupt unrelated substrings.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7BE3AB28

**MUST_NOT:** Never replace source assets with generative derivatives.

*Generative outputs are creative reinterpretations, not archival replacements.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-7BE64851

**MUST:** Validate null handling for empty cells before production deploy.

*Empty cells must return null without throwing or producing wrong dates.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7C53BCBF

**MUST:** Handle malformed and ambiguous date inputs.

*Real datasets contain typos and locale-ambiguous strings that must not crash the pipeline.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7CACBF40

**MUST_NOT:** Never modify source data during date standardisation.

*Non-destructive transforms preserve the original column for audit and rollback.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7CCDAC41

**MUST:** Convert the data range to an Excel Table before loading Power Query.

*Power Query loads structured tables reliably via Excel.CurrentWorkbook.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-7D8496CD

**MUST:** Preserve raw OCR separately from cleaned transcriptions.

*Raw OCR retains the unmodified model output for audit and re-cleaning.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-808DB8DD

**MUST_NOT:** Do not silently merge conflicting advice.

*Merged conflicts hide trade-offs that downstream agents must resolve explicitly.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-8144EE7B

**MUST:** Identify and parse forty or more distinct date format patterns.

*Wide pattern coverage is the stated goal of the automated transformer.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-82BF752B

**MUST:** Strip ordinal suffixes while preserving day values.

*Ordinals such as 3rd must become 3 before numeric parsing succeeds.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-83568172

**MUST:** Preserve original scans untouched.

*Archival integrity requires immutable source files for reprocessing and audit.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-839FDEA5

**MUST_NOT:** Do not treat a page as complete without a coverage ledger.

*Coverage ledgers prove all content units were reviewed before extraction closes.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-8703AA1A

**MUST:** Convert ordinal and written numbers during standardisation.

*Verbal ordinals and number words require conversion before Date.From succeeds.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-8921BEA3

**MUST_NOT:** Exclude full vectorisation, Gaussian splats, advanced AI classification, and full book generation from the MVP.

*The first version should deliver core ingest, OCR, regions, tags, and index only.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-89A61AE6

**MUST:** Remove filler words from date inputs without losing meaning.

*Linguistic fillers like \"the\" and \"of\" block standard date parsers.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-8CEB93E6

**MUST:** Parse date inputs regardless of capitalization.

*Case insensitivity prevents parse failures on mixed or uppercased month names.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-901BC619

**MUST:** Return null gracefully when no parse strategy succeeds.

*Graceful null output keeps batch processing from halting on edge cases.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-90C54F02

**MUST:** Run all forty format examples from the specification before production deploy.

*Format coverage must be verified against the full reference table.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-92EE8A78

**MUST:** Inventory every registered page.

*Page inventory is prerequisite to coverage capture and claim extraction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-9558A332

**MUST:** Convert written number words to digits during date parsing.

*Verbal day values like Third must become numeric tokens for parsing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-95B4347A

**MUST:** Always retain the raster source when generating vectors.

*Raster retention allows re-vectorisation with different parameters or tools.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-96BA05BE

**MUST:** Review every content unit.

*Unreviewed units risk omitted claims and incomplete coverage ledgers.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-999C5EA7

**MUST_NOT:** Never modify source files during ingest.

*Ingest must preserve the integrity of incoming scan files.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-9AFDACDC

**MUST:** Complete coverage before interpretation.

*Interpretation before coverage risks systematic omission of source content.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-9BE812CF

**MUST:** Handle duplicate and conflicting guidance explicitly.

*Silent conflict merging produces unreliable synthesis outputs.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-9D9E08E6

**MUST:** On any failure, always save the screenshot and always attempt to write a note.

*Fail-safe behaviour ensures partial captures are never lost entirely.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-9E6CB849

**MUST_NOT:** Do not synthesise from raw webpage text.

*Raw-text synthesis skips structured claim validation and normalisation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-9F569CD7

**MUST:** Confirm average processing stays under five milliseconds per cell.

*Per-cell timing validates the stated average processing budget.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-A17702C8

**MUST:** Record all transformations applied to notebook pages.

*Transformation history enables reprocessing and provenance verification.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-A318FC3D

**MUST:** Record processing.cloud_api_used true in frontmatter when a cloud API is used.

*Makes cloud processing auditable for privacy and reproducibility review.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-A3CF672E

**MUST_NOT:** Do not treat creative AI tools as archival truth.

*Experimental vector and render tools produce derivatives, not authoritative records.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-A867479A

**MUST:** Test case variations including upper, lower, and mixed case before deploy.

*Case-insensitivity is a functional requirement that must be validated.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-AA470F00

**MUST:** Store metadata sufficient for future reprocessing of captures.

*Sidecars and processing metadata allow rerunning improved engines on the same raw assets.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-ABA839EA

**MUST:** Wrap column values in Text.From when calling ParseAnyDate.

*Text.From is the documented correct invocation for mixed-type columns.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-ABD3B99B

**MUST_NOT:** Do not remove repeated guidance as familiar; repetition may indicate authority.

*Discarding repeated guidance loses evidence of authoritative consensus.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-AE1017E8

**MUST:** Decompose every inventoried page into content units.

*Content-unit decomposition enables systematic review and claim candidate generation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B152589E

**MUST_NOT:** Do not create a new category when an existing category plus tags suffices.

*Unnecessary categories fragment retrieval and inflate taxonomy maintenance.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B272088F

**MUST:** Document any failed parse cases before deploying to production.

*Known failures must be recorded so users understand coverage limits.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-B30D7539

**MUST:** Run the corpus pipeline as structured extraction, not summarisation.

*Summarisation bypasses atomic claim extraction and loses source traceability.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B453A21B

**MUST:** Crop regions from the highest useful cleaned image, not the compressed preview.

*Low-resolution previews lose detail needed for accurate region extraction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-B4EB91F5

**MUST_NOT:** Do not silently invent or merge categories.

*Silent category changes distort retrieval and break taxonomy governance.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B88962A2

**MUST:** Audit before marking extraction complete.

*Audit reconciles coverage and surfaces low-confidence or unresolved conflicts.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-B9DAC529

**MUST:** Handle all date formats listed in the comprehensive reference table.

*Broad format coverage is the core functional requirement of the standardisation system.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-BAF78C6B

**MUST_NOT:** Do not summarise raw pages directly into guides.

*Direct summarisation skips atomic extraction and coverage verification.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-BD1DD5FA

**MUST:** Keep the text-mode capture path fast.

*Text mode is the default for quick captures and must not incur heavy processing overhead.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C1F7DDD5

**MUST:** On OCR failure, preserve the screenshot and record the failure reason in the note.

*OCR errors must not discard the underlying visual capture.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C3E58631

**MUST:** Connect to Chrome DevTools only when the user explicitly requests chrome-tabs capture.

*Remote debugging access is a security-sensitive capability requiring explicit opt-in.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C74F9756

**MUST_NOT:** Do not attempt heading preservation in stage 1 MVP implementation.

*Stage 1 scope is region capture, OCR, and basic Markdown without layout heuristics.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C7A4BD7F

**MUST:** Treat captures as drafts until a human confirms review.

*Signals that every capture needs human review before being treated as confirmed.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-CAEC75C2

**MUST_NOT:** Do not use general AI background removal first on BW line art.

*Threshold-based extraction preserves faint lines that AI removal often destroys.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-D18DB654

**MUST:** On layout failure, fall back to the raw OCR section.

*Raw OCR remains usable when structure inference fails.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-D23743F3

**MUST_NOT:** Guard against derived layers overwriting or replacing raw source in the archive.

*Derived-layer overwrite is the primary architectural risk identified for this pipeline.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-D5EEE71C

**MUST:** Mark a pipeline stage blocked when its inputs are missing.

*Blocking prevents downstream stages from running on incomplete data.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-D63688E3

**MUST_NOT:** Mark duplicate captures only; never auto-delete suspected duplicates.

*Automatic deletion risks losing unique captures that merely resemble prior ones.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-DB29B476

**MUST_NOT:** Never let AI cleanup replace the raw source material.

*Cleaned extraction is a derived layer and must not overwrite archival source data.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-DC676D1A

**MUST:** Separate creative outputs from archival outputs.

*Mixing creative and archival assets undermines provenance and trust.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-DFE2CD90

**MUST:** Preserve data integrity through non-destructive operations.

*Original values must remain available while a new standardised column is added.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-DFF62642

**MUST:** Flag unparseable dates as null rather than guessing.

*Null output avoids silently wrong dates that corrupt downstream analysis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-E06D6822

**MUST_NOT:** Do not send full-resolution scans to vision models except for coarse page overview.

*Full-resolution input wastes compute and exceeds typical model input limits.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-E08A5EC6

**MUST:** Test with a dataset of one thousand or more rows before production deploy.

*Volume testing catches performance regressions not visible in unit tests.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-EE12DE20

**MUST:** Save vectorisation parameters with every vector output.

*Parameter records enable reproducibility and comparative reprocessing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-F0096B45

**MUST_NOT:** Do not destroy or overwrite source scans.

*Source scan loss eliminates the ability to reprocess with improved models.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-F5AC8BBD

**MUST:** Register every in-scope source.

*Unregistered sources cannot be inventoried, captured, or audited for coverage.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-F61398F9

**MUST_NOT:** Do not replace manual curation.

*Automated pipelines cannot substitute human editorial judgment for book-quality output.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-FBC7A8D8

**MUST:** Support single-click deployment for end users.

*Low-friction deployment reduces manual setup errors for non-technical users.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-FF0AF286

**MUST:** Allow manual correction without breaking provenance.

*Human review must improve accuracy while preserving traceable correction records.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-E0C74823

**SHOULD:** Iterate graphics to discover how to better present content for your audience.

*Iteration reveals presentation improvements that make content easier to understand.*

Sources:
- https://www.nngroup.com/articles/designing-effective-infographics/

---

## process-030E542B

**SHOULD:** Place generative branches downstream of the archive, not in canonical extraction.

*Experimental outputs must not contaminate the authoritative extraction pipeline.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-034F6CA7

**SHOULD:** Classify the diagram type before reconstruction.

*Type classification selects the correct reconstruction strategy and style guide.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-094EDDA0

**SHOULD:** Create a benchmark set before building the full pipeline.

*Ground-truth benchmarks are needed to compare providers and set defaults.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-0F26DDEE

**SHOULD:** Respect visitor time, bandwidth, and battery in page weight.

*Even with decoration and advertising, brutalist sites should not waste visitor resources.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## process-14222CFE

**SHOULD:** Use rule-based selection as the first pass for book category assembly.

*Structured rules produce coherent initial book sets before manual curation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-16E04E1F

**SHOULD:** Define each pipeline run with a configuration file.

*Configuration files make pipeline behaviour reproducible and versionable.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-19E4C439

**SHOULD:** Vectorise colour art only when flat-colour structure is useful.

*Complex colour regions often produce over-complex or unusable vectors.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-1AD09876

**SHOULD:** Use the standard parse result when native Date.From succeeds.

*Short-circuiting on the fast path avoids expensive text normalisation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-2613B98F

**SHOULD:** Ground design in rational universal principles discovered scientifically.

*Swiss designers pursued objective, repeatable principles instead of subjective taste.*

Movements: `swiss`

Sources:
- https://vanseodesign.com/web-design/swiss-design/

---

## process-2681A580

**SHOULD:** Assemble book-source sets from the archive using rules.

*Rule-based book assembly scales category-driven publishing from tagged assets.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-26E91022

**SHOULD:** Prioritise readable code over micro-optimised code when reasoning cost dominates.

*Most time is spent reading and reasoning; unreadable fast code slows delivery.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-28474A64

**SHOULD:** Set the StandardDate column type explicitly to date after transformation.

*Explicit typing ensures Excel renders dates correctly rather than as text.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-2ABAE335

**SHOULD:** Optimise for speed only after the code works and behaves correctly.

*Performance work on broken or wrong code is discarded when the implementation is rewritten.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-364EA3CC

**SHOULD:** Verify column types with Table.Schema when dates fail unexpectedly.

*Schema inspection reveals type mismatches that block parsing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-37CDDDA6

**SHOULD_NOT:** Avoid two-digit years in source data when possible.

*Two-digit years fall into ambiguous century windows in Power Query.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-3BAE6DE3

**SHOULD:** Pre-process international dates separately when locale ambiguity matters.

*Ambiguous DD/MM versus MM/DD strings need explicit locale handling.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-3F53BE7C

**SHOULD:** Fix correctness only after the code works.

*Working but wrong code must be corrected before performance tuning.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-4F72DD12

**SHOULD:** Reconstruct diagrams following style guides.

*Style-guide reconstruction keeps digitised diagrams consistent with library standards.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-4FC56555

**SHOULD:** Save capture as image or extracted text.

*Dual output modes support both visual reference and searchable text notes.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-54E7DB11

**SHOULD:** Apply styling only to solve a specific problem.

*Problem-driven styling avoids unnecessary decoration and embraces brutalist web design.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## process-598611DE

**SHOULD:** Trim whitespace from date text before parsing.

*Leading and trailing spaces cause otherwise valid dates to fail parsing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-5AA85677

**SHOULD:** Generate books from structured rules, then manually curate them.

*Rule-based selection scales assembly while human curation ensures publishing quality.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-5AFC1450

**SHOULD:** Let benchmark results decide default providers.

*Empirical comparison on notebook pages beats arbitrary provider selection.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-5D1E9A00

**SHOULD:** Make code work before making it right or fast.

*Kent Beck's ordering avoids wasted effort on correctness or speed of broken code.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-5F853E35

**SHOULD:** On B&W doodle path, threshold or apply the same preprocessing options.

*B&W path options handle line art without colour quantisation overhead.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-619BB254

**SHOULD_NOT:** Do not write code you anticipate needing in the future but do not need now.

*Plans change before anticipated needs arrive; writing ahead adds complexity without current benefit.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-6572CC32

**SHOULD:** Put the website visitor front and center in all design priorities.

*The visitor is the entire reason the website exists and should drive every design decision.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## process-68A6DD48

**SHOULD:** Check for BOM markers and non-breaking spaces when all dates return null.

*Hidden encoding characters prevent otherwise valid strings from parsing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-6B595B5B

**SHOULD:** Use linked image files by default instead of inline base64 embeds.

*Linked assets are Git-, Obsidian-, sync-, and reprocess-friendly.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-7804D90B

**SHOULD:** Allow reference attachment on first pass with refinement later.

*Crude-first reference attachment keeps capture fast while preserving link intent.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-78BAE8F6

**SHOULD:** Run classification on bounded crops, not whole scans.

*Region-level classification improves accuracy and reduces model load.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-78C27EAA

**SHOULD:** Remove noise such as specks and dust from doodle captures.

*Noise removal improves asset quality before cropping and tagging.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-7C6DED42

**SHOULD:** On second duplicate need, copy-paste the code and change only what differs.

*A second copy confirms similarity without premature abstraction.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-80E6007F

**SHOULD:** Default to local processing where practical for private notebook content.

*Notebooks may contain private material that should not leave the local machine.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-853866B2

**SHOULD:** Refactor or optimise duplicated logic only after you have written it three times.

*Three implementations reveal the real abstraction level before generalising.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-8900700D

**SHOULD:** On first need, write code that does only the immediate required behaviour.

*The first implementation should solve the present case without speculative generality.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-8D13622D

**SHOULD:** Try the native Power Query date parser before custom parsing.

*The native parser is fastest for ISO and numeric formats that it already understands.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-90B04A2B

**SHOULD:** Default image embed mode to linked files, not base64, unless config overrides.

*Linked assets keep notes lightweight and compatible with version control workflows.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-9BA26EA2

**SHOULD:** Generate an image pyramid for each page.

*Multi-resolution images match tasks from triage thumbnails to archival preservation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-9FAA57C1

**SHOULD:** Prefer structured data output over prose.

*Structured outputs enable machine validation, deduplication, and synthesis.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-A1E817E4

**SHOULD:** Make design socially useful, universal, and scientific.

*Design was treated as a profession with social responsibility and universal reach.*

Movements: `swiss`

Sources:
- https://vanseodesign.com/web-design/swiss-design/

---

## process-A41CA2CA

**SHOULD:** Split or pad crops with extreme aspect ratios before model inference.

*Extreme aspect ratios degrade model performance without pre-processing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-AB4F987B

**SHOULD:** When in doubt, prioritise the user's needs.

*Fighting for users aligns design decisions with the visitor's interests.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## process-ADE4294A

**SHOULD:** Optimise sites for fast download and render performance.

*Embracing a website's nature and materials lets network, browser, and OS work together efficiently.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## process-B0527623

**SHOULD:** Output vector diagrams, structured graph specs, or Python plotting code.

*Multiple output formats let downstream tools consume diagrams in native formats.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-B0BF9A92

**SHOULD:** Skip reprocessing when input and parameters have not changed.

*Cache hits save compute and preserve prior outputs for comparison.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-B12E2D4B

**SHOULD:** Implement Chrome tab capture index mode first before deeper browser automation.

*Index mode is the safest first browser integration and avoids fragile deep automation.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-B1FC40CB

**SHOULD:** Save source crop, mask, transparent output, mask metadata, and review status for every background removal.

*Masks enable later correction and reprocessing independent of transparent PNGs.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-BB5DDFAD

**SHOULD:** Convert input text to uppercase for case-insensitive matching.

*Uppercasing normalises month tokens before dictionary replacement.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-BFE6963B

**SHOULD:** Verify ISO timestamps do not include problematic timezone offsets.

*Timezone offsets can shift parsed dates by one day.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-C17C6C5A

**SHOULD:** Focus solely on making non-working code work before any other concern.

*Broken code cannot be judged for correctness or performance until it runs.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-C2AB0C5A

**SHOULD:** Prioritise note structure, asset paths, frontmatter, and raw/derived separation over OCR engine choice.

*Foundation architecture matters more than which OCR backend is plugged in first.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C41B4450

**SHOULD:** Prefer local OCR and LLM processing over cloud APIs by default.

*Local processing reduces privacy exposure and external dependency for routine captures.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-C79A1DC5

**SHOULD:** Test ParseAnyDate directly with a literal string during debugging.

*Direct function calls isolate parse logic from table transformation issues.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-C996D7DC

**SHOULD:** Return null early for empty cells to avoid unnecessary processing.

*Skipping blank inputs reduces per-row work in large batch transforms.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-CEDE5848

**SHOULD:** Prioritise the data model before UI overbuild.

*A solid capture object and output contract outlasts premature interface investment.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-D3EEEAEC

**SHOULD:** Crop screenshot to region or highlight text before saving.

*Targeted cropping keeps captures focused and reduces post-capture cleanup.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-D7FBB2B4

**SHOULD:** Use text as the default capture mode for fast common captures.

*Most captures are short UI text where full pipeline cost is unnecessary.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## process-D977886D

**SHOULD:** Treat vectorisation as a derivative branch, not a raster replacement.

*Raster originals remain authoritative; vectors are optional processed outputs.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-DF35673D

**SHOULD:** Vectorise BW line art before other asset types.

*Line art vectorises most reliably and yields the highest-quality derivatives.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-E24506DE

**SHOULD_NOT:** Do not design complex systems before you have a simple system that works.

*Complex designs built upfront tend not to work; simple working systems can evolve.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## process-E483141C

**SHOULD:** Detect shapes, lines, arrows, and labels in photographed diagrams.

*Element detection is prerequisite for diagram classification and reconstruction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## process-E6779DAC

**SHOULD:** Test the parse function on a single row when isolating failures.

*Single-row isolation simplifies debugging of complex parse pipelines.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-EB423A85

**SHOULD:** Make every pipeline stage cache-aware.

*Caching avoids redundant reprocessing when inputs and parameters are unchanged.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-EF50AFA6

**SHOULD:** Use threshold-based line extraction before background removal on faint lines.

*Threshold extraction protects faint ink that aggressive removal destroys.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-F05EE355

**SHOULD:** Build a command-line interface before a full GUI.

*CLI-first enables pipeline automation and scripting before UI investment.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-F3B32535

**SHOULD:** Run OCR only on text-likely regions.

*OCR on drawing regions produces hallucinated text from sketch marks.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## process-F9D312A1

**SHOULD:** Process very large datasets in chunked batches when rows exceed one hundred thousand.

*Chunking prevents noticeable slowdown beyond the tested row limits.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## process-FE84078C

**SHOULD:** Treat designers as communicators, not as artists.

*The International Style framed design as rational communication rather than personal artistic expression.*

Movements: `swiss`

Sources:
- https://vanseodesign.com/web-design/swiss-design/

---

## process-8D23E3C0

**MAY:** Allow a single claim to belong to multiple categories, concerns, or outputs.

*Multi-tagging reflects that design guidance spans domains and concerns.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md

---

## process-FD418645

**MAY:** Make advanced interpretation optional and selectable per capture mode.

*Layout, vision, and tagging depth should match user intent without forcing full pipeline cost.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---
