// Side stories: inventions, flight, gossip, exploration, journaling, trading and war.
import { CITIES, CITY, cityExists, cityName, type Good } from '#lib/data/world';
import { ITEMS, goodId, goodOf, isGood } from '#lib/data/items';
import { warFor } from '../events';
import type { Quest } from '../types';
import { bagFree, carrying, ch, has, npc, odds, place, up, withCrew, type Ctx, type Template } from './helpers';

const inventionsFor = (c: Ctx) =>
	[
		c.year >= 1610 ? 'telescope' : '',
		c.year >= 1770 ? 'chronometer' : '',
		c.year >= 1800 ? 'vaccine' : '',
		c.year >= 1840 ? 'camera' : '',
		c.year >= 1855 ? 'telegraph' : ''
	].filter((x) => x && !carrying(c, x));
const workshopCity = (c: Ctx) => ['european'].includes(c.city.culture) || ['macau', 'guangzhou', 'nagasaki', 'batavia', 'goa', 'calcutta', 'bombay', 'hongkong', 'edo', 'osaka', 'manila', 'istanbul'].includes(c.city.id);

export const SIDE_T: Template[] = [
	// ===== inventions =====
	{
		id: 'inventor',
		where: 'city',
		tags: ['art', 'trade'],
		weight: (c) => (workshopCity(c) && inventionsFor(c).length && bagFree(c) > 0 ? 2.2 : 0),
		make: (c) => {
			const id = c.rng.pick(inventionsFor(c));
			const it = ITEMS[id];
			const n = npc(c, 'scholar', { title: c.city.culture === 'european' ? 'Natural philosopher' : 'Instrument maker' });
			return {
				id: 'inventor',
				npc: n,
				badge: 'Invention',
				text: `In a workshop full of brass and smoke in ${place(c)}, **${n.name}** shows you the newest wonder: **${it.glyph} ${it.name}**. ${it.desc} "${it.price} silver, and you will travel like nobody before you."`,
				left: ch('Admire it and move on', { renown: 1 }),
				right: ch(`Buy it (${it.price})`, { silver: -it.price }, { tags: ['trade'], itemAdd: [id], text: 'The future, wrapped in oilcloth.' }),
				up: has(c, 'scholar') || has(c, 'bookworm') ? up('Learned', 'Help improve the design for a share', { renown: 8 }, { tags: ['art'], itemAdd: [id], days: 2, text: 'Two days with lenses and gears. Your name is in the patent.' }) : undefined
			};
		}
	},
	{
		id: 'balloon-plans',
		where: 'city',
		once: true,
		weight: 3,
		when: (c) => c.year >= 1783 && workshopCity(c) && !c.run.flags.balloon && !carrying(c, 'balloon-plans'),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'european', title: 'Balloonist' });
			return {
				id: 'balloon-plans',
				npc: n,
				badge: 'Invention',
				text: `**${n.name}** is breathless: "In France the Montgolfier brothers have flown a sheep, a duck and a rooster in a silk bag full of hot air! I have their plans. With **silk**, **lacquer** to seal it, and a good workshop, you could fly over any border on earth."`,
				left: ch('Sounds like madness', {}),
				right: ch('Buy the plans (12)', { silver: -12 }, { itemAdd: ['balloon-plans'], text: 'Diagrams of a great pear-shaped bag, a brazier, and a wicker basket.' })
			};
		}
	},
	{
		id: 'balloon-build',
		where: 'city',
		weight: 40,
		when: (c) => carrying(c, 'balloon-plans') && carrying(c, goodId('silk')) && carrying(c, goodId('lacquerware')) && (workshopCity(c) || ['han', 'japanese', 'korean'].includes(c.city.culture)),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Master craftsman' });
			return {
				id: 'balloon-build',
				npc: n,
				badge: 'Invention',
				text: `You spread the plans, the silk and the lacquer in **${n.name}**'s courtyard. A crowd gathers. Ten days of sewing, varnishing and arguing later, the great bag fills with smoke and strains at its ropes.`,
				left: ch('Lose your nerve', { renown: -4 }),
				right: ch('Cut the ropes!', { renown: 20, fortune: 6 }, { days: 10, itemRemove: ['balloon-plans', goodId('silk'), goodId('lacquerware')], setFlag: { balloon: true }, text: '🎈 You rise over the rooftops while the whole city screams. You can now travel by balloon.' })
			};
		}
	},
	{
		id: 'balloon-wind',
		where: 'travel',
		weight: (c) => (c.run.route?.vessel === 'hot-air balloon' ? 12 : 0),
		make: (c) => {
			const n = npc(c, 'hero', { name: c.run.hero.name, title: 'Aeronaut', culture: c.run.hero.culture, gender: c.run.hero.gender });
			const kind = c.rng.pick(['wind', 'eagle', 'landing', 'storm'] as const);
			if (kind === 'wind')
				return {
					id: 'balloon-wind',
					npc: n,
					badge: 'Aloft',
					text: 'Far below, the world is a painted scroll: rivers like threads, cities like spilled rice. The wind is turning. Climb to find a better current, or vent and drift lower?',
					left: ch('Vent and drift low', { vigor: -2 }, { days: 1, text: 'Slow and steady, close enough to hear dogs bark.' }),
					right: ch('Feed the fire and climb', {}, { gamble: { p: odds(c, 0.55, ['sea']), win: { fx: { renown: 6 }, days: -1, text: 'A river of wind carries you like a leaf.' }, lose: { fx: { vigor: -10 }, days: 1, text: 'Cold, thin air. You come down shaking.' } } })
				};
			if (kind === 'eagle')
				return {
					id: 'balloon-wind',
					npc: n,
					badge: 'Aloft',
					text: 'A great eagle circles the balloon, then dives at the silk, talons first.',
					left: ch('Bang a pot to scare it', {}, { gamble: { p: 0.6, win: { fx: { renown: 3 }, text: 'It veers off, offended.' }, lose: { fx: { vigor: -6 }, days: 1, text: 'A rip. You patch it in mid-air, terrified.' } } }),
					right: ch('Offer it your dried fish', { fortune: 6 }, { text: 'It takes the fish and escorts you for a mile, like an honour guard.' })
				};
			if (kind === 'landing')
				return {
					id: 'balloon-wind',
					npc: n,
					badge: 'Aloft',
					text: 'You come down in a field outside a village. Farmers run at you with pitchforks — or are they bringing offerings? Hard to tell from up here.',
					left: ch('Land and explain', {}, { tags: ['talk'], gamble: { p: odds(c, 0.55, ['talk']), win: { fx: { renown: 10, vigor: 6 }, text: 'Feasted as a sky-traveller. Children touch your sleeves for luck.' }, lose: { fx: { vigor: -8 }, text: 'The pitchforks were for you.' } } }),
					right: ch('Throw out ballast and rise again', {}, { text: 'You wave politely from above. They will tell this story for a century.' })
				};
			return {
				id: 'balloon-wind',
				npc: n,
				badge: 'Aloft',
				text: 'Black clouds boil up ahead. Lightning, and you are hanging from a bag of hot air.',
				left: ch('Land at once', { vigor: -4 }, { days: 2, text: 'You wait out the storm under the deflated silk.' }),
				right: ch('Try to outrun it', {}, { gamble: { p: odds(c, 0.45, ['sea']), win: { fx: { renown: 12 }, text: 'You skim ahead of the storm front, laughing like a madman.' }, lose: { fx: { vigor: -16 }, setFlag: { balloon: false }, text: 'The balloon is torn apart. You survive the fall; the balloon does not.' } } })
			};
		}
	},
	// ===== gossip =====
	{
		id: 'gossip',
		where: 'city',
		tags: ['talk'],
		weight: 1.6,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Gossip' });
			const goods: Good[] = ['silk', 'tea', 'pepper', 'porcelain', 'cotton', 'sugar', 'gemstones', 'furs'];
			const g = c.rng.pick(goods);
			const rumours = [
				{ t: `the price of **${g}** is about to triple`, win: { setFlag: { ['boom:' + g]: true, ['boomUntil:' + g]: c.run.day + 40 } } },
				{ t: `a hidden road leads somewhere nobody has mapped`, win: { setFlag: { tip: 1 } } },
				{ t: `the ${c.local.official} of ${place(c)} is selling pardons cheap this week`, win: { heat: -25 } },
				{ t: `${c.run.rival ? `your rival **${c.run.rival.npc.name}**` : 'a rival courier'} was seen drinking heavily three cities back`, win: { rivalDelay: 6 } }
			];
			const r = c.rng.pick(rumours);
			const isTrue = c.rng.chance(0.6);
			return {
				id: 'gossip',
				npc: n,
				badge: 'Gossip',
				text: `Leaning over the tea-house rail, **${n.name}** murmurs that ${r.t}. Everyone in ${place(c)} is saying it. Of course, everyone in ${place(c)} says a lot of things.`,
				left: ch('Ignore idle talk', {}),
				right: ch('Act on it', {}, { tags: ['talk'], gamble: { p: isTrue ? 0.85 : 0.2, win: { fx: { renown: 2 }, ...(r.win as object), text: 'It was true! You got there first.' }, lose: { fx: { silver: -6, renown: -4 }, text: 'Pure invention. You look foolish, and slightly poorer.' } } }),
				up: withCrew(c, 'interpreter') || has(c, 'polyglot') ? up('Ears everywhere', 'Check the rumour with three other people first', {}, { tags: ['talk'], days: 1, ...(isTrue ? { ...(r.win as object), text: 'Confirmed by three sources. You act on it.' } : { text: 'Nobody else has heard it. You save yourself the trouble.' }) }) : undefined
			};
		}
	},
	// ===== exploration =====
	{
		id: 'uncharted',
		where: 'travel',
		modes: ['sea'],
		weight: 0.9,
		make: (c) => {
			const n = npc(c, 'sailor', { title: 'Lookout' });
			const name = `${c.rng.pick(['Isle', 'Reef', 'Cape', 'Atoll', 'Rock'])} ${c.run.hero.name.split(' ').pop()}`;
			return {
				id: 'uncharted',
				npc: n,
				badge: 'Exploration',
				text: `**${n.name}** shouts from the masthead: land where no chart shows any. A green speck ringed with white surf, birds wheeling over it.`,
				left: ch('Mark it and sail on', { renown: 4 }, { text: 'A pencil dot on the chart — and a name, maybe someday.' }),
				right: ch(`Land, explore and name it "${name}"`, { renown: 12, vigor: -4 }, { days: 2, setFlag: { ['discovered:' + name]: true }, gamble: { p: odds(c, 0.6, ['sea']), win: { fx: { fortune: 6, silver: 6 }, text: `Fresh water, strange fruit, and a cave of old shells. "${name}" goes into your journal.` }, lose: { fx: { vigor: -8 }, text: 'Rocks, crabs and a sunburn. Still — it has your name now.' } } })
			};
		}
	},
	// ===== journaling & wandering =====
	{
		id: 'publisher',
		where: 'city',
		once: true,
		weight: (c) => (c.run.visited.length >= 5 && !c.run.quests.some((q) => q.id === 'travelogue') ? 2.5 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { title: 'Printer & publisher' });
			const seen = new Set(c.run.visited.map((id) => CITY[id].culture));
			const pool = CITIES.filter((x) => cityExists(x, c.year) && !seen.has(x.culture) && x.id !== c.city.id);
			const picks: string[] = [];
			for (const x of c.rng.shuffle(pool)) if (!picks.some((p) => CITY[p].culture === x.culture) && picks.length < 3) picks.push(x.id);
			const q: Quest = { id: 'travelogue', kind: 'map', title: `Write "Travels of ${c.run.hero.name}"`, giver: n.name, from: c.city.id, to: c.city.id, visit: picks, due: c.run.day + 200, reward: { renown: 25, silver: 15 }, rewardItem: 'travelogue', text: 'The book is printed, pirated, translated and argued about in every port.' };
			return {
				id: 'publisher',
				npc: n,
				badge: 'Journal',
				text: `**${n.name}** has been reading your journal over your shoulder. "This could be a book! But readers want more — go and see ${picks.map((p) => `**${cityName(CITY[p], c.year)}**`).join(', ')}, then I will print it."`,
				left: ch('Your journal stays private', { fortune: 2 }),
				right: ch('Sign the contract', { renown: 4 }, { tags: ['art'], quest: q, text: '◆ Three more lands to see, then the press.' })
			};
		}
	},
	{
		id: 'journal-night',
		where: 'any',
		tags: ['art', 'rest'],
		weight: 0.9,
		make: (c) => {
			const n = npc(c, 'hero', { name: c.run.hero.name, title: 'Your journal', culture: c.run.hero.culture, gender: c.run.hero.gender, });
			const sights = c.run.visited.length;
			return {
				id: 'journal-night',
				npc: n,
				badge: 'Journal',
				text: `By lamplight you open your journal. ${sights} cities so far, ${c.run.legends.length} legends, more strangers than you can count. Write tonight — or sleep?`,
				left: ch('Sleep; the road is long', { vigor: 6 }),
				right: ch('Write until the lamp gutters', { vigor: -3, renown: 4, fortune: 3 }, { tags: ['art'], text: carrying(c, 'camera') ? 'You paste in a daguerreotype and write three pages beneath it.' : 'Ink on your fingers and a page you are actually proud of.' })
			};
		}
	},
	// ===== trading =====
	{
		id: 'corner-market',
		where: 'city',
		tags: ['trade'],
		weight: (c) => {
			const counts: Record<string, number> = {};
			for (const id of c.run.bag.filter(isGood)) counts[id] = (counts[id] ?? 0) + 1;
			return Object.values(counts).some((n) => n >= 3) ? 5 : 0;
		},
		make: (c) => {
			const counts: Record<string, number> = {};
			for (const id of c.run.bag.filter(isGood)) counts[id] = (counts[id] ?? 0) + 1;
			const id = Object.entries(counts).find(([, n]) => n >= 3)![0];
			const g = goodOf(id);
			const n = npc(c, 'merchant', { title: 'Guild master' });
			return {
				id: 'corner-market',
				npc: n,
				badge: 'Trade',
				text: `**${n.name}** of the ${place(c)} merchants' guild has noticed you hold three full loads of **${g}**. "You could corner the market here. Or sell to us at a fair price and join the guild."`,
				left: ch('Join the guild (sell all three)', { silver: 30, renown: 6 }, { tags: ['trade', 'loyal'], itemRemove: [id, id, id], standing: 12, text: 'A guild seal, a seat at their table, and a fat purse.' }),
				right: ch('Corner the market', {}, { tags: ['trade', 'gamble'], itemRemove: [id, id, id], heat: 10, gamble: { p: odds(c, 0.5, ['trade']), win: { fx: { silver: 55 }, text: `Prices double overnight. You sell every last bolt of ${g}.` }, lose: { fx: { silver: 10, renown: -8 }, standing: -15, text: 'The guild floods the market to break you. You sell at a loss and make enemies.' } } })
			};
		}
	},
	// ===== war =====
	{
		id: 'war-contract',
		where: 'city',
		weight: (c) => (warFor(c.run, c.city.culture) && bagFree(c) > 0 && !c.run.quests.some((q) => q.id.startsWith('war-')) ? 2.5 : 0),
		make: (c) => {
			const w = warFor(c.run, c.city.culture)!;
			const n = npc(c, 'soldier', { title: 'Army quartermaster' });
			const front = CITIES.filter((x) => cityExists(x, c.year) && x.culture === c.city.culture && x.id !== c.city.id);
			const to = (front.length ? c.rng.pick(front) : c.city).id;
			const q: Quest = { id: `war-${n.seed}`, kind: 'contract', title: `Deliver army supplies to ${cityName(CITY[to], c.year)}`, giver: n.name, from: c.city.id, to, item: 'parcel3', due: c.run.day + 45, reward: { silver: 32, renown: 8 }, text: 'Rice, powder and bandages reach the front. The quartermaster pays in good silver.' };
			return {
				id: 'war-contract',
				npc: n,
				badge: w.label,
				text: `With **${w.label.toLowerCase()}** raging, **${n.name}** needs supplies at ${cityName(CITY[to], c.year)} — fast. "Thirty-two taels. War pays well for those who survive it."`,
				left: ch('Stay out of the war', {}),
				right: ch('Take the contract', {}, { tags: ['trade', 'loyal'], itemAdd: ['parcel3'], quest: q, standing: 6 })
			};
		}
	}
];

