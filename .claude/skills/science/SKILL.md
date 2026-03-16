---
name: science
description: Generate an Instagram science carousel package for a science topic. Fetches source material, writes carousel slides, caption, hashtags, and citations.
argument-hint: [topic]
disable-model-invocation: true
allowed-tools: Read, Write, WebFetch, WebSearch, Bash
---

Generate an Instagram science carousel for: $ARGUMENTS

## Step 1: Discover or confirm topic

Determine the topic before proceeding. The behavior depends on whether `$ARGUMENTS` is empty or not.

### Case A: `$ARGUMENTS` is empty (auto-discovery)

Run the full auto-discovery flow:

1. Fetch all 4 RSS feeds simultaneously using parallel WebFetch calls (no topic filter):
   - `WebFetch https://www.sciencedaily.com/rss/all.xml`
   - `WebFetch https://phys.org/rss-feed/science-news/`
   - `WebFetch https://www.nature.com/nature.rss`
   - `WebSearch "site:arstechnica.com/science science news [CURRENT_YEAR]"` (broad discovery query, no topic)

2. From each feed, extract the titles of the 5 most recent items (published within the last 48 hours where pubDate is available; otherwise take the top 5 items).

3. From the collected titles, identify 3-5 candidate topics by extracting the primary subject noun phrase from each title. Normalize to a short label (2-5 words). Example: "Scientists discover new CRISPR variant targeting antibiotic resistance" → "CRISPR antibiotic resistance".

4. Count how many feeds mention each candidate (by semantic overlap, not exact match). Sort candidates descending by cross-feed count, then by recency.

5. "Strong candidate" threshold: 2+ feeds mention the same topic. If no topic appears in 2+ feeds, all candidates are weak — fall back to `WebSearch "trending science news today [CURRENT_YEAR]"` and extract the top 3 results as candidates ranked by recency.

