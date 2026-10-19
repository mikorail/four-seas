// Political turmoil — uprisings, contested successions, wars, riots — makes roads slower, cuts some of them,
// and throws up work for a traveller: messages to carry, fugitives to hunt, treasure to find.
import { hashString } from '#lib/rng';
import { CITY } from '#lib/data/world';
import { UPRISINGS } from './cards/rebellion';
import { deathAt } from './events';
import type { Run } from './types';

export interface Turmoil {
	kind: 'uprising' | 'succession' | 'war' | 'riot';
	label: string;
	glyph: string;
}

/** What political trouble (if any) a city is in right now. */
export function turmoilAt(run: Pick<Run, 'world' | 'year' | 'flags'>, cityId: string): Turmoil | null {
	const city = CITY[cityId];
	if (!city) return null;
	const u = UPRISINGS.find((x) => run.year >= x.from && run.year <= x.until && x.cities.includes(cityId) && !run.flags['revdone:' + x.id]);
	if (u) return { kind: 'uprising', label: u.name, glyph: '⚑' };
	const d = deathAt(run as Run, cityId);
	if (d?.data?.royal) return { kind: 'succession', label: 'Succession crisis', glyph: '👑' };
	if (d && !d.data?.popular) return { kind: 'riot', label: 'Riots', glyph: '🔥' };
	return null;
}

/** Turmoil slows every road through it; some land roads are held outright (stable for a month at a time). */
export function turmoilRoad(run: Pick<Run, 'world' | 'year' | 'flags' | 'day' | 'seed'>, a: string, b: string, mode: string): { slow: number; closed: boolean; t: Turmoil } | null {
	const t = turmoilAt(run, b) ?? turmoilAt(run, a);
	if (!t) return null;
	const month = Math.floor(run.day / 30);
	const held = mode !== 'sea' && t.kind !== 'war' && hashString(`${run.seed}:${a}:${b}:${month}`) % 100 < (t.kind === 'uprising' ? 40 : 25);
	return { slow: t.kind === 'uprising' ? 1.3 : t.kind === 'war' ? 1.25 : 1.2, closed: held, t };
}

export const turmoilWarning = (r: { t: Turmoil; closed: boolean }) => `${r.t.glyph} ${r.closed ? `road held — ${r.t.label.toLowerCase()}` : `${r.t.label}: checkpoints`}`;
