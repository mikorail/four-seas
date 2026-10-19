<script lang="ts">
	// Highlights the facts a player needs at a glance: **marked** text, names, places, amounts, days.
	let { text, names = [] }: { text: string; names?: string[] } = $props();

	type Seg = { t: string; k: 'plain' | 'bold' | 'num' | 'name' };
	const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	const segs = $derived.by((): Seg[] => {
		const ns = [...new Set(names.filter((n) => n && n.length > 2))].sort((a, b) => b.length - a.length);
		const parts = [
			'\\*\\*(.+?)\\*\\*',
			'(\\b\\d+(?:[.,]\\d+)?\\s?(?:silver|taels|tael|days?|weeks?|months?|li|km|years?|ships?|junks?|pts|%))',
			ns.length ? `(${ns.map(escape).join('|')})` : '(?!x)x'
		];
		const re = new RegExp(parts.join('|'), 'g');
		const out: Seg[] = [];
		let last = 0;
		for (const m of text.matchAll(re)) {
			if (m.index! > last) out.push({ t: text.slice(last, m.index), k: 'plain' });
			if (m[1]) out.push({ t: m[1], k: 'bold' });
			else if (m[2]) out.push({ t: m[2], k: 'num' });
			else out.push({ t: m[3], k: 'name' });
			last = m.index! + m[0].length;
		}
		if (last < text.length) out.push({ t: text.slice(last), k: 'plain' });
		return out;
	});
</script>

{#each segs as s}{#if s.k === 'plain'}{s.t}{:else}<strong class={s.k}>{s.t}</strong>{/if}{/each}

<style>
	strong {
		font-weight: 700;
	}
	strong.bold {
		color: var(--vermilion);
	}
	strong.num {
		color: var(--ink);
		background: color-mix(in srgb, var(--gold) 22%, transparent);
		padding: 0 3px;
		border-radius: 3px;
	}
	strong.name {
		color: var(--ink);
	}
</style>
