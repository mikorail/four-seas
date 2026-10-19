import type { CultureId } from './cultures';
import { CURIOS, OUTFITS, RIDDLES } from './market';
import { SECRETS } from './world';
import type { Fx, Perk } from './traits';
import type { Good } from './world';
import type { CrewRole, MountKind } from '#lib/game/types';

export type ItemKind = 'good' | 'supply' | 'gear' | 'relic' | 'curio' | 'map' | 'outfit';

export interface Item {
	id: string;
	name: string;
	glyph: string;
	kind: ItemKind;
	desc: string;
	price: number;
	use?: { fx: Fx; text: string; heat?: number }; // consumed on use
	perk?: Omit<Perk, 'id' | 'name' | 'glyph' | 'bio' | 'pro'>; // passive while carried
	saves?: 'vigor' | 'silver' | 'fortune' | 'renown' | 'any'; // auto-consumed to prevent a death
	contraband?: boolean; // customs will confiscate it; fences pay well
	intel?: boolean; // information someone will pay for — or kill for
	value?: number; // what a fence or spymaster pays
}

const GOOD_GLYPH: Record<Good, string> = {
	silk: '🧵', tea: '🍵', porcelain: '🏺', pepper: '🌶️', nutmeg: '🌰', cloves: '🌿', cinnamon: '🪵', cotton: '☁️', indigo: '🫐',
	sandalwood: '🪵', ginseng: '🌱', lacquerware: '🍱', 'steel blades': '🗡️', pearls: '🦪', coffee: '☕', horses: '🐎', carpets: '🧶',
	gemstones: '💎', furs: '🦊', glassware: '🍷', 'silver bars': '🪙', woolens: '🧣', sugar: '🍬', camphor: '🧴'
};

export const goodId = (g: Good) => 'good:' + g;
export const isGood = (id: string) => id.startsWith('good:');
export const goodOf = (id: string) => id.slice(5) as Good;

