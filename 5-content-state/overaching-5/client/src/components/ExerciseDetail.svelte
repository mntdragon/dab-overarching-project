<script>
  import { onMount } from 'svelte';
  import Editor from './Editor.svelte';

  export let exerciseId;
  let exercise = null;

  onMount(async () => {
    const response = await fetch(`/api/exercises/${exerciseId}`);
    if (response.ok) {
      exercise = await response.json();
    }
  });
</script>

{#if exercise}
  <h1>{exercise.title}</h1>
  <p>{exercise.description}</p>
{:else}
  <p>Loading exercise details...</p>
{/if}

<Editor {exerciseId} />