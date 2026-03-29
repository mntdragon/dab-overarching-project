<script>
  import { onMount } from 'svelte';
  import Editor from './Editor.svelte';
  import { userState } from '../states/userState.svelte.js';

  export let exerciseId;
  let exercise = null;
  let error = false;

  onMount(async () => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`);
      if (response.ok) {
        exercise = await response.json();
      } else {
        error = true;
      }
    } catch (e) {
      error = true;
    }
  });
</script>

{#if exercise}
  <h1>{exercise.title}</h1>
  <p>{exercise.description}</p>

  {#if userState.isLoaded}
    {#if userState.user}
      <Editor {exerciseId} />
    {:else}
      <p>Login or register to complete exercises.</p>
    {/if}
  {/if}
{:else if error}
  <p>An error occurred.</p>
{:else}
  <p>Loading exercise details...</p>
{/if}