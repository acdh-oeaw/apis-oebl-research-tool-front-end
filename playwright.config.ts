// import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

const isGithubAction = Boolean(process.env.CI);
const isProductionBuild = isGithubAction || process.env.E2E_TEST_BUILD === "production";
const port = isProductionBuild ? process.env.PORT || 3333 : 8080;
const baseUrl = `http://localhost:${port}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: isGithubAction,
	retries: isGithubAction ? 2 : 0,
	workers: isGithubAction ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: baseUrl,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },
		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],
	webServer: {
		command: isProductionBuild ? "npm run start" : "npm run dev",
		url: baseUrl,
		reuseExistingServer: !isGithubAction,
	},
});
