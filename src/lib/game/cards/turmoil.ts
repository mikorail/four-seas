// Turmoil on the ground: roadblocks that force detours, and the work chaos creates — messages, bounties, treasure.
import { CULTURES, makeName } from '#lib/data/cultures';
import { CITY, cityName, shortestDays } from '#lib/data/world';
import { turmoilAt } from '../turmoil';
import type { Quest } from '../types';
import { carrying, ch, dressed, has, npc, place, up, type Ctx, type Template } from './helpers';

const here = (c: Ctx) => turmoilAt(c.run, c.city.id);
const ahead = (c: Ctx) => turmoilAt(c.run, c.city.id) ?? (c.from ? turmoilAt(c.run, c.from.id) : null);

/** A destination 2–6 weeks away for a turmoil job. */
function farCity(c: Ctx): [string, number] | null {
	const dist = shortestDays(c.city.id, c.year);
	const cands = Object.entries(dist).filter(([id, d]) => d >= 12 && d <= 45 && CITY[id] && !CITY[id].secret && id !== c.city.id);
	return cands.length ? c.rng.pick(cands) : null;
}

const CRIMES = ['poisoned the magistrate’s well', 'sold the garrison’s gunpowder to the rebels', 'murdered a tax collector with his own abacus', 'fled with the regiment’s pay chest', 'forged the late ruler’s seal', 'burned the granary and blamed the monks'];
const MESSAGES = ['a warning that the army is coming by the river road', 'the names of informers in the rebel cells', 'a royal heir’s plea for help, sealed in wax', 'terms for a secret truce', 'a mother’s letter to a son on the other side'];
const HOARDS = ['the palace treasury, smuggled out in coffins', 'a magistrate’s silver, hidden before he fled', 'the temple’s gold, buried by monks as the soldiers came', 'a rebel general’s war chest'];

