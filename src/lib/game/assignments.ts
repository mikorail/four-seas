// Procedural commissions: who asks, what you carry, why it matters, and what happens if you fail.
import type { Rng } from '#lib/rng';
import { CULTURES, makeName, type CultureId, type Gender } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import type { Npc, Role } from './types';

interface Patron {
	role: Role;
	title: (c: CultureId, city: string) => string;
	wants: string[]; // kinds of things they send
	why: string[];
}

const PATRONS: Patron[] = [
	{ role: 'official', title: (c, city) => `${CULTURES[c].official} of ${city}`, wants: ['treaty', 'tribute', 'seal', 'letter'], why: ['a border quarrel will become a war without it', 'the court expects it before the new moon', 'a rival ministry is spreading lies about it'] },
	{ role: 'merchant', title: (c) => `Head of a ${CULTURES[c].adjective.toLowerCase()} merchant house`, wants: ['ledger', 'sample', 'letter', 'credit'], why: ['a fortune depends on the price arriving before the fleet', 'the partner at the other end is about to sell to someone else', 'the guild will ruin the house if the contract is late'] },
	{ role: 'monk', title: (c) => (CULTURES[c].holyPlace === 'church' ? 'Father Superior' : CULTURES[c].holyPlace === 'mosque' || CULTURES[c].holyPlace === 'madrasa' ? 'Sheikh of the lodge' : 'Abbot'), wants: ['relic', 'scripture', 'letter'], why: ['a temple was promised it a generation ago', 'a dying teacher wants to see it once more', 'a schism will be healed — or not — by what it says'] },
	{ role: 'noble', title: (c) => (c === 'japanese' ? 'Daimyō’s widow' : c === 'indian' ? 'Begum of the zenana' : 'Princess of the old house'), wants: ['jewel', 'letter', 'seal', 'portrait'], why: ['a marriage alliance hangs on it', 'it proves a disputed inheritance', 'nobody else at court can be trusted with it'] },
	{ role: 'scholar', title: () => 'Astronomer of the observatory', wants: ['chart', 'instrument', 'scripture', 'letter'], why: ['a comet is due and the calculations must be compared', 'a wager with a foreign academy is at stake', 'a calendar reform depends on it'] },
	{ role: 'healer', title: () => 'Physician of the old school', wants: ['remedy', 'sample', 'letter'], why: ['an epidemic is spreading downriver', 'a famous patient is running out of time', 'only one apothecary can complete the formula'] },
	{ role: 'captain', title: () => 'Harbourmaster and ship-owner', wants: ['chart', 'ledger', 'credit', 'letter'], why: ['a cargo is impounded until the papers arrive', 'insurers will not pay without the sworn statement', 'a lost crew’s families are waiting for the wages'] }
];

const THINGS: Record<string, { obj: string[]; adj: string[] }> = {
	treaty: { obj: ['treaty of friendship', 'boundary agreement', 'truce terms', 'trade concession'], adj: ['sealed', 'twice-signed', 'secret', 'disputed'] },
	tribute: { obj: ['tribute of pearls', 'casket of tribute gold', 'gift of white falcons', 'tribute horse’s pedigree'], adj: ['overdue', 'royal', 'promised'] },
	seal: { obj: ['jade seal', 'signet ring', 'bronze tally', 'chop of office'], adj: ['ancestral', 'imperial', 'stolen-and-recovered'] },
	letter: { obj: ['letter', 'sealed dispatch', 'bundle of letters', 'last testament'], adj: ['coded', 'perfumed', 'urgent', 'unopened'] },
	ledger: { obj: ['ledger', 'bill of exchange', 'cargo manifest', 'contract'], adj: ['corrected', 'water-stained', 'notarised'] },
	sample: { obj: ['sample of new tea', 'phial of rare dye', 'seed pouch', 'bolt of experimental silk'], adj: ['unpatented', 'priceless', 'fragile'] },
	credit: { obj: ['letter of credit', 'chest of silver bars', 'promissory note'], adj: ['enormous', 'guaranteed', 'forged-looking'] },
	relic: { obj: ['relic in a sandalwood box', 'reliquary', 'saint’s bone', 'tooth relic'], adj: ['holy', 'miraculous', 'contested'] },
	scripture: { obj: ['sutra scroll', 'illuminated Qur’an', 'Gospel in Chinese', 'commentary on the classics'], adj: ['rare', 'annotated', 'only surviving'] },
	jewel: { obj: ['ruby necklace', 'pearl hairpin', 'emerald turban ornament', 'gold betrothal comb'], adj: ['famous', 'cursed', 'heirloom'] },
	portrait: { obj: ['miniature portrait', 'betrothal portrait', 'scroll portrait'], adj: ['flattering', 'unfinished', 'secret'] },
	chart: { obj: ['star chart', 'sea chart', 'eclipse table', 'map of the interior'], adj: ['new', 'corrected', 'forbidden'] },
	instrument: { obj: ['telescope lens', 'astrolabe', 'pendulum clock', 'armillary sphere'], adj: ['delicate', 'foreign-made', 'precise'] },
	remedy: { obj: ['cinchona bark', 'theriac jar', 'ginseng root', 'smallpox scab for variolation'], adj: ['life-saving', 'rare', 'perishable'] }
};

const STAKES = [
	'If it comes late, do not come at all.',
	'Fail, and your name is mud from here to the sea.',
	'Succeed, and doors will open in every court.',
	'There will be a rival. There is always a rival.',
	'Others have tried. Their horses came back without them.',
	'Do not open it. Do not lose it. Do not trust anyone who asks about it.'
];

export interface Assignment {
	patron: string;
	patronNpc: Npc;
	item: string;
	destination: string;
	days: number;
	briefing: string;
	why: string;
}

const a = (s: string) => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;

export function rollAssignment(rng: Rng, year: number, from: string, to: string, days: number): Assignment {
	const city = CITY[from];
	const cul = city.culture;
	const p = rng.pick(PATRONS);
	const g: Gender = rng.chance(p.role === 'noble' ? 0.9 : 0.35) ? 'f' : 'm';
	const name = makeName(rng, CULTURES[cul], g);
	const title = p.title(cul, cityName(city, year));
	const kind = rng.pick(p.wants);
	const t = THINGS[kind];
	const item = a(`${rng.pick(t.adj)} ${rng.pick(t.obj)}`);
	const why = rng.pick(p.why);
	const dest = cityName(CITY[to], year);
	const briefing = `**${name}**, ${title}, has heard what you did. ${rng.pick(['They waste no words', 'Tea is poured, and then the door is closed', 'They speak quietly, as if the walls had ears', 'They study you for a long moment first'])}: "${cap(item)} must reach **${dest}** within **${days} days** — ${why}. ${rng.pick(STAKES)}"`;
	return {
		patron: `${name}, ${title}`,
		patronNpc: { name, title, culture: cul, gender: g, role: p.role, seed: rng.int(1, 1e9) },
		item,
		destination: to,
		days,
		briefing,
		why
	};
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
