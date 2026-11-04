<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Weapon } from '../types';
  import { imageOf, weapons } from '../data';
  import { RANGES, boltShotsAt, hitsAt, hitsCurve, kindOf, ttkAt, ttkCurve } from '../ballistics';
  import { CLASSES, classInfo, fmt } from '../labels';
  import { closeWeapon, openWeapon, rangeInfo, ui } from '../state.svelte';
  import TierBadge from './ui/TierBadge.svelte';
  import Tags from './ui/Tags.svelte';
  import Icon from './ui/Icon.svelte';
  import BuildList from './BuildList.svelte';
  import KillChart from './KillChart.svelte';
  import SweetSpot from './SweetSpot.svelte';

  let { weapon: w, list }: { weapon: Weapon; list: Weapon[] } = $props();

  let tab = $state<'best' | 'alt'>('best');
  let compareId = $state('');
  let closeBtn: HTMLButtonElement | undefined = $state();
  let scroller: HTMLDivElement | undefined = $state();
  let lastId = '';

  const idx = $derived(list.findIndex((x) => x.id === w.id));
  const prev = $derived(idx > 0 ? list[idx - 1] : null);
  const next = $derived(idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null);
  const kind = $derived(kindOf(w));
  const s = $derived(w.stats);
  const build = $derived(tab === 'alt' && w.alt ? w.alt : w.build);
  const range = $derived(rangeInfo());

  /** guns you can overlay on the chart: other automatic weapons, same class first */
  const compareOptions = $derived(
    CLASSES.map((c) => ({
      label: c.label,
      items: weapons.filter((x) => x.class === c.id && x.id !== w.id && kindOf(x) === 'auto'),
    })).filter((g) => g.items.length && (g.label !== 'Pistols' || w.class === 'Pistol')),
  );
  const other = $derived(weapons.find((x) => x.id === compareId) ?? null);
  const series = $derived([
    { label: w.name, color: 'var(--series-1)', values: ttkCurve(w), hits: hitsCurve(w) },
    ...(other ? [{ label: other.name, color: 'var(--series-2)', values: ttkCurve(other), hits: hitsCurve(other) }] : []),
  ]);

  $effect(() => {
    if (w.id !== lastId) {
      lastId = w.id;
      tab = 'best';
      compareId = '';
      scroller?.scrollTo({ top: 0 });
    }
  });

  onMount(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    tick().then(() => closeBtn?.focus());
    return () => {
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  });

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    const busy = ['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName) || t.tagName.toLowerCase() === 'svg';
    if (e.key === 'Escape') {
      e.preventDefault();
      closeWeapon();
    } else if (!busy && e.key === 'ArrowLeft' && prev) openWeapon(prev.id);
    else if (!busy && e.key === 'ArrowRight' && next) openWeapon(next.id);
  }

</script>

<svelte:window onkeydown={onKey} />

<div class="scrim" onclick={closeWeapon} aria-hidden="true"></div>

