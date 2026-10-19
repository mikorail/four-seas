// Market goods: outfits you wear, antiques/curios with a hidden best market, route maps and riddle maps.
import type { CultureId, HatKind } from './cultures';
import type { Perk } from './traits';

export interface Outfit {
	id: string;
	name: string;
	glyph: string;
	desc: string;
	price: number;
	sold: CultureId[] | 'any';
	from?: number;
	until?: number;
	hat?: HatKind | 'keep';
	robe?: string; // robe colour on the portrait
	perk: Omit<Perk, 'id' | 'name' | 'glyph' | 'bio' | 'pro'>;
	/** Wearing it makes locals of these cultures treat you as one of their own (no "foreign" penalty). */
	local?: CultureId[] | 'sold';
	access: string; // what it opens up, shown in the market
}

export const OUTFITS: Record<string, Outfit> = {
	'monk-robes': { id: 'monk-robes', name: 'Monk’s robes', glyph: '🟠', desc: 'Saffron or grey, shaved head, a begging bowl. Bandits hesitate; temples open.', price: 6, sold: ['han', 'tibetan', 'siamese', 'japanese', 'korean', 'viet'], hat: 'bare', robe: '#c9832c', perk: { mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.3 }, { tags: ['official'], loss: 0.8 }] }, access: 'Temple and pilgrimage options; officials go easier' },
	'mandarin-robe': { id: 'mandarin-robe', name: 'Mandarin’s robe with rank badge', glyph: '🐦', desc: 'Silk court robe with an embroidered crane on the chest. Expensive, and slightly illegal if it is not yours.', price: 26, sold: ['han', 'korean', 'viet'], hat: 'keep', robe: '#2f4a6b', perk: { mult: [{ tags: ['official'], loss: 0.55 }, { tags: ['talk'], stat: 'renown', gain: 1.2 }] }, local: 'sold', access: 'Courts and checkpoints in the Confucian world; scholars defer' },
	'samurai-armor': { id: 'samurai-armor', name: 'Samurai armour (ō-yoroi)', glyph: '🛡️', desc: 'Lacquered plates and a horned helmet. Heavy, loud, terrifying.', price: 24, sold: ['japanese'], until: 1876, hat: 'kabuto', robe: '#3a3a3a', perk: { gamble: [{ tags: ['fight'], bonus: 0.2 }], mult: [{ tags: ['fight'], stat: 'vigor', loss: 0.65 }] }, access: 'Duels and bandits: +20%; enemies think twice' },
	'janissary-uniform': { id: 'janissary-uniform', name: 'Janissary uniform', glyph: '🪖', desc: 'Tall white börk with a spoon in it (really). Every Ottoman soldier salutes.', price: 20, sold: ['ottoman'], until: 1826, hat: 'bork', robe: '#7a1f1f', perk: { gamble: [{ tags: ['fight'], bonus: 0.12 }], mult: [{ tags: ['official'], loss: 0.7 }] }, local: ['ottoman'], access: 'Ottoman gates and garrisons treat you as one of their own' },
	'company-uniform': { id: 'company-uniform', name: 'Company officer’s coat', glyph: '🧥', desc: 'Red coat, brass buttons, a tricorn. The Dutch or English Company’s colours.', price: 22, sold: ['european', 'malay', 'indian'], from: 1600, hat: 'tricorn', robe: '#9c1f1f', perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.15 }, { tags: ['official'], loss: 0.7 }] }, local: ['european'], access: 'Company forts, factories and Dejima; trade +15%' },
	'silk-turban': { id: 'silk-turban', name: 'Jewelled silk turban', glyph: '👳', desc: 'A Mughal courtier’s turban with an aigrette of heron feathers.', price: 16, sold: ['indian', 'persian'], hat: 'turban', robe: '#c1440e', perk: { mult: [{ tags: ['talk', 'official'], stat: 'renown', gain: 1.25 }] }, local: ['indian', 'persian'], access: 'Courts of Hindustan and Persia receive you as a gentleman' },
	'pirate-garb': { id: 'pirate-garb', name: 'Sea rover’s rig', glyph: '🏴', desc: 'Sash, headscarf, a knife in the boot. Smells of tar and bad decisions.', price: 8, sold: ['malay', 'han', 'swahili', 'european'], hat: 'bandana', robe: '#2b2b2b', perk: { gamble: [{ tags: ['crime', 'sea'], bonus: 0.15 }], mult: [{ tags: ['official'], loss: 1.3 }] }, access: 'Pirates hail you as a friend; constables do not' },
	'merchant-silks': { id: 'merchant-silks', name: 'Prosperous merchant’s silks', glyph: '💰', desc: 'Good cloth, a fat purse at the belt and a ledger under the arm.', price: 12, sold: 'any', hat: 'keep', robe: '#6b4a2b', perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.2 }] }, access: 'Trade +20%; guilds take you seriously' },
	'pilgrim-garb': { id: 'pilgrim-garb', name: 'Pilgrim’s white garb', glyph: '🤍', desc: 'Plain white cloth, a staff, a gourd. Everybody helps a pilgrim.', price: 4, sold: 'any', hat: 'keep', robe: '#ece6d8', perk: { mult: [{ tags: ['faith', 'rest'], gain: 1.2 }, { tags: ['crime'], loss: 1.2 }] }, access: 'Holy places, hospitality from strangers' },
	'beggar-rags': { id: 'beggar-rags', name: 'Beggar’s rags', glyph: '🧺', desc: 'Nobody looks twice at a beggar. That is the point.', price: 1, sold: 'any', hat: 'bare', robe: '#7a6a55', perk: { mult: [{ tags: ['talk', 'official'], stat: 'renown', loss: 1.3 }] }, access: 'Perfect disguise: slip past constables and checkpoints' },
	'scholar-robes': { id: 'scholar-robes', name: 'Scholar’s robes', glyph: '📜', desc: 'Ink-stained sleeves and a scroll case. Libraries and academies open their doors.', price: 10, sold: ['han', 'korean', 'japanese', 'viet', 'persian', 'european'], hat: 'keep', robe: '#3f5e45', perk: { gamble: [{ tags: ['talk', 'art'], bonus: 0.12 }] }, access: 'Debates and scholars: +12%' },
	'explorer-kit': { id: 'explorer-kit', name: 'Explorer’s pith helmet & khaki', glyph: '🧭', desc: 'The latest thing from London: cork helmet, many pockets.', price: 18, sold: ['european', 'indian', 'malay'], from: 1830, hat: 'pith', robe: '#b8a57a', perk: { travelDays: 0.9, mult: [{ tags: ['illness'], stat: 'vigor', loss: 0.8 }] }, access: 'Journeys 10% shorter; tropical fevers hurt less' },
	'local-dress': { id: 'local-dress', name: 'Local dress', glyph: '👘', desc: 'What people here actually wear — hanbok, kimono, áo dài, kebaya, kurta, kaftan, deel…', price: 7, sold: 'any', hat: 'keep', perk: {}, local: 'sold', access: 'Locals treat you as one of their own' }
};

