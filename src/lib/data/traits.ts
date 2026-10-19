import type { Role } from '#lib/game/types';
export type Stat = 'silver' | 'vigor' | 'renown' | 'fortune';
export const STATS: Stat[] = ['silver', 'vigor', 'renown', 'fortune'];
export type Stats = Record<Stat, number>;
export type Fx = Partial<Stats>;

export type Tag =
	| 'sea'
	| 'land'
	| 'river'
	| 'fight'
	| 'talk'
	| 'faith'
	| 'illness'
	| 'food'
	| 'gamble'
	| 'trade'
	| 'romance'
	| 'art'
	| 'official'
	| 'rest'
	| 'foreign'
	| 'crime'
	| 'mercy'
	| 'bribe'
	| 'loyal'
	| 'cruel';

export interface Mult {
	tags: Tag[];
	stat?: Stat;
	gain?: number;
	loss?: number;
}

export interface Perk {
	id: string;
	name: string;
	glyph: string;
	bio: string; // dating-profile style one-liner
	pro: string;
	con?: string;
	start?: Fx;
	mult?: Mult[];
	gamble?: { tags: Tag[]; bonus: number }[];
	weight?: { tags: Tag[]; mult: number }[];
	travelDays?: number;
	unlock?: string; // chronicle unlock id; hint shown while locked
	flaw?: boolean; // a bad trait: harder run, better score, some people like it anyway
	opposite?: string; // cannot be taken together with this trait
	likedBy?: Role[]; // NPCs who warm to you for it
	dislikedBy?: Role[]; // NPCs who hold it against you
}

const FLAWS: Perk[] = [
	{ id: 'tactless', name: 'Tactless', glyph: '鈍', flaw: true, opposite: 'silver-tongue', bio: 'Says what everyone is thinking. Out loud. At funerals.', pro: 'Honest: officials and soldiers trust you a little more', con: 'Renown from talking ×0.6', mult: [{ tags: ['talk'], stat: 'renown', gain: 0.6 }, { tags: ['official'], loss: 0.85 }], likedBy: ['soldier', 'child', 'elder'], dislikedBy: ['noble', 'official', 'merchant'] },
	{ id: 'jinxed', name: 'Jinxed', glyph: '厄', flaw: true, opposite: 'lucky', bio: 'Born during an eclipse. Black cats cross the road to avoid them.', pro: 'Nothing left to lose: fortune losses ×0.7', con: 'Start with -12 fortune; -5% on all gambles', start: { fortune: -12 }, gamble: [{ tags: [], bonus: -0.05 }], mult: [{ tags: [], stat: 'fortune', loss: 0.7 }], likedBy: ['fortune-teller', 'monk'], dislikedBy: ['sailor', 'captain'] },
	{ id: 'coward', name: 'Faint-Hearted', glyph: '怯', flaw: true, opposite: 'swordmaster', bio: 'Brave in theory. Excellent runner in practice.', pro: 'You run early: fights wound less', con: '-15% odds in fights; renown from fights halved', gamble: [{ tags: ['fight'], bonus: -0.15 }], mult: [{ tags: ['fight'], stat: 'vigor', loss: 0.7 }, { tags: ['fight'], stat: 'renown', gain: 0.5 }], likedBy: ['merchant', 'healer'], dislikedBy: ['soldier', 'bandit', 'captain'] },
	{ id: 'impious', name: 'Godless', glyph: '無', flaw: true, opposite: 'pious', bio: 'Has opinions about every religion. All the same opinion.', pro: 'No guilt: crime and gambling pay a little better', con: 'Faith gives half the fortune; priests are cold', mult: [{ tags: ['faith'], stat: 'fortune', gain: 0.5 }, { tags: ['crime', 'gamble'], stat: 'silver', gain: 1.2 }], likedBy: ['bandit', 'scholar'], dislikedBy: ['monk', 'elder'] },
	{ id: 'spendthrift', name: 'Spendthrift', glyph: '奢', flaw: true, opposite: 'frugal', bio: 'Money is for spending. Preferably on everyone.', pro: 'Food, rest & romance restore more', con: 'Silver losses ×1.3', mult: [{ stat: 'silver', tags: [], loss: 1.3 }, { tags: ['food', 'rest', 'romance'], gain: 1.4 }], likedBy: ['innkeeper', 'performer', 'lover', 'merchant'], dislikedBy: ['elder', 'official'] },
	{ id: 'directionless', name: 'Directionless', glyph: '迷', flaw: true, opposite: 'pathfinder', bio: 'Has been lost in every city in Asia. Loved most of them.', pro: '+10 fortune: fate looks after fools', con: 'Journeys 12% longer', start: { fortune: 10 }, travelDays: 1.12, likedBy: ['child', 'spirit'], dislikedBy: ['captain'] },
	{ id: 'brute', name: 'Brute', glyph: '蛮', flaw: true, opposite: 'bookworm', bio: 'Reads people. Mostly by lifting them.', pro: '+12 vigor; +10% in fights', con: '-10 renown; scholars and nobles look down on you', start: { vigor: 12, renown: -10 }, gamble: [{ tags: ['fight'], bonus: 0.1 }, { tags: ['art', 'talk'], bonus: -0.1 }], likedBy: ['soldier', 'bandit', 'sailor'], dislikedBy: ['scholar', 'noble'] },
	{ id: 'meticulous', name: 'Meticulous', glyph: '整', flaw: true, bio: 'Folds their socks into perfect squares. Has a system. Do not touch the system.', pro: 'A neatly packed bag (no gaps, everything aligned) restores vigor and fortune on every journey', con: 'A messy bag frays your nerves: vigor and fortune drain', likedBy: ['scholar', 'official', 'monk'], dislikedBy: ['performer', 'child', 'sailor'] },
	{ id: 'stone-heart', name: 'Stone Heart', glyph: '石', flaw: true, opposite: 'romantic', bio: 'Watched too much go wrong to feel it any more. Still walking.', pro: 'Losses never break your mind', con: 'They pile up as Apathy instead: joy, love, faith and art give you less', likedBy: ['soldier', 'official', 'bandit'], dislikedBy: ['lover', 'child', 'performer'] },
	{ id: 'mercurial', name: 'Mercurial', glyph: '気', flaw: true, bio: 'Weather-vane heart. Today: sunny. Tomorrow: thunderstorms.', pro: 'On a good day, +15% on every gamble', con: 'On a bad day, -10%', likedBy: ['performer', 'lover', 'fortune-teller'], dislikedBy: ['official', 'elder'] }
];

