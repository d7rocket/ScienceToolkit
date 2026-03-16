# Phase 4: Validation and Auto-Topic - Research

**Researched:** 2026-03-16
**Domain:** Claude skill instruction engineering — RSS topic discovery, JSON log persistence, post-generation format validation
**Confidence:** HIGH (all findings derived from existing codebase and established patterns in this project)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Topic discovery method:**
- Scan the 4 news RSS feeds (ScienceDaily, Phys.org, Nature News, Ars Technica) for today's articles — reuses Phase 2's existing source channels
- Do NOT include arXiv/PubMed in discovery scan — academic APIs need specific search terms, better used after topic is chosen for deep sourcing
- Rank candidates by cross-source frequency: a topic appearing in multiple feeds ranks higher than a single-feed story
- Fallback: if RSS scan returns no strong candidates, fall back to WebSearch "trending science news today"

**Diversity tracking:**
- Log file: `output/topic-log.json` — each entry records `{date, topic, field, slug}`
- 14-day dedup window: if a proposed auto-topic matches a recent entry, silently skip it and pick the next-highest-ranked candidate. Log the skip in terminal output.
- Track topic repeats only — no field rotation. Biology dominating 3 days running is fine.
- Manual topic override (`/science CRISPR`): warn "Note: CRISPR was covered on 2026-03-12" but proceed anyway

**Format validation:**
- Validate hard format rules only: caption <= 2100 chars, exactly 5 hashtags, slide count 5-7, all slides have `## Slide N:` labels, every citation has a peer-review label and URL line
- Do NOT re-check content quality rules (cliff-hangers, keyword in first sentence, glosses) — Phase 3 self-checks handle those
- On violation: write the output file anyway but prepend a warning section at the top listing each violation
- Validation reporting: print pass/fail in terminal summary (Step 7) AND add a Validation section at top of output .md file if any violations found
- Source URL checking: format-only (check fields are present). Don't re-fetch URLs.

**No-topic UX flow:**
- `/science` with no argument: auto-discover topic via RSS scan, then show confirmation: "Today's topic: CRISPR cancer trial results (covered by Nature News, ScienceDaily, arXiv). Proceed?"
- If user rejects: show #2 and #3 ranked alternatives. If all rejected, ask for manual topic input.
- `/science [topic]` with explicit topic: still confirm (keep Phase 1 behavior). Diversity warning appears here if recently covered.
- Confirmation is the single interaction point — after that, run is fully automated.

### Claude's Discretion
- Exact RSS parsing logic for extracting topic candidates from feed items
- How to normalize topic names for dedup matching (fuzzy vs exact)
- Threshold for "strong candidate" vs triggering WebSearch fallback
- Exact wording of validation warning section in output files
- How to handle edge case where all top candidates were covered recently (expand to next-best or widen date window)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOPIC-01 | Skill auto-picks a trending/recent science topic across all fields | RSS discovery pattern, cross-feed frequency ranking, WebSearch fallback, UX confirmation flow |
| TOPIC-02 | Skill tracks recently covered topics/fields and avoids repetition within 14 days | JSON log schema, 14-day window dedup, skip-and-pick-next logic, diversity warning for manual overrides |
</phase_requirements>

---

## Summary

Phase 4 adds two behavioral layers to an existing Claude skill written as a Markdown instruction file (SKILL.md). The skill has no traditional runtime — it IS the instructions that Claude Code executes. All implementation is instruction engineering: modify/extend the natural language rules in SKILL.md, add a new JSON log file, and add a new `output/topic-log.json` persistence step.

The phase has two distinct sub-problems. First, auto-topic discovery: when `$ARGUMENTS` is empty, scan the same 4 RSS feeds already used in Phase 2 Step 4 Phase A (ScienceDaily, Phys.org, Nature News, Ars Technica) without a known topic query, extract noun-phrase candidates from article titles, rank by cross-feed frequency, deduplicate against the 14-day log, and present the top candidate for user confirmation. Second, format validation: after Step 5 generates content, mechanically check 5 hard format rules before writing to disk — if violations exist, write anyway but prepend a structured warning section.

