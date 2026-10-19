// A life on the road: letters to the people you left behind, a home to come back to,
// the years that change you, the names the world gives you, and the things you collect.
import { hashString } from '#lib/rng';
import { shortestDays } from '#lib/data/world';
import { canFit, syncGrid } from './bag';
import { levelOf } from '#lib/data/skills';
import type { Perk } from '#lib/data/traits';
import type { Letter, Role, Run } from './types';

// ---------- letters ----------

/** Write to someone. The reply comes back after roughly the travel time there and back. */
export function sendLetter(run: Run, to: { name: string; id?: string; city: string; kind: Letter['kind'] }, text: string): Letter | null {
	if (run.stats.silver <= 2) return null;
	run.stats.silver -= 1;
	const d = shortestDays(run.location, run.year)[to.city];
	const days = Number.isFinite(d) ? Math.round(d * 1.4 + 6) : 30;
	const l: Letter = { id: `l-${run.day}-${hashString(to.name) % 9999}`, to: to.name, toId: to.id, city: to.city, kind: to.kind, sent: run.day, arrives: run.day + days, text };
	run.letters = [...(run.letters ?? []), l];
	return l;
}
export const lettersDue = (run: Run) => (run.letters ?? []).filter((l) => !l.read && !run.flags['read:' + l.id] && l.arrives <= run.day);
export const lettersInFlight = (run: Run) => (run.letters ?? []).filter((l) => !l.read && !run.flags['read:' + l.id] && l.arrives > run.day);

// ---------- home ----------

export const HOME_PRICE = 40;
export const atHome = (run: Run) => run.home?.city === run.location;
export function buyHome(run: Run): boolean {
	if (run.home || run.stats.silver <= HOME_PRICE) return false;
	run.stats.silver -= HOME_PRICE;
	run.home = { city: run.location, since: run.day, stash: [], garden: 0 };
	return true;
}
/** Move an item between the bag and the stash at home. */
export function stash(run: Run, id: string, toStash: boolean): boolean {
	if (!run.home || !atHome(run)) return false;
	if (toStash) {
		const i = run.bag.indexOf(id);
		if (i < 0 || run.home.stash.length >= 12) return false;
		run.bag.splice(i, 1);
		run.home.stash.push(id);
	} else {
		const i = run.home.stash.indexOf(id);
		if (i < 0 || !canFit(run, id)) return false;
		run.home.stash.splice(i, 1);
		run.bag.push(id);
	}
	syncGrid(run);
	return true;
}

// ---------- ageing ----------

export type LifeStage = 'young' | 'prime' | 'elder' | 'venerable';
export const ageOf = (run: Run) => run.hero.age + Math.floor(run.day / 365);
export function lifeStage(run: Run): LifeStage {
	const a = ageOf(run);
	return a < 25 ? 'young' : a < 50 ? 'prime' : a < 65 ? 'elder' : 'venerable';
}
export const STAGE_LABEL: Record<LifeStage, string> = { young: 'Young — quick to heal, quick to anger', prime: 'In your prime', elder: 'Elder — wiser, slower, respected', venerable: 'Venerable — every road is a long one now' };
/** What the years do to you. */
export function agePerk(run: Run): Pick<Perk, 'mult' | 'gamble' | 'travelDays'> {
	switch (lifeStage(run)) {
		case 'young':
			return { mult: [{ tags: ['rest', 'illness'], stat: 'vigor', gain: 1.15 }, { tags: ['talk', 'official'], stat: 'renown', gain: 0.9 }], gamble: [{ tags: ['fight'], bonus: 0.03 }] };
		case 'elder':
			return { mult: [{ tags: [], stat: 'vigor', loss: 1.12 }, { tags: ['talk', 'official', 'art'], stat: 'renown', gain: 1.15 }], gamble: [{ tags: ['talk'], bonus: 0.04 }] };
		case 'venerable':
			return { mult: [{ tags: [], stat: 'vigor', loss: 1.25 }, { tags: ['talk', 'faith', 'art'], gain: 1.25 }], travelDays: 1.1 };
		default:
			return {};
	}
}

// ---------- titles ----------

