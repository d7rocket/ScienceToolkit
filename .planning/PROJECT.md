# Project Pleiades

## What This Is

A Claude Code skill/agent that fetches the latest science content from news sites and academic sources (arXiv, PubMed, etc.), then packages it into Instagram carousel-ready output — slide text, caption summary, hashtags, and full academic references with links. Built for a daily science Instagram account where the user handles design and publishing manually.

## Core Value

Reliably deliver a complete, well-sourced daily science content package that saves hours of manual research while maintaining academic credibility.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Fetch latest science content from news sites (Nature, Science Daily, New Scientist, Ars Technica)
- [ ] Fetch from academic sources (arXiv, PubMed, Google Scholar)
- [ ] Auto-pick trending science topics across all fields (physics, biology, chemistry, space, tech)
- [ ] Accept user-specified topics for targeted research
- [ ] Generate 5-7 carousel slide text chunks (article broken into digestible bites)
- [ ] Generate Instagram caption with concise summary
- [ ] Generate exactly 5 relevant hashtags (Instagram limit)
- [ ] Provide full academic citations (APA/Harvard style with DOIs, authors, dates)
- [ ] Provide clickable source URLs alongside each citation
- [ ] Provide source image URLs from original articles
- [ ] Tone: casual + authoritative — "did you know" energy meets Kurzgesagt clarity
- [ ] Run as a Claude Code skill/agent invoked from the terminal

### Out of Scope

- API integrations — user runs this from their Claude subscription, no external API keys
- Automated posting to Instagram — user publishes manually
- Image/design generation — user handles visual design from source images
- Reels/video content — carousel-first, reels repurposing is a future consideration
- Instagram page name brainstorming — user will decide separately

## Context

- Target platform: Instagram carousels (10-slide max, but aiming for 5-7)
- Instagram recently limited hashtags to 5 per post
- User will use images from the original source articles for slide visuals
- Slide text = chunked article content (the hook), caption = full summary + references (the depth)
- Carousels are strong for educational content — shareable and saveable
- All science fields are in scope: physics, biology, chemistry, space, tech, medicine, environment
- Content should be based on the latest findings — recency matters
- The tool runs inside Claude Code using web search/fetch capabilities (MCP tools, skills)

## Constraints

- **No external APIs**: Must work entirely within Claude Code + Claude subscription (web search, web fetch)
- **Instagram format**: 5-7 slides per carousel, 5 hashtags max, caption length ~2200 chars
- **Source quality**: Only reputable sources — peer-reviewed journals, established science publications
- **Daily cadence**: Output should be quick enough for daily use
- **References**: Every claim must be traceable to a source

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Claude Code skill over standalone script | User wants to invoke from terminal within Claude subscription, no API keys | — Pending |
| Both auto-pick and manual topic modes | Sometimes trending is enough, sometimes user has a specific topic | — Pending |
| Casual + authoritative tone | Balances Instagram accessibility with science credibility | — Pending |
| Academic citations + clickable links | Dual-layer referencing serves both credibility and convenience | — Pending |

---
*Last updated: 2026-03-15 after initialization*
