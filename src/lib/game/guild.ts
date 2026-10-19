import { Rng } from '#lib/rng';
import { CITY, EDGES, cityName, edgeExists, shortestDays, shortestPath } from '#lib/data/world';
import { canFit, syncGrid } from './bag';
import type { Run } from './types';

export interface GuildRankDef {
	rank: number;
	title: string;
	minVolume: number;
	discount: number;
	maxSlotBonus: number;
}

export const GUILD_RANKS: GuildRankDef[] = [
	{ rank: 0, title: 'Unlicensed Peddler', minVolume: 0, discount: 0, maxSlotBonus: 0 },
	{ rank: 1, title: 'Registered Factor', minVolume: 40, discount: 0.03, maxSlotBonus: 2 },
	{ rank: 2, title: 'Sworn Merchant', minVolume: 100, discount: 0.06, maxSlotBonus: 4 },
	{ rank: 3, title: 'Chamber Syndic', minVolume: 200, discount: 0.09, maxSlotBonus: 6 },
	{ rank: 4, title: 'Consul of the Scales', minVolume: 350, discount: 0.12, maxSlotBonus: 8 },
	{ rank: 5, title: 'Grand Elder of the Guild', minVolume: 550, discount: 0.15, maxSlotBonus: 10 }
];

export const MAX_WAREHOUSE_CITIES = 3;

export function guildVolume(run: Run): number {
	const raw = run.flags?.['guild:vol'];
	if (typeof raw === 'number' && Number.isFinite(raw)) {
		return Math.max(0, Math.round(raw));
	}
	const explicit = (run as { guild?: number }).guild;
	if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
		const idx = Math.max(0, Math.min(GUILD_RANKS.length - 1, Math.floor(explicit)));
		return GUILD_RANKS[idx].minVolume;
	}
	return 0;
}

export function guildRank(run: Run): number {
	const hasVolFlag = typeof run.flags?.['guild:vol'] === 'number' && Number.isFinite(run.flags['guild:vol']);
	const explicit = (run as { guild?: number }).guild;
	if (!hasVolFlag && typeof explicit === 'number' && Number.isFinite(explicit)) {
		return Math.max(0, Math.min(GUILD_RANKS.length - 1, Math.floor(explicit)));
	}
	const vol = guildVolume(run);
	let rank = 0;
	for (const def of GUILD_RANKS) {
		if (vol >= def.minVolume) rank = def.rank;
	}
	return rank;
}

export function guildTitle(run: Run): string {
	return GUILD_RANKS[guildRank(run)]?.title ?? GUILD_RANKS[0].title;
}

export function guildDiscount(run: Run): number {
	return GUILD_RANKS[guildRank(run)]?.discount ?? 0;
}

export function recordGuildTrade(run: Run, silverVolume: number, notes?: string[]): number {
	const prevRank = guildRank(run);
	const added = Math.max(0, Math.round(silverVolume));
	const nextVol = guildVolume(run) + added;
	run.flags['guild:vol'] = nextVol;
	const nextRank = guildRank(run);
	(run as { guild?: number }).guild = nextRank;
	if (nextRank > prevRank) {
		const bump = (nextRank - prevRank) * 6;
		run.factions ??= { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 };
		run.factions.guild = Math.max(-100, Math.min(100, (run.factions.guild ?? 0) + bump));
		if (notes) {
			notes.push(`⚖️ Guild rank increased to **${guildTitle(run)}** (Rank ${nextRank}).`);
		}
	}
	return nextRank;
}

export function warehouseCapacity(run: Run): number {
	return 4 + guildRank(run) * 2;
}

function cleanWarehouse(run: Run) {
	if (!run.warehouse) return;
	for (const city of Object.keys(run.warehouse)) {
		if (!Array.isArray(run.warehouse[city]) || run.warehouse[city].length === 0) {
			delete run.warehouse[city];
		}
	}
}

export function warehouseCities(run: Run): string[] {
	if (!run.warehouse) return [];
	return Object.entries(run.warehouse)
		.filter(([, items]) => Array.isArray(items) && items.length > 0)
		.map(([city]) => city);
}

export function warehouseAt(run: Run, city = run.location): string[] {
	return run.warehouse?.[city] ? [...run.warehouse[city]] : [];
}

