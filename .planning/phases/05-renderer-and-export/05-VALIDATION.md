---
phase: 5
slug: renderer-and-export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | `carousel-ui/vite.config.ts` (vitest config inline) |
| **Quick run command** | `cd carousel-ui && npm run test -- --run` |
| **Full suite command** | `cd carousel-ui && npm run test -- --run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd carousel-ui && npm run test -- --run`
- **After every plan wave:** Run `cd carousel-ui && npm run test -- --run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | LOAD-01 | unit | `cd carousel-ui && npm run test -- --run src/parser` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | LOAD-02, LOAD-03 | unit | `cd carousel-ui && npm run test -- --run src/store` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | LOAD-01 | unit | `cd carousel-ui && npm run test -- --run src/components/DropZone` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | RNDR-01, RNDR-02 | unit | `cd carousel-ui && npm run test -- --run src/renderer` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | RNDR-03, RNDR-04 | unit | `cd carousel-ui && npm run test -- --run src/layouts` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | RNDR-05 | manual | Open app, click safe zone toggle | N/A | ⬜ pending |
| 05-02-04 | 02 | 2 | RNDR-06 | unit | `cd carousel-ui && npm run test -- --run src/components/ThumbnailStrip` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | XPRT-01, XPRT-02 | unit | `cd carousel-ui && npm run test -- --run src/export` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 3 | XPRT-03 | manual | Export all slides, verify ZIP contains 1080x1080 PNGs | N/A | ⬜ pending |
| 05-03-03 | 03 | 3 | LOAD-01 | manual | Drop invalid file, verify red error, drop valid file — loads cleanly | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `carousel-ui/src/parser/__tests__/parseMarkdown.test.ts` — stubs for LOAD-01, LOAD-03
- [ ] `carousel-ui/src/store/__tests__/useSlideStore.test.ts` — stubs for LOAD-02, LOAD-03
- [ ] `carousel-ui/src/components/__tests__/DropZone.test.tsx` — stubs for LOAD-01
- [ ] `carousel-ui/src/renderer/__tests__/fabricRenderer.test.ts` — stubs for RNDR-01, RNDR-02
- [ ] `carousel-ui/src/layouts/__tests__/slideLayouts.test.ts` — stubs for RNDR-03, RNDR-04
- [ ] `carousel-ui/src/components/__tests__/ThumbnailStrip.test.tsx` — stubs for RNDR-06
- [ ] `carousel-ui/src/export/__tests__/exportPipeline.test.ts` — stubs for XPRT-01, XPRT-02
- [ ] vitest + @testing-library/react — install if not present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Safe zone overlay toggle | RNDR-05 | Canvas visual overlay — cannot assert DOM presence via unit test | Open app, load markdown, click safe zone button, verify dashed overlay appears on canvas |
| Correct fonts in exported PNG | RNDR-01 | Pixel-level font rendering cannot be automated | Export a slide, open PNG, visually confirm Inter font renders (not system fallback Arial/sans-serif) |
| ZIP download with progress | XPRT-03 | File download + progress bar requires real browser interaction | Export all, observe progress bar advances, ZIP downloads successfully |
| Invalid file drag-drop error | LOAD-01 | File drag events require real browser | Drag a .txt file onto app, verify drop zone turns red with error message |
| New file replaces session | LOAD-01 | Stateful session replacement | Load file A, drag file B, verify slides update to file B without page reload |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
