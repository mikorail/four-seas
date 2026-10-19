// Life goals: what your traveller really wants, beyond the commission. Progress is measured from the journey itself.
import { CITY } from './world';
import { levelOf } from './skills';
import type { Run } from '#lib/game/types';

export interface LifeGoal {
	id: string;
	name: string;
	glyph: string;
	desc: string;
	progress: (run: Run) => [number, number];
}

const langs = (r: Run) => Object.values(r.langs ?? {}).filter((d) => (d ?? 0) >= 15).length;

export const GOALS: LifeGoal[] = [
	{ id: 'see-the-seas', name: 'See every shore', glyph: '海', desc: 'Walk among six different peoples before you die.', progress: (r) => [new Set(r.visited.map((id) => CITY[id]?.culture)).size, 6] },
	{ id: 'fame', name: 'A name in every court', glyph: '名', desc: 'Be honoured (standing 12+) by three different peoples.', progress: (r) => [Object.values(r.standing ?? {}).filter((v) => v >= 12).length, 3] },
	{ id: 'love', name: 'Marry for love', glyph: '縁', desc: 'Find someone to court deeply, betroth, or marry.', progress: (r) => [r.romance && (r.romance.status === 'married' || r.romance.status === 'betrothed' || r.romance.affection >= 55) || (r.people ?? []).some((p) => p.stage === 'sweetheart') ? 1 : 0, 1] },
	{ id: 'mastery', name: 'Master a craft', glyph: '匠', desc: 'Hone any life skill to mastery (90+ experience).', progress: (r) => [Math.min(5, Math.floor(Math.max(0, ...Object.values(r.skills ?? {}).map((x) => x ?? 0)) / 18)), 5] },
	{ id: 'fortune', name: 'Die rich', glyph: '富', desc: 'Amass a rich purse or bank 50 taels with your factors.', progress: (r) => [Math.max(r.treasury ?? 0, (r.treasury ?? 0) + Math.max(0, r.stats.silver - 32) + (r.ventures?.length ?? 0) * 25), 50] },
	{ id: 'storyteller', name: 'A thousand and one nights', glyph: '話', desc: 'Gather eight tales worth telling.', progress: (r) => [r.repertoire?.length ?? 0, 8] },
	{ id: 'polyglot', name: 'Speak to everyone', glyph: '語', desc: 'Learn to converse in three languages not your own.', progress: (r) => [langs(r), 3] },
	{ id: 'pilgrim', name: 'The great pilgrimage', glyph: '巡', desc: 'Reach two holy places or heights of devotion.', progress: (r) => [(r.pilgrimages?.length ?? 0) + Math.floor((r.skills?.spirit ?? 0) / 25), 2] },
	{ id: 'atonement', name: 'Atone', glyph: '贖', desc: 'Raise your merit to 48. Whatever you did before, undo it.', progress: (r) => [Math.max(0, r.karma), 48] },
	{ id: 'secrets', name: 'Roads nobody knows', glyph: '秘', desc: 'Discover two hidden roads or secret route clues.', progress: (r) => [Object.keys(r.flags).filter((k) => k.startsWith('secret:') || k.startsWith('hint:')).length, 2] },
	{ id: 'legends', name: 'Walk with legends', glyph: '伝', desc: 'Meet five living legends.', progress: (r) => [r.legends.length, 5] },
	{ id: 'home', name: 'A place to come back to', glyph: '家', desc: 'Make a home somewhere, and keep it for a season.', progress: (r) => [r.home ? Math.min(90, r.day - r.home.since) : 0, 90] },
	{ id: 'friends', name: 'Friends in every port', glyph: '友', desc: 'Make three true friends or loyal companions along the way.', progress: (r) => [(r.people ?? []).filter((p) => p.stage !== 'acquaintance' && p.stage !== 'rival').length + (r.crew ?? []).filter((c) => c.loyalty >= 70).length, 3] },
	{ id: 'titles', name: 'They will sing of you', glyph: '号', desc: 'Earn two titles or honours the world calls you by.', progress: (r) => [(r.titles?.length ?? 0) + (r.statuses ?? []).filter((s) => ['enlightened', 'master-courier', 'blessed-hands', 'oath-keeper'].includes(s)).length, 2] }
];
export const GOAL: Record<string, LifeGoal> = Object.fromEntries(GOALS.map((g) => [g.id, g]));
