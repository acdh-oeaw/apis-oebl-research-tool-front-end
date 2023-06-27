import { test, expect } from '../fixtures'

test('add new lemma to lemma library', async ({ page }) => {
  test.slow()
  const foreName = 'Testbert'
  const randomSureName = `Muster${Math.random().toString(36).substring(2, 10).replace(/[0-9]/g,'')}`
  await page.goto('http://localhost:8080/');
  await page.goto('http://localhost:8080/lemmas');
  await expect (page.getByTestId('lemma_table')).toBeVisible()
  await expect (page.getByTestId('lemma_row').first()).toBeVisible()
  await page.getByTestId('lemma_menu_btn').click();
  await page.getByText('Lemma hinzufügen…').click();
  await page.getByTestId('addlemma_firstname').getByRole('textbox').click();
  await page.getByTestId('addlemma_firstname').getByRole('textbox').fill(foreName);
  await expect (page.getByTestId('addlemma_firstname').locator('.fake-textarea')).toContainText(foreName);
  // how to avoid the timeout
  await page.waitForTimeout(300);
  await page.getByTestId('addlemma_lastname').getByRole('textbox').click();
  await page.getByTestId('addlemma_lastname').getByRole('textbox').fill(randomSureName);
  await expect (page.getByTestId('addlemma_lastname').locator('.fake-textarea')).toContainText(randomSureName);
  // how to avoid the timeout
  await page.waitForTimeout(300);
  await page.getByTestId('addlemma_btn').click();
  await page.getByTestId('lemma_row').first().click();
  await page.keyboard.press('End');
  await page.waitForTimeout(300);
  await expect (page.getByText(new RegExp(`\\${randomSureName}.*`))).toBeVisible();
});