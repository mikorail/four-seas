import type { CultureId } from './cultures';

export type Good =
	| 'silk'
	| 'tea'
	| 'porcelain'
	| 'pepper'
	| 'nutmeg'
	| 'cloves'
	| 'cinnamon'
	| 'cotton'
	| 'indigo'
	| 'sandalwood'
	| 'ginseng'
	| 'lacquerware'
	| 'steel blades'
	| 'pearls'
	| 'coffee'
	| 'horses'
	| 'carpets'
	| 'gemstones'
	| 'furs'
	| 'glassware'
	| 'silver bars'
	| 'woolens'
	| 'sugar'
	| 'camphor';

export interface City {
	id: string;
	name: string;
	alt?: { until: number; name: string }[]; // earlier names
	lat: number;
	lon: number;
	culture: CultureId;
	port: boolean;
	exports: Good;
	from?: number;
	until?: number;
	blurb: string;
	secret?: boolean; // hidden until a clue reveals the way
}

export const CITIES: City[] = [
	// Middle Kingdom
	{ id: 'beijing', name: 'Peking', lat: 39.9, lon: 116.4, culture: 'han', port: false, exports: 'porcelain', blurb: 'Seat of the Dragon Throne behind vermilion walls.' },
	{ id: 'nanjing', name: 'Nanking', lat: 32.06, lon: 118.8, culture: 'han', port: false, exports: 'silk', blurb: 'The southern capital, its walls the longest in the world.' },
	{ id: 'hangzhou', name: 'Hangchow', lat: 30.27, lon: 120.15, culture: 'han', port: true, exports: 'tea', blurb: 'West Lake, where poets drown in beauty and Longjing tea.' },
	{ id: 'shanghai', name: 'Shanghai', lat: 31.23, lon: 121.47, culture: 'han', port: true, exports: 'cotton', blurb: 'A county town of cotton weavers on the Huangpu.' },
	{ id: 'quanzhou', name: 'Zaitun', lat: 24.9, lon: 118.6, culture: 'han', port: true, exports: 'porcelain', blurb: 'Old harbor of a hundred faiths and a thousand junks.' },
	{ id: 'guangzhou', name: 'Canton', lat: 23.13, lon: 113.26, culture: 'han', port: true, exports: 'tea', blurb: 'The one door through which the world may trade with China.' },
	{ id: 'xian', name: "Xi'an", lat: 34.34, lon: 108.94, culture: 'han', port: false, exports: 'silk', blurb: 'Ancient Chang’an, where the Silk Road begins.' },
	{ id: 'chengdu', name: 'Chengtu', lat: 30.66, lon: 104.06, culture: 'han', port: false, exports: 'silk', blurb: 'Land of abundance, of brocade and fiery peppers.' },
	{ id: 'macau', name: 'Macao', lat: 22.19, lon: 113.54, culture: 'european', port: true, exports: 'silver bars', from: 1557, blurb: 'A Portuguese foothold of churches clinging to a Chinese cape.' },
	{ id: 'hongkong', name: 'Hong Kong', lat: 22.3, lon: 114.17, culture: 'european', port: true, exports: 'silver bars', from: 1842, blurb: 'A barren rock turned into a forest of masts.' },
	{ id: 'kashgar', name: 'Kashgar', lat: 39.47, lon: 75.99, culture: 'steppe', port: false, exports: 'horses', blurb: 'Oasis at the knot of the mountain passes.' },
	{ id: 'urga', name: 'Urga', lat: 47.9, lon: 106.9, culture: 'steppe', port: false, exports: 'furs', from: 1639, blurb: 'A wandering monastery-city of felt tents.' },
	{ id: 'lhasa', name: 'Lhasa', lat: 29.65, lon: 91.1, culture: 'tibetan', port: false, exports: 'gemstones', blurb: 'The place of the gods, beneath the roof of the world.' },
	// Joseon
	{ id: 'hanseong', name: 'Hanseong', lat: 37.57, lon: 126.98, culture: 'korean', port: false, exports: 'ginseng', blurb: 'Royal capital ringed by granite mountains.' },
	{ id: 'busan', name: 'Busan', lat: 35.1, lon: 129.04, culture: 'korean', port: true, exports: 'ginseng', blurb: 'Harbor of the Japan House, gate between two kingdoms.' },
	// Nihon
	{ id: 'kyoto', name: 'Kyoto', lat: 35.01, lon: 135.77, culture: 'japanese', port: false, exports: 'lacquerware', blurb: 'The ancient capital of a thousand shrines.' },
	{ id: 'osaka', name: 'Osaka', lat: 34.69, lon: 135.5, culture: 'japanese', port: true, exports: 'steel blades', blurb: 'The kitchen of the realm, ruled by rice brokers.' },
	{ id: 'edo', name: 'Edo', alt: [], lat: 35.68, lon: 139.69, culture: 'japanese', port: true, exports: 'lacquerware', from: 1603, blurb: 'The Shogun’s city, largest on earth.' },
	{ id: 'nagasaki', name: 'Nagasaki', lat: 32.75, lon: 129.88, culture: 'japanese', port: true, exports: 'camphor', from: 1571, blurb: 'The only window to the barbarian West.' },
	{ id: 'kagoshima', name: 'Kagoshima', lat: 31.6, lon: 130.56, culture: 'japanese', port: true, exports: 'sugar', blurb: 'Satsuma’s smoking volcano-harbor.' },
	// Đại Việt
	{ id: 'thanglong', name: 'Hanoi', alt: [{ until: 1831, name: 'Thăng Long' }], lat: 21.03, lon: 105.85, culture: 'viet', port: false, exports: 'silk', blurb: 'City of the ascending dragon on the Red River.' },
	{ id: 'hoian', name: 'Hội An', alt: [], lat: 15.88, lon: 108.33, culture: 'viet', port: true, exports: 'cinnamon', blurb: 'Faifo, lantern-lit port of Japanese and Chinese quarters.' },
	{ id: 'hue', name: 'Huế', lat: 16.46, lon: 107.59, culture: 'viet', port: true, exports: 'sandalwood', blurb: 'Perfume River citadel of the Nguyễn lords.' },
	{ id: 'saigon', name: 'Saigon', lat: 10.78, lon: 106.7, culture: 'viet', port: true, exports: 'sugar', from: 1698, blurb: 'Rice-rich frontier in the Mekong delta.' },
	// Siam & Burma & Khmer
	{ id: 'ayutthaya', name: 'Ayutthaya', lat: 14.35, lon: 100.57, culture: 'siamese', port: true, exports: 'sandalwood', until: 1767, blurb: 'An island city of three hundred golden temples.' },
	{ id: 'bangkok', name: 'Bangkok', lat: 13.75, lon: 100.5, culture: 'siamese', port: true, exports: 'sugar', from: 1782, blurb: 'The new royal city of angels on the Chao Phraya.' },
	{ id: 'pegu', name: 'Pegu', lat: 17.33, lon: 96.48, culture: 'siamese', port: true, exports: 'gemstones', blurb: 'Glittering Mon capital, famed for rubies.' },
	{ id: 'mandalay', name: 'Mandalay', lat: 21.97, lon: 96.08, culture: 'siamese', port: false, exports: 'gemstones', from: 1857, blurb: 'The last royal capital of Burma.' },
	{ id: 'phnompenh', name: 'Phnom Penh', lat: 11.56, lon: 104.92, culture: 'siamese', port: false, exports: 'pepper', blurb: 'Khmer river city at the meeting of four waters.' },
	// Nusantara & Philippines
	{ id: 'malacca', name: 'Malacca', lat: 2.19, lon: 102.25, culture: 'malay', port: true, exports: 'pepper', blurb: 'Whoever holds Malacca has his hand on the throat of Venice.' },
	{ id: 'aceh', name: 'Aceh', lat: 5.55, lon: 95.32, culture: 'malay', port: true, exports: 'pepper', blurb: 'The veranda of Mecca, a sultanate of pepper and cannon.' },
	{ id: 'bantam', name: 'Banten', lat: -6.02, lon: 106.15, culture: 'malay', port: true, exports: 'pepper', until: 1813, blurb: 'Pepper sultanate where all the nations haggle.' },
	{ id: 'batavia', name: 'Batavia', alt: [], lat: -6.2, lon: 106.85, culture: 'malay', port: true, exports: 'sugar', from: 1619, blurb: 'The Dutch Company’s canal city — Queen of the East.' },
	{ id: 'mataram', name: 'Yogyakarta', alt: [{ until: 1755, name: 'Mataram' }], lat: -7.8, lon: 110.36, culture: 'malay', port: false, exports: 'indigo', blurb: 'Javanese court of gamelan and wayang.' },
	{ id: 'makassar', name: 'Makassar', lat: -5.14, lon: 119.42, culture: 'malay', port: true, exports: 'sandalwood', blurb: 'Bugis sailors and free traders of the eastern seas.' },
	{ id: 'ternate', name: 'Ternate', lat: 0.79, lon: 127.38, culture: 'malay', port: true, exports: 'cloves', blurb: 'A volcano sultanate that grows the world’s cloves.' },
	{ id: 'banda', name: 'Banda Neira', lat: -4.52, lon: 129.9, culture: 'malay', port: true, exports: 'nutmeg', blurb: 'Tiny islands worth more than kingdoms, for nutmeg.' },
	{ id: 'brunei', name: 'Brunei', lat: 4.9, lon: 114.9, culture: 'malay', port: true, exports: 'camphor', blurb: 'A water village sultanate on stilts.' },
	{ id: 'manila', name: 'Manila', alt: [{ until: 1571, name: 'Maynila' }], lat: 14.6, lon: 120.98, culture: 'malay', port: true, exports: 'silver bars', blurb: 'Where Spanish silver meets Chinese silk.' },
	{ id: 'singapore', name: 'Singapore', lat: 1.29, lon: 103.85, culture: 'malay', port: true, exports: 'pepper', from: 1819, blurb: 'Raffles’ free port at the tip of the peninsula.' },
	// Hindustan
	{ id: 'delhi', name: 'Delhi', lat: 28.65, lon: 77.23, culture: 'indian', port: false, exports: 'gemstones', blurb: 'Seven cities layered upon one another.' },
	{ id: 'agra', name: 'Agra', lat: 27.18, lon: 78.01, culture: 'indian', port: false, exports: 'carpets', blurb: 'Red sandstone fort and marble dreams.' },
	{ id: 'lahore', name: 'Lahore', lat: 31.55, lon: 74.34, culture: 'indian', port: false, exports: 'carpets', blurb: 'Garden city of the Punjab.' },
	{ id: 'surat', name: 'Surat', lat: 21.17, lon: 72.83, culture: 'indian', port: true, exports: 'cotton', blurb: 'The Mughal gate to Mecca, richest port of Hindustan.' },
	{ id: 'bombay', name: 'Bombay', lat: 18.94, lon: 72.83, culture: 'indian', port: true, exports: 'cotton', from: 1661, blurb: 'Seven islands given away as a royal dowry.' },
	{ id: 'goa', name: 'Goa', lat: 15.5, lon: 73.83, culture: 'european', port: true, exports: 'pepper', from: 1510, blurb: 'Golden Goa, Rome of the East.' },
	{ id: 'calicut', name: 'Calicut', lat: 11.25, lon: 75.78, culture: 'indian', port: true, exports: 'pepper', blurb: 'City of the Zamorin, where da Gama first landed.' },
	{ id: 'hampi', name: 'Vijayanagara', lat: 15.33, lon: 76.46, culture: 'indian', port: false, exports: 'gemstones', until: 1565, blurb: 'City of Victory, its bazaars heaped with diamonds.' },
	{ id: 'madras', name: 'Madras', lat: 13.08, lon: 80.27, culture: 'indian', port: true, exports: 'cotton', from: 1639, blurb: 'Fort St. George on a surf-pounded shore.' },
	{ id: 'calcutta', name: 'Calcutta', lat: 22.57, lon: 88.36, culture: 'indian', port: true, exports: 'indigo', from: 1690, blurb: 'City of palaces on the Hooghly.' },
	{ id: 'dhaka', name: 'Dhaka', lat: 23.81, lon: 90.41, culture: 'indian', port: false, exports: 'cotton', blurb: 'Weavers of muslin so fine it is called woven air.' },
	{ id: 'colombo', name: 'Colombo', lat: 6.93, lon: 79.85, culture: 'indian', port: true, exports: 'cinnamon', blurb: 'Serendib’s harbor, smelling of cinnamon bark.' },
	// Persia, Arabia, Central Asia
	{ id: 'samarkand', name: 'Samarkand', lat: 39.65, lon: 66.96, culture: 'steppe', port: false, exports: 'carpets', blurb: 'Timur’s turquoise domes on the Golden Road.' },
	{ id: 'bukhara', name: 'Bukhara', lat: 39.77, lon: 64.42, culture: 'steppe', port: false, exports: 'carpets', blurb: 'Noble Bukhara, a city of scholars and slave markets.' },
	{ id: 'kabul', name: 'Kabul', lat: 34.53, lon: 69.17, culture: 'persian', port: false, exports: 'horses', blurb: 'Babur’s beloved garden among the passes.' },
	{ id: 'isfahan', name: 'Isfahan', lat: 32.65, lon: 51.67, culture: 'persian', port: false, exports: 'carpets', blurb: 'Isfahan is half the world.' },
	{ id: 'hormuz', name: 'Hormuz', lat: 27.1, lon: 56.45, culture: 'persian', port: true, exports: 'pearls', until: 1622, blurb: 'If the world were a ring, Hormuz would be its jewel.' },
	{ id: 'bandarabbas', name: 'Bandar Abbas', lat: 27.18, lon: 56.27, culture: 'persian', port: true, exports: 'pearls', from: 1615, blurb: 'The Shah’s new harbor, hot as a furnace.' },
	{ id: 'muscat', name: 'Muscat', lat: 23.6, lon: 58.4, culture: 'persian', port: true, exports: 'pearls', blurb: 'Omani sea-lords between black mountains.' },
	{ id: 'basra', name: 'Basra', lat: 30.5, lon: 47.8, culture: 'persian', port: true, exports: 'pearls', blurb: 'Where Sinbad set sail, among date palms.' },
	{ id: 'baghdad', name: 'Baghdad', lat: 33.3, lon: 44.4, culture: 'ottoman', port: false, exports: 'carpets', blurb: 'The faded city of the Thousand and One Nights.' },
	{ id: 'mocha', name: 'Mocha', lat: 13.32, lon: 43.25, culture: 'persian', port: true, exports: 'coffee', blurb: 'The bean that wakes the world is shipped from here.' },
	{ id: 'aden', name: 'Aden', lat: 12.8, lon: 45.03, culture: 'persian', port: true, exports: 'coffee', blurb: 'A volcanic crater guarding the Red Sea.' },
	// Ottoman & Africa
	{ id: 'istanbul', name: 'Constantinople', lat: 41.01, lon: 28.98, culture: 'ottoman', port: true, exports: 'glassware', blurb: 'The city between two continents and two seas.' },
	{ id: 'aleppo', name: 'Aleppo', lat: 36.2, lon: 37.15, culture: 'ottoman', port: false, exports: 'carpets', blurb: 'Caravanserais where the Silk Road meets the Levant.' },
	{ id: 'cairo', name: 'Cairo', lat: 30.04, lon: 31.24, culture: 'ottoman', port: true, exports: 'cotton', blurb: 'Mother of the world, by the Nile.' },
	{ id: 'zanzibar', name: 'Zanzibar', lat: -6.16, lon: 39.19, culture: 'swahili', port: true, exports: 'cloves', blurb: 'Spice island of carved doors and dhows.' },
	{ id: 'kilwa', name: 'Kilwa', lat: -8.95, lon: 39.52, culture: 'swahili', port: true, exports: 'gemstones', until: 1784, blurb: 'Coral-stone city once grand as any in the world.' },
	{ id: 'mombasa', name: 'Mombasa', lat: -4.04, lon: 39.67, culture: 'swahili', port: true, exports: 'pearls', blurb: 'Island of war, beneath Fort Jesus.' },
	{ id: 'capetown', name: 'Cape Town', lat: -33.92, lon: 18.42, culture: 'european', port: true, exports: 'sugar', from: 1652, blurb: 'Tavern of the Seas beneath Table Mountain.' },
	// Franks
	{ id: 'lisbon', name: 'Lisbon', lat: 38.72, lon: -9.14, culture: 'european', port: true, exports: 'woolens', blurb: 'From here the caravels sailed to the Indies.' },
	{ id: 'venice', name: 'Venice', lat: 45.44, lon: 12.33, culture: 'european', port: true, exports: 'glassware', blurb: 'The Serene Republic, floating on its lagoon.' },
	{ id: 'amsterdam', name: 'Amsterdam', lat: 52.37, lon: 4.9, culture: 'european', port: true, exports: 'woolens', blurb: 'Home of the VOC and its terrible ledger.' },
	{ id: 'london', name: 'London', lat: 51.5, lon: -0.12, culture: 'european', port: true, exports: 'woolens', blurb: 'Smoky capital of the East India Company.' },
	{ id: 'moscow', name: 'Moscow', lat: 55.75, lon: 37.62, culture: 'european', port: false, exports: 'furs', blurb: 'Onion domes over the forest and frost.' },
	{ id: 'kyakhta', name: 'Kyakhta', lat: 50.35, lon: 106.45, culture: 'steppe', port: false, exports: 'furs', from: 1727, blurb: 'Tea-for-fur border post between Tsar and Emperor.' },
	{ id: 'jeddah', name: 'Jeddah', lat: 21.49, lon: 39.19, culture: 'persian', port: true, exports: 'coffee', blurb: 'Gate of the Hajj, where pilgrims from every sea arrive.' },
	{ id: 'sydney', name: 'Sydney', lat: -33.87, lon: 151.21, culture: 'european', port: true, exports: 'woolens', from: 1788, blurb: 'A penal colony at the bottom of the world.' },
	{ id: 'irkutsk', name: 'Irkutsk', lat: 52.29, lon: 104.3, culture: 'european', port: false, exports: 'furs', from: 1661, blurb: 'Siberian timber town by the deepest lake on earth.' },
	// ===== holy cities & more stops =====
	{ id: 'mecca', name: 'Mecca', lat: 21.42, lon: 39.83, culture: 'persian', port: false, exports: 'coffee', blurb: 'The Kaaba, toward which a hundred million pray.' },
	{ id: 'jerusalem', name: 'Jerusalem', lat: 31.78, lon: 35.22, culture: 'ottoman', port: false, exports: 'glassware', blurb: 'Holy to three faiths, quarrelled over by all of them.' },
	{ id: 'rome', name: 'Rome', lat: 41.9, lon: 12.5, culture: 'european', port: false, exports: 'glassware', blurb: 'The Eternal City, where the Jesuits report home.' },
	{ id: 'varanasi', name: 'Benares', lat: 25.32, lon: 82.97, culture: 'indian', port: false, exports: 'silk', blurb: 'Oldest living city, its ghats lit by funeral fires.' },
	{ id: 'amritsar', name: 'Amritsar', lat: 31.63, lon: 74.87, culture: 'indian', port: false, exports: 'carpets', from: 1577, blurb: 'The Golden Temple floats on its pool of nectar.' },
	{ id: 'kathmandu', name: 'Kathmandu', lat: 27.7, lon: 85.32, culture: 'tibetan', port: false, exports: 'gemstones', blurb: 'Pagoda-roofed valley of a thousand gods.' },
	{ id: 'kandy', name: 'Kandy', lat: 7.29, lon: 80.63, culture: 'indian', port: false, exports: 'cinnamon', blurb: 'Mountain kingdom guarding the Buddha’s Tooth.' },
	{ id: 'qufu', name: 'Qufu', lat: 35.6, lon: 116.99, culture: 'han', port: false, exports: 'silk', blurb: 'Hometown of Confucius; his descendants still live here.' },
	{ id: 'wudang', name: 'Mount Wudang', lat: 32.4, lon: 111.0, culture: 'han', port: false, exports: 'ginseng', blurb: 'Daoist peaks of cloud-palaces and sword masters.' },
	{ id: 'ise', name: 'Ise', lat: 34.46, lon: 136.72, culture: 'japanese', port: false, exports: 'lacquerware', blurb: 'The Grand Shrine, rebuilt every twenty years.' },
	{ id: 'ningbo', name: 'Ningpo', lat: 29.87, lon: 121.55, culture: 'han', port: true, exports: 'porcelain', blurb: 'Smugglers’ coast and gateway to Japan.' },
	{ id: 'fuzhou', name: 'Foochow', lat: 26.07, lon: 119.3, culture: 'han', port: true, exports: 'tea', blurb: 'Black-tea river port among banyan trees.' },
	{ id: 'tainan', name: 'Tainan', alt: [{ until: 1662, name: 'Fort Zeelandia' }], lat: 23.0, lon: 120.2, culture: 'han', port: true, exports: 'sugar', from: 1624, blurb: 'Formosa’s sugar port, won and lost by empires.' },
	{ id: 'mukden', name: 'Mukden', lat: 41.8, lon: 123.43, culture: 'han', port: false, exports: 'ginseng', blurb: 'The Manchu homeland capital beyond the Wall.' },
	{ id: 'lanzhou', name: 'Lanchow', lat: 36.06, lon: 103.83, culture: 'han', port: false, exports: 'horses', blurb: 'Where the Yellow River meets the Gansu corridor.' },
	{ id: 'dunhuang', name: 'Dunhuang', lat: 40.14, lon: 94.66, culture: 'han', port: false, exports: 'silk', blurb: 'Painted caves of a thousand Buddhas at the desert’s edge.' },
	{ id: 'turfan', name: 'Turfan', lat: 42.95, lon: 89.18, culture: 'steppe', port: false, exports: 'sugar', blurb: 'Grape oasis in a depression below the sea.' },
	{ id: 'kunming', name: 'Kunming', lat: 25.04, lon: 102.71, culture: 'han', port: false, exports: 'tea', blurb: 'City of eternal spring on the tea-horse road.' },
	{ id: 'hakodate', name: 'Hakodate', lat: 41.77, lon: 140.73, culture: 'japanese', port: true, exports: 'furs', blurb: 'Northern port facing the Ainu lands.' },
	{ id: 'pyongyang', name: 'Pyongyang', lat: 39.03, lon: 125.75, culture: 'korean', port: false, exports: 'ginseng', blurb: 'Willow capital on the Taedong river.' },
	{ id: 'chiangmai', name: 'Chiang Mai', lat: 18.79, lon: 98.98, culture: 'siamese', port: false, exports: 'lacquerware', blurb: 'Lanna’s walled city in the northern hills.' },
	{ id: 'luangprabang', name: 'Luang Prabang', lat: 19.89, lon: 102.13, culture: 'siamese', port: false, exports: 'silk', blurb: 'Monks in saffron at dawn where the rivers meet.' },
	{ id: 'vientiane', name: 'Vientiane', lat: 17.97, lon: 102.6, culture: 'siamese', port: false, exports: 'sandalwood', blurb: 'City of sandalwood on the Mekong.' },
	{ id: 'mrauku', name: 'Mrauk U', lat: 20.6, lon: 93.19, culture: 'siamese', port: true, exports: 'pearls', until: 1785, blurb: 'Arakan’s stone-temple city of Portuguese mercenaries.' },
	{ id: 'palembang', name: 'Palembang', lat: -2.98, lon: 104.76, culture: 'malay', port: true, exports: 'pepper', blurb: 'River sultanate on the ruins of Srivijaya.' },
	{ id: 'ambon', name: 'Ambon', lat: -3.7, lon: 128.17, culture: 'malay', port: true, exports: 'cloves', blurb: 'Clove islands under the Company’s guns.' },
	{ id: 'cebu', name: 'Cebu', lat: 10.3, lon: 123.9, culture: 'malay', port: true, exports: 'pearls', blurb: 'Where Magellan met his end at Lapu-Lapu’s hands.' },
	{ id: 'cochin', name: 'Cochin', lat: 9.93, lon: 76.26, culture: 'indian', port: true, exports: 'pepper', blurb: 'Chinese fishing nets, Jewish synagogue, Portuguese fort.' },
	{ id: 'masulipatnam', name: 'Masulipatnam', lat: 16.17, lon: 81.13, culture: 'indian', port: true, exports: 'cotton', blurb: 'Chintz port of the Coromandel coast.' },
	{ id: 'golconda', name: 'Hyderabad', alt: [{ until: 1687, name: 'Golconda' }], lat: 17.38, lon: 78.47, culture: 'indian', port: false, exports: 'gemstones', blurb: 'Diamond fortress where the Koh-i-Noor was found.' },
	{ id: 'mogadishu', name: 'Mogadishu', lat: 2.04, lon: 45.34, culture: 'swahili', port: true, exports: 'cotton', blurb: 'Coral-stone sultanate on the Horn.' },
	{ id: 'herat', name: 'Herat', lat: 34.35, lon: 62.2, culture: 'persian', port: false, exports: 'carpets', blurb: 'Pearl of Khorasan, city of miniaturists.' },
	{ id: 'tabriz', name: 'Tabriz', lat: 38.08, lon: 46.29, culture: 'persian', port: false, exports: 'carpets', blurb: 'The great covered bazaar of the Silk Road.' },
	{ id: 'khiva', name: 'Khiva', lat: 41.38, lon: 60.36, culture: 'steppe', port: false, exports: 'horses', blurb: 'Mud-walled khanate in the Karakum desert.' },
	{ id: 'astrakhan', name: 'Astrakhan', lat: 46.35, lon: 48.04, culture: 'european', port: true, exports: 'furs', blurb: 'Caviar and caravans at the Volga’s mouth.' },
	// ===== the Americas =====
	{ id: 'mexico', name: 'Mexico City', lat: 19.43, lon: -99.13, culture: 'european', port: false, exports: 'silver bars', blurb: 'Capital of New Spain, built on the ruins of Tenochtitlan.' },
	{ id: 'veracruz', name: 'Veracruz', lat: 19.17, lon: -96.13, culture: 'european', port: true, exports: 'sugar', blurb: 'Where the treasure fleet loads for Seville.' },
	{ id: 'havana', name: 'Havana', lat: 23.11, lon: -82.37, culture: 'european', port: true, exports: 'sugar', blurb: 'Key to the New World, ringed by fortresses.' },
	{ id: 'cartagena', name: 'Cartagena', lat: 10.39, lon: -75.51, culture: 'european', port: true, exports: 'gemstones', blurb: 'Walled treasure port of emeralds and Inquisitors.' },
	{ id: 'panama', name: 'Panamá', lat: 8.98, lon: -79.52, culture: 'european', port: true, exports: 'silver bars', blurb: 'Mule trains carry Peru’s silver across the isthmus.' },
	{ id: 'lima', name: 'Lima', lat: -12.05, lon: -77.04, culture: 'european', port: true, exports: 'silver bars', blurb: 'City of Kings, fed by the silver of Potosí.' },
	{ id: 'valparaiso', name: 'Valparaíso', lat: -33.05, lon: -71.62, culture: 'european', port: true, exports: 'woolens', from: 1544, blurb: 'Windswept hills above the Pacific.' },
	{ id: 'sanfrancisco', name: 'San Francisco', alt: [{ until: 1847, name: 'Yerba Buena' }], lat: 37.77, lon: -122.42, culture: 'european', port: true, exports: 'furs', from: 1776, blurb: 'A mission by the bay — and later, gold fever.' },
	{ id: 'sitka', name: 'Novo-Arkhangelsk', lat: 57.05, lon: -135.33, culture: 'european', port: true, exports: 'furs', from: 1799, blurb: 'Russian America: sea-otter pelts and Orthodox domes.' },
	// ===== the Pacific =====
	{ id: 'honolulu', name: 'Honolulu', lat: 21.31, lon: -157.86, culture: 'pacific', port: true, exports: 'sandalwood', blurb: 'Kona winds, sandalwood traders and a rising kingdom.' },
	{ id: 'guam', name: 'Hagåtña', lat: 13.47, lon: 144.75, culture: 'pacific', port: true, exports: 'sugar', from: 1668, blurb: 'Galleon waystation in the Marianas.' },
	{ id: 'tahiti', name: 'Papeete', lat: -17.54, lon: -149.57, culture: 'pacific', port: true, exports: 'pearls', blurb: 'Black pearls, breadfruit and navigators who read the stars.' },
	// ===== Siberia =====
	{ id: 'tobolsk', name: 'Tobolsk', lat: 58.2, lon: 68.25, culture: 'european', port: false, exports: 'furs', from: 1587, blurb: 'The Kremlin of Siberia above the Irtysh.' },
	{ id: 'yakutsk', name: 'Yakutsk', lat: 62.03, lon: 129.73, culture: 'european', port: false, exports: 'furs', from: 1632, blurb: 'The coldest town on earth; sable and mammoth ivory.' },
	{ id: 'okhotsk', name: 'Okhotsk', lat: 59.36, lon: 143.24, culture: 'european', port: true, exports: 'furs', from: 1647, blurb: 'Russia’s first Pacific harbor, all fog and timber.' },
	{ id: 'petropavlovsk', name: 'Petropavlovsk', lat: 53.02, lon: 158.65, culture: 'european', port: true, exports: 'furs', from: 1740, blurb: 'Volcanoes and Bering’s ships in Kamchatka.' },
	{ id: 'nerchinsk', name: 'Nerchinsk', lat: 51.98, lon: 116.59, culture: 'european', port: false, exports: 'silver bars', from: 1658, blurb: 'Where Russia and the Qing signed their first treaty.' },
	// ===== Australia =====
	{ id: 'hobart', name: 'Hobart', lat: -42.88, lon: 147.33, culture: 'european', port: true, exports: 'woolens', from: 1804, blurb: 'Whalers and convicts under Mount Wellington.' },
	{ id: 'melbourne', name: 'Melbourne', lat: -37.81, lon: 144.96, culture: 'european', port: true, exports: 'woolens', from: 1835, blurb: 'A tent town that gold turns into a city.' },
	{ id: 'perth', name: 'Fremantle', lat: -32.05, lon: 115.75, culture: 'european', port: true, exports: 'sandalwood', from: 1829, blurb: 'Swan River colony on the Indian Ocean.' },
	// ===== more stops =====
	{ id: 'yangzhou', name: 'Yangzhou', lat: 32.39, lon: 119.42, culture: 'han', port: false, exports: 'sugar', blurb: 'Salt merchants\u2019 city of gardens on the Grand Canal.' },
	{ id: 'suzhou', name: 'Soochow', lat: 31.3, lon: 120.62, culture: 'han', port: false, exports: 'silk', blurb: 'Canals, scholars\u2019 gardens and the finest embroidery on earth.' },
	{ id: 'kaifeng', name: 'Kaifeng', lat: 34.8, lon: 114.31, culture: 'han', port: false, exports: 'porcelain', blurb: 'Old Song capital beside the Yellow River; it has a synagogue.' },
	{ id: 'nara', name: 'Nara', lat: 34.68, lon: 135.8, culture: 'japanese', port: false, exports: 'lacquerware', blurb: 'Bowing deer and the Great Buddha in his wooden hall.' },
	{ id: 'shimoda', name: 'Shimoda', lat: 34.68, lon: 138.94, culture: 'japanese', port: true, exports: 'camphor', blurb: 'A fishing harbor that becomes the first door opened to America.' },
	{ id: 'gyeongju', name: 'Gyeongju', lat: 35.86, lon: 129.22, culture: 'korean', port: false, exports: 'ginseng', blurb: 'Tombs like green hills; the old Silla capital.' },
	{ id: 'kaesong', name: 'Kaesong', lat: 37.97, lon: 126.55, culture: 'korean', port: false, exports: 'ginseng', blurb: 'Ancient capital of Goryeo, renowned for red ginseng and royal merchants.' },
	{ id: 'jeonju', name: 'Jeonju', lat: 35.82, lon: 127.15, culture: 'korean', port: false, exports: 'lacquerware', blurb: 'Ancestral seat of the royal Yi house, famed for mulberry paper.' },
	{ id: 'gangneung', name: 'Gangneung', lat: 37.75, lon: 128.9, culture: 'korean', port: true, exports: 'furs', blurb: 'Eastern coastal town beyond the rugged Daegwallyeong pass.' },
	{ id: 'jeju', name: 'Jeju', lat: 33.51, lon: 126.53, culture: 'korean', port: true, exports: 'pearls', blurb: 'Wind-swept island of stone grandfathers, free divers, and hardy horses.' },
	{ id: 'uiju', name: 'Uiju', lat: 40.2, lon: 124.53, culture: 'korean', port: false, exports: 'ginseng', blurb: 'Northern border gateway on the Yalu River opposite the Middle Kingdom.' },
	// Japan expansion
	{ id: 'kanazawa', name: 'Kanazawa', lat: 36.56, lon: 136.65, culture: 'japanese', port: true, exports: 'lacquerware', blurb: 'The Maeda clan’s castle town of beaten gold leaf and Kenrokuen gardens.' },
	{ id: 'sendai', name: 'Sendai', lat: 38.27, lon: 140.87, culture: 'japanese', port: false, exports: 'steel blades', from: 1600, blurb: 'The One-Eyed Dragon Date Masamune’s northern fortress city.' },
	{ id: 'hiroshima', name: 'Hiroshima', lat: 34.39, lon: 132.46, culture: 'japanese', port: true, exports: 'steel blades', blurb: 'Castle town guarding the calm waters and floating torii of the Inland Sea.' },
	{ id: 'shimonoseki', name: 'Shimonoseki', lat: 33.95, lon: 130.93, culture: 'japanese', port: true, exports: 'camphor', blurb: 'The narrow straits where the tides rip between Honshu and Kyushu.' },
	{ id: 'naha', name: 'Naha', lat: 26.21, lon: 127.68, culture: 'japanese', port: true, exports: 'sugar', blurb: 'Royal port of the Ryukyu Kingdom, bridge between China, Japan, and the South Seas.' },
	{ id: 'matsumae', name: 'Matsumae', lat: 41.43, lon: 140.11, culture: 'japanese', port: true, exports: 'furs', blurb: 'The northernmost samurai outpost, trading herring and furs with the Ainu.' },
	// China & Silk Road expansion
	{ id: 'datong', name: 'Datong', lat: 40.09, lon: 113.3, culture: 'han', port: false, exports: 'woolens', blurb: 'Garrison fortress city beneath the Great Wall and the Yungang stone Buddhas.' },
	{ id: 'luoyang', name: 'Luoyang', lat: 34.62, lon: 112.45, culture: 'han', port: false, exports: 'porcelain', blurb: 'Ancient eastern capital where peonies bloom and the White Horse Temple stands.' },
	{ id: 'wuhan', name: 'Wuchang', lat: 30.55, lon: 114.3, culture: 'han', port: true, exports: 'tea', blurb: 'Meeting of the Yangtze and Han rivers beneath the Yellow Crane Tower.' },
	{ id: 'chongqing', name: 'Chungking', lat: 29.56, lon: 106.55, culture: 'han', port: true, exports: 'tea', blurb: 'Misty river citadel clinging to steep cliffs above the Yangtze gorges.' },
	{ id: 'khotan', name: 'Khotan', lat: 37.11, lon: 79.92, culture: 'steppe', port: false, exports: 'gemstones', blurb: 'Oasis kingdom where nephrite jade is gathered from mountain-fed rivers.' },
	{ id: 'yarkand', name: 'Yarkand', lat: 38.41, lon: 77.25, culture: 'steppe', port: false, exports: 'silk', blurb: 'Great trading khanate on the southern rim of the Taklamakan desert.' },
	{ id: 'hami', name: 'Hami', lat: 42.83, lon: 93.52, culture: 'steppe', port: false, exports: 'sugar', blurb: 'Sweet melon oasis town, the eastern gateway to the Western Regions.' },
	{ id: 'kham', name: 'Kangding', lat: 30.05, lon: 101.96, culture: 'tibetan', port: false, exports: 'horses', blurb: 'Dartsendo, mountain throat where Sichuan brick tea is bartered for Tibetan horses.' },
	// Nusantara & SE Asia expansion
	{ id: 'semarang', name: 'Semarang', lat: -6.97, lon: 110.42, culture: 'malay', port: true, exports: 'sugar', blurb: 'Central Javanese harbor where Chinese merchants built the Sam Poo Kong temple.' },
	{ id: 'surabaya', name: 'Surabaya', lat: -7.25, lon: 112.75, culture: 'malay', port: true, exports: 'sugar', blurb: 'Bustling river delta port of eastern Java, home of shark and crocodile legends.' },
	{ id: 'banjarmasin', name: 'Banjarmasin', lat: -3.32, lon: 114.59, culture: 'malay', port: true, exports: 'pepper', blurb: 'Floating markets and river canals of the South Borneo sultanate.' },
	{ id: 'patani', name: 'Patani', lat: 6.87, lon: 101.25, culture: 'malay', port: true, exports: 'pepper', blurb: 'Cosmopolitan Malay sultanate ruled by queens, famed for brass cannon.' },
	// Central Asia, Persia, India expansion
	{ id: 'tashkent', name: 'Tashkent', lat: 41.31, lon: 69.28, culture: 'steppe', port: false, exports: 'carpets', blurb: 'Stone city on the Chirchiq River, crossroads of the northern Silk Road.' },
	{ id: 'shiraz', name: 'Shiraz', lat: 29.59, lon: 52.58, culture: 'persian', port: false, exports: 'carpets', blurb: 'City of roses, nightingales, and cypress gardens beside the tomb of Hafez.' },
	{ id: 'yazd', name: 'Yazd', lat: 31.9, lon: 54.37, culture: 'persian', port: false, exports: 'silk', blurb: 'Desert jewel cooled by soaring windcatchers and ancient qanats.' },
	{ id: 'pondicherry', name: 'Pondicherry', lat: 11.93, lon: 79.83, culture: 'indian', port: true, exports: 'cotton', from: 1674, blurb: 'French enclave on the Coromandel coast, where bougainvillea shades grand avenues.' },
	{ id: 'ava', name: 'Ava', lat: 21.86, lon: 95.98, culture: 'siamese', port: false, exports: 'gemstones', until: 1841, blurb: 'Royal city of Burma on the Irrawaddy, ringed by moats.' },
	{ id: 'penang', name: 'Penang', lat: 5.41, lon: 100.33, culture: 'malay', port: true, exports: 'pepper', from: 1786, blurb: 'Francis Light\u2019s free port, all spice and opportunity.' },
	{ id: 'srinagar', name: 'Srinagar', lat: 34.08, lon: 74.8, culture: 'indian', port: false, exports: 'woolens', blurb: 'Houseboats and Mughal gardens; the shawls are worth a fortune.' },
	{ id: 'mashhad', name: 'Mashhad', lat: 36.3, lon: 59.6, culture: 'persian', port: false, exports: 'carpets', blurb: 'The golden shrine of Imam Reza draws pilgrims from all Persia.' },
	{ id: 'kandahar', name: 'Kandahar', lat: 31.63, lon: 65.71, culture: 'persian', port: false, exports: 'horses', blurb: 'Pomegranates and the caravan crossroads of the Afghans.' },
	// ===== Ancient & Legendary Capitals =====
	{ id: 'alexandria', name: 'Alexandria', lat: 31.2, lon: 29.91, culture: 'ottoman', port: true, exports: 'glassware', blurb: 'City of the Ptolemies and the Pharos; Mediterranean gateway to the Nile.' },
	{ id: 'damascus', name: 'Damascus', lat: 33.51, lon: 36.29, culture: 'ottoman', port: false, exports: 'steel blades', blurb: 'Oldest living city on earth, famed for folded damascene blades and sweet rosewater.' },
	{ id: 'athens', name: 'Athens', lat: 37.98, lon: 23.73, culture: 'european', port: true, exports: 'woolens', blurb: 'Marble columns of the Parthenon rising above olive groves and ancient academies.' },
	{ id: 'angkor', name: 'Angkor', lat: 13.41, lon: 103.87, culture: 'siamese', port: false, exports: 'gemstones', blurb: 'Stone towers of the god-kings entwined by massive banyan roots in the deep jungle.' },
	{ id: 'patna', name: 'Pataliputra', alt: [{ until: 1704, name: 'Pataliputra' }], lat: 25.61, lon: 85.14, culture: 'indian', port: true, exports: 'silk', blurb: 'Ancient capital of Ashoka the Great on the sacred Ganges, where edicts of peace were carved in stone.' },
	{ id: 'taxila', name: 'Taxila', lat: 33.74, lon: 72.83, culture: 'persian', port: false, exports: 'gemstones', blurb: 'Ancient Gandharan sanctuary where Greek philosophers and Buddhist monks shared stone halls.' },
	{ id: 'antioch', name: 'Antioch', lat: 36.2, lon: 36.16, culture: 'ottoman', port: false, exports: 'silk', blurb: 'Silk Road terminus on the Orontes, famed for mosaics and ancient theological debates.' },
	{ id: 'carthage', name: 'Tunis', alt: [{ until: 1574, name: 'Carthage' }], lat: 36.85, lon: 10.32, culture: 'ottoman', port: true, exports: 'woolens', blurb: 'Ruins of Hannibal’s harbor beneath the white domed houses, minarets, and date palms of Tunis.' },
	// ===== hidden places (revealed by clues) =====
	{ id: 'shambhala', name: 'Shambhala', lat: 31.5, lon: 82.5, culture: 'tibetan', port: false, exports: 'gemstones', secret: true, blurb: 'The hidden kingdom behind a ring of snow peaks, where the Kalachakra is kept.' },
	{ id: 'penglai', name: 'Penglai', lat: 38.6, lon: 124.4, culture: 'han', port: true, exports: 'ginseng', secret: true, blurb: 'The island of the Immortals, seen from the coast only as a mirage.' },
	{ id: 'suvarnadvipa', name: 'Suvarnadvipa', lat: -1.2, lon: 99.6, culture: 'malay', port: true, exports: 'silver bars', secret: true, blurb: 'The Gold Island of Indian and Arab legend, where rivers run yellow.' },
	{ id: 'waqwaq', name: 'The Waq-waq Isles', lat: -20.5, lon: 63.5, culture: 'swahili', port: true, exports: 'pearls', secret: true, blurb: 'Islands of the singing trees, beyond the edge of every Arab chart.' },
	{ id: 'acapulco', name: 'Acapulco', lat: 16.85, lon: -99.88, culture: 'european', port: true, exports: 'silver bars', from: 1565, blurb: 'Where the Manila galleon unloads its silks for New Spain.' },
	// ===== Europe, Ottoman, Caucasus, Central Asia & Africa expansion =====
	{ id: 'seville', name: 'Seville', lat: 37.39, lon: -5.98, culture: 'european', port: true, exports: 'silver bars', blurb: 'River port of the Guadalquivir where the Casa de Contratación weighs the silver of New Spain.' },
	{ id: 'madrid', name: 'Madrid', lat: 40.42, lon: -3.7, culture: 'european', port: false, exports: 'woolens', from: 1561, blurb: 'High plateau court of the Spanish Habsburgs, ringed by austere monasteries and royal plazas.' },
	{ id: 'paris', name: 'Paris', lat: 48.86, lon: 2.35, culture: 'european', port: false, exports: 'glassware', blurb: 'Grand capital on the Seine, of salons, philosophies, and royal tapestry workshops.' },
	{ id: 'marseille', name: 'Marseille', lat: 43.3, lon: 5.37, culture: 'european', port: true, exports: 'woolens', blurb: 'Ancient Mediterranean harbor where galleys and Levant merchants unload Levantine silk and coffee.' },
	{ id: 'genoa', name: 'Genoa', lat: 44.41, lon: 8.93, culture: 'european', port: true, exports: 'silver bars', blurb: 'La Superba: marble palaces of bankers who finance empires across both oceans.' },
	{ id: 'florence', name: 'Florence', lat: 43.77, lon: 11.26, culture: 'european', port: false, exports: 'silk', blurb: 'City of the Medici, where goldsmiths, lens-grinders, and painters crowd the Ponte Vecchio.' },
	{ id: 'antwerp', name: 'Antwerp', lat: 51.22, lon: 4.4, culture: 'european', port: true, exports: 'gemstones', blurb: 'Bourse on the Scheldt where Portuguese spices, Flemish cloth, and rough diamonds change hands.' },
	{ id: 'hamburg', name: 'Hamburg', lat: 53.55, lon: 9.99, culture: 'european', port: true, exports: 'glassware', blurb: 'Free Hanseatic port on the Elbe, smelling of Baltic pitch, copper, and roasted coffee.' },
	{ id: 'vienna', name: 'Vienna', lat: 48.21, lon: 16.37, culture: 'european', port: false, exports: 'glassware', blurb: 'Imperial seat on the Danube, bastion of the Habsburgs and city of coffeehouses and court music.' },
	{ id: 'prague', name: 'Prague', lat: 50.08, lon: 14.44, culture: 'european', port: false, exports: 'glassware', blurb: 'City of a hundred spires, where alchemists and astronomers gather beneath the castle.' },
	{ id: 'krakow', name: 'Kraków', lat: 50.06, lon: 19.94, culture: 'european', port: false, exports: 'furs', blurb: 'Royal citadel on the Vistula, where Sarmatian nobles trade Baltic amber and Oriental carpets.' },
	{ id: 'stpetersburg', name: 'St. Petersburg', lat: 59.93, lon: 30.34, culture: 'european', port: true, exports: 'furs', from: 1703, blurb: 'The Tsar’s granite window on the Baltic, raised over Neva marshes by decree and iron will.' },
	{ id: 'stockholm', name: 'Stockholm', lat: 59.33, lon: 18.07, culture: 'european', port: true, exports: 'steel blades', blurb: 'Island capital of the north, shipping Swedish bar iron, tar, and brass cannon across the Baltic.' },
	{ id: 'ragusa', name: 'Ragusa', lat: 42.65, lon: 18.09, culture: 'european', port: true, exports: 'silver bars', blurb: 'Walled Adriatic republic that pays tribute to the Sultan and trades freely with all Christendom.' },
	{ id: 'belgrade', name: 'Belgrade', lat: 44.82, lon: 20.46, culture: 'ottoman', port: false, exports: 'horses', blurb: 'White fortress at the confluence of the Danube and Sava, contested key to Central Europe.' },
	{ id: 'smyrna', name: 'Smyrna', lat: 38.42, lon: 27.14, culture: 'ottoman', port: true, exports: 'carpets', blurb: 'Cosmopolitan Aegean port of Frankish factors, Armenian silk brokers, and Anatolian caravans.' },
	{ id: 'trebizond', name: 'Trebizond', lat: 41.0, lon: 39.72, culture: 'ottoman', port: true, exports: 'silk', blurb: 'Misty Black Sea harbor where Persian camel trains descend from the Pontic mountains.' },
	{ id: 'caffa', name: 'Caffa', lat: 45.03, lon: 35.38, culture: 'ottoman', port: true, exports: 'furs', blurb: 'Crimean fortress port where steppe horsemen, Genoese stones, and Ottoman galleys meet.' },
	{ id: 'kazan', name: 'Kazan', lat: 55.79, lon: 49.12, culture: 'steppe', port: false, exports: 'furs', blurb: 'White-walled citadel on the Volga bend, where Tatar merchants trade Siberian pelts and leather.' },
	{ id: 'tbilisi', name: 'Tiflis', lat: 41.72, lon: 44.79, culture: 'persian', port: false, exports: 'silk', blurb: 'Sulfur baths and cliffside balconies in the gorge of the Kura, between two empires.' },
	{ id: 'baku', name: 'Baku', lat: 40.37, lon: 49.89, culture: 'persian', port: true, exports: 'carpets', blurb: 'Walled Caspian port of eternal hillside flames, naphtha wells, and Shirvanshah stone.' },
	{ id: 'kokand', name: 'Kokand', lat: 40.53, lon: 70.94, culture: 'steppe', port: false, exports: 'horses', blurb: 'Khanate of the fertile Fergana Valley, guarding the high passes toward Kashgar.' },
	{ id: 'merv', name: 'Merv', lat: 37.66, lon: 62.16, culture: 'persian', port: false, exports: 'carpets', blurb: 'Ancient oasis of Khorasan, where domes of baked brick rise above the Karakum sands.' },
	{ id: 'balkh', name: 'Balkh', lat: 36.76, lon: 66.9, culture: 'persian', port: false, exports: 'gemstones', blurb: 'Mother of Cities, where Zoroastrian fire, Buddhist stupas, and Timurid tilework sleep together.' },
	{ id: 'orenburg', name: 'Orenburg', lat: 51.77, lon: 55.1, culture: 'european', port: false, exports: 'furs', from: 1743, blurb: 'Russian frontier fortress on the Ural River where Kazakh horse herds and Bukharan caravans barter.' },
	{ id: 'ili', name: 'Kulja', lat: 43.92, lon: 81.32, culture: 'steppe', port: false, exports: 'horses', blurb: 'Pasture capital of the Ili River valley, winter camp of Dzungar khans and frontier bannermen.' },
	{ id: 'karakorum', name: 'Karakorum', lat: 47.2, lon: 102.85, culture: 'steppe', port: false, exports: 'horses', blurb: 'Stone tortoises on the Orkhon plain and the white walls of Erdene Zuu monastery.' },
	{ id: 'algiers', name: 'Algiers', lat: 36.78, lon: 3.06, culture: 'ottoman', port: true, exports: 'steel blades', blurb: 'The White City of the Barbary coast, its harbor bristling with corsair xebecs.' },
	{ id: 'fez', name: 'Fez', lat: 34.06, lon: -4.98, culture: 'ottoman', port: false, exports: 'carpets', blurb: 'Labyrinth of dye-vats, cedar madrasas, and trans-Saharan gold caravans.' },
	{ id: 'timbuktu', name: 'Timbuktu', lat: 16.77, lon: -3.01, culture: 'swahili', port: false, exports: 'silver bars', blurb: 'Mud-brick libraries at the bend of the Niger, where salt slabs are traded for desert gold.' },
	{ id: 'sofala', name: 'Sofala', lat: -20.15, lon: 34.72, culture: 'swahili', port: true, exports: 'gemstones', blurb: 'Monsoon estuary port where gold from the inland kingdoms of Monomotapa reaches the sea.' }
];

