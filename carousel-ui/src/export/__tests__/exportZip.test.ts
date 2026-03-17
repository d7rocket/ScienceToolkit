import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted so these are available inside vi.mock (which is hoisted by Vitest)
const mocks = vi.hoisted(() => {
  const mockFile = vi.fn();
  const mockFolder = vi.fn(() => ({ file: mockFile }));
  const mockGenerateAsync = vi
    .fn()
    .mockResolvedValue(new Blob(['zip-content'], { type: 'application/zip' }));
  return { mockFile, mockFolder, mockGenerateAsync };
});

vi.mock('jszip', () => {
  // Must use a regular function (not arrow) to be usable as a constructor
  function MockJSZip(this: { folder: typeof mocks.mockFolder; generateAsync: typeof mocks.mockGenerateAsync }) {
    this.folder = mocks.mockFolder;
    this.generateAsync = mocks.mockGenerateAsync;
  }
  return { default: MockJSZip };
});

import { exportAllSlidesAsZip, titleToSlug } from '../exportZip';

// Mock URL methods
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(globalThis, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock document methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockLink = {
  href: '',
  download: '',
  click: mockClick,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mockFolder.mockReturnValue({ file: mocks.mockFile });
  mocks.mockGenerateAsync.mockResolvedValue(
    new Blob(['zip-content'], { type: 'application/zip' }),
  );
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') return mockLink as unknown as HTMLElement;
    return document.createElement(tag);
  });
  vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
  vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

  // Mock fetch to return a blob
  globalThis.fetch = vi.fn().mockResolvedValue({
    blob: () => Promise.resolve(new Blob(['png-data'], { type: 'image/png' })),
  } as Response);
});

describe('exportAllSlidesAsZip', () => {
  const createMockCanvas = () => ({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  });

  it('calls onProgress with 50 after 1 of 2 slides and 100 after both', async () => {
    const canvases = [createMockCanvas(), createMockCanvas()];
    const onProgress = vi.fn();

    await exportAllSlidesAsZip(canvases as never, 'test-topic', onProgress);

    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100);
  });

  it('calls toDataURL with multiplier: 1 on each canvas', async () => {
    const canvas1 = createMockCanvas();
    const canvas2 = createMockCanvas();
    const onProgress = vi.fn();

    await exportAllSlidesAsZip([canvas1, canvas2] as never, 'test-topic', onProgress);

    expect(canvas1.toDataURL).toHaveBeenCalledWith({ format: 'png', multiplier: 1 });
    expect(canvas2.toDataURL).toHaveBeenCalledWith({ format: 'png', multiplier: 1 });
  });

  it('adds correctly named files to the ZIP', async () => {
    const canvases = [createMockCanvas(), createMockCanvas()];
    const onProgress = vi.fn();

    await exportAllSlidesAsZip(canvases as never, 'my-topic', onProgress);

    expect(mocks.mockFile).toHaveBeenCalledWith('slide-01.png', expect.anything());
    expect(mocks.mockFile).toHaveBeenCalledWith('slide-02.png', expect.anything());
  });

  it('triggers download and revokes the object URL', async () => {
    const canvases = [createMockCanvas()];
    const onProgress = vi.fn();

    await exportAllSlidesAsZip(canvases as never, 'my-topic', onProgress);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});

describe('titleToSlug', () => {
  it('converts title to lowercase slug', () => {
    expect(titleToSlug('CRISPR Gene Editing')).toBe('crispr-gene-editing');
  });

  it('removes special characters and colons', () => {
    expect(titleToSlug('CRISPR Gene Editing: Turning Bacteria')).toBe(
      'crispr-gene-editing-turning-bacteria',
    );
  });

  it('collapses multiple spaces into a single hyphen', () => {
    expect(titleToSlug('Hello   World')).toBe('hello-world');
  });

  it('removes apostrophes and punctuation', () => {
    expect(titleToSlug("Bacteria's Own Weapons")).toBe('bacterias-own-weapons');
  });
});
