/*
 * Time-to-kill maths. Everything is derived from the stats in weapons.json,
 * so updating damage / fire rate there updates every number and chart in the app.
 */
import type { Weapon } from './types';

export interface Range {
  id: 'close' | 'mid' | 'long' | 'far';
  label: string;
  m: number;
}

/** The fight distances players pick from. */
export const RANGES: Range[] = [
  { id: 'close', label: 'Close', m: 10 },
  { id: 'mid', label: 'Mid', m: 25 },
  { id: 'long', label: 'Long', m: 50 },
  { id: 'far', label: 'Very long', m: 75 },
];

export const CHART_MAX_M = 100;

export type Kind = 'auto' | 'bolt' | 'shotgun';

export function kindOf(w: Weapon): Kind {
  if (w.class === 'Sniper Rifle') return 'bolt';
  if (w.class === 'Shotgun') return 'shotgun';
  return 'auto';
}

/** Body hits to kill at distance d (automatic & semi-auto weapons). */
export function hitsAt(w: Weapon, d: number): number | null {
  const s = w.stats;
  if (!s?.damage?.length) return null;
  if (s.damageKnownToM !== undefined && d > s.damageKnownToM) return null;
  let cur = s.damage[0];
  for (const b of s.damage) if (b.from <= d) cur = b;
  return cur.hits;
}

/** Time to kill in ms at distance d: time between shots × (hits − 1) + bullet travel time. */
export function ttkAt(w: Weapon, d: number): number | null {
  const s = w.stats;
  const hits = hitsAt(w, d);
  if (!s || hits === null || !s.rpm || !s.velocity) return null;
  const between = 60000 / s.rpm;
  const travel = (Math.max(0, d - (s.hitscanM ?? 0)) / s.velocity) * 1000;
  return Math.round((hits - 1) * between + travel);
}

/** Bolt-actions: body shots needed at distance d (1 inside the main sweet spot, otherwise 2). */
export function boltShotsAt(w: Weapon, d: number): 1 | 2 {
  const main = w.stats?.sweetSpots?.[0];
  return main && d >= main.from && d <= main.to ? 1 : 2;
}

/** Speed grade for a time to kill, reusing the tier colours: S = fastest. */
export function ttkGrade(ms: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (ms <= 280) return 'S';
  if (ms <= 360) return 'A';
  if (ms <= 450) return 'B';
  if (ms <= 560) return 'C';
  return 'D';
}

export function ttkCurve(w: Weapon): (number | null)[] {
  return Array.from({ length: CHART_MAX_M + 1 }, (_, d) => ttkAt(w, d));
}

export function hitsCurve(w: Weapon): (number | null)[] {
  return Array.from({ length: CHART_MAX_M + 1 }, (_, d) => hitsAt(w, d));
}
