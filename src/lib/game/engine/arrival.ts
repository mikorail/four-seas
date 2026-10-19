import { Rng } from '#lib/rng';
import { CITIES, CITY, cityExists, cityName, routesFrom, shortestDays, shortestPath, type Route } from '#lib/data/world';
import { STATS, type Fx, type Tag } from '#lib/data/traits';
import { ITEMS, MOUNTS, goodOf, isGood } from '#lib/data/items';
import { DIFFICULTY } from '#lib/data/difficulty';
import { buildDeck, buildDetourDeck } from '#lib/game/cards/index';
import { syncGrid } from '../bag';
import { rollAssignment } from '../assignments';
import { hearLanguage } from '../langs';
import { turmoilAt, turmoilRoad, turmoilWarning } from '../turmoil';
import { fairIn } from '#lib/data/fairs';
import { capOf, hasPerk, travelMult } from '../mods';
import { checkTitles, collect, lettersDue } from '../life';
import { monthOf, seasonFor, sellPrice } from '../economy';
import { resolveVentures } from '../ventures';
import { DISASTERS, disasterAt, disasterCloses, edgeClosed, plagueAt, tickWorld, typhoonAt } from '../events';
import { energyMax } from '../market';
import type { Run } from '../types';
import { checkEnd, clearEnding, victory } from './endings';
import { keepRestorePoint } from './undo';
import { addItem, applyFx, checkGoal, checkThoughts, clamp, ensureRivalPerson, hurtMount, knownSecrets, log, removeItem, shiftMind, thinkFor, tickInventions, track } from './utils';

export interface RouteInfo extends Route {
	season: ReturnType<typeof seasonFor>;
	baseDays: number;
	warnings: string[];
	air?: boolean; // by hot-air balloon
}

export function availableRoutes(run: Run): RouteInfo[] {
	const tip = run.flags.tip ? 0.8 : 1;
	const month = monthOf(run);
	const all = routesFrom(run.location, run.year, knownSecrets(run));
	const open = all.filter((r) => !edgeClosed(run, { a: r.from, b: r.to, mode: r.mode }) && !disasterCloses(run, r.from, r.to, r.mode) && !turmoilRoad(run, r.from, r.to, r.mode)?.closed);
	// never strand the player: if war closes every road, the war zone itself is the way out
	const ground = (open.length ? open : all).map((r) => {
		const season = seasonFor(r, month);
		const warnings: string[] = [];
		const storm = r.mode === 'sea' ? (typhoonAt(run, r.from) ?? typhoonAt(run, r.to)) : undefined;
		if (storm) warnings.push(`🌀 ${storm.label}`);
		const sick = plagueAt(run, r.to);
		if (sick) warnings.push(`☣ ${sick.label}`);
		const war = edgeClosed(run, { a: r.from, b: r.to, mode: r.mode });
		if (war) warnings.push(`⚔ through the war zone`);
		const dis = disasterAt(run, r.to) ?? disasterAt(run, r.from);
		const cut = disasterCloses(run, r.from, r.to, r.mode);
		if (cut) warnings.push(`${DISASTERS[cut.data!.disaster!].glyph} road cut by ${cut.label.replace(/^The /, 'the ')} — only the desperate go this way`);
		else if (dis) warnings.push(`${DISASTERS[dis.kind].glyph} ${dis.e.label}`);
		const tr = turmoilRoad(run, r.from, r.to, r.mode);
		if (tr) warnings.push(turmoilWarning(tr));
		const fairThere = fairIn(r.to, month, run.year);
		if (fairThere) warnings.push(`🎪 ${fairThere.name}`);
		const slow = (dis ? (dis.severe ? DISASTERS[dis.kind].slow : 1 + (DISASTERS[dis.kind].slow - 1) / 2) : 1) * (tr ? (tr.closed ? tr.slow * 1.3 : tr.slow) : 1);
		const days = Math.max(1, Math.round(r.days * travelMult(run, r.mode) * tip * season.days * (storm ? 1.4 : 1) * slow));
		const freight = run.mount ? (r.mode === 'sea' ? 3 : MOUNTS[run.mount.kind].feed) : 0;
		return { ...r, baseDays: r.days, days, cost: r.cost + freight, season, warnings };
	});
	// a hot-air balloon flies over borders, seas and wars — if the winds allow
	if (!run.flags.balloon) return ground;
	const air: RouteInfo[] = all
		.filter((r) => r.km <= 3000)
		.map((r) => {
			const season = seasonFor(r, month);
			const days = Math.max(1, Math.round((r.km / 380) * (season.id === 'fair' ? 1 : 1.6)));
			return { ...r, vessel: 'hot-air balloon', baseDays: days, days, cost: 2, season, warnings: season.id === 'fair' ? [] : ['💨 rough winds aloft'], air: true };
		});
	return [...ground, ...air];
}

