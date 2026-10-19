// Romance: meeting someone, letters on the road, rivals, families, proposals and weddings in local custom.
import { CITY, cityName } from '#lib/data/world';
import { CULTURES, type CultureId } from '#lib/data/cultures';
import type { Companion, Npc, Role } from '../types';
import { carrying, ch, crewFull, dressed, has, npc, odds, place, romanceIs, up, withCrew, type Ctx, type Template } from './helpers';

const R = (c: Ctx) => c.run.romance!;
const beloved = (c: Ctx): Npc => ({ ...R(c).npc, role: 'lover' });
const together = (c: Ctx) => c.run.crew.some((m) => m.role === 'companion' && m.npc.name === R(c).npc.name);
const atHome = (c: Ctx) => c.run.romance?.city === c.city.id;
const far = (c: Ctx) => !together(c) && !atHome(c);

const WEDDING: Partial<Record<CultureId, string>> = {
	han: 'red lanterns, a red veil, kowtows to Heaven, Earth and the ancestors, and firecrackers until dawn',
	korean: 'a wooden goose, ducks carved in pairs, and the bride’s red-dotted cheeks',
	japanese: 'three sips of sake from three cups, three times, before the family shrine',
	viet: 'trays of betel and areca carried in procession, and a red-lacquered box of gifts',
	siamese: 'water poured over joined hands from a conch shell, and white thread linking your heads',
	malay: 'a bersanding: the two of you enthroned like a sultan and sultana for a day, showered in yellow rice',
	indian: 'seven steps around the sacred fire, henna on the hands, and a garland around each neck',
	persian: 'a sofreh spread with mirror, candles and sweets, and sugar ground over your heads',
	ottoman: 'a henna night, a contract before the kadı, and a procession on horseback',
	tibetan: 'white khata scarves, barley beer and an astrologer’s chosen hour',
	steppe: 'a new felt ger set up for you, and horse races in your honour',
	swahili: 'drums, the taarab orchestra and a week of feasting',
	european: 'banns read three Sundays, a church door and a ring',
	pacific: 'flower garlands, a feast in the earth oven and dancing on the sand'
};

const MEET: { role: Role; title: string; line: string; tags: ('art' | 'talk' | 'faith' | 'trade' | 'fight')[] }[] = [
	{ role: 'scholar', title: 'Young scholar', line: 'argues with you about poetry under the willows and wins, then apologises, then argues again', tags: ['art', 'talk'] },
	{ role: 'performer', title: 'Lute player', line: 'plays a song you have never heard and looks straight at you on the last note', tags: ['art'] },
	{ role: 'merchant', title: 'Merchant’s heir', line: 'beats you down on a price so beautifully you thank them', tags: ['trade'] },
	{ role: 'healer', title: 'Herbalist', line: 'binds your scraped hand and refuses payment twice', tags: ['faith'] },
	{ role: 'sailor', title: 'Ship’s navigator', line: 'names every star above the harbour for you, some of them made up', tags: ['talk'] },
	{ role: 'noble', title: 'Minor noble', line: 'lets a handkerchief fall exactly where you will find it', tags: ['talk'] },
	{ role: 'soldier', title: 'Archer of the guard', line: 'splits an arrow at a hundred paces and then blushes when you clap', tags: ['fight'] }
];