export const CITY: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export type Mode = 'sea' | 'land' | 'river';

// a-b by mode. Kept explicit so routes stay geographically sane.
const SEA = `lisbon-amsterdam lisbon-london amsterdam-london lisbon-venice lisbon-capetown amsterdam-capetown london-capetown
capetown-zanzibar capetown-goa capetown-batavia capetown-colombo venice-istanbul venice-cairo istanbul-cairo
cairo-mocha mocha-aden aden-muscat aden-zanzibar aden-surat aden-calicut mocha-surat
zanzibar-kilwa zanzibar-mombasa mombasa-kilwa mombasa-muscat mombasa-calicut kilwa-goa
muscat-hormuz muscat-bandarabbas hormuz-basra bandarabbas-basra hormuz-surat bandarabbas-surat muscat-surat muscat-bombay
surat-bombay bombay-goa goa-calicut calicut-colombo colombo-madras madras-calcutta calcutta-pegu colombo-aceh madras-aceh madras-malacca colombo-malacca
pegu-malacca aceh-malacca malacca-singapore singapore-batavia malacca-batavia malacca-bantam bantam-batavia batavia-makassar makassar-ternate makassar-banda
ternate-banda ternate-manila batavia-banda brunei-manila brunei-malacca brunei-makassar singapore-brunei
malacca-ayutthaya singapore-bangkok ayutthaya-hoian bangkok-saigon saigon-hoian hoian-hue hoian-macau hoian-guangzhou hoian-manila
guangzhou-macau macau-hongkong guangzhou-hongkong macau-manila hongkong-manila macau-nagasaki guangzhou-quanzhou quanzhou-manila
quanzhou-hangzhou hangzhou-shanghai shanghai-nagasaki hangzhou-nagasaki hongkong-shanghai shanghai-busan busan-nagasaki
nagasaki-kagoshima kagoshima-osaka osaka-edo nagasaki-osaka manila-acapulco hongkong-singapore singapore-colombo singapore-calcutta
hue-guangzhou bantam-aceh jeddah-mocha jeddah-aden jeddah-cairo jeddah-surat capetown-sydney@1788 batavia-sydney@1788 hongkong-sydney@1850
edo-acapulco@1860 edo-shanghai@1860 edo-hongkong@1860 cairo-aden@1869 manila-sydney@1850 nagasaki-busan
ningbo-nagasaki ningbo-quanzhou ningbo-hangzhou fuzhou-quanzhou fuzhou-ningbo tainan-quanzhou tainan-manila tainan-fuzhou tainan-nagasaki hakodate-edo
palembang-malacca palembang-batavia cebu-manila cebu-ternate ambon-banda ambon-ternate ambon-makassar cochin-calicut cochin-colombo cochin-goa
shimoda-edo shimoda-osaka hakodate-osaka penang-malacca penang-aceh penang-madras masulipatnam-madras masulipatnam-calcutta mrauku-calcutta mrauku-pegu mogadishu-mombasa mogadishu-aden mogadishu-muscat rome-lisbon jerusalem-cairo
acapulco-panama acapulco-lima panama-lima lima-valparaiso cartagena-havana havana-veracruz havana-lisbon cartagena-lisbon havana-london@1650
sanfrancisco-acapulco sanfrancisco-honolulu honolulu-acapulco honolulu-guam honolulu-tahiti tahiti-sydney@1788 sitka-sanfrancisco sitka-petropavlovsk sitka-honolulu
guam-manila guam-acapulco petropavlovsk-okhotsk okhotsk-hakodate hobart-sydney melbourne-sydney melbourne-hobart perth-batavia perth-capetown perth-melbourne honolulu-edo@1860
jeju-busan jeju-gangneung gangneung-busan jeju-nagasaki gangneung-hakodate
hiroshima-osaka hiroshima-shimonoseki shimonoseki-nagasaki shimonoseki-osaka kanazawa-nagasaki kanazawa-matsumae matsumae-hakodate
naha-kagoshima naha-tainan naha-fuzhou naha-quanzhou
semarang-batavia semarang-surabaya surabaya-makassar surabaya-banjarmasin banjarmasin-batavia banjarmasin-makassar
patani-singapore patani-bangkok patani-malacca patani-hoian
pondicherry-madras pondicherry-colombo pondicherry-calicut shiraz-bandarabbas shiraz-hormuz
alexandria-cairo alexandria-istanbul alexandria-venice alexandria-carthage alexandria-athens athens-istanbul athens-venice athens-carthage carthage-lisbon carthage-venice
seville-lisbon seville-havana seville-veracruz seville-cartagena seville-algiers seville-marseille seville-genoa
marseille-genoa marseille-rome marseille-algiers marseille-carthage marseille-alexandria
genoa-rome genoa-venice genoa-carthage
antwerp-amsterdam antwerp-london antwerp-lisbon antwerp-seville hamburg-amsterdam hamburg-london hamburg-antwerp
stockholm-hamburg stockholm-amsterdam stockholm-stpetersburg@1703 stpetersburg-amsterdam@1703 stpetersburg-london@1703
ragusa-venice ragusa-athens ragusa-istanbul ragusa-alexandria
smyrna-istanbul smyrna-athens smyrna-alexandria smyrna-venice smyrna-marseille
trebizond-istanbul trebizond-caffa caffa-istanbul
algiers-carthage algiers-lisbon
sofala-kilwa sofala-zanzibar sofala-capetown@1652`;
const RIVER = `yangzhou-nanjing yangzhou-suzhou suzhou-hangzhou kaifeng-nanjing ava-mandalay ava-pegu irkutsk-yakutsk varanasi-calcutta luangprabang-vientiane vientiane-phnompenh astrakhan-moscow wudang-nanjing nanjing-hangzhou nanjing-beijing nanjing-shanghai chengdu-nanjing calcutta-dhaka pegu-mandalay bangkok-ayutthaya phnompenh-saigon basra-baghdad chongqing-wuhan wuhan-nanjing wuhan-yangzhou chengdu-chongqing uiju-pyongyang alexandria-cairo patna-varanasi patna-calcutta patna-dhaka angkor-phnompenh angkor-saigon kazan-moscow kazan-astrakhan vienna-belgrade belgrade-istanbul`;
const LAND = `beijing-xian xian-chengdu beijing-hanseong hanseong-busan kyoto-osaka kyoto-edo beijing-urga urga-kyakhta kyakhta-moscow
xian-kashgar kashgar-samarkand samarkand-bukhara bukhara-isfahan samarkand-kabul kabul-lahore lahore-delhi delhi-agra agra-surat
agra-calcutta hampi-goa hampi-madras hampi-calicut isfahan-bandarabbas isfahan-hormuz isfahan-baghdad baghdad-aleppo aleppo-istanbul aleppo-cairo
istanbul-venice venice-amsterdam moscow-istanbul moscow-amsterdam lhasa-chengdu lhasa-kashgar lhasa-dhaka kashgar-lahore
thanglong-guangzhou thanglong-hue mandalay-chengdu ayutthaya-pegu ayutthaya-phnompenh bangkok-phnompenh bangkok-pegu mataram-batavia mataram-bantam
beijing-kyakhta xian-urga bukhara-moscow kyakhta-irkutsk irkutsk-moscow
mecca-jeddah mecca-baghdad varanasi-agra amritsar-lahore amritsar-delhi kathmandu-varanasi kathmandu-lhasa golconda-masulipatnam golconda-hampi golconda-madras golconda-bombay
kandy-colombo qufu-beijing qufu-nanjing wudang-xian ise-kyoto pyongyang-hanseong pyongyang-mukden mukden-beijing lanzhou-xian lanzhou-dunhuang dunhuang-turfan turfan-kashgar
kunming-chengdu kunming-thanglong kunming-mandalay luangprabang-chiangmai chiangmai-ayutthaya chiangmai-bangkok vientiane-hue herat-isfahan herat-bukhara herat-kabul
tabriz-isfahan tabriz-istanbul tabriz-baghdad khiva-bukhara khiva-astrakhan jerusalem-aleppo rome-venice
kaifeng-beijing kaifeng-xian nara-kyoto nara-osaka gyeongju-busan gyeongju-hanseong srinagar-lahore srinagar-kashgar mashhad-herat mashhad-bukhara mashhad-isfahan kandahar-kabul kandahar-herat
panama-cartagena veracruz-mexico mexico-acapulco tobolsk-moscow tobolsk-irkutsk tobolsk-bukhara yakutsk-okhotsk nerchinsk-irkutsk nerchinsk-kyakhta
uiju-mukden kaesong-hanseong kaesong-pyongyang jeonju-hanseong jeonju-busan gangneung-hanseong
kanazawa-kyoto sendai-edo sendai-matsumae
datong-beijing datong-xian luoyang-kaifeng luoyang-xian luoyang-wuhan kham-chengdu kham-lhasa
dunhuang-hami hami-turfan khotan-yarkand yarkand-kashgar tashkent-samarkand tashkent-khiva tashkent-kashgar
shiraz-isfahan yazd-isfahan yazd-shiraz yazd-mashhad mataram-semarang mataram-surabaya
damascus-aleppo damascus-jerusalem damascus-baghdad damascus-antioch antioch-aleppo antioch-istanbul patna-kathmandu patna-agra taxila-lahore taxila-kabul taxila-srinagar taxila-kashgar angkor-ayutthaya angkor-bangkok
seville-madrid madrid-lisbon madrid-paris paris-marseille paris-antwerp paris-genoa
antwerp-amsterdam amsterdam-hamburg hamburg-prague prague-vienna vienna-venice vienna-krakow krakow-prague krakow-moscow
stpetersburg-moscow@1703 stpetersburg-krakow@1703
florence-genoa florence-rome florence-venice
vienna-belgrade belgrade-ragusa belgrade-istanbul belgrade-athens
smyrna-istanbul smyrna-aleppo trebizond-tabriz trebizond-aleppo trebizond-tbilisi
tbilisi-tabriz tbilisi-baku tbilisi-astrakhan baku-isfahan baku-tabriz baku-astrakhan
caffa-moscow kazan-tobolsk kazan-orenburg@1743 orenburg-moscow@1743 orenburg-khiva@1743 orenburg-tashkent@1743
kokand-tashkent kokand-kashgar kokand-samarkand merv-mashhad merv-bukhara merv-herat balkh-samarkand balkh-kabul balkh-herat balkh-bukhara
ili-tashkent ili-turfan ili-kashgar ili-urga karakorum-urga karakorum-kyakhta karakorum-hami
fez-algiers fez-seville algiers-carthage fez-timbuktu`;

