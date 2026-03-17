import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Canvas } from 'fabric';
import type { ParsedSlide, ColorScheme } from '../../types/carousel';

vi.mock('fabric', () => {
  const makeClass = (extra: object = {}) =>
    class {
      [key: string]: unknown;
      constructor(arg1: unknown, arg2?: unknown) {
        if (typeof arg1 === 'string') {
          Object.assign(this, { text: arg1 }, arg2 ?? {}, extra);
        } else {
          Object.assign(this, arg1 ?? {}, extra);
        }
      }
      set(key: string, value: unknown) { this[key] = value; }
    };

  return {
    Canvas: makeClass(),
    FabricText: makeClass(),
    Textbox: makeClass(),
    Rect: makeClass(),
  };
});

const makeMockCanvas = () => ({
  clear: vi.fn(),
  add: vi.fn(),
  renderAll: vi.fn(),
  getObjects: vi.fn().mockReturnValue([]),
  set: vi.fn(),
} as unknown as Canvas);

const mockSlide: ParsedSlide = {
  index: 1,
  role: 'hook',
  title: 'Test Hook Title',
  body: 'Test body text',
};

const mockBodySlide: ParsedSlide = {
  index: 2,
  role: 'body',
  title: 'Body Slide Title',
  body: 'Body slide content',
};

const mockCtaSlide: ParsedSlide = {
  index: 6,
  role: 'cta',
  title: 'CTA Title',
  body: 'Takeaway sentence here',
};

const mockColors: ColorScheme = {
  background: '#0B0E2D',
  primaryText: '#F0F0F5',
  accent: '#6C5CE7',
  highlight: '#00CEC9',
};

describe('renderHookSlide', () => {
  it('calls canvas.clear() before canvas.add()', async () => {
    const { renderHookSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    const clearOrder: string[] = [];
    canvas.clear = vi.fn(() => { clearOrder.push('clear'); });
    canvas.add = vi.fn(() => { clearOrder.push('add'); });

    renderHookSlide(canvas, mockSlide, mockColors);

    const clearIndex = clearOrder.indexOf('clear');
    const addIndex = clearOrder.indexOf('add');
    expect(clearIndex).toBeLessThan(addIndex);
  });

  it('calls canvas.renderAll()', async () => {
    const { renderHookSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderHookSlide(canvas, mockSlide, mockColors);
    expect(canvas.renderAll).toHaveBeenCalled();
  });
});

describe('renderBodySlide', () => {
  it('calls canvas.add() with at least 4 objects (bg + title + body + badge)', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderBodySlide(canvas, mockBodySlide, mockColors);
    // canvas.add may be called once with multiple spread args or multiple times
    const addMock = canvas.add as ReturnType<typeof vi.fn>;
    const totalObjects = addMock.mock.calls.reduce((sum, call) => sum + call.length, 0);
    expect(totalObjects).toBeGreaterThanOrEqual(4);
  });
});

describe('renderCtaSlide', () => {
  it('calls canvas.renderAll()', async () => {
    const { renderCtaSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderCtaSlide(canvas, mockCtaSlide, mockColors);
    expect(canvas.renderAll).toHaveBeenCalled();
  });
});

describe('renderSlide dispatch', () => {
  let clearMock: ReturnType<typeof vi.fn>;
  let addMock: ReturnType<typeof vi.fn>;
  let renderAllMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearMock = vi.fn();
    addMock = vi.fn();
    renderAllMock = vi.fn();
  });

  it('dispatches to renderHookSlide for role=hook', async () => {
    const { renderSlide } = await import('../renderSlide');
    const canvas = makeMockCanvas();
    canvas.clear = clearMock;
    canvas.add = addMock;
    canvas.renderAll = renderAllMock;

    renderSlide(canvas, { ...mockSlide, role: 'hook' }, mockColors);
    expect(renderAllMock).toHaveBeenCalled();
    expect(clearMock).toHaveBeenCalled();
  });

  it('dispatches to renderBodySlide for role=body', async () => {
    const { renderSlide } = await import('../renderSlide');
    const canvas = makeMockCanvas();
    canvas.clear = clearMock;
    canvas.add = addMock;
    canvas.renderAll = renderAllMock;

    renderSlide(canvas, { ...mockBodySlide, role: 'body' }, mockColors);
    expect(renderAllMock).toHaveBeenCalled();
  });

  it('dispatches to renderCtaSlide for role=cta', async () => {
    const { renderSlide } = await import('../renderSlide');
    const canvas = makeMockCanvas();
    canvas.clear = clearMock;
    canvas.add = addMock;
    canvas.renderAll = renderAllMock;

    renderSlide(canvas, { ...mockCtaSlide, role: 'cta' }, mockColors);
    expect(renderAllMock).toHaveBeenCalled();
  });
});
