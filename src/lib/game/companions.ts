import type { Companion, CompanionTask, Card, Choice, Run } from './types';
import { capOf } from './mods';
export type { CompanionTask };
import { CREW, ITEMS } from '#lib/data/items';
import { CITY, cityName, SECRETS } from '#lib/data/world';
import { Rng } from '#lib/rng';
import { addItem, log } from './engine';

export interface TaskReport {
	companion: Companion;
	task: CompanionTask;
	text: string;
	notes: string[];
}

export const TASK_INFO: Record<CompanionTask, { name: string; glyph: string; desc: string }> = {
	idle: { name: 'At Rest', glyph: '☕', desc: 'Resting and keeping company with the party.' },
	provision: { name: 'Procure Provisions', glyph: '🌾', desc: 'Barters at local stalls for rations, fodder, and travelling supplies.' },
	intel: { name: 'Gather Intel', glyph: '👂', desc: 'Scours dockside taverns and teahouses for route secrets and market gossip.' },
	scout: { name: 'Scout Routes', glyph: '🧭', desc: 'Inspects departing caravans and vessels to shorten the upcoming journey.' },
	guard: { name: 'Stand Guard', glyph: '🛡️', desc: 'Watches the inn room and baggage, lowering Heat and deterring thieves.' }
};

/** Default traits by role if not already assigned */
export function defaultTraitsForRole(role: Companion['role']): string[] {
	switch (role) {
		case 'bodyguard':
			return ['brave', 'disciplined', 'hero'];
		case 'thief':
			return ['stealthy', 'resourceful', 'outlaw'];
		case 'healer':
			return ['healer', 'compassionate', 'observant'];
		case 'navigator':
			return ['astronomer', 'sea-dog', 'meticulous'];
		case 'guide':
			return ['linguist', 'observant', 'resourceful'];
		case 'interpreter':
			return ['linguist', 'diplomat', 'connected'];
		case 'cook':
			return ['resourceful', 'generous', 'healer'];
		case 'ward':
		case 'heir':
			return ['noble', 'curious', 'sheltered'];
		case 'companion':
		default:
			return ['loyal', 'observant'];
	}
}

/** Assign a companion to a city task and execute it */
export function assignCompanionTask(run: Run, companionId: string, task: CompanionTask): { text: string; notes: string[] } | null {
	const c = run.crew.find((member) => member.id === companionId);
	if (!c) return null;
	// each errand once per companion per stay — otherwise rations, silver, rumours and lowered heat could be farmed endlessly
	const stayKey = `${run.location}@${run.flags.stay ?? 0}`;
	const doneKey = `task:${c.id}:${task}`;
	if (task !== 'idle' && run.flags[doneKey] === stayKey) return { text: `${c.npc.name} has already done that here today.`, notes: [] };
	if (task !== 'idle') run.flags[doneKey] = stayKey;
	c.task = task;
	c.traits ??= defaultTraitsForRole(c.role);

	const notes: string[] = [];
	let text = '';
	const rng = new Rng(run.seed + ':' + run.day + ':' + c.id + ':' + task);

	if (task === 'idle') {
		text = `${c.npc.name} rejoins you by the hearth.`;
		return { text, notes };
	}

	if (task === 'provision') {
		const gotRations = addItem(run, 'rations');
		if (gotRations) {
			text = `${c.npc.name} haggled with market factors and returned with fresh travel rations.`;
			notes.push(`🌾 ${c.npc.name} acquired rations for the road.`);
		} else {
			run.stats.silver = Math.min(capOf(run, 'silver') - 1, run.stats.silver + 4);
			text = `${c.npc.name} traded leftover sundries with local sutlers, saving 4 silver.`;
			notes.push(`💰 ${c.npc.name} saved 4 silver on market barters.`);
		}
		if (run.mount && run.mount.health < 100) {
			run.mount.health = Math.min(100, run.mount.health + 10);
			notes.push(`🐎 ${c.npc.name} fed and groomed ${run.mount.name} (+10 health).`);
		}
	} else if (task === 'intel') {
		const unrevealed = SECRETS.filter((s) => !run.flags['secret:' + s.id]);
		if (unrevealed.length > 0 && rng.chance(0.65)) {
			const sec = rng.pick(unrevealed);
			run.flags['hint:' + sec.id] = Number(run.flags['hint:' + sec.id] ?? 0) + 1;
			text = `${c.npc.name} spent the afternoon in tea houses and overheard rumors about **${sec.name}**!`;
			notes.push(`👂 Rumor gathered: ${sec.name} — ${sec.hint}`);
		} else {
			run.stats.renown = Math.min(capOf(run, 'renown') - 1, run.stats.renown + 3);
			text = `${c.npc.name} talked with arriving caravan masters, learning which goods are scarce in neighboring ports.`;
			notes.push(`📜 ${c.npc.name} gathered trade intel (+3 Renown).`);
		}
	} else if (task === 'scout') {
		run.flags.scouted_route = true;
		text = `${c.npc.name} surveyed outbound caravans and ship captains, securing advance passage notes.`;
		notes.push(`🧭 Routes scouted: next departure will be faster and safer.`);
	} else if (task === 'guard') {
		if (run.heat > 0) {
			run.heat = Math.max(0, run.heat - 12);
			notes.push(`🏮 ${c.npc.name} deflected inquiries by the city watch (-12 Heat).`);
		}
		c.loyalty = Math.min(100, c.loyalty + 5);
		text = `${c.npc.name} stood vigilant guard over your baggage and lodgings throughout the watch.`;
		notes.push(`🛡️ Baggage secured. Loyalty rises (+5).`);
	}

	log(run, `Assigned ${c.npc.name} to ${TASK_INFO[task].name.toLowerCase()}: ${text}`);
	return { text, notes };
}