export interface Edge {
	a: string;
	b: string;
	mode: Mode;
	from?: number;
	secret?: string; // id of the secret that reveals it
}

/** Hidden routes: invisible until a card reveals them (flag `secret:<id>`). */
export const SECRETS: { id: string; name: string; edges: string; mode: Mode; hint: string }[] = [
	{ id: 'tea-horse', name: 'The Tea Horse Road', edges: 'kunming-lhasa chengdu-lhasa', mode: 'land', hint: 'mule caravans carry brick tea over the mountains to Tibet' },
	{ id: 'wakhan', name: 'The Wakhan Corridor', edges: 'kashgar-kabul', mode: 'land', hint: 'a narrow valley between the Pamirs and the Hindu Kush' },
	{ id: 'smugglers', name: 'The Smugglers\u2019 Run', edges: 'ningbo-nagasaki-x tainan-kagoshima macau-kagoshima', mode: 'sea', hint: 'unlicensed junks slip into southern Japan at night' },
	{ id: 'northern-sea', name: 'The Northern Sea Route', edges: 'okhotsk-yakutsk-x petropavlovsk-hakodate sitka-okhotsk', mode: 'sea', hint: 'ice-choked waters that only the bravest Russian skippers know' },
	{ id: 'shambhala', name: 'The Way to Shambhala', edges: 'lhasa-shambhala kathmandu-shambhala', mode: 'land', hint: 'a pass that appears only to the pure of heart' },
	{ id: 'penglai', name: 'The Mirage Sea', edges: 'hangzhou-penglai busan-penglai shanghai-penglai', mode: 'sea', hint: 'sail toward the mirage at dawn and do not look away' },
	{ id: 'gold-island', name: 'The Gold Island Passage', edges: 'aceh-suvarnadvipa malacca-suvarnadvipa batavia-suvarnadvipa', mode: 'sea', hint: 'follow the yellow river-water out to sea' },
	{ id: 'waqwaq', name: 'Beyond the Charts', edges: 'zanzibar-waqwaq kilwa-waqwaq colombo-waqwaq', mode: 'sea', hint: 'past the last island on Ibn Majid\u2019s chart, the trees begin to sing' },
	{ id: 'wajo-sea-lane', name: 'The Wakō Sea Lane', edges: 'busan-hiroshima busan-kagoshima', mode: 'sea', hint: 'the old pirates’ crossing between Korea and the Inland Sea, used by smugglers who never pay the Tsushima toll' },
	{ id: 'nakasendo-shortcut', name: 'The Mountain Shortcut of the Nakasendō', edges: 'edo-kanazawa kyoto-shimoda', mode: 'land', hint: 'a forbidden pass that skips two barrier stations of the shogun' },
	{ id: 'khotan-jade-road', name: 'The Jade Road', edges: 'kashgar-khotan', mode: 'land', hint: 'jade smugglers cross the Taklamakan by a line of dead poplars' },
	{ id: 'mekong-portage', name: 'The Mekong Portage', edges: 'ayutthaya-vientiane hue-luangprabang', mode: 'land', hint: 'elephant drivers know a forest track that avoids the river rapids' },
	{ id: 'salt-road', name: 'The Salt Road over the Himalaya', edges: 'calcutta-kathmandu dhaka-kathmandu', mode: 'land', hint: 'Newar traders carry salt and silver over passes no map shows' },
	{ id: 'grand-canal-cut', name: 'The Old Canal Cut', edges: 'hangzhou-wuhan nanjing-ningbo', mode: 'river', hint: 'a silted Sui-dynasty canal still passable at high water' },
	{ id: 'pearl-smugglers', name: 'The Pearl River Back Door', edges: 'macau-tainan hongkong-quanzhou', mode: 'sea', hint: 'opium clippers run without lights between the Pearl River and Formosa' },
	{ id: 'qanat-way', name: 'The Way of the Qanats', edges: 'hormuz-yazd basra-isfahan', mode: 'land', hint: 'underground water channels with caravanserais hidden below the desert' },
	{ id: 'amber-road', name: 'The Old Amber Road', edges: 'krakow-venice stpetersburg-vienna', mode: 'land', hint: 'amber merchants follow a Roman wagon track from the Baltic over the Carnic Alps to the lagoon' },
	{ id: 'dariel-pass', name: 'The Gorge of Dariel', edges: 'moscow-tbilisi caffa-tbilisi', mode: 'land', hint: 'a sheer cleft through the Caucasus snows guarded by Alan watchtowers' },
	{ id: 'saharan-gold', name: 'The Tuareg Salt Trail', edges: 'carthage-timbuktu cairo-timbuktu', mode: 'land', hint: 'blue-veiled guides lead camels from well to secret well across the great sand sea' },
	{ id: 'caspian-sea-lane', name: 'The Caspian Naphtha Run', edges: 'astrakhan-baku baku-mashhad', mode: 'sea', hint: 'shallow-draft coasters slip across the inland sea carrying black oil and Gilan silk' }
];

