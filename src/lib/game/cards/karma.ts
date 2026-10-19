import { CITY, SECRETS, cityName, type Good } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import type { Card, Choice, Companion, Tie } from '../types';
import { bagFree, ch, has, npc, odds, place, up, type Ctx, type Template } from './helpers';

const due = (c: Ctx, kind: Tie['kind']) => c.run.ties.filter((t) => t.kind === kind && !t.resolved && c.run.day - t.day >= 6 && t.city !== c.city.id);
const ago = (c: Ctx, t: Tie) => {
	const d = c.run.day - t.day;
	return d < 14 ? `${d} days ago` : d < 60 ? `${Math.round(d / 7)} weeks ago` : `${Math.round(d / 30)} months ago`;
};
const where = (c: Ctx, t: Tie) => (CITY[t.city] ? cityName(CITY[t.city], c.year) : 'the road');
const inTrouble = (c: Ctx) => c.run.stats.vigor < 30 || c.run.heat >= 45 || c.run.stats.silver < 20;

function favorCard(c: Ctx, t: Tie): Card {
	const n = { ...t.npc };
	const opener = `**${n.name}**! You ${t.deed} in **${where(c, t)}**, ${ago(c, t)}. They have not forgotten.`;
	const decline: Choice = ch('"It was nothing. Keep it."', { renown: 4 }, { karma: 4, tieResolve: t.id, remember: false, text: 'They bow very low. Some debts are better left unpaid.' });

	// An old flame finds you again.
	if (n.role === 'lover' && c.run.crew.length < 3 && !c.run.crew.some((m) => m.role === 'companion')) {
		const love: Companion = { id: `companion-${n.seed}`, npc: { ...n, title: 'Beloved' }, role: 'companion', wage: 0, loyalty: 95, joinedDay: c.run.day };
		return {
			id: 'tie-favor',
			npc: n,
			badge: 'Remembered',
			text: `${opener} They followed the stories of a certain traveller all the way here. "Three days was not enough. I sold the house. Take me with you."`,
			left: ch('"Come with me."', { vigor: 10 }, { crewAdd: love, tieResolve: t.id, remember: false, tags: ['romance'], text: 'This time, nobody leaves a letter.' }),
			right: ch('"The road is no place for us."', {}, { tieResolve: t.id, remember: false, text: 'A long embrace in the street. Then they let you go, again.' })
		};
	}
	// A beggar you were kind to was more than a beggar.
	if (n.title === 'Beggar') {
		return {
			id: 'tie-favor',
			npc: { ...n, role: 'spirit', title: 'Immortal in disguise' },
			badge: 'Remembered',
			text: `${opener} The rags are gone; the beggar glows faintly and smells of peaches. "Few share their silver with the poor. Take this, mortal."`,
			left: ch('Accept the Immortal’s gift', { fortune: 16 }, { itemAdd: [c.rng.pick(['fox-mask', 'dragon-scale', 'ghost-bell', 'naga-pearl'])], tieResolve: t.id, remember: false, text: 'When you look up, there is only a crane, flying west.' }),
			right: decline
		};
	}

	if (inTrouble(c) && c.rng.chance(0.7)) {
		if (c.run.heat >= 45)
			return {
				id: 'tie-favor',
				npc: n,
				badge: 'Remembered',
				text: `${opener} "Constables are asking for you at every inn. Come — my cousin has a cellar, and the watch captain owes me money."`,
				left: ch('Hide with them', { vigor: 4 }, { heat: -35, days: 1, tieResolve: t.id, remember: false, text: 'Two nights among rice sacks. The hunt moves on without you.' }),
				right: decline
			};
		if (c.run.stats.vigor < 30)
			return {
				id: 'tie-favor',
				npc: n,
				badge: 'Remembered',
				text: `${opener} They find you grey-faced and shaking. "You helped me once. Now lie down, and don’t argue."`,
				left: ch('Let them nurse you', { vigor: 20 }, { days: 2, tieResolve: t.id, remember: false, text: 'Broth, blankets and stubbornness. You are on your feet in two days.' }),
				right: decline
			};
		return {
			id: 'tie-favor',
			npc: n,
			badge: 'Remembered',
			text: `${opener} They notice your thin purse at once. "I have done well since then. Let me return the favor — with interest."`,
			left: ch('Accept the purse', { silver: 18 }, { tieResolve: t.id, remember: false, text: 'Heavier than you expected. Kindness compounds.' }),
			right: decline
		};
	}

	const roll = c.rng.next();
	// Information: the most useful thing a friend can give.
	if (roll < 0.4) {
		const goods: Good[] = ['silk', 'tea', 'pepper', 'porcelain', 'nutmeg', 'coffee', 'cotton', 'gemstones'];
		const options: { text: string; choice: Partial<Choice> }[] = [
			{ text: 'a smugglers’ current that shaves days off any voyage', choice: { setFlag: { tip: 1 } } },
			{ text: `that **${goodName(c.rng.pick(goods))}** is about to be scarce everywhere — buy now, sell far`, choice: {} },
			...(c.run.rival && !c.run.rival.arrived ? [{ text: `that your rival **${c.run.rival.npc.name}** is laid up with fever three cities back`, choice: { rivalDelay: 8 } }] : []),
			...(c.run.heat > 15 ? [{ text: 'which magistrates are hunting you, and which roads to avoid', choice: { heat: -20 } }] : []),
			...SECRETS.filter((x) => !c.run.flags['secret:' + x.id] && !['shambhala', 'penglai', 'gold-island', 'waqwaq'].includes(x.id)).slice(0, 1).map((x) => ({ text: `the secret of **${x.name}** — ${x.hint}`, choice: { setFlag: { ['secret:' + x.id]: true } } })),
			{ text: 'where a dead pirate buried his silver', choice: { setFlag: { treasure: c.rng.pick(Object.keys(CITY).filter((id) => id !== c.city.id && !CITY[id].secret)) } } }
		];
		const o = c.rng.pick(options);
		const g = /\*\*(\w[\w ]*)\*\* is about to/.exec(o.text)?.[1];
		const choice: Partial<Choice> = g ? { setFlag: { ['boom:' + g]: true, ['boomUntil:' + g]: c.run.day + 45 } } : o.choice;
		const treasureCity = choice.setFlag?.treasure ? cityName(CITY[String(choice.setFlag.treasure)], c.year) : null;
		return {
			id: 'tie-favor',
			npc: n,
			badge: 'Remembered',
			text: `${opener} They lean close and lower their voice: they know ${o.text}${treasureCity ? ` — in **${treasureCity}**` : ''}.`,
			left: ch('Listen carefully', { renown: 2 }, { ...choice, tieResolve: t.id, remember: false, text: treasureCity ? `Treasure waits in ${treasureCity}.` : 'You write it down before you forget a word.' }),
			right: decline
		};
	}
	// Joining you on the road.
	if (roll < 0.6 && c.run.crew.length < 3) {
		const role = c.rng.pick(['guide', 'cook', 'bodyguard', 'navigator'] as const);
		const comp: Companion = { id: `${role}-${n.seed}`, npc: { ...n, title: role[0].toUpperCase() + role.slice(1) }, role, wage: 0, loyalty: 90, joinedDay: c.run.day };
		return {
			id: 'tie-favor',
			npc: n,
			badge: 'Remembered',
			text: `${opener} "I have nothing to give but my hands. Let me travel with you as your **${role}** — no wages. I owe you that much."`,
			left: ch('Welcome them aboard', {}, { crewAdd: comp, tieResolve: t.id, remember: false, text: `${n.name} shoulders your heaviest bag without being asked.` }),
			right: decline
		};
	}
	// A gift.
	const pool = ['medicine', 'charm', 'credit', 'lantern', 'rations', 'sword', 'gift', 'finery', ...(c.run.karma >= 40 ? ['dragon-scale', 'ghost-bell'] : [])];
	const item = c.rng.pick(pool);
	return {
		id: 'tie-favor',
		npc: n,
		badge: 'Remembered',
		text: `${opener} They press a parcel into your hands — **${ITEMS[item].glyph} ${ITEMS[item].name}**. "For the road. Don’t you dare refuse."`,
		left: ch('Accept the gift', {}, { itemAdd: [item], tieResolve: t.id, remember: false, text: bagFree(c) > 0 ? 'Wrapped in their best cloth, too.' : 'Your bag is full — you will have to make room.' }),
		right: decline
	};
}

