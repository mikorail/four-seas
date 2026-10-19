// Seeded PRNG (mulberry32) — whole run reproducible from one seed string.

export function hashString(s: string): number {
	let h = 1779033703 ^ s.length;
	for (let i = 0; i < s.length; i++) {
		h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	h = Math.imul(h ^ (h >>> 16), 2246822507);
	h = Math.imul(h ^ (h >>> 13), 3266489909);
	return (h ^= h >>> 16) >>> 0;
}

export class Rng {
	state: number;
	constructor(seed: number | string) {
		this.state = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
	}
	next(): number {
		let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}
	int(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}
	chance(p: number): boolean {
		return this.next() < p;
	}
	pick<T>(arr: readonly T[]): T {
		return arr[Math.floor(this.next() * arr.length)];
	}
	weighted<T>(items: readonly T[], weight: (t: T) => number): T {
		const total = items.reduce((s, i) => s + Math.max(0, weight(i)), 0);
		let r = this.next() * total;
		for (const i of items) {
			r -= Math.max(0, weight(i));
			if (r <= 0) return i;
		}
		return items[items.length - 1];
	}
	shuffle<T>(arr: readonly T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(this.next() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
	sample<T>(arr: readonly T[], n: number): T[] {
		return this.shuffle(arr).slice(0, n);
	}
}

export function randomSeed(): string {
	const syll = ['ka', 'ri', 'mo', 'shan', 'lin', 'ta', 'po', 'hai', 'sen', 'yu', 'ra', 'jin', 'bao', 'ko', 'mei'];
	let s = '';
	for (let i = 0; i < 3; i++) s += syll[Math.floor(Math.random() * syll.length)];
	return s + '-' + Math.floor(Math.random() * 9000 + 1000);
}
