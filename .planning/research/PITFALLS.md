# Pitfalls Research

**Domain:** Browser-based carousel image generator — HTML/CSS to PNG rendering, design editor, drag-and-drop file loading, ZIP export
**Researched:** 2026-03-17
**Confidence:** HIGH (verified against official MDN docs, library GitHub issues, community post-mortems, and multiple 2025 sources)

---

## Critical Pitfalls

### Pitfall 1: Fonts Not Loaded When Canvas Renders

**What goes wrong:**
The render library captures the DOM before external fonts (Google Fonts, system fonts) have finished loading. The resulting PNG uses the browser fallback font (usually Times New Roman or serif) instead of the intended typeface. The slide preview looks correct on screen — because the DOM has already rendered — but the exported PNG looks wrong. This is the FOIT/FOUT problem transposed into image export.

**Why it happens:**
html-to-image and html2canvas both capture the DOM at the moment `toDataURL()` or `toPng()` is called. If a Google Fonts stylesheet is linked via a `link` tag and the font file has not finished downloading, the canvas is captured with the fallback. Developers test locally where fonts are cached and never observe the bug, then ship to a fresh browser where it fails on first load.

**How to avoid:**
Use the `document.fonts.ready` promise before triggering any render. For Google Fonts specifically, also use the `FontFace` API to explicitly load the font file and add it to `document.fonts` before the first render. For html-to-image, pass a `fontEmbedCSS` option or pre-embed font data as base64. Test font rendering in a Private/Incognito window (empty cache) on every release. Do not rely on CSS `font-display: swap` — it explicitly defers font loading and will cause this bug.

**Warning signs:**
- Export looks different from the live preview in the design editor
- PNG shows serif fallback font where a sans-serif design font was specified
- Bug only reproducible in incognito / fresh browser session, not during development
- Intermittent failures that resolve on page refresh

**Phase to address:**
Phase 1 (Renderer Foundation) — font loading must be a solved problem before any design editor work begins, because all subsequent visual testing depends on correct font rendering.

---

### Pitfall 2: HiDPI / Retina Produces Blurry PNG Output

**What goes wrong:**
The exported 1080x1080 PNG looks crisp on the screen preview but blurry when posted to Instagram or viewed at full resolution. The canvas is rendered at CSS pixel dimensions (e.g. 540px on a 2x display) instead of physical pixels, producing a physically half-resolution image that gets upscaled and looks blurry.

**Why it happens:**
HTML Canvas ignores `devicePixelRatio` by default. If a user is on a retina display (devicePixelRatio = 2), a canvas declared at 1080x1080 CSS pixels has 540x540 physical pixels of actual drawing area. When exported, that 540x540 bitmap is what becomes the PNG, not the intended 1080x1080.

**How to avoid:**
Always multiply canvas dimensions by `window.devicePixelRatio` and scale the context accordingly. For html-to-image, pass `pixelRatio: 2` (or higher) in the options to force a known output resolution regardless of screen DPI. Verify final PNG dimensions by opening the exported file in an image viewer: it must report 1080x1080 pixels (not 540x540 or 2160x2160). Lock to `pixelRatio: 2` rather than using `devicePixelRatio` dynamically — dynamic values make output device-dependent.

**Warning signs:**
- PNG looks soft or slightly blurry at 100% zoom in an image editor
- Image resolution reported by macOS Preview / Windows Photos is 540x540 instead of 1080x1080
- Export looks fine on non-retina displays but blurry on MacBook Pro / iPhone preview

**Phase to address:**
Phase 1 (Renderer Foundation) — set and lock `pixelRatio: 2` as a constant from day one. Do not defer this or it will require retroactive audit of all exported test images.

---

### Pitfall 3: Canvas Tainted by Cross-Origin Resources (Export Silently Fails)

**What goes wrong:**
`canvas.toDataURL()` or the html-to-image export function throws a `SecurityError: The canvas has been tainted by cross-origin data` or silently returns a blank/corrupted PNG. This happens when any resource drawn into the canvas — an image, a background from a CSS url(), or a font — was loaded from a different origin without CORS headers.

**Why it happens:**
The browser's security model prevents reading pixel data back from a canvas once cross-origin content has been drawn into it. The app loads a background image or a Google Fonts CSS file, everything looks fine visually, but `toDataURL()` is blocked. With html-to-image (which uses SVG foreignObject internally), this is even more restrictive: external resources inside foreignObject are blocked by most browsers regardless of CORS headers.

