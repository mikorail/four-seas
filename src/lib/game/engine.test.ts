import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { availableRoutes, choose, depart, newRun, randomHero, useItem } from '#lib/game/engine';
import { TEMPLATES, capacity, makeCtx } from '#lib/game/cards/index';
import { CITY, shortestDays } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import { STATS } from '#lib/data/traits';
import type { Card, Choice, Run } from '#lib/game/types';

function fresh(i = 1, year?: number): Run {
	const r = new Rng(i * 7919 + 3);
	const y = year ?? r.int(1500, 1900);
	return newRun(randomHero(r, y), 'test' + i, y);
}

function play(run: Run, r: Rng, max = 3000) {
	let steps = 0;
	while (run.phase !== 'end' && steps++ < max) {
		if (run.phase === 'map') {
			const routes = availableRoutes(run);
			const dist = shortestDays(run.destination, run.year);
			routes.sort((a, b) => (dist[a.to] ?? 1e9) + a.days - ((dist[b.to] ?? 1e9) + b.days));
			depart(run, r.chance(0.8) ? routes[0] : r.pick(routes));
		} else {
			const c = run.deck[0];
			choose(run, c.up && r.chance(0.5) ? 'up' : r.chance(0.5) ? 'left' : 'right');
		}
	}
	return steps;
}

const validChoice = (ch: Choice | undefined) => {
	if (!ch) return;
	expect(ch.label.length).toBeGreaterThan(0);
	for (const v of Object.values(ch.fx)) expect(Number.isFinite(v)).toBe(true);
	if (ch.gamble) expect(ch.gamble.p).toBeGreaterThan(0);
	for (const id of [...(ch.itemAdd ?? []), ...(ch.gamble?.win.itemAdd ?? [])]) expect(ITEMS[id], id).toBeDefined();
};

describe('engine', () => {
	it('is deterministic for a seed', () => {
		const a = fresh(7, 1650);
		const b = fresh(7, 1650);
		play(a, new Rng(1));
		play(b, new Rng(1));
		expect(a.day).toBe(b.day);
		expect(a.stats).toEqual(b.stats);
		expect(a.ending?.kind).toBe(b.ending?.kind);
	});

	it('always finishes a run (300 random journeys)', () => {
		for (let i = 0; i < 300; i++) {
			const run = fresh(i);
			const steps = play(run, new Rng(i));
			expect(run.phase, `run ${i} stuck after ${steps}`).toBe('end');
			for (const s of STATS) expect(run.stats[s]).toBeGreaterThanOrEqual(0);
			expect(run.bag.length).toBeLessThanOrEqual(capacity(run));
			expect(run.crew.length).toBeLessThanOrEqual(3);
		}
	}, 30000);

	it('every card template builds valid cards in many contexts', () => {
		let built = 0;
		for (let i = 0; i < 120; i++) {
			const run = fresh(i);
			run.bag = ['good:silk', 'medicine', 'papers', 'gift'];
			run.bagKind = 'trunk';
			run.heat = (i * 13) % 100;
			run.flags.treasure = run.location;
			const r = new Rng(i);
			for (const where of ['city', 'travel'] as const) {
				if (where === 'travel') run.route = availableRoutes(run)[0];
				const ctx = makeCtx(run, r, where, where === 'travel' ? run.route!.mode : null, where === 'travel' ? CITY[run.location] : null);
				for (const t of TEMPLATES) {
					if (t.where !== 'any' && t.where !== where) continue;
					if (t.modes && (!ctx.mode || !t.modes.includes(ctx.mode))) continue;
					if (t.when && !t.when(ctx)) continue;
					const w = typeof t.weight === 'function' ? t.weight(ctx) : (t.weight ?? 1);
					if (w <= 0) continue;
					const card: Card = t.make(ctx);
					built++;
					expect(card.text.length, t.id).toBeGreaterThan(5);
					expect(card.npc.name, t.id).toBeTruthy();
					validChoice(card.left);
					validChoice(card.right);
					if (card.up) {
						validChoice(card.up);
						expect(card.up.why, t.id).toBeTruthy();
					}
				}
				run.route = null;
			}
		}
		expect(built).toBeGreaterThan(2000);
	});
});

