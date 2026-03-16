---
phase: 02-source-fetching
plan: 01
subsystem: api
tags: [arxiv, pubmed, sciencedaily, rss, webfetch, academic-api, science-news, citation-labels]

# Dependency graph
requires:
  - phase: 01-skill-scaffold
    provides: SKILL.md scaffold with Step 4 placeholder and output format contract
provides:
  - Complete parallel fetch pipeline in SKILL.md Step 4 for all 6 source channels (arXiv, PubMed, ScienceDaily, Phys.org, Nature News, Ars Technica)
  - Peer-review status labeling logic ([Preprint - not peer reviewed], [Published in: Journal, Year])
  - Image license labeling logic ([CC-licensed], [Copyrighted - use with permission])
  - Quality gate (>2,000 chars body text) with PubMed abstract exception
  - Cross-source matching with "Coverage of the same finding" grouping
  - Structured source list schema (title, authors, doi, body_text, peer_review_label, image_url, image_license, source_type) passed to Step 5
affects: [03-content-generation, 04-validation-auto-topic]

# Tech tracking
tech-stack:
  added: [export.arxiv.org Atom API, NCBI ESearch + EFetch APIs, ScienceDaily RSS, Phys.org RSS, Nature RSS, Ars Technica via WebSearch]
  patterns:
    - Parallel WebFetch across all 6 channels in Phase A before any processing
    - Two-step fetch pattern (RSS/search -> article page) for news sources and PubMed
    - Date-window relaxation fallback (7 days -> 30 days) per channel if no results
    - Default-to-preprint rule for arXiv: journal_ref present -> published, absent -> preprint

key-files:
  created: []
  modified:
    - .claude/skills/science/SKILL.md

key-decisions:
  - "Use export.arxiv.org exclusively (not arxiv.org) — main domain blocked by WebFetch bug #19287 per STATE.md"
  - "Default arXiv labels to [Preprint - not peer reviewed] unless journal_ref field is present and non-empty — never falsely claim peer review"
  - "PubMed ESearch + EFetch two-step: ESearch returns PMIDs, EFetch fetches XML abstracts for top 2-3 PMIDs. Max 3 req/sec, no API key needed"
  - "Quality gate threshold is 2,000 characters (not words) of body text — PubMed abstracts exempt if paired with a news article covering the same finding"
  - "Cross-source matching: group matched sources consecutively with 'Coverage of the same finding' note; if no match found, note 'Sources not cross-validated' and proceed immediately without stalling"
  - "Ars Technica uses WebSearch fallback instead of direct RSS — site lacks a reliable public RSS feed for science content"
  - "Failure handling: skip unreachable channels individually; only fail entire run if ALL channels are unreachable"

patterns-established:
  - "Phase A/B/C/D pipeline pattern: parallel fetch -> quality gate -> cross-match -> structured source list"
  - "Structured source list schema: every source record has 11 fields (title, authors, journal_or_outlet, year, doi, url, body_text, peer_review_label, image_url, image_license, source_type)"
  - "Terminal fetch summary after all fetches: which sources searched, which returned results (with count), which skipped (with reason)"

requirements-completed: [FETCH-01, FETCH-02, FETCH-04, CITE-04, CITE-05]

# Metrics
duration: ~30min
completed: 2026-03-15
---

# Phase 2 Plan 01: Source Fetching Summary

**Complete parallel fetch pipeline replacing the Phase 1 placeholder in SKILL.md Step 4 — arXiv, PubMed, ScienceDaily, Phys.org, Nature News, and Ars Technica with peer-review labels, image license labels, quality gates, and cross-source matching.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-15
- **Completed:** 2026-03-15
- **Tasks:** 2 (Task 1: auto, Task 2: human-verify checkpoint — approved)
- **Files modified:** 1

## Accomplishments

- Replaced the Phase 1 placeholder in SKILL.md Step 4 with complete production-ready fetch instructions covering all 6 source channels
- Established peer-review labeling for all source types: arXiv (preprint vs. published), PubMed (always published), news (always [News article])
- Added quality gate (≥2,000 chars), cross-source matching with grouping, and structured source list schema for Step 5 consumption
- Smoke tested with a real topic — human verified all Phase 2 success criteria pass in live output

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite SKILL.md Step 4 with complete fetch pipeline** - `e205aeb` (feat)
2. **Task 2: Smoke test the fetch pipeline with a real topic** - checkpoint approved by user (no code commit — verification only)

## Files Created/Modified

- `.claude/skills/science/SKILL.md` - Step 4 rewritten with Phases A–D fetch pipeline; all other steps unchanged

## Decisions Made

- Used `export.arxiv.org` exclusively to avoid WebFetch bug #19287 blocking `arxiv.org`
- Set default arXiv peer-review label to preprint unless `journal_ref` field is present — conservative approach to never falsely claim peer review
- PubMed two-step fetch (ESearch + EFetch) retrieves real XML abstracts; rate-limited to 3 req/sec, no API key required
- Quality gate threshold is 2,000 characters; PubMed abstracts below threshold are kept as citation-only if paired with a news article on the same finding
- Cross-source matching does not stall — if no match found after reviewing titles/abstracts, proceeds immediately and notes "Sources not cross-validated"
- Ars Technica uses WebSearch fallback (no reliable public RSS for science content)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required. All source channels use public APIs with no authentication (NCBI ESearch/EFetch are free and unauthenticated at the rate limits used).

## Next Phase Readiness

- Step 4 is production-ready. Running `/science [topic]` now fetches real grounded content from academic and news sources
- Step 5 (carousel generation) can now consume the structured source list produced by Phase D
- Phase 3 (Content Generation) can begin immediately — all source quality metadata is in place
- Known concern: arXiv `journal_ref` population rate in practice is unknown — some papers published in journals may not have this field populated, causing them to be labeled as preprints. Monitor during Phase 3 testing and add fallback heuristic if needed

---
*Phase: 02-source-fetching*
*Completed: 2026-03-15*
