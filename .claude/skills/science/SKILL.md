---
name: science
description: Generate an Instagram science carousel package for a science topic. Fetches source material, writes carousel slides, caption, hashtags, and citations.
argument-hint: [topic]
disable-model-invocation: true
allowed-tools: Read, Write, WebFetch, WebSearch, Bash
---

Generate an Instagram science carousel for: $ARGUMENTS

## Step 1: Confirm topic

Show the user the topic (`$ARGUMENTS`) and today's date. Ask them to confirm before proceeding.

If no topic was provided (i.e., `$ARGUMENTS` is empty), ask the user to provide one before continuing.

## Step 2: Load grounding rules

Read the file at `${CLAUDE_SKILL_DIR}/prompts/system.md`.

Apply every rule in that file for the remainder of this session. No exceptions.

## Step 3: Load format reference

Read `examples/output-sample.md` (relative to the project root).

This is the canonical format contract. Every section, heading style, citation format, and ordering in your output must match it exactly.

## Step 4: Fetch source material

Fetch real content from all 6 source channels. Execute Phases A through D in order.

### Phase A: Parallel source search

Perform all 6 searches simultaneously (parallel WebFetch calls). Calculate date variables first:
- TODAY = today's date in YYYYMMDD format (GMT)
- 7_DAYS_AGO = today minus 7 days in YYYYMMDD format (GMT)
- CURRENT_YEAR = current 4-digit year
- TOPIC = the topic from `$ARGUMENTS`, URL-encoded (spaces → `+`)

**1. arXiv**

```
WebFetch https://export.arxiv.org/api/query?search_query=submittedDate:[{7_DAYS_AGO}0000+TO+{TODAY}2359]+AND+abs:{TOPIC}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending
```

