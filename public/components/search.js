
import { searchResults } from "./search-results.js";

export function search({ query, results }) {

  const resultsHTML = searchResults({ query, results });

  return `
    <form action="/" class="search">
      <h1>
        <label class="has-placeholder">
          <span>What would you like to request?</span><br />
          <input type="text" value="${query}" name="query" placeholder="Type your search here" autocomplete="off" />
        </label>
      </h1>
      <button type="submit">Go</button>
    </form>

    <div id="results" class="results">
      ${resultsHTML}
    </div>
  `;

}
