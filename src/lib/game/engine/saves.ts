import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate';
import { CITY } from '#lib/data/world';
import { STATS } from '#lib/data/traits';
import { CULTURE_FAITH } from '#lib/data/faiths';
import { baseVoices } from '#lib/data/voices';
import { startingSkills } from '#lib/data/skills';
import { syncGrid } from '../bag';
import type { Run } from '../types';
import { availableRoutes } from './arrival';
import { ensureRivalPerson, log } from './utils';

const KEY = 'four-seas:run';
/** Bump when the shape of a saved run changes, and add a step to MIGRATIONS. */
export const SCHEMA = 4;

export const serializePlain = (run: Run) =>
	JSON.stringify({ ...run, schema: SCHEMA }, (_k, v) => (v === Infinity ? '__inf' : v));

export function compressSave(json: string): string {
	const bytes = zlibSync(strToU8(json));
	let bin = '';
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin);
}

export function decompressSave(text: string): string {
	const trimmed = text.trim();
	if (trimmed.startsWith('{')) return trimmed;
	const bin = atob(trimmed);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return strFromU8(unzlibSync(bytes));
}

export const serialize = (run: Run) => compressSave(serializePlain(run));

let lastSaveToast: string | null = null;

/** Consume the latest storage warning toast, if any. */
export function consumeSaveToast(): string | null {
	const msg = lastSaveToast;
	lastSaveToast = null;
	return msg;
}

export function save(run: Run | null) {
	if (!run) {
		try {
			localStorage.removeItem(KEY);
		} catch {}
		return;
	}
	try {
		localStorage.setItem(KEY, serialize(run));
	} catch {
		// On QuotaExceededError: drop restore points and undo snapshot, trim log/trend, retry, and show a toast.
		run.restorePoints = [];
		run.undo = null;
		if (run.log && run.log.length > 40) run.log = run.log.slice(0, 40);
		if (run.trend && run.trend.length > 60) run.trend = run.trend.slice(-60);
		lastSaveToast = 'Storage space was low: older restore points were cleared to keep saving your journey.';
		try {
			if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
				window.dispatchEvent(new CustomEvent('four-seas:toast', { detail: lastSaveToast }));
			}
		} catch {}
		try {
			localStorage.setItem(KEY, serialize(run));
		} catch {}
	}
}

/** Each step upgrades a save from schema n to n+1. Never edit a step once released — add a new one. */
export const MIGRATIONS: Record<number, (r: Run) => void> = {
	// 1 → 2: everything added on 2026-10-13 (difficulty, faith, karma, standing, ventures, dynasty, world events)
	1: (r) => {
		r.difficulty ??= 'courier';
		r.hardship ??= 'none';
		r.scoreMult ??= 1;
		r.quests ??= [];
		r.pilgrimages ??= [];
		r.hero.faith ??= CULTURE_FAITH[r.hero.culture];
		r.hero.ideal ??= 'harmony';
		r.karma ??= 0;
		r.ties ??= [];
		r.standing ??= { [r.hero.culture]: 20 };
		r.ventures ??= [];
		r.treasury ??= 0;
		r.lineage ??= [];
		r.generation ??= 1;
		r.world ??= [];
	},
	// 2 → 3: romance, tile bag, voices, mind, cabinet, people met
	2: (r) => {
		r.romance ??= null;
		r.extraBags ??= [];
		r.hero.voices ??= baseVoices(r.hero.profession, r.hero.traits);
		r.mind ??= 70;
		r.apathy ??= 0;
		r.cabinet ??= { found: [], slots: [], done: [] };
		r.people ??= [];
		r.langs ??= {};
		r.repertoire ??= [];
		r.xp ??= {};
	},
	// 3 → 4: life skills, life goals, letters, home, titles, collections, trade memory
	3: (r) => {
		r.skills ??= startingSkills(r.hero.profession, r.hero.traits);
		r.letters ??= [];
		r.titles ??= [];
		r.collected ??= {};
		r.priceMemory ??= {};
		r.restorePoints ??= [];
	}
};

/** Parse and upgrade a saved run (compressed or plain JSON). Returns null if it is not a Four Seas save. */
export function parseRun(text: string): Run | null {
	try {
		const raw = decompressSave(text);
		const r = JSON.parse(raw, (_k, v) => (v === '__inf' ? Infinity : v)) as Run & { schema?: number };
		if (r?.version !== 2 || !r.hero || !r.stats || !r.location) return null;
		let v = r.schema ?? 1;
		while (v < SCHEMA) {
			MIGRATIONS[v]?.(r);
			v++;
		}
		r.schema = SCHEMA;
		r.warehouse ??= {};
		ensureRivalPerson(r);
		try {
			syncGrid(r);
		} catch {
			r.grid = [];
		}
		repairRun(r);
		return r;
	} catch {
		return null;
	}
}

export function load(): Run | null {
	try {
		const s = localStorage.getItem(KEY);
		return s ? parseRun(s) : null;
	} catch {
		return null;
	}
}

/** A save file the player can keep or move to another device (compressed with fflate). */
export const exportRun = (run: Run) => serialize(run);

/** Load a save file; returns the run (and stores it) or null if the file is not a valid save. */
export function importRun(text: string): Run | null {
	const r = parseRun(text);
	if (r) save(r);
	return r;
}

/**
 * Fix states a journey should never be stuck in (from old saves, interrupted updates or bugs):
 * a town or road with no card to play, travel without a road, an "ended" journey with no ending.
 * Returns what was repaired, for the log.
 */
export function repairRun(run: Run): string[] {
	const fixed: string[] = [];
	if (!CITY[run.location]) {
		run.location = CITY[run.hero.home] ? run.hero.home : run.visited.find((id) => CITY[id]) ?? 'guangzhou';
		fixed.push('location');
	}
	run.deck = (run.deck ?? []).filter((c) => c && c.npc && c.left && c.right && typeof c.text === 'string');
	if (run.phase === 'travel' && (!run.route || !CITY[run.route.to])) {
		run.route = null;
		run.phase = 'map';
		run.deck = [];
		fixed.push('travel without a road');
	}
	if (run.phase === 'travel' && run.route && run.deck.length === 0) {
		// finish the road you were on
		run.location = run.route.to;
		if (!run.visited.includes(run.location)) run.visited.push(run.location);
		run.route = null;
		run.phase = 'map';
		fixed.push('empty road');
	}
	if (run.phase === 'city' && run.deck.length === 0) {
		run.phase = 'map';
		fixed.push('empty town');
	}
	if (run.phase === 'end' && !run.ending) {
		run.phase = 'map';
		fixed.push('ended without an ending');
	}
	if (!['map', 'city', 'travel', 'end'].includes(run.phase)) {
		run.phase = 'map';
		fixed.push('unknown phase');
	}
	if (run.phase === 'map' && availableRoutes(run).length === 0) {
		const home = CITY[run.hero.home] ? run.hero.home : 'guangzhou';
		if (home !== run.location) {
			run.location = home;
			fixed.push('stranded');
		}
	}
	for (const s of STATS)
		if (!Number.isFinite(run.stats[s])) {
			run.stats[s] = 50;
			fixed.push(s);
		}
	run.deckTotal = Math.max(run.deckTotal ?? 0, run.deck.length);
	if (fixed.length) log(run, `(The road was untangled: ${fixed.join(', ')}.)`);
	return fixed;
}
