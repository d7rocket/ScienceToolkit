# Phase 3: Content Generation - Research

**Researched:** 2026-03-16
**Domain:** Claude Code SKILL.md instruction authoring, LLM prompt engineering for structured content generation, Instagram carousel format
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tone & voice calibration**
- Reading level: high school — no jargon without explanation, plain language anyone can follow
- Technical terms: inline plain-English gloss when unavoidable (e.g., "redshift (the stretching of light as objects move away)")
- Voice personality: cool professor — calm confidence, dry wit allowed, authoritative but approachable. "Here's what that actually means." energy (Kurzgesagt narrator register)
- Tone shift: slides are punchier and bolder, caption relaxes into a more explanatory flowing style. Both stay in the cool-professor register

**Caption narrative arc**
- Opening: question hook that includes the topic keyword (e.g., "What happens when CRISPR meets cancer cells?")
- Middle structure: Context → Finding → Why it matters (background paragraph, then the discovery, then significance)
- Closing: forward-looking question that invites engagement (e.g., "Could this change how we treat cancer within a decade?") — no CTA in caption
- Formatting: 3-5 short paragraphs broken by section (hook, context, finding, significance, closing question). Scannable on mobile.
- Length: 400-600 words, under 2,100 characters total (Phase 1 constraint)

**Claim-to-source threading**
- No inline references in slides or caption — text reads clean, all citations live in the Sources section
- Name-drop journal/outlet naturally when introducing the main finding: "A study in Nature found..." — adds credibility without footnotes
- Citation format: match `examples/output-sample.md` exactly — Author, et al. (Year). Title. *Journal*, *Volume*(Issue), Pages. DOI + URL + peer-review label
- Images: include ALL available image URLs found during fetching — user picks which to use for design. Prefer CC-licensed when available.

**Slide storytelling strategy**
- Narrative arc: Hook → Build-up → Reveal → CTA (curiosity-gap structure)
- Focus: single finding, deep — pick the most compelling finding and build the entire carousel around it
- Data handling: one statistic per slide maximum, keeps it digestible
- Cliff-hangers (CONT-03): tease-style endings on body slides — "But there's a catch.", "That's not the weird part.", "Scientists weren't expecting what came next."
- Slide 1 hook: under 10 words, question or surprising fact (locked)
- Final slide: key takeaway + CTA like "Follow for daily science drops" (locked)

### Claude's Discretion
- Exact wording of cliff-hanger transitions (varies per topic)
- Which paragraphs in the caption get the most depth
- Hashtag selection strategy (topical vs broad reach)
- How to handle topics where multiple findings are equally compelling — Claude picks the strongest single thread

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Skill generates 5-7 labeled carousel slide text chunks (one idea per slide) | SKILL.md Step 5 already has slide generation instruction skeletons; Phase 3 replaces with precise count and structural rules |
| CONT-02 | Slide 1 has a strong hook (under 10 words, question or surprising fact) | Format contract in `examples/output-sample.md` shows hook pattern; rule must be explicit in Step 5 instructions |
| CONT-03 | Body slides end with cliff-hangers or questions to boost swipe-through | CONTEXT.md defines specific cliff-hanger patterns; these need to be embedded in Step 5 as explicit generation rules |
| CONT-04 | Skill generates Instagram caption (~400-600 words, keyword in first sentence) | Caption arc structure decided: hook → context → finding → significance → closing question. Character ceiling: 2,100 chars |
| CONT-05 | Skill generates exactly 5 relevant hashtags | Simple rule: exactly 5, on one line, space-separated. No negotiation on count. |
| CONT-06 | Tone is casual + authoritative ("did you know" energy meets Kurzgesagt clarity) | Kurzgesagt voice model defined; cool-professor register documented with specific examples |
| CITE-01 | Each source has full APA/Harvard citation with DOI, authors, and publication date | Citation format contract is `examples/output-sample.md` — three variants already shown with all required fields |
| CITE-02 | Each citation includes a clickable source URL | Already present in output-sample.md citation format; must be explicit requirement in Step 5 |
| CITE-03 | At least one source image URL extracted per topic | Phase 2 delivers image_url fields; Step 5 must output ALL available image URLs in Images section |
</phase_requirements>

