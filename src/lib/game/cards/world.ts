import { CITY, cityName } from '#lib/data/world';
import { isWarZone, omenAt, plagueAt, typhoonAt, warFor } from '../events';
import { carrying, ch, has, inCulture, npc, odds, place, up, withCrew, type Template } from './helpers';

export const WORLD_T: Template[] = [
	{
		id: 'plague-here',
		where: 'city',
		weight: (c) => (plagueAt(c.run, c.city.id) ? 14 : 0),
		make: (c) => {
			const e = plagueAt(c.run, c.city.id)!;
			const n = npc(c, 'healer', { title: 'Plague doctor' });
			return {
				id: 'plague-here',
				npc: n,
				badge: e.label,
				text: `**${e.label}** grips ${place(c)}. Carts of the dead rattle through the streets at dawn, and ${n.name} wears a mask stuffed with herbs. "Help me in the sick-houses, or leave while you still can."`,
				left: ch('Leave at once', {}, { gamble: { p: odds(c, 0.6, ['illness']), win: { fx: { vigor: -2 }, text: 'You slip out through the quarantine gate, healthy.' }, lose: { fx: { vigor: -18 }, statusAdd: ['miasma-lung'], text: 'Too late. The fever takes root in your chest.' } } }),
				right: ch('Nurse the sick', { vigor: -10, renown: 10 }, { tags: ['mercy', 'illness'], days: 2, karma: 6, faction: { faith: 15 }, text: 'You lose count of the faces. Some of them live because of you.' }),
				up: carrying(c, 'medicine')
					? up('Medicine chest', 'Distribute your medicine in the sick wards', { renown: 18, fortune: 10 }, { tags: ['mercy'], itemRemove: ['medicine'], statusAdd: ['blessed-hands'], karma: 12, faction: { faith: 25, guild: 10 }, text: 'Bitter roots and clean bandages save scores of dying folk. The healers revere your blessed hands.' })
					: withCrew(c, 'healer')
					? up('Physician', 'Lend your physician to the city', { renown: 14 }, { tags: ['mercy'], loyalty: 8, days: 2, statusAdd: ['blessed-hands'], faction: { faith: 20 }, text: 'Your physician works three days without sleep — and together you stem the epidemic.' })
					: undefined
			};
		}
	},
	{
		id: 'war-here',
		where: 'city',
		weight: (c) => (warFor(c.run, c.city.culture) || isWarZone(c.run, c.city.id) ? 8 : 0),
		make: (c) => {
			const w = warFor(c.run, c.city.culture) ?? (c.run.world ?? []).find((x) => x.kind === 'war') ?? { label: 'Border War' };
			const kind = c.rng.pick(['conscript', 'refugees', 'blockade', 'checkpoint'] as const);
			if (kind === 'conscript') {
				const n = npc(c, 'soldier', { title: 'Recruiting officer' });
				return {
					id: 'war-here',
					npc: n,
					badge: w.label,
					text: `**${w.label}**. ${n.name} is pressing every able-bodied traveller into service. "You look strong. The army feeds its men — mostly."`,
					left: ch('Bribe your way out', { silver: -12 }, { tags: ['bribe'], faction: { crown: 5 } }),
					right: ch('Serve through the siege', { vigor: -12, renown: 15, silver: 12 }, { tags: ['fight', 'loyal'], days: 10, standing: 15, traitAdd: ['battle-hardened'], statusAdd: ['battle-scarred'], faction: { mercenary: 25, crown: 15 }, text: 'Ten days of drills and one desperate dawn counter-attack leave you bloodied but battle-hardened.' })
				};
			}
			if (kind === 'refugees') {
				const n = npc(c, 'elder', { title: 'Refugee' });
				return {
					id: 'war-here',
					npc: n,
					badge: w.label,
					text: `The road into ${place(c)} is choked with families fleeing **${w.label.toLowerCase()}**. ${n.name} holds out an empty bowl and a sleeping grandchild. Prices for bread have tripled.`,
					left: ch('Push through the crowd', {}, { tags: ['cruel'], karma: -6, faction: { outlaw: -5 } }),
					right: ch('Share your supplies and silver', { silver: -8, vigor: -4 }, { tags: ['mercy'], karma: 10, faction: { faith: 15, outlaw: 15 }, text: 'The child wakes up, drinks warm broth, and smiles. The village elders pray for your safe passage.' })
				};
			}
			if (kind === 'checkpoint') {
				const n = npc(c, 'soldier', { title: 'Garrison Inquisitor' });
				return {
					id: 'war-here',
					npc: n,
					badge: w.label,
					text: `Wartime curfew in ${place(c)}. ${n.name} bars the barricade with lowered spears. "No goods or travellers pass without royal clearances or proof of trade allegiance."`,
					left: ch('Slip gold into his gauntlet', { silver: -10 }, { tags: ['bribe'], faction: { crown: 5, outlaw: 10 }, text: 'The spears part. A knowing nod sends you into the side alleys.' }),
					right: ch('Fight through the vanguard', { vigor: -8 }, {
						tags: ['fight'],
						heat: 15,
						faction: { outlaw: 20, crown: -25 },
						gamble: {
							p: odds(c, 0.55, ['fight']),
							win: { fx: { renown: 14 }, traitAdd: ['battle-hardened'], text: 'Your steel shatters their pike shafts; you slip into the maze of warehouses free.' },
							lose: { fx: { vigor: -14, silver: -10 }, statusAdd: ['one-eyed'], text: 'A crossbow bolt grazes your eye in the melee; you barely crawl away through the sewers.' }
						}
					}),
					up: carrying(c, 'papers')
						? up('Travel papers', 'Present royal seals and safe-conduct passes', { renown: 10, fortune: 8 }, { tags: ['official'], statusAdd: ['oath-keeper'], faction: { crown: 25 }, text: 'The inquisitor snaps to attention and salutes your royal seals.' })
						: undefined
				};
			}
			const n = npc(c, 'sailor', { title: 'Blockade runner' });
			return {
				id: 'war-here',
				npc: n,
				badge: w.label,
				text: `With **${w.label.toLowerCase()}** raging, ${n.name} runs grain and medicine past the military cordon. "Prices have doubled across the frontier. Back my skiff and we split the gold."`,
				left: ch('Too risky during wartime', {}),
				right: ch('Back the smuggling run', {}, { tags: ['crime', 'trade'], heat: 12, faction: { outlaw: 25, crown: -15, guild: 15 }, gamble: { p: odds(c, 0.52, ['crime', 'sea']), win: { fx: { silver: 32, renown: 8 }, traitAdd: ['haggler'], text: 'The muffled oars glide silently past the iron gunboats. An immense windfall.' }, lose: { fx: { silver: -12, vigor: -6 }, text: 'Spotted by a naval cutter. You dive into the breakers as the cargo burns.' } } })
			};
		}
	},
	{
		id: 'temple-enlightenment',
		where: 'city',
		weight: (c) => (c.run.karma >= 25 && !c.run.statuses?.includes('enlightened') && c.rng.chance(0.35) ? 6 : 0),
		make: (c) => {
			const n = npc(c, 'monk', { title: 'Hermit Sage' });
			return {
				id: 'temple-enlightenment',
				npc: n,
				badge: 'Spiritual Awakening',
				text: `In a secluded bamboo grove behind the temple in ${place(c)}, the venerable hermit ${n.name} sits before a still reflecting pool. "You carry heavy burdens across the four seas. Are you ready to put down the illusion of fame and silver?"`,
				left: ch('Bow politely and return to the road', { fortune: 4 }, { tags: ['rest'] }),
				right: ch('Meditate through the night and give away excess coins', { silver: -15, renown: -8, fortune: 18 }, {
					tags: ['faith', 'rest'],
					days: 3,
					karma: 15,
					statusAdd: ['enlightened'],
					traitAdd: ['ascetic'],
					faction: { faith: 35 },
					text: 'The silence of the dawn water mirrors your mind. The fever of ambition departs; you rise with an enlightened soul.'
				})
			};
		}
	},
	{
		id: 'typhoon-here',
		where: 'city',
		weight: (c) => (c.city.port && typhoonAt(c.run, c.city.id) ? 10 : 0),
		make: (c) => {
			const e = typhoonAt(c.run, c.city.id)!;
			const n = npc(c, 'captain', { title: 'Harbour master' });
			return {
				id: 'typhoon-here',
				npc: n,
				badge: e.label,
				text: `**${e.label}** is battering ${place(c)}. Roofs fly, junks drag their anchors, and ${n.name} has closed the port. "Nobody sails until the wind drops."`,
				left: ch('Wait it out ashore', { vigor: 4 }, { days: 3, text: 'Three days of howling wind and card games by lamplight.' }),
				right: ch('Help save the ships in the harbour', { vigor: -10, renown: 12 }, { tags: ['mercy'], days: 2, karma: 8, faction: { mercenary: 15, guild: 15 }, text: 'Ropes, rain and shouting. You save two junks and a merchant factor who thanks you with hearty loyalty.' })
			};
		}
	},
	{
		id: 'omen-comet',
		where: 'any',
		weight: (c) => (omenAt(c.run, c.city.id)?.data?.omenType === 'comet' ? 12 : 0),
		make: (c) => {
			const n = npc(c, 'scholar', { title: 'Court Astronomer' });
			return {
				id: 'omen-comet',
				npc: n,
				badge: 'The Great Broom Star',
				text: `A colossal silver comet blazes across the night heavens above ${place(c)}! The populace trembles, whispered rumors of fallen empires spread, and court guards desert their posts in dread.`,
				left: ch('Join monks in fasting, prayer, and alms', { silver: -4, fortune: 16 }, { tags: ['faith', 'mercy'], karma: 12, faction: { faith: 20 }, text: 'Prostrating in the temple courtyards, your humble prayers soothe the panicked crowds.' }),
				right: ch('Exploit the panic to slip through gates and tolls', { silver: 15 }, { heat: -20, tags: ['crime'], faction: { outlaw: 15, crown: -10 }, text: 'While the guards gape at the sky, you slip through the city barriers completely unchallenged.' }),
				up: carrying(c, 'telescope') || has(c, 'stargazer') || has(c, 'scholar')
					? up('Telescope / Stargazer', 'Chart the comet’s celestial path and calm the court', { silver: 14, renown: 22, fortune: 16 }, { statusAdd: ['enlightened'], faction: { crown: 25 }, text: 'You present precise mathematical charts to the governor, proving the star is a natural marvel. The court showers you with silver and honor!' })
					: undefined
			};
		}
	},
	{
		id: 'omen-red-tide',
		where: 'travel',
		modes: ['sea'],
		weight: (c) => (omenAt(c.run, c.city.id)?.data?.omenType === 'red-tide' ? 14 : 0),
		make: (c) => {
			const n = npc(c, 'captain', { title: 'Ghost-Sea Helmsman' });
			return {
				id: 'omen-red-tide',
				npc: n,
				badge: 'Phosphorescent Red Tide',
				text: `The ocean glows with spectral emerald fire! The waters are thick and rust-colored by day, blazing like a sea of phantoms by night. The sailors drop their oars in terror of sea dragons.`,
				left: ch('Pour bowls of rice-wine and incense into the glowing surf', { silver: -3, fortune: 14 }, { tags: ['faith'], loyalty: 8, text: 'Fragrant wine and incense appease the sea spirits; the crew rallies to the halyards.' }),
				right: ch('Seize the helm and steer through by compass alone', { renown: 14, vigor: -6 }, { tags: ['sea'], loyalty: 6, text: 'Your unflinching command cuts through their superstitious dread. The ship plunges safely through the eerie glow.' }),
				up: carrying(c, 'dragon-scale') || carrying(c, 'naga-pearl')
					? up('Dragon scale / Naga pearl', 'Raise the sea relic over the shining prow', { fortune: 25, renown: 16 }, { statusAdd: ['blessed-hands'], text: 'The emerald glow coalesces into a luminous path guiding your keel. The sailors revere you as a living sea master!' })
					: undefined
			};
		}
	},
	{
		id: 'omen-eclipse',
		where: 'any',
		weight: (c) => (omenAt(c.run, c.city.id)?.data?.omenType === 'eclipse' ? 14 : 0),
		make: (c) => {
			const n = npc(c, 'elder', { title: 'Temple Herald' });
			const p = odds(c, 0.55, ['crime']);
			return {
				id: 'omen-eclipse',
				npc: n,
				badge: 'Solar Eclipse',
				text: `At high noon, the sun is devoured by blackness! A blinding ring of silver fire crowns the sky over ${place(c)}. Bronze gongs, drums, and weeping crowds fill the streets to drive off the dragon.`,
				left: ch('Beat bronze gongs and chant with the terrified populace', { fortune: 14, vigor: 4 }, { karma: 10, faction: { faith: 15 }, text: 'As the drums reach fever pitch, the sun re-emerges! The crowd weeps with joy.' }),
				right: ch('Ransack an abandoned magistrate storehouse during the chaos', {}, { tags: ['crime'], gamble: { p, win: { fx: { silver: 28, renown: 4 }, itemAdd: ['curio-lacquer-box'], text: 'Under cover of midday darkness, you slip away laden with rare tax goods.' }, lose: { fx: { vigor: -12 }, heat: 25, text: 'Torchlight suddenly flares as the sun returns! You scramble over tile walls, bruised.' } } }),
				up: has(c, 'scholar') || carrying(c, 'chronometer')
					? up('Chronometer / Scholar', 'Predict the exact minute of the sun’s return', { renown: 25, fortune: 18 }, { statusAdd: ['enlightened'], faction: { crown: 20 }, text: 'You raise your hand and count the seconds. As the sunlight blazes back, the populace bows before your profound astronomical learning!' })
					: undefined
			};
		}
	},
	{
		id: 'omen-aurora',
		where: 'any',
		weight: (c) => (omenAt(c.run, c.city.id)?.data?.omenType === 'aurora' ? 12 : 0),
		make: (c) => {
			const n = npc(c, 'monk', { title: 'Steppe Shaman' });
			return {
				id: 'omen-aurora',
				npc: n,
				badge: 'Altai Sky-Fire',
				text: `Vast shimmering curtains of violet, emerald, and crimson flame dance across the northern mountain sky! Snow peaks glow like jade under the silent, rippling celestial fire.`,
				left: ch('Bask in the silent cosmic radiance', { vigor: 18, fortune: 18 }, { statusAdd: ['enlightened'], text: 'A stillness deeper than the earth fills your chest. The beauty of the heavens heals all road exhaustion.' }),
				right: ch('March through the passes while the night is bright as day', { renown: 6, vigor: -4 }, { days: -2, text: 'Lit by the emerald heavens, your caravan marches through the mountain defile without need of lanterns.' })
			};
		}
	},
	{
		id: 'cryptid-qilin',
		where: 'any',
		weight: (c) => (c.run.karma >= 25 && !c.run.statuses?.includes('blessed-hands') && c.rng.chance(0.28) ? 5 : 0),
		make: (c) => {
			const n = npc(c, 'spirit', { title: 'Avatar of Benevolence' });
			return {
				id: 'cryptid-qilin',
				npc: n,
				badge: 'Sacred Encounter',
				text: `In a secluded bamboo grove drenched in morning dew, a creature of legend steps soundlessly from the mist: the scaled body of a jade stag, hooves of an ox, and a single benevolent horn. It walks upon the grass without crushing a single blade.`,
				left: ch('Prostrate yourself in humility before the benevolent beast', { fortune: 25, vigor: 18 }, { statusAdd: ['blessed-hands'], karma: 15, text: 'The Qilin breathes warm mist upon your brow. An aura of sacred healing enters your hands.' }),
				right: ch('Offer wild sweet pears and fragrant mountain moss', { fortune: 20 }, { karma: 20, statusAdd: ['enlightened'], text: 'The beast accepts the fruit gently from your palm, nods once, and vanishes into the bamboo.' })
			};
		}
	},
	{
		id: 'cryptid-baku',
		where: 'city',
		weight: (c) => (inCulture(c, 'japanese', 'korean') && (c.run.statuses?.includes('miasma-lung') || c.run.stats.vigor <= 40) && c.rng.chance(0.3) ? 5 : 0),
		make: (c) => {
			const n = npc(c, 'spirit', { title: 'Dream Eater' });
			return {
				id: 'cryptid-baku',
				npc: n,
				badge: 'Spectral Visit',
				text: `In the shadowed cedar rafters of an ancient mountain temple, a strange chimera with the trunk of an elephant, eyes of a rhinoceros, and paws of a tiger gazes down with gentle golden eyes. It is the Baku, feeder on nightmares and mental anguish.`,
				left: ch('Whisper your darkest nightmares and road traumas into the shadow', { vigor: 22, fortune: 16 }, { statusRemove: ['miasma-lung'], heat: -15, text: 'The Baku inhales the dark vapor of your nightmares. Delirium and dread vanish; your sleep is deep and untroubled.' }),
				right: ch('Leave sweet honey-rice cakes upon a cedar shingle', { fortune: 14, vigor: 10 }, { karma: 8, text: 'A soft chuff of pleasure echoes from the rafters. You awaken revitalized.' })
			};
		}
	},
	{
		id: 'cryptid-umibozu',
		where: 'travel',
		modes: ['sea'],
		weight: (c) => (inCulture(c, 'japanese', 'korean', 'han') && c.rng.chance(0.25) ? 4 : 0),
		make: (c) => {
			const n = npc(c, 'spirit', { title: 'Giant Sea Monk' });
			const p = odds(c, 0.45, ['sea', 'fight']);
			return {
				id: 'cryptid-umibozu',
				npc: n,
				badge: 'Terror of the Deeps',
				text: `A colossal, pitch-black bald head rises fifty feet out of the boiling sea swells! Blank, hollow eyes stare down upon your tossing junk. A deep rumbling voice shakes the timbers, demanding your cargo.`,
				left: ch('Toss a bottomless wooden saké barrel into the foam', { silver: -4, fortune: 16 }, { days: 1, text: 'The sea giant attempts to scoop water with the bottomless cask, baffled. Your ship slips away into the squall!' }),
				right: ch('Stand upon the bowsprit and roar a defiance against the titan', {}, { gamble: { p, win: { fx: { renown: 22, fortune: 12 }, loyalty: 10, text: 'Your ferocious warrior roar echoes off the waves! Intrigued by your fearlessness, the titan sinks back into the depths.' }, lose: { fx: { vigor: -20, silver: -10 }, mountHurt: 30, text: 'A mountain of black water crashes across the deck, smashing crates and drenching everything.' } } }),
				up: carrying(c, 'koxinga-flag') || carrying(c, 'hang-tuah-kris')
					? up('Legendary maritime relic', 'Brandish your sacred naval relic against the darkness', { renown: 25, fortune: 20 }, { loyalty: 10, text: 'The relic blazes with spectral light! The Umibozu bows its titan head into the waves and submerges, leaving calm seas.' })
					: undefined
			};
		}
	}
];