**How to avoid:**
Keep all assets local. Bundle any fonts as base64 data URIs in the app rather than loading from Google Fonts CDN at export time. For background images, load them via `fetch()` with `mode: 'cors'`, convert to base64 blob URLs, and inject those into the DOM before rendering — never reference external URLs directly. Use `crossOrigin="anonymous"` on any `img` tags AND ensure the server sends `Access-Control-Allow-Origin: *`. In html-to-image, set `fetchRequestInit` to `{ mode: 'cors' }`. Test export from a localhost origin with an external image; confirm no SecurityError.

**Warning signs:**
- `SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement'` in the console
- Exported PNG is blank or returns a corrupted data URI
- Works in development (same-origin assets) but breaks in production (CDN-hosted assets)
- Bug only surfaces when a background image URL is set

**Phase to address:**
Phase 1 (Renderer Foundation) — the asset loading strategy must be decided here. Committing to local/base64 assets prevents this class of bug entirely.

---

### Pitfall 4: CSS Property Support Gap in html-to-image

**What goes wrong:**
Slides render correctly in the browser but certain CSS properties are silently ignored or produce incorrect output in the exported PNG: `backdrop-filter`, `filter`, CSS blend modes (`mix-blend-mode`), `clip-path` on non-rectangular shapes, `text-shadow` on certain elements, and `border-image`. The exported image looks like a degraded version of the preview.

**Why it happens:**
html-to-image renders via SVG foreignObject, which passes DOM content to the browser's SVG renderer. The SVG renderer does not support all CSS properties that the HTML renderer does. Similarly, html2canvas maintains its own reimplementation of CSS rendering that has known gaps, particularly around filters, blend modes, and advanced typography features.

**How to avoid:**
Restrict the design system to CSS properties that are confirmed to work in both the preview and export renderers. Before building the design editor, create a test slide that exercises every CSS property you plan to support, export it, and verify the export matches the preview pixel-for-pixel. Avoid: `backdrop-filter` (not supported in SVG foreignObject), `mix-blend-mode` (partial support), CSS `filter` on parent elements containing text (causes bleed). Use flat color fills, `box-shadow` (not blur-heavy), `border-radius`, `background-color`, and `color` — these are universally safe.

**Warning signs:**
- Glassmorphism / frosted glass effects look correct in preview but flat in export
- Gradient text renders correctly on screen but exports as transparent or solid
- Drop shadows appear different between preview and export
- Any use of `filter: blur()` as a design element

**Phase to address:**
Phase 1 (Renderer Foundation) — define the "safe CSS subset" upfront. Phase 2 (Design Editor) must work within this subset; do not let the editor expose unsupported properties to users.

---

### Pitfall 5: Drag-and-Drop Opens File in Browser Instead of Loading It

**What goes wrong:**
The user drags a markdown file from their file manager and drops it anywhere on the page — but not precisely on the drop zone. The browser navigates away from the app and opens the raw `.md` file as a text document, losing the current session state. There is no error message, just a sudden page navigation.

**Why it happens:**
The browser's built-in drop behavior for text files is to open them. `preventDefault()` on the `dragover` and `drop` events only blocks navigation when the event fires on an element that has those handlers registered. If the user accidentally drops on the body, a sidebar, or any element outside the designated drop zone, the event bubbles to `window` where the default behavior fires.

**How to avoid:**
Register `dragover` and `drop` event listeners on `document` (not just the drop zone element) and call `preventDefault()` on both. This blocks the browser navigation globally. Show a full-viewport drag overlay when any file is dragged over the window (`dragenter` on `document`) so the user knows where to drop. Dismiss the overlay on `dragleave` from `document` or on `drop`. Additionally, register `beforeunload` to warn if the user somehow navigates away with unsaved design state.

**Warning signs:**
- Tested only with precise drops on the drop zone; never tested drops on adjacent UI elements
- Missing `dragover` handler on `document` — only on the drop target
- Any `dragover` handler that does not call `e.preventDefault()`

**Phase to address:**
Phase 3 (Drag-and-Drop Loading) — implement document-level `preventDefault()` first, test with deliberately imprecise drops before shipping.

---

### Pitfall 6: ZIP Export Blocks the Main Thread and Appears to Hang

**What goes wrong:**
The user clicks "Export All as ZIP." The browser freezes for 3–8 seconds with no feedback, then either produces the ZIP or crashes the tab. With 7 slides at 1080x1080 each, the in-memory PNG data can reach 15–30 MB before compression. JSZip runs synchronously on the main thread unless explicitly moved to a worker.

**Why it happens:**
JSZip's `generateAsync()` returns a Promise, but if `streamFiles` is not enabled, it builds the entire compressed archive in memory before resolving. For large binary files, the compression loop still executes synchronously in large chunks that block the event loop. Developers test with small files and do not notice the hang until they try all 7 slides at full resolution.

