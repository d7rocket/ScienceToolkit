import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ParsedSlide, ColorScheme, FontPairing } from '../../types/carousel';

// Mock Fabric.js Canvas
vi.mock('fabric', () => {
  const makeClass = () =>
    class {
      [key: string]: unknown;
      constructor(arg1?: unknown, arg2?: unknown) {
        if (typeof arg1 === 'string') {
          Object.assign(this, { text: arg1 }, arg2 ?? {});
        } else {
          Object.assign(this, arg1 ?? {});
        }
      }
      set(key: string, value: unknown) { this[key] = value; }
      add(..._args: unknown[]) {}
      clear() {}
      renderAll() {}
      dispose() {}
      getObjects() { return []; }
    };

  return {
    Canvas: makeClass(),
    FabricText: makeClass(),
    Textbox: makeClass(),
    Rect: makeClass(),
  };
});

// Mock renderSlide
vi.mock('../../canvas/renderSlide', () => ({
  renderSlide: vi.fn(),
}));

// Mock canvasRegistry
vi.mock('../../canvas/canvasRegistry', () => ({
  registerCanvas: vi.fn(),
  unregisterCanvas: vi.fn(),
  canvasRegistry: new Map(),
  getAllCanvases: vi.fn(() => []),
}));

// Mock exportSlideAsPng to avoid actual download in tests
vi.mock('../../export/exportPng', () => ({
  exportSlideAsPng: vi.fn(),
}));

const mockSetActiveSlide = vi.fn();

const mockSlides: ParsedSlide[] = [
  { index: 1, role: 'hook', title: 'CRISPR Hook', body: 'Hook body text' },
  { index: 2, role: 'body', title: 'Body Slide', body: 'Body content' },
  { index: 3, role: 'cta', title: 'CTA Slide', body: 'Follow us' },
];

const mockColors: ColorScheme = {
  background: '#0B0E2D',
  primaryText: '#F0F0F5',
  accent: '#6C5CE7',
  highlight: '#00CEC9',
};

const mockFont: FontPairing = { name: 'Orbital', headingFont: 'Space Grotesk', bodyFont: 'Inter' };

vi.mock('../../store/useCarouselStore', () => ({
  useCarouselStore: vi.fn((selector?: (s: object) => unknown) => {
    const state = {
      slides: mockSlides,
      colors: mockColors,
      activeSlideIndex: 0,
      setActiveSlide: mockSetActiveSlide,
      selectedFontPreset: mockFont,
      alignmentOverrides: {},
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  }),
}));

import { ThumbnailStrip } from '../ThumbnailStrip';

describe('ThumbnailStrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3 thumbnail containers when slides has 3 items', () => {
    render(<ThumbnailStrip />);
    // Each slide has a navigation button (title="Slide N") plus a PNG download button
    // Total buttons: 3 nav + 3 PNG = 6
    const thumbnails = screen.getAllByRole('button');
    expect(thumbnails).toHaveLength(6);
    // Verify the per-slide nav buttons by their title attribute
    expect(screen.getByTitle('Slide 1')).toBeTruthy();
    expect(screen.getByTitle('Slide 2')).toBeTruthy();
    expect(screen.getByTitle('Slide 3')).toBeTruthy();
  });

  it('renders null (or empty) when slides is empty', async () => {
    const { useCarouselStore } = await import('../../store/useCarouselStore');
    vi.mocked(useCarouselStore).mockImplementation((selector?: (s: object) => unknown) => {
      const state = {
        slides: [],
        colors: mockColors,
        activeSlideIndex: 0,
        setActiveSlide: mockSetActiveSlide,
        selectedFontPreset: mockFont,
        alignmentOverrides: {},
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });

    const { container } = render(<ThumbnailStrip />);
    expect(container.firstChild).toBeNull();
  });

  it('clicking a thumbnail calls setActiveSlide with the correct index', async () => {
    const { useCarouselStore } = await import('../../store/useCarouselStore');
    vi.mocked(useCarouselStore).mockImplementation((selector?: (s: object) => unknown) => {
      const state = {
        slides: mockSlides,
        colors: mockColors,
        activeSlideIndex: 0,
        setActiveSlide: mockSetActiveSlide,
        selectedFontPreset: mockFont,
        alignmentOverrides: {},
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });

    render(<ThumbnailStrip />);
    // Click the second slide nav button directly by title
    const secondSlideBtn = screen.getByTitle('Slide 2');
    fireEvent.click(secondSlideBtn);
    expect(mockSetActiveSlide).toHaveBeenCalledWith(1);
  });

  it('the active thumbnail has a visual distinction', async () => {
    const { useCarouselStore } = await import('../../store/useCarouselStore');
    vi.mocked(useCarouselStore).mockImplementation((selector?: (s: object) => unknown) => {
      const state = {
        slides: mockSlides,
        colors: mockColors,
        activeSlideIndex: 0,
        setActiveSlide: mockSetActiveSlide,
        selectedFontPreset: mockFont,
        alignmentOverrides: {},
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });

    render(<ThumbnailStrip />);
    // The first slide nav button is the active one (activeSlideIndex: 0)
    const activeThumb = screen.getByTitle('Slide 1');
    // Active thumb should have aria-selected or a class with ring/active
    const isDistinct =
      activeThumb.getAttribute('aria-selected') === 'true' ||
      activeThumb.className.includes('ring') ||
      activeThumb.className.includes('active') ||
      activeThumb.className.includes('border');
    expect(isDistinct).toBe(true);
  });
});
