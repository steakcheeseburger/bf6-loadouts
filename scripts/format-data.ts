/**
 * Re-format src/data/*.json in a compact, hand-editable style:
 * small flat objects (attachments, damage brackets) stay on one line.
 *   bun run format
 */
export {};

const FILES = ['src/data/weapons.json', 'src/data/season.json', 'src/data/guide.json'];
const MAX_INLINE = 110;

function isFlat(v: unknown): boolean {
  if (Array.isArray(v)) return v.every((x) => x === null || typeof x !== 'object');
  if (v && typeof v === 'object') return Object.values(v).every((x) => x === null || typeof x !== 'object');
  return true;
}

function fmt(v: unknown, indent: string): string {
  const one = JSON.stringify(v);
  if (v === null || typeof v !== 'object') return one;
  if (isFlat(v) && one.length + indent.length <= MAX_INLINE) {
    // a little air inside inline objects/arrays
    return Array.isArray(v) ? one.replace(/,/g, ', ') : one.replace(/^\{/, '{ ').replace(/\}$/, ' }').replace(/,"/g, ', "').replace(/":/g, '": ');
  }
  const inner = indent + '  ';
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return `[\n${v.map((x) => inner + fmt(x, inner)).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(v as Record<string, unknown>);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, x]) => `${inner}${JSON.stringify(k)}: ${fmt(x, inner)}`).join(',\n')}\n${indent}}`;
}

for (const file of FILES) {
  const data = await Bun.file(file).json();
  await Bun.write(file, fmt(data, '') + '\n');
  console.log('formatted', file);
}
