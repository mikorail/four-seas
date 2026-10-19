import type { CultureId } from '#lib/data/cultures';
import { between, carrying, ch, has, inCulture, npc, odds, place, up, withCrew, dressed, type Ctx, type Template } from './helpers';

export interface LegendInfo {
	id: string;
	name: string;
	where: string;
	blurb: string;
}

/** Codex entries shown in the Chronicle. */
export const LEGENDS: LegendInfo[] = [
	{ id: 'kitsune', name: 'The Kitsune', where: 'Nihon', blurb: 'A fox spirit with many tails, who rewards the polite and fools the proud.' },
	{ id: 'jiangshi', name: 'The Jiangshi', where: 'Middle Kingdom', blurb: 'A hopping corpse that hunts by the breath of the living.' },
	{ id: 'gumiho', name: 'The Gumiho', where: 'Joseon', blurb: 'A nine-tailed fox who wishes to become human.' },
	{ id: 'naga', name: 'The Naga King', where: 'Mekong & Irrawaddy', blurb: 'Serpent lord of rivers, keeper of pearls.' },
	{ id: 'pontianak', name: 'The Pontianak', where: 'Nusantara', blurb: 'A banana-tree spirit, frangipani-scented and furious.' },
	{ id: 'djinn', name: 'The Djinn', where: 'Persia & Arabia', blurb: 'Made of smokeless fire. Grants wishes, carefully worded.' },
	{ id: 'vetala', name: 'The Vetala', where: 'Hindustan', blurb: 'A corpse-riding spirit who tells riddles to kings.' },
	{ id: 'migoi', name: 'The Migoi', where: 'Bod', blurb: 'The wild man of the snows, seen only in footprints.' },
	{ id: 'dutchman', name: 'The Flying Dutchman', where: 'Cape of Storms', blurb: 'A ghost ship doomed to sail forever, carrying letters to the dead.' },
	{ id: 'ryujin', name: 'Ryūjin', where: 'Eastern seas', blurb: 'The dragon king beneath the waves, master of tides.' },
	{ id: 'nguva', name: 'The Nguva', where: 'Swahili Coast', blurb: 'Sea-maidens who sing sailors home — or under.' },
	{ id: 'baba-yaga', name: 'Baba Yaga', where: 'The far north', blurb: 'A witch whose hut walks on chicken legs.' },
	{ id: 'sinbad', name: 'Sinbad’s Ghost', where: 'Basra', blurb: 'The sailor of seven voyages, still telling the eighth.' },
	{ id: 'musashi', name: 'Miyamoto Musashi', where: 'Nihon, 1600–1645', blurb: 'The sword-saint who never lost a duel.' },
	{ id: 'koxinga', name: 'Koxinga', where: 'China coast, 1646–1662', blurb: 'Pirate-prince of the Ming, conqueror of Formosa.' },
	{ id: 'hang-tuah', name: 'Hang Tuah', where: 'Malacca', blurb: 'The admiral-hero of Melaka and his invulnerable kris.' },
	{ id: 'shivaji', name: 'Shivaji', where: 'Hindustan, 1660–1680', blurb: 'The Maratha king who escaped Agra in a sweet basket.' },
	{ id: 'ching-shih', name: 'Ching Shih', where: 'South China Sea, 1801–1810', blurb: 'The pirate queen who commanded 1,800 ships.' },
	{ id: 'nasreddin', name: 'Nasreddin Hodja', where: 'Anatolia & Silk Road', blurb: 'The backwards-riding philosopher whose foolishness is deeper than wisdom.' },
	{ id: 'sun-wukong', name: 'Sun Wukong', where: 'Middle Kingdom & Cloud Peaks', blurb: 'The Great Sage Equal to Heaven, immortal monkey trickster of Huaguo Mountain.' },
	{ id: 'roro-kidul', name: 'Nyai Roro Kidul', where: 'Java & Southern Ocean', blurb: 'Queen of the Southern Sea, clad in royal emerald green, master of the ocean abyss.' },
	{ id: 'dokkaebi', name: 'The Dokkaebi', where: 'Joseon', blurb: 'A horned spirit of crossroads and streams who loves ssireum wrestling and magic clubs.' },
	{ id: 'garuda', name: 'The Garuda', where: 'Hindustan & Southeast Asia', blurb: 'Solar king of birds, soaring on golden wings, foe of serpents and poison.' },
	{ id: 'al-khidr', name: 'Al-Khidr', where: 'Persia, Arabia & Levant', blurb: 'The Green One, eternal guardian of wayfarers and seekers of the Water of Life.' }
];

