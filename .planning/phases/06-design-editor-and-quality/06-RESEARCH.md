# Phase 6: Design Editor and Quality — Research

**Researched:** 2026-03-18
**Domain:** Fabric.js v6 IText editing, @fontsource self-hosted fonts, Zustand store extension, Tailwind v4 UI panel
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Default Template Quality (QUAL-01)**
- Visual language: editorial with geometry — not bold graphic, not purely typographic
- Geometric elements: accent bar below the title on body slides + small corner mark (using the `accent` color from ColorScheme)
- Typography sizes locked at: hook title 64px, body title 40px, body text 24px (all within QUAL-02 ranges — already correct in codebase)
- Hook slide differentiation from body slides: Claude's discretion — make it visually distinct enough to signal "opener"
- 60/40 whitespace-to-content ratio (QUAL-03): maintained by layout constants, not user-adjustable
- No decorative imagery or gradients — restraint is the premium signal

**Font Pairing Presets (EDIT-01)**
- True heading+body font pairs — two different fonts per preset, not weight variations of one font
- On preset switch: both heading font AND body font change (full pairing swap)
- 4 named presets, all from @fontsource (self-hosted, no CDN):
  - Orbital (default): Space Grotesk heading + Inter body
  - Editorial: Fraunces heading + Inter body
  - Newsletter: DM Serif Display heading + DM Sans body
  - Contemporary: Syne heading + Inter body
- Inter is already loaded via @fontsource-variable/inter — Inter-body presets reuse it
- All fonts self-hosted via @fontsource packages (canvas taint rule from Phase 5: no runtime CDN)
- QUAL-04: fonts loaded before any canvas render — existing `document.fonts.ready` gate in App.tsx handles this; new fonts must be added to the same gate

**Color Editor (EDIT-02 + EDIT-03)**
- Right panel layout: named color scheme preset dropdown at top, then 4 labeled swatches below
- Selecting a preset fills all 4 swatches — user can then override individual roles
- Individual swatch click opens `<input type="color">` (browser native — no third-party library)
- Live preview: color changes update Zustand store's `colors` field immediately
- Named presets: Cosmos (default), Deep Ocean, Forest Lab, Solar Flare (hex values in UI-SPEC)

**Inline Text Editing (EDIT-04)**
- Interaction: double-click on text object on the main SlideCanvas enters edit mode
- Text objects switch to IText (title, single-line) and Textbox (body, multi-line) with `selectable: true, evented: true`
- Thumbnail canvases remain non-interactive (`selectable: false, evented: false`)
- Commit: blur or Escape → write updated text back to Zustand store's `slides` array
- No "reset to original" in this phase

**Text Alignment (EDIT-05)**
- Alignment toggle only: left / center / right, per text block
- No free-form repositioning
- Alignment stored as per-slide override map: `Record<number, 'left' | 'center' | 'right'>` with default `'left'`

**Editor Panel Layout**
- Three-column: left sidebar (thumbnails, 160px) | main canvas area (flex-1) | right sidebar (~260px)
- Right sidebar always visible, no collapse
- Top-to-bottom sections: Font preset picker → Color presets + swatches → Alignment controls

