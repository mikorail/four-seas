// The shadow trade: stealing intel and contraband from other kingdoms, customs searches, fences, spymasters and smuggling runs.
import { CITY, cityName, shortestDays } from '#lib/data/world';
import { CULTURES } from '#lib/data/cultures';
import { ITEMS } from '#lib/data/items';
import { uprisingAt } from './rebellion';
import { bagFree, carrying, ch, contrabandIn, dressed, has, intelIn, npc, odds, place, skill, up, type Ctx, type Template } from './helpers';

const TARGETS = [
	{ place: 'the governor’s dispatch box', loot: ['war-plans', 'court-letters'], who: 'official' as const, guard: 'a dozing clerk' },
	{ place: 'the customs warehouse', loot: ['opium', 'gunpowder', 'tiger-pelt', 'counterfeit-silver'], who: 'soldier' as const, guard: 'two bored guards playing dice' },
	{ place: 'a minister’s locked study', loot: ['bribe-ledger', 'stolen-seal', 'court-letters'], who: 'noble' as const, guard: 'a very old dog' },
	{ place: 'the harbour master’s office', loot: ['harbour-charts', 'war-plans'], who: 'captain' as const, guard: 'a parrot that says "thief"' },
	{ place: 'the censor’s confiscation room', loot: ['forbidden-books', 'rebel-pamphlets'], who: 'official' as const, guard: 'a censor asleep on a pile of poetry' }
];