CRITICAL: Use `export.arxiv.org` domain exclusively — never `arxiv.org` (blocked by WebFetch bug #19287).

Extract from each Atom `<entry>`:
- `<title>` — paper title
- `<summary>` — abstract text
- `<published>` — parse year from date string
- `<author><name>` — collect first 3, append "et al." if more
- `<id>` — extract arXiv ID (e.g. `2401.12345`)
- `<arxiv:journal_ref>` — if present, captures journal name and year
- `<arxiv:doi>` — if present
- `<link title="pdf">` href — PDF URL

Peer-review label logic:
- If `<arxiv:journal_ref>` is present and non-empty: `[Published in: {journal_ref}]`
- If `<arxiv:journal_ref>` is absent or empty: `[Preprint - not peer reviewed]`
- Default to preprint — never falsely claim peer review.

Image: `image_url: None` (arXiv does not provide images via the API).

**2. PubMed** (two-step fetch)

Step 1 — ESearch:
```
WebFetch https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={TOPIC}&retmax=5&retmode=json&datetype=pdat&reldate=7&sort=pub+date
```

Extract PMID list from `esearchresult.idlist`.

Step 2 — EFetch (use top 2–3 PMIDs from Step 1):
```
WebFetch https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={PMID1},{PMID2},{PMID3}&retmode=xml&rettype=abstract
```

Extract from each `<PubmedArticle>`:
- `<ArticleTitle>` — paper title
- `<AbstractText>` — abstract (may have Label attributes; concatenate all sections)
- `<Journal><Title>` — journal name
- `<PubDate><Year>` — publication year
- `<Author>` list: `<LastName>` + `<ForeName>`, first 3 + "et al."
- `<ArticleId IdType="doi">` — DOI if present
- `<ArticleId IdType="pmc">` — PMC ID if present

Peer-review label: Always `[Published in: {Journal}, {Year}]` — PubMed results are peer-reviewed by definition.

Image: If PMC ID is present, note that full text with figures is at `https://pmc.ncbi.nlm.nih.gov/articles/PMC{id}/`. Set `image_license: [CC-licensed]` (PMC open-access figures). If no PMC ID: `image_url: None`.

Rate limit: Max 3 requests/second to NCBI. No API key needed.

**3. ScienceDaily** (two-step fetch)

Step 1 — RSS:
```
WebFetch https://www.sciencedaily.com/rss/all.xml
```
Extract items: title, link, description, pubDate. Filter to last 7 days and topic relevance.

Step 2 — Article fetch (top 2–3 relevant items):
```
WebFetch {article_url}
```
Extract: body text, image URL (prefix relative paths with `https://www.sciencedaily.com`), Journal Reference section (contains DOI if available).

Label: `[News article]`. Image license: `[Copyrighted - use with permission]`.

**4. Phys.org** (two-step fetch)

Step 1 — RSS:
```
WebFetch https://phys.org/rss-feed/science-news/
```
Extract items: title, link, description, pubDate, `media:thumbnail` URLs.

Step 2 — Article fetch (top 2–3 relevant items):
```
WebFetch {article_url}
```
Extract: body text from article container, images from CDN (`https://scx1.b-cdn.net/csz/news/800a/{filename}`), DOI from citation section.

Label: `[News article]`. Image license: `[Copyrighted - use with permission]`.

**5. Nature News** — RSS + optional article fetch

```
WebFetch https://www.nature.com/nature.rss
```

Extract per item: title, link, `prism:doi`, `dc:date`, `dc:creator`, `content:encoded`.

DOI prefix routing:
- DOI starts with `d41586-` → news/commentary → `[News article]`
- DOI starts with `s41586-` → research article → `[Published in: Nature, {year}]`

Filter `dc:date` to last 7 days.

Optionally fetch individual article pages for full body text. If article page fetch fails, use `content:encoded` from RSS as body.

**6. Ars Technica** — WebSearch fallback

```
WebSearch "site:arstechnica.com/science {TOPIC} {CURRENT_YEAR}"
```

Attempt `WebFetch` on each discovered URL. If blocked, skip and log as unavailable.

Label: `[News article]`. Image license: `[Copyrighted - use with permission]`.

---

### Phase B: Quality gate

After all fetches complete, apply the quality gate to every collected source:

- **Keep:** Sources with body text ≥ 2,000 characters.
- **Exception — PubMed abstracts below 2,000 characters:** Keep as a citation-only source IF it will be paired with a news article covering the same finding. Measure abstract + all metadata fields together. If still short after combining, keep as citation-only and pair with news.
- **Discard:** All other sources under 2,000 characters.
- **Log:** Print each skipped source to terminal with reason (e.g., "Skipped: [title] — body text too short (843 chars)").

---

### Phase C: Cross-source matching

After quality gate, compare titles and abstracts across all collected sources:

- Group sources that cover the same finding (academic paper + news article about it, or multiple news articles on the same story).
- When a match is found: group those sources consecutively in the source list and add the note "Coverage of the same finding".
- Prioritize cross-validated findings (academic + news on same topic) when selecting what to feature in the carousel.
- If no cross-match found after reviewing all titles/abstracts: proceed immediately. Note "Sources not cross-validated" in the output. Do NOT stall searching for matches.

---

### Phase D: Build structured source list for Step 5

Compile all sources that passed the quality gate into a structured list. For each source record:

| Field | Description |
|---|---|
| title | Full title |
| authors | First 3 authors + "et al." if more |
| journal_or_outlet | Journal name or news outlet name |
| year | Publication year |
| doi | DOI string, or `None` |
| url | Canonical URL |
| body_text | Full fetched body text |
| peer_review_label | One of: `[Published in: Journal, Year]`, `[Preprint - not peer reviewed]`, `[News article]` |
| image_url | Absolute URL, or `None` |
| image_license | `[CC-licensed]`, `[Copyrighted - use with permission]`, or `None` |
| source_type | `"academic"` or `"news"` |

**Minimum requirements:**
- At least 1 academic source (`source_type: "academic"`)
- At least 1 news source (`source_type: "news"`)
- Target 3–5 total sources

**If a channel returned 0 results for the 7-day window:** Retry that channel only with a 30-day window (`reldate=30` for PubMed; adjust date range for arXiv). Log the relaxation: "Relaxed date window to 30 days for [channel] — no results in 7-day window."

---

### Failure handling

- Skip any unreachable source channel and log it: "Skipped [channel] — fetch failed: [error]."
- Only fail the entire run if ALL channels are unreachable.
- After all fetches, print a fetch summary to terminal:
  - Which sources were searched
  - Which returned usable results (with count)
  - Which were skipped (with reason)

Pass the structured source list to Step 5.

## Step 5: Generate carousel output

Generate the full carousel package following the format in `examples/output-sample.md` exactly.

Requirements:
- **Metadata header:** `# [Topic Title]` followed by `**Date:** YYYY-MM-DD | **Field:** [Field] | **Sources:** N`
- **Horizontal rule** separates metadata from slides
- **Slide count:** 5-7 slides
- **Slide 1 (hook):** under 10 words — a question or surprising fact. Emoji allowed.
- **Body slides (2 through N-1):** approximately 150 characters each, 2-3 short punchy sentences. No emoji. Each body slide must end with a cliff-hanger or question to encourage swiping.
- **Final slide (takeaway/CTA):** key takeaway in one line + call-to-action (e.g., "Follow for daily science drops"). Emoji allowed.
- **Caption:** casual + authoritative tone, keyword in first sentence. MUST stay under 2,100 characters total.
- **Hashtags:** exactly 5 hashtags on one line, space-separated
- **Sources:** numbered list — use all three citation variants shown in `examples/output-sample.md` where applicable: `[Published in: Journal, Year]`, `[Preprint - not peer reviewed]`, `[News article]`
- **Images:** at least one source image URL

Section order: Slides → Caption → Hashtags → Sources → Images

## Step 6: Write output file

1. Create a slug from the topic: lowercase, words separated by hyphens, no special characters (e.g., "Black Hole Acoustics" → "black-hole-acoustics")
2. Write the full carousel package to `output/YYYY-MM-DD-[slug].md` using today's date

## Step 7: Print terminal summary

After writing the file, print this summary to the terminal — do NOT print the full carousel content:

```
Generating carousel for: [Topic]...
Generated: [Topic]
   Slides: N | Sources: N | Field: [Field]
   -> output/YYYY-MM-DD-[slug].md
```