### Claude's Discretion
- Exact hook slide visual treatment (must feel like a distinct opener vs body slides)
- Specific font preset names and heading/body combinations (resolved in UI-SPEC: Orbital/Editorial/Newsletter/Contemporary)
- Named color scheme preset hex values (resolved in UI-SPEC)
- Color picker implementation (resolved: native `<input type="color">`)
- Alignment state shape in the store (resolved: `Record<number, 'left' | 'center' | 'right'>`)
- Right sidebar section styling details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | User can select from 3-4 curated font pairings as named presets | FontPairing type, @fontsource packages, layouts.ts parameterization pattern, Zustand store extension |
| EDIT-02 | User can override any of the 4 color roles | Native `<input type="color">` pattern, existing Zustand `colors` field already wired to canvas re-render |
| EDIT-03 | User can select from named color scheme presets beyond the auto-loaded palette | Color preset constant array, same store update path as EDIT-02 |
| EDIT-04 | User can edit slide text inline on the canvas | Fabric.js v6 IText/Textbox with `selectable: true`, `editing:exited` event for commit, Zustand slides update |
| EDIT-05 | User can adjust spacing and text alignment per slide | `alignmentOverrides: Record<number, 'left' | 'center' | 'right'>` in store, layouts.ts textAlign parameter |
| QUAL-01 | Default template produces premium science-newsletter-level output without user edits | Geometric elements (accent bar, corner mark, hook band + watermark) added to layout functions |
| QUAL-02 | Typography follows science editorial hierarchy — headline 52-64px hook, 36-44px body titles, 22-26px body text | Already correct in codebase; layouts.ts sizes confirmed as compliant |
| QUAL-03 | 60/40 whitespace-to-content ratio maintained across all slide layouts | Maintained by fixed CONTENT_X/Y/WIDTH/HEIGHT constants — no new work, confirm existing layout functions respect CONTENT_BOTTOM |
| QUAL-04 | Fonts self-hosted and loaded before any canvas render (no FOIT) | Existing `document.fonts.ready` gate in App.tsx — extend with new @fontsource font families |
</phase_requirements>

---

## Summary

Phase 6 adds a right-sidebar design editor panel and elevates the default template quality. The codebase from Phase 5 is already well-structured for these additions: Zustand state flows cleanly through store subscriptions, thumbnail re-renders happen automatically via `useEffect([slide, colors])`, and the `document.fonts.ready` gate already prevents FOIT. Phase 6 is primarily additive — new store fields, new layout parameters, a new component, and new @fontsource packages.

The two technically sensitive areas are: (1) Fabric.js IText integration for inline editing — the existing canvas uses `selectable: false, evented: false` everywhere, so the main SlideCanvas must be rebuilt to use `IText`/`Textbox` objects and handle the `editing:exited` event to commit text back to the store, while thumbnails remain completely unchanged; and (2) font loading — five new @fontsource packages must be installed and their font families added to the `document.fonts.ready` gate before any canvas render occurs.

The roadmap proposes three plans: 06-01 (default template quality + typography system), 06-02 (font picker + color editor + live preview wiring), 06-03 (inline text editing + alignment). This breakdown maps cleanly to the research — QUAL work is independent of EDIT work, and EDIT-04 (inline editing) is the most complex integration requiring its own plan.

**Primary recommendation:** Follow the three-plan breakdown. Implement QUAL improvements first (isolated layout changes) before EDIT features (store extension + component work), so the default template quality is established as the baseline before interactive editing is layered on top.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fabric | ^6.9.1 (installed: 6.9.1) | Canvas rendering + interactive IText editing | Already in use; pinned to avoid v7 breaking changes |
| zustand | ^5.0.12 (installed) | State management — extend with font/alignment state | Already drives all canvas re-renders |
| react | ^19.2.4 (installed) | Right sidebar component | Already in use |
| tailwindcss | ^4.2.1 (installed) | Right sidebar panel styling | Already in use for all UI chrome |

### Supporting (@fontsource packages — new additions)

| Library | Version | Purpose |
|---------|---------|---------|
| @fontsource/space-grotesk | 5.2.10 (verified) | Orbital preset heading font |
| @fontsource/fraunces | 5.2.9 (verified) | Editorial preset heading font |
| @fontsource/dm-serif-display | 5.2.8 (verified) | Newsletter preset heading font |
| @fontsource/dm-sans | 5.2.8 (verified) | Newsletter preset body font |
| @fontsource/syne | 5.2.7 (verified) | Contemporary preset heading font |

Versions verified against npm registry on 2026-03-18.

