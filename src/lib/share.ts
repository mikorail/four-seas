import { CITY, cityName } from '#lib/data/world';
import { score } from '#lib/game/engine';
import type { Run } from '#lib/game/types';

/** Inline a rendered SVG with its CSS variables resolved, so it can be drawn on a canvas. */
function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
	const cs = getComputedStyle(document.documentElement);
	const src = new XMLSerializer().serializeToString(svg).replace(/var\((--[\w-]+)\)/g, (_m, v) => cs.getPropertyValue(v).trim() || '#888');
	const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src.includes('xmlns=') ? src : src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
	return new Promise((res, rej) => {
		const img = new Image();
		img.onload = () => res(img);
		img.onerror = rej;
		img.src = url;
	});
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
	let line = '';
	for (const w of text.split(' ')) {
		const t = line ? line + ' ' + w : w;
		if (ctx.measureText(t).width > max && line) {
			ctx.fillText(line, x, y);
			y += lh;
			line = w;
		} else line = t;
	}
	if (line) ctx.fillText(line, x, y);
	return y + lh;
}

export function shareText(run: Run) {
	const e = run.ending!;
	return `四海 Four Seas — ${run.hero.name}, ${run.year}: "${e.title}" in ${cityName(CITY[run.location], run.year)} on day ${run.day}. ${run.visited.length} cities, ${run.legends.length} legends, ${score(run)} pts.${run.daily ? ` (Daily ${run.seed.slice(6)})` : ` Seed: ${run.seed}`}`;
}

export async function shareCard(run: Run, portrait: SVGSVGElement | null): Promise<'shared' | 'downloaded' | 'copied'> {
	const cs = getComputedStyle(document.documentElement);
	const v = (n: string) => cs.getPropertyValue(n).trim();
	const W = 1080;
	const H = 1350;
	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = v('--paper');
	ctx.fillRect(0, 0, W, H);
	ctx.strokeStyle = v('--line');
	ctx.lineWidth = 4;
	ctx.strokeRect(40, 40, W - 80, H - 80);

	// seal
	ctx.fillStyle = v('--vermilion');
	ctx.fillRect(W - 190, 80, 110, 200);
	ctx.fillStyle = '#fff';
	ctx.font = '700 80px "Shippori Mincho", serif';
	ctx.textAlign = 'center';
	ctx.fillText('四', W - 135, 170);
	ctx.fillText('海', W - 135, 255);

	if (portrait) {
		try {
			const img = await svgToImage(portrait);
			ctx.drawImage(img, 90, 90, 300, 300);
		} catch {}
	}

	ctx.textAlign = 'left';
	ctx.fillStyle = v('--ink');
	ctx.font = '600 64px "Cormorant Garamond", serif';
	ctx.fillText(run.hero.name, 90, 470);
	ctx.fillStyle = v('--muted');
	ctx.font = '36px "EB Garamond", serif';
	ctx.fillText(`${run.year} · ${cityName(CITY[run.hero.home], run.year)} → ${cityName(CITY[run.location], run.year)}`, 90, 525);

	const e = run.ending!;
	ctx.fillStyle = e.won ? v('--gold') : v('--vermilion');
	ctx.font = '700 84px "Cormorant Garamond", serif';
	ctx.fillText(e.title, 90, 660);
	ctx.fillStyle = v('--ink');
	ctx.font = 'italic 38px "EB Garamond", serif';
	let y = wrap(ctx, e.text, 90, 740, W - 180, 52);

	y += 40;
	const stats: [string, string | number][] = [
		['Days', run.day],
		['Cities', run.visited.length],
		['Legends', run.legends.length],
		['Score', score(run)]
	];
	stats.forEach(([k, val], i) => {
		const x = 90 + i * 230;
		ctx.fillStyle = v('--muted');
		ctx.font = '28px "EB Garamond", serif';
		ctx.fillText(k.toUpperCase(), x, y);
		ctx.fillStyle = v('--ink');
		ctx.font = '700 64px "Cormorant Garamond", serif';
		ctx.fillText(String(val), x, y + 64);
	});
	ctx.fillStyle = v('--muted');
	ctx.font = '30px "EB Garamond", serif';
	ctx.fillText(run.daily ? `Daily journey · ${run.seed.slice(6)}` : `Seed: ${run.seed}`, 90, H - 90);

	const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
	const file = new File([blob], `four-seas-${run.hero.name.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
	const text = shareText(run);
	try {
		if (navigator.canShare?.({ files: [file] })) {
			await navigator.share({ files: [file], text, title: 'Four Seas' });
			return 'shared';
		}
	} catch {}
	try {
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = file.name;
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 2000);
		await navigator.clipboard?.writeText(text).catch(() => {});
		return 'downloaded';
	} catch {
		await navigator.clipboard?.writeText(text);
		return 'copied';
	}
}
