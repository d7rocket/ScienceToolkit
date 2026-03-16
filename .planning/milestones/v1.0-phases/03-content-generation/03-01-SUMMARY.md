---
phase: 03-content-generation
plan: "01"
subsystem: content-generation
tags: [skill, instagram, carousel, citations, hashtags, slides]

# Dependency graph
requires:
  - phase: 02-source-fetching
    provides: "Structured source list (title, authors, journal_or_outlet, year, doi, url, body_text, peer_review_label, image_url, image_license, source_type) from Step 4 Phase D"
provides:
  - "Complete Step 5 generation ruleset in SKILL.md covering all 9 content and citation requirements"
  - "Finding selection priority order (cross-validated > counterintuitive > quantitative > recent)"
  - "Slide storytelling rules: 5-7 slides, hook under 10 words, cliff-hangers on body slides, CTA-only final slide"
  - "Caption narrative arc: hook, context, finding, significance, close — 400-600 words, 2100-char ceiling"
  - "Exactly 5 hashtags with selection strategy (topic, field, broad science, platform reach, trending)"
  - "Three citation format variants: Published academic, Preprint, News article — all with clickable URLs"
  - "Image URL output from structured source list with CC-licensed ordering preference"
affects:
  - phase-04-validation-and-auto-topic

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rule-based generation: numbered, imperative rules that Claude follows at runtime (not vague bullet instructions)"
    - "Source-grounded output: all generation derives from structured source list fields — no LLM memory for journal names, authors, or DOIs"
    - "Character ceiling enforcement: caption must be measured in characters (not words) — 600 words can exceed 2100 chars"

key-files:
  created: []
  modified:
    - ".claude/skills/science/SKILL.md — Step 5 fully rewritten with 6 numbered rules (Steps 1-4, 6-7 unchanged)"

key-decisions:
  - "Rule-numbered subsections in Step 5 — makes each rule independently referenceable and auditable at runtime"
  - "Single focal finding architecture — carousel builds around one cross-validated or most counterintuitive finding rather than trying to cover all sources equally"
  - "Caption character ceiling is 2100 chars, not 600 words — plan explicitly calls out that Claude must count characters not words"
  - "Journal names in caption must use source.journal_or_outlet from fetched source list — never LLM memory"
  - "Images section uses CC-licensed ordering preference to promote usable images"

patterns-established:
  - "Step 5 Rule structure: each rule maps to one or more requirement IDs (CONT-01 through CITE-03) — traceability is explicit in the rule headers"
  - "Cliff-hanger forward connection: each cliff-hanger must connect forward — next slide resolves or escalates it (not just any tease phrase)"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CITE-01, CITE-02, CITE-03]

# Metrics
duration: ~25min
completed: 2026-03-16
---

# Phase 3 Plan 01: Content Generation Summary

**Prescriptive 6-rule Step 5 generation ruleset replacing skeleton instructions — covering finding selection, cliff-hanger slide storytelling, 2100-char caption arc, exactly-5 hashtags, three citation variants with clickable URLs, and CC-ordered image output**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-16
- **Completed:** 2026-03-16
- **Tasks:** 2 (Task 1 auto, Task 2 human-verify checkpoint — approved)
- **Files modified:** 1

## Accomplishments

- Rewrote SKILL.md Step 5 from a 15-line vague skeleton into a complete, numbered ruleset with 6 rules and unambiguous constraints
- All 9 content and citation requirements (CONT-01 through CITE-03) are explicitly addressed and traceable to rule headers
- Smoke test run against `/science CRISPR gene editing` — user approved output as passing all 9 requirements
- User noted slides may have slightly too much text for Instagram carousels — flagged for future iteration

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite SKILL.md Step 5 with complete generation ruleset** - `e200058` (feat)
2. **Task 2: Smoke-test carousel output** - checkpoint approved by user (no code commit — verification only)

**Plan metadata:** (docs commit — created below)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` — Step 5 fully rewritten with Rules 1-6; Steps 1-4 and 6-7 unchanged

## Decisions Made

- **Rule-numbered subsections:** Step 5 uses numbered rules (Rule 1 through Rule 6) as subsection headers. This makes each rule independently referenceable and auditable when inspecting runtime output.
- **Single focal finding:** Carousel builds around one finding (chosen by priority: cross-validated > counterintuitive > quantitative > recent) rather than covering all sources equally. Other sources inform caption depth and citations only.
- **Character ceiling enforcement wording:** Rule 3 explicitly instructs "count the characters in the caption, not words" — a 600-word caption can exceed 2100 chars and the distinction matters at runtime.
- **Journal names from source list only:** Rule 3 prohibits using journal names from LLM memory; must use `source.journal_or_outlet` from the fetched structured source list to prevent fabrication.

## Deviations from Plan

None — plan executed exactly as written. Task 1 followed the 6-rule specification precisely. Task 2 checkpoint was approved by user.

## Issues Encountered

None during implementation. During smoke test, user observed that slide body text may be slightly verbose for Instagram carousels (~150 characters per body slide per the rule). No blocking issue — flagged as a concern for future tuning.

## User Setup Required

None — no external service configuration required.

## Concerns for Future Iteration

- **Slide text verbosity:** User feedback after smoke test: "seems just a bit too much text for an instagram carousel." Rule 2 currently targets ~150 characters per body slide (2-3 short punchy sentences). A future plan could lower this target to ~100 characters or 1-2 sentences, or add a hard character ceiling per slide analogous to the caption ceiling. Consider in Phase 4 or as a 3.1 plan if the issue persists across multiple runs.

## Next Phase Readiness

- Phase 3 complete — SKILL.md now has a complete generation ruleset grounded in fetched source material
- Phase 4 (Validation and Auto-Topic) can proceed: post-generation validation will be able to check the same constraints now formalized in Step 5 (caption char count, hashtag count, slide label format, peer-review status on citations)
- No blockers for Phase 4

---
*Phase: 03-content-generation*
*Completed: 2026-03-16*
