import { Canvas, FabricText, Textbox, Rect } from 'fabric';
import type { ParsedSlide, ColorScheme } from '../types/carousel';
import {
  CANVAS_SIZE,
  SAFE_TOP,
  SAFE_BOTTOM,
  SAFE_SIDES,
  CONTENT_X,
  CONTENT_Y,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
} from './constants';

export function renderHookSlide(canvas: Canvas, slide: ParsedSlide, colors: ColorScheme): void {
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

  // Title — large, top of safe zone, centered
  const title = new FabricText(slide.title, {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 64,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y,
    width: CONTENT_WIDTH,
    textAlign: 'center',
    selectable: false,
    evented: false,
  });

  // Body — centered below title
  const body = new FabricText(slide.body, {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 28,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 300,
    width: CONTENT_WIDTH,
    textAlign: 'center',
    opacity: 0.8,
    selectable: false,
    evented: false,
  });

  canvas.add(bg, title, body);
  canvas.renderAll();
}

export function renderBodySlide(canvas: Canvas, slide: ParsedSlide, colors: ColorScheme): void {
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
  const badgeText = new FabricText(String(slide.index), {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 18,
    fill: '#ffffff',
    left: badgeLeft + (56 - 18) / 2,
    top: badgeTop + (32 - 18) / 2,
    selectable: false,
    evented: false,
  });

  // Title
  const title = new FabricText(slide.title, {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 40,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 30,
    width: CONTENT_WIDTH,
    selectable: false,
    evented: false,
  });

  // Body text
  const body = new Textbox(slide.body, {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 24,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CONTENT_Y + 140,
    width: CONTENT_WIDTH,
    opacity: 0.85,
    lineHeight: 1.5,
    selectable: false,
    evented: false,
  });

  canvas.add(bg, badge, badgeText, title, body);
  canvas.renderAll();
}

export function renderCtaSlide(canvas: Canvas, slide: ParsedSlide, colors: ColorScheme): void {
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
  const takeaway = new FabricText(slide.body, {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 36,
    fill: colors.primaryText,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 - 20,
    width: CONTENT_WIDTH,
    textAlign: 'left',
    selectable: false,
    evented: false,
  });

  // CTA line
  const cta = new FabricText('Follow for daily science drops', {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 22,
    fill: colors.accent,
    left: CONTENT_X,
    top: CANVAS_SIZE / 2 + 120,
    width: CONTENT_WIDTH,
    selectable: false,
    evented: false,
  });

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
    left: SAFE_SIDES,
    top: SAFE_TOP,
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
