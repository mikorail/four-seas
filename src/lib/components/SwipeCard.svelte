<script lang="ts">
	import { VOICE } from '#lib/data/voices';
	import Portrait from './Portrait.svelte';
	import CityScene from './CityScene.svelte';
	import type { Card } from '#lib/game/types';
	import type { CultureId } from '#lib/data/cultures';
	import { THEMES } from '#lib/data/themes';
	import RichText from './RichText.svelte';
	import LegendArt from './LegendArt.svelte';

	type Side = 'left' | 'right' | 'up';

	let {
		card,
		year,
		scene,
		mode = null,
		city = null,
		opener = '',
		names = [],
		rapport = null,
		thoughts = [],
		onpreview,
		onchoose
	}: {
		card: Card;
		year: number;
		scene: CultureId;
		opener?: string;
		names?: string[];
		rapport?: { score: number; likes: string[]; dislikes: string[] } | null;
		thoughts?: import('#lib/game/thoughts').Thought[];
		mode?: 'sea' | 'land' | 'river' | 'rustic' | null;
		city?: string | null;
		onpreview: (side: Side | null) => void;
		onchoose: (side: Side) => void;
	} = $props();

	let dx = $state(0);
	let dy = $state(0);
	let dragging = $state(false);
	let leaving = $state<Side | null>(null);
	let startX = 0;
	let startY = 0;
	let el: HTMLDivElement;
	const THRESH = 90;

	const side = $derived<Side | null>(card.up && dy < -50 && Math.abs(dy) > Math.abs(dx) ? 'up' : dx < -24 ? 'left' : dx > 24 ? 'right' : null);
	const lean = $derived(side === 'up' ? Math.min(1, -dy / THRESH) : Math.min(1, Math.abs(dx) / THRESH));

	$effect(() => {
		onpreview(side);
	});

	function down(e: PointerEvent) {
		if (leaving) return;
		dragging = true;
		startX = e.clientX - dx;
		startY = e.clientY - dy;
		el.setPointerCapture(e.pointerId);
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		dx = e.clientX - startX;
		const rawY = e.clientY - startY;
		dy = card.up && rawY < 0 ? rawY : rawY * 0.25;
	}
	function up() {
		if (!dragging) return;
		dragging = false;
		if (side === 'up' && -dy > THRESH) commit('up');
		else if (Math.abs(dx) > THRESH) commit(dx < 0 ? 'left' : 'right');
		else {
			dx = 0;
			dy = 0;
		}
	}
	function commit(s: Side) {
		leaving = s;
		if (s === 'up') {
			dx = 0;
			dy = -window.innerHeight;
		} else dx = s === 'left' ? -window.innerWidth : window.innerWidth;
		setTimeout(() => onchoose(s), 220);
	}

	function key(e: KeyboardEvent) {
		if (leaving) return;
		const s: Side | null = e.key === 'ArrowLeft' || e.key === 'a' ? 'left' : e.key === 'ArrowRight' || e.key === 'd' ? 'right' : (e.key === 'ArrowUp' || e.key === 'w') && card.up ? 'up' : null;
		if (!s) return;
		e.preventDefault();
		if (side === s) commit(s);
		else if (s === 'up') {
			dx = 0;
			dy = -THRESH * 0.7;
		} else {
			dy = 0;
			dx = s === 'left' ? -THRESH * 0.7 : THRESH * 0.7;
		}
	}

	const label = $derived(side ? card[side]?.label ?? '' : '');
	// the speaker reacts to what you are about to do
	const mood = $derived.by(() => {
		const ch = side ? card[side] : null;
		if (!ch) return 'neutral' as const;
		const t = ch.tags ?? [];
		if (t.some((x) => ['cruel', 'crime', 'bribe', 'fight'].includes(x))) return 'angry' as const;
		if (t.some((x) => ['mercy', 'romance', 'faith', 'trade', 'rest', 'art'].includes(x))) return 'happy' as const;
		if (ch.gamble) return 'surprised' as const;
		const sum = Object.values(ch.fx).reduce((a, v) => a + (v ?? 0), 0);
		return sum < -6 ? ('sad' as const) : ('neutral' as const);
	});
	const risky = $derived(side ? !!card[side]?.gamble : false);
</script>

<svelte:window onkeydown={key} />