export const ROMANCE_T: Template[] = [
	// ----- meeting someone, flavoured by the place -----
	{
		id: 'love-meet',
		where: 'city',
		tags: ['romance'],
		weight: (c) => (c.run.romance && c.run.romance.status !== 'parted' ? 0 : 0.8),
		make: (c) => {
			const m = c.rng.pick(MEET);
			const n = npc(c, m.role, { title: m.title });
			const where = c.rng.pick(c.city.port ? ['on the harbour steps', 'at a tea house by the water', 'in the lantern-lit night market'] : ['on the old bridge', 'in a temple garden', 'at the night market', 'outside the academy gates']);
			return {
				id: 'love-meet',
				npc: n,
				text: `${where[0].toUpperCase() + where.slice(1)} you meet **${n.name}**, who ${m.line}. When you get up to leave, they ask where you are travelling — and whether you will write.`,
				left: ch('Smile, and keep walking', {}, { text: 'Some doors are better left closed. You will wonder, though.' }),
				right: ch('Promise to write — and mean it', { fortune: 4, vigor: 4 }, { tags: ['romance', ...m.tags], romance: { start: true, affection: 10 }, text: 'You trade addresses written on the back of a receipt.' }),
				up: has(c, 'romantic') || has(c, 'poet') ? up(has(c, 'poet') ? 'Poet' : 'Romantic', 'Leave them a poem instead', { renown: 3 }, { tags: ['romance', 'art'], romance: { start: true, affection: 25 }, text: 'They read it twice, then fold it into their sleeve, close to the skin.' }) : undefined
			};
		}
	},
	// ----- letters while apart -----
	{
		id: 'love-letter',
		where: 'travel',
		tags: ['romance'],
		weight: (c) => (romanceIs(c, 'courting', 'betrothed', 'married') && far(c) ? 1.6 : 0),
		make: (c) => {
			const r = R(c);
			const n = npc(c, 'sailor', { title: 'Post-rider' });
			const news = c.rng.pick(['their garden has finally bloomed', 'their mother is asking about you, suspiciously', 'they dream about you every third night', 'the city has not been the same', 'a rival suitor has been sending gifts', 'they copied out a poem for you, badly']);
			return {
				id: 'love-letter',
				npc: n,
				text: `${n.name} has carried a letter for you a long way. It is from **${r.npc.name}** in ${cityName(CITY[r.city], c.year)}: ${news}. The ink is a little smudged in one place.`,
				left: ch('Write back at length', { silver: -2 }, { tags: ['romance', 'art'], romance: { affection: 10 }, days: 1, text: 'You write all night. Most of it is true.' }),
				right: ch('Send a gift with your reply', { silver: -7 }, { tags: ['romance'], romance: { affection: 16 }, text: 'A carved comb, a bolt of good cloth, and two lines you could not say in person.' }),
				up: carrying(c, 'telegraph') ? up('Telegraph', 'Wire them instead', { silver: -3 }, { tags: ['romance'], romance: { affection: 14 }, text: 'STOP. MISS YOU. STOP. The clerk pretends not to read it.' }) : undefined
			};
		}
	},
	// ----- reunion in their city -----
	{
		id: 'love-reunion',
		where: 'city',
		tags: ['romance'],
		weight: (c) => (romanceIs(c, 'courting', 'betrothed') && atHome(c) && !together(c) ? 6 : 0),
		make: (c) => {
			const r = R(c);
			const warm = r.affection >= 50;
			return {
				id: 'love-reunion',
				npc: beloved(c),
				text: warm
					? `**${r.npc.name}** is waiting at the gate — they heard you were coming three days ago and have pretended not to wait ever since.`
					: `**${r.npc.name}** is cooler than you remember. "You were gone a long time," they say. "Letters are not a person."`,
				left: ch('Stay a few days', { vigor: 10 }, { tags: ['romance', 'rest'], days: 3, romance: { affection: warm ? 10 : 18 }, text: 'Long walks, long meals, long silences that are not awkward at all.' }),
				right: r.affection >= 60 && r.status === 'courting'
					? ch('Ask for their hand', {}, { tags: ['romance'], next: proposal(c), text: 'Your heart is pounding loud enough to hear across the room.' })
					: ch('Bring a gift', { silver: -6 }, { tags: ['romance'], romance: { affection: 12 }, text: 'They pretend it is too much. They keep it.' }),
				up: !crewFull(c) && r.affection >= 45 ? up('Love', '"Travel with me."', {}, { tags: ['romance'], crewAdd: companion(c), romance: { affection: 10 }, text: `${r.npc.name} has been packed for weeks, just in case.` }) : undefined
			};
		}
	},
	// ----- obstacles -----
	{
		id: 'love-family',
		where: 'city',
		tags: ['romance'],
		weight: (c) => (romanceIs(c, 'courting', 'betrothed') && (atHome(c) || together(c)) && !c.run.flags['love:family'] ? 2.5 : 0),
		make: (c) => {
			const r = R(c);
			const n = npc(c, 'elder', { culture: r.npc.culture, title: `${r.npc.name}’s parent` });
			const foreign = r.npc.culture !== c.run.hero.culture;
			return {
				id: 'love-family',
				npc: n,
				text: `**${n.name}**, ${r.npc.name}’s parent, receives you with tea and no smile. "${foreign ? `A ${CULTURES[c.run.hero.culture].adjective.toLowerCase()} traveller.` : 'A traveller.'} No house, no land, no family here. What exactly are you offering my child?"`,
				left: ch('Win them over with honesty', {}, { tags: ['talk', 'romance'], setFlag: { 'love:family': true }, gamble: { p: odds(c, 0.45, ['talk']), win: { fx: { renown: 4 }, text: '"Hm. At least you do not lie." From them, it is practically a blessing.'}, lose: { fx: { fortune: -4 }, text: 'The tea goes cold. So does the room.' } }, romance: { affection: 6 } }),
				right: ch('Offer a proper bride-price / dowry', { silver: -16 }, { tags: ['trade', 'romance'], setFlag: { 'love:family': true }, romance: { affection: 12 }, standing: 6, text: 'Silver speaks the language of every parent in the world.' }),
				up: dressed(c, 'mandarin-robe', 'scholar-robes', 'silk-turban', 'merchant-silks') || c.run.stats.renown >= 65 ? up(c.run.stats.renown >= 65 ? 'Renown' : 'Fine clothes', 'Let your reputation speak', { renown: 2 }, { tags: ['romance'], setFlag: { 'love:family': true }, romance: { affection: 15 }, text: 'They have heard of you. Suddenly there is cake.' }) : undefined
			};
		}
	},
	{
		id: 'love-rival',
		where: 'city',
		tags: ['romance', 'fight'],
		weight: (c) => (romanceIs(c, 'courting') && atHome(c) ? 1.5 : 0),
		make: (c) => {
			const r = R(c);
			const n = npc(c, c.rng.pick(['noble', 'merchant', 'soldier'] as Role[]), { title: 'Rival suitor' });
			return {
				id: 'love-rival',
				npc: n,
				text: `**${n.name}** has been courting ${r.npc.name} while you were away — with a better house, richer gifts and a terrible moustache. "Step aside, wanderer. You will only leave again."`,
				left: ch('Challenge them to a duel', {}, { tags: ['fight', 'romance'], gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 8 }, text: 'You disarm them in three passes. The moustache flees.'}, lose: { fx: { vigor: -14 }, text: 'You lose the duel, but ' + r.npc.name + ' tends your wounds anyway. Hm.' } }, romance: { affection: 8 } }),
				right: ch('Let them choose', { fortune: 2 }, { tags: ['romance'], romance: { affection: r.affection >= 50 ? 10 : -20 }, text: r.affection >= 50 ? `${r.npc.name} chooses you without a second glance.` : `${r.npc.name} hesitates. That hesitation tells you a great deal.` }),
				up: has(c, 'silver-tongue') || has(c, 'romantic') ? up(has(c, 'romantic') ? 'Romantic' : 'Silver tongue', 'Out-charm them at dinner', {}, { tags: ['romance', 'talk'], romance: { affection: 14 }, text: 'By dessert even the rival is laughing at your stories.' }) : undefined
			};
		}
	},
	// ----- married life -----
	{
		id: 'love-home',
		where: 'city',
		tags: ['romance', 'rest'],
		weight: (c) => (romanceIs(c, 'married') && atHome(c) && !together(c) ? 5 : 0),
		make: (c) => {
			const r = R(c);
			return {
				id: 'love-home',
				npc: beloved(c),
				text: `Home: a house with your shoes by the door. **${r.npc.name}** has kept everything as you left it, and a lot of things not as you left them. "Stay. Just this once, stay a while."`,
				left: ch('Stay a week', { vigor: 18, fortune: 6 }, { tags: ['romance', 'rest'], days: 7, romance: { affection: 12 }, text: 'Seven ordinary days. The best of the whole journey.' }),
				right: ch('Kiss them and go on', { vigor: 6 }, { tags: ['romance'], romance: { affection: -6 }, text: '"One day you will stay," they say. It is not a complaint. Not quite.' }),
				up: !crewFull(c) ? up('Married', '"Come with me this time."', {}, { tags: ['romance'], crewAdd: companion(c), text: 'They lock the door and hand the key to a neighbour.' }) : undefined
			};
		}
	},
	{
		id: 'love-road',
		where: 'travel',
		tags: ['romance'],
		weight: (c) => (c.run.romance && c.run.romance.status !== 'parted' && together(c) ? 1.2 : 0),
		make: (c) => {
			const r = R(c);
			const what = c.rng.pick([
				{ t: 'You argue about the route for an hour, then both laugh because you were both wrong.', fx: { fortune: 4 } },
				{ t: 'They fall ill with a fever on the road and you nurse them through the night.', fx: { vigor: -6 } },
				{ t: 'At a roadside shrine they ask, quietly, whether you will ever settle down.', fx: {} },
				{ t: 'They teach you a song from their childhood. You sing it badly. They love it.', fx: { vigor: 4 } }
			]);
			return {
				id: 'love-road',
				npc: beloved(c),
				text: `On the road with **${r.npc.name}**. ${what.t}`,
				left: ch('Hold their hand a while', what.fx, { tags: ['romance'], romance: { affection: 6 } }),
				right:
					r.status === 'courting' && r.affection >= 60
						? ch('Propose, right here', {}, { tags: ['romance'], next: proposal(c) })
						: ch('Promise them a proper home one day', { fortune: 2 }, { tags: ['romance'], romance: { affection: 4 } })
			};
		}
	},
	{
		id: 'love-cold',
		where: 'any',
		tags: ['romance'],
		weight: (c) => (c.run.romance && c.run.romance.status !== 'parted' && c.run.romance.affection < 25 && far(c) ? 1.5 : 0),
		make: (c) => {
			const r = R(c);
			const n = npc(c, 'merchant', { title: 'Traveller from ' + cityName(CITY[r.city], c.year) });
			return {
				id: 'love-cold',
				npc: n,
				text: `${n.name} has news from ${cityName(CITY[r.city], c.year)}: **${r.npc.name}** has stopped asking about you. "I think they are tired of waiting," ${n.name} says, not unkindly.`,
				left: ch('Let them go', { fortune: -2 }, { romance: { status: 'parted' }, text: 'You write one last letter. It is the shortest one you ever wrote, and the hardest.' }),
				right: ch('Send everything you can spare', { silver: -12 }, { tags: ['romance'], romance: { affection: 20 }, text: 'Silver, silk and a promise: soon.' })
			};
		}
	}
];

