// Ships and caravans you own: send them on trade runs while you travel; profits go to the treasury.
import { Rng } from '#lib/rng';
import { CITY, CITIES, cityExists, cityName, kmBetween } from '#lib/data/world';
import type { CultureId } from '#lib/data/cultures';
import type { Run, Venture, VentureKind } from './types';

export interface VentureDef {
	kind: VentureKind;
	name: string;
	glyph: string;
	price: number; // taels or silver
	speed: number; // km per day
	hold: number; // profit scale
	risk: number; // base loss chance per run
	sea: boolean;
	desc: string;
}

export const VENTURES: Record<VentureKind, VentureDef> = {
	junk: { kind: 'junk', name: 'Ocean junk', glyph: '⛵', price: 30, speed: 140, hold: 1, risk: 0.1, sea: true, desc: 'Battened sails, watertight bulkheads, a shrine to Mazu in the stern.' },
	dhow: { kind: 'dhow', name: 'Trading dhow', glyph: '⛵', price: 26, speed: 150, hold: 0.85, risk: 0.11, sea: true, desc: 'Lateen sail and sewn planks; rides the monsoon like a gull.' },
	indiaman: { kind: 'indiaman', name: 'East Indiaman', glyph: '🚢', price: 45, speed: 150, hold: 1.5, risk: 0.08, sea: true, desc: 'A floating warehouse with cannon. Slow, rich and hated by pirates.' },
	steamer: { kind: 'steamer', name: 'Coastal steamer', glyph: '🛳️', price: 50, speed: 300, hold: 1.3, risk: 0.05, sea: true, desc: 'Coal smoke and schedules. The future of trade, or so they say.' },
	caravan: { kind: 'caravan', name: 'Caravan train', glyph: '🐫', price: 24, speed: 30, hold: 0.9, risk: 0.09, sea: false, desc: 'Forty beasts, a caravan master, and a lot of rope.' }
};

const SHIP_NAMES = ['Jade Dragon', 'Golden Lotus', 'Monsoon Bride', 'Silver Crane', 'Pearl of the East', 'Fair Wind', 'Lucky Carp', 'Morning Star', 'Saffron Moon', 'Iron Turtle', 'Heavenly Peach', 'Sea Swallow'];
const CARAVAN_NAMES = ['Desert Rose', 'Thousand Bells', 'Silk Thread', 'Long Road', 'Amber Wind', 'Sandstorm', 'Twin Humps'];

/** What kind of venture a city can sell you. */
export function ventureFor(cityId: string, year: number): VentureKind {
	const c = CITY[cityId];
	if (!c.port) return 'caravan';
	if (year >= 1850) return 'steamer';
	const byCulture: Partial<Record<CultureId, VentureKind>> = { european: year >= 1600 ? 'indiaman' : 'junk', persian: 'dhow', swahili: 'dhow', indian: 'dhow', malay: 'dhow', ottoman: 'dhow' };
	return byCulture[c.culture] ?? 'junk';
}

export function newVenture(rng: Rng, kind: VentureKind, home: string): Venture {
	return { id: `v-${rng.int(1, 1e9)}`, kind, name: rng.pick(kind === 'caravan' ? CARAVAN_NAMES : SHIP_NAMES), home, state: 'idle', condition: 100 };
}

export interface TradeRun {
	dest: string;
	days: number;
	profit: number; // expected
	risk: number; // 0..1
}

/** A few profitable destinations for a venture, from its home city. */
export function tradeRuns(run: Run, v: Venture): TradeRun[] {
	const def = VENTURES[v.kind];
	const home = CITY[v.home];
	const pool = CITIES.filter((c) => c.id !== v.home && cityExists(c, run.year) && (def.sea ? c.port : !c.port || c.culture === home.culture) && c.exports !== home.exports);
	const scored = pool
		.map((c) => {
			const km = kmBetween(v.home, c.id);
			if (def.sea ? km > 9000 : km > 3500) return null;
			const days = Math.max(6, Math.round((km * 2) / def.speed + 6));
			const standing = run.standing[c.culture] ?? 0;
			const profit = Math.round((8 + km / 220) * def.hold * (1 + standing / 300) * (v.condition / 100));
			const risk = Math.min(0.45, def.risk + km / 40000 + (standing < -30 ? 0.08 : 0));
			return { dest: c.id, days, profit, risk };
		})
		.filter((x): x is TradeRun => !!x)
		.sort((a, b) => b.profit / b.days - a.profit / a.days);
	return scored.slice(0, 4);
}

export function dispatch(run: Run, id: string, t: TradeRun) {
	const v = run.ventures.find((x) => x.id === id);
	if (!v || v.state !== 'idle') return;
	v.state = 'away';
	v.dest = t.dest;
	v.back = run.day + t.days;
	v.stake = t.profit;
}

/** Ventures whose return day has passed report back (called on arrival in a city). */
export function resolveVentures(run: Run, rng: Rng): string[] {
	const notes: string[] = [];
	for (const v of [...run.ventures]) {
		if (v.state !== 'away' || (v.back ?? 0) > run.day) continue;
		const def = VENTURES[v.kind];
		const t = tradeRuns(run, v).find((x) => x.dest === v.dest);
		const risk = t?.risk ?? def.risk;
		const where = v.dest ? cityName(CITY[v.dest], run.year) : 'abroad';
		v.state = 'idle';
		v.dest = undefined;
		v.back = undefined;
		const roll = rng.next();
		if (roll < risk * 0.35) {
			run.ventures.splice(run.ventures.indexOf(v), 1);
			notes.push(`${def.glyph} Grim news: your ${def.name.toLowerCase()} **${v.name}** was lost on the way to ${where}.`);
		} else if (roll < risk) {
			v.condition = Math.max(20, v.condition - 35);
			const gain = Math.round((v.stake ?? 10) * 0.3);
			run.treasury += gain;
			notes.push(`${def.glyph} **${v.name}** limped home from ${where}, battered (${v.condition}% sound). Salvaged **${gain} taels**.`);
		} else {
			const gain = Math.round((v.stake ?? 10) * (0.7 + rng.next() * 0.8));
			run.treasury += gain;
			v.condition = Math.max(30, v.condition - 8);
			notes.push(`${def.glyph} **${v.name}** is back from ${where}. Profit banked: **${gain} taels**.`);
		}
	}
	return notes;
}
