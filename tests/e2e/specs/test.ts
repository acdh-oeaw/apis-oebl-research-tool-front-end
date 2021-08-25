// https://docs.cypress.io/api/introduction/api.html

// import cy from 'cypress'

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.get('[test-id="user-field"]').type('wrong user')
    cy.get('[test-id="password-field"]').type('wrong password')
    cy.get('[test-id="login-form"]').submit()
    cy.contains(/falsches passwort/)
  })
})
