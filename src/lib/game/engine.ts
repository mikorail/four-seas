import { Rng, hashString } from '#lib/rng';
import { CULTURES, CULTURE_IDS, makeName, type CultureId, type Gender } from '#lib/data/cultures';
import { CITIES, CITY, SECRETS, cityExists, cityName, routesFrom, shortestDays, shortestPath, type Route } from '#lib/data/world';
import { FACTIONS, PERK, PROFESSIONS, STATS, STATUSES, TRAITS, type Fx, type Stat, type Tag } from '#lib/data/traits';
import { BAGS, ITEMS, MOUNTS, MOUNT_NAMES, goodOf, isGood } from '#lib/data/items';
import { OUTFITS } from '#lib/data/market';
import { DIFFICULTY, HARDSHIP, scoreMult } from '#lib/data/difficulty';
import { CULTURE_FAITH, FAITHS, IDEALS, IDEAL_IDS, faithOfCity, kindred, type FaithId } from '#lib/data/faiths';
import { buildDeck, buildDetourDeck, capacity, venueCard } from '#lib/game/cards/index';
import { canFit, syncGrid } from './bag';
import { rollAssignment } from './assignments';
import { hangoutCard, personStep, type Profile } from './people';
import { talesFrom } from './tales';
import { hearLanguage, langLevel } from './langs';
import { turmoilAt, turmoilRoad, turmoilWarning } from './turmoil';
import { fairIn } from '#lib/data/fairs';
import { baseVoices } from '#lib/data/voices';
import { CABINET, CABINET_SLOTS, THOUGHT } from '#lib/data/cabinet';
import { capOf, effectiveVoices, modFx, perksOf, rapportOf, skillLevel, travelMult, hasPerk } from './mods';
import { SKILLS, levelOf, startingSkills } from '#lib/data/skills';
import { GOAL, GOALS } from '#lib/data/goals';
import { buyHome, checkTitles, collect, lettersDue } from './life';
import { monthOf, seasonFor, sellPrice } from './economy';
import { sceneLine } from './prose';
import { newVenture, resolveVentures, VENTURES } from './ventures';
import { DISASTERS, disasterAt, disasterCloses, edgeClosed, plagueAt, seedWorld, tickWorld, typhoonAt } from './events';
import { CAMPAIGN } from '#lib/content/index';
import { INVENTIONS } from '#lib/data/inventions';
import { energyMax, markVenue, passesAsLocal, venueUsed, venuesHere, wear } from './market';
import type { VenueId } from '#lib/data/venues';
import { isCrisis, buildCrisisCard } from './cards/crisis';
import { notableOfCity, type Notable } from '#lib/data/notables';
import { buildHangoutCard } from './cards/hangout';
import { buildBuildingCard } from './cards/districts';
import type { DistrictKind } from '#lib/data/districts';
import { assignCompanionTask as executeCompanionTask } from './companions';
import { donRecommendedGarb as applyRecommendedGarb, getDressRecommendation } from './dress';
import type { ActiveInvention, Ancestor, Card, Choice, FactionId, LogEntry, Ending, EndingKind, Hero, MountKind, Npc, Outcome, RomanceStep, Run, Tie, Venture, CompanionTask } from './types';

const ITEMS_CARRIED = ['a sealed letter', 'a jade imperial seal', 'a celadon vase', 'a secret star chart', 'a tribute pearl', 'a relic in a sandalwood box', 'a peace treaty', 'a sacred sutra scroll', 'a royal marriage proposal'];

const MOTTOS = [
	'Fortune favors the swift.',
	'A journey of a thousand li begins beneath one’s feet.',
	'Fall seven times, stand up eight.',
	'Never trust a calm sea.',
	'Every port has a story; I collect them.',
	'Swipe right on adventure.',
	'Silver comes and goes; tales last forever.',
	'The tea is always better further away.'
];

export function randomHero(rng: Rng, year: number, lock: Partial<Hero> = {}, allowed: (id: string) => boolean = () => true): Hero {
	const culture: CultureId = lock.culture ?? rng.pick(CULTURE_IDS);
	const gender: Gender = lock.gender ?? (rng.chance(0.5) ? 'f' : 'm');
	const homes = CITIES.filter((c) => c.culture === culture && cityExists(c, year) && routesFrom(c.id, year).length > 0);
	return {
		name: lock.name ?? makeName(rng, CULTURES[culture], gender),
		gender,
		culture,
		profession: lock.profession ?? rng.pick(PROFESSIONS.filter((p) => allowed(p.id))).id,
		traits: lock.traits ?? rng.sample(TRAITS.filter((t) => !t.flaw && allowed(t.id)), 3).map((t) => t.id),
		age: lock.age ?? rng.int(18, 52),
		seed: lock.seed ?? rng.int(1, 1e9),
		home: lock.home && homes.some((h) => h.id === lock.home) ? lock.home : (homes.length ? rng.pick(homes) : rng.pick(CITIES.filter((c) => cityExists(c, year)))).id,
		motto: lock.motto ?? rng.pick(MOTTOS),
		faith: lock.faith ?? (rng.chance(0.8) ? CULTURE_FAITH[culture] : rng.pick(['buddhist', 'daoist', 'folk', 'skeptic', 'christian'])),
		ideal: lock.ideal ?? rng.pick(IDEAL_IDS),
		goal: lock.goal ?? rng.pick(GOALS).id
	};
}

export function homesFor(culture: CultureId, year: number) {
	return CITIES.filter((c) => c.culture === culture && cityExists(c, year) && routesFrom(c.id, year).length > 0);
}

export function dailySeed(date = new Date()) {
	return 'daily-' + date.toISOString().slice(0, 10);
}

/** Daily journey: hero and year fixed by the date, so everyone plays the same world. */
export function dailySetup(date = new Date()) {
	const seed = dailySeed(date);
	const rng = new Rng(seed);
	const year = rng.int(1500, 1900);
	return { seed, year, hero: randomHero(rng, year, {}, (id) => !TRAITS.concat(PROFESSIONS).find((p) => p.id === id)?.unlock) };
}

export interface Legacy {
	lineage: Ancestor[];
	relics: string[];
	treasury: number;
	ventures: Venture[];
	standing: Record<string, number>;
	karma: number;
	ties: Tie[];
	destination?: string; // unfinished commission
	item?: string;
}

export function newRun(hero: Hero, seed: string, year: number, opts: { daily?: boolean; difficulty?: string; hardship?: string; legacy?: Legacy; campaign?: string } = {}): Run {
	const diff = DIFFICULTY[opts.difficulty ?? 'courier'] ?? DIFFICULTY.courier;
	const hard = HARDSHIP[opts.hardship ?? 'none'] ?? HARDSHIP.none;
	// a campaign always happens in its own era, whatever year was picked
	const campEra = opts.campaign ? CAMPAIGN[opts.campaign]?.years : undefined;
	if (campEra) year = Math.min(campEra[1], Math.max(campEra[0], year));
	const rng = new Rng(seed + ':' + year);
	const stats = { silver: 50, vigor: 50, renown: 50, fortune: 50 };
	const bag: string[] = [...diff.kit];
	const run0 = { hero, bag, crew: [] };
	for (const p of perksOf(run0)) for (const s of STATS) stats[s] += (p as { start?: Fx }).start?.[s] ?? 0;
	for (const s of STATS) stats[s] = clamp(stats[s], 15, 85);
	for (const s of STATS) {
		if (hard.set?.[s] !== undefined) stats[s] = hard.set[s]!;
		stats[s] = clamp(stats[s] + (hard.shift?.[s] ?? 0), 5, 95);
	}
	if (hard.emptyBag) bag.length = 0;
	else {
		if (hasPerk(run0, 'survivor') || hasPerk(run0, 'physician')) bag.push('medicine');
		if (hasPerk(run0, 'smuggler')) bag.push('papers');
		if (hasPerk(run0, 'ronin')) bag.push('sword');
		if (hasPerk(run0, 'pilgrim')) bag.push('charm');
	}
	const uniqBag = [...new Set(bag)];
	bag.length = 0;
	bag.push(...uniqBag);

	// a home that does not exist yet (or has no roads) in this year: move to one that does
	const livable = (id: string) => !!CITY[id] && cityExists(CITY[id], year) && routesFrom(id, year).length > 0;
	if (!livable(hero.home)) {
		const same = homesFor(hero.culture, year);
		hero = { ...hero, home: (same[0] ?? CITIES.find((c) => livable(c.id))!).id };
	}
	const dist = shortestDays(hero.home, year);
	const home = CITY[hero.home];
	let cands = Object.entries(dist).filter(([id, d]) => d >= 45 && d <= 140 && CITY[id].culture !== home.culture);
	if (!cands.length) cands = Object.entries(dist).filter(([id]) => id !== hero.home).sort((a, b) => b[1] - a[1]).slice(0, 6);
	const [dest, best] = rng.pick(cands);
	const deadline = Math.round((best * 1.65 + 16) * diff.deadline);

	const rivalCulture = rng.pick(CULTURE_IDS.filter((c) => c !== hero.culture));
	const rg: Gender = rng.chance(0.5) ? 'f' : 'm';
	const rival = {
		npc: { name: makeName(rng, CULTURES[rivalCulture], rg), title: `Courier of ${CULTURES[rivalCulture].ruler(year).replace(/^the /, '')}`, culture: rivalCulture, gender: rg, role: 'hero' as const, seed: rng.int(1, 1e9) },
		arrive: Math.round((best * (1.15 + rng.next() * 0.3) + 6) * diff.rival),
		path: shortestPath(hero.home, dest, year),
		start: 0,
		arrived: false
	};

	const startMount: MountKind | null = hard.emptyBag ? null : hero.culture === 'steppe' ? 'horse' : hero.culture === 'tibetan' ? 'yak' : null;
	if (!hero.voices) hero = { ...hero, voices: baseVoices(hero.profession, hero.traits) };
	const run: Run = {
		version: 2,
		seed,
		rng: rng.state,
		year,
		month0: rng.int(0, 11),
		daily: !!opts.daily,
		difficulty: diff.id,
		hardship: hard.id,
		scoreMult: scoreMult(diff.id, hard.id, [hero.profession, ...hero.traits]),
		quests: [],
		pilgrimages: [],
		karma: 0,
		ties: [],
		standing: { [hero.culture]: 20 },
		factions: { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 },
		statuses: [],
		ventures: [],
		treasury: 0,
		lineage: [],
		generation: 1,
		world: [],
		hero,
		stats,
		day: 0,
		deadline,
		location: hero.home,
		destination: dest,
		item: rng.pick(ITEMS_CARRIED),
		patron: CULTURES[hero.culture].ruler(year),
		phase: 'city',
		route: null,
		deck: [],
		deckTotal: 1,
		bag,
		bagKind: hero.profession === 'envoy' ? 'chest' : hero.profession === 'merchant' ? 'satchel' : 'bundle',
		mount: startMount ? { kind: startMount, name: rng.pick(MOUNT_NAMES), health: 100 } : null,
		crew: [],
		heat: Math.max(hasPerk(run0, 'wanted') ? 30 : 0, hard.heat ?? 0),
		rival,
		flags: {},
		visited: [hero.home],
		path: [],
		log: [],
		recent: [],
		legends: [],
		cardsSeen: 0,
		ending: null,
		delivered: false,
		mind: MIND_START[hard.id] ?? 70,
		skills: startingSkills(hero.profession, hero.traits),
		goal: { id: hero.goal && GOAL[hero.goal] ? hero.goal : GOALS[rng.int(0, GOALS.length - 1)].id },
		cabinet: { found: [], slots: [], done: [] },
		inventions: [],
		completedInventions: [],
		apathy: 0
	};
	seedWorld(run);
	if (opts.legacy) applyLegacy(run, opts.legacy);
	run.extraBags = [];
	dropOverflow(run, []);
	const camp = opts.campaign ? CAMPAIGN[opts.campaign] : undefined;
	if (camp && CITY[camp.start] && CITY[camp.destination]) {
		run.flags.campaign = camp.id;
		if (camp.energy) run.flags.energyMax = camp.energy === 'unlimited' ? 'unlimited' : Number(camp.energy);
		run.location = camp.start;
		run.visited = [camp.start];
		run.destination = camp.destination;
		run.item = camp.item;
		run.patron = camp.patron;
		const diffMult = DIFFICULTY[run.difficulty]?.deadline ?? 1;
		run.deadline = Math.round(camp.deadline * diffMult);
		run.standing[CITY[camp.start].culture] = Math.max(run.standing[CITY[camp.start].culture] ?? 0, 10);
		if (run.rival) run.rival = { ...run.rival, path: shortestPath(camp.start, camp.destination, run.year), arrive: Math.round(camp.deadline * 0.9) };
	}
	run.deck = [introCard(run)];
	log(run, `Departed ${cityName(home, year)} in the year ${year}, carrying ${run.item}.`);
	return run;
}

