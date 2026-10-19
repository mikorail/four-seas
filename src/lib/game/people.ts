// People at a venue, presented like dating profiles: swipe right to get to know them, left to pass.
// Each has their own traits, likes and dislikes; compatibility comes from how their traits and tastes meet yours.
import { Rng, hashString } from '#lib/rng';
import { CULTURES, CULTURE_IDS, makeName, type CultureId, type Gender } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { PERK, TRAITS, type Tag } from '#lib/data/traits';
import { IDEALS } from '#lib/data/faiths';
import { notableOfCity } from '#lib/data/notables';
import type { VenueId } from '#lib/data/venues';
import { expand, type Rules } from './grammar';
import { rapportOf } from './mods';
import type { Card, Choice, Npc, Person, Role, Run } from './types';

export type LookingFor = 'friendship' | 'romance' | 'work' | 'a story' | 'a partner in crime' | 'a debate';

export interface Profile {
	id: string;
	npc: Npc;
	age: number;
	traits: string[];
	likes: Tag[];
	dislikes: Tag[];
	bio: string;
	looking: LookingFor;
	notable?: boolean;
	known?: Person; // someone you already know
}

const VENUE_ROLES: Partial<Record<VenueId, Role[]>> = {
	inn: ['innkeeper', 'merchant', 'sailor', 'performer', 'soldier', 'lover'],
	temple: ['monk', 'healer', 'elder', 'fortune-teller'],
	square: ['performer', 'child', 'soldier', 'merchant', 'elder'],
	market: ['merchant', 'healer', 'child', 'performer'],
	bazaar: ['merchant', 'merchant', 'performer', 'fortune-teller', 'lover'],
	harbor: ['sailor', 'captain', 'merchant', 'soldier'],
	palace: ['noble', 'official', 'scholar', 'soldier'],
	academy: ['scholar', 'scholar', 'monk', 'noble'],
	bridge: ['lover', 'performer', 'scholar', 'child'],
	landmark: ['monk', 'scholar', 'elder', 'performer'],
	festival: ['lover', 'performer', 'merchant', 'child', 'noble']
};

const LIKE_POOL: Tag[] = ['art', 'talk', 'faith', 'trade', 'food', 'romance', 'fight', 'gamble', 'sea', 'mercy', 'rest', 'crime', 'loyal'];
const TAG_WORD: Partial<Record<Tag, string>> = { art: 'poetry & art', talk: 'long conversations', faith: 'temples & prayer', trade: 'a good bargain', food: 'good food', romance: 'romance', fight: 'a fair fight', gamble: 'dice & cards', sea: 'the sea', mercy: 'kindness', rest: 'slow mornings', crime: 'breaking rules', loyal: 'loyalty' };
export const tagWord = (t: Tag) => TAG_WORD[t] ?? t;

const LOOKING: Record<Role, LookingFor[]> = {
	merchant: ['work', 'a partner in crime', 'friendship'],
	official: ['a debate', 'work', 'friendship'],
	monk: ['a debate', 'friendship', 'a story'],
	bandit: ['a partner in crime', 'work'],
	sailor: ['work', 'a story', 'romance'],
	captain: ['work', 'a story'],
	noble: ['romance', 'a debate', 'a partner in crime'],
	scholar: ['a debate', 'a story', 'friendship'],
	healer: ['friendship', 'work'],
	performer: ['romance', 'a story', 'friendship'],
	child: ['friendship', 'a story'],
	elder: ['a story', 'friendship'],
	soldier: ['work', 'friendship', 'a partner in crime'],
	ghost: ['a story'],
	tiger: ['a story'],
	'fortune-teller': ['a story', 'friendship'],
	lover: ['romance', 'romance', 'friendship'],
	innkeeper: ['a story', 'friendship', 'work'],
	hero: ['friendship'],
	spirit: ['a story']
};