Inter is already installed via `@fontsource-variable/inter` (^5.2.8, devDependency) — no additional Inter package needed for the three Inter-body presets.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<input type="color">` | react-colorful, colord | Decision locked: native input is sufficient, zero bundle cost, no dependency |
| @fontsource static packages | Google Fonts CDN | CDN violates canvas taint rule from Phase 5 — @fontsource is mandatory |
| Zustand store extension | Separate React context | Unnecessary — store already drives all subscriptions |

**Installation:**
```bash
cd carousel-ui && npm install --save-dev @fontsource/space-grotesk @fontsource/fraunces @fontsource/dm-serif-display @fontsource/dm-sans @fontsource/syne
```

Note: @fontsource packages are devDependencies (bundled at build time, not runtime) — consistent with the existing `@fontsource-variable/inter` pattern in package.json.

---

## Architecture Patterns

### Recommended Project Structure

New files for Phase 6:

```
carousel-ui/src/
├── types/
│   └── carousel.ts          # ADD: FontPairing interface, FONT_PRESETS constant, COLOR_PRESETS constant
├── store/
│   └── useCarouselStore.ts  # EXTEND: selectedFontPreset, alignmentOverrides, setters
├── canvas/
│   └── layouts.ts           # EXTEND: accept FontPairing + alignment params; add geometric elements
├── components/
│   ├── DesignEditor.tsx     # NEW: right sidebar panel (font picker, color editor, alignment)
│   ├── FontPresetPicker.tsx # NEW: 4-button preset list (or inline in DesignEditor)
│   ├── ColorEditor.tsx      # NEW: preset dropdown + 4 swatches (or inline in DesignEditor)
│   └── AlignmentToggle.tsx  # NEW: 3-button toggle (or inline in DesignEditor)
└── App.tsx                  # EXTEND: add right sidebar column; add new @fontsource imports + fonts.ready gate
```

Component decomposition is flexible: all three sub-panels can live inline in a single `DesignEditor.tsx` (simpler, fewer files) or be split into named subcomponents. Either is correct — the planner can choose.

### Pattern 1: FontPairing Type and Presets

**What:** A typed constant that the store holds as `selectedFontPreset`, and that `layouts.ts` accepts as a parameter.

**When to use:** Used everywhere a canvas layout function is called — replaces the hardcoded `fontFamily: 'Inter'` in all three render functions.

```typescript
// carousel.ts additions
export interface FontPairing {
  name: string;          // 'Orbital', 'Editorial', etc.
  headingFont: string;   // CSS font-family name, matches @fontsource load
  bodyFont: string;
}

