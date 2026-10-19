// Real calendars for 1500–1900: Gregorian/Julian, Chinese lunisolar (approx.), Islamic (tabular Hijri),
// Buddhist Era, Vikram Samvat — plus festival windows computed from them.
import type { CultureId } from '#lib/data/cultures';
import type { Run } from './types';

const DAY = 86400000;
const SYNODIC = 29.530588853;
const NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC

export const toJD = (d: Date) => d.getTime() / DAY + 2440587.5;
export const fromJD = (jd: number) => new Date((jd - 2440587.5) * DAY);

/** Date of a given day of the run. */
export function dateOf(run: Pick<Run, 'year' | 'month0'>, day: number): Date {
	return new Date(Date.UTC(run.year, run.month0, 1) + day * DAY);
}

/** Moon age in days (0 = new, ~14.8 = full). */
export function moonAge(d: Date) {
	const a = (toJD(d) - NEW_MOON_JD) % SYNODIC;
	return a < 0 ? a + SYNODIC : a;
}

function newMoonOnOrAfter(jd: number) {
	const k = Math.ceil((jd - NEW_MOON_JD) / SYNODIC);
	return NEW_MOON_JD + k * SYNODIC;
}
function newMoonBefore(jd: number) {
	const k = Math.floor((jd - NEW_MOON_JD) / SYNODIC);
	return NEW_MOON_JD + k * SYNODIC;
}

/** Chinese New Year ≈ second new moon after the winter solstice (Beijing time). */
export function lunarNewYear(year: number): number {
	const solstice = toJD(new Date(Date.UTC(year - 1, 11, 21)));
	const first = newMoonOnOrAfter(solstice + 1);
	return Math.floor(first + SYNODIC + 0.33) + 0.5; // +8h, start of local day
}

/** Approximate Chinese lunar date: month 1–12, day 1–30. (Leap months ignored.) */
export function lunarDate(d: Date): { month: number; day: number; year: number } {
	const jd = toJD(d);
	const y = d.getUTCFullYear();
	let ny = lunarNewYear(y);
	let ly = y;
	if (jd < ny) {
		ny = lunarNewYear(y - 1);
		ly = y - 1;
	}
	const month = Math.min(12, Math.floor((jd - ny) / SYNODIC) + 1);
	const monthStart = Math.floor(newMoonBefore(jd + 0.34) + 0.33) + 0.5;
	const day = Math.max(1, Math.floor(jd - monthStart) + 1);
	return { month, day: Math.min(30, day), year: ly };
}

// ----- Tabular Islamic calendar -----
function hijriToJD(y: number, m: number, d: number) {
	return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5 - 1;
}
export function hijriDate(d: Date): { year: number; month: number; day: number } {
	const jd = Math.floor(toJD(d)) + 0.5;
	const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
	const month = Math.min(12, Math.ceil((jd - (29 + hijriToJD(year, 1, 1))) / 29.5) + 1);
	const day = jd - hijriToJD(year, month, 1) + 1;
	return { year, month, day: Math.round(day) };
}
const HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qa'dah", 'Dhu al-Hijjah'];

/** Gregorian Easter (computus). Used for every year for simplicity. */
export function easter(year: number): Date {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(Date.UTC(year, month - 1, day));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORD = (n: number) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

export function westernDate(d: Date) {
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** How a culture would write today's date. */
export function localDate(d: Date, culture: CultureId): string {
	const y = d.getUTCFullYear();
	switch (culture) {
		case 'han':
		case 'korean':
		case 'viet':
		case 'japanese':
		case 'tibetan': {
			const l = lunarDate(d);
			return `${ORD(l.day)} day of the ${ORD(l.month)} lunar month`;
		}
		case 'malay':
		case 'persian':
		case 'ottoman':
		case 'swahili':
		case 'steppe': {
			const h = hijriDate(d);
			return `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${h.year} AH`;
		}
		case 'siamese':
			return `Buddhist Era ${y + 543}, ${MONTHS[d.getUTCMonth()]}`;
		case 'indian':
			return `Vikram Samvat ${y + 57}`;
		case 'european':
			return y < 1582 ? 'Julian reckoning (Old Style)' : 'Gregorian reckoning';
		default:
			return '';
	}
}

// ----- Festivals -----

export interface Festival {
	id: string;
	name: string;
	cultures: CultureId[];
	muslim?: boolean; // also observed in Muslim cities of other cultures
	text: string; // what you see
	join: string; // label for taking part
	fx: { silver?: number; vigor?: number; renown?: number; fortune?: number };
	days?: number;
	fast?: boolean; // Ramadan-style: taking part costs vigor, the reward is merit/renown
}

const between = (d: Date, from: Date, days: number) => d.getTime() >= from.getTime() && d.getTime() < from.getTime() + days * DAY;
const md = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));

