// Bones of the Road: where your past travellers died (or chose to stay), something of them remains.
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName, shortestDays } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import type { Grave } from '../types';
import { ch, npc, up, type Ctx, type Template } from './helpers';

const MARKER: Record<string, string> = {
	han: 'a stone tablet under a cypress',
	korean: 'a grass-covered mound with a small stone table',
	japanese: 'a mossy gorintō of five stacked stones',
	viet: 'a tiled tomb painted with lotus flowers',
	siamese: 'a small whitewashed chedi',
	malay: 'a pair of carved stone nisan under a frangipani tree',
	indian: 'a memorial stone carved with a lamp',
	persian: 'a blue-tiled stone half buried in sand',
	ottoman: 'a slender headstone topped with a carved turban',
	tibetan: 'a cairn of mani stones wrapped in prayer flags',
	steppe: 'an ovoo of stones and blue silk scarves',
	swahili: 'a coral-stone pillar tomb',
	european: 'a weathered cross with a Latin inscription',
	pacific: 'a ring of black lava stones'
};

const graveHere = (c: Ctx): Grave | undefined => (c.run.graves ?? []).find((g) => g.city === c.city.id && !c.run.flags['grave:' + g.id] && g.name !== c.run.hero.name);

export const GRAVE_T: Template[] = [
	{
		id: 'grave',
		where: 'city',
		tags: ['faith', 'loyal'],
		weight: (c) => (graveHere(c) ? 7 : 0),
		make: (c) => {
			const g = graveHere(c)!;
			const n = npc(c, 'elder', { title: g.settled ? 'Neighbour who knew them' : 'Old gravekeeper' });
			const marker = g.settled ? 'a little shrine with a lamp still burning' : MARKER[c.city.culture] ?? 'a plain stone';
			const family = c.run.lineage?.some((a) => a.name === g.name);
			const seen = { ['grave:' + g.id]: true };
			const relic = g.relic && ITEMS[g.relic] ? ITEMS[g.relic] : undefined;
			const dist = g.commission ? shortestDays(c.city.id, c.year)[g.commission.to] : undefined;
			return {
				id: 'grave',
				npc: n,
				badge: family ? '家 Your ancestor' : '✦ A traveller before you',
				text: g.settled
					? `**${n.name}** shows you ${marker}. "**${g.name}** lived here after their travels — ${g.title.toLowerCase()}. Told stories every evening. You have the same look about you."`
					: `**${n.name}** leads you to ${marker}. The name on it is **${g.name}**, a ${CULTURES[g.culture].adjective.toLowerCase()} traveller who died here in ${g.year}: *${g.title}*. ${family ? 'Your own blood.' : 'You have never met them. It feels as though you have.'}`,
				left: ch(g.settled ? 'Light the lamp and sit a while' : 'Pay your respects', { fortune: 6 }, { tags: ['faith', 'loyal'], setFlag: seen, karma: 2, text: g.lesson ? `You kneel. Somehow you know what they would tell you: *${g.lesson}.*` : 'You leave a coin and a few words. The wind takes them somewhere.' }),
				right:
					g.commission && dist !== undefined && Number.isFinite(dist) && c.run.quests.length < 4
						? ch(`Finish what they started`, {}, { tags: ['loyal'], setFlag: seen, quest: { id: 'grave-' + g.id, kind: 'contract', title: `Deliver ${g.name}’s ${g.commission.item.replace(/^an? /, '')} to ${cityName(CITY[g.commission.to], c.year)}`, giver: g.name, from: c.city.id, to: g.commission.to, due: c.run.day + Math.round(dist * 1.7 + 20), reward: { renown: 18, fortune: 10 }, text: `Years late, but delivered. Somewhere, ${g.name} can rest.` }, text: `The ${g.commission.item.replace(/^an? /, '')} was buried with them. You dig it up, wrap it in clean cloth, and promise to carry it the rest of the way.` })
						: relic
							? ch(`Take the ${relic.name.toLowerCase()} they carried`, {}, { tags: family ? ['loyal'] : ['crime'], setFlag: seen, itemAdd: [relic.id], karma: family ? 0 : -4, text: family ? 'It was always meant for the family.' : 'You feel watched the whole way back to the inn.' })
							: ch('Ask what happened', { renown: 2 }, { tags: ['talk'], setFlag: seen, text: `${n.name} tells it slowly. You listen carefully, so you don’t repeat it.` }),
				up: family ? up('Your ancestor', 'Swear to finish their journey', { renown: 10, fortune: 10 }, { tags: ['loyal', 'faith'], setFlag: seen, thought: 'ancestors-tablet', text: 'You burn incense and make the promise out loud. Behind your eyes, the Ancestors nod.' }) : undefined
			};
		}
	}
];

export const graveCities = (graves: Grave[] | undefined) => new Set((graves ?? []).map((g) => g.city));
