<script lang="ts">
	import type { Snippet } from 'svelte';

	let { onswipe, children, leftLabel = 'Pass', rightLabel = 'Match' }: { onswipe: (s: 'left' | 'right') => void; children: Snippet; leftLabel?: string; rightLabel?: string } = $props();

	let dx = $state(0);
	let dragging = $state(false);
	let gone = false;
	let sx = 0;
	let el: HTMLDivElement;
	const TH = 90;

	function down(e: PointerEvent) {
		if (gone) return;
		dragging = true;
		sx = e.clientX - dx;
		el.setPointerCapture(e.pointerId);
	}
	function move(e: PointerEvent) {
		if (dragging) dx = e.clientX - sx;
	}
	function up() {
		if (!dragging) return;
		dragging = false;
		if (Math.abs(dx) > TH) fling(dx < 0 ? 'left' : 'right');
		else dx = 0;
	}
	export function fling(s: 'left' | 'right') {
		if (gone) return;
		gone = true;
		dx = (s === 'left' ? -1 : 1) * window.innerWidth;
		setTimeout(() => onswipe(s), 200);
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') fling('left');
		if (e.key === 'ArrowRight') fling('right');
	}
</script>

<svelte:window onkeydown={key} />

<div
	bind:this={el}
	class="sw"
	class:dragging
	style:transform="translateX({dx}px) rotate({dx / 20}deg)"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	role="group"
>
	<span class="stamp nope" style:opacity={Math.max(0, -dx / TH)}>{leftLabel}</span>
	<span class="stamp yes" style:opacity={Math.max(0, dx / TH)}>{rightLabel}</span>
	{@render children()}
</div>

<style>
	.sw {
		position: relative;
		touch-action: none;
		cursor: grab;
		user-select: none;
		transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2);
	}
	.sw.dragging {
		transition: none;
		cursor: grabbing;
	}
	.stamp {
		position: absolute;
		top: 22px;
		z-index: 2;
		font-family: var(--display);
		font-weight: 700;
		font-size: 1.5rem;
		padding: 2px 12px;
		border: 3px solid;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		pointer-events: none;
	}
	.nope {
		right: 18px;
		color: var(--muted);
		transform: rotate(14deg);
	}
	.yes {
		left: 18px;
		color: var(--vermilion);
		transform: rotate(-14deg);
	}
</style>
