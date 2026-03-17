---
phase: 05-renderer-and-export
plan: 02
subsystem: ui
tags: [react, fabric, typescript, vitest, canvas, rendering, tailwind, zustand]

# Dependency graph
requires:
  - phase: 05-01
    provides: "ParsedSlide, ColorScheme, SlideRole types, useCarouselStore (fontsReady, safezoneVisible, slides, colors, activeSlideIndex), Inter Variable font, DropZone, MetaBar, App.tsx shell"
provides:
  - canvas/constants.ts: CANVAS_SIZE=1080, SAFE_TOP=120, SAFE_BOTTOM=150, SAFE_SIDES=80 and derived bounds
  - canvas/layouts.ts: renderHookSlide, renderBodySlide, renderCtaSlide, renderSafezoneOverlay layout functions
  - canvas/renderSlide.ts: role-based dispatcher routing to correct layout function
  - components/SlideCanvas.tsx: main 1080x1080 Fabric.js canvas with font gate, CSS scale(0.5) preview, safe zone toggle
  - components/ThumbnailStrip.tsx: left sidebar of live mini Fabric.js canvases, active highlight, click-to-navigate
  - App.tsx updated: two-column layout wiring SlideCanvas + ThumbnailStrip
affects:
  - 05-03 (ExportPanel — depends on fabricRef canvas instances for PNG export via canvas.toDataURL)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fabric.js v6 Canvas lifecycle in React: useRef for canvas element + useRef for Canvas instance + useEffect initialize/dispose pattern"
    - "CSS scale() preview shrinking: 1080x1080 canvas with transform scale(N/1080) and overflow:hidden wrapper at target size"
    - "Safe zone overlay tracked by name property on Rect object, found via canvas.getObjects() scan on re-render"
    - "Thumbnail Fabric.js instances managed in child Thumbnail component to isolate useRef/useEffect per slide"
    - "pixelRatio: 1 mandatory in Canvas constructor to prevent 2160px canvas on retina displays"

key-files:
  created:
    - carousel-ui/src/canvas/constants.ts (CANVAS_SIZE, SAFE_TOP, SAFE_BOTTOM, SAFE_SIDES, derived CONTENT_* bounds)
    - carousel-ui/src/canvas/layouts.ts (renderHookSlide, renderBodySlide, renderCtaSlide, renderSafezoneOverlay)
    - carousel-ui/src/canvas/renderSlide.ts (role-based dispatcher)
    - carousel-ui/src/components/SlideCanvas.tsx (main preview canvas, font gate, safe zone toggle)
    - carousel-ui/src/components/ThumbnailStrip.tsx (sidebar live thumbnails, active highlight)
    - carousel-ui/src/canvas/__tests__/constants.test.ts (6 constant value tests)
    - carousel-ui/src/canvas/__tests__/layouts.test.ts (7 layout/dispatch tests)
    - carousel-ui/src/components/__tests__/ThumbnailStrip.test.tsx (4 component tests)
  modified:
    - carousel-ui/src/App.tsx (added ThumbnailStrip + SlideCanvas import, two-column layout)

key-decisions:
  - "canvas.add() called with multiple args in one call (e.g. canvas.add(bg, title, body)) rather than one object per call — TDD test updated to count total objects across all add() calls instead of number of call invocations"
  - "Thumbnail Fabric.js instances isolated in child Thumbnail component — prevents shared ref conflicts and enables proper dispose-per-slide cleanup"
  - "renderSafezoneOverlay tracks existing overlay by checking .name property on canvas objects via getObjects() scan — avoids maintaining a module-level variable that could leak across canvas instances"

patterns-established:
  - "Fabric.js mock in tests: class-based constructor mock that spreads constructor args onto instance and provides set() method — vi.fn() cannot be used as constructor (TypeError)"
  - "TDD test assertion for canvas.add() with multiple args: count total args across all calls (reduce sum) rather than call count"

requirements-completed:
  - RNDR-01
  - RNDR-02
  - RNDR-03
  - RNDR-04
  - RNDR-05
  - RNDR-06

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 5 Plan 02: Canvas Rendering System — Constants, Layouts, SlideCanvas, and ThumbnailStrip

**Fabric.js canvas rendering system with three role-aware slide layouts (hook/body/CTA), live thumbnail strip sidebar, safe zone overlay toggle, and font gate — 52 tests all passing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T21:16:55Z
- **Completed:** 2026-03-17T21:20:05Z
- **Tasks:** 2
- **Files modified:** 8 created, 1 modified

## Accomplishments