---

## Summary

Phase 3 is a prompt-engineering phase, not a code-writing phase. The deliverable is a rewritten Step 5 in `.claude/skills/science/SKILL.md`. Step 5 currently contains a minimal generation instruction; Phase 3 replaces it with a complete, prescriptive set of rules that govern slide writing, caption structure, hashtag generation, citation formatting, and image output.

The architecture is already established: Phase 2's Step 4 produces a structured source list (the data contract is fully defined) and passes it in-context to Step 5. Phase 3 does not change what data flows in — it radically improves what comes out. Every requirement (CONT-01 through CONT-06, CITE-01 through CITE-03) maps to a specific paragraph or rule inside the new Step 5 instructions.

The key insight for planning is that this is **instruction authoring**, not application programming. The quality of the output is entirely a function of how precisely and unambiguously the Step 5 instructions guide Claude's generation behavior at runtime. Vague instructions produce vague output; specific, rule-governed instructions produce consistent, on-format output that passes all success criteria every run.

**Primary recommendation:** Rewrite SKILL.md Step 5 with a structured, numbered ruleset covering: (1) finding selection logic, (2) slide-by-slide generation rules, (3) caption narrative arc with character ceiling, (4) hashtag generation rule, (5) citation formatting matched to `examples/output-sample.md`, and (6) image URL output rule. This is a single-file change to one section of SKILL.md.

---

## Standard Stack

### Core

| Component | Version/Location | Purpose | Why Standard |
|-----------|-----------------|---------|--------------|
| SKILL.md Step 5 | `.claude/skills/science/SKILL.md` | Runtime generation instructions executed by Claude Code | Established in Phase 1; this is the only insertion point |
| Format contract | `examples/output-sample.md` | Canonical output shape — section order, citation variants, heading style | Phase 1 established this as the format bible; all output must match it |
| Grounding rules | `.claude/skills/science/prompts/system.md` | Prohibits memory citations; forces all claims to fetched sources | Already enforced in Step 2; no changes needed |

### Input Contract from Phase 2

Step 5 receives a structured source list. Each source record contains:

| Field | Type | Example |
|-------|------|---------|
| `title` | str | "CRISPR-Cas9 Efficiency in Hepatocytes" |
| `authors` | str | "Lopez, A., Kim, J., et al." |
| `journal` | str | "Nature Medicine" |
| `year` | str | "2026" |
| `doi` | str or None | "10.1038/s41591-026-03211-7" |
| `url` | str | "https://pubmed.ncbi.nlm.nih.gov/41730016/" |
| `body` | str | Full article body or abstract (≥2,000 chars, or abstract+news pair) |
| `label` | str | "[Published in: Nature Medicine, 2026]" |
| `image_url` | str or None | "https://www.sciencedaily.com/images/1920/file.jpg" |
| `image_license` | str or None | "[CC-licensed]" or "[Copyrighted - use with permission]" |
| `source_type` | str | "academic" or "news" |

### Output Contract

Section order must match `examples/output-sample.md` exactly:
```
# [Topic Title]
**Date:** YYYY-MM-DD | **Field:** [Field] | **Sources:** N
---
## Slide 1: [Title]   ← hook, under 10 words
## Slide 2: [Title]   ← body + cliff-hanger
...
## Slide N: [Title]   ← takeaway + CTA
---
## Caption
[3-5 paragraphs, 400-600 words, under 2,100 characters]
---
## Hashtags
#Tag1 #Tag2 #Tag3 #Tag4 #Tag5
---
## Sources
1. Author, A., et al. (Year). Title. *Journal*, *Vol*(Issue), Pages.
   DOI: https://doi.org/...
   URL: https://...
   [Label]
---
## Images
- https://absolute-url.com/image.jpg
```

