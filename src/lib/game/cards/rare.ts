// Rare events: people from the history books in the right place and year, and things that should not happen at all.
// Each is very unlikely (and never repeats in a journey); many leave a thought, a relic or a hidden road behind.
import { carrying, ch, has, hint, inCulture, nearSecret, npc, odds, up, type Ctx, type Template } from './helpers';

const R = 0.12; // base weight: rare
const at = (c: Ctx, ids: string[]) => c.where === 'city' && ids.includes(c.city.id);
const yr = (c: Ctx, a: number, b: number) => c.year >= a && c.year <= b;

export const RARE_T: Template[] = [
	// ---------- history walks past ----------
	{
		id: 'rare-ricci',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['beijing', 'nanjing', 'macau']) && yr(c, 1583, 1610) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'european', gender: 'm', name: 'Matteo Ricci', title: 'Jesuit, “Li Madou” to the Chinese' });
			return {
				id: 'rare-ricci',
				npc: n,
				badge: '✦ Rare',
				text: `An Italian in the robes of a Confucian scholar is drawing a map of the whole world — with China, tactfully, in the middle. **Matteo Ricci** looks up. "You have travelled. Tell me where the coastlines really go, and I will teach you my memory palace: a building in your head where nothing is ever forgotten."`,
				left: ch('Trade your routes for his memory palace', { renown: 8 }, { tags: ['art', 'talk'], days: 2, thought: 'many-tongues', text: 'You build the palace room by room. Every city you have seen gets a chamber. You will never lose your way in your own head again.' }),
				right: ch('Ask to see the world map', { renown: 4, fortune: 4 }, { tags: ['art'], text: 'Ricci’s map is wrong in a hundred places, and the most beautiful thing you have ever seen.' }),
				up: has(c, 'cartographer') ? up('Cartographer', 'Correct his coastlines yourself', { renown: 18 }, { tags: ['art'], days: 2, text: 'Your corrections go into the next printing. Somewhere in the Kunyu Wanguo Quantu is your hand.' }) : undefined
			};
		}
	},
	{
		id: 'rare-basho',
		where: 'travel',
		modes: ['land'],
		once: true,
		rare: true,
		weight: (c) => (inCulture(c, 'japanese') && yr(c, 1684, 1694) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'monk', { culture: 'japanese', gender: 'm', name: 'Matsuo Bashō', title: 'Wandering poet' });
			return {
				id: 'rare-basho',
				npc: n,
				badge: '✦ Rare',
				text: `A thin man in a straw hat and a monk’s robe sits by a pond, waiting for a frog. He introduces himself as **Bashō**. "I am walking the narrow road to the deep north," he says. "Walk with me one day, and tell me one true thing about your journey. Only one."`,
				left: ch('Walk with him, and tell him your true thing', { renown: 10 }, { tags: ['art'], days: 1, thought: 'mono-no-aware', text: 'He listens, says nothing for an hour, then writes seventeen syllables you will carry for the rest of your life.' }),
				right: ch('Bow and walk on', { fortune: 3 }, { text: 'Later you hear a frog jump into a pond and, for some reason, stop walking.' })
			};
		}
	},
	{
		id: 'rare-hokusai',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['edo']) && yr(c, 1814, 1849) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'performer', { culture: 'japanese', gender: 'm', name: 'Katsushika Hokusai', title: '“The old man mad about drawing”' });
			return {
				id: 'rare-hokusai',
				npc: n,
				badge: '✦ Rare',
				text: `In a cluttered room — he moves house whenever it gets too dirty — an old man is painting a wave the size of a mountain. **Hokusai** squints at you. "Your face has crossed too many seas. Sit. I will draw it, and you will pay me in stories."`,
				left: ch('Sit for the portrait', { renown: 14 }, { tags: ['art'], days: 1, itemAdd: ['curio-hokusai'], text: 'He draws you in nine lines and throws away eight drafts. The ninth is you, more truthfully than any mirror.' }),
				right: ch('Ask about the wave', { fortune: 6 }, { tags: ['art'], text: '"Seventy-three years old and I have just begun to understand the structure of waves," he says. "At a hundred and ten, every dot will live."' })
			};
		}
	},
	{
		id: 'rare-xu-xiake',
		where: 'travel',
		modes: ['land', 'river'],
		once: true,
		rare: true,
		weight: (c) => (inCulture(c, 'han') && yr(c, 1608, 1640) ? R * 3 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'han', gender: 'm', name: 'Xu Xiake', title: 'Travel writer, walking for thirty years' });
			const sec = nearSecret(c, 3);
			return {
				id: 'rare-xu-xiake',
				npc: n,
				badge: '✦ Rare',
				text: `A sunburnt scholar with a walking stick and a diary thicker than a brick. **Xu Xiake** has walked to every mountain in the empire and written down all of them. "Another wanderer! Compare notes with me — I collect roads the way others collect jade."`,
				left: ch('Compare notes all night', { renown: 6 }, { tags: ['art', 'talk'], thought: 'ten-thousand-li', ...(sec ? { setFlag: { ['secret:' + sec.id]: true }, text: `He shows you a road you have never heard of: ${sec.hint}. "Nobody believes me," he says. "Go and see."` } : { text: 'By dawn you have traded a dozen shortcuts and twice as many complaints about innkeepers.' }) }),
				right: ch('Ask for one piece of advice', { fortune: 4 }, { text: '"Never trust a map drawn by someone who has not walked it. Including mine."' })
			};
		}
	},
	{
		id: 'rare-kaempfer',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['nagasaki']) && yr(c, 1690, 1692) ? R * 6 : 0),
		make: (c) => {
			const n = npc(c, 'healer', { culture: 'european', gender: 'm', name: 'Engelbert Kaempfer', title: 'German physician of Dejima' });
			return {
				id: 'rare-kaempfer',
				npc: n,
				badge: '✦ Rare',
				text: `On Dejima, a German doctor is secretly writing a book about the forbidden country, paying his Japanese students in lessons and gin. **Kaempfer** lowers his voice. "Everything about Japan is a secret. Help me smuggle out my notes, and I will put you in the history of Japan."`,
				left: ch('Smuggle his notes', {}, { tags: ['crime'], heat: 15, gamble: { p: odds(c, 0.5, ['crime']), win: { fx: { renown: 16 }, text: 'Sewn into your coat lining. His History of Japan will be read in Europe for a century.' }, lose: { fx: { renown: -8 }, heat: 20, text: 'An interpreter finds a page. You burn the rest before they search you.' } } }),
				right: ch('Trade medicine for his herbals', { vigor: 8 }, { tags: ['illness'], itemAdd: ['medicine'], text: 'He swaps a chest of Dutch remedies for your stories of the road.' })
			};
		}
	},
	{
		id: 'rare-cao-xueqin',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['beijing']) && yr(c, 1740, 1763) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'han', gender: 'm', name: 'Cao Xueqin', title: 'Impoverished novelist in the western hills' });
			return {
				id: 'rare-cao-xueqin',
				npc: n,
				badge: '✦ Rare',
				text: `In a poor house outside the city, a man who was born rich is writing a novel about a family like his — a red chamber, a dream, a fall. **Cao Xueqin** offers you millet porridge and asks you to read a chapter aloud. "I need to hear if it sounds true."`,
				left: ch('Read it aloud', { fortune: 6 }, { tags: ['art'], thought: 'butterfly-dream', text: 'You read until the lamp goes out. When you stop, you are not quite sure which family is real.' }),
				right: ch('Leave him silver for paper', { silver: -8 }, { tags: ['mercy', 'art'], karma: 6, text: 'He will die before he finishes it. The unfinished book will outlive every emperor of his dynasty.' })
			};
		}
	},
	{
		id: 'rare-galileo',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['venice', 'rome', 'florence']) && yr(c, 1609, 1633) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'european', gender: 'm', name: 'Galileo Galilei', title: 'Mathematician and stargazer' });
			return {
				id: 'rare-galileo',
				npc: n,
				badge: '✦ Rare',
				text: `On a windy loggia after dusk, a bearded professor aims a leather-wrapped tube of ground lenses at the sky. **Galileo Galilei** beckons you to the eyepiece. "Four little stars, circling Jupiter like moons. Look quickly, before the inquisitors decide that glass is heresy."`,
				left: ch('Peer through the glass and debate the heavens', { renown: 10, fortune: 4 }, { tags: ['art', 'talk'], days: 1, thought: 'comet-sign', text: 'You watch four pinpricks of light wheel across the dark. The sky feels ten times larger than it did at sunset.' }),
				right: ch('Buy one of his workshop spyglasses', { silver: -10, renown: 4 }, { tags: ['trade'], itemAdd: ['telescope'], text: 'He wraps a brass-fitted perspicillum in oiled wool. "Point it at ships or stars. Both move."' }),
				up: has(c, 'scholar') || has(c, 'cartographer') ? up('Scholar', 'Share eastern eclipse tables with him', { renown: 16 }, { tags: ['art', 'talk'], itemAdd: ['telescope'], text: 'He copies your figures by candlelight and presses a spare spyglass into your hands in return.' }) : undefined
			};
		}
	},
	{
		id: 'rare-rembrandt',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['amsterdam']) && yr(c, 1632, 1669) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'performer', { culture: 'european', gender: 'm', name: 'Rembrandt van Rijn', title: 'Master painter of the Breestraat' });
			return {
				id: 'rare-rembrandt',
				npc: n,
				badge: '✦ Rare',
				text: `In a house on the Sint Antoniesbreestraat crammed with Turkish helmets, shells, and Japanese armour, a painter with ink under his fingernails studies the road-dust on your coat. **Rembrandt van Rijn** reaches for a copper etching plate. "Hold still in that light. The shadow across your brow is worth ten guilders."`,
				left: ch('Pose in his studio curiosities', { renown: 12, fortune: 4 }, { tags: ['art'], days: 1, thought: 'mianzi-cage', text: 'He scratches your likeness into wax with a needle. Half of Amsterdam will see your face in the print-shop window.' }),
				right: ch('Sell him a curio from the East', { silver: 14, renown: 4 }, { tags: ['trade', 'art'], text: 'He pays without haggling, already holding the piece up to the north window to see how it catches the gloom.' })
			};
		}
	},
	{
		id: 'rare-evliya',
		where: 'any',
		once: true,
		rare: true,
		weight: (c) => ((inCulture(c, 'ottoman') || at(c, ['vienna', 'cairo', 'istanbul', 'tabriz', 'baku'])) && yr(c, 1640, 1682) ? R * 4 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'ottoman', gender: 'm', name: 'Evliya Çelebi', title: 'Author of the Book of Travels' });
			const sec = nearSecret(c, 4);
			return {
				id: 'rare-evliya',
				npc: n,
				badge: '✦ Rare',
				text: `At a coffee-house corner table, a gentleman with ink-stained cuffs is filling his tenth leather notebook with slang, recipes, miracles, and headcounts of every bathhouse in the city. **Evliya Çelebi** grins and pours you a cup. "The Prophet appeared to me in a dream, and instead of asking for intercession, my tongue slipped and I asked for travel. Sit! Trade me a road."`,
				left: ch('Swap travellers’ tales until dawn', { renown: 8, fortune: 4 }, { tags: ['talk', 'art'], days: 1, thought: 'ten-thousand-li', ...(sec ? { setFlag: { ['secret:' + sec.id]: true }, text: `Between tall tales he sketches a real shortcut in the margin: ${sec.hint}. "Write my name in your book," he says, "and I will write yours in my Seyahatname."` } : { text: 'He writes your name and three of your best stories into his Seyahatname, embellishing each only slightly.' }) }),
				right: ch('Ask him about the local dialect', { renown: 6 }, { tags: ['talk'], thought: 'many-tongues', text: 'He teaches you seven proverbs, four curses, and the exact phrase that makes local gate-guards laugh.' })
			};
		}
	},
	{
		id: 'rare-ulugh-beg-heirs',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => (at(c, ['samarkand', 'bukhara']) ? R * 3.5 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { culture: 'steppe', gender: 'm', name: 'Qadi-zadeh’s Successor', title: 'Astronomer of the great sextant' });
			return {
				id: 'rare-ulugh-beg-heirs',
				npc: n,
				badge: '✦ Rare',
				text: `On the hill of Kuhak outside the walls, two old astronomers sit beside the buried marble arc of **Ulugh Beg’s Observatory**, checking the star tables of the *Zij-i Sultani* against a brass astrolabe. "The prince lost his head for loving the stars more than war," one murmurs, "but his numbers are still off by less than a heartbeat a year."`,
				left: ch('Help calculate the night’s meridian', { renown: 8, fortune: 6 }, { tags: ['art', 'talk'], days: 1, thought: 'comet-sign', text: 'Sunlight and starlight slide down the underground marble trench. Your road ahead feels measured to the second.' }),
				right: ch('Purchase a calibrated brass astrolabe', { silver: -11, renown: 4 }, { tags: ['trade'], itemAdd: ['curio-astrolabe'], text: 'Engraved with the latitudes of forty cities from Samarkand to Cathay.' })
			};
		}
	},
	{
		id: 'rare-linnaeus-apostle',
		where: 'any',
		once: true,
		rare: true,
		weight: (c) => (inCulture(c, 'european', 'malay', 'japanese') && yr(c, 1750, 1795) ? R * 3.5 : 0),
		make: (c) => {
			const n = npc(c, 'healer', { culture: 'european', gender: 'm', name: 'Carl Peter Thunberg', title: 'Botanist from Uppsala' });
			return {
				id: 'rare-linnaeus-apostle',
				npc: n,
				badge: '✦ Rare',
				text: `A sunburned Swedish doctor in a coat bulging with seed-packets is pressing mountain leaves between sheets of blotting paper. **Carl Peter Thunberg**, one of Professor Linnaeus’s travelling apostles, wipes his spectacles. "Every plant in creation needs two Latin names, and half of them will cure a fever if you boil the right root."`,
				left: ch('Gather rare specimens with him', { vigor: 8, renown: 8 }, { tags: ['art', 'illness'], days: 1, itemAdd: ['fever-tonic'], text: 'You climb two ridges together. He names a shrub after you in his herbarium and brews a tonic from the bark.' }),
				right: ch('Trade road notes for his medical kit', { vigor: 6, fortune: 4 }, { tags: ['trade', 'illness'], itemAdd: ['medicine'], text: 'He trades a tin of Uppsala powders for seeds stuck to the hem of your cloak.' })
			};
		}
	},
	// ---------- things that should not happen ----------
	{
		id: 'rare-mirror',
		where: 'city',
		once: true,
		rare: true,
		weight: R,
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Seller of old mirrors' });
			return {
				id: 'rare-mirror',
				npc: n,
				badge: '✦ Rare',
				text: `In a dusty stall, a bronze mirror shows the room behind you — but there is a traveller in it who is not you, wearing your coat, making a different choice at a different table. **${n.name}** covers it with a cloth. "That one is not for sale. Unless?"`,
				left: ch('Look longer', { fortune: -3 }, { tags: ['faith'], thought: 'mirror-world', text: 'The other traveller looks up and sees you too. Neither of you looks away first.' }),
				right: ch('Walk away quickly', {}, { text: 'You do not look into a mirror again for a week.' })
			};
		}
	},
	{
		id: 'rare-go-immortal',
		where: 'travel',
		modes: ['land'],
		once: true,
		rare: true,
		weight: (c) => (inCulture(c, 'han', 'korean', 'japanese', 'tibetan') ? R : 0),
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Old man under a pine' });
			return {
				id: 'rare-go-immortal',
				npc: n,
				badge: '✦ Rare',
				text: `Two old men are playing Go on a flat rock beside the path. One gets up, nods to you, and leaves his seat empty. **${n.name}** gestures at the board. "One game. It will not take long."`,
				left: ch('Sit down and play', {}, { tags: ['gamble', 'art'], days: 20, thought: 'go-with-god', text: 'It seems like an afternoon. When you stand up, the leaves have changed colour and your beard has grown. The old man is gone. The stones are still warm.' }),
				right: ch('Politely decline — you have a deadline', { fortune: 2 }, { text: 'He smiles as if you have answered a much bigger question.' })
			};
		}
	},
	{
		id: 'rare-comet',
		where: 'any',
		once: true,
		rare: true,
		weight: (c) => ((c.run.world ?? []).some((w) => w.kind === 'omen') ? R * 5 : R * 0.5),
		make: (c) => {
			const n = npc(c, 'fortune-teller', { title: 'Court astrologer, dismissed' });
			return {
				id: 'rare-comet',
				npc: n,
				badge: '✦ Rare',
				text: `**${n.name}** grabs your sleeve and points: the broom star’s tail, tonight, points exactly along your road. "I lost my post for saying it means the fall of a dynasty. I think it means *you*."`,
				left: ch('Take it as a sign and hurry on', { fortune: 6 }, { tags: ['faith'], thought: 'comet-sign', text: 'You leave before dawn. For days the comet hangs ahead of you like a lantern.' }),
				right: ch('Pay for a full reading', { silver: -6 }, { tags: ['faith'], gamble: { p: 0.6, win: { fx: { fortune: 12 }, text: '"Great fortune — and a great loss before it. In that order. No, the other order."' }, lose: { fx: { fortune: -6 }, text: 'The reading is so grim that you stop listening halfway.' } } })
			};
		}
	},
	{
		id: 'rare-letter-from-yourself',
		where: 'city',
		once: true,
		rare: true,
		weight: R * 0.8,
		make: (c) => {
			const n = npc(c, 'child', { title: 'Messenger boy' });
			const sec = nearSecret(c, 4);
			return {
				id: 'rare-letter-from-yourself',
				npc: n,
				badge: '✦ Rare',
				text: `**${n.name}** hands you a letter. The handwriting is yours. The date is ten years from now. It says: *Do not trust the ${c.rng.pick(['second', 'third', 'next'])} captain who smiles at you.${sec ? ` And take the road nobody uses: ${sec.hint}.` : ' And write to Mother.'}* You do not remember writing it. You will, apparently.`,
				left: ch('Follow the letter’s advice', { fortune: 8 }, { tags: ['faith'], ...(sec ? { setFlag: { ['secret:' + sec.id]: true } } : {}), text: 'You fold it very small and keep it next to your skin.' }),
				right: ch('Burn it — this is a trick', { renown: 2 }, { text: 'The ashes form a word on the floor before the draught scatters them. You do not read it.' })
			};
		}
	},
	{
		id: 'rare-last-speaker',
		where: 'city',
		once: true,
		rare: true,
		weight: R,
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Last speaker of a language' });
			return {
				id: 'rare-last-speaker',
				npc: n,
				badge: '✦ Rare',
				text: `**${n.name}** is the last person alive who speaks the language of her grandmother’s village. She has nobody to talk to. "Sit," she says, in it. You somehow understand.`,
				left: ch('Learn as many words as you can', {}, { tags: ['talk', 'mercy'], days: 2, thought: 'many-tongues', karma: 4, text: 'Forty words. Two songs. One joke that does not translate. When you leave, the language lives in two people.' }),
				right: ch('Write the words down for her', { renown: 6 }, { tags: ['art', 'mercy'], days: 1, text: 'A dictionary of one hundred words. She cries when you read it back to her.' })
			};
		}
	},
	{
		id: 'rare-whale-fall',
		where: 'travel',
		modes: ['sea'],
		once: true,
		rare: true,
		weight: R * 1.5,
		make: (c) => {
			const n = npc(c, 'sailor', { title: 'Lookout' });
			return {
				id: 'rare-whale-fall',
				npc: n,
				badge: '✦ Rare',
				text: `**${n.name}** yells from the masthead: a dead whale, belly-up, glowing faintly in the dusk. Birds by the thousand. In its gut, the old sailors say, there may be ambergris — worth more than its weight in gold.`,
				left: ch('Lower a boat and cut it open', { vigor: -6 }, { tags: ['sea', 'gamble'], gamble: { p: odds(c, 0.45, ['sea']), win: { fx: { renown: 6 }, itemAdd: ['curio-ambergris'], text: 'A grey lump that smells of the sea and old churches. The captain goes pale with greed.' }, lose: { fx: { vigor: -8 }, text: 'Nothing but stink. You will smell it on your hands for a week.' } } }),
				right: ch('Let the sea keep it', { fortune: 4 }, { tags: ['faith'], text: 'The sailors grumble. That night the sea is unusually calm.' })
			};
		}
	},
	{
		id: 'rare-ghost-market',
		where: 'city',
		once: true,
		rare: true,
		weight: (c) => R * (c.run.romance || c.run.lineage?.length ? 1.5 : 1),
		make: (c) => {
			const n = npc(c, 'spirit', { title: 'Stallholder of the night market' });
			return {
				id: 'rare-ghost-market',
				npc: n,
				badge: '✦ Rare',
				text: `After midnight a market opens in a street that was a wall this afternoon. Lanterns with no flames. Customers with no feet. **${n.name}** sells things people lost — and takes memories as payment. "One memory, any one. For this."`,
				left: ch('Pay with a memory', {}, { tags: ['faith', 'crime'], itemAdd: ['tortoise-shell'], text: 'You cannot remember, afterwards, what you gave up. Only that it was warm. The shell in your hand is very old and very heavy.' }),
				right: ch('Leave before the cock crows', { fortune: 3 }, { text: 'At dawn, the wall is back. Your shoes are covered in ash.' }),
				up: carrying(c, 'lantern') ? up('Paper lantern', 'Hold up your own lantern and bargain as an equal', { fortune: 10 }, { itemAdd: ['tortoise-shell'], text: 'The spirits respect a traveller who brings their own light. You pay nothing.' }) : undefined
			};
		}
	},
	{
		id: 'rare-old-road',
		where: 'travel',
		once: false,
		rare: true,
		weight: (c) => (nearSecret(c, 1) ? R * 2 : 0),
		make: (c) => {
			const sec = nearSecret(c, 1)!;
			const n = npc(c, c.rng.pick(['elder', 'monk', 'bandit', 'child']), { title: 'Stranger at a fork in the road' });
			return {
				id: 'rare-old-road',
				npc: n,
				badge: '✦ Hidden road',
				text: `At a fork you would have walked straight past, **${n.name}** is sitting on a milestone carved with characters too worn to read. "You are looking at the wrong road," they say. "Everyone does."`,
				left: ch('Ask about the other road', {}, { tags: ['talk'], bump: { ['hint:' + sec.id]: 2 }, text: `"${sec.hint[0].toUpperCase() + sec.hint.slice(1)}." They point. When you look back, the milestone is just a stone.` }),
				right: ch('Keep to the known road', { fortune: 2 }, { text: 'Sensible. Probably.' })
			};
		}
	}
];

