<p align="center">
  <img src="https://img.shields.io/badge/Claude_Code-Skill-7C3AED?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJ2NCIvPjxwYXRoIGQ9Ik0xMiAxOHY0Ii8+PHBhdGggZD0iTTQuOTMgNC45M2wyLjgzIDIuODMiLz48cGF0aCBkPSJNMTYuMjQgMTYuMjRsMi44MyAyLjgzIi8+PHBhdGggZD0iTTIgMTJoNCIvPjxwYXRoIGQ9Ik0xOCAxMmg0Ii8+PHBhdGggZD0iTTQuOTMgMTkuMDdsMi44My0yLjgzIi8+PHBhdGggZD0iTTE2LjI0IDcuNzZsMi44My0yLjgzIi8+PC9zdmc+" alt="Claude Code Skill">
  <img src="https://img.shields.io/badge/zero_config-no_API_keys-10B981?style=for-the-badge" alt="Zero Config">
  <img src="https://img.shields.io/badge/v1.0-MVP_Shipped-F59E0B?style=for-the-badge" alt="v1.0 MVP">
</p>

<h1 align="center">ScienceToolkit</h1>

<p align="center">
  <strong>Turn today's science breakthroughs into Instagram-ready carousels — grounded in real sources, zero hallucinated citations.</strong>
</p>

<p align="center">
  A Claude Code skill that fetches live research from arXiv, PubMed, Nature, ScienceDaily & more, then generates publication-ready carousel slides, captions, hashtags, and full academic citations.
</p>

---

## The Problem

AI-generated science content has a **40-91% citation hallucination rate**. Fake DOIs, invented journal names, non-existent authors. ScienceToolkit solves this by fetching real sources *first*, then generating content grounded entirely in verified material.

## How It Works

```
/science                    # auto-discover today's trending topic
/science quantum computing  # or pick your own
```

One command triggers a **7-step pipeline**:

```
 Discover Topic ─→ Load Rules ─→ Fetch 6 Sources ─→ Generate Content ─→ Validate ─→ Write File
       │                              │                      │                │
   RSS + WebSearch            arXiv, PubMed,          5-7 slides,       5 format
   14-day diversity          ScienceDaily,         caption, hashtags,    checks
     tracking               Phys.org, Nature,      APA citations      (PASS/FAIL)
                             Ars Technica
```

## Output

Each run produces a dated Markdown file in `output/`:

```
output/
├── 2026-03-16-crispr-gene-editing.md
├── 2026-03-16-solar-fuel-conversion.md
└── topic-log.json              # 14-day diversity tracking
```

Every file contains:

| Section | Details |
|---------|---------|
| **Slides** | 5-7 carousel slides with hooks and cliff-hangers |
| **Caption** | 400-600 words, keyword-optimized, < 2100 characters |
| **Hashtags** | Exactly 5, strategically chosen |
| **Sources** | Full APA citations with DOIs, URLs, peer-review labels |
| **Images** | Source image URLs with license status |

### Example Slide

> **Slide 1: Bacteria Just Lost Their Best Defense**
>
> What if superbugs could be tricked into disarming themselves?

### Example Citation

> Gardner, J. P., et al. (2023). The James Webb Space Telescope Mission. *Publications of the Astronomical Society of the Pacific*. DOI: https://doi.org/10.1086/723378 [Published in: PASP, 2023]

## Features

- **6-channel parallel fetching** — arXiv, PubMed, ScienceDaily, Phys.org, Nature News, Ars Technica
- **Auto-topic discovery** — scans RSS feeds for trending topics, picks the most cross-referenced
- **14-day diversity tracking** — won't repeat the same topic within two weeks
- **Format validation** — 5 mechanical checks before output (caption length, hashtag count, slide count, label format, citation completeness)
- **Write-and-warn** — always saves the file, prepends warnings if validation fails
- **Peer-review labeling** — every source tagged as `[Published]`, `[Preprint]`, or `[News article]`
- **Zero config** — no API keys, no external dependencies, runs entirely on Claude Code's native tools

## Setup

1. **Have [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed**
2. **Clone this repo:**
   ```bash
   git clone https://github.com/d7rocket/ScienceToolkit.git
   cd ScienceToolkit
   ```
3. **Run:**
   ```bash
   claude  # opens Claude Code in this directory
   ```
4. **Generate a carousel:**
   ```
   /science
   ```

That's it. No API keys, no `npm install`, no Docker.

## Project Structure

```
ScienceToolkit/
├── .claude/skills/science/
│   ├── SKILL.md              # 7-step pipeline (the engine)
│   └── prompts/system.md     # content grounding rules
├── examples/
│   └── output-sample.md      # output format contract
├── output/                   # generated carousels live here
└── .planning/                # architecture & research docs
```

## Tech Stack

| Component | Role |
|-----------|------|
| Claude Code Skill System | Orchestration — `/science` slash command |
| WebSearch / WebFetch | Live source fetching with dynamic filtering |
| arXiv REST API | Academic papers (via `export.arxiv.org`) |
| PubMed E-utilities | Peer-reviewed medical research |
| RSS (ScienceDaily, Phys.org, Nature) | Trending topic discovery |

## Design Decisions

- **Source-first architecture** — fetch before generating, never the reverse
- **Single focal finding** — each carousel tells one story, not a topic survey
- **Character ceiling, not word count** — Instagram truncates at ~2100 chars, so we count characters
- **Inline glosses** — every technical term gets a plain-English explanation in parentheses
- **Cool professor tone** — calm, confident, accessible, no jargon gatekeeping

## License

MIT

---

<p align="center">
  <sub>Built with Claude Code</sub>
</p>
