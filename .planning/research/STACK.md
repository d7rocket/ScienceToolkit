# Stack Research

**Domain:** Claude Code skill / agent for science content automation (Instagram carousels)
**Researched:** 2026-03-15
**Confidence:** HIGH — all core claims verified against official Claude Code documentation

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Claude Code Skill (SKILL.md) | Current (agentskills.io open standard) | Primary invocation mechanism — `/science` command the user runs from terminal | The only mechanism for packaging reusable, slash-command-invokable workflows inside Claude Code without external APIs. Commands (`.claude/commands/`) have been merged into skills; SKILL.md is the canonical format. Supports frontmatter, supporting files, dynamic context injection, and subagent execution. |
| Built-in WebSearch tool | `web_search_20260209` | Find latest science content across news sites and academic sources | Native to Claude Code — no API key, no MCP server needed. `web_search_20260209` version supports dynamic filtering (Sonnet 4.6), keeping only relevant results before they reach context, reducing token use. Supports `allowed_domains`, `blocked_domains`, and `max_uses`. |
| Built-in WebFetch tool | `web_fetch_20260209` | Retrieve full article content, arXiv abstracts, PubMed pages, DOI landing pages | Native to Claude Code — no cost beyond standard tokens. Fetches plain text and PDFs. `web_fetch_20260209` supports dynamic filtering. Supports `citations: enabled`, `max_content_tokens`, and domain filtering. No additional charge beyond token usage. |
| Markdown structured output | N/A (prompt-enforced) | Structured content package: slides, caption, hashtags, citations | For a skill running in Claude Code's interactive terminal, prompt-enforced Markdown sections are the correct output format. The user reads/copies the output directly. JSON schema output (`output_config.format`) applies to API calls, not to interactive skill invocations. Use clearly delimited Markdown sections (e.g., `## SLIDE 1`, `## CAPTION`, `## CITATIONS`). |

### Supporting Pattern: Supporting Files in Skill Directory

The skill directory can bundle files Claude loads on demand:

| File | Role |
|------|------|
| `SKILL.md` | Main instructions (required) |
| `output-template.md` | Exact output structure Claude fills in — enforces consistent formatting across runs |
| `sources.md` | Trusted source domain list with brief notes — reduces hallucination of fake sources |
| `tone-guide.md` | Tone and style reference for "casual + authoritative" voice |

Reference supporting files from `SKILL.md` so Claude knows when to load them. Keep `SKILL.md` under 500 lines.

### Skill Invocation Architecture

| Invocation Pattern | Frontmatter | Behaviour |
|-------------------|-------------|-----------|
| User types `/science` | `disable-model-invocation: true` | Only you trigger it — Claude never auto-launches a web research session unexpectedly |
| User types `/science quantum entanglement` | `argument-hint: [topic]` | `$ARGUMENTS` receives the topic; skill runs targeted research |
| User types `/science` (no topic) | (same) | Skill auto-picks trending topic via WebSearch |

### Tool Access Declaration

```yaml
allowed-tools: WebSearch, WebFetch
```

Declare `allowed-tools` in skill frontmatter so Claude can use WebSearch and WebFetch without per-use approval prompts. This is the primary tool access pattern for research skills.

---

## Skill File Structure

```
.claude/skills/science/
├── SKILL.md            # Frontmatter + instructions (required)
├── output-template.md  # Structured output scaffold
├── sources.md          # Trusted domain list
└── tone-guide.md       # Voice and tone reference
```

Store at project scope (`.claude/skills/`) since this is a project-specific tool. Alternatively, store at personal scope (`~/.claude/skills/`) to use it from any directory.

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| External MCP servers for web search (Brave MCP, Tavily, etc.) | Requires API keys, contradicts "no external APIs" constraint. User would need to configure and pay for separate search APIs. | Built-in `WebSearch` tool — zero config, included in Claude subscription |
| `output_config.format` / JSON schema structured output | This is an API feature invoked via `client.messages.create()`. It does not apply to Claude Code interactive skills where output is rendered in the terminal as text. | Prompt-enforced Markdown sections with clear delimiters |
| `context: fork` subagent for the main skill | Subagents start with fresh context — they do not inherit the conversation. For a skill that needs to maintain reasoning across multiple search/fetch iterations, inline execution is better. | Inline skill execution (no `context: fork`) |
| Playwright or browser automation MCP | Requires running a local MCP server, introduces complexity, and most target sources (arXiv, PubMed, Nature News) serve static HTML compatible with WebFetch | WebFetch with `allowed_domains` to trusted science sources |
| `web_search_20250305` (older version) | Still functional but lacks dynamic filtering — will consume more tokens on content-heavy searches | `web_search_20260209` with dynamic filtering (Sonnet 4.6 supported) |
| Hardcoding `user-invocable: false` on this skill | The user explicitly wants to type `/science` — this flag hides it from the slash-command menu | Default (`user-invocable: true`) with `disable-model-invocation: true` |

