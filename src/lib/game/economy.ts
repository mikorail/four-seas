import { hashString } from '#lib/rng';
import { CITIES, CITY, cityExists, kmBetween, type Good, type Route } from '#lib/data/world';
import type { CultureId } from '#lib/data/cultures';
import type { Run } from './types';

// ---------- calendar & seasons ----------

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthOf(run: Run, day = run.day): number {
	return (run.month0 + Math.floor(day / 30)) % 12;
}

const TYPHOON: CultureId[] = ['han', 'japanese', 'korean', 'viet', 'malay'];
const MONSOON: CultureId[] = ['indian', 'persian', 'swahili', 'malay', 'siamese'];
const WINTER: CultureId[] = ['steppe', 'tibetan', 'korean', 'european'];

export interface Season {
	id: 'typhoon' | 'monsoon' | 'winter' | 'fair';
	label: string;
	glyph: string;
	days: number; // travel multiplier
	risk: number; // 0..1 extra danger weight
}

export function seasonFor(route: Pick<Route, 'from' | 'to' | 'mode'>, month: number): Season {
	const cs = [CITY[route.from].culture, CITY[route.to].culture];
	if (route.mode === 'sea' && month >= 6 && month <= 9 && cs.some((c) => TYPHOON.includes(c)) && !cs.every((c) => MONSOON.includes(c)))
		return { id: 'typhoon', label: 'Typhoon season', glyph: '🌀', days: 1.15, risk: 0.6 };
	if (route.mode === 'sea' && month >= 5 && month <= 8 && cs.some((c) => MONSOON.includes(c)))
		return { id: 'monsoon', label: 'Monsoon', glyph: '🌧️', days: 1.2, risk: 0.5 };
	if (route.mode === 'land' && (month === 11 || month <= 1) && cs.some((c) => WINTER.includes(c)))
		return { id: 'winter', label: 'Deep winter', glyph: '❄️', days: 1.3, risk: 0.4 };
	return { id: 'fair', label: 'Fair weather', glyph: '☀️', days: 1, risk: 0 };
}

export function seasonName(month: number): string {
	return month <= 1 || month === 11 ? 'Winter' : month <= 4 ? 'Spring' : month <= 7 ? 'Summer' : 'Autumn';
}

// ---------- prices ----------

function noise(key: string) {
	return (hashString(key) % 1000) / 1000; // 0..1
}

/** Distance (km) from the nearest city that exports this good. */
function sourceDistance(good: Good, cityId: string, year: number) {
	let best = Infinity;
	for (const c of CITIES) if (c.exports === good && cityExists(c, year)) best = Math.min(best, c.id === cityId ? 0 : kmBetween(c.id, cityId));
	return best === Infinity ? 6000 : best;
}

/** Sale price of one load of `good` in `cityId` right now. */
export function sellPrice(run: Run, good: Good, cityId: string): number {
	const km = sourceDistance(good, cityId, run.year);
	const base = 6 + Math.min(26, km / 320);
	const season = Math.floor(run.day / 30);
	const wobble = 0.75 + noise(`${run.seed}:${good}:${cityId}:${season}`) * 0.55;
	const boom = run.flags['boom:' + good] && Number(run.flags['boomUntil:' + good]) > run.day ? 1.7 : 1;
	const standing = (run.standing?.[CITY[cityId].culture] ?? 0) / 400; // friends pay more
	return Math.max(3, Math.round(base * wobble * boom * (1 + standing)));
}

export function buyPrice(run: Run, good: Good, cityId: string): number {
	const local = CITY[cityId].exports === good;
	const standing = (run.standing?.[CITY[cityId].culture] ?? 0) / 400; // friends sell cheaper
	const p = local ? 5 + noise(`${run.seed}:buy:${good}:${cityId}`) * 5 : sellPrice(run, good, cityId) * 1.25;
	return Math.max(3, Math.round(p * (1 - standing)));
}
