import { FAITHS, IDEALS, faithOfCity, kindred, type FaithId } from '#lib/data/faiths';
import { between, ch, has, npc, odds, place, up, type Ctx, type Template } from './helpers';

const heroFaith = (c: Ctx) => c.run.hero.faith as FaithId;
const localFaith = (c: Ctx) => faithOfCity(c.city.id, c.city.culture);
const devout = (c: Ctx) => heroFaith(c) !== 'skeptic';

export const FAITH_T: Template[] = [
	{
		id: 'pilgrimage',
		where: 'city',
		weight: 40,
		when: (c) => FAITHS[heroFaith(c)].holy.includes(c.city.id) && !c.run.pilgrimages.includes(c.city.id),
		make: (c) => {
			const f = FAITHS[heroFaith(c)];
			const n = npc(c, 'monk', { title: `Keeper of the ${f.place}` });
			const deed: Record<FaithId, string> = {
				buddhist: 'circle the stupa a hundred and eight times, spinning prayer wheels',
				confucian: 'kneel in the hall of the Sage and offer silk and wine to his tablet',
				daoist: 'climb the thousand steps at dawn and sit with the Immortals in the clouds',
				shinto: 'purify yourself at the stream and pass beneath the great torii',
				muslim: 'walk seven times around the Kaaba among pilgrims of every nation',
				hindu: 'bathe in the sacred river at dawn as the bells ring',
				christian: 'kneel at the holy altar and light a candle for every soul you have met',
				sikh: 'bathe in the pool of nectar and eat at the langar beside beggars and kings',
				folk: 'leave offerings at the oldest tree, where your ancestors are said to listen',
				skeptic: 'take notes'
			};
			return {
				id: 'pilgrimage',
				npc: n,
				badge: 'Pilgrimage',
				text: `${place(c)} — holiest of places for the ${f.name} faithful. ${n.name} invites you to ${deed[heroFaith(c)]}.`,
				left: ch('Pay respects briefly', { fortune: 6 }, { tags: ['faith'], pilgrimage: c.city.id, text: 'A short prayer, but a true one.' }),
				right: ch('Make the full pilgrimage', { fortune: 22, vigor: 6, renown: 6 }, { tags: ['faith', 'rest'], days: 3, pilgrimage: c.city.id, text: 'Three days outside of time. You leave lighter than you came.' })
			};
		}
	},
	{
		id: 'missionary',
		where: 'any',
		weight: (c) => (devout(c) && !kindred(heroFaith(c), localFaith(c)) ? 1.6 : 0.6),
		make: (c) => {
			const lf = localFaith(c) === heroFaith(c) ? (heroFaith(c) === 'christian' ? 'buddhist' : 'christian') : localFaith(c);
			const theirs = FAITHS[lf];
			const n = npc(c, 'monk', { title: lf === 'christian' ? 'Friar' : lf === 'muslim' ? 'Sufi preacher' : `${theirs.name} preacher` });
			return {
				id: 'missionary',
				npc: n,
				text: `${n.name} speaks warmly of the ${theirs.name} way. "${theirs.blurb}" They press a gift into your hands. "Will you embrace it?"`,
				left: ch(devout(c) ? `Keep your ${FAITHS[heroFaith(c)].name} faith` : 'Politely decline', { fortune: devout(c) ? 6 : 2 }, { tags: ['faith'], text: 'They bow, a little sadly.' }),
				right: ch(`Convert`, { renown: 6, fortune: -6 }, { tags: ['talk'], convert: lf, text: `${theirs.glyph} New prayers, new friends, and some very confused relatives back home.` }),
				up: has(c, 'silver-tongue') || has(c, 'scholar') ? up('Debater', 'Debate theology all night', { renown: 10 }, { tags: ['talk', 'art'], text: 'Nobody converts. Everybody is delighted.' }) : undefined
			};
		}
	},
	{
		id: 'fellow-believers',
		where: 'city',
		weight: (c) => (devout(c) && kindred(heroFaith(c), localFaith(c)) && c.run.hero.culture !== c.city.culture ? 2 : 0),
		make: (c) => {
			const f = FAITHS[heroFaith(c)];
			const n = npc(c, 'elder');
			return {
				id: 'fellow-believers',
				npc: n,
				text: `Far from home, ${n.name} recognizes you as ${f.name}. "Brother, sister — come, eat with us at the ${f.place}. No traveller of the faith sleeps outside."`,
				left: ch('Decline, with thanks', {}),
				right: ch('Accept their hospitality', { vigor: 12, fortune: 4 }, { tags: ['faith', 'rest'], days: 1, text: `You ${f.prayer} together and sleep warm.` })
			};
		}
	},
	{
		id: 'forbidden-feast',
		where: 'city',
		weight: (c) => (['muslim', 'hindu', 'buddhist', 'sikh'].includes(heroFaith(c)) && !kindred(heroFaith(c), localFaith(c)) ? 1.4 : 0),
		make: (c) => {
			const dish = heroFaith(c) === 'muslim' ? 'roast pork' : heroFaith(c) === 'hindu' || heroFaith(c) === 'sikh' ? 'beef stew' : 'a whole roast fish, still looking at you';
			const n = npc(c, 'noble');
			return {
				id: 'forbidden-feast',
				npc: n,
				text: `${n.name} honors you with a banquet. The centerpiece: ${dish}. Every eye turns to see the honored guest take the first bite.`,
				left: ch('Refuse, explaining your faith', { renown: -4, fortune: 8 }, { tags: ['faith'], text: 'An awkward silence — then the host orders something else, impressed.' }),
				right: ch('Eat, to honor the host', { renown: 6, fortune: -10 }, { tags: ['talk'], text: 'Diplomacy tastes complicated.' }),
				up: has(c, 'polyglot') || has(c, 'envoy') ? up('Diplomat', 'Praise the dish, eat only the rice', { renown: 6 }, { tags: ['talk'], text: 'Somehow everyone is satisfied.' }) : undefined
			};
		}
	},
	{
		id: 'fast',
		where: 'any',
		once: true,
		weight: (c) => (['buddhist', 'christian', 'hindu'].includes(heroFaith(c)) ? 0.8 : 0), // Ramadan follows the real calendar now
		make: (c) => {
			const name: Partial<Record<FaithId, string>> = { muslim: 'Ramadan', buddhist: 'Vassa, the rains retreat', christian: 'Lent', hindu: 'Navaratri' };
			const n = npc(c, 'monk');
			return {
				id: 'fast',
				npc: n,
				text: `It is ${name[heroFaith(c)]}. ${n.name} reminds you gently of the fast — even on the road.`,
				left: ch('Travellers are excused', { vigor: 4, fortune: -5 }),
				right: ch('Keep the fast', { vigor: -8, fortune: 14 }, { tags: ['faith'], text: 'Hungry days, clear nights.' })
			};
		}
	},
	{
		id: 'ibadat-khana',
		where: 'city',
		once: true,
		weight: 8,
		when: (c) => between(c, 1575, 1605) && ['agra', 'delhi', 'lahore'].includes(c.city.id),
		make: (c) => {
			const n = npc(c, 'noble', { culture: 'indian', gender: 'm', name: 'Emperor Akbar', title: 'Mughal Padishah' });
			const f = FAITHS[heroFaith(c)];
			return {
				id: 'ibadat-khana',
				npc: n,
				badge: 'History',
				text: `In the House of Worship at Fatehpur Sikri, Akbar gathers mullahs, pandits, Jesuits and Jains to argue about God. He notices you. "And what does the ${f.name} traveller say?"`,
				left: ch('Listen humbly', { fortune: 6, renown: 4 }, { tags: ['faith'] }),
				right: ch(`Speak for the ${f.name} way`, {}, { tags: ['talk', 'faith'], gamble: { p: odds(c, 0.5, ['talk', 'art']), win: { fx: { renown: 22, silver: 10 }, text: 'Akbar laughs with delight and sends you a robe of honor.' }, lose: { fx: { renown: -8 }, text: 'A Jesuit and a mullah agree, for once — against you.' } } })
			};
		}
	},
	{
		id: 'fumi-e',
		where: 'city',
		weight: 12,
		when: (c) => heroFaith(c) === 'christian' && between(c, 1614, 1873) && c.city.culture === 'japanese',
		make: (c) => {
			const n = npc(c, 'official', { culture: 'japanese', title: 'Inquisitor (shūmon-aratame)' });
			return {
				id: 'fumi-e',
				npc: n,
				badge: 'History',
				text: `Christianity is banned. ${n.name} places a bronze image of the Virgin on the floor. "Step on it, and you may pass."`,
				left: ch('Step on the image', { fortune: -14 }, { text: 'Your foot touches bronze. Something in you cracks.' }),
				right: ch('Refuse', { fortune: 12, renown: 6 }, { tags: ['faith'], heat: 45, text: 'They write your name in a black book.' }),
				up: c.run.flags.society || has(c, 'smuggler') ? up('Connections', 'Slip away to the hidden Christians', { fortune: 6 }, { tags: ['faith', 'crime'], heat: 15, text: 'In a fisherman’s loft, a hidden Mass in whispered Latin and Japanese.' }) : undefined
			};
		}
	},
	{
		id: 'shimabara',
		where: 'any',
		once: true,
		weight: 8,
		when: (c) => between(c, 1637, 1638) && c.city.culture === 'japanese',
		make: (c) => ({
			id: 'shimabara',
			npc: npc(c, 'child', { culture: 'japanese', gender: 'm', name: 'Amakusa Shirō', title: 'Teenage rebel leader' }),
			badge: 'History',
			text: `Starving peasants and hidden Christians have risen at Shimabara, led by a sixteen-year-old called a messiah. He asks you to smuggle rice into the besieged castle.`,
			left: ch('Stay away', { fortune: -4 }),
			right: ch('Run the blockade', { silver: -6, fortune: 12, renown: 8 }, { tags: ['mercy', 'crime'], heat: 30, text: 'Rice over the walls at night. The siege will not end well.' })
		})
	},
	{
		id: 'rites-controversy',
		where: 'city',
		once: true,
		weight: 5,
		when: (c) => between(c, 1700, 1742) && ['beijing', 'nanjing', 'macau', 'guangzhou'].includes(c.city.id),
		make: (c) => ({
			id: 'rites-controversy',
			npc: npc(c, 'monk', { culture: 'european', title: 'Jesuit at court' }),
			badge: 'History',
			text: `Rome forbids Chinese converts to honor their ancestors; the Kangxi Emperor is furious. A worried Jesuit asks you to carry a petition to court.`,
			left: ch('Not my quarrel', {}),
			right: ch('Carry the petition', { renown: 10 }, { tags: ['official', 'talk'], days: 1, gamble: { p: odds(c, 0.45, ['official']), win: { fx: { fortune: 8 }, text: 'The Emperor reads it — and smiles, briefly.' }, lose: { fx: { renown: -10 }, text: 'You are shown the gate, quickly.' } } })
		})
	},
	{
		id: 'golden-temple',
		where: 'city',
		weight: 3,
		when: (c) => c.city.id === 'amritsar' || (c.city.id === 'lahore' && c.year >= 1500),
		make: (c) => ({
			id: 'golden-temple',
			npc: npc(c, 'monk', { culture: 'indian', title: 'Sevadar' }),
			text: `At the langar, everyone — raja or beggar, Sikh or not — sits on the same floor to eat the same meal. A sevadar hands you a plate and, later, a ladle.`,
			left: ch('Eat and give thanks', { vigor: 10, fortune: 4 }, { tags: ['rest', 'mercy'] }),
			right: ch('Serve for a day', { vigor: -4, fortune: 12, renown: 4 }, { tags: ['mercy', 'faith'], days: 1, text: 'A thousand plates. Sore arms, light heart.' })
		})
	},
	{
		id: 'ideal-test',
		where: 'any',
		weight: 1,
		make: (c) => {
			const ideal = IDEALS[c.run.hero.ideal as keyof typeof IDEALS] ?? IDEALS.harmony;
			const n = npc(c, 'elder', { title: 'Wandering sage' });
			const tests: Record<string, [string, string, string]> = {
				honor: ['A wealthy man offers you silver to lose a fair contest on purpose.', 'Take the silver', 'Win it honestly'],
				prosperity: ['A failing shop sells its stock cheap. You could profit — or let a neighbor buy it.', 'Let the neighbor have it', 'Buy it all'],
				compassion: ['A thief who robbed you lies hurt in the street.', 'Walk past', 'Bind his wounds'],
				wisdom: ['An old scholar offers to teach you a dead script — it will take days.', 'No time', 'Study with him'],
				loyalty: ['Rebels offer you a fortune to carry their letter instead of your sovereign’s.', 'Take their fortune', 'Refuse them'],
				freedom: ['A lord offers you a comfortable post — if you stop travelling.', 'Accept the post', 'Keep the open road'],
				harmony: ['Two villages quarrel over a well. Both demand you take a side.', 'Pick the richer side', 'Broker a sharing']
			};
			const [text, bad, good] = tests[ideal.id];
			return {
				id: 'ideal-test',
				npc: n,
				text: `${n.name} watches you closely. ${text}`,
				left: ch(bad, { silver: 12, fortune: -14 }, { karma: -6, remember: false, text: `${ideal.glyph} The sage sighs. Your ideal of ${ideal.name} grows quieter.` }),
				right: ch(good, { fortune: 12, renown: 6 }, { karma: 6, remember: false, days: ideal.id === 'wisdom' ? 2 : 0, text: `${ideal.glyph} The sage bows. "${ideal.blurb}"` })
			};
		}
	}
];

