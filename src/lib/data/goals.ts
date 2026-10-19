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

const langs = (r: Run) => Object.values(r.langs ?? {}).filter((d) => (d ?? 0) >= 50).length;

export const GOALS: LifeGoal[] = [
	{ id: 'see-the-seas', name: 'See every shore', glyph: '海', desc: 'Walk among eight different peoples before you die.', progress: (r) => [new Set(r.visited.map((id) => CITY[id]?.culture)).size, 8] },
	{ id: 'fame', name: 'A name in every court', glyph: '名', desc: 'Be honoured (standing 40+) by four different peoples.', progress: (r) => [Object.values(r.standing ?? {}).filter((v) => v >= 40).length, 4] },
	{ id: 'love', name: 'Marry for love', glyph: '縁', desc: 'Find someone, and marry them.', progress: (r) => [r.romance?.status === 'married' ? 1 : 0, 1] },
	{ id: 'mastery', name: 'Master a craft', glyph: '匠', desc: 'Reach level 8 in any life skill.', progress: (r) => [Math.max(0, ...Object.values(r.skills ?? {}).map((x) => levelOf(x ?? 0))), 8] },
	{ id: 'fortune', name: 'Die rich', glyph: '富', desc: 'Bank 150 taels with your factors.', progress: (r) => [r.treasury ?? 0, 150] },
	{ id: 'storyteller', name: 'A thousand and one nights', glyph: '話', desc: 'Gather eight tales worth telling.', progress: (r) => [r.repertoire?.length ?? 0, 8] },
	{ id: 'polyglot', name: 'Speak to everyone', glyph: '語', desc: 'Become conversational in four languages not your own.', progress: (r) => [langs(r), 4] },
	{ id: 'pilgrim', name: 'The great pilgrimage', glyph: '巡', desc: 'Reach three holy places of your faith.', progress: (r) => [r.pilgrimages?.length ?? 0, 3] },
	{ id: 'atonement', name: 'Atone', glyph: '贖', desc: 'Raise your merit to 50. Whatever you did before, undo it.', progress: (r) => [Math.max(0, r.karma), 50] },
	{ id: 'secrets', name: 'Roads nobody knows', glyph: '秘', desc: 'Discover four hidden roads.', progress: (r) => [Object.keys(r.flags).filter((k) => k.startsWith('secret:')).length, 4] },
	{ id: 'legends', name: 'Walk with legends', glyph: '伝', desc: 'Meet five living legends.', progress: (r) => [r.legends.length, 5] },
	{ id: 'home', name: 'A place to come back to', glyph: '家', desc: 'Make a home somewhere, and keep it for a year.', progress: (r) => [r.home ? Math.min(365, r.day - r.home.since) : 0, 365] },
	{ id: 'friends', name: 'Friends in every port', glyph: '友', desc: 'Make five true friends along the way.', progress: (r) => [(r.people ?? []).filter((p) => p.stage !== 'acquaintance' && p.stage !== 'rival').length, 5] },
	{ id: 'titles', name: 'They will sing of you', glyph: '号', desc: 'Earn three titles the world calls you by.', progress: (r) => [r.titles?.length ?? 0, 3] }
];
export const GOAL: Record<string, LifeGoal> = Object.fromEntries(GOALS.map((g) => [g.id, g]));