export interface Curio {
	id: string;
	name: string;
	glyph: string;
	from: CultureId[];
	prized: CultureId[];
	price: number;
	pitch: string; // what the vendor says
}

export const CURIOS: Curio[] = [
	{ id: 'curio-celadon', name: 'Goryeo celadon vase', glyph: '🏺', from: ['korean'], prized: ['japanese', 'han'], price: 10, pitch: 'Japanese tea masters would sell their swords for this green.' },
	{ id: 'curio-blue-white', name: 'Ming blue-and-white jar', glyph: '🫙', from: ['han'], prized: ['persian', 'ottoman', 'european', 'swahili'], price: 11, pitch: 'In Isfahan and Constantinople they line whole palace rooms with these.' },
	{ id: 'curio-katana', name: 'Old Bizen sword', glyph: '🗡️', from: ['japanese'], prized: ['european', 'han'], price: 14, pitch: 'The Dutch in Batavia and the lords of Europe pay ten times this.' },
	{ id: 'curio-netsuke', name: 'Ivory netsuke toggle', glyph: '🐇', from: ['japanese'], prized: ['european'], price: 6, pitch: 'Foreigners are mad for them. No one here understands why.' },
	{ id: 'curio-miniature', name: 'Persian miniature painting', glyph: '🖼️', from: ['persian'], prized: ['indian', 'ottoman'], price: 12, pitch: 'The Mughal ateliers pay a fortune for a master from Herat.' },
	{ id: 'curio-carpet', name: 'Isfahan silk carpet', glyph: '🧶', from: ['persian'], prized: ['european', 'ottoman'], price: 14, pitch: 'Venetians hang these on walls, not floors. Barbarians.' },
	{ id: 'curio-jade', name: 'Carved jade seal', glyph: '🟢', from: ['han'], prized: ['steppe', 'tibetan', 'korean'], price: 10, pitch: 'Khans and lamas value jade above gold.' },
	{ id: 'curio-thangka', name: 'Painted thangka scroll', glyph: '🎨', from: ['tibetan'], prized: ['han', 'steppe', 'european'], price: 9, pitch: 'Mongol princes and Peking temples both want these.' },
	{ id: 'curio-kris', name: 'Wavy-bladed kris', glyph: '⚔️', from: ['malay'], prized: ['european', 'han'], price: 8, pitch: 'Every Company officer wants one to take home.' },
	{ id: 'curio-pashmina', name: 'Kashmir pashmina shawl', glyph: '🧣', from: ['indian'], prized: ['european', 'persian', 'ottoman'], price: 9, pitch: 'Paris and Constantinople cannot get enough of these.' },
	{ id: 'curio-ivory-chess', name: 'Carved ivory chess set', glyph: '♟️', from: ['indian', 'swahili'], prized: ['european', 'persian'], price: 11, pitch: 'A shah or a duke would pay handsomely.' },
	{ id: 'curio-astrolabe', name: 'Brass astrolabe', glyph: '🧭', from: ['persian', 'ottoman'], prized: ['european', 'han', 'indian'], price: 13, pitch: 'Astronomers from Peking to Paris will fight over it.' },
	{ id: 'curio-clock', name: 'European singing clock', glyph: '🕰️', from: ['european'], prized: ['han', 'japanese', 'korean'], price: 15, pitch: 'The Chinese court collects these — they call them "sing-songs".' },
	{ id: 'curio-lacquer-box', name: 'Gold-lacquer writing box', glyph: '🍱', from: ['japanese', 'viet'], prized: ['european', 'persian'], price: 10, pitch: 'In Amsterdam they call any lacquer "japanning" and pay through the nose.' },
	{ id: 'curio-buddha', name: 'Small bronze Buddha', glyph: '🛕', from: ['siamese'], prized: ['han', 'japanese', 'tibetan'], price: 9, pitch: 'Monasteries in the north will give you anything for an image like this.' },
	{ id: 'curio-hokusai', name: 'Your portrait by Hokusai', glyph: '🖌️', from: ['japanese'], prized: ['european', 'han'], price: 16, pitch: 'Signed by the old man himself. In Paris they will lose their minds.' },
	{ id: 'curio-ambergris', name: 'Lump of ambergris', glyph: '🪨', from: ['pacific', 'swahili'], prized: ['european', 'ottoman', 'persian', 'han', 'indian'], price: 22, pitch: 'Perfumers from Venice to Peking pay its weight in gold.' },
	{ id: 'curio-feather-cloak', name: 'Feather cloak (ʻahu ʻula)', glyph: '🪶', from: ['pacific'], prized: ['european'], price: 12, pitch: 'Sea captains carry these home to their kings.' }
];
export const CURIO: Record<string, Curio> = Object.fromEntries(CURIOS.map((c) => [c.id, c]));

