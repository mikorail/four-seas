import type { Fx, Stats } from './traits';

export interface Difficulty {
	id: string;
	name: string;
	glyph: string;
	blurb: string;
	deadline: number; // multiplier on the commission deadline
	odds: number; // added to every gamble
	softCap: number; // gains above this are damped (101 = never)
	lossCushion: number; // multiplier on losses when a stat is below 25 (1 = none)
	rival: number; // multiplier on rival travel time (lower = faster rival)
	wages: number; // multiplier on retinue wages
	score: number;
	kit: string[]; // starting items
	stars: number;
}

export const DIFFICULTIES: Difficulty[] = [
	{ id: 'pilgrim', name: 'Pilgrimage', glyph: '蓮', blurb: 'Gentle roads. Generous deadline, kinder odds, falls are cushioned.', deadline: 1.35, odds: 0.08, softCap: 65, lossCushion: 0.7, rival: 1.25, wages: 0.8, score: 0.6, kit: ['rations', 'medicine', 'credit'], stars: 1 },
	{ id: 'courier', name: 'Courier', glyph: '使', blurb: 'The journey as intended.', deadline: 1, odds: 0, softCap: 70, lossCushion: 1, rival: 1, wages: 1, score: 1, kit: ['rations'], stars: 2 },
	{ id: 'ronin', name: 'Rōnin', glyph: '侍', blurb: 'Tighter deadline, crueler dice, a faster rival, greedier hirelings.', deadline: 0.82, odds: -0.09, softCap: 80, lossCushion: 1, rival: 0.9, wages: 1.3, score: 1.5, kit: [], stars: 3 },
	{ id: 'legend', name: 'Legend', glyph: '龍', blurb: 'No mercy. No soft landings. Only songs, if you survive.', deadline: 0.72, odds: -0.12, softCap: 101, lossCushion: 1.15, rival: 0.82, wages: 1.5, score: 2.2, kit: [], stars: 4 }
];

export const DIFFICULTY: Record<string, Difficulty> = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d]));

export interface Hardship {
	id: string;
	name: string;
	glyph: string;
	blurb: string;
	set?: Partial<Stats>; // starting stats overridden to these
	shift?: Fx;
	heat?: number;
	emptyBag?: boolean;
	score: number; // multiplier
	stars: number;
}

export const HARDSHIPS: Hardship[] = [
	{ id: 'none', name: 'No hardship', glyph: '—', blurb: 'You set out healthy, solvent and respectable. Relatively.', score: 1, stars: 0 },
	{ id: 'fever', name: 'Fever-Stricken', glyph: '病', blurb: 'You leave home already burning with fever. Vigor starts at 12.', set: { vigor: 12 }, score: 1.25, stars: 1 },
	{ id: 'penniless', name: 'Penniless', glyph: '貧', blurb: 'A gambling debt took everything. Silver starts at 8, no supplies.', set: { silver: 8 }, emptyBag: true, score: 1.25, stars: 1 },
	{ id: 'exile', name: 'Disgraced Exile', glyph: '流', blurb: 'Your name is mud and constables know your face. Renown 12, already wanted.', set: { renown: 12 }, heat: 45, score: 1.3, stars: 1 },
	{ id: 'cursed', name: 'Cursed', glyph: '呪', blurb: 'A fox spirit you insulted. Crows follow you. Fortune starts at 10.', set: { fortune: 10 }, score: 1.25, stars: 1 },
	{ id: 'shipwrecked', name: 'Shipwrecked', glyph: '難', blurb: 'You wash ashore with nothing: no bag contents, no mount, every stat at 35.', set: { silver: 35, vigor: 35, renown: 35, fortune: 35 }, emptyBag: true, score: 1.35, stars: 2 },
	{ id: 'deaths-door', name: 'Death’s Door', glyph: '死', blurb: 'Fevered, broke, disgraced and cursed. Every stat at 12. Good luck. (lol)', set: { silver: 12, vigor: 12, renown: 12, fortune: 12 }, emptyBag: true, heat: 20, score: 2, stars: 3 }
];

export const HARDSHIP: Record<string, Hardship> = Object.fromEntries(HARDSHIPS.map((h) => [h.id, h]));

/** How a trait / calling tilts the run: -1 easier, +1 harder. Shown on cards in the creator. */
export const PERK_TILT: Record<string, -1 | 0 | 1> = {
	'iron-stomach': -1, lucky: -1, pathfinder: -1, herbalist: -1, polyglot: -1, frugal: -1, chronicler: -1, 'old-salt': -1, explorer: -1, survivor: -1, stargazer: -1, 'fox-blooded': -1,
	seasick: 1, superstitious: 1, tactless: 1, jinxed: 1, coward: 1, impious: 1, spendthrift: 1, directionless: 1, brute: 1, meticulous: 1, mercurial: 1, 'stone-heart': 1, romantic: 1, wanted: 1, glutton: 1, 'hot-blooded': 1, outlaw: 1, gambler: 1, bookworm: 1,
	merchant: -1, cartographer: -1, physician: -1, envoy: -1, pilgrim: 1, smuggler: 1, pirate: 0
};

export function runStars(difficulty: string, hardship: string, perks: string[]): number {
	const tilt = perks.reduce((s, p) => s + (PERK_TILT[p] ?? 0), 0);
	return Math.max(1, Math.min(8, DIFFICULTY[difficulty].stars + HARDSHIP[hardship].stars + Math.round(tilt / 2)));
}

export function scoreMult(difficulty: string, hardship: string, perks: string[]): number {
	const tilt = perks.reduce((s, p) => s + (PERK_TILT[p] ?? 0), 0);
	return Math.round(DIFFICULTY[difficulty].score * HARDSHIP[hardship].score * (1 + tilt * 0.05) * 100) / 100;
}
