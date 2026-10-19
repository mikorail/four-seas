import type { CultureId, Gender } from '#lib/data/cultures';
import type { Fx, Stats, Tag } from '#lib/data/traits';
import type { Route } from '#lib/data/world';

export type Role =
	| 'merchant'
	| 'official'
	| 'monk'
	| 'bandit'
	| 'sailor'
	| 'captain'
	| 'noble'
	| 'scholar'
	| 'healer'
	| 'performer'
	| 'child'
	| 'elder'
	| 'soldier'
	| 'ghost'
	| 'tiger'
	| 'fortune-teller'
	| 'lover'
	| 'innkeeper'
	| 'hero'
	| 'spirit';

export interface Npc {
	name: string;
	title: string;
	culture: CultureId;
	gender: Gender;
	role: Role;
	seed: number;
}

export type FactionId = 'outlaw' | 'faith' | 'crown' | 'mercenary' | 'guild';

export interface Outcome {
	fx: Fx;
	text?: string;
	days?: number;
	heat?: number;
	setFlag?: Record<string, string | number | boolean>;
	mount?: MountKind | 'none';
	itemAdd?: string[];
	itemRemove?: string[];
	quest?: Quest;
	remember?: { kind: 'favor' | 'grudge'; deed: string };
	standing?: number;
	faction?: Partial<Record<FactionId, number>>;
	traitAdd?: string[];
	traitRemove?: string[];
	statusAdd?: string[];
	statusRemove?: string[];
	rivalDelay?: number;
	romance?: RomanceStep;
	bump?: Record<string, number>;
	loyalty?: number;
	mountHurt?: number;
	sponsorInvention?: string;
	person?: PersonStep;
}

export interface PersonStep {
	profile: Person;
	bond?: number;
	stage?: Person['stage'];
}

export type CrewRole = 'bodyguard' | 'navigator' | 'guide' | 'interpreter' | 'healer' | 'thief' | 'cook' | 'companion' | 'heir' | 'ward';

export type CompanionTask = 'idle' | 'provision' | 'intel' | 'scout' | 'guard';

export interface Companion {
	id: string;
	npc: Npc;
	role: CrewRole;
	wage: number; // silver per journey
	loyalty: number; // 0..100
	joinedDay: number;
	traits?: string[]; // distinct personal skills and traits
	task?: CompanionTask; // active assigned city task
}

export type MountKind = 'donkey' | 'mule' | 'horse' | 'camel' | 'elephant' | 'yak';

export interface Mount {
	kind: MountKind;
	name: string;
	health: number; // 0..100
}

export interface Choice {
	label: string;
	fx: Fx;
	tags?: Tag[];
	text?: string;
	days?: number;
	gamble?: { p: number; win: Outcome; lose: Outcome };
	itemAdd?: string[];
	itemRemove?: string[];
	setFlag?: Record<string, string | number | boolean>;
	clearFlag?: string[];
	next?: Card;
	heat?: number;
	mount?: MountKind | 'none';
	mountHurt?: number;
	bag?: string; // switch luggage kind
	crewAdd?: Companion;
	crewRemove?: string; // companion id or role
	loyalty?: number; // delta to all crew
	legend?: string; // record a legend met
	rivalDelay?: number;
	why?: string; // for hidden option: what unlocked it
	quest?: Quest;
	pilgrimage?: string; // city id
	convert?: string; // new faith id
	karma?: number; // explicit merit change (on top of tag-derived)
	remember?: { kind: 'favor' | 'grudge'; deed: string } | false; // false = never create a tie
	tieResolve?: string; // tie id paid back by this choice
	standing?: number; // explicit standing change with the local culture
	faction?: Partial<Record<FactionId, number>>;
	traitAdd?: string[];
	traitRemove?: string[];
	statusAdd?: string[];
	statusRemove?: string[];
	venture?: VentureKind; // acquire a ship / caravan based here
	treasury?: number; // taels in/out of the treasury
	retire?: 'prince' | 'retired' | 'settled';
	settle?: boolean;
	bump?: Record<string, number>; // add to numeric flags
	outfit?: string | 'none'; // put on an outfit (id from OUTFITS)
	romance?: RomanceStep;
	energy?: number; // actions left in town
	thought?: string; // discover a Thought Cabinet thought
	sponsorInvention?: string; // id of invention project to sponsor
	person?: PersonStep; // get to know someone (people at venues)
}

