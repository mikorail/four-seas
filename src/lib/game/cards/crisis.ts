import type { Card, Run } from '../types';
import { capOf } from '../mods';
import type { Stat } from '#lib/data/traits';
import { CITY, cityName } from '#lib/data/world';
import { CULTURES, makeName } from '#lib/data/cultures';
import { Rng } from '#lib/rng';

export type CrisisKind =
	| 'silver-low'
	| 'silver-high'
	| 'vigor-low'
	| 'vigor-high'
	| 'renown-low'
	| 'renown-high'
	| 'fortune-low'
	| 'fortune-high'
	| 'mind-low';

export function isCrisis(run: Run): CrisisKind | null {
	// how forgiving fate is: gentle modes save you once per stat, Rōnin once per journey, Legend never
	if (run.difficulty === 'legend') return null;
	if (run.difficulty === 'ronin' && Object.keys(run.flags).some((k) => k.startsWith('brink_used:'))) return null;
	for (const s of ['silver', 'vigor', 'renown', 'fortune'] as Stat[]) {
		const v = run.stats[s];
		if (v <= 0 && !run.flags[`brink_used:${s}-low`]) {
			return `${s}-low` as CrisisKind;
		}
		if (v >= capOf(run, s) && !run.flags[`brink_used:${s}-high`]) {
			return `${s}-high` as CrisisKind;
		}
	}
	return null;
}

