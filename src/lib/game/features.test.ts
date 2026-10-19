import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { availableRoutes, choose, depart, internalize, newRun, randomHero } from '#lib/game/engine';
import { buildDeck, makeCtx } from '#lib/game/cards/index';
import { RARE_T } from '#lib/game/cards/rare';
import { WAYFARER_T } from '#lib/game/cards/wayfarers';
import { DISASTER_T } from '#lib/game/cards/disasters';
import { innerThoughts, voicesOf } from '#lib/game/thoughts';
import { VOICES } from '#lib/data/voices';
import { CABINET, THOUGHT } from '#lib/data/cabinet';
import { disasterAt, startDisaster } from '#lib/game/events';
import { travelMult } from '#lib/game/mods';
import { SECRETS } from '#lib/data/world';
import type { Card, Run } from '#lib/game/types';

const fresh = (i = 1, year = 1700): Run => {
	const run = newRun(randomHero(new Rng(i), year), 'feat' + i, year);
	run.cardsSeen = 5; // past the quiet first cards
	return run;
};
const clean = (s: string) => expect(s).not.toMatch(/#[a-z_]+#|\$w|undefined|NaN|\[object/);

describe('voices & relevance', () => {
	it('twenty voices, every one with a level', () => {
		expect(VOICES.length).toBe(20);
		const lv = voicesOf(fresh(1));
		for (const v of VOICES) expect(lv[v.id]).toBeGreaterThanOrEqual(1);
	});

	it('voices react to the words on the card and to people you have met', () => {
		const run = fresh(2);
		const base: Card = { id: 't', npc: { name: 'Wei Lan', title: 'Clerk', culture: 'han', gender: 'f', role: 'official', seed: 1 }, text: 'She hands you a sealed **letter** for the governor.', left: { label: 'Take it', fx: {} }, right: { label: 'Refuse', fx: {} } };
		let onTopic = 0;
		for (let s = 1; s <= 60; s++) for (const t of innerThoughts(run, { ...base, npc: { ...base.npc, seed: s } })) {
			clean(t.text);
			if (/letter|governor/i.test(t.text)) onTopic++;
		}
		expect(onTopic).toBeGreaterThan(15);
		run.ties.push({ id: 'x', npc: base.npc, kind: 'favor', deed: 'carried her sick mother to a healer', city: run.location, day: 0 });
		const remembered = Array.from({ length: 40 }, (_, s) => innerThoughts(run, { ...base, npc: { ...base.npc, seed: s + 100 } })).flat().filter((t) => t.text.includes('carried her sick mother'));
		expect(remembered.length).toBeGreaterThan(3);
	});
});

describe('thought cabinet', () => {
	it('thoughts are discovered by what you do, internalized over travel, and change you', () => {
		const run = fresh(3);
		run.visited = Array.from(new Set([...run.visited, ...Object.keys((globalThis as never) ?? {}).slice(0, 0)]));
		run.stats.silver = 85;
		run.phase = 'city';
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'x', left: { label: 'ok', fx: {} }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.cabinet!.found).toContain('ledger-heart');
		expect(internalize(run, 'ledger-heart')).toBe(true);
		run.cabinet!.slots[0].left = 1;
		run.phase = 'map';
		const r = new Rng(9);
		let guard = 0;
		while (!run.cabinet!.done.includes('ledger-heart') && guard++ < 200 && (run.phase as string) !== 'end') {
			if (run.phase === 'map') depart(run, availableRoutes(run)[0]);
			else choose(run, r.chance(0.5) ? 'left' : 'right');
		}
		expect(run.cabinet!.done).toContain('ledger-heart');
		expect(voicesOf(run).reason).toBeGreaterThanOrEqual(3);
	});

	it('every thought is well-formed', () => {
		for (const t of CABINET) {
			expect(t.days).toBeGreaterThan(0);
			expect(t.doneText.length).toBeGreaterThan(3);
			expect(THOUGHT[t.id]).toBe(t);
		}
		const run = fresh(4);
		run.cabinet = { found: [], slots: [], done: ['ten-thousand-li'] };
		const plain = fresh(4);
		expect(travelMult(run, 'land')).toBeLessThan(travelMult(plain, 'land'));
	});
});