The key insight for planning: this phase modifies SKILL.md in three specific places (Step 1, between Step 5 and Step 6, Step 6, Step 7) and adds one new file (`output/topic-log.json`). There is no new code, no new files beyond the log, and no new tools — all existing tools (Read, Write, WebFetch, WebSearch, Bash) are already declared in the skill's `allowed-tools` field.

**Primary recommendation:** Write the phase as two sequential plans — Plan A covers auto-topic discovery + diversity log (TOPIC-01, TOPIC-02), Plan B covers format validation — so each change to SKILL.md can be smoke-tested independently before the next is added.

---

## Standard Stack

### Core (this project)
| Component | Location | Purpose |
|-----------|----------|---------|
| SKILL.md | `.claude/skills/science/SKILL.md` | Primary instruction file — all changes go here |
| output-sample.md | `examples/output-sample.md` | Format contract — validation rules check against this structure |
| topic-log.json | `output/topic-log.json` | New: diversity tracking log, one JSON object per line or a JSON array |
| prompts/system.md | `.claude/skills/science/prompts/system.md` | Grounding rules — no changes needed in this phase |

### RSS Feed URLs (already established in Phase 2)
| Feed | URL | Already in SKILL.md? |
|------|-----|---------------------|
| ScienceDaily | `https://www.sciencedaily.com/rss/all.xml` | Yes (Step 4 Phase A) |
| Phys.org | `https://phys.org/rss-feed/science-news/` | Yes (Step 4 Phase A) |
| Nature News | `https://www.nature.com/nature.rss` | Yes (Step 4 Phase A) |
| Ars Technica | WebSearch `site:arstechnica.com/science` (RSS-equivalent) | Yes (Step 4 Phase A) |

**No new dependencies or installation steps required.** All tools already declared in SKILL.md `allowed-tools`.

---

## Architecture Patterns

### SKILL.md Modification Map

Four insertion points, two net-new sections, two extensions:

```
SKILL.md (current)                   SKILL.md (after Phase 4)
─────────────────                    ──────────────────────────
Step 1: Confirm topic            →   Step 1: AUTO-DISCOVER or Confirm topic
  (ask user if $ARGS empty)           - If $ARGS empty: RSS scan → rank → dedup → confirm
  (confirm if $ARGS provided)         - If $ARGS provided: dedup warn + confirm (existing)

Step 2: Load grounding rules     →   (unchanged)
Step 3: Load format reference    →   (unchanged)
Step 4: Fetch source material    →   (unchanged)
Step 5: Generate carousel output →   (unchanged)

[NEW STEP 5.5]                   →   Step 5.5: Validate format
                                      - 5 hard checks
                                      - Collect violations list

Step 6: Write output file        →   Step 6: Write output file (extended)
                                      - Prepend validation warning section if violations
                                      - Append entry to output/topic-log.json

Step 7: Print terminal summary   →   Step 7: Print terminal summary (extended)
                                      - Add validation pass/fail line
```

### Pattern 1: RSS Discovery Without a Known Topic

**What:** Fetch all 4 feeds in parallel (no topic filter), extract candidate topics from article titles, rank by cross-feed frequency.
**When to use:** Step 1, when `$ARGUMENTS` is empty.

**Instruction pattern (for SKILL.md):**
```
Fetch all 4 RSS feeds simultaneously (parallel WebFetch calls):
- https://www.sciencedaily.com/rss/all.xml
- https://phys.org/rss-feed/science-news/
- https://www.nature.com/nature.rss
- WebSearch "site:arstechnica.com/science [current year]" (no topic filter)

From each feed, extract the titles of the 5 most recent items (published within
the last 48 hours where pubDate is available; otherwise take the top 5 items).

From the collected titles, identify 3-5 candidate topics by extracting the
primary subject noun phrase from each title. Normalize to a short label
(2-5 words). Example: "Scientists discover new CRISPR variant targeting
antibiotic resistance" → "CRISPR antibiotic resistance".

Count how many feeds mention each candidate (by semantic overlap, not exact
match). Sort candidates descending by cross-feed count, then by recency.

"Strong candidate" threshold: 2+ feeds mention the same topic. If no topic
appears in 2+ feeds, all candidates are weak — fall back to WebSearch
"trending science news today [CURRENT_YEAR]" and extract the top 3 results
as candidates ranked by recency.
```

