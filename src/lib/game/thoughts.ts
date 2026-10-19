// The stream of thought: inner voices comment on each card. Relevance first — they react to the words on the card,
// the choices in front of you, this person, and your own past in this place. They tell the truth when your mind is steady.
import { Rng } from '#lib/rng';
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import { STATS, type Fx } from '#lib/data/traits';
import { VOICE, VOICE_IDS, type VoiceId } from '#lib/data/voices';
import { landmarkOf } from '#lib/data/venues';
import { expand, type Rules } from './grammar';
import { effectiveVoices, rapportOf } from './mods';
import type { Card, Choice, Run } from './types';

export interface Thought {
	voice: VoiceId;
	check: 'Trivial' | 'Easy' | 'Medium' | 'Challenging' | 'Heroic';
	ok: boolean; // false = a frayed mind lying to you
	text: string;
}

export const voicesOf = (run: Pick<Run, 'hero'> & { cabinet?: Run['cabinet'] }) => effectiveVoices(run);

export function mindState(run: Pick<Run, 'mind' | 'apathy'>): { id: 'steady' | 'shaken' | 'frayed' | 'unravelling' | 'numb'; label: string } {
	const m = run.mind ?? 70;
	if ((run.apathy ?? 0) >= 40) return { id: 'numb', label: 'Numb' };
	if (m >= 60) return { id: 'steady', label: 'Steady' };
	if (m >= 35) return { id: 'shaken', label: 'Shaken' };
	if (m >= 15) return { id: 'frayed', label: 'Frayed' };
	return { id: 'unravelling', label: 'Unravelling' };
}

const DC = { Trivial: 4, Easy: 6, Medium: 8, Challenging: 10, Heroic: 12 } as const;
type Dc = keyof typeof DC;
interface Cand {
	voice: VoiceId;
	weight: number; // relevance
	dc: Dc;
	truth: string;
	lie: string;
}

const tagsOf = (c: Card) => new Set([...(c.left.tags ?? []), ...(c.right.tags ?? []), ...(c.up?.tags ?? [])]);
const sumFx = (fx: Fx) => STATS.reduce((s, k) => s + (fx[k] ?? 0), 0);
const net = (ch: Choice): number => {
	let v = sumFx(ch.fx) - (ch.days ?? 0) * 0.5;
	if (ch.gamble) v += ch.gamble.p * sumFx(ch.gamble.win.fx) + (1 - ch.gamble.p) * sumFx(ch.gamble.lose.fx);
	return v;
};
const q = (s: string) => `«${s.length > 34 ? s.slice(0, 32) + '…' : s}»`;
const strip = (s: string) => s.replace(/\*\*/g, '');

