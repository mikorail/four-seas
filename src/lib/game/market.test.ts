import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { choose, dropItem, newRun, randomHero, useItem, visitVenue } from '#lib/game/engine';
import { buy, curioValue, hasMarket, marketStock, passesAsLocal, sell, solveRiddle, stockOf, venuesHere, wear } from '#lib/game/market';
import { CITIES, CITY } from '#lib/data/world';
import { CURIOS, OUTFITS, RIDDLES } from '#lib/data/market';
import { ITEMS } from '#lib/data/items';
import { venuesOf } from '#lib/data/venues';
import { perksOf } from '#lib/game/mods';
import { UPRISINGS, REBELLION_T } from '#lib/game/cards/rebellion';
import { ROMANCE_T } from '#lib/game/cards/romance';
import { makeCtx } from '#lib/game/cards/index';
import type { Run } from '#lib/game/types';

function at(city: string, year = 1700, i = 1): Run {
	const r = new Rng(i);
	const run = newRun(randomHero(r, year), 'm' + i, year);
	run.location = city;
	run.phase = 'map';
	run.deck = [];
	run.stats.silver = 80;
	run.flags.energyMax = 'unlimited';
	return run;
}

describe('venues', () => {
	it('small towns only have an inn and a shrine; capitals have a palace and a bazaar', () => {
		const ise = venuesOf(CITY.ise, 1700, null).map((v) => v.id);
		expect(ise).toContain('inn');
		expect(ise).not.toContain('market');
		expect(ise).not.toContain('bazaar');
		const bj = venuesOf(CITY.beijing, 1700, null).map((v) => v.id);
		expect(bj).toEqual(expect.arrayContaining(['inn', 'bazaar', 'palace', 'academy', 'landmark', 'square']));
		expect(venuesOf(CITY.agra, 1600, null).some((v) => v.id === 'landmark')).toBe(false); // Taj not built yet
	});

	it('every city has an inn, and every venue card can be played', () => {
		for (const c of CITIES.slice(0, 60)) {
			const run = at(c.id, Math.max(1500, c.from ?? 1500));
			for (const v of venuesHere(run)) {
				if (v.id === 'market' || v.id === 'bazaar') continue;
				expect(visitVenue(run, v.id), `${c.id}/${v.id}`).toBe(true);
				expect(visitVenue(run, v.id)).toBe(false); // once per stay
				choose(run, 'left');
				if (run.phase === 'end') break;
				run.phase = 'map';
				run.deck = [];
			}
			expect(venuesOf(c, 1700, null)[0].id).toBe('inn');
		}
	});
});