<div class="stage">
	<div class="under" aria-hidden="true"></div>
	<div
		bind:this={el}
		class="card"
		class:dragging
		class:legend={card.badge === 'Local Legend'}
		class:claude={card.badge === 'Written by Claude'}
		role="group"
		aria-label="Card from {card.npc.name}, {card.npc.title}. Drag left or right, use the arrow keys, or the buttons below."
		style:transform="translate({dx}px, {dy}px) rotate({dx / 18}deg)"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		<span class="frame" aria-hidden="true"></span>
		<span class="style-name">{THEMES[scene].name}</span>
		<CityScene culture={scene} seed={card.npc.seed} {mode} {city} />
		<div class="choice" class:show={!!side} class:right={side === 'right'} class:mid={side === 'up'} style:opacity={lean}>
			{#if side === 'up'}<small>✦ {card.up?.why}</small>{/if}
			{label}{#if risky}<span class="dice" title="Risky: luck decides">⚂</span>{/if}
		</div>
		{#if card.badge}<span class="badge">{card.badge === 'Local Legend' ? '★ ' : ''}{card.badge}</span>{/if}
		<div class="art">
			{#if card.id.startsWith('legend-')}
				<LegendArt id={card.id.slice(7)} size={140} />
			{:else}
				<Portrait culture={card.npc.culture} gender={card.npc.gender} seed={card.npc.seed} role={card.npc.role} {year} size={140} {mood} />
			{/if}
		</div>
		<div class="who">
			<strong>{card.npc.name}</strong>
			<span>{card.npc.title}</span>
			{#if rapport && (rapport.likes.length || rapport.dislikes.length)}
				<em class="rapport" class:bad={rapport.score < 0} title="Their attitude changes how much you gain or lose, and your odds">
					{#if rapport.likes.length}♥ likes your {rapport.likes.join(' & ').toLowerCase()}{/if}{#if rapport.likes.length && rapport.dislikes.length} · {/if}{#if rapport.dislikes.length}✕ wary of your {rapport.dislikes.join(' & ').toLowerCase()}{/if}
				</em>
			{/if}
		</div>
	</div>
</div>

<div class="text">
	{#if opener}<p class="opener"><RichText text={opener} /></p>{/if}
	<p><RichText text={card.text} names={[card.npc.name, ...names]} /></p>
	{#if thoughts.length}
		<ul class="thoughts" aria-label="Inner voices">
			{#each thoughts as th}
				<li class:lie={!th.ok}>
					<b style:color="var({VOICE[th.voice].color})">{VOICE[th.voice].name}</b>
					<small>[{th.check}: {th.ok ? 'Success' : '???'}]</small>
					<span>: <RichText text={th.text} names={[card.npc.name.split(' ')[0]]} /></span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<div class="hints" class:three={!!card.up}>
	<button class="hint" onclick={() => commit('left')} disabled={!!leaving}>
		<span class="arrow">←</span>{card.left.label}{#if card.left.gamble}<span class="dice">⚂</span>{/if}
	</button>
	{#if card.up}
		<button class="hint special" onclick={() => commit('up')} disabled={!!leaving} title="Unlocked by {card.up.why}">
			<span class="arrow">↑</span>{card.up.label}{#if card.up.gamble}<span class="dice">⚂</span>{/if}
			<small>✦ {card.up.why}</small>
		</button>
	{/if}
	<button class="hint r" onclick={() => commit('right')} disabled={!!leaving}>
		{card.right.label}{#if card.right.gamble}<span class="dice">⚂</span>{/if}<span class="arrow">→</span>
	</button>
</div>

<style>
	.stage {
		position: relative;
		width: min(300px, 78vw);
		aspect-ratio: 1 / 1.05;
		margin: 0 auto;
	}
	.under {
		position: absolute;
		inset: 0;
		background: var(--card-back);
		border-radius: 14px;
		transform: rotate(-2.5deg) translateY(6px);
		border: 1px solid var(--line);
	}
	.card {
		position: absolute;
		inset: 0;
		background: var(--card);
		border-radius: 14px;
		border: 1px solid var(--line);
		box-shadow: 0 10px 30px var(--shadow);
		touch-action: none;
		cursor: grab;
		user-select: none;
		transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		overflow: hidden;
		background-image: radial-gradient(circle at 50% 38%, var(--card-glow), transparent 70%);
	}
	.frame {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border: 9px solid transparent;
		border-radius: 14px;
		background: var(--z-pattern) border-box;
		background-size: 18px 18px;
		mask:
			linear-gradient(#000 0 0) padding-box,
			linear-gradient(#000 0 0) border-box;
		mask-composite: exclude;
		-webkit-mask:
			linear-gradient(#000 0 0) padding-box,
			linear-gradient(#000 0 0) border-box;
		-webkit-mask-composite: xor;
		opacity: 0.55;
	}
	.style-name {
		position: absolute;
		top: 14px;
		right: 16px;
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--vermilion);
		opacity: 0.8;
		pointer-events: none;
	}
	.card.legend .frame {
		background-image: var(--z-pattern-gold);
		opacity: 0.9;
	}
	.card.legend {
		border: 2px solid var(--gold);
		box-shadow:
			0 10px 30px var(--shadow),
			0 0 0 4px color-mix(in srgb, var(--gold) 20%, transparent);
	}
	.card.claude {
		border: 2px dashed var(--indigo);
	}
	.card.dragging {
		transition: none;
		cursor: grabbing;
	}
	.choice {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 2;
		padding: 14px 16px 26px;
		background: linear-gradient(var(--ink) 55%, transparent);
		color: var(--paper);
		font-family: var(--display);
		font-size: 1.08rem;
		line-height: 1.25;
		text-align: left;
		pointer-events: none;
		min-height: 64px;
	}
	.choice.right {
		text-align: right;
	}
	.choice.mid {
		text-align: center;
		background: linear-gradient(var(--gold) 55%, transparent);
		color: #1d1813;
	}
	.choice small {
		display: block;
		font-family: var(--body);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.thoughts {
		list-style: none;
		margin: 10px 0 0;
		padding: 8px 0 0;
		border-top: 1px dashed var(--line);
		display: grid;
		gap: 5px;
		font-size: 0.86rem;
		line-height: 1.4;
		text-align: left;
	}
	.thoughts b {
		font-variant: small-caps;
		letter-spacing: 0.04em;
		font-size: 0.95rem;
	}
	.thoughts small {
		color: var(--muted);
		font-size: 0.72rem;
		margin: 0 2px;
	}
	.thoughts span {
		font-style: italic;
	}
	.thoughts .lie span {
		opacity: 0.75;
		filter: blur(0.2px);
	}
	.thoughts .lie b {
		text-decoration: underline wavy color-mix(in srgb, var(--vermilion) 60%, transparent);
	}
	.rapport {
		display: block;
		font-size: 0.72rem;
		font-style: normal;
		color: var(--jade);
		margin-top: 2px;
	}
	.rapport.bad {
		color: var(--vermilion);
	}
	.badge {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 2px 9px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		white-space: nowrap;
	}
	.legend .badge {
		background: var(--gold);
		color: #1d1813;
	}
	.dice {
		margin-left: 6px;
		color: var(--gold-text);
		font-size: 1.05em;
	}
	.art {
		margin-top: 14px;
		pointer-events: none;
		position: relative;
	}
	.who {
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
		text-align: center;
		padding: 0 12px 18px;
		position: relative;
	}
	.who strong {
		font-family: var(--display);
		font-size: 1.2rem;
		font-weight: 600;
	}
	.who span {
		font-size: 0.82rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.text {
		max-width: 480px;
		margin: 16px auto 10px;
		text-align: center;
		font-size: 1.1rem;
		line-height: 1.5;
		min-height: 5.5em;
		padding: 0 16px;
	}
	.text p {
		margin: 0;
	}
	.text .opener {
		font-style: italic;
		font-size: 0.92rem;
		color: var(--muted);
		margin-bottom: 6px;
	}
	.hints {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		max-width: 520px;
		margin: 0 auto;
		padding: 0 16px;
	}
	.hint {
		flex: 1;
		font: inherit;
		font-size: 0.86rem;
		color: var(--muted);
		background: none;
		border: 1px dashed var(--line);
		border-radius: 8px;
		padding: 8px 10px;
		cursor: pointer;
		text-align: left;
	}
	.hint.r {
		text-align: right;
	}
	.hint.special {
		text-align: center;
		color: var(--ink);
		border: 1.5px solid var(--gold);
		background: color-mix(in srgb, var(--gold) 12%, transparent);
	}
	.hint.special small {
		display: block;
		color: var(--gold-text);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.hint:hover {
		color: var(--ink);
		border-color: var(--ink);
	}
	.arrow {
		margin: 0 6px;
		color: var(--vermilion);
	}
	@media (max-width: 480px) {
		.hints.three {
			flex-wrap: wrap;
		}
		.hints.three .special {
			order: -1;
			flex-basis: 100%;
		}
	}
</style>
