# Phase 2: Source Fetching - Research

**Researched:** 2026-03-15
**Domain:** Academic API fetching (arXiv, PubMed), news RSS/HTML fetching, peer-review detection, source cross-linking
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Source selection:**
- Academic sources (both primary): arXiv (`export.arxiv.org/api/query`) and PubMed — search both in parallel for every topic
- News sources (4 sites): ScienceDaily, Ars Technica, Nature News, Phys.org
- Failure handling: Skip unreachable sources and log in terminal output; only fail the run if ALL sources are unreachable
- Target source count: 3-5 sources per topic, aiming for at least 1 academic + 1 news

**Fetch pipeline flow:**
- Search strategy: Parallel — search all sources (arXiv, PubMed, news sites) simultaneously
- Recency filter: Last 7 days — prioritize content from the past week
- Paywall handling: If full paper text is behind a paywall, use the abstract for citation data and rely on news articles for narrative content. arXiv papers are typically full-text accessible.
- Quality gate: Article body must be >2,000 characters (not abstract-only). Abstract + news coverage combo is acceptable when paper is paywalled.

**Peer-review detection:**
- arXiv papers: Use `journal_ref` field when populated → `[Published in: Journal, Year]`. When `journal_ref` is empty, default to `[Preprint - not peer reviewed]` — conservative, never falsely claims peer review
- PubMed results: Assume peer-reviewed → `[Published in: Journal, Year]` using journal name and date from PubMed metadata
- News articles: Label as `[News article]` — consistent with Phase 1 sample output
- Image licensing: Label by source type heuristic — images from open-access papers/CC sources get `[CC-licensed]`, images from news sites get `[Copyrighted - use with permission]`

**Cross-source linking:**
- Matching method: Let Claude judge semantically — after fetching all sources, compare titles/abstracts/content and group related sources. No explicit algorithm needed.
- Presentation: Group matched sources consecutively in the Sources section with a note like "Coverage of the same finding"
- No match found: Proceed anyway — cross-validation is nice-to-have, not a blocker. Note in output if sources weren't cross-validated.
- Priority: Cross-validated findings (paper + news coverage) are prioritized over single-source findings when choosing what to feature in the carousel

### Claude's Discretion
- Exact search query construction for each source API
- Number of results to request per API call
- How to extract/parse content from each news site's HTML
- Temp file or in-memory handling of fetched content
- Exact ordering of sources in output when no cross-validation match exists

### Deferred Ideas (OUT OF SCOPE)
- Science et Vie (French-language source) — potential v2 addition for international coverage
- User-specified topic input (`/science [topic]`) already scaffolded but real topic handling is Phase 4 auto-discovery
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FETCH-01 | Skill fetches science content from news sites (Nature, ScienceDaily, Ars Technica) | RSS feed URLs verified; ScienceDaily RSS + Phys.org RSS confirmed accessible; Nature.com RSS confirmed; Ars Technica blocked — use WebSearch fallback |
| FETCH-02 | Skill fetches science content from academic sources (arXiv API, PubMed) | Both APIs verified working; full URL patterns, query syntax, and response fields documented |
| FETCH-04 | Skill cross-validates topic across academic + news sources when available | Semantic grouping via Claude judgment; consecutive grouping pattern documented |
| CITE-04 | Preprints are labeled as such (not presented as peer-reviewed) | `arxiv:journal_ref` field confirmed for detecting peer review; field is absent on fresh preprints — default-to-preprint rule is correct |
| CITE-05 | Image license status flagged (CC-licensed vs copyrighted) | Source-type heuristic confirmed: arXiv/PMC open-access = CC-licensed; news site images = copyrighted |
</phase_requirements>

---

## Summary

Phase 2 wires the science skill's Step 4 placeholder into a real parallel fetch pipeline. The implementation uses two academic APIs (arXiv Atom XML and PubMed E-utilities) alongside four news sources fetched via RSS feed or direct HTML page parsing.