const BIO: Rules = {
	bio: [
		'#open# #quirk#. #want#.',
		'#quirk#. #want#. #close#',
		'#open#. #close#'
	],
	open: ['Born in #home#, raised by #raised#', 'Three winters on the #road#', 'Former #former#, current #current#', 'Only child of a #parent#', 'Has outlived two #outlived#'],
	home: ['a fishing village', 'the old quarter', 'a mountain monastery', 'a merchant’s counting house', 'a garrison town'],
	raised: ['grandmothers', 'monks', 'an aunt who ran a gambling den', 'a travelling theatre', 'wolves (they claim)'],
	road: ['tea road', 'salt road', 'pilgrim road', 'river barges'],
	former: ['soldier', 'nun', 'pirate', 'court musician', 'tax collector'],
	current: ['optimist', 'insomniac', 'gardener', 'gossip', 'philosopher'],
	parent: ['ferryman', 'silk weaver', 'disgraced magistrate', 'herbalist'],
	outlived: ['husbands', 'masters', 'shipwrecks', 'emperors'],
	quirk: ['Collects broken compasses', 'Cannot sing, sings anyway', 'Knows the name of every star', 'Has never lost at dice (has never played)', 'Talks to cats, gets answers', 'Keeps a list of every lie ever told to them', 'Writes letters to people who have died'],
	want: ['Looking for someone who can keep up', 'Wants to see the sea before turning forty', 'Needs a reason to leave this city', 'Hoping to hear news from home', 'Would like, for once, to be surprised'],
	close: ['Swipe right if you have been somewhere strange.', 'No fortune tellers.', 'Will judge you by your shoes.', 'Bring tea.', 'Not looking for trouble. Usually.']
};

const pick2 = <T,>(r: Rng, xs: T[], n: number) => r.sample(xs, Math.min(n, xs.length));

/** Who is at this venue right now (stable for the stay). Known people in this city come back. */
export function peopleAt(run: Run, venue: VenueId): Profile[] {
	const city = CITY[run.location];
	const r = new Rng(hashString(`${run.seed}:${run.location}:${run.flags.stay ?? 0}:${venue}`));
	const roles = VENUE_ROLES[venue] ?? ['merchant', 'elder', 'performer'];
	const out: Profile[] = [];
	// people you already know here
	for (const p of (run.people ?? []).filter((x) => x.city === city.id && x.stage !== 'rival').slice(0, 2)) out.push({ id: p.id, npc: p.npc, age: 30, traits: p.traits, likes: p.likes as Tag[], dislikes: p.dislikes as Tag[], bio: p.bio, looking: p.stage === 'sweetheart' ? 'romance' : 'friendship', known: p });
	// the city's famous resident sometimes drops in
	if ((venue === 'inn' || venue === 'academy' || venue === 'palace' || venue === 'square') && r.chance(0.35)) {
		const nb = notableOfCity(city.id, run.year);
		if (!out.some((p) => p.npc.name === nb.name))
			out.push({ id: nb.id, npc: { name: nb.name, title: nb.title, culture: nb.culture, gender: nb.gender, role: nb.role, seed: hashString(nb.id) }, age: r.int(38, 70), traits: nb.traits.filter((t) => PERK[t]).slice(0, 3), likes: pick2(r, LIKE_POOL, 2), dislikes: pick2(r, LIKE_POOL, 1), bio: nb.blurb, looking: nb.favoredActivity === 'debate' ? 'a debate' : 'a story', notable: true });
	}
	const n = r.int(3, 5);
	for (let i = 0; out.length < n + 1 && i < 8; i++) {
		const role = r.pick(roles);
		const g: Gender = role === 'lover' ? (r.chance(0.5) ? 'f' : 'm') : r.chance(0.45) ? 'f' : 'm';
		const culture: CultureId = r.chance(0.78) ? city.culture : r.pick(CULTURE_IDS.filter((c) => c !== 'pacific' || city.culture === 'pacific'));
		const name = makeName(r, CULTURES[culture], g);
		const traits = pick2(r, TRAITS.filter((t) => !t.unlock), r.chance(0.3) ? 3 : 2).map((t) => t.id);
		const likes = pick2(r, LIKE_POOL, 2);
		const dislikes = pick2(r, LIKE_POOL.filter((t) => !likes.includes(t)), r.chance(0.5) ? 2 : 1);
		const npc: Npc = { name, title: titleFor(role, culture), culture, gender: g, role, seed: r.int(1, 1e9) };
		out.push({ id: `p-${npc.seed}`, npc, age: role === 'child' ? r.int(9, 15) : role === 'elder' ? r.int(60, 88) : r.int(18, 55), traits, likes, dislikes, bio: expand(r, '#bio#', BIO), looking: r.pick(LOOKING[role] ?? ['friendship']) });
	}
	return out;
}

function titleFor(role: Role, c: CultureId): string {
	const cul = CULTURES[c];
	const T: Partial<Record<Role, string>> = { merchant: `${cul.adjective} merchant`, monk: 'Monk', healer: 'Healer', elder: 'Elder', 'fortune-teller': 'Fortune teller', sailor: 'Sailor', captain: 'Ship’s captain', noble: 'Noble', official: cul.official, scholar: 'Scholar', soldier: 'Soldier', performer: 'Performer', child: 'Street kid', lover: 'Charming stranger', innkeeper: 'Innkeeper' };
	return T[role] ?? 'Traveller';
}

