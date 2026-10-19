import { expect, test, type Page } from '@playwright/test';

async function fresh(page: Page) {
	await page.goto('/');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
}

/** Drag the top card off-screen like a finger would. */
async function swipe(page: Page, dir: 'left' | 'right' | 'up', selector = '.card') {
	const card = page.locator(selector).first();
	await card.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
	const box = await card.boundingBox({ timeout: 3000 }).catch(() => null);
	if (!box) return; // the card left the screen (e.g. an outcome replaced it)
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;
	await page.mouse.move(cx, cy);
	await page.mouse.down();
	const [dx, dy] = dir === 'left' ? [-260, 0] : dir === 'right' ? [260, 0] : [0, -260];
	for (let i = 1; i <= 8; i++) await page.mouse.move(cx + (dx * i) / 8, cy + (dy * i) / 8);
	await page.mouse.up();
}

/** Resolve whatever is on screen: outcomes, mini-games, cards — until the map shows. */
async function untilMap(page: Page, max = 12) {
	for (let i = 0; i < max; i++) {
		if (await page.locator('.routes-list').isVisible()) return;
		if (await page.locator('.mg').isVisible()) {
			await page.getByRole('button', { name: 'Let the dice decide' }).click();
			continue;
		}
		if (await page.locator('.outcome').isVisible()) {
			await page.locator('.outcome').click();
			continue;
		}
		if (await page.locator('.ending').isVisible()) return;
		if (await page.locator('.card').first().isVisible()) {
			await swipe(page, i % 2 ? 'left' : 'right');
			await page.waitForTimeout(400);
			continue;
		}
		await page.waitForTimeout(300);
	}
}

test('title → daily journey → swipe → map → travel', async ({ page }) => {
	await fresh(page);
	await expect(page.getByRole('heading', { name: 'Four Seas' })).toBeVisible();
	await page.getByRole('button', { name: /Daily journey/ }).click();
	// the intro card from the patron
	await expect(page.locator('.card')).toBeVisible();
	await expect(page.locator('.text')).toContainText('entrusts you with');
	// screen readers hear the card
	await expect(page.locator('[aria-live="polite"]')).toContainText('Left:');
	await swipe(page, 'right');
	await untilMap(page);
	await expect(page.locator('.map')).toBeVisible();
	await expect(page.locator('.map path[fill="var(--land)"]')).toHaveAttribute('d', /M/);
	const routes = page.locator('.route');
	expect(await routes.count()).toBeGreaterThan(0);
	await routes.first().click();
	await page.getByRole('button', { name: /Depart/ }).click();
	// travelling: the journey strip and a travel card
	await expect(page.locator('.scene-strip')).toBeVisible();
	await expect(page.locator('.text .opener')).toContainText(/Day \d+ out of/);
});

test('venues, energy and the market in town', async ({ page }) => {
	await fresh(page);
	await page.getByRole('button', { name: /Daily journey/ }).click();
	await swipe(page, 'right');
	await untilMap(page);
	await expect(page.getByLabel('Places in town')).toBeVisible();
	await expect(page.getByLabel('Energy')).toBeVisible();
	const inn = page.getByLabel('Places in town').getByRole('button').first();
	await inn.click();
	// who is here — swipe profiles
	const people = page.locator('.people');
	await expect(people).toBeVisible();
	await expect(people.locator('.match')).toBeVisible();
	await people.getByRole('button', { name: 'Hang out' }).click();
	await expect(page.locator('.card')).toBeVisible();
	const shop = page.getByLabel('Places in town').getByRole('button', { name: /bazaar|Market/ });
	if (await shop.count()) {
		await shop.first().click();
		await expect(page.getByRole('dialog', { name: 'Market' })).toBeVisible();
		await page.keyboard.press('Escape');
	}
});

test('character creator with traits, difficulty and a campaign', async ({ page }) => {
	await fresh(page);
	await page.getByRole('button', { name: 'New journey' }).click();
	await page.getByRole('button', { name: 'Nihon' }).click();
	await page.getByRole('button', { name: /Choose traits/ }).click();
	await expect(page.getByText('(0/3)')).toBeVisible();
	await swipe(page, 'right', '.sw');
	await expect(page.locator('.picked .badge')).toHaveCount(1); // a virtue or a flaw
	await page.getByRole('button', { name: /Random traits/ }).click();
	await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
	await page.getByRole('button', { name: /The Opening of Japan/ }).click();
	await page.getByRole('button', { name: /Rōnin/ }).click();
	await page.getByRole('button', { name: /Set out/ }).click();
	await expect(page.locator('.text')).toContainText(/Dutch|warning|entrusts/);
	const save = await page.evaluate(() => JSON.parse(localStorage.getItem('four-seas:run') ?? '{}'));
	expect(save.flags.campaign).toBe('opening-of-japan');
	expect(save.difficulty).toBe('ronin');
	expect(save.location).toBe('nagasaki');
});

test('drawer tabs, settings and translation', async ({ page }) => {
	await fresh(page);
	await page.getByRole('button', { name: /Daily journey/ }).click();
	await page.getByRole('button', { name: /^Bag \d/ }).click();
	for (const tab of ['Self', 'People', 'World', 'Tasks', 'Journal']) {
		await page.locator('.drawer .tabs').getByRole('button', { name: tab, exact: true }).click();
	}
	await expect(page.locator('.drawer')).toContainText('Seed');
	await page.keyboard.press('Escape');
	await page.goto('/');
	await page.getByRole('button', { name: /Settings/ }).click();
	await page.locator('.lang select').selectOption('ja');
	await page.getByRole('button', { name: 'キャンセル' }).click();
	await expect(page.getByRole('button', { name: /新しい旅/ })).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('four-seas:lang'))).toBe('ja');
});

test('card editor previews Markdown and reports mistakes', async ({ page }) => {
	await page.goto('/editor');
	await expect(page.locator('.card')).toBeVisible();
	await expect(page.locator('.text')).toContainText('kite');
	const ta = page.getByLabel('Card Markdown');
	await ta.fill('where: city\n\nHello there.\n\n## left: a\nfx: gold +5\n\n## right: b\nfx: silver +1');
	await expect(page.getByRole('alert')).toContainText('Bad effect');
});

test('works offline once loaded', async ({ page, context }) => {
	await fresh(page);
	await page.evaluate(async () => {
		const reg = await navigator.serviceWorker.ready;
		return reg.active?.state;
	});
	// give the install step time to cache everything
	await page.waitForFunction(async () => (await caches.keys()).length > 0 && (await (await caches.open((await caches.keys())[0])).keys()).length > 40, null, { timeout: 30_000 });
	await page.reload();
	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Four Seas' })).toBeVisible();
	await page.getByRole('button', { name: /Daily journey/ }).click();
	await swipe(page, 'right');
	await untilMap(page);
	await expect(page.locator('.map path[fill="var(--land)"]')).toHaveAttribute('d', /M/);
	await context.setOffline(false);
});
