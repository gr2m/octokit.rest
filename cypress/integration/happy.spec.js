/// <reference types="Cypress" />

const baseUrl = Cypress.env("base_url") || "http://localhost:3000";

describe("Happy path", () => {
  it("Sends an authenticated `GET /emojis` request", () => {
    cy.visit(baseUrl);
  });
});