/** What a choice does to your love life. */
export interface RomanceStep {
	start?: boolean; // the card's npc becomes your sweetheart
	affection?: number;
	status?: Romance['status'];
}

export interface Romance {
	npc: Npc;
	city: string; // where they live
	affection: number; // 0..100
	status: 'courting' | 'betrothed' | 'married' | 'parted';
	since: number; // day
	letters: number;
}

export interface Card {
	id: string;
	npc: Npc;
	text: string;
	left: Choice;
	right: Choice;
	up?: Choice; // hidden third option (trait / item / crew)
	badge?: string; // e.g. "Local Legend", "Story", "Claude"
	scene?: string; // city scene culture/style override
}

export interface Hero {
	name: string;
	gender: Gender;
	culture: CultureId;
	profession: string;
	traits: string[];
	age: number;
	seed: number;
	home: string;
	motto: string;
	faith: string;
	ideal: string;
	voices?: Record<import('#lib/data/voices').VoiceId, number>; // inner voices, 1..6
	goal?: string; // chosen life goal id
}

export interface LogEntry {
	day: number;
	place: string;
	text: string;
	who?: string; // "Name, title"
	scene?: string;
	situation?: string;
	choice?: string;
	outcome?: string;
	fx?: Fx; // what it actually did to your stats
}

export type VentureKind = 'junk' | 'dhow' | 'indiaman' | 'steamer' | 'caravan';

export interface Venture {
	id: string;
	kind: VentureKind;
	name: string;
	home: string; // city id it trades from
	state: 'idle' | 'away';
	dest?: string;
	back?: number; // day it returns
	stake?: number; // taels invested in this run
	condition: number; // 0..100
}

export interface Ancestor {
	name: string;
	culture: string;
	gender: string;
	seed: number;
	years: string; // e.g. "1620–1647"
	ending: string;
	relation: string; // how the next one is related
}

export type EndingKind =
	| 'silver-low'
	| 'silver-high'
	| 'vigor-low'
	| 'vigor-high'
	| 'renown-low'
	| 'renown-high'
	| 'fortune-low'
	| 'fortune-high'
	| 'late'
	| 'victory'
	| 'second'
	| 'jailed'
	| 'prince'
	| 'retired'
	| 'settled'
	| 'mind-low';

export interface Ending {
	kind: EndingKind;
	title: string;
	text: string;
	won: boolean;
}

export interface Quest {
	id: string;
	kind: 'contract' | 'map' | 'relic' | 'cure' | 'bride' | 'message' | 'bounty' | 'treasure';
	title: string;
	giver: string;
	from: string;
	to: string;
	item?: string; // carried item that must still be in the bag
	needs?: string; // item to bring (consumed on completion), not a failure if missing
	visit?: string[]; // cities still to visit (survey quests complete anywhere when empty)
	ward?: string; // crew id escorted; removed on completion or failure
	due: number; // day
	reward: Fx;
	rewardItem?: string;
	text: string;
}

/** Someone who will remember what you did. */
export interface Tie {
	id: string;
	npc: Npc;
	kind: 'favor' | 'grudge';
	deed: string; // what happened, in a few words ("paid a stowaway's passage")
	city: string;
	day: number;
	resolved?: boolean;
}

export interface Rival {
	npc: Npc;
	arrive: number; // day they will reach the destination
	path: string[]; // city ids
	start: number;
	arrived: boolean;
}

