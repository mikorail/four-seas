import type { Rng } from '#lib/rng';
import { CULTURES } from '#lib/data/cultures';
import { CITY, type City, type Mode } from '#lib/data/world';
import { weightMult } from '../mods';
import { monthOf, seasonFor } from '../economy';
import type { Card, Run } from '../types';
import { ch, npc, odds, up, carrying, type Ctx, type Template } from './helpers';
import { TRAVEL, UNMARKED_T } from './travel';
import { ANY_T, CITY_T } from './city';
import { CRIME, RETINUE } from './underworld';
import { ERA } from './era';
import { LEGEND_T } from './legends';
import { ARCS } from './arcs';
import { FAITH_T } from './faith';
import { STORIES } from './stories';
import { KARMA_T } from './karma';
import { FESTIVAL_T } from './festivals';
import { DEPTH_T } from './depth';
import { WORLD_T } from './world';
import { SECRET_T } from './secrets';
import { SIDE_T } from './side';
import { ROMANCE_T } from './romance';
import { RARE_T } from './rare';
import { DEATH_T, DISASTER_T } from './disasters';
import { WAYFARER_T } from './wayfarers';
import { TURMOIL_T } from './turmoil';
import { GRAVE_T } from './graves';
import { STORY_T } from './storyteller';
import { FAIR_T } from './fairs';
import { CONTRABAND_T } from './contraband';
import { LIFE_T } from './life';
import { COMPANION_T } from './companions';
import { ROADSIDE_T } from './roadside';
import { REBELLION_T } from './rebellion';
import { GUILD_T } from './guild';
import { VENUE_CARD } from './venues';
import type { VenueId } from '#lib/data/venues';
import { CONTENT_TEMPLATES } from '#lib/content/index';
import { companionBaggageCard } from '../companions';

export const TEMPLATES: Template[] = [...TRAVEL, ...UNMARKED_T, ...CITY_T, ...ANY_T, ...CRIME, ...RETINUE, ...ERA, ...LEGEND_T, ...ARCS, ...FAITH_T, ...STORIES, ...KARMA_T, ...FESTIVAL_T, ...DEPTH_T, ...WORLD_T, ...SECRET_T, ...SIDE_T, ...ROMANCE_T, ...REBELLION_T, ...RARE_T, ...DISASTER_T, ...DEATH_T, ...TURMOIL_T, ...GRAVE_T, ...STORY_T, ...FAIR_T, ...CONTRABAND_T, ...LIFE_T, ...COMPANION_T, ...ROADSIDE_T, ...WAYFARER_T, ...GUILD_T, ...CONTENT_TEMPLATES];

export { LEGENDS } from './legends';
export { capacity } from './helpers';

// ===== Reactive stat cards (Reigns-style nudges near the edges) =====
function reactive(c: Ctx): Card | null {
	const s = c.run.stats;
	const r = c.rng;
	if (s.silver >= 78 && r.chance(0.7)) {
		const n = npc(c, 'official', { title: 'Tax collector' });
		return {
			id: 'r-rich',
			npc: n,
			text: `${n.name} has heard of your heavy purse. "A traveller so wealthy surely owes a... special levy."`,
			left: ch('Hide your wealth', {}, { gamble: { p: odds(c, 0.45, ['crime']), win: { fx: { fortune: 2 }, text: 'Nothing found.' }, lose: { fx: { silver: -22, renown: -6 }, text: 'Found, and fined double.' } } }),
			right: ch('Pay generously', { silver: -18, renown: 6 }),
			up: c.run.bagKind !== 'trunk' ? up('Rich', 'Buy a lacquered trunk and fine clothes', { silver: -26, renown: 8 }, { bag: 'trunk', itemAdd: ['finery'], text: 'Wealth, converted into something harder to steal.' }) : undefined
		};
	}
	if (s.silver <= 22 && r.chance(0.7)) {
		const n = npc(c, 'merchant', { title: 'Moneylender' });
		const sellable = c.run.bag.filter((id) => id.startsWith('good:'));
		return {
			id: 'r-poor',
			npc: n,
			text: `${n.name} notices your thin purse. "A loan, friend? The interest is barely ruinous."`,
			left: ch('Refuse', { fortune: 2 }),
			right: ch('Borrow', { silver: 18, fortune: -10, renown: -4 }, { text: 'Silver now. Sorrow later.' }),
			up: c.run.mount ? up('Mount', `Sell ${c.run.mount.name}`, { silver: 14, fortune: -3 }, { mount: 'none', text: 'Hard, but it keeps you on the road.' }) : sellable.length ? up('Cargo', 'Pawn your cargo cheaply', { silver: 12 }, { itemRemove: [sellable[0]] }) : undefined
		};
	}
	if (s.vigor <= 22 && r.chance(0.7)) {
		const n = npc(c, 'healer');
		return {
			id: 'r-weak',
			npc: n,
			text: `You collapse, burning with fever. ${n.name} finds you. "You need rest. Days of it."`,
			left: ch('Push on regardless', { vigor: -4, renown: 4 }),
			right: ch('Rest and recover', { vigor: 20, silver: -6 }, { tags: ['rest', 'illness'], days: 4 }),
			up: carrying(c, 'medicine') ? up('Medicine chest', 'Take your medicine', { vigor: 18 }, { itemRemove: ['medicine'] }) : undefined
		};
	}
	if (s.vigor >= 80 && r.chance(0.7)) {
		const n = npc(c, 'soldier', { title: 'Wrestling champion' });
		return {
			id: 'r-strong',
			npc: n,
			text: `Brimming with energy, you feel you could wrestle a bear. ${n.name} is roughly bear-sized. "Fight me."`,
			left: ch('Know your limits', { vigor: -6, fortune: 3 }),
			right: ch('Wrestle!', { vigor: -16, renown: 8 }, { tags: ['fight'] })
		};
	}
	if (s.renown <= 22 && r.chance(0.7)) {
		const n = npc(c, 'elder');
		return {
			id: 'r-disgrace',
			npc: n,
			text: `People whisper as you pass. ${n.name} suggests a public good deed might mend your name.`,
			left: ch('Ignore them', { renown: -3 }),
			right: ch('Fund a bridge repair', { silver: -12, renown: 16 })
		};
	}
	if (s.renown >= 78 && r.chance(0.7)) {
		const n = npc(c, 'official', { title: 'Secret police' });
		return {
			id: 'r-famous',
			npc: n,
			text: `${n.name} has a thick file on you. "Such a famous traveller. Such a convenient spy, perhaps?"`,
			left: ch('Lie low a while', { renown: -14 }, { days: 2, text: 'You change inns, dye your coat, and keep to the shadows.' }),
			right: ch('Bribe the magistrate', { silver: -14, renown: -8 }, { tags: ['official', 'bribe'], text: 'A heavy purse smooths the magistrate’s brow. The file is quietly mislaid.' }),
			up: carrying(c, 'papers') ? up('Forged papers', 'Travel under another name', { renown: -10 }, { text: 'Nobody famous here. Just a humble merchant.' }) : undefined
		};
	}
	if (s.fortune <= 22 && r.chance(0.7)) {
		const n = npc(c, 'monk');
		return {
			id: 'r-cursed',
			npc: n,
			text: `Crows follow you. Milk sours as you pass. ${n.name} offers an exorcism.`,
			left: ch('Superstition!', { fortune: -4 }),
			right: ch('Purify yourself', { silver: -10, fortune: 18 }, { tags: ['faith'], days: 1 }),
			up: carrying(c, 'charm') ? up('Temple charm', 'Burn your charm', { fortune: 14 }, { itemRemove: ['charm'] }) : undefined
		};
	}
	if (s.fortune >= 80 && r.chance(0.7)) {
		const n = npc(c, 'monk', { title: 'Zealous follower' });
		return {
			id: 'r-blessed',
			npc: n,
			text: `${n.name} kneels before you. "Heaven smiles on you! Bless my family, holy one!" A crowd is forming.`,
			left: ch('Insist you are ordinary', { fortune: -14, renown: -4 }, { text: 'You point to the sky: "Praise Heaven, not a dusty traveller."' }),
			right: ch('Distribute alms to the crowd', { silver: -12, fortune: -8, renown: 4 }, { tags: ['faith', 'mercy'], text: 'You shower coins into their hands. The awe dissolves into a scramble for copper.' })
		};
	}
	return null;
}