export interface Title {
	id: string;
	name: string;
	when: (run: Run) => boolean;
	likedBy: Role[];
	perk: Pick<Perk, 'mult' | 'gamble'>;
}
const count = (run: Run, re: RegExp) => run.log.filter((l) => re.test(l.choice ?? '') || re.test(l.text)).length;
export const TITLES: Title[] = [
	{ id: 'salt-road-ghost', name: 'the Salt Road Ghost', when: (r) => Object.keys(r.flags).filter((k) => k.startsWith('secret:')).length >= 3, likedBy: ['bandit', 'merchant'], perk: { gamble: [{ tags: ['land'], bonus: 0.05 }] } },
	{ id: 'honest-courier', name: 'the Courier Who Never Lies', when: (r) => r.delivered && r.karma >= 25 && r.heat < 10, likedBy: ['official', 'noble', 'elder'], perk: { mult: [{ tags: ['official'], loss: 0.8 }] } },
	{ id: 'plague-doctor', name: 'the Plague Doctor', when: (r) => levelOf(r.skills?.medicine ?? 0) >= 5, likedBy: ['healer', 'elder', 'child'], perk: { mult: [{ tags: ['illness'], stat: 'vigor', loss: 0.8 }] } },
	{ id: 'friend-of-pirates', name: 'Friend of Pirates', when: (r) => r.hero.profession === 'pirate' || count(r, /pirate|rover|brother of the coast/i) >= 3, likedBy: ['sailor', 'captain', 'bandit'], perk: { gamble: [{ tags: ['sea', 'crime'], bonus: 0.05 }] } },
	{ id: 'thief-of-kings', name: 'Thief of Kings', when: (r) => levelOf(r.skills?.thievery ?? 0) >= 6, likedBy: ['bandit', 'child'], perk: { gamble: [{ tags: ['crime'], bonus: 0.06 }] } },
	{ id: 'ghost-speaker', name: 'the Ghost-Speaker', when: (r) => levelOf(r.skills?.mystic ?? 0) >= 4, likedBy: ['ghost', 'spirit', 'fortune-teller', 'monk'], perk: { mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.2 }] } },
	{ id: 'bard-of-seas', name: 'the Bard of the Four Seas', when: (r) => (r.repertoire ?? []).reduce((a, t) => a + t.told, 0) >= 6, likedBy: ['performer', 'innkeeper', 'lover'], perk: { mult: [{ tags: ['art'], gain: 1.2 }] } },
	{ id: 'breaker-of-chains', name: 'Breaker of Chains', when: (r) => Object.keys(r.flags).some((k) => k.startsWith('revhero:')), likedBy: ['child', 'elder', 'soldier'], perk: { mult: [{ tags: ['loyal'], stat: 'renown', gain: 1.2 }] } },
	{ id: 'seven-falls', name: 'Seven-Times-Fallen', when: (r) => Object.keys(r.flags).filter((k) => k.startsWith('brink_used:')).length >= 2, likedBy: ['soldier', 'monk'], perk: { mult: [{ tags: [], stat: 'vigor', loss: 0.92 }] } },
	{ id: 'many-tongues', name: 'Many-Tongued', when: (r) => Object.values(r.langs ?? {}).filter((d) => (d ?? 0) >= 50).length >= 3, likedBy: ['merchant', 'scholar', 'sailor'], perk: { mult: [{ tags: ['foreign'], loss: 0.8 }] } },
	{ id: 'heart-of-gold', name: 'Heart of Gold', when: (r) => r.karma >= 60, likedBy: ['child', 'monk', 'healer', 'elder'], perk: { mult: [{ tags: ['mercy'], gain: 1.2 }] } },
	{ id: 'bazaar-lord', name: 'Lord of the Bazaar', when: (r) => (r.treasury ?? 0) >= 120 || levelOf(r.skills?.crafting ?? 0) >= 6, likedBy: ['merchant', 'innkeeper'], perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.15 }] } }
];
export const TITLE: Record<string, Title> = Object.fromEntries(TITLES.map((t) => [t.id, t]));
export function checkTitles(run: Run, notes: string[]) {
	run.titles ??= [];
	for (const t of TITLES)
		if (!run.titles.includes(t.name) && t.when(run)) {
			run.titles.push(t.name);
			notes.push(`🏵 People have started calling you **${t.name}**.`);
		}
}

// ---------- collections ----------

export interface Collection {
	id: string;
	name: string;
	glyph: string;
	need: number;
	desc: string;
	perk: Pick<Perk, 'mult' | 'gamble' | 'travelDays'>;
	reward: string;
}
export const COLLECTIONS: Collection[] = [
	{ id: 'dishes', name: 'A taste of everywhere', glyph: '🍜', need: 8, desc: 'Eat the local food among eight peoples.', perk: { mult: [{ tags: ['food'], stat: 'vigor', gain: 1.3 }] }, reward: 'Food restores 30% more' },
	{ id: 'bridges', name: 'Famous bridges', glyph: '🌉', need: 5, desc: 'Cross five famous bridges.', perk: { travelDays: 0.97 }, reward: 'Journeys 3% shorter' },
	{ id: 'landmarks', name: 'Wonders of the world', glyph: '🗿', need: 8, desc: 'Stand before eight great landmarks.', perk: { mult: [{ tags: ['art'], stat: 'renown', gain: 1.2 }] }, reward: 'Art renown +20%' },
	{ id: 'temples', name: 'Holy places', glyph: '⛩️', need: 8, desc: 'Pray in eight different cities.', perk: { mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.2 }] }, reward: 'Faith fortune +20%' },
	{ id: 'harbours', name: 'Every harbour', glyph: '⚓', need: 10, desc: 'Drop anchor in ten ports.', perk: { gamble: [{ tags: ['sea'], bonus: 0.05 }] }, reward: '+5% at sea' }
];
export function collect(run: Run, set: string, key: string, notes: string[]) {
	run.collected ??= {};
	const have = (run.collected[set] ??= []);
	if (have.includes(key)) return;
	have.push(key);
	const c = COLLECTIONS.find((x) => x.id === set);
	if (c && have.length === c.need) notes.push(`🏆 Collection complete: **${c.name}** — ${c.reward}.`);
}
export const completedCollections = (run: Run) => COLLECTIONS.filter((c) => (run.collected?.[c.id]?.length ?? 0) >= c.need);

/** All passive effects from life: age, titles, finished collections. */
export function lifePerks(run: Run): Pick<Perk, 'mult' | 'gamble' | 'travelDays'>[] {
	const out = [agePerk(run)];
	for (const n of run.titles ?? []) {
		const t = TITLES.find((x) => x.name === n);
		if (t) out.push(t.perk);
	}
	for (const c of completedCollections(run)) out.push(c.perk);
	return out;
}
/** Roles who warm to you because of your titles. */
export const titleLikes = (run: Run, role: Role) => (run.titles ?? []).filter((n) => TITLES.find((t) => t.name === n)?.likedBy.includes(role));