**How to avoid:**
Use JSZip's `generateAsync({ type: 'blob', streamFiles: true })` with a progress callback to show a progress indicator. Implement per-slide download as a fallback (individual PNG download buttons) so users are never blocked if ZIP generation is slow. Cap the number of slides that can be exported at once (7 is the project max, which is safe, but validate this assumption with actual file size measurements before launch).

**Warning signs:**
- ZIP export tested only with 1–2 slides; never with all 7 at full resolution
- No progress feedback during export — the button goes unresponsive
- Tab crash or "page unresponsive" dialog on export

**Phase to address:**
Phase 4 (Export) — always implement per-slide PNG download before ZIP export. Treat ZIP as an enhancement, not a primary export path.

---

### Pitfall 7: "Looks Like PowerPoint" — Generic Visual Output

**What goes wrong:**
The exported slides look like a default Canva template: plain centered text on a solid-colored background, generic sans-serif font, equal padding on all sides, no visual hierarchy between headline and body. The Kurzgesagt-quality bar requires deliberate design decisions that are not defaults in any CSS-based renderer.

**Why it happens:**
Browser-native text rendering does not produce editorial-quality typography by default. Centering all text, using equal font sizes, and picking one accent color produces flat, corporate-looking output. The design system defaults matter enormously — if the starting template is generic, most users will leave it generic because the editor feels good enough.

**How to avoid:**
Invest in a strong default template with deliberate design choices: a large-weight display font for headlines (e.g. Inter Black or DM Sans Bold 700+) paired with a lighter weight for body text, a deliberately constrained color palette derived from a base hue (not a generic blue or gradient), intentional whitespace asymmetry, and a visual element on each slide beyond text (a rule line, a large number, a bold background shape). The default template IS the product quality — spend design iteration time here before building the editor. Key reference: high-contrast palette, bold block colors, oversized key facts, minimal clutter.

**Warning signs:**
- Default template has text centered both horizontally and vertically on a white background
- Font size difference between headline and body is less than 1.5x
- No visual element on any slide except text and background color
- The design looks like a presentation slide rather than an Instagram post

**Phase to address:**
Phase 2 (Design System / Default Template) — the default template must be production-quality before the editor is built. The editor enhances a good default; it does not rescue a bad one.

---

### Pitfall 8: Markdown Parsing Breaks on Real Output Files

**What goes wrong:**
The markdown parser handles simple test cases but fails silently on the actual YAML-frontmatter format produced by the `/science` skill. Slide delimiters, frontmatter blocks, special characters in scientific terms (μ, ±, ², β), and Unicode citation characters cause the parser to emit empty slides, corrupt the slide count, or produce garbled text in the preview.

**Why it happens:**
Test files use simple, clean markdown. Real `/science` output includes YAML frontmatter (`---` delimiter), slide number labels (`**SLIDE 1:**`), inline bold/italic, citation parentheticals with special Unicode, and DOI URLs with special characters. A markdown parser that handles basic CommonMark may not handle the project's specific output format correctly.

**How to avoid:**
Parse real output files from day one, not synthetic test content. Load `output/2026-03-16-crispr-gene-editing.md` (the actual first output) as the primary test fixture. Write the markdown parser against the documented output schema in the project's output sample, not against generic markdown. Test with: YAML frontmatter, Unicode scientific symbols, bold/italic, numbered slide labels, long citation strings, and short slides. Fail loudly on unrecognized format — show an error banner rather than rendering incorrect slide content.

**Warning signs:**
- Parser tested only with hand-crafted minimal markdown
- Slide count from parser does not match the slide delimiters in the source file
- YAML frontmatter appears as text in slide 1 instead of being stripped
- Unicode characters (μ, ², ±) appear as replacement characters or question marks in the render

