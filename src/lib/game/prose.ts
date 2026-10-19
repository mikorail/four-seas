// Short scene-setting lines so each card reads like a page from a travel journal.
import { Rng } from '#lib/rng';
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { monthOf, seasonFor, seasonName } from './economy';
import type { Card, Run } from './types';

import { getTimeInfo } from './time';
import { cityScene, travelAside } from './grammar';

const TIME = ['Before dawn', 'At first light', 'Mid-morning', 'At noon', 'In the long afternoon', 'At dusk', 'After dark', 'Near midnight'];

const SEA = [
	'the deck creaks in a long, slow swell',
	'flying fish skip ahead of the bow',
	'the sails crack in a freshening wind',
	'the crew mends nets and argues about the weather',
	'the horizon is an unbroken line of blue',
	'salt crusts everything, including your patience',
	'a pod of dolphins races the hull'
];
const RIVER = ['the barge drifts past rice terraces', 'boatmen pole through green water', 'herons rise from the reeds as you pass', 'the current is brown and quick with rain'];
const LAND: Record<string, string[]> = {
	default: ['dust rises from the road behind you', 'the road climbs through terraced hills', 'wayside shrines mark every mile', 'the carts ahead raise a yellow haze'],
	steppe: ['grass runs to the edge of the sky', 'the wind never stops', 'felt tents dot the horizon like mushrooms'],
	persian: ['the caravan bells clank in the heat', 'a caravanserai shimmers in the distance', 'the desert glows like a forge'],
	tibetan: ['prayer flags snap in the thin air', 'the peaks are white against a hard blue sky', 'your breath clouds in the cold'],
	indian: ['bullock carts creak along the Grand Trunk Road', 'peacocks call from the banyans', 'the air smells of dust and marigolds'],
	european: ['rain drips from the coach roof', 'church bells carry across the fields', 'the road is all mud and ruts']
};
const WEATHER: Record<string, string[]> = {
	Winter: ['snow falls in fat, slow flakes', 'frost whitens every roof', 'a cold wind cuts through your coat'],
	Spring: ['blossom drifts on the wind', 'a soft rain darkens the stones', 'everything smells of wet earth'],
	Summer: ['the heat presses down like a hand', 'cicadas drone without pause', 'thunderheads stack up in the west'],
	Autumn: ['leaves turn red and gold', 'the harvest is coming in', 'a clear, cool wind blows from the north']
};

type Climate = 'tropical' | 'arid' | 'cold' | 'temperate';
const ARID = new Set(['persian', 'ottoman', 'steppe']);
/** Rough climate from latitude and region: no frost in Mocha, no monsoon in Moscow. */
export function climateOf(city: { lat: number; culture: string }): Climate {
	const a = Math.abs(city.lat);
	if (a >= 50 || city.culture === 'tibetan') return 'cold';
	if (a < 23.5) return ARID.has(city.culture) || city.culture === 'swahili' ? 'arid' : 'tropical';
	if (ARID.has(city.culture)) return 'arid';
	return 'temperate';
}
const CLIMATE_WEATHER: Record<Exclude<Climate, 'temperate'>, Record<'cool' | 'hot', string[]>> = {
	tropical: { cool: ['the dry season sky is wide and blue', 'a warm breeze rattles the palm fronds', 'the evenings are almost cool'], hot: ['monsoon rain drums on every roof', 'steam rises from the streets after a downpour', 'the air is thick enough to drink'] },
	arid: { cool: ['the desert nights are bitter and starry', 'a dry wind lifts the dust', 'the sun is kind for once'], hot: ['the heat shimmers off white walls', 'everyone sleeps through the blazing noon', 'dust devils dance outside the gates'] },
	cold: { cool: ['snow lies deep in every lane', 'breath freezes on your collar', 'ice creaks on the river'], hot: ['the short summer turns the hills green', 'meltwater roars in every ditch', 'the long light lingers past midnight'] }
};
/** Weather that fits the place and the month (southern hemisphere seasons flipped). */
export function localWeather(r: Rng, city: { lat: number; culture: string }, month: number): { label: string; line: string } {
	const m = city.lat < 0 ? (month + 6) % 12 : month;
	const season = seasonName(m);
	const clim = climateOf(city);
	if (clim === 'temperate') return { label: season.toLowerCase(), line: r.pick(WEATHER[season] ?? WEATHER.Spring) };
	const hot = m >= 4 && m <= 9;
	const label = clim === 'tropical' ? (hot ? 'rainy' : 'dry') : clim === 'arid' ? (hot ? 'scorching' : 'cool') : hot ? 'brief summer' : 'long winter';
	return { label, line: r.pick(CLIMATE_WEATHER[clim][hot ? 'hot' : 'cool']) };
}

