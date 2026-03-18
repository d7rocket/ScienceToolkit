import { Canvas, FabricText, Textbox, Rect, IText } from 'fabric';
import type { ParsedSlide, ColorScheme, FontPairing } from '../types/carousel';
import {
  CANVAS_SIZE,
  CONTENT_X,
  CONTENT_Y,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
  CONTENT_BOTTOM,
} from './constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeText(
  text: string,
  options: Record<string, unknown>,
  interactive: boolean
) {
  if (interactive) {
    return new IText(text, { ...options, selectable: true, evented: true, editable: true });
  }
  return new FabricText(text, { ...options, selectable: false, evented: false });
}

function makeTextbox(
  text: string,
  options: Record<string, unknown>,
  interactive: boolean
) {
  if (interactive) {
    return new IText(text, { ...options, selectable: true, evented: true, editable: true });
  }
  return new Textbox(text, { ...options, selectable: false, evented: false });
}

/** L-shaped corner marks at top-left and bottom-right of the slide (matching reference HTML). */
function addCornerMarks(canvas: Canvas, colors: ColorScheme): void {
  const ARM = 120;   // arm length in px (scaled from reference 48px @ 420px → 123px @ 1080px)
  const THICK = 5;   // arm thickness
  const DOT = 10;    // accent dot at the corner joint
  const S = CANVAS_SIZE;
  const fill = colors.accent;

  // Top-left
  canvas.add(
    new Rect({ left: 0, top: 0, width: ARM, height: THICK, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: 0, top: 0, width: THICK, height: ARM, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: 0, top: 0, width: DOT, height: DOT, rx: DOT / 2, ry: DOT / 2, fill, opacity: 0.55, selectable: false, evented: false }),
  );

  // Bottom-right (rotated 180° = mirrored to opposite corner)
  canvas.add(
    new Rect({ left: S - ARM, top: S - THICK, width: ARM, height: THICK, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: S - THICK, top: S - ARM, width: THICK, height: ARM, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: S - DOT, top: S - DOT, width: DOT, height: DOT, rx: DOT / 2, ry: DOT / 2, fill, opacity: 0.55, selectable: false, evented: false }),
  );
}

/** Slide number "02 — 06" right-aligned at the top. */
function addTopRow(
  canvas: Canvas,
  slide: ParsedSlide,
  font: FontPairing,
  colors: ColorScheme,
  totalSlides: number
): void {
  const numStr = totalSlides > 0
    ? `${String(slide.index).padStart(2, '0')} — ${String(totalSlides).padStart(2, '0')}`
    : String(slide.index).padStart(2, '0');

  canvas.add(new FabricText(numStr, {
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 26,
    fill: colors.primaryText,
    opacity: 0.45,
    left: CONTENT_X,
    top: 82,
    width: CONTENT_WIDTH,
    textAlign: 'right',
    selectable: false,
    evented: false,
  }));
}

/** Dot progress indicator at the bottom. Active dot is a pill; others are circles. */
function addBottomRow(
  canvas: Canvas,
  slide: ParsedSlide,
  colors: ColorScheme,
  totalSlides: number
): void {
  if (totalSlides <= 0) return;

  const DOT_H = 14;        // dot height (and width for inactive)
  const ACTIVE_W = 42;     // active pill width
  const GAP = 10;
  const N = totalSlides;
  const activeIdx = slide.index - 1; // 0-based

  // Total width: N-1 inactive dots + 1 active pill + gaps
  const totalWidth = (N - 1) * DOT_H + ACTIVE_W + (N - 1) * GAP;
  let x = (CANVAS_SIZE - totalWidth) / 2;
  const Y = CANVAS_SIZE - 72;

  for (let i = 0; i < N; i++) {
    const isActive = i === activeIdx;
    const w = isActive ? ACTIVE_W : DOT_H;
    canvas.add(new Rect({
      left: x,
      top: Y,
      width: w,
      height: DOT_H,
      rx: DOT_H / 2,
      ry: DOT_H / 2,
      fill: colors.accent,
      opacity: isActive ? 1 : 0.2,
      selectable: false,
      evented: false,
    }));
    x += w + GAP;
  }

  // "swipe →" hint on non-last slides
  if (slide.role !== 'cta' && totalSlides > 1) {
    canvas.add(new FabricText('swipe →', {
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: 22,
      fill: colors.primaryText,
      opacity: 0.25,
      left: CONTENT_X,
      top: Y + 2,
      width: CONTENT_WIDTH,
      textAlign: 'right',
      selectable: false,
      evented: false,
    }));
  }
}