export const ITEMS: Record<string, Item> = {
	rations: { id: 'rations', name: 'Dried rations', glyph: '🍙', kind: 'supply', price: 3, desc: 'Rice cakes, jerky, salted plums.', use: { fx: { vigor: 9 }, text: 'You eat by the roadside. Strength returns.' } },
	medicine: { id: 'medicine', name: 'Medicine chest', glyph: '🧪', kind: 'supply', price: 8, desc: 'Herbs and tinctures. Used automatically if fever would kill you.', use: { fx: { vigor: 18 }, text: 'Bitter, but it works.' }, saves: 'vigor' },
	charm: { id: 'charm', name: 'Temple charm', glyph: '🧿', kind: 'gear', price: 6, desc: 'A blessed amulet. +5% luck on every gamble.', perk: { gamble: [{ tags: [], bonus: 0.05 }] }, use: { fx: { fortune: 10 }, text: 'You burn the charm as an offering.' } },
	sword: { id: 'sword', name: 'Fine sword', glyph: '⚔️', kind: 'gear', price: 14, desc: 'Good steel. +12% in fights.', perk: { gamble: [{ tags: ['fight'], bonus: 0.12 }] } },
	pistol: { id: 'pistol', name: 'Flintlock pistol', glyph: '🔫', kind: 'gear', price: 16, desc: 'One shot, then a club. +15% in fights.', perk: { gamble: [{ tags: ['fight'], bonus: 0.15 }] } },
	papers: { id: 'papers', name: 'Forged papers', glyph: '📜', kind: 'gear', price: 10, desc: 'Unlocks a hidden option at checkpoints and with officials.' },
	gift: { id: 'gift', name: 'Lacquered gift box', glyph: '🎁', kind: 'supply', price: 9, desc: 'A proper gift for a proper official. Unlocks hidden options at court.' },
	spyglass: { id: 'spyglass', name: 'Brass spyglass', glyph: '🔭', kind: 'gear', price: 15, desc: 'See pirates and storms coming. Sea voyages 8% shorter, +10% at sea.', perk: { travelDays: 0.92, gamble: [{ tags: ['sea'], bonus: 0.1 }] } },
	credit: { id: 'credit', name: 'Letter of credit', glyph: '🧾', kind: 'supply', price: 0, desc: 'Redeem with any banker for silver. Saves you from ruin.', use: { fx: { silver: 20 }, text: 'A banker counts out your silver.' }, saves: 'silver' },
	lockbox: { id: 'lockbox', name: 'Iron lockbox', glyph: '🔒', kind: 'gear', price: 8, desc: 'Thieves and pickpockets mostly fail.', perk: { gamble: [{ tags: ['crime'], bonus: 0.1 }] } },
	finery: { id: 'finery', name: 'Fine clothes', glyph: '👘', kind: 'gear', price: 12, desc: 'Silk robes for court. Renown gains from talk ×1.2.', perk: { mult: [{ tags: ['talk', 'official'], stat: 'renown', gain: 1.2 }] } },
	teabrick: { id: 'teabrick', name: 'Tea brick', glyph: '🧱', kind: 'supply', price: 4, desc: 'Currency on the plateau and steppe. Use for a warm meal and goodwill.', use: { fx: { vigor: 6, fortune: 4 }, text: 'Butter tea, shared around the fire.' } },
	lantern: { id: 'lantern', name: 'Paper lantern', glyph: '🏮', kind: 'gear', price: 3, desc: 'Keeps hungry ghosts at bay. Spirits treat you kindly.', perk: { mult: [{ tags: ['faith'], stat: 'fortune', gain: 1.2, loss: 0.7 }] } },
	// story / legend relics
	'cursed-blade': { id: 'cursed-blade', name: 'Master Ikeda’s blade', glyph: '🗡️', kind: 'relic', price: 0, desc: 'A dead man’s sword. It hums near his killer.', perk: { gamble: [{ tags: ['fight'], bonus: 0.08 }] } },
	'avenger-blade': { id: 'avenger-blade', name: 'Blade of Vengeance', glyph: '⚔️', kind: 'relic', price: 0, desc: 'Its debt is paid. +20% in fights.', perk: { gamble: [{ tags: ['fight'], bonus: 0.2 }] } },
	manuscript: { id: 'manuscript', name: 'Jesuit manuscript', glyph: '📕', kind: 'relic', price: 0, desc: 'A star-catalogue every empire wants.' },
	'heir-seal': { id: 'heir-seal', name: 'Heir’s jade token', glyph: '🟢', kind: 'relic', price: 0, desc: 'Proof of a child’s claim — or a forgery.' },
	'fox-mask': { id: 'fox-mask', name: 'Kitsune mask', glyph: '🦊', kind: 'relic', price: 0, desc: 'A gift from a fox spirit. +10% on every gamble.', perk: { gamble: [{ tags: [], bonus: 0.1 }] } },
	'naga-pearl': { id: 'naga-pearl', name: 'Naga pearl', glyph: '🔮', kind: 'relic', price: 0, desc: 'Breathe under the sea. Saves you once from any death.', saves: 'any' },
	'djinn-lamp': { id: 'djinn-lamp', name: 'Djinn’s lamp', glyph: '🪔', kind: 'relic', price: 0, desc: 'One wish: rub it to set every stat to 50.', use: { fx: {}, text: 'Smoke curls into a grin. "Granted."' } },
	'yeti-fur': { id: 'yeti-fur', name: 'Migoi fur', glyph: '🧥', kind: 'relic', price: 0, desc: 'Warm beyond reason. Land journeys never tire you.', perk: { mult: [{ tags: ['land'], stat: 'vigor', loss: 0.3 }] } },
	'dragon-scale': { id: 'dragon-scale', name: 'Dragon scale', glyph: '🐉', kind: 'relic', price: 0, desc: 'Sailors bow when they see it. Sea journeys 15% shorter.', perk: { travelDays: 0.85 } },
	'ghost-bell': { id: 'ghost-bell', name: 'Spirit bell', glyph: '🔔', kind: 'relic', price: 0, desc: 'The dead answer when it rings. Fortune never drops below 10.', saves: 'fortune' },
	'koxinga-flag': { id: 'koxinga-flag', name: 'Koxinga’s banner', glyph: '🚩', kind: 'relic', price: 0, desc: 'Pirates let you pass.', perk: { gamble: [{ tags: ['sea', 'crime'], bonus: 0.15 }] } },
	'musashi-scroll': { id: 'musashi-scroll', name: 'Book of Five Rings', glyph: '📖', kind: 'relic', price: 0, desc: 'Strategy in every line. +15% in fights and debates.', perk: { gamble: [{ tags: ['fight', 'talk'], bonus: 0.15 }] } },
	parcel1: { id: 'parcel1', name: 'Sealed consignment', glyph: '📦', kind: 'relic', price: 0, desc: 'A contracted delivery. Keep it safe.' },
	parcel2: { id: 'parcel2', name: 'Sealed consignment', glyph: '📦', kind: 'relic', price: 0, desc: 'A contracted delivery. Keep it safe.' },
	parcel3: { id: 'parcel3', name: 'Sealed consignment', glyph: '📦', kind: 'relic', price: 0, desc: 'A contracted delivery. Keep it safe.' },
	'betrothal-seal': { id: 'betrothal-seal', name: 'Betrothal seal', glyph: '💮', kind: 'relic', price: 0, desc: 'Proof of a royal marriage contract.' },
	'temple-relic': { id: 'temple-relic', name: 'Stolen temple relic', glyph: '🪷', kind: 'relic', price: 0, desc: 'A sacred relic, recovered. It must go home.' },
	'survey-book': { id: 'survey-book', name: 'Survey journal', glyph: '🗺️', kind: 'relic', price: 0, desc: 'Coastlines sketched for a royal cartographer.' },
	telescope: { id: 'telescope', name: 'Galilean telescope', glyph: '🔭', kind: 'gear', price: 14, desc: 'See ports, storms and pirates from afar. +10% at sea and on the road.', perk: { gamble: [{ tags: ['sea', 'land'], bonus: 0.1 }] } },
	chronometer: { id: 'chronometer', name: 'Marine chronometer', glyph: '⏱️', kind: 'gear', price: 22, desc: 'Harrison\u2019s clock: know your longitude. Sea voyages 15% shorter.', perk: { travelDays: 0.85 } },
	vaccine: { id: 'vaccine', name: 'Cowpox vaccination', glyph: '💉', kind: 'gear', price: 10, desc: 'Jenner\u2019s method. Sickness barely touches you.', perk: { mult: [{ tags: ['illness'], stat: 'vigor', loss: 0.3 }] } },
	camera: { id: 'camera', name: 'Daguerreotype camera', glyph: '📷', kind: 'gear', price: 18, desc: 'Pictures of every city you reach. Renown from art and new places ×1.4.', perk: { mult: [{ tags: ['art'], stat: 'renown', gain: 1.4 }] } },
	telegraph: { id: 'telegraph', name: 'Telegraph code book', glyph: '📡', kind: 'gear', price: 16, desc: 'Prices and news by wire before anyone else. Trade pays ×1.25.', perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.25 }] } },
	'balloon-plans': { id: 'balloon-plans', name: 'Montgolfier\u2019s plans', glyph: '📐', kind: 'relic', price: 0, desc: 'How to make a silk bag fly. Needs silk, varnish (lacquerware) and a workshop.' },
	travelogue: { id: 'travelogue', name: 'Your published travelogue', glyph: '📚', kind: 'relic', price: 0, desc: '"Travels of…" — everybody has read it. Renown from talk ×1.3.', perk: { mult: [{ tags: ['talk'], stat: 'renown', gain: 1.3 }] } },
	'kalachakra': { id: 'kalachakra', name: 'Kalachakra wheel', glyph: '☸️', kind: 'relic', price: 0, desc: 'Time turns for you. +15% on every gamble.', perk: { gamble: [{ tags: [], bonus: 0.15 }] } },
	'immortal-peach': { id: 'immortal-peach', name: 'Peach of Immortality', glyph: '🍑', kind: 'relic', price: 0, desc: 'Eat it to restore 30 vigor — or keep it, and it saves you from any death.', saves: 'any', use: { fx: { vigor: 30 }, text: 'Sweeter than anything. You feel a decade younger.' } },
	'gold-idol': { id: 'gold-idol', name: 'Golden Buddha of Suvarnadvipa', glyph: '🛕', kind: 'relic', price: 0, desc: 'Merchants trust whoever carries it. Trade pays ×1.4.', perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.4 }] } },
	'singing-seed': { id: 'singing-seed', name: 'Seed of the singing tree', glyph: '🌱', kind: 'relic', price: 0, desc: 'It hums when danger is near. Journeys 10% shorter; saves you from ruin of fortune.', perk: { travelDays: 0.9 }, saves: 'fortune' },
	'tortoise-shell': { id: 'tortoise-shell', name: 'Oracle tortoise shell', glyph: '🐢', kind: 'relic', price: 0, desc: 'Bought at a market that does not exist with a memory you no longer have. +4% on every gamble; saves you once from ruined fortune.', perk: { gamble: [{ tags: [], bonus: 0.04 }] }, saves: 'fortune' },
	'hang-tuah-kris': { id: 'hang-tuah-kris', name: 'Taming Sari kris', glyph: '🗡️', kind: 'relic', price: 0, desc: 'The invulnerable blade. Fights never cost more than 8 vigor.', saves: 'vigor' },
	'garuda-feather': { id: 'garuda-feather', name: 'Golden Garuda feather', glyph: '🪶', kind: 'relic', price: 0, desc: 'A blazing feather of the solar bird-king. Purges venom; saves you from exhaustion.', saves: 'vigor' },
	'dokkaebi-token': { id: 'dokkaebi-token', name: 'Dokkaebi silver token', glyph: '🪙', kind: 'relic', price: 0, desc: 'A lucky token tapped from a goblin’s club. Trade pays ×1.2.', perk: { mult: [{ tags: ['trade'], stat: 'silver', gain: 1.2 }] } },
	'emerald-sash': { id: 'emerald-sash', name: 'Queen’s emerald sash', glyph: '🎗️', kind: 'relic', price: 0, desc: 'Woven seafoam and sacred green silk. Saves you once from any death.', saves: 'any' },
	// consumables for ailments, stat management & heat
	'fever-tonic': { id: 'fever-tonic', name: 'Bitter fever tonic', glyph: '🌿', kind: 'supply', price: 6, desc: 'Decoction of sweet wormwood and skullcap. Breaks fever and cools delirium.', use: { fx: { vigor: 15 }, heat: -5, text: 'A shuddering gulp of cold bitter broth. The fever breaks and clarity returns.' }, saves: 'vigor' },
	incense: { id: 'incense', name: 'Purifying incense', glyph: '🪔', kind: 'supply', price: 5, desc: 'Temple sandalwood and camphor. Burn it to quiet the mind, calm spirits, and shake off pursuers.', use: { fx: { fortune: 6 }, heat: -25, text: 'You burn fragrant wood at a quiet shrine. Pursuing constables lose your trail (-25 heat).' } },
	'ascetic-tea': { id: 'ascetic-tea', name: 'Ascetic tea', glyph: '🍵', kind: 'supply', price: 4, desc: 'Extremely bitter Kuding tea. Sheds dangerous vanity and worldly fame to escape jealous rulers.', use: { fx: { renown: -15, fortune: 8 }, heat: -10, text: 'A sharp, cleansing bitterness down your throat. Worldly ambition fades; officials and spies look right past you (-15 renown).' } },
	'calming-draught': { id: 'calming-draught', name: 'Calming draught', glyph: '🥣', kind: 'supply', price: 4, desc: 'Steeped wild jujube and lotus seeds. Soothes manic restlessness and dangerous bravado.', use: { fx: { vigor: -15, fortune: 8 }, text: 'Your heart slows from its reckless race. The urge to seek foolish fights melts away (-15 vigor).' } },
	'joss-paper': { id: 'joss-paper', name: 'Joss paper', glyph: '🪙', kind: 'supply', price: 3, desc: 'Bundles of paper coins. Burn them at a crossroads to appease hungry spirits and divert Heaven’s scrutiny.', use: { fx: { fortune: -15, renown: 6 }, text: 'Ash flies into the night sky. The spirits take their cut, and Heaven’s blinding spotlight dims (-15 fortune).' } },
	'alms-pouch': { id: 'alms-pouch', name: 'Alms pouch', glyph: '🤲', kind: 'supply', price: 8, desc: 'A purse of copper coins kept ready for beggars. Sheds dangerous wealth to evade greedy bandits.', use: { fx: { silver: -15, renown: 8, fortune: 8 }, heat: -10, text: 'You scatter coppers to cheering street children. Envious bandits look elsewhere (-15 silver).' } },
	'rice-wine': { id: 'rice-wine', name: 'Clay jug of rice wine', glyph: '🍶', kind: 'supply', price: 4, desc: 'Warming country vintage. Loosens tongues, soothes road aches, and eases suspicions.', use: { fx: { vigor: 8, renown: 4 }, heat: -15, text: 'You pass the jug among travellers. The watch relaxes and suspicions fade (-15 heat).' } },
	'ginseng-tonic': { id: 'ginseng-tonic', name: 'Ginseng elixir', glyph: '🧪', kind: 'supply', price: 10, desc: 'Simmered mountain ginseng root. Recharges life force when exhaustion threatens.', use: { fx: { vigor: 25 }, text: 'Deep heat radiates through your limbs. Exhaustion is banished.' }, saves: 'vigor' },
	umbrella: { id: 'umbrella', name: 'Oiled-paper umbrella', glyph: '☂️', kind: 'supply', price: 4, desc: 'Keeps off torrential monsoon rains and desert sun.', use: { fx: { vigor: 8 }, text: 'You open the oiled paper canopy. The harsh elements stay outside.' } },
	'hunting-knife': { id: 'hunting-knife', name: 'Hunting knife', glyph: '🔪', kind: 'gear', price: 6, desc: 'Sharp steel blade for dressing wild game and cutting trails. +8% in fights and wilderness.', perk: { gamble: [{ tags: ['fight', 'land'], bonus: 0.08 }] } },
	'flint-steel': { id: 'flint-steel', name: 'Flint & steel', glyph: '🔥', kind: 'gear', price: 3, desc: 'Tinderbox and striker. Lights a crackling campfire in any weather to warm bones and ward off wolves.', use: { fx: { vigor: 6 }, text: 'Sparks catch the charred linen. A roaring fire wards off predators and night cold.' } },
	'ancestral-crest': { id: 'ancestral-crest', name: 'Ancestral crest', glyph: '🛡️', kind: 'relic', price: 0, desc: 'A weathered clan token passed down through generations. Hamlet elders recognize your lineage.', perk: { mult: [{ tags: ['talk'], stat: 'renown', gain: 1.25 }] } },
	'heirloom-blade': { id: 'heirloom-blade', name: 'Heirloom dagger', glyph: '🗡️', kind: 'relic', price: 0, desc: 'Inscribed with your forebear’s oath. Outlaws and village elders honor its silver hilt.', perk: { gamble: [{ tags: ['fight', 'crime'], bonus: 0.12 }] } },
	// contraband & night market goods
	'forged-pass': { id: 'forged-pass', name: 'Forged imperial pass', glyph: '🪪', kind: 'gear', price: 14, desc: 'Vermilion seals copied with cunning accuracy. Bypasses city gates, checkpoints, and blockades without toll.', perk: { gamble: [{ tags: ['official', 'crime'], bonus: 0.15 }] }, saves: 'renown' },
	'skeleton-key': { id: 'skeleton-key', name: 'Skeleton key', glyph: '🗝️', kind: 'gear', price: 12, desc: 'Master wrought-iron lockpicks. +15% on intrigue, crime, and escaping confinement.', perk: { gamble: [{ tags: ['crime'], bonus: 0.15 }] } },
	'smoke-pellets': { id: 'smoke-pellets', name: 'Smoke pellets', glyph: '💨', kind: 'supply', price: 8, desc: 'Saltpeter and sulfur balls. Throw down to vanish instantly in an acrid grey cloud.', use: { fx: { vigor: 4 }, heat: -30, text: 'You crush a pellet underfoot. Blinding sulfur smoke erupts — you vanish into the maze of alleys (-30 heat).' }, saves: 'vigor' },
	'stolen-seal': { id: 'stolen-seal', name: 'Stolen court seal', glyph: '🔏', kind: 'relic', price: 0, contraband: true, value: 30, desc: 'The jade seal of a provincial court. Whoever holds it can forge any order — and every constable in that province is looking for it.' },
	'forbidden-books': { id: 'forbidden-books', name: 'Forbidden books', glyph: '📕', kind: 'supply', price: 10, contraband: true, value: 22, desc: 'Banned histories and heretical sutras. Scholars pay well; censors burn them, and sometimes their owners.' },
	gunpowder: { id: 'gunpowder', name: 'Smuggled gunpowder', glyph: '🧨', kind: 'supply', price: 12, contraband: true, value: 26, desc: 'Three kegs. Rebels, pirates and quarry-masters want it. A spark ends everything.' },
	'rebel-pamphlets': { id: 'rebel-pamphlets', name: 'Rebel pamphlets', glyph: '📜', kind: 'supply', price: 4, contraband: true, value: 12, desc: 'Fiery words, fresh ink. Rebels need them distributed; loyalists will hang whoever carries them.' },
	'counterfeit-silver': { id: 'counterfeit-silver', name: 'Counterfeit silver', glyph: '🪙', kind: 'supply', price: 6, contraband: true, value: 18, desc: 'Lead cores, silver skins. Spend it fast and far away.' },
	'tiger-pelt': { id: 'tiger-pelt', name: 'Poached tiger pelt', glyph: '🐅', kind: 'curio', price: 18, contraband: true, value: 34, desc: 'The ruler’s game. Very valuable, very illegal.' },
	'war-plans': { id: 'war-plans', name: 'War plans', glyph: '🗺️', kind: 'relic', price: 0, intel: true, value: 36, desc: 'Troop movements, supply depots, the date of the attack. Both sides would pay; one side would kill.' },
	'court-letters': { id: 'court-letters', name: 'Secret court letters', glyph: '✉️', kind: 'relic', price: 0, intel: true, value: 28, desc: 'Love letters between a minister and a rival prince. Blackmail, or history.' },
	'bribe-ledger': { id: 'bribe-ledger', name: 'Ledger of bribes', glyph: '📒', kind: 'relic', price: 0, intel: true, value: 30, desc: 'Who paid whom, how much and when. Half the officials of a city are in it.' },
	'harbour-charts': { id: 'harbour-charts', name: 'Naval harbour charts', glyph: '⚓', kind: 'relic', price: 0, intel: true, value: 24, desc: 'Soundings, batteries and blind spots of a fortified harbour. Pirates and admirals both want them.' },
	opium: { id: 'opium', name: 'Medicinal poppy cake', glyph: '🪻', kind: 'supply', price: 16, contraband: true, value: 26, desc: 'Smuggled resin brick. Numbs agonizing pain or fetches high silver on the black market.', use: { fx: { vigor: 25, fortune: -6 }, text: 'A bitter crumb under the tongue. Pain and fear melt into a slow, hazy warmth.' }, saves: 'vigor' },
	'stolen-relic': { id: 'stolen-relic', name: 'Plundered temple relic', glyph: '🏺', kind: 'relic', price: 24, contraband: true, value: 30, desc: 'A gilded antique chipped from an altar by grave-robbers. Hot to hold, but fences pay a fortune.', perk: { mult: [{ tags: ['crime'], stat: 'silver', gain: 1.3 }] } },
	// inventions & patronage relics
	'celestial-chronometer': { id: 'celestial-chronometer', name: 'Celestial Chronometer', glyph: '🕰️', kind: 'relic', price: 0, desc: 'Precision gearing calibrated to stellar longitude. Slashes sea travel time and adds 14 days to commissions.', perk: { travelDays: 0.82, gamble: [{ tags: ['sea'], bonus: 0.15 }] } },
	'watertight-hull': { id: 'watertight-hull', name: 'Watertight Bulkhead Plans', glyph: '🚢', kind: 'relic', price: 0, desc: 'Segmented hull architecture. Complete immunity to reefs and maritime storm wrecks.', saves: 'any' },
	'movable-type': { id: 'movable-type', name: 'Movable Metal Type Foundry', glyph: '🔤', kind: 'relic', price: 0, desc: 'Bronze matrix font trays. News of your deeds is printed and published across kingdoms (+15 renown per new city).', perk: { mult: [{ tags: ['art', 'talk'], stat: 'renown', gain: 1.4 }] } },
	'quinine-distillation': { id: 'quinine-distillation', name: 'Quinine Distillation Still', glyph: '🧪', kind: 'relic', price: 0, desc: 'Refined cinchona and sweet-wormwood extract. Fever and malaria ailments cannot touch you.', saves: 'vigor' },
	'sky-rockets': { id: 'sky-rockets', name: 'Thunder-Fire Sky Rockets', glyph: '🚀', kind: 'relic', price: 0, desc: 'Iron-cased gunpowder arrows in a portable basket. Shatters bandits and enemy lines before battle joins.', perk: { gamble: [{ tags: ['fight'], bonus: 0.2 }] }, saves: 'vigor' },
	'commercial-charter': { id: 'commercial-charter', name: 'Imperial Commercial Charter', glyph: '📜', kind: 'relic', price: 0, desc: 'Imperial charter of legal reform and merchant privilege. City tolls and court fines are permanently waived.', perk: { mult: [{ tags: ['trade', 'official'], stat: 'silver', gain: 1.25 }] } }
};