**Phase to address:**
Phase 3 (Drag-and-Drop Loading / Markdown Parser) — load the real output file as the acceptance test, not a toy example.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use `devicePixelRatio` dynamically instead of locking `pixelRatio: 2` | Adapts to display DPI | Output resolution varies by device; inconsistent exports | Never — lock to a constant for reproducible output |
| Reference Google Fonts via CDN link instead of embedding as base64 | Smaller bundle size | Canvas tainting on export; CORS failures in some environments | Never for the export renderer — embed fonts |
| Use html2canvas instead of html-to-image | More documentation, larger community | Slower, no built-in pixelRatio option, active bugs on text rendering | Only if html-to-image has a specific confirmed blocker |
| ZIP without progress indicator | Simpler code | Appears to hang on 7 full-resolution slides; users think it crashed | Never — at minimum show a spinner |
| Default template is generic placeholder | Faster to build | Users never change defaults; product looks generic at launch | Never — default template IS the product |
| Parse markdown lazily (silently show raw text on error) | Fewer edge cases to handle | Corrupt renders that look plausible but contain garbled science content | Never — fail loudly with an error message |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| html-to-image | Call `toPng()` immediately on mount | Wait for `document.fonts.ready` AND all image loads before calling `toPng()` |
| html-to-image + SVG foreignObject | Include external URLs in CSS | Pre-fetch all external assets, convert to base64 data URIs before rendering |
| JSZip | Use default `generateAsync()` with no progress | Use `streamFiles: true` + `onUpdate` callback to show progress |
| Drag-and-drop File API | Register handler only on drop zone element | Register `preventDefault` on `document` for both `dragover` and `drop` |
| Google Fonts at export time | Load font via link stylesheet | Load font via `FontFace` API and add to `document.fonts`; embed as base64 in export renderer |
| Canvas `toDataURL()` | Call after any external image draw | Ensure all images are loaded from same origin or converted to blob URLs with CORS |
| Browser File API | Read `dataTransfer.files` in `dragenter` | Files list only available in `drop` event; `dragenter` files are in a protected mode |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all 7 slides to PNG simultaneously | UI freeze; tab crash on low-memory devices | Render slides sequentially with progress indicator; never in parallel | At 7 slides × ~3–4 MB each = ~25 MB peak memory |
| Rebuilding the render DOM on every editor change | 500ms+ lag on slider adjustments | Debounce design editor inputs (150–300ms); only re-render on commit, not on every keypress | Immediately — font size sliders especially |
| Storing full PNG data URIs in component state | React re-render cascade; memory pressure | Store PNG blobs, not data URIs; revoke blob URLs after ZIP creation | At 7 slides — data URIs are large strings |
| Parsing markdown on every keystroke if text editing is added | Visible lag in text editor | Parse once on file load; only re-parse on explicit content change | As soon as live text editing is implemented |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting any dropped file without extension validation | Non-markdown files parsed and rendered; potential for confusing output | Validate file extension is `.md` before reading; show a clear error for other types |
| Injecting parsed markdown HTML directly into the DOM without sanitization | Crafted `.md` files with embedded HTML tags could inject scripts | Use a markdown renderer that sanitizes output (e.g. DOMPurify post-parse, or a renderer with sanitization built in) |
| Persisting slide content to localStorage unnecessarily | Not a high risk for science content, but unnecessary persistence of user data | Keep slide content in session-only state; no need to persist between page loads |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during font loading | User sees wrong font in preview, reports it as a bug | Show a loading state in the preview until `document.fonts.ready` resolves |
| Export button is the only way to see full-res output | User exports 7 slides before noticing a typo; exports are wasted | Show a full-screen preview modal at 1080x1080 before export |
| Design editor exposes every possible CSS control | Cognitive overload; users make slides worse, not better | Constrain editor to: background color, text color, font weight, font size (bounded range), padding (3 presets) |
| No undo for design changes | User accidentally changes color palette; no way back | Implement simple undo stack (Ctrl+Z); even 10 steps of undo prevents frustration |
| ZIP downloads with generic slide filenames | `slide-1.png`, `slide-2.png` are meaningless filenames | Name files after the topic: `crispr-gene-editing-slide-1.png` (derived from markdown filename) |
| Slide text verbosity carried from markdown into image | 150-char body slides are too long for Instagram images | Warn (not block) if slide text exceeds ~80 characters; flag as "may not fit at this font size" |

---

## "Looks Done But Isn't" Checklist

