// Headless balance sim: semi-sensible bot. `npx tsx scripts/sim.ts 400 [difficulty] [hardship] [--by profession|goal] [--skills]`
import { Rng } from '#lib/rng';
import { newRun, randomHero, availableRoutes, depart, choose, score, useItem, nextAssignment } from '#lib/game/engine';
import { shortestDays } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import { PROFESSIONS } from '#lib/data/traits';
import { GOALS } from '#lib/data/goals';
import { SKILLS, levelOf, type SkillId } from '#lib/data/skills';
import type { Choice, Run } from '#lib/game/types';

const rawArgs = process.argv.slice(2);
const posArgs: string[] = [];
let byMode: 'profession' | 'goal' | null = null;
let showSkills = false;
for (let i = 0; i < rawArgs.length; i++) {
	const a = rawArgs[i];
	if (a === '--by') {
		const v = rawArgs[++i];
		if (v === 'profession' || v === 'goal') byMode = v;
	} else if (a.startsWith('--by=')) {
		const v = a.slice(5);
		if (v === 'profession' || v === 'goal') byMode = v;
	} else if (a === '--skills') {
		showSkills = true;
	} else if (!a.startsWith('--')) {
		posArgs.push(a);
	}
}

let nArg: number | undefined;
const strPos: string[] = [];
for (const p of posArgs) {
	if (nArg === undefined && /^\d+$/.test(p)) nArg = Number(p);
	else strPos.push(p);
}
const N = nArg ?? (byMode ? 40 : 300);
const DIFF = strPos[0] ?? 'courier';
const HARD = strPos[1] ?? 'none';

interface SkillSnap {
	levels: Record<SkillId, number>;
	avg: number;
	max: number;
	has6Plus: boolean;
}

function snapSkills(run: Run): SkillSnap {
	const levels = {} as Record<SkillId, number>;
	let sum = 0;
	let max = 0;
	for (const s of SKILLS) {
		const lvl = levelOf(run.skills?.[s.id] ?? 0);
		levels[s.id] = lvl;
		sum += lvl;
		if (lvl > max) max = lvl;
	}
	return {
		levels,
		avg: sum / SKILLS.length,
		max,
		has6Plus: max >= 6
	};
}

interface SimResult {
	ending: string;
	won: boolean;
	goalDone: boolean;
	days: number;
	cardsSeen: number;
	legends: number;
	crew: number;
	mounts: number;
	ups: number;
	sc: number;
	endSkills: SkillSnap;
	day300Skills: SkillSnap | null;
}

const allEndSkills: SkillSnap[] = [];
const allDay300Skills: SkillSnap[] = [];

function stepBot(run: Run, r: Rng, ids?: Record<string, number>): boolean {
	// use healing items when low, and cooling supplies when dangerously high
	for (const id of [...run.bag]) {
		const u = ITEMS[id]?.use;
		if (!u) continue;
		if (u.fx.vigor && u.fx.vigor > 0 && run.stats.vigor < 30) useItem(run, id);
		if (u.fx.silver && u.fx.silver > 0 && run.stats.silver < 20) useItem(run, id);
		if (u.fx.renown && u.fx.renown < 0 && run.stats.renown > 78) useItem(run, id);
		if (u.fx.silver && u.fx.silver < 0 && run.stats.silver > 80) useItem(run, id);
		if (u.fx.vigor && u.fx.vigor < 0 && run.stats.vigor > 80) useItem(run, id);
		if (u.fx.fortune && u.fx.fortune < 0 && run.stats.fortune > 80) useItem(run, id);
	}
	if (run.phase === 'map') {
		const routes = availableRoutes(run);
		const dist = shortestDays(run.destination, run.year);
		routes.sort((a, b) => (dist[a.to] ?? 1e9) + a.days - ((dist[b.to] ?? 1e9) + b.days));
		depart(run, r.chance(0.8) ? routes[0] : r.pick(routes));
		return false;
	} else if (run.phase !== 'end') {
		const c = run.deck[0];
		if (ids) ids[c.id] = (ids[c.id] ?? 0) + 1;
		const cost = (ch: Choice) => {
			let k = 0;
			for (const s of ['silver', 'vigor', 'renown', 'fortune'] as const) {
				const cur = run.stats[s];
				const delta = ch.fx[s] ?? 0;
				const nxt = cur + delta;
				if (nxt <= 0 || nxt >= 100) k += 500;
				else if (nxt < 15 || nxt > 85) k += 100;
				k += Math.abs(nxt - 50);
			}
			return k;
		};
		if (c.up && r.chance(0.8)) {
			choose(run, 'up');
			return true;
		}
		choose(run, r.chance(0.75) ? (cost(c.left) < cost(c.right) ? 'left' : 'right') : r.chance(0.5) ? 'left' : 'right');
	}
	return false;
}

