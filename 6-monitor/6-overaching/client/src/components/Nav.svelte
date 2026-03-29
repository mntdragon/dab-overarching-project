<script>
  import { userState } from "../states/userState.svelte.js";
</script>

<header>
  {#if userState.isLoaded}
    {#if userState.user}
      <p>{userState.user.email}</p>
      <button onclick={() => userState.logout()}>Logout</button>
    {:else}
      <a href="/auth/login">Login</a>
      <a href="/auth/register">Register</a>
    {/if}
  {/if}
</header>