- Canvas constants module (CANVAS_SIZE=1080, SAFE_*=120/150/80) with derived content area bounds
- Three Fabric.js layout functions covering all slide roles: hook (64px centered title + body), body (40px title + 24px Textbox + badge), CTA (accent line + takeaway + follow CTA)
- renderSafezoneOverlay function: creates dashed overlay rect tracked by name property, toggled without re-creating
- renderSlide dispatcher: routes to correct layout function by slide.role
- SlideCanvas component: 1080x1080 Fabric.js canvas with pixelRatio=1, font gate (fontsReady), CSS scale(0.5) preview in 540px wrapper, safe zone toggle button
- ThumbnailStrip component: live mini Fabric.js canvases per slide (160px CSS scale), active highlight ring, click-to-navigate
- App.tsx updated to two-column layout: aside (ThumbnailStrip) + main (SlideCanvas)
- 17 new tests (6 constants + 7 layout/dispatch + 4 ThumbnailStrip), 52 total passing (all Plan 01 tests remain green)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create canvas constants, layout functions, and renderSlide dispatcher** - `d80cc63` (feat)
2. **Task 2: Build SlideCanvas and ThumbnailStrip components, update App.tsx layout** - `c6616c1` (feat)

**Plan metadata:** TBD (docs commit)

_Note: Task 1 used TDD pattern: RED (failing constants.test.ts + layouts.test.ts) then GREEN (implementation)_

## Files Created/Modified

- `carousel-ui/src/canvas/constants.ts` - CANVAS_SIZE, SAFE_*, CONTENT_* design constants
- `carousel-ui/src/canvas/layouts.ts` - Three role-aware layout functions + safe zone overlay
- `carousel-ui/src/canvas/renderSlide.ts` - Role-based dispatcher (hook/body/cta)
- `carousel-ui/src/components/SlideCanvas.tsx` - Main Fabric.js preview canvas with font gate
- `carousel-ui/src/components/ThumbnailStrip.tsx` - Sidebar live thumbnail canvases
- `carousel-ui/src/canvas/__tests__/constants.test.ts` - 6 constant value tests
- `carousel-ui/src/canvas/__tests__/layouts.test.ts` - 7 layout/dispatch behavior tests
- `carousel-ui/src/components/__tests__/ThumbnailStrip.test.tsx` - 4 component behavior tests
- `carousel-ui/src/App.tsx` - Updated to two-column layout with real components

## Decisions Made

- Called `canvas.add()` with multiple args in one call (batch pattern) rather than one call per object — matches Fabric.js v6 API and is slightly more efficient. TDD test was adapted to count total objects across all add() calls via `reduce`.
- Thumbnail Fabric.js instances isolated in a child `Thumbnail` component — each slide has its own `useRef<Canvas>` and `useEffect` for initialize/dispose, preventing ref conflicts.
- Safe zone overlay tracked by `.name` property on the Rect object found via `canvas.getObjects()` scan — avoids module-level mutable state that would leak between canvas instances.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Fabric.js mock in layouts.test.ts — vi.fn() cannot be used as constructor**
- **Found during:** Task 1 (layouts.test.ts RED phase)
- **Issue:** Initial test mock used `vi.fn().mockImplementation((options) => ({ ...options }))` for Rect/FabricText — Vitest spy functions cannot be called with `new`, throwing `TypeError: (options) => ({ ...options }) is not a constructor`
- **Fix:** Replaced with class-based mocks using `class { constructor(arg) { Object.assign(this, arg); } set(k,v) { this[k]=v; } }` pattern
- **Files modified:** `carousel-ui/src/canvas/__tests__/layouts.test.ts`
- **Verification:** All 7 layout tests pass after fix
- **Committed in:** d80cc63 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed test assertion for canvas.add() with multiple args**
- **Found during:** Task 1 (renderBodySlide test)
- **Issue:** Test checked `toHaveBeenCalledTimes >= 4` but `canvas.add(bg, badge, badgeText, title, body)` is called ONCE with 5 args — Vitest counts invocations not argument count
- **Fix:** Changed assertion to count total objects across all add() calls: `addMock.mock.calls.reduce((sum, call) => sum + call.length, 0) >= 4`
- **Files modified:** `carousel-ui/src/canvas/__tests__/layouts.test.ts`
- **Verification:** Test passes, 52 total tests green
- **Committed in:** d80cc63 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs in test mock/assertion logic)
**Impact on plan:** Both auto-fixes necessary for the TDD test suite to work correctly. No scope creep. Implementation code matched the plan exactly.

## Issues Encountered

- Fabric.js class-based mock pattern required for all constructor-called classes (Canvas, FabricText, Textbox, Rect) in tests — `vi.fn()` cannot be used as a constructor in Vitest/jsdom environment

## User Setup Required

None — no external service configuration required. Run `npm run dev` from `carousel-ui/` to start the dev server.

## Next Phase Readiness

- All six RNDR requirements delivered: rendering pipeline (RNDR-01/02), layouts (RNDR-03), constants (RNDR-04), safe zone toggle (RNDR-05), thumbnail strip (RNDR-06)
- Plan 03 (ExportPanel) can access canvas DOM elements via canvas.toDataURL() for PNG export
- No blockers for Plan 03

---
*Phase: 05-renderer-and-export*
*Completed: 2026-03-18*
