// Plays many random journeys doing everything a player can do, checking that the game never breaks.
import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import * as E from '#lib/game/engine';
import * as M from '#lib/game/market';
import { cellsUsed, capacity, autoPack, moveItem, rotateItem } from '#lib/game/bag';
import { STATS } from '#lib/data/traits';
import { ITEMS } from '#lib/data/items';
import { CITY } from '#lib/data/world';
import type { Run } from '#lib/game/types';
import { sceneLine } from '#lib/game/prose';
import { DISTRICTS, citySecurityProfile } from '#lib/data/districts';
import { donRecommendedGarb, getDressRecommendation } from '#lib/game/dress';
import { INVENTIONS_LIST } from '#lib/data/inventions';
import { innerThoughts } from '#lib/game/thoughts';

const store: Record<string, string> = {};
(globalThis as { localStorage?: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] };

function check(run: Run, where: string) {
	const at = `${where} (seed ${run.seed}, day ${run.day}, phase ${run.phase})`;
	expect(['map', 'city', 'travel', 'end'], at).toContain(run.phase);
	if (run.phase === 'city' || run.phase === 'travel') expect(run.deck.length, `empty deck: ${at}`).toBeGreaterThan(0);
	if (run.phase === 'travel') expect(run.route, `no route: ${at}`).toBeTruthy();
	if (run.phase === 'map') expect(E.availableRoutes(run).length, `stranded: ${at}`).toBeGreaterThan(0);
	if (run.phase === 'end') {
		expect(run.ending, at).toBeTruthy();
		expect(E.endingCause(run)?.tip, at).toBeTruthy();
	}
	for (const s of STATS) expect(Number.isFinite(run.stats[s]), `${s} not finite: ${at}`).toBe(true);
	expect(CITY[run.location], at).toBeTruthy();
	expect(CITY[run.destination], at).toBeTruthy();
	for (const id of run.bag) expect(ITEMS[id], `unknown item ${id}: ${at}`).toBeTruthy();
	expect(run.grid?.length ?? 0, `grid out of sync: ${at}`).toBe(run.bag.length);
	expect(cellsUsed(run), at).toBeLessThanOrEqual(capacity(run));
	for (const c of run.deck) {
		expect(c.left?.label && c.right?.label, `card ${c.id} missing a side: ${at}`).toBeTruthy();
		expect(c.text.length, `card ${c.id} has no text`).toBeGreaterThan(0);
		expect(c.text, `card ${c.id} leaks a placeholder`).not.toMatch(/undefined|\{npc\}|\{city\}|NaN|\[object/);
		for (const th of innerThoughts(run, c)) expect(th.text, `thought on ${c.id}`).not.toMatch(/#[a-z_]+#|\$w|undefined|NaN/);
		const scene = sceneLine(run, c);
		expect(scene, `scene for ${c.id}`).not.toMatch(/#[a-z_]+#|undefined|NaN/);
	}
}

function act(run: Run, r: Rng) {
	if (run.phase === 'map') {
		const roll = r.next();
		if (roll < 0.1) {
			const v = r.pick(M.venuesHere(run));
			if (v.id === 'market' || v.id === 'bazaar') {
				if (E.openMarket(run)) {
					const s = M.marketStock(run);
					const pool = [...s.outfits.map((o) => o.id), ...s.curios, ...s.charts, ...s.riddles, ...s.supplies];
					if (pool.length) M.buy(run, r.pick(pool));
					const sellable = run.bag.filter((id) => M.sellValue(run, id) > 0);
					if (sellable.length && r.chance(0.3)) M.sell(run, r.pick(sellable));
				}
			} else E.visitVenue(run, v.id);
			return;
		}
		if (roll < 0.13) return E.restDay(run);
		if (roll < 0.16 && run.bag.length) {
			const i = r.int(0, run.bag.length - 1);
			if (r.chance(0.5)) rotateItem(run, i);
			else moveItem(run, i, 'main', r.int(0, 3), r.int(0, 2));
			if (r.chance(0.3)) autoPack(run);
			return;
		}
		if (roll < 0.18) {
			const map = run.bag.find((id) => id.startsWith('treasure-map-'));
			if (map) M.solveRiddle(run, map, r.pick(M.riddleOf(map)!.options));
			return;
		}
		if (roll < 0.2 && run.bag.some((id) => ITEMS[id]?.use)) return void E.useItem(run, r.pick(run.bag.filter((id) => ITEMS[id]?.use)));
		if (roll < 0.23) return void E.hangout(run);
		if (roll < 0.26) {
			const prof = citySecurityProfile(run.location);
			const dk = r.pick(prof.districts);
			return void E.visitDistrictBuilding(run, dk, r.pick(DISTRICTS[dk].buildings).id);
		}
		if (roll < 0.28 && run.crew.length) return void E.assignCompanionTask(run, r.pick(run.crew).id, r.pick(['idle', 'provision', 'intel', 'scout', 'guard'] as const));
		if (roll < 0.3) {
			const rec = getDressRecommendation(run);
			if (rec.ownedOutfitId) donRecommendedGarb(run, rec.ownedOutfitId);
			return;
		}
		if (roll < 0.31) return void E.sponsorInvention(run, r.pick(INVENTIONS_LIST).id, 'Fuzz Scholar');
		if (roll < 0.33 && run.cabinet?.found.length) return void E.internalize(run, run.cabinet.found[0]);
		const routes = E.availableRoutes(run);
		return E.depart(run, r.chance(0.7) ? routes.sort((a, b) => a.days - b.days)[0] : r.pick(routes));
	}
	if (run.phase === 'city' && r.chance(0.05)) return E.skipCity(run);
	const c = run.deck[0];
	E.choose(run, c.up && r.chance(0.4) ? 'up' : r.chance(0.5) ? 'left' : 'right', r.chance(0.1) ? r.chance(0.5) : undefined);
}

function journey(seed: number, opts: Parameters<typeof E.newRun>[3], steps = 1500) {
	const r = new Rng(seed);
	const year = r.int(1500, 1899);
	let run = E.newRun(E.randomHero(r, year), 'fz' + seed, year, opts);
	check(run, 'start');
	let extra = 0;
	for (let i = 0; i < steps; i++) {
		if (run.phase === 'end') {
			if (run.ending?.won && extra < 2 && run.ending.kind !== 'settled' && run.ending.kind !== 'retired' && run.ending.kind !== 'prince') {
				extra++;
				if (r.chance(0.6)) E.nextAssignment(run);
				else E.continueEndless(run);
				check(run, 'after win');
				continue;
			}
			break;
		}
		act(run, r);
		check(run, 'step ' + i);
		if (i % 97 === 0) {
			E.save(run);
			run = E.load()!;
			expect(run, 'load failed').toBeTruthy();
			check(run, 'after load');
		}
	}
	return run;
}

describe('fuzz: random journeys never break the game', () => {
	for (const difficulty of ['pilgrim', 'courier', 'ronin', 'legend']) {
		it(`${difficulty}: 25 random journeys`, () => {
			for (let s = 0; s < 25; s++) journey(s * 7919 + difficulty.length, { difficulty });
		}, 90000);
	}

	it('hardship starts', () => {
		for (const hardship of ['fever', 'penniless', 'exile', 'cursed', 'shipwrecked', 'deaths-door']) for (let s = 0; s < 6; s++) journey(s * 31 + hardship.length, { hardship });
	}, 60000);

	it('every campaign, with assignments after winning', async () => {
		const { CAMPAIGNS } = await import('#lib/content/index');
		for (const c of CAMPAIGNS) for (let s = 0; s < 6; s++) journey(s * 13 + c.id.length, { campaign: c.id, difficulty: 'pilgrim' }, 2000);
	}, 120000);

	it('dynasty: heirs pick up where the dead left off', () => {
		for (let s = 0; s < 8; s++) {
			const run = journey(s * 977 + 5, { difficulty: 'courier' });
			if (run.phase !== 'end') continue;
			const heirs = E.successors(run);
			expect(heirs.length).toBeGreaterThan(0);
			const h = heirs[0];
			const next = E.newRun(h.hero, run.seed + ':g2', h.year, { legacy: E.legacyOf(run, h) });
			check(next, 'heir start');
		}
	}, 60000);
});

describe('procedural text', () => {
	it('scene lines vary and never leak grammar tokens', () => {
		const seen = new Set<string>();
		for (let s = 0; s < 40; s++) {
			const r = new Rng(s);
			const run = E.newRun(E.randomHero(r, 1700), 'txt' + s, 1700);
			for (const c of run.deck) {
				const line = sceneLine(run, { ...c, id: 'x' + s, npc: { ...c.npc, seed: s * 7 + 1 } });
				expect(line).not.toMatch(/#[a-z_]+#|undefined/);
				seen.add(line);
			}
		}
		expect(seen.size).toBeGreaterThan(30);
	});

	it('assignments are written fresh each time', async () => {
		const { rollAssignment } = await import('#lib/game/assignments');
		const texts = new Set<string>();
		for (let s = 0; s < 30; s++) {
			const a = rollAssignment(new Rng(s), 1700, 'guangzhou', 'nagasaki', 40);
			expect(a.briefing).toContain('40 days');
			expect(a.briefing).not.toMatch(/undefined|#/);
			texts.add(a.item);
		}
		expect(texts.size).toBeGreaterThan(15);
	});
});

describe('weather fits the place', () => {
	it('no frost in the tropics, no monsoon in the far north', async () => {
		const { localWeather, climateOf } = await import('#lib/game/prose');
		expect(climateOf(CITY.mocha)).not.toBe('temperate');
		for (let m = 0; m < 12; m++)
			for (let s = 0; s < 10; s++) {
				const r = new Rng(m * 100 + s);
				for (const id of ['mocha', 'malacca', 'calicut', 'manila']) expect(localWeather(r, CITY[id], m).line, id).not.toMatch(/snow|frost|ice/);
				if (CITY.yakutsk) expect(localWeather(r, CITY.yakutsk, m).line).not.toMatch(/monsoon|palm/);
			}
	});
});
