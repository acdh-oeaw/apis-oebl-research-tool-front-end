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
    cy.get('[test-id="user-field"]').clear().type('TestUser1')
    cy.get('[test-id="password-field"]').clear().type('celoyimeperomiromo')
    cy.get('[test-id="login-form"]').submit()
    cy.wait(10 * 1000)
  })

})
