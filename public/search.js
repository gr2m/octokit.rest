import { searchResults } from "/components/search-results.js";
import { pageTitle } from "/components/page-title.js";

const $queryField = document.querySelector(`input[name="query"]`);
const $results = document.querySelector(`#results`);

$queryField.addEventListener("keyup", async function(event) {
  const query = $queryField.value.trim();
  const results = query ? await sendSearchRequest(query) : [];

  $results.innerHTML = await searchResults({ query, results });

  window.history.pushState(
    {},
    pageTitle(query),
    query ? `/?query=${query}` : "/"
  );
  document.title = pageTitle(query);
});

async function sendSearchRequest(query) {
  const response = await fetch(`/api/search?query=${query}`, {
    headers: {
      accept: "application/json"
    }
  });
  const results = await response.json();
  return results;
}

function onPopState(e) {
  console.log("TODO: Handle forward and backward buttons");
}
window.addEventListener("popstate", onPopState);
