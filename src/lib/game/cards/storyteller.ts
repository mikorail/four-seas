// An evening of storytelling: pick a tale from your repertoire that suits this audience.
import { GENRE_LABEL, TASTE, taleFit } from '../tales';
import { ch, has, npc, odds, place, up, type Template } from './helpers';

export const STORY_T: Template[] = [
	{
		id: 'storyteller',
		where: 'city',
		tags: ['art', 'talk'],
		weight: (c) => ((c.run.repertoire?.length ?? 0) > 0 && !['ise', 'shimoda', 'yakutsk'].includes(c.city.id) ? 1.4 : 0),
		make: (c) => {
			const rep = c.run.repertoire!;
			const [love] = TASTE[c.city.culture];
			const sorted = [...rep].sort((a, b) => taleFit(b, c.city.culture) - taleFit(a, c.city.culture));
			const best = sorted[0];
			const fresh = rep.find((t) => t.told === 0 && t.id !== best.id) ?? sorted[1] ?? best;
			const n = npc(c, 'innkeeper', { title: 'Owner of a crowded tea house' });
			const tell = (t: typeof best) => {
				const p = odds(c, taleFit(t, c.city.culture), ['art', 'talk']);
				return ch(`Tell “${t.title}”`, {}, {
					tags: ['art', 'talk'],
					gamble: {
						p,
						win: { fx: { silver: 8 + Math.round(p * 10), renown: 8 }, text: `The room goes silent at the right moments and roars at the others. Coins rain onto your table.` },
						lose: { fx: { renown: -2 }, text: t.told ? 'Half the room has heard it before — from you, last time. Polite applause.' : 'Wrong story for this crowd. Someone starts a drinking song over your ending.' }
					},
					bump: { ['told:' + t.id]: 1 }
				});
			};
			return {
				id: 'storyteller',
				npc: n,
				badge: '📖 Storytelling',
				text: `**${n.name}**’s tea house in ${place(c)} is packed, and someone has told the crowd you are a traveller with stories. People here love a good ${GENRE_LABEL[love]} above all. Every face turns to you.`,
				left: tell(best),
				right: fresh.id !== best.id ? tell(fresh) : ch('Beg off politely', {}, { text: 'Another night, perhaps. The crowd groans.' }),
				up: has(c, 'performer') || has(c, 'poet') ? up(has(c, 'performer') ? 'Performer' : 'Poet', 'Weave all your tales into one long night', { silver: 14, renown: 16 }, { tags: ['art'], days: 1, text: 'You talk until the lamps gutter and the sun comes up. Nobody leaves.' }) : undefined
			};
		}
	}
];
