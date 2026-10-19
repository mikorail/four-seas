import { faithOfCity } from '#lib/data/faiths';
import { dateOf, festivalsOn } from '../calendar';
import { ch, npc, place, up, type Ctx, type Template } from './helpers';

const active = (c: Ctx) => {
	if (c.where !== 'city') return [];
	const d = dateOf(c.run, c.run.day);
	const muslimCity = faithOfCity(c.city.id, c.city.culture) === 'muslim';
	return festivalsOn(d, c.city.culture, muslimCity).filter((f) => !c.run.flags[`fest:${f.id}:${d.getUTCFullYear()}`]);
};

export const FESTIVAL_T: Template[] = [
	{
		id: 'calendar-festival',
		where: 'city',
		weight: (c) => (active(c).length ? 40 : 0),
		make: (c) => {
			const f = active(c)[0];
			const y = dateOf(c.run, c.run.day).getUTCFullYear();
			const flag = { [`fest:${f.id}:${y}`]: true };
			const n = npc(c, f.fast ? 'monk' : 'performer', { title: f.fast ? 'Neighbor' : 'Reveller' });
			const home = f.cultures.includes(c.run.hero.culture) && c.run.hero.culture !== c.city.culture;
			const own = f.fast && c.run.hero.faith === 'muslim';
			return {
				id: 'calendar-festival',
				npc: n,
				badge: f.name,
				text: `It is **${f.name}** in ${place(c)}. ${f.text}${home ? ' It is the first time in a long while that you have kept it so far from home.' : ''}${own ? ' As a Muslim, the fast is yours to keep — even on the road.' : ''}`,
				left: ch(f.fast ? 'Eat in private; you are travelling' : 'Keep to your business', f.fast ? { vigor: 2 } : { silver: 4 }, { setFlag: flag, remember: false, text: f.fast ? 'Travellers are excused. Still, you eat quickly and alone.' : 'You trade while everyone else celebrates. The prices are good.' }),
				right: ch(f.join, f.fx, { tags: f.fast ? ['faith'] : ['rest', 'art'], days: f.days, setFlag: flag, karma: f.fast ? 3 : undefined, remember: false, text: home ? 'For a day, the road feels like home.' : 'Strangers become friends for a night.' }),
				up: own ? up('Muslim', 'Fast all month and break it with the city', { vigor: -12, renown: 10 }, { tags: ['faith'], karma: 8, setFlag: flag, remember: false, text: 'Hungry days, generous nights. A whole neighbourhood adopts you.' }) : undefined
			};
		}
	}
];
