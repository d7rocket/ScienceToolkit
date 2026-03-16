# Phase 2: Source Fetching - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up arXiv API, PubMed, and science news sources so the skill reliably fetches full, usable science content with source quality metadata attached. Covers requirements FETCH-01, FETCH-02, FETCH-04, CITE-04, CITE-05. Content generation and topic auto-discovery are separate phases (3 and 4).

</domain>

<decisions>
## Implementation Decisions

### Source selection
- **Academic sources (both primary):** arXiv (`export.arxiv.org/api/query`) and PubMed — search both in parallel for every topic
- **News sources (4 sites):** ScienceDaily, Ars Technica, Nature News, Phys.org
- **Failure handling:** Skip unreachable sources and log in terminal output; only fail the run if ALL sources are unreachable
- **Target source count:** 3-5 sources per topic, aiming for at least 1 academic + 1 news

### Fetch pipeline flow
- **Search strategy:** Parallel — search all sources (arXiv, PubMed, news sites) simultaneously
- **Recency filter:** Last 7 days — prioritize content from the past week
- **Paywall handling:** If full paper text is behind a paywall, use the abstract for citation data and rely on news articles for narrative content. arXiv papers are typically full-text accessible.
- **Quality gate:** Article body must be >2,000 characters (not abstract-only). Abstract + news coverage combo is acceptable when paper is paywalled.

### Peer-review detection
- **arXiv papers:** Use `journal_ref` field when populated → `[Published in: Journal, Year]`. When `journal_ref` is empty, default to `[Preprint - not peer reviewed]` — conservative, never falsely claims peer review
- **PubMed results:** Assume peer-reviewed → `[Published in: Journal, Year]` using journal name and date from PubMed metadata
- **News articles:** Label as `[News article]` — consistent with Phase 1 sample output
- **Image licensing:** Label by source type heuristic — images from open-access papers/CC sources get `[CC-licensed]`, images from news sites get `[Copyrighted - use with permission]`

### Cross-source linking
- **Matching method:** Let Claude judge semantically — after fetching all sources, compare titles/abstracts/content and group related sources. No explicit algorithm needed.
- **Presentation:** Group matched sources consecutively in the Sources section with a note like "Coverage of the same finding"
- **No match found:** Proceed anyway — cross-validation is nice-to-have, not a blocker. Note in output if sources weren't cross-validated.
- **Priority:** Cross-validated findings (paper + news coverage) are prioritized over single-source findings when choosing what to feature in the carousel

### Claude's Discretion
- Exact search query construction for each source API
- Number of results to request per API call
- How to extract/parse content from each news site's HTML
- Temp file or in-memory handling of fetched content
- Exact ordering of sources in output when no cross-validation match exists

</decisions>

<specifics>
## Specific Ideas

- User reads Science et Vie (French science publication) — noted as a potential future source for v2 international coverage, but v1 stays English-only
- SKILL.md Step 4 is currently a placeholder ("Phase 1 scaffold") that this phase replaces with real fetching logic

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `examples/output-sample.md`: Format contract with all three citation variants demonstrated (published, preprint, news article)
- `.claude/skills/science/prompts/system.md`: Grounding rules that enforce fetched-source-only citations
- `.claude/skills/science/SKILL.md`: Skill entrypoint with Step 4 placeholder ready for real fetch logic

### Established Patterns
- Skill invocation via `/science [topic]` with confirmation before generating
- Output written to `output/YYYY-MM-DD-[slug].md`
- Terminal summary format: topic, slide count, source count, field, file path
- Citation status labels: `[Published in: Journal, Year]`, `[Preprint - not peer reviewed]`, `[News article]`

### Integration Points
- SKILL.md Step 4 is the insertion point for fetch logic
- Fetched sources feed into Step 5 (content generation) — Phase 2 must produce structured source data that Step 5 can consume
- `export.arxiv.org/api/query` must be used (not `arxiv.org` — blocked by WebFetch bug per STATE.md)
- WebSearch and WebFetch are the available tools (listed in SKILL.md `allowed-tools`)

</code_context>

<deferred>
## Deferred Ideas

- Science et Vie (French-language source) — potential v2 addition for international coverage
- User-specified topic input (`/science [topic]`) already scaffolded but real topic handling is Phase 4 auto-discovery

</deferred>

---

*Phase: 02-source-fetching*
*Context gathered: 2026-03-15*
