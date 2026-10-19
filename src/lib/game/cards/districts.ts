import type { Card, Choice, Run } from '../types';
import { DISTRICTS, type DistrictKind } from '#lib/data/districts';
import { CITY, cityName } from '#lib/data/world';
import { Rng } from '#lib/rng';

export function buildBuildingCard(run: Run, districtKind: DistrictKind, buildingId: string): Card {
	const city = CITY[run.location];
	const here = cityName(city, run.year);
	const dist = DISTRICTS[districtKind];
	const bld = dist.buildings.find((b) => b.id === buildingId) ?? dist.buildings[0];
	const rng = new Rng(run.seed + ':' + run.day + ':' + buildingId);

	const cult = city.culture;

	let text = `In the ${dist.name} of ${here}, you step into the **${bld.name}**. ${bld.desc}`;
	let left: Choice;
	let right: Choice;
	let up: Choice | undefined = undefined;

	switch (buildingId) {
		case 'flophouse':
			text = `Smoke and stew vapor fill the dim flophouse in ${here}. A straw mat is offered for one silver copper.`;
			left = {
				label: 'Sleep on the straw mat (1 silver)',
				fx: { silver: -1, vigor: 8 },
				text: 'A hard floor, but warm gruel and ten hours of unbroken sleep restore your strength.'
			};
			right = {
				label: 'Share tobacco with the other wanderers',
				fx: { silver: -2 },
				karma: 2,
				text: 'You sit among dockworkers and couriers, listening to tales of river crossings and mountain roads.'
			};
			break;

		case 'smugglers-den':
			text = `Behind a false pantry wall, contraband crates lie stacked in torchlight. The cellar boss watches your pockets with a sly grin.`;
			left = {
				label: 'Buy a forged travel pass (8 silver)',
				fx: { silver: -8 },
				itemAdd: ['forged-pass'],
				text: 'A beautifully forged pass with real imperial wax stamps is slipped into your sleeve.'
			};
			right = {
				label: 'Barter illegal smoke pellets (4 silver)',
				fx: { silver: -4 },
				itemAdd: ['smoke-pellets'],
				text: 'Two pungent charcoal pellets that burst into thick blinding smoke when thrown.'
			};
			up = {
				label: 'Inquire after stolen antiquities (15 silver)',
				fx: { silver: -15 },
				itemAdd: ['stolen-relic'],
				text: 'A heavy brass antiquity wrapped in dark silk. Dangerous to carry, but worth a small fortune to foreign antiquarians.'
			};
			break;

		case 'dice-pit':
			text = `Dice rattle in an earthenware cup. Gamblers slam silver taels onto a scarred mahogany table.`;
			left = {
				label: 'Place a modest wager (3 silver)',
				fx: {},
				gamble: {
					p: 0.5,
					win: { fx: { silver: 8 }, text: 'The dice land true! You scoop up double your wager with cheers from the pit!' },
					lose: { fx: { silver: -3 }, text: 'The dice roll snake eyes. Your coins join the pit boss’s pile.' }
				}
			};
			right = {
				label: 'High roller stake (10 silver)',
				fx: {},
				gamble: {
					p: 0.45,
					win: { fx: { silver: 25, renown: 4 }, text: 'A triple six! The tavern erupts in shouts; you rake in a mound of silver!' },
					lose: { fx: { silver: -10, renown: -2 }, text: 'Fortune frowns. Ten silver taels vanish in a single throw.' }
				}
			};
			break;

		case 'guildhall':
			text = `Clerks record ledger entries and weigh ingots on brass balances in the great guildhall of ${here}.`;
			left = {
				label: 'Consult regional trade bulletins',
				fx: { renown: 4 },
				text: 'You inspect the latest freight schedules and port tariffs, taking note of profitable trade flows.'
			};
			right = {
				label: 'Exchange silver into lightweight letters of credit',
				fx: {},
				text: 'The factor stamps your promissory draft with the seal of the merchant consortium.'
			};
			break;

		case 'teahouse':
			text = `Steaming porcelain bowls and stringed lutes fill the airy teahouse. Storytellers hold court on raised wooden daises.`;
			left = {
				label: 'Order fine tea and listen to the storyteller',
				fx: { silver: -2, vigor: 6 },
				karma: 2,
				text: 'An afternoon of fragrant brew and heroic ballads of the Silk Road lifts your road-weariness.'
			};
			right = {
				label: 'Treat local merchants to a round of tea',
				fx: { silver: -5, renown: 6 },
				standing: 6,
				text: 'Your generosity warms the room. Several caravan factors toast your journey with enthusiasm.'
			};
			break;

		case 'artisan-row':
			text = `Hammers strike anvils and glue pots simmer in the artisan workshops of ${here}. Pack-saddles and gear are mended here.`;
			left = {
				label: run.mount ? `Refit ${run.mount.name}’s saddle & shoes (4 silver)` : 'Mend pack straps and boots (3 silver)',
				fx: { silver: run.mount ? -4 : -3 },
				mountHurt: run.mount ? -20 : undefined,
				text: run.mount
					? `Blacksmiths re-shoe ${run.mount.name} and pad the pack saddle (+20 mount health).`
					: 'Sturdy leather stitches reinforce your boots and pack.'
			};
			right = {
				label: 'Commission an oiled-cloth cover (2 silver)',
				fx: { silver: -2 },
				itemAdd: ['umbrella'],
				text: 'A sturdy oiled-paper umbrella to turn aside driving monsoon rains.'
			};
			break;

		case 'town-hall':
			text = `Armed halberdiers guard the steps of the Town Hall. Bounties and official imperial edicts hang upon the cedar notice board.`;
			left = {
				label: 'Read official bounties for road bandits',
				fx: { renown: 3 },
				text: 'You study the descriptions and marks of brigands active on the outward routes.'
			};
			right = {
				label: 'Present your official credentials to the magistrate',
				fx: { renown: 6 },
				standing: 8,
				text: 'The magistrate’s secretary notes your commission with respectful nods, stamping your registry.'
			};
			break;

		case 'patrician-salon':
			text = `Carved screens, imported mirrors, and silver candelabras decorate the private salon of high society in ${here}.`;
			left = {
				label: 'Charm the gathering with tales of distant empires',
				fx: { renown: 12 },
				standing: 10,
				text: 'Nobles and ambassadors lean forward in wonder as you describe the wonders of the four seas.'
			};
			right = {
				label: 'Seek letters of introduction from a noble patron',
				fx: { renown: 6, silver: 8 },
				text: 'An admiring lord presses a velvet purse and a signed introduction into your hands.'
			};
			break;

		case 'treasury-vault':
			text = `Thick iron-bound oak doors and armed guards protect the counting house of ${here}. Letters of exchange are honored here.`;
			left = {
				label: 'Deposit 10 silver into the vault',
				fx: { silver: -10 },
				treasury: 10,
				text: 'Ten taels deposited safely with the consortium factor, protected from road theft.'
			};
			right = {
				label: 'Audit your balance with the chief factor',
				fx: { renown: 2 },
				text: 'The factor verifies your deposits across the four seas with ledger stamps and tea.'
			};
			break;

		case 'factory-consulate':
			text = `Consular clerks stamp marine bills of lading under foreign flags. Clockwork devices and naval chronometers tick upon the shelves.`;
			left = {
				label: 'Inquire after foreign marine charts (6 silver)',
				fx: { silver: -6, renown: 4 },
				text: 'You obtain copies of recent Admiralty soundings and monsoon wind tables.'
			};
			right = {
				label: 'Exchange diplomatic pleasantries with the consul',
				fx: { renown: 8 },
				standing: 8,
				text: 'The consul offers port wine and assures you of consular protection at treaty ports.'
			};
			break;

		case 'customs-house':
			text = `Customs inspectors in uniform stamp cargo manifests and inspect ballast stones by the quay.`;
			left = {
				label: 'Clear departure manifests in advance',
				fx: { silver: -3 },
				standing: 5,
				text: 'Your papers are stamped without delay, ensuring unhindered clearance on sailing day.'
			};
			right = {
				label: 'Declare all carried goods with scrupulous honesty',
				fx: { renown: 4 },
				karma: 3,
				text: 'The harbormaster commends your transparency, waiving inspection tariffs.'
			};
			break;

		case 'foreign-mission':
		default:
			text = `A quiet infirmary smells of crushed eucalyptus and boiling infusions. A missionary apothecary tends the sick.`;
			left = {
				label: 'Drink a bitter tonic of cinchona bark (2 silver)',
				fx: { silver: -2, vigor: 10 },
				statusRemove: ['poisoned', 'fever'],
				text: 'The bitter Peruvian bark reduces fever heat, clearing your blood within hours.'
			};
			right = {
				label: 'Donate alms to the ward for the destitute',
				fx: { silver: -3 },
				karma: 8,
				text: 'The physician smiles with heartfelt gratitude: "Heaven remembers every cup of water given to a stranger."'
			};
			break;
	}

	return {
		id: `bld-${buildingId}-${run.day}`,
		badge: dist.name,
		npc: {
			name: `Master of the ${bld.name}`,
			title: bld.name,
			culture: cult,
			gender: rng.chance(0.5) ? 'm' : 'f',
			role: 'merchant',
			seed: rng.int(1, 1e9)
		},
		text,
		left,
		right,
		up
	};
}
