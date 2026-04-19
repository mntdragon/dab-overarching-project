<script>
  export let code = "";
  export let exerciseId;

  let debounceTimer = null;
  let hasTyped = false;
  let prediction = null;

  async function fetchPrediction(codeValue) {
    if (!hasTyped) return;

    try {
      const res = await fetch("/inference-api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercise: exerciseId,
          code: codeValue,
        }),
      });

      const data = await res.json();

      prediction = Math.round(data.prediction);
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  }

  function handleInput(event) {
    const value = event.target.value;

    hasTyped = true;
    code = value;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      fetchPrediction(value);
    }, 500);
  }
</script>

<form method="POST" action={`/api/exercises/${exerciseId}/submissions`}>
  <textarea name="code" bind:value={code} on:input={handleInput}></textarea>

  <button type="submit">Submit</button>
</form>

{#if prediction !== null}
  <p>Correctness estimate: {prediction}%</p>
{/if}