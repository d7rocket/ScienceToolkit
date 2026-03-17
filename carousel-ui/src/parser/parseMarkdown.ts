import type { ColorScheme, ParsedCarousel, ParsedSlide, SlideRole } from '../types/carousel';

export function parseMarkdown(text: string): ParsedCarousel {
  // Extract title: first # heading
  const titleMatch = text.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract metadata line: **Date:** YYYY-MM-DD | **Field:** X | **Sources:** N
  const metaMatch = text.match(
    /\*\*Date:\*\*\s*([\d-]+)\s*\|\s*\*\*Field:\*\*\s*(.+?)\s*\|\s*\*\*Sources:\*\*\s*(\d+)/
  );
  const date = metaMatch ? metaMatch[1].trim() : '';
  const field = metaMatch ? metaMatch[2].trim() : '';
  const sourceCount = metaMatch ? parseInt(metaMatch[3], 10) : 0;

  // Extract slides: each ## Slide N: Title block
  // Body runs until next ## heading or --- separator
  const rawSlides: Array<{ index: number; title: string; body: string }> = [];
  const slideRegex = /^## Slide (\d+):\s*(.+)$/gm;
  let slideMatch: RegExpExecArray | null;

  while ((slideMatch = slideRegex.exec(text)) !== null) {
    const slideIndex = parseInt(slideMatch[1], 10);
    const slideTitle = slideMatch[2].trim();
    const startPos = slideMatch.index + slideMatch[0].length;

    // Find end of this slide body: next ## heading or --- or end of string
    const remaining = text.slice(startPos);
    const endMatch = remaining.match(/\n(?=##|---)/);
    const bodyRaw = endMatch
      ? remaining.slice(0, endMatch.index)
      : remaining;

    const body = bodyRaw.trim();
    rawSlides.push({ index: slideIndex, title: slideTitle, body });
  }

  const totalSlides = rawSlides.length;

  function assignRole(index: number): SlideRole {
    if (index === 1) return 'hook';
    if (index === totalSlides) return 'cta';
    return 'body';
  }

  const slides: ParsedSlide[] = rawSlides.map((s) => ({
    index: s.index,
    role: assignRole(s.index),
    title: s.title,
    body: s.body,
  }));

  // Extract Color Scheme (may be absent — defaultDesign fallback handled by store)
  // Format: - Background: #XXXXXX — descriptor
  //         - Primary text: #XXXXXX — descriptor
  //         - Accent: #XXXXXX — descriptor
  //         - Highlight: #XXXXXX — descriptor
  let colors: ColorScheme | null = null;

  const colorSchemeSection = text.match(/## Color Scheme([\s\S]*?)(?:\n---|\n##|$)/);
  if (colorSchemeSection) {
    const section = colorSchemeSection[1];
    const bgMatch = section.match(/[-*]\s*Background:\s*(#[A-Fa-f0-9]{6})/);
    const textMatch = section.match(/[-*]\s*Primary text:\s*(#[A-Fa-f0-9]{6})/);
    const accentMatch = section.match(/[-*]\s*Accent:\s*(#[A-Fa-f0-9]{6})/);
    const highlightMatch = section.match(/[-*]\s*Highlight:\s*(#[A-Fa-f0-9]{6})/);

    if (bgMatch && textMatch && accentMatch && highlightMatch) {
      colors = {
        background: bgMatch[1],
        primaryText: textMatch[1],
        accent: accentMatch[1],
        highlight: highlightMatch[1],
      };
    }
  }

  return {
    title,
    date,
    field,
    sourceCount,
    slides,
    colors,
  };
}
