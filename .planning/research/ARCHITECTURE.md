# Architecture Research

**Domain:** Local web UI carousel image generator — markdown-to-PNG rendering pipeline
**Researched:** 2026-03-17
**Confidence:** HIGH for core patterns (verified against MDN, npm docs, official library docs); MEDIUM for rendering pipeline tradeoffs (community sources, multiple-source agreement)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXISTING SYSTEM                          │
│   /science skill  →  output/YYYY-MM-DD-[slug].md               │
└──────────────────────────────┬──────────────────────────────────┘
                               │  markdown file (read-only input)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WEB UI ENTRY LAYER                           │
│   Vite + React (local dev server, no backend needed)            │
│   Drag & drop  OR  File picker  →  FileReader.readAsText()      │
└──────────────────────────────┬──────────────────────────────────┘
                               │  raw markdown string
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PARSE LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  markdownToSlides(rawMd) → CarouselDoc                   │   │
│  │  - gray-matter: strip YAML frontmatter (future use)      │   │
│  │  - regex section splitter: ## Slide N, ## Caption, etc.  │   │
│  │  - slide text extractor                                  │   │
│  │  - color scheme extractor (requires skill update)        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │  CarouselDoc (typed)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE LAYER (Zustand)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ carouselStore│  │ designStore  │  │  uiStore            │   │
│  │ - slides[]   │  │ - palette    │  │  - activeSlideIndex │   │
│  │ - caption    │  │ - fontPair   │  │  - isExporting      │   │
│  │ - hashtags   │  │ - spacing    │  │  - sidebarTab       │   │
│  │ - sources    │  │ - textSizes  │  │                     │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└───────────┬────────────────────┬───────────────────────────────┘
            │                    │
            ▼                    ▼
┌──────────────────┐  ┌─────────────────────────────────────────┐
│  EDITOR PANEL    │  │           PREVIEW PANEL                  │
│  (sidebar)       │  │  SlideCanvas (hidden off-screen)         │
│  - PaletteEditor │  │  - 1080x1080 canvas element              │
│  - FontPicker    │  │  - CSS transform scale() for preview     │
│  - TextEditor    │  │  - renders from designStore + slides[]   │
│  - SlideNav      │  │                                          │
└──────────────────┘  └─────────────────┬─────────────────────────┘
                                         │  canvas.toBlob()
                                         ▼
                       ┌─────────────────────────────────────────┐
                       │           EXPORT LAYER                   │
                       │  - toPng(slideEl, { width:1080,         │
                       │            height:1080, pixelRatio:1 }) │
                       │  - individual PNG download              │
                       │  - JSZip bundle → .zip download         │
                       └─────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| `App` | Layout shell, drop zone listener | React, Vite |
| `markdownToSlides()` | Parse raw markdown into `CarouselDoc` | Custom parser (regex), gray-matter |
| `carouselStore` | Source-of-truth for parsed slide content | Zustand slice |
| `designStore` | User's design decisions (palette, fonts, spacing) | Zustand slice, initialized from parsed color scheme |
| `uiStore` | Transient UI state (active slide, export progress) | Zustand slice |
| `EditorPanel` | Design controls sidebar | React components |
| `SlidePreview` | Scaled visual preview of active slide | Div-based, CSS transform |
| `SlideCanvas` | Off-screen 1080x1080 canvas for export-quality render | `<canvas>` element, Canvas 2D API |
| `ExportButton` | Triggers html-to-image capture per slide, JSZip bundle | html-to-image, JSZip |
| `FontLoader` | Resolves font names → loaded `FontFace` objects before render | CSS Font Loading API (`document.fonts`) |

---

## Recommended Project Structure

