<script lang="ts">
  import { guide } from '../data';
</script>

<section id="guide" class="wrap guide" aria-labelledby="guide-title">
  <div class="section-head">
    <div>
      <h2 id="guide-title">{guide.title}</h2>
      <p>{guide.intro}</p>
    </div>
  </div>

  <div class="cards">
    {#each guide.sections as g (g.id)}
      <article class="g" class:intro={!g.table}>
        <h3>{g.title}</h3>
        <p class="sum">{g.summary}</p>
        {#if g.table}
          <div class="tw">
            <table>
              <thead>
                <tr>{#each g.table.columns as c (c)}<th scope="col">{c}</th>{/each}</tr>
              </thead>
              <tbody>
                {#each g.table.rows as row, i (i)}
                  <tr>
                    {#each row as cell, j (j)}
                      {#if j === 0}<th scope="row">{cell}</th>{:else}<td>{cell}</td>{/if}
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        {#if g.points?.length}
          <ul>
            {#each g.points as p (p)}<li>{p}</li>{/each}
          </ul>
        {/if}
        {#if g.tip}<p class="tip">{g.tip}</p>{/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .guide {
    padding-top: 56px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .g.intro {
    grid-column: 1 / -1;
  }
  .g.intro ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 28px;
  }
  .g {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 18px;
    border-radius: var(--r-lg);
    border: 1px solid var(--line);
    background: var(--surface);
  }
  h3 {
    font-size: 17px;
  }
  .sum {
    font-size: 14.5px;
    color: var(--text-2);
  }
  .tw {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  thead th {
    padding: 6px 10px 6px 0;
    text-align: left;
    font-size: 11.5px;
    font-weight: 650;
    color: var(--text-3);
    border-bottom: 1px solid var(--line-strong);
    white-space: nowrap;
  }
  tbody th,
  td {
    padding: 7px 10px 7px 0;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--line);
  }
  tbody th {
    font-weight: 700;
  }
  td {
    color: var(--text-2);
  }
  ul {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 14px;
    color: var(--text-2);
  }
  .tip {
    margin-top: auto;
    padding: 9px 12px;
    border-radius: var(--r);
    background: var(--accent-soft);
    border-left: 3px solid var(--accent);
    font-size: 13.5px;
    color: var(--text);
  }
  @media (max-width: 1000px) {
    .cards {
      grid-template-columns: minmax(0, 1fr);
    }
    .g.intro ul {
      grid-template-columns: 1fr;
    }
  }
</style>
