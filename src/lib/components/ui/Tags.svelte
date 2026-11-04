<script lang="ts">
  import type { Tag } from '../../types';
  import { TAG_STYLE, sortTags } from '../../labels';

  /** solid: dark chips for use on top of the light weapon renders */
  let { tags, max = 3, solid = false }: { tags: Tag[]; max?: number; solid?: boolean } = $props();
  const shown = $derived(sortTags(tags).slice(0, max));
</script>

{#if shown.length}
  <ul class="tags" class:solid aria-label="Tags">
    {#each shown as t (t)}<li class={TAG_STYLE[t]}>{t}</li>{/each}
  </ul>
{/if}

<style>
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    font-size: 11.5px;
    font-weight: 750;
    line-height: 18px;
    padding: 1px 7px;
    border-radius: 5px;
    border: 1px solid var(--line-strong);
    color: var(--text-2);
  }
  .hot {
    background: var(--critical);
    border-color: transparent;
    color: #fff;
  }
  .new {
    background: var(--tier-S);
    border-color: transparent;
    color: var(--tier-S-ink);
  }
  .warn {
    background: var(--warning);
    border-color: transparent;
    color: #1a1300;
  }
  .good {
    border-style: dashed;
    color: var(--text);
  }
  .solid .plain,
  .solid .good {
    background: rgba(13, 15, 18, 0.82);
    border-color: transparent;
    color: #f0efec;
  }
</style>
