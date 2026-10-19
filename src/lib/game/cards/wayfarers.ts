// Procedural strangers: who × predicament × request × twist, filled from a seeded grammar with local colour.
// Endless one-off encounters that never quite repeat, sometimes with a rumour of a hidden road tucked inside.
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName, routesFrom } from '#lib/data/world';
import type { Choice, Outcome, Role } from '../types';
import { expand, type Rules } from '../grammar';
import { ch, has, hint, nearSecret, npc, odds, up, withCrew, type Ctx, type Template } from './helpers';

const WHO: { role: Role; look: string[] }[] = [
	{ role: 'merchant', look: ['a salt merchant with one sandal', 'a widow who runs her husband’s tea business better than he did', 'a pedlar of needles and gossip', 'a bankrupt silk dealer in his last good coat'] },
	{ role: 'monk', look: ['a deaf monk who reads lips', 'a novice who has run away from his monastery', 'a nun collecting alms for a bridge', 'a wandering ascetic smeared with ash'] },
	{ role: 'soldier', look: ['a deserter with a forged discharge', 'a one-armed veteran selling his medals', 'a very young recruit, very far from home'] },
	{ role: 'performer', look: ['a puppeteer whose puppets are better dressed than he is', 'an acrobat with a broken wrist', 'a storyteller who has lost his voice'] },
	{ role: 'elder', look: ['an old woman who claims to be a hundred and four', 'a retired magistrate who still judges everyone', 'a blind fortune-teller who is never wrong about small things'] },
	{ role: 'child', look: ['a girl selling paper flowers', 'a boy with a cricket in a cage and a plan', 'twins who finish each other’s lies'] },
	{ role: 'sailor', look: ['a sailor whose ship left without him', 'a pearl diver who holds her breath when nervous', 'a cook from a wrecked junk'] },
	{ role: 'healer', look: ['a bone-setter with enormous hands', 'a midwife on her way to a difficult birth', 'a seller of snake wine and miracle pills'] },
	{ role: 'noble', look: ['a fallen nobleman pawning his family’s scrolls', 'a princess travelling as a servant', 'a minor lord who has lost his retinue at dice'] }
];

const BASE: Rules = {
	thing: ['his grandfather’s ancestral tablet', 'a jade bangle promised to a bride', 'a ledger that could hang three men', 'a pet mynah bird that knows a secret password', 'the only key to a temple storeroom', 'a bag of seed rice for a whole village'],
	creditor: ['a moneylender with seven sons', 'the temple treasurer', 'a gang that calls itself the Lotus Brothers', 'the governor’s nephew'],
	threat: ['take his daughter as payment', 'burn the shop', 'have him flogged in the square', 'sell his boat'],
	feudobj: ['a boundary stone that moves at night', 'a well both families dug', 'a grave on the wrong side of a field', 'an insult from three generations ago'],
	cursed: ['a mirror that fogs when liars look into it', 'a sword that rattles in its scabbard at night', 'a doll that turns to face the door', 'a coin that always comes back'],
	symptom: ['brings bad dreams to whoever keeps it', 'makes milk sour in the house', 'has outlived four owners', 'whispers in a dead language'],
	family: ['her father, a magistrate', 'his mother, who has already chosen a bride', 'two powerful clans', 'a jealous guild master'],
	odd: ['a stuffed creature with too many legs', 'a box that ticks', 'a map of the moon', 'an egg the size of a man’s head', 'a letter addressed to “whoever finds this”', 'a lacquered fan with a painted battle that changes'],
	contest: ['a drinking contest', 'a riddle duel', 'arm wrestling', 'a poetry contest', 'a staring match', 'a game of dice with his own dice'],
	prophecy: ['you will cross water three times before you are safe', 'a stranger with your face is following you', 'you will be rich, then poor, then wise, in that order', 'your name will be carved in a place you have never heard of'],
	amount: ['twelve taels', 'thirty taels', 'a hundred strings of cash']
};

