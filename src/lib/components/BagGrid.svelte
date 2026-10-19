<script lang="ts">
	import { ITEMS } from '#lib/data/items';
	import { OUTFITS } from '#lib/data/market';
	import { autoPack, capacity, cellsUsed, gridOf, moveItem, rotateItem, shapeOf, syncGrid } from '#lib/game/bag';
	import { wear } from '#lib/game/market';
	import type { Run } from '#lib/game/types';

	let {
		run,
		locked = false,
		onuse,
		ondrop,
		onriddle,
		onwear
	}: { run: Run; locked?: boolean; onuse: (id: string) => void; ondrop: (id: string) => void; onriddle: (id: string) => void; onwear?: (id: string | 'none') => void } = $props();

	let sel = $state<number | null>(null);
	let msg = $state('');
	const g = $derived.by(() => {
		void run.bag.length;
		void run.grid;
		return gridOf(run);
	});
	const selPl = $derived(sel !== null ? run.grid?.[sel] : undefined);
	const selItem = $derived(selPl ? ITEMS[selPl.id] : undefined);
	const meticulous = $derived(run.hero.traits.includes('meticulous'));
	const CELL = 42;

	$effect(() => {
		if (run.bag.length !== (run.grid?.length ?? 0)) syncGrid(run);
	});

	function tapCell(pack: string, x: number, y: number) {
		if (locked) return;
		const here = g.cells.get(pack)?.[y]?.[x];
		if (here !== null && here !== undefined) {
			sel = sel === here ? null : here;
			msg = '';
			return;
		}
		if (sel === null) return;
		msg = moveItem(run, sel, pack, x, y) ? '' : 'It does not fit there.';
	}
	function toggleWear(id: string) {
		const next = run.outfit?.id === id ? 'none' : id;
		if (onwear) onwear(next);
		else wear(run, next);
		sel = null;
	}
	function rotate() {
		if (sel === null) return;
		msg = rotateItem(run, sel) ? '' : 'No room to turn it.';
	}
	function drag(e: DragEvent, i: number) {
		sel = i;
		e.dataTransfer?.setData('text/plain', String(i));
	}
	function drop(e: DragEvent, pack: string, x: number, y: number) {
		e.preventDefault();
		const i = Number(e.dataTransfer?.getData('text/plain'));
		if (Number.isFinite(i)) msg = moveItem(run, i, pack, x, y) ? '' : 'It does not fit there.';
	}

	interface TouchDrag {
		index: number;
		startX: number;
		startY: number;
		curX: number;
		curY: number;
		active: boolean;
		w: number;
		h: number;
		glyph?: string;
		kind?: string;
		rot?: boolean;
	}
	let touchDrag = $state<TouchDrag | null>(null);

	function onPointerDown(e: PointerEvent, i: number) {
		if (locked || e.button !== 0) return;
		const pl = run.grid?.[i];
		if (!pl) return;
		const [w, h] = shapeOf(pl.id, pl.r);
		const it = ITEMS[pl.id];
		touchDrag = {
			index: i,
			startX: e.clientX,
			startY: e.clientY,
			curX: e.clientX,
			curY: e.clientY,
			active: false,
			w,
			h,
			glyph: it?.glyph,
			kind: it?.kind,
			rot: !!(pl.r && w < h)
		};
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerCancel);
	}

	function onPointerMove(e: PointerEvent) {
		if (!touchDrag) return;
		touchDrag.curX = e.clientX;
		touchDrag.curY = e.clientY;
		const dist = Math.hypot(e.clientX - touchDrag.startX, e.clientY - touchDrag.startY);
		if (dist > 7) {
			touchDrag.active = true;
			sel = touchDrag.index;
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!touchDrag) return;
		if (touchDrag.active) {
			let placed = false;
			const grids = document.querySelectorAll<HTMLElement>('.grid[data-pack]');
			for (const gridEl of grids) {
				const rect = gridEl.getBoundingClientRect();
				if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
					const pack = gridEl.dataset.pack!;
					const x = Math.floor((e.clientX - rect.left) / CELL);
					const y = Math.floor((e.clientY - rect.top) / CELL);
					msg = moveItem(run, touchDrag.index, pack, x, y) ? '' : 'It does not fit there.';
					placed = true;
					break;
				}
			}
			if (!placed) msg = '';
		}
		cleanupPointer();
	}

	function onPointerCancel() {
		cleanupPointer();
	}

	function cleanupPointer() {
		touchDrag = null;
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerCancel);
	}