/** Check if any companion's baggage triggers a special travel card */
export function companionBaggageCard(run: Run, rng: Rng, force = false): Card | null {
	if (run.crew.length === 0) return null;

	// 1. Bandit / Thief baggage: Revenge suitors / Bounty hunters
	const outlawCrew = run.crew.find((c) => c.role === 'thief' || c.traits?.includes('outlaw') || c.npc.role === 'bandit');
	if (outlawCrew && !run.flags['baggage_seen:' + outlawCrew.id] && (force || rng.chance(0.35))) {
		run.flags['baggage_seen:' + outlawCrew.id] = true;
		return {
			id: `baggage-outlaw-${outlawCrew.id}`,
			badge: 'Companion’s Past',
			npc: {
				name: 'Captain Zhang of the Iron Sash',
				title: 'Bounty Hunter',
				culture: outlawCrew.npc.culture,
				gender: 'm',
				role: 'soldier',
				seed: rng.int(1, 1e9)
			},
			text: `Three armed horsemen bar the road! Their captain points a spear at ${outlawCrew.npc.name}: "We have tracked this thief across three provinces! Surrender the fugitive and their plunder, or pay their blood price in silver!"`,
			left: {
				label: `Stand by ${outlawCrew.npc.name} and draw weapons`,
				fx: { vigor: -6 },
				gamble: {
					p: 0.6,
					win: { fx: { renown: 10 }, text: `Together with ${outlawCrew.npc.name}, you drive off the bounty hunters in disgrace!` },
					lose: { fx: { vigor: -12, silver: -10 }, text: `A bloody clash! You escape, but not without cuts and lost silver.` }
				},
				loyalty: 15
			},
			right: {
				label: 'Bribe them to look the other way',
				fx: { silver: -15, renown: -2 },
				loyalty: 5,
				text: 'You toss a pouch of silver. The bounty hunters weigh the coins and ride off with a sneer.'
			},
			up: {
				label: `${outlawCrew.npc.name}: Spring a prepared trap`,
				fx: { renown: 8 },
				text: `${outlawCrew.npc.name} whistle-signals a hail of smoke pellets and caltrops, leaving the pursuers coughing in the dust!`
			}
		};
	}

	// 2. Noble / Ward / Heir baggage: Royal Entourage / Kidnappers
	const nobleCrew = run.crew.find((c) => c.role === 'ward' || c.role === 'heir' || c.traits?.includes('noble'));
	if (nobleCrew && !run.flags['baggage_seen:' + nobleCrew.id] && (force || rng.chance(0.35))) {
		run.flags['baggage_seen:' + nobleCrew.id] = true;
		return {
			id: `baggage-noble-${nobleCrew.id}`,
			badge: 'Noble Baggage',
			npc: {
				name: 'Lord Regent’s Envoy',
				title: 'Emissary of the High Court',
				culture: nobleCrew.npc.culture,
				gender: 'm',
				role: 'noble',
				seed: rng.int(1, 1e9)
			},
			text: `A gilded carriage with silk banners overtakes your caravan. An envoy bows deeply toward ${nobleCrew.npc.name}: "The royal family has longed for your return, Highness. A feast and thirty guards await at the next fortress."`,
			left: {
				label: 'Accept the royal banquet with honored dignity',
				fx: { renown: 12, silver: 15 },
				standing: 15,
				loyalty: 8,
				text: 'You are received as honored guardians at the princely fortress, showered with hospitality and gifts.'
			},
			right: {
				label: 'Decline politely: "Our commission permits no detour"',
				fx: { vigor: 4 },
				loyalty: 10,
				text: `${nobleCrew.npc.name} nods in agreement: "My word was given to this traveller." You ride on uninterrupted.`
			}
		};
	}

	// 3. Hero / Bodyguard baggage: Wandering Duelist
	const heroCrew = run.crew.find((c) => c.role === 'bodyguard' || c.traits?.includes('hero'));
	if (heroCrew && !run.flags['baggage_seen:' + heroCrew.id] && (force || rng.chance(0.35))) {
		run.flags['baggage_seen:' + heroCrew.id] = true;
		return {
			id: `baggage-hero-${heroCrew.id}`,
			badge: 'Challenge of Honor',
			npc: {
				name: 'Master Blade of the Four Seas',
				title: 'Wandering Champion',
				culture: heroCrew.npc.culture,
				gender: 'm',
				role: 'hero',
				seed: rng.int(1, 1e9)
			},
			text: `A lone swordsman stands atop a milestone marker, blade resting upon their shoulder: "I have traveled five hundred li to test my steel against ${heroCrew.npc.name}!"`,
			left: {
				label: `Cheer on ${heroCrew.npc.name} in single combat`,
				fx: { renown: 10 },
				loyalty: 12,
				gamble: {
					p: 0.65,
					win: { fx: { renown: 15 }, text: `${heroCrew.npc.name} executes a flawless counterstrike! The rival bows in reverence.` },
					lose: { fx: { vigor: -6 }, text: `A fierce duel ends in an honorable draw, both warriors panting with mutual respect.` }
				}
			},
			right: {
				label: 'Step between them and propose a drinking wager',
				fx: { silver: -4, vigor: 4 },
				karma: 5,
				text: 'You open a jar of aged spirits. The tension melts into roaring laughter and martial tales around the campfire.'
			}
		};
	}

	return null;
}