**Why this works:** It reuses the existing WebFetch calls from Step 4 Phase A (same URLs), so Claude is already familiar with these feed structures from the Phase 2 implementation. No new parsing logic is introduced.

### Pattern 2: Topic Deduplication Against JSON Log

**What:** Before confirming a topic, check `output/topic-log.json` for coverage within the last 14 days.
**When to use:** Step 1, both auto-discovery and manual topic paths.

**JSON log schema:**
```json
[
  {
    "date": "2026-03-16",
    "topic": "CRISPR antibiotic resistance",
    "field": "Genetics / Synthetic Biology",
    "slug": "crispr-gene-editing"
  }
]
```

**Instruction pattern (for SKILL.md):**
```
Read output/topic-log.json. If the file does not exist, treat it as an
empty array — do NOT fail.

For each candidate topic (in ranked order):
  - Compare it against all log entries where `date` is within the last 14
    calendar days (calculate from today's date).
  - Matching rule: a candidate matches a log entry if the candidate's
    normalized label shares 2+ significant words with the log entry's
    `topic` field (ignore common words: "the", "a", "of", "in", "and",
    "new", "study", "scientists", "researchers").
  - If matched: skip this candidate. Print to terminal:
    "Skipped candidate '[topic]' — covered on [date] (14-day diversity window)."
  - If not matched: this candidate is eligible. Use it.

If ALL candidates are skipped: expand to the next-best ranked candidates
from the RSS scan (candidates 4-8 if available). If still all covered,
widen the match window — accept any candidate not covered in the last 7
days (halve the window). Log to terminal: "All top candidates recently
covered — widened diversity window to 7 days."
```

### Pattern 3: Format Validation (Post-Generation)

**What:** After Step 5 generates content, run 5 mechanical checks against the generated text before writing to disk.
**When to use:** New Step 5.5, between Step 5 and Step 6.

**The 5 checks and their detection logic:**

| Check | Rule | How to Detect in Instruction Text |
|-------|------|----------------------------------|
| Caption length | <= 2100 characters | Count characters in the `## Caption` section text only (not the heading). If > 2100: violation. |
| Hashtag count | Exactly 5 hashtags | Count tokens starting with `#` in the `## Hashtags` section. If not 5: violation. |
| Slide count | 5-7 slides | Count lines matching `^## Slide [0-9]+:` in the generated output. If < 5 or > 7: violation. |
| Slide labels | All slides labeled | Every slide must match `## Slide N: [Title]` pattern. Check that each slide heading follows this format exactly. |
| Citation completeness | Every citation has peer-review label + URL line | In the `## Sources` section, for each numbered source entry: verify a line containing `[Published in:`, `[Preprint`, or `[News article]` is present, AND a line starting with `URL:` is present. |

**Instruction pattern (for SKILL.md):**
```
After generating the carousel output in Step 5, run these 5 checks before
writing to disk. Collect all violations — do not stop at the first one.

CHECK 1 — Caption length:
Count the total characters in the Caption section text (everything between
## Caption and the next --- divider, excluding the heading itself).
Violation if character count > 2100.
Violation message: "Caption exceeds 2100 characters (actual: N chars)."

CHECK 2 — Hashtag count:
Count all tokens beginning with # in the Hashtags section.
Violation if count ≠ 5.
Violation message: "Hashtag count is N — must be exactly 5."

CHECK 3 — Slide count:
Count all headings matching the pattern "## Slide N:" in the output.
Violation if count < 5 or count > 7.
Violation message: "Slide count is N — must be between 5 and 7."

CHECK 4 — Slide label format:
Verify each slide heading follows the pattern "## Slide N: [Title]" where N
is a number. A missing title after the colon or a malformed heading is a
violation.
Violation message: "Slide N heading is malformed or missing title."

CHECK 5 — Citation completeness:
In the Sources section, for each numbered citation entry, verify:
  (a) A line is present containing one of: [Published in:, [Preprint, [News article]
  (b) A line beginning with "URL:" is present
Violation for any citation missing either field.
Violation message: "Citation N is missing [peer-review label / URL line]."
```

