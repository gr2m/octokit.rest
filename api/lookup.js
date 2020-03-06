const ROUTES = require("@octokit/routes/api.github.com.json");
const MarkdownIt = require("markdown-it");

const regexesforPaths = Object.keys(ROUTES.paths).map(path => {
  const regex = path.replace(/\{\w+\}/g, "[^/]+");
  return [new RegExp(`^${regex}$`), path];
});

module.exports = async (request, response) => {
  const method = request.query.method.toLowerCase();
  const path = request.query.path;

  if (method && path) {
    for (const [regex, regexPath] of regexesforPaths) {
      if (regex.test(path)) {
        const operation = ROUTES.paths[regexPath][method.toLowerCase()];

        if (operation) {
          response.writeHead(200, {
            "Content-Type": "text/html"
          });

          const md = new MarkdownIt();
          const description = md.render(operation.description);

          return response.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${method} ${regexPath}</title>
</head>
<body>
  <h1>${operation.summary}</h1>

  ${description}
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
  <title>Not found</title>
</head>
<body>
  <h1>Not found</h1>

  <p>No route found for <code>${method} ${path}</code></p>
</body>
</html>
`);
};
