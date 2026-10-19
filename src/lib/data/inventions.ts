export type InventionField = 'astronomy' | 'navigation' | 'printing' | 'medicine' | 'pyrotechnics' | 'statecraft';

export interface InventionProject {
	id: string;
	name: string;
	field: InventionField;
	fieldLabel: string;
	glyph: string;
	scholarRole: string;
	scholarTitle: string;
	cost: number;
	daysNeeded: number;
	venue: 'academy' | 'palace' | 'harbor';
	rewardItem: string;
	desc: string;
	pitch: string;
}

export const INVENTIONS: Record<string, InventionProject> = {
	'celestial-chronometer': {
		id: 'celestial-chronometer',
		name: 'Celestial Chronometer',
		field: 'astronomy',
		fieldLabel: 'Astronomy & Horology',
		glyph: '🕰️',
		scholarRole: 'scholar',
		scholarTitle: 'Imperial Astronomer',
		cost: 18,
		daysNeeded: 20,
		venue: 'academy',
		rewardItem: 'celestial-chronometer',
		desc: 'Precision gearing calibrated to star tables to calculate exact longitude at sea. Sea voyages are 18% faster and commissions receive +14 deadline days.',
		pitch: '“The celestial spheres turn in clockwork harmony. With sufficient silver for brass gearing and astronomical quartz, I can build an instrument to fix our place beneath the heavens.”'
	},
	'watertight-hull': {
		id: 'watertight-hull',
		name: 'Watertight Bulkhead Architecture',
		field: 'navigation',
		fieldLabel: 'Naval Engineering',
		glyph: '🚢',
		scholarRole: 'captain',
		scholarTitle: 'Master Shipwright',
		cost: 20,
		daysNeeded: 25,
		venue: 'harbor',
		rewardItem: 'watertight-hull',
		desc: 'Self-contained compartmentalized hull framing. Grants absolute immunity to coral reef disasters and storm hull breach catastrophes.',
		pitch: '“If one compartment is pierced by jagged reefs, the pine bulkheads seal the sea out. Fund my shipyard draughts, and our vessels shall be unsinkable.”'
	},
	'movable-type': {
		id: 'movable-type',
		name: 'Movable Metal Type Foundry',
		field: 'printing',
		fieldLabel: 'Typography & Printing',
		glyph: '🔤',
		scholarRole: 'scholar',
		scholarTitle: 'Typographer-Reformer',
		cost: 15,
		daysNeeded: 18,
		venue: 'academy',
		rewardItem: 'movable-type',
		desc: 'Cast bronze character matrices for rapid publishing. News of your deeds and published treatises precede you (+15 renown in every new city entered).',
		pitch: '“Woodblocks carve slowly, but copper and bronze type can be rearranged into a thousand volumes in an afternoon. Back my foundry, and your words will fly across kingdoms.”'
	},
	'quinine-distillation': {
		id: 'quinine-distillation',
		name: 'Quinine & Herbal Distillation Still',
		field: 'medicine',
		fieldLabel: 'Botanical Medicine',
		glyph: '🧪',
		scholarRole: 'scholar',
		scholarTitle: 'Alchemical Botanist',
		cost: 16,
		daysNeeded: 18,
		venue: 'academy',
		rewardItem: 'quinine-distillation',
		desc: 'Concentrated essence of cinchona bark and sweet wormwood. Immune to swamp fevers, malaria, and restores extra vigor at every roadside inn.',
		pitch: '“The ague fells more soldiers and merchants than all the swords of Asia. With glassware and distillation apparatus, I can extract the living bitter principle that banishes swamp fever forever.”'
	},
	'sky-rockets': {
		id: 'sky-rockets',
		name: 'Thunder-Fire Rocket Artillery',
		field: 'pyrotechnics',
		fieldLabel: 'Military Engineering',
		glyph: '🚀',
		scholarRole: 'soldier',
		scholarTitle: 'Master Pyrotechnician',
		cost: 22,
		daysNeeded: 22,
		venue: 'palace',
		rewardItem: 'sky-rockets',
		desc: 'Multiple-launch rocket baskets and exploding thunder-pots. +20% combat bonus; repels bandit ambushes without injury.',
		pitch: '“We pack refined saltpeter and iron powder into lacquered bamboo tubes. When ignited, a hundred blazing dragons descend upon the enemy lines at once. Finance my arsenal!”'
	},
	'commercial-charter': {
		id: 'commercial-charter',
		name: 'Judicial Reform & Commercial Code',
		field: 'statecraft',
		fieldLabel: 'Statesmanship & Law',
		glyph: '📜',
		scholarRole: 'official',
		scholarTitle: 'Reformist Jurist',
		cost: 24,
		daysNeeded: 28,
		venue: 'palace',
		rewardItem: 'commercial-charter',
		desc: 'Standardized mercantile law, civil examination merit codes, and imperial passage rights. Waives gate tolls, increases trade profits (+25%), and shields against arrest.',
		pitch: '“Corrupt magistrates and arbitrary tolls strangle trade from the Levant to the Yellow Sea. Fund our judicial memorial to the court, and we will establish a chartered code that protects all honest commerce.”'
	}
};

export const INVENTIONS_LIST = Object.values(INVENTIONS);
