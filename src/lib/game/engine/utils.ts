import { Rng, hashString } from '#lib/rng';
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { STATS, type Fx, type Stat, type Tag } from '#lib/data/traits';
import { ITEMS, MOUNTS, MOUNT_NAMES } from '#lib/data/items';
import { DIFFICULTY } from '#lib/data/difficulty';
import { CABINET, CABINET_SLOTS, THOUGHT } from '#lib/data/cabinet';
import { capOf, effectiveVoices, modFx, skillLevel } from '../mods';
import { GOAL } from '#lib/data/goals';
import { INVENTIONS } from '#lib/data/inventions';
import { canFit, syncGrid } from '../bag';
import type { ActiveInvention, MountKind, Person, Run } from '../types';

export const CAP_STATS = ['silver', 'vigor', 'renown', 'fortune', 'mind'] as const;

export const MIND_START: Record<string, number> = {
	none: 70,
	fever: 60,
	penniless: 55,
	exile: 50,
	cursed: 55,
	shipwrecked: 50,
	'deaths-door': 40
};

export function here(run: Run) {
	return cityName(CITY[run.location], run.year);
}

export function log(run: Run, text: string) {
	run.log.unshift({ day: run.day, place: here(run), text });
	if (run.log.length > 250) run.log.length = 250;
}

export function clamp(v: number, a: number, b: number) {
	return Math.max(a, Math.min(b, v));
}

