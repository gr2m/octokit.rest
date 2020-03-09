const ROUTES = require("@octokit/routes/api.github.com.json");

const allEndpointPaths = Object.keys(ROUTES.paths);

module.exports = async (request, response) => {
  const parts = request.query.route.split(" ");
  const method = (parts[0] || "").toUpperCase();
  const path = parts[1];
  const results = [];

  if (method && path) {
    for (const endpointPath of allEndpointPaths) {
      if (endpointPath.substr(0, path.length) !== path) continue;

      const operation = ROUTES.paths[endpointPath][method.toLowerCase()];
      if (!operation) continue;

      results.push([endpointPath, operation]);
    }
  }

  response.writeHead(200, {
    "Content-Type": "text/html"
  });

  const resultsHTML =
    results
      .filter(Boolean)
      .map(([path, operation]) => {
        return `<article>
  <a href="/${method}/${path}">
    ${operation.summary}
    (<code>${method} ${path}</code>)
  </a>
</article>`;
      })
      .join("\n") || `<p>No results found for <code>${method} ${path}</code>`;

  return response.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Search: "${method} ${path}"</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<h1>octokit.rest</h1>

<form action="/search">
<label>
What would you like to request?<br />
<input type="text" value="${method} ${path}" name="route" autofocus />
</label>
<button type="submit">Go</button>
</form>

<h2>Results</h2>

${resultsHTML}
</body>
</html>
`);
};