Both academic APIs are confirmed working with no authentication required. arXiv is accessed exclusively via `export.arxiv.org` (not `arxiv.org`) due to a known WebFetch block on the main domain (STATE.md). arXiv returns Atom XML with fields for title, abstract, authors, publication date, and — when published — `arxiv:journal_ref` and `arxiv:doi`. The `journal_ref` field is consistently absent on recent preprints (verified across two test queries), confirming that the default-to-preprint rule is the correct conservative choice. PubMed E-utilities return rich XML including journal title, volume, issue, year, full author list, DOI, and labeled abstract sections. PubMed articles are reliably peer-reviewed by definition.

For news sites: ScienceDaily's RSS feed (`https://www.sciencedaily.com/rss/all.xml`) is confirmed accessible and returns titles, descriptions (summary-only), dates, and article URLs. Individual ScienceDaily article pages provide full body text (~2,650 characters), relative image paths (prefixable with `https://www.sciencedaily.com`), and a structured Journal Reference section with DOI. Phys.org's RSS feed (`https://phys.org/rss-feed/science-news/`) is confirmed accessible and includes `media:thumbnail` image URLs per item. Phys.org article pages provide ~3,200 characters of body text and a DOI. Nature.com RSS (`https://www.nature.com/nature.rss`) is confirmed and includes DOIs via `prism:doi` and both news and research entries. Ars Technica is blocked by WebFetch — use WebSearch to find recent Ars Technica science articles by URL, then attempt WebFetch on the individual article page.

**Primary recommendation:** Drive the fetch pipeline from SKILL.md Step 4 as parallel WebFetch/WebSearch calls to the five source channels. Parse each response in-memory. Build a structured source list and pass it directly to Step 5 for content generation.

---

## Standard Stack

### Core

| Tool | API/URL | Purpose | Why Standard |
|------|---------|---------|--------------|
| WebFetch | `https://export.arxiv.org/api/query` | arXiv Atom XML query | Confirmed accessible; required by STATE.md |
| WebFetch | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` | PubMed ID search | Free, no auth required, 3 req/sec rate limit |
| WebFetch | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi` | PubMed article metadata + abstract | Returns DOI, journal, authors, abstract in XML |
| WebFetch | `https://www.sciencedaily.com/rss/all.xml` | ScienceDaily article list | Confirmed accessible; includes summaries and article URLs |
| WebFetch | `https://phys.org/rss-feed/science-news/` | Phys.org article list with thumbnails | Confirmed accessible; includes `media:thumbnail` per item |
| WebFetch | `https://www.nature.com/nature.rss` | Nature News + research article feed | Confirmed accessible; includes `prism:doi` per item |
| WebSearch | Ars Technica science articles | Fallback when direct fetch blocked | Direct WebFetch to arstechnica.com is blocked |

### Confirmed Feed URLs

| Source | URL | Access | Content in Feed |
|--------|-----|--------|----------------|
| ScienceDaily | `https://www.sciencedaily.com/rss/all.xml` | Confirmed | Title, summary, link, pubDate |
| Phys.org | `https://phys.org/rss-feed/science-news/` | Confirmed | Title, summary, link, pubDate, media:thumbnail |
| Nature.com | `https://www.nature.com/nature.rss` | Confirmed (via redirect from feeds.nature.com) | Title, link, dc:date, prism:doi, dc:creator |
| Ars Technica | `https://arstechnica.com/science/feed/` | Blocked — use WebSearch fallback | N/A |

---

## Architecture Patterns

### Recommended Fetch Pipeline Structure

```
SKILL.md Step 4: Fetch source material
├── Phase A: Parallel search (all sources simultaneously)
│   ├── arXiv: WebFetch Atom XML query with date range
│   ├── PubMed: WebFetch ESearch → collect PMIDs
│   ├── ScienceDaily: WebFetch RSS feed
│   ├── Phys.org: WebFetch RSS feed
│   ├── Nature: WebFetch RSS feed
│   └── Ars Technica: WebSearch for recent science articles
│
├── Phase B: Article retrieval (follow-up fetches)
│   ├── PubMed: WebFetch EFetch for top 2-3 PMIDs → full metadata + abstract
│   ├── ScienceDaily: WebFetch individual article page → full body text + DOI + image
│   ├── Phys.org: WebFetch individual article page → full body text + DOI + image
│   └── Nature: WebFetch individual article page → content
│
├── Phase C: Quality gate
│   └── Discard any source with body text < 2,000 characters
│       (exception: abstract + news combo is acceptable)
│
├── Phase D: Cross-source matching
│   └── Semantically group sources covering the same finding
│
└── Phase E: Build source list for Step 5
    └── Structured list: {title, authors, journal, year, doi, url, body, label, image_url, image_license}
```

