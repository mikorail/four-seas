// The market: outfits, curios with a far-away best price, route charts and riddle maps — all venue-gated.
import { capOf } from './mods';
import { langLevel } from './langs';
import { fairIn } from '#lib/data/fairs';
import { monthOf } from './economy';
import { hashString } from '#lib/rng';
import { CULTURES, type CultureId } from '#lib/data/cultures';
import { CITY, SECRETS, cityName } from '#lib/data/world';
import { ITEMS, isGood } from '#lib/data/items';
import { CURIO, CURIOS, OUTFITS, RIDDLES, type Outfit } from '#lib/data/market';
import { faithOfCity } from '#lib/data/faiths';
import { venuesOf, type Venue } from '#lib/data/venues';
import { DAMAGE, deathAt, disasterAt } from './events';
import { addItem, log, removeItem } from './engine';
import { EXTRA_BAGS, maxExtraBags, syncGrid } from './bag';
import { dateOf, festivalsOn } from './calendar';
import { isWarZone } from './events';
import { getTimeInfo } from './time';
import { culturalStanding } from './mods';
import type { Run } from './types';

export function isNightMarket(run: Run): boolean {
	return getTimeInfo(run).stage === 'night';
}

const noise = (key: string) => (hashString(key) % 10007) / 10007;
const stay = (run: Run) => `${run.location}@${run.flags.stay ?? 0}`;

export function venuesHere(run: Run): Venue[] {
	const city = CITY[run.location];
	const fest = festivalsOn(dateOf(run, run.day), city.culture, faithOfCity(city.id, city.culture) === 'muslim').filter((f) => !f.fast)[0];
	const dis = disasterAt(run, city.id);
	const mourning = deathAt(run, city.id);
	const fair = fairIn(city.id, monthOf(run), run.year);
	let list = venuesOf(city, run.year, mourning?.data?.popular ? null : (fest?.name ?? null));
	if (fair) {
		// the fair turns whatever market there is into a great bazaar (or sets one up in the snow)
		const glyph = '🎪';
		if (list.some((v) => v.id === 'bazaar' || v.id === 'market')) list = list.map((v) => (v.id === 'bazaar' || v.id === 'market' ? { ...v, id: 'bazaar', name: fair.name, glyph, blurb: fair.blurb } : v));
		else list = [...list, { id: 'bazaar', name: fair.name, glyph, blurb: fair.blurb }];
	}
	return list.map((v) => {
		const hit = dis && DAMAGE[dis.kind].find((d) => d.venue === v.id && (dis.severe || !d.closed));
		return hit ? { ...v, damaged: hit.text, closed: dis!.severe ? hit.closed : false } : v;
	});
}
export const venueDamage = (run: Run, id: string) => venuesHere(run).find((v) => v.id === id)?.damaged;

const BASE_ENERGY: Record<string, number> = { pilgrim: 4, courier: 3, ronin: 3, legend: 2 };

/** How many things you can do per city stay (venue visits, opening the market). */
export function energyMax(run: Run): number {
	const f = run.flags.energyMax;
	if (f === 'unlimited') return Infinity;
	let m = typeof f === 'number' ? f : (BASE_ENERGY[run.difficulty] ?? 3);
	if (run.stats.vigor >= 70) m += 1;
	if (run.stats.vigor < 25) m -= 1;
	if (run.flags.tidy === true && run.hero.traits.includes('meticulous')) m += 1;
	return Math.max(1, m);
}

export const hasMarket = (run: Run) => venuesHere(run).some((v) => v.id === 'market' || v.id === 'bazaar');
export const venueUsed = (run: Run, id: string) => run.flags['v:' + id] === stay(run);
export const markVenue = (run: Run, id: string) => (run.flags['v:' + id] = stay(run));

export interface Stock {
	outfits: Outfit[];
	curios: string[];
	charts: string[];
	riddles: string[];
	supplies: string[];
}

export const SUPPLY_STOCK: Record<string, number> = {
	rations: 3,
	medicine: 2,
	'fever-tonic': 2,
	incense: 2,
	'ascetic-tea': 2,
	'calming-draught': 2,
	'joss-paper': 2,
	'alms-pouch': 2,
	'rice-wine': 2,
	'ginseng-tonic': 1,
	charm: 1,
	papers: 1,
	lantern: 1,
	umbrella: 1,
	'forged-pass': 1,
	'skeleton-key': 1,
	'smoke-pellets': 2,
	opium: 2,
	'stolen-relic': 1
};

