import { request as octokitRequest } from "@octokit/request";
import fetch from "node-fetch";

import { OPENAPI_PATHS } from "../public/components/openapi-paths.js";
import { parameterField } from "../public/components/parameter-field.js";
import { requestPreview } from "../public/components/request-preview.js";
import { getResponseHTML } from "../public/components/get-response-html.js";
import { search } from "../public/components/search.js";

const MarkdownIt = require("markdown-it");

const parseOperation = require("./_lib/parse-operation");

const regexesforPaths = Object.keys(OPENAPI_PATHS).map(path => {
  const regex = path.replace(/\{\w+\}/g, "[^/]+");
  return [new RegExp(`^${regex}$`), path];
});

module.exports = async (request, response) => {
  const method = (request.query.method || "").toUpperCase();
  const path = request.query.path;

  let apiResponse;
  if (request.method === "POST") {
    const options = JSON.parse(decodeURIComponent(request.body.requestOptions));
    const { url, ...rest } = octokitRequest.endpoint(options);
    const response = await fetch(url, rest);
    apiResponse = {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json()
    };
  }

  if (method && path) {
    for (const [regex, regexPath] of regexesforPaths) {
      if (regex.test(path)) {
        const operation = OPENAPI_PATHS[regexPath][method.toLowerCase()];

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
              <td>${parameterField({
                name,
                type,
                value: request.query[name] || ""
              })}</td>
              <td>
              ${markdown.render(`\`${type}\` ` + description)}
              </td>
            </tr>
            `);
          }

          let previews = [];
          for (const { name, note, required } of Object.values(
            endpoint.previews
          )) {
            previews.push(`
            <section class="note">
              <h2>${name} Preview ${required ? "(required)" : ""}</h2>
              ${markdown.render(note)}
            </section>
            `);
          }

          const exampleResponse = endpoint.responses.length
            ? endpoint.responses[0]
            : null;

          response.writeHead(200, {
            "Content-Type": "text/html",
            "Cache-Control": "s-maxage=604800"
          });

          const { path: url, token, ...rest } = request.query;
          const options = Object.fromEntries(
            Object.entries(rest).filter(([key, value]) => value !== "")
          );

          const requestOptions = {
            baseUrl: "https://api.github.com",
            method,
            url,
            headers: {
              authorization: `token ${token}`,
              accept: "application/vnd.github.v3+json",
              "user-agent": `octokit.rest`
            },
            mediaType: {
              previews: []
            },
            ...options
          };

          return response.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${endpoint.name} (${route})</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <header>
      <h2>octokit.rest</h2>
    </header>

    <div id="search">
    ${search({ query: `${endpoint.method} ${endpoint.url}` })}
    </div>

    <main id="details" class="details">

    <section>
      <h2>${endpoint.name}</h2>

      ${markdown.render(endpoint.description)}
    </section>

    ${previews.join("")}

    <section>
      <h2>Parameters</h2>
      <form action="#request-preview" id="parametersForm">
        <table>
          <tbody>
            <tr>
              <td>
                <label>
                  <code>token</code><br />
                  <input type="text" name="token" value="${request.query
                    .token || ""}" />
                </label>
              </td>
              <td><p><code>string</code> The token will be passed in the authorization header.</p></td>
            </tr>
            ${parameters.join("")}
          </tbody>
        </table>
        <p><button type="submit">Update request preview</button></p>
      </form>
  
      <form action="#request-preview" method="POST" id="request-preview">
        <div id="requestPreview">
        ${requestPreview(requestOptions)}
        </div> 

        <p><button type="submit">Send request</button></p>
      </form>
    </section>

    ${getResponseHTML({ exampleResponse, apiResponse })}

    <p>See documentation on <a href="${
      endpoint.documentationUrl
    }">GitHub developer guides</a></p>

    </main>

    <script type="module" src="/detail.js"></script>
    <script type="module" src="/search.js"></script>
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

    <form action="/">
      <label>
        What would you like to request?<br />
        <input type="text" value="${method} ${path}" name="query" />
      </label>
      <button type="submit">Go</button>
    </form>

    <section>
      <h2>No route found for <code>${method} ${path}</code></h2>

      Sorry.
    </section>
  </body>
</html>
`);
};
