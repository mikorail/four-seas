import { CULTURES } from '#lib/data/cultures';
import { CITY } from '#lib/data/world';
import { STATS, type Stat } from '#lib/data/traits';
import { ITEMS } from '#lib/data/items';
import { GOAL } from '#lib/data/goals';
import { capOf } from '../mods';
import { isCrisis, buildCrisisCard } from '../cards/crisis';
import type { Ending, EndingKind, LogEntry, Run } from '../types';
import { here, log } from './utils';

export interface EndingCause {
	stat?: Stat;
	dir?: 'low' | 'high';
	headline: string;
	straw?: LogEntry; // the choice that tipped it over
	runup: LogEntry[]; // the blows before that
	series?: number[]; // the fatal stat over time
	tip: string;
}

const TIPS: Record<string, string> = {
	'vigor-low': 'Vigor is health. Rest at an inn (it also restores energy), eat, carry medicine (it saves you once), hire a physician, and avoid risky fights when you are below 30.',
	'vigor-high': 'Even strength can be too much: at the top, swipe on gentler, riskier or costlier options to bleed a little off.',
	'silver-low': 'Keep silver above 20: sell curios where they are prized, carry trade goods to distant markets, take odd jobs at the docks, and say no to bribes you do not need.',
	'silver-high': 'Too much silver draws thieves and tax men. Spend it: bags, outfits, mounts, a ship, or bank it with your factors in the Fleet tab.',
	'renown-low': 'Renown is your name. Tell stories in the square, present yourself at court, debate at academies, and avoid crimes that get you caught.',
	'renown-high': 'Too famous is dangerous. Wear a disguise, lie low, travel under forged papers, and refuse the flashiest options for a while.',
	'fortune-low': 'Fortune is luck. Pray at temples, keep charms, join festivals and avoid games of chance when your luck is already thin.',
	'fortune-high': 'Heaven distrusts favourites. When luck is near the top, gamble a little, give alms, or let a festival spend it.',
	'mind-low': 'Mind is composure. Failed gambles, heavy losses and cruelty wear it down; rest, festivals, faith, art, food and love restore it. A high Will softens every blow, and a Stone Heart never breaks (it just stops caring).',
	late: 'Watch the days. Choose the shortest routes, buy a horse or camel, hire a guide or navigator, and skip a city when the clock is tight.',
	jailed: 'Heat (🏮) above 60 brings the constables. Lie low, cross borders to cool it, pay fines, bribe, or wear a disguise.',
	campaign: 'Every campaign has several endings: try the other side, or a hidden option.',
	retired: 'You chose to stop here.',
	prince: 'You chose to stop here.',
	settled: 'You chose to stop here.',
	victory: 'Try a harder difficulty, a hardship start, or a flaw for a bigger score.',
	second: 'Your rival got there first: keep an eye on the ◌ marker and delay them when a card lets you.'
};