**Output handling when violations exist:**
```
If violations list is empty:
  - Proceed to Step 6 normally.
  - Record validation_status = "PASS" for Step 7 summary.

If violations list is non-empty:
  - Proceed to Step 6 anyway — write the file. Do NOT block on violations.
  - Prepend the following section at the very top of the output file,
    before the # [Topic Title] heading:

    > [!WARNING]
    > ## Validation Warnings
    > The following format violations were detected. Review before posting.
    >
    > - [violation message 1]
    > - [violation message 2]
    >
    > ---

  - Record validation_status = "FAIL (N violations)" for Step 7 summary.
```

### Pattern 4: topic-log.json Append (Step 6 Extension)

**What:** After writing the output file, append a new entry to the topic log.
**Instruction pattern (for SKILL.md):**
```
After writing the output file:

Read output/topic-log.json. If the file does not exist, start with an
empty array [].

Append a new entry:
{
  "date": "YYYY-MM-DD",      (today's date)
  "topic": "[topic label]",   (the confirmed topic, normalized 2-5 words)
  "field": "[field]",         (the Field value from the output file header)
  "slug": "[slug]"            (the slug used in the output filename)
}

Write the updated array back to output/topic-log.json.
```

### Pattern 5: Confirmation UX (Step 1 Extension for Auto-Discovery)

**What:** Show the discovered topic with feed attribution, offer alternatives if rejected.
**Instruction pattern (for SKILL.md):**
```
Present the top candidate to the user:
"Today's topic: [topic label] (covered by [Feed1], [Feed2]).
[One sentence of context from the lead article.] Proceed? (y/n)"

If the user confirms: proceed with this topic. Continue to Step 2.

If the user rejects: present candidates #2 and #3 in the same format.
Ask: "Alternatively: (1) [topic2] or (2) [topic3]. Choose 1, 2, or type a different topic."

If the user rejects all or provides a manual topic: use the provided topic.
Apply the dedup check for manual topics (warn but proceed).
```

### Pattern 6: Step 7 Terminal Summary Extension

**Current Step 7 format:**
```
Generating carousel for: [Topic]...
Generated: [Topic]
   Slides: N | Sources: N | Field: [Field]
   -> output/YYYY-MM-DD-[slug].md
```

**Extended Step 7 format:**
```
Generating carousel for: [Topic]...
Generated: [Topic]
   Slides: N | Sources: N | Field: [Field]
   -> output/YYYY-MM-DD-[slug].md
   Validation: PASS  (or: FAIL — 2 violations, see file header)
   Topic log: updated (output/topic-log.json)
```

### Anti-Patterns to Avoid

- **Re-checking Phase 3 content quality rules in validation:** The validation step checks only mechanical format rules. Do not add cliff-hanger quality checks, inline gloss checks, or keyword gate to Step 5.5 — those are handled by Phase 3 self-check clauses already in Step 5 Rules 2 and 3. Duplication causes verbose output and contradictory failure modes.
- **Blocking writes on validation violations:** The decision is to write-and-warn, not write-and-block. The user reviews output before posting — they need the file to exist so they can fix it.
- **Fetching all 4 RSS feeds sequentially in Step 1:** RSS discovery must use parallel WebFetch calls (same as Step 4 Phase A pattern) to keep latency low. Sequential fetches would add 4-8 seconds.
- **Hard exact-string matching for dedup:** Topic names from different feeds will be phrased differently. "CRISPR antibiotic resistance" and "CRISPR beats drug-resistant bacteria" are the same topic. Dedup must use significant-word overlap (2+ shared nouns/verbs after stop-word removal), not exact string equality.
- **Failing when topic-log.json doesn't exist:** The log file won't exist on first run. Step 1 and Step 6 must both handle the missing-file case gracefully (treat as empty array).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| RSS parsing | Custom XML parser | WebFetch already handles RSS XML — extract titles/descriptions from the fetched text directly in instructions |
| JSON persistence | Bash jq pipeline | Read tool to load JSON, Write tool to write back the updated array — simpler and consistent with skill tool usage |
| Character counting | External script | Claude counts characters in its response before writing — already established pattern (Phase 3 Rule 3 caption ceiling) |
| Cross-feed topic matching | Algorithmic cosine similarity | Semantic overlap instruction — Claude already does this for cross-source matching in Phase 2 Phase C |

**Key insight:** This is a Claude skill, not a program. "Implementation" means writing clear natural-language instructions. The "algorithm" for matching, ranking, and dedup is Claude's comprehension of the instructions. Keep instructions precise and testable, not code-like.