</script>

<div class="bagtop">
	<span class="muted">{cellsUsed(run)}/{capacity(run)} spaces · tap an item, then tap where it should go</span>
	{#if !locked}<button class="mini" onclick={() => ((sel = null), autoPack(run))}>⇲ Auto-pack</button>{/if}
</div>
{#if meticulous}
	<p class="tidy" class:bad={!run.flags.tidy}>整 {run.flags.tidy ? 'Perfectly packed. Your Meticulous soul is at peace (+vigor, +fortune each journey, +1 energy).' : 'There are gaps between your things. It is unbearable (−vigor, −fortune each journey).'}</p>
{/if}

<div class="packs">
	{#each g.packs as p (p.key)}
		{@const cells = g.cells.get(p.key)!}
		<div class="pack">
			<small>{p.glyph} {p.name}</small>
			<div class="grid" data-pack={p.key} style:width="{p.w * CELL}px" style:height="{p.h * CELL}px">
				{#each cells as row, y}
					{#each row as _c, x}
						<button class="cell" style:left="{x * CELL}px" style:top="{y * CELL}px" aria-label="Empty space" onclick={() => tapCell(p.key, x, y)} ondragover={(e) => e.preventDefault()} ondrop={(e) => drop(e, p.key, x, y)}></button>
					{/each}
				{/each}
				{#each run.grid ?? [] as pl, i (i + pl.id)}
					{#if pl.pack === p.key}
						{@const [w, h] = shapeOf(pl.id, pl.r)}
						{@const it = ITEMS[pl.id]}
						<button
							class="item"
							class:relic={it?.kind === 'relic'}
							class:curio={it?.kind === 'curio'}
							class:good={it?.kind === 'good'}
							class:outfit={it?.kind === 'outfit' || !!OUTFITS[pl.id]}
							class:worn={run.outfit?.id === pl.id}
							class:sel={sel === i}
							style:left="{pl.x * CELL + 2}px"
							style:top="{pl.y * CELL + 2}px"
							style:width="{w * CELL - 4}px"
							style:height="{h * CELL - 4}px"
							draggable={!locked}
							ondragstart={(e) => drag(e, i)}
							onpointerdown={(e) => onPointerDown(e, i)}
							onclick={() => tapCell(p.key, pl.x, pl.y)}
							title={it?.name}
						>
							<span class:rot={pl.r && w < h}>{it?.glyph}</span>
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>

{#if touchDrag && touchDrag.active}
	<div
		class="item ghost-drag"
		class:relic={touchDrag.kind === 'relic'}
		class:curio={touchDrag.kind === 'curio'}
		class:good={touchDrag.kind === 'good'}
		style:left="{touchDrag.curX - (touchDrag.w * CELL) / 2}px"
		style:top="{touchDrag.curY - (touchDrag.h * CELL) / 2}px"
		style:width="{touchDrag.w * CELL - 4}px"
		style:height="{touchDrag.h * CELL - 4}px"
	>
		<span class:rot={touchDrag.rot}>{touchDrag.glyph}</span>
	</div>
{/if}
{#if msg}<p class="msg">{msg}</p>{/if}

{#if selPl && selItem}
	<div class="detail">
		<span class="g">{selItem.glyph}</span>
		<span class="n">
			<b>
				{selItem.name}
				{#if run.outfit?.id === selPl.id}<small class="acc">(Wearing)</small>{/if}
			</b>
			<small>{selItem.desc}</small>
		</span>
		{#if !locked}
			<span class="act">
				<button onclick={rotate} title="Rotate">⟳</button>
				{#if selItem.use}<button onclick={() => (onuse(selPl.id), (sel = null))}>Use</button>{/if}
				{#if selPl.id.startsWith('treasure-map-')}<button onclick={() => onriddle(selPl.id)}>Solve</button>{/if}
				{#if selItem.kind === 'outfit' || OUTFITS[selPl.id]}
					<button onclick={() => toggleWear(selPl.id)}>
						{run.outfit?.id === selPl.id ? 'Take off' : 'Wear'}
					</button>
				{/if}
				{#if selItem.kind !== 'relic'}<button class="ghosty" onclick={() => (ondrop(selPl.id), (sel = null))}>Drop</button>{/if}
			</span>
		{/if}
	</div>
{/if}

<style>
	.bagtop {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		font-size: 0.8rem;
	}
	.mini {
		font: inherit;
		font-size: 0.78rem;
		padding: 3px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.tidy {
		font-size: 0.8rem;
		color: var(--jade);
		margin: 6px 0 0;
	}
	.tidy.bad {
		color: var(--vermilion);
	}
	.packs {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin: 10px 0;
	}
	.pack small {
		display: block;
		font-size: 0.75rem;
		color: var(--muted);
		margin-bottom: 3px;
	}
	.grid {
		position: relative;
		background: color-mix(in srgb, var(--paper) 80%, var(--ink));
		border: 2px solid color-mix(in srgb, var(--ink) 45%, transparent);
		border-radius: 6px;
		box-sizing: content-box;
	}
	.cell {
		position: absolute;
		width: 42px;
		height: 42px;
		border: 1px dashed color-mix(in srgb, var(--ink) 18%, transparent);
		background: transparent;
		padding: 0;
		cursor: pointer;
	}
	.item {
		position: absolute;
		display: grid;
		place-items: center;
		border-radius: 6px;
		border: 1px solid color-mix(in srgb, var(--ink) 40%, transparent);
		background: var(--paper);
		box-shadow: 0 1px 2px var(--shadow);
		font-size: 1.3rem;
		padding: 0;
		cursor: grab;
		touch-action: none;
		user-select: none;
		transition: left 0.15s, top 0.15s, width 0.15s, height 0.15s;
	}
	.ghost-drag {
		position: fixed;
		pointer-events: none;
		z-index: 1000;
		opacity: 0.92;
		box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
		transform: scale(1.06);
		transition: none;
	}
	.item.good {
		background: color-mix(in srgb, var(--gold) 22%, var(--paper));
	}
	.item.curio {
		background: color-mix(in srgb, var(--jade) 18%, var(--paper));
	}
	.item.relic {
		background: color-mix(in srgb, var(--vermilion) 16%, var(--paper));
		border-color: var(--gold);
	}
	.item.outfit {
		background: color-mix(in srgb, #8e24aa 14%, var(--paper));
		border-color: color-mix(in srgb, #8e24aa 40%, var(--line));
	}
	.item.worn {
		box-shadow: 0 0 0 2px var(--jade, #2e7d32);
	}
	.acc {
		color: var(--jade, #2e7d32);
		font-weight: 600;
	}
	.item.sel {
		outline: 2px solid var(--vermilion);
		outline-offset: 1px;
		z-index: 1;
	}
	.rot {
		transform: rotate(90deg);
	}
	.msg {
		font-size: 0.8rem;
		color: var(--vermilion);
		margin: 0;
	}
	.detail {
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 8px;
		border: 1px solid var(--line);
		border-radius: 10px;
	}
	.detail .g {
		font-size: 1.5rem;
	}
	.detail .n {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.detail small {
		color: var(--muted);
		font-size: 0.8rem;
	}
	.act {
		display: flex;
		gap: 4px;
	}
	.act button {
		font: inherit;
		font-size: 0.8rem;
		padding: 4px 8px;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		cursor: pointer;
	}
	.muted {
		color: var(--muted);
	}
</style>
