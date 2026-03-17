import { useState } from 'react';
import { useCarouselStore } from '../store/useCarouselStore';

interface DropZoneProps {
  children?: React.ReactNode;
}

export function DropZone({ children }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = useCarouselStore((s) => s.meta);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      setError(`"${file.name}" is not a markdown file. Please drop a .md file.`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      useCarouselStore.getState().loadFile(text);
    };
    reader.readAsText(file);
  }

  if (meta !== null) {
    return (
      <div
        className="flex-1 flex flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center min-h-screen cursor-pointer transition-colors ${
        isDragOver
          ? 'bg-neutral-900 border-4 border-dashed border-indigo-500'
          : 'bg-neutral-950 border-4 border-dashed border-neutral-700'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center px-8">
        <p className="text-2xl font-semibold text-white mb-2">
          Drop your /science markdown file here
        </p>
        <p className="text-neutral-400 text-sm">
          Accepts .md files from the output/ directory
        </p>
        {error && (
          <p className="mt-4 text-red-400 text-sm border border-dashed border-red-500 rounded px-4 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