---

## Common Pitfalls

### Pitfall 1: Step 1 Instruction Ambiguity Between Auto and Manual Paths
**What goes wrong:** SKILL.md Step 1 currently has two behaviors (ask for topic if empty, confirm if provided). Adding auto-discovery creates a third branch. If the branching logic is written ambiguously, Claude may apply the wrong flow — e.g., asking the user for a topic even when auto-discovery should have run.
**Why it happens:** Natural language `if/else` is less unambiguous than code. "If no topic was provided" needs to be rewritten as a precise three-branch decision tree.
**How to avoid:** Write Step 1 as an explicit decision table with three clearly labeled cases: (A) `$ARGUMENTS` is empty → run auto-discovery, (B) `$ARGUMENTS` is a topic → check dedup, then confirm, (C) user rejection → present alternatives. Each branch terminates with "then proceed to Step 2" so the next step is unambiguous.
**Warning signs:** During smoke test, the skill asks for user input on `/science` (no args) instead of running RSS discovery.

### Pitfall 2: topic-log.json Write Overwrites the Array
**What goes wrong:** If Step 6 instruction says "write the entry to output/topic-log.json" without specifying to append to the existing array, Claude may write only the new entry — destroying all previous log history.
**Why it happens:** Write tool overwrites files. The instruction must explicitly say: Read first, append to array, write back the full array.
**How to avoid:** Step 6 instruction must follow the Read → mutate → Write pattern explicitly. Check: does the instruction say "Read output/topic-log.json first"?
**Warning signs:** After two runs, topic-log.json contains only the most recent entry.

### Pitfall 3: Validation Checks Run on Section Headings, Not Section Content
**What goes wrong:** Caption character count includes the `## Caption` heading and divider lines, inflating the count. Hashtag count picks up `#` symbols in slide headings or image URLs.
**Why it happens:** Instructions like "count characters in the Caption section" are ambiguous about boundaries.
**How to avoid:** Validation instructions must specify: "Caption text = all content between `## Caption` and the next `---` divider, excluding the `## Caption` heading line itself." Similarly for hashtags: "count only tokens beginning with `#` that appear as standalone hashtag tokens (no spaces within the token) on lines in the Hashtags section."
**Warning signs:** Validation reports caption as 2150 chars when it should be 2050.

### Pitfall 4: Dedup Match Too Aggressive (False Positives)
**What goes wrong:** "Mars mission" and "Mars climate research" share "Mars" — overly aggressive matching skips a legitimately different topic.
**Why it happens:** Single-word overlap matching is too broad for short topic labels.
**How to avoid:** The 2+ significant words rule (after stop-word removal) handles this. "Mars mission" and "Mars climate research" share only "Mars" — 1 significant word — and would NOT be deduped. "CRISPR gene therapy" and "CRISPR gene editing" share "CRISPR" and "gene" — 2 significant words — and WOULD be deduped. The instruction must specify the stop-word list (or characterize it as: numbers, articles, common verbs like "find", "show", "reveal", "discover").
**Warning signs:** Smoke test topics like "quantum computing" get deduped against "quantum entanglement" because they share "quantum".

### Pitfall 5: Validation Warning Section Breaks Downstream Output Parsing
**What goes wrong:** If the warning section is injected inside the main content structure (e.g., between slides) rather than at the very top, it may corrupt the carousel output visually.
**Why it happens:** "Prepend" is ambiguous if the instruction doesn't specify "before the first line of the file."
**How to avoid:** Instruction must say: "Insert the validation warning block as the very first content in the file, before the `# [Topic Title]` heading." Using a GitHub-flavored Markdown callout block (`> [!WARNING]`) makes it visually distinct and clearly not part of the carousel.
**Warning signs:** User sees the warning in the middle of the output or it appears as a slide heading.

