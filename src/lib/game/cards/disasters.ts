// Catastrophes that hit a city and its neighbours: what you see, what you can do, and what the ruins reveal.
import { CITY, cityName } from '#lib/data/world';
import { DISASTERS, deathAt, disasterAt, type DisasterKind } from '../events';
import type { CultureId } from '#lib/data/cultures';
import { carrying, ch, dressed, has, hint, isForeigner, nearSecret, npc, odds, place, up, withCrew, type Ctx, type Template } from './helpers';

const here = (c: Ctx) => disasterAt(c.run, c.city.id);

const SCENE: Record<DisasterKind, { severe: string; nearby: string; dig: string; ruin: string }> = {
	earthquake: { severe: 'Half the city lies in rubble. People sleep in the squares, afraid of their own roofs; every aftershock sets the dogs howling.', nearby: 'Cracks run up the walls and the well water has turned muddy. Refugees from the shaken city arrive every hour.', dig: 'dig through the rubble where someone is still knocking', ruin: 'The quake split the hillside behind the city and opened a passage no one has walked in centuries.' },
	flood: { severe: 'The river is in the streets. Coffins float past the temple steps; families sit on their roofs with their chickens.', nearby: 'Brown water stands in every field. The roads are causeways of mud, and the ferrymen name their own prices.', dig: 'wade out with a boat-hook to pull people from the current', ruin: 'The flood scoured away a riverbank and exposed stone steps leading down — an old canal lock, sealed for a dynasty.' },
	fire: { severe: 'Whole wards are ash. Firemen with hooks pull down houses to make breaks; the smoke hides the sun.', nearby: 'Ash drifts in from the burning city. Merchants are hiding their goods in wells.', dig: 'join the bucket line and pull down the burning houses', ruin: 'Under a burnt-out warehouse, the fire revealed a cellar — and a smugglers’ map scratched on its wall.' },
	storm: { severe: 'Ships lie on the quays like dead whales. The harbour is a forest of broken masts.', nearby: 'The storm has passed, but every roof is missing tiles and the boats are still coming back in pieces.', dig: 'help haul the wrecked boats and the half-drowned sailors ashore', ruin: 'The storm stripped a sandbar off the coast and uncovered a channel the old pilots only whispered about.' },
	landslide: { severe: 'The mountain came down on the pass. Porters dig with their hands for the caravan that was on it.', nearby: 'Every traveller from the mountains brings worse news. The road is closed, they say — for now.', dig: 'dig for the buried caravan', ruin: 'The slide carved away the mountainside and laid bare a goat track nobody knew was there — straight over the ridge.' },
	volcano: { severe: 'Ash falls like grey snow; the sun is a copper coin. People wear wet cloths over their faces and pray.', nearby: 'A fine grey dust covers everything. The fields will fail this year.', dig: 'carry water and food to the villages under the mountain', ruin: 'The lava field cooled into a black causeway across the bay. The fishermen say it leads somewhere.' },
	tsunami: { severe: 'The sea drew back, then came inland as a wall. Boats sit in rice fields. Nobody has counted the dead yet.', nearby: 'Wreckage washes up on every beach, and with it, strangers’ belongings.', dig: 'search the wreckage for survivors', ruin: 'The wave scoured the coast and left a ship’s logbook in a tree — with a route marked in someone else’s hand.' },
	sandstorm: { severe: 'For three days the sky was black at noon. Two caravans did not arrive. The gates are only now being dug out.', nearby: 'Sand in your teeth, sand in your bread. The camel drivers will not leave until the wind changes.', dig: 'ride out with the search party for the lost caravans', ruin: 'The storm shifted a dune and uncovered a line of old wells — a road that was buried a thousand years ago.' },
	blizzard: { severe: 'Snow to the eaves. Herds freezing where they stand; families burning furniture to stay alive.', nearby: 'The roads are white silence. Travellers who left yesterday have not been seen.', dig: 'go out with ropes and lanterns for the travellers lost in the snow', ruin: 'When the snow settled, the hunters found a sheltered gully through the pass — warm springs, and a hut that should not exist.' },
	locusts: { severe: 'The sky went dark at noon. By evening nothing green was left — not a leaf, not a stalk.', nearby: 'The cloud passed overhead like a moving roof. Prices for grain doubled by nightfall.', dig: 'help the villagers dig trenches and burn the hoppers', ruin: 'Stripped bare, the hillside showed a line of old marker stones you would never have seen under the crops.' },
	famine: { severe: 'Grain at ten times its price. Families sell their daughters at the gate; the monks are boiling bark.', nearby: 'The hungry are walking in from the countryside. Every inn has bolted its kitchen.', dig: 'help the monks run a soup kitchen', ruin: 'A starving smuggler, in return for bread, tells you the road he uses to bring rice in past the tax posts.' }
};

