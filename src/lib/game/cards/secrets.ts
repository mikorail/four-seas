import { SECRETS } from '#lib/data/world';
import { between, ch, has, npc, odds, up, withCrew, type Ctx, type Template } from './helpers';

const knows = (c: Ctx, id: string) => !!c.run.flags['secret:' + id];
const sec = (id: string) => SECRETS.find((s) => s.id === id)!;
const reveal = (id: string) => ({ ['secret:' + id]: true });

function clue(id: string, cities: string[], role: Parameters<typeof npc>[1], title: string, text: string, extra: Partial<Template> = {}, cost = 4): Template {
	return {
		id: 'clue-' + id,
		where: 'city',
		weight: 2.4,
		...extra,
		when: (c) => !knows(c, id) && cities.includes(c.city.id) && (extra.when ? extra.when(c) : true),
		make: (c) => {
			const n = npc(c, role, { title });
			return {
				id: 'clue-' + id,
				npc: n,
				badge: 'Secret',
				text: text.replace('{npc}', `**${n.name}**`),
				left: ch('Not interested', {}, { remember: false }),
				right: ch(`Pay to learn the way (${cost})`, { silver: -cost }, { setFlag: reveal(id), remember: false, text: `${sec(id).name}: ${sec(id).hint}.` }),
				up: has(c, 'polyglot') || withCrew(c, 'guide') || withCrew(c, 'navigator') ? up(has(c, 'polyglot') ? 'Polyglot' : 'Your crew', 'Win the secret with talk instead of silver', {}, { tags: ['talk'], setFlag: reveal(id), remember: false }) : undefined
			};
		}
	};
}

function hidden(id: string, city: string, make: Template['make']): Template {
	return { id: 'hidden-' + id, where: 'city', weight: 200, once: true, when: (c) => c.city.id === city, make };
}

