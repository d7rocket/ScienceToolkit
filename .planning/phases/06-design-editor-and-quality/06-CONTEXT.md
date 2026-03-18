# Phase 6: Design Editor and Quality - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add design editing controls (font pairings, color overrides, inline text editing, alignment) to the carousel-ui app, and elevate the default template to premium "science newsletter" quality that requires no user edits. Covers EDIT-01 through EDIT-05 and QUAL-01 through QUAL-04.

Layout additions (Phase 5 delivered): left sidebar (thumbnails) + main canvas + export panel. Phase 6 adds a right sidebar design editor panel.

</domain>

<decisions>
## Implementation Decisions

### Default Template Quality (QUAL-01)
- Visual language: editorial with geometry — not bold graphic, not purely typographic
- Geometric elements: accent bar below the title on body slides + small corner mark (using the `accent` color from ColorScheme)
- Typography sizes locked at: hook title 64px, body title 40px, body text 24px (all within QUAL-02 ranges — already correct in codebase)
- Hook slide differentiation from body slides: Claude's discretion — make it visually distinct enough to signal "opener"
- 60/40 whitespace-to-content ratio (QUAL-03): maintained by layout constants, not user-adjustable
- No decorative imagery or gradients — restraint is the premium signal

### Font Pairing Presets (EDIT-01)
- True heading+body font pairs — two different fonts per preset, not weight variations of one font
- On preset switch: both heading font AND body font change (full pairing swap)
- Claude selects 3-4 science-appropriate presets from @fontsource (self-hosted, no CDN)
  - Good candidates: Space Grotesk+Inter (techy/modern), Fraunces+Inter (editorial), DM Serif Display+DM Sans (premium newsletter), Syne+Inter (contemporary)
  - Inter is already loaded via @fontsource-variable/inter — any Inter-body preset reuses existing font load
- All fonts must be self-hosted via @fontsource packages (canvas taint rule from Phase 5: no runtime CDN)
- QUAL-04: fonts loaded before any canvas render — existing `document.fonts.ready` gate in App.tsx handles this; new fonts must be added to the same gate

