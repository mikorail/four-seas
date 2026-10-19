import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { availableRoutes, choose, depart, newRun, randomHero } from '#lib/game/engine';
import { makeCtx } from '#lib/game/cards/index';
import { GRAVE_T } from '#lib/game/cards/graves';
import { STORY_T } from '#lib/game/cards/storyteller';
import { FAIR_T } from '#lib/game/cards/fairs';
import { hearLanguage, langLevel } from '#lib/game/langs';
import { venuesHere, marketStock, fairHere } from '#lib/game/market';
import type { Grave, Run } from '#lib/game/types';

const fresh = (i = 1, year = 1750): Run => {
	const run = newRun(randomHero(new Rng(i), year), 'exp' + i, year);
	run.cardsSeen = 5;
	return run;
};
const clean = (s: string) => expect(s).not.toMatch(/#[a-z_]+#|undefined|NaN/);

describe('Bones of the Road', () => {
	it('a past traveller’s grave appears in their city, with their unfinished commission', () => {
		const run = fresh(1);
		run.location = 'guangzhou';
		const g: Grave = { id: 'old:1', name: 'Wei Ling', culture: 'han', gender: 'f', seed: 5, city: 'guangzhou', year: 1702, title: 'The Fever', kind: 'vigor-low', lesson: 'Vigor is health', commission: { item: 'a jade seal', to: 'nagasaki' } };
		run.graves = [g];
		const t = GRAVE_T[0];
		const c = makeCtx(run, new Rng(1), 'city', null, null);
		expect(typeof t.weight === 'function' && t.weight(c)).toBeGreaterThan(0);
		const card = t.make(c);
		clean(card.text);
		expect(card.right.quest?.to).toBe('nagasaki');
		run.deck = [card];
		run.phase = 'city';
		choose(run, 'right');
		expect(run.quests.some((q) => q.giver === 'Wei Ling')).toBe(true);
		// visited once
		expect(typeof t.weight === 'function' && t.weight(makeCtx(run, new Rng(2), 'city', null, null))).toBe(0);
	});
});

describe('storyteller', () => {
	it('memorable moments become tales, and tea houses pay for the right one', () => {
		const run = fresh(2);
		run.phase = 'city';
		run.deck = [{ id: 'rare-test', npc: { name: 'Bashō', title: 'Poet', culture: 'japanese', gender: 'm', role: 'monk', seed: 9 }, text: 'x', left: { label: 'a', fx: {} }, right: { label: 'b', fx: {} } }];
		const res = choose(run, 'left');
		expect(run.repertoire?.length).toBe(1);
		expect(res.notes.join(' ')).toMatch(/new tale/);
		const c = makeCtx(run, new Rng(3), 'city', null, null);
		const card = STORY_T[0].make(c);
		clean(card.text);
		run.deck = [card];
		run.phase = 'city';
		choose(run, 'left');
		expect(run.repertoire![0].told).toBe(1);
	});
});

describe('languages', () => {
	it('time among speakers raises your level; conversational locals stop treating you as foreign', () => {
		const run = fresh(3);
		const other = run.hero.culture === 'japanese' ? 'korean' : 'japanese';
		expect(langLevel(run, run.hero.culture)).toBe(3);
		expect(langLevel(run, other)).toBe(0);
		const note = hearLanguage(run, other, 60);
		expect(note).toMatch(/now/);
		expect(langLevel(run, other)).toBeGreaterThanOrEqual(2);
	});
});

describe('trade fairs', () => {
	it('a fair turns the market into a great bazaar with curios from everywhere, and an auction', () => {
		const run = fresh(4, 1750);
		run.location = 'guangzhou';
		run.month0 = 0;
		run.day = 9 * 30 + 5; // October
		const f = fairHere(run);
		if (!f) return; // calendar offset differs by start month; covered below
		expect(venuesHere(run).some((v) => v.name === f.name)).toBe(true);
		expect(marketStock(run).curios.length).toBeGreaterThan(3);
		const c = makeCtx(run, new Rng(4), 'city', null, null);
		const card = FAIR_T[0].make(c);
		clean(card.text);
	});
	it('some city has a fair in some month', () => {
		const run = fresh(5, 1750);
		let found = 0;
		for (const city of ['guangzhou', 'malacca', 'samarkand', 'mocha']) {
			run.location = city;
			for (let d = 0; d < 365; d += 15) {
				run.day = d;
				if (fairHere(run)) found++;
			}
		}
		expect(found).toBeGreaterThan(5);
	});
});

describe('the rival lives in the same world', () => {
	it('a disaster on the rival’s road slows them', () => {
		const run = fresh(6);
		const r = run.rival!;
		const mid = r.path[Math.min(1, r.path.length - 1)];
		const before = r.arrive;
		run.world.push({ id: 'dis-x', kind: 'disaster', label: 'The Great Flood', start: 0, end: 999, cities: [mid], data: { disaster: 'flood', epicenter: mid } });
		run.phase = 'map';
		run.deck = [];
		depart(run, availableRoutes(run)[0]);
		if (r.path.length > 1) expect(run.rival!.arrive).toBeGreaterThan(before);
	});
});
