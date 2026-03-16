---
phase: 04-validation-and-auto-topic
plan: 01
subsystem: skill
tags: [rss, json-log, topic-discovery, diversity-tracking, claude-skill]

# Dependency graph
requires:
  - phase: 02-source-fetching
    provides: RSS feed URLs for ScienceDaily, Phys.org, Nature News, Ars Technica — reused in Step 1 auto-discovery
  - phase: 03-content-generation
    provides: Step 6 write-output structure and Step 7 terminal summary format — both extended here
provides:
  - SKILL.md Step 1 with three-branch decision table (auto-discover, manual with dedup, rejection alternatives)
  - Auto-discovery flow: parallel RSS scan of 4 feeds, cross-feed frequency ranking, 14-day dedup
  - topic-log.json append logic in Step 6 with explicit Read-append-Write pattern
  - Step 7 terminal summary extended with topic log update line
affects: [04-02, smoke-testing, daily-science-runs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Three-branch decision table in SKILL.md Step 1: Case A (auto-discovery), Case B (manual with dedup warning), Case C (rejection handled inline)"
    - "Read-append-Write pattern for JSON log persistence: Read existing file, append new entry, Write full array — prevents overwrite"
    - "Significant-word matching for dedup: 2+ significant words shared after stop-word removal (avoids false positives like 'Mars mission' vs 'Mars climate')"
    - "Parallel WebFetch calls for RSS discovery: same 4 feed URLs as Phase 2 Step 4 Phase A"

key-files:
  created: []
  modified:
    - .claude/skills/science/SKILL.md

key-decisions:
  - "topic-log.json uses JSON array format (not NDJSON) — Read/Write approach is explicit and human-readable; file stays trivially small at 14 entries max per rolling window"
  - "Dedup uses 2+ significant words matching (not exact string or single-word) — prevents false positives like 'quantum computing' vs 'quantum entanglement'"
  - "Manual topic override warns but does NOT block — respects explicit user intent (mirrors CONTEXT.md locked decision)"
  - "All-candidates-covered edge case handled by window widening to 7 days rather than failing the run"
  - "topic-log.json entry appended in Step 6 AFTER writing output file — field value is then known from generated header"

patterns-established:
  - "Pattern: Parallel RSS fetch for discovery — no topic filter, top 5 items per feed, candidate extraction from titles"
  - "Pattern: Read-then-Write for JSON file append — never Write-only without Read first"
  - "Pattern: Stop-word list defined inline in SKILL.md (the, a, of, in, and, new, study, scientists, researchers, find, show, reveal, discover, numbers, articles)"

requirements-completed: [TOPIC-01, TOPIC-02]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 4 Plan 01: Auto-Topic Discovery and Diversity Tracking Summary

**RSS-based auto-topic discovery with 14-day diversity tracking via topic-log.json, using parallel feed scanning, 2+ significant-word dedup matching, and Read-append-Write log persistence**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T13:02:39Z
- **Completed:** 2026-03-16T13:04:44Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Rewrote SKILL.md Step 1 with three-branch decision table (Case A: auto-discovery, Case B: manual topic with dedup warning, Case C: rejection handled inline in Case A)
- Auto-discovery scans 4 RSS feeds in parallel, extracts noun-phrase candidates from article titles, ranks by cross-feed frequency, applies 14-day dedup before presenting top candidate
- Extended Step 6 with topic-log.json append using explicit Read-append-Write pattern including CRITICAL overwrite-prevention guard
- Extended Step 7 terminal summary with `Topic log: updated (output/topic-log.json)` line

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite SKILL.md Step 1 with auto-discovery and diversity tracking** - `6b1f5ec` (feat)
2. **Task 2: Extend SKILL.md Step 6 with topic-log.json append and Step 7 with log line** - `e785790` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` - Step 1 fully rewritten (53 lines added), Step 6 extended with Topic log update subsection (23 lines added), Step 7 terminal summary extended with log line

## Decisions Made

- Used JSON array format for topic-log.json (not NDJSON) — more human-readable, trivially small file, consistent with Read/Write tool usage pattern already established in skill
- Dedup uses 2+ significant words rule (not exact match) — prevents "Mars mission" from matching "Mars climate research" but correctly matches "CRISPR gene therapy" with "CRISPR gene editing"
- topic-log.json entry created in Step 6 after output file is written (not Step 1) — field value is only known after content generation
- All-candidates-covered edge case: first expand to candidates 4-8, then widen window to 7 days — avoids hard failure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SKILL.md now supports fully hands-off daily use via `/science` (no args)
- topic-log.json will be created on first run (missing-file case handled in both Step 1 and Step 6)
- Plan 02 (format validation) can now be implemented — Step 5.5 validation layer is the remaining gap

---
*Phase: 04-validation-and-auto-topic*
*Completed: 2026-03-16*

## Self-Check: PASSED

- FOUND: `.claude/skills/science/SKILL.md`
- FOUND: `.planning/phases/04-validation-and-auto-topic/04-01-SUMMARY.md`
- FOUND commit: `6b1f5ec` (Task 1 — Step 1 rewrite)
- FOUND commit: `e785790` (Task 2 — Step 6/7 extension)
