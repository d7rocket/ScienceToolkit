---
phase: 05-renderer-and-export
plan: 01
subsystem: ui
tags: [react, vite, tailwind, zustand, vitest, fabric, typescript, markdown-parser]

# Dependency graph
requires: []
provides:
  - carousel-ui/ Vite+React app scaffold with Tailwind v4 and Vitest
  - ParsedCarousel, ParsedSlide, ColorScheme, defaultDesign, CarouselMeta type contracts
  - parseMarkdown() function: parses /science markdown output into typed ParsedCarousel
  - useCarouselStore: Zustand v5 flat store (slides, meta, colors, activeSlideIndex, safezoneVisible, fontsReady, exportProgress)
  - DropZone component: full-screen drag-drop file loader with error states
  - MetaBar component: topic title | date | slideCount | field top bar
  - App.tsx shell: font gate via document.fonts.ready, MetaBar + DropZone composition
  - Self-hosted Inter Variable font (131KB woff2) in public/fonts/
  - 35 unit tests passing across parser, store, and DropZone test files
affects:
  - 05-02 (SlideCanvas, ThumbnailStrip — depends on types and store from this plan)
  - 05-03 (ExportPanel — depends on store exportProgress/exportError)

# Tech tracking
tech-stack:
  added:
    - fabric@^6.9.1 (canvas rendering, Phase 5 Plans 02-03 will use)
    - zustand@^5.0.12 (flat store pattern)
    - jszip@^3.10.1 (ZIP export, Plan 03)
    - file-saver@^2.0.5 (download helper)
    - fontfaceobserver@^2.3.0 (font load detection fallback)
    - "@tailwindcss/vite"@^4.2.1 (Tailwind v4 Vite plugin, no tailwind.config.js)
    - vitest@^4.1.0 + jsdom@^29.0.0 + @testing-library/react@^16.3.2
    - "@fontsource-variable/inter"@^5.2.8 (source for Inter Variable woff2)
  patterns:
    - Tailwind v4 Vite plugin setup (no tailwind.config.js, no postcss.config.js)
    - Zustand v5 named import: import { create } from 'zustand' (not default import)
    - Fabric.js v6 named imports: import { Canvas, FabricText } from 'fabric' (not v5 namespace)
    - Zustand store reset in tests via useCarouselStore.setState()
    - Vi.mock with factory function for Zustand store mocking in React component tests

key-files:
  created:
    - carousel-ui/src/types/carousel.ts (shared type contracts for all Phase 5 plans)
    - carousel-ui/src/parser/parseMarkdown.ts (markdown parser)
    - carousel-ui/src/store/useCarouselStore.ts (Zustand store)
    - carousel-ui/src/components/DropZone.tsx
    - carousel-ui/src/components/MetaBar.tsx
    - carousel-ui/src/App.tsx (replaced scaffold placeholder)
    - carousel-ui/src/test-setup.ts (@testing-library/jest-dom setup)
    - carousel-ui/vite.config.ts (Tailwind v4 + Vitest config)
    - carousel-ui/public/fonts/Inter-Variable.woff2 (131KB, opsz+wght variable font)
    - carousel-ui/src/parser/__tests__/parseMarkdown.test.ts (18 tests)
    - carousel-ui/src/store/__tests__/useCarouselStore.test.ts (12 tests)
    - carousel-ui/src/components/__tests__/DropZone.test.tsx (5 tests)
  modified:
    - carousel-ui/package.json (added test script, dev deps, @fontsource-variable/inter)
    - carousel-ui/tsconfig.app.json (added vitest/globals to types)

key-decisions:
  - "Used @fontsource-variable/inter npm package (inter-latin-ext-opsz-normal.woff2) instead of rsms.me download — rsms.me returned HTML; opsz variant at 131KB satisfies the >100KB requirement and provides optical size axis"
  - "passWithNoTests: true added to vite.config.ts so empty test suite exits 0 (Vitest 4 exits 1 by default with no test files)"
  - "Fixed test fixture path: plan specified 5 levels up (..x5) but test file is only 4 levels from project root — corrected to 4 traversals"
  - "Used MockFileReader class in DropZone tests instead of vi.fn(() => obj) — vi.fn cannot be used as a constructor (TypeError)"
  - "Pinned fabric to ^6.9.0 (not v7) to avoid originX/originY default-to-center breaking change in v7"

patterns-established:
  - "Zustand store mock in tests: vi.mock factory returns useCarouselStore function with getState() attached for imperative store access"
  - "Test fixtures read from project root output/ and examples/ dirs via path.resolve(__dirname, '..'.repeat(N))"

requirements-completed:
  - LOAD-01
  - LOAD-02
  - LOAD-03

# Metrics
duration: 15min
completed: 2026-03-18
---

# Phase 5 Plan 01: Foundation — Scaffold, Types, Parser, Store, and UI Shell

**Vite+React carousel-ui app with typed markdown parser, Zustand store, drag-drop DropZone, and MetaBar — 35 tests passing, Inter Variable font self-hosted**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-17T20:56:14Z
- **Completed:** 2026-03-18T01:11:00Z
- **Tasks:** 3
- **Files modified:** 14 created, 3 modified

## Accomplishments

