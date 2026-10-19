<script lang="ts">
	// An animated little landscape for the current journey: terrain, vehicle, weather and time of day.
	import type { JourneyLook } from '#lib/game/journey';
	import VehicleSprite from './VehicleSprite.svelte';

	let { look, from, to, progress, days, flag = '' }: { look: JourneyLook; from: string; to: string; progress: number; days: number; flag?: string } = $props();

	const pct = $derived(Math.max(0.03, Math.min(0.97, progress)));
	const dayNow = $derived(Math.max(1, Math.min(days, Math.ceil(pct * days))));
	// time of day cycles through each travel day
	const tod = $derived((pct * Math.max(1, days) * 1.0) % 1);
	const phase = $derived(tod < 0.15 ? 'dawn' : tod < 0.6 ? 'day' : tod < 0.75 ? 'dusk' : 'night');
	// every colour is a mix of the regional theme and the paper, so the scene matches the card art
	const mix = (c: string, pct: number, base = 'var(--paper)') => `color-mix(in srgb, ${c} ${pct}%, ${base})`;
	const SKY: Record<string, [string, string]> = {
		dawn: [mix('var(--vermilion)', 45), mix('var(--gold)', 25)],
		day: [mix('var(--z-jade, var(--jade))', 35, '#cfe4f2'), mix('#e6f3fb', 70)],
		dusk: [mix('var(--vermilion)', 70), mix('var(--gold)', 45)],
		night: [mix('var(--ink)', 85, '#0f1b33'), mix('var(--ink)', 70, '#2a3a5e')]
	};
	const GROUND: Record<string, string> = {
		desert: mix('var(--gold)', 60),
		mountain: mix('var(--ink)', 40),
		taiga: mix('var(--jade)', 55, 'var(--ink)'),
		jungle: mix('var(--jade)', 75),
		steppe: mix('var(--gold)', 40, 'var(--jade)'),
		paddy: mix('var(--jade)', 50),
		fields: mix('var(--jade)', 45),
		sea: mix('var(--jade)', 55, '#1d4f6a'),
		river: mix('var(--jade)', 45, '#4f7f7a')
	};
	const FAR: Record<string, string> = {
		desert: mix('var(--gold)', 45),
		mountain: mix('var(--ink)', 28),
		taiga: mix('var(--ink)', 55, 'var(--jade)'),
		jungle: mix('var(--jade)', 85, 'var(--ink)'),
		steppe: mix('var(--gold)', 30, 'var(--jade)'),
		paddy: mix('var(--jade)', 35),
		fields: mix('var(--jade)', 32)
	};
	const sky = $derived(look.weather === 'storm' ? [mix('var(--ink)', 70), mix('var(--ink)', 40)] : look.weather === 'rain' && phase === 'day' ? [mix('var(--ink)', 35), mix('var(--ink)', 15)] : SKY[phase]);
	const bodyX = $derived(30 + tod * 340);
	const bodyY = $derived(60 - Math.sin(Math.min(1, tod / 0.75) * Math.PI) * 44);
	const isNight = $derived(phase === 'night');
	const x = $derived(16 + pct * 368);
	const air = $derived(look.vehicle === 'balloon');
	const water = $derived(look.biome === 'sea' || look.biome === 'river');
	const scroll = $derived(-pct * 120);

	const seeds = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37) % 400, d: (i % 7) * 0.4, s: 0.6 + ((i * 13) % 10) / 10 }));
</script>

