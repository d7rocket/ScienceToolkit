---
phase: 05-renderer-and-export
plan: "03"
subsystem: ui
tags: [fabric.js, jszip, png-export, zip-export, react, canvas, carousel]

# Dependency graph
requires:
  - phase: 05-01
    provides: Carousel foundation — parser, store, Zustand state with exportProgress/exportError fields, Inter font loading
  - phase: 05-02
    provides: SlideCanvas, ThumbnailStrip, role-aware layout rendering, Fabric.js canvas instances

provides:
  - PNG export pipeline: exportSlideAsPng calling canvas.toDataURL with multiplier:1 (1080x1080 guaranteed)
  - ZIP bundle export: exportAllSlidesAsZip with per-slide progress callback, correct slide-0N.png naming
  - canvasRegistry module: Map<number, Canvas> for collecting all thumbnail canvases for export
  - ExportPanel component: ZIP export button with progress bar, 2-second completion reset
  - Per-slide fallback PNG download buttons embedded in ThumbnailStrip
  - Complete shippable carousel-ui app: load -> render -> export pipeline end-to-end

affects: [phase-06-design-iteration, any consumer needing WYSIWYG export]

# Tech tracking
tech-stack:
  added: [jszip]
  patterns:
    - canvasRegistry module-level Map for collecting Fabric.js instances across components
    - Thumbnail canvases as export source (always rendered, always in sync with slide data)
    - multiplier:1 on canvas.toDataURL (canvas already 1080x1080, no scaling needed)
    - fetch(dataUrl) for base64-to-Blob conversion in ZIP pipeline
    - URL.createObjectURL / revokeObjectURL for memory-safe file downloads

key-files:
  created:
    - carousel-ui/src/canvas/canvasRegistry.ts
    - carousel-ui/src/export/exportPng.ts
    - carousel-ui/src/export/exportZip.ts
    - carousel-ui/src/components/ExportPanel.tsx
    - carousel-ui/src/export/__tests__/exportPng.test.ts
    - carousel-ui/src/export/__tests__/exportZip.test.ts
  modified:
    - carousel-ui/src/components/ThumbnailStrip.tsx
    - carousel-ui/src/App.tsx

key-decisions:
  - "Thumbnail canvases (not main SlideCanvas) are the export source — they are always rendered and in sync with slide data, avoiding needing to iterate and re-render for export"
  - "multiplier:1 is mandatory on canvas.toDataURL — canvas is already 1080x1080, any higher multiplier produces oversized output"
  - "fetch(dataUrl) used for base64-to-Blob conversion inside ZIP pipeline — handles base64 decoding correctly across all browsers"
  - "URL.revokeObjectURL called immediately after download link click — prevents memory leaks on large ZIPs"
  - "Per-slide download buttons live in ThumbnailStrip (not ExportPanel) — keeps XPRT-03 fallback close to the visual element it operates on"

patterns-established:
  - "Pattern 1: canvasRegistry Map — module-level registry for cross-component canvas access without prop drilling or React context"
  - "Pattern 2: thumbnail-as-export-source — use always-rendered thumbnail canvases rather than forcing re-render of a single main canvas per slide"
  - "Pattern 3: multiplier:1 export guard — always toDataURL({ format: 'png', multiplier: 1 }) for 1080x1080 fidelity"

requirements-completed: [XPRT-01, XPRT-02, XPRT-03]

# Metrics
duration: ~10min
completed: 2026-03-18
---

# Phase 5 Plan 03: Export Pipeline Summary

**PNG/ZIP export pipeline with canvasRegistry pattern delivering Instagram-ready 1080x1080 PNGs and correctly-named ZIP bundles with progress indicator**

## Performance

- **Duration:** ~10 min (continuation agent after human-verify checkpoint)
- **Started:** 2026-03-18T01:26:26Z (Task 1 commit time)
- **Completed:** 2026-03-18T01:34:25Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 8

## Accomplishments

- PNG export functions call canvas.toDataURL with multiplier:1 — verified by unit tests and human export check (files measured at 1080x1080)
- ZIP bundle export iterates all thumbnail canvases in order, names files slide-01.png through slide-0N.png, reports progress via callback, and revokes the object URL after download
- canvasRegistry module-level Map allows ThumbnailStrip to register/unregister Fabric.js instances, and ExportPanel to collect them all without prop drilling
- ExportPanel shows progress bar advancing from 0% to 100% during ZIP generation with 2-second "Done!" reset
- ThumbnailStrip embeds per-slide fallback PNG download buttons (XPRT-03)
- All 9 visual/functional verification checks passed (human-approved): drop, render, navigation, safe zone, PNG export pixel check, ZIP naming, invalid file error, file reload

## Task Commits

Each task was committed atomically:

1. **Task 1: PNG export, ZIP export with progress, canvas registry** - `958deb3` (feat + TDD)
2. **Task 2: ExportPanel, ThumbnailStrip wiring, App.tsx** - `5a7dd3f` (feat)
3. **Task 3: Visual and functional verification checkpoint** - `ec7d9a1` (chore - human-approved)

**Plan metadata:** (final docs commit follows)

## Files Created/Modified

- `carousel-ui/src/canvas/canvasRegistry.ts` - Module-level Map<number, Canvas> for cross-component canvas access
- `carousel-ui/src/export/exportPng.ts` - Single-slide PNG export via canvas.toDataURL({ multiplier: 1 })
- `carousel-ui/src/export/exportZip.ts` - ZIP bundle export using JSZip with progress callback and titleToSlug helper
- `carousel-ui/src/export/__tests__/exportPng.test.ts` - Unit tests for multiplier:1 enforcement and anchor click
- `carousel-ui/src/export/__tests__/exportZip.test.ts` - Unit tests for progress callback values and titleToSlug
- `carousel-ui/src/components/ExportPanel.tsx` - Export All ZIP button with progress bar, error display, completion reset
- `carousel-ui/src/components/ThumbnailStrip.tsx` - Added registerCanvas/unregisterCanvas hooks and per-slide PNG download buttons
- `carousel-ui/src/App.tsx` - Added ExportPanel below SlideCanvas in main content area

## Decisions Made

- **Thumbnail canvases as export source:** Thumbnail Fabric.js instances are always rendered and fully in sync with slide data. Using them for export avoids the complexity of iterating through slides and forcing a re-render of a single main canvas per slide. Registered in canvasRegistry on mount, unregistered on unmount.
- **multiplier:1 is a hard constraint:** The canvas is initialized at 1080x1080 (CANVAS_SIZE constant). Passing any multiplier > 1 would produce a 2160x2160 or larger output. The TDD tests assert multiplier is exactly 1 to catch regressions.
- **fetch(dataUrl) for Blob conversion:** The data URL produced by canvas.toDataURL is base64-encoded. Using fetch() to convert it to a Blob is the most reliable cross-browser approach and handles the base64 decoding correctly inside the ZIP pipeline.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all tasks completed cleanly. Tests passed on first run. Human verification approved all 9 checks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The complete carousel-ui application is shippable: file loading, multi-role rendering, and export all work end-to-end
- Phase 6 (design iteration) can build on this foundation: inline text editing, font pairing refinement, color scheme support
- DESIGN-05 (Color Scheme emission from /science skill) remains pending but is not a launch blocker — defaultDesign fallback is in place
- Slide text verbosity concern (from v1.0) is the primary UX issue for Phase 6 to address via inline editing
- canvasRegistry pattern is established — Phase 6 can extend it if additional canvas operations are needed

---
*Phase: 05-renderer-and-export*
*Completed: 2026-03-18*