export function wages(run: Run) {
	const m = DIFFICULTY[run.difficulty]?.wages ?? 1;
	return Math.round(run.crew.reduce((s, c) => s + c.wage, 0) * m);
}

export function depart(run: Run, route: RouteInfo | Route) {
	const rng = new Rng(run.rng);
	if (run.flags.scouted_route) {
		delete run.flags.scouted_route;
		route.days = Math.max(1, route.days - 1);
		log(run, 'Advance route scouting saved 1 day of travel.');
	}
	run.route = route;
	run.day += route.days;
	tickInventions(run, route.days);
	delete run.flags.tip;

	// wages
	const w = wages(run);
	if (w > 0) {
		if (run.stats.silver - route.cost - w > 4) {
			applyFx(run, { silver: -w }, ['trade']);
			for (const c of run.crew) c.loyalty = clamp(c.loyalty + 2, 0, 100);
		} else {
			for (const c of run.crew) if (c.wage > 0) c.loyalty = clamp(c.loyalty - 22, 0, 100);
			log(run, 'Could not pay the retinue. Grumbling in the ranks.');
		}
	}

	const fatigue: Fx = { silver: -route.cost, vigor: -Math.min(10, Math.round(route.days / 5)) };
	applyFx(run, fatigue, [route.mode as Tag]);
	if (run.crew.some((c) => c.role === 'cook')) applyFx(run, { vigor: 3 }, ['food']);

	// the rival lives in the same world: disasters and turmoil on their road slow them too
	if (run.rival && !run.rival.arrived) {
		const ahead = run.rival.path.filter((id) => id !== run.rival!.path[0]);
		for (const id of ahead) {
			const d = disasterAt(run, id);
			const key = d ? `rivaldis:${d.e.id}` : `rivaltur:${id}:${Math.floor(run.day / 60)}`;
			const t = d ? null : turmoilAt(run, id);
			if ((d || t) && !run.flags[key]) {
				run.flags[key] = true;
				const delay = d ? (d.severe ? 8 : 4) : 5;
				run.rival.arrive += delay;
				log(run, `News: ${run.rival.npc.name} is held up by ${d ? d.e.label.replace(/^The /, 'the ') : t!.label.toLowerCase()} near ${cityName(CITY[id], run.year)} (+${delay} days).`);
			}
		}
	}

	// the Meticulous traveller and their luggage
	if (run.hero.traits.includes('meticulous')) {
		syncGrid(run);
		applyFx(run, run.flags.tidy ? { vigor: 3, fortune: 2 } : { vigor: -3, fortune: -2 }, []);
		if (!run.flags.tidy) log(run, 'The bag is a mess. It is all I can think about.');
	}

	// absence makes the heart grow… less patient (unless you travel together)
	const rom = run.romance;
	if (rom && rom.status !== 'parted' && !run.crew.some((c) => c.role === 'companion' && c.npc.name === rom.npc.name))
		rom.affection = clamp(rom.affection - Math.min(6, Math.ceil(route.days / 8)) * (rom.status === 'married' ? 0.5 : 1), 0, 100);

	// heat cools with distance and borders
	const cool = (hasPerk(run, 'outlaw') ? 1.5 : 1) * (run.crew.some((c) => c.role === 'thief') ? 1.4 : 1);
	run.heat = Math.max(0, run.heat - route.days * 0.8 * cool);
	if (CITY[route.from].culture !== CITY[route.to].culture) run.heat = Math.round(run.heat * 0.6);

	// mount wear
	if (run.mount && route.mode === 'land') hurtMount(run, Math.round(route.days / 3));

	run.path.push({ from: route.from, to: route.to, mode: route.mode });
	for (const n of tickWorld(run, rng)) log(run, n.replace(/\*\*/g, ''));
	log(run, `Set out by ${route.vessel} for ${cityName(CITY[route.to], run.year)} (${route.days} days).`);
	run.log[0].fx = { silver: -route.cost, vigor: -Math.min(10, Math.round(route.days / 5)) };
	run.log[0].who = `The road to ${cityName(CITY[route.to], run.year)}`;
	run.log[0].choice = `${route.days} days by ${route.vessel}`;
	track(run);
	run.phase = 'travel';
	const n = Math.min(4, 1 + Math.ceil(route.days / 9));
	const air = (route as RouteInfo).air;
	run.deck = buildDeck(run, rng, 'travel', air ? Math.min(2, n) : n, air ? null : route.mode, CITY[route.from]);
	run.deckTotal = run.deck.length;
	run.rng = rng.state;
	checkEnd(run);
}

