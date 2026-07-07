/**
 * Performance switches.
 *
 * ENABLE_3D      → the heavy secondary scenes (pinned showroom, energy globe,
 *                  inverter/camera fly-throughs). Kept OFF for speed; light
 *                  CSS/image fallbacks are shown instead.
 * ENABLE_HERO_3D → the flagship cinematic hero (one optimized WebGL canvas).
 *                  ON by default; scales particle counts by device and respects
 *                  prefers-reduced-motion. Set to false for a pure-CSS hero.
 */
export const ENABLE_3D = false;
/** Pure CSS/canvas hero — no WebGL bundle on the critical path. */
export const ENABLE_HERO_3D = false;