export function initialStock(run: Run, id: string): number {
	if (OUTFITS[id]) return 1;
	if (id.startsWith('chart-')) return 1;
	if (id.startsWith('treasure-map-')) return 1;
	if (CURIO[id]) return 1;
	if (SUPPLY_STOCK[id] !== undefined) return SUPPLY_STOCK[id];
	return 1;
}

const stockFlagKey = (run: Run, id: string) => `stock:${stay(run)}:${id}`;

export function stockOf(run: Run, id: string): number {
	if (OUTFITS[id] && run.bag.includes(id)) return 0;
	if (id.startsWith('chart-')) {
		const secId = id.slice(6);
		if (run.flags['secret:' + secId]) return 0;
	}
	if (id.startsWith('treasure-map-')) {
		const ridIdx = id.slice(13);
		if (run.bag.includes(id) || run.flags['treasure:' + ridIdx]) return 0;
	}
	if (CURIO[id] && run.bag.includes(id)) return 0;

	const bought = typeof run.flags[stockFlagKey(run, id)] === 'number' ? (run.flags[stockFlagKey(run, id)] as number) : 0;
	return Math.max(0, initialStock(run, id) - bought);
}

function recordPurchase(run: Run, id: string) {
	const k = stockFlagKey(run, id);
	const cur = typeof run.flags[k] === 'number' ? (run.flags[k] as number) : 0;
	run.flags[k] = cur + 1;
}

/** What the market here sells this month. Night markets deal in contraband, fences, and shady curios. */
export function marketStock(run: Run): Stock {
	const city = CITY[run.location];
	const big = venuesHere(run).some((v) => v.id === 'bazaar');
	const month = Math.floor(run.day / 30);
	const roll = (k: string) => noise(`${run.seed}:${city.id}:${month}:${k}`);
	const night = isNightMarket(run);

	const outfits = night
		? Object.values(OUTFITS).filter((o) => ['pirate-garb', 'ronin-rags', 'desert-robes', 'local-dress'].includes(o.id) && roll(o.id) < 0.7)
		: Object.values(OUTFITS).filter((o) => {
				if ((o.from ?? 0) > run.year || (o.until ?? 9999) < run.year) return false;
				if (o.id === 'local-dress') return true;
				if (o.sold !== 'any' && !o.sold.includes(city.culture)) return false;
				return big ? roll(o.id) < 0.8 : o.sold === 'any' && roll(o.id) < 0.45;
		  });

	// during a great fair, curios from every corner of the world are on the tables
	const fair = fairHere(run);
	const curios = CURIOS.filter((c) => (night || fair || c.from.includes(city.culture)) && roll(c.id) < (night ? 0.75 : fair ? 0.7 : big ? 0.95 : 0.6)).map((c) => c.id);
	const charts = (big || night) ? SECRETS.filter((s) => !run.flags['secret:' + s.id] && s.edges.split(/\s+/).some((e) => e.replace(/-x$/, '').split('-').some((x) => CITY[x] && CITY[x].culture === city.culture)) && roll(s.id) < (night ? 0.85 : 0.7)).map((s) => `chart-${s.id}`) : [];
	const riddles = big ? RIDDLES.map((_, i) => `treasure-map-${i}`).filter((id, i) => RIDDLES[i].answer !== city.id && !run.flags['treasure:' + i] && roll(id) < 0.18).slice(0, 2) : [];

	let supplies: string[];
	if (night) {
		const nightSupplies = [
			'forged-pass',
			'skeleton-key',
			'smoke-pellets',
			'opium',
			'stolen-relic',
			'papers',
			'hunting-knife',
			'rice-wine',
			'lantern',
			'rations'
		];
		supplies = nightSupplies.filter((id) => ITEMS[id] && roll(id) < 0.85);
		if (!supplies.includes('smoke-pellets')) supplies.unshift('smoke-pellets');
		if (!supplies.includes('forged-pass') && roll('fp') < 0.65) supplies.unshift('forged-pass');
	} else {
		const allSupplies = [
			'rations',
			'medicine',
			'fever-tonic',
			'incense',
			'ascetic-tea',
			'calming-draught',
			'joss-paper',
			'alms-pouch',
			'rice-wine',
			'ginseng-tonic',
			'charm',
			'papers',
			'lantern',
			'umbrella'
		];
		supplies = allSupplies.filter((id) => ITEMS[id] && (big ? roll(id) < 0.85 : roll(id) < 0.55));
		if (!supplies.includes('rations')) supplies.unshift('rations');
	}

	return { outfits, curios, charts, riddles, supplies };
}

