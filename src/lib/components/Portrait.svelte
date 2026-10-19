<script lang="ts">
	import { Rng } from '#lib/rng';
	import { CULTURES, type CultureId, type Gender, type HatKind } from '#lib/data/cultures';
	import type { Role } from '#lib/game/types';

	let {
		culture,
		gender,
		seed,
		year,
		role = 'hero',
		size = 120,
		mood = 'neutral',
		blink = true,
		hatOverride = undefined,
		robeOverride = undefined
	}: { culture: CultureId; gender: Gender; seed: number; year: number; role?: Role; size?: number; mood?: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised'; blink?: boolean; hatOverride?: HatKind | 'keep'; robeOverride?: string } = $props();

	// Broad facial "families", tuned per people, not one face with different hats.
	type Beard = 'none' | 'wisp' | 'moustache' | 'handlebar' | 'full' | 'droop' | 'goatee' | 'sideburns' | 'short';
	type Folk = 'eastasia' | 'japan' | 'seasia' | 'southasia' | 'highland' | 'westasia' | 'africa' | 'europe';
	const FOLK: Record<CultureId, Folk> = {
		han: 'eastasia', korean: 'eastasia', viet: 'eastasia', japanese: 'japan', siamese: 'seasia', malay: 'seasia',
		indian: 'southasia', tibetan: 'highland', steppe: 'highland', persian: 'westasia', ottoman: 'westasia', swahili: 'africa', european: 'europe', pacific: 'seasia'
	};

	const p = $derived.by(() => {
		const r = new Rng(seed);
		const c = CULTURES[culture];
		const folk = FOLK[culture];
		let hat: HatKind = c.hat(year, gender);
		if (hat === 'chada' && role !== 'noble') hat = 'bare';
		if (role === 'monk' && c.holyPlace !== 'church') hat = c.holyPlace === 'mosque' || c.holyPlace === 'madrasa' ? 'taj' : 'bare';
		if (role === 'child' && gender === 'm' && !['songkok', 'kofia', 'turban'].includes(hat)) hat = 'bare';
		if (hatOverride && hatOverride !== 'keep') hat = hatOverride;
		const bald = role === 'monk' && !['mosque', 'madrasa', 'church'].includes(c.holyPlace);
		const skin = role === 'ghost' ? '#dfe6e3' : r.pick(c.skin);
		const robe0 = r.pick(c.palette);
		const robe = robeOverride ?? robe0;
		const others = c.palette.filter((x) => x !== robe0);
		const accent = r.pick(others.length ? others : c.palette);
		const darkHair = ['#1b1714', '#231a14', '#2e2119'];
		const hair =
			role === 'elder'
				? r.pick(['#cfcac2', '#a9a49b', '#e6e1d8'])
				: folk === 'europe'
					? r.pick(['#2b1d14', '#5a3a22', '#8a5a2b', '#b07a3a', '#c9a36b', '#9c3e1e'])
					: folk === 'westasia' || folk === 'southasia'
						? r.pick([...darkHair, '#3a2416'])
						: r.pick(darkHair);

		// face geometry per folk
		const geo: Record<Folk, { w: [number, number]; h: [number, number] }> = {
			eastasia: { w: [15, 17], h: [19, 21] },
			japan: { w: [14, 16], h: [19, 22] },
			seasia: { w: [16, 18], h: [18, 20] },
			southasia: { w: [15, 17], h: [19, 21] },
			highland: { w: [17, 19], h: [18, 20] },
			westasia: { w: [14, 16], h: [20, 22] },
			africa: { w: [16, 18], h: [19, 21] },
			europe: { w: [14, 17], h: [19, 22] }
		};
		const faceW = r.int(...geo[folk].w);
		const faceH = r.int(...geo[folk].h);
		const jaw = r.int(0, 2); // 0 round, 1 square, 2 tapered

		const eyeColor = folk === 'europe' ? r.pick(['#3d6fa8', '#4f7f4a', '#6b4a2b', '#7c8a96', '#3b2a1e']) : r.pick(['#2a1c12', '#1e140d', '#3b2a1e']);
		const lips = folk === 'africa' || (folk === 'seasia' && r.chance(0.6)) ? 'full' : r.chance(0.5) ? 'line' : 'smile';
		const brow = folk === 'westasia' || folk === 'southasia' ? 'thick' : folk === 'europe' ? r.pick(['arched', 'straight', 'thick'] as const) : folk === 'highland' ? 'straight' : r.pick(['thin', 'straight'] as const);
		const mood = r.int(0, 2);

		// facial hair by folk & era
		let beard: Beard = 'none';
		if (gender === 'm' && role !== 'child' && role !== 'monk') {
			const roll = r.next();
			const table: Record<Folk, [number, Beard][]> = {
				eastasia: [[0.45, 'none'], [0.75, 'wisp'], [1, 'moustache']],
				japan: [[0.75, 'none'], [0.9, 'moustache'], [1, 'wisp']],
				seasia: [[0.75, 'none'], [1, 'moustache']],
				southasia: [[0.2, 'none'], [0.6, 'handlebar'], [0.8, 'moustache'], [1, 'full']],
				highland: [[0.3, 'none'], [0.75, 'droop'], [1, 'wisp']],
				westasia: [[0.1, 'none'], [0.8, 'full'], [1, 'moustache']],
				africa: [[0.45, 'none'], [0.8, 'short'], [1, 'moustache']],
				europe: year < 1680 ? [[0.25, 'none'], [0.65, 'goatee'], [1, 'full']] : year < 1800 ? [[0.85, 'none'], [1, 'moustache']] : [[0.3, 'none'], [0.6, 'sideburns'], [0.8, 'moustache'], [1, 'full']]
			};
			beard = table[folk].find(([t]) => roll < t)![1];
		}

		// adornments
		const f = gender === 'f';
		const bindi = folk === 'southasia' && f && r.chance(0.6);
		const tilak = folk === 'southasia' && !f && r.chance(0.25);
		const nosering = folk === 'southasia' && f && r.chance(0.45);
		const kohl = (folk === 'westasia' || folk === 'southasia' || folk === 'africa') && (f || r.chance(0.3));
		const earring = f ? (folk === 'highland' ? 'turquoise' : folk === 'europe' ? 'pearl' : folk === 'africa' || folk === 'southasia' ? 'gold' : r.chance(0.3) ? 'gold' : null) : folk === 'highland' && r.chance(0.5) ? 'turquoise' : null;
		const flower = (folk === 'seasia' && f && culture === 'siamese' && r.chance(0.6)) || (culture === 'pacific' && r.chance(f ? 0.85 : 0.3));
		const beni = folk === 'japan' && f; // red lips
		const blackTeeth = (culture === 'viet' || culture === 'japanese') && f && year < 1870 && r.chance(0.3); // ohaguro / nhuộm răng
		const coily = folk === 'africa';
		const wavy = folk === 'europe' || folk === 'westasia' || (folk === 'southasia' && r.chance(0.5));
		const freckles = folk === 'europe' && r.chance(0.25);
		const scale = role === 'child' ? 0.82 : 1;
		const bgHue = r.int(0, 3);
		return { folk, hat, bald, skin, robe, accent, hair, faceW, faceH, jaw, eyeColor, lips, brow, mood, beard, bindi, tilak, nosering, kohl, earring, flower, beni, blackTeeth, coily, wavy, freckles, scale, bgHue };
	});

	const BG = ['var(--seal-1)', 'var(--seal-2)', 'var(--seal-3)', 'var(--seal-4)'];
	const ink = '#1d1813';
	const shade = (hex: string, amt: number) => {
		const n = parseInt(hex.slice(1), 16);
		const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
		return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
	};
	const L = $derived(50 - p.faceW);
	const R = $derived(50 + p.faceW);
	// jawline path: round / square / tapered
	const facePath = $derived.by(() => {
		const top = 48 - p.faceH;
		const bot = 48 + p.faceH;
		if (p.jaw === 1) return `M${L},44 Q${L},${top} 50,${top} Q${R},${top} ${R},44 L${R - 1},${bot - 8} Q${R - 3},${bot} 50,${bot} Q${L + 3},${bot} ${L + 1},${bot - 8}Z`;
		if (p.jaw === 2) return `M${L},44 Q${L},${top} 50,${top} Q${R},${top} ${R},44 Q${R},${bot - 10} 50,${bot + 1} Q${L},${bot - 10} ${L},44Z`;
		return `M${L},46 Q${L},${top} 50,${top} Q${R},${top} ${R},46 Q${R},${bot} 50,${bot} Q${L},${bot} ${L},46Z`;
	});
</script>

<svg viewBox="0 0 100 100" width={size} height={size} class="portrait" class:ghost={role === 'ghost'} aria-hidden="true">
	<defs>
		<clipPath id="clip-{seed}"><circle cx="50" cy="50" r="48" /></clipPath>
		{#if p.coily}
			<pattern id="coil-{seed}" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="none" stroke="#00000055" stroke-width=".7" /></pattern>
		{/if}
	</defs>
	<circle cx="50" cy="50" r="48" fill={BG[p.bgHue]} />
	<g clip-path="url(#clip-{seed})">
		{#if role === 'tiger'}
			<ellipse cx="50" cy="58" rx="34" ry="30" fill="#d9822b" />
			<circle cx="24" cy="32" r="9" fill="#d9822b" /><circle cx="76" cy="32" r="9" fill="#d9822b" />
			<circle cx="24" cy="32" r="4" fill="#f4e3c8" /><circle cx="76" cy="32" r="4" fill="#f4e3c8" />
			<ellipse cx="50" cy="72" rx="18" ry="13" fill="#f4e3c8" />
			{#each [-1, 1] as s}
				<path d="M{50 + s * 30} 52 l{-s * 10} 2 M{50 + s * 31} 60 l{-s * 11} 0 M{50 + s * 28} 68 l{-s * 9} -2" stroke={ink} stroke-width="2.5" stroke-linecap="round" />
				<path d="M{50 + s * 8} 34 l{s * 4} -6" stroke={ink} stroke-width="2.5" stroke-linecap="round" />
				<ellipse cx={50 + s * 13} cy="52" rx="5" ry="3.5" fill="#e9d36a" />
				<ellipse cx={50 + s * 13} cy="52" rx="1.2" ry="3.2" fill={ink} />
			{/each}
			<path d="M50 30 v8" stroke={ink} stroke-width="2.5" stroke-linecap="round" />
			<path d="M45 64 h10 l-5 5z" fill="#6b2e2e" />
			<path d="M50 69 q-6 6 -10 3 M50 69 q6 6 10 3" stroke={ink} stroke-width="1.5" fill="none" />
		{:else}
			<g transform="translate(50 100) scale({p.scale}) translate(-50 -100)">
				<!-- robe -->
				<path d="M8 104 Q12 80 30 76 L70 76 Q88 80 92 104 Z" fill={p.robe} />
				{#if ['eastasia', 'japan'].includes(p.folk)}
					<path d="M38 76 L56 100 M62 76 L50 88" stroke={p.accent} stroke-width="5" fill="none" />
				{:else if p.folk === 'europe'}
					{#if year < 1680}<path d="M34 76 Q50 86 66 76 L64 80 Q50 90 36 80Z" fill="#f3efe6" />{:else}<path d="M42 76 L50 92 L58 76" fill="#f3efe6" />{/if}
				{:else if p.folk === 'southasia' || p.folk === 'westasia'}
					<path d="M44 76 L50 100 L56 76" stroke={p.accent} stroke-width="3" fill="none" /><circle cx="50" cy="84" r="1.4" fill="#d4a017" /><circle cx="50" cy="90" r="1.4" fill="#d4a017" />
				{:else if p.folk === 'highland'}
					<path d="M36 76 Q50 98 68 78" stroke={p.accent} stroke-width="6" fill="none" /><path d="M36 76 Q50 98 68 78" stroke="#ffffff55" stroke-width="1.5" fill="none" />
				{:else}
					<path d="M40 76 Q50 90 60 76" stroke={p.accent} stroke-width="4" fill="none" />
				{/if}
				<!-- neck -->
				<rect x="44" y="62" width="12" height="16" fill={shade(p.skin, -0.08)} />
				<!-- long hair behind -->
				{#if !p.bald && (p.hat === 'hairpin' || (p.hat === 'bun' && p.folk !== 'europe') || (gender === 'f' && ['bare', 'chada'].includes(p.hat)))}
					<!-- hair behind the head: stops above the chin, with locks falling behind the shoulders -->
					<ellipse cx="50" cy={46} rx={p.faceW + 4} ry={p.faceH} fill={p.hair} />
					{#if gender === 'f' && p.hat !== 'bun'}
						<path d="M{L - 4} 46 L{L - 5} 74 L{L + 2} 74 L{L + 1} 52Z M{R + 4} 46 L{R + 5} 74 L{R - 2} 74 L{R - 1} 52Z" fill={p.hair} />
					{/if}
				{/if}
				{#if p.hat === 'bun' && p.folk === 'europe'}
					<ellipse cx="50" cy="46" rx={p.faceW + 4} ry={p.faceH} fill={p.hair} />
					<path d="M{L - 4} 44 q-3 10 0 20 q2 4 5 2 l-1 -18Z M{R + 4} 44 q3 10 0 20 q-2 4 -5 2 l1 -18Z" fill={p.hair} />
				{/if}
				<!-- ears -->
				<ellipse cx={L} cy="50" rx="3" ry="4.5" fill={p.skin} />
				<ellipse cx={R} cy="50" rx="3" ry="4.5" fill={p.skin} />
				{#if p.earring}
					{@const col = p.earring === 'turquoise' ? '#2bb3a8' : p.earring === 'pearl' ? '#f4f1ea' : '#d4a017'}
					<circle cx={L - 0.5} cy="56" r="1.8" fill={col} stroke="#0003" stroke-width=".4" /><circle cx={R + 0.5} cy="56" r="1.8" fill={col} stroke="#0003" stroke-width=".4" />
				{/if}
				<!-- face -->
				<path d={facePath} fill={p.skin} />
				{#if p.folk === 'highland' || p.folk === 'westasia'}
					<!-- cheekbones -->
					<path d="M{L + 3} 55 q5 -3 9 0" stroke={shade(p.skin, -0.12)} stroke-width="1.4" fill="none" opacity=".6" />
					<path d="M{R - 3} 55 q-5 -3 -9 0" stroke={shade(p.skin, -0.12)} stroke-width="1.4" fill="none" opacity=".6" />
				{/if}
				<!-- hair cap -->
				{#if !p.bald && !['veil', 'turban', 'taj', 'kavuk'].includes(p.hat)}
					{#if p.hat === 'topknot'}
						<path d="M{L} 46 Q{L} 32 {50 - 8} 31 L{50 - 8} 40 Q{L + 2} 42 {L + 1} 50 Z" fill={p.hair} />
						<path d="M{R} 46 Q{R} 32 {50 + 8} 31 L{50 + 8} 40 Q{R - 2} 42 {R - 1} 50 Z" fill={p.hair} />
						<path d="M44 30 h12 v-3 h-12z M49 27 q1 -8 6 -9 l1 3 q-4 1 -4 6z" fill={p.hair} />
					{:else if p.hat === 'queue'}
						<path d="M{L} 44 Q50 22 {R} 44 Q50 36 {L} 44Z" fill={p.hair} />
					{:else if p.coily}
						<path d="M{L - 2} 48 Q{L - 4} 22 50 22 Q{R + 4} 22 {R + 2} 48 Q{R - 2} 34 50 33 Q{L + 2} 34 {L - 2} 48Z" fill={p.hair} />
						<path d="M{L - 2} 48 Q{L - 4} 22 50 22 Q{R + 4} 22 {R + 2} 48 Q{R - 2} 34 50 33 Q{L + 2} 34 {L - 2} 48Z" fill="url(#coil-{seed})" />
					{:else if p.wavy}
						<path d="M{L - 1} 52 Q{L - 4} 40 {L - 1} 34 Q{L} 25 50 26 Q{R} 25 {R + 1} 34 Q{R + 4} 40 {R + 1} 52 Q{R - 1} 42 {R - 4} 38 Q{50 + 4} 32 50 35 Q{50 - 4} 32 {L + 4} 38 Q{L + 1} 42 {L - 1} 52Z" fill={p.hair} />
					{:else}
						<path d="M{L - 1} 48 Q{L - 2} 26 50 27 Q{R + 2} 26 {R + 1} 48 Q{R - 3} 36 {50 + 3} 34 Q50 38 {50 - 6} 34 Q{L + 3} 37 {L - 1} 48Z" fill={p.hair} />
					{/if}
				{/if}

				<!-- brows (tilted by mood) -->
				<g class="brows" style:transform={mood === 'angry' ? 'translateY(1.5px)' : mood === 'sad' || mood === 'surprised' ? 'translateY(-1.8px)' : ''}>
				{#if p.brow === 'thick'}
					<path d="M37.5 41.5 q4 -2.4 9 -0.8 M53.5 40.7 q5 -1.6 9 0.8" stroke={p.hair === '#e6e1d8' ? '#8a8578' : p.hair} stroke-width="2.6" stroke-linecap="round" fill="none" />
				{:else if p.brow === 'arched'}
					<path d="M38 42 q4 -3.5 8 -1 M54 41 q4 -2.5 8 1" stroke={p.hair} stroke-width="1.6" stroke-linecap="round" fill="none" />
				{:else if p.brow === 'thin'}
					<path d="M38.5 41.5 q3.5 -1.5 7 -0.6 M54.5 40.9 q3.5 -0.9 7 0.6" stroke={ink} stroke-width="1.1" stroke-linecap="round" fill="none" />
				{:else}
					<path d="M38 41.5 l8 -1 M54 40.5 l8 1" stroke={ink} stroke-width="1.8" stroke-linecap="round" />
				{/if}

				</g>
				{#if mood === 'angry'}<path d="M38 40.5 l8 2.2 M62 40.5 l-8 2.2" stroke={ink} stroke-width="1.6" stroke-linecap="round" />{/if}
				{#if mood === 'sad'}<path d="M38.5 41.5 l7 -2 M61.5 41.5 l-7 -2" stroke={ink} stroke-width="1.3" stroke-linecap="round" opacity=".8" />{/if}
				<!-- eyes -->
				<g class="eyes" class:blink style:animation-delay="{(seed % 50) / 10}s">
				{#if role === 'ghost'}
					<ellipse cx="42" cy="47" rx="3" ry="4" fill="#556" opacity=".7" />
					<ellipse cx="58" cy="47" rx="3" ry="4" fill="#556" opacity=".7" />
				{:else if p.folk === 'eastasia' || p.folk === 'japan' || p.folk === 'highland'}
					<!-- monolid almond: upper lid line + narrow iris -->
					{#each [42, 58] as x, i}
						{@const dir = i === 0 ? 1 : -1}
						<path d="M{x - 4} 47.2 Q{x} {p.folk === 'highland' ? 45 : 44.6} {x + 4} {47.2 - dir * 0.6}" stroke={ink} stroke-width="1.6" fill="none" stroke-linecap="round" />
						<ellipse cx={x} cy="47.6" rx="1.6" ry={p.mood === 2 ? 0.7 : 1.3} fill={p.eyeColor} />
					{/each}
				{:else if p.folk === 'seasia'}
					{#each [42, 58] as x}
						<path d="M{x - 4} 47.5 Q{x} 44.2 {x + 4} 47.5 Q{x} 49.6 {x - 4} 47.5Z" fill="#fbf7ef" />
						<circle cx={x} cy="47.2" r="1.7" fill={p.eyeColor} />
						<path d="M{x - 4} 47.5 Q{x} 44.2 {x + 4} 47.5" stroke={ink} stroke-width="1.5" fill="none" />
						<path d="M{x - 3} 45 Q{x} 43.4 {x + 3} 45" stroke={ink} stroke-width=".6" fill="none" opacity=".6" />
					{/each}
				{:else}
					<!-- large almond with crease, iris & highlight -->
					{#each [42, 58] as x}
						<path d="M{x - 4.5} 47.5 Q{x} 43.5 {x + 4.5} 47.5 Q{x} 50.5 {x - 4.5} 47.5Z" fill="#fbf7ef" />
						<circle cx={x} cy="47.3" r="2.1" fill={p.eyeColor} /><circle cx={x} cy="47.3" r="0.9" fill={ink} /><circle cx={x + 0.7} cy="46.6" r="0.45" fill="#fff" />
						<path d="M{x - 4.5} 47.5 Q{x} 43.5 {x + 4.5} 47.5" stroke={ink} stroke-width={p.kohl ? 2 : 1.4} fill="none" />
						{#if p.kohl}<path d="M{x - 4.5} 47.6 Q{x} 50.6 {x + 4.5} 47.6" stroke={ink} stroke-width=".9" fill="none" />{/if}
						<path d="M{x - 3.5} 44.8 Q{x} 42.6 {x + 3.5} 44.8" stroke={ink} stroke-width=".6" fill="none" opacity=".55" />
					{/each}
				{/if}

				</g>
				<!-- nose -->
				{#if p.folk === 'westasia' || (p.folk === 'europe' && p.jaw !== 0)}
					<path d="M50.5 46 Q53 53 51.5 56 Q50 57.2 48 56" stroke={shade(p.skin, -0.32)} stroke-width="1.3" fill="none" stroke-linecap="round" />
				{:else if p.folk === 'africa' || p.folk === 'seasia'}
					<path d="M50 49 v4" stroke={shade(p.skin, -0.25)} stroke-width="1" fill="none" />
					<path d="M45.5 55.5 q1.5 2 4.5 1.2 q3 0.8 4.5 -1.2" stroke={shade(p.skin, -0.32)} stroke-width="1.3" fill="none" stroke-linecap="round" />
				{:else if p.folk === 'southasia' || p.folk === 'europe'}
					<path d="M50 47 Q51.8 52.5 51 55.4 Q49.6 56.6 47.6 55.6" stroke={shade(p.skin, -0.3)} stroke-width="1.2" fill="none" stroke-linecap="round" />
				{:else}
					<path d="M49.5 51.5 q-1.6 2.6 0.6 3.6 M48 55 q2 0.9 4 0" stroke={shade(p.skin, -0.28)} stroke-width="1.1" fill="none" stroke-linecap="round" />
				{/if}
				{#if p.nosering}<circle cx="47.2" cy="56" r="1.7" fill="none" stroke="#d4a017" stroke-width=".8" />{/if}

				<!-- cheeks -->
				{#if p.folk === 'highland'}
					<ellipse cx="40" cy="55" rx="4" ry="2.6" fill="#c0503d" opacity=".38" /><ellipse cx="60" cy="55" rx="4" ry="2.6" fill="#c0503d" opacity=".38" />
				{:else}
					<circle cx="40" cy="55" r="3" fill="#d9776a" opacity={p.folk === 'europe' ? 0.32 : 0.2} /><circle cx="60" cy="55" r="3" fill="#d9776a" opacity={p.folk === 'europe' ? 0.32 : 0.2} />
				{/if}
				{#if p.freckles}
					{#each [[40, 52], [42, 54], [44, 52.5], [56, 52.5], [58, 54], [60, 52]] as [x, y]}<circle cx={x} cy={y} r=".45" fill="#8a5a3a" opacity=".6" />{/each}
				{/if}

				<!-- mouth -->
				{#if mood === 'happy'}
					<path d="M44 58.5 Q50 64.5 56 58.5 Q50 61.5 44 58.5Z" fill={p.beni ? '#c0392b' : '#6b2e2e'} stroke={ink} stroke-width="1" stroke-linejoin="round" />
				{:else if mood === 'angry'}
					<path d="M45 61.5 q5 -2.4 10 0" stroke={ink} stroke-width="1.8" fill="none" stroke-linecap="round" />
				{:else if mood === 'sad'}
					<path d="M45.5 62 q4.5 -3.4 9 0" stroke={ink} stroke-width="1.5" fill="none" stroke-linecap="round" />
				{:else if mood === 'surprised'}
					<ellipse cx="50" cy="60.5" rx="2.4" ry="3" fill="#4a2020" />
				{:else if p.lips === 'full'}
					<path d="M45 60 Q47.5 58.4 50 59.4 Q52.5 58.4 55 60 Q52.5 62.8 50 62.8 Q47.5 62.8 45 60Z" fill={p.beni ? '#c0392b' : shade(p.skin, -0.28)} />
					<path d="M45 60 Q50 61 55 60" stroke={ink} stroke-width=".7" fill="none" opacity=".6" />
				{:else if p.mood === 0 || p.lips === 'smile'}
					<path d="M45 59.5 q5 3 10 0" stroke={p.beni ? '#c0392b' : ink} stroke-width={p.beni ? 2 : 1.5} fill="none" stroke-linecap="round" />
					{#if p.blackTeeth}<path d="M47 60.3 q3 1.4 6 0" stroke="#111" stroke-width="1.4" fill="none" />{/if}
				{:else if p.mood === 1}
					<path d="M46 60 h8" stroke={p.beni ? '#c0392b' : ink} stroke-width="1.5" stroke-linecap="round" />
				{:else}
					<path d="M46 61 q4 -2 8 0" stroke={p.beni ? '#c0392b' : ink} stroke-width="1.5" fill="none" stroke-linecap="round" />
				{/if}

				<!-- facial hair -->
				{#if p.beard === 'wisp'}
					<path d="M43.5 57.5 q-3 3 -4.5 7 M56.5 57.5 q3 3 4.5 7" stroke={p.hair} stroke-width="1" fill="none" stroke-linecap="round" />
					<path d="M49 64 q1 7 2 0" fill={p.hair} />
				{:else if p.beard === 'moustache'}
					<path d="M44 58 q3 -2 6 -0.5 q3 -1.5 6 0.5 q-3 0.6 -6 0 q-3 0.6 -6 0Z" fill={p.hair} />
				{:else if p.beard === 'handlebar'}
					<path d="M43 58.5 q3.5 -2.4 7 -0.6 q3.5 -1.8 7 0.6 q-3.5 0.6 -7 0 q-3.5 0.6 -7 0Z M43 58.5 q-3 0 -3.5 -3 M57 58.5 q3 0 3.5 -3" fill={p.hair} stroke={p.hair} stroke-width="1.2" stroke-linecap="round" />
				{:else if p.beard === 'droop'}
					<path d="M44 58 q3 -2 6 -0.5 q3 -1.5 6 0.5 M44.5 58 q-1.5 4 -1 8 M55.5 58 q1.5 4 1 8" stroke={p.hair} stroke-width="1.6" fill="none" stroke-linecap="round" />
				{:else if p.beard === 'full'}
					<path d="M{L + 2} 52 Q{L + 1} 72 50 76 Q{R - 1} 72 {R - 2} 52 Q{R - 4} 62 {50 + 5} 62.5 Q50 61 {50 - 5} 62.5 Q{L + 4} 62 {L + 2} 52Z" fill={p.hair} />
					<path d="M44 58 q3 -2 6 -0.5 q3 -1.5 6 0.5 q-3 0.6 -6 0 q-3 0.6 -6 0Z" fill={p.hair} />
				{:else if p.beard === 'goatee'}
					<path d="M44.5 58 q2.5 -1.6 5.5 -0.4 q3 -1.2 5.5 0.4 M50 63 q-2 4 0 9 q2 -5 0 -9" stroke={p.hair} stroke-width="1.4" fill={p.hair} stroke-linecap="round" />
				{:else if p.beard === 'sideburns'}
					<path d="M{L + 0.5} 46 v12 q2 4 6 4 M{R - 0.5} 46 v12 q-2 4 -6 4" stroke={p.hair} stroke-width="3" fill="none" stroke-linecap="round" />
				{:else if p.beard === 'short'}
					<path d="M{L + 3} 55 Q{L + 4} 68 50 70 Q{R - 4} 68 {R - 3} 55 Q{R - 5} 63 50 64 Q{L + 5} 63 {L + 3} 55Z" fill={p.hair} opacity=".85" />
				{/if}
				{#if role === 'bandit'}
					<path d="M{L - 1} 52 Q50 50 {R + 1} 52 L{R - 2} 66 Q50 72 {L + 2} 66Z" fill="#2b2b2b" />
				{/if}

				<!-- forehead marks -->
				{#if p.bindi}<circle cx="50" cy="40.5" r="1.4" fill="#b5121b" />{/if}
				{#if p.tilak}<path d="M48.6 37 v5 M51.4 37 v5" stroke="#f2efe6" stroke-width="1" /><path d="M50 38 v4" stroke="#c0392b" stroke-width="1" />{/if}

				<!-- headwear -->
				{#if p.hat === 'futou'}
					<path d="M36 34 Q36 22 50 22 Q64 22 64 34Z" fill={ink} /><rect x="42" y="16" width="16" height="10" rx="3" fill={ink} />
					<path d="M36 30 L14 28 L14 32 L36 33 M64 30 L86 28 L86 32 L64 33" fill={ink} />
				{:else if p.hat === 'queue'}
					<path d="M36 36 Q36 24 50 24 Q64 24 64 36Z" fill={ink} /><circle cx="50" cy="23" r="2.5" fill="#b5321f" />
				{:else if p.hat === 'kasa'}
					<path d="M10 36 L50 18 L90 36 Q50 40 10 36Z" fill="#c9a96b" stroke="#8a6d3b" stroke-width="1" />
				{:else if p.hat === 'gat'}
					<ellipse cx="50" cy="31" rx="30" ry="5" fill={ink} opacity=".82" /><path d="M40 31 L42 14 L58 14 L60 31Z" fill={ink} opacity=".85" />
				{:else if p.hat === 'nonla'}
					<path d="M14 38 L50 8 L86 38 Q50 44 14 38Z" fill="#dcc690" stroke="#9c8650" stroke-width="1" /><path d="M32 30 L50 8 M68 30 L50 8" stroke="#b39c62" stroke-width=".8" />
				{:else if p.hat === 'chada'}
					<path d="M36 34 Q50 20 64 34Z M42 28 L50 4 L58 28Z" fill="#d4a017" stroke="#8a6a0f" stroke-width="1" />
				{:else if p.hat === 'songkok'}
					<path d="M35 34 L37 20 L63 20 L65 34Z" fill={ink} />
				{:else if p.hat === 'turban'}
					<path d="M32 38 Q30 14 50 14 Q70 14 68 38 Q50 30 32 38Z" fill={p.accent} /><path d="M34 30 Q50 18 66 28 M34 24 Q50 32 64 20" stroke="#0003" stroke-width="2" fill="none" /><circle cx="50" cy="26" r="2.5" fill="#d4a017" />
				{:else if p.hat === 'taj'}
					<path d="M33 38 Q32 24 50 24 Q68 24 67 38 Q50 32 33 38Z" fill="#f2efe6" /><path d="M44 26 L50 4 L56 26Z" fill="#b5321f" />
				{:else if p.hat === 'kavuk'}
					<path d="M32 38 Q30 8 50 8 Q70 8 68 38 Q50 32 32 38Z" fill="#f4f1ea" stroke="#d8d2c4" /><path d="M46 12 h8 v-6 h-8z" fill="#b5321f" />
				{:else if p.hat === 'fez'}
					<path d="M38 34 L40 16 L60 16 L62 34Z" fill="#b5321f" /><path d="M50 16 q8 2 10 12" stroke={ink} stroke-width="1.5" fill="none" />
				{:else if p.hat === 'kofia'}
					<path d="M35 34 Q35 20 50 20 Q65 20 65 34Z" fill="#f4f1ea" /><path d="M38 28 h24 M38 31 h24" stroke="#b5a77d" stroke-width="1" stroke-dasharray="2 1.5" />
				{:else if p.hat === 'tricorn'}
					<path d="M24 32 Q50 12 76 32 Q60 26 50 30 Q40 26 24 32Z" fill={ink} />
				{:else if p.hat === 'brim'}
					<ellipse cx="50" cy="31" rx="26" ry="5" fill={ink} /><path d="M38 31 Q38 16 50 16 Q62 16 62 31Z" fill={ink} /><path d="M60 22 q14 -10 18 -2" stroke="#e8e2d0" stroke-width="3" fill="none" />
				{:else if p.hat === 'tophat'}
					<ellipse cx="50" cy="31" rx="20" ry="3.5" fill={ink} /><rect x="39" y="8" width="22" height="23" fill={ink} /><rect x="39" y="25" width="22" height="3" fill="#6b2e2e" />
				{:else if p.hat === 'furhat'}
					<path d="M36 32 Q36 14 50 14 Q64 14 64 32Z" fill={p.accent} /><rect x="32" y="28" width="36" height="9" rx="4.5" fill="#6b4a2b" />
					{#if p.folk === 'highland' && culture === 'tibetan'}<circle cx="50" cy="20" r="2" fill="#2bb3a8" />{/if}
				{:else if p.hat === 'kabuto'}
					<path d="M33 36 Q33 16 50 16 Q67 16 67 36Z" fill={ink} /><path d="M28 36 Q50 30 72 36 L74 42 Q50 36 26 42Z" fill="#3a3a3a" />
					<path d="M44 20 Q38 6 30 4 Q40 10 46 22 M56 20 Q62 6 70 4 Q60 10 54 22" fill="#d4a017" /><circle cx="50" cy="24" r="2.4" fill="#b5321f" />
				{:else if p.hat === 'bork'}
					<path d="M36 34 Q35 20 50 20 Q65 20 64 34Z" fill="#d4a017" /><path d="M40 22 Q42 2 52 -2 Q62 4 60 22Z" fill="#f4f1ea" stroke="#d8d2c4" />
					<path d="M60 18 Q72 30 70 48" stroke="#f4f1ea" stroke-width="5" fill="none" /><rect x="47" y="12" width="6" height="10" rx="2" fill="#b38b2a" />
				{:else if p.hat === 'pith'}
					<ellipse cx="50" cy="32" rx="25" ry="5" fill="#d9cba3" stroke="#a8996f" /><path d="M36 32 Q36 14 50 14 Q64 14 64 32Z" fill="#e6d9b4" stroke="#a8996f" /><path d="M37 28 h26" stroke="#8a6d3b" stroke-width="2" />
				{:else if p.hat === 'bandana'}
					<path d="M34 34 Q34 20 50 20 Q66 20 66 34Z" fill="#9c1f1f" /><path d="M36 30 Q50 34 64 30" stroke="#f4f1ea" stroke-width="1" stroke-dasharray="1.5 2" fill="none" />
					<path d="M64 30 L74 38 L70 40 L76 46" stroke="#9c1f1f" stroke-width="3" fill="none" />
				{:else if p.hat === 'bun'}
					<circle cx="50" cy="24" r="7" fill={p.hair} /><path d="M40 22 L62 26" stroke="#d4a017" stroke-width="1.6" />
				{:else if p.hat === 'hairpin'}
					<circle cx="36" cy="28" r="6" fill={p.hair} /><circle cx="64" cy="28" r="6" fill={p.hair} /><circle cx="50" cy="24" r="6" fill={p.hair} />
					<path d="M58 22 l12 -6" stroke="#d4a017" stroke-width="1.6" /><circle cx="70" cy="16" r="2" fill="#b5321f" />
				{:else if p.hat === 'veil'}
					{@const cloth = p.folk === 'southasia' ? p.accent : shade(p.robe, -0.25)}
					<path d="M{L - 5} 78 Q{L - 8} 23 50 23 Q{R + 8} 23 {R + 5} 78 L{R - 1} 72 Q{R + 1} 36 50 33.5 Q{L - 1} 36 {L + 1} 72Z" fill={cloth} />
					<path d="M{L + 1} 72 Q{L - 1} 36 50 33.5 Q{R + 1} 36 {R - 1} 72" stroke="#0000002a" stroke-width="1.6" fill="none" />
					<path d="M{L - 3} 60 Q{L - 5} 40 {L + 2} 30 M{R + 3} 60 Q{R + 5} 40 {R - 2} 30" stroke="#ffffff22" stroke-width="1.2" fill="none" />
					{#if p.folk === 'southasia'}<path d="M{L - 3} 40 Q50 22 {R + 3} 40" stroke="#d4a017" stroke-width="1" fill="none" stroke-dasharray="1.5 1.5" />{/if}
				{/if}
				{#if p.flower}<g transform="translate({R + 1} 38)"><circle r="2.2" fill="#f4f1ea" /><circle r="1" fill="#d4a017" /><circle cx="2.4" cy="1" r="1.6" fill="#f4f1ea" /></g>{/if}
			</g>
		{/if}
	</g>
	<filter id="pt-grain-{seed}"><feTurbulence baseFrequency=".85" numOctaves="2" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .1 0" /></filter>
	<rect width="100" height="100" filter="url(#pt-grain-{seed})" clip-path="url(#clip-{seed})" />
	<circle cx="50" cy="50" r="48" fill="none" stroke="var(--ink)" stroke-width="1.5" opacity=".6" />
</svg>

<style>
	.portrait {
		display: block;
		flex-shrink: 0;
	}
	.ghost {
		opacity: 0.85;
		filter: saturate(0.3);
	}
	.eyes,
	.brows {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 0.2s;
	}
	.eyes.blink {
		animation: blink 5.5s infinite;
	}
	@keyframes blink {
		0%,
		94%,
		100% {
			transform: scaleY(1);
		}
		96% {
			transform: scaleY(0.1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eyes.blink {
			animation: none;
		}
	}
</style>