function cityLine(r: Rng, run: Run) {
	const c = CITY[run.location];
	const cul = CULTURES[c.culture];
	const senses = [
		`the smell of ${cul.food} drifts from the stalls`,
		`bells ring from the ${cul.holyPlace}`,
		`porters shout over the din of the market`,
		`someone is selling ${cul.drink} by the cup`,
		`the streets are thick with ${c.exports} traders`,
		c.port ? 'gulls wheel over the harbor masts' : 'lanterns sway above the gates'
	];
	return `${r.pick(TIME)} in **${cityName(c, run.year)}**; ${r.pick(senses)}.`;
}

/** One sentence of atmosphere for a card, stable for that card. */
export function sceneLine(run: Run, card: Card): string {
	if (card.id === 'intro') return '';
	const r = new Rng(card.npc.seed ^ 0x9e3779b9);
	const month = monthOf(run);
	const season = seasonName(month);
	if (card.scene === 'rustic' || run.flags.inDetour) {
		const RUSTIC_SENSES = [
			'smoke rises lazily from thatch roofs',
			'woodsmoke and wet earth perfume the morning air',
			'a mountain stream turns a slow wooden waterwheel',
			'children watch shyly from behind bamboo fences',
			'hermit crabs scuttle across drying fishing nets',
			'goats graze among ancient stone cairns',
			'a quiet spring bubbles into a mossy stone trough'
		];
		const place = run.flags.inDetour === 'cove' ? 'Fisherman’s Cove' : run.flags.inDetour === 'hamlet' ? 'Nameless Hamlet' : run.flags.inDetour === 'oasis' ? 'Hidden Oasis' : 'Unmarked Settlement';
		return `${r.pick(TIME)} in the **${place}**; ${r.pick(RUSTIC_SENSES)}.`;
	}
	if (run.phase === 'travel' && run.route) {
		const s = seasonFor(run.route, month);
		const from = cityName(CITY[run.route.from], run.year);
		const day = Math.max(1, Math.round(r.next() * run.route.days));
		const bad = s.id === 'typhoon' ? 'the sky has a green, bruised look' : s.id === 'monsoon' ? 'rain comes sideways off the sea' : s.id === 'winter' ? 'snow muffles every sound' : null;
		const where = run.route.mode === 'sea' ? r.pick(SEA) : run.route.mode === 'river' ? r.pick(RIVER) : r.pick(LAND[CITY[run.route.to].culture] ?? LAND.default);
		return `Day ${day} out of **${from}**; ${bad ?? where}.${travelAside(r, run)}`;
	}
	const roll = r.next();
	return roll < 0.55 ? cityScene(r, run) : roll < 0.8 ? cityLine(r, run) : `${r.pick(TIME)}; ${localWeather(r, CITY[run.location], month).line}.`;
}

// Procedural City Lore & Street Gossip Engine
export interface CityLore {
	headline: string;
	diurnal: string;
	weather: string;
	rumor: string;
	specialty: string;
	flavorText: string;
}