### Pattern 1: arXiv Date-Range Query

**What:** Filter arXiv results to recent submissions only using submittedDate range in GMT.
**When to use:** Every run — ensures 7-day recency filter.

```
URL pattern:
https://export.arxiv.org/api/query?search_query=submittedDate:[YYYYMMDD0000+TO+YYYYMMDD2359]+AND+abs:{TOPIC}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending
```

**Date construction:** Calculate 7 days ago from today's date. Format as `YYYYMMDD`. Both bounds in GMT.

**Fields to extract from each Atom entry:**
- `<title>` — paper title
- `<summary>` — abstract text
- `<published>` — ISO timestamp (parse year from this)
- `<author><name>` — all author names (collect first 3, append "et al." if more)
- `<id>` — extract arXiv ID (e.g., `2603.12267` from `http://arxiv.org/abs/2603.12267v1`)
- `<arxiv:journal_ref>` — if present: `[Published in: {journal_ref}]`; if absent: `[Preprint - not peer reviewed]`
- `<arxiv:doi>` — DOI when available
- `<link>` with `title="pdf"` — PDF URL
- Abstract HTML page URL: `https://arxiv.org/abs/{id}` (accessible for reading)

**Known constraint:** `arxiv:journal_ref` is absent on virtually all fresh preprints (<7 days old). Default to `[Preprint - not peer reviewed]` is correct.

### Pattern 2: PubMed Two-Step Fetch

**What:** ESearch returns PMIDs; EFetch retrieves full metadata for top results.
**When to use:** For every topic — PubMed guarantees peer-reviewed content.

**Step 1 — ESearch:**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={TOPIC}&retmax=5&retmode=json&datetype=pdat&reldate=7&sort=pub+date
```

**Step 2 — EFetch (top 2-3 PMIDs from Step 1):**
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={PMID1},{PMID2}&retmode=xml&rettype=abstract
```

**Fields to extract from EFetch XML:**
- `<ArticleTitle>` — title
- `<AbstractText>` — abstract body (may have Label attributes: OBJECTIVE, METHODS, RESULTS, CONCLUSIONS)
- `<Journal><Title>` — full journal name
- `<JournalIssue><PubDate><Year>` — publication year
- `<Author>` list — LastName + ForeName (collect first 3, "et al." if more)
- `<ArticleId IdType="doi">` — DOI
- `<ArticleId IdType="pmc">` — PMC ID (if present, full text available at `https://pmc.ncbi.nlm.nih.gov/articles/PMC{id}/`)
- Review status: Always `[Published in: {Journal}, {Year}]` for PubMed results

**Rate limit:** Max 3 requests/second without API key. No API key needed for this use pattern.

**Quality gate note:** PubMed abstracts are typically 250-400 words (~1,500-2,000 characters). The abstract alone may fall just below the 2,000 character gate. Combine abstract + journal name + author list for the body text measurement, or rely on paired news articles for the narrative content requirement.

### Pattern 3: ScienceDaily Two-Step Fetch

**What:** Fetch RSS for article list, then follow top 2-3 article URLs for full content.

**Step 1:** `WebFetch https://www.sciencedaily.com/rss/all.xml`
- Extract: `<title>`, `<link>`, `<description>` (summary), `<pubDate>` per item
- Filter by pubDate within last 7 days
- Filter by topic relevance (title/description match)

**Step 2:** `WebFetch {article_url}` (e.g., `https://www.sciencedaily.com/releases/2026/03/260315004407.htm`)
- Body text: All `<p>` content — confirmed ~2,650 characters per article (passes quality gate)
- Image: Relative path `/images/1920/{filename}` → prefix with `https://www.sciencedaily.com`
- Journal reference: Structured "Journal Reference" section includes author, title, publication, DOI
- Label: `[News article]`
- Image license: `[Copyrighted - use with permission]`

