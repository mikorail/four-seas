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

