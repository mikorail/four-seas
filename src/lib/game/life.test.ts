import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { availableRoutes, canUndo, checkGoal, choose, depart, keepRestorePoint, newRun, randomHero, rememberForUndo, rewindTo, undoLast } from '#lib/game/engine';
import { makeCtx } from '#lib/game/cards/index';
import { CONTRABAND_T } from '#lib/game/cards/contraband';
import { ROADSIDE_T } from '#lib/game/cards/roadside';
import { COMPANION_T } from '#lib/game/cards/companions';
import { LIFE_T } from '#lib/game/cards/life';
import { SKILLS, START_SKILLS, levelOf, xpFor } from '#lib/data/skills';
import { PROFESSIONS } from '#lib/data/traits';
import { GOAL } from '#lib/data/goals';
import { buyHome, checkTitles, collect, lettersDue, sendLetter, stash } from '#lib/game/life';
import { perksOf, skillLevel } from '#lib/game/mods';
import type { Run } from '#lib/game/types';

const fresh = (i = 1, prof?: string): Run => {
	const h = randomHero(new Rng(i), 1700);
	if (prof) h.profession = prof;
	const run = newRun(h, 'life' + i, 1700);
	run.cardsSeen = 5;
	return run;
};
const clean = (s: string) => expect(s).not.toMatch(/#[a-z_]+#|\{npc\}|\{city\}|undefined|NaN/);

describe('life skills & callings', () => {
	it('every calling has starting skills and the run starts with them', () => {
		for (const p of PROFESSIONS) expect(Object.keys(START_SKILLS[p.id] ?? {}).length, p.id).toBeGreaterThan(0);
		const run = fresh(1, 'thief');
		expect(skillLevel(run, 'thievery')).toBe(3);
		expect(levelOf(xpFor(3))).toBe(3);
	});

	it('choices train the skills they use, and skills add perks', () => {
		const run = fresh(2, 'scholar');
		const before = run.skills?.martial ?? 0;
		run.phase = 'city';
		run.deck = [{ id: 't', npc: { name: 'A', title: 'B', culture: 'han', gender: 'm', role: 'soldier', seed: 1 }, text: 'x', left: { label: 'fight', fx: {}, tags: ['fight'] }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.skills!.martial).toBeGreaterThan(before);
		const perks = perksOf(run).length;
		run.skills!.cooking = xpFor(5);
		expect(perksOf(run).length).toBe(perks + 1);
		expect(SKILLS.length).toBe(17);
	});
});

describe('life goal', () => {
	it('fulfilling it rewards you once', () => {
		const run = fresh(3);
		run.goal = { id: 'legends' };
		run.legends = ['a', 'b', 'c', 'd', 'e'];
		const notes: string[] = [];
		checkGoal(run, notes);
		expect(run.goal.done).toBe(run.day);
		expect(notes.join(' ')).toMatch(/Life goal fulfilled/);
		checkGoal(run, notes);
		expect(notes.length).toBe(1);
		expect(GOAL.legends.progress(run)).toEqual([5, 5]);
	});
});

describe('undo & rewind', () => {
	it('one undo per city stay; rewind returns to an earlier arrival', () => {
		const run = fresh(4);
		run.phase = 'city';
		run.deck = [{ id: 't', npc: { name: 'A', title: 'B', culture: 'han', gender: 'm', role: 'merchant', seed: 1 }, text: 'x', left: { label: 'pay', fx: { silver: -20 } }, right: { label: 'no', fx: {} } }];
		const silver = run.stats.silver;
		rememberForUndo(run);
		choose(run, 'left');
		expect(run.stats.silver).toBeLessThan(silver);
		expect(canUndo(run)).toBe(true);
		const back = undoLast(run)!;
		expect(back.stats.silver).toBe(silver);
		expect(canUndo({ ...back, undo: 'x' } as Run)).toBe(false); // already used this stay
		keepRestorePoint(back);
		back.day += 30;
		const r2 = rewindTo(back, 0)!;
		expect(r2.day).toBe(back.day - 30);
	});
});

describe('letters, home, titles, collections', () => {
	it('letters come back after the road there and back', () => {
		const run = fresh(5);
		const l = sendLetter(run, { name: 'Wei', city: 'nagasaki', kind: 'friend' }, '')!;
		expect(l.arrives).toBeGreaterThan(run.day);
		expect(lettersDue(run).length).toBe(0);
		run.day = l.arrives;
		expect(lettersDue(run).length).toBe(1);
		const card = LIFE_T.find((t) => t.id === 'letter-reply')!.make(makeCtx(run, new Rng(1), 'city', null, null));
		clean(card.text);
		run.deck = [card];
		run.phase = 'city';
		choose(run, 'left');
		expect(lettersDue(run).length).toBe(0);
	});

	it('a home has a stash; titles and collections are earned', () => {
		const run = fresh(6);
		run.stats.silver = 80;
		expect(buyHome(run)).toBe(true);
		const item = run.bag[0];
		if (item) {
			expect(stash(run, item, true)).toBe(true);
			expect(run.home!.stash).toContain(item);
		}
		run.karma = 70;
		const notes: string[] = [];
		checkTitles(run, notes);
		expect(run.titles).toContain('Heart of Gold');
		for (const c of ['han', 'japanese', 'korean', 'viet', 'malay', 'indian', 'persian', 'ottoman']) collect(run, 'dishes', c, notes);
		expect(notes.join(' ')).toMatch(/Collection complete/);
	});
});

describe('new cards', () => {
	it('contraband, roadside, companion and life cards are well-formed', () => {
		for (let s = 0; s < 20; s++) {
			const run = fresh(100 + s, s % 2 ? 'thief' : 'cook');
			run.bag.push('war-plans', 'gunpowder');
			run.crew = [{ id: 'c1', npc: { name: 'Bo Lin', title: 'Guard', culture: 'han', gender: 'm', role: 'soldier', seed: 3 }, role: 'bodyguard', wage: 2, loyalty: 60, joinedDay: 0 }];
			const c = makeCtx(run, new Rng(s), 'city', null, null);
			for (const t of [...CONTRABAND_T, ...ROADSIDE_T, ...COMPANION_T, ...LIFE_T]) {
				const w = typeof t.weight === 'function' ? t.weight(c) : (t.weight ?? 1);
				if (!w) continue;
				const card = t.make(c);
				clean(card.text);
				expect(card.left.label && card.right.label).toBeTruthy();
			}
		}
	});

	it('a full journey still plays end to end', () => {
		const run = fresh(7, 'bard');
		const r = new Rng(7);
		let g = 0;
		while (run.phase !== 'end' && g++ < 2000) {
			if (run.phase === 'map') depart(run, r.pick(availableRoutes(run)));
			else choose(run, run.deck[0].up && r.chance(0.4) ? 'up' : r.chance(0.5) ? 'left' : 'right');
		}
		expect(run.phase).toBe('end');
	});
});
