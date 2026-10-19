import type { Rng } from '#lib/rng';
import { CULTURES, makeName, type Culture, type CultureId, type Gender } from '#lib/data/cultures';
import { SECRETS, cityName, routesFrom, type City, type Mode } from '#lib/data/world';
import { ITEMS, isGood } from '#lib/data/items';
import { capacity, cellsUsed } from '../bag';
import { DIFFICULTY } from '#lib/data/difficulty';
import type { Tag } from '#lib/data/traits';
import { gambleBonus, hasCrew, hasItem, hasPerk, skillLevel } from '../mods';
import type { Season } from '../economy';
import type { Card, Choice, CrewRole, Npc, Role, Run } from '../types';

export interface Ctx {
	rng: Rng;
	run: Run;
	year: number;
	where: 'travel' | 'city';
	mode: Mode | null;
	city: City; // current city, or next stop when travelling
	from: City | null;
	local: Culture;
	season: Season | null;
}

export interface Template {
	id: string;
	where: 'travel' | 'city' | 'any';
	modes?: Mode[];
	tags?: Tag[];
	weight?: number | ((c: Ctx) => number);
	when?: (c: Ctx) => boolean;
	once?: boolean;
	rare?: boolean; // at most one per deck; recorded in the Chronicle
	make: (c: Ctx) => Card;
}

const ROLE_TITLE: Partial<Record<Role, (c: Culture) => string>> = {
	merchant: (c) => `${c.adjective} merchant`,
	official: (c) => c.official,
	monk: (c) => (c.holyPlace === 'mosque' || c.holyPlace === 'madrasa' ? 'Dervish' : c.holyPlace === 'church' ? 'Jesuit father' : 'Monk'),
	bandit: () => 'Highway robber',
	sailor: (c) => `${c.adjective} sailor`,
	captain: () => 'Captain',
	noble: (c) => (c.id === 'japanese' ? 'Daimyō' : c.id === 'indian' ? 'Rajah' : c.id === 'european' ? 'Governor' : 'Noble'),
	scholar: (c) => (c.id === 'han' || c.id === 'korean' ? 'Literatus' : 'Scholar'),
	healer: () => 'Healer',
	performer: (c) => (c.id === 'japanese' ? 'Kabuki actor' : c.id === 'han' ? 'Opera singer' : 'Storyteller'),
	child: () => 'Street urchin',
	elder: () => 'Village elder',
	soldier: (c) => (c.id === 'ottoman' ? 'Janissary' : c.id === 'japanese' ? 'Ashigaru' : c.id === 'indian' ? 'Sepoy' : 'Soldier'),
	ghost: () => 'Restless spirit',
	tiger: () => 'Tiger',
	'fortune-teller': () => 'Fortune teller',
	lover: () => 'Charming stranger',
	innkeeper: (c) => (c.id === 'japanese' ? 'Ryokan keeper' : c.id === 'persian' || c.id === 'ottoman' || c.id === 'steppe' ? 'Caravanserai keeper' : 'Innkeeper'),
	spirit: () => 'Spirit'
};

export function npc(c: Ctx, role: Role, opts: { culture?: CultureId; gender?: Gender; foreign?: boolean; name?: string; title?: string } = {}): Npc {
	let cid = opts.culture ?? c.local.id;
	if (opts.foreign) {
		const pool = (Object.keys(CULTURES) as CultureId[]).filter((x) => x !== c.local.id);
		cid = c.rng.pick(pool);
	} else if (!opts.culture && c.where === 'travel' && c.from && c.rng.chance(0.4)) cid = c.from.culture;
	const cul = CULTURES[cid];
	const maleish: Role[] = ['bandit', 'soldier', 'captain', 'sailor', 'monk'];
	const gender = opts.gender ?? (maleish.includes(role) ? (c.rng.chance(0.12) ? 'f' : 'm') : c.rng.chance(0.5) ? 'f' : 'm');
	const name = opts.name ?? (role === 'tiger' ? 'The Striped Lord' : role === 'ghost' ? 'A pale figure' : makeName(c.rng, cul, gender));
	return { name, title: opts.title ?? ROLE_TITLE[role]?.(cul) ?? 'Traveller', culture: cid, gender, role, seed: c.rng.int(1, 1e9) };
}

