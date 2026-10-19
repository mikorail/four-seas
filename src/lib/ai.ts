// Optional: Claude writes extra cards in the voice of the current era and city.
// Bring-your-own-key, stored only in this browser. Off unless the player turns it on.
import { z } from 'zod';
import { CULTURES } from '#lib/data/cultures';
import { CITY, cityName } from '#lib/data/world';
import { PERK } from '#lib/data/traits';
import { Rng } from '#lib/rng';
import type { Card, Choice, Run } from '#lib/game/types';

const KEY = 'four-seas:claude';
export const AI_MODEL = 'claude-opus-5-5';

export interface AiSettings {
	enabled: boolean;
	apiKey: string;
}

export function loadAi(): AiSettings {
	try {
		const s = localStorage.getItem(KEY);
		return s ? JSON.parse(s) : { enabled: false, apiKey: '' };
	} catch {
		return { enabled: false, apiKey: '' };
	}
}

export function saveAi(s: AiSettings) {
	try {
		localStorage.setItem(KEY, JSON.stringify(s));
	} catch {}
}

const Delta = z.object({
	silver: z.number().int(),
	vigor: z.number().int(),
	renown: z.number().int(),
	fortune: z.number().int()
});
const Side = z.object({ label: z.string().min(1).max(48), effects: Delta, outcome: z.string().max(200) });
const CardSchema = z.object({
	speaker_name: z.string().min(1).max(40),
	speaker_title: z.string().min(1).max(40),
	speaker_gender: z.enum(['f', 'm']),
	speaker_role: z.enum(['merchant', 'official', 'monk', 'sailor', 'captain', 'noble', 'scholar', 'healer', 'performer', 'child', 'elder', 'soldier', 'innkeeper', 'fortune-teller']),
	text: z.string().min(10).max(320),
	left: Side,
	right: Side
});

const sideSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['label', 'effects', 'outcome'],
	properties: {
		label: { type: 'string', description: 'Short imperative choice, max 6 words.' },
		outcome: { type: 'string', description: 'One sentence describing what happens.' },
		effects: {
			type: 'object',
			additionalProperties: false,
			required: ['silver', 'vigor', 'renown', 'fortune'],
			properties: {
				silver: { type: 'integer' },
				vigor: { type: 'integer' },
				renown: { type: 'integer' },
				fortune: { type: 'integer' }
			}
		}
	}
};

const jsonSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['speaker_name', 'speaker_title', 'speaker_gender', 'speaker_role', 'text', 'left', 'right'],
	properties: {
		speaker_name: { type: 'string' },
		speaker_title: { type: 'string' },
		speaker_gender: { type: 'string', enum: ['f', 'm'] },
		speaker_role: { type: 'string', enum: ['merchant', 'official', 'monk', 'sailor', 'captain', 'noble', 'scholar', 'healer', 'performer', 'child', 'elder', 'soldier', 'innkeeper', 'fortune-teller'] },
		text: { type: 'string', description: 'What the speaker says or what happens, 1-3 sentences, second person.' },
		left: sideSchema,
		right: sideSchema
	}
};

const SYSTEM = `You write event cards for "Four Seas", a Reigns-style swipe game about a courier crossing Asia and the wider world between 1500 and 1900.
Each card: one named local character presents a situation; the player swipes left or right.
Ground every card in the exact year, city and culture given: real customs, foods, trades, religions, politics and tensions of that place and time. Be specific and vivid, lightly witty, never anachronistic. Treat all cultures with respect; no caricature.
Effects are stat deltas between -18 and +18 on four meters (silver, vigor, renown, fortune), each 0-100; reaching 0 or 100 on any meter ends the run. Make both choices have a real tradeoff; usually 1-2 stats change per side and the other values are 0.`;

function clampFx(fx: z.infer<typeof Delta>) {
	const out: Choice['fx'] = {};
	for (const k of ['silver', 'vigor', 'renown', 'fortune'] as const) {
		const v = Math.max(-18, Math.min(18, Math.round(fx[k])));
		if (v) out[k] = v;
	}
	return out;
}

/** Ask Claude for one card set in the player's current city. Returns null on any failure. */
export async function generateCard(run: Run, settings: AiSettings, signal?: AbortSignal): Promise<Card | null> {
	if (!settings.enabled || !settings.apiKey) return null;
	const city = CITY[run.location];
	const cul = CULTURES[city.culture];
	const brief = [
		`Year: ${run.year}. City: ${cityName(city, run.year)} (${cul.label}; ruled by ${cul.ruler(run.year)}). ${city.blurb}`,
		`Local festival: ${cul.festival}; local drink: ${cul.drink}; local food: ${cul.food}.`,
		`Player: ${run.hero.name}, ${PERK[run.hero.profession].name} from ${CULTURES[run.hero.culture].homeland}. Traits: ${run.hero.traits.map((t) => PERK[t].name).join(', ')}.`,
		`Current meters: silver ${run.stats.silver}, vigor ${run.stats.vigor}, renown ${run.stats.renown}, fortune ${run.stats.fortune}. Day ${run.day} of ${isFinite(run.deadline) ? run.deadline : 'no deadline'}.`,
		`Recent events to avoid repeating: ${run.log.slice(0, 5).map((l) => l.text).join(' | ')}`,
		'Write one new card.'
	].join('\n');
	try {
		// loaded lazily so players who never enable Claude cards don't download the SDK
		const { default: Anthropic } = await import('@anthropic-ai/sdk');
		const client = new Anthropic({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
		const res = await client.beta.messages.create(
			{
				model: AI_MODEL,
				max_tokens: 2000,
				system: SYSTEM,
				messages: [{ role: 'user', content: brief }],
				output_config: { effort: 'low', format: { type: 'json_schema', schema: jsonSchema } },
				betas: ['server-side-fallback-2026-07-01'],
				fallbacks: 'default'
			},
			{ signal }
		);
		if (res.stop_reason === 'refusal' || res.stop_reason === 'max_tokens') return null;
		const text = res.content.find((b) => b.type === 'text');
		if (!text || text.type !== 'text') return null;
		const parsed = CardSchema.safeParse(JSON.parse(text.text));
		if (!parsed.success) return null;
		const d = parsed.data;
		const seed = new Rng(d.speaker_name + run.day).int(1, 1e9);
		return {
			id: 'claude',
			badge: 'Written by Claude',
			npc: { name: d.speaker_name, title: d.speaker_title, gender: d.speaker_gender, role: d.speaker_role, culture: city.culture, seed },
			text: d.text,
			left: { label: d.left.label, fx: clampFx(d.left.effects), text: d.left.outcome },
			right: { label: d.right.label, fx: clampFx(d.right.effects), text: d.right.outcome }
		};
	} catch (e) {
		const Anthropic = await import('@anthropic-ai/sdk').then((m) => m.default).catch(() => null);
		if (!Anthropic) console.warn('Claude cards: could not load the SDK (offline?)');
		else if (e instanceof Anthropic.AuthenticationError) console.warn('Claude cards: API key rejected.');
		else if (e instanceof Anthropic.RateLimitError) console.warn('Claude cards: rate limited, skipping.');
		else if (e instanceof Anthropic.APIError) console.warn('Claude cards: API error', e.status);
		else if (!(e instanceof Error && e.name === 'AbortError')) console.warn('Claude cards: failed', e);
		return null;
	}
}