describe('systems', () => {
	it('bag capacity: items beyond capacity are left behind', () => {
		const run = fresh(2);
		run.bagKind = 'bundle';
		run.mount = null;
		run.extraBags = [];
		run.grid = [];
		run.bag = ['rations', 'charm', 'gift', 'papers']; // a 2×2 bundle, full
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'test card', left: { label: 'take', fx: {}, itemAdd: ['lockbox'] }, right: { label: 'no', fx: {} } }];
		const res = choose(run, 'left');
		expect(run.bag).toHaveLength(4);
		expect(res.notes.join(' ')).toMatch(/No room/);
	});

	it('mount adds slots and losing it drops overflow', () => {
		const run = fresh(3);
		run.bagKind = 'bundle';
		run.bag = ['rations'];
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'buy camel', left: { label: 'buy', fx: {}, mount: 'camel' }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.mount?.kind).toBe('camel');
		expect(capacity(run)).toBe(4 + 6); // 2×2 bundle + 3×2 camel packs
		run.bag = ['rations', 'charm', 'sword', 'lockbox', 'gift', 'papers'];
		run.phase = 'city';
		run.deck = [{ id: 't', npc: run.deck[0]?.npc ?? run.hero as never, text: 'lose camel', left: { label: 'lose', fx: {}, mount: 'none' }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.mount).toBeNull();
		expect(run.bag.reduce((n, id) => n + (id === 'sword' ? 3 : id === 'lockbox' ? 2 : 1), 0)).toBeLessThanOrEqual(4);
	});

	it('horse makes land journeys shorter', () => {
		const run = fresh(4, 1700);
		run.phase = 'map';
		const land = availableRoutes(run).find((r) => r.mode === 'land');
		if (!land) return;
		run.mount = { kind: 'horse', name: 'Thunder', health: 100 };
		const faster = availableRoutes(run).find((r) => r.to === land.to && r.mode === 'land')!;
		expect(faster.days).toBeLessThanOrEqual(land.days);
	});

	it('relics pull you back from death', () => {
		const run = fresh(5);
		run.bag = ['naga-pearl'];
		run.stats.vigor = 5;
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'ouch', left: { label: 'ouch', fx: { vigor: -30 } }, right: { label: 'no', fx: {} } }];
		const res = choose(run, 'left');
		expect(run.phase).not.toBe('end');
		expect(run.stats.vigor).toBe(30);
		expect(run.bag).not.toContain('naga-pearl');
		expect(res.notes.join(' ')).toMatch(/saved you/);
	});

	it('jail flag ends the run', () => {
		const run = fresh(6);
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'caught', left: { label: 'surrender', fx: {}, setFlag: { end: 'jailed' } }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.ending?.kind).toBe('jailed');
	});

	it('djinn lamp resets every stat to 50', () => {
		const run = fresh(8);
		run.bag = ['djinn-lamp'];
		run.stats = { silver: 5, vigor: 95, renown: 20, fortune: 80 };
		useItem(run, 'djinn-lamp');
		expect(run.stats).toEqual({ silver: 50, vigor: 50, renown: 50, fortune: 50 });
	});

	it('crew wages are paid on departure', () => {
		const run = fresh(9, 1700);
		run.phase = 'map';
		run.stats.silver = 60;
		run.crew = [{ id: 'b', npc: run.deck[0].npc, role: 'bodyguard', wage: 4, loyalty: 50, joinedDay: 0 }];
		const r = availableRoutes(run)[0];
		const before = run.stats.silver;
		depart(run, r);
		expect(run.stats.silver).toBeLessThanOrEqual(before - r.cost - 4 + 1);
		expect(run.crew[0]?.loyalty ?? 52).toBeGreaterThanOrEqual(50);
	});
});

