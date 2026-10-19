// A living world: typhoons that move, plagues that spread, wars that close borders.
import { Rng } from '#lib/rng';
import { CULTURES, type CultureId } from '#lib/data/cultures';
import { CITIES, CITY, EDGES, cityExists, cityName, edgeExists, type Edge } from '#lib/data/world';
import { monthOf } from './economy';
import type { Run } from './types';

export interface WorldEvent {
	id: string;
	kind: 'typhoon' | 'plague' | 'war' | 'caravan' | 'omen' | 'disaster' | 'death';
	label: string;
	start: number;
	end: number;
	cities: string[]; // plague: infected cities; typhoon: track; caravan: route stops; omen: visible cities
	sides?: [CultureId, CultureId]; // war
	lastSpread?: number;
	data?: {
		caravanId?: string;
		omenType?: 'comet' | 'red-tide' | 'eclipse' | 'aurora';
		disaster?: DisasterKind;
		epicenter?: string;
		figure?: string; // who died
		popular?: boolean;
		royal?: boolean;
		cause?: string;
		speed?: number;
	};
}

export const HISTORIC_CARAVANS: { id: string; label: string; cities: string[] }[] = [
	{ id: 'caravan-kirghiz', label: 'Kirghiz Nomadic Aul', cities: ['tashkent', 'kashgar', 'samarkand', 'turpan'] },
	{ id: 'caravan-hajj', label: 'Great Hajj Pilgrim Caravan', cities: ['baghdad', 'damascus', 'cairo', 'mecca'] },
	{ id: 'caravan-tea-horse', label: 'Ancient Tea-Horse Caravan', cities: ['chengdu', 'dali', 'lhasa'] },
	{ id: 'caravan-spice-flotilla', label: 'Bugis Spice Flotilla', cities: ['malacca', 'aceh', 'batavia', 'brunei'] }
];

export const HISTORIC_OMENS: { omenType: 'comet' | 'red-tide' | 'eclipse' | 'aurora'; label: string; glyph: string; cities: string[]; news: string }[] = [
	{
		omenType: 'comet',
		label: 'The Great Broom Star (Comet)',
		glyph: '☄️',
		cities: ['samarkand', 'beijing', 'isfahan', 'delhi', 'kyoto', 'baghdad', 'constantinople'],
		news: '☄️ **The Great Broom Star** blazes across the heavens: astrologers debate and courtiers tremble!'
	},
	{
		omenType: 'red-tide',
		label: 'Phosphorescent Red Tide (Sea of Ghosts)',
		glyph: '🌊',
		cities: ['canton', 'malacca', 'batavia', 'nagasaki', 'manila', 'brunei'],
		news: '🌊 **Phosphorescent Red Tide** glows emerald in the southern straits: sailors whisper of sea spirits!'
	},
	{
		omenType: 'eclipse',
		label: 'Solar Eclipse (Dragon Swallowing the Sun)',
		glyph: '🌑',
		cities: ['beijing', 'nara', 'kyoto', 'seoul', 'edo', 'lhasa'],
		news: '🌑 **Solar Eclipse**: midday turns to night; bronze gongs resound in imperial capitals!'
	},
	{
		omenType: 'aurora',
		label: 'Altai Sky-Fire (Aurora)',
		glyph: '✨',
		cities: ['turpan', 'kashgar', 'tashkent', 'samarkand'],
		news: '✨ Shimmering ribbons of **Altai Sky-Fire** dance above the northern mountain peaks!'
	}
];

const HISTORIC_WARS: { from: number; to: number; sides: [CultureId, CultureId]; label: string }[] = [
	{ from: 1592, to: 1598, sides: ['korean', 'japanese'], label: 'The Imjin War' },
	{ from: 1618, to: 1662, sides: ['han', 'steppe'], label: 'The Manchu conquest' },
	{ from: 1532, to: 1555, sides: ['ottoman', 'persian'], label: 'Ottoman–Safavid war' },
	{ from: 1578, to: 1590, sides: ['ottoman', 'persian'], label: 'Ottoman–Safavid war' },
	{ from: 1623, to: 1639, sides: ['ottoman', 'persian'], label: 'Ottoman–Safavid war' },
	{ from: 1759, to: 1767, sides: ['siamese', 'siamese'], label: 'Burmese–Siamese war' },
	{ from: 1839, to: 1842, sides: ['european', 'han'], label: 'The First Opium War' },
	{ from: 1856, to: 1860, sides: ['european', 'han'], label: 'The Second Opium War' },
	{ from: 1883, to: 1885, sides: ['european', 'viet'], label: 'The Sino-French War' },
	{ from: 1894, to: 1895, sides: ['japanese', 'han'], label: 'The First Sino-Japanese War' }
];

