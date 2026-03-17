# Feature Research

**Domain:** Science content curation and Instagram carousel generation (CLI agent + web UI renderer)
**Researched:** 2026-03-17 (v1.1 web UI update; v1.0 CLI features preserved below)
**Confidence:** HIGH (Instagram specs, safe zones, typography); MEDIUM (carousel tool patterns, font pairing); LOW (export fidelity edge cases)

---

## Context: What Already Exists (v1.0 CLI — SHIPPED)

The `/science` skill generates markdown files in `output/` with:
- 5-7 slides (title + body text per slide)
- Instagram caption (400-600 words)
- Exactly 5 hashtags
- Full APA citations with DOIs and URLs
- Source image URLs
- Color scheme section (4 hex colors: background, primary text, accent, highlight + palette name + rationale)

This research covers **only new features** for v1.1: the local web UI that converts those markdown files into export-ready 1080x1080 PNG carousel images.

---

## Feature Landscape — Web UI Carousel Image Generator

### Table Stakes (Users Expect These)

Features whose absence makes the tool feel broken or incomplete. Users give no credit for having them but immediately notice their absence.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Markdown file loading | Without this, the tool has no input — it's a canvas with no content | LOW | File input `<input type="file">` or drag-and-drop; parse slide sections by `## Slide N:` headers |
| Live preview of all slides | Any design tool without real-time feedback feels broken; user needs to see the result as they edit | MEDIUM | Render a visible 1080x1080px canvas per slide; updates reflect edits instantly |
| Color palette pre-loaded from markdown | The `/science` output already includes a 4-color palette — not reading it forces manual re-entry and wastes the existing output contract | LOW | Parse the `## Color Scheme` section for hex values; use as initial canvas background, text, accent, highlight |
| Per-slide text display (title + body) | Core content rendering — a slide must show the slide title and body text the skill generated | LOW | Map `## Slide N: Title` to the slide heading; paragraph text below it to the body area |
| Font selection | Every carousel tool offers font control; without it the output looks like a browser default | MEDIUM | Provide at minimum 3-4 pre-curated font pairings; loading from Google Fonts API is standard |
| Color override controls | User may not like the auto-palette; must be able to change any of the 4 color roles | LOW | Color pickers mapped to background, primary text, accent, highlight roles |
| PNG export per slide | The output format Instagram requires; without export the tool produces nothing usable | MEDIUM | Export each slide as a 1080x1080 PNG; filename pattern: `topic-slide-01.png` |
| ZIP bundle export | Users need all slides as a package — downloading 6 slides individually is unusable friction | LOW | Bundle all PNGs via JSZip or similar; single "Export All" button |
| Slide navigation (prev/next) | Multiple slides exist; user must be able to move between them | LOW | Previous/next buttons; slide counter ("Slide 2 of 6") |
| Consistent visual structure across slides | If each slide looks independent, the carousel loses visual cohesion — swipe continuity is broken | MEDIUM | Shared background color, same font, same padding rules across all slides in a session |

### Differentiators (Competitive Advantage)

