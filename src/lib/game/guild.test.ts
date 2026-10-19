import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { choose, newRun, randomHero } from '#lib/game/engine';
import { syncGrid } from '#lib/game/bag';
import { makeCtx } from '#lib/game/cards/index';
import { GUILD_T } from '#lib/game/cards/guild';
import {
	GUILD_RANKS,
	MAX_WAREHOUSE_CITIES,
	canStore,
	guildDiscount,
	guildRank,
	guildTitle,
	guildVolume,
	recordGuildTrade,
	retrieve,
	retrieveFromWarehouse,
	shipTo,
	store,
	storeInWarehouse,
	warehouseAt,
	warehouseCapacity,
	warehouseCities
} from '#lib/game/guild';
import type { Run } from '#lib/game/types';

function makeTestRun(city = 'beijing', year = 1700, seed = 42): Run {
	const r = new Rng(seed);
	const run = newRun(randomHero(r, year), 'guild-test-' + seed, year);
	run.location = city;
	run.phase = 'city';
	run.deck = [];
	run.stats.silver = 90;
	run.bagKind = 'trunk';
	run.bag = [];
	syncGrid(run);
	return run;
}

describe('guild rank and volume', () => {
	it('starts at rank 0 and scales up to rank 5 with trade volume', () => {
		const run = makeTestRun();
		expect(GUILD_RANKS).toHaveLength(6);
		expect(guildVolume(run)).toBe(0);
		expect(guildRank(run)).toBe(0);
		expect(guildTitle(run)).toBe('Unlicensed Peddler');
		expect(guildDiscount(run)).toBe(0);

		const notes: string[] = [];
		const r1 = recordGuildTrade(run, 45, notes);
		expect(r1).toBe(1);
		expect(guildVolume(run)).toBe(45);
		expect(guildRank(run)).toBe(1);
		expect((run as { guild?: number }).guild).toBe(1);
		expect(guildTitle(run)).toBe('Registered Factor');
		expect(guildDiscount(run)).toBeCloseTo(0.03);
		expect(run.factions?.guild).toBeGreaterThan(0);
		expect(notes.length).toBe(1);

		recordGuildTrade(run, 60, notes); // total 105 -> rank 2
		expect(guildRank(run)).toBe(2);
		expect(guildTitle(run)).toBe('Sworn Merchant');

		recordGuildTrade(run, 100, notes); // total 205 -> rank 3
		expect(guildRank(run)).toBe(3);

		recordGuildTrade(run, 150, notes); // total 355 -> rank 4
		expect(guildRank(run)).toBe(4);

		recordGuildTrade(run, 250, notes); // total 605 -> rank 5
		expect(guildRank(run)).toBe(5);
		expect(guildTitle(run)).toBe('Grand Elder of the Guild');
		expect(guildDiscount(run)).toBeCloseTo(0.15);
	});

	it('respects explicit run.guild when guild:vol flag is not set', () => {
		const run = makeTestRun();
		(run as { guild?: number }).guild = 3;
		expect(guildRank(run)).toBe(3);
		expect(guildTitle(run)).toBe('Chamber Syndic');
		expect(warehouseCapacity(run)).toBe(10);
	});
});

describe('warehouse storage and limits', () => {
	it('stores and retrieves items while syncing bag grid and cleaning empty arrays', () => {
		const run = makeTestRun('beijing');
		run.bag = ['good:silk', 'good:tea', 'rations'];
		syncGrid(run);

		expect(canStore(run, 'good:silk')).toBe(true);
		expect(canStore(run, 'good:porcelain')).toBe(false);

		expect(store(run, 'good:silk')).toBe(true);
		expect(run.bag).not.toContain('good:silk');
		expect(warehouseAt(run, 'beijing')).toEqual(['good:silk']);
		expect(warehouseCities(run)).toEqual(['beijing']);

		expect(storeInWarehouse(run, 'good:tea', 'beijing')).toBe(true);
		expect(warehouseAt(run, 'beijing')).toEqual(['good:silk', 'good:tea']);

		expect(retrieve(run, 'good:silk', 'beijing')).toBe(true);
		expect(run.bag).toContain('good:silk');
		expect(warehouseAt(run, 'beijing')).toEqual(['good:tea']);

		expect(retrieveFromWarehouse(run, 'good:tea', 'beijing')).toBe(true);
		expect(warehouseAt(run, 'beijing')).toEqual([]);
		expect(warehouseCities(run)).toEqual([]);
		expect(run.warehouse?.beijing).toBeUndefined();
	});

	it('enforces the 3-city warehouse limit and per-city capacity', () => {
		const run = makeTestRun('beijing');
		expect(MAX_WAREHOUSE_CITIES).toBe(3);
		expect(warehouseCapacity(run)).toBe(4); // rank 0 -> 4 slots

		run.bag = ['rations', 'rations', 'rations', 'rations', 'rations', 'charm', 'lantern', 'umbrella'];
		syncGrid(run);

		expect(store(run, 'rations', 'beijing')).toBe(true);
		expect(store(run, 'charm', 'nanjing')).toBe(true);
		expect(store(run, 'lantern', 'suzhou')).toBe(true);
		expect(warehouseCities(run)).toHaveLength(3);

		// 4th city is rejected
		expect(canStore(run, 'umbrella', 'guangzhou')).toBe(false);
		expect(store(run, 'umbrella', 'guangzhou')).toBe(false);

		// Storing more in an already active city succeeds up to capacity (4)
		expect(store(run, 'rations', 'beijing')).toBe(true);
		expect(store(run, 'rations', 'beijing')).toBe(true);
		expect(store(run, 'rations', 'beijing')).toBe(true);
		expect(warehouseAt(run, 'beijing')).toHaveLength(4);

		// 5th item in beijing at rank 0 is rejected
		expect(canStore(run, 'umbrella', 'beijing')).toBe(false);
		expect(store(run, 'umbrella', 'beijing')).toBe(false);
	});
});