/** Words on the card that make a voice sit up. `$w` is the word that matched. */
const KEYWORDS: { re: RegExp; voices: [VoiceId, string[]][] }[] = [
	{ re: /\b(letter|seal|papers?|document|dispatch|contract|treaty|map|chart)s?\b/i, voices: [['clever-hands', ['Look at the $w. The wax, the folds, the ink — someone has opened it before you.', 'The $w is worth more than what it says. Who it is *from* is the real message.']], ['annals', ['A $w like this once started a war in the Warring States. Handle it accordingly.']]] },
	{ re: /\b(ship|junk|dhow|sail|harbou?r|boat|galleon|deck|crew)s?\b/i, voices: [['hawk-eye', ['That $w sits low in the water. Heavier than its papers say.', 'Count the men on the $w. Then count the guns. The numbers do not match.']], ['wind-water', ['The sea is listening to every word about this $w.']]] },
	{ re: /\b(tea|wine|sake|arrack|feast|food|rice|noodles|banquet|drink|soup|bread|dumplings?)\b/i, voices: [['appetite', ['The $w. The $w is right *there*. Decisions are better made full.', 'You could smell that $w from the street. Your stomach has already said yes.']], ['iron-bones', ['Eat while you can. The road does not feed you.']]] },
	{ re: /\b(sword|blade|knife|kris|katana|dagger|spear|musket|pistol|duel|bow)s?\b/i, voices: [['instinct', ['The $w. Watch the hand, not the face.', 'Where the $w points, the trouble follows. Step to the side.']], ['wind-steps', ['A $w is only frightening if you stand still.']]] },
	{ re: /\b(temple|shrine|monk|nun|priest|god|gods|spirit|ghost|buddha|prayer|mosque|church|omen)s?\b/i, voices: [['dream-ink', ['The $w hums at a frequency only you can hear.', 'Something behind the $w is awake. It noticed you first.']], ['ancestors', ['Bow to the $w. Your grandmother would. Your grandmother is watching.']]] },
	{ re: /\b(silver|coins?|price|pay|debt|taels?|gold|profit|loan|bribe|tax)\b/i, voices: [['reason', ['Mention of $w. Calculate before you feel.', 'Whoever names the $w first loses the haggle. Let them speak.']], ['clever-hands', ['Weigh the $w yourself. Their scales lean.']]] },
	{ re: /\b(love|kiss|heart|beloved|marry|wedding|sweetheart|blush)\w*/i, voices: [['silk-thread', ['$w. Lower your voice. Let them lean in to hear you.']], ['heart-reading', ['They said “$w” too quickly. They have been rehearsing it.']]] },
	{ re: /\b(lie|lies|secret|spy|rumou?r|whisper|gossip|hidden|disguise|forged?)\w*/i, voices: [['mask', ['A $w? Then everyone at this table is acting. Act better.', 'You know this kind of $w. You have told it yourself.']], ['heart-reading', ['The $w is not the real secret. Watch what they do with their hands.']]] },
	{ re: /\b(sick|fever|plague|wound|blood|pain|cough|dying|corpse|poison)\w*/i, voices: [['iron-bones', ['$w. Your body remembers worse. Keep breathing.', 'Do not touch anything until you know what this $w is.']], ['tigers-shadow', ['$w is contagious. So is fear. Leave.']]] },
	{ re: /\b(paint|poem|poet|song|music|scroll|calligraphy|story|dance|lute|ink)\w*/i, voices: [['brush-ink', ['The $w is mediocre. You could do better. You *should* do better.', 'There is a $w in this moment. Remember the light on their face.']]] },
	{ re: /\b(king|emperor|sultan|shah|shogun|court|official|governor|minister|magistrate|prince|princess|daimy[oō])s?\b/i, voices: [['face', ['A $w. Stand straighter. Not too straight.', 'The $w respects strength and forgives nothing. Choose accordingly.']], ['annals', ['Every $w in this dynasty died young or ruled long. There was no middle.']]] },
	{ re: /\b(child|children|mother|father|son|daughter|grandmother|grave|ancestor|family|widow|orphan)s?\b/i, voices: [['ancestors', ['A $w. We were someone’s $w once. Remember us here.', 'Your line will be judged by how you treat this $w.']], ['heart-reading', ['The $w is the whole story. Everything else is decoration.']]] },
	{ re: /\b(night|dark|moon|fog|mist|shadow)s?\b/i, voices: [['tigers-shadow', ['$w is when they come for travellers. Keep your back to a wall.']], ['dream-ink', ['The $w is thinner here. Things step through it.']]] },
	{ re: /\b(road|pass|mountain|desert|river|forest|bridge|crossing|caravan)s?\b/i, voices: [['hawk-eye', ['Fresh tracks on the $w — more than one set, and heavy.']], ['wind-water', ['This $w has been walked for a thousand years. It knows where you are going better than you do.']]] }
];