### Pattern 4: Phys.org Two-Step Fetch

**Step 1:** `WebFetch https://phys.org/rss-feed/science-news/`
- Extract: `<title>`, `<link>`, `<description>`, `<pubDate>`, `<media:thumbnail url="...">` per item
- Filter by pubDate within last 7 days and topic relevance

**Step 2:** `WebFetch {article_url}` (e.g., `https://phys.org/news/2026-03-thwaites-glacier-rival-entire-antarctic.html`)
- Body text: ~3,200 characters in `<article>` container (passes quality gate)
- Images: `https://scx1.b-cdn.net/csz/news/800a/{filename}` (from media:thumbnail in RSS or on-page img tags)
- DOI: Found in structured citation section on article page
- Label: `[News article]`
- Image license: `[Copyrighted - use with permission]`

### Pattern 5: Nature News Fetch

**Step 1:** `WebFetch https://www.nature.com/nature.rss`
- Extract per item: `<title>`, `<link>`, `<prism:doi>`, `<dc:date>`, `<dc:creator>`, `<content:encoded>`
- Distinguish news vs. research: news items use DOI format `d41586-*`, research uses `s41586-*`
- Filter `dc:date` within last 7 days

**Step 2:** `WebFetch {article_url}` for top 1-2 items
- Note: Nature.com article pages may have limited extractable body text — use content from RSS `<content:encoded>` as body if direct fetch fails
- Label: `[News article]` for news items; `[Published in: Nature, {year}]` for research articles

### Pattern 6: Ars Technica via WebSearch

**What:** Ars Technica direct WebFetch is blocked. Use WebSearch as the discovery mechanism.

```
WebSearch query: "site:arstechnica.com/science {TOPIC} {CURRENT_YEAR}"
```

- Extract URLs from search results
- Attempt `WebFetch {article_url}` on each result — Ars Technica article pages may also block direct fetch
- If WebFetch succeeds: extract body text normally
- If WebFetch fails: skip Ars Technica and log as unavailable; other sources provide sufficient coverage

### Anti-Patterns to Avoid

- **Do not use `arxiv.org` domain** — blocked by WebFetch bug. Use `export.arxiv.org` exclusively for API calls.
- **Do not assume `journal_ref` will be populated** — on papers <7 days old, it is virtually always absent. Default to `[Preprint - not peer reviewed]`.
- **Do not attempt to fetch PDFs** — PDF content is not parseable by WebFetch. The abstract from the API + HTML abstract page is sufficient.
- **Do not measure quality gate from the RSS summary** — RSS descriptions are summaries only. Always fetch the full article page to measure the >2,000 character requirement.
- **Do not hard-fail on a single unreachable source** — log skip in terminal output and continue.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atom XML parsing | Custom XML parser | String extraction via `<field>...</field>` patterns described in prompts, or leverage Claude's native XML comprehension | arXiv Atom is simple enough for direct parsing in-context |
| Author list truncation | Custom "et al." logic | Simple rule: extract first 3 author names, append "et al." if count > 3 | Standard academic citation convention |
| Date arithmetic for 7-day window | Custom date library | Calculate directly: `YYYYMMDD` strings for today and 7-days-ago; arXiv and PubMed both accept simple date parameters | No complex timezone math needed beyond GMT |
| RSS parsing | Custom XML parser | WebFetch returns rendered text — extract article links and dates from the structured content Claude receives | RSS items are small and scannable |
| DOI link construction | Custom URL builder | DOI always resolves via `https://doi.org/{doi}` | Standard DOI proxy |
| PubMed URL construction | Custom PMID resolver | `https://pubmed.ncbi.nlm.nih.gov/{pmid}/` | Standard PubMed permalink pattern |

---

## Common Pitfalls

### Pitfall 1: arXiv `journal_ref` Always Absent on Fresh Papers

