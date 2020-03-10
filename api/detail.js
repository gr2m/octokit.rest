const ROUTES = require("@octokit/routes/api.github.com.json");
const MarkdownIt = require("markdown-it");

const parseOperation = require("./_lib/parse-operation");

const regexesforPaths = Object.keys(ROUTES.paths).map(path => {
  const regex = path.replace(/\{\w+\}/g, "[^/]+");
  return [new RegExp(`^${regex}$`), path];
});

module.exports = async (request, response) => {
  if (request.query.route) {
    const [method, path] = request.query.route.split(" ");
    response.writeHead(301, {
      Location: "/" + method + path
    });
    return response.end();
  }

  const method = (request.query.method || "").toUpperCase();
  const path = request.query.path;

  if (method && path) {
    for (const [regex, regexPath] of regexesforPaths) {
      if (regex.test(path)) {
        const operation = ROUTES.paths[regexPath][method.toLowerCase()];

        if (operation) {
          const endpoint = parseOperation(
            { method, url: regexPath },
            operation
          );

          const markdown = new MarkdownIt();
          const route = `${endpoint.method} ${endpoint.url}`;

          response.writeHead(200, {
            "Content-Type": "text/html"
          });

          let parameters = [];
          for (const { name, type, description } of Object.values(
            endpoint.parameters
          )) {
            parameters.push(`
            <tr>
              <td><code>${name}</code></td>
              <td><code>${type}</code></td>
              <td>${markdown.render(description)}</td>
            </tr>
            `);
          }

          const responseHTML = endpoint.responses.length
            ? `<pre><code>Status: ${endpoint.responses[0].code}</code></pre>
               <pre><code>${JSON.stringify(
                 JSON.parse(endpoint.responses[0].examples[0].data),
                 null,
                 2
               )}</code></pre>`
            : null;

          return response.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${endpoint.name} (${route})</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <h1>octokit.rest</h1>

    <form action="/search">
      <label>
        What would you like to request?<br />
        <input type="text" value="${
          endpoint.method
        } ${path}" name="route" autofocus />
      </label>
      <button type="submit">Go</button>
    </form>

    <article>
      <h2>${endpoint.name} (<code>${route}</code>)</h2>

      ${markdown.render(endpoint.description)}
    </article>

    <article>
    <h2>Parameters</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${parameters.join("")}
      </tbody>
    </table>

    <h2>Response</h2>
    ${responseHTML || "<p>No response available</p>"}

    <p>See documentation on <a href="${
      endpoint.documentationUrl
    }">GitHub developer guides</a></p>

<h2>JSON Dump</h2>
<pre><code>${JSON.stringify(endpoint, null, 2)}</code></pre>
    </article>
  </body>
</html>
`);
        }
      }
    }
  }

  response.writeHead(404, {
    "Content-Type": "text/html"
  });
  return response.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Not Found: ${method} ${path}</title>
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

    <article>
      <h2>No route found for <code>${method} ${path}</code></h2>

      Sorry.
    </article>
  </body>
</html>
`);
};