type Pred = { id: string; tags: Choice['tags']; text: string; left: (c: Ctx, tw: Twist) => Choice; right: (c: Ctx) => Choice; upOk?: (c: Ctx) => Choice | undefined };
type Twist = { text: string; extra: Partial<Outcome> } | null;

const PREDS: Pred[] = [
	{ id: 'lost', tags: ['mercy'], text: '#who# has lost #thing# somewhere between here and #near#, and is searching the gutters in despair.', left: (c, tw) => ch('Help search', {}, { tags: ['mercy'], days: 1, gamble: { p: odds(c, 0.55, ['mercy']), win: withTwist({ fx: { renown: 6, fortune: 4 }, text: 'You find it under a cart. #name# weeps and presses a token into your hand.' }, tw), lose: { fx: { vigor: -4 }, text: 'A day in the gutters for nothing. #name# thanks you anyway.' } } }), right: () => ch('Wish them luck', {}, { text: 'You leave them crawling under a fish stall.' }) },
	{ id: 'debt', tags: ['trade'], text: '#who# owes #amount# to #creditor#, who has promised to #threat# by sunset.', left: (c, tw) => ch('Pay part of the debt', { silver: -10 }, { tags: ['mercy', 'trade'], karma: 5, remember: { kind: 'favor', deed: 'paid off a debt for them' }, ...twistChoice(tw, 'The creditor counts it, sneers, and goes. #name# does not know how to thank you.') }), right: (c) => ch('Talk to the creditor yourself', {}, { tags: ['talk'], gamble: { p: odds(c, 0.45, ['talk']), win: { fx: { renown: 8 }, text: 'You find something the creditor would rather nobody knew. The debt is forgiven, suddenly.' }, lose: { fx: { vigor: -8 }, heat: 6, text: 'The creditor’s sons explain their position with their fists.' } } }) },
	{ id: 'feud', tags: ['talk'], text: '#who# drags you into a quarrel between two families over #feudobj#. Everyone is shouting. A knife has appeared.', left: (c, tw) => ch('Mediate', {}, { tags: ['talk', 'mercy'], gamble: { p: odds(c, 0.5, ['talk']), win: withTwist({ fx: { renown: 10 }, standing: 6, text: 'You make both sides laugh, then both sides drink. The knife goes back in its sleeve.' }, tw), lose: { fx: { renown: -4 }, text: 'Both families now hate you more than each other. Success, of a kind.' } } }), right: () => ch('Take the richer side', { silver: 10 }, { tags: ['trade', 'cruel'], karma: -4, remember: { kind: 'grudge', deed: 'took sides in their family feud' }, text: 'Money changes hands. Justice does not.' }) },
	{ id: 'cursed', tags: ['faith'], text: '#who# begs you to take #cursed# off their hands — it #symptom#.', left: (c, tw) => ch('Take it', {}, { tags: ['faith', 'gamble'], gamble: { p: odds(c, 0.5, ['faith']), win: withTwist({ fx: { fortune: 10 }, text: 'Whatever was in it likes you. It hums contentedly in your bag, then falls quiet forever.' }, tw), lose: { fx: { fortune: -10 }, text: 'You sleep badly for a week. Then you leave it in a temple, which is what you should have done.' } } }), right: () => ch('Send them to a temple', { fortune: 2 }, { tags: ['faith'], text: '"Burn incense, and do not look into it," you advise, as if you were an expert.' }) },
	{ id: 'elope', tags: ['romance'], text: '#who# and a sweetheart are running away from #family#. Riders are an hour behind them.', left: (c, tw) => ch('Hide them in your baggage', {}, { tags: ['mercy', 'romance', 'crime'], heat: 8, karma: 5, remember: { kind: 'favor', deed: 'hid them from the riders' }, ...twistChoice(tw, 'The riders search everything except the one basket that matters. Two people owe you their lives together.') }), right: () => ch('Tell the riders which way they went', { silver: 12 }, { tags: ['cruel'], karma: -8, text: 'They give you silver and look at you the way you will look at yourself later.' }) },
	{ id: 'corpse', tags: ['faith'], text: '#who# is carrying a relative’s body home to #near#, because the dead must be buried among their own.', left: (c, tw) => ch('Help carry the coffin', { vigor: -8 }, { tags: ['mercy', 'faith', 'loyal'], days: 1, karma: 6, ...twistChoice(tw, 'At the grave they bow to you as if you were family. You feel, strangely, that you are.') }), right: () => ch('Pay for a cart', { silver: -6 }, { tags: ['mercy'], karma: 3, text: 'The cart is slow, but it is better than shoulders.' }) },
	{ id: 'oddsale', tags: ['trade'], text: '#who# is selling #odd# and swears it is worth a fortune to the right buyer.', left: (c, tw) => ch('Buy it', { silver: -8 }, { tags: ['trade', 'gamble'], gamble: { p: 0.45, win: withTwist({ fx: { silver: 20, renown: 4 }, text: 'Three towns later, a collector nearly faints at the sight of it.' }, tw), lose: { fx: { fortune: -3 }, text: 'It is exactly as worthless as it looks. You keep it anyway, out of spite.' } } }), right: () => ch('Laugh and walk on', {}, { text: 'You hear them pitching it to the next stranger with exactly the same words.' }) },
	{ id: 'contest', tags: ['gamble'], text: '#who# challenges you to #contest#. The stakes: your purse against theirs. A crowd is already forming.', left: (c, tw) => ch('Accept', {}, { tags: ['gamble'], gamble: { p: odds(c, 0.5, ['gamble']), win: withTwist({ fx: { silver: 14, renown: 6 }, text: 'You win by a hair and an outrageous amount of bluff.' }, tw), lose: { fx: { silver: -12 }, text: 'You lose, graciously, which wins you more friends than winning would have.' } } }), right: () => ch('Decline with a bow', { renown: -2 }, { text: 'The crowd boos. The challenger looks relieved.' }) },
	{ id: 'prophecy', tags: ['faith'], text: '#who# stops you in the road, trembling. "I dreamt of you. #prophecy_cap#."', left: (c, tw) => ch('Ask what else they saw', {}, { tags: ['faith', 'talk'], gamble: { p: 0.55, win: withTwist({ fx: { fortune: 8 }, text: 'The rest of the dream is strangely specific — and strangely useful.' }, tw), lose: { fx: { fortune: -4 }, text: 'The rest of the dream involves you, a goat and a terrible ending. You stop listening.' } } }), right: () => ch('Thank them and move on', { fortune: 2 }, { text: 'You think about it every time you cross water.' }) },
	{ id: 'deserter', tags: ['crime'], text: '#who# begs you not to look at the uniform. "If they find me, they will hang me. I just want to go home to #near#."', left: (c, tw) => ch('Lend them your spare clothes', {}, { tags: ['mercy', 'crime'], heat: 10, karma: 6, remember: { kind: 'favor', deed: 'hid a deserter in borrowed clothes' }, ...twistChoice(tw, 'A soldier becomes a farmer in the time it takes to change a shirt.') }), right: () => ch('Turn them in for the bounty', { silver: 14 }, { tags: ['official', 'cruel'], karma: -10, text: 'The bounty is generous. The rope is new.' }) }
];

