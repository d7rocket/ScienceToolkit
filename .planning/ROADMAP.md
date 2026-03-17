# Roadmap: Project Pleiades

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-16)
- ✅ **v1.1 Phase 5 Renderer and Export** — shipped 2026-03-18
- 🚧 **v1.1 Carousel Image Generator** — Phase 6 remaining (Design Editor and Quality)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-16</summary>

- [x] Phase 1: Skill Scaffold (1/1 plans) — completed 2026-03-15
- [x] Phase 2: Source Fetching (1/1 plans) — completed 2026-03-16
- [x] Phase 3: Content Generation (3/3 plans) — completed 2026-03-16
- [x] Phase 4: Validation and Auto-Topic (2/2 plans) — completed 2026-03-16

See: [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) for full details.

</details>

### 🚧 v1.1 Carousel Image Generator (In Progress)

**Milestone Goal:** Build a local web UI that transforms markdown carousel output into export-ready Instagram carousel images.

- [x] **Phase 5: Renderer and Export** - File loading, slide rendering, and PNG/ZIP export pipeline — COMPLETE 2026-03-18
- [ ] **Phase 6: Design Editor and Quality** - Full design editing controls with premium default template

## Phase Details

### Phase 5: Renderer and Export
**Goal**: Users can drop a markdown file, see all slides rendered as 1080x1080 canvases, and export PNG files ready for Instagram
**Depends on**: Phase 4 (v1.0 output files exist as input)
**Requirements**: LOAD-01, LOAD-02, LOAD-03, RNDR-01, RNDR-02, RNDR-03, RNDR-04, RNDR-05, RNDR-06, XPRT-01, XPRT-02, XPRT-03
**Success Criteria** (what must be TRUE):
  1. User drags a `/science` markdown file onto the UI and all slides appear as rendered previews within the safe zone boundaries
  2. Exported PNG files are exactly 1080x1080px with correct fonts (not system fallbacks) and no blank or corrupted slides
  3. User can export all slides as a ZIP bundle with a progress indicator and per-slide fallback download buttons
  4. Color scheme parsed from markdown auto-populates the initial palette; app loads with a sensible default if no color scheme section is present
  5. Slide thumbnail strip shows all slides and user can navigate between them
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Vite scaffold, type definitions, markdown parser, Zustand store, DropZone and MetaBar components
- [x] 05-02-PLAN.md — Canvas constants, slide layout functions, SlideCanvas component, ThumbnailStrip sidebar
- [x] 05-03-PLAN.md — PNG and ZIP export pipeline, ExportPanel, canvas registry, visual verification checkpoint

### Phase 6: Design Editor and Quality
**Goal**: Users can customize fonts, colors, and text on any slide, and the default template produces premium-quality output without any edits
**Depends on**: Phase 5
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. A non-technical reviewer looking at exported slides (no edits applied) says the output looks professional enough to follow the account
  2. User can select from 3-4 named font pairings and see the preview update immediately
  3. User can override any of the 4 color roles and see slides update in real-time
  4. User can edit slide text inline on the canvas and the export reflects those edits exactly
  5. Typography follows editorial hierarchy and whitespace-to-content ratio is visibly balanced across all slide layouts
**Plans**: TBD

Plans:
- [ ] 06-01: Default template, typography system, and design constants
- [ ] 06-02: Font picker, palette editor, and live preview wiring
- [ ] 06-03: Inline text editing and spacing/alignment controls

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Skill Scaffold | v1.0 | 1/1 | Complete | 2026-03-15 |
| 2. Source Fetching | v1.0 | 1/1 | Complete | 2026-03-16 |
| 3. Content Generation | v1.0 | 3/3 | Complete | 2026-03-16 |
| 4. Validation and Auto-Topic | v1.0 | 2/2 | Complete | 2026-03-16 |
| 5. Renderer and Export | v1.1 | 3/3 | Complete | 2026-03-18 |
| 6. Design Editor and Quality | v1.1 | 0/3 | Not started | - |
