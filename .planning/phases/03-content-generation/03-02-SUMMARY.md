---
phase: 03-content-generation
plan: 02
subsystem: content-generation
tags: [skill, instagram, carousel, rules, enforcement, self-check]

# Dependency graph
requires:
  - phase: 03-content-generation
    provides: "SKILL.md Step 5 generation ruleset (Rules 1-6)"
  - phase: 03-content-generation
    provides: "03-VERIFICATION.md gap analysis identifying 4 enforcement gaps"
provides:
  - "SKILL.md Rule 2 cliff-hanger self-check enforcement clause"
  - "SKILL.md Rule 2 clarified Slide 1 hook rule (body text under 15 words)"
  - "SKILL.md Rule 2 inline glosses self-check enforcement clause"
  - "SKILL.md Rule 3 caption word count self-check (400-word hard floor)"
  - "examples/output-sample.md Slide 1 body updated to comply with clarified rule"
affects: [content-generation, carousel-output, caption-quality, slide-hooks, technical-glosses]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Self-check enforcement pattern: prescriptive rules paired with explicit count-and-verify instructions"
    - "Hard floor enforcement: 'do not stop even if complete' clause forces minimum compliance"

key-files:
  created: []
  modified:
    - ".claude/skills/science/SKILL.md"
    - "examples/output-sample.md"

key-decisions:
  - "Slide 1 hook rule clarified: body text (not heading) must be under 15 words and a question or surprising fact — heading is a descriptive title only"
  - "Self-check pattern chosen over rule rewrite — existing rules correct in intent, needed explicit count-and-verify instructions not full replacement"
  - "400-word hard floor enforced via expand-Context-and-Significance instruction — targets the two paragraphs most amenable to additional detail without padding"
  - "Inline gloss self-check positioned at end of Rule 2 Voice paragraph — applies to all slides, not individual slide types"

patterns-established:
  - "Self-check triad: count, verify, expand/rewrite if below threshold — use for any minimum-enforcement constraint"
  - "Example terms in self-check: concrete examples accelerate correct application (conjugation, redshift, gene drives)"

requirements-completed: [CONT-02, CONT-03, CONT-04, CONT-06]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 3 Plan 02: Content Generation Gap Closure Summary

**Self-check enforcement clauses added to SKILL.md Rules 2 and 3 to close 4 verification gaps: caption 400-word floor, cliff-hanger audit, Slide 1 hook clarification (body under 15 words), and inline gloss audit.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T07:53:02Z
- **Completed:** 2026-03-16T07:54:42Z
- **Tasks:** 1 of 2 complete (Task 2 is checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments

- Rule 3: Added caption word count self-check — explicit instruction to count words, expand Context and Significance paragraphs until reaching 400-word floor; "400 words is a hard floor" phrasing prevents early stopping
- Rule 2: Added cliff-hanger self-check — re-read final sentence of each body slide (Slides 2 through N-1); declarative endings must be rewritten as cliff-hangers; multi-finding slides flagged as Rule 1 violation
- Rule 2: Clarified Slide 1 hook rule — heading is descriptive title, body text must be question or surprising fact under 15 words; replaced ambiguous "under 10 words total" with clear body-text-only constraint
- Rule 2: Added inline glosses self-check — scan every slide for technical terms, verify parenthetical gloss present for each; "unglossed technical term is a formatting error" makes it non-optional
- examples/output-sample.md: Updated Slide 1 body to "What if everything we knew about galaxy formation was wrong?" (10 words, question, no "JWST found out." answer that breaks curiosity gap)

## Task Commits

1. **Task 1: Add self-check enforcement clauses and clarify Slide 1 hook rule** - `391a583` (feat)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` — 3 self-check clauses added (caption word count, cliff-hangers, inline glosses); Slide 1 hook rule clarified (body under 15 words)
- `examples/output-sample.md` — Slide 1 body updated to pure question form (removed "JWST found out.")

## Decisions Made

- **Slide 1 hook clarification:** "under 15 words" for body text (not heading, not combined) — heading is always a descriptive title; 15 words chosen to be consistent with the existing sample while resolving the "under 10 words total" ambiguity that the sample violated at 13 words
- **Self-check pattern over rule rewrite:** The verification report concluded that existing rules are "correct in intent but lack explicit enforcement instructions." Adding self-check instructions preserves the existing rule structure while closing the runtime behavior gap.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Task 2 (checkpoint:human-verify) requires a live `/science [topic]` run to verify all 4 gaps are closed by the self-check clauses. The checkpoint provides exact verification steps:
- Caption must be >= 400 words (count via `sed -n '/^## Caption$/,/^---$/p' output/*.md | wc -w`)
- All body slides (2 through N-1) must end with cliff-hanger or question
- Slide 1 body must be under 15 words and a question or surprising fact
- All technical terms must have inline glosses in parentheses

---
*Phase: 03-content-generation*
*Completed: 2026-03-16*