/** A twist: about one encounter in four turns out to be more than it seemed. */
function rollTwist(c: Ctx): Twist {
	if (!c.rng.chance(0.28)) return null;
	const sec = nearSecret(c, 3);
	const opts: Twist[] = [
		{ text: ' — and then they take off their hat: a member of a secret society, testing strangers. "You pass."', extra: { fx: { renown: 6 }, setFlag: { society: 'Heaven and Earth Society' } } },
		{ text: ' Later you learn they were heir to a great house, travelling in disguise. A purse of silver arrives at your inn.', extra: { fx: { silver: 14 } } },
		{ text: ' As you part, they press a dried flower into your hand. It never wilts. It might be luck.', extra: { fx: { fortune: 6 } } },
		{ text: ' They turn out to have been watching you for your rival. They tell you everything — and your rival’s pace slows.', extra: { rivalDelay: 6, fx: {} } }
	];
	if (sec) opts.push({ text: ` In thanks, they tell you something only locals know: ${sec.hint}. That is the way they call **${sec.name}**.`, extra: { fx: { renown: 2 }, setFlag: { ['hint:' + sec.id]: 1 } } });
	if (sec) opts.push({ text: ` In thanks, they draw a road in the dust you have never seen on any map — ${sec.hint}.`, extra: { fx: {}, setFlag: { ['secret:' + sec.id]: true } } });
	return c.rng.pick(opts);
}