export const DISASTER_T: Template[] = [
	{
		id: 'dis-aftermath',
		where: 'city',
		tags: ['mercy'],
		weight: (c) => (here(c) ? 9 : 0),
		make: (c) => {
			const d = here(c)!;
			const s = SCENE[d.kind];
			const n = npc(c, d.severe ? 'official' : 'elder', { title: d.severe ? 'Relief magistrate' : 'Village headman' });
			return {
				id: 'dis-aftermath',
				npc: n,
				badge: `${DISASTERS[d.kind].glyph} ${d.e.label}`,
				text: `${d.severe ? s.severe : s.nearby} **${n.name}** grabs your arm. "Every pair of hands. Please."`,
				left: ch(`Stay and ${s.dig}`, { vigor: d.severe ? -12 : -7, renown: 10 }, { tags: ['mercy'], days: d.severe ? 3 : 1, standing: 12, karma: 8, remember: { kind: 'favor', deed: `helped ${place(c)} after ${d.e.label.toLowerCase()}` }, text: 'Hours blur. You pull out more living than dead. Nobody here will forget your face.' }),
				right: ch('Sell your supplies at disaster prices', { silver: 16 }, { tags: ['trade', 'cruel'], karma: -6, standing: -8, text: 'They pay. They have no choice. They will remember that too.' }),
				up: withCrew(c, 'healer') || has(c, 'physician') || has(c, 'herbalist') ? up(withCrew(c, 'healer') ? 'Physician' : has(c, 'herbalist') ? 'Herbalist' : 'Physician', 'Set up a field hospital', { renown: 18, vigor: -6 }, { tags: ['mercy', 'illness'], days: 3, standing: 18, karma: 12, text: 'You run out of bandages on the first day and use your own clothes. People walk out alive who should not have.' }) : undefined
			};
		}
	},
	{
		id: 'dis-revealed',
		where: 'city',
		tags: ['art'],
		once: false,
		weight: (c) => {
			const d = here(c);
			return d && !c.run.flags['disrev:' + d.e.id] ? 3 : 0;
		},
		make: (c) => {
			const d = here(c)!;
			const s = SCENE[d.kind];
			const sec = nearSecret(c, 3);
			const n = npc(c, c.rng.pick(['child', 'monk', 'merchant']), { title: 'Survivor' });
			const seen = { ['disrev:' + d.e.id]: true };
			return {
				id: 'dis-revealed',
				npc: n,
				badge: '✦ Uncovered',
				text: `${s.ruin} **${n.name}** shows you, wide-eyed. "Nobody else has been down there. Not yet."${sec ? ` If the old stories are true, this is the way they called **${sec.name}**.` : ''}`,
				left: sec
					? ch('Map it before anyone else does', { renown: 6 }, { tags: ['art'], days: 1, setFlag: { ...seen, ['secret:' + sec.id]: true }, text: `${sec.hint[0].toUpperCase() + sec.hint.slice(1)}. You copy every turn into your journal.` })
					: ch('Climb down and look', {}, { tags: ['art'], setFlag: seen, gamble: { p: odds(c, 0.5, ['art']), win: { fx: { silver: 18, renown: 8 }, text: 'Bronze vessels, a jade disc, coins of a dynasty nobody here can name.' }, lose: { fx: { vigor: -10 }, text: 'The ground shifts under you. You climb out bloody and empty-handed.' } } }),
				right: ch('Report it to the authorities', { renown: 3 }, { tags: ['official', 'loyal'], setFlag: seen, standing: 6, text: 'The magistrate thanks you, posts a guard and takes the credit.' }),
				up: carrying(c, 'lantern') || has(c, 'cartographer') ? up(has(c, 'cartographer') ? 'Cartographer' : 'Paper lantern', 'Explore it properly, by lantern light', { renown: 10, silver: 10 }, { tags: ['art'], days: 1, setFlag: { ...seen, ...(sec ? { ['secret:' + sec.id]: true } : {}) }, text: 'Every chamber, every turn, measured and drawn. You come out with a full map and a pocketful of old coins.' }) : undefined
			};
		}
	},
	{
		id: 'dis-refugees',
		where: 'travel',
		tags: ['mercy', 'food'],
		weight: (c) => (disasterAt(c.run, c.city.id) || (c.from && disasterAt(c.run, c.from.id)) ? 5 : 0),
		make: (c) => {
			const d = disasterAt(c.run, c.city.id) ?? disasterAt(c.run, c.from!.id)!;
			const n = npc(c, c.rng.pick(['elder', 'child', 'merchant']), { title: 'Refugee' });
			const sec = c.rng.chance(0.5) ? nearSecret(c, 2) : undefined;
			return {
				id: 'dis-refugees',
				npc: n,
				badge: `${DISASTERS[d.kind].glyph} ${d.e.label}`,
				text: `A column of people is walking away from ${d.e.data?.epicenter ? cityName(CITY[d.e.data.epicenter], c.year) : 'the disaster'} with everything they own on their backs. **${n.name}** asks if you have any food to spare${sec ? ' — and mutters, as you pass, about an old road that avoids the broken one.' : '.'}`,
				left: ch('Share your food', { vigor: -4, fortune: 0 }, { tags: ['mercy', 'food'], karma: 6, remember: { kind: 'favor', deed: 'shared their food on the road from the disaster' }, ...(sec ? { bump: hint(sec.id), text: `"There is a way," ${n.name} says, chewing. "${sec.hint[0].toUpperCase() + sec.hint.slice(1)}. My father used it." You file that away.` } : { text: 'A child falls asleep on your pack while you eat together.' }) }),
				right: ch('Keep walking', {}, { text: 'You do not look back. It does not help.' }),
				up: c.run.mount ? up(`${c.run.mount.name}`, 'Put the old and the sick on your mount', { renown: 6 }, { tags: ['mercy'], karma: 8, days: 1, mountHurt: 6, text: 'Slower, heavier, and the best day of the whole journey.' }) : undefined
			};
		}
	},
	{
		id: 'dis-blame',
		where: 'city',
		tags: ['fight', 'talk'],
		weight: (c) => (here(c)?.severe && isForeigner(c) ? 2.5 : 0),
		make: (c) => {
			const d = here(c)!;
			const n = npc(c, 'monk', { title: 'Wild-eyed preacher' });
			return {
				id: 'dis-blame',
				npc: n,
				badge: `${DISASTERS[d.kind].glyph} ${d.e.label}`,
				text: `A crowd has gathered around **${n.name}**, who is shouting that ${d.e.label.toLowerCase()} is Heaven’s punishment — for letting foreigners in. Heads are turning toward you.`,
				left: ch('Slip away down an alley', { renown: -4 }, { tags: ['crime'], text: 'You leave the city by the water gate before nightfall.' }),
				right: ch('Stand your ground and speak', {}, { tags: ['talk'], gamble: { p: odds(c, 0.45, ['talk']), win: { fx: { renown: 12 }, text: 'You remind them who helped dig out their neighbours. The crowd turns on the preacher instead.' }, lose: { fx: { vigor: -14, renown: -6 }, text: 'Stones first, questions never. You escape bloody.' } } }),
				up: c.run.flags['disrev:' + d.e.id] || c.run.log.some((l) => l.choice?.startsWith('Stay and')) ? up('You helped', 'Let the people you helped answer for you', { renown: 14 }, { tags: ['loyal'], text: 'A woman you pulled from the rubble steps in front of you. Nobody throws anything after that.' }) : undefined
			};
		}
	}
];

