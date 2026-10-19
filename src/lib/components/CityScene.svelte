<script lang="ts">
	import { Rng } from '#lib/rng';
	import type { CultureId } from '#lib/data/cultures';

	let { culture, seed, mode = null, city = null }: { culture: CultureId; seed: number; mode?: 'sea' | 'land' | 'river' | 'rustic' | null; city?: string | null } = $props();

	type Style = 'eastasia' | 'japan' | 'seasia' | 'malay' | 'islamic' | 'india' | 'tibet' | 'europe' | 'swahili';
	const STYLE: Record<CultureId, Style> = {
		han: 'eastasia', korean: 'eastasia', viet: 'eastasia', japanese: 'japan', siamese: 'seasia', malay: 'malay',
		persian: 'islamic', ottoman: 'islamic', steppe: 'islamic', indian: 'india', tibetan: 'tibet', european: 'europe', swahili: 'swahili', pacific: 'swahili'
	};

	const W = 300;
	const H = 120;
	const G = 104; // ground line

	function building(r: Rng, style: Style, x: number): { d: string; w: number } {
		const w = r.int(22, 46);
		const h = r.int(18, 46);
		const top = G - h;
		const roofCurve = (y: number, span: number, lift = 6) => `M${x - 4},${y} Q${x + span / 2},${y - lift * 2.2} ${x + span + 4},${y} L${x + span - 2},${y - 2} Q${x + span / 2},${y - lift} ${x + 2},${y - 2}Z`;
		switch (style) {
			case 'eastasia':
				if (r.chance(0.3)) {
					// pagoda
					let d = '';
					const tiers = r.int(3, 6);
					for (let i = 0; i < tiers; i++) {
						const tw = 26 - i * 3;
						const l = x + 13 - tw / 2;
						const y = G - 8 - i * 11;
						d += `M${l + 2},${y + 10} h${tw - 4} v-6 h-${tw - 4}Z M${l - 5},${y + 4} Q${l + tw / 2},${y - 3} ${l + tw + 5},${y + 4} L${l + tw},${y + 2} Q${l + tw / 2},${y} ${l},${y + 2}Z `;
					}
					return { d: d + `M${x + 12},${G - 8 - tiers * 11} h2 v-10 h-2Z`, w: 30 };
				}
				return { d: `M${x + 3},${G} V${top + 8} H${x + w - 3} V${G}Z ` + roofCurve(top + 8, w, 6), w: w + 6 };
			case 'japan':
				if (r.chance(0.25)) return { d: `M${x},${G} v-26 h4 v26Z M${x + 22},${G} v-26 h4 v26Z M${x - 4},${G - 28} Q${x + 13},${G - 33} ${x + 30},${G - 28} v-3 Q${x + 13},${G - 36} ${x - 4},${G - 31}Z M${x},${G - 21} h26 v2 h-26Z`, w: 34 };
				if (r.chance(0.25)) {
					// castle keep
					let d = `M${x - 2},${G} l4,-14 h28 l4,14Z`;
					for (let i = 0; i < 3; i++) {
						const tw = 30 - i * 7;
						const y = G - 14 - i * 12;
						d += ` M${x + 17 - tw / 2},${y} v-9 h${tw} v9Z ` + `M${x + 17 - tw / 2 - 5},${y - 8} Q${x + 17},${y - 16} ${x + 17 + tw / 2 + 5},${y - 8}Z`;
					}
					return { d, w: 40 };
				}
				return { d: `M${x + 3},${G} V${top + 10} H${x + w - 3} V${G}Z M${x - 3},${top + 11} L${x + w / 2},${top} L${x + w + 3},${top + 11}Z`, w: w + 6 };
			case 'seasia': {
				if (r.chance(0.45)) {
					const sh = r.int(40, 70);
					return { d: `M${x},${G} Q${x + 2},${G - sh * 0.4} ${x + 9},${G - sh * 0.75} L${x + 10},${G - sh} L${x + 11},${G - sh * 0.75} Q${x + 18},${G - sh * 0.4} ${x + 20},${G}Z`, w: 24 };
				}
				return { d: `M${x + 3},${G} V${top + 10} H${x + w - 3} V${G}Z M${x - 2},${top + 12} L${x + w / 2},${top - 6} L${x + w + 2},${top + 12}Z M${x + w / 2 - 1},${top - 6} l1,-8 l1,8Z`, w: w + 4 };
			}
			case 'malay':
				if (r.chance(0.3)) return { d: `M${x + 4},${G} V${G - 18} H${x + 32} V${G}Z M${x},${G - 18} L${x + 18},${G - 30} L${x + 36},${G - 18}Z M${x + 6},${G - 30} L${x + 18},${G - 40} L${x + 30},${G - 30}Z M${x + 11},${G - 40} L${x + 18},${G - 48} L${x + 25},${G - 40}Z`, w: 40 };
				return { d: `M${x + 3},${G} v-8 h2 v8Z M${x + w - 5},${G} v-8 h2 v8Z M${x},${G - 8} h${w} v-${h * 0.5} h-${w}Z M${x - 4},${G - 8 - h * 0.5} L${x + w / 2},${G - 14 - h} L${x + w + 4},${G - 8 - h * 0.5}Z`, w: w + 6 };
			case 'islamic':
				if (r.chance(0.35)) {
					const mh = r.int(50, 80);
					return { d: `M${x + 2},${G} V${G - mh} H${x + 8} V${G}Z M${x},${G - mh} h10 v-3 h-10Z M${x + 5},${G - mh - 3} l-3,-4 h6Z M${x + 5},${G - mh - 7} v-6`, w: 14 };
				}
				return { d: `M${x},${G} V${top + 14} H${x + w} V${G}Z M${x + 2},${top + 14} Q${x + 2},${top - 8} ${x + w / 2},${top - 10} Q${x + w - 2},${top - 8} ${x + w - 2},${top + 14}Z M${x + w / 2 - 0.6},${top - 10} v-6 h1.2 v6Z`, w: w + 4 };
			case 'india':
				if (r.chance(0.35)) {
					const sh = r.int(44, 66);
					return { d: `M${x},${G} L${x + 4},${G - sh * 0.7} Q${x + 13},${G - sh * 1.05} ${x + 22},${G - sh * 0.7} L${x + 26},${G}Z M${x + 12},${G - sh * 0.95} l1,-6 l1,6Z`, w: 30 };
				}
				return { d: `M${x},${G} V${top + 12} H${x + w} V${G}Z M${x + 3},${top + 12} C${x - 2},${top} ${x + w / 2 - 6},${top - 6} ${x + w / 2},${top - 14} C${x + w / 2 + 6},${top - 6} ${x + w + 2},${top} ${x + w - 3},${top + 12}Z M${x - 2},${top + 12} h6 v-8 h-6Z M${x + w - 4},${top + 12} h6 v-8 h-6Z`, w: w + 6 };
			case 'tibet':
				return { d: `M${x},${G} L${x + 3},${top} H${x + w - 3} L${x + w},${G}Z M${x + 4},${top} h${w - 8} v-5 h-${w - 8}Z M${x + w / 2 - 3},${top - 5} h6 v-4 h-6Z`, w: w + 2 };
			case 'europe':
				if (r.chance(0.3)) {
					const sh = r.int(50, 82);
					return { d: `M${x},${G} V${G - sh * 0.55} H${x + 16} V${G}Z M${x - 1},${G - sh * 0.55} L${x + 8},${G - sh} L${x + 17},${G - sh * 0.55}Z M${x + 7.4},${G - sh} v-6 M${x + 5},${G - sh - 4} h6`, w: 20 };
				}
				return { d: `M${x},${G} V${top + 10} H${x + w} V${G}Z M${x - 2},${top + 10} L${x + w / 2},${top - 8} L${x + w + 2},${top + 10}Z M${x + w - 8},${top + 2} v-8 h4 v12Z`, w: w + 4 };
			case 'swahili':
				if (r.chance(0.4)) {
					const ph = r.int(40, 64);
					return { d: `M${x + 10},${G} q-2,-${ph / 2} 2,-${ph} q2,${ph / 2} 0,${ph}Z M${x + 11},${G - ph} q-14,-2 -16,8 q8,-8 16,-6 q-6,-10 -14,-8 q10,0 14,6 q2,-10 14,-10 q-10,2 -12,10 q10,-4 16,4 q-8,-6 -16,-2Z`, w: 28 };
				}
				return { d: `M${x},${G} V${top + 8} H${x + w} V${G}Z M${x - 1},${top + 8} h${w + 2} v-3 h-${w + 2}Z`, w: w + 4 };
		}
	}

	function iconicCity(id: string): { back: string; front: string; waves?: boolean } | null {
		switch (id) {
			case 'kyoto':
				return {
					back: `M0,${G - 8} Q60,${G - 34} 120,${G - 20} T240,${G - 32} T300,${G - 14} V${H} H0Z`,
					front: `M16,${G} v-6 h16 v6Z M10,${G - 6} h28 l-2,-4 h-24Z M12,${G - 10} v-5 h24 v5Z M8,${G - 15} h32 l-2,-4 h-28Z M14,${G - 19} v-5 h20 v5Z M10,${G - 24} h28 l-2,-4 h-24Z M16,${G - 28} v-5 h16 v5Z M12,${G - 33} h24 l-2,-4 h-20Z M18,${G - 37} v-5 h12 v5Z M14,${G - 42} h20 l-2,-4 h-16Z M23,${G - 46} v-24 h2 v24Z M21,${G - 62} h6 M21,${G - 58} h6 M21,${G - 54} h6 M21,${G - 50} h6 ` +
						`M140,${G} v-36 h4 v36Z M166,${G} v-36 h4 v36Z M132,${G - 36} q23,-7 46,0 v-3 q-23,-7 -46,0Z M136,${G - 29} h38 v2.5 h-38Z ` +
						`M210,${G} v-16 h48 v16Z M204,${G - 16} Q234,${G - 30} 264,${G - 16} L262,${G - 18} Q234,${G - 28} 206,${G - 18}Z M216,${G - 18} v-10 h36 v10Z M212,${G - 28} Q234,${G - 38} 256,${G - 28}Z M233,${G - 39} l1,-5 l1,5Z M0,${G} H${W} V${H} H0Z`
				};
			case 'beijing':
				return {
					back: `M0,${G - 12} Q90,${G - 42} 180,${G - 26} T300,${G - 34} V${H} H0Z`,
					front: `M50,${G} V${G - 26} H250 V${G}Z M138,${G} v-14 q12,-8 24,0 v14Z M105,${G} v-10 q8,-5 16,0 v10Z M179,${G} v-10 q8,-5 16,0 v10Z ` +
						`M78,${G - 26} V${G - 50} H222 V${G - 26}Z M68,${G - 37} Q150,${G - 54} 232,${G - 37} L230,${G - 40} Q150,${G - 52} 70,${G - 40}Z M72,${G - 50} Q150,${G - 68} 228,${G - 50} L226,${G - 53} Q150,${G - 66} 74,${G - 53}Z M149,${G - 68} v-4 h2 v4Z ` +
						`M54,${G - 26} v-12 h14 v12Z M50,${G - 38} Q61,${G - 48} 72,${G - 38}Z M232,${G - 26} v-12 h14 v12Z M228,${G - 38} Q239,${G - 48} 250,${G - 38}Z M0,${G} H${W} V${H} H0Z`
				};
			case 'edo':
				return {
					back: `M145,${G - 9} L204,${G - 68} H214 L273,${G - 9} V${H} H145Z M196,${G - 56} l8,-12 h10 l8,12 q-13,6 -26,0Z M0,${G - 12} Q70,${G - 28} 145,${G - 10} V${H} H0Z`,
					front: `M35,${G} L52,${G - 26} H145 L162,${G}Z M58,${G - 26} V${G - 42} H139 V${G - 26}Z M50,${G - 41} Q98,${G - 56} 147,${G - 41}Z ` +
						`M68,${G - 42} V${G - 56} H129 V${G - 42}Z M62,${G - 55} Q98,${G - 68} 135,${G - 55}Z ` +
						`M78,${G - 56} V${G - 68} H119 V${G - 56}Z M74,${G - 67} Q98,${G - 80} 123,${G - 67}Z M75,${G - 79} q2,7 -2,11 M122,${G - 79} q-2,7 2,11 M0,${G} H${W} V${H} H0Z`
				};
			case 'samarkand':
				return {
					back: `M0,${G - 10} Q80,${G - 32} 160,${G - 18} T300,${G - 29} V${H} H0Z`,
					front: `M90,${G} V${G - 58} H172 V${G}Z M106,${G} V${G - 42} Q131,${G - 56} 156,${G - 42} V${G}Z M125,${G - 42} q6,-6 12,0 ` +
						`M184,${G} V${G - 28} H224 V${G}Z M184,${G - 28} C176,${G - 48} 204,${G - 66} 204,${G - 72} C204,${G - 66} 232,${G - 48} 224,${G - 28}Z M203,${G - 72} v-8 h2 v8 ` +
						`M74,${G} V${G - 76} H82 V${G}Z M71,${G - 56} h14 v3 h-14Z M71,${G - 76} h14 v-3 h-14Z M78,${G - 79} v-7 M238,${G} V${G - 76} H246 V${G}Z M235,${G - 56} h14 v3 h-14Z M235,${G - 76} h14 v-3 h-14Z M242,${G - 79} v-7 M0,${G} H${W} V${H} H0Z`
				};
			case 'constantinople':
				return {
					back: `M0,${G - 12} Q110,${G - 32} 210,${G - 20} T300,${G - 26} V${H} H0Z`,
					front: `M100,${G} V${G - 30} H188 V${G}Z M108,${G - 30} Q144,${G - 64} 180,${G - 30}Z M143,${G - 64} v-6 h2 v6 M96,${G - 22} Q112,${G - 36} 128,${G - 22}Z M160,${G - 22} Q176,${G - 36} 192,${G - 22}Z ` +
						`M82,${G} V${G - 80} H87 V${G}Z M80,${G - 54} h11 v2 h-11Z M84.5,${G - 80} L84.5,${G - 90} M196,${G} V${G - 80} H201 V${G}Z M194,${G - 54} h11 v2 h-11Z M198.5,${G - 80} L198.5,${G - 90} ` +
						`M62,${G} V${G - 72} H67 V${G}Z M64.5,${G - 72} L64.5,${G - 82} M216,${G} V${G - 72} H221 V${G}Z M218.5,${G - 72} L218.5,${G - 82} M0,${G} H${W} V${H} H0Z`
				};
			case 'venice':
				return {
					back: `M0,${G - 2} Q120,${G - 8} 220,${G - 4} T300,${G - 6} V${H} H0Z M226,${G - 6} v-12 h32 v12Z M228,${G - 18} Q242,${G - 38} 256,${G - 18}Z M242,${G - 38} v-6`,
					front: `M52,${G} V${G - 68} H70 V${G}Z M50,${G - 68} h22 v-9 h-22Z M50,${G - 77} L61,${G - 92} L72,${G - 77}Z M61,${G - 92} v-5 ` +
						`M82,${G} V${G - 26} H184 V${G}Z M82,${G - 12} h102 v2 h-102Z M90,${G} v-8 M102,${G} v-8 M114,${G} v-8 M126,${G} v-8 M138,${G} v-8 M150,${G} v-8 M162,${G} v-8 M174,${G} v-8 ` +
						`M196,${G + 4} q18,-1 36,-5 l4,-6 l-2,8 q-18,6 -38,3Z M192,${G - 10} v18 M244,${G - 12} v20 M254,${G - 10} v18 M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'agra':
				return {
					back: `M0,${G - 6} Q140,${G - 16} 280,${G - 8} V${H} H0Z`,
					front: `M68,${G} V${G - 12} H232 V${G}Z M102,${G - 12} V${G - 50} H198 V${G - 12}Z M126,${G - 12} V${G - 40} Q150,${G - 54} 174,${G - 40} V${G - 12}Z ` +
						`M108,${G - 24} h12 v-12 h-12Z M180,${G - 24} h12 v-12 h-12Z ` +
						`M126,${G - 50} C116,${G - 72} 150,${G - 88} 150,${G - 94} C150,${G - 88} 184,${G - 72} 174,${G - 50}Z M150,${G - 94} v-6 M148,${G - 100} h4 ` +
						`M74,${G - 12} V${G - 74} H80 V${G - 12}Z M72,${G - 38} h10 M72,${G - 56} h10 M77,${G - 74} l-1,-6 l2,0Z ` +
						`M220,${G - 12} V${G - 74} H226 V${G - 12}Z M218,${G - 38} h10 M218,${G - 56} h10 M223,${G - 74} l-1,-6 l2,0Z M0,${G} H${W} V${H} H0Z`
				};
			case 'malacca':
				return {
					back: `M0,${G - 8} Q100,${G - 30} 200,${G - 16} T300,${G - 14} V${H} H0Z M45,${G - 12} q-2,-16 2,-32 q-10,-4 -12,4 q8,2 10,6 q-10,-6 -14,-2 q8,4 12,4`,
					front: `M85,${G} v-14 h65 v14Z M80,${G - 14} L117.5,${G - 30} L155,${G - 14}Z M90,${G - 30} L117.5,${G - 44} L145,${G - 30}Z M98,${G - 44} L117.5,${G - 56} L137,${G - 44}Z M117.5,${G - 56} v-6 ` +
						`M184,${G} V${G - 32} H222 V${G}Z M196,${G} v-16 h14 v16Z M180,${G - 32} h46 v-8 h-46Z M198,${G - 40} v-16 h10 v16Z M203,${G - 56} v-6 ` +
						`M245,${G} v-44 h2 v44Z M246,${G - 36} q16,4 14,26 h-14Z M265,${G} v-36 h2 v36Z M266,${G - 30} q12,3 10,20 h-10Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'lhasa':
				return {
					back: `M0,${G} L30,${G - 62} L55,${G - 36} L105,${G - 80} L150,${G - 46} L210,${G - 86} L255,${G - 50} L285,${G - 72} L300,${G - 56} V${H} H0Z`,
					front: `M72,${G} L90,${G - 58} H214 L232,${G}Z M120,${G - 58} V${G - 80} H184 V${G - 58}Z M112,${G - 80} h80 v-4 h-80Z M132,${G - 84} Q152,${G - 94} 172,${G - 84}Z M152,${G - 94} v-6 M94,${G - 58} v-16 M210,${G - 58} v-16 M0,${G} H${W} V${H} H0Z`
				};
			case 'batavia':
				return {
					back: `M0,${G - 2} Q150,${G - 8} 300,${G - 4} V${H} H0Z`,
					front: `M38,${G} V${G - 28} h4 v-5 h5 v-5 h5 v-5 h4 v5 h5 v5 h5 v5 h4 V${G}Z M82,${G} V${G - 32} h5 v-6 h5 v-6 h5 v-6 h4 v6 h5 v6 h5 v6 h5 V${G}Z ` +
						`M140,${G} V${G - 36} H210 V${G}Z M166,${G - 36} V${G - 58} H184 V${G - 36}Z M164,${G - 58} Q175,${G - 72} 186,${G - 58}Z M175,${G - 72} v-8 ` +
						`M232,${G} v-22 h4 v22Z M258,${G} v-22 h4 v22Z M234,${G - 22} L260,${G - 36} M260,${G - 22} L234,${G - 36} M230,${G - 2} h36 M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'nagasaki':
				return {
					back: `M0,${G - 10} Q70,${G - 36} 140,${G - 22} T280,${G - 32} V${H} H0Z`,
					front: `M36,${G} V${G - 22} H114 V${G}Z M32,${G - 22} Q75,${G - 34} 118,${G - 22}Z M48,${G - 22} v-12 h24 v12Z M44,${G - 34} Q60,${G - 44} 76,${G - 34}Z ` +
						`M160,${G} h54 l-8,10 h-38Z M174,${G} v-48 M175,${G - 42} q16,6 14,32 h-14Z M192,${G} v-56 M193,${G - 50} q18,8 16,40 h-16Z M208,${G} v-42 M209,${G - 38} q12,6 10,28 h-10Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'canton':
				return {
					back: `M0,${G - 8} Q110,${G - 28} 220,${G - 18} T300,${G - 22} V${H} H0Z`,
					front: `M42,${G} V${G - 30} H152 V${G}Z M42,${G - 16} h110 M50,${G} v-16 M68,${G} v-16 M86,${G} v-16 M104,${G} v-16 M122,${G} v-16 M140,${G} v-16 M40,${G - 30} h114 v-4 h-114Z ` +
						`M200,${G} v-8 h22 v8Z M196,${G - 8} h30 l-2,-3 h-26Z M198,${G - 11} v-6 h26 v6Z M195,${G - 17} h32 l-2,-3 h-28Z M199,${G - 20} v-6 h24 v6Z M196,${G - 26} h30 l-2,-3 h-26Z M200,${G - 29} v-6 h22 v6Z M197,${G - 35} h28 l-2,-3 h-24Z M201,${G - 38} v-6 h20 v6Z M198,${G - 44} h26 l-2,-3 h-22Z M202,${G - 47} v-6 h18 v6Z M199,${G - 53} h24 l-2,-3 h-20Z M203,${G - 56} v-6 h16 v6Z M200,${G - 62} h22 l-2,-3 h-18Z M211,${G - 65} v-18 ` +
						`M248,${G + 2} q16,-2 32,0 l3,-5 q-18,-6 -36,0Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'ayutthaya':
				return {
					back: `M0,${G - 4} Q150,${G - 12} 300,${G - 6} V${H} H0Z`,
					front: `M136,${G} L140,${G - 36} C136,${G - 60} 148,${G - 82} 150,${G - 88} C152,${G - 82} 164,${G - 60} 160,${G - 36} L164,${G}Z M149,${G - 88} v-6 ` +
						`M92,${G} L96,${G - 22} Q90,${G - 38} 102,${G - 52} L102,${G - 72} L103,${G - 52} Q115,${G - 38} 110,${G - 22} L114,${G}Z ` +
						`M192,${G} L196,${G - 22} Q190,${G - 38} 202,${G - 52} L202,${G - 72} L203,${G - 52} Q215,${G - 38} 210,${G - 22} L214,${G}Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'baghdad':
				return {
					back: `M0,${G - 6} Q140,${G - 16} 280,${G - 10} V${H} H0Z`,
					front: `M50,${G} V${G - 36} H160 V${G}Z M85,${G} V${G - 26} Q105,${G - 42} 125,${G - 26} V${G}Z M60,${G - 16} h20 v-12 h-20Z M130,${G - 16} h20 v-12 h-20Z ` +
						`M210,${G} L216,${G - 58} H236 L242,${G}Z M214,${G - 12} q14,-5 27,0 M215,${G - 26} q13,-4 25,0 M216,${G - 40} q11,-3 23,0 M225,${G - 58} v-8 h2 v8 M0,${G} H${W} V${H} H0Z`
				};
			case 'nara':
				return {
					back: `M0,${G - 8} Q100,${G - 44} 220,${G - 24} T300,${G - 29} V${H} H0Z`,
					front: `M90,${G} V${G - 22} H210 V${G}Z M80,${G - 20} Q150,${G - 36} 220,${G - 20} L218,${G - 24} Q150,${G - 34} 82,${G - 24}Z ` +
						`M104,${G - 24} V${G - 42} H196 V${G - 24}Z M94,${G - 40} Q150,${G - 62} 206,${G - 40} L204,${G - 44} Q150,${G - 60} 96,${G - 44}Z M97,${G - 56} q3,6 -3,9 M203,${G - 56} q-3,6 3,9 M0,${G} H${W} V${H} H0Z`
				};
			case 'manila':
				return {
					back: `M0,${G - 6} Q120,${G - 26} 240,${G - 16} T300,${G - 19} V${H} H0Z`,
					front: `M40,${G} V${G - 20} H160 V${G}Z M36,${G - 20} h128 v-4 h-128Z M42,${G - 24} v-8 h8 v8Z M150,${G - 24} v-8 h8 v8Z ` +
						`M175,${G} V${G - 34} H225 V${G}Z M195,${G} v-16 q5,-4 10,0 v16Z M172,${G - 34} h56 v-4 h-56Z M180,${G - 38} v-22 h16 v22Z M180,${G - 60} L188,${G - 72} L196,${G - 60}Z M188,${G - 72} v-4 ` +
						`M250,${G} v-38 h2 v38Z M251,${G - 34} q14,4 12,24 h-12Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			case 'alexandria':
				return {
					back: `M0,${G - 2} H${W} V${H} H0Z`,
					front: `M80,${G} V${G - 30} H220 V${G}Z M76,${G - 30} h148 v-4 h-148Z M82,${G - 34} v-4 h6 v4Z M102,${G - 34} v-4 h6 v4Z M122,${G - 34} v-4 h6 v4Z M142,${G - 34} v-4 h6 v4Z M162,${G - 34} v-4 h6 v4Z M182,${G - 34} v-4 h6 v4Z M202,${G - 34} v-4 h6 v4Z ` +
						`M125,${G - 34} V${G - 64} H175 V${G - 34}Z M123,${G - 64} h54 v-3 h-54Z M140,${G - 67} v-12 h20 v12Z M150,${G - 79} v-6 M75,${G - 24} V${G - 44} H90 V${G - 24}Z M210,${G - 24} V${G - 44} H225 V${G - 24}Z M0,${G} H${W} V${H} H0Z`,
					waves: true
				};
			default:
				return null;
		}
	}

	const scene = $derived.by(() => {
		const r = new Rng(seed);
		if (mode === 'sea') {
			const hills = `M0,${G - 6} Q60,${G - 20} 110,${G - 8} T220,${G - 10} T300,${G - 6} V${H} H0Z`;
			const sx = r.int(40, 220);
			const sail = `M${sx},${G - 8} h44 l-6,8 h-32Z M${sx + 20},${G - 8} v-46 M${sx + 21},${G - 52} q14,10 12,40 h-12Z M${sx + 19},${G - 46} q-12,8 -10,34 h10Z`;
			return { back: hills, front: sail, waves: true };
		}
		if (mode === 'rustic') {
			let m = `M0,${G}`;
			let x = 0;
			while (x < W) {
				const pw = r.int(35, 75);
				m += ` L${x + pw / 2},${G - r.int(16, 40)} L${x + pw},${G}`;
				x += pw;
			}
			let d = '';
			let cx = r.int(10, 25);
			while (cx < W - 20) {
				const cw = r.int(22, 36);
				const ch = r.int(14, 24);
				const ctop = G - ch;
				d += ` M${cx + 2},${G} V${ctop + 6} H${cx + cw - 2} V${G}Z M${cx - 3},${ctop + 7} Q${cx + cw / 2},${ctop - 6} ${cx + cw + 3},${ctop + 7}Z`;
				if (r.chance(0.6)) d += ` M${cx + cw / 2 + 2},${ctop - 4} Q${cx + cw / 2 + 5},${ctop - 14} ${cx + cw / 2 + 2},${ctop - 20}`;
				cx += cw + r.int(16, 40);
			}
			return { back: m + ` V${H} H0Z`, front: d + ` M0,${G} H${W} V${H} H0Z`, waves: false };
		}
		if (mode === 'land' || mode === 'river') {
			let m = `M0,${G}`;
			let x = 0;
			while (x < W) {
				const pw = r.int(40, 90);
				m += ` L${x + pw / 2},${G - r.int(26, 70)} L${x + pw},${G}`;
				x += pw;
			}
			return { back: m + ` V${H} H0Z`, front: `M0,${G} Q150,${G - 6} 300,${G + 2} V${H} H0Z`, waves: mode === 'river' };
		}

		if (city) {
			const icon = iconicCity(city);
			if (icon) return icon;
		}

		const style = STYLE[culture];
		let d = '';
		let x = r.int(-10, 10);
		while (x < W) {
			const b = building(r, style, x);
			d += ' ' + b.d;
			x += b.w + r.int(2, 14);
		}
		const hills = style === 'tibet' ? `M0,${G} L50,${G - 80} L90,${G - 40} L150,${G - 95} L210,${G - 45} L260,${G - 85} L300,${G - 30} V${G}Z` : `M0,${G - 10} Q80,${G - 34} 160,${G - 16} T300,${G - 18} V${G} H0Z`;
		return { back: hills, front: d + ` M0,${G} H${W} V${H} H0Z`, waves: false };
	});
</script>

<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" class="scene" aria-hidden="true">
	<path d={scene.back} class="back" />
	<path d={scene.front} class="front" />
	{#if scene.waves}
		{#each [0, 1, 2] as i}
			<path d="M0,{G + 4 + i * 5} q12,-4 25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0 t25,0" class="wave" style:animation-delay="{i * -1.3}s" />
		{/each}
	{/if}
</svg>

<style>
	.scene {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 46%;
		pointer-events: none;
	}
	.back {
		fill: var(--ink);
		opacity: 0.05;
	}
	.front {
		fill: var(--ink);
		opacity: 0.11;
	}
	.wave {
		fill: none;
		stroke: var(--ink);
		stroke-width: 1;
		opacity: 0.15;
		animation: drift 4s linear infinite;
	}
	@keyframes drift {
		to {
			transform: translateX(-50px);
		}
	}
</style>