const neighbours = (id: string, year: number, sea?: boolean) =>
	EDGES.filter((e) => (e.a === id || e.b === id) && edgeExists(e, year) && (sea === undefined || (e.mode === 'sea') === sea)).map((e) => (e.a === id ? e.b : e.a));

export type DisasterKind = 'earthquake' | 'flood' | 'fire' | 'storm' | 'landslide' | 'volcano' | 'tsunami' | 'sandstorm' | 'blizzard' | 'locusts' | 'famine';

/** What can happen where. `months` (0-based) restricts the season; `reach` is how far it spreads (in road hops). */
export const DISASTERS: Record<DisasterKind, { glyph: string; names: string[]; cultures: CultureId[]; months?: number[]; ports?: boolean; reach: number; days: [number, number]; slow: number; blurb: string }> = {
	earthquake: { glyph: '🌋', names: ['The Great Earthquake', 'The Earth Dragon Turns', 'The Night the Ground Opened'], cultures: ['japanese', 'persian', 'ottoman', 'han', 'malay', 'tibetan', 'european'], reach: 1, days: [25, 50], slow: 1.4, blurb: 'Walls down, roads cracked, aftershocks every night.' },
	flood: { glyph: '🌊', names: ['The Yellow Flood', 'The River Breaks Its Banks', 'The Year of Water'], cultures: ['han', 'viet', 'siamese', 'indian', 'malay', 'korean'], months: [5, 6, 7, 8], reach: 2, days: [20, 45], slow: 1.6, blurb: 'Fields under water, bridges gone, boats in the streets.' },
	fire: { glyph: '🔥', names: ['The Great Fire', 'The Burning of the Wards', 'The Red Night'], cultures: ['japanese', 'korean', 'han', 'european', 'ottoman', 'siamese'], months: [0, 1, 2, 10, 11], reach: 1, days: [12, 30], slow: 1.2, blurb: 'Whole districts ash. The wind keeps changing.' },
	storm: { glyph: '🌪', names: ['The Cyclone', 'The Black Squall', 'The Storm of the Century'], cultures: ['indian', 'swahili', 'european', 'malay', 'pacific'], ports: true, months: [4, 5, 9, 10], reach: 2, days: [8, 18], slow: 1.5, blurb: 'Ships thrown on the quays. Every roof missing tiles.' },
	landslide: { glyph: '⛰', names: ['The Mountain Fell', 'The Great Landslide'], cultures: ['tibetan', 'han', 'japanese', 'indian', 'persian'], months: [5, 6, 7, 8], reach: 1, days: [15, 35], slow: 1.7, blurb: 'The pass is buried. Porters dig with their hands.' },
	volcano: { glyph: '🌋', names: ['The Fire Mountain Wakes', 'Ash Over the Sun'], cultures: ['malay', 'japanese', 'pacific'], reach: 2, days: [30, 60], slow: 1.4, blurb: 'Ash falls like grey snow. The harvest will fail.' },
	tsunami: { glyph: '🌊', names: ['The Wave', 'The Sea Came Inland'], cultures: ['japanese', 'malay', 'indian', 'pacific'], ports: true, reach: 2, days: [15, 30], slow: 1.5, blurb: 'The sea drew back, then returned as a wall.' },
	sandstorm: { glyph: '🌫', names: ['The Black Buran', 'The Red Wind of the Desert'], cultures: ['persian', 'steppe', 'ottoman'], reach: 2, days: [6, 14], slow: 1.8, blurb: 'Caravans lost within sight of the walls.' },
	blizzard: { glyph: '❄', names: ['The White Death', 'The Long Blizzard'], cultures: ['steppe', 'tibetan', 'korean', 'european'], months: [11, 0, 1, 2], reach: 2, days: [10, 25], slow: 1.8, blurb: 'Snow to the eaves. Herds freezing standing up.' },
	locusts: { glyph: '🦗', names: ['The Locust Cloud', 'The Year of Locusts'], cultures: ['indian', 'persian', 'ottoman', 'han', 'swahili'], months: [3, 4, 5, 6, 7], reach: 3, days: [25, 45], slow: 1, blurb: 'The sky goes dark at noon. By evening nothing green is left.' },
	famine: { glyph: '🍂', names: ['The Hungry Year', 'The Great Dearth'], cultures: ['han', 'indian', 'korean', 'viet', 'persian', 'european'], reach: 3, days: [60, 120], slow: 1.1, blurb: 'Grain at ten times its price. Families on the road.' }
};