for (const o of Object.values(OUTFITS)) {
	ITEMS[o.id] = {
		id: o.id,
		name: o.name,
		glyph: o.glyph,
		kind: 'outfit',
		price: o.price,
		desc: o.desc + (o.access ? ` ✦ ${o.access}` : '')
	};
}
for (const c of CURIOS) ITEMS[c.id] = { id: c.id, name: c.name, glyph: c.glyph, kind: 'curio', price: c.price, desc: c.pitch };
RIDDLES.forEach((r, i) => {
	ITEMS[`treasure-map-${i}`] = { id: `treasure-map-${i}`, name: 'Riddle map', glyph: '🗺️', kind: 'map', price: 9, desc: `A torn map with a verse instead of a name: “${r.clue}”` };
});
for (const s of SECRETS) ITEMS[`chart-${s.id}`] = { id: `chart-${s.id}`, name: `Chart of ${s.name.replace(/^The /, 'the ')}`, glyph: '📜', kind: 'map', price: 14, desc: `Shows ${s.hint}. Opens a hidden route.` };

for (const g of Object.keys(GOOD_GLYPH) as Good[]) {
	ITEMS[goodId(g)] = { id: goodId(g), name: g[0].toUpperCase() + g.slice(1), glyph: GOOD_GLYPH[g], kind: 'good', price: 8, desc: 'Trade goods. Sell far from where it was bought.' };
}

