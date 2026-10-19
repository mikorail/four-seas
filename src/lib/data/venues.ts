// What each city has to offer: not every town has a bazaar, a palace or an academy.
import type { City } from './world';
import type { CultureId } from './cultures';

export type VenueId = 'inn' | 'temple' | 'square' | 'market' | 'bazaar' | 'harbor' | 'palace' | 'academy' | 'bridge' | 'landmark' | 'festival' | 'hearth' | 'well' | 'herbalist' | 'shrine';

export type LandmarkShape = 'wall' | 'pagoda' | 'dome' | 'tower' | 'pyramid' | 'stupa' | 'gate' | 'cave' | 'garden';

export interface Venue {
	shape?: LandmarkShape;
	damaged?: string; // what a disaster did to it ("the roof fell in")
	closed?: boolean; // too ruined to visit at all
	id: VenueId;
	name: string;
	glyph: string;
	blurb: string;
}

const TINY = new Set(['wudang', 'ise', 'shimoda', 'kandy', 'yakutsk', 'okhotsk', 'petropavlovsk', 'nerchinsk', 'kyakhta', 'mecca', 'shambhala', 'penglai', 'suvarnadvipa', 'waqwaq', 'guam', 'tahiti', 'sitka', 'banda', 'ternate', 'urga', 'perth', 'hobart', 'hakodate', 'gyeongju', 'nara', 'qufu']);
const BAZAARS = new Set(['guangzhou', 'istanbul', 'isfahan', 'tabriz', 'aleppo', 'cairo', 'delhi', 'agra', 'surat', 'malacca', 'batavia', 'beijing', 'nanjing', 'osaka', 'edo', 'hangzhou', 'suzhou', 'samarkand', 'bukhara', 'kashgar', 'baghdad', 'venice', 'amsterdam', 'london', 'lisbon', 'mexico', 'manila', 'zanzibar', 'muscat', 'hormuz', 'calicut', 'goa', 'macau', 'nagasaki', 'hanseong', 'bombay', 'calcutta', 'hongkong', 'singapore', 'lahore', 'dhaka', 'mocha', 'alexandria', 'damascus', 'athens', 'carthage', 'antioch', 'patna', 'seville', 'paris', 'genoa', 'antwerp', 'hamburg', 'vienna', 'smyrna', 'fez', 'timbuktu', 'kazan', 'baku', 'kokand']);
const PALACES: Record<string, string> = {
	beijing: 'The Forbidden City', nanjing: 'The Ming Palace', hanseong: 'Gyeongbokgung Palace', kyoto: 'The Imperial Palace', edo: 'Edo Castle', thanglong: 'The Imperial Citadel', hue: 'The Purple Forbidden City',
	ayutthaya: 'The Grand Palace of Ayutthaya', bangkok: 'The Grand Palace', ava: 'The Golden Palace of Ava', mandalay: 'Mandalay Palace', pegu: 'Kanbawzathadi Palace', malacca: 'The Sultan’s istana', aceh: 'Dalam Darud Donya',
	mataram: 'The Kraton', brunei: 'The water palace', ternate: 'The Kedaton', delhi: 'The Red Fort', agra: 'Agra Fort', lahore: 'Lahore Fort', golconda: 'Golconda Fort', hampi: 'The royal enclosure',
	isfahan: 'Ali Qapu Palace', istanbul: 'Topkapı Palace', cairo: 'The Citadel', lisbon: 'Ribeira Palace', london: 'Whitehall', venice: 'The Doge’s Palace', moscow: 'The Kremlin', lhasa: 'The Potala',
	kathmandu: 'Hanuman Dhoka', bukhara: 'The Ark', samarkand: 'The Kok Saray', honolulu: 'The royal compound', kabul: 'The Bala Hissar', mexico: 'The Viceregal Palace', lima: 'The Palace of the Viceroy', zanzibar: 'The Sultan’s palace', manila: 'Malacañang', batavia: 'The Governor-General’s house',
	damascus: 'Qasr al-Azm', athens: 'The Palace of the Voivode', angkor: 'The Royal Palace of Angkor Thom', patna: 'The Mauryan Throne Hall ruins', taxila: 'The Palace of Sirkap', alexandria: 'The Ras el-Tin Palace', carthage: 'Dar el-Bey',
	madrid: 'The Royal Alcázar', paris: 'The Palais du Louvre', vienna: 'The Hofburg', prague: 'Prague Castle', krakow: 'Wawel Royal Castle', stpetersburg: 'The Winter Palace', stockholm: 'Tre Kronor Castle', florence: 'Palazzo Vecchio', genoa: 'The Doge’s Palace of Genoa', ragusa: 'The Rector’s Palace', kazan: 'The Kazan Kremlin', baku: 'Palace of the Shirvanshahs', kokand: 'The Palace of Khudayar Khan', algiers: 'The Casbah Dey’s Palace', fez: 'Dar al-Makhzen'
};
const ACADEMIES: Record<string, string> = {
	beijing: 'The Guozijian (Imperial Academy)', nanjing: 'The Nanjing Guozijian', hanseong: 'Sungkyunkwan', kyoto: 'The Kyoto academies', edo: 'The Shōheikō', hangzhou: 'The West Lake academies', suzhou: 'Suzhou’s scholar gardens', qufu: 'The Temple of Confucius school',
	isfahan: 'The Madrasa of the Shah', istanbul: 'The Süleymaniye madrasas', cairo: 'Al-Azhar', bukhara: 'The Mir-i Arab madrasa', samarkand: 'The Ulugh Beg madrasa', varanasi: 'The pandits of Kashi', delhi: 'The Madrasa-i-Rahimiya',
	lisbon: 'The University of Coimbra’s envoys', rome: 'The Roman College', venice: 'The University of Padua', london: 'The Royal Society', amsterdam: 'Leiden University', mexico: 'The Royal University of Mexico', lima: 'San Marcos University',
	goa: 'St Paul’s College', macau: 'St Paul’s College of Macao', nagasaki: 'The Dutch studies school', lhasa: 'Drepung Monastery', kathmandu: 'The pandits of the valley',
	alexandria: 'The Mouseion & Patriarchal Library', damascus: 'Al-Adiliyah Madrasa', athens: 'The Academy of Athens', patna: 'Nalanda & ancient Ganges viharas', taxila: 'The ancient stone halls of Takshashila', angkor: 'The Royal Library of the God-Kings', antioch: 'The Academy of Antioch',
	paris: 'The Sorbonne', prague: 'The Clementinum & Rudolphine Court', krakow: 'The Jagiellonian Collegium Maius', vienna: 'The University of Vienna', florence: 'The Accademia del Cimento', stpetersburg: 'The Imperial Academy of Sciences', fez: 'Al-Qarawiyyin University', timbuktu: 'Sankore Madrasa'
};
const BRIDGES: Record<string, string> = {
	isfahan: 'Khaju Bridge', suzhou: 'Precious Belt Bridge', kyoto: 'Sanjō Ōhashi', edo: 'Nihonbashi', venice: 'The Rialto', london: 'London Bridge', beijing: 'The Marco Polo Bridge', hangzhou: 'The Broken Bridge',
	hoian: 'The Japanese Covered Bridge', nagasaki: 'Spectacles Bridge', srinagar: 'The Zaina Kadal', baghdad: 'The bridge of boats', lahore: 'Ravi bridge of boats', chengdu: 'The Anshun Bridge',
	florence: 'Ponte Vecchio', prague: 'Charles Bridge', paris: 'Pont Neuf', tbilisi: 'Metekhi Bridge'
};
const LANDMARKS: Record<string, { name: string; from?: number; blurb: string; shape?: LandmarkShape }> = {
	beijing: { name: 'The Great Wall', blurb: 'A stone dragon over the mountains, ten thousand li long.', shape: 'wall' },
	xian: { name: 'The Big Wild Goose Pagoda', blurb: 'Built to house the sutras Xuanzang carried from India.', shape: 'pagoda' },
	agra: { name: 'The Taj Mahal', from: 1653, blurb: 'A white marble tomb that seems to float above the river.', shape: 'dome' },
	delhi: { name: 'The Qutb Minar', blurb: 'A fluted red tower older than the Mughals.', shape: 'tower' },
	istanbul: { name: 'Hagia Sophia', blurb: 'A thousand-year-old dome that seems hung from heaven on a chain.', shape: 'dome' },
	isfahan: { name: 'Naqsh-e Jahan Square', blurb: 'Half the world, framed in turquoise tile.', shape: 'dome' },
	samarkand: { name: 'The Registan', blurb: 'Three madrasas facing each other in blue and gold.', shape: 'dome' },
	lhasa: { name: 'The Potala Palace', from: 1649, blurb: 'A white-and-red mountain of a palace on a mountain.', shape: 'gate' },
	kyoto: { name: 'Kinkaku-ji, the Golden Pavilion', blurb: 'Gold leaf reflected in a still pond.', shape: 'pagoda' },
	nara: { name: 'The Great Buddha of Tōdai-ji', blurb: 'A bronze Buddha so large a man can crawl through his nostril.', shape: 'pagoda' },
	mataram: { name: 'Borobudur', from: 1814, blurb: 'A mountain of carved stone stupas, just freed from the jungle.', shape: 'stupa' },
	phnompenh: { name: 'The ruins of Angkor', blurb: 'Stone faces smiling from a forest that swallowed an empire.', shape: 'stupa' },
	bangkok: { name: 'Wat Arun', blurb: 'A temple spire covered in broken Chinese porcelain.', shape: 'stupa' },
	ayutthaya: { name: 'The golden chedis of Ayutthaya', blurb: 'Three hundred temples glittering on an island.', shape: 'stupa' },
	pegu: { name: 'The Shwemawdaw Pagoda', blurb: 'A golden spire taller than any tower in Europe.', shape: 'stupa' },
	hue: { name: 'The Thiên Mụ Pagoda', blurb: 'Seven storeys above the Perfume River.', shape: 'pagoda' },
	hanseong: { name: 'Namdaemun Gate', blurb: 'The great south gate of the royal capital.', shape: 'gate' },
	gyeongju: { name: 'Seokguram Grotto', blurb: 'A granite Buddha facing the eastern sea at dawn.', shape: 'cave' },
	kandy: { name: 'The Temple of the Tooth', blurb: 'Where the Buddha’s tooth is kept behind seven caskets.', shape: 'pagoda' },
	cairo: { name: 'The Pyramids of Giza', blurb: 'Older than every empire you have ever heard of.', shape: 'pyramid' },
	jerusalem: { name: 'The Dome of the Rock', blurb: 'A golden dome over the rock where three faiths meet.', shape: 'dome' },
	mecca: { name: 'The Kaaba', blurb: 'The black-draped house at the centre of the world’s prayers.', shape: 'gate' },
	rome: { name: 'St Peter’s Basilica', blurb: 'Michelangelo’s dome over the Jesuits’ home.', shape: 'dome' },
	venice: { name: 'San Marco', blurb: 'Gold mosaics and four bronze horses stolen from Constantinople.', shape: 'dome' },
	london: { name: 'St Paul’s Cathedral', from: 1710, blurb: 'Wren’s dome, rising from the ashes of the Great Fire.', shape: 'dome' },
	amsterdam: { name: 'The canals and the VOC warehouse', blurb: 'Where the spices of half the world are counted.', shape: 'garden' },
	mexico: { name: 'The Zócalo and its cathedral', blurb: 'Built on the stones of the Aztec temple.', shape: 'pyramid' },
	dunhuang: { name: 'The Mogao Caves', blurb: 'A thousand painted grottoes in a desert cliff.', shape: 'cave' },
	kashgar: { name: 'The Id Kah Mosque', blurb: 'Yellow-tiled heart of the oasis.', shape: 'dome' },
	hangzhou: { name: 'West Lake', blurb: 'Willows, pagodas and poets drowning in beauty.', shape: 'garden' },
	suzhou: { name: 'The Humble Administrator’s Garden', blurb: 'Rocks and water arranged like a landscape painting.', shape: 'garden' },
	amritsar: { name: 'The Golden Temple', blurb: 'Floating on its pool of nectar.', shape: 'dome' },
	varanasi: { name: 'The burning ghats', blurb: 'Fires that have not gone out for three thousand years.', shape: 'stupa' },
	hampi: { name: 'The Vitthala Temple', blurb: 'Stone pillars that ring like bells when struck.', shape: 'pagoda' },
	malacca: { name: 'A Famosa', from: 1511, blurb: 'The Portuguese fortress on the strait.', shape: 'wall' },
	manila: { name: 'Intramuros', from: 1571, blurb: 'Walled Spanish city of churches and cannon.', shape: 'wall' },
	kilwa: { name: 'The Great Mosque of Kilwa', blurb: 'Coral-stone domes by the Indian Ocean.', shape: 'dome' },
	lahore: { name: 'The Badshahi Mosque', from: 1673, blurb: 'Red sandstone big enough for a hundred thousand.', shape: 'dome' },
	edo: { name: 'The Nihonbashi milestone', blurb: 'Every road in Japan is measured from here.', shape: 'gate' },
	bukhara: { name: 'The Kalyan Minaret', blurb: 'So beautiful even Genghis Khan spared it.', shape: 'tower' },
	alexandria: { name: 'The Citadel of Qaitbay & the Pharos ruins', blurb: 'Built on the exact foundations of the ancient lighthouse.', shape: 'tower' },
	damascus: { name: 'The Umayyad Mosque', blurb: 'Green and gold mosaics under a soaring dome, holding the shrine of John the Baptist.', shape: 'dome' },
	athens: { name: 'The Parthenon', blurb: 'Fluted Pentelic marble glowing golden against the Aegean sky.', shape: 'wall' },
	angkor: { name: 'Angkor Wat', blurb: 'Five lotus-bud stone towers surrounded by a vast moat.', shape: 'stupa' },
	patna: { name: 'Ashoka’s Pillars on the Ganges', blurb: 'Polished sandstone carved with ancient edicts of non-violence.', shape: 'stupa' },
	taxila: { name: 'Dharmarajika Stupa', blurb: 'Ancient stone stupa of Gandharan kings where Buddha’s relics were enshrined.', shape: 'stupa' },
	antioch: { name: 'The Cave Church of Saint Peter', blurb: 'Carved into the living rock of Mount Silpius where believers first gathered.', shape: 'cave' },
	carthage: { name: 'The Byrsa Citadel & Punic Ports', blurb: 'Circular harbors where Hannibal’s warships once anchored.', shape: 'wall' },
	seville: { name: 'La Giralda & the Alcázar', blurb: 'Almohad brick bell-tower and tiled courtyards where the Indies fleets are blessed.', shape: 'tower' },
	paris: { name: 'Notre-Dame de Paris', blurb: 'Twin Gothic towers and rose windows rising from an island in the Seine.', shape: 'tower' },
	florence: { name: 'Brunelleschi’s Dome', blurb: 'Red-tiled octagonal dome of Santa Maria del Fiore, crowning the Tuscan sky.', shape: 'dome' },
	vienna: { name: 'St. Stephen’s Cathedral', blurb: 'Glazed mosaic roof tiles and the soaring south spire watching over the Danube.', shape: 'tower' },
	prague: { name: 'The Astronomical Clock of Old Town Square', blurb: 'Gilded dials of sun, moon, and zodiac where mechanical apostles march every hour.', shape: 'tower' },
	krakow: { name: 'The Cloth Hall & St. Mary’s Basilica', blurb: 'Renaissance arcades in the vast market square where a trumpeter sounds the hour.', shape: 'tower' },
	stpetersburg: { name: 'The Peter and Paul Fortress', from: 1703, blurb: 'Gilded needle spire rising above the Neva bastions where the Tsars are laid to rest.', shape: 'tower' },
	ragusa: { name: 'The Walls of Ragusa & Fort Lovrijenac', blurb: 'Limestone curtain walls and sea bastions that never yielded to Venice or the Porte.', shape: 'wall' },
	baku: { name: 'The Ateshgah Fire Temple & Maiden Tower', blurb: 'Natural gas flames burning in stone altars where Zoroastrian and Hindu pilgrims pray.', shape: 'tower' },
	merv: { name: 'The Mausoleum of Sultan Sanjar', blurb: 'A turquoise-domed Seljuk cube visible a day’s ride across the Karakum desert.', shape: 'dome' },
	timbuktu: { name: 'Djinguereber Mosque', blurb: 'Sun-baked earth and bristling palm-wood beams built by Mansa Musa after his Hajj.', shape: 'pyramid' },
	fez: { name: 'The Chouara Tanneries', blurb: 'Stone vats of saffron, indigo, and poppy dye steaming beneath the medina rooftops.', shape: 'garden' },
	karakorum: { name: 'Erdene Zuu Monastery', blurb: 'One hundred and eight white stupas raised from the carved stones of the Great Khan’s capital.', shape: 'stupa' }
};

