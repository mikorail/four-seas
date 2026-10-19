<script lang="ts">
	import { CITY, cityName } from '#lib/data/world';
	import { CULTURES } from '#lib/data/cultures';
	import type { Run } from '#lib/game/types';
	import { getTimeInfo } from '#lib/game/time';
	import { currencySymbol } from '#lib/game/settings.svelte';
	import { venuesHere, venueUsed } from '#lib/game/market';
	import type { VenueId } from '#lib/data/venues';

	let {
		run,
		onmarket,
		onrest,
		onvisit,
		ontogglemap,
		onsettings,
		fill = false
	}: {
		fill?: boolean;
		run: Run;
		onmarket: () => void;
		onrest: () => void;
		onvisit: (id: VenueId) => void;
		ontogglemap: () => void;
		onsettings?: () => void;
	} = $props();

	const loc = $derived(CITY[run.location] ?? CITY['beijing']);
	const timeInfo = $derived(getTimeInfo(run));
	const venues = $derived(venuesHere(run));

	// Zoom and pan state for the fresco canvas
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);

	let isDragging = false;
	let startX = 0;
	let startY = 0;

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		startX = e.clientX - panX;
		startY = e.clientY - panY;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		panX = e.clientX - startX;
		panY = Math.max(-60, Math.min(60, e.clientY - startY));
	}

	function handlePointerUp() {
		isDragging = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const factor = e.deltaY < 0 ? 1.15 : 0.87;
		zoom = Math.max(0.75, Math.min(2.6, zoom * factor));
	}

	function zoomIn() {
		zoom = Math.min(2.6, zoom * 1.25);
	}

	function zoomOut() {
		zoom = Math.max(0.75, zoom / 1.25);
	}

	function resetZoom() {
		zoom = 1;
		panX = 0;
		panY = 0;
	}

	const cultureLabel = $derived(CULTURES[loc.culture]?.label ?? 'Eurasia');
</script>

<div
	class="fresco-container {timeInfo.phase}"
	class:fill
	onwheel={handleWheel}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	role="region"
	aria-label="City Fresco View"