export const FONT_PRESETS: FontPairing[] = [
  { name: 'Orbital',      headingFont: 'Space Grotesk', bodyFont: 'Inter' },
  { name: 'Editorial',    headingFont: 'Fraunces',      bodyFont: 'Inter' },
  { name: 'Newsletter',   headingFont: 'DM Serif Display', bodyFont: 'DM Sans' },
  { name: 'Contemporary', headingFont: 'Syne',          bodyFont: 'Inter' },
];
```

### Pattern 2: Zustand Store Extension

**What:** Add `selectedFontPreset`, `alignmentOverrides`, and corresponding setters to the existing store.

**When to use:** New state fields use exact same pattern as existing `colors` field.

```typescript
// useCarouselStore.ts additions
selectedFontPreset: FontPairing;       // defaults to FONT_PRESETS[0]
alignmentOverrides: Record<number, 'left' | 'center' | 'right'>;  // keyed by slideIndex
setFontPreset: (preset: FontPairing) => void;
setColor: (role: keyof ColorScheme, value: string) => void;
setColors: (scheme: ColorScheme) => void;
setAlignment: (slideIndex: number, alignment: 'left' | 'center' | 'right') => void;
```

Components subscribe with selectors: `useCarouselStore(s => s.selectedFontPreset)` — identical to existing `colors` subscription pattern.

### Pattern 3: layouts.ts Parameterization

**What:** All three render functions accept a `FontPairing` parameter and an optional `alignment` override. Internal `fontFamily: 'Inter'` replaced with `font.headingFont` / `font.bodyFont`.

**When to use:** Called from SlideCanvas and Thumbnail — both already pass `colors`; add `font` and `alignment` alongside.

```typescript
// layouts.ts signature change
export function renderBodySlide(
  canvas: Canvas,
  slide: ParsedSlide,
  colors: ColorScheme,
  font: FontPairing,
  alignment: 'left' | 'center' | 'right' = 'left'
): void { ... }
```

The `renderSlide.ts` dispatcher updates to pass the new parameters. Both SlideCanvas and Thumbnail read `selectedFontPreset` and `alignmentOverrides[index]` from the store and pass them through.

### Pattern 4: Fabric.js IText Double-Click Editing (EDIT-04)

**What:** IText in Fabric.js v6 auto-enters editing mode on double-click via `doubleClickHandler` (confirmed in source: `ITextClickBehavior.ts:30` and `:159`). No manual `enterEditing()` call needed on SlideCanvas.

**Key verified facts (HIGH confidence — read from installed source):**
- `IText` fires `'editing:entered'` and `'editing:exited'` events (ITextBehavior.ts:33-34)
- Canvas fires `'text:editing:entered'` and `'text:editing:exited'` (ITextBehavior.ts:399, 727)
- IText constructor accepts all FabricText options — `selectable: true, evented: true` enables interaction
- `isEditing` property is `false` by default (IText.ts:52)

**Implementation pattern for SlideCanvas:**

```typescript
// When building IText for the interactive canvas (NOT thumbnails):
const title = new IText(slide.title, {
  fontFamily: font.headingFont,
  fontWeight: '700',
  fontSize: 64,
  fill: colors.primaryText,
  left: CONTENT_X,
  top: CONTENT_Y,
  width: CONTENT_WIDTH,
  textAlign: alignment,
  selectable: true,   // <-- IText only on main canvas
  evented: true,      // <-- IText only on main canvas
  editable: true,
});

// Listen on the object for exit to commit to store
title.on('editing:exited', () => {
  store.updateSlideTitle(activeSlideIndex, title.text ?? '');
});
```

Thumbnail canvases continue using `FabricText` / `Textbox` with `selectable: false, evented: false` — no change to export source.

**Escape key:** Fabric.js v6 IText handles Escape natively — pressing Escape during edit calls `exitEditing()` which fires `editing:exited`. No manual key listener needed.

### Pattern 5: Font Loading Gate Extension

**What:** New @fontsource packages import their CSS, which registers the font faces. The existing `document.fonts.ready` gate in App.tsx blocks canvas render until all fonts are loaded. New imports must be added before the gate triggers.

```typescript
// App.tsx — add alongside existing Inter import
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/syne/400.css';
import '@fontsource/syne/700.css';
```

The existing `document.fonts.ready.then(() => setFontsReady(true))` gate in App.tsx already handles all registered fonts — no code changes to the gate logic itself.

### Pattern 6: Native Color Picker Hidden Trigger

**What:** Browser native `<input type="color">` is visually positioned off-screen, triggered by programmatic `.click()` when user clicks the color swatch square.

```tsx
// ColorEditor.tsx pattern (per UI-SPEC)
const inputRef = useRef<HTMLInputElement>(null);

<div
  style={{ width: 32, height: 32, backgroundColor: colors.background, cursor: 'pointer' }}
  onClick={() => inputRef.current?.click()}
/>
<input
  ref={inputRef}
  type="color"
  value={colors.background}
  onChange={e => store.setColor('background', e.target.value)}
  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
