import { defineConfig, devices } from '@playwright/test';

// Plays the real production build (service worker included) in headless Chromium.
export default defineConfig({
	testDir: 'e2e',
	// the random-click monkey is long and CPU-hungry: run it on its own with `npm run e2e:monkey`
	testIgnore: process.env.MONKEY ? [] : ['**/monkey.spec.ts'],
	timeout: 60_000,
	fullyParallel: false,
	reporter: 'list',
	use: { baseURL: 'http://localhost:5195', trace: 'retain-on-failure' },
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'phone', use: { ...devices['Pixel 7'] } }
	],
	webServer: {
		command: 'npm run build && npx vite preview --port 5195 --strictPort',
		url: 'http://localhost:5195',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
