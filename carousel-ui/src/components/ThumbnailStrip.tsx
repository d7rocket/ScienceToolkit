import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { useCarouselStore } from '../store/useCarouselStore';
import { renderSlide } from '../canvas/renderSlide';
import type { ParsedSlide, ColorScheme } from '../types/carousel';

const THUMB_SIZE = 160;
const THUMB_SCALE = THUMB_SIZE / 1080;

interface ThumbnailProps {
  slide: ParsedSlide;
  colors: ColorScheme;
  isActive: boolean;
  onClick: () => void;
}

function Thumbnail({ slide, colors, isActive, onClick }: ThumbnailProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const fc = new Canvas(canvasElRef.current, {
      width: 1080,
      height: 1080,
      pixelRatio: 1,
      selection: false,
      renderOnAddRemove: false,
    });
    fabricRef.current = fc;
    renderSlide(fc, slide, colors);

    return () => {
      fc.dispose();
      fabricRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when slide data or colors change
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    renderSlide(fc, slide, colors);
  }, [slide, colors]);

  return (
    <button
      onClick={onClick}
      aria-selected={isActive}
      className={`block w-full p-1 rounded transition-colors ${
        isActive
          ? 'ring-2 ring-indigo-400 bg-neutral-800'
          : 'hover:bg-neutral-800'
      }`}
      title={`Slide ${slide.index}`}
    >
      {/* Scaled canvas container */}
      <div
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 1080,
            height: 1080,
            transform: `scale(${THUMB_SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-1 text-center">{slide.index}</p>
    </button>
  );
}

export function ThumbnailStrip() {
  const slides = useCarouselStore((s) => s.slides);
  const colors = useCarouselStore((s) => s.colors);
  const activeSlideIndex = useCarouselStore((s) => s.activeSlideIndex);
  const setActiveSlide = useCarouselStore((s) => s.setActiveSlide);

  if (!slides.length) return null;

  return (
    <div className="flex flex-col gap-2 p-2">
      {slides.map((slide, index) => (
        <Thumbnail
          key={slide.index}
          slide={slide}
          colors={colors}
          isActive={index === activeSlideIndex}
          onClick={() => setActiveSlide(index)}
        />
      ))}
    </div>
  );
}
