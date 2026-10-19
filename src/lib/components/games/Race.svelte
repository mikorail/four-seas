<script lang="ts">
	import { untrack } from 'svelte';
	// Race game (chaupar / tavla / sho / knucklebones): safe or bold throws; landing on the rival sends them home.
	let { onend, seed, name }: { onend: (won: boolean) => void; seed: number; name: string } = $props();
	const GOAL = 24;
	let rnd = untrack(() => seed); // seeded once per game
	const r = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648);
	const die = () => 1 + Math.floor(r() * 6);
	let me = $state(0);
	let them = $state(0);
	let log = $state('Safe throw: 1–3 steps. Bold throw: two dice, but double ones lose your turn.');
	let over = false;
	function throwDice(bold: boolean) {
		if (over) return;
		let step: number;
		if (bold) {
			const a = die();
			const b = die();
			step = a === 1 && b === 1 ? 0 : a + b;
			log = step ? `You throw ${a}+${b}.` : 'Double ones! You lose your turn.';
		} else {
			step = 1 + Math.floor(r() * 3);
			log = `You move ${step}.`;
		}
		me = Math.min(GOAL, me + step);
		if (me === them && me > 0 && me < GOAL) {
			them = 0;
			log += ' You land on them: back to the start!';
		}
		if (me >= GOAL) return finish(true);
		// opponent always throws bold when behind, safe when ahead
		const a = die();
		const b = die();
		const s = them < me ? (a === 1 && b === 1 ? 0 : a + b) : 1 + Math.floor(r() * 3);
		them = Math.min(GOAL, them + s);
		if (them === me && them < GOAL) {
			me = 0;
			log += ' They land on you: back to the start!';
		}
		if (them >= GOAL) finish(false);
	}
	function finish(won: boolean) {
		over = true;
		setTimeout(() => onend(won), 700);
	}
</script>

<p class="rule"><b>{name}</b>: first to {GOAL}. {log}</p>
<div class="track" aria-label="Race track">
	{#each { length: GOAL + 1 } as _, i}
		<span class="sq" class:goal={i === GOAL}>{#if i === me}<i class="pc me"></i>{/if}{#if i === them}<i class="pc them"></i>{/if}</span>
	{/each}
</div>
<div class="row">
	<button class="ghost" onclick={() => throwDice(false)}>Safe throw</button>
	<button class="primary" onclick={() => throwDice(true)}>Bold throw</button>
</div>

<style>
	.rule { text-align: center; margin: 0 0 10px; }
	.track { display: grid; grid-template-columns: repeat(13, 1fr); gap: 3px; margin: 10px 0; }
	.sq { aspect-ratio: 1; border: 1px solid var(--line); border-radius: 4px; display: grid; place-items: center; font-size: 0.7rem; background: var(--card); }
	.sq:nth-child(4n) { background: color-mix(in srgb, var(--vermilion) 14%, var(--card)); }
	.sq.goal { background: var(--gold); }
	.pc { width: 60%; height: 60%; border-radius: 50%; border: 1px solid var(--ink); }
	.pc.me { background: var(--vermilion); }
	.pc.them { background: var(--ink); }
	.row { display: flex; gap: 10px; justify-content: center; }
</style>