---

## Architecture Patterns

### Recommended Step 5 Structure

```
SKILL.md Step 5: Generate carousel output
├── Rule 1: Finding selection
│   └── Pick single most compelling finding from source list
│       (prioritize cross-validated academic+news findings)
│
├── Rule 2: Slide generation (CONT-01, CONT-02, CONT-03, CONT-06)
│   ├── Count: 5-7 slides
│   ├── Slide 1: Hook — under 10 words, question or surprising fact
│   ├── Slide 2 through N-1: Body — ~150 chars, cliff-hanger endings
│   └── Slide N: Takeaway + CTA
│
├── Rule 3: Caption generation (CONT-04, CONT-06)
│   ├── Arc: question hook → context → finding → significance → closing question
│   ├── Length: 400-600 words, hard ceiling 2,100 characters
│   └── Keyword in first sentence
│
├── Rule 4: Hashtag generation (CONT-05)
│   └── Exactly 5, one line, space-separated
│
├── Rule 5: Citation formatting (CITE-01, CITE-02)
│   └── Match examples/output-sample.md exactly — all three variant types
│
└── Rule 6: Image output (CITE-03)
    └── Include ALL image_url fields from source list (not just first)
```

### Pattern 1: Finding Selection Logic

**What:** When multiple sources cover multiple findings, Step 5 must pick one focal finding for the carousel.
**When to use:** Every run — even single-source topics have multiple possible angles.
**Rule:**
```
Finding selection priority order:
1. Cross-validated finding (academic paper + news article on same topic) — highest credibility + narrative depth
2. Most counterintuitive or surprising result (headline potential)
3. Most quantitatively specific (has a memorable statistic)
4. Most recent (within 7-day window)

Build the entire carousel around this single finding. Do not try to cover all sources equally.
```

### Pattern 2: Slide Slot Allocation

**What:** A disciplined narrative arc for 5-7 slides that works regardless of topic.
**When to use:** Every carousel.

```
Slide 1 (Hook):       Under 10 words. Question or surprising fact. Emoji allowed.
                      Example: "What if everything we knew was wrong? JWST found out."

Slide 2 (Build-up 1): The finding stated plainly with one supporting stat.
                      Cliff-hanger ending: "But how is that even possible?"

Slide 3 (Build-up 2): The mechanism or background needed to understand the finding.
                      Cliff-hanger ending: "That's not the weird part."

Slide 4 (Reveal):     The implication or surprising consequence.
                      Cliff-hanger ending: "Scientists weren't expecting what came next."

Slide 5+ (optional):  Additional depth if 6-7 slides warranted by source richness.
                      Each body slide ends with cliff-hanger.

Final slide (CTA):    One-sentence key takeaway. CTA line. Emoji allowed.
                      Example: "JWST is rewriting everything. Follow for daily science drops."
```

### Pattern 3: Caption Narrative Arc

**What:** 3-5 paragraph structure for the 400-600 word caption.
**When to use:** Every run.

```
Paragraph 1 (Hook):       Question that includes topic keyword. Podcast-episode-title energy.
                          Example: "What happens when CRISPR meets cancer cells?"

Paragraph 2 (Context):    Background needed to appreciate the finding. 2-3 sentences.

Paragraph 3 (Finding):    The discovery stated clearly. Name-drop journal/outlet naturally.
                          Example: "A study published in Nature Medicine found that..."

Paragraph 4 (Significance): Why it matters. What it changes. What it challenges.

Paragraph 5 (Close):      Forward-looking question. Invites engagement. No CTA.
                          Example: "Could this change how we treat cancer within a decade?"

Character count check: Total caption must be ≤2,100 characters. Count and trim if needed.
```

### Pattern 4: Citation Format (Three Variants)

All three citation variants shown in `examples/output-sample.md` must be used correctly:

