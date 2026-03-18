---
phase: 6
slug: design-editor-and-quality
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `carousel-ui/vitest.config.ts` |
| **Quick run command** | `cd carousel-ui && npm test -- --run` |
| **Full suite command** | `cd carousel-ui && npm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd carousel-ui && npm test -- --run`
- **After every plan wave:** Run `cd carousel-ui && npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | QUAL-01 | unit | `cd carousel-ui && npm test -- --run useCarouselStore` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 0 | QUAL-01 | unit | `cd carousel-ui && npm test -- --run layouts` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | QUAL-01, QUAL-02 | unit | `cd carousel-ui && npm test -- --run layouts` | ✅ | ⬜ pending |
| 06-01-04 | 01 | 1 | QUAL-03 | unit | `cd carousel-ui && npm test -- --run layouts` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | EDIT-01 | unit | `cd carousel-ui && npm test -- --run FontPicker` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | EDIT-02 | unit | `cd carousel-ui && npm test -- --run PaletteEditor` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | EDIT-01, EDIT-02 | unit | `cd carousel-ui && npm test -- --run SlideCanvas` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 3 | EDIT-03 | unit | `cd carousel-ui && npm test -- --run SlideCanvas` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 3 | EDIT-04 | unit | `cd carousel-ui && npm test -- --run SlideCanvas` | ✅ | ⬜ pending |
| 06-03-03 | 03 | 3 | EDIT-05 | unit | `cd carousel-ui && npm test -- --run SlideCanvas` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `carousel-ui/src/store/__tests__/useCarouselStore.test.ts` — stubs for QUAL-01 font preset + EDIT-02 color override store fields
- [ ] `carousel-ui/src/components/__tests__/FontPicker.test.tsx` — stubs for EDIT-01 (font picker renders 3-4 presets, selection dispatches store action)
- [ ] `carousel-ui/src/components/__tests__/PaletteEditor.test.tsx` — stubs for EDIT-02 (color role override inputs render, change dispatches store action)
- [ ] Extend `carousel-ui/src/canvas/__tests__/SlideCanvas.test.tsx` — stubs for EDIT-03/04/05 (IText double-click enter, Escape/blur commit, export reflects edit)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Font preview update is immediate (no visible flash) | EDIT-01 | Visual/perceptual timing | Select each font preset in UI; observe canvas updates within 1 frame |
| Color role override shows real-time slide update | EDIT-02 | Real-time DOM animation | Change accent color; verify all slides update without page reload |
| "Professional quality" assessment | QUAL-04 | Subjective reviewer judgment | Export default slides; show to non-technical reviewer |
| Typography hierarchy is visually balanced | QUAL-02 | Aesthetic judgment | Review exported slides for whitespace/content ratio |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