describe('catastrophes', () => {
	it('strike a city and its neighbours, slow the roads and bring their own cards', () => {
		let found = 0;
		for (let s = 0; s < 40; s++) {
			const run = fresh(10 + s);
			run.world = [];
			const news = startDisaster(run, new Rng(s), s % 12);
			if (!news) continue;
			found++;
			clean(news);
			const e = run.world.find((w) => w.kind === 'disaster')!;
			expect(e.cities[0]).toBe(e.data?.epicenter);
			expect(disasterAt(run, e.cities[0])?.severe).toBe(true);
			run.location = e.cities[0];
			run.phase = 'city';
			const c = makeCtx(run, new Rng(s), 'city', null, null);
			const t = DISASTER_T.find((x) => x.id === 'dis-aftermath')!;
			expect(typeof t.weight === 'function' && t.weight(c)).toBeGreaterThan(0);
			const card = t.make(c);
			clean(card.text);
			const rev = DISASTER_T.find((x) => x.id === 'dis-revealed')!.make(c);
			clean(rev.text);
		}
		expect(found).toBeGreaterThan(20);
	});
});

describe('hidden paths', () => {
	it('two hints about the same path reveal it', () => {
		const run = fresh(5);
		const id = SECRETS[0].id;
		run.phase = 'city';
		for (let i = 0; i < 2; i++) {
			run.deck = [{ id: 't', npc: run.deck[0]?.npc ?? { name: 'A', title: 'B', culture: 'han', gender: 'm', role: 'elder', seed: 1 }, text: 'x', left: { label: 'listen', fx: {}, bump: { ['hint:' + id]: 1 } }, right: { label: 'no', fx: {} } }];
			run.phase = 'city';
			choose(run, 'left');
		}
		expect(run.flags['secret:' + id]).toBe(true);
	});
});

describe('rare & procedural encounters', () => {
	it('at most one rare event per deck', () => {
		for (let s = 0; s < 120; s++) {
			const run = fresh(200 + s);
			const deck = buildDeck(run, new Rng(s), s % 2 ? 'city' : 'travel', 6, null, null);
			expect(deck.filter((c) => RARE_T.some((t) => t.id === c.id)).length).toBeLessThanOrEqual(1);
		}
	}, 20_000);

	it('historical figures appear only in their own time and place', () => {
		const run = fresh(6, 1605);
		run.location = 'beijing';
		const ricci = RARE_T.find((t) => t.id === 'rare-ricci')!;
		const w = (r: Run) => (typeof ricci.weight === 'function' ? ricci.weight(makeCtx(r, new Rng(1), 'city', null, null)) : 0);
		expect(w(run)).toBeGreaterThan(0);
		const late = fresh(6, 1800);
		late.location = 'beijing';
		expect(w(late)).toBe(0);
		for (const t of RARE_T) {
			const card = t.make(makeCtx(run, new Rng(3), t.where === 'travel' ? 'travel' : 'city', null, null));
			clean(card.text);
		}
	});

	it('wayfarers are endlessly varied and never leak grammar', () => {
		const texts = new Set<string>();
		for (let s = 0; s < 200; s++) {
			const run = fresh(300 + (s % 20));
			const card = WAYFARER_T[0].make(makeCtx(run, new Rng(s), 'city', null, null));
			clean(card.text);
			clean(card.left.label + (card.left.text ?? '') + (card.left.gamble?.win.text ?? '') + (card.left.gamble?.lose.text ?? ''));
			clean(card.right.label + (card.right.text ?? ''));
			texts.add(card.text);
		}
		expect(texts.size).toBeGreaterThan(150);
	});
});

import { disasterCloses, startDeath, deathAt } from '#lib/game/events';
import { venuesHere } from '#lib/game/market';
import { visitVenue } from '#lib/game/engine';
import { DEATH_T } from '#lib/game/cards/disasters';
import { VENUE_CARD } from '#lib/game/cards/venues';