describe('difficulty, faith, quests', () => {
	it('hardship overrides starting stats and empties the bag', () => {
		const r = new Rng(11);
		const run = newRun(randomHero(r, 1700), 'h', 1700, { difficulty: 'legend', hardship: 'deaths-door' });
		expect(run.stats).toEqual({ silver: 12, vigor: 12, renown: 12, fortune: 12 });
		expect(run.bag).toEqual([]);
		expect(run.scoreMult).toBeGreaterThan(3);
	});

	it('pilgrimage difficulty gives a longer deadline than legend', () => {
		const h = randomHero(new Rng(12), 1700);
		const easy = newRun(h, 'd', 1700, { difficulty: 'pilgrim' });
		const hard = newRun(h, 'd', 1700, { difficulty: 'legend' });
		expect(easy.deadline).toBeGreaterThan(hard.deadline);
		expect(easy.bag).toContain('medicine');
	});

	it('acting on your ideal steadies vigor; betraying it costs', () => {
		const run = fresh(13);
		const npc = { name: 'n', title: 't', culture: 'han' as const, gender: 'm' as const, role: 'official' as const, seed: 1 };
		run.hero.ideal = 'honor';
		run.stats.vigor = 50;
		run.deck = [{ id: 't', npc, text: 'x', left: { label: 'fight', fx: {}, tags: ['fight'] }, right: { label: 'bribe', fx: {}, tags: ['bribe'] } }];
		const res = choose(run, 'left');
		expect(run.stats.vigor).toBe(52);
		expect(res.notes.join(' ')).toMatch(/True to your ideal/);
		run.phase = 'city';
		run.deck = [{ id: 't', npc, text: 'x', left: { label: 'fight', fx: {}, tags: ['fight'] }, right: { label: 'bribe', fx: {}, tags: ['bribe'] } }];
		choose(run, 'right');
		expect(run.stats.vigor).toBe(50);
	});

	it('kindness raises merit, not fortune, and is remembered', () => {
		const run = fresh(16);
		const npc = { name: 'Old Wen', title: 'Elder', culture: 'han' as const, gender: 'm' as const, role: 'elder' as const, seed: 42 };
		run.stats.fortune = 50;
		run.deck = [{ id: 't', npc, text: 'x', left: { label: 'help', fx: { fortune: 12 }, tags: ['mercy'] }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.stats.fortune).toBe(50);
		expect(run.karma).toBe(5);
		expect(run.ties[0]).toMatchObject({ kind: 'favor', npc: { name: 'Old Wen' } });
	});

	it('a remembered favor comes back as a card', () => {
		const run = fresh(17, 1700);
		run.ties = [{ id: 'tie-1', npc: { name: 'Old Wen', title: 'Elder', culture: 'han', gender: 'm', role: 'elder', seed: 42 }, kind: 'favor', deed: 'nursed them through a fever', city: 'zzz', day: 0 }];
		run.day = 30;
		const t = TEMPLATES.find((x) => x.id === 'tie-favor')!;
		const ctx = makeCtx(run, new Rng(3), 'city', null, null);
		expect(typeof t.weight === 'function' ? t.weight(ctx) : 0).toBeGreaterThan(0);
		const card = t.make(ctx);
		expect(card.text).toMatch(/Old Wen/);
		const res = choose({ ...run, deck: [card] }, 'left');
		expect(res).toBeTruthy();
	});

	it('contract quests complete on arrival with the parcel', () => {
		const run = fresh(14, 1700);
		run.phase = 'map';
		const route = availableRoutes(run)[0];
		run.bag = ['parcel1'];
		run.quests = [{ id: 'q', kind: 'contract', title: 'Deliver test', giver: 'g', from: run.location, to: route.to, item: 'parcel1', due: 999, reward: { silver: 20 }, text: 'Paid.' }];
		const before = run.stats.silver;
		depart(run, route);
		let guard = 0;
		const phase = () => run.phase as Run['phase'];
		while (phase() === 'travel' && guard++ < 10) choose(run, 'left');
		if (phase() === 'end') return; // died en route; fine
		expect(run.quests).toHaveLength(0);
		expect(run.bag).not.toContain('parcel1');
		expect(run.log.some((l) => l.text.includes('Completed: Deliver test'))).toBe(true);
		expect(before).toBeGreaterThan(0);
	});

	it('conversion changes faith', () => {
		const run = fresh(15);
		run.hero.faith = 'buddhist';
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'x', left: { label: 'no', fx: {} }, right: { label: 'convert', fx: {}, convert: 'christian' } }];
		choose(run, 'right');
		expect(run.hero.faith).toBe('christian');
	});

	it('accident detours traveller to unmarked settlement before resuming destination', () => {
		const run = fresh(17, 1680);
		const routes = availableRoutes(run);
		depart(run, routes[0]);
		expect(run.phase).toBe('travel');
		const targetCity = run.route!.to;
		// Trigger an accident detour flag
		run.flags.detour = 'cove';
		// Empty the remaining travel deck and finish the card
		run.deck = [{ id: 'test-card', npc: run.deck[0].npc, text: 'rough waters', left: { label: 'brace', fx: {} }, right: { label: 'jump', fx: {} } }];
		choose(run, 'left');
		// Detour triggers
		expect(run.flags.inDetour).toBe('cove');
		expect(run.flags.detour).toBeUndefined();
		expect(run.location).not.toBe(targetCity);
		expect(run.route?.to).toBe(targetCity);
		expect(run.deck.length).toBeGreaterThanOrEqual(2);
		expect(run.deck[0].scene).toBe('rustic');
		// Play through the rustic detour deck
		while (run.deck.length > 0) {
			choose(run, 'left');
		}
		// Now arrived at destination city
		expect(run.flags.inDetour).toBeUndefined();
		expect(run.location).toBe(targetCity);
		expect(run.route).toBeNull();
	});

	it('all 24 local legends are registered and have encounter templates', async () => {
		const { LEGENDS, LEGEND_T } = await import('#lib/game/cards/legends');
		expect(LEGENDS.length).toBe(24);
		for (const leg of LEGENDS) {
			const found = LEGEND_T.find((t) => t.id === 'legend-' + leg.id);
			expect(found, `Missing legend template for ${leg.id}`).toBeDefined();
		}
	});
});

