// The storyteller's repertoire: your best moments become tales; audiences in each culture prefer different kinds.
import { CITY, cityName } from '#lib/data/world';
import type { CultureId } from '#lib/data/cultures';
import type { Card, Choice, Run, Tale } from './types';

export const GENRE_LABEL: Record<Tale['genre'], string> = { adventure: 'adventure', romance: 'love story', ghost: 'ghost story', war: 'war story', comedy: 'comedy', wonder: 'tale of wonders' };

/** What each culture's audiences love most (first) and still enjoy (second). */
export const TASTE: Record<CultureId, [Tale['genre'], Tale['genre']]> = {
	han: ['ghost', 'war'],
	japanese: ['ghost', 'romance'],
	korean: ['romance', 'war'],
	viet: ['war', 'ghost'],
	siamese: ['wonder', 'comedy'],
	malay: ['adventure', 'romance'],
	indian: ['romance', 'wonder'],
	persian: ['romance', 'wonder'],
	ottoman: ['adventure', 'comedy'],
	tibetan: ['wonder', 'ghost'],
	steppe: ['war', 'adventure'],
	swahili: ['adventure', 'comedy'],
	european: ['adventure', 'war'],
	pacific: ['wonder', 'adventure']
};

function add(run: Run, title: string, genre: Tale['genre']) {
	run.repertoire ??= [];
	if (run.repertoire.some((t) => t.title === title)) return null;
	const t: Tale = { id: `tale-${run.day}-${run.repertoire.length}`, title, genre, day: run.day, place: run.route?.to ?? run.location, told: 0 };
	run.repertoire.unshift(t);
	if (run.repertoire.length > 14) run.repertoire.length = 14;
	return t;
}

/** After a choice: did that make a story worth telling? */
export function talesFrom(run: Run, card: Card, ch: Choice, side: string, won: boolean | undefined): string | null {
	const here = cityName(CITY[run.route?.to ?? run.location], run.year);
	const tags = ch.tags ?? [];
	let t: Tale | null = null;
	if (ch.legend) t = add(run, `The night I met ${card.npc.name}`, 'wonder');
	else if (card.id.startsWith('rare-')) t = add(run, `${card.npc.name}, and what happened in ${here}`, 'wonder');
	else if (card.id.startsWith('crisis-') && side !== 'right') t = add(run, `How I cheated death in ${here}`, 'adventure');
	else if (card.id.startsWith('dis-')) t = add(run, `${card.badge?.replace(/^\S+\s/, '') ?? 'The disaster'} at ${here}`, 'adventure');
	else if (card.npc.role === 'ghost' || card.npc.role === 'spirit') t = add(run, `The ${card.npc.title.toLowerCase()} of ${here}`, 'ghost');
	else if (won && tags.includes('fight')) t = add(run, `The fight at ${here}`, 'war');
	else if (won === false && tags.includes('gamble')) t = add(run, `How I lost my shirt in ${here}`, 'comedy');
	else if (ch.romance?.start || ch.romance?.status === 'married') t = add(run, ch.romance?.status === 'married' ? `How I married ${card.npc.name}` : `Meeting ${card.npc.name}`, 'romance');
	return t ? `📖 A new tale for your repertoire: *${t.title}* (${GENRE_LABEL[t.genre]}).` : null;
}

/** How well a tale lands with this audience, 0..1. Fresh tales do better; retold ones wear thin. */
export function taleFit(t: Tale, culture: CultureId): number {
	const [love, like] = TASTE[culture];
	const base = t.genre === love ? 0.75 : t.genre === like ? 0.6 : 0.42;
	return Math.max(0.15, base - t.told * 0.08);
}
