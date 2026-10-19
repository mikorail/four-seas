<script lang="ts">
	// Hand-drawn (well, hand-typed) scenes for each local legend.
	let { id, size = 150 }: { id: string; size?: number } = $props();
	const ink = '#1d1813';
</script>

<svg viewBox="0 0 100 100" width={size} height={size} class="legend-art" role="img" aria-label="Illustration: {id}">
	<defs>
		<clipPath id="lg-clip-{id}"><circle cx="50" cy="50" r="48" /></clipPath>
		<radialGradient id="lg-moon-{id}"><stop offset="0" stop-color="#fff8dc" /><stop offset="1" stop-color="#f2d98a" /></radialGradient>
	</defs>
	<g clip-path="url(#lg-clip-{id})">
		{#if id === 'kitsune'}
			<rect width="100" height="100" fill="#2b2140" />
			<circle cx="72" cy="24" r="10" fill="url(#lg-moon-{id})" />
			<path d="M20 90 V44 M80 90 V44 M14 44 H86 M16 52 H84" stroke="#b5321f" stroke-width="5" />
			<path d="M10 40 Q50 32 90 40 L88 46 Q50 38 12 46Z" fill="#b5321f" />
			{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as i}<path d="M50 80 Q{30 + i * 5} {50 - (i % 3) * 6} {20 + i * 7} {44 + (i % 2) * 6}" stroke="#f0a646" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9" />{/each}
			<path d="M40 88 Q50 66 60 88Z" fill="#f0a646" /><path d="M44 70 l-3 -8 l6 5 M56 70 l3 -8 l-6 5" fill="#f0a646" stroke="#f0a646" />
			<circle cx="47" cy="74" r="1" fill={ink} /><circle cx="53" cy="74" r="1" fill={ink} />
		{:else if id === 'jiangshi'}
			<rect width="100" height="100" fill="#14212b" />
			<circle cx="26" cy="22" r="11" fill="url(#lg-moon-{id})" />
			<path d="M0 86 H100 V100 H0Z" fill="#0b1218" />
			<path d="M38 86 V52 H62 V86 M38 58 L18 60 M62 58 L82 60" stroke="#3a5a3a" stroke-width="7" stroke-linecap="round" />
			<rect x="40" y="48" width="20" height="30" fill="#2e4a6b" />
			<circle cx="50" cy="40" r="9" fill="#cfe0d4" /><rect x="41" y="27" width="18" height="6" fill={ink} />
			<rect x="46" y="33" width="8" height="14" fill="#e8c94a" /><path d="M48 36 h4 M48 39 h4 M48 42 h4" stroke="#b5321f" />
			<path d="M30 92 l4 -4 M66 92 l4 -4" stroke="#cfe0d4" stroke-width="2" />
		{:else if id === 'gumiho'}
			<rect width="100" height="100" fill="#3b2a4a" />
			{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as i}<path d="M50 70 Q{18 + i * 8} {30 - (i % 2) * 8} {10 + i * 10} {20 + (i % 3) * 4}" stroke="#f5f1ea" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85" />{/each}
			<path d="M36 100 Q36 64 50 60 Q64 64 64 100Z" fill="#b56576" />
			<circle cx="50" cy="52" r="9" fill="#f1d3b3" /><path d="M41 50 Q50 38 59 50" fill={ink} />
			<circle cx="50" cy="70" r="3" fill="#7fd1c8" opacity=".9" />
		{:else if id === 'naga'}
			<rect width="100" height="100" fill="#1f3b4d" />
			<path d="M0 70 Q25 64 50 70 T100 70 V100 H0Z" fill="#2b6c7a" />
			<path d="M30 100 Q24 60 44 46 Q62 34 54 18" stroke="#3aa17e" stroke-width="12" fill="none" stroke-linecap="round" />
			<path d="M46 12 L52 2 L58 12 L64 6 L62 18Z" fill="#d4a017" />
			<circle cx="58" cy="20" r="1.6" fill="#f0e68c" />
			{#each [[20, 30], [80, 24], [70, 44]] as [x, y]}<circle cx={x} cy={y} r="3" fill="#ff8a3d" /><circle cx={x} cy={y} r="6" fill="#ff8a3d" opacity=".3" />{/each}
		{:else if id === 'pontianak'}
			<rect width="100" height="100" fill="#1d2b22" />
			<circle cx="76" cy="20" r="9" fill="url(#lg-moon-{id})" />
			<path d="M24 100 V30" stroke="#3b5d3a" stroke-width="6" />
			{#each [[-1, 24], [1, 30], [-1, 38], [1, 46]] as [d, y]}<path d="M24 {y} q{d * 22} -10 {d * 30} 6 q{-d * 14} -2 {-d * 30} -6Z" fill="#4f7942" />{/each}
			<path d="M48 100 L52 46 Q60 38 68 46 L72 100Z" fill="#eeeae0" />
			<path d="M52 46 Q60 30 68 46 L70 86 Q60 70 50 86Z" fill="#111" />
			{#each [[60, 34], [44, 60], [80, 70]] as [x, y]}<g transform="translate({x} {y})"><circle r="2" fill="#fff" /><circle cx="2" r="1.5" fill="#fff" /><circle cx="-1" cy="2" r="1.5" fill="#fff" /></g>{/each}
		{:else if id === 'djinn'}
			<rect width="100" height="100" fill="#3a2a1e" />
			<path d="M0 82 Q50 72 100 82 V100 H0Z" fill="#c9a36b" />
			<path d="M34 80 Q50 72 66 80 L70 74 L58 70 Q52 66 46 70 L30 74Z" fill="#d4a017" stroke="#8a6a0f" />
			<path d="M64 74 Q72 60 60 50 Q48 40 58 28 Q66 18 54 10" stroke="#7fb3d5" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7" />
			<circle cx="56" cy="16" r="6" fill="#7fb3d5" /><circle cx="54" cy="15" r="1" fill="#fff" /><circle cx="58" cy="15" r="1" fill="#fff" />
		{:else if id === 'vetala'}
			<rect width="100" height="100" fill="#22201a" />
			<path d="M50 100 V40 M50 50 Q30 40 14 46 M50 44 Q70 30 88 40 M30 46 V70 M70 38 V62 M80 40 V58" stroke="#5c4a2e" stroke-width="5" fill="none" />
			<ellipse cx="50" cy="28" rx="40" ry="18" fill="#2f4a2a" />
			<path d="M64 62 V78" stroke="#8a8578" stroke-width="2" /><ellipse cx="64" cy="82" rx="5" ry="9" fill="#cfcac2" /><circle cx="64" cy="70" r="4" fill="#cfcac2" />
			<circle cx="62.5" cy="70" r=".8" fill="#b5321f" /><circle cx="65.5" cy="70" r=".8" fill="#b5321f" />
		{:else if id === 'migoi'}
			<rect width="100" height="100" fill="#c9d6e3" />
			<path d="M0 60 L24 20 L44 52 L62 14 L100 64 V100 H0Z" fill="#eef3f8" stroke="#9fb1c4" />
			<path d="M0 80 Q50 70 100 82 V100 H0Z" fill="#fff" />
			{#each [[30, 92], [42, 86], [54, 90], [66, 84], [78, 88]] as [x, y], i}<ellipse cx={x} cy={y} rx="3.5" ry="5" fill="#9fb1c4" transform="rotate({i % 2 ? 20 : -20} {x} {y})" />{/each}
			<path d="M56 50 Q60 34 66 50 L68 60 L54 60Z" fill="#8a7f72" opacity=".55" />
		{:else if id === 'dutchman'}
			<rect width="100" height="100" fill="#1b2430" />
			<path d="M0 76 Q25 70 50 76 T100 76 V100 H0Z" fill="#26384a" />
			<path d="M24 74 H78 L70 84 H32Z" fill="#3a2a2a" />
			<path d="M50 74 V24 M36 74 V36" stroke="#5a3a2a" stroke-width="2" />
			<path d="M52 28 Q66 40 52 60Z M38 40 Q50 50 38 64Z" fill="#9c1f1f" opacity=".9" />
			<path d="M10 60 Q30 50 50 58" stroke="#cfe0d4" stroke-width="6" opacity=".15" fill="none" />
		{:else if id === 'ryujin'}
			<rect width="100" height="100" fill="#123a5a" />
			<path d="M0 74 Q12 64 24 74 T48 74 T72 74 T96 74 V100 H0Z" fill="#1f5f8a" />
			<path d="M10 90 Q30 40 60 46 Q80 50 84 26" stroke="#2fa37a" stroke-width="9" fill="none" stroke-linecap="round" />
			<path d="M78 22 L92 16 L86 28Z" fill="#2fa37a" /><path d="M84 18 q8 -10 14 -8 M82 24 q10 -2 16 6" stroke="#d4a017" stroke-width="1.2" fill="none" />
			<circle cx="86" cy="21" r="1.4" fill="#ffd54a" /><circle cx="66" cy="40" r="5" fill="#bfe9ff" opacity=".9" />
		{:else if id === 'nguva'}
			<rect width="100" height="100" fill="#0f4c5c" />
			<circle cx="80" cy="20" r="8" fill="url(#lg-moon-{id})" />
			<path d="M0 66 Q25 60 50 66 T100 66 V100 H0Z" fill="#1d7a8c" />
			<path d="M40 66 Q44 52 52 50 Q60 52 62 66 Q70 80 80 74 Q72 86 60 78 Q54 74 50 80" fill="#e07a5f" />
			<circle cx="52" cy="44" r="6" fill="#7a4a2b" /><path d="M46 42 Q52 30 60 44 Q58 58 66 62" stroke="#1d1813" stroke-width="3" fill="none" />
		{:else if id === 'baba-yaga'}
			<rect width="100" height="100" fill="#2e3a2a" />
			{#each [10, 22, 82, 92] as x}<path d="M{x} 100 L{x + 4} 40 L{x + 8} 100Z" fill="#1d2a1a" />{/each}
			<rect x="34" y="34" width="32" height="26" fill="#6b4a2b" /><path d="M30 36 L50 20 L70 36Z" fill="#4a3a2a" />
			<rect x="45" y="42" width="10" height="10" fill="#f5c542" />
			<path d="M42 60 L38 78 L32 82 M38 78 L42 84 M58 60 L62 78 L68 82 M62 78 L58 84" stroke="#e0b060" stroke-width="3" fill="none" stroke-linecap="round" />
		{:else if id === 'sinbad'}
			<rect width="100" height="100" fill="#e6c27a" />
			<circle cx="70" cy="30" r="14" fill="#f2a03d" opacity=".7" />
			<path d="M0 78 Q50 70 100 78 V100 H0Z" fill="#1d6fa3" />
			<path d="M20 30 Q40 18 60 30 Q50 24 40 28 Q30 22 20 30Z" fill="#5a3a2a" /><path d="M36 30 L32 44 M44 30 L46 44" stroke="#5a3a2a" stroke-width="2" />
			<path d="M40 76 H70 L64 84 H46Z" fill="#7a4a2b" /><path d="M55 76 V54 L70 74Z" fill="#f4f1ea" />
		{:else if id === 'musashi'}
			<rect width="100" height="100" fill="#e9e2cf" />
			<circle cx="50" cy="46" r="30" fill="none" stroke={ink} stroke-width="5" stroke-dasharray="160 30" opacity=".85" />
			<path d="M20 86 L76 20" stroke={ink} stroke-width="3" /><path d="M30 90 L84 34" stroke={ink} stroke-width="2" />
			<path d="M70 26 l8 -8 M78 40 l8 -8" stroke="#b5321f" stroke-width="3" />
			<text x="50" y="94" text-anchor="middle" font-size="9" fill={ink} font-family="var(--cjk)">五輪</text>
		{:else if id === 'koxinga'}
			<rect width="100" height="100" fill="#cfe0e8" />
			<path d="M0 72 Q50 66 100 72 V100 H0Z" fill="#4a7a9a" />
			{#each [[20, 66, 0.7], [50, 60, 1], [80, 68, 0.6]] as [x, y, k]}
				<g transform="translate({x} {y}) scale({k})"><path d="M-16 0 H16 L12 8 H-12Z" fill="#6b3a1e" /><path d="M-6 0 V-30 M6 0 V-24" stroke="#3a2a1e" stroke-width="2" /><path d="M-6 -28 h-14 l2 22 h12Z M6 -22 h12 l-2 18 h-10Z" fill="#c9a36b" stroke="#6b4a2b" /></g>
			{/each}
			<path d="M50 30 l12 4 l-12 4Z" fill="#b5321f" />
		{:else if id === 'hang-tuah'}
			<rect width="100" height="100" fill="#5a2a1e" />
			<path d="M50 90 L50 30 Q44 24 50 16 Q56 24 50 30" stroke="#d9d9d9" stroke-width="4" fill="none" />
			<path d="M50 30 Q54 40 48 46 Q54 52 48 58 Q54 64 48 70" stroke="#e8e8e8" stroke-width="5" fill="none" />
			<rect x="42" y="84" width="16" height="6" rx="2" fill="#d4a017" /><path d="M46 90 h8 v8 h-8z" fill="#6b3a1e" />
			{#each [0, 1, 2, 3, 4, 5] as i}<circle cx={50 + Math.cos(i) * 34} cy={50 + Math.sin(i) * 34} r="2" fill="#d4a017" />{/each}
		{:else if id === 'shivaji'}
			<rect width="100" height="100" fill="#f2c38a" />
			<path d="M0 70 L20 46 L32 58 L46 38 L64 60 L80 44 L100 66 V100 H0Z" fill="#8a5a2b" />
			<path d="M40 46 H60 V38 H56 V42 H52 V38 H48 V42 H44 V38 H40Z" fill="#6b3a1e" />
			<path d="M36 92 Q50 74 64 92Z" fill="#c9a36b" stroke="#6b4a2b" /><path d="M40 84 h20 M38 88 h24" stroke="#8a6a3b" />
			<circle cx="50" cy="80" r="4" fill="#f1d3b3" /><circle cx="50" cy="77" r="4" fill="#c1440e" />
		{:else if id === 'ching-shih'}
			<rect width="100" height="100" fill="#3a1e1e" />
			<path d="M0 74 Q50 68 100 74 V100 H0Z" fill="#5a2a2a" />
			{#each [10, 26, 42, 58, 74, 90] as x, i}<g transform="translate({x} {66 - (i % 2) * 6})"><path d="M-6 0 V-18" stroke="#1d1813" stroke-width="1.5" /><path d="M-6 -18 h10 l-2 14 h-8Z" fill="#b5121b" /></g>{/each}
			<path d="M42 30 H58 V40 H42Z" fill="#b5121b" /><text x="50" y="38" text-anchor="middle" font-size="7" fill="#fff" font-family="var(--cjk)">鄭</text>
		{:else if id === 'nasreddin'}
			<rect width="100" height="100" fill="#1e293b" />
			<path d="M78 22 A8 8 0 1 0 78 36 A6 6 0 1 1 78 22" fill="#fde047" />
			<path d="M0 76 Q50 68 100 78 V100 H0Z" fill="#475569" />
			<!-- lake & water -->
			<ellipse cx="28" cy="88" rx="20" ry="7" fill="#38bdf8" opacity=".7" />
			<!-- donkey facing right -->
			<path d="M42 80 l-2 14 M48 80 l-1 14 M74 80 l2 14 M80 80 l1 14" stroke="#64748b" stroke-width="3" stroke-linecap="round" />
			<ellipse cx="60" cy="76" rx="20" ry="9" fill="#94a3b8" />
			<path d="M74 74 l10 -12 l6 4 l-6 10Z" fill="#94a3b8" /><path d="M84 60 l-2 -8 M87 61 l1 -7" stroke="#64748b" stroke-width="2" />
			<!-- Hodja sitting backwards (facing left) -->
			<path d="M52 74 q-4 -14 2 -22 q6 -2 10 4 l-2 18Z" fill="#334155" />
			<!-- turban & beard -->
			<circle cx="53" cy="50" r="6" fill="#f8fafc" /><circle cx="51" cy="52" r="3" fill="#fde68a" />
			<path d="M47 52 q-3 6 3 9 q4 0 5 -5" fill="#f8fafc" />
			<!-- spoon & yoghurt bowl -->
			<path d="M44 60 l-12 16" stroke="#d97706" stroke-width="1.8" /><circle cx="31" cy="77" r="2.5" fill="#f8fafc" />
		{:else if id === 'sun-wukong'}
			<rect width="100" height="100" fill="#4a1525" />
			<!-- sun disk behind mountain peak -->
			<circle cx="50" cy="38" r="20" fill="#f59e0b" opacity=".35" />
			<path d="M0 84 L28 66 L50 78 L78 58 L100 80 V100 H0Z" fill="#290d16" />
			<!-- somersault cloud -->
			<path d="M30 68 q8 -10 18 -6 q12 -12 24 -2 q10 2 12 10 q-10 8 -26 6 q-14 4 -28 -8Z" fill="#fef3c7" opacity=".95" />
			<!-- golden staff (Ruyi Jingu Bang) -->
			<path d="M22 84 L76 18" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
			<path d="M22 84 L28 77 M70 25 L76 18" stroke="#facc15" stroke-width="3.6" stroke-linecap="round" />
			<!-- Monkey Sage silhouette -->
			<path d="M46 58 q-4 -12 2 -18 q8 -4 10 4 l-2 16Z" fill="#18181b" />
			<circle cx="50" cy="40" r="5" fill="#18181b" />
			<!-- golden headband & feathers -->
			<path d="M46 39 q4 -3 8 0" stroke="#facc15" stroke-width="1.8" fill="none" />
			<path d="M50 38 q-4 -12 -12 -18 M52 38 q4 -14 14 -18" stroke="#b91c1c" stroke-width="1.4" fill="none" />
			<!-- peach -->
			<circle cx="43" cy="46" r="3" fill="#fb923c" /><path d="M42 43 q-2 -3 -5 0" stroke="#16a34a" stroke-width="1" fill="none" />
		{:else if id === 'roro-kidul'}
			<rect width="100" height="100" fill="#022c22" />
			<!-- deep ocean waves -->
			<path d="M0 64 Q25 54 50 64 T100 64 V100 H0Z" fill="#064e3b" />
			<path d="M0 76 Q20 68 45 76 T90 76 T100 80 V100 H0Z" fill="#047857" />
			{#each [0, 1, 2] as i}<path d="M0 {84 + i * 5} q14 -6 28 0 t28 0 t28 0 t28 0" stroke="#6ee7b7" stroke-width="1.5" fill="none" opacity=".8" />{/each}
			<!-- Queen of the Southern Ocean -->
			<path d="M38 100 Q44 54 50 48 Q56 54 62 100Z" fill="#059669" />
			<circle cx="50" cy="40" r="7" fill="#fde68a" />
			<!-- royal crown and flowing black hair -->
			<path d="M42 42 Q50 28 58 42 L64 78 Q50 64 36 78Z" fill="#0f172a" />
			<path d="M46 35 L48 27 L50 32 L52 27 L54 35Z" fill="#facc15" />
			<!-- glowing green sea aura -->
			<circle cx="50" cy="42" r="16" fill="none" stroke="#34d399" stroke-width="1.2" stroke-dasharray="2 3" opacity=".7" />
			<circle cx="50" cy="52" r="2.5" fill="#fef08a" />
		{:else if id === 'dokkaebi'}
			<rect width="100" height="100" fill="#0f172a" />
			<circle cx="78" cy="24" r="10" fill="url(#lg-moon-{id})" />
			<path d="M0 80 Q50 72 100 80 V100 H0Z" fill="#1e293b" />
			<!-- bridge timbers -->
			<path d="M10 78 H90 M14 78 v16 M86 78 v16" stroke="#78350f" stroke-width="3" />
			<!-- Dokkaebi silhouette -->
			<ellipse cx="44" cy="68" rx="14" ry="12" fill="#334155" />
			<circle cx="44" cy="52" r="8" fill="#334155" />
			<!-- single horn -->
			<path d="M43 45 L46 32 L49 45Z" fill="#f59e0b" />
			<!-- magic club (dokkaebi bangmangi) -->
			<path d="M54 74 L76 42" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
			{#each [[66, 52], [70, 48], [74, 44], [62, 58]] as [bx, by]}
				<circle cx={bx} cy={by} r="1.6" fill="#facc15" />
			{/each}
			<!-- magical sparks -->
			{#each [[78, 38], [84, 44], [72, 34], [80, 50]] as [sx, sy]}
				<path d="M{sx} {sy - 3} V{sy + 3} M{sx - 3} {sy} H{sx + 3}" stroke="#facc15" stroke-width="1.2" />
			{/each}
		{:else if id === 'garuda'}
			<rect width="100" height="100" fill="#7c2d12" />
			<!-- radiant golden sun -->
			<circle cx="50" cy="46" r="26" fill="#f97316" opacity=".5" />
			<circle cx="50" cy="46" r="16" fill="#fde047" opacity=".8" />
			<!-- mountain peaks -->
			<path d="M0 88 L30 68 L50 78 L80 62 L100 86 V100 H0Z" fill="#431407" />
			<!-- sweeping wings -->
			<path d="M50 48 Q24 24 6 36 Q18 52 36 56 Q44 58 50 62 Q56 58 64 56 Q82 52 94 36 Q76 24 50 48Z" fill="#eab308" />
			<path d="M50 48 Q30 32 12 40 Q24 50 40 54 M50 48 Q70 32 88 40 Q76 50 60 54" stroke="#ca8a04" stroke-width="2" fill="none" />
			<!-- bird-king crest and beak -->
			<circle cx="50" cy="42" r="6" fill="#ca8a04" />
			<path d="M48 42 L50 48 L52 42Z" fill="#b45309" />
			<path d="M48 37 L50 28 L52 37Z" fill="#fde047" />
		{:else if id === 'al-khidr'}
			<rect width="100" height="100" fill="#0f172a" />
			<!-- starry desert night -->
			{#each [[20, 20], [35, 14], [65, 18], [80, 26], [50, 10]] as [sx, sy]}<circle cx={sx} cy={sy} r="1" fill="#f8fafc" opacity=".8" />{/each}
			<!-- desert dunes -->
			<path d="M0 72 Q35 60 70 72 T100 68 V100 H0Z" fill="#785934" />
			<!-- miraculous oasis of green grass -->
			<ellipse cx="45" cy="84" rx="28" ry="10" fill="#15803d" />
			<path d="M22 84 Q30 76 34 84 M30 86 Q36 78 40 86 M50 86 Q54 78 58 86" stroke="#4ade80" stroke-width="1.8" fill="none" />
			<!-- bubbling spring -->
			<ellipse cx="64" cy="84" rx="10" ry="5" fill="#38bdf8" />
			<circle cx="64" cy="80" r="1.5" fill="#e0f2fe" />
			<!-- cloaked green figure -->
			<path d="M38 88 Q34 60 42 52 Q50 60 46 88Z" fill="#166534" />
			<circle cx="42" cy="48" r="5" fill="#14532d" />
			<path d="M38 50 Q42 42 46 50" stroke="#22c55e" stroke-width="1.4" fill="none" />
		{:else}
			<rect width="100" height="100" fill="var(--seal-2)" />
			<text x="50" y="58" text-anchor="middle" font-size="30">★</text>
		{/if}
	</g>
	<!-- unify with the rest of the art: paper grain, a wash of the regional accent, and an ink rim -->
	<filter id="lg-grain-{id}"><feTurbulence baseFrequency=".85" numOctaves="2" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .12 0" /></filter>
	<g clip-path="url(#lg-clip-{id})">
		<rect width="100" height="100" filter="url(#lg-grain-{id})" />
		<rect width="100" height="100" fill="var(--vermilion)" opacity=".06" />
	</g>
	<circle cx="50" cy="50" r="48" fill="none" stroke="var(--gold)" stroke-width="2.4" />
	<circle cx="50" cy="50" r="45.5" fill="none" stroke="var(--ink)" stroke-width=".6" opacity=".5" />
</svg>

<style>
	.legend-art {
		display: block;
	}
</style>