export const TURMOIL_T: Template[] = [
	{
		id: 'turmoil-roadblock',
		where: 'travel',
		modes: ['land', 'river'],
		tags: ['official', 'crime'],
		weight: (c) => (ahead(c) ? 5 : 0),
		make: (c) => {
			const t = ahead(c)!;
			const rebels = t.kind === 'uprising' && c.rng.chance(0.5);
			const n = npc(c, 'soldier', { title: rebels ? 'Rebel picket' : t.kind === 'riot' ? 'Militia captain' : 'Checkpoint officer' });
			return {
				id: 'turmoil-roadblock',
				npc: n,
				badge: `${t.glyph} ${t.label}`,
				text: `The road is blocked with overturned carts. **${n.name}** and a dozen ${rebels ? 'rebels with rusty spears' : 'nervous soldiers'} are stopping everyone. "Nobody goes through. ${rebels ? 'Unless they are with us.' : 'Orders.'}" Behind them the road you need; around them, a long way through the hills.`,
				left: ch('Go the long way round', { vigor: -4 }, { days: 4, tags: ['land'], text: 'Four days of goat tracks and suspicious villages. But nobody asked for your papers.' }),
				right: ch('Pay the “road tax”', { silver: -10 }, { tags: ['bribe', 'official'], text: 'The carts are pulled aside just wide enough for you. Nobody writes anything down.' }),
				up:
					Object.keys(c.run.flags).some((k) => k.startsWith('rev:') && c.run.flags[k] === (rebels ? 'rebel' : 'crown'))
						? up('Sworn to their side', rebels ? 'Give the rebels’ password' : 'Show the crown’s pass', { renown: 4 }, { tags: ['loyal'], text: 'Saluted through like a comrade. Someone even offers you tea.' })
						: carrying(c, 'papers')
							? up('Forged papers', 'Present your papers', {}, { tags: ['crime'], text: 'Official enough. Waved through.' })
							: dressed(c, 'monk-robes', 'pilgrim-garb', 'beggar-rags')
								? up('Humble garb', 'Walk through as nobody in particular', {}, { text: 'Nobody stops a pilgrim with nothing worth stealing.' })
								: undefined
			};
		}
	},
	{
		id: 'turmoil-quest',
		where: 'city',
		tags: ['trade', 'crime', 'talk'],
		weight: (c) => (here(c) && c.run.quests.length < 4 ? 4 : 0),
		make: (c) => {
			const t = here(c)!;
			const dest = farCity(c);
			const kind = c.rng.pick(['message', 'bounty', 'treasure'] as const);
			if (!dest) return { id: 'turmoil-quest', npc: npc(c, 'elder'), text: `${place(c)} is in chaos, but nobody has work for a stranger today.`, left: ch('Move on', {}), right: ch('Wait and watch', { fortune: 2 }, { days: 1 }) };
			const [to, d] = dest;
			const toName = cityName(CITY[to], c.year);
			const due = c.run.day + Math.round(d * 1.6 + 12);
			const quest = (q: Omit<Quest, 'id' | 'from' | 'to' | 'due'>): Quest => ({ id: `turmoil-${kind}-${c.run.day}-${to}`, from: c.city.id, to, due, ...q });
			if (kind === 'message') {
				const side = t.kind === 'uprising' ? c.rng.pick(['the rebels', 'the governor']) : t.kind === 'succession' ? c.rng.pick(['the young claimant', 'the old regent']) : 'the city council';
				const n = npc(c, side === 'the rebels' ? 'scholar' : 'official', { title: `Messenger for ${side}` });
				const what = c.rng.pick(MESSAGES);
				return {
					id: 'turmoil-quest',
					npc: n,
					badge: `${t.glyph} ${t.label}`,
					text: `With ${t.label.toLowerCase()} tearing ${place(c)} apart, **${n.name}** needs a stranger nobody will suspect. "Carry ${what} to **${toName}**. Within ${due - c.run.day} days, or it is worthless."`,
					left: ch('Carry the message', {}, { tags: ['loyal'], heat: side === 'the rebels' ? 8 : 0, quest: quest({ kind: 'message', title: `Carry ${side}’s message to ${toName}`, giver: n.name, reward: { silver: 14, renown: 8 }, text: 'The seal is unbroken; the reader goes pale, then thanks you twice.' }), text: 'Sewn into your collar. You will feel it there every day.' }),
					right: ch('Sell it to the other side instead', { silver: 16 }, { tags: ['crime'], karma: -6, remember: { kind: 'grudge', deed: 'sold their message to the enemy' }, text: 'The other side pays well and promises to forget your face. They won’t.' })
				};
			}
			if (kind === 'bounty') {
				const n = npc(c, 'official', { title: 'Bounty clerk' });
				const g = c.rng.chance(0.3) ? 'f' : 'm';
				const fugitive = makeName(c.rng, CULTURES[c.city.culture], g);
				const crime = c.rng.pick(CRIMES);
				const reward = c.rng.int(16, 26);
				return {
					id: 'turmoil-quest',
					npc: n,
					badge: '📜 Wanted',
					text: `In the chaos, prisoners escaped. **${n.name}** nails up a fresh poster: **${fugitive}**, who ${crime}. Last seen on the road to **${toName}**. Reward: ${reward} silver — alive preferred, but not required.`,
					left: ch('Take the bounty', {}, { tags: ['fight', 'official'], quest: quest({ kind: 'bounty', title: `Hunt ${fugitive} to ${toName}`, giver: n.name, reward: { silver: reward, renown: 6 }, text: `You find ${fugitive} in a ${c.rng.pick(['noodle shop', 'temple loft', 'boat shed', 'gambling den'])}, ${c.rng.pick(['asleep', 'drunk', 'praying', 'expecting you'])}. The local magistrate pays out, grudgingly.` }), text: 'You fold the poster into your sleeve.' }),
					right: ch('Leave the poster where it is', {}, { text: `Somewhere, ${fugitive} is running. Not your business. Not yet.` }),
					up: has(c, 'outlaw') || has(c, 'wanted') ? up('Outlaw', 'Find the fugitive first — and warn them', { renown: 4 }, { tags: ['mercy', 'crime'], remember: { kind: 'favor', deed: 'warned them before the bounty hunters came' }, text: `${fugitive} owes you a life now. That kind of debt gets repaid.` }) : undefined
				};
			}
			const hoard = c.rng.pick(HOARDS);
			const n = npc(c, c.rng.pick(['child', 'elder', 'monk']), { title: 'Frightened witness' });
			return {
				id: 'turmoil-quest',
				npc: n,
				badge: '🗺 Treasure',
				text: `**${n.name}** pulls you into a doorway. In the chaos ${place(c)} has lost track of ${hoard}. "I saw where they took it. A place near **${toName}**. Take me with you — or take the secret and go."`,
				left: ch('Go after the treasure', {}, { tags: ['gamble', 'crime'], quest: quest({ kind: 'treasure', title: `Find ${hoard.split(',')[0]} near ${toName}`, giver: n.name, reward: { silver: 28, fortune: 6 }, text: 'Under a loose floor, behind a false wall: exactly where you were told. For once.' }), text: 'You memorise the directions twice, then burn the paper.' }),
				right: ch('Report it to whoever is in charge this week', { renown: 6 }, { tags: ['official', 'loyal'], standing: 4, text: 'Officials thank you warmly and then argue over which of them is in charge.' }),
				up: has(c, 'cartographer') || carrying(c, 'telescope') ? up(has(c, 'cartographer') ? 'Cartographer' : 'Telescope', 'Work out the hiding place precisely', { silver: 6 }, { quest: quest({ kind: 'treasure', title: `Dig up ${hoard.split(',')[0]} near ${toName}`, giver: n.name, reward: { silver: 36, fortune: 8, renown: 6 }, text: 'You walk straight to the spot. Even the witness is impressed.' }), text: 'Three landmarks, one bearing, and a very good guess.' }) : undefined
			};
		}
	},
	{
		id: 'turmoil-refugee-guide',
		where: 'city',
		tags: ['mercy', 'land'],
		weight: (c) => (here(c)?.kind === 'uprising' || here(c)?.kind === 'riot' ? 2 : 0),
		make: (c) => {
			const t = here(c)!;
			const n = npc(c, 'elder', { title: 'Head of a fleeing family' });
			const dest = farCity(c);
			const to = dest ? dest[0] : c.city.id;
			return {
				id: 'turmoil-refugee-guide',
				npc: n,
				badge: `${t.glyph} ${t.label}`,
				text: `**${n.name}** has eleven people, two carts and a goat, and wants to get them all to **${cityName(CITY[to], c.year)}** before ${t.label.toLowerCase()} reaches their street. "You know the roads. We can pay a little."`,
				left: ch('Guide them out', {}, { tags: ['mercy', 'land'], quest: { id: `escort-${c.run.day}`, kind: 'contract', title: `Lead ${n.name}’s family to ${cityName(CITY[to], c.year)}`, giver: n.name, from: c.city.id, to, due: c.run.day + 60, reward: { silver: 8, renown: 10, fortune: 6 }, text: 'Eleven people and a goat arrive alive. The goat is the only one who does not cry.' }, karma: 6, text: 'You set off before dawn, the goat complaining loudly.' }),
				right: ch('Point them to the safest road', { fortune: 2 }, { tags: ['talk'], text: 'They thank you, and go. You hope it was the safest road.' })
			};
		}
	}
];