const RAPPORT: Record<string, [Role[], Role[]]> = {
	'silver-tongue': [['merchant', 'noble', 'performer'], ['official']],
	pious: [['monk', 'elder', 'healer'], ['bandit']],
	gambler: [['innkeeper', 'bandit', 'sailor'], ['monk', 'elder']],
	polyglot: [['merchant', 'sailor', 'captain', 'scholar'], []],
	frugal: [['elder'], ['merchant', 'innkeeper']],
	'hot-blooded': [['soldier', 'bandit'], ['official', 'monk']],
	lucky: [['fortune-teller', 'sailor'], []],
	veteran: [['soldier', 'captain'], ['noble']],
	poet: [['scholar', 'performer', 'lover'], ['soldier']],
	romantic: [['lover', 'performer'], ['elder']],
	superstitious: [['fortune-teller', 'monk'], ['scholar']],
	bookworm: [['scholar', 'monk', 'official'], ['bandit']],
	wanted: [['bandit'], ['official', 'soldier']],
	herbalist: [['healer', 'elder'], []],
	swordmaster: [['soldier', 'captain'], ['monk']],
	glutton: [['innkeeper'], []],
	'fox-blooded': [['spirit', 'fortune-teller'], ['monk']],
	'old-salt': [['sailor', 'captain'], []],
	outlaw: [['bandit'], ['official', 'soldier']],
	stargazer: [['fortune-teller', 'sailor', 'scholar'], []]
};

