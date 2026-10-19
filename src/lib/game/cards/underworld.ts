import { ITEMS, MOUNTS } from '#lib/data/items';
import { carrying, ch, has, npc, odds, place, up, withCrew, dressed, type Template } from './helpers';

const society = (culture: string, year: number) =>
	culture === 'han' ? (year >= 1760 ? 'the Heaven and Earth Society' : 'the Green Gang') : culture === 'japanese' ? 'a bakuto gambling clan' : culture === 'indian' ? 'a dacoit brotherhood' : culture === 'european' ? 'the Brotherhood of the Coast' : culture === 'malay' ? 'the Bugis free captains' : 'the night market brotherhood';

export const CRIME: Template[] = [
	{
		id: 'heist',
		where: 'city',
		tags: ['crime'],
		weight: (c) => (withCrew(c, 'thief') || has(c, 'smuggler') || has(c, 'outlaw') ? 2.5 : 0.7),
		make: (c) => {
			const n = npc(c, 'child', { title: 'Fence' });
			const target = c.rng.pick(['a silk merchant’s warehouse', 'the customs house strongroom', 'a pawnbroker’s vault', 'a corrupt magistrate’s summer villa']);
			const p = odds(c, 0.45, ['crime']);
			return {
				id: 'heist',
				npc: n,
				text: `${n.name} has a plan: ${target} in ${place(c)}, unguarded tonight. "In and out. Split it down the middle."`,
				left: ch('Walk away', { fortune: 2 }),
				right: ch('Do the job', {}, { tags: ['crime'], gamble: { p, win: { fx: { silver: 26 }, text: 'Silver bars wrapped in rags. Nobody saw a thing. Probably.' }, lose: { fx: { vigor: -10, renown: -10 }, text: 'Dogs, whistles, a rooftop chase. You escape — barely, and famously.' } }, heat: 25 }),
				up: withCrew(c, 'thief') ? up('Cat burglar', 'Send your burglar alone', { silver: 22 }, { tags: ['crime'], heat: 10, loyalty: 8, text: 'Back before the second watch, grinning, with a sack.' }) : undefined
			};
		}
	},
	{
		id: 'contraband',
		where: 'city',
		tags: ['crime'],
		weight: (c) => (has(c, 'smuggler') || has(c, 'wanted') ? 3 : 0.6),
		make: (c) => {
			const n = npc(c, 'sailor');
			const p = odds(c, 0.55, ['crime']);
			return {
				id: 'contraband',
				npc: n,
				text: `${n.name} whispers: a crate of untaxed goods needs moving past the harbor watch tonight. Big cut.`,
				left: ch('Not my business', { fortune: 2 }),
				right: ch('Move the crate', {}, { tags: ['crime'], heat: 15, gamble: { p, win: { fx: { silver: 22 }, text: 'Smooth as silk. Literally — it was silk.' }, lose: { fx: { renown: -14, silver: -6 }, text: 'Caught. Fined. Named in the market square.' } } }),
				up: c.run.mount && MOUNTS[c.run.mount.kind].slots >= 4 ? up(MOUNTS[c.run.mount.kind].name, `Hide it in ${c.run.mount.name}'s packs`, { silver: 20 }, { tags: ['crime'], heat: 6, text: 'Nobody searches a grumpy animal.' }) : undefined
			};
		}
	},
	{
		id: 'secret-society',
		where: 'city',
		tags: ['crime'],
		once: true,
		weight: (c) => (c.run.heat > 25 ? 2 : 0.5),
		make: (c) => {
			const name = society(c.city.culture, c.year);
			const n = npc(c, 'elder', { title: 'Lodge master' });
			return {
				id: 'secret-society',
				npc: n,
				text: `A red cord is tied to your door. ${n.name} of ${name} invites you to swear brotherhood. "We protect our own. And our own protect us."`,
				left: ch('Refuse politely', { fortune: -3 }),
				right: ch('Swear the oath', { renown: -6 }, { tags: ['crime'], setFlag: { society: name }, heat: -20, remember: { kind: 'favor', deed: 'swore brotherhood with them' }, text: 'Blood, incense, and a secret handshake. Doors will open now.' })
			};
		}
	},
	{
		id: 'society-favor',
		where: 'any',
		weight: 1.5,
		when: (c) => typeof c.run.flags.society === 'string',
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Sworn brother' });
			return {
				id: 'society-favor',
				npc: n,
				text: `${n.name} flashes the secret sign of ${c.run.flags.society}. "Brother. The magistrate is asking about you. We can... make the file disappear. Or you could do us a favor."`,
				left: ch('Make the file vanish', { silver: -6 }, { heat: -35, text: 'The file burns. So does a little of your conscience.' }),
				right: ch('Do the favor', { vigor: -6, silver: 14 }, { tags: ['crime'], heat: 15, days: 1, text: 'You don’t ask what was in the box.' })
			};
		}
	},
	{
		id: 'bounty-hunter',
		where: 'any',
		tags: ['fight'],
		weight: (c) => (c.run.heat >= 40 ? c.run.heat / 12 : 0),
		make: (c) => {
			const n = npc(c, 'soldier', { title: 'Bounty hunter' });
			const p = odds(c, 0.45, ['fight']);
			return {
				id: 'bounty-hunter',
				npc: n,
				text: `${n.name} holds up a poster with your face. "${c.run.heat * 2} taels, dead or alive. I prefer alive. Less paperwork."`,
				left: ch('Fight', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 8, vigor: -8 }, text: 'They won’t be collecting anything.' }, lose: { fx: { vigor: -18, silver: -10 }, text: 'You slip the ropes at night, bloody and poor.' } } }),
				right: ch('Outbid your own bounty', { silver: -Math.min(25, Math.round(c.run.heat / 3)) }, { heat: -25, text: '"Pleasure doing business. I never saw you."' }),
				up: carrying(c, 'papers') ? up('Forged papers', '"You have the wrong person."', {}, { heat: -15, text: 'They compare the poster, the papers, your face. They leave, confused.' }) : withCrew(c, 'bodyguard') ? up('Bodyguard', 'Let your bodyguard loom', { renown: 4 }, { text: 'The hunter does arithmetic, and decides against it.' }) : undefined
			};
		}
	},
	{
		id: 'arrest',
		where: 'city',
		tags: ['official'],
		weight: (c) => (c.run.heat >= 60 ? 12 : 0),
		make: (c) => {
			const n = npc(c, 'official', { title: 'Chief constable' });
			const fine = Math.round(c.run.heat / 2);
			const p = odds(c, 0.4, ['fight', 'crime']);
			const doom = c.run.heat >= 90;
			return {
				id: 'arrest',
				npc: n,
				text: `Constables surround your inn. ${n.name} reads a list of your crimes. It is long. ${doom ? 'The cangue is already waiting.' : `"A fine of ${fine} taels, or the cells."`}`,
				left: ch(doom ? 'Surrender' : `Pay the fine (${fine})`, doom ? {} : { silver: -fine }, doom ? { setFlag: { end: 'jailed' } } : { heat: -50, tags: ['official'], text: 'Your record is wiped. Your purse too.' }),
				right: ch('Break for the rooftops', {}, { tags: ['fight', 'crime'], gamble: { p, win: { fx: { renown: 6, vigor: -6 }, text: 'Tiles crash. You vanish into the night.' }, lose: doom ? { fx: { vigor: -10 }, text: 'Caught on the third roof.', setFlag: { end: 'jailed' } } : { fx: { vigor: -12, renown: -10 }, days: 6, text: 'Six days in a bamboo cage in the square.' } }, heat: doom ? 0 : -20 }),
				up: dressed(c, 'beggar-rags', 'monk-robes') && !doom ? up('Disguise', 'Walk out among them in disguise', {}, { heat: -35, text: 'The constables push past a humble figure in the doorway. It was you.' }) : typeof c.run.flags.society === 'string' ? up('Secret society', 'Give the society’s sign', {}, { heat: -60, text: 'The constable sighs, tears up the warrant, and leaves.' }) : carrying(c, 'gift') ? up('Gift box', 'A gift for the constable’s wife', {}, { itemRemove: ['gift'], heat: -40, text: 'Such a thoughtful traveller. Clearly a misunderstanding.' }) : undefined
			};
		}
	},
	{
		id: 'racket',
		where: 'city',
		tags: ['crime', 'fight'],
		weight: 0.8,
		make: (c) => {
			const n = npc(c, 'bandit', { title: 'Gang enforcer' });
			const p = odds(c, 0.45, ['fight']);
			return {
				id: 'racket',
				npc: n,
				text: `${n.name} cracks their knuckles. "Travellers pay the street tax in ${place(c)}. For protection. From us."`,
				left: ch('Pay', { silver: -7 }),
				right: ch('Refuse', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 10 }, text: 'The enforcer limps off. The street cheers quietly.' }, lose: { fx: { vigor: -14, silver: -7 }, text: 'You pay anyway. With interest. And bruises.' } } })
			};
		}
	},
	{
		id: 'informant',
		where: 'city',
		tags: ['official', 'crime'],
		weight: (c) => (c.run.heat >= 30 ? 1.5 : 0),
		make: (c) => {
			const n = npc(c, 'official');
			return {
				id: 'informant',
				npc: n,
				text: `${n.name} offers a deal: name your old associates, and the warrants against you go quiet.`,
				left: ch('Never', { renown: 4, fortune: 3 }),
				right: ch('Talk', { renown: -12, silver: 6 }, { tags: ['cruel'], heat: -40, clearFlag: ['society'], text: 'Clean record. Dirty hands.' })
			};
		}
	}
];