```
web-ui/
├── index.html                  # Vite entry point
├── vite.config.ts              # Vite config (no plugins needed for MVP)
├── src/
│   ├── main.tsx                # React root
│   ├── App.tsx                 # Layout, drag-drop entry
│   ├── parse/
│   │   ├── markdownToSlides.ts # Core parser — returns CarouselDoc
│   │   └── types.ts            # CarouselDoc, Slide, ColorScheme interfaces
│   ├── store/
│   │   ├── carouselStore.ts    # Zustand: parsed content
│   │   ├── designStore.ts      # Zustand: palette, font, spacing
│   │   └── uiStore.ts          # Zustand: active slide, export state
│   ├── components/
│   │   ├── DropZone.tsx        # Drag & drop target + file picker
│   │   ├── EditorPanel/
│   │   │   ├── index.tsx       # Sidebar shell with tabs
│   │   │   ├── PaletteEditor.tsx
│   │   │   ├── FontPicker.tsx
│   │   │   ├── TextEditor.tsx  # Per-slide text overrides
│   │   │   └── SpacingEditor.tsx
│   │   ├── PreviewPanel/
│   │   │   ├── index.tsx       # Scaled preview shell
│   │   │   ├── SlidePreview.tsx # CSS-scaled display version
│   │   │   └── SlideNav.tsx    # Previous/next slide controls
│   │   └── ExportBar.tsx       # Export buttons
│   ├── renderer/
│   │   ├── SlideCanvas.tsx     # Off-screen 1080x1080 canvas element
│   │   ├── renderSlide.ts      # Canvas 2D draw logic (background, text, layout)
│   │   └── fontLoader.ts       # FontFace API loading + document.fonts.ready
│   ├── export/
│   │   ├── exportPng.ts        # html-to-image toPng() per slide
│   │   └── exportZip.ts        # JSZip bundle of all slide PNGs
│   └── constants/
│       ├── defaultDesign.ts    # Default palette, fonts, spacing values
│       └── slideLayout.ts      # Layout constants (padding, font sizes, canvas size)
└── public/
    └── fonts/                  # Bundled fallback fonts if Google Fonts unavailable
```

### Structure Rationale

- **`parse/` isolated from components:** The markdown parser has no UI dependencies — it is a pure function. Isolated here it can be tested independently and reused from the export path.
- **`renderer/` separate from `components/`:** The Canvas 2D rendering path (used for export) is distinct from the React component tree (used for preview). Separating them prevents the export path from accidentally depending on DOM/React rendering state.
- **`store/` three slices:** Content (what is being rendered), design (how it looks), and UI (transient state). Separating them means a font change does not re-evaluate slide content, and export state does not pollute design state.
- **`export/` isolated:** Export functions are side-effectful (trigger downloads). Isolating them makes it easier to test rendering without triggering downloads.

---

## Architectural Patterns

### Pattern 1: Regex Section Splitter (no full AST needed)

**What:** Parse the structured markdown by splitting on `## Section Name` headers using a regex, then extracting content between consecutive section boundaries. No need for a full Markdown AST for this use case.

**When to use:** The markdown format is fixed and controlled by the `/science` skill. It does not require general-purpose markdown parsing — the section structure is predictable and stable. Full AST parsing (remark/unified) adds ~40kB of dependency weight for a problem that a 30-line regex parser solves adequately.

**Trade-offs:** Simpler and faster; brittle if the skill ever changes section headings. Mitigated by keeping the parser and the skill's output template in sync — a change to one requires a change to the other.

**Example:**
```typescript
// parse/markdownToSlides.ts
export function markdownToSlides(raw: string): CarouselDoc {
  const lines = raw.split('\n');
  const sections: Record<string, string[]> = {};
  let current = '__header__';

  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) {
      current = match[1]; // e.g. "Slide 1: Bacteria Just Lost..."
      sections[current] = [];
    } else {
      sections[current] = [...(sections[current] ?? []), line];
    }
  }

  const slides = Object.entries(sections)
    .filter(([key]) => key.startsWith('Slide '))
    .map(([key, body]) => ({
      index: parseInt(key.match(/Slide (\d+)/)?.[1] ?? '0'),
      title: key.replace(/^Slide \d+:\s*/, ''),
      body: body.join('\n').trim(),
    }));

  return {
    title: lines[0]?.replace(/^# /, '') ?? '',
    slides,
    caption: sections['Caption']?.join('\n').trim() ?? '',
    hashtags: sections['Hashtags']?.join(' ').trim() ?? '',
    sources: sections['Sources']?.join('\n').trim() ?? '',
    imageUrls: sections['Images']
      ?.filter(l => l.trim().startsWith('http'))
      .map(l => l.trim()) ?? [],
    colorScheme: sections['Color Scheme'] ?? null, // not yet in output
  };
}
```

### Pattern 2: Dual Render Path — Preview vs Export

**What:** Maintain two rendering paths: a CSS-scaled React component for the interactive preview, and a Canvas 2D (or off-screen DOM element captured via html-to-image) for export-quality 1080x1080 PNG output.

