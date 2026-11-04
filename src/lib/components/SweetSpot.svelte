<script lang="ts">
  import type { SweetSpot } from '../types';

  let { spots, marker = null }: { spots: SweetSpot[]; marker?: number | null } = $props();

  const MAX = 200;
  const ticks = [0, 50, 100, 150, 200];
  const pct = (d: number) => `${(Math.min(d, MAX) / MAX) * 100}%`;
</script>

<div class="ss">
  {#if !spots.length}
    <p class="none">No body one-shot range — body shots always take 2 hits. <b>Headshots kill at any range.</b></p>
  {:else}
    {#each spots as s (s.label)}
      <div class="track">
        <p class="lab"><b class="num">{s.from}–{s.to} m</b> <span>{s.label}</span></p>
        <div class="bar" role="img" aria-label="{s.label}: one body shot kills from {s.from} to {s.to} metres">
          <span class="band" style="left: {pct(s.from)}; width: calc({pct(s.to)} - {pct(s.from)})"></span>
          {#if marker !== null}<span class="mk" style="left: {pct(marker)}"></span>{/if}
        </div>
      </div>
    {/each}
    <div class="axis" aria-hidden="true">
      {#each ticks as t (t)}<span style="left: {pct(t)}">{t}{t === MAX ? ' m' : ''}</span>{/each}
    </div>
    <p class="foot">Inside the blue band one body shot kills. Everywhere else a body shot needs 2 hits. Headshots always kill.</p>
  {/if}
</div>

<style>
  .ss {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .none {
    font-size: 14px;
    color: var(--text-2);
  }
  .lab {
    margin-bottom: 4px;
    font-size: 13px;
  }
  .lab span {
    color: var(--text-3);
  }
  .bar {
    position: relative;
    height: 14px;
    border-radius: 7px;
    background: var(--surface-3);
  }
  .band {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 7px;
    background: var(--series-1);
  }
  .mk {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: var(--text);
  }
  .axis {
    position: relative;
    height: 16px;
    font-size: 11px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .axis span {
    position: absolute;
    transform: translateX(-50%);
  }
  .axis span:first-child {
    transform: none;
  }
  .axis span:last-child {
    transform: translateX(-100%);
  }
  .foot {
    font-size: 12.5px;
    color: var(--text-3);
  }
</style>