const mood = (run: Run) => (1 - (run.standing?.[CITY[run.location].culture] ?? 0) / 400) * (1 - langLevel(run, CITY[run.location].culture) * 0.04) * (venuesHere(run).some((v) => (v.id === 'market' || v.id === 'bazaar') && v.damaged) ? 1.5 : 1);
export const priceOf = (run: Run, id: string) => {
	const o = OUTFITS[id];
	const base = o ? o.price : (ITEMS[id]?.price ?? 0);
	let mult = mood(run) * (0.9 + noise(`${run.seed}:${run.location}:${id}`) * 0.3);

	// Factions impact
	const factions = run.factions ?? { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 };
	const guildStanding = (factions.guild ?? 0) / 100;
	mult *= 1 - guildStanding * 0.15; // Guild rep gives up to 15% discount, hostility +15%

	const isContraband = ['papers', 'lockpicks', 'sword', 'dagger', 'smoke-powder', 'rice-wine', 'forged-pass', 'skeleton-key', 'smoke-pellets', 'opium', 'stolen-relic'].includes(id);
	if (isContraband && (factions.outlaw ?? 0) >= 20) {
		mult *= 0.75; // Greenwood brotherhood discount
	}

	if (isNightMarket(run)) {
		if (isContraband) mult *= 0.9;
		if ((factions.crown ?? 0) >= 30) mult *= 1.2; // Crown informants pay surcharges in the alleys
	}

	const isHolyOrRemedy = ['incense', 'fever-tonic', 'ginseng-tonic', 'joss-paper', 'charm', 'medicine'].includes(id);
	if (isHolyOrRemedy && (factions.faith ?? 0) >= 20) {
		mult *= 0.85; // Monastic hospitality discount
	}

	// War / Invasion price spike
	if (isWarZone(run, run.location)) {
		const isEssential = ['rations', 'medicine', 'fever-tonic', 'ginseng-tonic', 'sword', 'dagger', 'tools', 'lantern'].includes(id);
		if (isEssential) {
			mult *= 1.85; // Severe wartime shortage price hike
		}
	}

	// Haggler trait discount
	if (run.hero.traits.includes('haggler')) {
		mult *= 0.82;
	}

	// Cultural affinity modifier (-20% to +20%)
	const cultAff = culturalStanding(run, CITY[run.location].culture);
	mult *= 1 - cultAff.score * 0.04;

	// Imperial commercial charter patent discount
	if (run.completedInventions?.includes('commercial-charter') || run.bag.includes('commercial-charter')) {
		mult *= 0.85;
	}

	return Math.max(1, Math.round(base * mult));
};

/** What a curio fetches here. Collectors where it is prized pay 2–3×; at home it is worth little. */
export function curioValue(run: Run, id: string, cityId = run.location): number {
	const c = CURIO[id];
	if (!c) return Math.round((ITEMS[id]?.price ?? 0) * 0.4);
	const cul = CITY[cityId].culture;
	let m = c.prized.includes(cul) ? 2.2 + noise(`${run.seed}:${cityId}:${id}`) * 0.8 : c.from.includes(cul) ? 0.6 : 1;
	if (cityId === run.location && fairHere(run)) m *= 1.3; // collectors from everywhere
	if (isWarZone(run, cityId)) {
		m *= 0.75; // Fleeing folk liquidate valuables cheaply
	}
	return Math.round(c.price * m);
}

export const prizedWhere = (id: string) => CURIO[id]?.prized.map((c) => CULTURES[c].label) ?? [];

export function buy(run: Run, id: string): string | null {
	if (stockOf(run, id) <= 0) return 'Sold out.';
	const p = priceOf(run, id);
	if (run.stats.silver <= p) return 'Not enough silver.';
	if (OUTFITS[id]) {
		if (!addItem(run, id)) return 'No room in your bag.';
		run.stats.silver -= p;
		recordPurchase(run, id);
		wear(run, id);
		return null;
	}
	if (id.startsWith('chart-')) {
		const sec = SECRETS.find((s) => 'chart-' + s.id === id);
		if (!sec) return 'Unknown chart.';
		run.stats.silver -= p;
		recordPurchase(run, id);
		run.flags['secret:' + sec.id] = true;
		log(run, `Bought a chart: ${sec.name}.`);
		return null;
	}
	if (!addItem(run, id)) return 'No room in your bag.';
	run.stats.silver -= p;
	recordPurchase(run, id);
	log(run, `Bought ${ITEMS[id]?.name.toLowerCase() ?? id} in ${cityName(CITY[run.location], run.year)}.`);
	return null;
}