/** Unique "retire into it" epilogue when the traveller has completed their life goal. */
export function goalEpilogue(run: Run): { title: string; text: string } | null {
	if (run.goal?.done === undefined) return null;
	const gid = run.goal.id;
	const p = here(run);
	const name = run.hero.name;
	const prof = run.hero.profession;

	// Profession-flavoured overrides when retiring with a completed goal
	if (prof === 'bard' || prof === 'playwright' || prof === 'actor' || gid === 'storyteller') {
		return {
			title: 'The Story House',
			text: `In ${p}, ${name} hangs a painted lantern above a low cedar door and opens a story house. Travellers pay in copper or in tales of their own. Every evening the benches fill, the tea steams, and the roads of the four seas live again in your voice.`
		};
	}
	if (prof === 'thief' || prof === 'smuggler') {
		return {
			title: 'The Quiet Villa',
			text: `Under a spotless new name in ${p}, ${name} retires into a walled garden bought with silk and borrowed silver. Magistrates come to drink your vintage tea, never guessing whose fingers once lightened their strongboxes.`
		};
	}
	if (prof === 'cook') {
		return {
			title: 'The Kitchen of Eight Winds',
			text: `In ${p}, ${name} opens an inn where every dish carries a memory of a distant port: saffron from Hormuz, pepper from Calicut, mountain tea from Sichuan. Even Viceroys wait in line for a bowl.`
		};
	}
	if (prof === 'painter' || prof === 'writer') {
		return {
			title: 'Master of the Studio',
			text: `In ${p}, ${name} grinds sumi ink by a window overlooking the roofs. Your scrolls and travelogues of the four seas pass from hand to hand in academies from Kyoto to Venice.`
		};
	}

	const BY_GOAL: Record<string, { title: string; text: string }> = {
		'see-the-seas': {
			title: 'Cartographer of Every Shore',
			text: `Having walked among eight peoples and seen every horizon, ${name} settles in ${p} to bind a grand atlas. Young captains come to copy your soundings before they dare the open sea.`
		},
		fame: {
			title: 'Guest of Four Courts',
			text: `Honoured in four realms, ${name} retires in ${p} with seals of safe conduct from rival emperors. Embassies still stop at your gate to ask how peace is kept.`
		},
		love: {
			title: 'Two Cups on One Table',
			text: `${name} lays down the courier's satchel in ${p} beside ${run.romance?.npc.name ?? 'their beloved'}. Let younger feet race the monsoon; your harbour is right here.`
		},
		mastery: {
			title: 'The Grandmaster’s Hall',
			text: `Having honed a craft to its summit on the open road, ${name} opens a quiet hall in ${p}. Apprentices sweep the courtyard at dawn, hoping to learn half of what the road taught you.`
		},
		fortune: {
			title: 'House of the Golden Scale',
			text: `With ${run.treasury} taels banked with the factors, ${name} establishes a counting house in ${p}. Your letters of credit are honoured from Nagasaki to Alexandria.`
		},
		polyglot: {
			title: 'The House of Many Tongues',
			text: `In ${p}, ${name} becomes the interpreter every foreign ship asks for first. Six languages share your courtyard table without a single raised voice.`
		},
		pilgrim: {
			title: 'Keeper of the Way-Shrine',
			text: `Having bowed at three great sanctuaries, ${name} tends a quiet wayside shrine in ${p}. Dusty pilgrims find dry sandals, hot broth, and a host who knows every pass.`
		},
		atonement: {
			title: 'The Mended Ledger',
			text: `Every old debt paid back in kindness, ${name} rests at last in ${p}. Sleep comes easily now, and strangers greet you as an old friend.`
		},
		secrets: {
			title: 'Keeper of the Hidden Passes',
			text: `Knowing four roads that appear on no imperial map, ${name} retires in ${p}. Only those fleeing tyranny or carrying hopeless causes are shown your chalk marks in the hills.`
		},
		legends: {
			title: 'Peer of Legends',
			text: `Having shared wine and steel with the living legends of the age, ${name} settles in ${p}. When ballad-singers name the great figures of the century, your name is in the verse.`
		},
		home: {
			title: 'Under the Quince Tree',
			text: `${name} locks the road-gate from the inside in ${here(run)}. The roof is tight, the garden is in bloom, and you never have to pack a bag at dawn again.`
		},
		friends: {
			title: 'A Friend in Every Port',
			text: `${name} retires in ${p}, though you are never truly alone: every ship brings plums, tea, and long letters from friends across five seas.`
		},
		titles: {
			title: 'The Name That Outlives the Road',
			text: `Known by three titles across the world, ${name} hangs up the travel cloak in ${p}. Long after the commission is forgotten, tea-houses still argue over which of your deeds was true.`
		}
	};

	const g = GOAL[gid];
	return (
		BY_GOAL[gid] ?? {
			title: g ? g.name : 'A Life Fulfilled',
			text: `Having fulfilled your life's wish (${g?.name ?? gid}), ${name} sets down the pack in ${p} on your own terms.`
		}
	);
}

