import { OPENAPI_PATHS } from "../public/components/openapi-paths.js";
import { pageTitle } from "../public/components/page-title.js";
import { search } from "../public/components/search.js";

const allEndpointPaths = Object.keys(OPENAPI_PATHS);

module.exports = async (request, response) => {
  const query = request.query.query || "";
  const queryRegex = new RegExp(`(${query})`, "i");
  const { method, path } = toMethodAndPath(query);
  const results = [];

  if (query) {
    for (const endpointPath of allEndpointPaths) {
      if (path && endpointPath.substr(0, path.length) !== path) continue;

      if (method) {
        const operation = OPENAPI_PATHS[endpointPath][method.toLowerCase()];
        if (!operation) continue;

        results.push([method, endpointPath, operation]);
        continue;
      }

      for (const [method, operation] of Object.entries(
        OPENAPI_PATHS[endpointPath]
      )) {
        if (path) {
          results.push([method.toUpperCase(), endpointPath, operation]);
          continue;
        }

        if (queryRegex.test(operation.summary)) {
          results.push([method.toUpperCase(), endpointPath, operation]);
        }
      }
    }
  }

  if (request.headers.accept === "application/json") {
    response.setHeader("Cache-Control", "s-maxage=604800");
    response.json(results);
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/html",
    "Cache-Control": "s-maxage=604800"
  });

  return response.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle(query)}</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<h1>octokit.rest</h1>

<div id="search">
${search({ query, results })}
</div>

<script type="module" src="/search.js"></script>
</body>
</html>
`);
};

function toMethodAndPath(query) {
  if (/^\//.test(query)) {
    return {
      path: query
    };
  }

  if (/^(DELETE|GET|HEAD|PATCH|POST|PUT) \//i.test(query)) {
    const parts = query.split(" ");
    const method = (parts[0] || "").toUpperCase();
    const path = parts[1];

    return { method, path };
  }

  return {};
}
