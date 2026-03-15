# Architecture Research

**Domain:** Claude Code skill — web research to structured carousel output
**Researched:** 2026-03-15
**Confidence:** HIGH (verified against official Claude Code docs and multiple real-world pipeline examples)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVOCATION LAYER                            │
│  User types: /science [topic?]  →  SKILL.md dispatched          │
├─────────────────────────────────────────────────────────────────┤
│                    ORCHESTRATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               SKILL.md  (entry point)                     │   │
│  │  - Reads $ARGUMENTS (optional topic)                      │   │
│  │  - Branches: auto-topic vs user-topic                     │   │
│  │  - Spawns parallel research subagents                     │   │
│  │  - Collects and deduplicates results                      │   │
│  │  - Delegates to content generation phase                  │   │
│  └──────────────────────────────────────────────────────────┘   │
├──────────────┬──────────────┬──────────────────────────────────┤
│  SOURCE      │  SOURCE      │  SOURCE                           │
│  SUBAGENT A  │  SUBAGENT B  │  SUBAGENT C                       │
│  (News)      │  (Academic)  │  (Trending)                       │
│              │              │                                   │
│  WebFetch:   │  WebFetch:   │  WebSearch:                       │
│  - Nature    │  - arXiv     │  - trending                       │
│  - SciDaily  │  - PubMed    │    science                        │
│  - Ars Tech  │              │    [date]                         │
│  - New Sci   │              │                                   │
└──────┬───────┴──────┬───────┴──────────────┬────────────────────┤
       │              │                      │                    │
├──────▼──────────────▼──────────────────────▼────────────────────┤
│                    PROCESSING LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            SELECTION & SCORING                            │   │
│  │  - Deduplicate across sources (title similarity)          │   │
│  │  - Score: recency × source quality × carousel potential   │   │
│  │  - Pick best 1 candidate (or honour user topic)           │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    GENERATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               CONTENT GENERATOR                           │   │
│  │  - Reads full source article via WebFetch                 │   │
│  │  - Writes 5-7 carousel slide chunks                       │   │
│  │  - Writes Instagram caption (~2200 chars)                 │   │
│  │  - Writes exactly 5 hashtags                              │   │
│  │  - Formats APA/Harvard citations with DOIs                │   │
│  │  - Collects source image URLs                             │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     OUTPUT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Structured Markdown File Written to Disk        │   │
│  │  output/YYYY-MM-DD-[slug].md                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| `SKILL.md` | Entry point, argument parsing, orchestration | YAML frontmatter + markdown instructions |
| `prompts/system.md` | Tone guide, output schema, Instagram constraints | Supporting file, loaded by SKILL.md |
| `prompts/slides.md` | Detailed slide-writing instructions and examples | Supporting file, loaded on generation phase |
| `prompts/citation.md` | Citation format rules (APA, DOI, URL structure) | Supporting file, loaded on generation phase |
| `examples/output-sample.md` | Reference output showing desired format | Supporting file; teaches Claude expected shape |
| News Subagent (inline) | Fetch + parse science news sites | Inline WebFetch calls coordinated by skill |
| Academic Subagent (inline) | Query arXiv and PubMed search APIs | Inline WebFetch calls coordinated by skill |
| Trending Subagent (optional) | Discover trending topics when no topic given | WebSearch call, used only in auto-pick mode |
| Selection Logic | Score and pick the best story | Prose instructions in SKILL.md |
| Content Generator | Transform source material into carousel output | Claude's native generation capability |
| Output Writer | Persist structured markdown to `output/` | Bash write via `!` injection or Claude file write |

---

## Recommended Project Structure

```
.claude/skills/science-carousel/
├── SKILL.md                  # Entry point — frontmatter + orchestration instructions
├── prompts/
│   ├── system.md             # Tone, voice, Instagram format constraints
│   ├── slides.md             # Slide-writing rules (hook, body, cliffhanger patterns)
│   └── citation.md           # APA/Harvard + DOI + URL citation format
├── examples/
│   └── output-sample.md      # One full example of a complete carousel package
└── output/                   # Generated carousel packages land here
    └── .gitkeep
```

### Structure Rationale