export function advance(run: Run, notes: string[] = []) {
	const rng = new Rng(run.rng);
	if (run.phase === 'travel' && run.route) {
		if (run.flags.detour) {
			const kind = String(run.flags.detour);
			delete run.flags.detour;
			run.flags.inDetour = kind;
			const DETOUR_NAMES: Record<string, string> = {
				cove: 'Fisherman’s Cove',
				hamlet: 'Nameless Mountain Hamlet',
				oasis: 'Unmarked Desert Oasis',
				'reed-village': 'Stilt Village in the Reeds'
			};
			const placeName = DETOUR_NAMES[kind] ?? 'an Unmarked Village';
			log(run, `Off the charted road: took shelter in ${placeName}.`);
			notes.push(`🏕 Stumbled into ${placeName} — far beyond imperial maps.`);
			run.deck = buildDetourDeck(run, rng, kind);
			run.deckTotal = run.deck.length;
			run.rng = rng.state;
			return;
		}
		if (run.flags.inDetour) {
			delete run.flags.inDetour;
			log(run, 'Left the quiet haven behind and rejoined the highway.');
		}
		const to = run.route.to;
		run.location = to;
		const isNew = !run.visited.includes(to);
		if (isNew) run.visited.push(to);
		if (isNew && hasPerk(run, 'explorer')) applyFx(run, { renown: 3 }, []);
		if (isNew && (run.completedInventions?.includes('movable-type') || run.bag.includes('movable-type'))) {
			applyFx(run, { renown: 15 }, ['art']);
			notes.push(`Printed gazettes of your deeds precede you into ${cityName(CITY[to], run.year)} (+15 Renown)!`);
		}
		log(run, `Arrived in ${cityName(CITY[to], run.year)}.`);
		thinkFor(run, run.route.days, notes);
		checkThoughts(run, notes);
		const heard = hearLanguage(run, CITY[to].culture, Math.ceil(run.route.days / 2));
		if (heard) notes.push(heard);
		if (CITY[to].port) collect(run, 'harbours', to, notes);
		// a trader remembers what things sold for
		run.priceMemory ??= {};
		for (const g of new Set([...run.bag.filter(isGood).map(goodOf), CITY[to].exports])) run.priceMemory[`${to}:${g}`] = { day: run.day, price: sellPrice(run, g, to) };
		// home: the garden grew while you were away
		if (run.home?.city === to) {
			const away = run.day - Number(run.flags.homeLast ?? run.home.since);
			const crop = Math.min(12, Math.floor(away / 10));
			if (crop > 0) {
				run.stats.silver = Math.min(capOf(run, 'silver') - 1, run.stats.silver + crop);
				notes.push(`🏡 Home again. The garden earned you ${crop} silver while you were away.`);
			} else notes.push('🏡 Home again.');
			run.flags.homeLast = run.day;
			shiftMind(run, 8);
		}
		for (const l of lettersDue(run)) notes.push(`✉️ A letter from **${l.to}** is waiting for you.`);
		checkTitles(run, notes);
		checkGoal(run, notes);
		run.route = null;
		run.flags.stay = run.day;
		run.energy = energyMax(run);
		keepRestorePoint(run);
		checkRival(run, notes);
		ensureRivalPerson(run, rivalPosition(run) ?? undefined);
		resolveQuests(run, notes);
		for (const n of resolveVentures(run, rng)) {
			notes.push(n);
			log(run, n.replace(/\*\*/g, ''));
		}
		if (!run.flags.campaign && !run.delivered && to === run.destination && run.day <= run.deadline) {
			run.delivered = true;
			run.ending = victory(run);
			run.phase = 'end';
			run.rng = rng.state;
			return;
		}
		if (!checkEnd(run)) {
			run.phase = 'city';
			run.deck = buildDeck(run, rng, 'city', rng.chance(0.45) ? 3 : 2, null, null);
			run.deckTotal = run.deck.length;
		}
	} else if (run.flags.campaign && !run.flags.cstart) {
		// a campaign opens with a few cards in its starting city before the map
		run.flags.cstart = true;
		run.deck = buildDeck(run, rng, 'city', 2, null, null);
		run.deckTotal = run.deck.length;
		if (!run.deck.length) run.phase = 'map';
	} else {
		run.phase = 'map';
	}
	run.rng = rng.state;
}

