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
	steppe: [
		'grass runs to the edge of the sky',
		'the wind never stops singing through the feather-grass',
		'felt tents dot the horizon like pale mushrooms',
		'wild wormwood crushed under hoof fills the dry air',
		'a horseman with a hooded golden eagle watches from a ridge',
		'weathered stone balbal pillars mark the graves of old khans',
		'strings of two-humped camels sway along the salt-pan track'
	],
	persian: [
		'the caravan bells clank in the dry heat',
		'a brick caravanserai shimmers at the edge of the plain',
		'the desert glows like a brass forge at midday',
		'ventilated stone wind-towers rise above a green oasis',
		'snow-fed water rushes unseen beneath the road in deep qanat channels',
		'pomegranate and pistachio orchard walls line the dusty lane',
		'a turquoise-tiled dome catches the sun miles ahead'
	],
	ottoman: [
		'dark cypresses stand like sentinels along the paved post road',
		'a single-arch stone bridge spans the rushing mountain gorge',
		'pack mules laden with Anatolian copper clatter over Roman cobbles',
		'a wayside marble fountain offers cold spring water beneath gilded Arabic script',
		'the road winds past whitewashed watchtowers and olive groves',
		'janissary couriers gallop past in a cloud of red dust'
	],
	swahili: [
		'red earth paths wind beneath the colossal trunks of baobab trees',
		'the monsoon breeze carries the sharp perfume of drying cloves and copra',
		'mangrove creeks flash silver where lateen dhows ride the high tide',
		'porters chant in rhythm as they balance ivory tusks and woven palm baskets',
		'white coral-rag walls gleam through a fringe of coconut palms'
	],
	tibetan: ['prayer flags snap in the thin air', 'the peaks are white against a hard blue sky', 'your breath clouds in the cold'],
	indian: ['bullock carts creak along the Grand Trunk Road', 'peacocks call from the banyans', 'the air smells of dust and marigolds'],
	european: [
		'rain drips from the oiled leather roof of the post-coach',
		'church bells carry across the patchwork fields and hedgerows',
		'the road is all mud, ruts, and splashing postilion horses',
		'iron-shod wheels rattle over an ancient stone viaduct',
		'stone roadside crosses and wayside taverns mark the league posts',
		'windmills turn slowly against a bank of grey Atlantic clouds',
		'terraced vineyards and grey castles cling to the river bluffs'
	]
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

const CULTURE_SENSES: Partial<Record<string, string[]>> = {
	european: [
		'printing presses clank behind leaded glass windows',
		'the smell of coal smoke, tallow, and wet wool hangs in the lanes',
		'factors in black broadcloth argue over bills of exchange beneath the colonnade',
		'church bells and clockwork jacks strike the quarter-hour across the roofs'
	],
	ottoman: [
		'the call to prayer floats from pencil-thin minarets over lead-covered domes',
		'roasting coffee and cardamom perfume the arched stone bazaar',
		'water-sellers clink brass cups beside tiled street fountains',
		'the clatter of backgammon dice and hookahs rises from vine-shaded courtyards'
	],
	persian: [
		'rosewater and saffron drift from the vaulted brick timchehs',
		'water channels gurgle between plane trees down the middle of the avenue',
		'coppersmiths hammer tin-lined trays in rhythmic, ringing chorus',
		'tile-makers lay cobalt and turquoise glaze in the courtyard sun'
	],
	steppe: [
		'mutton fat and birch-bark smoke curl from a hundred felt-topped chimneys',
		'horse-traders crack braided whips in the dusty corral outside the walls',
		'the tang of fermented mare’s milk and tanned leather fills the market square',
		'two-humped camels kneel by the gate as drovers unlash bales of brick tea'
	],
	swahili: [
		'the tide slaps against coral-stone sea walls below carved teak doorways',
		'dhows with tall triangular sails crowd the anchorage on the monsoon wind',
		'clove buds, ambergris, and dried shark perfume the waterfront warehouses',
		'merchants in embroidered kofia caps weigh gold dust and cowrie shells'
	]
};

