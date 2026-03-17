# Stack Research

**Domain:** Local web UI — markdown-to-Instagram carousel image generator with design editor and PNG export
**Researched:** 2026-03-17
**Confidence:** HIGH (core architecture choices), MEDIUM (version numbers from npm registry via search results)

---

## Context: What Already Exists

The v1.0 skill pipeline (Claude Code SKILL.md + WebSearch/WebFetch tools) is **validated and untouched**. This stack covers only the new local web app: a browser-based tool that reads the markdown files produced by `/science` and exports 1080x1080 PNG carousel images.

The web app is a **standalone Vite project** that lives alongside the existing `.claude/` skill directory. It does not replace or modify the skill.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.x | Build tool + dev server | Fastest local dev experience — native ESM, near-instant HMR, no webpack config overhead. v8 (released Dec 2025) ships Rolldown fully integrated. `npm run dev` spins up in under 1 second for a project this size. |
| React | 19.2.x | UI framework | Hooks map cleanly to editor state (active slide, selected object, palette overrides). Fabric.js integrates via `useRef`/`useEffect`. No framework overhead needed — this is a single-page local tool, not a server app. |
| TypeScript | 5.x | Type safety | The carousel data model (slides array, color scheme, font pairing) is complex enough that untyped JS produces runtime errors when iterating over parsed markdown. Fabric.js v7 ships its own types. |
| Fabric.js | 7.2.x | Canvas rendering + full design editor | **The central architectural choice.** Fabric.js provides built-in: click-to-edit text, object selection with transform handles, layer ordering, `canvas.toDataURL()` for pixel-exact PNG export. Konva.js requires custom-building all of this from scratch. For a design editor (not a game engine), Fabric.js is the industry standard. |
| Tailwind CSS | 4.x | UI chrome styling | v4 integrates with Vite via `@tailwindcss/vite` — no `tailwind.config.js`, no PostCSS config, single CSS import. Used for the app shell (toolbars, panels, slide strip) — NOT for slide content (that lives on the Fabric.js canvas). |
| Zustand | 5.0.x | App-wide state | Stores parsed carousel data (slides, palette, fonts), active slide index, and selected Fabric object ID. v5 uses `useSyncExternalStore` natively — no providers, minimal boilerplate, correct behavior with React 19's concurrent rendering. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter from markdown | Extracts `color_scheme`, slide blocks, caption, and hashtags from the `/science` markdown output on file load. Battle-tested across Gatsby, Astro, VitePress — works in browser via Vite bundling with no config. |
| react-dropzone | 15.x | Drag & drop file input | `useDropzone` hook provides a zero-config drop zone for `.md` files. Fires callback with `File` object on drop or file dialog selection. 4,489 dependent packages — most-used React drop zone solution. |
| JSZip | 3.10.1 | Bundle exported PNGs into ZIP | Client-side ZIP generation. Accepts PNG blobs directly, generates a ZIP blob, which `file-saver` triggers as a browser download. Last release 2021 but stable and widely used. |
| file-saver | 2.x | Trigger browser file download | `saveAs(blob, filename)` — works for both single PNG downloads and the ZIP bundle. Handles cross-browser download behavior. |
| @fontsource/inter | 5.x | Self-hosted body/UI font | npm-installed fonts load reliably offline, no CDN round-trip during local dev. Inter is the highest-quality neutral sans for both UI chrome and slide body text. Import only the weights you need (`400.css`, `700.css`). |
| @fontsource/space-grotesk | 5.x | Self-hosted display font for slide headings | Geometric sans with distinctive character — adjacent to Kurzgesagt's style aesthetic. Pairs well with Inter for body. Available on Fontsource, MIT license. |
| FontFaceObserver | 2.x | Confirm fonts loaded before canvas render | Fabric.js draws text using `ctx.fillText` — if the font hasn't loaded yet, it falls back to system sans and the slide looks wrong on first render. FontFaceObserver provides a Promise that resolves when a named font is ready. Lightweight (1.4 kB). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@vitejs/plugin-react` | React Refresh + JSX transform | v6 uses Oxc for React Refresh — no Babel dependency, faster HMR than previous versions |
| `@tailwindcss/vite` | Tailwind v4 Vite integration | Replaces PostCSS config entirely — add to `vite.config.ts` plugins array |
| Vite `preview` | Serve production build locally | Use `npm run build && npm run preview` for final QA — ensures export behavior matches production |

---

## Installation

```bash
# Scaffold new Vite project (separate from existing skill files)
npm create vite@latest carousel-ui -- --template react-ts
cd carousel-ui

# Core canvas + state
npm install fabric zustand

# Markdown parsing
npm install gray-matter

# File I/O
npm install react-dropzone jszip file-saver
npm install -D @types/file-saver

# Fonts — self-hosted, no CDN dependency
npm install @fontsource/inter @fontsource/space-grotesk

# Font load detection (before canvas render)
npm install fontfaceobserver
npm install -D @types/fontfaceobserver

# Tailwind v4
npm install tailwindcss @tailwindcss/vite
```