describe('market', () => {
	it('sells outfits that change perks and pass you off as local', () => {
		const run = at('istanbul', 1650);
		expect(hasMarket(run)).toBe(true);
		const s = marketStock(run);
		expect(s.outfits.some((o) => o.id === 'local-dress')).toBe(true);
		const before = perksOf(run).length;
		expect(buy(run, 'local-dress')).toBeNull();
		expect(run.outfit?.culture).toBe('ottoman');
		expect(perksOf(run).length).toBe(before + 1);
		expect(passesAsLocal(run, 'ottoman')).toBe(true);
		expect(passesAsLocal(run, 'han')).toBe(false);
		wear(run, 'none');
		expect(run.outfit).toBeUndefined();
	});

	it('curios fetch far more where they are prized', () => {
		const run = at('kyoto', 1700);
		const v = CURIOS.find((c) => c.id === 'curio-katana')!;
		expect(curioValue(run, v.id, 'amsterdam')).toBeGreaterThan(curioValue(run, v.id, 'kyoto') * 2);
		run.bag = [v.id];
		run.location = 'amsterdam';
		const s0 = run.stats.silver;
		expect(sell(run, v.id)).toBeGreaterThan(v.price);
		expect(run.stats.silver).toBeGreaterThan(s0);
		expect(run.bag).not.toContain(v.id);
	});

	it('riddle maps become treasure quests when solved', () => {
		const run = at('guangzhou', 1700);
		run.bag = ['treasure-map-0'];
		expect(solveRiddle(run, 'treasure-map-0', RIDDLES[0].answer)).toBe(true);
		expect(run.quests.some((q) => q.to === RIDDLES[0].answer)).toBe(true);
		const run2 = at('guangzhou', 1700, 2);
		run2.bag = ['treasure-map-1'];
		expect(solveRiddle(run2, 'treasure-map-1', RIDDLES[1].options.find((o) => o !== RIDDLES[1].answer)!)).toBe(false);
		expect(run2.bag).not.toContain('treasure-map-1');
	});

	it('outfits are added to inventory bag, stock is 1, and duplicate buy is disabled/rejected', () => {
		const run = at('istanbul', 1650);
		run.bag = [];
		expect(stockOf(run, 'monk-robes')).toBe(1);
		expect(buy(run, 'monk-robes')).toBeNull();
		expect(run.bag).toContain('monk-robes');
		expect(run.outfit?.id).toBe('monk-robes');
		expect(stockOf(run, 'monk-robes')).toBe(0);
		// Trying to buy again returns Sold out
		expect(buy(run, 'monk-robes')).toBe('Sold out.');

		// Unequip keeps it in luggage
		wear(run, 'none');
		expect(run.outfit).toBeUndefined();
		expect(run.bag).toContain('monk-robes');

		// Wear from luggage
		wear(run, 'monk-robes');
		expect(run.outfit?.id).toBe('monk-robes');

		// Dropping removes and unequips
		dropItem(run, 'monk-robes');
		expect(run.bag).not.toContain('monk-robes');
		expect(run.outfit).toBeUndefined();
	});

	it('secret charts and riddle maps have stock 1', () => {
		const run = at('beijing', 1700);
		const s = marketStock(run);
		if (s.charts.length) {
			const chartId = s.charts[0];
			expect(stockOf(run, chartId)).toBe(1);
			expect(buy(run, chartId)).toBeNull();
			expect(stockOf(run, chartId)).toBe(0);
			expect(buy(run, chartId)).toBe('Sold out.');
		}
		if (s.riddles.length) {
			const riddleId = s.riddles[0];
			expect(stockOf(run, riddleId)).toBe(1);
			expect(buy(run, riddleId)).toBeNull();
			expect(stockOf(run, riddleId)).toBe(0);
			expect(buy(run, riddleId)).toBe('Sold out.');
		}
	});

	it('supplies stock is finite and decrements until sold out', () => {
		const run = at('beijing', 1700);
		run.bag = [];
		const initStock = stockOf(run, 'rations');
		expect(initStock).toBeGreaterThan(0);
		for (let i = 0; i < initStock; i++) {
			expect(stockOf(run, 'rations')).toBe(initStock - i);
			expect(buy(run, 'rations')).toBeNull();
		}
		expect(stockOf(run, 'rations')).toBe(0);
		expect(buy(run, 'rations')).toBe('Sold out.');
	});

	it('consumables manage stats, reduce dangerous high stats, clear heat, and heal ailments', () => {
		const run = at('kyoto', 1700);
		run.bag = ['ascetic-tea', 'calming-draught', 'joss-paper', 'alms-pouch', 'incense', 'fever-tonic'];
		run.heat = 50;

		// 1. Ascetic tea reduces renown (-15) and cools heat (-10)
		run.stats.renown = 80;
		const rTea = useItem(run, 'ascetic-tea');
		expect(rTea).not.toBeNull();
		expect(run.stats.renown).toBeLessThan(80);
		expect(run.heat).toBe(40);

		// 2. Calming draught reduces vigor (-15)
		run.stats.vigor = 85;
		const rCalm = useItem(run, 'calming-draught');
		expect(rCalm).not.toBeNull();
		expect(run.stats.vigor).toBeLessThan(85);

		// 3. Joss paper reduces fortune (-15)
		run.stats.fortune = 90;
		const rJoss = useItem(run, 'joss-paper');
		expect(rJoss).not.toBeNull();
		expect(run.stats.fortune).toBeLessThan(90);

		// 4. Alms pouch reduces silver (-15) and cools heat (-10)
		run.stats.silver = 85;
		const rAlms = useItem(run, 'alms-pouch');
		expect(rAlms).not.toBeNull();
		expect(run.stats.silver).toBeLessThan(85);
		expect(run.heat).toBe(30);

		// 5. Purifying incense purges heat (-25)
		const rIncense = useItem(run, 'incense');
		expect(rIncense).not.toBeNull();
		expect(run.heat).toBe(5);

		// 6. Fever tonic heals vigor
		run.stats.vigor = 20;
		const rFever = useItem(run, 'fever-tonic');
		expect(rFever).not.toBeNull();
		expect(run.stats.vigor).toBeGreaterThan(20);
	});

	it('every outfit and riddle references real data', () => {
		for (const r of RIDDLES) for (const o of r.options) expect(CITY[o], o).toBeTruthy();
		for (const o of Object.values(OUTFITS)) expect(o.price).toBeGreaterThan(0);
	});
});

describe('romance & rebellion', () => {
	it('courting, letters and marriage', () => {
		const run = at('hangzhou', 1700);
		const meet = ROMANCE_T.find((t) => t.id === 'love-meet')!;
		run.deck = [meet.make(makeCtx(run, new Rng(3), 'city', null, null))];
		run.phase = 'city';
		choose(run, 'right');
		expect(run.romance?.status).toBe('courting');
		expect(run.flags.lover).toBe(run.romance!.npc.name);
	});

	it('every uprising names real cities, and joining one leads to missions', () => {
		for (const u of UPRISINGS) for (const c of u.cities) expect(CITY[c], `${u.id}:${c}`).toBeTruthy();
		const run = at('manila', 1897);
		const call = REBELLION_T.find((t) => t.id === 'rev-call')!;
		const c = makeCtx(run, new Rng(5), 'city', null, null);
		expect(typeof call.weight === 'function' && call.weight(c)).toBeGreaterThan(0);
		run.deck = [call.make(c)];
		run.phase = 'city';
		choose(run, 'left');
		expect(run.flags['rev:katipunan']).toBe('rebel');
		const mission = REBELLION_T.find((t) => t.id === 'rev-mission')!;
		const c2 = makeCtx(run, new Rng(6), 'city', null, null);
		expect(typeof mission.weight === 'function' && mission.weight(c2)).toBeGreaterThan(0);
	});
});

