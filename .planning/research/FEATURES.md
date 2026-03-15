# Feature Research

**Domain:** Science content curation and Instagram carousel generation (CLI agent)
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (Instagram specs HIGH; content automation patterns MEDIUM; citation safety HIGH)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features where absence breaks the daily workflow entirely. These are non-negotiable for the tool to be usable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fetch from reputable science sources (Nature, Science Daily, arXiv, PubMed) | Core promise of the tool — without live source fetching it's just a text generator | MEDIUM | Claude Code web fetch/search covers this without external API keys; arXiv has open API, PubMed has E-utilities with 3 req/sec unauthenticated |
| Auto-pick trending/recent science topic | User invokes tool daily with no topic in mind; must produce something without input | MEDIUM | "Trending" in science = recently published, high-citation velocity, or picked up by science news outlets — recency signal is the primary sort key |
| Accept user-specified topic as override | User has something specific in mind; no topic input mode only is too rigid | LOW | Simple CLI argument or prompt input — "run for quantum computing today" |
| Generate 5-7 carousel slides with chunked text | Instagram carousel format is the deliverable; fewer = not enough depth, more = abandoned before CTA | MEDIUM | Each slide = one idea. Hook slide + 3-5 body slides + CTA/citation slide. Never cram two ideas per slide. |
| Strong hook on slide 1 | Instagram algorithm rewards swipe-through completion rate; weak slide 1 = nobody sees the rest | LOW | Under 10 words. Answers "Is this for me?" and "What do I get?" immediately. Compelling question or surprising fact. |
| Instagram caption with full summary | Caption is where depth lives — slide text = hook, caption = substance | LOW | ~2200 char max. Treat as a mini blog post. Main keyword in first sentence. |
| Exactly 5 relevant hashtags | Instagram currently limits to 5 hashtags per post; generating more is actively wrong | LOW | Instagram limit verified 2026. Fewer, more relevant hashtags outperform shotgun approaches. |
| Full academic citations (APA/Harvard with DOIs and authors) | Academic credibility is the entire value prop — sourcing is what separates this from random science content | MEDIUM | Every factual claim traceable to source. DOIs are canonical identifiers. Include publication date. |
| Clickable source URLs alongside citations | Users need to link-check before posting; audience may want to go deeper | LOW | Direct URL to paper or article. Separate from DOI when DOI resolver and landing page differ. |
| Casual + authoritative tone output | Matches the "did you know" / Kurzgesagt register that drives saves on educational Instagram | MEDIUM | Tone is a prompt engineering concern — must be consistent across all slide text and caption. Avoid jargon without explanation. |
| Output as clean plain text (copy-paste ready) | User handles design manually — output must be directly usable without post-processing | LOW | No markdown rendering artifacts, no HTML. Each slide clearly labeled (Slide 1, Slide 2, etc.). |

### Differentiators (Competitive Advantage)