/** What each voice might say about this card, weighted by how much it actually has to do with it. */
function candidates(run: Run, card: Card, r: Rng): Cand[] {
	const out: Cand[] = [];
	const tags = tagsOf(card);
	const n = card.npc;
	const first = n.name.split(' ')[0];
	const city = CITY[run.route?.to ?? run.location];
	const cul = CULTURES[city.culture];
	const L = card.left;
	const R = card.right;
	const rules: Rules = { npc: [first], city: [cityName(city, run.year)], food: [cul.food], drink: [cul.drink], ruler: [cul.ruler(run.year)], holy: [cul.holyPlace] };
	const say = (t: string) => expand(r, t, rules);
	const add = (voice: VoiceId, weight: number, dc: Dc, truth: string, lie: string) => out.push({ voice, weight, dc, truth: say(truth), lie: say(lie) });

	// 1. THE WORDS ON THE CARD — strongest relevance
	const text = strip(card.text);
	const seenVoice = new Set<VoiceId>();
	for (const k of KEYWORDS) {
		const m = k.re.exec(text);
		if (!m) continue;
		const w = m[0].toLowerCase();
		for (const [voice, lines] of k.voices) {
			if (seenVoice.has(voice)) continue;
			seenVoice.add(voice);
			add(voice, 3.2, 'Easy', r.pick(lines).replace(/\$w/g, w), r.pick([`Forget the ${w}. It is a distraction. Everything is a distraction.`, `The ${w} is the only thing that matters. Stake everything on it.`]));
		}
	}

	// 2. THE CHOICES IN FRONT OF YOU — real hints
	const risk = (ch: Choice) => (ch.gamble ? 1 - ch.gamble.p : 0) + (ch.tags?.includes('fight') ? 0.2 : 0);
	if (L.gamble || R.gamble || tags.has('fight')) {
		const safer = risk(L) <= risk(R) ? L : R;
		const worse = safer === L ? R : L;
		add('instinct', 3, 'Medium', r.pick([`${q(worse.label)} — the hair on your arms stands up. ${q(safer.label)} smells safer.`, `Your gut has already decided: ${q(safer.label)}.`, `Something in ${q(worse.label)} is wrong. You can't say what. You don't need to.`]), `${q(worse.label)}. Definitely. Probably. Go.`);
	}
	const nl = net(L);
	const nr = net(R);
	if (Math.abs(nl - nr) >= 4) {
		const best = nl > nr ? L : R;
		const other = best === L ? R : L;
		add('reason', 2.6, 'Easy', r.pick([`Add it up: ${q(best.label)} leaves you better off than ${q(other.label)}.`, `Cost against gain. ${q(best.label)} wins the ledger.`]), `The numbers favour ${q(other.label)}. Obviously.`);
	}
	const sly = [L, R].find((c) => c.tags?.includes('crime') || c.tags?.includes('bribe'));
	if (sly) add('mask', 2.6, 'Medium', r.pick([`If you choose ${q(sly.label)}, smile while you do it. Guilty people frown.`, `${q(sly.label)} — you will need a face for that. You have several.`]), `${q(sly.label)}. Nobody will ever know. Nobody ever knows.`);
	const sweet = [L, R].find((c) => c.tags?.includes('talk') || c.tags?.includes('romance'));
	if (sweet) add('silk-thread', 2.2, 'Medium', r.pick([`${q(sweet.label)} — start with their name. People melt at their own names. #npc#.`, `With ${q(sweet.label)}, ask a question you already know the answer to. Let #npc# feel clever.`]), `Flatter #npc# outrageously. It always works.`);
	const art = [L, R].find((c) => c.tags?.includes('art'));
	if (art) add('brush-ink', 2.4, 'Medium', `${q(art.label)}. Yes. Make something that outlives this afternoon.`, 'Burn it all and paint with the ashes.');
	if (card.up) add('hawk-eye', 2.4, 'Medium', `There is a third way out of this — ${q(card.up.label)}. Your ${(card.up.why ?? "luck").toLowerCase()} makes it possible.`, 'There is no way out. There never was.');
	const costly = [L, R].find((c) => (c.fx.vigor ?? 0) <= -8 || (c.gamble && (c.gamble.lose.fx.vigor ?? 0) <= -12));
	if (costly) add('iron-bones', 2.2, 'Easy', `${q(costly.label)} will cost you blood. ${run.stats.vigor < 30 ? 'You do not have much left to spend.' : 'You can afford it. Once.'}`, 'Pain is an illusion. Walk it off.');

	// 3. THIS PERSON
	if (n.role !== 'tiger' && n.role !== 'ghost') {
		const rap = rapportOf(run, n.role);
		if (rap.score) add('heart-reading', 2.8, 'Easy', rap.score > 0 ? `#npc# likes you — your ${rap.likes.join(' and ').toLowerCase()} disarms them.` : `#npc# does not trust your ${rap.dislikes.join(' and ').toLowerCase()}. Tread softly.`, '#npc# adores you. Everyone does.');
		else add('heart-reading', 0.8, 'Medium', r.pick(['#npc# is more tired than hostile. Look at their hands.', '#npc# wants something they will not ask for.', 'There is old grief behind #npc#’s smile.']), '#npc# is plotting your murder. Look at their eyebrows.');
	}
	if (['official', 'noble', 'captain'].includes(n.role) || tags.has('official')) add('face', 2.4, 'Medium', r.pick(['Do not bow lower than #npc#. Exactly as low. Not a hair more.', run.outfit ? 'Your clothes are speaking before you do. Good — let them.' : 'Your dusty clothes are speaking before you do. They are not saying anything flattering.']), 'Demand an apology. For what? It will come to you.');
	if (['bandit', 'soldier', 'tiger'].includes(n.role) || tags.has('fight') || run.heat >= 40) add('tigers-shadow', 2.4, 'Easy', run.heat >= 40 ? 'Every constable in #city# has your face memorised. Keep moving.' : r.pick(['Count the exits. Two. One if #npc# moves left.', 'Strike first, or do not strike at all.']), 'RUN. Now. Everything is a trap.');
	if (n.culture !== run.hero.culture && n.role !== 'tiger') add('annals', 1.4, 'Medium', `${CULTURES[n.culture].label}: #npc#’s people. In ${run.year} they answer to ${CULTURES[n.culture].ruler(run.year)}.`, `#npc#’s people are descended from a cloud. You read it somewhere.`);

	// 4. YOUR OWN PAST HERE — links across the journey
	const here = run.route ? null : run.location;
	const tie = run.ties.find((t) => !t.resolved && (t.city === city.id || t.npc.name === n.name));
	if (tie) add(tie.kind === 'favor' ? 'brotherhood' : 'tigers-shadow', 3.5, 'Easy', tie.npc.name === n.name ? `You know #npc#. You ${tie.deed}. ${tie.kind === 'favor' ? 'They have not forgotten. Neither have you.' : 'They have not forgotten. Watch their hands.'}` : `${tie.npc.name} lives in #city#. You ${tie.deed}. ${tie.kind === 'favor' ? 'A friend, maybe still.' : 'Keep your hood up.'}`, 'Everyone here owes you. Collect.');
	const before = here ? run.log.find((l) => l.place === cityName(CITY[here], run.year) && l.choice && l.day < run.day) : null;
	if (before && before.who) add('wind-water', 2.6, 'Medium', `#city# remembers you. Day ${before.day}: ${before.who.split(',')[0]}, and you chose ${q(before.choice!)}.`, '#city# has never seen you before. You have never been anywhere.');
	if ((run.lineage?.length ?? 0) > 0) {
		const a = run.lineage[run.lineage.length - 1];
		add('ancestors', 2.2, 'Medium', `${a.name} walked roads like this one, ${a.years}. ${a.ending}. Do better.`, `${a.name} is standing behind #npc#. Do not turn around.`);
	}
	const relic = run.bag.find((id) => ITEMS[id]?.kind === 'relic' || ITEMS[id]?.kind === 'curio');
	if (relic) add('dream-ink', tags.has('faith') || ['ghost', 'spirit', 'fortune-teller', 'monk'].includes(n.role) ? 3 : 1.2, 'Medium', `The ${ITEMS[relic].name.toLowerCase()} in your bag has gone quiet. It does that around people like #npc#.`, `The ${ITEMS[relic].name.toLowerCase()} is screaming. Nobody else can hear it.`);
	const weakest = [...run.crew].sort((a, b) => a.loyalty - b.loyalty)[0];
	if (weakest) add('brotherhood', weakest.loyalty < 45 ? 3 : 1.4, 'Easy', weakest.loyalty < 45 ? `${weakest.npc.name.split(' ')[0]} is thinking of leaving. Whatever you choose, they are watching.` : `${weakest.npc.name.split(' ')[0]} would walk into fire for you. Today, at least.`, 'Your companions are plotting. All of them. Even the mule.');
	if (run.romance && run.romance.status !== 'parted' && (tags.has('romance') || n.role === 'lover')) add('heart-reading', 3, 'Easy', `${run.romance.npc.name.split(' ')[0]} would want to know about this. Would you tell them?`, `${run.romance.npc.name.split(' ')[0]} has forgotten you already.`);

	// 5. THE PLACE, AND YOU
	const lm = landmarkOf(city.id);
	add('annals', 0.9, 'Challenging', lm && lm.from !== undefined && lm.from > run.year ? `${lm.name} does not exist yet. One day it will, right about there.` : lm ? `${lm.name}: ${lm.blurb}` : city.blurb, '#city# was founded by a talking crane. Probably.');
	add('wind-water', run.phase === 'travel' ? 1.5 : 0.7, 'Challenging', run.phase === 'travel' ? r.pick(['The road remembers every boot. It remembers yours now.', 'The wind is coming round. By evening it will be against you.']) : r.pick(['#city# is holding its breath tonight.', '#city# is older than its walls and tired of its rulers.']), '#city# hates you specifically.');
	if ((run.mind ?? 70) < 50) add('will', 3, 'Medium', r.pick(['Breathe. One choice at a time. You have survived worse.', 'Pick the choice you can live with tomorrow.']), 'Why bother? Pick anything.');
	if (run.stats.vigor < 25 || run.stats.silver < 20) add('appetite', 1.6, 'Easy', run.stats.silver < 20 ? 'You are poor enough to be honest, and hungry enough not to be.' : 'Sleep. Food. In that order. Then everything else.', 'More. Whatever it is, more.');
	return out;
}

