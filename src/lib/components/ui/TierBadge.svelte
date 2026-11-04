<script lang="ts">
  import type { Tier } from '../../types';

  let { tier, size = 'md' }: { tier: Tier; size?: 'sm' | 'md' | 'lg' } = $props();
</script>

<span class="tier {size}" style="background: var(--tier-{tier}); color: var(--tier-{tier}-ink)" title="Tier {tier}">
  {tier}<span class="sr-only"> tier</span>
</span>

<style>
  .tier {
    display: inline-grid;
    place-items: center;
    flex: none;
    font-weight: 900;
    line-height: 1;
  }
  .sm {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    font-size: 12px;
  }
  .md {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    font-size: 16px;
  }
  .lg {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    font-size: 23px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  }
</style>