export interface BagKind {
	id: string;
	name: string;
	glyph: string;
	slots: number;
	price: number;
	desc: string;
}

export const BAGS: Record<string, BagKind> = {
	bundle: { id: 'bundle', name: 'Cloth bundle', glyph: '👝', slots: 3, price: 0, desc: 'Everything you own, knotted in a furoshiki.' },
	satchel: { id: 'satchel', name: 'Leather satchel', glyph: '👜', slots: 5, price: 6, desc: 'Sturdy and practical.' },
	chest: { id: 'chest', name: 'Travel chest', glyph: '🧳', slots: 7, price: 12, desc: 'Brass corners. Needs a mount or porter to haul past 5 items comfortably.' },
	trunk: { id: 'trunk', name: 'Lacquered trunk', glyph: '🗃️', slots: 9, price: 20, desc: 'Fit for an envoy. +renown when seen.' }
};

export interface MountDef {
	kind: MountKind;
	name: string;
	glyph: string;
	land: number; // land travel days multiplier
	slots: number;
	price: number;
	feed: number; // silver per land journey
	desc: string;
	cultures: CultureId[];
}

export const MOUNTS: Record<MountKind, MountDef> = {
	donkey: { kind: 'donkey', name: 'Donkey', glyph: '🫏', land: 0.85, slots: 2, price: 7, feed: 1, desc: 'Stubborn, slow, indestructible.', cultures: ['han', 'swahili', 'ottoman', 'persian', 'viet', 'european'] },
	mule: { kind: 'mule', name: 'Mule', glyph: '🫏', land: 0.78, slots: 3, price: 11, feed: 1, desc: 'Carries anything up any mountain.', cultures: ['han', 'korean', 'japanese', 'european', 'tibetan'] },
	horse: { kind: 'horse', name: 'Horse', glyph: '🐎', land: 0.6, slots: 2, price: 18, feed: 2, desc: 'Fast. Hungry. Beautiful.', cultures: ['steppe', 'han', 'korean', 'japanese', 'persian', 'ottoman', 'european', 'indian'] },
	camel: { kind: 'camel', name: 'Camel', glyph: '🐫', land: 0.72, slots: 5, price: 15, feed: 1, desc: 'Ship of the desert. Spits.', cultures: ['steppe', 'persian', 'ottoman', 'indian'] },
	elephant: { kind: 'elephant', name: 'Elephant', glyph: '🐘', land: 0.8, slots: 8, price: 30, feed: 3, desc: 'A walking palace. Everyone stares.', cultures: ['indian', 'siamese'] },
	yak: { kind: 'yak', name: 'Yak', glyph: '🐂', land: 0.75, slots: 4, price: 12, feed: 1, desc: 'Shaggy, steady, smells of butter.', cultures: ['tibetan', 'steppe'] }
};