function cityLine(r: Rng, run: Run) {
	const c = CITY[run.location];
	const cul = CULTURES[c.culture];
	const extra = CULTURE_SENSES[c.culture] ?? [];
	const senses = [
		`the smell of ${cul.food} drifts from the stalls`,
		`bells ring from the ${cul.holyPlace}`,
		`porters shout over the din of the market`,
		`someone is selling ${cul.drink} by the cup`,
		`the streets are thick with ${c.exports} traders`,
		c.port ? 'gulls wheel over the harbor masts' : 'lanterns sway above the gates',
		...extra
	];
	return `${r.pick(TIME)} in **${cityName(c, run.year)}**; ${r.pick(senses)}.`;
}

/** One sentence of atmosphere for a card, stable for that card. */
export function sceneLine(run: Run, card: Card): string {
	if (card.id === 'intro') return '';
	const r = new Rng(card.npc.seed ^ 0x9e3779b9);
	const month = monthOf(run);
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
	viet: [
		'Sampan guilds along the river are loading blue-and-white ceramics and raw silk for the southern monsoon fleet.',
		'Mandarins at the provincial hall have posted new edicts regulating foreign silver coin and cinnamon taxes.',
		'Water-puppet troupes have erected a bamboo stage in the lotus pond for the upcoming full-moon market.'
	],
	siamese: [
		'Royal warehouse clerks are weighing white benzoin gum, sappanwood, and deer hides before the junk fleet sails.',
		'Barge oarsmen along the canal speak of a rare white elephant spotted in the northern teak forests.',
		'Gold-beaters near the temple gates work late into the dusk pressing leaf for a newly cast bronze Buddha.'
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
		'Caravans from Kashgar brought tales of mutton-fat nephrite jade found in dry riverbeds after the snowmelt.',
		'Bukharan money-changers under the trading domes are paying a premium for Russian sable pelts and silver wire coins.',
		'Kazakh falconers have ridden in from the feather-grass plains with hooded golden eagles trained to take wolves.',
		'Madrasa astronomers in the tiled courtyard are comparing Ulugh Beg’s star tables against a newly arrived brass astrolabe.',
		'Caucasus mountaineers in black felt cloaks (*burkas*) are bartering silver-niello daggers and Circassian horses at the post gate.',
		'Silk-weavers in the Fergana bazaar claim the mulberry harvest will yield the finest *abr* ikat cloth in twenty years.'
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
		'Astronomers on the fortress terrace adjusted brass astrolabes to calculate the exact conjunction of Jupiter and Mars.',
		'Master weavers from the royal *karkhaneh* workshops are buying up cochineal dye and gold-wrapped thread for a court carpet.',
		'Muqannis who dig the subterranean *qanat* channels say the mountain snowmelt is running deep and cold beneath the plain.',
		'Zoroastrian fire-keepers and Armenian silk factors were seen dining together at the stone caravanserai outside the gate.',
		'Pearl merchants from the Gulf have arrived with velvet pouches of orient seed-pearls and flasks of Shiraz rosewater.',
		'Calligraphers in the madrasa arcade are grinding lapis lazuli from Badakhshan to illuminate a royal *Shahnameh* manuscript.'
	],
	ottoman: [
		'The pasha’s tax officers are inspecting the spices at the customhouse under armed janissary escort.',
		'In the coffeehouses, men huddle over tiny porcelain cups, discussing ship arrivals from Venice and Alexandria.',
		'Caravans from the Syrian desert arrived with frankincense, Syrian dates, and beaten brass lanterns.',
		'Dervishes whirled in the courtyard at dusk while oil lamps were lit along the minaret balconies.',
		'Imperial couriers (*ulaks*) changed lathered horses at the post-station, carrying sealed firmans from the Sublime Porte.',
		'A *meddah* storyteller in the bazaar coffeehouse drew a crowd of sailors with tales of Barbary xebecs and Red Sea reefs.',
		'Guild wardens in the vaulted *bedesten* are weighing raw Persian silk and stamping bolts of crimson velvet with lead seals.',
		'Artisans from Iznik unloaded crates of cobalt-and-coral floral tiles destined for a new vizier’s mosque.',
		'Greek caique captains and Armenian dragomans argue over Black Sea grain freights and quarantine passes at the quay.'
	],
	swahili: [
		'Lateen-rigged dhows from Oman and Gujarat have dropped anchor inside the coral reef, their decks stacked with dates and glazed jars.',
		'Merchant patricians on shaded stone *baraza* benches are bargaining over ivory tusks, hippo teeth, and bundles of mangrove poles.',
		'A caravan from the inland lakes marched in at dawn with copper ingots, rock salt, and pouches of alluvial gold dust.',
		'Woodcarvers in the harbour lane are chiseling lotus rosettes and rope patterns into heavy jackfruit-wood lintels.',
		'Clove-pickers and coconut factors say the *kaskazi* northeast monsoon is blowing steady enough to carry a fast baghlah to Muscat in twenty days.',
		'Divers off the outer shoals brought up a lump of grey ambergris worth a small chest of Spanish silver.'
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
		'The city clock tower chimed the midday hour with a carousel of carved mechanical apostles.',
		'Exchange brokers under the stone arcade are quoting bottomry insurance rates on East Indiamen rounding the Cape.',
		'Glassmakers and lens-grinders near the guildhall are offering spyglasses, sand-glasses, and silvered Venetian mirrors.',
		'Post-coaches splashed in through the mud-spattered turnpike with diplomatic dispatches and chests of New World reals.',
		'Apothecaries in the college lane are bidding high for Jesuit’s bark, rhubarb root, and camphor from the Eastern seas.',
		'Shipwrights at the naval arsenal work by pitch-torch light, caulking oak hulls with Baltic hemp and Stockholm tar.'
	],
	pacific: [
		'Double-hulled outrigger canoes glided across the lagoon at dawn, bringing pearl shell, taro, and woven pandanus mats.',
		'Whaling barks and sandalwood brigs lie anchored off the reef, trading iron nails and muskets for fresh water and hogs.',
		'Master navigators on the beach trace rising star paths in the coral sand with coconut-rib sticks.'
	]
};

