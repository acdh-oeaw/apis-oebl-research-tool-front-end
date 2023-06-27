import { test as baseTest, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import authUsers from './.auth/authUsers.json'

export * from '@playwright/test'

export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.

    const id = test.info().parallelIndex
    const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`)
    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName)
      return
    }

    // Important: make sure we authenticate in a clean environment by unsetting storage state.
    const page = await browser.newPage({ storageState: undefined })

    const user = authUsers[id]

    // Perform authentication steps. Replace these actions with your own.

    await page.goto('http://localhost:8080/lemmas')
    await page.getByPlaceholder('User Name').click()
    await page.getByPlaceholder('User Name').fill(user.username)
    await page.getByPlaceholder('User Name').press('Tab')
    await page.getByPlaceholder('Password').fill(user.password)
    await page.getByPlaceholder('Password').press('Enter')
    await expect(page.getByPlaceholder('Password')).toBeHidden()
    await page.context().storageState({ path: fileName })
    await page.close()
    await use(fileName)

    // End of authentication steps.
  }, { scope: 'worker' }],
})
