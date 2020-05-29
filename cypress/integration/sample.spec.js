/// <reference types="Cypress" />

describe("My First Test", () => {
  it("Visits the Kitchen Sink", () => {
    cy.visit("https://example.cypress.io");

    cy.pause();

    cy.contains("type").click();

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should("include", "/commands/actions");

    // Get an input, type into it and verify that the value has been updated
    cy.get(".action-email")
      .type("fake@email.com")
      .should("have.value", "fake@email.com");
  });
});
