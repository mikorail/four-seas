// Rebellions and wars of independence. Pick a side — or play both — underground, on the battlefield, or at court.
import type { CultureId } from '#lib/data/cultures';
import type { Role } from '../types';
import { carrying, ch, dressed, has, npc, odds, place, up, withCrew, type Ctx, type Template } from './helpers';

export interface Uprising {
	id: string;
	name: string;
	from: number;
	until: number;
	cities: string[];
	culture: CultureId; // whose people rise
	rebels: string; // the cause
	leader: string;
	crown: string; // the power they rise against
	crownCulture?: CultureId;
	independence?: boolean;
	won: 'rebels' | 'crown'; // what history says
	history: string; // how it actually ended
}

export const UPRISINGS: Uprising[] = [
	{ id: 'portugal', name: 'The Restoration of Portugal', from: 1640, until: 1668, cities: ['lisbon', 'goa', 'macau', 'malacca'], culture: 'european', rebels: 'the Forty Conspirators', leader: 'João, Duke of Braganza', crown: 'the Spanish Habsburgs', independence: true, won: 'rebels', history: 'Portugal crowned its own king and, after 28 years of war, Spain recognised its independence.' },
	{ id: 'dutch', name: 'The Dutch Revolt', from: 1568, until: 1648, cities: ['amsterdam', 'batavia'], culture: 'european', rebels: 'the Sea Beggars and the States General', leader: 'William of Orange', crown: 'Philip II of Spain', independence: true, won: 'rebels', history: 'After eighty years, the Peace of Münster recognised the Dutch Republic.' },
	{ id: 'li-zicheng', name: 'The Shun Rebellion', from: 1640, until: 1645, cities: ['xian', 'beijing', 'nanjing'], culture: 'han', rebels: 'the peasant armies of the Dashun', leader: 'Li Zicheng, the Dashing King', crown: 'the Ming court', won: 'rebels', history: 'Li Zicheng took Beijing in 1644; the last Ming emperor hanged himself on Coal Hill. Six weeks later the Manchus took it from Li.' },
	{ id: 'ayutthaya', name: 'The Liberation of Siam', from: 1767, until: 1770, cities: ['ayutthaya', 'bangkok'], culture: 'siamese', rebels: 'Phraya Tak’s army', leader: 'Taksin', crown: 'the Burmese garrison', crownCulture: 'siamese', independence: true, won: 'rebels', history: 'Within a year of Ayutthaya’s fall, Taksin drove out the Burmese and was crowned at Thonburi.' },
	{ id: 'tayson', name: 'The Tây Sơn Rebellion', from: 1771, until: 1802, cities: ['hue', 'thanglong', 'hoian', 'saigon'], culture: 'viet', rebels: 'the Tây Sơn brothers', leader: 'Nguyễn Huệ', crown: 'the Nguyễn and Trịnh lords', won: 'rebels', history: 'The Tây Sơn united Vietnam and crushed a Qing army at Đống Đa in 1789 — before Nguyễn Ánh destroyed them in 1802.' },
	{ id: 'white-lotus', name: 'The White Lotus Rebellion', from: 1794, until: 1804, cities: ['chengdu', 'xian', 'nanjing'], culture: 'han', rebels: 'the White Lotus Society', leader: 'the Eternal Mother’s prophets', crown: 'the Qing court', won: 'crown', history: 'The Qing crushed it after ten years and a hundred million taels — and never fully recovered.' },
	{ id: 'java', name: 'The Java War', from: 1825, until: 1830, cities: ['mataram', 'batavia'], culture: 'malay', rebels: 'the Javanese princes and santri', leader: 'Prince Diponegoro', crown: 'the Dutch colonial government', crownCulture: 'european', independence: true, won: 'crown', history: 'The Dutch lured Diponegoro to peace talks in 1830 and arrested him under a flag of truce.' },
	{ id: 'taiping', name: 'The Taiping Heavenly Kingdom', from: 1850, until: 1864, cities: ['nanjing', 'guangzhou', 'shanghai', 'suzhou', 'hangzhou'], culture: 'han', rebels: 'the God Worshippers', leader: 'Hong Xiuquan, the Heavenly King', crown: 'the Qing dynasty', won: 'crown', history: 'Nanjing fell in 1864. Twenty million died — the bloodiest civil war in history.' },
	{ id: 'sepoy', name: 'The Great Rebellion of 1857', from: 1857, until: 1858, cities: ['delhi', 'agra', 'calcutta', 'lahore'], culture: 'indian', rebels: 'the sepoys and the old Mughal court', leader: 'Bahadur Shah Zafar and the Rani of Jhansi', crown: 'the East India Company', crownCulture: 'european', independence: true, won: 'crown', history: 'The Company won — and was abolished; India passed to the British Crown, and the last Mughal died in exile.' },
	{ id: 'boshin', name: 'The Boshin War', from: 1868, until: 1869, cities: ['kyoto', 'edo', 'osaka', 'hakodate', 'kagoshima'], culture: 'japanese', rebels: 'the Satsuma–Chōshū alliance for the Emperor', leader: 'Saigō Takamori', crown: 'the Tokugawa shogunate', won: 'rebels', history: 'The shogunate fell; the Emperor Meiji ruled from Edo, renamed Tokyo.' },
	{ id: 'aceh', name: 'The Aceh War', from: 1873, until: 1900, cities: ['aceh', 'malacca', 'batavia'], culture: 'malay', rebels: 'the Acehnese ulama and uleebalang', leader: 'Teuku Umar and Cut Nyak Dhien', crown: 'the Dutch colonial army', crownCulture: 'european', independence: true, won: 'crown', history: 'Aceh resisted for some thirty years — one of the longest colonial wars ever fought.' },
	{ id: 'donghak', name: 'The Donghak Peasant Revolution', from: 1894, until: 1895, cities: ['hanseong', 'busan', 'gyeongju'], culture: 'korean', rebels: 'the Donghak believers', leader: 'Jeon Bong-jun, the Green Bean General', crown: 'the Joseon court', won: 'crown', history: 'The uprising was crushed, but it dragged Qing and Japan into war on Korean soil.' },
	{ id: 'hawaii', name: 'The Hawaiian Counter-Revolution', from: 1893, until: 1895, cities: ['honolulu'], culture: 'pacific', rebels: 'the royalists of Queen Liliʻuokalani', leader: 'Robert Wilcox', crown: 'the planters’ Provisional Government', crownCulture: 'european', independence: true, won: 'crown', history: 'The royalist rising of 1895 failed; the Queen was forced to abdicate, and Hawaiʻi was annexed in 1898.' },
	{ id: 'katipunan', name: 'The Philippine Revolution', from: 1896, until: 1900, cities: ['manila', 'cebu'], culture: 'malay', rebels: 'the Katipunan', leader: 'Andrés Bonifacio and Emilio Aguinaldo', crown: 'the Spanish colonial government', crownCulture: 'european', independence: true, won: 'rebels', history: 'Independence was declared at Kawit in June 1898 — only for Spain to sell the islands to America.' },
	{ id: 'boxer', name: 'The Boxer Uprising', from: 1899, until: 1900, cities: ['beijing'], culture: 'han', rebels: 'the Righteous Harmony Fists', leader: 'the Boxer masters', crown: 'the foreign legations', crownCulture: 'european', won: 'crown', history: 'Eight foreign armies relieved the legations and looted Beijing; the Qing had only a decade left.' }
];