export function canStore(run: Run, itemId: string, city = run.location): boolean {
	if (!city || !CITY[city]) return false;
	if (!run.bag.includes(itemId)) return false;
	const storedHere = run.warehouse?.[city] ?? [];
	if (storedHere.length >= warehouseCapacity(run)) return false;
	const activeCities = warehouseCities(run);
	if (!activeCities.includes(city) && activeCities.length >= MAX_WAREHOUSE_CITIES) return false;
	return true;
}

export function store(run: Run, itemId: string, city = run.location): boolean {
	if (!canStore(run, itemId, city)) return false;
	const idx = run.bag.indexOf(itemId);
	if (idx < 0) return false;
	run.bag.splice(idx, 1);
	run.warehouse ??= {};
	run.warehouse[city] ??= [];
	run.warehouse[city].push(itemId);
	cleanWarehouse(run);
	syncGrid(run);
	return true;
}

export const storeInWarehouse = store;

export function retrieve(run: Run, itemId: string, city = run.location): boolean {
	const list = run.warehouse?.[city];
	if (!list || list.length === 0) return false;
	const idx = list.indexOf(itemId);
	if (idx < 0) return false;
	if (!canFit(run, itemId)) return false;
	list.splice(idx, 1);
	cleanWarehouse(run);
	run.bag.push(itemId);
	syncGrid(run);
	return true;
}

export const retrieveFromWarehouse = retrieve;

function pathUsesSea(fromCity: string, toCity: string, year: number): boolean {
	const path = shortestPath(fromCity, toCity, year);
	for (let i = 0; i < path.length - 1; i++) {
		const u = path[i];
		const v = path[i + 1];
		const matching = EDGES.filter(
			(e) => !e.secret && edgeExists(e, year) && ((e.a === u && e.b === v) || (e.a === v && e.b === u))
		);
		if (matching.length > 0 && matching.every((e) => e.mode === 'sea')) {
			return true;
		}
	}
	return false;
}

export function shipTo(
	run: Run,
	itemId: string,
	fromCity: string,
	toCity: string
): { ok: boolean; cost: number; days: number; lost?: boolean; reason?: string } {
	if (!fromCity || !toCity || !CITY[fromCity] || !CITY[toCity]) {
		return { ok: false, cost: 0, days: 0, reason: 'Invalid city.' };
	}
	if (fromCity === toCity) {
		return { ok: false, cost: 0, days: 0, reason: 'Origin and destination are the same city.' };
	}
	const src = run.warehouse?.[fromCity];
	if (!src || !src.includes(itemId)) {
		return { ok: false, cost: 0, days: 0, reason: `Item is not stored in ${cityName(CITY[fromCity], run.year)}.` };
	}
	const dst = run.warehouse?.[toCity] ?? [];
	if (dst.length >= warehouseCapacity(run)) {
		return { ok: false, cost: 0, days: 0, reason: `Warehouse in ${cityName(CITY[toCity], run.year)} is at capacity.` };
	}
	const activeCities = warehouseCities(run);
	if (!activeCities.includes(toCity) && activeCities.length >= MAX_WAREHOUSE_CITIES) {
		return { ok: false, cost: 0, days: 0, reason: `Cannot store goods in more than ${MAX_WAREHOUSE_CITIES} cities at once.` };
	}

	const dist = shortestDays(fromCity, run.year);
	const days = Math.max(1, dist[toCity] ?? 14);
	const cost = Math.max(2, Math.round(days * 0.35 * (1 - guildDiscount(run))));

	if (run.stats.silver <= cost) {
		return { ok: false, cost, days, reason: 'Not enough silver to cover shipping fees.' };
	}

	run.stats.silver -= cost;
	recordGuildTrade(run, cost);

	const idx = src.indexOf(itemId);
	src.splice(idx, 1);

	const rank = guildRank(run);
	const seaLeg = pathUsesSea(fromCity, toCity, run.year);
	const lossRisk = rank >= 4 || !seaLeg ? 0 : Math.max(0, 0.08 - rank * 0.015);
	const rng = new Rng((run.rng = (run.rng + 0x6d2b79f5) | 0));
	const lost = lossRisk > 0 && rng.chance(lossRisk);

	if (!lost) {
		run.warehouse ??= {};
		run.warehouse[toCity] ??= [];
		run.warehouse[toCity].push(itemId);
	}
	cleanWarehouse(run);

	return { ok: true, cost, days, lost };
}