function parse(s: string, mode: Mode): Edge[] {
	return s
		.split(/\s+/)
		.filter(Boolean)
		.map((p) => {
			const [pair, yr] = p.split('@');
			const [a, b] = pair.split('-');
			if (!CITY[a] || !CITY[b]) throw new Error('bad edge ' + p);
			return { a, b, mode, from: yr ? Number(yr) : undefined };
		})
		.filter((e, i, all) => all.findIndex((x) => (x.a === e.a && x.b === e.b) || (x.a === e.b && x.b === e.a)) === i);
}

const SECRET_EDGES: Edge[] = SECRETS.flatMap((x) =>
	x.edges
		.split(/\s+/)
		.filter(Boolean)
		.map((p) => {
			const [a, b] = p.replace(/-x$/, '').split('-');
			if (!CITY[a] || !CITY[b]) throw new Error('bad secret edge ' + p);
			return { a, b, mode: x.mode, secret: x.id };
		})
);

export const EDGES: Edge[] = [...parse(SEA, 'sea'), ...parse(RIVER, 'river'), ...parse(LAND, 'land'), ...SECRET_EDGES];

const EDGES_BY_CITY: Record<string, Edge[]> = {};
for (const e of EDGES) {
	(EDGES_BY_CITY[e.a] ??= []).push(e);
	(EDGES_BY_CITY[e.b] ??= []).push(e);
}

