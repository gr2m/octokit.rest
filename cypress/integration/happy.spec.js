/// <reference types="Cypress" />

describe("Happy path", () => {
  it("Sends an authenticated `GET /emojis` request", () => {
    // TODO: make base URL configurable for CI
    cy.visit("http://localhost:3000");
  });
});
