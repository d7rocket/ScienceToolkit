# Phase 1: Skill Scaffold - Research

**Researched:** 2026-03-15
**Domain:** Claude Code Skills architecture, markdown output format contracts, Instagram content format
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Output file format**
- File naming: `output/YYYY-MM-DD-[slug].md`
- Metadata at top as markdown header block: `# Topic Title` followed by `**Date:** ... | **Field:** ... | **Sources:** N`
- Horizontal rule separates metadata from slides
- Section order: Slides → Caption → Hashtags → Sources → Images
- Slides labeled as H2 headings with number and descriptive title: `## Slide N: Title`
- Sources formatted as numbered list with full APA citations — each entry has authors, title, journal, year, DOI (where available), URL, and peer-review status label on separate lines

**Slide structure rules**
- ~150 characters per slide (2-3 short sentences, punchy and scannable)
- 5-7 slides per carousel
- Slide 1 is the hook: under 10 words, question or surprising fact
- Every body slide (2 through N-1) ends with a cliff-hanger or question to encourage swiping
- Final slide: key takeaway in one line + call-to-action (e.g., "Follow for daily science drops")
- Strategic emoji allowed: hook slide and final CTA slide can use emoji, body slides stay clean text

**Skill invocation flow**
- Skill files live in `skills/science/` directory (system.md, instructions, supporting files)
- Output written to `output/` at project root
- `/science [topic]` accepts a topic argument; in Phase 1, generates with placeholder/fabricated sources
- Brief confirmation before generating: shows topic and asks to confirm before writing
- After generating, prints summary to terminal: topic, slide count, source count, field, and file path (not full content)

**Sample output spec**
- Topic: James Webb Space Telescope discovery
- 6 slides (hook + 4 body + takeaway/CTA)
- Source mix: 2 academic (1 published paper + 1 preprint with [Preprint] label) + 1 news article
- File: `examples/output-sample.md` — demonstrates the exact section structure and all citation variants
- This sample is the format contract that all downstream phases must match

### Claude's Discretion
- Exact system prompt wording for grounding enforcement (FETCH-03)
- Internal file structure within `skills/science/`
- Error message wording
- Confirmation prompt phrasing

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FETCH-03 | All generated content is grounded in actually-fetched source material only — no LLM-memory citations | System prompt must contain an explicit grounding instruction prohibiting memory-based citations; enforced via `prompts/system.md` |
| CONT-07 | Output is clean plain text, copy-paste ready, with clearly labeled sections | Output format contract defined as a markdown template with H2-labeled sections; sample output at `examples/output-sample.md` is the canonical reference |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield scaffold phase — no existing code, no existing dependencies. The deliverable is structural: a working Claude Code skill directory that can be invoked via `/science`, a formal output format contract, and a fabricated sample output that acts as the permanent format reference for all downstream phases.

The primary technical domain is **Claude Code Skills architecture**. Understanding the correct directory layout, SKILL.md frontmatter, and how arguments are passed is the entire implementation challenge for this phase. There is no computation, no API calls, and no real content generation in Phase 1. All content in Phase 1 is fabricated/placeholder to demonstrate the format contract.

The secondary domain is **Instagram output format specification** — defining the exact markdown structure that will be copy-paste ready for Instagram carousels. The format decisions are already locked in CONTEXT.md. Research confirms those decisions align with Instagram platform constraints (2,200-char caption max, 5-hashtag recommendation).

**Primary recommendation:** Create the skill at `.claude/skills/science/SKILL.md` (project-level), not at `skills/science/` as noted in CONTEXT.md — the Claude Code standard path is `.claude/skills/`. Resolve this discrepancy in planning. The sample output at `examples/output-sample.md` should be built FIRST as it is the format anchor.

---

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| Claude Code Skills | Current | Skill invocation via `/science` | Native mechanism; `.claude/skills/<name>/SKILL.md` is the official standard |
| Markdown (.md files) | — | Output format and skill instructions | Plain text, copy-paste ready, no dependencies |
| YAML frontmatter | — | Skill metadata (name, description, argument-hint, disable-model-invocation) | Required by Claude Code skill spec |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `$ARGUMENTS` substitution | Built-in | Pass topic string from `/science [topic]` to skill | Required for topic argument |
| `${CLAUDE_SKILL_DIR}` | Built-in | Reference supporting files relative to skill directory | Use in SKILL.md to load supporting files |
| `disable-model-invocation: true` | Frontmatter flag | Prevent Claude from auto-triggering the skill | Required — this is a user-triggered workflow with side effects |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `.claude/skills/science/` | `.claude/commands/science.md` | Commands are the legacy mechanism; skills are preferred and support supporting files, frontmatter, and directory structure |
| Project-level skill (`.claude/skills/`) | Personal skill (`~/.claude/skills/`) | Personal skills are not committed to the repo; project-level skills travel with the project and are version-controlled |

