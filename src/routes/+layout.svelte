<script lang="ts">
	import '@fontsource/cormorant-garamond/500.css';
	import '@fontsource/cormorant-garamond/600.css';
	import '@fontsource/cormorant-garamond/700.css';
	import '@fontsource/eb-garamond/400.css';
	import '@fontsource/eb-garamond/400-italic.css';
	import '../lib/fonts-cjk.css';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import PwaBar from '#lib/components/PwaBar.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Four Seas</title>
	<meta name="description" content="A swipe-driven journey across Asia, 1500–1900." />
</svelte:head>

{@render children()}
<PwaBar />
