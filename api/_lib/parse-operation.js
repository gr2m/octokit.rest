module.exports = parseOperation;

const schemaToParameters = require("./schema-to-parameters");

function parseOperation({ method, url }, operation) {
  const parameters = {};

  // URL, headers and query parameters
  operation.parameters.forEach(param => {
    if (param.in === "header") {
      return;
    }

    parameters[param.name] = {
      name: param.name,
      description: param.description,
      type: param.schema.type,
      enum: param.schema.enum,
      in: param.in.toUpperCase()
    };

    if (param.required) {
      parameters[param.name].required = true;
    }

    if (param.nullable) {
      parameters[param.name].allowNull = true;
    }

    if (param.pattern) {
      parameters[param.name].validation = operation.pattern;
    }
  });

  // request body parameters
  if (operation.requestBody) {
    if (operation["x-github"].requestBodyParameterName) {
      const paramName = operation["x-github"].requestBodyParameterName;
      const contentType = Object.keys(operation.requestBody.content)[0];
      const { schema } = operation.requestBody.content[contentType];
      parameters[paramName] = {
        name: paramName,
        description: schema.description,
        type: schema.type,
        mapToData: true,
        in: "BODY"
      };
      if (schema.type === "array") {
        parameters[paramName].type = schema.items.type + "[]";
      }

      parameters[paramName].required = true;
    } else {
      schemaToParameters(
        parameters,
        // In most cases the only key for `operation.requestBody.content`
        // is "application/json". But there are exceptios so we just return
        // whatever is first. At this point there is no case with multiple
        // content types.
        Object.values(operation.requestBody.content)[0].schema
      );
    }
  }

  // normalize parameters
  Object.values(parameters).forEach(param => {
    if (!param.required) {
      param.required = false;
    }
    if (!param.allowNull) {
      param.allowNull = false;
    }
    if (!param.description) {
      param.description = "";
    }
  });

  const headerParameters = operation.parameters.filter(
    param => param.in === "header"
  );
  const acceptHeader = headerParameters.find(param => param.name === "accept");
  const headers = headerParameters
    .filter(param => param.name !== "accept")
    .map(toHeader);

  const [scope, id] = operation.operationId.split("/");

  // if endpoint has a request body and parameters in query, amend the url;
  const queryParameterNames = operation.parameters
    .filter(param => param.in === "query")
    .map(param => param.name);
  if (
    ["delete", "patch", "post", "put"].includes(method) &&
    queryParameterNames.length
  ) {
    url += `{?${queryParameterNames.join(",")}}`;
  }

  // if endpoint has a servers setting, prefix URL with `{origin}`
  // and add `origin` to parameters
  if (operation.servers) {
    url = `{origin}${url}`;
    parameters["origin"] = {
      name: "origin",
      type: "string",
      description: operation.servers[0].variables.origin.description,
      in: "PATH",
      default: operation.servers[0].variables.origin.default
    };
  }

  // {
  //   "200": {
  //     "description": "response",
  //     "content": {
  //       "application/json": {
  //         "example": {}
  //       }
  //     }
  //   }
  // }
  const responses = [];
  for (const code of Object.keys(operation.responses)) {
    const { description } = operation.responses[code];

    if (!operation.responses[code].content) continue;

    for (const mediaType of Object.keys(operation.responses[code].content)) {
      const { schema, example, examples } = operation.responses[code].content[
        mediaType
      ];

      const normalizedExamples = example
        ? [{ data: JSON.stringify(example) }]
        : examples
        ? Object.entries(examples).map(([name, { value }]) => {
            return { name, data: JSON.stringify(value) };
          })
        : undefined;

      responses.push({
        code,
        description,
        mediaType,
        schema: JSON.stringify(schema),
        examples: normalizedExamples
      });
    }
  }

  const endpoint = {
    id,
    scope,
    name: operation.summary,
    description: operation.description,
    method: method.toUpperCase(),
    url,
    parameters,
    headers,
    documentationUrl: operation.externalDocs.url,
    isDeprecated: !!operation.deprecated,
    isLegacy: operation["x-github"].legacy,
    isEnabledForApps: operation["x-github"].enabledForApps,
    isGithubCloudOnly: operation["x-github"].githubCloudOnly,
    triggersNotification: operation["x-github"].triggersNotification,
    previews: operation["x-github"].previews,
    responses,
    changes: operation["x-changes"].map(change => {
      const type = change.type.toUpperCase();
      const before = toParamter(type, change.before);
      const after = toParamter(type, change.after);

      return {
        type,
        date: change.date,
        note: change.note,
        before,
        after
      };
    })
  };

  if (acceptHeader.required) {
    endpoint.headers.unshift(toHeader(acceptHeader));
  }

  return endpoint;
}

function toHeader(param) {
  return {
    name: param.name,
    description: param.description,
    value: param.schema.enum ? param.schema.enum[0] : param.schema.default,
    required: param.required || false
  };
}

function toParamter(type, change) {
  if (type === "OPERATION") {
    return change;
  }

  if (!change.name) {
    return;
  }

  return {
    name: change.name,
    type: change.type,
    description: change.description,
    in: change.in
  };
}
