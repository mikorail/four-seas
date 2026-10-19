// Inner voices: the parts of you that talk back. Each has a level (1–6); higher levels speak more often, and more truly.
import type { Tag } from './traits';

export type VoiceId =
	| 'instinct'
	| 'annals'
	| 'dream-ink'
	| 'brotherhood'
	| 'tigers-shadow'
	| 'appetite'
	| 'heart-reading'
	| 'face'
	| 'will'
	| 'wind-water'
	| 'reason'
	| 'eloquence'
	| 'brush-ink'
	| 'mask'
	| 'silk-thread'
	| 'iron-bones'
	| 'hawk-eye'
	| 'wind-steps'
	| 'clever-hands'
	| 'ancestors';

export interface Voice {
	id: VoiceId;
	name: string;
	glyph: string;
	echo: string; // what it is like (Disco Elysium equivalent, for the curious)
	desc: string;
	tags: Tag[]; // choices it helps with (+2% odds per level above 2)
	color: string; // a CSS var name used for its label
}

export const VOICES: Voice[] = [
	{ id: 'instinct', name: 'Instinct', glyph: '本', echo: 'Hand/Eye & Reaction', desc: 'The animal in you. Smells danger, knows which road is bad, feels the dice before they land.', tags: ['fight', 'land'], color: '--vermilion' },
	{ id: 'annals', name: 'Annals', glyph: '史', echo: 'Encyclopedia', desc: 'Every chronicle you ever read, whispering dates, dynasties and useless, beautiful facts.', tags: ['art'], color: '--jade' },
	{ id: 'dream-ink', name: 'Dream Ink', glyph: '夢', echo: 'Inland Empire', desc: 'Hunches, omens, the voices of objects and the dead. Often wrong. Never boring.', tags: ['faith'], color: '--gold' },
	{ id: 'brotherhood', name: 'Sworn Brotherhood', glyph: '義', echo: 'Esprit de Corps', desc: 'The bond of the road. Knows what your companions — and every soldier and sailor — are feeling.', tags: ['loyal'], color: '--jade' },
	{ id: 'tigers-shadow', name: 'Tiger’s Shadow', glyph: '怖', echo: 'Half Light', desc: 'Fear, sharpened into a blade. Keeps you alive. Makes you cruel.', tags: ['fight', 'crime'], color: '--vermilion' },
	{ id: 'appetite', name: 'Appetite', glyph: '欲', echo: 'Electrochemistry', desc: 'Wine, dice, food, flesh, opium. It wants. It always wants.', tags: ['food', 'gamble', 'romance'], color: '--gold' },
	{ id: 'heart-reading', name: 'Heart-Reading', glyph: '心', echo: 'Empathy', desc: 'Reads faces like letters. Knows when someone is lying, grieving or in love.', tags: ['mercy', 'romance'], color: '--jade' },
	{ id: 'face', name: 'Face', glyph: '威', echo: 'Authority', desc: 'Mianzi. Rank, respect, who bows first. Never lets an insult pass.', tags: ['official'], color: '--vermilion' },
	{ id: 'will', name: 'Will', glyph: '志', echo: 'Volition', desc: 'The part that holds the rest together. Slows the slide into despair.', tags: ['rest'], color: '--ink' },
	{ id: 'wind-water', name: 'Wind & Water', glyph: '風', echo: 'Shivers', desc: 'Feng shui of the whole world. The city speaks to you; the road remembers who walked it.', tags: ['sea', 'river'], color: '--gold' },
	{ id: 'reason', name: 'Reason', glyph: '理', echo: 'Logic', desc: 'Cold sums. Weighs what each choice will cost and what it will bring.', tags: ['trade'], color: '--ink' },
	{ id: 'eloquence', name: 'Eloquence', glyph: '弁', echo: 'Rhetoric', desc: 'The right word, in the right language, at the right moment.', tags: ['talk'], color: '--jade' },
	{ id: 'brush-ink', name: 'Brush & Ink', glyph: '筆', echo: 'Conceptualization', desc: 'Sees the poem in the gutter and the painting in the storm. Insufferable at parties.', tags: ['art'], color: '--gold' },
	{ id: 'mask', name: 'The Mask', glyph: '面', echo: 'Drama', desc: 'Every face is a performance — yours most of all. Knows a lie because it tells them too.', tags: ['crime', 'talk'], color: '--vermilion' },
	{ id: 'silk-thread', name: 'Silk Thread', glyph: '絲', echo: 'Suggestion', desc: 'A gentle pull here, a soft word there. People do what you want and thank you for it.', tags: ['talk', 'romance'], color: '--jade' },
	{ id: 'iron-bones', name: 'Iron Bones', glyph: '骨', echo: 'Endurance & Pain Threshold', desc: 'The body that keeps walking after the mind says stop. Shrugs off fever and blows.', tags: ['illness', 'rest'], color: '--ink' },
	{ id: 'hawk-eye', name: 'Hawk Eye', glyph: '鷹', echo: 'Perception', desc: 'The glint in the grass, the sail on the horizon, the knife under the cloak.', tags: ['sea', 'land'], color: '--gold' },
	{ id: 'wind-steps', name: 'Wind Steps', glyph: '軽', echo: 'Savoir Faire', desc: 'Rooftops, crowds, dropped coins caught before they land. Style is a kind of survival.', tags: ['crime', 'fight'], color: '--vermilion' },
	{ id: 'clever-hands', name: 'Clever Hands', glyph: '巧', echo: 'Interfacing', desc: 'Locks, knots, clocks, abacus beads. Your fingers understand things before you do.', tags: ['trade'], color: '--ink' },
	{ id: 'ancestors', name: 'The Ancestors', glyph: '祖', echo: '(unique to the Four Seas)', desc: 'The dead of your family, crowded behind your eyes. Proud, demanding, occasionally right.', tags: ['faith', 'loyal'], color: '--gold' }
];
export const VOICE: Record<VoiceId, Voice> = Object.fromEntries(VOICES.map((v) => [v.id, v])) as Record<VoiceId, Voice>;
export const VOICE_IDS = VOICES.map((v) => v.id);