- **`SKILL.md` as sole entry point:** Claude Code's skill system requires SKILL.md; all other files are supporting context loaded on demand. Keep it under 500 lines.
- **`prompts/` separated by concern:** `system.md` (voice) is always loaded; `slides.md` and `citation.md` are loaded only during generation to avoid bloating the context during the research phase.
- **`examples/output-sample.md`:** A single concrete example is the most efficient way to communicate output shape to Claude. One good example outperforms three paragraphs of instructions.
- **`output/` co-located with skill:** Keeps generated content auditable and versioned alongside the skill that created it. Named `YYYY-MM-DD-[slug].md` for daily cadence.
- **No `src/` or scripts subdirectory:** The skill relies entirely on Claude's native WebFetch/WebSearch tools and its own generation capability. No Python helpers needed for the MVP; they can be added later if source-specific parsing becomes complex.

---

## Architectural Patterns

### Pattern 1: Sequential Orchestration with Parallel Fetch

**What:** SKILL.md instructs Claude to spawn multiple research threads concurrently (using the `Task` tool or parallel WebFetch calls), then collect all results before proceeding to selection and generation. One orchestrator, many gatherers.

**When to use:** Whenever multiple independent sources must be queried and latency matters. Research and content generation are the two natural phases — research can be parallelised, generation cannot (it depends on the chosen story).

**Trade-offs:** Faster than sequential fetching; slightly more complex orchestration instructions. Subagent isolation (`context: fork`) keeps research threads from polluting the main conversation context but adds per-invocation overhead. For a daily-cadence single-output skill, inline parallel calls (without full subagent forking) is the lighter approach.

**Example:**
```yaml
---
name: science-carousel
description: Fetch latest science news and generate an Instagram carousel package
context: fork
agent: general-purpose
allowed-tools: WebFetch, WebSearch, Write
---

## Phase 1 — Research (run in parallel)

Search these sources simultaneously:
1. WebFetch https://www.nature.com/news — extract top 3 headlines and URLs
2. WebFetch https://www.sciencedaily.com — extract top 3 headlines and URLs
3. WebSearch "latest science discovery $ARGUMENTS site:arxiv.org OR site:pubmed.ncbi.nlm.nih.gov"

Collect all results before continuing.

## Phase 2 — Selection
...
```

### Pattern 2: Supporting-File Context Injection

**What:** Complex formatting rules (citation format, slide structure, tone voice) are stored as separate `.md` files in the skill directory and referenced from SKILL.md. Claude loads them only when needed, keeping context lean during the research phase.

**When to use:** Any time the skill has more than one distinct phase with different knowledge requirements. Research phase needs source URLs; generation phase needs citation rules. Load only what each phase needs.

**Trade-offs:** Reduces context bloat; requires explicit `Read [file]` instructions in SKILL.md so Claude knows when to load each file. Without explicit instructions, Claude may not load them.

**Example (SKILL.md reference block):**
```markdown
## Before writing slides
Read `prompts/slides.md` for slide structure rules.
Read `prompts/citation.md` for citation format.
Read `examples/output-sample.md` to understand expected output shape.
```

### Pattern 3: Schema-First Output Contract

**What:** Define the exact output structure once (in `examples/output-sample.md`) and make all generation instructions refer to it. The output file is the contract — slides, caption, hashtags, citations, and image URLs all have fixed positions and formats.

**When to use:** Any pipeline where the output will be consumed by a human with a repeatable workflow (in this case, copying slides into a design tool). Consistent structure removes daily friction.

**Trade-offs:** Constrains Claude's output shape; makes the skill less flexible for ad-hoc use. Acceptable here because the user has a repeatable Instagram publishing workflow.

---

## Data Flow

### Full Request Flow (Auto-Topic Mode)

```
User types: /science
        |
        v
SKILL.md loaded by Claude Code
        |
        v
Phase 1 — PARALLEL FETCH
  WebSearch "trending science this week [date]"      ---+
  WebFetch nature.com/news (headlines + URLs)        ---+---> Raw results pool
  WebFetch sciencedaily.com (headlines + URLs)       ---+
  WebFetch arxiv.org recent listings (field search)  ---+
        |
        v
Phase 2 — SELECTION
  Score candidates (recency, source quality, visual potential)
  Pick top 1 story
  WebFetch full article URL (deep content read)
        |
        v
Phase 3 — GENERATION (Claude native)
  Read prompts/slides.md
  Read prompts/citation.md
  Read examples/output-sample.md
        |
        v
  Write 5-7 slide text chunks
  Write Instagram caption (summary + refs, ~2200 chars)
  Write 5 hashtags
  Format APA citation + DOI + clickable URL
  Collect source image URL(s)
        |
        v
Phase 4 — OUTPUT
  Write structured markdown to output/YYYY-MM-DD-[slug].md
  Print confirmation to terminal
```