export const TRAITS: Perk[] = [
	{ id: 'silver-tongue', name: 'Silver Tongue', glyph: '舌', bio: 'Could sell sand to a Bedouin. Twice.', pro: 'Renown gains from talking ×1.5', con: 'Officials trust you less', mult: [{ tags: ['talk'], stat: 'renown', gain: 1.5 }, { tags: ['official'], loss: 1.25 }] },
	{ id: 'iron-stomach', name: 'Iron Stomach', glyph: '胃', bio: 'Will eat anything. Has eaten everything.', pro: 'Food & sickness barely hurt you', mult: [{ tags: ['illness', 'food'], stat: 'vigor', loss: 0.35 }] },
	{ id: 'seasick', name: 'Seasick', glyph: '浪', bio: 'Looking for someone who loves long walks. On land.', pro: 'Steady on land: land travel hurts less', con: 'Sea voyages drain vigor ×1.6', mult: [{ tags: ['sea'], stat: 'vigor', loss: 1.6 }, { tags: ['land'], stat: 'vigor', loss: 0.7 }] },
	{ id: 'pious', name: 'Pious', glyph: '祈', bio: 'Prays at every shrine. Every. Single. One.', pro: 'Fortune from faith ×1.6', con: 'Gambling feels sinful', mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.6 }, { tags: ['gamble'], stat: 'fortune', loss: 1.5 }] },
	{ id: 'gambler', name: 'Born Gambler', glyph: '賭', bio: 'Swipe right and let’s roll some dice.', pro: '+15% odds on every gamble', con: 'Gambling dens find you more often', gamble: [{ tags: ['gamble'], bonus: 0.15 }], weight: [{ tags: ['gamble'], mult: 2.2 }] },
	{ id: 'polyglot', name: 'Polyglot', glyph: '語', bio: 'Flirts in eleven languages.', pro: 'Foreigners & officials go easier on you', mult: [{ tags: ['foreign'], gain: 1.3, loss: 0.7 }, { tags: ['official'], loss: 0.7 }], gamble: [{ tags: ['talk'], bonus: 0.1 }] },
	{ id: 'frugal', name: 'Frugal', glyph: '倹', bio: 'Will split the bill to the last copper cash.', pro: 'Silver losses ×0.75', con: 'Less fun at festivals', mult: [{ stat: 'silver', tags: [], loss: 0.75 }, { tags: ['rest', 'food'], stat: 'fortune', gain: 0.7 }] },
	{ id: 'hot-blooded', name: 'Hot-Blooded', glyph: '火', bio: 'Will duel your ex. Probably already has.', pro: 'Renown from fights ×1.6', con: 'Fights wound deeper', mult: [{ tags: ['fight'], stat: 'renown', gain: 1.6 }, { tags: ['fight'], stat: 'vigor', loss: 1.3 }], weight: [{ tags: ['fight'], mult: 1.5 }] },
	{ id: 'lucky', name: 'Auspicious Birth', glyph: '福', bio: 'Born on the 8th day of the 8th month. Obviously.', pro: 'Start with high fortune; +5% all gambles', start: { fortune: 15 }, gamble: [{ tags: [], bonus: 0.05 }] },
	{ id: 'veteran', name: 'Scarred Veteran', glyph: '傷', bio: 'Has stories. Has scars matching the stories.', pro: '+10 vigor; +15% in fights', con: 'Respectable folk eye you warily', start: { vigor: 10, renown: -6 }, gamble: [{ tags: ['fight'], bonus: 0.15 }] },
	{ id: 'poet', name: 'Wandering Poet', glyph: '詩', bio: 'Will write a haiku about you. Possibly unflattering.', pro: 'Art gives more renown; poets seek you', mult: [{ tags: ['art'], stat: 'renown', gain: 1.5 }], weight: [{ tags: ['art'], mult: 2 }] },
	{ id: 'pathfinder', name: 'Pathfinder', glyph: '道', bio: 'Never lost. Occasionally “taking the scenic route.”', pro: 'All journeys 15% shorter', travelDays: 0.85 },
	{ id: 'romantic', name: 'Hopeless Romantic', glyph: '恋', bio: 'Has a lover in every port. Looking for one more.', pro: 'Romance restores more vigor & fortune', con: 'Romance finds you constantly (and costs days)', mult: [{ tags: ['romance'], gain: 1.5 }], weight: [{ tags: ['romance'], mult: 3 }] },
	{ id: 'superstitious', name: 'Superstitious', glyph: '怪', bio: 'Will not date you if you whistle at night.', pro: 'Omens give fortune ×1.5', con: 'Bad omens hit ×1.5 too', mult: [{ stat: 'fortune', tags: [], gain: 1.5, loss: 1.5 }] },
	{ id: 'bookworm', name: 'Bookworm', glyph: '書', bio: 'First date: the library. Second date: also the library.', pro: '+12 renown; scholars favor you', con: '-10 vigor', start: { renown: 12, vigor: -10 }, gamble: [{ tags: ['art', 'talk'], bonus: 0.1 }] },
	{ id: 'wanted', name: 'Price on Your Head', glyph: '賞', bio: 'Mysterious past. Very mysterious. Please stop asking.', pro: '+18 silver (stolen, probably)', con: '-10 renown; officials are harsher', start: { silver: 18, renown: -10 }, mult: [{ tags: ['official'], loss: 1.4 }], weight: [{ tags: ['crime'], mult: 2 }] },
	{ id: 'herbalist', name: 'Herbalist', glyph: '薬', bio: 'Carries ginseng, ginger and opinions about your diet.', pro: 'Healing ×1.6; sickness hurts less', mult: [{ tags: ['illness'], stat: 'vigor', gain: 1.6, loss: 0.7 }, { tags: ['rest'], stat: 'vigor', gain: 1.3 }] },
	{ id: 'swordmaster', name: 'Swordmaster', glyph: '剣', bio: 'Two swords, one heart. Ask about my school.', pro: '+25% odds in fights', con: 'Challengers seek you out', gamble: [{ tags: ['fight'], bonus: 0.25 }], weight: [{ tags: ['fight'], mult: 1.8 }] },
	{ id: 'glutton', name: 'Gourmand', glyph: '食', bio: 'Will travel 3,000 li for good noodles.', pro: 'Food restores more vigor', con: 'Inns & feasts cost more silver', mult: [{ tags: ['food'], stat: 'vigor', gain: 1.6 }, { tags: ['food', 'rest'], stat: 'silver', loss: 1.4 }] },
	{ id: 'fox-blooded', name: 'Fox-Blooded', glyph: '狐', unlock: 'Meet the Kitsune', bio: 'Grandmother was\u2026 unusual. Ears twitch at lies.', pro: '+12% on all gambles', con: 'Priests are wary of you', gamble: [{ tags: [], bonus: 0.12 }], mult: [{ tags: ['faith'], stat: 'fortune', gain: 0.6 }] },
	{ id: 'old-salt', name: 'Old Salt', glyph: '錨', unlock: 'Visit 25 different cities across all journeys', bio: 'Has kissed the deck of every ship from Lisbon to Nagasaki.', pro: 'Sea voyages 20% shorter, never seasick', travelDays: 0.9, mult: [{ tags: ['sea'], stat: 'vigor', loss: 0.4 }] },
	{ id: 'survivor', name: 'Many Lives', glyph: '命', unlock: 'Die 5 times', bio: 'Death keeps swiping left.', pro: 'Start with a medicine chest and +10 vigor', start: { vigor: 10 } },
	{ id: 'chronicler', name: 'Chronicler', glyph: '史', unlock: 'Fulfil a commission', bio: 'Already writing the memoir. You might be in it.', pro: 'Renown gains ×1.3', mult: [{ tags: [], stat: 'renown', gain: 1.3 }] },
	{ id: 'outlaw', name: 'Outlaw', glyph: '賊', unlock: 'End a journey in chains', bio: 'Wanted in four kingdoms. Charming in all of them.', pro: 'Crime pays ×1.5; heat cools faster', con: 'Officials loathe you', mult: [{ tags: ['crime'], stat: 'silver', gain: 1.5 }, { tags: ['official'], loss: 1.3 }], gamble: [{ tags: ['crime'], bonus: 0.15 }] },
	{ id: 'stargazer', name: 'Stargazer', glyph: '星', bio: 'Reads your future in the stars. It says “swipe right.”', pro: 'Sea voyages 10% shorter; omens favor you', travelDays: 0.92, gamble: [{ tags: ['sea'], bonus: 0.1 }] },
	{ id: 'battle-hardened', name: 'Battle-Hardened', glyph: '剛', bio: 'Has parried cold iron in fifteen skirmishes.', pro: '+15% in fights; wounds hurt less', mult: [{ tags: ['fight'], stat: 'vigor', loss: 0.75 }], gamble: [{ tags: ['fight'], bonus: 0.15 }] },
	{ id: 'haggler', name: 'Master Haggler', glyph: '買', bio: 'Knows the exact weight of a counterfeit silver tael.', pro: 'Market goods cost less; trade silver ×1.25', mult: [{ tags: ['trade'], stat: 'silver', gain: 1.25 }] },
	{ id: 'cautious', name: 'Watchful Eye', glyph: '看', bio: 'Never sleeps with their back to the door.', pro: 'Fewer ambushes; travel hazards wound less', mult: [{ tags: ['crime'], stat: 'vigor', loss: 0.7 }] },
	{ id: 'reckless', name: 'Daredevil', glyph: '狂', bio: 'Jumps before looking. Frequently survives.', pro: '+15% on high-stakes gambles', con: 'Silver losses ×1.2', mult: [{ stat: 'silver', tags: [], loss: 1.2 }], gamble: [{ tags: ['gamble'], bonus: 0.15 }] },
	{ id: 'ascetic', name: 'Ascetic', glyph: '枯', bio: 'Feeds on mountain air and river water.', pro: 'Rest and faith give +30% vigor and fortune', mult: [{ tags: ['faith', 'rest'], stat: 'vigor', gain: 1.3 }, { tags: ['faith'], stat: 'fortune', gain: 1.3 }] },
	...FLAWS
];