**When to use:** Always. Browser CSS rendering is fast and interactive; Canvas 2D or captured DOM rendering is accurate and pixel-exact. Do not try to export from the CSS preview element — it will produce blurry output on retina screens unless pixel ratio is handled explicitly.

**Trade-offs:** Two render paths means two implementations of the same visual layout. Mitigated by deriving both from the same `designStore` values and the same layout constants in `slideLayout.ts`. Any visual change must be applied in both paths, but the constants file makes this a single change point.

**Export pixel ratio handling:**
```typescript
// export/exportPng.ts — using html-to-image
import { toPng } from 'html-to-image';

export async function exportSlidePng(slideEl: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(slideEl, {
    width: 1080,
    height: 1080,
    pixelRatio: 1,     // CRITICAL: override devicePixelRatio
    // pixelRatio: 1 ensures output is exactly 1080x1080px on retina displays
    // without this, a 2x retina screen would produce 2160x2160px output
  });
  // convert dataUrl to Blob for JSZip
  const res = await fetch(dataUrl);
  return res.blob();
}
```

### Pattern 3: Font-Loaded Gate Before Render

**What:** All canvas or DOM-capture renders must be gated behind `document.fonts.ready` (or explicit `FontFace.load()` per font). Custom fonts not yet loaded produce blank/fallback text in canvas output even if they appear correct in the CSS preview.

**When to use:** Any time a custom Google Font or bundled font is used in the canvas renderer. This is a silent failure — canvas renders the fallback system font without any error.

**Trade-offs:** Adds async complexity. The fontLoader module centralizes this; all render calls go through `await fontLoader.ensureLoaded([fontName1, fontName2])` before drawing.

**Example:**
```typescript
// renderer/fontLoader.ts
const loaded = new Set<string>();

export async function ensureLoaded(fontNames: string[]): Promise<void> {
  const toLoad = fontNames.filter(f => !loaded.has(f));
  await Promise.all(
    toLoad.map(async (name) => {
      const face = new FontFace(name, `url(https://fonts.gstatic.com/...)`);
      await face.load();
      document.fonts.add(face);
      loaded.add(name);
    })
  );
  await document.fonts.ready;
}
```

---

## Data Flow

### Markdown Load → Preview

```
User drops file onto DropZone
    |
    v
FileReader.readAsText(file)
    |
    v
markdownToSlides(rawText) → CarouselDoc
    |
    v
carouselStore.setDocument(doc)
    |
    v
designStore.initFromColorScheme(doc.colorScheme ?? defaultDesign)
    |
    v
SlidePreview re-renders (Zustand subscription)
    → scales 1080x1080 layout down to fit panel via CSS transform
```

### Design Edit → Live Preview

```
User changes color in PaletteEditor
    |
    v
designStore.setPalette({ bg: '#1a1a2e', accent: '#e94560' })
    |
    v
SlidePreview re-renders (Zustand subscription, no re-parse)
    → instant visual update — no canvas involved
```

### Export → PNG Download

```
ExportButton clicked
    |
    v
uiStore.setExporting(true)
    |
    v
for each slide in carouselStore.slides[]:
    1. inject slide content into off-screen SlideCanvas element
    2. await fontLoader.ensureLoaded(designStore.fonts)
    3. blob = await exportSlidePng(slideCanvasEl)
    4. zip.file(`slide-${i+1}.png`, blob)
    |
    v
zip.generateAsync({ type: 'blob' })
    |
    v
triggerDownload(blob, `${date}-${slug}-carousel.zip`)
    |
    v