/** All festivals happening on this date for a culture. */
export function festivalsOn(d: Date, culture: CultureId, muslimCity: boolean): Festival[] {
	const y = d.getUTCFullYear();
	const out: Festival[] = [];
	const l = lunarDate(d);
	const h = hijriDate(d);
	const age = moonAge(d);
	const full = age > 13.3 && age < 16.3;
	const newm = age < 1.5 || age > SYNODIC - 1.5;
	const lunarCult: CultureId[] = ['han', 'korean', 'viet', 'tibetan', ...(y < 1873 ? (['japanese'] as CultureId[]) : [])];

	for (const f of FESTIVALS) {
		const here = f.cultures.includes(culture) || (f.muslim && muslimCity);
		if (!here) continue;
		let on = false;
		switch (f.id) {
			case 'lunar-new-year':
				on = lunarCult.includes(culture) && l.month === 1 && l.day <= 7;
				break;
			case 'shogatsu':
				on = culture === 'japanese' && y >= 1873 && d.getUTCMonth() === 0 && d.getUTCDate() <= 7;
				break;
			case 'lantern':
				on = l.month === 1 && l.day >= 14 && l.day <= 16;
				break;
			case 'dragon-boat':
				on = l.month === 5 && l.day >= 4 && l.day <= 6;
				break;
			case 'ghost':
				on = l.month === 7 && l.day >= 13 && l.day <= 16;
				break;
			case 'mid-autumn':
				on = l.month === 8 && l.day >= 13 && l.day <= 16;
				break;
			case 'ramadan':
				on = h.month === 9;
				break;
			case 'eid-fitr':
				on = h.month === 10 && h.day <= 3;
				break;
			case 'eid-adha':
				on = h.month === 12 && h.day >= 10 && h.day <= 13;
				break;
			case 'ashura':
				on = h.month === 1 && h.day >= 9 && h.day <= 10;
				break;
			case 'nowruz':
				on = between(d, md(y, 3, 19), 5);
				break;
			case 'songkran':
				on = between(d, md(y, 4, 13), 3);
				break;
			case 'vesak':
				on = d.getUTCMonth() === 4 && full;
				break;
			case 'diwali':
				on = newm && between(d, md(y, 10, 12), 36);
				break;
			case 'holi':
				on = full && between(d, md(y, 2, 25), 30);
				break;
			case 'easter':
				on = between(d, new Date(easter(y).getTime() - 2 * DAY), 4);
				break;
			case 'carnival':
				on = between(d, new Date(easter(y).getTime() - 50 * DAY), 4);
				break;
			case 'christmas':
				on = between(d, md(y, 12, 24), 3);
				break;
			case 'mwaka-kogwa':
				on = between(d, md(y, 7, 22), 4);
				break;
			case 'tanabata':
				on = l.month === 7 && l.day >= 6 && l.day <= 7;
				break;
		}
		if (on) out.push(f);
	}
	return out;
}

