# Project Research Summary

**Project:** Project Pleiades — Science Toolkit v1.1 Web UI
**Domain:** Local browser-based markdown-to-Instagram carousel image generator
**Researched:** 2026-03-17
**Confidence:** HIGH

## Executive Summary

Project Pleiades v1.1 adds a local web UI carousel renderer on top of a validated v1.0 CLI pipeline. The v1.0 `/science` skill already produces structured markdown files in `output/` with slide text, captions, hashtags, citations, and a 4-color palette — the web UI's only job is to render those files as pixel-exact 1080x1080 PNG carousel images ready for Instagram. Experts building this class of tool converge on one architectural choice: a canvas-based renderer rather than DOM capture. Canvas rendering is deterministic, pixel-exact, and immune to the CORS and CSS property gaps that plague HTML-to-image approaches. The recommended stack is Vite 8 + React 19 + Fabric.js 7 + Zustand 5 + Tailwind CSS 4, with self-hosted fonts via Fontsource and gray-matter for markdown parsing.

The recommended approach separates rendering into two paths: a CSS-scaled React component for the interactive preview (fast, reactive, driven by Zustand stores), and an off-screen Fabric.js canvas at true 1080x1080px for export-quality output. Both paths consume the same design state so edits to the preview are guaranteed to match the export. The markdown parser is a pure-function regex section splitter (no AST needed) that produces a typed `CarouselDoc` object. Three Zustand slices (carousel content, design settings, UI state) are deliberately separated to prevent cascade re-renders when unrelated parts of the editor change.

The primary risks are rendering quality and build order. Three critical pitfalls must be solved in Phase 1 before any other feature work: font loading must be gated on `document.fonts.ready` (silent failure otherwise), `pixelRatio` must be locked to `1` in the canvas export call (blurry output on retina without it), and all asset URLs must be local or converted to blob URLs (canvas tainting silently breaks export). The secondary risk is visual quality: the default template IS the product — a generic starting template produces generic-looking outputs that no amount of editor controls can rescue. Dedicate explicit design iteration time to the default template in Phase 2 before building the editor.

---

## Key Findings

### Recommended Stack

See `.planning/research/STACK.md` for full details, alternatives considered, version compatibility table, and installation commands.

The stack is built around Fabric.js 7 as the central architectural choice. Fabric.js provides built-in click-to-edit text, transform handles, layer ordering, and `canvas.toDataURL()` for pixel-exact PNG export — features that would require weeks of custom implementation in any alternative. Vite 8 provides near-instant HMR; React 19 maps cleanly to editor state via hooks; Zustand 5 uses `useSyncExternalStore` natively for correct concurrent rendering behavior. Tailwind CSS v4's Vite-native plugin eliminates PostCSS config entirely. Fonts are self-hosted via Fontsource (no CDN round-trip, works offline) and gated through FontFaceObserver before any canvas render.

**Core technologies:**
- **Vite 8 + `@vitejs/plugin-react`:** Build tool, instant HMR, Rolldown fully integrated — scaffolds in under 1 second
- **React 19:** UI framework; hooks map cleanly to editor state (active slide, palette overrides, selected object)
- **TypeScript 5:** The `CarouselDoc` type contract is complex enough to require types; Fabric.js v7 ships its own types — do NOT install `@types/fabric`
- **Fabric.js 7.2:** Canvas rendering, built-in text editing, `canvas.toDataURL({ pixelRatio: 1 })` for pixel-exact export
- **Zustand 5:** Three independent slices (carouselStore, designStore, uiStore); prevents cascade re-renders; no providers
- **Tailwind CSS 4:** UI chrome only (toolbars, panels, sidebar); slide content lives on the Fabric.js canvas
- **gray-matter 4.0.3:** Parse YAML frontmatter from `/science` markdown output
- **react-dropzone 15:** `useDropzone` hook for markdown file drag-and-drop input
- **JSZip 3.10 + file-saver 2:** Client-side ZIP bundle of exported PNGs
- **@fontsource/inter + @fontsource/space-grotesk:** Self-hosted fonts, offline-safe, no CDN dependency
- **FontFaceObserver 2:** Promise-based font load gate before any canvas render