```
Variant A — Published academic paper:
{Author, A., et al.} ({Year}). {Title}. *{Journal}*, *{Volume}*({Issue}), {Pages}.
   DOI: https://doi.org/{doi}
   URL: {url}
   [Published in: {Journal}, {Year}]

Variant B — Preprint (arXiv without journal_ref):
{Author, A., et al.} ({Year}). {Title}. *arXiv*.
   URL: https://arxiv.org/abs/{id}
   [Preprint - not peer reviewed]

Variant C — News article:
{Author, A.} ({Year}, {Month} {Day}). {Title}. *{Outlet}*.
   URL: {url}
   [News article]
```

**Rule:** When volume/issue/pages are unknown (common for recent publications), omit those fields rather than inventing them. DOI line only appears when a real DOI is available.

### Pattern 5: Hashtag Selection

**What:** Exactly 5 hashtags — not 4, not 6.
**Selection logic:**
```
1 × Topic-specific (e.g., #CRISPRTherapy, #JamesWebbTelescope)
1 × Field-level (e.g., #Astrophysics, #Genetics, #Neuroscience)
1 × Broad science (e.g., #ScienceExplained, #ScienceNews)
1 × Platform reach (e.g., #LearnOnInstagram, #ScienceFacts)
1 × Trending/topical (e.g., #SpaceScience, #MedicalBreakthrough)

Format: All on one line, space-separated, no commas, no period.
Example: #JamesWebbTelescope #Astrophysics #SpaceScience #GalaxyFormation #ScienceExplained
```

### Anti-Patterns to Avoid

- **Writing to all sources equally:** Carousel quality degrades when you try to represent every source. Pick one focal finding; other sources inform the caption depth and citation list.
- **Inline citations in slides:** "A 2026 study found [1]..." breaks the punchy voice. All citations go in the Sources section only. Name-drop naturally: "Nature Medicine reports..."
- **Caption word count vs. character count confusion:** 400-600 words is the readability target; 2,100 characters is the hard ceiling. Both must be checked. A 600-word caption can exceed 2,100 chars if sentences are long.
- **Fabricating volume/issue/page numbers:** When the structured source list doesn't include volume/issue data, omit those fields. Do not invent them to look like a complete citation.
- **Slide text exceeding ~150 characters:** Body slides are meant to be glanceable on a phone screen. Long slides fail the copy-paste-ready requirement. Each slide should be 2-3 short punchy sentences.
- **Cliff-hangers that don't connect forward:** "But there's a catch." only works if the next slide reveals the catch. Each cliff-hanger must be resolved or escalated in the following slide.
- **Wrong hashtag count:** Exactly 5. Generation instructions must state this explicitly with the word "exactly" — Claude will otherwise default to "relevant hashtags" which produces variable counts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tone consistency | Custom voice prompt engineering from scratch | The Kurzgesagt narrator model already defined in CONTEXT.md — embed it verbatim in Step 5 | The voice model is fully specified; re-inventing it introduces drift |
| Citation formatting | Citation rendering logic | Match `examples/output-sample.md` three-variant pattern exactly | Format contract is locked; any deviation breaks downstream copy-paste workflow |
| Character counting | Any calculation at write-time | Instruct Claude to count and trim if needed before writing | Claude can introspect its own output before finalizing |
| Finding selection | Ranking algorithm | Priority-ordered prose rules in Step 5 | Claude's semantic judgment is more reliable than keyword-matching for finding quality assessment |
| Image deduplication | Custom URL comparison | Instruct: include ALL `image_url` fields from source list | Source list never has more than ~5 images; deduplication overhead isn't worth the complexity |

**Key insight:** Every "logic" problem in this phase is best solved by precise instruction prose, not by code. SKILL.md is an instruction file, not a program.

---

## Common Pitfalls

### Pitfall 1: Caption Exceeds 2,100 Character Ceiling

