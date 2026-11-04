/**
 * Checks src/data/*.json for mistakes before building.
 *   bun run validate
 * Errors stop the build; warnings are printed only.
 */
import { existsSync } from 'node:fs';
import type { Guide, Season, Weapon } from '../src/lib/types';

const weapons: Weapon[] = await Bun.file('src/data/weapons.json').json();
const season: Season = await Bun.file('src/data/season.json').json();
const guide: Guide = await Bun.file('src/data/guide.json').json();

const CLASSES = ['Assault Rifle', 'SMG', 'Carbine', 'LMG', 'DMR', 'Sniper Rifle', 'Shotgun', 'Pistol'];
const TIERS = ['S', 'A', 'B', 'C', 'D'];
const TAGS = ['OP', 'New', 'Overhyped', 'Hidden gem', 'Nerfed', 'Easy to use', 'Hard to use'];
const SLOTS = [
  'Scope', 'Optic Accessory', 'Muzzle', 'Barrel', 'Underbarrel', 'Magazine', 'Ammunition',
  'Ergonomics', 'Top Accessory', 'Right Accessory', 'Left Accessory',
];

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);
const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

const ids = new Set<string>();
for (const w of weapons) {
  const at = w.name || w.id || '(unnamed weapon)';
  if (!/^[a-z0-9-]+$/.test(w.id ?? '')) err(at, `id "${w.id}" must be lowercase letters, numbers and dashes`);
  if (ids.has(w.id)) err(at, `duplicate id "${w.id}"`);
  ids.add(w.id);
  if (!existsSync(`public/weapons/${w.id}.webp`)) err(at, `missing image public/weapons/${w.id}.webp`);
  if (!CLASSES.includes(w.class)) err(at, `class "${w.class}" must be one of ${CLASSES.join(', ')}`);
  if (!TIERS.includes(w.tier)) err(at, `tier "${w.tier}" must be S, A, B, C or D`);
  for (const t of w.tags ?? []) if (!TAGS.includes(t)) err(at, `unknown tag "${t}" (allowed: ${TAGS.join(', ')})`);
  for (const f of ['role', 'bestAt', 'shines', 'unlock'] as const) if (!text(w[f])) err(at, `"${f}" is empty`);

  for (const [label, b] of [['build', w.build], ['alt', w.alt]] as const) {
    if (!b) {
      if (label === 'build') err(at, 'missing build');
      continue;
    }
    if (!text(b.name)) err(at, `${label}.name is empty`);
    if (label === 'alt' && !text(b.when)) warn(at, 'alt.when is empty');
    if (!b.parts?.length) err(at, `${label} has no parts`);
    let points = 0;
    for (const p of b.parts ?? []) {
      if (!SLOTS.includes(p.slot)) err(at, `${label}: unknown slot "${p.slot}" (allowed: ${SLOTS.join(', ')})`);
      if (!text(p.name)) err(at, `${label}: a ${p.slot} part has no name`);
      const ok = p.level === null || typeof p.level === 'string' || (Number.isInteger(p.level) && p.level >= 0 && p.level <= 50);
      if (!ok) err(at, `${label}: "${p.name}" level must be 0–50, a challenge name, or null`);
      if (p.level === null) warn(at, `${label}: "${p.name}" has an unknown unlock level`);
      points += p.points ?? 0;
    }
    if (points > 100) err(at, `${label} uses ${points} points (max 100)`);
    const slots = (b.parts ?? []).map((p) => p.slot);
    if (new Set(slots).size !== slots.length) err(at, `${label} has two parts in the same slot`);
  }

  const s = w.stats;
  if (!s) {
    warn(at, 'no stats');
    continue;
  }
  if (!(s.rpm > 0) || !(s.velocity > 0) || !(s.magazine > 0)) err(at, 'stats.rpm, stats.velocity and stats.magazine must be > 0');
  if (w.class === 'Sniper Rifle') {
    if (!Array.isArray(s.sweetSpots)) err(at, 'snipers need stats.sweetSpots (use [] for none)');
    for (const sp of s.sweetSpots ?? []) if (!(sp.from < sp.to)) err(at, `sweet spot ${sp.from}–${sp.to} m: "from" must be below "to"`);
  } else if (w.class === 'Shotgun') {
    if (!text(s.note)) warn(at, 'shotguns should have stats.note describing their kill range');
  } else {
    if (!s.damage?.length) err(at, 'needs stats.damage brackets');
    else {
      if (s.damage[0].from !== 0) err(at, 'the first damage bracket must start at "from": 0');
      s.damage.forEach((b, i) => {
        if (!(b.body > 0) || !(Number.isInteger(b.hits) && b.hits > 0)) err(at, `damage bracket ${i + 1} needs body > 0 and whole hits > 0`);
        if (i && b.from <= s.damage![i - 1].from) err(at, `damage brackets must be in increasing "from" order`);
        if (b.body * b.hits < 100) warn(at, `bracket from ${b.from} m: ${b.hits} hits × ${b.body} dmg is under 100 HP`);
      });
    }
  }
}

for (const col of season.spotlight) for (const p of col.picks) if (!ids.has(p.weapon)) err(`season.json "${col.title}"`, `unknown weapon id "${p.weapon}"`);
for (const b of season.bestFor) for (const p of b.picks) if (!ids.has(p.weapon)) err(`season.json best for "${b.title}"`, `unknown weapon id "${p.weapon}"`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(season.updated)) err('season.json', '"updated" must look like 2026-10-31');
for (const g of guide.sections)
  for (const row of g.table?.rows ?? [])
    if (row.length !== g.table!.columns.length) err(`guide.json "${g.title}"`, `table row "${row[0]}" has ${row.length} cells, expected ${g.table!.columns.length}`);

for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(`\n${weapons.length} weapons checked · ${errors.length} errors · ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
