import { PERK, STATS, type Fx, type Perk, type Tag } from '#lib/data/traits';
import { OUTFITS } from '#lib/data/market';
import { VOICES, baseVoices } from '#lib/data/voices';
import { THOUGHT } from '#lib/data/cabinet';
import { SKILLS, levelOf, type SkillId } from '#lib/data/skills';
import { lifePerks, titleLikes } from './life';
import { CREW, ITEMS, MOUNTS } from '#lib/data/items';
import { CULTURAL_AFFINITIES, type CultureId } from '#lib/data/cultures';
import { CULTURE_FAITH, kindred, type FaithId } from '#lib/data/faiths';
import type { Mode } from '#lib/data/world';
import type { Run } from './types';

type PerkLike = Pick<Perk, 'mult' | 'gamble' | 'weight' | 'travelDays'>;

/** Every passive effect currently on the hero: calling, traits, carried gear, retinue. */
export function perksOf(run: Pick<Run, 'hero' | 'bag' | 'crew'> & { outfit?: Run['outfit']; skills?: Run['skills'] }): PerkLike[] {
	const out: PerkLike[] = [PERK[run.hero.profession], ...run.hero.traits.map((t) => PERK[t])].filter(Boolean);
	if (run.outfit && OUTFITS[run.outfit.id]) out.push(OUTFITS[run.outfit.id].perk);
	const sk = (run as { skills?: Run['skills'] }).skills;
	if (sk) for (const sd of SKILLS) {
		const lvl = levelOf(sk[sd.id] ?? 0);
		if (lvl) out.push(sd.perk(lvl));
	}
	// age, titles and finished collections (only for a real journey, not a hero being created)
	if ('log' in run && 'day' in run) out.push(...lifePerks(run as Run));
	const cab = (run as { cabinet?: Run['cabinet'] }).cabinet;
	if (cab) {
		for (const id of cab.done) if (THOUGHT[id]) out.push(THOUGHT[id].done);
		for (const sl of cab.slots) if (THOUGHT[sl.id]) out.push(THOUGHT[sl.id].during);
	}
	for (const id of new Set(run.bag)) {
		const p = ITEMS[id]?.perk;
		if (p) out.push(p);
	}
	for (const c of run.crew) out.push(CREW[c.role].perk);
	return out;
}

const matches = (want: Tag[], have: Tag[]) => want.length === 0 || want.some((t) => have.includes(t));

export function modFx(run: Pick<Run, 'hero' | 'bag' | 'crew'>, fx: Fx, tags: Tag[] = []): Fx {
	const out: Fx = {};
	const perks = perksOf(run);
	for (const s of STATS) {
		const v = fx[s];
		if (!v) continue;
		let m = 1;
		for (const p of perks)
			for (const mu of p.mult ?? []) {
				if (mu.stat && mu.stat !== s) continue;
				if (!matches(mu.tags, tags)) continue;
				m *= v > 0 ? (mu.gain ?? 1) : (mu.loss ?? 1);
			}
		out[s] = Math.round(v * m);
		if (out[s] === 0) out[s] = Math.sign(v);
	}
	return out;
}

export function gambleBonus(run: Pick<Run, 'hero' | 'bag' | 'crew'> & { day?: number; statuses?: string[] }, tags: Tag[] = []): number {
	const mood = moodOf(run);
	let b = mood === 'good' ? 0.15 : mood === 'bad' ? -0.1 : 0;
	// inner voices: +2% per level above 2 on the choices they care about
	const lv = effectiveVoices(run as Run);
	for (const v of VOICES) if (v.tags.some((t) => tags.includes(t))) b += Math.max(-0.02, (lv[v.id] - 2) * 0.02);
	// a frayed mind fumbles
	const mind = (run as { mind?: number }).mind ?? 70;
	if (mind < 35) b -= mind < 15 ? 0.1 : 0.05;
	for (const p of perksOf(run)) for (const g of p.gamble ?? []) if (matches(g.tags, tags)) b += g.bonus;
	if (run.statuses?.includes('one-eyed')) b -= 0.05;
	if (run.statuses?.includes('enlightened')) b += 0.08;
	return b;
}

export function weightMult(run: Pick<Run, 'hero' | 'bag' | 'crew'>, tags: Tag[] = []): number {
	let m = 1;
	for (const p of perksOf(run)) for (const w of p.weight ?? []) if (w.tags.some((t) => tags.includes(t))) m *= w.mult;
	return m;
}

export function travelMult(run: Pick<Run, 'hero' | 'bag' | 'crew' | 'mount'> & { statuses?: string[] }, mode: Mode): number {
	let m = perksOf(run).reduce((m, p) => m * (p.travelDays ?? 1), 1);
	if (mode === 'sea' && run.crew.some((c) => c.role === 'navigator')) m *= 0.85;
	if (mode === 'land' && run.crew.some((c) => c.role === 'guide')) m *= 0.85;
	if (mode === 'land' && run.mount) m *= MOUNTS[run.mount.kind].land + (1 - MOUNTS[run.mount.kind].land) * (1 - run.mount.health / 100);
	if (run.statuses?.includes('limp') && mode === 'land') m *= 1.14;
	if (run.statuses?.includes('master-courier')) m *= 0.88;
	return m;
}

export const hasCrew = (run: Pick<Run, 'crew'>, role: string) => run.crew.some((c) => c.role === role);
export const hasItem = (run: Pick<Run, 'bag'>, id: string) => run.bag.includes(id);
export const hasPerk = (run: Pick<Run, 'hero'>, id: string) => run.hero.profession === id || run.hero.traits.includes(id);

