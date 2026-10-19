<script lang="ts">
	import { STATS, STAT_INFO, type Stat, type Stats, type Fx } from '#lib/data/traits';
	import { t } from '#lib/i18n.svelte';

	let { stats, preview = {}, flash = null, mind = null, mindLabel = '', apathy = 0, caps = {} }: { stats: Stats; preview?: Partial<Record<Stat, number>>; flash?: Fx | null; mind?: number | null; mindLabel?: string; apathy?: number; caps?: Partial<Record<Stat | 'mind', number>> } = $props();
</script>

<div class="bar">
	{#each STATS as s}
		{@const v = stats[s]}
		{@const cap = caps[s] ?? 100}
		{@const danger = v <= 15 || v >= cap - 15}
		{@const pv = preview[s] ?? 0}
		{@const fl = flash?.[s] ?? 0}
		<div class="stat" class:danger title="{STAT_INFO[s].label}: {v} / {cap} (0 = {STAT_INFO[s].low}, {cap} = {STAT_INFO[s].high}){cap > 100 ? ' (your limit has grown with experience and traits)' : ''}" role="meter" aria-valuemin="0" aria-valuemax={cap} aria-valuenow={v} aria-label="{STAT_INFO[s].label} {v} of {cap}{danger ? (v <= 15 ? ', dangerously low' : ', dangerously high') : ''}{pv ? ', will change' : ''}">
			<div class="dot" style:transform="scale({pv ? (pv > 12 ? 1 : 0.6) : 0})"></div>
			<div class="vessel">
				<div class="fill" style:height="{(v / cap) * 100}%"></div>
				<span class="glyph">{STAT_INFO[s].glyph}</span>
				{#if cap > 100}<span class="capup" aria-hidden="true">+{cap - 100}</span>{/if}
				{#if danger}<span class="warn" aria-hidden="true">!</span>{/if}
			</div>
			<span class="lbl">{t(STAT_INFO[s].label)}</span>
			{#if fl}
				{#key flash}
					<span class="delta" class:neg={fl < 0}>{fl > 0 ? '+' : ''}{fl}</span>
				{/key}
			{/if}
		</div>
	{/each}
	{#if mind !== null}
		{@const low = mind < 35}
		<div class="stat mind" class:danger={mind < 15} title="Mind {mind}: {mindLabel}{apathy ? ` · Apathy ${apathy}` : ''}. Losses wear it down; rest, faith, art, food and love restore it. At 0 you are lost." role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={mind} aria-label="Mind {mind} of 100, {mindLabel}">
			<div class="dot" style:transform="scale(0)"></div>
			<div class="vessel" class:low class:numb={apathy >= 40}>
				<div class="fill" style:height="{(mind / (caps.mind ?? 100)) * 100}%"></div>
				<span class="glyph">心</span>
				{#if mind < 15}<span class="warn" aria-hidden="true">!</span>{/if}
			</div>
			<span class="lbl">{mindLabel || t('Mind')}</span>
		</div>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		justify-content: center;
		gap: clamp(14px, 5vw, 30px);
		padding: 6px 0 2px;
	}
	.stat {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--ink);
		transition: transform 0.15s;
		margin-bottom: 2px;
	}
	.vessel {
		position: relative;
		overflow: visible !important;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		border: 2px solid var(--ink);
		overflow: hidden;
		background: var(--paper-2);
	}
	.fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--ink);
		opacity: 0.55;
		transition: height 0.6s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.danger .vessel {
		border-color: var(--vermilion);
		animation: pulse 1.2s infinite;
	}
	.danger .fill {
		background: var(--vermilion);
	}
	.glyph {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--cjk);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--gold-text);
		text-shadow:
			0 0 3px var(--paper),
			0 0 6px var(--paper);
	}
	.warn {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--vermilion);
		color: #fff;
		font: 700 10px/14px sans-serif;
		text-align: center;
	}
	.mind .vessel {
		border-style: dashed;
	}
	.mind .vessel.low {
		animation: waver 3s ease-in-out infinite;
	}
	.mind .vessel.numb {
		filter: grayscale(1);
		opacity: 0.7;
	}
	@keyframes waver {
		0%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(-4deg) scale(0.97);
		}
		75% {
			transform: rotate(4deg) scale(1.02);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.mind .vessel.low {
			animation: none;
		}
	}
	.capup {
		position: absolute;
		bottom: -4px;
		right: -8px;
		font-size: 0.6rem;
		font-weight: 700;
		color: var(--jade);
		background: var(--paper);
		border-radius: 6px;
		padding: 0 3px;
	}
	.lbl {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	.delta {
		position: absolute;
		top: 12px;
		right: -18px;
		font-weight: 700;
		font-size: 0.85rem;
		color: var(--jade);
		animation: rise 1.6s forwards;
	}
	.delta.neg {
		color: var(--vermilion);
	}
	@keyframes rise {
		0% {
			opacity: 0;
			transform: translateY(6px);
		}
		15% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-16px);
		}
	}
	@keyframes pulse {
		50% {
			box-shadow: 0 0 0 4px color-mix(in srgb, var(--vermilion) 25%, transparent);
		}
	}
</style>