Features that set this tool apart from generic carousel generators and make the daily workflow genuinely superior.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Source-grounded generation only (no hallucinated citations) | AI citation hallucination rates reach 40-91% in studies — science content that cites fabricated papers destroys credibility permanently | HIGH | Tool must fetch actual source content first, then generate from that content. Citations must come from fetched URLs, not LLM memory. This is the single most important differentiator for a science account. |
| Multi-source cross-validation per topic | Single-source stories may be preliminary or retracted; cross-referencing improves accuracy | MEDIUM | Pull from both academic source (arXiv/PubMed) and science journalism (Nature News, Science Daily) for the same finding. Flag when only one source found. |
| Source image URL extraction | User needs visuals for each slide; manually hunting images from the original article wastes the time saved elsewhere | LOW | Extract og:image or article header image URL from each source. User can grab the image directly. |
| Field-spanning topic selection (not AI-only) | Science accounts covering only one field plateau fast; cross-field coverage (physics, biology, space, medicine, chemistry) keeps audience diverse | MEDIUM | Default auto-pick should span fields. Track which fields were covered in recent outputs to avoid repetition. |
| Slide-level engagement optimization | Each slide text chunk designed for completion rate (dwell time), not just information transfer — swipe-through completion is a ranking signal | MEDIUM | Slide 2 must create a cliff-hanger that pulls to slide 3. Body slides should end mid-thought or pose a question. Final slide = payoff + CTA. |
| Recency-first source selection | Science credibility depends on currency — a "discovery" from 2021 presented as new is misleading | LOW | Filter sources to last 7-30 days. Flag if no recent content found for a topic and suggest adjacent topics. |
| Topic diversity tracking across sessions | Daily use creates repetition risk — same topics, same fields | MEDIUM | Simple log of recently covered topics/fields. Warn if proposed topic was covered within last 14 days. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like natural additions but create scope creep, technical risk, or contradict the tool's constraints.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automated Instagram posting | "Why not just post it for me?" — saves manual publishing step | Requires Instagram Graph API credentials, OAuth token management, and ongoing token refresh — violates the no-external-API-keys constraint. Also removes human review before posting, which is essential for science accuracy. | Output is copy-paste ready. User reviews and posts manually — this is intentional quality control, not a limitation. |
| Image/graphic generation | Users want fully designed slides, not just text | Image generation requires DALL-E, Stable Diffusion, or Canva API — all external API keys. Generated science imagery risks inaccuracy (wrong diagrams, misleading visuals). | Provide source image URLs. User designs slides using their own tool (Canva, Figma) with actual article images. |
| Multi-topic batch generation | "Generate a week's worth at once" | Defeats the daily-freshness purpose; week-old content queued for later will feel stale. Also dramatically increases per-run cost and complexity. | Run daily. Recency is a feature, not a bug — today's best science story beats last Monday's. |
| Auto-scheduling / content calendar | "Plan my week" | Requires persistent state, background jobs, and scheduler infrastructure — far beyond a CLI agent scope. | The tool is a daily CLI invocation. Simplicity is its robustness. |
| Sentiment/controversy filtering | "Don't show me politically sensitive topics" | Science credibility requires following evidence, not audience comfort. Filtering by controversy risks creating a bubble that undermines the account's scientific authority. | User reviews output before posting. That review step is the filter. |
| Full article summarization (1000+ words) | "Give me the whole paper" | Instagram caption max is ~2200 chars. Long output is never used and wastes generation time. | Caption is the depth layer (~400-600 words). Link to source for full content. |
| SEO keyword optimization | "Optimize for search" | Instagram is a discovery platform driven by engagement signals, not keyword indexing. Optimizing for keywords degrades the natural, credible tone. | Hashtag selection + clear topic focus handles discoverability. |

---

## Feature Dependencies

```
[Source fetching (arXiv/PubMed/news)]
    └──required by──> [Slide text generation]
    └──required by──> [Caption generation]
    └──required by──> [Citation generation]
    └──required by──> [Source image URL extraction]
    └──required by──> [Source-grounded citation accuracy]

[Topic selection (auto-pick OR user-specified)]
    └──required by──> [Source fetching]

[Slide text generation]
    └──required by──> [Slide-level engagement optimization]
    └──enhances──> [Caption generation] (caption summarizes what slides introduced)

[Citation generation]
    └──enhances──> [Caption generation] (citations embedded in caption)
    └──requires──> [Source fetching] (citations must come from fetched content, not LLM memory)

[Topic diversity tracking]
    └──enhances──> [Topic selection (auto-pick)] (prevents repetition across days)
    └──conflicts with──> [Multi-topic batch generation] (batch undermines recency-first design)

[Hashtag generation]
    └──requires──> [Topic selection] (hashtags derived from topic and field)
    └──constrained by──> [Instagram 5-hashtag limit]
```

### Dependency Notes

