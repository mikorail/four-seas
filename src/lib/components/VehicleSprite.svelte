<script lang="ts">
	// Ink-silhouette vehicles in the same brush style as the city scenes; accents follow the regional theme.
	import type { Vehicle } from '#lib/game/journey';

	let { vehicle }: { vehicle: Vehicle } = $props();
	const ink = 'var(--ink)';
	const acc = 'var(--vermilion)';
	const gold = 'var(--gold)';
	const paper = 'var(--paper)';
</script>

{#snippet camel(dx: number, load: boolean)}
	<g transform="translate({dx} 0)">
		<path d="M-10 2 Q-9 -8 -3 -7 Q-1 -12 2 -7 Q6 -9 8 -4 L11 -10 Q14 -12 15 -9 L13 -3 Q10 2 8 3 Z" fill={ink} />
		<path d="M-8 2 v10 M-4 2 v10 M5 3 v9 M8 3 v9" stroke={ink} stroke-width="1.6" />
		{#if load}<rect x="-5" y="-12" width="9" height="5" rx="1" fill={gold} stroke={ink} stroke-width=".5" />{/if}
	</g>
{/snippet}

{#if vehicle === 'balloon'}
	<path d="M0 -26 C-16 -26 -18 -6 -6 4 L-4 10 H4 L6 4 C18 -6 16 -26 0 -26Z" fill={acc} stroke={ink} stroke-width=".8" />
	<path d="M0 -26 C-6 -20 -6 -2 -3 4 M0 -26 C6 -20 6 -2 3 4 M-15 -12 H15" stroke={gold} stroke-width="1.2" fill="none" />
	<path d="M-4 10 L-3 16 M4 10 L3 16" stroke={ink} /><rect x="-4" y="16" width="8" height="5" fill={ink} />
{:else if vehicle === 'junk'}
	<path d="M-18 8 L18 8 L14 15 L-14 15Z" fill={ink} />
	<path d="M-6 8 V-16 M6 8 V-10" stroke={ink} stroke-width="1.6" />
	<path d="M-6 -16 h-12 l2 22 h10Z M6 -10 h10 l-2 16 h-8Z" fill={acc} stroke={ink} stroke-width=".6" />
	<path d="M-17 -10 h11 M-17 -4 h11 M-16 2 h10 M7 -4 h8 M7 2 h7" stroke={ink} stroke-width=".6" />
{:else if vehicle === 'dhow'}
	<path d="M-18 8 L20 6 L14 15 L-12 15Z" fill={ink} />
	<path d="M0 8 V-14" stroke={ink} stroke-width="1.5" /><path d="M-14 4 L12 -20 L4 6Z" fill={paper} stroke={ink} stroke-width=".7" />
{:else if vehicle === 'galleon'}
	<path d="M-22 6 L22 6 L18 16 L-18 16Z M14 6 L22 0 L22 6Z" fill={ink} />
	<path d="M-8 6 V-20 M6 6 V-16" stroke={ink} stroke-width="1.5" />
	<path d="M-16 -16 h16 v10 h-16Z M-15 -4 h14 v8 h-14Z M0 -12 h13 v9 h-13Z" fill={paper} stroke={ink} stroke-width=".6" />
	<path d="M-8 -20 l6 2 l-6 2Z" fill={acc} />
{:else if vehicle === 'steamer'}
	<path d="M-22 6 L22 6 L18 15 L-18 15Z" fill={ink} />
	<rect x="-12" y="-2" width="20" height="8" fill={paper} stroke={ink} stroke-width=".7" />
	<rect x="-2" y="-12" width="5" height="10" fill={acc} stroke={ink} stroke-width=".6" />
	<g class="smoke"><circle cx="2" cy="-16" r="3" fill={ink} opacity=".25" /><circle cx="-4" cy="-22" r="4" fill={ink} opacity=".18" /><circle cx="-12" cy="-26" r="5" fill={ink} opacity=".12" /></g>
{:else if vehicle === 'canoe'}
	<path d="M-20 8 Q0 14 20 8 L16 12 Q0 16 -16 12Z" fill={ink} />
	<path d="M-12 4 H12 M-8 4 V-2 M8 4 V-2" stroke={ink} />
	<path d="M0 8 V-18 L12 -4Z" fill={acc} stroke={ink} stroke-width=".6" />
{:else if vehicle === 'barge'}
	<path d="M-20 8 H20 L16 14 H-16Z" fill={ink} />
	<path d="M-10 8 V0 Q0 -6 10 0 V8" fill={gold} stroke={ink} stroke-width=".7" />
	<path d="M16 8 L24 -10" stroke={ink} stroke-width="1.2" />
{:else if vehicle === 'train'}
	<g transform="translate(6 0)">
		<rect x="-4" y="-6" width="16" height="12" fill={ink} /><rect x="6" y="-12" width="4" height="6" fill={ink} /><path d="M12 6 L16 10 H-4" stroke={ink} />
		<circle cx="0" cy="8" r="3" fill={paper} stroke={ink} /><circle cx="8" cy="8" r="3" fill={paper} stroke={ink} />
		<rect x="-26" y="-4" width="20" height="10" fill={acc} stroke={ink} stroke-width=".6" /><circle cx="-22" cy="8" r="2.5" fill={ink} /><circle cx="-10" cy="8" r="2.5" fill={ink} />
		<g class="smoke"><circle cx="8" cy="-16" r="3" fill={ink} opacity=".25" /><circle cx="2" cy="-21" r="4" fill={ink} opacity=".15" /></g>
	</g>
{:else if vehicle === 'camel'}
	{@render camel(-24, true)}{@render camel(-4, true)}{@render camel(16, false)}
	<path d="M10 -8 v-6" stroke={ink} /><circle cx="10" cy="-15" r="1.6" fill={ink} />
{:else if vehicle === 'horse'}
	<path d="M-12 0 Q-10 -6 2 -6 L8 -12 Q12 -14 13 -10 L10 -4 Q8 2 4 2 Z" fill={ink} />
	<path d="M-10 0 v12 M-6 1 v11 M2 2 v10 M5 2 v10 M-12 -1 q-5 4 -4 9" stroke={ink} stroke-width="1.5" fill="none" />
	<path d="M-4 -7 v-8 M-7 -12 h6" stroke={ink} stroke-width="1.6" /><circle cx="-4" cy="-17" r="2" fill={ink} />
	<rect x="-8" y="-8" width="8" height="3" fill={acc} />
{:else if vehicle === 'elephant'}
	<path d="M-14 4 Q-14 -10 0 -10 Q12 -10 13 0 Q16 4 15 12 L12 12 Q12 6 10 6 L8 12 H3 L3 6 H-6 L-6 12 H-11 L-11 6 Q-14 6 -14 4Z" fill={ink} />
	<rect x="-8" y="-18" width="12" height="8" fill={acc} stroke={ink} stroke-width=".6" /><path d="M-9 -18 L-2 -23 L5 -18Z" fill={gold} />
{:else if vehicle === 'yak'}
	{#each [-12, 10] as dx}
		<g transform="translate({dx} 0)"><path d="M-10 4 Q-10 -6 0 -6 Q8 -6 10 0 L14 -2 Q14 4 10 4 Q4 10 -8 8Z" fill={ink} /><path d="M-8 8 v5 M-3 8 v5 M3 8 v5 M7 7 v5" stroke={ink} stroke-width="1.5" /><path d="M12 -3 q3 -4 0 -6" stroke={paper} stroke-width="1" fill="none" /></g>
	{/each}
	<rect x="-16" y="-10" width="8" height="5" fill={gold} stroke={ink} stroke-width=".5" />
{:else if vehicle === 'mule'}
	<path d="M-10 2 Q-10 -5 0 -5 L6 -10 L8 -14 L10 -9 L9 -4 Q8 2 4 2Z" fill={ink} />
	<path d="M-8 2 v10 M-4 2 v10 M2 2 v10 M5 2 v10" stroke={ink} stroke-width="1.4" />
	<rect x="-9" y="-11" width="7" height="7" fill={gold} stroke={ink} stroke-width=".5" /><rect x="-3" y="-10" width="5" height="6" fill={acc} stroke={ink} stroke-width=".5" />
{:else if vehicle === 'cart'}
	<path d="M6 0 Q6 -6 14 -6 Q20 -6 20 0 L18 2 H8Z" fill={ink} /><path d="M8 2 v10 M12 2 v10 M16 2 v10 M19 2 v9 M20 -6 l3 -3 M14 -6 l-2 -3" stroke={ink} stroke-width="1.4" />
	<path d="M6 -1 H-6" stroke={ink} stroke-width="1.4" /><rect x="-20" y="-8" width="16" height="9" fill={gold} stroke={ink} stroke-width=".6" />
	<circle cx="-12" cy="5" r="5" fill="none" stroke={ink} stroke-width="1.5" /><path d="M-12 0 v10 M-17 5 h10" stroke={ink} stroke-width=".6" />
{:else if vehicle === 'coach'}
	<path d="M10 0 Q10 -6 18 -6 L22 -12 L24 -8 L22 -2 Q20 2 16 2Z" fill={ink} /><path d="M12 2 v10 M15 2 v10 M19 2 v10" stroke={ink} stroke-width="1.4" />
	<path d="M10 -2 H2" stroke={ink} /><rect x="-20" y="-12" width="22" height="14" rx="2" fill={acc} stroke={ink} stroke-width=".7" /><rect x="-16" y="-9" width="6" height="6" fill={paper} />
	<circle cx="-15" cy="6" r="5" fill="none" stroke={ink} stroke-width="1.5" /><circle cx="-3" cy="6" r="5" fill="none" stroke={ink} stroke-width="1.5" />
{:else if vehicle === 'palanquin'}
	<path d="M-24 -2 H24" stroke={ink} stroke-width="2" /><rect x="-9" y="-13" width="18" height="12" fill={acc} stroke={ink} stroke-width=".6" /><path d="M-11 -13 L0 -19 L11 -13Z" fill={ink} />
	{#each [-20, 18] as dx}<g transform="translate({dx} 0)"><circle cx="0" cy="-6" r="2" fill={ink} /><path d="M0 -4 v8 M0 4 l-3 7 M0 4 l3 7 M0 -2 l3 -1" stroke={ink} stroke-width="1.4" /></g>{/each}
{:else}
	<!-- on foot: a traveller with a staff, hat and bundle -->
	<circle cx="0" cy="-10" r="2.6" fill={ink} /><path d="M-6 -12 L0 -16 L6 -12Z" fill={gold} stroke={ink} stroke-width=".5" />
	<path d="M0 -7 v9 M0 2 l-4 10 M0 2 l4 10 M0 -4 l5 3 M6 -14 L4 12" stroke={ink} stroke-width="1.6" fill="none" />
	<rect x="-7" y="-6" width="5" height="6" fill={acc} stroke={ink} stroke-width=".5" />
{/if}

<style>
	.smoke {
		animation: puff 2s ease-out infinite;
	}
	@keyframes puff {
		from {
			opacity: 0.4;
			transform: translate(0, 2px);
		}
		to {
			opacity: 0;
			transform: translate(-10px, -6px);
		}
	}
</style>
