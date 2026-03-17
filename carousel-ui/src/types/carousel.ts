export interface ColorScheme {
  background: string;
  primaryText: string;
  accent: string;
  highlight: string;
}

export const defaultDesign: ColorScheme = {
  background: '#0B0E2D',
  primaryText: '#F0F0F5',
  accent: '#6C5CE7',
  highlight: '#00CEC9',
};

export type SlideRole = 'hook' | 'body' | 'cta';

export interface ParsedSlide {
  index: number;
  role: SlideRole;
  title: string;
  body: string;
}

export interface CarouselMeta {
  title: string;
  date: string;
  field: string;
  slideCount: number;
}

export interface ParsedCarousel {
  title: string;
  date: string;
  field: string;
  sourceCount: number;
  slides: ParsedSlide[];
  colors: ColorScheme | null;
}