**vite.config.ts:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css:**
```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/700.css";
@import "@fontsource/space-grotesk/700.css";
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Fabric.js 7 | Konva.js 9.x | If building a real-time animation tool or game — Konva's layered rendering is faster for 100s of animated objects. For a design editor with text fields and transform handles, Konva requires building text editing UX from scratch. Fabric.js provides it built-in. Not worth the custom-build investment here. |
| Fabric.js 7 | html-to-image (DOM capture) | If slides were pure HTML/CSS and "screenshot" export were acceptable. DOM capture is simpler to implement but produces non-deterministic output — font hinting, subpixel anti-aliasing, and CSS shadows render differently per browser. Canvas rendering is deterministic: 1080x1080 is exactly 1080x1080 every time. |
| Fabric.js 7 | Konva + html-to-image hybrid | A hybrid is two rendering models for one job. Adds complexity with no benefit over picking Fabric.js alone. |
| JSZip | client-zip | client-zip (2.6 kB gzipped) is 40x faster than JSZip for large batches. Use it if exporting 20+ images at once. For 5-7 carousel slides, JSZip's performance is imperceptible and has more usage documentation. |
| @fontsource/* | Google Fonts `@import` CDN | Works fine when online. Self-hosting via Fontsource is more reliable for a local-first tool that may be used offline or on a slow connection. No network request at dev time. |
| Zustand 5 | React Context + useReducer | Context is adequate for 1-2 slices. The editor has at least 4 independent state domains (parsed carousel data, active slide index, selected Fabric object, palette overrides) — Zustand avoids cascade re-renders and prop-drilling without redux ceremony. |
| Zustand 5 | Jotai | Jotai's atomic model works well for highly granular state. Zustand's slice-per-concern model maps more naturally to "document + editor session." Either would work; Zustand has more usage guidance for canvas editor patterns. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| html2canvas | Unmaintained since 2023. Known rendering bugs with custom fonts, CSS variables, and `border-radius`. 2025 comparisons consistently rank it worst for text fidelity. | Fabric.js canvas rendering — authoritative, not capture-based |
| dom-to-image (original) | Unmaintained. The maintained fork is `dom-to-image-more` but still SVG-based capture with cross-origin font restrictions that break when using self-hosted fonts. | Fabric.js |
| Fabric.js v5 or v6 | v5 has TypeScript coverage gaps. v6 is a major rewrite (ESM, Promises, new group system) that is breaking-level different from v5. Starting on v7 (the stable successor to v6) avoids a painful mid-project migration. | `fabric@7.2.x` |
| `@types/fabric` | These are v5-era community types, incompatible with Fabric.js v7 which ships its own built-in TypeScript declarations. Installing `@types/fabric` alongside `fabric@7` causes type conflicts. | Fabric.js v7's own bundled types |
| CSS-in-JS (styled-components, emotion) | Runtime style injection adds overhead and complexity for a local tool. Tailwind v4 handles all UI chrome without JavaScript style generation. | Tailwind CSS v4 |
| React Router / file-based routing | Zero routing needed — this is a single-page canvas editor. Adding a router adds bundle weight and config complexity for no benefit. | Zustand view-state flag (e.g. `activeView: 'editor' | 'export'`) |
| Next.js | Server rendering, App Router, and RSC add build complexity for a tool with no server, no SSR, and no API routes. | Vite + React |
| `window.devicePixelRatio` in export pass | On Retina displays this produces 2160x2160 output, not 1080x1080. For export, always pass `pixelRatio: 1` explicitly. | `canvas.toDataURL({ pixelRatio: 1, width: 1080, height: 1080 })` |

---

## Stack Patterns by Variant

**For 1080x1080 pixel-exact PNG export:**
- Fabric.js stage size: `width: 1080, height: 1080`
- Export call: `canvas.toDataURL({ format: 'png', pixelRatio: 1 })`
- Do NOT pass `window.devicePixelRatio` — that produces 2160px on Retina

**For rendering a Fabric.js canvas in React without Strict Mode double-mount bugs:**
```tsx
const canvasRef = useRef<HTMLCanvasElement>(null)
const fabricRef = useRef<fabric.Canvas | null>(null)
useEffect(() => {
  if (fabricRef.current) return  // Already mounted — skip double-invoke
  fabricRef.current = new fabric.Canvas(canvasRef.current!, { width: 1080, height: 1080 })
  return () => { fabricRef.current?.dispose(); fabricRef.current = null }
}, [])
```

**For loading fonts before first canvas render (avoid fallback font flash):**
```ts
import FontFaceObserver from 'fontfaceobserver'
const font = new FontFaceObserver('Space Grotesk')
await font.load()
canvas.renderAll()
```

**For driving initial palette from `/science` markdown frontmatter:**
- gray-matter extracts `color_scheme` YAML key on file drop
- Pass extracted hex values to Zustand `useCarouselStore`
- On slide mount, set Fabric.js object `fill` and `backgroundColor` from store values
- User overrides stored as separate `paletteOverride` slice — original parsed values preserved

**For slide navigation with 5-7 slides:**
- Store slides array in Zustand
- Only the *active* slide mounts a Fabric.js canvas — other slides show CSS thumbnail previews
- On slide switch: call `canvas.toDataURL()` to save current slide state as thumbnail, dispose canvas, mount new one

**For user-uploaded background images:**
- Use `FileReader.readAsDataURL()` to convert File to data URL
- Pass to `fabric.Image.fromURL()` — avoids CORS issues from external URLs

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| fabric@7.2.x | react@19.x, typescript@5.x | Fabric v7 bundles its own TypeScript types. Do NOT install `@types/fabric`. |
| react-dropzone@15.x | react@19.x | Requires React 16.8+ (hooks). No React 19 issues reported. |
| zustand@5.x | react@18.x, react@19.x | v5 dropped React <18. Uses native `useSyncExternalStore`. |
| tailwindcss@4.x | vite@8.x | Use `@tailwindcss/vite` plugin. Do NOT configure as a PostCSS plugin in v4 Vite projects — the new Vite-native plugin is the supported path. |
| jszip@3.10.x | Modern browsers | IE11 support dropped; irrelevant for local tool. |
| gray-matter@4.0.3 | Browser (via Vite bundle) | Designed for Node but works in browser when bundled by Vite. No special Vite config needed. |
| fontfaceobserver@2.x | All modern browsers | CSS Font Loading API alternative; Promise-based. Works regardless of how fonts are loaded (fontsource, CDN, or @font-face). |
| vite@8.x | node@20.19+, node@22.12+ | Vite 8 dropped support for Node < 20.19. Verify local Node version before scaffolding. |

---

## Kurzgesagt-Level Design Quality: What the Stack Enables

The visual quality target (Kurzgesagt-adjacent) requires:

1. **Consistent typography** — Fontsource bundles fonts into the app; FontFaceObserver ensures they're loaded before Fabric renders. No fallback font flash, no system font substitution.

2. **Color system fidelity** — Fabric.js sets exact hex values programmatically from the parsed frontmatter. No CSS variable inheritance or cascade issues.

3. **Pixel-exact export** — `canvas.toDataURL({ pixelRatio: 1 })` produces a binary-identical PNG every time, regardless of display DPI. Instagram displays 1080px natively; no upscaling artifacts.

4. **Font pairing** — Space Grotesk (headers) + Inter (body) is a modern, legible, distinctive combination. Both are available as Fontsource packages with full weight ranges.

5. **What this stack does NOT provide** — Motion, particle effects, or illustration-level visual complexity. Those require a design tool (Figma, Adobe). This stack produces clean, well-typeset, color-correct social cards — which is the right scope for an automated daily pipeline.

---

## Sources

- [Konva.js High-Quality Export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html) — pixelRatio export API confirmed (HIGH)
- [Konva.js Canvas Editor Demo](https://konvajs.org/docs/sandbox/Canvas_Editor.html) — editor scope confirmed (HIGH)
- [Fabric.js v6 Upgrade Guide](https://fabricjs.com/docs/upgrading/upgrading-to-fabric-60/) — ESM rewrite, TypeScript migration confirmed (HIGH)
- [Fabric.js Custom Font Loading Demo](https://fabricjs.com/demos/loading-custom-fonts/) — CSS Font Loader API pattern (HIGH)
- [Konva vs Fabric — React DEV comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan) — Fabric built-in text editing vs Konva manual confirmed (MEDIUM)
- [html-to-image npm](https://www.npmjs.com/package/html-to-image) — SVG-based capture approach, 1.6M monthly downloads (MEDIUM)
- [Tailwind CSS v4 Vite install](https://tailwindcss.com/docs) — `@tailwindcss/vite` plugin, no PostCSS needed (HIGH)
- [react-dropzone npm](https://www.npmjs.com/package/react-dropzone) — v15.x, `useDropzone` hook API (HIGH)
- [Zustand v5 announcement](https://pmnd.rs/blog/announcing-zustand-v5) — v5 drops React <18, uses `useSyncExternalStore` (HIGH)
- [Fontsource install docs](https://fontsource.org/docs/getting-started/install) — npm install + CSS import pattern (HIGH)
- [JSZip npm](https://www.npmjs.com/package/jszip) — v3.10.1, client-side blob support confirmed (HIGH)
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) — v4.0.3, YAML frontmatter parse (HIGH)
- WebSearch: fabric@7.2.0, react@19.2.x, vite@8.x, zustand@5.0.x — versions from npm registry data in search results (MEDIUM — no direct npm fetch)
- [img.ly Open-Source Design Editor SDKs comparison 2025](https://img.ly/blog/open-source-design-editor-sdks-a-developers-guide-to-choosing-the-right-solution/) — Fabric.js and Konva confirmed as primary canvas library options (MEDIUM)

---

*Stack research for: Local web UI — markdown to Instagram carousel image generator (v1.1)*
*Researched: 2026-03-17*