/>
```

The `onChange` handler (not `onInput`) fires on every color change during picker interaction — sufficient for live preview via Zustand.

### Anti-Patterns to Avoid

- **Two canvas instances for the same slide sharing an element:** SlideCanvas and Thumbnail are separate React components with separate canvas elements. Never render both into the same `<canvas>` — they would fight. This is already correctly isolated in Phase 5.
- **Calling `renderSlide` on thumbnail canvases from the alignment toggle:** The alignment override updates the store; Thumbnail's `useEffect([slide, colors, font, alignment])` re-renders automatically. Do not imperatively call render from the UI component.
- **Loading @fontsource fonts after `document.fonts.ready` fires:** All CSS imports must be at module scope in App.tsx (or a root import), not inside effects or on-demand. Dynamic font loading after the gate would cause FOIT.
- **Setting `selectable: true` on Thumbnail canvas objects:** Thumbnails are the export source. Any interactivity on them contaminates the export pipeline.
- **Reconstructing Fabric canvas objects on every store update:** The SlideCanvas `useEffect([slide, colors, font, alignment])` calls `renderSlide` (which calls `canvas.clear()` then `canvas.add()`). This is the correct pattern — full re-render, not partial object mutation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted fonts | Manual font file download + CSS @font-face | @fontsource npm packages | @fontsource handles all weight variants, subsetting, and CSS registration; consistent with Phase 5 Inter pattern |
| Color picker widget | Custom color wheel or hex input | Native `<input type="color">` | Zero bundle cost, browser-native, sufficient for this use case; decision locked |
| Text editing on canvas | Manual cursor tracking, selection boxes, key handlers | Fabric.js v6 IText/Textbox | IText handles cursor, selection, keyboard shortcuts, copy/paste, Escape/blur; all built-in |
| Real-time store subscription | Manual event listeners or prop drilling | Zustand selector subscriptions | Pattern already proven throughout Phase 5; `useCarouselStore(s => s.selectedFontPreset)` is the standard |
| Canvas re-render orchestration | Custom dirty flags or debounce logic | React `useEffect` with store deps | Phase 5 established this pattern; Thumbnail's `useEffect([slide, colors])` already works correctly |

---

## Common Pitfalls

### Pitfall 1: fontFamily Case Sensitivity in Fabric.js

**What goes wrong:** If the `fontFamily` string passed to a Fabric text object doesn't exactly match the CSS font-family name registered by @fontsource, the canvas falls back to a system font — the exported PNG looks wrong.

**Why it happens:** @fontsource registers fonts with specific CSS family names. The string must match exactly (including spaces and capitalization).

**How to avoid:** Use the exact CSS family names:
- `'Space Grotesk'` (not `'space-grotesk'` or `'SpaceGrotesk'`)
- `'Fraunces'`
- `'DM Serif Display'`
- `'DM Sans'`
- `'Syne'`
- `'Inter'`

**Warning signs:** Rendered text looks like Times New Roman or Arial on the canvas. Check with `document.fonts.check('700 24px Space Grotesk')` in the browser console.

### Pitfall 2: Thumbnail IText Objects Becoming Interactive

**What goes wrong:** If `IText` is used (instead of `FabricText`) in thumbnail render functions, or if `selectable: true` is accidentally set on thumbnails, users can trigger edit mode on the export-source canvases. Edits would not flow through the store and would corrupt exports.

**Why it happens:** Thumbnail and SlideCanvas use the same `renderSlide` → `layouts.ts` path. A single `selectable: true` in a layout function affects both.

**How to avoid:** Add an `interactive: boolean` parameter to layout functions (or use separate render functions). Thumbnails always pass `interactive: false`. Only SlideCanvas passes `interactive: true`. When `interactive: false`, use `FabricText`/`Textbox` with `selectable: false, evented: false`. When `interactive: true`, use `IText` with `selectable: true, evented: true`.

**Warning signs:** Clicking in the ThumbnailStrip triggers a text cursor on a slide thumbnail.

### Pitfall 3: Font Not Loaded When Canvas First Renders After Preset Switch

**What goes wrong:** User switches from Orbital (Space Grotesk) to Editorial (Fraunces). If Fraunces hasn't loaded yet (e.g., only Orbital was used initially), the canvas renders with a fallback font.

**Why it happens:** `document.fonts.ready` fires once at startup. It does not re-fire for fonts that load lazily after the page loads.

**How to avoid:** All @fontsource CSS imports are at module scope — they register font-face rules at page load time, before `document.fonts.ready` fires. Since all four font families are imported upfront (not on-demand), all fonts are available before the user can interact with the preset picker. No lazy loading, no dynamic imports for fonts.

**Warning signs:** Only occurs if font imports are put inside a dynamic `import()` or a React effect — don't do this.

### Pitfall 4: Alignment Override Not Applied to Thumbnail After Store Update

**What goes wrong:** User changes alignment for slide 3. The main canvas updates. The thumbnail for slide 3 does not update.

**Why it happens:** Thumbnail's `useEffect` only lists `[slide, colors]` as dependencies (current Phase 5 implementation). If `alignmentOverrides` is added to the store but not to the Thumbnail's useEffect dependency array, thumbnails become stale.

**How to avoid:** When extending Thumbnail to accept `alignment` as a prop, add it to the `useEffect` dependency array. The `ThumbnailStrip` parent already subscribes to the store and passes `colors` down — it must also pass `alignment` from `alignmentOverrides[slide.index - 1]`.

**Warning signs:** Exported PNG alignment doesn't match what was set in the editor.

### Pitfall 5: IText `editing:exited` Fires Before Store Update Completes

**What goes wrong:** User edits title text, presses Escape. `editing:exited` fires. The handler reads `title.text` and calls `store.updateSlideTitle()`. Immediately after, the slide re-renders (triggered by the store update), calling `canvas.clear()` and re-creating the IText object. If the timing is wrong, the in-flight render could clear the canvas while the user is still in mid-edit.

**Why it happens:** Fabric's `editing:exited` fires synchronously. Zustand's store update is synchronous. React's `useEffect` re-render is asynchronous (next frame). This means the sequence is: exit editing → write to store → React schedules re-render → next frame: canvas.clear() → new objects added. This is actually safe — by the time React re-renders, editing has already exited.

**How to avoid:** No special handling needed if the implementation follows the existing `useEffect([slide])` pattern. The risk only emerges if someone calls `renderSlide` directly from the `editing:exited` handler (don't).

### Pitfall 6: Three-Column Layout Breaking at Narrow Viewport

**What goes wrong:** The three-column layout (160px + flex-1 + 260px) with no right-sidebar collapse makes the main canvas area extremely narrow on small monitors.

**Why it happens:** The canvas is displayed at scale(0.5) = 540x540px. With sidebars totalling 420px plus padding, viewports under ~1000px would compress the canvas below 540px.

**How to avoid:** This is accepted scope for Phase 6 (right sidebar always visible, no collapse). The tool is a local web app, not a mobile app. No mitigation needed. Document it as a known limitation if needed.

---

## Code Examples

Verified patterns from the installed codebase (not from training data):

### Existing render function signature (to be extended)

```typescript
// Current signature (layouts.ts line 14)
export function renderHookSlide(canvas: Canvas, slide: ParsedSlide, colors: ColorScheme): void

