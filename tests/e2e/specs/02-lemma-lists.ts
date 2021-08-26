// https://docs.cypress.io/api/introduction/api.html

describe('The IRS Lemma List System', () => {
  const listName = 'Test List Name ' + Math.floor(Math.random() * 99999)
  before(() => {
    cy.login()
    cy.wait(10 * 1000)
  })
  it('can create a list', () => {
    // create list
    cy.get('[test-id=create-list-btn]')
      .click()
    // insert name
    cy.get('[test-id=prompt-field]')
      .type(listName)
    // confirm
    cy.get('[test-id=prompt-submit-btn]')
      .click()
    // assert it exists
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .should('exist')
  })
  it('can’t create the same list name twice', () => {
    // create list
    cy.get('[test-id=create-list-btn]')
      .click()
    // insert the same name
    cy.get('[test-id=prompt-field]')
      .type(listName)
    // assert we can’t confirm
    cy.get('[test-id=prompt-submit-btn]')
      .should('be.disabled')
    // abort
    cy.get('[test-id=prompt-abort-btn]')
      .click()
  })
  it('can add lemmas to a list with drag and drop', () => {
    // open library
    cy.get('[test-id=lemma-library-link]').click()
    // create the transfer storage here
    const dragStorage = new DataTransfer()
    // start dragging the first row
    cy.get('[test-id=lemma-row]')
      .first()
      .trigger('click')
      .trigger('dragstart', { dataTransfer: dragStorage })
    // drag and drop it over to the new list
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .trigger('dragover')
      .trigger('dragenter')
      .trigger('drop', { dataTransfer: dragStorage })
    // confirm the transfer
    cy.get('[test-id=confirm-submit-btn]')
      .should('be.visible')
      .click()
    // assert there’s now one lemma in the list
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .get('[test-id=lemma-list-count]')
      .should('contain.text', '1')
  })
  it('can remove lemmas from a list', () => {
    // open the list
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .click()
    // press backspace on the keyboard
    cy.get('[test-id=lemma-table]')
      .first()
      .click()
      .trigger('keyup', { key: 'Delete' })
    // confirm
    cy.get('[test-id=confirm-submit-btn]')
      .click()
    // assert no lemmas exist in this list
    cy.get('[test-id=lemma-row]')
      .should('not.exist')
  })
  it('can delete a list', () => {
    // open the list
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .click()
    // open menu
    cy.get('[test-id=lemma-menu-btn]')
      .click()
    // click delete
    cy.get('[test-id=lemma-list-delete-btn]')
      .click()
    // confirm
    cy.get('[test-id=confirm-submit-btn]')
      .click()
    // assert it’s gone
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .should('not.exist')
  })
})