/** Which town buildings each disaster wrecks: `closed` cannot be visited at all, otherwise it limps on, worse than usual. */
export const DAMAGE: Record<DisasterKind, { venue: string; closed?: boolean; text: string }[]> = {
	earthquake: [{ venue: 'inn', text: 'half the roof came down' }, { venue: 'bridge', closed: true, text: 'collapsed into the river' }, { venue: 'palace', text: 'cracked from gate to throne room' }, { venue: 'temple', text: 'the pagoda leans' }],
	flood: [{ venue: 'market', text: 'stalls under water' }, { venue: 'bazaar', text: 'goods ruined by the water' }, { venue: 'bridge', closed: true, text: 'swept away' }, { venue: 'inn', text: 'mud to the knees in every room' }],
	fire: [{ venue: 'inn', text: 'burnt to the beams' }, { venue: 'market', closed: true, text: 'a field of ash' }, { venue: 'bazaar', text: 'half the alleys burnt out' }, { venue: 'academy', text: 'the library is gone' }],
	storm: [{ venue: 'harbor', closed: true, text: 'wrecks block the channel' }, { venue: 'inn', text: 'shutters gone, rain in every room' }, { venue: 'market', text: 'awnings ripped away' }],
	landslide: [{ venue: 'inn', text: 'cut off by the slide' }, { venue: 'square', text: 'buried in mud' }],
	volcano: [{ venue: 'market', text: 'nothing to sell but ash' }, { venue: 'inn', text: 'grey dust in every bowl' }, { venue: 'temple', text: 'packed with the frightened' }],
	tsunami: [{ venue: 'harbor', closed: true, text: 'gone — the quay, the boats, the warehouses' }, { venue: 'market', closed: true, text: 'washed inland' }, { venue: 'inn', text: 'the ground floor is the sea’s now' }],
	sandstorm: [{ venue: 'inn', text: 'sand drifts to the windowsills' }, { venue: 'market', text: 'half the merchants never arrived' }],
	blizzard: [{ venue: 'market', closed: true, text: 'snowed under' }, { venue: 'inn', text: 'out of firewood' }],
	locusts: [{ venue: 'market', text: 'no grain at any price' }],
	famine: [{ venue: 'market', text: 'empty stalls and armed guards' }, { venue: 'inn', text: 'serving thin gruel at a fortune a bowl' }]
};

/** Roads a disaster cuts (only at the epicenter). Never strands you — the route list falls back to all roads. */
export function disasterCloses(run: Pick<Run, 'world'>, a: string, b: string, mode: string): WorldEvent | null {
	for (const e of run.world ?? []) {
		if (e.kind !== 'disaster' || !e.data?.disaster || (e.data.epicenter !== a && e.data.epicenter !== b)) continue;
		const k = e.data.disaster;
		const shut = (['landslide', 'blizzard', 'sandstorm', 'earthquake'].includes(k) && mode === 'land') || (k === 'flood' && mode !== 'sea') || ((k === 'tsunami' || k === 'storm') && mode === 'sea');
		if (shut) return e;
	}
	return null;
}

const FIGURES: { title: (ruler: string) => string; royal: boolean; palace?: boolean }[] = [
	{ title: (r) => r, royal: true, palace: true },
	{ title: () => 'the Crown Prince', royal: true, palace: true },
	{ title: () => 'the Queen Mother', royal: true, palace: true },
	{ title: () => 'the old Governor', royal: false },
	{ title: () => 'the Abbot of the great temple', royal: false },
	{ title: () => 'the city’s most famous courtesan-poet', royal: false },
	{ title: () => 'the old general who saved the city once', royal: false },
	{ title: () => 'the richest merchant in the city', royal: false }
];
const CAUSES = ['in their sleep', 'after a short illness', 'of a sudden fever', 'in a fall from a horse', 'of poison, people whisper', 'of old age, at last'];