**Installation:**

No npm/pip installation. This is pure filesystem structure with markdown files.

---

## Architecture Patterns

### Recommended Project Structure

```
ScienceToolkit/
├── .claude/
│   └── skills/
│       └── science/
│           ├── SKILL.md          # Skill entrypoint — frontmatter + invocation instructions
│           ├── prompts/
│           │   └── system.md     # Grounding enforcement prompt (FETCH-03)
│           └── format/
│               └── output-spec.md  # Output format reference (optional supporting file)
├── examples/
│   └── output-sample.md          # Canonical format contract (BUILD FIRST)
└── output/
    └── YYYY-MM-DD-[slug].md      # Generated carousel packages (gitignored or committed)
```

**Important note on path discrepancy:** CONTEXT.md states skill files live in `skills/science/` (project root). The Claude Code standard is `.claude/skills/science/`. The planner should resolve this — `.claude/skills/` is the correct path for project-level skills that Claude Code will discover automatically.

### Pattern 1: Skill Entrypoint (SKILL.md)

**What:** The SKILL.md file is the single required file. It contains YAML frontmatter that configures invocation behavior, then markdown instructions Claude follows when the skill is invoked.

**When to use:** Always — this is the required entrypoint for any Claude Code skill.

**Example:**
```yaml
# Source: https://code.claude.com/docs/en/slash-commands
---
name: science
description: Generate an Instagram carousel package for a science topic. Fetches source material, writes carousel slides, caption, hashtags, and citations.
argument-hint: [topic]
disable-model-invocation: true
allowed-tools: Read, Write, WebFetch, WebSearch
---

Generate an Instagram science carousel for: $ARGUMENTS

## Step 1: Confirm topic
Show the user the topic and ask them to confirm before proceeding.

## Step 2: Load grounding rules
Read the grounding enforcement prompt at ${CLAUDE_SKILL_DIR}/prompts/system.md
and apply all rules throughout generation.

## Step 3: Generate carousel output
[Instructions for Phase 1 scaffold — fabricated sources]

## Step 4: Write output
Write the carousel package to output/YYYY-MM-DD-[slug].md

## Step 5: Print terminal summary
Print a summary in this format:
  Generated: [Topic]
     Slides: N | Sources: N | Field: [Field]
     -> output/YYYY-MM-DD-[slug].md
```

### Pattern 2: Output File Format Contract

**What:** The markdown file written to `output/` is the interface between this skill and downstream phases, and between the skill and the user. Its format is locked.

**When to use:** Every time the skill generates carousel content.

**Canonical structure:**
```markdown
# [Topic Title]

**Date:** YYYY-MM-DD | **Field:** [Science Field] | **Sources:** N

---

## Slide 1: [Hook Title]

[Hook text — under 10 words, question or surprising fact]

## Slide 2: [Body Title]

[Body text — ~150 chars, 2-3 sentences. Ends with cliff-hanger or question.]

...

## Slide N: [Takeaway Title]

[Key takeaway in one line + CTA, e.g., "Follow for daily science drops"]

---

## Caption

[400-600 words, keyword in first sentence, casual + authoritative tone]

---

## Hashtags

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5

---

## Sources

1. Author, A. A., & Author, B. B. (Year). Title of article. *Journal Name*, *Volume*(Issue), pages.
   DOI: https://doi.org/...
   URL: https://...
   [Published in: Journal, Year]

2. Author, C. C. (Year). Title of preprint. *arXiv*.
   URL: https://arxiv.org/abs/...
   [Preprint - not peer reviewed]

3. Author, D. D. (Year, Month Day). Title of news article. *Publication Name*.
   URL: https://...
   [News article]

---

## Images

- https://[source-image-url-1]
- https://[source-image-url-2]
```

### Pattern 3: Grounding Enforcement (system.md)

**What:** A supporting file loaded by the skill that contains the system prompt instruction prohibiting LLM-memory citations (FETCH-03).

**When to use:** Loaded at the start of every skill invocation.

