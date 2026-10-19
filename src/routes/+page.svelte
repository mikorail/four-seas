<script lang="ts">
	import { onMount } from 'svelte';
	const loadCreator = () => import('#lib/components/Creator.svelte');
	import SwipeCard from '#lib/components/SwipeCard.svelte';
	import StatBar from '#lib/components/StatBar.svelte';
	import WorldMap from '#lib/components/WorldMap.svelte';
	const loadCityFresco = () => import('#lib/components/CityFresco.svelte');
	import { gameSettings, modeGlyph, type IconographyStyle } from '#lib/game/settings.svelte';
	import Portrait from '#lib/components/Portrait.svelte';
	import type { DrawerTab } from '#lib/components/Drawer.svelte';
	const loadDrawer = () => import('#lib/components/Drawer.svelte');
	import JourneyScene from '#lib/components/JourneyScene.svelte';
	import { journeyLook } from '#lib/game/journey';
	const loadChronicleView = () => import('#lib/components/ChronicleView.svelte');
	import RichText from '#lib/components/RichText.svelte';
	const loadMiniGame = () => import('#lib/components/MiniGame.svelte');
	const loadMarket = () => import('#lib/components/Market.svelte');
	const loadPeopleStack = () => import('#lib/components/PeopleStack.svelte');
	import Tip from '#lib/components/Tip.svelte';
	import InkIcon from '#lib/components/InkIcon.svelte';
	const loadCodex = () => import('#lib/components/Codex.svelte');
	import { venuesHere } from '#lib/game/market';
	import EndingWhy from '#lib/components/EndingWhy.svelte';
	import VenueBar from '#lib/components/VenueBar.svelte';
	const loadRiddleDialog = () => import('#lib/components/RiddleDialog.svelte');
	import { OUTFITS } from '#lib/data/market';
	import { wear } from '#lib/game/market';
	import { capOf, moodOf, rapportOf } from '#lib/game/mods';
	import { cellsUsed } from '#lib/game/bag';
	import { innerThoughts, mindState } from '#lib/game/thoughts';
	import { sceneLine, getCityLore } from '#lib/game/prose';
	import { CITIES } from '#lib/data/world';
	import { dateOf, localDate, westernDate } from '#lib/game/calendar';
	import { CITY, cityName, routesFrom, shortestPath } from '#lib/data/world';
	import { DISASTERS, disasterAt, plagueAt } from '#lib/game/events';
	import { turmoilAt } from '#lib/game/turmoil';
	import { CULTURES } from '#lib/data/cultures';
	import { PERK, STATS, STAT_INFO, type Fx, type Stat } from '#lib/data/traits';
	import { CREW } from '#lib/data/items';
	import { capacity } from '#lib/game/cards/index';
	import { MONTHS, monthOf, seasonFor, seasonName } from '#lib/game/economy';
	import {
		availableRoutes,
		choose,
		continueEndless,
		dailySeed,
		dailySetup,
		depart,
		dismiss,
		dropItem,
		load,
		newRun,
		rivalPosition,
		karmaLabel,
		bank,
		retire,
		settle,
		nextAssignment,
		successors,
		legacyOf,
		type Successor,
		save,
		score,
		skipCity,
		useItem,
		visitVenue,
		exportRun,
		importRun,
		meetPerson,
		repairRun,
		rememberForUndo,
		undoLast,
		canUndo,
		rewindTo,
		restorePointsOf,
		knownSecrets,
		openMarket,
		restDay,
		hangout,
		visitDistrictBuilding,
		type Resolution
	} from '#lib/game/engine';
	import { getDressRecommendation, donRecommendedGarb } from '#lib/game/dress';
	import { loadChronicle, recordRun, type Chronicle } from '#lib/game/chronicle';
	import { dispatch } from '#lib/game/ventures';
	import { generateCard, loadAi, saveAi, AI_MODEL, type AiSettings } from '#lib/ai';
	import { shareCard } from '#lib/share';
	import * as sfx from '#lib/audio';
	import { i18n, LANGS, t } from '#lib/i18n.svelte';
	import type { Hero, Run } from '#lib/game/types';
	import { FAITHS } from '#lib/data/faiths';
	import { themeStyle } from '#lib/data/themes';

	let screen = $state<'title' | 'create' | 'game' | 'chronicle'>('title');
	let run = $state<Run | null>(null);
	let saved = $state(false);
	let preview = $state<'left' | 'right' | 'up' | null>(null);
	let outcome = $state<Resolution | null>(null);
	let lastNpc = $state<import('#lib/game/types').Npc | null>(null);
	let flash = $state<Fx | null>(null);
	let selected = $state<string | null>(null);
	let drawer = $state(false);
	let saveMsg = $state('');
	let codex = $state(false);
	let peopleVenue = $state<import('#lib/data/venues').Venue | null>(null);
	function openVenue(id: import('#lib/data/venues').VenueId) {
		if (!run) return;
		const v = venuesHere(run).find((x) => x.id === id);
		if (v) peopleVenue = v;
	}
	function exportSave() {
		const r = run ?? load();
		if (!r) return;
		const blob = new Blob([exportRun(r)], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `four-seas-${r.hero.name.replace(/\W+/g, '-').toLowerCase()}-day${r.day}.json`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 2000);
		saveMsg = 'Saved to your downloads.';
	}
	async function importSave(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		const r = importRun(await f.text());
		saveMsg = r ? `Loaded ${r.hero.name}, day ${r.day}.` : 'That file is not a Four Seas journey.';
		if (r) {
			run = r;
			saved = true;
			screen = 'game';
			settings = false;
		}
	}
	let market = $state(false);
	let riddle = $state<string | null>(null);
	let drawerTab = $state<DrawerTab>('bag');
	let settings = $state(false);
	let mapViewMode = $state<'globe' | 'fresco'>('globe');
	let sound = $state(false);
	let musicOn = $state(false);
	let a11y = $state({ motion: false, cb: false, large: false });
	function applyA11y() {
		const r = document.documentElement;
		r.dataset.motion = a11y.motion ? 'reduce' : '';
		r.dataset.cb = a11y.cb ? '1' : '';
		r.dataset.text = a11y.large ? 'large' : '';
		try {
			localStorage.setItem('four-seas:a11y', JSON.stringify(a11y));
		} catch {}
	}
	let ai = $state<AiSettings>({ enabled: false, apiKey: '' });
	let aiStatus = $state('');
	let chronicle = $state<Chronicle | null>(null);
	let unlocked = $state<string[]>([]);
	let shareMsg = $state('');
	let endPortrait: HTMLDivElement | undefined = $state();

	onMount(() => {
		saved = !!load();
		i18n.load();
		sound = sfx.initSound();
		musicOn = sfx.initMusic();
		try {
			a11y = { ...a11y, ...JSON.parse(localStorage.getItem('four-seas:a11y') ?? '{}') };
		} catch {}
		applyA11y();
		ai = loadAi();
		chronicle = loadChronicle();
		try {
			playGames = localStorage.getItem('four-seas:minigames') !== '0';
		} catch {}
		// home-screen shortcuts
		const q = new URLSearchParams(location.search);
		if (q.get('daily') === '1') startDaily();
		else if (q.get('chronicle') === '1') screen = 'chronicle';
		if (q.size) history.replaceState(null, '', location.pathname);
	});

	$effect(() => {
		if (run) save($state.snapshot(run) as Run);
	});
	// never leave the player stuck: a town or road with nothing to play gets untangled
	$effect(() => {
		if (!run || outcome || minigame) return;
		const stuck = (run.phase === 'city' || run.phase === 'travel') && run.deck.length === 0;
		const ended = run.phase === 'end' && !run.ending;
		if (stuck || ended) repairRun(run);
	});

	// ---- start / resume ----
	function start(hero: Hero, seed: string, year: number, daily = false, difficulty = 'courier', hardship = 'none', campaign?: string) {
		run = newRun(hero, seed, year, { daily, difficulty, hardship, campaign });
		run.graves = loadChronicle().graves ?? [];
		unlocked = [];
		screen = 'game';
		sfx.pluck();
	}
	function startDaily() {
		const d = dailySetup();
		start(d.hero, d.seed, d.year, true);
	}
	function resume() {
		run = load();
		if (run) screen = 'game';
	}
	function abandon() {
		if (!confirm('Abandon this journey? It cannot be recovered.')) return;
		save(null);
		run = null;
		saved = false;
		drawer = false;
		screen = 'create';
	}
	function continueLine(s: Successor) {
		if (!run) return;
		const prev = run;
		run = newRun(s.hero, prev.seed + ':g' + (prev.generation + 1), s.year, { difficulty: prev.difficulty, hardship: 'none', legacy: legacyOf(prev, s) });
		run.graves = loadChronicle().graves ?? [];
		unlocked = [];
		outcome = null;
		sfx.pluck();
	}
	function newJourney() {
		save(null);
		run = null;
		saved = false;
		screen = 'create';
	}

	// ---- derived ----
	const card = $derived(run && (run.phase === 'city' || run.phase === 'travel') ? run.deck[0] : null);
	const routes = $derived(run && run.phase === 'map' ? availableRoutes(run) : []);
	let selAir = $state(false);
	const selRoute = $derived(routes.find((r) => r.to === selected && !!r.air === selAir) ?? routes.find((r) => r.to === selected) ?? null);
	const month = $derived(run ? monthOf(run) : 0);
	const left = $derived(run ? (isFinite(run.deadline) ? run.deadline - run.day : null) : null);
	const place = (id: string) => (run ? cityName(CITY[id], run.year) : '');
	const getModeIcon = (mode: 'sea' | 'river' | 'land' | 'air', targetCity?: string) =>
		modeGlyph(mode, gameSettings.iconography, targetCity ? CITY[targetCity]?.culture : undefined);
	const currentLore = $derived(run ? getCityLore(run, run.location) : null);
	const selectedLore = $derived(run && selected && selected !== run.location ? getCityLore(run, selected) : null);
	const travelSeason = $derived(run?.route ? seasonFor(run.route, month) : null);
	const sceneCulture = $derived(run ? CITY[run.route && run.phase === 'travel' ? run.route.to : run.location].culture : 'han');

	const previewFx = $derived.by(() => {
		if (!card || !preview) return {};
		const ch = card[preview];
		if (!ch) return {};
		const out: Partial<Record<Stat, number>> = {};
		const add = (fx: Fx) => {
			for (const s of STATS) if (fx[s]) out[s] = Math.max(out[s] ?? 0, Math.abs(fx[s]!));
		};
		add(ch.fx);
		if (ch.gamble) {
			add(ch.gamble.win.fx);
			add(ch.gamble.lose.fx);
		}
		return out;
	});

	// ---- actions ----
	let minigame = $state<{ side: 'left' | 'right' | 'up' } | null>(null);
	let playGames = $state(true);
	function onchoose(side: 'left' | 'right' | 'up', forceWin?: boolean) {
		if (!run) return;
		const ch = run.deck[0]?.[side];
		if (forceWin === undefined && playGames && ch?.gamble && ch.tags?.includes('gamble')) {
			minigame = { side };
			return;
		}
		sfx.swipe(side);
		sfx.buzz();
		lastNpc = run.deck[0]?.npc ?? null;
		if (run.deck[0]?.id !== 'intro') rememberForUndo(run);
		const res = choose(run, side, forceWin);
		preview = null;
		flash = res.fx;
		if ((res.fx.silver ?? 0) > 0) sfx.coin(Math.ceil(res.fx.silver! / 6));
		if (res.won !== undefined) sfx.chord(res.won);
		sfx.forNotes(res.notes);
		if (res.text || res.days || res.notes.length) outcome = res;
		if (outcome && quickOutcomes && !res.notes.length && res.won === undefined) setTimeout(() => outcome === res && dismissOutcome(), 1400);
		selected = null;
	}
	function undo() {
		if (!run) return;
		const back = undoLast(run);
		if (back) {
			run = back;
			outcome = null;
			sfx.pluck();
		}
	}
	function rewind(i: number) {
		if (!run || !confirm('Go back to this moment? Everything after it is lost.')) return;
		const back = rewindTo(run, i);
		if (back) {
			run = back;
			outcome = null;
			drawer = false;
		}
	}
	let quickOutcomes = $state(false);
	let photo = $state(false);
	// world news as a toast over the globe: storms, plagues, deaths, your rival's troubles
	let newsSeen = $state('');
	const NEWS = /^(News:|🌀|☣|⚔|🌋|🌊|🔥|🕯|🌪|⛰|❄|🦗|🍂|🌫)/;
	const news = $derived.by(() => {
		const l = run?.log.find((x) => NEWS.test(x.text));
		if (!l) return null;
		const key = `${l.day}:${l.text}`;
		return key === newsSeen || (run && run.day - l.day > 20) ? null : { key, text: l.text };
	});
	$effect(() => {
		const k = news?.key;
		if (!k) return;
		const t = setTimeout(() => (newsSeen = k), 7000);
		return () => clearTimeout(t);
	});
	// route planner: the best multi-leg path to a far city, with days and dangers per leg
	const plan = $derived.by(() => {
		if (!run || run.phase !== 'map' || !selected || selected === run.location || routes.some((r) => r.to === selected)) return null;
		const path = shortestPath(run.location, selected, run.year);
		if (path.length < 2) return null;
		const legs = path.slice(1).map((to, i) => {
			const from = path[i];
			const r = routesFrom(from, run!.year, knownSecrets(run!)).find((x) => x.to === to);
			const warn: string[] = [];
			const d = disasterAt(run!, to);
			if (d) warn.push(`${DISASTERS[d.kind].glyph} ${d.e.label}`);
			const tm = turmoilAt(run!, to);
			if (tm) warn.push(`${tm.glyph} ${tm.label}`);
			if (plagueAt(run!, to)) warn.push('☣ plague');
			return { from, to, days: r?.days ?? 0, warn };
		});
		return { path, legs, days: legs.reduce((a, l) => a + l.days, 0) };
	});
	// the course you set: what is left of it from where you stand
	const course = $derived.by(() => {
		const c = run?.flags.course;
		if (!run || typeof c !== 'string') return null;
		const p = c.split('>');
		const i = p.indexOf(run.location);
		if (i < 0 || i === p.length - 1) return null;
		return p.slice(i);
	});
	function dismissOutcome() {
		outcome = null;
		if (card) sfx.pluck();
	}
	function go() {
		if (!run || !selRoute) return;
		const cost = selRoute.cost;
		depart(run, selRoute);
		selected = null;
		flash = { silver: -cost };
		sfx.pluck();
	}
	function use(id: string) {
		if (!run) return;
		const r = useItem(run, id);
		if (r) {
			flash = r.fx;
			outcome = r;
			drawer = false;
			sfx.chord(true);
		}
	}

	// ---- music follows the region you are in ----
	$effect(() => {
		if (musicOn && screen === 'game' && run) sfx.playMusic(sceneCulture);
		else sfx.stopMusic();
	});

	// ---- sea ambience ----
	$effect(() => {
		if (sound && run?.phase === 'travel' && run.route?.mode === 'sea') sfx.startWaves();
		else sfx.stopWaves();
	});

	// ---- endings → chronicle ----
	let endedKey = '';
	$effect(() => {
		if (run?.phase === 'end' && run.ending) {
			const key = run.seed + run.day + run.ending.kind;
			if (key !== endedKey) {
				endedKey = key;
				unlocked = recordRun($state.snapshot(run) as Run);
				chronicle = loadChronicle();
				if (run.ending.won) sfx.chord(true);
				else sfx.gong();
			}
		}
	});

	// ---- Claude-written cards (optional) ----
	let aiKeyDone = '';
	$effect(() => {
		if (!run || !ai.enabled || !ai.apiKey || run.phase !== 'city') return;
		const key = run.location + ':' + run.day;
		if (key === aiKeyDone || run.deck[0]?.id === 'intro') return;
		aiKeyDone = key;
		const ctl = new AbortController();
		aiStatus = 'Claude is writing a card…';
		generateCard($state.snapshot(run) as Run, ai, ctl.signal).then((c) => {
			aiStatus = '';
			if (!c || !run || run.phase !== 'city' || run.location + ':' + run.day !== key) return;
			run.deck.splice(Math.min(1, run.deck.length), 0, c);
			run.deckTotal++;
		});
	});

	function toggleSound() {
		sound = !sound;
		sfx.setSound(sound);
		if (sound) sfx.pluck();
	}
	function saveAiSettings() {
		saveAi($state.snapshot(ai));
		settings = false;
	}

	async function share() {
		if (!run) return;
		const r = await shareCard(run, endPortrait?.querySelector('svg') ?? null);
		shareMsg = r === 'shared' ? 'Shared!' : r === 'downloaded' ? 'Image saved · text copied' : 'Copied to clipboard';
		setTimeout(() => (shareMsg = ''), 3000);
	}

	function fxList(fx: Fx) {
		return STATS.filter((s) => fx[s]).map((s) => ({ s, v: fx[s]! }));
	}
	const todayBest = $derived(chronicle?.daily[dailySeed()] ?? 0);
	// what a screen reader hears
	const announce = $derived.by(() => {
		if (!run) return '';
		if (run.phase === 'end' && run.ending) return `${run.ending.title}. ${run.ending.text}`;
		if (outcome) return `${outcome.text ?? ''} ${outcome.notes.join(' ')}`.replace(/\*\*/g, '');
		if (card) return `${card.npc.name}, ${card.npc.title}: ${card.text.replace(/\*\*/g, '')} Left: ${card.left.label}. Right: ${card.right.label}.${card.up ? ` Up: ${card.up.label}.` : ''}`;
		if (run.phase === 'map') return `In ${place(run.location)}. Choose a route: ${routes.map((r) => `${place(r.to)}, ${r.days} days`).join('; ')}.`;
		return '';
	});
	const heirs = $derived(run?.phase === 'end' ? successors(run) : []);
	const highlightNames = $derived(
		run ? [run.hero.name, ...(run.rival ? [run.rival.npc.name] : []), ...run.crew.map((c) => c.npc.name), ...CITIES.map((c) => cityName(c, run!.year))] : []
	);
	const mapMarks = $derived.by(() => {
		if (!run) return [];
		const m: { id: string; kind: 'quest' | 'holy' }[] = [];
		for (const q of run.quests) for (const id of q.visit ?? [q.to]) m.push({ id, kind: 'quest' });
		for (const id of FAITHS[run.hero.faith as keyof typeof FAITHS]?.holy ?? []) if (CITY[id] && !run.pilgrimages.includes(id) && !m.some((x) => x.id === id)) m.push({ id, kind: 'holy' });
		return m;
	});
	const dressRec = $derived(run ? getDressRecommendation(run) : null);
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') { photo = false; settings = false; drawer = false; market = false; riddle = null; peopleVenue = null; codex = false; } else if (outcome && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); dismissOutcome(); } }} />