/** A notable figure dies in `city` — beloved or hated — and the city reacts. */
export function startDeath(run: Run, rng: Rng, cityId?: string, cause?: string): string | null {
	const pool = CITIES.filter((c) => cityExists(c, run.year) && !c.secret);
	const city = cityId ? CITY[cityId] : rng.pick(pool);
	if (!city || (run.world ?? []).some((w) => w.kind === 'death' && w.cities.includes(city.id))) return null;
	const hasPalace = PALACE_CITIES.has(city.id);
	const options = FIGURES.filter((f) => !f.palace || hasPalace);
	const f = rng.pick(options);
	const figure = f.title(CULTURES[city.culture].ruler(run.year));
	const popular = rng.chance(0.6);
	const why = cause ?? rng.pick(CAUSES);
	run.world.push({ id: `death-${city.id}-${run.day}`, kind: 'death', label: `Death of ${figure}`, start: run.day, end: run.day + rng.int(20, 45), cities: [city.id], data: { figure, popular, royal: f.royal, cause: why } });
	return `🕯 **${figure[0].toUpperCase() + figure.slice(1)}** of ${cityName(city, run.year)} has died ${why}. ${popular ? 'The city is in mourning.' : 'Few are weeping — and some are celebrating behind closed doors.'}`;
}
export const deathAt = (run: Pick<Run, 'world'>, cityId: string) => (run.world ?? []).find((w) => w.kind === 'death' && w.cities.includes(cityId));
const PALACE_CITIES = new Set(['beijing', 'nanjing', 'hanseong', 'kyoto', 'edo', 'thanglong', 'hue', 'ayutthaya', 'bangkok', 'ava', 'mandalay', 'pegu', 'malacca', 'aceh', 'mataram', 'brunei', 'ternate', 'delhi', 'agra', 'lahore', 'golconda', 'hampi', 'isfahan', 'istanbul', 'cairo', 'lisbon', 'london', 'venice', 'moscow', 'lhasa', 'kathmandu', 'bukhara', 'samarkand', 'honolulu', 'kabul', 'mexico', 'lima', 'zanzibar', 'manila', 'batavia']);

/** A disaster strikes `origin` and the cities within `reach` road hops (nearest suffer most). */
export function startDisaster(run: Run, rng: Rng, month: number): string | null {
	const kinds = (Object.keys(DISASTERS) as DisasterKind[]).filter((k) => !DISASTERS[k].months || DISASTERS[k].months!.includes(month));
	const kind = rng.pick(kinds);
	const d = DISASTERS[kind];
	const pool = CITIES.filter((c) => cityExists(c, run.year) && !c.secret && d.cultures.includes(c.culture) && (!d.ports || c.port) && !(run.world ?? []).some((w) => w.kind === 'disaster' && w.cities.includes(c.id)));
	if (!pool.length) return null;
	const origin = rng.pick(pool).id;
	const hit = [origin];
	let ring = [origin];
	for (let h = 0; h < d.reach; h++) {
		const next = ring.flatMap((x) => neighbours(x, run.year, kind === 'tsunami' || kind === 'storm' ? undefined : false)).filter((x, i, a) => !hit.includes(x) && a.indexOf(x) === i && CITY[x] && !CITY[x].secret);
		const keep = next.filter(() => rng.chance(h === 0 ? 0.8 : 0.45));
		hit.push(...keep);
		ring = keep;
	}
	const label = rng.pick(d.names);
	run.world.push({ id: `dis-${kind}-${run.day}`, kind: 'disaster', label, start: run.day, end: run.day + rng.int(d.days[0], d.days[1]), cities: hit, data: { disaster: kind, epicenter: origin } });
	const others = hit.length - 1;
	const death = rng.chance(0.25) ? startDeath(run, rng, origin, `in ${label.replace(/^The /, 'the ')}`) : null;
	return (death ? death + ' ' : '') + `${d.glyph} **${label}** strikes **${cityName(CITY[origin], run.year)}**${others ? ` and ${others} neighbouring ${others === 1 ? 'city' : 'cities'}` : ''}. ${d.blurb}`;
}

/** The disaster (if any) afflicting a city, and how hard: 'epicenter' or 'nearby'. */
export function disasterAt(run: Pick<Run, 'world'>, cityId: string): { e: WorldEvent; kind: DisasterKind; severe: boolean } | null {
	const e = (run.world ?? []).find((w) => w.kind === 'disaster' && w.cities.includes(cityId));
	if (!e?.data?.disaster) return null;
	return { e, kind: e.data.disaster, severe: e.data.epicenter === cityId };
}