describe('disasters change the town', () => {
	it('cut roads at the epicenter but never strand you', () => {
		const run = fresh(40);
		run.location = 'kyoto';
		run.phase = 'map';
		run.world = [{ id: 'q', kind: 'disaster', label: 'The Great Earthquake', start: 0, end: 999, cities: ['kyoto'], data: { disaster: 'earthquake', epicenter: 'kyoto' } }];
		const routes = availableRoutes(run);
		expect(routes.length).toBeGreaterThan(0);
		const land = routes.filter((r) => r.mode === 'land');
		for (const r of land) expect(disasterCloses(run, r.from, r.to, r.mode)).toBeTruthy();
		if (routes.some((r) => r.mode !== 'land')) expect(land.length).toBe(0); // only the sea/river roads stay open
	});

	it('a crushed inn gives a much worse night; a fallen bridge cannot be visited', () => {
		const run = fresh(41);
		run.location = 'kyoto';
		run.phase = 'map';
		run.flags.energyMax = 'unlimited';
		const normal = VENUE_CARD.inn!(makeCtx(run, new Rng(1), 'city', null, null)).left.fx.vigor!;
		run.world = [{ id: 'q', kind: 'disaster', label: 'The Great Earthquake', start: 0, end: 999, cities: ['kyoto'], data: { disaster: 'earthquake', epicenter: 'kyoto' } }];
		const inn = venuesHere(run).find((v) => v.id === 'inn')!;
		expect(inn.damaged).toBeTruthy();
		const ruined = VENUE_CARD.inn!(makeCtx(run, new Rng(1), 'city', null, null)).left;
		expect(ruined.fx.vigor!).toBeLessThan(normal);
		const bridge = venuesHere(run).find((v) => v.id === 'bridge');
		if (bridge) {
			expect(bridge.closed).toBe(true);
			expect(visitVenue(run, 'bridge')).toBe(false);
		}
	});

	it('notable figures die — mourning, successions and unloved deaths all have cards', () => {
		let kinds = new Set<string>();
		for (let s = 0; s < 60; s++) {
			const run = fresh(500 + s);
			run.world = [];
			const msg = startDeath(run, new Rng(s), 'beijing');
			expect(msg).toBeTruthy();
			clean(msg!);
			const d = deathAt(run, 'beijing')!;
			run.location = 'beijing';
			const c = makeCtx(run, new Rng(s), 'city', null, null);
			for (const t of DEATH_T) {
				const w = typeof t.weight === 'function' ? t.weight(c) : 0;
				if (w > 0) {
					kinds.add(t.id);
					const card = t.make(c);
					clean(card.text);
				}
			}
			expect(d.data?.figure).toBeTruthy();
		}
		expect(kinds.size).toBe(3);
	});
});

import { turmoilAt, turmoilRoad } from '#lib/game/turmoil';
import { TURMOIL_T } from '#lib/game/cards/turmoil';

describe('political turmoil', () => {
	it('uprisings slow and sometimes cut roads, and spawn messages, bounties and treasure hunts', () => {
		const run = fresh(70, 1897);
		run.location = 'manila';
		run.phase = 'map';
		expect(turmoilAt(run, 'manila')?.kind).toBe('uprising');
		const routes = availableRoutes(run);
		expect(routes.length).toBeGreaterThan(0);
		expect(routes.some((r) => r.warnings.some((w) => w.startsWith('⚑')))).toBe(true);
		let held = 0;
		for (let m = 0; m < 24; m++) {
			run.day = m * 30;
			for (const r of ['cebu', 'malacca', 'macau']) if (turmoilRoad(run, 'manila', r, 'land')?.closed) held++;
		}
		expect(held).toBeGreaterThan(0);
		const kinds = new Set<string>();
		const t = TURMOIL_T.find((x) => x.id === 'turmoil-quest')!;
		for (let s = 0; s < 40; s++) {
			run.quests = [];
			const c = makeCtx(run, new Rng(s), 'city', null, null);
			const card = t.make(c);
			clean(card.text);
			const q = card.left.quest;
			if (q) {
				kinds.add(q.kind);
				expect(q.due).toBeGreaterThan(run.day);
			}
		}
		expect(kinds).toEqual(new Set(['message', 'bounty', 'treasure']));
	});

	it('a royal death becomes a succession crisis on the roads', () => {
		const run = fresh(71, 1700);
		run.world = [];
		run.world.push({ id: 'd', kind: 'death', label: 'Death of the Emperor', start: 0, end: 999, cities: ['beijing'], data: { figure: 'the Emperor', popular: true, royal: true } });
		expect(turmoilAt(run, 'beijing')?.kind).toBe('succession');
	});
});
