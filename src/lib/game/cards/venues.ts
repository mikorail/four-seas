// One card per venue you choose to visit in a city: the inn, the square, the palace, the harbour…
import { CITY, cityName } from '#lib/data/world';
import { CURIO, RIDDLES } from '#lib/data/market';
import { academyOf, bridgeOf, landmarkOf, palaceOf, type VenueId } from '#lib/data/venues';
import { getTimeInfo } from '../time';
import { culturalStanding } from '../mods';
import { INVENTIONS } from '#lib/data/inventions';
import type { Card } from '../types';
import { carrying, ch, dressed, has, hint, nearSecret, npc, odds, place, romanceIs, up, type Ctx } from './helpers';
import { uprisingAt } from './rebellion';
import { DAMAGE, disasterAt } from '../events';

const COURT_DRESS = ['mandarin-robe', 'silk-turban', 'company-uniform', 'janissary-uniform', 'samurai-armor', 'merchant-silks', 'scholar-robes'];

export const VENUE_CARD: Partial<Record<VenueId, (c: Ctx) => Card>> = {
	inn: (c) => {
		const n = npc(c, 'innkeeper');
		const curio = c.run.bag.find((id) => CURIO[id]);
		const tip = curio
			? `"That ${CURIO[curio].name.toLowerCase()} of yours? ${CURIO[curio].pitch}"`
			: c.rng.pick(['"A ship’s captain was asking for anyone who knows the northern passes."', '"They say the governor is selling titles again. Cheap, if you know whom to pay."', '"Watch the dice-players by the stove. The fat one cheats."', '"There is a scholar in town who can read old maps. Strange fellow."']);
		const up_ = uprisingAt(c.city.id, c.year);
		const talk = c.rng.chance(0.55) ? nearSecret(c, 2) : undefined;
		const dis = disasterAt(c.run, c.city.id);
		const hurt = dis ? DAMAGE[dis.kind].find((d) => d.venue === 'inn') : undefined;
		const inner = c.local.id === 'japanese' ? 'ryokan' : c.local.id === 'persian' || c.local.id === 'ottoman' || c.local.id === 'steppe' ? 'caravanserai' : 'inn';
		const time = getTimeInfo(c.run);
		const stage = time.stage;
		const cult = culturalStanding(c.run, c.city.culture);

		const text = stage === 'morning'
			? `The ${inner} stirs in the crisp blue dawn. Pots of hot congee and roasted tea steam over morning embers. **${n.name}** sweeps the threshold and calls out: "Early on the road, ${cult.title}? ${tip}"${up_ ? ` Then, more quietly: "Be careful. ${up_.rebels} drink here too."` : ''}`
			: stage === 'night'
			? `Night shadows crowd the ${inner} as oil lamps flicker behind bamboo screens. Wayfarers speak in hushed whispers over clay jugs of wine. **${n.name}** leans across the counter: "Keep your voice low tonight, ${cult.title}. ${tip}"${up_ ? ` Then, more quietly: "The watch is raiding houses searching for ${up_.rebels}."` : ''}`
			: `The ${inner} is warm, loud and smells of ${c.local.food}. Carters gulp midday broth and argue over saddle girths. **${n.name}** pours you ${c.local.drink} and leans in: ${tip}${up_ ? ` Then, more quietly: "Be careful. ${up_.rebels} drink here too — and so do the people hunting them."` : ''}`;

		return {
			id: 'v-inn',
			npc: n,
			text,
			left: hurt
				? ch('Take a corner of what is left', { silver: -2, vigor: 4 }, { tags: ['rest'], days: 1, energy: 1, text: `The ${inner} ${hurt.text}. You sleep in your coat, wake at every creak, and are grateful anyway.` })
				: ch('Take a room and sleep properly', { silver: -3, vigor: 12 }, { tags: ['rest', 'food'], days: 1, energy: 2, text: 'Clean sheets. A bath. Nobody tries to rob you. A small miracle.' }),
			right: ch('Buy a round and listen', { silver: -4, renown: 3 }, { tags: ['talk'], gamble: { p: odds(c, 0.55, ['talk']), win: talk ? { fx: { fortune: 4 }, text: `Late in the night, a drunk carter swears by his mother: ${talk.hint}. The others laugh. You don’t.`, setFlag: { tip: true }, bump: hint(talk.id) } : { fx: { fortune: 6 }, text: 'By midnight you know who owes whom, which roads are safe and who is buying what.', setFlag: { tip: true } }, lose: { fx: { vigor: -4 }, text: 'Mostly you learn that the local liquor is stronger than it looks.' } } }),
			up: has(c, 'gambler') ? up('Gambler', 'Join the dice game by the stove', {}, { tags: ['gamble'], gamble: { p: odds(c, 0.55, ['gamble']), win: { fx: { silver: 16 }, text: 'You clean out the cheat with his own loaded dice.' }, lose: { fx: { silver: -10 }, text: 'The fat one cheats better than you.' } } }) : undefined
		};
	},
	square: (c) => {
		const u = uprisingAt(c.city.id, c.year);
		const n = npc(c, u ? 'soldier' : 'performer', u ? { title: 'Town crier' } : {});
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const what = u
			? `A proclamation is nailed up in the ${place(c)} square: a reward for information on ${u.rebels}. Under it someone has chalked: *${u.independence ? 'Freedom' : 'The mandate has passed'}.* **${n.name}** is reading it out to a sullen crowd.`
			: stage === 'morning'
			? `Dawn mist hangs over the ${place(c)} square: farm carts rumble with wet radishes, monks walk with alms bowls, and cookshops fire up their breakfast braziers. **${n.name}** is setting up under the awning.`
			: stage === 'night'
			? `Lanterns of vermilion and oiled paper swing in the night breeze. Street performers juggle torches for a tight crowd around small bonfires. **${n.name}** plays a haunting tune on a moon-guitar.`
			: `The square is full: jugglers, a letter-writer, a medicine seller, a monkey in a waistcoat. **${n.name}** is telling the story of a hero who looks suspiciously like the local governor.`;

		return {
			id: 'v-square',
			npc: n,
			text: what,
			left: ch('Watch and toss a coin', { silver: -1, fortune: 3 }, { tags: ['art'], text: 'Sometimes a city is best seen from the middle of it.' }),
			right: u ? ch('Chalk your own slogan beside it', { renown: 4 }, { tags: ['crime'], heat: 8, standing: 4, text: 'The crowd pretends not to see. Several people smile.' }) : ch('Tell a story of your own travels', {}, { tags: ['talk', 'art'], gamble: { p: odds(c, 0.5, ['art', 'talk']), win: { fx: { renown: 9, silver: 4 }, text: 'A crowd gathers. Coins land on your sleeve.' }, lose: { fx: { renown: -2 }, text: 'A heckler asks if any of it is true. Some of it.' } } }),
			up: has(c, 'performer') ? up('Performer', 'Put on a show', { silver: 10, renown: 8 }, { tags: ['art'], text: 'You have the whole square clapping on the off-beat.' }) : undefined
		};
	},
	temple: (c) => {
		const n = npc(c, 'monk');
		const church = c.local.holyPlace === 'church';
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'morning'
			? `In the morning chill of the ${church ? 'church' : c.local.holyPlace === 'mosque' ? 'mosque' : 'temple'}, bell chimes echo off stone flags. Monks sweep the morning dew. **${n.name}** bows quietly: "The day begins with a clear mind. What does the traveler seek?"`
			: stage === 'night'
			? `Deep night envelops the ${church ? 'church' : c.local.holyPlace === 'mosque' ? 'mosque' : 'temple'}. Heavy bronze doors are barred against outlaws, with solitary oil lamps illuminating the silent altars. **${n.name}** prays in stillness.`
			: `In the ${church ? 'church' : c.local.holyPlace === 'mosque' ? 'mosque courtyard' : 'temple'} it is cool and quiet. Pilgrims, beggars and a cat. **${n.name}** nods to you. "Travellers come here to ask for one of three things: luck, forgiveness, or directions."`;

		return {
			id: 'v-temple',
			npc: n,
			text,
			left: ch('Pray for safe roads', { fortune: 6 }, { tags: ['faith', 'rest'], text: 'You light a candle or a stick of incense — it is all the same smoke in the end.' }),
			right: ch('Give alms to the beggars', { silver: -5 }, { tags: ['mercy', 'faith'], remember: { kind: 'favor', deed: 'gave alms at the temple gate' }, text: 'A child shows you a short cut through the city as thanks.' }),
			up: dressed(c, 'monk-robes', 'pilgrim-garb') ? up('Holy garb', 'Stay a night as a guest of the monks', { vigor: 10, fortune: 4 }, { tags: ['faith', 'rest'], days: 1, text: 'Plain rice, chanting at dawn, and the best sleep in months.' }) : undefined
		};
	},
	harbor: (c) => {
		const n = npc(c, 'captain');
		const sea = c.rng.chance(0.6) ? nearSecret(c, 3) : undefined;
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'morning'
			? `Morning sea mist curls around the piers as fishing sampans return with the dawn tide. **${n.name}** checks the morning manifests amidst the reek of salt and tar. "The offshore wind is rising. Help me stow the gear, or share what you know of eastern passages."`
			: stage === 'night'
			? `Rigging groans softly in the night wind under starry skies. Watchmen with lanterns patrol the stone quays as muffled rowboats slide through the dark water. **${n.name}** sits on a bollard: "The tide turns at midnight. What news from the dark roads?"`
			: `Masts like a forest; porters running with bales; the smell of tar and fish. **${n.name}** is short-handed and sailing on the tide. "Help me load and I will pay. Or tell me what you know of the waters east — I hear things about secret passages."`;

		const hasBulkhead = c.run.bag.includes('watertight-hull') || c.run.completedInventions?.includes('watertight-hull') || c.run.inventions?.some((i) => i.id === 'watertight-hull');
		const bulkheadOption = !hasBulkhead && c.run.stats.silver >= 20
			? up('Shipwright', 'Sponsor watertight bulkhead designs (20 silver)', { silver: -20 }, { sponsorInvention: 'watertight-hull', tags: ['trade', 'sea'], text: 'The master shipwright unrolls parchment blueprints of watertight compartments. "No reef shall breach our hulls now."' })
			: undefined;

		return {
			id: 'v-harbor',
			npc: n,
			text,
			left: ch('Work the docks for a day', { silver: 8, vigor: -6 }, { tags: ['sea', 'trade'], days: 1, text: 'Bales, barrels and a parrot that bites. You earn your silver.' }),
			right: ch('Trade sailors’ gossip', {}, { tags: ['talk', 'sea'], gamble: { p: odds(c, 0.5, ['talk']), win: sea ? { fx: { renown: 2 }, text: `An old pilot, three cups in, draws a line on the table with wine: ${sea.hint}.`, setFlag: { tip: true }, bump: hint(sea.id) } : { fx: { renown: 3 }, text: 'You learn which captains are honest and which ships are cursed.', setFlag: { tip: true } }, lose: { fx: {}, text: 'Mostly tall tales. One involves a fish the size of a temple.' } } }),
			up: dressed(c, 'pirate-garb')
				? up('Sea rover’s rig', 'Ask quietly about the smugglers’ run', { silver: 4 }, { tags: ['crime', 'sea'], setFlag: { 'secret:smugglers': true }, text: 'The captain looks at your clothes, then at you, and draws a map in spilled rum.' })
				: bulkheadOption
		};
	},
	palace: (c) => {
		const name = palaceOf(c.city.id) ?? 'the palace';
		const n = npc(c, 'official', { title: 'Chamberlain' });
		const fit = COURT_DRESS.some((d) => dressed(c, d)) || (dressed(c, 'local-dress') && c.run.outfit?.culture === c.city.culture);
		const famous = c.run.stats.renown >= 60;
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		if (!fit && !famous)
			return {
				id: 'v-palace',
				npc: { ...n, title: 'Palace guard captain' },
				text: `The gates of **${name}** are tall, painted and closed. **${n.name}** looks at your dusty clothes and laughs. "Petitioners on the third day of the month. Dressed like people, ideally."`,
				left: ch('Bribe your way to the outer court', { silver: -10 }, { tags: ['bribe', 'official'], gamble: { p: odds(c, 0.5, ['official']), win: { fx: { renown: 6 }, text: 'A minor minister hears you out over tea. Not nothing.', standing: 4 }, lose: { fx: {}, text: 'The silver vanishes. So does the guard.' } } }),
				right: ch('Come back with better clothes', {}, { text: 'The market sells court dress, for a price. So does the second-hand stall behind it.' })
			};

		const u = uprisingAt(c.city.id, c.year);
		const palText = stage === 'morning'
			? `Morning mist clings to the high ramparts of **${name}**. Officials in stiff embroidered rank robes wait in the chilly courtyard for the dawn audience. **${n.name}** inspects credentials by candlelight.`
			: stage === 'night'
			? `Iron torches blaze along the battlements of **${name}**. The great iron gates are barred for the night against conspirators. **${n.name}** whispers: "The ministers meet in secret nocturnal conclave."`
			: `In your ${fit ? 'borrowed dignity' : 'fame'}, you are shown into **${name}**: lacquered halls, kneeling servants, a hundred eyes. **${n.name}** murmurs: "${u ? `The court is frightened of ${u.rebels}. Anyone who brings news is welcome. Anyone who brings bad news, less so.` : 'Bow when I bow. Speak when spoken to. Do not admire the vases too openly.'}"`;

		const hasCharter = c.run.bag.includes('commercial-charter') || c.run.completedInventions?.includes('commercial-charter') || c.run.inventions?.some((i) => i.id === 'commercial-charter');
		const hasRockets = c.run.bag.includes('sky-rockets') || c.run.completedInventions?.includes('sky-rockets') || c.run.inventions?.some((i) => i.id === 'sky-rockets');

		const palaceInvention = !hasCharter && c.run.stats.silver >= 24
			? up('Enlightened Reform', 'Fund Judicial Reform & Commercial Code (24 silver)', { silver: -24 }, { sponsorInvention: 'commercial-charter', tags: ['official'], standing: 10, text: 'Reformist ministers bow deeply. "With your backing, the court codifies safe travel and fair tariffs for all honest merchants."' })
			: !hasRockets && c.run.stats.silver >= 22
			? up('Imperial Foundry', 'Fund Thunder-Fire Rocket Artillery (22 silver)', { silver: -22 }, { sponsorInvention: 'sky-rockets', tags: ['fight'], text: 'The master pyrotechnicians set to work in the imperial arsenals packing saltpeter and iron rockets.' })
			: undefined;

		return {
			id: 'v-palace',
			npc: n,
			text: palText,
			left: ch('Present yourself to the ruler', { renown: 12 }, { tags: ['official', 'talk'], standing: 8, days: 1, text: 'A few words, a gift, a gesture of approval. Your name goes into the court diary.' }),
			right: ch('Listen in the corridors', {}, { tags: ['talk', 'crime'], gamble: { p: odds(c, 0.5, ['talk']), win: { fx: { silver: 8, renown: 4 }, text: 'Who is rising, who is falling, who is about to need a discreet traveller. Valuable.', setFlag: { tip: true } }, lose: { fx: { renown: -4 }, heat: 6, text: 'A eunuch catches you behind a screen. Awkward.' } } }),
			up: has(c, 'envoy')
				? up('Envoy', 'Present your credentials formally', { renown: 16, silver: 8 }, { tags: ['official'], standing: 12, text: 'Envoys are received with drums. You are received with drums.' })
				: palaceInvention
		};
	},
	academy: (c) => {
		const name = academyOf(c.city.id) ?? 'the academy';
		const n = npc(c, 'scholar');
		const map = c.run.bag.find((id) => id.startsWith('treasure-map-'));
		const r = map ? RIDDLES[Number(map.slice(13))] : null;
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'morning'
			? `Students chant the ancient commentaries in the cool morning colonnade of **${name}**, their voices rising with the sun. **${n.name}** pauses with brush in hand to greet you: "A traveller! Settle our novices’ quarrel."`
			: stage === 'night'
			? `A solitary tallow lamp burns in the observatory tower of **${name}**. Star charts and brass astrolabes glitter under candlelight. **${n.name}** looks up from a celestial scroll: "The heavens turn in silence. Do you seek astronomical truths?"`
			: `At **${name}**, students argue in the courtyard and an old master pretends not to listen. **${n.name}** invites you to a debate: "A traveller! Settle our quarrel: is the world round, square, or merely complicated?"`;

		const hasChronometer = c.run.bag.includes('celestial-chronometer') || c.run.completedInventions?.includes('celestial-chronometer') || c.run.inventions?.some((i) => i.id === 'celestial-chronometer');
		const hasMovableType = c.run.bag.includes('movable-type') || c.run.completedInventions?.includes('movable-type') || c.run.inventions?.some((i) => i.id === 'movable-type');
		const hasQuinine = c.run.bag.includes('quinine-distillation') || c.run.completedInventions?.includes('quinine-distillation') || c.run.inventions?.some((i) => i.id === 'quinine-distillation');

		const academyInvention = !hasChronometer && c.run.stats.silver >= 18
			? up('Astronomer', 'Fund the Celestial Chronometer (18 silver)', { silver: -18 }, { sponsorInvention: 'celestial-chronometer', tags: ['art', 'sea'], text: 'The royal astronomer adjusts brass calipers over precision gearings. "Harrison and Su Song would marvel at this clockwork."' })
			: !hasMovableType && c.run.stats.silver >= 15
			? up('Typographer', 'Fund the Movable Metal Type Foundry (15 silver)', { silver: -15 }, { sponsorInvention: 'movable-type', tags: ['art'], text: 'Bronze matrices click into place. "Your name and deeds shall be printed across thousands of gazettes!"' })
			: !hasQuinine && c.run.stats.silver >= 16
			? up('Botanist', 'Fund Quinine Herbal Distillation (16 silver)', { silver: -16 }, { sponsorInvention: 'quinine-distillation', tags: ['art'], text: 'Glass alembics simmer with cinchona bark. "Swamp fevers shall claim no more travelers on our roads."' })
			: undefined;

		return {
			id: 'v-academy',
			npc: n,
			text,
			left: ch('Join the debate', {}, { tags: ['talk', 'art'], gamble: { p: odds(c, 0.5, ['talk', 'art']), win: { fx: { renown: 10 }, text: 'You win with an anecdote from a port they have never heard of.' }, lose: { fx: { renown: -3 }, text: 'A first-year student dismantles you politely.' } } }),
			right: ch('Spend a day in the library', { vigor: -2 }, { tags: ['art'], days: 1, text: 'Maps, star charts and travellers’ tales older than your grandmother’s grandmother.', setFlag: { tip: true } }),
			up: r
				? up('Riddle map', 'Show them your riddle map', {}, { tags: ['art'], text: `The old master reads the verse twice and smiles. "Obviously ${cityName(CITY[r.answer], c.year)}. Any child knows that." The students did not know that.` })
				: has(c, 'scholar') || has(c, 'bookworm')
				? up('Learned', 'Give a lecture', { renown: 14 }, { tags: ['art', 'talk'], text: 'They take notes. Some even stay awake.' })
				: academyInvention
		};
	},
	bridge: (c) => {
		const name = bridgeOf(c.city.id) ?? 'the bridge';
		const free = !c.run.romance || c.run.romance.status === 'parted';
		const n = npc(c, free ? 'lover' : 'child', free ? { title: 'Stranger on the bridge' } : {});
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'morning'
			? `On **${name}** at dawn, the river mist slowly lifts as early fishermen cast round nets into the silvery current.`
			: stage === 'night'
			? (free
				? `On **${name}** at night, lanterns float on the dark water. **${n.name}** is leaning on the rail beside you, looking out at the stars.`
				: `On **${name}** at night, lanterns float on the dark water. You think of ${c.run.romance!.npc.name}. **${n.name}**, a street child, sells you a paper boat to send downstream.`)
			: (free
				? `On **${name}** at dusk, lanterns begin to glow upon the water. **${n.name}** is leaning on the rail beside you, also pretending to look at the lanterns.`
				: `On **${name}** at dusk, lanterns begin to glow upon the water. You think of ${c.run.romance!.npc.name}. **${n.name}**, a street child, sells you a paper boat to send downstream.`);

		return {
			id: 'v-bridge',
			npc: n,
			text,
			left: free ? ch('Start a conversation', {}, { tags: ['romance', 'talk'], romance: { start: true, affection: 15 }, text: 'You talk until the lanterns burn out. Then you keep talking.' }) : ch('Send the boat for them', { silver: -1 }, { tags: ['romance'], romance: { affection: 6 }, text: 'Sentimental. Nobody is watching. Well — the child is.' }),
			right: ch('Just enjoy the view', { vigor: 4, fortune: 2 }, { tags: ['rest'], text: 'Some places are worth the whole journey.' })
		};
	},
	landmark: (c) => {
		const lm = landmarkOf(c.city.id)!;
		const first = !c.run.flags['seen:' + c.city.id];
		const n = npc(c, 'elder', { title: 'Old guide' });
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'morning'
			? `In the clean morning light, **${lm.name}** rises above the waking city. ${lm.blurb} **${n.name}** offers to guide you: "The best views are before the noon heat."`
			: stage === 'night'
			? `Bathed in moonlight and braziers, **${lm.name}** stands tall against the starry sky. ${lm.blurb} **${n.name}** whispers ancient legends under the eaves.`
			: `**${lm.name}.** ${lm.blurb} **${n.name}** offers to show you round, for a coin, and tell you which stories are true.`;

		return {
			id: 'v-landmark',
			npc: n,
			text,
			left: ch('Take the tour', { silver: -2, renown: first ? 6 : 1 }, { tags: ['art'], setFlag: { ['seen:' + c.city.id]: true }, text: first ? 'You will describe this for the rest of your life, and nobody will quite believe you.' : 'Still astonishing the second time.' }),
			right: ch('Sketch it in your journal', { renown: first ? 4 : 1, fortune: 2 }, { tags: ['art'], setFlag: { ['seen:' + c.city.id]: true }, text: 'Your drawing is terrible. Your notes are wonderful.' }),
			up: carrying(c, 'camera') ? up('Camera', 'Take a photograph', { renown: 10 }, { tags: ['art'], setFlag: { ['seen:' + c.city.id]: true }, text: 'Eight minutes of exposure. A crowd gathers to watch the box. The plate comes out perfect.' }) : undefined
		};
	},
	festival: (c) => {
		const n = npc(c, 'performer');
		const time = getTimeInfo(c.run);
		const stage = time.stage;

		const text = stage === 'night'
			? `The festival of ${place(c)} reaches its peak under the moon: fireworks burst across the rooftops, drums thunder, and **${n.name}** dances with twin flame swords.`
			: `The whole of ${place(c)} is out for the festival: drums, food stalls, children with sparklers, **${n.name}** dancing on stilts. Someone pushes a cup into your hand.`;

		return {
			id: 'v-festival',
			npc: n,
			text,
			left: ch('Join the dancing', { vigor: 6, fortune: 6 }, { tags: ['art', 'food'], text: 'You do not know the steps. Nobody cares.' }),
			right: romanceIs(c, 'courting', 'betrothed', 'married') && c.run.romance!.city === c.city.id ? ch(`Find ${c.run.romance!.npc.name} in the crowd`, { fortune: 4 }, { tags: ['romance'], romance: { affection: 14 }, text: 'You find each other by the lantern stall. It feels arranged by heaven.' }) : ch('Eat everything', { silver: -3, vigor: 10 }, { tags: ['food'], text: 'Fried, sweet, sticky, on a stick. Repeat.' })
		};
	}
};