function goodName(g: Good) {
	return g;
}

function grudgeCard(c: Ctx, t: Tie): Card {
	const n = { ...t.npc };
	const opener = `**${n.name}** — the one you ${t.deed} in **${where(c, t)}**, ${ago(c, t)}.`;
	const amends: Choice = ch('Apologize and make amends', { silver: -10 }, { karma: 8, tieResolve: t.id, remember: false, text: 'Silver will not fix it. But it is a start, and they take it.' });
	const roll = c.rng.next();
	if (roll < 0.35)
		return {
			id: 'tie-grudge',
			npc: { ...n, title: 'Old enemy' },
			badge: 'Remembered',
			text: `${opener} They have hired three thugs, and they are standing in your way. "I told you I would find you."`,
			left: amends,
			right: ch('Fight your way through', {}, { tags: ['fight'], tieResolve: t.id, remember: false, gamble: { p: odds(c, 0.45, ['fight']), win: { fx: { renown: 6, vigor: -6 }, text: 'They scatter. Somehow you feel worse, not better.' }, lose: { fx: { vigor: -18, silver: -8 }, text: 'Paid back, with interest, in bruises.' } } }),
			up: has(c, 'silver-tongue') || has(c, 'envoy') ? up('Silver tongue', 'Talk them down', { renown: 3 }, { karma: 5, tieResolve: t.id, remember: false, text: 'An hour of talk. They leave without a fight — and without forgiving you.' }) : undefined
		};
	if (roll < 0.65)
		return {
			id: 'tie-grudge',
			npc: { ...n, title: 'Informer' },
			badge: 'Remembered',
			text: `${opener} You spot them leaving the magistrate’s office in ${place(c)}, smiling. Your description is now on every gate.`,
			left: amends,
			right: ch('Leave town quietly', {}, { heat: 25, tieResolve: t.id, remember: false, text: 'You keep your head down. Constables read your description aloud.' })
		};
	const victim = c.run.bag.find((id) => ITEMS[id]?.kind !== 'relic');
	return {
		id: 'tie-grudge',
		npc: { ...n, title: 'Old enemy' },
		badge: 'Remembered',
		text: `${opener} By the time you notice them in the crowd, ${victim ? `your **${ITEMS[victim].name.toLowerCase()}**` : 'a handful of your silver'} is already gone.`,
		left: amends,
		right: ch('Shrug it off', {}, { tieResolve: t.id, remember: false, ...(victim ? { itemRemove: [victim] } : {}), fx: victim ? {} : { silver: -10 }, text: 'Petty, but fair. You did start it.' })
	};
}

