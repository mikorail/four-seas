<script lang="ts">
	import { RARE_T } from '#lib/game/cards/rare';
	import { CABINET } from '#lib/data/cabinet';
	import { LEGENDS } from '#lib/game/cards/index';
	import { isUnlocked, type Chronicle } from '#lib/game/chronicle';
	import { PROFESSIONS, TRAITS } from '#lib/data/traits';
	import { ITEMS } from '#lib/data/items';
	import { CITIES, SECRETS } from '#lib/data/world';
	import type { EndingKind } from '#lib/game/types';

	let { chronicle, onback }: { chronicle: Chronicle; onback: () => void } = $props();

	const ENDINGS: [EndingKind, string][] = [
		['victory', 'Commission Fulfilled'],
		['second', 'Second to Arrive'],
		['late', 'Too Late'],
		['jailed', 'In Chains'],
		['silver-low', 'Penniless'],
		['silver-high', 'Too Rich to Live'],
		['vigor-low', 'The Fever'],
		['vigor-high', 'Reckless'],
		['renown-low', 'Disgraced'],
		['renown-high', 'Gilded Cage'],
		['fortune-low', 'Heaven Turns Away'],
		['fortune-high', 'The Living Saint']
	];
	const lockables = [...TRAITS, ...PROFESSIONS].filter((p) => p.unlock);
	const relics = Object.values(ITEMS).filter((i) => i.kind === 'relic');
</script>

