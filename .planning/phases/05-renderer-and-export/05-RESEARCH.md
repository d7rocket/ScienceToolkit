# Phase 5: Renderer and Export - Research

**Researched:** 2026-03-18
**Domain:** React + Vite + Fabric.js canvas rendering, font management, PNG/ZIP export
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tech Stack**
- Framework: React + Vite
- Styling: Tailwind CSS (UI shell only — not canvas)
- State management: Zustand (single store for slides, colors, fonts, export state)
- App directory: `carousel-ui/` at project root, with its own `package.json`
- Start command: `npm run dev` from `carousel-ui/`

**Canvas Rendering**
- Library: Fabric.js — WYSIWYG canvas that IS the export source (no re-render needed)
- Resolution: Single 1080x1080 canvas always. CSS `transform: scale()` shrinks it for preview. Export grabs the canvas as-is.
- Font loading: Self-hosted via `@font-face`. Block canvas render until `document.fonts.ready` resolves (FontFaceObserver or equivalent). No external CDN at runtime.
- Thumbnails: Live mini Fabric.js canvases (not PNG snapshots) — always in sync with the full slide. Clicking switches the active slide.
- Export pixel ratio: `pixelRatio: 1` for PNG export to match the 1080x1080 canvas exactly.

**Slide Layouts**
- Hook slide (Slide 1): Large title (~64px) fills top ~40% of the safe zone. Body text (question/fact) centered below in the remaining space. Whitespace-dominant — impact through restraint.
- Body slides (Slides 2–N-1): Claude's discretion — design to REQUIREMENTS typography specs (36–44px title, 22–26px body text, 60/40 whitespace-to-content ratio, slide number badge).
- CTA slide (final slide): Claude's discretion — takeaway sentence + "Follow for daily science drops" CTA.
- Safe zone boundaries: top 120px, bottom 150px, sides 80px — invisible by default, toggled by user (RNDR-05).
- All layouts are role-aware and fixed — no free-form positioning.

**Thumbnail Strip**
- Position: Left sidebar, vertical strip
- Each thumbnail is a small live Fabric.js canvas mirroring its full slide
- Clicking a thumbnail makes it the active slide in the main canvas area

**Drag-Drop & Loading UX**
- Initial state: Full-screen drop zone with 'Drop your /science markdown file here' prompt
- Post-load: Metadata top bar showing: topic title | date | slide count | field (LOAD-02)
- Invalid file: Inline error in drop zone (turns red, shows message). No page reload needed. User can retry.
- File reload: Dragging a new file replaces the current session immediately — no confirmation dialog
- Color scheme parsed from `## Color Scheme` section auto-populates palette (LOAD-03). If absent, use hardcoded `defaultDesign` fallback.

### Claude's Discretion

- Body slide and CTA slide precise layout (follow REQUIREMENTS typography specs)
- Slide number badge style and position
- ZIP generation library (JSZip recommended)
- Export progress indicator implementation
- Per-slide fallback download button placement (XPRT-03)
- App color scheme for the UI shell itself (dark editor aesthetic fits the tool)
- Error state styling details

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOAD-01 | User can drag & drop a markdown file onto the UI to load carousel content | HTML5 File API + dragover/drop events; native browser API, no extra library needed |
| LOAD-02 | User can see parsed slide count, topic title, and date after loading | Markdown regex parser extracts `# Title`, `**Date:**` header line, and counts `## Slide N:` headings |
| LOAD-03 | Color scheme from markdown auto-populates the palette controls | `## Color Scheme` section parsed with regex for `- Role: #HEX — descriptor` pattern; absent section falls back to `defaultDesign` constant |
| RNDR-01 | Each slide renders as a 1080x1080px canvas with the loaded color palette | Fabric.js v6/v7 `Canvas` initialized at 1080x1080; `FabricText`/`Textbox` objects placed at fixed coordinates per layout role |
| RNDR-02 | Live preview updates in real-time when colors, fonts, or text change | Zustand store mutation triggers `canvas.renderAll()` via React effect subscriptions; no diffing needed |
| RNDR-03 | Slides use role-aware fixed layouts — hook slide, body slides, CTA slide | Three layout functions per slide role; objects positioned relative to safe zone constants |
| RNDR-04 | Layout is constant across all posts — consistent margins, safe zones, content placement | Safe zone constants (`SAFE_TOP=120, SAFE_BOTTOM=150, SAFE_SIDES=80`) used as shared design constants |
| RNDR-05 | Safe zone overlay toggle shows Instagram UI boundaries | Fabric.js `Rect` objects with `stroke` but no `fill`, toggled via `opacity: 0/1` or `visible` flag |
| RNDR-06 | Slide thumbnail strip shows all slides as navigable mini-previews | One mini Fabric.js canvas per slide at ~200x200px; CSS `transform: scale(200/1080)` from 1080px canvas |
| XPRT-01 | User can export individual slides as 1080x1080 PNG files | `canvas.toDataURL({ format: 'png' })` → programmatic `<a>` download; `pixelRatio: 1` prevents upscaling |
| XPRT-02 | User can export all slides as a ZIP bundle | JSZip: iterate slides, collect PNG blobs, `zip.generateAsync({ type: 'blob' })` → `<a>` download |
| XPRT-03 | Exported images match the preview exactly (font rendering, colors, layout) | Same canvas is the export source (WYSIWYG); font gate ensures fonts loaded before any render |
</phase_requirements>

