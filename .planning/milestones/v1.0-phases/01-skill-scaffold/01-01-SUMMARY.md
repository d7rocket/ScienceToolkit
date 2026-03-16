---
phase: 01-skill-scaffold
plan: 01
subsystem: skill
tags: [claude-code-skills, markdown, yaml-frontmatter, instagram-carousel, grounding-enforcement]

# Dependency graph
requires: []
provides:
  - /science Claude Code skill invocable via .claude/skills/science/SKILL.md
  - Canonical Instagram carousel format contract at examples/output-sample.md
  - Grounding enforcement prompt (FETCH-03) at .claude/skills/science/prompts/system.md
  - Output directory output/ initialized for generated carousel files
affects: [02-fetch-layer, 03-generation, 04-validation]

# Tech tracking
tech-stack:
  added: [Claude Code Skills (.claude/skills/), YAML frontmatter, markdown output format]
  patterns: [skill-entrypoint-with-supporting-files, output-contract-first, grounding-enforcement-via-system-prompt]

key-files:
  created:
    - examples/output-sample.md
    - .claude/skills/science/SKILL.md
    - .claude/skills/science/prompts/system.md
    - output/.gitkeep
  modified: []

key-decisions:
  - "Skill path resolved as .claude/skills/science/ (not skills/science/) — Claude Code standard auto-discovery path"
  - "Output contract built first per STATE.md decision — examples/output-sample.md anchors all downstream generation phases"
  - "prompts/system.md placed inside skill directory at .claude/skills/science/prompts/ for self-contained skill with CLAUDE_SKILL_DIR referencing"
  - "Caption must stay under 2,100 characters — Phase 3 400-600 word guidance will exceed limit; format contract enforces 2,100-char ceiling"

patterns-established:
  - "Pattern: Output contract first — write the sample output before writing generation instructions that reference it"
  - "Pattern: Skill supporting files in skill subdirectory — .claude/skills/<name>/prompts/ keeps skill self-contained"
  - "Pattern: Grounding enforcement as permanent rule — system.md prohibits LLM-memory citations unconditionally; Phase 1 exception scoped to examples/ only"

requirements-completed: [FETCH-03, CONT-07]

# Metrics
duration: 9min
completed: 2026-03-15
---

# Phase 1 Plan 01: Skill Scaffold Summary

**Claude Code /science skill scaffold with JWST format contract (6-slide carousel, APA citations, 2063-char caption) and permanent FETCH-03 grounding enforcement**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-15T18:13:20Z
- **Completed:** 2026-03-15T18:22:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `examples/output-sample.md` — the canonical JWST carousel format contract with 6 slides, a 2063-character caption (within 2100-char limit), exactly 5 hashtags, and all 3 citation variants (published paper, preprint, news article)
- Created `.claude/skills/science/SKILL.md` — the `/science` skill entrypoint with correct YAML frontmatter (`disable-model-invocation: true`, `allowed-tools`, `argument-hint`) and 7-step generation workflow
- Created `.claude/skills/science/prompts/system.md` — permanent FETCH-03 grounding enforcement prohibiting LLM-memory citations in all generated output
- Created `output/.gitkeep` — output directory initialized and tracked in git

## Task Commits

Each task was committed atomically:

1. **Task 1: Create format contract and grounding prompt** - `37da69b` (feat)
2. **Task 2: Create skill entrypoint and output directory** - `f33e1ea` (feat)

## Files Created/Modified

- `examples/output-sample.md` — Canonical format contract: JWST topic, 6 slides (hook + 4 body + CTA), caption under 2100 chars, 5 hashtags, 3 APA citation variants, image URLs
- `.claude/skills/science/SKILL.md` — Skill entrypoint: YAML frontmatter + 7-step instructions (confirm, load grounding, load format, fetch, generate, write, print summary)
- `.claude/skills/science/prompts/system.md` — Grounding enforcement (FETCH-03): prohibits LLM-memory citations; Phase 1 fabrication exception scoped to examples/ only
- `output/.gitkeep` — Tracks output directory in git; generated files will be written here

## Decisions Made

- Used `.claude/skills/science/` (not `skills/science/` from CONTEXT.md) — the Claude Code standard auto-discovery path; no extra configuration needed
- Built `examples/output-sample.md` first to serve as the format anchor before writing SKILL.md instructions (matches STATE.md recorded decision)
- Placed `prompts/system.md` inside the skill directory for self-contained referencing via `${CLAUDE_SKILL_DIR}`
- Caption limit established as 2,100 characters (not words) — important constraint for Phase 3

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Caption exceeded 2,100-character limit**
- **Found during:** Task 1 (Create format contract and grounding prompt)
- **Issue:** Initial caption draft was 2,143 characters — violating the 2,100-char limit specified in the plan's done criteria and the format contract's own spec
- **Fix:** Trimmed the final paragraph of the caption from 210 to 150 characters by condensing the closing sentence about JWST mission duration
- **Files modified:** examples/output-sample.md
- **Verification:** `python3` character count confirmed 2,063 characters after fix
- **Committed in:** 37da69b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Fix was required for correctness — the format contract must satisfy its own spec. No scope creep.

## Issues Encountered

None beyond the auto-fixed caption length issue.

## User Setup Required

None - no external service configuration required. The skill is a pure filesystem structure with no external dependencies.

## Next Phase Readiness

- `/science` command is discoverable by Claude Code — invocable via `/science [topic]`
- Format contract is established at `examples/output-sample.md` — all Phase 2+ output must match this structure
- Grounding enforcement (FETCH-03) is in place as a permanent rule — no changes needed when real fetch capability is added in Phase 2
- Output directory `output/` is initialized — Phase 2 and 3 can write generated carousel files there
- **Phase 2 blocker (pre-existing):** arXiv `journal_ref` field population rate unknown in practice — peer-review detection logic may need fallback heuristic (see STATE.md)

---
*Phase: 01-skill-scaffold*
*Completed: 2026-03-15*