// Phase 6 target signature
export function renderHookSlide(
  canvas: Canvas,
  slide: ParsedSlide,
  colors: ColorScheme,
  font: FontPairing,
  alignment: 'left' | 'center' | 'right',
  interactive: boolean
): void
```

### Existing Thumbnail useEffect (to be extended)

```typescript
// Current (ThumbnailStrip.tsx lines 47-51)
useEffect(() => {
  const fc = fabricRef.current;
  if (!fc) return;
  renderSlide(fc, slide, colors);
}, [slide, colors]);

// Phase 6 target
useEffect(() => {
  const fc = fabricRef.current;
  if (!fc) return;
  renderSlide(fc, slide, colors, font, alignment, false); // interactive: false
}, [slide, colors, font, alignment]);
```

### Existing App.tsx font gate (to be extended)

```typescript
// Current (App.tsx lines 12-14)
useEffect(() => {
  document.fonts.ready.then(() => setFontsReady(true));
}, [setFontsReady]);

// No logic change needed — just add CSS imports at file top
```

### Geometric element example for body slide (QUAL-01)

```typescript
// Accent bar: 4px tall, 120px wide, below title, left-aligned to CONTENT_X
const accentBar = new Rect({
  left: CONTENT_X,
  top: CONTENT_Y + 30 + titleHeight + 16, // 16px below title bottom
  width: 120,
  height: 4,
  fill: colors.accent,
  selectable: false,
  evented: false,
});

