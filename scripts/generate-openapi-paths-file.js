const { writeFileSync } = require("fs");

const { schemas } = require("@octokit/openapi");

writeFileSync(
  "public/components/openapi-paths.js",
  `export const OPENAPI_PATHS = ${JSON.stringify(
    schemas["api.github.com.deref"].paths,
    null,
    2
  )}`
);
