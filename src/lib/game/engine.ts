import { Rng } from '#lib/rng';
import { CULTURES, CULTURE_IDS, makeName, type CultureId, type Gender } from '#lib/data/cultures';
import { CITIES, CITY, cityExists, cityName, routesFrom, shortestDays, shortestPath } from '#lib/data/world';
import { PROFESSIONS, STATS, TRAITS, type Fx } from '#lib/data/traits';
import { ITEMS, MOUNT_NAMES } from '#lib/data/items';
import { DIFFICULTY, HARDSHIP, scoreMult } from '#lib/data/difficulty';
import { CULTURE_FAITH, IDEAL_IDS } from '#lib/data/faiths';
import { rollAssignment } from './assignments';
import { hangoutCard, type Profile } from './people';
import { hearLanguage } from './langs';
import { baseVoices } from '#lib/data/voices';
import { capOf, perksOf, hasPerk } from './mods';
import { startingSkills } from '#lib/data/skills';
import { GOAL, GOALS } from '#lib/data/goals';
import { seedWorld } from './events';
import { CAMPAIGN } from '#lib/content/index';
import { energyMax, markVenue, venueUsed, venuesHere } from './market';
import type { VenueId } from '#lib/data/venues';
import { type Notable } from '#lib/data/notables';
import { buildHangoutCard } from './cards/hangout';
import { buildBuildingCard } from './cards/districts';
import type { DistrictKind } from '#lib/data/districts';
import { assignCompanionTask as executeCompanionTask } from './companions';
import { donRecommendedGarb as applyRecommendedGarb, getDressRecommendation } from './dress';
import { venueCard } from '#lib/game/cards/index';
import type { Ancestor, Card, Hero, MountKind, Run, Tie, Venture } from './types';

import {
	CAP_STATS,
	MIND_START,
	here,
	log,
	clamp,
	cap,
	seedFor,
	track,
	knownSecrets,
	karmaLabel,
	standingLabel,
	addItem,
	removeItem,
	setMount,
	hurtMount,
	dropOverflow,
	rescue,
	applyFx,
	tickInventions,
	sponsorInvention,
	shiftMind,
	mindAfter,
	discoverThought,
	checkThoughts,
	internalize,
	forgetThought,
	thinkFor,
	checkGoal,
	ensureRivalPerson
} from './engine/utils';
import { checkEnd, clearEnding, endingCause, goalEpilogue, retire, retireIntoGoal, score, settle, statEnding, victory, type EndingCause } from './engine/endings';
import { MIGRATIONS, SCHEMA, compressSave, consumeSaveToast, decompressSave, exportRun, importRun, load, parseRun, repairRun, save, serialize, serializePlain } from './engine/saves';
import { canUndo, keepRestorePoint, rememberForUndo, restorePointsOf, rewindTo, snapshot, undoLast } from './engine/undo';
import { advance, availableRoutes, checkRival, continueEndless, depart, resolveQuests, rivalPosition, skipCity, wages, type RouteInfo } from './engine/arrival';
import { bank, choose, dismiss, dropItem, romanceStep, useItem, type Resolution } from './engine/choose';

export {
	CAP_STATS,
	MIND_START,
	here,
	log,
	clamp,
	cap,
	seedFor,
	track,
	knownSecrets,
	karmaLabel,
	standingLabel,
	addItem,
	removeItem,
	setMount,
	hurtMount,
	dropOverflow,
	rescue,
	applyFx,
	tickInventions,
	sponsorInvention,
	shiftMind,
	mindAfter,
	discoverThought,
	checkThoughts,
	internalize,
	forgetThought,
	thinkFor,
	checkGoal,
	ensureRivalPerson,
	checkEnd,
	clearEnding,
	endingCause,
	goalEpilogue,
	retire,
	retireIntoGoal,
	score,
	settle,
	statEnding,
	victory,
	type EndingCause,
	MIGRATIONS,
	SCHEMA,
	compressSave,
	consumeSaveToast,
	decompressSave,
	exportRun,
	importRun,
	load,
	parseRun,
	repairRun,
	save,
	serialize,
	serializePlain,
	canUndo,
	keepRestorePoint,
	rememberForUndo,
	restorePointsOf,
	rewindTo,
	snapshot,
	undoLast,
	advance,
	availableRoutes,
	checkRival,
	continueEndless,
	depart,
	resolveQuests,
	rivalPosition,
	skipCity,
	wages,
	type RouteInfo,
	bank,
	choose,
	dismiss,
	dropItem,
	romanceStep,
	useItem,
	type Resolution
};

export { executeCompanionTask as assignCompanionTask };
export { getDressRecommendation, applyRecommendedGarb as donRecommendedGarb };

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
		apathy: 0,
		warehouse: {}
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
	ensureRivalPerson(run);
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

export { nextAssignment } from './engine/arrival';

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

// ---------- city venues & actions ----------

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
