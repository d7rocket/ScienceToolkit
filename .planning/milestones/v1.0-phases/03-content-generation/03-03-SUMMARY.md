---
phase: 03-content-generation
plan: "03"
subsystem: content-generation
tags: [science-skill, caption, word-count, keyword-gate, self-check, stop-clause]

# Dependency graph
requires:
  - phase: 03-02
    provides: Self-check enforcement clauses for Rules 2 and 3
provides:
  - Rule 3 stop clause blocking Step 6 until caption is >= 400 words with topic keyword in first sentence
  - Expanded Paragraph 2 guidance (4-6 sentences) and Paragraph 4 guidance (3-5 sentences)
affects: [03-content-generation, science-skill, caption-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stop-clause gate: block next step until all checks pass (count-and-verify, not count-and-suggest)"
    - "Two-gate self-check: word count gate + keyword gate, both must pass before proceeding"

key-files:
  created: []
  modified:
    - ".claude/skills/science/SKILL.md"

key-decisions:
  - "Stop clause is a hard block, not advisory — 'Do NOT proceed to Step 6 until both checks pass' replaces the weaker 'if under 400, expand' phrasing"
  - "Keyword gate added explicitly: topic keyword must appear in caption first sentence before Step 6 executes"
  - "Paragraph 2 expanded guidance to 4-6 sentences (was 2-3) to anchor expansion weight at the right paragraph"
  - "Paragraph 4 expanded guidance to 3-5 sentences (was unspecified) to ensure significance section carries enough detail"

patterns-established:
  - "Gate pattern for self-checks: mandatory count-and-verify instruction followed by explicit DO NOT PROCEED clause"
  - "Expansion targeting: direct paragraph-level guidance (which paragraphs to expand, how many sentences) rather than general 'make it longer'"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CITE-01, CITE-02, CITE-03]

# Metrics
duration: ~15min
completed: 2026-03-16
---

# Phase 03 Plan 03: CONT-04 Gap Closure Summary

**Rule 3 stop clause added to SKILL.md blocking Step 6 until caption reaches >= 400 words with topic keyword in first sentence — CONT-04 fully closed by user smoke test.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-16
- **Completed:** 2026-03-16
- **Tasks:** 2 (1 auto, 1 human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

- Added hard-stop self-check clause to Rule 3: Step 6 is explicitly blocked until both word count >= 400 and topic keyword in first sentence are confirmed
- Expanded Paragraph 2 length guidance from "2-3 sentences" to "4-6 sentences" with specific expansion targets (history, prior approaches, why-now)
- Expanded Paragraph 4 length guidance to "3-5 sentences" with specific expansion targets (who is affected, practical outcomes, open questions)
- User smoke test with `/science CRISPR gene editing` confirmed CONT-04 is fully closed: caption 400+ words, "CRISPR" in first sentence, no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Strengthen Rule 3 self-check with stop clause and keyword mandate** - `966b208` (feat)
2. **Task 2: Smoke-test caption word count and keyword after stop clause fix** - human-verify checkpoint, approved by user

**Plan metadata:** (docs commit — this summary)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` — Rule 3 self-check paragraph replaced with two-gate stop clause (word count gate + keyword gate); Paragraph 2 and 4 length guidance expanded

## Decisions Made

- Stop clause must be imperative ("Do NOT proceed"), not conditional ("if under 400") — the prior phrasing left the model room to treat expansion as optional
- Two separate named gates (Word count gate, Keyword gate) rather than a combined check — makes it easier for the model to verify each independently and report which failed
- Expansion guidance targets specific paragraphs (2 and 4) with sentence count ranges — avoids vague "make it longer" instructions that previously failed to move the word count

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The prior plan (03-02) had already established the self-check enforcement pattern; this plan extended it with the stop-clause form that converts advisory language into a blocking gate.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All CONT-01 through CONT-06 and CITE-01 through CITE-03 requirements confirmed closed
- Phase 3 gap closure series (03-01, 03-02, 03-03) complete
- Phase 4 can proceed — science skill is stable and passing all verification criteria

---
*Phase: 03-content-generation*
*Completed: 2026-03-16*
