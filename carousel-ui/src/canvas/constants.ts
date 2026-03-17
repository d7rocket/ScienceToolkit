export const CANVAS_SIZE = 1080;
export const SAFE_TOP = 120;
export const SAFE_BOTTOM = 150;
export const SAFE_SIDES = 80;

// Derived content area bounds — use these in layout functions
export const CONTENT_X = SAFE_SIDES;                         // 80
export const CONTENT_Y = SAFE_TOP;                           // 120
export const CONTENT_WIDTH = CANVAS_SIZE - SAFE_SIDES * 2;   // 920
export const CONTENT_HEIGHT = CANVAS_SIZE - SAFE_TOP - SAFE_BOTTOM; // 810
export const CONTENT_BOTTOM = CANVAS_SIZE - SAFE_BOTTOM;     // 930
