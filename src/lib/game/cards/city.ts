import { BAGS, CREW, ITEMS, MOUNTS, MOUNT_NAMES, goodId, goodOf, mountsFor } from '#lib/data/items';
import type { Good } from '#lib/data/world';
import { buyPrice, sellPrice } from '../economy';
import type { Companion, CrewRole } from '../types';
import { bagFree, carrying, ch, goodsInBag, has, isForeigner, npc, odds, place, standingHere, up, withCrew, type Ctx, type Template } from './helpers';

export function companion(c: Ctx, role: CrewRole, n = npc(c, role === 'bodyguard' ? 'soldier' : role === 'navigator' ? 'sailor' : role === 'healer' ? 'healer' : role === 'thief' ? 'child' : role === 'interpreter' ? 'scholar' : role === 'heir' ? 'child' : 'merchant')): Companion {
	n.title = CREW[role].title;
	return { id: `${role}-${n.seed}`, npc: n, role, wage: CREW[role].wage, loyalty: 60, joinedDay: c.run.day };
}

import { crewFull } from './helpers';

export const CITY_T: Template[] = [
	// ===== trade =====
	{
		id: 'market-buy',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (bagFree(c) > 0 ? 3 : 0),
		make: (c) => {
			const n = npc(c, 'merchant');
			const g = c.city.exports;
			const cost = buyPrice(c.run, g, c.city.id);
			return {
				id: 'market-buy',
				npc: n,
				text: `${n.name} lays out the finest ${g} in ${place(c)} for ${cost} silver. "Far from here, this sells for three times the price."`,
				left: ch('Not today', {}),
				right: ch(`Buy ${g} (${cost})`, { silver: -cost }, { tags: ['trade'], itemAdd: [goodId(g)], text: 'Wrapped in oiled cloth and stowed in your bag.' })
			};
		}
	},
	{
		id: 'market-sell',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (goodsInBag(c).some((id) => goodOf(id) !== c.city.exports) ? 7 : 0),
		make: (c) => {
			const n = npc(c, 'merchant');
			const id = c.rng.pick(goodsInBag(c).filter((x) => goodOf(x) !== c.city.exports));
			const g: Good = goodOf(id);
			const price = sellPrice(c.run, g, c.city.id);
			const low = Math.round(price * 0.6);
			return {
				id: 'market-sell',
				npc: n,
				text: `${n.name}'s eyes widen at your ${g}. "In ${place(c)}, ${g} like this fetches about ${price} silver. Let's talk."`,
				left: ch('Haggle hard', {}, { tags: ['trade', 'talk'], itemRemove: [id], gamble: { p: odds(c, 0.5, ['trade', 'talk']), win: { fx: { silver: price + 8, renown: 3 }, text: 'A legendary bargain.' }, lose: { fx: { silver: low, renown: -2 }, text: 'Insulted, they pay a pittance.' } } }),
				right: ch(`Sell (${price})`, { silver: price }, { tags: ['trade'], itemRemove: [id], text: 'Coins ring on the counter.' })
			};
		}
	},
	{
		id: 'market-news',
		where: 'city',
		tags: ['trade', 'talk'],
		make: (c) => {
			const n = npc(c, 'merchant');
			const g = c.rng.pick<Good>(['silk', 'tea', 'pepper', 'porcelain', 'cotton', 'nutmeg', 'coffee', 'sugar', 'furs', 'gemstones']);
			const what = c.rng.pick(['a blight', 'a war', 'a royal wedding', 'a new fashion at court', 'a shipwreck of the whole fleet']);
			return {
				id: 'market-news',
				npc: n,
				text: `"Have you heard?" ${n.name} whispers. "${what[0].toUpperCase() + what.slice(1)} — ${g} prices are about to soar everywhere."`,
				left: ch('Rumors are cheap', {}),
				right: ch('Pay for the details', { silver: -3 }, { tags: ['trade'], setFlag: { ['boom:' + g]: true, ['boomUntil:' + g]: c.run.day + 40 }, text: `For forty days, ${g} sells for far more. Buy low, sail fast.` })
			};
		}
	},
	{
		id: 'luggage',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (c.run.bagKind === 'trunk' ? 0 : c.run.bag.length >= BAGS[c.run.bagKind].slots - 1 ? 4 : 1.2),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Luggage maker' });
			const order = ['bundle', 'satchel', 'chest', 'trunk'];
			const next = BAGS[order[Math.min(order.length - 1, order.indexOf(c.run.bagKind) + 1)]];
			const best = BAGS[order[Math.min(order.length - 1, order.indexOf(c.run.bagKind) + 2)]];
			return {
				id: 'luggage',
				npc: n,
				text: `${n.name} eyes your ${BAGS[c.run.bagKind].name.toLowerCase()} with pity. "A ${next.name.toLowerCase()} — ${next.slots} slots — for ${next.price}. Or the ${best.name.toLowerCase()}, ${best.slots} slots, for ${best.price}."`,
				left: ch(`${next.name} (${next.price})`, { silver: -next.price }, { tags: ['trade'], bag: next.id, text: `${next.glyph} Much better.` }),
				right: ch(best.id === next.id ? 'Keep your old bag' : `${best.name} (${best.price})`, best.id === next.id ? {} : { silver: -best.price, renown: best.id === 'trunk' ? 4 : 0 }, best.id === next.id ? {} : { tags: ['trade'], bag: best.id, text: `${best.glyph} Porters gasp in admiration.` })
			};
		}
	},
	{
		id: 'horse-trader',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (c.run.mount ? 0.6 : 2.2),
		when: (c) => mountsFor(c.city.culture).length > 0,
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Beast trader' });
			const opts = c.rng.shuffle(mountsFor(c.city.culture));
			const a = MOUNTS[opts[0]];
			const b = MOUNTS[opts[1] ?? opts[0]];
			const swap = c.run.mount ? ` He'll take ${c.run.mount.name} in trade.` : '';
			const credit = c.run.mount ? Math.round(MOUNTS[c.run.mount.kind].price * 0.5 * (c.run.mount.health / 100)) : 0;
			return {
				id: 'horse-trader',
				npc: n,
				text: `${n.name} slaps the flank of a ${a.name.toLowerCase()}. "${a.desc}" Behind it, a ${b.name.toLowerCase()} chews thoughtfully.${swap}`,
				left: ch(`${a.glyph} ${a.name} (${a.price - credit})`, { silver: -(a.price - credit) }, { tags: ['trade'], mount: a.kind, text: `You name it ${MOUNT_NAMES[n.seed % MOUNT_NAMES.length]}.` }),
				right: a.kind === b.kind ? ch('Just browsing', {}) : ch(`${b.glyph} ${b.name} (${b.price - credit})`, { silver: -(b.price - credit) }, { tags: ['trade'], mount: b.kind, text: `You name it ${MOUNT_NAMES[(n.seed + 3) % MOUNT_NAMES.length]}.` })
			};
		}
	},
	{
		id: 'outfitter',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (bagFree(c) > 0 ? 2 : 0),
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Outfitter' });
			const pool = ['rations', 'medicine', 'charm', 'sword', 'lockbox', 'finery', 'lantern', 'gift', ...(c.year >= 1600 ? ['spyglass'] : []), ...(c.year >= 1650 ? ['pistol'] : []), ...(['tibetan', 'steppe', 'han'].includes(c.city.culture) ? ['teabrick'] : [])];
			const [a, b] = c.rng.sample(pool.filter((x) => !carrying(c, x) || ITEMS[x].kind === 'supply'), 2).map((x) => ITEMS[x]);
			return {
				id: 'outfitter',
				npc: n,
				text: `${n.name}'s shop is crammed to the rafters. "For the road? ${a.glyph} ${a.name} — ${a.desc.toLowerCase()} Or ${b.glyph} ${b.name.toLowerCase()}."`,
				left: ch(`${a.name} (${a.price})`, { silver: -a.price }, { tags: ['trade'], itemAdd: [a.id] }),
				right: ch(`${b.name} (${b.price})`, { silver: -b.price }, { tags: ['trade'], itemAdd: [b.id] })
			};
		}
	},
	{
		id: 'forger',
		where: 'city',
		tags: ['crime'],
		weight: (c) => (c.run.heat > 30 || has(c, 'smuggler') || has(c, 'wanted') ? 2 : 0.5),
		when: (c) => !carrying(c, 'papers'),
		make: (c) => {
			const n = npc(c, 'scholar', { title: 'Forger' });
			return {
				id: 'forger',
				npc: n,
				text: `In a back room smelling of ink, ${n.name} can make you anyone. "New papers. New name. Very old seals."`,
				left: ch('Leave quietly', {}),
				right: ch('Buy forged papers (10)', { silver: -10 }, { tags: ['crime'], itemAdd: ['papers'], heat: -10, text: 'You are now, officially, someone else.' })
			};
		}
	},
	// ===== hiring =====
	{
		id: 'recruit',
		where: 'city',
		weight: (c) => (crewFull(c) ? 0 : 2.4),
		make: (c) => {
			const roles: CrewRole[] = ['bodyguard', 'guide', 'cook', 'healer', ...(c.city.port ? (['navigator', 'navigator'] as CrewRole[]) : []), ...(isForeigner(c) ? (['interpreter', 'interpreter'] as CrewRole[]) : []), ...(c.run.heat > 20 || has(c, 'smuggler') ? (['thief'] as CrewRole[]) : [])];
			const [r1, r2] = c.rng.sample(roles.filter((r) => !withCrew(c, r)), 2);
			const a = companion(c, r1);
			const b = r2 ? companion(c, r2) : null;
			const pitch: Record<CrewRole, string> = {
				bodyguard: 'Scarred knuckles, quiet eyes.',
				navigator: 'Knows every reef from here to Hormuz.',
				guide: 'Knows the goat paths and the bandit camps.',
				interpreter: 'Speaks six languages and lies in all of them politely.',
				healer: 'Carries needles, herbs and a terrible bedside manner.',
				thief: 'Cannot keep their hands still. Or in their own pockets.',
				cook: 'Can make a feast from a boot.',
				companion: '',
				heir: '',
				ward: ''
			};
			return {
				id: 'recruit',
				npc: a.npc,
				text: `At the hiring hall: ${a.npc.name}, ${CREW[r1].title.toLowerCase()} — "${pitch[r1]}"${b ? ` And ${b.npc.name}, ${CREW[r2].title.toLowerCase()} — "${pitch[r2]}"` : ''}`,
				left: b ? ch(`Hire the ${CREW[r2].title.toLowerCase()}`, { silver: -b.wage * 2 }, { crewAdd: b, text: `${b.npc.name} shoulders a pack. (${CREW[r2].desc})` }) : ch('Travel alone', {}),
				right: ch(`Hire the ${CREW[r1].title.toLowerCase()}`, { silver: -a.wage * 2 }, { crewAdd: a, text: `${a.npc.name} joins you. (${CREW[r1].desc})` })
			};
		}
	},
	// ===== rest & faith =====
	{
		id: 'inn',
		where: 'city',
		tags: ['rest'],
		weight: (c) => (c.run.stats.vigor < 45 ? 4 : 2),
		make: (c) => {
			const n = npc(c, 'innkeeper');
			return {
				id: 'inn',
				npc: n,
				text: `${n.name} offers a room with a real bed, a bath, and ${c.local.food} for supper.${c.run.crew.length ? ' Your companions look hopeful.' : ''}`,
				left: ch('Sleep in the stable', { vigor: 2 }, { loyalty: -5, mountHurt: -10, text: 'Hay in your hair. Horse breath on your face.' }),
				right: ch(`Take rooms (${5 + c.run.crew.length * 2})`, { silver: -(5 + c.run.crew.length * 2), vigor: 14 }, { tags: ['rest', 'food'], days: 1, loyalty: 8, mountHurt: -20, text: 'Everyone sleeps like the dead, but better.' })
			};
		}
	},
	{
		id: 'holy-place',
		where: 'city',
		tags: ['faith'],
		weight: 2,
		make: (c) => {
			const n = npc(c, 'monk');
			return {
				id: 'holy-place',
				npc: n,
				text: `At the great ${c.local.holyPlace} of ${place(c)}, ${n.name} invites you to light incense and give alms.`,
				left: ch('Just look around', { fortune: 2 }),
				right: ch('Give generously', { silver: -8, fortune: 13 }, { tags: ['faith'], text: 'The bell rings as you leave. A good sign.' }),
				up: c.run.heat > 30 ? up('Wanted', 'Beg sanctuary', { fortune: 4 }, { heat: -30, days: 2, text: 'Two days of sweeping temple floors. The hunters lose your trail.' }) : undefined
			};
		}
	},
	{
		id: 'festival',
		where: 'city',
		tags: ['art', 'rest'],
		weight: 0.35, // real-calendar festivals live in festivals.ts
		make: (c) => {
			const n = npc(c, 'performer');
			return {
				id: 'festival',
				npc: n,
				text: `You've arrived during ${c.local.festival}! ${n.name} drags you toward the music and lanterns.`,
				left: ch('Stay focused', { fortune: -3 }, { text: 'Duty first. The music fades behind you.' }),
				right: ch('Celebrate!', { silver: -5, fortune: 9, renown: 5, vigor: 4 }, { tags: ['rest', 'art'], days: 1, loyalty: 10, text: 'You dance with strangers until dawn.' })
			};
		}
	},
	{
		id: 'debate',
		where: 'city',
		tags: ['talk', 'art'],
		make: (c) => {
			const n = npc(c, 'scholar');
			const p = odds(c, 0.45, ['talk', 'art']);
			return {
				id: 'debate',
				npc: n,
				text: `In a crowded tea house, ${n.name} challenges any traveller to debate ${c.rng.pick(['the nature of virtue', 'whether the earth is round', 'the best poet of the age', 'the duties of a ruler', 'the sound of one hand clapping'])}.`,
				left: ch('Sip your tea quietly', {}),
				right: ch('Accept the challenge', {}, { tags: ['talk', 'art'], gamble: { p, win: { fx: { renown: 14 }, text: 'The room erupts. You are quoted for weeks.' }, lose: { fx: { renown: -10 }, text: 'Dismantled. Thoroughly. Publicly.' } } }),
				up: has(c, 'scholar') || has(c, 'bookworm') ? up('Learned', 'Quote the classics until they surrender', { renown: 16 }, { tags: ['talk'], text: 'Your opponent bows and buys the tea.' }) : undefined
			};
		}
	},
	{
		id: 'official-shakedown',
		where: 'city',
		tags: ['official'],
		weight: (c) => ((isForeigner(c) ? 3 : 1.5) + c.run.heat / 25) * (standingHere(c) <= -25 ? 2 : standingHere(c) >= 40 ? 0.35 : 1),
		make: (c) => {
			const n = npc(c, 'official');
			const p = odds(c, 0.45, ['official', 'talk']);
			return {
				id: 'official-shakedown',
				npc: n,
				text: `${n.name}, ${n.title} of ${place(c)}, finds your presence "irregular." A fee would regularize it.`,
				left: ch('Argue the law', {}, { tags: ['official', 'talk'], gamble: { p, win: { fx: { renown: 9 }, text: 'You quote the statute. They retreat, red-faced.' }, lose: { fx: { renown: -8, silver: -10 }, text: 'A larger fee, plus a fine for arguing.' } } }),
				right: ch('Pay the fee', { silver: -9 }, { tags: ['official', 'bribe'], text: 'Your irregularity is regularized.' }),
				up: carrying(c, 'gift') ? up('Gift box', 'Present a lacquered gift', { renown: 8 }, { itemRemove: ['gift'], tags: ['official'], text: 'Fees are waived for such a cultured guest.' }) : withCrew(c, 'interpreter') ? up('Interpreter', 'Let your interpreter smooth it over', { renown: 3 }, { loyalty: 4, text: 'A misunderstanding, apparently. Smiles all round.' }) : undefined
			};
		}
	},
	{
		id: 'thief',
		where: 'city',
		tags: ['crime', 'fight'],
		make: (c) => {
			const n = npc(c, 'child', { title: 'Pickpocket' });
			const p = odds(c, 0.5, ['fight']);
			return {
				id: 'thief',
				npc: n,
				text: `A tug at your belt — ${n.name} darts into the crowd with your purse!`,
				left: ch('Chase them', {}, { tags: ['fight'], gamble: { p, win: { fx: { vigor: -3, renown: 4 }, text: 'Caught by the collar. Purse returned.' }, lose: { fx: { vigor: -7, silver: -10 }, text: 'Lost in the alleys. Purse gone.' } } }),
				right: ch('Let it go', { silver: -8, fortune: 4 }, { tags: ['mercy'], remember: { kind: 'favor', deed: 'let a pickpocket keep your purse' }, text: 'Perhaps they need it more.' }),
				up: carrying(c, 'lockbox') ? up('Iron lockbox', 'Laugh — your silver is locked away', { renown: 2 }, { text: 'The urchin finds only a button and a rude note.' }) : withCrew(c, 'thief') ? up('Cat burglar', 'Your burglar steals it back — and theirs', { silver: 6 }, { tags: ['crime'], text: 'Professional courtesy, of a kind.' }) : undefined
			};
		}
	},
	{
		id: 'escort-job',
		where: 'city',
		tags: ['trade', 'fight'],
		make: (c) => {
			const n = npc(c, 'merchant');
			return {
				id: 'escort-job',
				npc: n,
				text: `${n.name} needs a guard for a short haul out of ${place(c)}. Good pay. Probably not dangerous.`,
				left: ch('Refuse', {}),
				right: ch('Take the job', { silver: 15, vigor: -8 }, { tags: ['trade', 'fight'], days: 2, text: 'Two dusty days. Honest silver.' })
			};
		}
	},
	{
		id: 'odd-job',
		where: 'city',
		tags: ['trade'],
		weight: (c) => (c.run.stats.silver < 40 ? 4 : 1),
		make: (c) => {
			const n = npc(c, c.city.port ? 'captain' : 'merchant');
			const job = c.city.port ? 'unload a ship before the tide turns' : c.rng.pick(['copy ledgers by lamplight', 'guard a warehouse overnight', 'carry sedan chairs for a wedding', 'translate for a foreign buyer']);
			return {
				id: 'odd-job',
				npc: n,
				text: `${n.name} is short-handed. "Help me ${job} and I'll pay in good coin."`,
				left: ch('Rest instead', { vigor: 5 }),
				right: ch('Earn your keep', { silver: 13, vigor: -7 }, { tags: ['trade'], days: 1, text: 'Honest sweat, honest silver.' }),
				up: c.run.mount && MOUNTS[c.run.mount.kind].slots >= 4 ? up(MOUNTS[c.run.mount.kind].name, `Hire out ${c.run.mount.name} for hauling`, { silver: 12 }, { mountHurt: 10, text: `${c.run.mount.name} earns their keep for once.` }) : undefined
			};
		}
	},
	{
		id: 'tavern-tale',
		where: 'city',
		tags: ['talk', 'art'],
		weight: (c) => (c.run.visited.length >= 3 ? 1.5 : 0),
		make: (c) => {
			const n = npc(c, 'innkeeper');
			return {
				id: 'tavern-tale',
				npc: n,
				text: `"You've seen ${c.run.visited.length} cities?" ${n.name} leans in. "Tell my guests about them, and your supper's free — plus a cut of the takings."`,
				left: ch('Keep your stories', {}),
				right: ch('Hold court', { silver: 9, renown: 4, vigor: 4 }, { tags: ['talk', 'art'], text: 'Every exaggeration earns another round.' })
			};
		}
	},
	{
		id: 'tonic',
		where: 'city',
		tags: ['illness'],
		weight: (c) => (c.run.stats.vigor < 40 ? 4 : 1),
		make: (c) => {
			const n = npc(c, 'healer');
			const p = odds(c, 0.6, ['illness']);
			const remedy = c.local.id === 'korean' ? 'red ginseng' : c.local.id === 'indian' ? 'an Ayurvedic paste' : c.local.id === 'european' ? 'a tincture of laudanum' : c.local.id === 'han' ? 'a bitter herbal broth' : 'a mysterious elixir';
			return {
				id: 'tonic',
				npc: n,
				text: `${n.name} takes your pulse, frowns, and prescribes ${remedy}.`,
				left: ch('Buy a medicine chest instead (8)', { silver: -8 }, { itemAdd: ['medicine'], text: 'For later. Probably wise.' }),
				right: ch('Pay and drink', { silver: -6 }, { tags: ['illness'], gamble: { p, win: { fx: { vigor: 16 }, text: 'Warmth spreads to your toes.' }, lose: { fx: { vigor: -5 }, text: 'You suspect it was mostly mud.' } } })
			};
		}
	},
	{
		id: 'tea-gossip',
		where: 'city',
		tags: ['talk'],
		make: (c) => {
			const n = npc(c, 'elder');
			return {
				id: 'tea-gossip',
				npc: n,
				text: `Over ${c.local.drink}, ${n.name} offers gossip about the routes out of ${place(c)} — for the price of the drink.`,
				left: ch('Drink alone', {}),
				right: ch('Buy a round', { silver: -3, renown: 2 }, { tags: ['talk'], setFlag: { tip: 1 }, text: 'Useful whispers about winds and roads.' })
			};
		}
	},
	{
		id: 'den',
		where: 'city',
		tags: ['gamble', 'crime'],
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Den keeper' });
			const p = odds(c, 0.4, ['gamble']);
			return {
				id: 'den',
				npc: n,
				text: `Behind a beaded curtain, ${n.name}'s gambling den hums with ${c.local.game}. The house always wins. Usually.`,
				left: ch('Walk away', { fortune: 2 }),
				right: ch('Bet big', {}, { tags: ['gamble'], gamble: { p, win: { fx: { silver: 24 }, text: 'The whole room watches you collect.' }, lose: { fx: { silver: -16, fortune: -4 }, text: 'The house wins.' } } }),
				up: carrying(c, 'fox-mask') ? up('Kitsune mask', 'Wear the fox mask to the table', { silver: 30 }, { tags: ['gamble'], text: 'The dice seem to obey you. The keeper sweats.' }) : undefined
			};
		}
	},
	{
		id: 'romance',
		where: 'city',
		tags: ['romance'],
		weight: (c) => (c.run.romance && c.run.romance.status !== 'parted' ? 0.15 : 1),
		make: (c) => {
			const n = npc(c, 'lover');
			const line = c.rng.pick(['laughs at your terrible jokes', 'shares an umbrella with you in the rain', 'knows every hidden garden in the city', 'challenges you to a game and lets you almost win', 'sings a song from your homeland']);
			const love: Companion = { id: 'companion-' + n.seed, npc: { ...n, title: 'Beloved' }, role: 'companion', wage: 0, loyalty: 85, joinedDay: c.run.day };
			return {
				id: 'romance',
				npc: n,
				text: `${n.name} ${line}. "Stay a few days longer?" they ask. Your commission tugs at your sleeve.`,
				left: ch('Swipe left: duty calls', { fortune: -3 }, { remember: c.rng.chance(0.5) ? { kind: 'grudge', deed: 'turned down their love' } : false, text: 'You leave a letter. You hope they read it.' }),
				right: ch('Swipe right: stay', { vigor: 12, fortune: 8 }, { tags: ['romance'], days: 3, romance: { start: true, affection: 15 }, remember: { kind: 'favor', deed: 'spent three golden days together' }, text: 'Three golden days. You will remember them.' }),
				up: !crewFull(c) && !withCrew(c, 'companion') ? up('It’s a match', '"Come with me."', { vigor: 6, fortune: 10 }, { tags: ['romance'], crewAdd: love, romance: { start: true, affection: 30 }, text: `${n.name} packs a bag in four minutes flat.` }) : undefined
			};
		}
	},
	{
		id: 'portrait',
		where: 'city',
		tags: ['art'],
		make: (c) => {
			const n = npc(c, 'performer', { title: c.local.id === 'japanese' ? 'Ukiyo-e artist' : c.local.id === 'persian' || c.local.id === 'indian' ? 'Miniature painter' : 'Portrait painter' });
			return {
				id: 'portrait',
				npc: n,
				text: `${n.name} begs to paint you. "Such a face! The face of a traveller who has seen ${c.run.visited.length} cities!"`,
				left: ch('Too vain a thing', {}),
				right: ch('Sit for it', { silver: -5, renown: 9 }, { tags: ['art'], days: 1, heat: c.run.heat > 0 ? 8 : 0, text: c.run.heat > 0 ? 'It hangs in a tea house. Unfortunately, so does your wanted poster.' : 'It hangs in a tea house. People point.' })
			};
		}
	},
	{
		id: 'court',
		where: 'city',
		tags: ['official', 'talk'],
		when: (c) => c.run.stats.renown >= 55 || standingHere(c) >= 40,
		make: (c) => {
			const n = npc(c, 'noble');
			return {
				id: 'court',
				npc: n,
				text: `Your reputation precedes you. ${n.name} invites you to court to tell of your travels.`,
				left: ch('Plead urgent business', { renown: -5 }),
				right: ch('Attend in finery', { silver: 8, renown: 12, vigor: -3 }, { tags: ['official', 'talk'], days: 2, text: 'Gifts, banquets, and dangerous admirers.' }),
				up: carrying(c, 'gift') ? up('Gift box', 'Present a gift to the court', { silver: 15, renown: 8 }, { itemRemove: ['gift'], itemAdd: ['credit'], text: 'In return: a letter of credit with the royal seal.' }) : undefined
			};
		}
	},
	{
		id: 'bath',
		where: 'city',
		tags: ['rest'],
		when: (c) => ['japanese', 'ottoman', 'persian', 'korean', 'european'].includes(c.city.culture),
		make: (c) => {
			const kind = c.city.culture === 'japanese' ? 'onsen' : c.city.culture === 'korean' ? 'bathhouse' : c.city.culture === 'european' ? 'spa' : 'hammam';
			const n = npc(c, 'innkeeper', { title: 'Bath attendant' });
			return {
				id: 'bath',
				npc: n,
				text: `The ${kind} of ${place(c)} steams invitingly. ${n.name} promises to scrub away a thousand li of dust.`,
				left: ch('Wash in the river', { vigor: 2 }),
				right: ch('Soak for hours', { silver: -4, vigor: 12 }, { tags: ['rest'], text: 'Reborn. Pink, but reborn.' })
			};
		}
	},
	{
		id: 'treasure-dig',
		where: 'city',
		weight: 50,
		when: (c) => c.run.flags.treasure === c.city.id,
		make: (c) => {
			const n = npc(c, 'child', { title: 'Curious local' });
			const p = odds(c, 0.6, []);
			return {
				id: 'treasure-dig',
				npc: n,
				text: `This is the place on the map. ${n.name} watches you pace and count steps. "Digging for something?"`,
				left: ch('Burn the map', { fortune: 5 }, { clearFlag: ['treasure'], text: 'Some secrets should stay buried.' }),
				right: ch('Dig at midnight', {}, { clearFlag: ['treasure'], gamble: { p, win: { fx: { silver: 30, fortune: 5 }, text: 'A lacquered box of old silver coins!' }, lose: { fx: { vigor: -8, renown: -6 }, text: 'Only bones — and a furious watchman.' } } })
			};
		}
	},
	// ===== hero-specific =====
	{
		id: 'patient',
		where: 'city',
		tags: ['illness', 'trade'],
		weight: (c) => (has(c, 'physician') || has(c, 'herbalist') ? 3 : 0),
		make: (c) => {
			const n = npc(c, 'merchant');
			return {
				id: 'patient',
				npc: n,
				text: `Word spreads a healer is in town. ${n.name} begs you to see their sick father. They can pay.`,
				left: ch('Rest instead', { vigor: 4 }),
				right: ch('Treat him', { silver: 12, renown: 6, vigor: -4 }, { tags: ['illness'], text: 'He sits up and demands dumplings. A good sign.' })
			};
		}
	},
	{
		id: 'performance',
		where: 'city',
		tags: ['art'],
		weight: (c) => (has(c, 'performer') || has(c, 'poet') ? 3 : 0),
		make: (c) => {
			const n = npc(c, 'innkeeper');
			return {
				id: 'performance',
				npc: n,
				text: `${n.name}'s teahouse is packed and the entertainer never showed. "You! You look artistic."`,
				left: ch('Decline', {}),
				right: ch('Take the stage', { silver: 10, renown: 8, vigor: -3 }, { tags: ['art'], text: 'Standing ovation. Someone throws a plum.' })
			};
		}
	}
];

