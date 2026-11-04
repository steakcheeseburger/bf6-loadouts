<script lang="ts">
  import { byId, imageOf, season } from '../data';
  import { applyBestFor, openWeapon, ui } from '../state.svelte';
  import TierBadge from './ui/TierBadge.svelte';

  // the header brings the list back into view after any filter change
</script>

<section id="now" class="wrap now" aria-labelledby="now-title">
  <div class="section-head">
    <div>
      <h2 id="now-title">Strong right now</h2>
      <p>The guns to pick this season, and the ones to skip. Click a gun for its build.</p>
    </div>
  </div>

  <div class="spot">
    {#each season.spotlight as col (col.id)}
      <div class="col">
        <h3><span class="dot {col.tone}" aria-hidden="true"></span>{col.title}</h3>
        <p class="blurb">{col.blurb}</p>
        <ul>
          {#each col.picks as p (p.weapon)}
            {@const w = byId[p.weapon]}
            <li>
              <button class="pick" onclick={() => openWeapon(w.id)}>
                <span class="thumb showroom"><img src={imageOf(w)} alt="" width="720" height="216" /></span>
                <span class="txt">
                  <span class="nm"><TierBadge tier={w.tier} size="sm" />{w.name}</span>
                  <span class="note">{p.note}</span>
                </span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <h3 class="sub">Best for…</h3>
  <div class="best-for">
    {#each season.bestFor as b (b.id)}
      <button class="bf" aria-pressed={ui.bestFor === b.id} onclick={() => applyBestFor(b.id)} title={b.hint}>
        <span class="t">{b.title}</span>
        <span class="n">{b.picks.map((p) => byId[p.weapon].name).join(' · ')}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .now {
    padding-top: 80px;
  }
  .spot {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .col {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 14px 10px 8px;
  }
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 6px;
    font-size: 16px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .hot {
    background: var(--critical);
  }
  .good {
    background: var(--good);
  }
  .warn {
    background: var(--warning);
  }
  .blurb {
    margin: 2px 6px 8px;
    font-size: 13px;
    color: var(--text-3);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li + li {
    border-top: 1px solid var(--line);
  }
  .pick {
    width: 100%;
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 12px;
    align-items: center;
    padding: 8px 6px;
    border: 0;
    border-radius: var(--r);
    background: transparent;
    text-align: left;
  }
  .pick:hover {
    background: var(--hover);
  }
  .thumb {
    height: 38px;
    border-radius: 7px;
    display: grid;
    place-items: center;
  }
  .thumb img {
    width: 92%;
    max-height: 34px;
    object-fit: contain;
  }
  .txt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .nm {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 14.5px;
  }
  .note {
    font-size: 13px;
    color: var(--text-2);
    line-height: 1.35;
  }
  .sub {
    margin: 26px 0 10px;
    font-size: 16px;
  }
  .best-for {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .bf {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px 12px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface);
    text-align: left;
    min-width: 0;
  }
  .bf:hover {
    border-color: var(--line-strong);
    background: var(--surface-2);
  }
  .bf[aria-pressed='true'] {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .t {
    font-weight: 750;
    font-size: 14.5px;
  }
  .n {
    max-width: 100%;
    font-size: 12.5px;
    color: var(--text-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 1050px) {
    .spot {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      margin: 0 -24px;
      padding: 0 24px 6px;
      scroll-padding: 0 24px;
    }
    .col {
      flex: 0 0 min(420px, 86%);
      scroll-snap-align: start;
    }
    .best-for {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .spot {
      margin: 0 -14px;
      padding: 0 14px 6px;
      scroll-padding: 0 14px;
    }
  }
</style>