### Targeted Topic Mode (user passes argument)

```
User types: /science "quantum computing memory"
        |
        v
$ARGUMENTS = "quantum computing memory"
        |
        v
Phase 1 — PARALLEL FETCH (topic-scoped)
  WebSearch "quantum computing memory site:arxiv.org latest"
  WebSearch "quantum computing memory site:nature.com OR site:science.org latest"
  WebFetch PubMed search URL with topic terms
        |
        v
[Same selection → generation → output flow as above]
```

### Key Data Flows

1. **Source URL → Full Content:** WebSearch/WebFetch returns headlines and URLs; a second WebFetch round reads the full article body for the selected story. This two-round approach avoids fetching all articles in full.
2. **Raw Article → Slide Chunks:** Claude reads the full article content and breaks it into 5-7 narrative chunks following the hook → development → payoff structure defined in `prompts/slides.md`.
3. **Article Metadata → Citation:** Author, date, DOI/URL, and journal name are extracted from the fetched article page or its structured metadata and formatted to APA/Harvard by the generation phase.
4. **Generated Package → Disk:** The complete markdown output is written to `output/` by Claude using its Write tool, giving the user a permanent, dated record of each day's package.

---

## Scaling Considerations

This is a single-user daily tool. Scaling is not a concern. The relevant dimension is **daily friction**, not user scale.

| Concern | Approach |
|---------|----------|
| Slow fetch (news sites with large HTML) | Use targeted section URLs (e.g., `/news` or `/latest`) rather than homepages; this reduces payload size |
| Context window pressure | Load supporting prompt files only in Phase 3; keep Phase 1-2 context lean |
| Source unavailability | Instruct the skill to fall back to the next-best candidate if a primary source fetch fails |
| Output inconsistency across days | `examples/output-sample.md` anchors format; review after first 5 runs and update the example if drift appears |

---

## Anti-Patterns

### Anti-Pattern 1: All Instructions in One SKILL.md Block

**What people do:** Write 800+ lines of instructions directly in SKILL.md covering research rules, slide rules, citation rules, tone, examples, and fallback logic all in one file.

**Why it's wrong:** Claude Code's skill context budget is ~16,000 characters (or 2% of context window). A monolithic SKILL.md will exceed budget and truncate silently, causing unpredictable behaviour. It also makes maintenance painful.

**Do this instead:** Keep SKILL.md under 500 lines as the orchestration script. Move detailed rules into `prompts/` files and load them only in the generation phase.

### Anti-Pattern 2: Fetching Full Article Pages for All Candidates

**What people do:** WebFetch all 6-10 candidate articles in full to evaluate them, then pick one.

**Why it's wrong:** Full article pages are often 50-200KB of HTML. Fetching 10 of them consumes the context window and adds latency to every run, even though 9 of 10 articles will be discarded.

**Do this instead:** Two-round fetching. Round 1: search result pages and headline aggregators to collect titles, summaries, and URLs. Round 2: WebFetch only the single selected article in full.

### Anti-Pattern 3: Hardcoded Source URLs in SKILL.md

**What people do:** Embed specific article URLs or hardcode dated search queries directly in the skill instructions.

**Why it's wrong:** News sites change URL structures. Hardcoded dates go stale immediately. The skill becomes broken or irrelevant without maintenance.

**Do this instead:** Use search terms and section paths (e.g., `nature.com/news`, `arxiv.org/list/physics.gen-ph/recent`) that remain stable. Inject today's date via `!date +%Y-%m-%d` dynamic context substitution for recency-scoped searches.

### Anti-Pattern 4: Skipping the Example Output File

**What people do:** Describe the desired output format entirely in prose instructions ("write 5-7 slides, each 2-3 sentences, then a caption...").

