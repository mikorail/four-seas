// Tile luggage: every item has a shape, every bag is a grid. Pack, rotate, and (if Meticulous) keep it neat.
import { BAGS, ITEMS, MOUNTS } from '#lib/data/items';
import type { Run } from './types';

export interface Placed {
	id: string;
	pack: string; // 'main' | 'mount' | 'x0' | 'x1'
	x: number;
	y: number;
	r: boolean; // rotated 90°
}

export interface Pack {
	key: string;
	name: string;
	glyph: string;
	w: number;
	h: number;
}

/** Grid sizes for the main bag kinds and mounts. */
const BAG_DIM: Record<string, [number, number]> = { bundle: [2, 2], satchel: [3, 2], chest: [3, 3], trunk: [4, 3] };
const MOUNT_DIM: Record<string, [number, number]> = { donkey: [2, 1], mule: [2, 2], horse: [2, 1], camel: [3, 2], elephant: [4, 3], yak: [2, 2] };

/** Extra bags you can buy and strap on: one on foot, two with a mount. */
export const EXTRA_BAGS: Record<string, { name: string; glyph: string; w: number; h: number; price: number; desc: string; mount?: boolean }> = {
	pouch: { name: 'Belt pouch', glyph: '👛', w: 1, h: 2, price: 2, desc: 'Two small things, always at hand.' },
	basket: { name: 'Back basket', glyph: '🧺', w: 2, h: 2, price: 5, desc: 'Woven bamboo, worn like a backpack.' },
	saddlebags: { name: 'Saddlebags', glyph: '🎒', w: 3, h: 2, price: 7, desc: 'Leather panniers. Needs a mount.', mount: true }
};
export const maxExtraBags = (run: Pick<Run, 'mount'>) => (run.mount ? 2 : 1);

const SHAPE: Record<string, [number, number]> = {
	sword: [3, 1], 'cursed-blade': [3, 1], 'avenger-blade': [3, 1], 'curio-katana': [3, 1], 'koxinga-flag': [3, 1], 'curio-carpet': [3, 1],
	medicine: [2, 1], telescope: [2, 1], finery: [2, 1], 'balloon-plans': [2, 1], pistol: [2, 1], 'curio-thangka': [2, 1], 'curio-kris': [2, 1], 'curio-lacquer-box': [2, 1], 'hang-tuah-kris': [2, 1], 'emerald-sash': [2, 1], 'hunting-knife': [2, 1], 'heirloom-blade': [2, 1],
	'monk-robes': [2, 1], 'mandarin-robe': [2, 1], 'janissary-uniform': [2, 1], 'company-uniform': [2, 1], 'pirate-garb': [2, 1], 'merchant-silks': [2, 1], 'pilgrim-garb': [2, 1], 'scholar-robes': [2, 1], 'explorer-kit': [2, 1], 'local-dress': [2, 1],
	'silk-turban': [1, 1], 'beggar-rags': [1, 1],
	lantern: [1, 2], 'gold-idol': [1, 2], 'curio-celadon': [1, 2], 'curio-clock': [1, 2], 'curio-buddha': [1, 2], lockbox: [1, 2],
	camera: [2, 2], 'yeti-fur': [2, 2], 'curio-blue-white': [2, 2], 'curio-ivory-chess': [2, 2], 'curio-feather-cloak': [2, 2], 'samurai-armor': [2, 2]
};

export function shapeOf(id: string, r = false): [number, number] {
	const s = SHAPE[id] ?? (ITEMS[id]?.kind === 'good' || ITEMS[id]?.kind === 'outfit' ? [2, 1] : [1, 1]);
	return r ? [s[1], s[0]] : s;
}

export function packsOf(run: Pick<Run, 'bagKind' | 'mount'> & { extraBags?: string[] }): Pack[] {
	const b = BAGS[run.bagKind] ?? BAGS.bundle;
	const [w, h] = BAG_DIM[b.id] ?? [2, 2];
	const out: Pack[] = [{ key: 'main', name: b.name, glyph: b.glyph, w, h }];
	if (run.mount) {
		const [mw, mh] = MOUNT_DIM[run.mount.kind] ?? [2, 1];
		out.push({ key: 'mount', name: `${MOUNTS[run.mount.kind].name} packs`, glyph: MOUNTS[run.mount.kind].glyph, w: mw, h: mh });
	}
	(run.extraBags ?? []).slice(0, maxExtraBags(run)).forEach((k, i) => {
		const e = EXTRA_BAGS[k];
		if (e && (!e.mount || run.mount)) out.push({ key: 'x' + i, name: e.name, glyph: e.glyph, w: e.w, h: e.h });
	});
	return out;
}

export const capacity = (run: Pick<Run, 'bagKind' | 'mount'> & { extraBags?: string[] }) => packsOf(run).reduce((s, p) => s + p.w * p.h, 0);
export const cellsUsed = (run: Pick<Run, 'bag'>) => run.bag.reduce((s, id) => s + shapeOf(id)[0] * shapeOf(id)[1], 0);

type Grid = Map<string, (string | null)[][]>;

function emptyGrid(packs: Pack[]): Grid {
	return new Map(packs.map((p) => [p.key, Array.from({ length: p.h }, () => Array<string | null>(p.w).fill(null))]));
}