**What goes wrong:** The peer-review detection logic checks `arxiv:journal_ref` to decide between `[Published in: ...]` and `[Preprint - not peer reviewed]`. On papers submitted in the last 7 days, this field is consistently absent — these are new preprints that haven't been published yet.

**Why it happens:** `journal_ref` is only populated after the author updates the arXiv submission with the published paper's journal reference. This takes months or years, not days.

**How to avoid:** Default to `[Preprint - not peer reviewed]` when `journal_ref` is absent. This is the correct conservative behavior.

**Warning signs:** If 100% of arXiv results show as peer-reviewed, the detection logic is broken.

### Pitfall 2: PubMed Abstract May Fall Below 2,000-Character Quality Gate

**What goes wrong:** PubMed abstracts average ~263 words (~1,600-1,900 characters). A PubMed-only source may fail the >2,000 character body text gate.

**Why it happens:** Abstracts are intentionally concise summaries. Full article text is only available for open-access PMC articles.

**How to avoid:** For PubMed sources, measure character count as: abstract text + structured metadata (authors, journal, year). If still below 2,000 chars, mark as citation-only and pair with a news article for narrative content. The abstract + news combo is explicitly permitted by the quality gate rule.

**Warning signs:** PubMed source gets discarded in every run — the gate is being applied to raw abstract length only.

### Pitfall 3: ScienceDaily/Phys.org Image URLs Are Not Absolute

**What goes wrong:** ScienceDaily article pages return image paths like `/images/1920/filename.webp`. Storing these relative paths in the output will produce broken image URLs.

**How to avoid:** Always prefix relative image paths with the domain: `https://www.sciencedaily.com` for ScienceDaily, `https://scx1.b-cdn.net` for Phys.org CDN images.

### Pitfall 4: All 5+ Sources Return Irrelevant Results

**What goes wrong:** When a topic is very niche (e.g., "tardigrade magnetoreception"), broad keyword searches return noise. The 3-5 source target isn't met.

**Why it happens:** arXiv and PubMed searches use `abs:` (abstract) or `ti:` (title) prefix. The recency filter further narrows results. A very niche topic from the past 7 days may have 0 papers.

**How to avoid:** Try `all:` search prefix first (broader), fall back to relaxing the date filter to 30 days if 7-day returns 0 results. Log this in terminal output.

### Pitfall 5: Ars Technica Blocks Both RSS Feed and Article Fetch

**What goes wrong:** `feeds.arstechnica.com/arstechnica/science` and `arstechnica.com` are blocked by WebFetch.

**How to avoid:** Use WebSearch (`site:arstechnica.com/science {topic}`) to find article URLs. Then attempt WebFetch on each URL individually. If both RSS and article fetch fail, log as unavailable and proceed with the remaining 4 sources. Ars Technica is one of 4 news sources — its absence is recoverable.

### Pitfall 6: Nature RSS Contains Research Articles, Not Only News

**What goes wrong:** Nature's RSS feed mixes news articles (DOI format `d41586-*`) with peer-reviewed research papers (DOI format `s41586-*`). Incorrectly labeling a research paper as `[News article]` violates CITE-04.

**How to avoid:** Distinguish by DOI prefix: `d41586` = news/commentary → `[News article]`; `s41586` = research article → `[Published in: Nature, {year}]`.

### Pitfall 7: Cross-Source Matching Stalls the Run

**What goes wrong:** Claude spends excessive time searching for cross-source links when no match exists. The skill hangs on Step 4 for several minutes.

**How to avoid:** Time-box the matching step. If no obvious semantic overlap is found after reviewing abstracts/titles, immediately proceed and note "Sources not cross-validated" in output. Cross-validation is nice-to-have, not required.

---

## Code Examples

### arXiv Atom XML — Field Extraction Reference