function runOne(i: number, opts: { profession?: string; goal?: string } = {}, ids?: Record<string, number>): SimResult {
	const r = new Rng(i * 7919 + 1);
	const year = r.int(1500, 1900);
	const hero = randomHero(r, year);
	if (opts.profession) hero.profession = opts.profession;
	if (opts.goal) hero.goal = opts.goal;
	const run = newRun(hero, 'sim' + i, year, { difficulty: DIFF, hardship: HARD });
	if (opts.goal) run.goal = { id: opts.goal };
	let steps = 0;
	let ups = 0;
	let day300Skills: SkillSnap | null = null;
	while (run.phase !== 'end' && steps++ < 3000) {
		if (stepBot(run, r, ids)) ups++;
		if (!day300Skills && run.day >= 300) day300Skills = snapSkills(run);
	}
	const ending = run.ending?.kind ?? 'stuck';
	const won = ending === 'victory' || ending === 'second';
	const goalDone = Boolean(run.goal?.done);
	const days = run.day;
	const cardsSeen = run.cardsSeen;
	const legends = run.legends.length;
	const crew = run.crew.length;
	const mounts = run.mount ? 1 : 0;
	const sc = score(run);
	const endSkills = snapSkills(run);
	allEndSkills.push(endSkills);

	// If the courier won before day 300, continue via nextAssignment (up to sample cap unless --skills) to measure day-300 skill inflation
	if (!day300Skills && won && (showSkills || allDay300Skills.length < 50)) {
		let assigns = 0;
		while (!day300Skills && assigns++ < 6 && steps < 6000) {
			nextAssignment(run);
			while (run.phase !== 'end' && steps++ < 6000) {
				stepBot(run, r);
				if (!day300Skills && run.day >= 300) {
					day300Skills = snapSkills(run);
					break;
				}
			}
			const k = run.ending?.kind;
			if (k !== 'victory' && k !== 'second') break;
		}
	}
	if (day300Skills) allDay300Skills.push(day300Skills);
	return { ending, won, goalDone, days, cardsSeen, legends, crew, mounts, ups, sc, endSkills, day300Skills };
}

function topEndingOf(counts: Record<string, number>, total: number): string {
	const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
	if (!entries.length) return 'none';
	const [k, v] = entries[0];
	return `${k} (${Math.round((v / total) * 100)}%)`;
}

function printSkillReport(endSnaps: SkillSnap[], day300Snaps: SkillSnap[]) {
	const total = endSnaps.length || 1;
	const endAvg = endSnaps.reduce((s, x) => s + x.avg, 0) / total;
	const endMax = endSnaps.reduce((s, x) => s + x.max, 0) / total;
	const end6Plus = (endSnaps.filter((x) => x.has6Plus).length / total) * 100;

	let day300Part = `day300 (n=0): none reached day 300`;
	if (day300Snaps.length > 0) {
		const n300 = day300Snaps.length;
		const d300Avg = day300Snaps.reduce((s, x) => s + x.avg, 0) / n300;
		const d300Max = day300Snaps.reduce((s, x) => s + x.max, 0) / n300;
		const d300_6Plus = (day300Snaps.filter((x) => x.has6Plus).length / n300) * 100;
		day300Part = `day300 (n=${n300}): avgLvl ${d300Avg.toFixed(2)} avgMax ${d300Max.toFixed(2)} lvl6+ ${d300_6Plus.toFixed(1)}%`;
	}
	console.log(`skills @end (n=${endSnaps.length}): avgLvl ${endAvg.toFixed(2)} avgMax ${endMax.toFixed(2)} lvl6+ ${end6Plus.toFixed(1)}% | ${day300Part}`);

	if (showSkills) {
		const n300 = day300Snaps.length || 1;
		console.log('\nSkill Breakdown (@end vs @day300):');
		console.log(`${'Skill'.padEnd(14)} | ${'EndAvg'.padStart(6)} | ${'EndMax'.padStart(6)} | ${'End6+%'.padStart(7)} | ${'D300Avg'.padStart(7)} | ${'D300Max'.padStart(7)} | ${'D300 6+%'.padStart(8)}`);
		console.log('-'.repeat(69));
		for (const sk of SKILLS) {
			const lvls = endSnaps.map((x) => x.levels[sk.id]);
			const avg = lvls.reduce((a, b) => a + b, 0) / total;
			const max = Math.max(0, ...lvls);
			const p6 = (lvls.filter((l) => l >= 6).length / total) * 100;
			const lvls300 = day300Snaps.map((x) => x.levels[sk.id]);
			const avg300 = day300Snaps.length ? lvls300.reduce((a, b) => a + b, 0) / n300 : 0;
			const max300 = day300Snaps.length ? Math.max(0, ...lvls300) : 0;
			const p6_300 = day300Snaps.length ? (lvls300.filter((l) => l >= 6).length / n300) * 100 : 0;
			console.log(
				`${sk.id.padEnd(14)} | ${avg.toFixed(2).padStart(6)} | ${String(max).padStart(6)} | ${(p6.toFixed(1) + '%').padStart(7)} | ${avg300.toFixed(2).padStart(7)} | ${String(max300).padStart(7)} | ${(p6_300.toFixed(1) + '%').padStart(8)}`
			);
		}
	}
}