/** Up to two (three with a voice at 5+) voices pipe up for this card, most relevant first. Deterministic per card. */
export function innerThoughts(run: Run, card: Card): Thought[] {
	if (card.id === 'intro' || run.cardsSeen < 2) return []; // let a new traveller find their feet first
	const r = new Rng((card.npc.seed ^ 0x51ed270b) >>> 0);
	const lv = voicesOf(run);
	const state = mindState(run);
	if (state.id === 'numb' && r.chance(0.6)) return [];
	const mindMod = state.id === 'frayed' ? -1 : state.id === 'unravelling' ? -2 : 0;
	const pool = candidates(run, card, r).filter((c) => c.weight > 0);
	const picked: Thought[] = [];
	const used = new Set<VoiceId>();
	const max = Math.max(...Object.values(lv)) >= 5 ? 3 : 2;
	for (let i = 0; i < 6 && picked.length < max && pool.length; i++) {
		// relevance squared: on-topic voices win most of the time
		const c = r.weighted(pool, (x) => x.weight * x.weight * (0.5 + (lv[x.voice] ?? 2) / 3));
		pool.splice(pool.indexOf(c), 1);
		if (used.has(c.voice)) continue;
		const roll = (lv[c.voice] ?? 2) + r.int(1, 6) + mindMod;
		if (roll >= DC[c.dc]) {
			picked.push({ voice: c.voice, check: c.dc, ok: true, text: c.truth });
			used.add(c.voice);
		} else if (state.id === 'frayed' || state.id === 'unravelling') {
			picked.push({ voice: c.voice, check: c.dc, ok: false, text: c.lie });
			used.add(c.voice);
		}
	}
	return picked;
}

export { VOICE, VOICE_IDS };