// ---------- the death of someone who mattered ----------

const MOURN: Partial<Record<CultureId, string>> = {
	han: 'Everyone wears undyed hemp; music is forbidden and weddings are postponed.',
	korean: 'White mourning robes everywhere; the markets close for three days and the men stop shaving.',
	japanese: 'Shutters closed, festivals cancelled, the temples ringing their bells one hundred and eight times.',
	viet: 'White headbands on every head; the incense smoke hangs over the city like fog.',
	indian: 'The ghats are crowded; men shave their heads and the bazaar is silent.',
	persian: 'Black banners hang from the bazaar; mourners beat their chests in the square.',
	ottoman: 'The mosques are full; the coffee houses are closed out of respect, which everyone hates.',
	european: 'Black crêpe on every door; the church bells toll every hour.',
	malay: 'The gamelan is silent; the kraton gates are closed and the people sit in the alun-alun in white.',
	siamese: 'The city wears black and white; monks chant through the night and the cremation tower is being built.'
};

export const DEATH_T: Template[] = [
	{
		id: 'death-mourning',
		where: 'city',
		tags: ['faith', 'loyal'],
		weight: (c) => (deathAt(c.run, c.city.id)?.data?.popular ? 8 : 0),
		make: (c) => {
			const d = deathAt(c.run, c.city.id)!;
			const fig = d.data!.figure!;
			const n = npc(c, 'official', { title: 'Mourning steward' });
			return {
				id: 'death-mourning',
				npc: n,
				badge: '🕯 Mourning',
				text: `${place(c)} is mourning **${fig}**, who died ${d.data!.cause}. ${MOURN[c.city.culture] ?? 'The whole city has gone quiet.'} **${n.name}** eyes your travelling clothes. "Everyone in the city honours the dead. Everyone."`,
				left: ch('Join the mourning', { fortune: 4 }, { tags: ['faith', 'loyal'], days: 1, standing: 8, text: 'You stand in the long line with everyone else. An old woman squeezes your hand without a word.' }),
				right: ch('Quietly carry on with your business', { silver: 6 }, { tags: ['trade'], standing: -8, text: 'Half the shops are shut, so the other half are delighted to see you. Some people notice. They will remember.' }),
				up: has(c, 'pious') || has(c, 'performer') || has(c, 'poet') ? up(has(c, 'poet') ? 'Poet' : has(c, 'performer') ? 'Performer' : 'Pious', 'Offer an elegy at the funeral', { renown: 14 }, { tags: ['art', 'faith'], standing: 14, text: 'Your words are read aloud at the graveside. People who never knew your name are crying at them.' }) : undefined
			};
		}
	},
	{
		id: 'death-succession',
		where: 'city',
		tags: ['official', 'talk'],
		weight: (c) => (deathAt(c.run, c.city.id)?.data?.royal ? 6 : 0),
		make: (c) => {
			const d = deathAt(c.run, c.city.id)!;
			const n = npc(c, 'noble', { title: 'Courtier with a candidate' });
			const a = npc(c, 'noble').name;
			const b = npc(c, 'noble').name;
			return {
				id: 'death-succession',
				npc: n,
				badge: '👑 Succession',
				text: `With **${d.data!.figure}** dead, two claimants circle the empty seat: **${a}**, ${c.rng.pick(['the eldest, cruel but legitimate', 'favoured by the army', 'backed by the old families'])}, and **${b}**, ${c.rng.pick(['younger, loved by the people', 'backed by the merchants', 'rumoured to have arranged the death'])}. **${n.name}** offers you a place in the game — and a price for your loyalty.`,
				left: ch(`Back ${a}`, {}, { tags: ['official', 'gamble'], gamble: { p: odds(c, 0.5, ['official']), win: { fx: { renown: 14, silver: 12 }, standing: 10, text: `${a} takes the seat. You are remembered at the coronation.` }, lose: { fx: { renown: -8 }, heat: 20, text: `${b} wins. The losing side’s friends are being listed. Your name is on the list.` } } }),
				right: ch(`Back ${b}`, {}, { tags: ['talk', 'gamble'], gamble: { p: odds(c, 0.45, ['talk']), win: { fx: { renown: 16, fortune: 6 }, standing: 12, text: `Against the odds, ${b} wins. The people cheer in the streets — and they remember who stood with them.` }, lose: { fx: { vigor: -10 }, heat: 25, text: `${a} wins, and is not forgiving. You leave by the water gate at night.` } } }),
				up: dressed(c, 'mandarin-robe', 'silk-turban', 'company-uniform', 'janissary-uniform') || has(c, 'envoy') ? up(has(c, 'envoy') ? 'Envoy' : 'Court dress', 'Broker a compromise between them', { renown: 22 }, { tags: ['talk', 'official'], days: 2, standing: 16, text: 'A regency council, a marriage, two titles and a long dinner. Nobody is happy, so it might even last.' }) : undefined
			};
		}
	},
	{
		id: 'death-unloved',
		where: 'city',
		tags: ['crime', 'mercy'],
		weight: (c) => {
			const d = deathAt(c.run, c.city.id);
			return d && !d.data?.popular && !d.data?.royal ? 6 : 0;
		},
		make: (c) => {
			const d = deathAt(c.run, c.city.id)!;
			const n = npc(c, 'child', { title: 'Messenger of the crowd' });
			return {
				id: 'death-unloved',
				npc: n,
				badge: '🕯 Nobody weeps',
				text: `Nobody is weeping for **${d.data!.figure}**. Tonight a crowd has gathered outside the dead one’s house; **${n.name}** runs past shouting that the storehouses are full of grain while the city went hungry.`,
				left: ch('Join the crowd at the storehouse', { silver: 10 }, { tags: ['crime'], heat: 12, karma: -2, text: 'Doors give way. Rice pours into the street like water. Nobody stops to ask who you are.' }),
				right: ch('Stand at the door and protect the family inside', {}, { tags: ['mercy', 'fight'], gamble: { p: odds(c, 0.45, ['fight', 'talk']), win: { fx: { renown: 10 }, remember: { kind: 'favor', deed: 'stood at their door when the crowd came' }, text: 'You talk the crowd down to taking only the grain. The widow inside does not know how to thank a stranger.' }, lose: { fx: { vigor: -12 }, text: 'The crowd goes through you. The family gets out the back. Maybe that was enough.' } } })
			};
		}
	}
];
