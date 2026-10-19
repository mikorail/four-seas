import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { choose, meetPerson, newRun, randomHero } from '#lib/game/engine';
import { compatibility, hangoutCard, peopleAt } from '#lib/game/people';
import { PERK } from '#lib/data/traits';
import type { Run } from '#lib/game/types';

const fresh = (i = 1): Run => {
	const run = newRun(randomHero(new Rng(i), 1700), 'ppl' + i, 1700);
	run.location = 'kyoto';
	run.phase = 'map';
	run.deck = [];
	run.flags.energyMax = 'unlimited';
	return run;
};

describe('people at venues', () => {
	it('each venue has a stable cast with real traits, tastes and a match score', () => {
		const run = fresh(1);
		const a = peopleAt(run, 'inn');
		expect(a.length).toBeGreaterThanOrEqual(3);
		expect(peopleAt(run, 'inn').map((p) => p.id)).toEqual(a.map((p) => p.id));
		for (const p of a) {
			for (const t of p.traits) expect(PERK[t], t).toBeTruthy();
			expect(p.likes.length).toBeGreaterThan(0);
			expect(p.bio).not.toMatch(/#[a-z_]+#|undefined/);
			const c = compatibility(run, p);
			expect(c.score).toBeGreaterThanOrEqual(3);
			expect(c.score).toBeLessThanOrEqual(97);
		}
		// different venues, different people
		expect(peopleAt(run, 'temple').map((p) => p.id)).not.toEqual(a.map((p) => p.id));
	});

	it('swiping right starts a hangout; the person is remembered and grows closer', () => {
		const run = fresh(2);
		const p = peopleAt(run, 'inn')[0];
		expect(meetPerson(run, 'inn', p)).toBe(true);
		expect(run.deck[0].id).toBe('people-hangout');
		expect(meetPerson(run, 'inn', p)).toBe(false); // the venue is used for this stay
		choose(run, 'right'); // "ask about their life" — always works
		const met = run.people!.find((x) => x.id === p.id)!;
		expect(met).toBeTruthy();
		expect(met.bond).toBeGreaterThan(0);
		// next stay, they are there again, as someone you know
		run.flags.stay = 50;
		run.phase = 'map';
		run.deck = [];
		const again = peopleAt(run, 'inn').find((x) => x.id === p.id);
		expect(again?.known).toBeTruthy();
		for (let i = 0; i < 6; i++) {
			run.deck = [hangoutCard(run, { ...again!, known: run.people!.find((x) => x.id === p.id) }, 'inn')];
			run.phase = 'city';
			choose(run, 'left', true);
		}
		expect(['friend', 'confidant', 'sweetheart']).toContain(run.people!.find((x) => x.id === p.id)!.stage);
	});

	it('people looking for work can join your retinue', () => {
		for (let s = 0; s < 40; s++) {
			const run = fresh(100 + s);
			run.crew = [];
			const worker = (['inn', 'harbor', 'market', 'square'] as const).flatMap((v) => peopleAt(run, v)).find((p) => p.looking === 'work' && !p.known);
			if (!worker) continue;
			const card = hangoutCard(run, worker, 'inn');
			expect(card.up?.crewAdd).toBeTruthy();
			run.deck = [card];
			run.phase = 'city';
			choose(run, 'up');
			expect(run.crew.length).toBe(1);
			return;
		}
		throw new Error('no one looking for work in 40 cities');
	});
});