/** 0..100: how well you would get on. Their traits' opinions of yours, shared traits, shared tastes, and your ideal. */
export function compatibility(run: Run, p: Profile): { score: number; why: string[] } {
	const why: string[] = [];
	let s = 50;
	const rap = rapportOf(run, p.npc.role);
	if (rap.likes.length) (s += 10 * rap.likes.length), why.push(`warms to your ${rap.likes.join(' & ').toLowerCase()}`);
	if (rap.dislikes.length) (s -= 10 * rap.dislikes.length), why.push(`wary of your ${rap.dislikes.join(' & ').toLowerCase()}`);
	const shared = p.traits.filter((t) => run.hero.traits.includes(t));
	if (shared.length) (s += 12 * shared.length), why.push(`you are both ${shared.map((t) => PERK[t]?.name.toLowerCase()).join(' & ')}`);
	// their traits against your traits: if their trait is the opposite of yours, sparks (or friction)
	const opp = p.traits.filter((t) => run.hero.traits.includes(PERK[t]?.opposite ?? '#'));
	if (opp.length) (s -= 8), why.push('opposites — interesting, or exhausting');
	const ideal = IDEALS[run.hero.ideal as keyof typeof IDEALS];
	if (ideal) {
		const love = p.likes.filter((t) => ideal.love.includes(t)).length;
		const hate = p.likes.filter((t) => ideal.hate.includes(t)).length;
		if (love) (s += 8 * love), why.push(`loves ${p.likes.filter((t) => ideal.love.includes(t)).map(tagWord).join(' & ')}, like you`);
		if (hate) (s -= 8 * hate), why.push(`loves ${p.likes.filter((t) => ideal.hate.includes(t)).map(tagWord).join(' & ')}, which you cannot stand`);
	}
	if (p.npc.culture === run.hero.culture) (s += 5), why.push('from your own people');
	if (p.known) s += Math.round(p.known.bond / 4);
	return { score: Math.max(3, Math.min(97, s)), why };
}

const ACTIVITY: Partial<Record<VenueId, string>> = {
	inn: 'share a jug of #drink# and a plate of #food# by the stove',
	temple: 'walk the temple grounds while the bells ring',
	square: 'watch the street performers and heckle the bad ones',
	market: 'wander the stalls, haggling for things neither of you needs',
	bazaar: 'get lost in the covered alleys of the bazaar',
	harbor: 'sit on the harbour wall and guess where each ship is going',
	palace: 'stroll the outer gardens of the palace, gossiping in whispers',
	academy: 'argue about poetry in the academy courtyard until the lamps are lit',
	bridge: 'lean on the bridge rail and watch the lanterns drift',
	landmark: 'climb up to the landmark together at sunset',
	festival: 'join the festival crowds, eat everything on sticks'
};

