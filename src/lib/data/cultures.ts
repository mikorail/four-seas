import type { Rng } from '#lib/rng';

export type CultureId =
	| 'han'
	| 'japanese'
	| 'korean'
	| 'viet'
	| 'siamese'
	| 'malay'
	| 'indian'
	| 'tibetan'
	| 'steppe'
	| 'persian'
	| 'ottoman'
	| 'swahili'
	| 'european'
	| 'pacific';

export type Gender = 'm' | 'f';

export interface Culture {
	id: CultureId;
	label: string;
	adjective: string;
	homeland: string;
	family?: string[];
	familyFirst?: boolean;
	male: string[];
	female: string[];
	ruler: (year: number) => string;
	official: string;
	holyPlace: string;
	festival: string;
	game: string;
	drink: string;
	food: string;
	skin: string[];
	palette: string[]; // robe colors
	hat: (year: number, g: Gender) => HatKind;
}

export type HatKind =
	| 'futou'
	| 'queue'
	| 'topknot'
	| 'kasa'
	| 'gat'
	| 'nonla'
	| 'chada'
	| 'songkok'
	| 'turban'
	| 'taj'
	| 'kavuk'
	| 'fez'
	| 'kofia'
	| 'tricorn'
	| 'brim'
	| 'tophat'
	| 'furhat'
	| 'bun'
	| 'veil'
	| 'hairpin'
	| 'kabuto'
	| 'bork'
	| 'pith'
	| 'bandana'
	| 'bare';

const skinsEast = ['#f1d3b3', '#e8c39e', '#dcb08a', '#e9c8a5'];
const skinsSouth = ['#c58c5c', '#a9724a', '#8d5a36', '#b98054'];
const skinsWest = ['#e3b893', '#d2a07a', '#c18a62'];