export function buildCrisisCard(run: Run, kind: CrisisKind): Card {
	const here = cityName(CITY[run.location], run.year);
	const cCulture = CITY[run.location].culture;
	const lover = run.crew.find((c) => c.role === 'companion');
	const bodyguard = run.crew.find((c) => c.role === 'bodyguard');
	const healer = run.crew.find((c) => c.role === 'healer');
	const thief = run.crew.find((c) => c.role === 'thief');
	const local = (g: 'm' | 'f', seed: number) => makeName(new Rng(seed + run.day), CULTURES[cCulture], g);
	const guide = run.crew.find((c) => c.role === 'guide');

	switch (kind) {
		case 'silver-low': {
			return {
				id: 'crisis-silver-low',
				badge: 'Brink of Ruin',
				npc: {
					name: local('m', 70101),
					title: 'Creditor of the Broken',
					culture: cCulture,
					gender: 'm',
					role: 'official',
					seed: 70101
				},
				text: `In ${here}, you reach the bottom of your purse. Not a copper remains. Bailiffs corner you in a damp alleyway: "Every debt is paid in coin, in blood, or in a debtor’s cage."`,
				left: {
					label: 'Shake it off: Pawn your honor',
					fx: { silver: 25, renown: -8 },
					statusAdd: ['indebted'],
					setFlag: { 'brink_used:silver-low': true },
					text: 'You sign an indentured pledge. Bitter bread, but you walk away alive and with 25 silver in your purse.'
				},
				right: {
					label: 'Nah: Surrender to the debtor’s pit',
					fx: {},
					setFlag: { end: 'stat-silver-low' },
					text: 'You sit against the damp wall and let the iron chains close. The journey is over.'
				},
				up: thief
					? {
							label: `${thief.npc.name}: Cut the bailiff's purse`,
							fx: { silver: 28 },
							setFlag: { 'brink_used:silver-low': true },
							text: `${thief.npc.name} creates a chaotic diversion and slips a fat purse into your pocket.`
						}
					: undefined
			};
		}

		case 'silver-high': {
			return {
				id: 'crisis-silver-high',
				badge: 'Brink of Excess',
				npc: {
					name: local('m', 70102),
					title: 'King of the Alleys',
					culture: cCulture,
					gender: 'm',
					role: 'bandit',
					seed: 70102
				},
				text: `Your purse is so heavy with silver that word has reached the cutthroats of ${here}. In a narrow street, eight men step from the shadows with naked blades. "Leave the gold, or leave your throat."`,
				left: {
					label: 'Shake it off: Scatter the coin',
					fx: { silver: -35, renown: 6 },
					karma: 15,
					setFlag: { 'brink_used:silver-high': true },
					text: 'You rip open the money-bags and fling silver into the crowd! The cutthroats scramble for coins, and you slip away free.'
				},
				right: {
					label: 'Nah: Clutch the gold to the death',
					fx: {},
					setFlag: { end: 'stat-silver-high' },
					text: 'You refuse to surrender a single coin. The blades descend.'
				},
				up: bodyguard
					? {
							label: `${bodyguard.npc.name}: Hold the narrow passage`,
							fx: { silver: -15, vigor: -6 },
							setFlag: { 'brink_used:silver-high': true },
							text: `${bodyguard.npc.name} draws steel with a roar and drives the gang back into the shadows.`
						}
					: undefined
			};
		}

		case 'vigor-low': {
			return {
				id: 'crisis-vigor-low',
				badge: 'Death’s Door',
				npc: {
					name: 'The Ferryman',
					title: 'Shadow across the Waters',
					culture: cCulture,
					gender: 'm',
					role: 'ghost',
					seed: 70103
				},
				text: `Your vision blackens. The road dissolves beneath your boots in ${here}. A cold mist gathers, and you see the dark river of the ancestors. The oarsman waits.`,
				left: {
					label: 'Shake it off: Bite your tongue and claw back',
					fx: { vigor: 25 },
					statusAdd: ['scarred'],
					setFlag: { 'brink_used:vigor-low': true },
					text: 'You bite your tongue until warm blood fills your mouth. You gasp, drag yourself from the ditch, and crawl toward shelter.'
				},
				right: {
					label: 'Nah: Step into the boat',
					fx: {},
					setFlag: { end: 'stat-vigor-low' },
					text: 'You close your eyes and let the warmth drain from your limbs.'
				},
				up: healer
					? {
							label: `${healer.npc.name}: Emergency resuscitation`,
							fx: { vigor: 35 },
							setFlag: { 'brink_used:vigor-low': true },
							text: `${healer.npc.name} burns moxa herbs and pours a bitter restorative down your throat, wrenching you back to life!`
						}
					: undefined
			};
		}

		case 'vigor-high': {
			return {
				id: 'crisis-vigor-high',
				badge: 'Reckless Mania',
				npc: {
					name: 'The Inner Demon',
					title: 'Whisper of Invincibility',
					culture: cCulture,
					gender: 'f',
					role: 'spirit',
					seed: 70104
				},
				text: `Your blood is boiling with invincible madness in ${here}. You feel you could strangle a tiger with your bare hands, jump off a watchtower, or fight an entire garrison alone.`,
				left: {
					label: 'Shake it off: Douse the blood-fever',
					fx: { vigor: -30 },
					setFlag: { 'brink_used:vigor-high': true },
					text: 'You plunge your head into a trough of icy well-water and sit in breathless contemplation until sanity returns.'
				},
				right: {
					label: 'Nah: Charge into glory',
					fx: {},
					setFlag: { end: 'stat-vigor-high' },
					text: 'You laugh into the sky and leap into a hopeless brawl. It is glorious, and brief.'
				},
				up: lover
					? {
							label: `${lover.npc.name}: Bring you back to earth`,
							fx: { vigor: -25 },
							setFlag: { 'brink_used:vigor-high': true },
							text: `${lover.npc.name} slaps your cheek with force, then holds your hands firmly until the fever leaves your eyes.`
						}
					: undefined
			};
		}

		case 'renown-low': {
			return {
				id: 'crisis-renown-low',
				badge: 'Total Disgrace',
				npc: {
					name: 'Town Crier of the Gate',
					title: 'Herald of Mockery',
					culture: cCulture,
					gender: 'm',
					role: 'performer',
					seed: 70105
				},
				text: `In ${here}, children throw rotten fruit at your boots. Songs mock your failures in every tavern. The gate guards laugh and spit as you pass. No honorable household will open its door.`,
				left: {
					label: 'Shake it off: Don a beggar’s cowl',
					fx: { renown: 25, silver: -6 },
					statusAdd: ['outcast'],
					setFlag: { 'brink_used:renown-low': true },
					text: 'You swallow your pride, pull a coarse cowl over your head, and slip quietly through the back lanes to begin anew.'
				},
				right: {
					label: 'Nah: Hang your head in shame',
					fx: {},
					setFlag: { end: 'stat-renown-low' },
					text: 'You turn away from the city and wander into forgotten obscurity.'
				},
				up: guide
					? {
							label: `${guide.npc.name}: Smuggle you into a secluded sanctuary`,
							fx: { renown: 28 },
							setFlag: { 'brink_used:renown-low': true },
							text: `${guide.npc.name} leads you through forgotten postern gates to a quiet sanctuary where no mockery reaches.`
						}
					: undefined
			};
		}

		case 'renown-high': {
			return {
				id: 'crisis-renown-high',
				badge: 'Gilded Cage',
				npc: {
					name: 'Imperial Herald',
					title: 'Envoy of the Throne',
					culture: cCulture,
					gender: 'm',
					role: 'noble',
					seed: 70106
				},
				text: `Your fame has outgrown mortals in ${here}. An escort of fifty armored guards surrounds your tavern: "The Sovereign decrees that such a living legend shall never leave our court again."`,
				left: {
					label: 'Shake it off: Slip out in a laundry cart',
					fx: { renown: -30, silver: -10 },
					setFlag: { 'brink_used:renown-high': true },
					text: 'You grease the palm of the scullery maid and escape hidden beneath dirty linen in the dead of night!'
				},
				right: {
					label: 'Nah: Accept the golden chains',
					fx: {},
					setFlag: { end: 'stat-renown-high' },
					text: 'You bow to the herald and don the golden collar of a royal captive.'
				},
				up: thief
					? {
							label: `${thief.npc.name}: Rooftop escape route`,
							fx: { renown: -25 },
							setFlag: { 'brink_used:renown-high': true },
							text: `${thief.npc.name} leads you across the tiled roofs into the mist, vanishing from the court’s grasp.`
						}
					: undefined
			};
		}

		case 'fortune-low': {
			return {
				id: 'crisis-fortune-low',
				badge: 'Calamity',
				npc: {
					name: 'The Unseen Hand',
					title: 'Wrath of the Heavens',
					culture: cCulture,
					gender: 'f',
					role: 'spirit',
					seed: 70107
				},
				text: `Heaven turns its back upon you in ${here}. A sudden lightning bolt cracks a pagoda tower above you; tons of timber and ceramic roof tiles rush downward directly toward your head.`,
				left: {
					label: 'Shake it off: Dive into the gutter',
					fx: { fortune: 25, vigor: -10 },
					statusAdd: ['scarred'],
					setFlag: { 'brink_used:fortune-low': true },
					text: 'You throw yourself headlong into a stone drainage ditch! Shards of tiles shatter around you, but you crawl out bruised and alive.'
				},
				right: {
					label: 'Nah: Stand frozen beneath the fall',
					fx: {},
					setFlag: { end: 'stat-fortune-low' },
					text: 'Fate has decreed your hour. You do not move.'
				},
				up: bodyguard
					? {
							label: `${bodyguard.npc.name}: Shove you clear`,
							fx: { fortune: 28 },
							setFlag: { 'brink_used:fortune-low': true },
							text: `${bodyguard.npc.name} violently shoves you clear of the falling masonry, diving behind you just in time!`
						}
					: undefined
			};
		}

		case 'fortune-high': {
			return {
				id: 'crisis-fortune-high',
				badge: 'Living Saint',
				npc: {
					name: 'Fanatical Cult Elder',
					title: 'Zealot of the Miracles',
					culture: cCulture,
					gender: 'm',
					role: 'monk',
					seed: 70108
				},
				text: `Miracles follow your footsteps in ${here}. A crowd of thousands falls to their knees in weeping reverence, building a stone wall around you: "A god walks among us! You shall remain on this altar forever!"`,
				left: {
					label: 'Shake it off: Commit a calculated blasphemy',
					fx: { fortune: -30, renown: -10 },
					setFlag: { 'brink_used:fortune-high': true },
					text: 'You deliberately knock over their sacred offering table and curse loudly! The crowd recoils in horror, and you dash through the gap!'
				},
				right: {
					label: 'Nah: Ascend the golden pedestal',
					fx: {},
					setFlag: { end: 'stat-fortune-high' },
					text: 'You sit down upon the stone altar and allow them to brick you into the shrine.'
				},
				up: guide
					? {
							label: `${guide.npc.name}: Incite a diversionary rumor`,
							fx: { fortune: -25 },
							setFlag: { 'brink_used:fortune-high': true },
							text: `${guide.npc.name} shouts that a second avatar has appeared at the west gate, drawing the mob away.`
						}
					: undefined
			};
		}

		case 'mind-low': {
			return {
				id: 'crisis-mind-low',
				badge: 'Mind’s Collapse',
				npc: {
					name: 'The Void',
					title: 'Echo of the Forgotten',
					culture: cCulture,
					gender: 'f',
					role: 'spirit',
					seed: 70109
				},
				text: `Your mind fractures in ${here}. You forget who you are, what language you speak, and why you are carrying this heavy pack. The world dissolves into grey static and distant chanting.`,
				left: {
					label: 'Shake it off: Cling to your home and motto',
					fx: {},
					setFlag: { 'brink_used:mind-low': true },
					text: `You clutch your chest and repeat your motto aloud: "${run.hero.motto}" Warm tears spring to your eyes; the world solidifies once more.`
				},
				right: {
					label: 'Nah: Drift into the dream',
					fx: {},
					setFlag: { end: 'stat-mind-low' },
					text: 'You let go of the thread of memory and sit down by the roadside to talk to the shadows.'
				},
				up: lover
					? {
							label: `${lover.npc.name}: Call your true name`,
							fx: {},
							setFlag: { 'brink_used:mind-low': true },
							text: `${lover.npc.name} embraces you tightly, whispering memories of your journey until clarity returns.`
						}
					: undefined
			};
		}
	}
}