export function checkEnd(run: Run): boolean {
	if (run.phase === 'end') return true;
	if (run.flags.end === 'campaign') {
		const won = !!run.flags.endWon;
		if (won) run.delivered = true;
		run.ending = { kind: won ? 'victory' : 'late', won, title: String(run.flags.endTitle ?? 'The End'), text: String(run.flags.endText ?? '') };
		run.phase = 'end';
		return true;
	}
	if (run.flags.end === 'goal') {
		const ep = goalEpilogue(run);
		run.ending = {
			kind: 'settled',
			won: true,
			title: ep?.title ?? 'A Life Fulfilled',
			text: ep?.text ?? `${run.hero.name} retires in ${here(run)}, having accomplished what they set out in life to do.`
		};
		run.phase = 'end';
		return true;
	}
	if (run.flags.end === 'prince' || run.flags.end === 'retired' || run.flags.end === 'settled') {
		const prince = run.flags.end === 'prince';
		const settled = run.flags.end === 'settled';
		const goalEp = !prince ? goalEpilogue(run) : null;
		const romance = run.romance && (run.romance.city === run.location || run.visited.includes(run.romance.city)) && run.romance.status !== 'parted' ? run.romance : null;
		const title = prince ? 'Merchant Prince' : goalEp ? goalEp.title : settled ? 'Settled Life' : 'Retired';
		const text = prince
			? `In ${here(run)}, ${run.hero.name} buys a house with a garden and a counting room. ${run.ventures.length} ${run.ventures.length === 1 ? 'vessel sails' : 'vessels sail'} under your seal, ${run.treasury} taels sit with your factors, and merchants from four seas ask for your advice.`
			: goalEp
				? goalEp.text
				: settled
					? romance
						? `${run.hero.name} lays down the road-stained pack in ${here(run)} to build a home beside ${romance.npc.name}. The four seas are vast, but this hearth is enough.`
						: run.hero.home === run.location
							? `After long wanderings across mountain passes and stormy straits, ${run.hero.name} returns home to ${here(run)}. The maps are hung upon the wall, and the young folk gather to hear tales of the four seas.`
							: `${run.hero.name} chooses freedom over deadlines, settling down in ${here(run)}. You trade in familiar goods, brew tea for passing strangers, and watch the seasons turn without fear of distant couriers.`
					: `${run.hero.name} sets down the travelling pack for good in ${here(run)}. The stories will outlive the traveller, and someone will have to carry them on.`;
		run.ending = {
			kind: prince ? 'prince' : settled ? 'settled' : 'retired',
			won: true,
			title,
			text
		};
		run.phase = 'end';
		return true;
	}
	if (run.flags.end === 'jailed') {
		run.ending = {
			kind: 'jailed',
			won: false,
			title: 'In Chains',
			text: `The cangue is heavy and the cell is damp. In ${here(run)}, ${run.hero.name}'s long list of crimes finally caught up. The ${run.item.replace(/^an? /, '')} is entered into evidence. You will have years to write your memoirs.`
		};
		run.phase = 'end';
		return true;
	}
	if (typeof run.flags.end === 'string' && run.flags.end.startsWith('stat-')) {
		const part = run.flags.end.slice(5);
		if (part === 'mind-low') {
			run.ending = {
				kind: 'mind-low',
				won: false,
				title: 'Lost in the Dream',
				text: `In ${here(run)}, ${run.hero.name} stops answering to their own name. They sit by the ${CULTURES[CITY[run.location].culture].holyPlace} gate and talk, kindly and at length, to voices nobody else can hear. ${run.item[0].toUpperCase() + run.item.slice(1)} is found in their lap, untouched, and sent on by a stranger.`
			};
		} else {
			const [s, dir] = part.split('-') as [Stat, 'low' | 'high'];
			run.ending = statEnding(run, s, dir);
		}
		run.phase = 'end';
		return true;
	}
	if ((run.mind ?? 70) <= 0) {
		run.ending = {
			kind: 'mind-low',
			won: false,
			title: 'Lost in the Dream',
			text: `In ${here(run)}, ${run.hero.name} stops answering to their own name. They sit by the ${CULTURES[CITY[run.location].culture].holyPlace} gate and talk, kindly and at length, to voices nobody else can hear. ${run.item[0].toUpperCase() + run.item.slice(1)} is found in their lap, untouched, and sent on by a stranger.`
		};
		run.phase = 'end';
		return true;
	}
	const crisis = isCrisis(run);
	if (crisis) {
		const crisisCard = buildCrisisCard(run, crisis);
		if (run.deck[0]?.id !== crisisCard.id) run.deck.unshift(crisisCard);
		// the crisis must be seen: from the map (resting, using an item) it opens as a city card
		if (run.phase === 'map') run.phase = 'city';
		run.deckTotal = Math.max(run.deckTotal, run.deck.length);
		const [s, dir] = crisis.split('-') as [Stat, 'low' | 'high'];
		run.stats[s] = dir === 'low' ? 1 : capOf(run, s) - 1;
		const msg = `⚡ On the brink of fate! Make your stand.`;
		log(run, msg);
		return false;
	}
	for (const s of STATS) {
		const v = run.stats[s];
		if (v <= 0 || v >= capOf(run, s)) {
			run.ending = statEnding(run, s, v <= 0 ? 'low' : 'high');
			run.phase = 'end';
			return true;
		}
	}
	if (!run.delivered && run.day > run.deadline) {
		run.ending = {
			kind: 'late',
			won: false,
			title: 'Too Late',
			text: `Day ${run.day}. The deadline has passed. Word reaches you that ${run.patron} has sent another in your place, and that your name is now spoken only in curses. You settle in ${here(run)}, and become the kind of old traveller who tells long stories in tea houses.`
		};
		run.phase = 'end';
		return true;
	}
	return false;
}

