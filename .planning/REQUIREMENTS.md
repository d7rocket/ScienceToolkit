# Requirements: Project Pleiades

**Defined:** 2026-03-17
**Core Value:** Reliably deliver a complete, well-sourced daily science content package that saves hours of manual research while maintaining academic credibility.

## v1.1 Requirements

Requirements for the Carousel Image Generator web UI. Each maps to roadmap phases.

### File Loading

- [x] **LOAD-01**: User can drag & drop a markdown file onto the UI to load carousel content
- [x] **LOAD-02**: User can see parsed slide count, topic title, and date after loading
- [x] **LOAD-03**: Color scheme from markdown auto-populates the palette controls

### Rendering

- [x] **RNDR-01**: Each slide renders as a 1080x1080px canvas with the loaded color palette
- [x] **RNDR-02**: Live preview updates in real-time when colors, fonts, or text change
- [x] **RNDR-03**: Slides use role-aware fixed layouts — hook slide (large title, minimal body), body slides (title + text), CTA slide (takeaway + follow prompt)
- [x] **RNDR-04**: Layout is constant across all posts — consistent margins, safe zones, and content placement
- [x] **RNDR-05**: Safe zone overlay toggle shows Instagram UI boundaries (top 120px, bottom 150px, sides 80px)
- [x] **RNDR-06**: Slide thumbnail strip shows all slides as navigable mini-previews

### Design Editor

- [x] **EDIT-01**: User can select from 3-4 curated font pairings as named presets
- [ ] **EDIT-02**: User can override any of the 4 color roles (background, text, accent, highlight)
- [ ] **EDIT-03**: User can select from named color scheme presets beyond the auto-loaded palette
- [ ] **EDIT-04**: User can edit slide text inline on the canvas
- [x] **EDIT-05**: User can adjust spacing and text alignment per slide

### Export

- [x] **XPRT-01**: User can export individual slides as 1080x1080 PNG files
- [x] **XPRT-02**: User can export all slides as a ZIP bundle
- [x] **XPRT-03**: Exported images match the preview exactly (font rendering, colors, layout)

### Design Quality

- [x] **QUAL-01**: Default template produces premium, science-newsletter-level output without any user edits
- [x] **QUAL-02**: Typography follows science editorial hierarchy — headline 52-64px hook, 36-44px body titles, 22-26px body text
- [x] **QUAL-03**: 60/40 whitespace-to-content ratio maintained across all slide layouts
- [x] **QUAL-04**: Fonts are self-hosted and loaded before any canvas render (no FOIT)

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### UX Polish

- **UX-01**: Verbosity-aware character count warning on body text
- **UX-02**: Source image metadata panel showing fetched image URLs as thumbnails

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop element repositioning | Breaks visual cohesion; role-aware fixed layouts are the design philosophy |
| AI image generation on slides | Requires external API keys; violates no-external-API constraint |
| Direct Instagram publishing | Requires Instagram Graph API + OAuth; manual review is intentional |
| Blank canvas / free-form slide creation | Contradicts tool purpose — renders structured `/science` output only |
| Animation / GIF / video export | Significant complexity; Instagram static carousels are the target format |
| Multi-file batch rendering | Defeats daily-freshness purpose; one file per session |
| Template save/load marketplace | Premature; color scheme in markdown IS the reusable config |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOAD-01 | Phase 5 | Complete |
| LOAD-02 | Phase 5 | Complete |
| LOAD-03 | Phase 5 | Complete |
| RNDR-01 | Phase 5 | Complete |
| RNDR-02 | Phase 5 | Complete |
| RNDR-03 | Phase 5 | Complete |
| RNDR-04 | Phase 5 | Complete |
| RNDR-05 | Phase 5 | Complete |
| RNDR-06 | Phase 5 | Complete |
| XPRT-01 | Phase 5 | Complete |
| XPRT-02 | Phase 5 | Complete |
| XPRT-03 | Phase 5 | Complete |
| EDIT-01 | Phase 6 | Complete |
| EDIT-02 | Phase 6 | Pending |
| EDIT-03 | Phase 6 | Pending |
| EDIT-04 | Phase 6 | Pending |
| EDIT-05 | Phase 6 | Complete |
| QUAL-01 | Phase 6 | Complete |
| QUAL-02 | Phase 6 | Complete |
| QUAL-03 | Phase 6 | Complete |
| QUAL-04 | Phase 6 | Complete |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after roadmap creation*