// ─── Layout functions ─────────────────────────────────────────────────────────

export function renderHookSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean,
  totalSlides: number = 0
): void {
  canvas.clear();

  // Background
  canvas.add(new Rect({
    left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE,
    fill: colors.background, selectable: false, evented: false,
  }));

  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  // Large italic title — vertically centered in upper half
  const title = makeText(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontStyle: 'italic',
    fontWeight: '400',
    fontSize: 64,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: 300,
    width: CONTENT_WIDTH,
    textAlign: 'center',
  }, interactive);

  // Accent rule below title
  const rule = new Rect({
    left: CANVAS_SIZE / 2 - 40,
    top: 490,
    width: 80,
    height: 5,
    rx: 2, ry: 2,
    fill: colors.accent,
    selectable: false, evented: false,
  });

  // Body text in highlight color
  const body = makeText(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 33,
    fill: colors.highlight,
    left: CONTENT_X,
    top: 530,
    width: CONTENT_WIDTH,
    textAlign: 'center',
  }, interactive);

  canvas.add(title, rule, body);
  addBottomRow(canvas, slide, colors, totalSlides);
  canvas.renderAll();
}

export function renderBodySlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean,
  totalSlides: number = 0
): void {
  canvas.clear();

  // Background
  canvas.add(new Rect({
    left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE,
    fill: colors.background, selectable: false, evented: false,
  }));

  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  // Title
  const title = makeText(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 52,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 20,
    width: CONTENT_WIDTH,
    textAlign: alignment,
  }, interactive);

  // Accent bar: 80px wide × 5px — below title
  const accentBar = new Rect({
    left: CONTENT_X,
    top: CONTENT_Y + 20 + 66 + 20,
    width: 80,
    height: 5,
    rx: 2, ry: 2,
    fill: colors.accent,
    selectable: false, evented: false,
  });

  // Body text
  const body = makeTextbox(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 32,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 140,
    width: CONTENT_WIDTH,
    opacity: 0.8,
    lineHeight: 1.6,
    textAlign: alignment,
  }, interactive);

  canvas.add(title, accentBar, body);
  addBottomRow(canvas, slide, colors, totalSlides);
  canvas.renderAll();
}

export function renderCtaSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean,
  totalSlides: number = 0
): void {
  canvas.clear();

  // Background
  canvas.add(new Rect({
    left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE,
    fill: colors.background, selectable: false, evented: false,
  }));

  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  // Accent separator
  const accentLine = new Rect({
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 - 60,
    width: 80,
    height: 5,
    rx: 2, ry: 2,
    fill: colors.accent,
    selectable: false, evented: false,
  });

  // Takeaway text
  const takeaway = makeText(slide.body, {
    name: 'body',
    fontFamily: font.headingFont,
    fontStyle: 'italic',
    fontWeight: '400',
    fontSize: 44,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 - 20,
    width: CONTENT_WIDTH,
    textAlign: alignment,
  }, interactive);

  // CTA line
  const cta = makeText('Follow for daily science drops', {
    name: 'cta',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 28,
    fill: colors.accent,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 + 180,
    width: CONTENT_WIDTH,
    textAlign: alignment,
    selectable: false, evented: false,
  }, false);

  canvas.add(accentLine, takeaway, cta);
  addBottomRow(canvas, slide, colors, totalSlides);
  canvas.renderAll();
}

export function renderSafezoneOverlay(canvas: Canvas, visible: boolean): void {
  const objects = canvas.getObjects();
  const existing = objects.find((obj) => (obj as { name?: string }).name === 'safezone-overlay');

  if (existing) {
    existing.set('visible', visible);
    canvas.renderAll();
    return;
  }

  const overlay = new Rect({
    left: CONTENT_X,
    top: CONTENT_Y,
    width: CONTENT_WIDTH,
    height: CONTENT_HEIGHT,
    stroke: '#6C5CE7',
    fill: '',
    strokeWidth: 2,
    strokeDashArray: [8, 4],
    evented: false,
    selectable: false,
    visible,
  });
  (overlay as { name?: string }).name = 'safezone-overlay';
  canvas.add(overlay);
  canvas.renderAll();
}
