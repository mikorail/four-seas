<script lang="ts">
	// Small ink-brush icons for the HUD, coloured by the theme (replacing emoji).
	let { name, size = 15 }: { name: 'bag' | 'merit' | 'tasks' | 'journal' | 'heart' | 'lantern' | 'mount' | 'crew' | 'sun' | 'storm'; size?: number } = $props();
</script>

<svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" class="ink">
	<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		{#if name === 'bag'}
			<path d="M4 7h12l-1 10H5z" /><path d="M7 7V5a3 3 0 0 1 6 0v2" />
		{:else if name === 'merit'}
			<circle cx="10" cy="10" r="7" /><path d="M10 3a3.5 3.5 0 0 1 0 7a3.5 3.5 0 0 0 0 7" /><circle cx="10" cy="6.5" r="0.9" fill="currentColor" /><circle cx="10" cy="13.5" r="0.9" />
		{:else if name === 'tasks'}
			<path d="M10 2l6 8l-6 8l-6-8z" /><path d="M10 6v8" />
		{:else if name === 'journal'}
			<path d="M5 3h9a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2z" /><path d="M5 15a2 2 0 0 1 2-2h9" /><path d="M8 7h5M8 10h3" />
		{:else if name === 'heart'}
			<path d="M10 16s-6-3.6-6-8a3.3 3.3 0 0 1 6-2a3.3 3.3 0 0 1 6 2c0 4.4-6 8-6 8z" fill="currentColor" fill-opacity=".25" />
		{:else if name === 'lantern'}
			<path d="M10 2v2" /><ellipse cx="10" cy="10.5" rx="5" ry="6" fill="currentColor" fill-opacity=".2" /><path d="M5.5 8h9M5.5 13h9M8 16.5v1.5h4v-1.5" />
		{:else if name === 'mount'}
			<path d="M3 15l2-6 3-2 5 1 3-3 1 2-2 3v5" /><path d="M6 15v2M13 15v2" />
		{:else if name === 'crew'}
			<circle cx="7" cy="7" r="2.5" /><circle cx="13.5" cy="7.5" r="2" /><path d="M2.5 16a4.5 4.5 0 0 1 9 0M11 16a3.5 3.5 0 0 1 6.5 0" />
		{:else if name === 'sun'}
			<circle cx="10" cy="10" r="3.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" />
		{:else if name === 'storm'}
			<path d="M5 12a4 4 0 0 1 1-8a5 5 0 0 1 9 2a3 3 0 0 1 0 6z" /><path d="M10 12l-2 4h3l-2 3" />
		{/if}
	</g>
</svg>

<style>
	.ink {
		vertical-align: -2px;
		flex: none;
	}
</style>