export const CULTURES: Record<CultureId, Culture> = {
	han: {
		id: 'han',
		label: 'Middle Kingdom',
		adjective: 'Chinese',
		homeland: 'the Middle Kingdom',
		family: ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Lin', 'Guo', 'Gao', 'Luo', 'Shen'],
		familyFirst: true,
		male: ['Wei', 'Jian', 'Ming', 'Hao', 'Zhi', 'Yong', 'Bo', 'Wen', 'Kang', 'Rui', 'Tao', 'Jun', 'Heng', 'Shou', 'Zhen'],
		female: ['Mei', 'Lan', 'Xiu', 'Yan', 'Hua', 'Ying', 'Lian', 'Fang', 'Zhen', 'Yue', 'Qing', 'Xia'],
		ruler: (y) => (y < 1644 ? 'the Ming Emperor' : 'the Qing Emperor'),
		official: 'Magistrate',
		holyPlace: 'temple',
		festival: 'the Lantern Festival',
		game: 'mahjong-style tiles',
		drink: 'yellow rice wine',
		food: 'pork dumplings',
		skin: skinsEast,
		palette: ['#8c2d2d', '#2f4a6b', '#3f5e45', '#6b4a2f', '#7a5b8c'],
		hat: (y, g) => (g === 'f' ? 'hairpin' : y < 1644 ? 'futou' : 'queue')
	},
	japanese: {
		id: 'japanese',
		label: 'Nihon',
		adjective: 'Japanese',
		homeland: 'the islands of Nihon',
		family: ['Tanaka', 'Mori', 'Kuroda', 'Sakamoto', 'Hosokawa', 'Date', 'Shimazu', 'Otomo', 'Arima', 'Nakamura', 'Saito', 'Kobayashi', 'Takeda', 'Sanada'],
		familyFirst: true,
		male: ['Takeshi', 'Nobuyuki', 'Kenshin', 'Masamune', 'Ryoma', 'Hanzo', 'Ichiro', 'Kanbei', 'Yoshitsune', 'Tadakatsu', 'Musashi', 'Jubei'],
		female: ['Oichi', 'Chiyo', 'Hana', 'Yuki', 'Tomoe', 'Ginchiyo', 'Sen', 'Kiku', 'Ume', 'Sayo', 'Okuni'],
		ruler: (y) => (y < 1603 ? 'the warlord of the realm' : y < 1868 ? 'the Shogun' : 'the Meiji Emperor'),
		official: 'Bugyō',
		holyPlace: 'shrine',
		festival: 'Obon',
		game: 'hanafuda cards',
		drink: 'warm sake',
		food: 'grilled eel',
		skin: skinsEast,
		palette: ['#2b3a55', '#7d2e2e', '#4a5d3a', '#3a3a3a', '#8a6d3b'],
		hat: (y, g) => (g === 'f' ? 'bun' : y > 1872 ? 'tophat' : 'topknot')
	},
	korean: {
		id: 'korean',
		label: 'Joseon',
		adjective: 'Korean',
		homeland: 'Joseon',
		family: ['Kim', 'Yi', 'Park', 'Choi', 'Jeong', 'Kang', 'Yun', 'Han', 'Shin', 'Hwang'],
		familyFirst: true,
		male: ['Sun-sin', 'Gil-dong', 'Jeong-ho', 'Min-jun', 'Yeong-cheol', 'Seok', 'Hyun', 'Dae-ho', 'Jae-won'],
		female: ['Jin-i', 'Seo-yeon', 'Ok-hee', 'Mi-rae', 'Su-bin', 'Yeong-ae', 'Hye-gyeong'],
		ruler: () => 'the King of Joseon',
		official: 'Yangban official',
		holyPlace: 'Confucian shrine',
		festival: 'Chuseok',
		game: 'yut sticks',
		drink: 'makgeolli',
		food: 'kimchi and rice',
		skin: skinsEast,
		palette: ['#e8e2d0', '#355070', '#6d597a', '#b56576', '#3d5a40'],
		hat: (_y, g) => (g === 'f' ? 'bun' : 'gat')
	},
	viet: {
		id: 'viet',
		label: 'Đại Việt',
		adjective: 'Viet',
		homeland: 'Đại Việt',
		family: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Võ', 'Đặng', 'Bùi'],
		familyFirst: true,
		male: ['Văn Hùng', 'Đức Minh', 'Quang Trung', 'Văn Thành', 'Hữu Phước', 'Công Trứ', 'Văn Long'],
		female: ['Thị Lan', 'Thị Mai', 'Thị Hoa', 'Thị Xuân', 'Ngọc Ánh', 'Thị Kính', 'Hồ Xuân'],
		ruler: (y) => (y < 1802 ? 'the Lê Emperor' : 'the Nguyễn Emperor'),
		official: 'Quan',
		holyPlace: 'pagoda',
		festival: 'Tết',
		game: 'cockfighting bets',
		drink: 'rice liquor',
		food: 'fish sauce noodles',
		skin: ['#e0b48c', '#d4a276', '#c99a6e'],
		palette: ['#3e6b48', '#8b3a3a', '#2f4858', '#a88b4a'],
		hat: (_y, g) => (g === 'f' ? 'nonla' : 'nonla')
	},
	siamese: {
		id: 'siamese',
		label: 'Siam & Burma',
		adjective: 'Siamese',
		homeland: 'the Mekong and Irrawaddy kingdoms',
		male: ['Somchai', 'Narai', 'Prasat', 'Chakri', 'Boonmee', 'Sombat', 'Bayin', 'Thura', 'Kyaw', 'Aung'],
		female: ['Malee', 'Kanya', 'Suriyothai', 'Ratana', 'Siriporn', 'Thiri', 'Khin', 'Saw'],
		ruler: (y) => (y < 1767 ? 'the King of Ayutthaya' : 'the King of Siam'),
		official: 'Phraya',
		holyPlace: 'wat',
		festival: 'Songkran',
		game: 'takraw wagers',
		drink: 'palm toddy',
		food: 'green curry',
		skin: skinsSouth,
		palette: ['#c9832c', '#7a2e4d', '#2b5f75', '#4f7942'],
		hat: (_y, g) => (g === 'f' ? 'bun' : 'chada')
	},
	malay: {
		id: 'malay',
		label: 'Nusantara',
		adjective: 'Malay',
		homeland: 'the archipelago of Nusantara',
		male: ['Hang Tuah', 'Sutan', 'Raden Mas', 'Abdul Rahman', 'Iskandar', 'Ki Ageng', 'Joko', 'Bagus', 'Wira', 'Hang Jebat', 'Datu'],
		female: ['Tun Fatimah', 'Siti', 'Dewi', 'Kartini', 'Kalinyamat', 'Ayu', 'Laksmi', 'Kemala', 'Cut Nyak'],
		ruler: () => 'the Sultan',
		official: 'Syahbandar',
		holyPlace: 'mosque',
		festival: 'Hari Raya',
		game: 'congkak stones',
		drink: 'arak',
		food: 'rendang',
		skin: skinsSouth,
		palette: ['#7b2d26', '#d4a017', '#1f5f5b', '#4b3869', '#2d4a22'],
		hat: (_y, g) => (g === 'f' ? 'veil' : 'songkok')
	},
	indian: {
		id: 'indian',
		label: 'Hindustan',
		adjective: 'Hindustani',
		homeland: 'Hindustan',
		male: ['Abul Fazl', 'Rajendra', 'Vikram', 'Akbar Khan', 'Dara', 'Shivaji', 'Ravi', 'Aziz', 'Tanaji', 'Bahadur', 'Ranjit', 'Tipu'],
		female: ['Nur Jahan', 'Mumtaz', 'Lakshmi', 'Ahilya', 'Jodha', 'Rani', 'Padmini', 'Zeb', 'Chand Bibi', 'Meera'],
		ruler: (y) => (y < 1526 ? 'the Sultan of Delhi' : y < 1858 ? 'the Mughal Padishah' : 'the British Crown'),
		official: 'Mansabdar',
		holyPlace: 'temple',
		festival: 'Diwali',
		game: 'chaupar dice',
		drink: 'spiced chai',
		food: 'biryani',
		skin: skinsSouth,
		palette: ['#c1440e', '#f2a541', '#3b5998', '#ffffff', '#6a2c70'],
		hat: (_y, g) => (g === 'f' ? 'veil' : 'turban')
	},
	tibetan: {
		id: 'tibetan',
		label: 'Bod',
		adjective: 'Tibetan',
		homeland: 'the high plateau of Bod',
		male: ['Tenzin', 'Dorje', 'Lobsang', 'Tashi', 'Yeshe', 'Norbu', 'Sonam', 'Karma'],
		female: ['Dolma', 'Pema', 'Yangchen', 'Lhamo', 'Dechen', 'Kunga'],
		ruler: (y) => (y < 1642 ? 'the King of Tsang' : 'the Dalai Lama'),
		official: 'Dzongpön',
		holyPlace: 'gompa',
		festival: 'Losar',
		game: 'sho dice',
		drink: 'butter tea',
		food: 'tsampa',
		skin: ['#c99067', '#b57d55', '#d19e74'],
		palette: ['#8b1e1e', '#d4a017', '#2b4c7e', '#5c3d2e'],
		hat: (_y, g) => (g === 'f' ? 'bun' : 'furhat')
	},
	steppe: {
		id: 'steppe',
		label: 'The Steppe',
		adjective: 'Steppe',
		homeland: 'the endless steppe',
		male: ['Babur', 'Altan', 'Khalil', 'Batu', 'Ulugh', 'Esen', 'Galdan', 'Temur', 'Arslan', 'Bolat'],
		female: ['Khutulun', 'Aisha', 'Gulnara', 'Saule', 'Mandukhai', 'Altynai'],
		ruler: () => 'the Khan',
		official: 'Beg',
		holyPlace: 'madrasa',
		festival: 'Nauryz',
		game: 'knucklebone dice',
		drink: 'kumis',
		food: 'mutton plov',
		skin: ['#d9ae86', '#c99b70', '#e2bb93'],
		palette: ['#5b3e96', '#2a7f62', '#b5651d', '#3c3c64'],
		hat: (_y, g) => (g === 'f' ? 'veil' : 'furhat')
	},
	persian: {
		id: 'persian',
		label: 'Persia & Arabia',
		adjective: 'Persian',
		homeland: 'the lands of Persia and Arabia',
		male: ['Abbas', 'Rustam', 'Dariush', 'Hafez', 'Karim', 'Omar', 'Hamid', 'Sinbad', 'Yusuf', 'Ibn Majid', 'Nader'],
		female: ['Shirin', 'Leila', 'Parisa', 'Zahra', 'Roshan', 'Fatima', 'Amira', 'Pari Khan'],
		ruler: (y) => (y < 1736 ? 'the Safavid Shah' : 'the Shah'),
		official: 'Vizier',
		holyPlace: 'mosque',
		festival: 'Nowruz',
		game: 'backgammon',
		drink: 'rosewater sherbet',
		food: 'saffron rice',
		skin: skinsWest,
		palette: ['#1d4e89', '#00a6a6', '#9c2c2c', '#e0b84c', '#3e2a5c'],
		hat: (_y, g) => (g === 'f' ? 'veil' : 'taj')
	},
	ottoman: {
		id: 'ottoman',
		label: 'Sublime Porte',
		adjective: 'Ottoman',
		homeland: 'the Sublime Porte',
		male: ['Mehmed', 'Süleyman', 'Piri', 'Hayreddin', 'Evliya', 'Selim', 'Murad', 'Kemal', 'Ibrahim', 'Mustafa'],
		female: ['Hürrem', 'Mihrimah', 'Kösem', 'Ayşe', 'Nilüfer', 'Turhan', 'Esma'],
		ruler: () => 'the Ottoman Sultan',
		official: 'Pasha',
		holyPlace: 'mosque',
		festival: 'Ramazan Bayramı',
		game: 'tavla',
		drink: 'thick coffee',
		food: 'baklava',
		skin: skinsWest,
		palette: ['#a4161a', '#0b525b', '#e9c46a', '#264653'],
		hat: (y, g) => (g === 'f' ? 'veil' : y < 1829 ? 'kavuk' : 'fez')
	},
	swahili: {
		id: 'swahili',
		label: 'Swahili Coast',
		adjective: 'Swahili',
		homeland: 'the Swahili coast',
		male: ['Juma', 'Mwinyi', 'Hamisi', 'Bakari', 'Salim', 'Tippu', 'Rashid', 'Fumo Liongo'],
		female: ['Mwana Kupona', 'Zuhura', 'Halima', 'Mwanaisha', 'Saada', 'Rehema'],
		ruler: () => 'the Sultan of the coast',
		official: 'Liwali',
		holyPlace: 'mosque',
		festival: 'Mwaka Kogwa',
		game: 'bao',
		drink: 'spiced coffee',
		food: 'coconut fish',
		skin: ['#7a4a2b', '#5e3920', '#8c5a3c'],
		palette: ['#f4f1de', '#e07a5f', '#3d405b', '#81b29a'],
		hat: (_y, g) => (g === 'f' ? 'veil' : 'kofia')
	},
	pacific: {
		id: 'pacific',
		label: 'Oceania',
		adjective: 'Islander',
		homeland: 'the islands of the great ocean',
		male: ['Kamehameha', 'Liholiho', 'Keōua', 'Kaumualiʻi', 'Tupaia', 'Pōmare', 'Mataʻafa', 'Kekuaokalani'],
		female: ['Kaʻahumanu', 'Keōpūolani', 'Liliʻuokalani', 'Kapiʻolani', 'Purea', 'Teriitaria', 'Nāhiʻenaʻena'],
		ruler: (y) => (y < 1795 ? 'the high chief' : y < 1893 ? 'the King of Hawaiʻi' : 'the island council'),
		official: 'Konohiki',
		holyPlace: 'heiau',
		festival: 'Makahiki',
		game: 'kōnane stones',
		drink: 'ʻawa',
		food: 'poi and roasted pig',
		skin: ['#a8724a', '#956140', '#b98054'],
		palette: ['#8c3b1e', '#d4a017', '#1f5f5b', '#e9dcc0'],
		hat: () => 'bare'
	},
	european: {
		id: 'european',
		label: 'Franks',
		adjective: 'Frankish',
		homeland: 'the lands of the Franks',
		family: ['Pinto', 'da Gama', 'Coen', 'Adams', 'Xavier', 'Ricci', 'Barbosa', 'van Linschoten', 'Raffles', 'Hughes', 'Tasman', 'Fogg', 'de Urdaneta'],
		familyFirst: false,
		male: ['Fernão', 'Vasco', 'Afonso', 'Jan', 'Cornelis', 'William', 'Francis', 'Matteo', 'Duarte', 'Hendrik', 'Phileas', 'Andrés'],
		female: ['Isabel', 'Catarina', 'Maria', 'Elizabeth', 'Anneke', 'Grace', 'Inés', 'Ida'],
		ruler: (y) => (y < 1600 ? 'the Crown of Portugal' : y < 1800 ? 'the Company directors' : 'Her Majesty'),
		official: 'Company factor',
		holyPlace: 'church',
		festival: 'Carnival',
		game: 'piquet cards',
		drink: 'Madeira wine',
		food: 'salt beef and biscuit',
		skin: ['#f3d6c1', '#eac0a2', '#f0cfb5'],
		palette: ['#22223b', '#4a4e69', '#7b2cbf', '#5a3e2b', '#1b4332'],
		hat: (y, g) => (g === 'f' ? 'bun' : y < 1650 ? 'brim' : y < 1800 ? 'tricorn' : 'tophat')
	}
};

