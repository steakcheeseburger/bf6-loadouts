<script lang="ts">
  import type { Part } from '../types';
  import { buildPoints, fullBuildLevel, shortSlot } from '../labels';
  import LevelTag from './ui/LevelTag.svelte';

  let { parts, detailed = false }: { parts: Part[]; detailed?: boolean } = $props();

  const full = $derived(fullBuildLevel(parts));
  const pts = $derived(buildPoints(parts));
</script>

<table class="parts" class:detailed>
  <caption class="sr-only">Attachments and the weapon level that unlocks each one</caption>
  <tbody>
    {#each parts as p (p.slot + p.name)}
      <tr>
        <th scope="row" title={p.slot}>{detailed ? p.slot : shortSlot(p.slot)}</th>
        <td class="name">{p.name}</td>
        {#if detailed}<td class="pts num">{p.points ?? '–'}<small> pt</small></td>{/if}
        <td class="lv"><LevelTag level={p.level} /></td>
      </tr>
    {/each}
  </tbody>
</table>
{#if detailed}
  <p class="foot">
    <span>All parts unlocked at <b class="num">Lv {full.level}</b>{#if full.seasonal} + {full.seasonal} seasonal challenge{full.seasonal > 1 ? 's' : ''}{/if}</span>
    <span class="num">{pts.complete ? '' : '≈'}{pts.total} / 100 points</span>
  </p>
{/if}

<style>
  .parts {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 5px 0;
    border-top: 1px solid var(--line);
    vertical-align: middle;
  }
  tr:first-child th,
  tr:first-child td {
    border-top: 0;
  }
  th {
    width: 52px;
    padding-right: 10px;
    text-align: left;
    line-height: 1.2;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-3);
  }
  .name {
    font-size: 13.8px;
    font-weight: 650;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .pts {
    width: 1%;
    padding: 0 12px;
    text-align: right;
    white-space: nowrap;
    font-size: 12.5px;
    color: var(--text-3);
  }
  .pts small {
    font-size: 10.5px;
  }
  .lv {
    width: 1%;
    padding-left: 8px;
    text-align: right;
  }
  .detailed th,
  .detailed td {
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .detailed .name {
    font-size: 15px;
  }
  .detailed th {
    width: 1%;
    white-space: nowrap;
    font-size: 11px;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--line-strong);
    font-size: 13px;
    color: var(--text-3);
  }
  .foot b {
    color: var(--text);
  }
  @media (max-width: 560px) {
    .detailed th {
      font-size: 10px;
    }
    .pts {
      display: none;
    }
  }
</style>