- Scaffold carousel-ui/ Vite react-ts app with Tailwind v4 (zero-config via @tailwindcss/vite) and Vitest+jsdom
- Define all shared type contracts (ParsedCarousel, ParsedSlide, ColorScheme, defaultDesign, CarouselMeta) in carousel.ts
- Implement regex-based parseMarkdown() that correctly handles both Color Scheme presence (sample) and absence (real fixtures) — returning null for absent Color Scheme
- Build useCarouselStore (Zustand v5) with loadFile, setActiveSlide, toggleSafezone, setFontsReady, setExportProgress, setExportError
- Build DropZone component (full-screen drop zone, idle/drag-over/error states, .md validation, file replacement without confirmation)
- Build MetaBar component showing title, date, slide count, field
- Wire App.tsx shell with font gate (document.fonts.ready -> setFontsReady) and conditional MetaBar
- Self-host Inter Variable font from @fontsource-variable/inter package (131KB opsz variant)
- 35 unit tests passing: 18 parser tests, 12 store tests, 5 DropZone tests

## Task Commits

1. **Task 1: Scaffold carousel-ui Vite app** - `a95542a` (feat)
2. **Task 2: Define types, implement markdown parser, build Zustand store** - `131a5f9` (feat)
3. **Task 3: Build DropZone and MetaBar components, wire App.tsx shell** - `66eb538` (feat)

## Files Created/Modified

- `carousel-ui/src/types/carousel.ts` - All shared type contracts (ParsedCarousel, ParsedSlide, ColorScheme, defaultDesign, CarouselMeta, SlideRole)
- `carousel-ui/src/parser/parseMarkdown.ts` - Regex parser for /science markdown output format
- `carousel-ui/src/store/useCarouselStore.ts` - Zustand v5 flat store
- `carousel-ui/src/components/DropZone.tsx` - Full-screen drag-drop loader with error states
- `carousel-ui/src/components/MetaBar.tsx` - Top bar with 4 metadata fields
- `carousel-ui/src/App.tsx` - App shell with font gate and component composition
- `carousel-ui/vite.config.ts` - Tailwind v4 + Vitest jsdom config
- `carousel-ui/src/index.css` - @import tailwindcss + @font-face Inter block
- `carousel-ui/public/fonts/Inter-Variable.woff2` - 131KB self-hosted Inter variable font
- `carousel-ui/src/test-setup.ts` - @testing-library/jest-dom import
- `carousel-ui/src/parser/__tests__/parseMarkdown.test.ts` - 18 tests
- `carousel-ui/src/store/__tests__/useCarouselStore.test.ts` - 12 tests
- `carousel-ui/src/components/__tests__/DropZone.test.tsx` - 5 tests

## Decisions Made

- Used @fontsource-variable/inter npm package instead of direct rsms.me download (rsms.me returned HTML at the documented URL). Chose inter-latin-ext-opsz-normal.woff2 at 131KB (satisfies >100KB requirement; opsz axis provides optical size variation).
- Added passWithNoTests: true to vite.config.ts — Vitest 4 exits code 1 with no test files by default; this was needed for Task 1 verification to pass with an empty suite.
- Fixed test fixture path traversal: plan specified `'..'.repeat(5)` but test files at carousel-ui/src/parser/__tests__/ are only 4 levels from project root.
- Used class-based MockFileReader in DropZone tests — vi.fn() cannot be used as a constructor (TypeError at runtime).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @testing-library/dom dependency**
- **Found during:** Task 3 (DropZone component test)
- **Issue:** @testing-library/react requires @testing-library/dom as a peer, but it was not installed; test suite failed with "Cannot find module '@testing-library/dom'"
- **Fix:** `npm install --save-dev @testing-library/dom --legacy-peer-deps`
- **Files modified:** carousel-ui/package.json, package-lock.json
- **Verification:** Test suite passes after install
- **Committed in:** 66eb538 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed test fixture path traversal (5 levels -> 4 levels)**
- **Found during:** Task 2 (parseMarkdown tests)
- **Issue:** Plan specified `resolve(__dirname, '..', '..', '..', '..', '..', 'output')` (5 traversals) but from carousel-ui/src/parser/__tests__/ only 4 traversals reach the project root
- **Fix:** Changed to `resolve(__dirname, '..', '..', '..', '..', 'output')`
- **Files modified:** parseMarkdown.test.ts, useCarouselStore.test.ts
- **Verification:** Tests find and read fixture files; all 30 tests pass
- **Committed in:** 131a5f9 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed DropZone test FileReader mock approach**
- **Found during:** Task 3 (DropZone test)
- **Issue:** Original mock used `vi.fn(() => mockFileReader)` as a constructor — Vitest spy functions cannot be called with `new`
- **Fix:** Replaced with a `class MockFileReader { ... }` approach in the test that does work as a constructor
- **Files modified:** DropZone.test.tsx
- **Verification:** Test passes without uncaught TypeError
- **Committed in:** 66eb538 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking dependency, 2 bugs)
**Impact on plan:** All fixes necessary for test suite to pass. No scope creep.

## Issues Encountered

- rsms.me/inter URL returned an HTML page instead of the woff2 binary — used @fontsource-variable/inter npm package as fallback source
- `npm install -D @tailwindcss/vite ...` failed without `--legacy-peer-deps` due to peer dep conflicts in the generated Vite template

## User Setup Required

None — no external service configuration required. Run `npm run dev` from carousel-ui/ to start the dev server.

## Next Phase Readiness

- All type contracts exported from carousel-ui/src/types/carousel.ts and ready for Plan 02 (SlideCanvas + ThumbnailStrip)
- useCarouselStore provides all state that Plans 02 and 03 will subscribe to
- Font gate (fontsReady state) in place for Plan 02 canvas rendering
- No blockers for Plan 02

---
*Phase: 05-renderer-and-export*
*Completed: 2026-03-18*
