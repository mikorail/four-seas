import type { CultureId, Gender } from './cultures';
import type { Role } from '#lib/game/types';
import { CITY, CITIES } from './world';
import { CULTURES } from './cultures';
import { Rng } from '#lib/rng';

export interface Notable {
	id: string;
	cityId: string;
	name: string;
	title: string;
	culture: CultureId;
	gender: Gender;
	role: Role;
	traits: string[];
	blurb: string;
	favoredActivity: 'tea' | 'boardgame' | 'debate' | 'secrets' | 'poetry';
	greeting: string;
}

export const NOTABLES: Record<string, Notable> = {
	beijing: {
		id: 'notable-beijing',
		cityId: 'beijing',
		name: 'Master Lu Shen',
		title: 'Imperial Academy Calligrapher',
		culture: 'han',
		gender: 'm',
		role: 'scholar',
		traits: ['poet', 'astronomer', 'meticulous'],
		blurb: 'Renowned master of cursive script who has served three ministries and knows the secret whispers of the Forbidden City.',
		favoredActivity: 'tea',
		greeting: '“Ink dries faster than human memory, traveller. Sit. Let us steep this year’s Dragon Well.”'
	},
	nanjing: {
		id: 'notable-nanjing',
		cityId: 'nanjing',
		name: 'Lady Mei Xiang',
		title: 'Mistress of the Cloud Brocade Guild',
		culture: 'han',
		gender: 'f',
		role: 'merchant',
		traits: ['shrewd', 'connected', 'patron'],
		blurb: 'The wealthiest silk merchant on the Qinhuai River, whose looms supply both the court and Portuguese galleons.',
		favoredActivity: 'boardgame',
		greeting: '“A game of Weiqi while the barges unload? Every stone placed on the grid is like a trade ship upon the ocean.”'
	},
	hangzhou: {
		id: 'notable-hangzhou',
		cityId: 'hangzhou',
		name: 'Hermit Lin of the Reeds',
		title: 'West Lake Tea Sage',
		culture: 'han',
		gender: 'm',
		role: 'monk',
		traits: ['pious', 'healer', 'austere'],
		blurb: 'Dwells in a thatched pavilion beside the Solitary Hill, brewing spring water from the Galloping Tiger Spring.',
		favoredActivity: 'tea',
		greeting: '“The water of the lake reflects nothing that wishes to be remembered. Rest your pack, friend.”'
	},
	guangzhou: {
		id: 'notable-guangzhou',
		cityId: 'guangzhou',
		name: 'Howqua (Wu Bingjian)',
		title: 'Senior Factor of the Thirteen Factories',
		culture: 'han',
		gender: 'm',
		role: 'merchant',
		traits: ['shrewd', 'patron', 'diplomat'],
		blurb: 'The richest merchant prince under Heaven, holding the keys to China’s foreign trade with Europe and America.',
		favoredActivity: 'debate',
		greeting: '“Silver speaks every language from London to Peking without an accent. What news do you bring from beyond the straits?”'
	},
	kyoto: {
		id: 'notable-kyoto',
		cityId: 'kyoto',
		name: 'Master Sen no Sotan',
		title: 'Grand Tea Master of Urasenke',
		culture: 'japanese',
		gender: 'm',
		role: 'performer',
		traits: ['poet', 'austere', 'perfectionist'],
		blurb: 'Grandson of Sen no Rikyu, who preserves the austere spirit of Wabi tea amidst the political turmoil of the shogunate.',
		favoredActivity: 'tea',
		greeting: '“One meeting, one opportunity. In this tea hut, emperor and beggar bow equally beneath the low lintel.”'
	},
	edo: {
		id: 'notable-edo',
		cityId: 'edo',
		name: 'Jiro the Kabuki Chronicler',
		title: 'Playwright of the Floating World',
		culture: 'japanese',
		gender: 'm',
		role: 'performer',
		traits: ['cynic', 'raconteur', 'connected'],
		blurb: 'Penned celebrated revenge dramas in the pleasure district of Yoshiwara; knows every actor, ronin, and magistrate by name.',
		favoredActivity: 'poetry',
		greeting: '“Life is a wooden stage and Edo is eager for fresh tragedies. What story do your boots tell tonight?”'
	},
	osaka: {
		id: 'notable-osaka',
		cityId: 'osaka',
		name: 'Yodoya Koan',
		title: 'Titan of the Dōjima Rice Exchange',
		culture: 'japanese',
		gender: 'm',
		role: 'merchant',
		traits: ['resourceful', 'gambler', 'shrewd'],
		blurb: 'Created the world’s first futures exchange, trading rice tickets before the harvests have even sprouted.',
		favoredActivity: 'boardgame',
		greeting: '“A match of Shogi? Watch how the pawn advances; patience and leverage turn copper into mountains of gold.”'
	},
	hanseong: {
		id: 'notable-hanseong',
		cityId: 'hanseong',
		name: 'Scholar Jeong Yak-yong',
		title: 'Silhak Polymath of the Eastern Gate',
		culture: 'korean',
		gender: 'm',
		role: 'scholar',
		traits: ['inventor', 'scholar', 'idealist'],
		blurb: 'Practical scholar who designs cranes, maps fortress battlements, and dreams of agricultural justice across Joseon.',
		favoredActivity: 'debate',
		greeting: '“True learning serves the people, not dusty commentaries. Tell me: what mechanical arts flourish in the lands you crossed?”'
	},
	malacca: {
		id: 'notable-malacca',
		cityId: 'malacca',
		name: 'Nakhoda Ismail',
		title: 'Master Navigator of the Red Strait',
		culture: 'malay',
		gender: 'm',
		role: 'sailor',
		traits: ['sea-dog', 'connected', 'brave'],
		blurb: 'Veterans of thirty monsoon voyages across the Andaman Sea; knows the shoals where pirate perahu lie in wait.',
		favoredActivity: 'secrets',
		greeting: '“The tide waits for neither king nor Sultan. Drink this spiced coffee; I have charts that map uncharted channels.”'
	},
	batavia: {
		id: 'notable-batavia',
		cityId: 'batavia',
		name: 'Cornelis van Hout',
		title: 'Cartographer of the Castle Factorij',
		culture: 'european',
		gender: 'm',
		role: 'scholar',
		traits: ['cynic', 'linguist', 'meticulous'],
		blurb: 'Disillusioned Dutch mapmaker whose copperplate charts of the Spice Islands are bought for fortunes in Amsterdam.',
		favoredActivity: 'secrets',
		greeting: '“The tropical fever has taken my teeth, but not my eyes. Share your route notes, and I shall share the Company’s private soundings.”'
	},
	delhi: {
		id: 'notable-delhi',
		cityId: 'delhi',
		name: 'Mirza Asadullah Khan',
		title: 'Poet of Chandni Chowk',
		culture: 'indian',
		gender: 'm',
		role: 'performer',
		traits: ['poet', 'cynic', 'raconteur'],
		blurb: 'Master of the Urdu ghazal whose verses distill the heartbreak, grandeur, and decaying splendor of the Mughal court.',
		favoredActivity: 'poetry',
		greeting: '“Thousands of desires, and each desire worth dying for. Sit, traveller. Recite a verse from the frontiers.”'
	},
	agra: {
		id: 'notable-agra',
		cityId: 'agra',
		name: 'Ustad Isa of the Yamuna',
		title: 'Master Carver of Marble',
		culture: 'indian',
		gender: 'm',
		role: 'scholar',
		traits: ['artisan', 'visionary', 'pious'],
		blurb: 'Craftsman who cuts pietra dura floral inlays for imperial mausoleums with lapis lazuli and carnelian.',
		favoredActivity: 'debate',
		greeting: '“Stone has a voice when struck by true geometry. Have you seen any domes in your wanderings that float like our white marble?”'
	},
	isfahan: {
		id: 'notable-isfahan',
		cityId: 'isfahan',
		name: 'Reza Abbasi the Younger',
		title: 'Court Miniaturist of Ali Qapu',
		culture: 'persian',
		gender: 'm',
		role: 'performer',
		traits: ['artist', 'poet', 'hedonist'],
		blurb: 'Master of single-leaf portraiture who captures court youths, falconers, and poets in graceful sinuous lines.',
		favoredActivity: 'poetry',
		greeting: '“Isfahan is half the world; the other half is longing. Let us drink Shiraz wine and speak of beauty under the turquoise tiles.”'
	},
	samarkand: {
		id: 'notable-samarkand',
		cityId: 'samarkand',
		name: 'Mirzo Ulug the Elder',
		title: 'Stargazer of the Registan',
		culture: 'steppe',
		gender: 'm',
		role: 'scholar',
		traits: ['astronomer', 'scholar', 'visionary'],
		blurb: 'Inheritor of Ulugh Beg’s astronomical tables; measures planetary movements with giant stone sextants beneath the desert stars.',
		favoredActivity: 'debate',
		greeting: '“The stars over Samarkand do not wander by chance. Tell me of the constellations in the southern seas!”'
	},
	istanbul: {
		id: 'notable-istanbul',
		cityId: 'istanbul',
		name: 'Evliya the Chronicler',
		title: 'Raconteur of the Golden Horn',
		culture: 'ottoman',
		gender: 'm',
		role: 'scholar',
		traits: ['raconteur', 'linguist', 'curious'],
		blurb: 'Has traveled for forty years through fifty provinces, writing down every legend, banquet, and ghost story in the empire.',
		favoredActivity: 'secrets',
		greeting: '“‘Travel and health!’ they say. Welcome to the crossroads of continents! Tell me everything you saw between here and Cathay!”'
	},
	alexandria: {
		id: 'notable-alexandria',
		cityId: 'alexandria',
		name: 'Dr. Hypatios of the Port',
		title: 'Archivist of Sunken Papyrus',
		culture: 'european',
		gender: 'm',
		role: 'scholar',
		traits: ['antiquarian', 'scholar', 'linguist'],
		blurb: 'Spends nights piecing together Greek and Coptic fragments retrieved from desert monasteries and harbor dredges.',
		favoredActivity: 'secrets',
		greeting: '“The great library burned, but the desert sand keeps its promises. What ancient names did they whisper where you walked?”'
	},
	damascus: {
		id: 'notable-damascus',
		cityId: 'damascus',
		name: 'Hakim Tariq ibn Yusuf',
		title: 'Grand Apothecary of Al-Buzuriyah',
		culture: 'ottoman',
		gender: 'm',
		role: 'healer',
		traits: ['healer', 'botanist', 'generous'],
		blurb: 'Blends Damask rosewater with Himalayan musk and frankincense; healers from three continents seek his diagnostic counsel.',
		favoredActivity: 'tea',
		greeting: '“Bismillah. Inhale this mint and wild sumac. The body heals when the spirit finds quiet company.”'
	},
	athens: {
		id: 'notable-athens',
		cityId: 'athens',
		name: 'Perikles the Antiquary',
		title: 'Guide to the Pentelic Ruins',
		culture: 'european',
		gender: 'm',
		role: 'scholar',
		traits: ['philosopher', 'raconteur', 'proud'],
		blurb: 'Recites Thucydides amidst the broken columns of the Acropolis, guiding Venetian officers and wandering poets.',
		favoredActivity: 'debate',
		greeting: '“The stones of Athens still remember Socrates. Come, let us test whether virtue can be taught across distant nations.”'
	},
	venice: {
		id: 'notable-venice',
		cityId: 'venice',
		name: 'Signora Elena Morosini',
		title: 'Patrician Patroness of the Grand Canal',
		culture: 'european',
		gender: 'f',
		role: 'noble',
		traits: ['patron', 'connected', 'diplomat'],
		blurb: 'Her salon overlooks the Rialto; her letters reach ambassadors in Vienna, Lisbon, and Constantinople.',
		favoredActivity: 'debate',
		greeting: '“Venice is a city made of water and secrets. Take a seat by the balcony; tell me how the princes of Asia conduct their councils.”'
	}
};