const CITY_RUMORS: Record<string, string[]> = {
	venice: [
		'Gondoliers along the Rialto whisper that the Council of Ten arrested a glassblower trying to smuggle Murano mirror secrets to Paris.',
		'Galley captains at the Arsenale are signing oarsmen and crossbowmen for the autumn convoy to Candia and Smyrna.'
	],
	lisbon: [
		'Factors at the Casa da Índia have locked the pepper warehouses while royal clerks tally the carracks newly arrived from Goa.',
		'Cartographers in the Ribeira are paying gold cruzados for any rutters or soundings of the Malacca Straits.'
	],
	amsterdam: [
		'Share-brokers at the Hendrick de Keyser Bourse are bidding up East India Company stock on rumors of a rich Moluccan spice fleet.',
		'Canal barges stacked with Baltic grain and Japanese copper ingots wait for the weigh-house cranes at the Dam.'
	],
	london: [
		'In the Exchange Alley coffeehouses, underwriters are posting Lloyd’s shipping lists and wagering on tea clippers out of Canton.',
		'East India House clerks at Leadenhall Street are preparing a public sale of Bengal saltpetre, raw silk, and indigo.'
	],
	seville: [
		'Assayers at the Casa de Contratación are weighing chests of Potosí pieces-of-eight unloaded by the Guadalquivir treasure galleons.',
		'Muleteers by the Torre del Oro are hiring guards for a silver convoy heading north toward Madrid and Genoa.'
	],
	paris: [
		'Booksellers along the Pont Neuf are hawking Jesuit relations from Peking alongside contraband philosophical pamphlets.',
		'Tapestry masters at the Gobelins workshops are seeking Chinese raw silk and Persian crimson dye for the King’s apartments.'
	],
	genoa: [
		'Bankers in the marble palaces of the Strada Nuova are discounting Spanish silver bills to fund a new Levant grain fleet.',
		'Liguria silk-throwers on the harbourfront complain that Barbary xebecs have delayed the raw-silk galleys from Messina.'
	],
	florence: [
		'Goldsmiths on the Ponte Vecchio are setting Golconda diamonds and Oriental rubies for the Grand Duke’s cabinet of curiosities.',
		'Instrument-makers near the Palazzo Vecchio are grinding telescope lenses and testing spirit thermometers.'
	],
	antwerp: [
		'Diamond-cutters near the Meir are inspecting rough stones brought via Lisbon while tapestry weavers load wagons for Vienna.',
		'Portuguese spice factors and English cloth merchants crowd the columned Bourse before the afternoon bell.'
	],
	hamburg: [
		'Lightermen along the Elbe fleets are hoisting casks of French brandy, Archangel furs, and Mocha coffee into brick warehouses.',
		'Senate Lutherans and Sephardic spice brokers meet at the Trostbrücke to settle bills in banco marks.'
	],
	vienna: [
		'Armenian and Greek dragomans in the Leopoldstadt coffeehouses trade news of the Ottoman frontier along the Danube.',
		'Court kapellmeisters and Italian architects jostle with Hungarian hussars outside the Hofburg gates.'
	],
	prague: [
		'Bohemian crystal-cutters and clockmakers in the Old Town whisper of alchemists still working in the lanes below the castle.',
		'Peddlers on the Charles Bridge offer garnet rosaries, astronomical almanacs, and Saxon silver thalers.'
	],
	krakow: [
		'Sarmatian nobles in fur-lined *kontusz* robes are buying Persian sashes and Damascus blades in the Cloth Hall arcade.',
		'Salt-miners from Wieliczka and Armenian carpet factors crowd the Rynek inns after the Vistula timber rafts tie up.'
	],
	stpetersburg: [
		'Sledges and canal barges bring Siberian sable, rhubarb from Kyakhta, and Yorkshire broadcloth to the Gostiny Dvor arcades.',
		'Admiralty shipwrights and foreign engineers debate canal locks and winter ice-breakers over glasses of hot punch.'
	],
	moscow: [
		'Fur merchants in Kitai-Gorod are grading Barguzin sable and Arctic fox pelts destined for the Persian and Greek trade.',
		'Bells from forty times forty onion-domed churches ring across the Moskva River as sledges creak through the gates.'
	],
	ragusa: [
		'Rectorate couriers are preparing the annual tribute caravan for Constantinople while argosies load Balkan wax and wool.',
		'In the lazaretto outside the Ploče Gate, travelers from the Levant count out their forty days of quarantine.'
	],
	istanbul: [
		'Boatmen in narrow caiques race across the Golden Horn between Galata Frankish warehouses and the Spice Bazaar quays.',
		'Jewelers and silk-merchants in the Grand Bazaar whisper that a Persian embassy has crossed the Bosphorus with gifts for the Divan.'
	],
	smyrna: [
		'Camel trains from Ushak and Angora kneel along the Frank Street quays, unloading mohair yarn, figs, and knotted carpets.',
		'Consuls of France, Venice, and England fly their flags above seaside verandas while dragomans haggle in quatre-langues.'
	],
	trebizond: [
		'Laz boatmen and Pontic muleteers are strapping bales of Tabriz silk onto pack-horses for the steep climb over the Zigana Pass.',
		'Black Sea feluccas ride the swell below the old Comnenian citadel walls, waiting for the morning land-breeze.'
	],
	caffa: [
		'Tatar horsemen and Armenian factors barter steppe horses, salted sturgeon, and Crimean salt beneath the old Genoese towers.',
		'Galleys bound for Sinop and the Bosphorus are taking on casks of tallow, wheat, and beeswax at the stone mole.'
	],
	belgrade: [
		'Danube river-scows and Hungarian cattle drovers crowd the lower town below the white limestone ramparts of Kalemegdan.',
		'Bosnian smiths and Ragusan factors trade flintlock pistols, saddle-leather, and plum brandy in the wooden *čaršija*.'
	],
	aleppo: [
		'In the great Khan al-Jumruk, Venetian and English factors weigh raw Persian *ardass* silk against chests of silver piastres.',
		'Soap-boilers and pistachio merchants say the desert caravan from Basra has arrived ten days early with Indian indigo.'
	],
	damascus: [
		'Pilgrim outfitters in the Midan are provisioning the great Hajj caravan with waterskins, biscuit, and camphor.',
		'Bladesmiths and inlay-workers in the Straight Street bazaar tap gold wire into watered steel and walnut chests.'
	],
	cairo: [
		'Spice brokers in the Khan el-Khalili are bidding on Red Sea coffee and Socotra dragon’s blood brought up from Suez.',
		'Nilometer keepers on Roda Island announced that the river flood has reached the mark of abundance.'
	],
	baghdad: [
		'Round coracles coated in bitumen (*quffas*) spin across the Tigris carrying melons, dates, and glazed water-jars.',
		'Booksellers in the Suq al-Saray are trading Persian verse manuscripts and astrolabe treatises beside the pontoon bridge.'
	],
	algiers: [
		'Lookouts on the Peñón mole spotted two lateen xebecs returning with prizes taken off the Majorca channel.',
		'Ransom friars, Jewish silver-brokers, and Turkish captains crowd the vaulted Bagnio lanes below the Casbah.'
	],
	fez: [
		'Tanners in the Chouara pits tread hides in vats of saffron yellow, poppy red, and cedar-bark brown.',
		'Scholars from the Qarawiyyin madrasa debate Marinid legal commentaries over mint tea and almond pastries.'
	],
	tbilisi: [
		'In the steaming sulfur bathhouses of Abanotubani, Persian factors, Georgian princes, and Armenian bankers trade Caucasus road news.',
		'Wine-merchants along the Kura cliffside are unsealing clay *qvevri* jars of amber Kakhetian wine for a wedding feast.'
	],
	baku: [
		'Caravanserai keepers near the Maiden Tower are filling goatskins with black Caspian naphtha for medicinal and lamp oil.',
		'Indian and Persian fire-pilgrims at the Surakhani temple tend the natural gas flames roaring from the limestone rock.'
	],
	samarkand: [
		'Paper-makers along the Siyob canal pound mulberry bark with water-powered trip-hammers to make smooth Raghi sheets.',
		'Under the towering tiled iwans of the Registan, Bukharan and Indian merchants trade lapis, musk, and Kashmiri shawls.'
	],
	bukhara: [
		'Under the four domed *toqi* bazaars, money-changers (*sarrafs*) stack silver tangas and weigh gold tillas from Khiva and Kabul.',
		'Water-carriers fill leather skins at the Lyab-i Hauz pool while storks clatter their bills atop the Kalyan minaret.'
	],
	khiva: [
		'Turkmen horse-breeders inside the mud-brick walls of Itchan Kala are showing long-necked Akhal-Teke runners.',
		'Woodcarvers in the cool elm-columned Friday Mosque are replacing a weathered capital with intricate arabesques.'
	],
	kokand: [
		'Envoys from Kashgar and Tashkent wait at the Khan’s tiled palace while silk-winders reel bright Fergana cocoons.',
		'Kirghiz drovers from the Alay passes have brought snow-leopard pelts and blocks of mountain rock-salt.'
	],
	kazan: [
		'Volga river-merchants in the Tatar quarter are loading embroidered leather boots, honey, and Siberian squirrel pelts.',
		'Bukharan and Russian factors haggle over Chinese brick-tea and iron cauldrons below the white Kremlin walls.'
	],
	merv: [
		'Turcoman outriders watering their mares by the Murghab canal speak of shifting dunes uncovering old Seljuk bronze coins.',
		'Melon-growers in the oasis gardens are slicing sweet green *gulabi* melons to dry in braided ropes for the winter caravans.'
	],
	balkh: [
		'Afghans and Uzbeks around the green-tiled shrine of Khwaja Abu Nasr Parsa trade Badakhshan spinels and Karakul lambskins.',
		'Old greybeards in the orchard teahouses point out the eroded earthen ramparts that they say Alexander the Greek built.'
	],
	zanzibar: [
		'Omani nahodhas and Banyan customs-farmers on the Stone Town seafront are weighing bags of fragrant Pemba cloves.',
		'Dhow carpenters on the beach are rubbing shark oil into teak planks before the southern monsoon turns.'
	],
	kilwa: [
		'Merchants beneath the fluted domes of the Great Mosque speak of a gold-dust caravan arriving from the inland plateau.',
		'Lime-burners along the lagoon are firing white porites coral to plaster the sea-wall palaces.'
	],
	mombasa: [
		'Sentries on the coral ramparts of Fort Jesus watch a fleet of northern dhows tacking into the Old Harbour channel.',
		'Swahili ivory-brokers and Giriama palm-tappers barter beeswax, copal gum, and dyed Gujarati cloth in the shaded alleys.'
	],
	timbuktu: [
		'Tuareg camel-trains from Taghaza are unloading grey slabs of desert rock-salt to trade for Bambuk gold dust and kola nuts.',
		'Scribes in the Sankore quarter are copying astronomical commentaries onto Italian watermarked paper brought across the Sahara.'
	],
	sofala: [
		'Shona gold-washers from the highland rivers have come down to the mangrove estuary with quills of alluvial gold.',
		'Captains waiting for the Mozambique current are trading glass beads and painted Cambay cottons for ivory and ambergris.'
	]
};

