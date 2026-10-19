<script lang="ts">
	import { CITY, cityName } from '#lib/data/world';
	import { riddleOf, solveRiddle } from '#lib/game/market';
	import type { Run } from '#lib/game/types';
	import { themeStyle } from '#lib/data/themes';

	let { run, item, onclose }: { run: Run; item: string; onclose: () => void } = $props();
	const r = $derived(riddleOf(item));
	let result = $state<boolean | null>(null);
	let guess = $state<string | null>(null);

	function pick(id: string) {
		guess = id;
		result = solveRiddle(run, item, id);
	}
</script>

<div class="scrim" onclick={onclose} role="presentation"></div>
<div class="riddle themed" style={themeStyle(CITY[run.location].culture)} role="dialog" aria-label="Riddle map">
	<h3>🗺️ The riddle map</h3>
	{#if r}
		<blockquote>“{r.clue}”</blockquote>
		{#if result === null}
			<p class="muted small">Where does it lead? Choose carefully: a wrong guess and you will have dug up the map’s meaning for nothing. (Scholars at an academy can read these.)</p>
			<div class="opts">
				{#each r.options as id}<button onclick={() => pick(id)}>{cityName(CITY[id], run.year)}</button>{/each}
			</div>
		{:else if result}
			<p>✦ <b>{cityName(CITY[r.answer], run.year)}</b>! The marks on the map suddenly make sense. A new task is in your ledger: take the map there and dig.</p>
			<button class="primary" onclick={onclose}>To the treasure</button>
		{:else}
			<p>You trace the map toward {cityName(CITY[guess!], run.year)}… and realise the coastline is wrong. It was never there. The map is useless now.</p>
			<button onclick={onclose}>Close</button>
		{/if}
	{/if}
</div>

<style>
	[role='dialog']::before {
		content: '';
		display: block;
		height: 10px;
		margin: -18px 0 12px;
		margin-left: -18px;
		margin-right: -18px;
		background: var(--z-pattern);
		border-radius: 14px 14px 0 0;
		opacity: 0.85;
	}
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 11;
	}
	.riddle {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(420px, calc(100vw - 32px));
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 18px;
		z-index: 12;
		box-shadow: 0 10px 40px var(--shadow);
	}
	h3 {
		font-family: var(--display);
		margin: 0 0 8px;
	}
	blockquote {
		margin: 0 0 10px;
		padding: 10px 12px;
		border-left: 3px solid var(--gold);
		font-style: italic;
		background: color-mix(in srgb, var(--gold) 12%, var(--paper));
	}
	.opts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}
	button {
		padding: 8px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}
	button.primary {
		background: var(--vermilion);
		color: var(--paper);
		border-color: var(--vermilion);
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: 0.85rem;
	}
</style>
