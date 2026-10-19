import { between, carrying, ch, has, inCulture, npc, place, up, withCrew, dressed, type Template } from './helpers';

export const ERA: Template[] = [
	{
		id: 'imjin',
		where: 'any',
		once: true,
		weight: 6,
		when: (c) => between(c, 1592, 1598) && inCulture(c, 'korean', 'japanese'),
		make: (c) => ({
			id: 'imjin',
			npc: npc(c, 'soldier', { culture: 'korean', title: 'Turtle ship marine' }),
			badge: 'History',
			text: `War! Hideyoshi's armies have landed in Joseon. Marines beg any able hand to help haul cannon to Admiral Yi's ironclad turtle ships.`,
			left: ch('Avoid the war', { renown: -6, fortune: -4 }, { text: 'You slip away on a fishing boat.' }),
			right: ch('Help the fleet', { vigor: -14, renown: 18 }, { tags: ['fight'], days: 3, text: 'You watch the turtle ships smash the invaders at sea.' })
		})
	},
	{
		id: 'sekigahara',
		where: 'any',
		once: true,
		weight: 6,
		when: (c) => between(c, 1600, 1600) && inCulture(c, 'japanese'),
		make: (c) => ({
			id: 'sekigahara',
			npc: npc(c, 'soldier', { culture: 'japanese', title: 'Tokugawa recruiter' }),
			badge: 'History',
			text: `East and West armies gather at Sekigahara. Whoever wins will rule Japan for 250 years. A recruiter wants your sword for Lord Tokugawa.`,
			left: ch('Stay out of it', { fortune: 3 }, { days: 1 }),
			right: ch('Fight for Tokugawa', { vigor: -16, renown: 20, silver: 10 }, { tags: ['fight', 'loyal'], days: 3, text: 'Fog, then chaos, then a new age.' })
		})
	},
	{
		id: 'manchu',
		where: 'any',
		once: true,
		weight: 6,
		when: (c) => between(c, 1644, 1650) && inCulture(c, 'han'),
		make: (c) => ({
			id: 'manchu',
			npc: npc(c, 'official', { culture: 'han', title: 'Qing official' }),
			badge: 'History',
			text: `The Ming has fallen. Manchu officials decree that every man must shave his forehead and braid a queue — "keep your hair, lose your head."`,
			left: ch('Refuse and hide', { renown: 8, fortune: -6 }, { heat: 20, text: 'You are a loyalist now, whether you like it or not.' }),
			right: ch('Comply', { renown: -4 }, { tags: ['loyal'], text: 'Cold air on your scalp. Safe passage on the roads.' })
		})
	},
	{
		id: 'sakoku',
		where: 'city',
		weight: 5,
		when: (c) => between(c, 1639, 1853) && c.city.culture === 'japanese' && c.run.hero.culture !== 'japanese',
		make: (c) => {
			const n = npc(c, 'official', { culture: 'japanese' });
			return {
				id: 'sakoku',
				npc: n,
				badge: 'History',
				text: `"The realm is closed to foreigners," says ${n.name}, unsmiling. "Explain yourself — or be confined to Dejima island."`,
				left: ch('Accept confinement', { vigor: -4, renown: -4 }, { days: 3, text: 'Three days on a fan-shaped island, watched always.' }),
				right: ch('Present gifts & papers', { silver: -12, renown: 6 }, { tags: ['official', 'foreign'], text: 'Grudgingly, a pass is issued.' }),
				up: dressed(c, 'company-uniform') ? up('Company coat', 'Present yourself as a VOC officer', { renown: 4 }, { text: 'The Dutch are tolerated. You are the Dutch, for today.' }) : dressed(c, 'local-dress') && c.run.outfit?.culture === 'japanese' ? up('Kimono', 'Bow deeply and say nothing foreign', {}, { text: 'In kimono, eyes lowered, you pass as a merchant from Satsuma. Mostly.' }) : carrying(c, 'papers') ? up('Forged papers', 'Show papers naming you a Dutch factor', {}, { text: 'Dejima rules apply to the Dutch… mostly. You are waved through.' }) : undefined
			};
		}
	},
	{
		id: 'perry',
		where: 'any',
		once: true,
		weight: 6,
		when: (c) => between(c, 1853, 1854) && inCulture(c, 'japanese'),
		make: (c) => ({
			id: 'perry',
			npc: npc(c, 'official', { culture: 'japanese' }),
			badge: 'History',
			text: `Black ships belching smoke sit in Edo Bay. An American commodore demands Japan open its ports. The officials ask: can you translate?`,
			left: ch('Not my business', {}),
			right: ch('Translate the letter', { renown: 14 }, { tags: ['talk', 'foreign'], days: 2, text: 'History, written partly in your handwriting.' }),
			up: has(c, 'polyglot') || withCrew(c, 'interpreter') ? up('Languages', 'Translate — and soften the threats', { renown: 22, fortune: 6 }, { days: 2, text: 'Both sides think the other is surprisingly polite.' }) : undefined
		})
	},
	{
		id: 'boshin',
		where: 'any',
		once: true,
		weight: 5,
		when: (c) => between(c, 1868, 1869) && inCulture(c, 'japanese'),
		make: (c) => ({
			id: 'boshin',
			npc: npc(c, 'soldier', { culture: 'japanese', title: 'Shogunate loyalist' }),
			badge: 'History',
			text: `Civil war: the Shogun's men against the Emperor's. A loyalist with a rifle and a sword asks if you'll stand with the old ways.`,
			left: ch('Side with the Emperor', { renown: 8 }, { text: 'The future wins. It usually does.' }),
			right: ch('Stand with the Shogun', { renown: 12, vigor: -12 }, { tags: ['fight'], days: 2, text: 'A last charge of the old world.' })
		})
	},
	{
		id: 'meiji',
		where: 'city',
		weight: 3,
		when: (c) => c.year >= 1870 && c.city.culture === 'japanese',
		make: (c) => {
			const n = npc(c, 'official', { culture: 'japanese' });
			return {
				id: 'meiji',
				npc: n,
				badge: 'History',
				text: `${n.name} wears a frock coat and a samurai's posture. "Japan modernizes! Ride our new railway, or tour the old castles?"`,
				left: ch('Tour the castles', { fortune: 6 }, { days: 1, text: 'Ghosts of a world about to vanish.' }),
				right: ch('Ride the railway', { silver: -4, renown: 4 }, { setFlag: { tip: 1 }, text: 'Iron horses! The future is loud.' })
			};
		}
	},
	{
		id: 'voc',
		where: 'city',
		weight: 3,
		when: (c) => between(c, 1602, 1799) && c.city.culture === 'malay',
		make: (c) => {
			const n = npc(c, 'official', { culture: 'european', title: 'VOC factor' });
			return {
				id: 'voc',
				npc: n,
				badge: 'History',
				text: `${n.name} of the Dutch Company: "All spice trade here belongs to the VOC. Sign on as our agent — or be treated as a smuggler."`,
				left: ch('Refuse the Company', { renown: 8, silver: -6 }, { tags: ['foreign'], heat: 10, text: 'The locals cheer quietly. The Company remembers.' }),
				right: ch('Sign the contract', { silver: 18, renown: -10, fortune: -4 }, { tags: ['trade'], text: 'Silver in hand. Something sour in your stomach.' })
			};
		}
	},
	{
		id: 'ayutthaya-falls',
		where: 'any',
		once: true,
		weight: 7,
		when: (c) => between(c, 1765, 1767) && inCulture(c, 'siamese'),
		make: (c) => ({
			id: 'ayutthaya-falls',
			npc: npc(c, 'monk', { culture: 'siamese' }),
			badge: 'History',
			text: `Burmese armies besiege Ayutthaya. A monk begs you to carry temple scriptures to safety before the city burns.`,
			left: ch('Save yourself', { fortune: -8 }, { tags: ['cruel'] }),
			right: ch('Carry the scriptures', { vigor: -10, fortune: 16, renown: 10 }, { tags: ['faith'], days: 2, text: 'Behind you the golden city burns. The words survive.' })
		})
	},
	{
		id: 'nader-delhi',
		where: 'any',
		once: true,
		weight: 7,
		when: (c) => c.year === 1739 && inCulture(c, 'indian', 'persian'),
		make: (c) => ({
			id: 'nader-delhi',
			npc: npc(c, 'soldier', { culture: 'persian', title: 'Afsharid trooper' }),
			badge: 'History',
			text: `Nader Shah has sacked Delhi and is carting away the Peacock Throne. His troopers are "inspecting" every caravan.`,
			left: ch('Hide your valuables', {}, { gamble: { p: 0.5, win: { fx: { fortune: 4 }, text: 'They miss the false bottom.' }, lose: { fx: { silver: -18 }, text: 'They find the false bottom.' } } }),
			right: ch('Offer a share', { silver: -10 }, { text: 'Cheaper than the alternative.' })
		})
	},
	{
		id: 'plassey',
		where: 'any',
		once: true,
		weight: 6,
		when: (c) => c.year === 1757 && inCulture(c, 'indian'),
		make: (c) => ({
			id: 'plassey',
			npc: npc(c, 'official', { culture: 'european', title: 'Company agent' }),
			badge: 'History',
			text: `Rumor in Bengal: a Company man named Clive has bribed the Nawab's generals. A Company agent offers you a stake in the "new arrangement."`,
			left: ch('Warn the Nawab', { renown: 10, fortune: 4 }, { heat: 15, text: 'Nobody listens. But you tried.' }),
			right: ch('Take the stake', { silver: 20, renown: -12 }, { tags: ['trade'], text: 'A company becomes an empire. You helped.' })
		})
	},
	{
		id: 'opium-war',
		where: 'any',
		weight: 5,
		once: true,
		when: (c) => between(c, 1839, 1860) && inCulture(c, 'han'),
		make: (c) => {
			const n = npc(c, 'official', { culture: 'han', name: c.year < 1842 ? 'Commissioner Lin Zexu' : undefined });
			return {
				id: 'opium-war',
				npc: n,
				badge: 'History',
				text: `British warships shell the coast. ${n.name} is gathering volunteers to destroy smuggled opium and defend the forts.`,
				left: ch('Flee the fighting', { fortune: -4 }, { text: 'You hear the cannon for days behind you.' }),
				right: ch('Join the defense', { vigor: -12, renown: 16 }, { tags: ['fight'], days: 2, text: 'Twenty thousand chests burn on the beach.' })
			};
		}
	},
	{
		id: 'taiping',
		where: 'any',
		weight: 4,
		when: (c) => between(c, 1851, 1864) && inCulture(c, 'han'),
		make: (c) => ({
			id: 'taiping',
			npc: npc(c, 'soldier', { culture: 'han', title: 'Taiping rebel' }),
			badge: 'History',
			text: `A rebel in red with long hair: "The Heavenly Kingdom welcomes all. Join, or be counted among the demons."`,
			left: ch('Slip away by night', { vigor: -8 }, { days: 1, text: 'You crawl through rice paddies till dawn.' }),
			right: ch('Feign conversion', { fortune: -8, renown: -4 }, { tags: ['talk'], text: 'You recite their hymns. They let you pass.' })
		})
	},
	{
		id: 'mutiny-1857',
		where: 'any',
		weight: 5,
		once: true,
		when: (c) => between(c, 1857, 1858) && inCulture(c, 'indian'),
		make: (c) => ({
			id: 'mutiny-1857',
			npc: npc(c, 'soldier', { culture: 'indian' }),
			badge: 'History',
			text: `The sepoys have risen against the Company! A soldier demands to know whose side you are on.`,
			left: ch('Stay neutral', { renown: -4 }, { days: 2, text: 'You hide until the roads clear.' }),
			right: ch('Shelter refugees', { silver: -8, fortune: 14 }, { tags: ['faith', 'mercy'], text: 'Whatever side, the innocent suffer. You help.' })
		})
	},
	{
		id: 'taj',
		where: 'city',
		weight: 4,
		once: true,
		when: (c) => between(c, 1632, 1653) && c.city.id === 'agra',
		make: (c) => ({
			id: 'taj',
			npc: npc(c, 'performer', { culture: 'indian', title: 'Master mason' }),
			badge: 'History',
			text: `Twenty thousand workers raise a white marble tomb for Mumtaz Mahal. The master mason needs a steady hand for a day of inlay work.`,
			left: ch('Just admire it', { fortune: 4 }),
			right: ch('Work a day on the Taj', { silver: 8, renown: 8, vigor: -6 }, { tags: ['art'], days: 1, text: 'A sliver of lapis, set by you, for centuries.' })
		})
	},
	{
		id: 'hajj',
		where: 'city',
		weight: 5,
		when: (c) => c.city.id === 'jeddah',
		make: (c) => ({
			id: 'hajj',
			npc: npc(c, 'monk', { culture: 'persian', title: 'Pilgrim guide' }),
			text: `Pilgrims from every sea — Malays, Turks, Swahili, Bengalis — crowd the quays of Jeddah. A guide offers to take you on to Mecca.`,
			left: ch('Watch the multitudes', { fortune: 4 }),
			right: ch('Join the pilgrimage', { silver: -6, fortune: 22, vigor: -8 }, { tags: ['faith'], days: 5, text: 'You return changed, and very sunburned.' })
		})
	},
	{
		id: 'suez',
		where: 'city',
		weight: 4,
		once: true,
		when: (c) => c.year >= 1869 && ['cairo', 'aden'].includes(c.city.id),
		make: (c) => ({
			id: 'suez',
			npc: npc(c, 'official', { culture: 'european', title: 'Canal company clerk' }),
			badge: 'History',
			text: `The Suez Canal is open — the Red Sea joined to the Mediterranean. A clerk sells passage at "special opening rates."`,
			left: ch('Scoff at the price', {}),
			right: ch('Buy a canal pass', { silver: -6 }, { setFlag: { tip: 1 }, text: 'Your next voyage skips half of Africa.' })
		})
	},
	{
		id: 'gold-rush',
		where: 'city',
		weight: 5,
		when: (c) => between(c, 1851, 1870) && c.city.id === 'sydney',
		make: (c) => ({
			id: 'gold-rush',
			npc: npc(c, 'merchant', { culture: 'european', title: 'Digger' }),
			badge: 'History',
			text: `Gold in the hills! Half of Sydney has gone digging. A sunburned digger offers you his claim and pan.`,
			left: ch('Not worth it', {}),
			right: ch('Try your luck', { vigor: -10 }, { days: 4, gamble: { p: 0.35, win: { fx: { silver: 35 }, text: 'A nugget the size of a quail egg!' }, lose: { fx: { silver: -4 }, text: 'Mud. So much mud.' } } })
		})
	},
	{
		id: 'krakatoa',
		where: 'any',
		weight: 8,
		once: true,
		when: (c) => c.year === 1883 && inCulture(c, 'malay'),
		make: (c) => ({
			id: 'krakatoa',
			npc: npc(c, 'elder', { culture: 'malay' }),
			badge: 'History',
			text: `The sky turns black at noon. Krakatoa has exploded. An elder begs you to flee inland before the great wave.`,
			left: ch('Run for the hills', { vigor: -10 }, { days: 2, text: 'Behind you, the sea climbs the shore.' }),
			right: ch('Help evacuate the village', { vigor: -18, renown: 14, fortune: 10 }, { tags: ['mercy'], text: 'You carry children until your arms fail.' })
		})
	},
	{
		id: 'meireki-fire',
		where: 'city',
		once: true,
		weight: 8,
		when: (c) => c.year === 1657 && c.city.id === 'edo',
		make: (c) => ({
			id: 'meireki-fire',
			npc: npc(c, 'child', { culture: 'japanese' }),
			badge: 'History',
			text: `A cursed kimono is burned at a temple — and the wind carries the flames. Edo is on fire. A child is crying in a burning alley.`,
			left: ch('Run for the river', { vigor: -6 }),
			right: ch('Save the child', { vigor: -16, fortune: 18, renown: 8 }, { tags: ['mercy'], text: 'Smoke, heat, then the river. The child clings to you.' })
		})
	},
	{
		id: 'jesuit',
		where: 'city',
		weight: 2,
		when: (c) => between(c, 1582, 1720) && ['beijing', 'nanjing', 'macau', 'nagasaki', 'goa', 'agra'].includes(c.city.id),
		make: (c) => ({
			id: 'jesuit',
			npc: npc(c, 'monk', { culture: 'european', title: 'Jesuit astronomer' }),
			text: `A Jesuit shows you a clock that chimes by itself and a map with the whole world on it. "Help me translate a book?"`,
			left: ch('No time', {}),
			right: ch('Translate together', { renown: 9, fortune: 3 }, { tags: ['art', 'foreign'], days: 2, text: 'You learn of lands beyond imagining.' })
		})
	},
	{
		id: 'kyakhta-tea',
		where: 'city',
		weight: 3,
		when: (c) => c.city.id === 'kyakhta' || c.city.id === 'irkutsk',
		make: (c) => ({
			id: 'kyakhta-tea',
			npc: npc(c, 'merchant', { culture: 'european', title: 'Russian fur trader' }),
			text: `Tea caravans from China meet Russian sledges heaped with sable. A trader in a bearskin offers furs for tea, or a seat on a sledge to ${place(c)}'s next post.`,
			left: ch('Warm yourself and move on', { vigor: 4 }),
			right: ch('Trade for a sable coat', { silver: -6, vigor: 8 }, { tags: ['trade'], itemAdd: ['finery'], text: 'Warm, and very fashionable in Moscow.' })
		})
	}
];