```
Fetch URL:
https://export.arxiv.org/api/query?search_query=submittedDate:[202603080000+TO+202603152359]+AND+abs:CRISPR&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending

Response XML entry structure:
<entry>
  <id>http://arxiv.org/abs/2603.XXXXX</id>
  <title>Paper Title Here</title>
  <summary>Abstract text here.</summary>
  <published>2026-03-12T17:59:59Z</published>
  <author><name>Author One</name></author>
  <author><name>Author Two</name></author>
  <link href="https://arxiv.org/abs/2603.XXXXX" type="text/html"/>
  <link href="https://arxiv.org/pdf/2603.XXXXX" title="pdf"/>
  <!-- ABSENT on fresh preprints: -->
  <!-- <arxiv:journal_ref>Nature, 2026, vol 123</arxiv:journal_ref> -->
  <!-- <arxiv:doi>10.1234/nature.2026.XXXXX</arxiv:doi> -->
</entry>

Citation construction:
- Authors: "Author One, Author Two, et al." (first 3 + et al.)
- URL: https://arxiv.org/abs/{id}
- Label: [Preprint - not peer reviewed]  (when journal_ref absent)
        [Published in: {journal_ref}]    (when journal_ref present)
- Image: None from arXiv → no image URL for this source
```

### PubMed ESearch + EFetch — Field Extraction Reference

```
Step 1 — ESearch:
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=CRISPR+gene+editing&retmax=5&retmode=json&datetype=pdat&reldate=7&sort=pub+date

Returns: {"esearchresult": {"idlist": ["41730016", "41783155", ...]}}

Step 2 — EFetch:
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=41730016,41783155&retmode=xml&rettype=abstract

Key XML fields:
<ArticleTitle>...</ArticleTitle>
<AbstractText Label="OBJECTIVE">...</AbstractText>
<AbstractText Label="METHODS">...</AbstractText>
<AbstractText Label="RESULTS">...</AbstractText>
<Journal><Title>Journal of Medical Economics</Title></Journal>
<JournalIssue><PubDate><Year>2026</Year></PubDate></JournalIssue>
<Author><LastName>Lopez</LastName><ForeName>Andrea</ForeName></Author>
<ELocationID EIdType="doi">10.1080/13696998.2026.2624971</ELocationID>
<ArticleId IdType="pmc">PMC1234567</ArticleId>  <!-- if open access -->

Citation construction:
- URL: https://pubmed.ncbi.nlm.nih.gov/{pmid}/
- DOI link: https://doi.org/{doi}
- Label: [Published in: {Journal}, {Year}]
- Image: None directly — if PMC ID present, check PMC page for figures
```

### ScienceDaily — Two-Step Fetch Reference

```
Step 1 RSS:
WebFetch https://www.sciencedaily.com/rss/all.xml

Per item extracts:
- <title> = article title
- <link> = article URL (e.g., https://www.sciencedaily.com/releases/2026/03/260315004407.htm)
- <description> = 2-3 sentence summary
- <pubDate> = e.g., "Sat, 15 Mar 2026 00:00:00 EST"

Step 2 Article page:
WebFetch https://www.sciencedaily.com/releases/2026/03/260315004407.htm

Extracts:
- Body text: All <p> content (confirmed ~2,650 chars — passes quality gate)
- Image: Relative path like /images/1920/filename.webp
  → Absolute: https://www.sciencedaily.com/images/1920/filename.webp
- Journal Reference section: Author, Title, Journal, Year, Volume, DOI
- Label: [News article]
- Image license: [Copyrighted - use with permission]
```

### Phys.org — Two-Step Fetch Reference

```
Step 1 RSS:
WebFetch https://phys.org/rss-feed/science-news/

Per item extracts:
- <title> = article title
- <link> = article URL
- <description> = summary
- <pubDate> = publication date
- <media:thumbnail url="https://scx1.b-cdn.net/csz/news/tmb/2026/filename.jpg"> = thumbnail image

Step 2 Article page:
WebFetch {article_url}

Extracts:
- Body text: <article> container paragraphs (~3,200 chars — passes quality gate)
- Images: https://scx1.b-cdn.net/csz/news/800a/{filename}
- DOI: Structured citation section (e.g., "Geophysical Research Letters (2026). DOI: 10.1029/...")
- Author: Byline (e.g., "by Hannah Bird, Phys.org")
- Label: [News article]
- Image license: [Copyrighted - use with permission]
```

### Nature.com RSS — Single-Step Extraction Reference

