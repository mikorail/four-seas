import { describe, expect, it } from 'vitest';
import { Rng } from '#lib/rng';
import { newRun, randomHero, choose, hangout, visitDistrictBuilding, assignCompanionTask, depart } from './engine';
import { isCrisis, buildCrisisCard } from './cards/crisis';
import { notableOfCity, NOTABLES } from '#lib/data/notables';
import { assignCompanionTask as executeTask, defaultTraitsForRole, companionBaggageCard } from './companions';
import { getDressRecommendation, donRecommendedGarb } from './dress';
import { citySecurityProfile, DISTRICTS } from '#lib/data/districts';
import { availableRoutes } from './engine';

describe('Brink of Fate Crisis System', () => {
	it('intercepts fatal stat loss with a Brink Crisis Card', () => {
		const rng = new Rng(42);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'crisis-test', 1600);

		// Silver drops to 0
		run.stats.silver = 0;
		const crisis = isCrisis(run);
		expect(crisis).toBe('silver-low');

		const card = buildCrisisCard(run, crisis!);
		expect(card.id).toBe('crisis-silver-low');
		expect(card.badge).toBe('Brink of Ruin');
		expect(card.left.label).toContain('Shake it off');
		expect(card.right.label).toContain('Nah');

		// Queue the crisis card and simulate choosing "Shake it off"
		run.deck = [card];
		const res = choose(run, 'left');
		expect(run.stats.silver).toBe(25);
		expect(run.statuses).toContain('indebted');
		expect(run.flags['brink_used:silver-low']).toBe(true);
		expect(run.phase).not.toBe('end');
	});

	it('choosing Nah in crisis succumbs to fate and ends the journey', () => {
		const rng = new Rng(99);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'succumb-test', 1600);

		run.stats.vigor = 0;
		const crisis = isCrisis(run);
		expect(crisis).toBe('vigor-low');

		const card = buildCrisisCard(run, crisis!);
		run.deck = [card];
		choose(run, 'right');
		expect(run.flags.end).toBe('stat-vigor-low');
		// Next checkEnd triggers game over
		expect(run.phase).toBe('end');
		expect(run.ending?.kind).toBe('vigor-low');
	});
});

describe('Unique Local Notables & Hangout Feature', () => {
	it('provides authentic resident notables for cities', () => {
		const beijing = notableOfCity('beijing', 1600);
		expect(beijing.name).toBe('Master Lu Shen');
		expect(beijing.traits).toContain('poet');

		const venice = notableOfCity('venice', 1600);
		expect(venice.name).toBe('Signora Elena Morosini');

		const damascus = notableOfCity('damascus', 1600);
		expect(damascus.name).toBe('Hakim Tariq ibn Yusuf');

		// Any procedural city has a valid notable
		const procedural = notableOfCity('qufu', 1600);
		expect(procedural.name).toBeDefined();
		expect(procedural.blurb).toBeDefined();
	});

	it('allows hanging out with local notables using downtime energy', () => {
		const rng = new Rng(101);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'hangout-test', 1600);
		run.phase = 'city';
		run.energy = 2;

		const success = hangout(run);
		expect(success).toBe(true);
		expect(run.energy).toBe(1);
		expect(run.deck[0].badge).toBe('Social Gathering');
		expect(run.deck[0].text).toContain('Master Lu Shen');

		// Choice delivers restful or engaging outcomes
		const res = choose(run, 'left');
		expect(res.text).toContain('exchanging memories');
	});
});

describe('Multi-Companion Manager, Tasks & Baggage', () => {
	it('companions receive role-specific traits and can be assigned city tasks', () => {
		const rng = new Rng(202);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'companion-test', 1600);

		// Add a thief companion
		run.crew = [
			{
				id: 'crew-thief',
				npc: { name: 'Ah Long', title: 'Street Urchin', culture: 'han', gender: 'm', role: 'bandit', seed: 555 },
				role: 'thief',
				wage: 2,
				loyalty: 60,
				joinedDay: 1
			}
		];

		const traits = defaultTraitsForRole('thief');
		expect(traits).toContain('outlaw');
		expect(traits).toContain('stealthy');

		// Assign guard task: cools heat
		run.heat = 20;
		const guardRes = assignCompanionTask(run, 'crew-thief', 'guard');
		expect(guardRes).not.toBeNull();
		expect(run.heat).toBeLessThan(20);
		expect(run.crew[0].task).toBe('guard');

		// Assign scout task: sets scouted_route flag
		const scoutRes = assignCompanionTask(run, 'crew-thief', 'scout');
		expect(scoutRes).not.toBeNull();
		expect(run.flags.scouted_route).toBe(true);

		// Scouted route reduces departure travel days
		const routes = availableRoutes(run);
		if (routes.length > 0) {
			const route = { ...routes[0] };
			const originalDays = route.days;
			depart(run, route);
			expect(route.days).toBe(Math.max(1, originalDays - 1));
		}
	});

	it('companion baggage generates specialized journey encounters', () => {
		const rng = new Rng(303);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'baggage-test', 1600);

		run.crew = [
			{
				id: 'crew-outlaw',
				npc: { name: 'Scarred Feng', title: 'Highway Rogue', culture: 'han', gender: 'm', role: 'bandit', seed: 777 },
				role: 'thief',
				wage: 3,
				loyalty: 50,
				joinedDay: 2,
				traits: ['outlaw', 'brave']
			}
		];

		const baggageCard = companionBaggageCard(run, new Rng(1), true);
		expect(baggageCard).not.toBeNull();
		expect(baggageCard?.badge).toBe('Companion’s Past');
		expect(baggageCard?.text).toContain('Scarred Feng');
	});
});

describe('City Arrival Garb & Etiquette Helper', () => {
	it('recommends appropriate attire and applies respectful standing bonus', () => {
		const rng = new Rng(404);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'beijing' });
		const run = newRun(hero, 'dress-test', 1600);

		run.location = 'beijing';
		run.bag.push('mandarin-robe');

		const rec = getDressRecommendation(run, 'beijing');
		expect(rec.recommendedOutfitId).toBe('mandarin-robe');
		expect(rec.ownedOutfitId).toBe('mandarin-robe');
		expect(rec.alreadyWearing).toBe(false);

		// Donning garb updates outfit and cultural standing
		const initialStanding = run.standing['han'] ?? 0;
		donRecommendedGarb(run, rec.ownedOutfitId!);
		expect(run.outfit?.id).toBe('mandarin-robe');
		expect(run.standing['han']).toBeGreaterThan(initialStanding);
	});
});

describe('City Security Profiles & Urban Districts', () => {
	it('categorizes cities by security order and district composition', () => {
		const macau = citySecurityProfile('macau');
		expect(macau.order).toBe('notorious-crime');
		expect(macau.districts).toContain('slums');

		const beijing = citySecurityProfile('beijing');
		expect(beijing.order).toBe('lawful');
		expect(beijing.districts).toContain('aristocratic');

		const guangzhou = citySecurityProfile('guangzhou');
		expect(guangzhou.order).toBe('fractured');
		expect(guangzhou.districts).toContain('colonial');
	});

	it('allows visiting specific district buildings', () => {
		const rng = new Rng(505);
		const hero = randomHero(rng, 1600, { culture: 'han', home: 'guangzhou' });
		const run = newRun(hero, 'district-test', 1600);
		run.phase = 'city';
		run.energy = 2;

		const visited = visitDistrictBuilding(run, 'slums', 'smugglers-den');
		expect(visited).toBe(true);
		expect(run.deck[0].badge).toContain('Shantytown');
		expect(run.deck[0].text).toContain('contraband crates');
	});
});
