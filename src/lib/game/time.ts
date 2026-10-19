import type { Run } from './types';

export type DiurnalPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type TimeStage = 'morning' | 'day' | 'night';

export interface TimeInfo {
	day: number;
	dayOfWeek: string;
	hour: number;
	minute: number;
	timeStr: string;
	phase: DiurnalPhase;
	phaseLabel: string;
	stage: TimeStage;
	sunLon: number;
	sunLat: number;
	antiSunLon: number;
	antiSunLat: number;
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BASE_ENERGY: Record<string, number> = { pilgrim: 4, courier: 3, ronin: 3, legend: 2 };

function getMaxEnergy(run: Run): number {
	const f = run.flags?.energyMax;
	if (f === 'unlimited') return Infinity;
	let m = typeof f === 'number' ? f : (BASE_ENERGY[run.difficulty] ?? 3);
	if ((run.stats?.vigor ?? 50) >= 70) m += 1;
	if ((run.stats?.vigor ?? 50) < 25) m -= 1;
	if (run.flags?.tidy === true && run.hero?.traits?.includes('meticulous')) m += 1;
	return Math.max(1, m);
}

/**
 * Calculates in-game diurnal time, phase, stage (morning/day/night), and astronomical solar position on the globe.
 */
export function getTimeInfo(run: Run): TimeInfo {
	const dayOfWeek = DAYS_OF_WEEK[(run.day + 4) % 7];

	let hourFloat = 12;
	let phase: DiurnalPhase = 'day';
	let phaseLabel = 'Day';
	let stage: TimeStage = 'day';

	if (run.phase === 'city') {
		const maxE = getMaxEnergy(run);
		const curE = run.energy ?? 0;

		if (curE >= maxE) {
			// Golden morning dawn: full vigor, fresh markets opening
			hourFloat = 7.5;
			phase = 'dawn';
			phaseLabel = 'Morning';
			stage = 'morning';
		} else if (curE <= 0) {
			// Deep night: exhaustion, lanterns lit, ghost market operating
			hourFloat = 21.5;
			phase = 'night';
			phaseLabel = 'Night';
			stage = 'night';
		} else {
			// Afternoon hustle: energy spent on visits and market errands
			const progress = Math.max(0, Math.min(1, (maxE - curE) / Math.max(1, maxE)));
			hourFloat = 11.5 + progress * 5.5; // ~12:00 PM to ~16:30 PM
			phase = hourFloat >= 17 ? 'dusk' : 'day';
			phaseLabel = hourFloat >= 17 ? 'Dusk' : 'Afternoon';
			stage = 'day';
		}
	} else {
		// Progression through cards on the road advances diurnal hours
		const cardProgress = Math.max(0, (run.deckTotal ?? 0) - (run.deck?.length ?? 0));
		hourFloat = (7 + cardProgress * 2.5) % 24;

		if (hourFloat >= 5 && hourFloat < 8) {
			phase = 'dawn';
			phaseLabel = 'Dawn';
			stage = 'morning';
		} else if (hourFloat >= 8 && hourFloat < 17) {
			phase = 'day';
			phaseLabel = 'Day';
			stage = hourFloat < 11.5 ? 'morning' : 'day';
		} else if (hourFloat >= 17 && hourFloat < 20) {
			phase = 'dusk';
			phaseLabel = 'Dusk';
			stage = 'night';
		} else {
			phase = 'night';
			phaseLabel = 'Night';
			stage = 'night';
		}
	}

	const hour = Math.floor(hourFloat);
	const minute = Math.floor((hourFloat - hour) * 60);

	const ampm = hour >= 12 ? 'PM' : 'AM';
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	const timeStr = `${displayHour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;

	// Solar longitude: noon (12:00) is subsolar center
	const sunLon = ((12 - hourFloat) * 15 + 180) % 360 - 180;

	// Solar declination (latitude) changes with the seasons
	const month = run.month0 ?? 4;
	const sunLat = 23.44 * Math.sin((month - 3) * (Math.PI / 6));

	// Anti-solar coordinates (center of the night shadow hemisphere)
	const antiSunLon = sunLon > 0 ? sunLon - 180 : sunLon + 180;
	const antiSunLat = -sunLat;

	return {
		day: run.day,
		dayOfWeek,
		hour,
		minute,
		timeStr,
		phase,
		phaseLabel,
		stage,
		sunLon,
		sunLat,
		antiSunLon,
		antiSunLat
	};
}