export function sellValue(run: Run, id: string): number {
	if (ITEMS[id]?.kind === 'curio') return curioValue(run, id);
	if (isGood(id) || ITEMS[id]?.kind === 'relic') return 0; // goods go to merchants (cards), relics are priceless
	return Math.max(1, Math.round((ITEMS[id]?.price ?? 0) * 0.5));
}

export function sell(run: Run, id: string): number {
	const v = sellValue(run, id);
	if (!v || !run.bag.includes(id)) return 0;
	if (run.outfit?.id === id) wear(run, 'none');
	removeItem(run, id);
	run.stats.silver = Math.min(capOf(run, 'silver') - 1, run.stats.silver + v);
	const c = CURIO[id];
	if (c && c.prized.includes(CITY[run.location].culture)) log(run, `Sold the ${c.name.toLowerCase()} to a delighted collector for ${v} silver.`);
	else if (OUTFITS[id]) log(run, `Sold the ${OUTFITS[id].name.toLowerCase()} for ${v} silver.`);
	return v;
}

export function wear(run: Run, id: string | 'none') {
	if (id === 'none' || !OUTFITS[id]) {
		run.outfit = undefined;
		return;
	}
	const cul = CITY[run.location]?.culture ?? run.hero.culture;
	run.outfit = { id, culture: cul };
	log(run, `Now dressed as: ${OUTFITS[id].name.toLowerCase()}.`);
}

/** Does your outfit pass you off as a local among people of `culture`? */
export function passesAsLocal(run: Pick<Run, 'outfit'>, culture: CultureId): boolean {
	const o = run.outfit && OUTFITS[run.outfit.id];
	if (!o?.local) return false;
	return o.local === 'sold' ? run.outfit!.culture === culture : o.local.includes(culture);
}

export const riddleOf = (itemId: string) => {
	const m = /^treasure-map-(\d+)$/.exec(itemId);
	return m ? { i: Number(m[1]), ...RIDDLES[Number(m[1])] } : null;
};

/** Guess where the riddle map leads. Right → a treasure quest; wrong → the map is ruined. */
export function solveRiddle(run: Run, itemId: string, guess: string): boolean {
	const r = riddleOf(itemId);
	if (!r || !run.bag.includes(itemId)) return false;
	run.flags['treasure:' + r.i] = true;
	if (guess !== r.answer) {
		removeItem(run, itemId);
		log(run, `Followed the riddle map toward ${cityName(CITY[guess], run.year)} in my head — and realised too late it was wrong. The map is useless now.`);
		return false;
	}
	const relics = ['kalachakra', 'gold-idol', 'singing-seed', 'immortal-peach', 'hang-tuah-kris'].filter((x) => ITEMS[x] && !run.bag.includes(x));
	const reward = relics[hashString(run.seed + r.i) % Math.max(1, relics.length)];
	if (run.quests.length < 4)
		run.quests.push({
			id: 'treasure-' + r.i,
			kind: 'map',
			title: `Dig up the treasure at ${cityName(CITY[r.answer], run.year)}`,
			giver: 'a riddle map',
			from: run.location,
			to: r.answer,
			item: itemId,
			due: run.day + 400,
			reward: { silver: 22, renown: 8 },
			rewardItem: reward,
			text: 'Under the third stone from the old gate: a chest, and something older than the chest.'
		});
	log(run, `Solved the riddle map: it points to ${cityName(CITY[r.answer], run.year)}.`);
	return true;
}

/** Strap on another bag. Saddlebags need a mount; one extra bag on foot, two with a mount. */
export function buyBag(run: Run, kind: string): string | null {
	const e = EXTRA_BAGS[kind];
	if (!e) return 'Unknown bag.';
	if (e.mount && !run.mount) return 'You need a mount for saddlebags.';
	run.extraBags ??= [];
	if (run.extraBags.length >= maxExtraBags(run)) return run.mount ? 'You cannot carry any more bags.' : 'On foot you can only carry one extra bag.';
	const p = Math.max(1, Math.round(e.price * mood(run)));
	if (run.stats.silver <= p) return 'Not enough silver.';
	run.stats.silver -= p;
	run.extraBags.push(kind);
	syncGrid(run);
	log(run, `Bought a ${e.name.toLowerCase()}.`);
	return null;
}
export const bagPrice = (run: Run, kind: string) => Math.max(1, Math.round(EXTRA_BAGS[kind].price * mood(run)));

/** The great fair on in this city right now, if any. */
export function fairHere(run: Run) {
	return fairIn(run.location, monthOf(run), run.year);
}
