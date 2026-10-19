import { RAW } from './raw.gen';
import { campaignTemplates, cardTemplates, parseCampaign, type Campaign } from './parse';
import type { Template } from '#lib/game/cards/helpers';

const cards: Template[] = [];
const campaigns: Campaign[] = [];
for (const r of RAW) {
	try {
		if (r.kind === 'campaigns') campaigns.push(parseCampaign(r.file, r.src));
		else cards.push(...cardTemplates(r.file, r.src));
	} catch (e) {
		console.warn(`content: skipped ${r.kind}/${r.file}: ${(e as Error).message}`);
	}
}

export const CONTENT_TEMPLATES: Template[] = [...cards, ...campaigns.flatMap(campaignTemplates)];
export const CAMPAIGNS: Campaign[] = campaigns;
export const CAMPAIGN: Record<string, Campaign> = Object.fromEntries(campaigns.map((c) => [c.id, c]));
