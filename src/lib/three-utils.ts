export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const COLORS = {
  electric: "#2E6BFF",
  cyan: "#22E0FF",
  solar: "#FF8A34",
  energy: "#38F6A4",
  chrome: "#C7CDD6",
  graphite: "#12161F",
};

/**
 * Maps 0..1 scroll progress to the cinematic exploded-view phases and the
 * currently-active interior component index. Shared by the 3D scene (camera +
 * glow) and the DOM overlay (info cards) so they stay perfectly in sync.
 */
export type ExplodePhase = "intro" | "closer" | "explode" | "enter" | "component" | "end";
export function explodePhase(p: number, n: number): { phase: ExplodePhase; index: number } {
  if (p < 0.12) return { phase: "intro", index: -1 };
  if (p < 0.22) return { phase: "closer", index: -1 };
  if (p < 0.35) return { phase: "explode", index: -1 };
  if (p < 0.48) return { phase: "enter", index: -1 };
  if (p < 0.86) {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(((p - 0.48) / (0.86 - 0.48)) * n)));
    return { phase: "component", index: idx };
  }
  return { phase: "end", index: -1 };
}