function withTwist(o: Outcome, tw: Twist): Outcome {
	if (!tw) return o;
	return { ...o, ...tw.extra, fx: { ...o.fx, ...tw.extra.fx }, text: (o.text ?? '') + tw.text };
}
function twistChoice(tw: Twist, text: string): Partial<Choice> {
	if (!tw) return { text };
	const { fx: _fx, ...rest } = tw.extra;
	return { ...(rest as Partial<Choice>), text: text + tw.text };
}

function makeWayfarer(c: Ctx) {
	const who = c.rng.pick(WHO);
	const look = c.rng.pick(who.look);
	const n = npc(c, who.role, { title: look[0].toUpperCase() + look.slice(1).replace(/^an? /, '') });
	const near = routesFrom(c.city.id, c.year).map((r) => r.to);
	const nearName = near.length ? cityName(CITY[c.rng.pick(near)], c.year) : cityName(c.city, c.year);
	const pred = c.rng.pick(PREDS);
	const tw = rollTwist(c);
	const rules: Rules = { ...BASE, who: [`**${n.name}**, ${look}`], name: [n.name.split(' ')[0]], near: [nearName], food: [CULTURES[c.city.culture].food] };
	rules.prophecy_cap = BASE.prophecy.map((p) => p[0].toUpperCase() + p.slice(1));
	const fill = (s?: string) => (s ? expand(c.rng, s, rules) : s);
	const fixChoice = (chc: Choice): Choice => ({
		...chc,
		label: fill(chc.label)!,
		text: fill(chc.text),
		gamble: chc.gamble ? { ...chc.gamble, win: { ...chc.gamble.win, text: fill(chc.gamble.win.text) }, lose: { ...chc.gamble.lose, text: fill(chc.gamble.lose.text) } } : undefined
	});
	const left = fixChoice(pred.left(c, tw));
	const right = fixChoice(pred.right(c));
	const upC = has(c, 'silver-tongue') && pred.id !== 'contest' ? up('Silver Tongue', 'Talk your way to the best of both', { renown: 6, silver: 4 }, { tags: ['talk'], text: fill('Somehow everyone leaves happy, including you, especially you.') }) : withCrew(c, 'bodyguard') && (pred.id === 'debt' || pred.id === 'feud') ? up('Bodyguard', 'Let your bodyguard stand very close to the trouble', { renown: 6 }, { tags: ['fight'], text: 'Nobody wants to argue with that much shoulder. The problem goes away.' }) : undefined;
	return { id: 'wayfarer', npc: n, text: fill(pred.text)!, left, right, up: upC };
}

export const WAYFARER_T: Template[] = [
	{ id: 'wayfarer', where: 'city', tags: [], weight: 2.2, make: makeWayfarer },
	{ id: 'wayfarer-road', where: 'travel', tags: [], weight: 1.8, make: (c) => ({ ...makeWayfarer(c), id: 'wayfarer-road' }) }
];
