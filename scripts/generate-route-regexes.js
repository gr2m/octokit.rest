const ROUTES = require("@octokit/routes/api.github.com.json");

const regexToPath = Object.keys(ROUTES.paths).map(path => {
  const regex = path.replace(/\{\w+\}/g, "[^/]+");
  return [new RegExp(`^${regex}$`), path];
});

console.log(`regexToPath`);
console.log(regexToPath);
