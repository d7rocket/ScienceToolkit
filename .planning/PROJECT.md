# Project Pleiades

## What This Is

A Claude Code skill that fetches the latest science content from 7 sources (arXiv, PubMed, ScienceDirect, ScienceDaily, Phys.org, Nature News, Ars Technica), then packages it into an Instagram carousel-ready output — slide text with hooks and cliff-hangers, caption summary, hashtags, and full academic citations with DOIs and clickable URLs. Includes auto-topic discovery with 14-day diversity tracking, post-generation format validation, and a local web UI for rendering markdown into export-ready carousel images with full design editing.

## Core Value

Reliably deliver a complete, well-sourced daily science content package that saves hours of manual research while maintaining academic credibility.

## Requirements

### Validated

- ✓ Fetch science content from news sites (Nature, ScienceDaily, Ars Technica) — v1.0
- ✓ Fetch from academic sources (arXiv API, PubMed) — v1.0
- ✓ All content grounded in fetched source material only — v1.0
- ✓ Cross-validate topic across academic + news sources — v1.0
- ✓ Auto-pick trending science topics across all fields — v1.0
- ✓ Track covered topics/fields, avoid repetition within 14 days — v1.0
- ✓ Generate 5-7 labeled carousel slide text chunks — v1.0
- ✓ Slide 1 hook under 10 words (question or surprising fact) — v1.0
- ✓ Body slides end with cliff-hangers or questions — v1.0
- ✓ Instagram caption 400-600 words, keyword in first sentence — v1.0
- ✓ Exactly 5 relevant hashtags — v1.0
- ✓ Casual + authoritative tone — v1.0
- ✓ Clean plain text, copy-paste ready output — v1.0
- ✓ Full APA/Harvard citations with DOI, authors, publication date — v1.0
- ✓ Clickable source URLs on each citation — v1.0
- ✓ At least one source image URL per topic — v1.0
- ✓ Preprints labeled as such — v1.0
- ✓ Image license status flagged — v1.0

### Active

- [ ] User can specify a topic as CLI input to override auto-pick (TOPIC-03)
- [ ] Field-spanning auto-pick with explicit rotation across physics, biology, space, chemistry, medicine, tech (TOPIC-04)
- [ ] Local web UI renders markdown carousel files into visual slide images (DESIGN-01)
- [ ] User can drag & drop markdown file to load carousel content (DESIGN-02)
- [ ] Full design editor — colors, fonts, text, spacing/alignment (DESIGN-03)
- [ ] Export slides as individual 1080x1080 PNGs and ZIP bundle (DESIGN-04)
- [ ] Color scheme from markdown drives initial palette, user can override (DESIGN-05)

## Current Milestone: v1.1 Carousel Image Generator

**Goal:** Build a local web UI that transforms markdown carousel output into high-quality, export-ready Instagram carousel images with full design editing.

**Target features:**
- Drag & drop markdown loading with live preview
- Visual slide renderer (1080x1080px Instagram format)
- Full editor: color palette, font pairing, text editing, spacing/alignment
- PNG export (individual + ZIP bundle)
- Color scheme integration from `/science` output

### Out of Scope

- API integrations — user runs this from their Claude subscription, no external API keys
- Automated posting to Instagram — user publishes manually; manual review is intentional quality control
- Reels/video content — carousel-first; reels repurposing is a future consideration
- Multi-topic batch generation — defeats daily-freshness purpose
- Content calendar / scheduling — requires persistent background jobs beyond CLI agent scope
- Full article summarization (1000+ words) — Instagram caption max ~2200 chars
- SEO keyword optimization — Instagram is discovery-driven by engagement, not keyword indexing

## Context

Shipped v1.0 with 162 LOC across project files (markdown skill architecture).
Tech stack: Claude Code Skills (.claude/skills/), YAML frontmatter, markdown output format.
Sources: arXiv Atom API, NCBI ESearch + EFetch, ScienceDaily RSS, Phys.org RSS, Nature RSS, Ars Technica WebSearch.
First real output produced: `output/2026-03-16-crispr-gene-editing.md`.

Known concern: slide text verbosity (~150 chars per body slide) may be too much for Instagram — candidate for tuning.
Known concern: arXiv `journal_ref` field population rate unknown — peer-review detection may need fallback heuristic.

## Constraints

- **No external APIs**: Must work entirely within Claude Code + Claude subscription (web search, web fetch)
- **Instagram format**: 5-7 slides per carousel, 5 hashtags max, caption length ~2200 chars
- **Source quality**: Only reputable sources — peer-reviewed journals, established science publications
- **Daily cadence**: Output should be quick enough for daily use
- **References**: Every claim must be traceable to a source

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Claude Code skill over standalone script | User wants to invoke from terminal within Claude subscription, no API keys | ✓ Good — `/science` works as intended |
| Output contract before instructions | `examples/output-sample.md` built first to anchor all downstream phases | ✓ Good — prevented format drift |
| Source quality labels in fetch layer (not generation) | Retrofitting is error-prone; labels belong where data enters | ✓ Good — peer-review and license labels flow through cleanly |
| Use `export.arxiv.org` exclusively | Main arxiv.org domain blocked by Claude Code WebFetch bug #19287 | ✓ Good — workaround successful |
| Single focal finding architecture | Carousel builds around one cross-validated or most counterintuitive finding | ✓ Good — focused narrative |
| Character ceiling (not word count) for caption | 600-word caption can exceed 2100 chars; explicit character counting | ✓ Good — prevents Instagram truncation |
| Write-and-warn validation (non-blocking) | File always written, violations prepended as warning | ✓ Good — never loses work |
| JSON array for topic-log.json (not NDJSON) | Read/Write approach is explicit and human-readable | ✓ Good — simple persistence |
| Stop clause pattern for self-checks | Hard block "Do NOT proceed to Step 6 until checks pass" | ✓ Good — stronger than advisory |

---
*Last updated: 2026-03-17 after v1.1 milestone start*