function introCard(run: Run): Card {
	const cul = CULTURES[run.hero.culture];
	const rng = new Rng(run.rng ^ 0x5f3759df);
	const g: Gender = rng.chance(0.5) ? 'f' : 'm';
	const destName = cityName(CITY[run.destination], run.year);
	return {
		id: 'intro',
		npc: { name: makeName(rng, cul, g), title: `Steward of ${run.patron.replace(/^the /, '')}`, culture: cul.id, gender: g, role: 'official', seed: rng.int(1, 1e9) },
		text: `"${run.hero.name}. ${cap(run.patron)} entrusts you with ${run.item}. It must reach ${destName} within ${run.deadline} days. Be warned: a rival court has sent ${run.rival?.npc.name} on the same errand. Fail, and do not come home."`,
		left: { label: 'Ask for travel money', fx: { silver: 8, renown: -4 }, itemAdd: ['credit'], text: 'A grudging purse — and a letter of credit for emergencies.' },
		right: { label: 'Bow and accept', fx: { renown: 5, fortune: 3 }, text: 'The steward nods. The road awaits.' }
	};
}

// ---------- travel ----------

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
	const ground = (open.length ? open : all)
		.map((r) => {
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

export function tickInventions(run: Run, days: number, notes: string[] = []) {
	if (!run.inventions || run.inventions.length === 0) return;
	const stillActive: ActiveInvention[] = [];
	for (const inv of run.inventions) {
		inv.daysLeft -= days;
		if (inv.daysLeft <= 0) {
			const def = INVENTIONS[inv.id];
			if (!run.completedInventions) run.completedInventions = [];
			run.completedInventions.push(inv.id);
			if (def) {
				addItem(run, def.rewardItem);
				if (def.rewardItem === 'celestial-chronometer') {
					run.deadline += 14;
				}
				const city = CITY[inv.city] ?? CITY['beijing'];
				const msg = `Invention Complete: ${def.name}! The workshop in ${cityName(city, run.year)} has perfected the prototype. The patent and ${def.rewardItem} are delivered to you.`;
				notes.push(msg);
				log(run, msg);
			}
		} else {
			stillActive.push(inv);
		}
	}
	run.inventions = stillActive;
}

export function sponsorInvention(run: Run, id: string, scholarName: string): boolean {
	const inv = INVENTIONS[id];
	if (!inv) return false;
	if (run.stats.silver < inv.cost) return false;
	if (run.inventions?.some((i) => i.id === id) || run.completedInventions?.includes(id)) return false;
	applyFx(run, { silver: -inv.cost, renown: 6 }, ['art', 'trade']);
	if (!run.inventions) run.inventions = [];
	run.inventions.push({
		id,
		scholarName,
		city: run.location,
		daysLeft: inv.daysNeeded
	});
	log(run, `Sponsored ${inv.name} with ${inv.cost} silver under ${scholarName} in ${cityName(CITY[run.location], run.year)}.`);
	return true;
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

// ---------- choices ----------

export interface Resolution {
	text: string;
	fx: Fx;
	days: number;
	won?: boolean;
	notes: string[];
}

/** `forceWin` lets a mini-game decide a gamble instead of the dice. */
export function choose(run: Run, side: 'left' | 'right' | 'up', forceWin?: boolean): Resolution {
	const rng = new Rng(run.rng);
	const card = run.deck.shift()!;
	const ch: Choice = card[side] ?? card.right;
	const capsBefore = CAP_STATS.map((s) => capOf(run, s));
	const tags: Tag[] = [...(ch.tags ?? [])];
	if (run.phase === 'travel' && run.route) tags.push(run.route.mode as Tag);
	if (card.npc.culture !== run.hero.culture && !passesAsLocal(run, card.npc.culture) && langLevel(run, card.npc.culture) < 2) tags.push('foreign');
	const notes: string[] = [];

	let fx: Fx = { ...ch.fx };
	let days = ch.days ?? 0;
	let text = ch.text ?? '';
	let won: boolean | undefined;
	let extra: Outcome | null = null;
	// people warm to (or bristle at) your traits
	const rap = rapportOf(run, card.npc.role);
	// an unravelling mind sometimes simply fails: the good never happens, the bad still does
	const panic = card.id !== 'intro' && card.id !== 'assignment' && (run.mind ?? 70) < 15 && !run.hero.traits.includes('stone-heart') && rng.chance(0.18);
	if (panic) {
		for (const k of STATS) if ((fx[k] ?? 0) > 0) delete fx[k];
		notes.push('🌀 Your hands will not stop shaking. Whatever you meant to do, it goes wrong.');
		forceWin = false;
	}
	if (ch.gamble) {
		const tongue = tags.some((t) => t === 'talk' || t === 'trade' || t === 'romance') ? langLevel(run, card.npc.culture) * 0.03 : 0;
		won = forceWin ?? rng.next() < ch.gamble.p + rap.score * 0.06 + tongue;
		extra = won ? ch.gamble.win : ch.gamble.lose;
		for (const s of STATS) if (extra.fx[s]) fx[s] = (fx[s] ?? 0) + extra.fx[s]!;
		days += extra.days ?? 0;
		text = extra.text ?? text;
	}
	// Luck is not morality: kind or cruel deeds move merit, never fortune.
	const moral = tags.includes('mercy') || tags.includes('cruel') || ch.karma !== undefined;
	if (moral && fx.fortune) delete fx.fortune;
	if (rap.score) for (const k of STATS) if (fx[k]) fx[k] = Math.round(fx[k]! * (fx[k]! > 0 ? 1 + rap.score * 0.12 : 1 - rap.score * 0.1));
	fx = applyFx(run, fx, tags);
	run.day = Math.max(0, run.day + days);
	mindAfter(run, fx, tags, won, notes);

	// conscience: choices that honor or betray your ideal
	const ideal = IDEALS[run.hero.ideal as keyof typeof IDEALS];
	if (ideal && card.id !== 'intro') {
		if (ideal.love.some((t) => tags.includes(t)) && !ideal.hate.some((t) => tags.includes(t))) {
			const d = applyFx(run, { vigor: 2 }, []);
			fx.vigor = (fx.vigor ?? 0) + (d.vigor ?? 0);
			notes.push(`${ideal.glyph} True to your ideal of ${ideal.name} — a clear conscience.`);
		} else if (ideal.hate.some((t) => tags.includes(t))) {
			const d = applyFx(run, { vigor: -2 }, []);
			fx.vigor = (fx.vigor ?? 0) + (d.vigor ?? 0);
			notes.push(`${ideal.glyph} Your ideal of ${ideal.name} is troubled; you sleep badly.`);
		}
	}
	// devotion among your own faith
	if (tags.includes('faith') && run.phase === 'city') {
		const local = faithOfCity(run.location, CITY[run.location].culture) as FaithId;
		if (kindred(run.hero.faith as FaithId, local) && run.hero.faith !== 'skeptic') {
			const d = applyFx(run, { fortune: 4 }, []);
			fx.fortune = (fx.fortune ?? 0) + (d.fortune ?? 0);
			notes.push(`${FAITHS[run.hero.faith as FaithId].glyph} Among fellow believers, your prayers ring truer.`);
		}
	}

	// merit: kindness and cruelty are both remembered
	const dk = (ch.karma ?? 0) + (tags.includes('mercy') ? 5 : 0) + (tags.includes('faith') ? 1 : 0) - (tags.includes('cruel') ? 7 : 0) - (tags.includes('crime') ? 2 : 0) - (tags.includes('bribe') ? 1 : 0);
	if (dk) {
		const before = run.karma;
		run.karma = clamp(run.karma + dk, -100, 100);
		const tier = (k: number) => (k >= 60 ? 3 : k >= 30 ? 2 : k >= 10 ? 1 : k <= -60 ? -3 : k <= -30 ? -2 : k <= -10 ? -1 : 0);
		if (tier(run.karma) !== tier(before)) notes.push(`☯ Merit ${dk > 0 ? 'rises' : 'falls'}: you are now ${karmaLabel(run.karma).toLowerCase()}.`);
	}
	const invisible = ['tiger', 'ghost', 'spirit'].includes(card.npc.role) || card.id === 'intro' || card.id.startsWith('tie-');
	const rememberKind = ch.remember === false ? null : ch.remember?.kind ?? (tags.includes('mercy') ? 'favor' : tags.includes('cruel') ? 'grudge' : null);
	if (rememberKind && !invisible && !run.ties.some((t) => t.npc.name === card.npc.name && !t.resolved)) {
		const deed = (ch.remember && ch.remember.deed) || ch.label.toLowerCase();
		run.ties.push({ id: `tie-${card.npc.seed}`, npc: card.npc, kind: rememberKind, deed, city: run.route?.to ?? run.location, day: run.day });
		if (run.ties.length > 14) run.ties.splice(run.ties.findIndex((t) => t.resolved) >= 0 ? run.ties.findIndex((t) => t.resolved) : 0, 1);
		notes.push(rememberKind === 'favor' ? `🤝 ${card.npc.name} will remember your kindness.` : `⚔ ${card.npc.name} will not forget this.`);
	}
	if (ch.tieResolve) {
		const t = run.ties.find((x) => x.id === ch.tieResolve);
		if (t) t.resolved = true;
	}
	// regional standing: what this culture thinks of you
	const localCulture = CITY[run.route?.to ?? run.location].culture;
	const heatUp = (ch.heat ?? 0) + (extra?.heat ?? 0);
	const ds = Math.round((fx.renown ?? 0) * 0.7 + dk * 0.4 - Math.max(0, heatUp) * 0.5 + (ch.standing ?? 0) + (extra?.standing ?? 0));
	if (ds) {
		const before = run.standing[localCulture] ?? 0;
		const after = clamp(before + ds, -100, 100);
		run.standing[localCulture] = after;
		const band = (v: number) => (v >= 50 ? 2 : v >= 25 ? 1 : v <= -50 ? -2 : v <= -25 ? -1 : 0);
		if (band(after) !== band(before)) notes.push(`🏯 ${CULTURES[localCulture].label} now ${standingLabel(after).toLowerCase()}.`);
	}
	if (ch.venture && run.ventures.length < 4) {
		const v = newVenture(rng, ch.venture, run.location);
		run.ventures.push(v);
		notes.push(`${VENTURES[ch.venture].glyph} You now own the ${VENTURES[ch.venture].name.toLowerCase()} **${v.name}**, based in ${here(run)}.`);
	}
	if (ch.treasury) run.treasury = Math.max(0, run.treasury + ch.treasury);
	if (ch.retire) run.flags.end = ch.retire;

	for (const src of [ch, extra]) {
		if (!src) continue;
		for (const id of src.itemRemove ?? []) removeItem(run, id);
		for (const id of src.itemAdd ?? []) if (!addItem(run, id)) notes.push(`No room for ${ITEMS[id]?.name ?? id} — left behind.`);
		if (src.setFlag) {
			for (const k of Object.keys(src.setFlag))
				if (k.startsWith('secret:') && !run.flags[k]) {
					const sec = SECRETS.find((x) => x.id === k.slice(7));
					if (sec) {
						notes.push(`🗝 Secret revealed: **${sec.name}** — ${sec.hint}.`);
						log(run, `Learned the secret of ${sec.name}.`);
					}
				}
			Object.assign(run.flags, src.setFlag);
		}
		if (src.heat) run.heat = clamp(run.heat + src.heat, 0, 100);
		if (src.mount) setMount(run, src.mount, rng, notes);
		if ('remember' in src && src.remember && !run.ties.some((t) => t.npc.name === card.npc.name && !t.resolved)) {
			const r = src.remember as { kind: 'favor' | 'grudge'; deed: string };
			run.ties.push({ id: `tie-${card.npc.seed}`, npc: card.npc, kind: r.kind, deed: r.deed, city: run.route?.to ?? run.location, day: run.day });
			notes.push(r.kind === 'favor' ? `🤝 ${card.npc.name} will remember this.` : `⚔ ${card.npc.name} will not forget this.`);
		}
		if (src.quest && run.quests.length < 4 && !run.quests.some((q) => q.id === src.quest!.id)) {
			run.quests.push(src.quest);
			notes.push(`◆ New task: ${src.quest.title}`);
		}
		if (src.faction) {
			run.factions ??= { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 };
			for (const [fac, delta] of Object.entries(src.faction) as [FactionId, number][]) {
				if (delta) {
					run.factions[fac] = clamp((run.factions[fac] ?? 0) + delta, -100, 100);
					notes.push(`${delta > 0 ? '🔺' : '🔻'} ${FACTIONS[fac]?.label ?? fac}: ${delta > 0 ? '+' : ''}${delta}`);
				}
			}
		}
		if (src.traitAdd) {
			for (const tid of src.traitAdd) {
				if (!run.hero.traits.includes(tid)) {
					run.hero.traits.push(tid);
					const p = PERK[tid];
					notes.push(`✨ Acquired trait: **${p?.name ?? tid}** (${p?.pro ?? ''})`);
					log(run, `Acquired trait: ${p?.name ?? tid}.`);
				}
			}
		}
		if (src.traitRemove) {
			for (const tid of src.traitRemove) {
				const idx = run.hero.traits.indexOf(tid);
				if (idx >= 0) {
					run.hero.traits.splice(idx, 1);
					notes.push(`Lost trait: **${PERK[tid]?.name ?? tid}**`);
				}
			}
		}
		if (src.statusAdd) {
			run.statuses ??= [];
			for (const sid of src.statusAdd) {
				if (!run.statuses.includes(sid)) {
					run.statuses.push(sid);
					const st = STATUSES[sid];
					notes.push(`${st?.glyph ?? '⚠️'} Condition: **${st?.name ?? sid}** — ${st?.desc ?? ''}`);
					log(run, `Condition: ${st?.name ?? sid}.`);
				}
			}
		}
		if (src.statusRemove) {
			run.statuses ??= [];
			for (const sid of src.statusRemove) {
				const idx = run.statuses.indexOf(sid);
				if (idx >= 0) {
					run.statuses.splice(idx, 1);
					notes.push(`Recovered from condition: **${STATUSES[sid]?.name ?? sid}**`);
				}
			}
		}
		if (src.sponsorInvention) {
			sponsorInvention(run, src.sponsorInvention, card.npc?.name ?? 'The scholars');
			const inv = INVENTIONS[src.sponsorInvention];
			if (inv) {
				notes.push(`🔬 Sponsored Breakthrough: **${inv.name}** (${inv.daysNeeded} days to complete).`);
			}
		}
	}
	if (ch.settle) settle(run);
	for (const f of ch.clearFlag ?? []) delete run.flags[f];
	for (const src of [ch, extra]) for (const [k, v] of Object.entries(src?.bump ?? {})) run.flags[k] = Number(run.flags[k] ?? 0) + v;
	// a tale told wears a little thinner each time
	for (const k of Object.keys(run.flags))
		if (k.startsWith('told:')) {
			const t = run.repertoire?.find((x) => x.id === k.slice(5));
			if (t) t.told++;
			delete run.flags[k];
		}
	// rumours add up: two hints about the same hidden path reveal it
	for (const k of Object.keys(run.flags))
		if (k.startsWith('hint:') && Number(run.flags[k]) >= 2 && !run.flags['secret:' + k.slice(5)]) {
			const sec = SECRETS.find((x) => x.id === k.slice(5));
			if (!sec) continue;
			run.flags['secret:' + sec.id] = true;
			notes.push(`🗝 The rumours fit together: **${sec.name}** — ${sec.hint}. A new route is on your map.`);
			log(run, `Pieced together the secret of ${sec.name}.`);
		}
	if (ch.outfit) {
		wear(run, ch.outfit);
		notes.push(ch.outfit === 'none' ? 'You are back in your own clothes.' : `👘 You now wear: **${OUTFITS[ch.outfit]?.name ?? ch.outfit}**.`);
	}
	if (ch.romance) romanceStep(run, card.npc, ch.romance, notes);
	if (ch.energy && run.energy !== undefined) {
		run.energy = Math.max(0, Math.min(energyMax(run), run.energy + ch.energy));
		notes.push(`⚡ ${ch.energy > 0 ? '+' : ''}${ch.energy} energy for the day.`);
	}
	if (extra?.romance) romanceStep(run, card.npc, extra.romance, notes);
	if (ch.thought) discoverThought(run, ch.thought, notes);
	if (run.flags.buyHome) {
		delete run.flags.buyHome;
		if (buyHome(run)) notes.push(`🏡 You have a home in **${here(run)}**. Rest there for better nights; store things in the stash; your garden earns while you travel.`);
		else notes.push('You cannot afford it after all.');
	}
	if (ch.person) personStep(run, ch.person, notes);
	if (run.phase === 'city' || (card.npc.culture !== run.hero.culture && tags.includes('talk'))) {
		const heard = hearLanguage(run, card.npc.culture, 1);
		if (heard) notes.push(heard);
	}
	// practice makes… better: every skill the choice used gets a little experience
	run.skills ??= {};
	for (const sd of SKILLS) {
		if (!sd.trains.some((t) => tags.includes(t))) continue;
		const before = levelOf(run.skills[sd.id] ?? 0);
		run.skills[sd.id] = (run.skills[sd.id] ?? 0) + (won === true ? 5 : won === false ? 3 : 2);
		const now = levelOf(run.skills[sd.id]!);
		if (now > before) notes.push(`📈 **${sd.name}** ${now}${now === 6 ? ` — mastery: ${sd.mastery}` : ''}`);
	}
	if (card.npc.role === 'ghost' || card.npc.role === 'spirit') run.skills.mystic = (run.skills.mystic ?? 0) + 4;
	const tale = talesFrom(run, card, ch, side, won);
	if (tale) notes.push(tale);
	// collections
	const cul = CITY[run.location]?.culture;
	if (run.phase === 'city' && tags.includes('food') && cul) collect(run, 'dishes', cul, notes);
	if (card.id === 'v-bridge') collect(run, 'bridges', run.location, notes);
	if (card.id === 'v-landmark') collect(run, 'landmarks', run.location, notes);
	if (card.id === 'v-temple' || (run.phase === 'city' && tags.includes('faith'))) collect(run, 'temples', run.location, notes);
	checkTitles(run, notes);
	checkGoal(run, notes);
	if (extra?.person) personStep(run, extra.person, notes);
	checkThoughts(run, notes);
	if (ch.bag) {
		run.bagKind = ch.bag;
		dropOverflow(run, notes);
		notes.push(`${BAGS[ch.bag].glyph} Now carrying a ${BAGS[ch.bag].name.toLowerCase()} (${capacity(run)} slots).`);
	}
	for (const src of [ch, extra]) if (src?.mountHurt) hurtMount(run, src.mountHurt, notes);
	if (ch.crewAdd && run.crew.length < 3) {
		run.crew.push(ch.crewAdd);
		notes.push(`${ch.crewAdd.npc.name} joined your retinue.`);
	}
	if (ch.crewRemove) {
		const i = run.crew.findIndex((c) => c.id === ch.crewRemove || c.role === ch.crewRemove);
		if (i >= 0) notes.push(`${run.crew.splice(i, 1)[0].npc.name} left your retinue.`);
	}
	for (const src of [ch, extra]) if (src?.loyalty) for (const c of run.crew) c.loyalty = clamp(c.loyalty + src.loyalty, 0, 100);
	for (const k of Object.keys(run.flags))
		if (k.startsWith('loy:')) {
			const m = run.crew.find((c) => c.id === k.slice(4));
			if (m) m.loyalty = clamp(m.loyalty + Number(run.flags[k]), 0, 100);
			delete run.flags[k];
		}
	if (ch.legend && !run.legends.includes(ch.legend)) {
		run.legends.push(ch.legend);
		notes.push('★ A legend joins your chronicle.');
	}
	if (run.rival) run.rival.arrive += (ch.rivalDelay ?? 0) + (extra?.rivalDelay ?? 0);
	if (ch.pilgrimage && !run.pilgrimages.includes(ch.pilgrimage)) run.pilgrimages.push(ch.pilgrimage);
	if (ch.convert) {
		run.hero.faith = ch.convert;
		notes.push(`${FAITHS[ch.convert as FaithId].glyph} You are now ${FAITHS[ch.convert as FaithId].name}.`);
	}
	if (ch.next) run.deck.unshift(ch.next);

	run.cardsSeen++;
	run.recent = [card.id, ...run.recent.filter((r) => r !== card.id)].slice(0, 14);
	run.log.unshift({
		day: run.day,
		place: here(run),
		text: `${card.npc.name}: ${ch.label}.${text ? ' ' + text : ''}`,
		who: `${card.npc.name}, ${card.npc.title}`,
		scene: sceneLine({ ...run, phase: run.route ? 'travel' : run.phase }, card),
		situation: card.text,
		choice: ch.label,
		outcome: text,
		fx
	});
	track(run);
	if (run.log.length > 250) run.log.length = 250;
	run.rng = rng.state;

	CAP_STATS.forEach((s, i) => {
		const now = capOf(run, s);
		if (now > capsBefore[i]) {
			notes.push(`🏅 Seasoned: your ${s} can now reach **${now}** (it was ${capsBefore[i]}).`);
			log(run, `Seasoned by the road: ${s} limit ${capsBefore[i]} → ${now}.`);
		}
	});
	notes.push(...rescue(run));
	if (!checkEnd(run) && run.deck.length === 0) advance(run, notes);
	return { text, fx, days, won, notes };
}

function advance(run: Run, notes: string[] = []) {
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
			const away = run.day - (Number(run.flags.homeLast ?? run.home.since));
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

export function knownSecrets(run: Pick<Run, 'flags'>): string[] {
	return Object.keys(run.flags)
		.filter((k) => k.startsWith('secret:'))
		.map((k) => k.slice(7));
}

export function karmaLabel(k: number): string {
	return k >= 60 ? 'Saintly' : k >= 30 ? 'Virtuous' : k >= 10 ? 'Kind' : k <= -60 ? 'Wicked' : k <= -30 ? 'Ruthless' : k <= -10 ? 'Callous' : 'Unremarkable';
}

function resolveQuests(run: Run, notes: string[]) {
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

function checkRival(run: Run, notes: string[]) {
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

// ---------- bag, mount, crew ----------

export function addItem(run: Run, id: string): boolean {
	if (!ITEMS[id]) return false;
	syncGrid(run);
	if (!canFit(run, id)) return false;
	run.bag.push(id);
	syncGrid(run);
	return true;
}

export function removeItem(run: Run, id: string) {
	const i = run.bag.indexOf(id);
	if (i >= 0) run.bag.splice(i, 1);
	syncGrid(run);
}

function setMount(run: Run, kind: MountKind | 'none', rng: Rng, notes: string[]) {
	if (kind === 'none') {
		if (run.mount) notes.push(`${run.mount.name} is gone.`);
		run.mount = null;
		dropOverflow(run, notes);
		return;
	}
	run.mount = { kind, name: rng.pick(MOUNT_NAMES), health: 100 };
	notes.push(`${MOUNTS[kind].glyph} ${run.mount.name} the ${MOUNTS[kind].name.toLowerCase()} joins you, with packs of their own.`);
}

function hurtMount(run: Run, amount: number, notes: string[] = []) {
	if (!run.mount) return;
	run.mount.health = clamp(run.mount.health - amount, 0, 100);
	if (run.mount.health <= 0) {
		const msg = `${run.mount.name} collapsed and died on the road.`;
		log(run, msg);
		notes.push(msg);
		run.mount = null;
		dropOverflow(run, notes);
	}
}

function dropOverflow(run: Run, notes: string[]) {
	let over = syncGrid(run);
	for (let guard = 0; over.length && guard < 40; guard++) {
		// drop what does not fit; if that is a relic, sacrifice something ordinary instead
		const victim = over.find((id) => ITEMS[id]?.kind !== 'relic') ?? run.bag.find((id) => ITEMS[id]?.kind !== 'relic') ?? over[0];
		run.bag.splice(run.bag.lastIndexOf(victim), 1);
		notes.push(`Too much to carry — abandoned ${ITEMS[victim]?.name ?? victim}.`);
		over = syncGrid(run);
	}
}

export function useItem(run: Run, id: string): Resolution | null {
	const it = ITEMS[id];
	if (!it?.use || !run.bag.includes(id) || run.phase === 'end') return null;
	removeItem(run, id);
	let fx: Fx = it.use.fx;
	if (id === 'djinn-lamp') {
		fx = {};
		for (const s of STATS) fx[s] = 50 - run.stats[s];
		for (const s of STATS) run.stats[s] = 50;
	} else fx = applyFx(run, fx, ['rest']);
	if (it.use.heat) {
		run.heat = Math.max(0, Math.min(100, run.heat + it.use.heat));
	}
	log(run, `Used ${it.name}. ${it.use.text}`);
	checkEnd(run);
	return { text: it.use.text, fx, days: 0, notes: [] };
}

export function dropItem(run: Run, id: string) {
	if (run.outfit?.id === id) run.outfit = undefined;
	removeItem(run, id);
	log(run, `Left ${ITEMS[id]?.name ?? id} behind.`);
}

export function dismiss(run: Run, id: string) {
	const i = run.crew.findIndex((c) => c.id === id);
	if (i < 0) return;
	const c = run.crew.splice(i, 1)[0];
	log(run, `Parted ways with ${c.npc.name}.`);
	if (c.loyalty >= 60 || c.loyalty < 30)
		run.ties.push({ id: `tie-${c.npc.seed}`, npc: c.npc, kind: c.loyalty >= 60 ? 'favor' : 'grudge', deed: c.loyalty >= 60 ? 'parted as friends on the road' : 'dismissed them after hard service', city: run.location, day: run.day });
}

export function standingLabel(v: number): string {
	return v >= 50 ? 'Honors you' : v >= 25 ? 'Likes you' : v <= -50 ? 'Hates you' : v <= -25 ? 'Distrusts you' : 'Knows little of you';
}

/** Move silver into / out of the treasury (only while in a city or choosing a route). */
export function bank(run: Run, amount: number) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	if (amount > 0) {
		const n = Math.min(amount, run.stats.silver - 1);
		if (n <= 0) return;
		run.stats.silver -= n;
		run.treasury += n;
		log(run, `Deposited ${n} silver with a factor.`);
	} else {
		const n = Math.min(-amount, run.treasury, 99 - run.stats.silver);
		if (n <= 0) return;
		run.treasury -= n;
		run.stats.silver += n;
		log(run, `Drew ${n} taels on your letter of credit.`);
	}
}

// ---------- dynasty ----------

export interface Successor {
	relation: 'child' | 'apprentice' | 'cousin';
	label: string;
	hero: Hero;
	year: number;
}

export function successors(run: Run): Successor[] {
	const rng = new Rng(run.rng ^ 0x1234567);
	const now = run.year + Math.floor(run.day / 365);
	const out: Successor[] = [];
	const fresh = (exclude: string[]) => rng.sample(TRAITS.filter((t) => !t.unlock && !t.flaw && !exclude.includes(t.id)), 2).map((t) => t.id);
	const parentTraits = rng.sample(run.hero.traits, 1);
	const loverCrew = run.crew.find((c) => c.role === 'companion');
	const loverName = loverCrew?.npc.name ?? (typeof run.flags.lover === 'string' ? run.flags.lover : null);
	if (loverName) {
		const loverCulture = (loverCrew?.npc.culture ?? CITY[String(run.flags.loverCity)]?.culture ?? run.hero.culture) as CultureId;
		const culture = rng.chance(0.5) ? run.hero.culture : loverCulture;
		const g: Gender = rng.chance(0.5) ? 'f' : 'm';
		const hc = CULTURES[run.hero.culture];
		const parts = run.hero.name.split(' ');
		const fam = hc.family ? (hc.familyFirst ? parts[0] : parts[parts.length - 1]) : '';
		const given = rng.pick(g === 'm' ? CULTURES[culture].male : CULTURES[culture].female);
		const name = fam ? (hc.familyFirst ? `${fam} ${given}` : `${given} ${fam}`) : given;
		const year = Math.min(1900, now + rng.int(18, 24));
		const hero = randomHero(rng, year, { culture, gender: g, name, traits: [...parentTraits, ...fresh(parentTraits)], faith: run.hero.faith, ideal: rng.chance(0.6) ? run.hero.ideal : rng.pick(IDEAL_IDS) });
		out.push({ relation: 'child', label: `Your child with ${loverName}`, year, hero: { ...hero, age: rng.int(18, 23) } });
	}
	for (const c of run.crew.filter((c) => !['ward', 'heir', 'companion'].includes(c.role)).slice(0, 2)) {
		const year = Math.min(1900, now + 1);
		out.push({ relation: 'apprentice', label: `${c.npc.name}, your ${c.role}`, year, hero: randomHero(rng, year, { culture: c.npc.culture, gender: c.npc.gender, name: c.npc.name, seed: c.npc.seed, ideal: run.hero.ideal }) });
	}
	const year = Math.min(1900, now + rng.int(8, 14));
	out.push({ relation: 'cousin', label: 'A young cousin from home', year, hero: randomHero(rng, year, { culture: run.hero.culture, traits: [...parentTraits, ...fresh(parentTraits)] }) });
	return out;
}

export function legacyOf(run: Run, s: Successor): Legacy {
	const QUEST = ['parcel1', 'parcel2', 'parcel3', 'betrothal-seal', 'temple-relic', 'survey-book'];
	const died = run.year + Math.floor(run.day / 365);
	return {
		lineage: [...run.lineage, { name: run.hero.name, culture: run.hero.culture, gender: run.hero.gender, seed: run.hero.seed, years: `${run.year}–${died}`, ending: run.ending?.title ?? 'Unknown', relation: s.relation }],
		relics: run.bag.filter((id) => ITEMS[id]?.kind === 'relic' && !QUEST.includes(id)).slice(0, 3),
		treasury: Math.round(run.treasury * (s.relation === 'apprentice' ? 0.4 : 0.7)),
		ventures: s.year - died < 15 ? run.ventures.map((v) => ({ ...v, state: 'idle' as const, dest: undefined, back: undefined })) : [],
		standing: Object.fromEntries(Object.entries(run.standing).map(([k, v]) => [k, Math.round(v / 2)])),
		karma: Math.round(run.karma / 2),
		ties: run.ties.filter((t) => t.kind === 'grudge' && !t.resolved).slice(-3), // grudges outlive their makers
		destination: run.delivered ? undefined : run.destination,
		item: run.delivered ? undefined : run.item
	};
}

function applyLegacy(run: Run, L: Legacy) {
	run.lineage = L.lineage;
	run.generation = L.lineage.length + 1;
	for (const r of L.relics) if (!run.bag.includes(r)) run.bag.push(r);
	run.treasury = L.treasury;
	run.ventures = L.ventures;
	for (const [k, v] of Object.entries(L.standing)) run.standing[k] = Math.max(run.standing[k] ?? -100, v);
	run.karma = L.karma;
	run.ties = L.ties.map((t) => ({ ...t, day: -10, deed: `${t.deed} (or so they say of your family)` }));
	const heirloom = run.generation % 2 === 0 ? 'ancestral-crest' : 'heirloom-blade';
	if (!run.bag.includes(heirloom) && !run.bag.includes('ancestral-crest') && !run.bag.includes('heirloom-blade')) {
		run.bag.push(heirloom);
	}
	if (L.destination && L.destination !== run.location && CITY[L.destination] && cityExists(CITY[L.destination], run.year)) {
		const dist = shortestDays(run.location, run.year)[L.destination];
		if (dist) {
			run.destination = L.destination;
			run.item = L.item ?? run.item;
			run.deadline = Math.round(dist * 1.6 + 15);
			if (run.rival) run.rival = { ...run.rival, path: shortestPath(run.location, L.destination, run.year), arrive: Math.round(dist * 1.3 + 8) };
		}
	}
}


/** Relics and supplies that pull you back from the brink. */
function rescue(run: Run): string[] {
	const out: string[] = [];
	for (const s of STATS) {
		const v = run.stats[s];
		if (v > 0 && v < 100) continue;
		const low = v <= 0;
		const saver = run.bag.find((id) => {
			const sv = ITEMS[id]?.saves;
			return sv === 'any' || (low && sv === s);
		});
		if (!saver) continue;
		removeItem(run, saver);
		run.stats[s] = low ? 30 : 70;
		const msg = `${ITEMS[saver].glyph} ${ITEMS[saver].name} saved you from ${low ? 'ruin' : 'excess'}!`;
		log(run, msg);
		out.push(msg);
	}
	// unhappy crew walk out
	for (const c of [...run.crew])
		if (c.loyalty <= 0) {
			run.crew.splice(run.crew.indexOf(c), 1);
			const msg = `${c.npc.name} has had enough and walked out.`;
			log(run, msg);
			out.push(msg);
		}
	return out;
}

export function applyFx(run: Run, raw: Fx, tags: Tag[]): Fx {
	const fx = modFx(run, raw, tags);
	for (const s of STATS) {
		if (!fx[s]) continue;
		// soft cap: gains shrink near the top, so 100 takes real recklessness; easy modes cushion falls
		const diff = DIFFICULTY[run.difficulty] ?? DIFFICULTY.courier;
		const cap = capOf(run, s);
		const k = cap / 100; // soft caps scale with how much you can hold
		if (fx[s]! > 0) {
			if (run.stats[s] >= 88 * k) fx[s] = Math.max(1, Math.round(fx[s]! * 0.35));
			else if (run.stats[s] > diff.softCap * k) fx[s] = Math.max(1, Math.round(fx[s]! * 0.55));
		}
		if (fx[s]! < 0 && run.stats[s] < 25 && diff.lossCushion !== 1) fx[s] = Math.min(-1, Math.round(fx[s]! * diff.lossCushion));
		run.stats[s] = clamp(run.stats[s] + fx[s]!, 0, cap);
		// experience: everything you live through widens what you can hold
		run.xp ??= {};
		run.xp[s] = (run.xp[s] ?? 0) + Math.abs(fx[s]!);
	}
	return fx;
}

// ---------- endings ----------

function checkEnd(run: Run): boolean {
	if (run.phase === 'end') return true;
	if (run.flags.end === 'campaign') {
		const won = !!run.flags.endWon;
		if (won) run.delivered = true;
		run.ending = { kind: won ? 'victory' : 'late', won, title: String(run.flags.endTitle ?? 'The End'), text: String(run.flags.endText ?? '') };
		run.phase = 'end';
		return true;
	}
	if (run.flags.end === 'prince' || run.flags.end === 'retired' || run.flags.end === 'settled') {
		const prince = run.flags.end === 'prince';
		const settled = run.flags.end === 'settled';
		const romance = run.romance && (run.romance.city === run.location || run.visited.includes(run.romance.city)) && run.romance.status !== 'parted' ? run.romance : null;
		let title = prince ? 'Merchant Prince' : settled ? 'Settled Life' : 'Retired';
		let text = prince
			? `In ${here(run)}, ${run.hero.name} buys a house with a garden and a counting room. ${run.ventures.length} ${run.ventures.length === 1 ? 'vessel sails' : 'vessels sail'} under your seal, ${run.treasury} taels sit with your factors, and merchants from four seas ask for your advice.`
			: settled
			? romance
				? `${run.hero.name} lays down the road-stained pack in ${here(run)} to build a home beside ${romance.npc.name}. The four seas are vast, but this hearth is enough.`
				: run.hero.home === run.location
				? `After long wanderings across mountain passes and stormy straits, ${run.hero.name} returns home to ${here(run)}. The maps are hung upon the wall, and the young folk gather to hear tales of the four seas.`
				: `${run.hero.name} chooses freedom over deadlines, settling down in ${here(run)}. You trade in familiar goods, brew tea for passing strangers, and watch the seasons turn without fear of distant couriers.`
			: `${run.hero.name} sets down the travelling pack for good in ${here(run)}. The stories will outlive the traveller — and someone will have to carry them on.`;
		run.ending = {
			kind: prince ? 'prince' : settled ? 'settled' : 'retired',
			won: true,
			title,
			text
		};
		run.phase = 'end';
		return true;
	}
	if (run.flags.end === 'jailed') {
		run.ending = {
			kind: 'jailed',
			won: false,
			title: 'In Chains',
			text: `The cangue is heavy and the cell is damp. In ${here(run)}, ${run.hero.name}'s long list of crimes finally caught up. The ${run.item.replace(/^an? /, '')} is entered into evidence. You will have years to write your memoirs.`
		};
		run.phase = 'end';
		return true;
	}
	if (typeof run.flags.end === 'string' && run.flags.end.startsWith('stat-')) {
		const part = run.flags.end.slice(5);
		if (part === 'mind-low') {
			run.ending = {
				kind: 'mind-low',
				won: false,
				title: 'Lost in the Dream',
				text: `In ${here(run)}, ${run.hero.name} stops answering to their own name. They sit by the ${CULTURES[CITY[run.location].culture].holyPlace} gate and talk, kindly and at length, to voices nobody else can hear. ${run.item[0].toUpperCase() + run.item.slice(1)} is found in their lap, untouched, and sent on by a stranger.`
			};
		} else {
			const [s, dir] = part.split('-') as [Stat, 'low' | 'high'];
			run.ending = statEnding(run, s, dir);
		}
		run.phase = 'end';
		return true;
	}
	if ((run.mind ?? 70) <= 0) {
		run.ending = {
			kind: 'mind-low',
			won: false,
			title: 'Lost in the Dream',
			text: `In ${here(run)}, ${run.hero.name} stops answering to their own name. They sit by the ${CULTURES[CITY[run.location].culture].holyPlace} gate and talk, kindly and at length, to voices nobody else can hear. ${run.item[0].toUpperCase() + run.item.slice(1)} is found in their lap, untouched, and sent on by a stranger.`
		};
		run.phase = 'end';
		return true;
	}
	const crisis = isCrisis(run);
	if (crisis) {
		const crisisCard = buildCrisisCard(run, crisis);
		if (run.deck[0]?.id !== crisisCard.id) run.deck.unshift(crisisCard);
		// the crisis must be seen: from the map (resting, using an item) it opens as a city card
		if (run.phase === 'map') run.phase = 'city';
		run.deckTotal = Math.max(run.deckTotal, run.deck.length);
		const [s, dir] = crisis.split('-') as [Stat, 'low' | 'high'];
		run.stats[s] = dir === 'low' ? 1 : capOf(run, s) - 1;
		const msg = `⚡ On the brink of fate! Make your stand.`;
		log(run, msg);
		return false;
	}
	for (const s of STATS) {
		const v = run.stats[s];
		if (v <= 0 || v >= capOf(run, s)) {
			run.ending = statEnding(run, s, v <= 0 ? 'low' : 'high');
			run.phase = 'end';
			return true;
		}
	}
	if (!run.delivered && run.day > run.deadline) {
		run.ending = {
			kind: 'late',
			won: false,
			title: 'Too Late',
			text: `Day ${run.day}. The deadline has passed. Word reaches you that ${run.patron} has sent another in your place, and that your name is now spoken only in curses. You settle in ${here(run)}, and become the kind of old traveller who tells long stories in tea houses.`
		};
		run.phase = 'end';
		return true;
	}
	return false;
}

function here(run: Run) {
	return cityName(CITY[run.location], run.year);
}

function statEnding(run: Run, s: Stat, dir: 'low' | 'high'): Ending {
	const p = here(run);
	const ruler = CULTURES[CITY[run.location].culture].ruler(run.year);
	const T: Record<string, [string, string]> = {
		'silver-low': ['Penniless', `You sold your mount, then your boots, then your name. ${run.hero.name} ends their days as a debtor in ${p}, the ${run.item.replace(/^an? /, '')} pawned for a bowl of rice.`],
		'silver-high': ['Too Rich to Live', `Tales of your fat purse reached the wrong ears. They found you in a canal near ${p}, purse missing, smile still on your face.`],
		'vigor-low': ['The Fever', `The fever took you in ${p}. A kind stranger sent your journal home. It arrived three years later, and made your mother weep.`],
		'vigor-high': ['Reckless', `Brimming with strength, you joined a band of mercenaries in ${p} "just for one season." Your commission was forgotten. You were very happy, briefly.`],
		'renown-low': ['Disgraced', `No inn in ${p} will host you, no captain will carry you. Your commission is revoked, your name struck from the family register.`],
		'renown-high': ['Gilded Cage', `Your fame reached ${ruler}, who decided so remarkable a traveller must be a spy. You live out your days under very comfortable arrest.`],
		'fortune-low': ['Heaven Turns Away', `In ${p}, a roof tile slipped in the wind. Of all the heads in the market, it chose yours.`],
		'fortune-high': ['The Living Saint', `Convinced you were touched by Heaven, the people of ${p} built you a shrine. They would not let you leave. They still bring you dumplings.`]
	};
	const kind = `${s}-${dir}` as EndingKind;
	const [title, text] = T[kind];
	return { kind, title, text, won: false };
}

function victory(run: Run): Ending {
	const spare = run.deadline - run.day;
	const second = !!run.rival?.arrived;
	return {
		kind: second ? 'second' : 'victory',
		won: true,
		title: second ? 'Second to Arrive' : 'Commission Fulfilled',
		text: second
			? `Day ${run.day}. You deliver ${run.item}, but ${run.rival!.npc.name} got here first, and the court's gratitude is lukewarm. Still: ${run.visited.length} cities, ${run.legends.length} legends, and you are alive.`
			: `Day ${run.day}, with ${spare} day${spare === 1 ? '' : 's'} to spare and ${run.rival?.npc.name ?? 'your rival'} nowhere in sight, you place ${run.item} in the hands of the court of ${here(run)}. Across ${run.visited.length} cities and ${run.cardsSeen} decisions, ${run.hero.name} has earned a place in the chronicles.`
	};
}

export function score(run: Run): number {
	const base = run.visited.length * 40 + run.cardsSeen * 5 + run.stats.renown * 2 + run.legends.length * 60 + (run.pilgrimages?.length ?? 0) * 50 + Math.max(0, run.karma ?? 0) * 3;
	const QUEST_ITEMS = ['parcel1', 'parcel2', 'parcel3', 'betrothal-seal', 'temple-relic', 'survey-book', 'cursed-blade', 'manuscript', 'heir-seal'];
	const relics = run.bag.filter((id) => ITEMS[id]?.kind === 'relic' && !QUEST_ITEMS.includes(id)).length * 40 + (run.treasury ?? 0) + (run.ventures?.length ?? 0) * 30 + ((run.generation ?? 1) - 1) * 100;
	const factionsScore = Object.values(run.factions ?? {}).reduce((acc, v) => acc + Math.max(0, v) * 2, 0);
	const statusesScore = (run.statuses?.length ?? 0) * 35;
	const settleBonus = (run.ending?.kind === 'settled' ? 300 : 0) + (run.goal?.done !== undefined ? 400 : 0);
	const bonus = run.delivered ? (run.rival?.arrived ? 250 : 500) + Math.max(0, (isFinite(run.deadline) ? run.deadline : run.day) - run.day) * 10 : 0;
	return Math.round((base + relics + factionsScore + statusesScore + settleBonus + bonus) * (run.scoreMult ?? 1));
}

// ---------- utils ----------

export function log(run: Run, text: string) {
	run.log.unshift({ day: run.day, place: here(run), text });
	if (run.log.length > 250) run.log.length = 250;
}

function clamp(v: number, a: number, b: number) {
	return Math.max(a, Math.min(b, v));
}

function cap(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function seedFor(s: string) {
	return hashString(s);
}

// ---------- persistence ----------

const KEY = 'four-seas:run';
/** Bump when the shape of a saved run changes, and add a step to MIGRATIONS. */
export const SCHEMA = 4;

const serialize = (run: Run) => JSON.stringify({ ...run, schema: SCHEMA }, (_k, v) => (v === Infinity ? '__inf' : v));

export function save(run: Run | null) {
	try {
		if (run) localStorage.setItem(KEY, serialize(run));
		else localStorage.removeItem(KEY);
	} catch {}
}

/** Each step upgrades a save from schema n to n+1. Never edit a step once released — add a new one. */
const MIGRATIONS: Record<number, (r: Run) => void> = {
	// 1 → 2: everything added on 2026-10-13 (difficulty, faith, karma, standing, ventures, dynasty, world events)
	1: (r) => {
		r.difficulty ??= 'courier';
		r.hardship ??= 'none';
		r.scoreMult ??= 1;
		r.quests ??= [];
		r.pilgrimages ??= [];
		r.hero.faith ??= CULTURE_FAITH[r.hero.culture];
		r.hero.ideal ??= 'harmony';
		r.karma ??= 0;
		r.ties ??= [];
		r.standing ??= { [r.hero.culture]: 20 };
		r.ventures ??= [];
		r.treasury ??= 0;
		r.lineage ??= [];
		r.generation ??= 1;
		r.world ??= [];
	},
	// 2 → 3: romance, tile bag, voices, mind, cabinet, people met
	2: (r) => {
		r.romance ??= null;
		r.extraBags ??= [];
		r.hero.voices ??= baseVoices(r.hero.profession, r.hero.traits);
		r.mind ??= 70;
		r.apathy ??= 0;
		r.cabinet ??= { found: [], slots: [], done: [] };
		r.people ??= [];
		r.langs ??= {};
		r.repertoire ??= [];
		r.xp ??= {};
	},
	// 3 → 4: life skills, life goals, letters, home, titles, collections, trade memory
	3: (r) => {
		r.skills ??= startingSkills(r.hero.profession, r.hero.traits);
		r.letters ??= [];
		r.titles ??= [];
		r.collected ??= {};
		r.priceMemory ??= {};
		r.restorePoints ??= [];
	}
};

/** Parse and upgrade a saved run. Returns null if it is not a Four Seas save. */
export function parseRun(text: string): Run | null {
	try {
		const r = JSON.parse(text, (_k, v) => (v === '__inf' ? Infinity : v)) as Run & { schema?: number };
		if (r?.version !== 2 || !r.hero || !r.stats || !r.location) return null;
		let v = r.schema ?? 1;
		while (v < SCHEMA) {
			MIGRATIONS[v]?.(r);
			v++;
		}
		r.schema = SCHEMA;
		try {
			syncGrid(r);
		} catch {
			r.grid = [];
		}
		repairRun(r);
		return r;
	} catch {
		return null;
	}
}

export function load(): Run | null {
	try {
		const s = localStorage.getItem(KEY);
		return s ? parseRun(s) : null;
	} catch {
		return null;
	}
}

/** A save file the player can keep or move to another device. */
export const exportRun = (run: Run) => serialize(run);
/** Load a save file; returns the run (and stores it) or null if the file is not a valid save. */
export function importRun(text: string): Run | null {
	const r = parseRun(text);
	if (r) save(r);
	return r;
}

/** Settle down for good: ends the run (counts as a win if the commission was delivered). */
export function retire(run: Run) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	run.flags.end = 'retired';
	checkEnd(run);
}

/** Settle down in the current city to live peacefully on your own terms. Always counts as a victory. */
export function settle(run: Run) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	run.flags.end = 'settled';
	checkEnd(run);
}

/** After a commission (or campaign) is won: forget the old ending so the run can go on. */
function clearEnding(run: Run) {
	run.ending = null;
	for (const k of ['end', 'endWon', 'endTitle', 'endText']) delete run.flags[k];
	// a finished campaign becomes a free journey: normal deliveries count again
	if (run.flags.campaign) {
		run.flags.campaignDone = run.flags.campaign;
		delete run.flags.campaign;
	}
	run.route = null;
	run.deck = [];
	run.deckTotal = 0;
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

// ---------- romance ----------

function romanceStep(run: Run, npc: Npc, step: RomanceStep, notes: string[]) {
	if (step.start) {
		const old = run.romance;
		if (old && old.status !== 'parted' && old.npc.name !== npc.name) notes.push(`💔 Your heart moves on from ${old.npc.name}.`);
		run.romance = { npc, city: run.route?.to ?? run.location, affection: 30, status: 'courting', since: run.day, letters: 0 };
		run.flags.lover = npc.name;
		run.flags.loverCity = run.romance.city;
		notes.push(`💗 You are courting **${npc.name}**.`);
	}
	const r = run.romance;
	if (!r) return;
	if (step.affection) r.affection = clamp(r.affection + step.affection, 0, 100);
	if (step.status && step.status !== r.status) {
		r.status = step.status;
		notes.push(step.status === 'betrothed' ? `💍 You and **${r.npc.name}** are betrothed.` : step.status === 'married' ? `💒 You are married to **${r.npc.name}**.` : `💔 You and ${r.npc.name} part ways.`);
		log(run, step.status === 'parted' ? `Parted from ${r.npc.name}.` : step.status === 'married' ? `Married ${r.npc.name}.` : `Betrothed to ${r.npc.name}.`);
		shiftMind(run, step.status === 'parted' ? -12 : step.status === 'married' ? 10 : 5);
		if (step.status === 'parted') {
			delete run.flags.lover;
			delete run.flags.loverCity;
		}
	} else if (step.affection) notes.push(`${step.affection > 0 ? '💗' : '💔'} ${r.npc.name}: ${step.affection > 0 ? '+' : ''}${step.affection} affection.`);
	if (r.status !== 'parted' && r.affection <= 0) {
		r.status = 'parted';
		notes.push(`💔 ${r.npc.name} has stopped waiting for you.`);
		delete run.flags.lover;
	}
}

/** Walk over to a venue in town: puts its card at the top of the deck (once per venue per stay). */
export function visitVenue(run: Run, id: VenueId): boolean {
	if ((run.phase !== 'map' && run.phase !== 'city') || venueUsed(run, id)) return false;
	if (venuesHere(run).find((v) => v.id === id)?.closed) return false;
	if (!spendEnergy(run)) return false;
	const rng = new Rng(run.rng);
	const card = venueCard(run, rng, id);
	run.rng = rng.state;
	if (!card) {
		run.energy = (run.energy ?? 0) + 1;
		return false;
	}
	markVenue(run, id);
	run.deck.unshift(card);
	if (run.phase === 'map') {
		run.phase = 'city';
		run.deckTotal = run.deck.length;
	} else run.deckTotal++;
	return true;
}

/** Spend one action in town. Unlimited missions never run out. */
export function spendEnergy(run: Run): boolean {
	const max = energyMax(run);
	if (!Number.isFinite(max)) return true;
	run.energy ??= max;
	if (run.energy <= 0) return false;
	run.energy--;
	return true;
}

/** Spend a day resting in town: energy back to full, a little vigor. */
export function restDay(run: Run) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	run.day += 1;
	const extraVigor = (run.completedInventions?.includes('quinine-distillation') || run.bag.includes('quinine-distillation')) ? 6 : 0;
	applyFx(run, { vigor: 4 + extraVigor }, ['rest']);
	shiftMind(run, run.home?.city === run.location ? 14 : 6);
	if (run.home?.city === run.location) applyFx(run, { vigor: 8 }, ['rest']);
	thinkFor(run, 1, []);
	hearLanguage(run, CITY[run.location].culture, 2);
	tickInventions(run, 1);
	run.flags.stay = run.day; // a new day: venues can be visited again
	run.energy = energyMax(run);
	log(run, `Rested a day in ${here(run)}.`);
	checkEnd(run);
}

/** Opening the market takes one action the first time each stay; browsing again is free. */
export function openMarket(run: Run): boolean {
	const id = venuesHere(run).find((v) => (v.id === 'market' || v.id === 'bazaar') && !v.closed)?.id;
	if (!id) return false;
	if (venueUsed(run, id)) return true;
	if (!spendEnergy(run)) return false;
	markVenue(run, id);
	return true;
}

function track(run: Run) {
	run.trend ??= [];
	run.trend.push([run.day, run.stats.silver, run.stats.vigor, run.stats.renown, run.stats.fortune]);
	if (run.trend.length > 160) run.trend.splice(0, run.trend.length - 160);
}

export interface EndingCause {
	stat?: Stat;
	dir?: 'low' | 'high';
	headline: string;
	straw?: LogEntry; // the choice that tipped it over
	runup: LogEntry[]; // the blows before that
	series?: number[]; // the fatal stat over time
	tip: string;
}

const TIPS: Record<string, string> = {
	'vigor-low': 'Vigor is health. Rest at an inn (it also restores energy), eat, carry medicine (it saves you once), hire a physician, and avoid risky fights when you are below 30.',
	'vigor-high': 'Even strength can be too much: at the top, swipe on gentler, riskier or costlier options to bleed a little off.',
	'silver-low': 'Keep silver above 20: sell curios where they are prized, carry trade goods to distant markets, take odd jobs at the docks, and say no to bribes you do not need.',
	'silver-high': 'Too much silver draws thieves and tax men. Spend it — bags, outfits, mounts, a ship — or bank it with your factors in the Fleet tab.',
	'renown-low': 'Renown is your name. Tell stories in the square, present yourself at court, debate at academies, and avoid crimes that get you caught.',
	'renown-high': 'Too famous is dangerous. Wear a disguise, lie low, travel under forged papers — and refuse the flashiest options for a while.',
	'fortune-low': 'Fortune is luck. Pray at temples, keep charms, join festivals and avoid games of chance when your luck is already thin.',
	'fortune-high': 'Heaven distrusts favourites. When luck is near the top, gamble a little, give alms, or let a festival spend it.',
	'mind-low': 'Mind is composure. Failed gambles, heavy losses and cruelty wear it down; rest, festivals, faith, art, food and love restore it. A high Will softens every blow — and a Stone Heart never breaks (it just stops caring).',
	late: 'Watch the days. Choose the shortest routes, buy a horse or camel, hire a guide or navigator — and skip a city when the clock is tight.',
	jailed: 'Heat (🏮) above 60 brings the constables. Lie low, cross borders to cool it, pay fines, bribe, or wear a disguise.',
	campaign: 'Every campaign has several endings — try the other side, or a hidden option.',
	retired: 'You chose to stop here.',
	prince: 'You chose to stop here.',
	victory: 'Try a harder difficulty, a hardship start, or a flaw for a bigger score.',
	second: 'Your rival got there first — keep an eye on the ◌ marker and delay them when a card lets you.'
};

/** Why the journey ended: the stat that broke, the last straw, and what led up to it. */
export function endingCause(run: Run): EndingCause | null {
	const e = run.ending;
	if (!e) return null;
	const m = /^(silver|vigor|renown|fortune)-(low|high)$/.exec(e.kind);
	const withFx = run.log.filter((l) => l.fx && Object.values(l.fx).some((v) => v));
	if (m) {
		const stat = m[1] as Stat;
		const dir = m[2] as 'low' | 'high';
		const hit = (l: LogEntry) => (l.fx?.[stat] ?? 0) * (dir === 'low' ? -1 : 1) > 0;
		const blows = withFx.filter(hit);
		const idx = STATS.indexOf(stat) + 1;
		return {
			stat,
			dir,
			headline: `${stat[0].toUpperCase() + stat.slice(1)} ${dir === 'low' ? 'fell to nothing' : 'overflowed'} (${run.stats[stat]}).`,
			straw: blows[0],
			runup: blows.slice(1, 5),
			series: (run.trend ?? []).map((t) => t[idx]),
			tip: TIPS[e.kind]
		};
	}
	if (e.kind === 'mind-low') return { headline: 'Your mind gave way.', straw: withFx[0], runup: withFx.slice(1, 5), tip: TIPS['mind-low'] };
	if (e.kind === 'late') return { headline: `The deadline (day ${run.deadline}) passed on day ${run.day}.`, runup: run.log.filter((l) => l.text.startsWith('Set out')).slice(0, 4), tip: TIPS.late };
	if (e.kind === 'jailed') return { headline: `Wanted level ${Math.round(run.heat)} — the constables caught up with you.`, straw: withFx[0], runup: run.log.filter((l) => /crime|steal|smuggl|bribe/i.test(l.text)).slice(0, 4), tip: TIPS.jailed };
	return { headline: e.won ? 'Journey complete.' : 'The journey ends here.', runup: [], tip: TIPS[e.kind] ?? TIPS.victory };
}

// ---------- the mind ----------

const CAP_STATS = ['silver', 'vigor', 'renown', 'fortune', 'mind'] as const;

const MIND_START: Record<string, number> = { none: 70, fever: 60, penniless: 55, exile: 50, cursed: 55, shipwrecked: 50, 'deaths-door': 40 };

/** Change composure. A Stone Heart never cracks: losses become apathy instead. Will softens every blow. */
export function shiftMind(run: Run, delta: number) {
	run.mind ??= MIND_START[run.hardship] ?? 70;
	run.apathy ??= 0;
	if (delta < 0) {
		const will = effectiveVoices(run).will ?? 2;
		delta = Math.round(delta * Math.max(0.5, 1 - (will - 2) * 0.08));
		for (const id of run.cabinet?.done ?? []) delta = Math.round(delta * (THOUGHT[id]?.done.mindLoss ?? 1));
		delta = Math.round(delta * (1 - skillLevel(run, 'composure') * 0.05));
		if (run.hero.traits.includes('stone-heart')) {
			run.apathy = Math.min(100, run.apathy - delta);
			return;
		}
	} else if (run.apathy > 0) {
		// feeling something again slowly melts the numbness
		run.apathy = Math.max(0, run.apathy - Math.ceil(delta / 2));
	}
	run.xp ??= {};
	run.xp.mind = (run.xp.mind ?? 0) + Math.abs(delta);
	run.mind = Math.max(0, Math.min(capOf(run, 'mind'), run.mind + delta));
}

function mindAfter(run: Run, fx: Fx, tags: Tag[], won: boolean | undefined, notes: string[]) {
	const before = run.mind ?? MIND_START[run.hardship] ?? 70;
	const sum = STATS.reduce((a, k) => a + (fx[k] ?? 0), 0);
	let d = 0;
	if (won === false) d -= 6;
	if (won === true) d += 2;
	if (sum <= -15) d -= 4;
	else if (sum <= -6) d -= 2;
	if (tags.includes('cruel')) d -= 3;
	if (sum > 0 && tags.some((t) => ['rest', 'faith', 'art', 'romance', 'food', 'mercy'].includes(t))) d += 3;
	if (run.stats.vigor < 20) d -= 1;
	if (!d) return;
	shiftMind(run, d);
	const now = run.mind ?? before;
	const crossed = (lvl: number) => before >= lvl && now < lvl;
	if (crossed(35)) notes.push('🌀 Your mind is **frayed**. The voices are getting louder — and less honest.');
	else if (crossed(15)) notes.push('🌀 You are **unravelling**. Some things you try will simply fail. Rest. Pray. Find someone who loves you.');
	else if (before < 35 && now >= 35) notes.push('🍃 The noise in your head quiets. You feel like yourself again.');
	if (run.hero.traits.includes('stone-heart') && (run.apathy ?? 0) >= 40 && d < 0 && (run.apathy ?? 0) - -d < 40) notes.push('🪨 You notice you have stopped caring. About anything. It is very peaceful.');
}

// ---------- the thought cabinet ----------

export function discoverThought(run: Run, id: string, notes: string[]) {
	const t = THOUGHT[id];
	run.cabinet ??= { found: [], slots: [], done: [] };
	if (!t || run.cabinet.found.includes(id) || run.cabinet.done.includes(id) || run.cabinet.slots.some((s) => s.id === id)) return;
	run.cabinet.found.push(id);
	notes.push(`💭 ${t.rare ? '✦ Rare thought' : 'New thought'}: **${t.name}** — ${t.found} (Thought Cabinet)`);
	log(run, `A thought took hold: ${t.name}. ${t.found}`);
}

function checkThoughts(run: Run, notes: string[]) {
	for (const t of CABINET) if (t.when && t.when(run)) discoverThought(run, t.id, notes);
}

/** Start carrying a thought. It takes travel days to become part of you. */
export function internalize(run: Run, id: string): boolean {
	const c = run.cabinet;
	if (!c || !c.found.includes(id) || c.slots.length >= CABINET_SLOTS) return false;
	c.found = c.found.filter((x) => x !== id);
	c.slots.push({ id, left: THOUGHT[id].days });
	return true;
}

export function forgetThought(run: Run, id: string) {
	const c = run.cabinet;
	if (!c) return;
	const i = c.slots.findIndex((s) => s.id === id);
	if (i >= 0) {
		c.slots.splice(i, 1);
		c.found.push(id);
	}
}

function thinkFor(run: Run, days: number, notes: string[]) {
	const c = run.cabinet;
	if (!c) return;
	for (const sl of [...c.slots]) {
		sl.left -= days;
		if (sl.left <= 0) {
			c.slots.splice(c.slots.indexOf(sl), 1);
			c.done.push(sl.id);
			const t = THOUGHT[sl.id];
			notes.push(`💡 Thought internalized: **${t.name}**. ${t.solution} (${t.doneText})`);
			log(run, `Internalized: ${t.name}. ${t.solution}`);
		}
	}
}

/** Spend downtime socializing with the local resident notable or an acquaintance. */
export function hangout(run: Run, notable?: Notable): boolean {
	if (run.phase !== 'map' && run.phase !== 'city') return false;
	if (!spendEnergy(run)) return false;
	const card = buildHangoutCard(run, notable);
	run.deck.unshift(card);
	if (run.phase === 'map') {
		run.phase = 'city';
		run.deckTotal = run.deck.length;
	} else run.deckTotal++;
	return true;
}

/** Visit a specific landmark or facility inside a city district. */
export function visitDistrictBuilding(run: Run, districtKind: DistrictKind, buildingId: string): boolean {
	if (run.phase !== 'map' && run.phase !== 'city') return false;
	if (!spendEnergy(run)) return false;
	const card = buildBuildingCard(run, districtKind, buildingId);
	run.deck.unshift(card);
	if (run.phase === 'map') {
		run.phase = 'city';
		run.deckTotal = run.deck.length;
	} else run.deckTotal++;
	return true;
}

export { executeCompanionTask as assignCompanionTask };
export { getDressRecommendation, applyRecommendedGarb as donRecommendedGarb };



/** Swipe right on someone at a venue: spend the visit on getting to know them. */
export function meetPerson(run: Run, venue: VenueId, p: Profile): boolean {
	if ((run.phase !== 'map' && run.phase !== 'city') || venueUsed(run, venue)) return false;
	if (!spendEnergy(run)) return false;
	markVenue(run, venue);
	run.deck.unshift(hangoutCard(run, p, venue));
	if (run.phase === 'map') {
		run.phase = 'city';
		run.deckTotal = run.deck.length;
	} else run.deckTotal++;
	return true;
}

/**
 * Fix states a journey should never be stuck in (from old saves, interrupted updates or bugs):
 * a town or road with no card to play, travel without a road, an "ended" journey with no ending.
 * Returns what was repaired, for the log.
 */
export function repairRun(run: Run): string[] {
	const fixed: string[] = [];
	if (!CITY[run.location]) {
		run.location = CITY[run.hero.home] ? run.hero.home : run.visited.find((id) => CITY[id]) ?? 'guangzhou';
		fixed.push('location');
	}
	run.deck = (run.deck ?? []).filter((c) => c && c.npc && c.left && c.right && typeof c.text === 'string');
	if (run.phase === 'travel' && (!run.route || !CITY[run.route.to])) {
		run.route = null;
		run.phase = 'map';
		run.deck = [];
		fixed.push('travel without a road');
	}
	if (run.phase === 'travel' && run.route && run.deck.length === 0) {
		// finish the road you were on
		run.location = run.route.to;
		if (!run.visited.includes(run.location)) run.visited.push(run.location);
		run.route = null;
		run.phase = 'map';
		fixed.push('empty road');
	}
	if (run.phase === 'city' && run.deck.length === 0) {
		run.phase = 'map';
		fixed.push('empty town');
	}
	if (run.phase === 'end' && !run.ending) {
		run.phase = 'map';
		fixed.push('ended without an ending');
	}
	if (!['map', 'city', 'travel', 'end'].includes(run.phase)) {
		run.phase = 'map';
		fixed.push('unknown phase');
	}
	if (run.phase === 'map' && availableRoutes(run).length === 0) {
		const home = CITY[run.hero.home] ? run.hero.home : 'guangzhou';
		if (home !== run.location) {
			run.location = home;
			fixed.push('stranded');
		}
	}
	for (const s of STATS) if (!Number.isFinite(run.stats[s])) {
		run.stats[s] = 50;
		fixed.push(s);
	}
	run.deckTotal = Math.max(run.deckTotal ?? 0, run.deck.length);
	if (fixed.length) log(run, `(The road was untangled: ${fixed.join(', ')}.)`);
	return fixed;
}

// ---------- life goal ----------

/** Has the traveller just fulfilled their life goal? */
export function checkGoal(run: Run, notes: string[]) {
	const g = run.goal && GOAL[run.goal.id];
	if (!g || run.goal!.done !== undefined) return;
	const [cur, target] = g.progress(run);
	if (cur < target) return;
	run.goal!.done = run.day;
	applyFx(run, { renown: 20, fortune: 10 }, []);
	shiftMind(run, 20);
	notes.push(`🌟 **Life goal fulfilled: ${g.name}.** ${g.desc} Whatever happens now, this was worth it.`);
	log(run, `Fulfilled a life's wish: ${g.name}.`);
}

// ---------- undo & rewind ----------

/** A snapshot without the snapshots inside it (so they don't nest). */
function snapshot(run: Run): string {
	const { undo: _u, restorePoints: _r, ...rest } = run;
	return serialize(rest as Run);
}
const stayKey = (run: Run) => `${run.location}@${run.flags.stay ?? 0}`;

/** Can you take back your last swipe? Once per city stay (any number of times on Pilgrimage). */
export const canUndo = (run: Run) => !!run.undo && (run.difficulty === 'pilgrim' || run.flags.undoUsed !== stayKey(run));

/** Call just before a choice: remembers the moment so it can be taken back. */
export function rememberForUndo(run: Run) {
	if (run.phase === 'end') return;
	run.undo = snapshot(run);
}

/** Take back the last swipe. Returns the earlier run, or null. */
export function undoLast(run: Run): Run | null {
	if (!canUndo(run)) return null;
	const back = parseRun(run.undo!);
	if (!back) return null;
	back.restorePoints = run.restorePoints;
	back.undo = null;
	back.flags.undoUsed = stayKey(back);
	log(back, '(You took a moment to reconsider.)');
	return back;
}

/** On arriving in a city: keep a restore point (the last three). */
export function keepRestorePoint(run: Run) {
	run.restorePoints = [snapshot(run), ...(run.restorePoints ?? [])].slice(0, 3);
}

export function restorePointsOf(run: Run): { i: number; day: number; city: string }[] {
	return (run.restorePoints ?? []).map((s, i) => {
		try {
			const r = JSON.parse(s) as Run;
			return { i, day: r.day, city: cityName(CITY[r.location], r.year) };
		} catch {
			return { i, day: 0, city: '?' };
		}
	});
}

/** Go back to an earlier city arrival. */
export function rewindTo(run: Run, i: number): Run | null {
	const s = run.restorePoints?.[i];
	const back = s ? parseRun(s) : null;
	if (!back) return null;
	back.restorePoints = run.restorePoints!.slice(i);
	back.undo = null;
	log(back, `(Rewound to day ${back.day} in ${cityName(CITY[back.location], back.year)}.)`);
	return back;
}