- [ ] **Font rendering:** Preview looks correct with intended fonts — verify in a fresh Private/Incognito window with network throttling to catch FOIT
- [ ] **Export resolution:** Exported PNG "looks 1080x1080" — open in image editor and confirm pixel dimensions are exactly 1080x1080, not 540x540
- [ ] **CORS / canvas security:** Export works with a background image set — verify by setting a local image as background and confirming export succeeds without SecurityError
- [ ] **CSS parity:** Export matches the preview — verify by comparing a screenshot of the preview with the exported PNG at the same zoom level; look for font, shadow, and color differences
- [ ] **Drag-and-drop safety:** Drop zone works correctly — test by deliberately dropping a file onto a non-drop-zone area of the page (header, sidebar, empty space); browser must not navigate away
- [ ] **ZIP export completeness:** ZIP downloads — verify by opening the ZIP and confirming all slides are present and not blank/corrupted
- [ ] **Real markdown parsing:** Slides render correctly — load `output/2026-03-16-crispr-gene-editing.md` specifically (not a test file) and verify slide count, YAML frontmatter is stripped, Unicode renders correctly
- [ ] **Text overflow:** Slides look fine in design — test the longest body slide text at the smallest supported font size; confirm text does not overflow the 1080x1080 boundary in the export

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Fonts not loaded on export | LOW | Add `document.fonts.ready` gate before render call; test in incognito |
| Blurry PNG output discovered after feature is built | MEDIUM | Add `pixelRatio: 2` to html-to-image call; re-test all exported sample slides |
| Canvas tainted from external image | MEDIUM | Audit all external URL references; convert to base64 blob URLs; re-test export |
| CSS property not supported in export (e.g. glassmorphism) | HIGH | Remove unsupported CSS from design system; redesign affected templates; update design editor to hide unsupported options |
| Drag-and-drop navigation bug reported by user | LOW | Add document-level `preventDefault` handlers immediately; one-line fix |
| Default template looks generic at launch | HIGH | Requires design iteration time; cannot be patched quickly — must be caught in Phase 2 |
| ZIP hangs with no feedback | LOW | Add `onUpdate` progress callback to JSZip call; show progress bar |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Fonts not loaded when canvas renders | Phase 1: Renderer Foundation | Export with empty font cache (incognito); verify correct typeface appears |
| HiDPI/Retina blurry PNG | Phase 1: Renderer Foundation | Open exported PNG in image editor; confirm 1080x1080 pixel dimensions |
| Canvas tainted by cross-origin resources | Phase 1: Renderer Foundation | Set a local background image; confirm `toDataURL()` does not throw |
| CSS property support gap | Phase 1: Renderer Foundation | Build CSS test slide; export; compare preview vs. export |
| Generic/template-y visual output | Phase 2: Design System | Show exported slides to a non-technical reviewer and ask "would you follow this account?" |
| Real markdown parsing failures | Phase 3: Drag-and-Drop | Load actual output file as acceptance test; not a synthetic fixture |
| Drag-and-drop browser navigation bug | Phase 3: Drag-and-Drop | Test by dropping file on non-drop-zone areas; confirm no navigation |
| ZIP export hangs | Phase 4: Export | Test ZIP with all 7 slides; measure time; confirm progress indicator shows |
| Text overflow in export | Phase 2: Design System | Render longest slide text at minimum font size; confirm no overflow |

---

## Sources

- html-to-image npm page and known issues: [https://www.npmjs.com/package/html-to-image](https://www.npmjs.com/package/html-to-image)
- html2canvas CORS issue thread: [https://github.com/niklasvh/html2canvas/issues/1544](https://github.com/niklasvh/html2canvas/issues/1544)
- Tainted canvas explanation (Corsfix): [https://corsfix.com/blog/tainted-canvas](https://corsfix.com/blog/tainted-canvas)
- MDN — Cross-origin images in canvas: [https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)
- Canvas HiDPI rendering on retina displays (Kirupa): [https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm](https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm)
- Konva.js high-quality export documentation: [https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html)
- html2canvas blurry retina issue #390: [https://github.com/niklasvh/html2canvas/issues/390](https://github.com/niklasvh/html2canvas/issues/390)
- Best HTML to Canvas Solutions 2025 (portalZINE): [https://portalzine.de/best-html-to-canvas-solutions-in-2025/](https://portalzine.de/best-html-to-canvas-solutions-in-2025/)
- Replacing html2canvas with html-to-image (Better Programming): [https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf](https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf)
- JSZip limitations documentation: [https://stuk.github.io/jszip/documentation/limitations.html](https://stuk.github.io/jszip/documentation/limitations.html)
- JSZip memory consumption issue #135: [https://github.com/Stuk/jszip/issues/135](https://github.com/Stuk/jszip/issues/135)
- MDN File drag and drop API: [https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)
- Drag-and-drop cross-browser differences (leonadler): [https://github.com/leonadler/drag-and-drop-across-browsers](https://github.com/leonadler/drag-and-drop-across-browsers)
- MDN CanvasRenderingContext2D textRendering: [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textRendering](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textRendering)
- Instagram carousel design mistakes (Haute Stock): [https://hautestock.co/instagram-carousel-design-mistakes-to-avoid/](https://hautestock.co/instagram-carousel-design-mistakes-to-avoid/)
- SVG foreignObject restrictions (Semisignal): [https://semisignal.com/rendering-web-content-to-image-with-svg-foreign-object/](https://semisignal.com/rendering-web-content-to-image-with-svg-foreign-object/)

---
*Pitfalls research for: Carousel image generator web UI (Project Pleiades v1.1)*
*Researched: 2026-03-17*