export function statEnding(run: Run, s: Stat, dir: 'low' | 'high'): Ending {
	const p = here(run);
	const ruler = CULTURES[CITY[run.location].culture].ruler(run.year);
	const T: Record<string, [string, string]> = {
		'silver-low': ['Penniless', `You sold your mount, then your boots, then your name. ${run.hero.name} ends their days as a debtor in ${p}, the ${run.item.replace(/^an? /, '')} pawned for a bowl of rice.`],
		'silver-high': ['Too Rich to Live', `Tales of your fat purse reached the wrong ears. They found you in a canal near ${p}, purse missing, smile still on your face.`],
		'vigor-low': ['The Fever', `The fever took you in ${p}. A kind stranger sent your journal home. It arrived three years later, and made your mother weep.`],
		'vigor-high': ['Reckless', `Brimming with strength, you joined a band of mercenaries in ${p} "just for one season." Your commission was forgotten. You were very happy, briefly.`],
		'renown-low': ['Disgraced', `No inn in ${p} will host you, no captain will carry you. Your commission is revoked, your name struck from the family register.`],
		'renown-high': ['Gilded Cage', `Your fame reached ${ruler}, who decided so remarkable a traveller must be a spy. You live out your days under very comfortable arrest.`],
		'fortune-low': ['Heaven Turns Away', `In ${p}, a roof tile slipped in the wind. Of all the heads in the market, it chose yours.`],
		'fortune-high': ['The Living Saint', `Convinced you were touched by Heaven, the people of ${p} built you a shrine. They would not let you leave. They still bring you dumplings.`]
	};
	const kind = `${s}-${dir}` as EndingKind;
	const [title, text] = T[kind];
	return { kind, title, text, won: false };
}

export function victory(run: Run): Ending {
	const spare = run.deadline - run.day;
	const second = !!run.rival?.arrived;
	return {
		kind: second ? 'second' : 'victory',
		won: true,
		title: second ? 'Second to Arrive' : 'Commission Fulfilled',
		text: second
			? `Day ${run.day}. You deliver ${run.item}, but ${run.rival!.npc.name} got here first, and the court's gratitude is lukewarm. Still: ${run.visited.length} cities, ${run.legends.length} legends, and you are alive.`
			: `Day ${run.day}, with ${spare} day${spare === 1 ? '' : 's'} to spare and ${run.rival?.npc.name ?? 'your rival'} nowhere in sight, you place ${run.item} in the hands of the court of ${here(run)}. Across ${run.visited.length} cities and ${run.cardsSeen} decisions, ${run.hero.name} has earned a place in the chronicles.`
	};
}