export const CONTRABAND_T: Template[] = [
	{
		id: 'steal-chance',
		where: 'city',
		tags: ['crime'],
		weight: (c) => (bagFree(c) > 0 && c.city.culture !== c.run.hero.culture ? 1.4 + skill(c, 'thievery') * 0.3 : 0.5),
		make: (c) => {
			const t = c.rng.pick(TARGETS);
			const loot = c.rng.pick(t.loot.filter((id) => ITEMS[id]));
			const it = ITEMS[loot];
			const n = npc(c, 'child', { title: 'Street lookout' });
			const kingdom = CULTURES[c.city.culture].label;
			return {
				id: 'steal-chance',
				npc: n,
				badge: '🗝 Opportunity',
				text: `**${n.name}** tugs your sleeve and whispers: ${t.place} in ${place(c)} is guarded tonight by ${t.guard}. Inside: **${it.name.toLowerCase()}** — property of the ${kingdom} authorities. "Worth a fortune to the right people. I keep watch for a cut."`,
				left: ch('Go in tonight', {}, { tags: ['crime'], gamble: { p: odds(c, 0.45, ['crime']), win: { fx: { renown: 2 }, itemAdd: [loot], text: `In, out, and the ${it.name.toLowerCase()} is under your coat. The lookout gets their cut.`, heat: 12 }, lose: { fx: { vigor: -8 }, heat: 22, text: 'A shout, a lantern, a long run across the rooftops. Empty-handed.' } } }),
				right: ch('Report the weak guard to the authorities', { renown: 4 }, { tags: ['official', 'loyal'], standing: 4, text: 'They thank you, double the guard, and look at you a little suspiciously.' }),
				up:
					skill(c, 'thievery') >= 3 || carrying(c, 'skeleton-key')
						? up(skill(c, 'thievery') >= 3 ? `Thievery ${skill(c, 'thievery')}` : 'Skeleton key', 'Do it properly', { renown: 4 }, { tags: ['crime'], itemAdd: [loot], heat: 6, text: 'Not a scratch on the lock. They will not notice for days.' })
						: undefined
			};
		}
	},
	{
		id: 'customs-search',
		where: 'any',
		tags: ['official', 'crime'],
		weight: (c) => (contrabandIn(c).length || intelIn(c).length ? 4 + (c.run.heat >= 30 ? 3 : 0) : 0),
		make: (c) => {
			const hot = [...contrabandIn(c), ...intelIn(c)];
			const n = npc(c, 'official', { title: c.where === 'travel' ? 'Customs inspector at the barrier' : 'Harbour customs officer' });
			const fine = 6 + hot.length * 4;
			return {
				id: 'customs-search',
				npc: n,
				badge: '🛂 Customs',
				text: `**${n.name}** stops you with a raised hand. "Open your bags. All of them." Somewhere in yours: ${hot.map((id) => ITEMS[id].name.toLowerCase()).join(', ')}.`,
				left: ch(`Slip them ${fine} silver`, { silver: -fine }, { tags: ['bribe', 'official'], text: 'A heavy sleeve, a light search. Waved through.' }),
				right: ch('Open the bags and bluff', {}, { tags: ['crime', 'talk'], gamble: { p: odds(c, 0.4, ['crime', 'talk']), win: { fx: { renown: 2 }, text: 'You open the bags slowly, chatting about the weather. Bored, they wave you on before reaching the bottom.' }, lose: { fx: { renown: -8 }, itemRemove: hot, heat: 20, text: 'They find everything. Confiscated, recorded, and your name copied into a ledger.' } } }),
				up:
					carrying(c, 'forged-pass') || carrying(c, 'papers')
						? up('Forged papers', 'Show a permit for exactly this cargo', {}, { tags: ['crime'], text: 'Seals, signatures, stamps. The inspector salutes.' })
						: skill(c, 'knowledge') >= 4
							? up(`Knowledge ${skill(c, 'knowledge')}`, 'Cite the regulation that exempts you', { renown: 4 }, { tags: ['official'], text: 'Article nineteen, paragraph four, concerning travellers under seal. He has never heard of it. Neither has anyone. He lets you go.' })
							: dressed(c, 'company-uniform', 'mandarin-robe', 'janissary-uniform')
								? up('Uniform of rank', 'Glare until he apologises', {}, { tags: ['official'], text: 'Officials do not search officials.' })
								: undefined
			};
		}
	},
	{
		id: 'fence',
		where: 'city',
		tags: ['crime', 'trade'],
		weight: (c) => (contrabandIn(c).length ? 3 : 0),
		make: (c) => {
			const goods = contrabandIn(c);
			const best = goods.sort((a, b) => (ITEMS[b].value ?? 0) - (ITEMS[a].value ?? 0))[0];
			const total = goods.reduce((s, id) => s + (ITEMS[id].value ?? 10), 0);
			const n = npc(c, 'merchant', { title: 'Fence in a back room' });
			return {
				id: 'fence',
				npc: n,
				badge: '🕯 Fence',
				text: `Behind a dumpling shop in ${place(c)}, **${n.name}** weighs your goods without asking where they came from. "I take the lot for ${Math.round(total * 0.7)}. Or just the ${ITEMS[best].name.toLowerCase()}, for ${ITEMS[best].value}."`,
				left: ch('Sell the lot', { silver: Math.round(total * 0.7) }, { tags: ['crime', 'trade'], itemRemove: goods, heat: -6, text: 'Lighter bags, heavier purse, cleaner conscience. Two out of three.' }),
				right: ch(`Sell only the ${ITEMS[best].name.toLowerCase()}`, { silver: ITEMS[best].value ?? 10 }, { tags: ['trade', 'crime'], itemRemove: [best], text: 'He counts it twice, then once more, then grins.' }),
				up: skill(c, 'aura') >= 3 || has(c, 'merchant') ? up(skill(c, 'aura') >= 3 ? `Presence ${skill(c, 'aura')}` : 'Merchant', 'Haggle him up', { silver: Math.round(total * 0.95) }, { tags: ['trade'], itemRemove: goods, text: 'He groans, curses your mother, and pays nearly full price.' }) : undefined
			};
		}
	},
	{
		id: 'spymaster',
		where: 'city',
		tags: ['talk', 'crime'],
		weight: (c) => (intelIn(c).length ? 3.5 : 0),
		make: (c) => {
			const intel = intelIn(c)[0];
			const it = ITEMS[intel];
			const n = npc(c, 'official', { title: 'Spymaster' });
			const rival = npc(c, 'noble', { title: 'Agent of a rival court', foreign: true });
			const rev = uprisingAt(c.city.id, c.year);
			return {
				id: 'spymaster',
				npc: n,
				badge: '🕵 Intelligence',
				text: `Word travels: you carry **${it.name.toLowerCase()}**. **${n.name}**, spymaster of ${place(c)}, invites you to tea. So, separately, does **${rival.name}**, who works for ${CULTURES[rival.culture].label}.${rev ? ` And the ${rev.rebels} would give anything for it.` : ''}`,
				left: ch(`Sell it to ${n.name}`, { silver: Math.round((it.value ?? 20) * 0.8), renown: 6 }, { tags: ['official', 'loyal'], itemRemove: [intel], standing: 8, text: 'Paid, thanked, and quietly added to a list of useful people.' }),
				right: ch(`Sell it to ${rival.name} instead`, { silver: it.value ?? 20 }, { tags: ['crime'], itemRemove: [intel], standing: -10, karma: -4, heat: 10, text: 'More silver. A foreign court in your debt. A local spymaster who will find out.' }),
				up: rev
					? up('Uprising', `Give it to ${rev.rebels}`, { renown: 10 }, { tags: ['loyal', 'crime'], itemRemove: [intel], bump: { ['revp:' + rev.id]: 1.5 }, heat: 14, text: 'Pages copied by candlelight in a cellar. The next attack will come exactly where nobody expects.' })
					: intel === 'bribe-ledger'
						? up('The ledger', 'Blackmail the officials in it, one by one', { silver: 30 }, { tags: ['crime'], heat: 16, karma: -6, text: 'Polite letters, quiet payments, very pale faces.' })
						: undefined
			};
		}
	},
	{
		id: 'smuggling-run',
		where: 'city',
		tags: ['crime', 'trade'],
		weight: (c) => (bagFree(c) > 1 && c.run.quests.length < 4 ? 1.2 : 0),
		make: (c) => {
			const dist = shortestDays(c.city.id, c.year);
			const cands = Object.entries(dist).filter(([id, d]) => d >= 8 && d <= 30 && CITY[id] && !CITY[id].secret);
			const [to, d] = cands.length ? c.rng.pick(cands) : [c.city.id, 0];
			const cargo = c.rng.pick(['gunpowder', 'forbidden-books', 'opium', 'rebel-pamphlets', 'counterfeit-silver'].filter((id) => ITEMS[id]));
			const n = npc(c, 'bandit', { title: 'Smuggler boss' });
			const toName = cityName(CITY[to], c.year);
			return {
				id: 'smuggling-run',
				npc: n,
				badge: '🛶 Smuggling',
				text: `**${n.name}** needs a traveller nobody suspects. "Carry this ${ITEMS[cargo].name.toLowerCase()} to ${toName}. My people meet you at the dock. Customs will be curious — don’t let them be."`,
				left: ch('Take the job', { silver: 6 }, { tags: ['crime', 'trade'], itemAdd: [cargo], quest: { id: 'smuggle-' + c.run.day, kind: 'contract', title: `Smuggle ${ITEMS[cargo].name.toLowerCase()} to ${toName}`, giver: n.name, from: c.city.id, to, item: cargo, due: c.run.day + Math.round(d * 1.6 + 10), reward: { silver: 26, renown: 4 }, text: 'Handed over at the dock, at night, without a word. Paid in clean silver.' }, heat: 6, text: 'Wrapped as rice. Smells of rice. Is not rice.' }),
				right: ch('Refuse', {}, { text: '"Your loss," says the boss, and finds someone with fewer scruples.' }),
				up: has(c, 'smuggler') || has(c, 'thief') ? up(has(c, 'smuggler') ? 'Smuggler' : 'Thief', 'Take double the cargo for double the pay', { silver: 10 }, { tags: ['crime'], itemAdd: [cargo, cargo], quest: { id: 'smuggle2-' + c.run.day, kind: 'contract', title: `Smuggle a double load to ${toName}`, giver: n.name, from: c.city.id, to, item: cargo, due: c.run.day + Math.round(d * 1.6 + 10), reward: { silver: 48, renown: 6 }, text: 'Twice the risk, twice the purse, and the boss buys you a drink.' }, heat: 10, text: 'You have done this before. It shows.' }) : undefined
			};
		}
	},
	{
		id: 'forbidden-reader',
		where: 'city',
		tags: ['art', 'crime'],
		weight: (c) => (carrying(c, 'forbidden-books') ? 2.5 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { title: 'Hungry-eyed scholar' });
			return {
				id: 'forbidden-reader',
				npc: n,
				badge: '📕 Forbidden',
				text: `**${n.name}** has heard you carry banned books. "The real history. The one they burned. Please — I will pay, or copy them, or both. And the censor is in town."`,
				left: ch('Sell them to the scholar', { silver: 20, renown: 4 }, { tags: ['art', 'crime'], itemRemove: ['forbidden-books'], text: 'They clutch the books like a newborn. Copies will be in ten hands by spring.' }),
				right: ch('Hand them to the censor', { renown: 6, silver: 6 }, { tags: ['official'], itemRemove: ['forbidden-books'], karma: -4, text: 'A bonfire in the square. The scholar watches from a window.' }),
				up: skill(c, 'knowledge') >= 3 ? up(`Knowledge ${skill(c, 'knowledge')}`, 'Read them first, then decide', { renown: 8 }, { tags: ['art'], text: 'You read all night. What you learned changes how you see this whole country.' }) : undefined
			};
		}
	}
];
