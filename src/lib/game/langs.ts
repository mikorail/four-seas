// Languages you pick up by living among people. Each level makes locals warmer, prices fairer and words easier.
import type { CultureId } from '#lib/data/cultures';
import type { Run } from './types';

export const LANG: Record<CultureId, { name: string; script: string }> = {
	han: { name: 'Chinese', script: '漢' },
	japanese: { name: 'Japanese', script: 'あ' },
	korean: { name: 'Korean', script: '한' },
	viet: { name: 'Vietnamese', script: 'Ư' },
	siamese: { name: 'Thai', script: 'ก' },
	malay: { name: 'Malay', script: 'ب' },
	indian: { name: 'Hindustani', script: 'क' },
	persian: { name: 'Persian', script: 'ف' },
	ottoman: { name: 'Ottoman Turkish', script: 'ع' },
	tibetan: { name: 'Tibetan', script: 'ཀ' },
	steppe: { name: 'Mongol', script: 'ᠮ' },
	swahili: { name: 'Swahili', script: 'S' },
	european: { name: 'Portuguese', script: 'P' },
	pacific: { name: 'Hawaiian', script: 'ʻ' }
};
export const LEVEL_NAME = ['none', 'a few words', 'conversational', 'fluent'] as const;
const DAYS_PER_LEVEL = 25;

/** 0 none · 1 a few words · 2 conversational · 3 fluent (your own language is always 3). */
export function langLevel(run: Pick<Run, 'hero' | 'langs'>, c: CultureId): number {
	if (c === run.hero.culture) return 3;
	const fast = run.hero.traits.includes('polyglot') || run.hero.profession === 'envoy' ? 2 : 1;
	return Math.min(3, Math.floor(((run.langs?.[c] ?? 0) * fast) / DAYS_PER_LEVEL));
}

/** Time spent among speakers of a language. Returns a note if you just got better at it. */
export function hearLanguage(run: Run, c: CultureId, days: number): string | null {
	if (c === run.hero.culture || days <= 0) return null;
	const before = langLevel(run, c);
	run.langs ??= {};
	run.langs[c] = (run.langs[c] ?? 0) + days;
	const now = langLevel(run, c);
	return now > before ? `🗣 Your ${LANG[c].name} is now **${LEVEL_NAME[now]}**. Locals ${now === 3 ? 'forget you are foreign' : now === 2 ? 'stop slowing down for you' : 'smile when you try'}.` : null;
}