export function seedWorld(run: Run) {
	const y = run.year;
	run.world = HISTORIC_WARS.filter((w) => y >= w.from && y <= w.to).map((w, i) => ({
		id: `war-h${i}`,
		kind: 'war' as const,
		label: w.label,
		start: 0,
		end: (w.to - y + 1) * 365,
		cities: [],
		sides: w.sides
	}));
	for (const c of HISTORIC_CARAVANS) {
		run.world.push({
			id: c.id,
			kind: 'caravan',
			label: c.label,
			start: 0,
			end: 99999,
			cities: c.cities,
			data: { caravanId: c.id }
		});
	}
}

/** Advance the world to the current day: expire, spread, move, and sometimes start new events. */
export function tickWorld(run: Run, rng: Rng): string[] {
	run.world ??= [];
	const news: string[] = [];
	run.world = run.world.filter((e) => e.end > run.day);
	for (const e of run.world) {
		if (e.kind === 'plague' && run.day - (e.lastSpread ?? e.start) >= 10 && e.cities.length < 9) {
			const steps = Math.floor((run.day - (e.lastSpread ?? e.start)) / 10);
			for (let i = 0; i < steps; i++) {
				const from = rng.pick(e.cities);
				const next = rng.pick(neighbours(from, run.year).filter((n) => !e.cities.includes(n)));
				if (next && rng.chance(0.6)) {
					e.cities.push(next);
					if (run.visited.includes(next) || next === run.destination) news.push(`☣ The ${e.label.toLowerCase()} has reached **${cityName(CITY[next], run.year)}**.`);
				}
			}
			e.lastSpread = run.day;
		}
	}
	const month = monthOf(run);
	if (run.world.filter((w) => w.kind === 'death').length < 2 && rng.chance(0.08)) {
		const n = startDeath(run, rng);
		if (n) news.push(n);
	}
	if (run.world.filter((w) => w.kind === 'disaster').length < 3 && rng.chance(0.22)) {
		const n = startDisaster(run, rng, month);
		if (n) news.push(n);
	}
	if (run.world.length < 8 && rng.chance(0.3)) {
		const roll = rng.next();
		if (roll < 0.35 && month >= 6 && month <= 9) {
			// typhoon: a track of 4–6 ports across the East Asian seas
			const ports = CITIES.filter((c) => c.port && cityExists(c, run.year) && ['han', 'japanese', 'viet', 'malay', 'korean', 'pacific'].includes(c.culture));
			let cur = rng.pick(ports).id;
			const track = [cur];
			for (let i = 0; i < rng.int(3, 5); i++) {
				const n = neighbours(cur, run.year, true).filter((x) => !track.includes(x));
				if (!n.length) break;
				cur = rng.pick(n);
				track.push(cur);
			}
			const name = rng.pick(['Typhoon of the Red Dragon', 'The Black Wind', 'Great Typhoon', 'The Widow-Maker', 'Typhoon of the Ninth Month']);
			run.world.push({ id: `ty-${run.day}`, kind: 'typhoon', label: name, start: run.day, end: run.day + track.length * 3 + 2, cities: track });
			news.push(`🌀 **${name}** is moving through ${track.map((c) => cityName(CITY[c], run.year)).slice(0, 3).join(', ')}…`);
		} else if (roll < 0.6) {
			const origin = rng.pick(CITIES.filter((c) => cityExists(c, run.year) && c.id !== run.location)).id;
			const label = rng.pick(['Plague', 'Cholera', 'Smallpox epidemic', 'Spotted fever']);
			run.world.push({ id: `pl-${run.day}`, kind: 'plague', label, start: run.day, end: run.day + rng.int(60, 110), cities: [origin], lastSpread: run.day });
			news.push(`☣ ${label} has broken out in **${cityName(CITY[origin], run.year)}**.`);
		} else if (roll < 0.85) {
			// a border war between two neighbouring cultures
			const e = rng.pick(EDGES.filter((x) => x.mode !== 'sea' && edgeExists(x, run.year) && CITY[x.a].culture !== CITY[x.b].culture));
			if (e) {
				const sides: [CultureId, CultureId] = [CITY[e.a].culture, CITY[e.b].culture];
				const label = `War between ${CULTURES[sides[0]].label} and ${CULTURES[sides[1]].label}`;
				run.world.push({ id: `war-${run.day}`, kind: 'war', label, start: run.day, end: run.day + rng.int(50, 140), cities: [], sides });
				news.push(`⚔ **${label}**: border roads are closed.`);
			}
		} else if (!run.world.some((w) => w.kind === 'omen')) {
			// Celestial Omen
			const omen = rng.pick(HISTORIC_OMENS);
			run.world.push({
				id: `${omen.omenType}-${run.day}`,
				kind: 'omen',
				label: omen.label,
				start: run.day,
				end: run.day + rng.int(45, 90),
				cities: omen.cities,
				data: { omenType: omen.omenType }
			});
			news.push(omen.news);
		}
	}
	return news;
}