const SQUARE_NAME: Partial<Record<CultureId, string>> = {
	malay: 'Alun-alun',
	indian: 'Maidan',
	persian: 'Meydan',
	ottoman: 'Meydan',
	steppe: 'Registan',
	european: 'Plaza',
	japanese: 'Temple fairground',
	korean: 'Market crossroads',
	pacific: 'Village green'
};

export function venuesOf(city: City, year: number, festival: string | null): Venue[] {
	const v: Venue[] = [];
	const inn = city.culture === 'ottoman' || city.culture === 'persian' || city.culture === 'steppe' ? 'Caravanserai' : city.culture === 'japanese' ? 'Ryokan' : TINY.has(city.id) ? 'Wayside inn' : 'Inn & tavern';
	v.push({ id: 'inn', name: inn, glyph: '🏮', blurb: 'Rest, gossip, drink, dice — and trouble.' });
	if (festival) v.push({ id: 'festival', name: festival, glyph: '🎆', blurb: 'The whole town is out tonight.' });
	if (!TINY.has(city.id)) v.push({ id: 'square', name: SQUARE_NAME[city.culture] ?? 'Town square', glyph: '🏛️', blurb: 'Storytellers, recruiters, proclamations and performers.' });
	v.push({ id: 'temple', name: city.culture === 'european' ? 'Church' : 'Temple / shrine', glyph: '⛩️', blurb: 'Prayer, alms, pilgrims and monks.' });
	if (BAZAARS.has(city.id)) v.push({ id: 'bazaar', name: 'Great bazaar', glyph: '🛍️', blurb: 'Outfits, antiques, maps, supplies and rare goods.' });
	else if (!TINY.has(city.id)) v.push({ id: 'market', name: 'Market', glyph: '🧺', blurb: 'Supplies, local dress and local curios.' });
	if (city.port) v.push({ id: 'harbor', name: 'Harbour', glyph: '⚓', blurb: 'Ships, sailors, contracts and smugglers.' });
	if (PALACES[city.id]) v.push({ id: 'palace', name: PALACES[city.id], glyph: '🏯', blurb: 'Court, officials and intrigue.' });
	if (ACADEMIES[city.id]) v.push({ id: 'academy', name: ACADEMIES[city.id], glyph: '📚', blurb: 'Scholars, inventors, maps and debates.' });
	if (BRIDGES[city.id]) v.push({ id: 'bridge', name: BRIDGES[city.id], glyph: '🌉', blurb: 'Lovers, merchants and strangers cross here.' });
	const lm = LANDMARKS[city.id];
	if (lm && (lm.from ?? 0) <= year) v.push({ id: 'landmark', name: lm.name, glyph: '🗿', blurb: lm.blurb, shape: lm.shape ?? 'tower' });
	return v;
}

export const landmarkOf = (id: string) => LANDMARKS[id];
export const palaceOf = (id: string) => PALACES[id];
export const academyOf = (id: string) => ACADEMIES[id];
export const bridgeOf = (id: string) => BRIDGES[id];
export const isBazaar = (id: string) => BAZAARS.has(id);
