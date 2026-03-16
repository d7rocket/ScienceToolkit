---
phase: 04-validation-and-auto-topic
plan: 02
subsystem: skill
tags: [skill, validation, format-checks, carousel, instagram]

# Dependency graph
requires:
  - phase: 04-validation-and-auto-topic
    provides: Step 1 auto-discovery and Step 6 topic-log update (Plan 01)
  - phase: 03-content-generation
    provides: Step 5 generation ruleset with self-check gates
provides:
  - Step 5.5 with 5 mechanical format checks (caption length, hashtag count, slide count, slide label format, citation completeness)
  - Step 6 Validation warnings subsection with GitHub [!WARNING] callout prepended before output heading
  - Step 7 terminal summary Validation: PASS/FAIL line
affects: [skill-execution, format-validation, output-quality]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Write-and-warn: validation never blocks file write — violations prepended as warning at top of output"
    - "Defense in depth: Step 5.5 re-validates mechanically what Step 5 self-checks enforce as generation rules"
    - "violation_status variable: set in Step 5.5, consumed by Steps 6 and 7 for coordinated reporting"

key-files:
  created: []
  modified:
    - .claude/skills/science/SKILL.md

key-decisions:
  - "Validation is non-blocking: file always written, violations warned not blocked (write-and-warn pattern)"
  - "5 hard format checks only: caption chars, hashtag count, slide count, slide label format, citation completeness — no content quality re-checks"
  - "GitHub [!WARNING] callout placed BEFORE the # [Topic Title] heading so it is unmissable"
  - "Validation: PASS/FAIL line inserted between file path and topic log in Step 7 summary"

patterns-established:
  - "Step 5.5 validation: collect ALL violations into list before evaluating — no early exit"
  - "Caption boundary: exclude ## Caption heading line and blank lines from character count"
  - "Hashtag scope: count only tokens in Hashtags section — not slide headings or image URLs"

requirements-completed: [TOPIC-01, TOPIC-02]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 4 Plan 02: Format Validation Summary

**Post-generation format validation layer with 5 mechanical checks, GitHub warning callout prepend, and PASS/FAIL terminal reporting in SKILL.md**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T13:07:41Z
- **Completed:** 2026-03-16T13:09:36Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Added Step 5.5 between Steps 5 and 6 with 5 precisely-specified format checks (caption character boundary, hashtag section scope, slide count range, slide label pattern, citation field presence)
- Extended Step 6 with `### Validation warnings` subsection using GitHub-flavored Markdown `> [!WARNING]` callout prepended before the `# [Topic Title]` heading on FAIL
- Extended Step 7 terminal summary with `Validation: PASS` / `Validation: FAIL — N violations (see file header)` line between file path and topic log lines
- Validation is fully non-blocking — proceeds to Step 6 in all cases, file always written

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Step 5.5 validation and extend Steps 6-7 with validation reporting** - `3ba3459` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` - Added Step 5.5 (74 lines inserted), extended Step 6 with Validation warnings subsection, extended Step 7 terminal summary format

## Decisions Made

- Validation is non-blocking: write-and-warn pattern chosen (from CONTEXT.md locked decisions) — user sees warnings when reviewing but output is never suppressed
- Only hard format rules validated (5 checks) — Phase 3 self-checks already handle content quality (cliff-hangers, keyword gate, glosses); no re-checking in Step 5.5
- Caption character count boundary precision: EXCLUDING the `## Caption` heading line itself and leading/trailing blank lines (per Pitfall 3 in RESEARCH.md)
- Warning block placement: BEFORE `# [Topic Title]` heading (per Pitfall 5 in RESEARCH.md) so it cannot be missed when reviewing the file

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 validation is complete: Step 5.5 + Step 6 warning prepend + Step 7 PASS/FAIL reporting all in place
- The full skill pipeline is complete: Steps 1 (auto-discovery) → 2 (grounding) → 3 (format) → 4 (fetch) → 5 (generate) → 5.5 (validate) → 6 (write + topic log) → 7 (summary)
- Ready for end-to-end smoke test of the complete carousel generation flow
- No blockers for v1.0 milestone

---
*Phase: 04-validation-and-auto-topic*
*Completed: 2026-03-16*
