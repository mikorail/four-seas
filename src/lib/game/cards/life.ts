// Letters that come back, homes for sale, and the years catching up with you.
import { CITY, cityName } from '#lib/data/world';
import { CULTURES } from '#lib/data/cultures';
import { ITEMS } from '#lib/data/items';
import { ageOf, atHome, HOME_PRICE, lettersDue, lifeStage } from '../life';
import { ch, nearSecret, npc, place, skill, up, type Ctx, type Template } from './helpers';

const GIFTS = ['rations', 'medicine', 'charm', 'lantern', 'gift'];

export const LIFE_T: Template[] = [
	{
		id: 'letter-reply',
		where: 'any',
		tags: ['talk'],
		weight: (c) => (lettersDue(c.run).length ? 12 : 0),
		make: (c) => {
			const l = lettersDue(c.run)[0];
			const read = { ['read:' + l.id]: true };
			const n = npc(c, 'child', { title: 'Post runner' });
			const from = l.to;
			const here = cityName(CITY[l.city] ?? c.city, c.year);
			const sec = c.rng.chance(0.35) ? nearSecret(c, 4) : undefined;
			const gift = c.rng.pick(GIFTS.filter((id) => ITEMS[id]));
			const canPropose = l.kind === 'sweetheart' && c.run.romance?.status === 'courting' && (c.run.romance.affection ?? 0) >= 60;
			const rivalP = l.kind === 'rival' ? (c.run.people ?? []).find((x) => x.id === l.toId || x.npc.name === from) : undefined;
			const body =
				l.kind === 'sweetheart'
					? canPropose
						? `“Every evening I walk to the harbour in ${here} and watch for your sails. Inside the envelope is a red cord. When your road ends, come home and marry me.”`
						: `“Every evening I walk to the harbour in ${here} and pretend your ship is the next one. Come back to me.”`
					: l.kind === 'rival'
						? `“Your letter caught me at the relay post in ${here}. My horse is faster than yours, my maps are better, and the tea here is terrible. Do not fall behind.”`
						: l.kind === 'patron'
							? `“We have your report. Make haste, and trust no one who asks about what you carry.”`
							: l.kind === 'family'
								? `“The family is well. The roof leaks. Grandmother says you were always the restless one, and she is proud of you.”`
								: c.rng.pick([
										`“I read your letter three times. ${here} is quiet without you, and I enclosed a few coins and a warning about your rival’s route.”`,
										`“You will not believe what happened in ${here} after you left. If your road brings you back this way, I have a small errand that pays well.”`,
										`“Nothing much changes here, except me, a little. Write again.”`
									]);
			const leftChoice =
				l.kind === 'sweetheart'
					? ch('Read it twice and keep it close', { fortune: 4 }, { tags: ['rest', 'romance'], setFlag: read, romance: { affection: 10 }, ...(sec ? { bump: { ['hint:' + sec.id]: 1 } } : {}), text: 'Some letters weigh nothing and carry everything.' })
					: l.kind === 'rival'
						? ch('Write back with a fair warning about the roads ahead', { fortune: 6, vigor: 4 }, { tags: ['loyal', 'talk'], setFlag: read, rivalDelay: -1, person: rivalP ? { profile: rivalP, bond: 18, stage: rivalP.bond + 18 >= 25 ? 'friend' : undefined } : undefined, text: 'Even rivals share word of washed-out bridges.' })
						: l.kind === 'friend' && c.run.stats.silver < 35
							? ch('Accept the emergency silver and rival tip inside', { silver: 12, fortune: 4 }, { tags: ['loyal'], setFlag: read, rivalDelay: 4, text: 'A true friend knows when your purse is light and watches the road for you.' })
							: ch('Read it twice and head the warning about your rival', { fortune: 4 }, { tags: ['rest', 'loyal'], setFlag: read, rivalDelay: l.kind === 'friend' ? 4 : 0, ...(sec ? { bump: { ['hint:' + sec.id]: 1 } } : {}), text: 'Some letters weigh nothing and carry everything.' });
			const rightChoice =
				canPropose
					? ch('Tie the red cord to your wrist and accept their vow', { fortune: 8, renown: 4 }, { tags: ['romance', 'loyal'], setFlag: read, romance: { affection: 15, status: 'betrothed' }, text: `Across a hundred leagues of road, you and ${from} are betrothed.` })
					: l.kind === 'rival'
						? ch('Send back a friendly wager on the finish line', { renown: 6 }, { tags: ['talk'], setFlag: read, person: rivalP ? { profile: rivalP, bond: 10 } : undefined, text: 'A race is better when the other runner is worth beating.' })
						: l.kind === 'friend' && c.run.quests.length < 4 && l.city !== c.city.id
							? ch(`Take on ${from.split(' ')[0]}’s errand in ${here}`, { renown: 3 }, {
									tags: ['loyal'],
									setFlag: read,
									quest: {
										id: 'letter-q-' + l.id,
										kind: 'message',
										title: `Bring word to ${from} in ${here}`,
										giver: from,
										from: c.city.id,
										to: l.city,
										due: c.run.day + 160,
										reward: { silver: 18, renown: 8 },
										text: `${from} meets you at the gate with a warm meal and a heavy purse.`
									},
									text: `You mark ${here} on your map.`
								})
							: ch('Open the parcel that came with it', {}, { tags: ['loyal'], setFlag: read, itemAdd: [gift], text: `Wrapped in their handwriting: ${ITEMS[gift].name.toLowerCase()}.` });
			return {
				id: 'letter-reply',
				npc: n,
				badge: '✉️ Letter',
				text: `**${n.name}** runs up, out of breath, with a letter that has followed you across ${c.rng.int(2, 6)} cities. It is from **${from}** in ${here}: ${body}${sec ? ` In the margin, almost as an afterthought: “a carter here swears that ${sec.hint}.”` : ''}`,
				left: leftChoice,
				right: rightChoice,
				up: skill(c, 'creativity') >= 3 ? up(`Creativity ${skill(c, 'creativity')}`, 'Write back with a poem that will make them laugh', { renown: 4, fortune: 6 }, { tags: ['art'], setFlag: read, text: 'You can almost hear them laughing from here.' }) : undefined
			};
		}
	},
	{
		id: 'home-for-sale',
		where: 'city',
		tags: ['trade', 'rest'],
		weight: (c) => (!c.run.home && c.run.stats.silver > HOME_PRICE + 5 && c.run.visited.length >= 3 ? 1.1 : 0),
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Widow selling her house' });
			const cul = CULTURES[c.city.culture];
			const house = cul.id === 'japanese' ? 'a little machiya with a garden the size of a tatami mat' : cul.id === 'korean' ? 'a hanok with a courtyard and three persimmon trees' : cul.id === 'malay' ? 'a stilt house over the river with a veranda for the evenings' : cul.id === 'ottoman' || cul.id === 'persian' ? 'a whitewashed house with a fountain in the courtyard' : cul.id === 'european' ? 'a narrow house with a blue door and a leaking roof' : 'a courtyard house with a well and a quince tree';
			return {
				id: 'home-for-sale',
				npc: n,
				badge: '🏡 A home?',
				text: `**${n.name}** is moving in with her daughter. She shows you ${house}, in ${place(c)}. "${HOME_PRICE} silver. It needs someone who will come back to it."`,
				left: ch(`Buy it (${HOME_PRICE} silver)`, {}, { tags: ['trade', 'rest'], setFlag: { buyHome: true }, text: 'Keys, a deed, a cat that apparently comes with the house. You have somewhere to come back to now.' }),
				right: ch('Not yet — the road is still calling', {}, { text: 'She nods. "The road always calls. Until it doesn’t."' })
			};
		}
	},
	{
		id: 'home-life',
		where: 'city',
		tags: ['rest', 'loyal'],
		weight: (c) => (atHome(c.run) && !c.run.flags['homecard:' + c.run.flags.stay] ? 6 : 0),
		make: (c) => {
			const n = npc(c, 'child', { title: 'Neighbour’s child' });
			const spouse = c.run.romance?.status === 'married' ? c.run.romance.npc.name : null;
			return {
				id: 'home-life',
				npc: n,
				badge: '🏡 Home',
				text: `Home, in ${place(c)}. ${spouse ? `**${spouse}** is in the garden.` : 'The cat is on your bed, offended you were gone.'} **${n.name}** from next door has been watering your plants, mostly. "Are you staying this time?"`,
				left: ch('Stay a few days, fix the roof', { vigor: 12, fortune: 6 }, { tags: ['rest', 'loyal'], days: 3, setFlag: { ['homecard:' + c.run.flags.stay]: true }, text: 'Hammer, tiles, a long nap, a longer dinner. You feel your shoulders come down for the first time in months.' }),
				right: ch('Pay the child and leave something in the stash', { silver: -2 }, { tags: ['mercy'], setFlag: { ['homecard:' + c.run.flags.stay]: true }, text: 'They take the coin very seriously. You trust them with your house.' })
			};
		}
	},
	{
		id: 'birthday',
		where: 'any',
		tags: ['rest'],
		weight: (c) => {
			const a = ageOf(c.run);
			return !c.run.flags['bday:' + a] && c.run.day > 300 && c.run.day % 365 < 40 ? 4 : 0;
		},
		make: (c) => {
			const a = ageOf(c.run);
			const stage = lifeStage(c.run);
			const n = npc(c, c.run.crew[0]?.npc.role ?? 'innkeeper', c.run.crew[0] ? { name: c.run.crew[0].npc.name, culture: c.run.crew[0].npc.culture, gender: c.run.crew[0].npc.gender, title: 'Your companion' } : {});
			return {
				id: 'birthday',
				npc: n,
				badge: `🎂 ${a}`,
				text: `You realise, somewhere on the road, that you are **${a}** now. ${stage === 'elder' || stage === 'venerable' ? 'Your knees noticed before you did.' : stage === 'young' ? 'Old enough to be trusted with this; young enough to think you are immortal.' : 'Halfway, maybe. Halfway to what, you are not sure.'} **${n.name}** has found a peach and stuck a candle in it.`,
				left: ch('Make a wish', { fortune: 8 }, { tags: ['rest', 'faith'], setFlag: { ['bday:' + a]: true }, text: 'You do not say it out loud. That is how wishes work.' }),
				right: ch('Write down everything you have learned this year', { renown: 4 }, { tags: ['art'], setFlag: { ['bday:' + a]: true }, text: 'Two pages. Half of it about roads, half about people. The second half is better.' })
			};
		}
	}
];
