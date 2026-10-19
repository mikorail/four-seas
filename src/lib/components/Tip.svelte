<script lang="ts">
	import { CODEX, markTip, nextTip, seenTips } from '#lib/data/codex';
	import type { Run } from '#lib/game/types';

	let { run, oncodex }: { run: Run; oncodex: () => void } = $props();
	let seen = $state<string[]>(seenTips());
	const tip = $derived(nextTip(run, seen));

	function dismiss() {
		if (!tip) return;
		markTip(tip.id);
		seen = [...seen, tip.id];
	}
	function off() {
		// stop all tips
		for (const e of CODEX) markTip(e.id);
		seen = seenTips();
	}
</script>

{#if tip}
	<aside class="tip" role="note" aria-label="Tip">
		<span class="g">{tip.glyph}</span>
		<div>
			<b>{tip.title}</b>
			<p>{tip.text}</p>
			<div class="row">
				<button class="ok" onclick={dismiss}>Got it</button>
				<button class="link" onclick={oncodex}>Codex</button>
				<button class="link" onclick={off}>No more tips</button>
			</div>
		</div>
	</aside>
{/if}

<style>
	.tip {
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--gold) 60%, var(--line));
		background: color-mix(in srgb, var(--gold) 10%, var(--paper));
		animation: in 0.3s ease-out;
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	.g {
		font-size: 1.4rem;
		font-family: var(--cjk);
		color: var(--gold-text);
	}
	b {
		font-family: var(--display);
	}
	p {
		margin: 2px 0 6px;
		font-size: 0.86rem;
		line-height: 1.4;
	}
	.row {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.ok {
		font: inherit;
		font-size: 0.8rem;
		padding: 3px 12px;
		border-radius: 999px;
		border: 1px solid var(--ink);
		background: var(--ink);
		color: var(--paper);
		cursor: pointer;
	}
	.link {
		font: inherit;
		font-size: 0.8rem;
		background: none;
		border: 0;
		color: var(--muted);
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
	}
</style>