### Color Editor (EDIT-02 + EDIT-03)
- Right panel layout: named color scheme preset dropdown at top, then 4 labeled swatches below (Background, Text, Accent, Highlight)
- Selecting a named preset fills all 4 swatches at once — user can then override individual roles
- Individual swatch click opens a color picker (browser native `<input type="color">` or a lightweight library — Claude's discretion)
- Live preview: color changes update the Zustand store's `colors` field immediately; all slides re-render via existing store subscription
- Named presets to include: the auto-loaded markdown palette + 3-4 curated presets — Claude picks names and hex values appropriate for science content

### Inline Text Editing (EDIT-04)
- Interaction: double-click on a text object on the main SlideCanvas to enter edit mode
- Currently all Fabric objects are `selectable: false, evented: false` — must switch text objects to `IText` or `Textbox` with `selectable: true, evented: true`
- Thumbnail canvases remain non-interactive (export source, no events)
- Commit: when user finishes editing (blur or Escape), write updated text back to the Zustand store's `slides` array (title or body field, depending on which object was edited)
- Thumbnail re-renders automatically via existing `useEffect([slide, colors])` in the Thumbnail component
- Export picks up edits because thumbnails re-render from store data before ZIP export
- No "reset to original" feature in this phase

### Text Alignment (EDIT-05)
- Alignment toggle only: left / center / right, per text block
- No free-form repositioning (REQUIREMENTS.md out of scope: "Drag-and-drop element repositioning")
- Alignment control lives in the right sidebar design editor panel, tied to the currently active slide
- Implementation: alignment stored per slide in the Zustand store (new field or override map — Claude's discretion within the fixed-layout system)

### Editor Panel Layout
- Structure: three-column layout — left sidebar (thumbnails, 160px) | main canvas area | right sidebar editor (~260px)
- Right sidebar is always visible (no collapse needed for this phase)
- Panel sections top-to-bottom: Font preset picker → Color presets + swatches → Alignment controls
- Export panel remains in the main canvas area below the active slide canvas (unchanged from Phase 5)

### Claude's Discretion
- Exact hook slide visual treatment (must feel like a distinct opener vs body slides)
- Specific 3-4 font preset names and their heading/body font combinations
- Named color scheme preset hex values (beyond auto-loaded markdown palette)
- Color picker implementation (native input vs library)
- Alignment state shape in the store (new field vs per-slide override map)
- Right sidebar section styling details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 6 requirements: EDIT-01 through EDIT-05, QUAL-01 through QUAL-04. Full acceptance criteria live here.
- `.planning/ROADMAP.md` — Phase 6 success criteria and planned plan breakdown (06-01, 06-02, 06-03).

### Existing implementation (must understand before modifying)
- `carousel-ui/src/types/carousel.ts` — `ColorScheme` interface (4 roles), `defaultDesign`, `SlideRole`, `ParsedSlide` — extend these for font pairing state
- `carousel-ui/src/store/useCarouselStore.ts` — Zustand store; new state fields (selected font preset, alignment overrides) go here
- `carousel-ui/src/canvas/layouts.ts` — Current layout functions with hardcoded `fontFamily: 'Inter'` — must be parameterized for font pairing support
- `carousel-ui/src/canvas/constants.ts` — Safe zone constants (CONTENT_X, CONTENT_Y, CONTENT_WIDTH, CONTENT_HEIGHT) — layout geometry is fixed
- `carousel-ui/src/components/ThumbnailStrip.tsx` — Thumbnail canvases are the export source; they must stay in sync when text is edited

### Project output format
- `examples/output-sample.md` — Canonical markdown format. `## Color Scheme` section auto-loads the initial palette (already implemented in Phase 5).

### Real test fixtures
- `output/2026-03-16-crispr-gene-editing.md` — Primary test fixture for render and edit testing
- `output/2026-03-16-solar-fuel-conversion.md` — Secondary fixture; use to verify different color schemes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCarouselStore` — extend with new fields: `selectedFontPreset`, per-slide alignment overrides. Existing `colors` field already drives re-renders.
- `renderSlide` / `renderHookSlide` / `renderBodySlide` / `renderCtaSlide` — parameterize `fontFamily` from a font pairing object instead of hardcoded `'Inter'`
- `document.fonts.ready` gate in `App.tsx` — extend to include new @fontsource fonts; the gate already blocks canvas render until fonts load (QUAL-04)
- Thumbnail `useEffect([slide, colors])` — already re-renders when slide data changes; text edits committed to store will flow through this automatically
- `canvasRegistry` — thumbnails are the export source; SlideCanvas is for interaction only

### Established Patterns
- All canvas state flows through Zustand store → components subscribe and re-render
- Colors as a flat `ColorScheme` object in the store — extend the same pattern for font presets
- `selectable: false, evented: false` on all Fabric objects — Phase 6 must flip these flags ONLY on the main SlideCanvas text objects (not thumbnails)
- Self-hosted fonts via @fontsource packages — add new font packages to package.json following the same pattern as `@fontsource-variable/inter`
- Fabric.js v6.x pinned (v7 has breaking changes) — use v6 IText/Textbox API for inline editing

### Integration Points
- `App.tsx` — add right sidebar column; no other structural changes needed
- `layouts.ts` — accept `FontPairing` parameter alongside `ColorScheme`
- `useCarouselStore.ts` — add font preset selector and alignment state
- `ThumbnailStrip.tsx` — no changes needed (already re-renders from store); alignment toggle in right panel will trigger store update → thumbnail re-render
- Export pipeline — no changes needed (thumbnails are already the export source)

</code_context>

<specifics>
## Specific Ideas

- STATE.md notes: "Exact font pairing weights, sizes, line heights — design iteration during Phase 6" — this is the moment to nail those values
- The default `defaultDesign` colors (`#0B0E2D` background, `#6C5CE7` accent) should look premium without edits when paired with the default font preset
- Slide verbosity concern from PROJECT.md ("slide text verbosity ~150 chars may exceed Instagram whitespace budget") — inline text editing (EDIT-04) is explicitly the fix mechanism; Phase 6 delivers this

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-design-editor-and-quality*
*Context gathered: 2026-03-18*
