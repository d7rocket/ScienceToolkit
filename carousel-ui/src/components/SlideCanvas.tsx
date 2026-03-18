import { useEffect, useRef } from 'react';
import { Canvas, IText } from 'fabric';
import { useCarouselStore } from '../store/useCarouselStore';
import { renderSlide } from '../canvas/renderSlide';
import { renderSafezoneOverlay } from '../canvas/layouts';
import type { ParsedSlide } from '../types/carousel';

/**
 * Attaches `editing:exited` listeners to IText objects on the canvas.
 * When a user finishes editing a 'title' or 'body' text object, the updated
 * text is committed to the store via `updateSlide`.
 *
 * Returns a cleanup function that removes all attached listeners.
 */
export function attachEditingHandlers(
  canvas: { getObjects: () => unknown[] },
  updateSlide: (index: number, partial: Partial<ParsedSlide>) => void,
  getActiveIndex: () => number
): () => void {
  const cleanups: Array<() => void> = [];

  for (const obj of canvas.getObjects()) {
    if (obj instanceof IText) {
      const objName = (obj as { name?: string }).name;
      if (objName === 'title' || objName === 'body') {
        const handler = () => {
          const idx = getActiveIndex();
          const newText = obj.text ?? '';
          if (objName === 'title') {
            updateSlide(idx, { title: newText });
          } else {
            updateSlide(idx, { body: newText });
          }
        };
        obj.on('editing:exited', handler);
        cleanups.push(() => obj.off('editing:exited', handler));
      }
    }
  }

  return () => cleanups.forEach((fn) => fn());
}

export function SlideCanvas() {
  const slides = useCarouselStore((s) => s.slides);
  const colors = useCarouselStore((s) => s.colors);
  const activeSlideIndex = useCarouselStore((s) => s.activeSlideIndex);
  const safezoneVisible = useCarouselStore((s) => s.safezoneVisible);
  const fontsReady = useCarouselStore((s) => s.fontsReady);
  const toggleSafezone = useCarouselStore((s) => s.toggleSafezone);
  const selectedFontPreset = useCarouselStore((s) => s.selectedFontPreset);
  const alignmentOverrides = useCarouselStore((s) => s.alignmentOverrides);
  const updateSlide = useCarouselStore((s) => s.updateSlide);

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

  // Re-render slide when active slide, colors, font, or alignment change
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || !slides.length) return;
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const alignment = alignmentOverrides[activeSlideIndex] ?? 'left';
    renderSlide(fc, slide, colors, selectedFontPreset, alignment, true);
  }, [slides, activeSlideIndex, colors, fontsReady, selectedFontPreset, alignmentOverrides]);

  // Attach editing:exited handlers to IText objects for inline editing commit
  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc || !slides.length) return;

    let frameId: number;
    const handlers: Array<() => void> = [];

    // Wait one frame for renderSlide to complete and objects to be on the canvas
    frameId = requestAnimationFrame(() => {
      const cleanup = attachEditingHandlers(
        fc as unknown as { getObjects: () => unknown[] },
        (idx, partial) => {
          useCarouselStore.getState().updateSlide(idx, partial);
        },
        () => useCarouselStore.getState().activeSlideIndex
      );
      handlers.push(cleanup);
    });

    return () => {
      cancelAnimationFrame(frameId);
      handlers.forEach((cleanup) => cleanup());
    };
  }, [slides, activeSlideIndex, colors, fontsReady, selectedFontPreset, alignmentOverrides, updateSlide]);

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
