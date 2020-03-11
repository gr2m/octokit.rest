
export function searchResults({ query, results }) {
  const queryRegex = new RegExp(`(${query})`, "i");

  return results
    .filter(Boolean)
    .map(([method, path, operation]) => {
      const route = `${method} ${path}`.replace(
        queryRegex,
        `<mark>$1</mark>`
      );
      const summary = operation.summary.replace(
        queryRegex,
        `<mark>$1</mark>`
      );
      return `<article>
<a href="/${method}/${path}">
  ${summary}
  (<code>${route}</code>)
</a>
</article>`;
    })
    .join("\n") || `<p>No results found for <code>${query}</code>`;
}
