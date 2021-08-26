// https://docs.cypress.io/api/introduction/api.html

describe('The IRS Lemma List System', () => {
  const listName = 'Test List Name ' + Math.floor(Math.random() * 99999)
  it('can create a list', () => {
    cy.login()
    cy.wait(10 * 1000)
    cy.get('[test-id=create-list-btn]').click()
    cy.get('[test-id=prompt-field]').type(listName)
    cy.get('[test-id=prompt-submit-btn]').click()
    cy.get('[test-id=sidebar]').contains(listName)
  })
  it('can’t create the same list name twice', () => {
    cy.get('[test-id=create-list-btn]').click()
    cy.get('[test-id=prompt-field]').type(listName)
    cy.get('[test-id=prompt-submit-btn]').should('be.disabled')
    cy.get('[test-id=prompt-abort-btn]').click()
  })
  it('can add lemmas to a list', () => {
    // open library
    cy.get('[test-id=lemma-library-link]').click()
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
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .click()
    cy.get('[test-id=lemma-table]')
      .first()
      .click()
      .trigger('keyup', { key: 'Delete' })
    cy.get('[test-id=confirm-submit-btn]')
      .click()
    // no lemmas exist in this list
    cy.get('[test-id=lemma-row]')
      .should('not.exist')
  })
  it('can delete a list', () => {
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .click()
    cy.get('[test-id=lemma-menu-btn]')
      .click()
    cy.get('[test-id=lemma-list-delete-btn]')
      .click()
    cy.get('[test-id=confirm-submit-btn]')
      .click()
    cy.get('[test-id=sidebar]')
      .contains(listName)
      .should('not.exist')
  })
})