const CULTURE_DIURNAL: Partial<Record<string, Record<string, string[]>>> = {
	european: {
		dawn: [
			'Cathedral bells toll prime through the river fog as bakers pull crusty loaves from brick ovens and night-watchmen douse their lanterns.',
			'Market carts rattle over wet cobblestones through the toll-gate while fishwives set out herring barrels along the quay.'
		],
		day: [
			'Carriages and hand-barrows jostle down the narrow gabled streets while clerks hurry between counting-houses with ink-stained ledgers.',
			'Under the stone arcades of the exchange, factors in broad-brimmed hats quote freight rates and inspect samples of pepper and broadcloth.'
		],
		dusk: [
			'Lamplighters move from bracket to bracket with long tapers as tavern signs creak in the evening breeze and church bells ring vespers.',
			'Gilded weather-vanes and slate spires catch the last copper light while printers lock their shutters for the night.'
		],
		night: [
			'The town watch calls the hour with halberd and horn, their footsteps echoing between dark stone warehouses and quiet canals.',
			'Tallow candlelight spills through leaded tavern panes where sailors and coachmen argue over dice and pewter tankards.'
		]
	},
	ottoman: {
		dawn: [
			'The first call to prayer rises from the minarets into a mother-of-pearl sky as soup-kitchens ladle steaming lentil broth for early porters.',
			'Custodians unlock the iron-plated gates of the covered bazaar while donkeys laden with fresh figs and charcoal pad through the mist.'
		],
		day: [
			'Sunlight shafts through the pierced domes of the *bedesten* onto carpets, brass ewers, and merchants counting silver akçes.',
			'Coffee-roasters turn iron cylinders over charcoal braziers, filling the crowded lane with rich, dark smoke.'
		],
		dusk: [
			'Flocks of pigeons wheel around the lead-sheathed mosque domes as oil lamps bloom along the minaret balconies for the evening prayer.',
			'Shopkeepers draw their wooden shutters and retire to courtyard coffeehouses where water-pipes bubble beneath vine trellises.'
		],
		night: [
			'Night-patrols (*ases*) make their rounds with paper lanterns while stray hounds sleep curled against the warm brickwork of the hammam.',
			'Behind carved lattice windows (*mashrabiya*), lute strings and shadow-puppet laughter drift softly over the quiet cul-de-sacs.'
		]
	},
	persian: {
		dawn: [
			'Cool mountain water rushes through the stone channels as bakers slap sheets of *sangak* bread onto hot river pebbles.',
			'Caravan drivers tighten girth-straps in the caravanserai courtyard before the desert sun climbs above the mud-brick ramparts.'
		],
		day: [
			'Beneath the vaulted brick arcades of the bazaar, shafts of dusty light fall on turquoise tilework, copper trays, and stacked carpets.',
			'Windcatchers funnel a dry breeze into the shaded teahouses where merchants sip saffron tea from waisted glasses.'
		],
		dusk: [
			'The glazed blue domes glow like sapphires against an amber sky while nightingales begin to sing in the walled cypress gardens.',
			'Braziers are lit along the bridge pavilions, casting long gold reflections across the shallow river.'
		],
		night: [
			'The desert stars burn fierce and close above the flat mud roofs and silent wind-towers.',
			'From an inner courtyard comes the soft plucking of a *setar* and the murmur of verses recited by oil-lamp light.'
		]
	},
	steppe: {
		dawn: [
			'Blue smoke of dried dung and birch-bark curls from the roof-rings of felt yurts as herdsmen drive the horses out to frosty pasture.',
			'Camel bells ring clear in the thin morning air as the gate-watch swings open the timber stockade.'
		],
		day: [
			'In the dusty horse-fair outside the citadel, riders in sheepskin coats test the wind of steppe ponies at a full gallop.',
			'Traders from four khanates squat on felt rugs, weighing silver ingots, brick tea, and bundles of marten pelts.'
		],
		dusk: [
			'The endless grass turns the color of beaten copper as cooking cauldrons bubble with mutton broth and salted tea.',
			'Herdsmen call their foals home across the river flats while the first cooking fires prick the purple twilight.'
		],
		night: [
			'A cold wind sweeps down from the high passes under a vault of stars wide enough to swallow kingdoms.',
			'Around the caravanserai fire-pit, drovers pass a horn of kumis and trade songs on a two-stringed *dombra*.'
		]
	},
	swahili: {
		dawn: [
			'Conch shells blow along the coral reef as outrigger canoes and lateen dhows slip out on the morning ebb tide.',
			'Sweepers brush fallen frangipani blossoms from the whitewashed stone alleys while the scent of cardamom buns drifts from open doorways.'
		],
		day: [
			'Along the shaded stone *baraza* benches, merchants in crisp white kanzus tally ivory, cloves, and bolts of indigo cotton.',
			'Harbour porters wade waist-deep through the turquoise shallows, carrying copper cauldrons and glazed jars ashore on their shoulders.'
		],
		dusk: [
			'The triangular sails of returning fishing boats turn rose-gold against the Indian Ocean horizon as the call to prayer sounds across the water.',
			'Coconut-oil lamps are set into carved wall niches, throwing warm shadows across brass-studded teak doors.'
		],
		night: [
			'The warm monsoon wind rustles the palm fronds above the coral roofs while surf booms steadily on the outer barrier reef.',
			'Down by the dhow anchorage, sailors sing *taarab* melodies to the gentle rhythm of a hand-drum and *oud*.'
		]
	}
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

	const regionalRumors = REGIONAL_RUMORS[c.culture] ?? REGIONAL_RUMORS.han;
	const cityRumors = CITY_RUMORS[c.id] ?? [];
	const rumors = cityRumors.length > 0 ? [...cityRumors, ...regionalRumors] : regionalRumors;
	const rumor = r.pick(rumors);

	const culDiurnal = CULTURE_DIURNAL[c.culture]?.[time.phase];
	const diurnals = culDiurnal && culDiurnal.length > 0 ? culDiurnal : (DIURNAL_ATMOSPHERE[time.phase] ?? DIURNAL_ATMOSPHERE.day);
	const diurnal = r.pick(diurnals);

	const lw = localWeather(r, c, month);
	const weather = `In this ${lw.label} season, ${lw.line}.`;

	const specialty = `${c.name} is prized for its fine ${c.exports}; merchants gather here to sample ${cul.food} and toast with cups of ${cul.drink}.`;

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

