import { Rng } from '#lib/rng';
import { CULTURES } from '#lib/data/cultures';
import { CITY, SECRETS } from '#lib/data/world';
import { FACTIONS, PERK, STATS, STATUSES, type Fx, type Tag } from '#lib/data/traits';
import { BAGS, ITEMS } from '#lib/data/items';
import { OUTFITS } from '#lib/data/market';
import { FAITHS, IDEALS, faithOfCity, kindred, type FaithId } from '#lib/data/faiths';
import { capacity } from '#lib/game/cards/index';
import { personStep } from '../people';
import { talesFrom } from '../tales';
import { hearLanguage, langLevel } from '../langs';
import { capOf, rapportOf } from '../mods';
import { SKILLS, levelOf } from '#lib/data/skills';
import { buyHome, checkTitles, collect } from '../life';
import { sceneLine } from '../prose';
import { newVenture, VENTURES } from '../ventures';
import { INVENTIONS } from '#lib/data/inventions';
import { energyMax, passesAsLocal, wear } from '../market';
import { recordGuildTrade } from '../guild';
import type { Choice, FactionId, Npc, Outcome, RomanceStep, Run } from '../types';
import { advance } from './arrival';
import { checkEnd, settle } from './endings';
import {
	CAP_STATS,
	addItem,
	applyFx,
	checkGoal,
	checkThoughts,
	clamp,
	discoverThought,
	dropOverflow,
	here,
	hurtMount,
	karmaLabel,
	log,
	mindAfter,
	removeItem,
	rescue,
	setMount,
	shiftMind,
	sponsorInvention,
	standingLabel,
	track
} from './utils';

export interface Resolution {
	text: string;
	fx: Fx;
	days: number;
	won?: boolean;
	notes: string[];
}

export function romanceStep(run: Run, npc: Npc, step: RomanceStep, notes: string[]) {
	if (step.start) {
		const old = run.romance;
		if (old && old.status !== 'parted' && old.npc.name !== npc.name) notes.push(`💔 Your heart moves on from ${old.npc.name}.`);
		run.romance = { npc, city: run.route?.to ?? run.location, affection: 30, status: 'courting', since: run.day, letters: 0 };
		run.flags.lover = npc.name;
		run.flags.loverCity = run.romance.city;
		notes.push(`💗 You are courting **${npc.name}**.`);
	}
	const r = run.romance;
	if (!r) return;
	if (step.affection) r.affection = clamp(r.affection + step.affection, 0, 100);
	if (step.status && step.status !== r.status) {
		r.status = step.status;
		notes.push(step.status === 'betrothed' ? `💍 You and **${r.npc.name}** are betrothed.` : step.status === 'married' ? `💒 You are married to **${r.npc.name}**.` : `💔 You and ${r.npc.name} part ways.`);
		log(run, step.status === 'parted' ? `Parted from ${r.npc.name}.` : step.status === 'married' ? `Married ${r.npc.name}.` : `Betrothed to ${r.npc.name}.`);
		shiftMind(run, step.status === 'parted' ? -12 : step.status === 'married' ? 10 : 5);
		if (step.status === 'parted') {
			delete run.flags.lover;
			delete run.flags.loverCity;
		}
	} else if (step.affection) notes.push(`${step.affection > 0 ? '💗' : '💔'} ${r.npc.name}: ${step.affection > 0 ? '+' : ''}${step.affection} affection.`);
	if (r.status !== 'parted' && r.affection <= 0) {
		r.status = 'parted';
		notes.push(`💔 ${r.npc.name} has stopped waiting for you.`);
		delete run.flags.lover;
	}
}

