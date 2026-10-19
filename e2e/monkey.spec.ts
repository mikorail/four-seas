import { expect, test, type Page } from '@playwright/test';

// Random play through the real UI. Any uncaught error or console error fails the test.
const SAFE = [
	'.hint', // card choices
	'.outcome',
	'.venues button:not([disabled])',
	'.route',
	'.depart .primary',
	'.chips button',
	'.tabs button',
	'.drawer .ghosty:not([disabled])',
	'.goods .buy:not([disabled])',
	'.item',
	'.cell',
	'.rest',
	'.heir',
	'.people .round:not([disabled])',
	'.people .ghost',
	'.tip .ok',
	'button.primary'
];

async function monkey(page: Page, steps: number, seed: number) {
	let s = seed;
	const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
	for (let i = 0; i < steps; i++) {
		// close dialogs often so we keep moving; mostly play the cards
		if ((await page.locator('.drawer, .market, .modal, .people, .codex').count()) && rnd() < 0.5) await page.keyboard.press('Escape');
		const sel = rnd() < 0.55 ? (rnd() < 0.7 ? '.hint' : '.outcome') : SAFE[Math.floor(rnd() * SAFE.length)];
		const els = page.locator(sel);
		const n = await els.count();
		if (!n) continue;
		const el = els.nth(Math.floor(rnd() * n));
		if (!(await el.isVisible().catch(() => false))) continue;
		await el.click({ timeout: 800 }).catch(() => {});
		await page.waitForTimeout(40);
		if (await page.locator('.ending').isVisible().catch(() => false)) {
			// start over (or continue) when the journey ends
			const next = page.getByRole('button', { name: /Next assignment|Keep wandering|New journey/ }).first();
			if (await next.isVisible().catch(() => false)) await next.click().catch(() => {});
			if (await page.getByRole('heading', { name: /Who sets out/ }).isVisible().catch(() => false)) {
				await page.goto('/');
				await page.getByRole('button', { name: /Daily journey/ }).click();
			}
		}
	}
}

for (const seed of [1, 2, 3]) {
	test(`monkey play ${seed}: no crashes`, async ({ page }) => {
		test.setTimeout(420_000);
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
		page.on('console', (m) => {
			if (m.type() === 'error' && !/favicon|Failed to load resource|net::|serviceWorker/i.test(m.text())) errors.push('console: ' + m.text());
		});
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
		await page.getByRole('button', { name: /Daily journey/ }).click();
		await monkey(page, 500, seed * 7919);
		const progress = await page.evaluate(() => {
			const r = JSON.parse(localStorage.getItem('four-seas:run') ?? 'null');
			const c = JSON.parse(localStorage.getItem('four-seas:chronicle') ?? 'null');
			return { cards: r?.cardsSeen ?? 0, day: r?.day ?? 0, runs: c?.runs ?? 0 };
		});
		console.log(`monkey ${seed}:`, JSON.stringify(progress));
		if (progress.cards < 15) {
			await page.screenshot({ path: `test-results/stuck-${seed}-${test.info().project.name}.png` });
			console.log('state', JSON.stringify(await page.evaluate(() => { const r = JSON.parse(localStorage.getItem('four-seas:run') ?? 'null'); return { phase: r?.phase, deck: r?.deck?.length, top: r?.deck?.[0]?.id, loc: r?.location, route: r?.route?.to, ending: r?.ending?.kind, energy: r?.energy }; })));
			console.log('visible', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.panel button')].filter((b) => (b as HTMLElement).offsetParent).slice(0, 25).map((b) => (b.textContent ?? '').trim().slice(0, 30) + ((b as HTMLButtonElement).disabled ? '[x]' : '')))));
		}
		expect(progress.cards + progress.runs * 20).toBeGreaterThan(15); // finishing a journey counts as progress
		expect(errors, errors.join('\n')).toEqual([]);
		// still a working game screen
		await expect(page.locator('main')).toBeVisible();
	});
}
