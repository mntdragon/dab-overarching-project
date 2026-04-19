<script>
  import { authClient } from "../../utils/auth.js";
  
  // Use Svelte 5 runes for state and props as per instructions
  let { isLoginForm = false } = $props();
  
  const authFun = isLoginForm
    ? authClient.signIn.email
    : authClient.signUp.email;

  let email = $state("");
  let password = $state("");

  const registerOrLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await authFun(
      {
        email,
        password,
        name: email, // Using email as the display name
      },
      {
        onError: (ctx) => {
          alert(ctx.error.message);
        },
        onSuccess: (ctx) => {
          // Redirect to the main page upon successful auth
          window.location.href = "/";
        },
      }
    );
  };
</script>

<form onsubmit={registerOrLogin}>
  <label for="email">Email</label>
  <input type="email" id="email" bind:value={email} required />
  
  <label for="password">Password</label>
  <input type="password" id="password" bind:value={password} required />
  
  <button type="submit">
    {isLoginForm ? "Login" : "Register"}
  </button>
</form>