export const FACTIONS: Record<import('#lib/game/types').FactionId, { label: string; glyph: string; desc: string }> = {
	outlaw: { label: 'Underworld & Greenwood', glyph: '🗡️', desc: 'Bandits, smugglers, river pirates, and secret brotherhoods.' },
	faith: { label: 'Temples & Holy Orders', glyph: '📿', desc: 'Monasteries, hermitages, mosques, and wandering ascetics.' },
	crown: { label: 'Imperial Crown & Magistrates', glyph: '👑', desc: 'Royal governors, town constables, port surveyors, and judges.' },
	mercenary: { label: 'Caravan Blades & Sellswords', glyph: '⚔️', desc: 'Caravan guards, martial brotherhoods, ronin, and mercenaries.' },
	guild: { label: 'Merchant Guilds & Cartels', glyph: '⚖️', desc: 'Bazaar guilds, silk factors, maritime syndicates, and money-changers.' }
};

export interface StatusCondition {
	id: string;
	name: string;
	glyph: string;
	type: 'ailment' | 'boon';
	desc: string;
	pro?: string;
	con?: string;
}

export const STATUSES: Record<string, StatusCondition> = {
	'one-eyed': { id: 'one-eyed', name: 'One-Eyed', glyph: '👁️', type: 'ailment', desc: 'Lost an eye to an arrow or cutlass duel.', pro: 'Terrifying gaze (+renown in fights)', con: 'Vulnerable in surprise ambushes' },
	'limp': { id: 'limp', name: 'Road Limp', glyph: '🦯', type: 'ailment', desc: 'A fractured leg or bad caravan spill that never quite set straight.', pro: 'Elders and monks take pity (+fortune from alms)', con: 'Land travel takes slightly longer' },
	'miasma-lung': { id: 'miasma-lung', name: 'Miasma Lung', glyph: '🫁', type: 'ailment', desc: 'Deep fever phlegm contracted in tropical swamps or plague alleys.', pro: 'Immune to mild pestilence', con: 'Weather delays sap vigor' },
	'battle-scarred': { id: 'battle-scarred', name: 'Battle-Scarred', glyph: '⚡', type: 'ailment', desc: 'Crossed blade cuts along cheek and arms.', pro: 'Outlaws and sellswords respect you instantly', con: 'High officials view you with suspicion' },
	'enlightened': { id: 'enlightened', name: 'Enlightened', glyph: '☸️', type: 'boon', desc: 'Awakened mind achieved through deep fasting, mountain solitude, or divine grace.', pro: 'Immune to despair; reveals mystic truths in dialogue' },
	'master-courier': { id: 'master-courier', name: 'Master Courier', glyph: '🐎', type: 'boon', desc: 'Proven swift and unfailing across the four seas.', pro: 'Caravans and ferries grant priority passage; commissions pay higher' },
	'blessed-hands': { id: 'blessed-hands', name: 'Blessed Hands', glyph: '🤲', type: 'boon', desc: 'Saved scores of dying folk in field hospitals or burning towns.', pro: 'Herbal tonics and healing rest are doubly restorative' },
	'oath-keeper': { id: 'oath-keeper', name: 'Oath-Keeper', glyph: '📜', type: 'boon', desc: 'Never broke a signed contract or betrayed a fellow traveler.', pro: 'All guilds extend credit; contracts pay extra silver' }
};