function fits(g: Grid, packs: Pack[], pl: Omit<Placed, 'id'> & { id: string }): boolean {
	const p = packs.find((x) => x.key === pl.pack);
	if (!p) return false;
	const [w, h] = shapeOf(pl.id, pl.r);
	if (pl.x < 0 || pl.y < 0 || pl.x + w > p.w || pl.y + h > p.h) return false;
	const cells = g.get(p.key)!;
	for (let y = pl.y; y < pl.y + h; y++) for (let x = pl.x; x < pl.x + w; x++) if (cells[y][x]) return false;
	return true;
}

function mark(g: Grid, pl: Placed, tag: string | null = pl.id) {
	const [w, h] = shapeOf(pl.id, pl.r);
	const cells = g.get(pl.pack)!;
	for (let y = pl.y; y < pl.y + h; y++) for (let x = pl.x; x < pl.x + w; x++) cells[y][x] = tag;
}

function firstFit(g: Grid, packs: Pack[], id: string): Placed | null {
	for (const p of packs)
		for (const r of [false, true])
			for (let y = 0; y < p.h; y++)
				for (let x = 0; x < p.w; x++) {
					const pl = { id, pack: p.key, x, y, r };
					if (fits(g, packs, pl)) return pl;
				}
	return null;
}

/** Reconcile run.grid with run.bag: keep valid placements, auto-place new items. Returns ids that do not fit. */
export function syncGrid(run: Run): string[] {
	const packs = packsOf(run);
	const g = emptyGrid(packs);
	const want: Record<string, number> = {};
	for (const id of run.bag) want[id] = (want[id] ?? 0) + 1;
	const kept: Placed[] = [];
	for (const pl of run.grid ?? []) {
		if (!want[pl.id]) continue;
		if (!fits(g, packs, pl)) continue;
		mark(g, pl);
		kept.push(pl);
		want[pl.id]--;
	}
	const overflow: string[] = [];
	for (const [id, n] of Object.entries(want))
		for (let i = 0; i < n; i++) {
			const pl = firstFit(g, packs, id);
			if (pl) {
				mark(g, pl);
				kept.push(pl);
			} else overflow.push(id);
		}
	run.grid = kept;
	run.flags.tidy = overflow.length === 0 && holes(run, g, packs) === 0;
	return overflow;
}

/** Empty cells with something to their right or below: a tidy bag is packed into the top-left corner. */
function holes(_run: Run, g: Grid, packs: Pack[]): number {
	let n = 0;
	for (const p of packs) {
		const c = g.get(p.key)!;
		for (let y = 0; y < p.h; y++)
			for (let x = 0; x < p.w; x++) {
				if (c[y][x]) continue;
				const row = c[y];
				const col = c.map((r) => r[x]);
				const after = (a: (string | null)[], i: number) => a.slice(i + 1).some(Boolean);
				if (after(row, x) || after(col, y)) n++;
			}
	}
	return n;
}

export function gridOf(run: Run): { packs: Pack[]; cells: Map<string, (number | null)[][]> } {
	const packs = packsOf(run);
	const cells = new Map(packs.map((p) => [p.key, Array.from({ length: p.h }, () => Array<number | null>(p.w).fill(null))]));
	(run.grid ?? []).forEach((pl, i) => {
		const c = cells.get(pl.pack);
		if (!c) return;
		const [w, h] = shapeOf(pl.id, pl.r);
		for (let y = pl.y; y < pl.y + h; y++) for (let x = pl.x; x < pl.x + w; x++) if (c[y]?.[x] !== undefined) c[y][x] = i;
	});
	return { packs, cells };
}

export function canFit(run: Run, id: string): boolean {
	const packs = packsOf(run);
	const g = emptyGrid(packs);
	for (const pl of run.grid ?? []) if (fits(g, packs, pl)) mark(g, pl);
	return !!firstFit(g, packs, id);
}

/** Move (and optionally rotate) placed item #i to pack/x/y. Returns false if it does not fit there. */
export function moveItem(run: Run, i: number, pack: string, x: number, y: number, r?: boolean): boolean {
	const grid = run.grid ?? [];
	const pl = grid[i];
	if (!pl) return false;
	const packs = packsOf(run);
	const g = emptyGrid(packs);
	grid.forEach((o, j) => j !== i && fits(g, packs, o) && mark(g, o));
	const next = { ...pl, pack, x, y, r: r ?? pl.r };
	if (!fits(g, packs, next)) return false;
	grid[i] = next;
	syncGrid(run);
	return true;
}

export function rotateItem(run: Run, i: number): boolean {
	const pl = run.grid?.[i];
	if (!pl) return false;
	return moveItem(run, i, pl.pack, pl.x, pl.y, !pl.r);
}

/** Repack everything, biggest first, row by row — always tidy if it fits. */
export function autoPack(run: Run) {
	const order = [...run.bag].sort((a, b) => shapeOf(b)[0] * shapeOf(b)[1] - shapeOf(a)[0] * shapeOf(a)[1]);
	run.grid = [];
	run.bag = order;
	syncGrid(run);
}
