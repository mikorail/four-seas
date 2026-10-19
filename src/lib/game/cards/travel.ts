import { CULTURES } from '#lib/data/cultures';
import { CITIES, cityExists, cityName } from '#lib/data/world';
import { MOUNTS } from '#lib/data/items';
import { caravanAt, caravanOnRoute, isWarZone } from '../events';
import { carrying, ch, has, inCulture, npc, odds, up, withCrew, dressed, type Template } from './helpers';

export const TRAVEL: Template[] = [
	// ===== land =====
	{
		id: 'bandits',
		where: 'travel',
		modes: ['land'],
		tags: ['fight', 'crime'],
		weight: (c) => (withCrew(c, 'guide') ? 1.5 : 3),
		make: (c) => {
			const n = npc(c, 'bandit');
			const p = odds(c, 0.45, ['fight']);
			return {
				id: 'bandits',
				npc: n,
				text: `Masked riders spill from the ${c.rng.pick(['bamboo', 'ravine', 'dunes', 'pines', 'rocks'])}. "Your silver, ${c.run.hero.gender === 'f' ? 'lady' : 'traveller'}, or your blood."`,
				left: ch('Draw steel', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 12, vigor: -6 }, remember: { kind: 'favor', deed: 'beat them on the road — and spared their lives' }, text: 'You disarm their leader and let them all go. Word of your blade — and your mercy — spreads.' }, lose: { fx: { vigor: -20, silver: -8 }, text: 'You wake in a ditch, lighter and bloodier.' } } }),
				right: ch('Pay them off', { silver: -14 }, { tags: ['crime', 'bribe'], text: 'They count it twice, then wave you on with mock bows.' }),
				up: dressed(c, 'samurai-armor', 'janissary-uniform', 'company-uniform')
					? up('Armour & uniform', 'Stand in the road in full kit', { renown: 8 }, { tags: ['fight'], text: 'They take one look at the armour and decide to rob someone else.' })
					: dressed(c, 'monk-robes', 'beggar-rags')
						? up(dressed(c, 'monk-robes') ? 'Monk’s robes' : 'Beggar’s rags', 'Show them your empty bowl', { fortune: 3 }, { text: 'Even bandits do not rob monks and beggars. One gives you a coin.' })
						: withCrew(c, 'bodyguard')
					? up('Bodyguard', 'Let your bodyguard handle it', { renown: 8 }, { tags: ['fight'], loyalty: 6, text: 'Three bandits flee. Your guard wipes the blade and says nothing.' })
					: c.run.mount && c.run.mount.kind === 'horse'
						? up('Horse', 'Gallop through them', { renown: 5, vigor: -3 }, { mountHurt: 10, text: 'Hooves, dust, shouting — and then only wind.' })
						: undefined
			};
		}
	},
	{
		id: 'tiger',
		where: 'travel',
		modes: ['land'],
		tags: ['fight'],
		when: (c) => inCulture(c, 'indian', 'siamese', 'korean', 'malay', 'viet'),
		make: (c) => {
			const p = odds(c, 0.35, ['fight']);
			return {
				id: 'tiger',
				npc: npc(c, 'tiger'),
				text: 'Two amber eyes in the tall grass. The porters freeze. The tiger has not yet decided if you are dinner.',
				left: ch('Climb a tree and wait', { vigor: -4 }, { days: 1, text: 'It circles until dusk, then grows bored. So do you.' }),
				right: ch('Stare it down', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 18, fortune: 6 }, text: 'It blinks first. Villagers will sing of this.' }, lose: { fx: { vigor: -26 }, text: 'Claws. So many claws.' } } }),
				up: c.run.mount?.kind === 'elephant' ? up('Elephant', 'Let your elephant trumpet', { renown: 10 }, { text: 'The tiger decides it has urgent business elsewhere.' }) : carrying(c, 'pistol') ? up('Pistol', 'Fire into the air', { renown: 4 }, { text: 'BANG. Grass rustles away from you, fast.' }) : undefined
			};
		}
	},
	{
		id: 'ferry',
		where: 'travel',
		modes: ['land', 'river'],
		make: (c) => {
			const n = npc(c, 'elder');
			return {
				id: 'ferry',
				npc: n,
				text: `The bridge washed out in the rains. ${n.name} owns the only boat for ten li, and the price just tripled.`,
				left: ch('Swim it', { vigor: -10 }, { text: 'Cold, brown water. You arrive gasping but proud.' }),
				right: ch('Pay the robber', { silver: -7 }, { text: 'He smiles with three teeth.' }),
				up: c.run.mount && ['horse', 'camel', 'elephant', 'yak'].includes(c.run.mount.kind) ? up(MOUNTS[c.run.mount.kind].name, `Ford it on ${c.run.mount.name}`, { vigor: -2 }, { mountHurt: 6, text: `${c.run.mount.name} wades across like it owns the river.` }) : undefined
			};
		}
	},
	{
		id: 'checkpoint',
		where: 'travel',
		modes: ['land', 'river'],
		tags: ['official'],
		weight: (c) => 2 + c.run.heat / 30,
		make: (c) => {
			const n = npc(c, 'soldier');
			const envoy = c.run.hero.profession === 'envoy';
			return {
				id: 'checkpoint',
				npc: n,
				text: envoy ? `A border post. The guard studies your envoy's seal, then you, then the seal again.` : c.run.heat > 40 ? `A toll barrier — and a wanted poster that looks a lot like you. "Papers," says the guard, squinting.` : `A toll barrier across the road. "Travel papers. And the road tax. And the other tax."`,
				left: ch('Show your papers', envoy ? { renown: 4 } : {}, { tags: ['official', 'talk'], gamble: envoy ? undefined : { p: odds(c, 0.55 - c.run.heat / 250, ['official', 'talk']), win: { fx: { renown: 3 }, text: 'Stamped and waved through.' }, lose: { fx: { renown: -8 }, days: 2, heat: 5, text: 'Something is "irregular." Two days in a cell.' } } }),
				right: ch('Grease a palm', { silver: -9 }, { tags: ['official', 'crime', 'bribe'], heat: -5, text: 'The barrier rises as if by magic.' }),
				up: carrying(c, 'papers') ? up('Forged papers', 'Present the forged papers', {}, { heat: -15, text: 'Perfect forgeries. The guard even salutes.' }) : dressed(c, 'mandarin-robe', 'janissary-uniform', 'company-uniform') ? up('Uniform of rank', 'Glare at the guard until he salutes', { renown: 3 }, { heat: -10, text: 'He salutes. He apologises. He carries your bag to the other side.' }) : dressed(c, 'beggar-rags') ? up('Beggar’s rags', 'Shuffle past with the beggars', {}, { heat: -20, text: 'Nobody asks a beggar for papers.' }) : has(c, 'polyglot') ? up('Polyglot', 'Joke in the guard’s home dialect', { renown: 3 }, { text: 'He laughs so hard he forgets the tax.' }) : undefined
			};
		}
	},
	{
		id: 'lame-mount',
		where: 'travel',
		modes: ['land'],
		when: (c) => !!c.run.mount,
		make: (c) => {
			const m = c.run.mount!;
			const n = npc(c, 'merchant');
			return {
				id: 'lame-mount',
				npc: n,
				text: `${m.name} the ${MOUNTS[m.kind].name.toLowerCase()} pulls up lame. ${n.name} happens to have a poultice. And opinions.`,
				left: ch('Rest a few days', { vigor: 3 }, { days: 2, mountHurt: -30, text: `${m.name} recovers, and forgives you.` }),
				right: ch('Push on', {}, { mountHurt: 35, text: `${m.name} limps on, glaring.` }),
				up: withCrew(c, 'healer') ? up('Physician', 'Have your physician treat it', {}, { mountHurt: -40, text: 'Bandaged and fine by noon.' }) : undefined
			};
		}
	},
	{
		id: 'porters',
		where: 'travel',
		modes: ['land'],
		when: (c) => !c.run.mount && c.run.bag.length >= 4,
		make: (c) => {
			const n = npc(c, 'merchant');
			return {
				id: 'porters',
				npc: n,
				text: `Your bag drags at your shoulders. ${n.name} offers a ${c.rng.pick(['donkey', 'mule'])} cheap — "barely used, only bites on Tuesdays."`,
				left: ch('Carry it yourself', { vigor: -8 }),
				right: ch('Buy the beast', { silver: -8 }, { tags: ['trade'], mount: c.rng.chance(0.5) ? 'donkey' : 'mule', text: 'It is Tuesday. It bites. Still, the load is off your back.' })
			};
		}
	},
	{
		id: 'shortcut',
		where: 'travel',
		modes: ['land'],
		make: (c) => {
			const n = npc(c, 'merchant');
			const p = odds(c, 0.5, ['land']);
			return {
				id: 'shortcut',
				npc: n,
				text: `"The high pass saves three days," says ${n.name}. "Ghosts? Avalanches? Pfah. Mostly."`,
				left: ch('Keep the main road', {}, { text: 'The long way round is long, and round.' }),
				right: ch('Take the pass', {}, { gamble: { p, win: { fx: { fortune: 4 }, days: -3, text: 'A breathtaking pass, and days saved.' }, lose: { fx: { vigor: -12 }, days: 3, text: 'Lost in fog for days. Never again.' } } }),
				up: withCrew(c, 'guide') ? up('Guide', 'Ask your guide', {}, { days: -3, loyalty: 4, text: 'Your guide knows a goat path. Three days saved, no ghosts.' }) : undefined
			};
		}
	},
	{
		id: 'winter-pass',
		where: 'travel',
		modes: ['land'],
		weight: 6,
		when: (c) => c.season?.id === 'winter',
		make: (c) => {
			const n = npc(c, 'elder');
			return {
				id: 'winter-pass',
				npc: n,
				text: `Snow to the knees. ${n.name}, wrapped in felt, offers shelter in a yurt until the blizzard passes.`,
				left: ch('Shelter', { vigor: 6 }, { days: 3, text: 'Mutton, kumis, and stories by the dung fire.' }),
				right: ch('Press on through the snow', { vigor: -15 }, { mountHurt: 15, text: 'Frostbitten, but moving.' }),
				up: carrying(c, 'yeti-fur') ? up('Migoi fur', 'Wrap yourself in the Migoi fur', {}, { text: 'Warm as summer. You walk through the storm humming.' }) : carrying(c, 'teabrick') ? up('Tea brick', 'Trade a tea brick for a sledge', {}, { itemRemove: ['teabrick'], days: -1, text: 'Dogs, sledge, wind in your face.' }) : undefined
			};
		}
	},
	// ===== sea =====
	{
		id: 'pirates',
		where: 'travel',
		modes: ['sea'],
		tags: ['fight', 'crime'],
		weight: 3,
		make: (c) => {
			const wokou = c.year < 1580 && inCulture(c, 'han', 'japanese', 'korean');
			const n = npc(c, 'captain', { culture: wokou ? 'japanese' : undefined, title: wokou ? 'Wokou raider' : 'Pirate captain' });
			const p = odds(c, 0.45, ['fight', 'sea']);
			return {
				id: 'pirates',
				npc: n,
				text: `Black sails on the horizon. ${n.name}'s ship closes fast. A grappling hook arcs through the air.`,
				left: ch('Repel boarders', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 14, vigor: -6 }, text: 'Pirates in the water, cheers on deck.' }, lose: { fx: { vigor: -18, silver: -12 }, text: 'They take the cargo and your good boots.' } } }),
				right: ch('Offer tribute', { silver: -16 }, { text: 'They take the silver and leave you the sea.' }),
				up: dressed(c, 'pirate-garb')
					? up('Sea rover’s rig', 'Hail them as a brother of the coast', { silver: 4 }, { tags: ['crime'], heat: 5, text: 'They take you for one of their own. You trade rum and lies until dusk.' })
					: carrying(c, 'koxinga-flag')
					? up('Koxinga’s banner', 'Raise Koxinga’s banner', { renown: 6 }, { text: 'The pirates salute and sheer away.' })
					: has(c, 'pirate')
						? up('Sea Rover', 'Hail them as an old friend', { silver: 6 }, { tags: ['crime'], heat: 8, text: 'Rum, gossip, and a share of last week’s loot.' })
						: has(c, 'polyglot')
							? up('Polyglot', 'Negotiate in their dialect', { silver: -5, renown: 4 }, { text: 'A discount for good manners.' })
							: undefined
			};
		}
	},
	{
		id: 'storm',
		where: 'travel',
		modes: ['sea'],
		tags: ['sea'],
		weight: (c) => 3 + (c.season?.risk ?? 0) * 8,
		make: (c) => {
			const n = npc(c, 'captain');
			const p = odds(c, 0.55 - (c.season?.risk ?? 0) * 0.2, ['sea']);
			const typhoon = inCulture(c, 'han', 'japanese', 'viet', 'malay') ? 'typhoon' : 'storm';
			return {
				id: 'storm',
				npc: n,
				text: `"A ${typhoon} by nightfall," growls ${n.name}, sniffing the green sky. "Run before it, or hide in the lee of that island?"`,
				left: ch('Shelter in a cove', {}, { days: 2, text: 'Two days of rain and cards in the hold.' }),
				right: ch('Run before the wind', {}, { tags: ['sea'], gamble: { p, win: { fx: { renown: 4 }, days: -1, text: 'The wind hurls you forward like a thrown spear!' }, lose: { fx: { vigor: -16, fortune: -6 }, days: 1, text: 'The mast cracks. You are sick for days.' } } }),
				up: withCrew(c, 'navigator') ? up('Navigator', 'Let your navigator read the swell', {}, { loyalty: 4, text: 'A gap in the storm, threaded like a needle.' }) : has(c, 'stargazer') ? up('Stargazer', 'Steer by the last visible star', { fortune: 4 }, { text: 'One star, one gap in the clouds. Enough.' }) : undefined
			};
		}
	},
	{
		id: 'becalmed',
		where: 'travel',
		modes: ['sea'],
		tags: ['faith', 'sea'],
		make: (c) => {
			const n = npc(c, 'sailor');
			const godname = c.local.id === 'han' || c.local.id === 'viet' ? 'Mazu, Lady of the Sea' : c.local.id === 'japanese' ? 'Sumiyoshi' : c.local.holyPlace === 'mosque' ? 'the saints of the sea' : 'the sea spirits';
			return {
				id: 'becalmed',
				npc: n,
				text: `Flat calm. The sails hang like laundry. ${n.name} wants to make an offering to ${godname}.`,
				left: ch('Row instead', { vigor: -9 }, { text: 'Blisters. The breeze returns, mocking you.' }),
				right: ch('Join the offering', { silver: -4, fortune: 10 }, { tags: ['faith'], days: 1, text: 'Incense on the water. By dawn, wind.' })
			};
		}
	},
	{
		id: 'stowaway',
		where: 'travel',
		modes: ['sea', 'river'],
		make: (c) => {
			const n = npc(c, 'child');
			return {
				id: 'stowaway',
				npc: n,
				text: `A child crawls out of a rice barrel, blinking. ${n.name}, maybe nine, asks you not to tell the captain.`,
				left: ch('Hand them over', { fortune: -10, renown: 2 }, { tags: ['cruel'], remember: { kind: 'grudge', deed: 'handed them to a cruel captain' }, text: 'The captain is not gentle. You do not sleep well.' }),
				right: ch('Pay their passage', { silver: -6, fortune: 12 }, { tags: ['mercy'], remember: { kind: 'favor', deed: 'paid a stowaway\u2019s passage' }, text: 'They follow you for the rest of the voyage, grinning.' })
			};
		}
	},
	{
		id: 'sea-beast',
		where: 'travel',
		modes: ['sea'],
		tags: ['faith'],
		make: (c) => {
			const n = npc(c, 'sailor');
			const beast = c.rng.pick(['a sea dragon', 'a whale as long as a temple', 'the great turtle that carries islands', 'a glowing serpent']);
			return {
				id: 'sea-beast',
				npc: n,
				text: `"Look!" ${n.name} points. Something huge breaches beside the hull — ${beast}. The crew falls to its knees.`,
				left: ch('It is just a fish', { fortune: -6, renown: 3 }, { text: 'The crew mutters about your irreverence.' }),
				right: ch('Bow to it', { fortune: 9 }, { tags: ['faith'], text: 'It sinks slowly, as if nodding back.' })
			};
		}
	},
	{
		id: 'drinking',
		where: 'travel',
		modes: ['sea', 'river'],
		tags: ['gamble'],
		make: (c) => {
			const n = npc(c, 'sailor');
			const p = odds(c, 0.45, ['gamble']);
			return {
				id: 'drinking',
				npc: n,
				text: `${n.name} slams down a jug of ${c.local.drink}. "Outdrink me, and I'll tell the whole deck you're the toughest landlubber alive."`,
				left: ch('Decline politely', { renown: -3 }),
				right: ch('Drink!', {}, { tags: ['gamble', 'food'], gamble: { p, win: { fx: { renown: 10, vigor: -4 }, text: 'They carry them below. Legend.' }, lose: { fx: { vigor: -12, renown: -4 }, text: 'You remember nothing. They remember everything.' } } }),
				up: has(c, 'iron-stomach') ? up('Iron Stomach', 'Drink the whole jug, then theirs', { renown: 14 }, { text: 'The deck chants your name. You are not even dizzy.' }) : undefined
			};
		}
	},
	{
		id: 'deck-dice',
		where: 'travel',
		modes: ['sea', 'river'],
		tags: ['gamble'],
		make: (c) => {
			const n = npc(c, 'sailor');
			const p = odds(c, 0.42, ['gamble']);
			return {
				id: 'deck-dice',
				npc: n,
				text: `Below deck, a game of ${c.local.game}. ${n.name} pushes a stool toward you. "Just a little stake. For friendship."`,
				left: ch('Watch only', {}),
				right: ch('Stake your silver', {}, { tags: ['gamble'], gamble: { p, win: { fx: { silver: 16, fortune: 2 }, text: 'Your pile grows. Their smiles shrink.' }, lose: { fx: { silver: -12 }, text: 'Friendship is expensive.' } } }),
				up: withCrew(c, 'thief') ? up('Cat burglar', 'Have your burglar mark the dice', { silver: 14 }, { tags: ['crime'], heat: 6, text: 'Funny how often you roll sixes.' }) : undefined
			};
		}
	},
	{
		id: 'monsoon',
		where: 'travel',
		modes: ['sea'],
		weight: (c) => (c.season?.id === 'monsoon' ? 6 : 1),
		when: (c) => inCulture(c, 'indian', 'malay', 'persian', 'swahili', 'siamese'),
		make: (c) => {
			const n = npc(c, 'captain');
			const p = odds(c, 0.45, ['sea']);
			return {
				id: 'monsoon',
				npc: n,
				text: `"The monsoon turns," ${n.name} warns. "We can wait for the winds to settle, or fight them."`,
				left: ch('Wait in port', { vigor: 4 }, { days: 4, text: 'Four days of rain on palm thatch.' }),
				right: ch('Fight the winds', {}, { tags: ['sea'], gamble: { p, win: { fx: { renown: 6 }, text: 'Hard sailing, but you make it.' }, lose: { fx: { vigor: -14 }, days: 3, text: 'Driven back, battered, and late.' } } })
			};
		}
	},
	{
		id: 'navigator-tip',
		where: 'travel',
		modes: ['sea'],
		tags: ['talk', 'foreign'],
		make: (c) => {
			const n = npc(c, 'sailor', { foreign: true });
			return {
				id: 'navigator-tip',
				npc: n,
				text: `${n.name}, a ${CULTURES[n.culture].adjective} navigator, unrolls a battered rutter of secret currents. "For a few coins I'll mark your next voyage."`,
				left: ch('Keep your coins', {}),
				right: ch('Buy the knowledge', { silver: -5, renown: 2 }, { tags: ['foreign'], setFlag: { tip: 1 }, text: 'Your next journey will be swifter.' })
			};
		}
	},
	{
		id: 'mount-at-sea',
		where: 'travel',
		modes: ['sea'],
		weight: 2,
		when: (c) => !!c.run.mount,
		make: (c) => {
			const m = c.run.mount!;
			const n = npc(c, 'sailor');
			return {
				id: 'mount-at-sea',
				npc: n,
				text: `${m.name} hates the ship. ${n.name} reports it has kicked a hole in the bulkhead and eaten a sail. "Pay for damages, or it goes overboard."`,
				left: ch('Pay for damages', { silver: -7 }, { text: `${m.name} looks unrepentant.` }),
				right: ch('Sell it at the next port', { silver: 5 }, { mount: 'none', text: `Goodbye, ${m.name}. You will miss the smell. Slightly.` })
			};
		}
	},
	// ===== any travel =====
	{
		id: 'sick-traveller',
		where: 'travel',
		tags: ['illness'],
		make: (c) => {
			const n = npc(c, 'elder');
			return {
				id: 'sick-traveller',
				npc: n,
				text: `${n.name} lies shivering by the road, burning with fever. The others give a wide berth.`,
				left: ch('Keep your distance', { fortune: -8 }, { tags: ['cruel'], text: 'You look back once. Then not again.' }),
				right: ch('Tend to them', { vigor: -10, fortune: 12 }, { tags: ['illness', 'mercy'], remember: { kind: 'favor', deed: 'nursed them through a fever' }, text: 'They live. You catch a cough, and a blessing.' }),
				up: carrying(c, 'medicine') ? up('Medicine chest', 'Share your medicine', { fortune: 14, renown: 4 }, { itemRemove: ['medicine'], text: 'The fever breaks by morning.' }) : undefined
			};
		}
	},
	{
		id: 'pilgrims',
		where: 'travel',
		tags: ['faith'],
		make: (c) => {
			const n = npc(c, 'monk');
			return {
				id: 'pilgrims',
				npc: n,
				text: `${n.name} and a line of pilgrims ask to share the road. They walk slowly, and chant constantly.`,
				left: ch('Go on alone', {}, { text: 'Silence returns. Mostly.' }),
				right: ch('Walk with them', { fortune: 9, vigor: 3 }, { tags: ['faith'], days: 1, text: 'Slow, but no bandit dares trouble holy folk.' })
			};
		}
	},
	{
		id: 'ruin',
		where: 'travel',
		make: (c) => {
			const n = npc(c, 'ghost');
			const p = odds(c, 0.5, []);
			return {
				id: 'ruin',
				npc: n,
				text: `A ruined ${c.local.holyPlace}, swallowed by vines. Something glints within — and you swear a pale figure watches from the gate.`,
				left: ch('Bow and pass', { fortune: 5 }, { tags: ['faith'] }),
				right: ch('Explore inside', {}, { gamble: { p, win: { fx: { silver: 16 }, text: 'Old offering coins! The ghost does not object.' }, lose: { fx: { vigor: -10, fortune: -10 }, text: 'Cold hands on your neck. You flee.' } } }),
				up: carrying(c, 'lantern') ? up('Paper lantern', 'Light your lantern and enter', { silver: 12, fortune: 4 }, { text: 'The ghost bows to the lantern and points to a loose stone.' }) : undefined
			};
		}
	},
	{
		id: 'hungry-ghost',
		where: 'travel',
		tags: ['faith'],
		when: (c) => inCulture(c, 'han', 'viet', 'japanese', 'korean', 'malay', 'siamese'),
		make: (c) => ({
			id: 'hungry-ghost',
			npc: npc(c, 'ghost'),
			text: `At midnight a thin voice: "I died far from home, with no one to burn offerings for me. Feed me."`,
			left: ch('Ignore it', { fortune: -12 }, { tags: ['cruel'], text: 'It wails until dawn. Your luck curdles.' }),
			right: ch('Offer food & paper money', { silver: -3, fortune: 12 }, { tags: ['faith'], text: 'A sigh like wind in bamboo. Then peace.' }),
			up: carrying(c, 'rations') ? up('Rations', 'Share your rations', { fortune: 14 }, { itemRemove: ['rations'], text: 'It eats, weeps, and fades.' }) : undefined
		})
	},
	{
		id: 'tall-tales',
		where: 'travel',
		tags: ['talk', 'foreign'],
		make: (c) => {
			const n = npc(c, 'merchant', { foreign: true });
			return {
				id: 'tall-tales',
				npc: n,
				text: `Round the evening fire, ${n.name} from ${CULTURES[n.culture].homeland} trades tales. They want one of yours.`,
				left: ch('Tell the truth', { fortune: 4 }, { tags: ['talk'], text: 'A modest tale, modestly received.' }),
				right: ch('Embellish wildly', { renown: 9, fortune: -4 }, { tags: ['talk'], text: 'By morning you have slain a dragon. Allegedly.' })
			};
		}
	},
	{
		id: 'lost-noble',
		where: 'travel',
		make: (c) => {
			const n = npc(c, 'noble');
			return {
				id: 'lost-noble',
				npc: n,
				text: `${n.name}, a ${n.title.toLowerCase()}'s heir, has lost their retinue and is very obviously lost. And very obviously rich.`,
				left: ch('Escort them home', { renown: 12, silver: 6 }, { tags: ['loyal', 'mercy'], remember: { kind: 'favor', deed: 'escorted them home safely' }, days: 2, text: 'Gratitude, a purse, and a powerful friend.' }),
				right: ch('Point the way and go', { fortune: 2 }, { text: '"Left at the big rock." You hope there is a big rock.' }),
				up: has(c, 'wanted') || has(c, 'outlaw') || withCrew(c, 'thief') ? up('Criminal instincts', 'Hold them for ransom', { silver: 25, fortune: -10 }, { tags: ['crime', 'cruel'], heat: 30, text: 'The family pays. The magistrates will remember your face.' }) : undefined
			};
		}
	},
	{
		id: 'treasure-map-get',
		where: 'travel',
		once: true,
		weight: 0.8,
		make: (c) => {
			const n = npc(c, 'sailor');
			const t = c.rng.pick(CITIES.filter((x) => cityExists(x, c.year) && x.id !== c.city.id));
			return {
				id: 'treasure-map-get',
				npc: n,
				text: `${n.name}, dying of a wound, presses a stained map into your hand. "Buried... in ${cityName(t, c.year)}. Under the ${c.rng.pick(['old banyan', 'third stone lantern', 'broken well', 'temple bell'])}..."`,
				left: ch('Leave it with him', { fortune: 3 }),
				right: ch('Take the map', { fortune: -2 }, { setFlag: { treasure: t.id }, text: `Somewhere in ${cityName(t, c.year)}, treasure waits.` })
			};
		}
	},
	{
		id: 'galleon',
		where: 'travel',
		weight: 6,
		when: (c) => c.mode === 'sea' && ((c.from?.id === 'manila' && c.city.id === 'acapulco') || (c.from?.id === 'acapulco' && c.city.id === 'manila')),
		make: (c) => ({
			id: 'galleon',
			npc: npc(c, 'captain', { culture: 'european' }),
			text: `Four months across the empty Pacific. Scurvy stalks the decks of the Manila galleon. The captain rations the limes.`,
			left: ch('Share your rations', { vigor: -12, fortune: 10, renown: 6 }, { tags: ['mercy'] }),
			right: ch('Hoard your food', { vigor: 4, fortune: -10 }, { tags: ['cruel'], text: 'You survive. Others do not.' }),
			up: withCrew(c, 'cook') ? up('Road cook', 'Let your cook work miracles with seaweed', { vigor: 6, renown: 8 }, { loyalty: 6, text: 'Nobody dies of scurvy on your watch.' }) : undefined
		})
	},
	{
		id: 'pirate-queen',
		where: 'travel',
		modes: ['sea'],
		once: true,
		weight: 5,
		when: (c) => c.year >= 1801 && c.year <= 1810 && inCulture(c, 'han', 'viet'),
		make: (c) => {
			const n = npc(c, 'captain', { culture: 'han', gender: 'f', name: 'Ching Shih', title: 'Pirate queen' });
			return {
				id: 'pirate-queen',
				npc: n,
				badge: 'Local Legend',
				text: `Your ship is surrounded by hundreds of junks. Their commander, the legendary ${n.name}, offers protection — for a fee.`,
				left: ch('Refuse her', {}, { legend: 'ching-shih', gamble: { p: odds(c, 0.2, ['fight']), win: { fx: { renown: 25 }, text: 'Impossibly, you escape. Songs will be sung.' }, lose: { fx: { silver: -22, vigor: -10 }, text: 'Refusing her was unwise.' } } }),
				right: ch('Pay protection', { silver: -12, renown: 4 }, { legend: 'ching-shih', text: 'A pass bearing her seal. No pirate will touch you now.' }),
				up: has(c, 'pirate') ? up('Sea Rover', 'Ask to join her fleet for a season', { silver: 20, renown: 10 }, { legend: 'ching-shih', heat: 25, days: 6, tags: ['crime'], text: 'Six days of plunder under the red flag.' }) : undefined
			};
		}
	},
	// ===== accidents & travel mishaps leading to unmarked settlements =====
	{
		id: 'accident-shipwreck',
		where: 'travel',
		modes: ['sea'],
		weight: 1.6,
		when: (c) => !c.run.flags.detour && !c.run.flags.inDetour,
		make: (c) => {
			const n = npc(c, 'sailor');
			const p = odds(c, 0.45, ['sea']);
			return {
				id: 'accident-shipwreck',
				npc: n,
				text: `CRUNCH! A sickening shudder runs through the timbers. Hidden shoals in thick fog tear the keel open! Water gushes through the floorboards.`,
				left: ch('Abandon ship for the unknown coast', { vigor: -8, silver: -6 }, { setFlag: { detour: 'cove' }, days: 3, text: 'You cling to drifting spar timber and wash ashore on an uncharted shingle beach.' }),
				right: ch('Fight the breakers to salvage cargo', {}, { gamble: { p, win: { fx: { renown: 8, vigor: -4 }, setFlag: { detour: 'cove' }, days: 2, text: 'You drag waterlogged crates onto the sand before the surf breaks the hull. Smoke rises from huts ahead.' }, lose: { fx: { vigor: -16, silver: -12 }, setFlag: { detour: 'cove' }, days: 4, text: 'Pounded against black rocks, you are pulled onto the sand half-drowned by local net-weavers.' } } }),
				up: withCrew(c, 'navigator')
					? up('Navigator', 'Let your navigator steer through the breach', { renown: 6 }, { setFlag: { detour: 'cove' }, days: 2, loyalty: 6, text: 'Your navigator threads the jagged teeth of the reef into a quiet, sheltered fisher cove.' })
					: undefined
			};
		}
	},
	{
		id: 'accident-rockslide',
		where: 'travel',
		modes: ['land'],
		weight: 1.6,
		when: (c) => !c.run.flags.detour && !c.run.flags.inDetour,
		make: (c) => {
			const n = npc(c, 'elder');
			const p = odds(c, 0.45, ['land']);
			return {
				id: 'accident-rockslide',
				npc: n,
				text: `A roar like falling thunder shakes the canyon! Boulders and slate crash across the road, burying the highway under a mountain of scree.`,
				left: ch('Follow a winding goat track into the valley', { vigor: -6 }, { setFlag: { detour: 'hamlet' }, days: 3, text: 'Scrambling through mossy gullies, you discover an unmapped mountain hamlet ringed by mist.' }),
				right: ch('Climb over the fresh rubble', {}, { gamble: { p, win: { fx: { renown: 6, vigor: -4 }, days: 1, text: 'Dust, bleeding knuckles, and scrambling — but you crest the slide and find the high trail.' }, lose: { fx: { vigor: -16, silver: -4 }, setFlag: { detour: 'hamlet' }, days: 4, text: 'A slip in the scree sends you tumbling into a terraced valley where highland villagers carry you to their hearth.' } } }),
				up: withCrew(c, 'guide')
					? up('Guide', 'Your guide spots an ancient herder path', { renown: 4 }, { setFlag: { detour: 'hamlet' }, days: 2, loyalty: 6, text: 'Your guide leads your party down through rhododendron groves into an idyllic hidden settlement.' })
					: undefined
			};
		}
	},
	{
		id: 'accident-sandstorm',
		where: 'travel',
		modes: ['land'],
		weight: 1.6,
		when: (c) => inCulture(c, 'steppe', 'persian', 'ottoman') && !c.run.flags.detour && !c.run.flags.inDetour,
		make: (c) => {
			const n = npc(c, 'merchant');
			const p = odds(c, 0.4, ['land']);
			return {
				id: 'accident-sandstorm',
				npc: n,
				text: `The horizon turns yellow-black. The simoom strikes with screaming fury, burying tracks, cairns, and sun beneath a howling tempest of grit.`,
				left: ch('Huddle with the pack beasts and wait', { vigor: -8 }, { setFlag: { detour: 'oasis' }, days: 4, text: 'When the wind calms, all dunes have shifted. In the distance, wild date palms mark an unmapped spring.' }),
				right: ch('Navigate by dead reckoning through the gale', {}, { gamble: { p, win: { fx: { fortune: 6, renown: 6 }, days: 1, text: 'By miracle, you keep your bearings and emerge at the edge of the desert.' }, lose: { fx: { vigor: -18, silver: -6 }, setFlag: { detour: 'oasis' }, days: 5, text: 'Parched and disoriented, you stumble toward the sound of sheep bells in a hidden nomad oasis.' } } }),
				up: has(c, 'stargazer') || carrying(c, 'compass')
					? up('Stargazer / Compass', 'Read the stars at twilight', { fortune: 8 }, { setFlag: { detour: 'oasis' }, days: 2, text: 'A single star through the dust haze leads you straight to a crystal spring.' })
					: undefined
			};
		}
	},
	{
		id: 'accident-river-spate',
		where: 'travel',
		modes: ['river'],
		weight: 1.6,
		when: (c) => !c.run.flags.detour && !c.run.flags.inDetour,
		make: (c) => {
			const n = npc(c, 'sailor');
			const p = odds(c, 0.45, ['sea']);
			return {
				id: 'accident-river-spate',
				npc: n,
				text: `Swollen by flash rains in the hills, the river surges into foam! A submerged tree trunk snaps your steering oar with a sickening crack.`,
				left: ch('Steer the hull into the reed marshes', { vigor: -6 }, { setFlag: { detour: 'reed-village' }, days: 3, text: 'The craft slides softly into deep mud. Smoke curls from stilt huts across the reeds.' }),
				right: ch('Pole desperately against the current', {}, { gamble: { p, win: { fx: { renown: 8 }, days: 1, text: 'Your shoulders strain to the limit. The craft clears the whirlpools into calm water.' }, lose: { fx: { vigor: -14, silver: -8 }, setFlag: { detour: 'reed-village' }, days: 4, text: 'The boat capsizes in the shallows. Smiling river-folk pole over in sampans to pull you out.' } } }),
				up: has(c, 'polyglot') || withCrew(c, 'guide')
					? up('River knowledge', 'Hail the stilt-dwellers for lines', { fortune: 6 }, { setFlag: { detour: 'reed-village' }, days: 2, text: 'They toss thick braided ropes and pull your craft safely into their private creek.' })
					: undefined
			};
		}
	},
	// ===== Caravans & Nomadic Encampments =====
	{
		id: 'caravan-nomads',
		where: 'travel',
		modes: ['land'],
		weight: 2.5,
		when: (c) => !!caravanAt(c.run, c.city.id) || (!!c.run.route && !!caravanOnRoute(c.run, c.run.route.from, c.run.route.to)),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Kirghiz caravan elder' });
			const war = isWarZone(c.run, c.city.id);
			return {
				id: 'caravan-nomads',
				npc: n,
				text: `You intercept a migrating Kirghiz nomadic encampment! Dozens of felt yurts, shaggy horses, and camel trains march to new pastures under fluttering horsehair banners.`,
				left: ch('Share roasted mutton and kumis by the yurt hearth', { vigor: 16, fortune: 8 }, { faction: { outlaw: 10, mercenary: 10 }, text: 'Bowl after bowl of fermented mare’s milk and rich fatty broth. The nomads laugh at your road tales.' }),
				right: ch('Barter with the nomad drovers without tariffs', { silver: -6 }, { tags: ['trade'], itemAdd: ['good:horses'], faction: { guild: 10 }, text: 'You barter directly for fine steppe horses and furs at un-taxed nomad prices.' }),
				up: war || c.run.heat >= 20
					? up('Nomad cavalry', 'Ride escorted beneath the caravan’s armed horse archers', { renown: 8 }, { heat: -25, days: -1, text: 'The bristling horse archers escort you straight through the warzone without a single checkpoint challenging your baggage.' })
					: undefined
			};
		}
	},
	{
		id: 'caravan-hajj',
		where: 'travel',
		modes: ['land'],
		weight: 2.2,
		when: (c) => (c.city.id === 'mecca' || c.city.id === 'cairo' || c.city.id === 'damascus' || c.city.id === 'baghdad' || inCulture(c, 'ottoman', 'persian')) && !!(c.run.world ?? []).some(w => w.id === 'caravan-hajj'),
		make: (c) => {
			const n = npc(c, 'monk', { title: 'Caravan Emir' });
			return {
				id: 'caravan-hajj',
				npc: n,
				text: `The road merges with the Great Hajj Pilgrim Caravan! Thousands of white-clad believers, camel litters, scholars, and Janissary guards move under green silken banners toward the holy sanctuaries.`,
				left: ch('March alongside the pilgrims and share your bread', { vigor: 8, fortune: 16 }, { karma: 14, tags: ['faith', 'mercy'], faction: { faith: 20 }, text: 'Chanting litanies beneath the desert stars, a profound wave of peace settles over your spirit.' }),
				right: ch('Buy Syrian incense, rosewater, and pilgrim beads', { silver: -8 }, { itemAdd: ['incense'], tags: ['trade'], text: 'You acquire fragrant Damascus rosewater and holy incense from the travelling dervishes.' }),
				up: c.run.hero.faith === 'islam' || carrying(c, 'charm')
					? up('Faith fellowship', 'Receive the personal blessing of the caravan Emir', { fortune: 20, renown: 10 }, { statusAdd: ['oath-keeper'], text: 'The Emir touches your forehead and gives you an embroidered green silk favor, commanding all escorts to protect you.' })
					: undefined
			};
		}
	},
	{
		id: 'caravan-tea-horse',
		where: 'travel',
		modes: ['land'],
		weight: 2.2,
		when: (c) => inCulture(c, 'tibetan', 'han') && !!(c.run.world ?? []).some(w => w.id === 'caravan-tea-horse'),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Khampa muleteer' });
			return {
				id: 'caravan-tea-horse',
				npc: n,
				text: `A train of forty pack yaks and bell-collared Tibetan ponies winds down the mountain pass. Seasoned Khampa muleteers in fleece coats guard heavy lashed bundles of compressed tea.`,
				left: ch('Share hot butter tea and tsampa around the campfire', { vigor: 16, fortune: 8 }, { itemAdd: ['teabrick'], text: 'Thick salted butter tea churned in cedar cylinders warms you down to your fingertips.' }),
				right: ch('Trade mountain goods with the muleteers', { silver: -6 }, { tags: ['trade'], itemAdd: ['curio-thangka'], text: 'You trade for a hand-painted silk thangka mandala and dried yak curd.' }),
				up: withCrew(c, 'guide') || has(c, 'polyglot')
					? up('Highland pathfinder', 'Hire a seasoned Khampa scout to lead you through the gorge', { renown: 6 }, { days: -3, mountHurt: -20, text: 'Leaping across rope bridges and goat ledges, the Khampa scout cuts three grueling days off your alpine crossing!' })
					: undefined
			};
		}
	},
	{
		id: 'caravan-spice-flotilla',
		where: 'travel',
		modes: ['sea'],
		weight: 2.5,
		when: (c) => inCulture(c, 'malay') && !!(c.run.world ?? []).some(w => w.id === 'caravan-spice-flotilla'),
		make: (c) => {
			const n = npc(c, 'captain', { title: 'Bugis sea lord' });
			return {
				id: 'caravan-spice-flotilla',
				npc: n,
				text: `A flotilla of twenty Bugis padewakang prahus sails in tight formation, their tanbark sails swelling to the monsoon! Armed with brass swivel guns, they transport royal nutmeg and cloves from the eastern islands.`,
				left: ch('Moor alongside and share palm wine and dried fish', { vigor: 14, fortune: 8 }, { faction: { guild: 10, outlaw: 10 }, text: 'Drumming and gongs echo over the moonlit water as the Bugis sailors welcome you to their flotilla.' }),
				right: ch('Barter directly for wholesale unrefined spices', { silver: -8 }, { tags: ['trade'], itemAdd: ['good:nutmeg', 'good:cloves'], text: 'Pungent bags of first-harvest nutmeg and whole cloves, purchased at direct harbor prices.' }),
				up: carrying(c, 'spyglass') || withCrew(c, 'navigator')
					? up('Flotilla escort', 'Sail in convoy within the armed prahu screen', { renown: 8 }, { days: -2, text: 'No pirate flotilla dares approach the armada of guns. The monsoon winds carry you smoothly ahead of schedule.' })
					: undefined
			};
		}
	},
	// ===== Dynasty Generational Memory =====
	{
		id: 'dynasty-ancestors-well',
		where: 'any',
		weight: 2.2,
		when: (c) => c.run.generation > 1 || carrying(c, 'ancestral-crest'),
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Village patriarch' });
			return {
				id: 'dynasty-ancestors-well',
				npc: n,
				scene: 'rustic',
				text: `In a quiet village square, an elder leans on his staff and gasps, staring at your face and token. "By Heaven... that clan sigil! Two generations ago, your forebear dug our stone well during the great drought. The village has never forgotten!"`,
				left: ch('Bow in humility and accept the village feast', { vigor: 22, fortune: 18, renown: 12 }, { karma: 14, itemAdd: ['rations'], text: 'The whole hamlet cheers! Women bring goat cheese and fresh milk; men sing ballads of your forebear.' }),
				right: ch('Carve your oath upon the memorial stele and leave silver', { silver: -6, renown: 20, fortune: 14 }, { karma: 18, statusAdd: ['oath-keeper'], text: 'You inscribe your own name below your ancestor’s. The village weeps in devotion.' }),
				up: carrying(c, 'ancestral-crest')
					? up('Ancestral crest', 'Raise the ancestral crest before the village shrine', { fortune: 24, renown: 16 }, { statusAdd: ['blessed-hands'], karma: 20, text: 'Incense rises to the heavens. The village shamans bestow a sacred ancestral blessing upon your hands.' })
					: undefined
			};
		}
	},
	{
		id: 'dynasty-spared-lineage',
		where: 'travel',
		modes: ['land'],
		weight: 2.2,
		when: (c) => c.run.generation > 1 || carrying(c, 'heirloom-blade'),
		make: (c) => {
			const n = npc(c, 'bandit', { title: 'Outlaw chieftain' });
			return {
				id: 'dynasty-spared-lineage',
				npc: n,
				text: `Highwaymen block the defile with leveled spears. But their scarred chieftain suddenly freezes, his eyes riveted to your weapon. "Hold! That silver hilt... fifty years ago, your father spared my grandfather at the high pass. We do not rob the Merciful!"`,
				left: ch('Sheath your steel and clasp his forearm in brotherhood', { renown: 12, fortune: 14 }, { faction: { outlaw: 35 }, heat: -20, text: 'Sabers are sheathed with a clatter. The outlaws roast spiced venison and toast your ancestral lineage.' }),
				right: ch('Accept an armed outlaw escort through the pass', { renown: 8 }, { days: -2, faction: { outlaw: 25 }, text: 'The bandits guide your horses through secret mountain tracks, bypassing all imperial tolls.' }),
				up: carrying(c, 'heirloom-blade')
					? up('Heirloom blade', 'Present the heirloom blade to verify the ancestral blood-bond', { silver: 16, fortune: 20 }, { faction: { outlaw: 40 }, setFlag: { tip: 1 }, text: 'Tears glisten on the chieftain’s face. He presses a pouch of stolen silver into your hand and sketches secret mountain bypasses.' })
					: undefined
			};
		}
	},
	{
		id: 'dynasty-sacred-tree',
		where: 'any',
		weight: 2,
		when: (c) => c.run.generation > 1,
		make: (c) => {
			const n = npc(c, 'monk', { title: 'Shrine keeper' });
			return {
				id: 'dynasty-sacred-tree',
				npc: n,
				scene: 'rustic',
				text: `At a roadside mountain shrine, an ancient golden ginkgo tree spreads its immense, sheltering boughs over travelers. An old monk nods: "The sapling planted two generations past by a courier of your bloodline is now the sanctuary of the entire province."`,
				left: ch('Meditate in silence beneath the great golden canopy', { vigor: 20, fortune: 20 }, { statusAdd: ['enlightened'], text: 'Golden leaves drift down upon your shoulders. Decades of striving dissolve into luminous tranquility.' }),
				right: ch('Tie a prayer ribbon bearing your family lineage', { renown: 12, fortune: 14 }, { karma: 18, text: 'The scarlet ribbon flutters alongside thousands of others. Heaven smiles upon the continuous lineage.' })
			};
		}
	}
];

