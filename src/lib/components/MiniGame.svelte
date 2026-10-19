<script lang="ts">
	import { untrack } from 'svelte';
	import type { CultureId } from '#lib/data/cultures';
	import Tiles from './games/Tiles.svelte';
	import Hanafuda from './games/Hanafuda.svelte';
	import Race from './games/Race.svelte';
	import Mancala from './games/Mancala.svelte';
	import AtariGo from './games/AtariGo.svelte';
	import { themeStyle } from '#lib/data/themes';

	let { culture, seed, onend, onskip }: { culture: CultureId; seed: number; onend: (won: boolean) => void; onskip: () => void } = $props();

	const odd = untrack(() => seed % 2 === 1);
	const GAME: Record<CultureId, { kind: 'tiles' | 'hanafuda' | 'race' | 'mancala' | 'go'; name: string }> = {
		han: { kind: odd ? 'tiles' : 'go', name: odd ? 'Mahjong tiles' : 'Weiqi (Go)' },
		japanese: { kind: odd ? 'hanafuda' : 'go', name: odd ? 'Hanafuda' : 'Igo' },
		korean: { kind: 'go', name: 'Baduk' },
		viet: { kind: 'tiles', name: 'Tổ tôm tiles' },
		siamese: { kind: 'mancala', name: 'Mak khom' },
		malay: { kind: 'mancala', name: 'Congkak' },
		indian: { kind: 'race', name: 'Chaupar' },
		tibetan: { kind: 'race', name: 'Sho' },
		steppe: { kind: 'race', name: 'Knucklebones' },
		persian: { kind: 'race', name: 'Nard (backgammon)' },
		ottoman: { kind: 'race', name: 'Tavla' },
		swahili: { kind: 'mancala', name: 'Bao' },
		european: { kind: 'tiles', name: 'Pelmanism' },
		pacific: { kind: 'go', name: 'Kōnane' }
	};
	const game = $derived(GAME[culture]);
	let result = $state<boolean | null>(null);
	function end(won: boolean) {
		result = won;
		setTimeout(() => onend(won), 900);
	}
</script>

<div class="scrim" role="presentation"></div>
<div class="mg themed" style={themeStyle(culture)} role="dialog" aria-label="{game.name} mini-game">
	<header>
		<h3>🎲 {game.name}</h3>
		<button class="skip" onclick={onskip}>Let the dice decide</button>
	</header>
	{#if result === null}
		{#if game.kind === 'tiles'}<Tiles onend={end} {seed} />
		{:else if game.kind === 'hanafuda'}<Hanafuda onend={end} {seed} />
		{:else if game.kind === 'race'}<Race onend={end} {seed} name={game.name} />
		{:else if game.kind === 'mancala'}<Mancala onend={end} name={game.name} />
		{:else}<AtariGo onend={end} name={game.name} />{/if}
	{:else}
		<p class="res" class:won={result}>{result ? 'You win!' : 'You lose.'}</p>
	{/if}
</div>

<style>
	.scrim { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); z-index: 40; }
	.mg { border-top: 6px solid var(--vermilion) !important; background-image: linear-gradient(var(--paper), var(--paper)), var(--z-pattern); position: fixed; z-index: 41; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(560px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); overflow: auto; background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px 18px; box-shadow: 0 20px 50px var(--shadow); }
	header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	h3 { font-family: var(--display); margin: 0; font-size: 1.4rem; }
	.skip { font: inherit; font-size: 0.8rem; background: none; border: 0; color: var(--muted); text-decoration: underline; cursor: pointer; }
	.res { text-align: center; font-family: var(--display); font-size: 2rem; color: var(--vermilion); }
	.res.won { color: var(--jade); }
</style>