export const RETINUE: Template[] = [
	{
		id: 'crew-quarrel',
		where: 'any',
		weight: 1.5,
		when: (c) => c.run.crew.length >= 2,
		make: (c) => {
			const [a, b] = c.rng.sample(c.run.crew, 2);
			return {
				id: 'crew-quarrel',
				npc: a.npc,
				text: `${a.npc.name} and ${b.npc.name} are shouting over ${c.rng.pick(['the last dumpling', 'who snores', 'a game of cards', 'an old insult', 'the best route'])}. Both look to you.`,
				left: ch(`Side with ${b.npc.name}`, {}, { setFlag: { ['loy:' + b.id]: 15, ['loy:' + a.id]: -20 }, text: `${a.npc.name} sulks for days.` }),
				right: ch(`Side with ${a.npc.name}`, {}, { setFlag: { ['loy:' + a.id]: 15, ['loy:' + b.id]: -20 }, text: `${b.npc.name} mutters darkly.` }),
				up: has(c, 'silver-tongue') || has(c, 'envoy') ? up('Diplomat', 'Broker a peace', { renown: 3 }, { loyalty: 8, text: 'By supper they are toasting each other.' }) : undefined
			};
		}
	},
	{
		id: 'crew-betrayal',
		where: 'any',
		weight: (c) => (c.run.crew.some((m) => m.loyalty < 30) ? 5 : 0),
		make: (c) => {
			const m = c.run.crew.filter((x) => x.loyalty < 30).sort((a, b) => a.loyalty - b.loyalty)[0];
			const loot = c.run.bag.filter((id) => ITEMS[id]?.kind !== 'relic');
			const item = loot.length ? c.rng.pick(loot) : null;
			return {
				id: 'crew-betrayal',
				npc: m.npc,
				text: `You wake to find ${m.npc.name}'s bedroll empty — and ${item ? `your ${ITEMS[item].name.toLowerCase()}` : 'your purse'} gone with it. A note: "Unpaid. Unloved. Goodbye."`,
				left: ch('Let them go', { fortune: -4 }, { crewRemove: m.id, ...(item ? { itemRemove: [item] } : { fx: { silver: -10 } }), text: 'A lesson in wages.' }),
				right: ch('Give chase', {}, { crewRemove: m.id, gamble: { p: odds(c, 0.45, ['fight']), win: { fx: { renown: 4 }, text: 'You catch them at the crossroads and take it back.' }, lose: { fx: { vigor: -8, silver: item ? 0 : -10 }, text: 'Gone into the hills.' } }, ...(item ? { itemRemove: [item] } : {}) })
			};
		}
	},
	{
		id: 'crew-tale',
		where: 'travel',
		weight: 1.4,
		when: (c) => c.run.crew.length > 0,
		make: (c) => {
			const m = c.rng.pick(c.run.crew);
			const tale = c.rng.pick([
				'about the sister they left behind',
				'about the day they almost became a monk',
				'about a ghost ship they once crewed',
				`about growing up poor in ${c.rng.pick(['a fishing village', 'a salt mine', 'a temple orphanage', 'a palace kitchen'])}`,
				'about the one who got away'
			]);
			return {
				id: 'crew-tale',
				npc: m.npc,
				text: `Around the fire, ${m.npc.name} tells a story ${tale}. They look at you to see if you're listening.`,
				left: ch('Doze off', { vigor: 4 }, { setFlag: { ['loy:' + m.id]: -8 } }),
				right: ch('Listen, and share yours', { fortune: 4 }, { setFlag: { ['loy:' + m.id]: 14 }, text: `${m.npc.name} smiles for the first time in weeks.` })
			};
		}
	},
	{
		id: 'crew-homesick',
		where: 'city',
		weight: 1,
		when: (c) => c.run.crew.some((m) => m.npc.culture === c.city.culture && m.role !== 'companion'),
		make: (c) => {
			const m = c.run.crew.find((x) => x.npc.culture === c.city.culture && x.role !== 'companion')!;
			return {
				id: 'crew-homesick',
				npc: m.npc,
				text: `${m.npc.name} stares at the familiar roofs of ${place(c)}. "My family is near. I could... stay. If you can spare me."`,
				left: ch('"I need you."', {}, { setFlag: { ['loy:' + m.id]: -15 }, text: 'They nod, and do not speak the rest of the day.' }),
				right: ch('Release them with a gift', { silver: -4, fortune: 10 }, { crewRemove: m.id, text: 'They bow deeply, and run toward home.' })
			};
		}
	},
	{
		id: 'bodyguard-wound',
		where: 'travel',
		weight: (c) => (withCrew(c, 'bodyguard') ? 1 : 0),
		make: (c) => {
			const m = c.run.crew.find((x) => x.role === 'bodyguard')!;
			return {
				id: 'bodyguard-wound',
				npc: m.npc,
				text: `An arrow from the treeline — ${m.npc.name} throws you down and takes it in the shoulder.`,
				left: ch('Pay for a surgeon', { silver: -8 }, { setFlag: { ['loy:' + m.id]: 25 }, days: 1, text: '"Twice now you have kept me alive," they say. "We are even."' }),
				right: ch('Leave them to recover', { fortune: -6 }, { crewRemove: m.id, text: 'You leave silver with a farmer. You do not look back.' })
			};
		}
	},
	{
		id: 'lovers-moment',
		where: 'any',
		weight: 1.2,
		when: (c) => c.run.crew.some((m) => m.role === 'companion'),
		make: (c) => {
			const m = c.run.crew.find((x) => x.role === 'companion')!;
			return {
				id: 'lovers-moment',
				npc: m.npc,
				text: `${m.npc.name} wakes you before dawn. "Come see." The ${c.where === 'travel' ? 'sea' : 'city'} is gold and silent. They take your hand.`,
				left: ch('Go back to sleep', { vigor: 6 }, { setFlag: { ['loy:' + m.id]: -10 } }),
				right: ch('Watch the sunrise together', { fortune: 8, vigor: 4 }, { tags: ['romance'], setFlag: { ['loy:' + m.id]: 10 }, text: 'For a moment there is no commission, no deadline.' })
			};
		}
	},
	{
		id: 'mount-thief',
		where: 'city',
		tags: ['crime'],
		weight: (c) => (c.run.mount ? 1 : 0),
		make: (c) => {
			const m = c.run.mount!;
			const n = npc(c, 'bandit', { title: 'Horse thief' });
			return {
				id: 'mount-thief',
				npc: n,
				text: `A shadow in the stable — ${n.name} is leading ${m.name} out by the halter!`,
				left: ch('Let it go', {}, { mount: 'none', text: `Goodbye, ${m.name}.` }),
				right: ch('Grab a lantern and chase', {}, { tags: ['fight'], gamble: { p: odds(c, 0.55, ['fight']), win: { fx: { renown: 3 }, text: `${m.name} bites the thief. You barely needed to help.` }, lose: { fx: { vigor: -8 }, text: 'Gone into the dark.', mount: 'none' } } }),
				up: m.kind === 'camel' || m.kind === 'donkey' || m.kind === 'mule' ? up(MOUNTS[m.kind].name, 'Whistle once', {}, { text: `${m.name} plants its feet and refuses to move. The thief gives up.` }) : undefined
			};
		}
	},
	{
		id: 'mount-sick',
		where: 'any',
		weight: (c) => (c.run.mount && c.run.mount.health < 45 ? 4 : 0),
		make: (c) => {
			const m = c.run.mount!;
			const n = npc(c, 'healer', { title: 'Animal doctor' });
			return {
				id: 'mount-sick',
				npc: n,
				text: `${m.name} is thin and stumbling. ${n.name} shakes their head. "Rest and good fodder, or this beast won't last the month."`,
				left: ch('Sell it for meat', { silver: Math.round(MOUNTS[m.kind].price / 4), fortune: -6 }, { mount: 'none', text: 'You don’t eat that night.' }),
				right: ch('Pay for care', { silver: -6 }, { days: 1, mountHurt: -50, text: `${m.name} eats like a king and recovers.` })
			};
		}
	},
	{
		id: 'mount-hero',
		where: 'travel',
		modes: ['land', 'river'],
		weight: (c) => (c.run.mount && c.run.mount.health > 60 ? 0.8 : 0),
		make: (c) => {
			const m = c.run.mount!;
			const n = npc(c, 'elder');
			return {
				id: 'mount-hero',
				npc: n,
				text: `${m.name} suddenly refuses to cross the bridge. ${n.name} the ferryman squints: the planks are rotten through.`,
				left: ch('Trust the beast', { fortune: 6 }, { days: 1, text: `The bridge collapses an hour later. ${m.name} gets an extra apple.` }),
				right: ch('Drag it across', {}, { gamble: { p: 0.35, win: { fx: { renown: 2 }, text: 'Somehow it holds.' }, lose: { fx: { vigor: -14 }, text: 'Splash. You should have listened.' } } })
			};
		}
	},
	{
		id: 'hire-porters',
		where: 'city',
		weight: (c) => (c.run.bag.length >= 5 && !c.run.mount ? 2 : 0),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Porter boss' });
			return {
				id: 'hire-porters',
				npc: n,
				text: `${n.name} watches you stagger under your luggage. "My cousins will carry it to the next city. Cheap."`,
				left: ch('Carry it yourself', { vigor: -6 }),
				right: ch('Hire porters', { silver: -5, vigor: 4 }, { text: 'Your load bobs ahead on four strong backs.' })
			};
		}
	}
];

