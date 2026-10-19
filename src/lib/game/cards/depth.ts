import { CULTURES } from '#lib/data/cultures';
import { VENTURES, ventureFor } from '../ventures';
import { ch, npc, place, standingHere, up, type Template } from './helpers';

export const DEPTH_T: Template[] = [
	{
		id: 'shipwright',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (c.run.ventures.length >= 4 ? 0 : 0.9 + c.run.treasury / 80 + (c.run.hero.profession === 'merchant' ? 1 : 0)),
		make: (c) => {
			const kind = ventureFor(c.city.id, c.year);
			const def = VENTURES[kind];
			const n = npc(c, c.city.port ? 'captain' : 'merchant', { title: c.city.port ? 'Shipwright' : 'Caravan master' });
			const cheap = standingHere(c) >= 25;
			const price = Math.round(def.price * (cheap ? 0.8 : 1));
			const fromTreasury = c.run.treasury >= price;
			return {
				id: 'shipwright',
				npc: n,
				badge: 'Venture',
				text: `${n.name} has a ${def.name.toLowerCase()} for sale in ${place(c)}: ${def.desc} "${price} silver${cheap ? ' — a friend’s price' : ''}. She’ll earn it back in a season."`,
				left: ch('Not today', {}),
				right: fromTreasury
					? ch(`Buy it from your treasury (${price} taels)`, {}, { tags: ['trade'], treasury: -price, venture: kind, remember: false })
					: ch(`Buy it (${price} silver)`, { silver: -price }, { tags: ['trade'], venture: kind, remember: false })
			};
		}
	},
	{
		id: 'merchant-prince',
		where: 'city',
		once: true,
		weight: (c) => (c.run.treasury >= 300 && c.run.ventures.length >= 2 ? 6 : 0),
		make: (c) => {
			const n = npc(c, 'noble', { title: 'Guild master' });
			return {
				id: 'merchant-prince',
				npc: n,
				badge: 'Venture',
				text: `The merchants’ guild of ${place(c)} invites you to dinner. ${n.name} raises a cup: "With **${c.run.treasury} taels** and ${c.run.ventures.length} ships, you could stop wandering and rule this harbor. Settle here?"`,
				left: ch('The road is not finished with me', { renown: 6 }, { remember: false }),
				right: ch('Become a Merchant Prince', { renown: 10 }, { retire: 'prince', remember: false })
			};
		}
	},
	{
		id: 'regional-honor',
		where: 'city',
		weight: (c) => (standingHere(c) >= 50 && !c.run.flags['honor:' + c.city.culture] ? 5 : 0),
		make: (c) => {
			const cul = CULTURES[c.city.culture];
			const n = npc(c, 'official');
			return {
				id: 'regional-honor',
				npc: n,
				badge: 'Standing',
				text: `Your name is spoken warmly across ${cul.homeland}. ${n.name} brings a scroll from ${cul.ruler(c.year)}: a safe-conduct pass and an honorary rank.`,
				left: ch('Accept the safe-conduct', { renown: 6 }, { heat: -40, setFlag: { ['honor:' + c.city.culture]: true }, remember: false, text: 'Constables bow now, instead of asking questions.' }),
				right: ch('Ask for silver instead', { silver: 16 }, { setFlag: { ['honor:' + c.city.culture]: true }, remember: false, text: 'Practical. The court is faintly disappointed.' })
			};
		}
	},
	{
		id: 'regional-hostility',
		where: 'city',
		weight: (c) => (standingHere(c) <= -40 ? 3 : 0),
		make: (c) => {
			const cul = CULTURES[c.city.culture];
			const n = npc(c, 'soldier', { title: 'Gate captain' });
			return {
				id: 'regional-hostility',
				npc: n,
				badge: 'Standing',
				text: `${n.name} recognises you at the gate of ${place(c)}. "Half of ${cul.homeland} knows what you did. You will pay double here — or not enter at all."`,
				left: ch('Pay the "foreigner’s toll"', { silver: -12 }, { remember: false }),
				right: ch('Make a public apology and a donation', { silver: -8, renown: -4 }, { standing: 20, karma: 3, remember: false, text: 'A humiliating speech in the square. It helps, a little.' }),
				up: c.run.hero.culture === c.city.culture ? up('Local', 'Remind him you were born here', {}, { standing: 10, remember: false, text: '"Prodigal child," he grunts, and waves you in.' }) : undefined
			};
		}
	}
];
