import { useCarouselStore } from '../store/useCarouselStore';

export function MetaBar() {
  const meta = useCarouselStore((s) => s.meta);

  if (!meta) return null;

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-xs text-neutral-300 flex items-center gap-1 flex-wrap">
      <span className="font-medium text-white">{meta.title}</span>
      <span className="text-neutral-600 mx-1">·</span>
      <span>{meta.date}</span>
      <span className="text-neutral-600 mx-1">·</span>
      <span>{meta.slideCount} slides</span>
      <span className="text-neutral-600 mx-1">·</span>
      <span>{meta.field}</span>
    </div>
  );
}