export function edgeExists(e: Edge, year: number) {
	return (e.from ?? -1e9) <= year && cityExists(CITY[e.a], year, !!e.secret) && cityExists(CITY[e.b], year, !!e.secret);
}

/** Hidden places only "exist" when reached through a secret route (or asked for explicitly). */
export function cityExists(c: City, year: number, secretOk = false) {
	if (c.secret && !secretOk) return false;
	return (c.from ?? -1e9) <= year && year <= (c.until ?? 1e9);
}

export function cityName(c: City, year: number): string {
	if (c.id === 'edo' && year >= 1868) return 'Tokyo';
	if (c.id === 'manila' && year < 1571) return 'Maynila';
	for (const a of c.alt ?? []) if (year < a.until) return a.name;
	return c.name;
}

function haversine(a: City, b: City) {
	const R = 6371;
	const toR = Math.PI / 180;
	const dLat = (b.lat - a.lat) * toR;
	const dLon = (b.lon - a.lon) * toR;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Route {
	secret?: string;
	from: string;
	to: string;
	mode: Mode;
	vessel: string;
	km: number;
	days: number;
	cost: number;
}

function vessel(mode: Mode, year: number, a: City, b: City): { name: string; speed: number; costPerDay: number } {
	const rail =
		(a.culture === 'european' && b.culture === 'european' && year >= 1850) ||
		(a.culture === 'indian' && b.culture === 'indian' && year >= 1870) ||
		(a.culture === 'japanese' && b.culture === 'japanese' && year >= 1889);
	if (mode === 'sea') {
		if (year >= 1850) return { name: 'steamship', speed: 300, costPerDay: 0.7 };
		const byCulture: Partial<Record<CultureId, string>> = {
			han: 'junk',
			japanese: 'red-seal ship',
			korean: 'panokseon',
			malay: 'pinisi',
			persian: 'dhow',
			swahili: 'dhow',
			indian: 'dhow',
			european: year < 1600 ? 'carrack' : 'East Indiaman',
			pacific: 'voyaging canoe',
			ottoman: 'galley',
			viet: 'junk',
			siamese: 'junk'
		};
		if ((a.id === 'manila' && b.id === 'acapulco') || (a.id === 'acapulco' && b.id === 'manila')) return { name: 'Manila galleon', speed: 130, costPerDay: 0.25 };
		return { name: byCulture[a.culture] ?? 'merchant ship', speed: 150, costPerDay: 0.35 };
	}
	if (mode === 'river') return { name: year >= 1860 ? 'river steamer' : 'river barge', speed: year >= 1860 ? 140 : 70, costPerDay: year >= 1860 ? 0.5 : 0.3 };
	if (rail) return { name: 'railway', speed: 450, costPerDay: 1.4 };
	const byCulture: Partial<Record<CultureId, string>> = {
		han: 'mule cart',
		japanese: 'kago palanquin',
		korean: 'pony',
		steppe: 'camel caravan',
		persian: 'camel caravan',
		ottoman: 'caravan',
		tibetan: 'yak train',
		indian: 'bullock cart',
		siamese: 'elephant',
		viet: 'on foot',
		malay: 'on foot',
		european: 'stagecoach'
	};
	return { name: byCulture[a.culture] ?? 'on foot', speed: 35, costPerDay: 0.3 };
}

export function routesFrom(cityId: string, year: number, secrets: string[] = []): Route[] {
	const out: Route[] = [];
	const list = EDGES_BY_CITY[cityId] ?? [];
	for (const e of list) {
		if (e.secret && !secrets.includes(e.secret)) continue;
		const other = e.a === cityId ? e.b : e.a;
		const a = CITY[cityId];
		const b = CITY[other];
		if (!edgeExists(e, year)) continue;
		const km = haversine(a, b) * (e.mode === 'sea' ? 1.25 : 1.15);
		const v = vessel(e.mode, year, a, b);
		const days = Math.max(1, Math.round(km / v.speed));
		const cost = Math.max(1, Math.min(12, Math.round(1 + days * v.costPerDay * 0.8)));
		out.push({ from: cityId, to: other, mode: e.mode, vessel: e.secret ? (e.mode === 'sea' ? 'hired smuggler junk' : 'guide who knows the way') : v.name, km: Math.round(km), days, cost, secret: e.secret });
	}
	return out;
}

const SHORTEST_DAYS_CACHE = new Map<string, Record<string, number>>();

/** Dijkstra on days — used to size the commission deadline. */
export function shortestDays(from: string, year: number): Record<string, number> {
	const key = `${from}:${year}`;
	const cached = SHORTEST_DAYS_CACHE.get(key);
	if (cached) return cached;
	const dist: Record<string, number> = { [from]: 0 };
	const done = new Set<string>();
	while (true) {
		let u: string | null = null;
		for (const k in dist) if (!done.has(k) && (u === null || dist[k] < dist[u])) u = k;
		if (u === null) break;
		done.add(u);
		for (const r of routesFrom(u, year)) {
			const d = dist[u] + r.days + 2; // +2 ≈ time spent in port
			if (dist[r.to] === undefined || d < dist[r.to]) dist[r.to] = d;
		}
	}
	if (SHORTEST_DAYS_CACHE.size > 2000) SHORTEST_DAYS_CACHE.clear();
	SHORTEST_DAYS_CACHE.set(key, dist);
	return dist;
}

export function kmBetween(a: string, b: string) {
	return haversine(CITY[a], CITY[b]);
}

/** Shortest path (by days) — city ids from → to inclusive. */
export function shortestPath(from: string, to: string, year: number): string[] {
	const dist: Record<string, number> = { [from]: 0 };
	const prev: Record<string, string> = {};
	const done = new Set<string>();
	while (true) {
		let u: string | null = null;
		for (const k in dist) if (!done.has(k) && (u === null || dist[k] < dist[u])) u = k;
		if (u === null || u === to) break;
		done.add(u);
		for (const r of routesFrom(u, year)) {
			const d = dist[u] + r.days + 2;
			if (dist[r.to] === undefined || d < dist[r.to]) {
				dist[r.to] = d;
				prev[r.to] = u;
			}
		}
	}
	const path = [to];
	while (path[0] !== from && prev[path[0]]) path.unshift(prev[path[0]]);
	return path[0] === from ? path : [from, to];
}