**What to avoid:** html2canvas (unmaintained, text rendering bugs), `@types/fabric` (v5 community types conflict with Fabric.js v7's built-in types), `window.devicePixelRatio` in export call (produces 2160px on retina), Next.js (no server needed), CSS-in-JS (runtime overhead for a local tool).

### Expected Features

See `.planning/research/FEATURES.md` for full prioritization matrix, feature dependency map, competitor analysis, and design principles.

**Must have (P1 — v1.1 launch, workflow fails without these):**
- Markdown drag-and-drop loading and parsing — root dependency for everything else
- Per-slide canvas render at 1080x1080px with title + body text
- Color palette pre-loaded from `## Color Scheme` section in markdown (additive change to skill still pending — DESIGN-05)
- Live preview that updates instantly on color/font changes (CSS-scaled, no canvas involvement)
- 2-3 curated named font pairings (e.g., "Editorial" = DM Serif Display + Inter, "Modern Lab" = Space Grotesk + Source Sans Pro)
- Color override controls for all 4 color roles (background, text, accent, highlight)
- Slide navigation (prev/next with slide counter)
- Inline text editing on canvas — the mechanism for trimming verbose ~150-char body slides
- PNG export per slide (1080x1080, `pixelRatio: 1`)
- ZIP bundle export of all slides with topic-derived filenames

**Should have (P2 — add after v1.1 is in daily use):**
- Slide indicator dots preview strip (thumbnail chips showing full carousel flow)
- Safe zone visual overlay toggle (shows Instagram UI overlap zones at 120px top, 150px bottom)
- Verbosity character count warning (amber at 120 chars, red at 160)
- Slide role awareness (hook/body/CTA layout variants with different visual weight and font sizing)
- Source image metadata panel (read-only reference thumbnails from markdown source image URLs)

**Defer to v2+:**
- Named color scheme presets ("Deep Space", "Clean Lab", "Forest Biology")
- Layout presets (centered, left-aligned, split image/text)
- Thumbnail strip export for Instagram Stories preview

**Hard anti-features (explicitly out of scope per FEATURES.md):**
- Drag-and-drop element repositioning — conflicts with role-aware fixed layouts; multiplies complexity 5-10x
- AI image generation — requires external API keys, violates project constraints
- Direct Instagram publishing — requires OAuth; also bypasses intentional human review
- Animation/GIF/video export — out of scope for v1.1 per PROJECT.md

**Layout constraints (Instagram-verified from FEATURES.md):**
- Safe zone: 120px top, 150px bottom, 80px sides; effective content area 920x810px within 1080x1080
- Typography: 52-64px headline (hook slide), 36-44px (body slides), 22-26px body text, line height 1.4-1.6x
- Target 60% whitespace, 40% content — the known ~150-char body text verbosity problem violates this

### Architecture Approach

See `.planning/research/ARCHITECTURE.md` for full component diagram, data flow, integration points, suggested build order, and anti-patterns.

The architecture follows a clean separation between parse, state, preview, and export. The markdown parser (`markdownToSlides.ts`) is a pure function returning a typed `CarouselDoc` — it has no UI dependencies and can be tested independently. Three Zustand slices hold content (what renders), design settings (how it looks), and transient UI state (active slide, export progress). The preview is a CSS-scaled React component driven by Zustand subscriptions for instant feedback. The export path uses an off-screen Fabric.js canvas at true 1080x1080px — a completely separate implementation from the preview that consumes the same design constants from `slideLayout.ts`. This dual-path architecture prevents the most common failure mode: exporting the CSS-scaled preview and getting a soft, blurry image.

**Major components:**
1. `markdownToSlides.ts` — pure-function regex section splitter; `CarouselDoc` type is the data contract for everything
2. `carouselStore` / `designStore` / `uiStore` — three Zustand slices; separated to prevent cascade re-renders across concerns
3. `SlidePreview` — CSS `transform: scale()` React component for interactive preview (fast, reactive, display-only)
4. `SlideCanvas` — off-screen `position: absolute; left: -9999px` Fabric.js canvas at true 1080x1080px (export path)
5. `fontLoader.ts` — CSS Font Loading API gate (`document.fonts.ready`); must resolve before any canvas draw call
6. `exportPng.ts` / `exportZip.ts` — side-effectful export functions isolated from the component tree
7. `SKILL.md + output-template.md update` — additive change to emit `## Color Scheme` section (DESIGN-05); parser handles absence with `defaultDesign` fallback, so this is not a launch blocker

**Recommended build order (from ARCHITECTURE.md):**
Parser + types → Zustand stores with defaults → DropZone file input → CSS preview → Font loader + Canvas renderer → PNG/ZIP export → Palette editor → Font picker → Text editor → Skill Color Scheme section update

### Critical Pitfalls

See `.planning/research/PITFALLS.md` for full catalogue, recovery strategies, "looks done but isn't" checklist, and phase mapping.

1. **Fonts not loaded before canvas renders** — Gate all canvas renders on `document.fonts.ready` AND explicit `FontFace.load()`. Test in an incognito window on every release. Silent failure — canvas uses system fallback font with no error thrown. Must be solved in Phase 1 before any visual testing is meaningful.

2. **HiDPI/Retina produces blurry PNG** — Lock `pixelRatio: 1` (not `window.devicePixelRatio`) in the Fabric.js `canvas.toDataURL()` call. Dynamic device pixel ratio makes output resolution device-dependent. Verify by opening the exported PNG in an image editor and confirming exactly 1080x1080 pixel dimensions. Must be solved in Phase 1.

3. **Canvas tainted by cross-origin resources** — Keep all assets local. Bundle fonts as base64 via Fontsource npm packages. For any background image, load via `fetch()` with CORS mode and convert to blob URL before drawing into Fabric.js. External URLs in canvas permanently block `toDataURL()` with a `SecurityError`. Must be solved in Phase 1.

4. **Generic/PowerPoint-looking default template** — The default template is the product quality. A template with centered text on a white background, generic font sizes, and no visual hierarchy produces generic Instagram content regardless of how good the editor controls are. Invest deliberate design iteration time in Phase 2. Acceptance test: show exported slides to a non-technical reviewer and ask "would you follow this account?"

5. **Markdown parsing breaks on real output files** — Parse `output/2026-03-16-crispr-gene-editing.md` as the primary acceptance test fixture, not synthetic test content. Real files include YAML frontmatter, Unicode scientific symbols (μ, ±, ², β), bold/italic, and long DOI citation strings. Fail loudly on parse errors — show an error banner rather than rendering incorrect content silently.

6. **ZIP export hangs with no feedback** — Use JSZip `generateAsync({ type: 'blob', streamFiles: true })` with an `onUpdate` progress callback. Show a progress indicator before the ZIP bundle is complete. Implement per-slide PNG download as a fallback. Test with all 7 slides at full resolution before launch.

7. **Drag-and-drop navigates away from the app** — Register `preventDefault()` on `document` for both `dragover` and `drop` events globally. Show a full-viewport drag overlay on `dragenter`. Test by deliberately dropping a file on non-drop-zone areas (header, sidebar, empty space).

---

## Implications for Roadmap

Based on combined research, a 4-phase structure is recommended. The ordering is dictated by feature dependencies (markdown loading is the root dependency), pitfall-to-phase mapping from PITFALLS.md (rendering quality must be solved before design work), and the ARCHITECTURE.md suggested build order.

### Phase 1: Renderer Foundation

**Rationale:** Three critical pitfalls (font loading, pixel ratio, canvas tainting) must be solved before any other phase. If the renderer produces blurry, wrong-font, or blank exports, all subsequent design and UX work is built on an invalid foundation. This phase answers: can this stack produce a correct 1080x1080 PNG from a markdown file?

**Delivers:** End-to-end pipeline from markdown file drop to correct PNG download. No design editor yet — just proof that the core rendering path works.

**Addresses (P1 features):** Markdown file loading and parsing, per-slide canvas render (1080x1080), color palette pre-load from markdown (with `defaultDesign` fallback), slide navigation, PNG export per slide, ZIP bundle export.

**Implements:** `markdownToSlides.ts` + `types.ts`, all three Zustand stores with hardcoded defaults, `DropZone`, `SlideCanvas` (off-screen Fabric.js 1080x1080), `fontLoader.ts`, `exportPng.ts`, `exportZip.ts`.

**Avoids:** Pitfalls 1-3 (font load, HiDPI/retina, canvas tainting). These must be solved here — recovery cost grows significantly if discovered in later phases.

**Acceptance test:** Load `output/2026-03-16-crispr-gene-editing.md`, export all slides as ZIP, open each PNG in an image editor and verify: (a) exactly 1080x1080 pixels, (b) correct intended fonts not system fallback, (c) no blank or corrupted slides, (d) YAML frontmatter stripped, (e) Unicode characters render correctly.

**Research flag:** Standard patterns — skip research-phase. Fabric.js canvas rendering, Zustand store setup, and FontFaceObserver patterns are well-documented with HIGH-confidence official sources. Implementation can proceed directly from ARCHITECTURE.md.

---

### Phase 2: Design System and Default Template

**Rationale:** The default template must be production-quality before the editor is built. The editor enhances a good default — it cannot rescue a bad one. A generic default guarantees generic output because most users will not change it. PITFALLS.md rates this pitfall as HIGH recovery cost if caught late.

**Delivers:** A visually compelling default template with deliberate typography hierarchy, whitespace, and color roles. 2-3 named font pairings. Color palette from markdown frontmatter drives initial design. The tool produces Instagram-quality output before any user customization.

**Addresses (P1 features):** Curated font pairings (3 named presets), live preview updates on design changes, color override controls, slide layout constants (padding, font sizes, safe zones from `slideLayout.ts`).

**Implements:** `SlidePreview` (CSS-scaled React component), `designStore` initialization from parsed color scheme, `FontPicker`, `PaletteEditor`, `slideLayout.ts` constants, `defaultDesign.ts`.

**Avoids:** Pitfall 7 (generic visual output). Also sets the "safe CSS subset" constraint — only CSS properties confirmed to work in both the CSS preview and Fabric.js canvas export are included.

**Research flag:** Needs design iteration — specific color palette defaults, font pairing selections (weights, sizes, line heights), and layout hierarchy choices require creative decisions that cannot be fully pre-specified from research alone. Budget design review time here. Reference: Kurzgesagt and high-quality science Instagram accounts for visual patterns.

---

### Phase 3: File Loading and Markdown Parser Hardening

**Rationale:** The parser built in Phase 1 uses synthetic test content. Phase 3 hardens it against real `/science` output files. The drag-and-drop UX also has a specific browser navigation pitfall that must be tested deliberately against non-drop-zone areas.

**Delivers:** Robust markdown parsing handling all real `/science` output file variants (YAML frontmatter, Unicode, bold/italic, variable slide counts, long DOI strings). Drag-and-drop with global `preventDefault()`. Parse error handling with an error banner UI (never silent failure). Inline text editing on canvas.

**Addresses (P1 features):** Finalized drag-and-drop file input, inline text editing on canvas (the verbosity fix mechanism for ~150-char body slides). (P2): Source image metadata panel.

**Implements:** Hardened `markdownToSlides.ts` tested against real files, `DropZone` with document-level event handlers, error banner component, `TextEditor.tsx` for per-slide text overrides.

**Avoids:** Pitfall 5 (drag-and-drop browser navigation), Pitfall 8 (markdown parsing breaks on real files).

**Acceptance test:** Load both `output/2026-03-16-crispr-gene-editing.md` and `output/2026-03-16-solar-fuel-conversion.md`. Verify slide counts match source, Unicode renders correctly, YAML frontmatter is stripped, bold/italic markers do not appear as literal asterisks in the rendered slides. Test dropping a file onto the header, sidebar, and empty canvas area — browser must not navigate away.

**Research flag:** Standard patterns — skip research-phase. `react-dropzone` API and File API are documented with HIGH confidence. Regex section splitter pattern is defined in ARCHITECTURE.md.

---

### Phase 4: Export Polish, UX Features, and Skill Integration

**Rationale:** Export reliability (ZIP without hanging), validated P2 UX features, and the skill-side `## Color Scheme` integration complete the v1.1 daily workflow. These are validated against real daily use before implementing — post-validation means after Phase 1-3 are confirmed working.

**Delivers:** Production-ready ZIP export with progress feedback. Per-slide download fallback buttons. P2 UX features validated by actual use: slide indicator strip, safe zone overlay, verbosity character count warnings. `## Color Scheme` section added to SKILL.md and `output-template.md` (DESIGN-05) so the palette loads automatically from new outputs.

**Addresses (P1 features):** ZIP bundle export with JSZip `streamFiles: true` + progress indicator. (P2): Slide indicator dots strip, safe zone overlay toggle, verbosity character count warning. Slide role awareness (hook/body/CTA) if included in v1.1 scope.

**Implements:** `ExportBar` with progress indicator, SKILL.md update to emit `## Color Scheme` section, `designStore.initFromColorScheme()` consuming the new section, P2 UX components.

**Avoids:** Pitfall 6 (ZIP hangs main thread without feedback — use `streamFiles: true` + `onUpdate`).

**Research flag:** Slide role awareness (hook/body/CTA layout variants) is rated HIGH complexity in FEATURES.md. If included in this phase, run `/gsd:research-phase` to define the exact layout variant specs (font sizes, padding, element placement per role) before implementation begins. All other work in this phase uses standard patterns and can skip research.

---

### Phase Ordering Rationale

- **Renderer before design system:** PITFALLS.md maps 4 critical pitfalls to "Phase 1: Renderer Foundation." If these are not solved first, all visual testing in Phase 2 is unreliable — a "good-looking" preview may produce wrong-font, blurry exports.
- **Default template before editor:** PITFALLS.md Pitfall 7 is rated HIGH recovery cost if caught late. The editor exposes controls to modify the template; it does not fix a poor default.
- **Synthetic test before real files:** Phase 1 proves the rendering path works with simple content. Phase 3 proves the parser handles production data. The deliberate split makes debugging easier — rendering bugs and parsing bugs don't combine.
- **Skill integration last:** The `## Color Scheme` section is additive and non-blocking. The Phase 1 parser handles its absence with `defaultDesign` fallback. The skill update is a polish enhancement, not a launch dependency.
- **Markdown loading is the root dependency:** Everything in the feature dependency graph traces back to `markdownToSlides.ts`. This function must be the first thing that works.

### Research Flags

**Needs research during planning:**
- **Phase 2 (Design System):** Visual design decisions — font pairing weights, palette defaults, layout hierarchy, spacing — cannot be fully pre-specified from research alone. Review Kurzgesagt, Kurzgesagt-adjacent science Instagram accounts, and 2025/2026 carousel design showcases before specifying implementation.
- **Phase 4 (Slide Role Awareness, if in scope):** Rated HIGH complexity in FEATURES.md. Run `/gsd:research-phase` on "role-aware Instagram carousel layout variants" to define hook/body/CTA layout specs before implementation.

**Standard patterns (skip research-phase):**
- **Phase 1 (Renderer Foundation):** Fabric.js v7, Zustand 5, FontFaceObserver, and Vite 8 are all well-documented with verified official sources. The ARCHITECTURE.md build order can be followed directly.
- **Phase 3 (File Loading + Parser Hardening):** `react-dropzone`, File API, and the regex section splitter are documented with HIGH confidence. No research needed.
- **Phase 4 (Export + Skill Integration, excluding role awareness):** JSZip `streamFiles`, `file-saver`, and the Fabric.js `canvas.toDataURL()` export call are all well-documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core choices (Fabric.js 7, Vite 8, React 19, Zustand 5, Tailwind 4) verified against official docs. Version numbers from npm registry data (exact patch versions MEDIUM). |
| Features | HIGH (Instagram specs) / MEDIUM (feature prioritization) | Instagram safe zones and dimensions verified via HIGH-confidence 2026 sources. Feature prioritization and typography sizing from MEDIUM-confidence carousel design guides. |
| Architecture | HIGH | Core patterns (dual render path, three-slice Zustand, font-load gate, off-screen canvas) verified against MDN, official library docs, and multiple independent sources agreeing. |
| Pitfalls | HIGH | All critical pitfalls verified against official MDN docs, library GitHub issues, and 2025 community post-mortems. Multiple independent sources confirm each pitfall. |

**Overall confidence:** HIGH

### Gaps to Address

- **Color Scheme section format (DESIGN-05 pending):** The `/science` skill does not yet emit a `## Color Scheme` section. The existing output files (`output/2026-03-16-crispr-gene-editing.md`) lack this section. When DESIGN-05 ships, validate the parser's `colorScheme` extraction against the actual emitted format before marking Phase 4 complete.

- **Fabric.js vs html-to-image rendering path:** STACK.md recommends Fabric.js canvas for both preview and export. ARCHITECTURE.md has a note suggesting html-to-image for the export path via a DOM capture approach. The correct decision is Fabric.js throughout — this eliminates CSS property gap pitfalls (Pitfall 4) entirely and removes the need for a separate off-screen DOM element. Resolve this discrepancy at the start of Phase 1 and document the decision in the implementation plan.

- **Exact font pairing specifications for Phase 2:** FEATURES.md names candidate pairings but does not specify exact weights, sizes, or line heights per slide role. These design decisions must be made during Phase 2 iteration before the editor is built.

- **Slide role awareness layout specs:** If included in v1.1 scope, the exact layout differences between hook, body, and CTA slides are not yet specified. Flag for `/gsd:research-phase` in Phase 4 planning.

---

## Sources

### Primary (HIGH confidence)
- [MDN: CSS Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) — FontFace, document.fonts.ready, document.fonts.add()
- [MDN: Window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) — pixel ratio canvas scaling
- [MDN: CORS-enabled image in canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image) — canvas taint and cross-origin images
- [Fabric.js v6 Upgrade Guide](https://fabricjs.com/docs/upgrading/upgrading-to-fabric-60/) — ESM rewrite, TypeScript migration
- [Fabric.js Custom Font Loading Demo](https://fabricjs.com/demos/loading-custom-fonts/) — CSS Font Loader API pattern
- [Konva.js High-Quality Export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html) — pixelRatio export API
- [Tailwind CSS v4 Vite install](https://tailwindcss.com/docs) — @tailwindcss/vite plugin, no PostCSS config
- [Zustand v5 announcement](https://pmnd.rs/blog/announcing-zustand-v5) — v5 drops React <18, useSyncExternalStore
- [Fontsource install docs](https://fontsource.org/docs/getting-started/install) — npm install + CSS import pattern
- [JSZip documentation](https://stuk.github.io/jszip/) — client-side ZIP generation, streamFiles, limitations
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) — v4.0.3, YAML frontmatter parse in browser
- [Instagram safe zones — Zeely 2026](https://zeely.ai/blog/master-instagram-safe-zones/) — safe zone dimensions
- [Instagram carousel dimensions — PostNitro](https://postnitro.ai/blog/post/instagram-carousel-dimensions-your-ultimate-guide) — 1080x1080 specs
- `output/2026-03-16-crispr-gene-editing.md` — actual output file; primary parser acceptance test fixture

### Secondary (MEDIUM confidence)
- [react-dropzone npm](https://www.npmjs.com/package/react-dropzone) — v15.x, useDropzone hook API
- [html-to-image npm](https://www.npmjs.com/package/html-to-image) — toPng(), pixelRatio option, SVG foreignObject limitations
- [Better Programming: Replacing html2canvas with html-to-image](https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf) — migration rationale and tradeoffs
- [PostNitro typography guide](https://postnitro.ai/blog/post/carousel-typography-guide-perfecting-font-sizes-and-spacing) — carousel font sizes and spacing
- [Pano 15 design tips](https://panocollages.com/blog/15-design-tips-for-eye-catching-instagram-carousels) — 60/40 whitespace principle
- [img.ly Design Editor SDKs 2025](https://img.ly/blog/open-source-design-editor-sdks-a-developers-guide-to-choosing-the-right-solution/) — Fabric.js vs Konva comparison
- [Zustand state management in React 2025](https://makersden.io/blog/react-state-management-in-2025) — Zustand as standard middle-ground
- [Canvas HiDPI rendering — Kirupa](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm) — retina display canvas scaling
- [Tainted canvas — Corsfix](https://corsfix.com/blog/tainted-canvas) — cross-origin canvas security
- [Instagram design mistakes — Haute Stock](https://hautestock.co/instagram-carousel-design-mistakes-to-avoid/) — generic template pitfall
- WebSearch: fabric@7.2.0, react@19.2.x, vite@8.x, zustand@5.0.x — npm registry version data

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*