- **Source fetching requires topic selection:** You cannot fetch without knowing what to fetch. Topic selection (auto or manual) is the root of the entire pipeline.
- **Citation generation requires source fetching:** Citations must be derived from actually fetched URLs, not generated from LLM training memory. This is the critical safety constraint — LLM-hallucinated citations are wrong 40-91% of the time in research contexts.
- **Caption generation enhances from slide text:** The caption is a summary and expansion of what the slides introduced — slides and caption must be generated from the same source content in the same pass.
- **Topic diversity tracking enhances auto-pick:** Optional but high-value for daily use. Without it, the same field (e.g., space) tends to dominate because space news is reliably high-volume.
- **Batch generation conflicts with recency-first design:** Generating content in advance undermines the core value of "latest findings" — a cached story 5 days old is not this week's news.

---

## MVP Definition

### Launch With (v1)

Minimum viable product that proves the daily workflow actually saves time and produces usable output.

- [ ] Auto-pick trending science topic from recent news/academic sources — validates that the tool can operate unsupervised
- [ ] Accept user-specified topic as CLI input — covers the most common intentional use case
- [ ] Fetch from at least 2 source types: one news outlet (e.g., Science Daily or Ars Technica) + one academic (arXiv or PubMed) — dual-sourcing is the minimum credibility bar
- [ ] Generate 5-7 labeled slide text chunks — the actual deliverable; each slide one idea, hook on slide 1
- [ ] Generate Instagram caption (~400-600 words, keyword in first sentence) — the depth layer
- [ ] Generate exactly 5 hashtags — constraint-compliant, non-negotiable
- [ ] Provide full academic citations with DOIs and source URLs — credibility foundation
- [ ] Extract at least one source image URL — removes the biggest manual step remaining
- [ ] Output as plain text, cleanly labeled — copy-paste ready into design tool

### Add After Validation (v1.x)

Add once core daily workflow is proven useful and being run regularly.

- [ ] Multi-source cross-validation (compare arXiv + news outlet for same finding) — add when citation accuracy becomes the primary concern after initial use
- [ ] Topic diversity tracking / recent-topics log — add when user notices field repetition after 1-2 weeks of daily use
- [ ] Field-spanning auto-pick (explicit rotation across physics, biology, space, chemistry, medicine, tech) — add when auto-pick consistently skews toward one field
- [ ] Slide-level engagement optimization (cliff-hanger endings on body slides) — add when baseline content is working and engagement rate becomes the next lever

### Future Consideration (v2+)

Features to defer until the daily habit is established and the account is growing.

- [ ] Reels repurposing (reformat carousel content as 30-45s video script) — defer until carousel-first strategy is validated and user wants to expand formats
- [ ] Multiple carousel outputs per run (e.g., 3 candidate topics to choose from) — defer until user finds single-topic output too limiting
- [ ] Output format templating (user-defined slide structure preferences) — defer until user has strong opinions about structure from real use

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Source fetching (news + academic) | HIGH | MEDIUM | P1 |
| Topic auto-pick | HIGH | MEDIUM | P1 |
| User-specified topic input | HIGH | LOW | P1 |
| 5-7 slide text generation | HIGH | MEDIUM | P1 |
| Hook slide optimization | HIGH | LOW | P1 |
| Instagram caption generation | HIGH | LOW | P1 |
| Exactly 5 hashtags | HIGH | LOW | P1 |
| Full academic citations with DOIs + URLs | HIGH | MEDIUM | P1 |
| Source image URL extraction | MEDIUM | LOW | P1 |
| Plain text labeled output | HIGH | LOW | P1 |
| Source-grounded generation (no hallucinated citations) | HIGH | HIGH | P1 — safety-critical |
| Multi-source cross-validation | HIGH | MEDIUM | P2 |
| Field-spanning topic rotation | MEDIUM | MEDIUM | P2 |
| Topic diversity tracking across sessions | MEDIUM | LOW | P2 |
| Slide-level engagement optimization | MEDIUM | MEDIUM | P2 |
| Recency filter (last 7-30 days) | MEDIUM | LOW | P2 |
| Reels script repurposing | LOW | MEDIUM | P3 |
| Multi-candidate topic output | LOW | MEDIUM | P3 |
| Output format templating | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch — workflow fails without it
- P2: Should have — adds meaningful reliability/quality after core is working
- P3: Nice to have — future value, defer until product-market fit

---

