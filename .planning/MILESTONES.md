# Milestones

## v1.0 MVP (Shipped: 2026-03-16)

**Phases completed:** 4 phases, 7 plans
**Timeline:** 2 days (2026-03-15 → 2026-03-16)
**Git range:** `feat(01-01)` → `feat(04-02)` (43 files changed, 8087 insertions)

**Key accomplishments:**
1. Skill scaffold with output contract — `/science` skill invocable in Claude Code with format contract and grounding enforcement prompt
2. 6-channel parallel fetch pipeline — arXiv, PubMed, ScienceDaily, Phys.org, Nature News, Ars Technica with peer-review and image license labeling
3. Complete content generation ruleset — 5-7 slides with hooks, 400-600 word caption, exactly 5 hashtags, full APA citations with DOIs
4. Self-check enforcement gates — Stop clauses that block output until slide counts, caption length, and keyword requirements pass
5. Auto-topic discovery with diversity tracking — RSS-based trending topic selection with 14-day dedup via topic-log.json
6. Post-generation format validation — 5 mechanical checks with write-and-warn pattern

**Archives:**
- [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md)

---

