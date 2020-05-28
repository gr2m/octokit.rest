import { writeFileSync } from "fs";

import * as ROUTES from "@octokit/routes";

writeFileSync(
  "public/components/openapi-paths.js",
  `export const OPENAPI_PATHS = ${JSON.stringify(
    ROUTES.default["api.github.com"].paths,
    null,
    2
  )}`
);
