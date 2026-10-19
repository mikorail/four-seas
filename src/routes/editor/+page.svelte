<script lang="ts">
	import SwipeCard from '#lib/components/SwipeCard.svelte';
	import RichText from '#lib/components/RichText.svelte';
	import { Rng } from '#lib/rng';
	import { CULTURE_IDS, type CultureId } from '#lib/data/cultures';
	import { CITIES, cityExists } from '#lib/data/world';
	import { newRun, randomHero } from '#lib/game/engine';
	import { makeCtx } from '#lib/game/cards/index';
	import { buildCard, parseCampaign, parseCard, ContentError } from '#lib/content/parse';
	import type { Card } from '#lib/game/types';
	import { STAT_INFO, STATS } from '#lib/data/traits';
	import { themeStyle } from '#lib/data/themes';

	const EXAMPLE = `---
id: my-first-card
where: city
cultures: han, viet
weight: 1
speaker: elder
title: Kite maker
---
On the city wall of {city}, **{npc}** is flying a kite shaped like a carp. "The wind tells me who is coming," she says. "It told me about you."

## left: Ask what else the wind says
fx: fortune +4
tags: talk
text: "That you will be late," says {npc}. "But not too late."

## right: Buy a kite for the road
fx: silver -3, vigor +4
item: charm
text: A paper carp, red and gold, folded into your bag.

## up(Wandering Poet): Write a poem on the kite
requires_trait: poet
fx: renown +10
`;

	let src = $state(EXAMPLE);
	let culture = $state<CultureId>('han');
	let year = $state(1700);
	let seed = $state(1);
	let side = $state<'left' | 'right' | 'up' | null>(null);
	let copied = $state('');

	const result = $derived.by((): { card?: Card; beats?: string[]; error?: string } => {
		try {
			if (/^\s*campaign\s*:/m.test(src)) {
				const c = parseCampaign('editor.md', src);
				return { beats: c.beats.map((b) => `${b.meta.id} · at ${b.meta.at ?? 'any'}${b.meta.requires ? ` · needs ${b.meta.requires}` : ''}`) };
			}
			const pc = parseCard(src);
			const homes = CITIES.filter((c) => c.culture === culture && cityExists(c, year));
			const rng = new Rng(seed);
			const run = newRun(randomHero(rng, year, { culture, home: homes[0]?.id, traits: ['poet', 'polyglot', 'lucky'] }), 'editor', year);
			run.phase = pc.meta.where === 'travel' ? 'travel' : 'city';
			const ctx = makeCtx(run, rng, run.phase === 'travel' ? 'travel' : 'city', null, null);
			return { card: buildCard(pc, ctx, 'editor') };
		} catch (e) {
			return { error: e instanceof ContentError ? e.message : `Could not read this card: ${(e as Error).message}` };
		}
	});

	const fx = $derived(result.card && side ? result.card[side]?.fx ?? {} : {});

	async function copy() {
		await navigator.clipboard.writeText(src);
		copied = 'Copied!';
		setTimeout(() => (copied = ''), 1500);
	}
	function download() {
		const id = /^id:\s*(\S+)/m.exec(src)?.[1] ?? /^campaign:\s*(\S+)/m.exec(src)?.[1] ?? 'card';
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([src], { type: 'text/markdown' }));
		a.download = `${id}.md`;
		a.click();
	}
</script>

<svelte:head><title>Card editor · Four Seas</title></svelte:head>

<main class="editor themed" style={themeStyle(culture)}>
	<header>
		<a href="/" class="back">← Four Seas</a>
		<h1>Card editor</h1>
		<p class="muted">Write a card in Markdown and see it live. Save the file into <code>src/content/cards/</code> (or <code>campaigns/</code>) and it joins the game. Format guide: <code>src/content/README.md</code>.</p>
	</header>
	<div class="grid">
		<section class="left">
			<textarea bind:value={src} spellcheck="false" aria-label="Card Markdown"></textarea>
			<div class="row">
				<button class="ghost" onclick={() => (src = EXAMPLE)}>Reset example</button>
				<button class="ghost" onclick={copy}>{copied || 'Copy'}</button>
				<button class="primary" onclick={download}>Download .md</button>
			</div>
		</section>
		<section class="right">
			<div class="row controls">
				<label>Culture <select bind:value={culture}>{#each CULTURE_IDS as c}<option value={c}>{c}</option>{/each}</select></label>
				<label>Year <input type="number" min="1500" max="1900" bind:value={year} /></label>
				<button class="ghost" onclick={() => seed++}>⚄ New face</button>
			</div>
			{#if result.error}
				<p class="error" role="alert">⚠ {result.error}</p>
			{:else if result.beats}
				<h3>Campaign beats</h3>
				<ol class="beats">{#each result.beats as b}<li>{b}</li>{/each}</ol>
			{:else if result.card}
				{#key result.card}
					<SwipeCard card={result.card} {year} scene={culture} onpreview={(s) => (side = s)} onchoose={(s) => (side = s)} />
				{/key}
				{#if side && result.card[side]}
					<div class="fx">
						{#each STATS.filter((s) => fx[s]) as s}<span class:neg={fx[s]! < 0}>{STAT_INFO[s].label} {fx[s]! > 0 ? '+' : ''}{fx[s]}</span>{/each}
						{#if result.card[side]?.text}<p><RichText text={result.card[side]!.text!} /></p>{/if}
					</div>
				{/if}
			{/if}
		</section>
	</div>
</main>

<style>
	.editor {
		max-width: 1100px;
		margin: 0 auto;
		padding: 12px 16px 40px;
	}
	h1 {
		font-family: var(--display);
		margin: 4px 0;
	}
	.back {
		color: var(--muted);
		text-decoration: none;
	}
	.muted {
		color: var(--muted);
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 18px;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	textarea {
		width: 100%;
		min-height: 460px;
		font: 13px/1.5 ui-monospace, Menlo, monospace;
		padding: 12px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--card);
		color: var(--ink);
		resize: vertical;
	}
	.row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 8px;
		align-items: center;
	}
	.controls {
		margin: 0 0 12px;
	}
	.controls label {
		display: flex;
		gap: 6px;
		align-items: center;
		font-size: 0.9rem;
	}
	select,
	input {
		font: inherit;
		padding: 4px 6px;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--paper-2);
		color: var(--ink);
		width: 90px;
	}
	.error {
		color: var(--vermilion);
		background: color-mix(in srgb, var(--vermilion) 10%, transparent);
		padding: 10px 12px;
		border-radius: 8px;
	}
	.fx {
		max-width: 440px;
		margin: 10px auto 0;
		text-align: center;
	}
	.fx span {
		display: inline-block;
		margin: 2px;
		padding: 2px 10px;
		border-radius: 999px;
		font-size: 0.85rem;
		background: color-mix(in srgb, var(--jade) 15%, transparent);
		color: var(--jade);
	}
	.fx span.neg {
		background: color-mix(in srgb, var(--vermilion) 13%, transparent);
		color: var(--vermilion);
	}
	.beats li {
		padding: 3px 0;
	}
</style>
