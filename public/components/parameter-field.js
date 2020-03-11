function radioFieldSet({ name, options, selectedValue }) {
  let items = [];
  for (const option of options) {
    items.push(`
      <li>
        <label>
          <input type="radio" name="${name}" value="${option}" ${selectedValue === option ? `checked` : ""} />
          <code>${option}</code>
        </label>
      </li>
    `);
  }
  return `
    <fieldset>
      <legend>
        <code>${name}</code>
      </legend>
      <ol>
        ${items.join("")}
      </ol>
    </fieldset>
  `;
}

function parameterField({ name, type, value }) {
  // Number field
  if (type === "integer") {
    return `
      <label>
        <code>${name}</code><br />
        <input type="number" name="${name}" value="${value}" />
      </label>
    `;
  }

  // Radio buttons (special case for only “lock_reason”?)
  if (type === "string" && name === "lock_reason") {
    const options = ["off-topic", "too heated", "resolved", "spam"];
    return radioFieldSet({ name, options, selectedValue: value });
  }

  // Text field (Default)
  return `
    <label>
      <code>${name}</code><br />
      <input type="text" name="${name}" value="${value}" />
    </label>
  `;
}

export { parameterField };
