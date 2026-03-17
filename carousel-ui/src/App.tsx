import { useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { MetaBar } from './components/MetaBar';
import { useCarouselStore } from './store/useCarouselStore';

export default function App() {
  const { meta, setFontsReady } = useCarouselStore();

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, [setFontsReady]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {meta && <MetaBar />}
      <DropZone>
        <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
          Canvas renders here (Plan 02)
        </div>
      </DropZone>
    </div>
  );
}