import { autoPack, canFit, capacity, moveItem, packsOf, rotateItem, shapeOf, syncGrid } from '#lib/game/bag';
import { addItem, depart, availableRoutes, endingCause, openMarket, restDay, spendEnergy } from '#lib/game/engine';
import { energyMax } from '#lib/game/market';
import { rapportOf } from '#lib/game/mods';
import { TRAITS } from '#lib/data/traits';

describe('tile bag', () => {
	it('items have shapes and the grid refuses what does not fit', () => {
		const run = at('guangzhou');
		run.bag = [];
		run.grid = [];
		run.bagKind = 'bundle'; // 2×2
		run.mount = null;
		run.extraBags = [];
		expect(capacity(run)).toBe(4);
		expect(shapeOf('sword')).toEqual([3, 1]);
		expect(addItem(run, 'sword')).toBe(false); // 3 long never fits a 2×2 bundle
		expect(addItem(run, 'good:silk')).toBe(true); // 2×1
		expect(addItem(run, 'good:tea')).toBe(true);
		expect(addItem(run, 'rations')).toBe(false); // full
		run.extraBags = ['basket'];
		syncGrid(run);
		expect(canFit(run, 'rations')).toBe(true);
	});

	it('moving, rotating and auto-packing keep the bag consistent; tidy means no gaps', () => {
		const run = at('guangzhou');
		run.bagKind = 'satchel'; // 3×2
		run.mount = null;
		run.extraBags = [];
		run.bag = ['rations', 'charm'];
		run.grid = [];
		syncGrid(run);
		expect(run.flags.tidy).toBe(true);
		const i = run.grid!.findIndex((p) => p.id === 'charm');
		expect(moveItem(run, i, 'main', 2, 0)).toBe(true); // leaves a hole between rations and charm
		expect(run.flags.tidy).toBe(false);
		autoPack(run);
		expect(run.flags.tidy).toBe(true);
		run.bag.push('medicine');
		syncGrid(run);
		const m = run.grid!.findIndex((p) => p.id === 'medicine');
		expect(rotateItem(run, m) || rotateItem(run, m)).toBeTypeOf('boolean');
		expect(run.grid!.length).toBe(run.bag.length);
		expect(packsOf(run).length).toBe(1);
	});
});

describe('energy', () => {
	it('limits what you can do in town until you rest', () => {
		const run = at('beijing');
		delete run.flags.energyMax;
		run.difficulty = 'courier';
		run.stats.vigor = 50;
		run.energy = energyMax(run);
		expect(run.energy).toBe(3);
		for (let i = 0; i < 3; i++) expect(spendEnergy(run)).toBe(true);
		expect(spendEnergy(run)).toBe(false);
		expect(openMarket(run)).toBe(false);
		restDay(run);
		expect(run.energy).toBe(3);
		expect(openMarket(run)).toBe(true);
		expect(openMarket(run)).toBe(true); // browsing again is free
		expect(run.energy).toBe(2);
	});
});

describe('traits & endings', () => {
	it('flaws have opposites, and NPCs react to traits', () => {
		const flaws = TRAITS.filter((t) => t.flaw);
		expect(flaws.length).toBeGreaterThanOrEqual(8);
		for (const f of flaws) if (f.opposite) expect(TRAITS.find((t) => t.id === f.opposite)?.opposite).toBe(f.id);
		const run = at('kyoto');
		run.hero.traits = ['poet', 'brute'];
		expect(rapportOf(run, 'performer').score).toBe(1);
		expect(rapportOf(run, 'scholar').score).toBe(0); // likes the poet, dislikes the brute
		expect(rapportOf(run, 'noble').score).toBe(-1);
	});

	it('explains why a journey ended', () => {
		const r = new Rng(9);
		const run = newRun(randomHero(r, 1700), 'why', 1700);
		run.stats.vigor = 4;
		let guard = 0;
		while (run.phase !== 'end' && guard++ < 400) {
			if (run.phase === 'map') depart(run, availableRoutes(run)[0]);
			else choose(run, 'left');
		}
		const c = endingCause(run);
		expect(c).not.toBeNull();
		expect(c!.headline.length).toBeGreaterThan(5);
		expect(c!.tip.length).toBeGreaterThan(5);
		if (c!.stat) expect(c!.series!.length).toBeGreaterThan(0);
	});
});
