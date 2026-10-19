<script lang="ts">
	import { untrack } from 'svelte';
	// Mahjong-tile memory: find all pairs before you run out of misses.
	let { onend, seed }: { onend: (won: boolean) => void; seed: number } = $props();
	const FACES = ['🀄', '🀅', '🀆', '🀇', '🀙', '🀐', '🀀', '🀃'];
	let rnd = untrack(() => seed); // seeded once per game
	const r = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648);
	const deck = FACES.slice(0, 6).flatMap((f) => [f, f]).sort(() => r() - 0.5);
	let open = $state<number[]>([]);
	let done = $state<number[]>([]);
	let misses = $state(0);
	const MAX = 6;
	let busy = false;
	function flip(i: number) {
		if (busy || open.includes(i) || done.includes(i) || misses >= MAX) return;
		open = [...open, i];
		if (open.length === 2) {
			busy = true;
			const [a, b] = open;
			setTimeout(() => {
				if (deck[a] === deck[b]) done = [...done, a, b];
				else misses++;
				open = [];
				busy = false;
				if (done.length === deck.length) onend(true);
				else if (misses >= MAX) onend(false);
			}, 600);
		}
	}
</script>

<p class="rule">Find all six pairs of tiles. You may miss {MAX - misses} more time{MAX - misses === 1 ? '' : 's'}.</p>
<div class="board" role="grid" aria-label="Mahjong tiles">
	{#each deck as f, i}
		<button class="tile" class:up={open.includes(i) || done.includes(i)} class:done={done.includes(i)} onclick={() => flip(i)} aria-label={open.includes(i) || done.includes(i) ? f : 'Hidden tile'}>
			{open.includes(i) || done.includes(i) ? f : ''}
		</button>
	{/each}
</div>

<style>
	.rule { text-align: center; margin: 0 0 10px; }
	.board { display: grid; grid-template-columns: repeat(4, 56px); gap: 8px; justify-content: center; }
	.tile { width: 56px; height: 72px; border-radius: 8px; border: 2px solid var(--ink); background: var(--z-pattern-gold, none) center/14px, linear-gradient(160deg, var(--jade), color-mix(in srgb, var(--jade) 55%, var(--ink))); font-size: 2.2rem; cursor: pointer; color: var(--ink); box-shadow: 0 3px 0 color-mix(in srgb, var(--ink) 60%, transparent); }
	.tile.up { background: var(--card); }
	.tile.done { opacity: 0.55; }
</style>
