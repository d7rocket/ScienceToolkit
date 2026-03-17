import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { useCarouselStore } from '../useCarouselStore';

const OUTPUT_DIR = resolve(__dirname, '..', '..', '..', '..', 'output');
const EXAMPLES_DIR = resolve(__dirname, '..', '..', '..', '..', 'examples');

const crisprText = readFileSync(resolve(OUTPUT_DIR, '2026-03-16-crispr-gene-editing.md'), 'utf-8');
const sampleText = readFileSync(resolve(EXAMPLES_DIR, 'output-sample.md'), 'utf-8');

// Reset store before each test
beforeEach(() => {
  useCarouselStore.setState({
    slides: [],
    meta: null,
    colors: { background: '#0B0E2D', primaryText: '#F0F0F5', accent: '#6C5CE7', highlight: '#00CEC9' },
    activeSlideIndex: 0,
    safezoneVisible: false,
    fontsReady: false,
    exportProgress: 0,
    exportError: null,
  });
});

describe('useCarouselStore', () => {
  describe('initial state', () => {
    it('has empty slides array', () => {
      const state = useCarouselStore.getState();
      expect(state.slides.length).toBe(0);
    });

    it('has meta as null', () => {
      const state = useCarouselStore.getState();
      expect(state.meta).toBeNull();
    });

    it('has colors equal to defaultDesign background #0B0E2D', () => {
      const state = useCarouselStore.getState();
      expect(state.colors.background).toBe('#0B0E2D');
    });

    it('has fontsReady as false', () => {
      const state = useCarouselStore.getState();
      expect(state.fontsReady).toBe(false);
    });
  });

  describe('loadFile with crispr content', () => {
    it('sets meta.slideCount to 6', () => {
      useCarouselStore.getState().loadFile(crisprText);
      const state = useCarouselStore.getState();
      expect(state.meta?.slideCount).toBe(6);
    });

    it('uses defaultDesign fallback (colors.background === #0B0E2D) when no Color Scheme', () => {
      useCarouselStore.getState().loadFile(crisprText);
      const state = useCarouselStore.getState();
      expect(state.colors.background).toBe('#0B0E2D');
    });

    it('resets activeSlideIndex to 0 after loading', () => {
      useCarouselStore.getState().setActiveSlide(3);
      useCarouselStore.getState().loadFile(crisprText);
      const state = useCarouselStore.getState();
      expect(state.activeSlideIndex).toBe(0);
    });
  });

  describe('loadFile with output-sample content', () => {
    it('sets colors.background from parsed Color Scheme (#0B0E2D)', () => {
      useCarouselStore.getState().loadFile(sampleText);
      const state = useCarouselStore.getState();
      expect(state.colors.background).toBe('#0B0E2D');
    });

    it('sets slides from parsed content', () => {
      useCarouselStore.getState().loadFile(sampleText);
      const state = useCarouselStore.getState();
      expect(state.slides.length).toBe(6);
    });
  });

  describe('setActiveSlide', () => {
    it('sets activeSlideIndex to 3', () => {
      useCarouselStore.getState().setActiveSlide(3);
      const state = useCarouselStore.getState();
      expect(state.activeSlideIndex).toBe(3);
    });
  });

  describe('toggleSafezone', () => {
    it('returns safezoneVisible to false after toggling twice', () => {
      useCarouselStore.getState().toggleSafezone();
      useCarouselStore.getState().toggleSafezone();
      const state = useCarouselStore.getState();
      expect(state.safezoneVisible).toBe(false);
    });

    it('sets safezoneVisible to true after one toggle', () => {
      useCarouselStore.getState().toggleSafezone();
      const state = useCarouselStore.getState();
      expect(state.safezoneVisible).toBe(true);
    });
  });
});