---

## Summary

Phase 5 is a greenfield React + Vite app in `carousel-ui/`. The primary technical domain is Fabric.js canvas rendering with self-hosted fonts, a markdown parser for `/science` output files, and a client-side PNG/ZIP export pipeline.

The central architectural decision — already locked — is that Fabric.js canvases are the render source and the export source simultaneously (WYSIWYG). This eliminates the most common class of export fidelity bugs. The main risks are font loading timing (canvas renders before fonts are ready produce system-fallback glyphs) and canvas taint (any cross-origin asset silently disables `toDataURL`). Both have clear prevention strategies.

Fabric.js is currently at v6/v7 (the npm latest is 7.x as of early 2026). v6 and v7 share the same TypeScript-based API architecture; v7 is largely infrastructure changes (Node 20+ requirement, origin default shifts). The key export method is `canvas.toDataURL({ format: 'png' })` — no multiplier needed because the canvas is already 1080x1080 at `pixelRatio: 1`. Tailwind CSS v4 ships with a Vite plugin that requires no `tailwind.config.js`. Zustand 5 has minimal API changes; the `create<State>()(...)` pattern with a flat store is appropriate here.

**Primary recommendation:** Use Fabric.js v6 (pin to `^6.9.0`, not v7) to avoid the origin-default breaking change in v7 that would require rethinking all object placement coordinates. Self-host Inter + a science-appropriate display font. Block canvas render via `document.fonts.ready`. Keep the Zustand store flat — one slice with slides array, activeSlideIndex, colors, fonts, and exportState.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.3 | UI framework | Locked decision |
| Vite | ^5.x | Build tool + dev server | Locked decision |
| Fabric.js | ^6.9.0 | Canvas rendering + export source | Locked decision; v6 stable, v7 has origin-default breaking change |
| Zustand | ^5.x | App state (slides, colors, fonts, export) | Locked decision; minimal boilerplate, no provider needed |
| Tailwind CSS | ^4.x | UI shell styling only (not canvas) | Locked decision |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| JSZip | ^3.10 | ZIP bundle generation in browser | XPRT-02 (ZIP export) |
| file-saver | ^2.x | Cross-browser `<a>` download trigger | Companion to JSZip for ZIP download; optional for single PNG |
| fontfaceobserver | ^2.3 | Promise-based font load detection | Alternative if `document.fonts.ready` alone proves unreliable |
| @tailwindcss/vite | ^4.x | Tailwind v4 Vite plugin | Required for v4 — no PostCSS config needed |
| TypeScript | ^5.x | Type safety for Fabric.js v6 (ships with types) | Included in Vite react-ts template |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fabric.js | Konva.js | Konva has better React integration via react-konva, but Fabric.js was locked decision |
| Fabric.js | html-to-image / dom-to-image | DOM-based approach — fonts and CSS render correctly but output can differ from preview on different screens; Fabric.js WYSIWYG avoids this entirely |
| JSZip | fflate | fflate is smaller/faster but JSZip has more community examples and the CONTEXT.md recommends it |
| Zustand flat store | Zustand slice pattern | Slice pattern adds indirection without benefit at this store size; flat store is simpler |
| Fabric.js v6 | Fabric.js v7 | v7 changes `originX`/`originY` defaults to `'center'` — all object positioning code must account for this; v6 uses `'left'`/`'top'` defaults which are more predictable for fixed layouts |

### Installation

