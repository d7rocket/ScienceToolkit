import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSlideAsPng } from '../exportPng';

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
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') return mockLink as unknown as HTMLElement;
    return document.createElement(tag);
  });
  vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
  vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
});

describe('exportSlideAsPng', () => {
  const mockCanvas = {
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  };

  it('calls canvas.toDataURL with format: png and multiplier: 1', () => {
    exportSlideAsPng(mockCanvas as never, 'slide-01.png');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith({
      format: 'png',
      multiplier: 1,
    });
  });

  it('creates an anchor element and calls link.click()', () => {
    exportSlideAsPng(mockCanvas as never, 'slide-01.png');
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('uses the provided filename as link.download', () => {
    exportSlideAsPng(mockCanvas as never, 'slide-03.png');
    expect(mockLink.download).toBe('slide-03.png');
  });

  it('does NOT use multiplier: 2', () => {
    exportSlideAsPng(mockCanvas as never, 'slide-01.png');
    const callArgs = mockCanvas.toDataURL.mock.calls[0][0];
    expect(callArgs.multiplier).not.toBe(2);
    expect(callArgs.multiplier).toBe(1);
  });

  it('appends and then removes the anchor from document.body', () => {
    exportSlideAsPng(mockCanvas as never, 'slide-01.png');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });
});
