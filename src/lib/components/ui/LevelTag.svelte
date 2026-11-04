<script lang="ts">
  import type { UnlockLevel } from '../../types';
  import { levelText, levelTitle } from '../../labels';

  let { level }: { level: UnlockLevel } = $props();
  const kind = $derived(level === null ? 'unknown' : typeof level === 'string' ? 'seasonal' : level === 0 ? 'default' : 'level');
</script>

<span class="lv {kind}" title={levelTitle(level)}>{levelText(level)}</span>

<style>
  .lv {
    display: inline-block;
    font-size: 12px;
    font-weight: 750;
    line-height: 18px;
    padding: 1px 7px;
    border-radius: var(--r-sm);
    border: 1px solid var(--line-strong);
    background: var(--surface);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .default {
    color: var(--text-3);
    font-weight: 600;
  }
  .seasonal {
    border-style: dashed;
    color: var(--text-2);
  }
  .unknown {
    border-style: dotted;
    color: var(--text-3);
  }
</style>