```bash
# From carousel-ui/ directory
npm create vite@latest . -- --template react-ts
npm install fabric@^6.9.0 zustand jszip file-saver fontfaceobserver
npm install -D @tailwindcss/vite tailwindcss
```

---

## Architecture Patterns

### Recommended Project Structure

```
carousel-ui/
├── public/
│   └── fonts/                  # Self-hosted .woff2 files
├── src/
│   ├── components/
│   │   ├── DropZone.tsx        # Initial file drop UX (LOAD-01)
│   │   ├── MetaBar.tsx         # Topic/date/count top bar (LOAD-02)
│   │   ├── ThumbnailStrip.tsx  # Left sidebar with mini canvases (RNDR-06)
│   │   ├── SlideCanvas.tsx     # Main 1080x1080 Fabric.js canvas
│   │   └── ExportPanel.tsx     # Export buttons + progress (XPRT-01, XPRT-02)
│   ├── canvas/
│   │   ├── layouts.ts          # Layout functions: renderHookSlide, renderBodySlide, renderCtaSlide
│   │   ├── constants.ts        # SAFE_TOP, SAFE_BOTTOM, SAFE_SIDES, CANVAS_SIZE
│   │   └── renderSlide.ts      # Dispatch to correct layout by slide index/role
│   ├── parser/
│   │   └── parseMarkdown.ts    # Parses /science markdown → ParsedCarousel type
│   ├── store/
│   │   └── useCarouselStore.ts # Zustand store: slides, colors, fonts, exportState
│   ├── hooks/
│   │   └── useFontReady.ts     # Waits on document.fonts.ready before resolving
│   ├── export/
│   │   ├── exportPng.ts        # Single slide PNG export
│   │   └── exportZip.ts        # ZIP bundle with progress callback
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # @import "tailwindcss"; + @font-face declarations
├── vite.config.ts
└── package.json
```

### Pattern 1: Fabric.js Canvas in React (useRef + useEffect)

**What:** Initialize Fabric.js `Canvas` bound to a DOM `<canvas>` ref; dispose on unmount.
**When to use:** Every canvas component in the app (main canvas, each thumbnail).

```typescript
// Source: LogRocket Fabric.js v6 tutorial + official upgrade docs
import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';

export function SlideCanvas({ width = 1080, height = 1080 }) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const fc = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: false,        // no multi-select in viewer mode
      renderOnAddRemove: false, // batch renders manually
    });
    fabricRef.current = fc;
    return () => { fc.dispose(); };
  }, []);

  // Note: v6 imports are named: import { Canvas, FabricText, Textbox, Rect } from 'fabric'
  // NOT: import { fabric } from 'fabric'  ← this is the v5 pattern, will break in v6

  return (
    <div style={{ transform: `scale(${width / 1080})`, transformOrigin: 'top left' }}>
      <canvas ref={canvasElRef} />
    </div>
  );
}
```

### Pattern 2: CSS scale() for Preview Shrinking

**What:** The 1080x1080 canvas is rendered at full resolution; CSS `transform: scale()` shrinks it visually without changing the pixel content.
**When to use:** Main preview panel (shrink to ~540px), thumbnail strip (shrink to ~160px).

```typescript
// Scale factor for the main preview area:
// If the preview container is 540px wide: scale = 540 / 1080 = 0.5
const previewScale = containerWidth / 1080;

// In JSX — the outer div clips the visual overflow, inner div scales
<div style={{ width: containerWidth, height: containerWidth, overflow: 'hidden' }}>
  <div style={{
    width: 1080,
    height: 1080,
    transform: `scale(${previewScale})`,
    transformOrigin: 'top left',
  }}>
    <canvas ref={canvasElRef} width={1080} height={1080} />
  </div>
</div>

// IMPORTANT: Do NOT use object-fit on a canvas element — it scales pixels, not layout.
// CSS transform: scale() is correct here because it shrinks the DOM element visually
// while the canvas buffer remains 1080x1080 (what gets exported).
```

### Pattern 3: Font Loading Gate

**What:** Block all canvas rendering until fonts are confirmed loaded. Canvas draws text using the browser font stack — if the custom font isn't loaded when `renderAll()` runs, system fallbacks appear in the export.
**When to use:** App startup, before first `renderAll()` call anywhere.