**Why it's wrong:** Prose descriptions of output format are ambiguous and drift across runs. Claude interprets them differently each time, producing inconsistent slide lengths, caption structures, and citation formats.

**Do this instead:** Write one canonical `examples/output-sample.md` with a real (or fabricated) complete carousel package. Reference it explicitly. Claude matches examples far more reliably than descriptions.

---

## Integration Points

### External Sources (WebFetch/WebSearch — no API keys)

| Source | Integration Pattern | URL Pattern | Notes |
|--------|---------------------|-------------|-------|
| Nature | WebFetch section page | `nature.com/news` | HTML parse; headline + URL extraction |
| Science Daily | WebFetch section page | `sciencedaily.com/news/` | HTML parse |
| New Scientist | WebFetch section page | `newscientist.com/news/` | May have paywall on full articles |
| Ars Technica Science | WebFetch section page | `arstechnica.com/science/` | Generally open access |
| arXiv | WebSearch + WebFetch | `arxiv.org/search/?query=...` | Abstract pages freely accessible; full PDF not needed |
| PubMed | WebSearch + WebFetch | `pubmed.ncbi.nlm.nih.gov/?term=...` | Abstract + DOI always available |
| Google Scholar | WebSearch only | Do not WebFetch directly | Bot-blocking; use WebSearch to surface Scholar links then fetch the source paper directly |

### Internal Boundaries (Skill Components)

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SKILL.md → prompts/slides.md | Claude `Read` tool | Explicit `Read` instruction required; not auto-loaded |
| SKILL.md → prompts/citation.md | Claude `Read` tool | Load only in Phase 3 |
| SKILL.md → examples/output-sample.md | Claude `Read` tool | Load only in Phase 3 as format anchor |
| Phase 1 (research) → Phase 2 (selection) | In-context carry | Research results held in Claude's context window between phases |
| Phase 3 (generation) → output/ | Claude `Write` tool | Writes `output/YYYY-MM-DD-[slug].md` |

---

## Suggested Build Order

Based on component dependencies:

1. **`examples/output-sample.md`** — Define the output contract first. Everything else is built to produce this shape. Writing it first also forces concrete decisions about slide count, caption length, and citation format.

2. **`prompts/system.md`** — Establish tone and Instagram format constraints. This is the foundation that all generation instructions rest on.

3. **`prompts/citation.md` + `prompts/slides.md`** — Generation-phase rules. Build these after the example so they are consistent with the concrete shape you already defined.

4. **`SKILL.md` (research phase only)** — Wire up the fetch orchestration for a single source first (e.g., arXiv only). Validate that fetching and selection work end-to-end before adding more sources.

5. **`SKILL.md` (generation phase)** — Add the content generation phase. Validate output shape against `examples/output-sample.md`.

6. **Multi-source expansion** — Add remaining news sources and PubMed once the single-source pipeline is confirmed stable.

7. **Auto-topic mode** — Add trending detection last. It is the most variable and least deterministic part of the pipeline; stabilise everything else first.

---

## Sources

- [Claude Code Skills official documentation](https://code.claude.ai/docs/en/skills) — HIGH confidence; authoritative and current as of 2026-03-15
- [Understanding Skills, Agents, Subagents, and MCP in Claude Code](https://colinmcnamara.com/blog/understanding-skills-agents-and-mcp-in-claude-code) — MEDIUM confidence; verified against official docs
- [Claude Code Customization: CLAUDE.md, Slash Commands, Skills, and Subagents](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/) — MEDIUM confidence; real-world patterns consistent with official docs
- [claude-deep-research-skill — 8-phase pipeline example](https://github.com/199-biotechnologies/claude-deep-research-skill) — MEDIUM confidence; real-world reference implementation
- [research30 — multi-source academic skill example](https://github.com/shandley/research30) — MEDIUM confidence; real-world reference implementation showing parallel fetch + deduplication patterns
- [Claude Code Agent Skills 2.0](https://medium.com/@richardhightower/claude-code-agent-skills-2-0-from-custom-instructions-to-programmable-agents-ab6e4563c176) — LOW confidence; community article, patterns verified against official docs

---
*Architecture research for: Claude Code science carousel skill (Project Pleiades)*
*Researched: 2026-03-15*
