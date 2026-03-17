import { create } from 'zustand';
import { parseMarkdown } from '../parser/parseMarkdown';
import { defaultDesign } from '../types/carousel';
import type { CarouselMeta, ColorScheme, ParsedSlide } from '../types/carousel';

interface CarouselStore {
  slides: ParsedSlide[];
  meta: CarouselMeta | null;
  colors: ColorScheme;
  activeSlideIndex: number;
  safezoneVisible: boolean;
  fontsReady: boolean;
  exportProgress: number;
  exportError: string | null;

  loadFile: (text: string) => void;
  setActiveSlide: (index: number) => void;
  toggleSafezone: () => void;
  setFontsReady: (ready: boolean) => void;
  setExportProgress: (pct: number) => void;
  setExportError: (err: string | null) => void;
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
    });
  },

  setActiveSlide: (index: number) => set({ activeSlideIndex: index }),

  toggleSafezone: () => set((state) => ({ safezoneVisible: !state.safezoneVisible })),

  setFontsReady: (ready: boolean) => set({ fontsReady: ready }),

  setExportProgress: (pct: number) => set({ exportProgress: pct }),

  setExportError: (err: string | null) => set({ exportError: err }),
}));