export const FESTIVALS: Festival[] = [
	{ id: 'lunar-new-year', name: 'Lunar New Year', cultures: ['han', 'korean', 'viet', 'tibetan', 'japanese'], text: 'Firecrackers crackle in every lane, red couplets hang on every door, and families gather to feed the ancestors before themselves.', join: 'Feast and set off firecrackers', fx: { vigor: 10, renown: 4, silver: -4 }, days: 2 },
	{ id: 'shogatsu', name: 'Shōgatsu', cultures: ['japanese'], text: 'The New Year: pine-and-bamboo kadomatsu flank every gate, temple bells toll 108 times, and everyone eats mochi until they regret it.', join: 'Make the first shrine visit', fx: { vigor: 8, renown: 3 }, days: 1 },
	{ id: 'lantern', name: 'Lantern Festival', cultures: ['han', 'viet'], text: 'Under the first full moon of the year, the streets glow with a thousand lanterns hung with riddles. Guess one, win a prize.', join: 'Guess the lantern riddles', fx: { renown: 6, silver: 3 } },
	{ id: 'dragon-boat', name: 'Dragon Boat Festival', cultures: ['han', 'korean', 'viet'], text: 'Drums thunder on the river as dragon-prowed boats race in memory of the drowned poet Qu Yuan. Sticky rice dumplings are everywhere.', join: 'Row in a dragon boat', fx: { vigor: -4, renown: 10 } },
	{ id: 'ghost', name: 'Hungry Ghost Festival', cultures: ['han', 'viet', 'japanese'], text: 'The gates of the underworld stand open. Paper money burns on every corner and an empty front row is left at the opera — for the dead.', join: 'Burn offerings for wandering souls', fx: { silver: -3, fortune: 6 } },
	{ id: 'mid-autumn', name: 'Mid-Autumn Festival', cultures: ['han', 'korean', 'viet', 'japanese'], text: 'The fullest moon of the year. Families share mooncakes (in Joseon, songpyeon at Chuseok) and children carry lanterns shaped like rabbits and carp.', join: 'Share mooncakes under the moon', fx: { vigor: 8, fortune: 4 } },
	{ id: 'tanabata', name: 'Tanabata', cultures: ['japanese'], text: 'The Weaver and the Herdsman meet across the Milky Way tonight. Bamboo branches bend under paper wishes.', join: 'Hang a wish on the bamboo', fx: { fortune: 6 } },
	{ id: 'ramadan', name: 'Ramadan', cultures: ['malay', 'persian', 'ottoman', 'swahili', 'steppe'], muslim: true, text: 'The holy month: by day the markets are hushed and no one eats; at sunset the drums sound and whole streets break the fast together.', join: 'Keep the fast with the city', fx: { vigor: -8, renown: 6 }, fast: true },
	{ id: 'eid-fitr', name: 'Eid al-Fitr', cultures: ['malay', 'persian', 'ottoman', 'swahili', 'steppe'], muslim: true, text: 'Ramadan is over. New clothes, visits to every relative, forgiveness asked and given, and sweets pressed on every passer-by. In the archipelago they call it Hari Raya.', join: 'Visit, forgive and feast', fx: { vigor: 10, renown: 5, silver: -3 }, days: 1 },
	{ id: 'eid-adha', name: 'Eid al-Adha', cultures: ['malay', 'persian', 'ottoman', 'swahili', 'steppe'], muslim: true, text: 'The Feast of Sacrifice: rams are blessed and slaughtered, and a third of every portion goes to the poor.', join: 'Share meat with the poor', fx: { silver: -3, renown: 4 } },
	{ id: 'ashura', name: 'Muharram & Ashura', cultures: ['persian'], text: 'Black banners and mourning processions for Imam Husayn at Karbala. Passion plays fill the squares; strangers are offered water in his memory.', join: 'Join the mourning procession', fx: { vigor: -3, renown: 5 } },
	{ id: 'nowruz', name: 'Nowruz', cultures: ['persian', 'steppe', 'ottoman'], text: 'The Persian New Year at the spring equinox. Bonfires to leap over, tables of seven symbolic things, and sprouting wheatgrass on every sill.', join: 'Leap the bonfire', fx: { vigor: 6, fortune: 6 } },
	{ id: 'songkran', name: 'Songkran', cultures: ['siamese'], text: 'The Siamese New Year. Water is poured over Buddha images and elders’ hands — and, increasingly, thrown over everyone else.', join: 'Join the water blessing', fx: { vigor: 8, fortune: 4 } },
	{ id: 'vesak', name: 'Vesak', cultures: ['siamese', 'tibetan'], text: 'The full moon of the Buddha’s birth, awakening and passing. Candle processions circle every wat three times.', join: 'Walk the candle procession', fx: { fortune: 8, vigor: 2 } },
	{ id: 'diwali', name: 'Diwali', cultures: ['indian'], text: 'The festival of lights on the darkest night of autumn: oil lamps on every ledge, rangoli on every step, sweets and gambling for Lakshmi’s favor.', join: 'Light lamps and play dice', fx: { fortune: 8, silver: -4, renown: 3 } },
	{ id: 'holi', name: 'Holi', cultures: ['indian'], text: 'Spring’s full moon: coloured powder and water fly through every street, and caste and rank are forgotten for a day.', join: 'Throw colour with the crowds', fx: { vigor: 6, renown: 4 } },
	{ id: 'easter', name: 'Holy Week & Easter', cultures: ['european'], text: 'Processions with candles and statues fill the streets; church bells, silent since Thursday, ring out for Easter morning.', join: 'Attend the Easter Mass', fx: { fortune: 6, renown: 3 } },
	{ id: 'carnival', name: 'Carnival', cultures: ['european'], text: 'The last feast before Lent: masks, music and very bad behaviour, all forgiven by Ash Wednesday.', join: 'Put on a mask', fx: { vigor: 6, renown: 4, silver: -4 } },
	{ id: 'christmas', name: 'Christmas', cultures: ['european'], text: 'Midnight Mass, a feast for the household, and alms for the poor at the church door.', join: 'Keep Christmas with the town', fx: { vigor: 8, fortune: 3 } },
	{ id: 'mwaka-kogwa', name: 'Mwaka Kogwa', cultures: ['swahili'], text: 'The Shirazi New Year: men duel with banana stems to settle the old year’s grudges, then everyone feasts together.', join: 'Fight with banana stems', fx: { vigor: -2, renown: 8 } }
];

/** Festivals coming up in the next `days` days in a culture. */
export function upcoming(run: Pick<Run, 'year' | 'month0' | 'day'>, culture: CultureId, muslimCity: boolean, days = 45): { name: string; inDays: number }[] {
	const seen = new Set<string>();
	const out: { name: string; inDays: number }[] = [];
	for (let i = 0; i <= days; i++) {
		for (const f of festivalsOn(dateOf(run, run.day + i), culture, muslimCity)) {
			if (seen.has(f.id)) continue;
			seen.add(f.id);
			out.push({ name: f.name, inDays: i });
		}
	}
	return out;
}
