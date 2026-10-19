import type { Run } from './types';
import { CITY, cityName } from '#lib/data/world';
import { CULTURES } from '#lib/data/cultures';
import { OUTFITS } from '#lib/data/market';
import { wear } from './market';
import { log } from './engine';

export interface DressRecommendation {
	cityId: string;
	cityName: string;
	cultureLabel: string;
	advisory: string;
	recommendedOutfitId: string;
	recommendedOutfitName: string;
	recommendedOutfitGlyph: string;
	ownedOutfitId?: string;
	alreadyWearing: boolean;
}

const CITY_OUTFIT_PREF: Record<string, string> = {
	beijing: 'mandarin-robe',
	nanjing: 'mandarin-robe',
	hanseong: 'scholar-robes',
	kyoto: 'local-dress',
	edo: 'samurai-armor',
	istanbul: 'janissary-uniform',
	isfahan: 'silk-turban',
	delhi: 'silk-turban',
	agra: 'silk-turban',
	venice: 'merchant-silks',
	london: 'company-uniform',
	amsterdam: 'company-uniform',
	batavia: 'company-uniform',
	macau: 'company-uniform',
	hongkong: 'company-uniform',
	lhasa: 'monk-robes',
	mecca: 'pilgrim-garb',
	varanasi: 'pilgrim-garb',
	kandy: 'pilgrim-garb',
	malacca: 'merchant-silks'
};

const CULTURE_OUTFIT_PREF: Record<string, string> = {
	han: 'scholar-robes',
	korean: 'scholar-robes',
	japanese: 'local-dress',
	viet: 'scholar-robes',
	ottoman: 'janissary-uniform',
	persian: 'silk-turban',
	indian: 'silk-turban',
	european: 'company-uniform',
	malay: 'merchant-silks',
	steppe: 'local-dress',
	tibetan: 'monk-robes',
	swahili: 'merchant-silks',
	siamese: 'local-dress',
	burmese: 'local-dress',
	pacific: 'local-dress'
};

const ADVISORIES: Record<string, string> = {
	'mandarin-robe': 'Confucian magistrates and imperial guards bow to high office. Wearing official robes bypasses intrusive gate questioning.',
	'scholar-robes': 'Academies, library vaults, and tea salons open readily to scholars bearing the ink of classical learning.',
	'janissary-uniform': 'Garrison commanders and citadel sentries salute the Sultan’s elite regiment without delay.',
	'silk-turban': 'Patricians and court viziers receive visitors in jewel-trimmed silks with generous diplomatic courtesy.',
	'company-uniform': 'Factorij guards, customs houses, and treaty port factors extend commercial credit to recognized company coats.',
	'merchant-silks': 'Bazaars and guildhalls take wealthy merchants seriously, offering insider prices.',
	'pilgrim-garb': 'Holy shrines, hospice cloisters, and charitable strangers offer unhesitating shelter to humble pilgrims.',
	'monk-robes': 'Temples and hermitages welcome religious mendicants with tea and food.',
	'samurai-armor': 'Ronin and street cutthroats step off the pavement when lacquered battle armor approaches.',
	'local-dress': 'Dressing as the locals do ensures you blend into the crowds and avoid foreign taxes.'
};

export function getDressRecommendation(run: Run, cityId = run.location): DressRecommendation {
	const c = CITY[cityId];
	const cName = cityName(c, run.year);
	const cult = CULTURES[c.culture];

	const prefId = CITY_OUTFIT_PREF[cityId] ?? CULTURE_OUTFIT_PREF[c.culture] ?? 'local-dress';
	const prefOutfit = OUTFITS[prefId] ?? OUTFITS['local-dress'];

	// Check if player owns the preferred outfit or any local dress
	const matchingInBag = run.bag.find((id) => id === prefId || (id === 'local-dress' && prefId === 'local-dress'));
	const anyOutfitInBag = matchingInBag ?? run.bag.find((id) => OUTFITS[id]);

	const alreadyWearing = run.outfit?.id === prefId;

	const advisory = ADVISORIES[prefId] ?? 'Dressing appropriately for the local court and markets earns immediate respect.';

	return {
		cityId,
		cityName: cName,
		cultureLabel: cult.label,
		advisory,
		recommendedOutfitId: prefId,
		recommendedOutfitName: prefOutfit.name,
		recommendedOutfitGlyph: prefOutfit.glyph,
		ownedOutfitId: anyOutfitInBag,
		alreadyWearing
	};
}

export function donRecommendedGarb(run: Run, outfitId: string): string {
	wear(run, outfitId);
	const out = OUTFITS[outfitId];
	const cCulture = CITY[run.location].culture;
	// the goodwill comes once per city — changing clothes back and forth does not farm standing
	const key = 'garb:' + run.location;
	const first = !run.flags[key];
	if (first) {
		run.flags[key] = true;
		run.standing[cCulture] = Math.min(100, (run.standing[cCulture] ?? 0) + 10);
	}
	const msg = first ? `Donned ${out?.name ?? outfitId}. Locals in ${cityName(CITY[run.location], run.year)} notice your respectful attire (+10 Cultural Standing).` : `Donned ${out?.name ?? outfitId}.`;
	log(run, msg);
	return msg;
}
