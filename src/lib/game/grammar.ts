// A tiny seeded text grammar (Tracery-style): "#rule#" expands to a random option of that rule.
import type { Rng } from '#lib/rng';
import { CULTURES, type CultureId } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { MOUNTS } from '#lib/data/items';
import type { Run } from './types';

export type Rules = Record<string, string[]>;

export function expand(rng: Rng, text: string, rules: Rules, depth = 0): string {
	if (depth > 8) return text;
	return text.replace(/#([a-zA-Z_]+)#/g, (m, k: string) => {
		const opts = rules[k];
		return opts?.length ? expand(rng, rng.pick(opts), rules, depth + 1) : m;
	});
}

/** What a city of each culture sounds, smells and looks like. */
const LOCAL: Partial<Record<CultureId, Rules>> = {
	han: { sound: ['an erhu wailing from an upper window', 'abacus beads clattering in a counting house', 'a gong from the yamen'], sight: ['red lanterns strung across the lane', 'a scholar’s sedan chair pushing through the crowd', 'calligraphy drying on a line like laundry'], smell: ['star anise and frying dough', 'ink and wet stone', 'jasmine tea and roasting chestnuts'] },
	japanese: { sound: ['geta clacking on stone', 'a temple bell rolling over the roofs', 'a shamisen behind paper screens'], sight: ['noren curtains stirring in doorways', 'a line of pilgrims in white', 'a samurai pretending not to look at you'], smell: ['grilled eel and soy', 'cedar and incense', 'sea salt and miso'] },
	korean: { sound: ['laundry bats beating by the stream', 'a pansori singer drawing a crowd', 'magpies arguing on the eaves'], sight: ['white-robed men in black horsehair hats', 'kimchi jars lined up in a courtyard', 'a palace guard in blue'], smell: ['charcoal and fermenting cabbage', 'pine smoke', 'roasting sesame'] },
	viet: { sound: ['boatwomen calling across the water', 'a monochord singing somewhere', 'rain on palm thatch'], sight: ['conical hats bobbing through the market', 'incense coils hanging in a temple', 'fish traps stacked by the river'], smell: ['fish sauce and lime', 'lemongrass smoke', 'wet rice paddies'] },
	siamese: { sound: ['temple bells on the wind', 'oars slapping the klong', 'monks chanting at dawn'], sight: ['gilded spires above the river', 'saffron robes on the morning alms round', 'a royal barge with a dragon prow'], smell: ['frangipani and river mud', 'coconut and chilli', 'jasmine garlands'] },
	malay: { sound: ['the call to prayer over the water', 'a gamelan practising', 'traders haggling in five languages'], sight: ['stilt houses over the tide', 'a kris at every belt', 'junks, dhows and carracks side by side'], smell: ['cloves and durian', 'pandan and coconut', 'tar and spice sacks'] },
	indian: { sound: ['a sitar under a balcony', 'temple drums', 'bullock bells'], sight: ['marigold garlands on every shrine', 'a nawab’s elephant in the street', 'dyers’ cloth drying in bright bands'], smell: ['ghee and cardamom', 'sandalwood and dust', 'jasmine and woodsmoke'] },
	persian: { sound: ['a nightingale in a walled garden', 'coppersmiths hammering in the bazaar', 'a poet reciting Hafez'], sight: ['turquoise tile glittering on a dome', 'a garden of clipped cypresses', 'carpets hung over balconies'], smell: ['rosewater and saffron', 'baking flatbread', 'apple tobacco'] },
	ottoman: { sound: ['the ezan from six minarets', 'a coffee grinder rattling', 'janissary band music'], sight: ['domes stacked like soap bubbles', 'a hammam steaming in the cold', 'a vizier’s escort clearing the street'], smell: ['strong coffee and cardamom', 'roasting lamb', 'cedar and rosewater'] },
	tibetan: { sound: ['prayer wheels creaking', 'long horns from the monastery', 'yak bells'], sight: ['prayer flags snapping over every roof', 'pilgrims measuring the road with their bodies', 'butter lamps in a dark doorway'], smell: ['yak butter and juniper smoke', 'barley roasting', 'cold, thin air'] },
	steppe: { sound: ['a horsehead fiddle at dusk', 'hooves drumming past', 'throat singing from a ger'], sight: ['felt tents like mushrooms on the grass', 'eagles on hunters’ arms', 'a herd of horses moving like weather'], smell: ['mare’s milk and dung fires', 'mutton fat', 'wild thyme'] },
	swahili: { sound: ['taarab drifting from a doorway', 'dhow crews singing', 'a muezzin over the coral roofs'], sight: ['carved doors with brass studs', 'dhows careened on the beach', 'women in bright kanga cloth'], smell: ['cloves and the sea', 'cardamom coffee', 'grilled fish and lime'] },
	european: { sound: ['church bells out of tune with each other', 'a fiddler outside a tavern', 'Portuguese, Dutch and English cursing on the quay'], sight: ['whitewashed churches and cannon on the walls', 'a governor’s coach splashing through mud', 'warehouses stamped with company marks'], smell: ['pipe tobacco and tar', 'wet wool', 'beer and pepper sacks'] },
	pacific: { sound: ['conch shells at dawn', 'surf on the reef', 'drums for a dance'], sight: ['outrigger canoes pulled up on the sand', 'tapa cloth drying', 'tattooed paddlers singing'], smell: ['frangipani and woodsmoke', 'roasting taro', 'salt and coconut oil'] }
};