```
WebFetch https://www.nature.com/nature.rss

Per item extracts:
- <title> = article title
- <link> = article URL
- <dc:creator> = author name(s)
- <dc:date> = YYYY-MM-DD format
- <prism:doi> = DOI (e.g., "10.1038/d41586-026-00814-3")
- <content:encoded> = brief summary

DOI prefix routing:
- d41586-* = news/commentary → Label: [News article]
- s41586-* = research article → Label: [Published in: Nature, {year}]

Article URL: https://doi.org/{prism:doi} or use <link> directly
Image: Not included in RSS feed — may require article page fetch
```

### Structured Source Object — Data Contract for Step 5

Step 4 must produce a structured list that Step 5 (content generation, Phase 3) can consume. Each source entry:

```
source = {
  "title": str,           # Article/paper title
  "authors": str,         # "Last, F., Last, F., et al."
  "journal": str,         # Journal name or news site name
  "year": str,            # Publication year (YYYY)
  "doi": str | None,      # Full DOI string (e.g., "10.1038/s41586-...")
  "url": str,             # Canonical URL (PubMed permalink, arXiv abs, article URL)
  "body": str,            # Full extracted text (abstract or article body)
  "label": str,           # "[Published in: Journal, Year]" | "[Preprint - not peer reviewed]" | "[News article]"
  "image_url": str | None,  # Absolute image URL or None
  "image_license": str | None,  # "[CC-licensed]" | "[Copyrighted - use with permission]" | None
  "source_type": str      # "academic" | "news"
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `arxiv.org` domain | `export.arxiv.org` exclusively | Ongoing (Claude Code WebFetch bug #19287) | Must never use main domain |
| EFetch default ASN.1 format | EFetch now returns XML by default (`retmode=xml`) | NCBI 2022 update | No explicit retmode needed for XML, but specify it for clarity |
| arXiv PDF-only papers | arXiv HTML format (`arxiv.org/html/{id}`) | Dec 2023 rollout | Experimental but available for some papers |
| feeds.nature.com RSS | www.nature.com/nature.rss (301 redirect) | Current | Use direct URL to skip redirect |

**Deprecated/outdated:**
- `feeds.nature.com/nature/rss/current`: Redirects to `www.nature.com/nature.rss` — use the final URL directly
- `feeds.arstechnica.com/arstechnica/science`: Blocked by WebFetch — use WebSearch fallback

---

## Open Questions

1. **How often does `arxiv:journal_ref` populate within 7 days?**
   - What we know: Zero journal_ref fields observed across 10 tested arXiv entries from the last 7 days
   - What's unclear: Whether the pattern holds for all fields or if some subfields populate quickly
   - Recommendation: Treat absent = preprint; the conservative default is correct and the concern in STATE.md is answered — validate further with 10-15 real API calls during implementation

2. **Can Ars Technica article pages be fetched directly?**
   - What we know: `feeds.arstechnica.com` and `arstechnica.com` are blocked at the domain level for WebFetch
   - What's unclear: Whether individual article pages are also blocked or just the domain root
   - Recommendation: During Phase 2 implementation, test WebFetch on a specific article URL. If blocked, WebSearch is a reliable fallback for discovery.

3. **PubMed quality gate edge case: abstract-only results**
   - What we know: PubMed abstracts average ~1,600-1,900 characters, often below the 2,000-char gate
   - What's unclear: Whether the planner should treat PubMed sources as always needing a paired news article
   - Recommendation: Measure abstract + all metadata fields together. If still short, pair with news. Do not discard PubMed results — they are the strongest citation sources.

4. **Nature.com article page fetchability**
   - What we know: The RSS feed works; initial fetch of `www.nature.com/news` returned a 303 redirect
   - What's unclear: Whether individual Nature article pages are fetchable with WebFetch
   - Recommendation: Test at implementation time. If article pages block, use RSS `<content:encoded>` as body text — it's a usable summary.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Wave 0 must install |
| Config file | None — see Wave 0 |
| Quick run command | None yet |
| Full suite command | None yet |

**Note:** This skill is a Claude Code SKILL.md workflow — not a Python/Node application. "Tests" for this phase are **manual smoke tests**: run the skill against a known topic, inspect the output file, and verify each success criterion. Automated test coverage is not applicable to SKILL.md instruction files.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|---------------------|-----------|
| FETCH-01 | News articles fetched from at least 1 of: ScienceDaily, Nature, Phys.org | smoke | Run `/science [topic]`, inspect output Sources section | Manual |
| FETCH-02 | Academic content fetched from arXiv and/or PubMed | smoke | Run `/science [topic]`, inspect Sources for academic citation | Manual |
| FETCH-04 | Cross-source link present when same finding in both academic + news | smoke | Run `/science [topic]`, check for "Coverage of the same finding" note | Manual |
| CITE-04 | arXiv results labeled `[Preprint - not peer reviewed]` | smoke | Run `/science [topic]`, verify arXiv source has correct label | Manual |
| CITE-05 | Image URLs labeled `[CC-licensed]` or `[Copyrighted - use with permission]` | smoke | Run `/science [topic]`, inspect Images section labels | Manual |

**Smoke test command:** `/science quantum computing` — run against a known topic with recent arXiv activity.

### Sampling Rate

- **Per task commit:** Run `/science [topic]` once and inspect output file
- **Per wave merge:** Run `/science [topic]` twice against two different topics
- **Phase gate:** Both test runs produce output files with: ≥1 academic source, ≥1 news source, all label fields populated, ≥1 image URL, all body text >2,000 chars (or abstract+news pair)

### Wave 0 Gaps

None — no new test infrastructure needed. Verification is manual inspection of skill output files per the success criteria defined in the phase description.

---

## Sources

### Primary (HIGH confidence)

- `https://export.arxiv.org/api/query` — Directly tested with live queries; field presence/absence verified on 10+ entries from March 2026
- `https://info.arxiv.org/help/api/user-manual.html` — Official arXiv API documentation; query parameters, date filter format, rate limits confirmed
- `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` — Live tested; JSON response structure confirmed
- `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi` — Live tested; full XML schema with all required fields confirmed
- `https://www.ncbi.nlm.nih.gov/books/NBK25499/` — Official PubMed E-utilities documentation
- `https://www.sciencedaily.com/rss/all.xml` — Live tested; feed structure and field set confirmed
- `https://phys.org/rss-feed/science-news/` — Live tested; media:thumbnail field confirmed
- `https://www.nature.com/nature.rss` — Live tested; prism:doi, dc:creator, dc:date fields confirmed
- `https://www.sciencedaily.com/releases/2026/03/260315004407.htm` — Live tested; article body ~2,650 chars, relative image URL, Journal Reference with DOI confirmed
- `https://phys.org/news/2026-03-thwaites-glacier-rival-entire-antarctic.html` — Live tested; body ~3,200 chars, absolute CDN image URL, DOI confirmed

### Secondary (MEDIUM confidence)

- WebSearch results confirming Ars Technica RSS URL `arstechnica.com/science/feed/` — confirmed active per multiple RSS aggregator references, but WebFetch blocked at domain level

### Tertiary (LOW confidence)

- arXiv HTML format at `arxiv.org/html/{id}` — confirmed accessible for paper `2402.08954v1` but 404 on older paper `2207.09436`; coverage is inconsistent (experimental feature); not relied upon in the pipeline design

---

## Metadata

**Confidence breakdown:**
- Standard stack (arXiv API, PubMed API): HIGH — live tested against production endpoints with real queries
- News RSS feeds (ScienceDaily, Phys.org, Nature): HIGH — live tested, feed structures confirmed
- Article page HTML structure: HIGH — live tested on 2 ScienceDaily + 1 Phys.org article
- Ars Technica: LOW — blocked by WebFetch; fallback to WebSearch is an untested workaround
- Peer-review detection logic: HIGH — empirically confirmed that journal_ref is absent on fresh preprints
- PubMed quality gate interaction: MEDIUM — abstract character counts estimated from published research on abstract lengths; exact behavior depends on topic

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (RSS feed URLs and API schemas are stable; re-verify if Ars Technica situation changes)