const active = (c: Ctx) => UPRISINGS.find((u) => c.year >= u.from && c.year <= u.until && (u.cities.includes(c.city.id) || (c.from && u.cities.includes(c.from.id))));
const side = (c: Ctx, u: Uprising) => c.run.flags['rev:' + u.id] as 'rebel' | 'crown' | 'both' | 'neutral' | undefined;
const pts = (c: Ctx, u: Uprising) => Number(c.run.flags['revp:' + u.id] ?? 0);
const done = (c: Ctx, u: Uprising) => !!c.run.flags['revdone:' + u.id];
const sworn = (c: Ctx, u: Uprising) => ['rebel', 'crown', 'both'].includes(side(c, u) ?? '');
const crownCul = (u: Uprising) => u.crownCulture ?? u.culture;
const plus = (u: Uprising, n = 1) => ({ ['revp:' + u.id]: n });

const ROLE_BY_MODE: Record<'underground' | 'ground' | 'intrigue', Role[]> = { underground: ['merchant', 'child', 'monk', 'innkeeper'], ground: ['soldier', 'captain'], intrigue: ['official', 'noble'] };

export const REBELLION_T: Template[] = [
	// ----- the call: choose a side -----
	{
		id: 'rev-call',
		where: 'city',
		tags: ['talk', 'loyal'],
		weight: (c) => {
			const u = active(c);
			return u && !side(c, u) && !done(c, u) ? 6 : 0;
		},
		make: (c) => {
			const u = active(c)!;
			const n = npc(c, 'scholar', { culture: u.culture, title: `Agent of ${u.rebels}` });
			const agent = npc(c, 'official', { culture: crownCul(u), title: `Agent of ${u.crown}` });
			return {
				id: 'rev-call',
				npc: n,
				text: `**${u.name}** has come to ${place(c)}. Posters are torn down at night and pasted up again by morning. In the back of a tea house, **${n.name}** speaks for ${u.rebels} and ${u.leader}: "${u.independence ? 'We want our country back.' : 'Heaven has withdrawn its mandate.'} A traveller who goes everywhere is worth ten soldiers. Will you carry our word?" Across the room, ${agent.name}, who works for ${u.crown}, is watching you over a cup.`,
				left: ch(`Swear to ${u.rebels}`, { renown: 4 }, { tags: ['loyal'], setFlag: { ['rev:' + u.id]: 'rebel' }, heat: 10, standing: 6, text: `You put your mark on a list that could hang you. ${n.name} grips your hand.` }),
				right: ch(`Report to ${u.crown}`, { silver: 10 }, { tags: ['official'], setFlag: { ['rev:' + u.id]: 'crown' }, standing: -4, karma: -2, text: `${agent.name} pays you well and gives you a password. You are an informer now.` }),
				up: has(c, 'fox-blooded') || has(c, 'silver-tongue') || withCrew(c, 'thief')
					? up(has(c, 'fox-blooded') ? 'Fox-blooded' : withCrew(c, 'thief') ? 'Cat burglar' : 'Silver tongue', 'Take silver from both sides', { silver: 12 }, { tags: ['crime', 'talk'], setFlag: { ['rev:' + u.id]: 'both' }, heat: 6, text: 'A double agent. Two passwords, two paymasters, one neck.' })
					: undefined
			};
		}
	},
	// ----- missions: underground, battlefield, intrigue — for whichever side you chose -----
	{
		id: 'rev-mission',
		where: 'any',
		tags: ['crime', 'fight', 'talk'],
		weight: (c) => {
			const u = active(c);
			return u && sworn(c, u) && !done(c, u) && pts(c, u) < 3 ? 4 : 0;
		},
		make: (c) => {
			const u = active(c)!;
			const s = side(c, u)!;
			const rebel = s === 'rebel' || (s === 'both' && c.rng.chance(0.5));
			const mode = c.rng.pick(['underground', 'ground', 'intrigue'] as const);
			const n = npc(c, c.rng.pick(ROLE_BY_MODE[mode]), { culture: rebel ? u.culture : crownCul(u) });
			const who = rebel ? u.rebels : u.crown;
			const tag = s === 'both' ? ` (Today you work for ${who}.)` : '';
			if (mode === 'underground') {
				return {
					id: 'rev-mission',
					npc: { ...n, title: rebel ? 'Cell leader' : 'Secret police' },
					text: rebel
						? `**${n.name}** runs a cell of ${u.rebels} from a cellar beneath a noodle shop. "Muskets are coming in on a rice barge tonight. And a printing press. Can you get them past the checkpoint?"${tag}`
						: `**${n.name}** of the secret police shows you a list of names. "One of these is the printer of the rebel pamphlets. Find the press. Do not let them know who sent you."${tag}`,
					left: ch(rebel ? 'Smuggle the guns in' : 'Hunt for the press', {}, { tags: ['crime'], heat: rebel ? 12 : 0, gamble: { p: odds(c, 0.5, ['crime']), win: { fx: { renown: 6 }, text: rebel ? 'Under the rice, under the noses of the guards. Every barrel arrives.' : 'You find it behind a false wall in a temple. They never learn who talked.', bump: plus(u) }, lose: { fx: { vigor: -10 }, heat: 14, text: rebel ? 'A guard pokes the rice with a spear. You run.' : 'The printers spot you. Your cover is blown.' } } }),
					right: ch('Too dangerous — pass a message instead', { fortune: 2 }, { tags: ['talk'], bump: plus(u, 0.5), text: 'A folded note in a melon, carried across town. Small things win wars too.' }),
					up: dressed(c, 'beggar-rags', 'monk-robes', 'pilgrim-garb')
						? up('Disguise', 'Walk it through in your disguise', { renown: 4 }, { tags: ['crime'], bump: plus(u), text: 'Nobody searches a beggar or a monk. You walk the whole shipment in, a bundle at a time.' })
						: carrying(c, 'papers') ? up('Forged papers', 'Use the forged papers', {}, { bump: plus(u), text: 'The checkpoint stamps you through without a glance.' }) : undefined
				};
			}
			if (mode === 'ground') {
				return {
					id: 'rev-mission',
					npc: { ...n, title: rebel ? `Commander of ${u.rebels}` : `Officer of ${u.crown}` },
					text: rebel
						? `${u.leader}’s fighters are massing outside the walls. **${n.name}** needs someone who knows the roads to lead a night march around the enemy camp.${tag}`
						: `**${n.name}** commands a column sent to break the rebels at a river crossing. "Scouts, guides, anyone who can ride — we are short of all of them."${tag}`,
					left: ch('Fight in the line', {}, { tags: ['fight', 'loyal'], gamble: { p: odds(c, 0.45, ['fight']), win: { fx: { renown: 12, vigor: -6 }, text: 'Smoke, drums, a charge across the shallows — and the enemy breaks.', bump: plus(u) }, lose: { fx: { vigor: -18 }, text: 'The line wavers and breaks. You drag a wounded stranger out of the river.' } } }),
					right: ch('Scout and guide instead', { vigor: -4 }, { tags: ['land'], days: 2, bump: plus(u, 0.5), text: 'You find the ford nobody else knew. It will not make songs, but it wins battles.' }),
					up: dressed(c, 'samurai-armor', 'janissary-uniform', 'company-uniform') || withCrew(c, 'bodyguard')
						? up(withCrew(c, 'bodyguard') ? 'Bodyguard' : 'Armour', 'Lead the charge yourself', { renown: 16, vigor: -8 }, { tags: ['fight'], bump: plus(u, 1.5), text: 'They follow you because you look like you know what you are doing. For once, you do.' })
						: undefined
				};
			}
			return {
				id: 'rev-mission',
				npc: { ...n, title: rebel ? 'Sympathiser at court' : `Minister of ${u.crown}` },
				text: rebel
					? `**${n.name}** is a minister who secretly favours ${u.rebels}. "The garrison commander can be bought — or blackmailed. I have the letters. I need a stranger to deliver them."${tag}`
					: `**${n.name}** suspects a traitor in the council. "Dine with the suspects. Drink, listen, flatter. Bring me a name."${tag}`,
				left: ch(rebel ? 'Deliver the blackmail' : 'Dine and listen', {}, { tags: ['talk'], gamble: { p: odds(c, 0.5, ['talk', 'official']), win: { fx: { renown: 6, silver: 6 }, text: rebel ? 'The commander reads the letters, goes grey and opens the gate.' : 'Over the third cup of wine, a name slips out.', bump: plus(u) }, lose: { fx: { renown: -6 }, heat: 10, text: 'Someone talks. Suddenly a lot of people want to know who you really are.' } } }),
				right: ch('Bribe your way to the same result', { silver: -12 }, { tags: ['bribe'], bump: plus(u, 0.5), text: 'Expensive, but nobody gets hurt. Not yet.' }),
				up: dressed(c, 'mandarin-robe', 'silk-turban', 'scholar-robes', 'company-uniform', 'janissary-uniform')
					? up('Court dress', 'Walk into the council chamber as if you belong', { renown: 8 }, { tags: ['official'], bump: plus(u, 1.5), text: 'Clothes make the courtier. Nobody stops you; several people bow.' })
					: undefined
			};
		}
	},
	// ----- the other side comes for you -----
	{
		id: 'rev-turn',
		where: 'city',
		tags: ['talk', 'crime'],
		weight: (c) => {
			const u = active(c);
			return u && (side(c, u) === 'rebel' || side(c, u) === 'crown') && !done(c, u) && pts(c, u) >= 1 ? 1.5 : 0;
		},
		make: (c) => {
			const u = active(c)!;
			const rebel = side(c, u) === 'rebel';
			const n = npc(c, rebel ? 'official' : 'scholar', { culture: rebel ? crownCul(u) : u.culture, title: rebel ? `Spymaster of ${u.crown}` : `Envoy of ${u.rebels}` });
			return {
				id: 'rev-turn',
				npc: n,
				text: rebel
					? `**${n.name}** of ${u.crown} sits down uninvited at your table. "We know what you carry and for whom. Work for us now, and you will be pardoned — and rich. Refuse, and we will know where to find you."`
					: `**${n.name}** of ${u.rebels} catches your sleeve in the crowd. "You serve tyrants. But you have a conscience — I can see it. Change sides. History is on ours."`,
				left: ch('Refuse to the end', {}, { tags: ['loyal'], heat: rebel ? 15 : 0, remember: { kind: 'grudge', deed: 'refused to turn traitor' }, bump: plus(u, 0.5), text: 'You do not even finish your tea. Somewhere, a name is underlined.' }),
				right: ch('Turn your coat', { silver: 14 }, { tags: ['crime'], karma: -4, setFlag: { ['rev:' + u.id]: rebel ? 'crown' : 'rebel' }, text: 'You walk out on the other side of history. It feels exactly the same, which is the worst part.' }),
				up: has(c, 'fox-blooded') || has(c, 'smuggler') ? up(has(c, 'smuggler') ? 'Smuggler' : 'Fox-blooded', 'Pretend to turn, and feed them lies', { renown: 6 }, { tags: ['talk', 'crime'], bump: plus(u, 1), text: 'A triple game. They thank you for every lie.' }) : undefined
			};
		}
	},
	// ----- the climax -----
	{
		id: 'rev-climax',
		where: 'city',
		tags: ['fight', 'loyal'],
		weight: (c) => {
			const u = active(c);
			return u && sworn(c, u) && !done(c, u) && pts(c, u) >= 3 ? 20 : 0;
		},
		make: (c) => {
			const u = active(c)!;
			const s = side(c, u)!;
			const mine = s === 'both' ? null : s === 'rebel' ? 'rebels' : 'crown';
			const winning = mine === u.won;
			const n = npc(c, 'noble', { culture: mine === 'crown' ? crownCul(u) : u.culture, title: mine === 'crown' ? `Commander for ${u.crown}` : u.leader.split(/,| and /)[0] });
			const fate = `**${u.name}** comes to its decisive hour in ${place(c)}. ${u.history}`;
			if (!mine) {
				return {
					id: 'rev-climax',
					npc: n,
					text: `${fate} Both sides now know you sold to each. **${n.name}** has your name on a list — so does the other side.`,
					left: ch('Vanish before dawn', { renown: -6 }, { setFlag: { ['revdone:' + u.id]: true }, heat: -20, days: 1, text: 'By the time either side looks for you, you are three valleys away with a full purse.' }),
					right: ch('Sell one final secret to the winner', { silver: 20 }, { tags: ['crime'], karma: -6, setFlag: { ['revdone:' + u.id]: true }, text: `You bet on ${u.won === 'rebels' ? u.rebels : u.crown}. You bet right.` })
				};
			}
			return {
				id: 'rev-climax',
				npc: n,
				text: winning
					? `${fate} You fought for the winning side. **${n.name}** wants you beside them on the day of victory.`
					: `${fate} Your side is losing. **${n.name}** gives you one last order — or one last chance to run.`,
				left: winning
					? ch('Stand with them at the victory', { renown: 22, fortune: 6 }, { tags: ['loyal'], standing: mine === 'rebels' ? 18 : 10, setFlag: { ['revdone:' + u.id]: true, ['revhero:' + u.id]: true }, text: u.independence && mine === 'rebels' ? 'A new flag goes up. Strangers embrace in the street. Your name is read out with the others.' : 'You ride through the gate behind the victors. History will forget most of you. Not today.' })
					: ch('Cover the retreat', { vigor: -14, renown: 16 }, { tags: ['fight', 'loyal', 'mercy'], setFlag: { ['revdone:' + u.id]: true, ['revhero:' + u.id]: true }, standing: 10, heat: mine === 'rebels' ? 25 : 0, text: 'You hold the bridge long enough for the others to scatter into the hills. The songs remember a stranger who would not run.' }),
				right: winning
					? ch('Take your reward and slip away', { silver: 24 }, { tags: ['trade'], setFlag: { ['revdone:' + u.id]: true }, text: 'Victory is crowded. You prefer the road.' })
					: ch('Escape with the leaders’ papers', { fortune: 4 }, { tags: ['loyal'], setFlag: { ['revdone:' + u.id]: true }, heat: 10, days: 2, text: 'Lists, letters, the dream on paper. Someone will need them in fifty years.' }),
				up: !winning && (has(c, 'fox-blooded') || has(c, 'smuggler') || dressed(c, 'beggar-rags'))
					? up(dressed(c, 'beggar-rags') ? 'Disguise' : 'Cunning', 'Smuggle the leader out in disguise', { renown: 20 }, { tags: ['crime', 'mercy'], setFlag: { ['revdone:' + u.id]: true, ['revhero:' + u.id]: true }, heat: 20, text: 'Two beggars walk out through the enemy camp at dawn. History says the leader was captured. History did not ask you.' })
					: undefined
			};
		}
	}
];

export const uprisingAt = (cityId: string, year: number) => UPRISINGS.find((u) => year >= u.from && year <= u.until && u.cities.includes(cityId));