describe('depth: standing, ventures, dynasty', () => {
	it('renown in a city raises that culture’s standing and improves prices', async () => {
		const { sellPrice } = await import('#lib/game/economy');
		const run = fresh(20, 1700);
		const cul = CITY[run.location].culture;
		const before = sellPrice(run, 'pepper', run.location);
		run.standing[cul] = 0;
		run.deck = [{ id: 't', npc: run.deck[0].npc, text: 'x', left: { label: 'praise', fx: { renown: 20 } }, right: { label: 'no', fx: {} } }];
		choose(run, 'left');
		expect(run.standing[cul]).toBeGreaterThan(5);
		run.standing[cul] = 80;
		expect(sellPrice(run, 'pepper', run.location)).toBeGreaterThanOrEqual(before);
	});

	it('banking moves silver to the treasury and back', async () => {
		const { bank } = await import('#lib/game/engine');
		const run = fresh(21);
		run.phase = 'map';
		run.stats.silver = 60;
		bank(run, 10);
		expect(run.stats.silver).toBe(50);
		expect(run.treasury).toBe(10);
		bank(run, -5);
		expect(run.treasury).toBe(5);
	});

	it('ventures go on trade runs and report back', async () => {
		const { newVenture, tradeRuns, dispatch, resolveVentures } = await import('#lib/game/ventures');
		const run = fresh(22, 1700);
		const port = Object.values(CITY).find((c) => c.port && c.culture === 'han')!.id;
		const v = newVenture(new Rng(1), 'junk', port);
		run.ventures = [v];
		const t = tradeRuns(run, v)[0];
		expect(t).toBeTruthy();
		dispatch(run, v.id, t);
		expect(v.state).toBe('away');
		run.day += t.days + 1;
		const notes = resolveVentures(run, new Rng(2));
		expect(notes.length).toBe(1);
		expect(run.ventures.length === 0 || run.ventures[0].state === 'idle').toBe(true);
	});

	it('the next generation inherits relics, treasury and grudges', async () => {
		const { successors, legacyOf, newRun: nr, retire } = await import('#lib/game/engine');
		const run = fresh(23, 1650);
		run.phase = 'map';
		run.bag = ['fox-mask', 'rations'];
		run.treasury = 100;
		run.flags.lover = 'Mei';
		run.flags.loverCity = run.location;
		run.ties = [{ id: 'g', npc: run.deck[0].npc, kind: 'grudge', deed: 'insulted them', city: run.location, day: 3 }];
		retire(run);
		expect(run.ending?.kind).toBe('retired');
		const heirs = successors(run);
		expect(heirs.some((h) => h.relation === 'child')).toBe(true);
		const child = heirs.find((h) => h.relation === 'child')!;
		const next = nr(child.hero, 'x', child.year, { legacy: legacyOf(run, child) });
		expect(next.generation).toBe(2);
		expect(next.bag).toContain('fox-mask');
		expect(next.treasury).toBe(70);
		expect(next.ties[0].kind).toBe('grudge');
		expect(next.lineage[0].name).toBe(run.hero.name);
	});
});

