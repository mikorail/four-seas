import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { choose, newRun, randomHero, shiftMind, endingCause } from '#lib/game/engine';
import { innerThoughts, mindState, voicesOf } from '#lib/game/thoughts';
import { VOICES, baseVoices } from '#lib/data/voices';
import { gambleBonus } from '#lib/game/mods';
import type { Card, Run } from '#lib/game/types';

const fresh = (i = 1, traits?: string[]): Run => {
	const r = new Rng(i);
	const h = randomHero(r, 1700);
	if (traits) h.traits = traits;
	const run = newRun({ ...h, voices: undefined }, 'mind' + i, 1700);
	run.cardsSeen = 5; // past the quiet first cards
	return run;
};
const card = (run: Run, extra: Partial<Card> = {}): Card => ({
	id: 't',
	npc: { name: 'Lao Wu', title: 'Bandit', culture: 'han', gender: 'm', role: 'bandit', seed: 4242 },
	text: 'A test.',
	left: { label: 'Fight', fx: {}, tags: ['fight'], gamble: { p: 0.3, win: { fx: { renown: 10 } }, lose: { fx: { vigor: -20 } } } },
	right: { label: 'Pay', fx: { silver: -5 }, tags: ['bribe'] },
	...extra
});

describe('inner voices', () => {
	it('callings and traits lean the voices, within 1..6', () => {
		const v = baseVoices('scholar', ['bookworm']);
		expect(v.annals).toBe(5);
		for (const x of VOICES) expect(v[x.id]).toBeGreaterThanOrEqual(1);
		const run = fresh(2);
		expect(run.hero.voices).toBeTruthy();
		expect(voicesOf(run)).toEqual(run.hero.voices);
	});

	it('voices speak on cards, deterministically, without template leaks', () => {
		const run = fresh(3);
		const c = card(run);
		const a = innerThoughts(run, c);
		expect(innerThoughts(run, c)).toEqual(a);
		let total = 0;
		for (let s = 0; s < 60; s++) {
			const t = innerThoughts(run, { ...c, npc: { ...c.npc, seed: s + 1 } });
			total += t.length;
			for (const th of t) expect(th.text).not.toMatch(/#[a-z]+#|undefined|NaN/);
		}
		expect(total).toBeGreaterThan(40);
	});

	it('a steady mind never lies; a frayed one sometimes does', () => {
		const run = fresh(4);
		const c = card(run);
		for (let s = 0; s < 40; s++) for (const th of innerThoughts(run, { ...c, npc: { ...c.npc, seed: s } })) expect(th.ok).toBe(true);
		run.mind = 10;
		let lies = 0;
		for (let s = 0; s < 80; s++) lies += innerThoughts(run, { ...c, npc: { ...c.npc, seed: s } }).filter((t) => !t.ok).length;
		expect(lies).toBeGreaterThan(0);
	});

	it('voice levels tilt the odds on the choices they care about', () => {
		const run = fresh(5);
		run.hero.voices = { ...run.hero.voices!, instinct: 6 };
		const hi = gambleBonus(run, ['fight']);
		run.hero.voices = { ...run.hero.voices!, instinct: 1 };
		expect(hi).toBeGreaterThan(gambleBonus(run, ['fight']));
	});
});

describe('mind', () => {
	it('failed gambles wear the mind down; reaching 0 ends the journey with a reason', () => {
		const run = fresh(6);
		run.phase = 'city';
		const before = run.mind!;
		run.deck = [card(run, { left: { label: 'Fight', fx: {}, tags: ['fight'], gamble: { p: 0.3, win: { fx: {} }, lose: { fx: { vigor: -1 } } } } })];
		choose(run, 'left', false);
		expect(run.mind!).toBeLessThan(before);
		run.mind = 3;
		run.phase = 'city';
		run.deck = [card(run)];
		choose(run, 'left', false);
		expect(run.phase).toBe('end');
		expect(run.ending?.kind).toBe('mind-low');
		expect(endingCause(run)?.tip).toMatch(/Mind/);
	});

	it('a Stone Heart turns despair into apathy and never breaks', () => {
		const run = fresh(7, ['stone-heart', 'poet']);
		run.mind = 40;
		for (let i = 0; i < 10; i++) shiftMind(run, -10);
		expect(run.mind).toBe(40);
		expect(run.apathy).toBeGreaterThanOrEqual(40);
		expect(mindState(run).id).toBe('numb');
		shiftMind(run, 20);
		expect(run.apathy).toBeLessThan(100);
	});

	it('high Will softens the blows', () => {
		const a = fresh(8);
		const b = fresh(8);
		a.hero.voices = { ...a.hero.voices!, will: 6 };
		b.hero.voices = { ...b.hero.voices!, will: 1 };
		a.mind = b.mind = 70;
		shiftMind(a, -20);
		shiftMind(b, -20);
		expect(a.mind!).toBeGreaterThan(b.mind!);
	});
});

import { capOf, XP_PER_STEP } from '#lib/game/mods';
import { applyFx } from '#lib/game/engine';

describe('stat caps', () => {
	it('traits and experience raise how much of a stat you can hold', () => {
		const run = fresh(30, ['veteran', 'frugal']);
		expect(capOf(run, 'vigor')).toBeGreaterThanOrEqual(110);
		expect(capOf(run, 'silver')).toBeGreaterThanOrEqual(110);
		const before = capOf(run, 'fortune');
		run.xp = { fortune: XP_PER_STEP * 2 };
		expect(capOf(run, 'fortune')).toBe(before + 10);
		run.xp = { fortune: 99999 };
		expect(capOf(run, 'fortune')).toBe(before + 30); // experience tops out
	});

	it('stats can grow past 100 up to the cap; the cap (not 100) is the deadly edge', () => {
		const run = fresh(31, ['veteran']);
		run.stats.vigor = 98;
		applyFx(run, { vigor: 30 }, []);
		expect(run.stats.vigor).toBeGreaterThan(98);
		expect(run.stats.vigor).toBeLessThanOrEqual(capOf(run, 'vigor'));
		expect(run.phase).not.toBe('end');
	});
});