{#if screen === 'title'}
	<main class="title">
		<div class="seal">四海</div>
		<h1>Four Seas</h1>
		<p class="tag">{t('A swipe-driven journey across Asia and beyond, 1500 – 1900.')}</p>
		<p class="sub">{t("Carry your sovereign's commission across a procedurally woven world. Hire a retinue, buy a camel, meet legends, outrun your rival. Swipe left. Swipe right. Sometimes, swipe up.")}</p>
		<div class="row">
			{#if saved}<button class="primary" onclick={resume}>{t('Continue journey')}</button>{/if}
			<button class={saved ? 'ghost' : 'primary'} onclick={() => (screen = 'create')}>{t('New journey')}</button>
		</div>
		<div class="row small-row">
			<button class="ghost" onclick={startDaily}>☀ {t('Daily journey')}{todayBest ? ` · best ${todayBest}` : ''}</button>
			<button class="ghost" onclick={() => ((chronicle = loadChronicle()), (screen = 'chronicle'))}>📖 {t('Chronicle')}</button>
			<button class="ghost" onclick={() => (settings = true)}>⚙ {t('Settings')}</button>
			<a class="ghost linkbtn" href="/editor">✎ {t('Card editor')}</a>
		</div>
	</main>
{:else if screen === 'chronicle' && chronicle}
	{#await loadChronicleView() then { default: ChronicleView }}<ChronicleView {chronicle} onback={() => (screen = 'title')} />{:catch}<main><p class="muted">Could not load chronicle.</p><button class="ghost" onclick={() => (screen = 'title')}>Back</button></main>{/await}
{:else if screen === 'create'}
	<main>
		<nav class="top"><button class="back" onclick={() => (screen = 'title')}>← Four Seas</button></nav>
		{#await loadCreator() then { default: Creator }}<Creator onstart={(h, s, y, d, hs, c) => start(h, s, y, false, d, hs, c)} />{:catch}<p class="muted">Could not load character creator.</p><button class="ghost" onclick={() => (screen = 'title')}>Back</button>{/await}
	</main>
{:else if run}
	<main class="game themed" class:photo style={themeStyle(sceneCulture)}>
		<div class="stage" aria-label="World">
			<button class="photobtn" onclick={() => (photo = !photo)} title={photo ? 'Back to the game' : 'Photo mode: just the world'} aria-label="Photo mode">{photo ? '✕' : '📷'}</button>
			{#if photo}
				<div class="caption">
					<b>{run.hero.name}</b>
					<span>{run.hero.age + Math.floor(run.day / 365)} · {PERK[run.hero.profession].name} · day {run.day}, {westernDate(dateOf(run, run.day))}</span>
					<i>{run.visited.length} cities · {place(run.location)}{run.titles?.length ? ` · “${run.titles.at(-1)}”` : ''}</i>
				</div>
			{/if}
			{#if news}<button class="newstoast" onclick={() => (newsSeen = news!.key)} title="Dismiss">{news.text}</button>{/if}
			{#if mapViewMode === 'globe'}
				<WorldMap
					{run}
					fill
					routes={run.phase === 'map' ? routes : []}
					{selected}
					rival={rivalPosition(run)}
					marks={mapMarks}
					onselect={(id) => run?.phase === 'map' && (selected = id)}
					onsettings={() => (settings = true)}
					onfresco={() => (mapViewMode = 'fresco')}
				/>
			{:else}
				{#await loadCityFresco() then { default: CityFresco }}<CityFresco
					{run}
					fill
					onmarket={() => run && openMarket(run) && (market = true)}
					onrest={() => run && restDay(run)}
					onvisit={(id) => run && visitVenue(run, id)}
					ontogglemap={() => (mapViewMode = 'globe')}
					onsettings={() => (settings = true)}
				/>{:catch}<WorldMap
					{run}
					fill
					routes={run.phase === 'map' ? routes : []}
					{selected}
					rival={rivalPosition(run)}
					marks={mapMarks}
					onselect={(id) => run?.phase === 'map' && (selected = id)}
					onsettings={() => (settings = true)}
					onfresco={() => (mapViewMode = 'globe')}
				/>{/await}
			{/if}
		</div>
		<aside class="panel">
		<header class="hud">
			<button class="me" onclick={() => ((drawerTab = 'self'), (drawer = true))} title="Character & retinue">
				<Portrait culture={run.hero.culture} gender={run.hero.gender} seed={run.hero.seed} year={run.year} size={40} hatOverride={run.outfit ? OUTFITS[run.outfit.id]?.hat : undefined} robeOverride={run.outfit ? OUTFITS[run.outfit.id]?.robe : undefined} />
				<span>
					<b>{run.hero.name}{#if run.generation > 1} <i class="gen">gen. {run.generation}</i>{/if}</b>
					<small>{run.year} · age {run.hero.age + Math.floor(run.day / 365)} · {PERK[run.hero.profession].name}{run.treasury ? ` · ${run.treasury} taels` : ''}</small>
					{#if run.titles?.length}<small class="titleline">“{run.titles.at(-1)}”</small>{/if}
				</span>
			</button>
			<div class="clock" class:late={left !== null && left < 10}>
				<b>{t('Day')} {run.day}</b>
				<small>{westernDate(dateOf(run, run.day))} · {left === null ? t('free to wander') : left >= 0 ? `${left} ${t('days left')}` : t('overdue')}</small>
			</div>
		</header>

		<StatBar stats={run.stats} preview={previewFx} {flash} mind={run.mind ?? 70} mindLabel={mindState(run).label} apathy={run.apathy ?? 0} caps={{ silver: capOf(run, 'silver'), vigor: capOf(run, 'vigor'), renown: capOf(run, 'renown'), fortune: capOf(run, 'fortune'), mind: capOf(run, 'mind') }} />

		<div class="chips">
			<button class="chip" onclick={() => ((drawerTab = 'bag'), (drawer = true))} title="Bag" aria-label="Bag {cellsUsed(run)}/{capacity(run)}"><InkIcon name="bag" /> {cellsUsed(run)}/{capacity(run)}</button>
			{#if run.mount}<button class="chip" onclick={() => ((drawerTab = 'bag'), (drawer = true))} title="{run.mount.name}: {run.mount.health}% health" class:warn={run.mount.health < 40}><InkIcon name="mount" /> {run.mount.name}</button>{/if}
			{#if run.crew.length}<button class="chip" onclick={() => ((drawerTab = 'retinue'), (drawer = true))} title="Retinue">{#each run.crew as c}<span title="{c.npc.name}, {CREW[c.role].title}" class:warn={c.loyalty < 35}>{CREW[c.role].glyph}</span>{/each}</button>{/if}
			{#if run.heat >= 10}<button class="chip heat" onclick={() => ((drawerTab = 'self'), (drawer = true))} title="Wanted level {Math.round(run.heat)}"><InkIcon name="lantern" /> {run.heat >= 60 ? 'Wanted!' : run.heat >= 30 ? 'Sought' : 'Noticed'}</button>{/if}
			{#if moodOf(run)}<span class="chip" title="Mercurial: {moodOf(run) === 'good' ? '+15%' : '-10%'} on every gamble today"><InkIcon name={moodOf(run) === 'good' ? 'sun' : 'storm'} /> {moodOf(run) === 'good' ? 'Good day' : 'Bad day'}</span>{/if}
			<button class="chip merit" class:good={run.karma >= 10} class:bad={run.karma <= -10} onclick={() => ((drawerTab = 'self'), (drawer = true))} title="Merit {run.karma}: {karmaLabel(run.karma)}. People you helped or wronged: {run.ties.filter((t) => !t.resolved).length}"><InkIcon name="merit" /> {karmaLabel(run.karma)}</button>
			{#if run.romance && run.romance.status !== 'parted'}<button class="chip" class:warn={run.romance.affection < 25} onclick={() => ((drawerTab = 'retinue'), (drawer = true))} title="{run.romance.npc.name} ({run.romance.status}), affection {Math.round(run.romance.affection)}" aria-label="Sweetheart"><InkIcon name="heart" />{run.romance.status === 'married' ? ' married' : run.romance.status === 'betrothed' ? ' betrothed' : ''}</button>{/if}
			{#if run.quests.length}<button class="chip quest" onclick={() => ((drawerTab = 'ledger'), (drawer = true))} title="Tasks"><InkIcon name="tasks" /> {run.quests.length}</button>{/if}
			<button class="chip" onclick={() => ((drawerTab = 'journal'), (drawer = true))} title="Journal" aria-label="Journal"><InkIcon name="journal" /></button>
		</div>

		<div class="where">
			{#if run.phase === 'travel' && run.route}
				<span>{getModeIcon(run.route.mode, run.route.to)} By {run.route.vessel} → <b>{place(run.route.to)}</b></span>
			{:else}
				<span>📍 <b>{place(run.location)}</b></span>
			{/if}
			<span class="localdate" title="Local reckoning">🗓 {localDate(dateOf(run, run.day), sceneCulture)}</span>
			{#if !run.delivered}<span class="goal">◎ {t('Deliver {item} to {city}', { item: run.item.replace(/^an? /, ''), city: place(run.destination) })}</span>{/if}
			{#if aiStatus}<span class="ai">✎ {aiStatus}</span>{/if}
		</div>

		{#if run.phase === 'end' && run.ending}
			<section class="ending" class:won={run.ending.won}>
				<div bind:this={endPortrait}>
					<Portrait culture={run.hero.culture} gender={run.hero.gender} seed={run.hero.seed} year={run.year} size={130} role={run.ending.kind === 'vigor-low' ? 'ghost' : 'hero'} />
				</div>
				<h2>{run.ending.title}</h2>
				<p>{run.ending.text}</p>
				<EndingWhy {run} />
				<dl>
					<div><dt>{t('Days')}</dt><dd>{run.day}</dd></div>
					<div><dt>{t('Cities')}</dt><dd>{run.visited.length}</dd></div>
					<div><dt>{t('Legends')}</dt><dd>{run.legends.length}</dd></div>
					<div><dt>{t('Score')}</dt><dd>{score(run)}</dd></div>
				</dl>
				{#if unlocked.length}
					<div class="unlock">
						{#each unlocked as id}<span>🔓 {t('Unlocked:')} <b>{PERK[id].glyph} {PERK[id].name}</b></span>{/each}
					</div>
				{/if}
				<div class="dynasty">
					<h3>{t('Continue the line')}</h3>
					<p class="muted small">Your relics, half your standing and merit, most of your treasury{run.delivered ? '' : ' and your unfinished commission'} pass on. So do your enemies.</p>
					<div class="heirs">
						{#each heirs as h}
							<button class="heir" onclick={() => continueLine(h)}>
								<Portrait culture={h.hero.culture} gender={h.hero.gender} seed={h.hero.seed} year={h.year} size={56} />
								<span><b>{h.hero.name}</b><small>{h.label} · {h.year}</small></span>
							</button>
						{/each}
					</div>
				</div>
				<div class="row">
					{#if run.ending.won && run.ending.kind !== 'prince' && run.ending.kind !== 'retired' && run.ending.kind !== 'settled'}
						<button class="primary" onclick={() => { if (run) { nextAssignment(run); outcome = null; } }}>📜 {t('Next assignment')}</button>
						<button class="ghost" onclick={() => run && continueEndless(run)}>{t('Keep wandering')}</button>
					{/if}
					<button class={run.ending.won ? 'ghost' : 'primary'} onclick={newJourney}>{t('New journey')}</button>
					<button class="ghost" onclick={share}>⇪ {t('Share')}</button>
					<button class="ghost" onclick={() => ((drawerTab = 'journal'), (drawer = true))}>{t('Journal')}</button>
				</div>
				{#if shareMsg}<p class="muted small">{shareMsg}</p>{/if}
			</section>
		{:else if outcome}
			<button class="outcome" onclick={dismissOutcome}>
				{#if lastNpc}
					{@const sum = Object.values(outcome.fx).reduce((a, v) => a + (v ?? 0), 0)}
					<Portrait culture={lastNpc.culture} gender={lastNpc.gender} seed={lastNpc.seed} role={lastNpc.role} year={run.year} size={64} mood={outcome.won === false || sum < -4 ? 'sad' : outcome.won || sum > 4 ? 'happy' : 'neutral'} />
				{/if}
				{#if outcome.won !== undefined}<span class="roll" class:bad={!outcome.won}>⚂ {outcome.won ? t('Fortune smiles') : t('Fortune frowns')}</span>{/if}
				{#if outcome.text}<p><RichText text={outcome.text} names={highlightNames} /></p>{/if}
				<div class="fx">
					{#each fxList(outcome.fx) as f}<span class:neg={f.v < 0}>{STAT_INFO[f.s].glyph} {f.v > 0 ? '+' : ''}{f.v} {STAT_INFO[f.s].label}</span>{/each}
					{#if outcome.days}<span class:neg={outcome.days > 0}>{outcome.days > 0 ? '+' : ''}{outcome.days} days</span>{/if}
				</div>
				{#each outcome.notes as n}<small class="note"><RichText text={n} names={highlightNames} /></small>{/each}
				<small>{t('tap to continue')}</small>
			</button>
			{#if canUndo(run)}<button class="undo" onclick={undo} title="Take back that choice (once per city{run.difficulty === 'pilgrim' ? '; unlimited on Pilgrimage' : ''})">↶ {t('Undo')}</button>{/if}
		{:else if card}
			{#if run.phase === 'travel' && run.route}
				<JourneyScene look={journeyLook(run, run.route)} from={place(run.route.from)} to={place(run.route.to)} days={run.route.days} progress={(run.deckTotal - run.deck.length + 0.5) / Math.max(1, run.deckTotal)} />
			{/if}
			{#key card}
				<SwipeCard {card} thoughts={innerThoughts(run, card)} rapport={card.id === 'intro' ? null : rapportOf(run, card.npc.role)} year={run.year} scene={sceneCulture} opener={sceneLine(run, card)} names={highlightNames} mode={card.scene === 'rustic' || run.flags.inDetour ? 'rustic' : (run.phase === 'travel' ? (run.route?.mode ?? null) : null)} city={run.phase === 'city' ? run.location : run.route?.to ?? run.location} onpreview={(s) => (preview = s)} {onchoose} />
			{/key}
			{#if canUndo(run) && card.id !== 'intro'}<button class="undo" onclick={undo} title="Take back your last choice">↶ {t('Undo last choice')}</button>{/if}
			{#if run.phase === 'city' && card.id !== 'intro'}
				{#if dressRec && dressRec.ownedOutfitId && !dressRec.alreadyWearing && !run.flags['dismiss_dress:' + run.location]}
					<div class="dress-helper-banner">
						<span class="dress-g">{dressRec.recommendedOutfitGlyph}</span>
						<div class="dress-info">
							<b>{t('Local Dress Etiquette:')}</b> <small>{dressRec.advisory}</small>
						</div>
						<div class="dress-btns">
							<button class="dress-btn primary" onclick={() => { if (run) donRecommendedGarb(run, dressRec.ownedOutfitId!); }}>
								{t('Wear {name}', { name: dressRec.recommendedOutfitName })}
							</button>
							<button class="dress-btn ghost" onclick={() => { if (run) run.flags['dismiss_dress:' + run.location] = true; }}>
								✕
							</button>
						</div>
					</div>
				{/if}
				<VenueBar {run} onvisit={openVenue} onmarket={() => run && openMarket(run) && (market = true)} onrest={() => run && restDay(run)} onhangout={() => { if (run) hangout(run); }} onbuilding={(d, b) => { if (run) visitDistrictBuilding(run, d, b); }} />
				<button class="skip" onclick={() => run && skipCity(run)}>{t('Leave {city} now', { city: place(run.location) })}</button>
			{/if}
		{:else if run.phase === 'map'}
			<section class="mapview">
				<div class="routes">
					<div class="city-card-header">
						<div class="city-title-row">
							<h3>{selected && selected !== run.location ? t('Route to {city}', { city: place(selected) }) : t('In {city}', { city: place(run.location) })}</h3>
							<span class="culture-pill">{CULTURES[CITY[selected ?? run.location].culture].label}</span>
						</div>
						<p class="muted small city-blurb">{CITY[selected ?? run.location].blurb}</p>
						{#if selected && selected !== run.location && selectedLore}
							<div class="city-lore-banner">
								<span class="lore-headline">“{selectedLore.headline}”</span>
								<p class="lore-flavor">{selectedLore.flavorText}</p>
								<small class="lore-specialty">✦ {selectedLore.specialty}</small>
							</div>
						{:else if currentLore}
							<div class="city-lore-banner">
								<span class="lore-headline">“{currentLore.headline}”</span>
								<p class="lore-flavor">{currentLore.flavorText}</p>
								<small class="lore-specialty">✦ {currentLore.specialty}</small>
							</div>
						{/if}
					</div>

					{#if dressRec && dressRec.ownedOutfitId && !dressRec.alreadyWearing && !run.flags['dismiss_dress:' + run.location]}
						<div class="dress-helper-banner">
							<span class="dress-g">{dressRec.recommendedOutfitGlyph}</span>
							<div class="dress-info">
								<b>{t('Local Dress Etiquette:')}</b> <small>{dressRec.advisory}</small>
							</div>
							<div class="dress-btns">
								<button class="dress-btn primary" onclick={() => { if (run) donRecommendedGarb(run, dressRec.ownedOutfitId!); }}>
									{t('Wear {name}', { name: dressRec.recommendedOutfitName })}
								</button>
								<button class="dress-btn ghost" onclick={() => { if (run) run.flags['dismiss_dress:' + run.location] = true; }}>
									✕
								</button>
							</div>
						</div>
					{/if}

					<VenueBar {run} onvisit={openVenue} onmarket={() => run && openMarket(run) && (market = true)} onrest={() => run && restDay(run)} onhangout={() => { if (run) hangout(run); }} onbuilding={(d, b) => { if (run) visitDistrictBuilding(run, d, b); }} />

					<div class="routes-subhead">
						<span class="subhead-title">{t('Available departures')} ({routes.length})</span>
					</div>

					<ul class="routes-list">
						{#each routes.toSorted((a, b) => a.days - b.days) as r (r.to + (r.air ? '-air' : '') + r.mode)}
							<li>
								<button class="route" class:sel={selected === r.to && !!r.air === !!selAir} onclick={() => ((selected = r.to), (selAir = !!r.air))}>
									<span class="m">{getModeIcon(r.air ? 'air' : r.mode, r.to)}</span>
									<span class="n">
										<b>{place(r.to)}{#if course && course[1] === r.to} <i class="onc">🧭</i>{/if}{#if r.to === run.destination && !run.delivered} ◎{/if}{#if mapMarks.some((m) => m.id === r.to && m.kind === 'quest')} <i class="qm">◆</i>{/if}{#if mapMarks.some((m) => m.id === r.to && m.kind === 'holy')} <i class="hm">✦</i>{/if}</b>
										<small>{r.vessel} · {CULTURES[CITY[r.to].culture].label}{#if r.season.id !== 'fair'} · <em class="season">{r.season.glyph} {r.season.label}</em>{/if}{#each r.warnings as w} · <em class="season">{w}</em>{/each}</small>
									</span>
									<span class="d">{r.days}d</span>
									<span class="c">銀 {r.cost}</span>
								</button>
							</li>
						{/each}
					</ul>
					{#if selRoute}
						<div class="depart">
							<p><b>{place(selRoute.to)}</b>: {CITY[selRoute.to].blurb}</p>
							<p class="muted small">
								{selRoute.km.toLocaleString()} km by {selRoute.vessel}. Arrive day {run.day + selRoute.days}{left !== null ? ` (deadline ${run.deadline})` : ''}.
								{#if run.crew.length}Wages {run.crew.reduce((s, c) => s + c.wage, 0)}.{/if}
								{#if run.mount}{selRoute.mode === 'sea' ? `Freight for ${run.mount.name} included.` : `Fodder for ${run.mount.name} included.`}{/if}
							</p>
							<button class="primary" onclick={go}>{t('Depart')} {getModeIcon(selRoute.air ? 'air' : selRoute.mode, selRoute.to)}</button>
						</div>
					{:else if selected && plan}
						<div class="planner">
							<p><b>{place(selected)}</b>: {CITY[selected].blurb}</p>
							<ol class="legs">
								{#each plan.legs as lg}
									<li><span>{place(lg.from)} → <b>{place(lg.to)}</b></span><small>{lg.days}d{#each lg.warn as w} · {w}{/each}</small></li>
								{/each}
							</ol>
							<p class="muted small">About <b>{plan.days} days</b> in {plan.legs.length} legs{left !== null ? `, arriving around day ${run.day + plan.days} (deadline ${run.deadline})` : ''}.</p>
							<button class="primary" onclick={() => { if (run && selected) { run.flags.course = plan!.path.join('>'); selected = plan!.path[1]; } }}>🧭 {t('Set course')}</button>
						</div>
					{:else if selected}
						<p class="muted small">{place(selected)}: {CITY[selected].blurb} <i>{t('No road leads there from here.')}</i></p>
					{/if}
					{#if course}
						<p class="course small">🧭 Course to <b>{place(course.at(-1)!)}</b>: next <b>{place(course[1] ?? course[0])}</b> <button class="link" onclick={() => run && delete run.flags.course}>clear</button></p>
					{/if}
					{#if run.rival && !run.delivered}
						<p class="muted small rivalnote">◌ Rival {run.rival.npc.name} {run.rival.arrived ? 'has already arrived.' : `is near ${place(rivalPosition(run) ?? run.location)}.`}</p>
					{/if}
				</div>
			</section>
		{/if}
		<Tip {run} oncodex={() => (codex = true)} />
		</aside>
	</main>

	{#if codex}
		{#await loadCodex() then { default: Codex }}<Codex onclose={() => (codex = false)} />{:catch}<div class="scrim" onclick={() => (codex = false)} role="presentation"></div><div class="modal" role="alert"><p class="muted">{t('Could not load Codex.')}</p><button class="ghost" onclick={() => (codex = false)}>{t('Close')}</button></div>{/await}
	{/if}
	{#if peopleVenue && run}
		{#await loadPeopleStack() then { default: PeopleStack }}<PeopleStack
			{run}
			venue={peopleVenue}
			onmeet={(p) => { if (run && peopleVenue && meetPerson(run, peopleVenue.id, p)) peopleVenue = null; }}
			onlook={() => { if (run && peopleVenue) visitVenue(run, peopleVenue.id); peopleVenue = null; }}
			onclose={() => (peopleVenue = null)}
		/>{:catch}<div class="scrim" onclick={() => (peopleVenue = null)} role="presentation"></div><div class="modal" role="alert"><p class="muted">{t('Could not load people.')}</p><button class="ghost" onclick={() => (peopleVenue = null)}>{t('Close')}</button></div>{/await}
	{/if}
	{#if market}
		{#await loadMarket() then { default: Market }}<Market {run} onclose={() => (market = false)} />{:catch}<div class="scrim" onclick={() => (market = false)} role="presentation"></div><div class="modal" role="alert"><p class="muted">{t('Could not load market.')}</p><button class="ghost" onclick={() => (market = false)}>{t('Close')}</button></div>{/await}
	{/if}
	{#if riddle}
		{#await loadRiddleDialog() then { default: RiddleDialog }}<RiddleDialog {run} item={riddle} onclose={() => (riddle = null)} />{:catch}<div class="scrim" onclick={() => (riddle = null)} role="presentation"></div><div class="modal" role="alert"><p class="muted">{t('Could not load riddle.')}</p><button class="ghost" onclick={() => (riddle = null)}>{t('Close')}</button></div>{/await}
	{/if}
	{#if drawer}
		{#await loadDrawer() then { default: Drawer }}<Drawer {run} bind:tab={drawerTab} ondispatch={(id, t) => run && dispatch(run, id, t)} onbank={(n) => run && bank(run, n)} onretire={() => { if (run && confirm('Retire here and end this traveller\'s journey?')) { retire(run); drawer = false; } }} onsettle={() => { if (run && confirm('Settle down peacefully in this city on your own terms?')) { settle(run); drawer = false; } }} onuse={use} onriddle={(id) => ((riddle = id), (drawer = false))} onwear={(id) => run && wear(run, id)} ondrop={(id) => run && dropItem(run, id)} ondismiss={(id) => run && dismiss(run, id)} onabandon={abandon} onrewind={rewind} onclose={() => (drawer = false)} />{:catch}<div class="scrim" onclick={() => (drawer = false)} role="presentation"></div><div class="modal" role="alert"><p class="muted">{t('Could not load drawer.')}</p><button class="ghost" onclick={() => (drawer = false)}>{t('Close')}</button></div>{/await}
	{/if}
{/if}

<div class="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>

{#if minigame && run}
	{#await loadMiniGame() then { default: MiniGame }}<MiniGame culture={sceneCulture} seed={run.deck[0]?.npc.seed ?? 1} onend={(won) => { const s = minigame!.side; minigame = null; onchoose(s, won); }} onskip={() => { const s = minigame!.side; minigame = null; onchoose(s, Math.random() < (run?.deck[0]?.[s]?.gamble?.p ?? 0.5)); }} />{:catch}<div><button class="primary" onclick={() => { const s = minigame!.side; minigame = null; onchoose(s, Math.random() < (run?.deck[0]?.[s]?.gamble?.p ?? 0.5)); }}>{t('Skip mini-game')}</button></div>{/await}
{/if}

{#if settings}
	<div class="scrim" onclick={() => (settings = false)} role="presentation"></div>
	<div class="modal" role="dialog" aria-label="Settings">
		<h3>{t('Settings')}</h3>
		<button class="ghost" onclick={() => ((codex = true), (settings = false))}>📖 {t('Codex: how everything works')}</button>
		<label class="toggle">{t('Appearance')}
			<select value={gameSettings.theme} onchange={(e) => gameSettings.setTheme(e.currentTarget.value as any)}>
				<option value="system">{t('System preference')}</option>
				<option value="light">{t('Light (Parchment)')}</option>
				<option value="dark">{t('Dark (Lacquer)')}</option>
			</select>
		</label>
		<label class="toggle lang">{t('Language')} <select bind:value={i18n.lang}>{#each Object.entries(LANGS) as [k, v]}<option value={k}>{v}</option>{/each}</select></label>
		{#if i18n.lang !== 'en'}<p class="muted small">{t('Story cards are written in English; the interface is translated.')}</p>{/if}
		<label class="toggle">{t('Iconography')}
			<select value={gameSettings.iconography} onchange={(e) => gameSettings.setIconography(e.currentTarget.value as IconographyStyle)}>
				<option value="multicultural">{t('Multicultural (Regional adaptive symbols)')}</option>
				<option value="heraldic">{t('Heraldic (80 Days minimalist roundels)')}</option>
				<option value="woodblock">{t('Woodblock (Far Eastern ink & seals)')}</option>
			</select>
		</label>
		<label class="toggle"><input type="checkbox" bind:checked={quickOutcomes} /> {t('Quick outcomes (simple results close by themselves)')}</label>
		<label class="toggle"><input type="checkbox" checked={sound} onchange={toggleSound} /> {t('Sound effects (synthesized)')}</label>
		<label class="toggle"><input type="checkbox" checked={musicOn} onchange={(e) => { musicOn = e.currentTarget.checked; sfx.setMusic(musicOn, run ? sceneCulture : 'han'); if (!run && musicOn) setTimeout(() => sfx.stopMusic(), 6000); }} /> {t('Music that changes with each region (guzheng, koto, gamelan, sitar, oud…)')}</label>
		<hr />
		<b class="small">{t('Accessibility')}</b>
		<label class="toggle"><input type="checkbox" bind:checked={a11y.motion} onchange={applyA11y} /> {t('Reduce motion')}</label>
		<label class="toggle"><input type="checkbox" bind:checked={a11y.cb} onchange={applyA11y} /> {t('Colorblind-friendly colors')}</label>
		<label class="toggle"><input type="checkbox" bind:checked={a11y.large} onchange={applyA11y} /> {t('Larger text')}</label>
		<hr />
		<label class="toggle"><input type="checkbox" checked={playGames} onchange={(e) => { playGames = e.currentTarget.checked; try { localStorage.setItem('four-seas:minigames', playGames ? '1' : '0'); } catch {} }} /> {t('Play mini-games for gambles (mahjong, hanafuda, go, bao, chaupar…)')}</label>
		<hr />
		<b class="small">{t('Save file')}</b>
		<div class="row">
			<button class="ghost" disabled={!run && !saved} onclick={exportSave}>⬇ {t('Export journey')}</button>
			<label class="ghost filebtn">⬆ {t('Import journey')}<input type="file" accept="application/json,.json" onchange={importSave} hidden /></label>
		</div>
		{#if saveMsg}<p class="muted small">{saveMsg}</p>{/if}
		<hr />
		<label class="toggle"><input type="checkbox" bind:checked={ai.enabled} /> {t('Claude-written cards')}</label>
		<p class="muted small">When on, Claude ({AI_MODEL}) writes one extra card in each city, grounded in the year, culture and your character. Uses your own Anthropic API key; requests go straight from this browser to Anthropic and the key is stored only in this browser. Each card is a small paid API call.</p>
		<input type="password" placeholder="sk-ant-…" bind:value={ai.apiKey} autocomplete="off" />
		<div class="row end">
			<button class="ghost" onclick={() => (settings = false)}>{t('Cancel')}</button>
			<button class="primary" onclick={saveAiSettings}>{t('Save')}</button>
		</div>
	</div>
{/if}

<style>
	main {
		max-width: 980px;
		margin: 0 auto;
		padding: 12px 16px 32px;
	}
	/* the world is the stage; everything you read lives in the side panel */
	main.game {
		max-width: none;
		padding: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) clamp(380px, 31vw, 460px);
		height: 100dvh;
		overflow: hidden;
	}
	.stage {
		position: relative;
		height: 100dvh;
		min-width: 0;
		background: #060b13;
		overflow: hidden;
	}
	.panel {
		height: 100dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 16px 20px calc(28px + env(safe-area-inset-bottom));
		background: var(--paper);
		border-left: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 10px;
		scrollbar-width: thin;
	}
	.panel > :global(*) {
		flex-shrink: 0;
	}
	@media (max-width: 899px) {
		main.game {
			display: block;
			height: auto;
			overflow: visible;
		}
		.stage {
			position: sticky;
			top: 0;
			height: 42dvh;
			z-index: 0;
		}
		.panel {
			position: relative;
			z-index: 1;
			height: auto;
			min-height: 62dvh;
			margin-top: -16px;
			border-left: 0;
			border-radius: 18px 18px 0 0;
			box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.28);
			padding: 14px 16px calc(24px + env(safe-area-inset-bottom));
		}
		.panel::before {
			content: '';
			display: block;
			width: 40px;
			height: 4px;
			border-radius: 2px;
			background: var(--line);
			margin: -4px auto 4px;
		}
	}
	.title {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 6px;
	}
	.seal {
		font-family: var(--cjk);
		font-size: 3rem;
		font-weight: 700;
		color: #fff;
		background: var(--vermilion);
		padding: 10px 14px;
		border-radius: 10px;
		writing-mode: vertical-rl;
		letter-spacing: 0.1em;
		box-shadow: 0 6px 20px color-mix(in srgb, var(--vermilion) 40%, transparent);
		transform: rotate(-3deg);
	}
	h1 {
		font-family: var(--display);
		font-size: clamp(2.6rem, 9vw, 4.4rem);
		margin: 14px 0 0;
		letter-spacing: 0.04em;
	}
	.tag {
		font-size: 1.15rem;
		font-style: italic;
		margin: 0;
	}
	.sub {
		max-width: 480px;
		color: var(--muted);
		margin: 12px 0 18px;
	}
	.row {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.small-row {
		margin-top: 10px;
	}
	.small-row button {
		font-size: 0.9rem;
		padding: 7px 14px;
	}
	.top {
		padding: 4px 0 8px;
	}
	.linkbtn {
		font-size: 0.9rem;
		padding: 7px 14px;
		border-radius: 999px;
		border: 1.5px solid var(--ink);
		color: var(--ink);
		text-decoration: none;
	}
	.back {
		font: inherit;
		background: none;
		border: 0;
		color: var(--muted);
		cursor: pointer;
	}
	.hud {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}
	.me {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: 0;
		cursor: pointer;
		color: var(--ink);
		font: inherit;
		text-align: left;
		padding: 0;
	}
	.me span,
	.clock {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.me b {
		font-family: var(--display);
		font-size: 1.1rem;
	}
	small {
		color: var(--muted);
		font-size: 0.78rem;
	}
	.clock {
		text-align: right;
	}
	.clock b {
		font-family: var(--display);
		font-size: 1.3rem;
	}
	.clock.late b {
		color: var(--vermilion);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px;
		margin-top: 10px;
	}
	.chip {
		font: inherit;
		font-size: 0.84rem;
		padding: 3px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--card);
		color: var(--ink);
		cursor: pointer;
		display: inline-flex;
		gap: 4px;
		align-items: center;
	}
	.chip .warn,
	.chip.warn {
		filter: grayscale(0.6);
		border-color: var(--vermilion);
	}
	.chip.merit.good {
		border-color: var(--jade);
		color: var(--jade);
	}
	.chip.merit.bad {
		border-color: var(--vermilion);
		color: var(--vermilion);
	}
	.chip.quest {
		border-color: var(--jade);
		color: var(--jade);
	}
	.chip.heat {
		border-color: var(--vermilion);
		color: var(--vermilion);
	}
	.where {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px 16px;
		font-size: 0.92rem;
		margin: 10px 0 14px;
		text-align: center;
	}
	.goal {
		color: var(--gold-text);
	}
	.localdate {
		color: var(--muted);
		font-style: italic;
	}
	.ai {
		color: var(--indigo);
		font-style: italic;
	}
	.skip {
		display: block;
		margin: 16px auto 0;
		font: inherit;
		font-size: 0.85rem;
		color: var(--muted);
		background: none;
		border: 0;
		text-decoration: underline;
		cursor: pointer;
	}
	.outcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		max-width: 440px;
		margin: 30px auto 0;
		padding: 28px 22px;
		width: 100%;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 14px;
		color: var(--ink);
		font: inherit;
		cursor: pointer;
		box-shadow: 0 10px 30px var(--shadow);
		animation: flip 0.35s ease-out;
	}
	@keyframes flip {
		from {
			transform: rotateY(70deg);
			opacity: 0;
		}
	}
	.outcome p {
		font-size: 1.2rem;
		font-style: italic;
		margin: 0;
		text-align: center;
	}
	.note {
		color: var(--ink);
		font-size: 0.88rem;
		background: var(--paper-2);
		padding: 3px 10px;
		border-radius: 6px;
	}
	.roll {
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--jade);
	}
	.roll.bad {
		color: var(--vermilion);
	}
	.fx {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
	}
	.fx span {
		padding: 2px 10px;
		border-radius: 999px;
		font-size: 0.85rem;
		background: color-mix(in srgb, var(--jade) 15%, transparent);
		color: var(--jade);
	}
	.fx span.neg {
		background: color-mix(in srgb, var(--vermilion) 13%, transparent);
		color: var(--vermilion);
	}
	.mapview {
		display: block;
	}
	.routes {
		background: none;
		border: 0;
		border-radius: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.city-card-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.city-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.city-title-row h3 {
		font-family: var(--display);
		margin: 0;
		font-size: 1.35rem;
		line-height: 1.2;
	}
	.culture-pill {
		font-size: 0.76rem;
		padding: 2px 9px;
		border-radius: 999px;
		background: var(--paper-2);
		border: 1px solid var(--line);
		color: var(--ink);
		font-weight: 600;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}
	.city-blurb {
		margin: 2px 0 0;
		line-height: 1.35;
	}
	.city-lore-banner {
		background: var(--paper-2);
		border-left: 3px solid var(--vermilion);
		border-radius: 0 8px 8px 0;
		padding: 8px 12px;
		margin-top: 6px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.lore-headline {
		font-family: var(--display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--ink);
		letter-spacing: 0.02em;
	}
	.lore-flavor {
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--ink);
		margin: 0;
		font-style: italic;
	}
	.lore-specialty {
		font-size: 0.76rem;
		color: var(--gold-text);
		font-weight: 600;
	}
	.routes-subhead {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--line);
		padding-top: 8px;
	}
	.subhead-title {
		font-family: var(--display);
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--ink);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.small {
		font-size: 0.88rem;
	}
	.muted {
		color: var(--muted);
	}
	.routes-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-height: 380px;
		overflow-y: auto;
		padding-right: 4px;
	}
	.route {
		width: 100%;
		display: grid;
		grid-template-columns: 28px 1fr auto auto;
		align-items: center;
		gap: 8px;
		font: inherit;
		color: var(--ink);
		text-align: left;
		background: var(--paper-2);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 7px 10px;
		cursor: pointer;
		transition: transform 0.14s ease, border-color 0.14s ease;
	}
	.route:hover {
		transform: translateX(2px);
		border-color: var(--gold);
	}
	.route.sel {
		border-color: var(--vermilion);
		background: color-mix(in srgb, var(--card) 60%, var(--paper-2));
		box-shadow: inset 3.5px 0 0 var(--vermilion);
	}
	.route .m {
		font-size: 1.1rem;
		text-align: center;
	}
	.route .n {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.qm {
		color: var(--jade);
		font-style: normal;
	}
	.hm {
		color: var(--gold-text);
		font-style: normal;
	}
	.season {
		color: var(--vermilion);
		font-style: normal;
	}
	.route .d {
		font-weight: 600;
		font-size: 0.92rem;
	}
	.route .c {
		font-size: 0.85rem;
		color: var(--muted);
	}
	.depart {
		background: var(--paper-2);
		border: 1.5px solid var(--line);
		border-radius: 10px;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
	}
	.depart p {
		margin: 0;
	}
	.depart button {
		margin-top: 6px;
		align-self: flex-start;
		padding: 9px 20px;
		font-size: 1rem;
	}
	.rivalnote {
		color: var(--indigo);
	}
	.ending {
		max-width: 540px;
		margin: 10px auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.ending h2 {
		font-family: var(--display);
		font-size: 2.2rem;
		margin: 6px 0 0;
		color: var(--vermilion);
	}
	.ending.won h2 {
		color: var(--gold-text);
	}
	.ending p {
		font-size: 1.1rem;
		line-height: 1.55;
	}
	.gen {
		font-family: var(--body);
		font-size: 0.7rem;
		font-style: normal;
		color: var(--vermilion);
		border: 1px solid currentColor;
		border-radius: 999px;
		padding: 0 6px;
		vertical-align: 2px;
	}
	.dynasty {
		width: 100%;
		background: var(--card);
		border: 1px solid var(--gold);
		border-radius: 12px;
		padding: 10px 14px;
		margin-bottom: 10px;
	}
	.dynasty h3 {
		font-family: var(--display);
		margin: 0;
	}
	.heirs {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 6px;
	}
	.heir {
		display: flex;
		align-items: center;
		gap: 10px;
		font: inherit;
		text-align: left;
		color: var(--ink);
		background: var(--paper-2);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 6px 10px;
		cursor: pointer;
	}
	.heir:hover {
		border-color: var(--vermilion);
	}
	.heir span {
		display: flex;
		flex-direction: column;
	}
	.unlock {
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: color-mix(in srgb, var(--gold) 14%, transparent);
		border: 1px solid var(--gold);
		border-radius: 10px;
		padding: 8px 14px;
		margin-bottom: 8px;
	}
	dl {
		display: flex;
		gap: 22px;
		margin: 4px 0 14px;
	}
	dl div {
		display: flex;
		flex-direction: column-reverse;
	}
	dt {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	dd {
		margin: 0;
		font-family: var(--display);
		font-size: 1.6rem;
		font-weight: 700;
	}
	.scrim {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 20;
	}
	.modal {
		position: fixed;
		z-index: 21;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(460px, calc(100vw - 32px));
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 18px 20px;
		box-shadow: 0 20px 50px var(--shadow);
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-height: calc(100dvh - 32px);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.modal > :global(*) {
		flex-shrink: 0;
	}
	.undo {
		align-self: center;
		font: inherit;
		font-size: 0.82rem;
		padding: 4px 14px;
		border-radius: 999px;
		border: 1px dashed var(--line);
		background: transparent;
		color: var(--muted);
		cursor: pointer;
	}
	.planner .legs {
		margin: 6px 0;
		padding-left: 18px;
		font-size: 0.86rem;
	}
	.planner .legs li {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
	.planner .legs small {
		color: var(--muted);
	}
	.course {
		color: var(--jade);
		margin: 4px 0;
	}
	.course .link {
		background: none;
		border: 0;
		color: var(--muted);
		text-decoration: underline;
		cursor: pointer;
		font: inherit;
	}
	.onc {
		font-style: normal;
	}
	.newstoast {
		position: absolute;
		left: 50%;
		bottom: 18px;
		transform: translateX(-50%);
		z-index: 5;
		max-width: min(560px, 90%);
		padding: 8px 14px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(8, 12, 19, 0.95);
		color: #f8fafc;
		font: inherit;
		font-size: 0.86rem;
		text-align: left;
		cursor: pointer;
		animation: toastin 0.35s ease-out;
	}
	@keyframes toastin {
		from {
			opacity: 0;
			transform: translate(-50%, 10px);
		}
	}
	.titleline {
		color: var(--gold-text);
		font-style: italic;
	}
	main.game.photo {
		grid-template-columns: 1fr 0;
	}
	main.game.photo .panel {
		display: none;
	}
	@media (max-width: 899px) {
		main.game.photo .stage {
			height: 100dvh;
		}
	}
	.photobtn {
		position: absolute;
		top: 12px;
		right: 64px;
		z-index: 6;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(8, 12, 19, 0.92);
		color: #fff;
		cursor: pointer;
	}
	.caption {
		position: absolute;
		left: 24px;
		bottom: 24px;
		z-index: 5;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 16px;
		border-radius: 12px;
		background: rgba(8, 12, 19, 0.94);
		color: #f8fafc;
		font-family: var(--display);
	}
	.caption b {
		font-size: 1.4rem;
	}
	.caption i {
		color: #fde68a;
	}
	.filebtn {
		cursor: pointer;
		padding: 7px 14px;
		border-radius: var(--radius-md, 8px);
		border: 1.5px solid var(--ink);
		font-size: 0.9rem;
	}
	.modal h3 {
		font-family: var(--display);
		font-size: 1.5rem;
		margin: 0;
	}
	.modal hr {
		border: 0;
		border-top: 1px solid var(--line);
		width: 100%;
	}
	.modal input[type='password'] {
		font: inherit;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--paper-2);
		color: var(--ink);
	}
	.toggle {
		display: flex;
		gap: 8px;
		align-items: center;
		cursor: pointer;
	}
	.toggle input {
		accent-color: var(--vermilion);
		width: 18px;
		height: 18px;
	}
	.row.end {
		justify-content: flex-end;
	}
	@media (max-width: 480px) {
		dl {
			gap: 14px;
		}
	}
	.dress-helper-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		margin: 4px 0 8px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--gold) 15%, var(--paper));
		border: 1px solid var(--gold);
		font-size: 0.8rem;
	}
	.dress-g {
		font-size: 1.2rem;
		flex-shrink: 0;
	}
	.dress-info {
		flex: 1;
		min-width: 0;
		color: var(--ink);
	}
	.dress-info small {
		color: var(--muted);
		display: block;
	}
	.dress-btns {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}
	.dress-btn {
		font: inherit;
		font-size: 0.74rem;
		padding: 3px 8px;
		border-radius: 999px;
		cursor: pointer;
	}
	.dress-btn.primary {
		background: var(--vermilion);
		color: #fff;
		border: 1px solid var(--vermilion);
		font-weight: 600;
	}
	.dress-btn.ghost {
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--line);
	}
</style>
