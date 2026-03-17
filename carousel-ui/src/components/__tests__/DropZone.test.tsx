import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropZone } from '../DropZone';
import type { CarouselMeta, ColorScheme } from '../../types/carousel';
import { defaultDesign } from '../../types/carousel';

// Track loadFile calls
const mockLoadFile = vi.fn();
let mockMeta: CarouselMeta | null = null;

vi.mock('../../store/useCarouselStore', () => {
  const getState = () => ({
    meta: mockMeta,
    slides: [],
    colors: defaultDesign as ColorScheme,
    activeSlideIndex: 0,
    safezoneVisible: false,
    fontsReady: false,
    exportProgress: 0,
    exportError: null,
    loadFile: mockLoadFile,
    setActiveSlide: vi.fn(),
    toggleSafezone: vi.fn(),
    setFontsReady: vi.fn(),
    setExportProgress: vi.fn(),
    setExportError: vi.fn(),
  });

  const useCarouselStore = (selector?: (state: ReturnType<typeof getState>) => unknown) => {
    const state = getState();
    if (selector) return selector(state);
    return state;
  };
  useCarouselStore.getState = getState;

  return { useCarouselStore };
});

describe('DropZone', () => {
  beforeEach(() => {
    mockMeta = null;
    mockLoadFile.mockReset();
  });

  it('renders drop prompt when meta is null', () => {
    render(<DropZone />);
    expect(screen.getByText('Drop your /science markdown file here')).toBeInTheDocument();
  });

  it('shows subtitle text', () => {
    render(<DropZone />);
    expect(screen.getByText(/Accepts .md files from the output\/ directory/)).toBeInTheDocument();
  });

  it('shows error message when non-.md file (data.csv) is dropped', () => {
    const { container } = render(<DropZone />);
    const dropZone = container.firstChild as HTMLElement;
    fireEvent.drop(dropZone, {
      preventDefault: vi.fn(),
      dataTransfer: {
        files: [new File(['content'], 'data.csv', { type: 'text/csv' })],
      },
    });
    expect(screen.getByText(/is not a markdown file/)).toBeInTheDocument();
  });

  it('does not show error when a .md file is dropped', () => {
    // Stub FileReader to avoid async complexity
    class MockFileReader {
      onload: ((ev: { target: { result: string } }) => void) | null = null;
      readAsText() {
        if (this.onload) this.onload({ target: { result: '# Test' } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const { container } = render(<DropZone />);
    const dropZone = container.firstChild as HTMLElement;
    fireEvent.drop(dropZone, {
      preventDefault: vi.fn(),
      dataTransfer: {
        files: [new File(['# Test'], 'science.md', { type: 'text/plain' })],
      },
    });

    expect(screen.queryByText(/is not a markdown file/)).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('renders children when meta is not null', () => {
    mockMeta = {
      title: 'Test Topic',
      date: '2026-01-01',
      field: 'Physics',
      slideCount: 3,
    };
    render(
      <DropZone>
        <div data-testid="child-content">Canvas here</div>
      </DropZone>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Drop your /science markdown file here')).not.toBeInTheDocument();
  });
});