const met = (c: Ctx, id: string) => c.run.legends.includes(id);

function legend(id: string, cultures: CultureId[], make: Template['make'], opts: Partial<Template> = {}): Template {
	return {
		id: 'legend-' + id,
		where: 'any',
		weight: 1.6,
		...opts,
		when: (c) => !met(c, id) && inCulture(c, ...cultures) && (opts.when ? opts.when(c) : true),
		make: (c) => ({ ...make(c), badge: 'Local Legend' })
	};
}

export const LEGEND_T: Template[] = [
	legend('kitsune', ['japanese'], (c) => {
		const n = npc(c, 'spirit', { culture: 'japanese', gender: 'f', name: 'A woman with fox ears', title: 'Kitsune' });
		return {
			id: 'legend-kitsune',
			npc: n,
			text: `At a moss-grown shrine, a woman with fox ears and too many shadows smiles. "Traveller. Follow me — or feed me. Choose quickly; I bore easily."`,
			left: ch('Offer fried tofu', { fortune: 12 }, { legend: 'kitsune', tags: ['faith'], remember: { kind: 'favor', deed: 'fed her fried tofu at the shrine' }, text: 'She eats it delicately, then is gone. Your luck feels lighter.' }),
			right: ch('Follow her', {}, { legend: 'kitsune', gamble: { p: odds(c, 0.5, []), win: { fx: { fortune: 8 }, itemAdd: ['fox-mask'], text: 'A night in a palace that isn’t there. At dawn, a fox mask in your hands.' }, lose: { fx: { vigor: -8 }, days: 4, text: 'You wake in a field. Four days have passed. Your sandals are full of leaves.' } } }),
			up: has(c, 'fox-blooded') ? up('Fox-Blooded', 'Greet her as cousin', { fortune: 10 }, { legend: 'kitsune', itemAdd: ['fox-mask'], text: '"Cousin!" She tweaks your ear and gives you a mask.' }) : undefined
		};
	}),
	legend('jiangshi', ['han'], (c) => {
		const n = npc(c, 'ghost', { culture: 'han', name: 'A stiff figure in Qing robes', title: 'Jiangshi' });
		return {
			id: 'legend-jiangshi',
			npc: n,
			text: `Thump. Thump. Thump. A corpse in official's robes hops down the moonlit road, arms outstretched, a yellow talisman fluttering on its brow.`,
			left: ch('Hold your breath', {}, { legend: 'jiangshi', gamble: { p: odds(c, 0.55, []), win: { fx: { fortune: 8, renown: 6 }, text: 'It hops past, sniffing. You turn purple, but live.' }, lose: { fx: { vigor: -18 }, text: 'You gasp. It turns. You run for a very long time.' } } }),
			right: ch('Slap the talisman back on', {}, { legend: 'jiangshi', tags: ['fight'], gamble: { p: odds(c, 0.4, ['fight', 'faith']), win: { fx: { renown: 12 }, itemAdd: ['ghost-bell'], text: 'It freezes. In its sleeve, a little spirit bell.' }, lose: { fx: { vigor: -14, fortune: -6 }, text: 'Its nails are very long.' } } }),
			up: carrying(c, 'rations') ? up('Rations', 'Throw sticky rice', { renown: 8 }, { legend: 'jiangshi', itemRemove: ['rations'], itemAdd: ['ghost-bell'], text: 'It must count every grain. You leave it counting — and take its bell.' }) : undefined
		};
	}),
	legend('gumiho', ['korean'], (c) => ({
		id: 'legend-gumiho',
		npc: npc(c, 'spirit', { culture: 'korean', gender: 'f', name: 'A beautiful stranger', title: 'Gumiho' }),
		text: `A beautiful stranger walks beside you at dusk. Nine shadows follow her. "A thousand days without being seen, and I become human. You have seen me. Will you tell?"`,
		left: ch('Promise silence', { fortune: 14 }, { legend: 'gumiho', remember: { kind: 'favor', deed: 'kept her secret' }, text: 'She weeps, thanks you, and walks into the village a woman.' }),
		right: ch('Shout for the villagers', { renown: 8, fortune: -12 }, { tags: ['cruel'], legend: 'gumiho', remember: { kind: 'grudge', deed: 'betrayed her to the villagers' }, text: 'Nine tails flash in the dark. You are a hero. You feel terrible.' })
	})),
	legend('naga', ['siamese'], (c) => ({
		id: 'legend-naga',
		npc: npc(c, 'spirit', { culture: 'siamese', name: 'Phaya Naga', title: 'Naga King' }),
		text: `Fireballs rise from the river. A crowned serpent lifts from the water, scales like temple tiles. "Who crosses my river without an offering?"`,
		left: ch('Offer silver to the river', { silver: -8, fortune: 10 }, { legend: 'naga', tags: ['faith'], itemAdd: ['naga-pearl'], text: 'The serpent bows. A pearl rolls onto the bank.' }),
		right: ch('Bow low and beg passage', { fortune: 6 }, { legend: 'naga', tags: ['faith'], text: '"Pass." The river smooths like glass.' })
	}), { modes: undefined }),
	legend('pontianak', ['malay'], (c) => ({
		id: 'legend-pontianak',
		npc: npc(c, 'ghost', { culture: 'malay', gender: 'f', name: 'A woman in white', title: 'Pontianak' }),
		text: `The scent of frangipani, then rot. A woman in white sits in a banana tree, long hair over her face. A baby is crying somewhere. It is not a baby.`,
		left: ch('Run, don’t look back', { vigor: -6 }, { legend: 'pontianak', text: 'You run until the scent fades.' }),
		right: ch('Drive a nail into the tree', {}, { legend: 'pontianak', gamble: { p: odds(c, 0.45, ['faith']), win: { fx: { renown: 12, fortune: 8 }, text: 'An old trick. She becomes a mild, confused woman, and thanks you.' }, lose: { fx: { vigor: -16, fortune: -8 }, text: 'Claws. Laughter. A long night.' } } }),
		up: withCrew(c, 'healer') ? up('Physician', 'Your physician recognizes her — a widow, grieving', { fortune: 12 }, { legend: 'pontianak', text: 'Not every ghost is a ghost.' }) : undefined
	})),
	legend('djinn', ['persian', 'ottoman', 'steppe'], (c) => ({
		id: 'legend-djinn',
		npc: npc(c, 'spirit', { culture: 'persian', name: 'A man made of smoke', title: 'Djinn' }),
		text: `In a dry well you find a brass lamp. A voice from inside: "Free me, mortal, and I will owe you a wish. Probably. Djinn are terrible with promises."`,
		left: ch('Leave it buried', { fortune: 4 }, { legend: 'djinn' }),
		right: ch('Rub the lamp', {}, { legend: 'djinn', gamble: { p: odds(c, 0.55, []), win: { fx: {}, itemAdd: ['djinn-lamp'], text: 'Smoke, laughter, a bow. "One wish. Keep the lamp."' }, lose: { fx: { silver: -12, fortune: -6 }, text: 'The djinn takes your purse "as interest" and vanishes.' } } }),
		up: has(c, 'scholar') || has(c, 'bookworm') ? up('Learned', 'Word your request like a lawyer', {}, { legend: 'djinn', itemAdd: ['djinn-lamp'], text: 'The djinn reads your terms, sighs, and signs.' }) : undefined
	}), { modes: ['land'] }),
	legend('vetala', ['indian'], (c) => ({
		id: 'legend-vetala',
		npc: npc(c, 'ghost', { culture: 'indian', name: 'A corpse in a tree', title: 'Vetala' }),
		text: `A corpse hangs from a banyan in the cremation ground. Its eyes open. "Answer my riddle, traveller, as King Vikram once did — or stay silent forever."`,
		left: ch('Stay silent', { fortune: -4 }, { legend: 'vetala', text: 'It sighs, disappointed. You hurry away.' }),
		right: ch('Answer the riddle', {}, { legend: 'vetala', tags: ['talk'], gamble: { p: odds(c, 0.5, ['talk', 'art']), win: { fx: { renown: 18, fortune: 6 }, text: '"Correct." It laughs and flies back to its tree.' }, lose: { fx: { vigor: -12, renown: -4 }, text: 'Wrong. Your head aches for a week.' } } })
	})),
	legend('migoi', ['tibetan', 'steppe'], (c) => ({
		id: 'legend-migoi',
		npc: npc(c, 'spirit', { culture: 'tibetan', name: 'Giant footprints', title: 'Migoi' }),
		text: `Footprints the size of rice sacks cross the snowfield — backwards. A herder whispers: the Migoi. Those who follow find warmth, or nothing ever again.`,
		left: ch('Leave an offering of tsampa', { fortune: 10 }, { legend: 'migoi', tags: ['faith'] }),
		right: ch('Follow the tracks', {}, { legend: 'migoi', gamble: { p: odds(c, 0.45, ['land']), win: { fx: { renown: 14 }, itemAdd: ['yeti-fur'], text: 'A cave. A tuft of impossible white fur, warm as a hearth.' }, lose: { fx: { vigor: -18 }, days: 2, text: 'Snow-blind and lost for two days.' } } })
	}), { modes: ['land'] }),
	legend('dutchman', ['european', 'swahili'], (c) => ({
		id: 'legend-dutchman',
		npc: npc(c, 'captain', { culture: 'european', name: 'Captain van der Decken', title: 'Flying Dutchman' }),
		text: `A ship with blood-red sails sails against the wind. Its pale captain hails: "Take our letters home, friend! Some are for people dead a hundred years."`,
		left: ch('Refuse the letters', { fortune: -6 }, { legend: 'dutchman', text: 'The ship fades into fog, its crew wailing.' }),
		right: ch('Take the letters', { fortune: 8, vigor: -6 }, { legend: 'dutchman', itemAdd: ['ghost-bell'], text: 'Among the letters, a ship’s bell. It rings with no hand on it.' })
	}), { where: 'travel', modes: ['sea'], when: (c) => c.year >= 1641 && (c.city.id === 'capetown' || c.from?.id === 'capetown') }),
	legend('ryujin', ['japanese', 'han', 'korean'], (c) => ({
		id: 'legend-ryujin',
		npc: npc(c, 'spirit', { culture: 'japanese', name: 'Ryūjin', title: 'Dragon King of the Sea' }),
		text: `The sea goes still. A dragon's head rises, whiskers trailing, a jewel in its claw. "The tide jewels are mine. But I will trade one scale for a song."`,
		left: ch('Keep your head down', { fortune: -3 }, { legend: 'ryujin' }),
		right: ch('Sing', {}, { legend: 'ryujin', tags: ['art'], gamble: { p: odds(c, 0.5, ['art']), win: { fx: { fortune: 10 }, itemAdd: ['dragon-scale'], text: 'The dragon hums along. A scale floats to your feet.' }, lose: { fx: { vigor: -10 }, days: 2, text: 'The dragon winces. A wave carries you two days off course.' } } }),
		up: has(c, 'performer') || has(c, 'poet') ? up('Artist', 'Perform your finest piece', { renown: 10, fortune: 10 }, { legend: 'ryujin', itemAdd: ['dragon-scale'], text: 'The dragon weeps a pearl-tear and gives you a scale.' }) : undefined
	}), { where: 'travel', modes: ['sea'] }),
	legend('nguva', ['swahili'], (c) => ({
		id: 'legend-nguva',
		npc: npc(c, 'spirit', { culture: 'swahili', gender: 'f', name: 'A singing voice', title: 'Nguva' }),
		text: `Singing from the reef. The crew stares, oars still. The song promises home, and rest, and the bottom of the sea.`,
		left: ch('Plug the crew’s ears with wax', { fortune: 6 }, { legend: 'nguva', text: 'You alone hear the end of the song. It is beautiful.' }),
		right: ch('Sing back', {}, { legend: 'nguva', tags: ['art'], gamble: { p: odds(c, 0.45, ['art']), win: { fx: { fortune: 14, renown: 8 }, text: 'A duet across the water. They let you pass.' }, lose: { fx: { vigor: -14 }, text: 'Two sailors go over. You pull one back.' } } })
	}), { where: 'travel', modes: ['sea'] }),
	legend('baba-yaga', ['european'], (c) => ({
		id: 'legend-baba-yaga',
		npc: npc(c, 'spirit', { culture: 'european', gender: 'f', name: 'Baba Yaga', title: 'Witch of the Woods' }),
		text: `A hut on chicken legs turns to face you. An old woman with iron teeth: "Answer three questions, or be supper."`,
		left: ch('Bring her firewood instead', { vigor: -6, fortune: 10 }, { legend: 'baba-yaga', text: 'She grunts. Politeness is rare. She lets you go.' }),
		right: ch('Answer her questions', {}, { legend: 'baba-yaga', tags: ['talk'], gamble: { p: odds(c, 0.5, ['talk']), win: { fx: { renown: 12 }, itemAdd: ['medicine'], text: 'She cackles and hands you a jar of something alive.' }, lose: { fx: { vigor: -16 }, text: 'You escape through the window. Mostly intact.' } } })
	}), { when: (c) => ['moscow', 'irkutsk', 'kyakhta'].includes(c.city.id) }),
	legend('sinbad', ['persian'], (c) => ({
		id: 'legend-sinbad',
		npc: npc(c, 'sailor', { culture: 'persian', name: 'An old sailor', title: 'Sinbad (he claims)' }),
		text: `An ancient sailor in a Basra coffee house swears he is Sinbad, and offers to tell you of his eighth voyage — the one no one wrote down.`,
		left: ch('Politely decline', {}, { legend: 'sinbad' }),
		right: ch('Buy him coffee and listen', { silver: -2, renown: 6 }, { legend: 'sinbad', setFlag: { tip: 1 }, text: 'A rock-bird, a whale-island, and one very useful current.' })
	}), { where: 'city', when: (c) => c.city.id === 'basra' || c.city.id === 'muscat' }),
	legend('musashi', ['japanese'], (c) => ({
		id: 'legend-musashi',
		npc: npc(c, 'hero', { culture: 'japanese', gender: 'm', name: 'Miyamoto Musashi', title: 'Sword Saint' }),
		text: `A scruffy swordsman carves a wooden sword from an oar. He looks you over. "I am writing a book on strategy. Spar with me, and you can be a footnote."`,
		left: ch('Ask to read the book', { renown: 6 }, { legend: 'musashi', tags: ['art'], remember: { kind: 'favor', deed: 'read his unfinished book' }, text: '"Not finished," he grunts, but lets you read a page.' }),
		right: ch('Spar', {}, { legend: 'musashi', tags: ['fight'], gamble: { p: odds(c, 0.2, ['fight']), win: { fx: { renown: 25 }, itemAdd: ['musashi-scroll'], text: 'You touch his sleeve. He laughs, and gives you a copy of his scroll.' }, lose: { fx: { vigor: -10, renown: 8 }, text: 'You lose in one move. He says it was a good move to lose to.' } } })
	}), { when: (c) => between(c, 1600, 1645) }),
	legend('koxinga', ['han', 'malay'], (c) => ({
		id: 'legend-koxinga',
		npc: npc(c, 'hero', { culture: 'han', gender: 'm', name: 'Zheng Chenggong', title: 'Koxinga, Lord of the Ming fleet' }),
		text: `A fleet of a thousand junks fills the harbor. Koxinga himself, last loyal admiral of the Ming, needs captains to take Formosa from the Dutch.`,
		left: ch('Decline', {}, { legend: 'koxinga' }),
		right: ch('Sail with Koxinga', { vigor: -12, renown: 18, silver: 10 }, { legend: 'koxinga', tags: ['fight'], remember: { kind: 'favor', deed: 'sailed with him to Formosa' }, days: 5, itemAdd: ['koxinga-flag'], text: 'Fort Zeelandia falls. He gives you his banner.' })
	}), { when: (c) => between(c, 1646, 1662) && c.city.port }),
	legend('hang-tuah', ['malay'], (c) => ({
		id: 'legend-hang-tuah',
		npc: npc(c, 'hero', { culture: 'malay', gender: 'm', name: c.year < 1530 ? 'Hang Tuah' : 'A descendant of Hang Tuah', title: 'Laksamana of Melaka' }),
		text: `"Takkan Melayu hilang di dunia." The keeper of the Taming Sari kris tests every worthy traveller. Will you take the test of courage?`,
		left: ch('Bow and refuse', { fortune: 4 }, { legend: 'hang-tuah' }),
		right: ch('Take the test', {}, { legend: 'hang-tuah', tags: ['fight'], gamble: { p: odds(c, 0.35, ['fight']), win: { fx: { renown: 16 }, itemAdd: ['hang-tuah-kris'], text: 'The kris is placed in your hands. It is warm.' }, lose: { fx: { vigor: -12 }, text: 'Not today. "Come back braver."' } } })
	}), { where: 'city', when: (c) => c.city.id === 'malacca' }),
	legend('shivaji', ['indian'], (c) => ({
		id: 'legend-shivaji',
		npc: npc(c, 'hero', { culture: 'indian', gender: 'm', name: 'Shivaji Bhonsle', title: 'Maratha king' }),
		text: `The Maratha king Shivaji is under house arrest in Agra. His men need a trusted outsider to carry huge baskets of sweets out past the guards. Very, very heavy sweets.`,
		left: ch('Stay out of Mughal politics', {}, { legend: 'shivaji' }),
		right: ch('Carry the baskets', { vigor: -8, renown: 16 }, { legend: 'shivaji', remember: { kind: 'favor', deed: 'smuggled him out of Agra in a sweet basket' }, heat: 25, tags: ['crime'], text: 'A basket winks at you. Legends are made of such things.' })
	}), { when: (c) => between(c, 1660, 1680) }),
	legend('ching-shih', ['han', 'viet'], (c) => {
		const n = npc(c, 'captain', { culture: 'han', gender: 'f', name: 'Ching Shih', title: 'Pirate queen' });
		return {
			id: 'legend-ching-shih',
			npc: n,
			text: `Your vessel is surrounded by red-flagged junks. Their commander, the legendary ${n.name}, boards your deck with sword in hand. "A toll for passage in my waters, traveller."`,
			left: ch('Offer silver and bow respectfully', { silver: -16, renown: 6 }, { legend: 'ching-shih', text: 'She stamps a red paper seal on your mast. No pirate between Canton and Macau will touch you.' }),
			right: ch('Match wits with her', {}, { legend: 'ching-shih', tags: ['talk'], gamble: { p: odds(c, 0.4, ['talk', 'crime']), win: { fx: { renown: 20, silver: 10 }, text: 'She laughs at your audacity and invites you to drink rice wine in her cabin.' }, lose: { fx: { silver: -20, vigor: -10 }, text: 'She strips your hold to the bare planks. "Consider it a lesson in manners."' } } }),
			up: has(c, 'pirate') || dressed(c, 'pirate-garb') ? up('Brother of the Coast', 'Hail her with pirate code', { renown: 12, silver: 12 }, { legend: 'ching-shih', text: 'She recognizes the swagger of the Red Flag fleet and gives you a share of silver.' }) : undefined
		};
	}, { where: 'travel', modes: ['sea'], when: (c) => between(c, 1801, 1810) }),
	legend('nasreddin', ['ottoman', 'persian', 'steppe'], (c) => {
		const n = npc(c, 'scholar', { culture: 'ottoman', gender: 'm', name: 'Nasreddin Hodja', title: 'Foolish Sage' });
		return {
			id: 'legend-nasreddin',
			npc: n,
			text: `A bearded man rides his donkey backwards down the road. "Why backwards?" you ask. "If I rode forward," he beams, "my back would be to you! Now, hold this pot of yoghurt while I ferment the lake."`,
			left: ch('Ponder his riddle in earnest', { fortune: 14, renown: -4 }, { legend: 'nasreddin', text: 'You laugh until your sides ache. Strange: your mind feels crystal clear.' }),
			right: ch('Offer a counter-parable', {}, { legend: 'nasreddin', tags: ['talk'], gamble: { p: odds(c, 0.5, ['talk', 'art']), win: { fx: { renown: 14, fortune: 8 }, text: 'The Hodja nods solemnly: "Ah! A fellow idiot of the highest rank!"' }, lose: { fx: { silver: -6, fortune: 6 }, text: 'He out-argues you so thoroughly you end up buying his donkey a carrot.' } } }),
			up: has(c, 'scholar') || has(c, 'bookworm') ? up('Philosopher', 'Match his paradox with mystical verse', { renown: 16, fortune: 12 }, { legend: 'nasreddin', text: 'He embraces you with tears in his eyes: "At last, someone who understands nothing!"' }) : undefined
		};
	}),
	legend('sun-wukong', ['han', 'tibetan'], (c) => {
		const n = npc(c, 'hero', { culture: 'han', gender: 'm', name: 'A monkey on a cloud-boulder', title: 'The Great Sage' });
		return {
			id: 'legend-sun-wukong',
			npc: n,
			text: `On a mountain crag, a golden-furred monkey in silk trousers twirls a golden iron needle behind his ear while munching an enormous peach. "Heard you were on an errand across the four seas. Think your legs are faster than my cloud somersault?"`,
			left: ch('Kowtow with deep respect', { fortune: 16 }, { karma: 4, legend: 'sun-wukong', tags: ['faith'], itemAdd: ['immortal-peach'], text: 'He tosses you an immortal peach: "Eat up, mortal. Good for a hundred years of breath."' }),
			right: ch('Race him to the pass', {}, { legend: 'sun-wukong', gamble: { p: odds(c, 0.25, ['land']), win: { fx: { renown: 28 }, days: -2, text: 'You sprint like a demon. He chuckles at your spirit and gives you a cloud draft!' }, lose: { fx: { vigor: -12, fortune: 4 }, text: 'He does seven backflips and balances on your head. "Not bad for a human."' } } }),
			up: carrying(c, 'incense') ? up('Daoist offering', 'Offer fragrant incense and wine', { fortune: 20, renown: 10 }, { legend: 'sun-wukong', text: 'He sniffs the incense with a grin: "The Dragon King never gave me anything so polite!"' }) : undefined
		};
	}),
	legend('roro-kidul', ['malay'], (c) => {
		const n = npc(c, 'spirit', { culture: 'malay', gender: 'f', name: 'Kanjeng Ratu Kidul', title: 'Queen of the Southern Ocean' });
		return {
			id: 'legend-roro-kidul',
			npc: n,
			text: `The ocean roars with unearthly thunder. Before you rises an emerald carriage upon seafoam, drawn by white steeds. A crowned queen draped in glowing green batik fixes you with eyes like the ocean trench.`,
			left: ch('Cast flowers & incense into the surf', { silver: -6, fortune: 18 }, { legend: 'roro-kidul', tags: ['faith'], remember: { kind: 'favor', deed: 'honored the Queen of the Southern Sea' }, itemAdd: ['emerald-sash'], text: 'The waves calm instantly into jade glass. A green silk sash drifts into your hands.' }),
			right: ch('Offer your deepest vow of fidelity to the sea', { vigor: -8, renown: 16 }, { legend: 'roro-kidul', text: 'She smiles, cool as the deep. "The Southern Sea remembers its children."' }),
			up: withCrew(c, 'navigator') ? up('Navigator', 'Read the sacred currents of the south', { fortune: 22, renown: 8 }, { legend: 'roro-kidul', text: 'She nods in approval at your seamanship and grants you safe passage across all reefs.' }) : undefined
		};
	}, { where: 'travel', modes: ['sea'] }),
	legend('dokkaebi', ['korean'], (c) => {
		const n = npc(c, 'spirit', { culture: 'korean', gender: 'm', name: 'A one-horned wild man', title: 'Dokkaebi' });
		return {
			id: 'legend-dokkaebi',
			npc: n,
			text: `At a wooden bridge, a burly, grinning creature with one horn and a heavy studded club blocks your way. "Ssireum! Wrestle me, traveller! Win, and gold falls from my club. Lose, and you carry me across the river on your back!"`,
			left: ch('Trip his right leg (his secret weakness!)', {}, { legend: 'dokkaebi', tags: ['fight'], gamble: { p: odds(c, 0.65, ['fight']), win: { fx: { silver: 22, renown: 12 }, itemAdd: ['dokkaebi-token'], text: 'THUMP! He hits the dust, laughs like thunder, and taps his club on a rock — a lucky silver token rolls out!' }, lose: { fx: { vigor: -12, fortune: 4 }, text: 'He tosses you into a haystack. "Good grip! But my turn next time!"' } } }),
			right: ch('Share buckwheat jelly and rice wine', { silver: -5, fortune: 12 }, { legend: 'dokkaebi', tags: ['talk'], text: 'His eyes light up. "Buckwheat jelly!" He dances a jig and leaves lucky coins in your cup.' }),
			up: has(c, 'ronin') ? up('Master Wrestler', 'Execute a flawless martial sweep', { renown: 20, silver: 18 }, { legend: 'dokkaebi', itemAdd: ['dokkaebi-token'], text: 'The goblin flies over your shoulder with a roar of delight. He hands you a silver token.' }) : undefined
		};
	}),
	legend('garuda', ['indian', 'siamese', 'malay'], (c) => {
		const n = npc(c, 'spirit', { culture: 'indian', name: 'King of Birds', title: 'Garuda' });
		return {
			id: 'legend-garuda',
			npc: n,
			text: `A shadow sweeps across the sun. Huge golden feathers catch the light like polished shields as a magnificent bird of fire lands upon a ruined stupa. Its piercing eyes discern the purity of your intent.`,
			left: ch('Chant the solar hymn and bow', { fortune: 16 }, { karma: 6, legend: 'garuda', tags: ['faith'], itemAdd: ['garuda-feather'], text: 'A golden feather drifts into your outstretched palms, warm as midday sun.' }),
			right: ch('Offer sweet fruit and rice', { silver: -4, vigor: 12 }, { legend: 'garuda', text: 'The great bird tilts its head, accepts the grain, and emits a cry that scatters all venomous vipers for leagues.' }),
			up: has(c, 'ascetic') || has(c, 'pilgrim') ? up('Holy Rites', 'Perform the Vedic fire oblation', { fortune: 20, renown: 12 }, { legend: 'garuda', itemAdd: ['garuda-feather'], text: 'The Garuda spreads its wings in blessing. All illness and poison leave your blood.' }) : undefined
		};
	}),
	legend('al-khidr', ['persian', 'ottoman', 'steppe'], (c) => {
		const n = npc(c, 'spirit', { culture: 'persian', gender: 'm', name: 'A traveller in a green mantle', title: 'Al-Khidr' });
		return {
			id: 'legend-al-khidr',
			npc: n,
			text: `By a dry, forgotten well in the wastes, a lone traveller in a dark green cloak sits quietly. Where his feet touch the dust, fresh emerald grass sprouts. "Seeker of roads, do you travel to arrive, or to become?"`,
			left: ch('Drink from the cup he offers', { vigor: 22, fortune: 12 }, { legend: 'al-khidr', karma: 8, tags: ['faith', 'mercy'], text: 'The water tastes of mint and melted mountain snow. All fatigue and sorrow leave your heart.' }),
			right: ch('Confess your doubts about the journey', { renown: 4, fortune: 10 }, { legend: 'al-khidr', karma: 10, tags: ['talk'], text: 'He smiles gently: "The road itself is the teacher. Go forward without fear."' }),
			up: has(c, 'pilgrim') ? up('Mystic', 'Recite the verse of the hidden spring', { fortune: 25, vigor: 15 }, { legend: 'al-khidr', text: 'He touches your forehead with two fingers. You see the true paths of the four seas clear as starlight.' }) : undefined
		};
	})
];
