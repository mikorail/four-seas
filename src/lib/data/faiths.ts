import type { CultureId } from './cultures';
import type { Tag } from './traits';

export type FaithId = 'buddhist' | 'confucian' | 'daoist' | 'shinto' | 'muslim' | 'hindu' | 'christian' | 'sikh' | 'folk' | 'skeptic';

export interface Faith {
	id: FaithId;
	name: string;
	glyph: string;
	blurb: string;
	place: string; // what their holy building is called
	holy: string[]; // pilgrimage city ids
	prayer: string; // verb phrase
	from?: number;
}

export const FAITHS: Record<FaithId, Faith> = {
	buddhist: { id: 'buddhist', name: 'Buddhist', glyph: '卍', blurb: 'All things pass. Compassion does not.', place: 'temple', holy: ['lhasa', 'kandy', 'ayutthaya', 'bangkok', 'kyoto'], prayer: 'chant the sutras' },
	confucian: { id: 'confucian', name: 'Confucian', glyph: '儒', blurb: 'Order in the family, order in the realm.', place: 'ancestral hall', holy: ['qufu', 'beijing', 'hanseong'], prayer: 'honor the ancestors' },
	daoist: { id: 'daoist', name: 'Daoist', glyph: '道', blurb: 'The soft overcomes the hard. Go with the flow.', place: 'Daoist temple', holy: ['wudang', 'chengdu'], prayer: 'burn incense to the Immortals' },
	shinto: { id: 'shinto', name: 'Shintō', glyph: '神', blurb: 'Eight million kami, and every one of them watching.', place: 'shrine', holy: ['ise', 'kyoto'], prayer: 'clap twice before the kami' },
	muslim: { id: 'muslim', name: 'Muslim', glyph: '☪', blurb: 'There is no god but God. Travel is a virtue.', place: 'mosque', holy: ['mecca', 'jeddah', 'jerusalem'], prayer: 'pray toward Mecca' },
	hindu: { id: 'hindu', name: 'Hindu', glyph: 'ॐ', blurb: 'Dharma is a long road with many temples.', place: 'mandir', holy: ['varanasi', 'kathmandu', 'hampi'], prayer: 'make puja' },
	christian: { id: 'christian', name: 'Christian', glyph: '✝', blurb: 'Carried east by Jesuits, friars and the fleet.', place: 'church', holy: ['rome', 'jerusalem', 'goa'], prayer: 'say a rosary' },
	sikh: { id: 'sikh', name: 'Sikh', glyph: 'ੴ', blurb: 'One Creator. Serve all, fear none.', place: 'gurdwara', holy: ['amritsar', 'lahore'], prayer: 'recite the Japji', from: 1500 },
	folk: { id: 'folk', name: 'Old ways', glyph: '霊', blurb: 'Ancestors, spirits of river and mountain, and very practical charms.', place: 'spirit house', holy: ['mataram', 'hue'], prayer: 'leave offerings for the spirits' },
	skeptic: { id: 'skeptic', name: 'Skeptic', glyph: '疑', blurb: 'Gods may exist. The bill still has to be paid.', place: 'library', holy: [], prayer: 'shrug' }
};

export const FAITH_IDS = Object.keys(FAITHS) as FaithId[];

/** Dominant faith of a culture, for defaults and local holy places. */
export const CULTURE_FAITH: Record<CultureId, FaithId> = {
	han: 'confucian',
	japanese: 'shinto',
	korean: 'confucian',
	viet: 'buddhist',
	siamese: 'buddhist',
	malay: 'muslim',
	indian: 'hindu',
	tibetan: 'buddhist',
	steppe: 'muslim',
	persian: 'muslim',
	ottoman: 'muslim',
	swahili: 'muslim',
	european: 'christian',
	pacific: 'folk'
};

const CITY_FAITH: Record<string, FaithId> = {
	manila: 'christian', cebu: 'christian', goa: 'christian', macau: 'christian',
	urga: 'buddhist', kyakhta: 'buddhist', lhasa: 'buddhist', kathmandu: 'hindu',
	amritsar: 'sikh', mataram: 'folk', bantam: 'muslim', kandy: 'buddhist', colombo: 'buddhist',
	agra: 'muslim', delhi: 'muslim', lahore: 'muslim', dhaka: 'muslim', golconda: 'muslim',
	wudang: 'daoist', qufu: 'confucian', ise: 'shinto', jerusalem: 'christian', rome: 'christian', varanasi: 'hindu', hampi: 'hindu',
	mecca: 'muslim', jeddah: 'muslim', mexico: 'christian', lima: 'christian', havana: 'christian', guam: 'christian',
	alexandria: 'muslim', damascus: 'muslim', athens: 'christian', angkor: 'buddhist', patna: 'hindu', taxila: 'buddhist', antioch: 'christian', carthage: 'muslim'
};

export function faithOfCity(cityId: string, culture: CultureId): FaithId {
	return CITY_FAITH[cityId] ?? CULTURE_FAITH[culture];
}

/** Faiths that sit easily together (East Asian "Three Teachings" + Shinto syncretism). */
export function kindred(a: FaithId, b: FaithId) {
	if (a === b) return true;
	const three = ['buddhist', 'confucian', 'daoist', 'shinto', 'folk'];
	return three.includes(a) && three.includes(b);
}

export type IdealId = 'honor' | 'prosperity' | 'compassion' | 'wisdom' | 'loyalty' | 'freedom' | 'harmony';

export interface Ideal {
	id: IdealId;
	name: string;
	glyph: string;
	blurb: string;
	love: Tag[];
	hate: Tag[];
}

export const IDEALS: Record<IdealId, Ideal> = {
	honor: { id: 'honor', name: 'Honor', glyph: '義', blurb: 'A blade drawn for the right reasons. No bribes, no theft.', love: ['fight'], hate: ['bribe', 'crime'] },
	prosperity: { id: 'prosperity', name: 'Prosperity', glyph: '富', blurb: 'Silver well earned is virtue made visible.', love: ['trade'], hate: ['gamble'] },
	compassion: { id: 'compassion', name: 'Compassion', glyph: '慈', blurb: 'Every stranger is someone’s child.', love: ['mercy', 'faith'], hate: ['fight', 'crime'] },
	wisdom: { id: 'wisdom', name: 'Wisdom', glyph: '智', blurb: 'Read everything. Ask everyone. Believe carefully.', love: ['talk', 'art'], hate: ['gamble'] },
	loyalty: { id: 'loyalty', name: 'Loyalty', glyph: '忠', blurb: 'The throne, the family, the oath. In that order.', love: ['official', 'loyal'], hate: ['crime', 'romance'] },
	freedom: { id: 'freedom', name: 'Freedom', glyph: '自', blurb: 'No master, no cage, no tax collector.', love: ['romance', 'gamble'], hate: ['official', 'loyal'] },
	harmony: { id: 'harmony', name: 'Harmony', glyph: '和', blurb: 'The bamboo bends; the oak breaks.', love: ['rest', 'faith', 'mercy'], hate: ['fight'] }
};

export const IDEAL_IDS = Object.keys(IDEALS) as IdealId[];