export interface Riddle {
	clue: string;
	answer: string; // city id
	options: string[]; // city ids, including the answer
}

export const RIDDLES: Riddle[] = [
	{ clue: 'Where a husband built a white tomb for his wife, and was later locked in a fort to look at it.', answer: 'agra', options: ['agra', 'delhi', 'lahore', 'surat'] },
	{ clue: 'Half the world, they say — where the Shah’s square has two mosques facing one another.', answer: 'isfahan', options: ['isfahan', 'tabriz', 'herat', 'baghdad'] },
	{ clue: 'A fan-shaped island in a closed country, where only the Dutch may stay.', answer: 'nagasaki', options: ['nagasaki', 'osaka', 'kagoshima', 'edo'] },
	{ clue: 'Whoever holds this strait-city has a hand on the throat of Venice.', answer: 'malacca', options: ['malacca', 'aceh', 'singapore', 'batavia'] },
	{ clue: 'The one door through which all the world may trade with the Middle Kingdom.', answer: 'guangzhou', options: ['guangzhou', 'quanzhou', 'macau', 'ningbo'] },
	{ clue: 'A city on two continents, where the Golden Horn meets the sea.', answer: 'istanbul', options: ['istanbul', 'aleppo', 'cairo', 'venice'] },
	{ clue: 'The Kaaba’s harbour, gate of the pilgrims from every sea.', answer: 'jeddah', options: ['jeddah', 'mocha', 'aden', 'muscat'] },
	{ clue: 'Where the Buddha’s tooth is kept in the mountains of Serendib.', answer: 'kandy', options: ['kandy', 'colombo', 'lhasa', 'pegu'] },
	{ clue: 'Turquoise domes where Timur sleeps under a slab of green jade.', answer: 'samarkand', options: ['samarkand', 'bukhara', 'khiva', 'kashgar'] },
	{ clue: 'Spice island of carved doors, where cloves grow on every hill.', answer: 'zanzibar', options: ['zanzibar', 'mombasa', 'kilwa', 'ternate'] },
	{ clue: 'A thousand painted caves at the edge of the desert, where the Silk Road splits in two.', answer: 'dunhuang', options: ['dunhuang', 'turfan', 'lanzhou', 'xian'] },
	{ clue: 'The old capital of a thousand shrines, where the Emperor waits while the Shogun rules.', answer: 'kyoto', options: ['kyoto', 'nara', 'edo', 'osaka'] }
];