**What goes wrong:** 400-600 words at an average 5 chars/word = 2,000-3,000 characters — the upper range busts the ceiling. A verbose 600-word caption will routinely fail.
**Why it happens:** Word-count and character-count are different constraints. Writers (and LLMs) think in words, not characters.
**How to avoid:** Step 5 must explicitly instruct Claude to count characters before finalizing the caption and trim to ≤2,100 if needed. The instruction must say "characters, not words" to prevent confusion.
**Warning signs:** Output caption is long but under 600 words — check character count.

### Pitfall 2: Cliff-Hanger on Final Slide (Should Be CTA)

**What goes wrong:** Claude applies the "end each slide with a cliff-hanger" rule to the final slide, which should be a takeaway + CTA.
**Why it happens:** General rules override slide-specific rules if not explicitly scoped.
**How to avoid:** Step 5 instructions must scope cliff-hanger rule explicitly: "body slides 2 through N-1 end with cliff-hangers; the final slide ends with a takeaway + CTA."
**Warning signs:** Final slide says "But what happens next?" instead of "Follow for daily science drops."

### Pitfall 3: Missing Image URLs in Output

**What goes wrong:** Step 5 generates beautiful slides and caption but omits the Images section, or only includes the first image URL.
**Why it happens:** The current Step 5 instructions don't explicitly mandate image output. CITE-03 requires "at least one source image URL" but the generation logic needs to actively collect and output them.
**How to avoid:** Step 5 must explicitly state: "Collect ALL non-None image_url values from the source list. Output them all in the Images section. If no images were found, note 'No source images available' in the Images section."
**Warning signs:** Output file has no Images section, or Images section is missing when source list had image_url values.

### Pitfall 4: Hashtag Count Drift

**What goes wrong:** Output has 7 hashtags, or 3 hashtags, or hashtags embedded in the caption.
**Why it happens:** "5 relevant hashtags" is interpreted loosely. "Exactly 5" must be stated explicitly.
**How to avoid:** Step 5 must say "Generate EXACTLY 5 hashtags — no more, no less." Include the word "exactly" in the instruction.
**Warning signs:** Hashtag line doesn't have exactly 5 `#` characters.

### Pitfall 5: Slides That Exceed ~150 Characters

**What goes wrong:** Slides read like paragraphs instead of scannable cards. Fails the copy-paste-ready requirement and the "2-3 short punchy sentences" rule.
**Why it happens:** Without an explicit character target, Claude defaults to complete explanations rather than slide-appropriate brevity.
**How to avoid:** State the ~150-character target per body slide explicitly. State that slides must be glanceable at a 3-second reading.
**Warning signs:** Any body slide exceeds 200 characters.

### Pitfall 6: Natural Journal Name-Drop Conflicts with Grounding Rule

**What goes wrong:** The grounding rule (prompts/system.md) prohibits using knowledge from training memory. But the voice strategy says to "name-drop journal/outlet naturally." A confused generation might invent a journal name from memory.
**Why it happens:** Tension between two rules: be natural AND only use fetched data.
**How to avoid:** Step 5 must clarify: name-drops must come from the `journal` or `journal_or_outlet` field in the source list — not from Claude's training knowledge. "A study published in *{source.journal}* found..." where source.journal was fetched.
**Warning signs:** A journal name appears in the caption that doesn't match any source's journal field.

---

## Code Examples

Verified patterns from the project's own format contract:

### Slide Hook Examples (CONT-02)

```markdown
# Source: examples/output-sample.md

## Slide 1: The Universe Just Got Older

What if everything we knew about galaxy formation was wrong? JWST found out.
```

Hook rules visible in this example:
- H2 heading with slide number + descriptive title
- Body is under 10 words (9 words: "What if everything we knew about galaxy formation was wrong?")
- Question form
- No emoji (though emoji is allowed per CONTEXT.md)

### Body Slide with Cliff-Hanger (CONT-03)

```markdown
## Slide 2: Galaxies That Shouldn't Exist

JWST spotted two galaxy candidates at redshifts of z ≈ 10-12, placing them just 300-400 million years after the Big Bang. These objects are far brighter and more massive than any model predicted. How did they grow so fast?
```

