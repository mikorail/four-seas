// Plays every campaign many times with a random bot; reports endings reached and beats seen.
import { Rng } from '#lib/rng';
import { CAMPAIGNS } from '#lib/content/index';
import { newRun, randomHero, availableRoutes, depart, choose } from '#lib/game/engine';
import { shortestDays } from '#lib/data/world';

for (const c of CAMPAIGNS) {
	const endings: Record<string, number> = {};
	const beats = new Set<string>();
	for (let i = 0; i < 150; i++) {
		const r = new Rng(i * 31 + 7);
		const year = r.int(c.years[0], c.years[1]);
		const run = newRun(randomHero(r, year, { culture: c.culture }), 'c' + i, year, { campaign: c.id });
		let steps = 0;
		while (run.phase !== 'end' && steps++ < 3000) {
			if (run.phase === 'map') {
				const routes = availableRoutes(run);
				const dist = shortestDays(run.destination, run.year);
				routes.sort((a, b) => (dist[a.to] ?? 1e9) + a.days - ((dist[b.to] ?? 1e9) + b.days));
				depart(run, r.chance(0.85) ? routes[0] : r.pick(routes));
			} else {
				const card = run.deck[0];
				if (card.id.startsWith('cmp-')) beats.add(card.id.replace(`cmp-${c.id}-`, ''));
				choose(run, card.up && r.chance(0.5) ? 'up' : r.chance(0.5) ? 'left' : 'right');
			}
		}
		const k = run.ending?.title ?? 'stuck';
		endings[k] = (endings[k] ?? 0) + 1;
	}
	console.log(`\n${c.title}: beats seen ${beats.size}/${c.beats.length} (${c.beats.map((b) => b.meta.id).filter((b) => !beats.has(b!)).join(', ') || 'none'} missing)`);
	console.log(endings);
}
