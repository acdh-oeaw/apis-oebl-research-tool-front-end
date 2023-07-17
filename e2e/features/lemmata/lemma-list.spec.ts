import { expect, test } from "~/e2e/fixtures";

test("add new lemmalist", async ({ page }) => {
	// https://playwright.dev/docs/test-timeouts#set-timeout-for-a-single-test
	test.slow();

	const randomListName = `Testliste ${Math.random().toString(36).substring(2, 10)}`;

	await page.goto("/lemmata");

	expect(page.getByRole("heading", { name: "Lemmabibliothek" })).toBeVisible();

	await page.getByRole("button", { name: "Liste anlegen" }).click();
	await page.getByPlaceholder("Listenname…").click();
	await page.getByPlaceholder("Listenname…").fill(randomListName);
	await page.getByRole("button", { name: "OK" }).click();

	await expect(page.getByRole("link", { name: randomListName }).first()).toBeVisible();
});
