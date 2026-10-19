import type { CultureId } from './cultures';

export interface Theme {
	name: string; // art-style name shown on the card frame
	accent: string;
	gold: string;
	jade: string;
	tile: (c: string) => string; // 24×24 SVG motif in the given color
}

const svg = (body: string) => `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>${body}</svg>`;

// Traditional motifs, simplified to one-colour tiles.
const fret = (c: string) => svg(`<path d='M2 2h20v20H6V6h12v12h-8v-8h4v4' fill='none' stroke='${c}' stroke-width='1.6'/>`); // 回 key-fret
const seigaiha = (c: string) => svg(`<g fill='none' stroke='${c}' stroke-width='1.2'><path d='M0 24a12 12 0 0 1 24 0M4 24a8 8 0 0 1 16 0M8 24a4 4 0 0 1 8 0'/><path d='M-12 12a12 12 0 0 1 24 0M12 12a12 12 0 0 1 24 0M-8 12a8 8 0 0 1 16 0M16 12a8 8 0 0 1 16 0'/></g>`); // 青海波 waves
const dancheong = (c: string) => svg(`<path d='M12 2l10 10-10 10L2 12z M12 7l5 5-5 5-5-5z' fill='none' stroke='${c}' stroke-width='1.4'/><circle cx='12' cy='12' r='1.6' fill='${c}'/>`);
const lotus = (c: string) => svg(`<g fill='none' stroke='${c}' stroke-width='1.3'><path d='M12 20c-4-3-5-8 0-14 5 6 4 11 0 14z'/><path d='M12 20c-6-1-9-5-8-9 4 0 7 4 8 9zM12 20c6-1 9-5 8-9-4 0-7 4-8 9z'/></g>`);
const kanok = (c: string) => svg(`<path d='M2 22L12 2l10 20M7 22l5-10 5 10' fill='none' stroke='${c}' stroke-width='1.4'/><path d='M12 6q3 4 0 7' fill='none' stroke='${c}'/>`); // flame
const kawung = (c: string) => svg(`<g fill='none' stroke='${c}' stroke-width='1.3'><ellipse cx='12' cy='5' rx='3.5' ry='5'/><ellipse cx='12' cy='19' rx='3.5' ry='5'/><ellipse cx='5' cy='12' rx='5' ry='3.5'/><ellipse cx='19' cy='12' rx='5' ry='3.5'/></g><circle cx='12' cy='12' r='1.2' fill='${c}'/>`); // batik
const jali = (c: string) => svg(`<g fill='none' stroke='${c}' stroke-width='1.2'><circle cx='12' cy='12' r='7'/><circle cx='0' cy='0' r='7'/><circle cx='24' cy='0' r='7'/><circle cx='0' cy='24' r='7'/><circle cx='24' cy='24' r='7'/></g>`); // pierced screen
const knot = (c: string) => svg(`<path d='M4 4h16v16H4zM8 8h8v8H8zM4 12h4M16 12h4M12 4v4M12 16v4' fill='none' stroke='${c}' stroke-width='1.4'/>`); // endless knot
const zigzag = (c: string) => svg(`<path d='M0 8l6-6 6 6 6-6 6 6M0 20l6-6 6 6 6-6 6 6' fill='none' stroke='${c}' stroke-width='1.5'/><circle cx='12' cy='14' r='1.5' fill='${c}'/>`); // felt
const girih = (c: string) => svg(`<path d='M12 1l3 6 6-1-2 6 4 4-6 1-1 6-4-4-4 4-1-6-6-1 4-4-2-6 6 1z' fill='none' stroke='${c}' stroke-width='1.1'/>`); // eight-point star
const iznik = (c: string) => svg(`<g fill='none' stroke='${c}' stroke-width='1.3'><path d='M12 22V10M12 10c-3-1-4-5-3-8 2 2 3 2 3 4 0-2 1-2 3-4 1 3 0 7-3 8z'/><path d='M12 16c-3 0-6-2-7-4M12 16c3 0 6-2 7-4'/></g>`); // tulip
const chevron = (c: string) => svg(`<path d='M0 6l12 8 12-8M0 14l12 8 12-8' fill='none' stroke='${c}' stroke-width='1.4'/><circle cx='12' cy='4' r='1.6' fill='${c}'/>`); // carved door
const kapa = (c: string) => svg(`<path d='M0 12l6-10 6 10 6-10 6 10M0 24l6-10 6 10 6-10 6 10' fill='none' stroke='${c}' stroke-width='1.3'/><path d='M3 18h6M15 18h6' stroke='${c}'/>`); // kapa bark-cloth
const hatch = (c: string) => svg(`<path d='M0 24L24 0M-6 6L6-6M18 30L30 18M0 12L12 0M12 24L24 12' stroke='${c}' stroke-width='0.9'/>`); // engraving

export const THEMES: Record<CultureId, Theme> = {
	han: { name: 'Ink & Cinnabar', accent: '#b5321f', gold: '#b8902e', jade: '#2f6b5a', tile: fret },
	japanese: { name: 'Sumi & Indigo', accent: '#a23b3b', gold: '#9c7a3c', jade: '#2e4f7f', tile: seigaiha },
	korean: { name: 'Obangsaek', accent: '#c0392b', gold: '#d39a1f', jade: '#2b6cb0', tile: dancheong },
	viet: { name: 'Lotus & Lacquer', accent: '#a8322d', gold: '#c9a227', jade: '#3c7a4e', tile: lotus },
	siamese: { name: 'Gilded Lacquer', accent: '#a8282a', gold: '#c99a10', jade: '#1f6f78', tile: kanok },
	malay: { name: 'Batik Sogan', accent: '#8b4a2b', gold: '#b88a2e', jade: '#2f5d50', tile: kawung },
	indian: { name: 'Mughal Saffron', accent: '#c75b12', gold: '#b88a1c', jade: '#2e7d5b', tile: jali },
	tibetan: { name: 'Thangka', accent: '#8b1e1e', gold: '#d08a12', jade: '#2b4c7e', tile: knot },
	steppe: { name: 'Felt & Horse', accent: '#a33b2a', gold: '#b5651d', jade: '#2a7f62', tile: zigzag },
	persian: { name: 'Turquoise Tile', accent: '#1b6ca8', gold: '#b8902e', jade: '#0e8f8f', tile: girih },
	ottoman: { name: 'İznik', accent: '#b22d2d', gold: '#b8923e', jade: '#1f5f9f', tile: iznik },
	swahili: { name: 'Coral & Indigo', accent: '#c4572e', gold: '#c99236', jade: '#1f4e79', tile: chevron },
	pacific: { name: 'Kapa Cloth', accent: '#8c3b1e', gold: '#c4902a', jade: '#1f5f5b', tile: kapa },
	european: { name: 'Copperplate', accent: '#7a2e2e', gold: '#9c7a3c', jade: '#2f4f4f', tile: hatch }
};

const uri = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

/** Inline CSS custom properties for a culture's art style. */
export function themeStyle(c: CultureId): string {
	const t = THEMES[c];
	return [
		`--z-accent:${t.accent}`,
		`--z-gold:${t.gold}`,
		`--z-jade:${t.jade}`,
		`--z-pattern:${uri(t.tile(t.accent))}`,
		`--z-pattern-gold:${uri(t.tile(t.gold))}`
	].join(';');
}
