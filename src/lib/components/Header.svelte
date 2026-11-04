<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { season } from '../data';
  import { RANGES, type Range } from '../ballistics';
  import { CLASSES, TIERS } from '../labels';
  import { classAnchor, isFiltered, prefs, resetFilters, toggleTheme, toggleTier, ui, type Group, type SortKey } from '../state.svelte';
  import { scrollToEl, scrollToY } from '../scroll';
  import Icon from './ui/Icon.svelte';
  import Dropdown from './ui/Dropdown.svelte';

  let { groups, shown }: { groups: Group[]; shown: number } = $props();

  let height = $state(0); // whole header
  let navH = $state(0); // section tabs row
  let phone = $state(false);
  let active = $state('');
  let input: HTMLInputElement | undefined = $state();
  let tabs: HTMLElement | undefined = $state();

  const updated = new Date(`${season.updated}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const seasonShort = season.name.split(' · ')[0];
  const extra = [
    { id: 'now', label: 'Strong right now' },
    { id: 'guide', label: 'Attachment guide' },
    { id: 'about', label: 'How to read' },
  ];
  // "Fastest kill" always needs a distance, so the two live in one picker; cards highlight that distance.
  const sortOptions = [
    { value: 'best', label: 'Best first' },
    ...RANGES.map((r) => ({ value: `fastest:${r.id}`, label: `Fastest kill · ${r.label.toLowerCase()} (${r.m} m)`, short: `Fastest · ${r.m} m` })),
    { value: 'name', label: 'A–Z' },
  ];
  const sortValue = $derived(ui.sort === 'fastest' ? `fastest:${ui.range}` : ui.sort);
  function pickSort(v: string) {
    const [sort, range] = v.split(':');
    ui.sort = sort as SortKey;
    if (range) ui.range = range as Range['id'];
  }
  const bestForOptions = [{ value: '', label: 'Any' }, ...season.bestFor.map((b) => ({ value: b.id, label: b.title }))];

  const classTabs = $derived(
    CLASSES.map((c) => ({ id: classAnchor(c.id), label: c.short, title: c.label, n: groups.find((g) => g.key === c.id)?.items.length ?? 0 })),
  );
  const bestFor = $derived(season.bestFor.find((b) => b.id === ui.bestFor) ?? null);
  const filtered = $derived(isFiltered());

  // Desktop: the whole header sticks. Phones: the top part scrolls away and only the section tabs stay.
  const visible = $derived(phone ? navH : height);
  $effect(() => {
    document.documentElement.style.scrollPaddingTop = `${visible + 8}px`;
  });

  export function focusSearch() {
    input?.focus();
    input?.select();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (ui.q) {
        ui.q = '';
        e.stopPropagation();
      } else input?.blur();
    }
  }

  /* ------------------------------------------------ section tabs + scroll spy */

  let jumping = false;
  let jumpId = 0;

  const sectionIds = () => [...classTabs.filter((t) => t.n !== 0).map((t) => t.id), ...extra.map((x) => x.id)];

  function spy() {
    if (jumping) return;
    const ids = sectionIds();
    const line = visible + 32;
    let cur = ids[0] ?? '';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) cur = id;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = ids[ids.length - 1] ?? cur;
    active = cur;
  }

  function jump(e: MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    active = id;
    jumping = true;
    // a newer jump interrupts this one; only the latest may end the jump
    const n = ++jumpId;
    scrollToEl(el, () => {
      if (n !== jumpId) return;
      jumping = false;
      spy();
    });
  }

  function toTop(e: MouseEvent) {
    e.preventDefault();
    scrollToY(0);
  }

  // keep the highlighted tab in view when the tab row scrolls sideways (phones)
  $effect(() => {
    const el = tabs?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!tabs || !el) return;
    const l = el.offsetLeft;
    const r = l + el.offsetWidth;
    if (l < tabs.scrollLeft) tabs.scrollTo({ left: l - 12 });
    else if (r > tabs.scrollLeft + tabs.clientWidth) tabs.scrollTo({ left: r - tabs.clientWidth + 12 });
  });

  // After a filter change, stay in the section you were reading (or go back to the top of the list).
  // Runs a frame later, once the new list is laid out.
  let lastFilter = '';
  $effect.pre(() => {
    const key = [ui.q, ui.tiers.join(''), ui.sort, ui.bestFor].join('|');
    if (lastFilter && key !== lastFilter) {
      const at = untrack(() => active);
      requestAnimationFrame(() => keepPlace(at));
    }
    lastFilter = key;
  });

  function keepPlace(at: string) {
    const list = document.querySelector('main');
    if (!list) return;
    const section = classTabs.some((t) => t.id === at) ? document.getElementById(at) : null;
    const target = section ?? list;
    const y = Math.max(0, target.getBoundingClientRect().top + scrollY - visible - (section ? 8 : 0));
    if (scrollY > y + 1) scrollTo({ top: y, behavior: 'instant' });
    spy();
  }

  onMount(() => {
    const mq = matchMedia('(max-width: 760px)');
    const setPhone = () => (phone = mq.matches);
    setPhone();
    mq.addEventListener('change', setPhone);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(spy);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    spy();
    return () => {
      mq.removeEventListener('change', setPhone);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  });
</script>

<header class="head" bind:clientHeight={height} style="top: {phone ? navH - height : 0}px">
  <div class="wrap top">
    <a class="brand" href="#top" aria-label="{season.title} — back to top" onclick={toTop}>
      <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <path d="M14 40h26l6-6h4v6h-3l-3 4H30l-2 6h-7l2-6h-9z" fill="var(--accent-ink)" />
        <rect x="20" y="22" width="18" height="6" rx="2" fill="var(--accent-ink)" />
      </svg>
      <span class="id" title="{season.name} · {season.patch}">
        <h1>{season.title}</h1>
        <small>{seasonShort} · updated {updated}</small>
      </span>
    </a>

    <label class="search">
      <Icon name="search" size={17} />
      <span class="sr-only">Search weapons or attachments</span>
      <input
        bind:this={input}
        bind:value={ui.q}
        onkeydown={onKey}
        type="search"
        placeholder="Search guns or attachments…"
        autocomplete="off"
        spellcheck="false"
      />
      <span class="slot">
        {#if ui.q}
          <button class="clear" onclick={() => (ui.q = '')} aria-label="Clear search"><Icon name="x" size={15} /></button>
        {:else}
          <kbd title="Press / to search">/</kbd>
        {/if}
      </span>
    </label>

    <div class="filters">
      <div class="tiers" role="group" aria-label="Show only these tiers">
        <span class="k" aria-hidden="true">Tier</span>
        {#each TIERS as t (t)}
          <button
            aria-pressed={ui.tiers.includes(t)}
            onclick={() => toggleTier(t)}
            style="--c: var(--tier-{t}); --ink: var(--tier-{t}-ink)"
            title="{ui.tiers.includes(t) ? 'Hide' : 'Show'} {t} tier"
          >
            {t}
          </button>
        {/each}
      </div>
      <div class="dds">
        <Dropdown label="Sort" value={sortValue} options={sortOptions} onchange={pickSort} />
        <Dropdown
          label="Best for"
          value={ui.bestFor ?? ''}
          options={bestForOptions}
          onchange={(v) => (ui.bestFor = v || null)}
          active={bestFor !== null}
          title={bestFor?.hint}
        />
      </div>
      <button class="reset" class:show={filtered} disabled={!filtered} onclick={resetFilters}>Reset</button>
    </div>

    <button
      class="btn icon theme"
      onclick={toggleTheme}
      aria-label="Switch to {prefs.theme === 'dark' ? 'light' : 'dark'} theme"
      title="Switch theme"
    >
      <Icon name={prefs.theme === 'dark' ? 'sun' : 'moon'} size={17} />
    </button>
  </div>

  <div class="navrow" bind:clientHeight={navH}>
    <nav class="wrap" aria-label="Sections">
      <div class="tabs" bind:this={tabs}>
        {#each classTabs as t (t.id)}
          <a
            href="#{t.id}"
            data-id={t.id}
            class:on={active === t.id}
            class:empty={t.n === 0}
            aria-disabled={t.n === 0}
            tabindex={t.n === 0 ? -1 : undefined}
            title={t.title}
            onclick={(e) => jump(e, t.id)}
          >
            {t.label}<span class="n">{t.n}</span>
          </a>
        {/each}
        <span class="gap" aria-hidden="true"></span>
        {#each extra as x (x.id)}
          <a href="#{x.id}" data-id={x.id} class="more" class:on={active === x.id} onclick={(e) => jump(e, x.id)}>{x.label}</a>
        {/each}
      </div>
    </nav>
  </div>
  <p class="sr-only" aria-live="polite">{shown} guns shown</p>
</header>

<style>
  .head {
    position: sticky;
    z-index: 30;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
  }

  /* ---- row 1: brand, search, filters, theme */
  .top {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 60px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex: none;
    min-width: 0;
    margin-right: 4px;
    text-decoration: none;
  }
  .brand svg {
    flex: none;
  }
  .id {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.2;
  }
  h1 {
    font-size: 15.5px;
    font-weight: 850;
    white-space: nowrap;
  }
  .id small {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11.5px;
    color: var(--text-3);
    white-space: nowrap;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 200px;
    min-width: 0;
    max-width: 420px;
    height: 36px;
    padding: 0 6px 0 11px;
    border-radius: var(--r);
    border: 1px solid var(--line-strong);
    background: var(--surface-2);
    color: var(--text-3);
  }
  .search:focus-within {
    border-color: var(--focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 25%, transparent);
  }
  .search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 14.5px;
  }
  .search input::-webkit-search-cancel-button {
    display: none;
  }
  /* "/" hint and clear button share one fixed slot so nothing moves while typing */
  .slot {
    display: grid;
    place-items: center;
    flex: none;
    width: 24px;
    height: 24px;
  }
  kbd {
    font: 600 12px/1 var(--font);
    border: 1px solid var(--line-strong);
    border-radius: 5px;
    padding: 3px 6px;
  }
  .clear {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 6px;
    background: var(--surface-3);
    color: var(--text-2);
  }
  .filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
    margin-left: auto;
  }
  .dds {
    display: flex;
    gap: 8px;
  }
  /* fixed widths, so picking an option moves nothing */
  .dds > :global(.dd:first-child) {
    width: 212px;
  }
  .dds > :global(.dd:last-child) {
    width: 196px;
  }
  .tiers {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    height: 34px;
    padding: 0 4px 0 11px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
  }
  .tiers .k {
    margin-right: 5px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-3);
  }
  .tiers button {
    width: 25px;
    height: 25px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    box-shadow: inset 0 -2px 0 var(--c);
    font-size: 13px;
    font-weight: 850;
    color: var(--text-2);
  }
  .tiers button:hover {
    background: var(--hover);
    color: var(--text);
  }
  .tiers button[aria-pressed='true'] {
    background: var(--c);
    box-shadow: none;
    color: var(--ink);
  }
  .reset {
    width: 54px;
    height: 34px;
    padding: 0;
    border: 0;
    border-radius: var(--r);
    background: none;
    font-size: 13px;
    font-weight: 750;
    color: var(--accent);
    visibility: hidden;
  }
  .reset.show {
    visibility: visible;
  }
  .reset:hover {
    background: var(--hover);
  }
  .theme {
    flex: none;
  }

  /* ---- row 2: section tabs */
  .navrow {
    border-top: 1px solid var(--line);
  }
  .tabs {
    position: relative;
    display: flex;
    height: 42px;
    margin: 0 -10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tabs a {
    position: relative;
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    font-size: 13.5px;
    font-weight: 650;
    color: var(--text-2);
    text-decoration: none;
    white-space: nowrap;
  }
  .tabs a:hover {
    color: var(--text);
  }
  .tabs a.on {
    color: var(--text);
  }
  .tabs a.on::after {
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--accent);
  }
  .tabs a:focus-visible {
    outline-offset: -4px;
  }
  .n {
    min-width: 2ch;
    font-weight: 500;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .tabs a.empty {
    opacity: 0.35;
    pointer-events: none;
  }
  .gap {
    flex: 1 0 16px;
  }
  .tabs a.more {
    font-size: 13px;
    color: var(--text-3);
  }
  .tabs a.more:hover,
  .tabs a.more.on {
    color: var(--text);
  }

  /* ---- tablets: filters get their own line */
  @media (max-width: 1220px) {
    .top {
      flex-wrap: wrap;
      row-gap: 10px;
      height: auto;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .search {
      max-width: none;
    }
    .filters {
      order: 4;
      flex-basis: 100%;
      margin-left: 0;
    }
  }

  /* ---- phones */
  @media (max-width: 760px) {
    .brand {
      flex: 1 1 0;
    }
    .theme {
      order: 2;
    }
    .search {
      order: 3;
      flex-basis: 100%;
    }
    .filters {
      flex-wrap: wrap;
      row-gap: 8px;
    }
    .reset {
      margin-left: auto;
    }
    .dds {
      order: 3;
      flex-basis: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .dds > :global(.dd:first-child),
    .dds > :global(.dd:last-child) {
      width: auto;
    }
    .dds > :global(.dd) {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 0;
      height: 44px;
      padding-right: 24px;
    }
    .dds > :global(.dd svg) {
      position: absolute;
      right: 7px;
    }
    .dds > :global(.dd .k) {
      font-size: 11px;
    }
    .dds > :global(.dd .v) {
      max-width: 100%;
      font-size: 13px;
    }
  }
</style>
