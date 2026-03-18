import { Canvas, FabricText, Textbox, Rect, IText } from 'fabric';
import type { ParsedSlide, ColorScheme, FontPairing } from '../types/carousel';
import {
  CANVAS_SIZE,
  CONTENT_X,
  CONTENT_Y,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
} from './constants';

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

export function renderHookSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean
): void {
  canvas.clear();

  // Background
  const bg = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    fill: colors.background,
    selectable: false,
    evented: false,
  });

  // Full-width accent band at top of safe zone
  const accentBand = new Rect({
    left: CONTENT_X,
    top: CONTENT_Y,
    width: CONTENT_WIDTH,
    height: 6,
    fill: colors.highlight,
    selectable: false,
    evented: false,
  });

  // Ghosted watermark "01" behind title
  const watermark = new FabricText('01', {
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 96,
    fill: colors.accent,
    opacity: 0.15,
    left: CANVAS_SIZE / 2 - 48,
    top: CONTENT_Y + 120,
    textAlign: 'center',
    selectable: false,
    evented: false,
  });

  // Title — large, below accent band, centered
  const title = makeText(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 64,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 48,
    width: CONTENT_WIDTH,
    textAlign: 'center',
  }, interactive);

  // Body — centered below title
  const body = makeText(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 28,
    fill: colors.highlight,
    left: CONTENT_X,
    top: CONTENT_Y + 300,
    width: CONTENT_WIDTH,
    textAlign: 'center',
    opacity: 1.0,
  }, interactive);

  canvas.add(bg, accentBand, watermark, title, body);
  canvas.renderAll();
}

export function renderBodySlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean
): void {
  canvas.clear();

  // Background
  const bg = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    fill: colors.background,
    selectable: false,
    evented: false,
  });

  // Badge background rect
  const badgeLeft = CONTENT_X + CONTENT_WIDTH - 80;
  const badgeTop = CONTENT_Y - 10;
  const badge = new Rect({
    left: badgeLeft,
    top: badgeTop,
    width: 56,
    height: 32,
    rx: 8,
    ry: 8,
    fill: colors.accent,
    selectable: false,
    evented: false,
  });

  // Badge text — centered over badge rect
  const badgeText = makeText(String(slide.index), {
    fontFamily: font.bodyFont,
    fontWeight: '700',
    fontSize: 18,
    fill: '#ffffff',
    left: badgeLeft + (56 - 18) / 2,
    top: badgeTop + (32 - 18) / 2,
  }, false);

  // Title
  const title = makeText(slide.title, {
    name: 'title',
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 40,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 30,
    width: CONTENT_WIDTH,
    textAlign: alignment,
  }, interactive);

  // Accent bar: 4px tall, 120px wide, below title
  const accentBar = new Rect({
    left: CONTENT_X,
    top: CONTENT_Y + 30 + 48 + 16,
    width: 120,
    height: 4,
    fill: colors.accent,
    selectable: false,
    evented: false,
  });

  // Corner mark: L-shape at top-right of content area
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

  // Body text
  const body = makeTextbox(slide.body, {
    name: 'body',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 24,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 140,
    width: CONTENT_WIDTH,
    opacity: 0.85,
    lineHeight: 1.5,
    textAlign: alignment,
  }, interactive);

  canvas.add(bg, badge, badgeText, title, accentBar, cornerH, cornerV, body);
  canvas.renderAll();
}

export function renderCtaSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right', interactive: boolean
): void {
  canvas.clear();

  // Background
  const bg = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    fill: colors.background,
    selectable: false,
    evented: false,
  });

  // Accent separator line
  const accentLine = new Rect({
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 - 40,
    width: 120,
    height: 4,
    fill: colors.accent,
    selectable: false,
    evented: false,
  });

  // Takeaway text
  const takeaway = makeText(slide.body, {
    name: 'body',
    fontFamily: font.headingFont,
    fontWeight: '700',
    fontSize: 36,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 - 20,
    width: CONTENT_WIDTH,
    textAlign: alignment,
  }, interactive);

  // CTA line — always non-interactive (fixed copy)
  const cta = makeText('Follow for daily science drops', {
    name: 'cta',
    fontFamily: font.bodyFont,
    fontWeight: '400',
    fontSize: 22,
    fill: colors.accent,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 + 120,
    width: CONTENT_WIDTH,
  }, false);

  canvas.add(bg, accentLine, takeaway, cta);
  canvas.renderAll();
}

export function renderSafezoneOverlay(canvas: Canvas, visible: boolean): void {
  // Find existing overlay by name
  const objects = canvas.getObjects();
  const existing = objects.find((obj) => (obj as { name?: string }).name === 'safezone-overlay');

  if (existing) {
    existing.set('visible', visible);
    canvas.renderAll();
    return;
  }

  // Create new overlay rect
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