/** The card you get for swiping right: a first hangout (or a deeper one with someone you know). */
export function hangoutCard(run: Run, p: Profile, venue: VenueId): Card {
	const r = new Rng(hashString(`${run.seed}:${p.id}:${run.day}`));
	const cul = CULTURES[CITY[run.location].culture];
	const act = expand(r, ACTIVITY[venue] ?? 'spend an afternoon together', { drink: [cul.drink], food: [cul.food] });
	const comp = compatibility(run, p).score;
	const first = p.npc.name.split(' ')[0];
	const known = p.known;
	const like = p.likes[0];
	const stage = known?.stage ?? 'acquaintance';
	const romantic = p.looking === 'romance' || stage === 'sweetheart';
	const person = (bond: number, next?: Person['stage']): Choice['person'] => ({ profile: toPerson(run, p, venue), bond, stage: next });
	const odds = Math.max(0.15, Math.min(0.9, comp / 100 + 0.1));
	const intro = known
		? `You find **${p.npc.name}** again${stage === 'sweetheart' ? ', and your heart does something embarrassing' : ''}. You ${act}.`
		: `You and **${p.npc.name}**, ${/^[A-Z][a-z]+ (merchant)$/.test(p.npc.title) || p.notable ? p.npc.title : p.npc.title.toLowerCase()}, ${act}. ${first} is looking for ${p.looking}${p.notable ? ' — and is one of the most famous people in the city' : ''}.`;
	const talkLabel = like === 'art' ? 'Trade poems' : like === 'gamble' ? 'Play dice' : like === 'faith' ? 'Pray together' : like === 'food' ? 'Order everything on the menu' : like === 'sea' ? 'Swap sea stories' : like === 'fight' ? 'Spar, for fun' : like === 'trade' ? 'Talk prices and profits' : 'Talk until late';
	const choices: { left: Choice; right: Choice; up?: Choice } = {
		left: { label: `${talkLabel} (they love ${tagWord(like)})`, fx: { vigor: 4 }, tags: [like, 'talk'], gamble: { p: odds, win: { fx: { fortune: 4 }, text: `${first} laughs until they cry. You have a friend in ${cityName(CITY[run.location], run.year)}.`, person: person(20, stage === 'acquaintance' ? 'friend' : stage === 'friend' ? 'confidant' : undefined) }, lose: { fx: {}, text: `It never quite catches. ${first} is polite, and leaves early.`, person: person(4) } } },
		right: { label: 'Ask about their life', fx: { renown: 2 }, tags: ['talk', 'mercy'], text: `${first} talks for an hour: ${p.bio.toLowerCase()} You listen to all of it.`, person: person(10) }
	};
	if (p.looking === 'work' && run.crew.length < 3 && !known)
		choices.up = { label: `Offer ${first} a place in your retinue`, fx: {}, tags: ['loyal'], why: 'They are looking for work', person: person(15, 'friend'), crewAdd: { id: 'crew-' + p.id, npc: p.npc, role: p.npc.role === 'soldier' ? 'bodyguard' : p.npc.role === 'sailor' || p.npc.role === 'captain' ? 'navigator' : p.npc.role === 'healer' ? 'healer' : p.npc.role === 'merchant' ? 'interpreter' : 'guide', wage: 2, loyalty: 60 + Math.round(comp / 4), joinedDay: run.day }, text: `${first} grins and shakes your hand on it.` };
	else if (romantic && comp >= 55 && (!run.romance || run.romance.status === 'parted' || run.romance.npc.name === p.npc.name))
		choices.up = { label: stage === 'sweetheart' ? 'Steal a kiss' : 'Flirt, shamelessly', fx: { fortune: 4 }, tags: ['romance'], why: `${comp}% match`, romance: run.romance?.npc.name === p.npc.name ? { affection: 12 } : { start: true, affection: 20 }, person: person(25, 'sweetheart'), text: `${first} pretends to be scandalised for exactly one second.` };
	else if (stage === 'confidant')
		choices.up = { label: 'Ask a favour', fx: { silver: 10 }, tags: ['talk'], why: 'Confidant', person: person(-5), text: `${first} does not even ask what it is for.` };
	else if (p.looking === 'a partner in crime' && !known)
		choices.up = { label: 'Plan a little crime together', fx: {}, tags: ['crime'], why: 'They want a partner in crime', heat: 8, gamble: { p: odds, win: { fx: { silver: 16 }, text: 'A perfect little job. You split it, giggling like children.', person: person(25, 'confidant') }, lose: { fx: { vigor: -8 }, text: 'You both end up in a canal. Somehow, a friendship survives it.', person: person(10) } } };
	return {
		id: 'people-hangout',
		npc: { ...p.npc, title: known ? `${p.npc.title} · ${stage}` : p.npc.title },
		badge: known ? `♥ ${stage}` : `${comp}% match`,
		text: intro,
		...choices
	};
}

export function toPerson(run: Run, p: Profile, venue: string): Person {
	return p.known ?? { id: p.id, npc: p.npc, city: run.location, venue, traits: p.traits, likes: p.likes, dislikes: p.dislikes, bio: p.bio, bond: 0, stage: 'acquaintance', met: run.day, last: run.day };
}

/** Apply a person change from a choice: add them to your people, adjust the bond, maybe change the stage. */
export function personStep(run: Run, step: NonNullable<Choice['person']>, notes: string[]) {
	run.people ??= [];
	let p = run.people.find((x) => x.id === step.profile.id);
	if (!p) {
		p = { ...step.profile };
		run.people.push(p);
		notes.push(`🤝 You now know **${p.npc.name}** in ${cityName(CITY[p.city], run.year)}.`);
	}
	p.bond = Math.max(-100, Math.min(100, p.bond + (step.bond ?? 0)));
	p.last = run.day;
	const order: Person['stage'][] = ['acquaintance', 'friend', 'confidant', 'sweetheart'];
	if (step.stage && (step.stage === 'rival' || order.indexOf(step.stage) > order.indexOf(p.stage))) {
		p.stage = step.stage;
		notes.push(step.stage === 'friend' ? `💛 ${p.npc.name} is your friend now.` : step.stage === 'confidant' ? `🔑 ${p.npc.name} trusts you with their secrets.` : step.stage === 'sweetheart' ? `💗 ${p.npc.name} has your heart.` : `⚔ ${p.npc.name} is your rival.`);
	}
	if (p.bond <= -40 && p.stage !== 'rival') {
		p.stage = 'rival';
		notes.push(`⚔ ${p.npc.name} has turned against you.`);
	}
}

