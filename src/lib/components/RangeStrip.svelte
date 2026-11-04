<script lang="ts">
  import type { Weapon } from '../types';
  import { RANGES, boltShotsAt, hitsAt, kindOf, ttkAt, ttkGrade } from '../ballistics';
  import { ui } from '../state.svelte';

  let { weapon: w }: { weapon: Weapon } = $props();

  const kind = $derived(kindOf(w));
  const cells = $derived(
    RANGES.map((r) => {
      if (kind === 'bolt') {
        const shots = boltShotsAt(w, r.m);
        return { r, value: String(shots), unit: shots === 1 ? 'shot' : 'shots', sub: 'body', grade: shots === 1 ? 'S' : 'C' };
      }
      const ms = ttkAt(w, r.m);
      const hits = hitsAt(w, r.m);
      return ms === null
        ? { r, value: '–', unit: '', sub: 'no data', grade: null }
        : { r, value: String(ms), unit: 'ms', sub: `${hits} hits`, grade: ttkGrade(ms) };
    }),
  );
</script>

{#if kind === 'shotgun'}
  <p class="note">{w.stats?.note ?? 'No damage data yet.'}</p>
{:else}
  <dl class="strip" aria-label={kind === 'bolt' ? 'Body shots to kill by distance' : 'Time to kill by distance'}>
    {#each cells as c (c.r.id)}
      <div class="cell" class:on={ui.range === c.r.id} title="{c.r.label} range ({c.r.m} m)">
        <dt>{c.r.m} m</dt>
        <dd class="v num">{c.value}{#if c.unit}<small>{c.unit}</small>{/if}</dd>
        <dd class="sub num">{c.sub}</dd>
        {#if c.grade}<span class="bar" style="background: var(--tier-{c.grade})" aria-hidden="true"></span>{/if}
      </div>
    {/each}
  </dl>
{/if}

<style>
  .strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2px;
    margin: 0;
    padding: 3px;
    border-radius: var(--r);
    background: var(--surface-2);
  }
  .cell {
    position: relative;
    padding: 5px 7px 8px;
    border-radius: 7px;
    min-width: 0;
  }
  .cell.on {
    background: var(--surface-3);
  }
  dt {
    font-size: 10.5px;
    font-weight: 650;
    letter-spacing: 0.04em;
    color: var(--text-3);
  }
  .on dt {
    color: var(--text);
  }
  dd {
    margin: 0;
    white-space: nowrap;
  }
  .v {
    font-size: 17px;
    font-weight: 850;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .v small {
    margin-left: 2px;
    font-size: 10.5px;
    font-weight: 650;
    letter-spacing: 0;
    color: var(--text-3);
  }
  .sub {
    font-size: 11.5px;
    color: var(--text-3);
  }
  .bar {
    position: absolute;
    left: 7px;
    right: 7px;
    bottom: 3px;
    height: 3px;
    border-radius: 2px;
  }
  .note {
    padding: 9px 12px;
    border-radius: var(--r);
    background: var(--surface-2);
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-2);
  }
</style>