// ===== Unmarked settlement card pool: intimate, meaningful, restorative encounters =====
export const UNMARKED_T: Template[] = [
	{
		id: 'unmarked-herbalist',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 2,
		make: (c) => {
			const n = npc(c, 'healer', { title: 'Village herbalist' });
			return {
				id: 'unmarked-herbalist',
				npc: n,
				scene: 'rustic',
				text: `In a quiet cottage hung with drying roots and wild chamomile, ${n.name} tends your scratches by the hearth. "The big cities only send tax-collectors and soldiers. A weary traveller we can still care for."`,
				left: ch('Drink her bitter restorative decoction', { vigor: 24, renown: -4 }, { days: 1, heat: -20, text: 'Bitter as gall, but your joints cease aching and your fever breaks completely.' }),
				right: ch('Trade tales of the four seas for dried roots', { renown: 6, fortune: 8 }, { itemAdd: ['ginseng-tonic'], text: 'The village children listen spellbound. She wraps a pouch of potent mountain roots for your pack.' }),
				up: carrying(c, 'medicine') || carrying(c, 'fever-tonic')
					? up('Apothecary goods', 'Share rare city medicines with her', { fortune: 10, vigor: 12 }, { karma: 14, text: 'She clasps your hands in gratitude: "These herbs will save three mothers this winter."' })
					: undefined
			};
		}
	},
	{
		id: 'unmarked-scholar',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 1.8,
		make: (c) => {
			const n = npc(c, 'scholar', { title: 'Exile scholar' });
			return {
				id: 'unmarked-scholar',
				npc: n,
				scene: 'rustic',
				text: `In a thatched hut shaded by wild pines, a grey-haired scholar grinding pine-soot ink pauses. "Years since the court banished me to these rocks. Here, the water sings better poetry than any courtier."`,
				left: ch('Help him copy an ancient commentary', { fortune: 8, silver: -3 }, { karma: 8, itemAdd: ['scroll'], text: 'An afternoon of quiet brushwork on handmade mulberry paper. He gifts you a scroll of wisdom.' }),
				right: ch('Ask about secret paths across the borders', { renown: 4, fortune: 6 }, { days: -1, setFlag: { tip: 1 }, text: 'He sketches an unmapped mountain trail in tea on the rough plank table. A whole day saved.' }),
				up: has(c, 'scholar') || has(c, 'bookworm')
					? up('Scholarly kinship', 'Recite the banned classical commentaries', { renown: 14, fortune: 12 }, { text: 'Tears spring to his eyes: "To hear those words again before I die! Heaven has sent you, friend."' })
					: undefined
			};
		}
	},
	{
		id: 'unmarked-dilemma',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 1.8,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Headman' });
			return {
				id: 'unmarked-dilemma',
				npc: n,
				scene: 'rustic',
				text: `The hamlet gathers anxiously around the headman. A mountain torrent has shattered their community irrigation weir; if not repaired before the sun dips, the terrace paddies will dry and wither.`,
				left: ch('Donate silver and heave stone alongside them', { silver: -10, vigor: -6, renown: 8 }, { karma: 18, tags: ['mercy'], remember: { kind: 'favor', deed: 'helped rebuild the hamlet’s broken weir' }, text: 'Muddy from collar to boots, you place the keystone as cheers ring out across the terraced valley.' }),
				right: ch('Share your travel rations and pray with them', { fortune: 6 }, { karma: 8, tags: ['faith', 'mercy'], text: 'A humble gesture of fellowship that lifts their drooping spirits.' }),
				up: withCrew(c, 'bodyguard') || withCrew(c, 'guide')
					? up('Retinue labor', 'Set your companions to coordinate the stonework', { renown: 10 }, { karma: 16, loyalty: 6, text: 'With expert levers and ropes, the weir is secured in half the time. The village weeps in gratitude.' })
					: undefined
			};
		}
	},
	{
		id: 'unmarked-shrine',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 1.8,
		make: (c) => {
			const n = npc(c, 'spirit', { title: 'Guardian of the Spring' });
			return {
				id: 'unmarked-shrine',
				npc: n,
				scene: 'rustic',
				text: `At the village spring, a mossy stone lantern and carved wooden idol stand under ancient banyan boughs. Cold, sweet water pools in a hollowed boulder.`,
				left: ch('Bow three times and leave a copper coin', { silver: -2, fortune: 14 }, { karma: 6, tags: ['faith'], text: 'A gentle rustle stirs the canopy. The knots of anxiety in your chest dissolve.' }),
				right: ch('Wash your face and fill your gourds', { vigor: 14, fortune: 4 }, { text: 'Ice-cold and pure. The travel grime of a hundred leagues washes clean away.' }),
				up: carrying(c, 'incense') || carrying(c, 'charm')
					? up('Sacred offering', 'Light fragrant incense before the idol', { fortune: 18 }, { karma: 10, text: 'Sweet smoke curls into the leaves. A feeling of divine protection envelops your path.' })
					: undefined
			};
		}
	},
	{
		id: 'unmarked-guide',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 1.8,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Highland pathfinder' });
			return {
				id: 'unmarked-guide',
				npc: n,
				scene: 'rustic',
				text: `A lean hunter resting on an ash stave looks over your travel kit. "The imperial highway ahead is washed out and crawling with toll-guards. But an old deer path skirts the gorge completely."`,
				left: ch('Hire the hunter to lead you through the pass', { silver: -6, renown: 2 }, { days: -2, text: 'A brisk march along knife-edge ridge tracks cuts two full days off your journey!' }),
				right: ch('Ask for landmark directions and proceed alone', { fortune: 4 }, { days: -1, text: '"Keep the eagle crag to your left shoulder." You follow the markers back to the highway.' }),
				up: withCrew(c, 'guide')
					? up('Guide', 'Your guide compares maps with the hunter', {}, { days: -2, loyalty: 4, text: 'Two seasoned trackers nod in agreement over drawn sticks. You strike the main road hours ahead.' })
					: undefined
			};
		}
	},
	{
		id: 'survival-camp',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 2,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Wilderness bivy' });
			return {
				id: 'survival-camp',
				npc: n,
				scene: 'rustic',
				text: `Dusk falls swiftly over the wild ravines. A piercing gale brings torrential rain and mountain mist, turning dry gullies into churning mud torrents.`,
				left: ch('Huddle beneath wet dripping boughs', { vigor: -8, fortune: 2 }, { text: 'You shiver through the endless night, drenched to the marrow.' }),
				right: ch('Stack stone slabs and pine brush for shelter', { vigor: -3, fortune: 6 }, { text: 'Smoke in your eyes, but the rough shelter turns the worst of the wind.' }),
				up: carrying(c, 'umbrella') || carrying(c, 'flint-steel')
					? up(carrying(c, 'umbrella') ? 'Oiled-paper umbrella' : 'Flint & steel', 'Pitch a dry bivy and strike a roaring fire', { vigor: 12, fortune: 10 }, { heat: -10, text: 'Under the taut oiled canopy, a crackling campfire keeps you warm, dry, and safe from prowling beasts.' })
					: undefined
			};
		}
	},
	{
		id: 'survival-foraging',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour,
		weight: 2,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Forager track' });
			const p = odds(c, 0.5, ['land']);
			return {
				id: 'survival-foraging',
				npc: n,
				scene: 'rustic',
				text: `Your travel rations run low. Across the forested ridge, wild elderberries, fiddlehead ferns, and mountain game trails wind through the bamboo.`,
				left: ch('Gather wild ferns, roots, and pine nuts', { vigor: 8, fortune: 4 }, { itemAdd: ['rations'], text: 'Wholesome wild foraging fills your cloth pouch with edible mountain greens.' }),
				right: ch('Set cord snares along animal runs', {}, { gamble: { p, win: { fx: { vigor: 14, silver: 4 }, itemAdd: ['rations'], text: 'A fat mountain hare! A hot roast over wild thyme restores strength.' }, lose: { fx: { vigor: -4 }, days: 1, text: 'The snares are sprung and empty. You lose half a day untangling briars.' } } }),
				up: carrying(c, 'hunting-knife') || has(c, 'hunter') || has(c, 'tracker')
					? up('Hunting knife', 'Field dress mountain game with clean steel', { vigor: 18, silver: 6 }, { itemAdd: ['rations'], text: 'Clean butchery and fieldcraft provide smoked provisions and fine pelts.' })
					: carrying(c, 'teabrick') || withCrew(c, 'healer') || (c.run.statuses?.includes('blessed-hands'))
						? up('Healer / Tea brick', 'Brew wild fever-bark, ginseng, and bitter tea', { vigor: 20, fortune: 10 }, { itemAdd: ['fever-tonic'], statusRemove: ['limp', 'miasma-lung'], text: 'A steaming restorative decoction purges road fever and eases swollen joints.' })
						: undefined
			};
		}
	},
	{
		id: 'survival-coastal',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour && (c.run.flags.inDetour === 'cove' || c.mode === 'sea' || c.mode === 'river'),
		weight: 2.2,
		make: (c) => {
			const n = npc(c, 'sailor', { title: 'Beachcomber' });
			const p = odds(c, 0.5, ['sea']);
			return {
				id: 'survival-coastal',
				npc: n,
				scene: 'rustic',
				text: `The breakers recede, exposing jagged reefs, tide pools, and flotsam scattered along the tide-line from broken hulls.`,
				left: ch('Pry oysters and edible kelp from the rocks', { vigor: 10, fortune: 4 }, { itemAdd: ['rations'], text: 'Sweet coastal oysters and seaweed restore your vitality by the surf.' }),
				right: ch('Scour the reef for washed-up merchant cargo', {}, { gamble: { p, win: { fx: { silver: 14, fortune: 6 }, itemAdd: ['good:pepper'], text: 'A sealed tarred keg of Malabar pepper, worth a handsome pouch of silver!' }, lose: { fx: { vigor: -8 }, text: 'Sharp barnacles and coral slice your hands. Nothing but driftwood.' } } }),
				up: carrying(c, 'spyglass') || withCrew(c, 'navigator')
					? up('Spyglass / Navigator', 'Spot an intact cargo crate wedged in the reef', { silver: 20, fortune: 12 }, { itemAdd: ['good:porcelain'], text: 'Through the brass glass, you locate a waterlogged chest filled with unbroken blue-and-white porcelain bowls!' })
					: undefined
			};
		}
	},
	{
		id: 'survival-mount-care',
		where: 'any',
		when: (c) => !!c.run.flags.inDetour && !!c.run.mount,
		weight: 2,
		make: (c) => {
			const m = c.run.mount ?? { kind: 'horse' as const, name: 'your mount', health: 50 };
			const n = npc(c, 'elder', { title: 'Paddock' });
			return {
				id: 'survival-mount-care',
				npc: n,
				scene: 'rustic',
				text: `Your ${MOUNTS[m.kind]?.name ?? 'mount'} ${m.name} is trembling, hocks bruised from the rocky scramble and flanks lathered with dried sweat.`,
				left: ch('Graze the beast on wild sweet clover and rest', { vigor: 2 }, { days: 1, mountHurt: -30, text: `${m.name} munches mountain clover happily, nuzzling your palm.` }),
				right: ch('Feed your own dried rations and rub down the coat', { vigor: -4 }, { itemRemove: ['rations'], mountHurt: -50, text: 'A thorough rub-down with dry straw and grain restores the beast’s vigor.' }),
				up: withCrew(c, 'healer') || carrying(c, 'flint-steel')
					? up('Veterinary care', 'Poultice the hooves and warm the stall', {}, { mountHurt: -70, loyalty: 6, text: 'Expertly bandaged with herbal poultices and bedded in warm dry ferns. Your mount is fully rejuvenated!' })
					: undefined
			};
		}
	}
];


