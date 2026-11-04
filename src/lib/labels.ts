import type { Tag, Tier, UnlockLevel, WeaponClass } from './types';

export const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D'];

export interface ClassInfo {
  id: WeaponClass;
  key: string;
  label: string;
  short: string;
  note: string;
}

export const CLASSES: ClassInfo[] = [
  { id: 'Assault Rifle', key: 'ar', label: 'Assault Rifles', short: 'AR', note: 'Assault class bonus' },
  { id: 'SMG', key: 'smg', label: 'SMGs', short: 'SMG', note: 'Engineer class bonus' },
  { id: 'Carbine', key: 'carbine', label: 'Carbines', short: 'Carbine', note: 'Any class, no bonus' },
  { id: 'LMG', key: 'lmg', label: 'LMGs', short: 'LMG', note: 'Support class bonus' },
  { id: 'DMR', key: 'dmr', label: 'DMRs', short: 'DMR', note: 'Any class, no bonus' },
  { id: 'Sniper Rifle', key: 'sniper', label: 'Sniper Rifles', short: 'Sniper', note: 'Recon class bonus' },
  { id: 'Shotgun', key: 'shotgun', label: 'Shotguns', short: 'Shotgun', note: 'Any class, no bonus' },
  { id: 'Pistol', key: 'pistol', label: 'Pistols', short: 'Pistol', note: 'Sidearms · ranked against other pistols' },
];

export const classInfo = (c: WeaponClass) => CLASSES.find((x) => x.id === c)!;

export const tierIndex = (t: Tier) => TIERS.indexOf(t);

/** Order in which tags are shown, and their visual style. */
export const TAG_STYLE: Record<Tag, 'hot' | 'new' | 'warn' | 'good' | 'plain'> = {
  OP: 'hot',
  New: 'new',
  Overhyped: 'warn',
  Nerfed: 'warn',
  'Hidden gem': 'good',
  'Easy to use': 'plain',
  'Hard to use': 'plain',
};
const TAG_ORDER = Object.keys(TAG_STYLE) as Tag[];
export const sortTags = (tags: Tag[]) => [...tags].sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b));

export function levelText(level: UnlockLevel): string {
  if (level === null) return 'Lv ?';
  if (typeof level === 'string') return level.replace('Hardware', 'HW');
  return level === 0 ? 'Default' : `Lv ${level}`;
}

export function levelTitle(level: UnlockLevel): string {
  if (level === null) return 'Unlock level not known yet for this Season 4/5 gun';
  if (typeof level === 'string') return `Unlocked by the ${level} seasonal challenge, not by weapon level`;
  return level === 0 ? 'Available from the start' : `Unlocks at weapon level ${level}`;
}

const SLOT_SHORT: Record<string, string> = {
  Underbarrel: 'Grip',
  Ammunition: 'Ammo',
  Magazine: 'Mag',
  Ergonomics: 'Ergo',
  'Optic Accessory': 'Optic acc.',
  'Top Accessory': 'Laser',
  'Right Accessory': 'Laser',
  'Left Accessory': 'Left acc.',
};
export const shortSlot = (slot: string) => SLOT_SHORT[slot] ?? slot;

/** Weapon level at which every level-based part of a build is unlocked. */
export function fullBuildLevel(parts: { level: UnlockLevel }[]): { level: number; seasonal: number; unknown: number } {
  let level = 0;
  let seasonal = 0;
  let unknown = 0;
  for (const p of parts) {
    if (typeof p.level === 'number') level = Math.max(level, p.level);
    else if (typeof p.level === 'string') seasonal++;
    else unknown++;
  }
  return { level, seasonal, unknown };
}

export function buildPoints(parts: { points?: number }[]): { total: number; complete: boolean } {
  return {
    total: parts.reduce((s, p) => s + (p.points ?? 0), 0),
    complete: parts.every((p) => p.points !== undefined),
  };
}

export const fmt = (v: number | null | undefined, digits = 2) =>
  v === null || v === undefined ? '–' : Number(v.toFixed(digits)).toString();

/** Every query word must appear in the weapon's name, role, class, tags or build parts. */
export function matchesQuery(text: string, q: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const hay = norm(text);
  const compact = hay.replace(/ /g, '');
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => hay.includes(t) || compact.includes(t));
}