<figure class="scene-strip" aria-label="{look.biomeName}, travelling by {look.vehicleName} from {from} to {to}, day {dayNow} of {days}">
	<svg viewBox="0 0 400 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
		<defs>
			<linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color={sky[0]} /><stop offset="1" stop-color={sky[1]} /></linearGradient>
		</defs>
		<rect width="400" height="110" fill="url(#jsky)" />
		<!-- paper grain over everything, like the cards -->
		<filter id="jgrain"><feTurbulence baseFrequency=".9" numOctaves="2" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .08 0" /></filter>
		{#if isNight}
			{#each seeds.slice(0, 18) as st}<circle cx={st.x} cy={6 + ((st.x * 7) % 40)} r={st.s * 0.7} fill="var(--paper)" opacity=".8" />{/each}
		{/if}
		{#if look.weather !== 'storm'}
			<circle cx={bodyX} cy={bodyY} r={isNight ? 7 : 9} fill={isNight ? 'var(--paper)' : phase === 'day' ? mix('var(--gold)', 40, '#fff6d8') : mix('var(--vermilion)', 60, 'var(--gold)')} opacity=".95" />
		{/if}
		{#if look.weather === 'storm' || look.weather === 'rain'}
			<g fill={look.weather === 'storm' ? mix('var(--ink)', 80) : mix('var(--ink)', 40)} opacity=".85">
				<ellipse cx="80" cy="18" rx="50" ry="12" /><ellipse cx="200" cy="12" rx="70" ry="14" /><ellipse cx="330" cy="20" rx="60" ry="12" />
			</g>
		{/if}

		<!-- far layer scrolls slowly -->
		<g style:transform="translateX({scroll * 0.4}px)" class="far">
			{#if look.biome === 'mountain'}
				<path d="M-20 80 L30 30 L60 58 L100 18 L150 64 L190 26 L240 70 L290 22 L340 60 L380 30 L440 80Z" fill={FAR.mountain} />
				<path d="M92 26 L100 18 L108 26 Z M282 30 L290 22 L298 30Z M184 34 L190 26 L196 34Z" fill="var(--paper)" />
			{:else if look.biome === 'desert'}
				<path d="M-20 82 Q40 60 100 78 T220 74 T340 78 T460 72 V110 H-20Z" fill={FAR.desert} />
			{:else if look.biome === 'taiga' || look.biome === 'jungle'}
				{#each Array.from({ length: 16 }, (_, i) => i * 30 - 20) as tx}
					{#if look.biome === 'taiga'}<path d="M{tx} 80 l10 -30 l10 30Z" fill={FAR.taiga} />{:else}<path d="M{tx + 10} 82 v-24 M{tx + 10} 58 q-12 -2 -16 6 M{tx + 10} 58 q12 -2 16 6 M{tx + 10} 58 q-6 -10 -14 -10 M{tx + 10} 58 q6 -10 14 -10" stroke={FAR.jungle} stroke-width="3" fill="none" />{/if}
				{/each}
			{:else if look.biome === 'steppe'}
				<path d="M-20 80 Q100 72 220 78 T460 76 V110 H-20Z" fill={FAR.steppe} />
				<path d="M120 78 a10 8 0 0 1 20 0Z M300 76 a9 7 0 0 1 18 0Z" fill="var(--paper)" stroke="var(--ink)" stroke-width=".6" />
			{:else if look.biome === 'paddy'}
				<path d="M-20 70 Q60 52 140 66 T300 60 T460 66 V110 H-20Z" fill={FAR.paddy} />
				<path d="M60 52 l14 -10 l14 10Z M240 50 l12 -9 l12 9Z" fill="var(--vermilion)" />
			{:else if look.biome === 'fields'}
				<path d="M-20 74 Q100 60 220 72 T460 68 V110 H-20Z" fill={FAR.fields} />
				{#each [60, 160, 300] as tx}<circle cx={tx} cy="64" r="8" fill={mix('var(--jade)', 70, 'var(--ink)')} /><rect x={tx - 1} y="64" width="2" height="10" fill="var(--ink)" />{/each}
			{:else if look.biome === 'sky'}
				{#each [20, 140, 260, 360] as cx}<ellipse {cx} cy="92" rx="45" ry="12" fill="var(--paper)" opacity=".95" />{/each}
			{:else if look.biome === 'sea'}
				<path d="M-20 70 Q60 64 140 70 T300 68 T460 70 V76 H-20Z" fill={mix('var(--ink)', 25)} opacity=".6" />
			{/if}
		</g>

		<!-- ground / water -->
		{#if look.biome === 'sea'}
			<rect y="74" width="400" height="36" fill={GROUND.sea} />
			{#each [0, 1, 2] as i}<path d="M-40 {80 + i * 9} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="var(--paper)" stroke-width="1" fill="none" opacity=".55" class="wave" style:animation-delay="{-i}s" />{/each}
		{:else if look.biome === 'river'}
			<rect y="78" width="400" height="32" fill={GROUND.river} />
			<rect y="74" width="400" height="5" fill={GROUND.fields} />
			{#each [0, 1] as i}<path d="M-40 {86 + i * 10} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="var(--paper)" stroke-width="1" fill="none" opacity=".5" class="wave" />{/each}
		{:else if look.biome !== 'sky'}
			<rect y="80" width="400" height="30" fill={GROUND[look.biome] ?? GROUND.fields} />
			{#if look.weather === 'snow'}<rect y="80" width="400" height="30" fill="#fff" opacity=".7" />{/if}
			<line x1="10" y1="90" x2="390" y2="90" stroke="var(--ink)" stroke-opacity=".25" stroke-width="2" stroke-dasharray="4 4" />
			<line x1="10" y1="90" x2={x} y2="90" stroke="var(--vermilion)" stroke-width="2.4" />
		{/if}

		<!-- the traveller -->
		<g class="mover" class:air class:bob={water || air} style:transform="translate({x}px, {air ? 30 : water ? 64 : 70}px)">
			<VehicleSprite vehicle={look.vehicle} />
			{#if flag}<text x="0" y="-30" font-size="9" text-anchor="middle">{flag}</text>{/if}
		</g>

		<rect width="400" height="110" filter="url(#jgrain)" opacity=".7" pointer-events="none" />
		<!-- weather -->
		{#if look.weather === 'rain' || look.weather === 'storm'}
			{#each seeds as d}<line x1={d.x} y1="-10" x2={d.x - 4} y2="2" stroke="var(--paper)" stroke-width=".8" class="rain" style:animation-delay="{d.d}s" />{/each}
			{#if look.weather === 'storm'}<rect width="400" height="110" fill="var(--paper)" class="flash" />{/if}
		{:else if look.weather === 'snow'}
			{#each seeds as d}<circle cx={d.x} cy="-5" r={d.s} fill="#fff" class="snow" style:animation-delay="{d.d * 2}s" />{/each}
		{:else if look.weather === 'blossom' || look.weather === 'leaves'}
			{#each seeds.slice(0, 14) as d}<ellipse cx={d.x} cy="-5" rx="2" ry="1.2" fill={look.weather === 'blossom' ? 'color-mix(in srgb, var(--vermilion) 30%, #fff)' : 'var(--vermilion)'} class="petal" style:animation-delay="{d.d * 2.5}s" />{/each}
		{/if}
	</svg>
	<figcaption>
		<span class="end">{from}</span>
		<span class="mid">{look.biomeName} · by {look.vehicleName} · {look.season} · day {dayNow}/{days}</span>
		<span class="end r">{to}</span>
	</figcaption>
</figure>

<style>
	.scene-strip {
		margin: 0 auto 12px;
		max-width: 520px;
		padding: 0 16px;
	}
	svg {
		display: block;
		width: 100%;
		height: 96px;
		border-radius: 12px;
		border: 1px solid var(--line);
		overflow: hidden;
	}
	figcaption {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 8px;
		font-size: 0.75rem;
		color: var(--muted);
		margin-top: 4px;
	}
	.mid {
		text-align: center;
	}
	.end.r {
		text-align: right;
		color: var(--ink);
		font-weight: 600;
	}
	.far,
	.mover {
		transition: transform 1.2s ease-out;
	}
	.mover.bob {
		animation: bob 2.4s ease-in-out infinite;
	}
	.mover.air {
		animation: float 4s ease-in-out infinite;
	}
	.wave {
		animation: drift 5s linear infinite;
	}
	.rain {
		animation: fall 0.7s linear infinite;
	}
	.snow {
		animation: fall-slow 6s linear infinite;
	}
	.petal {
		animation: flutter 7s linear infinite;
	}
	.flash {
		opacity: 0;
		animation: flash 7s infinite;
	}
	@keyframes drift {
		to {
			transform: translateX(40px);
		}
	}
	@keyframes bob {
		50% {
			translate: 0 -2px;
			rotate: -2deg;
		}
	}
	@keyframes float {
		50% {
			translate: 0 -6px;
		}
	}
	@keyframes fall {
		to {
			transform: translate(-12px, 120px);
		}
	}
	@keyframes fall-slow {
		to {
			transform: translate(-20px, 120px);
		}
	}
	@keyframes flutter {
		50% {
			transform: translate(-30px, 60px) rotate(180deg);
		}
		to {
			transform: translate(-50px, 120px) rotate(360deg);
		}
	}
	@keyframes flash {
		0%,
		96%,
		100% {
			opacity: 0;
		}
		97% {
			opacity: 0.7;
		}
	}
</style>