Features that make this tool feel premium rather than generic, aligned to the science content niche.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Curated science-appropriate font pairings | Generic carousel tools use one-size-fits-all fonts; science content needs editorial credibility — the right typeface signals authority without feeling stiff | MEDIUM | Pre-build 3-4 named pairings: e.g., "Editorial" (DM Serif Display + Inter), "Modern Lab" (Space Grotesk + Source Sans Pro), "Classic Authority" (Libre Baskerville + Lato). Let user pick a pairing, not raw font names. |
| Slide role awareness (hook, body, CTA) | A hook slide needs a different visual weight than a body slide — generic tools apply one layout to all slides; role-aware layout makes the first slide pop and the CTA slide feel conclusive | HIGH | Slide 1 gets larger title font, centered layout, minimal body text. Body slides get smaller title, more body text area. Last slide gets CTA-optimized layout with follow prompt. |
| Text editing inline on the canvas | The generated slide text may be too long (~150 chars body text per the known verbosity concern) — the user needs to trim it without leaving the tool | MEDIUM | Contenteditable overlay on the rendered text; edits immediately re-render. Do not require a separate text input panel. |
| Color palette named schemes | Rather than 4 random color pickers, offer named "Scheme presets" (e.g., "Deep Space", "Clean Lab", "Forest Biology") that set all 4 roles at once. The `/science` output already names the palette — display that name and offer it as a loadable preset. | MEDIUM | A palette is 4 hex values. Load named schemes as JSON. User can fine-tune after loading. |
| Slide indicator dots preview strip | Shows all slides as thumbnail chips along the bottom — user sees the visual flow of the full carousel at a glance before exporting | MEDIUM | Small 120x120px canvas previews in a horizontal strip; clicking navigates to that slide |
| Safe zone visual overlay toggle | Instagram overlays UI on the bottom ~150px (action buttons) and top ~120px on some devices — exposing this as a toggleable guide prevents content placement mistakes | LOW | Render a semi-transparent overlay on top of the canvas preview showing the unsafe zones; toggle on/off |
| Verbosity-aware text truncation hint | The known concern: body text at ~150 chars may be too long for comfortable slide reading. Surface a character count warning if body text exceeds 120 chars and suggest trimming. | LOW | Count characters in the body text area; show amber warning at 120, red at 160. Complements inline editing. |
| Source image display (metadata panel) | The markdown output includes source image URLs; the UI should display them as reference images so the user can decide whether to incorporate them into the design externally | LOW | Below the slides, render a panel showing the source image URLs as `<img>` thumbnails. Read-only, not placed on canvas — they're attribution references and may have unclear licenses. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that appear on typical carousel tool feature lists but should be explicitly avoided for this tool.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Drag-and-drop element repositioning on canvas | Feels like a full design tool (Canva-like); user thinks they want infinite layout control | Implementing a full drag-and-drop canvas (fabric.js or similar) multiplies complexity 5-10x. This is a renderer for a fixed content format — the slides are pre-structured by the skill. Layout chaos breaks visual cohesion across the carousel. | Offer 2-3 fixed layout presets (centered, left-aligned, split image/text) that maintain carousel consistency. Let the layout choice be intentional, not per-element. |
| AI image generation on-slide | "Generate a relevant image for each slide" | Requires external API (DALL-E, Stability AI) — violates the no-external-API-keys constraint. Also risks inaccurate science diagrams. | Source image URLs are already in the markdown output. User can add images manually in their own tool if needed. |
| Direct Instagram publishing from the UI | "One-click post after export" | Requires Instagram Graph API + OAuth flow — external API, external accounts, violates constraints. Also skips the human review step that is intentional quality control for science accuracy. | Output is download-to-device PNGs. User reviews then posts manually. |
| Free-form canvas (blank slide creation) | "Let me make slides from scratch" | Contradicts the tool's purpose: rendering the `/science` skill's structured output. A blank canvas duplicates Canva without Canva's template library or asset management. | The tool renders what the skill generates. If user wants to design from scratch, they should use Canva or Figma. |
| Animation / GIF / video export | "Animated carousels perform better" | Requires a canvas recording pipeline (ffmpeg, WebCodecs) — significant complexity spike. Instagram static carousels remain the primary format; video is a separate content type. | Static PNG export is the format. Reels/video is out of scope for v1.1 per PROJECT.md. |
| Multi-file batch rendering | "Process all my output files at once" | Defeats daily-freshness purpose; also makes the UX more complex (file list management, batch export status). | Load one file at a time. Daily workflow means one markdown file per session. |
| Template marketplace or save/load templates | "Let me save my design for reuse" | Requires persistent storage (localStorage at minimum, server at scale). For a single daily-use tool this is premature. The color scheme in the markdown IS the reusable brand config. | The `/science` skill outputs consistent color schemes. Load the same palette every day — that IS the template. |

---

## Feature Dependencies

```
[Markdown file loading]
    └──required by──> [Color palette pre-load]
    └──required by──> [Per-slide text display]
    └──required by──> [Source image metadata panel]
    └──required by──> [Verbosity-aware truncation hint]

[Per-slide text display]
    └──required by──> [Live preview]
    └──required by──> [Inline text editing]
    └──required by──> [Slide role awareness]
    └──required by──> [PNG export]

[Live preview]
    └──required by──> [Slide indicator dots preview strip]
    └──required by──> [Safe zone visual overlay toggle]
    └──required by──> [PNG export] (what renders in preview is what exports)

[Color palette pre-load]
    └──enhances──> [Color override controls] (pre-loaded palette is the starting point for overrides)
    └──enhances──> [Color palette named schemes] (auto-loaded palette name maps to a named scheme)

[Font selection]
    └──requires──> [Curated font pairings] (pairing is the font selection mechanism)
    └──enhances──> [Slide role awareness] (hook slide uses larger font weight from same pairing)

[PNG export]
    └──required by──> [ZIP bundle export] (ZIP bundles the individual PNGs)

[Slide role awareness] ──conflicts with──> [Drag-and-drop element repositioning]
    (role-aware fixed layouts and free-form repositioning are incompatible design philosophies)
```

### Dependency Notes

- **Markdown loading is the root dependency:** Everything else derives from parsed markdown content. This must be the first thing that works.
- **Live preview gates export quality:** The PNG export must render exactly what the preview shows — use the same canvas/renderer path for both. A mismatch between preview and export is the most common failure mode in carousel tools.
- **Color pre-load requires correct markdown parsing:** The `/science` output has a specific `## Color Scheme` section format. The parser must handle the exact structure the skill produces — read `output/2026-03-16-crispr-gene-editing.md` as the reference format.
- **Slide role awareness conflicts with free-form drag/drop:** Picking one requires rejecting the other. This tool should commit to role-aware fixed layouts.

