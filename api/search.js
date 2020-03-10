const ROUTES = require("@octokit/routes/api.github.com.json");

const allEndpointPaths = Object.keys(ROUTES.paths);

module.exports = async (request, response) => {
  const { method, path } = toMethodAndPath(request);
  const results = [];

  if (path) {
    for (const endpointPath of allEndpointPaths) {
      if (endpointPath.substr(0, path.length) !== path) continue;

      if (method) {
        const operation = ROUTES.paths[endpointPath][method.toLowerCase()];
        if (!operation) continue;

        results.push([method, endpointPath, operation]);
        continue;
      }

      for (const [method, operation] of Object.entries(
        ROUTES.paths[endpointPath]
      )) {
        results.push([method.toUpperCase(), endpointPath, operation]);
      }
    }
  }

  const route = method ? [method, path].join(" ") : path;

  response.writeHead(200, {
    "Content-Type": "text/html"
  });

  const resultsHTML =
    results
      .filter(Boolean)
      .map(([method, path, operation]) => {
        return `<article>
  <a href="/${method}/${path}">
    ${operation.summary}
    (<code>${method} ${path}</code>)
  </a>
</article>`;
      })
      .join("\n") || `<p>No results found for <code>${route}</code>`;

  return response.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Search: "${route}"</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<h1>octokit.rest</h1>

<form action="/search">
<label>
What would you like to request?<br />
<input type="text" value="${route}" name="route" autofocus />
</label>
<button type="submit">Go</button>
</form>

<h2>Results</h2>

${resultsHTML}
</body>
</html>
`);
};

function toMethodAndPath(request) {
  if (/^\//.test(request.query.route)) {
    return {
      path: request.query.route
    };
  }

  const parts = request.query.route.split(" ");
  const method = (parts[0] || "").toUpperCase();
  const path = parts[1];

  return { method, path };
}