uiStore.setExporting(false)
```

### Color Scheme → Design Initialization

```
CarouselDoc.colorScheme (parsed from ## Color Scheme section)
    |
    ├── present → designStore.initFromColorScheme(colorScheme)
    │              maps: background → palette.bg
    │                    accent → palette.accent
    │                    text → palette.text
    │                    heading_font → designStore.fonts.heading
    │                    body_font → designStore.fonts.body
    │
    └── absent (current state of output files) → designStore.initFromColorScheme(null)
                                                   uses defaultDesign constants
```

**Note:** The current `/science` skill output does NOT include a `## Color Scheme` section. DESIGN-05 requires adding this section to the skill's output template. Until that change ships, the UI falls back to `defaultDesign`. This is not a blocker — the UI must handle both cases.

---

## Integration Points

### Existing System — What Changes

| Component | Change Type | Detail |
|-----------|-------------|--------|
| `output/YYYY-MM-DD-[slug].md` | Read-only input | No change to format required for MVP. Drag & drop into web UI. |
| `/science` skill (SKILL.md) | ADD new output section | Add `## Color Scheme` section with `bg`, `accent`, `text`, `heading_font`, `body_font` fields to satisfy DESIGN-05. This is additive — existing files remain valid; parser handles absence gracefully. |
| `output-template.md` | ADD color scheme block | Update the skill's output template to include the Color Scheme section. |

### New Components — Web UI

| Component | New vs Modified | Depends On |
|-----------|-----------------|------------|
| `web-ui/` directory | NEW | None (new separate app) |
| `markdownToSlides.ts` | NEW | Existing markdown format contract |
| `carouselStore`, `designStore`, `uiStore` | NEW | Zustand |
| `SlidePreview` (CSS-scaled) | NEW | designStore, carouselStore |
| `SlideCanvas` (off-screen 1080x1080) | NEW | renderer/renderSlide.ts |
| `fontLoader.ts` | NEW | CSS Font Loading API |
| `exportPng.ts` | NEW | html-to-image |
| `exportZip.ts` | NEW | JSZip |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Parse layer → State layer | `carouselStore.setDocument(doc)` | One-way on file load; parse result is immutable until next file drop |
| State layer → Preview | Zustand subscription (reactive) | Preview re-renders on every designStore mutation |
| State layer → Export | Read-only access to both stores | Export reads current state; does not mutate |
| CSS Preview → Canvas Renderer | Both consume `designStore` + `slideLayout.ts` constants | Same values, two rendering implementations |
| Skill output → Web UI | File system (user drags file from `output/`) | No programmatic connection — intentional; user reviews before design work |

---

## Suggested Build Order

Dependencies drive this order — each step unblocks the next.

1. **`parse/markdownToSlides.ts` + `types.ts`** — Define the `CarouselDoc` type and parse function first. This is the data contract everything else builds on. Test with the actual CRISPR and solar fuel output files before moving forward.

2. **`store/carouselStore.ts` + `store/designStore.ts`** — Wire up state with hardcoded default design values. No UI yet — just verify that `setDocument()` populates the stores correctly.

3. **`components/DropZone.tsx`** — File drag & drop + `FileReader` → `markdownToSlides()` → `carouselStore.setDocument()`. Validate the full parse path end-to-end with a real file.

4. **`components/PreviewPanel/SlidePreview.tsx`** — CSS-scaled preview of a single slide. Hard-code layout first (fixed background, text positions). Confirm visual output looks right at the target 1080x1080 proportions. No editor yet.

5. **`renderer/fontLoader.ts` + `renderer/renderSlide.ts` + `renderer/SlideCanvas.tsx`** — Off-screen canvas renderer. Must match the CSS preview visually. Validate by exporting a single slide and comparing pixel output.

6. **`export/exportPng.ts` + `export/exportZip.ts`** — Individual PNG download and ZIP bundle. Test that `pixelRatio: 1` produces exactly 1080x1080 output.

7. **`components/EditorPanel/PaletteEditor.tsx`** — Color editing. Verify live preview updates on every change.

8. **`components/EditorPanel/FontPicker.tsx` + `renderer/fontLoader.ts` font loading** — Add font selection. Test that canvas renderer uses the selected font (silent failure risk — see Pitfalls).

9. **`components/EditorPanel/TextEditor.tsx`** — Per-slide text overrides. Lowest priority — the parsed text is usually correct; this is a "polish" feature.

10. **Skill update: add `## Color Scheme` section** — Update SKILL.md and `output-template.md` to emit a color scheme block. Update `designStore.initFromColorScheme()` to consume it. Verify with a freshly generated output file.

---

## Anti-Patterns

### Anti-Pattern 1: Exporting from the CSS Preview Element

**What people do:** Capture the visible scaled preview `<div>` using html-to-image and download that as the PNG.

**Why it's wrong:** The preview is CSS-scaled (e.g., scaled down to 540px for display). Even with `pixelRatio: 2`, the output is a rescaled version of a smaller element. Text rendering, subpixel antialiasing, and font hinting differ from a natively 1080px element. The exported PNG will be soft.

**Do this instead:** Maintain a separate off-screen `SlideCanvas` element rendered at true 1080x1080px with `position: absolute; left: -9999px`. Capture that element with `pixelRatio: 1`. The preview is display-only; the canvas is export-only.

### Anti-Pattern 2: Rendering Canvas Before Fonts Are Loaded

**What people do:** Call `ctx.fillText()` immediately after setting `ctx.font = '32px "Inter"'`, before the font has resolved.

**Why it's wrong:** The canvas silently falls back to a system font (e.g., Arial or sans-serif). The exported PNG uses a different font than the preview. No error is thrown.

**Do this instead:** Always `await fontLoader.ensureLoaded([headingFont, bodyFont])` before any canvas draw call. The font loader caches loaded faces so subsequent slides don't wait.

### Anti-Pattern 3: One Monolithic Zustand Store

**What people do:** Put slides, design settings, and UI state into a single flat Zustand store.

**Why it's wrong:** A color change in `designStore` triggers re-evaluation of slide content selectors even though slide content hasn't changed. Export state (`isExporting`) causes preview components to re-render. With 6 slides each subscribed to the same store, unnecessary re-renders accumulate.

**Do this instead:** Three focused slices (`carouselStore`, `designStore`, `uiStore`). Components subscribe only to the slice they need. A font change re-renders only preview components subscribed to `designStore`, not slide content components.

### Anti-Pattern 4: Tight Coupling Between Parser and Skill Output Format

**What people do:** Hardcode section names as bare strings scattered through parser logic (checking for `'Slide 1:'`, `'Slide 2:'` individually).

**Why it's wrong:** When the skill adds a `## Color Scheme` section or renames `Images` to `Image Sources`, the parser breaks in non-obvious ways — some sections parse, some silently return empty.

**Do this instead:** Define a `SECTION_PATTERNS` constant object that maps semantic names to the regex patterns that detect them. Parser logic references `SECTION_PATTERNS.SLIDE`, `SECTION_PATTERNS.COLOR_SCHEME`, etc. When the format changes, update the constants file, not scattered parser logic.

---

## Scaling Considerations

This is a single-user local tool. The relevant dimension is **rendering latency** and **export fidelity**, not user scale.

| Concern | Approach |
|---------|----------|
| Export time for 7 slides | Sequential canvas captures (~200ms each); total ~1.5s is acceptable. Do not parallelize — concurrent DOM captures on the same off-screen element produce race conditions. |
| Preview lag on design edits | CSS-based preview (no canvas involved) updates in <16ms. No debounce needed for color changes. Debounce font changes by 300ms since they trigger font loading. |
| Large slide text overflow | The CSS preview reveals overflow visually. Add a character count warning per slide in the TextEditor (Instagram carousel slides read best under ~200 chars). |
| font.load() failure (no internet) | Fall back to bundled system font (Inter via `public/fonts/`). fontLoader should catch rejected promises and log a warning, not crash. |

---

## Sources

- [MDN: CSS Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) — `FontFace`, `document.fonts.add()`, `document.fonts.ready`. HIGH confidence.
- [MDN: Window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) — pixel ratio canvas scaling. HIGH confidence.
- [html-to-image npm](https://www.npmjs.com/package/html-to-image) — `toPng()`, `pixelRatio` option, performance vs html2canvas. MEDIUM confidence (npm docs + community comparison articles).
- [html2canvas vs html-to-image comparison — npm-compare.com](https://npm-compare.com/dom-to-image,html-to-image,html2canvas) — library comparison, download trends. MEDIUM confidence.
- [Better Programming: Replacing html2canvas with html-to-image](https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf) — real-world migration rationale. MEDIUM confidence.
- [JSZip documentation](https://stuk.github.io/jszip/) — client-side ZIP generation API. HIGH confidence.
- [client-zip npm](https://www.npmjs.com/package/client-zip) — lightweight alternative to JSZip (40x faster per benchmarks). MEDIUM confidence.
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) — YAML frontmatter parsing. HIGH confidence.
- [Zustand — state management in React 2025](https://makersden.io/blog/react-state-management-in-2025) — Zustand as the standard middle-ground for client state. MEDIUM confidence.
- [Konva: Custom Font with Canvas](https://konvajs.org/docs/sandbox/Custom_Font.html) — FontFace API + canvas font load pattern. HIGH confidence (official Konva docs).
- [Konva: High-Quality Canvas Export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html) — pixelRatio handling for canvas export. HIGH confidence.

---

*Architecture research for: Web UI carousel image generator (Project Pleiades v1.1)*
*Researched: 2026-03-17*
