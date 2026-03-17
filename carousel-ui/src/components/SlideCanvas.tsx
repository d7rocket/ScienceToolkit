import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { useCarouselStore } from '../store/useCarouselStore';
import { renderSlide } from '../canvas/renderSlide';
import { renderSafezoneOverlay } from '../canvas/layouts';

export function SlideCanvas() {
  const slides = useCarouselStore((s) => s.slides);
  const colors = useCarouselStore((s) => s.colors);
  const activeSlideIndex = useCarouselStore((s) => s.activeSlideIndex);
  const safezoneVisible = useCarouselStore((s) => s.safezoneVisible);
  const fontsReady = useCarouselStore((s) => s.fontsReady);
  const toggleSafezone = useCarouselStore((s) => s.toggleSafezone);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  // Initialize Fabric.js canvas when fonts are ready
  useEffect(() => {
    if (!fontsReady || !canvasElRef.current) return;

    const fc = new Canvas(canvasElRef.current, {
      width: 1080,
      height: 1080,
      pixelRatio: 1,
      selection: false,
      renderOnAddRemove: false,
    });
    fabricRef.current = fc;

    return () => {
      fc.dispose();
      fabricRef.current = null;
    };
  }, [fontsReady]);

  // Re-render slide when active slide or colors change
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || !slides.length) return;
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    renderSlide(fc, slide, colors);
  }, [slides, activeSlideIndex, colors, fontsReady]);

  // Toggle safe zone overlay
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    renderSafezoneOverlay(fc, safezoneVisible);
  }, [safezoneVisible]);

  if (!fontsReady) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-neutral-500 text-sm">Loading fonts...</div>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-neutral-500 text-sm">Load a markdown file to begin</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Safe zone toggle */}
      <button
        onClick={toggleSafezone}
        className="px-3 py-1 text-xs rounded border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
      >
        {safezoneVisible ? 'Hide' : 'Show'} Safe Zone
      </button>

      {/* Scaled canvas container: 1080x1080 shrunk to 540x540 */}
      <div
        style={{
          width: 540,
          height: 540,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 1080,
            height: 1080,
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
          }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}