export const KARMA_T: Template[] = [
	{
		id: 'tie-favor',
		where: 'any',
		weight: (c) => (due(c, 'favor').length ? 2.2 + (inTrouble(c) ? 2.5 : 0) + Math.max(0, c.run.karma) / 40 : 0),
		make: (c) => favorCard(c, due(c, 'favor').sort((a, b) => a.day - b.day)[0])
	},
	{
		id: 'tie-grudge',
		where: 'any',
		weight: (c) => (due(c, 'grudge').length ? 1.8 + Math.max(0, -c.run.karma) / 30 : 0),
		make: (c) => grudgeCard(c, due(c, 'grudge').sort((a, b) => a.day - b.day)[0])
	},
	{
		id: 'beggar',
		where: 'city',
		weight: 1.3,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Beggar' });
			return {
				id: 'beggar',
				npc: n,
				text: `By the gate of ${place(c)}, ${n.name} sits in the dust with a chipped bowl. Everyone else walks past without looking.`,
				left: ch('Walk past', {}, { remember: false }),
				right: ch('Share your silver and a meal', { silver: -3, fortune: 4 }, { tags: ['mercy'], remember: { kind: 'favor', deed: 'shared your silver and a meal at the gate' }, text: 'They eat slowly and watch you with unusually bright eyes.' })
			};
		}
	},
	{
		id: 'karma-high',
		where: 'city',
		weight: (c) => (c.run.karma >= 35 ? 1.4 : 0),
		make: (c) => {
			const n = npc(c, 'innkeeper');
			return {
				id: 'karma-high',
				npc: n,
				badge: 'Merit',
				text: `Word of your kindness has travelled ahead of you. ${n.name} refuses your silver at the door: "The traveller who helps strangers sleeps here free."`,
				left: ch('Accept with thanks', { vigor: 12 }, { days: 1, remember: false, text: 'Best room, hot bath, and a crowd who want to hear your stories.' }),
				right: ch('Insist on paying', { silver: -5, renown: 6 }, { karma: 3, remember: false, text: 'They take it, then slip it back into your bag while you sleep.' })
			};
		}
	},
	{
		id: 'karma-low',
		where: 'city',
		weight: (c) => (c.run.karma <= -35 ? 1.6 : 0),
		make: (c) => {
			const n = npc(c, 'monk');
			return {
				id: 'karma-low',
				npc: n,
				badge: 'Merit',
				text: `Mothers pull their children out of your path. ${n.name} stops you gently: "Your deeds walk a few steps ahead of you, traveller. Would you like them to walk differently?"`,
				left: ch('Brush past', { renown: -4 }, { remember: false, text: 'An old woman spits as you go by.' }),
				right: ch('Give alms and do penance', { silver: -12, vigor: -4 }, { tags: ['faith'], karma: 18, days: 1, remember: false, text: 'A day sweeping temple steps. The weight on your shoulders eases, a little.' })
			};
		}
	}
];