### Pitfall 6: RSS Feed Fetch in Step 1 Duplicates Step 4 Phase A
**What goes wrong:** If auto-discovery in Step 1 fetches RSS feeds, then Step 4 Phase A fetches the same feeds again for sourcing, the skill makes 8 RSS fetches instead of 4.
**Why it happens:** Step 1 (discovery) and Step 4 Phase A (sourcing) are logically separate but hit the same URLs.
**How to avoid:** The Step 1 discovery fetch is for topic extraction only (titles from last 48 hours, no article body fetch). Step 4 Phase A fetches for source content (full articles filtered by the confirmed topic). These serve different purposes and the duplication is acceptable because the URLs are cached by WebFetch within a session. Document this clearly so the planner does not try to merge them.
**Warning signs:** None — this is expected behavior, not a bug.

---

## Code Examples

### topic-log.json Schema (Verified: defined in CONTEXT.md)

```json
[
  {
    "date": "2026-03-16",
    "topic": "CRISPR antibiotic resistance",
    "field": "Genetics / Synthetic Biology",
    "slug": "crispr-gene-editing"
  },
  {
    "date": "2026-03-15",
    "topic": "James Webb dark matter survey",
    "field": "Astrophysics",
    "slug": "james-webb-dark-matter"
  }
]
```

### Validation Warning Block Format (in output .md file)

```markdown
> [!WARNING]
> ## Validation Warnings
> The following format violations were detected in this output. Review before posting.
>
> - Caption exceeds 2100 characters (actual: 2243 chars)
> - Citation 3 is missing peer-review label
>
> ---

# Topic Title
**Date:** 2026-03-16 | **Field:** ...
```

### Step 7 Terminal Summary (Extended)

```
Generating carousel for: CRISPR antibiotic resistance...
Generated: CRISPR antibiotic resistance
   Slides: 6 | Sources: 5 | Field: Genetics / Synthetic Biology
   -> output/2026-03-16-crispr-antibiotic-resistance.md
   Validation: FAIL — 1 violation (see file header)
   Topic log: updated (output/topic-log.json)
```

### Step 1 Decision Table (Structural Pattern)

