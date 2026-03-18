import { useRef } from 'react';
import { useCarouselStore } from '../store/useCarouselStore';
import { FONT_PRESETS, COLOR_PRESETS } from '../types/carousel';
import type { ColorScheme } from '../types/carousel';

interface ColorSwatchProps {
  role: keyof ColorScheme;
  label: string;
  value: string;
  onChange: (role: keyof ColorScheme, value: string) => void;
}

function ColorSwatch({ role, label, value, onChange }: ColorSwatchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-start">
      <div style={{ position: 'relative' }}>
        <div
          style={{ width: 32, height: 32, backgroundColor: value, cursor: 'pointer' }}
          className="rounded border border-neutral-600"
          onClick={() => inputRef.current?.click()}
        />
        <input
          type="color"
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(role, e.target.value)}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
        />
      </div>
      <p className="text-xs font-semibold text-neutral-400 mt-1">{label}</p>
    </div>
  );
}

export function DesignEditor() {
  const selectedFontPreset = useCarouselStore((s) => s.selectedFontPreset);
  const colors = useCarouselStore((s) => s.colors);
  const activeSlideIndex = useCarouselStore((s) => s.activeSlideIndex);
  const alignmentOverrides = useCarouselStore((s) => s.alignmentOverrides);
  const setFontPreset = useCarouselStore((s) => s.setFontPreset);
  const setColor = useCarouselStore((s) => s.setColor);
  const setColors = useCarouselStore((s) => s.setColors);
  const setAlignment = useCarouselStore((s) => s.setAlignment);

  const currentAlignment = alignmentOverrides[activeSlideIndex] ?? 'left';

  return (
    <div className="px-4 py-6 flex flex-col gap-8 overflow-y-auto h-full">

      {/* Section 1: Font */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Font</p>
        <div className="flex flex-col gap-2">
          {FONT_PRESETS.map((preset) => {
            const isSelected = selectedFontPreset.name === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => setFontPreset(preset)}
                className={`min-h-12 w-full px-3 py-2 rounded text-left transition-colors border ${
                  isSelected
                    ? 'border-[#6C5CE7] border-2 bg-neutral-800'
                    : 'border-neutral-700 border bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                <span className="text-base font-semibold text-white block">{preset.name}</span>
                <span className="text-xl block" style={{ fontFamily: preset.headingFont }}>Aa</span>
                <span className="text-xs text-neutral-400 block">{preset.bodyFont}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Colors */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Colors</p>
        <p className="text-xs text-neutral-500 mb-2">Color scheme</p>
        <select
          className="w-full bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1.5 text-sm mb-4"
          onChange={(e) => {
            const found = COLOR_PRESETS.find((p) => p.name === e.target.value);
            if (found) setColors(found.scheme);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a preset...</option>
          {COLOR_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <ColorSwatch role="background" label="Background" value={colors.background} onChange={setColor} />
          <ColorSwatch role="primaryText" label="Text" value={colors.primaryText} onChange={setColor} />
          <ColorSwatch role="accent" label="Accent" value={colors.accent} onChange={setColor} />
          <ColorSwatch role="highlight" label="Highlight" value={colors.highlight} onChange={setColor} />
        </div>
      </div>

      {/* Section 3: Alignment */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Alignment</p>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((value) => {
            const label = value.charAt(0).toUpperCase() + value.slice(1);
            const isSelected = currentAlignment === value;
            return (
              <button
                key={value}
                onClick={() => setAlignment(activeSlideIndex, value)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  isSelected
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
