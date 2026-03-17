import type { Canvas } from 'fabric';

export function exportSlideAsPng(canvas: Canvas, filename: string): void {
  // multiplier: 1 is MANDATORY — canvas is already 1080x1080
  // NEVER use multiplier > 1 or window.devicePixelRatio
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 1,
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
