# Phase 4: Validation and Auto-Topic - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the skill hands-off for daily use: auto-discover trending science topics when no argument is provided, track topic diversity to avoid repetition within 14 days, and validate output format before writing to disk. Covers requirements TOPIC-01 and TOPIC-02. Content generation rules are Phase 3; source fetching pipeline is Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Topic discovery method
- Scan the 4 news RSS feeds (ScienceDaily, Phys.org, Nature News, Ars Technica) for today's articles — reuses Phase 2's existing source channels
- Do NOT include arXiv/PubMed in discovery scan — academic APIs need specific search terms, better used after topic is chosen for deep sourcing
- Rank candidates by cross-source frequency: a topic appearing in multiple feeds ranks higher than a single-feed story (aligns with Phase 2's cross-validation priority)
- Fallback: if RSS scan returns no strong candidates, fall back to WebSearch "trending science news today"

### Diversity tracking
- Log file: `output/topic-log.json` — each entry records `{date, topic, field, slug}`
- 14-day dedup window: if a proposed auto-topic matches a recent entry, silently skip it and pick the next-highest-ranked candidate. Log the skip in terminal output.
- Track topic repeats only — no field rotation. If biology dominates the news 3 days running, that's fine. Field is logged for reference but not used as a filter.
- Manual topic override (`/science CRISPR`): warn "Note: CRISPR was covered on 2026-03-12" but proceed anyway — respect explicit user intent

### Format validation
- Validate hard format rules only (mechanically checkable): caption <= 2100 chars, exactly 5 hashtags, slide count 5-7, all slides have `## Slide N:` labels, every citation has a peer-review label and URL line
- Do NOT re-check content quality rules (cliff-hangers, keyword in first sentence, glosses) — Phase 3's prompt self-checks handle those
- On violation: write the output file anyway but prepend a warning section at the top listing each violation. User sees warnings when reviewing.
- Validation reporting: print pass/fail in terminal summary (Step 7) AND add a Validation section at top of output .md file if any violations found
- Source URL checking: format-only (check fields are present). Don't re-fetch URLs — they were just fetched in Step 4.

### No-topic UX flow
- `/science` with no argument: auto-discover topic via RSS scan, then show confirmation with brief context: "Today's topic: CRISPR cancer trial results (covered by Nature News, ScienceDaily, arXiv). Proceed?"
- If user rejects: show the #2 and #3 ranked alternatives. If all rejected, ask for manual topic input.
- `/science [topic]` with explicit topic: still confirm (keep Phase 1 behavior). This is also where the diversity warning appears if the topic was recently covered.
- Confirmation is the single interaction point — after that, the run is fully automated through fetch, generate, validate, and write.

### Claude's Discretion
- Exact RSS parsing logic for extracting topic candidates from feed items
- How to normalize topic names for dedup matching (fuzzy vs exact)
- Threshold for "strong candidate" vs triggering WebSearch fallback
- Exact wording of validation warning section in output files
- How to handle edge case where all top candidates were covered recently (expand to next-best or widen date window)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skill definition
- `.claude/skills/science/SKILL.md` — Full skill definition including Step 1 (confirmation flow to modify), Steps 4-7 (fetch/generate/write/summary pipeline to integrate with)
- `.claude/skills/science/prompts/system.md` — Grounding rules (fetched-source-only enforcement)

### Format contract
- `examples/output-sample.md` — Canonical format contract; validation rules must check against this structure

### Prior phase context
- `.planning/phases/02-source-fetching/02-CONTEXT.md` — RSS source list, fetch pipeline decisions, cross-source matching approach
- `.planning/phases/03-content-generation/03-CONTEXT.md` — Self-check clauses already in place (caption word count, cliff-hangers, keyword gate)

### Requirements
- `.planning/REQUIREMENTS.md` — TOPIC-01 (auto-pick) and TOPIC-02 (diversity tracking) definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SKILL.md` Step 4 Phase A: RSS feed URLs for ScienceDaily, Phys.org, Nature News already defined — topic discovery reuses these same feeds
- `SKILL.md` Step 1: Existing confirmation flow (`$ARGUMENTS` check) — modify rather than rewrite
- `SKILL.md` Step 7: Terminal summary format — extend with validation pass/fail line
- `examples/output-sample.md`: Section structure defines what validation checks against

### Established Patterns
- Skill invocation: `/science [topic]` with confirmation before generating
- Output: `output/YYYY-MM-DD-[slug].md` — topic-log.json lives alongside these
- Phase 2 RSS parsing: ScienceDaily, Phys.org, Nature News feeds already fetched for sourcing — same feeds power discovery
- Phase 3 self-checks: caption word count gate, keyword gate, cliff-hanger scan — validation adds a separate post-generation layer for format rules only

### Integration Points
- SKILL.md Step 1: Replace "ask user for topic" with auto-discovery + confirmation flow when `$ARGUMENTS` is empty
- SKILL.md between Step 5 and Step 6: Insert validation step — check output before writing to disk
- SKILL.md Step 6: After writing output, append entry to `output/topic-log.json`
- SKILL.md Step 7: Add validation result to terminal summary

</code_context>

<specifics>
## Specific Ideas

- Confirmation prompt should feel lightweight: "Today's topic: [X] (covered by Nature News, ScienceDaily). Proceed?" — one interaction, then fully hands-off
- The diversity log at `output/topic-log.json` doubles as a content calendar — user can glance at it to see what's been covered
- Validation warnings in the output file should be visually distinct (e.g., a clearly marked section at the very top) so user can't miss them

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-validation-and-auto-topic*
*Context gathered: 2026-03-16*
