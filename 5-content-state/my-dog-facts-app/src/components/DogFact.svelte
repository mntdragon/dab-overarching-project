<script>
  let fact = $state('');

  async function fetchFact() {
    try {
      const response = await fetch('https://dogapi.dog/api/v2/facts');
      const json = await response.json();
      

      fact = json.data[0].attributes.body;
    } catch (error) {
      fact = 'Could not fetch a dog fact. Please try again.';
      console.error('Error fetching fact:', error);
    }
  }
</script>

<button onclick={fetchFact}>Fetch a dog fact</button>

<p>{fact}</p>