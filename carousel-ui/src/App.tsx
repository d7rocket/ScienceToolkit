import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/syne/400.css';
import '@fontsource/syne/700.css';
import { useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { MetaBar } from './components/MetaBar';
import { SlideCanvas } from './components/SlideCanvas';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { ExportPanel } from './components/ExportPanel';
import { useCarouselStore } from './store/useCarouselStore';

export default function App() {
  const { meta, slides, setFontsReady } = useCarouselStore();

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, [setFontsReady]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {meta && <MetaBar />}
      <DropZone>
        {slides.length > 0 ? (
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-44 flex-shrink-0 border-r border-neutral-800 overflow-y-auto bg-neutral-900">
              <ThumbnailStrip />
            </aside>
            <main className="flex-1 flex flex-col items-center p-6 overflow-auto gap-4">
              <SlideCanvas />
              <ExportPanel />
            </main>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
            Load a markdown file to begin
          </div>
        )}
      </DropZone>
    </div>
  );
}
