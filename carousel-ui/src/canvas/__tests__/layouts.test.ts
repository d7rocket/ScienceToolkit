import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Canvas } from 'fabric';
import type { ParsedSlide, ColorScheme, FontPairing } from '../../types/carousel';

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
    IText: makeClass(),
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

const mockFont: FontPairing = { name: 'Orbital', headingFont: 'Space Grotesk', bodyFont: 'Inter' };

describe('renderHookSlide', () => {
  it('calls canvas.clear() before canvas.add()', async () => {
    const { renderHookSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    const clearOrder: string[] = [];
    canvas.clear = vi.fn(() => { clearOrder.push('clear'); });
    canvas.add = vi.fn(() => { clearOrder.push('add'); });

    renderHookSlide(canvas, mockSlide, mockColors, mockFont, 'left', false);

    const clearIndex = clearOrder.indexOf('clear');
    const addIndex = clearOrder.indexOf('add');
    expect(clearIndex).toBeLessThan(addIndex);
  });

  it('calls canvas.renderAll()', async () => {
    const { renderHookSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderHookSlide(canvas, mockSlide, mockColors, mockFont, 'left', false);
    expect(canvas.renderAll).toHaveBeenCalled();
  });
});

describe('renderBodySlide', () => {
  it('calls canvas.add() with at least 4 objects (bg + title + body + badge)', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderBodySlide(canvas, mockBodySlide, mockColors, mockFont, 'left', false);
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
    renderCtaSlide(canvas, mockCtaSlide, mockColors, mockFont, 'left', false);
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

    renderSlide(canvas, { ...mockSlide, role: 'hook' }, mockColors, mockFont);
    expect(renderAllMock).toHaveBeenCalled();
    expect(clearMock).toHaveBeenCalled();
  });

  it('dispatches to renderBodySlide for role=body', async () => {
    const { renderSlide } = await import('../renderSlide');
    const canvas = makeMockCanvas();
    canvas.clear = clearMock;
    canvas.add = addMock;
    canvas.renderAll = renderAllMock;

    renderSlide(canvas, { ...mockBodySlide, role: 'body' }, mockColors, mockFont);
    expect(renderAllMock).toHaveBeenCalled();
  });

  it('dispatches to renderCtaSlide for role=cta', async () => {
    const { renderSlide } = await import('../renderSlide');
    const canvas = makeMockCanvas();
    canvas.clear = clearMock;
    canvas.add = addMock;
    canvas.renderAll = renderAllMock;

    renderSlide(canvas, { ...mockCtaSlide, role: 'cta' }, mockColors, mockFont);
    expect(renderAllMock).toHaveBeenCalled();
  });
});

describe('QUAL-01 geometric elements', () => {
  it('renderBodySlide adds accent bar and corner mark rects', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderBodySlide(canvas, mockBodySlide, mockColors, mockFont, 'left', false);
    const addMock = canvas.add as ReturnType<typeof vi.fn>;
    const allObjects = addMock.mock.calls.flat();
    // bg + badge + badgeText + title + accentBar + cornerH + cornerV + body = 8
    expect(allObjects.length).toBeGreaterThanOrEqual(8);
    // Check accent bar: 120px wide, 4px tall
    const accentBar = allObjects.find((o: any) => o.width === 120 && o.height === 4);
    expect(accentBar).toBeDefined();
    expect(accentBar.fill).toBe(mockColors.accent);
    // Check corner mark horizontal piece: 24px wide, 3px tall
    const cornerH = allObjects.find((o: any) => o.width === 24 && o.height === 3);
    expect(cornerH).toBeDefined();
  });

  it('renderHookSlide adds accent band and watermark', async () => {
    const { renderHookSlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderHookSlide(canvas, mockSlide, mockColors, mockFont, 'left', false);
    const addMock = canvas.add as ReturnType<typeof vi.fn>;
    const allObjects = addMock.mock.calls.flat();
    // Accent band: CONTENT_WIDTH wide, 6px tall
    const band = allObjects.find((o: any) => o.width === 920 && o.height === 6);
    expect(band).toBeDefined();
    expect(band.fill).toBe(mockColors.highlight);
    // Watermark: 96px fontSize, opacity 0.15
    const watermark = allObjects.find((o: any) => o.fontSize === 96 && o.opacity === 0.15);
    expect(watermark).toBeDefined();
  });
});

describe('EDIT-01 font parameterization', () => {
  it('renderBodySlide uses font.headingFont for title', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    const customFont: FontPairing = { name: 'Editorial', headingFont: 'Fraunces', bodyFont: 'Inter' };
    renderBodySlide(canvas, mockBodySlide, mockColors, customFont, 'left', false);
    const allObjects = (canvas.add as ReturnType<typeof vi.fn>).mock.calls.flat();
    const title = allObjects.find((o: any) => o.fontSize === 40);
    expect(title.fontFamily).toBe('Fraunces');
  });
});

describe('EDIT-05 alignment parameterization', () => {
  it('renderBodySlide applies alignment to title and body', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderBodySlide(canvas, mockBodySlide, mockColors, mockFont, 'center', false);
    const allObjects = (canvas.add as ReturnType<typeof vi.fn>).mock.calls.flat();
    const title = allObjects.find((o: any) => o.fontSize === 40);
    expect(title.textAlign).toBe('center');
    const body = allObjects.find((o: any) => o.fontSize === 24);
    expect(body.textAlign).toBe('center');
  });
});

describe('QUAL-02 font size verification', () => {
  it('hook title is 64px, body title is 40px, body text is 24px', async () => {
    const { renderHookSlide, renderBodySlide } = await import('../layouts');
    const hCanvas = makeMockCanvas();
    renderHookSlide(hCanvas, mockSlide, mockColors, mockFont, 'left', false);
    const hookObjs = (hCanvas.add as ReturnType<typeof vi.fn>).mock.calls.flat();
    const hookTitle = hookObjs.find((o: any) => o.text === 'Test Hook Title' && o.fontSize);
    expect(hookTitle.fontSize).toBe(64);

    const bCanvas = makeMockCanvas();
    renderBodySlide(bCanvas, mockBodySlide, mockColors, mockFont, 'left', false);
    const bodyObjs = (bCanvas.add as ReturnType<typeof vi.fn>).mock.calls.flat();
    const bodyTitle = bodyObjs.find((o: any) => o.fontSize === 40);
    expect(bodyTitle).toBeDefined();
    const bodyText = bodyObjs.find((o: any) => o.fontSize === 24);
    expect(bodyText).toBeDefined();
  });
});

describe('interactive flag', () => {
  it('non-interactive text objects have selectable:false', async () => {
    const { renderBodySlide } = await import('../layouts');
    const canvas = makeMockCanvas();
    renderBodySlide(canvas, mockBodySlide, mockColors, mockFont, 'left', false);
    const allObjects = (canvas.add as ReturnType<typeof vi.fn>).mock.calls.flat();
    const textObjs = allObjects.filter((o: any) => o.text !== undefined);
    textObjs.forEach((o: any) => {
      expect(o.selectable).toBe(false);
      expect(o.evented).toBe(false);
    });
  });
});