/** `forceWin` lets a mini-game decide a gamble instead of the dice. */
export function choose(run: Run, side: 'left' | 'right' | 'up', forceWin?: boolean): Resolution {
	const rng = new Rng(run.rng);
	const card = run.deck.shift()!;
	const ch: Choice = card[side] ?? card.right;
	const capsBefore = CAP_STATS.map((s) => capOf(run, s));
	const tags: Tag[] = [...(ch.tags ?? [])];
	if (run.phase === 'travel' && run.route) tags.push(run.route.mode as Tag);
	if (card.npc.culture !== run.hero.culture && !passesAsLocal(run, card.npc.culture) && langLevel(run, card.npc.culture) < 2) tags.push('foreign');
	const notes: string[] = [];

	let fx: Fx = { ...ch.fx };
	let days = ch.days ?? 0;
	let text = ch.text ?? '';
	let won: boolean | undefined;
	let extra: Outcome | null = null;
	// people warm to (or bristle at) your traits
	const rap = rapportOf(run, card.npc.role);
	// an unravelling mind sometimes simply fails: the good never happens, the bad still does
	const panic = card.id !== 'intro' && card.id !== 'assignment' && (run.mind ?? 70) < 15 && !run.hero.traits.includes('stone-heart') && rng.chance(0.18);
	if (panic) {
		for (const k of STATS) if ((fx[k] ?? 0) > 0) delete fx[k];
		notes.push('🌀 Your hands will not stop shaking. Whatever you meant to do, it goes wrong.');
		forceWin = false;
	}
	if (ch.gamble) {
		const tongue = tags.some((t) => t === 'talk' || t === 'trade' || t === 'romance') ? langLevel(run, card.npc.culture) * 0.03 : 0;
		won = forceWin ?? rng.next() < ch.gamble.p + rap.score * 0.06 + tongue;
		extra = won ? ch.gamble.win : ch.gamble.lose;
		for (const s of STATS) if (extra.fx[s]) fx[s] = (fx[s] ?? 0) + extra.fx[s]!;
		days += extra.days ?? 0;
		text = extra.text ?? text;
	}
	// Luck is not morality: kind or cruel deeds move merit, never fortune.
	const moral = tags.includes('mercy') || tags.includes('cruel') || ch.karma !== undefined;
	if (moral && fx.fortune) delete fx.fortune;
	if (rap.score) for (const k of STATS) if (fx[k]) fx[k] = Math.round(fx[k]! * (fx[k]! > 0 ? 1 + rap.score * 0.12 : 1 - rap.score * 0.1));
	fx = applyFx(run, fx, tags);
	if (tags.includes('trade') && fx.silver) {
		recordGuildTrade(run, Math.abs(fx.silver), notes);
	}
	run.day = Math.max(0, run.day + days);
	mindAfter(run, fx, tags, won, notes);

	// conscience: choices that honor or betray your ideal
	const ideal = IDEALS[run.hero.ideal as keyof typeof IDEALS];
	if (ideal && card.id !== 'intro') {
		if (ideal.love.some((t) => tags.includes(t)) && !ideal.hate.some((t) => tags.includes(t))) {
			const d = applyFx(run, { vigor: 2 }, []);
			fx.vigor = (fx.vigor ?? 0) + (d.vigor ?? 0);
			notes.push(`${ideal.glyph} True to your ideal of ${ideal.name} — a clear conscience.`);
		} else if (ideal.hate.some((t) => tags.includes(t))) {
			const d = applyFx(run, { vigor: -2 }, []);
			fx.vigor = (fx.vigor ?? 0) + (d.vigor ?? 0);
			notes.push(`${ideal.glyph} Your ideal of ${ideal.name} is troubled; you sleep badly.`);
		}
	}
	// devotion among your own faith
	if (tags.includes('faith') && run.phase === 'city') {
		const local = faithOfCity(run.location, CITY[run.location].culture) as FaithId;
		if (kindred(run.hero.faith as FaithId, local) && run.hero.faith !== 'skeptic') {
			const d = applyFx(run, { fortune: 4 }, []);
			fx.fortune = (fx.fortune ?? 0) + (d.fortune ?? 0);
			notes.push(`${FAITHS[run.hero.faith as FaithId].glyph} Among fellow believers, your prayers ring truer.`);
		}
	}

	// merit: kindness and cruelty are both remembered
	const dk = (ch.karma ?? 0) + (tags.includes('mercy') ? 5 : 0) + (tags.includes('faith') ? 1 : 0) - (tags.includes('cruel') ? 7 : 0) - (tags.includes('crime') ? 2 : 0) - (tags.includes('bribe') ? 1 : 0);
	if (dk) {
		const before = run.karma;
		run.karma = clamp(run.karma + dk, -100, 100);
		const tier = (k: number) => (k >= 60 ? 3 : k >= 30 ? 2 : k >= 10 ? 1 : k <= -60 ? -3 : k <= -30 ? -2 : k <= -10 ? -1 : 0);
		if (tier(run.karma) !== tier(before)) notes.push(`☯ Merit ${dk > 0 ? 'rises' : 'falls'}: you are now ${karmaLabel(run.karma).toLowerCase()}.`);
	}
	const invisible = ['tiger', 'ghost', 'spirit'].includes(card.npc.role) || card.id === 'intro' || card.id.startsWith('tie-');
	const rememberKind = ch.remember === false ? null : ch.remember?.kind ?? (tags.includes('mercy') ? 'favor' : tags.includes('cruel') ? 'grudge' : null);
	if (rememberKind && !invisible && !run.ties.some((t) => t.npc.name === card.npc.name && !t.resolved)) {
		const deed = (ch.remember && ch.remember.deed) || ch.label.toLowerCase();
		run.ties.push({ id: `tie-${card.npc.seed}`, npc: card.npc, kind: rememberKind, deed, city: run.route?.to ?? run.location, day: run.day });
		if (run.ties.length > 14) run.ties.splice(run.ties.findIndex((t) => t.resolved) >= 0 ? run.ties.findIndex((t) => t.resolved) : 0, 1);
		notes.push(rememberKind === 'favor' ? `🤝 ${card.npc.name} will remember your kindness.` : `⚔ ${card.npc.name} will not forget this.`);
	}
	if (ch.tieResolve) {
		const t = run.ties.find((x) => x.id === ch.tieResolve);
		if (t) t.resolved = true;
	}
	// regional standing: what this culture thinks of you
	const localCulture = CITY[run.route?.to ?? run.location].culture;
	const heatUp = (ch.heat ?? 0) + (extra?.heat ?? 0);
	const ds = Math.round((fx.renown ?? 0) * 0.7 + dk * 0.4 - Math.max(0, heatUp) * 0.5 + (ch.standing ?? 0) + (extra?.standing ?? 0));
	if (ds) {
		const before = run.standing[localCulture] ?? 0;
		const after = clamp(before + ds, -100, 100);
		run.standing[localCulture] = after;
		const band = (v: number) => (v >= 50 ? 2 : v >= 25 ? 1 : v <= -50 ? -2 : v <= -25 ? -1 : 0);
		if (band(after) !== band(before)) notes.push(`🏯 ${CULTURES[localCulture].label} now ${standingLabel(after).toLowerCase()}.`);
	}
	if (ch.venture && run.ventures.length < 4) {
		const v = newVenture(rng, ch.venture, run.location);
		run.ventures.push(v);
		notes.push(`${VENTURES[ch.venture].glyph} You now own the ${VENTURES[ch.venture].name.toLowerCase()} **${v.name}**, based in ${here(run)}.`);
	}
	if (ch.treasury) run.treasury = Math.max(0, run.treasury + ch.treasury);
	if (ch.retire) run.flags.end = ch.retire;

	for (const src of [ch, extra]) {
		if (!src) continue;
		for (const id of src.itemRemove ?? []) removeItem(run, id);
		for (const id of src.itemAdd ?? []) if (!addItem(run, id)) notes.push(`No room for ${ITEMS[id]?.name ?? id} — left behind.`);
		if (src.setFlag) {
			for (const k of Object.keys(src.setFlag))
				if (k.startsWith('secret:') && !run.flags[k]) {
					const sec = SECRETS.find((x) => x.id === k.slice(7));
					if (sec) {
						notes.push(`🗝 Secret revealed: **${sec.name}** — ${sec.hint}.`);
						log(run, `Learned the secret of ${sec.name}.`);
					}
				}
			Object.assign(run.flags, src.setFlag);
		}
		if (src.heat) run.heat = clamp(run.heat + src.heat, 0, 100);
		if (src.mount) setMount(run, src.mount, rng, notes);
		if ('remember' in src && src.remember && !run.ties.some((t) => t.npc.name === card.npc.name && !t.resolved)) {
			const r = src.remember as { kind: 'favor' | 'grudge'; deed: string };
			run.ties.push({ id: `tie-${card.npc.seed}`, npc: card.npc, kind: r.kind, deed: r.deed, city: run.route?.to ?? run.location, day: run.day });
			notes.push(r.kind === 'favor' ? `🤝 ${card.npc.name} will remember this.` : `⚔ ${card.npc.name} will not forget this.`);
		}
		if (src.quest && run.quests.length < 4 && !run.quests.some((q) => q.id === src.quest!.id)) {
			run.quests.push(src.quest);
			notes.push(`◆ New task: ${src.quest.title}`);
		}
		if (src.faction) {
			run.factions ??= { outlaw: 0, faith: 0, crown: 0, mercenary: 0, guild: 0 };
			for (const [fac, delta] of Object.entries(src.faction) as [FactionId, number][]) {
				if (delta) {
					run.factions[fac] = clamp((run.factions[fac] ?? 0) + delta, -100, 100);
					notes.push(`${delta > 0 ? '🔺' : '🔻'} ${FACTIONS[fac]?.label ?? fac}: ${delta > 0 ? '+' : ''}${delta}`);
				}
			}
		}
		if (src.traitAdd) {
			for (const tid of src.traitAdd) {
				if (!run.hero.traits.includes(tid)) {
					run.hero.traits.push(tid);
					const p = PERK[tid];
					notes.push(`✨ Acquired trait: **${p?.name ?? tid}** (${p?.pro ?? ''})`);
					log(run, `Acquired trait: ${p?.name ?? tid}.`);
				}
			}
		}
		if (src.traitRemove) {
			for (const tid of src.traitRemove) {
				const idx = run.hero.traits.indexOf(tid);
				if (idx >= 0) {
					run.hero.traits.splice(idx, 1);
					notes.push(`Lost trait: **${PERK[tid]?.name ?? tid}**`);
				}
			}
		}
		if (src.statusAdd) {
			run.statuses ??= [];
			for (const sid of src.statusAdd) {
				if (!run.statuses.includes(sid)) {
					run.statuses.push(sid);
					const st = STATUSES[sid];
					notes.push(`${st?.glyph ?? '⚠️'} Condition: **${st?.name ?? sid}** — ${st?.desc ?? ''}`);
					log(run, `Condition: ${st?.name ?? sid}.`);
				}
			}
		}
		if (src.statusRemove) {
			run.statuses ??= [];
			for (const sid of src.statusRemove) {
				const idx = run.statuses.indexOf(sid);
				if (idx >= 0) {
					run.statuses.splice(idx, 1);
					notes.push(`Recovered from condition: **${STATUSES[sid]?.name ?? sid}**`);
				}
			}
		}
		if (src.sponsorInvention) {
			sponsorInvention(run, src.sponsorInvention, card.npc?.name ?? 'The scholars');
			const inv = INVENTIONS[src.sponsorInvention];
			if (inv) {
				notes.push(`🔬 Sponsored Breakthrough: **${inv.name}** (${inv.daysNeeded} days to complete).`);
			}
		}
	}
	if (ch.settle) settle(run);
	for (const f of ch.clearFlag ?? []) delete run.flags[f];
	for (const src of [ch, extra]) for (const [k, v] of Object.entries(src?.bump ?? {})) run.flags[k] = Number(run.flags[k] ?? 0) + v;
	// a tale told wears a little thinner each time
	for (const k of Object.keys(run.flags))
		if (k.startsWith('told:')) {
			const t = run.repertoire?.find((x) => x.id === k.slice(5));
			if (t) t.told++;
			delete run.flags[k];
		}
	// rumours add up: two hints about the same hidden path reveal it
	for (const k of Object.keys(run.flags))
		if (k.startsWith('hint:') && Number(run.flags[k]) >= 2 && !run.flags['secret:' + k.slice(5)]) {
			const sec = SECRETS.find((x) => x.id === k.slice(5));
			if (!sec) continue;
			run.flags['secret:' + sec.id] = true;
			notes.push(`🗝 The rumours fit together: **${sec.name}** — ${sec.hint}. A new route is on your map.`);
			log(run, `Pieced together the secret of ${sec.name}.`);
		}
	if (ch.outfit) {
		wear(run, ch.outfit);
		notes.push(ch.outfit === 'none' ? 'You are back in your own clothes.' : `👘 You now wear: **${OUTFITS[ch.outfit]?.name ?? ch.outfit}**.`);
	}
	if (ch.romance) romanceStep(run, card.npc, ch.romance, notes);
	if (ch.energy && run.energy !== undefined) {
		run.energy = Math.max(0, Math.min(energyMax(run), run.energy + ch.energy));
		notes.push(`⚡ ${ch.energy > 0 ? '+' : ''}${ch.energy} energy for the day.`);
	}
	if (extra?.romance) romanceStep(run, card.npc, extra.romance, notes);
	if (ch.thought) discoverThought(run, ch.thought, notes);
	if (run.flags.buyHome) {
		delete run.flags.buyHome;
		if (buyHome(run)) notes.push(`🏡 You have a home in **${here(run)}**. Rest there for better nights; store things in the stash; your garden earns while you travel.`);
		else notes.push('You cannot afford it after all.');
	}
	if (ch.person) personStep(run, ch.person, notes);
	if (run.phase === 'city' || (card.npc.culture !== run.hero.culture && tags.includes('talk'))) {
		const heard = hearLanguage(run, card.npc.culture, 1);
		if (heard) notes.push(heard);
	}
	// practice makes… better: every skill the choice used gets a little experience
	run.skills ??= {};
	for (const sd of SKILLS) {
		if (!sd.trains.some((t) => tags.includes(t))) continue;
		const before = levelOf(run.skills[sd.id] ?? 0);
		run.skills[sd.id] = (run.skills[sd.id] ?? 0) + (won === true ? 5 : won === false ? 3 : 2);
		const now = levelOf(run.skills[sd.id]!);
		if (now > before) notes.push(`📈 **${sd.name}** ${now}${now === 6 ? ` — mastery: ${sd.mastery}` : ''}`);
	}
	if (card.npc.role === 'ghost' || card.npc.role === 'spirit') run.skills.mystic = (run.skills.mystic ?? 0) + 4;
	const tale = talesFrom(run, card, ch, side, won);
	if (tale) notes.push(tale);
	// collections
	const cul = CITY[run.location]?.culture;
	if (run.phase === 'city' && tags.includes('food') && cul) collect(run, 'dishes', cul, notes);
	if (card.id === 'v-bridge') collect(run, 'bridges', run.location, notes);
	if (card.id === 'v-landmark') collect(run, 'landmarks', run.location, notes);
	if (card.id === 'v-temple' || (run.phase === 'city' && tags.includes('faith'))) collect(run, 'temples', run.location, notes);
	checkTitles(run, notes);
	checkGoal(run, notes);
	if (extra?.person) personStep(run, extra.person, notes);
	checkThoughts(run, notes);
	if (ch.bag) {
		run.bagKind = ch.bag;
		dropOverflow(run, notes);
		notes.push(`${BAGS[ch.bag].glyph} Now carrying a ${BAGS[ch.bag].name.toLowerCase()} (${capacity(run)} slots).`);
	}
	for (const src of [ch, extra]) if (src?.mountHurt) hurtMount(run, src.mountHurt, notes);
	if (ch.crewAdd && run.crew.length < 3) {
		run.crew.push(ch.crewAdd);
		notes.push(`${ch.crewAdd.npc.name} joined your retinue.`);
	}
	if (ch.crewRemove) {
		const i = run.crew.findIndex((c) => c.id === ch.crewRemove || c.role === ch.crewRemove);
		if (i >= 0) notes.push(`${run.crew.splice(i, 1)[0].npc.name} left your retinue.`);
	}
	for (const src of [ch, extra]) if (src?.loyalty) for (const c of run.crew) c.loyalty = clamp(c.loyalty + src.loyalty, 0, 100);
	for (const k of Object.keys(run.flags))
		if (k.startsWith('loy:')) {
			const m = run.crew.find((c) => c.id === k.slice(4));
			if (m) m.loyalty = clamp(m.loyalty + Number(run.flags[k]), 0, 100);
			delete run.flags[k];
		}
	if (ch.legend && !run.legends.includes(ch.legend)) {
		run.legends.push(ch.legend);
		notes.push('★ A legend joins your chronicle.');
	}
	if (run.rival) run.rival.arrive += (ch.rivalDelay ?? 0) + (extra?.rivalDelay ?? 0);
	if (ch.pilgrimage && !run.pilgrimages.includes(ch.pilgrimage)) run.pilgrimages.push(ch.pilgrimage);
	if (ch.convert) {
		run.hero.faith = ch.convert;
		notes.push(`${FAITHS[ch.convert as FaithId].glyph} You are now ${FAITHS[ch.convert as FaithId].name}.`);
	}
	if (ch.next) run.deck.unshift(ch.next);

	run.cardsSeen++;
	run.recent = [card.id, ...run.recent.filter((r) => r !== card.id)].slice(0, 14);
	run.log.unshift({
		day: run.day,
		place: here(run),
		text: `${card.npc.name}: ${ch.label}.${text ? ' ' + text : ''}`,
		who: `${card.npc.name}, ${card.npc.title}`,
		scene: sceneLine({ ...run, phase: run.route ? 'travel' : run.phase }, card),
		situation: card.text,
		choice: ch.label,
		outcome: text,
		fx
	});
	track(run);
	if (run.log.length > 250) run.log.length = 250;
	run.rng = rng.state;

	CAP_STATS.forEach((s, i) => {
		const now = capOf(run, s);
		if (now > capsBefore[i]) {
			notes.push(`🏅 Seasoned: your ${s} can now reach **${now}** (it was ${capsBefore[i]}).`);
			log(run, `Seasoned by the road: ${s} limit ${capsBefore[i]} → ${now}.`);
		}
	});
	notes.push(...rescue(run));
	if (!checkEnd(run) && run.deck.length === 0) advance(run, notes);
	return { text, fx, days, won, notes };
}

