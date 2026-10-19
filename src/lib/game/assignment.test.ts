import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { availableRoutes, choose, continueEndless, depart, newRun, nextAssignment, randomHero, save, load } from '#lib/game/engine';
import { shortestDays } from '#lib/data/world';
import type { Run } from '#lib/game/types';

function step(run: Run, r: Rng) {
	if (run.phase === 'map') {
		const routes = availableRoutes(run);
		expect(routes.length, `no routes from ${run.location}`).toBeGreaterThan(0);
		const dist = shortestDays(run.destination, run.year);
		routes.sort((a, b) => (dist[a.to] ?? 1e9) + a.days - ((dist[b.to] ?? 1e9) + b.days));
		depart(run, routes[0]);
	} else if (run.phase === 'city' || run.phase === 'travel') {
		expect(run.deck.length, `empty deck in ${run.phase}`).toBeGreaterThan(0);
		choose(run, r.chance(0.5) ? 'left' : 'right');
	}
}
function playUntilEnd(run: Run, r: Rng, max = 3000) {
	let n = 0;
	while (run.phase !== 'end' && n++ < max) step(run, r);
}
function winOne(seed: number): { run: Run; r: Rng } | null {
	for (let i = 0; i < 40; i++) {
		const r = new Rng(seed * 101 + i);
		const run = newRun(randomHero(r, 1700), `asg${seed}-${i}`, 1700, { difficulty: 'pilgrim' });
		playUntilEnd(run, r);
		if (run.ending?.won && run.delivered) return { run, r };
	}
	return null;
}

describe('after the commission', () => {
	it('next assignment leaves a playable state and can itself be delivered', () => {
		let delivered2 = 0;
		for (let s = 1; s <= 6; s++) {
			const w = winOne(s);
			if (!w) continue;
			const { run, r } = w;
			const oldDest = run.destination;
			nextAssignment(run);
			expect(run.ending).toBeNull();
			expect(run.delivered).toBe(false);
			expect(run.destination).not.toBe(oldDest);
			expect(['map', 'city']).toContain(run.phase);
			if (run.phase === 'city') expect(run.deck.length).toBeGreaterThan(0);
			expect(run.rival?.arrived ?? false).toBe(false);
			expect(Number.isFinite(run.deadline)).toBe(true);
			playUntilEnd(run, r);
			expect(run.phase).toBe('end');
			if (run.delivered && run.ending?.won) {
				delivered2++;
				expect(run.ending.title).not.toBe('Second to Arrive');
			}
		}
		expect(delivered2).toBeGreaterThan(0);
	}, 25_000);

	it('keep wandering continues without re-ending immediately and survives save/load', () => {
		const w = winOne(9)!;
		const { run, r } = w;
		continueEndless(run);
		expect(run.phase).toBe('map');
		for (let i = 0; i < 30 && run.phase !== 'end'; i++) step(run, r);
		expect(run.day).toBeGreaterThan(0);
		const store: Record<string, string> = {};
		(globalThis as { localStorage?: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => (store[k] = v), removeItem: (k: string) => delete store[k] };
		save(run);
		const back = load();
		expect(back).not.toBeNull();
		expect(back!.deadline).toBe(run.deadline);
	});

	it('a won campaign can take a new assignment without ending again at once', async () => {
		const { CAMPAIGNS } = await import('#lib/content/index');
		const c = CAMPAIGNS[0];
		let tried = 0;
		for (let i = 0; i < 40 && tried < 2; i++) {
			const r = new Rng(i * 13 + 5);
			const year = r.int(c.years[0], c.years[1]);
			const run = newRun(randomHero(r, year, { culture: c.culture }), 'cmpasg' + i, year, { campaign: c.id, difficulty: 'pilgrim' });
			playUntilEnd(run, r);
			if (!run.ending?.won) continue;
			tried++;
			nextAssignment(run);
			expect(run.ending).toBeNull();
			step(run, r);
			step(run, r);
			expect(run.ending?.title ?? '').not.toBe(c.title);
			expect(run.flags.end).toBeUndefined();
		}
		expect(tried).toBeGreaterThan(0);
	});
});

import { restDay } from '#lib/game/engine';
import { donRecommendedGarb } from '#lib/game/dress';

describe('regressions', () => {
	it('a Brink-of-Fate crisis reached from the map is shown as a playable card', () => {
		const r = new Rng(3);
		const run = newRun(randomHero(r, 1700), 'brink', 1700);
		run.phase = 'map';
		run.deck = [];
		run.stats.vigor = -30; // whatever brought you here
		restDay(run);
		if ((run.phase as string) !== 'end') {
			expect(run.phase).toBe('city');
			expect(run.deck[0]?.id).toMatch(/^crisis-/);
		}
	});

	it('changing into the recommended dress only earns standing once per city', () => {
		const r = new Rng(4);
		const run = newRun(randomHero(r, 1700), 'garb', 1700);
		const cul = CITY_OF(run);
		const before = run.standing[cul] ?? 0;
		donRecommendedGarb(run, 'local-dress');
		donRecommendedGarb(run, 'local-dress');
		donRecommendedGarb(run, 'local-dress');
		expect((run.standing[cul] ?? 0) - before).toBe(10);
	});
});

import { CITY } from '#lib/data/world';
const CITY_OF = (run: Run) => CITY[run.location].culture;

import { assignCompanionTask } from '#lib/game/engine';

describe('companion errands', () => {
	it('each companion runs one errand per stay — no farming', () => {
		const r = new Rng(5);
		const run = newRun(randomHero(r, 1700), 'crew', 1700);
		run.crew = [{ id: 'g1', npc: { name: 'Bo', title: 'Guard', culture: 'han', gender: 'm', role: 'soldier', seed: 1 }, role: 'bodyguard', wage: 2, loyalty: 50, joinedDay: 0 }];
		run.heat = 60;
		assignCompanionTask(run, 'g1', 'guard');
		assignCompanionTask(run, 'g1', 'guard');
		assignCompanionTask(run, 'g1', 'guard');
		expect(run.heat).toBe(48);
		run.flags.stay = 99; // next stay
		assignCompanionTask(run, 'g1', 'guard');
		expect(run.heat).toBe(36);
	});
});
