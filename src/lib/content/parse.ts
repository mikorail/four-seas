// Parse Markdown card / campaign files into templates. Format is documented in src/content/README.md.
import type { CultureId, Gender } from '#lib/data/cultures';
import { CULTURES } from '#lib/data/cultures';
import { STATS, type Fx, type Tag } from '#lib/data/traits';
import type { Mode } from '#lib/data/world';
import type { Card, Choice, Outcome, Role } from '#lib/game/types';
import { npc, place, type Ctx, type Template } from '#lib/game/cards/helpers';

export interface ParsedChoice {
	side: 'left' | 'right' | 'up';
	label: string;
	why?: string;
	props: Record<string, string>;
}

export interface ParsedCard {
	meta: Record<string, string>;
	text: string;
	choices: ParsedChoice[];
}

export interface Campaign {
	id: string;
	title: string;
	blurb: string;
	start: string;
	destination: string;
	years: [number, number];
	deadline: number;
	item: string;
	patron: string;
	culture?: CultureId;
	energy?: string; // 'unlimited' or a number of actions per city
	beats: ParsedCard[];
}

export class ContentError extends Error {}

const kv = (line: string): [string, string] | null => {
	const m = /^([\w-]+)\s*:\s*(.*)$/.exec(line.trim());
	return m ? [m[1].toLowerCase(), m[2].replace(/\s+#.*$/, '').trim()] : null;
};

/** One card: optional `key: value` header (until `---` or a blank line), text, then `## left|right|up(why): Label` sections. */
export function parseCard(src: string): ParsedCard {
	const lines = src.replace(/\r/g, '').split('\n');
	const meta: Record<string, string> = {};
	let i = 0;
	if (lines[0]?.trim() === '---') i = 1;
	for (; i < lines.length; i++) {
		const l = lines[i];
		if (l.trim() === '---') {
			i++;
			break;
		}
		if (!l.trim()) {
			if (Object.keys(meta).length) {
				i++;
				break;
			}
			continue;
		}
		const p = kv(l);
		if (!p) break;
		meta[p[0]] = p[1];
	}
	const textLines: string[] = [];
	for (; i < lines.length && !/^##\s/.test(lines[i]); i++) textLines.push(lines[i]);
	const choices: ParsedChoice[] = [];
	let cur: ParsedChoice | null = null;
	for (; i < lines.length; i++) {
		const l = lines[i];
		const h = /^##\s*(left|right|up)(?:\(([^)]*)\))?\s*:\s*(.+)$/i.exec(l.trim());
		if (h) {
			cur = { side: h[1].toLowerCase() as ParsedChoice['side'], why: h[2]?.trim(), label: h[3].trim(), props: {} };
			choices.push(cur);
			continue;
		}
		if (!cur || !l.trim()) continue;
		const p = kv(l);
		if (p) cur.props[p[0]] = p[1];
	}
	const text = textLines.join(' ').replace(/\s+/g, ' ').trim();
	if (!text) throw new ContentError('Card has no text.');
	if (!choices.some((c) => c.side === 'left') || !choices.some((c) => c.side === 'right')) throw new ContentError('Card needs a `## left:` and a `## right:` choice.');
	return { meta, text, choices };
}

export function parseFx(s: string | undefined): Fx {
	const fx: Fx = {};
	if (!s) return fx;
	for (const part of s.split(',')) {
		const m = /^\s*(silver|vigor|renown|fortune)\s*([+-]?\d+)\s*$/i.exec(part);
		if (!m) throw new ContentError(`Bad effect "${part.trim()}" — use e.g. "silver -5, renown +10".`);
		fx[m[1].toLowerCase() as keyof Fx] = Number(m[2]);
	}
	return fx;
}

const list = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);

function outcome(s: string): Outcome {
	const [fx, ...rest] = s.split(';');
	return { fx: parseFx(fx), text: rest.join(';').trim() || undefined };
}

/** Fill {city}, {hero}, {npc}, {drink}, {food}, {festival}, {holy}, {ruler}, {year}. */
export function fill(t: string, c: Ctx, npcName: string): string {
	return t
		.replace(/\{city\}/g, place(c))
		.replace(/\{hero\}/g, c.run.hero.name)
		.replace(/\{npc\}/g, npcName)
		.replace(/\{drink\}/g, c.local.drink)
		.replace(/\{food\}/g, c.local.food)
		.replace(/\{festival\}/g, c.local.festival)
		.replace(/\{holy\}/g, c.local.holyPlace)
		.replace(/\{ruler\}/g, c.local.ruler(c.year))
		.replace(/\{year\}/g, String(c.year));
}

export function buildChoice(pc: ParsedChoice, c: Ctx, npcName: string, flagPrefix = ''): Choice {
	const p = pc.props;
	const ch: Choice = { label: fill(pc.label, c, npcName), fx: parseFx(p.fx) };
	if (p.tags) ch.tags = list(p.tags) as Tag[];
	if (p.days) ch.days = Number(p.days);
	if (p.text) ch.text = fill(p.text, c, npcName);
	if (p.heat) ch.heat = Number(p.heat);
	if (p.karma) ch.karma = Number(p.karma);
	if (p.standing) ch.standing = Number(p.standing);
	if (p.item) ch.itemAdd = list(p.item);
	if (p.lose_item) ch.itemRemove = list(p.lose_item);
	if (p.outfit) ch.outfit = p.outfit;
	if (p.remember) {
		const [kind, deed] = p.remember.split('|').map((x) => x.trim());
		ch.remember = { kind: kind === 'grudge' ? 'grudge' : 'favor', deed: deed || pc.label.toLowerCase() };
	}
	const flags: Record<string, boolean | string> = {};
	for (const f of list(p.set)) flags[flagPrefix + f] = true;
	for (const f of list(p.flag)) flags[f] = true; // global flags (e.g. balloon) usable outside the campaign
	if (p.ending) {
		const [won, title, ...text] = p.ending.split('|').map((x) => x.trim());
		flags.end = 'campaign';
		flags.endWon = won === 'won';
		flags.endTitle = title || 'The End';
		flags.endText = fill(text.join(' | '), c, npcName);
	}
	if (Object.keys(flags).length) ch.setFlag = flags;
	if (p.clear) ch.clearFlag = list(p.clear).map((f) => flagPrefix + f);
	if (p.gamble) {
		const parts = p.gamble.split('|').map((x) => x.trim());
		const prob = Number(parts[0]);
		const win = parts.find((x) => /^win\s*:/i.test(x))?.replace(/^win\s*:/i, '') ?? '';
		const lose = parts.find((x) => /^lose\s*:/i.test(x))?.replace(/^lose\s*:/i, '') ?? '';
		ch.gamble = { p: Math.max(0.05, Math.min(0.95, prob)), win: outcome(win), lose: outcome(lose) };
		if (ch.gamble.win.text) ch.gamble.win.text = fill(ch.gamble.win.text, c, npcName);
		if (ch.gamble.lose.text) ch.gamble.lose.text = fill(ch.gamble.lose.text, c, npcName);
	}
	if (pc.side === 'up') ch.why = pc.why || 'Hidden option';
	return ch;
}

const ROLES: Role[] = ['merchant', 'official', 'monk', 'bandit', 'sailor', 'captain', 'noble', 'scholar', 'healer', 'performer', 'child', 'elder', 'soldier', 'ghost', 'tiger', 'fortune-teller', 'lover', 'innkeeper', 'hero', 'spirit'];

export function buildCard(pcard: ParsedCard, c: Ctx, id: string, flagPrefix = ''): Card {
	const m = pcard.meta;
	const role = (ROLES.includes(m.speaker as Role) ? m.speaker : 'elder') as Role;
	const culture = m.culture && m.culture in CULTURES ? (m.culture as CultureId) : undefined;
	const n = npc(c, role, { culture, gender: m.gender === 'f' || m.gender === 'm' ? (m.gender as Gender) : undefined, name: m.name, title: m.title });
	const get = (side: ParsedChoice['side']) => pcard.choices.find((x) => x.side === side);
	const eligible = (u: ParsedChoice) =>
		(!u.props.requires_trait || c.run.hero.traits.includes(u.props.requires_trait) || c.run.hero.profession === u.props.requires_trait) &&
		(!u.props.requires_profession || c.run.hero.profession === u.props.requires_profession) &&
		(!u.props.requires_item || c.run.bag.includes(u.props.requires_item)) &&
		(!u.props.requires_flag || !!c.run.flags[flagPrefix + u.props.requires_flag]) &&
		(!u.props.requires_faith || c.run.hero.faith === u.props.requires_faith) &&
		(!u.props.requires_outfit || list(u.props.requires_outfit).includes(c.run.outfit?.id ?? ''));
	const upC = pcard.choices.find((x) => x.side === 'up' && eligible(x));
	const upOk = !!upC;
	return {
		id,
		npc: n,
		badge: m.badge,
		text: fill(pcard.text, c, n.name),
		left: buildChoice(get('left')!, c, n.name, flagPrefix),
		right: buildChoice(get('right')!, c, n.name, flagPrefix),
		up: upOk ? buildChoice(upC!, c, n.name, flagPrefix) : undefined
	};
}

/** Conditions shared by single cards and campaign beats. */
export function matches(meta: Record<string, string>, c: Ctx, flagPrefix = ''): boolean {
	if (meta.cultures && !list(meta.cultures).includes(c.city.culture)) return false;
	if (meta.profession && c.run.hero.profession !== meta.profession) return false;
	if (meta.requires_profession && c.run.hero.profession !== meta.requires_profession) return false;
	if (meta.years) {
		const [a, b] = meta.years.split('-').map(Number);
		if (c.year < a || c.year > (b || a)) return false;
	}
	if (meta.at) {
		const ok = list(meta.at).some((at) => {
			if (at === 'any') return true;
			if (at === 'sea' || at === 'land' || at === 'river') return c.where === 'travel' && c.mode === at;
			if (at === 'travel') return c.where === 'travel';
			if (at === 'city') return c.where === 'city';
			return c.where === 'city' && c.city.id === at;
		});
		if (!ok) return false;
	}
	for (const f of list(meta.requires)) if (!c.run.flags[flagPrefix + f] && !c.run.flags[f]) return false;
	if (meta.requires_item && !list(meta.requires_item).every((i) => c.run.bag.includes(i))) return false;
	if (meta.requires_faith && c.run.hero.faith !== meta.requires_faith) return false;
	if (meta.requires_outfit && !list(meta.requires_outfit).includes(c.run.outfit?.id ?? '')) return false;
	for (const f of list(meta.unless)) if (c.run.flags[flagPrefix + f]) return false;
	if (meta.requires_trait && !c.run.hero.traits.includes(meta.requires_trait) && c.run.hero.profession !== meta.requires_trait) return false;
	return true;
}

export function cardTemplate(file: string, src: string): Template {
	if (/^# beat:\s*/m.test(src)) return cardTemplates(file, src)[0];
	const pc = parseCard(src);
	const m = pc.meta;
	const id = 'md-' + (m.id ?? file.replace(/\.md$/, ''));
	for (const ch of pc.choices) parseFx(ch.props.fx); // validate early
	return {
		id,
		where: (m.where as Template['where']) ?? 'any',
		modes: m.modes ? (list(m.modes) as Mode[]) : undefined,
		tags: m.tags ? (list(m.tags) as Tag[]) : undefined,
		weight: Number(m.weight ?? 1),
		once: m.once === 'true',
		when: (c) => matches(m, c),
		make: (c) => buildCard(pc, c, id)
	};
}

/** Parses one or more card templates from a Markdown file (supports multi-beat files via `# beat: id`). */
export function cardTemplates(file: string, src: string): Template[] {
	if (/^# beat:\s*/m.test(src)) {
		const [head, ...beatSrcs] = src.replace(/\r/g, '').split(/^# beat:\s*/m);
		const headMeta: Record<string, string> = {};
		for (const l of head.split('\n')) {
			const p = kv(l);
			if (p) headMeta[p[0]] = p[1];
		}
		const fileId = file.replace(/\.md$/, '');
		return beatSrcs.map((bs, i) => {
			const nl = bs.indexOf('\n');
			const beatId = bs.slice(0, nl).trim();
			const pc = parseCard(bs.slice(nl + 1));
			for (const [k, v] of Object.entries(headMeta)) {
				if (!pc.meta[k]) pc.meta[k] = v;
			}
			const id = 'md-' + fileId + '-' + (pc.meta.id || beatId || String(i));
			for (const ch of pc.choices) parseFx(ch.props.fx);
			const m = pc.meta;
			return {
				id,
				where: (m.where as Template['where']) ?? 'any',
				modes: m.modes ? (list(m.modes) as Mode[]) : undefined,
				tags: m.tags ? (list(m.tags) as Tag[]) : undefined,
				weight: Number(m.weight ?? 1.5),
				once: m.once !== 'false',
				when: (c) => matches(m, c),
				make: (c) => {
					const card = buildCard(pc, c, id);
					if (headMeta.title && !card.badge) card.badge = headMeta.title;
					return card;
				}
			};
		});
	}
	return [cardTemplate(file, src)];
}

/** A campaign file: a `key: value` header, then beats introduced by `# beat: id`. */
export function parseCampaign(file: string, src: string): Campaign {
	const [head, ...beatSrcs] = src.replace(/\r/g, '').split(/^# beat:\s*/m);
	const meta: Record<string, string> = {};
	for (const l of head.split('\n')) {
		const p = kv(l);
		if (p) meta[p[0]] = p[1];
	}
	const need = ['campaign', 'title', 'start', 'destination', 'years', 'deadline'];
	for (const k of need) if (!meta[k]) throw new ContentError(`${file}: campaign header needs "${k}:"`);
	const [a, b] = meta.years.split('-').map(Number);
	const beats = beatSrcs.map((bs) => {
		const nl = bs.indexOf('\n');
		const id = bs.slice(0, nl).trim();
		const card = parseCard(bs.slice(nl + 1));
		card.meta.id = id;
		return card;
	});
	if (!beats.length) throw new ContentError(`${file}: no beats.`);
	return {
		id: meta.campaign,
		title: meta.title,
		blurb: meta.blurb ?? '',
		start: meta.start,
		destination: meta.destination,
		years: [a, b || a],
		deadline: Number(meta.deadline),
		item: meta.item ?? 'a sealed letter',
		patron: meta.patron ?? 'your patron',
		culture: meta.culture as CultureId | undefined,
		energy: meta.energy,
		beats
	};
}

export function campaignTemplates(c: Campaign): Template[] {
	const prefix = `c:${c.id}:`;
	return c.beats.map((b, i) => {
		const id = `cmp-${c.id}-${b.meta.id ?? i}`;
		return {
			id,
			where: 'any' as const,
			weight: Number(b.meta.weight ?? 90),
			when: (ctx: Ctx) => ctx.run.flags.campaign === c.id && !ctx.run.flags['once:' + id] && matches(b.meta, ctx, prefix),
			once: true,
			make: (ctx: Ctx) => ({ ...buildCard(b, ctx, id, prefix), badge: b.meta.badge ?? c.title })
		};
	});
}

export function validate(file: string, src: string): string[] {
	try {
		if (/^\s*campaign\s*:/m.test(src)) {
			const c = parseCampaign(file, src);
			for (const b of c.beats) for (const ch of b.choices) parseFx(ch.props.fx);
		} else {
			cardTemplates(file, src);
		}
		return [];
	} catch (e) {
		return [(e as Error).message];
	}
}

export { STATS };
