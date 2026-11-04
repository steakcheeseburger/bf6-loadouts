import weaponsJson from '../data/weapons.json';
import seasonJson from '../data/season.json';
import guideJson from '../data/guide.json';
import type { Guide, Season, Weapon } from './types';

export const weapons = weaponsJson as unknown as Weapon[];
export const season = seasonJson as unknown as Season;
export const guide = guideJson as unknown as Guide;

export const byId: Record<string, Weapon> = Object.fromEntries(weapons.map((w) => [w.id, w]));

/** Weapon render for a weapon: public/weapons/<id>.webp */
export const imageOf = (w: Weapon) => `./weapons/${w.id}.webp`;