<div class="panel" role="dialog" aria-modal="true" aria-labelledby="wd-title">
  <div class="top">
    <div class="nav">
      <button class="btn icon" onclick={() => prev && openWeapon(prev.id)} disabled={!prev} aria-label={prev ? `Previous: ${prev.name}` : 'Previous'} title={prev?.name}>
        <Icon name="chevron-left" />
      </button>
      <span class="pos num">{idx + 1} / {list.length}</span>
      <button class="btn icon" onclick={() => next && openWeapon(next.id)} disabled={!next} aria-label={next ? `Next: ${next.name}` : 'Next'} title={next?.name}>
        <Icon name="chevron-right" />
      </button>
    </div>
    <button class="btn icon" bind:this={closeBtn} onclick={closeWeapon} aria-label="Close"><Icon name="x" /></button>
  </div>

  <div class="scroll" bind:this={scroller}>
    <div class="hero showroom">
      {#key w.id}<img src={imageOf(w)} alt={w.name} width="720" height="216" />{/key}
      <span class="tier"><TierBadge tier={w.tier} size="lg" /></span>
      <span class="cls">{classInfo(w.class).label}</span>
    </div>

    <div class="content">
      <header>
        <h2 id="wd-title">{w.name}</h2>
        <p class="role">{w.role}</p>
        <Tags tags={w.tags} max={4} />
      </header>

      <p class="lead">{w.bestAt}</p>

      <!-- attachments -->
      <section aria-labelledby="h-build">
        <div class="sh">
          <h3 id="h-build">Attachments</h3>
          {#if w.alt}
            <div class="seg" role="group" aria-label="Build">
              <button aria-pressed={tab === 'best'} onclick={() => (tab = 'best')}>Best · {w.build.name}</button>
              <button aria-pressed={tab === 'alt'} onclick={() => (tab = 'alt')}>Alt · {w.alt.name}</button>
            </div>
          {:else}
            <span class="hint">Best build · <b>{w.build.name}</b></span>
          {/if}
        </div>
        {#if tab === 'alt' && w.alt?.when}<p class="when"><b>Use it for:</b> {w.alt.when}</p>{/if}
        <div class="box">
          <BuildList parts={build.parts} detailed />
        </div>
        {#if tab === 'best' && w.build.notes}<p class="small">{w.build.notes}</p>{/if}
      </section>

      <!-- time to kill -->
      <section aria-labelledby="h-ttk">
        <div class="sh">
          <h3 id="h-ttk">{kind === 'bolt' ? 'One-shot range' : 'Time to kill'}</h3>
          <span class="hint">body shots vs a full-health enemy</span>
        </div>

        {#if kind === 'auto' && s?.damage}
          <div class="dist" role="group" aria-label="Time to kill at each fight distance">
            {#each RANGES as r (r.id)}
              {@const ms = ttkAt(w, r.m)}
              {@const hits = hitsAt(w, r.m)}
              <button class="cell" class:on={ui.range === r.id} onclick={() => (ui.range = r.id)} aria-pressed={ui.range === r.id}>
                <span class="r">{r.label} <small>{r.m} m</small></span>
                <b class="num">{ms === null ? '–' : `${ms} ms`}</b>
                <span class="h num">{hits === null ? 'unknown' : `${hits} hits`}</span>
              </button>
            {/each}
          </div>
          <div class="box">
            <KillChart {series} marker={range.m} title="{w.name} time to kill by distance" />
            <label class="cmp">
              <span>Compare with</span>
              <select bind:value={compareId}>
                <option value="">— none —</option>
                {#each compareOptions as g (g.label)}
                  <optgroup label={g.label}>
                    {#each g.items as o (o.id)}<option value={o.id}>{o.name}</option>{/each}
                  </optgroup>
                {/each}
              </select>
            </label>
          </div>
          {#if s.damageKnownToM !== undefined}<p class="small">Only the close-range damage is known for this gun; values beyond {s.damageKnownToM} m are unknown.</p>{/if}
        {:else if kind === 'bolt' && s?.sweetSpots}
          <div class="box">
            <SweetSpot spots={s.sweetSpots} marker={range.m} />
          </div>
          <p class="small">At your fight distance ({range.m} m): <b>{boltShotsAt(w, range.m)} body {boltShotsAt(w, range.m) === 1 ? 'shot' : 'shots'}</b>.</p>
        {:else if s?.note}
          <p class="callout">{s.note}</p>
        {/if}
      </section>

      {#if s}
        <section aria-labelledby="h-hand">
          <h3 id="h-hand">Handling</h3>
          <dl class="grid">
            <div><dt>Fire rate</dt><dd class="num">{s.rpm}<small> rpm</small></dd></div>
            <div><dt>Magazine (base)</dt><dd class="num">{s.magazine}</dd></div>
            <div><dt>Bullet speed</dt><dd class="num">{s.velocity}<small> m/s</small></dd></div>
            <div><dt>Aim time</dt><dd class="num">{s.adsMs}<small> ms</small></dd></div>
            <div><dt>Reload</dt><dd class="num">{s.reloadS ?? '–'}<small> s</small></dd></div>
            {#if s.headshot !== 1}<div><dt>Headshot</dt><dd class="num">×{s.headshot}</dd></div>{/if}
          </dl>
        </section>
      {/if}

      <section aria-labelledby="h-where">
        <h3 id="h-where">Where it shines</h3>
        <p class="text">{w.shines}</p>
      </section>

      <section aria-labelledby="h-get">
        <h3 id="h-get">How to get it</h3>
        <p class="text">{w.unlock}</p>
      </section>

    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--scrim);
    animation: fade 0.12s ease-out;
  }
  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 51;
    width: min(640px, 100vw);
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border-left: 1px solid var(--line-strong);
    box-shadow: var(--shadow);
    animation: slide 0.18s var(--ease);
  }
  @keyframes slide {
    from {
      transform: translateX(24px);
      opacity: 0;
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pos {
    min-width: 56px;
    text-align: center;
    font-size: 12.5px;
    color: var(--text-3);
  }
  .scroll {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .hero {
    position: relative;
    height: 220px;
    display: grid;
    place-items: center;
  }
  .hero img {
    width: 86%;
    height: 180px;
    object-fit: contain;
    filter: drop-shadow(0 12px 14px rgba(0, 0, 0, 0.3));
    animation: fade 0.15s ease-out;
  }
  .tier {
    position: absolute;
    top: 14px;
    left: 14px;
  }
  .cls {
    position: absolute;
    top: 14px;
    right: 14px;
    padding: 4px 9px;
    border-radius: 6px;
    background: rgba(13, 15, 18, 0.82);
    color: #f0efec;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding: 20px 22px 44px;
  }
  h2 {
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .role {
    margin: 4px 0 10px;
    font-size: 15px;
    font-weight: 700;
    color: var(--accent);
  }
  .lead {
    margin-top: -10px;
    font-size: 16px;
    line-height: 1.55;
    color: var(--text-2);
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  h3 {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
  }
  .sh {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hint {
    font-size: 13px;
    color: var(--text-3);
  }
  .hint b {
    color: var(--accent);
  }
  .when {
    font-size: 14px;
    color: var(--text-2);
  }
  .box {
    padding: 12px 14px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
  }
  .small {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-3);
  }
  .small b {
    color: var(--text);
  }
  .text {
    font-size: 15px;
    line-height: 1.55;
    color: var(--text-2);
  }
  .callout {
    padding: 12px 14px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
    font-size: 15px;
  }
  .dist {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    padding: 9px 10px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
    text-align: left;
  }
  .cell:hover {
    border-color: var(--line-strong);
  }
  .cell.on {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
  }
  .cell .r {
    font-size: 12px;
    font-weight: 650;
    color: var(--text-2);
  }
  .cell .r small {
    color: var(--text-3);
    font-weight: 500;
  }
  .cell b {
    font-size: 19px;
    font-weight: 850;
  }
  .cell .h {
    font-size: 12.5px;
    color: var(--text-3);
  }
  .cmp {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    font-size: 13px;
    color: var(--text-3);
  }
  .cmp select {
    flex: 1;
    max-width: 260px;
    height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--text);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 0;
  }
  .grid div {
    padding: 8px 10px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
  }
  dt {
    font-size: 12px;
    color: var(--text-3);
  }
  dd {
    margin: 2px 0 0;
    font-size: 18px;
    font-weight: 800;
  }
  dd small {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-3);
  }
  @media (max-width: 560px) {
    .content {
      padding: 16px 14px 40px;
    }
    .hero {
      height: 170px;
    }
    .hero img {
      height: 140px;
    }
    .dist {
      grid-template-columns: repeat(2, 1fr);
    }
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
