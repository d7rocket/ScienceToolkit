# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-16
**Phases:** 4 | **Plans:** 7 | **Sessions:** ~6

### What Was Built
- Complete Claude Code skill (`/science`) that auto-discovers trending science topics, fetches from 6 sources, generates Instagram carousel content with citations
- 6-channel parallel fetch pipeline (arXiv, PubMed, ScienceDaily, Phys.org, Nature News, Ars Technica)
- Self-check enforcement gates with stop clauses for format compliance
- Post-generation validation with write-and-warn pattern
- 14-day topic diversity tracking via topic-log.json

### What Worked
- Output-contract-first approach (Phase 1) anchored all downstream phases — no format drift
- Source quality labels in fetch layer (Phase 2) instead of generation layer — clean data flow
- Gap closure plans (03-02, 03-03) caught enforcement weaknesses before they reached production
- Parallel phase execution where dependencies allowed — Phase 4 planned while Phase 3 gap closure was in progress

### What Was Inefficient
- Phase 2 and 3 ROADMAP.md checkboxes not consistently updated (some plans show unchecked despite having SUMMARY.md)
- STATE.md progress percent stayed at 37% despite 100% completion — metrics tracking lagged behind execution
- No milestone audit run before completion — would have caught any requirement gaps earlier

### Patterns Established
- Rule-based generation: numbered, imperative rules that Claude follows at runtime (not vague bullet instructions)
- Stop clause pattern: "Do NOT proceed to Step N until checks pass" is stronger than advisory self-checks
- Write-and-warn validation: never block file output, prepend warnings instead
- Significant-word matching for dedup: 2+ significant words after stop-word removal

### Key Lessons
1. Self-check enforcement needs explicit count-and-verify instructions, not just "ensure X" — vague rules get skipped
2. Character ceilings (not word counts) for Instagram — 600 words can exceed 2100 chars
3. Source-grounded output (journal names from fetched data, never LLM memory) prevents citation fabrication
4. `export.arxiv.org` must be used instead of `arxiv.org` due to Claude Code WebFetch bug #19287

### Cost Observations
- Model mix: primarily opus for planning, sonnet/haiku for execution agents
- Sessions: ~6 across 2 days
- Notable: gap closure plans (03-02, 03-03) were small but high-impact — caught issues that would have been harder to fix post-milestone

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~6 | 4 | Initial process — output-contract-first, gap closure pattern established |

### Top Lessons (Verified Across Milestones)

1. (First milestone — lessons above will be cross-validated in future milestones)
