// Seeded random number generator (mulberry32). The state is a single 32-bit
// integer stored on the run, so a saved run continues with identical randomness.

export interface RngHolder {
  rng: number;
}

export function seedFrom(input: number | string): number {
  if (typeof input === 'number') return input >>> 0;
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Returns a float in [0, 1) and advances the holder's state. */
export function next(h: RngHolder): number {
  h.rng = (h.rng + 0x6d2b79f5) >>> 0;
  let t = h.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function int(h: RngHolder, maxExclusive: number): number {
  return Math.floor(next(h) * maxExclusive);
}

export function chance(h: RngHolder, p: number): boolean {
  if (p >= 1) return true;
  if (p <= 0) return false;
  return next(h) < p;
}

export function pick<T>(h: RngHolder, items: readonly T[]): T {
  return items[int(h, items.length)];
}

export function shuffle<T>(h: RngHolder, items: readonly T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(h, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick<T>(h: RngHolder, items: readonly T[], weight: (t: T) => number): T {
  const total = items.reduce((s, t) => s + Math.max(0, weight(t)), 0);
  let r = next(h) * total;
  for (const t of items) {
    r -= Math.max(0, weight(t));
    if (r < 0) return t;
  }
  return items[items.length - 1];
}