>
	<!-- Top HUD Pill matching Inkle 80 Days styling -->
	<div class="top-hud">
		<div class="hud-pill">
			<span class="hud-coin">{currencySymbol(loc.culture)} {run.stats.silver}</span>
			<span class="hud-sep">·</span>
			<span class="hud-day">DAY {run.day}</span>
			<span class="hud-sep">·</span>
			<span class="hud-dow">{timeInfo.dayOfWeek.toUpperCase()}</span>
			<span class="hud-sep">·</span>
			<span class="hud-time">{timeInfo.timeStr}</span>
		</div>
	</div>

	<!-- Top Controls -->
	<div class="fresco-controls top-left">
		<button onclick={zoomIn} aria-label="Zoom in fresco" title="Zoom in">+</button>
		<button onclick={zoomOut} aria-label="Zoom out fresco" title="Zoom out">−</button>
		<button onclick={resetZoom} aria-label="Reset fresco zoom" title="Reset view">◎</button>
	</div>

	<div class="fresco-controls top-right">
		{#if onsettings}
			<button onclick={onsettings} aria-label="Settings" title="Settings">⚙️</button>
		{/if}
		<button class="map-toggle-btn" onclick={ontogglemap} aria-label="Switch to 3D Globe map" title="3D Globe Map">
			🌐
		</button>
	</div>

	<!-- Grand City Title Banner (Matching Inkle 80 Days Port Royal screenshot) -->
	<div class="city-hero">
		<h1 class="city-title">{cityName(loc, run.year).toUpperCase()}</h1>
		<p class="city-subtitle">{loc.blurb} · <i>{cultureLabel}</i></p>
	</div>

	<!-- Dynamic SVG Fresco / Panoramic Layered Scene -->
	<svg
		viewBox="0 0 1000 520"
		preserveAspectRatio="xMidYMax slice"
		class="fresco-canvas"
		style:transform="translate({panX}px, {panY}px) scale({zoom})"
	>
		<defs>
			<!-- Diurnal Sky Gradients -->
			<linearGradient id="frescoSkyDawn" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#3b0764" />
				<stop offset="40%" stop-color="#831843" />
				<stop offset="70%" stop-color="#f59e0b" />
				<stop offset="92%" stop-color="#fef08a" />
				<stop offset="100%" stop-color="#0f2942" />
			</linearGradient>

			<linearGradient id="frescoSkyDay" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#0284c7" />
				<stop offset="50%" stop-color="#7dd3fc" />
				<stop offset="85%" stop-color="#e0f2fe" />
				<stop offset="100%" stop-color="#0c4a6e" />
			</linearGradient>

			<linearGradient id="frescoSkyDusk" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#1e1b4b" />
				<stop offset="45%" stop-color="#831843" />
				<stop offset="75%" stop-color="#ea580c" />
				<stop offset="92%" stop-color="#fbbf24" />
				<stop offset="100%" stop-color="#1e293b" />
			</linearGradient>

			<linearGradient id="frescoSkyNight" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#020617" />
				<stop offset="50%" stop-color="#091424" />
				<stop offset="80%" stop-color="#11283d" />
				<stop offset="95%" stop-color="#1e3a53" />
				<stop offset="100%" stop-color="#07121c" />
			</linearGradient>

			<!-- Sea Gradient -->
			<linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="#11293a" />
				<stop offset="100%" stop-color="#06121b" />
			</linearGradient>

			<!-- Cloud Mist Filter -->
			<filter id="mistBlur" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur stdDeviation="7" />
			</filter>
		</defs>

		<!-- Sky Canvas Background based on Diurnal Phase -->
		{#if timeInfo.phase === 'dawn'}
			<rect width="1000" height="520" fill="url(#frescoSkyDawn)" />
		{:else if timeInfo.phase === 'day'}
			<rect width="1000" height="520" fill="url(#frescoSkyDay)" />
		{:else if timeInfo.phase === 'dusk'}
			<rect width="1000" height="520" fill="url(#frescoSkyDusk)" />
		{:else}
			<rect width="1000" height="520" fill="url(#frescoSkyNight)" />
		{/if}

		<!-- Starfield (twinkling at night and dawn) -->
		{#if timeInfo.phase === 'night' || timeInfo.phase === 'dawn'}
			<g class="fresco-stars">
				<circle cx="90" cy="60" r="1.2" fill="#fff" opacity="0.8" />
				<circle cx="170" cy="40" r="1.5" fill="#fff" opacity="0.9" />
				<circle cx="280" cy="80" r="1.1" fill="#fff" opacity="0.6" />
				<circle cx="390" cy="50" r="1.6" fill="#fff" opacity="0.85" />
				<circle cx="510" cy="90" r="1.3" fill="#fff" opacity="0.7" />
				<circle cx="630" cy="45" r="1.7" fill="#fff" opacity="0.9" />
				<circle cx="750" cy="70" r="1.2" fill="#fff" opacity="0.65" />
				<circle cx="860" cy="35" r="1.5" fill="#fff" opacity="0.8" />
				<circle cx="940" cy="75" r="1.3" fill="#fff" opacity="0.75" />
			</g>
		{/if}

		<!-- Horizon Water Baseline -->
		<rect x="0" y="380" width="1000" height="140" fill="url(#seaGrad)" />
		<line x1="0" y1="380" x2="1000" y2="380" stroke="rgba(255,255,255,0.18)" stroke-width="1.2" />

		<!-- Layer 1: Distant Background Mountain / Volcano Ridges -->
		<path
			d="M-20,380 Q140,290 280,340 T620,310 T840,350 Q920,280 1020,380 Z"
			fill="rgba(15, 23, 42, 0.45)"
		/>

		<!-- Layer 2: Midground Cultural Citadels, Pagodas & Fortresses -->
		<g class="midground-skyline" fill="rgba(8, 15, 26, 0.88)">
			<!-- Fortified Citadel Ramparts (Right side, like Port Royal fort in Image 3) -->
			<path
				d="M650,380 L670,270 L720,265 L725,245 L745,245 L750,265 L810,260 L815,235 L840,235 L845,260 L910,255 L930,380 Z"
			/>
			<!-- Slender Palm Trees and Pines flanking the fortress -->
			<path
				d="M630,380 Q645,290 648,240 Q630,225 615,235 Q640,230 648,240 Q645,215 652,205 Q655,225 648,240 Q665,220 675,230 Q655,235 648,240 L650,380 Z"
			/>
			<path
				d="M935,380 Q925,270 920,210 Q900,195 885,205 Q910,200 920,210 Q915,185 925,175 Q928,198 920,210 Q945,190 958,205 Q935,208 920,210 L928,380 Z"
			/>

			<!-- Pagoda / Minaret / Dome accents on the left midground -->
			<path
				d="M260,380 v-80 h32 v80 Z M254,300 h44 l-3,-6 h-38 Z M262,294 v-20 h28 v20 Z M258,274 h36 l-3,-6 h-30 Z M266,268 v-18 h20 v18 Z M262,250 h28 l-2,-6 h-24 Z M275,244 v-18 h2 v18 Z"
			/>
			<path
				d="M320,380 v-65 h45 v65 Z M315,315 q23,-25 55,0 Z M342,295 v-10 h1 v10 Z"
			/>
		</g>

		<!-- Warm Glowing Lantern Windows in the Citadel (night & dusk) -->
		{#if timeInfo.phase === 'night' || timeInfo.phase === 'dusk'}
			<g class="lantern-windows" fill="#fef08a">
				<circle cx="710" cy="290" r="3" opacity="0.9" />
				<circle cx="770" cy="285" r="3.2" opacity="0.95" />
				<circle cx="830" cy="275" r="2.8" opacity="0.85" />
				<circle cx="875" cy="295" r="3" opacity="0.9" />
				<circle cx="276" cy="272" r="2.5" opacity="0.9" />
				<circle cx="342" cy="330" r="3.5" opacity="0.85" />
			</g>
		{/if}

		<!-- Layer 3: Foreground High-Contrast Tall Ship / Vessel (Exact match to Image 3 Port Royal) -->
		{#if loc.port}
			<g class="tall-ship" transform="translate(10, 0)">
				<!-- Hull -->
				<path
					d="M20,395 C60,385 140,380 280,388 C295,389 315,370 325,340 C280,360 160,360 40,365 C15,366 10,380 20,395 Z"
					fill="#050a12"
				/>

				<!-- Rigging Lines -->
				<line x1="140" y1="365" x2="140" y2="90" stroke="#000" stroke-width="3" />
				<line x1="230" y1="365" x2="230" y2="120" stroke="#000" stroke-width="2.6" />
				<line x1="285" y1="365" x2="330" y2="280" stroke="#000" stroke-width="2.2" />

				<!-- Rigging Shrouds -->
				<line x1="60" y1="365" x2="140" y2="105" stroke="#000" stroke-width="1.2" opacity="0.8" />
				<line x1="140" y1="105" x2="230" y2="135" stroke="#000" stroke-width="1.2" opacity="0.8" />
				<line x1="230" y1="135" x2="310" y2="355" stroke="#000" stroke-width="1.2" opacity="0.8" />

				<!-- Billowing Crisp White Sails (High Contrast 80 Days Art Style) -->
				<!-- Main Lower Sail -->
				<path
					d="M45,340 C110,320 125,320 135,340 C125,230 115,225 45,245 C65,290 55,315 45,340 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2.5"
				/>
				<!-- Main Upper Topsail -->
				<path
					d="M55,225 C115,210 125,210 135,225 C125,145 115,140 65,155 C72,190 62,205 55,225 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2.5"
				/>
				<!-- Top Gallant -->
				<path
					d="M75,140 C120,130 130,130 138,140 C130,85 125,80 82,92 C90,115 80,128 75,140 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2"
				/>

				<!-- Fore Sails -->
				<path
					d="M165,345 C215,335 225,335 235,345 C225,245 220,240 165,255 C178,295 170,320 165,345 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2.5"
				/>
				<path
					d="M175,238 C218,228 225,228 234,238 C226,170 220,165 180,176 C188,205 180,225 175,238 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2"
				/>

				<!-- Jib Sails Extending Forward -->
				<path
					d="M238,240 L315,355 C275,348 250,330 238,240 Z"
					fill="#ffffff"
					stroke="#000000"
					stroke-width="2"
				/>
			</g>
		{:else}
			<!-- Inland Caravan / Gate Arch Landmark for Land Cities -->
			<g class="land-landmark" transform="translate(40, 20)">
				<!-- Grand Stone City Gate -->
				<path
					d="M100,380 V220 H280 V380 H235 V280 Q190,240 145,280 V380 Z"
					fill="#050a12"
					stroke="#000"
					stroke-width="2"
				/>
				<!-- Guarded Camels and Merchants resting -->
				<path
					d="M290,380 q5,-25 22,-20 q10,-35 28,-28 q8,-20 22,-20 q15,0 15,20 q12,-15 25,0 q8,25 -15,48 Z"
					fill="#050a12"
				/>
			</g>
		{/if}

		<!-- Layer 4: Rolling Cloud Mist along the bottom (Exact match to Image 3) -->
		<g class="fresco-mist" filter="url(#mistBlur)">
			<path
				d="M-50,530 C120,440 250,470 380,430 C510,480 640,430 780,460 C920,420 1020,470 1080,530 Z"
				fill="rgba(255, 255, 255, 0.85)"
			/>
			<path
				d="M-20,530 C180,480 320,490 460,460 C620,500 780,460 920,480 C980,450 1040,490 1060,530 Z"
				fill="rgba(255, 255, 255, 0.95)"
			/>
		</g>
	</svg>

	<!-- Venue Action Roundels at Bottom (Matching Inkle 80 Days Image 3) -->
	<nav class="fresco-venues" aria-label="City venues">
		<button class="venue-roundel market" onclick={onmarket}>
			<span class="roundel-icon">⚖️</span>
			<span class="roundel-label">MARKET</span>
			<span class="roundel-sub">Trade</span>
		</button>

		<button class="venue-roundel inn" onclick={onrest}>
			<span class="roundel-icon">🛏️</span>
			<span class="roundel-label">INN / HOTEL</span>
			<span class="roundel-sub">+1 day</span>
		</button>

		{#each venues.filter((v) => v.id !== 'market' && v.id !== 'bazaar' && v.id !== 'inn') as v (v.id)}
			{@const visited = venueUsed(run, v.id)}
			<button
				class="venue-roundel"
				class:visited
				disabled={visited}
				onclick={() => onvisit(v.id)}
			>
				<span class="roundel-icon">
					{v.id === 'harbor' ? '⚓' : v.id === 'palace' ? '👑' : v.id === 'temple' || v.id === 'shrine' ? '✦' : '🏛️'}
				</span>
				<span class="roundel-label">{v.name.toUpperCase()}</span>
				<span class="roundel-sub">{visited ? 'Visited' : 'Explore'}</span>
			</button>
		{/each}

		<button class="venue-roundel leave" onclick={ontogglemap}>
			<span class="roundel-icon">🧭</span>
			<span class="roundel-label">ROUTES</span>
			<span class="roundel-sub">Depart</span>
		</button>
	</nav>
</div>

<style>
	.fresco-container.fill .fresco-canvas {
		min-height: 0;
	}
	.fresco-container.fill {
		height: 100%;
		min-height: 0;
		max-height: none;
		border: 0;
		border-radius: 0;
	}
	.fresco-container {
		position: relative;
		width: 100%;
		min-height: 480px;
		max-height: 72vh;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: #030712;
		box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.8), 0 8px 30px rgba(0, 0, 0, 0.4);
		touch-action: none;
		user-select: none;
		cursor: grab;
	}
	.fresco-container:active {
		cursor: grabbing;
	}

	/* Top Inkle 80 Days HUD Pill */
	.top-hud {
		position: absolute;
		top: 14px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		z-index: 10;
		pointer-events: none;
	}
	.hud-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(8, 12, 19, 0.88);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.22);
		padding: 6px 18px;
		border-radius: 999px;
		font-family: var(--display);
		font-size: 0.95rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
	}
	.hud-coin {
		font-weight: 700;
		color: #fef08a;
	}
	.hud-day {
		font-weight: 700;
		letter-spacing: 0.05em;
	}
	.hud-sep {
		opacity: 0.4;
	}
	.hud-dow {
		font-size: 0.85rem;
		opacity: 0.9;
	}
	.hud-time {
		font-weight: 600;
		color: #38bdf8;
	}

	/* Controls */
	.fresco-controls {
		position: absolute;
		top: 14px;
		display: flex;
		gap: 6px;
		z-index: 10;
	}
	.top-left {
		left: 14px;
		flex-direction: column;
	}
	.top-right {
		right: 14px;
	}
	.fresco-controls button {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.22);
		background: rgba(8, 12, 19, 0.94);
		color: #ffffff;
		font-size: 1.15rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
		transition: transform 0.1s ease, background 0.15s ease;
	}
	.fresco-controls button:hover {
		transform: scale(1.08);
		background: rgba(15, 23, 42, 0.95);
	}

	/* Grand City Title Banner (Exact match to Port Royal in Image 3) */
	.city-hero {
		position: absolute;
		top: 16%;
		left: 0;
		right: 0;
		text-align: center;
		z-index: 5;
		pointer-events: none;
	}
	.city-title {
		font-family: var(--display);
		font-size: clamp(2.4rem, 6.5vw, 4.4rem);
		font-weight: 800;
		letter-spacing: 0.08em;
		color: #ffffff;
		margin: 0;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.9);
	}
	.city-subtitle {
		font-family: var(--body);
		font-size: clamp(0.85rem, 2vw, 1.1rem);
		color: rgba(255, 255, 255, 0.88);
		margin: 4px 0 0;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
	}

	/* Canvas SVG */
	.fresco-canvas {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 480px;
		transform-origin: center center;
		transition: transform 0.06s linear;
	}

	/* Venue Action Roundels at Bottom (Image 3) */
	.fresco-venues {
		position: absolute;
		bottom: 18px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		gap: clamp(8px, 2.5vw, 24px);
		z-index: 10;
		padding: 0 16px;
		flex-wrap: wrap;
	}
	.venue-roundel {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		transition: transform 0.15s ease;
	}
	.venue-roundel:hover:not(:disabled) {
		transform: translateY(-4px) scale(1.05);
	}
	.venue-roundel:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.roundel-icon {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		background: #0f172a;
		border: 2px solid rgba(255, 255, 255, 0.45);
		color: #ffffff;
		font-size: 1.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
		margin-bottom: 5px;
	}
	.venue-roundel:hover:not(:disabled) .roundel-icon {
		background: #1e293b;
		border-color: #fef08a;
		box-shadow: 0 0 20px rgba(254, 240, 138, 0.4);
	}
	.roundel-label {
		font-family: var(--display);
		font-weight: 700;
		font-size: 0.76rem;
		letter-spacing: 0.06em;
		color: #ffffff;
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
	}
	.roundel-sub {
		font-family: var(--body);
		font-size: 0.68rem;
		color: rgba(255, 255, 255, 0.72);
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
	}

	@media (max-width: 600px) {
		.roundel-icon {
			width: 42px;
			height: 42px;
			font-size: 1.15rem;
		}
		.roundel-label {
			font-size: 0.68rem;
		}
		.city-hero {
			top: 14%;
		}
	}
</style>