export const CULTURE_IDS = Object.keys(CULTURES) as CultureId[];

export interface CulturalAffinity {
	favoredTraits: string[];
	disfavoredTraits: string[];
	politicalSystem: string;
	values: string;
	titles: {
		scholar: string;
		merchant: string;
		warrior: string;
		noble: string;
		traveler: string;
	};
}

export const CULTURAL_AFFINITIES: Record<CultureId, CulturalAffinity> = {
	han: {
		favoredTraits: ['scholar', 'meticulous', 'poet', 'calligrapher', 'dutiful', 'healer'],
		disfavoredTraits: ['bandit', 'brute', 'scoundrel', 'rowdy'],
		politicalSystem: 'Imperial Bureaucracy & Confucian Civil Meritocracy',
		values: 'Literary merit, ancestral filial piety, ritual propriety',
		titles: { scholar: 'Literatus (士大夫)', merchant: 'Grand Factor (掌柜)', warrior: 'General (将领)', noble: 'Court Dignitary', traveler: 'Honored Guest (贵客)' }
	},
	japanese: {
		favoredTraits: ['ronin', 'stoic', 'duelist', 'honorable', 'loyal'],
		disfavoredTraits: ['coward', 'thief', 'scoundrel', 'reckless'],
		politicalSystem: 'Shogunate & Samurai Feudalism',
		values: 'Bushido chivalry, martial discipline, unwavering honor',
		titles: { scholar: 'Sensei (先生)', merchant: 'Oyakata (親方)', warrior: 'Bushi (武士)', noble: 'Daimyo Emissary', traveler: 'Nanban Traveler (南蛮旅人)' }
	},
	korean: {
		favoredTraits: ['scholar', 'pious', 'meticulous', 'dutiful', 'calligrapher'],
		disfavoredTraits: ['bandit', 'brute', 'rowdy', 'drunkard'],
		politicalSystem: 'Joseon Yangban Civil Hierarchy',
		values: 'Neo-Confucian orthodox virtue, scholarly rigor, clan lineage',
		titles: { scholar: 'Seonbi (선비)', merchant: 'Sangin (상인)', warrior: 'Musa (무사)', noble: 'Yangban Noble', traveler: 'Nagne (나그네)' }
	},
	viet: {
		favoredTraits: ['scholar', 'astute', 'resilient', 'diplomat'],
		disfavoredTraits: ['brute', 'arrogant', 'greedy'],
		politicalSystem: 'Mandarin Royal Court',
		values: 'Southern independence, watercraft prowess, literary mastery',
		titles: { scholar: 'Scholar (Quan)', merchant: 'Merchant (Thương gia)', warrior: 'Commander (Tướng)', noble: 'Mandarin Dignitary', traveler: 'Wayfarer (Khách)' }
	},
	siamese: {
		favoredTraits: ['charismatic', 'diplomat', 'pious', 'trader'],
		disfavoredTraits: ['rowdy', 'blasphemer', 'wrathful'],
		politicalSystem: 'Chakri/Ayutthaya Sacred Monarchy',
		values: 'Theravada Buddhist merit, cosmopolitan royal diplomacy',
		titles: { scholar: 'Acharn', merchant: 'Wanit', warrior: 'Nakrop', noble: 'Khun', traveler: 'Duenthang' }
	},
	malay: {
		favoredTraits: ['sailor', 'navigator', 'charismatic', 'merchant', 'polyglot'],
		disfavoredTraits: ['coward', 'cheater', 'parsimonious'],
		politicalSystem: 'Maritime Sultanate & Harbor Guilds',
		values: 'Ocean voyaging, open-port trade hospitality, loyalty to the Sultan',
		titles: { scholar: 'Pendeta', merchant: 'Orang Kaya', warrior: 'Pendekar', noble: 'Datuk', traveler: 'Nakhoda (Sea Captain)' }
	},
	indian: {
		favoredTraits: ['ascetic', 'scholar', 'merchant', 'pious', 'polyglot'],
		disfavoredTraits: ['brute', 'sacrilegious', 'oaf'],
		politicalSystem: 'Mughal & Princely Raj Courts',
		values: 'Dharma, mathematical and astrological depth, bazaar credit networks',
		titles: { scholar: 'Pandit', merchant: 'Seth / Banya', warrior: 'Subedar', noble: 'Raja / Nawab', traveler: 'Yatri' }
	},
	tibetan: {
		favoredTraits: ['ascetic', 'pious', 'healer', 'resilient', 'humble'],
		disfavoredTraits: ['greedy', 'vain', 'ruthless'],
		politicalSystem: 'Monastic Gelug Theocracy',
		values: 'Compassion, sacred pilgrimage, mountain endurance',
		titles: { scholar: 'Geshe', merchant: 'Tsongpa', warrior: 'Dpa-bo', noble: 'Kushok', traveler: 'Neykorba (Pilgrim)' }
	},
	steppe: {
		favoredTraits: ['rider', 'falconer', 'hunter', 'resilient', 'brave'],
		disfavoredTraits: ['coward', 'soft', 'schemer'],
		politicalSystem: 'Nomadic Tribal Khanate',
		values: 'Steppe endurance, equine mastery, hospitality to wanderers',
		titles: { scholar: 'Bakhshi', merchant: 'Ortogh', warrior: 'Baghatur', noble: 'Noyan / Khan', traveler: 'Ayanchin' }
	},
	persian: {
		favoredTraits: ['poet', 'polyglot', 'diplomat', 'astronomer', 'eloquent'],
		disfavoredTraits: ['vulgar', 'brute', 'stingy'],
		politicalSystem: 'Safavid / Qajar Imperial Court',
		values: 'Poetic refinement, garden geometry, bazaar trust',
		titles: { scholar: 'Mirza', merchant: 'Khwaja', warrior: 'Pahlavan', noble: 'Khan', traveler: 'Siyahatgar' }
	},
	ottoman: {
		favoredTraits: ['diplomat', 'soldier', 'merchant', 'tactician'],
		disfavoredTraits: ['traitor', 'bandit', 'oaf'],
		politicalSystem: 'Sublime Porte & Janissary Administration',
		values: 'Imperial order, Mediterranean trade, architectural grandeur',
		titles: { scholar: 'Effendi', merchant: 'Chelebi', warrior: 'Agha', noble: 'Pasha', traveler: 'Seyyah' }
	},
	swahili: {
		favoredTraits: ['sailor', 'merchant', 'navigator', 'diplomat'],
		disfavoredTraits: ['cheat', 'cruel', 'isolationist'],
		politicalSystem: 'Coast Dhow Sultanates',
		values: 'Monsoon sailing, trade generosity, coral stone civilization',
		titles: { scholar: 'Mwalimu', merchant: 'Tajiri', warrior: 'Shujaa', noble: 'Mwinyi', traveler: 'Msafiri' }
	},
	european: {
		favoredTraits: ['inventor', 'navigator', 'gunsmith', 'scholar', 'explorer'],
		disfavoredTraits: ['superstitious', 'lazy', 'lawless'],
		politicalSystem: 'Merchant Republics & Chartered Companies',
		values: 'Scientific empirical inquiry, chartered navigation, contractual law',
		titles: { scholar: 'Doctor / Scholar', merchant: 'Factor / Factor-General', warrior: 'Captain', noble: 'Chevalier / Signor', traveler: 'Voyager' }
	},
	pacific: {
		favoredTraits: ['wayfinder', 'diver', 'storyteller', 'resilient'],
		disfavoredTraits: ['wasteful', 'dishonest', 'quarrelsome'],
		politicalSystem: 'Island Chiefdoms',
		values: 'Star navigation, reef stewardship, communal sharing',
		titles: { scholar: 'Keeper of Lore', merchant: 'Gift-Exchanger', warrior: 'Guardian', noble: 'Aliʻi', traveler: 'Wayfinder' }
	}
};

export function makeName(rng: Rng, c: Culture, g: Gender): string {
	const given = rng.pick(g === 'm' ? c.male : c.female);
	if (!c.family) return given;
	const fam = rng.pick(c.family);
	return c.familyFirst ? `${fam} ${given}` : `${given} ${fam}`;
}
