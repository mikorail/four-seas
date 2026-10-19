<script lang="ts">
	import Portrait from './Portrait.svelte';
	import Swipeable from './Swipeable.svelte';
	import { PERK } from '#lib/data/traits';
	import { CULTURES } from '#lib/data/cultures';
	import { CITY } from '#lib/data/world';
	import { themeStyle } from '#lib/data/themes';
	import type { Venue } from '#lib/data/venues';
	import { compatibility, peopleAt, tagWord, type Profile } from '#lib/game/people';
	import type { Run } from '#lib/game/types';

	let { run, venue, onmeet, onlook, onclose }: { run: Run; venue: Venue; onmeet: (p: Profile) => void; onlook: () => void; onclose: () => void } = $props();

	const all = $derived(peopleAt(run, venue.id));
	let passed = $state<string[]>([]);
	const stack = $derived(all.filter((p) => !passed.includes(p.id)));
	const top = $derived(stack[0]);
	const comp = $derived(top ? compatibility(run, top) : null);
	let swiper: Swipeable | undefined = $state();

	function swipe(s: 'left' | 'right') {
		if (!top) return;
		if (s === 'right') onmeet(top);
		else passed = [...passed, top.id];
	}
</script>

<div class="scrim" onclick={onclose} role="presentation"></div>
<div class="people themed" style={themeStyle(CITY[run.location].culture)} role="dialog" aria-label="People at {venue.name}">
	<header>
		<div>
			<h3>{venue.name}</h3>
			<small class="muted">{stack.length ? `${stack.length} ${stack.length === 1 ? 'person' : 'people'} here · swipe right to spend time with someone` : 'Nobody else catches your eye.'}</small>
		</div>
		<button class="x" onclick={onclose} aria-label="Close">✕</button>
	</header>

	<div class="deck">
		{#if stack[1]}<div class="pcard under"></div>{/if}
		{#key top?.id}
			{#if top && comp}
				<Swipeable bind:this={swiper} onswipe={swipe} leftLabel="Pass" rightLabel="Hang out">
					<article class="pcard" class:known={!!top.known} class:famous={top.notable}>
						<div class="head">
							<Portrait culture={top.npc.culture} gender={top.npc.gender} seed={top.npc.seed} role={top.npc.role} year={run.year} size={92} mood={comp.score >= 65 ? 'happy' : comp.score < 35 ? 'sad' : 'neutral'} />
							<div class="who">
								<b>{top.npc.name}{top.npc.role !== 'child' ? `, ${top.age}` : ''}</b>
								<small>{top.npc.title} · {CULTURES[top.npc.culture].label}</small>
								{#if top.known}<span class="tag known">♥ {top.known.stage} · bond {top.known.bond}</span>{:else if top.notable}<span class="tag famous">★ famous in the city</span>{/if}
								<span class="match" class:hi={comp.score >= 65} class:lo={comp.score < 35}>{comp.score}% match</span>
							</div>
						</div>
						<p class="bio">“{top.bio}”</p>
						<div class="traits">
							{#each top.traits as t}
								{@const p = PERK[t]}
								{#if p}<span class="trait" class:flaw={p.flaw} class:shared={run.hero.traits.includes(t)} title={p.pro + (p.con ? ` · ${p.con}` : '')}><b>{p.glyph}</b> {p.name}</span>{/if}
							{/each}
						</div>
						<dl>
							<dt>Loves</dt><dd>{top.likes.map(tagWord).join(', ')}</dd>
							<dt>Can’t stand</dt><dd>{top.dislikes.map(tagWord).join(', ')}</dd>
							<dt>Looking for</dt><dd>{top.looking}</dd>
						</dl>
						{#if comp.why.length}<ul class="why">{#each comp.why.slice(0, 3) as w}<li>{w}</li>{/each}</ul>{/if}
					</article>
				</Swipeable>
			{/if}
		{/key}
	</div>

	<div class="actions">
		<button class="round no" disabled={!top} onclick={() => swiper?.fling('left')} aria-label="Pass">✕</button>
		<button class="ghost" onclick={onlook}>Just look around</button>
		<button class="round yes" disabled={!top} onclick={() => swiper?.fling('right')} aria-label="Hang out">♥</button>
	</div>
	{#if venue.damaged}<p class="muted small dmg">{venue.name}: {venue.damaged}.</p>{/if}
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 11;
	}
	.people {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(400px, calc(100vw - 24px));
		max-height: calc(100dvh - 24px);
		overflow-y: auto;
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 14px 16px 16px;
		z-index: 12;
		box-shadow: 0 16px 50px var(--shadow);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	h3 {
		font-family: var(--display);
		margin: 0;
	}
	.x {
		background: none;
		border: 0;
		font-size: 1.2rem;
		color: var(--ink);
		cursor: pointer;
	}
	.deck {
		position: relative;
		min-height: 380px;
		margin: 12px 0;
	}
	.pcard {
		background: color-mix(in srgb, var(--paper) 92%, var(--ink));
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 14px;
		box-shadow: 0 6px 18px var(--shadow);
		user-select: none;
	}
	.pcard.under {
		position: absolute;
		inset: 8px -4px -6px 4px;
		transform: rotate(2deg);
		opacity: 0.6;
		z-index: -1;
	}
	.pcard.known {
		border-color: var(--jade);
	}
	.pcard.famous {
		border-color: var(--gold);
	}
	.head {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.who {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.who b {
		font-family: var(--display);
		font-size: 1.25rem;
	}
	.who small {
		color: var(--muted);
	}
	.tag {
		font-size: 0.75rem;
	}
	.tag.known {
		color: var(--jade);
	}
	.tag.famous {
		color: var(--gold-text);
	}
	.match {
		align-self: flex-start;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: var(--radius-sm, 4px);
		background: color-mix(in srgb, var(--gold) 25%, transparent);
	}
	.match.hi {
		background: color-mix(in srgb, var(--jade) 30%, transparent);
	}
	.match.lo {
		background: color-mix(in srgb, var(--vermilion) 22%, transparent);
	}
	.bio {
		font-style: italic;
		margin: 10px 0;
		line-height: 1.4;
	}
	.traits {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.trait {
		font-size: 0.8rem;
		padding: 2px 8px;
		border-radius: var(--radius-sm, 4px);
		border: 1px solid var(--line);
	}
	.trait b {
		font-family: var(--cjk);
		color: var(--gold-text);
	}
	.trait.flaw {
		border-style: dashed;
	}
	.trait.shared {
		border-color: var(--jade);
		background: color-mix(in srgb, var(--jade) 12%, transparent);
	}
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px 10px;
		margin: 10px 0 6px;
		font-size: 0.86rem;
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
	}
	.why {
		margin: 6px 0 0;
		padding-left: 16px;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.actions {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 14px;
	}
	.round {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		font-size: 1.3rem;
		border: 1.5px solid var(--line);
		background: var(--paper);
		cursor: pointer;
	}
	.round.no {
		color: var(--vermilion);
	}
	.round.yes {
		color: var(--jade);
	}
	.round:disabled {
		opacity: 0.35;
	}
	.ghost {
		padding: 8px 14px;
		border-radius: 999px;
		border: 1.5px solid var(--ink);
		background: transparent;
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: 0.8rem;
	}
	.dmg {
		color: var(--vermilion);
		text-align: center;
	}
</style>