**Example content for `prompts/system.md`:**
```markdown
## Content Grounding Rules

CRITICAL: All content generated in this session MUST be grounded in the fetched
source material from this session only. You are explicitly prohibited from:

- Citing papers, studies, or findings from your training memory
- Inventing or hallucinating author names, DOIs, journal names, or publication dates
- Using any factual claim that cannot be traced to content fetched in this session

Every citation must include information that was explicitly present in the fetched
source. If you did not fetch a source URL, you cannot cite it.

In Phase 1 (scaffold), fabricated/placeholder sources are permitted ONLY in the
examples/output-sample.md file, which is a format demonstration, not real content.
```

### Pattern 4: Sample Output as Format Contract

**What:** `examples/output-sample.md` is a fabricated example that demonstrates every element of the format spec. It is the format contract downstream phases must match.

**When to use:** Build this FIRST in Phase 1 before writing SKILL.md instructions. All subsequent phases validate their output against this structure.

**Required content per CONTEXT.md:**
- Topic: James Webb Space Telescope discovery
- 6 slides: hook + 4 body slides + takeaway/CTA slide
- Sources: 2 academic (1 published paper `[Published in: Journal, Year]` + 1 preprint `[Preprint - not peer reviewed]`) + 1 news article `[News article]`
- Demonstrates: metadata block, HR separator, all section headers, all citation variants

### Anti-Patterns to Avoid

- **Putting skill files at project root `skills/`:** Claude Code only discovers skills in `.claude/skills/`. A skill at `skills/science/` will not be invocable via `/science`.
- **Omitting `disable-model-invocation: true`:** Without this, Claude may auto-trigger the skill mid-conversation when science topics come up, writing unwanted output files.
- **Writing full carousel content to terminal:** The summary step should print metadata only (topic, slide count, source count, field, file path). Full content goes to the file only.
- **Building instructions before the sample output:** The sample output is the format anchor. Write it first, then write SKILL.md instructions that reference it.
- **Using personal skill path (`~/.claude/skills/`):** Personal skills are not version-controlled. Project skills in `.claude/skills/` travel with the repo.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skill invocation mechanism | Custom shell script or alias | Claude Code's built-in skill system | Skills are natively invocable via `/name`, handle arguments, and support frontmatter configuration out of the box |
| Date formatting for filenames | Custom date logic in instructions | Tell Claude to use today's date in YYYY-MM-DD format | Claude knows the current date; no tooling needed |
| Argument parsing | Positional argument parsing logic | `$ARGUMENTS` substitution | Built-in; everything after `/science` becomes `$ARGUMENTS` automatically |

**Key insight:** Phase 1 is entirely markdown files and directory structure. There is no code to write. The complexity is in the format specification and instruction clarity, not in any technical implementation.

---

## Common Pitfalls

### Pitfall 1: Wrong Skill Directory Path

**What goes wrong:** Skill files placed at `skills/science/` (project root) instead of `.claude/skills/science/`. The `/science` command does not appear in Claude Code.

**Why it happens:** CONTEXT.md refers to "skills/science/ directory" without the `.claude/` prefix. This may reflect a project convention decision or a typo.

**How to avoid:** Create the directory at `.claude/skills/science/`. This is the path Claude Code auto-discovers for project-level skills. If the project prefers `skills/` at root for organizational reasons, the planner must add an explicit note that Claude Code requires the `.claude/skills/` path for skill invocation.

**Warning signs:** Running `/science` in Claude Code returns "command not found" or the command does not appear in the `/` autocomplete menu.

### Pitfall 2: Claude Auto-Triggering the Skill

**What goes wrong:** Without `disable-model-invocation: true`, Claude loads and executes the skill automatically when the user discusses science topics, writing output files unexpectedly.

**Why it happens:** By default, Claude loads skills whose description matches the conversation context.

**How to avoid:** Add `disable-model-invocation: true` to SKILL.md frontmatter. This is essential for any skill with file write side effects.

**Warning signs:** Output files appear in `output/` without the user explicitly running `/science`.

### Pitfall 3: Sample Output Built After Instructions

**What goes wrong:** SKILL.md instructions are written referencing a format that hasn't been formally defined yet, leading to inconsistencies between what the instructions describe and what the sample demonstrates.

**Why it happens:** Natural tendency to write the skill first, then the example.

**How to avoid:** The STATE.md decision log explicitly records: "Output contract before instructions — `examples/output-sample.md` must be built first in Phase 1 to anchor all downstream generation phases." Build the sample first, then write instructions that explicitly reference it.

**Warning signs:** The sample output and the SKILL.md instructions describe subtly different section orders, citation formats, or slide count ranges.