const REGIONAL_RUMORS: Record<string, string[]> = {
	korean: [
		'Teahouse whispers say a Secret Royal Inspector (*Amhaeng-eosa*) has arrived in disguise carrying the bronze sun-token.',
		'Pony drovers from Uiju say the frontier guards are strictly searching wagons for smuggled wild ginseng and unminted silver.',
		'Divers from Jeju brought news of sea otters gathering off the rocks and a great school of yellowtail.',
		'Scholars traveling from Hanseong debate civil service exam revisions beneath the eaves of the local pavilion.'
	],
	japanese: [
		'Magistrate bailiffs have doubled the gate watch after rumors of masterless samurai riding in from the outer provinces.',
		'A foreign merchant captain is said to be auctioning brass telescopes, maps, and Spanish snuff down at the wharf.',
		'A celebrated kabuki troupe has pitched its colorful banners by the riverbank, drawing unruly crowds.',
		'Sword-smiths in the artisan quarter were seen quenching blades using fresh mountain spring water before sunrise.'
	],
	han: [
		'Lock-keepers along the canal are clearing grain barges for the imperial tribute fleet bound for Peking.',
		'Tea merchants from Hangzhou complain that spring mountain rains have made the Longjing leaves scarce and dear.',
		'Daoist masters at the hill temple conducted a cloud-clearing ritual to bless the autumn harvest.',
		'Coin brokers have set up red scales along the avenue, testing taels of unrefined Yunnan silver against dragon cash.'
	],
	malay: [
		'Bugis prahus have docked with holds deep in nutmeg, cloves, and dammar resin from the eastern islands.',
		'The harbourmaster (*Syahbandar*) warned captains that the seasonal monsoon is shifting earlier than the old charts told.',
		'Sultans and royal emissaries are trading brass cannons and bolt silk for high-grade mountain camphor.',
		'Fishermen outside the reefs reported dolphins guiding merchant sloops past the dangerous sandbars.'
	],
	steppe: [
		'Horse-drovers at the great circular corral are trading blood-sweating stallions for bricks of compressed tea.',
		'Nomad elders tell of wolves stalking the northern mountain passes and yurt encampments moving toward winter valleys.',
		'A pilgrim party returned from Urga bearing prayer wheels carved from fragrant juniper wood.',
		'Caravans from Kashgar brought tales of turquoise beads found in dry stream beds near the Taklamakan rim.'
	],
	indian: [
		'Muslin weavers have unfurled lengths of cotton so sheer they claim thirty yards can pass through a thumb ring.',
		'Gem merchants from Golconda whisper that a raw diamond the size of a green walnut was uncovered in the south.',
		'Pilgrims arriving at the bathing ghats chant dawn hymns as marigold garlands float down the sacred waters.',
		'Caravan bullocks resting beneath the banyans chew dry cane as drivers argue freight tariffs over clay cups of chai.'
	],
	persian: [
		'Caravan bells clanked as fifty dromedaries laden with Tabriz wool and dried apricots swung into the caravanserai.',
		'Poets and scholars gathered at the water fountain, quoting Hafez over steaming glasses of black tea.',
		'Silversmiths beat hammered platters in the vaulted bazaar, their rhythmic taps echoing down the cool stone alleys.',
		'Astronomers on the fortress terrace adjusted brass astrolabes to calculate the exact conjunction of Jupiter and Mars.'
	],
	ottoman: [
		'The pasha’s tax officers are inspecting the spices at the customhouse under armed janissary escort.',
		'In the coffeehouses, men huddle over tiny porcelain cups, discussing ship arrivals from Venice and Alexandria.',
		'Caravans from the Syrian desert arrived with frankincense, Syrian dates, and beaten brass lanterns.',
		'Dervishes whirled in the courtyard at dusk while oil lamps were lit along the minaret balconies.'
	],
	tibetan: [
		'Pilgrims prostrating along the stone circumambulation path turn copper prayer wheels filled with mantras.',
		'Tea-horse traders from Kham unloaded pack mules laden with compressed brick tea and musk pods.',
		'Lamas at the monastery are mixing mineral pigments of lapis, malachite, and gold leaf for a new thangka scroll.',
		'High mountain winds carry the smoke of burning juniper boughs across the whitewashed stone roofs.'
	],
	european: [
		'Printers in the market square are selling freshly inked gazettes chronicling distant sea voyages to the Indies.',
		'Clerks of the merchant company check manifests of porcelain, cinnamon, and pepper against heavy leather ledgers.',
		'Sailors from three nations brawl over rum and tobacco in the waterfront alehouses beneath creaking tavern signs.',
		'The city clock tower chimed the midday hour with a carousel of carved mechanical apostles.'
	]
};

