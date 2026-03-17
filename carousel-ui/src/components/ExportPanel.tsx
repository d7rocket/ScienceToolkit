import { useCarouselStore } from '../store/useCarouselStore';
import { getAllCanvases } from '../canvas/canvasRegistry';
import { exportAllSlidesAsZip, titleToSlug } from '../export/exportZip';

export function ExportPanel() {
  const exportProgress = useCarouselStore((s) => s.exportProgress);
  const exportError = useCarouselStore((s) => s.exportError);
  const setExportProgress = useCarouselStore((s) => s.setExportProgress);
  const setExportError = useCarouselStore((s) => s.setExportError);
  const meta = useCarouselStore((s) => s.meta);
  const slides = useCarouselStore((s) => s.slides);

  const isExporting = exportProgress > 0 && exportProgress < 100;
  const isDone = exportProgress === 100;

  async function handleExportZip() {
    if (!meta) return;

    const canvases = getAllCanvases();
    if (canvases.length !== slides.length) {
      console.warn(
        `Canvas registry mismatch: ${canvases.length} canvases for ${slides.length} slides`,
      );
    }

    const slug = titleToSlug(meta.title);
    setExportError(null);
    setExportProgress(0);

    try {
      await exportAllSlidesAsZip(canvases, slug, setExportProgress);
      // Reset progress after 2 seconds
      setTimeout(() => {
        setExportProgress(0);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setExportError(message);
      console.error('ZIP export failed:', err);
      setExportProgress(0);
    }
  }

  return (
    <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-neutral-400">
          {meta ? `${slides.length} slides` : 'No file loaded'}
        </span>
        <button
          onClick={handleExportZip}
          disabled={!meta || isExporting}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !meta || isExporting
              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isExporting ? `Exporting… ${exportProgress}%` : isDone ? 'Done!' : 'Export All (ZIP)'}
        </button>
      </div>

      {/* Progress bar — only visible when export is in progress or just completed */}
      {exportProgress > 0 && (
        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-200 rounded-full"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
      )}

      {/* Percentage label */}
      {exportProgress > 0 && (
        <p className="text-xs text-neutral-500 text-right">
          {isDone ? 'Downloaded!' : `${exportProgress}%`}
        </p>
      )}

      {/* Error display */}
      {exportError && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded px-3 py-2">
          Export failed: {exportError}
        </p>
      )}
    </div>
  );
}
