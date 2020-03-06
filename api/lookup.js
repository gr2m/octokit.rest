const ROUTES = require("@octokit/routes/api.github.com.json");
const MarkdownIt = require("markdown-it");

const regexesforPaths = Object.keys(ROUTES.paths).map(path => {
  const regex = path.replace(/\{\w+\}/g, "[^/]+");
  return [new RegExp(`^${regex}$`), path];
});

module.exports = async (request, response) => {
  const method = request.query.method.toUpperCase();
  const path = request.query.path;

  if (method && path) {
    for (const [regex, regexPath] of regexesforPaths) {
      if (regex.test(path)) {
        const operation = ROUTES.paths[regexPath][method.toLowerCase()];

        if (operation) {
          response.writeHead(200, {
            "Content-Type": "text/html"
          });

          const summary = operation.summary;
          const md = new MarkdownIt();
          const description = md.render(operation.description);

          return response.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${summary} (${method} ${regexPath})</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <h1>octokit.rest</h1>

    <form>
      <label>
        What would you like to request?<br />
        <input type="text" value="${method} ${regexPath}" name="request" autofocus />
      </label>
      <button type="submit">Go</button>
    </form>

    <article>
      <h2>${summary} (<code>${method} ${regexPath}</code>)</h2>

      ${description}
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

  <form>
    <label>
      What would you like to request?<br />
      <input type="text" value="${method} ${path}" name="request" autofocus />
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