## Competitor Feature Analysis

These tools represent the current state of the art for automated carousel generation. None are built for science-specific academic accuracy — that gap is the opportunity.

| Feature | PostNitro / aiCarousels (generic carousel tools) | Paper Digest / ArXiv Pulse (academic digest tools) | Project Pleiades (this tool) |
|---------|------|------|------|
| Topic sourcing | User-provided topic or URL | arXiv/PubMed search by user interest | Auto-pick from news + academic sources, or user-specified |
| Citation accuracy | None — generates from LLM memory | Fetches actual papers, cites accurately | Generates only from fetched source content |
| Instagram formatting | Native — carousel slides, captions, hashtags | None — research digest format only | Native — slide chunks, caption, exactly 5 hashtags |
| Academic citations | None — entertainment/marketing focus | YES — paper metadata, DOI links | YES — APA/Harvard citations with DOIs and URLs |
| Image sourcing | AI-generated or user-uploaded | None | Source image URL extraction from articles |
| Tone control | Brand voice (marketing) | Academic/neutral | Casual + authoritative ("did you know" / Kurzgesagt) |
| CLI / no-account workflow | No — SaaS only, requires login | Limited — web-only interfaces | YES — runs inside Claude Code, no external accounts |
| Daily cadence design | Batch scheduling available | Email digest (daily/weekly) | Single invocation per day, recency-first |
| Field coverage | Any topic | By researcher interest | All science fields, rotation encouraged |

**Key insight:** No existing tool combines (a) live academic source fetching, (b) citation-safe generation, and (c) Instagram-native output formatting. Generic carousel tools have the Instagram formatting but no science credibility. Academic digest tools have the sourcing but no social content formatting. Pleiades fills the intersection.

---

## Sources

- PostNitro feature set and pricing: [PostNitro](https://postnitro.ai/) — MEDIUM confidence (vendor site)
- aiCarousels vs Contentdrips comparison: [Contentdrips aiCarousels alternative](https://contentdrips.com/aicarousels-alternative/) — MEDIUM confidence
- Instagram carousel best practices 2026: [Metricool](https://metricool.com/instagram-carousels/), [TrueFuture Media](https://www.truefuturemedia.com/articles/instagram-carousel-strategy-2026) — HIGH confidence (current-year verified)
- Instagram carousel slide count and engagement data: [PostNitro carousel post guide](https://postnitro.ai/blog/post/instagram-carousel-post), [StackInfluence](https://stackinfluence.com/what-are-instagram-carousels-2026-guide/) — MEDIUM confidence
- Instagram hashtag limit (5): [PROJECT.md context] — HIGH confidence (verified constraint)
- AI citation hallucination rates: [Enago Academy — 40% error rate](https://www.enago.com/academy/ai-hallucinations-research-citations/), [INRA.AI blog](https://www.inra.ai/blog/citation-accuracy), [PMC hallucination study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10726751/) — HIGH confidence (multiple peer-reviewed sources)
- arXiv API rate limits and terms: [arXiv API ToU](https://info.arxiv.org/help/api/tou.html) — HIGH confidence (official source)
- PubMed E-utilities rate limits: [NCBI E-utilities intro](https://www.ncbi.nlm.nih.gov/books/NBK25497/) — HIGH confidence (official NCBI documentation)
- Paper Digest and ArXiv Pulse features: [Paper Digest](https://www.paperdigest.org/), [ArXiv Pulse](https://www.arxivpulse.com/) — MEDIUM confidence
- Instagram algorithm 2026 educational content: [Medium — Instagram algorithm 2026](https://medium.com/@daniel.belhart/what-the-instagram-algorithm-in-2026-actually-prioritizes-and-how-creators-can-use-it-2a48b893e1c8) — LOW-MEDIUM confidence (single source, third-party analysis)
- Science communication carousel structure: [Creators for Climate](https://www.creatorsforclimate.com/blog/from-posters-to-slides) — MEDIUM confidence

---
*Feature research for: Science content curation and Instagram carousel generation (Project Pleiades)*
*Researched: 2026-03-15*
