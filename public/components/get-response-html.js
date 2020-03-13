export function getResponseHTML({ apiResponse, exampleResponse }) {
  if (!apiResponse && !exampleResponse) {
    return "<p>No response available</p>";
  }

  if (apiResponse) {
    return `<section>
  <h2>Response</h2>
  
  <pre><code>${Object.entries(apiResponse.headers)
    .map(([headerName, value]) => `${headerName}: ${value}`)
    .join("\n")}</code></pre>
  <pre><code>${JSON.stringify(apiResponse.data, null, 2)}</code></pre>
</section>`;
  }

  const responseHTML = exampleResponse
    ? `<pre><code>Status: ${exampleResponse.code}</code></pre>
     <pre><code>${JSON.stringify(
       JSON.parse(exampleResponse.examples[0].data),
       null,
       2
     )}</code></pre>`
    : "<p>No response available</p>";

  return `<section>
  <h2>Example Response</h2>

  ${responseHTML}
</section>`;
}