const BASE: Rules = {
	opener: ['#time# in **#city#**', '**#city#**, #time_lc#', '#time# — **#city#**'],
	time: ['Before dawn', 'At first light', 'Mid-morning', 'At noon', 'In the long afternoon', 'At dusk', 'After dark', 'Near midnight'],
	time_lc: ['before dawn', 'first light', 'mid-morning', 'noon', 'late afternoon', 'dusk', 'after dark', 'near midnight'],
	sense: ['#sound# carries over the rooftops', 'the air smells of #smell#', 'you notice #sight#', '#sight#; #sound#', 'everywhere: #smell#']
};

/** A personal aside that reflects how you are actually doing. */
function asides(run: Run): string[] {
	const out: string[] = [];
	const s = run.stats;
	if (s.vigor < 25) out.push('Your legs ache in a way sleep no longer fixes.', 'You catch yourself leaning on walls.');
	if (s.vigor > 75) out.push('You feel you could walk to the end of the world.');
	if (s.silver < 20) out.push('Your purse is light enough to float.', 'You count your coins twice. It does not help.');
	if (s.silver > 80) out.push('Your purse is heavy, and people notice.');
	if (s.renown > 75) out.push('A child points at you and whispers your name.');
	if (s.renown < 20) out.push('Nobody here knows your name. Some days that is a mercy.');
	if (s.fortune < 20) out.push('A crow follows you for three streets.');
	if (s.fortune > 80) out.push('Even the weather seems to be on your side.');
	if (run.heat >= 40) out.push('You keep your hat low and your back to the wall.');
	if (run.mount) out.push(`${run.mount.name} the ${MOUNTS[run.mount.kind].name.toLowerCase()} snorts at something only animals can see.`);
	for (const c of run.crew.slice(0, 2)) out.push(`${c.npc.name.split(' ')[0]} hums a tune from home.`, `${c.npc.name.split(' ')[0]} complains about the food, as usual.`);
	const r = run.romance;
	if (r && r.status !== 'parted' && !run.crew.some((c) => c.npc.name === r.npc.name)) out.push(`You think of ${r.npc.name} in ${cityName(CITY[r.city], run.year)}.`);
	if (run.rival && !run.rival.arrived && !run.delivered) out.push(`Somewhere behind you — or ahead — ${run.rival.npc.name} is on the road too.`);
	if (run.deadline - run.day < 10 && run.deadline - run.day >= 0 && !run.delivered) out.push('The days left are few, and you feel every one.');
	return out;
}

/** A richer city scene line: local senses + (sometimes) how you are doing. */
export function cityScene(rng: Rng, run: Run): string {
	const c = CITY[run.location];
	const local = LOCAL[c.culture] ?? {};
	const cul = CULTURES[c.culture];
	const rules: Rules = {
		...BASE,
		city: [cityName(c, run.year)],
		sound: local.sound ?? [`bells from the ${cul.holyPlace}`],
		sight: local.sight ?? [`${c.exports} traders at every corner`],
		smell: [...(local.smell ?? []), cul.food]
	};
	const line = `${expand(rng, '#opener#; #sense#.', rules)}`;
	const extra = asides(run);
	return extra.length && rng.chance(0.45) ? `${line} ${rng.pick(extra)}` : line;
}

export function travelAside(rng: Rng, run: Run): string {
	const extra = asides(run);
	return extra.length && rng.chance(0.4) ? ' ' + rng.pick(extra) : '';
}