### Pitfall 4: Grounding Rule Applied Only to Phase 1

**What goes wrong:** The system prompt in `prompts/system.md` is written to be specific to Phase 1's placeholder mode rather than as a permanent, phase-agnostic grounding rule.

**Why it happens:** The temptation to write "use fabricated sources for now" instead of the permanent rule.

**How to avoid:** Write `prompts/system.md` as the permanent grounding rule from day one. Add a conditional note for Phase 1 only that explicitly states fabricated sources are allowed *only* in `examples/output-sample.md` as a format demonstration, not in `output/` files.

**Warning signs:** Phase 2 or 3 needs to rewrite `prompts/system.md` because Phase 1's version permitted memory citations.

### Pitfall 5: Caption Length Not Validated in Sample

**What goes wrong:** The sample output caption is not counted for character length, and it exceeds 2,100 characters. Phase 4's validation step will flag all output as invalid when it checks the cap.

**Why it happens:** Markdown files are written by feel, not measured.

**How to avoid:** Count the caption characters in `examples/output-sample.md` during creation. Instagram cap is 2,200 characters; REQUIREMENTS.md targets "under 2100 chars" as the safe limit. Phase 3 targets 400-600 words.

**Warning signs:** Sample output caption is more than ~500 words (rough 400-word = ~2,400 chars; target is 400-600 words = approximately 2,100-3,200 chars — note that 600 words at ~5.5 chars/word ≈ 3,300 chars, which could exceed the cap). The CONTEXT.md says "caption under 2100 chars" which is significantly tighter than 600 words. Resolve this: 2,100 chars / ~5.5 chars per word ≈ 380 words max. The Phase 1 sample must stay under 2,100 characters total caption length.

---

## Code Examples

Verified patterns from official Claude Code documentation:

### Minimal SKILL.md with argument passing
```yaml
# Source: https://code.claude.com/docs/en/slash-commands
---
name: science
description: Generate an Instagram science carousel. Invoke with a topic.
argument-hint: [topic]
disable-model-invocation: true
---

Generate a carousel for: $ARGUMENTS
```

### Loading a supporting file from within a skill
```markdown
# Source: https://code.claude.com/docs/en/slash-commands
## Additional resources

- Grounding rules: read [prompts/system.md](prompts/system.md) before generating any content
- Format reference: see [../../../examples/output-sample.md](../../../examples/output-sample.md)
```

### Using CLAUDE_SKILL_DIR to reference bundled files
```yaml
# Source: https://code.claude.com/docs/en/slash-commands
---
name: science
---

Before generating, read ${CLAUDE_SKILL_DIR}/prompts/system.md and apply all grounding rules.
```

### Terminal summary format (from CONTEXT.md)
```
Generating carousel for: Black Hole Acoustics...
Generated: Black Hole Acoustics
   Slides: 6 | Sources: 3 | Field: Astrophysics
   -> output/2026-03-15-black-hole-acoustics.md
```

### Citation variants required in sample output
```markdown
## Sources

1. Gardner, J. P., et al. (2023). The James Webb Space Telescope Mission. *Publications of the Astronomical Society of the Pacific*, *135*(1048), 068001.
   DOI: https://doi.org/10.1086/723378
   URL: https://iopscience.iop.org/article/10.1086/723378
   [Published in: PASP, 2023]

2. Naidu, R. P., et al. (2022). Two Remarkably Luminous Galaxy Candidates at z ≈ 10-12 Revealed by JWST. *arXiv*.
   URL: https://arxiv.org/abs/2207.09436
   [Preprint - not peer reviewed]

3. Overbye, D. (2022, July 12). Webb Telescope's First Images Show 'Deepest' View of Cosmos Ever Captured. *The New York Times*.
   URL: https://www.nytimes.com/2022/07/12/science/james-webb-space-telescope-images.html
   [News article]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.claude/commands/science.md` (single flat file) | `.claude/skills/science/SKILL.md` (directory + supporting files) | Skills introduced in Claude Code (2025) | Skills support supporting files, frontmatter fields, and subagent context that commands do not |
| No frontmatter in command files | YAML frontmatter in SKILL.md | With skills introduction | Enables `disable-model-invocation`, `allowed-tools`, `argument-hint`, `context: fork` |

**Deprecated/outdated:**
- `.claude/commands/*.md` files: Still functional and backward-compatible, but Skills are the recommended pattern. Skills take precedence over commands with the same name.

---

## Open Questions