---

## MVP Definition

### Launch With (v1.1 — this milestone)

Minimum that makes the web UI genuinely usable for the daily workflow.

- [ ] Drag-and-drop (or file picker) markdown loading — the entry point
- [ ] Parse slide sections, title, body text from markdown — the content extraction
- [ ] Pre-load color palette from markdown `## Color Scheme` section — the integration point with v1.0
- [ ] Render each slide as 1080x1080px canvas with background color, title, body text — the core visual output
- [ ] Live preview updates when colors or fonts change — the interaction model
- [ ] 2-3 curated font pairings selectable as named presets — the typography layer
- [ ] Color override controls for all 4 color roles — the customization layer
- [ ] Slide navigation (prev/next) — multi-slide browsing
- [ ] Inline text editing on canvas (at least body text) — the verbosity fix workflow
- [ ] PNG export per slide — the output
- [ ] ZIP bundle export of all slides — the actual deliverable

### Add After Validation (v1.1.x)

After the basic render-and-export cycle is confirmed working in real daily use.

- [ ] Slide indicator dots preview strip — add when navigating more than 5 slides feels tedious
- [ ] Safe zone visual overlay toggle — add when user reports content being clipped by Instagram UI
- [ ] Verbosity-aware character count warning — add when the known text-length concern surfaces in real output
- [ ] Slide role awareness (hook/body/CTA layout variants) — add when user notices visual monotony across slides
- [ ] Source image metadata panel — add when user wants quick reference to source images during design

### Future Consideration (v2+)

- [ ] Named color scheme presets (e.g., "Deep Space", "Clean Lab") — when user accumulates enough sessions to want a brand palette library
- [ ] Layout presets (centered, left-aligned, split) — when user wants more visual variety without free-form drag/drop
- [ ] Thumbnail strip export (one image showing all slides) — for Instagram Story preview or portfolio use

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Markdown file loading + parsing | HIGH | LOW | P1 |
| Per-slide canvas render (1080x1080) | HIGH | MEDIUM | P1 |
| Color palette pre-load from markdown | HIGH | LOW | P1 |
| Live preview | HIGH | MEDIUM | P1 |
| Curated font pairings (3-4 presets) | HIGH | MEDIUM | P1 |
| Color override controls | MEDIUM | LOW | P1 |
| Slide navigation | HIGH | LOW | P1 |
| Inline text editing on canvas | HIGH | MEDIUM | P1 — addresses known verbosity concern |
| PNG export per slide | HIGH | MEDIUM | P1 |
| ZIP bundle export | HIGH | LOW | P1 |
| Slide indicator dots preview strip | MEDIUM | MEDIUM | P2 |
| Safe zone visual overlay toggle | MEDIUM | LOW | P2 |
| Verbosity character count warning | MEDIUM | LOW | P2 |
| Slide role awareness (hook/body/CTA) | MEDIUM | HIGH | P2 |
| Source image metadata panel | LOW | LOW | P2 |
| Named color scheme presets | LOW | LOW | P3 |
| Layout presets (centered/left/split) | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v1.1 launch — the daily workflow fails without it
- P2: Should have — adds meaningful quality; add when P1 is stable
- P3: Nice to have — defer until v1.1 is in daily use

---

## Design Principles for the Renderer

These are not features but constraints that drive feature implementation quality. Violating them produces "generic AI output" feel.

### Typography Hierarchy (what makes slides feel premium)

- **Headline font size:** 52-64px for hook slide (Slide 1), 36-44px for body slides. Size contrast between hook and body slides signals narrative progression.
- **Body text size:** 22-26px. At 1080px canvas, this maps to roughly 14-16pt print equivalent — readable when Instagram compresses to ~375px display width.
- **Line length:** 6-8 words per line maximum. The known ~150-char body text needs wrapping at ~40-50 chars per line — enforce this in the renderer.
- **Line height:** 1.4-1.6x font size. Tight line-height (1.1x) is the most common reason science carousel text feels dense and unreadable.
- **Recommended pairing for science/authority:** DM Serif Display (headings) + Inter (body) — editorial weight without formality. Alternative: Space Grotesk (headings) + Source Sans Pro (body) — modern lab aesthetic.

### Layout Safe Zones (Instagram-verified)

- **Top margin:** 120px minimum (Instagram overlays profile info on smaller devices)
- **Bottom margin:** 150px minimum (like/comment/share buttons overlay this area)
- **Side margins:** 80px minimum on each side (Instagram crops at 1:1 on feed; side content safe zone is narrower than top/bottom)
- **Content area:** Effective usable canvas = 920x810px within the 1080x1080 frame
- **60/40 rule:** Target 60% empty space, 40% content. Science slides at 150 chars body text tend to violate this — inline editing is the corrective mechanism.

