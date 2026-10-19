<script lang="ts">
	// Bao / congkak as Kalah: sow seeds counter-clockwise; last seed in your store = go again; in an empty pit = capture.
	let { onend, name }: { onend: (won: boolean) => void; name: string } = $props();
	// pits 0-5 yours, 6 your store, 7-12 theirs, 13 their store
	let b = $state([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
	let msg = $state('Pick one of your pits (bottom row).');
	let busy = false;
	function sow(board: number[], i: number, mine: boolean): { board: number[]; again: boolean } {
		const x = [...board];
		let n = x[i];
		x[i] = 0;
		let p = i;
		while (n > 0) {
			p = (p + 1) % 14;
			if (p === (mine ? 13 : 6)) continue;
			x[p]++;
			n--;
		}
		const own = mine ? p >= 0 && p <= 5 : p >= 7 && p <= 12;
		if (own && x[p] === 1 && x[12 - p] > 0) {
			x[mine ? 6 : 13] += x[12 - p] + 1;
			x[p] = 0;
			x[12 - p] = 0;
		}
		return { board: x, again: p === (mine ? 6 : 13) };
	}
	const empty = (x: number[], mine: boolean) => (mine ? x.slice(0, 6) : x.slice(7, 13)).every((v) => v === 0);
	function end(x: number[]) {
		const mine = x[6] + x.slice(0, 6).reduce((a, v) => a + v, 0);
		const theirs = x[13] + x.slice(7, 13).reduce((a, v) => a + v, 0);
		msg = `Game over: you ${mine}, them ${theirs}.`;
		setTimeout(() => onend(mine > theirs), 900);
	}
	function aiTurn(x: number[]) {
		let again = true;
		while (again && !empty(x, false)) {
			let best = 7;
			let bestScore = -99;
			for (let i = 7; i <= 12; i++) {
				if (!x[i]) continue;
				const t = sow(x, i, false);
				const sc = t.board[13] - x[13] + (t.again ? 3 : 0);
				if (sc > bestScore) {
					bestScore = sc;
					best = i;
				}
			}
			const t = sow(x, best, false);
			x = t.board;
			again = t.again;
		}
		return x;
	}
	function pick(i: number) {
		if (busy || !b[i]) return;
		const t = sow(b, i, true);
		b = t.board;
		if (empty(b, true) || empty(b, false)) return end(b);
		if (t.again) {
			msg = 'Last seed in your store: go again!';
			return;
		}
		busy = true;
		msg = 'They are sowing…';
		setTimeout(() => {
			b = aiTurn(b);
			busy = false;
			msg = 'Your turn.';
			if (empty(b, true) || empty(b, false)) end(b);
		}, 600);
	}
</script>

<p class="rule"><b>{name}</b>: {msg}</p>
<div class="board" aria-label="Mancala board">
	<span class="store">{b[13]}</span>
	<div class="rows">
		<div class="pits">{#each [12, 11, 10, 9, 8, 7] as i}<span class="pit">{b[i]}</span>{/each}</div>
		<div class="pits">{#each [0, 1, 2, 3, 4, 5] as i}<button class="pit mine" onclick={() => pick(i)} disabled={!b[i]} aria-label="Pit with {b[i]} seeds">{b[i]}</button>{/each}</div>
	</div>
	<span class="store mine">{b[6]}</span>
</div>

<style>
	.rule { text-align: center; margin: 0 0 10px; }
	.board { display: flex; align-items: center; gap: 8px; justify-content: center; background: var(--z-pattern, none) center/22px, color-mix(in srgb, var(--gold) 45%, var(--ink)); padding: 10px; border-radius: 40px; border: 2px solid var(--ink); }
	.rows { display: flex; flex-direction: column; gap: 6px; }
	.pits { display: flex; gap: 6px; }
	.pit, .store { width: 40px; height: 40px; border-radius: 50%; background: color-mix(in srgb, var(--ink) 75%, var(--gold)); color: var(--paper); display: grid; place-items: center; font: inherit; font-weight: 700; border: 0; }
	.store { height: 92px; border-radius: 20px; }
	.mine { background: color-mix(in srgb, var(--vermilion) 40%, var(--ink)); cursor: pointer; }
	.store.mine { background: color-mix(in srgb, var(--vermilion) 40%, var(--ink)); }
	button.pit:disabled { opacity: 0.5; cursor: default; }
</style>