/** Probability helper that folds in fortune + perk / gear / crew bonuses. */
export function odds(c: Ctx, base: number, tags: Tag[]): number {
	const social = tags.some((t) => t === 'official' || t === 'talk' || t === 'trade') ? standingHere(c) / 400 : 0;
	const p = base + (c.run.stats.fortune - 50) / 300 + gambleBonus(c.run, tags) + (DIFFICULTY[c.run.difficulty]?.odds ?? 0) + social;
	return Math.max(0.05, Math.min(0.95, p));
}

export const place = (c: Ctx, city = c.city) => cityName(city, c.year);
export const standingHere = (c: Ctx) => c.run.standing?.[c.city.culture] ?? 0;
export const has = (c: Ctx, id: string) => hasPerk(c.run, id);
export const carrying = (c: Ctx, id: string) => hasItem(c.run, id);
export const withCrew = (c: Ctx, role: CrewRole) => hasCrew(c.run, role);
export const isForeigner = (c: Ctx) => c.run.hero.culture !== c.local.id;
export const between = (c: Ctx, a: number, b: number) => c.year >= a && c.year <= b;
export const inCulture = (c: Ctx, ...ids: CultureId[]) => ids.includes(c.city.culture) || (c.from ? ids.includes(c.from.culture) : false);
export const stage = (c: Ctx, arc: string) => Number(c.run.flags['arc:' + arc] ?? 0);

export { capacity };
/** Free cells in the luggage (an item may still not fit if its shape is awkward). */
export const bagFree = (c: Ctx) => capacity(c.run) - cellsUsed(c.run);
export const goodsInBag = (c: Ctx) => c.run.bag.filter(isGood);

export function ch(label: string, fx: Choice['fx'], extra: Partial<Choice> = {}): Choice {
	return { label, fx, ...extra };
}

/** Hidden third option, unlocked by a trait / item / companion. */
export function up(why: string, label: string, fx: Choice['fx'], extra: Partial<Choice> = {}): Choice {
	return { label, fx, why, ...extra };
}

/** Is the hero wearing one of these outfits? */
export const dressed = (c: Ctx, ...ids: string[]) => !!c.run.outfit && ids.includes(c.run.outfit.id);
/** Is the hero's sweetheart (not parted) in this state? */
export const romanceIs = (c: Ctx, ...s: ('courting' | 'betrothed' | 'married')[]) => !!c.run.romance && (s as string[]).includes(c.run.romance.status);
export const crewFull = (c: Ctx) => c.run.crew.length >= 3;

/** An undiscovered hidden path that starts within `hops` roads of here — so rumours point somewhere real. */
export function nearSecret(c: Ctx, hops = 2): (typeof SECRETS)[number] | undefined {
	const near = new Set([c.city.id]);
	let ring = [c.city.id];
	for (let h = 0; h < hops; h++) {
		ring = ring.flatMap((id) => routesFrom(id, c.year).map((r) => r.to)).filter((id) => !near.has(id));
		ring.forEach((id) => near.add(id));
	}
	const cands = SECRETS.filter((s) => !c.run.flags['secret:' + s.id] && s.edges.split(/\s+/).some((e) => e.replace(/-x$/, '').split('-').some((x) => near.has(x))));
	return cands.length ? c.rng.pick(cands) : undefined;
}
/** A hint toward a hidden path: two of these about the same path reveal it. */
export const hint = (id: string) => ({ ['hint:' + id]: 1 });
/** Your level in a life skill (0–10), for skill-check options. */
export const skill = (c: Ctx, id: import('#lib/data/skills').SkillId) => skillLevel(c.run, id);
/** Contraband and intel in the bag. */
export const contrabandIn = (c: Ctx) => c.run.bag.filter((id) => ITEMS[id]?.contraband);
export const intelIn = (c: Ctx) => c.run.bag.filter((id) => ITEMS[id]?.intel);