Cliff-hanger pattern: question ending that teases the next slide's explanation.

### Citation Variants (CITE-01, CITE-02)

```markdown
# Source: examples/output-sample.md

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

### Images Section (CITE-03)

```markdown
# Source: examples/output-sample.md

## Images

- https://stsci-opo.org/STScI-01G8H1NJJ9YSAQFMXBP9TKBSXF.png
- https://stsci-opo.org/STScI-01G8H36XHYQKK6DPJZKYQ7ZMNQ.png
```

Rule: All image URLs are absolute. One per line with leading dash. No license labels in the Images section (labels belong to source citations). Multiple URLs when available.

### Caption Structure (CONT-04)

```markdown
# Source: examples/output-sample.md — annotated with arc labels

## Caption

[HOOK — question with keyword]
What do you do when the universe doesn't follow the rules? You rewrite the textbook...

[CONTEXT — background]
JWST launched in December 2021 and reached its final orbit...

[FINDING — the discovery, natural journal name-drop]
Among the most startling findings: two galaxy candidates at redshifts of approximately z = 10 to 12...

[SIGNIFICANCE — why it matters]
Here's why that matters. Galaxy formation models predict that it takes time...

[CLOSE — forward-looking question, no CTA]
JWST is just getting started. Its instruments are rated for a 10-year minimum mission...
```

Note: The sample caption does not end with a CTA (no "Follow for..." in the caption). CTA is only in the final slide.

### Hashtag Format (CONT-05)

```markdown
# Source: examples/output-sample.md

## Hashtags

#JamesWebbTelescope #Astrophysics #SpaceScience #GalaxyFormation #ScienceExplained
```

Exactly 5. Space-separated. Single line. No commas. No trailing punctuation.

---

## State of the Art

| Old Approach | Current Approach | Phase | Impact |
|--------------|-----------------|-------|--------|
| Step 5 minimal instructions | Step 5 complete prescriptive ruleset | Phase 3 | Output will consistently meet all 9 requirements every run |
| Placeholder sources only | Real fetched sources from Step 4 | Phase 2 (done) | Step 5 now has real data to generate from |
| Single citation format | Three citation variant types | Phase 1 (done) | Correct label for academic/preprint/news sources |

**Current Step 5 (before Phase 3):**
```
## Step 5: Generate carousel output

Generate the full carousel package following the format in `examples/output-sample.md` exactly.

