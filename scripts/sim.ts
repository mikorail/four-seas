// Headless balance sim: semi-sensible bot. `npx tsx scripts/sim.ts 400`
import { Rng } from '#lib/rng';
import { newRun, randomHero, availableRoutes, depart, choose, score, useItem } from '#lib/game/engine';
import { shortestDays } from '#lib/data/world';
import { ITEMS } from '#lib/data/items';
import type { Choice } from '#lib/game/types';

const N = Number(process.argv[2] ?? 300);
const DIFF = process.argv[3] ?? 'courier';
const HARD = process.argv[4] ?? 'none';
const endings: Record<string, number> = {};
const ids: Record<string, number> = {};
let cards = 0, days = 0, legends = 0, ups = 0, crew = 0, mounts = 0, sc = 0;
for (let i = 0; i < N; i++) {
	const r = new Rng(i * 7919 + 1);
	const year = r.int(1500, 1900);
	const run = newRun(randomHero(r, year), 'sim' + i, year, { difficulty: DIFF, hardship: HARD });
	let steps = 0;
	while (run.phase !== 'end' && steps++ < 3000) {
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
		} else if (run.phase !== 'end') {
			const c = run.deck[0];
			ids[c.id] = (ids[c.id] ?? 0) + 1;
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
			if (c.up && r.chance(0.8)) { ups++; choose(run, 'up'); continue; }
			choose(run, r.chance(0.75) ? (cost(c.left) < cost(c.right) ? 'left' : 'right') : r.chance(0.5) ? 'left' : 'right');
		}
	}
	const k = run.ending?.kind ?? 'stuck';
	endings[k] = (endings[k] ?? 0) + 1;
	cards += run.cardsSeen; days += run.day; legends += run.legends.length; crew += run.crew.length; mounts += run.mount ? 1 : 0; sc += score(run);
}
const won = (endings.victory ?? 0) + (endings.second ?? 0);
console.log(`${DIFF}/${HARD}: win ${Math.round((won / N) * 100)}%`, endings);
console.log(`avg cards ${(cards / N).toFixed(1)} days ${(days / N).toFixed(1)} legends ${(legends / N).toFixed(2)} hidden-options ${(ups / N).toFixed(1)} crew@end ${(crew / N).toFixed(2)} mount@end ${(mounts / N).toFixed(2)} score ${(sc / N).toFixed(0)}`);
console.log('card freq', Object.entries(ids).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(' '));
