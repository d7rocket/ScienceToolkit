# Phase 1: Skill Scaffold - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the skill directory structure, output format contract (the .md file spec), system prompt, and sample output so `/science` can be invoked in Claude Code and produces correctly-formatted Instagram carousel output. No real source fetching or content generation — those are Phase 2 and 3.

</domain>

<decisions>
## Implementation Decisions

### Output file format
- File naming: `output/YYYY-MM-DD-[slug].md`
- Metadata at top as markdown header block: `# Topic Title` followed by `**Date:** ... | **Field:** ... | **Sources:** N`
- Horizontal rule separates metadata from slides
- Section order: Slides → Caption → Hashtags → Sources → Images
- Slides labeled as H2 headings with number and descriptive title: `## Slide N: Title`
- Sources formatted as numbered list with full APA citations — each entry has authors, title, journal, year, DOI (where available), URL, and peer-review status label on separate lines

### Slide structure rules
- ~150 characters per slide (2-3 short sentences, punchy and scannable)
- 5-7 slides per carousel
- Slide 1 is the hook: under 10 words, question or surprising fact
- Every body slide (2 through N-1) ends with a cliff-hanger or question to encourage swiping
- Final slide: key takeaway in one line + call-to-action (e.g., "Follow for daily science drops")
- Strategic emoji allowed: hook slide and final CTA slide can use emoji, body slides stay clean text

### Skill invocation flow
- Skill files live in `skills/science/` directory (system.md, instructions, supporting files)
- Output written to `output/` at project root
- `/science [topic]` accepts a topic argument; in Phase 1, generates with placeholder/fabricated sources
- Brief confirmation before generating: shows topic and asks to confirm before writing
- After generating, prints summary to terminal: topic, slide count, source count, field, and file path (not full content)

### Sample output spec
- Topic: James Webb Space Telescope discovery
- 6 slides (hook + 4 body + takeaway/CTA)
- Source mix: 2 academic (1 published paper + 1 preprint with [Preprint] label) + 1 news article
- File: `examples/output-sample.md` — demonstrates the exact section structure and all citation variants
- This sample is the format contract that all downstream phases must match

### Claude's Discretion
- Exact system prompt wording for grounding enforcement (FETCH-03)
- Internal file structure within `skills/science/`
- Error message wording
- Confirmation prompt phrasing

</decisions>

<specifics>
## Specific Ideas

- Terminal output after generation should look like:
  ```
  Generating carousel for: Black Hole Acoustics...
  ✅ Generated: Black Hole Acoustics
     Slides: 6 | Sources: 3 | Field: Astrophysics
     → output/2026-03-15-black-hole-acoustics.md
  ```
- Metadata header block style: `# Topic Title` then `**Date:** 2026-03-15 | **Field:** Astrophysics | **Sources:** 3`
- Citation status labels: `[Published in: Journal, Year]`, `[Preprint - not peer reviewed]`, `[News article]`

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — Phase 1 establishes the foundational patterns

### Integration Points
- Skill must be invocable via Claude Code's `/science` command
- Output directory `output/` will be the interface for all downstream phases

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-skill-scaffold*
*Context gathered: 2026-03-15*
