import { CITIES, CITY, cityExists, cityName, shortestDays } from '#lib/data/world';
import { goodId } from '#lib/data/items';
import { companion } from './city';
import { bagFree, carrying, ch, has, npc, odds, place, up, withCrew, type Ctx, type Template } from './helpers';
import type { Quest } from '../types';

const label = (c: Ctx, id: string) => cityName(CITY[id], c.year);
const activeKind = (c: Ctx, kind: Quest['kind']) => c.run.quests.some((q) => q.kind === kind);
const freeParcel = (c: Ctx) => ['parcel1', 'parcel2', 'parcel3'].find((p) => !c.run.bag.includes(p));

/** A destination reachable in roughly [min, max] days from here. */
function destination(c: Ctx, min: number, max: number, pred: (id: string) => boolean = () => true) {
	const dist = shortestDays(c.city.id, c.year);
	const pool = Object.entries(dist).filter(([id, d]) => id !== c.city.id && d >= min && d <= max && pred(id) && cityExists(CITY[id], c.year));
	if (!pool.length) return null;
	const [id, d] = c.rng.pick(pool);
	return { id, days: d };
}

export const STORIES: Template[] = [
	// ===== delivery contracts: reasons to go somewhere =====
	{
		id: 'contract',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (c.run.quests.filter((q) => q.kind === 'contract').length < 2 && bagFree(c) > 0 && freeParcel(c) ? 2.6 : 0),
		make: (c) => {
			const n = npc(c, 'merchant');
			const d = destination(c, 8, 45) ?? { id: c.run.destination, days: 30 };
			const parcel = freeParcel(c)!;
			const what = c.rng.pick(['a chest of letters of credit', 'a bolt of imperial silk', 'a sealed medicine chest', 'a jade statue wrapped in straw', 'a dowry of silver hairpins', 'a crate of rare books', 'a caged songbird for a governor', 'a lacquered box that ticks']);
			const pay = Math.min(34, Math.round(10 + d.days * 0.6));
			const due = c.run.day + Math.round(d.days * 1.5 + 8);
			const q: Quest = { id: `contract-${n.seed}`, kind: 'contract', title: `Deliver ${what} to ${label(c, d.id)}`, giver: n.name, from: c.city.id, to: d.id, item: parcel, due, reward: { silver: pay, renown: 4 }, text: `${n.name}'s partner pays in full.` };
			return {
				id: 'contract',
				npc: n,
				badge: 'Contract',
				text: `${n.name} needs ${what} carried to ${label(c, d.id)} by day ${due}. "${pay} silver on delivery. Don't open it."`,
				left: ch('Decline', {}),
				right: ch(`Accept (${pay} silver)`, {}, { tags: ['trade'], itemAdd: [parcel], quest: q, text: `◆ ${label(c, d.id)} by day ${due}.` }),
				up: carrying(c, 'lockbox') || withCrew(c, 'bodyguard') ? up('Secure transport', 'Negotiate a guarded rate', {}, { tags: ['trade'], itemAdd: [parcel], quest: { ...q, reward: { silver: pay + 8, renown: 5 } }, text: 'An extra fee for the iron box. Fair.' }) : undefined
			};
		}
	},
	{
		id: 'contract-temptation',
		where: 'travel',
		tags: ['crime'],
		weight: (c) => (c.run.quests.some((q) => q.kind === 'contract') ? 1.2 : 0),
		make: (c) => {
			const q = c.rng.pick(c.run.quests.filter((x) => x.kind === 'contract'));
			const n = npc(c, 'sailor', { title: 'Curious passenger' });
			return {
				id: 'contract-temptation',
				npc: n,
				text: `${n.name} eyes your sealed consignment. "I'd pay well to know what's inside ${q.title.replace(/^Deliver /, '').replace(/ to .*/, '')}. Or for the thing itself."`,
				left: ch('Keep it sealed', { fortune: 4 }, { tags: ['loyal'] }),
				right: ch('Sell it to them', { silver: 20, renown: -10 }, { tags: ['crime', 'cruel'], itemRemove: [q.item!], text: 'Easy money. Your client will not be pleased.' })
			};
		}
	},
	// ===== the royal bride =====
	{
		id: 'bride-1',
		where: 'city',
		once: true,
		weight: 1.1,
		when: (c) => !activeKind(c, 'bride') && c.run.crew.length < 3 && bagFree(c) > 0,
		make: (c) => {
			const d = destination(c, 15, 50, (id) => CITY[id].culture !== c.city.culture) ?? { id: c.run.destination, days: 40 };
			const bride = npc(c, 'noble', { gender: 'f', title: 'Princess' });
			const ward = { ...companion(c, 'ward', bride), loyalty: 80 };
			const due = c.run.day + Math.round(d.days * 1.6 + 10);
			const q: Quest = { id: 'bride', kind: 'bride', title: `Escort Princess ${bride.name.split(' ').pop()} to ${label(c, d.id)}`, giver: 'the court', from: c.city.id, to: d.id, item: 'betrothal-seal', ward: ward.id, due, reward: { silver: 30, renown: 18, fortune: 6 }, rewardItem: 'finery', text: 'A wedding of two kingdoms. You are seated at the high table.' };
			return {
				id: 'bride-1',
				npc: bride,
				badge: 'Story',
				text: `The court of ${place(c)} needs a discreet escort: ${bride.name} is promised to a prince in ${label(c, d.id)}. "She has never left the palace," the chamberlain whispers. "She has opinions."`,
				left: ch('Decline the honor', { renown: -3 }),
				right: ch('Escort the princess', { renown: 6 }, { crewAdd: ward, itemAdd: ['betrothal-seal'], quest: q, text: `${bride.name} climbs in, already complaining about the cushions.` })
			};
		}
	},
	{
		id: 'bride-2',
		where: 'travel',
		weight: 2.4,
		when: (c) => activeKind(c, 'bride') && c.run.crew.some((m) => m.role === 'ward') && !c.run.flags['bride:tested'],
		make: (c) => {
			const w = c.run.crew.find((m) => m.role === 'ward')!;
			const n = npc(c, 'bandit', { title: 'Hired abductor' });
			return {
				id: 'bride-2',
				npc: n,
				badge: 'Story',
				text: `Riders surround the carriage — hired by a rival suitor. ${n.name} grins: "The princess comes with us. You can keep your life."`,
				left: ch('Pay them to leave', { silver: -18 }, { tags: ['bribe'], setFlag: { 'bride:tested': true }, text: 'Silver changes hands. The princess is unimpressed with your tactics.' }),
				right: ch('Fight for her', {}, { tags: ['fight', 'loyal'], setFlag: { 'bride:tested': true }, gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 14 }, text: `${w.npc.name} watches you fight, wide-eyed. Later she says: "Not bad."` }, lose: { fx: { vigor: -16 }, text: 'They take her. The betrothal seal goes with her saddlebag.', itemRemove: ['betrothal-seal'] } } }),
				up: has(c, 'romantic') ? up('Hopeless Romantic', 'Ask the princess what SHE wants', { fortune: 10 }, { setFlag: { 'bride:tested': true }, text: `"Nobody has ever asked me that." She hops onto an abductor’s horse herself — and steers it back to your carriage.` }) : undefined
			};
		}
	},
	// ===== the stolen relic =====
	{
		id: 'relic-1',
		where: 'city',
		once: true,
		weight: 1.2,
		when: (c) => !c.run.flags['relic:den'],
		make: (c) => {
			const den = destination(c, 6, 25);
			const n = npc(c, 'monk', { title: 'Distraught abbot' });
			const relic = c.rng.pick(['a tooth of the Buddha', 'the crystal reliquary of a saint', 'a thousand-year-old sutra in gold ink', 'the jade seal of the first abbot']);
			return {
				id: 'relic-1',
				npc: n,
				badge: 'Story',
				text: `Thieves broke into the ${c.local.holyPlace} of ${place(c)} and stole ${relic}. ${n.name}: "They fled toward ${den ? label(c, den.id) : 'the coast'}. Please — bring it home."`,
				left: ch('Offer prayers instead', { fortune: 3 }, { tags: ['faith'], setFlag: { 'relic:den': 'none' } }),
				right: ch('Hunt the thieves', { fortune: 4 }, { tags: ['faith', 'mercy'], setFlag: { 'relic:den': den?.id ?? 'none', 'relic:home': c.city.id, 'relic:name': relic }, text: `To ${den ? label(c, den.id) : '?'}.` })
			};
		}
	},
	{
		id: 'relic-2',
		where: 'city',
		weight: 60,
		when: (c) => c.run.flags['relic:den'] === c.city.id,
		make: (c) => {
			const home = String(c.run.flags['relic:home']);
			const relic = String(c.run.flags['relic:name']);
			const n = npc(c, 'bandit', { title: 'Relic fence' });
			const q: Quest = { id: 'relic', kind: 'relic', title: `Return ${relic} to ${label(c, home)}`, giver: 'the abbot', from: c.city.id, to: home, item: 'temple-relic', due: c.run.day + 60, reward: { fortune: 22, renown: 12 }, rewardItem: 'charm', text: 'Bells ring all night. Pilgrims will tell your story for years.' };
			return {
				id: 'relic-2',
				npc: n,
				badge: 'Story',
				text: `In a back-alley godown of ${place(c)} you find ${n.name} haggling over ${relic} with a foreign collector.`,
				left: ch('Buy it back', { silver: -20 }, { tags: ['trade'], itemAdd: ['temple-relic'], quest: q, clearFlag: ['relic:den'], text: 'Expensive piety.' }),
				right: ch('Take it by force', {}, { tags: ['fight'], clearFlag: ['relic:den'], heat: 10, gamble: { p: odds(c, 0.5, ['fight']), win: { fx: { renown: 8 }, itemAdd: ['temple-relic'], quest: q, text: 'The fence flees. The relic is warm in your hands.' }, lose: { fx: { vigor: -14 }, text: 'Beaten, and the relic sold on to who-knows-where.' } } }),
				up: withCrew(c, 'thief') ? up('Cat burglar', 'Steal it back in the night', {}, { tags: ['crime', 'faith'], itemAdd: ['temple-relic'], quest: q, clearFlag: ['relic:den'], text: 'Thief robbed by thief. The gods appreciate irony.' }) : undefined
			};
		}
	},
	// ===== the plague =====
	{
		id: 'plague-1',
		where: 'city',
		once: true,
		weight: 1,
		when: (c) => !activeKind(c, 'cure'),
		make: (c) => {
			const remedy = c.rng.pick(['ginseng', 'camphor', 'cinnamon', 'tea'] as const);
			const n = npc(c, 'healer', { title: 'Plague physician' });
			const q: Quest = { id: 'cure', kind: 'cure', title: `Bring ${remedy} to cure the fever in ${place(c)}`, giver: n.name, from: c.city.id, to: c.city.id, needs: goodId(remedy), due: c.run.day + 70, reward: { renown: 18, fortune: 14, silver: 12 }, rewardItem: 'medicine', text: `${n.name}'s remedy works. The fever breaks across the city.` };
			return {
				id: 'plague-1',
				npc: n,
				badge: 'Story',
				text: `Fever sweeps ${place(c)}. Doors are chalked with crosses. ${n.name} grabs your arm: "${remedy[0].toUpperCase() + remedy.slice(1)} — real ${remedy}, from where it grows. Bring me a load within seventy days and you'll save thousands."`,
				left: ch('Flee the city', { vigor: 4, fortune: -6 }),
				right: ch('Promise to return', { fortune: 4 }, { tags: ['mercy'], quest: q, text: `◆ Buy ${remedy} where it is grown, then return here.` }),
				up: carrying(c, goodId(remedy)) ? up('You carry it', `Give your ${remedy} now`, { renown: 18, fortune: 16 }, { tags: ['mercy'], itemRemove: [goodId(remedy)], text: 'Already in your bag. The physician weeps.' }) : undefined
			};
		}
	},
	// ===== the cartographer =====
	{
		id: 'survey-1',
		where: 'city',
		once: true,
		weight: 1,
		when: (c) => c.city.port && !activeKind(c, 'map') && bagFree(c) > 0,
		make: (c) => {
			const ports = c.rng.sample(
				CITIES.filter((x) => x.port && cityExists(x, c.year) && x.id !== c.city.id && !c.run.visited.includes(x.id)),
				3
			).map((x) => x.id);
			const n = npc(c, 'scholar', { title: 'Royal cartographer' });
			const q: Quest = { id: 'survey', kind: 'map', title: `Survey ${ports.map((p) => label(c, p)).join(', ')}`, giver: n.name, from: c.city.id, to: c.city.id, item: 'survey-book', visit: ports, due: c.run.day + 120, reward: { renown: 20, silver: 20 }, rewardItem: 'spyglass', text: 'Your sketches go into a great atlas. Your name is on a cape somewhere.' };
			return {
				id: 'survey-1',
				npc: n,
				badge: 'Story',
				text: `${n.name} unrolls a map full of blank coasts. "Sketch the harbors of ${ports.map((p) => label(c, p)).join(', ')} for me. Any order. I pay in silver, glory, and a good spyglass."`,
				left: ch('Decline', {}),
				right: ch('Take the survey journal', { renown: 3 }, { tags: ['art'], itemAdd: ['survey-book'], quest: q, text: '◆ Three harbors. Any order.' })
			};
		}
	}
];
