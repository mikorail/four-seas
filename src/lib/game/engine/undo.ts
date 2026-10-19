import { CITY, cityName } from '#lib/data/world';
import type { Run } from '../types';
import { decompressSave, parseRun, serializePlain } from './saves';
import { log } from './utils';

/** A snapshot without the snapshots inside it (so they don't nest), keeping only the last 40 log entries and 60 trend points. */
export function snapshot(run: Run): string {
	const { undo: _u, restorePoints: _r, ...rest } = run;
	const trimmed: Run = {
		...(rest as Run),
		log: (rest.log ?? []).slice(0, 40),
		trend: (rest.trend ?? []).slice(-60)
	};
	return serializePlain(trimmed);
}

const stayKey = (run: Run) => `${run.location}@${run.flags.stay ?? 0}`;

/** Can you take back your last swipe? Once per city stay (any number of times on Pilgrimage). */
export const canUndo = (run: Run) => !!run.undo && (run.difficulty === 'pilgrim' || run.flags.undoUsed !== stayKey(run));

/** Call just before a choice: remembers the moment so it can be taken back. */
export function rememberForUndo(run: Run) {
	if (run.phase === 'end') return;
	run.undo = snapshot(run);
}

/** Take back the last swipe. Returns the earlier run, or null. */
export function undoLast(run: Run): Run | null {
	if (!canUndo(run)) return null;
	const back = parseRun(run.undo!);
	if (!back) return null;
	back.restorePoints = run.restorePoints;
	back.undo = null;
	back.flags.undoUsed = stayKey(back);
	log(back, '(You took a moment to reconsider.)');
	return back;
}

/** On arriving in a city: keep a restore point (the last three). */
export function keepRestorePoint(run: Run) {
	run.restorePoints = [snapshot(run), ...(run.restorePoints ?? [])].slice(0, 3);
}

export function restorePointsOf(run: Run): { i: number; day: number; city: string }[] {
	return (run.restorePoints ?? []).map((s, i) => {
		try {
			const r = JSON.parse(decompressSave(s)) as Run;
			return { i, day: r.day, city: cityName(CITY[r.location], r.year) };
		} catch {
			return { i, day: 0, city: '?' };
		}
	});
}

/** Go back to an earlier city arrival. */
export function rewindTo(run: Run, i: number): Run | null {
	const s = run.restorePoints?.[i];
	const back = s ? parseRun(s) : null;
	if (!back) return null;
	back.restorePoints = run.restorePoints!.slice(i);
	back.undo = null;
	log(back, `(Rewound to day ${back.day} in ${cityName(CITY[back.location], back.year)}.)`);
	return back;
}
