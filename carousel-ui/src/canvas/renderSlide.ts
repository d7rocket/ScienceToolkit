import { Canvas } from 'fabric';
import type { ParsedSlide, ColorScheme, FontPairing } from '../types/carousel';
import { renderHookSlide, renderBodySlide, renderCtaSlide } from './layouts';

export function renderSlide(
  canvas: Canvas, slide: ParsedSlide, colors: ColorScheme,
  font: FontPairing, alignment: 'left' | 'center' | 'right' = 'left',
  interactive: boolean = false
): void {
  switch (slide.role) {
    case 'hook': return renderHookSlide(canvas, slide, colors, font, alignment, interactive);
    case 'body': return renderBodySlide(canvas, slide, colors, font, alignment, interactive);
    case 'cta':  return renderCtaSlide(canvas, slide, colors, font, alignment, interactive);
  }
}
