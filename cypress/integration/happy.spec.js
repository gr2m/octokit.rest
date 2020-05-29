/// <reference types="Cypress" />

const baseUrl = process.env.TEST_URL || "http://localhost:3000";

describe("Happy path", () => {
  it("Sends an authenticated `GET /emojis` request", () => {
    cy.visit(baseUrl);
  });
});
