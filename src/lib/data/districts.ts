import type { CultureId } from './cultures';
import { CITY } from './world';

export type CitySecurity = 'peaceful' | 'lawful' | 'notorious-crime' | 'fractured';

export type DistrictKind = 'slums' | 'downtown' | 'aristocratic' | 'colonial';

export interface District {
	id: DistrictKind;
	name: string;
	glyph: string;
	blurb: string;
	buildings: { id: string; name: string; glyph: string; desc: string }[];
}

export interface CitySecurityProfile {
	order: CitySecurity;
	title: string;
	desc: string;
	districts: DistrictKind[];
}

export const DISTRICTS: Record<DistrictKind, District> = {
	slums: {
		id: 'slums',
		name: 'Underground & Shantytown',
		glyph: '🏮',
		blurb: 'Twisting alleys, shadow fences, gambling pits, and flophouses where imperial guards fear to patrol.',
		buildings: [
			{ id: 'flophouse', name: 'Alleyway Flophouse', glyph: '🛏️', desc: 'Cheap floor space and hot gruel, far from prying eyes.' },
			{ id: 'smugglers-den', name: 'Smuggler’s Cellar', glyph: '🗝️', desc: 'Contraband goods, forged passes, and stolen relics.' },
			{ id: 'dice-pit', name: 'Underground Dice Pit', glyph: '🎲', desc: 'High-stakes street dice and clandestine wagers.' }
		]
	},
	downtown: {
		id: 'downtown',
		name: 'Downtown Bazaar & Guild Basin',
		glyph: '🧺',
		blurb: 'The roaring commercial heart of the metropolis with bustling shops, artisans, and tea parlors.',
		buildings: [
			{ id: 'guildhall', name: 'Merchant Guildhall', glyph: '⚖️', desc: 'Weighing scales, price bulletins, and trade caravans.' },
			{ id: 'teahouse', name: 'Teahouse of the Four Winds', glyph: '🍵', desc: 'Where travellers and storytellers trade news of the roads.' },
			{ id: 'artisan-row', name: 'Artisan Workshop Row', glyph: '🔨', desc: 'Armorers, carpenters, and silversmiths mending equipment.' }
		]
	},
	aristocratic: {
		id: 'aristocratic',
		name: 'Aristocratic Heights & Town Hall',
		glyph: '🏛️',
		blurb: 'Walled patrician estates, manicured gardens, Town Hall, and guards demanding proof of status.',
		buildings: [
			{ id: 'town-hall', name: 'Town Hall & Magistrate Yamen', glyph: '📜', desc: 'Official proclamations, bounties, and imperial petitions.' },
			{ id: 'patrician-salon', name: 'Patrician Salon', glyph: '🍷', desc: 'Aristocratic banquets, noble patronage, and high diplomacy.' },
			{ id: 'treasury-vault', name: 'Factor Bank & Mint', glyph: '🏦', desc: 'Secured vaults to deposit silver bars and draw credit.' }
		]
	},
	colonial: {
		id: 'colonial',
		name: 'Colonial Complex & Foreign Enclave',
		glyph: '⚓',
		blurb: 'Foreign factories, consulates, and maritime docks where East India companies hoist their flags.',
		buildings: [
			{ id: 'factory-consulate', name: 'Foreign Factory & Consulate', glyph: '🏢', desc: 'Diplomats, steamship agents, and foreign curios.' },
			{ id: 'customs-house', name: 'Maritime Customs House', glyph: '📋', desc: 'Shipping charters, ballast passes, and port permits.' },
			{ id: 'foreign-mission', name: 'Missionary Infirmary', glyph: '⚕️', desc: 'Apothecaries blending European cinchona and Arabic herbs.' }
		]
	}
};

const CITY_SECURITY_OVERRIDES: Record<string, CitySecurity> = {
	// Notorious for crime / piracy
	macau: 'notorious-crime',
	malacca: 'notorious-crime',
	hongkong: 'notorious-crime',
	calicut: 'notorious-crime',
	zanzibar: 'notorious-crime',
	batavia: 'notorious-crime',
	manila: 'notorious-crime',

	// Lawful / Strict imperial bastions
	beijing: 'lawful',
	edo: 'lawful',
	istanbul: 'lawful',
	venice: 'lawful',
	hanseong: 'lawful',
	lhasa: 'lawful',
	london: 'lawful',
	amsterdam: 'lawful',

	// Peaceful / Sacred sanctuaries
	wudang: 'peaceful',
	ise: 'peaceful',
	kandy: 'peaceful',
	nara: 'peaceful',
	qufu: 'peaceful',
	dunhuang: 'peaceful',
	mecca: 'peaceful',
	jerusalem: 'peaceful',
	varanasi: 'peaceful'
};

const TREATY_PORTS = new Set([
	'guangzhou', 'macau', 'hongkong', 'shanghai', 'nagasaki', 'batavia', 'calcutta', 'bombay',
	'malacca', 'singapore', 'goa', 'manila', 'alexandria', 'venice', 'london', 'amsterdam'
]);

export function citySecurityProfile(cityId: string): CitySecurityProfile {
	const order: CitySecurity = CITY_SECURITY_OVERRIDES[cityId] ?? 'fractured';
	const isTreaty = TREATY_PORTS.has(cityId);

	let districts: DistrictKind[];
	let title = '';
	let desc = '';

	switch (order) {
		case 'notorious-crime':
			title = 'Notorious Haven of Vice & Smugglers';
			desc = 'A bustling, lawless hub where privateers, smugglers, and fences openly rule the docks.';
			districts = isTreaty ? ['slums', 'downtown', 'colonial'] : ['slums', 'downtown'];
			break;
		case 'lawful':
			title = 'Strict Imperial Bastion of Order';
			desc = 'Towering gates, regular patrols, and vigilant magistrates maintain rigid security.';
			districts = isTreaty ? ['downtown', 'aristocratic', 'colonial'] : ['downtown', 'aristocratic'];
			break;
		case 'peaceful':
			title = 'Quiet Sanctuary of Faith & Peace';
			desc = 'Temple bells and monastic peace blanket the lanes; crime is rare and strangers are fed.';
			districts = ['downtown'];
			break;
		case 'fractured':
		default:
			title = 'Vast Tiered Metropolis';
			desc = 'A grand city of deep contrasts — from sprawling squalid slums to opulent aristocratic heights.';
			districts = isTreaty
				? ['slums', 'downtown', 'aristocratic', 'colonial']
				: ['slums', 'downtown', 'aristocratic'];
			break;
	}

	return { order, title, desc, districts };
}
