/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Create several Todo items via UI
     * @example
     * cy.createDefaultTodos()
     */
    login(): Chainable<any>
    // dragAndDrop: (dragSelector: Cypress.Chainable<JQuery<HTMLElement>>, dropSelector: Cypress.Chainable<JQuery<HTMLElement>>) => Cypress.Chainable<JQuery<HTMLElement>>;
  }
}
