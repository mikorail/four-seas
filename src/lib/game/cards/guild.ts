import { CITY, cityExists, cityName, shortestDays } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import { guildRank, guildTitle, warehouseAt, warehouseCities } from '../guild';
import type { Quest } from '../types';
import { carrying, ch, dressed, has, npc, odds, place, skill, up, withCrew, type Ctx, type Template } from './helpers';

function contractTarget(c: Ctx): { id: string; days: number } {
	const dist = shortestDays(c.city.id, c.year);
	const pool = Object.entries(dist).filter(
		([id, d]) => id !== c.city.id && d >= 8 && d <= 48 && CITY[id] && cityExists(CITY[id], c.year)
	);
	if (pool.length > 0) {
		const [id, days] = c.rng.pick(pool);
		return { id, days };
	}
	const fallbackId = c.run.destination !== c.city.id && CITY[c.run.destination] ? c.run.destination : 'malacca';
	return { id: fallbackId, days: 24 };
}

export const GUILD_T: Template[] = [
	{
		id: 'guild-rank-up',
		where: 'city',
		tags: ['trade', 'official'],
		when: (c) => guildRank(c.run) >= 1 && Number(c.run.flags['guild:ceremony'] ?? 0) < guildRank(c.run),
		weight: (c) => (guildRank(c.run) >= 1 && Number(c.run.flags['guild:ceremony'] ?? 0) < guildRank(c.run) ? 3.5 : 0),
		make: (c) => {
			const rank = guildRank(c.run);
			const title = guildTitle(c.run);
			const syndic = npc(c, 'merchant', { title: 'Guild Syndic' });
			return {
				id: 'guild-rank-up',
				npc: syndic,
				badge: 'Merchant Guild',
				text: `Lanterns hang from the beams of the ${place(c)} guildhall. ${syndic.name} strikes a bronze scale with a mallet and reads your ledger volume aloud: "Step forward and receive your seal as ${title}."`,
				left: ch(
					'Accept the seal quietly',
					{ renown: 4 + rank, fortune: 4 },
					{
						tags: ['trade'],
						faction: { guild: 6 },
						setFlag: { 'guild:ceremony': rank },
						text: `Your name is inscribed in the guild register as ${title}.`
					}
				),
				right: ch(
					'Host a banquet for the factors',
					{ silver: -8, renown: 8 + rank * 2, fortune: 3 },
					{
						tags: ['trade', 'talk'],
						faction: { guild: 12 },
						setFlag: { 'guild:ceremony': rank },
						text: 'Cups of aged wine pass from table to table. Every factor in port knows your house mark.'
					}
				),
				up:
					dressed(c, 'merchant-silks') || has(c, 'haggler') || skill(c, 'aura') >= 2
						? up(
								dressed(c, 'merchant-silks') ? 'Merchant’s silks' : has(c, 'haggler') ? 'Haggler' : 'Presence',
								'Claim a senior seat at the scales',
								{ silver: 6 + rank * 2, renown: 8 },
								{
									tags: ['trade', 'talk'],
									faction: { guild: 14 },
									setFlag: { 'guild:ceremony': rank },
									text: 'The elders salute your standing and award you a chamber dividend on the spot.'
								}
						  )
						: undefined
			};
		}
	},
	{
		id: 'guild-contract',
		where: 'city',
		tags: ['trade'],
		when: (c) => guildRank(c.run) >= 1 && c.run.quests.length < 4,
		weight: (c) => (guildRank(c.run) >= 1 && c.run.quests.length < 4 ? 2.4 : 0),
		make: (c) => {
			const rank = guildRank(c.run);
			const factor = npc(c, 'merchant', { title: 'Chartered Factor' });
			const target = contractTarget(c);
			const destName = cityName(CITY[target.id], c.year);
			const cargo = c.rng.pick([
				'a sealed manifest of guild bullion',
				'a consignment of graded camphor and cinnabar',
				'a bundle of stamped letters of exchange',
				'a sample chest of imperial tea bricks'
			]);
			const pay = Math.min(48, Math.round(14 + target.days * 0.65 + rank * 4));
			const due = c.run.day + Math.round(target.days * 1.65 + 10);
			const q: Quest = {
				id: `guild-contract-${factor.seed}`,
				kind: 'contract',
				title: `Deliver ${cargo} to ${destName}`,
				giver: factor.name,
				from: c.city.id,
				to: target.id,
				due,
				reward: { silver: pay, renown: 5 + rank },
				text: `The guild house in ${destName} verifies the seal and counts out your silver.`
			};
			return {
				id: 'guild-contract',
				npc: factor,
				badge: 'Guild Charter',
				text: `${factor.name} unrolls a stamped guild charter on the counter. "Only a ${guildTitle(c.run)} may carry this manifest: ${cargo} bound for ${destName} by day ${due}, paying ${pay} silver."`,
				left: ch('Pass on the charter', { fortune: 2 }),
				right: ch(
					`Sign the charter (${pay} silver)`,
					{ renown: 2 },
					{
						tags: ['trade'],
						faction: { guild: 4 },
						quest: q,
						text: `◆ Guild charter: ${destName} by day ${due}.`
					}
				),
				up:
					rank >= 3 || has(c, 'haggler') || skill(c, 'knowledge') >= 2
						? up(
								rank >= 3 ? guildTitle(c.run) : has(c, 'haggler') ? 'Haggler' : 'Knowledge',
								'Demand the syndic premium rate',
								{ silver: 6, renown: 3 },
								{
									tags: ['trade', 'talk'],
									faction: { guild: 6 },
									quest: { ...q, reward: { silver: pay + 10, renown: 6 + rank } },
									text: `An advance on the spot and +10 silver upon arrival in ${destName}.`
								}
						  )
						: undefined
			};
		}
	},
	{
		id: 'guild-rival',
		where: 'city',
		tags: ['trade', 'talk'],
		when: (c) => guildRank(c.run) >= 1 || warehouseCities(c.run).length > 0,
		weight: (c) => (guildRank(c.run) >= 1 || warehouseCities(c.run).length > 0 ? 1.8 : 0),
		make: (c) => {
			const rival = npc(c, 'merchant', { title: 'Rival Broker' });
			const cities = warehouseCities(c.run);
			const targetCity = cities.length > 0 ? c.rng.pick(cities) : c.city.id;
			const targetName = cityName(CITY[targetCity], c.year);
			const stored = warehouseAt(c.run, targetCity);
			const sampleItem = stored[0] ? (ITEMS[stored[0]]?.name.toLowerCase() ?? 'cargo') : 'trade stock';
			return {
				id: 'guild-rival',
				npc: rival,
				badge: 'Merchant Guild',
				text: `${rival.name} corners you under the colonnade with two clerks at their elbow. "Your ${sampleItem} in ${targetName} is sitting in my way. Sell me your warehouse lease now, or watch me flood the bazaar and undercut every chest you hold."`,
				left: ch(
					'Accept their buyout offer',
					{ silver: 14, renown: -4 },
					{
						tags: ['trade'],
						faction: { guild: -3 },
						text: 'You pocket a tidy sum of silver and let the broker boast in the tea houses.'
					}
				),
				right: ch(
					'Outmaneuver them on the exchange',
					{},
					{
						tags: ['trade', 'talk'],
						gamble: {
							p: odds(c, 0.52 + guildRank(c.run) * 0.05, ['trade', 'talk']),
							win: {
								fx: { silver: 16, renown: 8 },
								faction: { guild: 6 },
								bump: { 'guild:vol': 25 },
								text: 'You call in credit notes across three stalls and leave the rival scrambling to cover their own contracts.'
							},
							lose: {
								fx: { silver: -10, renown: -5 },
								text: 'Their clerks dump cheap stock all morning, forcing you to discount your contracts.'
							}
						}
					}
				),
				up:
					guildRank(c.run) >= 2 || carrying(c, 'bribe-ledger') || skill(c, 'composure') >= 2
						? up(
								guildRank(c.run) >= 2 ? guildTitle(c.run) : carrying(c, 'bribe-ledger') ? 'Ledger of bribes' : 'Composure',
								'Cite the guild charter before the arbiters',
								{ silver: 12, renown: 10 },
								{
									tags: ['trade', 'official'],
									faction: { guild: 8 },
									bump: { 'guild:vol': 30 },
									text: 'The hall arbiters fine the rival for unlawful price-fixing and award half the penalty to your account.'
								}
						  )
						: undefined
			};
		}
	},
	{
		id: 'guild-warehouse-fire',
		where: 'city',
		once: true,
		tags: ['trade'],
		when: (c) => warehouseCities(c.run).length > 0 && !c.run.flags['guild:fire'],
		weight: (c) => (warehouseCities(c.run).length > 0 && !c.run.flags['guild:fire'] ? 1.9 : 0),
		make: (c) => {
			const cities = warehouseCities(c.run);
			const fireCity = cities.includes(c.city.id) ? c.city.id : cities[0];
			const fireCityName = cityName(CITY[fireCity], c.year);
			const watchman = npc(c, 'soldier', { title: 'Wharf Watchman' });
			const hasGuard = withCrew(c, 'bodyguard');
			const hasAth = skill(c, 'athletics') >= 1;
			const hasMartial = skill(c, 'martial') >= 1;
			const whyLabel = hasGuard ? 'Bodyguard' : hasAth ? 'Athletics' : hasMartial ? 'Martial' : 'Guild Brigade';
			return {
				id: 'guild-warehouse-fire',
				npc: watchman,
				badge: 'Warehouse',
				text: `A brass alarm gong clangs down the street! ${watchman.name} runs up breathless, soot streaking his sleeves: "An oil lamp overturned in the storehouses of ${fireCityName}. Sparks are blowing straight toward your leased bays!"`,
				left: ch(
					'Pay the bucket brigade',
					{ silver: -12, renown: 4, fortune: 3 },
					{
						tags: ['trade'],
						setFlag: { 'guild:fire': true },
						faction: { guild: 5 },
						text: 'Two dozen dockhands drench the timbers with river water before a single crate is scorched.'
					}
				),
				right: ch(
					'Rush into the smoke yourself',
					{},
					{
						tags: ['fight'],
						setFlag: { 'guild:fire': true },
						gamble: {
							p: odds(c, 0.55, ['fight']),
							win: {
								fx: { vigor: -6, renown: 10, fortune: 4 },
								faction: { guild: 8 },
								text: 'Coughing through black smoke, you haul the heavy crates into the courtyard and beat out the embers.'
							},
							lose: {
								fx: { vigor: -14, silver: -8 },
								text: 'A burning beam crashes across the doorway. You escape with singed sleeves and pay carpenters to salvage the rest.'
							}
						}
					}
				),
				up: up(
					whyLabel,
					'Organize a firebreak with your crew',
					{ vigor: -3, renown: 8, fortune: 5 },
					{
						tags: ['trade', 'loyal'],
						setFlag: { 'guild:fire': true },
						faction: { guild: 10 },
						text: 'Wet canvas tarpaulins and quick hands halt the flames at the alley wall, saving your goods and the neighbouring vault.'
					}
				)
			};
		}
	}
];
