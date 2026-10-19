// Life skills: what your hands, body and spirit have learned. They grow by doing — every choice that uses one trains it.
import type { Perk, Tag } from './traits';

export type SkillId =
	| 'art'
	| 'thievery'
	| 'athletics'
	| 'martial'
	| 'strength'
	| 'knowledge'
	| 'luck'
	| 'cooking'
	| 'crafting'
	| 'machinery'
	| 'puzzles'
	| 'creativity'
	| 'medicine'
	| 'spirit'
	| 'mystic'
	| 'aura'
	| 'composure';

export interface Skill {
	id: SkillId;
	name: string;
	glyph: string;
	desc: string;
	trains: Tag[]; // choice tags that practise it
	perk: (lvl: number) => Pick<Perk, 'mult' | 'gamble' | 'weight' | 'travelDays'>;
	mastery: string; // what level 6+ means
}

const g = (tags: Tag[], lvl: number, per = 0.015) => [{ tags, bonus: lvl * per }];

export const SKILLS: Skill[] = [
	{ id: 'art', name: 'Art', glyph: '画', desc: 'Painting, poetry, music, the stage.', trains: ['art'], perk: (l) => ({ gamble: g(['art'], l), mult: [{ tags: ['art'], stat: 'renown', gain: 1 + l * 0.04 }] }), mastery: 'Masters are invited to courts and paid in silver for a single verse.' },
	{ id: 'thievery', name: 'Thievery', glyph: '盗', desc: 'Pockets, locks, alibis and quiet feet.', trains: ['crime'], perk: (l) => ({ gamble: g(['crime'], l, 0.02), mult: [{ tags: ['crime'], stat: 'silver', gain: 1 + l * 0.05 }] }), mastery: 'You can take a ring off a finger during a handshake.' },
	{ id: 'athletics', name: 'Athletics', glyph: '走', desc: 'Running, climbing, swimming, long marches.', trains: ['land', 'rest'], perk: (l) => ({ travelDays: 1 - l * 0.008, mult: [{ tags: ['land'], stat: 'vigor', loss: 1 - l * 0.03 }] }), mastery: 'Roads that break caravans barely tire you.' },
	{ id: 'martial', name: 'Martial arts', glyph: '武', desc: 'Sword, staff, fist and the discipline behind them.', trains: ['fight'], perk: (l) => ({ gamble: g(['fight'], l, 0.02) }), mastery: 'Duellists recognise you before you draw.' },
	{ id: 'strength', name: 'Strength', glyph: '力', desc: 'Lifting, hauling, holding a door against a crowd.', trains: ['fight', 'land'], perk: (l) => ({ mult: [{ tags: ['fight'], stat: 'vigor', loss: 1 - l * 0.035 }] }), mastery: 'You carry what two porters cannot.' },
	{ id: 'knowledge', name: 'Knowledge', glyph: '識', desc: 'History, law, languages, how the world is run.', trains: ['official', 'talk'], perk: (l) => ({ gamble: g(['official', 'talk'], l, 0.012) }), mastery: 'Officials stop trying to cheat you; you know the regulations better than they do.' },
	{ id: 'luck', name: 'Luck', glyph: '運', desc: 'Not a skill, they say. Gamblers disagree.', trains: ['gamble'], perk: (l) => ({ gamble: g([], l, 0.008), mult: [{ tags: [], stat: 'fortune', gain: 1 + l * 0.03 }] }), mastery: 'Dice like you. Nobody knows why.' },
	{ id: 'cooking', name: 'Cooking', glyph: '炊', desc: 'Feeding yourself — and others — on the road.', trains: ['food'], perk: (l) => ({ mult: [{ tags: ['food', 'rest'], stat: 'vigor', gain: 1 + l * 0.06 }] }), mastery: 'A pot, a fire and twenty minutes, and strangers become friends.' },
	{ id: 'crafting', name: 'Handcraft', glyph: '工', desc: 'Mending, carving, sewing, building.', trains: ['trade', 'rest'], perk: (l) => ({ mult: [{ tags: ['trade'], stat: 'silver', gain: 1 + l * 0.03 }] }), mastery: 'Anything broken in your bag gets fixed by morning.' },
	{ id: 'machinery', name: 'Machinery', glyph: '械', desc: 'Clocks, pumps, cannon, the new engines.', trains: ['trade', 'art'], perk: (l) => ({ gamble: g(['trade'], l, 0.01) }), mastery: 'Inventors want you in their workshops; clocks run on time when you are near.' },
	{ id: 'puzzles', name: 'Puzzles', glyph: '謎', desc: 'Riddles, ciphers, maps, games of skill.', trains: ['gamble', 'art'], perk: (l) => ({ gamble: g(['gamble'], l, 0.012) }), mastery: 'Riddle maps read themselves; Go masters ask for a second game.' },
	{ id: 'creativity', name: 'Creativity', glyph: '創', desc: 'Seeing the third option nobody else sees.', trains: ['art', 'talk'], perk: (l) => ({ gamble: g([], l, 0.006) }), mastery: 'You find a way out of almost anything — sometimes a ridiculous one.' },
	{ id: 'medicine', name: 'Medicine', glyph: '医', desc: 'Herbs, needles, bonesetting, the pulse.', trains: ['illness', 'mercy'], perk: (l) => ({ mult: [{ tags: ['illness'], stat: 'vigor', loss: 1 - l * 0.05, gain: 1 + l * 0.05 }] }), mastery: 'Fevers that kill others leave you merely miserable.' },
	{ id: 'spirit', name: 'Devotion', glyph: '祈', desc: 'Prayer, ritual, fasting, the calm of temples.', trains: ['faith'], perk: (l) => ({ mult: [{ tags: ['faith'], stat: 'fortune', gain: 1 + l * 0.05 }] }), mastery: 'Priests of every faith bow to you as a fellow seeker.' },
	{ id: 'mystic', name: 'Third Eye', glyph: '眼', desc: 'Seeing what others cannot — the dead, omens, spirits.', trains: ['faith'], perk: (l) => ({ weight: [{ tags: ['faith'], mult: 1 + l * 0.08 }] }), mastery: 'The dead seek you out. Not all of them are friendly.' },
	{ id: 'aura', name: 'Presence', glyph: '気', desc: 'The room turns when you enter. Charm, poise, gravitas.', trains: ['talk', 'romance'], perk: (l) => ({ mult: [{ tags: ['talk', 'romance'], stat: 'renown', gain: 1 + l * 0.04 }] }), mastery: 'Strangers trust you within a sentence.' },
	{ id: 'composure', name: 'Composure', glyph: '静', desc: 'Keeping your head when everything is on fire.', trains: ['rest', 'loyal'], perk: () => ({}), mastery: 'Losses barely touch your mind.' }
];
export const SKILL: Record<SkillId, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<SkillId, Skill>;

