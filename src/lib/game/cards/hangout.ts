import type { Card, Choice, Run } from '../types';
import { notableOfCity, type Notable } from '#lib/data/notables';
import { CITY, cityName, SECRETS } from '#lib/data/world';
import { Rng } from '#lib/rng';

export function buildHangoutCard(run: Run, notable?: Notable): Card {
	const city = CITY[run.location];
	const here = cityName(city, run.year);
	const target = notable ?? notableOfCity(run.location, run.year);
	const rng = new Rng(run.seed + ':' + run.day + ':hangout:' + target.name);

	// Find any secret route that could be hinted
	const unrevealedSecrets = SECRETS.filter((s) => !run.flags['secret:' + s.id]);
	const hintSecret = unrevealedSecrets.length > 0 ? rng.pick(unrevealedSecrets) : null;

	const actDesc: Record<Notable['favoredActivity'], string> = {
		tea: 'brews rare local mountain tea over glowing charcoal',
		boardgame: 'sets down a lacquered board with polished stone pieces',
		debate: 'leans back with a thoughtful smile, testing your worldview',
		secrets: 'leans close over a quiet balcony, speaking in hushed tones',
		poetry: 'tunes a silk-stringed instrument and murmurs a resonant line'
	};

	const activityLine = actDesc[target.favoredActivity];

	const left: Choice = {
		label: `Share tea & stories (+Mind, +Vigor)`,
		fx: { vigor: 8 },
		karma: 3,
		text: `You sit together for hours, exchanging memories of distant roads and quiet evenings. Your spirits are restored, and ${target.name} smiles warmly.`
	};

	const right: Choice = {
		label: target.favoredActivity === 'boardgame' ? 'Play a match on the board' : 'Engage in lively debate',
		fx: { renown: 6 },
		gamble: {
			p: 0.55,
			win: {
				fx: { renown: 12, silver: 5 },
				text: `Your keen insight and steady hands prevail! ${target.name} applauds your prowess: "A masterly move!"`
			},
			lose: {
				fx: { renown: 2 },
				text: `A well-fought contest! Though ${target.name} claims the upper hand, they praise your spirited play.`
			}
		}
	};

	let up: Choice | undefined = undefined;
	if (hintSecret) {
		up = {
			label: `Inquire about hidden roads & rumours`,
			fx: { silver: -2 },
			bump: { ['hint:' + hintSecret.id]: 1 },
			text: `${target.name} leans in and whispers: "Old caravans spoke of **${hintSecret.name}** — ${hintSecret.hint}." A valuable lead!`
		};
	} else {
		up = {
			label: `Ask for guidance in local markets`,
			fx: { silver: 6 },
			text: `${target.name} gives you the private mark of their merchant house, saving you silver on your next purchases.`
		};
	}

	return {
		id: `hangout-${target.id}-${run.day}`,
		badge: 'Social Gathering',
		npc: {
			name: target.name,
			title: target.title,
			culture: target.culture,
			gender: target.gender,
			role: target.role,
			seed: rng.int(1, 1e9)
		},
		text: `${target.greeting} In a secluded courtyard in ${here}, ${target.name} ${activityLine}. How do you spend the hours together?`,
		left,
		right,
		up
	};
}