export function makeCtx(run: Run, rng: Rng, where: 'travel' | 'city', mode: Mode | null, from: City | null): Ctx {
	const city = CITY[run.route && where === 'travel' ? run.route.to : run.location];
	const season = run.route && where === 'travel' ? seasonFor(run.route, monthOf(run)) : null;
	return { rng, run, year: run.year, where, mode, city, from, local: CULTURES[where === 'travel' && from && rng.chance(0.5) ? from.culture : city.culture], season };
}

export function buildDeck(run: Run, rng: Rng, where: 'travel' | 'city', count: number, mode: Mode | null, from: City | null): Card[] {
	const c = makeCtx(run, rng, where, mode, from);
	const deck: Card[] = [];
	const used = new Set<string>();
	let hasRare = false;

	const rx = reactive(c);
	if (rx) {
		deck.push(rx);
		used.add(rx.id);
	}

	if (where === 'travel') {
		const bg = companionBaggageCard(run, rng);
		if (bg) {
			deck.push(bg);
			used.add(bg.id);
		}
	}

	while (deck.length < count) {
		const pool = TEMPLATES.filter((t) => {
			if (used.has(t.id)) return false;
			if (t.where !== 'any' && t.where !== where) return false;
			if (t.modes && (!mode || !t.modes.includes(mode))) return false;
			if (t.once && run.flags['once:' + t.id]) return false;
			if (t.rare && hasRare) return false;
			if (t.when && !t.when(c)) return false;
			return true;
		});
		const weighted = pool
			.map((t) => {
				const base = typeof t.weight === 'function' ? t.weight(c) : (t.weight ?? 1);
				const recentPenalty = run.recent.includes(t.id) ? 0.15 : 1;
				return { t, w: base * recentPenalty * weightMult(run, t.tags ?? []) };
			})
			.filter((x) => x.w > 0);
		if (!weighted.length) break;
		const { t } = rng.weighted(weighted, (x) => x.w);
		used.add(t.id);
		if (t.once) run.flags['once:' + t.id] = true;
		if (t.rare) {
			hasRare = true;
			run.flags['rare:' + t.id] = true;
		}
		deck.push(t.make(c));
	}
	return deck;
}

/** The card you get for visiting a venue in the current city (null for the market, which opens its own screen). */
export function venueCard(run: Run, rng: Rng, id: VenueId): Card | null {
	const make = VENUE_CARD[id];
	return make ? make(makeCtx(run, rng, 'city', null, null)) : null;
}

/** An off-the-map deck of intimate, restorative encounters when an accident interrupts the journey. */
export function buildDetourDeck(run: Run, rng: Rng, kind: string): Card[] {
	const c = makeCtx(run, rng, 'travel', null, null);
	const deck: Card[] = [];
	const pool = UNMARKED_T.filter((t) => !t.when || t.when(c));
	const count = rng.chance(0.5) ? 3 : 2;
	const picked = rng.sample(pool, Math.min(count, pool.length));
	for (const t of picked) {
		const card = t.make(c);
		card.scene = 'rustic';
		deck.push(card);
	}
	return deck;
}
