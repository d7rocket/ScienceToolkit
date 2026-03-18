export interface ColorScheme {
  background: string;
  primaryText: string;
  accent: string;
  highlight: string;
}

export const defaultDesign: ColorScheme = {
  background: '#FAF8F4',
  primaryText: '#1A1714',
  accent: '#C8A96E',
  highlight: '#9E8C6A',
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

export interface FontPairing {
  name: string;
  headingFont: string;
  bodyFont: string;
}

export const FONT_PRESETS: FontPairing[] = [
  { name: 'Editorial',    headingFont: 'Fraunces',         bodyFont: 'Inter' },
  { name: 'Orbital',      headingFont: 'Space Grotesk',    bodyFont: 'Inter' },
  { name: 'Newsletter',   headingFont: 'DM Serif Display', bodyFont: 'DM Sans' },
  { name: 'Contemporary', headingFont: 'Syne',             bodyFont: 'Inter' },
];

export interface ColorPreset {
  name: string;
  scheme: ColorScheme;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Classic',     scheme: { background: '#FAF8F4', primaryText: '#1A1714', accent: '#C8A96E', highlight: '#9E8C6A' } },
  { name: 'Cosmos',      scheme: { background: '#0B0E2D', primaryText: '#F0F0F5', accent: '#6C5CE7', highlight: '#00CEC9' } },
  { name: 'Deep Ocean',  scheme: { background: '#0A1628', primaryText: '#E8F4FD', accent: '#0EA5E9', highlight: '#22D3EE' } },
  { name: 'Forest Lab',  scheme: { background: '#0D1F0D', primaryText: '#F0F7F0', accent: '#22C55E', highlight: '#A3E635' } },
  { name: 'Solar Flare', scheme: { background: '#1A0A00', primaryText: '#FFF7ED', accent: '#F97316', highlight: '#FBBF24' } },
];