export function resolveQuests(run: Run, notes: string[]) {
	for (const q of [...run.quests]) {
		const lost = (q.item && !run.bag.includes(q.item)) || (q.ward && !run.crew.some((c) => c.id === q.ward));
		const finish = () => {
			run.quests.splice(run.quests.indexOf(q), 1);
			if (q.item) removeItem(run, q.item);
			if (q.ward) run.crew = run.crew.filter((c) => c.id !== q.ward);
		};
		if (run.day > q.due || lost) {
			finish();
			applyFx(run, { renown: -6 }, []);
			const msg = `◆ Failed: ${q.title}${lost ? ' (lost on the road)' : ' (too late)'}.`;
			log(run, msg);
			notes.push(msg);
			continue;
		}
		if (q.visit) {
			q.visit = q.visit.filter((id) => id !== run.location);
			if (q.visit.length) continue;
		} else if (q.to !== run.location) continue;
		if (q.needs && !run.bag.includes(q.needs)) {
			notes.push(`◆ ${q.title}: you still need ${ITEMS[q.needs]?.name.toLowerCase() ?? q.needs}.`);
			continue;
		}
		finish();
		if (q.needs) removeItem(run, q.needs);
		const got = applyFx(run, q.reward, ['trade']);
		if (q.rewardItem) addItem(run, q.rewardItem);
		const parts = STATS.filter((s) => got[s]).map((s) => `${got[s]! > 0 ? '+' : ''}${got[s]} ${s}`);
		const msg = `◆ Completed: ${q.title}. ${q.text}${parts.length ? ` (${parts.join(', ')})` : ''}`;
		log(run, msg);
		notes.push(msg);
	}
}

