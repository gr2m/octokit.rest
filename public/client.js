
import { searchResults } from "/components/search-results.js"

const $queryField = document.querySelector(`input[name="query"]`);
const $results = document.querySelector(`#results`);

$queryField.addEventListener("keyup", async function(event) {
  const query = $queryField.value.trim();
  if (!query) return;

  const response = await fetch(`/search?query=${query}`, {
    headers: {
      "accept": "application/json"
    }
  });
  const results = await response.json();
  console.log({results});
  
  $results.innerHTML = searchResults({ query, results });

  window.history.pushState(
    {},
    `Search: ${query}`,
    `/search?query=${query}`
  );
});

function onPopState(e) {
  console.log("TODO: Handle forward and backward buttons");
}
window.addEventListener('popstate', onPopState);

