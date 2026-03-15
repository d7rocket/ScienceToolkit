# Requirements: Project Pleiades

**Defined:** 2026-03-15
**Core Value:** Reliably deliver a complete, well-sourced daily science content package that saves hours of manual research while maintaining academic credibility.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Source Fetching

- [ ] **FETCH-01**: Skill fetches science content from news sites (Nature, Science Daily, Ars Technica)
- [ ] **FETCH-02**: Skill fetches science content from academic sources (arXiv API, PubMed)
- [x] **FETCH-03**: All generated content is grounded in actually-fetched source material only — no LLM-memory citations
- [ ] **FETCH-04**: Skill cross-validates topic across academic + news sources when available

### Topic Selection

- [ ] **TOPIC-01**: Skill auto-picks a trending/recent science topic across all fields
- [ ] **TOPIC-02**: Skill tracks recently covered topics/fields and avoids repetition within 14 days

### Content Generation

- [ ] **CONT-01**: Skill generates 5-7 labeled carousel slide text chunks (one idea per slide)
- [ ] **CONT-02**: Slide 1 has a strong hook (under 10 words, question or surprising fact)
- [ ] **CONT-03**: Body slides end with cliff-hangers or questions to boost swipe-through
- [ ] **CONT-04**: Skill generates Instagram caption (~400-600 words, keyword in first sentence)
- [ ] **CONT-05**: Skill generates exactly 5 relevant hashtags
- [ ] **CONT-06**: Tone is casual + authoritative ("did you know" energy meets Kurzgesagt clarity)
- [x] **CONT-07**: Output is clean plain text, copy-paste ready, with clearly labeled sections

### Citations & Sources

- [ ] **CITE-01**: Each source has full APA/Harvard citation with DOI, authors, and publication date
- [ ] **CITE-02**: Each citation includes a clickable source URL
- [ ] **CITE-03**: At least one source image URL extracted per topic
- [ ] **CITE-04**: Preprints are labeled as such (not presented as peer-reviewed)
- [ ] **CITE-05**: Image license status flagged (CC-licensed vs copyrighted)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Topic Selection

- **TOPIC-03**: User can specify a topic as CLI input to override auto-pick
- **TOPIC-04**: Field-spanning auto-pick with explicit rotation across physics, biology, space, chemistry, medicine, tech

### Content Generation

- **CONT-08**: Reels script repurposing (reformat carousel content as 30-45s video script)
- **CONT-09**: Multiple candidate topics per run (e.g., 3 options to choose from)
- **CONT-10**: Output format templating (user-defined slide structure preferences)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Automated Instagram posting | Requires Instagram Graph API — violates no-external-API constraint. Manual review is intentional quality control. |
| Image/graphic generation | Requires external AI image APIs. User handles design from source images. |
| Multi-topic batch generation | Defeats daily-freshness purpose; week-old queued content feels stale. |
| Content calendar / scheduling | Requires persistent background jobs beyond CLI agent scope. |
| Full article summarization (1000+ words) | Instagram caption max ~2200 chars. Caption is the depth layer; link to source for full content. |
| SEO keyword optimization | Instagram is discovery-driven by engagement, not keyword indexing. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FETCH-01 | Phase 2 | Pending |
| FETCH-02 | Phase 2 | Pending |
| FETCH-03 | Phase 1 | Complete |
| FETCH-04 | Phase 2 | Pending |
| TOPIC-01 | Phase 4 | Pending |
| TOPIC-02 | Phase 4 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| CONT-06 | Phase 3 | Pending |
| CONT-07 | Phase 1 | Complete |
| CITE-01 | Phase 3 | Pending |
| CITE-02 | Phase 3 | Pending |
| CITE-03 | Phase 3 | Pending |
| CITE-04 | Phase 2 | Pending |
| CITE-05 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after roadmap creation*
