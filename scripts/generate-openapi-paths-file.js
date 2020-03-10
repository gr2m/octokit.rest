const { writeFileSync } = require("fs");

const ROUTES = require("@octokit/routes/api.github.com.json");

writeFileSync(
  "components/openapi-paths.js",
  `export const OPENAPI_PATHS = ${JSON.stringify(ROUTES.paths, null, 2)}`
);
