# Phase 5: Renderer and Export - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a local web UI that loads `/science` markdown output, renders each slide as a 1080x1080 Fabric.js canvas, and exports PNG/ZIP files ready for Instagram. This phase delivers file loading, slide rendering, font management, thumbnail navigation, and the export pipeline. Design editor controls (color overrides, font pickers, inline text editing) are Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Tech Stack
- Framework: React + Vite
- Styling: Tailwind CSS (UI shell only — not canvas)
- State management: Zustand (single store for slides, colors, fonts, export state)
- App directory: `carousel-ui/` at project root, with its own `package.json`
- Start command: `npm run dev` from `carousel-ui/`

### Canvas Rendering
- Library: Fabric.js — WYSIWYG canvas that IS the export source (no re-render needed)
- Resolution: Single 1080x1080 canvas always. CSS `transform: scale()` shrinks it for preview. Export grabs the canvas as-is.
- Font loading: Self-hosted via `@font-face`. Block canvas render until `document.fonts.ready` resolves (FontFaceObserver or equivalent). No external CDN at runtime.
- Thumbnails: Live mini Fabric.js canvases (not PNG snapshots) — always in sync with the full slide. Clicking switches the active slide.
- Export pixel ratio: `pixelRatio: 1` for PNG export to match the 1080x1080 canvas exactly.

### Slide Layouts
- **Hook slide (Slide 1):** Large title (~64px) fills top ~40% of the safe zone. Body text (question/fact) centered below in the remaining space. Whitespace-dominant — impact through restraint.
- **Body slides (Slides 2–N-1):** Claude's discretion — design to REQUIREMENTS typography specs (36–44px title, 22–26px body text, 60/40 whitespace-to-content ratio, slide number badge).
- **CTA slide (final slide):** Claude's discretion — takeaway sentence + "Follow for daily science drops" CTA.
- Safe zone boundaries: top 120px, bottom 150px, sides 80px — invisible by default, toggled by user (RNDR-05).
- All layouts are role-aware and fixed — no free-form positioning.

### Thumbnail Strip
- Position: Left sidebar, vertical strip
- Each thumbnail is a small live Fabric.js canvas mirroring its full slide
- Clicking a thumbnail makes it the active slide in the main canvas area

### Drag-Drop & Loading UX
- Initial state: Full-screen drop zone with 'Drop your /science markdown file here' prompt
- Post-load: Metadata top bar showing: topic title | date | slide count | field (LOAD-02)
- Invalid file: Inline error in drop zone (turns red, shows message). No page reload needed. User can retry.
- File reload: Dragging a new file replaces the current session immediately — no confirmation dialog
- Color scheme parsed from `## Color Scheme` section auto-populates palette (LOAD-03). If absent, use hardcoded `defaultDesign` fallback.

### Claude's Discretion
- Body slide and CTA slide precise layout (follow REQUIREMENTS typography specs)
- Slide number badge style and position
- ZIP generation library (JSZip recommended)
- Export progress indicator implementation
- Per-slide fallback download button placement (XPRT-03)
- App color scheme for the UI shell itself (dark editor aesthetic fits the tool)
- Error state styling details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project output format (parser input)
- `examples/output-sample.md` — Canonical markdown format contract. Parser must handle this exact structure: `## Slide N: Title`, `## Caption`, `## Hashtags`, `## Sources`, `## Images`, `## Color Scheme`.

### Requirements
- `.planning/REQUIREMENTS.md` — All v1.1 requirements. Phase 5 covers: LOAD-01–03, RNDR-01–06, XPRT-01–03. Typography specs in QUAL-02 and QUAL-04 are relevant even though those reqs are Phase 6.
- `.planning/ROADMAP.md` — Phase 5 success criteria and plan breakdown (05-01, 05-02, 05-03).

### Real output files (test fixtures)
- `output/2026-03-16-crispr-gene-editing.md` — Real `/science` output. Use as primary test fixture for parser and renderer.
- `output/2026-03-16-solar-fuel-conversion.md` — Second real output. Use to verify parser handles different topic/color schemes.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — `carousel-ui/` is a greenfield web application. The existing project is a Claude Code skill (markdown files only).

### Established Patterns
- Output format: The markdown parser must handle the `/science` skill output format exactly as defined in `examples/output-sample.md`. The `## Color Scheme` section contains hex values in `- Background: #XXXXXX — descriptor` format.
- Color roles: 4 fixed roles (background, primary text, accent, highlight) — same roles used in the skill output and in REQUIREMENTS.

### Integration Points
- Input: User drops a file from `output/` directory into the web UI
- Output: PNG files exported to browser downloads (individual + ZIP bundle)
- No server component — entirely client-side app

</code_context>

<specifics>
## Specific Ideas

- The `## Color Scheme` section in markdown has a specific format: `- Background: #0B0E2D — midnight`. Parser must extract hex values by color role name.
- STATE.md notes 3 critical pitfalls to avoid: (1) font loading gate — must block canvas render until fonts ready, (2) pixelRatio=1 for export — don't use devicePixelRatio, (3) no cross-origin canvas assets — all fonts and assets must be self-hosted to avoid canvas taint.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-renderer-and-export*
*Context gathered: 2026-03-18*
