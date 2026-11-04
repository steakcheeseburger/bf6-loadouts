<script lang="ts">
  import type { ChartSeries } from '../types';

  let {
    series,
    marker = null,
    height = 220,
    title = 'Time to kill by distance',
  }: { series: ChartSeries[]; marker?: number | null; height?: number; title?: string } = $props();

  let width = $state(560);
  let hover = $state<number | null>(null);
  let focused = $state(false);

  const M = { l: 46, r: 14, t: 20, b: 28 };
  const maxD = $derived(Math.max(1, ...series.map((s) => s.values.length - 1)));
  const plotW = $derived(Math.max(10, width - M.l - M.r));
  const plotH = $derived(height - M.t - M.b);

  const step = $derived.by(() => {
    const vals = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
    const max = vals.length ? Math.max(...vals) : 1000;
    return max > 1000 ? 400 : max > 500 ? 200 : 100;
  });
  const yMax = $derived.by(() => {
    const vals = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
    const max = vals.length ? Math.max(...vals) : 1000;
    return Math.ceil((max * 1.05) / step) * step;
  });
  const yTicks = $derived(Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step));
  const xTicks = [0, 10, 25, 50, 75, 100];

  const x = (d: number) => M.l + (d / maxD) * plotW;
  const y = (v: number) => M.t + (1 - v / yMax) * plotH;

  function path(values: (number | null)[]): string {
    let d = '';
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  }

  const active = $derived(hover ?? (focused ? (marker ?? 0) : null));
  const rows = $derived(active === null ? [] : series.map((s) => ({ s, v: s.values[active] ?? null, h: s.hits?.[active] ?? null })));
  const valueText = $derived.by(() => {
    const d = active ?? marker ?? 0;
    return `${d} m: ` + series.map((s) => `${series.length > 1 ? `${s.label} ` : ''}${s.values[d] ?? 'unknown'} ms`).join(', ');
  });

  function onMove(e: PointerEvent) {
    const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    hover = Math.round(Math.max(0, Math.min(maxD, ((px - M.l) / plotW) * maxD)));
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    e.stopPropagation();
    const cur = active ?? 0;
    hover = Math.max(0, Math.min(maxD, cur + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 10 : 1)));
  }
</script>

<figure class="chart" bind:clientWidth={width}>
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    role="slider"
    tabindex="0"
    aria-label="{title}. Use the arrow keys to read values."
    aria-valuemin={0}
    aria-valuemax={maxD}
    aria-valuenow={active ?? marker ?? 0}
    aria-valuetext={valueText}
    onpointermove={onMove}
    onpointerleave={() => (hover = null)}
    onfocus={() => (focused = true)}
    onblur={() => {
      focused = false;
      hover = null;
    }}
    onkeydown={onKey}
  >
    {#each yTicks as t (t)}
      <line class="grid" x1={M.l} x2={width - M.r} y1={y(t)} y2={y(t)} />
      <text class="tick" x={M.l - 8} y={y(t) + 4} text-anchor="end">{t}</text>
    {/each}
    <text class="tick" x={M.l - 8} y={M.t - 8} text-anchor="end">ms</text>
    <line class="base" x1={M.l} x2={width - M.r} y1={y(0)} y2={y(0)} />
    {#each xTicks as t (t)}
      <text class="tick" x={x(t)} y={height - 8} text-anchor="middle">{t}{t === 100 ? ' m' : ''}</text>
    {/each}

    {#if marker !== null}
      <line class="marker" x1={x(marker)} x2={x(marker)} y1={M.t + 4} y2={y(0)} />
      <text class="marker-label" x={x(marker)} y={M.t - 4} text-anchor="middle">{marker} m</text>
    {/if}

    {#each series as s (s.label)}
      <path d={path(s.values)} fill="none" stroke={s.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
    {/each}

    {#if active !== null}
      <line class="cross" x1={x(active)} x2={x(active)} y1={M.t} y2={y(0)} />
    {/if}
    {#each series as s (s.label)}
      {@const d = active ?? marker}
      {@const v = d === null ? null : (s.values[d] ?? null)}
      {#if d !== null && v !== null}
        <circle class="dot" cx={x(d)} cy={y(v)} r="4.5" fill={s.color} />
      {/if}
    {/each}
  </svg>

  {#if active !== null}
    <div class="tip" class:flip={x(active) > width * 0.6} style="left: {x(active)}px">
      <p class="d num">{active} m</p>
      {#each rows as r (r.s.label)}
        <p class="r">
          <span class="key" style="background: {r.s.color}"></span>
          <b class="num">{r.v === null ? '?' : `${r.v} ms`}</b>
          {#if r.h !== null}<span class="m num">{r.h} hits</span>{/if}
          {#if series.length > 1}<span class="m">{r.s.label}</span>{/if}
        </p>
      {/each}
    </div>
  {/if}

  {#if series.length > 1}
    <figcaption class="legend">
      {#each series as s (s.label)}<span><i style="background: {s.color}"></i>{s.label}</span>{/each}
    </figcaption>
  {/if}
</figure>

<style>
  .chart {
    position: relative;
    margin: 0;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    cursor: crosshair;
    touch-action: pan-y;
  }
  svg:focus-visible {
    outline-offset: 4px;
  }
  .grid {
    stroke: var(--grid);
  }
  .base {
    stroke: var(--axis);
  }
  .tick {
    fill: var(--text-3);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .marker {
    stroke: var(--text-3);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
  }
  .marker-label {
    fill: var(--text-2);
    font-size: 11px;
    font-weight: 700;
  }
  .cross {
    stroke: var(--text-2);
  }
  .dot {
    stroke: var(--surface);
    stroke-width: 2;
  }
  .tip {
    position: absolute;
    top: 4px;
    z-index: 2;
    min-width: 120px;
    padding: 7px 10px;
    transform: translateX(12px);
    border-radius: 8px;
    border: 1px solid var(--line-strong);
    background: var(--surface-3);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
    font-size: 12.5px;
    pointer-events: none;
  }
  .tip.flip {
    transform: translateX(calc(-100% - 12px));
  }
  .d {
    margin-bottom: 3px;
    font-size: 11.5px;
    color: var(--text-3);
  }
  .r {
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }
  .key {
    flex: none;
    width: 12px;
    height: 2px;
    border-radius: 2px;
  }
  .m {
    color: var(--text-3);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--text-2);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .legend i {
    display: inline-block;
    width: 14px;
    height: 2px;
    border-radius: 2px;
  }
</style>