export const ANY_T: Template[] = [
	{
		id: 'roadside-oracle',
		where: 'any',
		tags: ['faith', 'gamble'],
		make: (c) => {
			const n = npc(c, 'fortune-teller');
			const p = odds(c, 0.5, ['faith']);
			const method = c.local.id === 'han' || c.local.id === 'korean' ? 'shakes bamboo sticks from a cup' : c.local.id === 'indian' ? 'reads the lines of your palm' : c.local.id === 'european' ? 'turns tarot cards' : 'casts bones on a cloth';
			return {
				id: 'roadside-oracle',
				npc: n,
				text: `${n.name} ${method}. "A coin and I'll tell you how your journey ends."`,
				left: ch('Scoff', { fortune: -4 }, { text: '"Ha," she says. Just "ha."' }),
				right: ch('Pay the coin', { silver: -3 }, { tags: ['faith'], gamble: { p, win: { fx: { fortune: 14 }, text: '"Great luck. Greater than you deserve."' }, lose: { fx: { fortune: -10 }, text: '"...Perhaps take the safer roads."' } } }),
				up: has(c, 'fox-blooded') ? up('Fox-Blooded', 'Read *her* fortune instead', { fortune: 8, renown: 4 }, { text: 'She goes pale, and refunds you twice.' }) : undefined
			};
		}
	},
	{
		id: 'poet-road',
		where: 'any',
		tags: ['art'],
		make: (c) => {
			const n = npc(c, 'scholar');
			return {
				id: 'poet-road',
				npc: n,
				text: `${n.name} is composing verses about the ${c.where === 'travel' ? 'road' : place(c)}. "Patron me, and you'll be immortal in my poem."`,
				left: ch('Decline', {}, { text: 'You will be mortal, then.' }),
				right: ch('Become a patron', { silver: -7, renown: 10 }, { tags: ['art'], text: 'The poem is... long. But your name rhymes with greatness.' }),
				up: has(c, 'poet') ? up('Wandering Poet', 'Challenge them to a verse duel', { renown: 14 }, { tags: ['art'], text: 'Your final couplet makes them weep.' }) : undefined
			};
		}
	},
	{
		id: 'street-food',
		where: 'any',
		tags: ['food'],
		make: (c) => {
			const n = npc(c, 'merchant', { title: 'Food seller' });
			const p = odds(c, 0.5, ['food']);
			return {
				id: 'street-food',
				npc: n,
				text: `${n.name} offers steaming ${c.local.food} of uncertain age. It smells incredible. Mostly.`,
				left: ch('Eat your dry rations', { vigor: -3 }),
				right: ch('Eat it', { silver: -1 }, { tags: ['food', 'illness'], gamble: { p, win: { fx: { vigor: 10 }, text: 'Glorious. You weep a little.' }, lose: { fx: { vigor: -13 }, text: 'Three days of regret.' } } }),
				up: withCrew(c, 'cook') ? up('Road cook', 'Let your cook judge it', { vigor: 8 }, { tags: ['food'], text: '"Not that one. THIS one." Delicious and safe.' }) : undefined
			};
		}
	},
	{
		id: 'duelist',
		where: 'any',
		tags: ['fight'],
		weight: (c) => (has(c, 'swordmaster') || has(c, 'ronin') ? 3 : 0.4),
		make: (c) => {
			const n = npc(c, 'soldier', { title: c.local.id === 'japanese' ? 'Wandering swordsman' : 'Challenger' });
			const p = odds(c, 0.45, ['fight']);
			return {
				id: 'duelist',
				npc: n,
				text: `${n.name} blocks your path, hand on hilt. "They say you are skilled. I say prove it."`,
				left: ch('Bow and refuse', { renown: -6 }, { text: '"Coward," they spit. You live.' }),
				right: ch('Duel', {}, { tags: ['fight'], gamble: { p, win: { fx: { renown: 16 }, text: 'One stroke. Silence. Then their bow.' }, lose: { fx: { vigor: -20, renown: -6 }, text: 'A long scar, and a longer lesson.' } } }),
				up: withCrew(c, 'bodyguard') ? up('Bodyguard', 'Send your bodyguard as champion', { renown: 6 }, { tags: ['fight'], gamble: { p: odds(c, 0.6, ['fight']), win: { fx: { renown: 6 }, text: 'Your champion wins. Reflected glory is still glory.' }, lose: { fx: {}, text: 'Your champion loses — and limps home.' } }, loyalty: -5 }) : undefined
			};
		}
	}
];