### Color Application

- **Background:** Most of the canvas. The 4-hex palette from the skill assigns this role explicitly.
- **Primary text:** Body and headline text. Must meet 4.5:1 contrast ratio against background (WCAG AA).
- **Accent:** Decorative elements — slide number, divider lines, icon if used.
- **Highlight:** Used sparingly — a word callout, a pull quote, the CTA text on the final slide.

---

## Competitor Feature Analysis

| Feature | Canva (general design) | PostNitro / aiCarousels (carousel generators) | This tool (Pleiades web UI) |
|---------|----------------------|----------------------------------------------|----------------------------|
| Input source | User brings text; templates | AI generates text from topic | Reads `/science` markdown output |
| Color integration | Manual; brand kit upload | Brand kit or manual | Auto-loads from markdown color scheme |
| Typography | Hundreds of fonts, overwhelming | Curated pairings per template | 3-4 named science-appropriate pairings |
| Slide role awareness | None — one template for all slides | None | Planned: hook/body/CTA layout variants |
| Export format | PNG, PDF | PNG, PDF | PNG per slide + ZIP |
| Canvas size | Any; 1080x1080 available | Native 1080x1080 | Fixed 1080x1080 (Instagram square) |
| Source citation display | None | None | Source image panel; citation preserved in markdown |
| Inline text edit | Full drag/drop canvas | Limited inline | Contenteditable overlay on text regions |
| Local / no-account | No (SaaS) | No (SaaS) | YES — local HTML/JS, no server, no login |
| Science content niche | Not optimized | Not optimized | Purpose-built for `/science` skill output |

**Key gap this tool fills:** No existing local, no-account tool reads a structured science markdown and renders it directly into Instagram-ready images with the palette already included in the source file. The closest is Canva but it requires manual re-entry of all content and colors, and has no concept of the `/science` output contract.

---

## Sources

- Instagram safe zones 2026: [Zeely Instagram safe zones](https://zeely.ai/blog/master-instagram-safe-zones/), [SocialRails text overlays guide](https://socialrails.com/social-media-terms/text-overlays-on-instagram-carousels) — HIGH confidence
- Instagram carousel dimensions: [PostNitro dimensions guide](https://postnitro.ai/blog/post/instagram-carousel-dimensions-your-ultimate-guide), [Pano size guide](https://panocollages.com/blog/instagram-carousel-size-guide-dimensions-for-perfect-posts) — HIGH confidence
- Typography sizing for Instagram carousels: [PostNitro typography guide](https://postnitro.ai/blog/post/carousel-typography-guide-perfecting-font-sizes-and-spacing) — MEDIUM confidence
- Font pairings for educational/science content: [OrangeBlue Web Google Fonts 2025](https://orangeblueweb.com/best-google-fonts-in-2025-20-modern-serif-sans-serif-combos-that-convert-visitors-into-customers/), [Predis carousel design tools](https://predis.ai/resources/instagram-carousel-design-tool/) — MEDIUM confidence
- Carousel design best practices: [Pano 15 design tips](https://panocollages.com/blog/15-design-tips-for-eye-catching-instagram-carousels), [Hootsuite Instagram carousel guide](https://blog.hootsuite.com/instagram-carousel/) — MEDIUM confidence
- PNG export rendering: html2canvas vs puppeteer comparison: [npm-compare](https://npm-compare.com/dom-to-image,html2canvas,puppeteer), [portalZINE best HTML to canvas 2025](https://portalzine.de/best-html-to-canvas-solutions-in-2025/) — MEDIUM confidence
- Competitor feature sets: [PostNitro](https://postnitro.ai/carousels/instagram), [aiCarousels](https://www.aicarousels.com/), [Canva carousel templates](https://www.canva.com/instagram-posts/templates/carousel/) — MEDIUM confidence (vendor sites)
- Layout 60/40 whitespace principle: [Pano design tips](https://panocollages.com/blog/15-design-tips-for-eye-catching-instagram-carousels) — MEDIUM confidence
- Source markdown format reference: `output/2026-03-16-crispr-gene-editing.md` — HIGH confidence (actual output file)

---

## Prior v1.0 CLI Feature Research

The full feature landscape for the v1.0 CLI skill (source fetching, citation grounding, slide text generation, caption, hashtags, topic diversity) is preserved in git history at commit `34e1833`. The above replaces and extends that file for the v1.1 web UI milestone.

---

*Feature research for: Science content curation and Instagram carousel generation — v1.1 web UI (Project Pleiades)*
*Researched: 2026-03-17*
