import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { CITY, cityExists, routesFrom } from '#lib/data/world';
import { newRun, randomHero, restDay, sponsorInvention, tickInventions } from './engine';
import { getTimeInfo } from './time';
import { isNightMarket, marketStock, priceOf } from './market';
import { culturalStanding } from './mods';
import { INVENTIONS } from '#lib/data/inventions';
import { ITEMS } from '#lib/data/items';

describe('Ancient Cities & World Connections', () => {
	it('all 8 ancient cities exist and have connected travel routes', () => {
		const ancientCities = ['alexandria', 'damascus', 'athens', 'angkor', 'patna', 'taxila', 'antioch', 'carthage'];
		for (const cid of ancientCities) {
			const city = CITY[cid];
			expect(city, `City ${cid} should exist`).toBeDefined();
			expect(cityExists(city, 1600), `City ${cid} should exist in year 1600`).toBe(true);
			const routes = routesFrom(cid, 1600);
			expect(routes.length, `City ${cid} should have connected routes`).toBeGreaterThan(0);
		}
	});
});

describe('Diurnal Stages (Morning, Day, Night)', () => {
	it('energy in city determines diurnal stage', () => {
		const rng = new Rng(42);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'test-seed', 1600);

		// Initial arrival: energy is at full max -> morning / dawn
		run.phase = 'city';
		run.energy = 3;
		const morning = getTimeInfo(run);
		expect(morning.stage).toBe('morning');
		expect(morning.phase).toBe('dawn');
		expect(morning.timeStr).toContain('AM');

		// Mid-day: energy is spent partially -> day / afternoon
		run.energy = 1;
		const day = getTimeInfo(run);
		expect(day.stage).toBe('day');
		expect(day.timeStr).toContain('PM');

		// Night: energy is 0 -> night
		run.energy = 0;
		const night = getTimeInfo(run);
		expect(night.stage).toBe('night');
		expect(night.phase).toBe('night');
		expect(night.timeStr).toContain('PM');

		// Resting restores morning
		restDay(run);
		const rested = getTimeInfo(run);
		expect(rested.stage).toBe('morning');
	});
});

describe('Night Market & Contraband', () => {
	it('night market opens at night with contraband stock', () => {
		const rng = new Rng(123);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'hangzhou' });
		const run = newRun(hero, 'test-seed', 1600);
		run.phase = 'city';
		run.energy = 0; // night time

		expect(isNightMarket(run)).toBe(true);

		const stock = marketStock(run);
		const contrabandFound = stock.supplies.some((id) =>
			['forged-pass', 'skeleton-key', 'smoke-pellets', 'opium', 'stolen-relic'].includes(id)
		);
		expect(contrabandFound, 'Night market supplies should contain contraband goods').toBe(true);
	});

	it('outlaw faction reputation grants discount on contraband', () => {
		const rng = new Rng(456);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'test-seed', 1600);
		run.phase = 'city';
		run.energy = 0;

		const normalPrice = priceOf(run, 'smoke-pellets');
		run.factions = { outlaw: 50, faith: 0, crown: 0, mercenary: 0, guild: 0 };
		const discountPrice = priceOf(run, 'smoke-pellets');

		expect(discountPrice).toBeLessThan(normalPrice);
	});
});

describe('Inventions & Patronage System', () => {
	it('sponsoring an invention charges silver and incubates project', () => {
		const rng = new Rng(789);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'test-seed', 1600);
		run.stats.silver = 50;

		const success = sponsorInvention(run, 'celestial-chronometer', 'Master Astronomer Guo');
		expect(success).toBe(true);
		expect(run.stats.silver).toBe(50 - INVENTIONS['celestial-chronometer'].cost);
		expect(run.inventions?.length).toBe(1);
		expect(run.inventions?.[0].id).toBe('celestial-chronometer');
		expect(run.inventions?.[0].daysLeft).toBe(INVENTIONS['celestial-chronometer'].daysNeeded);

		// Cannot duplicate active invention
		const dup = sponsorInvention(run, 'celestial-chronometer', 'Another Astronomer');
		expect(dup).toBe(false);

		// Fast forward days to complete invention
		const oldDeadline = run.deadline;
		tickInventions(run, 25);
		expect(run.inventions?.length).toBe(0);
		expect(run.completedInventions?.includes('celestial-chronometer')).toBe(true);
		expect(run.bag.includes('celestial-chronometer')).toBe(true);
		expect(run.deadline).toBe(oldDeadline + 14); // Chronometer deadline bonus
	});
});

describe('Cultural Affinities & Politics', () => {
	it('evaluates regional cultural standing and assigns localized titles', () => {
		const rng = new Rng(999);
		// Scholar in Han culture
		const hero = randomHero(rng, 1600, {
			culture: 'han',
			profession: 'scholar',
			traits: ['scholar', 'meticulous', 'dutiful']
		});
		const run = newRun(hero, 'test-seed', 1600);
		run.stats.renown = 60;

		const standing = culturalStanding(run, 'han');
		expect(standing.score).toBeGreaterThan(0);
		expect(standing.title).toContain('Literatus');
		expect(standing.system).toContain('Confucian');

		// Same hero in Japan receives Japanese localized honorific
		const jpStanding = culturalStanding(run, 'japanese');
		expect(jpStanding.title).toBe('Sensei (先生)');

		// In Joseon
		const krStanding = culturalStanding(run, 'korean');
		expect(krStanding.title).toContain('Seonbi');
	});
});
