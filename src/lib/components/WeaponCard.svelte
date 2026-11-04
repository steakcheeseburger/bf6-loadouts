<script lang="ts">
  import type { Weapon } from '../types';
  import { imageOf } from '../data';
  import { kindOf } from '../ballistics';
  import { classInfo, fullBuildLevel } from '../labels';
  import { openWeapon } from '../state.svelte';
  import TierBadge from './ui/TierBadge.svelte';
  import Tags from './ui/Tags.svelte';
  import RangeStrip from './RangeStrip.svelte';
  import BuildList from './BuildList.svelte';
  import Icon from './ui/Icon.svelte';

  let { weapon: w, eager = false }: { weapon: Weapon; eager?: boolean } = $props();

  const full = $derived(fullBuildLevel(w.build.parts));
  const killLabel = $derived({ auto: 'Time to kill', bolt: 'Shots to kill', shotgun: 'Damage' }[kindOf(w)]);
</script>

<article class="card">
  <button class="hit" onclick={() => openWeapon(w.id)} aria-label="{w.name}: open details"></button>

  <div class="media showroom">
    <img src={imageOf(w)} alt="" width="720" height="216" loading={eager ? 'eager' : 'lazy'} decoding="async" />
    <span class="tier"><TierBadge tier={w.tier} size="lg" /></span>
    <span class="cls">{classInfo(w.class).short}</span>
    <span class="tags"><Tags tags={w.tags} max={2} solid /></span>
  </div>

  <div class="body">
    <header>
      <h3>{w.name}</h3>
      <p class="role">{w.role}</p>
    </header>

    <section>
      <p class="lbl">{killLabel}{#if killLabel !== 'Damage'}<span>· body shots</span>{/if}</p>
      <RangeStrip weapon={w} />
    </section>

    <section class="build">
      <p class="lbl">Best build · <b>{w.build.name}</b></p>
      <BuildList parts={w.build.parts} />
      <p class="total">
        <span>Full build</span>
        <span>
          {#if full.seasonal}<small title="Plus {full.seasonal} part from a seasonal challenge">+ seasonal</small>{/if}
          {#if full.unknown}<small title="Unlock level of {full.unknown} part not known yet">+ ?</small>{/if}
          <b class="num">Lv {full.level}</b>
        </span>
      </p>
    </section>
  </div>

  <p class="more" aria-hidden="true">
    <span>{w.alt ? `Also: ${w.alt.name} build` : 'Details & damage chart'}</span>
    <Icon name="chevron-right" size={16} />
  </p>
</article>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    overflow: hidden;
    transition: border-color 0.12s, box-shadow 0.15s;
  }
  .card:hover {
    border-color: var(--line-strong);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  }
  .hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: 0;
    border-radius: inherit;
    background: transparent;
  }
  .hit:focus-visible {
    outline-offset: -3px;
  }
  .media {
    position: relative;
    height: 128px;
    display: grid;
    place-items: center;
  }
  .media img {
    width: 80%;
    height: 100px;
    object-fit: contain;
    filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.28));
    transition: transform 0.18s var(--ease);
  }
  .card:hover .media img {
    transform: scale(1.04);
  }
  .tier {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  .cls {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(13, 15, 18, 0.82);
    color: #f0efec;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .tags {
    position: absolute;
    left: 10px;
    bottom: 8px;
  }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px 4px;
  }
  h3 {
    font-size: 21px;
    font-weight: 850;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .role {
    margin-top: 1px;
    font-size: 13.5px;
    font-weight: 650;
    line-height: 1.35;
    color: var(--accent);
  }
  .lbl {
    margin-bottom: 5px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .lbl span {
    margin-left: 5px;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }
  .lbl b {
    color: var(--accent);
  }
  .build {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 7px;
    border-top: 1px solid var(--line-strong);
    font-size: 12.5px;
    font-weight: 650;
    color: var(--text-3);
  }
  .total b {
    margin-left: 4px;
    font-size: 15px;
    font-weight: 850;
    color: var(--text);
  }
  .total small {
    font-size: 11.5px;
    font-weight: 600;
  }
  .more {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding: 8px 14px 11px;
    border-top: 1px solid var(--line);
    font-size: 12.5px;
    font-weight: 650;
    color: var(--text-3);
  }
  .card:hover .more {
    color: var(--text);
  }
</style>
