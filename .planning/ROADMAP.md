# Roadmap: Project Pleiades

## Overview

Four phases build a complete Claude Code skill that delivers a daily science Instagram carousel package. Phase 1 defines the output contract before a single instruction is written. Phase 2 builds the source fetching pipeline with academic API access and source quality labeling baked in from day one. Phase 3 generates the carousel content with citation safety enforced against real fetched material. Phase 4 closes the loop with output validation and auto-topic discovery, making the skill hands-off for daily use.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Skill Scaffold** - Build the skill directory, output contract, and format spec before writing any instructions (completed 2026-03-15)
- [ ] **Phase 2: Source Fetching** - Wire up arXiv API, PubMed, and science news sources with source quality labels built in
- [ ] **Phase 3: Content Generation** - Generate carousel slides, caption, hashtags, and citations from fetched source material only
- [x] **Phase 4: Validation and Auto-Topic** - Add post-generation format validation and auto-topic discovery with diversity tracking (completed 2026-03-16)

## Phase Details

### Phase 1: Skill Scaffold
**Goal**: The skill can be invoked and produces output in the correct Instagram format
**Depends on**: Nothing (first phase)
**Requirements**: FETCH-03, CONT-07
**Success Criteria** (what must be TRUE):
  1. Running `/science` in Claude Code launches the skill without errors
  2. The output file `output/YYYY-MM-DD-[slug].md` is created on disk with clearly labeled sections (Slide 1, Slide 2, Caption, Hashtags, Sources)
  3. A fabricated sample output exists at `examples/output-sample.md` that demonstrates the exact section structure and slide count (5-7 slides, 5 hashtags, caption under 2100 chars)
  4. All generated content is confirmed to come from fetched source material, not LLM memory (enforced by system prompt instruction in `prompts/system.md`)
**Plans:** 1/1 plans complete
Plans:
- [ ] 01-01-PLAN.md — Create skill scaffold: format contract, grounding prompt, skill entrypoint, output directory

### Phase 2: Source Fetching
**Goal**: The skill reliably fetches full, usable science content from academic and news sources with source quality metadata attached
**Depends on**: Phase 1
**Requirements**: FETCH-01, FETCH-02, FETCH-04, CITE-04, CITE-05
**Success Criteria** (what must be TRUE):
  1. The skill fetches real content from at least one academic source (arXiv via `export.arxiv.org/api/query`) and at least one news source (ScienceDaily, Nature News, or Ars Technica) in a single run
  2. Every fetched article is labeled with peer-review status: `[Preprint - not peer reviewed]` or `[Published in: Journal, Year]`
  3. Every fetched source image URL is labeled with license status: `[CC-licensed]` or `[Copyrighted - use with permission]`
  4. When the same finding appears in both an academic paper and a news article, both sources are captured together and linked in the output
  5. Fetched content passes basic quality gate: article body is more than 2,000 characters (not abstract-only behind paywall)
**Plans:** 1 plan
Plans:
- [ ] 02-01-PLAN.md — Rewrite SKILL.md Step 4 with complete parallel fetch pipeline for all 6 source channels

### Phase 3: Content Generation
**Goal**: The skill produces a complete, copy-paste-ready carousel package from fetched source material
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CITE-01, CITE-02, CITE-03
**Success Criteria** (what must be TRUE):
  1. Output contains 5-7 labeled slide chunks where Slide 1 opens with a hook under 15 words (question or surprising fact) and body slides end with a cliff-hanger or question
  2. The Instagram caption is 400-600 words with the topic keyword in the first sentence, written in casual + authoritative tone
  3. Exactly 5 hashtags are generated — no more, no less
  4. Every claim in the output is traceable to a fetched source via a full APA/Harvard citation with DOI (where available), authors, publication date, and clickable URL
  5. At least one source image URL is included in the output
**Plans:** 3 plans
Plans:
- [x] 03-01-PLAN.md — Rewrite SKILL.md Step 5 with complete generation ruleset (slides, caption, hashtags, citations, images)
- [x] 03-02-PLAN.md — Gap closure: add self-check enforcement clauses for caption word count, cliff-hangers, inline glosses; clarify Slide 1 hook rule
- [ ] 03-03-PLAN.md — Gap closure: strengthen Rule 3 stop clause to block Step 6 until caption >= 400 words with topic keyword in first sentence

### Phase 4: Validation and Auto-Topic
**Goal**: The skill runs daily without supervision, picks fresh topics, and never outputs a carousel that needs manual format fixes
**Depends on**: Phase 3
**Requirements**: TOPIC-01, TOPIC-02
**Success Criteria** (what must be TRUE):
  1. Running `/science` with no argument automatically discovers and selects a trending science topic without user input
  2. After 14 days of daily use, the skill has not repeated a topic or field — a topic diversity log tracks what has been covered and warns if the proposed topic was covered in the last 14 days
  3. A post-generation validation step flags any output that violates format rules (caption over 2100 chars, hashtag count not equal to 5, missing slide labels, missing peer-review status on citations) before writing to disk
**Plans:** 2/2 plans complete
Plans:
- [ ] 04-01-PLAN.md — Auto-topic discovery with RSS feed scanning, cross-feed ranking, 14-day diversity tracking via topic-log.json
- [ ] 04-02-PLAN.md — Post-generation format validation (5 mechanical checks), write-and-warn output, terminal summary extension

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Skill Scaffold | 1/1 | Complete   | 2026-03-15 |
| 2. Source Fetching | 0/1 | Planning complete | - |
| 3. Content Generation | 2/3 | Gap closure in progress | - |
| 4. Validation and Auto-Topic | 2/2 | Complete   | 2026-03-16 |
