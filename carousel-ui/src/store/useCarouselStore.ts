import { create } from 'zustand';
import { parseMarkdown } from '../parser/parseMarkdown';
import { defaultDesign, FONT_PRESETS } from '../types/carousel';
import type { CarouselMeta, ColorScheme, FontPairing, ParsedSlide } from '../types/carousel';

interface CarouselStore {
  slides: ParsedSlide[];
  meta: CarouselMeta | null;
  colors: ColorScheme;
  activeSlideIndex: number;
  safezoneVisible: boolean;
  fontsReady: boolean;
  exportProgress: number;
  exportError: string | null;
  selectedFontPreset: FontPairing;
  alignmentOverrides: Record<number, 'left' | 'center' | 'right'>;

  loadFile: (text: string) => void;
  setActiveSlide: (index: number) => void;
  toggleSafezone: () => void;
  setFontsReady: (ready: boolean) => void;
  setExportProgress: (pct: number) => void;
  setExportError: (err: string | null) => void;
  setFontPreset: (preset: FontPairing) => void;
  setColor: (role: keyof ColorScheme, value: string) => void;
  setColors: (scheme: ColorScheme) => void;
  setAlignment: (slideIndex: number, alignment: 'left' | 'center' | 'right') => void;
  updateSlide: (index: number, partial: Partial<ParsedSlide>) => void;
}

export const useCarouselStore = create<CarouselStore>((set) => ({
  slides: [],
  meta: null,
  colors: defaultDesign,
  activeSlideIndex: 0,
  safezoneVisible: false,
  fontsReady: false,
  exportProgress: 0,
  exportError: null,
  selectedFontPreset: FONT_PRESETS[0],
  alignmentOverrides: {},

  loadFile: (text: string) => {
    const parsed = parseMarkdown(text);
    set({
      slides: parsed.slides,
      meta: {
        title: parsed.title,
        date: parsed.date,
        field: parsed.field,
        slideCount: parsed.slides.length,
      },
      colors: parsed.colors ?? defaultDesign,
      activeSlideIndex: 0,
      exportProgress: 0,
      exportError: null,
      alignmentOverrides: {},
    });
  },

  setActiveSlide: (index: number) => set({ activeSlideIndex: index }),

  toggleSafezone: () => set((state) => ({ safezoneVisible: !state.safezoneVisible })),

  setFontsReady: (ready: boolean) => set({ fontsReady: ready }),

  setExportProgress: (pct: number) => set({ exportProgress: pct }),

  setExportError: (err: string | null) => set({ exportError: err }),

  setFontPreset: (preset: FontPairing) => set({ selectedFontPreset: preset }),

  setColor: (role: keyof ColorScheme, value: string) =>
    set((state) => ({ colors: { ...state.colors, [role]: value } })),

  setColors: (scheme: ColorScheme) => set({ colors: scheme }),

  setAlignment: (slideIndex: number, alignment: 'left' | 'center' | 'right') =>
    set((state) => ({
      alignmentOverrides: { ...state.alignmentOverrides, [slideIndex]: alignment },
    })),

  updateSlide: (index: number, partial: Partial<ParsedSlide>) =>
    set((state) => ({
      slides: state.slides.map((s, i) => (i === index ? { ...s, ...partial } : s)),
    })),
}));
