<script lang="ts">
	import { STAT_INFO, STATS } from '#lib/data/traits';
	import { endingCause } from '#lib/game/engine';
	import type { LogEntry, Run } from '#lib/game/types';

	let { run }: { run: Run } = $props();
	const c = $derived(endingCause(run));

	const fxParts = (l: LogEntry) => STATS.filter((s) => l.fx?.[s]).map((s) => ({ t: `${STAT_INFO[s].glyph} ${l.fx![s]! > 0 ? '+' : ''}${l.fx![s]}`, up: l.fx![s]! > 0 }));

	// sparkline of the stat that broke
	const W = 280;
	const H = 54;
	const path = $derived.by(() => {
		const s = c?.series ?? [];
		if (s.length < 2) return '';
		return s.map((v, i) => `${i ? 'L' : 'M'}${((i / (s.length - 1)) * W).toFixed(1)} ${(H - (Math.max(0, Math.min(100, v)) / 100) * H).toFixed(1)}`).join(' ');
	});
</script>

{#if c}
	<div class="why" class:won={run.ending?.won}>
		<h3>{run.ending?.won ? 'How it ended' : 'Why it ended'}</h3>
		<p class="head">{#if c.stat}<span class="glyph">{STAT_INFO[c.stat].glyph}</span>{/if}{c.headline}</p>

		{#if path && c.stat}
			<svg viewBox="0 -4 {W} {H + 8}" class="spark" aria-label="{STAT_INFO[c.stat].label} over the journey">
				<line x1="0" x2={W} y1={H / 2} y2={H / 2} class="mid" />
				<path d={path} class="line" />
				<circle cx={W} cy={H - (Math.max(0, Math.min(100, c.series!.at(-1)!)) / 100) * H} r="3.5" class="dot" />
			</svg>
			<small class="muted">{STAT_INFO[c.stat].label} across the journey (0 at the bottom, 100 at the top). Both ends are fatal.</small>
		{/if}

		{#if c.straw}
			<div class="straw">
				<span class="lbl">The last straw · day {c.straw.day}, {c.straw.place}</span>
				<b>{c.straw.who ?? c.straw.text}</b>
				{#if c.straw.choice}<span>“{c.straw.choice}”</span>{/if}
				{#if c.straw.fx}<span class="fx">{#each fxParts(c.straw) as f}<i class:up={f.up}>{f.t}</i> {/each}</span>{/if}
			</div>
		{/if}

		{#if c.runup.length}
			<div class="runup">
				<span class="lbl">On the way here</span>
				<ol>
					{#each c.runup as l}
						<li><small>Day {l.day}</small> {l.who ? `${l.who.split(',')[0]}: ${l.choice ?? ''}` : l.text} {#if l.fx}<em>{#each fxParts(l) as f}<i class:up={f.up}>{f.t}</i> {/each}</em>{/if}</li>
					{/each}
				</ol>
			</div>
		{/if}

		<p class="tip">💡 {c.tip}</p>
	</div>
{/if}

<style>
	.why {
		text-align: left;
		border: 1px solid var(--line);
		border-left: 4px solid var(--vermilion);
		border-radius: 10px;
		padding: 12px 14px;
		margin: 12px 0;
		background: color-mix(in srgb, var(--vermilion) 5%, var(--paper));
	}
	.why.won {
		border-left-color: var(--jade);
		background: color-mix(in srgb, var(--jade) 5%, var(--paper));
	}
	h3 {
		font-family: var(--display);
		margin: 0 0 4px;
		font-size: 1.1rem;
	}
	.head {
		font-weight: 600;
		margin: 0 0 6px;
	}
	.glyph {
		margin-right: 6px;
	}
	.spark {
		width: 100%;
		max-width: 320px;
		height: auto;
		display: block;
	}
	.spark .mid {
		stroke: var(--line);
		stroke-dasharray: 3 3;
	}
	.spark .line {
		fill: none;
		stroke: var(--vermilion);
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.spark .dot {
		fill: var(--vermilion);
	}
	.lbl {
		display: block;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}
	.straw {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 10px 0 6px;
		padding: 8px 10px;
		border-radius: 8px;
		background: var(--paper);
		border: 1px dashed var(--vermilion);
	}
	.fx,
	.runup em {
		font-style: normal;
		font-weight: 600;
		color: var(--vermilion);
		font-size: 0.85rem;
	}
	.fx i,
	.runup em i {
		font-style: normal;
	}
	.fx i.up,
	.runup em i.up {
		color: var(--jade);
	}
	.runup ol {
		margin: 4px 0 0;
		padding-left: 18px;
		font-size: 0.85rem;
	}
	.runup small {
		color: var(--muted);
	}
	.tip {
		margin: 10px 0 0;
		font-size: 0.88rem;
	}
	.muted {
		color: var(--muted);
		font-size: 0.75rem;
	}
</style>
