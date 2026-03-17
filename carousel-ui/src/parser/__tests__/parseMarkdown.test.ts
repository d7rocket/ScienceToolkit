import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseMarkdown } from '../parseMarkdown';

const OUTPUT_DIR = resolve(__dirname, '..', '..', '..', '..', 'output');
const EXAMPLES_DIR = resolve(__dirname, '..', '..', '..', '..', 'examples');

const crisprText = readFileSync(resolve(OUTPUT_DIR, '2026-03-16-crispr-gene-editing.md'), 'utf-8');
const solarText = readFileSync(resolve(OUTPUT_DIR, '2026-03-16-solar-fuel-conversion.md'), 'utf-8');
const sampleText = readFileSync(resolve(EXAMPLES_DIR, 'output-sample.md'), 'utf-8');

describe('parseMarkdown', () => {
  describe('output-sample.md (James Webb)', () => {
    it('parses title containing "James Webb"', () => {
      const result = parseMarkdown(sampleText);
      expect(result.title).toContain('James Webb');
    });

    it('parses slideCount = 6', () => {
      const result = parseMarkdown(sampleText);
      expect(result.slides.length).toBe(6);
    });

    it('assigns hook role to slide index 1', () => {
      const result = parseMarkdown(sampleText);
      expect(result.slides[0].role).toBe('hook');
    });

    it('assigns cta role to last slide (index 6)', () => {
      const result = parseMarkdown(sampleText);
      expect(result.slides[5].role).toBe('cta');
    });

    it('extracts Color Scheme with correct background', () => {
      const result = parseMarkdown(sampleText);
      expect(result.colors).not.toBeNull();
      expect(result.colors?.background).toBe('#0B0E2D');
    });

    it('extracts Color Scheme primary text', () => {
      const result = parseMarkdown(sampleText);
      expect(result.colors?.primaryText).toBe('#F0F0F5');
    });

    it('extracts Color Scheme accent', () => {
      const result = parseMarkdown(sampleText);
      expect(result.colors?.accent).toBe('#6C5CE7');
    });

    it('extracts Color Scheme highlight', () => {
      const result = parseMarkdown(sampleText);
      expect(result.colors?.highlight).toBe('#00CEC9');
    });
  });

  describe('crispr-gene-editing.md (no Color Scheme)', () => {
    it('parses correct title', () => {
      const result = parseMarkdown(crisprText);
      expect(result.title).toContain('CRISPR Gene Editing');
    });

    it('parses date', () => {
      const result = parseMarkdown(crisprText);
      expect(result.date).toBe('2026-03-16');
    });

    it('parses field', () => {
      const result = parseMarkdown(crisprText);
      expect(result.field).toBe('Genetics / Synthetic Biology');
    });

    it('returns slideCount = 6', () => {
      const result = parseMarkdown(crisprText);
      expect(result.slides.length).toBe(6);
    });

    it('returns colors === null (not undefined, not partial object)', () => {
      const result = parseMarkdown(crisprText);
      expect(result.colors).toBeNull();
    });
  });

  describe('solar-fuel-conversion.md (no Color Scheme)', () => {
    it('returns colors === null', () => {
      const result = parseMarkdown(solarText);
      expect(result.colors).toBeNull();
    });
  });

  describe('role assignment', () => {
    it('assigns hook to index 1', () => {
      const result = parseMarkdown(crisprText);
      const slide1 = result.slides.find((s) => s.index === 1);
      expect(slide1?.role).toBe('hook');
    });

    it('assigns cta to index 6 (last slide)', () => {
      const result = parseMarkdown(crisprText);
      const slide6 = result.slides.find((s) => s.index === 6);
      expect(slide6?.role).toBe('cta');
    });

    it('assigns body to indices 2-5', () => {
      const result = parseMarkdown(crisprText);
      const bodySlides = result.slides.filter((s) => s.index >= 2 && s.index <= 5);
      expect(bodySlides.length).toBe(4);
      bodySlides.forEach((s) => {
        expect(s.role).toBe('body');
      });
    });
  });

  describe('absent Color Scheme section', () => {
    it('returns null for colors without throwing an error', () => {
      const simpleText = `# Test Topic\n\n**Date:** 2026-01-01 | **Field:** Physics | **Sources:** 1\n\n---\n\n## Slide 1: Hook\n\nHook text.\n\n## Slide 2: Body\n\nBody text.\n\n## Slide 3: CTA\n\nCTA text.`;
      expect(() => {
        const result = parseMarkdown(simpleText);
        expect(result.colors).toBeNull();
      }).not.toThrow();
    });
  });
});
