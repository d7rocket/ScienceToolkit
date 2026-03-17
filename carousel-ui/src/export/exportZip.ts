import JSZip from 'jszip';
import type { Canvas } from 'fabric';

export async function exportAllSlidesAsZip(
  canvases: Canvas[],
  topicSlug: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(topicSlug);
  if (!folder) throw new Error('Failed to create ZIP folder');

  for (let i = 0; i < canvases.length; i++) {
    const dataUrl = canvases[i].toDataURL({ format: 'png', multiplier: 1 });
    // Convert data URL to Blob using fetch — handles base64 conversion correctly
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
    folder.file(filename, blob);
    onProgress(Math.round(((i + 1) / canvases.length) * 100));
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topicSlug}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to convert topic title to URL-safe slug
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