Requirements:
- Metadata header, horizontal rule, 5-7 slides, caption, 5 hashtags, sources, images
- Slide 1 hook under 10 words
- Caption under 2,100 characters
- Exactly 5 hashtags
```

This is a skeleton. Phase 3 replaces it with complete, unambiguous rules covering voice, finding selection, slide arc, cliff-hangers, caption arc, character ceiling enforcement, citation variants, and image output.

---

## Open Questions

1. **When volume/issue/pages are unknown in the source list**
   - What we know: Phase 2's structured source list does not include volume/issue/pages fields — these weren't extracted
   - What's unclear: Whether to instruct Step 5 to attempt extraction from `body` text or simply omit the fields
   - Recommendation: Instruct Step 5 to omit volume/issue/pages when not present in the source list. Do not attempt to extract from body text — too error-prone and risks fabrication. The DOI and URL are sufficient for traceability.

2. **How to handle topics where the source list has zero image_url values**
   - What we know: arXiv always returns `image_url: None`. If only arXiv sources pass the quality gate, the Images section has nothing.
   - What's unclear: Whether CITE-03 ("at least one source image URL") means the run should fail, or that the section should say "No source images available"
   - Recommendation: Include a fallback note in the Images section ("No source images available from fetched sources") rather than failing the run. Flag this as a partial CITE-03 failure in the terminal summary. A complete failure on image availability should be surfaced to the user, not silently omitted.

3. **Caption word count vs. character count: which to enforce first**
   - What we know: 400-600 words targets readability; 2,100 characters is the hard technical ceiling
   - What's unclear: Whether to write to word count and then trim to character count, or write to character count directly
   - Recommendation: Write to word count first (draft at natural length), then check character count and trim. Step 5 should explicitly say "count characters in the final caption before writing; if over 2,100 characters, shorten sentences in the significance or context paragraphs."

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual smoke test (same as Phase 2) — SKILL.md workflow, not a testable application |
| Config file | None |
| Quick run command | `/science [topic]` — run in Claude Code, inspect output file |
| Full suite command | Run twice against two different topics |

**Note:** This is a SKILL.md instruction file, not a Python/Node application. Automated unit tests do not apply. Verification is by running the skill and inspecting the output file against each success criterion.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|---------------------|-----------|
| CONT-01 | Output contains 5-7 labeled slide sections | smoke | Count `## Slide` headings in output file | Manual (grep count) |
| CONT-02 | Slide 1 body text is under 10 words | smoke | Read Slide 1 body, count words | Manual |
| CONT-03 | Each body slide (2 through N-1) ends with cliff-hanger or question | smoke | Read each body slide ending | Manual |
| CONT-04 | Caption is 400-600 words, keyword in first sentence, under 2,100 characters | smoke | Word count + character count + first-sentence keyword check | Manual |
| CONT-05 | Hashtag line has exactly 5 hashtags | smoke | Count `#` occurrences in Hashtags section | Manual (grep count) |
| CONT-06 | Tone matches cool-professor register | smoke | Read aloud; check for jargon without gloss, condescension, or dryness | Manual subjective |
| CITE-01 | Each source has authors, year, DOI (where available), publication date | smoke | Inspect each source entry in Sources section | Manual |
| CITE-02 | Each citation has clickable URL | smoke | Confirm `URL: https://` line present for every citation | Manual |
| CITE-03 | At least one source image URL in Images section | smoke | Inspect Images section | Manual |

### Sampling Rate

- **Per task commit:** Run `/science [topic]` once, inspect output file against all 9 criteria above
- **Per wave merge:** Run twice — one science-heavy topic (e.g., "CRISPR gene editing") and one space/physics topic (e.g., "black hole mergers")
- **Phase gate:** Both test runs produce output files where all 9 requirements pass

### Wave 0 Gaps

None — no new test infrastructure needed. Verification is manual inspection per the success criteria table above. The skill itself is the test surface.

---

## Sources

### Primary (HIGH confidence)

- `examples/output-sample.md` (project file) — canonical format contract; every pattern in this research is derived from it
- `.claude/skills/science/SKILL.md` (project file) — current Step 5 content; shows exactly what will be replaced
- `.planning/phases/03-content-generation/03-CONTEXT.md` (project file) — all locked decisions directly inform the generation rules
- `.planning/phases/02-source-fetching/02-RESEARCH.md` (project file) — source list data contract confirmed; image_url field presence/absence verified

### Secondary (MEDIUM confidence)

- Instagram platform constraints (caption 2,200 chars max, hashtag best practices) — knowledge validated against Phase 1 research conclusions already in the project; no new web research needed given HIGH confidence from Phase 1

### Tertiary (LOW confidence)

- None — all claims in this research are grounded in project files with directly verifiable content

---

## Metadata

**Confidence breakdown:**
- Generation rules and format: HIGH — derived directly from `examples/output-sample.md` (the locked format contract) and CONTEXT.md decisions
- Step 5 insertion point: HIGH — confirmed by reading current SKILL.md; Step 5 is minimal and clearly the replacement target
- Input data contract: HIGH — Phase 2 RESEARCH.md and PLAN.md fully document the source list schema
- Character counting behavior: HIGH — 2,100 char ceiling established in Phase 1 and confirmed in CONTEXT.md
- Hashtag count enforcement: HIGH — CONT-05 is unambiguous; "exactly 5" is the rule

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (all findings are based on project files, not external APIs; no expiry on format contracts)