export function checkRival(run: Run, notes: string[]) {
	const r = run.rival;
	if (!r || r.arrived || run.delivered) return;
	if (run.day >= r.arrive) {
		r.arrived = true;
		const msg = `News: ${r.npc.name} has reached ${cityName(CITY[run.destination], run.year)} first. Your victory can only be second-best now.`;
		log(run, msg);
		notes.push(msg);
	}
}

/** Where the rival is right now, for the map. */
export function rivalPosition(run: Run): string | null {
	const r = run.rival;
	if (!r) return null;
	if (r.arrived || run.day >= r.arrive) return run.destination;
	const i = Math.min(r.path.length - 1, Math.floor((run.day / r.arrive) * (r.path.length - 1)));
	return r.path[i];
}

export function skipCity(run: Run) {
	if (run.phase === 'city' && run.deck.length && run.deck[0].id !== 'intro') {
		run.deck = [];
		run.phase = 'map';
	}
}

export function continueEndless(run: Run) {
	clearEnding(run);
	run.phase = 'map';
	run.deadline = Infinity;
	log(run, 'Commission fulfilled. The world is still wide.');
}

/** Branching storyline: when the commission is done, take the next grand assignment (side quests carry on). */
export function nextAssignment(run: Run): string {
	const rng = new Rng(run.seed + ':assign:' + run.day + ':' + run.visited.length);
	const cur = run.location;
	const dist = shortestDays(cur, run.year);
	const ok = (id: string) => id !== cur && !!CITY[id] && cityExists(CITY[id], run.year) && Number.isFinite(dist[id]);
	let cands = Object.entries(dist).filter(([id, d]) => ok(id) && d >= 35 && d <= 150);
	if (!cands.length) cands = Object.entries(dist).filter(([id]) => ok(id)).sort((a, b) => b[1] - a[1]).slice(0, 8);
	if (!cands.length) {
		const anyCity = CITIES.find((c) => c.id !== cur && cityExists(c, run.year) && routesFrom(c.id, run.year).length > 0);
		cands = [[anyCity ? anyCity.id : 'beijing', 45]];
	}
	const picked = rng.pick(cands) ?? ['beijing', 45];
	const [newDest, best] = picked;
	const days = Math.round(best * 1.65 + 20);
	const job = rollAssignment(rng, run.year, cur, newDest, days);

	clearEnding(run);
	run.statuses ??= [];
	if (!run.statuses.includes('master-courier')) run.statuses.push('master-courier');
	run.destination = newDest;
	run.item = job.item;
	run.patron = job.patron;
	run.deadline = run.day + days;
	run.delivered = false;
	run.flags.assignments = Number(run.flags.assignments ?? 0) + 1;

	// a fresh rival for a fresh errand
	if (run.rival) {
		const path = shortestPath(cur, newDest, run.year);
		run.rival = { ...run.rival, path, start: run.day, arrived: false, arrive: run.day + Math.round(best * (1.2 + rng.next() * 0.3) + 6) };
		ensureRivalPerson(run, cur);
	}

	// reward for the last job
	run.stats.silver = clamp(run.stats.silver + 20, 0, capOf(run, 'silver') - 10);
	run.stats.renown = clamp(run.stats.renown + 10, 0, capOf(run, 'renown') - 10);

	// the briefing is a card, so the player is never left in an empty city
	run.phase = 'city';
	run.deck = [
		{
			id: 'assignment',
			npc: job.patronNpc,
			text: job.briefing,
			left: { label: 'Accept, and leave at once', fx: { renown: 2 }, tags: ['loyal'], text: 'You take it, bow, and are on the road before the tea goes cold.' },
			right: { label: 'Accept — for an advance', fx: { silver: 8 }, tags: ['trade'], text: '"Half now, half on delivery." They count it out without blinking.' }
		}
	];
	run.deckTotal = 1;
	const msg = `New commission: ${job.item} to ${cityName(CITY[newDest], run.year)} within ${days} days, for ${job.patron}.`;
	log(run, msg);
	return msg;
}