export function useItem(run: Run, id: string): Resolution | null {
	const it = ITEMS[id];
	if (!it?.use || !run.bag.includes(id) || run.phase === 'end') return null;
	removeItem(run, id);
	let fx: Fx = it.use.fx;
	if (id === 'djinn-lamp') {
		fx = {};
		for (const s of STATS) fx[s] = 50 - run.stats[s];
		for (const s of STATS) run.stats[s] = 50;
	} else fx = applyFx(run, fx, ['rest']);
	if (it.use.heat) {
		run.heat = Math.max(0, Math.min(100, run.heat + it.use.heat));
	}
	log(run, `Used ${it.name}. ${it.use.text}`);
	checkEnd(run);
	return { text: it.use.text, fx, days: 0, notes: [] };
}

export function dropItem(run: Run, id: string) {
	if (run.outfit?.id === id) run.outfit = undefined;
	removeItem(run, id);
	log(run, `Left ${ITEMS[id]?.name ?? id} behind.`);
}

export function dismiss(run: Run, id: string) {
	const i = run.crew.findIndex((c) => c.id === id);
	if (i < 0) return;
	const c = run.crew.splice(i, 1)[0];
	log(run, `Parted ways with ${c.npc.name}.`);
	if (c.loyalty >= 60 || c.loyalty < 30)
		run.ties.push({ id: `tie-${c.npc.seed}`, npc: c.npc, kind: c.loyalty >= 60 ? 'favor' : 'grudge', deed: c.loyalty >= 60 ? 'parted as friends on the road' : 'dismissed them after hard service', city: run.location, day: run.day });
}

/** Move silver into / out of the treasury (only while in a city or choosing a route). */
export function bank(run: Run, amount: number) {
	if (run.phase !== 'map' && run.phase !== 'city') return;
	if (amount > 0) {
		const n = Math.min(amount, run.stats.silver - 1);
		if (n <= 0) return;
		run.stats.silver -= n;
		run.treasury += n;
		log(run, `Deposited ${n} silver with a factor.`);
	} else {
		const n = Math.min(-amount, run.treasury, 99 - run.stats.silver);
		if (n <= 0) return;
		run.treasury -= n;
		run.stats.silver += n;
		log(run, `Drew ${n} taels on your letter of credit.`);
	}
}