if (byMode === 'profession') {
	interface ProfRow {
		id: string;
		name: string;
		winRate: number;
		goalRate: number;
		avgDays: number;
		avgMaxSkill: number;
		topEnding: string;
	}
	const rows: ProfRow[] = [];
	for (const prof of PROFESSIONS) {
		const endings: Record<string, number> = {};
		let wins = 0, goals = 0, days = 0, maxSkillSum = 0;
		for (let i = 0; i < N; i++) {
			const res = runOne(i, { profession: prof.id });
			endings[res.ending] = (endings[res.ending] ?? 0) + 1;
			if (res.won) wins++;
			if (res.goalDone) goals++;
			days += res.days;
			maxSkillSum += res.endSkills.max;
		}
		rows.push({
			id: prof.id,
			name: prof.name,
			winRate: (wins / N) * 100,
			goalRate: (goals / N) * 100,
			avgDays: days / N,
			avgMaxSkill: maxSkillSum / N,
			topEnding: topEndingOf(endings, N)
		});
	}
	const meanWin = rows.reduce((s, r) => s + r.winRate, 0) / rows.length;
	const meanGoal = rows.reduce((s, r) => s + r.goalRate, 0) / rows.length;
	const meanDays = rows.reduce((s, r) => s + r.avgDays, 0) / rows.length;
	const meanMaxSkill = rows.reduce((s, r) => s + r.avgMaxSkill, 0) / rows.length;

	console.log(`=== Sim by Profession (N=${N}/prof, difficulty=${DIFF}, hardship=${HARD}) ===`);
	console.log(`${'Profession'.padEnd(16)} | ${'Win%'.padStart(6)} | ${'ΔWin'.padStart(6)} | ${'Goal%'.padStart(6)} | ${'AvgDays'.padStart(7)} | ${'MaxSk'.padStart(5)} | ${'Top Ending'.padEnd(18)} | Flag`);
	console.log('-'.repeat(86));
	const outliers: string[] = [];
	for (const r of rows) {
		const delta = r.winRate - meanWin;
		const isOutlier = Math.abs(delta) > 10;
		const flag = isOutlier ? `OUTLIER (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%)` : '';
		if (isOutlier) outliers.push(`${r.id} (${r.winRate.toFixed(1)}%, ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs mean)`);
		const deltaStr = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
		console.log(
			`${r.id.padEnd(16)} | ${(r.winRate.toFixed(1) + '%').padStart(6)} | ${deltaStr.padStart(6)} | ${(r.goalRate.toFixed(1) + '%').padStart(6)} | ${r.avgDays.toFixed(1).padStart(7)} | ${r.avgMaxSkill.toFixed(2).padStart(5)} | ${r.topEnding.padEnd(18)} | ${flag}`
		);
	}
	console.log('-'.repeat(86));
	console.log(
		`${'MEAN'.padEnd(16)} | ${(meanWin.toFixed(1) + '%').padStart(6)} | ${'0.0%'.padStart(6)} | ${(meanGoal.toFixed(1) + '%').padStart(6)} | ${meanDays.toFixed(1).padStart(7)} | ${meanMaxSkill.toFixed(2).padStart(5)} |`
	);
	console.log(`Outliers (>10% from mean win ${meanWin.toFixed(1)}%): ${outliers.length ? outliers.join(', ') : 'none'}`);
	printSkillReport(allEndSkills, allDay300Skills);
} else if (byMode === 'goal') {
	interface GoalRow {
		id: string;
		name: string;
		goalRate: number;
		winRate: number;
		avgDays: number;
		topEnding: string;
	}
	const rows: GoalRow[] = [];
	for (const g of GOALS) {
		const endings: Record<string, number> = {};
		let wins = 0, goals = 0, days = 0;
		for (let i = 0; i < N; i++) {
			const res = runOne(i, { goal: g.id });
			endings[res.ending] = (endings[res.ending] ?? 0) + 1;
			if (res.won) wins++;
			if (res.goalDone) goals++;
			days += res.days;
		}
		rows.push({
			id: g.id,
			name: g.name,
			goalRate: (goals / N) * 100,
			winRate: (wins / N) * 100,
			avgDays: days / N,
			topEnding: topEndingOf(endings, N)
		});
	}
	const meanGoal = rows.reduce((s, r) => s + r.goalRate, 0) / rows.length;
	const meanWin = rows.reduce((s, r) => s + r.winRate, 0) / rows.length;
	const meanDays = rows.reduce((s, r) => s + r.avgDays, 0) / rows.length;

	console.log(`=== Sim by Life Goal (N=${N}/goal, difficulty=${DIFF}, hardship=${HARD}) ===`);
	console.log(`${'Goal'.padEnd(14)} | ${'Goal%'.padStart(6)} | ${'ΔGoal'.padStart(7)} | ${'Win%'.padStart(6)} | ${'ΔWin'.padStart(6)} | ${'AvgDays'.padStart(7)} | ${'Top Ending'.padEnd(18)} | Flag`);
	console.log('-'.repeat(86));
	const outliers: string[] = [];
	for (const r of rows) {
		const dGoal = r.goalRate - meanGoal;
		const dWin = r.winRate - meanWin;
		const flags: string[] = [];
		if (Math.abs(dGoal) > 10) flags.push(`goal ${dGoal >= 0 ? '+' : ''}${dGoal.toFixed(1)}%`);
		if (Math.abs(dWin) > 10) flags.push(`win ${dWin >= 0 ? '+' : ''}${dWin.toFixed(1)}%`);
		const isOutlier = flags.length > 0;
		const flagStr = isOutlier ? `OUTLIER (${flags.join(', ')})` : '';
		if (isOutlier) outliers.push(`${r.id} (${flags.join(', ')})`);
		const dGoalStr = `${dGoal >= 0 ? '+' : ''}${dGoal.toFixed(1)}%`;
		const dWinStr = `${dWin >= 0 ? '+' : ''}${dWin.toFixed(1)}%`;
		console.log(
			`${r.id.padEnd(14)} | ${(r.goalRate.toFixed(1) + '%').padStart(6)} | ${dGoalStr.padStart(7)} | ${(r.winRate.toFixed(1) + '%').padStart(6)} | ${dWinStr.padStart(6)} | ${r.avgDays.toFixed(1).padStart(7)} | ${r.topEnding.padEnd(18)} | ${flagStr}`
		);
	}
	console.log('-'.repeat(86));
	console.log(
		`${'MEAN'.padEnd(14)} | ${(meanGoal.toFixed(1) + '%').padStart(6)} | ${'0.0%'.padStart(7)} | ${(meanWin.toFixed(1) + '%').padStart(6)} | ${'0.0%'.padStart(6)} | ${meanDays.toFixed(1).padStart(7)} |`
	);
	console.log(`Outliers (>10% from mean goal ${meanGoal.toFixed(1)}% or win ${meanWin.toFixed(1)}%): ${outliers.length ? outliers.join(', ') : 'none'}`);
	printSkillReport(allEndSkills, allDay300Skills);
} else {
	const endings: Record<string, number> = {};
	const ids: Record<string, number> = {};
	let cards = 0, days = 0, legends = 0, ups = 0, crew = 0, mounts = 0, sc = 0;
	for (let i = 0; i < N; i++) {
		const res = runOne(i, {}, ids);
		endings[res.ending] = (endings[res.ending] ?? 0) + 1;
		cards += res.cardsSeen;
		days += res.days;
		legends += res.legends;
		ups += res.ups;
		crew += res.crew;
		mounts += res.mounts;
		sc += res.sc;
	}
	const won = (endings.victory ?? 0) + (endings.second ?? 0);
	console.log(`${DIFF}/${HARD}: win ${Math.round((won / N) * 100)}%`, endings);
	console.log(`avg cards ${(cards / N).toFixed(1)} days ${(days / N).toFixed(1)} legends ${(legends / N).toFixed(2)} hidden-options ${(ups / N).toFixed(1)} crew@end ${(crew / N).toFixed(2)} mount@end ${(mounts / N).toFixed(2)} score ${(sc / N).toFixed(0)}`);
	console.log('card freq', Object.entries(ids).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
	printSkillReport(allEndSkills, allDay300Skills);
}