<div class="chron">
	<nav><button class="back" onclick={onback}>← Four Seas</button></nav>
	<header>
		<h2>Chronicle</h2>
		<p class="muted">Everything your travellers have seen, across every life.</p>
	</header>

	<dl class="stats">
		<div><dt>Journeys</dt><dd>{chronicle.runs}</dd></div>
		<div><dt>Fulfilled</dt><dd>{chronicle.wins}</dd></div>
		<div><dt>Cities</dt><dd>{chronicle.cities.length}<small>/{CITIES.length}</small></dd></div>
		<div><dt>Best score</dt><dd>{chronicle.best}</dd></div>
	</dl>

	<section>
		<h3>Unlocks</h3>
		<ul class="unlocks">
			{#each lockables as p}
				{@const open = isUnlocked(p.id, chronicle)}
				<li class:open>
					<b class="g">{open ? p.glyph : '？'}</b>
					<span><strong>{open ? p.name : '???'}</strong><small>{open ? p.pro : p.unlock}</small></span>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h3>Legends met <small class="muted">{chronicle.legends.length}/{LEGENDS.length}</small></h3>
		<ul class="codex">
			{#each LEGENDS as l}
				{@const seen = chronicle.legends.includes(l.id)}
				<li class:seen>
					<strong>{seen ? l.name : '? ? ?'}</strong>
					<small>{l.where}</small>
					{#if seen}<p>{l.blurb}</p>{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h3>Secrets <small class="muted">{(chronicle.secrets ?? []).length}/{SECRETS.length}</small></h3>
		<ul class="codex">
			{#each SECRETS as s}
				{@const seen = (chronicle.secrets ?? []).includes(s.id)}
				<li class:seen><strong>{seen ? s.name : '? ? ?'}</strong>{#if seen}<p>{s.hint}</p>{/if}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h3>Rare encounters <small class="muted">{(chronicle.rarities ?? []).length}/{RARE_T.length}</small></h3>
		<ul class="codex">
			{#each RARE_T as r}
				{@const seen = (chronicle.rarities ?? []).includes(r.id)}
				<li class:seen><strong>{seen ? r.id.replace(/^rare-/, '').replace(/-/g, ' ') : '✦ ? ? ?'}</strong></li>
			{/each}
		</ul>
	</section>

	<section>
		<h3>Thoughts <small class="muted">{(chronicle.thoughts ?? []).length}/{CABINET.length}</small></h3>
		<ul class="codex">
			{#each CABINET as th}
				{@const seen = (chronicle.thoughts ?? []).includes(th.id)}
				<li class:seen><strong>{seen ? `${th.glyph} ${th.name}` : th.rare ? '✦ ? ? ?' : '? ? ?'}</strong>{#if seen}<p>{th.solution}</p>{/if}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h3>Relics <small class="muted">{chronicle.relics.length}/{relics.length}</small></h3>
		<div class="relics">
			{#each relics as r}
				<span class:seen={chronicle.relics.includes(r.id)} title={chronicle.relics.includes(r.id) ? `${r.name}: ${r.desc}` : 'Undiscovered'}>{chronicle.relics.includes(r.id) ? r.glyph : '·'}</span>
			{/each}
		</div>
	</section>

	<section>
		<h3>Endings</h3>
		<ul class="endings">
			{#each ENDINGS as [k, title]}
				<li class:seen={!!chronicle.endings[k]}>{chronicle.endings[k] ? title : '???'} <small>{chronicle.endings[k] ? '×' + chronicle.endings[k] : ''}</small></li>
			{/each}
		</ul>
	</section>

	{#if chronicle.history.length}
		<section>
			<h3>Recent journeys</h3>
			<ol class="hist">
				{#each chronicle.history as h}
					<li><b>{h.name}</b>, {h.year}: {h.ending} <small>day {h.day} · {h.score} pts</small></li>
				{/each}
			</ol>
		</section>
	{/if}
</div>

<style>
	.chron {
		max-width: 720px;
		margin: 0 auto;
		padding: 12px 16px 40px;
	}
	.back {
		font: inherit;
		background: none;
		border: 0;
		color: var(--muted);
		cursor: pointer;
	}
	h2 {
		font-family: var(--display);
		font-size: 2rem;
		margin: 6px 0 0;
	}
	h3 {
		font-family: var(--display);
		font-size: 1.3rem;
		margin: 0 0 8px;
	}
	.muted {
		color: var(--muted);
	}
	section {
		margin-top: 24px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		margin: 16px 0 0;
	}
	.stats div {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 10px;
		display: flex;
		flex-direction: column-reverse;
	}
	dt {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	dd {
		margin: 0;
		font-family: var(--display);
		font-size: 1.7rem;
		font-weight: 700;
	}
	dd small {
		font-size: 0.9rem;
		color: var(--muted);
	}
	ul,
	ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.unlocks {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 6px;
	}
	.unlocks li {
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 8px 10px;
		border: 1px dashed var(--line);
		border-radius: 10px;
		color: var(--muted);
	}
	.unlocks li.open {
		border-style: solid;
		border-color: var(--gold);
		color: var(--ink);
		background: var(--card);
	}
	.unlocks span {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}
	.unlocks small {
		font-size: 0.78rem;
		color: var(--muted);
	}
	.g {
		font-family: var(--cjk);
		font-size: 1.5rem;
		color: var(--vermilion);
	}
	.codex {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 6px;
	}
	.codex li {
		padding: 8px 10px;
		border-radius: 10px;
		border: 1px dashed var(--line);
		color: var(--muted);
		display: flex;
		flex-direction: column;
	}
	.codex li.seen {
		border: 1px solid var(--gold);
		background: var(--card);
		color: var(--ink);
	}
	.codex p {
		margin: 4px 0 0;
		font-size: 0.86rem;
		font-style: italic;
	}
	.codex small {
		font-size: 0.75rem;
		color: var(--muted);
	}
	.relics {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.relics span {
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		font-size: 1.4rem;
		border-radius: 8px;
		border: 1px dashed var(--line);
		color: var(--muted);
	}
	.relics span.seen {
		border: 1px solid var(--gold);
		background: var(--card);
	}
	.endings {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: 4px;
	}
	.endings li {
		font-size: 0.9rem;
		color: var(--muted);
	}
	.endings li.seen {
		color: var(--ink);
	}
	.hist li {
		padding: 4px 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.92rem;
	}
	.hist small {
		color: var(--muted);
	}
	@media (max-width: 520px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
