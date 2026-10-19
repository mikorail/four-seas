import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { SCHEMA, availableRoutes, choose, consumeSaveToast, depart, exportRun, importRun, newRun, nextAssignment, parseRun, randomHero, save, serializePlain } from '#lib/game/engine';

const store: Record<string, string> = {};
(globalThis as { localStorage?: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] };

describe('save files', () => {
	it('an original (schema 1) save migrates and keeps playing', () => {
		const r = new Rng(1);
		const run = newRun(randomHero(r, 1700), 'old', 1700) as unknown as Record<string, unknown>;
		// strip everything that did not exist in the first release
		for (const k of ['schema', 'difficulty', 'hardship', 'scoreMult', 'quests', 'pilgrimages', 'karma', 'ties', 'standing', 'ventures', 'treasury', 'lineage', 'generation', 'world', 'romance', 'extraBags', 'mind', 'apathy', 'cabinet', 'people', 'langs', 'repertoire', 'grid', 'energy', 'outfit', 'trend', 'statuses', 'factions'])
			delete run[k];
		const hero = run.hero as Record<string, unknown>;
		delete hero.voices;
		delete hero.faith;
		delete hero.ideal;
		const back = parseRun(JSON.stringify(run))!;
		expect(back).not.toBeNull();
		expect(back.schema).toBe(SCHEMA);
		expect(back.cabinet).toEqual({ found: [], slots: [], done: [] });
		expect(back.grid?.length).toBe(back.bag.length);
		let guard = 0;
		while (back.phase !== 'end' && guard++ < 60) {
			if (back.phase === 'map') depart(back, availableRoutes(back)[0]);
			else choose(back, guard % 2 ? 'left' : 'right');
		}
		expect(back.day).toBeGreaterThan(0);
	});

	it('old v4 plain-JSON saves still load alongside compressed saves', () => {
		const run = newRun(randomHero(new Rng(42), 1720), 'v4-plain', 1720);
		const plain = serializePlain(run);
		expect(plain.startsWith('{')).toBe(true);
		const loaded = parseRun(plain)!;
		expect(loaded).not.toBeNull();
		expect(loaded.hero.name).toBe(run.hero.name);
		expect(loaded.schema).toBe(SCHEMA);
	});

	it('a 3000-step pilgrim journey with assignments stays under 1 MB', () => {
		const r = new Rng(77);
		const run = newRun(randomHero(r, 1680), 'pilgrim-3000', 1680, { difficulty: 'pilgrim' });
		for (let step = 0; step < 3000; step++) {
			// Keep stats healthy so the pilgrim journey continues across assignments for 3000 steps
			run.stats.silver = Math.max(35, Math.min(70, run.stats.silver));
			run.stats.vigor = Math.max(35, Math.min(70, run.stats.vigor));
			run.stats.renown = Math.max(35, Math.min(70, run.stats.renown));
			run.stats.fortune = Math.max(35, Math.min(70, run.stats.fortune));
			run.mind = Math.max(45, run.mind ?? 70);
			run.heat = Math.min(20, run.heat);
			if (run.phase === 'end') {
				nextAssignment(run);
			} else if (run.phase === 'map') {
				const routes = availableRoutes(run);
				depart(run, routes[step % routes.length]);
			} else {
				choose(run, step % 2 === 0 ? 'left' : 'right');
			}
		}
		const exported = exportRun(run);
		expect(exported.length).toBeLessThan(1_000_000);
		const restored = parseRun(exported)!;
		expect(restored).not.toBeNull();
		expect(restored.cardsSeen).toBeGreaterThan(500);
	}, 20_000);

	it('QuotaExceededError drops restore points, retries, and records a toast', () => {
		const run = newRun(randomHero(new Rng(12), 1750), 'quota', 1750);
		run.restorePoints = [serializePlain(run), serializePlain(run)];
		run.undo = serializePlain(run);
		let calls = 0;
		const origStorage = (globalThis as { localStorage?: unknown }).localStorage;
		(globalThis as { localStorage?: unknown }).localStorage = {
			getItem: (k: string) => store[k] ?? null,
			setItem: (k: string, v: string) => {
				calls++;
				if (calls === 1) {
					const err = new Error('QuotaExceededError');
					err.name = 'QuotaExceededError';
					throw err;
				}
				store[k] = v;
			},
			removeItem: (k: string) => delete store[k]
		};
		try {
			save(run);
			expect(calls).toBe(2);
			expect(run.restorePoints).toEqual([]);
			expect(run.undo).toBeNull();
			expect(consumeSaveToast()).toContain('Storage space was low');
		} finally {
			(globalThis as { localStorage?: unknown }).localStorage = origStorage;
		}
	});

	it('export → import round-trips, and junk is rejected', () => {
		const run = newRun(randomHero(new Rng(2), 1650), 'exp', 1650);
		run.deadline = Infinity;
		const text = exportRun(run);
		const back = importRun(text)!;
		expect(back.hero.name).toBe(run.hero.name);
		expect(back.deadline).toBe(Infinity);
		expect(importRun('{"hello": "world"}')).toBeNull();
		expect(importRun('not json')).toBeNull();
	});
});

import { repairRun } from '#lib/game/engine';

describe('stuck journeys get untangled', () => {
	it('a town or road with nothing to play, or a broken location, is repaired', () => {
		const run = newRun(randomHero(new Rng(9), 1700), 'stuck', 1700);
		run.phase = 'city';
		run.deck = [];
		expect(repairRun(run)).toContain('empty town');
		expect(run.phase).toBe('map');
		expect(availableRoutes(run).length).toBeGreaterThan(0);

		run.phase = 'travel';
		run.route = { from: run.location, to: availableRoutes(run)[0].to, mode: 'land', days: 3, km: 100, cost: 1, vessel: 'cart' } as never;
		run.deck = [];
		repairRun(run);
		expect(run.phase).toBe('map');
		expect(run.route).toBeNull();

		run.location = 'atlantis';
		repairRun(run);
		expect(run.location).not.toBe('atlantis');

		run.phase = 'end';
		run.ending = null;
		repairRun(run);
		expect(run.phase).toBe('map');
	});

	it('loading a stuck save repairs it', () => {
		const run = newRun(randomHero(new Rng(10), 1700), 'stuck2', 1700);
		run.phase = 'city';
		run.deck = [];
		const back = parseRun(JSON.stringify(run))!;
		expect(back.phase).toBe('map');
	});
});