/** Get the Notable resident of this city, with procedural fallback for any minor settlement. */
export function notableOfCity(cityId: string, year: number): Notable {
	if (NOTABLES[cityId]) return NOTABLES[cityId];
	const c = CITY[cityId] ?? CITIES[0];
	const rng = new Rng(cityId + ':' + year + ':notable');
	const g: Gender = rng.chance(0.5) ? 'f' : 'm';
	const cult = c.culture;
	const maleNames: Record<CultureId, string[]> = {
		han: ['Master Zhao', 'Scholar Wen', 'Elder Guo'],
		japanese: ['Master Kenji', 'Tadashi the Elder', 'Monk Ryokan'],
		korean: ['Scholar Min', 'Master Park', 'Yun the Elder'],
		viet: ['Scholar Duc', 'Elder Phan', 'Master Hoang'],
		siamese: ['Somchai the Elder', 'Phra Anan', 'Kiat the Factor'],
		malay: ['Datuk Mansur', 'Panglima Daud', 'Nakhoda Harun'],
		indian: ['Pandit Sharma', 'Seth Anand', 'Hakim Kabir'],
		persian: ['Mirza Farhad', 'Ustad Jalal', 'Sheikh Navid'],
		ottoman: ['Efendi Mehmet', 'Aga Ibrahim', 'Dervish Selim'],
		steppe: ['Batu the Elder', 'Toghrul Noyan', 'Chuluun the Herder'],
		tibetan: ['Lama Tenzin', 'Norbu the Trader', 'Sonam the Weaver'],
		swahili: ['Bwana Mwinyi', 'Sheikh Bakari', 'Fundi Omari'],
		european: ['Signor Rossi', 'Herr Brandt', 'Don Alvarez'],
		pacific: ['Elder Keanu', 'Tane the Navigator', 'Ariki Moana']
	};
	const femaleNames: Record<CultureId, string[]> = {
		han: ['Madame Lin', 'Lady Chun', 'Auntie Mei'],
		japanese: ['Lady Chiyo', 'O-Ren the Hostess', 'Shizuka the Weaver'],
		korean: ['Lady Shin', 'Mistress Hae', 'Eun-ji the Healer'],
		viet: ['Madame Xuan', 'Lady Thuy', 'Auntie Lien'],
		siamese: ['Mae Mali', 'Lady Busaba', 'Kannika the Merchant'],
		malay: ['Mak Cik Siti', 'Dayang Zulaikha', 'Inche Rahmah'],
		indian: ['Bibi Fatima', 'Devi Kamla', 'Bai Sundari'],
		persian: ['Khanum Shirin', 'Banu Parisa', 'Lady Ziba'],
		ottoman: ['Hanım Ayşe', 'Hatun Leyla', 'Emine the Herbalist'],
		steppe: ['Bayan the Mother', 'Altani the Seer', 'Sarangerel'],
		tibetan: ['Ani Pema', 'Dolma the Spinner', 'Lhamo the Hostess'],
		swahili: ['Bi Mwana', 'Mama Amina', 'Asha the Weaver'],
		european: ['Signora Bianca', 'Madame Claire', 'Doña Isabel'],
		pacific: ['Moana the Elder', 'Leilani', 'Hina the Storyteller']
	};
	const nameList = g === 'm' ? (maleNames[cult] ?? maleNames.han) : (femaleNames[cult] ?? femaleNames.han);
	const name = rng.pick(nameList);
	const activities: Notable['favoredActivity'][] = ['tea', 'boardgame', 'debate', 'secrets', 'poetry'];
	const act = rng.pick(activities);
	return {
		id: `notable-${cityId}`,
		cityId,
		name,
		title: `Respected Elder of ${c.name}`,
		culture: cult,
		gender: g,
		role: 'elder',
		traits: ['observant', 'resourceful'],
		blurb: `A cornerstone of the neighborhood who knows every arrival, departure, and local hearth in ${c.name}.`,
		favoredActivity: act,
		greeting: `“Welcome to ${c.name}, wayfarer. The kettle is on the brazier; come take shelter from the road.”`
	};
}
