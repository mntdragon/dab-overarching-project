<script>
  import { commentState } from '../states/commentState.svelte.js';

  let newComment = $state('');

  function handleAdd() {
    if (newComment.trim()) {
      commentState.addComment(newComment);
      newComment = '';
    }
  }
</script>

<input type="text" bind:value={newComment} placeholder="Write a comment..." />
<button onclick={handleAdd}>Add Comment</button>

<h2>Comments</h2>

<ul>
  {#each commentState.comments as comment}
    <li>{comment}</li>
  {/each}
</ul>