export function cap(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function seedFor(s: string) {
	return hashString(s);
}

export function track(run: Run) {
	run.trend ??= [];
	run.trend.push([run.day, run.stats.silver, run.stats.vigor, run.stats.renown, run.stats.fortune]);
	if (run.trend.length > 160) run.trend.splice(0, run.trend.length - 160);
}

export function knownSecrets(run: Pick<Run, 'flags'>): string[] {
	return Object.keys(run.flags)
		.filter((k) => k.startsWith('secret:'))
		.map((k) => k.slice(7));
}

export function karmaLabel(k: number): string {
	return k >= 60 ? 'Saintly' : k >= 30 ? 'Virtuous' : k >= 10 ? 'Kind' : k <= -60 ? 'Wicked' : k <= -30 ? 'Ruthless' : k <= -10 ? 'Callous' : 'Unremarkable';
}

export function standingLabel(v: number): string {
	return v >= 50 ? 'Honors you' : v >= 25 ? 'Likes you' : v <= -50 ? 'Hates you' : v <= -25 ? 'Distrusts you' : 'Knows little of you';
}

// ---------- bag, mount, crew ----------

export function addItem(run: Run, id: string): boolean {
	if (!ITEMS[id]) return false;
	syncGrid(run);
	if (!canFit(run, id)) return false;
	run.bag.push(id);
	syncGrid(run);
	return true;
}

export function removeItem(run: Run, id: string) {
	const i = run.bag.indexOf(id);
	if (i >= 0) run.bag.splice(i, 1);
	syncGrid(run);
}

export function setMount(run: Run, kind: MountKind | 'none', rng: Rng, notes: string[]) {
	if (kind === 'none') {
		if (run.mount) notes.push(`${run.mount.name} is gone.`);
		run.mount = null;
		dropOverflow(run, notes);
		return;
	}
	run.mount = { kind, name: rng.pick(MOUNT_NAMES), health: 100 };
	notes.push(`${MOUNTS[kind].glyph} ${run.mount.name} the ${MOUNTS[kind].name.toLowerCase()} joins you, with packs of their own.`);
}

export function hurtMount(run: Run, amount: number, notes: string[] = []) {
	if (!run.mount) return;
	run.mount.health = clamp(run.mount.health - amount, 0, 100);
	if (run.mount.health <= 0) {
		const msg = `${run.mount.name} collapsed and died on the road.`;
		log(run, msg);
		notes.push(msg);
		run.mount = null;
		dropOverflow(run, notes);
	}
}

export function dropOverflow(run: Run, notes: string[]) {
	let over = syncGrid(run);
	for (let guard = 0; over.length && guard < 40; guard++) {
		// drop what does not fit; if that is a relic, sacrifice something ordinary instead
		const victim = over.find((id) => ITEMS[id]?.kind !== 'relic') ?? run.bag.find((id) => ITEMS[id]?.kind !== 'relic') ?? over[0];
		run.bag.splice(run.bag.lastIndexOf(victim), 1);
		notes.push(`Too much to carry — abandoned ${ITEMS[victim]?.name ?? victim}.`);
		over = syncGrid(run);
	}
}

/** Relics and supplies that pull you back from the brink. */
export function rescue(run: Run): string[] {
	const out: string[] = [];
	for (const s of STATS) {
		const v = run.stats[s];
		if (v > 0 && v < 100) continue;
		const low = v <= 0;
		const saver = run.bag.find((id) => {
			const sv = ITEMS[id]?.saves;
			return sv === 'any' || (low && sv === s);
		});
		if (!saver) continue;
		removeItem(run, saver);
		run.stats[s] = low ? 30 : 70;
		const msg = `${ITEMS[saver].glyph} ${ITEMS[saver].name} saved you from ${low ? 'ruin' : 'excess'}!`;
		log(run, msg);
		out.push(msg);
	}
	// unhappy crew walk out
	for (const c of [...run.crew])
		if (c.loyalty <= 0) {
			run.crew.splice(run.crew.indexOf(c), 1);
			const msg = `${c.npc.name} has had enough and walked out.`;
			log(run, msg);
			out.push(msg);
		}
	return out;
}

export function applyFx(run: Run, raw: Fx, tags: Tag[]): Fx {
	const fx = modFx(run, raw, tags);
	for (const s of STATS) {
		if (!fx[s]) continue;
		// soft cap: gains shrink near the top, so 100 takes real recklessness; easy modes cushion falls
		const diff = DIFFICULTY[run.difficulty] ?? DIFFICULTY.courier;
		const cap = capOf(run, s);
		const k = cap / 100; // soft caps scale with how much you can hold
		if (fx[s]! > 0) {
			if (run.stats[s] >= 88 * k) fx[s] = Math.max(1, Math.round(fx[s]! * 0.35));
			else if (run.stats[s] > diff.softCap * k) fx[s] = Math.max(1, Math.round(fx[s]! * 0.55));
		}
		if (fx[s]! < 0 && run.stats[s] < 25 && diff.lossCushion !== 1) fx[s] = Math.min(-1, Math.round(fx[s]! * diff.lossCushion));
		run.stats[s] = clamp(run.stats[s] + fx[s]!, 0, cap);
		// experience: everything you live through widens what you can hold
		run.xp ??= {};
		run.xp[s] = (run.xp[s] ?? 0) + Math.abs(fx[s]!);
	}
	return fx;
}

// ---------- inventions ----------

export function tickInventions(run: Run, days: number, notes: string[] = []) {
	if (!run.inventions || run.inventions.length === 0) return;
	const stillActive: ActiveInvention[] = [];
	for (const inv of run.inventions) {
		inv.daysLeft -= days;
		if (inv.daysLeft <= 0) {
			const def = INVENTIONS[inv.id];
			if (!run.completedInventions) run.completedInventions = [];
			run.completedInventions.push(inv.id);
			if (def) {
				addItem(run, def.rewardItem);
				if (def.rewardItem === 'celestial-chronometer') {
					run.deadline += 14;
				}
				const city = CITY[inv.city] ?? CITY['beijing'];
				const msg = `Invention Complete: ${def.name}! The workshop in ${cityName(city, run.year)} has perfected the prototype. The patent and ${def.rewardItem} are delivered to you.`;
				notes.push(msg);
				log(run, msg);
			}
		} else {
			stillActive.push(inv);
		}
	}
	run.inventions = stillActive;
}

export function sponsorInvention(run: Run, id: string, scholarName: string): boolean {
	const inv = INVENTIONS[id];
	if (!inv) return false;
	if (run.stats.silver < inv.cost) return false;
	if (run.inventions?.some((i) => i.id === id) || run.completedInventions?.includes(id)) return false;
	applyFx(run, { silver: -inv.cost, renown: 6 }, ['art', 'trade']);
	if (!run.inventions) run.inventions = [];
	run.inventions.push({
		id,
		scholarName,
		city: run.location,
		daysLeft: inv.daysNeeded
	});
	log(run, `Sponsored ${inv.name} with ${inv.cost} silver under ${scholarName} in ${cityName(CITY[run.location], run.year)}.`);
	return true;
}

// ---------- the mind ----------

/** Change composure. A Stone Heart never cracks: losses become apathy instead. Will softens every blow. */
export function shiftMind(run: Run, delta: number) {
	run.mind ??= MIND_START[run.hardship] ?? 70;
	run.apathy ??= 0;
	if (delta < 0) {
		const will = effectiveVoices(run).will ?? 2;
		delta = Math.round(delta * Math.max(0.5, 1 - (will - 2) * 0.08));
		for (const id of run.cabinet?.done ?? []) delta = Math.round(delta * (THOUGHT[id]?.done.mindLoss ?? 1));
		delta = Math.round(delta * (1 - skillLevel(run, 'composure') * 0.05));
		if (run.hero.traits.includes('stone-heart')) {
			run.apathy = Math.min(100, run.apathy - delta);
			return;
		}
	} else if (run.apathy > 0) {
		// feeling something again slowly melts the numbness
		run.apathy = Math.max(0, run.apathy - Math.ceil(delta / 2));
	}
	run.xp ??= {};
	run.xp.mind = (run.xp.mind ?? 0) + Math.abs(delta);
	run.mind = Math.max(0, Math.min(capOf(run, 'mind'), run.mind + delta));
}

export function mindAfter(run: Run, fx: Fx, tags: Tag[], won: boolean | undefined, notes: string[]) {
	const before = run.mind ?? MIND_START[run.hardship] ?? 70;
	const sum = STATS.reduce((a, k) => a + (fx[k] ?? 0), 0);
	let d = 0;
	if (won === false) d -= 6;
	if (won === true) d += 2;
	if (sum <= -15) d -= 4;
	else if (sum <= -6) d -= 2;
	if (tags.includes('cruel')) d -= 3;
	if (sum > 0 && tags.some((t) => ['rest', 'faith', 'art', 'romance', 'food', 'mercy'].includes(t))) d += 3;
	if (run.stats.vigor < 20) d -= 1;
	if (!d) return;
	shiftMind(run, d);
	const now = run.mind ?? before;
	const crossed = (lvl: number) => before >= lvl && now < lvl;
	if (crossed(35)) notes.push('🌀 Your mind is **frayed**. The voices are getting louder — and less honest.');
	else if (crossed(15)) notes.push('🌀 You are **unravelling**. Some things you try will simply fail. Rest. Pray. Find someone who loves you.');
	else if (before < 35 && now >= 35) notes.push('🍃 The noise in your head quiets. You feel like yourself again.');
	if (run.hero.traits.includes('stone-heart') && (run.apathy ?? 0) >= 40 && d < 0 && (run.apathy ?? 0) - -d < 40) notes.push('🪨 You notice you have stopped caring. About anything. It is very peaceful.');
}

// ---------- the thought cabinet ----------

export function discoverThought(run: Run, id: string, notes: string[]) {
	const t = THOUGHT[id];
	run.cabinet ??= { found: [], slots: [], done: [] };
	if (!t || run.cabinet.found.includes(id) || run.cabinet.done.includes(id) || run.cabinet.slots.some((s) => s.id === id)) return;
	run.cabinet.found.push(id);
	notes.push(`💭 ${t.rare ? '✦ Rare thought' : 'New thought'}: **${t.name}** — ${t.found} (Thought Cabinet)`);
	log(run, `A thought took hold: ${t.name}. ${t.found}`);
}

export function checkThoughts(run: Run, notes: string[]) {
	for (const t of CABINET) if (t.when && t.when(run)) discoverThought(run, t.id, notes);
}

/** Start carrying a thought. It takes travel days to become part of you. */
export function internalize(run: Run, id: string): boolean {
	const c = run.cabinet;
	if (!c || !c.found.includes(id) || c.slots.length >= CABINET_SLOTS) return false;
	c.found = c.found.filter((x) => x !== id);
	c.slots.push({ id, left: THOUGHT[id].days });
	return true;
}

export function forgetThought(run: Run, id: string) {
	const c = run.cabinet;
	if (!c) return;
	const i = c.slots.findIndex((s) => s.id === id);
	if (i >= 0) {
		c.slots.splice(i, 1);
		c.found.push(id);
	}
}

export function thinkFor(run: Run, days: number, notes: string[]) {
	const c = run.cabinet;
	if (!c) return;
	for (const sl of [...c.slots]) {
		sl.left -= days;
		if (sl.left <= 0) {
			c.slots.splice(c.slots.indexOf(sl), 1);
			c.done.push(sl.id);
			const t = THOUGHT[sl.id];
			notes.push(`💡 Thought internalized: **${t.name}**. ${t.solution} (${t.doneText})`);
			log(run, `Internalized: ${t.name}. ${t.solution}`);
		}
	}
}

// ---------- life goal ----------

/** Has the traveller just fulfilled their life goal? */
export function checkGoal(run: Run, notes: string[]) {
	const g = run.goal && GOAL[run.goal.id];
	if (!g || run.goal!.done !== undefined) return;
	const [cur, target] = g.progress(run);
	if (cur < target) return;
	run.goal!.done = run.day;
	applyFx(run, { renown: 20, fortune: 10 }, []);
	shiftMind(run, 20);
	notes.push(`🌟 **Life goal fulfilled: ${g.name}.** ${g.desc} Whatever happens now, this was worth it.`);
	log(run, `Fulfilled a life's wish: ${g.name}.`);
}

// ---------- rival as a person ----------

/** Ensure the rival courier is represented in `run.people` so bond, friendship/nemesis status, and letters work. */
export function ensureRivalPerson(run: Run, currentCity?: string): Person | null {
	if (!run.rival) return null;
	run.people ??= [];
	const id = `rival-${run.rival.npc.seed}`;
	let p = run.people.find((x) => x.id === id || x.npc.name === run.rival!.npc.name);
	const city = currentCity ?? run.rival.path[0] ?? run.location;
	if (!p) {
		p = {
			id,
			npc: run.rival.npc,
			city: CITY[city] ? city : run.location,
			venue: 'inn',
			traits: ['quick', 'silver-tongue'],
			likes: ['talk', 'sea'],
			dislikes: ['cruel'],
			bio: `Bound for ${cityName(CITY[run.destination] ?? CITY[run.location], run.year)} on the same commission. Fast, proud, and watching the same horizon.`,
			bond: 0,
			stage: 'rival',
			met: run.day,
			last: run.day
		};
		run.people.push(p);
	} else if (currentCity && CITY[currentCity]) {
		p.city = currentCity;
	}
	if (run.flags.rivalFriend && p.bond < 25) {
		p.bond = 25;
		if (p.stage === 'rival') p.stage = 'friend';
	}
	return p;
}