/** Experience needed per level: level n needs 12·n·(n+1)/2 xp in total (so early levels come quick). */
export function levelOf(xp: number): number {
	let lvl = 0;
	while (lvl < 10 && xp >= (12 * (lvl + 1) * (lvl + 2)) / 2) lvl++;
	return lvl;
}
export const xpFor = (lvl: number) => (12 * lvl * (lvl + 1)) / 2;

/** Starting skill levels by calling (and a few traits). */
export const START_SKILLS: Record<string, Partial<Record<SkillId, number>>> = {
	merchant: { crafting: 2, knowledge: 1, aura: 1 },
	scholar: { knowledge: 3, puzzles: 2 },
	ronin: { martial: 3, strength: 2, composure: 1 },
	physician: { medicine: 3, knowledge: 1 },
	pilgrim: { spirit: 3, athletics: 1, composure: 1 },
	cartographer: { knowledge: 2, athletics: 2, puzzles: 1 },
	performer: { art: 2, aura: 2, creativity: 1 },
	smuggler: { thievery: 2, athletics: 1, luck: 1 },
	pirate: { martial: 2, luck: 2, strength: 1 },
	explorer: { athletics: 3, knowledge: 1, luck: 1 },
	envoy: { aura: 3, knowledge: 2 },
	thief: { thievery: 3, athletics: 2, luck: 1 },
	painter: { art: 3, creativity: 2 },
	writer: { knowledge: 2, creativity: 2, art: 1 },
	bard: { art: 2, aura: 2, luck: 1 },
	playwright: { creativity: 3, art: 2 },
	actor: { aura: 3, art: 2, thievery: 1 },
	dancer: { athletics: 2, art: 2, aura: 2 },
	prospector: { strength: 2, crafting: 2, luck: 1 },
	trader: { crafting: 1, knowledge: 1, athletics: 1, aura: 1 },
	priest: { spirit: 3, medicine: 1, knowledge: 1 },
	'treasure-hunter': { puzzles: 3, athletics: 1, luck: 1 },
	adventurer: { athletics: 2, luck: 2, martial: 1 },
	mercenary: { martial: 3, strength: 2 },
	troupe: { aura: 2, art: 2, cooking: 1 },
	medium: { mystic: 3, spirit: 1, composure: 1 },
	tinkerer: { machinery: 3, crafting: 2 },
	cook: { cooking: 3, crafting: 1 },
	// traits
	herbalist: { medicine: 1 },
	swordmaster: { martial: 2 },
	bookworm: { knowledge: 1 },
	poet: { art: 1 },
	glutton: { cooking: 1 },
	superstitious: { mystic: 1 },
	'fox-blooded': { mystic: 1 },
	brute: { strength: 2 },
	meticulous: { crafting: 1 },
	'stone-heart': { composure: 2 },
	gambler: { luck: 1 },
	stargazer: { knowledge: 1 }
};

export function startingSkills(profession: string, traits: string[]): Partial<Record<SkillId, number>> {
	const xp: Partial<Record<SkillId, number>> = {};
	for (const k of [profession, ...traits]) for (const [id, lvl] of Object.entries(START_SKILLS[k] ?? {})) xp[id as SkillId] = Math.max(xp[id as SkillId] ?? 0, xpFor(Math.min(10, (levelOf(xp[id as SkillId] ?? 0) + lvl!))));
	return xp;
}