export function score(run: Run): number {
	const base = run.visited.length * 40 + run.cardsSeen * 5 + run.stats.renown * 2 + run.legends.length * 60 + (run.pilgrimages?.length ?? 0) * 50 + Math.max(0, run.karma ?? 0) * 3;
	const QUEST_ITEMS = ['parcel1', 'parcel2', 'parcel3', 'betrothal-seal', 'temple-relic', 'survey-book', 'cursed-blade', 'manuscript', 'heir-seal'];
	const relics = run.bag.filter((id) => ITEMS[id]?.kind === 'relic' && !QUEST_ITEMS.includes(id)).length * 40 + (run.treasury ?? 0) + (run.ventures?.length ?? 0) * 30 + ((run.generation ?? 1) - 1) * 100;
	const factionsScore = Object.values(run.factions ?? {}).reduce((acc, v) => acc + Math.max(0, v) * 2, 0);
	const statusesScore = (run.statuses?.length ?? 0) * 35;
	const settleBonus = run.ending?.kind === 'settled' ? 300 : 0;
	const bonus = run.delivered ? (run.rival?.arrived ? 250 : 500) + Math.max(0, (isFinite(run.deadline) ? run.deadline : run.day) - run.day) * 10 : 0;
	return Math.round((base + relics + factionsScore + statusesScore + settleBonus + bonus) * (run.scoreMult ?? 1));
}

/** Settle down for good: ends the run (counts as a win if the commission was delivered). */
export function retire(run: Run) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	run.flags.end = 'retired';
	checkEnd(run);
}

/** Settle down in the current city to live peacefully on your own terms. Always counts as a victory. */
export function settle(run: Run) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	run.flags.end = 'settled';
	checkEnd(run);
}

/** Retire into a completed life goal with its unique epilogue. */
export function retireIntoGoal(run: Run): boolean {
	if ((run.phase !== 'map' && run.phase !== 'city') || run.goal?.done === undefined) return false;
	run.flags.end = 'goal';
	checkEnd(run);
	return true;
}

/** After a commission (or campaign) is won: forget the old ending so the run can go on. */
export function clearEnding(run: Run) {
	run.ending = null;
	for (const k of ['end', 'endWon', 'endTitle', 'endText']) delete run.flags[k];
	// a finished campaign becomes a free journey: normal deliveries count again
	if (run.flags.campaign) {
		run.flags.campaignDone = run.flags.campaign;
		delete run.flags.campaign;
	}
	run.route = null;
	run.deck = [];
	run.deckTotal = 0;
}

/** Why the journey ended: the stat that broke, the last straw, and what led up to it. */
export function endingCause(run: Run): EndingCause | null {
	const e = run.ending;
	if (!e) return null;
	const m = /^(silver|vigor|renown|fortune)-(low|high)$/.exec(e.kind);
	const withFx = run.log.filter((l) => l.fx && Object.values(l.fx).some((v) => v));
	if (m) {
		const stat = m[1] as Stat;
		const dir = m[2] as 'low' | 'high';
		const hit = (l: LogEntry) => (l.fx?.[stat] ?? 0) * (dir === 'low' ? -1 : 1) > 0;
		const blows = withFx.filter(hit);
		const idx = STATS.indexOf(stat) + 1;
		return {
			stat,
			dir,
			headline: `${stat[0].toUpperCase() + stat.slice(1)} ${dir === 'low' ? 'fell to nothing' : 'overflowed'} (${run.stats[stat]}).`,
			straw: blows[0],
			runup: blows.slice(1, 5),
			series: (run.trend ?? []).map((t) => t[idx]),
			tip: TIPS[e.kind]
		};
	}
	if (e.kind === 'mind-low') return { headline: 'Your mind gave way.', straw: withFx[0], runup: withFx.slice(1, 5), tip: TIPS['mind-low'] };
	if (e.kind === 'late') return { headline: `The deadline (day ${run.deadline}) passed on day ${run.day}.`, runup: run.log.filter((l) => l.text.startsWith('Set out')).slice(0, 4), tip: TIPS.late };
	if (e.kind === 'jailed') return { headline: `Wanted level ${Math.round(run.heat)} — the constables caught up with you.`, straw: withFx[0], runup: run.log.filter((l) => /crime|steal|smuggl|bribe/i.test(l.text)).slice(0, 4), tip: TIPS.jailed };
	return { headline: e.won ? 'Journey complete.' : 'The journey ends here.', runup: [], tip: TIPS[e.kind] ?? TIPS.victory };
}
