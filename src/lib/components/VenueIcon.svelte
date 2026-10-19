<script lang="ts">
	import type { LandmarkShape, VenueId } from '#lib/data/venues';

	let { id, shape = 'tower', size = 28 }: { id: VenueId; shape?: LandmarkShape; size?: number } = $props();
	const k = $derived(id === 'landmark' ? shape : id);
</script>

<!-- Ink-and-seal icons for the places in a city, coloured by the city's theme. -->
<svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" class="vi">
	<rect x="1" y="1" width="30" height="30" rx="7" class="bg" />
	<g class="ink" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
		{#if k === 'inn'}
			<path d="M16 5v3" /><ellipse cx="16" cy="15" rx="6" ry="7" class="fill-acc" /><path d="M10.5 12h11M10.5 18h11M13 22v3h6v-3" />
		{:else if k === 'temple'}
			<path d="M4 13q12-8 24 0" /><path d="M7 13v12M25 13v12M4 25h24M11 16h10" /><path d="M8 10q8-5 16 0" />
		{:else if k === 'square'}
			<rect x="5" y="17" width="22" height="9" rx="1" /><path d="M16 17v-6" /><circle cx="16" cy="9" r="4.5" class="fill-jade" /><path d="M8 21h2M14 21h4M22 21h2" />
		{:else if k === 'market'}
			<path d="M5 12h22l-2-5H7z" class="fill-acc" /><path d="M7 12v13M25 12v13M5 25h22" /><circle cx="12" cy="20" r="2" /><circle cx="19" cy="20" r="2" />
		{:else if k === 'bazaar'}
			<path d="M8 14q8-11 16 0" class="fill-gold" /><path d="M16 5v-2" /><path d="M5 14h22v11H5z" /><path d="M10 25v-6q3-3 6 0v6M16 19q3-3 6 0v6" />
		{:else if k === 'harbor'}
			<circle cx="16" cy="8" r="2.4" /><path d="M16 10.5v15M11 14h10" /><path d="M7 19q1 7 9 7t9-7" /><path d="M5 20l2-1 2 1M23 20l2-1 2 1" />
		{:else if k === 'palace'}
			<path d="M3 15q13-6 26 0" class="fill-acc" /><path d="M7 11q9-5 18 0" /><path d="M11 7q5-3 10 0" /><path d="M6 15v10M26 15v10M11 18v7M21 18v7M3 25h26" />
		{:else if k === 'academy'}
			<path d="M16 9q-5-3-11-1v16q6-2 11 1q5-3 11-1V8q-6-2-11 1z" /><path d="M16 9v16" /><path d="M8 13h5M8 17h5M19 13h5M19 17h5" />
		{:else if k === 'bridge'}
			<path d="M3 15h26" /><path d="M5 25q11-16 22 0" /><path d="M9 15v4M16 15v-0M23 15v4" /><path d="M3 26h4M25 26h4" class="jade" />
		{:else if k === 'festival'}
			<circle cx="16" cy="12" r="1.6" class="fill-gold" /><path d="M16 4v4M16 16v4M8 12h4M20 12h4M10.5 6.5l3 3M18.5 14.5l3 3M21.5 6.5l-3 3M13.5 14.5l-3 3" /><path d="M8 27q8-6 16 0" class="acc" />
		{:else if k === 'wall'}
			<path d="M3 26l6-8 6 4 6-9 8 6" /><path d="M3 22l6-8 6 4 6-9 8 6" /><path d="M8 14v-2M14 18v-2M20 9v-2M26 13v-2" /><rect x="18.5" y="5" width="4" height="4" class="fill-acc" />
		{:else if k === 'pagoda'}
			<path d="M16 3v3M10 9q6-4 12 0M9 15q7-4 14 0M8 21q8-4 16 0" /><path d="M12 9v6M20 9v6M11 15v6M21 15v6M10 21v5M22 21v5M7 26h18" />
		{:else if k === 'dome'}
			<path d="M9 18q0-10 7-10t7 10z" class="fill-acc" /><path d="M16 8V5M7 18h18v8H7zM4 26V10M28 26V10M4 10l0-2M28 10l0-2" /><path d="M14 26v-4q2-2 4 0v4" />
		{:else if k === 'tower'}
			<path d="M12 27l1.5-20h5L20 27zM11 27h10M13 12h6M12.5 18h7" /><path d="M16 7V4" />
		{:else if k === 'pyramid'}
			<path d="M3 26L16 6l13 20z" class="fill-gold" /><path d="M16 6l3 20M9 17h14" />
		{:else if k === 'stupa'}
			<path d="M16 3v6M14 9h4M9 18q0-7 7-7t7 7z" class="fill-gold" /><path d="M6 18h20l-2 4H8zM5 26h22M8 22v4M24 22v4" />
		{:else if k === 'gate'}
			<path d="M4 9q12-5 24 0M6 13h20" class="acc" /><path d="M8 13v13M24 13v13M4 26h24" /><path d="M12 26v-6q4-4 8 0v6" />
		{:else if k === 'cave'}
			<path d="M3 26q2-18 13-19t13 19" /><path d="M10 26q0-9 6-9t6 9" class="fill-ink" /><circle cx="16" cy="22" r="1.5" class="fill-gold" />
		{:else if k === 'garden'}
			<path d="M3 24q6-3 12 0t14 0" class="jade" /><path d="M8 24v-6q0-4 4-6M8 18q-3-1-4-4M12 12q3-2 3-5" /><path d="M20 22q0-5 3-8l3 8z" class="fill-jade" />
		{:else if k === 'hearth'}
			<path d="M7 25h18" /><path d="M9 25q7-12 14 0" class="fill-acc" /><path d="M12 25l4-7 4 7" /><path d="M16 11v-4M13 14q3-3 3-7M19 14q-3-3-3-7" class="acc" />
		{:else if k === 'well'}
			<rect x="8" y="18" width="16" height="8" rx="2" class="fill-jade" /><path d="M9 18v-8M23 18v-8M7 10h18" /><path d="M16 10v4" /><rect x="14" y="14" width="4" height="4" rx="1" class="fill-acc" />
		{:else if k === 'herbalist'}
			<ellipse cx="16" cy="22" rx="9" ry="5" class="fill-jade" /><path d="M7 22q0 4 9 4t9-4" /><path d="M13 12l8 11" stroke-width="2.2" class="acc" /><path d="M10 12q6-5 9 1" class="jade" /><path d="M8 8q7 1 6 7" class="jade" />
		{:else if k === 'shrine'}
			<path d="M8 12h16l-3-4H11z" class="fill-gold" /><path d="M11 12v12M21 12v12M7 24h18" /><circle cx="16" cy="18" r="2.5" class="fill-acc" /><path d="M16 8V5" />
		{/if}
	</g>
</svg>

<style>
	.vi {
		flex: none;
	}
	.bg {
		fill: color-mix(in srgb, var(--paper) 82%, var(--gold));
		stroke: color-mix(in srgb, var(--ink) 25%, transparent);
	}
	.ink {
		stroke: var(--ink);
	}
	.fill-acc {
		fill: color-mix(in srgb, var(--vermilion) 70%, var(--paper));
	}
	.fill-gold {
		fill: color-mix(in srgb, var(--gold) 70%, var(--paper));
	}
	.fill-jade {
		fill: color-mix(in srgb, var(--jade) 65%, var(--paper));
	}
	.fill-ink {
		fill: var(--ink);
	}
	.acc {
		stroke: var(--vermilion);
	}
	.jade {
		stroke: var(--jade);
	}
</style>