const DIURNAL_ATMOSPHERE: Record<string, string[]> = {
	dawn: [
		'Monks sweep the stone courtyard stairs in the blue morning mist as early cookshops kindle their morning braziers.',
		'Roosters crow from the back alleys as market gardeners haul handcarts piled high with wet scallions and crisp radish.',
		'Cranes and gulls wheel over the waking water while fishermen cast their first round nets into the glassy tide.',
		'Gate guards yawn in iron caps, sliding back the heavy wooden crossbeams to let the morning carts rumble through.'
	],
	day: [
		'The thoroughfares hum with bustling activity, wheelbarrows clattering over paving stones while hawkers sing their wares.',
		'Porters with shoulder poles weave deftly between donkeys, bargaining loudly in three regional dialects.',
		'The scent of woodsmoke, roasted nuts, and drying herbs fills the hot air beneath sweeping tile eaves.',
		'In the open markets, moneychangers flick abacus beads with lightning speed as copper coins clink in straw baskets.'
	],
	dusk: [
		'Vermilion paper lanterns flicker alight one by one down the narrow streets as cooks stoke evening fires.',
		'Temple bells resound across the rooftops with long, solemn reverberations that gather the wandering rooks.',
		'Boatmen tie off their hemp painters to stone rings, sitting on the gunwales to smoke long pipe stems.',
		'The sky turns a deep indigo above the city walls, rimmed by embers of bronze and rose along the western horizon.'
	],
	night: [
		'Night watchmen beat hollow wooden clappers on the hour, their measured rhythm drifting between quiet shuttered shops.',
		'Golden lantern light spills from tavern screens where gamblers toss ivory dice and share warm wine.',
		'The dark canals reflect the cold diamond stars above, disturbed only by the whisper of an occasional pole boat.',
		'Quiet falls upon the stone bridges, save for the distant barking of watchdog hounds beyond the city moat.'
	]
};

export function getCityLore(run: Run, cityId: string = run.location): CityLore {
	const c = CITY[cityId] ?? CITY[run.location];
	const cul = CULTURES[c.culture];
	// Deterministic pseudo-random seed based on city ID, run seed, and day
	let hash = 0;
	for (let i = 0; i < c.id.length; i++) hash = (hash << 5) - hash + c.id.charCodeAt(i);
	for (let i = 0; i < run.seed.length; i++) hash = (hash << 5) - hash + run.seed.charCodeAt(i);
	hash = (hash ^ (run.day * 1337)) >>> 0;
	const r = new Rng(hash);

	const time = getTimeInfo(run);
	const month = monthOf(run);
	const season = seasonName(month);

	const rumors = REGIONAL_RUMORS[c.culture] ?? REGIONAL_RUMORS.han;
	const rumor = r.pick(rumors);

	const diurnals = DIURNAL_ATMOSPHERE[time.phase] ?? DIURNAL_ATMOSPHERE.day;
	const diurnal = r.pick(diurnals);

	const lw = localWeather(r, c, month);
	const weather = `In this ${lw.label} season, ${lw.line}.`;

	const specialty = `${c.name} is prized for its fine ${c.exports}; merchants gather here to sample ${cul.food} and toast with bowls of ${cul.drink}.`;

	const headlines = [
		`Voices of ${cityName(c, run.year)}`,
		`The Scent of ${c.exports.toUpperCase()}`,
		`Wayside Chronicle: ${c.name}`,
		`Echoes along the ${c.port ? 'Tidal Road' : 'High Road'}`
	];
	const headline = r.pick(headlines);

	const flavorText = `${diurnal} ${weather} ${rumor}`;

	return {
		headline,
		diurnal,
		weather,
		rumor,
		specialty,
		flavorText
	};
}