```typescript
// Source: MDN Web API (document.fonts.ready) + fontfaceobserver docs
// useFontReady.ts
import { useEffect, useState } from 'react';

export function useFontReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setReady(true));
  }, []);
  return ready;
}

// In App.tsx: render nothing canvas-related until fontsReady === true
// This is the simplest and most reliable approach.
// FontFaceObserver is a fallback for browsers where document.fonts.ready is unreliable
// (Safari pre-2022). For a local tool targeting modern browsers, document.fonts.ready suffices.
```

```css
/* In index.css — @font-face declarations before @import "tailwindcss" */
@font-face {
  font-family: 'Inter';
  font-weight: 400 700;
  font-display: block;  /* block rendering until font available — prevents fallback flash */
  src: url('/fonts/Inter.woff2') format('woff2');
}
```

### Pattern 4: PNG Export (Single Slide)

**What:** Export the current Fabric.js canvas as a 1080x1080 PNG exactly matching the preview.
**When to use:** XPRT-01 (individual slide export).

```typescript
// Source: Fabric.js v6 API + GitHub issues on toDataURL sizing
export function exportSlideAsPng(canvas: Canvas, filename: string): void {
  // pixelRatio defaults to devicePixelRatio on some builds — force 1
  // multiplier defaults to 1 in v6; explicit is safer
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 1,
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

// CRITICAL: Never pass multiplier > 1 — the canvas is already 1080x1080.
// Multiplier > 1 would produce a 2160x2160 PNG which breaks the Instagram spec.
// CRITICAL: Never use window.devicePixelRatio in the export path.
```

### Pattern 5: ZIP Bundle Export

**What:** Collect PNG data URLs from all slide canvases, bundle into a ZIP file, trigger download.
**When to use:** XPRT-02 (ZIP export).

```typescript
// Source: JSZip official documentation + community React examples
import JSZip from 'jszip';

export async function exportAllSlidesAsZip(
  canvases: Canvas[],
  topicSlug: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(topicSlug)!;

  for (let i = 0; i < canvases.length; i++) {
    const dataUrl = canvases[i].toDataURL({ format: 'png', multiplier: 1 });
    // Convert data URL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    folder.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
    onProgress(Math.round(((i + 1) / canvases.length) * 100));
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topicSlug}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Pattern 6: Markdown Parser

**What:** Parse the `/science` markdown file format into a typed `ParsedCarousel` object.
**When to use:** On file drop (LOAD-01, LOAD-02, LOAD-03).

```typescript
// Based on canonical format in examples/output-sample.md
// Key observations from real output files:
// - Both crispr and solar-fuel output files have NO ## Color Scheme section
//   → defaultDesign fallback is the common case, not the edge case
// - Slide headings: ## Slide N: Title (where N is 1-based integer)
// - Metadata line: **Date:** YYYY-MM-DD | **Field:** X | **Sources:** N
// - Color Scheme format: - Background: #XXXXXX — descriptor

interface ParsedCarousel {
  title: string;
  date: string;
  field: string;
  sourceCount: number;
  slides: ParsedSlide[];
  colors: ColorScheme | null;  // null = use defaultDesign
}

interface ParsedSlide {
  index: number;            // 1-based
  role: 'hook' | 'body' | 'cta';
  title: string;
  body: string;
}