export const plagueAt = (run: Run, city: string) => (run.world ?? []).find((e) => e.kind === 'plague' && e.cities.includes(city));
export const typhoonAt = (run: Run, city: string) =>
	(run.world ?? []).find((e) => {
		if (e.kind !== 'typhoon') return false;
		const i = Math.min(e.cities.length - 1, Math.floor((run.day - e.start) / 3));
		return e.cities.slice(Math.max(0, i - 1), i + 2).includes(city);
	});
export const typhoonPos = (run: Run, e: WorldEvent) => e.cities[Math.min(e.cities.length - 1, Math.max(0, Math.floor((run.day - e.start) / 3)))];
export const warFor = (run: Run, culture: CultureId) => (run.world ?? []).find((e) => e.kind === 'war' && e.sides?.includes(culture));

/** Calculates the current camp/city of a moving caravan. */
export function caravanPos(run: Run, e: WorldEvent): string {
	if (!e.cities.length) return '';
	const pace = 22; // days per stop
	const total = (e.cities.length - 1) * 2;
	if (total <= 0) return e.cities[0];
	const step = Math.floor(run.day / pace) % total;
	const idx = step < e.cities.length ? step : total - step;
	return e.cities[idx] ?? e.cities[0];
}

/** Calculates the current route leg [from, to] of a caravan. */
export function caravanLeg(run: Run, e: WorldEvent): [string, string] {
	if (e.cities.length < 2) return [e.cities[0] ?? '', e.cities[0] ?? ''];
	const pace = 22;
	const total = (e.cities.length - 1) * 2;
	if (total <= 0) return [e.cities[0], e.cities[0]];
	const step = Math.floor(run.day / pace) % total;
	if (step < e.cities.length - 1) {
		return [e.cities[step], e.cities[step + 1]];
	} else if (step === e.cities.length - 1) {
		return [e.cities[e.cities.length - 1], e.cities[e.cities.length - 2]];
	} else {
		const idx = total - step;
		return [e.cities[idx], e.cities[Math.max(0, idx - 1)]];
	}
}

/** Find a caravan at or passing through this city. */
export function caravanAt(run: Run, cityId: string): WorldEvent | undefined {
	return (run.world ?? []).find((e) => e.kind === 'caravan' && (caravanPos(run, e) === cityId || e.cities.includes(cityId)));
}

/** Find a caravan traveling along this route edge. */
export function caravanOnRoute(run: Run, a: string, b: string): WorldEvent | undefined {
	return (run.world ?? []).find((e) => {
		if (e.kind !== 'caravan') return false;
		const [ca, cb] = caravanLeg(run, e);
		return (ca === a && cb === b) || (ca === b && cb === a) || (e.cities.includes(a) && e.cities.includes(b));
	});
}

/** Find an active celestial omen over this city. */
export function omenAt(run: Run, cityId: string): WorldEvent | undefined {
	return (run.world ?? []).find((e) => e.kind === 'omen' && e.cities.includes(cityId));
}

/** A land/river route between two warring cultures is closed. */
export function edgeClosed(run: Run, e: Pick<Edge, 'a' | 'b' | 'mode'>) {
	if (e.mode === 'sea') return null;
	const a = CITY[e.a].culture;
	const b = CITY[e.b].culture;
	return (run.world ?? []).find((w) => w.kind === 'war' && w.sides && ((w.sides[0] === a && w.sides[1] === b) || (w.sides[0] === b && w.sides[1] === a)) && a !== b) ?? null;
}

export function isWarZone(run: Run, cityId: string): boolean {
	const c = CITY[cityId];
	if (!c || !run.world) return false;
	return run.world.some((w) => w.kind === 'war' && w.sides && (w.sides.includes(c.culture) || w.cities?.includes(cityId)));
}
