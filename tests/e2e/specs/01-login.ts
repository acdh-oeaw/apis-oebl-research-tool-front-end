// https://docs.cypress.io/api/introduction/api.html

// eslint-disable-next-line handle-callback-err
Cypress.on('uncaught:exception', (err, runnable) => false)

describe('The IRS Login', () => {
  it('rejects a bad authentication attempt', () => {
    cy.visit('/')
    cy.get('[test-id="user-field"]').type('wrong user')
    cy.get('[test-id="password-field"]').type('wrong password')
    cy.get('[test-id="login-form"]').submit()
    cy.contains(/falsch/i)
    cy.contains(/passwort/i)
  })

  it('allows a privileged user to login', () => {
    cy.get('[test-id="user-field"]').clear().type(Cypress.env('username'))
    cy.get('[test-id="password-field"]').clear().type(Cypress.env('password'))
    cy.get('[test-id="login-form"]').submit()
    cy.get('[test-id="login-form"]', { timeout: 10000 }).should('not.exist')
  })

})