```
IF $ARGUMENTS is empty:
  → Run auto-discovery (RSS scan → rank → dedup → show candidate → confirm)
  → [If confirmed] proceed to Step 2 with discovered topic
  → [If rejected] offer alternatives #2, #3
  → [If all rejected] ask for manual topic input

IF $ARGUMENTS is not empty:
  → Check topic-log.json for 14-day coverage
  → [If found] warn: "Note: [topic] was covered on [date]. Proceeding anyway."
  → Show confirmation: "Topic: [topic]. Today's date: [date]. Proceed?"
  → [If confirmed] proceed to Step 2
  → [If rejected] ask for alternative topic
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual smoke test (no automated test runner — Claude skill, not a program) |
| Config file | None |
| Quick run command | `/science` (no args) — observe auto-discovery flow |
| Full suite command | Run 3 scenarios: (1) `/science` no args, (2) `/science [topic]` with topic in log, (3) `/science [topic]` with topic not in log |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | How to Verify |
|--------|----------|-----------|---------------|
| TOPIC-01 | Auto-pick runs RSS scan and presents topic when `$ARGUMENTS` empty | Manual smoke | Run `/science` with no args; verify skill shows "Today's topic: X (covered by Feed1, Feed2). Proceed?" |
| TOPIC-01 | Cross-feed frequency ranking: multi-feed topic ranks above single-feed | Manual smoke | Confirm the presented topic is one that appeared in multiple feeds, not an obscure single-feed item |
| TOPIC-01 | WebSearch fallback triggers if RSS scan returns no strong candidates | Manual smoke (hard to trigger) | Inject scenario where all feeds return unrelated items; verify WebSearch triggers |
| TOPIC-02 | topic-log.json created on first run with correct schema | Manual smoke | Run `/science` and inspect `output/topic-log.json` |
| TOPIC-02 | 14-day dedup: topic in log is skipped, next candidate selected | Manual smoke | Pre-populate `output/topic-log.json` with today's date and a candidate topic; run `/science`; verify that topic is skipped and alternative shown |
| TOPIC-02 | Manual topic override warns but proceeds | Manual smoke | Run `/science [topic-in-log]`; verify warning message appears but generation continues |
| TOPIC-01 + TOPIC-02 | topic-log.json persists across multiple runs (append not overwrite) | Manual smoke | Run `/science` twice; verify log has 2 entries |
| Validation | PASS reported when output is clean | Manual smoke | Normal run; verify Step 7 shows "Validation: PASS" |
| Validation | FAIL with violations prepended to file | Manual smoke | Craft a scenario where caption is over 2100 chars; verify warning section appears at top of .md file |

### Sampling Rate

- **Per plan commit:** Run `/science` with no args, confirm flow works end-to-end
- **Per wave merge:** Run all 3 scenarios above
- **Phase gate:** All 3 scenarios pass before `/gsd:verify-work`

### Wave 0 Gaps

None — no test files needed. This is a Claude skill (Markdown instruction file), not a program. Testing is manual invocation and output inspection.

---

## State of the Art

| Old Approach (Phase 1) | New Approach (Phase 4) | Impact |
|-----------------------|----------------------|--------|
| Step 1 asks user for topic when `$ARGUMENTS` empty | Step 1 auto-discovers topic from RSS feeds | Skill becomes hands-off for daily use |
| No topic history tracking | `output/topic-log.json` records every run | 14-day diversity window prevents repetition |
| Output written without post-generation checks | Validation step checks 5 format rules before writing | Format violations surface before user reviews |
| Step 7 summary: 3 lines | Step 7 summary: 5 lines (adds validation result, log update) | User gets immediate pass/fail signal |

---

## Open Questions

1. **How to handle the Ars Technica WebSearch in discovery mode**
   - What we know: Ars Technica uses `WebSearch "site:arstechnica.com/science [TOPIC] [YEAR]"` in Phase 2 because there is no RSS feed. In auto-discovery, there is no topic to inject.
   - What's unclear: What query to use for Ars Technica in discovery mode. `site:arstechnica.com/science [CURRENT_YEAR]` (no topic) may return too many or too few results.
   - Recommendation: Use `WebSearch "site:arstechnica.com/science science news [CURRENT_YEAR]"` for discovery — broad enough to return recent items, site-scoped to avoid noise. Treat the first 3-5 results as discovery candidates. This is at Claude's discretion (left open in CONTEXT.md).

2. **topic-log.json: array format vs newline-delimited JSON**
   - What we know: CONTEXT.md specifies `{date, topic, field, slug}` per entry. No format specified.
   - What's unclear: JSON array (Read, parse, append, Write full array) vs one JSON object per line (append a line). Array is more human-readable; NDJSON is simpler to append.
   - Recommendation: Use a standard JSON array. The Read/Write approach (read full file, append to array, write back) is explicit, readable, and consistent with how Claude handles JSON in other skill steps. Total file size after 14 entries is trivially small.

3. **"Field" value for topic-log.json entry**
   - What we know: The `field` in the output file header (e.g., `**Field:** Genetics / Synthetic Biology`) is determined during content generation in Step 5, after the log entry would ideally be written.
   - What's unclear: Does Step 6 append the log entry before knowing the field (from Step 1 data) or after (from Step 5 output)?
   - Recommendation: Append the log entry in Step 6 AFTER writing the output file. At that point, the field is known from the generated `**Field:**` header line. The slug is also known. This is the natural order — Step 6 already has access to everything needed.

---

## Sources

### Primary (HIGH confidence)
- `.claude/skills/science/SKILL.md` — Complete skill instruction file, all step definitions, RSS feed URLs, allowed-tools
- `examples/output-sample.md` — Canonical format contract; validation check targets derived from this
- `.planning/phases/04-validation-and-auto-topic/04-CONTEXT.md` — All locked decisions, integration points, and discretion areas
- `.planning/phases/02-source-fetching/02-CONTEXT.md` — RSS feed list and Phase 2 fetch patterns

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Accumulated project decisions; Phase 3 self-check patterns confirmed here
- `.planning/REQUIREMENTS.md` — TOPIC-01, TOPIC-02 definitions

### Tertiary (LOW confidence)
- None — all findings are grounded in existing project files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components already exist in the project
- Architecture patterns: HIGH — integration points explicitly defined in CONTEXT.md, instruction patterns derived from established SKILL.md conventions
- Pitfalls: HIGH — derived from Phase 3 post-mortem patterns (self-check clause evolution) and SKILL.md instruction engineering experience

**Research date:** 2026-03-16
**Valid until:** Stable — this phase's scope is fully bounded by CONTEXT.md locked decisions. Changes only if SKILL.md structure changes in Phase 3 hotfixes.
