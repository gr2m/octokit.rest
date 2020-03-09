module.exports = schemaToParameters;

function schemaToParameters(params, schema, prefix = "") {
  Object.entries(schema.properties).forEach(([paramName, definition]) => {
    const paramNameWithPrefix = prefix + paramName;

    params[paramNameWithPrefix] = {
      name: paramNameWithPrefix,
      type: definition.type,
      enum: definition.enum,
      description: definition.description,
      in: "BODY"
    };

    params[paramNameWithPrefix].required =
      schema.required && schema.required.includes(paramName);

    if (definition.nullable) {
      params[paramNameWithPrefix].allowNull = true;
    }

    if (definition.pattern) {
      params[paramNameWithPrefix].validation = definition.pattern;
    }

    // handle arrays
    if (definition.type === "array") {
      params[paramNameWithPrefix].type = definition.items.type + "[]";

      if (definition.items.type === "object") {
        schemaToParameters(
          params,
          definition.items,
          `${paramNameWithPrefix}[].`
        );
      }
    }

    // handle objects
    if (definition.type === "object") {
      schemaToParameters(params, definition, `${paramNameWithPrefix}.`);
    }
  });
}