describe('content', () => {
	it('every Markdown card and campaign parses', async () => {
		const { RAW } = await import('#lib/content/raw.gen');
		const { validate } = await import('#lib/content/parse');
		expect(RAW.length).toBeGreaterThanOrEqual(9);
		for (const r of RAW) expect(validate(r.file, r.src), r.file).toEqual([]);
	});

	it('bad effects are reported clearly', async () => {
		const { validate } = await import('#lib/content/parse');
		const errs = validate('x.md', 'where: city\n\nHello.\n\n## left: a\nfx: gold +5\n\n## right: b\nfx: silver +1');
		expect(errs[0]).toMatch(/Bad effect/);
	});

	it('profession quest lines load templates for all 11 professions', async () => {
		const { CONTENT_TEMPLATES } = await import('#lib/content/index');
		const { PROFESSIONS } = await import('#lib/data/traits');
		for (const p of PROFESSIONS) {
			const templates = CONTENT_TEMPLATES.filter((t) => t.id.startsWith(`md-profession-${p.id}-`));
			expect(templates.length, `Missing quest line for ${p.id}`).toBeGreaterThanOrEqual(3);
		}
	});

	it('every campaign can be finished with a written ending', async () => {
		const { CAMPAIGNS } = await import('#lib/content/index');
		for (const c of CAMPAIGNS) {
			const titles = new Set<string>();
			for (let i = 0; i < 40; i++) {
				const r = new Rng(i * 97 + 1);
				const year = r.int(c.years[0], c.years[1]);
				const run = newRun(randomHero(r, year, { culture: c.culture }), 'ct' + i, year, { campaign: c.id, difficulty: 'pilgrim' });
				play(run, r);
				if (run.ending && run.flags.end === 'campaign') titles.add(run.ending.title);
			}
			expect(titles.size, c.id).toBeGreaterThanOrEqual(2);
		}
	}, 30000);

	it('generates a book-formatted journal HTML document', async () => {
		const { generateJournalBookHtml } = await import('#lib/journal-book');
		const r = new Rng(42);
		const run = newRun(randomHero(r, 1680), 'book-test', 1680);
		play(run, r);
		const html = generateJournalBookHtml(run);
		expect(html).toContain('The Travels of');
		expect(html).toContain(run.hero.name);
		expect(html).toContain('Chapter 1');
		expect(html).toContain('<!DOCTYPE html>');
	});

	it('supports settling down peacefully as a victory', async () => {
		const { settle } = await import('#lib/game/engine');
		const run = fresh(55, 1700);
		run.phase = 'city';
		settle(run);
		expect(run.ending).toBeTruthy();
		expect(run.ending?.kind).toBe('settled');
		expect(run.ending?.won).toBe(true);
		expect(run.ending?.title).toMatch(/Settled Life|Return to/);
	});

	it('nextAssignment generates a new commission while preserving active side quests', async () => {
		const { nextAssignment } = await import('#lib/game/engine');
		const run = fresh(77, 1680);
		run.quests = [
			{ id: 'side-quest-1', kind: 'contract', title: 'Survey pass', giver: 'Master', from: run.location, to: 'kyoto', due: 120, reward: { silver: 20 }, text: 'Survey' }
		];
		const oldDest = run.destination;
		const msg = nextAssignment(run);
		expect(msg).toMatch(/^New commission:/);
		expect(run.deck[0]?.id).toBe('assignment'); // a briefing card, never an empty city
		expect(run.destination).not.toBe(run.location);
		expect(run.delivered).toBe(false);
		expect(run.statuses).toContain('master-courier');
		expect(run.quests.length).toBe(1);
		expect(run.quests[0].id).toBe('side-quest-1');
	});

	it('processes faction reputations, dynamic traits, and permanent statuses on choices', async () => {
		const { choose } = await import('#lib/game/engine');
		const run = fresh(88, 1680);
		run.deck = [
			{
				id: 'test-card',
				npc: run.deck[0].npc,
				text: 'A wandering master offers an oath.',
				left: { label: 'Accept', fx: {}, faction: { outlaw: 25, crown: -10 }, traitAdd: ['battle-hardened'], statusAdd: ['blessed-hands'] },
				right: { label: 'Decline', fx: {} }
			}
		];
		choose(run, 'left');
		expect(run.factions?.outlaw).toBe(25);
		expect(run.factions?.crown).toBe(-10);
		expect(run.hero.traits).toContain('battle-hardened');
		expect(run.statuses).toContain('blessed-hands');
	});

	it('detects war zones and applies wartime price surges in markets', async () => {
		const { isWarZone } = await import('#lib/game/events');
		const { priceOf } = await import('#lib/game/market');
		const run = fresh(99, 1680);
		run.location = 'beijing';
		run.world = [
			{ id: 'w1', kind: 'war', label: 'Test War', start: 0, end: 100, cities: ['beijing'], sides: ['han', 'japanese'] }
		];
		expect(isWarZone(run, 'beijing')).toBe(true);
		const rationPrice = priceOf(run, 'rations');
		expect(rationPrice).toBeGreaterThan(1);
	});

	it('tracks mobile caravans along routes and in encampment cities', async () => {
		const { caravanAt, caravanOnRoute, caravanPos } = await import('#lib/game/events');
		const run = fresh(101, 1680);
		const caravan = run.world.find((w) => w.id === 'caravan-kirghiz');
		expect(caravan).toBeTruthy();
		if (!caravan) return;
		const pos0 = caravanPos(run, caravan);
		expect(caravan.cities).toContain(pos0);
		expect(caravanAt(run, pos0)).toBeTruthy();

		// Advance days to move the caravan
		run.day = 45;
		const pos1 = caravanPos(run, caravan);
		expect(caravan.cities).toContain(pos1);
	});

	it('detour decks generate wilderness survival and foraging cards', async () => {
		const { buildDetourDeck } = await import('#lib/game/cards/index');
		const r = new Rng(1234);
		const run = fresh(102, 1680);
		run.flags.inDetour = 'hamlet';
		run.bag.push('hunting-knife', 'umbrella', 'flint-steel');
		const deck = buildDetourDeck(run, r, 'hamlet');
		expect(deck.length).toBeGreaterThanOrEqual(2);
		expect(deck.some((c) => c.scene === 'rustic')).toBe(true);
	});

	it('spawns and queries celestial omens', async () => {
		const { omenAt, tickWorld } = await import('#lib/game/events');
		const run = fresh(103, 1680);
		run.world = [
			{
				id: 'comet-test',
				kind: 'omen',
				label: 'The Great Broom Star',
				start: 0,
				end: 50,
				cities: ['beijing', 'samarkand'],
				data: { omenType: 'comet' }
			}
		];
		expect(omenAt(run, 'beijing')).toBeTruthy();
		expect(omenAt(run, 'beijing')?.data?.omenType).toBe('comet');
		expect(omenAt(run, 'kyoto')).toBeUndefined();
	});

	it('dynasty succession inherits heirloom items and triggers generational memory', async () => {
		const { newRun, randomHero } = await import('#lib/game/engine');
		const r = new Rng(104);
		const run1 = fresh(104, 1680);
		run1.delivered = true;
		run1.bag.push('sword');

		// Successor in Gen 2
		const hero2 = randomHero(r, 1710);
		const run2 = newRun(hero2, 'seed-gen2', 1710, {
			legacy: {
				lineage: [{ name: run1.hero.name, culture: run1.hero.culture, gender: run1.hero.gender, seed: run1.hero.seed, years: '1680–1710', ending: 'victory', relation: 'grandparent' }],
				relics: ['sword'],
				treasury: 50,
				ventures: [],
				standing: { [run1.hero.culture]: 30 },
				karma: 25,
				ties: [{ id: 'tie-1', npc: run1.deck[0]?.npc ?? { name: 'Old Elder', title: 'Elder', culture: 'han', gender: 'm', role: 'elder', seed: 1 }, kind: 'favor', deed: 'helped build the village well', city: 'beijing', day: 20 }]
			}
		});

		expect(run2.generation).toBe(2);
		expect(run2.bag.some((item) => item === 'ancestral-crest' || item === 'heirloom-blade')).toBe(true);
		expect(run2.ties.length).toBe(1);
		expect(run2.ties[0].deed).toContain('helped build the village well');
	});
});