function parseMarkdown(text: string): ParsedCarousel {
  // Extract title: first # heading
  const titleMatch = text.match(/^# (.+)$/m);

  // Extract metadata line
  const metaMatch = text.match(/\*\*Date:\*\* ([\d-]+) \| \*\*Field:\*\* (.+?) \| \*\*Sources:\*\* (\d+)/);

  // Extract slides: each ## Slide N: Title block
  const slideRegex = /^## Slide (\d+): (.+)\n\n([\s\S]+?)(?=\n---|\n## Slide|\n## Caption|$)/gm;

  // Extract color scheme (may be absent)
  const colorSchemeMatch = text.match(/## Color Scheme[\s\S]*?- Background: (#[A-Fa-f0-9]{6})/);
  // Parse all 4 roles: Background, Primary text, Accent, Highlight

  // Role assignment: index 1 = hook, index = max = cta, all others = body
}

const defaultDesign: ColorScheme = {
  background: '#0B0E2D',
  primaryText: '#F0F0F5',
  accent: '#6C5CE7',
  highlight: '#00CEC9',
};
// These hex values come from the output-sample.md "Deep Field" palette
```

### Pattern 7: Zustand Store Structure

**What:** Single flat store managing all carousel app state.
**When to use:** Single global store for the entire app.

```typescript
// Source: Zustand 5 docs + TypeScript usage patterns
import { create } from 'zustand';

interface CarouselStore {
  // Loaded data
  slides: ParsedSlide[];
  meta: { title: string; date: string; field: string; slideCount: number } | null;
  colors: ColorScheme;

  // UI state
  activeSlideIndex: number;
  safezoneVisible: boolean;
  fontsReady: boolean;

  // Export state
  exportProgress: number;      // 0-100, 0 = idle
  exportError: string | null;

  // Actions
  loadFile: (text: string) => void;
  setActiveSlide: (index: number) => void;
  toggleSafezone: () => void;
  setFontsReady: (ready: boolean) => void;
  setExportProgress: (pct: number) => void;
}

export const useCarouselStore = create<CarouselStore>((set) => ({
  slides: [],
  meta: null,
  colors: defaultDesign,
  activeSlideIndex: 0,
  safezoneVisible: false,
  fontsReady: false,
  exportProgress: 0,
  exportError: null,

  loadFile: (text) => set(() => {
    const parsed = parseMarkdown(text);
    return {
      slides: parsed.slides,
      meta: { title: parsed.title, date: parsed.date, field: parsed.field, slideCount: parsed.slides.length },
      colors: parsed.colors ?? defaultDesign,
      activeSlideIndex: 0,
    };
  }),
  // ... other actions
}));
```

### Anti-Patterns to Avoid

- **Re-rendering the canvas from React state on every tick:** Fabric.js has its own internal render loop. Call `canvas.renderAll()` explicitly after mutations. Do not recreate the canvas object on state changes.
- **Using the `fabric` namespace import from v5:** `import { fabric } from 'fabric'` is v5. In v6/v7: `import { Canvas, FabricText, Textbox, Rect } from 'fabric'`.
- **Using `multiplier` or `devicePixelRatio` in export:** Canvas is already 1080x1080. Adding any multiplier produces oversized exports.
- **Rendering canvases for all slides simultaneously:** This creates many Fabric instances and is slow. Only the active slide's main canvas needs to be a full Fabric instance. Thumbnails are separate small canvases. Do not try to reuse one canvas for all slides.
- **Loading fonts from a CDN URL at runtime:** Any network-fetched asset loaded into canvas context (including fonts via `@import url(cdn)`) can cause canvas taint in some browsers. Self-host all assets in `public/fonts/`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP file generation | Custom binary stream builder | JSZip | ZIP binary format is complex; JSZip handles compression, CRC, headers |
| Font load detection | setInterval polling for font presence | `document.fonts.ready` (native) or fontfaceobserver | Native Promise API; polling has race conditions |
| Canvas-to-file download | XHR blob fetch + manual a-tag creation | The `fetch(dataUrl).blob()` → `createObjectURL` pattern | Handling base64→blob conversion manually has size limits |
| Markdown section parsing | Full markdown AST parser | Custom regex against known format | The `/science` output format is a fixed contract; a full markdown parser (remark, marked) adds unnecessary complexity and dependencies |
| Safe zone overlay | Custom overlay layer in DOM | Fabric.js `Rect` objects with `evented: false, selectable: false` | Keeps everything in the canvas coordinate system; no CSS positioning math |

**Key insight:** The `/science` output format is a rigid contract defined by the skill. A small regex-based parser is more robust than a full markdown parser because it can assert on the exact expected structure.

---

## Common Pitfalls

### Pitfall 1: Canvas Taint From Cross-Origin Assets

**What goes wrong:** Any asset loaded into a canvas context from a cross-origin URL (including fonts loaded via CDN) marks the canvas as "tainted." Once tainted, `canvas.toDataURL()` throws `SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.` The canvas appears correct visually but export silently fails.

**Why it happens:** Browser security model prevents exfiltrating cross-origin pixel data. Once any cross-origin image or font is drawn onto a canvas, the entire canvas is locked.

**How to avoid:** Self-host all fonts in `public/fonts/`. Never load images from external URLs (the `/science` output lists image URLs, but Phase 5 does NOT render images on slides — ignore the `## Images` section). If future phases add images, always use `crossOrigin: 'anonymous'` on `FabricImage.fromURL()` AND the server must respond with correct CORS headers.

**Warning signs:** `toDataURL` works in development but fails in production; export produces a blank white canvas; SecurityError in browser console.

### Pitfall 2: Font Not Loaded at First Canvas Render

**What goes wrong:** Fabric.js draws `FabricText` objects using the browser's text rendering, which checks the loaded font stack at draw time. If `renderAll()` is called before the custom font is active in the document, the canvas draws in the system fallback font (Arial, Helvetica, etc.) — and since the canvas is a pixel buffer, this fallback is also what gets exported.

**Why it happens:** `@font-face` fonts are downloaded asynchronously after the CSS is parsed. The React component tree mounts and Fabric.js initializes faster than the font fetch completes on first load.

**How to avoid:** Gate all canvas rendering behind `document.fonts.ready`. In practice: set `fontsReady: false` in Zustand, resolve to `true` in a `useEffect` after `await document.fonts.ready`, and render `<SlideCanvas>` components conditionally on `fontsReady`.

**Warning signs:** Exported PNGs look correct on retries (font cached) but wrong on first export; thumbnails show different font than main canvas; font weight appears regular even when bold is specified.

### Pitfall 3: pixelRatio Multiplying Canvas Size

**What goes wrong:** On high-DPI displays, Fabric.js may initialize with `pixelRatio: devicePixelRatio` (typically 2 on Retina/HiDPI screens), making the canvas buffer 2160x2160 while displaying at 1080x1080. Exported PNGs are 2160x2160 — double the Instagram-required 1080x1080.

**Why it happens:** Fabric.js `Canvas` constructor has historically respected `devicePixelRatio` in some configurations. The behavior has changed across versions.

**How to avoid:** Always explicitly pass `{ pixelRatio: 1 }` when initializing the canvas: `new Canvas(el, { width: 1080, height: 1080, pixelRatio: 1 })`. Verify with a test: `console.log(canvas.getWidth())` must return `1080`, not `2160`.

**Warning signs:** Exported images are 2160x2160; canvas visually looks fine but PNG dimensions are wrong; retina users get different export sizes than non-retina users.

### Pitfall 4: Fabric.js v6 vs v5 Import Syntax

**What goes wrong:** Tutorials and Stack Overflow answers for Fabric.js often use the v5 namespace pattern: `const text = new fabric.Text(...)`. In v6+, this import style is removed. Using v5 patterns with a v6 install produces `TypeError: fabric is not a constructor` or `Cannot read property 'Canvas' of undefined`.

**Why it happens:** Fabric.js v6 rewrote to ES modules with named exports. The global `fabric` namespace no longer exists.

**How to avoid:** Always import named classes: `import { Canvas, FabricText, Textbox, Rect, Line } from 'fabric'`.

### Pitfall 5: Object Origin Default Changes in Fabric.js v7

**What goes wrong:** Fabric.js v7 changed `originX`/`originY` defaults from `'left'`/`'top'` to `'center'`. All fixed-layout positioning code using absolute `left`/`top` coordinates would need to be rewritten, as objects would be placed from their center point instead of top-left.

**Why it happens:** v7 upgrade guide states this as "the only really annoying breaking change."

**How to avoid:** Pin to Fabric.js v6 (`^6.9.0`) for this phase. When v7 is adopted later, explicitly set `originX: 'left', originY: 'top'` on all placed objects.

### Pitfall 6: `## Color Scheme` Section is Absent in Real Output Files

**What goes wrong:** The `/science` skill was defined with `## Color Scheme` as a planned section, but both real test fixture files (`crispr-gene-editing.md` and `solar-fuel-conversion.md`) do NOT have this section. A parser that requires it will crash or produce broken state on every real file.

**Why it happens:** The `/science` skill `Color Scheme` feature was specified but not yet implemented in the current skill version (STATE.md: "DESIGN-05 pending").

**How to avoid:** Make `colors: ParsedCarousel.colors` nullable. If `## Color Scheme` is absent, silently fall back to `defaultDesign`. This is the common path, not the edge case.

---

## Code Examples

### Fabric.js v6 Named Import Pattern (VERIFIED)

```typescript
// Source: fabricjs.com/docs/upgrading/upgrading-to-fabric-60/
// This is the ONLY correct import style for v6+
import { Canvas, FabricText, Textbox, Rect, Line, Group } from 'fabric';

// NOT: import { fabric } from 'fabric'  ← v5 style, breaks in v6
// NOT: import fabric from 'fabric'      ← also wrong
```

### Tailwind CSS v4 + Vite Setup (VERIFIED)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css — entire file starts with this */
@import "tailwindcss";

/* @font-face declarations follow */
@font-face {
  font-family: 'Inter';
  font-display: block;
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
}
```

No `tailwind.config.js` or `postcss.config.js` needed for v4 with Vite.

### Zustand Store (v5 pattern, VERIFIED)

```typescript
// Source: Zustand 5 TypeScript usage
import { create } from 'zustand';  // NOT: import create from 'zustand' (v3 pattern)
```

### Canvas Dimensions Verification

```typescript
// After Canvas initialization, always verify:
const fc = new Canvas(el, { width: 1080, height: 1080, pixelRatio: 1 });
console.assert(fc.getWidth() === 1080, 'Canvas width must be 1080');
console.assert(fc.getHeight() === 1080, 'Canvas height must be 1080');
```

### HTML5 Drag and Drop (No External Library Needed)

```typescript
// Source: MDN HTML Drag and Drop API
function handleDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.md')) {
    setError('Please drop a .md file');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target?.result as string;
    useCarouselStore.getState().loadFile(text);
  };
  reader.readAsText(file);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import { fabric } from 'fabric'` | `import { Canvas, FabricText } from 'fabric'` | Fabric v6 (2024) | v5 namespace removed; named imports required |
| Fabric.js callback APIs | Promise-based async APIs | Fabric v6 (2024) | `loadSVGFromString()` etc. return Promises |
| `tailwind.config.js` + PostCSS | `@tailwindcss/vite` plugin + `@import "tailwindcss"` | Tailwind v4 (2025) | No config file needed; zero config setup |
| `import create from 'zustand'` | `import { create } from 'zustand'` | Zustand v4+ | Named export; default export removed |
| `canvas.setWidth()` / `canvas.setHeight()` | `canvas.setDimensions({ width, height })` | Fabric v7 | Removed in v7; use v6-compatible pattern |

**Deprecated/outdated:**
- `@types/fabric`: Fabric v6+ ships TypeScript types — do NOT install this package, it conflicts.
- `font-display: swap` in canvas fonts: Use `font-display: block` instead. `swap` causes the font to appear after an initial system-font render, which can trigger a second canvas repaint with the wrong glyph metrics already computed.

---

## Open Questions

1. **Font choice for the default template**
   - What we know: Self-hosted is required; canvas needs the font loaded before first render; Inter is a good base for body text
   - What's unclear: Which display/headline font pairs well with Inter for science editorial? Phase 6 handles named font pairings, but Phase 5 needs a single default font to ship.
   - Recommendation: Use Inter as the sole font for Phase 5 (variable font covers all weights). Phase 6 adds display font pairings. This is Claude's discretion per CONTEXT.md.

2. **Thumbnail canvas synchronization strategy**
   - What we know: Each thumbnail is a live mini Fabric.js canvas; thumbnails must mirror their full slide
   - What's unclear: How to keep thumbnails in sync when the slide data changes without running N full renders. Options: (a) each thumbnail re-renders when its slide data changes via Zustand subscription, (b) thumbnail canvases share object references with the main canvas.
   - Recommendation: Option (a) — each thumbnail canvas independently renders from the same slide data in Zustand. Thumbnails are small (200x200 before scaling), so render cost is low.

3. **Number of simultaneous Fabric.js instances**
   - What we know: Each live canvas requires its own Fabric `Canvas` instance; typical carousels are 5-7 slides
   - What's unclear: Whether 6-8 simultaneous Fabric instances causes memory/performance issues in the browser
   - Recommendation: 5-7 instances is well within browser limits. Profile only if thumbnails show visible slowness during navigation. No pre-optimization needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (included with Vite react-ts template) |
| Config file | `vite.config.ts` — vitest config co-located (`test: { environment: 'jsdom' }`) |
| Quick run command | `npm run test --run` from `carousel-ui/` |
| Full suite command | `npm run test --run --reporter=verbose` from `carousel-ui/` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOAD-01 | File drop event reads file content | unit | `npm run test --run -- parser` | Wave 0 |
| LOAD-02 | Parser extracts title, date, field, slide count | unit | `npm run test --run -- parseMarkdown` | Wave 0 |
| LOAD-03 | Parser extracts color scheme or falls back to defaultDesign | unit | `npm run test --run -- parseMarkdown` | Wave 0 |
| RNDR-01 | Canvas initializes at 1080x1080 with pixelRatio 1 | unit (jsdom) | `npm run test --run -- SlideCanvas` | Wave 0 |
| RNDR-02 | Store mutation triggers renderAll | unit | `npm run test --run -- store` | Wave 0 |
| RNDR-03 | Layout functions return correct object positions per role | unit | `npm run test --run -- layouts` | Wave 0 |
| RNDR-04 | Safe zone constants match spec (120/150/80) | unit | `npm run test --run -- constants` | Wave 0 |
| RNDR-05 | Safe zone overlay toggle changes object visibility | unit | `npm run test --run -- layouts` | Wave 0 |
| RNDR-06 | Thumbnail canvases mount for each slide | unit (jsdom) | `npm run test --run -- ThumbnailStrip` | Wave 0 |
| XPRT-01 | exportPng calls toDataURL with correct options | unit (mock canvas) | `npm run test --run -- exportPng` | Wave 0 |
| XPRT-02 | exportZip generates blob with correct file count | unit (mock JSZip) | `npm run test --run -- exportZip` | Wave 0 |
| XPRT-03 | Export preview fidelity (font/color match) | manual-only | visual inspection of exported PNG | N/A — no automated pixel comparison in scope |

### Sampling Rate

- **Per task commit:** `npm run test --run` (parser + store + export unit tests)
- **Per wave merge:** `npm run test --run --reporter=verbose` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `carousel-ui/src/parser/__tests__/parseMarkdown.test.ts` — covers LOAD-01, LOAD-02, LOAD-03
- [ ] `carousel-ui/src/canvas/__tests__/layouts.test.ts` — covers RNDR-03, RNDR-04, RNDR-05
- [ ] `carousel-ui/src/export/__tests__/exportPng.test.ts` — covers XPRT-01
- [ ] `carousel-ui/src/export/__tests__/exportZip.test.ts` — covers XPRT-02
- [ ] `carousel-ui/src/store/__tests__/useCarouselStore.test.ts` — covers RNDR-02
- [ ] `carousel-ui/vite.config.ts` — add `test: { environment: 'jsdom' }` block
- [ ] Framework install: `npm install -D vitest @vitest/ui jsdom @testing-library/react` from `carousel-ui/`

---

## Sources

### Primary (HIGH confidence)

- fabricjs.com/docs/upgrading/upgrading-to-fabric-60/ — v6 breaking changes, named imports, Promise API
- fabricjs.com/docs/upgrading/upgrading-to-fabric-70/ — v7 origin default change (why to stay on v6)
- tailwindcss.com/blog/tailwindcss-v4 — v4 Vite plugin setup, no config file
- npmjs.com/package/fabric — version confirmation (6.9.x as latest v6; 7.2.0 is latest overall)
- stuk.github.io/jszip — ZIP generation API, `generateAsync({ type: 'blob' })`
- fontfaceobserver.com — Promise-based font load detection
- MDN Web Docs: HTML Drag and Drop API — file drop event handling
- MDN Web Docs: document.fonts.ready — font loading gate

### Secondary (MEDIUM confidence)

- LogRocket blog — Fabric.js v6 + React `useRef`/`useEffect` initialization pattern (verified against official docs)
- GitHub fabricjs/fabric.js issues #4906, #5802 — toDataURL size behavior with pixelRatio (verified: use `multiplier: 1`, `pixelRatio: 1`)
- Tailwind CSS guides (dev.to, tailkits.com) — v4 Vite setup steps (verified against official tailwindcss.com docs)
- Zustand GitHub discussions — TypeScript slice pattern (verified against official zustand docs)

### Tertiary (LOW confidence)

- WebSearch: fabric 7.2.0 as npm latest — reported by search AI summary, not directly verified against npmjs.com (403 error)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via official docs or direct source
- Architecture: HIGH — patterns derived from official Fabric.js v6 upgrade docs + LogRocket tutorial cross-checked
- Pitfalls: HIGH — canvas taint, font loading, pixelRatio are documented issues in Fabric.js GitHub issues; confirmed by multiple sources
- Parser contract: HIGH — derived directly from reading canonical output files and output-sample.md

**Research date:** 2026-03-18
**Valid until:** 2026-05-18 (60 days — Fabric.js and Tailwind are stable; Zustand is very stable)

**Key finding from real output files:** Both `crispr-gene-editing.md` and `solar-fuel-conversion.md` (the test fixtures) have NO `## Color Scheme` section. The `defaultDesign` fallback is the normal case for current output files. The parser must treat `colors: null` as the happy path, not an error.
