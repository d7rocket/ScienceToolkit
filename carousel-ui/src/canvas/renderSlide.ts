import { Canvas } from 'fabric';
import type { ParsedSlide, ColorScheme } from '../types/carousel';
import { renderHookSlide, renderBodySlide, renderCtaSlide } from './layouts';

export function renderSlide(canvas: Canvas, slide: ParsedSlide, colors: ColorScheme): void {
  switch (slide.role) {
    case 'hook': return renderHookSlide(canvas, slide, colors);
    case 'body': return renderBodySlide(canvas, slide, colors);
    case 'cta':  return renderCtaSlide(canvas, slide, colors);
  }
}