for (const t of TRAITS) {
	const r = RAPPORT[t.id];
	if (r) [t.likedBy, t.dislikedBy] = r;
	if (t.opposite) {
		const o = TRAITS.find((x) => x.id === t.opposite);
		if (o) o.opposite = t.id;
	}
}

export const PROFESSIONS: Perk[] = [
	{ id: 'merchant', name: 'Merchant', glyph: '商', bio: 'Buys low, sells high, sleeps lightly.', pro: '+15 silver; trade pays ×1.3', start: { silver: 15, renown: -5 }, mult: [{ tags: ['trade'], stat: 'silver', gain: 1.3 }], weight: [{ tags: ['trade'], mult: 1.6 }] },
	{ id: 'scholar', name: 'Scholar-Official', glyph: '士', bio: 'Passed the imperial exams. Will mention it.', pro: '+12 renown; officials respect you; +8% on talk & official gambles', start: { renown: 12, silver: 4, vigor: -4 }, mult: [{ tags: ['official'], loss: 0.55 }, { tags: ['rest'], stat: 'vigor', gain: 1.2 }], gamble: [{ tags: ['talk', 'official'], bonus: 0.08 }] },
	{ id: 'ronin', name: 'Masterless Blade', glyph: '侍', bio: 'Sword for hire. Honor not for sale.', pro: '+12 vigor; +15% in fights', start: { vigor: 12, silver: -8 }, gamble: [{ tags: ['fight'], bonus: 0.15 }] },
	{ id: 'physician', name: 'Physician', glyph: '医', bio: 'Will check your pulse on the first date.', pro: 'Healing ×1.5; earn silver tending the sick', start: { fortune: 5 }, mult: [{ tags: ['illness', 'rest'], stat: 'vigor', gain: 1.5, loss: 0.7 }] },
	{ id: 'pilgrim', name: 'Pilgrim Monk', glyph: '僧', bio: 'Owns one bowl. Seeks enlightenment and a plus-one.', pro: '+15 fortune; faith ×1.4', con: '-12 silver', start: { fortune: 15, silver: -12 }, mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.4 }] },
	{ id: 'cartographer', name: 'Cartographer', glyph: '図', bio: 'Will map the way to your heart. To scale.', pro: 'Journeys 12% shorter', travelDays: 0.88 },
	{ id: 'performer', name: 'Wandering Performer', glyph: '芸', bio: 'Sings, juggles, breaks hearts. Not in that order.', pro: '+8 renown; art, talk & festivals pay off', start: { renown: 8, vigor: 4, fortune: 4 }, mult: [{ tags: ['art', 'rest'], gain: 1.35 }], gamble: [{ tags: ['art', 'talk'], bonus: 0.08 }], weight: [{ tags: ['art'], mult: 1.5 }] },
	{ id: 'smuggler', name: 'Smuggler', glyph: '密', bio: 'No questions asked. No answers given.', pro: '+14 silver; crime & sea runs succeed more; knows the back roads', con: '-6 renown', start: { silver: 14, vigor: 4, renown: -6 }, mult: [{ tags: ['crime'], stat: 'silver', gain: 1.35 }, { tags: ['crime', 'official'], stat: 'vigor', loss: 0.8 }], gamble: [{ tags: ['crime', 'sea'], bonus: 0.1 }], travelDays: 0.95, weight: [{ tags: ['crime'], mult: 1.4 }] },
	{ id: 'pirate', name: 'Sea Rover', glyph: '海', unlock: 'Meet a pirate legend', bio: 'Technically a privateer. Technically.', pro: '+15 silver; +20% at sea and in sea fights', con: '-10 renown', start: { silver: 15, renown: -10 }, gamble: [{ tags: ['sea'], bonus: 0.2 }], travelDays: 0.95 },
	{ id: 'explorer', name: 'Explorer', glyph: '探', unlock: 'Visit 40 different cities across all journeys', bio: 'Collects horizons.', pro: 'All journeys 18% shorter; new cities give renown', travelDays: 0.82 },
	{ id: 'envoy', name: 'Royal Envoy', glyph: '使', bio: 'Diplomatic immunity. Diplomatic smile.', pro: '+10 renown; officials wave you through', start: { renown: 10 }, mult: [{ tags: ['official'], loss: 0.5 }], gamble: [{ tags: ['official', 'talk'], bonus: 0.15 }] },
	{ id: 'thief', name: 'Thief', glyph: '盗', bio: 'Your purse was heavy. Was.', pro: '+12 silver; crime pays and succeeds more', con: 'Constables know the type', start: { silver: 12, renown: -6 }, mult: [{ tags: ['crime'], stat: 'silver', gain: 1.3 }, { tags: ['official'], loss: 1.15 }], gamble: [{ tags: ['crime'], bonus: 0.1 }] },
	{ id: 'painter', name: 'Painter', glyph: '絵', bio: 'Will paint your portrait. Will improve your nose.', pro: 'Art pays in renown and silver', start: { renown: 6, silver: -4 }, mult: [{ tags: ['art'], gain: 1.35 }] },
	{ id: 'writer', name: 'Writer', glyph: '筆', bio: 'Everything you say may be used in chapter nine.', pro: 'Tales earn more; journal-keeping restores the mind', start: { renown: 8, vigor: -4 }, mult: [{ tags: ['art', 'talk'], stat: 'renown', gain: 1.25 }] },
	{ id: 'bard', name: 'Bard', glyph: '唄', bio: 'Knows a song for every occasion, and several for none.', pro: 'Inns, festivals and crowds love you', start: { renown: 6, fortune: 4 }, mult: [{ tags: ['art', 'food', 'romance'], gain: 1.2 }], weight: [{ tags: ['art'], mult: 1.4 }] },
	{ id: 'playwright', name: 'Playwright', glyph: '劇', bio: 'Your life is act two. Act three will be better.', pro: 'Talk & art odds +10%; courts enjoy you', start: { renown: 8, silver: -6 }, gamble: [{ tags: ['talk', 'art'], bonus: 0.1 }] },
	{ id: 'actor', name: 'Actor', glyph: '優', bio: 'Has played a king, a ghost and a horse. Best reviews: the horse.', pro: 'Disguise and deception come naturally', start: { renown: 4 }, gamble: [{ tags: ['crime', 'talk'], bonus: 0.08 }], mult: [{ tags: ['art'], stat: 'renown', gain: 1.25 }] },
	{ id: 'dancer', name: 'Dancer', glyph: '舞', bio: 'Light on your feet; heavy on your heart.', pro: 'Festivals and romance pay; nimble feet dodge trouble and tire less', start: { vigor: 10, renown: 4, fortune: 4 }, mult: [{ tags: ['romance', 'art', 'rest'], gain: 1.3 }, { tags: ['land', 'fight'], stat: 'vigor', loss: 0.8 }], gamble: [{ tags: ['art', 'fight'], bonus: 0.08 }], travelDays: 0.95 },
	{ id: 'prospector', name: 'Prospector', glyph: '鉱', bio: 'Has found gold twice. Has lost it three times.', pro: 'Ruins, mountains and treasure are kinder to you', start: { vigor: 6, silver: 6, renown: -4 }, gamble: [{ tags: ['land', 'gamble'], bonus: 0.08 }] },
	{ id: 'trader', name: 'Caravan Trader', glyph: '隊', bio: 'Owns three camels and a grudge against one of them.', pro: 'Overland trade pays; land travel 8% shorter', start: { silver: 10 }, mult: [{ tags: ['trade'], stat: 'silver', gain: 1.2 }], travelDays: 0.94 },
	{ id: 'priest', name: 'Priest / Missionary', glyph: '牧', bio: 'Saving souls, one stubborn traveller at a time.', pro: 'Faith pays; the sick and poor trust you', con: 'Other faiths can be hostile', start: { fortune: 10, silver: -8 }, mult: [{ tags: ['faith', 'mercy'], gain: 1.35 }] },
	{ id: 'treasure-hunter', name: 'Treasure Hunter', glyph: '宝', bio: 'X marks the spot. Usually wrong spot.', pro: 'Riddle maps, ruins and secrets favour you', start: { fortune: 6, silver: -4 }, gamble: [{ tags: ['gamble', 'art'], bonus: 0.08 }] },
	{ id: 'adventurer', name: 'Adventurer', glyph: '遊', bio: 'In it for the view. And the danger. Mostly the danger.', pro: 'Gambles +6%; new places restore vigor', start: { vigor: 6, fortune: 6, silver: -6 }, gamble: [{ tags: [], bonus: 0.06 }] },
	{ id: 'mercenary', name: 'Mercenary', glyph: '傭', bio: 'Loyal to whoever paid last. Very loyal.', pro: 'Fights pay silver; +15% in fights', start: { vigor: 10, renown: -4 }, gamble: [{ tags: ['fight'], bonus: 0.15 }], mult: [{ tags: ['fight'], stat: 'silver', gain: 1.4 }] },
	{ id: 'troupe', name: 'Troupe Leader', glyph: '団', bio: 'Six performers, two carts, one tiger (retired).', pro: 'Performances pay big; crowds come to you', con: 'More mouths to feed', start: { renown: 10, silver: -10 }, mult: [{ tags: ['art', 'food'], gain: 1.3 }], weight: [{ tags: ['art'], mult: 1.5 }] },
	{ id: 'medium', name: 'Spirit Medium', glyph: '霊', bio: 'The dead talk to you. They have opinions.', pro: 'See the dead more often; spirits are kind', con: 'The living find you unsettling', start: { fortune: 8, renown: -4 }, weight: [{ tags: ['faith'], mult: 1.8 }], mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.4 }] },
	{ id: 'tinkerer', name: 'Tinkerer', glyph: '械', bio: 'Will fix your clock. Will add three new features you did not ask for.', pro: 'Inventions, machines and repairs pay off', start: { silver: 4, renown: 4 }, mult: [{ tags: ['trade', 'art'], stat: 'silver', gain: 1.2 }] },
	{ id: 'cook', name: 'Wandering Cook', glyph: '庖', bio: 'Will feed you. Will judge you while you eat.', pro: 'Food restores far more; inns pay you', start: { vigor: 8 }, mult: [{ tags: ['food', 'rest'], stat: 'vigor', gain: 1.5 }] }
];

export const PERK: Record<string, Perk> = Object.fromEntries([...TRAITS, ...PROFESSIONS].map((p) => [p.id, p]));

export const STAT_INFO: Record<Stat, { label: string; glyph: string; low: string; high: string }> = {
	silver: { label: 'Silver', glyph: '銀', low: 'penniless', high: 'too rich to be safe' },
	vigor: { label: 'Vigor', glyph: '気', low: 'collapsing', high: 'reckless' },
	renown: { label: 'Renown', glyph: '名', low: 'disgraced', high: 'dangerously famous' },
	fortune: { label: 'Fortune', glyph: '運', low: 'cursed', high: 'worshipped' }
};
