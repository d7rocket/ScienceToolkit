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

**Phase 1 scaffold:** Real web fetching is added in Phase 2. For now, use placeholder sources that are clearly marked as fabricated in your output. Do not invent DOIs, author names, or journal names that look real — make it obvious that the sources are placeholders.

In Phase 2 and beyond, this step will:
- Use WebSearch to find recent papers and news articles on the topic
- Use WebFetch to retrieve the full content of each source
- Extract factual claims, author names, publication details, and DOIs

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
