<script lang="ts">
	// Atari Go on a 6×6 board: the first to capture a stone wins.
	let { onend, name }: { onend: (won: boolean) => void; name: string } = $props();
	const N = 6;
	let g = $state<(0 | 1 | 2)[]>(Array(N * N).fill(0)); // 1 you (black), 2 them
	let msg = $state('You play black. Capture a white stone to win.');
	let over = false;
	const nb = (i: number) => [i - N, i + N, i % N ? i - 1 : -1, i % N < N - 1 ? i + 1 : -1].filter((j) => j >= 0 && j < N * N);
	function group(x: (0 | 1 | 2)[], i: number) {
		const c = x[i];
		const seen = new Set([i]);
		const libs = new Set<number>();
		const st = [i];
		while (st.length) {
			const k = st.pop()!;
			for (const j of nb(k)) {
				if (x[j] === 0) libs.add(j);
				else if (x[j] === c && !seen.has(j)) {
					seen.add(j);
					st.push(j);
				}
			}
		}
		return { stones: [...seen], libs: libs.size };
	}
	const captures = (x: (0 | 1 | 2)[], who: 1 | 2) => x.some((v, i) => v === (who === 1 ? 2 : 1) && group(x, i).libs === 0);
	const suicide = (x: (0 | 1 | 2)[], i: number, who: 1 | 2) => group(x, i).libs === 0 && !captures(x, who);
	function aiMove(x: (0 | 1 | 2)[]): number {
		const empties = x.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
		const tryMove = (i: number, who: 1 | 2) => {
			const y = [...x];
			y[i] = who;
			return y;
		};
		// 1) capture if possible
		for (const i of empties) if (captures(tryMove(i, 2), 2)) return i;
		// 2) save own stones in atari
		for (let i = 0; i < x.length; i++)
			if (x[i] === 2) {
				const gr = group(x, i);
				if (gr.libs === 1) for (const j of empties) if (nb(j).some((k) => gr.stones.includes(k)) && group(tryMove(j, 2), j).libs > 1) return j;
			}
		// 3) put black stones in atari, else play near the action
		for (const i of empties) {
			const y = tryMove(i, 2);
			if (!suicide(y, i, 2) && y.some((v, k) => v === 1 && group(y, k).libs === 1)) return i;
		}
		const near = empties.filter((i) => nb(i).some((k) => x[k] !== 0) && !suicide(tryMove(i, 2), i, 2));
		const pool = near.length ? near : empties;
		return pool[Math.floor(Math.random() * pool.length)];
	}
	function play(i: number) {
		if (over || g[i]) return;
		const y = [...g];
		y[i] = 1;
		if (suicide(y, i, 1)) {
			msg = 'That stone would have no liberties.';
			return;
		}
		g = y;
		if (captures(g, 1)) return finish(true, 'You captured a white stone!');
		const j = aiMove(g);
		if (j === undefined) return finish(true, 'White has no moves.');
		const z = [...g];
		z[j] = 2;
		g = z;
		if (captures(g, 2)) finish(false, 'White captured your stones.');
	}
	function finish(won: boolean, m: string) {
		over = true;
		msg = m;
		setTimeout(() => onend(won), 900);
	}
</script>

<p class="rule"><b>{name}</b>: {msg}</p>
<div class="board" role="grid" aria-label="Go board" style:grid-template-columns="repeat({N}, 1fr)">
	{#each g as v, i}
		<button class="pt" onclick={() => play(i)} aria-label={v === 1 ? 'Black stone' : v === 2 ? 'White stone' : 'Empty point'}>
			{#if v}<span class="stone" class:w={v === 2}></span>{/if}
		</button>
	{/each}
</div>

<style>
	.rule { text-align: center; margin: 0 0 10px; }
	.board { display: grid; width: min(300px, 80vw); aspect-ratio: 1; margin: 0 auto; background: color-mix(in srgb, var(--gold) 55%, var(--card)); padding: 8px; border-radius: 6px; gap: 0; border: 2px solid var(--ink); }
	.pt { position: relative; border: 0; background: none; padding: 0; cursor: pointer; }
	.pt::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1px solid color-mix(in srgb, var(--ink) 70%, transparent); }
	.pt::after { content: ''; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid color-mix(in srgb, var(--ink) 70%, transparent); }
	.stone { position: absolute; inset: 12%; border-radius: 50%; background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--ink) 60%, #888), #000); z-index: 1; }
	.stone.w { background: radial-gradient(circle at 35% 35%, #fff, color-mix(in srgb, var(--paper) 80%, #999)); }
</style>
