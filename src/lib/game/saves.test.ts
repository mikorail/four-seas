import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { SCHEMA, availableRoutes, choose, depart, exportRun, importRun, newRun, parseRun, randomHero } from '#lib/game/engine';

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
