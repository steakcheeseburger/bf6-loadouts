<script lang="ts">
  import { onMount } from 'svelte';
  import { byId, weapons } from './lib/data';
  import { initTheme, onPopState, readUrl, replaceUrl, resetFilters, results, ui } from './lib/state.svelte';
  import Header from './lib/components/Header.svelte';
  import RightNow from './lib/components/RightNow.svelte';
  import WeaponCard from './lib/components/WeaponCard.svelte';
  import WeaponDetail from './lib/components/WeaponDetail.svelte';
  import Guide from './lib/components/Guide.svelte';
  import Footer from './lib/components/Footer.svelte';

  initTheme();
  readUrl();

  let header: Header | undefined = $state();

  const res = $derived(results());
  const open = $derived(ui.open ? byId[ui.open] : null);
  const navList = $derived(open && res.flat.some((w) => w.id === open.id) ? res.flat : weapons);

  // Keep the address bar in sync (debounced — some browsers rate-limit replaceState).
  $effect(() => {
    const key = [ui.q, ui.tiers.join(''), ui.range, ui.sort, ui.bestFor, ui.open].join('|');
    const t = setTimeout(replaceUrl, 250);
    return () => {
      void key;
      clearTimeout(t);
    };
  });

  onMount(() => {
    addEventListener('popstate', onPopState);
    return () => removeEventListener('popstate', onPopState);
  });

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName) || t.isContentEditable;
    if (e.key === '/' && !typing && !ui.open) {
      e.preventDefault();
      header?.focusSearch();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div id="top"></div>
<Header bind:this={header} groups={res.groups} shown={res.flat.length} />
<main>
  <section id="weapons" aria-labelledby="weapons-title">
      <h2 id="weapons-title" class="sr-only">All weapons</h2>

      <div class="wrap results">
        {#if !res.flat.length}
          <div class="empty">
            <p class="big">No guns match.</p>
            <p>Try another word, or show everything again.</p>
            <button class="btn" onclick={resetFilters}>Reset filters</button>
          </div>
        {:else}
          {#each res.groups as g, gi (g.key)}
            <section class="group" id={g.anchor} aria-labelledby="{g.anchor}-title">
              <div class="gh">
                <h3 id="{g.anchor}-title">{g.title}</h3>
                <span>{g.items.length} {g.items.length === 1 ? 'gun' : 'guns'}<span class="note">{` · ${g.note}`}</span></span>
              </div>
              <div class="grid">
                {#each g.items as w, i (w.id)}<WeaponCard weapon={w} eager={gi === 0 && i < 4} />{/each}
              </div>
            </section>
          {/each}
        {/if}
      </div>
    </section>

    <RightNow />
    <Guide />
</main>
<Footer />

{#if open}
  <WeaponDetail weapon={open} list={navList} />
{/if}

<style>
  /* keeps the sections below from jumping up when a filter leaves only a few guns */
  .results {
    min-height: 85vh;
    padding-top: 22px;
  }
  .group + .group {
    margin-top: 36px;
  }
  .gh {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
  }
  .gh h3 {
    white-space: nowrap;
    font-size: 20px;
    letter-spacing: -0.01em;
  }
  .gh > span {
    font-size: 13px;
    color: var(--text-3);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 16px;
  }
  @media (max-width: 640px) {
    .note {
      display: none;
    }
  }
  .empty {
    padding: 70px 20px;
    text-align: center;
    color: var(--text-3);
  }
  .empty .big {
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
  }
  .empty p {
    margin-bottom: 14px;
  }
</style>
