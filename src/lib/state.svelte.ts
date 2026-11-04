import { byId, season, weapons } from './data';
import { RANGES, boltShotsAt, kindOf, ttkAt, type Range } from './ballistics';
import { CLASSES, TIERS, matchesQuery, tierIndex } from './labels';
import type { Tier, Weapon, WeaponClass } from './types';

export type SortKey = 'best' | 'fastest' | 'name';

const SORT_KEYS: SortKey[] = ['best', 'fastest', 'name'];

export const ui = $state({
  q: '',
  /** tiers to show; empty = all */
  tiers: [] as Tier[],
  range: 'mid' as Range['id'],
  sort: 'best' as SortKey,
  /** active "best for…" quick filter */
  bestFor: null as string | null,
  /** id of the weapon open in the detail panel */
  open: null as string | null,
});

export const prefs = $state({ theme: 'dark' as 'dark' | 'light' });

export const rangeM = () => RANGES.find((r) => r.id === ui.range)!.m;
export const rangeInfo = () => RANGES.find((r) => r.id === ui.range)!;

/* ---------------------------------------------------------------- theme */

export function initTheme() {
  prefs.theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function toggleTheme() {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = prefs.theme;
  try {
    localStorage.setItem('bf6:theme', prefs.theme);
  } catch {
    /* storage unavailable */
  }
}

/* ---------------------------------------------------------------- URL */

export function readUrl() {
  const p = new URLSearchParams(location.search);
  ui.q = p.get('q') ?? '';
  ui.tiers = TIERS.filter((t) => (p.get('tier') ?? '').toUpperCase().includes(t));
  const r = p.get('range');
  ui.range = RANGES.some((x) => x.id === r) ? (r as Range['id']) : 'mid';
  const s = p.get('sort');
  ui.sort = SORT_KEYS.includes(s as SortKey) ? (s as SortKey) : 'best';
  const f = p.get('for');
  ui.bestFor = season.bestFor.some((x) => x.id === f) ? f : null;
  readHash();
}

function readHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  ui.open = byId[id] ? id : null;
}

function currentUrl(): string {
  const p = new URLSearchParams();
  if (ui.q) p.set('q', ui.q);
  if (ui.tiers.length) p.set('tier', TIERS.filter((t) => ui.tiers.includes(t)).join(''));
  if (ui.range !== 'mid') p.set('range', ui.range);
  if (ui.sort !== 'best') p.set('sort', ui.sort);
  if (ui.bestFor) p.set('for', ui.bestFor);
  const qs = p.toString();
  return `${location.pathname}${qs ? `?${qs}` : ''}${ui.open ? `#${ui.open}` : ''}`;
}

/** Mirror filters into the address bar without adding history entries. */
export function replaceUrl() {
  const url = currentUrl();
  if (url !== location.pathname + location.search + location.hash) history.replaceState(null, '', url);
}

let pushed = false;

export function openWeapon(id: string) {
  if (!byId[id]) return;
  if (ui.open) {
    ui.open = id;
    replaceUrl();
  } else {
    replaceUrl(); // the entry we return to must hold the current filters
    ui.open = id;
    history.pushState(null, '', currentUrl());
    pushed = true;
  }
}

export function closeWeapon() {
  if (pushed) {
    pushed = false;
    history.back(); // → onPopState
  } else {
    ui.open = null;
    replaceUrl();
  }
}

/** Back/forward open or close the detail panel; filters stay as they are. */
export function onPopState() {
  pushed = false;
  readHash();
  replaceUrl();
}

/* ---------------------------------------------------------------- results */

export const isFiltered = () => ui.q.trim() !== '' || ui.tiers.length > 0 || ui.bestFor !== null;

export function resetFilters() {
  ui.q = '';
  ui.tiers = [];
  ui.bestFor = null;
}

export function toggleTier(t: Tier) {
  ui.tiers = ui.tiers.includes(t) ? ui.tiers.filter((x) => x !== t) : [...ui.tiers, t];
}

/** "Best for" buttons below the list: show exactly that pick list (toggles off on a second click). */
export function applyBestFor(id: string) {
  ui.bestFor = ui.bestFor === id ? null : id;
  ui.q = '';
  ui.tiers = [];
}

const searchText = (w: Weapon) =>
  [w.name, w.role, w.class, ...w.tags, w.build.name, ...w.build.parts.map((p) => p.name), ...(w.alt?.parts.map((p) => p.name) ?? [])].join(' ');

/** Lower = kills faster at distance d: time to kill, or body shots for bolt-actions. */
function speed(w: Weapon, d: number): number {
  if (kindOf(w) === 'bolt') return boltShotsAt(w, d) * 1e5;
  return ttkAt(w, d) ?? 1e9;
}

const sorters: Record<SortKey, (a: Weapon, b: Weapon, d: number) => number> = {
  // within a tier, weapons.json is already in our preferred order (sort is stable)
  best: (a, b) => tierIndex(a.tier) - tierIndex(b.tier),
  fastest: (a, b, d) => speed(a, d) - speed(b, d) || tierIndex(a.tier) - tierIndex(b.tier),
  name: (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }),
};

export interface Group {
  key: string;
  /** DOM id of the section, used by the section navigation */
  anchor: string;
  title: string;
  note: string;
  items: Weapon[];
}

export const classAnchor = (c: WeaponClass) => `class-${CLASSES.find((x) => x.id === c)!.key}`;

/** The list is always one section per class (in CLASSES order); sorting happens inside each class. */
export function results(): { groups: Group[]; flat: Weapon[] } {
  const d = rangeM();
  const preset = ui.bestFor ? new Set(season.bestFor.find((b) => b.id === ui.bestFor)?.picks.map((p) => p.weapon)) : null;
  const list = weapons
    .filter((w) => !ui.tiers.length || ui.tiers.includes(w.tier))
    .filter((w) => !preset || preset.has(w.id))
    .filter((w) => !ui.q || matchesQuery(searchText(w), ui.q))
    .sort((a, b) => sorters[ui.sort](a, b, d));

  const groups: Group[] = CLASSES.map((c) => ({
    key: c.id,
    anchor: classAnchor(c.id),
    title: c.label,
    note: c.note,
    items: list.filter((w) => w.class === c.id),
  })).filter((g) => g.items.length);
  return { groups, flat: groups.flatMap((g) => g.items) };
}
