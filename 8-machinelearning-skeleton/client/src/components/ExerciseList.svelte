<script>
  import { onMount } from 'svelte';
  export let languageId;
  let exercises = [];

  onMount(async () => {
    const res = await fetch(`/api/languages/${languageId}/exercises`);
    exercises = await res.json();
  });
</script>

<h1>Available exercises</h1>
<ul>
  {#each exercises as ex}
    <li>
      <a href="/exercises/{ex.id}">{ex.title}</a>
    </li>
  {/each}
</ul>