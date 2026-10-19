<script lang="ts">
	import { untrack } from 'svelte';
	// Hanafuda, simplified koi-koi: play a card; if a table card shares its month, capture both.
	let { onend, seed }: { onend: (won: boolean) => void; seed: number } = $props();
	const MONTHS = ['🌲 Pine', '🌸 Plum', '🌸 Cherry', '💜 Wisteria', '🌼 Iris', '🦋 Peony', '🐗 Clover', '🌕 Pampas', '🍶 Chrysanthemum', '🍁 Maple', '☔ Willow', '🌾 Paulownia'];
	type C = { m: number; pts: number };
	let rnd = untrack(() => seed); // seeded once per game
	const r = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648);
	const all: C[] = [];
	for (let m = 0; m < 12; m++) for (const pts of [20, 10, 5, 1]) all.push({ m, pts: m % 3 === 0 || pts !== 20 ? pts : 10 });
	const deck = all.sort(() => r() - 0.5);
	let hand = $state(deck.splice(0, 5));
	let ai = deck.splice(0, 5);
	let table = $state(deck.splice(0, 6));
	let mine = $state(0);
	let theirs = $state(0);
	let log = $state('Play a card. Capture table cards of the same month.');
	function take(card: C, who: 'me' | 'ai') {
		const i = table.findIndex((t) => t.m === card.m);
		if (i >= 0) {
			const got = card.pts + table[i].pts;
			table = table.filter((_, j) => j !== i);
			if (who === 'me') mine += got;
			else theirs += got;
			return got;
		}
		table = [...table, card];
		return 0;
	}
	function play(i: number) {
		const card = hand[i];
		hand = hand.filter((_, j) => j !== i);
		const g = take(card, 'me');
		// opponent: capture the most points it can, else discard its smallest card
		let best = -1;
		let bi = 0;
		ai.forEach((c, j) => {
			const t = table.find((x) => x.m === c.m);
			const v = t ? c.pts + t.pts : -c.pts;
			if (v > best) {
				best = v;
				bi = j;
			}
		});
		const theirCard = ai.splice(bi, 1)[0];
		const tg = take(theirCard, 'ai');
		log = `You ${g ? `captured ${g}` : 'discarded'} · They ${tg ? `captured ${tg}` : 'discarded'}`;
		if (!hand.length) setTimeout(() => onend(mine >= theirs), 700);
	}
</script>

<p class="rule">{log} · <b>You {mine}</b> · They {theirs}</p>
<div class="table" aria-label="Table">{#each table as t}<span class="card">{MONTHS[t.m]}<small>{t.pts}</small></span>{/each}</div>
<div class="hand" aria-label="Your hand">
	{#each hand as c, i}
		<button class="card mine" class:match={table.some((t) => t.m === c.m)} onclick={() => play(i)}>{MONTHS[c.m]}<small>{c.pts}</small></button>
	{/each}
</div>

<style>
	.rule { text-align: center; margin: 0 0 10px; }
	.table, .hand { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 8px 0; }
	.card { display: flex; flex-direction: column; align-items: center; width: 74px; padding: 6px 2px; border-radius: 6px; border: 1.5px solid var(--ink); background: var(--card); color: var(--ink); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--vermilion) 18%, transparent); font: inherit; font-size: 0.75rem; }
	.card small { font-weight: 700; color: var(--vermilion); }
	.mine { cursor: pointer; background: color-mix(in srgb, var(--gold) 10%, var(--card)); }
	.mine.match { border-color: var(--vermilion); box-shadow: 0 0 0 2px color-mix(in srgb, var(--vermilion) 30%, transparent); }
</style>