/** Where your voices start: everyone has 2 in each; callings and traits lean them. */
const LEAN: Record<string, Partial<Record<VoiceId, number>>> = {
	merchant: { reason: 2, eloquence: 1 },
	scholar: { annals: 2, reason: 1 },
	ronin: { instinct: 2, 'tigers-shadow': 1 },
	physician: { 'heart-reading': 2, reason: 1 },
	pilgrim: { 'dream-ink': 2, will: 1 },
	cartographer: { 'wind-water': 2, annals: 1 },
	performer: { eloquence: 2, appetite: 1 },
	smuggler: { 'tigers-shadow': 2, instinct: 1 },
	pirate: { brotherhood: 2, appetite: 1 },
	explorer: { 'wind-water': 1, instinct: 1, will: 1 },
	envoy: { face: 2, eloquence: 1 },
	'silver-tongue': { eloquence: 1 },
	pious: { 'dream-ink': 1 },
	gambler: { appetite: 1 },
	polyglot: { eloquence: 1 },
	'hot-blooded': { 'tigers-shadow': 1 },
	veteran: { brotherhood: 1, instinct: 1 },
	poet: { 'dream-ink': 1 },
	pathfinder: { 'wind-water': 1 },
	romantic: { 'heart-reading': 1 },
	superstitious: { 'dream-ink': 1 },
	bookworm: { annals: 1 },
	herbalist: { 'heart-reading': 1 },
	swordmaster: { instinct: 1 },
	glutton: { appetite: 1 },
	'fox-blooded': { 'dream-ink': 1, instinct: 1 },
	stargazer: { 'wind-water': 1 },
	brute: { instinct: 1, annals: -1 },
	tactless: { eloquence: -1, face: 1 },
	coward: { 'tigers-shadow': 1 },
	meticulous: { reason: 1 },
	mercurial: { 'dream-ink': 1, will: -1 },
	'stone-heart': { will: 1, 'heart-reading': -1 },
};
const LEAN2: Record<string, Partial<Record<VoiceId, number>>> = {
	merchant: { 'clever-hands': 1 },
	scholar: { 'brush-ink': 1 },
	ronin: { 'iron-bones': 1, ancestors: 1 },
	physician: { 'iron-bones': 1 },
	pilgrim: { 'iron-bones': 1, ancestors: 1 },
	cartographer: { 'hawk-eye': 2 },
	performer: { mask: 2, 'silk-thread': 1 },
	smuggler: { 'wind-steps': 2, mask: 1 },
	pirate: { 'hawk-eye': 1, 'wind-steps': 1 },
	explorer: { 'hawk-eye': 1, 'iron-bones': 1 },
	envoy: { 'silk-thread': 2 },
	poet: { 'brush-ink': 2 },
	'silver-tongue': { 'silk-thread': 1 },
	veteran: { 'iron-bones': 1 },
	'iron-stomach': { 'iron-bones': 1 },
	pious: { ancestors: 1 },
	stargazer: { 'hawk-eye': 1 },
	romantic: { 'silk-thread': 1 },
	meticulous: { 'clever-hands': 1 },
	brute: { 'iron-bones': 1, 'brush-ink': -1 },
	coward: { 'wind-steps': 1 },
	impious: { ancestors: -1 },
	gambler: { mask: 1 }
};

export function baseVoices(profession: string, traits: string[]): Record<VoiceId, number> {
	const v = Object.fromEntries(VOICE_IDS.map((id) => [id, 2])) as Record<VoiceId, number>;
	for (const k of [profession, ...traits]) for (const L of [LEAN, LEAN2]) for (const [id, n] of Object.entries(L[k] ?? {})) v[id as VoiceId] += n!;
	for (const id of VOICE_IDS) v[id] = Math.max(1, Math.min(6, v[id]));
	return v;
}

/** Points to spend on top of the base in the creator. */
export const VOICE_POINTS = 6;