---

## Stack Patterns by Variant

**If the user wants a daily auto-run (not just on-demand):**
- Use `/loop 24h /science` — the bundled `/loop` skill handles timed repetition
- No external cron or scheduler needed

**If the user specifies a topic (`/science dark matter`):**
- `$ARGUMENTS` receives the topic string
- Skill uses `allowed_domains` on WebSearch to target academic sources for that topic
- Broader news scan is skipped

**If arXiv rate-limits or rejects fetches:**
- Fall back to fetching the abstract page (`/abs/`) instead of the PDF
- arXiv HTML abstracts are lightweight and rarely blocked
- Use `max_content_tokens` on WebFetch to cap PDF token cost

**If output is too long for one copy-paste:**
- Add a `## REFERENCES` section as a separate block at the end
- User copies slides + caption first, then references separately
- Do not split across multiple skill invocations

---

## Version Compatibility

| Component | Compatible With | Notes |
|-----------|-----------------|-------|
| `web_search_20260209` | Claude Sonnet 4.6, Opus 4.6 (dynamic filtering) | Works on earlier models too but without dynamic filtering |
| `web_fetch_20260209` | Claude Sonnet 4.6, Opus 4.6 (dynamic filtering) | `web_fetch_20250910` is the stable fallback for older models |
| SKILL.md frontmatter (`allowed-tools`, `disable-model-invocation`, `argument-hint`) | Current Claude Code (all recent versions) | These are the stable, documented frontmatter fields |
| `$ARGUMENTS` substitution | Current Claude Code | Use `$ARGUMENTS` for the topic input; `$0` shorthand also supported |

---

## Key Constraints This Stack Respects

| Constraint | How Addressed |
|------------|---------------|
| No external APIs | WebSearch and WebFetch are native server-side tools — no API keys required |
| Runs within Claude Code terminal | SKILL.md invoked via `/science` slash command |
| No automated Instagram posting | Output is Markdown text the user reads and acts on manually |
| Daily cadence / speed | WebSearch with `max_uses` limit (e.g. 8) keeps runs fast; dynamic filtering reduces latency |
| Source quality control | `allowed_domains` in WebSearch restricts to trusted sources (arxiv.org, pubmed.ncbi.nlm.nih.gov, nature.com, etc.) |
| Instagram format (5-7 slides, 5 hashtags, ~2200 char caption) | Enforced via `output-template.md` supporting file with explicit character count guidance |

---

## Sources

- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) — skill file structure, frontmatter fields, `allowed-tools`, `disable-model-invocation`, supporting files, `$ARGUMENTS` substitution. HIGH confidence.
- [Claude Code Subagents documentation](https://code.claude.com/docs/en/sub-agents) — subagent types, tool access patterns, `Explore` agent, `context: fork`. HIGH confidence.
- [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) — MCP server scopes, how MCP tools differ from built-in tools. HIGH confidence.
- [Web Search Tool — Anthropic API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) — tool versions (`web_search_20260209`, `web_search_20250305`), `allowed_domains`, `max_uses`, pricing ($10/1000 searches), dynamic filtering. HIGH confidence.
- [Web Fetch Tool — Anthropic API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool) — tool versions, `max_content_tokens`, `citations`, URL security model, no additional cost, PDF support. HIGH confidence.
- [Structured Outputs — Anthropic API Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — `output_config.format` is an API feature, not applicable to Claude Code interactive skills. HIGH confidence.
- [WebSearch vs WebFetch — Mikhail Shilkov blog](https://mikhail.io/2025/10/claude-code-web-tools/) — confirms built-in tool behavior: WebSearch finds pages, WebFetch reads them. MEDIUM confidence (verified against official docs).

---

*Stack research for: Claude Code skill for science Instagram content automation*
*Researched: 2026-03-15*
