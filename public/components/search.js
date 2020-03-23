
import { searchResults } from "./search-results.js";

export function search({ query, results }) {

  const resultsHTML = searchResults({ query, results });

  return `
    <form action="/">
      <label>
        What would you like to request?<br />
        <input type="text" value="${query}" name="query" autocomplete="off" />
      </label>
      <button type="submit">Go</button>
    </form>

    <div id="results">
      ${resultsHTML}
    </div>
  `;

}