describe('warehouse shipping (shipTo)', () => {
	it('ships goods between cities, deducts silver, and records guild trade volume', () => {
		const run = makeTestRun('beijing');
		run.bag = ['good:silk', 'good:tea'];
		syncGrid(run);
		store(run, 'good:silk', 'beijing');
		store(run, 'good:tea', 'beijing');

		const silverBefore = run.stats.silver;
		// Land route from beijing to xian has 0 sea-loss risk
		const res = shipTo(run, 'good:silk', 'beijing', 'xian');
		expect(res.ok).toBe(true);
		expect(res.cost).toBeGreaterThanOrEqual(2);
		expect(res.days).toBeGreaterThan(0);
		expect(res.lost).toBe(false);
		expect(run.stats.silver).toBe(silverBefore - res.cost);
		expect(guildVolume(run)).toBe(res.cost);
		expect(warehouseAt(run, 'beijing')).toEqual(['good:tea']);
		expect(warehouseAt(run, 'xian')).toEqual(['good:silk']);
	});

	it('validates error conditions in shipTo', () => {
		const run = makeTestRun('beijing');
		run.bag = ['rations', 'charm', 'lantern', 'umbrella'];
		syncGrid(run);
		store(run, 'rations', 'beijing');
		store(run, 'charm', 'beijing');
		store(run, 'lantern', 'nanjing');
		store(run, 'umbrella', 'suzhou');

		// Same city
		expect(shipTo(run, 'rations', 'beijing', 'beijing').ok).toBe(false);
		// Missing item
		expect(shipTo(run, 'good:silk', 'beijing', 'nanjing').ok).toBe(false);
		// Exceeding 3-city limit (beijing, nanjing, suzhou already active)
		expect(shipTo(run, 'rations', 'beijing', 'guangzhou').ok).toBe(false);

		// Insufficient silver
		run.stats.silver = 1;
		expect(shipTo(run, 'rations', 'beijing', 'nanjing').ok).toBe(false);
	});
});

describe('guild card templates (GUILD_T)', () => {
	it('builds and plays all 4 guild cards without em dashes', () => {
		expect(GUILD_T.map((t) => t.id)).toEqual([
			'guild-rank-up',
			'guild-contract',
			'guild-rival',
			'guild-warehouse-fire'
		]);

		const run = makeTestRun('guangzhou', 1700, 77);
		recordGuildTrade(run, 120); // rank 2
		run.bag = ['good:silk'];
		syncGrid(run);
		store(run, 'good:silk', 'guangzhou');

		for (const tmpl of GUILD_T) {
			const ctx = makeCtx(run, new Rng(run.rng), 'city', null, null);
			expect(tmpl.when?.(ctx)).toBe(true);
			const w = typeof tmpl.weight === 'function' ? tmpl.weight(ctx) : (tmpl.weight ?? 1);
			expect(w).toBeGreaterThan(0);

			const card = tmpl.make(ctx);
			expect(card.id).toBe(tmpl.id);
			expect(card.text).not.toContain('—');
			expect(card.left.label).not.toContain('—');
			expect(card.right.label).not.toContain('—');
			if (card.up) {
				expect(card.up.label).not.toContain('—');
				expect(card.up.why).toBeTruthy();
			}
		}

		// Play guild-rank-up right choice -> sets guild:ceremony
		const rankUpCard = GUILD_T[0].make(makeCtx(run, new Rng(11), 'city', null, null));
		run.deck = [rankUpCard];
		choose(run, 'right');
		expect(run.flags['guild:ceremony']).toBe(2);

		// Play guild-contract right choice -> adds contract quest
		const contractCard = GUILD_T[1].make(makeCtx(run, new Rng(22), 'city', null, null));
		const questsBefore = run.quests.length;
		run.deck = [contractCard];
		run.phase = 'city';
		choose(run, 'right');
		expect(run.quests.length).toBe(questsBefore + 1);
		expect(run.quests.at(-1)?.kind).toBe('contract');

		// Play guild-warehouse-fire up choice -> sets guild:fire flag
		const fireCard = GUILD_T[3].make(makeCtx(run, new Rng(33), 'city', null, null));
		expect(fireCard.up).toBeDefined();
		run.deck = [fireCard];
		run.phase = 'city';
		choose(run, 'up');
		expect(run.flags['guild:fire']).toBe(true);
	});
});