/** How someone of this role feels about your traits: +1 per trait they like, -1 per trait they dislike (capped ±2). */
export function rapportOf(run: Pick<Run, 'hero'>, role: import('./types').Role) {
	const likes: string[] = [...('log' in run ? titleLikes(run as Run, role) : [])];
	const dislikes: string[] = [];
	for (const id of run.hero.traits) {
		const p = PERK[id];
		if (p?.likedBy?.includes(role)) likes.push(p.name);
		if (p?.dislikedBy?.includes(role)) dislikes.push(p.name);
	}
	return { score: Math.max(-2, Math.min(2, likes.length - dislikes.length)), likes, dislikes };
}

/** Mercurial heroes have good days and bad days (stable within a day). */
export function moodOf(run: Pick<Run, 'hero'> & { day?: number }): 'good' | 'bad' | null {
	if (!run.hero.traits.includes('mercurial')) return null;
	const d = run.day ?? 0;
	return ((d * 2654435761 + run.hero.seed) >>> 0) % 3 === 0 ? 'bad' : 'good';
}

/** Voice levels after calling, traits, creator points and finished thoughts (1..8). */
export function effectiveVoices(run: Pick<Run, 'hero'> & { cabinet?: Run['cabinet'] }): Record<import('#lib/data/voices').VoiceId, number> {
	const v = { ...baseVoices(run.hero.profession, run.hero.traits), ...(run.hero.voices ?? {}) };
	for (const id of run.cabinet?.done ?? []) for (const [k, n] of Object.entries(THOUGHT[id]?.done.voices ?? {})) v[k as keyof typeof v] = Math.min(8, (v[k as keyof typeof v] ?? 2) + n!);
	return v;
}

/** Cultural standing, alignment with regional values, trait affinities, and localized titles. */
export function culturalStanding(run: Pick<Run, 'hero'> & { stats?: Partial<Run['stats']>; standing?: Record<string, number> }, culture: CultureId) {
	const aff = CULTURAL_AFFINITIES[culture];
	let score = Math.round((run.standing?.[culture] ?? 0) / 20); // base standing (-5..+5)

	// Kinship bonus
	if (run.hero.culture === culture) score += 2;

	// Faith kinship
	const localFaith = CULTURE_FAITH[culture];
	if (run.hero.faith === localFaith) score += 1;
	else if (kindred(run.hero.faith as FaithId, localFaith)) score += 0.5;

	// Trait alignments
	if (aff) {
		for (const t of run.hero.traits) {
			if (aff.favoredTraits.includes(t)) score += 1;
			if (aff.disfavoredTraits.includes(t)) score -= 1.5;
		}
	}

	// High renown in meritocratic regions
	if (['han', 'korean', 'viet'].includes(culture) && (run.stats?.renown ?? 0) >= 50) {
		score += 1.5;
	}

	const cappedScore = Math.max(-5, Math.min(5, Math.round(score)));

	// Determine localized title
	let title = aff?.titles.traveler ?? 'Traveler';
	if (run.hero.profession === 'scholar') title = aff?.titles.scholar ?? title;
	else if (run.hero.profession === 'merchant') title = aff?.titles.merchant ?? title;
	else if (run.hero.profession === 'soldier' || run.hero.profession === 'ronin') title = aff?.titles.warrior ?? title;
	else if ((run.stats?.renown ?? 0) >= 65) title = aff?.titles.noble ?? title;

	return {
		score: cappedScore,
		title,
		values: aff?.values ?? '',
		system: aff?.politicalSystem ?? ''
	};
}

export type CapStat = 'silver' | 'vigor' | 'renown' | 'fortune' | 'mind';
/** Traits that widen how much of something you can hold before it breaks you. */
const TRAIT_CAP: Record<string, Partial<Record<CapStat, number>>> = {
	veteran: { vigor: 10 },
	survivor: { vigor: 10 },
	'iron-stomach': { vigor: 5 },
	'battle-hardened': { vigor: 10 },
	frugal: { silver: 10 },
	merchant: { silver: 10 },
	haggler: { silver: 5 },
	lucky: { fortune: 10 },
	superstitious: { fortune: 5 },
	'fox-blooded': { fortune: 5 },
	chronicler: { renown: 10 },
	bookworm: { renown: 5 },
	envoy: { renown: 10 },
	'stone-heart': { mind: 15 },
	pious: { mind: 5 },
	ascetic: { mind: 10 },
	pilgrim: { mind: 5 }
};
export const XP_PER_STEP = 150;
export const CAP_STEP = 5;
export const MAX_XP_BONUS = 30;

/** The most of a stat you can hold (100 + traits + experience). Reaching it is as deadly as reaching 0. */
export function capOf(run: Pick<Run, 'hero'> & { xp?: Run['xp']; difficulty?: string }, s: CapStat): number {
	let c = 100;
	for (const id of [run.hero.profession, ...run.hero.traits]) c += TRAIT_CAP[id]?.[s] ?? 0;
	// hard roads teach slower
	const step = XP_PER_STEP * (run.difficulty === 'legend' ? 2.5 : run.difficulty === 'ronin' ? 2 : 1);
	c += Math.min(MAX_XP_BONUS, Math.floor((run.xp?.[s] ?? 0) / step) * CAP_STEP);
	return c;
}

/** Your level (0–10) in a life skill. */
export const skillLevel = (run: { skills?: Run['skills'] }, id: SkillId) => levelOf(run.skills?.[id] ?? 0);