export const SECRET_T: Template[] = [
	clue('tea-horse', ['kunming', 'chengdu'], 'merchant', 'Naxi muleteer', 'In a teahouse full of mule bells, {npc} unrolls a map drawn on yak hide. "Brick tea for Tibetan horses — the old road over the mountains. Faster than any river, if your knees are good."'),
	clue('wakhan', ['kashgar', 'kabul', 'srinagar'], 'elder', 'Wakhi shepherd', '{npc} points his crook at a cleft in the mountains. "The Wakhan. Marco Polo went that way. Most people who try it now do not come back. But you have honest eyes."'),
	clue('smugglers', ['ningbo', 'tainan', 'macau'], 'captain', 'Smuggler captain', '{npc} lowers his voice. "The Shogun says no ships. The Shogun is not at sea at night. I know a cove in Satsuma where nobody asks questions."', { when: (c) => between(c, 1600, 1860) }, 6),
	clue('northern-sea', ['okhotsk', 'petropavlovsk', 'hakodate', 'sitka'], 'sailor', 'Pomor skipper', 'A Russian skipper with frost-cracked hands, {npc}, has sailed where the ice grinds ships to splinters. "There is a way through, in late summer. I will draw it for you — for vodka money."'),
	clue('shambhala', ['lhasa', 'kathmandu'], 'monk', 'Hermit lama', 'In a cave above the valley, {npc} has been meditating for twelve years. He opens one eye. "You are looking for Shambhala. Everybody is. Few are ready to be found by it."', { when: (c) => c.run.karma >= 15 || c.run.hero.faith === 'buddhist' || c.run.legends.includes('migoi') }, 0),
	clue('penglai', ['hangzhou', 'shanghai', 'busan', 'ningbo', 'quanzhou'], 'monk', 'Daoist recluse', '{npc}, an old Daoist with eyebrows down to his chin, watches the sea. "Some mornings Penglai appears on the water — towers, cranes, the Immortals feasting. Sail toward it and do not blink."', { when: (c) => c.run.hero.faith === 'daoist' || c.run.stats.fortune >= 55 || c.run.legends.includes('ryujin') }, 8),
	clue('gold-island', ['aceh', 'malacca', 'batavia', 'palembang'], 'sailor', 'Old Arab pilot', '{npc} taps an ancient chart. "Suvarnadvipa — the Island of Gold. The Hindus wrote of it, the Arabs sailed to it, and then everybody forgot the way. Everybody except me."', {}, 10),
	clue('waqwaq', ['zanzibar', 'kilwa', 'colombo', 'mogadishu'], 'captain', 'Dhow captain', '{npc} laughs. "Waq-waq? Where fruit grows shaped like heads and sings at dawn? A story for children." Then, quietly: "My grandfather went there once. He drew this."', { when: (c) => c.run.legends.includes('sinbad') || withCrew(c, 'navigator') || c.run.stats.fortune >= 60 }, 8),

	hidden('shambhala', 'shambhala', (c) => ({
		id: 'hidden-shambhala',
		npc: npc(c, 'monk', { culture: 'tibetan', title: 'Kalachakra master', name: 'The Keeper of the Wheel' }),
		badge: 'Hidden Place',
		text: 'Beyond a pass that should not exist lies a green valley ringed by eight snow peaks like the petals of a lotus. Nobody here is in a hurry. **The Keeper of the Wheel** smiles as if expecting you. "Stay, or take a little of Shambhala with you."',
		left: ch('Take the Kalachakra wheel and return', { fortune: 10 }, { itemAdd: ['kalachakra'], remember: false, text: 'When you look back from the pass, there is only snow.' }),
		right: ch('Stay in Shambhala', { fortune: 20 }, { remember: false, setFlag: { end: 'campaign', endWon: true, endTitle: 'Found by Shambhala', endText: 'You never leave the hidden valley. Travellers report seeing you, decades later, unchanged — teaching the young to read the turning of time.' } })
	})),
	hidden('penglai', 'penglai', (c) => ({
		id: 'hidden-penglai',
		npc: npc(c, 'spirit', { culture: 'han', title: 'Immortal', name: 'He Xiangu' }),
		badge: 'Hidden Place',
		text: 'The mirage does not fade. You step ashore among jade towers and white cranes. **He Xiangu**, one of the Eight Immortals, offers you a peach from the orchard of the Queen Mother of the West. "One bite and you are young. The whole peach and you are one of us."',
		left: ch('Take one peach for the road', { vigor: 10 }, { itemAdd: ['immortal-peach'], remember: false, text: 'Back on deck, the island is a smudge of mist — then nothing.' }),
		right: ch('Eat the whole peach', {}, { remember: false, setFlag: { end: 'campaign', endWon: true, endTitle: 'Among the Immortals', endText: 'You eat the peach and the years fall away. Fishermen on the coast still sometimes see a traveller with your face, riding a crane over the sea at dawn.' } })
	})),
	hidden('gold-island', 'suvarnadvipa', (c) => ({
		id: 'hidden-gold-island',
		npc: npc(c, 'noble', { culture: 'malay', title: 'Raja of the Gold Island' }),
		badge: 'Hidden Place',
		text: 'The river runs yellow; children skip stones of raw gold. In a temple older than Srivijaya, the **Raja** shows you a seated Buddha cast from a single nugget. "Gold is common here. What we lack is news. Tell me everything."',
		left: ch('Fill your purse with gold dust', { silver: 30 }, { treasury: 80, remember: false, text: 'Nobody minds. The river will make more.' }),
		right: ch('Trade stories for the golden Buddha', { renown: 10 }, { tags: ['talk'], itemAdd: ['gold-idol'], remember: false, text: 'Three nights of stories. You leave with the Buddha and a terrible sunburn.' })
	})),
	hidden('waqwaq', 'waqwaq', (c) => ({
		id: 'hidden-waqwaq',
		npc: npc(c, 'spirit', { culture: 'swahili', gender: 'f', title: 'Voice of the singing tree' }),
		badge: 'Hidden Place',
		text: 'At dawn the strange trees of Waq-waq begin to sing — one word, over and over: *waq, waq*. A voice from the branches asks your name, and repeats it back in your mother’s voice.',
		left: ch('Plant a seed of the singing tree in your bag', { fortune: 8 }, { itemAdd: ['singing-seed'], remember: false, text: 'It hums softly whenever danger is near.' }),
		right: ch('Listen until the song ends', {}, { tags: ['faith'], gamble: { p: odds(c, 0.5, ['faith']), win: { fx: { fortune: 20, renown: 10 }, text: 'You understand the song. You will never be quite lost again.' }, lose: { fx: { vigor: -10 }, days: 6, text: 'You wake on your ship six days later, sunburnt and humming.' } }, remember: false })
	}))
];