// Corner mark: L-shape from two Rect objects at top-right of content area
const cornerH = new Rect({
  left: CONTENT_X + CONTENT_WIDTH - 24,
  top: CONTENT_Y,
  width: 24,
  height: 3,
  fill: colors.accent,
  selectable: false,
  evented: false,
});
const cornerV = new Rect({
  left: CONTENT_X + CONTENT_WIDTH - 3,
  top: CONTENT_Y,
  width: 3,
  height: 24,
  fill: colors.accent,
  selectable: false,
  evented: false,
});
```

Note: Title height is dynamic (wraps based on text length). Use a fixed offset based on the locked font sizes rather than measuring rendered height — the planner must decide whether to use a fixed y-offset or probe `title.getBoundingRect()` after `canvas.add()`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Fonts CDN | @fontsource self-hosted | Phase 5 decision | No canvas taint, no network dependency |
| `fontFamily: 'Inter'` hardcoded | FontPairing parameter | Phase 6 | User-selectable font pairs |
| Single ColorScheme (auto-loaded from markdown) | ColorScheme + named presets | Phase 6 | Users can switch whole palettes |
| FabricText (display-only) | IText/Textbox (editable on main canvas) | Phase 6 | Inline text editing |
| `colors` only in Thumbnail useEffect deps | `colors + font + alignment` | Phase 6 | Thumbnails stay in sync with all design state |

**Deprecated/outdated:**
- Hardcoded `fontFamily: 'Inter'` in `renderHookSlide`, `renderBodySlide`, `renderCtaSlide` — replaced by FontPairing parameter in Phase 6.

---

## Open Questions

1. **Accent bar Y-position after title (QUAL-01 body slide)**
   - What we know: title is 40px font with lineHeight 1.2, but text can wrap to 2 lines depending on content length
   - What's unclear: whether to use a fixed offset from `CONTENT_Y + 30` (safe, simple) or compute from `title.getBoundingRect().top + title.getBoundingRect().height + 16` (precise, requires render-then-measure)
   - Recommendation: Use fixed offset for Phase 6 (simpler, avoids async measurement). The accent bar may overlap long titles — acceptable given test fixtures are within known character limits.

2. **Store `updateSlideTitle` / `updateSlideBody` action naming**
   - What we know: Zustand store needs new actions to write inline edits back to `slides[index].title` or `.body`
   - What's unclear: Whether to use a single `updateSlide(index, partial: Partial<ParsedSlide>)` or separate `updateSlideTitle` / `updateSlideBody`
   - Recommendation: Claude's discretion — single `updateSlide` is cleaner; planner should decide.

3. **@fontsource weight variants for DM Serif Display**
   - What we know: DM Serif Display is a display serif typically available in weight 400 only (no 700 variant)
   - What's unclear: Whether the bold title styling for Newsletter preset should use weight 400 (the only available weight) or if there's a 700 variant
   - Recommendation: Import only `dm-serif-display/400.css`. For the Newsletter heading, set `fontWeight: '400'` (the font already has a display character that reads as bold). The planner should confirm by checking `node_modules/@fontsource/dm-serif-display/` for available weight files.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `carousel-ui/vite.config.ts` (test block — `environment: jsdom, globals: true`) |
| Setup file | `carousel-ui/src/test-setup.ts` |
| Quick run command | `cd carousel-ui && npx vitest run` |
| Full suite command | `cd carousel-ui && npx vitest run --reporter=verbose` |

Current baseline: 65 tests passing across 8 test files. All must remain green throughout Phase 6.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Font preset switch changes headingFont/bodyFont on canvas | unit | `npx vitest run src/canvas/__tests__/layouts.test.ts` | ❌ Wave 0 — extend layouts.test.ts |
| EDIT-02 | Color role override updates Zustand store immediately | unit | `npx vitest run src/store/__tests__/useCarouselStore.test.ts` | ❌ Wave 0 |
| EDIT-03 | Color preset selection fills all 4 color roles | unit | `npx vitest run src/store/__tests__/useCarouselStore.test.ts` | ❌ Wave 0 |
| EDIT-04 | IText editing:exited commits text to store | unit | `npx vitest run src/components/__tests__/SlideCanvas.test.tsx` | ❌ Wave 0 |
| EDIT-05 | Alignment override stored per-slide; layout uses it | unit | `npx vitest run src/canvas/__tests__/layouts.test.ts` | ❌ Wave 0 — extend |
| QUAL-01 | Body slide canvas.add() called with accent bar + corner mark objects | unit | `npx vitest run src/canvas/__tests__/layouts.test.ts` | ❌ Wave 0 — extend |
| QUAL-02 | Font sizes locked: hook 64px, body title 40px, body text 24px | unit | `npx vitest run src/canvas/__tests__/layouts.test.ts` | ✅ Existing (partial — test currently checks renderAll; extend to check fontSize on text objects) |
| QUAL-03 | No layout object positioned beyond CONTENT_BOTTOM (930px) | unit | `npx vitest run src/canvas/__tests__/layouts.test.ts` | ❌ Wave 0 — extend |
| QUAL-04 | fontsReady gate: canvas not initialized until setFontsReady(true) | unit | `npx vitest run src/components/__tests__/SlideCanvas.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd carousel-ui && npx vitest run`
- **Per wave merge:** `cd carousel-ui && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/store/__tests__/useCarouselStore.test.ts` — covers EDIT-02, EDIT-03 (setColor, setColors, setFontPreset, setAlignment)
- [ ] `src/components/__tests__/SlideCanvas.test.tsx` — covers EDIT-04 (IText editing commit), QUAL-04 (fontsReady gate)
- [ ] Extend `src/canvas/__tests__/layouts.test.ts` — covers EDIT-01 (font param), EDIT-05 (alignment param), QUAL-01 (geometric objects present), QUAL-03 (no object beyond CONTENT_BOTTOM)

Existing `layouts.test.ts` uses a well-established Fabric.js mock pattern — extend it rather than creating a parallel test file.

---

## Sources

### Primary (HIGH confidence)

- Installed Fabric.js v6.9.1 source — `/carousel-ui/node_modules/fabric/src/` — IText/Textbox API, `editing:entered`/`editing:exited` events, `mousedblclick` auto-enter behavior, `ITextClickBehavior.ts` doubleClickHandler
- Installed codebase — `carousel-ui/src/` — actual store shape, layout function signatures, existing test patterns, App.tsx font gate
- npm registry (verified live) — @fontsource package versions: space-grotesk@5.2.10, fraunces@5.2.9, dm-serif-display@5.2.8, dm-sans@5.2.8, syne@5.2.7

### Secondary (MEDIUM confidence)

- `06-CONTEXT.md` and `06-UI-SPEC.md` — design decisions and interaction contracts produced by gsd-discuss-phase and gsd-ui-researcher; treated as authoritative for this project
- `REQUIREMENTS.md` — acceptance criteria for all 9 requirements

### Tertiary (LOW confidence)

- None — all findings verified against installed source or project documents.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm registry; packages confirmed installed or installable
- Architecture: HIGH — patterns derived from reading actual installed codebase, not training data
- Fabric.js IText API: HIGH — verified from installed Fabric.js v6.9.1 source files directly
- Pitfalls: HIGH — derived from actual code inspection (existing `selectable: false`, existing `useEffect` deps, @fontsource import pattern)
- Font name strings: HIGH — @fontsource README conventions; easily verified by checking installed package CSS

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (Fabric.js v6 is stable/pinned; @fontsource versions move slowly)
