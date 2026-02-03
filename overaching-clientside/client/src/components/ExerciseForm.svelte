<script>
  let text = "";
  let charCount = null;
  let ifCount = null;

  function handleSubmit() {
    charCount = text.length;
    // Uses regex to find all occurrences of "if"
    const matches = text.match(/if/g);
    ifCount = matches ? matches.length : 0;
  }
</script>

<textarea bind:value={text} rows="5" cols="30"></textarea>
<br />
<button on:click={handleSubmit}>Submit</button>

{#if charCount !== null}
  <p>Characters: {charCount}</p>
  <p>ifs: {ifCount}</p>
{/if}
