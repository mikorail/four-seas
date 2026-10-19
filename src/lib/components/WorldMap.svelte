<script lang="ts">
	import { DISASTERS } from '#lib/game/events';
	import { monthOf } from '#lib/game/economy';
	import { climateOf } from '#lib/game/prose';
	import { onMount } from 'svelte';
	import { geoOrthographic, geoPath, geoGraticule10, geoDistance, geoInterpolate, geoCircle } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { CITIES, CITY, EDGES, cityExists, cityName, edgeExists, type Route, type City } from '#lib/data/world';
	import type { Run } from '#lib/game/types';
	import { edgeClosed, typhoonPos, caravanPos } from '#lib/game/events';
	import { getTimeInfo } from '#lib/game/time';
	import { currencySymbol, modeGlyph } from '#lib/game/settings.svelte';

	let {
		run,
		routes,
		selected,
		onselect,
		rival = null,
		marks = [],
		onsettings,
		onfresco,
		fill = false
	}: {
		fill?: boolean;
		run: Run;
		routes: Route[];
		selected: string | null;
		onselect: (id: string) => void;
		rival?: string | null;
		marks?: { id: string; kind: 'quest' | 'holy' }[];
		onsettings?: () => void;
		onfresco?: () => void;
	} = $props();

	const markOf = $derived(Object.fromEntries(marks.map((m) => [m.id, m.kind])));
	// weather you can plan around: snow on cold passes in winter, monsoon rain over the tropics in summer
	const weatherMarks = $derived.by(() => {
		const m = monthOf(run);
		return CITIES.filter((c, i) => i % 3 === 0 && cityExists(c, run.year) && !c.secret)
			.map((c) => {
				const clim = climateOf(c);
				const mm = c.lat < 0 ? (m + 6) % 12 : m;
				const hot = mm >= 4 && mm <= 9;
				const g = clim === 'cold' && !hot ? '❄' : clim === 'tropical' && hot && ['indian', 'malay', 'siamese', 'viet', 'han'].includes(c.culture) ? '☔' : clim === 'arid' && hot ? '☀' : null;
				return g ? { c, g } : null;
			})
			.filter((x): x is { c: City; g: string } => !!x);
	});

	const W = 1000;
	let H = $state(640);
	let wrap: HTMLDivElement;

	const timeInfo = $derived(getTimeInfo(run));

	const known = $derived(
		Object.keys(run.flags)
			.filter((k) => k.startsWith('secret:'))
			.map((k) => k.slice(7))
	);
	const live = $derived(
		CITIES.filter(
			(c) =>
				cityExists(c, run.year) ||
				(c.secret && (run.visited.includes(c.id) || EDGES.some((e) => e.secret && known.includes(e.secret) && (e.a === c.id || e.b === c.id))))
		)
	);

	// Pre-cache edge LineString geometries for Great Circle projection
	const edgeLineStrings = new Map<string, { type: 'LineString'; coordinates: [number, number][] }>();
	function getEdgeLine(a: string, b: string) {
		const key = a < b ? `${a}:${b}` : `${b}:${a}`;
		let geom = edgeLineStrings.get(key);
		if (!geom) {
			const c1 = CITY[a];
			const c2 = CITY[b];
			if (c1 && c2) {
				geom = { type: 'LineString', coordinates: [[c1.lon, c1.lat], [c2.lon, c2.lat]] };
				edgeLineStrings.set(key, geom);
			}
		}
		return geom;
	}

	// 3D Globe camera state
	let rotX = $state(-102.25);
	let rotY = $state(9.8);
	let scale = $state(640);
	let inited = false;
	$effect(() => {
		if (!inited && run.location && CITY[run.location]) {
			inited = true;
			const c = CITY[run.location];
			rotX = -c.lon;
			rotY = Math.max(-80, Math.min(80, -(c.lat - 12)));
		}
	});

	// When zoomed in to regional journeys, shifting centerY slightly downward creates the
	// signature 80 Days perspective where the curved horizon sweeps majestically across the sky.
	const centerY = $derived.by(() => {
		if (scale <= 260) return H / 2;
		const factor = Math.exp(-Math.pow((scale - 650) / 450, 2));
		return H / 2 + factor * (H * 0.18);
	});

	const projection = $derived(
		geoOrthographic()
			.scale(scale)
			.translate([W / 2, centerY])
			.rotate([rotX, rotY])
			.clipAngle(90)
	);

	const path = $derived(geoPath(projection));
	const spherePath = $derived(path({ type: 'Sphere' }) ?? '');
	const grat = $derived(path(geoGraticule10()) ?? '');

	// Night terminator solar shadow geometry
	const nightGeom = $derived(
		geoCircle().center([timeInfo.antiSunLon, timeInfo.antiSunLat]).radius(90)()
	);
	const nightPath = $derived(path(nightGeom) ?? '');

	let topo = $state<any>(null);
	const land = $derived(topo ? (path(feature(topo, topo.objects.land) as any) ?? '') : '');

	onMount(() => {
		const ro = new ResizeObserver(() => {
			if (wrap) {
				H = fill && wrap.clientHeight > 50 ? Math.round(Math.min(2200, Math.max(420, (W * wrap.clientHeight) / Math.max(1, wrap.clientWidth)))) : wrap.clientWidth < 600 ? 780 : wrap.clientWidth > 860 ? 660 : 580;
			}
		});
		if (wrap) ro.observe(wrap);
		// Load clean, responsive land topography
		import('world-atlas/land-110m.json').then((m) => (topo = m.default));
		return () => ro.disconnect();
	});

	// Cartographic quadrant label staggering to prevent text collisions in dense regions
	function labelOffset(c: City, here: boolean, priority: boolean) {
		if (here) return { x: 0, y: -12, anchor: 'middle' as const };
		const hash = (Math.abs(Math.round(c.lat * 100)) + Math.abs(Math.round(c.lon * 100))) % 4;
		switch (hash) {
			case 0:
				return { x: 0, y: -10, anchor: 'middle' as const };
			case 1:
				return { x: 10, y: priority ? 3 : 4, anchor: 'start' as const };
			case 2:
				return { x: 0, y: 15, anchor: 'middle' as const };
			case 3:
				return { x: -10, y: priority ? 3 : 4, anchor: 'end' as const };
			default:
				return { x: 0, y: -10, anchor: 'middle' as const };
		}
	}

	// Angular distance & horizon culling helper for cities and waypoints
	function cityProj(c: City) {
		const angDist = geoDistance([c.lon, c.lat], [-rotX, -rotY]);
		// Cull points that fall on the far side of the globe
		if (angDist > (87 * Math.PI) / 180) return null;
		const pt = projection([c.lon, c.lat]);
		if (!pt) return null;
		const angDeg = (angDist * 180) / Math.PI;
		// Fade city labels smoothly as they approach the limb of the sphere
		const labelAlpha = Math.max(0, Math.min(1, (84 - angDeg) / 16));
		// Check if city is on the night side
		const nightDist = geoDistance([c.lon, c.lat], [timeInfo.antiSunLon, timeInfo.antiSunLat]);
		const isNight = nightDist < (80 * Math.PI) / 180;
		return { x: pt[0], y: pt[1], angDist, labelAlpha, isNight };
	}

	const reach = $derived(new Set(routes.map((r) => r.to)));
	const liveEdges = $derived(EDGES.filter((e) => edgeExists(e, run.year) && (!e.secret || known.includes(e.secret))));

	// Courier Position & Badge on Globe
	const courierPos = $derived.by(() => {
		if (run.phase === 'travel' && run.route) {
			const c1 = CITY[run.route.from];
			const c2 = CITY[run.route.to];
			if (c1 && c2) {
				const progress = Math.max(0, Math.min(1, (run.deckTotal - run.deck.length + 0.5) / Math.max(1, run.deckTotal)));
				const coords = geoInterpolate([c1.lon, c1.lat], [c2.lon, c2.lat])(progress);
				const ang = geoDistance(coords, [-rotX, -rotY]);
				if (ang <= (86 * Math.PI) / 180) {
					const pt = projection(coords);
					if (pt) return { x: pt[0], y: pt[1], mode: run.route.mode };
				}
			}
		} else if (CITY[run.location]) {
			const c = CITY[run.location];
			const s = cityProj(c);
			if (s) return { x: s.x, y: s.y, mode: 'land' as const };
		}
		return null;
	});

	// --- Smooth Camera Animation ---
	let animId: number | null = null;
	function animateTo(target: { rotX?: number; rotY?: number; scale?: number }, duration = 500) {
		if (animId !== null) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		const startRotX = rotX;
		const startRotY = rotY;
		const startScale = scale;

		let targetRotX = target.rotX ?? rotX;
		// Find shortest angular direction around the sphere
		while (targetRotX - startRotX > 180) targetRotX -= 360;
		while (targetRotX - startRotX < -180) targetRotX += 360;

		const targetRotY = Math.max(-85, Math.min(85, target.rotY ?? rotY));
		const targetScale = Math.max(220, Math.min(3400, target.scale ?? scale));
		const t0 = performance.now();

		function step(now: number) {
			const elapsed = now - t0;
			const progress = Math.min(1, elapsed / duration);
			const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

			rotX = startRotX + (targetRotX - startRotX) * ease;
			rotY = startRotY + (targetRotY - startRotY) * ease;
			scale = startScale + (targetScale - startScale) * ease;

			if (progress < 1) {
				animId = requestAnimationFrame(step);
			} else {
				animId = null;
			}
		}

		animId = requestAnimationFrame(step);
	}

	function centerOn(id: string, targetScale = scale) {
		const c = CITY[id];
		if (!c) return;
		const tilt = targetScale > 260 ? Math.exp(-Math.pow((targetScale - 650) / 450, 2)) * 14 : 0;
		const targetRotY = Math.max(-80, Math.min(80, -(c.lat - tilt)));
		animateTo({ rotX: -c.lon, rotY: targetRotY, scale: targetScale }, 480);
	}

	function focusRoute() {
		const targetId = selected ?? (reach.size > 0 ? [...reach][0] : run.destination);
		const c1 = CITY[run.location];
		const c2 = CITY[targetId];
		if (!c1 || !c2 || targetId === run.location) {
			centerOn(run.location, 640);
			return;
		}

		// Calculate spherical midpoint and distance
		const mid = geoInterpolate([c1.lon, c1.lat], [c2.lon, c2.lat])(0.5);
		const dist = geoDistance([c1.lon, c1.lat], [c2.lon, c2.lat]);

		// Calculate framing scale
		const neededScale = Math.max(380, Math.min(1900, (H * 0.46) / Math.max(0.12, Math.sin(dist / 2))));
		const tilt = neededScale > 260 ? Math.exp(-Math.pow((neededScale - 650) / 450, 2)) * 14 : 0;
		const targetRotY = Math.max(-80, Math.min(80, -(mid[1] - tilt)));

		animateTo({ rotX: -mid[0], rotY: targetRotY, scale: neededScale }, 520);
	}

	function resetWorldView() {
		animateTo({ scale: 245, rotY: -15 }, 550);
	}

	let lastLoc = '';
	$effect(() => {
		if (run.location !== lastLoc) {
			lastLoc = run.location;
			centerOn(run.location, Math.max(scale, 600));
		}
	});

	// --- Interactive Drag & Pinch Zoom ---
	let svg: SVGSVGElement;
	const pointers = new Map<number, { x: number; y: number }>();
	let moved = 0;
	let pinch0 = 0;
	let dragging = $state(false); // fewer labels while the globe spins
	let pendDx = 0;
	let pendDy = 0;
	let raf: number | null = null;
	function flushDrag() {
		raf = null;
		const degPerPx = 180 / Math.PI / scale;
		rotX += pendDx * degPerPx;
		rotY = Math.max(-85, Math.min(85, rotY - pendDy * degPerPx));
		pendDx = pendDy = 0;
	}

	function pdown(e: PointerEvent) {
		if (animId !== null) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		moved = 0;
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
		}
	}

	function pmove(e: PointerEvent) {
		const prev = pointers.get(e.pointerId);
		if (!prev) return;
		const dx = e.clientX - prev.x;
		const dy = e.clientY - prev.y;
		moved += Math.abs(dx) + Math.abs(dy);

		if (pointers.size === 1) {
			if (moved > 4 && svg) {
				svg.setPointerCapture(e.pointerId);
				dragging = true;
			}
			// 1:1 spherical drag physics, applied once per frame
			pendDx += dx;
			pendDy += dy;
			raf ??= requestAnimationFrame(flushDrag);
		} else if (pointers.size === 2) {
			pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const [a, b] = [...pointers.values()];
			const d = Math.hypot(a.x - b.x, a.y - b.y);
			if (pinch0 > 0) {
				const nScale = Math.max(220, Math.min(3400, scale * (d / pinch0)));
				scale = nScale;
				pinch0 = d;
			}
			moved = 99;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
	}

	function pup(e: PointerEvent) {
		pointers.delete(e.pointerId);
		if (!pointers.size) dragging = false;
	}

	function wheel(e: WheelEvent) {
		e.preventDefault();
		if (animId !== null) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		const factor = Math.exp(-e.deltaY * 0.0016);
		scale = Math.max(220, Math.min(3400, scale * factor));
	}

	function pick(id: string) {
		if (moved > 6) return;
		onselect(id);
	}

	function zoom(factor: number) {
		animateTo({ scale: Math.max(220, Math.min(3400, scale * factor)) }, 260);
	}

	// Celestial starfield background points
	const stars = [
		{ x: 70, y: 55, r: 1.2, o: 0.65 },
		{ x: 160, y: 35, r: 1.6, o: 0.75 },
		{ x: 230, y: 70, r: 0.9, o: 0.45 },
		{ x: 310, y: 40, r: 1.4, o: 0.7 },
		{ x: 420, y: 25, r: 1.8, o: 0.8 },
		{ x: 500, y: 50, r: 1.1, o: 0.5 },
		{ x: 580, y: 30, r: 1.5, o: 0.75 },
		{ x: 670, y: 60, r: 1.0, o: 0.55 },
		{ x: 760, y: 35, r: 1.7, o: 0.8 },
		{ x: 840, y: 65, r: 1.2, o: 0.6 },
		{ x: 920, y: 45, r: 1.5, o: 0.7 },
		{ x: 120, y: 110, r: 1.0, o: 0.5 },
		{ x: 880, y: 115, r: 1.1, o: 0.55 },
		{ x: 40, y: 160, r: 1.3, o: 0.6 },
		{ x: 950, y: 170, r: 1.4, o: 0.65 }
	];
</script>

<div class="wrap" class:fill bind:this={wrap}>
	<!-- Top HUD Pill matching Inkle 80 Days styling (Images 1 & 2) -->
	<div class="top-hud">
		<div class="hud-pill">
			<span class="hud-coin">{currencySymbol(CITY[run.location]?.culture)} {run.stats.silver}</span>
			<span class="hud-sep">·</span>
			<span class="hud-day">DAY {run.day}</span>
			<span class="hud-sep">·</span>
			<span class="hud-dow">{timeInfo.dayOfWeek.toUpperCase()}</span>
			<span class="hud-sep">·</span>
			<span class="hud-time">{timeInfo.timeStr}</span>
		</div>
	</div>

	<!-- Top Left Camera Controls (Matching Image 1 & 2) -->
	<div class="zoom top-left">
		<button onclick={() => zoom(1.35)} aria-label="Zoom in" title="Zoom in">+</button>
		<button onclick={() => zoom(1 / 1.35)} aria-label="Zoom out" title="Zoom out">−</button>
		<button onclick={() => centerOn(run.location, 650)} aria-label="Center on current city" title="Center here">◎</button>
		<button onclick={focusRoute} aria-label="Focus on route or destination" title="Focus route">🎯</button>
		<button onclick={resetWorldView} aria-label="Whole world view" title="World view">🌐</button>
	</div>

	<!-- Top Right View & Settings Controls -->
	<div class="zoom top-right">
		{#if onsettings}
			<button onclick={onsettings} aria-label="Game Settings" title="Settings">⚙️</button>
		{/if}
		{#if onfresco}
			<button class="fresco-btn" onclick={onfresco} aria-label="City Fresco View" title="City Fresco">🏙️</button>
		{/if}
	</div>

	<svg
		bind:this={svg}
		viewBox="0 0 {W} {H}"
		class="map"
		onwheel={wheel}
		onpointerdown={pdown}
		onpointermove={pmove}
		onpointerup={pup}
		onpointercancel={pup}
		role="application"
		aria-label="3D Globe World Map"
	>
		<defs>
			<!-- Dynamic Diurnal Sky Backdrop Gradient (Inkle 80 Days styling) -->
			<radialGradient id="skyGrad" cx="50%" cy="85%" r="85%">
				{#if timeInfo.phase === 'dawn'}
					<!-- Fiery Sunrise / Dawn (Image 2) -->
					<stop offset="0%" stop-color="#fbbf24" />
					<stop offset="28%" stop-color="#f43f5e" stop-opacity="0.8" />
					<stop offset="65%" stop-color="#4c1d95" stop-opacity="0.9" />
					<stop offset="100%" stop-color="#080312" />
				{:else if timeInfo.phase === 'day'}
					<!-- Clear Sunlit Azure Atmosphere -->
					<stop offset="0%" stop-color="#fef08a" stop-opacity="0.68" />
					<stop offset="28%" stop-color="#38bdf8" stop-opacity="0.45" />
					<stop offset="65%" stop-color="#0284c7" stop-opacity="0.8" />
					<stop offset="100%" stop-color="#082f49" />
				{:else if timeInfo.phase === 'dusk'}
					<!-- Burning Amber Sunset -->
					<stop offset="0%" stop-color="#ea580c" />
					<stop offset="30%" stop-color="#9a3412" stop-opacity="0.85" />
					<stop offset="65%" stop-color="#1e1b4b" stop-opacity="0.9" />
					<stop offset="100%" stop-color="#020617" />
				{:else}
					<!-- Midnight Celestial Space (Image 1) -->
					<stop offset="0%" stop-color="rgba(56, 189, 248, 0.3)" />
					<stop offset="28%" stop-color="rgba(15, 23, 42, 0.85)" />
					<stop offset="65%" stop-color="#020617" />
					<stop offset="100%" stop-color="#010409" />
				{/if}
			</radialGradient>

			<!-- Ocean Depth Radial Gradient -->
			<radialGradient id="oceanGrad" cx="50%" cy="30%" r="72%">
				<stop offset="0%" stop-color="color-mix(in srgb, var(--sea) 75%, #38bdf8 25%)" />
				<stop offset="45%" stop-color="var(--sea)" />
				<stop offset="100%" stop-color="color-mix(in srgb, var(--sea) 60%, #061520 40%)" />
			</radialGradient>

			<!-- Atmospheric Limb Soft Glow Filter -->
			<filter id="atmosphereGlow" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="6" result="blur" />
				<feComposite in="SourceGraphic" in2="blur" operator="over" />
			</filter>

			<!-- Clip path strictly matching the 3D globe disc -->
			<clipPath id="globeClip">
				<path d={spherePath} />
			</clipPath>
		</defs>

		<!-- Sky Canvas Background -->
		<rect width={W} height={H} fill="url(#skyGrad)" />

		<!-- Celestial Starfield (visible above the horizon limb at night / dawn) -->
		{#if timeInfo.phase === 'night' || timeInfo.phase === 'dawn'}
			{#each stars as s}
				<circle cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} class="star" />
			{/each}
		{/if}

		<!-- Atmospheric Glowing Halo (Radiates out from behind the globe curve) -->
		{#if spherePath}
			<circle
				cx={W / 2}
				cy={centerY}
				r={scale + 4}
				fill="none"
				stroke={timeInfo.phase === 'dawn' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(56, 189, 248, 0.42)'}
				stroke-width="10"
				filter="url(#atmosphereGlow)"
				pointer-events="none"
			/>
			<circle
				cx={W / 2}
				cy={centerY}
				r={scale + 1}
				fill="none"
				stroke="rgba(254, 240, 138, 0.32)"
				stroke-width="2.5"
				pointer-events="none"
			/>
		{/if}

		<!-- 3D Globe Surface (Clipped to the visible spherical hemisphere) -->
		{#if spherePath}
			<!-- Ocean Base Fill -->
			<path d={spherePath} fill="url(#oceanGrad)" class="ocean-disc" />

			<g clip-path="url(#globeClip)">
				<!-- Graticule (Curved Spherical Coordinates) -->
				<path d={grat} fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.5" />

				<!-- Landmass Geometries -->
				<path
					d={land}
					fill="var(--land)"
					stroke="var(--ink)"
					stroke-width="0.85"
					stroke-linejoin="round"
					class="landmass"
				/>

				<!-- Day / Night Solar Terminator Shadow Overlay -->
				{#if nightPath}
					<path d={nightPath} fill="rgba(3, 8, 18, 0.62)" pointer-events="none" />
					<path d={nightPath} fill="none" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1.4" pointer-events="none" />
				{/if}

				<!-- Background Network Edges (Subtle routes across the globe) -->
				{#each liveEdges as e}
					{@const geom = getEdgeLine(e.a, e.b)}
					{#if geom}
						{@const pStr = path(geom)}
						{#if pStr}
							<path
								d={pStr}
								class="edge {e.mode}"
								class:secret={!!e.secret}
								stroke-width={e.secret ? 1.4 : 0.8}
							/>
						{/if}
					{/if}
				{/each}

				<!-- Closed Hazard Edges -->
				{#each liveEdges.filter((e) => edgeClosed(run, e)) as e}
					{@const geom = getEdgeLine(e.a, e.b)}
					{#if geom}
						{@const pStr = path(geom)}
						{#if pStr}
							<path d={pStr} class="closed" stroke-width="1.6" />
						{/if}
					{/if}
				{/each}

				<!-- Traveled History Ribbon (Bold Inkle-style Vermilion Route) -->
				{#each run.path as p}
					{@const geom = getEdgeLine(p.from, p.to)}
					{#if geom}
						{@const pStr = path(geom)}
						{#if pStr}
							<path d={pStr} class="trail-glow" stroke-width="6.5" />
							<path d={pStr} class="trail" stroke-width="3" />
						{/if}
					{/if}
				{/each}

				<!-- Available Journey Route Arcs -->
				{#each routes as r}
					{@const geom = getEdgeLine(r.from, r.to)}
					{#if geom}
						{@const pStr = path(geom)}
						{#if pStr}
							{#if selected === r.to}
								<path d={pStr} class="avail-glow" stroke-width="7" />
							{/if}
							<path
								d={pStr}
								class="avail {r.mode}"
								class:sel={selected === r.to}
								stroke-width={selected === r.to ? 3.6 : 2.2}
							/>
						{/if}
					{/if}
				{/each}

				<!-- World Event Markers on Globe -->
				{#each run.world ?? [] as w (w.id)}
					{#if w.kind === 'plague'}
						{#each w.cities as id}
							{@const c = CITY[id]}
							{#if c}
								{@const s = cityProj(c)}
								{#if s}
									<circle cx={s.x} cy={s.y} r="12" class="plague" />
								{/if}
							{/if}
						{/each}
					{:else if w.kind === 'typhoon'}
						{@const tCity = CITY[typhoonPos(run, w)]}
						{#if tCity}
							{@const s = cityProj(tCity)}
							{#if s}
								<text x={s.x} y={s.y + 5} font-size="18" class="storm">🌀</text>
							{/if}
						{/if}
					{:else if w.kind === 'caravan'}
						{@const cCity = CITY[caravanPos(run, w)]}
						{#if cCity}
							{@const s = cityProj(cCity)}
							{#if s}
								<g transform="translate({s.x} {s.y})" class="caravan-marker" pointer-events="none">
									<circle r="9" fill="color-mix(in srgb, var(--gold) 35%, transparent)" stroke="var(--gold)" stroke-width="1.4" />
									<text y="4" text-anchor="middle" font-size="11">
										{w.id.includes('spice') || w.id.includes('flotilla') ? '⛵' : '⛺'}
									</text>
									{#if scale > 600}
										<text y="-11" text-anchor="middle" font-size="8.5" fill="var(--gold)" font-style="italic" font-weight="600">
											{w.label}
										</text>
									{/if}
								</g>
							{/if}
						{/if}
					{:else if w.kind === 'omen'}
						{#each w.cities.slice(0, 3) as oid}
							{@const oCity = CITY[oid]}
							{#if oCity}
								{@const s = cityProj(oCity)}
								{#if s}
									<text x={s.x + 6} y={s.y - 7} font-size="14" class="omen-icon" pointer-events="none">
										{w.data?.omenType === 'comet' ? '☄️' : w.data?.omenType === 'eclipse' ? '🌑' : w.data?.omenType === 'aurora' ? '✨' : '🌊'}
									</text>
								{/if}
							{/if}
						{/each}
					{:else if w.kind === 'disaster' && w.data?.disaster}
						{#each w.cities as did}
							{@const dCity = CITY[did]}
							{#if dCity}
								{@const s = cityProj(dCity)}
								{#if s}
									{@const epi = w.data.epicenter === did}
									<g transform="translate({s.x} {s.y})" pointer-events="none" class="disaster" class:epi>
										<circle r={epi ? 14 : 8} fill="none" stroke="#ef4444" stroke-width={epi ? 1.6 : 1} opacity={epi ? 0.8 : 0.45} class="dis-ring" />
										{#if epi}<text y="-14" text-anchor="middle" font-size="13">{DISASTERS[w.data.disaster].glyph}</text>{/if}
									</g>
								{/if}
							{/if}
						{/each}
					{/if}
				{/each}

				<!-- seasonal weather -->
				{#if scale > 380}
					{#each weatherMarks as w (w.c.id)}
						{@const s = cityProj(w.c)}
						{#if s}<text x={s.x - 14} y={s.y - 6} font-size="10" opacity={0.55 * s.labelAlpha} pointer-events="none" class="wx">{w.g}</text>{/if}
					{/each}
				{/if}

				<!-- Bones of the Road: past travellers' graves and shrines -->
				{#each run.graves ?? [] as g (g.id)}
					{@const gc = CITY[g.city]}
					{#if gc}
						{@const s = cityProj(gc)}
						{#if s}
							<g transform="translate({s.x - 9} {s.y + 4})" pointer-events="none" class="grave" opacity={run.flags['grave:' + g.id] ? 0.45 : 0.9}>
								<path d={g.settled ? 'M-3 2 L0 -4 L3 2Z' : 'M-2.5 3 L-2.5 -2 Q0 -5 2.5 -2 L2.5 3Z'} fill={g.settled ? 'var(--gold)' : '#cbd5e1'} stroke="#0b1220" stroke-width="0.6" />
							</g>
						{/if}
					{/if}
				{/each}

				<!-- Rival Position Indicator -->
				{#if rival && rival !== run.location && CITY[rival]}
					{@const s = cityProj(CITY[rival])}
					{#if s}
						<g transform="translate({s.x} {s.y})" class="rival">
							<circle r="9" fill="none" stroke="var(--indigo)" stroke-width="1.8" stroke-dasharray="3 2" />
							<text y="20" font-size="9.5">rival</text>
						</g>
					{/if}
				{/if}

				<!-- Cities and Waypoint Nodes -->
				{#each live as c}
					{@const s = cityProj(c)}
					{#if s}
						{@const here = c.id === run.location}
						{@const dest = c.id === run.destination && !run.delivered}
						{@const can = reach.has(c.id)}
						{@const seen = run.visited.includes(c.id)}
						{@const isSelected = selected === c.id}
						{@const showLabel =
							s.labelAlpha > 0.08 &&
							(dragging ? can || here || dest || isSelected : scale > 720 || can || here || dest || isSelected || markOf[c.id] || (scale > 400 && c.port))}

						<!-- Night City Light pinpoint for cities under nighttime terminator -->
						{#if s.isNight && !here && !dest}
							<circle cx={s.x} cy={s.y} r="1.6" fill="#fef08a" opacity="0.85" pointer-events="none" />
						{/if}

						<g
							class="city"
							class:can
							class:here
							transform="translate({s.x} {s.y})"
							onclick={() => pick(c.id)}
							onkeydown={(e) => e.key === 'Enter' && pick(c.id)}
							role="button"
							tabindex={can ? 0 : -1}
							aria-label={cityName(c, run.year)}
						>
							<!-- Generous clickable target area -->
							<circle r="14" fill="transparent" />

							<!-- Destination Beacon Pulse -->
							{#if dest}
								<circle r="13" fill="none" stroke="var(--gold)" stroke-width="2.2" class="dest-pulse" />
								<circle r="7" fill="none" stroke="var(--gold)" stroke-width="1.4" />
							{/if}

							<!-- Special Quest or Holy Site Marks -->
							{#if markOf[c.id] === 'quest'}
								<rect x="-6" y="-6" width="12" height="12" fill="none" stroke="var(--jade)" stroke-width="1.8" transform="rotate(45)" />
							{:else if markOf[c.id] === 'holy'}
								<text y="-10" x="8" font-size="11" class="holy">✦</text>
							{/if}

							<!-- Visited Journey Nodes -->
							{#if seen && !here}
								<circle r="4.2" fill="var(--vermilion)" stroke="#ffffff" stroke-width="1.2" />
							{/if}

							<!-- Current City Diamond or Waypoint Dot -->
							{#if here}
								<circle r="9" fill="none" stroke="var(--vermilion)" stroke-width="1.5" class="here-pulse" />
								<rect x="-6.5" y="-6.5" width="13" height="13" fill="var(--vermilion)" stroke="#ffffff" stroke-width="1.4" transform="rotate(45)" />
							{:else if !seen}
								<circle
									r={can ? 5 : 3.2}
									fill={dest ? 'var(--gold)' : can ? '#ffffff' : 'var(--ink)'}
									stroke={can ? 'var(--gold)' : 'rgba(255,255,255,0.7)'}
									stroke-width={can ? 1.6 : 0.8}
								/>
							{/if}

							<!-- Clean Typography Label with Horizon Fade and Staggered Anti-Collision -->
							{#if showLabel}
								{@const off = labelOffset(c, here, can || isSelected)}
								<text
									x={off.x}
									y={off.y}
									text-anchor={off.anchor}
									font-size={here || can || dest || isSelected ? 12.5 : 10.5}
									class:strong={here || can || dest || isSelected}
									opacity={s.labelAlpha}
								>
									{cityName(c, run.year)}
								</text>
							{/if}
						</g>
					{/if}
				{/each}

				<!-- Courier Transport Roundel on Active Route (Matching Image 1 Airship Badge!) -->
				{#if courierPos}
					<g transform="translate({courierPos.x} {courierPos.y})" class="courier-badge" pointer-events="none">
						<circle r="13" fill="#030712" stroke="#ffffff" stroke-width="2.2" />
						<text text-anchor="middle" y="4.5" font-size="12">
							{modeGlyph(courierPos.mode)}
						</text>
					</g>
				{/if}
			</g>

			<!-- Atmospheric Horizon Limb Border -->
			<path d={spherePath} fill="none" stroke="rgba(56, 189, 248, 0.65)" stroke-width="1.4" pointer-events="none" />
		{/if}
	</svg>

	<!-- Map Legend -->
	<div class="legend">
		<span><i class="l sea"></i>sea</span>
		<span><i class="l river"></i>river</span>
		<span><i class="l land"></i>road</span>
		{#if marks.some((m) => m.kind === 'quest')}<span class="lq">◇ task</span>{/if}
		{#if marks.some((m) => m.kind === 'holy')}<span class="lh">✦ holy</span>{/if}
	</div>
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
		border: 1px solid var(--line);
		border-radius: 12px;
		overflow: hidden;
		background: #060b13;
		box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.65);
	}

	/* Top Inkle 80 Days HUD Pill */
	.top-hud {
		position: absolute;
		top: 12px;
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
		padding: 5px 16px;
		border-radius: 999px;
		font-family: var(--display);
		font-size: 0.92rem;
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
		font-size: 0.82rem;
		opacity: 0.9;
	}
	.hud-time {
		font-weight: 600;
		color: #38bdf8;
	}

	.wrap.fill {
		height: 100%;
		border: 0;
		border-radius: 0;
	}
	.wrap.fill .map {
		height: 100%;
	}
	.map {
		display: block;
		width: 100%;
		height: auto;
		touch-action: none;
		cursor: grab;
		user-select: none;
	}
	.map:active {
		cursor: grabbing;
	}
	.star {
		animation: twinkle 4s ease-in-out infinite alternate;
	}
	@keyframes twinkle {
		0% {
			opacity: 0.3;
		}
		100% {
			opacity: 0.9;
		}
	}
	.ocean-disc {
		filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.2));
	}
	.landmass {
		filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.3));
	}
	.edge {
		fill: none;
		stroke: var(--ink);
		opacity: 0.16;
	}
	.edge.sea {
		stroke-dasharray: 3 3;
	}
	.edge.secret {
		stroke: var(--gold);
		opacity: 0.85;
		stroke-dasharray: 1 2;
	}
	.closed {
		fill: none;
		stroke: var(--vermilion);
		stroke-dasharray: 2 2;
		opacity: 0.75;
	}
	.plague {
		fill: color-mix(in srgb, #9333ea 25%, transparent);
		stroke: #9333ea;
		stroke-width: 1.2;
		animation: pulseMiasma 2.4s ease-out infinite;
	}
	@keyframes pulseMiasma {
		0% {
			transform: scale(0.8);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.6);
			opacity: 0.15;
		}
	}
	.storm {
		text-anchor: middle;
		pointer-events: none;
		animation: spin 5s linear infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes spin {
		to {
			transform: rotate(-360deg);
		}
	}
	.dis-ring {
		animation: disPulse 2.4s ease-in-out infinite;
		transform-origin: center;
		transform-box: fill-box;
	}
	@keyframes disPulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.35);
			opacity: 0.25;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.dis-ring {
			animation: none;
		}
	}
	.omen-icon {
		user-select: none;
		animation: omenGlow 2.2s ease-in-out infinite alternate;
	}
	@keyframes omenGlow {
		from {
			opacity: 0.7;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	/* Traveled Journey Ribbon (80 Days styling) */
	.trail-glow {
		fill: none;
		stroke: rgba(220, 38, 38, 0.38);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.trail {
		fill: none;
		stroke: var(--vermilion);
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.95;
	}

	/* Available Destination Routes */
	.avail-glow {
		fill: none;
		stroke: var(--gold);
		opacity: 0.45;
		stroke-linecap: round;
	}
	.avail {
		fill: none;
		stroke: var(--ink);
		opacity: 0.8;
		stroke-linecap: round;
	}
	.avail.sea {
		stroke: #2dd4bf;
		stroke-dasharray: 6 3;
	}
	.avail.river {
		stroke: #60a5fa;
	}
	.avail.land {
		stroke: #f59e0b;
	}
	/* colour-blind mode: Okabe–Ito colours plus distinct dash patterns, so modes never rely on hue alone */
	:global(:root[data-cb='1']) .avail.sea {
		stroke: #56b4e9;
		stroke-dasharray: 7 3;
	}
	:global(:root[data-cb='1']) .avail.river {
		stroke: #009e73;
		stroke-dasharray: 2 3;
	}
	:global(:root[data-cb='1']) .avail.land {
		stroke: #e69f00;
		stroke-dasharray: none;
	}
	.avail.sel {
		stroke: var(--vermilion);
		opacity: 1;
	}

	.city {
		cursor: default;
	}
	.city.can {
		cursor: pointer;
	}
	.city.can:hover circle {
		fill: var(--gold);
		stroke: #ffffff;
	}
	.city text {
		fill: #ffffff;
		font-family: var(--display);
		paint-order: stroke fill;
		stroke: rgba(6, 12, 19, 0.92);
		stroke-width: 3.2px;
		stroke-linejoin: round;
		pointer-events: none;
		font-weight: 500;
		letter-spacing: 0.02em;
	}
	.city text.strong {
		font-weight: 700;
		fill: #fef08a;
	}
	.city text.holy {
		fill: var(--gold);
		stroke: none;
		opacity: 1;
	}
	.rival text {
		text-anchor: middle;
		fill: var(--indigo);
		font-style: italic;
		pointer-events: none;
	}

	/* Courier Roundel Badge on Route (Image 1 Airship Badge) */
	.courier-badge circle {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
	}
	.courier-badge text {
		user-select: none;
	}

	/* Pulses for Destination & Current Location */
	.dest-pulse {
		animation: pulseDest 1.8s ease-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes pulseDest {
		0% {
			transform: scale(0.6);
			opacity: 1;
		}
		100% {
			transform: scale(2.2);
			opacity: 0;
		}
	}
	.here-pulse {
		animation: pulseHere 2.2s ease-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes pulseHere {
		0% {
			transform: scale(0.7);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.8);
			opacity: 0;
		}
	}

	.zoom {
		position: absolute;
		display: flex;
		gap: 6px;
		z-index: 10;
	}
	.top-left {
		left: 12px;
		top: 12px;
		flex-direction: column;
	}
	.top-right {
		right: 12px;
		top: 12px;
		flex-direction: column;
	}
	.zoom button {
		width: 35px;
		height: 35px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.22);
		background: rgba(8, 12, 19, 0.82);
		color: #ffffff;
		font-size: 1.15rem;
		font-family: var(--display);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background: rgba(8, 12, 19, 0.94);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		transition: transform 0.1s ease, background 0.15s ease;
	}
	.zoom button:hover {
		transform: scale(1.08);
		background: rgba(15, 23, 42, 0.98);
	}

	.legend {
		position: absolute;
		left: 12px;
		bottom: 10px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.76rem;
		background: rgba(8, 15, 24, 0.94);
		color: #e2e8f0;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}
	.l {
		display: inline-block;
		width: 18px;
		height: 0;
		border-top: 2px solid #ffffff;
		vertical-align: middle;
		margin-right: 4px;
	}
	.l.sea {
		border-top-color: #2dd4bf;
		border-top-style: dashed;
	}
	.l.river {
		border-top-color: #60a5fa;
	}
	.l.land {
		border-top-color: #f59e0b;
	}
	.lq {
		color: var(--jade);
	}
	.lh {
		color: var(--gold-text);
	}
</style>
