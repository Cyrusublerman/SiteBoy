<!-- generated: do not edit -->

# Naming

10 rules in this category.

## naming-BB08FD32

**MUST:** Replace YourTableName with the actual table name before deployment.

*A mismatched table name prevents Power Query from loading the source data.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## naming-97661BB6

**MUST:** Assign notebook and page IDs before any processing.

*All downstream outputs derive identity from IDs assigned at ingest.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## naming-DD8920CA

**MUST:** Use stable IDs for all canonical archive objects.

*Stable IDs prevent broken links when reprocessing or exporting.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## naming-B38A0ADB

**MUST_NOT:** Do not rename canonical objects after creation.

*Renaming breaks references across metadata, exports, and book manifests.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## naming-20818CAA

**MUST:** Change the table name in the Source line to match your workbook.

*The Source expression must reference the actual registered table name.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## naming-0CC52AA1

**MUST:** Change the column name in the parse call to match your data.

*ParseAnyDate must read the column that holds raw date strings.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## naming-73F8F8F1

**MUST:** Match the column name in code to the actual column exactly.

*Power Query column references are case-sensitive and must match exactly.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## naming-A6516137

**MUST:** Use safe characters only in capture note filenames.

*Avoids filesystem collisions and broken links across platforms and sync tools.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## naming-8CC6437C

**MUST:** Normalise tags to lowercase hyphenated form with no spaces.

*Consistent tag formatting prevents duplicate tags and eases vocabulary matching.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## naming-91BD2980

**SHOULD:** Assign each physical notebook a stable notebook ID.

*Stable IDs anchor all page, region, and derivative identifiers across the archive.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---
