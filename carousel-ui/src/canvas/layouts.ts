import { Canvas, FabricText, Textbox, Rect } from 'fabric';
import type { ParsedSlide, ColorScheme, FontPairing } from '../types/carousel';
import {
  CANVAS_SIZE,
  CONTENT_X,
  CONTENT_Y,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
} from './constants';

// ─── Constants ─────────────────────────────────────────────────────────────────

// Vertical zone boundaries
const ZONE_TOP    = 160;  // below top row + margin
const ZONE_BOTTOM = 920;  // above dots
const ZONE_H      = ZONE_BOTTOM - ZONE_TOP;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function txt(
  text: string,
  options: Record<string, unknown>,
  interactive: boolean
): Textbox {
  return new Textbox(text, {
    ...options,
    selectable: interactive,
    evented: interactive,
    editable: interactive,
    splitByGrapheme: false,
  });
}

/** L-shaped corner marks at top-left and bottom-right of the slide. */
function addCornerMarks(canvas: Canvas, colors: ColorScheme): void {
  const ARM   = 120;
  const THICK = 5;
  const DOT   = 10;
  const S     = CANVAS_SIZE;
  const fill  = colors.accent;

  canvas.add(
    new Rect({ left: 0, top: 0, width: ARM, height: THICK, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: 0, top: 0, width: THICK, height: ARM, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: 0, top: 0, width: DOT, height: DOT, rx: DOT / 2, ry: DOT / 2, fill, opacity: 0.55, selectable: false, evented: false }),
    new Rect({ left: S - ARM, top: S - THICK, width: ARM, height: THICK, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: S - THICK, top: S - ARM, width: THICK, height: ARM, fill, opacity: 0.35, selectable: false, evented: false }),
    new Rect({ left: S - DOT, top: S - DOT, width: DOT, height: DOT, rx: DOT / 2, ry: DOT / 2, fill, opacity: 0.55, selectable: false, evented: false }),
  );
}

/** Slide number "02 — 06" right-aligned near the top. */
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
    top: 80,
    width: CONTENT_WIDTH,
    textAlign: 'right',
    selectable: false,
    evented: false,
  }));
}

/** Dot progress indicator + swipe hint at the bottom. */
function addBottomRow(
  canvas: Canvas,
  slide: ParsedSlide,
  colors: ColorScheme,
  totalSlides: number
): void {
  if (totalSlides <= 0) return;

  const DOT_H    = 14;
  const ACTIVE_W = 42;
  const GAP      = 10;
  const N        = totalSlides;
  const active   = slide.index - 1;

  const totalWidth = (N - 1) * DOT_H + ACTIVE_W + (N - 1) * GAP;
  let x = (CANVAS_SIZE - totalWidth) / 2;
  const Y = CANVAS_SIZE - 72;

  for (let i = 0; i < N; i++) {
    const isActive = i === active;
    const w = isActive ? ACTIVE_W : DOT_H;
    canvas.add(new Rect({
      left: x, top: Y, width: w, height: DOT_H,
      rx: DOT_H / 2, ry: DOT_H / 2,
      fill: colors.accent,
      opacity: isActive ? 1 : 0.2,
      selectable: false, evented: false,
    }));
    x += w + GAP;
  }

  if (slide.role !== 'cta' && totalSlides > 1) {
    canvas.add(new FabricText('swipe →', {
      fontFamily: 'Inter', fontWeight: '400', fontSize: 22,
      fill: colors.primaryText, opacity: 0.25,
      left: CONTENT_X, top: Y + 2, width: CONTENT_WIDTH, textAlign: 'right',
      selectable: false, evented: false,
    }));
  }
}

/**
 * Center a stack of objects vertically within [ZONE_TOP, ZONE_BOTTOM].
 * Each item: { obj, gap } where gap is the space above this item.
 * The first item's gap is ignored (offset from stack start).
 */
function centerStack(
  items: Array<{ obj: Textbox | Rect; gap: number }>
): void {
  // Total height = sum of obj heights + sum of gaps (skip first gap)
  const totalH = items.reduce((sum, item, i) => {
    return sum + item.obj.height + (i > 0 ? item.gap : 0);
  }, 0);

  const startY = ZONE_TOP + Math.max(0, (ZONE_H - totalH) / 2);

  let y = startY;
  for (let i = 0; i < items.length; i++) {
    if (i > 0) y += items[i].gap;
    items[i].obj.set({ top: y });
    y += items[i].obj.height;
  }
}

// ─── Layout functions ─────────────────────────────────────────────────────────

export function renderHookSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, _alignment: 'left' | 'center' | 'right', interactive: boolean,
  totalSlides: number = 0
): void {
  canvas.clear();

  canvas.add(new Rect({ left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, fill: colors.background, selectable: false, evented: false }));
  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  const title = txt(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontStyle: 'italic',
    fontWeight: '400',
    fontSize: 60,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    textAlign: 'center',
    lineHeight: 1.2,
  }, interactive);

  const rule = new Rect({
    left: CANVAS_SIZE / 2 - 40, top: 0,
    width: 80, height: 5, rx: 2, ry: 2,
    fill: colors.accent, selectable: false, evented: false,
  });

  const body = txt(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 30,
    fill: colors.highlight,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    textAlign: 'center',
    lineHeight: 1.55,
  }, interactive);

  centerStack([
    { obj: title, gap: 0 },
    { obj: rule,  gap: 28 },
    { obj: body,  gap: 24 },
  ]);

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

  canvas.add(new Rect({ left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, fill: colors.background, selectable: false, evented: false }));
  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  const title = txt(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 48,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    textAlign: alignment,
    lineHeight: 1.2,
  }, interactive);

  const rule = new Rect({
    left: CONTENT_X, top: 0,
    width: 80, height: 5, rx: 2, ry: 2,
    fill: colors.accent, selectable: false, evented: false,
  });

  const body = txt(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 28,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    opacity: 0.82,
    lineHeight: 1.6,
    textAlign: alignment,
  }, interactive);

  centerStack([
    { obj: title, gap: 0 },
    { obj: rule,  gap: 22 },
    { obj: body,  gap: 20 },
  ]);

  canvas.add(title, rule, body);
  addBottomRow(canvas, slide, colors, totalSlides);
  canvas.renderAll();
}

export function renderCtaSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean,
  totalSlides: number = 0
): void {
  canvas.clear();

  canvas.add(new Rect({ left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, fill: colors.background, selectable: false, evented: false }));
  addCornerMarks(canvas, colors);
  addTopRow(canvas, slide, font, colors, totalSlides);

  const rule = new Rect({
    left: CONTENT_X, top: 0,
    width: 80, height: 5, rx: 2, ry: 2,
    fill: colors.accent, selectable: false, evented: false,
  });

  const takeaway = txt(slide.body, {
    name: 'body',
    fontFamily: font.headingFont,
    fontStyle: 'italic',
    fontWeight: '400',
    fontSize: 44,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    lineHeight: 1.25,
    textAlign: alignment,
  }, interactive);

  const cta = txt('Follow for daily science drops', {
    name: 'cta',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 26,
    fill: colors.accent,
    left: CONTENT_X,
    top: 0,
    width: CONTENT_WIDTH,
    textAlign: alignment,
    selectable: false, evented: false,
  }, false);

  centerStack([
    { obj: rule,     gap: 0 },
    { obj: takeaway, gap: 24 },
    { obj: cta,      gap: 36 },
  ]);

  canvas.add(rule, takeaway, cta);
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
