import { describe, it, expect } from 'vitest';
import {
  CANVAS_SIZE,
  SAFE_TOP,
  SAFE_BOTTOM,
  SAFE_SIDES,
  CONTENT_WIDTH,
  CONTENT_HEIGHT,
} from '../constants';

describe('canvas constants', () => {
  it('CANVAS_SIZE === 1080', () => {
    expect(CANVAS_SIZE).toBe(1080);
  });

  it('SAFE_TOP === 120', () => {
    expect(SAFE_TOP).toBe(120);
  });

  it('SAFE_BOTTOM === 150', () => {
    expect(SAFE_BOTTOM).toBe(150);
  });

  it('SAFE_SIDES === 80', () => {
    expect(SAFE_SIDES).toBe(80);
  });

  it('CONTENT_WIDTH === 920 (1080 - 80 - 80)', () => {
    expect(CONTENT_WIDTH).toBe(920);
  });

  it('CONTENT_HEIGHT === 810 (1080 - 120 - 150)', () => {
    expect(CONTENT_HEIGHT).toBe(810);
  });
});