6. **Dedup check** (applies to each candidate in ranked order):
   - Read `output/topic-log.json`. If the file does not exist, treat it as an empty array — do NOT fail.
   - For each candidate topic (in ranked order): compare it against all log entries where `date` is within the last 14 calendar days (calculate from today's date).
   - Matching rule: a candidate matches a log entry if the candidate's normalized label shares 2+ significant words with the log entry's `topic` field (ignore common words: "the", "a", "of", "in", "and", "new", "study", "scientists", "researchers", "find", "show", "reveal", "discover", numbers, articles).
   - If matched: skip this candidate. Print to terminal: `Skipped candidate '[topic]' — covered on [date] (14-day diversity window).`
   - If not matched: this candidate is eligible. Use it.
   - If ALL candidates are skipped: expand to the next-best ranked candidates from the RSS scan (candidates 4-8 if available). If still all covered, widen the match window — accept any candidate not covered in the last 7 days (halve the window). Log to terminal: `All top candidates recently covered — widened diversity window to 7 days.`

7. Present the top eligible candidate to the user:
   `Today's topic: [topic label] (covered by [Feed1], [Feed2]). [One sentence of context from the lead article.] Proceed? (y/n)`

8. If the user confirms: proceed to Step 2 with this topic.

9. If the user rejects: present candidates #2 and #3 in the same format. Ask: `Alternatively: (1) [topic2] or (2) [topic3]. Choose 1, 2, or type a different topic.`

10. If the user rejects all or provides a manual topic: use the provided topic. Apply the dedup check (warn but proceed — see Case B).

Then proceed to Step 2.

### Case B: `$ARGUMENTS` is not empty (manual topic)

1. Read `output/topic-log.json`. If the file does not exist, treat as empty array.
2. Check if the provided topic matches any entry in the last 14 days (same 2+ significant words matching rule as Case A).
3. If matched: print warning `Note: [topic] was covered on [date]. Proceeding anyway.` — do NOT block.
4. Show confirmation: `Topic: [topic]. Today's date: [date]. Proceed? (y/n)`
5. If confirmed: proceed to Step 2.
6. If rejected: ask for alternative topic input.

Then proceed to Step 2.

### Case C: User rejection in auto-discovery

Handled inline in Case A steps 9-10. No separate flow needed.

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

Generate the full carousel package from the structured source list built in Step 4 Phase D. Follow every rule below precisely. Do not invent data — every author, journal name, DOI, and URL must come from the structured source list.

### Rule 1: Finding selection

Choose the single focal finding that the entire carousel will be built around. Evaluate candidates in this priority order:

1. Cross-validated finding — an academic paper and a news article that cover the same result (identified in Phase C). Prefer this above all others.
2. Most counterintuitive or surprising result — the finding that most contradicts prior assumptions.
3. Most quantitatively specific — the finding with a memorable, concrete statistic.
4. Most recent — the finding with the latest publication date.

Build every slide and the caption around this one focal finding. Other sources inform caption depth and citations, but do not dilute the main narrative with multiple competing findings.

### Rule 2: Slide generation

Generate between 5 and 7 slides. Use `## Slide N: [Descriptive Title]` headings (where N is the slide number).

**Slide 1 (Hook):** The heading (after "## Slide 1:") is a short descriptive title. The body text below the heading must be a question or surprising fact, under 15 words. The combined heading title + body should feel like a single punchy hook — glanceable in under 3 seconds. Emoji allowed in body text. Example heading: "The Universe Just Got Older" / Example body: "What if everything we knew about galaxy formation was wrong?" (10 words).

**Slides 2 through N-1 (Body):** Each slide should be approximately 150 characters, written as 2–3 short, punchy sentences. No emoji on body slides. Each body slide MUST end with a cliff-hanger or question. Use patterns such as:
- "But there's a catch."
- "That's not the weird part."
- "Scientists weren't expecting what came next."
- A direct question that the next slide answers or escalates.

Each cliff-hanger must connect forward — the next slide must resolve or escalate the tension set up by the previous one. Use at most one statistic per slide.

**Self-check — cliff-hangers:** After drafting all slides, re-read the final sentence of each body slide (Slides 2 through N-1). If any body slide ends with a declarative period statement that does not create forward tension, rewrite that ending as a cliff-hanger or question. A body slide that summarizes multiple findings is a signal that the single-focal-finding rule (Rule 1) is being violated — refocus the slide on one aspect of the focal finding and end with a cliff-hanger teasing the next slide.

**Slide N (Final — Takeaway + CTA):** Write one sentence stating the key takeaway, followed by a CTA line such as "Follow for daily science drops." Emoji allowed. Do NOT put a cliff-hanger on the final slide.

**Voice throughout:** Cool professor register — calm confidence, dry wit allowed, authoritative but approachable. Target a high school reading level. When a technical term is unavoidable, add an inline plain-English gloss immediately after it (e.g., "redshift (the stretching of light as objects move away)"). Slides are punchier and bolder than the caption.

**Self-check — inline glosses:** After drafting all slides, scan every slide for technical or scientific terms that a high-school reader would not know. For EACH such term, verify an inline plain-English gloss appears in parentheses immediately after it. Examples of terms requiring glosses: "conjugation" -> "conjugation (the process bacteria use to swap genes)", "redshift" -> "redshift (the stretching of light as objects move away)", "gene drives" -> "gene drives (genetic systems that force a trait through an entire population)". If any technical term lacks a gloss, add one. This is not optional — an unglossed technical term is a formatting error.

### Rule 3: Caption generation

Write 3–5 paragraphs following this arc:

- **Paragraph 1 (Hook):** A question that includes the topic keyword. Podcast-episode-title energy.
- **Paragraph 2 (Context):** Background needed to appreciate the focal finding. Aim for 4-6 sentences: cover the history of the problem, prior approaches that fell short, and why this finding matters now. This paragraph carries the most expansion weight for hitting the 400-word floor.
- **Paragraph 3 (Finding):** State the discovery clearly. Name-drop the journal or outlet naturally using the `journal_or_outlet` field from the structured source list — for example: "A study published in *{source.journal_or_outlet}* found that..." Do NOT use journal names from memory; use only names from the fetched source list.
- **Paragraph 4 (Significance):** Why it matters, what it changes, what prior assumption it challenges. Aim for 3-5 sentences: be specific about who is affected, what practical outcomes shift, and what questions remain open.
- **Paragraph 5 (Close):** A forward-looking question that invites engagement. No CTA in the caption — the CTA belongs on the final slide only.

Target 400–600 words.

**Self-check — caption word count and keyword:** After drafting the caption, perform these checks before proceeding:

1. **Word count gate:** Count the words in the caption. If under 400, you are not done. Expand Paragraph 2 (Context) by adding 2-3 more sentences: historical context of the problem, what researchers tried previously, how the field evolved to this point. Then expand Paragraph 4 (Significance) by adding 2-3 more sentences: who specifically is affected, what changes in clinical/practical terms, what open questions remain. Recount. Repeat this expansion cycle until the count reaches at least 400 words. Do not stop at 200-300 words — 400 words is a hard floor, not a suggestion.

2. **Keyword gate:** Verify the topic keyword appears in the first sentence of Paragraph 1 (the Hook). If the keyword is absent, rewrite the first sentence to include it. Example: if the topic is "CRISPR gene editing", the first sentence must contain "CRISPR" — e.g., "What happens when CRISPR meets its toughest challenge yet?" A hook that avoids naming the topic fails this check.

**Do NOT proceed to Step 6 until both checks pass.** If you cannot confirm (a) word count >= 400 and (b) topic keyword in the first sentence, return to the caption and fix it. This is a blocking gate — Step 6 must not execute on a non-compliant caption.

Hard ceiling: 2,100 characters total. After drafting, count the characters in the caption. If the count exceeds 2,100, shorten sentences in the significance or context paragraphs until it falls within the limit. Check characters, not words — a 600-word caption can exceed 2,100 characters.

Caption tone is more explanatory and flowing than the slides, but stays in the cool-professor register. No inline citation references — the text reads clean. All citations live in the Sources section only.

### Rule 4: Hashtag generation

Generate EXACTLY 5 hashtags. No more, no fewer.

Place all 5 on one line, space-separated, with no commas and no trailing punctuation.

Select hashtags using this strategy:
- 1 topic-specific (e.g., `#CRISPRCas9`)
- 1 field-level (e.g., `#Genetics`)
- 1 broad science (e.g., `#ScienceExplained`)
- 1 platform reach (e.g., `#LearnOnInstagram`)
- 1 trending or topical (e.g., `#GeneTherapy`)

Example: `#JamesWebbTelescope #Astrophysics #SpaceScience #GalaxyFormation #ScienceExplained`

### Rule 5: Citation formatting

Number each source sequentially. Select the citation variant that matches its `peer_review_label`:

**Variant A — Published academic paper** (`peer_review_label` contains "Published in"):
```
N. {authors} ({year}). {title}. *{journal_or_outlet}*.
   DOI: https://doi.org/{doi}
   URL: {url}
   {peer_review_label}
```
Include the DOI line only when `doi` is not None. Omit volume, issue, and page numbers rather than inventing them.

**Variant B — Preprint** (`peer_review_label` is "[Preprint - not peer reviewed]"):
```
N. {authors} ({year}). {title}. *arXiv*.
   URL: {url}
   [Preprint - not peer reviewed]
```

**Variant C — News article** (`peer_review_label` is "[News article]"):
```
N. {authors} ({year}). {title}. *{journal_or_outlet}*.
   URL: {url}
   [News article]
```

Every citation must have a clickable URL line. Use data from the structured source list only — never fabricate authors, DOIs, or journal names.

### Rule 6: Image output

Collect all non-None `image_url` values from the structured source list.

Output each URL on its own line with a leading dash in the `## Images` section. Do not add license labels in the Images section — license labels already appear in the Sources section.

When ordering images, list CC-licensed images before copyrighted ones.

If no source returned a non-None `image_url`, write exactly: "No source images available from fetched sources."

### Section ordering

The output must follow this exact structure (matching `examples/output-sample.md`):

```
# [Topic Title]
**Date:** YYYY-MM-DD | **Field:** [Field] | **Sources:** N
---
## Slide 1: [Title]
...
## Slide N: [Title]
...
---
## Caption
...
---
## Hashtags
...
---
## Sources
...
---
## Images
...
```

## Step 5.5: Validate format

After generating the carousel output in Step 5, run these 5 mechanical checks before writing to disk. Collect ALL violations into a list — do not stop at the first one. Do NOT re-check content quality rules (cliff-hangers, keyword placement, glosses) — Phase 3 self-checks in Step 5 already handle those.

### CHECK 1 — Caption length

Count the total characters in the Caption section text. "Caption section text" means everything between the `## Caption` heading and the next `---` divider, EXCLUDING the `## Caption` heading line itself and any leading/trailing blank lines.

Violation if character count > 2100.
Violation message: `Caption exceeds 2100 characters (actual: N chars).`

### CHECK 2 — Hashtag count

Count all standalone tokens beginning with `#` that appear in the Hashtags section (between the `## Hashtags` heading and the next `---` divider). A standalone hashtag token has no spaces within it (e.g., `#ScienceExplained` is one token). Do NOT count `#` symbols from slide headings, image URLs, or other sections.

Violation if count is not exactly 5.
Violation message: `Hashtag count is N — must be exactly 5.`

### CHECK 3 — Slide count

Count all headings in the generated output that match the pattern `## Slide N:` where N is a number.

Violation if count < 5 or count > 7.
Violation message: `Slide count is N — must be between 5 and 7.`

### CHECK 4 — Slide label format

For each slide heading found in CHECK 3, verify it follows the pattern `## Slide N: [Title]` where N is a sequential number and [Title] is a non-empty descriptive title after the colon. A heading like `## Slide 3:` (no title) or `## Slide Three: Title` (non-numeric) is a violation.

Violation message: `Slide N heading is malformed or missing title.`

### CHECK 5 — Citation completeness

In the Sources section (between `## Sources` and the next `---` divider), for each numbered citation entry, verify:
  (a) A line is present containing one of: `[Published in:`, `[Preprint`, or `[News article]`
  (b) A line beginning with `URL:` is present

Violation for any citation missing either field.
Violation message: `Citation N is missing [peer-review label / URL line].` (specify which is missing)

### Validation result

If the violations list is empty: record `validation_status = "PASS"` for use in Steps 6 and 7.

If the violations list is non-empty: record `validation_status = "FAIL (N violations)"` and keep the full violations list for Step 6.

Proceed to Step 6 in either case — validation does NOT block writing.

## Step 6: Write output file

1. Create a slug from the topic: lowercase, words separated by hyphens, no special characters (e.g., "Black Hole Acoustics" → "black-hole-acoustics")
2. Write the full carousel package to `output/YYYY-MM-DD-[slug].md` using today's date

### Validation warnings

If `validation_status` from Step 5.5 is "PASS": skip this subsection — write the output file normally.

If `validation_status` is "FAIL": prepend the following block at the very top of the output file, BEFORE the `# [Topic Title]` heading. This must be the first content in the file:

> [!WARNING]
> ## Validation Warnings
> The following format violations were detected in this output. Review before posting.
>
> - [violation message 1]
> - [violation message 2]
> (list all violation messages from Step 5.5)
>
> ---

Then write the rest of the carousel content (# [Topic Title] heading and everything after it) immediately below the warning block.

### Topic log update

After writing the output file, update the topic diversity log:

1. Read `output/topic-log.json` using the Read tool. If the file does not exist, start with an empty array `[]`.
2. Append a new entry to the array:
   ```json
   {
     "date": "YYYY-MM-DD",
     "topic": "[topic label]",
     "field": "[Field value from the output file header]",
     "slug": "[slug used in the output filename]"
   }
   ```
   - `date`: today's date in YYYY-MM-DD format
   - `topic`: the confirmed topic label (normalized 2-5 words, as used in Step 1)
   - `field`: extract from the `**Field:**` line in the generated output
   - `slug`: the same slug used in the output filename
3. Write the updated array back to `output/topic-log.json` using the Write tool.

CRITICAL: You must Read the existing file first, then append to the array, then Write the full updated array. Do NOT write only the new entry — this would destroy all previous log history.

## Step 7: Print terminal summary

After writing the file, print this summary to the terminal — do NOT print the full carousel content:

```
Generating carousel for: [Topic]...
Generated: [Topic]
   Slides: N | Sources: N | Field: [Field]
   -> output/YYYY-MM-DD-[slug].md
   Validation: PASS
   Topic log: updated (output/topic-log.json)
```

Or when violations exist:
```
   Validation: FAIL — N violations (see file header)
```

Replace the literal `PASS` or `FAIL — N violations` based on `validation_status` from Step 5.5.
