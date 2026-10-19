<script lang="ts">
	import { CODEX } from '#lib/data/codex';

	let { onclose }: { onclose: () => void } = $props();
	let q = $state('');
	const list = $derived(CODEX.filter((e) => !q || (e.title + e.text).toLowerCase().includes(q.toLowerCase())));
</script>

<div class="scrim" onclick={onclose} role="presentation"></div>
<div class="codex" role="dialog" aria-label="Codex">
	<header>
		<h3>Codex</h3>
		<button class="x" onclick={onclose} aria-label="Close">✕</button>
	</header>
	<input type="search" placeholder="Search…" bind:value={q} aria-label="Search the codex" />
	<ul>
		{#each list as e (e.id)}
			<li>
				<span class="g">{e.glyph}</span>
				<div><b>{e.title}</b><p>{e.text}</p></div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 21;
	}
	.codex {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(520px, calc(100vw - 24px));
		max-height: calc(100dvh - 32px);
		overflow-y: auto;
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 16px 18px;
		z-index: 22;
		box-shadow: 0 20px 50px var(--shadow);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
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
	input {
		width: 100%;
		margin: 10px 0;
		padding: 7px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		font: inherit;
		box-sizing: border-box;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 10px;
	}
	li {
		display: flex;
		gap: 10px;
	}
	.g {
		font-size: 1.3rem;
		font-family: var(--cjk);
		color: var(--gold-text);
		width: 1.8rem;
		text-align: center;
	}
	p {
		margin: 2px 0 0;
		font-size: 0.86rem;
		line-height: 1.4;
		color: var(--muted);
	}
</style>
