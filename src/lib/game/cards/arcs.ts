import { CITIES, CITY, cityExists, cityName } from '#lib/data/world';
import { companion } from './city';
import { between, carrying, ch, has, inCulture, npc, odds, place, stage, up, nearSecret, withCrew, type Ctx, type Template } from './helpers';

const target = (c: Ctx, key: string) => String(c.run.flags[key] ?? '');
const cityLabel = (c: Ctx, id: string) => (CITY[id] ? cityName(CITY[id], c.year) : id);

function pickTarget(c: Ctx, pred: (id: string) => boolean) {
	const pool = CITIES.filter((x) => cityExists(x, c.year) && x.id !== c.city.id && pred(x.id));
	return pool.length ? c.rng.pick(pool).id : c.run.destination;
}

export const ARCS: Template[] = [
	// ===== the rival courier =====
	{
		id: 'rival',
		where: 'any',
		weight: (c) => (Number(c.run.flags.rivalMeet ?? 0) < 3 ? 1.6 : 0),
		when: (c) => !!c.run.rival && !c.run.rival.arrived && !c.run.delivered && c.run.day > 4,
		make: (c) => {
			const r = c.run.rival!;
			const meet = Number(c.run.flags.rivalMeet ?? 0);
			const n = r.npc;
			const ahead = r.arrive - c.run.day;
			const existing = (c.run.people ?? []).find((x) => x.id === `rival-${n.seed}` || x.npc.name === n.name);
			const profile = existing ?? {
				id: `rival-${n.seed}`,
				npc: n,
				city: c.city.id,
				venue: 'inn',
				traits: ['quick', 'silver-tongue'],
				likes: ['talk', 'sea'],
				dislikes: ['cruel'],
				bio: `Bound for ${cityLabel(c, c.run.destination)} on the same commission.`,
				bond: 0,
				stage: 'rival' as const,
				met: c.run.day,
				last: c.run.day
			};
			const base = { id: 'rival', npc: n, badge: 'Rival' } as const;
			if (meet === 0)
				return {
					...base,
					text: `Across the room, a traveller with the seal of a rival court raises a cup. "${n.name}. Also bound for ${cityLabel(c, c.run.destination)}. May the best courier win." Rumor says they arrive in about ${ahead} days.`,
					left: ch('Toast to fair play', { fortune: 6, renown: 3 }, { setFlag: { rivalMeet: 1 }, person: { profile, bond: 15 }, text: 'You drink together. You almost like them.' }),
					right: ch('Spike their drink', { fortune: -6 }, { tags: ['crime', 'cruel'], heat: 12, rivalDelay: 8, setFlag: { rivalMeet: 1 }, person: { profile, bond: -25, stage: 'rival' }, text: `${n.name} sleeps for two days. Oops.` })
				};
			if (meet === 1)
				return {
					...base,
					text: `Your ${c.where === 'travel' ? 'captain' : 'innkeeper'} confesses: ${n.name} paid him to delay you. He offers to un-confess, for a price.`,
					left: ch('Pay him double', { silver: -10 }, { setFlag: { rivalMeet: 2 }, person: { profile, bond: -5 }, text: 'Loyalty is a market like any other.' }),
					right: ch('Confront the rival', {}, { tags: ['fight'], setFlag: { rivalMeet: 2 }, person: { profile, bond: -15, stage: 'rival' }, gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 10 }, text: `${n.name} limps away, delayed.`, days: 0 }, lose: { fx: { vigor: -12 }, days: 2, text: 'You lose the fight and two days.' } }, rivalDelay: 4 }),
					up: withCrew(c, 'thief') ? up('Cat burglar', 'Steal their route maps', {}, { setFlag: { rivalMeet: 2 }, rivalDelay: 12, tags: ['crime'], heat: 8, person: { profile, bond: -20, stage: 'rival' }, text: 'Without maps, they will wander for days.' }) : undefined
				};
			return {
				...base,
				text: `You find ${n.name} by the roadside, robbed and feverish, their commission scattered in the mud. "Go on," they rasp. "You've won."`,
				left: ch('Leave them', { fortune: -12 }, { tags: ['cruel'], setFlag: { rivalMeet: 3 }, rivalDelay: 15, person: { profile, bond: -30, stage: 'rival' }, text: 'You win. It tastes of mud.' }),
				right: ch('Help them up', { vigor: -6, fortune: 14, renown: 8 }, { tags: ['mercy'], setFlag: { rivalMeet: 3, rivalFriend: true }, days: 1, person: { profile, bond: 35, stage: 'friend' }, text: '"Strange courier," they say. "Thank you. I will remember."' }),
				up: carrying(c, 'medicine') ? up('Medicine chest', 'Treat their fever', { fortune: 16, renown: 10 }, { itemRemove: ['medicine'], setFlag: { rivalMeet: 3, rivalFriend: true }, person: { profile, bond: 40, stage: 'friend' }, text: 'Mercy, then the race resumes, friendlier.' }) : undefined
			};
		}
	},
	// ===== the rival you once helped =====
	{
		id: 'rival-ally',
		where: 'any',
		weight: (c) => (c.run.flags.rivalFriend && !c.run.flags.rivalAlly ? 3 : 0),
		when: (c) => !!c.run.rival && !c.run.delivered,
		make: (c) => {
			const r = c.run.rival!;
			const sec = nearSecret(c, 4);
			const danger = (c.run.world ?? []).find((w) => w.kind === 'disaster' || w.kind === 'plague');
			const existing = (c.run.people ?? []).find((x) => x.id === `rival-${r.npc.seed}` || x.npc.name === r.npc.name);
			const profile = existing ?? {
				id: `rival-${r.npc.seed}`,
				npc: r.npc,
				city: c.city.id,
				venue: 'inn',
				traits: ['quick', 'silver-tongue'],
				likes: ['talk', 'sea'],
				dislikes: ['cruel'],
				bio: `Bound for ${cityLabel(c, c.run.destination)} on the same commission.`,
				bond: 25,
				stage: 'friend' as const,
				met: c.run.day,
				last: c.run.day
			};
			return {
				id: 'rival-ally',
				npc: r.npc,
				badge: 'Rival & friend',
				text: `**${r.npc.name}** catches up with you on the road, still a little pale from that fever. "I owe you. So: one thing, then we are even, and may the faster courier win."`,
				left: sec ? ch('“Tell me a road nobody uses.”', {}, { tags: ['talk'], setFlag: { rivalAlly: true, ['secret:' + sec.id]: true }, person: { profile, bond: 15, stage: 'confidant' }, text: `"${sec.hint[0].toUpperCase() + sec.hint.slice(1)}." They grin. "Do not tell anyone I told you."` }) : ch('“Tell me what is ahead.”', { fortune: 6 }, { setFlag: { rivalAlly: true }, person: { profile, bond: 15, stage: 'friend' }, text: '"Bad roads, honest innkeepers, one terrible ferry." Useful, all of it.' }),
				right: ch('“Let us travel together a while.”', { vigor: 6, renown: 4 }, { tags: ['loyal'], setFlag: { rivalAlly: true }, rivalDelay: -2, days: -1, person: { profile, bond: 25, stage: 'confidant' }, text: danger ? `Together you avoid ${danger.label.toLowerCase()} by a day. Then they are gone at dawn, a half-length ahead.` : 'Two couriers on one road, racing and laughing. For a few days it is not a race at all.' })
			};
		}
	},
	// ===== the ronin's revenge =====
	{
		id: 'ronin-1',
		where: 'city',
		weight: 1.2,
		once: true,
		when: (c) => stage(c, 'ronin') === 0 && inCulture(c, 'japanese', 'han', 'korean'),
		make: (c) => {
			const n = npc(c, 'soldier', { culture: 'japanese', gender: 'm', title: 'Dying ronin' });
			const killer = `Lord ${c.rng.pick(['Kuroda', 'Akechi', 'Sanada', 'Mogami', 'Hachisuka'])}`;
			const t = pickTarget(c, (id) => ['japanese', 'han', 'korean', 'viet'].includes(CITY[id].culture));
			return {
				id: 'ronin-1',
				npc: n,
				badge: 'Story',
				text: `In an alley, ${n.name} presses a sword into your hands. "${killer} murdered my master Ikeda. He hides in ${cityLabel(c, t)}. The blade knows him. Please..."`,
				left: ch('Give the sword to a temple', { fortune: 8 }, { setFlag: { 'arc:ronin': 9 }, text: 'Some debts are not yours.' }),
				right: ch('Swear to finish it', { renown: 5 }, { itemAdd: ['cursed-blade'], setFlag: { 'arc:ronin': 1, 'ronin:target': t, 'ronin:killer': killer }, text: `${cityLabel(c, t)}. ${killer}. You will remember.` })
			};
		}
	},
	{
		id: 'ronin-2',
		where: 'travel',
		weight: 2,
		when: (c) => stage(c, 'ronin') === 1 && carrying(c, 'cursed-blade'),
		make: (c) => {
			const n = npc(c, 'bandit', { culture: 'japanese', title: 'Shinobi assassin' });
			return {
				id: 'ronin-2',
				npc: n,
				badge: 'Story',
				text: `Black-clad figures drop from the rigging. "${c.run.flags['ronin:killer']} wants the blade back. Give it, and live."`,
				left: ch('Hand over the blade', { fortune: -10 }, { itemRemove: ['cursed-blade'], setFlag: { 'arc:ronin': 9 }, text: 'They vanish with it. The master’s ghost will be disappointed.' }),
				right: ch('Fight', {}, { tags: ['fight'], setFlag: { 'arc:ronin': 2 }, gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 12 }, text: 'Three shinobi down. The blade sings.' }, lose: { fx: { vigor: -18 }, text: 'You keep the blade — barely — and your life — barely.' } } }),
				up: withCrew(c, 'bodyguard') ? up('Bodyguard', 'Fight back to back with your guard', { renown: 14 }, { setFlag: { 'arc:ronin': 2 }, loyalty: 10, text: 'You move as one. The shinobi flee.' }) : undefined
			};
		}
	},
	{
		id: 'ronin-3',
		where: 'city',
		weight: 60,
		when: (c) => stage(c, 'ronin') >= 1 && stage(c, 'ronin') < 9 && c.city.id === target(c, 'ronin:target') && carrying(c, 'cursed-blade'),
		make: (c) => {
			const killer = String(c.run.flags['ronin:killer']);
			const n = npc(c, 'noble', { culture: 'japanese', gender: 'm', name: killer, title: 'Disgraced lord' });
			return {
				id: 'ronin-3',
				npc: n,
				badge: 'Story',
				text: `The blade hums in its scabbard. Across the courtyard: ${killer}, older than you imagined, tired. "So Ikeda’s sword found me at last."`,
				left: ch('Turn him in to the magistrate', { renown: 12, fortune: 10 }, { tags: ['official', 'loyal'], itemRemove: ['cursed-blade'], setFlag: { 'arc:ronin': 9 }, text: 'Justice by the book. The blade goes quiet.' }),
				right: ch('Duel him', {}, { tags: ['fight'], setFlag: { 'arc:ronin': 9 }, itemRemove: ['cursed-blade'], gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 24 }, itemAdd: ['avenger-blade'], text: 'One cut. The debt is paid. The blade is yours now.' }, lose: { fx: { vigor: -24 }, text: 'He wins, and spares you. "Tell Ikeda’s ghost I am sorry."' } } }),
				up: has(c, 'smuggler') || has(c, 'outlaw') ? up('Criminal', 'Sell him the blade instead', { silver: 30, fortune: -14 }, { itemRemove: ['cursed-blade'], setFlag: { 'arc:ronin': 9 }, text: 'He pays well to bury his past.' }) : undefined
			};
		}
	},
	// ===== the Jesuit manuscript =====
	{
		id: 'jesuit-1',
		where: 'any',
		weight: 1,
		once: true,
		when: (c) => stage(c, 'jesuit') === 0 && between(c, 1582, 1773),
		make: (c) => {
			const n = npc(c, 'monk', { culture: 'european', gender: 'm', title: 'Dying Jesuit' });
			const options = ['macau', 'goa', 'beijing', ...(c.year < 1639 ? ['nagasaki'] : [])].filter((id) => cityExists(CITY[id], c.year) && id !== c.city.id);
			const t = c.rng.pick(options);
			return {
				id: 'jesuit-1',
				npc: n,
				badge: 'Story',
				text: `Father ${n.name.split(' ').pop()} coughs blood onto a leather-bound book. "Forty years of star charts. Take it to the Society in ${cityLabel(c, t)}. Kings would kill for it."`,
				left: ch('Refuse — too dangerous', {}, { setFlag: { 'arc:jesuit': 9 } }),
				right: ch('Take the manuscript', { fortune: 4 }, { itemAdd: ['manuscript'], setFlag: { 'arc:jesuit': 1, 'jesuit:target': t }, text: `${cityLabel(c, t)}. You tuck it inside your robe.` })
			};
		}
	},
	{
		id: 'jesuit-2',
		where: 'city',
		weight: 2.5,
		when: (c) => stage(c, 'jesuit') === 1 && carrying(c, 'manuscript') && c.city.id !== target(c, 'jesuit:target'),
		make: (c) => {
			const buyer = c.year < 1600 ? 'Spanish' : c.year < 1700 ? 'Dutch VOC' : 'Qing court';
			const n = npc(c, 'official', { culture: buyer === 'Qing court' ? 'han' : 'european', title: `${buyer} agent` });
			return {
				id: 'jesuit-2',
				npc: n,
				badge: 'Story',
				text: `${n.name} knows exactly what you carry. "The ${buyer} will pay handsomely for the Jesuit's charts. Or take them. Your choice is mostly about the silver."`,
				left: ch('Sell it', { silver: 28, fortune: -10 }, { itemRemove: ['manuscript'], setFlag: { 'arc:jesuit': 9 }, text: 'Heavy purse. Light conscience. Or the other way around.' }),
				right: ch('Refuse and slip away', {}, { heat: 15, setFlag: { 'arc:jesuit': 2 }, gamble: { p: odds(c, 0.55, ['crime']), win: { fx: { renown: 4 }, text: 'Out the back, over the wall, gone.' }, lose: { fx: { vigor: -10 }, text: 'A scuffle. You keep the book, and a bruise.' } } })
			};
		}
	},
	{
		id: 'jesuit-3',
		where: 'city',
		weight: 60,
		when: (c) => stage(c, 'jesuit') >= 1 && stage(c, 'jesuit') < 9 && carrying(c, 'manuscript') && c.city.id === target(c, 'jesuit:target'),
		make: (c) => ({
			id: 'jesuit-3',
			npc: npc(c, 'monk', { culture: 'european', title: 'Father Superior' }),
			badge: 'Story',
			text: `The Father Superior turns the pages with trembling hands. "Forty years... He did it. You have done a great service, traveller."`,
			left: ch('Accept their blessing', { fortune: 16, renown: 10 }, { itemRemove: ['manuscript'], setFlag: { 'arc:jesuit': 9 } }),
			right: ch('Accept their silver', { silver: 18, renown: 14 }, { itemRemove: ['manuscript'], setFlag: { 'arc:jesuit': 9 }, itemAdd: ['spyglass'], text: 'Silver, and a brass spyglass "for a fellow student of the heavens."' })
		})
	},
	// ===== the lost heir =====
	{
		id: 'heir-1',
		where: 'city',
		weight: 1,
		once: true,
		when: (c) => stage(c, 'heir') === 0 && c.run.crew.length < 3,
		make: (c) => {
			const t = pickTarget(c, (id) => CITY[id].culture !== c.city.culture);
			const kid = npc(c, 'child', { culture: CITY[t].culture, title: 'Orphan' });
			const comp = companion(c, 'heir', kid);
			return {
				id: 'heir-1',
				npc: kid,
				badge: 'Story',
				text: `A ragged child grabs your sleeve and shows a jade token. "I am the true heir of ${cityLabel(c, t)}! My uncle stole the throne. Take me home — I'll make you rich!"`,
				left: ch('Give them a coin and go', { silver: -1, fortune: 3 }, { setFlag: { 'arc:heir': 9 } }),
				right: ch('Take the child along', {}, { crewAdd: comp, itemAdd: ['heir-seal'], setFlag: { 'arc:heir': 1, 'heir:target': t }, text: `Now you have a tiny, demanding passenger to ${cityLabel(c, t)}.` })
			};
		}
	},
	{
		id: 'heir-2',
		where: 'city',
		weight: 60,
		when: (c) => stage(c, 'heir') === 1 && c.city.id === target(c, 'heir:target') && withCrew(c, 'heir'),
		make: (c) => {
			const kid = c.run.crew.find((m) => m.role === 'heir')!;
			const n = npc(c, 'noble', { title: 'Regent' });
			const truth = c.rng.chance(0.55);
			return {
				id: 'heir-2',
				npc: n,
				badge: 'Story',
				text: `The regent of ${place(c)} studies ${kid.npc.name}'s jade token, then the child's face. The court holds its breath.`,
				left: ch('Present the heir to court', {}, { crewRemove: kid.id, itemRemove: ['heir-seal'], setFlag: { 'arc:heir': 9 }, gamble: { p: truth ? 0.9 : 0.15, win: { fx: { silver: 35, renown: 20 }, text: 'The regent kneels. The child is crowned within the month — and does not forget you.' }, lose: { fx: { renown: -14, fortune: -4 }, text: 'A forgery. The child is a clever street rat. You are a fool in front of the whole court.' } } }),
				right: ch('Keep the child as your ward', { fortune: 12 }, { setFlag: { 'arc:heir': 9 }, text: `Throne or no throne, ${kid.npc.name} is yours to look after now.` })
			};
		}
	}
];

