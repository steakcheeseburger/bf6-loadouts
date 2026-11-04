<script lang="ts">
  import Icon from './Icon.svelte';

  /**
   * A labelled pill ("Sort  Best first ▾") over a native <select>, so the whole pill is clickable
   * and phones get their own picker.
   */
  let {
    label,
    value,
    options,
    onchange,
    active = false,
    title,
  }: {
    label: string;
    value: string;
    /** short: what the pill shows when this option is picked (defaults to label) */
    options: { value: string; label: string; short?: string }[];
    onchange: (value: string) => void;
    active?: boolean;
    title?: string;
  } = $props();

  const shown = (o: { label: string; short?: string }) => o.short ?? o.label;
</script>

<!-- every option is laid out in the same grid cell, so the pill is as wide as the longest one and never changes width -->
<label class="dd" class:active {title}>
  <span class="k">{label}</span>
  <span class="v">
    {#each options as o (o.value)}<span class:on={o.value === value} aria-hidden={o.value !== value}>{shown(o)}</span>{/each}
  </span>
  <Icon name="chevron-down" size={15} />
  <select {value} aria-label={label} onchange={(e) => onchange(e.currentTarget.value)}>
    {#each options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
  </select>
</label>

<style>
  .dd {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    min-width: 0;
    padding: 0 9px 0 11px;
    border-radius: var(--r);
    border: 1px solid var(--line);
    background: var(--surface-2);
    color: var(--text-3);
    white-space: nowrap;
  }
  .dd:hover {
    border-color: var(--line-strong);
  }
  .dd:focus-within {
    border-color: var(--focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 25%, transparent);
  }
  .active {
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    background: var(--accent-soft);
  }
  .k {
    font-size: 12.5px;
    font-weight: 600;
  }
  .v {
    display: grid;
    min-width: 0;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text);
  }
  .v > span {
    grid-area: 1 / 1;
    overflow: hidden;
    text-overflow: ellipsis;
    visibility: hidden;
  }
  .v > .on {
    visibility: visible;
  }
  select {
    position: absolute;
    inset: 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
    font-size: 16px; /* stops iOS zooming in on focus */
  }
  select:focus-visible {
    outline: none;
  }
</style>
