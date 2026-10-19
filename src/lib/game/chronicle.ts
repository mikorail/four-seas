import { PERK } from '#lib/data/traits';
import { ITEMS } from '#lib/data/items';
import type { EndingKind, Run } from './types';
import { endingCause, score } from './engine';

export interface Chronicle {
	runs: number;
	wins: number;
	deaths: number;
	best: number;
	endings: Partial<Record<EndingKind, number>>;
	legends: string[];
	cities: string[];
	relics: string[];
	secrets: string[];
	rarities?: string[]; // rare events met
	graves?: import('./types').Grave[]; // where past travellers lie
	thoughts?: string[]; // thoughts ever internalized
	daily: Record<string, number>;
	history: { seed: string; name: string; year: number; ending: string; score: number; day: number }[];
	recorded: string[]; // run keys already counted
}

const KEY = 'four-seas:chronicle';

const empty = (): Chronicle => ({ runs: 0, wins: 0, deaths: 0, best: 0, endings: {}, legends: [], cities: [], relics: [], secrets: [], daily: {}, history: [], recorded: [] });

export function loadChronicle(): Chronicle {
	try {
		const s = localStorage.getItem(KEY);
		return s ? { ...empty(), ...JSON.parse(s) } : empty();
	} catch {
		return empty();
	}
}

function saveChronicle(c: Chronicle) {
	try {
		localStorage.setItem(KEY, JSON.stringify(c));
	} catch {}
}

const uniq = (a: string[]) => [...new Set(a)];

/** Count a finished run once. Returns newly unlocked perk ids. */
export function recordRun(run: Run): string[] {
	const c = loadChronicle();
	const key = `${run.seed}:${run.hero.name}:${run.year}`;
	if (!run.ending || c.recorded.includes(key)) return [];
	const before = unlockedSet(c);
	const sc = score(run);
	c.recorded = [...c.recorded, key].slice(-200);
	c.runs++;
	if (run.ending.won) c.wins++;
	else c.deaths++;
	c.best = Math.max(c.best, sc);
	c.endings[run.ending.kind] = (c.endings[run.ending.kind] ?? 0) + 1;
	c.legends = uniq([...c.legends, ...run.legends]);
	c.cities = uniq([...c.cities, ...run.visited]);
	c.relics = uniq([...c.relics, ...run.bag.filter((id) => ITEMS[id]?.kind === 'relic')]);
	c.secrets = uniq([...(c.secrets ?? []), ...Object.keys(run.flags).filter((k) => k.startsWith('secret:')).map((k) => k.slice(7))]);
	c.rarities = uniq([...(c.rarities ?? []), ...Object.keys(run.flags).filter((k) => k.startsWith('rare:')).map((k) => k.slice(5))]);
	c.thoughts = uniq([...(c.thoughts ?? []), ...(run.cabinet?.done ?? [])]);
	if (run.daily) c.daily[run.seed] = Math.max(c.daily[run.seed] ?? 0, sc);
	// Bones of the Road: the dead (and the settled) stay where they ended
	if (!run.ending.won || ['settled', 'retired'].includes(run.ending.kind)) {
		const relic = run.bag.find((id) => ITEMS[id]?.kind === 'relic') ?? run.bag.find((id) => ITEMS[id]?.kind === 'curio' || ITEMS[id]?.kind === 'gear');
		const tip = endingCause(run)?.tip ?? '';
		c.graves = [
			{ id: key, name: run.hero.name, culture: run.hero.culture, gender: run.hero.gender, seed: run.hero.seed, city: run.location, year: run.year + Math.floor(run.day / 365), title: run.ending.title, kind: run.ending.kind, lesson: tip.split('. ')[0], relic, commission: run.delivered ? undefined : { item: run.item, to: run.destination }, settled: run.ending.won },
			...(c.graves ?? []).filter((g) => g.id !== key)
		].slice(0, 40);
	}
	c.history = [{ seed: run.seed, name: run.hero.name, year: run.year, ending: run.ending.title, score: sc, day: run.day }, ...c.history].slice(0, 30);
	saveChronicle(c);
	const after = unlockedSet(c);
	return [...after].filter((id) => !before.has(id));
}

const RULES: Record<string, (c: Chronicle) => boolean> = {
	'fox-blooded': (c) => c.legends.includes('kitsune'),
	'old-salt': (c) => c.cities.length >= 25,
	survivor: (c) => c.deaths >= 5,
	chronicler: (c) => c.wins >= 1,
	outlaw: (c) => (c.endings.jailed ?? 0) >= 1,
	pirate: (c) => c.legends.includes('koxinga') || c.legends.includes('ching-shih'),
	explorer: (c) => c.cities.length >= 40
};

function unlockedSet(c: Chronicle) {
	return new Set(Object.keys(RULES).filter((id) => RULES[id](c)));
}

export function isUnlocked(id: string, c: Chronicle = loadChronicle()): boolean {
	const p = PERK[id];
	if (!p?.unlock) return true;
	return RULES[id]?.(c) ?? false;
}