export const MOUNT_NAMES = ['Thunder', 'Old Plum', 'Lotus', 'Ironhoof', 'Biscuit', 'Little Khan', 'Moonlight', 'Grumble', 'Saffron', 'Typhoon', 'Dumpling', 'Jade', 'Pepper', 'Monsoon', 'Sir Spits', 'Ginseng'];

export interface CrewDef {
	role: CrewRole;
	title: string;
	glyph: string;
	wage: number;
	perk: Omit<Perk, 'id' | 'name' | 'glyph' | 'bio' | 'pro'>;
	desc: string;
}

export const CREW: Record<CrewRole, CrewDef> = {
	bodyguard: { role: 'bodyguard', title: 'Bodyguard', glyph: '🛡️', wage: 4, desc: '+20% in fights; may take a wound for you.', perk: { gamble: [{ tags: ['fight'], bonus: 0.2 }], mult: [{ tags: ['fight'], stat: 'vigor', loss: 0.6 }] } },
	navigator: { role: 'navigator', title: 'Navigator', glyph: '🧭', wage: 3, desc: 'Sea journeys 15% shorter; +10% at sea.', perk: { gamble: [{ tags: ['sea'], bonus: 0.1 }] } },
	guide: { role: 'guide', title: 'Local guide', glyph: '🥾', wage: 2, desc: 'Land journeys 15% shorter; fewer ambushes.', perk: { gamble: [{ tags: ['land'], bonus: 0.1 }] } },
	interpreter: { role: 'interpreter', title: 'Interpreter', glyph: '🗣️', wage: 3, desc: 'Foreigners and officials go easier on you.', perk: { mult: [{ tags: ['foreign', 'official'], loss: 0.65 }], gamble: [{ tags: ['talk', 'official'], bonus: 0.12 }] } },
	healer: { role: 'healer', title: 'Physician', glyph: '⚕️', wage: 3, desc: 'Sickness hurts less; rest heals more.', perk: { mult: [{ tags: ['illness'], stat: 'vigor', loss: 0.5, gain: 1.4 }, { tags: ['rest'], stat: 'vigor', gain: 1.3 }] } },
	thief: { role: 'thief', title: 'Cat burglar', glyph: '🐈‍⬛', wage: 3, desc: '+20% on crimes; heat cools faster. Light fingers.', perk: { gamble: [{ tags: ['crime'], bonus: 0.2 }], mult: [{ tags: ['crime'], stat: 'silver', gain: 1.3 }] } },
	cook: { role: 'cook', title: 'Road cook', glyph: '🍲', wage: 2, desc: 'Every journey restores a little vigor.', perk: { mult: [{ tags: ['food'], stat: 'vigor', gain: 1.5 }] } },
	companion: { role: 'companion', title: 'Beloved', glyph: '💞', wage: 0, desc: 'Travels for love. Fortune and courage.', perk: { gamble: [{ tags: [], bonus: 0.05 }], mult: [{ tags: ['romance'], gain: 1.3 }] } },
	heir: { role: 'heir', title: 'Lost heir', glyph: '👑', wage: 1, desc: 'A child with a claim to a throne. Or a liar.', perk: {} },
	ward: { role: 'ward', title: 'Ward', glyph: '🏵️', wage: 0, desc: 'Under your protection. Lose them and the task fails.', perk: {} }
};

export function mountsFor(c: CultureId): MountKind[] {
	return (Object.values(MOUNTS) as MountDef[]).filter((m) => m.cultures.includes(c)).map((m) => m.kind);
}
