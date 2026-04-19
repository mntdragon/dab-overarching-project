<script>
  import { tick } from 'svelte';
  
  export let exerciseId;

  let sourceCode = "";
  let gradingStatus = "";
  let grade = "";
  let isSubmitting = false;
  let loginRequired = false;

  const submitExercise = async () => {
    await tick();

    if (!sourceCode.trim()) return;

    isSubmitting = true;
    gradingStatus = "pending";
    grade = "";
    loginRequired = false;

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source_code: sourceCode }),
      });

      if (response.ok) {
        const data = await response.json();
        startPolling(data.id);
      } else if (response.status === 401) {
        gradingStatus = "";
        loginRequired = true;
        isSubmitting = false;
      } else {
        gradingStatus = "error";
        isSubmitting = false;
      }
    } catch (err) {
      gradingStatus = "error";
      isSubmitting = false;
    }
  };

  const startPolling = (id) => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/submissions/${id}/status`);
      if (response.ok) {
        const data = await response.json();
        gradingStatus = data.grading_status;
        grade = data.grade;

        if (gradingStatus === "graded") {
          clearInterval(interval);
          isSubmitting = false;
        }
      } else if (response.status === 401) {
        clearInterval(interval);
        gradingStatus = "";
        loginRequired = true;
        isSubmitting = false;
      }
    }, 500); // 500ms polling as requested
  };
</script>

<div>
  <textarea bind:value={sourceCode} rows="10" cols="50"></textarea>
  <br />
  <button on:click={submitExercise} disabled={isSubmitting}>Submit</button>

  {#if loginRequired}
    <p style="color: red;">
      <strong>Please <a href="/auth/login">log in</a> to submit your exercise.</strong>
    </p>
  {/if}
  
  {#if gradingStatus}
    <p>Grading status: {gradingStatus}</p>
    <p>Grade: {grade}</p>
  {/if}
</div>