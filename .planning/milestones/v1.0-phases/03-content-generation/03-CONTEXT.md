# Phase 3: Content Generation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform fetched source material (from Phase 2's structured source list) into a complete, copy-paste-ready Instagram carousel package: slide text, caption, hashtags, full academic citations, and source image URLs. Covers requirements CONT-01 through CONT-06 and CITE-01 through CITE-03. Topic auto-discovery is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Tone & voice calibration
- Reading level: high school — no jargon without explanation, plain language anyone can follow
- Technical terms: inline plain-English gloss when unavoidable (e.g., "redshift (the stretching of light as objects move away)")
- Voice personality: cool professor — calm confidence, dry wit allowed, authoritative but approachable. "Here's what that actually means." energy (Kurzgesagt narrator register)
- Tone shift: slides are punchier and bolder, caption relaxes into a more explanatory flowing style. Both stay in the cool-professor register

### Caption narrative arc
- Opening: question hook that includes the topic keyword (e.g., "What happens when CRISPR meets cancer cells?")
- Middle structure: Context → Finding → Why it matters (background paragraph, then the discovery, then significance)
- Closing: forward-looking question that invites engagement (e.g., "Could this change how we treat cancer within a decade?") — no CTA in caption
- Formatting: 3-5 short paragraphs broken by section (hook, context, finding, significance, closing question). Scannable on mobile.
- Length: 400-600 words, under 2,100 characters total (Phase 1 constraint)

### Claim-to-source threading
- No inline references in slides or caption — text reads clean, all citations live in the Sources section
- Name-drop journal/outlet naturally when introducing the main finding: "A study in Nature found..." — adds credibility without footnotes
- Citation format: match `examples/output-sample.md` exactly — Author, et al. (Year). Title. *Journal*, *Volume*(Issue), Pages. DOI + URL + peer-review label
- Images: include ALL available image URLs found during fetching — user picks which to use for design. Prefer CC-licensed when available.

### Slide storytelling strategy
- Narrative arc: Hook → Build-up → Reveal → CTA (curiosity-gap structure)
- Focus: single finding, deep — pick the most compelling finding and build the entire carousel around it
- Data handling: one statistic per slide maximum, keeps it digestible
- Cliff-hangers (CONT-03): tease-style endings on body slides — "But there's a catch.", "That's not the weird part.", "Scientists weren't expecting what came next."
- Slide 1 hook: under 10 words, question or surprising fact (Phase 1 locked)
- Final slide: key takeaway + CTA like "Follow for daily science drops" (Phase 1 locked)

### Claude's Discretion
- Exact wording of cliff-hanger transitions (varies per topic)
- Which paragraphs in the caption get the most depth
- Hashtag selection strategy (topical vs broad reach)
- How to handle topics where multiple findings are equally compelling — Claude picks the strongest single thread

</decisions>

<specifics>
## Specific Ideas

- Kurzgesagt narrator is the voice model — calm, smart, never condescending
- "But here's the catch..." / "That's not the weird part." as signature cliff-hanger patterns
- Caption question hooks should feel like they could be a podcast episode title
- The output sample at `examples/output-sample.md` is the format bible — match it exactly

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `examples/output-sample.md`: Format contract with all citation variants, slide structure, and section ordering
- `.claude/skills/science/SKILL.md`: Step 5 already has basic generation instructions — Phase 3 replaces/enhances this
- `.claude/skills/science/prompts/system.md`: Grounding rules enforcing fetched-source-only citations
- Phase 2's Step 4 produces a structured source list (title, authors, journal, year, DOI, URL, body_text, peer_review_label, image_url, image_license, source_type)

### Established Patterns
- Skill invocation: `/science [topic]` with confirmation before generating
- Output: `output/YYYY-MM-DD-[slug].md`
- Terminal summary: topic, slide count, source count, field, file path
- Citation labels: `[Published in: Journal, Year]`, `[Preprint - not peer reviewed]`, `[News article]`
- Image license labels: `[CC-licensed]`, `[Copyrighted - use with permission]`

### Integration Points
- SKILL.md Step 5 is the insertion point for enhanced generation logic
- Step 4 (Phase 2) outputs structured source list → Step 5 consumes it
- Step 6 writes the output file, Step 7 prints terminal summary (both already implemented)
- Caption must stay under 2,100 characters (constraint from Phase 1)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-content-generation*
*Context gathered: 2026-03-15*