1. **Path discrepancy: `skills/science/` vs `.claude/skills/science/`**
   - What we know: CONTEXT.md says "Skill files live in `skills/science/` directory"; Claude Code's standard auto-discovery path is `.claude/skills/<name>/`
   - What's unclear: Whether the user intends a custom path (and will add the directory to `--add-dir`), or if this was informal shorthand for `.claude/skills/science/`
   - Recommendation: Use `.claude/skills/science/` as the canonical path. It is the standard and requires no extra configuration. Note this in the plan for confirmation.

2. **Caption word count vs character limit tension**
   - What we know: Phase 3 targets 400-600 words for the caption. Instagram cap is 2,200 chars. CONT-07 (this phase) requires "caption under 2100 chars." At ~5.5 chars/word, 600 words ≈ 3,300 chars, which exceeds the cap.
   - What's unclear: Whether Phase 3's "400-600 words" is a mistake, or whether the ~5.5 chars/word estimate is too high (shorter words in casual writing).
   - Recommendation: Target the sample output caption at under 2,100 characters (not words). Measure character count when writing the sample. The planner should flag this to Phase 3 as a constraint.

3. **`prompts/system.md` path — inside or outside `.claude/skills/science/`?**
   - What we know: CONTEXT.md references "system prompt instruction in `prompts/system.md`" without specifying the parent directory. The skill can reference files at `${CLAUDE_SKILL_DIR}/prompts/system.md`.
   - What's unclear: Whether the user intends this file to be inside the skill directory or at a top-level `prompts/` directory.
   - Recommendation: Place at `.claude/skills/science/prompts/system.md` (inside the skill directory). This keeps the skill self-contained and uses `${CLAUDE_SKILL_DIR}` for reliable referencing.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no code, no automated tests applicable |
| Config file | N/A |
| Quick run command | Manual: run `/science [topic]` in Claude Code and inspect output |
| Full suite command | Manual: verify `examples/output-sample.md` exists and matches all format rules |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FETCH-03 | Generated content must not cite LLM-memory sources | Manual-only | N/A — requires human review of generated citations | Wave 0 |
| CONT-07 | Output has clearly labeled sections (Slide 1, Slide 2, Caption, Hashtags, Sources) | Manual-only | N/A — inspect `output/` file after invocation | Wave 0 |

**Manual-only justification:** Phase 1 produces markdown files and a skill configuration. There is no executable code, test runner, or programmatic assertion framework applicable. Validation is visual inspection of the output file structure against the format contract in `examples/output-sample.md`.

### Sampling Rate

- **Per task commit:** Visual inspection — does the file match the format spec?
- **Per wave merge:** Full walkthrough — does `/science [topic]` run, confirm, write to disk, and print the terminal summary?
- **Phase gate:** Both FETCH-03 (no memory citations in instructions/sample) and CONT-07 (labeled sections) confirmed before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `.claude/skills/science/SKILL.md` — skill entrypoint (does not exist yet)
- [ ] `.claude/skills/science/prompts/system.md` — grounding enforcement prompt (does not exist yet)
- [ ] `examples/output-sample.md` — canonical format contract (does not exist yet)
- [ ] `output/` — output directory (does not exist yet)

*(All Wave 0 gaps are expected — this is a greenfield project. Phase 1 creates all of them.)*

---

## Sources

### Primary (HIGH confidence)
- [Claude Code Slash Commands / Skills official docs](https://code.claude.com/docs/en/slash-commands) — SKILL.md format, frontmatter fields, directory structure, `$ARGUMENTS`, `${CLAUDE_SKILL_DIR}`, `disable-model-invocation`

### Secondary (MEDIUM confidence)
- [Instagram Character Limit (2026) — Outfy](https://www.outfy.com/blog/instagram-character-limit/) — Instagram 2,200-char caption limit confirmed
- [Instagram Caption Best Practices 2025 — Mash Creative Co.](https://mashcreativeco.com/instagram-post-length-best-practices-2025/) — 5 hashtag recommendation confirmed
- [Claude Code Customization guide — alexop.dev](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/) — Skills vs commands comparison

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified directly from official Claude Code documentation
- Architecture: HIGH — SKILL.md structure from official docs; output format locked in CONTEXT.md
- Pitfalls: HIGH — path discrepancy and caption length issues identified from source analysis, not speculation
- Instagram format constraints: MEDIUM — confirmed from multiple web sources, not official Instagram developer docs

**Research date:** 2026-03-15
**Valid until:** 2026-09-15 (stable; Claude Code skill spec unlikely to change significantly in 6 months)
