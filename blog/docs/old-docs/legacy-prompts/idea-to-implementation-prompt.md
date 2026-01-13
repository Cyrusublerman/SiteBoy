# Idea to Implementation — Agent Prompt Template

Use this prompt to instruct an AI agent to transform a raw idea document into a complete, structured implementation plan.

---

## The Prompt

Copy and adapt the following:

```
I have an idea document at [PATH_TO_IDEA.md]. I need you to transform this into a complete implementation plan following the agentic research-to-implementation methodology.

## Phase 1: Technique Extraction

1. Read the idea document completely
2. Extract every algorithm, technique, or named method mentioned (explicitly or implied)
3. Categorize by function (e.g., "Image → Edges", "Points → Path")
4. Identify implied techniques not named but required
5. Output a glossary table

## Phase 2: Knowledge Sourcing

1. For each technique in the glossary, check if reference documentation exists in `blog/ideas/reference documentation/`
2. List any gaps (techniques mentioned but not documented)
3. If gaps exist, note which Wikipedia articles need downloading
4. Summarize what formulas/algorithms are available vs missing

## Phase 3: Library Mapping

1. Check `blog/ideas/reference documentation/processing/` for existing implementations
2. Map each required technique to:
   - Existing function (with module path)
   - OR gap requiring implementation
3. Output a routing table: Technique → Module → Function → Status

## Phase 4: Create Documentation Folder

Create folder: `blog/ideas/tools/[tool-name-kebab-case]/`

Generate these files in order:

### 00-overview.md
- Quick reference (purpose, output type, core pipeline)
- Document map with links to other docs
- Status table (what's complete vs pending)
- Key decisions with rationale
- Dependencies (existing modules used)
- Gaps (what needs implementing)

### 01-design-spec.md
Follow the format in `blog/docs/guides/page-design-guide.md`:
- Overview (purpose, output type, target user)
- Parameters table (type, range, default, step, purpose)
- Controls layout (tabs → blocks → components)
- Interactions (parameter effects, button actions)
- Canvas specification
- Algorithm notes
- Future extensions

### 02-theoretical-foundation.md
Scientific paper style:
- Problem formulation (input/output domains)
- Mathematical definitions with LaTeX ($$...$$)
- Algorithm descriptions with complexity
- References to source literature

### 03-algorithm-library.md
For each algorithm needed:
- Formula (LaTeX)
- I/O signature (TypeScript-style types)
- Code (JavaScript implementation or reference to existing)
- Source (which reference doc or module)
- Status (✓ Exists | ⚠ To implement)

### 04-system-architecture.md
- High-level data flow diagram (ASCII)
- Data type definitions
- Module dependency graph
- Stage-by-stage processing breakdown
- Caching strategy
- Event flow
- Error handling
- Performance budgets
- State management

### 05-implementation-guide.md
- File structure
- Tool class skeleton
- Sidebar configuration
- Core pipeline methods
- Rendering code
- Export functions
- Registration steps
- Gaps to implement
- Testing checklist

## Output Requirements

- Use precise technical language
- Include actual code where implementations exist
- Mark gaps clearly with [GAP] or ⚠
- Cross-reference between documents
- Follow existing project conventions (F-system, VGA colors, BaseComponent)
- No placeholder content — if unknown, mark as gap

## Project Context

- This is a SiteBoy tool page
- UI uses sidebar + canvas layout
- Follow standards in `blog/docs/guides/tool-standards.md`
- Use F-system sizing from `blog/docs/guides/f-system.md`
- Processing library is at `blog/ideas/reference documentation/processing/`
```

---

## How to Use

### 1. Prepare the Idea Document

Ensure your idea document contains:
- Clear goal statement
- Referenced techniques (even vague ones)
- Input/output description
- Any constraints or requirements

### 2. Provide Context Files

When starting the conversation, attach or reference:
- The idea document
- `blog/docs/guides/page-design-guide.md`
- `blog/docs/guides/tool-standards.md`
- `blog/ideas/reference documentation/processing/index.js`

### 3. Run in Phases

For complex tools, run each phase separately:

```
First, complete Phase 1 (Technique Extraction) for [idea.md]
```

Then:

```
Now complete Phase 2 (Knowledge Sourcing) using the glossary you created
```

This prevents context overflow and allows review between phases.

### 4. Review and Iterate

After each document is generated:
- Verify technical accuracy
- Check for missing gaps
- Ensure cross-references are correct
- Confirm code examples match project conventions

---

## Phase Breakdown

### Phase 1: Technique Extraction (~5 min)

**Agent produces:**
- Glossary table (technique, category, source reference)
- Implied techniques list
- Initial gap identification

**You review:**
- Missing techniques
- Categorization accuracy

### Phase 2: Knowledge Sourcing (~10 min)

**Agent produces:**
- Reference doc coverage report
- Wikipedia articles to download (if any)
- Formula availability summary

**You review:**
- Whether to download additional articles
- Priority of missing knowledge

### Phase 3: Library Mapping (~10 min)

**Agent produces:**
- Routing table (technique → function → status)
- Module dependency list
- Gap prioritization

**You review:**
- Correct function mappings
- Realistic gap assessment

### Phase 4: Documentation (~30-60 min)

**Agent produces:**
- 6 markdown files in tool folder

**You review:**
- Each document for completeness
- Code accuracy
- Alignment with project standards

---

## Example Invocation

```
I have an idea document at `blog/ideas/tools/Fractal Terrain Generator.md`. 

Transform this into a complete implementation plan following the agentic research-to-implementation methodology.

Start with Phase 1: Technique Extraction.

Context files for reference:
- blog/docs/guides/page-design-guide.md
- blog/docs/guides/tool-standards.md  
- blog/ideas/reference documentation/processing/index.js
```

---

## Adapting for Non-Tool Projects

For projects that aren't SiteBoy tools, modify:

1. **01-design-spec.md** → Replace with appropriate interface spec
2. **05-implementation-guide.md** → Adjust for target framework
3. **Project Context** section → Update conventions

The core methodology (extract → source → map → document) remains the same.

---

## Reference

Full methodology documented in: `blog/docs/Processes/agentic-research-to-implementation.md`