export interface Run {
	version: 2;
	seed: string;
	rng: number;
	year: number;
	month0: number;
	daily: boolean;
	difficulty: string;
	hardship: string;
	scoreMult: number;
	quests: Quest[];
	pilgrimages: string[];
	karma: number; // -100..100
	ties: Tie[];
	standing: Record<string, number>; // culture id → -100..100
	factions?: Record<FactionId, number>; // faction id → -100..100
	statuses?: string[]; // permanent conditions, battle wounds, or spiritual achievements
	ventures: Venture[];
	treasury: number; // taels banked with factors (not the Silver stat)
	lineage: Ancestor[];
	generation: number;
	world: import('./events').WorldEvent[];
	hero: Hero;
	stats: Stats;
	day: number;
	deadline: number;
	location: string;
	destination: string;
	item: string;
	patron: string;
	phase: 'map' | 'travel' | 'city' | 'end';
	route: Route | null;
	deck: Card[];
	deckTotal: number;
	bag: string[]; // item ids
	bagKind: string;
	mount: Mount | null;
	crew: Companion[];
	heat: number;
	rival: Rival | null;
	flags: Record<string, string | number | boolean>;
	visited: string[];
	path: { from: string; to: string; mode: string }[];
	log: LogEntry[];
	recent: string[];
	legends: string[];
	cardsSeen: number;
	ending: Ending | null;
	delivered: boolean;
	outfit?: { id: string; culture: import('#lib/data/cultures').CultureId };
	romance?: Romance | null;
	energy?: number; // things you can still do in this city (venues)
	grid?: import('./bag').Placed[]; // where each bag item sits in the tile luggage
	extraBags?: string[]; // strapped-on pouches, baskets, saddlebags
	cabinet?: { found: string[]; slots: { id: string; left: number }[]; done: string[] };
	skills?: Partial<Record<import('#lib/data/skills').SkillId, number>>; // life skills: xp per skill
	goal?: { id: string; done?: number }; // life goal (see data/goals.ts); done = day achieved
	letters?: Letter[]; // letters in flight and received
	home?: { city: string; since: number; stash: string[]; garden: number } | null;
	titles?: string[]; // reputation titles earned
	collected?: Record<string, string[]>; // collection id → items ticked
	priceMemory?: Record<string, { day: number; price: number }>; // `${city}:${good}` → last seen sell price
	restorePoints?: string[]; // serialized snapshots of the last city arrivals
	undo?: string | null; // snapshot before the last swipe (one per city)
	warehouse?: Record<string, string[]>; // city → goods stored there
	graves?: Grave[]; // past travellers' resting places, copied from the Chronicle at the start
	xp?: Partial<Record<'silver' | 'vigor' | 'renown' | 'fortune' | 'mind', number>>; // experience: how much each stat has moved
	schema?: number; // save format version (see SCHEMA / MIGRATIONS in engine.ts)
	people?: Person[]; // everyone you have swiped right on: friends, sweethearts, rivals
	langs?: Record<string, number>; // language → days of exposure
	repertoire?: Tale[]; // stories you can tell
	inventions?: ActiveInvention[];
	completedInventions?: string[];
	mind?: number; // 0..100 — composure; losses wear it down
	apathy?: number; // 0..100 — what a Stone Heart feels instead of despair
	trend?: [number, number, number, number, number][]; // [day, silver, vigor, renown, fortune] after each step
}

export interface ActiveInvention {
	id: string;
	scholarName: string;
	city: string;
	daysLeft: number;
}


/** Someone you met at a venue and chose to get to know. */
export interface Person {
	id: string;
	npc: Npc;
	city: string;
	venue: string;
	traits: string[]; // their own traits (ids from TRAITS)
	likes: string[]; // tags they love
	dislikes: string[];
	bio: string;
	bond: number; // -100..100
	stage: 'acquaintance' | 'friend' | 'confidant' | 'sweetheart' | 'rival';
	met: number; // day
	last: number; // day of the last hangout
}

/** A story from your journey that you can tell for silver and renown. */
export interface Tale {
	id: string;
	title: string;
	genre: 'adventure' | 'romance' | 'ghost' | 'war' | 'comedy' | 'wonder';
	day: number;
	place: string;
	told: number;
}

/** A past traveller's resting place (from the Chronicle), visitable in later journeys. */
export interface Grave {
	id: string;
	name: string;
	culture: import('#lib/data/cultures').CultureId;
	gender: import('#lib/data/cultures').Gender;
	seed: number;
	city: string;
	year: number;
	title: string; // how it ended
	kind: EndingKind;
	lesson: string; // what killed them, as advice
	relic?: string; // something they carried that might still be there
	commission?: { item: string; to: string }; // unfinished business
	settled?: boolean; // a shrine where they chose to stay, not a grave
}

export interface Letter {
	id: string;
	to: string; // person name
	toId?: string; // Person id
	city: string; // where they live
	kind: 'friend' | 'sweetheart' | 'patron' | 'family' | 'reply';
	sent: number; // day
	arrives: number; // day the reply can reach you
	text: string;
	read?: boolean;
	gift?: string;
}
