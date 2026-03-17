import type { Canvas } from 'fabric';

// Registry maps slide index (0-based) to its Fabric.js Canvas instance.
// Thumbnail canvases are registered here — they are always in sync with slide data
// and are the source of truth for export.
export const canvasRegistry = new Map<number, Canvas>();

export function registerCanvas(slideIndex: number, canvas: Canvas): void {
  canvasRegistry.set(slideIndex, canvas);
}

export function unregisterCanvas(slideIndex: number): void {
  canvasRegistry.delete(slideIndex);
}

export function getAllCanvases(): Canvas[] {
  // Return canvases sorted by slide index (0, 1, 2, ...)
  const entries = Array.from(canvasRegistry.entries());
  entries.sort((a, b) => a[0] - b[0]);
  return entries.map(([, canvas]) => canvas);
}