function companion(c: Ctx): Companion {
	const r = R(c);
	return { id: 'companion-' + r.npc.seed, npc: { ...r.npc, title: r.status === 'married' ? 'Spouse' : 'Beloved' }, role: 'companion', wage: 0, loyalty: 90, joinedDay: c.run.day };
}

function proposal(c: Ctx) {
	const r = R(c);
	const cul = (CITY[r.city]?.culture ?? r.npc.culture) as CultureId;
	const rite = WEDDING[cul] ?? 'a feast for the whole street';
	const yes = r.affection >= 60 ? 0.85 : 0.5;
	return {
		id: 'love-proposal',
		npc: beloved(c),
		text: `You ask **${r.npc.name}** to marry you. For a long moment they say nothing. Then: "And where would we live, wanderer? On a camel?" They are smiling, though. A wedding here would mean ${rite}.`,
		left: ch('Marry now, in the local way', { silver: -14 }, { tags: ['romance'], days: 4, gamble: { p: yes, win: { fx: { fortune: 12, vigor: 10, renown: 6 }, text: `Yes. The wedding is ${rite}. You have never been so happy, or so tired.`, romance: { status: 'married', affection: 15 } }, lose: { fx: { fortune: -6 }, text: '"Not yet," they say gently. "Come back to me when you are done running."', romance: { affection: -5 } } } }),
		right: ch('A betrothal, and a wedding when the commission is done', { silver: -4 }, { tags: ['romance', 'loyal'], romance: { status: 'betrothed', affection: 10 }, text: 'You exchange tokens: a ring, a hairpin, a knotted cord. A promise you will have to keep.' }),
		up: c.run.bag.find((id) => id.startsWith('curio-'))
			? up('A precious curio', 'Offer an heirloom-worthy gift', { fortune: 6 }, { tags: ['romance'], itemRemove: [c.run.bag.find((id) => id.startsWith('curio-'))!], romance: { status: 'married', affection: 25 }, days: 4, text: `They hold the gift up to the light, then hold you. The wedding is ${rite}.` })
			: undefined
	};
}
