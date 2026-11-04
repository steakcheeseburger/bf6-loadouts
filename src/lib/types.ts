/*
 * Data shapes for src/data/*.json.
 * weapons.json is the file to edit after a patch.
 */

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export type WeaponClass = 'Assault Rifle' | 'SMG' | 'Carbine' | 'LMG' | 'DMR' | 'Sniper Rifle' | 'Shotgun' | 'Pistol';

export type Tag = 'OP' | 'New' | 'Overhyped' | 'Hidden gem' | 'Nerfed' | 'Easy to use' | 'Hard to use';

/** number = weapon level needed (0 = default), string = seasonal challenge (e.g. "S3 Hardware 6"), null = unknown */
export type UnlockLevel = number | string | null;

export interface Part {
  slot: string;
  name: string;
  level: UnlockLevel;
  /** attachment point cost (every build must fit 100) */
  points?: number;
}

export interface Build {
  name: string;
  parts: Part[];
  /** best build: why these attachments */
  notes?: string;
  /** alt build: when to use it instead */
  when?: string;
}

export interface DamageBracket {
  /** distance in metres where this damage starts */
  from: number;
  /** damage per body (chest) hit */
  body: number;
  /** body hits needed to kill a full-health (100 HP) enemy */
  hits: number;
}

export interface SweetSpot {
  from: number;
  to: number;
  label: string;
}

export interface WeaponStats {
  rpm: number;
  magazine: number;
  /** bullet velocity, m/s */
  velocity: number;
  adsMs: number;
  reloadS: number | null;
  headshot: number;
  /** automatic & semi-auto weapons */
  hitscanM?: number;
  damage?: DamageBracket[];
  /** if set, damage beyond this distance is unknown */
  damageKnownToM?: number;
  /** bolt-action snipers: ranges where one body shot kills */
  sweetSpots?: SweetSpot[];
  bodyDamage?: { from: number; body: number }[];
  /** shotguns / special cases */
  note?: string;
}

export interface Weapon {
  id: string;
  name: string;
  class: WeaponClass;
  tier: Tier;
  tags: Tag[];
  role: string;
  bestAt: string;
  shines: string;
  unlock: string;
  build: Build;
  alt: Build | null;
  stats: WeaponStats | null;
}

export interface Pick {
  weapon: string;
  note: string;
}

export interface Season {
  title: string;
  name: string;
  mode: string;
  updated: string;
  patch: string;
  intro: string;
  spotlight: { id: string; title: string; blurb: string; tone: 'hot' | 'good' | 'warn'; picks: Pick[] }[];
  bestFor: { id: string; title: string; hint: string; picks: Pick[] }[];
  notes: string[];
  upcoming: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  points?: string[];
  table?: { columns: string[]; rows: string[][] };
  tip?: string;
}

export interface Guide {
  title: string;
  intro: string;
  sections: GuideSection[];
}

export interface ChartSeries {
  label: string;
  color: string;
  values: (number | null)[];
  hits?: (number | null)[];
}
