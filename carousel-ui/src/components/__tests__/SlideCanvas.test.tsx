import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mutable containers for mock functions that vi.mock factories can reference
// via module-level object literals (vitest hoists vi.mock calls, so we must NOT
// reference variables declared after the call — use object literals instead).

vi.mock('fabric', () => {
  // Local mock fns — exported via module-level reference after mock setup
  return {
    Canvas: class MockCanvas {
      add = vi.fn();
      clear = vi.fn();
      renderAll = vi.fn();
      dispose = vi.fn();
      setDimensions = vi.fn();
      getObjects = vi.fn(() => []);
    },
    IText: class MockIText {
      text: string;
      name?: string;
      on = vi.fn();
      off = vi.fn();
      constructor(text: string, opts: Record<string, unknown> = {}) {
        this.text = text;
        this.name = opts.name as string | undefined;
      }
    },
    FabricText: class {
      constructor(_text?: string, _opts?: Record<string, unknown>) {}
    },
    Textbox: class {
      constructor(_text?: string, _opts?: Record<string, unknown>) {}
    },
    Rect: class {
      constructor(_opts?: Record<string, unknown>) {}
    },
  };
});

vi.mock('../../canvas/renderSlide', () => ({
  renderSlide: vi.fn(),
}));

vi.mock('../../canvas/layouts', () => ({
  renderSafezoneOverlay: vi.fn(),
}));

vi.mock('../../store/useCarouselStore', () => {
  const updateSlide = vi.fn();
  const state = {
    slides: [{ index: 1, role: 'hook' as const, title: 'Test Title', body: 'Test Body' }],
    colors: { background: '#000', primaryText: '#fff', accent: '#6C5CE7', highlight: '#00CEC9' },
    activeSlideIndex: 0,
    safezoneVisible: false,
    fontsReady: true,
    exportProgress: 0,
    exportError: null,
    selectedFontPreset: { name: 'Orbital', headingFont: 'Space Grotesk', bodyFont: 'Inter' },
    alignmentOverrides: {},
    updateSlide,
    setActiveSlide: vi.fn(),
    toggleSafezone: vi.fn(),
    setFontsReady: vi.fn(),
    setExportProgress: vi.fn(),
    setExportError: vi.fn(),
    loadFile: vi.fn(),
    setFontPreset: vi.fn(),
    setColor: vi.fn(),
    setColors: vi.fn(),
    setAlignment: vi.fn(),
  };

  const useCarouselStore = (selector?: (s: typeof state) => unknown) => {
    if (typeof selector === 'function') return selector(state);
    return state;
  };
  useCarouselStore.getState = () => state;

  return { useCarouselStore };
});

// Import after all mocks are set up
import { IText } from 'fabric';
import { attachEditingHandlers } from '../SlideCanvas';
import { useCarouselStore } from '../../store/useCarouselStore';

describe('attachEditingHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-assign updateSlide mock to getState so it's fresh each test
    const state = (useCarouselStore as unknown as { getState: () => { updateSlide: ReturnType<typeof vi.fn> } }).getState();
    state.updateSlide = vi.fn();
  });

  it('commits title text to store when title IText editing exits', () => {
    const titleObj = new IText('Original Title', { name: 'title' });
    const mockGetObjects = vi.fn(() => [titleObj]);

    const { updateSlide } = (useCarouselStore as unknown as { getState: () => { updateSlide: ReturnType<typeof vi.fn> } }).getState();

    attachEditingHandlers(
      { getObjects: mockGetObjects } as unknown as Parameters<typeof attachEditingHandlers>[0],
      updateSlide,
      () => 0
    );

    // Find the handler registered on titleObj.on('editing:exited', ...)
    const calls = (titleObj.on as ReturnType<typeof vi.fn>).mock.calls;
    const editingExitedCall = calls.find((c: unknown[]) => c[0] === 'editing:exited');
    expect(editingExitedCall).toBeTruthy();

    // Simulate editing:exited by updating text and firing the handler
    titleObj.text = 'Edited Title';
    const handler = editingExitedCall![1] as () => void;
    handler();

    expect(updateSlide).toHaveBeenCalledWith(0, { title: 'Edited Title' });
  });

  it('commits body text to store when body IText editing exits', () => {
    const bodyObj = new IText('Original Body', { name: 'body' });
    const mockGetObjects = vi.fn(() => [bodyObj]);

    const { updateSlide } = (useCarouselStore as unknown as { getState: () => { updateSlide: ReturnType<typeof vi.fn> } }).getState();

    attachEditingHandlers(
      { getObjects: mockGetObjects } as unknown as Parameters<typeof attachEditingHandlers>[0],
      updateSlide,
      () => 2
    );

    const calls = (bodyObj.on as ReturnType<typeof vi.fn>).mock.calls;
    const editingExitedCall = calls.find((c: unknown[]) => c[0] === 'editing:exited');
    expect(editingExitedCall).toBeTruthy();

    bodyObj.text = 'Edited Body';
    const handler = editingExitedCall![1] as () => void;
    handler();

    expect(updateSlide).toHaveBeenCalledWith(2, { body: 'Edited Body' });
  });

  it('does not attach handler to non-title/body objects (e.g. name cta)', () => {
    const ctaObj = new IText('Follow for daily science drops', { name: 'cta' });
    const mockGetObjects = vi.fn(() => [ctaObj]);

    const { updateSlide } = (useCarouselStore as unknown as { getState: () => { updateSlide: ReturnType<typeof vi.fn> } }).getState();

    attachEditingHandlers(
      { getObjects: mockGetObjects } as unknown as Parameters<typeof attachEditingHandlers>[0],
      updateSlide,
      () => 0
    );

    // ctaObj.on should NOT have been called with 'editing:exited'
    const calls = (ctaObj.on as ReturnType<typeof vi.fn>).mock.calls;
    const editingExitedCall = calls.find((c: unknown[]) => c[0] === 'editing:exited');
    expect(editingExitedCall).toBeUndefined();
    expect(updateSlide).not.toHaveBeenCalled();
  });
});
