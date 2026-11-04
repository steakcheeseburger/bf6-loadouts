<script lang="ts">
  import { season } from '../data';
  import TierBadge from './ui/TierBadge.svelte';
  import LevelTag from './ui/LevelTag.svelte';
</script>

<footer id="about" class="wrap foot">
  <section>
    <h2>How to read this</h2>
    <dl>
      <div><dt><TierBadge tier="S" size="sm" /><TierBadge tier="B" size="sm" /><TierBadge tier="D" size="sm" /></dt><dd>Tier for the gun <b>in its best role</b>, based on how it performs in Season 5. Pistols are ranked against other pistols.</dd></div>
      <div><dt><LevelTag level={13} /></dt><dd>Weapon level you need on that gun to unlock the attachment.</dd></div>
      <div><dt><LevelTag level={0} /></dt><dd>Available from the start.</dd></div>
      <div><dt><LevelTag level="S3 Hardware 6" /></dt><dd>Unlocked by a seasonal challenge, not weapon level.</dd></div>
      <div><dt><LevelTag level={null} /></dt><dd>Not known yet (a few scopes on new guns).</dd></div>
      <div><dt>Time to kill</dt><dd>Body shots on a full-health enemy, every shot hitting, including bullet travel time. Headshots kill faster. Cards show it at 10, 25, 50 and 75 m; the bar under each time uses the tier colours, so an S-coloured bar is a very fast kill. The highlighted distance is the one used by <i>Sort → Fastest kill</i> (25 m unless you pick another).</dd></div>
    </dl>
  </section>

  <section>
    <h2>Season 5 notes</h2>
    <ul>
      {#each season.notes as n (n)}<li>{n}</li>{/each}
    </ul>
    <h2 class="mt">Coming next</h2>
    <ul>
      {#each season.upcoming as n (n)}<li>{n}</li>{/each}
    </ul>
  </section>


  <p class="legal">
    Free, non-commercial fan site, not endorsed by or affiliated with EA or its licensors. Battlefield, Battlefield 6, EA and DICE are trademarks of Electronic
    Arts Inc. Weapon images are game art © Electronic Arts Inc. Anything shown here is removed on request.
  </p>
</footer>

<style>
  .foot {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 36px;
    margin-top: 64px;
    padding-top: 30px;
    padding-bottom: 60px;
    border-top: 1px solid var(--line);
  }
  h2 {
    margin-bottom: 12px;
    font-size: 16px;
  }
  .mt {
    margin-top: 22px;
  }
  dl {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  dl div {
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 12px;
  }
  dt {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
  }
  dd {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--text-2);
  }
  ul {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--text-2);
  }
  .legal {
    grid-column: 1 / -1;
    margin: 0;
    padding-top: 18px;
    border-top: 1px solid var(--line);
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-3);
  }
  @media (max-width: 980px) {
    .foot {
      grid-template-columns: 1fr;
    }
  }
</style>
